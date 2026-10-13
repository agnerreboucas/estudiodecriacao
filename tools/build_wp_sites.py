#!/usr/bin/env python3
"""Pacote de WordPress do Estúdio de Sites: wordpress/estudio-de-sites-wordpress-<versão>.zip
   1-TEMA/estudio-de-sites-tema.zip (tema com instalador; leva o plugin dentro) + 2-PLUGIN/estudio-de-sites-plugin.zip + LEIA-ME.
   Antes roda tools/build_sites_module.py (o app vem de export/ampliacao-sites-modulo/)."""
import os, re, shutil, zipfile, subprocess
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); W = os.path.join(R, 'wordpress'); B = os.path.join(W, '_build_sites')
subprocess.check_call(['python3', os.path.join(R, 'tools', 'build_sites_module.py')], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
MOD = os.path.join(R, 'export', 'ampliacao-sites-modulo'); SRC = os.path.join(W, 'sites-plugin-src')
VER = re.search(r'Version:\s*([\d.]+)', open(os.path.join(SRC, 'estudio-de-sites.php'), encoding='utf-8').read()).group(1)
shutil.rmtree(B, ignore_errors=True); P = B + '/plugin/estudio-de-sites'; os.makedirs(P + '/app')
shutil.copy(SRC + '/estudio-de-sites.php', P); shutil.copytree(SRC + '/assets', P + '/assets')
shutil.copy(SRC + '/app-index.php', P + '/app/index.php')
for f in ('app.html', 'briefing.html'): shutil.copy(MOD + '/' + f, P + '/app/' + f)
for d in ('css', 'js', 'fonts'): shutil.copytree(MOD + '/' + d, P + '/app/' + d)
shutil.copytree(MOD + '/api', P + '/app/api', ignore=shutil.ignore_patterns('config.php', 'data'))
shutil.copy(SRC + '/api-wp-bridge.php', P + '/app/api/wp-bridge.php')
open(P + '/readme.txt', 'w', encoding='utf-8').write('=== Estúdio de Sites ===\nRequires PHP: 8.0\nStable tag: %s\n\nEstúdio para criar sites de clientes dentro do WordPress.\n' % VER)
lib = P + '/app/api/_lib.php'; s = open(lib, encoding='utf-8').read()
a = "$GLOBALS['CFG'] = is_file(__DIR__ . '/config.php') ? (require __DIR__ . '/config.php') : [];"; assert a in s
s = s.replace(a, """require_once __DIR__ . '/wp-bridge.php';
/* Modo WordPress: config.php e dados ficam em uploads (sobrevivem a atualizações do plugin) */
$GLOBALS['CFG'] = [];
if (defined('AMPLIA_WP')) { $__dd = amp_wp_data_dir(); $__cf = is_file($__dd . '/config.php') ? (require $__dd . '/config.php') : []; $GLOBALS['CFG'] = (is_array($__cf) ? $__cf : []) + ['DATA_DIR' => $__dd]; if (empty($GLOBALS['CFG']['LEADS_TOKEN']) && ($__t = get_option('amplia_studio_leads_token'))) $GLOBALS['CFG']['LEADS_TOKEN'] = (string) $__t; }
elseif (is_file(__DIR__ . '/config.php')) $GLOBALS['CFG'] = (require __DIR__ . '/config.php');""")
b = "function auth_required(): bool { "; assert b in s; s = s.replace(b, b + "if (defined('AMPLIA_WP')) return true; ", 1)
c = "function logged_in(): bool {"; assert c in s; s = s.replace(c, c + " if (defined('AMPLIA_WP')) return amp_wp_can();", 1)
open(lib, 'w', encoding='utf-8').write(s)
au = P + '/app/api/auth.php'; t = open(au, encoding='utf-8').read(); k = "require __DIR__ . '/_lib.php';"; assert k in t
t = t.replace(k, k + "\nif (defined('AMPLIA_WP')) json_out(['ok' => amp_wp_can()], amp_wp_can() ? 200 : 401);   // no WordPress o login é o do WP", 1); open(au, 'w', encoding='utf-8').write(t)
def lint(d):
    for root, _, fs in os.walk(d):
        for f in fs:
            if f.endswith('.php'):
                r = subprocess.run(['php', '-l', os.path.join(root, f)], capture_output=True, text=True)
                if r.returncode: raise SystemExit(r.stdout + r.stderr)
lint(P)
def zipdir(src, dst, top):
    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, _, fs in os.walk(src):
            for f in sorted(fs): p = os.path.join(root, f); z.write(p, os.path.join(top, os.path.relpath(p, src)))
os.makedirs(B + '/pkg/2-PLUGIN'); os.makedirs(B + '/pkg/1-TEMA')
pz = B + '/pkg/2-PLUGIN/estudio-de-sites-plugin.zip'; zipdir(P, pz, 'estudio-de-sites')
# tema: a partir do tema base, com o instalador apontando para o plugin do Estúdio de Sites
T = B + '/tema'; shutil.copytree(W + '/theme-src', T)
def sub(path, pairs):
    t = open(path, encoding='utf-8').read()
    for x, y in pairs: t = t.replace(x, y)
    open(path, 'w', encoding='utf-8').write(t)
sub(T + '/style.css', [('Theme Name: Ampliação Studio', 'Theme Name: Estúdio de Sites'), ('plugin Ampliação Studio', 'plugin Estúdio de Sites'), ('ampliacao-studio-tema', 'estudio-de-sites-tema')])
sub(T + '/functions.php', [("'title' => 'Ampliação Studio'", "'title' => 'Estúdio de Sites'")])
ins = T + '/inc/installer.php'; t = open(ins, encoding='utf-8').read()
t = re.sub(r"\n\s*'area-do-cliente' => \[[^\n]*\],", '', t); t = re.sub(r"\n\s*if \(!empty\(\$made\['area-do-cliente'\]\)\)[^\n]*", '', t)
t = t.replace('Páginas base criadas: Início, Obrigado, Área do cliente e Política de privacidade.', 'Páginas base criadas: Início, Obrigado e Política de privacidade.')
t = t.replace('ampliacao-studio-plugin.zip', 'estudio-de-sites-plugin.zip').replace("ampt_plugin_file('ampliacao-studio')", "ampt_plugin_file('estudio-de-sites')").replace('page=ampliacao-studio', 'page=estudio-de-sites').replace('ampliacao-studio', 'estudio-de-sites').replace('Ampliação Studio', 'Estúdio de Sites').replace('Plugin do Estúdio de Sites', 'Plugin do Estúdio de Sites')
t = t.replace('Instalação do Studio', 'Instalação do Estúdio de Sites').replace('do Studio', 'do Estúdio').replace('Studio (plugin', 'Estúdio (plugin')
open(ins, 'w', encoding='utf-8').write(t); lint(T)
os.makedirs(T + '/bundled'); shutil.copy(pz, T + '/bundled/estudio-de-sites-plugin.zip')
zipdir(T, B + '/pkg/1-TEMA/estudio-de-sites-tema.zip', 'estudio-de-sites-tema')
shutil.copy(W + '/sites-docs/LEIA-ME.md', B + '/pkg/LEIA-ME-PRIMEIRO.md')
out = os.path.join(W, 'estudio-de-sites-wordpress-%s.zip' % VER)
if os.path.exists(out): os.remove(out)
zipdir(B + '/pkg', out, 'estudio-de-sites-wordpress')
shutil.copy(pz, os.path.join(W, 'estudio-de-sites-plugin.zip')); shutil.rmtree(B)
print('ok', out, round(os.path.getsize(out) / 1024), 'KB')
