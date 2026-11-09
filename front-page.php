<?php
/** Homepage uses the existing WordPress database as the source of all written content. */
get_header();
while (have_posts()) :
    the_post();
    $home_html = apply_filters('the_content', get_the_content());
    $ignored_source_heading = aksen_atelier_heading($home_html, get_the_title());
    $home_html = aksen_atelier_normalize_body($home_html, $ignored_source_heading);
    $hero_src = aksen_atelier_image(get_the_ID(), 'full');
    $me = aksen_atelier_page('o-mnie-fotograf-szczecin');
    $me_src = $me ? aksen_atelier_image($me) : '';
    $selected = [
        ['portfolio-slubne-aksen-photo-fotograf-slubny', 'Fotografia ślubna', '01'],
        ['fotografia-rodzinna-szczecin-zdjecia-rodzinne', 'Fotografia rodzinna', '02'],
        ['fotograf-na-komunie-szczecin', 'Komunia Święta', '03'],
        ['fotograf-na-chrzest-swiety-szczecin', 'Chrzest', '04'],
        ['fotograf-na-18-urodziny-w-szczecinie', 'Reportaże i eventy', '05'],
        ['fotografia-wizerunkowa-i-biznesowa-szczecin', 'Fotografia biznesowa', '06'],
    ];
    $stories = [
        'klaudia-i-damian-slub-i-wesele-w-policach',
        'jolanta-i-kamil-slub-i-wesele-w-goleniowie',
        'slub-humanistyczny-i-wesele-magdaleny-i-pawla-w-kobylance',
    ];
?>
<article <?php post_class('ap-home'); ?>>
  <section class="ap-hero" aria-labelledby="ap-main-title">
    <div class="ap-hero__photograph">
      <?php if ($hero_src): ?><img src="<?php echo esc_url($hero_src); ?>" alt="Fotografia ślubna Aksen Photo" loading="eager" decoding="async" fetchpriority="high" sizes="100vw"><?php endif; ?>
    </div>
    <div class="ap-hero__veil" aria-hidden="true"></div>
    <div class="ap-hero__content ap-container">
      <div class="ap-hero__eyebrow"><span class="ap-line" aria-hidden="true"></span> AKSEN PHOTO / SZCZECIN</div>
      <h1 id="ap-main-title">Zatrzymuję emocje,<br><em>zanim znikną.</em></h1>
      <div class="ap-hero__lower">
        <p>Fotografia ślubna, rodzinna i reportażowa w Szczecinie i okolicach.</p>
        <div class="ap-hero__buttons">
          <a class="ap-btn ap-btn--ivory" href="<?php echo esc_url(aksen_atelier_url('portfolio-slubne-aksen-photo-fotograf-slubny')); ?>">Zobacz zdjęcia <span aria-hidden="true">↗</span></a>
          <a class="ap-btn ap-btn--ghost" href="<?php echo esc_url(aksen_atelier_contact_url()); ?>">Zapytaj o termin</a>
        </div>
      </div>
    </div>
    <div class="ap-hero__index" aria-hidden="true">01 — 04</div>
    <a class="ap-hero__scroll" href="#o-mnie">Przewiń <span aria-hidden="true">↓</span></a>
  </section>

  <div class="ap-ticker"><div class="ap-container"><span>ŚLUBY I WESELA</span><span class="ap-ticker__circle" aria-hidden="true"></span><span>SESJE RODZINNE</span><span class="ap-ticker__circle" aria-hidden="true"></span><span>REPORTAŻE</span><span class="ap-ticker__circle" aria-hidden="true"></span><span>FOTOGRAFIA BIZNESOWA</span></div></div>

  <section class="ap-intro ap-container ap-section" id="o-mnie">
    <div class="ap-intro__copy">
      <p class="ap-label"><span class="ap-num">01 /</span> O mnie</p>
      <div class="ap-richtext ap-intro__body"><?php echo $home_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Existing trusted WordPress content. ?></div>
      <a class="ap-text-link" href="<?php echo esc_url(aksen_atelier_url('o-mnie-fotograf-szczecin')); ?>">Więcej o mnie <span aria-hidden="true">↗</span></a>
    </div>
    <?php if ($me_src): ?>
      <div class="ap-intro__media"><img src="<?php echo esc_url($me_src); ?>" alt="Fotograf Aksen Photo" loading="lazy" decoding="async"><span class="ap-image-caption">AKSEN PHOTO / PORTRET</span></div>
    <?php endif; ?>
  </section>

  <section class="ap-services ap-section" id="oferta" aria-labelledby="ap-services-heading">
    <div class="ap-container">
      <div class="ap-section-head">
        <p class="ap-label"><span class="ap-num">02 /</span> Oferta</p>
        <h2 id="ap-services-heading">Oferta fotograficzna</h2>
      </div>
      <div class="ap-services__grid">
        <?php foreach ($selected as [$slug, $label, $number]):
          $page = aksen_atelier_page($slug);
          if (!$page) { continue; }
          $src = aksen_atelier_image($page);
        ?>
          <a href="<?php echo esc_url(get_permalink($page)); ?>" class="ap-service">
            <div class="ap-service__image"><?php if ($src): ?><img src="<?php echo esc_url($src); ?>" alt="" loading="lazy" decoding="async"><?php endif; ?></div>
            <div class="ap-service__footer"><span><?php echo esc_html($number); ?></span><h3><?php echo esc_html($label); ?></h3><span class="ap-service__arrow" aria-hidden="true">↗</span></div>
          </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <section class="ap-stories ap-section ap-container" aria-labelledby="ap-stories-heading">
    <div class="ap-section-head ap-section-head--inline"><div><p class="ap-label"><span class="ap-num">03 /</span> Portfolio</p><h2 id="ap-stories-heading">Wybrane reportaże</h2></div><a class="ap-text-link" href="<?php echo esc_url(aksen_atelier_url('portfolio-slubne-aksen-photo-fotograf-slubny')); ?>">Całe portfolio <span aria-hidden="true">↗</span></a></div>
    <div class="ap-stories__grid">
      <?php $index = 0; foreach ($stories as $slug):
        $story = get_page_by_path($slug, OBJECT, 'post');
        if (!$story instanceof WP_Post || $story->post_status !== 'publish') { continue; }
        $src = aksen_atelier_image($story);
        $index++;
      ?>
        <a class="ap-story" href="<?php echo esc_url(get_permalink($story)); ?>">
          <div class="ap-story__photo"><?php if ($src): ?><img src="<?php echo esc_url($src); ?>" alt="" loading="lazy" decoding="async"><?php endif; ?></div>
          <div class="ap-story__meta"><span class="ap-micro">REPORTAŻ / <?php echo esc_html(str_pad((string) $index, 2, '0', STR_PAD_LEFT)); ?></span><span aria-hidden="true">↗</span></div>
          <h3><?php echo esc_html(get_the_title($story)); ?></h3>
        </a>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="ap-journal ap-section" aria-labelledby="ap-blog-heading">
    <div class="ap-container">
      <div class="ap-section-head ap-section-head--inline"><div><p class="ap-label"><span class="ap-num">04 /</span> Blog</p><h2 id="ap-blog-heading">Ostatnio na blogu</h2></div><a class="ap-text-link" href="<?php echo esc_url(aksen_atelier_url('blog-fotograficzny')); ?>">Wszystkie wpisy <span aria-hidden="true">↗</span></a></div>
      <?php $latest = new WP_Query(['post_type' => 'post','post_status' => 'publish','posts_per_page' => 3,'ignore_sticky_posts' => true]); ?>
      <?php if ($latest->have_posts()): ?><div class="ap-blog-grid">
        <?php while ($latest->have_posts()): $latest->the_post(); aksen_atelier_card(get_post()); endwhile; wp_reset_postdata(); ?>
      </div><?php endif; ?>
    </div>
  </section>

  <section class="ap-final ap-container">
    <div><span class="ap-label">KONTAKT / SZCZECIN</span><h2>Zapytaj o wolny termin.</h2></div>
    <div><a class="ap-btn ap-btn--ivory" href="<?php echo esc_url(aksen_atelier_contact_url()); ?>">Napisz do mnie <span aria-hidden="true">↗</span></a><a href="tel:+48518202089" class="ap-final__tel">518 202 089</a></div>
  </section>
</article>
<?php endwhile; get_footer(); ?>

