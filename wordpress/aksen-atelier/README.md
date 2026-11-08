# Aksen Photo – social media, Google reviews, Instagram feed (staging patch)

**Target:** WordPress staging `https://test.aksen-photo.pl`, active classic theme `aksen-atelier` v1.0.3.
**Do not deploy to production `aksen-photo.pl` before visual QA and a backup.**
This directory is a **ready-to-integrate source patch**, NOT evidence that the WordPress server has been changed. The repository root is a separate Next.js/Vercel frontend; these PHP files are **not** auto-deployed to WordPress by Vercel.

## Requirements and verified source data

- Instagram: `https://www.instagram.com/aksen_photo/`
- Facebook: `https://www.facebook.com/369942623632492/` (business ID from connected Metricool)
- TikTok: `https://www.tiktok.com/@aksen_photo`
- Pinterest: `https://www.pinterest.com/Aksen_Photo/`
- YouTube: `https://www.youtube.com/channel/UCCDQ1eowe3g53RJvYJnKYyQ`
- Google Maps (verified place ID `ChIJfUfo0vgPqkcRtEMtsG0bWCc`):
  `https://www.google.com/maps/search/?api=1&query=Fotograf%20Aksen%20Photo%20Szczecin&query_place_id=ChIJfUfo0vgPqkcRtEMtsG0bWCc`
- Business result on 8 Nov 2026: Google rating **5.0 / 5, 69 reviews**. This is a **dated snapshot**, not a live counter.
- Three genuine Google Business Profile review excerpts, reviewer names and dates came from the connected Metricool GBP reviews data on 8 Nov 2026.
- Four distinct verifiable recent Instagram posts returned by Metricool:
  - 7 Nov 2026, church wedding: `https://www.instagram.com/p/Dfb01h5iNIm/`
  - 2 Nov 2026, Indian Spirit: `https://www.instagram.com/p/DfPzr0fCNIg/`
  - 1 Nov 2026, wedding outdoor session: `https://www.instagram.com/p/DfNO9_WiA0U/`
  - 26 Sep 2026, First Look: `https://www.instagram.com/p/DdviKOxDkeJ/`
- **Do not invent a fifth post.** Metricool has no older accessible entry in the tested history and currently exposes only four verifiable posts. The template accepts 1–5 through native WordPress options.

## What the files change

`footer.php` is a full replacement of the audited 34-line staging footer. It:
1. shows social links and Google Maps link in the global footer;
2. expands the footer service menu to match new service pages;
3. loads `partials/social-proof.php` **only on the homepage**;
4. keeps existing contact, privacy, `wp_footer()` and original logo class intact.

`partials/social-proof.php` creates a lightweight accessible section with:
- three Google review excerpts and source link, with timestamped rating;
- up to five actual Instagram post links (four currently verifiable);
- lazy-loaded 4:5 image covers **only when local thumbnail URLs exist**;
- CSS built into the partial to avoid another external request, and no third-party JavaScript/iframes/cookies.
- no `AggregateRating` or `Review` schema: self-serving structured ratings are not eligible for Google review snippets for `LocalBusiness`/`Organization`.

## Deployment – safe workflow for Codex / WPVibe

1. Verify active staging theme remains `aksen-atelier`. Confirm `blog_public=0`, no indexing, and Picu unchanged.
2. Back up current `wp-content/themes/aksen-atelier/footer.php` and active theme files. Do not overwrite another editor's changes without diffing.
3. Put `wordpress/aksen-atelier/footer.php` into `wp-content/themes/aksen-atelier/footer.php`.
4. Put `wordpress/aksen-atelier/partials/social-proof.php` into `wp-content/themes/aksen-atelier/partials/social-proof.php` (create `partials` if missing).
5. Review `php -l` on both before replacing the live staging theme files.
6. Load the staging home page and one service page: check footer, menu, review link, Instagram post links, mobile 320/375/768 px, no horizontal scroll, keyboard focus and CLS.
7. Run Lighthouse mobile and desktop. Compare with prior baseline around 97–100 performance; roll back on functional/performance regression.
8. Confirm production `aksen-photo.pl` is unchanged.

**WPVibe note:** its rolling 24h tool usage was exhausted during the request (501/500), so the source patch was committed to GitHub instead of directly writing to WordPress. The source patch is not yet live.

## Adding the fifth post and images (no new plugin)

The homepage partial reads native WordPress option `aksen_photo_instagram_feed` with JSON-compatible entries:
```json
[
  {
    "date": "2026-11-07",
    "title": "Ślub kościelny",
    "url": "https://www.instagram.com/p/Dfb01h5iNIm/",
    "image_url": "https://test.aksen-photo.pl/wp-content/uploads/.../real-post-cover.webp"
  }
]
```
The option, if populated, replaces the built-in four-item snapshot. Publish only verified Instagram permalinks and use a **local, resized WebP thumbnail of the correct post**. Add a fifth real post when verified; do not substitute a profile link pretending to be a post. Thumbnails from the Instagram CDN have expiring signed URLs and must not be hotlinked as permanent site assets. A later server-side sync can refresh this option using Meta/Instagram API credentials (server side only), with daily caching and error fallback, but this implementation does not assume such credentials exist.

## UX recommendation

Keep reviews above the Instagram section, both near the bottom of the homepage. Their purpose is conversion and credibility, not ranking manipulation. Keep five Instagram previews only if the images and links remain reliable; otherwise show fewer accurate posts and a prominent 'Obserwuj na Instagramie' link. The main hero, offer and lead forms remain the priority.

## QA checklist

- No iframe, external widget JS, new WordPress plugin or manual social cookie activation.
- `rel="noopener noreferrer"` on links to external websites; `rel="me"` on owned social profiles.
- One H1 stays in the existing homepage; these sections introduce H2.
- Three genuine testimonial excerpts, each clearly attributed.
- Google star count marked with the snapshot date, not presented as a live feed.
- No attempt to add self-serving `aggregateRating` schema.
- No external Instagram CDN image dependency.
- Fallback works even before local images/fifth post are added.
