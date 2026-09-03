import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getSiteData } from '@/lib/wp';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { CookieConsentBridge } from '@/components/CookieConsentBridge';
import { TrackingEvents } from '@/components/TrackingEvents';
import { INDEXING_ENABLED, SITE_URL } from '@/lib/seo';

const cookieYesId = process.env.NEXT_PUBLIC_COOKIEYES_ID || '';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Fotograf ślubny Szczecin | Aksen Photo', template: '%s | Aksen Photo' },
  description: 'Naturalna fotografia ślubna w Szczecinie. Pełne reportaże ślubne i weselne, Polska i Niemcy.',
  robots: INDEXING_ENABLED
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const data = await getSiteData();

  return (
    <html lang="pl">
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
      </body>
    </html>
  );
}
