"use server";

import { revalidatePath } from "next/cache";
import { validateAdminSession } from "@/core/domain/admin/queries";
import { withShield } from "@/infrastructure/security/shield";
import { syndicateContentAction } from "./syndication-actions";
import { Broadcast } from "./types";

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
 */
export async function syncBroadcastToKnowledge(broadcast: Broadcast) {
  const { mutations: aiMutations } = await import("@/core/domain/ai");
  try {
    let contentToEmbed = `[Social Broadcast: ${broadcast.contentType}] Topic: ${broadcast.title}\n`;
    
    if (broadcast.contentType === 'POST') {
      contentToEmbed += `Content: ${broadcast.textContent}\nHashtags: ${broadcast.hashtags.join(', ')}`;
    } else {
      contentToEmbed += `Excerpt: ${broadcast.excerpt}\nRead Time: ${broadcast.estimatedReadTime} min\nContent Blocks: ${JSON.stringify(broadcast.bodyBlocks)}`;
    }

    await aiMutations.upsertKnowledge({
      id: broadcast.id,
      content: contentToEmbed,
      metadata: {
        type: 'broadcast',
        contentType: broadcast.contentType,
        slug: broadcast.slug,
        title: broadcast.title
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Knowledge Sync Error:", error);
    return { success: false, error };
  }
}

/**
 * Distribution Bridge: Automatically creates a Social Post from a published Article.
 */
export async function publishArticleWithSocialSync(article: Broadcast) {
  const supabase = await validateAdminSession();
  
  try {
    // 1. Save/Update the Article
    const { error: articleError } = await supabase
      .from('broadcasts')
      .upsert({
        ...article,
        content_type: 'ARTICLE',
        status: 'PUBLISHED',
        updated_at: new Date().toISOString()
      });

    if (articleError) throw articleError;

    // 2. Create the Distribution Post (The "Announcement" in the feed)
    const distributionPost = {
      content_type: 'POST',
      status: 'PUBLISHED',
      title: `Distribution: ${article.title}`,
      text_content: `🚀 Just published a new article: "${article.title}"\n\n${article.excerpt}\n\nCheck it out here 👇`,
      media_type: 'EXTERNAL_LINK',
      media_payload: {
        url: `https://aimeserge.me/blog/${article.slug}`,
        ogTitle: article.title,
        ogImage: article.coverImageUrl,
        ogDescription: article.excerpt
      },
      hashtags: article.hashtags,
      category: article.category
    };

    const { error: postError } = await supabase
      .from('broadcasts')
      .insert(distributionPost);

    if (postError) throw postError;

    // 3. Sync to Knowledge
    await syncBroadcastToKnowledge(article);

    // 4. Trigger Syndication (async, non-blocking)
    // Errors in syndication don't fail the publish
    syndicateContentAction(article).catch((error) => {
      console.warn("Syndication failed after publishing:", error);
      // Log but don't throw - article is already published
    });

    return { success: true };
  } catch (error) {
    console.error("Distribution Bridge Failure:", error);
    return { success: false, error: error instanceof Error ? error.message : "Handshake failed during distribution." };
  }
}
