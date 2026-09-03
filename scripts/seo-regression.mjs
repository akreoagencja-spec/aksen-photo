import { writeFile } from 'node:fs/promises';

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const token = process.argv[index];
  if (!token.startsWith('--')) continue;

  const raw = token.slice(2);
  const separator = raw.indexOf('=');
  if (separator >= 0) {
    args.set(raw.slice(0, separator), raw.slice(separator + 1));
    continue;
  }

  const next = process.argv[index + 1];
  if (next && !next.startsWith('--')) {
    args.set(raw, next);
    index += 1;
  } else {
    args.set(raw, true);
  }
}

const source = new URL(String(args.get('source') || 'https://aksen-photo.pl')).origin;
const targetArg = args.get('target');
const target = targetArg ? new URL(String(targetArg)).origin : null;
const out = String(args.get('out') || 'seo-regression.json');
const inventoryOnly = args.has('inventory-only') || !target;

function normalizePath(input) {
  const pathname = new URL(input, source).pathname.replace(/\/{2,}/g, '/');
  if (pathname === '/') return '/';
  return `${pathname.replace(/\/+$/, '')}/`;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    return await fetch(url, {
      ...options,
      headers: { 'user-agent': 'AksenPhoto-SEO-Regression/1.0', ...(options.headers || {}) },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/loc>|<loc>\s*([^<]+?)\s*<\/loc>/gi)]
    .map(match => (match[1] || match[2] || '').trim())
    .filter(Boolean)
    .map(value => value.replace(/&amp;/g, '&'));
}

async function discoverFromSitemap() {
  const candidateRoots = [`${source}/sitemap_index.xml`, `${source}/wp-sitemap.xml`];
  const visitedSitemaps = new Set();
  const urls = new Set();

  async function crawl(sitemapUrl, depth = 0) {
    if (depth > 4 || visitedSitemaps.has(sitemapUrl)) return;
    visitedSitemaps.add(sitemapUrl);

    let response;
    try {
      response = await fetchWithTimeout(sitemapUrl, { redirect: 'follow' });
    } catch {
      return;
    }
    if (!response.ok) return;

    const xml = await response.text();
    const locs = extractLocs(xml);
    const isIndex = /<sitemapindex\b/i.test(xml);

    for (const loc of locs) {
      let parsed;
      try {
        parsed = new URL(loc, source);
      } catch {
        continue;
      }
      if (parsed.origin !== source) continue;
      if (isIndex || /\.xml(?:$|\?)/i.test(parsed.pathname)) {
        await crawl(parsed.toString(), depth + 1);
      } else {
        urls.add(normalizePath(parsed.toString()));
      }
    }
  }

  for (const root of candidateRoots) await crawl(root);
  return { urls, sitemaps: [...visitedSitemaps] };
}

async function discoverFromWordPressRest() {
  const urls = new Set(['/']);

  for (const endpoint of ['posts', 'pages']) {
    for (let page = 1; page <= 30; page += 1) {
      const url = `${source}/wp-json/wp/v2/${endpoint}?page=${page}&per_page=100&_fields=link`;
      let response;
      try {
        response = await fetchWithTimeout(url);
      } catch {
        break;
      }
      if (!response.ok) break;
      const items = await response.json();
      if (!Array.isArray(items) || items.length === 0) break;
      for (const item of items) {
        if (item?.link) urls.add(normalizePath(item.link));
      }
      if (items.length < 100) break;
    }
  }

  return urls;
}

function extractCanonical(html) {
  const match = html.match(/<link\b[^>]*rel=["'][^"']*canonical[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>|<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["'][^"']*canonical[^"']*["'][^>]*>/i);
  return match ? (match[1] || match[2] || null) : null;
}

function extractRobots(html) {
  const match = html.match(/<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>|<meta\b[^>]*content=["']([^"']+)["'][^>]*name=["']robots["'][^>]*>/i);
  return match ? (match[1] || match[2] || '').toLowerCase() : null;
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/\s+/g, ' ').trim() : null;
}

async function inspectTarget(path) {
  const url = new URL(path, target).toString();
  try {
    const response = await fetchWithTimeout(url, { redirect: 'manual' });
    const location = response.headers.get('location');
    let canonical = null;
    let robots = null;
    let title = null;

    if (response.status >= 200 && response.status < 300) {
      const type = response.headers.get('content-type') || '';
      if (type.includes('text/html')) {
        const html = await response.text();
        canonical = extractCanonical(html);
        robots = extractRobots(html);
        title = extractTitle(html);
      }
    }

    return { path, status: response.status, location, canonical, robots, title };
  } catch (error) {
    return { path, status: 0, error: error instanceof Error ? error.message : String(error) };
  }
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

const sitemapDiscovery = await discoverFromSitemap();
const restUrls = sitemapDiscovery.urls.size ? new Set() : await discoverFromWordPressRest();
const paths = [...(sitemapDiscovery.urls.size ? sitemapDiscovery.urls : restUrls)].sort();

const report = {
  generatedAt: new Date().toISOString(),
  source,
  target,
  discovery: sitemapDiscovery.urls.size ? 'sitemap' : 'wordpress-rest',
  sitemaps: sitemapDiscovery.sitemaps,
  urlCount: paths.length,
  paths,
  checks: [],
  failures: []
};

if (!inventoryOnly) {
  report.checks = await mapLimit(paths, 8, inspectTarget);
  report.failures = report.checks.filter(check => {
    if (check.status === 0 || check.status === 404 || check.status >= 500) return true;
    if (check.status >= 300 && check.status < 400 && !check.location) return true;
    return false;
  });
}

await writeFile(out, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`SEO inventory: ${report.urlCount} URLs from ${report.discovery}.`);
console.log(`SEO report written to: ${out}`);
if (!inventoryOnly) {
  console.log(`SEO regression failures: ${report.failures.length}.`);
  if (report.failures.length > 0) process.exitCode = 1;
}
