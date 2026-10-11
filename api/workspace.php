<?php
require __DIR__ . '/_lib.php';
require_auth();
require_json_write();
$file = data_dir() . '/workspace.json'; $acct = null;
/* plataforma: cada cliente tem o próprio espaço de trabalho; o dono (senha do Studio) usa o geral */
if (platform_on()) { start_session(); if (empty($_SESSION['ok'])) { $acct = current_account(); if (!$acct) fail('Não autenticado', 401); $file = user_dir($acct['id']) . '/workspace.json'; } }
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (!is_file($file)) json_out(['ok' => true, 'rev' => 0, 'state' => null]);
    $d = json_decode((string) file_get_contents($file), true);
    json_out(['ok' => true, 'rev' => (int) ($d['rev'] ?? 0), 'state' => $d['state'] ?? null]);
}
if ($method !== 'PUT') fail('Método não permitido', 405);

$b = body_json(12_000_000);
if (!isset($b['state']) || !is_array($b['state']) || !isset($b['state']['projects']) || !is_array($b['state']['projects'])) fail('Estado inválido', 422);
if ($acct) { $pl = plan_by_id((string) $acct['plan']); $n = count($b['state']['projects']); if ($pl && $pl['sites'] !== null && $n > $pl['sites']) fail("Seu plano {$pl['name']} permite até {$pl['sites']} sites e você tem $n. Apague alguns ou mude de plano.", 403, ['limit' => $pl['sites'], 'count' => $n]); }
$fh = fopen($file, 'c+'); if (!$fh) fail('Não foi possível gravar no servidor', 500);
flock($fh, LOCK_EX);
$cur = json_decode((string) stream_get_contents($fh), true) ?: ['rev' => 0];
$curRev = (int) ($cur['rev'] ?? 0);
if ($curRev !== (int) ($b['baseRev'] ?? 0)) { flock($fh, LOCK_UN); fclose($fh); fail('Versão desatualizada', 409, ['rev' => $curRev]); }
if (is_file($file) && $curRev > 0) @copy($file, dirname($file) . '/workspace.prev.json');
$rev = $curRev + 1;
$out = json_encode(['rev' => $rev, 'updatedAt' => time(), 'state' => $b['state']], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
ftruncate($fh, 0); rewind($fh); fwrite($fh, $out); fflush($fh); flock($fh, LOCK_UN); fclose($fh);
json_out(['ok' => true, 'rev' => $rev]);
