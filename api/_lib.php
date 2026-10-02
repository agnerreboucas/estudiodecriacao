<?php
declare(strict_types=1);
/* Biblioteca comum da API do Ampliação Studio. Chaves ficam em config.php (nunca no navegador). */
$GLOBALS['CFG'] = is_file(__DIR__ . '/config.php') ? (require __DIR__ . '/config.php') : [];
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
function auth_required(): bool { return (string) cfg('ADMIN_PASSWORD_HASH', '') !== '' || (string) cfg('ADMIN_PASSWORD', '') !== ''; }
function start_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    session_name('amplia_studio');
    session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'httponly' => true, 'samesite' => 'Strict', 'secure' => !empty($_SERVER['HTTPS'])]);
    session_start();
}
function logged_in(): bool { if (!auth_required()) return true; start_session(); return !empty($_SESSION['ok']); }
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
