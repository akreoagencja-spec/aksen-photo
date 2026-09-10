import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import './liquid-glass.css';
import './mobile-polish.css';
import './mobile-final.css';
import './mobile-ios26.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileDock } from '@/components/MobileDock';
import { getSiteData } from '@/lib/wp';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { CookieConsentBridge } from '@/components/CookieConsentBridge';
import { TrackingEvents } from '@/components/TrackingEvents';
import { INDEXING_ENABLED, SITE_URL } from '@/lib/seo';
import { originalSite } from '@/lib/original-site';

const cookieYesId = process.env.NEXT_PUBLIC_COOKIEYES_ID || '';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f4f7fb'
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: originalSite.homeSeo.title, template: '%s | Aksen Photo' },
  description: originalSite.homeSeo.description,
  icons: {
    icon: [{ url: originalSite.favicon }],
    apple: [{ url: originalSite.favicon }]
  },
  verification: {
    other: {
      'msvalidate.01': ['FEF3D52C23EFF96CF0AE0C50FE58AA0E']
    }
  },
  robots: INDEXING_ENABLED
    ? { index: true, follow: true, 'max-image-preview': 'large' }
    : { index: false, follow: false, nocache: true }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const data = await getSiteData();

  return (
    <html lang="pl-PL">
      <head>
        <Script id="google-consent-default" strategy="beforeInteractive">{`
          window.dataLayer = window.dataLayer || [];
          window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
          window.gtag('consent','default',{
            ad_storage:'denied',
            ad_user_data:'denied',
            ad_personalization:'denied',
            analytics_storage:'denied',
            wait_for_update:500
          });
        `}</Script>
        {cookieYesId && (
          <Script
            id="cookieyes"
            src={`https://cdn-cookieyes.com/client_data/${cookieYesId}/script.js`}
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body>
        <CookieConsentBridge />
        <AnalyticsProvider />
        <TrackingEvents />
        <Header />
        {children}
        <Footer phone={data.brand.phone} email={data.brand.email} />
        <MobileDock />
      </body>
    </html>
  );
}
