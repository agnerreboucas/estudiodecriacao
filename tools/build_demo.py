#!/usr/bin/env python3
"""Gera demo/ampliacao-studio-demo.html: um único arquivo (CSS + JS embutidos) com dados fictícios."""
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text()
def css(m): return '<style>\n' + (root / m.group(1).split('?')[0]).read_text() + '\n</style>'
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css, html)
def js(path): return '<script>\n' + (root / path).read_text().replace('</script>', '<\\/script>') + '\n</script>'
def scripts(m):
    path = m.group(1).split('?')[0]
    out = ''
    if path == 'js/util.js': out += '<script>window.DEMO_MODE=true</script>\n'
    if path == 'js/app.js': out += js('demo/demo.js') + '\n'
    # Social Hub: o app (socialhub/index.html) vai embutido como texto, para a demo de arquivo único abrir o iframe sem servidor
    if path == 'js/socialhub.js' and (root / 'socialhub' / 'index.html').exists(): out += '<script>window.SOCIALHUB_TEMPLATE=' + __import__('json').dumps((root / 'socialhub' / 'index.html').read_text()).replace('</', '<\\/') + ';</script>\n'
    return out + js(path)
html = re.sub(r'<script src="([^"]+)"></script>', scripts, html)
html = html.replace('<title>Ampliação Studio — Creative Workspace</title>', '<title>Ampliação Studio — Demonstração</title>')
out = root / 'demo' / 'ampliacao-studio-demo.html'
out.write_text(html); print(out, round(len(html) / 1024), 'KB')
