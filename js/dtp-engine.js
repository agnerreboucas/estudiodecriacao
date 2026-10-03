/* ===== Diagramação · motor (unidades, documento, fluxo de texto em colunas, desenho de página) =====
   Tudo é guardado em pontos (pt). Unidades de exibição: mm, cm, in, pt, px. */
const DTP_U = {mm: 72 / 25.4, cm: 72 / 2.54, in: 72, pt: 1, px: 0.75};
const DTP_UL = {mm: 'mm', cm: 'cm', in: 'pol', pt: 'pt', px: 'px'};
const dtpToPt = (v, u) => (+v || 0) * (DTP_U[u] || 1);
const dtpFmt = (pt, u) => String(+((+pt || 0) / (DTP_U[u] || 1)).toFixed({mm: 2, cm: 3, in: 3, pt: 1, px: 0}[u] ?? 2));
const dtpMM = v => v * 72 / 25.4;
const DTP_PRESETS = [
  {id: 'livro14', n: 'Livro 14 × 21 cm', w: 140, h: 210, m: {t: 18, b: 22, i: 20, o: 14}, cols: 1, facing: true, bleed: 3},
  {id: 'livro16', n: 'Livro 16 × 23 cm', w: 160, h: 230, m: {t: 20, b: 24, i: 22, o: 16}, cols: 1, facing: true, bleed: 3},
  {id: 'bolso', n: 'Livro de bolso 11 × 18 cm', w: 110, h: 180, m: {t: 14, b: 18, i: 16, o: 11}, cols: 1, facing: true, bleed: 3},
  {id: 'a4', n: 'Revista A4 (3 colunas)', w: 210, h: 297, m: {t: 15, b: 18, i: 15, o: 12}, cols: 3, facing: true, bleed: 3},
  {id: 'rev21', n: 'Revista 21 × 28 cm (2 colunas)', w: 210, h: 280, m: {t: 15, b: 18, i: 15, o: 12}, cols: 2, facing: true, bleed: 3},
  {id: 'a5', n: 'A5 (148 × 210 mm)', w: 148, h: 210, m: {t: 12, b: 14, i: 12, o: 12}, cols: 1, facing: false, bleed: 3},
  {id: 'folheto', n: 'Folheto A4', w: 210, h: 297, m: {t: 12, b: 12, i: 12, o: 12}, cols: 2, facing: false, bleed: 3},
  {id: 'dl', n: 'Folheto DL (99 × 210 mm)', w: 99, h: 210, m: {t: 8, b: 8, i: 8, o: 8}, cols: 1, facing: false, bleed: 3},
  {id: 'flyer', n: 'Flyer A5 (frente e verso)', w: 148, h: 210, m: {t: 10, b: 10, i: 10, o: 10}, cols: 1, facing: false, bleed: 3, pages: 2},
  {id: 'cartaz', n: 'Cartaz A3', w: 297, h: 420, m: {t: 15, b: 15, i: 15, o: 15}, cols: 1, facing: false, bleed: 3},
  {id: 'quadrado', n: 'Quadrado 210 × 210 mm', w: 210, h: 210, m: {t: 14, b: 14, i: 14, o: 14}, cols: 2, facing: false, bleed: 3},
  {id: 'custom', n: 'Personalizado', w: 150, h: 210, m: {t: 15, b: 15, i: 15, o: 15}, cols: 1, facing: false, bleed: 3}
];
const DTP_STYLE_KEYS = ['body', 'h1', 'h2', 'h3', 'quote', 'caption'];
function dtpDefaultStyles(head, body, color, accent) {
  const S = (n, font, size, lead, o) => Object.assign({n, font, size, lead, color, align: 'left', b: 0, i: 0, caps: 0, before: 0, after: 0, indent: 0, drop: 0, keep: 0}, o || {});
  return {
    body: S('Corpo', body, 10, 14.5, {align: 'justify', after: 0, indent: 12}),
    h1: S('Título 1', head, 30, 34, {b: 1, before: 0, after: 18, keep: 1, color: accent, align: 'left', indent: 0}),
    h2: S('Título 2', head, 18, 22, {b: 1, before: 16, after: 8, keep: 1, align: 'left', indent: 0}),
    h3: S('Título 3', body, 11, 15, {b: 1, caps: 1, before: 10, after: 4, keep: 1, color: accent, align: 'left', indent: 0}),
    quote: S('Citação', head, 13, 19, {i: 1, before: 10, after: 10, color: accent, align: 'left', indent: 0}),
    caption: S('Legenda', body, 8, 11, {i: 1, before: 3, after: 0, align: 'left', indent: 0})
  };
}
function dtpNew(presetId, name, unit) {
  const P = DTP_PRESETS.find(x => x.id === presetId) || DTP_PRESETS[0], mm = dtpMM;
  return {
    id: uid('dtp'), name: name || P.n, created: new Date().toISOString(), unit: unit || 'mm',
    page: {w: mm(P.w), h: mm(P.h)}, facing: !!P.facing, bleed: mm(P.bleed), margins: {t: mm(P.m.t), b: mm(P.m.b), i: mm(P.m.i), o: mm(P.m.o)},
    cols: P.cols, gutter: mm(5), baseline: 0, nPages: P.pages || 1, autoflow: true, paper: '#FFFFFF',
    run: {folio: P.facing || P.id === 'a5', pos: 'outer', header: '', headerR: '', size: 8, color: '#777777', font: 'Inter'},
    styles: dtpDefaultStyles('Playfair Display', 'Lora', '#2B2B2B', '#8A5A2B'),
    story: [], pages: [{items: []}], guides: {v: [], h: []}
  };
}
const dtpPageCount = (doc, flow) => Math.max(1, doc.nPages || 1, flow ? flow.pages.length : 0);

/* ---- geometria da página (margens internas/externas em páginas opostas) ---- */
function dtpGeom(doc, pi) {
  const W = doc.page.w, H = doc.page.h, m = doc.margins, n = Math.max(1, doc.cols | 0), gut = doc.gutter, recto = !doc.facing || (pi + 1) % 2 === 1;
  const L = doc.facing ? (recto ? m.i : m.o) : m.i, R = doc.facing ? (recto ? m.o : m.i) : m.o;
  const cw = Math.max(10, (W - L - R - (n - 1) * gut) / n);
  return {W, H, x0: L, x1: W - R, y0: m.t, y1: H - m.b, n, gut, cw, recto, colX: k => L + k * (cw + gut)};
}

/* ---- texto: marcação **negrito** e *itálico*, palavras e medição ---- */
let DTP_MC = null;
const dtpMeasureCtx = () => DTP_MC || (DTP_MC = document.createElement('canvas').getContext('2d'));
const dtpFontStr = (family, size, b, i) => `${i ? 'italic ' : ''}${b ? '700' : '400'} ${size}px "${family}", Georgia, serif`;
const DTP_WCACHE = new Map();
function dtpTextW(t, family, size, b, i) {
  const k = family + '|' + size + '|' + b + '|' + i + '|' + t, c = DTP_WCACHE.get(k); if (c != null) return c;
  const x = dtpMeasureCtx(); x.font = dtpFontStr(family, size, b, i); const w = x.measureText(t).width;
  if (DTP_WCACHE.size > 60000) DTP_WCACHE.clear(); DTP_WCACHE.set(k, w); return w;
}
function dtpWords(text, st) {
  const words = []; let cur = null, b = !!st.b, i = !!st.i;
  const T = String(text || '');
  const push = (ch) => { if (!cur) { cur = {parts: []}; words.push(cur); } const lp = cur.parts[cur.parts.length - 1]; if (lp && lp.b === b && lp.i === i) lp.t += ch; else cur.parts.push({t: ch, b, i}); };
  for (let k = 0; k < T.length; k++) {
    const ch = T[k];
    if (ch === '*' && T[k + 1] === '*') { b = !b; k++; continue; }
    if (ch === '*') { i = !i; continue; }
    if (/\s/.test(ch)) { cur = null; continue; }
    push(st.caps ? ch.toUpperCase() : ch);
  }
  return words;
}
const dtpWordW = (w, st, size) => { if (w.w != null && w.sz === size && w.f === st.font) return w.w; w.w = w.parts.reduce((a, p) => a + dtpTextW(p.t, st.font, size, p.b, p.i), 0); w.sz = size; w.f = st.font; return w.w; };
const dtpPlain = t => String(t || '').replace(/\*\*|\*/g, '');

/* palavra mais larga que a coluna: divide em duas partes (sem hífen) para não vazar */
function dtpSplitWord(wd, st, size, avail) {
  let acc = 0;
  for (let pi = 0; pi < wd.parts.length; pi++) { const p = wd.parts[pi];
    for (let ci = 1; ci <= p.t.length; ci++) { const wchunk = dtpTextW(p.t.slice(0, ci), st.font, size, p.b, p.i);
      if (acc + wchunk > avail) { const cut = (pi === 0 && ci === 1) ? 1 : ci - 1; const cutAt = (pi === 0 && ci === 1) ? 1 : cut; const head = wd.parts.slice(0, pi).concat(cutAt ? [{t: p.t.slice(0, cutAt), b: p.b, i: p.i}] : []), tail = (cutAt < p.t.length ? [{t: p.t.slice(cutAt), b: p.b, i: p.i}] : []).concat(wd.parts.slice(pi + 1)); if (!head.length || !tail.length) return null; return [{parts: head}, {parts: tail}]; } }
    acc += dtpTextW(p.t, st.font, size, p.b, p.i); }
  return null;
}

/* ---- faixas livres de uma coluna descontando quadros com contorno de texto ---- */
function dtpFree(cx0, cx1, ya, yb, exs) {
  let iv = [[cx0, cx1]];
  for (const e of exs) {
    if (e.wrap === 'none') continue;
    const o = e.off || 0, ey0 = e.y - o, ey1 = e.y + e.h + o;
    if (yb <= ey0 + 0.01 || ya >= ey1 - 0.01) continue;
    if (e.wrap === 'jump') { if (e.x - o < cx1 && e.x + e.w + o > cx0) return {jump: ey1}; continue; }
    const ex0 = e.x - o, ex1 = e.x + e.w + o, nx = [];
    for (const [a, b] of iv) { if (ex1 <= a || ex0 >= b) { nx.push([a, b]); continue; } if (ex0 > a) nx.push([a, ex0]); if (ex1 < b) nx.push([ex1, b]); }
    iv = nx;
  }
  return iv;
}
function dtpBest(iv, minW) { let best = null; for (const [a, b] of iv) if (b - a >= minW && (!best || b - a > best[1] - best[0] + 0.01)) best = [a, b]; return best; }

/* ---- fluxo da matéria pelas colunas e páginas ---- */
function dtpFlow(doc) {
  const out = {pages: [], overset: null, warns: []}, story = doc.story, S = doc.styles, base = doc.baseline || 0;
  const maxPages = doc.autoflow ? 400 : Math.max(1, doc.nPages || 1);
  const pg = i => { while (out.pages.length <= i) out.pages.push({lines: [], blocks: [], band: 0}); return out.pages[i]; };
  const items = i => ((doc.pages[i] && doc.pages[i].items) || []).filter(it => it.k === 'img' || it.k === 'rect' || it.k === 'text').map(it => ({x: it.x, y: it.y, w: it.w, h: it.h, off: it.off != null ? it.off : 6, wrap: it.wrap || 'none'}));
  const bandOf = i => (out.pages[i] ? out.pages[i].band : 0);
  const colTop = i => dtpGeom(doc, i).y0 + bandOf(i);
  const snap = (y, i) => base > 0 ? dtpGeom(doc, i).y0 + Math.ceil((y - dtpGeom(doc, i).y0) / base - 1e-6) * base : y;
  let cur = {pi: 0, col: 0, y: colTop(0)}, stop = false, guard = 0;
  const advance = c => { const g = dtpGeom(doc, c.pi); if (c.col + 1 < g.n) { c.col++; c.y = colTop(c.pi); return true; } if (c.pi + 1 >= maxPages) return false; c.pi++; c.col = 0; c.y = colTop(c.pi); return true; };
  const atTop = c => Math.abs(c.y - colTop(c.pi)) < 0.01;
  const lineBox = (c, lead, indentMin) => {
    const g = dtpGeom(doc, c.pi); let y = c.y;
    for (let t = 0; t < 400; t++) {
      if (y + lead > g.y1 + 0.01) return null;
      const iv = dtpFree(g.colX(c.col), g.colX(c.col) + g.cw, y, y + lead, items(c.pi));
      if (iv.jump) { y = snap(iv.jump, c.pi); continue; }
      const b = dtpBest(iv, Math.min(g.cw, 4 * (indentMin || 8)));
      if (b) { c.y = y; return b; }
      y = snap(y + (base || lead), c.pi);
    }
    return null;
  };
  /* uma tentativa de posicionar um parágrafo; devolve linhas e o novo cursor, sem alterar o estado global */
  function place(sidx, par, st, c0, caps, noOrphan) {
    const c = {pi: c0.pi, col: c0.col, y: c0.y}, words = dtpWords(par.t, st), size = st.size, lead = base > 0 ? Math.max(base, Math.round(st.lead / base) * base) : st.lead, lines = [], frags = [];
    if (!words.length) return {lines, c, frags, empty: true};
    if (!atTop(c)) c.y += st.before; if (base > 0) c.y = snap(c.y, c.pi);
    const prev = story[sidx - 1], first = !prev || prev.k !== 'p' || (S[prev.st] || S.body).keep || prev.st !== par.st, dropN = first ? st.drop : 0, ind0 = first ? 0 : st.indent;
    const spW = dtpTextW(' ', st.font, size, st.b, st.i);
    const capSize = dropN > 1 ? ((dropN - 1) * lead + 0.72 * size) / 0.72 : 0;
    let k = 0, li = 0, fl = 0, guardN = 0, fi = 0, capCh = '', capW = 0;
    if (dropN > 1 && words[0].parts[0].t.length) { capCh = words[0].parts[0].t[0]; capW = dtpTextW(capCh, st.font, capSize, true, false) + 3; words[0].parts[0] = Object.assign({}, words[0].parts[0], {t: words[0].parts[0].t.slice(1)}); if (!words[0].parts[0].t) { words[0].parts.shift(); if (!words[0].parts.length) { words.shift(); k = 0; } } words.forEach(w => { w.w = null; }); }
    frags.push(0);
    while (k < words.length) {
      if (++guardN > 3000) break;
      const cap = caps && caps[fi];
      if (cap && fl >= cap) { if (!advance(c)) return {lines, c, frags, over: k}; fi++; frags.push(0); fl = 0; continue; }
      const box = lineBox(c, lead, size);
      if (!box) { if (!advance(c)) return {lines, c, frags, over: k}; fi++; frags.push(0); fl = 0; continue; }
      const dropped = capW && li < dropN, ind = dropped ? capW : (li === 0 && !capW ? ind0 : 0), avail = box[1] - box[0] - ind;
      let w = 0, j = k;
      while (j < words.length) { const ww = dtpWordW(words[j], st, size), nw = w + (j > k ? spW : 0) + ww; if (nw > avail + 0.01 && j > k) break; w = nw; j++; }
      if (j - k === 1 && dtpWordW(words[k], st, size) > avail + 0.01) { const sw = dtpSplitWord(words[k], st, size, avail); if (sw) { words.splice(k, 1, sw[0], sw[1]); continue; } }
      const last = j >= words.length; let sp = spW;
      if (st.align === 'justify' && !last && j - k > 1) sp = (avail - (w - spW * (j - k - 1))) / (j - k - 1);
      let x0 = box[0] + ind; const wl = last || st.align !== 'justify' ? w : avail;
      if (st.align === 'center') x0 = box[0] + ind + (avail - w) / 2; else if (st.align === 'right') x0 = box[0] + ind + avail - w;
      const runs = []; let x = x0;
      for (let q = k; q < j; q++) { for (const p of words[q].parts) { runs.push({x, t: p.t, b: p.b, i: p.i}); x += dtpTextW(p.t, st.font, size, p.b, p.i); } x += sp; }
      lines.push({pi: c.pi, col: c.col, y: c.y, lead, size, runs, sidx, font: st.font, color: st.color, x0, x1: x0 + wl, drop: li === 0 && capCh ? {ch: capCh, size: capSize, x: box[0], by: c.y + (dropN - 1) * lead + (lead - size) / 2 + size * 0.8, color: st.color} : null});
      c.y += lead; k = j; li++; fl++; frags[fi] = fl;
    }
    c.y += st.after; if (base > 0) c.y = snap(c.y, c.pi);
    return {lines, c, frags};
  }
  const commit = (res) => { for (const l of res.lines) pg(l.pi).lines.push(l); };
  const wordsLeft = (from, k) => { let n = 0; for (let q = from; q < story.length; q++) if (story[q].k === 'p') n += dtpPlain(story[q].t).split(/\s+/).filter(Boolean).length; return n; };
  for (let sidx = 0; sidx < story.length && !stop; sidx++) {
    const it = story[sidx]; pg(cur.pi);
    if (it.k === 'break') { if (!atTop(cur) || cur.col) { const c = {pi: cur.pi + 1, col: 0}; if (cur.pi + 1 >= maxPages) { out.overset = {sidx: sidx + 1, words: wordsLeft(sidx + 1)}; break; } cur.pi = c.pi; cur.col = 0; cur.y = colTop(cur.pi); } continue; }
    if (it.k === 'colbreak') { if (!advance(cur)) { out.overset = {sidx: sidx + 1, words: wordsLeft(sidx + 1)}; break; } continue; }
    if (it.k === 'img') {
      const g = () => dtpGeom(doc, cur.pi), bd = S.body, capSt = S[it.capSt] || S.caption;
      const full = it.w === 'full' && g().n > 1;
      let ok = true;
      const fit = () => {
        const G = g(), W = full ? G.x1 - G.x0 : G.cw, w = Math.max(20, W * Math.min(100, Math.max(10, it.pct || 100)) / 100), ar = it.ar > 0 ? it.ar : 1.5;
        let h = w / ar; const maxH = G.y1 - colTop(cur.pi); if (h > maxH - 6) h = maxH - 6;
        const cl = it.cap ? dtpWordsLines(it.cap, capSt, W) : [];
        return {G, W, w: h * ar > w ? w : h * ar, h, cl, total: h + (cl.length ? capSt.before + cl.length * capSt.lead : 0)};
      };
      let f = fit();
      if (full) { if (!(atTop(cur) && !cur.col && bandOf(cur.pi) === 0)) { if (cur.pi + 1 >= maxPages) ok = false; else { cur.pi++; cur.col = 0; cur.y = colTop(cur.pi); } } if (ok) f = fit(); }
      else if (cur.y + f.total > f.G.y1 + 0.01 && !atTop(cur)) { if (!advance(cur)) ok = false; else f = fit(); }
      if (!ok) { out.overset = {sidx, words: wordsLeft(sidx)}; break; }
      const G = f.G, x = (full ? G.x0 : G.colX(cur.col)) + ((full ? G.x1 - G.x0 : G.cw) - f.w) * ({l: 0, c: 0.5, r: 1}[it.al || 'l']);
      pg(cur.pi).blocks.push({pi: cur.pi, sidx, x, y: cur.y, w: f.w, h: f.h, imgId: it.imgId, fit: 'fill', cap: f.cl.map((t, q) => ({t, y: cur.y + f.h + capSt.before + q * capSt.lead, lead: capSt.lead, size: capSt.size, font: capSt.font, color: capSt.color, b: capSt.b, i: capSt.i, x: x})), capW: f.w});
      const gap = Math.max(4, bd.lead * 0.6);
      if (full) { out.pages[cur.pi].band = (cur.y - G.y0) + f.total + gap; cur.y = colTop(cur.pi); } else cur.y += f.total + gap;
      continue;
    }
    const st = S[it.st] || S.body; if (!it.t && it.t !== 0) continue;
    let res = place(sidx, it, st, cur, null, false);
    if (res.empty) continue;
    for (let tries = 0; tries < 3 && !res.over; tries++) {
      /* órfã: primeira linha sozinha no fim da coluna; viúva: última linha sozinha no topo da seguinte */
      if (res.frags.length > 1 && res.frags[0] === 1 && !atTop(cur)) { const c = {pi: cur.pi, col: cur.col, y: cur.y}; if (!advance(c)) break; res = place(sidx, it, st, c, null, true); continue; }
      const nf = res.frags.length;
      if (nf > 1 && res.frags[nf - 1] === 1 && res.frags[nf - 2] >= 3) { const caps = []; caps[nf - 2] = res.frags[nf - 2] - 1; res = place(sidx, it, st, cur, caps, false); continue; }
      break;
    }
    /* título não fica sozinho no fim da coluna */
    if (st.keep && !res.over && !atTop(cur) && story[sidx + 1] && story[sidx + 1].k === 'p') {
      const ns = S[story[sidx + 1].st] || S.body, c2 = res.c, g = dtpGeom(doc, c2.pi);
      if (c2.pi === cur.pi && c2.col === cur.col && c2.y + ns.lead * 2 > g.y1 + 0.01) { const c = {pi: cur.pi, col: cur.col, y: cur.y}; if (advance(c)) { const r2 = place(sidx, it, st, c, null, false); if (!r2.over) res = r2; } }
    }
    commit(res);
    if (res.over != null) { out.overset = {sidx, words: dtpPlain(it.t).split(/\s+/).filter(Boolean).length - res.over + wordsLeft(sidx + 1), k: res.over}; stop = true; break; }
    cur = res.c;
  }
  /* quadros de texto soltos (títulos, chamadas, folhetos) */
  out.frames = [];
  const nP = Math.max(doc.pages.length, out.pages.length);
  for (let i = 0; i < nP; i++) for (const it of ((doc.pages[i] && doc.pages[i].items) || [])) if (it.k === 'text') out.frames.push(dtpFrame(doc, it, i));
  out.pageCount = Math.max(out.pages.length, doc.nPages || 1);
  if (!doc.autoflow) out.pageCount = Math.max(1, doc.nPages || 1);
  return out;
}
/* quebra um texto curto (legendas) em linhas */
function dtpWordsLines(text, st, width) {
  const ws = dtpWords(text, st), sp = dtpTextW(' ', st.font, st.size, st.b, st.i), lines = []; let cur = [], w = 0;
  for (const wd of ws) { const ww = dtpWordW(wd, st, st.size); if (cur.length && w + sp + ww > width) { lines.push(cur.map(q => q.parts.map(p => p.t).join('')).join(' ')); cur = []; w = 0; } w += (cur.length ? sp : 0) + ww; cur.push(wd); }
  if (cur.length) lines.push(cur.map(q => q.parts.map(p => p.t).join('')).join(' '));
  return lines;
}
/* quadro de texto: quebra de linha dentro do retângulo; o que passar do fim vira estouro do quadro */
function dtpFrame(doc, it, pi) {
  const st = Object.assign({}, doc.styles[it.st] || doc.styles.body, it.ov || {}), pad = it.pad != null ? it.pad : 4, W = it.w - 2 * pad, lead = st.lead;
  const lines = []; let y = it.y + pad, over = false;
  for (const para of String(it.text || '').split(/\n/)) {
    const words = dtpWords(para, st), sp = dtpTextW(' ', st.font, st.size, st.b, st.i); let k = 0;
    if (!words.length) { y += lead; continue; }
    while (k < words.length) {
      let w = 0, j = k; while (j < words.length) { const ww = dtpWordW(words[j], st, st.size), nw = w + (j > k ? sp : 0) + ww; if (nw > W + 0.01 && j > k) break; w = nw; j++; }
      if (y + lead > it.y + it.h - pad + 0.01) { over = true; break; }
      if (j - k === 1 && dtpWordW(words[k], st, st.size) > W + 0.01) { const sw = dtpSplitWord(words[k], st, st.size, W); if (sw) { words.splice(k, 1, sw[0], sw[1]); continue; } }
      const last = j >= words.length; let spc = sp; if (st.align === 'justify' && !last && j - k > 1) spc = (W - (w - sp * (j - k - 1))) / (j - k - 1);
      let x = it.x + pad; if (st.align === 'center') x += (W - w) / 2; else if (st.align === 'right') x += W - w;
      const runs = []; for (let q = k; q < j; q++) { for (const p of words[q].parts) { runs.push({x, t: p.t, b: p.b, i: p.i}); x += dtpTextW(p.t, st.font, st.size, p.b, p.i); } x += spc; }
      lines.push({y, lead, size: st.size, runs, font: st.font, color: st.color}); y += lead; k = j;
    }
    if (over) break; y += st.after;
  }
  return {id: it.id, pi, lines, over};
}

/* ---- desenho de uma página (sem sobreposições de edição); ox/oy em pt, z = pixels por pt ---- */
function dtpDrawPage(ctx, doc, flow, pi, z, o) {
  o = o || {}; const g = dtpGeom(doc, pi), bl = o.bleed || 0, S = doc.styles;
  ctx.save(); ctx.fillStyle = doc.paper || '#fff'; ctx.fillRect(-bl * z, -bl * z, (g.W + 2 * bl) * z, (g.H + 2 * bl) * z);
  ctx.beginPath(); ctx.rect(-bl * z, -bl * z, (g.W + 2 * bl) * z, (g.H + 2 * bl) * z); ctx.clip();
  const drawItem = (it) => {
    const X = it.x * z, Y = it.y * z, Wd = it.w * z, Hd = it.h * z;
    if (it.k === 'rect') { ctx.save(); ctx.globalAlpha = it.op != null ? it.op : 1; ctx.fillStyle = it.fill || '#cccccc'; ctx.fillRect(X, Y, Wd, Hd); if (it.stroke) { ctx.strokeStyle = it.stroke; ctx.lineWidth = (it.sw || 1) * z; ctx.strokeRect(X, Y, Wd, Hd); } ctx.restore(); }
    else if (it.k === 'img') { const im = o.imgs && o.imgs[it.imgId]; ctx.save(); ctx.beginPath(); ctx.rect(X, Y, Wd, Hd); ctx.clip(); if (im) { const iw = im.width, ih = im.height, sc = Math.max(it.w / iw, it.h / ih) * (it.zoom || 1), dw = iw * sc, dh = ih * sc; ctx.drawImage(im, X + (it.w - dw) / 2 * z + (it.px || 0) * z, Y + (it.h - dh) / 2 * z + (it.py || 0) * z, dw * z, dh * z); } else { ctx.fillStyle = '#e4e0d8'; ctx.fillRect(X, Y, Wd, Hd); ctx.fillStyle = '#9a948a'; ctx.font = `${12 * z}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('imagem', X + Wd / 2, Y + Hd / 2); } ctx.restore(); if (it.stroke) { ctx.strokeStyle = it.stroke; ctx.lineWidth = (it.sw || 1) * z; ctx.strokeRect(X, Y, Wd, Hd); } }
  };
  const its = ((doc.pages[pi] && doc.pages[pi].items) || []);
  its.forEach(it => { if (it.k !== 'text') drawItem(it); });
  const P = flow.pages[pi], text = (l, st) => {
    ctx.fillStyle = l.color; const base = l.y + (l.lead - l.size) / 2 + l.size * 0.8;
    for (const r of l.runs) { ctx.font = dtpFontStr(l.font, l.size * z, r.b, r.i); ctx.textBaseline = 'alphabetic'; ctx.fillText(r.t, r.x * z, base * z); }
  };
  if (P) {
    for (const b of P.blocks) { drawItem({k: 'img', imgId: b.imgId, x: b.x, y: b.y, w: b.w, h: b.h}); for (const c of b.cap) { ctx.fillStyle = c.color; ctx.font = dtpFontStr(c.font, c.size * z, c.b, c.i); ctx.textBaseline = 'alphabetic'; ctx.fillText(c.t, c.x * z, (c.y + (c.lead - c.size) / 2 + c.size * 0.8) * z); } }
    for (const l of P.lines) { if (l.drop) { ctx.fillStyle = l.drop.color; ctx.font = dtpFontStr(l.font, l.drop.size * z, 1, 0); ctx.textBaseline = 'alphabetic'; ctx.fillText(l.drop.ch, l.drop.x * z, l.drop.by * z); } text(l); }
  }
  its.forEach(it => { if (it.k === 'text') { const f = flow.frames.find(q => q.id === it.id); if (it.fill) { ctx.fillStyle = it.fill; ctx.fillRect(it.x * z, it.y * z, it.w * z, it.h * z); } if (f) f.lines.forEach(l => text(l)); } });
  /* cabeçalho e número de página */
  const R = doc.run;
  if (R && (R.folio || R.header || R.headerR) && !o.noRun) {
    ctx.fillStyle = R.color; ctx.font = `${R.size * z}px "${R.font}", sans-serif`; ctx.textBaseline = 'alphabetic';
    const num = String(pi + 1), yF = g.H - g.y1 < 6 ? g.H - 6 : g.y1 + (g.H - g.y1) * 0.55, hdr = (g.recto ? (R.headerR || R.header) : R.header) || '';
    if (R.folio) { const w = ctx.measureText(num).width / z; let x = (g.x0 + g.x1) / 2 - w / 2; if (R.pos === 'outer') x = doc.facing && g.recto || !doc.facing ? g.x1 - w : g.x0; if (R.pos === 'inner') x = doc.facing && g.recto ? g.x0 : g.x1 - w; ctx.fillText(num, x * z, yF * z); }
    if (hdr) { const w = ctx.measureText(hdr).width / z; let x = g.recto ? g.x1 - w : g.x0; if (!doc.facing) x = g.x0; ctx.fillText(hdr, x * z, (g.y0 * 0.55) * z); }
  }
  ctx.restore();
}
