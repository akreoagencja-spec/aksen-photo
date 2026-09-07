import type { MetadataRoute } from 'next';
import { getArticles, getLegacySitemapEntries, getReportages } from '@/lib/wp';
import { SITE_URL } from '@/lib/seo';

const WORDPRESS_URL = (process.env.WORDPRESS_URL || 'https://aksen-photo.pl').replace(/\/+$/, '');

function absoluteUrl(path: string): string {
  if (!path || path === '/') return `${SITE_URL}/`;
  return `${SITE_URL}/${path.replace(/^\/+|\/+$/g, '')}/`;
}

async function getLegacyTermPaths(endpoint: 'categories' | 'tags', prefix: 'category' | 'tag'): Promise<string[]> {
  const paths: string[] = [];

  for (let page = 1; page <= 20; page += 1) {
    try {
      const response = await fetch(
        `${WORDPRESS_URL}/wp-json/wp/v2/${endpoint}?page=${page}&per_page=100&_fields=slug`,
        {
          next: { revalidate: 1800 },
          signal: AbortSignal.timeout(5000)
        }
      );
      if (!response.ok) break;

      const items = (await response.json()) as Array<{ slug?: string }>;
      if (!items.length) break;

      for (const item of items) {
        if (item.slug) paths.push(`/${prefix}/${item.slug}/`);
      }

      if (items.length < 100) break;
    } catch {
      break;
    }
  }

  return paths;
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

  const [reportages, articles, legacyEntries, categoryPaths, tagPaths] = await Promise.all([
    getReportages(),
    getArticles(),
    getLegacySitemapEntries(),
    getLegacyTermPaths('categories', 'category'),
    getLegacyTermPaths('tags', 'tag')
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

  for (const path of [...categoryPaths, ...tagPaths]) {
    const url = absoluteUrl(path);
    if (entries.has(url)) continue;
    entries.set(url, {
      url,
      changeFrequency: 'monthly',
      priority: 0.4
    });
  }

  return [...entries.values()];
}
