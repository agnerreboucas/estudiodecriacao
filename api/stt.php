<?php
/* Transcrição de áudio (fala → texto) para virar insumo do Agente Editorial. A chave fica só no servidor.
   POST JSON: {audio: "data:audio/...;base64,...", lang?: "pt"}  → {text}
   Usa a ElevenLabs (speech-to-text) se ELEVENLABS_API_KEY existir; senão a OpenAI (/audio/transcriptions).
   AVISO: caminhos e campos seguem a documentação pública como eu a conheço; ainda não validado com chave real. */
require __DIR__ . '/_lib.php';
require_auth();
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Use POST', 405);
require_json_write();
$el = (string) cfg('ELEVENLABS_API_KEY', ''); $oa = (string) cfg('OPENAI_API_KEY', '');
if ($el === '' && $oa === '') fail('Transcrição não configurada: defina ELEVENLABS_API_KEY ou OPENAI_API_KEY em api/config.php', 503);
if (!rate_limit('stt:' . (session_id() ?: client_ip()), (int) cfg('STT_CALLS_PER_HOUR', 20), 3600)) fail('Limite de transcrições por hora atingido.', 429);
$b = body_json(30_000_000);
$a = (string) ($b['audio'] ?? '');
if (!preg_match('#^data:(audio|video)/(mpeg|mp3|mp4|m4a|x-m4a|wav|x-wav|webm|ogg|aac|flac);?[^,]*base64,([A-Za-z0-9+/=\r\n]+)$#', $a, $m)) fail('audio deve ser data URL (mp3, m4a, wav, webm, ogg, aac ou flac)', 422);
$bin = base64_decode($m[3], true);
if ($bin === false || strlen($bin) < 200 || strlen($bin) > 20_000_000) fail('áudio inválido ou grande demais (máx. 20 MB)', 422);
$ext = ['mpeg' => 'mp3', 'mp3' => 'mp3', 'mp4' => 'mp4', 'm4a' => 'm4a', 'x-m4a' => 'm4a', 'wav' => 'wav', 'x-wav' => 'wav', 'webm' => 'webm', 'ogg' => 'ogg', 'aac' => 'aac', 'flac' => 'flac'][$m[2]];
$lang = preg_match('~^[a-z]{2,3}$~', (string) ($b['lang'] ?? 'pt')) ? (string) ($b['lang'] ?? 'pt') : 'pt';
$tmp = tempnam(sys_get_temp_dir(), 'stt') . '.' . $ext; file_put_contents($tmp, $bin);
try {
    if ($el !== '') { $url = rtrim((string) cfg('ELEVENLABS_API_URL', 'https://api.elevenlabs.io/v1'), '/') . '/speech-to-text'; $hdr = ['xi-api-key: ' . $el]; $fields = ['model_id' => 'scribe_v1', 'language_code' => $lang]; }
    else { $url = rtrim((string) cfg('OPENAI_API_URL', 'https://api.openai.com/v1'), '/') . '/audio/transcriptions'; $hdr = ['Authorization: Bearer ' . $oa]; $fields = ['model' => (string) cfg('OPENAI_STT_MODEL', 'whisper-1'), 'language' => $lang]; }
    $fields['file'] = new CURLFile($tmp, 'application/octet-stream', 'audio.' . $ext);
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 170, CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_FOLLOWLOCATION => false, CURLOPT_POST => true, CURLOPT_HTTPHEADER => $hdr, CURLOPT_POSTFIELDS => $fields]);
    $res = curl_exec($ch); $err = curl_error($ch); $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
} finally { @unlink($tmp); }
if ($res === false) fail('Transcrição: ' . ($err ?: 'falha de rede'), 502);
$j = json_decode((string) $res, true);
if ($code !== 200 || !is_array($j)) fail('Transcrição: ' . substr(is_array($j) ? json_encode($j['detail'] ?? $j['error'] ?? $j, JSON_UNESCAPED_UNICODE) : 'erro ' . $code, 0, 300), $code === 429 ? 429 : 502);
$text = trim((string) ($j['text'] ?? ''));
if ($text === '') fail('Transcrição: nada reconhecido no áudio.', 422);
json_out(['ok' => true, 'text' => mb_substr($text, 0, 30000), 'provider' => $el !== '' ? 'elevenlabs' : 'openai']);
