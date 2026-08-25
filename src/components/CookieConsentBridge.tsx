'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { updateGoogleConsent } from '@/lib/analytics';

const cookieYesId = process.env.NEXT_PUBLIC_COOKIEYES_ID || '';

export function CookieConsentBridge() {
  useEffect(() => {
    const onBannerLoad = (event: Event) => {
      const detail = (event as CustomEvent<{ categories?: Record<string, boolean> }>).detail;
      updateGoogleConsent(Boolean(detail?.categories?.analytics), Boolean(detail?.categories?.advertisement));
    };
    const onConsentUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ accepted?: string[] }>).detail;
      const accepted = new Set(detail?.accepted || []);
      updateGoogleConsent(accepted.has('analytics'), accepted.has('advertisement'));
    };
    document.addEventListener('cookieyes_banner_load', onBannerLoad as EventListener);
    document.addEventListener('cookieyes_consent_update', onConsentUpdate as EventListener);
    return () => {
      document.removeEventListener('cookieyes_banner_load', onBannerLoad as EventListener);
      document.removeEventListener('cookieyes_consent_update', onConsentUpdate as EventListener);
    };
  }, []);

  if (!cookieYesId) return null;
  return <Script id="cookieyes" src={`https://cdn-cookieyes.com/client_data/${cookieYesId}/script.js`} strategy="beforeInteractive" />;
}
