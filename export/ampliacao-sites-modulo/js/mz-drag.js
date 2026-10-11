/* ===== Mesa: medidas, alinhamento e soltar dentro de contêiner =====
   • Ao arrastar um elemento (modo livre): mostra em vermelho a distância em px até o vizinho mais próximo em cada direção (ou até a borda do contêiner),
     linhas rosa quando as bordas ou o centro alinham com outro elemento, e "imã" de 5 px para alinhar (segure Ctrl para arrastar sem imã).
   • Segurando Alt com um elemento selecionado e passando o mouse sobre outro: mostra a distância entre os dois.
   • O contêiner que vai receber o elemento fica com a borda laranja tracejada e a etiqueta "Dentro de: …". Soltar com a marca visível coloca o elemento dentro dele. */
const mzNameOf = n => n.name || (typeof MZ_NAMES !== 'undefined' && MZ_NAMES[n.type]) || n.type;
function mzParentRect(fr, par) {
  const el = par && par.type !== 'page' ? mzElOf(fr, par.id) : null, r = el && mzRectOf(el); if (r) return r;
  const root = fr.doc.getElementById('mzRootEl'); return {left: 0, top: 0, right: fr.doc.documentElement.clientWidth, bottom: root ? root.scrollHeight : 0, width: fr.doc.documentElement.clientWidth, height: root ? root.scrollHeight : 0};
}
function mzCandRects(fr, f) {
  const out = []; (f.parent ? f.parent.children : []).forEach(k => { if (k.id === f.node.id || k.hidden) return; const r = mzRectOf(mzElOf(fr, k.id)); if (r && r.width + r.height > 0) out.push(r); }); return out;
}
/* ímã: devolve o deslocamento extra (dx, dy) que encosta as bordas/centro em vizinhos ou no contêiner */
function mzSnapDelta(fr, dr, dx, dy) {
  const f = mzFind(mzRoot(), dr.id); if (!f) return [0, 0];
  if (!dr.r0) { dr.r0 = mzRectOf(mzElOf(fr, dr.id)); dr.cand = mzCandRects(fr, f).concat([mzParentRect(fr, f.parent)]); } if (!dr.r0) return [0, 0];
  const thr = 5 / (fr.z || 1), T = {l: dr.r0.left + dx, r: dr.r0.right + dx, t: dr.r0.top + dy, b: dr.r0.bottom + dy}; T.cx = (T.l + T.r) / 2; T.cy = (T.t + T.b) / 2; let bx = 0, by = 0, bxa = thr + 1, bya = thr + 1;
  dr.cand.forEach(c => {
    [c.left, (c.left + c.right) / 2, c.right].forEach(cv => [T.l, T.cx, T.r].forEach(tv => { const d = cv - tv; if (Math.abs(d) <= thr && Math.abs(d) < bxa) { bxa = Math.abs(d); bx = d; } }));
    [c.top, (c.top + c.bottom) / 2, c.bottom].forEach(cv => [T.t, T.cy, T.b].forEach(tv => { const d = cv - tv; if (Math.abs(d) <= thr && Math.abs(d) < bya) { bya = Math.abs(d); by = d; } }));
  });
  return [bx, by];
}
/* qual contêiner vai receber o elemento se soltar agora (só quando é diferente do atual) */
function mzFreeTarget(fr, dr, f, x, y) {
  const drop = mzDropAt(fr, x, y, f.node); dr.into = drop && drop.parent && drop.parent.type !== 'page' && f.parent && drop.parent.id !== f.parent.id && drop.parent.id !== f.node.id ? drop : null;
}
function mzInHL(fr, par) {
  if (!par || par.type === 'page') return; const r = mzRectOf(mzElOf(fr, par.id)); if (!r) return; const u = 1 / (fr.z || 1);
  mzOvEl(fr, 'ov-in', r); const t = mzOvEl(fr, 'ov-inl', null, 'Dentro de: ' + mzEsc(mzNameOf(par))); t.style.left = r.left + 'px'; t.style.top = (r.top - 17 * u) + 'px';
}
function mzFreeInto(fr, dr) {
  const f = mzFind(mzRoot(), dr.id), pf = mzFind(mzRoot(), dr.into.parent.id); if (!f || !pf) { mzCommit({panels: true}); return; }
  const el = mzElOf(fr, dr.id), pel = mzElOf(fr, pf.node.id), r = mzRectOf(el), pr = pel && mzRectOf(pel); if (!r || !pr) { mzCommit({panels: true}); return; }
  const cs = fr.doc.defaultView.getComputedStyle(pel), bl = parseFloat(cs.borderLeftWidth) || 0, bt = parseFloat(cs.borderTopWidth) || 0, ps = mzStyleAt(pf.node, 'd');
  if (!ps.position || ps.position === 'static') mzStyleSet(pf.node, 'd').position = 'relative';
  const o = mzStyleSet(f.node, MZ.bp); o.left = Math.round(r.left - pr.left - bl) + 'px'; o.top = Math.round(r.top - pr.top - bt) + 'px';
  mzMoveNode(dr.id, pf.node.id, pf.node.children.length); toast('Dentro de “' + mzNameOf(pf.node) + '”.');
}
/* ---------- desenho das medidas ---------- */
function mzMeasureDraw(fr, f) {
  const dr = MZ.drag, u = 1 / (fr.z || 1); let R = null, cands = [], par = null, mode = '';
  if (dr && dr.kind === 'move' && dr.free && dr.on && dr.fr === fr && dr.id === MZ.sel) { R = mzRectOf(mzElOf(fr, MZ.sel)); cands = mzCandRects(fr, f); par = mzParentRect(fr, f.parent); mode = 'drag'; if (dr.into) mzInHL(fr, dr.into.parent); }
  else if (MZ.alt && MZ.hover && MZ.hover !== MZ.sel && !MZ.drag) {
    R = mzRectOf(mzElOf(fr, MZ.sel)); const H = mzRectOf(mzElOf(fr, MZ.hover)); if (!R || !H) return; mode = 'alt';
    const inside = H.left <= R.left && H.right >= R.right && H.top <= R.top && H.bottom >= R.bottom; if (inside) par = H; else cands = [H];
  }
  if (!R || !mode) return;
  const line = (x1, y1, x2, y2, val) => { const h = y1 === y2, d = mzOvEl(fr, 'ov-ml', {left: Math.min(x1, x2), top: Math.min(y1, y2), width: h ? Math.abs(x2 - x1) : u, height: h ? u : Math.abs(y2 - y1)}); const t = mzOvEl(fr, 'ov-mt', null, String(Math.round(val))); t.style.left = (x1 + x2) / 2 + 'px'; t.style.top = (y1 + y2) / 2 + 'px'; return d; };
  const cx = (R.left + R.right) / 2, cy = (R.top + R.bottom) / 2, ov = (a0, a1, b0, b1) => [Math.max(a0, b0), Math.min(a1, b1)];
  let L = null, Rt = null, T = null, B = null;   // vizinho mais próximo em cada direção
  cands.forEach(c => {
    const vo = ov(R.top, R.bottom, c.top, c.bottom), ho = ov(R.left, R.right, c.left, c.right);
    if (vo[1] > vo[0]) { if (c.right <= R.left + .5 && (!L || c.right > L.c.right)) L = {c, a: vo}; if (c.left >= R.right - .5 && (!Rt || c.left < Rt.c.left)) Rt = {c, a: vo}; }
    if (ho[1] > ho[0]) { if (c.bottom <= R.top + .5 && (!T || c.bottom > T.c.bottom)) T = {c, a: ho}; if (c.top >= R.bottom - .5 && (!B || c.top < B.c.top)) B = {c, a: ho}; }
  });
  const ym = a => (a[0] + a[1]) / 2, P = par;
  if (L) line(L.c.right, ym(L.a), R.left, ym(L.a), R.left - L.c.right); else if (P && R.left - P.left >= 1) line(P.left, cy, R.left, cy, R.left - P.left);
  if (Rt) line(R.right, ym(Rt.a), Rt.c.left, ym(Rt.a), Rt.c.left - R.right); else if (P && P.right - R.right >= 1) line(R.right, cy, P.right, cy, P.right - R.right);
  if (T) line(ym(T.a), T.c.bottom, ym(T.a), R.top, R.top - T.c.bottom); else if (P && R.top - P.top >= 1) line(cx, P.top, cx, R.top, R.top - P.top);
  if (B) line(ym(B.a), R.bottom, ym(B.a), B.c.top, B.c.top - R.bottom); else if (P && P.bottom - R.bottom >= 1) line(cx, R.bottom, cx, P.bottom, P.bottom - R.bottom);
  if (mode === 'drag') {   // alinhamentos
    const all = cands.concat(par ? [par] : []), tol = 1.2 * u, seenX = new Set(), seenY = new Set();
    all.forEach(c => {
      [[R.left, c.left], [R.left, c.right], [R.right, c.left], [R.right, c.right], [cx, (c.left + c.right) / 2]].forEach(([a, b]) => { if (Math.abs(a - b) <= tol && !seenX.has(Math.round(b))) { seenX.add(Math.round(b)); const t0 = Math.min(R.top, c.top), t1 = Math.max(R.bottom, c.bottom); mzOvEl(fr, 'ov-al', {left: b, top: t0, width: u, height: t1 - t0}); } });
      [[R.top, c.top], [R.top, c.bottom], [R.bottom, c.top], [R.bottom, c.bottom], [cy, (c.top + c.bottom) / 2]].forEach(([a, b]) => { if (Math.abs(a - b) <= tol && !seenY.has(Math.round(b))) { seenY.add(Math.round(b)); const l0 = Math.min(R.left, c.left), l1 = Math.max(R.right, c.right); mzOvEl(fr, 'ov-al', {left: l0, top: b, width: l1 - l0, height: u}); } });
    });
  }
}
