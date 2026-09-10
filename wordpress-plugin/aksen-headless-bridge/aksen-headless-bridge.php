<?php
/**
 * Plugin Name: Aksen Headless Bridge
 * Description: Secure bridge between Aksen Photo WordPress CMS and the Next.js frontend.
 * Version: 1.1.0
 * Author: Aksen Photo
 * Requires at least: 6.4
 * Requires PHP: 8.1
 */

if (!defined('ABSPATH')) {
    exit;
}

final class Aksen_Headless_Bridge {
    private const VERSION = '1.1.0';
    private const OPT_URL = 'aksen_bridge_revalidate_url';
    private const OPT_AUTO = 'aksen_bridge_auto_revalidate';
    private const OPT_REVALIDATE_SECRET = 'aksen_bridge_revalidate_secret';
    private const OPT_CONTACT_SECRET = 'aksen_bridge_contact_secret';
    private const OPT_CONTACT_TO = 'aksen_bridge_contact_to';
    private const CIPHER = 'aes-256-gcm';
    private const MAX_MESSAGE = 5000;

    public static function boot(): void {
        add_action('rest_api_init', [self::class, 'register_routes']);
        add_action('admin_menu', [self::class, 'admin_menu']);
        add_action('admin_post_aksen_bridge_save', [self::class, 'save_settings']);
        add_action('admin_post_aksen_bridge_test', [self::class, 'test_connection']);
        add_action('save_post', [self::class, 'on_save_post'], 20, 3);
        add_action('created_term', [self::class, 'on_term_change'], 20, 3);
        add_action('edited_term', [self::class, 'on_term_change'], 20, 3);
    }

    public static function register_routes(): void {
        register_rest_route('aksen-headless/v1', '/contact', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [self::class, 'contact'],
            'permission_callback' => [self::class, 'contact_permission'],
        ]);

        register_rest_route('aksen-headless/v1', '/health', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => static fn() => new WP_REST_Response([
                'ok' => true,
            ], 200),
            'permission_callback' => '__return_true',
        ]);
    }

    public static function contact_permission(WP_REST_Request $request) {
        $expected = self::get_secret(self::OPT_CONTACT_SECRET);
        $provided = (string) $request->get_header('x-aksen-secret');

        if (strlen($expected) < 24 || strlen($provided) !== strlen($expected) || !hash_equals($expected, $provided)) {
            return new WP_Error('aksen_unauthorized', 'Unauthorized', ['status' => 401]);
        }

        return true;
    }

    public static function contact(WP_REST_Request $request): WP_REST_Response {
        $data = $request->get_json_params();
        if (!is_array($data)) {
            return new WP_REST_Response(['ok' => false], 400);
        }

        $name = self::single_line($data['name'] ?? '', 120);
        $email = sanitize_email((string) ($data['email'] ?? ''));
        $phone = self::single_line($data['phone'] ?? '', 50);
        $date = self::single_line($data['date'] ?? '', 20);
        $place = self::single_line($data['place'] ?? '', 200);
        $message = sanitize_textarea_field((string) ($data['message'] ?? ''));
        $privacy = (string) ($data['privacy'] ?? '') === '1';

        if (mb_strlen($message) > self::MAX_MESSAGE) {
            $message = mb_substr($message, 0, self::MAX_MESSAGE);
        }

        if (mb_strlen($name) < 2 || !is_email($email) || mb_strlen($message) < 10 || !$privacy) {
            return new WP_REST_Response(['ok' => false], 400);
        }

        $dedupe_key = 'aksen_contact_' . hash('sha256', strtolower($email) . "\n" . $message);
        if (get_transient($dedupe_key)) {
            return new WP_REST_Response(['ok' => true], 200);
        }

        $to = sanitize_email((string) get_option(self::OPT_CONTACT_TO, ''));
        if (!$to || !is_email($to)) {
            $to = sanitize_email((string) get_option('admin_email', ''));
        }
        if (!$to || !is_email($to)) {
            return new WP_REST_Response(['ok' => false], 503);
        }

        $subject = 'Aksen Photo — nowe zapytanie: ' . $name;
        $lines = [
            'Imię i nazwisko: ' . $name,
            'E-mail: ' . $email,
            'Telefon: ' . ($phone ?: '—'),
            'Data: ' . ($date ?: '—'),
            'Miejsce: ' . ($place ?: '—'),
            '',
            'Wiadomość:',
            $message,
        ];
        $headers = [
            'Content-Type: text/plain; charset=UTF-8',
            'Reply-To: ' . $email,
        ];

        $sent = wp_mail($to, $subject, implode("\n", $lines), $headers);
        if (!$sent) {
            return new WP_REST_Response(['ok' => false], 503);
        }

        set_transient($dedupe_key, 1, 5 * MINUTE_IN_SECONDS);
        return new WP_REST_Response(['ok' => true], 200);
    }

    public static function admin_menu(): void {
        add_options_page(
            'Aksen Headless Bridge',
            'Aksen Headless Bridge',
            'manage_options',
            'aksen-headless-bridge',
            [self::class, 'settings_page']
        );
    }

    public static function settings_page(): void {
        if (!current_user_can('manage_options')) {
            return;
        }

        $url = esc_attr((string) get_option(self::OPT_URL, ''));
        $to = esc_attr((string) get_option(self::OPT_CONTACT_TO, get_option('admin_email', '')));
        $auto = (bool) get_option(self::OPT_AUTO, false);
        $status = isset($_GET['aksen_status']) ? sanitize_key((string) $_GET['aksen_status']) : '';

        echo '<div class="wrap"><h1>Aksen Headless Bridge</h1>';
        if ($status === 'saved') {
            echo '<div class="notice notice-success"><p>Ustawienia zapisane.</p></div>';
        } elseif ($status === 'test_ok') {
            echo '<div class="notice notice-success"><p>Połączenie działa.</p></div>';
        } elseif ($status === 'test_fail') {
            echo '<div class="notice notice-error"><p>Test połączenia nie powiódł się. Sprawdź adres, ochronę Vercel i sekret.</p></div>';
        }

        echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
        wp_nonce_field('aksen_bridge_save');
        echo '<input type="hidden" name="action" value="aksen_bridge_save">';
        echo '<table class="form-table" role="presentation">';
        echo '<tr><th scope="row"><label for="aksen_url">Adres /api/revalidate</label></th><td><input class="regular-text" id="aksen_url" name="revalidate_url" type="url" value="' . $url . '" placeholder="https://.../api/revalidate"></td></tr>';
        echo '<tr><th scope="row"><label for="aksen_revalidate_secret">Sekret odświeżania</label></th><td><input class="regular-text" id="aksen_revalidate_secret" name="revalidate_secret" type="password" value="" autocomplete="new-password"><p class="description">Pozostaw puste, aby zachować obecny sekret.</p></td></tr>';
        echo '<tr><th scope="row"><label for="aksen_contact_secret">Sekret formularza</label></th><td><input class="regular-text" id="aksen_contact_secret" name="contact_secret" type="password" value="" autocomplete="new-password"><p class="description">Musi być zgodny z WORDPRESS_BRIDGE_SECRET w Vercel.</p></td></tr>';
        echo '<tr><th scope="row"><label for="aksen_contact_to">Adres odbiorcy formularza</label></th><td><input class="regular-text" id="aksen_contact_to" name="contact_to" type="email" value="' . $to . '"></td></tr>';
        echo '<tr><th scope="row">Automatyczne odświeżanie</th><td><label><input type="checkbox" name="auto_revalidate" value="1" ' . checked($auto, true, false) . '> Wysyłaj odświeżenie po zmianie treści</label></td></tr>';
        echo '</table>';
        submit_button('Zapisz ustawienia');
        echo '</form>';

        echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" style="margin-top:12px">';
        wp_nonce_field('aksen_bridge_test');
        echo '<input type="hidden" name="action" value="aksen_bridge_test">';
        submit_button('Przetestuj połączenie', 'secondary', 'submit', false);
        echo '</form></div>';
    }

    public static function save_settings(): void {
        if (!current_user_can('manage_options')) {
            wp_die('Forbidden', '', ['response' => 403]);
        }
        check_admin_referer('aksen_bridge_save');

        $url = self::sanitize_revalidate_url((string) ($_POST['revalidate_url'] ?? ''));
        $to = sanitize_email((string) ($_POST['contact_to'] ?? ''));
        $auto = isset($_POST['auto_revalidate']) ? 1 : 0;

        update_option(self::OPT_URL, $url, false);
        update_option(self::OPT_AUTO, $auto, false);
        if ($to && is_email($to)) {
            update_option(self::OPT_CONTACT_TO, $to, false);
        }

        $revalidate_secret = trim((string) ($_POST['revalidate_secret'] ?? ''));
        if ($revalidate_secret !== '') {
            self::set_secret(self::OPT_REVALIDATE_SECRET, $revalidate_secret);
        }

        $contact_secret = trim((string) ($_POST['contact_secret'] ?? ''));
        if ($contact_secret !== '') {
            self::set_secret(self::OPT_CONTACT_SECRET, $contact_secret);
        }

        wp_safe_redirect(add_query_arg('aksen_status', 'saved', admin_url('options-general.php?page=aksen-headless-bridge')));
        exit;
    }

    public static function test_connection(): void {
        if (!current_user_can('manage_options')) {
            wp_die('Forbidden', '', ['response' => 403]);
        }
        check_admin_referer('aksen_bridge_test');

        $ok = self::send_revalidate('/');
        wp_safe_redirect(add_query_arg('aksen_status', $ok ? 'test_ok' : 'test_fail', admin_url('options-general.php?page=aksen-headless-bridge')));
        exit;
    }

    public static function on_save_post(int $post_id, WP_Post $post, bool $update): void {
        if (!get_option(self::OPT_AUTO, false)) {
            return;
        }
        if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
            return;
        }
        if ($post->post_status !== 'publish') {
            return;
        }

        $permalink = get_permalink($post_id);
        $path = is_string($permalink) ? wp_parse_url($permalink, PHP_URL_PATH) : '/';
        self::send_revalidate(is_string($path) && $path !== '' ? $path : '/');
    }

    public static function on_term_change(int $term_id, int $tt_id, string $taxonomy): void {
        if (!get_option(self::OPT_AUTO, false)) {
            return;
        }
        if (!in_array($taxonomy, ['category', 'post_tag'], true)) {
            return;
        }

        $link = get_term_link($term_id, $taxonomy);
        if (is_wp_error($link)) {
            return;
        }
        $path = wp_parse_url($link, PHP_URL_PATH);
        self::send_revalidate(is_string($path) && $path !== '' ? $path : '/');
    }

    private static function send_revalidate(string $path): bool {
        $url = self::sanitize_revalidate_url((string) get_option(self::OPT_URL, ''));
        $secret = self::get_secret(self::OPT_REVALIDATE_SECRET);
        if ($url === '' || strlen($secret) < 32) {
            return false;
        }

        $response = wp_safe_remote_post($url, [
            'timeout' => 7,
            'redirection' => 0,
            'headers' => [
                'Content-Type' => 'application/json',
                'X-Revalidate-Secret' => $secret,
            ],
            'body' => wp_json_encode(['path' => self::normalize_path($path)]),
            'data_format' => 'body',
            'reject_unsafe_urls' => true,
        ]);

        if (is_wp_error($response)) {
            return false;
        }

        $code = (int) wp_remote_retrieve_response_code($response);
        return $code >= 200 && $code < 300;
    }

    private static function sanitize_revalidate_url(string $value): string {
        $url = esc_url_raw(trim($value), ['https']);
        if ($url === '') {
            return '';
        }

        $parts = wp_parse_url($url);
        if (!is_array($parts) || ($parts['scheme'] ?? '') !== 'https' || empty($parts['host'])) {
            return '';
        }

        $host = strtolower((string) $parts['host']);
        $allowed = $host === 'aksen-photo.pl' || $host === 'www.aksen-photo.pl' || str_ends_with($host, '.vercel.app');
        if (!$allowed) {
            return '';
        }

        $path = (string) ($parts['path'] ?? '');
        if ($path !== '/api/revalidate') {
            return '';
        }
        if (isset($parts['user']) || isset($parts['pass']) || isset($parts['query']) || isset($parts['fragment'])) {
            return '';
        }

        return 'https://' . $host . '/api/revalidate';
    }

    private static function normalize_path(string $path): string {
        $path = '/' . ltrim($path, '/');
        $path = preg_replace('#/+#', '/', $path) ?: '/';
        if (strlen($path) > 512 || str_contains($path, "\r") || str_contains($path, "\n") || str_contains($path, '\\') || str_contains($path, '?') || str_contains($path, '#')) {
            return '/';
        }
        return $path;
    }

    private static function single_line($value, int $max): string {
        $value = sanitize_text_field((string) $value);
        if (mb_strlen($value) > $max) {
            return mb_substr($value, 0, $max);
        }
        return $value;
    }

    private static function encryption_key(): string {
        $material = wp_salt('auth') . '|' . wp_salt('secure_auth') . '|aksen-headless-bridge';
        return hash('sha256', $material, true);
    }

    private static function set_secret(string $option, string $secret): void {
        if ($secret === '') {
            return;
        }
        if (!function_exists('openssl_encrypt')) {
            return;
        }

        $iv = random_bytes(12);
        $tag = '';
        $ciphertext = openssl_encrypt($secret, self::CIPHER, self::encryption_key(), OPENSSL_RAW_DATA, $iv, $tag);
        if ($ciphertext === false || $tag === '') {
            return;
        }

        $payload = base64_encode($iv . $tag . $ciphertext);
        update_option($option, $payload, false);
    }

    private static function get_secret(string $option): string {
        if (!function_exists('openssl_decrypt')) {
            return '';
        }

        $payload = (string) get_option($option, '');
        if ($payload === '') {
            return '';
        }
        $decoded = base64_decode($payload, true);
        if ($decoded === false || strlen($decoded) < 29) {
            return '';
        }

        $iv = substr($decoded, 0, 12);
        $tag = substr($decoded, 12, 16);
        $ciphertext = substr($decoded, 28);
        $plain = openssl_decrypt($ciphertext, self::CIPHER, self::encryption_key(), OPENSSL_RAW_DATA, $iv, $tag);
        return is_string($plain) ? $plain : '';
    }
}

Aksen_Headless_Bridge::boot();
