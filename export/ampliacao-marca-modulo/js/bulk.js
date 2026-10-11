/* ===== Seleção em lote e exclusão (com Desfazer) =====
   Projetos, peças do Design, anúncios da Campanha, Biblioteca, Carrosséis e anúncios do Motor de Ofertas. */
const BK = {on: {}, sel: {}, ids: {}, undo: null, timer: 0};
const bkOn = s => !!BK.on[s];
const bkSel = s => BK.sel[s] || (BK.sel[s] = {});
const bkPicked = s => (BK.ids[s] || []).filter(id => bkSel(s)[id]);
const bkRe = re => keepScroll(() => { if (typeof window[re] === 'function') window[re](); });
function bkReset() { BK.on = {}; BK.sel = {}; }
function bkMode(s, on, re) { BK.on[s] = on; if (!on) BK.sel[s] = {}; bkRe(re); }
function bkTog(s, id, re) { const m = bkSel(s); if (m[id]) delete m[id]; else m[id] = 1; bkRe(re); }
function bkAll(s, re) { const m = bkSel(s); (BK.ids[s] || []).forEach(id => m[id] = 1); bkRe(re); }
function bkNone(s, re) { BK.sel[s] = {}; bkRe(re); }
/* barra: "Selecionar" → "N marcada(s) · Todas · Limpar · Excluir · Concluir" */
function bkBar(s, ids, re, delFn, noun) {
  BK.ids[s] = ids; if (!ids.length) return '';
  if (!bkOn(s)) return `<button class="btn sm" onclick="bkMode('${s}',true,'${re}')" title="Marcar vários para excluir de uma vez">☑ Selecionar</button>`;
  const n = bkPicked(s).length;
  return `<span class="bk-bar"><b class="bk-count">${n} ${noun}${n === 1 ? '' : 's'} marcad${noun.endsWith('a') ? 'a' : 'o'}${n === 1 ? '' : 's'}</b><button class="btn sm" onclick="bkAll('${s}','${re}')">Todos (${ids.length})</button><button class="btn sm" ${n ? '' : 'disabled'} onclick="bkNone('${s}','${re}')">Limpar</button><button class="btn sm danger" ${n ? '' : 'disabled'} onclick="${delFn}">🗑 Excluir${n ? ' (' + n + ')' : ''}</button><button class="btn sm" onclick="bkMode('${s}',false,'${re}')">Concluir</button></span>`;
}
const bkCls = (s, id) => bkOn(s) ? ' bk-sel' + (bkSel(s)[id] ? ' picked' : '') : '';
const bkClick = (s, id, re) => bkOn(s) ? ` onclick="bkTog('${s}','${id}','${re}')"` : '';
const bkChk = (s, id, re, inline) => bkOn(s) ? `<label class="bk-chk${inline ? ' inline' : ''}" onclick="event.stopPropagation()"><input type="checkbox" ${bkSel(s)[id] ? 'checked' : ''} onchange="bkTog('${s}','${id}','${re}')" aria-label="Marcar"></label>` : '';
/* utilitários de desfazer: guardam o item e a posição de origem */
const bkTake = (arr, pred) => { const rm = []; arr.forEach((x, i) => { if (pred(x)) rm.push({i, x}); }); return rm; };
const bkReinsert = (arr, rm) => rm.slice().sort((a, b) => a.i - b.i).forEach(r => arr.splice(Math.min(r.i, arr.length), 0, r.x));
function bkRefresh() { try { updateContextUI(); renderHome(); renderPage(ui.page); renderSyncBadge(); } catch (x) { } }
function bkUndo(msg, fn) {
  let b = $('bkUndo'); if (!b) { b = document.createElement('div'); b.id = 'bkUndo'; b.className = 'bk-undo'; document.body.appendChild(b); }
  BK.undo = fn; b.innerHTML = `<span>${esc(msg)}</span><button onclick="bkDoUndo()">Desfazer</button><button class="x" onclick="bkHideUndo()" aria-label="Fechar">×</button>`;
  b.classList.add('show'); clearTimeout(BK.timer); BK.timer = setTimeout(bkHideUndo, 30000);
}
function bkHideUndo() { const b = $('bkUndo'); if (b) b.classList.remove('show'); BK.undo = null; clearTimeout(BK.timer); }
function bkDoUndo() { const f = BK.undo; bkHideUndo(); if (f) f(); }
const bkPlural = (n, a, b) => n === 1 ? a : b;

/* ---- Projetos ---- */
function bkDelProjects(ids) {
  ids = (ids || bkPicked('prj')).filter(id => projectById(id)); if (!ids.length) return;
  const ps = ids.map(projectById), set = new Set(ids), names = ps.slice(0, 5).map(p => '• ' + p.name).join('\n') + (ps.length > 5 ? `\n• e mais ${ps.length - 5}` : '');
  const nArt = ps.reduce((a, p) => a + (p.design.sets || []).length + (p.carousels || []).length + (p.campaigns || []).length, 0) + state.creatives.filter(c => set.has(c.projectId)).length;
  if (!confirm(`Excluir ${ps.length === 1 ? 'o projeto' : ps.length + ' projetos'} e TUDO o que há dentro (${nArt} peça(s), campanhas, carrosséis, textos e o Motor de Ofertas)?\n\n${names}\n\nVocê poderá desfazer logo em seguida. Para guardar uma cópia, exporte antes.`)) return;
  const rmP = bkTake(state.projects, p => set.has(p.id)), rmC = bkTake(state.creatives, c => set.has(c.projectId)), prev = state.activeProjectId;
  state.projects = state.projects.filter(p => !set.has(p.id)); state.creatives = state.creatives.filter(c => !set.has(c.projectId));
  if (set.has(state.activeProjectId)) state.activeProjectId = state.projects[0] ? state.projects[0].id : '';
  bkReset(); persist();
  if (ui.page === 'project') go('projects'); else bkRefresh();
  bkUndo(`${ps.length} ${bkPlural(ps.length, 'projeto excluído', 'projetos excluídos')}.`, () => { bkReinsert(state.projects, rmP); bkReinsert(state.creatives, rmC); if (prev && projectById(prev)) state.activeProjectId = prev; persist(); bkRefresh(); toast('Restaurado.'); });
}
/* ---- Peças do Design ---- */
const bkCmpSetIds = p => new Set((p.campaigns || []).flatMap(c => c.pieces.flatMap(q => Object.values(q.sets))).filter(Boolean));
function bkDzBar(p) { const used = bkCmpSetIds(p); return bkBar('dz', p.design.sets.filter(s => !used.has(s.id)).map(s => s.id), 'renderDesign', 'bkDelSets()', 'peça'); }
const bkDzTag = (p, s) => bkOn('dz') && bkCmpSetIds(p).has(s.id) ? '<span class="bk-lock" title="Faz parte de uma campanha: apague em Campanhas → Anúncios">campanha</span>' : bkChk('dz', s.id, 'renderDesign');
function bkDelSets() {
  const p = curProject(); if (!p) return; const ids = bkPicked('dz'); if (!ids.length) return;
  if (!confirm(`Excluir ${ids.length} ${bkPlural(ids.length, 'peça', 'peças')}? Você poderá desfazer logo em seguida.`)) return;
  const set = new Set(ids), rm = bkTake(p.design.sets, s => set.has(s.id)), pid = p.id;
  p.design.sets = p.design.sets.filter(s => !set.has(s.id)); BK.sel.dz = {}; persist(); bkRefresh();
  bkUndo(`${rm.length} ${bkPlural(rm.length, 'peça excluída', 'peças excluídas')}.`, () => { const q = projectById(pid); if (!q) return; bkReinsert(q.design.sets, rm); persist(); bkRefresh(); toast('Peças restauradas.'); });
}
/* ---- Anúncios (peças) da Campanha: cada um leva as suas 3 medidas ---- */
function bkCmpBar(c) { return bkBar('cmp', c.pieces.filter(q => q.stage === cmpUI.phase).map(q => q.id), 'cmpRender', `bkDelCmp('${c.id}')`, 'anúncio'); }
function bkDelCmp(cid) {
  const p = curProject(), c = p && cmpOf(p, cid); if (!c) return; const ids = bkPicked('cmp'); if (!ids.length) return;
  if (!confirm(`Excluir ${ids.length} ${bkPlural(ids.length, 'anúncio', 'anúncios')} e as suas medidas (feed, vertical, horizontal)? Você poderá desfazer logo em seguida.`)) return;
  const set = new Set(ids), rmQ = bkTake(c.pieces, q => set.has(q.id)), sid = new Set(rmQ.flatMap(r => Object.values(r.x.sets)).filter(Boolean)), rmS = bkTake(p.design.sets, s => sid.has(s.id)), pid = p.id;
  c.pieces = c.pieces.filter(q => !set.has(q.id)); p.design.sets = p.design.sets.filter(s => !sid.has(s.id)); BK.sel.cmp = {}; persist(); bkRefresh();
  bkUndo(`${rmQ.length} ${bkPlural(rmQ.length, 'anúncio excluído', 'anúncios excluídos')}.`, () => { const q = projectById(pid), cc = q && cmpOf(q, cid); if (!cc) return; bkReinsert(cc.pieces, rmQ); bkReinsert(q.design.sets, rmS); persist(); bkRefresh(); toast('Anúncios restaurados.'); });
}
/* ---- Biblioteca (criações) ---- */
function bkLibBar(list) { return bkBar('lib', list.map(c => c.id), 'renderLibrary', 'bkDelCreatives()', 'peça'); }
function artCardSel(c) {
  return `<article class="tile${bkCls('lib', c.id)}" onclick="${bkOn('lib') ? `bkTog('lib','${c.id}','renderLibrary')` : `openCreative('${c.id}')`}">${bkChk('lib', c.id, 'renderLibrary')}<div class="art ${esc(c.cls)}"><div class="grid"></div><div class="orb"></div><small>${esc(c.type)}</small><h3>${esc(c.title)}</h3></div>
    <div class="tile-meta"><strong>${esc(c.title)}</strong><small>${esc(c.type)} · ${esc(c.status)}</small></div></article>`;
}
function bkDelCreatives() {
  const ids = bkPicked('lib'); if (!ids.length) return;
  if (!confirm(`Excluir ${ids.length} ${bkPlural(ids.length, 'peça', 'peças')} da biblioteca? Você poderá desfazer logo em seguida.`)) return;
  const set = new Set(ids), rm = bkTake(state.creatives, c => set.has(c.id)); state.creatives = state.creatives.filter(c => !set.has(c.id)); BK.sel.lib = {}; persist(); bkRefresh();
  bkUndo(`${rm.length} ${bkPlural(rm.length, 'peça excluída', 'peças excluídas')}.`, () => { bkReinsert(state.creatives, rm); persist(); bkRefresh(); toast('Peças restauradas.'); });
}
/* ---- Carrosséis ---- */
function bkCarBar(p) { return bkBar('car', carHomeList(p).map(x => x.id), 'renderCarrosseis', 'bkDelCars()', 'carrossel'); }
function bkDelCars() {
  const p = curProject(); if (!p) return; const ids = bkPicked('car'); if (!ids.length) return;
  if (!confirm(`Excluir ${ids.length} ${bkPlural(ids.length, 'carrossel', 'carrosséis')}? Você poderá desfazer logo em seguida.`)) return;
  const set = new Set(ids), rm = bkTake(p.carousels, x => set.has(x.id)), pid = p.id; p.carousels = p.carousels.filter(x => !set.has(x.id)); if (set.has(carUI.id)) carUI.id = ''; BK.sel.car = {}; persist(); bkRefresh();
  bkUndo(`${rm.length} ${bkPlural(rm.length, 'carrossel excluído', 'carrosséis excluídos')}.`, () => { const q = projectById(pid); if (!q) return; bkReinsert(q.carousels, rm); persist(); bkRefresh(); toast('Carrosséis restaurados.'); });
}
/* ---- Anúncios do Motor de Ofertas ---- */
function bkDelOfAds(ids) {
  const p = curProject(); if (!p) return; const e = ofEng(p); ids = ids || bkPicked('ofad'); if (!ids.length) return;
  if (!confirm(`Excluir ${ids.length} ${bkPlural(ids.length, 'anúncio', 'anúncios')} do Motor de Ofertas? A estratégia (conceito, ângulos, ofertas e copies) não muda. Você poderá desfazer logo em seguida.`)) return;
  const set = new Set(ids), rm = bkTake(e.ads, a => set.has(a.id)), pid = p.id; e.ads = e.ads.filter(a => !set.has(a.id)); ofLog(e, 'Anúncios excluídos', 'anuncios', rm.length + ''); BK.sel.ofad = {}; ofSave(); bkRefresh();
  bkUndo(`${rm.length} ${bkPlural(rm.length, 'anúncio excluído', 'anúncios excluídos')}.`, () => { const q = projectById(pid); if (!q) return; const ee = ofEng(q); bkReinsert(ee.ads, rm); ofLog(ee, 'Exclusão desfeita', 'anuncios', rm.length + ''); ofSetStatus(ee); persist(); bkRefresh(); toast('Anúncios restaurados.'); });
}
