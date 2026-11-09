<!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <?php wp_head(); ?>
</head>
<body <?php body_class('ap-body'); ?>>
<?php wp_body_open(); ?>
<a class="ap-skip" href="#main">Przejdź do treści</a>
<div class="ap-site">
<header class="ap-header">
  <div class="ap-header__inner ap-container">
    <a href="<?php echo esc_url(home_url('/')); ?>" class="ap-brand"><strong>AKSEN</strong><span>PHOTO</span></a>
    <nav class="ap-nav" aria-label="Menu główne">
      <?php wp_nav_menu(['theme_location' => 'primary', 'container' => false, 'menu_class' => 'ap-nav__list', 'fallback_cb' => 'wp_page_menu', 'depth' => 2]); ?>
    </nav>
    <a class="ap-header__phone" href="tel:+48518202089"><span class="ap-phone-dot" aria-hidden="true"></span> Zadzwoń</a>
    <details class="ap-mobile">
      <summary><span></span><span></span><span class="ap-mobile__label">MENU</span></summary>
      <div class="ap-mobile__panel">
        <nav aria-label="Menu mobilne">
          <?php wp_nav_menu(['theme_location' => 'primary', 'container' => false, 'menu_class' => 'ap-mobile__list', 'fallback_cb' => 'wp_page_menu', 'depth' => 2]); ?>
        </nav>
        <a href="<?php echo esc_url(aksen_atelier_cta_href()); ?>" class="ap-btn ap-btn--dark"><?php echo aksen_atelier_cta_href() === '#zapytaj-o-termin' ? 'Zapytaj o cenę' : 'Zapytaj o termin'; ?> <span aria-hidden="true">↗</span></a>
      </div>
    </details>
  </div>
</header>
<main id="main" class="ap-main">

