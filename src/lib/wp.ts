import { fallbackData } from '@/lib/fallback';
import type { Article, FaqItem, MediaItem, Reportage, Review, SiteData } from '@/types/content';

const base = (process.env.WORDPRESS_URL || 'https://aksen-photo.pl').replace(/\/+$/, '');
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function request<T>(path: string, revalidate = 300): Promise<T | null> {
  const url = `${base}${path}`;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (attempt > 0) await wait(350);

    try {
      const response = await fetch(url, {
        next: { revalidate },
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(4500)
      });

      if (response.ok) return (await response.json()) as T;
      if (!RETRYABLE_STATUS.has(response.status)) return null;
    } catch {}
  }

  return null;
}

type WpRendered = { rendered?: string };
type WpSeo = {
  title?: string;
  description?: string;
  robots?: { index?: string; follow?: string };
  og_image?: Array<{ url?: string }>;
};
type WpAioSeo = {
  title?: string;
  description?: string;
  canonical_url?: string;
  robots?: string;
  'og:locale'?: string;
  'og:site_name'?: string;
  'og:type'?: string;
  'og:title'?: string;
  'og:description'?: string;
  'og:image'?: string;
  'twitter:card'?: string;
  'twitter:title'?: string;
  'twitter:description'?: string;
  'twitter:image'?: string;
  schema?: unknown;
};
type WpMedia = {
  id?: number;
  source_url?: string;
  alt_text?: string;
  media_details?: { width?: number; height?: number };
};
type WpEmbedded = { 'wp:featuredmedia'?: WpMedia[] };
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
  aioseo_head_json?: WpAioSeo | string;
  _embedded?: WpEmbedded;
};
type WpTerm = {
  id: number;
  slug: string;
  name: string;
  description?: string;
  count?: number;
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
  canonical?: string;
  ogType?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
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
    .replace(/&hellip;/gi, '…')
    .replace(/&#8211;|&ndash;/gi, '–')
    .replace(/&#8212;|&mdash;/gi, '—')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseAioSeo(value: WpEntity['aioseo_head_json']): WpAioSeo | undefined {
  if (!value) return undefined;
  if (typeof value === 'object') return value;
  try {
    const parsed = JSON.parse(value) as WpAioSeo;
    return parsed && typeof parsed === 'object' ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function sanitizeLegacyHtml(value = ''): string {
  return value
    .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed\b[^>]*\/?\s*>/gi, '')
    .replace(/<meta\b[^>]*\/?\s*>/gi, '')
    .replace(/<link\b[^>]*\/?\s*>/gi, '')
    .replace(/<base\b[^>]*\/?\s*>/gi, '')
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<\/?(?:html|body)\b[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\ssrcdoc\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript\s*:/gi, '');
}

function featuredMedia(item: WpEntity): MediaItem | undefined {
  const media = item._embedded?.['wp:featuredmedia']?.[0];
  const aio = parseAioSeo(item.aioseo_head_json);
  const url = media?.source_url || aio?.['og:image'] || item.yoast_head_json?.og_image?.[0]?.url;
  if (!url) return undefined;
  return {
    id: media?.id || `${item.id}-featured`,
    url,
    alt: media?.alt_text || htmlToText(item.title?.rendered || item.slug),
    width: media?.media_details?.width,
    height: media?.media_details?.height
  };
}

function toReportage(item: WpEntity): Reportage {
  return {
    id: item.id,
    slug: item.slug,
    title: htmlToText(item.title?.rendered || item.slug),
    excerpt: htmlToText(item.excerpt?.rendered || ''),
    date: item.date,
    hero: featuredMedia(item),
    gallery: [],
    content: sanitizeLegacyHtml(item.content?.rendered || '')
  };
}

function toArticle(item: WpEntity): Article {
  return {
    id: item.id,
    slug: item.slug,
    title: htmlToText(item.title?.rendered || item.slug),
    excerpt: htmlToText(item.excerpt?.rendered || ''),
    content: sanitizeLegacyHtml(item.content?.rendered || ''),
    hero: featuredMedia(item),
    date: item.date
  };
}

async function getTerm(kind: 'category' | 'tag', slug: string): Promise<WpTerm | null> {
  const endpoint = kind === 'category' ? 'categories' : 'tags';
  const terms = await request<WpTerm[]>(
    `/wp-json/wp/v2/${endpoint}?slug=${encodeURIComponent(slug)}&_fields=id,slug,name,description,count`,
    1800
  );
  return terms?.[0] || null;
}

async function getPostsForCategory(slug: string, revalidate = 300): Promise<WpEntity[]> {
  const term = await getTerm('category', slug);
  if (!term) return [];
  return (
    (await request<WpEntity[]>(
      `/wp-json/wp/v2/posts?categories=${term.id}&per_page=100&_embed=wp:featuredmedia&_fields=id,slug,link,date,modified,title,excerpt,yoast_head_json,aioseo_head_json,_links,_embedded`,
      revalidate
    )) || []
  );
}

async function getWpPostBySlug(slug: string, revalidate = 300): Promise<WpEntity | null> {
  const items = await request<WpEntity[]>(
    `/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&per_page=1&_embed=wp:featuredmedia&_fields=id,slug,link,date,modified,title,excerpt,content,yoast_head_json,aioseo_head_json,_links,_embedded`,
    revalidate
  );
  return items?.[0] || null;
}

export async function getReportages(): Promise<Reportage[]> {
  const custom = await request<Reportage[]>('/wp-json/aksen-headless/v1/reportages', 300);
  if (custom?.length) return custom;
  return (await getPostsForCategory('reportaz-slubny', 300)).map(toReportage);
}

export async function getReportage(slug: string): Promise<Reportage | null> {
  const custom = await request<Reportage>(`/wp-json/aksen-headless/v1/reportages/${encodeURIComponent(slug)}`, 300);
  if (custom) return custom;
  const item = await getWpPostBySlug(slug, 300);
  return item ? toReportage(item) : null;
}

export async function getReviews(): Promise<Review[]> {
  return (await request<Review[]>('/wp-json/aksen-headless/v1/reviews', 600)) || [];
}

export async function getFaq(): Promise<FaqItem[]> {
  return (await request<FaqItem[]>('/wp-json/aksen-headless/v1/faq', 600)) || fallbackData.faq;
}

export async function getArticles(): Promise<Article[]> {
  const custom = await request<Article[]>('/wp-json/aksen-headless/v1/articles', 600);
  if (custom?.length) return custom;
  return (await getPostsForCategory('poradnik', 600)).map(toArticle);
}

export async function getArticle(slug: string): Promise<Article | null> {
  const custom = await request<Article>(`/wp-json/aksen-headless/v1/articles/${encodeURIComponent(slug)}`, 600);
  if (custom) return custom;
  const item = await getWpPostBySlug(slug, 600);
  return item ? toArticle(item) : null;
}

export async function getSiteData(): Promise<SiteData> {
  const data = await request<Partial<SiteData>>('/wp-json/aksen-headless/v1/site', 300);
  const [reportages, articles] = await Promise.all([
    data?.reportages?.length ? Promise.resolve(data.reportages) : getReportages(),
    data?.articles?.length ? Promise.resolve(data.articles) : getArticles()
  ]);

  return {
    ...fallbackData,
    ...(data || {}),
    brand: { ...fallbackData.brand, ...(data?.brand || {}) },
    offer: { ...fallbackData.offer, ...(data?.offer || {}) },
    reportages,
    reviews: data?.reviews || fallbackData.reviews,
    faq: data?.faq || fallbackData.faq,
    articles,
    otherServices: data?.otherServices || fallbackData.otherServices
  };
}

function toLegacyContent(item: WpEntity): LegacyContent {
  const aio = parseAioSeo(item.aioseo_head_json);
  const yoast = item.yoast_head_json;
  const aioRobots = (aio?.robots || '').toLowerCase();
  const fallbackImage = featuredMedia(item)?.url;

  return {
    id: item.id,
    slug: item.slug,
    path: normalizedPath(item.link),
    title: htmlToText(item.title?.rendered || item.slug),
    excerpt: htmlToText(item.excerpt?.rendered || ''),
    content: sanitizeLegacyHtml(item.content?.rendered || ''),
    modified: item.modified || item.date,
    seoTitle: aio?.title ? htmlToText(aio.title) : yoast?.title ? htmlToText(yoast.title) : undefined,
    seoDescription: aio?.description ? htmlToText(aio.description) : yoast?.description ? htmlToText(yoast.description) : undefined,
    canonical: aio?.canonical_url,
    ogType: aio?.['og:type'],
    ogTitle: aio?.['og:title'] ? htmlToText(aio['og:title']) : undefined,
    ogDescription: aio?.['og:description'] ? htmlToText(aio['og:description']) : undefined,
    ogImage: aio?.['og:image'] || fallbackImage,
    twitterTitle: aio?.['twitter:title'] ? htmlToText(aio['twitter:title']) : undefined,
    twitterDescription: aio?.['twitter:description'] ? htmlToText(aio['twitter:description']) : undefined,
    twitterImage: aio?.['twitter:image'] || aio?.['og:image'] || fallbackImage,
    noIndex: aioRobots.includes('noindex') || yoast?.robots?.index === 'noindex',
    noFollow: aioRobots.includes('nofollow') || yoast?.robots?.follow === 'nofollow',
    image: aio?.['og:image'] || fallbackImage
  };
}

async function findWpEntity(path: string): Promise<WpEntity | null> {
  const wanted = normalizedPath(path);
  const slug = wanted.split('/').filter(Boolean).at(-1);
  if (!slug) return null;

  const query = `slug=${encodeURIComponent(slug)}&_fields=id,slug,link,date,modified,title,excerpt,content,yoast_head_json,aioseo_head_json`;
  const pages = await request<WpEntity[]>(`/wp-json/wp/v2/pages?${query}`, 300);
  const page = (pages || []).find(item => normalizedPath(item.link) === wanted);
  if (page) return page;

  const posts = await request<WpEntity[]>(`/wp-json/wp/v2/posts?${query}`, 300);
  return (posts || []).find(item => normalizedPath(item.link) === wanted) || null;
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

  const term = await getTerm(parsed.kind, parsed.slug);
  if (!term) return null;

  const filter = parsed.kind === 'category' ? 'categories' : 'tags';
  const posts = await request<WpEntity[]>(
    `/wp-json/wp/v2/posts?${filter}=${term.id}&page=${parsed.page}&per_page=12&_fields=id,slug,link,date,modified,title,excerpt,content,yoast_head_json,aioseo_head_json`,
    300
  );
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
    const batch = await request<WpEntity[]>(
      `/wp-json/wp/v2/${endpoint}?page=${page}&per_page=100&_fields=id,slug,link,date,modified`,
      1800
    );
    if (!batch?.length) break;
    items.push(...batch);
    if (batch.length < 100) break;
  }
  return items;
}

export async function getLegacySitemapEntries(): Promise<LegacySitemapEntry[]> {
  const [pages, posts] = await Promise.all([fetchWpCollection('pages'), fetchWpCollection('posts')]);
  const seen = new Map<string, LegacySitemapEntry>();
  for (const item of [...pages, ...posts]) {
    const path = normalizedPath(item.link);
    if (!seen.has(path)) seen.set(path, { path, modified: item.modified || item.date });
  }
  return [...seen.values()];
}
