# Aksen Photo analytics architecture

## IDs configured
- GA4: `G-PQFD3M4VTP`
- Meta Pixel: `2998967330426508`
- Google Ads: intentionally not configured until the verified `AW-...` and conversion label are supplied.

## Consent
CookieYes website key is read from `NEXT_PUBLIC_COOKIEYES_ID`.
Google Consent Mode v2 defaults to denied and is updated from CookieYes `cookieyes_banner_load` and `cookieyes_consent_update` events.
Meta Pixel loads only after the CookieYes `advertisement` category is granted.

## Events
Primary lead:
- `form_submit_success`
- `generate_lead`
- Meta `Lead`

Secondary lead:
- `phone_click`
- `email_click`
- Meta `Contact`

Engagement:
- `contact_page_view`
- `scroll_90`
- `outbound_click`

`phone_call` is intentionally reserved for a verified Google Ads website-call conversion / forwarding-number implementation and is not inferred from a click on a `tel:` link.
