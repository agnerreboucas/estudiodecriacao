<?php
/* Magnific (API antes chamada Freepik): banco de imagens e upscale. A chave fica só no servidor.
   AVISO: caminhos e campos abaixo seguem a API pública Freepik/Magnific como documentada até o meu conhecimento;
   confira na documentação atual e ajuste aqui se algo mudou. Ainda não validado com chave real.
   GET ?action=stock&q=termo&page=1&orientation=vertical|horizontal|square
   GET ?action=fetch&url=https://...   (baixa uma miniatura/preview permitida e devolve data URL, para usar no canvas)
   POST {action:'upscale', image: dataURL, scale: 2|4}   → {task}
   GET ?action=upscale_status&task=ID                    → {status, url?} */
require __DIR__ . '/_lib.php';
require_auth();
$key = (string) cfg('MAGNIFIC_API_KEY', '');
if ($key === '') fail('Magnific não configurado: defina MAGNIFIC_API_KEY em api/config.php', 503);
if (!rate_limit('mag:' . (session_id() ?: client_ip()), (int) cfg('MAGNIFIC_CALLS_PER_HOUR', 60), 3600)) fail('Limite de chamadas ao Magnific por hora atingido.', 429);
$base = rtrim((string) cfg('MAGNIFIC_API_URL', 'https://api.freepik.com/v1'), '/');
$H = ['x-freepik-api-key: ' . $key, 'Accept: application/json'];
$method = $_SERVER['REQUEST_METHOD'] ?? '';
$action = $method === 'POST' ? '' : (string) ($_GET['action'] ?? '');
if ($method === 'POST') { require_json_write(); $b = body_json(14_000_000); $action = (string) ($b['action'] ?? ''); }

function allowed_host(string $u): bool {
    $p = parse_url($u); if (!$p || ($p['scheme'] ?? '') !== 'https' || empty($p['host']) || isset($p['port'])) return false;
    $h = strtolower($p['host']);
    foreach (['freepik.com', 'magnific.com', 'fpcdn.net'] as $d) if ($h === $d || substr($h, -strlen($d) - 1) === '.' . $d) return true;
    return false;
}

if ($action === 'stock') {
    $q = trim((string) ($_GET['q'] ?? '')); if ($q === '' || mb_strlen($q) > 120) fail('q inválido', 422);
    $page = max(1, min(50, (int) ($_GET['page'] ?? 1)));
    $qs = ['term' => $q, 'page' => $page, 'limit' => 24, 'order' => 'relevance'];
    $or = (string) ($_GET['orientation'] ?? '');
    if (in_array($or, ['vertical', 'horizontal', 'square', 'panoramic'], true)) $qs['filters[orientation][' . $or . ']'] = 1;
    [$code, $j, $raw] = http_json($base . '/resources?' . http_build_query($qs), $H, null, 30);
    if ($code !== 200 || !is_array($j)) fail('Magnific: ' . substr(is_array($j) ? json_encode($j['message'] ?? $j, JSON_UNESCAPED_UNICODE) : $raw, 0, 300), $code === 429 ? 429 : 502);
    $out = [];
    foreach (($j['data'] ?? []) as $r) {
        $src = $r['image']['source']['url'] ?? ($r['preview']['url'] ?? '');
        if (!is_string($src) || !allowed_host($src)) continue;
        $out[] = ['id' => (string) ($r['id'] ?? ''), 'title' => (string) ($r['title'] ?? ''), 'url' => $src, 'author' => (string) ($r['author']['name'] ?? ''),
            'w' => (int) ($r['image']['source']['size'] ?? 0)];
    }
    json_out(['ok' => true, 'results' => $out, 'page' => $page]);
}
if ($action === 'fetch') {
    $u = (string) ($_GET['url'] ?? ''); if (!allowed_host($u)) fail('url não permitida', 422);
    $ch = curl_init($u); curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 30, CURLOPT_CONNECTTIMEOUT => 8, CURLOPT_FOLLOWLOCATION => false, CURLOPT_MAXFILESIZE => 12000000]);
    $res = curl_exec($ch); $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE); $ct = strtolower((string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE)); curl_close($ch);
    if ($res === false || $code !== 200) fail('Não consegui baixar a imagem.', 502);
    $mt = preg_match('~^image/(jpeg|png|webp)~', $ct, $m) ? 'image/' . $m[1] : '';
    if ($mt === '') fail('Formato de imagem não suportado.', 415);
    json_out(['ok' => true, 'image' => 'data:' . $mt . ';base64,' . base64_encode((string) $res)]);
}
if ($action === 'upscale') {
    $img = (string) ($b['image'] ?? '');
    if (!preg_match('#^data:image/(png|jpeg|webp);base64,([A-Za-z0-9+/=\r\n]+)$#', $img, $m)) fail('image deve ser data URL png/jpeg/webp', 422);
    $scale = in_array((int) ($b['scale'] ?? 2), [2, 4], true) ? (int) $b['scale'] : 2;
    [$code, $j, $raw] = http_json($base . '/ai/image-upscaler', array_merge($H, ['content-type: application/json']), ['image' => $m[2], 'scale_factor' => $scale . 'x'], 60);
    if (!in_array($code, [200, 201, 202], true) || !is_array($j)) fail('Magnific: ' . substr(is_array($j) ? json_encode($j['message'] ?? $j, JSON_UNESCAPED_UNICODE) : $raw, 0, 300), $code === 429 ? 429 : 502);
    $tid = (string) ($j['data']['task_id'] ?? ''); if ($tid === '') fail('Magnific: resposta sem task_id', 502);
    json_out(['ok' => true, 'task' => $tid]);
}
if ($action === 'upscale_status') {
    $t = (string) ($_GET['task'] ?? ''); if (!preg_match('~^[A-Za-z0-9-]{8,64}$~', $t)) fail('task inválida', 422);
    [$code, $j, $raw] = http_json($base . '/ai/image-upscaler/' . $t, $H, null, 30);
    if ($code !== 200 || !is_array($j)) fail('Magnific: ' . substr($raw, 0, 200), 502);
    $st = strtoupper((string) ($j['data']['status'] ?? ''));
    $url = (string) (($j['data']['generated'][0] ?? '') ?: '');
    $done = $st === 'COMPLETED' && $url !== '' && allowed_host($url);
    json_out(['ok' => true, 'status' => $done ? 'done' : ($st === 'FAILED' ? 'failed' : 'pending'), 'url' => $done ? $url : null]);
}
fail('action inválida', 422);
