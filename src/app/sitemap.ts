import type { MetadataRoute } from 'next';
import { getArticles, getLegacySitemapEntries, getReportages } from '@/lib/wp';
import { SITE_URL } from '@/lib/seo';

function absoluteUrl(path: string): string {
  if (!path || path === '/') return `${SITE_URL}/`;
  return `${SITE_URL}/${path.replace(/^\/+|\/+$/g, '')}/`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    '/',
    '/reportaze/',
    '/oferta/',
    '/o-mnie/',
    '/opinie/',
    '/faq/',
    '/blog/',
    '/kontakt/',
    '/rezerwacja/',
    '/polityka-prywatnosci/'
  ];

  const [reportages, articles, legacyEntries] = await Promise.all([
    getReportages(),
    getArticles(),
    getLegacySitemapEntries()
  ]);

  const entries = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const path of staticPaths) {
    const url = absoluteUrl(path);
    entries.set(url, {
      url,
      changeFrequency: path === '/' ? 'weekly' : 'monthly',
      priority: path === '/' ? 1 : 0.7
    });
  }

  for (const item of reportages) {
    const url = absoluteUrl(`/reportaze/${item.slug}/`);
    entries.set(url, {
      url,
      lastModified: item.date ? new Date(item.date) : undefined,
      changeFrequency: 'monthly',
      priority: 0.8
    });
  }

  for (const item of articles) {
    const url = absoluteUrl(`/${item.slug}/`);
    entries.set(url, {
      url,
      lastModified: item.date ? new Date(item.date) : undefined,
      changeFrequency: 'monthly',
      priority: 0.65
    });
  }

  for (const item of legacyEntries) {
    const url = absoluteUrl(item.path);
    if (entries.has(url)) continue;
    entries.set(url, {
      url,
      lastModified: item.modified ? new Date(item.modified) : undefined,
      changeFrequency: 'monthly',
      priority: 0.6
    });
  }

  return [...entries.values()];
}
