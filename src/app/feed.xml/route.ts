import { getPublishedArticles } from "@/core/domain/portfolio/queries";
import { SITE } from "@/config/site";
import { blocksToPlainText } from "@/infrastructure/utils/markdownBlocks";

// Static file, rebuilt when an article is saved (see cache/content.ts) or daily.
// Point Dev.to (Settings → Extensions → RSS), Hashnode or a newsletter tool here.
export const dynamic = "force-static";
export const revalidate = 86400;

const xml = (s = "") =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export async function GET() {
  const articles = await getPublishedArticles(30);

  const items = articles
    .map((a) => {
      const url = `${SITE.url}/blog/${a.slug}`;
      const date = new Date(a.publishedAt || a.createdAt).toUTCString();
      const summary = a.excerpt || blocksToPlainText(a.bodyContent).slice(0, 300);
      const categories = [a.category, ...(a.tags || [])].filter(Boolean).map((c) => `<category>${xml(c)}</category>`).join("");
      return `<item><title>${xml(a.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${date}</pubDate><description>${xml(summary)}</description>${categories}</item>`;
    })
    .join("");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${xml(`${SITE.name}: Blog`)}</title>
<link>${SITE.url}/blog</link>
<description>${xml(SITE.description)}</description>
<language>en</language>
<atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
