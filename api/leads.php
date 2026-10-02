<?php
require __DIR__ . '/_lib.php';
$store = data_dir() . '/leads.jsonl';
$method = $_SERVER['REQUEST_METHOD'];

/* CORS apenas para a captura (formulários em outros domínios) */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, X-Leads-Token');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
if ($method === 'OPTIONS') { http_response_code(204); exit; }

/* Verificação do webhook do WhatsApp Cloud (Meta) */
if ($method === 'GET' && ($_GET['hub_mode'] ?? $_GET['hub.mode'] ?? '') === 'subscribe') {
    $t = (string) cfg('WHATSAPP_VERIFY_TOKEN', '');
    $given = (string) ($_GET['hub_verify_token'] ?? $_GET['hub.verify_token'] ?? '');
    if ($t !== '' && hash_equals($t, $given)) { header('Content-Type: text/plain'); echo (string) ($_GET['hub_challenge'] ?? $_GET['hub.challenge'] ?? ''); exit; }
    http_response_code(403); exit;
}

/* Listagem (somente logado) */
if ($method === 'GET') {
    require_auth();
    $project = (string) ($_GET['project'] ?? '');
    $leads = [];
    if (is_file($store)) foreach (file($store, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $l = json_decode($line, true);
        if (is_array($l) && ($project === '' || ($l['project'] ?? '') === $project)) $leads[] = $l;
    }
    $leads = array_slice(array_reverse($leads), 0, 500);
    json_out(['ok' => true, 'leads' => $leads]);
}
if ($method !== 'POST') fail('Método não permitido', 405);

/* Captura */
$raw = file_get_contents('php://input');
if (strlen((string) $raw) > 64000) fail('Corpo grande demais', 413);
$ct = $_SERVER['CONTENT_TYPE'] ?? '';
$data = stripos($ct, 'application/json') === 0 ? (json_decode((string) $raw, true) ?: []) : $_POST;
if (!is_array($data)) fail('Dados inválidos', 400);

$isMeta = isset($data['entry']) && is_array($data['entry']);
if ($isMeta) {
    $secret = (string) cfg('META_APP_SECRET', '');
    if ($secret === '') fail('META_APP_SECRET não configurado', 503);
    $sig = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';
    if (!hash_equals('sha256=' . hash_hmac('sha256', (string) $raw, $secret), $sig)) fail('Assinatura inválida', 403);
} else {
    $token = (string) cfg('LEADS_TOKEN', '');
    $given = (string) ($_GET['token'] ?? $_SERVER['HTTP_X_LEADS_TOKEN'] ?? '');
    if ($token === '' || !hash_equals($token, $given)) fail('Token inválido', 403);
    if (!rate_limit('lead:' . client_ip(), 30, 600)) fail('Muitas requisições', 429);
    if (!empty($data['website'])) json_out(['ok' => true]); // honeypot: bots preenchem
}
$project = preg_replace('/[^\w-]/', '', (string) ($_GET['project'] ?? $data['project'] ?? ''));
$clip = fn($v, $n = 300) => mb_substr(trim(strip_tags((string) $v)), 0, $n);
$leads = [];
if ($isMeta) {
    foreach ($data['entry'] as $e) foreach (($e['changes'] ?? []) as $c) {
        $v = $c['value'] ?? [];
        $names = []; foreach (($v['contacts'] ?? []) as $ct1) $names[$ct1['wa_id'] ?? ''] = $ct1['profile']['name'] ?? '';
        foreach (($v['messages'] ?? []) as $m) {
            $from = (string) ($m['from'] ?? '');
            $leads[] = ['source' => 'whatsapp', 'name' => $clip($names[$from] ?? ''), 'email' => '', 'phone' => $clip($from, 30), 'message' => $clip($m['text']['body'] ?? ('[' . ($m['type'] ?? 'mensagem') . ']'), 1000)];
        }
    }
} else {
    $utm = []; foreach ($data as $k => $v) if (strpos((string) $k, 'utm_') === 0 && is_scalar($v)) $utm[$k] = $clip($v, 120);
    $leads[] = ['source' => $clip($data['source'] ?? 'site', 60), 'name' => $clip($data['name'] ?? $data['nome'] ?? ''), 'email' => $clip($data['email'] ?? '', 200), 'phone' => $clip($data['phone'] ?? $data['telefone'] ?? $data['whatsapp'] ?? '', 40), 'message' => $clip($data['message'] ?? $data['mensagem'] ?? '', 1000), 'utm' => $utm];
}
$fh = fopen($store, 'a'); if (!$fh) fail('Não foi possível gravar', 500);
flock($fh, LOCK_EX);
foreach ($leads as $l) fwrite($fh, json_encode(['id' => bin2hex(random_bytes(6)), 'at' => date('c'), 'project' => $project] + $l, JSON_UNESCAPED_UNICODE) . "\n");
flock($fh, LOCK_UN); fclose($fh);
json_out(['ok' => true, 'received' => count($leads)]);
