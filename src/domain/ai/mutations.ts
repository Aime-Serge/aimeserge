"use server";

import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { withShield } from "@/infrastructure/security/shield";
import { type KnowledgeMetadata } from "./types";

/**
 * Upserts content into the pgvector knowledge base.
 * This is a sensitive operation used for keeping the AI twin synced with portfolio data.
 */
async function upsertKnowledgeBase(params: { id: string, content: string, metadata: KnowledgeMetadata }) {
  const { id, content, metadata } = params;
  const supabase = createServerSupabaseClient();
  
  try {
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: content,
    });

    const { error } = await supabase
      .from('knowledge')
      .upsert({
        id,
        content,
        embedding,
        metadata
      });

    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.error("Vector upsert failed:", e);
    return { success: false, error: e instanceof Error ? e.message : "Unknown error during vector upsert" };
  }
}

export const upsertKnowledge = withShield("ai_upsert", upsertKnowledgeBase);

/**
 * Deletes content from the knowledge base.
 */
async function deleteKnowledgeBase(id: string) {
  const supabase = createServerSupabaseClient();
  
  try {
    const { error } = await supabase
      .from('knowledge')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.error("Vector delete failed:", e);
    return { success: false, error: e instanceof Error ? e.message : "Unknown error during vector delete" };
  }
}

export const deleteKnowledge = withShield("ai_delete", deleteKnowledgeBase);
