import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { rateLimit } from "@/infrastructure/security/rateLimit";
import type { SearchResult, SearchResultType } from "@/types/search";

/**
 * Site search with Postgres full-text search (`search_site` RPC).
 * No AI call per query: free and fast. CDN-cached per query string for 5 minutes.
 */
type Row = { id: string; kind: SearchResultType; title: string; snippet: string; href: string; tags: string[] | null; rank: number };

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const limited = await rateLimit.check(60, 60_000, `search:${ip}`);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many searches. Please wait a moment." }, { status: 429 });
  }

  const query = (request.nextUrl.searchParams.get("q") || "").trim().slice(0, 100);
  const requested = Number(request.nextUrl.searchParams.get("limit") || 8);
  const limit = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), 20) : 8;

  if (query.length < 2) return NextResponse.json({ query, results: [] });

  const supabase = createServerSupabaseClient();
  let rows: Row[] = [];

  const { data, error } = await supabase.rpc("search_site", { q: query, max_results: limit });
  if (!error && data) {
    rows = data as Row[];
  } else {
    // Fallback (e.g. migration not applied yet): simple title match on projects and articles.
    console.error("search_site failed, using title fallback:", error?.message);
    const like = `%${query.replace(/[%_]/g, "")}%`;
    const [projects, articles] = await Promise.all([
      supabase.from("projects").select("id, title, tagline, slug, tools").eq("is_visible", true).ilike("title", like).limit(limit),
      supabase.from("articles").select("id, title, excerpt, slug, tags").eq("status", "PUBLISHED").ilike("title", like).limit(limit),
    ]);
    rows = [
      ...(projects.data || []).map((p) => ({ id: p.id, kind: "project" as const, title: p.title, snippet: p.tagline || "", href: `/projects/${p.slug}`, tags: p.tools, rank: 1 })),
      ...(articles.data || []).map((a) => ({ id: a.id, kind: "blog" as const, title: a.title, snippet: a.excerpt || "", href: `/blog/${a.slug}`, tags: a.tags, rank: 1 })),
    ].slice(0, limit);
  }

  const top = Math.max(...rows.map((r) => r.rank || 0), 0.0001);
  const results: SearchResult[] = rows.map((r) => ({
    id: r.id,
    type: r.kind,
    title: r.title,
    snippet: r.snippet,
    href: r.href,
    tags: r.tags || [],
    score: Math.round(((r.rank || 0) / top) * 100),
  }));

  return NextResponse.json(
    { query, results },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" } },
  );
}
