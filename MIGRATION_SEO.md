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
- The existing article archive remains `/blog-fotograficzny/`; the short `/blog/` route is only an alias redirect.
- Existing WordPress pages are resolved by their current path through the legacy compatibility route.
- Existing `/category/.../`, `/tag/.../` and their `/page/N/` pagination are handled by the compatibility route.
- The Next sitemap merges first-class routes with existing WordPress pages/posts and deduplicates URLs.
- Temporary short Next aliases redirect permanently to the existing public permalink model rather than creating duplicate indexable pages.

## Verified sitemap baseline — 2026-09-10

The current production sitemap index contains 858 unique URLs across 6 child sitemaps, with no duplicate paths between child sitemaps:

- `post-sitemap.xml`: 56 URLs
- `page-sitemap.xml`: 30 URLs
- `post_grid-sitemap.xml`: 1 URL
- `elementor-hf-sitemap.xml`: 2 URLs
- `category-sitemap.xml`: 8 URLs
- `post_tag-sitemap.xml`: 761 URLs

### Explicit technical URL mappings

- `/post_grid/reportaz-slubny/` currently returns 200 with a self-canonical but contains no H1 and essentially only site chrome. It represents the same `reportaż ślubny` collection as `/category/reportaz-slubny/`; staging therefore maps it permanently to `/category/reportaz-slubny/` instead of allowing a 404 or duplicate thin page.
- `/elementor-hf/naglowek-menu-aksen-photo-fotograf-szczecin/` currently returns 301 to the homepage. Next.js mirrors that behavior.
- `/elementor-hf/stopka-aksen-photo-fotograf-szczecin/` currently returns 301 to the homepage. Next.js mirrors that behavior.

Do not remove random-looking page URLs from the baseline solely because their slugs look technical or suspicious. Each one must be checked before any mapping or retirement decision.

## Release gate

Before merge/cutover:

- `npm run lint` passes.
- `npm audit --audit-level=high` passes.
- `npm run build` passes.
- WordPress bridge PHP syntax check passes.
- `npm run seo:inventory` creates the current production URL baseline.
- `npm run seo:provenance` confirms sitemap ownership/counts.
- `npm run seo:priority` verifies important and technical production URLs.
- A preview deployment is tested with `scripts/seo-regression.mjs --source=https://aksen-photo.pl --target=<preview>`.
- All priority pages are visually checked on mobile and desktop.
- Canonical, robots, sitemap and structured data are checked.
- Contact form, consent, GA4 and Meta events are checked.
- Production backup and rollback procedure are verified.

## Git/Vercel staging workflow

- Development remains on `feat/seo-preservation-next-pro` until staging QA is complete.
- Every commit on the feature branch should create a Vercel Preview deployment through the Git integration.
- Preview deployments must keep `ALLOW_INDEXING=false`.
- A Git-triggered Preview deployment is required before the full 858-URL regression is run.
- The PR remains a draft until the release gate is complete.

## Cutover rule

Do not merge for production and do not change production DNS until every release gate above is green and the owner gives a separate, explicit cutover approval.
