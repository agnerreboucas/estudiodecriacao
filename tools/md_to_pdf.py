#!/usr/bin/env python3
"""Converte um .md em .html (estilo do projeto) e em .pdf (via Chromium). Uso: python3 tools/md_to_pdf.py entrada.md [rodape]"""
import sys, pathlib, subprocess, os, markdown
src = pathlib.Path(sys.argv[1]); foot = sys.argv[2] if len(sys.argv) > 2 else src.stem
import re
body = re.sub(r'\b(RF|O)-?([A-H]?\d+)\b', lambda m: m.group(0).replace('-', '&#8209;'), markdown.markdown(src.read_text(), extensions=['tables', 'sane_lists']))
css = """:root{--ink:#16181d;--mut:#5d6470;--line:#e3e5ea;--acc:#e8590c;--soft:#f6f6f3}*{box-sizing:border-box}body{font:13.5px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:var(--ink);margin:0}
.wrap{max-width:860px;margin:0 auto;padding:30px 24px}h1{font-size:30px;line-height:1.15;margin:0 0 10px;border-bottom:3px solid var(--ink);padding-bottom:10px}h2{font-size:19px;margin:28px 0 8px;padding-top:8px;border-top:1px solid var(--line)}h3{font-size:15px;margin:18px 0 4px}
p{margin:6px 0}ul,ol{margin:6px 0 10px;padding-left:22px}li{margin:3px 0}table{border-collapse:collapse;width:100%;margin:8px 0;font-size:12.5px}th,td{border:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}th{background:var(--soft)}
blockquote{border-left:4px solid var(--acc);background:#fff7f1;margin:10px 0;padding:6px 12px;border-radius:0 8px 8px 0}code{background:#f1f1ee;border-radius:4px;padding:1px 5px;font-size:12px}hr{border:0;border-top:1px solid var(--line);margin:18px 0}
@media print{.wrap{padding:0}h2{break-after:avoid}tr{break-inside:avoid}}"""
html = f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{src.stem}</title><style>{css}</style></head><body><div class="wrap">{body}</div></body></html>'
h = src.with_suffix('.html'); h.write_text(html)
js = pathlib.Path(__file__).resolve().parent / 'html2pdf.js'
tmp = pathlib.Path('/tmp') / ('h2p_' + src.stem + '.js'); tmp.write_text(js.read_text().replace('Ampliação Studio para WordPress', foot.replace("'", '')))
subprocess.run(['node', str(tmp), str(h), str(src.with_suffix('.pdf'))], check=True, env={**os.environ, 'NODE_PATH': subprocess.check_output(['npm', 'root', '-g']).decode().strip()})
print('ok', h, src.with_suffix('.pdf'))
