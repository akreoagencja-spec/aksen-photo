<?php
/** The current published pages retain all body text; only the presentation changes. */
get_header();
while (have_posts()):
    the_post();
    $html = apply_filters('the_content', get_the_content());
    $title = aksen_atelier_heading($html, get_the_title());
    $html = aksen_atelier_normalize_body($html, $title);
    $cover = aksen_atelier_image(get_the_ID());
    $slug = (string) get_post_field('post_name', get_the_ID());
    $lead_href = aksen_atelier_cta_href();
    $text_only = in_array($slug, ['polityka-prywatnosci-plikow-cookies-fotografa', 'kontakt-fotograf-szczecin-aksen-photo'], true);
    if ($cover && !$text_only) {
        // Move exactly one existing author image from article body to the hero.
        $html = preg_replace('~<figure\b[^>]*class=["\x27][^"\x27]*aksen-import-photo[^"\x27]*["\x27][^>]*>[\s\S]*?</figure>~i', '', $html, 1) ?? $html;
    }
?>
<article <?php post_class('ap-interior'); ?>>
  <header class="ap-pagehead <?php echo $cover && !$text_only ? 'ap-pagehead--photo' : 'ap-pagehead--text'; ?>">
    <div class="ap-container ap-pagehead__grid">
      <div class="ap-pagehead__words">
        <div class="ap-breadcrumb"><a href="<?php echo esc_url(home_url('/')); ?>">Aksen Photo</a><span aria-hidden="true">/</span><span><?php echo esc_html(get_the_title()); ?></span></div>
        <p class="ap-label"><span class="ap-line" aria-hidden="true"></span> FOTOGRAF / SZCZECIN I OKOLICE</p>
        <h1><?php echo esc_html($title); ?></h1>
        <?php if (!$text_only): ?><div class="ap-pagehead__actions"><a class="ap-btn ap-btn--dark" href="<?php echo esc_url($lead_href); ?>"><?php echo $lead_href === '#zapytaj-o-termin' ? 'Zapytaj o cenę' : 'Zapytaj o termin'; ?> <span aria-hidden="true">↗</span></a><a href="tel:+48518202089" class="ap-quiet-link">Zadzwoń: 518 202 089</a></div><?php endif; ?>
      </div>
      <?php if ($cover && !$text_only): ?><div class="ap-pagehead__photo"><img src="<?php echo esc_url($cover); ?>" alt="" fetchpriority="high" loading="eager" decoding="async"></div><?php endif; ?>
    </div>
  </header>
  <div class="ap-container ap-page-layout">
    <div class="ap-article__body entry-content">
      <?php echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Filtered WordPress content. ?>
      <?php wp_link_pages(); ?>
    </div>
    <?php if (!$text_only): ?><aside class="ap-sidebar"><div class="ap-sidebar__sticky"><span class="ap-label">AKSEN PHOTO</span><p>Fotografia ślubna i rodzinna</p><a href="<?php echo esc_url($lead_href); ?>">Sprawdź termin ↗</a><a href="tel:+48518202089">518 202 089</a></div></aside><?php endif; ?>
  </div>
  <?php if ($slug === 'blog-fotograficzny'): ?>
    <section class="ap-container ap-post-list" aria-labelledby="ap-post-list-title"><div class="ap-section-head"><p class="ap-label">ARTYKUŁY I REPORTAŻE</p><h2 id="ap-post-list-title">Wszystkie wpisy</h2></div>
      <?php $pg = isset($_GET['blogpage']) ? max(1, absint(wp_unslash($_GET['blogpage']))) : 1; aksen_atelier_list_posts(9, $pg); ?>
    </section>
  <?php endif; ?>
  <?php if (!$text_only): ?><section class="ap-final ap-final--small ap-container"><div><span class="ap-label">KONTAKT</span><h2>Zapytaj o wolny termin.</h2></div><a class="ap-btn ap-btn--ivory" href="<?php echo esc_url($lead_href); ?>">Napisz do mnie <span aria-hidden="true">↗</span></a></section><?php endif; ?>
</article>
<?php endwhile; get_footer(); ?>

