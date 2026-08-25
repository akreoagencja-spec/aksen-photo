export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || 'G-PQFD3M4VTP';
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '2998967330426508';

export type TrackingEventName =
  | 'phone_call'
  | 'phone_click'
  | 'email_click'
  | 'form_submit_success'
  | 'generate_lead'
  | 'contact_page_view'
  | 'scroll_90'
  | 'outbound_click';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackGa4Event(name: TrackingEventName, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

export function trackMetaEvent(name: 'Lead' | 'Contact' | 'ViewContent', params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  window.fbq('track', name, params);
}

export function updateGoogleConsent(analytics: boolean, advertisement: boolean) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('consent', 'update', {
    analytics_storage: analytics ? 'granted' : 'denied',
    ad_storage: advertisement ? 'granted' : 'denied',
    ad_user_data: advertisement ? 'granted' : 'denied',
    ad_personalization: advertisement ? 'granted' : 'denied'
  });
}
