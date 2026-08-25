'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { GA4_ID } from '@/lib/analytics';
import { initializeMetaPixel } from '@/lib/meta';

export function AnalyticsProvider() {
  const [adsConsent, setAdsConsent] = useState(false);

  useEffect(() => {
    const onBannerLoad = (event: Event) => {
      const detail = (event as CustomEvent<{ categories?: Record<string, boolean> }>).detail;
      setAdsConsent(Boolean(detail?.categories?.advertisement));
    };
    const onConsentUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ accepted?: string[] }>).detail;
      setAdsConsent(Boolean(detail?.accepted?.includes('advertisement')));
    };
    document.addEventListener('cookieyes_banner_load', onBannerLoad as EventListener);
    document.addEventListener('cookieyes_consent_update', onConsentUpdate as EventListener);
    return () => {
      document.removeEventListener('cookieyes_banner_load', onBannerLoad as EventListener);
      document.removeEventListener('cookieyes_consent_update', onConsentUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    if (adsConsent) initializeMetaPixel();
  }, [adsConsent]);

  return <>
    <Script id="google-consent-default" strategy="beforeInteractive">{`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('consent','default',{
        ad_storage:'denied',
        ad_user_data:'denied',
        ad_personalization:'denied',
        analytics_storage:'denied',
        wait_for_update:500
      });
    `}</Script>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
    <Script id="ga4-config" strategy="afterInteractive">{`
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function(){dataLayer.push(arguments);};
      gtag('js', new Date());
      gtag('config','${GA4_ID}', { send_page_view: true });
    `}</Script>
    {adsConsent && <Script id="meta-pixel-loader" src="https://connect.facebook.net/en_US/fbevents.js" strategy="afterInteractive" />}
  </>;
}
