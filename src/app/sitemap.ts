import { MetadataRoute } from 'next';
import { getProjects, getPosts } from '@/core/domain/portfolio/queries';
import type { Project, Post } from '@/core/domain/portfolio/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://aimesergeonline.vercel.app';
  const now = new Date();

  // Base routes
  const routes = [
    '',
    '/projects',
    '/blog',
    '/resume',
    '/contact',
    '/research',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Fetch dynamic content (with error handling for build-time limitations)
  let projects: Project[] = [];
  let posts: Post[] = [];

  try {
    projects = await getProjects();
  } catch (err) {
    console.warn('⚠️ Could not fetch projects for sitemap:', err);
  }

  try {
    posts = await getPosts();
  } catch (err) {
    console.warn('⚠️ Could not fetch posts for sitemap:', err);
  }

  const projectRoutes = projects
    .filter((project) => project.slug && project.createdAt) // Filter out invalid entries
    .map((project) => {
      try {
        const lastMod = new Date(project.createdAt as any);
        // Validate date is not invalid
        if (isNaN(lastMod.getTime())) {
          return {
            url: `${baseUrl}/projects/${project.slug}`,
            lastModified: now,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
          };
        }
        return {
          url: `${baseUrl}/projects/${project.slug}`,
          lastModified: lastMod,
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        };
      } catch {
        return {
          url: `${baseUrl}/projects/${project.slug}`,
          lastModified: now,
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        };
      }
    });

  const postRoutes = posts
    .filter((post) => post.article?.slug || post.id) // Filter out invalid entries
    .map((post) => {
      try {
        const lastMod = new Date(post.createdAt as any);
        // Validate date is not invalid
        if (isNaN(lastMod.getTime())) {
          return {
            url: `${baseUrl}/blog/${post.article?.slug || post.id}`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          };
        }
        return {
          url: `${baseUrl}/blog/${post.article?.slug || post.id}`,
          lastModified: lastMod,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        };
      } catch {
        return {
          url: `${baseUrl}/blog/${post.article?.slug || post.id}`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        };
      }
    });

  return [...routes, ...projectRoutes, ...postRoutes];
}
