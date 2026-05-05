"use server";

import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { KnowledgeMetadata } from "./types";
import { withShield } from "@/infrastructure/security/shield";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Upserts content into the pgvector knowledge base.
 * This is a sensitive operation used for keeping the AI twin synced with portfolio data.
 */
async function upsertKnowledgeBase(params: { id: string, content: string, metadata: KnowledgeMetadata }) {
  const { id, content, metadata } = params;
  const supabase = createServerSupabaseClient();
  
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(content);
    const embedding = result.embedding.values;

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
