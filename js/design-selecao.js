/* Mesa do Estúdio de Design: seleção (Shift+clique, retângulo de seleção), grupos, guias arrastáveis das réguas, imãs (snap), distâncias em pixels,
   tamanho ao redimensionar, menu do botão direito, copiar/colar/duplicar, alinhar e atalhos de teclado. Carregado depois de design-ferramentas.js. */

/* ---------- ferramentas: troca silenciosa ---------- */
function dztToolQuiet(t) { DZT.tool = t; dz.mode = 'select'; dztRailMark(); const st = $('dzStage'); if (st) st.className = st.className.replace(/\bdzt-t-\w+/g, '').trim() + ' dzt-t-' + t; dztHint(); }

/* ---------- camadas: clonar com novos ids e grupos ---------- */
function dztClones(list, dx, dy) {
  const gm = {}; return JSON.parse(JSON.stringify(list)).map(l => { l.id = lid(); if (l.group) { gm[l.group] = gm[l.group] || uid('G'); l.group = gm[l.group]; } l.x += dx || 0; l.y += dy || 0; delete l.origin; return l; });
}
function dztCopy() { const ls = dztLayers(); if (!ls.length) { toast('Nada selecionado para copiar.'); return false; } DZT.clip = JSON.parse(JSON.stringify(ls)); DZT.clipN = 0; dz.clip = JSON.parse(JSON.stringify(ls[ls.length - 1])); toast(ls.length > 1 ? ls.length + ' elementos copiados. Ctrl+V cola em qualquer página.' : 'Elemento copiado. Ctrl+V cola em qualquer página.'); return true; }
function dztCut() { if (dztCopy()) dztDelete(); }
function dztPaste() { const sl = dzSlide(); if (!sl || !DZT.clip.length) { toast('Nada copiado ainda.'); return; } DZT.clipN = (DZT.clipN || 0) + 1; const off = 24 * DZT.clipN, ls = dztClones(DZT.clip, off, off); ls.forEach(l => { delete l.locked; }); sl.layers.push(...ls); dztSetSel(ls.map(l => l.id)); dztDone(); }
dzPaste = function () { dztPaste(); };
function dztDuplicate() { const sl = dzSlide(), ls = dztLayers(); if (!sl || !ls.length) return; const cp = dztClones(ls, 30, 30); sl.layers.push(...cp); dztSetSel(cp.map(l => l.id)); dztDone(); }
dzLayerDup = function () { dztDuplicate(); };
function dztDelete() { const sl = dzSlide(), ids = dztIds(); if (!sl || !ids.length) return; sl.layers = sl.layers.filter(l => !ids.includes(l.id)); dztSetSel([]); dztDone(); }
dzLayerDel = function () { dztDelete(); };
function dztSelectAll() { const sl = dzSlide(); dztSetSel(sl.layers.filter(l => !l.hidden && !l.locked).map(l => l.id)); dzInspector(); dzDraw(); dzLayersPanel(); }

/* ---------- ordem ---------- */
function dztOrder(dir, extreme) {
  const sl = dzSlide(), ids = dztIds(); if (!sl || !ids.length) return; const a = sl.layers;
  if (extreme) { const mv = a.filter(l => ids.includes(l.id)), rest = a.filter(l => !ids.includes(l.id)); sl.layers = dir > 0 ? rest.concat(mv) : mv.concat(rest); }
  else if (dir > 0) { for (let i = a.length - 2; i >= 0; i--) if (ids.includes(a[i].id) && !ids.includes(a[i + 1].id)) [a[i], a[i + 1]] = [a[i + 1], a[i]]; }
  else { for (let i = 1; i < a.length; i++) if (ids.includes(a[i].id) && !ids.includes(a[i - 1].id)) [a[i], a[i - 1]] = [a[i - 1], a[i]]; }
  dztDone();
}
dzLayerMove = function (d) { dztOrder(d, false); };

/* ---------- grupos ---------- */
function dztGroup() {
  const sl = dzSlide(), ids = dztIds(); if (!sl) return; if (ids.length < 2) { toast('Selecione 2 ou mais elementos (Shift+clique ou arraste um retângulo na arte).'); return; }
  const g = uid('G'), mem = sl.layers.filter(l => ids.includes(l.id)); mem.forEach(l => { l.group = g; });
  const top = Math.max(...mem.map(l => sl.layers.indexOf(l))), rest = sl.layers.filter(l => !ids.includes(l.id)), at = rest.filter(l => sl.layers.indexOf(l) < top).length;   // os membros ficam juntos, no lugar do mais alto
  rest.splice(at, 0, ...mem); sl.layers = rest; dztSetSel(ids); dztDone('Agrupado. Ctrl+Shift+G desfaz o grupo.');
}
function dztUngroup() {
  const sl = dzSlide(), ids = dztIds(); if (!sl) return; const gs = new Set(sl.layers.filter(l => ids.includes(l.id) && l.group).map(l => l.group)); if (!gs.size) { toast('O elemento selecionado não está em um grupo.'); return; }
  const out = []; sl.layers.forEach(l => { if (l.group && gs.has(l.group)) { out.push(l.id); delete l.group; } }); dztSetSel(out); dztDone('Grupo desfeito.');
}

/* ---------- alinhar e distribuir ---------- */
function dztAlign(kind) {
  const sl = dzSlide(), s = dzSet(), ls = dztLayers().filter(l => !l.locked); if (!ls.length) return; const multi = ls.length > 1, ref = multi ? dztUnion(ls) : {x: 0, y: 0, w: s.format.w, h: s.format.h};
  ls.forEach(l => { const b = dztBox(l); let dx = 0, dy = 0;
    if (kind === 'l') dx = ref.x - b.x; else if (kind === 'ch') dx = ref.x + ref.w / 2 - (b.x + b.w / 2); else if (kind === 'r') dx = ref.x + ref.w - (b.x + b.w);
    else if (kind === 't') dy = ref.y - b.y; else if (kind === 'cv') dy = ref.y + ref.h / 2 - (b.y + b.h / 2); else if (kind === 'b') dy = ref.y + ref.h - (b.y + b.h);
    l.x = Math.round(l.x + dx); l.y = Math.round(l.y + dy); });
  dztDone();
}
function dztDistribute(axis) {
  const ls = dztLayers().filter(l => !l.locked); if (ls.length < 3) { toast('Selecione 3 ou mais elementos para distribuir.'); return; } const h = axis === 'h';
  const items = ls.map(l => ({l, b: dztBox(l)})).sort((a, b) => (h ? a.b.x - b.b.x : a.b.y - b.b.y)), first = items[0].b, last = items[items.length - 1].b;
  const total = h ? (last.x + last.w) - first.x : (last.y + last.h) - first.y, sum = items.reduce((a, i) => a + (h ? i.b.w : i.b.h), 0), gap = (total - sum) / (items.length - 1); let pos = h ? first.x : first.y;
  items.forEach(i => { if (h) i.l.x = Math.round(i.l.x + (pos - i.b.x)); else i.l.y = Math.round(i.l.y + (pos - i.b.y)); pos += (h ? i.b.w : i.b.h) + gap; });
  dztDone();
}

/* ---------- imãs (snap) e distâncias ---------- */
function dztOthers(skip) { return dzSlide().layers.filter(l => !l.hidden && !skip.has(l.id) && LBOX[l.id]); }
function dztSnap(box, skip) {
  const s = dzSet(), W = s.format.w, H = s.format.h, g = s.guides || {}, thr = 8 / dz.scale, vx = [0, W / 2, W], hy = [0, H / 2, H];
  (g.lines || []).forEach(l => (l.a === 'v' ? vx : hy).push(l.p)); if (g.margin) { const m = (s.tk && s.tk.margin != null) ? s.tk.margin : 90; vx.push(m, W - m); hy.push(m, H - m); }
  dztOthers(skip).forEach(l => { const b = dztBox(l); vx.push(b.x, b.x + b.w / 2, b.x + b.w); hy.push(b.y, b.y + b.h / 2, b.y + b.h); });
  const best = (anchors, cands) => { let bd = null; anchors.forEach(a => cands.forEach(c => { const d = c - a; if (Math.abs(d) <= thr && (bd === null || Math.abs(d) < Math.abs(bd))) bd = d; })); return bd || 0; };
  const dx = best([box.x, box.x + box.w / 2, box.x + box.w], vx), dy = best([box.y, box.y + box.h / 2, box.y + box.h], hy), lines = [];
  [box.x + dx, box.x + box.w / 2 + dx, box.x + box.w + dx].forEach(a => { const c = vx.find(v => Math.abs(v - a) < .5); if (c !== undefined) lines.push({a: 'v', p: c}); });
  [box.y + dy, box.y + box.h / 2 + dy, box.y + box.h + dy].forEach(a => { const c = hy.find(v => Math.abs(v - a) < .5); if (c !== undefined) lines.push({a: 'h', p: c}); });
  return {dx, dy, lines};
}
function dztDistances(B, skip) {
  const W = dzSet().format.w, H = dzSet().format.h, others = dztOthers(skip).map(dztBox), out = [], cx = B.x + B.w / 2, cy = B.y + B.h / 2;
  const near = (dir) => { let best = null;
    others.forEach(o => { if (dir === 'l' && o.x + o.w <= B.x && o.y < B.y + B.h && o.y + o.h > B.y) { const g = B.x - (o.x + o.w); if (best === null || g < best) best = g; }
      if (dir === 'r' && o.x >= B.x + B.w && o.y < B.y + B.h && o.y + o.h > B.y) { const g = o.x - (B.x + B.w); if (best === null || g < best) best = g; }
      if (dir === 't' && o.y + o.h <= B.y && o.x < B.x + B.w && o.x + o.w > B.x) { const g = B.y - (o.y + o.h); if (best === null || g < best) best = g; }
      if (dir === 'b' && o.y >= B.y + B.h && o.x < B.x + B.w && o.x + o.w > B.x) { const g = o.y - (B.y + B.h); if (best === null || g < best) best = g; } });
    return best === null ? ({l: B.x, r: W - (B.x + B.w), t: B.y, b: H - (B.y + B.h)})[dir] : best; };
  const l = near('l'), r = near('r'), t = near('t'), b = near('b');
  if (l >= 1) out.push({x1: B.x - l, y1: cy, x2: B.x, y2: cy, t: Math.round(l)}); if (r >= 1) out.push({x1: B.x + B.w, y1: cy, x2: B.x + B.w + r, y2: cy, t: Math.round(r)});
  if (t >= 1) out.push({x1: cx, y1: B.y - t, x2: cx, y2: B.y, t: Math.round(t)}); if (b >= 1) out.push({x1: cx, y1: B.y + B.h, x2: cx, y2: B.y + B.h + b, t: Math.round(b)});
  return out;
}

/* ---------- guias (só na mesa) ---------- */
const dztGuides = () => { const s = dzSet(); if (!s.guides) s.guides = {}; if (!Array.isArray(s.guides.lines)) s.guides.lines = []; return s.guides.lines; };
function dztGuideAt(p) { const thr = 5 / dz.scale; return dztGuides().findIndex(l => l.a === 'v' ? Math.abs(p.x - l.p) < thr : Math.abs(p.y - l.p) < thr); }
function dztGuideBegin(e, a, idx) {
  const cv = $('dzCanvas'); if (!cv) return; e.preventDefault(); const list = dztGuides(), cur = idx >= 0 ? list.splice(idx, 1)[0] : null; DZT.gdrag = {a: cur ? cur.a : a, p: cur ? cur.p : 0, out: !cur}; const wrap = document.querySelector('.dzm-stagewrap');
  const pos = ev => { const r = cv.getBoundingClientRect(); return DZT.gdrag.a === 'v' ? Math.round((ev.clientX - r.left) / r.width * cv.width) : Math.round((ev.clientY - r.top) / r.height * cv.height); };
  const mv = ev => { DZT.gdrag.p = pos(ev); const w = wrap.getBoundingClientRect(), s = dzSet(), lim = DZT.gdrag.a === 'v' ? s.format.w : s.format.h; DZT.gdrag.out = !(ev.clientX > w.left + 22 && ev.clientY > w.top + 22 && ev.clientX < w.right && ev.clientY < w.bottom) || DZT.gdrag.p < 0 || DZT.gdrag.p > lim; dzDraw(); };
  const up = () => { window.removeEventListener('pointermove', mv, true); window.removeEventListener('pointerup', up, true); const g = DZT.gdrag; DZT.gdrag = null; if (g && !g.out) { dztGuides().push({a: g.a, p: g.p}); persist(); } else if (g && cur) persist(); dzDraw(); dzRulers(); if (!dzLayer()) dzInspector(); };
  window.addEventListener('pointermove', mv, true); window.addEventListener('pointerup', up, true); mv(e);
}
function dztGuidesClear() { dztGuides().length = 0; persist(); dzDraw(); dzRulers(); dzInspector(); }
const dzRulersBase = dzRulers;
dzRulers = function () {
  dzRulersBase(); const s = dzSet(), cv = $('dzCanvas'), st = $('dzStage'), rt = $('dzRT'), rl = $('dzRL'); if (!s || !cv || !st || !rt || !rl) return; const sr = st.getBoundingClientRect(), cr = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1, g = (s.guides && s.guides.lines) || [];
  const mark = (c, horiz, p, off) => { const x = c.getContext('2d'); x.save(); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.fillStyle = '#19c3e6'; const q = Math.round(off + p * dz.scale); if (horiz) { x.beginPath(); x.moveTo(q - 4, 22); x.lineTo(q + 4, 22); x.lineTo(q, 14); x.fill(); } else { x.beginPath(); x.moveTo(22, q - 4); x.lineTo(22, q + 4); x.lineTo(14, q); x.fill(); } x.restore(); };
  g.forEach(l => { if (l.a === 'v') mark(rt, true, l.p, cr.left - sr.left); else mark(rl, false, l.p, cr.top - sr.top); });
};

/* ---------- camada de desenho por cima da arte (só na mesa) ---------- */
const dzDrawFer = dzDraw;
dzDraw = function () {
  const multi = dztIds().length > 1, keep = dz.sel; if (multi) dz.sel = '';
  try { dzDrawFer(); } finally { if (multi) dz.sel = keep; }
  const s = dzSet(), sl = dzSlide(), cv = $('dzCanvas'); if (!s || !sl || !cv) return; const ctx = cv.getContext('2d'), W = s.format.w, H = s.format.h, k = 1 / dz.scale, g = s.guides || {};
  ctx.save();
  const r = s.refImg; if (r && r.on !== false) { const bm = IMGS.get(r.imgId); if (bm) { const f = Math.min(W / bm.width, H / bm.height); ctx.globalAlpha = r.opacity; ctx.drawImage(bm, (W - bm.width * f) / 2, (H - bm.height * f) / 2, bm.width * f, bm.height * f); ctx.globalAlpha = 1; } }
  if (DZT.draft) { drawLayer(ctx, DZT.draft); ctx.strokeStyle = '#2f6bff'; ctx.lineWidth = 2 * k; ctx.setLineDash([8 * k, 5 * k]); ctx.strokeRect(DZT.draft.x, DZT.draft.y, DZT.draft.w, DZT.draft.h); ctx.setLineDash([]); }
  ctx.lineWidth = k; const lab = (txt, x, y, col) => { ctx.save(); ctx.font = `600 ${12 * k}px system-ui,sans-serif`; const w = ctx.measureText(txt).width + 10 * k, h = 17 * k; ctx.fillStyle = col; rr(ctx, x - w / 2, y - h / 2, w, h, 4 * k); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, x, y + k); ctx.restore(); };
  if (g.margin) { const m = (s.tk && s.tk.margin != null) ? s.tk.margin : 90; ctx.strokeStyle = '#d946ef'; ctx.setLineDash([10 * k, 7 * k]); ctx.strokeRect(m, m, W - 2 * m, H - 2 * m); ctx.setLineDash([]); }
  const lines = (g.lines || []); ctx.strokeStyle = '#19c3e6'; lines.forEach(l => { ctx.beginPath(); if (l.a === 'v') { ctx.moveTo(l.p, 0); ctx.lineTo(l.p, H); } else { ctx.moveTo(0, l.p); ctx.lineTo(W, l.p); } ctx.stroke(); });
  if (DZT.gdrag) { const d = DZT.gdrag; ctx.strokeStyle = d.out ? '#ff4d4f' : '#19c3e6'; ctx.beginPath(); if (d.a === 'v') { ctx.moveTo(d.p, 0); ctx.lineTo(d.p, H); } else { ctx.moveTo(0, d.p); ctx.lineTo(W, d.p); } ctx.stroke(); lab((d.out ? 'solte para apagar · ' : '') + d.p + ' px', d.a === 'v' ? d.p : 48 * k, d.a === 'v' ? 20 * k : d.p - 14 * k, d.out ? '#ff4d4f' : '#0b8fb0'); }
  const ids = dztIds(); if (ids.length > 1) {
    const ls = dztLayers(); ctx.strokeStyle = '#2f6bff'; ctx.setLineDash([6 * k, 4 * k]); ls.forEach(L => { const b = dztBox(L); ctx.strokeRect(b.x, b.y, b.w, b.h); }); const u = dztUnion(ls); ctx.setLineDash([]); ctx.lineWidth = 2 * k; ctx.strokeRect(u.x, u.y, u.w, u.h);
    if (!DZT.mv) lab(ls.length + ' elementos', u.x + u.w / 2, u.y + u.h + 16 * k, '#2f6bff');
  }
  ctx.lineWidth = k; ctx.strokeStyle = '#ff3df0'; (DZT.snapLines || []).forEach(l => { ctx.beginPath(); if (l.a === 'v') { ctx.moveTo(l.p, 0); ctx.lineTo(l.p, H); } else { ctx.moveTo(0, l.p); ctx.lineTo(W, l.p); } ctx.stroke(); });
  (DZT.dist || []).forEach(d => { ctx.strokeStyle = '#ff4d4f'; ctx.beginPath(); ctx.moveTo(d.x1, d.y1); ctx.lineTo(d.x2, d.y2); ctx.stroke(); const horiz = d.y1 === d.y2; ctx.beginPath(); if (horiz) { ctx.moveTo(d.x1, d.y1 - 5 * k); ctx.lineTo(d.x1, d.y1 + 5 * k); ctx.moveTo(d.x2, d.y2 - 5 * k); ctx.lineTo(d.x2, d.y2 + 5 * k); } else { ctx.moveTo(d.x1 - 5 * k, d.y1); ctx.lineTo(d.x1 + 5 * k, d.y1); ctx.moveTo(d.x2 - 5 * k, d.y2); ctx.lineTo(d.x2 + 5 * k, d.y2); } ctx.stroke(); lab(d.t + '', (d.x1 + d.x2) / 2, (d.y1 + d.y2) / 2, '#ff4d4f'); });
  if (DZT.size) { const L = DZT.size, b = dztBox(L); lab(Math.round(b.w) + ' × ' + Math.round(b.h), b.x + b.w / 2, b.y + b.h + 20 * k, '#2f6bff'); }
  if (DZT.marquee) { const m = DZT.marquee; ctx.fillStyle = 'rgba(47,107,255,.12)'; ctx.strokeStyle = '#2f6bff'; ctx.fillRect(Math.min(m.x0, m.x1), Math.min(m.y0, m.y1), Math.abs(m.x1 - m.x0), Math.abs(m.y1 - m.y0)); ctx.strokeRect(Math.min(m.x0, m.x1), Math.min(m.y0, m.y1), Math.abs(m.x1 - m.x0), Math.abs(m.y1 - m.y0)); }
  ctx.restore();
};

/* ---------- eventos do palco ---------- */
function dztBindSel(st, cv) {
  const pt = e => { const r = cv.getBoundingClientRect(); return {x: (e.clientX - r.left) / r.width * cv.width, y: (e.clientY - r.top) / r.height * cv.height}; };
  st.addEventListener('pointerdown', e => dztDownCap(e, pt, st, cv), true);
  st.addEventListener('pointerdown', e => dztDownBub(e, pt, cv), false);
  st.addEventListener('pointermove', e => dztMoveCap(e, pt), true);
  st.addEventListener('pointermove', e => dztMoveBub(e, pt), false);
  st.addEventListener('pointerup', e => dztUpCap(e, pt), true);
  st.addEventListener('pointerup', e => dztUpBub(e, pt), false);
  st.addEventListener('pointercancel', e => dztUpCap(e, pt), true);
  st.addEventListener('contextmenu', e => dztCtxOpen(e, pt, cv), true);
  st.addEventListener('dblclick', () => { const L = dzLayer(); if (L && L.type === 'text' && !dz.range) { DZT.itab = 'content'; dzInspector(); const t = $('dzTxt'); if (t) { t.focus(); t.select(); } } });
  const rt = $('dzRT'), rl = $('dzRL'); if (rt) rt.addEventListener('pointerdown', e => { if (e.button === 0) dztGuideBegin(e, 'h', -1); }); if (rl) rl.addEventListener('pointerdown', e => { if (e.button === 0) dztGuideBegin(e, 'v', -1); });
}
const dztMouseHit = (p, any) => dzSlide().layers.slice().reverse().find(l => !l.hidden && (any || !l.locked) && LBOX[l.id] && p.x >= LBOX[l.id].x && p.x <= LBOX[l.id].x + LBOX[l.id].w && p.y >= LBOX[l.id].y && p.y <= LBOX[l.id].y + LBOX[l.id].h && l.role !== 'overlay');

function dztDownCap(e, pt, st, cv) {
  if (e.button !== 0) return; const tool = DZT.tool, onCv = e.target === cv;
  if (tool === 'select') {
    if (dz.mode !== 'select') return;
    if (!onCv) { if (e.target === st && dztIds().length) { dztSetSel([]); dzInspector(); dzDraw(); dzLayersPanel(); } return; }
    const p = pt(e), gi = dztGuideAt(p); if (gi >= 0 && !e.altKey) { e.stopPropagation(); e.preventDefault(); dztGuideBegin(e, 'v', gi); return; }
    DZT.altHit = e.altKey ? dztMouseHit(p) : null; DZT.pre = {ids: dztIds(), shift: e.shiftKey, sel: dz.sel}; if (DZT.pre.ids.length > 1) dz.sel = ''; return;
  }
  if (!onCv && tool !== 'hand') return;
  e.stopPropagation(); e.preventDefault(); const p = pt(e);
  if (tool === 'hand') { DZT.act = {t: 'pan', x: e.clientX, y: e.clientY, l: st.scrollLeft, tp: st.scrollTop}; try { cv.setPointerCapture(e.pointerId); } catch (_) { /* sem captura */ } st.classList.add('grabbing'); return; }
  if (tool === 'zoom') { mzkStep(e.altKey ? -1 : 1, e.clientX, e.clientY); return; }
  try { cv.setPointerCapture(e.pointerId); } catch (_) { /* sem captura */ }
  if (tool === 'text') { dztToolQuiet('select'); dztInsert('text', {x: p.x, y: p.y}); DZT.itab = 'content'; dzInspector(); setTimeout(() => { const t = $('dzTxt'); if (t) { t.focus(); t.select(); } }, 30); return; }
  if (tool === 'shape') { DZT.act = {t: 'shape', x0: p.x, y0: p.y}; return; }
  if (tool === 'pick') { dztPick(p, e); return; }
  if (tool === 'brush' || tool === 'eraser') { DZT.act = {t: 'brush'}; dzpDown(e, p); return; }
}
function dztMoveCap(e, pt) {
  const a = DZT.act; if (!a) return;
  if (a.t === 'pan') { const st = $('dzStage'); st.scrollLeft = a.l - (e.clientX - a.x); st.scrollTop = a.tp - (e.clientY - a.y); dzRulers(); e.stopPropagation(); return; }
  const p = pt(e);
  if (a.t === 'shape') { let w = p.x - a.x0, h = p.y - a.y0; if (e.shiftKey && DZT.shape !== 'line') { const m = Math.max(Math.abs(w), Math.abs(h)); w = Math.sign(w || 1) * m; h = Math.sign(h || 1) * m; } const x = Math.min(a.x0, a.x0 + w), y = Math.min(a.y0, a.y0 + h), kind = DZT.shape === 'round' ? 'rect' : DZT.shape;
    const base = dztBuild('shape:' + DZT.shape, {x: 0, y: 0})[0]; if (!base) return; Object.assign(base, {x: Math.round(x), y: Math.round(y), w: Math.max(2, Math.round(Math.abs(w))), h: DZT.shape === 'line' ? 8 : Math.max(2, Math.round(Math.abs(h)))}); if (DZT.shape === 'round') base.radius = Math.round(Math.min(base.w, base.h) * .18); DZT.draft = base; dzDraw(); e.stopPropagation(); return; }
  if (a.t === 'brush') { dzpMove(e, p); e.stopPropagation(); }
}
function dztUpCap(e, pt) {
  const a = DZT.act; if (!a) return; DZT.act = null; const st = $('dzStage'); if (st) st.classList.remove('grabbing');
  if (a.t === 'shape') {
    const p = pt(e), d = DZT.draft; DZT.draft = null; const small = !d || (d.w < 8 && d.h < 8 && DZT.shape !== 'line') || (DZT.shape === 'line' && d.w < 8);
    const sl = dzSlide(); let L = d; if (small) { L = dztBuild('shape:' + DZT.shape, {x: p.x, y: p.y})[0]; } if (!L) return; L.id = lid(); sl.layers.push(L); dztSetSel([L.id]); dztToolQuiet('select'); dztDone();
  } else if (a.t === 'brush') dzpUp(e);
}
function dztDownBub(e, pt, cv) {
  const pre = DZT.pre; DZT.pre = null; if (!pre || DZT.tool !== 'select' || dz.mode !== 'select' || e.button !== 0) return; const sl = dzSlide(), p = pt(e); DZT.mv = null; DZT.size = null;
  if (dz.drag && dz.drag.t === 'resize') { dz.sel = pre.sel || dz.sel; return; }
  const hit = dz.sel ? sl.layers.find(l => l.id === dz.sel) : null;
  if (!hit) {   // clique no vazio: retângulo de seleção (Shift soma)
    dz.sel = ''; dz.multi = pre.shift ? pre.ids.slice() : []; if (pre.shift && pre.ids.length) dz.sel = pre.ids[pre.ids.length - 1]; DZT.marquee = {x0: p.x, y0: p.y, x1: p.x, y1: p.y, base: pre.shift ? pre.ids.slice() : []}; dz.drag = null; dzInspector(); dzDraw(); dzLayersPanel(); return;
  }
  const members = hit.group ? sl.layers.filter(l => l.group === hit.group).map(l => l.id) : [hit.id];
  if (pre.shift) {
    const cur = pre.ids, was = members.every(i => cur.includes(i)), next = was ? cur.filter(i => !members.includes(i)) : [...cur.filter(i => !members.includes(i)), ...members];
    dz.drag = null; dztSetSel(next); dzInspector(); dzDraw(); dzLayersPanel(); return;
  }
  let ids = members; if (pre.ids.length > 1 && members.some(i => pre.ids.includes(i))) ids = pre.ids;
  ids = ids.filter(i => i !== hit.id).concat([hit.id]);
  if (dz.drag && dz.drag.dup && DZT.altHit) {   // Alt+arrastar: copia o elemento (e os outros selecionados ou do mesmo grupo) e leva as cópias
    const orig = DZT.altHit; DZT.altHit = null; sl.layers = sl.layers.filter(l => l.id !== dz.sel);   // descarta a cópia simples feita pela mesa
    const srcIds = (pre.ids.length > 1 && pre.ids.includes(orig.id)) ? pre.ids : (orig.group ? sl.layers.filter(l => l.group === orig.group).map(l => l.id) : [orig.id]), srcs = sl.layers.filter(l => srcIds.includes(l.id) && !l.locked), cl = dztClones(srcs, 0, 0), prim = cl[Math.max(0, srcs.indexOf(orig))];
    const at = Math.max(...srcs.map(l => sl.layers.indexOf(l))) + 1; sl.layers.splice(at, 0, ...cl); ids = cl.filter(c => c !== prim).map(c => c.id).concat([prim.id]); dz.sel = prim.id;
  }
  dztSetSel(ids); const L = sl.layers.find(l => l.id === dz.sel) || hit, starts = {}; sl.layers.forEach(l => { if (ids.includes(l.id) && !l.locked) starts[l.id] = {x: l.x, y: l.y}; });
  const u = dztUnion(sl.layers.filter(l => starts[l.id])); DZT.mv = {sx: p.x, sy: p.y, starts, union: u, dup: !!(dz.drag && dz.drag.dup), moved: false, primary: L.id};
  dzInspector(); dzDraw(); dzLayersPanel();
}
function dztMoveBub(e, pt) {
  if (DZT.tool !== 'select') return; const d = dz.drag, p = pt(e);
  if (DZT.marquee) { const m = DZT.marquee; m.x1 = p.x; m.y1 = p.y; const x0 = Math.min(m.x0, m.x1), x1 = Math.max(m.x0, m.x1), y0 = Math.min(m.y0, m.y1), y1 = Math.max(m.y0, m.y1), sl = dzSlide(); let ids = new Set(m.base);
    sl.layers.forEach(l => { if (l.hidden || l.locked || !LBOX[l.id] || l.role === 'overlay') return; const b = dztBox(l); if (b.x < x1 && b.x + b.w > x0 && b.y < y1 && b.y + b.h > y0 && (Math.abs(x1 - x0) > 3 || Math.abs(y1 - y0) > 3)) { ids.add(l.id); if (l.group) sl.layers.filter(z => z.group === l.group).forEach(z => ids.add(z.id)); } });
    dztSetSel([...ids]); dzDraw(); return; }
  if (!d) return;
  if (d.t === 'resize') { DZT.size = dzLayer(); dzDraw(); return; }
  if (d.t !== 'move' || !DZT.mv) return;
  const mv = DZT.mv, sl = dzSlide(); let dx = p.x - mv.sx, dy = p.y - mv.sy; if (Math.hypot(dx, dy) > 2 / dz.scale) mv.moved = true;
  if (e.shiftKey) { if (Math.abs(dx) > Math.abs(dy)) dy = 0; else dx = 0; }
  const u = mv.union; let box = {x: u.x + dx, y: u.y + dy, w: u.w, h: u.h}; DZT.snapLines = [];
  if (DZT.snap && !e.ctrlKey && !e.metaKey) { const sn = dztSnap(box, new Set(Object.keys(mv.starts))); dx += sn.dx; dy += sn.dy; box = {x: u.x + dx, y: u.y + dy, w: u.w, h: u.h}; DZT.snapLines = sn.lines; }
  sl.layers.forEach(l => { const s0 = mv.starts[l.id]; if (s0) { l.x = Math.round(s0.x + dx); l.y = Math.round(s0.y + dy); } });
  DZT.dist = dztDistances(box, new Set(Object.keys(mv.starts))); dzDraw();
}
function dztUpBub() {
  if (DZT.marquee) { DZT.marquee = null; dzInspector(); dzLayersPanel(); }
  if (DZT.mv && DZT.mv.dup && !DZT.mv.moved) { const sl = dzSlide(); sl.layers.forEach(l => { if (DZT.mv.starts[l.id] && l.id !== DZT.mv.primary) { l.x += 30; l.y += 30; } }); }
  DZT.mv = null; DZT.snapLines = []; DZT.dist = []; DZT.size = null; dzDraw(); dzLayersPanel();
}
function dztPick(p, e) {
  const s = dzSet(), sl = dzSlide(), c = document.createElement('canvas'); c.width = s.format.w; c.height = s.format.h; const x = c.getContext('2d'); renderSlide(x, sl, c.width, c.height, 1);
  const d = x.getImageData(Math.max(0, Math.min(c.width - 1, Math.round(p.x))), Math.max(0, Math.min(c.height - 1, Math.round(p.y))), 1, 1).data, hex = '#' + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, '0')).join('');
  DZT.color = hex; if (typeof DZP !== 'undefined') DZP.c = hex; try { navigator.clipboard && navigator.clipboard.writeText(hex); } catch (_) { /* sem área de transferência */ }
  if (e.shiftKey) { dztApplyColor(hex); } else { toast('Cor ' + hex + ' pega. Shift+clique aplica no elemento selecionado.'); dzInspector(); }
}

/* ---------- menu do botão direito ---------- */
function dztCtxClose() { const m = $('dztCtx'); if (m) m.remove(); }
function dztCtxOpen(e, pt, cv) {
  e.preventDefault(); e.stopPropagation(); dztCtxClose(); if (e.target !== cv) return; const p = pt(e), hit = dztMouseHit(p, true), sl = dzSlide();
  if (hit) { const mem = hit.group ? sl.layers.filter(l => l.group === hit.group).map(l => l.id) : [hit.id]; if (!dztIds().includes(hit.id)) { dztSetSel(mem); dzInspector(); dzDraw(); dzLayersPanel(); } }
  const ids = dztIds(), ls = dztLayers(), many = ids.length > 1, grouped = ls.some(l => l.group), locked = ls.length && ls.every(l => l.locked), hidden = ls.length && ls.every(l => l.hidden);
  const it = (t, fn, sc, off) => off ? '' : `<button onclick="dztCtxClose();${fn}"><span>${t}</span><kbd>${sc || ''}</kbd></button>`, sep = '<hr>';
  const items = ids.length ? [it('Copiar', 'dztCopy()', 'Ctrl C'), it('Recortar', 'dztCut()', 'Ctrl X'), it('Colar', 'dztPaste()', 'Ctrl V', !DZT.clip.length), it('Duplicar', 'dztDuplicate()', 'Ctrl D'), it('Excluir', 'dztDelete()', 'Delete'), sep,
    it('Trazer para frente', 'dztOrder(1,false)', ']'), it('Enviar para trás', 'dztOrder(-1,false)', '['), it('Ao topo', 'dztOrder(1,true)', 'Ctrl ]'), it('Ao fundo', 'dztOrder(-1,true)', 'Ctrl ['), sep,
    it('Agrupar', 'dztGroup()', 'Ctrl G', !many), it('Desagrupar', 'dztUngroup()', 'Ctrl Shift G', !grouped), it(locked ? 'Destravar' : 'Travar', `dztLockSel(${!locked})`), it(hidden ? 'Mostrar' : 'Ocultar', `dztHideSel(${!hidden})`), sep, it('Salvar como componente…', 'dztSaveComp()')]
    : [it('Colar', 'dztPaste()', 'Ctrl V', !DZT.clip.length), it('Selecionar tudo', 'dztSelectAll()', 'Ctrl A'), sep, it('Limpar guias', 'dztGuidesClear()', '', !dztGuides().length)];
  const m = document.createElement('div'); m.id = 'dztCtx'; m.className = 'dzt-ctx'; m.innerHTML = items.join(''); document.body.appendChild(m);
  const w = m.offsetWidth, h = m.offsetHeight; m.style.left = Math.min(e.clientX, window.innerWidth - w - 8) + 'px'; m.style.top = Math.min(e.clientY, window.innerHeight - h - 8) + 'px';
}
document.addEventListener('pointerdown', e => { if (!e.target.closest || !e.target.closest('#dztCtx')) dztCtxClose(); }, true);
function dztLockSel(v) { dztLayers().forEach(l => { l.locked = v; }); dztDone(); }
function dztHideSel(v) { dztLayers().forEach(l => { l.hidden = v; }); if (v) dztSetSel([]); dztDone(); }

/* ---------- teclado ---------- */
const dztTyping = e => { const t = e.target; return !!(t && (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable)); };
function dztKey(e) {
  if (!dztActive() || dztTyping(e) || $('dztPrev') || $('dztCmp')) return; const mb = $('modalBack'); if (mb && mb.classList.contains('open')) return; const k = e.key, K = k.length === 1 ? k.toLowerCase() : k, mod = e.ctrlKey || e.metaKey, done = () => { e.preventDefault(); e.stopImmediatePropagation(); };
  if (k === 'Escape') {
    if ($('dztCtx')) { dztCtxClose(); return done(); } if ($('dztPrev')) return;   // a prévia fecha sozinha
    if (DZT.dock) { dztDockClose(); return done(); } if (DZT.tool !== 'select') { dztTool('select'); return done(); } if (dz.mode !== 'select') { dz.mode = 'select'; renderDesign(); return done(); }
    if (dz.range) { dz.range = null; dzInspector(); dzDraw(); return done(); } if (dztIds().length) { dztSetSel([]); dzInspector(); dzDraw(); dzLayersPanel(); return done(); } return;
  }
  if (mod) {
    if (K === 'c' && dztIds().length) { dztCopy(); return done(); } if (K === 'x' && dztIds().length) { dztCut(); return done(); } if (K === 'v' && DZT.clip.length) { dztPaste(); return done(); }
    if (K === 'd') { if (dztIds().length) dztDuplicate(); return done(); } if (K === 'g') { e.shiftKey ? dztUngroup() : dztGroup(); return done(); } if (K === 'a') { dztSelectAll(); return done(); }
    if (K === 's') { dzSaveNow(); return done(); } if (k === ']') { dztOrder(1, true); return done(); } if (k === '[') { dztOrder(-1, true); return done(); } return;
  }
  if (e.altKey) return;
  if (k === '?') { dztToggle('keys'); return done(); }
  const T = {v: 'select', h: 'hand', t: 'text', r: 'shape', b: 'brush', e: 'eraser', i: 'pick', f: 'image', l: 'logo', y: 'video'}; if (T[K] && !e.shiftKey) { dztTool(T[K]); return done(); }
  if (k === ']') { dztOrder(1, false); return done(); } if (k === '[') { dztOrder(-1, false); return done(); }
  const ls = dztLayers(); if (!ls.length) return;
  if (k === 'Delete' || k === 'Backspace') { dztDelete(); return done(); }
  if (k === 'Enter') { const L = ls[ls.length - 1]; if (L.type === 'text') { DZT.itab = 'content'; dzInspector(); const t = $('dzTxt'); if (t) { t.focus(); t.select(); } } return done(); }
  if (k.startsWith('Arrow')) { const st = e.shiftKey ? 10 : 1; ls.forEach(L => { if (L.locked) return; if (k === 'ArrowLeft') L.x -= st; if (k === 'ArrowRight') L.x += st; if (k === 'ArrowUp') L.y -= st; if (k === 'ArrowDown') L.y += st; }); dzDraw(); dzCommitSoon(); dzInspector(); return done(); }
}
document.addEventListener('keydown', dztKey, true);

/* ---------- tabela de atalhos ---------- */
const DZT_KEYS = [['Ferramentas', [['V', 'Selecionar'], ['H', 'Mão (ou segure Espaço e arraste)'], ['T', 'Texto'], ['R', 'Forma'], ['F', 'Imagem'], ['L', 'Logo'], ['Y', 'Vídeo'], ['B', 'Pincel'], ['E', 'Borracha'], ['I', 'Contagotas'], ['Z (segurar) + clique', 'Aproxima'], ['Z + Alt + clique', 'Afasta']]],
  ['Zoom e mesa', [['Espaço + arrastar', 'Mover a prancheta'], ['Alt + roda do mouse', 'Zoom no ponto do cursor'], ['Ctrl +  /  Ctrl −', 'Mais / menos zoom'], ['Ctrl 0', 'Ajustar à tela'], ['Ctrl 1', '100%']]],
  ['Elementos', [['Clique', 'Seleciona'], ['Shift + clique', 'Soma à seleção'], ['Arrastar no vazio', 'Retângulo de seleção'], ['Duplo clique', 'Edita o texto'], ['Alt + arrastar', 'Duplica'], ['Shift + arrastar', 'Trava na horizontal/vertical'], ['Ctrl + arrastar', 'Solta sem imãs'], ['Setas', 'Move 1 px (Shift = 10 px)'], ['Enter', 'Editar o texto'], ['Delete', 'Excluir']]],
  ['Edição', [['Ctrl Z  /  Ctrl Y', 'Desfazer / Refazer'], ['Ctrl C  /  X  /  V', 'Copiar, recortar, colar'], ['Ctrl D', 'Duplicar'], ['Ctrl G  /  Ctrl Shift G', 'Agrupar / desagrupar'], ['Ctrl A', 'Selecionar tudo'], ['[  e  ]', 'Para trás / para frente'], ['Ctrl [  e  Ctrl ]', 'Ao fundo / ao topo'], ['Ctrl S', 'Salvar'], ['Esc', 'Solta a seleção (antes, sai da ferramenta)'], ['?', 'Esta tabela']]]];
DZT.docks.keys = () => dztDock('keys', '⌨ Atalhos', DZT_KEYS.map(([g, rows]) => `<h5 class="dzt-kh">${g}</h5><table class="dzt-kt">${rows.map(([a, b]) => `<tr><td><kbd>${a}</kbd></td><td>${b}</td></tr>`).join('')}</table>`).join('') + '<p class="dzt-tip">Os atalhos de letra não funcionam enquanto você digita um texto.</p>', 400);

/* modos "Destacar por clique" e "Formatar palavra" voltam a valer sozinhos: saem de qualquer ferramenta */
const dzModeEmBase = dzModeEm, dzModeFmtBase = dzModeFmt;
dzModeEm = function () { DZT.tool = 'select'; return dzModeEmBase(); };
dzModeFmt = function () { DZT.tool = 'select'; return dzModeFmtBase(); };
