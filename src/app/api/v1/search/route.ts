import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/infrastructure/database/server";
import { rateLimit } from "@/infrastructure/security/rateLimit";
import type { SearchResult, SearchResultType } from "@/types/search";
import { getProjects, getPublishedArticles } from "@/core/domain/portfolio/queries";
import { getResearch } from "@/core/domain/research/queries";

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

  let rows: Row[] = [];

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.rpc("search_site", { q: query, max_results: limit });
    if (error) throw error;
    rows = (data as Row[]) || [];
  } catch (e) {
    // Database not reachable or search function missing: search what the pages show instead.
    console.error("search_site unavailable, searching page content:", e instanceof Error ? e.message : e);
  }

  // Nothing from the database (e.g. it's empty and pages show built-in content):
  // search the same content the public pages show, so visitors always get answers.
  if (rows.length === 0) rows = await searchPageContent(query, limit);

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

/** Simple word match over the content the public pages render (database or built-in). */
async function searchPageContent(query: string, limit: number): Promise<Row[]> {
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
  if (!words.length) return [];

  const [projects, research, articles] = await Promise.all([
    getProjects().catch(() => []),
    getResearch().catch(() => []),
    getPublishedArticles(50).catch(() => []),
  ]);

  // Title matches count most, then short descriptions, then tags and body text.
  const score = (title: string, short: string, rest: string) => {
    const t = title.toLowerCase(), s = short.toLowerCase(), r = rest.toLowerCase();
    let total = 0;
    for (const w of words) {
      if (t.includes(w)) total += 5;
      else if (s.includes(w)) total += 3;
      else if (r.includes(w)) total += 1;
      else return 0; // every word must appear somewhere
    }
    return total;
  };

  const candidates: Row[] = [
    ...projects
      .filter((p) => p.isVisible !== false)
      .map((p) => ({
        id: p.id, kind: "project" as const, title: p.title, snippet: p.tagline || p.summary || "",
        href: `/projects/${p.slug}`, tags: p.tools ?? [],
        rank: score(p.title, `${p.tagline ?? ""} ${p.summary ?? ""} ${p.category ?? ""}`, `${(p.tools ?? []).join(" ")} ${p.description ?? ""} ${p.role ?? ""}`),
      })),
    ...research.map((r) => ({
      id: r.id, kind: "research" as const, title: r.title, snippet: r.abstract?.slice(0, 160) || "",
      href: `/research/${r.slug}`, tags: r.tags ?? [],
      rank: score(r.title, r.abstract ?? "", (r.tags ?? []).join(" ")),
    })),
    ...articles.map((a) => ({
      id: a.id, kind: "blog" as const, title: a.title, snippet: a.excerpt || "",
      href: `/blog/${a.slug}`, tags: a.tags ?? [],
      rank: score(a.title, a.excerpt ?? "", (a.tags ?? []).join(" ")),
    })),
  ];

  return candidates.filter((c) => c.rank > 0).sort((a, b) => b.rank - a.rank).slice(0, limit);
}
