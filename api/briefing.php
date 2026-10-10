<?php
/* Briefing do cliente: formulário público (briefing.html) por link com código.
   Público (só com o código do link): GET ?t=CODIGO → respostas salvas · POST {t, action:'save'|'submit', answers}
   Studio (logado): POST {action:'create', project, name} · {action:'list', project} · {action:'get', t} · {action:'revoke', t}
   As respostas ficam em <DATA_DIR>/briefings/<codigo>.json (fora do alcance da web). No envio, avisa os e-mails do gestor e manda para a planilha. */
require __DIR__ . '/_lib.php';
require __DIR__ . '/_dispatch.php';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
function bf_dir(): string { $d = data_dir() . '/briefings'; if (!is_dir($d)) @mkdir($d, 0750, true); return $d; }
function bf_ok($t): bool { return is_string($t) && preg_match('/^[a-f0-9]{24}$/', $t) === 1; }
function bf_file(string $t): string { return bf_dir() . '/' . $t . '.json'; }
function bf_read(string $t): ?array { $f = bf_file($t); if (!is_file($f)) return null; $j = json_decode((string) @file_get_contents($f), true); return is_array($j) ? $j : null; }
function bf_write(string $t, array $r): bool { $f = bf_file($t); $tmp = $f . '.tmp'; if (@file_put_contents($tmp, json_encode($r, JSON_UNESCAPED_UNICODE), LOCK_EX) === false) return false; @chmod($tmp, 0640); return @rename($tmp, $f); }
/* limpa as respostas: só texto, listas e objetos pequenos, com limites */
function bf_clean($v, int $depth = 0) {
    if (is_bool($v)) return $v;
    if (is_scalar($v) || $v === null) return mb_substr(str_replace("\0", '', (string) $v), 0, 4000);
    if (!is_array($v) || $depth > 4) return '';
    $isList = array_keys($v) === range(0, count($v) - 1); $o = []; $n = 0;
    foreach ($v as $k => $x) { if (++$n > ($isList ? 60 : 80)) break; if ($isList) $o[] = bf_clean($x, $depth + 1); else { $k = preg_replace('/[^a-z0-9_]/i', '', (string) $k); if ($k !== '') $o[mb_substr($k, 0, 40)] = bf_clean($x, $depth + 1); } }
    return $o;
}
/* arquivos enviados pelo cliente: <DATA_DIR>/briefings/<codigo>/<id>.<ext> (só imagens e PDF, conferidos pelo conteúdo) */
const BF_CATS = ['logo', 'fotos', 'produtos', 'materiais', 'depoimentos'];
function bf_fdir(string $t): string { $d = bf_dir() . '/' . $t; if (!is_dir($d)) @mkdir($d, 0750, true); return $d; }
function bf_fpath(string $t, string $name): ?string { return preg_match('/^[a-f0-9]{16}\.(jpg|png|webp|pdf)$/', $name) && is_file(bf_dir() . '/' . $t . '/' . $name) ? bf_dir() . '/' . $t . '/' . $name : null; }
function bf_files_clean(string $t, $list): array {
    $out = []; foreach (is_array($list) ? array_slice($list, 0, 60) : [] as $f) {
        if (!is_array($f)) continue; $id = (string) ($f['id'] ?? ''); $ext = (string) ($f['ext'] ?? ''); if (!preg_match('/^[a-f0-9]{16}$/', $id) || !preg_match('/^(jpg|png|webp|pdf)$/', $ext) || !bf_fpath($t, "$id.$ext")) continue;
        $cat = in_array($f['cat'] ?? '', BF_CATS, true) ? $f['cat'] : 'materiais';
        $out[] = ['id' => $id, 'ext' => $ext, 'cat' => $cat, 'name' => mb_substr(preg_replace('#[\x00-\x1f<>"\\\\/]#u', '', (string) ($f['name'] ?? 'arquivo')), 0, 80), 'note' => mb_substr((string) ($f['note'] ?? ''), 0, 200)];
    } return $out;
}
function bf_get(array $a, string $path): string { $c = $a; foreach (explode('.', $path) as $k) { if (!is_array($c) || !isset($c[$k])) return ''; $c = $c[$k]; } return is_scalar($c) ? (string) $c : ''; }
function bf_summary(array $r): string {
    $a = $r['answers'] ?? []; $prods = []; foreach (($a['produtos'] ?? []) as $p) if (is_array($p) && ($p['nome'] ?? '') !== '') $prods[] = $p['nome'];
    return "Briefing recebido: " . ($r['name'] ?? '') . "\nEmpresa: " . bf_get($a, 'empresa.nome') . "\nResponsável: " . bf_get($a, 'contato.nome') . " · WhatsApp " . bf_get($a, 'contato.whatsapp') . " · " . bf_get($a, 'contato.email')
        . "\nSite: " . bf_get($a, 'empresa.site') . " · Instagram: " . bf_get($a, 'empresa.instagram') . "\nProdutos e serviços: " . ($prods ? implode('; ', $prods) : '(nenhum informado)')
        . "\nMetas: " . bf_get($a, 'marketing.metas') . "\n\nAbra o projeto no Studio → Pré-Projeto → Briefing do cliente → Importar respostas.";
}

/* ---------- público: ler e salvar pelo código do link ---------- */
if ($method === 'GET') {
    $t = (string) ($_GET['t'] ?? ''); if (!bf_ok($t)) fail('Link inválido.', 404);
    if (isset($_GET['f'])) {
        if (!rate_limit('bfimg:' . client_ip(), 1500, 3600)) fail('Muitos acessos.', 429);
        $r = bf_read($t); if (!$r || !empty($r['revoked'])) fail('Link inválido.', 404); $p = bf_fpath($t, (string) $_GET['f']); if (!$p) fail('Arquivo não encontrado.', 404);
        $ext = substr($p, -3); $mime = ['jpg' => 'image/jpeg', 'png' => 'image/png', 'ebp' => 'image/webp', 'pdf' => 'application/pdf'][$ext] ?? 'application/octet-stream';
        header('Content-Type: ' . $mime); header('X-Content-Type-Options: nosniff'); header('Cache-Control: private, max-age=3600'); header('Content-Length: ' . filesize($p)); readfile($p); exit;
    }
    if (!rate_limit('bfget:' . client_ip(), 120, 3600)) fail('Muitos acessos. Tente mais tarde.', 429);
    $r = bf_read($t); if (!$r || !empty($r['revoked'])) fail('Este link não está mais ativo. Peça um novo ao seu contato.', 404);
    json_out(['ok' => true, 'name' => $r['name'] ?? '', 'status' => $r['status'] ?? 'rascunho', 'answers' => $r['answers'] ?? new stdClass, 'updatedAt' => $r['updatedAt'] ?? '', 'submittedAt' => $r['submittedAt'] ?? '']);
}
if ($method !== 'POST') fail('Use GET ou POST', 405);
require_json_write();
$b = body_json(9000000); $action = (string) ($b['action'] ?? '');

if (in_array($action, ['save', 'submit'], true)) {
    $t = (string) ($b['t'] ?? ''); if (!bf_ok($t)) fail('Link inválido.', 404);
    if (!rate_limit('bfsave:' . client_ip() . $t, $action === 'submit' ? 12 : 240, 3600)) fail('Muitas tentativas. Tente mais tarde.', 429);
    $r = bf_read($t); if (!$r || !empty($r['revoked'])) fail('Este link não está mais ativo.', 404);
    $a = bf_clean($b['answers'] ?? []); if (!is_array($a)) $a = [];
    $a['arquivos'] = bf_files_clean($t, $a['arquivos'] ?? []);
    if (strlen(json_encode($a)) > 300000) fail('Respostas grandes demais.', 413);
    $r['answers'] = $a; $r['updatedAt'] = date('c');
    if ($action === 'submit') {
        $miss = []; foreach ([['empresa.nome', 'nome da empresa'], ['contato.nome', 'seu nome'], ['contato.whatsapp', 'seu WhatsApp']] as [$p, $l]) if (trim(bf_get($a, $p)) === '') $miss[] = $l;
        $hasProd = false; foreach (($a['produtos'] ?? []) as $p) if (is_array($p) && trim((string) ($p['nome'] ?? '')) !== '') $hasProd = true; if (!$hasProd) $miss[] = 'pelo menos um produto ou serviço';
        if (empty($a['aceite'])) $miss[] = 'a autorização de uso das informações';
        if ($miss) fail('Falta preencher: ' . implode(', ', $miss) . '.', 422, ['missing' => $miss]);
        $first = ($r['status'] ?? '') !== 'enviado'; $r['status'] = 'enviado'; $r['submittedAt'] = date('c'); $r['revisions'] = (int) ($r['revisions'] ?? 0) + 1;
    }
    if (!bf_write($t, $r)) fail('Não consegui salvar no servidor.', 500);
    if ($action === 'submit') {
        @file_put_contents(data_dir() . '/briefings.jsonl', json_encode(['at' => date('c'), 'project' => $r['project'] ?? '', 'name' => $r['name'] ?? '', 'answers' => $a], JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
        try {
            $rt = routing_cfg(); $subject = ($first ? 'Briefing recebido: ' : 'Briefing atualizado: ') . ($r['name'] ?? '');
            if ($rt['managers']) dispatch_log('email briefing ' . (dispatch_mail($rt['managers'], $subject, bf_summary($r), $rt['from']) ? 'ok' : 'falhou'));
            if ($rt['sheetsUrl'] !== '') { [$code, , $err] = http_json($rt['sheetsUrl'], ['Content-Type: application/json'], ['type' => 'briefing', 'project' => $r['project'] ?? '', 'name' => $r['name'] ?? '', 'at' => date('c'), 'text' => bf_summary($r), 'answers' => $a], 8); dispatch_log('planilha briefing HTTP ' . $code); }
        } catch (Throwable $e) { dispatch_log('briefing erro: ' . $e->getMessage()); }
    }
    json_out(['ok' => true, 'status' => $r['status'] ?? 'rascunho', 'updatedAt' => $r['updatedAt']]);
}

if (in_array($action, ['upload', 'rmfile'], true)) {
    $t = (string) ($b['t'] ?? ''); if (!bf_ok($t)) fail('Link inválido.', 404);
    if (!rate_limit('bfup:' . client_ip() . $t, 80, 3600)) fail('Muitos envios. Tente mais tarde.', 429);
    $r = bf_read($t); if (!$r || !empty($r['revoked'])) fail('Este link não está mais ativo.', 404);
    if ($action === 'rmfile') { $p = bf_fpath($t, (string) ($b['file'] ?? '')); if ($p) @unlink($p); json_out(['ok' => true]); }
    if (!preg_match('#^data:(image/(?:jpeg|png|webp)|application/pdf);base64,([A-Za-z0-9+/=\s]+)$#', (string) ($b['data'] ?? ''), $m)) fail('Envie imagem (JPG, PNG, WebP) ou PDF.', 422);
    $bin = base64_decode($m[2], true); if ($bin === false || $bin === '') fail('Arquivo inválido.', 422);
    $isPdf = $m[1] === 'application/pdf'; if (strlen($bin) > ($isPdf ? 6_000_000 : 4_000_000)) fail('Arquivo grande demais (imagem até 4 MB, PDF até 6 MB).', 413);
    if ($isPdf) { if (substr($bin, 0, 5) !== '%PDF-') fail('Esse PDF não parece válido.', 422); $ext = 'pdf'; }
    else { $gi = @getimagesizeFromstring($bin); $mimes = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp']; if (!$gi || !isset($mimes[$gi[2]])) fail('Essa imagem não parece válida.', 422); $ext = $mimes[$gi[2]]; }
    $dir = bf_fdir($t); if (count(glob($dir . '/*.*') ?: []) >= 60) fail('Limite de 60 arquivos neste briefing.', 422);
    $id = bin2hex(random_bytes(8)); if (@file_put_contents("$dir/$id.$ext", $bin, LOCK_EX) === false) fail('Não consegui salvar o arquivo.', 500); @chmod("$dir/$id.$ext", 0640);
    json_out(['ok' => true, 'id' => $id, 'ext' => $ext, 'size' => strlen($bin)]);
}

/* ---------- Studio (logado) ---------- */
require_auth();
if ($action === 'create') {
    $project = preg_replace('/[^\w\-]/', '', (string) ($b['project'] ?? '')); $name = mb_substr(trim((string) ($b['name'] ?? '')), 0, 120);
    if ($project === '' || $name === '') fail('Informe o projeto e o nome.', 422);
    $t = bin2hex(random_bytes(12));
    if (!bf_write($t, ['t' => $t, 'project' => $project, 'name' => $name, 'status' => 'rascunho', 'answers' => new stdClass, 'created' => date('c')])) fail('Não consegui gravar (permissão da pasta api/data).', 500);
    json_out(['ok' => true, 't' => $t]);
}
if (in_array($action, ['get', 'revoke'], true)) {
    $t = (string) ($b['t'] ?? ''); if (!bf_ok($t)) fail('Código inválido.', 422); $r = bf_read($t); if (!$r) fail('Link não encontrado.', 404);
    if ($action === 'revoke') { $r['revoked'] = true; bf_write($t, $r); json_out(['ok' => true]); }
    json_out(['ok' => true, 'record' => $r]);
}
if ($action === 'list') {
    $project = preg_replace('/[^\w\-]/', '', (string) ($b['project'] ?? '')); $out = [];
    foreach (glob(bf_dir() . '/*.json') ?: [] as $f) { $r = json_decode((string) @file_get_contents($f), true); if (is_array($r) && empty($r['revoked']) && ($project === '' || ($r['project'] ?? '') === $project)) $out[] = ['t' => $r['t'] ?? '', 'name' => $r['name'] ?? '', 'status' => $r['status'] ?? 'rascunho', 'updatedAt' => $r['updatedAt'] ?? '', 'submittedAt' => $r['submittedAt'] ?? '', 'created' => $r['created'] ?? '']; }
    json_out(['ok' => true, 'links' => $out]);
}
fail('Ação desconhecida.', 422);
