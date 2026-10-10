<?php
/* Publicar no Instagram e no Facebook pela API oficial da Meta (Graph API), com fila, execução agendada e conexão por login (OAuth).
   O Studio envia uma tarefa (peça pronta: imagens + legenda + data/hora + redes). O servidor guarda as imagens, e na hora marcada publica.
   O Instagram não tem agendamento nativo na API; por isso a fila é nossa e precisa de uma chamada periódica: GET api/meta_social.php?action=run&key=META_CRON_KEY (cron a cada 5 min).
   ATENÇÃO: fluxos escritos conforme a documentação pública da Meta; só funcionam com app aprovado, conta profissional do Instagram ligada a uma Página e site em HTTPS (a Meta precisa baixar as imagens).
   Sem token configurado (ou com META_DRY_RUN) roda em modo de teste: simula a publicação sem chamar a Meta.
   Equipe (logada): GET/POST ?action=status|oauth_url|accounts|select|disconnect|test|queue|jobs|cancel|publish_now|run
   Público: GET ?action=media&j=&n=&sig= (imagem para a Meta baixar) · GET ?action=oauth_callback&code=&state= · GET ?action=run&key=CRON */
require __DIR__ . '/_lib.php';
header('X-Robots-Tag: noindex, nofollow');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$body = [];
if ($method === 'POST') { require_json_write(); $body = body_json(14_000_000); }
$action = (string) ($_GET['action'] ?? ($body['action'] ?? ''));

const MT_FORMATS = ['imagem', 'carrossel', 'story', 'video'];
const MT_NETS = ['instagram', 'facebook'];

function mt_dir(string $sub = ''): string { $d = data_dir() . '/meta' . ($sub !== '' ? '/' . $sub : ''); if (!is_dir($d)) @mkdir($d, 0750, true); return $d; }
function mt_json(string $f) { if (!is_file($f)) return null; $j = json_decode((string) @file_get_contents($f), true); return is_array($j) ? $j : null; }
function mt_put(string $f, $d): bool { $tmp = $f . '.' . bin2hex(random_bytes(4)) . '.tmp'; if (@file_put_contents($tmp, json_encode($d, JSON_UNESCAPED_UNICODE), LOCK_EX) === false) return false; @chmod($tmp, 0640); return @rename($tmp, $f); }
function mt_id($v): string { return preg_replace('/[^a-z0-9_\-]/i', '', (string) $v); }
function mt_s($v, int $n): string { return mb_substr(str_replace("\0", '', trim((string) $v)), 0, $n); }
function mt_secret(): string { $s = (string) cfg('META_SECRET', ''); if ($s !== '') return $s; $f = mt_dir() . '/secret.key'; if (!is_file($f)) { @file_put_contents($f, bin2hex(random_bytes(32))); @chmod($f, 0640); } return (string) @file_get_contents($f); }
function mt_sign(string $s): string { return substr(hash_hmac('sha256', $s, mt_secret()), 0, 32); }
function mt_ver(): string { return preg_match('/^v\d+\.\d+$/', (string) cfg('META_GRAPH_VERSION', 'v21.0')) ? (string) cfg('META_GRAPH_VERSION', 'v21.0') : 'v21.0'; }
function mt_graph_base(): string { return rtrim((string) cfg('META_GRAPH_URL', 'https://graph.facebook.com'), '/') . '/' . mt_ver(); }
function mt_dry(array $c): bool { return !empty(cfg('META_DRY_RUN')) || (($c['token'] ?? '') === ''); }
function mt_base_url(): string {
    $host = preg_replace('/[^a-z0-9.\-:]/i', '', $_SERVER['HTTP_HOST'] ?? 'localhost'); $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https') ? 'https' : 'http';
    return $https . '://' . $host . rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/api/meta_social.php'), '/\\') . '/meta_social.php';
}
/* conexão: config.php/chaves do app têm prioridade; senão a escolhida no login (data/meta/conn.json) */
function mt_conn(): array {
    $s = mt_json(mt_dir() . '/conn.json') ?: [];
    $c = ['page_id' => (string) cfg('META_PAGE_ID', $s['page_id'] ?? ''), 'token' => (string) cfg('META_PAGE_TOKEN', $s['token'] ?? ''), 'ig_id' => (string) cfg('META_IG_USER_ID', $s['ig_id'] ?? ''), 'page_name' => (string) ($s['page_name'] ?? ''), 'ig_username' => (string) ($s['ig_username'] ?? ''), 'source' => cfg('META_PAGE_TOKEN') !== null ? 'chaves' : ($s ? 'login' : '')];
    foreach (['page_id', 'ig_id'] as $k) $c[$k] = preg_replace('/\D/', '', $c[$k]);
    return $c;
}
/* chamada à Graph API (formulário); lança exceção com a mensagem da Meta */
function mt_call(string $method, string $path, array $params, string $token, int $timeout = 60): array {
    $url = mt_graph_base() . '/' . ltrim($path, '/'); $params['access_token'] = $token; $ch = curl_init();
    if ($method === 'GET') { curl_setopt($ch, CURLOPT_URL, $url . '?' . http_build_query($params)); }
    else { curl_setopt($ch, CURLOPT_URL, $url); curl_setopt($ch, CURLOPT_POST, true); curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params)); }
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => $timeout, CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_FOLLOWLOCATION => false]);
    $res = curl_exec($ch); $err = curl_error($ch); $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    if ($res === false) throw new RuntimeException('Sem resposta da Meta: ' . ($err ?: 'falha de rede'));
    $j = json_decode((string) $res, true); if (!is_array($j)) throw new RuntimeException('Resposta inesperada da Meta (HTTP ' . $code . ').');
    if (isset($j['error'])) { $e = $j['error']; throw new RuntimeException(mt_s(($e['message'] ?? 'erro da Meta') . (isset($e['code']) ? ' (código ' . $e['code'] . (isset($e['error_subcode']) ? '/' . $e['error_subcode'] : '') . ')' : ''), 400)); }
    if ($code >= 400) throw new RuntimeException('Meta HTTP ' . $code);
    return $j;
}
/* modo de teste: devolve ids falsos sem chamar a Meta */
function mt_g(array $c, string $method, string $path, array $params, int $timeout = 60): array {
    if (mt_dry($c)) { $id = 'dry_' . substr(md5($path . json_encode($params) . microtime(true)), 0, 14); return ['id' => $id, 'post_id' => $id, 'permalink' => 'https://example.invalid/' . $id, 'status_code' => 'FINISHED']; }
    return mt_call($method, $path, $params, $c['token'], $timeout);
}

/* ---------- tarefas ---------- */
function mt_jobs(): array { return mt_json(mt_dir() . '/jobs.json') ?: []; }
function mt_jobs_save(array $j): bool { return mt_put(mt_dir() . '/jobs.json', array_values($j)); }
function mt_with_jobs(callable $fn) { $lf = fopen(mt_dir() . '/jobs.lock', 'c'); flock($lf, LOCK_EX); try { $j = mt_jobs(); $r = $fn($j); mt_jobs_save($j); return $r; } finally { flock($lf, LOCK_UN); fclose($lf); } }
function mt_public_job(array $j): array { return array_intersect_key($j, array_flip(['id', 'project', 'postId', 'status', 'when', 'created', 'nets', 'format', 'attempts', 'results', 'error', 'updated', 'n', 'dry'])); }
function mt_media_url(string $jid, int $n): string { return mt_base_url() . '?action=media&j=' . $jid . '&n=' . $n . '&sig=' . mt_sign("$jid:$n"); }
function mt_urls(array $job): array { $o = []; for ($i = 0; $i < (int) ($job['n'] ?? 0); $i++) $o[] = mt_media_url($job['id'], $i); return $o; }

/* validações simples antes de gastar chamada da Meta */
function mt_check(array $job, array $c): ?string {
    $cap = (string) ($job['caption'] ?? ''); $n = (int) ($job['n'] ?? 0); $f = $job['format'];
    if (!$job['nets']) return 'Escolha ao menos uma rede (Instagram ou Facebook).';
    if ($f === 'video') { if (empty($job['videoUrl'])) return 'Reels e vídeos precisam de um arquivo de vídeo; o Studio ainda não gera vídeo.'; }
    elseif ($n < 1) return 'A peça não tem imagem.';
    if ($f === 'carrossel' && ($n < 2 || $n > 10)) return 'Carrossel precisa de 2 a 10 imagens.';
    if (in_array('instagram', $job['nets'], true)) {
        if (mb_strlen($cap) > 2200) return 'Instagram: a legenda passa de 2.200 caracteres.';
        if (preg_match_all('/#[\p{L}\p{N}_]+/u', $cap) > 30) return 'Instagram: no máximo 30 hashtags.';
        if ($c['ig_id'] === '' && !mt_dry($c)) return 'Instagram: conta profissional não conectada.';
    }
    if (in_array('facebook', $job['nets'], true) && $c['page_id'] === '' && !mt_dry($c)) return 'Facebook: Página não conectada.';
    return null;
}
function mt_ig(array $c, array $job, array $urls): array {
    $ig = $c['ig_id']; $cap = (string) $job['caption']; $f = $job['format'];
    if ($f === 'carrossel') {
        $kids = []; foreach ($urls as $u) { $r = mt_g($c, 'POST', "$ig/media", ['image_url' => $u, 'is_carousel_item' => 'true']); $kids[] = $r['id']; }
        $cr = mt_g($c, 'POST', "$ig/media", ['media_type' => 'CAROUSEL', 'children' => implode(',', $kids), 'caption' => $cap]);
    } elseif ($f === 'story') { $cr = mt_g($c, 'POST', "$ig/media", ['image_url' => $urls[0], 'media_type' => 'STORIES']); }
    elseif ($f === 'video') { $cr = mt_g($c, 'POST', "$ig/media", ['media_type' => 'REELS', 'video_url' => (string) $job['videoUrl'], 'caption' => $cap]); }
    else { $cr = mt_g($c, 'POST', "$ig/media", ['image_url' => $urls[0], 'caption' => $cap]); }
    for ($i = 0; $i < 20 && !mt_dry($c); $i++) {   // espera o contêiner ficar pronto (vídeo pode demorar)
        $st = mt_call('GET', $cr['id'], ['fields' => 'status_code'], $c['token'], 30)['status_code'] ?? 'FINISHED'; if ($st === 'FINISHED') break; if ($st === 'ERROR' || $st === 'EXPIRED') throw new RuntimeException('Instagram: o arquivo foi recusado (' . $st . ').'); sleep($f === 'video' ? 5 : 1);
    }
    $pub = mt_g($c, 'POST', "$ig/media_publish", ['creation_id' => $cr['id']]); $link = '';
    try { $link = (string) (mt_g($c, 'GET', $pub['id'], ['fields' => 'permalink'], 30)['permalink'] ?? ''); } catch (Throwable $e) { /* sem link */ }
    return ['ok' => true, 'id' => $pub['id'], 'url' => $link];
}
function mt_fb(array $c, array $job, array $urls): array {
    $pg = $c['page_id']; $cap = (string) $job['caption']; $f = $job['format'];
    if ($f === 'story') { $ph = mt_g($c, 'POST', "$pg/photos", ['url' => $urls[0], 'published' => 'false']); $r = mt_g($c, 'POST', "$pg/photo_stories", ['photo_id' => $ph['id']]); $id = (string) ($r['post_id'] ?? $r['id'] ?? $ph['id']); return ['ok' => true, 'id' => $id, 'url' => 'https://www.facebook.com/' . $pg . '/']; }
    if ($f === 'video') { $r = mt_g($c, 'POST', "$pg/videos", ['file_url' => (string) $job['videoUrl'], 'description' => $cap], 120); return ['ok' => true, 'id' => (string) $r['id'], 'url' => 'https://www.facebook.com/' . $pg . '/']; }
    if (count($urls) === 1) { $r = mt_g($c, 'POST', "$pg/photos", ['url' => $urls[0], 'caption' => $cap, 'published' => 'true']); $id = (string) ($r['post_id'] ?? $r['id']); }
    else { $ids = []; foreach ($urls as $u) { $r = mt_g($c, 'POST', "$pg/photos", ['url' => $u, 'published' => 'false']); $ids[] = ['media_fbid' => $r['id']]; } $r = mt_g($c, 'POST', "$pg/feed", ['message' => $cap, 'attached_media' => json_encode($ids)]); $id = (string) $r['id']; }
    return ['ok' => true, 'id' => $id, 'url' => 'https://www.facebook.com/' . $id];
}
/* publica uma tarefa: cada rede uma vez (quem já deu certo não repete) */
function mt_publish(array &$job): void {
    $c = mt_conn(); $job['dry'] = mt_dry($c); $err = mt_check($job, $c);
    if ($err) { $job['status'] = 'failed'; $job['error'] = $err; $job['attempts'] = 3; return; }
    $urls = mt_urls($job); $fail = [];
    foreach ($job['nets'] as $net) {
        if (!empty($job['results'][$net]['ok'])) continue;
        try { $job['results'][$net] = $net === 'instagram' ? mt_ig($c, $job, $urls) : mt_fb($c, $job, $urls); }
        catch (Throwable $e) { $job['results'][$net] = ['ok' => false, 'error' => mt_s($e->getMessage(), 400)]; $fail[] = ucfirst($net) . ': ' . $job['results'][$net]['error']; }
    }
    $job['attempts'] = (int) ($job['attempts'] ?? 0) + 1; $job['updated'] = date('c');
    if (!$fail) { $job['status'] = 'done'; $job['error'] = ''; return; }
    $job['error'] = implode(' | ', $fail);
    if ($job['attempts'] >= 3) $job['status'] = 'failed'; else { $job['status'] = 'queued'; $job['next'] = date('c', time() + 300 * $job['attempts']); }
}
/* executa o que venceu (chamado pelo cron e pelo "publicar agora"); cada tarefa é gravada com trava, sem pisar em tarefas novas */
function mt_job_put(array $job): void { mt_with_jobs(function (&$all) use ($job) { foreach ($all as &$x) if ($x['id'] === $job['id']) { $x = $job; return; } }); }
function mt_run(?string $only = null): array {
    $lf = fopen(mt_dir() . '/run.lock', 'c'); if (!flock($lf, LOCK_EX | LOCK_NB)) return ['ok' => true, 'busy' => true, 'ran' => 0];
    try {
        $now = time(); $due = [];
        foreach (mt_jobs() as $j) {
            if (($j['status'] ?? '') !== 'queued') continue; if ($only !== null && $j['id'] !== $only) continue;
            if (strtotime((string) ($j['when'] ?? '')) > $now + 30) continue; if (!empty($j['next']) && strtotime($j['next']) > $now) continue; $due[] = $j['id'];
        }
        $ran = 0;
        foreach ($due as $id) {
            $job = null; foreach (mt_jobs() as $j) if ($j['id'] === $id && $j['status'] === 'queued') $job = $j; if (!$job) continue;
            $job['status'] = 'running'; mt_job_put($job); mt_publish($job); mt_job_put($job); $ran++;
        }
        @file_put_contents(mt_dir() . '/lastrun.txt', date('c'));
        return ['ok' => true, 'ran' => $ran];
    } finally { flock($lf, LOCK_UN); fclose($lf); }
}

/* ---------- público ---------- */
if ($action === 'media') {
    $j = mt_id($_GET['j'] ?? ''); $n = (int) ($_GET['n'] ?? 0); $sig = (string) ($_GET['sig'] ?? ''); if ($j === '' || !hash_equals(mt_sign("$j:$n"), $sig)) { http_response_code(404); exit; }
    foreach (['jpg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'] as $e => $ct) { $f = mt_dir("media/$j") . "/$n.$e"; if (is_file($f)) { header('Content-Type: ' . $ct); header('Cache-Control: public, max-age=3600'); header('X-Content-Type-Options: nosniff'); readfile($f); exit; } }
    http_response_code(404); exit;
}
if ($action === 'run' && !logged_in_team_run()) {
    $key = (string) cfg('META_CRON_KEY', ''); if ($key === '' || !hash_equals($key, (string) ($_GET['key'] ?? ''))) fail('Chave do agendador inválida.', 403);
    json_out(mt_run());
}
function logged_in_team_run(): bool { return auth_required() && logged_in(); }
if ($action === 'oauth_callback') {
    $st = (string) ($_GET['state'] ?? ''); $code = (string) ($_GET['code'] ?? ''); [$ts, $sig] = array_pad(explode('.', $st, 2), 2, '');
    $page = function (string $msg, bool $ok) { header('Content-Type: text/html; charset=utf-8'); echo '<!doctype html><meta charset="utf-8"><title>Meta</title><body style="font:16px system-ui;padding:24px"><p>' . htmlspecialchars($msg) . '</p><script>try{window.opener&&window.opener.postMessage({metaConnect:' . ($ok ? 'true' : 'false') . '},"*")}catch(e){}setTimeout(function(){window.close()},1500)</script>'; exit; };
    if (!ctype_digit($ts) || time() - (int) $ts > 900 || !hash_equals(mt_sign('oauth:' . $ts), $sig)) $page('Pedido de login expirado. Feche esta janela e tente de novo no Studio.', false);
    if ($code === '' || isset($_GET['error'])) $page('Login cancelado ou recusado: ' . mt_s($_GET['error_description'] ?? 'sem permissão', 160), false);
    $app = (string) cfg('META_APP_ID', ''); $sec = (string) cfg('META_APP_SECRET', ''); if ($app === '' || $sec === '') $page('META_APP_ID e META_APP_SECRET não estão configurados.', false);
    try {
        $redir = mt_base_url() . '?action=oauth_callback';
        $r = mt_call('GET', 'oauth/access_token', ['client_id' => $app, 'client_secret' => $sec, 'redirect_uri' => $redir, 'code' => $code], '', 30);
        $r = mt_call('GET', 'oauth/access_token', ['grant_type' => 'fb_exchange_token', 'client_id' => $app, 'client_secret' => $sec, 'fb_exchange_token' => $r['access_token']], '', 30);
        $acc = mt_call('GET', 'me/accounts', ['fields' => 'id,name,access_token,instagram_business_account{id,username}', 'limit' => 50], $r['access_token'], 30);
        $pending = []; foreach (($acc['data'] ?? []) as $p) $pending[] = ['page_id' => (string) $p['id'], 'page_name' => mt_s($p['name'] ?? '', 120), 'token' => (string) ($p['access_token'] ?? ''), 'ig_id' => (string) ($p['instagram_business_account']['id'] ?? ''), 'ig_username' => mt_s($p['instagram_business_account']['username'] ?? '', 80)];
        if (!$pending) $page('A conta não administra nenhuma Página do Facebook. Entre com quem administra a Página.', false);
        mt_put(mt_dir() . '/pending.json', ['at' => date('c'), 'pages' => $pending]); $page('Conectado. Volte ao Studio e escolha a Página e a conta do Instagram.', true);
    } catch (Throwable $e) { $page('Não consegui concluir o login: ' . $e->getMessage(), false); }
}

/* ---------- equipe (logada) ---------- */
require_auth();
if ($action === 'status' || $action === '') {
    $c = mt_conn(); $app = (string) cfg('META_APP_ID', '') !== '' && (string) cfg('META_APP_SECRET', '') !== '';
    json_out(['ok' => true, 'connected' => $c['token'] !== '' && ($c['page_id'] !== '' || $c['ig_id'] !== ''), 'dry' => mt_dry($c), 'source' => $c['source'], 'page_id' => $c['page_id'], 'page_name' => $c['page_name'], 'ig_id' => $c['ig_id'], 'ig_username' => $c['ig_username'], 'oauth' => $app, 'pending' => is_file(mt_dir() . '/pending.json'), 'cron' => (string) cfg('META_CRON_KEY', '') !== '', 'cronUrl' => mt_base_url() . '?action=run&key=' . ((string) cfg('META_CRON_KEY', '') !== '' ? '<META_CRON_KEY>' : '(defina META_CRON_KEY)'), 'lastRun' => (string) @file_get_contents(mt_dir() . '/lastrun.txt'), 'graph' => mt_graph_base(), 'https' => strpos(mt_base_url(), 'https://') === 0]);
}
if ($action === 'oauth_url') {
    $app = (string) cfg('META_APP_ID', ''); if ($app === '' || (string) cfg('META_APP_SECRET', '') === '') fail('Defina META_APP_ID e META_APP_SECRET (app em developers.facebook.com).', 503);
    $ts = (string) time(); $scope = 'pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish,business_management';
    json_out(['ok' => true, 'url' => 'https://www.facebook.com/' . mt_ver() . '/dialog/oauth?' . http_build_query(['client_id' => $app, 'redirect_uri' => mt_base_url() . '?action=oauth_callback', 'state' => $ts . '.' . mt_sign('oauth:' . $ts), 'scope' => $scope, 'response_type' => 'code']), 'redirect' => mt_base_url() . '?action=oauth_callback']);
}
if ($action === 'accounts') { $p = mt_json(mt_dir() . '/pending.json'); json_out(['ok' => true, 'pages' => array_map(fn($x) => array_diff_key($x, ['token' => 1]), $p['pages'] ?? [])]); }
if ($action === 'select') {
    $p = mt_json(mt_dir() . '/pending.json'); $id = preg_replace('/\D/', '', (string) ($body['page_id'] ?? '')); $hit = null; foreach (($p['pages'] ?? []) as $x) if ($x['page_id'] === $id) $hit = $x; if (!$hit) fail('Página não encontrada. Conecte de novo.', 404);
    if (!mt_put(mt_dir() . '/conn.json', $hit + ['connected_at' => date('c')])) fail('Não consegui gravar a conexão (permissão da pasta api/data).', 500); @unlink(mt_dir() . '/pending.json'); json_out(['ok' => true]);
}
if ($action === 'disconnect') { @unlink(mt_dir() . '/conn.json'); @unlink(mt_dir() . '/pending.json'); json_out(['ok' => true]); }
if ($action === 'test') {
    $c = mt_conn(); if (mt_dry($c)) json_out(['ok' => true, 'dry' => true, 'msg' => 'Modo de teste: nada é enviado à Meta.']); $out = [];
    try { if ($c['page_id'] !== '') $out['page'] = mt_call('GET', $c['page_id'], ['fields' => 'name'], $c['token'], 30)['name'] ?? ''; if ($c['ig_id'] !== '') $out['instagram'] = mt_call('GET', $c['ig_id'], ['fields' => 'username'], $c['token'], 30)['username'] ?? ''; }
    catch (Throwable $e) { fail($e->getMessage(), 502); } json_out(['ok' => true] + $out);
}
if ($action === 'jobs') { $p = mt_id($_GET['project'] ?? ''); json_out(['ok' => true, 'jobs' => array_values(array_map('mt_public_job', array_filter(mt_jobs(), fn($j) => $p === '' || ($j['project'] ?? '') === $p)))]); }
if ($action === 'cancel') {
    $id = mt_id($body['id'] ?? ''); $r = mt_with_jobs(function (&$jobs) use ($id) { foreach ($jobs as &$j) if ($j['id'] === $id && in_array($j['status'], ['queued', 'failed'], true)) { $j['status'] = 'cancelled'; return true; } return false; });
    json_out(['ok' => (bool) $r]);
}
if ($action === 'run') json_out(mt_run());
if ($action === 'queue' || $action === 'publish_now') {
    if (!rate_limit('mtq:' . (session_id() ?: client_ip()), 300, 3600)) fail('Muitas publicações em pouco tempo.', 429);
    $in = is_array($body['job'] ?? null) ? $body['job'] : []; $fmt = in_array($in['format'] ?? '', MT_FORMATS, true) ? $in['format'] : 'imagem';
    $nets = array_values(array_intersect(MT_NETS, array_map('strval', is_array($in['nets'] ?? null) ? $in['nets'] : [])));
    $when = (string) ($in['when'] ?? ''); $ts = strtotime($when) ?: time(); if ($action === 'publish_now') $ts = time();
    $id = 'mj_' . bin2hex(random_bytes(6)); $dir = mt_dir("media/$id"); $n = 0;
    foreach (array_slice(is_array($body['images'] ?? null) ? $body['images'] : [], 0, 10) as $d) {
        if (!is_string($d) || !preg_match('#^data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$#', $d, $m)) continue; $raw = base64_decode($m[2], true); if ($raw === false || strlen($raw) > 1_800_000) continue;
        if (@file_put_contents("$dir/$n." . ($m[1] === 'jpeg' ? 'jpg' : $m[1]), $raw) !== false) $n++;
    }
    $videoUrl = (string) ($in['videoUrl'] ?? ''); if ($videoUrl !== '' && !preg_match('#^https://[^\s]{4,500}$#', $videoUrl)) $videoUrl = '';
    $job = ['id' => $id, 'project' => mt_id($in['project'] ?? ''), 'postId' => mt_id($in['postId'] ?? ''), 'status' => 'queued', 'when' => date('c', $ts), 'created' => date('c'), 'nets' => $nets, 'format' => $fmt, 'caption' => mt_s($in['caption'] ?? '', 6000), 'n' => $n, 'videoUrl' => $videoUrl, 'attempts' => 0, 'results' => (object) [], 'error' => ''];
    $err = mt_check($job, mt_conn()); if ($err) { foreach (glob("$dir/*") ?: [] as $f) @unlink($f); @rmdir($dir); fail($err, 422); }
    mt_with_jobs(function (&$jobs) use ($job) { if ($job['postId'] !== '') foreach ($jobs as &$j) if (($j['postId'] ?? '') === $job['postId'] && $j['status'] === 'queued') $j['status'] = 'cancelled'; $jobs[] = $job; $jobs = array_slice($jobs, -500); });
    if ($action === 'publish_now') { mt_run($id); $j = null; foreach (mt_jobs() as $x) if ($x['id'] === $id) $j = $x; json_out(['ok' => true, 'job' => $j ? mt_public_job($j) : null]); }
    json_out(['ok' => true, 'id' => $id, 'when' => $job['when'], 'dry' => mt_dry(mt_conn())]);
}
fail('Ação desconhecida.', 422);
