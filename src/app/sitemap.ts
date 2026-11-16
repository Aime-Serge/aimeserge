import { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { getProjects, getPosts } from "@/core/domain/portfolio/queries";
import { getResearch } from "@/core/domain/research/queries";

/**
 * Every public page, for Google and other search engines. Rebuilt whenever
 * content changes in the admin (see revalidateContent), so new projects,
 * papers and articles are listed straight away. Hidden projects are left out.
 */
const date = (v: unknown, fallback: Date) => {
  const d = v ? new Date(String(v)) : fallback;
  return Number.isNaN(d.getTime()) ? fallback : d;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const now = new Date();

  const [projects, research, posts] = await Promise.all([
    getProjects().catch(() => []),
    getResearch().catch(() => []),
    getPosts().catch(() => []),
  ]);

  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/research`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/resume`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/terminal`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  const projectPages: MetadataRoute.Sitemap = projects
    .filter((p) => p.slug && p.isVisible !== false)
    .map((p) => ({
      url: `${base}/projects/${p.slug}`,
      lastModified: date(p.createdAt, now),
      changeFrequency: "monthly",
      priority: p.featured ? 0.8 : 0.6,
    }));

  const researchPages: MetadataRoute.Sitemap = research
    .filter((r) => r.slug)
    .map((r) => ({
      url: `${base}/research/${r.slug}`,
      lastModified: date(r.publicationDate || r.createdAt, now),
      changeFrequency: "yearly",
      priority: 0.7,
    }));

  const postPages: MetadataRoute.Sitemap = posts
    .filter((p) => p.article?.slug || p.id)
    .map((p) => ({
      url: `${base}/blog/${p.article?.slug || p.id}`,
      lastModified: date(p.createdAt, now),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [...pages, ...projectPages, ...researchPages, ...postPages];
}
