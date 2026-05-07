import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SearchResult } from "@/types/search";
import { rateLimit } from "@/infrastructure/security/rateLimit";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET(request: NextRequest) {
  const clientToken = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const rateLimitResult = await rateLimit.check(90, 60_000, `search:${clientToken}`);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many search requests. Please retry shortly." },
      { status: 429 },
    );
  }

  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  const requestedLimit = Number(request.nextUrl.searchParams.get("limit") || 8);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 20) : 8;

  if (query.length < 2) {
    return NextResponse.json({ query, results: [] });
  }

  try {
    const supabase = createServerSupabaseClient();
    
    // 1. Generate Embedding for the Search Query
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const embeddingResult = await model.embedContent(query);
    const embedding = embeddingResult.embedding.values;

    // 2. Perform Semantic Search via match_knowledge RPC
    // We reuse the same RAG engine for global search!
    const { data: matches, error } = await supabase.rpc("match_knowledge", {
      query_embedding: embedding,
      match_threshold: 0.3, // Lower threshold for broader global search
      match_count: limit,
    });

    if (error) throw error;

    // 3. Transform RAG chunks into SearchResults
    const results: SearchResult[] = (matches || []).map((match: any) => ({
      id: match.id,
      type: match.metadata?.type === 'github' ? 'project' : (match.metadata?.type === 'social' ? 'blog' : match.metadata?.type || 'blog'),
      title: match.metadata?.title || match.content.split('\n')[0].substring(0, 60),
      snippet: match.content.substring(0, 160) + "...",
      href: match.metadata?.url || (match.metadata?.type === 'research' ? '/research' : `/blog/${match.id}`),
      tags: match.metadata?.tags || [],
      score: match.similarity * 100,
    }));

    return NextResponse.json(
      { query, results },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
          "X-Search-Engine": "Semantic-Vector-Node",
        },
      },
    );
  } catch (error) {
    console.error("Semantic Search Failure:", error);
    // Fallback to empty results instead of crashing
    return NextResponse.json({ query, results: [], error: "Search node temporarily offline." });
  }
}
