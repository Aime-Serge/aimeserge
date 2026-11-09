import { MetadataRoute } from 'next';
import { SITE } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE.url;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/login', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
