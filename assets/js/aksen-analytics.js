/**
 * Aksen Photo — classic, theme-owned analytics (no tracking WP plugins).
 *
 * Privacy:
 * - No GA4, Google Ads or Meta network script before confirmed CookieYes consent.
 * - No PII, raw UTM parameters, cookies, email, name, phone or messages in events.
 * - Consent revocation prevents all later measurement calls.
 * - This code cannot replace an informed consent banner.
 *
 * CookieYes (connected web-app) events:
 *   cookieyes_banner_load / cookieyes_consent_update, or getCkyConsent().
 * If neither is available, analytics FAILS CLOSED (zero third-party requests).
 *
 * Only confirmed AJAX form success = lead conversion.
 * Phone clicks, form starts and form views are engagement events, not leads.
 */
(function (window, document) {
  'use strict';

  const cfg = window.AksenAnalyticsConfig || {};
  if (cfg.active !== true) return;

  const consent = { confirmed: false, analytics: false, advertising: false };
  const seenLeads = new Set();
  let googleLoaded = false;
  let gaConfigured = false;
  let adsConfigured = false;
  let metaLoaded = false;

  function validGtag() {
    return typeof window.gtag === 'function';
  }

  function loadScript(url) {
    const script = document.createElement('script');
    script.async = true;
    script.src = url;
    document.head.appendChild(script);
  }

  function getSnapshot() {
    if (typeof window.getCkyConsent !== 'function') return null;
    try {
      return window.getCkyConsent();
    } catch (_error) {
      return null;
    }
  }

  function acceptedCategories(source) {
    if (!source || typeof source !== 'object') return null;
    if (source.isUserActionCompleted === false) return null;

    if (source.categories && typeof source.categories === 'object') {
      const c = source.categories;
      if (typeof c.analytics !== 'boolean' ||
          typeof c.advertisement !== 'boolean' ||
          source.isUserActionCompleted !== true) {
        return null;
      }
      return { analytics: c.analytics, advertising: c.advertisement };
    }

    // CookieYes update events may expose accepted/rejected category arrays.
    // Both categories must be explicitly present to avoid guessing consent.
    if (Array.isArray(source.accepted) && Array.isArray(source.rejected)) {
      const decisions = source.accepted.concat(source.rejected);
      if (!decisions.includes('analytics') || !decisions.includes('advertisement')) {
        return null;
      }
      return {
        analytics: source.accepted.includes('analytics'),
        advertising: source.accepted.includes('advertisement')
      };
    }
    return null;
  }

  function updateGoogleConsent() {
    if (!validGtag()) return;
    window.gtag('consent', 'update', {
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      ad_storage: consent.advertising ? 'granted' : 'denied',
      ad_user_data: consent.advertising ? 'granted' : 'denied',
      ad_personalization: consent.advertising ? 'granted' : 'denied'
    });
  }

  function prepareGoogle() {
    if (!validGtag()) return;
    const id = consent.analytics && cfg.ga4
      ? cfg.ga4
      : (consent.advertising && cfg.adsId && cfg.adsLabel ? cfg.adsId : '');
    if (!id) return;
    if (!googleLoaded) {
      googleLoaded = true;
      window.gtag('js', new Date());
      loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id));
    }
    if (consent.analytics && cfg.ga4 && !gaConfigured) {
      gaConfigured = true;
      window.gtag('config', cfg.ga4, { send_page_view: true });
    }
    if (consent.advertising && cfg.adsId && cfg.adsLabel && !adsConfigured) {
      adsConfigured = true;
      window.gtag('config', cfg.adsId, { send_page_view: false });
    }
  }

  function prepareMeta() {
    if (!cfg.pixel) return;
    if (!consent.advertising) {
      if (metaLoaded && typeof window.fbq === 'function') {
        window.fbq('consent', 'revoke');
      }
      return;
    }

    if (metaLoaded) {
      window.fbq('consent', 'grant');
      return;
    }

    // If another integration already owns Meta Pixel, never initialize or
    // send a second PageView. This must be resolved before launch.
    if (typeof window.fbq === 'function') return;

    // Official-style Meta Pixel queue, created only after advertising consent.
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      if (s && s.parentNode) s.parentNode.insertBefore(t, s);
      else b.head.appendChild(t);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    if (typeof window.fbq === 'function') {
      metaLoaded = true;
      window.fbq('consent', 'grant');
      window.fbq('init', cfg.pixel);
      window.fbq('track', 'PageView');
    }
  }

  function applyConsent(snapshot) {
    // Unknown or not-yet-saved choices do not grant permission.
    const next = acceptedCategories(snapshot);
    if (!next) return;

    consent.confirmed = true;
    consent.analytics = next.analytics;
    consent.advertising = next.advertising;
    updateGoogleConsent();
    prepareGoogle();
    prepareMeta();
  }

  function onCookieYes(event) {
    // Live decision is authoritative; the saved API snapshot can lag a tick
    // behind a user clicking Save Preferences.
    if (event && acceptedCategories(event.detail)) {
      applyConsent(event.detail);
      return;
    }
    const snapshot = getSnapshot();
    if (snapshot) applyConsent(snapshot);
  }

  document.addEventListener('cookieyes_banner_load', onCookieYes);
  document.addEventListener('cookieyes_consent_update', onCookieYes);

  // Handle a visitor returning with saved consent. Never infer consent
  // from the presence/absence of a cookie or a user-agent setting.
  onCookieYes();

  function safeWord(value) {
    return String(value || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  }

  function cleanEvent(detail) {
    const id = String(detail.aksen_event_id || '');
    return {
      service_type: safeWord(detail.service_type),
      form_id: Math.max(0, Number(detail.form_id) || 0),
      event_id: /^[a-zA-Z0-9_-]{8,96}$/.test(id) ? id : ''
    };
  }

  function sendLead(detail) {
    const event = cleanEvent(detail);
    if (!event.event_id || seenLeads.has(event.event_id)) return;
    // Don't queue conversions that were submitted before consent.
    seenLeads.add(event.event_id);

    if (consent.analytics && gaConfigured && validGtag()) {
      window.gtag('event', 'generate_lead', {
        method: 'form',
        service_type: event.service_type,
        form_id: event.form_id,
        event_id: event.event_id
      });
    }
    if (consent.advertising && adsConfigured && cfg.adsId && cfg.adsLabel && validGtag()) {
      window.gtag('event', 'conversion', {
        send_to: cfg.adsId + '/' + cfg.adsLabel,
        transaction_id: event.event_id
      });
    }
    if (consent.advertising && metaLoaded && typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', {
        content_category: event.service_type
      }, { eventID: event.event_id });
    }
  }

  function onTrackingEvent(event) {
    const detail = event && event.detail;
    if (!detail || typeof detail !== 'object') return;
    switch (detail.event) {
      case 'aksen_lead_success':
        sendLead(detail);
        break;
      case 'aksen_contact_click':
        // Do not classify a tap-to-call click as a completed phone call.
        if (consent.analytics && gaConfigured && validGtag()) {
          window.gtag('event', 'click_to_call', {
            method: 'phone_link',
            service_type: safeWord(detail.service_type)
          });
        }
        break;
      case 'aksen_form_start':
        if (consent.analytics && gaConfigured && validGtag()) {
          window.gtag('event', 'form_start', {
            service_type: safeWord(detail.service_type),
            form_id: Math.max(0, Number(detail.form_id) || 0)
          });
        }
        break;
      // aksen_form_view is an internal UX signal, not sent to ad platforms.
      default:
        break;
    }
  }

  window.addEventListener('aksen:event', onTrackingEvent);
})(window, document);
