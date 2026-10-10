/* ===== Mesa de edição · motor do canvas =====
   Estado global MZ, quadros (iframes por breakpoint), sobreposição de seleção, seleção, arrastar (mover, inserir), redimensionar,
   guias, edição de texto no lugar e histórico (desfazer/refazer). Eventos por ponteiro, não por drag-and-drop HTML5. */
const MZ = {open: false, p: null, sel: '', hover: '', bp: 'd', view: 'one', zoom: 0, fit: true, tab: 'content', left: 'elements', q: '', comp: '', hist: [], hi: -1, clip: null, frames: {}, imgs: new Map(), drag: null, editing: null, lastSnap: 0, saveT: 0, dirty: false, guides: true, rulers: true, cols: {}, free: true, draw: {on: false, tool: 'pen', color: '#111111', size: 4}};
const mzM = () => MZ.p.mesa;
const mzPg = () => mzPage(mzM());
const mzRoot = () => MZ.comp ? (mzM().comps.find(c => c.id === MZ.comp) || {}).root || mzPg().root : mzPg().root;
const mzSelNode = () => MZ.sel ? (mzFind(mzRoot(), MZ.sel) || {}).node || null : null;
const mzZ = () => MZ.fit ? mzFitZoom() : MZ.zoom || 1;
function mzFitZoom() { const area = document.getElementById('mzCanvas'); if (!area) return 1; const bps = MZ.view === 'three' ? ['d', 't', 'm'] : [MZ.bp], need = bps.reduce((a, b) => a + MZ_BP[b], 0) + (bps.length - 1) * 40 + 80, w = area.clientWidth - 40; return Math.max(0.2, Math.min(1, w / need)); }

/* ---------- imagens (biblioteca do Studio → URL de blob) ---------- */
async function mzLoadImgs() {
  const ids = new Set(); const add = v => { if (v) ids.add(v); };
  const scan = n => mzWalk(n, x => { add(x.props.imgId); add(x.props.poster); (x.props.imgs || []).forEach(add); ['d', 't', 'm'].forEach(b => { const bi = x.style[b].backgroundImage; if (bi) String(bi).replace(/mzimg:([\w-]+)/g, (m, id) => { add(id); return m; }); }); });
  scan(mzPg().root); mzM().comps.forEach(c => scan(c.root));
  for (const id of ids) { if (MZ.imgs.has(id)) continue; try { const b = await imgGet(id); if (b) MZ.imgs.set(id, URL.createObjectURL(b)); } catch (e) { /* sem imagem */ } }
}
const mzImgFn = id => MZ.imgs.get(id) || '';

/* ---------- histórico ---------- */
function mzSnapData() { return JSON.stringify({root: MZ.comp ? mzRoot() : mzPg().root, ds: mzM().ds, comps: mzM().comps}); }
function mzSnap(force) { const j = mzSnapData(); if (!force && MZ.hist[MZ.hi] === j) return; MZ.hist = MZ.hist.slice(0, MZ.hi + 1); MZ.hist.push(j); if (MZ.hist.length > 80) MZ.hist.shift(); MZ.hi = MZ.hist.length - 1; mzUndoState(); }
function mzRestore(j) { const d = JSON.parse(j), m = mzM(); m.ds = d.ds; m.comps = d.comps; if (MZ.comp) { const c = m.comps.find(x => x.id === MZ.comp); if (c) c.root = d.root; } else mzPg().root = d.root; MZ.sel = (MZ.sel && mzFind(mzRoot(), MZ.sel)) ? MZ.sel : ''; }
function mzUndo() { if (MZ.hi <= 0) return; MZ.hi--; mzRestore(MZ.hist[MZ.hi]); mzTouch(); mzRender(); mzRefreshPanels(); mzUndoState(); }
function mzRedo() { if (MZ.hi >= MZ.hist.length - 1) return; MZ.hi++; mzRestore(MZ.hist[MZ.hi]); mzTouch(); mzRender(); mzRefreshPanels(); mzUndoState(); }
function mzUndoState() { const u = document.getElementById('mzUndo'), r = document.getElementById('mzRedo'); if (u) u.disabled = MZ.hi <= 0; if (r) r.disabled = MZ.hi >= MZ.hist.length - 1; }
/* mudança feita: guarda no histórico, salva e redesenha */
function mzCommit(o) { o = o || {}; mzSnap(); mzTouch(); if (!o.noRender) mzRender(); if (o.panels) mzRefreshPanels(); }
function mzTouch() { MZ.dirty = true; mzM().rev++; clearTimeout(MZ.saveT); MZ.saveT = setTimeout(() => { persist(); MZ.dirty = false; const s = document.getElementById('mzSaved'); if (s) s.textContent = '✓ Salvo ' + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}); }, 500); }

/* ---------- quadros (iframes) ---------- */
const MZ_ED_CSS = `html{overflow:hidden}body{margin:0;min-height:100vh;cursor:default;-webkit-user-select:none;user-select:none}[contenteditable]{-webkit-user-select:text;user-select:text;outline:none}
[data-type=section]:empty,[data-type=container]:empty,[data-type=column]:empty,[data-type=div]:empty,[data-type=form]:empty,[data-type=link]:empty,.mz-in:empty{min-height:64px;outline:1px dashed rgba(110,110,170,.55);outline-offset:-1px;position:relative}
[data-type=section]:empty::after,[data-type=container]:empty::after,[data-type=column]:empty::after,[data-type=div]:empty::after,[data-type=form]:empty::after,.mz-in:empty::after{content:"Solte um elemento aqui";position:absolute;inset:0;display:grid;place-items:center;font:12px system-ui;color:#8888a8;pointer-events:none}
body.mz-drawing,body.mz-drawing *{cursor:crosshair!important}#mzOv{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:2147483000;--u:1;font-family:system-ui,sans-serif}#mzOv *{pointer-events:none;box-sizing:border-box}
.ov-box{position:absolute;border:calc(2px*var(--u)) solid #2f6bff}.ov-hover{position:absolute;border:calc(1.5px*var(--u)) solid rgba(47,107,255,.55)}.ov-par{position:absolute;border:calc(1px*var(--u)) dashed rgba(47,107,255,.6)}
.ov-lab{position:absolute;background:#2f6bff;color:#fff;font:700 calc(11px*var(--u))/1 system-ui;padding:calc(4px*var(--u)) calc(7px*var(--u));border-radius:calc(4px*var(--u)) calc(4px*var(--u)) 0 0;white-space:nowrap;transform-origin:0 100%}
.ov-dim{position:absolute;background:#2f6bff;color:#fff;font:600 calc(10px*var(--u))/1 system-ui;padding:calc(3px*var(--u)) calc(6px*var(--u));border-radius:calc(4px*var(--u));white-space:nowrap}
.ov-h{position:absolute;width:calc(10px*var(--u));height:calc(10px*var(--u));background:#fff;border:calc(1.5px*var(--u)) solid #2f6bff;border-radius:calc(2px*var(--u));pointer-events:auto!important;transform:translate(-50%,-50%)}
.ov-pad{position:absolute;background:rgba(120,190,100,.28)}.ov-mar{position:absolute;background:rgba(246,178,107,.28)}.ov-drop{position:absolute;background:#ff3d7f;box-shadow:0 0 0 calc(1px*var(--u)) #fff}.ov-in{position:absolute;border:calc(2px*var(--u)) solid #ff3d7f;background:rgba(255,61,127,.08)}
.ov-g{position:absolute;background:#e83e8c;opacity:.8}`;
function mzFrameHtml(bp) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=${MZ_BP[bp]}"><link id="mzFonts" rel="stylesheet"><style id="mzPg"></style><style>${MZ_ED_CSS}</style></head><body><div id="mzRootEl"></div><div id="mzOv"></div></body></html>`;
}
function mzBuildFrames() {
  const cv = document.getElementById('mzFrames'); if (!cv) return; cv.innerHTML = ''; MZ.frames = {};
  const bps = MZ.view === 'three' ? ['d', 't', 'm'] : [MZ.bp];
  bps.forEach(bp => {
    const wrap = document.createElement('div'); wrap.className = 'mz-fr' + (bp === MZ.bp ? ' on' : ''); wrap.dataset.bp = bp;
    wrap.innerHTML = `<div class="mz-fr-h"><b>${MZ_BPN[bp]}</b> <span>${MZ_BP[bp]} px</span></div><div class="mz-fr-w"><iframe title="${MZ_BPN[bp]}" scrolling="no"></iframe></div>`;
    cv.appendChild(wrap); const ifr = wrap.querySelector('iframe'), fr = {bp, wrap, ifr, doc: null, ready: false}; MZ.frames[bp] = fr;
    ifr.addEventListener('load', () => { fr.doc = ifr.contentDocument; fr.ready = true; mzBindFrame(fr); if (MZ.draw.on) fr.doc.body.classList.add('mz-drawing'); mzRender(); });
    ifr.srcdoc = mzFrameHtml(bp);
    wrap.querySelector('.mz-fr-h').addEventListener('pointerdown', () => { if (MZ.bp !== bp) mzSetBp(bp); });
  });
}
function mzLayoutFrames() {
  const z = mzZ(); Object.values(MZ.frames).forEach(fr => {
    const w = MZ_BP[fr.bp]; fr.ifr.style.width = w + 'px'; fr.ifr.style.transform = `scale(${z})`; fr.ifr.style.transformOrigin = '0 0';
    const h = fr.doc && fr.doc.documentElement ? Math.max(700, fr.doc.getElementById('mzRootEl').scrollHeight + 160) : 900; fr.ifr.style.height = h + 'px';
    const ww = fr.wrap.querySelector('.mz-fr-w'); ww.style.width = Math.round(w * z) + 'px'; ww.style.height = Math.round(h * z) + 'px'; fr.z = z;
  });
  const zl = document.getElementById('mzZoomL'); if (zl) zl.textContent = Math.round(z * 100) + '%'; mzRulers();
}
let MZ_RAF = 0;
function mzRender() { if (MZ_RAF) return; MZ_RAF = requestAnimationFrame(() => { MZ_RAF = 0; mzRenderNow(); }); }
async function mzRenderNow() {
  if (!MZ.open) return; await mzLoadImgs(); const m = mzM(), root = mzRoot(), ctx = {mode: 'edit', comps: m.comps, img: mzImgFn};
  const css = mzTreeCss(root, m.ds, ctx) + (mzPg().bg ? `body{background:${mzPg().bg}}` : ''), html = mzNodeHtml(root, ctx), fu = mzFontsUrl(m.ds);
  Object.values(MZ.frames).forEach(fr => {
    if (!fr.ready || !fr.doc) return; if (MZ.editing && MZ.editing.fr === fr) return;
    fr.doc.getElementById('mzPg').textContent = css; const f = fr.doc.getElementById('mzFonts'); if (fu && f.getAttribute('href') !== fu) f.setAttribute('href', fu);
    fr.doc.getElementById('mzRootEl').innerHTML = html;
  });
  mzLayoutFrames(); mzOverlayAll(); mzTreeRefresh();
}
function mzSetBp(bp) { MZ.bp = bp; Object.values(MZ.frames).forEach(f => f.wrap.classList.toggle('on', f.bp === bp)); if (MZ.view === 'one') { mzBuildFrames(); } else mzOverlayAll(); document.querySelectorAll('[data-mzbp]').forEach(b => b.classList.toggle('on', b.dataset.mzbp === bp)); mzRefreshPanels(); }
function mzSetView(v) { MZ.view = v; document.querySelectorAll('[data-mzview]').forEach(b => b.classList.toggle('on', b.dataset.mzview === v)); mzBuildFrames(); }
function mzZoom(d) { MZ.fit = false; MZ.zoom = Math.max(0.2, Math.min(2, (mzZ() + d))); mzLayoutFrames(); mzOverlayAll(); }
function mzZoomFit() { MZ.fit = true; mzLayoutFrames(); mzOverlayAll(); }

/* ---------- utilitários de DOM ---------- */
const mzElOf = (fr, id) => fr.doc && id ? fr.doc.querySelector(`[data-n="${id}"]`) : null;
function mzRectOf(el) {
  if (!el) return null; const cs = el.ownerDocument.defaultView.getComputedStyle(el);
  if (cs.display === 'contents') { let r = null; Array.from(el.children).forEach(c => { const b = mzRectOf(c); if (b) r = r ? {left: Math.min(r.left, b.left), top: Math.min(r.top, b.top), right: Math.max(r.right, b.right), bottom: Math.max(r.bottom, b.bottom)} : {left: b.left, top: b.top, right: b.right, bottom: b.bottom}; }); return r && Object.assign(r, {width: r.right - r.left, height: r.bottom - r.top}); }
  const b = el.getBoundingClientRect(); return {left: b.left, top: b.top, right: b.right, bottom: b.bottom, width: b.width, height: b.height};
}
function mzNodeAt(fr, x, y, skipId) {
  const els = fr.doc.elementsFromPoint(x, y); let top = null;
  for (const e of els) { const n = e.closest && e.closest('[data-n]'); if (!n) continue; let t = n; const comp = t.closest('.mz-comp[data-n]'); if (comp) t = comp; const id = t.dataset.n; if (skipId && (id === skipId || mzDescOf(skipId, id))) continue; top = t; break; }
  return top;
}
const mzDescOf = (anc, id) => { const f = mzFind(mzRoot(), anc); return !!(f && f.node && mzFind(f.node, id) && f.node.id !== id); };

/* ---------- sobreposição ---------- */
function mzOvEl(fr, cls, r, extra) { const d = fr.doc.createElement('div'); d.className = cls; if (r) { d.style.left = r.left + 'px'; d.style.top = r.top + 'px'; d.style.width = r.width + 'px'; d.style.height = r.height + 'px'; } if (extra) d.innerHTML = extra; fr.doc.getElementById('mzOv').appendChild(d); return d; }
function mzOverlayAll() { Object.values(MZ.frames).forEach(mzOverlay); }
function mzOverlay(fr) {
  if (!fr.ready || !fr.doc) return; const ov = fr.doc.getElementById('mzOv'); if (!ov) return; ov.innerHTML = ''; ov.style.setProperty('--u', String(1 / (fr.z || 1))); ov.style.height = fr.doc.getElementById('mzRootEl').scrollHeight + 'px';
  const u = 1 / (fr.z || 1);
  if (MZ.guides) { const g = mzPg().guides; g.v.forEach(x => { const d = mzOvEl(fr, 'ov-g'); d.style.left = x + 'px'; d.style.top = '0'; d.style.width = u + 'px'; d.style.height = '100%'; }); g.h.forEach(y => { const d = mzOvEl(fr, 'ov-g'); d.style.top = y + 'px'; d.style.left = '0'; d.style.height = u + 'px'; d.style.width = '100%'; }); }
  if (MZ.hover && MZ.hover !== MZ.sel) { const r = mzRectOf(mzElOf(fr, MZ.hover)); if (r) mzOvEl(fr, 'ov-hover', r); }
  if (!MZ.sel) return; const el = mzElOf(fr, MZ.sel), r = mzRectOf(el); if (!r) return; const f = mzFind(mzRoot(), MZ.sel); if (!f) return; const n = f.node, cs = fr.doc.defaultView.getComputedStyle(el);
  if (f.parent && f.parent.type !== 'page') { const pr = mzRectOf(mzElOf(fr, f.parent.id)); if (pr) { const pb = mzOvEl(fr, 'ov-par', pr), ps = fr.doc.defaultView.getComputedStyle(mzElOf(fr, f.parent.id)), kind = ps.display.includes('grid') ? 'grade' : ps.display.includes('flex') ? (ps.flexDirection.startsWith('row') ? 'flex →' : 'flex ↓') : ''; if (kind) { const t = mzOvEl(fr, 'ov-dim', null, kind); t.style.left = pr.right - 4 + 'px'; t.style.top = pr.top - 16 * u + 'px'; t.style.transform = 'translateX(-100%)'; t.style.background = '#6b7cff'; } } }
  if (cs.display !== 'contents') {
    const pad = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(parseFloat), mar = [cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft].map(parseFloat);
    if (pad.some(v => v > 0)) { mzOvEl(fr, 'ov-pad', {left: r.left, top: r.top, width: r.width, height: pad[0]}); mzOvEl(fr, 'ov-pad', {left: r.left, top: r.bottom - pad[2], width: r.width, height: pad[2]}); mzOvEl(fr, 'ov-pad', {left: r.left, top: r.top + pad[0], width: pad[3], height: r.height - pad[0] - pad[2]}); mzOvEl(fr, 'ov-pad', {left: r.right - pad[1], top: r.top + pad[0], width: pad[1], height: r.height - pad[0] - pad[2]}); }
    if (mar.some(v => v > 0)) { mzOvEl(fr, 'ov-mar', {left: r.left, top: r.top - mar[0], width: r.width, height: mar[0]}); mzOvEl(fr, 'ov-mar', {left: r.left, top: r.bottom, width: r.width, height: mar[2]}); mzOvEl(fr, 'ov-mar', {left: r.left - mar[3], top: r.top, width: mar[3], height: r.height}); mzOvEl(fr, 'ov-mar', {left: r.right, top: r.top, width: mar[1], height: r.height}); }
  }
  mzOvEl(fr, 'ov-box', r); const lab = mzOvEl(fr, 'ov-lab', null, `${mzEsc(n.name || MZ_NAMES[n.type] || n.type)}${n.locked ? ' 🔒' : ''}`); lab.style.left = r.left + 'px'; lab.style.top = (r.top - 20 * u) + 'px';
  const dm = mzOvEl(fr, 'ov-dim', null, `${Math.round(r.width)} × ${Math.round(r.height)}`); dm.style.left = (r.left + r.width / 2) + 'px'; dm.style.top = (r.bottom + 8 * u) + 'px'; dm.style.transform = 'translateX(-50%)';
  if (!n.locked && f.parent && !fr.dragging) { [['nw', 0, 0], ['n', .5, 0], ['ne', 1, 0], ['e', 1, .5], ['se', 1, 1], ['s', .5, 1], ['sw', 0, 1], ['w', 0, .5]].forEach(([k, fx, fy]) => { const h = mzOvEl(fr, 'ov-h'); h.dataset.h = k; h.style.left = (r.left + r.width * fx) + 'px'; h.style.top = (r.top + r.height * fy) + 'px'; h.style.cursor = {n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize', nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize'}[k]; }); }
}

/* ---------- seleção ---------- */
function mzSelect(id, o) { o = o || {}; if (MZ.editing) mzEndEdit(true); MZ.sel = id || ''; mzOverlayAll(); mzRefreshPanels(); if (!o.noTree) mzTreeRefresh(); }
function mzHoverSet(id) { if (MZ.hover === id) return; MZ.hover = id; mzOverlayAll(); }

/* ---------- eventos do quadro ---------- */
function mzBindFrame(fr) {
  const d = fr.doc, win = d.defaultView; d.addEventListener('pointerdown', e => { if (MZ.draw && MZ.draw.on && e.button === 0) { e.preventDefault(); e.stopImmediatePropagation(); mzDrawStart(fr, e); } }, true);
  d.addEventListener('pointermove', e => { if (MZ.drag || MZ.editing) return; const t = mzNodeAt(fr, e.clientX, e.clientY); mzHoverSet(t ? t.dataset.n : ''); });
  d.addEventListener('pointerleave', () => { if (!MZ.drag) mzHoverSet(''); });
  d.addEventListener('pointerdown', e => {
    if (e.button !== 0 && e.button !== 2) return; MZ.menuClose && mzMenuClose();
    if (MZ.bp !== fr.bp) mzSetBpQuiet(fr.bp); const hd = e.target.closest && e.target.closest('[data-h]'); if (hd) return;
    if (MZ.editing) { if (e.target.closest('[contenteditable]')) return; mzEndEdit(true); }
    const t = mzNodeAt(fr, e.clientX, e.clientY); if (!t) { mzSelect(''); return; } const id = t.dataset.n; if (e.button === 2) { if (MZ.sel !== id) mzSelect(id); return; }
    e.preventDefault(); win.focus(); if (MZ.sel !== id) mzSelect(id); const f = mzFind(mzRoot(), id); if (!f || !f.parent) return;
    if (f.node.locked) return; MZ.drag = {kind: 'move', fr, id, x0: e.clientX, y0: e.clientY, on: false, f: null}; const dr = MZ.drag;
  });
  d.addEventListener('pointermove', e => { const dr = MZ.drag; if (!dr || dr.fr !== fr || dr.kind !== 'move') return; mzDragMove(fr, e.clientX, e.clientY, e); });
  d.addEventListener('pointerup', e => { const dr = MZ.drag; if (dr && dr.fr === fr && dr.kind === 'move') mzDragEnd(fr, e.clientX, e.clientY, e); });
  d.addEventListener('pointercancel', e => { if (MZ.drag && MZ.drag.fr === fr && MZ.drag.kind === 'move') { MZ.drag = null; fr.dragging = false; mzGhost(false); mzOverlay(fr); } });
  d.addEventListener('pointerdown', e => { const hd = e.target.closest && e.target.closest('[data-h]'); if (hd && MZ.sel) { e.preventDefault(); mzResizeStart(fr, hd.dataset.h, e); } }, true);
  d.addEventListener('dblclick', e => { const t = mzNodeAt(fr, e.clientX, e.clientY); if (t) mzStartEdit(fr, t.dataset.n); });
  d.addEventListener('contextmenu', e => { e.preventDefault(); const t = mzNodeAt(fr, e.clientX, e.clientY); if (t && MZ.sel !== t.dataset.n) mzSelect(t.dataset.n); const b = fr.ifr.getBoundingClientRect(), z = fr.z || 1; mzMenuOpen(b.left + e.clientX * z, b.top + e.clientY * z); });
  d.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a'); if (a) e.preventDefault(); });
  d.addEventListener('keydown', mzKey); d.addEventListener('wheel', e => { if (e.ctrlKey) { e.preventDefault(); mzZoom(e.deltaY < 0 ? 0.05 : -0.05); } }, {passive: false});
}
function mzSetBpQuiet(bp) { MZ.bp = bp; Object.values(MZ.frames).forEach(f => f.wrap.classList.toggle('on', f.bp === bp)); document.querySelectorAll('[data-mzbp]').forEach(b => b.classList.toggle('on', b.dataset.mzbp === bp)); mzRefreshPanels(); }

/* escudo: capta os eventos do ponteiro na janela inteira durante um arraste (o iframe não os repassa ao documento pai) */
function mzShield(onMove, onUp, cursor) {
  const sh = document.createElement('div'); sh.className = 'mz-shield'; if (cursor) sh.style.cursor = cursor; document.body.appendChild(sh);
  const mv = e => onMove(e), up = e => { sh.removeEventListener('pointermove', mv); sh.removeEventListener('pointerup', up); sh.removeEventListener('pointercancel', up); sh.remove(); onUp(e); };
  sh.addEventListener('pointermove', mv); sh.addEventListener('pointerup', up); sh.addEventListener('pointercancel', up); try { } catch (e) { /* ok */ } return sh;
}
/* ---------- arrastar: mover entre contêineres, inserir da biblioteca, mover livre (absolute) ---------- */
function mzAxis(el) { const cs = el.ownerDocument.defaultView.getComputedStyle(el); if (cs.display.includes('grid')) return 'grid'; if (cs.display.includes('flex')) return cs.flexDirection.startsWith('row') ? (cs.flexWrap === 'nowrap' ? 'x' : 'grid') : 'y'; return 'y'; }
function mzDropAt(fr, x, y, item) {
  const root = mzRoot(), isSec = item.type === 'section', rootIsPage = root.type === 'page'; let tEl = mzNodeAt(fr, x, y, item.id), tNode = tEl ? (mzFind(root, tEl.dataset.n) || {}).node : null;
  if (!tNode) tNode = root; let tId = tNode.id;
  if (rootIsPage && (isSec || tNode === root)) { // seção só na raiz da página
    let top = tNode; if (tNode !== root) { const path = []; mzWalk(root, (n, p) => { if (n.id === tId) { let c = n; while (c && c !== root) { path.unshift(c); const pf = mzFind(root, c.id); c = pf.parent; } } }); top = path[0] || tNode; }
    if (isSec) { if (top === root) return {parent: root, index: root.children.length, rect: null}; const el = mzElOf(fr, top.id), r = mzRectOf(el), idx = root.children.indexOf(top), after = y > r.top + r.height / 2; return {parent: root, index: idx + (after ? 1 : 0), line: after ? {left: r.left, top: r.bottom, width: r.width, height: 3} : {left: r.left, top: r.top, width: r.width, height: 3}}; }
    if (tNode === root) { return {parent: root, index: root.children.length, wrap: true, rect: null}; }
  }
  let cont = tNode, idx;
  if (!mzIsCont(tNode) || tNode.type === 'link' && false) { const pf = mzFind(root, tNode.id); cont = pf.parent || root; const el = mzElOf(fr, tNode.id), r = mzRectOf(el), ax = mzAxis(mzElOf(fr, cont.id) || el), after = ax === 'x' ? x > r.left + r.width / 2 : y > r.top + r.height / 2; idx = pf.idx + (after ? 1 : 0); const line = ax === 'x' ? {left: after ? r.right : r.left, top: r.top, width: 3, height: r.height} : {left: r.left, top: after ? r.bottom : r.top, width: r.width, height: 3}; return {parent: cont, index: idx, line}; }
  const cel = mzElOf(fr, cont.id), inner = cel && cel.querySelector(':scope > .mz-in') || cel, ax = inner ? mzAxis(inner) : 'y', kids = cont.children.filter(k => !k.hidden && k.id !== item.id);
  if (!kids.length) return {parent: cont, index: 0, rect: mzRectOf(inner || cel)};
  idx = kids.length; let line = null;
  for (let i = 0; i < kids.length; i++) { const r = mzRectOf(mzElOf(fr, kids[i].id)); if (!r) continue; const before = ax === 'x' ? x < r.left + r.width / 2 : ax === 'y' ? y < r.top + r.height / 2 : (y < r.top + r.height * 0.5 || (y < r.bottom && x < r.left + r.width / 2)); if (before) { idx = i; line = ax === 'x' || ax === 'grid' ? {left: r.left - 2, top: r.top, width: 3, height: r.height} : {left: r.left, top: r.top - 2, width: r.width, height: 3}; break; } }
  if (!line) { const r = mzRectOf(mzElOf(fr, kids[kids.length - 1].id)); if (r) line = ax === 'x' || ax === 'grid' ? {left: r.right, top: r.top, width: 3, height: r.height} : {left: r.left, top: r.bottom, width: r.width, height: 3}; }
  const full = cont.children.filter(k => k.id !== item.id); const realIdx = idx >= kids.length ? full.length : full.indexOf(kids[idx]);
  return {parent: cont, index: realIdx, line};
}
function mzDropDraw(fr, drop) {
  mzOverlay(fr); if (!drop) return; if (drop.line) mzOvEl(fr, 'ov-drop', drop.line); else if (drop.rect) mzOvEl(fr, 'ov-in', drop.rect); else if (drop.parent) { const r = mzRectOf(mzElOf(fr, drop.parent.id)); if (r) mzOvEl(fr, 'ov-in', r); }
}
function mzDragMove(fr, x, y, e) {
  const dr = MZ.drag; if (!dr) return; if (!dr.on) { if (Math.hypot(x - dr.x0, y - dr.y0) < 5) return; dr.on = true; fr.dragging = true; mzGhost(true, dr.label || 'Mover'); }
  const f = mzFind(mzRoot(), dr.id); if (dr.kind === 'move' && f && !dr.freed) { dr.freed = true; if (MZ.free !== !!(e && e.altKey)) mzFreeConvert(fr, dr, f); }
  if (dr.kind === 'move' && f) { const st = mzStyleAt(f.node, MZ.bp); if (st.position === 'absolute' || st.position === 'fixed') { dr.free = true; const dx = (x - dr.x0), dy = (y - dr.y0); if (!dr.base) dr.base = {l: parseFloat(st.left) || 0, t: parseFloat(st.top) || 0}; const o = mzStyleSet(f.node, MZ.bp); o.left = Math.round(dr.base.l + dx) + 'px'; o.top = Math.round(dr.base.t + dy) + 'px'; mzRenderNow(); return; } }
  const item = dr.kind === 'move' ? f.node : {type: dr.type, id: ''}; dr.drop = mzDropAt(fr, x, y, item); mzDropDraw(fr, dr.drop);
}
function mzDragEnd(fr, x, y, e) {
  const dr = MZ.drag; MZ.drag = null; fr.dragging = false; mzGhost(false); if (!dr || !dr.on) { mzOverlay(fr); return; }
  if (dr.free) { mzCommit({panels: true}); return; } const drop = dr.drop; if (!drop) { mzOverlay(fr); return; }
  if (dr.kind === 'move') mzMoveNode(dr.id, drop.parent.id, drop.index); mzOverlayAll();
}
let MZ_GHOST = null;
function mzGhost(on, label) { if (!on) { if (MZ_GHOST) MZ_GHOST.remove(); MZ_GHOST = null; return; } if (!MZ_GHOST) { MZ_GHOST = document.createElement('div'); MZ_GHOST.className = 'mz-ghost'; document.body.appendChild(MZ_GHOST); } MZ_GHOST.textContent = label; }
document.addEventListener('pointermove', e => { if (MZ_GHOST) { MZ_GHOST.style.left = (e.clientX + 14) + 'px'; MZ_GHOST.style.top = (e.clientY + 14) + 'px'; } });
/* arrastar do painel esquerdo (pointer events entre painel e iframes) */
function mzLibDrag(e, spec) {
  if (e.button !== 0) return; const x0 = e.clientX, y0 = e.clientY; let on = false, fr = null, drop = null; const L = [];
  const move = ev => {
    if (!on) { if (Math.hypot(ev.clientX - x0, ev.clientY - y0) < 6) return; on = true; mzGhost(true, spec.label); document.body.classList.add('mz-dragging'); }
    const gh = document.querySelector('.mz-ghost'); if (gh) { gh.style.left = (ev.clientX + 14) + 'px'; gh.style.top = (ev.clientY + 14) + 'px'; }
    fr = mzFrameAt(ev.clientX, ev.clientY); if (!fr) { drop = null; mzOverlayAll(); return; } const p = mzToFrame(fr, ev.clientX, ev.clientY); drop = mzDropAt(fr, p.x, p.y, {type: spec.type, id: ''}); Object.values(MZ.frames).forEach(f => { if (f !== fr) mzOverlay(f); }); mzDropDraw(fr, drop);
  };
  const up = ev => { L.forEach(([t, ty, h]) => t.removeEventListener(ty, h, true)); mzGhost(false); document.body.classList.remove('mz-dragging'); if (!on) { mzInsertSpec(spec); return; } if (fr && drop) mzInsertSpec(spec, drop); mzOverlayAll(); };
  /* o ponteiro pode estar sobre o painel ou sobre um quadro (iframe): ouve nos dois e converte as coordenadas */
  const hook = (target, conv) => { const m = ev => { ev.stopPropagation(); move(conv(ev)); }, u = ev => { ev.stopPropagation(); up(conv(ev)); }; [['pointermove', m], ['pointerup', u], ['pointercancel', u]].forEach(([ty, h]) => { target.addEventListener(ty, h, true); L.push([target, ty, h]); }); };
  hook(document, ev => ev); Object.values(MZ.frames).forEach(f => { if (f.doc) hook(f.doc, ev => { const b = f.ifr.getBoundingClientRect(), z = f.z || 1; return {clientX: b.left + ev.clientX * z, clientY: b.top + ev.clientY * z}; }); });
}
function mzFrameAt(cx, cy) { for (const fr of Object.values(MZ.frames)) { const b = fr.ifr.getBoundingClientRect(); if (cx >= b.left && cx <= b.right && cy >= b.top && cy <= b.bottom) return fr; } return null; }
function mzToFrame(fr, cx, cy) { const b = fr.ifr.getBoundingClientRect(), z = fr.z || 1; return {x: (cx - b.left) / z, y: (cy - b.top) / z}; }

/* ---------- redimensionar ---------- */
function mzResizeStart(fr, h, e) {
  const f = mzFind(mzRoot(), MZ.sel); if (!f) return; const el = mzElOf(fr, MZ.sel), r = mzRectOf(el); MZ.drag = {kind: 'resize', fr, id: MZ.sel, h, x0: e.clientX, y0: e.clientY, r, on: true, aspect: r.width / Math.max(1, r.height), node: f.node};
  const move = ev => mzResizeMove(fr, ev), up = ev => { fr.doc.removeEventListener('pointermove', move); fr.doc.removeEventListener('pointerup', up); fr.doc.removeEventListener('pointercancel', up); MZ.drag = null; mzCommit({panels: true}); }; fr.doc.addEventListener('pointermove', move); fr.doc.addEventListener('pointerup', up); fr.doc.addEventListener('pointercancel', up);
}
function mzResizeMove(fr, e) {
  const dr = MZ.drag; if (!dr || dr.kind !== 'resize') return; const dx = e.clientX - dr.x0, dy = e.clientY - dr.y0, h = dr.h, n = dr.node; let w = dr.r.width, hh = dr.r.height, sx = h.includes('e') ? 1 : h.includes('w') ? -1 : 0, sy = h.includes('s') ? 1 : h.includes('n') ? -1 : 0;
  if (sx) w = Math.max(20, dr.r.width + sx * dx); if (sy) hh = Math.max(12, dr.r.height + sy * dy);
  if ((e.shiftKey || n.type === 'image') && sx && sy) hh = w / dr.aspect; else if (e.shiftKey && sx) hh = w / dr.aspect;
  // encaixe nas guias verticais/horizontais e na largura da página
  const snap = (v, arr) => { const t = arr.find(g => Math.abs(g - v) < 6); return t == null ? v : t; };
  const o = mzStyleSet(n, MZ.bp), stp = mzStyleAt(n, MZ.bp), abs = stp.position === 'absolute';
  if (sx) { const right = snap(dr.r.left + w, mzPg().guides.v.concat([MZ_BP[MZ.bp]])); w = right - dr.r.left; o.width = Math.round(w) + 'px'; if (abs && sx < 0) o.left = Math.round((parseFloat(stp.left) || 0) + (dr.r.width - w)) + 'px'; }
  if (sy) { const bot = snap(dr.r.top + hh, mzPg().guides.h); hh = bot - dr.r.top; if (n.type === 'image' || n.type === 'logo' || n.type === 'video' || n.type === 'spacer') o.height = Math.round(hh) + 'px'; else o.minHeight = Math.round(hh) + 'px'; if (n.type === 'image') o.aspectRatio = 'auto'; }
  mzRenderNow();
}

/* ---------- edição de texto no lugar ---------- */
const MZ_EDITABLE = ['heading', 'text', 'button', 'badge'];
function mzStartEdit(fr, id) {
  const f = mzFind(mzRoot(), id); if (!f || f.node.locked || !MZ_EDITABLE.includes(f.node.type)) { if (f && f.node.type === 'image') mzPickImage(id); return; } const el = mzElOf(fr, id); if (!el) return;
  mzSelect(id); MZ.editing = {fr, id, el, type: f.node.type}; el.contentEditable = f.node.type === 'text' ? 'true' : 'plaintext-only'; if (el.contentEditable !== 'true' && el.contentEditable !== 'plaintext-only') el.contentEditable = 'true'; el.focus();
  const r = fr.doc.createRange(); r.selectNodeContents(el); const s = fr.doc.defaultView.getSelection(); s.removeAllRanges(); s.addRange(r);
  el.addEventListener('blur', () => { if (MZ.editing && MZ.editing.el === el) mzEndEdit(true); }, {once: true}); el.addEventListener('keydown', ev => { ev.stopPropagation(); if (ev.key === 'Escape') { mzEndEdit(false); } else if (ev.key === 'Enter' && f.node.type !== 'text' && !ev.shiftKey) { ev.preventDefault(); mzEndEdit(true); } else if ((ev.ctrlKey || ev.metaKey) && /^[biu]$/i.test(ev.key) && f.node.type === 'text') { /* formatação nativa */ } });
  mzRichBar(fr, el, f.node.type === 'text');
}
function mzEndEdit(save) {
  const ed = MZ.editing; if (!ed) return; MZ.editing = null; const f = mzFind(mzRoot(), ed.id); mzRichBarClose(); if (!f) { mzRender(); return; }
  if (save) { const n = f.node; if (ed.type === 'text') n.props.html = mzRich(ed.el.innerHTML); else if (ed.type === 'heading') n.props.text = ed.el.innerText.replace(/\n+/g, '\n').slice(0, 1500); else n.props.text = ed.el.innerText.replace(/\s+/g, ' ').trim().slice(0, 200); mzCommit({panels: true}); } else mzRender();
}
/* barra de formatação (negrito, itálico, sublinhado, link, cor, lista) no texto rico */
let MZ_RB = null;
function mzRichBar(fr, el, rich) {
  mzRichBarClose(); if (!rich) return; const b = fr.ifr.getBoundingClientRect(), z = fr.z || 1, r = el.getBoundingClientRect(); MZ_RB = document.createElement('div'); MZ_RB.className = 'mz-rb'; MZ_RB.style.left = Math.max(8, b.left + r.left * z) + 'px'; MZ_RB.style.top = Math.max(60, b.top + r.top * z - 46) + 'px';
  MZ_RB.innerHTML = `<button data-c="bold"><b>B</b></button><button data-c="underline"><u>U</u></button><button data-c="italic"><i>I</i></button><button data-c="link">🔗</button><input type="color" data-c="foreColor" value="#e4572e" title="Cor do texto"><button data-c="insertUnorderedList">• Lista</button>`;
  MZ_RB.addEventListener('pointerdown', ev => ev.preventDefault()); MZ_RB.addEventListener('click', ev => { const t = ev.target.closest('[data-c]'); if (!t) return; const c = t.dataset.c; fr.doc.defaultView.focus(); el.focus(); if (c === 'link') { const u = prompt('Endereço do link (https://...)'); if (u && MZ_URL(u)) fr.doc.execCommand('createLink', false, u); } else if (c !== 'foreColor') fr.doc.execCommand(c, false, null); });
  MZ_RB.querySelector('input').addEventListener('input', ev => { el.focus(); fr.doc.execCommand('foreColor', false, ev.target.value); }); document.body.appendChild(MZ_RB);
}
function mzRichBarClose() { if (MZ_RB) MZ_RB.remove(); MZ_RB = null; }
function mzPickImage(id) { libPick(r => { const f = mzFind(mzRoot(), id); if (!f) return; const li = libItem(r); f.node.props.imgId = li ? li.imgId : r; mzCommit({panels: true}); }, {raw: true, title: 'Escolher imagem'}); }

/* ---------- teclado ---------- */
function mzTyping(e) { const t = e.target; return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable); }
function mzKey(e) {
  if (!MZ.open) return; if (MZ.editing) return; if (mzTyping(e)) return; const k = e.key, mod = e.ctrlKey || e.metaKey;
  if (mod && k.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? mzRedo() : mzUndo(); return; } if (mod && k.toLowerCase() === 'y') { e.preventDefault(); mzRedo(); return; }
  if (mod && k.toLowerCase() === 'c') { e.preventDefault(); mzCopy(); return; } if (mod && k.toLowerCase() === 'x') { e.preventDefault(); mzCopy(); mzDelete(); return; } if (mod && k.toLowerCase() === 'v') { e.preventDefault(); mzPaste(); return; }
  if (mod && k.toLowerCase() === 'd') { e.preventDefault(); mzDup(); return; } if (mod && k.toLowerCase() === 'g') { e.preventDefault(); e.shiftKey ? mzUngroup() : mzGroup(); return; } if (mod && k.toLowerCase() === 's') { e.preventDefault(); persist(); toast('Salvo.'); return; }
  if (k === 'Delete' || k === 'Backspace') { e.preventDefault(); mzDelete(); return; } if (k === 'Escape') { if (MZ.draw && MZ.draw.on) { mzDrawToggle(false); return; } if (MZ.sel) mzSelect(''); else mzClose(); return; }
  if (k === 'Enter' && MZ.sel) { const fr = MZ.frames[MZ.bp]; if (fr) mzStartEdit(fr, MZ.sel); return; }
  if (k === '[') { mzMoveStep(-1); return; } if (k === ']') { mzMoveStep(1); return; }
  if (/^Arrow/.test(k) && MZ.sel) { const n = mzSelNode(); if (!n) return; const st = mzStyleAt(n, MZ.bp); if (st.position === 'absolute') { e.preventDefault(); const s = e.shiftKey ? 10 : 1, o = mzStyleSet(n, MZ.bp); if (k === 'ArrowLeft') o.left = ((parseFloat(st.left) || 0) - s) + 'px'; if (k === 'ArrowRight') o.left = ((parseFloat(st.left) || 0) + s) + 'px'; if (k === 'ArrowUp') o.top = ((parseFloat(st.top) || 0) - s) + 'px'; if (k === 'ArrowDown') o.top = ((parseFloat(st.top) || 0) + s) + 'px'; mzCommit({panels: true}); } else if (k === 'ArrowUp') { e.preventDefault(); mzMoveStep(-1); } else if (k === 'ArrowDown') { e.preventDefault(); mzMoveStep(1); } }
}
document.addEventListener('keydown', e => { if (MZ.open && !e.defaultPrevented) mzKey(e); });
/* escreve o estilo no breakpoint atual (desktop = base; tablet e mobile = só ali) */
function mzStyleSet(n, bp) { return n.style[bp || MZ.bp] || (n.style[bp || MZ.bp] = {}); }
