import { writeFile } from 'node:fs/promises';

const source = new URL(process.env.SEO_SOURCE || 'https://aksen-photo.pl').origin;
const sitemapUrl = `${source}/page-sitemap.xml`;
const out = process.env.SEO_PAGE_AUDIT_OUT || 'seo-page-sitemap-audit.json';

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    return await fetch(url, {
      ...options,
      headers: {
        'user-agent': 'AksenPhoto-Page-Sitemap-Audit/1.1',
        ...(options.headers || {})
      },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

function locs(xml) {
  return [...xml.matchAll(/<loc>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/loc>|<loc>\s*([^<]+?)\s*<\/loc>/gi)]
    .map(match => (match[1] || match[2] || '').trim().replace(/&amp;/g, '&'))
    .filter(Boolean);
}

function text(value = '') {
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

function count(html, pattern) {
  return html ? [...html.matchAll(pattern)].length : 0;
}

function extractCanonical(html) {
  const match = html.match(/<link\b[^>]*rel=["'][^"']*canonical[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>|<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["'][^"']*canonical[^"']*["'][^>]*>/i);
  return match ? (match[1] || match[2] || null) : null;
}

function extractMetaRobots(html) {
  const match = html.match(/<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>|<meta\b[^>]*content=["']([^"']+)["'][^>]*name=["']robots["'][^>]*>/i);
  return match ? (match[1] || match[2] || '').toLowerCase() : null;
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? text(match[1]) : null;
}

function detectFunctionalMarkers(html) {
  const lower = html.toLowerCase();
  const known = [
    'wpforms',
    'fluentform',
    'contact-form-7',
    'wpcf7',
    'elementor-form',
    'woocommerce',
    'wspomn',
    'wydarzen',
    'guestbook',
    'event'
  ];
  return known.filter(marker => lower.includes(marker));
}

async function inspect(url) {
  const requested = new URL(url, source);
  try {
    const response = await fetchWithTimeout(requested, {
      redirect: 'manual',
      headers: { accept: 'text/html,*/*;q=0.1' }
    });
    const contentType = response.headers.get('content-type') || '';
    let html = '';
    if (response.status >= 200 && response.status < 300 && contentType.includes('text/html')) {
      html = await response.text();
    }
    const h1 = html
      ? [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(match => text(match[1])).filter(Boolean)
      : [];
    const bodyText = html ? text(html) : '';
    const formCount = count(html, /<form\b/gi);
    const inputCount = count(html, /<(?:input|textarea|select)\b/gi);
    const iframeCount = count(html, /<iframe\b/gi);
    const buttonCount = count(html, /<button\b/gi);
    const functionalMarkers = detectFunctionalMarkers(html);
    return {
      path: requested.pathname,
      status: response.status,
      location: response.headers.get('location'),
      canonical: html ? extractCanonical(html) : null,
      robots: html ? extractMetaRobots(html) : null,
      title: html ? extractTitle(html) : null,
      h1,
      textLength: bodyText.length,
      formCount,
      inputCount,
      iframeCount,
      buttonCount,
      functionalMarkers,
      bodySample: bodyText.slice(0, 1600)
    };
  } catch (error) {
    return {
      path: requested.pathname,
      status: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

const sitemapResponse = await fetchWithTimeout(sitemapUrl, { headers: { accept: 'application/xml,text/xml,*/*;q=0.1' } });
if (!sitemapResponse.ok) throw new Error(`Unable to fetch page sitemap: ${sitemapResponse.status}`);
const xml = await sitemapResponse.text();
const urls = locs(xml).filter(value => {
  try {
    return new URL(value, source).origin === source;
  } catch {
    return false;
  }
});

const checks = [];
for (const url of urls) checks.push(await inspect(url));

const suspicious = checks.filter(check => {
  if (check.status !== 200) return true;
  if (!check.title || !check.canonical) return true;
  if ((check.h1 || []).length !== 1) return true;
  if ((check.textLength || 0) < 600) return true;
  if ((check.formCount || 0) > 0 || (check.inputCount || 0) > 0) return true;
  return false;
});

const functional = checks.filter(check =>
  (check.formCount || 0) > 0 ||
  (check.inputCount || 0) > 0 ||
  (check.iframeCount || 0) > 0 ||
  (check.functionalMarkers || []).length > 0
);

const report = {
  generatedAt: new Date().toISOString(),
  source,
  sitemap: sitemapUrl,
  count: checks.length,
  suspiciousCount: suspicious.length,
  functionalCount: functional.length,
  checks,
  suspicious,
  functional
};

await writeFile(out, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Page sitemap audit: ${checks.length} pages; ${suspicious.length} require review; ${functional.length} have functional markers.`);
for (const check of suspicious) {
  console.log(`${String(check.status).padStart(3)} ${check.path} h1=${check.h1?.length ?? '-'} text=${check.textLength ?? '-'} forms=${check.formCount ?? '-'} inputs=${check.inputCount ?? '-'}`);
  if (check.location) console.log(`    location: ${check.location}`);
  if (check.canonical) console.log(`    canonical: ${check.canonical}`);
  if (check.functionalMarkers?.length) console.log(`    markers: ${check.functionalMarkers.join(', ')}`);
}
console.log(`Report written to: ${out}`);
