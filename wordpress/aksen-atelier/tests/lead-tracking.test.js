'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(__dirname + '/../assets/js/aksen-lead-tracking.js', 'utf8');
const attrs = {
  ak_service: { type: 'hidden', value: '' },
  ak_page: { type: 'hidden', value: '' },
  ak_lead_event_id: { type: 'hidden', value: '' },
  utm_source: { type: 'hidden', value: '' },
  utm_medium: { type: 'hidden', value: '' },
  utm_campaign: { type: 'hidden', value: '' },
  utm_content: { type: 'hidden', value: '' },
  utm_term: { type: 'hidden', value: '' },
};
let count = 0;
let callback;
const fakeForm = {
  dataset: {},
  getAttribute: key => key === 'data-form_id' ? '9' : null,
  matches: key => key === 'form.frm-fluent-form',
  closest: key => key === '[data-aksen-service]' ? { dataset: { aksenService: 'wedding' } } : null,
  querySelector: query => {
    const match = query.match(/input\[name="([^"]+)"\]/);
    return match ? attrs[match[1]] : null;
  },
  addEventListener: function (name, handler) { this['handle_' + name] = handler; }
};
const document = {
  body: {},
  readyState: 'complete',
  querySelectorAll: selector => selector === 'form.frm-fluent-form' ? [fakeForm] : [],
  addEventListener: () => {}
};
const window = {
  location: { pathname: '/portfolio-slubne-aksen-photo-fotograf-slubny/', search: '?utm_source=google&utm_campaign=sluby&utm_medium=cpc&gclid=secret-not-to-send' },
  AksenLeadConfig: { service: 'wedding', formIds: { wedding: 9 }, contactFormId: 3 },
  crypto: { randomUUID: () => 'uuid-' + (++count) },
  jQuery: obj => ({ on: (name, handler) => { if (name === 'fluentform_submission_success') callback = handler; } }),
  dataLayer: []
};
vm.runInNewContext(source, { window, document, URLSearchParams, Set, WeakSet, Uint8Array, Date, Math });
assert.equal(attrs.utm_source.value, 'google');
assert.equal(attrs.utm_medium.value, 'cpc');
assert.equal(attrs.ak_service.value, 'wedding');
assert.equal(attrs.ak_page.value, '/portfolio-slubne-aksen-photo-fotograf-slubny/');
assert.equal(window.dataLayer[0].event, 'aksen_form_view');
fakeForm.handle_focusin();
assert.equal(window.dataLayer[1].event, 'aksen_form_start');
callback(null, { form: { jquery: true, 0: fakeForm }, response: { ok: true } });
const leads = window.dataLayer.filter(x => x.event === 'aksen_lead_success');
assert.equal(leads.length, 1);
assert.equal(leads[0].service_type, 'wedding');
assert.equal(leads[0].form_id, 9);
assert.equal(leads[0].utm_campaign, 'sluby');
assert.equal(leads[0].aksen_event_id, 'uuid-1');
assert.equal(JSON.stringify(leads).includes('secret-not-to-send'), false);
// Repeated success event from the same submission cannot double-count.
callback(null, { form: { jquery: true, 0: fakeForm }, response: { ok: true } });
assert.equal(window.dataLayer.filter(x => x.event === 'aksen_lead_success').length, 1);
// A new submitted attempt may create a second conversion.
fakeForm.handle_submit();
callback(null, { form: { jquery: true, 0: fakeForm }, response: { ok: true } });
assert.equal(window.dataLayer.filter(x => x.event === 'aksen_lead_success').length, 2);
// An ambiguous success payload must NOT count anything.
callback(null, {});
assert.equal(window.dataLayer.filter(x => x.event === 'aksen_lead_success').length, 2);
assert.equal(JSON.stringify(window.dataLayer).includes('email'), false);
console.log('PASS – view/start/success, deduplication, attribution, PII and click-id exclusion.');