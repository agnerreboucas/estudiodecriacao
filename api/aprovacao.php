<?php
/* Aprovação de arte: o cliente abre aprovacao.html?t=CODIGO (sem login), vê as peças como vão aparecer, decide (aprovado, alterado, rejeitado),
   edita texto, marca pontos na imagem e comenta. A equipe (logada no Studio) publica as peças, lê as respostas e marca aplicado/publicado.
   Prazo: o envio grava sentAt; passadas as horas (padrão 72), o que ficou sem resposta conta como aprovado por prazo (calculado na leitura, no aprovacao.html).
   Público (código do link): GET ?action=estado&t=  ·  GET ?img=ID&t=  ·  POST {t, action:'registro', id, record}  ·  POST {t, action:'envio', submission | remove:true}
   Equipe (logada): POST {action:'criar'|'publicar'|'enviar'|'equipe'|'revogar', ...}.  Dados em <DATA_DIR>/aprovacao/<codigo>/ (fora do alcance da web). */
require __DIR__ . '/_lib.php';
require __DIR__ . '/_dispatch.php';
header('X-Robots-Tag: noindex, nofollow');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

const AP_KINDS = ['carousel', 'single', 'story', 'reels', 'ad', 'site', 'logo', 'brand', 'design', 'poster', 'deck', 'ebook', 'cover'];
const AP_STAGES = ['descoberta', 'atencao', 'consideracao', 'compra', 'apologia'];
const AP_STATUS = ['pending', 'approved', 'altered', 'rejected'];

function ap_ok($t): bool { return is_string($t) && preg_match('/^[a-f0-9]{24}$/', $t) === 1; }
function ap_dir(string $t): string { $d = data_dir() . '/aprovacao/' . $t; if (!is_dir($d)) @mkdir($d, 0750, true); return $d; }
function ap_json(string $f) { if (!is_file($f)) return null; $j = json_decode((string) @file_get_contents($f), true); return is_array($j) ? $j : null; }
function ap_put(string $f, $d): bool { $tmp = $f . '.' . bin2hex(random_bytes(4)) . '.tmp'; if (@file_put_contents($tmp, json_encode($d, JSON_UNESCAPED_UNICODE), LOCK_EX) === false) return false; @chmod($tmp, 0640); return @rename($tmp, $f); }
function ap_meta(string $t): ?array { $m = ap_json(ap_dir($t) . '/meta.json'); return ($m && empty($m['revoked'])) ? $m : null; }
function ap_id($v): string { return preg_replace('/[^a-z0-9_\-]/i', '', (string) $v); }
function ap_s($v, int $n): string { return mb_substr(str_replace("\0", '', trim((string) $v)), 0, $n); }
function ap_date($v): string { $v = (string) $v; return preg_match('/^\d{4}-\d{2}-\d{2}(T[\d:.+\-Z]+)?$/', $v) ? mb_substr($v, 0, 32) : ''; }
function ap_team(): bool { return auth_required() && logged_in(); }
function ap_base(): string { $b = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/api/aprovacao.php'), '/'); return $b . '/aprovacao.php'; }
function ap_img_url(string $t, string $id): string { return ap_base() . '?t=' . $t . '&img=' . $id; }

/* peça: só campos conhecidos, tamanhos limitados; imagens são arquivos já enviados (id) */
function ap_item(array $it, string $t, string $dir): ?array {
    $id = ap_id($it['id'] ?? ''); if ($id === '') return null; $kind = in_array($it['kind'] ?? '', AP_KINDS, true) ? $it['kind'] : 'single';
    $slides = []; foreach (array_slice(is_array($it['slides'] ?? null) ? $it['slides'] : [], 0, 30) as $s) {
        if (!is_array($s)) continue; $o = ['h' => ap_s($s['h'] ?? '', 400), 'b' => ap_s($s['b'] ?? '', 1200)];
        $im = ap_id($s['img'] ?? ''); if ($im !== '') foreach (['jpg', 'webp', 'png'] as $e) if (is_file("$dir/img_$im.$e")) { $o['img'] = ap_img_url($t, $im); break; }
        $slides[] = $o;
    }
    if (!$slides) $slides[] = ['h' => '', 'b' => ''];
    $o = ['id' => $id, 'kind' => $kind, 'style' => preg_match('/^[a-z\-]{0,30}$/', (string) ($it['style'] ?? '')) ? (string) ($it['style'] ?? '') : '', 'date' => ap_date($it['date'] ?? ''), 'caption' => ap_s($it['caption'] ?? '', 5000), 'slides' => $slides];
    if (($it['format'] ?? '') === 'story' || $kind === 'story' || $kind === 'reels') $o['format'] = 'story';
    if ($kind === 'reels') $o['script'] = ap_s($it['script'] ?? '', 5000);
    if (!empty($it['published'])) $o['published'] = true;
    if ($kind === 'ad') {
        $o['stage'] = in_array($it['stage'] ?? '', AP_STAGES, true) ? $it['stage'] : 'descoberta'; $a = is_array($it['ad'] ?? null) ? $it['ad'] : []; $m = is_array($it['meta'] ?? null) ? $it['meta'] : [];
        $o['ad'] = ['primary' => ap_s($a['primary'] ?? '', 2000), 'headline' => ap_s($a['headline'] ?? '', 200), 'description' => ap_s($a['description'] ?? '', 300), 'cta' => ap_s($a['cta'] ?? '', 60), 'url' => ap_s($a['url'] ?? '', 300)];
        $o['meta'] = ['obj' => ap_s($m['obj'] ?? '', 120), 'budget' => ap_s($m['budget'] ?? '', 80), 'period' => ap_s($m['period'] ?? '', 80), 'aud' => ap_s($m['aud'] ?? '', 300)];
    }
    return $o;
}
/* resposta: o cliente nunca altera "aplicado" nem "publicado" (só a equipe) */
function ap_record(array $r, bool $team, ?array $old): array {
    $st = in_array($r['status'] ?? '', AP_STATUS, true) ? $r['status'] : 'pending';
    $o = ['status' => $st, 'by' => ap_s($r['by'] ?? '', 80), 'at' => ap_date($r['at'] ?? ''), 'comment' => ap_s($r['comment'] ?? '', 2000), 'notes' => ap_s($r['notes'] ?? '', 2000), 'pins' => [], 'thread' => []];
    foreach (array_slice(is_array($r['pins'] ?? null) ? $r['pins'] : [], 0, 60) as $p) if (is_array($p)) $o['pins'][] = ['s' => max(0, min(40, (int) ($p['s'] ?? 0))), 'x' => max(0, min(100, round((float) ($p['x'] ?? 0), 2))), 'y' => max(0, min(100, round((float) ($p['y'] ?? 0), 2))), 't' => ap_s($p['t'] ?? '', 400), 'by' => ap_s($p['by'] ?? '', 80), 'at' => ap_date($p['at'] ?? '')];
    foreach (array_slice(is_array($r['thread'] ?? null) ? $r['thread'] : [], 0, 100) as $c) if (is_array($c)) $o['thread'][] = ['by' => ap_s($c['by'] ?? '', 80), 'at' => ap_date($c['at'] ?? ''), 'text' => ap_s($c['text'] ?? '', 1500)];
    if (is_array($r['vals'] ?? null)) {
        $v = $r['vals']; $vo = ['caption' => ap_s($v['caption'] ?? '', 5000), 'script' => ap_s($v['script'] ?? '', 5000), 'slides' => [], 'ad' => null];
        foreach (array_slice(is_array($v['slides'] ?? null) ? $v['slides'] : [], 0, 30) as $s) if (is_array($s)) { $so = ['h' => ap_s($s['h'] ?? '', 400), 'b' => ap_s($s['b'] ?? '', 1200)]; if (!empty($s['img']) && is_string($s['img']) && preg_match('#^[\w./?=&%\-]{1,300}$#', $s['img'])) $so['img'] = $s['img']; $vo['slides'][] = $so; }
        if (is_array($v['ad'] ?? null)) { $a = $v['ad']; $vo['ad'] = ['primary' => ap_s($a['primary'] ?? '', 2000), 'headline' => ap_s($a['headline'] ?? '', 200), 'description' => ap_s($a['description'] ?? '', 300), 'cta' => ap_s($a['cta'] ?? '', 60), 'url' => ap_s($a['url'] ?? '', 300)]; }
        $o['vals'] = $vo; $o['editedBy'] = ap_s($r['editedBy'] ?? '', 80); $o['editedAt'] = ap_date($r['editedAt'] ?? '');
    }
    if (!empty($r['auto'])) $o['auto'] = true;
    foreach (['applied', 'published'] as $k) {
        $src = $team ? ($r[$k] ?? null) : ($old[$k] ?? null);
        if (is_array($src) && !empty($src['at'])) $o[$k] = ['by' => ap_s($src['by'] ?? '', 80), 'at' => ap_date($src['at'] ?? '')];
        elseif ($k === 'published' && $src === false) $o[$k] = false;
    }
    return $o;
}
function ap_estado(string $t, array $m, bool $team): array {
    $dir = ap_dir($t); $items = ap_json("$dir/items.json") ?: []; $recs = ap_json("$dir/records.json") ?: []; $sub = ap_json("$dir/submission.json") ?: [];
    $s = array_filter(['sentAt' => $m['sentAt'] ?? '', 'deadlineHours' => (int) ($m['deadlineHours'] ?? 72)] + $sub, fn($v) => $v !== '' && $v !== null);
    return ['ok' => true, 'name' => $m['name'] ?? '', 'brand' => $m['brand'] ?? ['name' => $m['name'] ?? '', 'handle' => ''], 'subtitle' => $m['subtitle'] ?? '', 'items' => $items, 'records' => (object) $recs, 'submission' => $s ?: null, 'agency' => $team];
}
function ap_link(string $t): string {
    $host = preg_replace('/[^a-z0-9.\-:]/i', '', $_SERVER['HTTP_HOST'] ?? 'localhost'); $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $base = preg_replace('#/api$#', '', rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/api/aprovacao.php'), '/'));
    return "$https://$host$base/aprovacao.html?t=$t";
}

/* ---------- público ---------- */
if ($method === 'GET') {
    $t = (string) ($_GET['t'] ?? ''); if (!ap_ok($t)) fail('Link inválido.', 404);
    if (!rate_limit('apget:' . client_ip(), 3000, 3600)) fail('Muitos acessos. Tente mais tarde.', 429);
    $m = ap_meta($t); if (!$m) fail('Este link não está mais ativo. Peça um novo à agência.', 404); $dir = ap_dir($t);
    if (isset($_GET['img'])) { $id = ap_id($_GET['img']); foreach (['webp' => 'image/webp', 'jpg' => 'image/jpeg', 'png' => 'image/png'] as $ext => $ct) { $f = "$dir/img_$id.$ext"; if ($id !== '' && is_file($f)) { header('Content-Type: ' . $ct); header('X-Content-Type-Options: nosniff'); header('Cache-Control: private, max-age=86400'); readfile($f); exit; } } http_response_code(404); exit; }
    json_out(ap_estado($t, $m, ap_team()));
}
if ($method !== 'POST') fail('Use GET ou POST', 405);
require_json_write();
$b = body_json(6_500_000); $action = (string) ($b['action'] ?? '');

if ($action === 'registro' || $action === 'envio') {
    $t = (string) ($b['t'] ?? ''); if (!ap_ok($t)) fail('Link inválido.', 404); $m = ap_meta($t); if (!$m) fail('Este link não está mais ativo.', 404);
    if (!rate_limit('apwr:' . client_ip() . $t, 1200, 3600)) fail('Muitas ações. Tente mais tarde.', 429);
    $dir = ap_dir($t); $team = ap_team();
    if ($action === 'registro') {
        $id = ap_id($b['id'] ?? ''); $items = ap_json("$dir/items.json") ?: []; $ok = false; foreach ($items as $it) if (($it['id'] ?? '') === $id) $ok = true; if (!$ok) fail('Peça não encontrada.', 404);
        $recs = ap_json("$dir/records.json") ?: []; $old = $recs[$id] ?? null; $new = ap_record(is_array($b['record'] ?? null) ? $b['record'] : [], $team, $old);
        if ($new['status'] === 'rejected' && trim($new['comment']) === '' && !$team) fail('Rejeitar exige o motivo.', 422);
        $recs[$id] = $new; if (!ap_put("$dir/records.json", $recs)) fail('Não consegui gravar (permissão da pasta api/data).', 500);
        json_out(['ok' => true]);
    }
    /* envio da revisão pelo cliente */
    $sf = "$dir/submission.json";
    if (!empty($b['remove'])) { @unlink($sf); json_out(['ok' => true]); }
    $s = is_array($b['submission'] ?? null) ? $b['submission'] : []; $o = ['by' => ap_s($s['by'] ?? '', 80), 'at' => ap_date($s['at'] ?? ''), 'day' => ap_s($s['day'] ?? '', 12), 'total' => (int) ($s['total'] ?? 0), 'approved' => (int) ($s['approved'] ?? 0), 'altered' => (int) ($s['altered'] ?? 0), 'rejected' => (int) ($s['rejected'] ?? 0)];
    if ($o['at'] === '') $o['at'] = date('c'); if (!ap_put($sf, $o)) fail('Não consegui gravar.', 500);
    try { $rt = routing_cfg(); $to = array_values(array_unique(array_merge($rt['managers'], routing_emails($m['notify'] ?? '')))); $when = date('d/m/Y H:i');
        if ($to) dispatch_log('email aprovacao ' . (dispatch_mail($to, 'Revisão enviada: ' . ($m['name'] ?? ''), "O cliente " . $o['by'] . " enviou a revisão de \"" . ($m['name'] ?? '') . "\" ($when).\n\nAprovadas: {$o['approved']} · Alteradas: {$o['altered']} · Rejeitadas: {$o['rejected']} · Total: {$o['total']}.\n\nAbra o Studio → Aprovação de arte para ver as correções.", $rt['from']) ? 'ok' : 'falhou')); } catch (Throwable $e) { dispatch_log('aprovacao erro: ' . $e->getMessage()); }
    json_out(['ok' => true]);
}

/* ---------- equipe (logada) ---------- */
require_auth();
if ($action === 'criar') {
    $project = preg_replace('/[^\w\-]/', '', (string) ($b['project'] ?? '')); $name = ap_s($b['name'] ?? '', 120); if ($project === '' || $name === '') fail('Informe o projeto e o nome.', 422);
    $t = bin2hex(random_bytes(12)); $m = ['t' => $t, 'project' => $project, 'name' => $name, 'brand' => ['name' => ap_s($b['brandName'] ?? $name, 80), 'handle' => preg_replace('/[^\w.]/', '', (string) ($b['handle'] ?? ''))], 'subtitle' => ap_s($b['subtitle'] ?? '', 80), 'created' => date('c'), 'deadlineHours' => 72, 'sentAt' => '', 'notify' => ''];
    if (!ap_put(ap_dir($t) . '/meta.json', $m)) fail('Não consegui gravar (permissão da pasta api/data).', 500);
    json_out(['ok' => true, 't' => $t, 'link' => ap_link($t)]);
}
$t = (string) ($b['t'] ?? ''); if (!ap_ok($t)) fail('Código inválido.', 422); $m = ap_meta($t); if (!$m) fail('Link não encontrado.', 404); $dir = ap_dir($t);
if ($action === 'revogar') { $m['revoked'] = true; ap_put("$dir/meta.json", $m); json_out(['ok' => true]); }
if ($action === 'equipe') { $e = ap_estado($t, $m, true); $e['link'] = ap_link($t); $e['meta'] = ['project' => $m['project'] ?? '', 'created' => $m['created'] ?? '', 'notify' => $m['notify'] ?? '']; json_out($e); }
if ($action === 'imagens') {
    $n = 0; foreach ((is_array($b['images'] ?? null) ? $b['images'] : []) as $id => $data) {
        $id = ap_id($id); if ($id === '' || !is_string($data) || !preg_match('#^data:image/(webp|jpeg|png);base64,([A-Za-z0-9+/=]+)$#', $data, $mm)) continue; $raw = base64_decode($mm[2], true); if ($raw === false || strlen($raw) > 1_500_000) continue;
        foreach (['webp', 'jpg', 'png'] as $e) @unlink("$dir/img_$id.$e"); $ext = $mm[1] === 'jpeg' ? 'jpg' : $mm[1]; if (@file_put_contents("$dir/img_$id.$ext", $raw) !== false) $n++;
    }
    json_out(['ok' => true, 'saved' => $n]);
}
if ($action === 'publicar') {   // grava as peças (as imagens já foram enviadas) e, se pedido, inicia o prazo
    $items = []; foreach (array_slice(is_array($b['items'] ?? null) ? $b['items'] : [], 0, 300) as $it) { if (!is_array($it)) continue; $c = ap_item($it, $t, $dir); if ($c) $items[] = $c; }
    if (!$items) fail('Nenhuma peça para enviar.', 422); if (!ap_put("$dir/items.json", $items)) fail('Não consegui gravar no servidor.', 500);
    $recs = ap_json("$dir/records.json") ?: []; $ids = array_column($items, 'id'); foreach (array_keys($recs) as $k) if (!in_array($k, $ids, true)) unset($recs[$k]); ap_put("$dir/records.json", $recs);
    if (isset($b['brand']) && is_array($b['brand'])) $m['brand'] = ['name' => ap_s($b['brand']['name'] ?? $m['name'], 80), 'handle' => preg_replace('/[^\w.]/', '', (string) ($b['brand']['handle'] ?? ''))];
    if (isset($b['subtitle'])) $m['subtitle'] = ap_s($b['subtitle'], 80); $m['notify'] = implode(', ', routing_emails($b['notifyEmails'] ?? ($m['notify'] ?? '')));
    $h = (int) ($b['deadlineHours'] ?? ($m['deadlineHours'] ?? 72)); $m['deadlineHours'] = max(1, min(720, $h ?: 72));
    if (!empty($b['start']) || empty($m['sentAt'])) { $m['sentAt'] = date('c'); @unlink("$dir/submission.json"); }   // novo envio: reinicia o prazo e a revisão do cliente
    if (!ap_put("$dir/meta.json", $m)) fail('Não consegui gravar.', 500);
    json_out(['ok' => true, 'items' => count($items), 'sentAt' => $m['sentAt'], 'deadlineHours' => $m['deadlineHours'], 'link' => ap_link($t)]);
}
if ($action === 'prazo') {   // só muda as horas (não reinicia a contagem)
    $m['deadlineHours'] = max(1, min(720, (int) ($b['deadlineHours'] ?? 72))); ap_put("$dir/meta.json", $m); json_out(['ok' => true, 'deadlineHours' => $m['deadlineHours']]);
}
fail('Ação desconhecida.', 422);
