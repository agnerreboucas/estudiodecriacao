<?php
/* Proxy de geração de imagem (OpenAI Images API). A chave fica só aqui, no servidor.
   POST JSON: {prompt, size: square|portrait|landscape, quality: low|medium|high, refs?: [dataURL...]}
   Com refs usa /images/edits (foto do produto como fonte da verdade); sem refs usa /images/generations. */
require __DIR__ . '/_lib.php';
require __DIR__ . '/models.php';
require_auth();
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Use POST', 405);
require_json_write();
$key = (string) cfg('OPENAI_API_KEY', ''); $mkey = (string) cfg('MAGNIFIC_API_KEY', '');
if ($key === '' && $mkey === '') fail('Geração de imagem não configurada: defina OPENAI_API_KEY (ou MAGNIFIC_API_KEY) em api/config.php', 503);
$who = session_id() ?: client_ip();
if (!rate_limit('imgh:' . $who, (int) cfg('IMAGE_CALLS_PER_HOUR', 20), 3600)) fail('Limite de imagens por hora atingido.', 429);
if (!rate_limit('imgd:' . $who, (int) cfg('IMAGE_CALLS_PER_DAY', 80), 86400)) fail('Limite diário de imagens atingido.', 429);

$b = body_json(40_000_000);
$prompt = trim((string) ($b['prompt'] ?? ''));
if ($prompt === '' || strlen($prompt) > 4000) fail('prompt inválido (1 a 4000 caracteres)', 422);
$sizes = ['square' => '1024x1024', 'portrait' => '1024x1536', 'landscape' => '1536x1024'];
$size = $sizes[(string) ($b['size'] ?? 'square')] ?? '1024x1024';
$quality = in_array($b['quality'] ?? '', ['low', 'medium', 'high'], true) ? $b['quality'] : (string) cfg('OPENAI_IMAGE_QUALITY', 'medium');
$provider = strtolower((string) ($b['provider'] ?? '')); if ($provider !== 'openai' && $provider !== 'magnific') $provider = $key !== '' ? 'openai' : 'magnific';
if ($provider === 'openai' && $key === '') { $provider = 'magnific'; } elseif ($provider === 'magnific' && $mkey === '') { $provider = 'openai'; }
$model = pick_model(image_models_openai(), $b['model'] ?? '', (string) cfg('OPENAI_IMAGE_MODEL', 'gpt-image-1'));
$base = rtrim((string) cfg('OPENAI_API_URL', 'https://api.openai.com/v1'), '/');

$refs = $b['refs'] ?? [];
if (!is_array($refs) || count($refs) > 4) fail('refs inválido (até 4 imagens)', 422);

if ($provider === 'magnific') {
    $mm = image_models_magnific(); $mid = isset($mm[$b['model'] ?? '']) ? $b['model'] : 'flux-dev'; $x = $mm[$mid];
    $ars = $mid === 'gemini-flash' ? ['square' => '1:1', 'portrait' => '2:3', 'landscape' => '3:2'] : ['square' => 'square_1_1', 'portrait' => 'portrait_2_3', 'landscape' => 'standard_3_2'];
    $mb = rtrim((string) cfg('MAGNIFIC_API_URL', 'https://api.freepik.com/v1'), '/'); $H = ['x-freepik-api-key: ' . $mkey, 'Accept: application/json'];
    $req = ['prompt' => $prompt, 'aspect_ratio' => $ars[(string) ($b['size'] ?? 'square')] ?? $ars['square'], 'num_images' => 1];
    if ($refs) {
        if (!$x['refs']) fail('Este modelo do Magnific não aceita imagens de referência. Escolha o Gemini Flash ou o GPT Image.', 422);
        $req['reference_images'] = []; foreach ($refs as $r) { if (!is_string($r) || !preg_match('#^data:image/(png|jpeg|webp);base64,([A-Za-z0-9+/=\r\n]+)$#', $r, $m)) fail('ref deve ser data URL png/jpeg/webp', 422); $req['reference_images'][] = $m[2]; }
    }
    [$code, $j, $raw] = http_json($mb . $x['path'], array_merge($H, ['content-type: application/json']), $req, 60);
    $tid = is_array($j) ? (string) ($j['data']['task_id'] ?? '') : '';
    if (!in_array($code, [200, 201, 202], true) || $tid === '') fail('Magnific: ' . substr(is_array($j) ? json_encode($j['message'] ?? $j, JSON_UNESCAPED_UNICODE) : $raw, 0, 300), $code === 429 ? 429 : 502);
    $url = '';
    for ($i = 0; $i < 40 && $url === ''; $i++) {
        sleep(3); [$c2, $j2, $r2] = http_json($mb . $x['path'] . '/' . rawurlencode($tid), $H, null, 30);
        $st = is_array($j2) ? strtoupper((string) ($j2['data']['status'] ?? '')) : '';
        if ($st === 'FAILED' || $st === 'ERROR') fail('Magnific: a geração falhou.', 502);
        if ($st === 'COMPLETED') { $g = $j2['data']['generated'][0] ?? ''; $url = is_string($g) ? $g : (string) ($g['url'] ?? ''); if ($url === '') fail('Magnific: resposta sem imagem', 502); }
    }
    if ($url === '') fail('Magnific: demorou demais; tente de novo.', 504);
    $p = parse_url($url); $h = strtolower($p['host'] ?? '');
    if (($p['scheme'] ?? '') !== 'https' || $h === '' || isset($p['port']) || !preg_match('~(^|\.)(freepik\.com|magnific\.com|fpcdn\.net|amazonaws\.com|cloudfront\.net)$~', $h)) fail('Magnific: endereço de imagem não permitido.', 502);
    $ch = curl_init($url); curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 60, CURLOPT_CONNECTTIMEOUT => 8, CURLOPT_FOLLOWLOCATION => false, CURLOPT_MAXFILESIZE => 20000000]);
    $bin = curl_exec($ch); $c3 = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE); $ct = strtolower((string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE)); curl_close($ch);
    if ($bin === false || $c3 !== 200 || !preg_match('~^image/(jpeg|png|webp)~', $ct, $mt)) fail('Magnific: não consegui baixar a imagem gerada.', 502);
    json_out(['ok' => true, 'image' => 'data:image/' . $mt[1] . ';base64,' . base64_encode((string) $bin), 'provider' => 'magnific', 'model' => $mid, 'size' => (string) ($b['size'] ?? 'square')]);
}
if (!$refs) {
    [$code, $j, $raw] = http_json($base . '/images/generations',
        ['content-type: application/json', 'Authorization: Bearer ' . $key],
        ['model' => $model, 'prompt' => $prompt, 'size' => $size, 'quality' => $quality, 'n' => 1], 180);
} else {
    /* multipart montado à mão: a API pede o campo "image[]" repetido, o que o array do cURL não permite */
    $bd = 'amplia' . bin2hex(random_bytes(12)); $body = '';
    foreach (['model' => $model, 'prompt' => $prompt, 'size' => $size, 'quality' => $quality, 'n' => '1'] as $k => $v)
        $body .= "--$bd\r\nContent-Disposition: form-data; name=\"$k\"\r\n\r\n$v\r\n";
    $i = 0;
    foreach ($refs as $r) {
        if (!is_string($r) || !preg_match('#^data:image/(png|jpeg|webp);base64,([A-Za-z0-9+/=\r\n]+)$#', $r, $m)) fail('ref deve ser data URL png/jpeg/webp', 422);
        $bin = base64_decode($m[2], true);
        if ($bin === false || strlen($bin) > 12_000_000) fail('ref inválida ou grande demais (máx. 12 MB)', 422);
        $i++;
        $body .= "--$bd\r\nContent-Disposition: form-data; name=\"image[]\"; filename=\"ref$i." . ($m[1] === 'jpeg' ? 'jpg' : $m[1]) . "\"\r\nContent-Type: image/{$m[1]}\r\n\r\n$bin\r\n";
    }
    $body .= "--$bd--\r\n";
    $ch = curl_init($base . '/images/edits');
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 180, CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $key, 'Content-Type: multipart/form-data; boundary=' . $bd], CURLOPT_POST => true, CURLOPT_POSTFIELDS => $body]);
    $res = curl_exec($ch); $err = curl_error($ch); $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    if ($res === false) { $code = 0; $j = null; $raw = $err ?: 'falha de rede'; } else { $j = json_decode((string) $res, true); $raw = (string) $res; }
}

if ($code !== 200 || !is_array($j)) {
    $msg = is_array($j) ? ($j['error']['message'] ?? 'erro do provedor') : $raw;
    fail('Imagem: ' . substr((string) $msg, 0, 300), $code === 429 ? 429 : 502);
}
$b64 = $j['data'][0]['b64_json'] ?? '';
if (!is_string($b64) || $b64 === '') fail('Imagem: resposta sem conteúdo', 502);
json_out(['ok' => true, 'image' => 'data:image/png;base64,' . $b64, 'provider' => 'openai', 'model' => $model, 'size' => $size, 'quality' => $quality]);
