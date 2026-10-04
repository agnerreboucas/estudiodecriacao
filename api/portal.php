<?php
/* Portal do cliente: o cliente abre cliente.html?t=CODIGO (sem login) e vê o projeto, o cronograma, as peças e os resultados, e aprova ou pede ajustes.
   O Studio (logado) publica um "retrato" do projeto: só o que foi marcado como visível ao cliente. Os leads do projeto são lidos ao vivo, só em números (sem nome nem telefone).
   Público (código do link): GET ?t=  ·  GET ?t=&img=ID  ·  GET ?t=&page=ID  ·  POST {t, action:'decide', item, decision:'approve'|'changes'|'comment', comment, who}
   Studio (logado): POST {action:'create'|'publish'|'upload'|'decisions'|'info'|'revoke', ...}.  Dados em <DATA_DIR>/portal/<codigo>/ (fora do alcance da web). */
require __DIR__ . '/_lib.php';
require __DIR__ . '/_dispatch.php';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
function pt_ok($t): bool { return is_string($t) && preg_match('/^[a-f0-9]{24}$/', $t) === 1; }
function pt_dir(string $t): string { $d = data_dir() . '/portal/' . $t; if (!is_dir($d)) @mkdir($d, 0750, true); return $d; }
function pt_json(string $f) { if (!is_file($f)) return null; $j = json_decode((string) @file_get_contents($f), true); return is_array($j) ? $j : null; }
function pt_put(string $f, $d): bool { $tmp = $f . '.tmp'; if (@file_put_contents($tmp, json_encode($d, JSON_UNESCAPED_UNICODE), LOCK_EX) === false) return false; @chmod($tmp, 0640); return @rename($tmp, $f); }
function pt_meta(string $t): ?array { $m = pt_json(pt_dir($t) . '/meta.json'); return ($m && empty($m['revoked'])) ? $m : null; }
function pt_id($v): string { return preg_replace('/[^a-z0-9_]/i', '', (string) $v); }
function pt_s($v, int $n): string { return mb_substr(str_replace("\0", '', trim((string) $v)), 0, $n); }
function pt_emails($v): array { return routing_emails($v); }
function pt_decisions(string $t): array { $f = pt_dir($t) . '/decisions.jsonl'; $o = []; if (is_file($f)) foreach (file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $l) { $j = json_decode($l, true); if (is_array($j)) $o[] = $j; } return $o; }
function pt_leads(string $project): array {
    $f = data_dir() . '/leads.jsonl'; $now = time(); $tot = 0; $d7 = 0; $d30 = 0; $day = []; $camp = []; $src = []; $cont = [];
    for ($i = 29; $i >= 0; $i--) $day[date('Y-m-d', $now - $i * 86400)] = 0;
    if (is_file($f)) foreach (file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $l = json_decode($line, true); if (!is_array($l) || ($l['project'] ?? '') !== $project) continue; $tot++; $ts = strtotime((string) ($l['at'] ?? '')) ?: 0;
        if ($ts >= $now - 7 * 86400) $d7++; if ($ts >= $now - 30 * 86400) { $d30++; $k = date('Y-m-d', $ts); if (isset($day[$k])) $day[$k]++; }
        $u = is_array($l['utm'] ?? null) ? $l['utm'] : []; $v = pt_s($u['utm_campaign'] ?? '', 80); $camp[$v === '' ? '(sem origem)' : $v] = ($camp[$v === '' ? '(sem origem)' : $v] ?? 0) + 1;
        $v = pt_s($u['utm_source'] ?? '', 80); $src[$v === '' ? '(sem origem)' : $v] = ($src[$v === '' ? '(sem origem)' : $v] ?? 0) + 1; $v = pt_s($u['utm_content'] ?? '', 80); $cont[$v === '' ? '(sem origem)' : $v] = ($cont[$v === '' ? '(sem origem)' : $v] ?? 0) + 1;
    }
    $top = function (array $a) { arsort($a); $o = []; foreach (array_slice($a, 0, 8, true) as $k => $n) $o[] = ['k' => (string) $k, 'n' => $n]; return $o; };
    $days = []; foreach ($day as $k => $n) $days[] = ['d' => $k, 'n' => $n];
    return ['total' => $tot, 'd7' => $d7, 'd30' => $d30, 'days' => $days, 'campaigns' => $top($camp), 'sources' => $top($src), 'ads' => $top($cont)];
}

/* ---------- público ---------- */
if ($method === 'GET') {
    $t = (string) ($_GET['t'] ?? ''); if (!pt_ok($t)) fail('Link inválido.', 404);
    if (!rate_limit('ptget:' . client_ip(), 600, 3600)) fail('Muitos acessos. Tente mais tarde.', 429);
    $m = pt_meta($t); if (!$m) fail('Este link não está mais ativo. Peça um novo ao seu contato.', 404);
    $dir = pt_dir($t);
    if (isset($_GET['img'])) { $id = pt_id($_GET['img']); foreach (['webp' => 'image/webp', 'jpg' => 'image/jpeg', 'png' => 'image/png'] as $ext => $ct) { $f = "$dir/img_$id.$ext"; if ($id !== '' && is_file($f)) { header('Content-Type: ' . $ct); header('X-Content-Type-Options: nosniff'); header('Cache-Control: private, max-age=300'); readfile($f); exit; } } http_response_code(404); exit; }
    if (isset($_GET['page'])) { $id = pt_id($_GET['page']); $f = "$dir/page_$id.html"; if ($id === '' || !is_file($f)) { http_response_code(404); exit; }
        header('Content-Type: text/html; charset=utf-8'); header('X-Content-Type-Options: nosniff'); header("Content-Security-Policy: sandbox; default-src 'none'; img-src data: https:; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src data: https://fonts.gstatic.com; media-src data:; form-action 'none'; base-uri 'none'"); readfile($f); exit; }
    $snap = pt_json($dir . '/snapshot.json') ?: ['items' => [], 'news' => []]; $dec = pt_decisions($t); $latest = [];
    foreach ($dec as $d) $latest[$d['item'] ?? ''] = ['decision' => $d['decision'] ?? '', 'at' => $d['at'] ?? '', 'comment' => $d['comment'] ?? '', 'who' => $d['who'] ?? ''];
    $thread = []; foreach ($dec as $d) $thread[$d['item'] ?? ''][] = ['decision' => $d['decision'] ?? '', 'at' => $d['at'] ?? '', 'comment' => $d['comment'] ?? '', 'who' => $d['who'] ?? ''];
    json_out(['ok' => true, 'name' => $m['name'] ?? '', 'snapshot' => $snap, 'decisions' => $latest, 'thread' => $thread, 'leads' => pt_leads((string) ($m['project'] ?? ''))]);
}
if ($method !== 'POST') fail('Use GET ou POST', 405);
require_json_write();
$b = body_json(4_500_000); $action = (string) ($b['action'] ?? '');

if ($action === 'decide') {
    $t = (string) ($b['t'] ?? ''); if (!pt_ok($t)) fail('Link inválido.', 404); $m = pt_meta($t); if (!$m) fail('Este link não está mais ativo.', 404);
    if (!rate_limit('ptdec:' . client_ip() . $t, 60, 3600)) fail('Muitas ações. Tente mais tarde.', 429);
    $item = pt_id($b['item'] ?? ''); $dec = (string) ($b['decision'] ?? ''); if (!in_array($dec, ['approve', 'changes', 'comment'], true)) fail('Ação inválida.', 422);
    $snap = pt_json(pt_dir($t) . '/snapshot.json') ?: ['items' => []]; $found = null; foreach ($snap['items'] ?? [] as $it) if (($it['id'] ?? '') === $item) $found = $it; if (!$found) fail('Peça não encontrada.', 404);
    $comment = pt_s($b['comment'] ?? '', 1500); if ($dec !== 'approve' && $comment === '') fail('Escreva o que precisa ser ajustado.', 422);
    $rec = ['at' => date('c'), 'item' => $item, 'title' => pt_s($found['title'] ?? '', 120), 'decision' => $dec, 'comment' => $comment, 'who' => pt_s($b['who'] ?? '', 80)];
    @file_put_contents(pt_dir($t) . '/decisions.jsonl', json_encode($rec, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
    try { $rt = routing_cfg(); $lab = ['approve' => 'aprovou', 'changes' => 'pediu ajustes em', 'comment' => 'comentou'][$dec]; $to = array_values(array_unique(array_merge($rt['managers'], pt_emails($m['notify'] ?? ''))));
        if ($to) dispatch_log('email portal ' . (dispatch_mail($to, 'Cliente ' . $lab . ': ' . $rec['title'], "O cliente " . ($rec['who'] ?: '') . " $lab \"" . $rec['title'] . "\" no portal (" . ($m['name'] ?? '') . ").\n" . ($comment !== '' ? "\nComentário: $comment\n" : '') . "\nAbra o Studio → Portal do cliente para ver e aplicar a resposta.", $rt['from']) ? 'ok' : 'falhou')); } catch (Throwable $e) { dispatch_log('portal erro: ' . $e->getMessage()); }
    json_out(['ok' => true, 'decision' => $dec, 'at' => $rec['at']]);
}

/* ---------- Studio (logado) ---------- */
require_auth();
if ($action === 'create') {
    $project = preg_replace('/[^\w\-]/', '', (string) ($b['project'] ?? '')); $name = pt_s($b['name'] ?? '', 120); if ($project === '' || $name === '') fail('Informe o projeto e o nome.', 422);
    $t = bin2hex(random_bytes(12)); if (!pt_put(pt_dir($t) . '/meta.json', ['t' => $t, 'project' => $project, 'name' => $name, 'created' => date('c'), 'notify' => '', 'clientEmails' => ''])) fail('Não consegui gravar (permissão da pasta api/data).', 500);
    json_out(['ok' => true, 't' => $t]);
}
$t = (string) ($b['t'] ?? ''); if (!pt_ok($t)) fail('Código inválido.', 422); $m = pt_meta($t); if (!$m) fail('Portal não encontrado.', 404); $dir = pt_dir($t);
if ($action === 'revoke') { $m['revoked'] = true; pt_put("$dir/meta.json", $m); json_out(['ok' => true]); }
if ($action === 'info') json_out(['ok' => true, 'meta' => $m, 'decisions' => count(pt_decisions($t)), 'hasSnapshot' => is_file("$dir/snapshot.json")]);
if ($action === 'decisions') { json_out(['ok' => true, 'decisions' => pt_decisions($t)]); }
if ($action === 'upload') {
    $n = 0; $bytes = 0;
    foreach ((is_array($b['images'] ?? null) ? $b['images'] : []) as $id => $data) {
        $id = pt_id($id); if ($id === '' || !is_string($data) || !preg_match('#^data:image/(webp|jpeg|png);base64,([A-Za-z0-9+/=]+)$#', $data, $mm)) continue; $raw = base64_decode($mm[2], true); if ($raw === false || strlen($raw) > 700000) continue;
        foreach (['webp', 'jpg', 'png'] as $e) @unlink("$dir/img_$id.$e"); $ext = $mm[1] === 'jpeg' ? 'jpg' : $mm[1]; if (@file_put_contents("$dir/img_$id.$ext", $raw) !== false) { $n++; $bytes += strlen($raw); }
    }
    foreach ((is_array($b['pages'] ?? null) ? $b['pages'] : []) as $id => $html) { $id = pt_id($id); if ($id === '' || !is_string($html) || strlen($html) > 3_500_000) continue; if (@file_put_contents("$dir/page_$id.html", $html) !== false) $n++; }
    json_out(['ok' => true, 'saved' => $n]);
}
if ($action === 'publish') {
    $s = is_array($b['snapshot'] ?? null) ? $b['snapshot'] : []; $items = []; $kinds = ['carousel', 'set', 'page', 'image', 'text', 'none']; $sts = ['Em criação', 'Ajustes', 'Em aprovação', 'Aprovado', 'Agendado', 'No ar', 'Concluído'];
    foreach (array_slice(is_array($s['items'] ?? null) ? $s['items'] : [], 0, 200) as $it) {
        if (!is_array($it)) continue; $id = pt_id($it['id'] ?? ''); if ($id === '') continue;
        $imgs = []; foreach (array_slice(is_array($it['imgs'] ?? null) ? $it['imgs'] : [], 0, 20) as $x) { $x = pt_id($x); if ($x !== '') $imgs[] = $x; }
        $items[] = ['id' => $id, 'title' => pt_s($it['title'] ?? '', 140), 'kind' => in_array($it['kind'] ?? '', $kinds, true) ? $it['kind'] : 'none', 'status' => in_array($it['status'] ?? '', $sts, true) ? $it['status'] : 'Em criação', 'due' => preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) ($it['due'] ?? '')) ? $it['due'] : '', 'channel' => pt_s($it['channel'] ?? '', 40), 'note' => pt_s($it['note'] ?? '', 800),
            'imgs' => $imgs, 'page' => pt_id($it['page'] ?? ''), 'copy' => ['title' => pt_s($it['copy']['title'] ?? '', 160), 'text' => pt_s($it['copy']['text'] ?? '', 2400), 'desc' => pt_s($it['copy']['desc'] ?? '', 200), 'caption' => pt_s($it['copy']['caption'] ?? '', 2400)], 'updated' => pt_s($it['updated'] ?? '', 40)];
    }
    $news = []; foreach (array_slice(is_array($s['news'] ?? null) ? $s['news'] : [], 0, 40) as $n) if (is_array($n)) $news[] = ['at' => pt_s($n['at'] ?? '', 40), 'text' => pt_s($n['text'] ?? '', 200), 'item' => pt_id($n['item'] ?? '')];
    $camps = []; foreach (array_slice(is_array($s['campaigns'] ?? null) ? $s['campaigns'] : [], 0, 30) as $c) if (is_array($c)) $camps[] = ['name' => pt_s($c['name'] ?? '', 100), 'channel' => pt_s($c['channel'] ?? '', 40), 'status' => pt_s($c['status'] ?? '', 30), 'objective' => pt_s($c['objective'] ?? '', 60)];
    $met = is_array($s['metrics'] ?? null) ? $s['metrics'] : []; $metrics = []; foreach (['spend', 'impressions', 'clicks', 'leads', 'conversions'] as $k) $metrics[$k] = is_numeric($met[$k] ?? null) ? (float) $met[$k] : null;
    $snap = ['name' => pt_s($s['name'] ?? ($m['name'] ?? ''), 120), 'client' => pt_s($s['client'] ?? '', 120), 'brand' => ['accent' => preg_match('/^#[0-9a-f]{6}$/i', (string) ($s['brand']['accent'] ?? '')) ? $s['brand']['accent'] : '#111111', 'logo' => pt_id($s['brand']['logo'] ?? '')], 'items' => $items, 'news' => $news, 'campaigns' => $camps, 'metrics' => $metrics, 'publishedAt' => date('c')];
    if (!pt_put("$dir/snapshot.json", $snap)) fail('Não consegui gravar no servidor.', 500);
    $m['clientEmails'] = implode(', ', pt_emails($b['clientEmails'] ?? '')); $m['notify'] = implode(', ', pt_emails($b['notifyEmails'] ?? '')); pt_put("$dir/meta.json", $m);
    $mail = 'não'; $wait = array_values(array_filter($items, fn($i) => $i['status'] === 'Em aprovação'));
    if (!empty($b['notify']) && $m['clientEmails'] !== '') {
        $host = preg_replace('/[^a-z0-9.\-:]/i', '', $_SERVER['HTTP_HOST'] ?? 'localhost'); $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http'; $base = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/api/portal.php'), '/'); $base = preg_replace('#/api$#', '', $base);
        $link = "$https://$host$base/cliente.html?t=$t"; $rt = routing_cfg();
        $txt = "Olá!\n\nHá novidades no seu projeto (" . $snap['name'] . ").\n" . (count($wait) ? "\n" . count($wait) . " peça(s) aguardando a sua aprovação:\n- " . implode("\n- ", array_map(fn($i) => $i['title'], array_slice($wait, 0, 10))) . "\n" : '') . "\nAcompanhe e aprove aqui: $link\n";
        $mail = dispatch_mail(pt_emails($m['clientEmails']), 'Novidades no seu projeto: ' . $snap['name'], $txt, $rt['from']) ? 'enviado' : 'falhou';
    }
    json_out(['ok' => true, 'items' => count($items), 'awaiting' => count($wait), 'mail' => $mail]);
}
fail('Ação desconhecida.', 422);
