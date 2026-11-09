<?php
/** Offline PHP checks for Picu protection and public gallery ID parsing. */
declare(strict_types=1);
define('ABSPATH', __DIR__);

class WP_Post {
    public function __construct(
        public int $ID,
        public string $post_type = 'attachment',
        public string $post_status = 'inherit',
        public int $post_parent = 0
    ) {}
}
$GLOBALS['gallery_posts'] = [
    10 => new WP_Post(10),
    11 => new WP_Post(11),
    12 => new WP_Post(12),
    13 => new WP_Post(13, 'attachment', 'private'),
    14 => new WP_Post(14, 'attachment', 'inherit', 24),
    15 => new WP_Post(15, 'post', 'publish'),
    16 => new WP_Post(16),
];
$GLOBALS['gallery_files'] = [
    10 => '2026/08/10.jpg',
    11 => 'picu/collections/123/photo.jpg',
    12 => '2026/08/12.jpeg',
    13 => '2026/08/private.jpg',
    14 => '2026/08/parent-private.jpg',
    16 => 'uploads/picu/collections/987/16.jpg',
];
$GLOBALS['gallery_image'] = [10 => true, 11 => true, 12 => true, 13 => true, 14 => true, 16 => true];
$GLOBALS['gallery_queries'] = 0;
$GLOBALS['gallery_shortcodes'] = [];

function add_action(...$args): void {}
function add_filter(...$args): void {}
function add_shortcode($name, $callable): void { $GLOBALS['gallery_shortcodes'][$name] = $callable; }
function get_post(int $id): ?WP_Post { return $GLOBALS['gallery_posts'][$id] ?? null; }
function get_post_type(int $id): string { return $id === 24 ? 'picu_collection' : ''; }
function wp_attachment_is_image(int $id): bool { return $GLOBALS['gallery_image'][$id] ?? false; }
function get_post_meta(int $id, string $key, bool $single = true): string {
    return $GLOBALS['gallery_files'][$id] ?? '';
}
function get_posts(array $args): array {
    $GLOBALS['gallery_queries']++;
    return array_values(array_filter(
        array_map(static fn(int $id): ?WP_Post => get_post($id), $args['post__in']),
        static fn($post): bool => $post instanceof WP_Post
    ));
}

require dirname(__DIR__) . '/inc/public-gallery.php';

function check(bool $condition, string $message): void {
    if (!$condition) {
        fwrite(STDERR, "FAIL: $message\n");
        exit(1);
    }
}

check(aksen_public_is_safe_attachment(10), 'Public attachment is allowed');
check(!aksen_public_is_safe_attachment(11), 'Picu filesystem image is blocked');
check(!aksen_public_is_safe_attachment(13), 'Private attachment is blocked');
check(!aksen_public_is_safe_attachment(14), 'Attachment linked to Picu collection is blocked');
check(!aksen_public_is_safe_attachment(15), 'Posts are not treated as media');
check(!aksen_public_is_safe_attachment(16), 'Nested picu directory is blocked');

$ids = aksen_public_gallery_ids('10, 11,12,12,13,14,15,16,abc,0,999');
check($ids === [10, 12], 'Only safe, original-order unique public photos survive');
check($GLOBALS['gallery_queries'] === 1, 'Metadata is prefetched in one query');
check(isset($GLOBALS['gallery_shortcodes']['aksen_gallery']), 'Native shortcode registered');

echo "PASS: Picu exclusion, private attachment exclusion, deduplication, ordering, batched metadata\n";
