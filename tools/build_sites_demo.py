#!/usr/bin/env python3
"""Gera demo/estudio-de-sites-demo.html: o Estúdio de Sites em um único arquivo (CSS + JS embutidos), com dois clientes de exemplo.
Antes, rode python3 tools/build_sites_module.py (ele monta export/ampliacao-sites-modulo/)."""
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
mod = root / 'export' / 'ampliacao-sites-modulo'
html = (mod / 'app.html').read_text()
def css(m): return '<style>\n' + (mod / m.group(1).split('?')[0]).read_text() + '\n</style>'
html = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">', css, html)
def js(path): return '<script>\n' + (mod / path).read_text().replace('</script>', '<\\/script>') + '\n</script>'
def scripts(m): return js(m.group(1).split('?')[0])
html = re.sub(r'<script src="(js/[^"]+)"></script>', scripts, html)
seed = '<script>\n' + (root / 'tools' / 'sites-module' / 'demo-seed.js').read_text() + '\n</script>\n'
i = html.rindex('</body>')   # o último: há '</body>' dentro de textos de scripts
html = html[:i] + seed + html[i:]
html = html.replace('<title>Estúdio de Sites</title>', '<title>Estúdio de Sites — Demonstração</title>')
out = root / 'demo' / 'estudio-de-sites-demo.html'
out.write_text(html); print(out, round(len(html) / 1024), 'KB')
