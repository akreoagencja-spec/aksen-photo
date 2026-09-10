import type { NextConfig } from 'next';

const wordpressUrl = (process.env.WORDPRESS_URL || '').replace(/\/+$/, '');
const productionHosts = new Set(['aksen-photo.pl', 'www.aksen-photo.pl']);
const indexingEnabled = process.env.ALLOW_INDEXING === 'true';

function externalCmsUrl() {
  if (!wordpressUrl) return '';
  try {
    const url = new URL(wordpressUrl);
    return productionHosts.has(url.hostname) ? '' : url.toString().replace(/\/+$/, '');
  } catch {
    return '';
  }
}

if (indexingEnabled && !externalCmsUrl()) {
  throw new Error('Production indexing requires WORDPRESS_URL on a separate CMS origin.');
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
      {
        source: '/elementor-hf/:path*',
        destination: '/',
        permanent: true
      }
    ];
  },
  async rewrites() {
    const cms = externalCmsUrl();
    if (!cms) return [];
    return [
      {
        source: '/wp-content/uploads/:path*',
        destination: `${cms}/wp-content/uploads/:path*`
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
        ]
      }
    ];
  }
};

export default nextConfig;
