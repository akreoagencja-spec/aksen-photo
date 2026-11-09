/**
 * Aksen Photo – client-side lead funnel for Fluent Forms.
 *
 * Emits LOCAL CustomEvents ONLY. Does not initialize GA4/Google Ads/Meta or
 * store marketing cookies. The in-theme analytics module owns routing to
 * vendors AFTER CookieYes consent. No GTM container or WP tracking plugin.
 *
 * Event contract:
 *   aksen_form_view     -> impression, NOT a conversion
 *   aksen_form_start    -> first interaction, NOT a conversion
 *   aksen_lead_success  -> confirmed Fluent Forms AJAX success, ONE conversion
 *   aksen_contact_click -> call-to-action click, NOT a conversion
 *
 * No PII (name, phone, email, message) is ever placed in dataLayer.
 */
(function (window, document) {
  'use strict';

  const config = window.AksenLeadConfig || {};
  const emittedLeads = new Set();
  const viewEvents = new WeakSet();
  const startEvents = new WeakSet();
  const formSelector = 'form.frm-fluent-form';
  const campaignKeys = Object.freeze([
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'
  ]);

  function currentFormService(form) {
    const section = form.closest('[data-aksen-service]');
    if (section && section.dataset.aksenService) {
      return section.dataset.aksenService;
    }
    const id = Number(form.getAttribute('data-form_id') || 0);
    const map = config.formIds || {};
    for (const key of Object.keys(map)) {
      if (Number(map[key]) === id) return key;
    }
    return String(config.service || 'contact');
  }

  function formId(form) {
    return Number(form.getAttribute('data-form_id') || 0);
  }

  function eventId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    // Random fallback for older browsers. No user identifier is used.
    const bytes = new Uint8Array(16);
    if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
      window.crypto.getRandomValues(bytes);
      return Array.from(bytes, n => n.toString(16).padStart(2, '0')).join('');
    }
    return 'lead-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  }

  function cleanValue(value) {
    return String(value || '').replace(/[<>\u0000-\u001f]/g, '').slice(0, 120);
  }

  function campaign() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const key of campaignKeys) {
      const value = params.get(key);
      if (value) result[key] = cleanValue(value);
    }
    return result;
  }

  /**
   * Only publish a local, first-party DOM event.
   * This is not a Google or Meta tag and does not transfer any personal data.
   * Analytics destinations are controlled separately by the in-theme module.
   */
  function push(name, form, extra) {
    const payload = Object.assign({
      event: name,
      form_id: formId(form),
      service_type: currentFormService(form),
      page_path: window.location.pathname,
      lead_source: 'website'
    }, extra || {});
    window.dispatchEvent(new window.CustomEvent('aksen:event', { detail: payload }));
    // Disabled by default to prevent legacy GTM containers from firing twice.
    if (config.mirrorDataLayer === true) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(payload);
    }
  }

  function writeHidden(form, name, value) {
    const input = form.querySelector('input[name="' + name + '"]');
    if (input && input.type === 'hidden') {
      input.value = cleanValue(value);
    }
  }

  function prepare(form) {
    if (!form || !form.matches(formSelector)) return;
    writeHidden(form, 'ak_service', currentFormService(form));
    writeHidden(form, 'ak_page', window.location.pathname);
    const campaignValues = campaign();
    for (const key of campaignKeys) {
      writeHidden(form, key, campaignValues[key] || '');
    }
    const eventField = form.querySelector('input[name="ak_lead_event_id"]');
    if (eventField && !eventField.value) eventField.value = eventId();
  }

  function begin(form) {
    if (startEvents.has(form)) return;
    startEvents.add(form);
    prepare(form);
    push('aksen_form_start', form);
  }

  function initializeForm(form) {
    if (form.dataset.aksenTracked === '1') return;
    form.dataset.aksenTracked = '1';
    prepare(form);
    form.addEventListener('focusin', function () { begin(form); }, { once: true });
    // Capture phase: fill metadata before Fluent Forms serializes form data.
    form.addEventListener('submit', function () {
      if (form.dataset.aksenCompleted === '1') {
        // New attempt after a prior success gets a fresh dedupe key.
        const old = form.querySelector('input[name="ak_lead_event_id"]');
        if (old) old.value = '';
        form.dataset.aksenCompleted = '0';
      }
      prepare(form);
    }, true);
  }

  function onSuccess(payload) {
    const candidate = payload && payload.form;
    let form = candidate && (candidate.jquery ? candidate[0] : candidate);
    if (!form || !form.matches || !form.matches(formSelector)) {
      // Never guess which form succeeded if the event payload is ambiguous.
      return;
    }
    prepare(form);
    const hidden = form.querySelector('input[name="ak_lead_event_id"]');
    const id = hidden && hidden.value ? hidden.value : eventId();
    if (emittedLeads.has(id)) return;
    emittedLeads.add(id);
    push('aksen_lead_success', form, {
      aksen_event_id: id,
      lead_type: 'enquiry',
      value_type: 'unvalued'
    });
    // Keep the last key to dedupe duplicate success callbacks.
    form.dataset.aksenCompleted = '1';
  }

  function init() {
    const forms = Array.from(document.querySelectorAll(formSelector));
    forms.forEach(initializeForm);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || viewEvents.has(entry.target)) return;
          viewEvents.add(entry.target);
          push('aksen_form_view', entry.target);
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.2 });
      forms.forEach(form => observer.observe(form));
    } else {
      forms.forEach(function (form) {
        if (!viewEvents.has(form)) {
          viewEvents.add(form);
          push('aksen_form_view', form);
        }
      });
    }
  }

  // Fluent Forms officially emits this event only after a successful AJAX
  // response. Do not use click or the native form submit event as a conversion.
  if (window.jQuery) {
    window.jQuery(document.body).on('fluentform_submission_success', function (_event, payload) {
      onSuccess(payload);
    });
  }

  document.addEventListener('click', function (event) {
    const link = event.target.closest && event.target.closest('a[href^="tel:"]');
    if (!link) return;
    window.dispatchEvent(new window.CustomEvent('aksen:event', {
      detail: {
        event: 'aksen_contact_click',
        action: 'phone',
        service_type: String(config.service || 'sitewide'),
        page_path: window.location.pathname
      }
    }));
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(window, document);