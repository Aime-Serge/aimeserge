import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { type KnowledgeMatch } from "./types";
import { SYSTEM_PROMPT } from "./constants";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function searchKnowledge(query: string, limit: number = 3): Promise<KnowledgeMatch[]> {
  const supabase = createServerSupabaseClient();
  
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(query);
    const embedding = result.embedding.values;

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
    return "No specific documentation found for this query in the primary database. Advise the user that this specific detail is not in your knowledge node and offer to facilitate a direct inquiry to Aime.";
  }

  return results
    .map((r) => `[Source: ${r.metadata?.type || 'Official Documentation'}] ${r.content}`)
    .join("\n\n");
}

export function getSystemPrompt(context: string) {
  return `${SYSTEM_PROMPT}\n${context}`;
}
