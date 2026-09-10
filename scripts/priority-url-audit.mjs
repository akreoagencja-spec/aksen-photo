import { writeFile } from 'node:fs/promises';

const source = new URL(process.env.SEO_SOURCE || 'https://aksen-photo.pl').origin;
const out = process.env.SEO_PRIORITY_OUT || 'seo-priority-audit.json';
const paths = [
  '/post_grid/reportaz-slubny/',
  '/elementor-hf/naglowek-menu-aksen-photo-fotograf-szczecin/',
  '/elementor-hf/stopka-aksen-photo-fotograf-szczecin/',
  '/portfolio-slubne-aksen-photo-fotograf-slubny/',
  '/category/reportaz-slubny/',
  '/blog-fotograficzny/',
  '/kontakt-fotograf-szczecin-aksen-photo/'
];

function textContent(value = '') {
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

function extract(html, regex) {
  const match = html.match(regex);
  return match ? textContent(match[1] || match[2] || '') : null;
}

function canonical(html) {
  const match = html.match(/<link\b[^>]*rel=["'][^"']*canonical[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>|<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["'][^"']*canonical[^"']*["'][^>]*>/i);
  return match ? (match[1] || match[2] || null) : null;
}

async function inspect(path) {
  const url = new URL(path, source).toString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      redirect: 'manual',
      headers: { 'user-agent': 'AksenPhoto-Priority-URL-Audit/1.0', accept: 'text/html,*/*;q=0.1' },
      signal: controller.signal
    });
    const contentType = response.headers.get('content-type') || '';
    let html = '';
    if (response.status >= 200 && response.status < 300 && contentType.includes('text/html')) {
      html = await response.text();
    }
    const h1 = html ? [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(match => textContent(match[1])).filter(Boolean) : [];
    return {
      path,
      url,
      status: response.status,
      location: response.headers.get('location'),
      contentType,
      canonical: html ? canonical(html) : null,
      robots: html ? extract(html, /<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>|<meta\b[^>]*content=["']([^"']+)["'][^>]*name=["']robots["'][^>]*>/i) : null,
      title: html ? extract(html, /<title[^>]*>([\s\S]*?)<\/title>/i) : null,
      h1,
      bodySample: html ? textContent(html).slice(0, 1200) : null
    };
  } catch (error) {
    return { path, url, status: 0, error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timeout);
  }
}

const checks = [];
for (const path of paths) checks.push(await inspect(path));

const report = { generatedAt: new Date().toISOString(), source, checks };
await writeFile(out, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

for (const check of checks) {
  console.log(`${String(check.status).padStart(3)} ${check.path}`);
  if (check.location) console.log(`    location: ${check.location}`);
  if (check.canonical) console.log(`    canonical: ${check.canonical}`);
  if (check.title) console.log(`    title: ${check.title}`);
  if (Array.isArray(check.h1)) console.log(`    h1: ${check.h1.length}`);
}
console.log(`Report written to: ${out}`);
