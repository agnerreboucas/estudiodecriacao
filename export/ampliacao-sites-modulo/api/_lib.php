<?php
declare(strict_types=1);
/* Biblioteca comum da API do Ampliação Studio. Chaves ficam em config.php (nunca no navegador). */
$GLOBALS['CFG'] = is_file(__DIR__ . '/config.php') ? (require __DIR__ . '/config.php') : [];
/* Chaves salvas pelo app (Configurações → Integrações) ficam em <DATA_DIR>/keys.json, fora do alcance da web (.htaccess). config.php sempre vence. */
const APP_KEYS = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'ELEVENLABS_API_KEY', 'MAGNIFIC_API_KEY', 'HIGGSFIELD_API_KEY', 'AI_PROVIDER', 'WHATSAPP_TOKEN', 'WHATSAPP_PHONE_ID', 'META_APP_ID', 'META_APP_SECRET', 'META_PAGE_ID', 'META_PAGE_TOKEN', 'META_IG_USER_ID', 'META_CRON_KEY'];
function keys_file(): string { return rtrim((string) ($GLOBALS['CFG']['DATA_DIR'] ?? __DIR__ . '/data'), '/') . '/keys.json'; }
(function () { $f = keys_file(); if (!is_file($f)) return; $j = json_decode((string) @file_get_contents($f), true); if (!is_array($j)) return;
    foreach (APP_KEYS as $k) if (isset($j[$k]) && is_string($j[$k]) && $j[$k] !== '' && (($GLOBALS['CFG'][$k] ?? '') === '')) $GLOBALS['CFG'][$k] = $j[$k]; })();
/* Senha do Studio criada pelo app no primeiro acesso: <DATA_DIR>/admin.json (só o hash). config.php sempre vence. */
function admin_file(): string { return rtrim((string) ($GLOBALS['CFG']['DATA_DIR'] ?? __DIR__ . '/data'), '/') . '/admin.json'; }
(function () { if (((string) ($GLOBALS['CFG']['ADMIN_PASSWORD_HASH'] ?? '')) !== '' || ((string) ($GLOBALS['CFG']['ADMIN_PASSWORD'] ?? '')) !== '') return; $f = admin_file(); if (!is_file($f)) return; $j = json_decode((string) @file_get_contents($f), true);
    if (is_array($j) && isset($j['hash']) && is_string($j['hash']) && $j['hash'] !== '') $GLOBALS['CFG']['ADMIN_PASSWORD_HASH'] = $j['hash']; })();
function cfg(string $k, $d = null) { $v = $GLOBALS['CFG'][$k] ?? null; return ($v === null || $v === '') ? $d : $v; }

function json_out($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function fail(string $msg, int $code = 400, array $extra = []): void { json_out(['ok' => false, 'error' => $msg] + $extra, $code); }

function body_json(int $max = 8_000_000): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') return [];
    if (strlen($raw) > $max) fail('Corpo da requisição grande demais', 413);
    $j = json_decode($raw, true);
    if (!is_array($j)) fail('JSON inválido', 400);
    return $j;
}
/* Exige Content-Type JSON em escritas: obriga preflight CORS e barra formulários de outros sites */
function require_json_write(): void {
    $m = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (in_array($m, ['POST', 'PUT', 'DELETE'], true) && stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) fail('Content-Type deve ser application/json', 415);
}

function data_dir(): string {
    $d = (string) cfg('DATA_DIR', __DIR__ . '/data');
    if (!is_dir($d)) @mkdir($d, 0750, true);
    if (!is_file($d . '/.htaccess')) @file_put_contents($d . '/.htaccess', "Require all denied\nDeny from all\n");
    return rtrim($d, '/');
}
/* ---------- plataforma (vários clientes, planos mensais) ----------
   Ligada por 'PLATFORM_MODE' => true no config.php. Desligada, tudo funciona como antes (uma senha do Studio). Ligada: cada cliente tem conta (e-mail e senha),
   plano, situação (pendente, ativa, atrasada, suspensa, cancelada) e o próprio espaço de trabalho. O dono entra com a senha do Studio (sessão 'ok') e vê todos. */
function platform_on(): bool { return (bool) cfg('PLATFORM_MODE', false); }
function plans_def(): array {
    $d = [['id' => 'inicial', 'name' => 'Inicial', 'price' => 190, 'sites' => 10], ['id' => 'profissional', 'name' => 'Profissional', 'price' => 250, 'sites' => 25], ['id' => 'ilimitado', 'name' => 'Ilimitado', 'price' => 390, 'sites' => null]];
    $c = cfg('PLANS'); if (is_array($c) && $c) { $o = []; foreach ($c as $x) { if (!is_array($x) || !preg_match('/^[a-z0-9_-]{2,20}$/', (string) ($x['id'] ?? ''))) continue; $o[] = ['id' => $x['id'], 'name' => substr((string) ($x['name'] ?? $x['id']), 0, 30), 'price' => (float) ($x['price'] ?? 0), 'sites' => isset($x['sites']) && $x['sites'] !== null ? max(1, (int) $x['sites']) : null]; } if ($o) return $o; }
    return $d;
}
function plan_by_id(string $id): ?array { foreach (plans_def() as $p) if ($p['id'] === $id) return $p; return null; }
function accounts_file(): string { return data_dir() . '/accounts.json'; }
function accounts_all(): array { $f = accounts_file(); if (!is_file($f)) return []; $j = json_decode((string) @file_get_contents($f), true); return is_array($j) ? $j : []; }
/* ler, alterar e gravar sob trava (dois cadastros ao mesmo tempo não se atropelam) */
function accounts_mutate(callable $fn) {
    $f = accounts_file(); $fh = fopen($f, 'c+'); if (!$fh) fail('Não consegui gravar no servidor (permissão da pasta api/data).', 500);
    flock($fh, LOCK_EX); $a = json_decode((string) stream_get_contents($fh), true); if (!is_array($a)) $a = [];
    $r = $fn($a); ftruncate($fh, 0); rewind($fh); fwrite($fh, json_encode($a, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)); fflush($fh); flock($fh, LOCK_UN); fclose($fh); @chmod($f, 0640); return $r;
}
function account_find(array $all, string $by, string $val): ?array { foreach ($all as $a) if (($a[$by] ?? '') === $val) return $a; return null; }
/* situação de verdade: 'ativa' só enquanto o pagamento cobre o dia de hoje (mais os dias de tolerância) */
function account_state(array $a): string {
    $st = (string) ($a['status'] ?? 'pendente'); if ($st !== 'ativa') return $st;
    $until = (int) ($a['paidUntil'] ?? 0); if ($until === 0) return 'ativa'; if (!empty($a['courtesy'])) return 'ativa';
    return time() <= $until + 86400 * (int) cfg('BILLING_GRACE_DAYS', 3) ? 'ativa' : 'atrasada';
}
function current_account(): ?array {
    if (!platform_on()) return null; start_session(); $id = (string) ($_SESSION['uid'] ?? ''); if ($id === '') return null;
    $a = account_find(accounts_all(), 'id', $id); if (!$a) { unset($_SESSION['uid']); return null; } $a['state'] = account_state($a); return $a;
}
function user_dir(string $uid): string { $d = data_dir() . '/users/' . preg_replace('/[^a-f0-9]/', '', $uid); if (!is_dir($d)) @mkdir($d, 0750, true); return $d; }
function admin_defined(): bool { return (string) cfg('ADMIN_PASSWORD_HASH', '') !== '' || (string) cfg('ADMIN_PASSWORD', '') !== ''; }
function auth_required(): bool { return platform_on() || (string) cfg('ADMIN_PASSWORD_HASH', '') !== '' || (string) cfg('ADMIN_PASSWORD', '') !== ''; }
function start_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    session_name('amplia_studio');
    session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'httponly' => true, 'samesite' => 'Strict', 'secure' => !empty($_SERVER['HTTPS'])]);
    session_start();
}
function logged_in(): bool {
    if (!auth_required()) return true; start_session(); if (!empty($_SESSION['ok'])) return true;
    if (platform_on()) { $a = current_account(); return $a !== null && $a['state'] === 'ativa'; } return false;
}
/* dono da plataforma (senha do Studio) */
function is_owner(): bool { if (!auth_required()) return !platform_on(); start_session(); return !empty($_SESSION['ok']); }
function require_owner(): void { if (!is_owner()) fail('Só o dono da plataforma acessa isto.', 403); }
function require_auth(): void { if (!logged_in()) fail('Não autenticado', 401); }

/* Limitador simples por chave (arquivo + flock): n eventos por janela */
function rate_limit(string $key, int $max, int $windowSec): bool {
    $f = data_dir() . '/rl_' . md5($key) . '.json';
    $fh = fopen($f, 'c+'); if (!$fh) return true;
    flock($fh, LOCK_EX);
    $arr = json_decode((string) stream_get_contents($fh), true) ?: [];
    $now = time(); $arr = array_values(array_filter($arr, fn($t) => $t > $now - $windowSec));
    $ok = count($arr) < $max; if ($ok) $arr[] = $now;
    ftruncate($fh, 0); rewind($fh); fwrite($fh, json_encode($arr)); flock($fh, LOCK_UN); fclose($fh);
    return $ok;
}
function client_ip(): string { return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'; }

/* HTTP para APIs externas via cURL */
function http_json(string $url, array $headers, ?array $body = null, int $timeout = 90): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => $timeout, CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_HTTPHEADER => $headers, CURLOPT_FOLLOWLOCATION => false]);
    if ($body !== null) { curl_setopt($ch, CURLOPT_POST, true); curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body, JSON_UNESCAPED_UNICODE)); }
    $res = curl_exec($ch); $err = curl_error($ch); $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    if ($res === false) return [0, null, $err ?: 'falha de rede'];
    return [$code, json_decode((string) $res, true), (string) $res];
}
