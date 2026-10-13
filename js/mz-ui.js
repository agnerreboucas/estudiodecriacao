/* ===== Mesa de páginas · interface estilo Figma/Photoshop =====
   Trilho de ícones à esquerda (ferramentas e painéis), painel esquerdo que recolhe com Esc (📌 fixa), "Salvo hh:mm" e Ctrl+S,
   snap + distâncias em pixels ao arrastar, guias que dá para arrastar/apagar, etiqueta da navegação de aula. */
const MZ_UIICON = {
  sel: '<path d="M5 3l14 7-6 2-2 6z"/>', hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10.5V4a1.5 1.5 0 0 1 3 0v6.5M14 10.5V5.5a1.5 1.5 0 0 1 3 0V14c0 4-2 7-6 7-3 0-4.2-1.8-6-5l-1.4-2.6a1.5 1.5 0 0 1 2.6-1.4L8 13.5"/>',
  draw: '<path d="M4 20l1-5L16 4l4 4L9 19z"/><line x1="14" y1="6" x2="18" y2="10"/>', ai: '<path d="M11 3l1.8 5.2L18 10l-5.2 1.8L11 17l-1.8-5.2L4 10l5.2-1.8z"/><path d="M19 15l.7 2 2 .7-2 .7L19 21l-.7-1.6-2-.7 2-.7z"/>',
  elements: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  blocks: '<rect x="3" y="3" width="18" height="6" rx="1"/><rect x="3" y="12" width="8" height="9" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/>',
  layers: '<polygon points="12 2 22 8 12 14 2 8"/><polyline points="2 12 12 18 22 12"/><polyline points="2 16 12 22 22 16"/>',
  lib: '<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>', assets: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/>',
  refs: '<path d="M6 3h12v18l-6-4-6 4z"/>', zin: '<circle cx="11" cy="11" r="7"/><line x1="16" y1="16" x2="21" y2="21"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="11" y1="8" x2="11" y2="14"/>',
  zout: '<circle cx="11" cy="11" r="7"/><line x1="16" y1="16" x2="21" y2="21"/><line x1="8" y1="11" x2="14" y2="11"/>', fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  guides: '<line x1="3" y1="8" x2="21" y2="8"/><line x1="8" y1="3" x2="8" y2="21"/><line x1="3" y1="16" x2="21" y2="16" stroke-dasharray="2 2"/>',
  ds: '<line x1="4" y1="6" x2="20" y2="6"/><circle cx="9" cy="6" r="2"/><line x1="4" y1="12" x2="20" y2="12"/><circle cx="15" cy="12" r="2"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="8" cy="18" r="2"/>', ver: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>'
};
const mzUi = (k, s) => `<svg viewBox="0 0 24 24" width="${s || 20}" height="${s || 20}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MZ_UIICON[k] || ''}</svg>`;
const MZ_RAIL = [['sel', 'Selecionar'], ['hand', 'Mover a tela (mão). Também: segure Espaço'], ['draw', 'Desenhar'], ['ai', 'IA'], '-', ['elements', 'Elementos'], ['blocks', 'Blocos'], ['layers', 'Camadas'], ['lib', 'Biblioteca'], ['assets', 'Assets'], ['refs', 'Referências'], '-', ['zin', 'Aproximar (Ctrl +)'], ['zout', 'Afastar (Ctrl −)'], ['fit', 'Ajustar à tela (Ctrl 0)'], ['guides', 'Ocultar / mostrar guias'], '-', ['ds', 'Sistema (Design System)'], ['ver', 'Versões']];
function mzRailHtml() { return MZ_RAIL.map(it => it === '-' ? '<i class="sep"></i>' : `<button type="button" data-rail="${it[0]}" title="${it[1]}" aria-label="${it[1]}" onclick="mzRail('${it[0]}')">${mzUi(it[0])}</button>`).join(''); }
MZ.tool = 'sel'; MZ.lcol = false;
try { MZ.pin = localStorage.getItem('mz_pin') !== '0'; } catch (e) { MZ.pin = true; }
const MZ_LEFTK = ['elements', 'blocks', 'layers', 'lib', 'assets', 'refs'], MZ_LEFTN = {elements: 'Elementos', blocks: 'Blocos', layers: 'Camadas', lib: 'Biblioteca', assets: 'Assets', refs: 'Referências'};
function mzRail(k) {
  if (MZ_LEFTK.includes(k)) { if (!MZ.lcol && MZ.left === k && !MZ.pin) mzLeftCollapse(); else mzLeftTab(k); return; }
  if (k === 'sel') { MZ.tool = 'sel'; if (typeof MZK !== 'undefined') { MZK.space = false; mzkCursor(); } if (MZ.draw && MZ.draw.on) mzDrawToggle(false); }
  else if (k === 'hand') { MZ.tool = MZ.tool === 'hand' ? 'sel' : 'hand'; if (typeof MZK !== 'undefined') { MZK.space = MZ.tool === 'hand'; mzkCursor(); } }
  else if (k === 'draw') mzDrawToggle(); else if (k === 'ai') mzAiToggle();
  else if (k === 'zin') { typeof mzkStep === 'function' ? mzkStep(1) : mzZoom(0.1); } else if (k === 'zout') { typeof mzkStep === 'function' ? mzkStep(-1) : mzZoom(-0.1); } else if (k === 'fit') mzZoomFit();
  else if (k === 'guides') { MZ.guides = !MZ.guides; mzOverlayAll(); mzRefreshPanels(); } else if (k === 'ds') mzModalDs(); else if (k === 'ver') mzModalVersions();
  mzRailSync();
}
function mzRailSync() {
  const r = document.getElementById('mzRail'); if (!r) return; const on = {sel: MZ.tool === 'sel' && !(MZ.draw && MZ.draw.on), hand: MZ.tool === 'hand', draw: !!(MZ.draw && MZ.draw.on), ai: (document.getElementById('mzAiBar') || {style: {}}).style.display === 'flex', guides: !MZ.guides};
  MZ_LEFTK.forEach(k => { on[k] = !MZ.lcol && MZ.left === k; }); r.querySelectorAll('[data-rail]').forEach(b => { const k = b.dataset.rail; b.classList.toggle('on', !!on[k]); }); const g = r.querySelector('[data-rail=guides]'); if (g) g.title = MZ.guides ? 'Ocultar guias' : 'Mostrar guias (estão ocultas)';
}
function mzLayoutSoon() { setTimeout(() => { if (!MZ.open) return; if (MZ.fit) { mzLayoutFrames(); } mzOverlayAll(); mzRulers(); }, 30); }
function mzLeftCollapse() { MZ.lcol = true; const b = document.getElementById('mzBody'); if (b) b.classList.add('lcol'); mzRailSync(); mzLayoutSoon(); }
function mzLeftOpen() { MZ.lcol = false; const b = document.getElementById('mzBody'); if (b) b.classList.remove('lcol'); mzRailSync(); mzLayoutSoon(); }
function mzPinToggle() { MZ.pin = !MZ.pin; try { localStorage.setItem('mz_pin', MZ.pin ? '1' : '0'); } catch (e) { /* sem armazenamento */ } const p = document.getElementById('mzPin'); if (p) p.classList.toggle('on', MZ.pin); toast(MZ.pin ? 'Painel fixo.' : 'Painel solto: Esc recolhe, e o ícone da barra abre e fecha.'); }
/* Esc: recolhe o painel esquerdo se ele não estiver fixo (devolve true se tratou) */
function mzLeftEscape() { if (!MZ.pin && !MZ.lcol) { mzLeftCollapse(); return true; } return false; }
const mzLeftTabBase = mzLeftTab;
mzLeftTab = function (k) { if (MZ.lcol) mzLeftOpen(); mzLeftTabBase(k); const t = document.getElementById('mzLTitle'); if (t) t.textContent = MZ_LEFTN[k] || k; const s = document.getElementById('mzSearch'); if (s) s.placeholder = k === 'refs' ? 'Buscar referências…' : 'Buscar elementos, blocos, camadas…'; mzRailSync(); };
function mzNavPillUpdate() { const e = document.getElementById('mzNavPill'); if (!e) return; const pg = mzPg(), n = pg && pg.nav; e.style.display = n ? '' : 'none'; e.textContent = n ? 'Aula: ' + MZ_NAV_NAMES[n].toLowerCase() : ''; }
/* abrir e fechar: estado do trilho, "Salvo" e ferramenta */
const mzOpenBase = mzOpen;
mzOpen = function (pid) { const was = MZ.open; mzOpenBase(pid); if (!was && MZ.open) { MZ.tool = 'sel'; MZ.lcol = false; const b = document.getElementById('mzBody'); if (b) b.classList.remove('lcol'); const p = document.getElementById('mzPin'); if (p) p.classList.toggle('on', MZ.pin); const t = document.getElementById('mzLTitle'); if (t) t.textContent = MZ_LEFTN[MZ.left] || ''; mzSavedMark(); mzNavPillUpdate(); mzRailSync(); } };
const mzCloseBase = mzClose;
mzClose = function () { MZ.tool = 'sel'; if (typeof MZK !== 'undefined') { MZK.space = false; if (typeof mzkCursor === 'function') mzkCursor(); } return mzCloseBase(); };
/* Ctrl+S sempre salva (mesmo digitando), sem abrir o "Salvar página" do navegador */
const mzCtrlS = e => { if (MZ.open && (e.ctrlKey || e.metaKey) && !e.altKey && String(e.key).toLowerCase() === 's') { e.preventDefault(); e.stopPropagation(); mzSaveNow(); } };
document.addEventListener('keydown', mzCtrlS, true);
/* o botão mão continua valendo depois de soltar o Espaço */
const mzHandKeep = () => { if (MZ.open && MZ.tool === 'hand' && typeof MZK !== 'undefined') { MZK.space = true; if (typeof mzkCursor === 'function') mzkCursor(); } };
document.addEventListener('keyup', () => setTimeout(mzHandKeep, 0)); window.addEventListener('focus', mzHandKeep);

/* ---------- snap e distâncias ao arrastar ---------- */
function mzSnapInit(fr, id) {
  const f = mzFind(mzRoot(), id); if (!f || !f.parent) return null; const el = mzElOf(fr, id), r0 = el && mzRectOf(el); if (!r0) return null;
  const W = MZ_BP[fr.bp], root = fr.doc.getElementById('mzRootEl'), pel = f.parent.type === 'page' ? null : mzElOf(fr, f.parent.id), pr = (pel && mzRectOf(pel)) || {left: 0, top: 0, right: W, bottom: root.scrollHeight, width: W, height: root.scrollHeight};
  const sib = f.parent.children.filter(c => c.id !== id && !c.hidden).map(c => mzRectOf(mzElOf(fr, c.id))).filter(Boolean), g = mzPg().guides, xs = g.v.slice(), ys = g.h.slice();
  xs.push(0, W / 2, W); xs.push(pr.left, (pr.left + pr.right) / 2, pr.right); ys.push(pr.top, (pr.top + pr.bottom) / 2, pr.bottom); sib.forEach(r => { xs.push(r.left, (r.left + r.right) / 2, r.right); ys.push(r.top, (r.top + r.bottom) / 2, r.bottom); });
  return {r0, pr, sib, xs, ys, thr: 6 / (fr.z || 1), W};
}
function mzSnapApply(fr, dr, dx, dy, e) {
  const S = dr.snap, off = !!(e && (e.ctrlKey || e.metaKey)), w = S.r0.width, h = S.r0.height, best = (cands, targets) => { let b = Infinity; targets.forEach(t => cands.forEach(c => { const d = t - c; if (Math.abs(d) < Math.abs(b)) b = d; })); return b; };
  if (!off) { const bx = best([S.r0.left + dx, S.r0.left + dx + w / 2, S.r0.left + dx + w], S.xs), by = best([S.r0.top + dy, S.r0.top + dy + h / 2, S.r0.top + dy + h], S.ys); if (Math.abs(bx) <= S.thr) dx += bx; if (Math.abs(by) <= S.thr) dy += by; }
  const R = {left: S.r0.left + dx, top: S.r0.top + dy}; R.right = R.left + w; R.bottom = R.top + h; const v = [], hh = [], near = (a, b) => Math.abs(a - b) < 0.6;
  if (!off) { S.xs.forEach(t => { if ([R.left, (R.left + R.right) / 2, R.right].some(c => near(c, t)) && !v.includes(t)) v.push(t); }); S.ys.forEach(t => { if ([R.top, (R.top + R.bottom) / 2, R.bottom].some(c => near(c, t)) && !hh.includes(t)) hh.push(t); }); }
  const midY = (R.top + R.bottom) / 2, midX = (R.left + R.right) / 2, dist = [], P = S.pr, ovY = r => r.top < R.bottom && r.bottom > R.top, ovX = r => r.left < R.right && r.right > R.left;
  dist.push({x1: P.left, y1: midY, x2: R.left, y2: midY, val: R.left - P.left}, {x1: R.right, y1: midY, x2: P.right, y2: midY, val: P.right - R.right}, {x1: midX, y1: P.top, x2: midX, y2: R.top, val: R.top - P.top}, {x1: midX, y1: R.bottom, x2: midX, y2: P.bottom, val: P.bottom - R.bottom});
  const nb = (list, key) => list.length ? list.reduce((a, b) => (key(b) < key(a) ? b : a)) : null; const L = nb(S.sib.filter(r => ovY(r) && r.right <= R.left + 0.5), r => R.left - r.right), Rr = nb(S.sib.filter(r => ovY(r) && r.left >= R.right - 0.5), r => r.left - R.right), T = nb(S.sib.filter(r => ovX(r) && r.bottom <= R.top + 0.5), r => R.top - r.bottom), B = nb(S.sib.filter(r => ovX(r) && r.top >= R.bottom - 0.5), r => r.top - R.bottom);
  if (L) dist.push({x1: L.right, y1: midY, x2: R.left, y2: midY, val: R.left - L.right, sib: 1}); if (Rr) dist.push({x1: R.right, y1: midY, x2: Rr.left, y2: midY, val: Rr.left - R.right, sib: 1}); if (T) dist.push({x1: midX, y1: T.bottom, x2: midX, y2: R.top, val: R.top - T.bottom, sib: 1}); if (B) dist.push({x1: midX, y1: R.bottom, x2: midX, y2: B.top, val: B.top - R.bottom, sib: 1});
  fr.snapFx = {v, h: hh, dist, R, off}; return {dx, dy};
}
function mzSnapDraw(fr) {
  const F = fr.snapFx; if (!F) return; const u = 1 / (fr.z || 1), ov = fr.doc.getElementById('mzOv');
  F.v.forEach(x => { const d = mzOvEl(fr, 'ov-snap'); d.style.left = x + 'px'; d.style.top = '0'; d.style.width = u + 'px'; d.style.height = ov.style.height || '100%'; }); F.h.forEach(y => { const d = mzOvEl(fr, 'ov-snap'); d.style.top = y + 'px'; d.style.left = '0'; d.style.height = u + 'px'; d.style.width = '100%'; });
  F.dist.forEach(s => { const horiz = s.y1 === s.y2, len = horiz ? Math.abs(s.x2 - s.x1) : Math.abs(s.y2 - s.y1); if (len < 1) return; const d = mzOvEl(fr, 'ov-dist'); if (horiz) { d.style.left = Math.min(s.x1, s.x2) + 'px'; d.style.top = s.y1 + 'px'; d.style.width = len + 'px'; d.style.height = u + 'px'; } else { d.style.left = s.x1 + 'px'; d.style.top = Math.min(s.y1, s.y2) + 'px'; d.style.height = len + 'px'; d.style.width = u + 'px'; }
    const lb = mzOvEl(fr, 'ov-dl', null, String(Math.round(s.val))); lb.style.left = (horiz ? (s.x1 + s.x2) / 2 : s.x1) + 'px'; lb.style.top = (horiz ? s.y1 : (s.y1 + s.y2) / 2) + 'px'; if (s.sib) lb.style.background = '#e83e8c'; });
}

/* ---------- guias: arrastar para mover, soltar sobre a régua para apagar ---------- */
function mzGuideAt(fr, e) {
  if (!MZ.guides || !mzPg()) return null; const g = mzPg().guides, tol = 5 / (fr.z || 1); if (!g.v.length && !g.h.length) return null;
  let b = null; g.v.forEach((x, i) => { const d = Math.abs(e.clientX - x); if (d <= tol && (!b || d < b.d)) b = {axis: 'v', i, d}; }); g.h.forEach((y, i) => { const d = Math.abs(e.clientY - y); if (d <= tol && (!b || d < b.d)) b = {axis: 'h', i, d}; }); return b;
}
/* arraste que continua valendo ao sair do quadro (iframe): ouve na janela principal E em cada quadro, convertendo a posição */
function mzHookDrag(move, up) {
  const L = [], stop = () => L.forEach(([t, ty, h]) => t.removeEventListener(ty, h, true)), conv = f => ev => { const b = f.ifr.getBoundingClientRect(), z = f.z || 1; return {clientX: b.left + ev.clientX * z, clientY: b.top + ev.clientY * z}; };
  const hook = (t, cv) => { const m = ev => move(cv(ev)), u = ev => { stop(); up(cv(ev)); }; [['pointermove', m], ['pointerup', u], ['pointercancel', u]].forEach(([ty, h]) => { t.addEventListener(ty, h, true); L.push([t, ty, h]); }); };
  hook(document, ev => ev); Object.values(MZ.frames).forEach(f => { if (f.doc) hook(f.doc, conv(f)); });
}
function mzGuidePointer(fr, e) {
  if (e.button !== 0 || !MZ.open || MZ.drag || (MZ.draw && MZ.draw.on) || (typeof MZK !== 'undefined' && (MZK.space || MZK.z))) return; const hit = mzGuideAt(fr, e); if (!hit) return;
  e.preventDefault(); e.stopImmediatePropagation(); const g = mzPg().guides, arr = hit.axis === 'v' ? g.v : g.h; MZ.drag = {kind: 'guide', fr};
  mzHookDrag(ev => { const p = mzToFrame(fr, ev.clientX, ev.clientY); arr[hit.i] = Math.round(hit.axis === 'v' ? p.x : p.y); mzGhost(true, 'Guia ' + arr[hit.i] + ' px'); const gh = document.querySelector('.mz-ghost'); if (gh) { gh.style.left = (ev.clientX + 14) + 'px'; gh.style.top = (ev.clientY + 14) + 'px'; } mzOverlayAll(); }, ev => {
    MZ.drag = null; mzGhost(false); const cv = document.getElementById('mzCanvas').getBoundingClientRect(), out = hit.axis === 'h' ? (ev.clientY < cv.top + 20 || ev.clientY > cv.bottom) : (ev.clientX < cv.left + 20 || ev.clientX > cv.right);
    if (out) { arr.splice(hit.i, 1); toast('Guia apagada.'); } mzTouch(); mzOverlayAll(); mzRefreshPanels();
  });
}
function mzGuideHover(fr, e) {
  if (!MZ.open || MZ.drag || (typeof MZK !== 'undefined' && (MZK.space || MZK.z))) return; const hit = mzGuideAt(fr, e), de = fr.doc.documentElement;
  if (hit) { de.style.cursor = hit.axis === 'v' ? 'col-resize' : 'row-resize'; fr.guideCur = true; } else if (fr.guideCur) { de.style.cursor = ''; fr.guideCur = false; }
}
const mzBindFrameBase2 = mzBindFrame;
mzBindFrame = function (fr) {
  const d = fr.doc; d.addEventListener('pointerdown', e => mzMultiPointer(fr, e), true); d.addEventListener('pointerdown', e => mzGuidePointer(fr, e), true); d.addEventListener('pointermove', e => mzGuideHover(fr, e), true); d.addEventListener('keydown', mzCtrlS, true); d.addEventListener('keyup', () => setTimeout(mzHandKeep, 0), true);
  return mzBindFrameBase2(fr);
};
/* a IA e o desenho mudam o trilho */
const mzAiToggleBase = mzAiToggle; mzAiToggle = function () { mzAiToggleBase(); mzRailSync(); };
const mzDrawToggleBase = mzDrawToggle; mzDrawToggle = function (on) { mzDrawToggleBase(on); mzRailSync(); };

/* ---------- seleção de vários irmãos (Shift+clique) para agrupar ---------- */
MZ.multi = [];
const mzSelectBase = mzSelect; mzSelect = function (id, o) { MZ.multi = []; return mzSelectBase(id, o); };
function mzMultiIds() { return MZ.sel ? [MZ.sel].concat(MZ.multi) : []; }
function mzMultiPointer(fr, e) {
  if (e.button !== 0 || !e.shiftKey || e.ctrlKey || e.metaKey || e.altKey || !MZ.open || !MZ.sel || (MZ.draw && MZ.draw.on) || (typeof MZK !== 'undefined' && (MZK.space || MZK.z))) return;
  const t = mzNodeAt(fr, e.clientX, e.clientY); if (!t) return; const id = t.dataset.n, a = mzFind(mzRoot(), MZ.sel), b = mzFind(mzRoot(), id); if (!a || !b || !a.parent || b.parent !== a.parent || id === MZ.sel || b.node.locked) return;
  e.preventDefault(); e.stopImmediatePropagation(); const i = MZ.multi.indexOf(id); if (i >= 0) MZ.multi.splice(i, 1); else MZ.multi.push(id); mzOverlayAll(); toast(MZ.multi.length + 1 + ' elementos selecionados: Ctrl+G agrupa.');
}
const mzOverlayBase = mzOverlay;
mzOverlay = function (fr) { mzOverlayBase(fr); if (!MZ.multi.length || !fr.ready || !fr.doc) return; MZ.multi.forEach(id => { const r = mzRectOf(mzElOf(fr, id)); if (r) mzOvEl(fr, 'ov-box', r); }); };
const mzGroupBase = mzGroup;
mzGroup = function () {
  if (!MZ.multi.length) return mzGroupBase(); const root = mzRoot(), ids = mzMultiIds(), fs = ids.map(i => mzFind(root, i)).filter(Boolean); if (fs.length < 2 || fs.some(f => !f.parent || f.parent !== fs[0].parent || f.node.type === 'section')) { toast('Selecione elementos irmãos (do mesmo contêiner) para agrupar.'); return; }
  fs.sort((x, y) => x.idx - y.idx); const par = fs[0].parent, fr = MZ.frames[MZ.bp], abs = fs.every(f => (mzStyleAt(f.node, MZ.bp).position === 'absolute')), g = mzNode('container', {}, {display: 'flex', flexDirection: 'column', gap: 16}, [], {name: 'Grupo'});
  if (abs && fr) { const rs = fs.map(f => mzRectOf(mzElOf(fr, f.node.id))), pel = par.type === 'page' ? null : mzElOf(fr, par.id), pr = pel ? mzRectOf(pel) : {left: 0, top: 0}, L = Math.min(...rs.map(r => r.left)), T = Math.min(...rs.map(r => r.top)), R = Math.max(...rs.map(r => r.right)), B = Math.max(...rs.map(r => r.bottom)); Object.assign(mzStyleSet(g, MZ.bp), {position: 'absolute', left: Math.round(L - pr.left) + 'px', top: Math.round(T - pr.top) + 'px', width: Math.round(R - L) + 'px', height: Math.round(B - T) + 'px', display: 'block'}); fs.forEach((f, i) => { const o = mzStyleSet(f.node, MZ.bp); o.left = Math.round(rs[i].left - L) + 'px'; o.top = Math.round(rs[i].top - T) + 'px'; }); }
  const at = fs[0].idx; fs.slice().reverse().forEach(f => par.children.splice(f.idx, 1)); g.children = fs.map(f => f.node); par.children.splice(at, 0, g); MZ.multi = []; MZ.sel = g.id; mzCommit({panels: true});
};
const mzUngroupBase = mzUngroup;
mzUngroup = function () {
  const f = MZ.sel && mzFind(mzRoot(), MZ.sel); if (f && f.node.type === 'container' && f.parent) { const st = mzStyleAt(f.node, MZ.bp); if (st.position === 'absolute') { const dl = parseFloat(st.left) || 0, dt = parseFloat(st.top) || 0; f.node.children.forEach(c => { const cs = mzStyleAt(c, MZ.bp); if (cs.position === 'absolute') { const o = mzStyleSet(c, MZ.bp); o.left = Math.round((parseFloat(cs.left) || 0) + dl) + 'px'; o.top = Math.round((parseFloat(cs.top) || 0) + dt) + 'px'; } }); } }
  return mzUngroupBase();
};
const mzDeleteBase = mzDelete;
mzDelete = function (id) { if (!id && MZ.multi.length) { const root = mzRoot(), fs = mzMultiIds().map(i => mzFind(root, i)).filter(f => f && f.parent && !f.node.locked).sort((a, b) => b.idx - a.idx); fs.forEach(f => f.parent.children.splice(f.parent.children.indexOf(f.node), 1)); MZ.multi = []; MZ.sel = ''; mzCommit({panels: true}); return; } return mzDeleteBase(id); };
