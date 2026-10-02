<?php
/* Leitura de UMA página pública (site de concorrente/referência): título, textos, CTAs, fontes e cores.
   Proteções: só http/https, bloqueia IPs privados/reservados (SSRF), valida cada redirecionamento, trava o IP resolvido,
   limita tamanho e tempo. Não rastreia o site: uma página + até 2 CSS. */
require __DIR__ . '/_lib.php';
require_auth();
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Use POST', 405);
require_json_write();
if (!rate_limit('an:' . (session_id() ?: client_ip()), 30, 3600)) fail('Limite de análises por hora atingido.', 429);

$b = body_json(20000);
$url = trim((string) ($b['url'] ?? ''));
if ($url === '' || strlen($url) > 500) fail('Informe a URL do site.', 422);
if (!preg_match('#^https?://#i', $url)) $url = 'https://' . $url;
$allowPrivate = (bool) cfg('ANALYZE_ALLOW_PRIVATE', false);   // só para testes locais

function host_ips(string $host): array {
    $host = trim($host, '[]');
    if (filter_var($host, FILTER_VALIDATE_IP)) return [$host];
    $ips = @gethostbynamel($host) ?: [];
    foreach (@dns_get_record($host, DNS_AAAA) ?: [] as $r) if (!empty($r['ipv6'])) $ips[] = $r['ipv6'];
    return $ips;
}
function safe_fetch(string $url, bool $allowPrivate, int $max = 1500000): array {
    for ($hop = 0; $hop < 4; $hop++) {
        $p = parse_url($url);
        if (!$p || empty($p['host']) || isset($p['user']) || isset($p['pass']) || !in_array(strtolower($p['scheme'] ?? ''), ['http', 'https'], true)) throw new RuntimeException('URL inválida');
        $https = strtolower($p['scheme']) === 'https'; $port = $p['port'] ?? ($https ? 443 : 80);
        if (!$allowPrivate && !in_array($port, [80, 443], true)) throw new RuntimeException('Porta não permitida');
        $ips = host_ips($p['host']);
        if (!$ips) throw new RuntimeException('Não foi possível resolver o endereço do site');
        foreach ($ips as $ip) if (!$allowPrivate && !filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) throw new RuntimeException('Endereço não permitido');
        $ip = $ips[0]; $body = ''; $headers = [];
        $ch = curl_init($url);
        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => false, CURLOPT_FOLLOWLOCATION => false, CURLOPT_TIMEOUT => 12, CURLOPT_CONNECTTIMEOUT => 6,
            CURLOPT_RESOLVE => [$p['host'] . ':' . $port . ':' . (strpos($ip, ':') !== false ? '[' . $ip . ']' : $ip)],
            CURLOPT_USERAGENT => 'AmpliaStudioBot/1.0 (leitura unica de pagina publica)', CURLOPT_HTTPHEADER => ['Accept: text/html,text/css;q=0.9'],
            CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
            CURLOPT_HEADERFUNCTION => function ($c, $h) use (&$headers) { $l = strlen($h); $kv = explode(':', $h, 2); if (count($kv) === 2) $headers[strtolower(trim($kv[0]))] = trim($kv[1]); return $l; },
            CURLOPT_WRITEFUNCTION => function ($c, $d) use (&$body, $max) { $body .= $d; return strlen($body) > $max ? 0 : strlen($d); }]);
        curl_exec($ch); $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
        if ($code >= 300 && $code < 400 && !empty($headers['location'])) {
            $loc = $headers['location'];
            if (!preg_match('#^https?://#i', $loc)) $loc = ($p['scheme'] . '://' . $p['host'] . (isset($p['port']) ? ':' . $p['port'] : '')) . ($loc[0] === '/' ? $loc : '/' . $loc);
            $url = $loc; continue;
        }
        return [$code, $body, $url, $headers['content-type'] ?? ''];
    }
    throw new RuntimeException('Redirecionamentos demais');
}
function abs_url(string $href, string $base): string {
    if (preg_match('#^https?://#i', $href)) return $href;
    $p = parse_url($base); $root = $p['scheme'] . '://' . $p['host'] . (isset($p['port']) ? ':' . $p['port'] : '');
    if (strpos($href, '//') === 0) return $p['scheme'] . ':' . $href;
    if ($href !== '' && $href[0] === '/') return $root . $href;
    return $root . rtrim(dirname($p['path'] ?? '/'), '/') . '/' . $href;
}

try { [$code, $html, $final, $ct] = safe_fetch($url, $allowPrivate); } catch (RuntimeException $e) { fail('Não foi possível ler o site: ' . $e->getMessage(), 422); }
if ($code < 200 || $code >= 400) fail('O site respondeu HTTP ' . $code . '.', 422);
if (stripos($ct, 'html') === false && stripos($html, '<html') === false) fail('A URL não é uma página HTML.', 422);

libxml_use_internal_errors(true);
$doc = new DOMDocument(); $doc->loadHTML('<?xml encoding="utf-8" ?>' . $html, LIBXML_NONET | LIBXML_COMPACT);
$xp = new DOMXPath($doc);
$meta = function (string $n) use ($xp) { $r = $xp->query("//meta[@name='$n' or @property='$n']/@content"); return $r->length ? trim($r->item(0)->nodeValue) : ''; };
$clip = fn($s, $n) => mb_substr(trim(preg_replace('/\s+/u', ' ', (string) $s)), 0, $n);

$title = $clip($xp->query('//title')->length ? $xp->query('//title')->item(0)->textContent : '', 160);
$headings = []; foreach ($xp->query('//h1|//h2|//h3') as $h) { $t = $clip($h->textContent, 140); if (mb_strlen($t) > 3 && !in_array($t, $headings, true)) $headings[] = $t; if (count($headings) >= 15) break; }
$ctas = []; foreach ($xp->query('//a|//button') as $el) { $t = $clip($el->textContent, 40); if (mb_strlen($t) >= 3 && preg_match('/compr|quero|saiba|fale|agende|contrat|solicit|baix|comece|teste|whatsapp|orçamento|cadastr|entre em contato|conhe|simul|garanta|aproveit/iu', $t) && !in_array($t, $ctas, true)) $ctas[] = $t; if (count($ctas) >= 10) break; }

/* CSS: <style>, atributos style e até 2 folhas de estilo */
$css = ''; foreach ($xp->query('//style') as $s) $css .= $s->textContent . "\n"; foreach ($xp->query('//@style') as $s) $css .= $s->nodeValue . ";\n";
$sheets = 0; foreach ($xp->query("//link[@rel='stylesheet']/@href") as $l) {
    if ($sheets >= 2) break; $sheets++;
    try { [$sc, $sb] = safe_fetch(abs_url($l->nodeValue, $final), $allowPrivate, 400000); if ($sc === 200) $css .= "\n" . $sb; } catch (RuntimeException $e) { /* ignora folha inacessível */ }
}
$fonts = []; if (preg_match_all('/font-family\s*:\s*([^;}{]+)/i', $css, $m)) foreach ($m[1] as $decl) { $f = trim(explode(',', $decl)[0], " \t\"'"); if ($f !== '' && !preg_match('/^(inherit|initial|unset|var\(|-apple-system|system-ui|sans-serif|serif|monospace|blinkmacsystemfont)/i', $f)) $fonts[$f] = ($fonts[$f] ?? 0) + 1; }
foreach ($xp->query("//link[contains(@href,'fonts.googleapis.com')]/@href") as $g) if (preg_match_all('/family=([^&:;]+)/', urldecode($g->nodeValue), $gm)) foreach ($gm[1] as $f) { $f = str_replace('+', ' ', $f); $fonts[$f] = ($fonts[$f] ?? 0) + 3; }
arsort($fonts);
$colors = []; if (preg_match_all('/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/', $css, $cm)) foreach ($cm[1] as $c) { $c = strtolower(strlen($c) === 3 ? $c[0] . $c[0] . $c[1] . $c[1] . $c[2] . $c[2] : $c); if (!in_array($c, ['ffffff', '000000'], true)) $colors['#' . $c] = ($colors['#' . $c] ?? 0) + 1; }
arsort($colors);
foreach ($xp->query('//script|//style|//noscript') as $n) $n->parentNode->removeChild($n);
$parts = []; foreach ($xp->query('//body//text()') as $tn) { $t = trim($tn->nodeValue); if ($t !== '') $parts[] = $t; }
$text = $clip(implode(' ', $parts), 1500);
$og = $meta('og:image');

json_out(['ok' => true, 'scan' => [
    'url' => $final, 'at' => date('c'), 'title' => $title, 'description' => $clip($meta('description') ?: $meta('og:description'), 300),
    'headings' => $headings, 'ctas' => $ctas, 'fonts' => array_slice(array_keys($fonts), 0, 4), 'colors' => array_slice(array_keys($colors), 0, 6),
    'themeColor' => $meta('theme-color'), 'ogImage' => $og ? abs_url($og, $final) : '', 'textSample' => $text,
]]);
