<?php
require __DIR__ . '/_lib.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Use POST', 405);
require_json_write();
$b = body_json();
start_session();
if (($b['action'] ?? '') === 'logout') { $_SESSION = []; session_destroy(); json_out(['ok' => true]); }
if (($b['action'] ?? '') === 'setup') {   // primeiro acesso: cria a senha do Studio (só enquanto não existir senha)
    if (auth_required()) fail('A senha do Studio já foi definida. Entre com ela.', 409);
    if (!rate_limit('setup:' . client_ip(), 6, 3600)) fail('Muitas tentativas. Aguarde.', 429);
    $code = (string) cfg('SETUP_CODE', ''); if ($code !== '' && !hash_equals($code, (string) ($b['code'] ?? ''))) fail('Código de instalação incorreto.', 403);
    $pw = (string) ($b['password'] ?? ''); if (strlen($pw) < 8 || strlen($pw) > 200) fail('Use uma senha com pelo menos 8 caracteres.', 422);
    data_dir(); $f = admin_file(); $tmp = $f . '.tmp';
    if (@file_put_contents($tmp, json_encode(['hash' => password_hash($pw, PASSWORD_DEFAULT)]), LOCK_EX) === false) fail('Não consegui gravar no servidor (permissão da pasta api/data).', 500);
    @chmod($tmp, 0640); if (!@rename($tmp, $f)) fail('Não consegui gravar no servidor.', 500);
    session_regenerate_id(true); $_SESSION['ok'] = true; json_out(['ok' => true]);
}
if (!auth_required()) json_out(['ok' => true]);
if (!rate_limit('login:' . client_ip(), 8, 900)) fail('Muitas tentativas. Aguarde 15 minutos.', 429);
$pw = (string) ($b['password'] ?? '');
$hash = (string) cfg('ADMIN_PASSWORD_HASH', '');
$ok = $hash !== '' ? password_verify($pw, $hash) : hash_equals((string) cfg('ADMIN_PASSWORD', ''), $pw);
if (!$ok) { usleep(600000); fail('Senha incorreta', 401); }
session_regenerate_id(true);
$_SESSION['ok'] = true;
json_out(['ok' => true]);
