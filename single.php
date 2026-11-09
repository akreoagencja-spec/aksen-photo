<?php
/** Article template — author text remains in post_content without rewriting it. */
get_header();
while (have_posts()): the_post();
    $title = get_the_title();
    $html = apply_filters('the_content', get_the_content());
    $html = aksen_atelier_normalize_body($html, $title);
    $cover = aksen_atelier_image(get_the_ID());
    if ($cover) {
        $html = preg_replace('~<figure\b[^>]*class=["\x27][^"\x27]*aksen-import-photo[^"\x27]*["\x27][^>]*>[\s\S]*?</figure>~i', '', $html, 1) ?? $html;
    }
?>
<article <?php post_class('ap-interior ap-post'); ?>>
  <header class="ap-posthead ap-container">
    <a class="ap-back-link" href="<?php echo esc_url(aksen_atelier_url('blog-fotograficzny')); ?>">← Blog fotograficzny</a>
    <p class="ap-label"><time datetime="<?php echo esc_attr(get_the_date(DATE_W3C)); ?>"><?php echo esc_html(get_the_date('j F Y')); ?></time></p>
    <h1><?php echo esc_html($title); ?></h1>
    <?php if ($cover): ?><div class="ap-posthead__media"><img src="<?php echo esc_url($cover); ?>" alt="" fetchpriority="high" loading="eager" decoding="async"></div><?php endif; ?>
  </header>
  <div class="ap-container ap-page-layout ap-page-layout--post"><div class="ap-article__body entry-content"><?php echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?php wp_link_pages(); ?></div>
    <aside class="ap-sidebar"><div class="ap-sidebar__sticky"><span class="ap-label">AKSEN PHOTO</span><p>Zobacz pozostałe wpisy</p><a href="<?php echo esc_url(aksen_atelier_url('blog-fotograficzny')); ?>">Przejdź do bloga ↗</a><a href="<?php echo esc_url(aksen_atelier_contact_url()); ?>">Zapytaj o termin ↗</a></div></aside></div>
  <nav class="ap-container ap-prevnext" aria-label="Poprzedni i następny wpis"><span><?php previous_post_link('%link', '← %title'); ?></span><span><?php next_post_link('%link', '%title →'); ?></span></nav>
  <section class="ap-final ap-final--small ap-container"><div><span class="ap-label">KONTAKT</span><h2>Zapytaj o wolny termin.</h2></div><a class="ap-btn ap-btn--ivory" href="<?php echo esc_url(aksen_atelier_contact_url()); ?>">Napisz do mnie <span aria-hidden="true">↗</span></a></section>
</article>
<?php endwhile; get_footer(); ?>

