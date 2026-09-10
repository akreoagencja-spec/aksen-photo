const CMS_ORIGIN = (process.env.WORDPRESS_URL || 'https://aksen-photo.pl').replace(/\/+$/, '');
const PUBLIC_ORIGIN = 'https://aksen-photo.pl';
const RETRYABLE = new Set([429, 500, 502, 503, 504]);

type WpRendered = { rendered?: string };
type WpMedia = {
  id?: number;
  source_url?: string;
  alt_text?: string;
  media_details?: { width?: number; height?: number };
};
type WpAioSeo = {
  title?: string;
  description?: string;
  canonical_url?: string;
  robots?: string;
  'og:type'?: string;
  'og:title'?: string;
  'og:description'?: string;
  'og:image'?: string;
  'twitter:title'?: string;
  'twitter:description'?: string;
  'twitter:image'?: string;
};
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
  aioseo_head_json?: WpAioSeo | string;
  yoast_head_json?: WpSeo;
  _embedded?: { 'wp:featuredmedia'?: WpMedia[] };
};
type WpTerm = { id: number; slug: string; name: string; description?: string; count?: number };

export type CmsItem = {
  id: number;
  slug: string;
  path: string;
  type: 'page' | 'post';
  title: string;
  excerpt: string;
  content: string;
  date?: string;
  modified?: string;
  image?: string;
  imageAlt?: string;
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
};

export type CmsArchive = {
  kind: 'category' | 'tag';
  slug: string;
  name: string;
  description: string;
  page: number;
  path: string;
  posts: CmsItem[];
};

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJson<T>(path: string, revalidate = 300): Promise<T | null> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (attempt) await wait(250);
    try {
      const response = await fetch(`${CMS_ORIGIN}${path}`, {
        headers: { Accept: 'application/json' },
        next: { revalidate },
        signal: AbortSignal.timeout(5500)
      });
      if (response.ok) return (await response.json()) as T;
      if (!RETRYABLE.has(response.status)) return null;
    } catch {}
  }
  return null;
}

async function fetchText(url: string, revalidate = 3600): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/xml,text/xml,text/plain,*/*;q=0.1' },
      next: { revalidate },
      signal: AbortSignal.timeout(6500)
    });
    return response.ok ? response.text() : null;
  } catch {
    return null;
  }
}

export function normalizePath(value: string): string {
  try {
    const pathname = value.startsWith('http') ? new URL(value).pathname : value;
    const clean = `/${pathname}`.replace(/\/{2,}/g, '/').replace(/\/+$/, '');
    return clean || '/';
  } catch {
    return '/';
  }
}

export function plainText(value = ''): string {
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
    .replace(/&#8217;|&rsquo;/gi, '’')
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

function isAllowedIframe(full: string): boolean {
  const match = full.match(/\ssrc\s*=\s*["']([^"']+)["']/i);
  if (!match) return false;
  try {
    const url = new URL(match[1], PUBLIC_ORIGIN);
    return ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'].includes(url.hostname);
  } catch {
    return false;
  }
}

export function sanitizeCmsHtml(value = ''): string {
  let html = value
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
    .replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, full => (isAllowedIframe(full) ? full : ''))
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\ssrcdoc\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\sstyle\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/<h1\b([^>]*)>/gi, '<h2$1>')
    .replace(/<\/h1>/gi, '</h2>');

  html = html.replace(/\s(?:href|src)\s*=\s*(["'])http:\/\/aksen-photo\.pl\//gi, match => match.replace('http://', 'https://'));
  return html;
}

function featured(item: WpEntity) {
  const media = item._embedded?.['wp:featuredmedia']?.[0];
  const aio = parseAioSeo(item.aioseo_head_json);
  return {
    url: media?.source_url || aio?.['og:image'] || item.yoast_head_json?.og_image?.[0]?.url,
    alt: media?.alt_text || plainText(item.title?.rendered || item.slug)
  };
}

function mapItem(item: WpEntity, type: 'page' | 'post'): CmsItem {
  const aio = parseAioSeo(item.aioseo_head_json);
  const robots = (aio?.robots || '').toLowerCase();
  const image = featured(item);
  return {
    id: item.id,
    slug: item.slug,
    path: normalizePath(item.link),
    type,
    title: plainText(item.title?.rendered || item.slug),
    excerpt: plainText(item.excerpt?.rendered || ''),
    content: sanitizeCmsHtml(item.content?.rendered || ''),
    date: item.date,
    modified: item.modified,
    image: image.url,
    imageAlt: image.alt,
    seoTitle: aio?.title || item.yoast_head_json?.title,
    seoDescription: aio?.description || item.yoast_head_json?.description,
    canonical: aio?.canonical_url || item.link,
    ogType: aio?.['og:type'],
    ogTitle: aio?.['og:title'],
    ogDescription: aio?.['og:description'],
    ogImage: aio?.['og:image'] || image.url,
    twitterTitle: aio?.['twitter:title'],
    twitterDescription: aio?.['twitter:description'],
    twitterImage: aio?.['twitter:image'],
    noIndex: robots.includes('noindex') || item.yoast_head_json?.robots?.index === 'noindex',
    noFollow: robots.includes('nofollow') || item.yoast_head_json?.robots?.follow === 'nofollow'
  };
}

async function bySlug(type: 'pages' | 'posts', slug: string): Promise<WpEntity[]> {
  return (
    await fetchJson<WpEntity[]>(
      `/wp-json/wp/v2/${type}?slug=${encodeURIComponent(slug)}&per_page=20&_embed=wp:featuredmedia`,
      300
    )
  ) || [];
}

export async function getContentByPath(path: string): Promise<CmsItem | null> {
  const wanted = normalizePath(path);
  const slug = wanted.split('/').filter(Boolean).at(-1);
  if (!slug) return null;

  const pages = await bySlug('pages', slug);
  const page = pages.find(item => normalizePath(item.link) === wanted);
  if (page) return mapItem(page, 'page');

  const posts = await bySlug('posts', slug);
  const post = posts.find(item => normalizePath(item.link) === wanted);
  if (post) return mapItem(post, 'post');

  return null;
}

export async function getLatestPosts(limit = 12): Promise<CmsItem[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 24);
  const posts =
    (await fetchJson<WpEntity[]>(
      `/wp-json/wp/v2/posts?per_page=${safeLimit}&page=1&orderby=date&order=desc&_embed=wp:featuredmedia`,
      300
    )) || [];
  return posts.map(item => mapItem(item, 'post'));
}

async function getTerm(kind: 'category' | 'tag', slug: string): Promise<WpTerm | null> {
  const endpoint = kind === 'category' ? 'categories' : 'tags';
  const terms = await fetchJson<WpTerm[]>(
    `/wp-json/wp/v2/${endpoint}?slug=${encodeURIComponent(slug)}&_fields=id,slug,name,description,count`,
    1800
  );
  return terms?.[0] || null;
}

export function parseArchivePath(path: string): { kind: 'category' | 'tag'; slug: string; page: number } | null {
  const parts = normalizePath(path).split('/').filter(Boolean);
  if (!['category', 'tag'].includes(parts[0]) || !parts[1]) return null;
  let page = 1;
  if (parts[2] === 'page' && /^\d+$/.test(parts[3] || '')) page = Math.max(1, Number(parts[3]));
  return { kind: parts[0] as 'category' | 'tag', slug: parts[1], page };
}

export async function getArchive(path: string): Promise<CmsArchive | null> {
  const parsed = parseArchivePath(path);
  if (!parsed) return null;
  const term = await getTerm(parsed.kind, parsed.slug);
  if (!term) return null;
  const filter = parsed.kind === 'category' ? 'categories' : 'tags';
  const posts =
    (await fetchJson<WpEntity[]>(
      `/wp-json/wp/v2/posts?${filter}=${term.id}&per_page=12&page=${parsed.page}&orderby=date&order=desc&_embed=wp:featuredmedia`,
      300
    )) || [];
  return {
    kind: parsed.kind,
    slug: parsed.slug,
    name: plainText(term.name),
    description: plainText(term.description || ''),
    page: parsed.page,
    path: normalizePath(path),
    posts: posts.map(item => mapItem(item, 'post'))
  };
}

function xmlLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/loc>|<loc>\s*([^<]+?)\s*<\/loc>/gi)]
    .map(match => (match[1] || match[2] || '').trim().replace(/&amp;/g, '&'))
    .filter(Boolean);
}

export async function getProductionSitemapPaths(): Promise<string[]> {
  const index = await fetchText(`${PUBLIC_ORIGIN}/sitemap_index.xml`, 3600);
  if (!index) return ['/'];
  const children = xmlLocs(index).filter(url => url.startsWith(PUBLIC_ORIGIN) && url.includes('sitemap'));
  const results = await Promise.allSettled(children.map(url => fetchText(url, 3600)));
  const paths = new Set<string>(['/']);
  for (const result of results) {
    if (result.status !== 'fulfilled' || !result.value) continue;
    for (const loc of xmlLocs(result.value)) {
      try {
        const url = new URL(loc);
        if (url.origin === PUBLIC_ORIGIN && !url.pathname.endsWith('.xml')) paths.add(normalizePath(url.pathname));
      } catch {}
    }
  }
  return [...paths];
}
