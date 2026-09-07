import type { Metadata } from 'next';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://aksen-photo.pl').replace(/\/+$/, '');
export const INDEXING_ENABLED = process.env.ALLOW_INDEXING === 'true';

type MetadataOverrides = {
  canonical?: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
  openGraphImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
};

function canonicalUrl(path: string, candidate?: string) {
  const fallback = new URL(path, `${SITE_URL}/`).toString();
  if (!candidate) return fallback;

  try {
    const parsed = new URL(candidate, `${SITE_URL}/`);
    const siteHost = new URL(SITE_URL).hostname.replace(/^www\./, '');
    const candidateHost = parsed.hostname.replace(/^www\./, '');
    if (candidateHost !== siteHost) return fallback;
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return fallback;
    return parsed.toString();
  } catch {
    return fallback;
  }
}

export function metadata(
  title: string,
  description: string,
  path = '/',
  image?: string,
  overrides: MetadataOverrides = {}
): Metadata {
  const url = canonicalUrl(path, overrides.canonical);
  const ogTitle = overrides.openGraphTitle || title;
  const ogDescription = overrides.openGraphDescription || description;
  const ogImage = overrides.openGraphImage || image;
  const twitterTitle = overrides.twitterTitle || ogTitle;
  const twitterDescription = overrides.twitterDescription || ogDescription;
  const twitterImage = overrides.twitterImage || ogImage;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: INDEXING_ENABLED
      ? {
          index: overrides.robots?.index ?? true,
          follow: overrides.robots?.follow ?? true,
          'max-image-preview': 'large'
        }
      : { index: false, follow: false, nocache: true },
    openGraph: {
      type: 'website',
      title: ogTitle,
      description: ogDescription,
      url,
      siteName: 'Aksen Photo',
      images: ogImage ? [{ url: ogImage }] : undefined,
      locale: 'pl_PL'
    },
    twitter: {
      card: 'summary_large_image',
      title: twitterTitle,
      description: twitterDescription,
      images: twitterImage ? [twitterImage] : undefined
    }
  };
}
