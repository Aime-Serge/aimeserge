import { MetadataRoute } from 'next';
import { getProjects, getPosts } from '@/core/domain/portfolio/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://aimesergeonline.vercel.app';

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
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Fetch dynamic content
  const projects = await getProjects();
  const posts = await getPosts();

  const projectRoutes = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: new Date(project.createdAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const postRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.article?.slug || post.id}`,
    lastModified: new Date(post.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...routes, ...projectRoutes, ...postRoutes];
}
