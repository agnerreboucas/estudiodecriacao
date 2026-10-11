<?php
/* Prévia do site para o cliente aprovar.
   Equipe (logada no Studio): POST {action:'publish', t?, first, name, files:[{name, b64}]} (em lotes) · POST {action:'done', t} · POST {action:'revoke', t} · GET ?action=status&t=
   Público (quem tem o código do link, 16 caracteres): abre o site como arquivos normais; cada página .html ganha uma barra "Aprovar / Pedir ajustes" que grava a decisão
   (POST {action:'decision', t, decision:'approved'|'changes', comment, name}).
   Endereços: https://SEU-DOMINIO/api/preview.php/CODIGO/index.html  (sempre funciona)  ou  https://CODIGO.PREVIEW_DOMAIN/  (se PREVIEW_DOMAIN estiver no config.php e o DNS com
   curinga *.PREVIEW_DOMAIN apontar para esta hospedagem; ver preview.htaccess.sample). Arquivos ficam em <DATA_DIR>/preview/<codigo>/ (fora do alcance da web). */
require __DIR__ . '/_lib.php';
header('X-Robots-Tag: noindex, nofollow');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

const PV_EXT = ['html' => 'text/html; charset=utf-8', 'css' => 'text/css; charset=utf-8', 'js' => 'text/javascript; charset=utf-8', 'json' => 'application/json; charset=utf-8', 'txt' => 'text/plain; charset=utf-8', 'xml' => 'application/xml; charset=utf-8',
    'png' => 'image/png', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'webp' => 'image/webp', 'gif' => 'image/gif', 'svg' => 'image/svg+xml', 'ico' => 'image/x-icon', 'woff' => 'font/woff', 'woff2' => 'font/woff2', 'ttf' => 'font/ttf', 'otf' => 'font/otf'];
const PV_MAX_FILE = 8_000_000; const PV_MAX_TOTAL = 40_000_000; const PV_MAX_COUNT = 300; const PV_DAYS = 30;

function pv_ok($t): bool { return is_string($t) && preg_match('/^[a-f0-9]{16}$/', $t) === 1; }
function pv_dir(string $t): string { return data_dir() . '/preview/' . $t; }
function pv_meta(string $t): ?array { $f = pv_dir($t) . '/meta.json'; if (!is_file($f)) return null; $j = json_decode((string) @file_get_contents($f), true); return is_array($j) ? $j : null; }
function pv_save(string $t, array $m): void { $d = pv_dir($t); if (!is_dir($d)) @mkdir($d, 0750, true); @file_put_contents($d . '/meta.json', json_encode($m, JSON_UNESCAPED_UNICODE), LOCK_EX); }
function pv_s($v, int $n): string { return mb_substr(str_replace("\0", '', trim((string) $v)), 0, $n); }
function pv_path($n): ?string {
    $n = str_replace('\\', '/', trim((string) $n)); $n = ltrim($n, '/'); if ($n === '' || strlen($n) > 140 || strpos($n, '..') !== false || !preg_match('#^[A-Za-z0-9_\-./]+$#', $n) || substr($n, 0, 1) === '.') return null;
    $ext = strtolower(pathinfo($n, PATHINFO_EXTENSION)); return isset(PV_EXT[$ext]) ? $n : null;
}
function pv_rmdir(string $d): void { if (!is_dir($d)) return; foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($d, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST) as $f) { $f->isDir() ? @rmdir($f->getPathname()) : @unlink($f->getPathname()); } @rmdir($d); }
function pv_api_path(): string { return $_SERVER['SCRIPT_NAME'] ?? '/api/preview.php'; }
function pv_url(string $t): string {
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https'); $sch = $https ? 'https' : 'http'; $dom = (string) cfg('PREVIEW_DOMAIN', '');
    if ($dom !== '' && preg_match('/^[a-z0-9.\-]+$/i', $dom)) return $sch . '://' . $t . '.' . $dom . '/';
    return $sch . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . pv_api_path() . '/' . $t . '/index.html';
}
function pv_expired(array $m): bool { return !empty($m['expires']) && strtotime((string) $m['expires']) < time(); }

/* ---------- equipe ---------- */
if ($method === 'POST' || ($method === 'GET' && ($_GET['action'] ?? '') === 'status')) {
    $j = $method === 'POST' ? (function () { require_json_write(); return body_json(45_000_000); })() : [];
    $act = (string) ($j['action'] ?? $_GET['action'] ?? '');
    if ($act === 'decision') {   // público
        $t = $j['t'] ?? ''; if (!pv_ok($t) || !($m = pv_meta($t)) || !empty($m['revoked']) || pv_expired($m)) fail('Link inválido ou vencido', 404);
        if (!rate_limit('pvdec:' . client_ip(), 20, 600)) fail('Muitas tentativas. Tente de novo em alguns minutos.', 429);
        $dec = in_array($j['decision'] ?? '', ['approved', 'changes'], true) ? $j['decision'] : ''; if ($dec === '') fail('Escolha aprovar ou pedir ajustes');
        $c = pv_s($j['comment'] ?? '', 1500); if ($dec === 'changes' && $c === '') fail('Conte o que precisa mudar');
        $m['decisions'][] = ['at' => date('c'), 'decision' => $dec, 'comment' => $c, 'name' => pv_s($j['name'] ?? '', 80), 'version' => (int) ($m['version'] ?? 1)]; $m['decisions'] = array_slice($m['decisions'], -50); $m['status'] = $dec; pv_save($t, $m);
        json_out(['ok' => true, 'status' => $dec]);
    }
    require_auth();
    if ($act === 'publish') {
        $t = $j['t'] ?? ''; $first = !empty($j['first']); $files = is_array($j['files'] ?? null) ? $j['files'] : [];
        if ($t === '' || $t === null) { $t = bin2hex(random_bytes(8)); $first = true; } elseif (!pv_ok($t)) fail('Código inválido');
        $m = pv_meta($t); if ($m && !empty($m['revoked'])) fail('Este link foi desativado. Crie outro.', 410); if (!$m && !$first) fail('Prévia não encontrada', 404);
        $d = pv_dir($t) . '/files'; if ($first) { pv_rmdir($d); } if (!is_dir($d) && !@mkdir($d, 0750, true)) fail('Não consegui gravar a prévia', 500);
        $count = 0; $total = 0; foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($d, FilesystemIterator::SKIP_DOTS)) as $f) { $count++; $total += $f->getSize(); }
        foreach ($files as $f) {
            if (!is_array($f)) continue; $n = pv_path($f['name'] ?? ''); if ($n === null) fail('Nome de arquivo não aceito: ' . pv_s($f['name'] ?? '', 60)); $raw = base64_decode((string) ($f['b64'] ?? ''), true); if ($raw === false) fail('Arquivo corrompido: ' . $n);
            if (strlen($raw) > PV_MAX_FILE) fail('Arquivo grande demais: ' . $n); if (++$count > PV_MAX_COUNT || ($total += strlen($raw)) > PV_MAX_TOTAL) fail('A prévia passou do limite de arquivos ou de tamanho.');
            $p = $d . '/' . $n; $dir = dirname($p); if (!is_dir($dir)) @mkdir($dir, 0750, true); if (@file_put_contents($p, $raw, LOCK_EX) === false) fail('Não consegui gravar ' . $n, 500);
        }
        if (!$m) $m = ['created' => date('c'), 'version' => 0, 'decisions' => [], 'status' => 'pending'];
        if ($first) { $m['version'] = (int) ($m['version'] ?? 0) + 1; $m['status'] = 'pending'; $m['ready'] = false; $m['name'] = pv_s($j['name'] ?? ($m['name'] ?? ''), 120); $m['project'] = pv_s($j['project'] ?? ($m['project'] ?? ''), 60); }
        pv_save($t, $m); json_out(['ok' => true, 't' => $t, 'version' => $m['version'], 'url' => pv_url($t), 'urlPath' => pv_url_path_only($t)]);
    }
    if ($act === 'done') {
        $t = $j['t'] ?? ''; if (!pv_ok($t) || !($m = pv_meta($t))) fail('Prévia não encontrada', 404); if (!is_file(pv_dir($t) . '/files/index.html')) fail('Falta o index.html (página inicial) na prévia.');
        $m['ready'] = true; $m['published'] = date('c'); $m['expires'] = date('c', time() + PV_DAYS * 86400); pv_save($t, $m); json_out(['ok' => true, 't' => $t, 'url' => pv_url($t), 'urlPath' => pv_url_path_only($t), 'expires' => $m['expires']]);
    }
    if ($act === 'revoke') { $t = $j['t'] ?? ''; if (!pv_ok($t) || !($m = pv_meta($t))) fail('Prévia não encontrada', 404); $m['revoked'] = true; pv_save($t, $m); pv_rmdir(pv_dir($t) . '/files'); json_out(['ok' => true]); }
    if ($act === 'status') { $t = $_GET['t'] ?? ''; if (!pv_ok($t) || !($m = pv_meta($t))) fail('Prévia não encontrada', 404); json_out(['ok' => true, 'status' => $m['status'] ?? 'pending', 'ready' => !empty($m['ready']), 'revoked' => !empty($m['revoked']), 'expired' => pv_expired($m), 'version' => (int) ($m['version'] ?? 1), 'expires' => $m['expires'] ?? '', 'decisions' => $m['decisions'] ?? [], 'url' => pv_url($t), 'urlPath' => pv_url_path_only($t)]); }
    fail('Ação desconhecida');
}
function pv_url_path_only(string $t): string { $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https'); return ($https ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . pv_api_path() . '/' . $t . '/index.html'; }

/* ---------- público: servir o site ---------- */
function pv_gone(string $msg, int $code = 404): void { http_response_code($code); header('Content-Type: text/html; charset=utf-8'); echo '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Prévia</title><body style="font:16px system-ui;display:grid;place-content:center;min-height:90vh;text-align:center;color:#333"><div><h1 style="font-size:22px">' . htmlspecialchars($msg) . '</h1><p>Peça um novo link para a agência.</p></div>'; exit; }
$t = ''; $f = '';
$host = strtolower(preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? ''))); $dom = strtolower((string) cfg('PREVIEW_DOMAIN', ''));
if ($dom !== '' && preg_match('/^([a-f0-9]{16})\.' . preg_quote($dom, '/') . '$/', $host, $mm)) { $t = $mm[1]; $f = (string) ($_GET['f'] ?? ''); if ($f === '') { $p = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH); $f = ltrim(urldecode((string) $p), '/'); } }
elseif (!empty($_SERVER['PATH_INFO']) && preg_match('#^/([a-f0-9]{16})(?:/(.*))?$#', (string) $_SERVER['PATH_INFO'], $mm)) { $t = $mm[1]; $f = $mm[2] ?? ''; }
else { $t = (string) ($_GET['t'] ?? ''); $f = (string) ($_GET['f'] ?? ''); }
if (!pv_ok($t)) pv_gone('Link inválido');
$m = pv_meta($t); if (!$m || empty($m['ready'])) pv_gone('Prévia não encontrada'); if (!empty($m['revoked'])) pv_gone('Este link foi desativado', 410); if (pv_expired($m)) pv_gone('Este link venceu', 410);
if ($f === '' || substr($f, -1) === '/') $f .= 'index.html';
$n = pv_path($f); if ($n === null) pv_gone('Página não encontrada'); $p = pv_dir($t) . '/files/' . $n; if (!is_file($p)) pv_gone('Página não encontrada');
$ext = strtolower(pathinfo($n, PATHINFO_EXTENSION)); header('Content-Type: ' . PV_EXT[$ext]); header('X-Content-Type-Options: nosniff'); header('Referrer-Policy: no-referrer'); header('Cache-Control: no-store');
if ($ext === 'svg') header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox");
if ($ext !== 'html') { readfile($p); exit; }
$html = (string) file_get_contents($p); $api = pv_api_path(); $st = $m['status'] ?? 'pending';
$bar = '<div id="pvBar" style="position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:#141414;color:#fff;font:14px/1.4 system-ui,sans-serif;padding:10px 14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;box-shadow:0 -4px 20px rgba(0,0,0,.3)">'
    . '<span id="pvMsg" style="flex:1 1 220px"><b>Prévia para aprovação.</b> Navegue pelo site todo e, no fim, diga o que achou.</span>'
    . '<button id="pvOk" style="background:#2f9e44;color:#fff;border:0;border-radius:8px;padding:9px 14px;font:600 14px system-ui;cursor:pointer">Aprovar o site</button>'
    . '<button id="pvCh" style="background:#fff;color:#111;border:0;border-radius:8px;padding:9px 14px;font:600 14px system-ui;cursor:pointer">Pedir ajustes</button></div>'
    . '<div id="pvBox" hidden style="position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.55);display:none;place-items:center;font:15px/1.4 system-ui,sans-serif"><div style="background:#fff;color:#111;border-radius:14px;padding:20px;width:min(480px,92vw)"><b style="font-size:17px">O que precisa mudar?</b><p style="margin:6px 0 10px;color:#555">Escreva com as suas palavras, página por página se puder.</p><input id="pvName" placeholder="Seu nome (opcional)" style="width:100%;box-sizing:border-box;padding:9px;border:1px solid #ccc;border-radius:8px;margin-bottom:8px;font:inherit"><textarea id="pvTxt" rows="5" style="width:100%;box-sizing:border-box;padding:9px;border:1px solid #ccc;border-radius:8px;font:inherit" placeholder="Ex.: Na página Sobre, trocar a foto e aumentar o texto."></textarea><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px"><button id="pvCancel" style="background:#eee;border:0;border-radius:8px;padding:9px 14px;font:600 14px system-ui;cursor:pointer">Voltar</button><button id="pvSend" style="background:#d9480f;color:#fff;border:0;border-radius:8px;padding:9px 14px;font:600 14px system-ui;cursor:pointer">Enviar</button></div></div></div>'
    . '<script>(function(){var T=' . json_encode($t) . ',A=' . json_encode($api) . ',S=' . json_encode($st) . ',$=function(i){return document.getElementById(i)};function show(s){$("pvMsg").innerHTML=s==="approved"?"<b>Site aprovado.</b> Obrigado! A agência já foi avisada.":s==="changes"?"<b>Pedido de ajustes enviado.</b> A agência vai atualizar e mandar o mesmo link de novo.":"<b>Prévia para aprovação.</b> Navegue pelo site todo e, no fim, diga o que achou."}show(S);'
    . 'function send(d,c,n){fetch(A,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"decision",t:T,decision:d,comment:c||"",name:n||""})}).then(function(r){return r.json()}).then(function(j){if(!j.ok)throw new Error(j.error||"erro");show(d);$("pvBox").style.display="none"}).catch(function(e){alert("Não foi possível enviar: "+e.message)})}'
    . '$("pvOk").onclick=function(){if(confirm("Aprovar o site como está?"))send("approved","",$("pvName").value)};$("pvCh").onclick=function(){$("pvBox").style.display="grid"};$("pvCancel").onclick=function(){$("pvBox").style.display="none"};$("pvSend").onclick=function(){send("changes",$("pvTxt").value,$("pvName").value)};})();</script><div style="height:64px"></div>';
$pos = strripos($html, '</body>'); $html = $pos !== false ? substr($html, 0, $pos) . $bar . substr($html, $pos) : $html . $bar;
echo $html;
