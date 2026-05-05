import { getBroadcasts } from "@/core/domain/portfolio/queries";
import { getProjects } from "@/core/domain/portfolio/queries";
import { getResearch } from "@/core/domain/research/queries";
import type { SearchResult, SearchResultType } from "@/types/search";
import { rateLimit } from "@/infrastructure/security/rateLimit";
import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

interface SearchDocument {
  id: string;
  type: SearchResultType;
  title: string;
  snippet: string;
  href: string;
  tags: string[];
  searchableText: string;
}

const getSearchDocuments = unstable_cache(
  async (): Promise<SearchDocument[]> => {
    const [projects, broadcasts, researchPapers] = await Promise.all([
      getProjects(),
      getBroadcasts(),
      getResearch(),
    ]);

    const projectDocs: SearchDocument[] = projects.map((project) => ({
      id: project.id,
      type: "project",
      title: project.title,
      snippet: project.summary || project.tagline || "",
      href: `/projects/${project.slug}`,
      tags: project.tools || [],
      searchableText: [
        project.title,
        project.tagline,
        project.summary,
        project.description,
        project.role,
        project.category,
        ...(project.tools || []),
        ...(project.features || []),
      ]
        .join(" ")
        .toLowerCase(),
    }));

    const blogDocs: SearchDocument[] = broadcasts.map((broadcast) => ({
      id: broadcast.id,
      type: "blog",
      title: broadcast.title,
      snippet: broadcast.excerpt || "",
      href: `/blog/${broadcast.id}`,
      tags: broadcast.tags || [],
      searchableText: [
        broadcast.title,
        broadcast.excerpt || "",
        broadcast.content || "",
        broadcast.category,
        ...(broadcast.tags || []),
      ]
        .join(" ")
        .toLowerCase(),
    }));

    const researchDocs: SearchDocument[] = researchPapers.map((paper) => ({
      id: paper.id,
      type: "research",
      title: paper.title,
      snippet: paper.abstract,
      href: `/research`,
      tags: paper.tags || [],
      searchableText: [
        paper.title,
        paper.abstract,
        ...(paper.tags || []),
      ]
        .join(" ")
        .toLowerCase(),
    }));

    return [...projectDocs, ...blogDocs, ...researchDocs];
  },
  ["global-content-search-index"],
  { revalidate: 300 },
);

function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

function calculateScore(doc: SearchDocument, rawQuery: string, tokens: string[]): number {
  if (tokens.length === 0) {
    return 0;
  }

  const title = doc.title.toLowerCase();
  const snippet = doc.snippet.toLowerCase();
  const tags = doc.tags.map((tag) => tag.toLowerCase());
  const normalizedQuery = rawQuery.toLowerCase().trim();

  let score = 0;

  if (normalizedQuery.length > 1 && title.includes(normalizedQuery)) {
    score += 14;
  }

  if (normalizedQuery.length > 1 && doc.searchableText.includes(normalizedQuery)) {
    score += 10;
  }

  for (const token of tokens) {
    if (title.includes(token)) {
      score += 8;
    }
    if (snippet.includes(token)) {
      score += 4;
    }
    if (tags.some((tag) => tag.includes(token))) {
      score += 6;
    }
    if (doc.searchableText.includes(token)) {
      score += 2;
    }
  }

  return score;
}

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
    return NextResponse.json(
      { query, results: [] as SearchResult[] },
      { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" } },
    );
  }

  const tokens = tokenizeQuery(query);
  const documents = await getSearchDocuments();

  const results = documents
    .map((doc) => {
      const score = calculateScore(doc, query, tokens);
      return {
        id: doc.id,
        type: doc.type,
        title: doc.title,
        snippet: doc.snippet,
        href: doc.href,
        tags: doc.tags,
        score,
      } satisfies SearchResult;
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return NextResponse.json(
    { query, results },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        "X-RateLimit-Remaining": String(rateLimitResult.remaining),
      },
    },
  );
}

