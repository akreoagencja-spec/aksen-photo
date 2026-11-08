<?php
/**
 * Static, provenance-labelled social proof for the Aksen Photo front page.
 *
 * No Instagram oEmbed iframe, tracking pixel, client-side third-party JS,
 * external stylesheet, or extra WordPress plugin. Source: connected Metricool
 * Instagram/Google Business Profile and public Google place lookup.
 *
 * The authenticated source currently returned 4, not 5, identifiable recent
 * Instagram feed posts. Do not fabricate the fifth. A later admin-controlled
 * option can supply up to 5 posts with locally hosted cover images.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

$aksen_google_url = 'https://www.google.com/maps/search/?api=1&query=Fotograf%20Aksen%20Photo%20Szczecin&query_place_id=ChIJfUfo0vgPqkcRtEMtsG0bWCc';
$aksen_google_reviews = [
  [
    'name' => 'Grzegorz Miłoś',
    'date' => '2026-11-02',
    'quote' => 'Wszystko super, foteczki kontakt i terminowość TOP:)',
  ],
  [
    'name' => 'Małgorzata Kędziora',
    'date' => '2026-10-12',
    'quote' => 'Pełen profesjonalizm, świetne podejście do nas i cudowna atmosfera zarówno podczas ślubu, jak i wesela.',
  ],
  [
    'name' => 'Monika Miszewska',
    'date' => '2026-07-25',
    'quote' => 'Pełen profesjonalizm i niesamowite wyczucie chwili!',
  ],
];

// Date, title and original permalink were verified in connected Metricool.
// image_url should ONLY contain a stable, locally hosted WordPress thumbnail,
// not an expiring Instagram CDN URL. These start text-only on purpose.
$aksen_instagram_fallback = [
  [ 'date' => '2026-11-07', 'title' => 'Ślub kościelny', 'url' => 'https://www.instagram.com/p/Dfb01h5iNIm/', 'image_url' => '' ],
  [ 'date' => '2026-11-02', 'title' => 'Indian Spirit', 'url' => 'https://www.instagram.com/p/DfPzr0fCNIg/', 'image_url' => '' ],
  [ 'date' => '2026-11-01', 'title' => 'Plener ślubny', 'url' => 'https://www.instagram.com/p/DfNO9_WiA0U/', 'image_url' => '' ],
  [ 'date' => '2026-09-26', 'title' => 'First look', 'url' => 'https://www.instagram.com/p/DdviKOxDkeJ/', 'image_url' => '' ],
];
$aksen_ig_from_admin = get_option( 'aksen_photo_instagram_feed', [] );
$aksen_ig_posts = is_array( $aksen_ig_from_admin ) && $aksen_ig_from_admin
    ? array_slice( $aksen_ig_from_admin, 0, 5 )
    : $aksen_instagram_fallback;
?>
<style id="aksen-social-proof-styles">
.ap-proof{background:#f7f5f0;color:#252b25;padding:clamp(52px,7vw,105px) 0 65px}
.ap-proof__inner{width:min(1180px,calc(100% - 40px));margin:0 auto}
.ap-proof__head{display:flex;align-items:end;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:25px}
.ap-proof__eyebrow{font:700 11px/1.5 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#56735f;margin:0 0 11px}
.ap-proof__title{font:400 clamp(30px,4vw,52px)/1.12 Georgia,serif;letter-spacing:-.03em;margin:0}
.ap-proof__cta{display:inline-flex;align-items:center;min-height:42px;font:700 13px/1.4 system-ui,sans-serif;color:#305b42!important;text-decoration:underline;text-underline-offset:4px}
.ap-proof__google-bar{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:18px 24px;background:#ebe8de;margin-bottom:20px;border:1px solid #dbd4c5}
.ap-proof__rating{font:700 clamp(23px,3vw,33px)/1.25 system-ui,sans-serif}
.ap-proof__stars{color:#986923;letter-spacing:.12em;font-size:17px;white-space:nowrap}
.ap-proof__verify{font:400 12px/1.6 system-ui,sans-serif;color:#60635b}
.ap-proof__reviews{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}
.ap-proof__review{margin:0;min-width:0;background:#fff;border:1px solid #e0ddd4;padding:clamp(19px,2.7vw,30px);display:flex;flex-direction:column;gap:18px;min-height:180px}
.ap-proof__review blockquote{font:400 16px/1.65 Georgia,serif;margin:0;flex:1;quotes:"„" "”"}
.ap-proof__review blockquote:before{content:open-quote}
.ap-proof__review blockquote:after{content:close-quote}
.ap-proof__review footer{font:600 12px/1.5 system-ui,sans-serif;color:#505d50;display:flex;justify-content:space-between;gap:9px}
.ap-proof__ig{margin-top:clamp(45px,6vw,75px)}
.ap-feed{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:0}
.ap-feed__card{display:flex;flex-direction:column;text-decoration:none!important;color:#252b25!important;background:#fff;min-width:0;border:1px solid #ddd8ce;overflow:hidden;transition:transform .18s,border-color .18s}
.ap-feed__card:focus-visible{outline:3px solid #336b4e;outline-offset:3px}
.ap-feed__card:hover{transform:translateY(-3px);border-color:#6e8272}
.ap-feed__visual{display:flex;align-items:center;justify-content:center;position:relative;aspect-ratio:4/5;overflow:hidden;background:linear-gradient(145deg,#434a3c 0%,#717769 50%,#b9b8a2 100%);color:#fff}
.ap-feed__visual img{width:100%;height:100%;object-fit:cover;display:block;position:absolute;inset:0}
.ap-feed__visual-label{font:700 13px/1.5 system-ui,sans-serif;letter-spacing:.22em;text-align:center;text-transform:uppercase;padding:16px}
.ap-feed__body{padding:16px 17px 18px;display:flex;flex-direction:column;gap:5px}
.ap-feed__date{font:500 11px/1.3 system-ui,sans-serif;color:#64675f}
.ap-feed__title{font:600 17px/1.32 Georgia,serif}
.ap-feed__caption{font:400 13px/1.5 system-ui,sans-serif;color:#62665e}
.ap-proof__ig-note{font:400 12px/1.6 system-ui,sans-serif;color:#5c625a;margin-top:15px}
.ap-social-links{display:flex;flex-wrap:wrap;gap:8px 14px;margin:18px 0 12px}
.ap-social-links a,.ap-google-footer{display:inline-block!important;font:600 12px/1.6 system-ui,sans-serif;text-decoration:underline;text-underline-offset:3px;white-space:nowrap}
.ap-google-footer{margin:5px 0 0}
@media(max-width:850px){.ap-proof__reviews{grid-template-columns:1fr 1fr}.ap-feed{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:550px){.ap-proof__inner{width:calc(100% - 30px)}.ap-proof__reviews{grid-template-columns:1fr}.ap-proof__review{min-height:0}.ap-proof__google-bar{padding:16px;gap:8px 14px}.ap-feed{gap:9px}.ap-feed__body{padding:12px}.ap-feed__title{font-size:15px}.ap-feed__caption{font-size:12px}}
@media(prefers-reduced-motion:reduce){.ap-feed__card{transition:none}.ap-feed__card:hover{transform:none}}
</style>
<section class="ap-proof" aria-labelledby="aksen-google-reviews">
  <div class="ap-proof__inner">
    <div class="ap-proof__head">
      <div>
        <p class="ap-proof__eyebrow">Zaufanie klientów</p>
        <h2 id="aksen-google-reviews" class="ap-proof__title">Opinie o Aksen Photo</h2>
      </div>
      <a class="ap-proof__cta" href="<?php echo esc_url( $aksen_google_url ); ?>" target="_blank" rel="noopener noreferrer">Wszystkie opinie w Google <span aria-hidden="true">↗</span></a>
    </div>
    <div class="ap-proof__google-bar">
      <span class="ap-proof__stars" aria-hidden="true">★★★★★</span>
      <span class="ap-proof__rating">5,0 / 5</span>
      <span class="ap-proof__verify">69 opinii w Google · stan z 8.11.2026 · dane mogą się zmienić</span>
    </div>
    <div class="ap-proof__reviews">
      <?php foreach ( $aksen_google_reviews as $aksen_review ) : ?>
        <figure class="ap-proof__review">
          <span class="ap-proof__stars" aria-label="Ocena 5 na 5">★★★★★</span>
          <blockquote><?php echo esc_html( $aksen_review['quote'] ); ?></blockquote>
          <footer>
            <span><?php echo esc_html( $aksen_review['name'] ); ?></span>
            <time datetime="<?php echo esc_attr( $aksen_review['date'] ); ?>"><?php echo esc_html( wp_date( 'd.m.Y', strtotime( $aksen_review['date'] ) ) ); ?></time>
          </footer>
        </figure>
      <?php endforeach; ?>
    </div>
    <div class="ap-proof__ig" aria-labelledby="aksen-instagram-feed">
      <div class="ap-proof__head">
        <div>
          <p class="ap-proof__eyebrow">Zobacz ostatnie realizacje</p>
          <h2 id="aksen-instagram-feed" class="ap-proof__title">Ostatnio na Instagramie</h2>
        </div>
        <a class="ap-proof__cta" href="https://www.instagram.com/aksen_photo/" target="_blank" rel="noopener noreferrer">Obserwuj @aksen_photo <span aria-hidden="true">↗</span></a>
      </div>
      <div class="ap-feed">
        <?php foreach ( $aksen_ig_posts as $aksen_ig_post ) :
          if ( ! is_array( $aksen_ig_post ) || empty( $aksen_ig_post['url'] ) || empty( $aksen_ig_post['title'] ) ) { continue; }
          $aksen_link = esc_url( (string) $aksen_ig_post['url'] );
          $aksen_date = (string) ( $aksen_ig_post['date'] ?? '' );
          $aksen_image = (string) ( $aksen_ig_post['image_url'] ?? '' );
          // Only stable images hosted on this WordPress site. Avoid expiring Meta CDN tokens.
          $aksen_is_local = $aksen_image && wp_parse_url( $aksen_image, PHP_URL_HOST ) === wp_parse_url( home_url(), PHP_URL_HOST );
          ?>
          <a class="ap-feed__card" href="<?php echo $aksen_link; ?>" target="_blank" rel="noopener noreferrer"
             aria-label="<?php echo esc_attr( 'Otwórz post Aksen Photo na Instagramie: ' . $aksen_ig_post['title'] ); ?>">
            <span class="ap-feed__visual">
              <?php if ( $aksen_is_local ) : ?>
                <img src="<?php echo esc_url( $aksen_image ); ?>" alt="<?php echo esc_attr( $aksen_ig_post['title'] ); ?>" width="480" height="600" loading="lazy" decoding="async">
              <?php else : ?>
                <span class="ap-feed__visual-label">AKSEN PHOTO<br>INSTAGRAM</span>
              <?php endif; ?>
            </span>
            <span class="ap-feed__body">
              <?php if ( $aksen_date ) : ?><time class="ap-feed__date" datetime="<?php echo esc_attr( $aksen_date ); ?>"><?php echo esc_html( $aksen_date ); ?></time><?php endif; ?>
              <strong class="ap-feed__title"><?php echo esc_html( $aksen_ig_post['title'] ); ?></strong>
              <span class="ap-feed__caption">Zobacz reportaż na Instagramie <span aria-hidden="true">↗</span></span>
            </span>
          </a>
        <?php endforeach; ?>
      </div>
      <p class="ap-proof__ig-note">Wyświetlane są tylko potwierdzone, opublikowane wpisy. Gdy będzie dostępnych pięć zweryfikowanych materiałów, sekcja pokaże pięć kafelków. Zdjęcia okładkowe można dodać jako lokalne pliki WebP, bez ciężkich widgetów Instagrama.</p>
    </div>
  </div>
</section>
