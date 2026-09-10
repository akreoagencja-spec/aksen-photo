import type { NextConfig } from 'next';

const wordpressUrl = (process.env.WORDPRESS_URL || 'https://aksen-photo.pl').replace(/\/+$/, '');
const publicHosts = new Set(['aksen-photo.pl', 'www.aksen-photo.pl']);
const indexingEnabled = process.env.ALLOW_INDEXING === 'true';

function externalCmsOrigin() {
  try {
    const url = new URL(wordpressUrl);
    return publicHosts.has(url.hostname) ? '' : url.origin;
  } catch {
    return '';
  }
}

if (indexingEnabled && !externalCmsOrigin()) {
  throw new Error('Production indexing requires WORDPRESS_URL to point to a separate CMS origin before DNS cutover.');
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'aksen-photo.pl', pathname: '/wp-content/uploads/**' },
      { protocol: 'https', hostname: 'www.aksen-photo.pl', pathname: '/wp-content/uploads/**' },
      { protocol: 'https', hostname: 'cms.aksen-photo.pl', pathname: '/wp-content/uploads/**' },
      { protocol: 'https', hostname: 'fotografslubny.szczecin.pl', pathname: '/wp-content/uploads/**' },
      { protocol: 'https', hostname: 'cms.fotografslubny.szczecin.pl', pathname: '/wp-content/uploads/**' }
    ]
  },
  async redirects() {
    return [
      { source: '/blog', destination: '/blog-fotograficzny/', permanent: true },
      { source: '/o-mnie', destination: '/o-mnie-fotograf-szczecin/', permanent: true },
      { source: '/kontakt', destination: '/kontakt-fotograf-szczecin-aksen-photo/', permanent: true },
      { source: '/oferta', destination: '/#wybierz-fotografie', permanent: true },
      { source: '/reportaze', destination: '/portfolio-slubne-aksen-photo-fotograf-slubny/', permanent: true },
      { source: '/reportaze/:slug', destination: '/:slug/', permanent: true },
      { source: '/poradnik', destination: '/blog-fotograficzny/', permanent: true },
      { source: '/poradnik/:slug', destination: '/:slug/', permanent: true },
      { source: '/opinie', destination: '/o-mnie-fotograf-szczecin/#opinie', permanent: true },
      { source: '/rezerwacja', destination: '/kontakt-fotograf-szczecin-aksen-photo/', permanent: true },
      { source: '/polityka-prywatnosci', destination: '/polityka-prywatnosci-plikow-cookies-fotografa/', permanent: true },
      { source: '/post_grid/reportaz-slubny', destination: '/category/reportaz-slubny/', permanent: true },
      { source: '/elementor-hf/:path*', destination: '/', permanent: true }
    ];
  },
  async rewrites() {
    const cms = externalCmsOrigin();
    if (!cms) return [];
    return [{ source: '/wp-content/uploads/:path*', destination: `${cms}/wp-content/uploads/:path*` }];
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
      ]
    }];
  }
};

export default nextConfig;
