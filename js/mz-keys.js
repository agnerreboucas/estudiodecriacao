/* Atalhos de navegação da Mesa, no estilo do Photoshop.
   Espaço (segurado) + arrastar = mover a prancheta (mão).  Z (segurado) + clique = aproxima; Z + Alt + clique = afasta.
   Alt + roda do mouse = zoom no ponto do cursor.  Ctrl + / Ctrl − = zoom, Ctrl 0 = ajustar, Ctrl 1 = 100%.
   Funciona com o foco na Mesa ou dentro do site (iframe). Não age enquanto você digita um texto. */
const MZK = {space: false, z: false, alt: false, ov: null, pan: null};
const MZK_STEPS = [0.2, 0.25, 0.33, 0.5, 0.67, 0.75, 1, 1.25, 1.5, 2, 3, 4];
const mzkCv = () => document.getElementById('mzCanvas');
function mzkSetZoom(z, cx, cy) {   // zoom mantendo o ponto (cx, cy) da tela parado
  const cv = mzkCv(); if (!cv) return; const old = mzZ(), nz = Math.max(0.2, Math.min(4, z)); if (Math.abs(nz - old) < 0.001) return;
  const r = cv.getBoundingClientRect(); if (cx == null) { cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
  const px = (cv.scrollLeft + cx - r.left) / old, py = (cv.scrollTop + cy - r.top) / old;
  MZ.fit = false; MZ.zoom = nz; mzLayoutFrames(); mzOverlayAll();
  cv.scrollLeft = px * nz - (cx - r.left); cv.scrollTop = py * nz - (cy - r.top); if (typeof mzRulers === 'function') mzRulers();
}
function mzkStep(dir, cx, cy) {   // próximo degrau da escala (25%, 33%, 50%, 100%, 200%…)
  const z = mzZ(); let t = z;
  if (dir > 0) t = MZK_STEPS.find(s => s > z + 0.005) || z; else t = [...MZK_STEPS].reverse().find(s => s < z - 0.005) || z;
  mzkSetZoom(t, cx, cy);
}
function mzkCursor() { if (!MZK.ov) return; MZK.ov.style.cursor = MZK.pan ? 'grabbing' : MZK.space ? 'grab' : MZK.alt ? 'zoom-out' : 'zoom-in'; }
function mzkOverlay(on) {
  if (!on) { if (MZK.ov) { MZK.ov.remove(); MZK.ov = null; } return; }
  if (MZK.ov || !mzkCv()) return;
  const r = mzkCv().getBoundingClientRect(), o = document.createElement('div'); o.className = 'mz-keyov';
  o.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;z-index:9000;touch-action:none`;
  o.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (MZK.space) { const cv = mzkCv(); MZK.pan = {x: e.clientX, y: e.clientY, sl: cv.scrollLeft, st: cv.scrollTop}; try { o.setPointerCapture(e.pointerId); } catch (x) { /* ok */ } mzkCursor(); }
    else if (MZK.z) { e.altKey || MZK.alt ? mzkStep(-1, e.clientX, e.clientY) : mzkStep(1, e.clientX, e.clientY); }
  });
  o.addEventListener('pointermove', e => { const p = MZK.pan; if (!p) return; const cv = mzkCv(); cv.scrollLeft = p.sl - (e.clientX - p.x); cv.scrollTop = p.st - (e.clientY - p.y); if (typeof mzRulers === 'function') mzRulers(); });
  const end = () => { if (MZK.pan) { MZK.pan = null; mzkCursor(); } }; o.addEventListener('pointerup', end); o.addEventListener('pointercancel', end);
  o.addEventListener('wheel', e => { e.preventDefault(); if (e.altKey || e.ctrlKey) mzkStep(e.deltaY < 0 ? 1 : -1, e.clientX, e.clientY); else { const cv = mzkCv(); cv.scrollLeft += e.deltaX; cv.scrollTop += e.deltaY; } }, {passive: false});
  document.body.appendChild(o); MZK.ov = o; mzkCursor();
}
function mzkSync() { mzkOverlay(MZK.space || MZK.z); mzkCursor(); }
function mzkReset() { MZK.space = MZK.z = MZK.alt = false; MZK.pan = null; mzkOverlay(false); }
function mzkDown(e) {
  if (!MZ.open || MZ.editing || mzTyping(e)) return; const k = e.key, mod = e.ctrlKey || e.metaKey;
  if (mod && !e.altKey && (k === '+' || k === '=' )) { e.preventDefault(); mzkStep(1); return; }
  if (mod && !e.altKey && (k === '-' || k === '_')) { e.preventDefault(); mzkStep(-1); return; }
  if (mod && k === '0') { e.preventDefault(); mzZoomFit(); return; }
  if (mod && k === '1') { e.preventDefault(); mzkSetZoom(1); return; }
  if (mod || (e.altKey && !MZK.z)) { if (k === 'Alt') MZK.alt = true; return; }
  if (k === 'Alt') { MZK.alt = true; if (MZK.z) { e.preventDefault(); mzkCursor(); } return; }
  if (k === ' ' || e.code === 'Space') { e.preventDefault(); if (!e.repeat) { MZK.space = true; mzkSync(); } return; }
  if ((k === 'z' || k === 'Z') && !e.shiftKey) { e.preventDefault(); if (!e.repeat) { MZK.z = true; mzkSync(); } return; }
}
function mzkUp(e) {
  const k = e.key; if (k === ' ' || e.code === 'Space') { MZK.space = false; MZK.pan = null; } if (k === 'z' || k === 'Z') MZK.z = false; if (k === 'Alt') MZK.alt = false;
  mzkSync();
}
function mzKeysBind(d) { d.addEventListener('keydown', mzkDown, true); d.addEventListener('keyup', mzkUp, true); }
mzKeysBind(document);
window.addEventListener('blur', mzkReset);
document.addEventListener('visibilitychange', () => { if (document.hidden) mzkReset(); });
