import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { type KnowledgeMatch } from "./types";
import { SYSTEM_PROMPT } from "./constants";

export async function searchKnowledge(query: string, limit: number = 3): Promise<KnowledgeMatch[]> {
  const supabase = createServerSupabaseClient();
  
  try {
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: query,
    });

    const { data: chunks, error } = await supabase.rpc("match_knowledge", {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: limit,
    });

    if (error) throw error;
    return (chunks ?? []) as KnowledgeMatch[];
  } catch (e) {
    console.error("Vector search failed:", e);
    return [];
  }
}

export async function assembleAIContext(query: string) {
  const results = await searchKnowledge(query, 5);
  
  if (results.length === 0) {
    return "No specific technical documentation found for this query. Use general knowledge about Aime Serge's background as a Senior Software Engineer.";
  }

  return results
    .map((r) => `[Source: ${r.metadata?.type || 'General Knowledge'}] ${r.content}`)
    .join("\n\n");
}

export function getSystemPrompt(context: string) {
  return `${SYSTEM_PROMPT}\n${context}`;
}
