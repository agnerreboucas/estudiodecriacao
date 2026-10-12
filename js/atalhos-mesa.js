/* Atalhos estilo Photoshop nas duas mesas: Mesa de páginas (sites) e Mesa do Estúdio de Design (posts).
   Espaço + arrastar = mão · Z + clique = aproxima · Z + Alt + clique = afasta · Alt + roda = zoom no cursor · Ctrl + / − / 0 / 1.
   Não age enquanto você digita. Zoom por degraus, mantendo parado o ponto do clique. */
const MZK = {space: false, z: false, pan: null};
const MZK_STEPS = [0.25, 0.33, 0.5, 1, 1.25, 2, 4];
const mzkTyping = e => { const t = e.target; return !!(t && (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable)); };
const mzkNext = (z, dir) => dir > 0 ? (MZK_STEPS.find(s => s > z + 0.005) || MZK_STEPS[MZK_STEPS.length - 1]) : ([...MZK_STEPS].reverse().find(s => s < z - 0.005) || MZK_STEPS[0]);
const mzkDz = () => typeof ui !== 'undefined' && ui.page === 'design' && typeof dz !== 'undefined' && dz.view === 'editor' && !!document.getElementById('dzStage');
const mzkMz = () => typeof MZ !== 'undefined' && MZ.open && !!document.getElementById('mzCanvas');
const mzkActive = () => mzkMz() || mzkDz();

/* ---------- zoom em um ponto (coordenadas da janela principal) ---------- */
function mzkZoomMz(z, cx, cy) {
  const a = document.getElementById('mzCanvas'); if (!a) return; const r = a.getBoundingClientRect(), old = mzZ(); if (cx === undefined) { cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
  const px = cx - r.left + a.scrollLeft, py = cy - r.top + a.scrollTop; MZ.fit = false; MZ.zoom = Math.max(0.2, Math.min(4, z)); mzLayoutFrames(); mzOverlayAll();
  a.scrollLeft = px * MZ.zoom / old - (cx - r.left); a.scrollTop = py * MZ.zoom / old - (cy - r.top); mzRulers();
}
function mzkZoomDz(z, cx, cy) {
  const st = document.getElementById('dzStage'), cv = document.getElementById('dzCanvas'); if (!st || !cv) return; const r = st.getBoundingClientRect(), c = cv.getBoundingClientRect();
  if (cx === undefined) { cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
  const fx = c.width ? (cx - c.left) / c.width : .5, fy = c.height ? (cy - c.top) / c.height : .5; DZM.zoom = Math.max(0.1, Math.min(4, z)); dzFit(); dzDraw();
  const n = cv.getBoundingClientRect(); st.scrollLeft += n.left + fx * n.width - cx; st.scrollTop += n.top + fy * n.height - cy; dzRulers();
  const sel = document.querySelector('.dzm-zoom'); if (sel) { const v = String(Math.round(DZM.zoom * 100)); if (![...sel.options].some(o => o.value === v)) sel.add(new Option(v + '%', v)); sel.value = v; }
}
const mzkCur = () => (mzkMz() ? Math.round(mzZ() * 100) / 100 : dz.scale);
function mzkZoomTo(z, cx, cy) { if (mzkMz()) mzkZoomMz(z, cx, cy); else if (mzkDz()) mzkZoomDz(z, cx, cy); }
function mzkStep(dir, cx, cy) { mzkZoomTo(mzkNext(mzkCur(), dir), cx, cy); }
function mzkFit() { if (mzkMz()) mzZoomFit(); else if (mzkDz()) { DZM.zoom = null; dzFit(); dzDraw(); const sel = document.querySelector('.dzm-zoom'); if (sel) sel.value = 'fit'; } }
function mzkSetPct(p) { mzkZoomTo(p / 100); }

/* ---------- cursor (mão / lupa) ---------- */
function mzkCursor() {
  const c = MZK.pan ? 'grabbing' : MZK.space ? 'grab' : MZK.z ? (window.__mzkAlt ? 'zoom-out' : 'zoom-in') : '';
  document.body.classList.toggle('mzk-on', !!c); document.body.style.setProperty('--mzk-cur', c || 'auto');
  if (typeof MZ !== 'undefined' && MZ.frames) Object.values(MZ.frames).forEach(f => { if (f.doc && f.doc.documentElement) f.doc.documentElement.style.cursor = c; });
}
const mzkScroller = () => mzkMz() ? document.getElementById('mzCanvas') : document.getElementById('dzStage');

/* ---------- teclado ---------- */
function mzkKeyDown(e) {
  if (!mzkActive() || mzkTyping(e) || (typeof MZ !== 'undefined' && MZ.editing)) return false; window.__mzkAlt = e.altKey; const k = e.key, mod = e.ctrlKey || e.metaKey;
  if (e.code === 'Space' && !mod) { e.preventDefault(); if (!MZK.space) { MZK.space = true; mzkCursor(); } return true; }
  if (!mod && !e.altKey && k.toLowerCase() === 'z') { MZK.z = true; mzkCursor(); return true; }
  if (e.altKey && MZK.z) mzkCursor();
  if (mod && (k === '+' || k === '=')) { e.preventDefault(); mzkStep(1); return true; }
  if (mod && (k === '-' || k === '_')) { e.preventDefault(); mzkStep(-1); return true; }
  if (mod && k === '0') { e.preventDefault(); mzkFit(); return true; }
  if (mod && k === '1') { e.preventDefault(); mzkSetPct(100); return true; }
  return false;
}
function mzkKeyUp(e) {
  window.__mzkAlt = e.altKey; if (e.code === 'Space') { if (MZK.space) e.preventDefault(); MZK.space = false; }
  if (e.key && e.key.toLowerCase() === 'z') MZK.z = false; mzkCursor();
}
document.addEventListener('keydown', e => { if (mzkKeyDown(e)) e.stopImmediatePropagation(); }, true);
document.addEventListener('keyup', mzkKeyUp, true);
window.addEventListener('blur', () => { MZK.space = false; MZK.z = false; MZK.pan = null; mzkCursor(); });

/* ---------- mouse: mão e lupa ---------- */
function mzkPointer(e, toTop) {
  if (!mzkActive() || e.button !== 0) return false; const sc = mzkScroller(); if (!sc) return false; const t = toTop ? toTop(e) : {x: e.clientX, y: e.clientY};
  if (MZK.space) {
    e.preventDefault(); e.stopImmediatePropagation(); const doc = e.target.ownerDocument || document; MZK.pan = {sx: e.screenX, sy: e.screenY, l: sc.scrollLeft, t: sc.scrollTop}; mzkCursor();
    try { e.target.setPointerCapture(e.pointerId); } catch (_) { /* sem captura: segue pelo documento */ }
    const mv = ev => { if (!MZK.pan) return; sc.scrollLeft = MZK.pan.l - (ev.screenX - MZK.pan.sx); sc.scrollTop = MZK.pan.t - (ev.screenY - MZK.pan.sy); if (mzkMz()) mzRulers(); else dzRulers(); };
    const up = () => { MZK.pan = null; doc.removeEventListener('pointermove', mv, true); doc.removeEventListener('pointerup', up, true); doc.removeEventListener('pointercancel', up, true); mzkCursor(); };
    doc.addEventListener('pointermove', mv, true); doc.addEventListener('pointerup', up, true); doc.addEventListener('pointercancel', up, true); return true;
  }
  if (MZK.z) { e.preventDefault(); e.stopImmediatePropagation(); mzkStep(e.altKey ? -1 : 1, t.x, t.y); return true; }
  return false;
}
function mzkWheel(e, toTop) {
  if (!e.altKey || !mzkActive()) return; e.preventDefault(); e.stopImmediatePropagation(); const t = toTop ? toTop(e) : {x: e.clientX, y: e.clientY}; mzkStep(e.deltaY < 0 ? 1 : -1, t.x, t.y);
}
document.addEventListener('pointerdown', e => { const t = e.target; if (t.closest && (t.closest('#mzCanvas') || t.closest('#dzStage'))) mzkPointer(e); }, true);
document.addEventListener('wheel', e => { const t = e.target; if (t.closest && (t.closest('#mzCanvas') || t.closest('#dzStage'))) mzkWheel(e); }, {capture: true, passive: false});

/* quadros da Mesa de páginas (iframes): mesmos gestos, com a posição convertida para a janela principal */
const mzkBindFrameBase = mzBindFrame;
mzBindFrame = function (fr) {
  const d = fr.doc, toTop = e => { const b = fr.ifr.getBoundingClientRect(), z = fr.z || 1; return {x: b.left + e.clientX * z, y: b.top + e.clientY * z}; };
  d.addEventListener('pointerdown', e => mzkPointer(e, toTop), true); d.addEventListener('wheel', e => mzkWheel(e, toTop), {capture: true, passive: false});
  d.addEventListener('keydown', e => { if (mzkKeyDown(e)) e.stopImmediatePropagation(); }, true); d.addEventListener('keyup', mzkKeyUp, true);
  return mzkBindFrameBase(fr);
};
/* a Mesa de páginas passa a ir até 400% */
mzZoom = function (d) { MZ.fit = false; MZ.zoom = Math.max(0.2, Math.min(4, mzZ() + d)); mzLayoutFrames(); mzOverlayAll(); };
