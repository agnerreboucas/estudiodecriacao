/* ===== Navegação voltar/avançar em todas as telas (histórico próprio do Studio) ===== */
const NAV = {stack: [], i: -1, restoring: false, max: 80};
function navSnap() {
  const s = {page: ui.page, tab: ui.tab, proj: state.activeProjectId};
  if (typeof edh !== 'undefined') s.area = edh.area;
  if (typeof mot !== 'undefined' && mot.open) { s.mot = 1; try { s.stage = motM().stage; } catch (e) { } }
  if (typeof eui !== 'undefined') { s.eb = eui.id; s.bt = eui.bt; }
  if (typeof dui !== 'undefined') { s.doc = dui.id; s.fb = dui.fromBook; }
  if (typeof dz !== 'undefined') { s.set = dz.setId; s.dzv = dz.view; }
  return s;
}
function navRecord() {
  if (NAV.restoring) return; const s = navSnap(), k = JSON.stringify(s);
  if (NAV.i >= 0 && NAV.stack[NAV.i].k === k) { navButtons(); return; }
  NAV.stack = NAV.stack.slice(0, NAV.i + 1); NAV.stack.push({k, s}); if (NAV.stack.length > NAV.max) NAV.stack.shift(); NAV.i = NAV.stack.length - 1; navButtons();
}
function navButtons() { const b = $('navBack'), f = $('navFwd'); if (b) b.disabled = NAV.i <= 0; if (f) f.disabled = NAV.i >= NAV.stack.length - 1; }
function navApply(s) {
  NAV.restoring = true;
  try {
    if (s.proj && s.proj !== state.activeProjectId && projectById(s.proj)) setActiveProject(s.proj);
    if (typeof edh !== 'undefined' && s.area) edh.area = s.area;
    if (typeof mot !== 'undefined') { mot.open = !!s.mot; if (s.mot && s.stage) { try { motM().stage = s.stage; } catch (e) { } } }
    if (typeof eui !== 'undefined') { eui.id = s.eb || ''; if (s.bt) eui.bt = s.bt; }
    if (typeof dui !== 'undefined') dui.fromBook = s.fb || '';
    if (typeof dui !== 'undefined') { if (s.doc && dui.id !== s.doc) { dui.id = s.doc; dui.pi = 0; dui.sel = null; dui.hist = []; dui.hi = -1; try { dtpSnap(); } catch (e) { } } else if (!s.doc) dui.id = ''; }
    if (typeof dz !== 'undefined') { dz.setId = s.set || ''; if (s.dzv) dz.view = s.dzv; }
    if (s.tab) ui.tab = s.tab;
    go(s.page);
  } finally { NAV.restoring = false; }
  navButtons();
}
function navBack() { if (NAV.i <= 0) return; NAV.i--; navApply(NAV.stack[NAV.i].s); }
function navFwd() { if (NAV.i >= NAV.stack.length - 1) return; NAV.i++; navApply(NAV.stack[NAV.i].s); }
['renderPage', 'renderEditora', 'renderDiagram', 'renderDesign'].forEach(n => { const f = window[n]; if (typeof f === 'function') window[n] = function () { const r = f.apply(this, arguments); try { navRecord(); } catch (e) { } return r; }; });
document.addEventListener('keydown', e => { if (e.altKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) { if (e.key === 'ArrowLeft') { e.preventDefault(); navBack(); } else if (e.key === 'ArrowRight') { e.preventDefault(); navFwd(); } } });
setTimeout(navRecord, 400);
