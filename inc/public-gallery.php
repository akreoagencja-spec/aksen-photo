<?php
/**
 * Aksen Atelier: public galleries powered by native WordPress attachments.
 *
 * Supports [aksen_gallery ids="12,34,56" per_page="24" id="reportaz"].
 * Also enhances core [gallery ids="..."] only on public pages and posts.
 * No media imports, new tables, plugin dependencies or interaction with Picu.
 */
declare(strict_types=1);
defined('ABSPATH') || exit;

add_action('wp_enqueue_scripts', static function (): void {
    $path = '/assets/js/public-gallery.js';
    wp_register_script(
        'aksen-public-gallery',
        get_theme_file_uri($path),
        [],
        (string) filemtime(get_theme_file_path($path)),
        true
    );
    wp_script_add_data('aksen-public-gallery', 'strategy', 'defer');
});

/** Private Picu collections and their image files must never appear in public galleries. */
function aksen_public_is_safe_attachment(int $id): bool {
    $post = get_post($id);
    if (!$post instanceof WP_Post || $post->post_type !== 'attachment') {
        return false;
    }
    if (!wp_attachment_is_image($id) || !in_array($post->post_status, ['inherit', 'publish'], true)) {
        return false;
    }
    if ($post->post_parent > 0 && get_post_type((int) $post->post_parent) === 'picu_collection') {
        return false;
    }

    $file = get_post_meta($id, '_wp_attached_file', true);
    if (!is_string($file) || $file === '') {
        return false;
    }

    $relative = ltrim(str_replace('\\', '/', $file), '/');
    // Subdirectories and unusual Picu paths are excluded as a second safeguard.
    if (preg_match('~(?:^|/)picu/(?:collections/)?~i', $relative)) {
        return false;
    }
    return true;
}

/** Image IDs in shortcode markup are trusted only after WP attachment validation. */
function aksen_public_gallery_ids(string $raw): array {
    $parsed = preg_split('/[\s,]+/', trim($raw)) ?: [];
    $ids = [];
    foreach (array_slice($parsed, 0, 2500) as $item) {
        if ($item === '' || !ctype_digit($item)) {
            continue;
        }
        $id = (int) $item;
        if ($id > 0 && !in_array($id, $ids, true) && aksen_public_is_safe_attachment($id)) {
            $ids[] = $id;
        }
    }
    return $ids;
}

/**
 * Render only a page of images, avoiding hundreds of <img> tags on first load.
 * Full-resolution files are requested only when the user opens a lightbox.
 */
function aksen_public_gallery_render(array $ids, string $name = 'portfolio', int $per_page = 24): string {
    if (!is_singular(['page', 'post']) || !$ids) {
        return '';
    }

    $per_page = min(48, max(6, $per_page));
    $gallery_name = sanitize_key($name);
    $gallery_name = $gallery_name !== '' ? $gallery_name : substr(md5(implode(',', $ids)), 0, 10);
    $gallery_id = 'aksen-gallery-' . $gallery_name;
    $page_key = 'apg_' . substr(md5($gallery_id), 0, 10);
    $page_count = (int) ceil(count($ids) / $per_page);
    $requested = isset($_GET[$page_key]) && is_scalar($_GET[$page_key])
        ? absint(wp_unslash((string) $_GET[$page_key]))
        : 1;
    $page = max(1, min($page_count, $requested));
    $slice = array_slice($ids, ($page - 1) * $per_page, $per_page);
    $base_url = get_permalink(get_queried_object_id()) ?: home_url('/');

    wp_enqueue_script('aksen-public-gallery');

    ob_start();
    ?>
    <section
        class="aksen-public-gallery"
        id="<?php echo esc_attr($gallery_id); ?>"
        aria-label="<?php echo esc_attr('Galeria fotografii – ' . $gallery_name); ?>"
        data-aksen-public-gallery
    >
        <div class="aksen-public-gallery__photos">
            <?php foreach ($slice as $offset => $id):
                $full = wp_get_attachment_image_url($id, '2048x2048');
                if (!$full) {
                    continue;
                }
                $alt = trim((string) get_post_meta($id, '_wp_attachment_image_alt', true));
                if ($alt === '') {
                    $alt = trim((string) get_the_title($id));
                }
                if ($alt === '') {
                    $alt = 'Fotografia Aksen Photo';
                }
                $caption = (string) wp_get_attachment_caption($id);
                $img = wp_get_attachment_image($id, 'large', false, [
                    'alt' => $alt,
                    'loading' => 'lazy',
                    'decoding' => 'async',
                    'class' => 'aksen-public-gallery__image',
                    'sizes' => '(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) 47vw, 31vw',
                ]);
                if ($img === '') {
                    continue;
                }
            ?>
                <figure class="aksen-public-gallery__item">
                    <a href="<?php echo esc_url($full); ?>"
                       data-ap-gallery-image
                       aria-label="<?php echo esc_attr('Powiększ zdjęcie ' . (($page - 1) * $per_page + $offset + 1)); ?>">
                        <?php echo $img; // WordPress attachment HTML. ?>
                    </a>
                    <?php if ($caption !== ''): ?><figcaption><?php echo esc_html($caption); ?></figcaption><?php endif; ?>
                </figure>
            <?php endforeach; ?>
        </div>
        <?php if ($page_count > 1):
            $first = max(1, $page - 2);
            $last = min($page_count, $page + 2);
        ?>
            <nav class="aksen-public-gallery__pagination" aria-label="Strony galerii">
                <?php if ($page > 1):
                    $url = add_query_arg($page_key, $page - 1, $base_url) . '#' . $gallery_id; ?>
                    <a href="<?php echo esc_url($url); ?>">← Poprzednia</a>
                <?php endif; ?>
                <?php for ($n = $first; $n <= $last; $n++):
                    $url = add_query_arg($page_key, $n, $base_url) . '#' . $gallery_id; ?>
                    <a href="<?php echo esc_url($url); ?>"
                       <?php if ($n === $page): ?>aria-current="page"<?php endif; ?>><?php echo esc_html((string) $n); ?></a>
                <?php endfor; ?>
                <?php if ($page < $page_count):
                    $url = add_query_arg($page_key, $page + 1, $base_url) . '#' . $gallery_id; ?>
                    <a href="<?php echo esc_url($url); ?>">Następna →</a>
                <?php endif; ?>
            </nav>
            <p class="aksen-public-gallery__counter">
                <?php echo esc_html(sprintf('Zdjęcia %d–%d z %d', ($page - 1) * $per_page + 1, min($page * $per_page, count($ids)), count($ids))); ?>
            </p>
        <?php endif; ?>
    </section>
    <?php
    return (string) ob_get_clean();
}

add_shortcode('aksen_gallery', static function ($atts): string {
    $attributes = shortcode_atts([
        'ids' => '',
        'id' => '',
        'per_page' => '24',
    ], is_array($atts) ? $atts : [], 'aksen_gallery');

    $raw = (string) $attributes['ids'];
    $name = (string) $attributes['id'];
    if ($name === '') {
        $name = substr(md5($raw), 0, 10);
    }
    return aksen_public_gallery_render(
        aksen_public_gallery_ids($raw),
        $name,
        (int) $attributes['per_page']
    );
});

/** Keep existing core [gallery] shortcodes working, without touching Picu. */
add_filter('post_gallery', static function ($output, $atts, $instance) {
    if (!is_singular(['page', 'post']) || !empty($output) || !is_array($atts) || empty($atts['ids'])) {
        return $output;
    }
    $raw = (string) $atts['ids'];
    $ids = aksen_public_gallery_ids($raw);
    if (!$ids) {
        return $output;
    }
    $key = 'native-' . (int) $instance . '-' . substr(md5($raw), 0, 7);
    return aksen_public_gallery_render($ids, $key, 24);
}, 10, 3);
