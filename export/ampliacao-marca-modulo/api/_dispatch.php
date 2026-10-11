<?php
/* Distribuição de leads: depois de gravar o lead, avisa gestor e vendedor por e-mail, manda para planilha e CRM (webhooks) e,
   se configurado, avisa o vendedor no WhatsApp (Cloud API). Cada destino é independente: se um falhar, os outros seguem e o lead já está salvo. */
function routing_file(): string { return data_dir() . '/routing.json'; }
function routing_cfg(): array {
    $f = routing_file(); $j = is_file($f) ? (json_decode((string) @file_get_contents($f), true) ?: []) : [];
    return routing_clean(is_array($j) ? $j : []);
}
function routing_emails($v): array {
    $a = is_array($v) ? $v : preg_split('/[\s,;]+/', (string) $v); $o = [];
    foreach ($a as $e) { $e = trim((string) $e); if ($e !== '' && filter_var($e, FILTER_VALIDATE_EMAIL) && strlen($e) <= 200 && !preg_match('/[\r\n]/', $e)) $o[strtolower($e)] = $e; }
    return array_slice(array_values($o), 0, 10);
}
function routing_url($v): string { $v = trim((string) $v); return (preg_match('#^https://[^\s"\'<>]{4,500}$#i', $v)) ? $v : ''; }
function routing_clean(array $j): array {
    return ['managers' => routing_emails($j['managers'] ?? []), 'sellers' => routing_emails($j['sellers'] ?? []),
        'sheetsUrl' => routing_url($j['sheetsUrl'] ?? ''), 'crmUrl' => routing_url($j['crmUrl'] ?? ''), 'crmSecret' => preg_match('/^[\w.\-]{0,200}$/', (string) ($j['crmSecret'] ?? '')) ? (string) ($j['crmSecret'] ?? '') : '',
        'sellerWhatsapp' => preg_replace('/\D/', '', (string) ($j['sellerWhatsapp'] ?? '')) ?: '', 'waTemplate' => preg_match('/^[a-z0-9_]{0,512}$/', (string) ($j['waTemplate'] ?? '')) ? (string) ($j['waTemplate'] ?? '') : '', 'waLang' => preg_match('/^[a-z]{2}(_[A-Z]{2})?$/', (string) ($j['waLang'] ?? '')) ? (string) $j['waLang'] : 'pt_BR',
        'from' => (filter_var($j['from'] ?? '', FILTER_VALIDATE_EMAIL) ?: '')];
}
function lead_text(array $l, bool $withLink = true): string {
    $ph = preg_replace('/\D/', '', (string) ($l['phone'] ?? '')); if ($ph !== '' && strlen($ph) <= 11) $ph = '55' . $ph;
    $utm = ''; foreach (($l['utm'] ?? []) as $k => $v) $utm .= ($utm ? ', ' : '') . $k . '=' . $v;
    $t = "Novo lead\nNome: " . ($l['name'] ?? '') . "\nTelefone: " . ($l['phone'] ?? '') . (($l['email'] ?? '') !== '' ? "\nE-mail: " . $l['email'] : '') . "\nInteresse: " . ($l['message'] ?? '') . "\nOrigem: " . ($l['source'] ?? '') . ($utm ? " ($utm)" : '') . "\nQuando: " . ($l['at'] ?? date('c'));
    if ($withLink && $ph !== '') $t .= "\nChamar no WhatsApp: https://wa.me/" . $ph;
    return $t;
}
function dispatch_log(string $line): void { @file_put_contents(data_dir() . '/leads_dispatch.log', date('c') . ' ' . str_replace(["\r", "\n"], ' ', $line) . "\n", FILE_APPEND | LOCK_EX); }
function dispatch_mail(array $to, string $subject, string $body, string $from): bool {
    if (!$to) return false; $host = preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['HTTP_HOST'] ?? 'localhost'); $from = $from ?: 'no-reply@' . ($host ?: 'localhost');
    $h = "From: $from\r\nContent-Type: text/plain; charset=UTF-8\r\nX-Mailer: AmpliacaoStudio";
    return @mail(implode(',', $to), '=?UTF-8?B?' . base64_encode(str_replace(["\r", "\n"], ' ', $subject)) . '?=', $body, $h);
}
function dispatch_lead(array $l): void {
    $r = routing_cfg(); $name = (string) ($l['name'] ?? '') ?: 'sem nome';
    $subject = 'Novo lead: ' . $name . (($l['project'] ?? '') !== '' ? ' (' . $l['project'] . ')' : '');
    if ($r['managers']) dispatch_log('email gestor ' . (dispatch_mail($r['managers'], $subject, lead_text($l, false) . "\n\nVocê recebe este aviso como gestor. O vendedor recebeu o contato para atendimento.", $r['from']) ? 'ok' : 'falhou'));
    if ($r['sellers']) dispatch_log('email vendedor ' . (dispatch_mail($r['sellers'], $subject, lead_text($l, true), $r['from']) ? 'ok' : 'falhou'));
    $payload = ['lead' => $l, 'text' => lead_text($l)];
    foreach ([['planilha', $r['sheetsUrl'], []], ['crm', $r['crmUrl'], $r['crmSecret'] !== '' ? ['X-Webhook-Secret: ' . $r['crmSecret']] : []]] as [$n, $url, $hx]) {
        if ($url === '') continue; [$code, , $err] = http_json($url, array_merge(['Content-Type: application/json'], $hx), $payload, 8);
        dispatch_log("$n HTTP $code" . (($code >= 200 && $code < 400) ? ' ok' : ' falhou: ' . mb_substr((string) $err, 0, 120)));
    }
    $tok = (string) cfg('WHATSAPP_TOKEN', ''); $pid = (string) cfg('WHATSAPP_PHONE_ID', '');
    if ($r['sellerWhatsapp'] !== '' && $tok !== '' && preg_match('/^\d{5,25}$/', $pid)) {
        $msg = $r['waTemplate'] !== ''
            ? ['messaging_product' => 'whatsapp', 'to' => $r['sellerWhatsapp'], 'type' => 'template', 'template' => ['name' => $r['waTemplate'], 'language' => ['code' => $r['waLang']], 'components' => [['type' => 'body', 'parameters' => array_map(fn($t) => ['type' => 'text', 'text' => mb_substr(str_replace(["\n", "\t"], ' ', (string) $t) ?: '-', 0, 200)], [$l['name'] ?? '', $l['phone'] ?? '', $l['message'] ?? ''])]]]]
            : ['messaging_product' => 'whatsapp', 'to' => $r['sellerWhatsapp'], 'type' => 'text', 'text' => ['body' => mb_substr(lead_text($l), 0, 3000)]];
        [$code, $j, $err] = http_json('https://graph.facebook.com/v20.0/' . $pid . '/messages', ['Content-Type: application/json', 'Authorization: Bearer ' . $tok], $msg, 10);
        dispatch_log('whatsapp vendedor HTTP ' . $code . ($code >= 200 && $code < 300 ? ' ok' : ' falhou: ' . mb_substr((string) json_encode($j['error']['message'] ?? $err), 0, 160)));
    }
}
