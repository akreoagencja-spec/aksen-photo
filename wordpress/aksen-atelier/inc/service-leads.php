<?php
/**
 * Aksen Photo – service-specific Fluent Forms and conversion data layer.
 *
 * Staging-only form provisioning; frontend code remains compatible with production
 * after explicit approval. Never modifies the existing contact form (ID 3).
 *
 * Integration: require_once get_stylesheet_directory() . '/inc/service-leads.php';
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

/** Per-service question specifications. All additional fields are optional. */
function aksen_service_lead_specs(): array
{
    return [
        'wedding' => [
            'title' => 'Ślub i wesele',
            'date_label' => 'Data ślubu (jeśli znana)',
            'message_label' => 'Napisz, jaki reportaż planujecie',
            'fields' => [
                ['select', 'ceremony', 'Rodzaj ceremonii', ['Ślub kościelny', 'Ślub cywilny', 'Ślub humanistyczny', 'Inny']],
                ['select', 'coverage', 'Zakres reportażu', ['Sama ceremonia i zdjęcia rodzinne', 'Ceremonia + kilka godzin wesela', 'Cały dzień do oczepin', 'Jeszcze nie wiem']],
                ['text', 'venue', 'Miejsce ceremonii i wesela', 'Miejscowość / sala'],
            ],
        ],
        'usc' => [
            'title' => 'Ślub cywilny / USC',
            'date_label' => 'Data ceremonii w USC',
            'message_label' => 'Opisz ceremonię i planowany plener',
            'fields' => [
                ['text', 'registry_office', 'Urząd Stanu Cywilnego / lokalizacja', 'np. USC Szczecin'],
                ['select', 'usc_coverage', 'Jakiego zakresu potrzebujecie?', ['Sama ceremonia', 'Ceremonia i zdjęcia rodzinne', 'Ceremonia, rodzina i plener', 'Ceremonia i przyjęcie']],
                ['text', 'usc_guests', 'Przybliżona liczba gości', 'np. 20'],
            ],
        ],
        'communion' => [
            'title' => 'Komunia Święta',
            'date_label' => 'Data Komunii Świętej',
            'message_label' => 'Opisz uroczystość i oczekiwania',
            'fields' => [
                ['select', 'communion_type', 'Rodzaj zlecenia', ['Jedno dziecko', 'Reportaż grupowy w kościele', 'Reportaż z przyjęcia', 'Kościół i przyjęcie']],
                ['text', 'parish', 'Parafia / miejscowość', 'Nazwa kościoła'],
                ['text', 'children_count', 'Liczba dzieci (przy fotografii grupowej)', 'np. 8'],
            ],
        ],
        'baptism' => [
            'title' => 'Chrzest Święty',
            'date_label' => 'Data chrztu',
            'message_label' => 'Opisz ceremonię i rodzinne przyjęcie',
            'fields' => [
                ['text', 'parish', 'Kościół / miejscowość', 'Parafia'],
                ['select', 'baptism_coverage', 'Co fotografujemy?', ['Sam chrzest w kościele', 'Kościół i zdjęcia rodzinne', 'Kościół i przyjęcie', 'Przygotowania, kościół i przyjęcie']],
                ['text', 'baptism_venue', 'Lokalizacja przyjęcia (opcjonalnie)', 'Sala lub restauracja'],
            ],
        ],
        'birthday' => [
            'title' => 'Urodziny i 18-stki',
            'date_label' => 'Data przyjęcia',
            'message_label' => 'Podaj godziny i najważniejsze momenty imprezy',
            'fields' => [
                ['select', 'occasion', 'Rodzaj imprezy', ['18. urodziny', 'Inne urodziny', 'Jubileusz / rocznica', 'Inna uroczystość']],
                ['text', 'party_venue', 'Miejsce imprezy', 'Miejscowość / sala'],
                ['select', 'birthday_movie', 'Czy interesuje Cię krótki film?', ['Tak', 'Nie', 'Do ustalenia']],
            ],
        ],
        'prom' => [
            'title' => 'Studniówka',
            'date_label' => 'Data studniówki',
            'message_label' => 'Podaj orientacyjne godziny, plan i oczekiwania',
            'fields' => [
                ['text', 'school', 'Szkoła / miejscowość', 'Nazwa szkoły'],
                ['text', 'prom_participants', 'Przybliżona liczba uczestników', 'np. 150'],
                ['select', 'prom_coverage', 'Zakres zdjęć', ['Polonez i zdjęcia grupowe', 'Część oficjalna i zabawa', 'Cały wieczór', 'Do ustalenia']],
            ],
        ],
        'business' => [
            'title' => 'Sesja biznesowa',
            'date_label' => 'Preferowany termin sesji',
            'message_label' => 'Opisz firmę, cel zdjęć i sposób ich wykorzystania',
            'fields' => [
                ['select', 'business_goal', 'Do czego potrzebne są zdjęcia?', ['LinkedIn / CV', 'Strona internetowa firmy', 'Portrety zespołu', 'Personal branding', 'Materiały reklamowe']],
                ['text', 'people_count', 'Ile osób fotografujemy?', 'np. 3'],
                ['select', 'business_place', 'Gdzie ma odbyć się sesja?', ['W firmie', 'W plenerze', 'W ustalonym wnętrzu', 'Proszę o propozycję']],
            ],
        ],
        'event' => [
            'title' => 'Event i reportaż',
            'date_label' => 'Data wydarzenia',
            'message_label' => 'Opisz wydarzenie i jego harmonogram',
            'fields' => [
                ['select', 'event_type', 'Rodzaj wydarzenia', ['Event firmowy', 'Jubileusz', 'Koncert / festiwal', 'Spotkanie rodzinne', 'Inne']],
                ['text', 'event_attendees', 'Przybliżona liczba uczestników', 'np. 70'],
                ['text', 'event_hours', 'Planowany czas reportażu', 'np. 18:00–22:00'],
            ],
        ],
        'family' => [
            'title' => 'Sesja rodzinna',
            'date_label' => 'Preferowany termin sesji',
            'message_label' => 'Napisz, jaki klimat zdjęć lubicie',
            'fields' => [
                ['text', 'family_size', 'Ile osób weźmie udział?', 'np. 4'],
                ['select', 'family_place', 'Gdzie wolicie zdjęcia?', ['Plener', 'W domu', 'Inne wnętrze', 'Potrzebuję propozycji']],
                ['select', 'family_style', 'Styl zdjęć', ['Naturalny reportaż', 'Portrety rodzinne', 'Połączenie obu']],
            ],
        ],
        'engagement' => [
            'title' => 'Sesja narzeczeńska',
            'date_label' => 'Preferowany termin sesji',
            'message_label' => 'Opisz pomysł, lokalizację i klimat zdjęć',
            'fields' => [
                ['select', 'engagement_style', 'Gdzie chcielibyście zdjęcia?', ['Miasto', 'Natura / las', 'Nad wodą', 'Miejsce ważne dla nas', 'Do ustalenia']],
                ['select', 'engagement_timing', 'Kiedy myślicie o sesji?', ['Przed ślubem', 'Bez związku z terminem ślubu', 'Jeszcze nie wiem']],
            ],
        ],
        'pregnancy' => [
            'title' => 'Sesja ciążowa',
            'date_label' => 'Preferowany termin sesji',
            'message_label' => 'Opisz pomysł na sesję; nie podawaj informacji medycznych',
            'fields' => [
                ['select', 'pregnancy_place', 'Gdzie wolisz sesję?', ['Plener', 'W domu', 'Inne wnętrze', 'Chętnie posłucham propozycji']],
                ['select', 'pregnancy_people', 'Kto ma być na zdjęciach?', ['Tylko ja', 'Ja i partner', 'Rodzina', 'Do ustalenia']],
            ],
        ],
        'women' => [
            'title' => 'Sesja kobieca',
            'date_label' => 'Preferowany termin sesji',
            'message_label' => 'Napisz o swoim pomyśle i przeznaczeniu zdjęć',
            'fields' => [
                ['select', 'portrait_style', 'Jaki klimat zdjęć Ci odpowiada?', ['Naturalny portret', 'Sesja modowa', 'Artystyczna', 'Do ustalenia']],
                ['select', 'portrait_place', 'Preferowana lokalizacja', ['Plener', 'Studio / wnętrze', 'Nie mam preferencji']],
            ],
        ],
        'bachelorette' => [
            'title' => 'Wieczór panieński',
            'date_label' => 'Data wieczoru panieńskiego',
            'message_label' => 'Opisz harmonogram spotkania i lokalizację',
            'fields' => [
                ['text', 'bachelorette_guests', 'Liczba uczestniczek', 'np. 10'],
                ['select', 'bachelorette_coverage', 'Czego potrzebujecie?', ['Krótka sesja grupowa', 'Reportaż z wydarzenia', 'Plener i dalsza część imprezy']],
            ],
        ],
        'product' => [
            'title' => 'Fotografia produktowa',
            'date_label' => 'Planowany termin realizacji',
            'message_label' => 'Napisz, jakie produkty i formaty zdjęć są potrzebne',
            'fields' => [
                ['text', 'products_count', 'Ile produktów fotografujemy?', 'np. 25'],
                ['select', 'product_usage', 'Gdzie wykorzystasz zdjęcia?', ['Sklep internetowy', 'Allegro / marketplace', 'Social media / reklamy', 'Katalog drukowany', 'Kilka zastosowań']],
                ['select', 'product_style', 'Jaki rodzaj zdjęć?', ['Packshot na jasnym tle', 'Zdjęcia aranżowane', 'Oba rodzaje', 'Do ustalenia']],
            ],
        ],
        'tfp' => [
            'title' => 'Współpraca TFP',
            'date_label' => 'Proponowany termin sesji',
            'message_label' => 'Opisz pomysł na współpracę TFP',
            'fields' => [
                ['text', 'portfolio_link', 'Link do portfolio (opcjonalnie)', 'https://...'],
                ['select', 'tfp_project', 'Rodzaj projektu', ['Portret', 'Moda', 'Projekt kreatywny', 'Inny']],
            ],
        ],
        'local' => [
            'title' => 'Zapytanie o fotografa',
            'date_label' => 'Data wydarzenia lub sesji (opcjonalnie)',
            'message_label' => 'Podaj miasto, miejsce i oczekiwany zakres zdjęć',
            'fields' => [
                ['select', 'local_service', 'Rodzaj fotografii', ['Ślub i wesele', 'Ślub cywilny / USC', 'Chrzest', 'Komunia', 'Urodziny', 'Studniówka', 'Sesja biznesowa', 'Sesja rodzinna', 'Inny reportaż']],
                ['text', 'local_city', 'Miejscowość / lokalizacja', 'np. Szczecin'],
            ],
        ],
    ];
}

/** Map exact legacy slugs so changing page ids does not change form attribution. */
function aksen_service_lead_pages(): array
{
    return [
        'portfolio-slubne-aksen-photo-fotograf-slubny' => 'wedding',
        'fotograf-na-slub-cywilny-usc-szczecin' => 'usc',
        'fotograf-slub-cywilny-usc-szczecin' => 'usc',
        'fotograf-na-18-urodziny-w-szczecinie' => 'birthday',
        'fotografia-rodzinna-szczecin-zdjecia-rodzinne' => 'family',
        'fotograf-na-wieczor-panienski-szczecin-i-okolice' => 'bachelorette',
        'fotografia-kobieca-szczecin' => 'women',
        'fotografia-narzeczenska' => 'engagement',
        'sesja-zdjeciowa-tfp-darmowa-fotografia-szczecin' => 'tfp',
        'zdjecia-produktowe-szczecin-allegro-iai-amazon-olx' => 'product',
        'fotografia-wizerunkowa-i-biznesowa-szczecin' => 'business',
        'fotograf-na-komunie-szczecin' => 'communion',
        'fotograf-na-chrzest-swiety-szczecin' => 'baptism',
        'sesja-ciazowa-szczecin-fotografia-brzuszkowa' => 'pregnancy',
        'fotograf-na-studniowke-szczecin' => 'prom',
        'fotograf-na-eventy-i-reportaze-szczecin' => 'event',
        'fotograf-szczecin' => 'local',
        'fotograf-police' => 'local',
        'fotograf-stargard' => 'local',
        'fotograf-goleniow' => 'local',
        'fotograf-gryfino' => 'local',
        'fotograf-swinoujscie' => 'local',
    ];
}

function aksen_service_lead_current_type(): string
{
    if (!is_singular('page')) {
        return '';
    }
    $page = get_queried_object();
    if (!$page instanceof WP_Post) {
        return '';
    }
    return aksen_service_lead_pages()[$page->post_name] ?? '';
}

/**
 * Replace ONLY the existing shared form shortcode, preserving surrounding page
 * text, custom pricing, FAQ and page URL. Fail open if new forms aren't ready.
 */
add_filter('the_content', static function (string $content): string {
    if (is_admin() || !is_main_query() || !in_the_loop()) {
        return $content;
    }
    $type = aksen_service_lead_current_type();
    if (!$type) {
        return $content;
    }
    $form_ids = get_option('aksen_photo_service_form_ids', []);
    $form_id = is_array($form_ids) ? (int) ($form_ids[$type] ?? 0) : 0;
    if ($form_id < 1 || strpos($content, '[fluentform') === false) {
        return $content;
    }
    $patched = preg_replace('/\[fluentform\s+id=["\']?3["\']?\s*\]/', '[fluentform id="' . $form_id . '"]', $content, 1);
    if (!is_string($patched)) {
        return $content;
    }
    // Attribute is non-identifying. JS reads it for analytics.
    $patched = preg_replace('/<section\s+class="aksen-lead"/', '<section class="aksen-lead" data-aksen-service="' . esc_attr($type) . '"', $patched, 1) ?? $patched;
    return $patched;
}, 8);

/** Load a lightweight dataLayer listener globally for phone CTA attribution.
 * Service forms additionally receive view/start/success events when present.
 */
add_action('wp_enqueue_scripts', static function (): void {
    $type = aksen_service_lead_current_type();
    $page = get_queried_object();
    $is_contact = $page instanceof WP_Post && $page->post_name === 'kontakt-fotograf-szczecin-aksen-photo';
    $script = get_stylesheet_directory() . '/assets/js/aksen-lead-tracking.js';
    if (!is_readable($script)) {
        return;
    }
    wp_enqueue_script(
        'aksen-lead-tracking',
        get_stylesheet_directory_uri() . '/assets/js/aksen-lead-tracking.js',
        ['jquery'],
        (string) filemtime($script),
        true
    );
    wp_add_inline_script('aksen-lead-tracking', 'window.AksenLeadConfig = ' . wp_json_encode([
        'service' => $type ?: ($is_contact ? 'contact' : 'sitewide'),
        'contactFormId' => 3,
        'formIds' => get_option('aksen_photo_service_form_ids', []),
    ]) . ';', 'before');
}, 20);

/**
 * Staging-only, admin-approved, idempotent provisioning. Uses Fluent Forms'
 * own FormService duplicate and update methods; no direct SQL manipulation.
 */
add_action('admin_menu', static function (): void {
    if (!current_user_can('manage_options') || wp_parse_url(home_url('/'), PHP_URL_HOST) !== 'test.aksen-photo.pl') {
        return;
    }
    add_management_page('Aksen – formularze usługowe', 'Aksen – formularze usługowe', 'manage_options', 'aksen-service-forms', 'aksen_service_lead_admin_screen');
});

function aksen_service_lead_admin_screen(): void
{
    if (!current_user_can('manage_options')) {
        wp_die('Brak uprawnień.');
    }
    $ids = get_option('aksen_photo_service_form_ids', []);
    ?>
    <div class="wrap">
        <h1>Aksen Photo – indywidualne formularze leadowe</h1>
        <p>Istniejący formularz kontaktowy nr 3 pozostaje bez zmian. Każda usługa otrzymuje osobny formularz Fluent Forms, pytania i identyfikator do analityki.</p>
        <p>Wymagania: świeży backup bazy, aktywny Fluent Forms, testowa domena z blokadą indeksowania.</p>
        <p>Utworzone formularze: <strong><?php echo esc_html(is_array($ids) ? count($ids) : 0); ?></strong> / <?php echo esc_html(count(aksen_service_lead_specs())); ?></p>
        <form action="<?php echo esc_url(admin_url('admin-post.php')); ?>" method="post">
            <input type="hidden" name="action" value="aksen_provision_service_forms">
            <?php wp_nonce_field('aksen_provision_service_forms'); ?>
            <label><input type="checkbox" name="confirmed_backup" value="1" required> Potwierdzam wykonanie aktualnej kopii bazy stagingu.</label>
            <?php submit_button('Utwórz brakujące formularze (bez zmian na produkcji)'); ?>
        </form>
        <p><strong>Uwaga:</strong> uruchomienie jest idempotentne: istniejące formularze nie są nadpisywane. Zmiany ich treści wykonuje się później w edytorze Fluent Forms.</p>
    </div>
    <?php
}

/** Clone Fluent Forms fields with full schema inherited from the working form. */
function aksen_service_lead_build_fields(array $base_fields, array $spec, string $service): array
{
    $existing = $base_fields['fields'] ?? [];
    if (!is_array($existing)) {
        throw new RuntimeException('Formularz nr 3 ma nieprawidłową strukturę.');
    }
    $text_template = null;
    $select_template = null;
    $fields = [];
    foreach ($existing as $field) {
        $type = $field['element'] ?? '';
        $name = $field['attributes']['name'] ?? '';
        if ($type === 'input_text' && $text_template === null) {
            $text_template = $field;
        }
        if ($type === 'select' && $select_template === null) {
            $select_template = $field;
        }
        if ($name === 'select_5') {
            // Replaced by service-specific fields.
            continue;
        }
        if ($name === 'event_date_ak') {
            $field['settings']['label'] = $spec['date_label'];
            $field['attributes']['placeholder'] = 'np. 21.06.2027';
        }
        if ($name === 'textarea_2') {
            $field['settings']['label'] = $spec['message_label'];
            $field['attributes']['placeholder'] = 'Miejscowość, godziny, zakres i inne ważne informacje';
        }
        $fields[] = $field;
    }
    if (!$text_template || !$select_template) {
        throw new RuntimeException('Brak szablonu pól tekstowych lub wyboru we Fluent Forms nr 3.');
    }

    // Insert extra questions directly before the free-text description.
    $extras = [];
    foreach ($spec['fields'] as $i => $definition) {
        [$type, $key, $label, $values] = $definition;
        $field = $type === 'select' ? $select_template : $text_template;
        $name = 'ak_' . $key;
        $field['index'] = 100 + $i;
        $field['uniqElKey'] = 'aksen-' . $service . '-' . $key . '-v1';
        $field['attributes']['name'] = $name;
        $field['attributes']['id'] = '';
        $field['attributes']['value'] = '';
        $field['settings']['label'] = $label;
        $field['settings']['admin_field_label'] = $label;
        $field['settings']['validation_rules']['required'] = [
            'value' => false,
            'message' => 'Pole opcjonalne',
            'global' => false,
        ];
        if ($type === 'select') {
            $field['settings']['advanced_options'] = [];
            foreach ($values as $option_i => $option_label) {
                $field['settings']['advanced_options'][] = [
                    'label' => (string) $option_label,
                    'value' => (string) $option_label,
                    'image' => '',
                    'calc_value' => '',
                    'id' => $option_i,
                ];
            }
            $field['settings']['placeholder'] = 'Wybierz';
        } else {
            $field['attributes']['type'] = 'text';
            $field['attributes']['placeholder'] = (string) $values;
        }
        $extras[] = $field;
    }
    $output = [];
    foreach ($fields as $field) {
        if (($field['attributes']['name'] ?? '') === 'textarea_2') {
            array_push($output, ...$extras);
        }
        $output[] = $field;
    }
    // Attribution is stored with the Fluent Forms entry, not transmitted to
    // advertisers as personal data. Click IDs are intentionally not collected.
    $hidden_fields = [
        'ak_service' => $service,
        'ak_page' => '',
        'ak_lead_event_id' => '',
        'utm_source' => '',
        'utm_medium' => '',
        'utm_campaign' => '',
        'utm_content' => '',
        'utm_term' => '',
    ];
    foreach ($hidden_fields as $name => $value) {
        $output[] = [
            'index' => 200 + count($output),
            'element' => 'input_hidden',
            'attributes' => [
                'type' => 'hidden',
                'name' => $name,
                'value' => $value,
            ],
            'settings' => ['admin_field_label' => $name],
            'editor_options' => [
                'title' => 'Hidden Field',
                'icon_class' => 'ff-edit-hidden-field',
                'template' => 'inputHidden',
            ],
            'uniqElKey' => 'aksen-' . $service . '-hidden-' . $name . '-v1',
        ];
    }
    $base_fields['fields'] = array_values($output);
    return $base_fields;
}

add_action('admin_post_aksen_provision_service_forms', static function (): void {
    if (!current_user_can('manage_options')) {
        wp_die('Brak uprawnień.');
    }
    check_admin_referer('aksen_provision_service_forms');
    if (wp_parse_url(home_url('/'), PHP_URL_HOST) !== 'test.aksen-photo.pl') {
        wp_die('Instalacja formularzy jest dozwolona wyłącznie na stagingu.');
    }
    if ((int) get_option('blog_public') !== 0 || ($_POST['confirmed_backup'] ?? '') !== '1') {
        wp_die('Wymagane noindex stagingu oraz potwierdzona kopia zapasowa.');
    }
    if (!class_exists('FluentForm\\App\\Services\\Form\\FormService')) {
        wp_die('Fluent Forms nie jest aktywny.');
    }
    $service = new \FluentForm\App\Services\Form\FormService();
    $base = $service->find(3);
    $fields = json_decode((string) $base->form_fields, true);
    if (!is_array($fields)) {
        wp_die('Nie mogę odczytać formularza bazowego nr 3.');
    }
    $existing = get_option('aksen_photo_service_form_ids', []);
    $ids = is_array($existing) ? $existing : [];
    $errors = [];
    $created = 0;
    foreach (aksen_service_lead_specs() as $key => $spec) {
        // Avoid replacing forms that already have submissions or manual edits.
        if (!empty($ids[$key])) {
            try {
                if ($service->find((int) $ids[$key])) {
                    continue;
                }
            } catch (Throwable $ignored) {
                // Missing mapped form can be recreated.
            }
        }
        try {
            $form_fields = aksen_service_lead_build_fields($fields, $spec, $key);
            $new_form = $service->duplicate(['form_id' => 3]);
            $new_id = (int) $new_form->id;
            if ($new_id < 1) {
                throw new RuntimeException('Duplikacja nie zwróciła poprawnego ID.');
            }
            $service->update([
                'form_id' => $new_id,
                'title' => 'Aksen Photo – ' . $spec['title'] . ' [Lead]',
                'status' => 'published',
                'formFields' => wp_json_encode($form_fields, JSON_UNESCAPED_UNICODE),
            ]);
            // Source notifications + anti-spam restrictions are cloned by FormService.
            $ids[$key] = $new_id;
            update_option('aksen_photo_service_form_ids', $ids, false);
            $created++;
        } catch (Throwable $exception) {
            $errors[] = $key . ': ' . $exception->getMessage();
        }
    }
    set_transient('aksen_service_form_provision_result', [
        'created' => $created,
        'errors' => $errors,
        'total' => count($ids),
    ], 300);
    wp_safe_redirect(admin_url('tools.php?page=aksen-service-forms&updated=1'));
    exit;
});

add_action('admin_notices', static function (): void {
    if (!isset($_GET['page']) || $_GET['page'] !== 'aksen-service-forms') {
        return;
    }
    $result = get_transient('aksen_service_form_provision_result');
    if (!is_array($result)) {
        return;
    }
    delete_transient('aksen_service_form_provision_result');
    echo '<div class="notice notice-info"><p>Utworzone nowe formularze: ' . esc_html((string) $result['created']) . '. W sumie: ' . esc_html((string) $result['total']) . '.</p>';
    foreach ($result['errors'] as $error) {
        echo '<p>' . esc_html($error) . '</p>';
    }
    echo '</div>';
});