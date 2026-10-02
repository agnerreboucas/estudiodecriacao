<?php
require __DIR__ . '/_lib.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Use POST', 405);
require_json_write();
$b = body_json();
start_session();
if (($b['action'] ?? '') === 'logout') { $_SESSION = []; session_destroy(); json_out(['ok' => true]); }
if (!auth_required()) json_out(['ok' => true]);
if (!rate_limit('login:' . client_ip(), 8, 900)) fail('Muitas tentativas. Aguarde 15 minutos.', 429);
$pw = (string) ($b['password'] ?? '');
$hash = (string) cfg('ADMIN_PASSWORD_HASH', '');
$ok = $hash !== '' ? password_verify($pw, $hash) : hash_equals((string) cfg('ADMIN_PASSWORD', ''), $pw);
if (!$ok) { usleep(600000); fail('Senha incorreta', 401); }
session_regenerate_id(true);
$_SESSION['ok'] = true;
json_out(['ok' => true]);
