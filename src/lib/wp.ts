import { fallbackData } from '@/lib/fallback';
import type { Article, FaqItem, Reportage, Review, SiteData } from '@/types/content';

const base = (process.env.WORDPRESS_URL || 'https://aksen-photo.pl').replace(/\/+$/, '');

async function request<T>(path: string, revalidate = 300): Promise<T | null> {
  try {
    const response = await fetch(`${base}${path}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getSiteData(): Promise<SiteData> {
  const data = await request<Partial<SiteData>>('/wp-json/aksen-headless/v1/site', 300);
  if (!data) return fallbackData;
  return {
    ...fallbackData,
    ...data,
    brand: { ...fallbackData.brand, ...(data.brand || {}) },
    offer: { ...fallbackData.offer, ...(data.offer || {}) },
    reportages: data.reportages || [],
    reviews: data.reviews || [],
    faq: data.faq || fallbackData.faq,
    articles: data.articles || [],
    otherServices: data.otherServices || fallbackData.otherServices
  };
}

export async function getReportages(): Promise<Reportage[]> {
  const data = await request<Reportage[]>('/wp-json/aksen-headless/v1/reportages', 300);
  return data || [];
}

export async function getReportage(slug: string): Promise<Reportage | null> {
  return request<Reportage>(`/wp-json/aksen-headless/v1/reportages/${encodeURIComponent(slug)}`, 300);
}

export async function getReviews(): Promise<Review[]> {
  return (await request<Review[]>('/wp-json/aksen-headless/v1/reviews', 600)) || [];
}

export async function getFaq(): Promise<FaqItem[]> {
  return (await request<FaqItem[]>('/wp-json/aksen-headless/v1/faq', 600)) || fallbackData.faq;
}

export async function getArticles(): Promise<Article[]> {
  return (await request<Article[]>('/wp-json/aksen-headless/v1/articles', 600)) || [];
}

export async function getArticle(slug: string): Promise<Article | null> {
  return request<Article>(`/wp-json/aksen-headless/v1/articles/${encodeURIComponent(slug)}`, 600);
}

type WpRendered = { rendered?: string };
type WpSeo = {
  title?: string;
  description?: string;
  robots?: { index?: string; follow?: string };
  og_image?: Array<{ url?: string }>;
};

type WpEntity = {
  id: number;
  slug: string;
  link: string;
  date?: string;
  modified?: string;
  title?: WpRendered;
  excerpt?: WpRendered;
  content?: WpRendered;
  yoast_head_json?: WpSeo;
};

type WpTerm = {
  id: number;
  slug: string;
  name: string;
  description?: string;
};

export type LegacyContent = {
  id: number;
  slug: string;
  path: string;
  title: string;
  excerpt: string;
  content: string;
  modified?: string;
  seoTitle?: string;
  seoDescription?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  image?: string;
};

export type LegacyArchive = {
  kind: 'category' | 'tag';
  slug: string;
  title: string;
  description: string;
  page: number;
  path: string;
  posts: LegacyContent[];
};

export type LegacySitemapEntry = {
  path: string;
  modified?: string;
};

function normalizedPath(value: string): string {
  try {
    const pathname = value.startsWith('http') ? new URL(value).pathname : value;
    const clean = `/${pathname}`.replace(/\/{2,}/g, '/').replace(/\/+$/, '');
    return clean || '/';
  } catch {
    return '/';
  }
}

function htmlToText(value = ''): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeLegacyHtml(value = ''): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed\b[^>]*\/?\s*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript\s*:/gi, '');
}

function toLegacyContent(item: WpEntity): LegacyContent {
  const seo = item.yoast_head_json;
  return {
    id: item.id,
    slug: item.slug,
    path: normalizedPath(item.link),
    title: htmlToText(item.title?.rendered || item.slug),
    excerpt: htmlToText(item.excerpt?.rendered || ''),
    content: sanitizeLegacyHtml(item.content?.rendered || ''),
    modified: item.modified || item.date,
    seoTitle: seo?.title ? htmlToText(seo.title) : undefined,
    seoDescription: seo?.description ? htmlToText(seo.description) : undefined,
    noIndex: seo?.robots?.index === 'noindex',
    noFollow: seo?.robots?.follow === 'nofollow',
    image: seo?.og_image?.[0]?.url
  };
}

async function findWpEntity(path: string): Promise<WpEntity | null> {
  const wanted = normalizedPath(path);
  const slug = wanted.split('/').filter(Boolean).at(-1);
  if (!slug) return null;

  const query = `slug=${encodeURIComponent(slug)}&_fields=id,slug,link,date,modified,title,excerpt,content,yoast_head_json`;
  const [pages, posts] = await Promise.all([
    request<WpEntity[]>(`/wp-json/wp/v2/pages?${query}`, 300),
    request<WpEntity[]>(`/wp-json/wp/v2/posts?${query}`, 300)
  ]);

  const candidates = [...(pages || []), ...(posts || [])];
  return candidates.find(item => normalizedPath(item.link) === wanted) || candidates[0] || null;
}

export async function getLegacyContent(path: string): Promise<LegacyContent | null> {
  const item = await findWpEntity(path);
  return item ? toLegacyContent(item) : null;
}

function parseArchivePath(path: string): { kind: 'category' | 'tag'; slug: string; page: number } | null {
  const parts = normalizedPath(path).split('/').filter(Boolean);
  if (parts[0] !== 'category' && parts[0] !== 'tag') return null;
  if (!parts[1]) return null;
  if (parts.length === 2) return { kind: parts[0], slug: parts[1], page: 1 };
  if (parts.length === 4 && parts[2] === 'page' && /^\d+$/.test(parts[3])) {
    return { kind: parts[0], slug: parts[1], page: Math.max(1, Number(parts[3])) };
  }
  return null;
}

export async function getLegacyArchive(path: string): Promise<LegacyArchive | null> {
  const parsed = parseArchivePath(path);
  if (!parsed) return null;

  const termEndpoint = parsed.kind === 'category' ? 'categories' : 'tags';
  const terms = await request<WpTerm[]>(`/wp-json/wp/v2/${termEndpoint}?slug=${encodeURIComponent(parsed.slug)}&_fields=id,slug,name,description`, 600);
  const term = terms?.[0];
  if (!term) return null;

  const filter = parsed.kind === 'category' ? 'categories' : 'tags';
  const posts = await request<WpEntity[]>(`/wp-json/wp/v2/posts?${filter}=${term.id}&page=${parsed.page}&per_page=12&_fields=id,slug,link,date,modified,title,excerpt,content,yoast_head_json`, 300);
  if (!posts) return null;

  return {
    kind: parsed.kind,
    slug: parsed.slug,
    title: term.name,
    description: htmlToText(term.description || ''),
    page: parsed.page,
    path: normalizedPath(path),
    posts: posts.map(toLegacyContent)
  };
}

async function fetchWpCollection(endpoint: 'posts' | 'pages'): Promise<WpEntity[]> {
  const items: WpEntity[] = [];
  for (let page = 1; page <= 20; page += 1) {
    const batch = await request<WpEntity[]>(`/wp-json/wp/v2/${endpoint}?page=${page}&per_page=100&_fields=id,slug,link,date,modified`, 1800);
    if (!batch?.length) break;
    items.push(...batch);
    if (batch.length < 100) break;
  }
  return items;
}

export async function getLegacySitemapEntries(): Promise<LegacySitemapEntry[]> {
  const [posts, pages] = await Promise.all([fetchWpCollection('posts'), fetchWpCollection('pages')]);
  const seen = new Set<string>();
  const result: LegacySitemapEntry[] = [];

  for (const item of [...pages, ...posts]) {
    const path = normalizedPath(item.link);
    if (seen.has(path)) continue;
    seen.add(path);
    result.push({ path, modified: item.modified || item.date });
  }

  return result;
}
