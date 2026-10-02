<?php
require __DIR__ . '/_lib.php';
require_auth();
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Use POST', 405);
require_json_write();
$url = (string) cfg('WEBHOOK_URL', '');
if ($url === '' || !preg_match('#^https://#i', $url)) fail('Webhook não configurado (WEBHOOK_URL https)', 503);
$b = body_json(500_000);
$headers = ['content-type: application/json'];
if (cfg('WEBHOOK_SECRET') !== null) $headers[] = 'X-Webhook-Secret: ' . cfg('WEBHOOK_SECRET');
[$code, , $raw] = http_json($url, $headers, ['source' => 'ampliacao-studio', 'event' => (string) ($b['event'] ?? 'evento'), 'payload' => $b['payload'] ?? new stdClass(), 'sentAt' => date('c')], 20);
if ($code < 200 || $code >= 300) fail('Webhook respondeu HTTP ' . $code, 502);
json_out(['ok' => true, 'status' => $code]);
