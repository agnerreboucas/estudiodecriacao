<?php
/* Chaves de API gravadas pelo app. Só funciona com senha do Studio ativa (senão qualquer pessoa poderia trocar as chaves).
   GET  → {keys: {NOME: {configured, source: 'config'|'app'|''}}, editable}   (nunca devolve o valor)
   POST {name, value} grava · POST {name, clear:true} remove (só as gravadas pelo app; as de config.php só se editam lá) */
require __DIR__ . '/_lib.php';
require_auth();
$file = keys_file();
$stored = is_file($file) ? (json_decode((string) @file_get_contents($file), true) ?: []) : [];
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    $out = [];
    foreach (APP_KEYS as $k) { $inCfg = ((string) ($GLOBALS['CFG'][$k] ?? '') !== '') && !isset($stored[$k]); $out[$k] = ['configured' => cfg($k) !== null, 'source' => isset($stored[$k]) && $stored[$k] !== '' ? 'app' : ($inCfg ? 'config' : '')]; }
    json_out(['ok' => true, 'keys' => $out, 'editable' => auth_required(), 'provider' => cfg('AI_PROVIDER', 'anthropic')]);
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Use GET ou POST', 405);
require_json_write();
if (!auth_required()) fail('Para salvar chaves pelo app, defina primeiro a senha do Studio (ADMIN_PASSWORD_HASH em api/config.php). Sem senha, qualquer pessoa com o link poderia trocar as chaves.', 403);
if (!rate_limit('keys:' . (session_id() ?: client_ip()), 30, 3600)) fail('Muitas alterações; tente mais tarde.', 429);
$b = body_json(4000);
$name = (string) ($b['name'] ?? '');
if (!in_array($name, APP_KEYS, true)) fail('chave desconhecida', 422);
if (!empty($b['clear'])) { unset($stored[$name]); }
else {
    $v = trim((string) ($b['value'] ?? ''));
    if ($name === 'AI_PROVIDER') { if (!in_array($v, ['anthropic', 'openai'], true)) fail('provedor inválido', 422); }
    elseif (!preg_match('~^[A-Za-z0-9._\-]{8,300}$~', $v)) fail('chave inválida: use só letras, números, ponto, hífen e sublinhado (8 a 300 caracteres), sem espaços', 422);
    $stored[$name] = $v;
}
$dir = dirname($file); data_dir();
$tmp = $file . '.tmp'; if (@file_put_contents($tmp, json_encode($stored), LOCK_EX) === false) fail('Não consegui gravar no servidor (permissão da pasta de dados).', 500);
@chmod($tmp, 0640); if (!@rename($tmp, $file)) fail('Não consegui gravar no servidor.', 500);
json_out(['ok' => true]);
