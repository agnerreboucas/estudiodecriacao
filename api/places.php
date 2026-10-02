<?php
/* Google Meu Negócio / Maps via Places API (New): endereço, telefone, nota, avaliações, horário e categorias de um estabelecimento. */
require __DIR__ . '/_lib.php';
require_auth();
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Use POST', 405);
require_json_write();
$key = (string) cfg('GOOGLE_PLACES_API_KEY', '');
if ($key === '') fail('Google Places não configurado: defina GOOGLE_PLACES_API_KEY em api/config.php', 503);
if (!rate_limit('pl:' . (session_id() ?: client_ip()), 40, 3600)) fail('Limite de buscas por hora atingido.', 429);
$b = body_json(5000);
$q = trim((string) ($b['query'] ?? ''));
if ($q === '' || mb_strlen($q) > 200) fail('Informe o nome e a cidade do estabelecimento.', 422);
[$code, $j, $raw] = http_json((string) cfg('GOOGLE_PLACES_API_URL', 'https://places.googleapis.com/v1/places:searchText'), [
    'Content-Type: application/json', 'X-Goog-Api-Key: ' . $key,
    'X-Goog-FieldMask: places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.regularOpeningHours.weekdayDescriptions,places.types,places.primaryTypeDisplayName,places.websiteUri,places.googleMapsUri',
], ['textQuery' => $q, 'languageCode' => 'pt-BR', 'regionCode' => 'BR', 'maxResultCount' => 3], 20);
if ($code !== 200 || !is_array($j)) fail('Google Places: ' . substr((string) (is_array($j) ? ($j['error']['message'] ?? 'erro do provedor') : $raw), 0, 250), $code === 403 ? 502 : ($code >= 400 && $code < 600 ? $code : 502));
$out = [];
foreach (($j['places'] ?? []) as $p) $out[] = [
    'name' => (string) ($p['displayName']['text'] ?? ''), 'address' => (string) ($p['formattedAddress'] ?? ''), 'phone' => (string) ($p['nationalPhoneNumber'] ?? ''),
    'rating' => isset($p['rating']) ? (float) $p['rating'] : null, 'reviews' => isset($p['userRatingCount']) ? (int) $p['userRatingCount'] : null,
    'categories' => (string) ($p['primaryTypeDisplayName']['text'] ?? ''), 'hours' => implode(' | ', $p['regularOpeningHours']['weekdayDescriptions'] ?? []),
    'website' => (string) ($p['websiteUri'] ?? ''), 'mapsUrl' => (string) ($p['googleMapsUri'] ?? ''),
];
json_out(['ok' => true, 'places' => $out]);
