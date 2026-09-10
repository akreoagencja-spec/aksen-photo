import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/v2/SiteHeader';
import { SiteFooter } from '@/components/v2/SiteFooter';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { CookieConsentBridge } from '@/components/CookieConsentBridge';
import { TrackingEvents } from '@/components/TrackingEvents';
import { siteV2 } from '@/lib/site-v2';

const indexingEnabled = process.env.ALLOW_INDEXING === 'true';

export const metadata: Metadata = {
  metadataBase: new URL(siteV2.url),
  title: { default: siteV2.seo.title, template: `%s | ${siteV2.name}` },
  description: siteV2.seo.description,
  robots: indexingEnabled
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
  icons: {
    icon: siteV2.favicon,
    apple: siteV2.favicon
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f3f5f7'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl-PL">
      <body>
        <CookieConsentBridge />
        <AnalyticsProvider />
        <TrackingEvents />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
