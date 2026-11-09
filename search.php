<?php get_header(); ?>
<section class="ap-container ap-post-list ap-index"><div class="ap-section-head"><p class="ap-label">WYNIKI WYSZUKIWANIA</p><h1><?php echo esc_html(get_search_query()); ?></h1></div>
  <?php if (have_posts()): ?><div class="ap-blog-grid"><?php while (have_posts()): the_post(); aksen_atelier_card(get_post()); endwhile; ?></div><?php the_posts_pagination(); ?>
  <?php else: ?><p>Brak wyników.</p><?php get_search_form(); ?><?php endif; ?>
</section>
<?php get_footer(); ?>

