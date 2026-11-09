<?php
/**
 * Aksen Atelier — standalone classic theme for the isolated staging environment.
 * Nothing here modifies post_content, Picu collections, AIOSEO, or the source site.
 */
declare(strict_types=1);
defined('ABSPATH') || exit;

// First-party tracking and consent bootstrap; no analytics plugin.
require_once __DIR__ . '/inc/analytics.php';

add_action('after_setup_theme', static function (): void {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('responsive-embeds');
    add_theme_support('align-wide');
    add_theme_support('automatic-feed-links');
    add_theme_support('html5', ['search-form', 'gallery', 'caption', 'style', 'script', 'comment-form']);
    register_nav_menus(['primary' => 'Menu główne', 'footer' => 'Menu w stopce']);
});

add_action('wp_enqueue_scripts', static function (): void {
    $css = '/assets/css/site.css';
    $js = '/assets/js/site.js';
    wp_enqueue_style('aksen-atelier', get_theme_file_uri($css), [], (string) filemtime(get_theme_file_path($css)));
    wp_enqueue_script('aksen-atelier', get_theme_file_uri($js), [], (string) filemtime(get_theme_file_path($js)), true);
    $lead_js = '/assets/js/aksen-lead-tracking.js';
    wp_enqueue_script('aksen-lead-events', get_theme_file_uri($lead_js), ['jquery'], (string) filemtime(get_theme_file_path($lead_js)), true);
    wp_script_add_data('aksen-lead-events', 'strategy', 'defer');
    if (function_exists('wp_script_add_data')) {
        wp_script_add_data('aksen-atelier', 'strategy', 'defer');
    }
});

function aksen_atelier_page(string $slug): ?WP_Post {
    $page = get_page_by_path($slug, OBJECT, 'page');
    return $page instanceof WP_Post && $page->post_status === 'publish' ? $page : null;
}

function aksen_atelier_url(string $slug, string $fallback = '/'): string {
    $page = aksen_atelier_page($slug);
    return $page ? get_permalink($page) : home_url($fallback);
}

function aksen_atelier_contact_url(): string {
    return aksen_atelier_url('kontakt-fotograf-szczecin-aksen-photo');
}

/** Match each offer's CTA with its own form, without modifying its URL. */
function aksen_atelier_cta_href(): string {
    $id = get_queried_object_id();
    $body = $id ? (string) get_post_field('post_content', $id) : '';
    return str_contains($body, 'id="zapytaj-o-termin"') ? '#zapytaj-o-termin' : aksen_atelier_contact_url();
}

/** Return ONLY existing author-owned media from WordPress. No stock or generated photos. */
function aksen_atelier_image(WP_Post|int $item, string $size = 'large'): string {
    $id = $item instanceof WP_Post ? (int) $item->ID : $item;
    $thumbnail = get_the_post_thumbnail_url($id, $size);
    if (is_string($thumbnail) && $thumbnail !== '') {
        return esc_url_raw($thumbnail);
    }
    $content = (string) get_post_field('post_content', $id);
    if (preg_match('~<img\b[^>]*\bsrc\s*=\s*["\x27]([^"\x27]+)["\x27]~i', $content, $m)) {
        $url = html_entity_decode($m[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
        if (preg_match('~^https://(?:test\.)?aksen-photo\.pl/wp-content/uploads/~i', $url)) {
            return esc_url_raw($url);
        }
    }
    return '';
}

function aksen_atelier_excerpt(WP_Post $post, int $length = 28): string {
    $excerpt = trim((string) $post->post_excerpt);
    if ($excerpt === '') {
        $excerpt = preg_replace('~<figure\b[^>]*>[\s\S]*?</figure>~i', ' ', $post->post_content) ?? $post->post_content;
    }
    return wp_trim_words(wp_strip_all_tags(strip_shortcodes($excerpt)), $length, '…');
}

/**
 * Move the original first heading to the template hero WITHOUT editing source content.
 * The remaining author-written paragraphs and headings are output unchanged.
 */
function aksen_atelier_heading(string &$html, string $fallback): string {
    $html = preg_replace('~<p>\s*<!--\s*AKSEN_IMPORT_SOURCE:[\s\S]*?-->\s*</p>~i', '', $html) ?? $html;
    if (preg_match('~^\s*<h([12])\b[^>]*>([\s\S]*?)</h\1>~i', $html, $m)) {
        $candidate = trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags(str_replace(['<br>', '<br/>', '<br />'], ' ', $m[2]))) ?? '');
        if (mb_strlen($candidate) > 2 && mb_strlen($candidate) < 210) {
            $html = substr_replace($html, '', 0, strlen($m[0]));
            return $candidate;
        }
    }
    // Other H1s in legacy content are downgraded at render time to prevent duplicate H1.
    $html = preg_replace('~<(/?)h1\b([^>]*)>~i', '<$1h2$2>', $html) ?? $html;
    return $fallback;
}

function aksen_atelier_normalize_body(string $html, string $display_heading): string {
    $n = 0;
    $html = preg_replace_callback('~<h1\b[^>]*>([\s\S]*?)</h1>~i', static function (array $m) use (&$n, $display_heading): string {
        $n++;
        $text = trim(wp_strip_all_tags($m[1]));
        if ($n === 1 && mb_strtolower($text) === mb_strtolower($display_heading)) {
            return '';
        }
        return '<h2>' . $m[1] . '</h2>';
    }, $html) ?? $html;
    return $html;
}

function aksen_atelier_card(WP_Post $post, string $class = ''): void {
    $src = aksen_atelier_image($post);
    $permalink = get_permalink($post);
    ?>
    <article class="ap-card <?php echo esc_attr($class); ?>">
        <a href="<?php echo esc_url($permalink); ?>" class="ap-card__media" tabindex="-1" aria-hidden="true">
            <?php if ($src): ?>
                <img src="<?php echo esc_url($src); ?>" alt="" loading="lazy" decoding="async">
            <?php else: ?>
                <span class="ap-card__empty">AKSEN <em>PHOTO</em></span>
            <?php endif; ?>
        </a>
        <div class="ap-card__text">
            <span class="ap-micro"><?php echo esc_html(get_the_date('d.m.Y', $post)); ?></span>
            <h3><a href="<?php echo esc_url($permalink); ?>"><?php echo esc_html(get_the_title($post)); ?></a></h3>
            <?php if ($class !== 'ap-card--compact'): ?><p><?php echo esc_html(aksen_atelier_excerpt($post, 22)); ?></p><?php endif; ?>
            <a class="ap-text-link" href="<?php echo esc_url($permalink); ?>">Zobacz więcej <span aria-hidden="true">↗</span></a>
        </div>
    </article>
    <?php
}

function aksen_atelier_list_posts(int $per_page = 9, int $paged = 1): void {
    $query = new WP_Query(['post_type' => 'post', 'post_status' => 'publish', 'posts_per_page' => $per_page, 'paged' => max(1, $paged), 'ignore_sticky_posts' => true]);
    if (!$query->have_posts()) {
        echo '<p>Brak wpisów.</p>';
        return;
    }
    echo '<div class="ap-blog-grid">';
    while ($query->have_posts()) {
        $query->the_post();
        aksen_atelier_card(get_post());
    }
    echo '</div>';
    if ($query->max_num_pages > 1) {
        $base = aksen_atelier_url('blog-fotograficzny');
        echo '<nav class="ap-pagination" aria-label="Strony bloga">';
        for ($i = 1; $i <= (int) $query->max_num_pages && $i < 30; $i++) {
            $url = add_query_arg('blogpage', $i, $base);
            echo '<a ' . ($i === $paged ? 'aria-current="page" ' : '') . 'href="' . esc_url($url) . '">' . esc_html((string) $i) . '</a>';
        }
        echo '</nav>';
    }
    wp_reset_postdata();
}

/** Honor explicit staging noindex settings; avoid modifying the production source site. */
add_filter('wp_robots', static function (array $robots): array {
    if (get_option('blog_public') === '0') {
        $robots['noindex'] = true;
        $robots['nofollow'] = true;
        $robots['noarchive'] = true;
    }
    return $robots;
});

/** Show noindex only on test: search engines should not read parallel content. */
add_action('send_headers', static function (): void {
    if (str_starts_with((string) home_url('/'), 'https://test.aksen-photo.pl/')) {
        header('X-Robots-Tag: noindex, nofollow, noarchive', true);
    }
});

