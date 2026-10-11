<?php
/* Destinos dos leads (e-mails do gestor e do vendedor, planilha, CRM, WhatsApp do vendedor). Só com login do Studio.
   GET → configuração atual (URLs voltam só como "configurado"), últimas linhas do log; POST → grava. */
require __DIR__ . '/_lib.php';
require __DIR__ . '/_dispatch.php';
require_auth();
$f = routing_file();
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    $r = routing_cfg(); $log = is_file(data_dir() . '/leads_dispatch.log') ? array_slice(file(data_dir() . '/leads_dispatch.log', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES), -12) : [];
    $host = fn($u) => $u === '' ? '' : (parse_url($u, PHP_URL_HOST) ?: 'configurado');
    json_out(['ok' => true, 'managers' => $r['managers'], 'sellers' => $r['sellers'], 'sellerWhatsapp' => $r['sellerWhatsapp'], 'waTemplate' => $r['waTemplate'], 'waLang' => $r['waLang'], 'from' => $r['from'],
        'sheets' => $host($r['sheetsUrl']), 'crm' => $host($r['crmUrl']), 'crmSecret' => $r['crmSecret'] !== '', 'whatsappApi' => cfg('WHATSAPP_TOKEN') !== null && cfg('WHATSAPP_PHONE_ID') !== null, 'log' => $log]);
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Use GET ou POST', 405);
require_json_write();
if (!rate_limit('routing:' . client_ip(), 30, 3600)) fail('Muitas alterações; tente mais tarde.', 429);
$b = body_json(8000); $old = routing_cfg();
foreach (['sheetsUrl', 'crmUrl'] as $k) if (!array_key_exists($k, $b)) $b[$k] = $old[$k]; elseif (trim((string) $b[$k]) !== '' && routing_url($b[$k]) === '') fail('O endereço de ' . ($k === 'sheetsUrl' ? 'planilha' : 'CRM') . ' deve começar com https://', 422);
if (!array_key_exists('crmSecret', $b)) $b['crmSecret'] = $old['crmSecret'];
foreach (['managers', 'sellers'] as $k) if (isset($b[$k])) { $n = count(is_array($b[$k]) ? $b[$k] : preg_split('/[\s,;]+/', (string) $b[$k], -1, PREG_SPLIT_NO_EMPTY)); if ($n > count(routing_emails($b[$k]))) fail('Há e-mail inválido em ' . ($k === 'managers' ? 'gestor' : 'vendedor') . '.', 422); }
$new = routing_clean($b); data_dir();
if (@file_put_contents($f . '.tmp', json_encode($new, JSON_UNESCAPED_UNICODE), LOCK_EX) === false || !@rename($f . '.tmp', $f)) fail('Não consegui gravar no servidor (permissão da pasta de dados).', 500);
@chmod($f, 0640);
json_out(['ok' => true]);
