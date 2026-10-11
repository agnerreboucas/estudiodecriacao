<?php
/* Contas dos clientes da plataforma (precisa de 'PLATFORM_MODE' => true no config.php).
   Público: GET ?action=plans · POST {action:'signup'|'login'} · GET ?action=me.  Cliente logado: POST {action:'logout'|'password'|'plan'}.
   O cliente só entra no sistema com a conta ATIVA (pagamento em dia). Pendente ou atrasada: vê só a tela da conta, com o link de pagamento. */
require __DIR__ . '/_lib.php';
header('X-Robots-Tag: noindex');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if (!platform_on()) fail('A plataforma não está ligada (PLATFORM_MODE no config.php).', 404);

function pay_url(string $plan): string { $m = cfg('PAY_LINKS'); $u = is_array($m) ? (string) ($m[$plan] ?? '') : ''; return preg_match('#^https://[^\s"\'<>]{4,500}$#i', $u) ? $u : ''; }
function site_count(string $uid): int { $f = user_dir($uid) . '/workspace.json'; if (!is_file($f)) return 0; $d = json_decode((string) @file_get_contents($f), true); return is_array($d['state']['projects'] ?? null) ? count($d['state']['projects']) : 0; }
function acct_public(array $a): array {
    $p = plan_by_id((string) $a['plan']) ?: ['id' => $a['plan'], 'name' => $a['plan'], 'price' => 0, 'sites' => null]; $want = !empty($a['wantPlan']) ? plan_by_id((string) $a['wantPlan']) : null; $pay = pay_url($want ? $want['id'] : $p['id']);
    return ['id' => $a['id'], 'name' => $a['name'], 'email' => $a['email'], 'plan' => $p['id'], 'planName' => $p['name'], 'price' => $p['price'], 'sitesLimit' => $p['sites'], 'sites' => site_count($a['id']),
        'state' => account_state($a), 'paidUntil' => (int) ($a['paidUntil'] ?? 0), 'wantPlan' => $want ? $want['id'] : '', 'wantPlanName' => $want ? $want['name'] : '', 'wantPrice' => $want ? $want['price'] : null, 'courtesy' => !empty($a['courtesy']), 'payUrl' => $pay, 'createdAt' => (int) ($a['createdAt'] ?? 0)];
}
function email_ok($e): string { $e = strtolower(trim((string) $e)); return (filter_var($e, FILTER_VALIDATE_EMAIL) && strlen($e) <= 150) ? $e : ''; }

if ($method === 'GET') {
    $act = (string) ($_GET['action'] ?? 'me');
    if ($act === 'plans') json_out(['ok' => true, 'plans' => plans_def(), 'trialDays' => (int) cfg('TRIAL_DAYS', 0)]);
    if ($act === 'me') { start_session(); $a = current_account(); json_out(['ok' => true, 'account' => $a ? acct_public($a) : null, 'owner' => is_owner() && !empty($_SESSION['ok'])]); }
    fail('Ação desconhecida');
}
if ($method !== 'POST') fail('Método não permitido', 405);
require_json_write(); $b = body_json(); $act = (string) ($b['action'] ?? ''); start_session();

if ($act === 'signup') {
    if (!rate_limit('signup:' . client_ip(), 5, 3600)) fail('Muitos cadastros deste endereço. Tente mais tarde.', 429);
    $name = trim((string) ($b['name'] ?? '')); $email = email_ok($b['email'] ?? ''); $pw = (string) ($b['password'] ?? ''); $plan = plan_by_id((string) ($b['plan'] ?? ''));
    if (mb_strlen($name) < 2 || mb_strlen($name) > 80) fail('Escreva o seu nome.', 422); if ($email === '') fail('E-mail inválido.', 422); if (strlen($pw) < 8 || strlen($pw) > 200) fail('Use uma senha com pelo menos 8 caracteres.', 422);
    if (!$plan) fail('Escolha um plano.', 422); if (empty($b['accept'])) fail('É preciso aceitar os termos de uso e a política de privacidade.', 422);
    $trial = (int) cfg('TRIAL_DAYS', 0); $now = time(); $id = bin2hex(random_bytes(8));
    $res = accounts_mutate(function (array &$all) use ($name, $email, $pw, $plan, $trial, $now, $id) {
        if (account_find($all, 'email', $email)) return 'dup';
        $all[] = ['id' => $id, 'name' => mb_substr($name, 0, 80), 'email' => $email, 'passHash' => password_hash($pw, PASSWORD_DEFAULT), 'plan' => $plan['id'], 'status' => $trial > 0 ? 'ativa' : 'pendente', 'paidUntil' => $trial > 0 ? $now + $trial * 86400 : 0, 'createdAt' => $now, 'lastLogin' => $now, 'notes' => '', 'trial' => $trial > 0];
        return 'ok';
    });
    if ($res === 'dup') fail('Já existe uma conta com este e-mail. Entre com a sua senha.', 409);
    session_regenerate_id(true); $_SESSION['uid'] = $id; $a = account_find(accounts_all(), 'id', $id); json_out(['ok' => true, 'account' => acct_public($a)]);
}
if ($act === 'login') {
    $email = email_ok($b['email'] ?? ''); $pw = (string) ($b['password'] ?? '');
    if (!rate_limit('clogin:' . client_ip(), 12, 900) || ($email !== '' && !rate_limit('clogin:' . $email, 8, 900))) fail('Muitas tentativas. Aguarde 15 minutos.', 429);
    $a = $email !== '' ? account_find(accounts_all(), 'email', $email) : null;
    if (!$a || !password_verify($pw, (string) $a['passHash'])) { usleep(600000); fail('E-mail ou senha incorretos.', 401); }
    session_regenerate_id(true); $_SESSION['uid'] = $a['id']; accounts_mutate(function (array &$all) use ($a) { foreach ($all as &$x) if ($x['id'] === $a['id']) $x['lastLogin'] = time(); });
    json_out(['ok' => true, 'account' => acct_public($a)]);
}
if ($act === 'logout') { unset($_SESSION['uid']); json_out(['ok' => true]); }
$me = current_account(); if (!$me) fail('Entre na sua conta.', 401);
if ($act === 'password') {
    $old = (string) ($b['old'] ?? ''); $new = (string) ($b['new'] ?? ''); if (!password_verify($old, (string) $me['passHash'])) fail('A senha atual está incorreta.', 403); if (strlen($new) < 8 || strlen($new) > 200) fail('A nova senha precisa de pelo menos 8 caracteres.', 422);
    accounts_mutate(function (array &$all) use ($me, $new) { foreach ($all as &$x) if ($x['id'] === $me['id']) $x['passHash'] = password_hash($new, PASSWORD_DEFAULT); }); json_out(['ok' => true]);
}
if ($act === 'plan') {   // pedir troca de plano: vale depois do pagamento do novo plano; não deixa descer abaixo do que o cliente já usa
    $np = plan_by_id((string) ($b['plan'] ?? '')); if (!$np) fail('Plano desconhecido.', 422); $n = site_count($me['id']);
    if ($np['sites'] !== null && $n > $np['sites']) fail("Você tem $n sites. O plano {$np['name']} permite até {$np['sites']}. Apague alguns antes de descer.", 409);
    accounts_mutate(function (array &$all) use ($me, $np) { foreach ($all as &$x) if ($x['id'] === $me['id']) $x['wantPlan'] = $np['id'] === $x['plan'] ? '' : $np['id']; });
    $a = account_find(accounts_all(), 'id', $me['id']); json_out(['ok' => true, 'account' => acct_public($a)]);
}
fail('Ação desconhecida');
