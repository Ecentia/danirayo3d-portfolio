import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://danirayo3d.es';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // Protegemos tu panel de administración
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}