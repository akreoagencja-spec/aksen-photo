<?php get_header(); ?>
<section class="ap-container ap-post-list ap-index"><div class="ap-section-head"><p class="ap-label">AKSEN PHOTO</p><h1><?php echo esc_html(is_home() ? 'Blog fotograficzny' : get_the_archive_title()); ?></h1></div>
  <?php if (have_posts()): ?><div class="ap-blog-grid"><?php while (have_posts()): the_post(); aksen_atelier_card(get_post()); endwhile; ?></div><div class="ap-pagination"><?php the_posts_pagination(['mid_size'=>1,'prev_text'=>'←','next_text'=>'→']); ?></div>
  <?php else: ?><p>Brak wpisów.</p><?php endif; ?>
</section>
<?php get_footer(); ?>

