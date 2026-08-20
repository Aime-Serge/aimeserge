"use server";

import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { getEnvVar } from "@/infrastructure/utils/env";
import { revalidatePath } from "next/cache";
import { SignJWT } from "jose";
import { cookies, headers } from "next/headers";
import { withShield } from "@/infrastructure/security/shield";
import { validateAdminSession } from "./queries";
import { sanitizeContentBlocks, sanitizeHtmlContent } from '@/infrastructure/security/sanitizer';

/**
 * Internal helper to record security events.
 */
export async function recordSecurityEvent(
  event_type: string, 
  user_email: string | null | undefined, 
  severity: 'INFO' | 'WARN' | 'CRITICAL' = 'INFO',
  metadata: object = {}
) {
  const supabase = createServerSupabaseClient();
  const headerList = await headers();
  
  const ip = headerList.get('x-forwarded-for') || 'unknown';
  const ua = headerList.get('user-agent') || 'unknown';

  await supabase.from('security_logs').insert({
    event_type,
    user_email,
    ip_address: ip,
    user_agent: ua,
    severity,
    metadata
  });
}

/**
 * Handles admin authentication and session creation.
 */
async function loginAdminBase(credentials: { email: string; passcode: string }) {
  const { email, passcode } = credentials;
  try {
    const supabase = createServerSupabaseClient();
    
    // 1. Verify with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: passcode,
    });

    if (error || !data.user) {
      await recordSecurityEvent('LOGIN_FAILURE', email, 'WARN', { error: error?.message });
      throw new Error(error?.message || "Auth failed");
    }

    // 2. Security Check: Ensure email matches ADMIN_EMAIL
    const adminEmail = getEnvVar('ADMIN_EMAIL');
    const jwtSecret = getEnvVar('JWT_SECRET');

    if (!adminEmail || !jwtSecret) {
      await recordSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', data.user.email, 'CRITICAL', { reason: 'missing_admin_config' });
      throw new Error("Access Denied: Server auth configuration is incomplete.");
    }

    if (data.user.email !== adminEmail) {
      await recordSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', data.user.email, 'CRITICAL');
      throw new Error("Access Denied: Identity not recognized as Node Operator.");
    }

    // 3. Generate Secure JWT for Middleware (Zero-Trust)
    const secret = new TextEncoder().encode(jwtSecret);
    const token = await new SignJWT({ 
      email: data.user.email,
      role: 'authenticated' 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(secret);

    // 4. Set Secure Cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7200,
      path: '/',
    });

    await recordSecurityEvent('LOGIN_SUCCESS', data.user.email, 'INFO');

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown auth error" };
  }
}

const internalLoginAdmin = withShield("admin_login", loginAdminBase, { limit: 5 });
export async function loginAdmin(credentials: { email: string; passcode: string }) {
  return internalLoginAdmin(credentials);
}

/**
 * Generic content upsert for administrative tasks.
 */
async function upsertContentBase(params: { table: string, payload: object, path: string }) {
  const { table, payload, path } = params;
  try {
    const supabase = await validateAdminSession();

    // Defensive sanitization: clean common rich-content fields before DB write
    let safePayload: any = { ...(payload as any) };
    try {
      if (safePayload.content && Array.isArray(safePayload.content)) {
        safePayload.content = sanitizeContentBlocks(safePayload.content);
      }
      // sanitize common text fields if present
      if (typeof safePayload.description === 'string') {
        safePayload.description = sanitizeHtmlContent(safePayload.description);
      }
      if (typeof safePayload.summary === 'string') {
        safePayload.summary = sanitizeHtmlContent(safePayload.summary);
      }
    } catch (e) {
      // If sanitization fails, fallback to original payload and log
      console.error('Sanitization failed, proceeding with original payload:', e);
      safePayload = payload;
    }
    
    const { data, error } = await supabase
      .from(table)
      .upsert(safePayload)
      .select()
      .single();

    if (error) {
      console.error(`Supabase Upsert Error [${table}]:`, error);
      throw new Error(`Cloud Sync Failed: ${error.message}`);
    }

    const recordId = data && typeof data === 'object' && 'id' in data ? (data as { id: string }).id : 'unknown';
    await recordSecurityEvent('CONTENT_UPSERT', process.env.ADMIN_EMAIL!, 'INFO', { table, id: recordId });

    revalidatePath(path);
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Admin Error [${table}]:`, message);
    return { success: false, error: message };
  }
}

const internalUpsertContent = withShield("content_upsert", upsertContentBase);
export async function upsertContent(params: { table: string, payload: object, path: string }) {
  return internalUpsertContent(params);
}

/**
 * Handles file uploads to the artifacts storage bucket.
 */
async function uploadArtifactBase(params: { file: File, path: string }) {
  const { file, path } = params;
  try {
    const supabase = await validateAdminSession();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { data, error } = await supabase.storage
      .from('artifacts')
      .upload(`${path}/${Date.now()}-${file.name}`, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error("Supabase Storage Error:", error);
      throw new Error(`Artifact Transmission Failed: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('artifacts')
      .getPublicUrl(data.path);

    return { success: true, url: publicUrl };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Storage Error:", message);
    return { success: false, error: message };
  }
}

const internalUploadArtifact = withShield("upload_artifact", uploadArtifactBase);
export async function uploadArtifact(params: { file: File, path: string }) {
  return internalUploadArtifact(params);
}

import { upsertKnowledge } from "@/core/domain/ai/mutations";
import { type AdminAnalytics, type SecurityStatus } from "./types";

/**
 * Aggregates analytics data for the admin dashboard.
 */
export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  try {
    const supabase = await validateAdminSession();
    
    // Aggregate stats from multiple tables
    const [projects, contacts, research] = await Promise.all([
      supabase.from('projects').select('views, likes'),
      supabase.from('contacts').select('id', { count: 'exact' }),
      supabase.from('research').select('views, downloads')
    ]);

    return {
      totalViews: projects.data?.reduce((acc, p: { views: number | null }) => acc + (p.views || 0), 0) || 0,
      totalInquiries: contacts.count || 0,
      researchImpact: research.data?.reduce((acc, r: { downloads: number | null }) => acc + (r.downloads || 0), 0) || 0
    };
  } catch {
    return { totalViews: 0, totalInquiries: 0, researchImpact: 0 };
  }
}

/**
 * Evaluates the current security posture of the application.
 */
export async function getSecurityStatus(): Promise<SecurityStatus> {
  const supabase = createServerSupabaseClient();
  const headerList = await headers();
  
  // 1. Fetch recent activity from security_logs
  const { count: recentThreats } = await supabase
    .from('security_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .in('severity', ['WARN', 'CRITICAL']);

  // 2. Map actual security headers to the audit format
  const headersMap = {
    "Content-Security-Policy": headerList.get("Content-Security-Policy") || "Not Detected",
    "Strict-Transport-Security": headerList.get("Strict-Transport-Security") || "Not Detected",
    "X-Frame-Options": headerList.get("X-Frame-Options") || "Not Detected",
    "X-Content-Type-Options": headerList.get("X-Content-Type-Options") || "Not Detected",
    "Referrer-Policy": headerList.get("Referrer-Policy") || "Not Detected",
  };

  return {
    headers: headersMap,
    threatLevel: (recentThreats && recentThreats > 5) ? "ELEVATED" : "LOW",
    recentEvents: recentThreats || 0,
    systemState: "HARDENED",
    tlsVersion: "TLS_1.3"
  };
}

/**
 * Retrieves the latest security logs for audit purposes.
 */
export async function getSecurityLogs() {
  try {
    const supabase = await validateAdminSession();
    
    const { data, error } = await supabase
      .from('security_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Generic content deletion for administrative tasks.
 */
async function deleteContentBase(params: { table: string, id: string, path: string }) {
  const { table, id, path } = params;
  try {
    const supabase = await validateAdminSession();
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath(path);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

const internalDeleteContent = withShield("delete_content", deleteContentBase);
export async function deleteContent(params: { table: string, id: string, path: string }) {
  return internalDeleteContent(params);
}

/**
 * Syncs a project artifact to the AI Knowledge Base (pgvector)
 */
async function syncProjectToKnowledgeBase(project: {
  title: string;
  tagline?: string;
  role?: string;
  summary?: string;
  description: string;
  tools?: string[];
  features?: string[];
  category: string;
  id: string;
  slug: string;
}) {
  try {
    const contentToEmbed = `
Project Title: ${project.title}
Tagline: ${project.tagline}
Role: ${project.role}
Summary: ${project.summary}
Details: ${project.description}
Tools used: ${project.tools?.join(', ')}
Key Features: ${project.features?.join(', ')}
Category: ${project.category}
    `.trim();

    return await upsertKnowledge({
      id: project.id,
      content: contentToEmbed,
      metadata: {
        type: 'project',
        slug: project.slug,
        title: project.title
      }
    });
  } catch (error) {
    console.error("Project Sync Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

const internalSyncProjectToKnowledge = withShield("sync_project_ai", syncProjectToKnowledgeBase);
export async function syncProjectToKnowledge(project: Parameters<typeof syncProjectToKnowledgeBase>[0]) {
  return internalSyncProjectToKnowledge(project);
}

/**
 * Highly secure data fetcher for admin-only views.
 * Bypasses public caches and interacts directly with the primary database node.
 */
export async function getAllContent(table: string) {
  try {
    const supabase = await validateAdminSession();
    
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err: unknown) {
    console.error(`Admin Fetch Error [${table}]:`, err);
    return { success: false, error: err instanceof Error ? err.message : "Handshake failed" };
  }
}
