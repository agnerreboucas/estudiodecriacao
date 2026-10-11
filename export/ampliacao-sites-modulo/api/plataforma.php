<?php
/* Painel do dono: lista de clientes, planos, situação e receita mensal. Exige a sessão do dono (senha do Studio).
   GET ?action=clientes · POST {action:'set', id, plan?, status?, addDays?, courtesy?, notes?} · {action:'resetpw', id, password} · {action:'delete', id} */
require __DIR__ . '/_lib.php';
header('X-Robots-Tag: noindex');
if (!platform_on()) fail('A plataforma não está ligada.', 404);
start_session(); require_owner();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
function site_count_of(string $uid): int { $f = user_dir($uid) . '/workspace.json'; if (!is_file($f)) return 0; $d = json_decode((string) @file_get_contents($f), true); return is_array($d['state']['projects'] ?? null) ? count($d['state']['projects']) : 0; }
if ($method === 'GET') {
    $all = accounts_all(); $rows = []; $mrr = 0; $cnt = ['ativa' => 0, 'pendente' => 0, 'atrasada' => 0, 'suspensa' => 0, 'cancelada' => 0];
    foreach ($all as $a) { $st = account_state($a); $p = plan_by_id((string) $a['plan']); $cnt[$st] = ($cnt[$st] ?? 0) + 1; if ($st === 'ativa' && empty($a['courtesy']) && $p) $mrr += $p['price'];
        $rows[] = ['id' => $a['id'], 'name' => $a['name'], 'email' => $a['email'], 'plan' => $a['plan'], 'planName' => $p ? $p['name'] : $a['plan'], 'state' => $st, 'status' => $a['status'], 'paidUntil' => (int) ($a['paidUntil'] ?? 0), 'createdAt' => (int) ($a['createdAt'] ?? 0), 'lastLogin' => (int) ($a['lastLogin'] ?? 0), 'sites' => site_count_of($a['id']), 'sitesLimit' => $p ? $p['sites'] : null, 'notes' => (string) ($a['notes'] ?? ''), 'courtesy' => !empty($a['courtesy']), 'wantPlan' => (string) ($a['wantPlan'] ?? '')]; }
    usort($rows, fn($x, $y) => $y['createdAt'] <=> $x['createdAt']);
    json_out(['ok' => true, 'clientes' => $rows, 'resumo' => ['total' => count($all), 'porSituacao' => $cnt, 'mrr' => $mrr], 'plans' => plans_def()]);
}
if ($method !== 'POST') fail('Método não permitido', 405);
require_json_write(); $b = body_json(); $act = (string) ($b['action'] ?? ''); $id = preg_replace('/[^a-f0-9]/', '', (string) ($b['id'] ?? ''));
if ($id === '') fail('Cliente inválido.', 422);
if ($act === 'set') {
    $r = accounts_mutate(function (array &$all) use ($b, $id) {
        foreach ($all as &$x) { if ($x['id'] !== $id) continue;
            if (isset($b['plan']) && plan_by_id((string) $b['plan'])) { $x['plan'] = (string) $b['plan']; $x['wantPlan'] = ''; }
            if (isset($b['status']) && in_array($b['status'], ['pendente', 'ativa', 'suspensa', 'cancelada'], true)) { $x['status'] = $b['status']; if ($b['status'] === 'ativa' && (int) ($x['paidUntil'] ?? 0) < time() && empty($x['courtesy'])) $x['paidUntil'] = time() + 30 * 86400; }
            if (isset($b['addDays'])) { $d = max(-3650, min(3650, (int) $b['addDays'])); $x['paidUntil'] = max(time(), (int) ($x['paidUntil'] ?? 0)) + $d * 86400; $x['status'] = 'ativa'; }
            if (isset($b['courtesy'])) $x['courtesy'] = (bool) $b['courtesy'];
            if (isset($b['notes'])) $x['notes'] = mb_substr((string) $b['notes'], 0, 500);
            return 'ok'; } return 'nf'; });
    if ($r === 'nf') fail('Cliente não encontrado.', 404); json_out(['ok' => true]);
}
if ($act === 'resetpw') { $pw = (string) ($b['password'] ?? ''); if (strlen($pw) < 8) fail('A senha precisa de pelo menos 8 caracteres.', 422); $r = accounts_mutate(function (array &$all) use ($id, $pw) { foreach ($all as &$x) if ($x['id'] === $id) { $x['passHash'] = password_hash($pw, PASSWORD_DEFAULT); return 'ok'; } return 'nf'; }); if ($r === 'nf') fail('Cliente não encontrado.', 404); json_out(['ok' => true]); }
if ($act === 'delete') { accounts_mutate(function (array &$all) use ($id) { $all = array_values(array_filter($all, fn($x) => $x['id'] !== $id)); }); json_out(['ok' => true]); }
fail('Ação desconhecida');
