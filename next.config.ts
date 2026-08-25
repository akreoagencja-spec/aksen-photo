import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'fotografslubny.szczecin.pl', pathname: '/wp-content/uploads/**' },
      { protocol: 'https', hostname: 'cms.fotografslubny.szczecin.pl', pathname: '/wp-content/uploads/**' },
      { protocol: 'https', hostname: 'aksen-photo.pl', pathname: '/wp-content/uploads/**' }
    ]
  },
  async redirects() {
    return [
      { source: '/wesela', destination: '/oferta', permanent: true },
      { source: '/fotografia-weselna', destination: '/oferta', permanent: true },
      { source: '/portfolio', destination: '/reportaze', permanent: true },
      { source: '/portfolio-slubne-aksen-photo-fotograf-slubny', destination: '/reportaze', permanent: true }
    ];
  }
};

export default nextConfig;
