import type { MetadataRoute } from 'next';
import { siteV2 } from '@/lib/site-v2';

export default function robots(): MetadataRoute.Robots {
  const indexingEnabled = process.env.ALLOW_INDEXING === 'true';
  if (!indexingEnabled) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      sitemap: `${siteV2.url}/sitemap.xml`,
      host: siteV2.url
    };
  }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `${siteV2.url}/sitemap.xml`,
    host: siteV2.url
  };
}
