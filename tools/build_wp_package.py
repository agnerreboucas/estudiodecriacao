#!/usr/bin/env python3
"""Pacote completo para venda/instalação: wordpress/ampliacao-studio-pacote.zip
   tema (com instalador e o plugin dentro) + plugin + documentação (PDF, HTML, MD) + licença."""
import os, re, shutil, subprocess, zipfile, html
import markdown
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); W = os.path.join(R, 'wordpress'); B = os.path.join(W, '_build')
subprocess.check_call(['python3', os.path.join(R, 'tools', 'build_wp_plugin.py')])
VER = re.search(r'Version:\s*([\d.]+)', open(os.path.join(W, 'plugin-src', 'ampliacao-studio.php'), encoding='utf-8').read()).group(1)
shutil.rmtree(B, ignore_errors=True); os.makedirs(B + '/1-TEMA'); os.makedirs(B + '/2-PLUGINS'); os.makedirs(B + '/3-DOCUMENTACAO')
plugin_zip = os.path.join(W, 'ampliacao-studio-plugin.zip'); shutil.copy(plugin_zip, B + '/2-PLUGINS/')
def zipdir(src, dst, top, extra=()):
    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, _, fs in os.walk(src):
            for f in sorted(fs): p = os.path.join(root, f); z.write(p, os.path.join(top, os.path.relpath(p, src)))
        for path, arc in extra: z.write(path, os.path.join(top, arc))
for root, _, fs in os.walk(os.path.join(W, 'theme-src')):
    for f in fs:
        if f.endswith('.php'):
            r = subprocess.run(['php', '-l', os.path.join(root, f)], capture_output=True, text=True)
            if r.returncode: raise SystemExit(r.stdout + r.stderr)
zipdir(os.path.join(W, 'theme-src'), B + '/1-TEMA/ampliacao-studio-tema.zip', 'ampliacao-studio-tema', [(plugin_zip, 'bundled/ampliacao-studio-plugin.zip')])
# documentação
docs = sorted(f for f in os.listdir(W + '/docs-src') if f.endswith('.md'))
css = "body{font:14px/1.6 -apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:820px;margin:0 auto;padding:24px;color:#111}h1{font-size:26px;border-bottom:2px solid #111;padding-bottom:6px}section{page-break-before:always}h2{font-size:18px;margin-top:26px}table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #bbb;padding:6px 9px;text-align:left;vertical-align:top}th{background:#eee}code{background:#f1f1f1;padding:1px 5px;border-radius:4px;font-size:12.5px}blockquote{border-left:4px solid #d98c00;background:#fff6dd;margin:12px 0;padding:6px 14px}nav li{margin:2px 0}"
parts, toc = [], []
for i, f in enumerate(docs):
    t = open(W + '/docs-src/' + f, encoding='utf-8').read(); title = re.match(r'# (.+)', t).group(1)
    toc.append(f'<li><a href="#d{i}">{html.escape(title)}</a></li>')
    parts.append(f'<section id="d{i}">' + markdown.markdown(t, extensions=['tables']) + '</section>')
page = f'<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Ampliação Studio para WordPress — Documentação</title><style>{css}</style><body><h1>Ampliação Studio para WordPress<br><small style="font-weight:400">Documentação · versão {VER}</small></h1><nav><h2>Conteúdo</h2><ol>{"".join(toc)}</ol></nav>{"".join(parts)}</body></html>'
page = page.replace('<h1>', '<h1>')
hp = B + '/3-DOCUMENTACAO/Documentacao.html'; open(hp, 'w', encoding='utf-8').write(page)
env = dict(os.environ); env['NODE_PATH'] = subprocess.check_output(['npm', 'root', '-g'], text=True).strip()
subprocess.check_call(['node', os.path.join(R, 'tools', 'html2pdf.js'), hp, B + '/3-DOCUMENTACAO/Documentacao.pdf'], env=env)
os.makedirs(B + '/3-DOCUMENTACAO/texto')
for f in docs: shutil.copy(W + '/docs-src/' + f, B + '/3-DOCUMENTACAO/texto/')
shutil.copy(W + '/LICENCA.md', B); shutil.copy(W + '/CHANGELOG.md', B); shutil.copy(R + '/THIRD_PARTY.md', B)
open(B + '/LEIA-ME-PRIMEIRO.txt', 'w', encoding='utf-8').write("AMPLIAÇÃO STUDIO PARA WORDPRESS "+VER+"\n\n1) Abra 3-DOCUMENTACAO/Documentacao.pdf\n2) No WordPress: Aparência > Temas > Adicionar novo > Enviar tema > 1-TEMA/ampliacao-studio-tema.zip > Ativar\n3) Siga o instalador (Aparência > Instalação do Studio).\n\nO plugin separado está em 2-PLUGINS (só para instalação manual).\nLicença (modelo para revisão): LICENCA.md\n")
out = os.path.join(W, f'ampliacao-studio-pacote-{VER}.zip')
zipdir(B, out, 'ampliacao-studio-pacote')
shutil.rmtree(B)
print('ok', out, round(os.path.getsize(out) / 1024), 'KB')
