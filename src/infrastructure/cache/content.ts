import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Content cache strategy (cheap AND dynamic):
 *  - Public pages are static HTML served from Vercel's CDN (no DB hit per visit).
 *  - Each query is cached with a tag (see queries.ts) and a 24 h safety TTL.
 *  - When the admin saves or deletes content, we purge exactly the affected
 *    tags and pages, so changes go live within seconds, with no redeploy.
 */
export const CONTENT_TTL = 60 * 60 * 24;

type Effect = { tags: string[]; paths: Array<[string, ("page" | "layout")?]> };

const EFFECTS: Record<string, Effect> = {
  projects: { tags: ["projects"], paths: [["/projects"], ["/projects/[slug]", "page"], ["/"], ["/terminal"]] },
  research: { tags: ["research"], paths: [["/research"], ["/research/[slug]", "page"], ["/terminal"]] },
  certificates: { tags: ["certificates"], paths: [["/resume"], ["/terminal"]] },
  experiences: { tags: ["experiences"], paths: [["/resume"], ["/"], ["/terminal"]] },
  educations: { tags: ["educations"], paths: [["/resume"], ["/terminal"]] },
  achievements: { tags: ["achievements"], paths: [["/resume"], ["/terminal"]] },
  organizations: { tags: ["experiences"], paths: [["/resume"], ["/terminal"]] },
  broadcasts: { tags: ["posts", "articles"], paths: [["/blog"], ["/blog/[id]", "page"], ["/feed.xml"], ["/terminal"]] },
  articles: { tags: ["posts", "articles"], paths: [["/blog"], ["/blog/[id]", "page"], ["/feed.xml"], ["/terminal"]] },
  profile: { tags: ["profile"], paths: [["/"], ["/resume"], ["/terminal"]] },
  posts: { tags: ["posts"], paths: [["/blog"]] },
  contacts: { tags: [], paths: [] },
};

/** Purge every cached page and query that shows rows from `table`. */
/** Every table whose changes show on public pages. */
export const CONTENT_TABLES = Object.keys(EFFECTS);

export function revalidateContent(table: string) {
  const effect = EFFECTS[table];
  if (!effect) return;
  effect.tags.forEach((t) => revalidateTag(t));
  effect.paths.forEach(([p, type]) => revalidatePath(p, type));
  if (effect.paths.length) revalidatePath("/sitemap.xml");
}

/**
 * Used as `.catch(contentFallback(x))` around cached queries. A DB outage
 * returns the fallback for this request only. It is never written to the
 * cache, and ISR keeps serving the last good page.
 */
export function contentFallback<T>(fallback: T) {
  return (err: unknown): T => {
    console.error("[content] query failed, using fallback:", err instanceof Error ? err.message : err);
    return fallback;
  };
}
