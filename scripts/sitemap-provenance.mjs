import { writeFile } from 'node:fs/promises';

const source = new URL(process.env.SEO_SOURCE || 'https://aksen-photo.pl').origin;
const out = process.env.SEO_PROVENANCE_OUT || 'seo-sitemap-provenance.json';

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      headers: { 'user-agent': 'AksenPhoto-Sitemap-Audit/1.0', accept: 'application/xml,text/xml;q=0.9,*/*;q=0.1' },
      redirect: 'follow',
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function locs(xml) {
  return [...xml.matchAll(/<loc>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/loc>|<loc>\s*([^<]+?)\s*<\/loc>/gi)]
    .map(match => (match[1] || match[2] || '').trim().replace(/&amp;/g, '&'))
    .filter(Boolean);
}

function normalizePath(value) {
  const url = new URL(value, source);
  const path = url.pathname.replace(/\/{2,}/g, '/');
  return path === '/' ? '/' : `${path.replace(/\/+$/, '')}/`;
}

const indexUrl = `${source}/sitemap_index.xml`;
const indexXml = await fetchText(indexUrl);
const sitemapUrls = locs(indexXml).filter(value => {
  try {
    const url = new URL(value, source);
    return url.origin === source && /\.xml(?:$|\?)/i.test(url.pathname);
  } catch {
    return false;
  }
});

if (!sitemapUrls.length) throw new Error('No child sitemaps found in sitemap_index.xml');

const groups = [];
const all = new Map();

for (const sitemapUrl of sitemapUrls) {
  const xml = await fetchText(sitemapUrl);
  const paths = locs(xml)
    .map(value => {
      try {
        const url = new URL(value, source);
        if (url.origin !== source || /\.xml(?:$|\?)/i.test(url.pathname)) return null;
        return normalizePath(url.toString());
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const uniquePaths = [...new Set(paths)].sort();
  groups.push({ sitemap: sitemapUrl, count: uniquePaths.length, paths: uniquePaths });

  for (const path of uniquePaths) {
    const owners = all.get(path) || [];
    owners.push(sitemapUrl);
    all.set(path, owners);
  }
}

const duplicates = [...all.entries()]
  .filter(([, owners]) => owners.length > 1)
  .map(([path, owners]) => ({ path, sitemaps: owners }));

const report = {
  generatedAt: new Date().toISOString(),
  source,
  index: indexUrl,
  sitemapCount: groups.length,
  uniqueUrlCount: all.size,
  groups,
  duplicateCount: duplicates.length,
  duplicates
};

await writeFile(out, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Sitemap provenance: ${report.uniqueUrlCount} unique URLs across ${report.sitemapCount} sitemaps.`);
for (const group of groups) console.log(`${group.count.toString().padStart(4)}  ${group.sitemap}`);
console.log(`Report written to: ${out}`);
