<?php
/** Offline smoke test for the service-form builder; no WordPress DB required. */
declare(strict_types=1);
define('ABSPATH', __DIR__);
function add_filter(...$args): void {}
function add_action(...$args): void {}
require dirname(__DIR__) . '/inc/service-leads.php';

function test_check(bool $condition, string $message): void {
    if (!$condition) {
        fwrite(STDERR, "FAILED: $message\n");
        exit(1);
    }
}

$base = [
    'fields' => [
        ['element' => 'input_name', 'attributes' => ['name' => 'name_0'], 'settings' => ['label' => 'Imię']],
        ['element' => 'input_email', 'attributes' => ['name' => 'email_1'], 'settings' => ['label' => 'E-mail']],
        ['element' => 'input_text', 'attributes' => ['type' => 'tel', 'name' => 'phone_ak'], 'settings' => ['label' => 'Telefon', 'validation_rules' => []]],
        ['element' => 'select', 'attributes' => ['name' => 'select_5'], 'settings' => ['label' => 'Rodzaj fotografii', 'advanced_options' => [], 'validation_rules' => []]],
        ['element' => 'input_text', 'attributes' => ['type' => 'text', 'name' => 'event_date_ak'], 'settings' => ['label' => 'Data', 'validation_rules' => []]],
        ['element' => 'textarea', 'attributes' => ['name' => 'textarea_2'], 'settings' => ['label' => 'Opis']],
    ],
    'submitButton' => ['element' => 'button', 'settings' => ['button_ui' => ['text' => 'Wyślij']]],
];
$specs = aksen_service_lead_specs();
test_check(count($specs) === 16, 'Expected 16 service form specs');
$seen = [];
foreach ($specs as $key => $spec) {
    $doc = aksen_service_lead_build_fields($base, $spec, $key);
    $names = array_map(static function ($f) { return $f['attributes']['name'] ?? ''; }, $doc['fields']);
    test_check(count($names) === count(array_unique($names)), 'Duplicate input names for ' . $key);
    test_check(!in_array('select_5', $names, true), 'Generic select leaked into service: ' . $key);
    foreach (['name_0', 'email_1', 'phone_ak', 'event_date_ak', 'textarea_2', 'ak_service', 'ak_page', 'ak_lead_event_id', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as $needed) {
        test_check(in_array($needed, $names, true), 'Missing ' . $needed . ' for ' . $key);
    }
    test_check($doc['submitButton'] === $base['submitButton'], 'Submit button lost: ' . $key);
    test_check(count($doc['fields']) === 5 + count($spec['fields']) + 8, 'Wrong field count: ' . $key);
    $seen[$key] = count($doc['fields']);
}
$map = aksen_service_lead_pages();
test_check(($map['fotograf-na-studniowke-szczecin'] ?? '') === 'prom', 'Prom mapping missing');
test_check(($map['portfolio-slubne-aksen-photo-fotograf-slubny'] ?? '') === 'wedding', 'Wedding mapping missing');
test_check(($map['fotograf-na-slub-cywilny-usc-szczecin'] ?? '') === 'usc', 'USC mapping missing');
test_check(($map['fotograf-police'] ?? '') === 'local', 'Local mapping missing');
echo 'PASS – 16 independent form specs, no duplicated fields, attribution fields present.\n';