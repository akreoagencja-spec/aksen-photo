<?php
/**
 * Aksen Atelier: first-party measurement bootstrap.
 *
 * All events and tags live in theme source. No analytics WP plugin required.
 * Does not replace consent collection: CookieYes remains the CMP until the
 * operator intentionally replaces it with another legally reviewed banner.
 *
 * Rollout safety: disabled until AKSEN_ANALYTICS_ACTIVE is set to true.
 * Also disabled on staging, non-public sites, and non-HTTPS connections.
 */
declare(strict_types=1);
defined('ABSPATH') || exit;

/** @return array<string, mixed> */
function aksen_atelier_analytics_config(): array
{
    $hostname = (string) wp_parse_url(home_url('/'), PHP_URL_HOST);
    $active = defined('AKSEN_ANALYTICS_ACTIVE')
        && AKSEN_ANALYTICS_ACTIVE === true
        && in_array($hostname, ['aksen-photo.pl', 'www.aksen-photo.pl'], true)
        && (string) get_option('blog_public') === '1'
        && is_ssl();

    $ga4 = defined('AKSEN_GA4_ID') ? (string) constant('AKSEN_GA4_ID') : 'G-PQFD3M4VTP';
    $pixel = defined('AKSEN_META_PIXEL_ID') ? (string) constant('AKSEN_META_PIXEL_ID') : '2998967330426508';
    $googleAds = defined('AKSEN_GOOGLE_ADS_ID') ? (string) constant('AKSEN_GOOGLE_ADS_ID') : '';
    $googleAdsLabel = defined('AKSEN_GOOGLE_ADS_LEAD_LABEL') ? (string) constant('AKSEN_GOOGLE_ADS_LEAD_LABEL') : '';

    return [
        'active' => $active,
        'ga4' => preg_match('/^G-[A-Z0-9]+$/', $ga4) ? $ga4 : '',
        'pixel' => preg_match('/^[0-9]{10,20}$/', $pixel) ? $pixel : '',
        // Only use a verified AW ID and its lead conversion label.
        'adsId' => preg_match('/^AW-[0-9]+$/', $googleAds) ? $googleAds : '',
        'adsLabel' => preg_match('/^[a-zA-Z0-9_-]{4,120}$/', $googleAdsLabel) ? $googleAdsLabel : '',
    ];
}

/**
 * Set a fail-closed Google Consent Mode v2 default synchronously, before any
 * Google tags. CMP can update the status when a user consents. This code never
 * loads Google or Meta scripts before an explicit CMP consent.
 */
add_action('wp_head', static function (): void {
    if (aksen_atelier_analytics_config()['active'] !== true) {
        return;
    }
    echo '<script id="aksen-consent-default">';
    echo 'window.dataLayer=window.dataLayer||[];';
    echo 'window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};';
    echo 'window.gtag("consent","default",{';
    echo '"analytics_storage":"denied","ad_storage":"denied",';
    echo '"ad_user_data":"denied","ad_personalization":"denied",';
    echo '"wait_for_update":500';
    echo '});';
    echo '</script>' . "\n";
}, -100);

/**
 * Add only a local script with public configuration. No measurement requests
 * happen here. Script loads after the form-event listener.
 */
add_action('wp_enqueue_scripts', static function (): void {
    $cfg = aksen_atelier_analytics_config();
    if ($cfg['active'] !== true) {
        return;
    }

    $file = '/assets/js/aksen-analytics.js';
    wp_enqueue_script(
        'aksen-analytics',
        get_theme_file_uri($file),
        ['aksen-lead-events'],
        (string) filemtime(get_theme_file_path($file)),
        true
    );
    wp_add_inline_script(
        'aksen-analytics',
        'window.AksenAnalyticsConfig=' . wp_json_encode(
            $cfg,
            JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
        ) . ';',
        'before'
    );
    wp_script_add_data('aksen-analytics', 'strategy', 'defer');
}, 30);
