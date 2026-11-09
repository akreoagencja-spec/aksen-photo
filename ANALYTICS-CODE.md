# Aksen Photo — conversions and analytics in theme code (v1.0.5)

## Architecture

**No GTM container or analytics WordPress plugin is required.** Code lives in this classic WordPress theme:

- inc/analytics.php: server-side config, Consent Mode v2 denied-by-default bootstrap, PHP guards.
- assets/js/aksen-lead-tracking.js: listens for confirmed Fluent Forms AJAX success; dispatches first-party aksen:event DOM events; prepares UTM metadata for forms; doesn't contact Google/Meta.
- assets/js/aksen-analytics.js: consent listener + lazy direct GA4/Google Ads/Meta SDK loading and event transport. Disabled until the site owner explicitly enables it.
- functions.php: enqueues local scripts and requires the PHP module.
- tests/analytics.test.cjs: privacy, deduplication, form-success and no-consent regression tests.

**Other components deliberately remain separate:** Picu for private client galleries; Fluent Forms for receiving enquiries; AIOSEO for title/canonical/schema/SEO; CookieYes for the legally reviewed banner/consent record. None of these plugins owns the conversion event dispatch.

## Event contract

| Local event | Direct measurement after matching consent | Advertising conversion? |
| --- | --- | --- |
| aksen_form_view | Internal only | No |
| aksen_form_start | GA4 form_start with analytics consent | No |
| aksen_contact_click | GA4 click_to_call with analytics consent | No |
| aksen_lead_success | GA4 generate_lead; Meta standard Lead; optionally Google Ads conversion | **Yes — form AJAX success only** |

The lead event is emitted once with a random aksen_event_id, reused for dedupe and future server-side conversion reconciliation. No first name, surname, email, telephone, message content, IP, or full UTM data is sent in Google/Meta event payload. Lead IDs and service names are sanitized. No invented transaction values.

**Important:** A click on a telephone link is an engagement event, not a confirmed answered call. If calls are to become conversions, add proper call verification rather than converting every click.

**Avoid double primary conversions:** If Google Ads imports the GA4 generate_lead as its primary conversion, don't mark the direct Google Ads AW conversion for the same lead as another primary conversion. Choose one route.

## Consent Mode v2 and CookieYes

The PHP module writes four Google defaults as **denied** synchronously in wp_head before any measurement tags. No Google or Meta SDK is loaded before a confirmed positive category decision.

The JS consumes cookieyes_banner_load and cookieyes_consent_update events, or the official getCkyConsent() API. It only trusts isUserActionCompleted === true when the category snapshot is used.

Category mapping:
- analytics -> Google analytics_storage
- advertisement -> ad_storage, ad_user_data, ad_personalization, and Meta.

**Compatibility caution:** CookieYes documents that these JS events may not exist in a WordPress-plugin-only installation without connection to the CookieYes web app. In that case the integration intentionally **fails closed**: it makes no Google/Meta request, rather than guessing from a cookie string. Check the API on the real site before enabling. If you want to replace CookieYes eventually, implement a reviewed, accessible first-party consent banner and a stable adapter that provides the same two category decisions.

If another plugin injects GA4/Meta/GTM, remove those duplicate injectors first. The theme avoids initializing an already existing Meta fbq to avoid duplicate PageView calls, but Google tag conflicts still require cleanup.

## Activation — intentionally disabled by default

This theme is not live until backed up, installed, and activated with approval. Even then, measurement stays disabled unless the site owner deliberately sets this server-side constant in audited host-managed WP configuration (not via a new plugin):

    define('AKSEN_ANALYTICS_ACTIVE', true);

No measurement is enabled on the staging subdomain, a site with blog_public=0, or HTTP.

Available validated production identifiers in source:
- GA4 G-PQFD3M4VTP
- Meta Pixel 2998967330426508

**Google Ads direct conversion remains disabled until exact values are verified**, then set these constants to REAL values:

    define('AKSEN_GOOGLE_ADS_ID', 'AW-REAL-ID');
    define('AKSEN_GOOGLE_ADS_LEAD_LABEL', 'REAL_LABEL');

Those strings are **illustrative placeholders, not working credentials**. Only enable once you've decided whether Ads uses a direct conversion or imports the GA4 key event.

## Launch checklist

1. Verified offsite **filesystem + DB** backup; never overwrite production DB or uploads/picu/. Retain rollback to Hello Elementor.
2. Install the release theme inactive first. Migrate service pages by matching production slug; do not merge unrelated legacy Elementor or Picu content; do not copy staging DB.
3. Map production Fluent Forms IDs to services (don't reuse staging IDs unchanged). Confirm email delivery and form validation. Check all event callbacks in browser with a safe test submission.
4. Audit actual page source, Tag Assistant and Meta Pixel Helper for existing tags; prevent **all duplicate GA4/Ads/Meta/GTM injectors** and retest CookieYes refusal, accept analytics-only, ads-only, all, and revoke.
5. Confirm no GA/Meta request before consent or after revocation. Test getCkyConsent() or CookieYes events. Check ad_storage, analytics_storage, ad_user_data and ad_personalization separately.
6. Mark generate_lead as a GA4 key event. Set up or import the conversion in Google Ads. Verify Meta Lead in Events Manager. Campaign launch only after successful tests.
7. Check mobile CLS/LCP, 200/301 statuses, canonical tags, indexability, H1/H2 order, image alt and lightweight public galleries. **Keep AIOSEO the sole JSON-LD/canonical authority** to avoid duplicate schemas. Content and FAQ must be server-rendered, not injected by JS.
8. Do not disable Picu. Public galleries should use theme code; FooGallery/Modula only disabled after their references are replaced and tested. Do not mass compress clients' photos.

## Limits

- Repository release is **code prepared, not deployed or switched on**.
- Unit tests aren't a live Fluent Forms/email/Google Ads/Meta confirmation.
- Google Ads conversion ID/label and verified live CookieYes JS interface remain unconfirmed.
- Server-side form capture, mail delivery, and consent configuration are essential to actual advertising readiness.
