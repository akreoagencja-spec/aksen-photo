import type { MetadataRoute } from 'next';
import { getProductionSitemapPaths } from '@/lib/cms-v2';
import { siteV2 } from '@/lib/site-v2';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = await getProductionSitemapPaths();
  return paths.map(path => ({
    url: `${siteV2.url}${path === '/' ? '/' : `${path}/`}`.replace(/([^:]\/)\/+/, '$1'),
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path.startsWith('/tag/') ? 0.25 : path.startsWith('/category/') ? 0.45 : 0.7
  }));
}
