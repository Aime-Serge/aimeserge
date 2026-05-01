"use server";

import { revalidatePath } from "next/cache";
import { validateAdminSession } from "@/domain/admin/queries";
import { withShield } from "@/infrastructure/security/shield";

/**
 * Secure Resume Asset Management
 */
async function uploadResumeBase(file: File) {
  try {
    const supabase = await validateAdminSession();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `CV_Aime_Serge_${Date.now()}.pdf`;

    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) {
      console.error("Supabase Storage Error (Resumes):", error);
      throw new Error(`Resume Sync Failed: ${error.message}`);
    }

    // Log the event
    const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(data.path);
    
    // Update a record in a 'profile' table or similar to track current version
    await supabase.from('security_logs').insert({
      event_type: 'RESUME_UPDATE',
      user_email: process.env.ADMIN_EMAIL,
      metadata: { file_path: data.path, url: publicUrl }
    });

    revalidatePath('/resume');
    return { success: true, url: publicUrl };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Handshake failed during asset transmission.";
    console.error("Resume Upload Error:", err);
    return { success: false, error: message };
  }
}

export const uploadResume = withShield("resume_upload", uploadResumeBase);

/**
 * Syncs a broadcast to the AI Knowledge Base (pgvector)
 * This allows the Digital Twin to answer questions about specific blog posts.
 */
export async function syncBroadcastToKnowledge(broadcast: unknown) {
  const { broadcastSchema } = await import("./schemas");
  const validated = broadcastSchema.safeParse(broadcast);
  if (!validated.success) {
    return { success: false, error: "Invalid broadcast data" };
  }

  const { mutations: aiMutations } = await import("@/domain/ai");
  const data = validated.data;
  try {
    // 1. Create a dense technical chunk
    const contentToEmbed = `Topic: ${data.title}\nCategory: ${data.category}\nContent: ${data.excerpt}\nFull Detail: ${data.content}`;

    // 2. Upsert using core AI domain
    await aiMutations.upsertKnowledge({
      id: data.id,
      content: contentToEmbed,
      metadata: {
        type: 'broadcast',
        slug: data.id,
        title: data.title
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Knowledge Sync Error:", error);
    return { success: false, error };
  }
}
