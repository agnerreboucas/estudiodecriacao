<?php
/* Narração (ElevenLabs). A chave fica só no servidor.
   GET  ?action=voices            → lista de vozes
   POST {text, voice_id, model?}  → {audio: data URL mp3}. Texto até 4500 caracteres por chamada (o app divide por capítulo). */
require __DIR__ . '/_lib.php';
require_auth();
$key = (string) cfg('ELEVENLABS_API_KEY', '');
if ($key === '') fail('Narração não configurada: defina ELEVENLABS_API_KEY em api/config.php', 503);
$base = rtrim((string) cfg('ELEVENLABS_API_URL', 'https://api.elevenlabs.io/v1'), '/');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    [$code, $j, $raw] = http_json($base . '/voices', ['xi-api-key: ' . $key], null, 30);
    if ($code !== 200 || !is_array($j)) fail('ElevenLabs: ' . substr(is_array($j) ? json_encode($j['detail'] ?? 'erro', JSON_UNESCAPED_UNICODE) : $raw, 0, 300), $code === 401 ? 502 : ($code ?: 502));
    $out = [];
    foreach (($j['voices'] ?? []) as $v) $out[] = ['id' => (string) ($v['voice_id'] ?? ''), 'name' => (string) ($v['name'] ?? ''), 'category' => (string) ($v['category'] ?? ''),
        'labels' => is_array($v['labels'] ?? null) ? $v['labels'] : new stdClass, 'preview' => (string) ($v['preview_url'] ?? '')];
    json_out(['ok' => true, 'voices' => $out]);
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Use GET ou POST', 405);
require_json_write();
$b = body_json(200_000);
$text = trim((string) ($b['text'] ?? ''));
$voice = (string) ($b['voice_id'] ?? '');
if ($text === '' || mb_strlen($text) > 4500) fail('text inválido (1 a 4500 caracteres)', 422);
if (!preg_match('~^[A-Za-z0-9]{8,40}$~', $voice)) fail('voice_id inválido', 422);
$who = session_id() ?: client_ip();
/* trava diária por caracteres: rate_limit conta chamadas, então cobramos 1 "chamada" por 100 caracteres */
$units = (int) ceil(mb_strlen($text) / 100);
$cap = max(1, (int) ceil((int) cfg('TTS_CHARS_PER_DAY', 60000) / 100));
for ($i = 0; $i < $units; $i++) if (!rate_limit('ttsd:' . $who, $cap, 86400)) fail('Limite diário de narração atingido.', 429);
$model = (string) cfg('ELEVENLABS_MODEL', 'eleven_multilingual_v2');
if (!empty($b['model']) && preg_match('~^[a-z0-9_]{3,40}$~', (string) $b['model'])) $model = (string) $b['model'];
$ch = curl_init($base . '/text-to-speech/' . $voice . '?output_format=mp3_44100_128');
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 120, CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_FOLLOWLOCATION => false, CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['xi-api-key: ' . $key, 'content-type: application/json', 'accept: audio/mpeg'],
    CURLOPT_POSTFIELDS => json_encode(['text' => $text, 'model_id' => $model], JSON_UNESCAPED_UNICODE)]);
$res = curl_exec($ch); $err = curl_error($ch); $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
if ($res === false) fail('ElevenLabs: ' . ($err ?: 'falha de rede'), 502);
if ($code !== 200) { $j = json_decode((string) $res, true); fail('ElevenLabs: ' . substr(is_array($j) ? json_encode($j['detail'] ?? $j, JSON_UNESCAPED_UNICODE) : 'erro ' . $code, 0, 300), $code === 429 ? 429 : 502); }
json_out(['ok' => true, 'audio' => 'data:audio/mpeg;base64,' . base64_encode((string) $res), 'model' => $model, 'chars' => mb_strlen($text)]);
