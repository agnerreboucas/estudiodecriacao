<?php
/* Contadores das landing pages exportadas: visitas, cliques no botão e leads por página/variação (teste A/B).
   POST (público, sem cookies, só soma números): {e: "view"|"cta"|"lead", lp: "<id da landing>"}
   GET ?action=stats&ids=a,b,c (somente logado): totais e últimos 30 dias de cada id.
   Guarda só contagens (nenhum dado pessoal) em <DATA_DIR>/lp_stats.json. */
require __DIR__ . '/_lib.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'OPTIONS') { http_response_code(204); exit; }
$file = data_dir() . '/lp_stats.json';

if ($method === 'GET') {
    require_auth();
    if (($_GET['action'] ?? '') !== 'stats') fail('action inválida', 422);
    $ids = array_values(array_filter(array_map('trim', explode(',', (string) ($_GET['ids'] ?? ''))), fn($i) => preg_match('/^[\w-]{1,60}$/', $i)));
    $all = is_file($file) ? (json_decode((string) @file_get_contents($file), true) ?: []) : [];
    $out = []; $since = date('Y-m-d', time() - 30 * 86400);
    foreach (array_slice($ids, 0, 100) as $id) {
        $s = $all[$id] ?? ['view' => 0, 'cta' => 0, 'lead' => 0, 'days' => []];
        $d30 = ['view' => 0, 'cta' => 0, 'lead' => 0];
        foreach (($s['days'] ?? []) as $day => $c) if ($day >= $since) foreach ($d30 as $k => $_) $d30[$k] += (int) ($c[$k] ?? 0);
        $out[$id] = ['view' => (int) ($s['view'] ?? 0), 'cta' => (int) ($s['cta'] ?? 0), 'lead' => (int) ($s['lead'] ?? 0), 'd30' => $d30];
    }
    json_out(['ok' => true, 'stats' => $out]);
}
if ($method !== 'POST') fail('Método não permitido', 405);
$raw = (string) file_get_contents('php://input');
if (strlen($raw) > 2000) fail('Corpo grande demais', 413);
$b = json_decode($raw, true);
if (!is_array($b)) fail('Dados inválidos', 400);
$e = (string) ($b['e'] ?? ''); $lp = (string) ($b['lp'] ?? '');
if (!in_array($e, ['view', 'cta', 'lead'], true) || !preg_match('/^[\w-]{1,60}$/', $lp)) fail('Dados inválidos', 422);
if (!rate_limit('lp:' . $e . ':' . client_ip() . ':' . $lp, $e === 'view' ? 40 : 15, 600)) json_out(['ok' => true]);   // excesso é ignorado em silêncio
$fh = fopen($file, 'c+'); if (!$fh) fail('Não foi possível gravar', 500);
flock($fh, LOCK_EX);
$all = json_decode((string) stream_get_contents($fh), true) ?: [];
if (count($all) > 2000 && !isset($all[$lp])) { flock($fh, LOCK_UN); fclose($fh); fail('Limite de páginas atingido', 429); }
$s = $all[$lp] ?? ['view' => 0, 'cta' => 0, 'lead' => 0, 'days' => []];
$s[$e] = (int) ($s[$e] ?? 0) + 1; $day = date('Y-m-d'); $s['days'][$day][$e] = (int) ($s['days'][$day][$e] ?? 0) + 1;
krsort($s['days']); $s['days'] = array_slice($s['days'], 0, 90, true);
$all[$lp] = $s;
ftruncate($fh, 0); rewind($fh); fwrite($fh, json_encode($all)); fflush($fh); flock($fh, LOCK_UN); fclose($fh);
json_out(['ok' => true]);
