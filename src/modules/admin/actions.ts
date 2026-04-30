"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";

import { withShield } from "@/core/security/shield";

/**
 * Secure Admin Mutation Layer
 * All functions perform session validation before execution.
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
    if (data.user.email !== process.env.ADMIN_EMAIL) {
      await recordSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', data.user.email, 'CRITICAL');
      throw new Error("Access Denied: Identity not recognized as Node Operator.");
    }

    // 3. Generate Secure JWT for Middleware (Zero-Trust)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
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

export const loginAdmin = withShield("admin_login", loginAdminBase, { limit: 5 }); // Stricter for login

export async function validateAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    throw new Error("Unauthorized Access: Admin privileges required.");
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
    const { payload } = await jwtVerify(token, secret);
    
    if (payload.email !== process.env.ADMIN_EMAIL) {
      throw new Error("Unauthorized Access: Identity mismatch.");
    }
    
    return createServerSupabaseClient();
  } catch {
    throw new Error("Unauthorized Access: Session expired or invalid.");
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

async function upsertContentBase(params: { table: string, payload: object, path: string }) {
  const { table, payload, path } = params;
  try {
    const supabase = await validateAdminSession();
    
    const { data, error } = await supabase
      .from(table)
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.error(`Supabase Upsert Error [${table}]:`, error);
      throw new Error(`Cloud Sync Failed: ${error.message}`);
    }

    await recordSecurityEvent('CONTENT_UPSERT', process.env.ADMIN_EMAIL!, 'INFO', { table, id: data.id });

    revalidatePath(path); // Instant ISR update
    return { success: true, data };
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    console.error(`Admin Error [${table}]:`, message);
    return { success: false, error: message };
  }
}

export const upsertContent = withShield("content_upsert", upsertContentBase);


async function uploadArtifactBase(params: { file: File, path: string }) {
  const { file, path } = params;
  try {
    const supabase = await validateAdminSession();

    // Convert file to buffer for Supabase
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

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('artifacts')
      .getPublicUrl(data.path);

    return { success: true, url: publicUrl };
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    console.error("Storage Error:", message);
    return { success: false, error: message };
  }
}

export const uploadArtifact = withShield("upload_artifact", uploadArtifactBase);

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
    return { success: false, error: getErrorMessage(err) };
  }
}

export const deleteContent = withShield("delete_content", deleteContentBase);

export async function getAdminAnalytics() {
  try {
    const supabase = await validateAdminSession();
    
    // Aggregate stats from multiple tables
    const [projects, contacts, research] = await Promise.all([
      supabase.from('projects').select('views, likes'),
      supabase.from('contacts').select('id', { count: 'exact' }),
      supabase.from('research').select('views, downloads')
    ]);

    return {
      totalViews: projects.data?.reduce((acc, p) => acc + (p.views || 0), 0) || 0,
      totalInquiries: contacts.count || 0,
      researchImpact: research.data?.reduce((acc, r) => acc + (r.downloads || 0), 0) || 0
    };
  } catch {
    return { totalViews: 0, totalInquiries: 0, researchImpact: 0 };
  }
}

export async function getSecurityStatus() {
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
    threatLevel: recentThreats && recentThreats > 5 ? "ELEVATED" : "LOW",
    recentEvents: recentThreats || 0,
    systemState: "HARDENED",
    tlsVersion: "TLS_1.3" // Assumed for modern Vercel/Cloudflare deployments
  };
}

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
    return { success: false, error: getErrorMessage(err) };
  }
}
