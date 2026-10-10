<?php
require __DIR__ . '/_lib.php';
require __DIR__ . '/models.php';
require_auth();
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Use POST', 405);
require_json_write();
$prov = strtolower((string) cfg('AI_PROVIDER', 'anthropic'));
if ($prov !== 'openai') $prov = 'anthropic';
$key = (string) cfg($prov === 'openai' ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY', '');
if ($key === '' && cfg('OPENAI_API_KEY') === null && cfg('ANTHROPIC_API_KEY') === null) fail('IA não configurada: defina ' . ($prov === 'openai' ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY') . ' em api/config.php', 503);
if (!rate_limit('ai:' . (session_id() ?: client_ip()), (int) cfg('AI_CALLS_PER_HOUR', 60), 3600)) fail('Limite de chamadas de IA por hora atingido.', 429);

$b = body_json(7_000_000);
/* escolha da usuária: provedor (se a chave existir) e modelo (só os da lista) */
$want = strtolower((string) ($b['provider'] ?? ''));
if (($want === 'openai' || $want === 'anthropic') && $want !== $prov && cfg($want === 'openai' ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY') !== null) { $prov = $want; $key = (string) cfg($prov === 'openai' ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY'); }
if ($key === '') { $prov = cfg('OPENAI_API_KEY') !== null ? 'openai' : 'anthropic'; $key = (string) cfg($prov === 'openai' ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY'); }
$model = pick_model(text_models($prov), $b['model'] ?? '', text_default($prov));
$msgs = $b['messages'] ?? null;
if (!is_array($msgs) || !$msgs || count($msgs) > 8) fail('messages inválido', 422);
$clean = [];
foreach ($msgs as $m) {
    if (!is_array($m) || !in_array($m['role'] ?? '', ['user', 'assistant'], true) || !is_string($m['content'] ?? null) || strlen($m['content']) > 60000) fail('mensagem inválida', 422);
    $clean[] = ['role' => $m['role'], 'content' => $m['content']];
}
/* imagens (leitura de layout): até 3, JPEG/PNG/WebP em base64, anexadas à última mensagem do usuário */
$imgs = $b['images'] ?? [];
if (!is_array($imgs) || count($imgs) > 3) fail('images inválido', 422);
if ($imgs) {
    $last = count($clean) - 1;
    if ($clean[$last]['role'] !== 'user') fail('imagens exigem mensagem do usuário por último', 422);
    $blocks = [];
    foreach ($imgs as $im) {
        $mt = is_array($im) ? ($im['media_type'] ?? '') : '';
        $d = is_array($im) ? ($im['data'] ?? '') : '';
        if (!in_array($mt, ['image/jpeg', 'image/png', 'image/webp'], true) || !is_string($d) || $d === '' || strlen($d) > 3_500_000 || !preg_match('~^[A-Za-z0-9+/=]+$~', $d)) fail('imagem inválida', 422);
        $blocks[] = ['type' => 'image', 'source' => ['type' => 'base64', 'media_type' => $mt, 'data' => $d]];
    }
    $blocks[] = ['type' => 'text', 'text' => $clean[$last]['content']];
    $clean[$last]['content'] = $blocks;
}
if ($prov === 'openai') {
    /* Chat Completions da OpenAI: imagens entram como image_url (data URL); system vira a primeira mensagem */
    $om = [];
    if (!empty($b['system']) && is_string($b['system'])) $om[] = ['role' => 'system', 'content' => substr($b['system'], 0, 24000)];
    foreach ($clean as $m) {
        if (is_array($m['content'])) {
            $parts = [];
            foreach ($m['content'] as $blk) $parts[] = $blk['type'] === 'image'
                ? ['type' => 'image_url', 'image_url' => ['url' => 'data:' . $blk['source']['media_type'] . ';base64,' . $blk['source']['data']]]
                : ['type' => 'text', 'text' => $blk['text']];
            $om[] = ['role' => $m['role'], 'content' => $parts];
        } else $om[] = $m;
    }
    $ob = rtrim((string) cfg('OPENAI_API_URL', 'https://api.openai.com/v1'), '/');
    [$code, $j, $raw] = http_json($ob . '/chat/completions', ['content-type: application/json', 'Authorization: Bearer ' . $key],
        ['model' => $model, 'max_completion_tokens' => max(1, min(8000, (int) ($b['max_tokens'] ?? 1500))), 'messages' => $om], 120);
    if ($code !== 200 || !is_array($j)) {
        $msg = is_array($j) ? ($j['error']['message'] ?? 'erro do provedor') : $raw;
        fail('IA (OpenAI): ' . substr((string) $msg, 0, 300), $code === 429 ? 429 : 502);
    }
    json_out(['ok' => true, 'text' => (string) ($j['choices'][0]['message']['content'] ?? ''), 'usage' => $j['usage'] ?? null, 'model' => $model]);
}
$payload = ['model' => $model, 'max_tokens' => max(1, min(8000, (int) ($b['max_tokens'] ?? 1500))), 'messages' => $clean];
if (!empty($b['system']) && is_string($b['system'])) $payload['system'] = substr($b['system'], 0, 24000);

[$code, $j, $raw] = http_json((string) cfg('ANTHROPIC_API_URL', 'https://api.anthropic.com/v1/messages'),
    ['content-type: application/json', 'x-api-key: ' . $key, 'anthropic-version: 2023-06-01'], $payload);
if ($code !== 200 || !is_array($j)) {
    $msg = is_array($j) ? ($j['error']['message'] ?? 'erro do provedor') : $raw;
    fail('IA: ' . substr((string) $msg, 0, 300), $code >= 400 && $code < 600 ? ($code === 401 ? 502 : $code) : 502);
}
$text = '';
foreach (($j['content'] ?? []) as $blk) if (($blk['type'] ?? '') === 'text') $text .= $blk['text'];
json_out(['ok' => true, 'text' => $text, 'usage' => $j['usage'] ?? null, 'model' => $model]);
