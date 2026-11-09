'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('assets/js/aksen-analytics.js', 'utf8');

function harness(overrides = {}) {
  const documentEvents = new Map();
  const windowEvents = new Map();
  const calls = [];
  const scripts = [];
  const win = {
    AksenAnalyticsConfig: Object.assign({
      active: true,
      ga4: 'G-TEST123',
      pixel: '2998967330426508',
      adsId: 'AW-123456789',
      adsLabel: 'Lead_label123'
    }, overrides),
    gtag: (...args) => calls.push(args),
    getCkyConsent: () => null,
    addEventListener: (type, fn) => windowEvents.set(type, fn)
  };
  const doc = {
    addEventListener: (type, fn) => documentEvents.set(type, fn),
    createElement: () => ({ async: false, src: '' }),
    getElementsByTagName: () => [],
    head: { appendChild: (el) => scripts.push(el.src) }
  };
  vm.runInNewContext(source, { window: win, document: doc, Date, encodeURIComponent });
  return {
    win, calls, scripts,
    rawDecision(detail) {
      documentEvents.get('cookieyes_consent_update')({ detail });
    },
    decision(analytics, advertisement) {
      const accepted = [];
      const rejected = [];
      for (const [key, yes] of Object.entries({ analytics, advertisement })) {
        (yes ? accepted : rejected).push(key);
      }
      documentEvents.get('cookieyes_consent_update')({ detail: { accepted, rejected } });
    },
    lead(id = 'lead_test_001', extra = {}) {
      windowEvents.get('aksen:event')({ detail: Object.assign({
        event: 'aksen_lead_success',
        form_id: 19,
        service_type: 'usc',
        aksen_event_id: id
      }, extra) });
    },
    phone() {
      windowEvents.get('aksen:event')({ detail: {
        event: 'aksen_contact_click', service_type: 'usc'
      } });
    },
    gaEvents(name) {
      return calls.filter(args => args[0] === 'event' && args[1] === name);
    },
    metaEvents(name) {
      return (win.fbq?.queue || []).map(x => Array.from(x))
        .filter(args => args[0] === 'track' && args[1] === name);
    }
  };
}

test('fails closed before consent and does not backfill an unconsented lead', () => {
  const h = harness();
  h.lead('lead_preconsent_01');
  assert.equal(h.scripts.length, 0);
  assert.equal(h.gaEvents('generate_lead').length, 0);
  h.decision(true, true);
  assert.equal(h.gaEvents('generate_lead').length, 0);
  assert.equal(h.metaEvents('Lead').length, 0);
});

test('analytics-only consent loads GA4 but never Pixel or Ads conversion', () => {
  const h = harness();
  h.decision(true, false);
  h.lead();
  assert.equal(h.scripts.filter(s => s.includes('googletagmanager.com/gtag/js')).length, 1);
  assert.equal(h.scripts.some(s => s.includes('facebook.net')), false);
  assert.equal(h.gaEvents('generate_lead').length, 1);
  assert.equal(h.gaEvents('conversion').length, 0);
});

test('marketing consent sends one Google Ads conversion and one Meta Lead', () => {
  const h = harness();
  h.decision(true, true);
  h.lead('lead_success_001');
  h.lead('lead_success_001');
  assert.equal(h.gaEvents('generate_lead').length, 1);
  assert.equal(h.gaEvents('conversion').length, 1);
  assert.equal(h.metaEvents('Lead').length, 1);
  const conversion = h.gaEvents('conversion')[0][2];
  assert.equal(conversion.transaction_id, 'lead_success_001');
  assert.equal(conversion.send_to, 'AW-123456789/Lead_label123');
});

test('advertising-only consent loads Pixel and Ads but no GA4 events', () => {
  const h = harness();
  h.decision(false, true);
  h.lead('lead_adsonly_002');
  assert.equal(h.gaEvents('generate_lead').length, 0);
  assert.equal(h.gaEvents('conversion').length, 1);
  assert.equal(h.metaEvents('Lead').length, 1);
});

test('revoked consent stops further conversions; call click is not a lead', () => {
  const h = harness();
  h.decision(true, true);
  h.phone();
  assert.equal(h.gaEvents('click_to_call').length, 1);
  assert.equal(h.gaEvents('generate_lead').length, 0);
  assert.equal(h.metaEvents('Lead').length, 0);
  h.decision(false, false);
  h.lead('lead_rejected_003');
  h.phone();
  assert.equal(h.gaEvents('generate_lead').length, 0);
  assert.equal(h.gaEvents('conversion').length, 0);
  assert.equal(h.metaEvents('Lead').length, 0);
  assert.equal(h.gaEvents('click_to_call').length, 1);
});

test('does not load any tags without a reliable CookieYes decision', () => {
  const h = harness();
  h.rawDecision({ accepted: ['analytics'], rejected: [] });
  h.lead('lead_unknown_004');
  assert.equal(h.scripts.length, 0);
  assert.equal(h.gaEvents('generate_lead').length, 0);
});

test('avoids duplicate Meta Pixel initialization if fbq already exists', () => {
  const h = harness();
  const legacy = [];
  h.win.fbq = (...args) => legacy.push(args);
  h.decision(true, true);
  h.lead('lead_legacy_005');
  assert.equal(h.scripts.some(s => s.includes('facebook.net')), false);
  assert.equal(legacy.length, 0);
  assert.equal(h.gaEvents('generate_lead').length, 1);
});

test('does not leak personal data into provider event properties', () => {
  const h = harness();
  h.decision(true, true);
  h.lead('lead_public_006', { email: 'private@example.org', phone: '12345678', message: 'private' });
  const data = JSON.stringify(h.gaEvents('generate_lead'));
  assert.equal(data.includes('private@example.org'), false);
  assert.equal(data.includes('12345678'), false);
  assert.equal(data.includes('private"'), false);
});

test('disabled deployment never loads or subscribes to anything', () => {
  const h = harness({ active: false });
  assert.equal(h.scripts.length, 0);
  assert.equal(h.calls.length, 0);
  assert.equal(h.win.fbq, undefined);
});
