import type { Article, MediaItem, Reportage } from '@/types/content';

const WORDPRESS_URL = (process.env.WORDPRESS_URL || 'https://aksen-photo.pl').replace(/\/+$/, '');

const REPORTAGE_CATEGORY = 'reportaz-slubny';
const ARTICLE_CATEGORY = 'poradnik';

type WpRendered = { rendered?: string };
type WpMedia = {
  id?: number;
  source_url?: string;
  alt_text?: string;
  media_details?: { width?: number; height?: number };
};
type WpPost = {
  id: number;
  slug: string;
  link: string;
  date?: string;
  title?: WpRendered;
  excerpt?: WpRendered;
  content?: WpRendered;
  _embedded?: { 'wp:featuredmedia'?: WpMedia[] };
};
type WpCategory = { id: number; slug: string };

async function request<T>(path: string, revalidate = 300): Promise<T | null> {
  try {
    const response = await fetch(`${WORDPRESS_URL}${path}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function decodeText(value = ''): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/&hellip;/gi, '…')
    .replace(/&ndash;/gi, '–')
    .replace(/&mdash;/gi, '—')
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitizeHtml(value = ''): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed\b[^>]*>[^<]*<\/embed>/gi, '')
    .replace(/<embed\b[^>]*\/?\s*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript\s*:/gi, '');
}

function featuredMedia(post: WpPost): MediaItem | undefined {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  if (!media?.source_url) return undefined;
  return {
    id: media.id || `featured-${post.id}`,
    url: media.source_url,
    alt: media.alt_text || decodeText(post.title?.rendered || post.slug),
    width: media.media_details?.width,
    height: media.media_details?.height
  };
}

function attr(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
  return match ? (match[1] || match[2] || undefined) : undefined;
}

function contentImages(post: WpPost): MediaItem[] {
  const html = post.content?.rendered || '';
  const images: MediaItem[] = [];
  const seen = new Set<string>();

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const url = attr(tag, 'src');
    if (!url || !/^https?:\/\//i.test(url) || seen.has(url)) continue;
    seen.add(url);

    const widthRaw = attr(tag, 'width');
    const heightRaw = attr(tag, 'height');
    const width = widthRaw && /^\d+$/.test(widthRaw) ? Number(widthRaw) : undefined;
    const height = heightRaw && /^\d+$/.test(heightRaw) ? Number(heightRaw) : undefined;

    images.push({
      id: `${post.id}-image-${images.length + 1}`,
      url,
      alt: decodeText(attr(tag, 'alt') || post.title?.rendered || post.slug),
      width,
      height
    });
  }

  return images;
}

async function categoryId(slug: string): Promise<number | null> {
  const categories = await request<WpCategory[]>(
    `/wp-json/wp/v2/categories?slug=${encodeURIComponent(slug)}&_fields=id,slug`,
    1800
  );
  return categories?.[0]?.id || null;
}

async function postsForCategory(slug: string): Promise<WpPost[]> {
  const id = await categoryId(slug);
  if (!id) return [];

  return (
    (await request<WpPost[]>(
      `/wp-json/wp/v2/posts?categories=${id}&per_page=100&orderby=date&order=desc&_embed=wp:featuredmedia`,
      300
    )) || []
  );
}

async function postForCategory(categorySlug: string, postSlug: string): Promise<WpPost | null> {
  const id = await categoryId(categorySlug);
  if (!id) return null;

  const posts = await request<WpPost[]>(
    `/wp-json/wp/v2/posts?categories=${id}&slug=${encodeURIComponent(postSlug)}&per_page=1&_embed=wp:featuredmedia`,
    300
  );
  return posts?.[0] || null;
}

function toArticle(post: WpPost): Article {
  return {
    id: post.id,
    slug: post.slug,
    title: decodeText(post.title?.rendered || post.slug),
    excerpt: decodeText(post.excerpt?.rendered || ''),
    content: sanitizeHtml(post.content?.rendered || ''),
    hero: featuredMedia(post),
    date: post.date
  };
}

function toReportage(post: WpPost): Reportage {
  const hero = featuredMedia(post);
  const gallery = contentImages(post).filter(image => image.url !== hero?.url);
  return {
    id: post.id,
    slug: post.slug,
    title: decodeText(post.title?.rendered || post.slug),
    excerpt: decodeText(post.excerpt?.rendered || ''),
    date: post.date,
    hero,
    gallery,
    content: sanitizeHtml(post.content?.rendered || '')
  };
}

export async function getPublicArticles(): Promise<Article[]> {
  return (await postsForCategory(ARTICLE_CATEGORY)).map(toArticle);
}

export async function getPublicArticle(slug: string): Promise<Article | null> {
  const post = await postForCategory(ARTICLE_CATEGORY, slug);
  return post ? toArticle(post) : null;
}

export async function getPublicReportages(): Promise<Reportage[]> {
  return (await postsForCategory(REPORTAGE_CATEGORY)).map(toReportage);
}

export async function getPublicReportage(slug: string): Promise<Reportage | null> {
  const post = await postForCategory(REPORTAGE_CATEGORY, slug);
  return post ? toReportage(post) : null;
}
