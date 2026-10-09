#!/usr/bin/env python3
"""Monta o plugin de WordPress: wordpress/ampliacao-studio/ + wordpress/ampliacao-studio-plugin.zip"""
import os, re, shutil, zipfile, subprocess
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(R, 'wordpress', 'plugin-src'); OUT = os.path.join(R, 'wordpress', 'ampliacao-studio')
shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT + '/app')
for f in ('ampliacao-studio.php', 'readme.txt'): shutil.copy(os.path.join(SRC, f), OUT)
shutil.copytree(os.path.join(SRC, 'assets'), OUT + '/assets')
shutil.copy(os.path.join(SRC, 'app-index.php'), OUT + '/app/index.php')
shutil.copy(os.path.join(SRC, 'app-entrar.php'), OUT + '/app/entrar.php')
for f in ('index.html', 'cliente.html', 'briefing.html', 'aprovacao.html', 'entrar.html'): shutil.copy(os.path.join(R, f), OUT + '/app/' + f)
for d in ('css', 'js', 'fonts', 'vendor', 'assets'):
    if os.path.isdir(os.path.join(R, d)): shutil.copytree(os.path.join(R, d), OUT + '/app/' + d)
shutil.copytree(os.path.join(R, 'api'), OUT + '/app/api', ignore=shutil.ignore_patterns('config.php', 'data'))
shutil.copy(os.path.join(SRC, 'api-wp-bridge.php'), OUT + '/app/api/wp-bridge.php')
lib = OUT + '/app/api/_lib.php'; s = open(lib, encoding='utf-8').read()
a = "$GLOBALS['CFG'] = is_file(__DIR__ . '/config.php') ? (require __DIR__ . '/config.php') : [];"
assert a in s
s = s.replace(a, """require_once __DIR__ . '/wp-bridge.php';
/* Modo WordPress: config.php e dados ficam na pasta de dados em uploads (sobrevivem a atualizações do plugin) */
$GLOBALS['CFG'] = [];
if (defined('AMPLIA_WP')) { $__dd = amp_wp_data_dir(); $__cf = is_file($__dd . '/config.php') ? (require $__dd . '/config.php') : []; $GLOBALS['CFG'] = (is_array($__cf) ? $__cf : []) + ['DATA_DIR' => $__dd]; }
elseif (is_file(__DIR__ . '/config.php')) $GLOBALS['CFG'] = (require __DIR__ . '/config.php');""")
b = "function auth_required(): bool { return"; assert b in s
s = s.replace(b, "function auth_required(): bool { if (defined('AMPLIA_WP')) return true; return")
c = "function logged_in(): bool { if (!auth_required()) return true;"; assert c in s
s = s.replace(c, "function logged_in(): bool { if (defined('AMPLIA_WP')) return amp_wp_can(); if (!auth_required()) return true;")
open(lib, 'w', encoding='utf-8').write(s)
s = open(lib, encoding='utf-8').read()
d = "elseif (is_file(__DIR__ . '/config.php')) $GLOBALS['CFG'] = (require __DIR__ . '/config.php');"
assert d in s
s = s.replace(d, d + "\nif (defined('AMPLIA_WP') && empty($GLOBALS['CFG']['LEADS_TOKEN'])) { $__t = get_option('amplia_studio_leads_token'); if ($__t) $GLOBALS['CFG']['LEADS_TOKEN'] = (string) $__t; }")
open(lib, 'w', encoding='utf-8').write(s)
au = OUT + '/app/api/auth.php'; t = open(au, encoding='utf-8').read()
t = t.replace("require __DIR__ . '/_lib.php';", "require __DIR__ . '/_lib.php';\nif (defined('AMPLIA_WP')) json_out(['ok' => amp_wp_can()], amp_wp_can() ? 200 : 401);   // no WordPress o login é o do WP", 1)
open(au, 'w', encoding='utf-8').write(t)
for root, _, fs in os.walk(OUT):
    for f in fs:
        if f.endswith('.php'):
            r = subprocess.run(['php', '-l', os.path.join(root, f)], capture_output=True, text=True)
            if r.returncode: raise SystemExit(r.stdout + r.stderr)
z = os.path.join(R, 'wordpress', 'ampliacao-studio-plugin.zip')
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, _, fs in os.walk(OUT):
        for f in sorted(fs):
            p = os.path.join(root, f); zf.write(p, os.path.join('ampliacao-studio', os.path.relpath(p, OUT)))
print('ok', z, round(os.path.getsize(z) / 1024), 'KB')
