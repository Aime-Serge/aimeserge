"use server";

import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { withShield } from "@/infrastructure/security/shield";
import { type ResearchPaper } from "./types";
import { mutations as aiMutations } from "@/core/domain/ai";
import { validateAdminSession } from "@/core/domain/admin/queries";

/**
 * Syncs a research artifact to the AI Knowledge Base (pgvector)
 * Enables the Digital Twin to discuss research findings.
 */
async function syncResearchToKnowledgeBase(paper: ResearchPaper) {
  try {
    await validateAdminSession();
    
    const sectionsContent = paper.content?.map(s => `${s.title}:\n${s.content}`).join('\n\n') || "";
    const contentToEmbed = `
Research Topic: ${paper.title}
DOI: ${paper.doi || "N/A"}
Authors: ${paper.authors?.map(a => a.name).join(', ')}
Category: ${paper.category}
Abstract: ${paper.abstract}
Tags: ${paper.tags.join(', ')}

Structured Content:
${sectionsContent}
    `.trim();

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
