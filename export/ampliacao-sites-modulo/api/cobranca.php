<?php
/* Aviso de pagamento (webhook): o meio de pagamento (Mercado Pago, Asaas, Stripe, Pix recorrente…) ou um automatizador (Make, Zapier, n8n) chama este endereço
   para ativar, renovar ou cortar a conta do cliente. Formato único, simples:
     POST /api/cobranca.php   cabeçalho  X-Webhook-Secret: <BILLING_WEBHOOK_SECRET do config.php>
     {"event":"paid","email":"cliente@exemplo.com","plan":"profissional","days":30}
   event: paid (pagou: ativa e soma os dias, padrão 30) · late (atrasou) · canceled (cancelou) · refunded (estornou: suspende). Identifique o cliente por "email" ou "id".
   O "plan" é opcional: sem ele vale o plano que o cliente pediu na conta (ou o atual). Não há adaptação pronta para um gateway específico. */
require __DIR__ . '/_lib.php';
header('X-Robots-Tag: noindex');
if (!platform_on()) fail('A plataforma não está ligada.', 404);
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Use POST', 405);
$secret = (string) cfg('BILLING_WEBHOOK_SECRET', ''); if (strlen($secret) < 16) fail('Defina BILLING_WEBHOOK_SECRET (16+ caracteres) no config.php.', 503);
$given = (string) ($_SERVER['HTTP_X_WEBHOOK_SECRET'] ?? ($_GET['secret'] ?? '')); if (!hash_equals($secret, $given)) { usleep(400000); fail('Segredo incorreto.', 403); }
require_json_write(); $b = body_json(1_000_000); $ev = (string) ($b['event'] ?? '');
if (!in_array($ev, ['paid', 'late', 'canceled', 'refunded'], true)) fail('event inválido (paid, late, canceled ou refunded).', 422);
$email = strtolower(trim((string) ($b['email'] ?? ''))); $id = preg_replace('/[^a-f0-9]/', '', (string) ($b['id'] ?? '')); $days = max(1, min(400, (int) ($b['days'] ?? 30))); $plan = isset($b['plan']) ? plan_by_id((string) $b['plan']) : null;
$res = accounts_mutate(function (array &$all) use ($ev, $email, $id, $days, $plan) {
    foreach ($all as &$x) { if (!(($id !== '' && $x['id'] === $id) || ($email !== '' && $x['email'] === $email))) continue;
        if ($ev === 'paid') { if ($plan) { $x['plan'] = $plan['id']; $x['wantPlan'] = ''; } elseif (!empty($x['wantPlan']) && plan_by_id((string) $x['wantPlan'])) { $x['plan'] = $x['wantPlan']; $x['wantPlan'] = ''; } $x['status'] = 'ativa'; $x['trial'] = false; $x['paidUntil'] = max(time(), (int) ($x['paidUntil'] ?? 0)) + $days * 86400; }
        elseif ($ev === 'late') $x['status'] = 'atrasada'; elseif ($ev === 'canceled') $x['status'] = 'cancelada'; else $x['status'] = 'suspensa';
        return $x['id']; } return '';
});
@file_put_contents(data_dir() . '/billing.log', date('c') . " $ev " . ($res ?: 'cliente-nao-encontrado') . ' ' . substr($email, 0, 80) . "\n", FILE_APPEND | LOCK_EX);
if ($res === '') fail('Cliente não encontrado.', 404); json_out(['ok' => true]);
