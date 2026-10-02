<?php
require __DIR__ . '/_lib.php';
require_auth();
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Use POST', 405);
require_json_write();
$key = (string) cfg('ANTHROPIC_API_KEY', '');
if ($key === '') fail('IA não configurada: defina ANTHROPIC_API_KEY em api/config.php', 503);
if (!rate_limit('ai:' . (session_id() ?: client_ip()), (int) cfg('AI_CALLS_PER_HOUR', 60), 3600)) fail('Limite de chamadas de IA por hora atingido.', 429);

$b = body_json(200_000);
$msgs = $b['messages'] ?? null;
if (!is_array($msgs) || !$msgs || count($msgs) > 8) fail('messages inválido', 422);
$clean = [];
foreach ($msgs as $m) {
    if (!is_array($m) || !in_array($m['role'] ?? '', ['user', 'assistant'], true) || !is_string($m['content'] ?? null) || strlen($m['content']) > 30000) fail('mensagem inválida', 422);
    $clean[] = ['role' => $m['role'], 'content' => $m['content']];
}
$payload = ['model' => (string) cfg('ANTHROPIC_MODEL', 'claude-sonnet-5-5'), 'max_tokens' => max(1, min(4000, (int) ($b['max_tokens'] ?? 1500))), 'messages' => $clean];
if (!empty($b['system']) && is_string($b['system'])) $payload['system'] = substr($b['system'], 0, 10000);

[$code, $j, $raw] = http_json((string) cfg('ANTHROPIC_API_URL', 'https://api.anthropic.com/v1/messages'),
    ['content-type: application/json', 'x-api-key: ' . $key, 'anthropic-version: 2023-06-01'], $payload);
if ($code !== 200 || !is_array($j)) {
    $msg = is_array($j) ? ($j['error']['message'] ?? 'erro do provedor') : $raw;
    fail('IA: ' . substr((string) $msg, 0, 300), $code >= 400 && $code < 600 ? ($code === 401 ? 502 : $code) : 502);
}
$text = '';
foreach (($j['content'] ?? []) as $blk) if (($blk['type'] ?? '') === 'text') $text .= $blk['text'];
json_out(['ok' => true, 'text' => $text, 'usage' => $j['usage'] ?? null]);
