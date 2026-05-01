"use server";

import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { withShield } from "@/infrastructure/security/shield";
import { type ResearchPaper } from "./types";
import { mutations as aiMutations } from "@/domain/ai";
import { validateAdminSession } from "@/domain/admin/queries";

/**
 * Syncs a research artifact to the AI Knowledge Base (pgvector)
 * Enables the Digital Twin to discuss research findings.
 */
async function syncResearchToKnowledgeBase(paper: ResearchPaper) {
  try {
    await validateAdminSession();
    
    const contentToEmbed = `Research Topic: ${paper.title}\nAbstract: ${paper.abstract}\nTags: ${paper.tags.join(', ')}`;

    await aiMutations.upsertKnowledge({
      id: paper.id,
      content: contentToEmbed,
      metadata: {
        type: 'research',
        slug: paper.slug,
        title: paper.title
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Research Sync Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Sync failed" };
  }
}

export const syncResearchToKnowledge = withShield("research_sync", syncResearchToKnowledgeBase);

async function incrementDownloadCountBase(id: string) {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.rpc('increment_downloads', { row_id: id });
  
  if (error) {
    console.error("Failed to increment downloads:", error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

export const incrementDownloadCount = withShield("increment_downloads", incrementDownloadCountBase);
