# Aksen Photo — SEO-safe Next.js migration gate

## Non-negotiable production rules

1. The production domain remains `https://aksen-photo.pl`.
2. Existing valuable URLs stay on the same path whenever technically possible.
3. A URL may change only with an explicit mapping and a permanent 301 redirect to an equivalent page.
4. No production cutover is allowed while a baseline URL returns an unexpected 404/5xx on staging.
5. Staging must use `ALLOW_INDEXING=false` and remain `noindex`.
6. Production may use `ALLOW_INDEXING=true` only during the controlled cutover.
7. Canonicals on the public site must resolve to `https://aksen-photo.pl`, never to Vercel preview or `cms.aksen-photo.pl`.
8. WordPress credentials, bridge secrets, SMTP credentials and revalidation secrets never enter GitHub.
9. The old WordPress installation is not removed until rollback is no longer required.
10. DNS is changed only after build, QA, SEO regression and rollback checks pass.

## URL compatibility strategy

- WordPress posts keep the existing root permalink: `/{slug}/`.
- `/blog/` remains the article archive.
- Existing WordPress pages are resolved by their current path through the legacy compatibility route.
- Existing `/category/.../`, `/tag/.../` and their `/page/N/` pagination are handled by the compatibility route.
- The Next sitemap merges new first-class routes with existing WordPress pages/posts and deduplicates URLs.
- Temporary `/poradnik/...` Next routes redirect permanently to the existing public permalink model.

## Release gate

Before merge/cutover:

- `npm run lint` passes.
- `npm run build` passes.
- `npm run seo:inventory` creates the current production URL baseline.
- A preview deployment is tested with `scripts/seo-regression.mjs --source=https://aksen-photo.pl --target=<preview>`.
- All priority pages are visually checked on mobile and desktop.
- Canonical, robots, sitemap and structured data are checked.
- Contact form, consent, GA4 and Meta events are checked.
- Production backup and rollback procedure are verified.

## Cutover rule

Do not change the production DNS until every release gate above is green.
