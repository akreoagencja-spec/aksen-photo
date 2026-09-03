import type { Metadata } from 'next';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://aksen-photo.pl').replace(/\/+$/, '');
export const INDEXING_ENABLED = process.env.ALLOW_INDEXING === 'true';

export function metadata(title: string, description: string, path = '/', image?: string): Metadata {
  const url = new URL(path, `${SITE_URL}/`).toString();

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: INDEXING_ENABLED
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      siteName: 'Aksen Photo',
      images: image ? [{ url: image }] : undefined,
      locale: 'pl_PL'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined
    }
  };
}
