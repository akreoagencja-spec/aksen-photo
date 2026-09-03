import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
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
