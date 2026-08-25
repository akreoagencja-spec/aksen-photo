import { trackGa4Event, trackMetaEvent } from './analytics';

export function trackPrimaryLead(source: 'form') {
  trackGa4Event('form_submit_success', { source });
  trackGa4Event('generate_lead', { source, value: 1, currency: 'PLN' });
  trackMetaEvent('Lead', { source });
}

export function trackPhoneClick(href: string) {
  trackGa4Event('phone_click', { link_url: href });
  trackMetaEvent('Contact', { method: 'phone' });
}

export function trackEmailClick(href: string) {
  trackGa4Event('email_click', { link_url: href });
  trackMetaEvent('Contact', { method: 'email' });
}

export function trackContactPageView(pathname: string) {
  trackGa4Event('contact_page_view', { page_path: pathname });
}

export function trackScroll90(pathname: string) {
  trackGa4Event('scroll_90', { page_path: pathname });
}

export function trackOutboundClick(url: string) {
  trackGa4Event('outbound_click', { link_url: url });
}
