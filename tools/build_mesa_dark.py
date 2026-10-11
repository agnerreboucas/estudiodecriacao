#!/usr/bin/env python3
"""Gera css/mesa-dark.css: o visual escuro da Mesa de páginas (usado pelo Estúdio de Sites).
Lê css/mesa.css (o visual claro, que continua igual no Studio) e escreve só as declarações de cor trocadas, todas sob `body.mz-dark`.
Regras do mapeamento: fundos claros viram cinzas escuros em camadas, fundos pretos (botões ativos) viram o laranja do Estúdio, texto é recalculado
pelo fundo, bordas viram linhas escuras. Depois do gerador, ajustes à mão ficam em css/mesa-dark-extra.css (não é apagado)."""
import re, colorsys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / 'css' / 'mesa.css').read_text()
ACC = (217, 72, 15)  # laranja do Estúdio
NAMED = {'white': '#ffffff', 'black': '#000000'}
HEX = re.compile(r'#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b')
RGB = re.compile(r'rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)')
def parse_color(tok):
    t = tok.strip().lower()
    if t in NAMED: t = NAMED[t]
    m = HEX.fullmatch(t)
    if m:
        h = m.group(1)
        if len(h) == 3: h = ''.join(c * 2 for c in h)
        return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), (int(h[6:8], 16) / 255 if len(h) == 8 else 1.0))
    m = RGB.fullmatch(t)
    if m: return (float(m.group(1)), float(m.group(2)), float(m.group(3)), float(m.group(4)) if m.group(4) else 1.0)
    return None
def hls(c): return colorsys.rgb_to_hls(c[0] / 255, c[1] / 255, c[2] / 255)
def fmt(r, g, b, a):
    r, g, b = [max(0, min(255, round(x))) for x in (r, g, b)]
    return '#%02x%02x%02x' % (r, g, b) if a >= 0.995 else 'rgba(%d,%d,%d,%.2f)' % (r, g, b, a)
def from_hls(h, l, s, a):
    r, g, b = colorsys.hls_to_rgb(h, max(0, min(1, l)), max(0, min(1, s))); return fmt(r * 255, g * 255, b * 255, a)
def map_bg(c):
    h, l, s = hls(c); a = c[3]
    if a < 0.05: return None
    if a < 0.95 and l < 0.22: return fmt(0, 0, 0, a)                     # fundo escuro translúcido (cortina de janela): continua preto
    if l < 0.22 and s < 0.35: return fmt(*ACC, a)                       # preto/escuro neutro: vira o laranja do Estúdio
    if l >= 0.85: return from_hls(h, max(0.09, 0.235 - (1 - l) * 0.95), min(s, 0.35) if s > 0.15 else s * 0.4, a)   # claro: cinza escuro em camadas
    if l < 0.35: return from_hls(h, 0.2, s, a)
    return None                                                          # tons médios (azul, verde, dourado): mantém
def map_text(c, bg_new):
    h, l, s = hls(c); a = c[3]
    if s > 0.45 and 0.3 < l < 0.7: return None                           # cor de destaque: mantém
    if bg_new is not None:
        bn = parse_color(bg_new); bl = hls(bn)[1] if bn else 0.2
        if bl < 0.55: return '#f1f1f1' if l > 0.75 or l < 0.3 else '#b9b9b9'
        return '#111111' if l < 0.5 else '#ffffff'
    if l > 0.9: return from_hls(h, 0.1, s, a)
    if l < 0.3: return from_hls(h, 0.9, s * 0.5, a)
    return from_hls(h, max(0.6, 1 - l + 0.1), s, a)                      # cinzas médios: texto discreto legível no escuro
def map_border(c):
    h, l, s = hls(c); a = c[3]
    if a < 0.05: return None
    if l >= 0.9: return '#1f1f1f'
    if l >= 0.68: return '#555555'
    if l < 0.3: return from_hls(h, 0.85, s, a)
    return None
def map_value(prop, val, bg_new):
    kind = 'bg' if prop.startswith('background') else 'border' if (prop.startswith('border') or prop == 'outline') else 'text' if prop in ('color', 'fill', 'stroke', 'caret-color') else None
    if kind is None: return None
    changed = [False]
    def sub(m):
        c = parse_color(m.group(0))
        if not c: return m.group(0)
        n = map_bg(c) if kind == 'bg' else map_border(c) if kind == 'border' else map_text(c, bg_new)
        if n is None: return m.group(0)
        changed[0] = True; return n
    out = re.sub(r'#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\bwhite\b|\bblack\b', sub, val)
    return out if changed[0] else None
def parse_blocks(css, i=0, depth=0):
    out = []; n = len(css)
    while i < n:
        while i < n and css[i] in ' \n\t\r': i += 1
        if i >= n or css[i] == '}': return out, i + 1
        if css.startswith('/*', i): i = css.index('*/', i) + 2; continue
        j = css.index('{', i); head = css[i:j].strip()
        if head.startswith('@media') or head.startswith('@supports'):
            kids, k = parse_blocks(css, j + 1, depth + 1); out.append(('at', head, kids)); i = k
        else:
            k = j + 1; d = 1
            while d:
                if css[k] == '{': d += 1
                elif css[k] == '}': d -= 1
                k += 1
            out.append(('rule', head, css[j + 1:k - 1])); i = k
    return out, i
def decls(body):
    parts, cur, par = [], '', 0
    for ch in body:
        if ch == '(': par += 1
        if ch == ')': par -= 1
        if ch == ';' and par == 0: parts.append(cur); cur = ''
        else: cur += ch
    if cur.strip(): parts.append(cur)
    res = []
    for p in parts:
        if ':' in p: k, v = p.split(':', 1); res.append((k.strip().lower(), v.strip()))
    return res
def prefix(sel):
    out = []
    for s in [x.strip() for x in sel.split(',') if x.strip()]:
        if s.startswith(('body', 'html', '@', ':root')): continue
        out.append('body.mz-dark ' + s)
    return ','.join(out)
def transform(blocks):
    res = []
    for b in blocks:
        if b[0] == 'at':
            inner = transform(b[2])
            if inner: res.append(b[1] + '{' + ''.join(inner) + '}')
            continue
        sel = prefix(b[1])
        if not sel: continue
        ds = decls(b[2]); new = []; bg_new = None
        for k, v in ds:
            if k.startswith('background'):
                m = map_value(k, v, None)
                if m is not None:
                    new.append((k, m)); mm = re.search(r'#[0-9a-fA-F]{6}\b|rgba?\([^)]*\)', m)
                    if mm and k in ('background', 'background-color'): bg_new = mm.group(0)
        for k, v in ds:
            if k.startswith('background'): continue
            m = map_value(k, v, bg_new)
            if m is not None: new.append((k, m))
        if new: res.append(sel + '{' + ';'.join('%s:%s' % kv for kv in new) + '}\n')
    return res
blocks, _ = parse_blocks(src)
css = '/* GERADO por tools/build_mesa_dark.py a partir de css/mesa.css. Não edite: ajustes à mão vão em mesa-dark-extra.css */\n' + ''.join(transform(blocks))
(root / 'css' / 'mesa-dark.css').write_text(css)
print('css/mesa-dark.css', round(len(css) / 1024), 'KB')
