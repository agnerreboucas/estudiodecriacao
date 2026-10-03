/* ===== Editora · hub: abas (e-books, motor de texto, engenheiro de capa, diagramação, Amazon) e banco de referências compartilhado ===== */
const EDH_TABS = [['livros', 'E-books', 'book'], ['texto', 'Motor de texto', 'sparkles'], ['capa', 'Engenheiro de capa', 'palette'], ['diag', 'Diagramação', 'layout'], ['amazon', 'Amazon KDP', 'send']];
const edh = {area: 'livros'};
function edTabs(active) {
  return `<div class="edh-tabs">${EDH_TABS.map(([k, l, ic]) => `<button class="edh-tab ${active === k ? 'on' : ''}" onclick="edGo('${k}')">${ico(ic, 15)} ${l}</button>`).join('')}</div>`;
}
function edGo(k) {
  edh.area = k; if (typeof mot !== 'undefined') mot.open = k === 'texto';
  if (k === 'texto') { if (typeof motM === 'function') motM().stage = motM().stage || 'material'; }
  if (k === 'diag') { dui.id = ''; go('diagram'); return; }
  if (k === 'livros') eui.id = '';
  go('editora');
}

/* ---------- banco de referências (usa as imagens da página Inspiração) ---------- */
const bank = {cat: ''};
function refBankHTML(ctx, cats) {
  const I = inspo(), all = I.items.filter(i => i.imgId), list = all.filter(i => !bank.cat || i.cat === bank.cat).slice(0, 36), cs = inspoCats().filter(c => cats.includes(c.id) || all.some(i => i.cat === c.id));
  return `<div class="okr-label">BANCO DE REFERÊNCIAS <small class="muted">(da página Inspiração)</small></div><div class="tchips" style="margin:4px 0"><button class="tchip ${bank.cat ? '' : 'on'}" onclick="bank.cat='';edhRefresh('${ctx}')">Todas</button>${cs.map(c => `<button class="tchip ${bank.cat === c.id ? 'on' : ''}" onclick="bank.cat='${esc(c.id)}';edhRefresh('${ctx}')">${esc(c.label)}</button>`).join('')}</div>
  ${list.length ? `<div class="bank-grid">${list.map(i => `<button class="bank-th" title="${esc(i.title)}" onclick="bankPick('${ctx}','${esc(i.id)}')"><img data-bank="${esc(i.imgId)}" alt=""></button>`).join('')}</div>` : '<p class="muted" style="font-size:12px;margin:4px 0">Nenhuma imagem nesta categoria ainda.</p>'}
  <div class="row-gap" style="margin:6px 0 10px"><button class="btn sm" onclick="go('inspiration')">＋ Subir referências (Inspiração)</button><button class="btn sm" onclick="edhRefresh('${ctx}')">↻ Atualizar</button></div>`;
}
function edhRefresh(ctx) { if (ctx === 'dtp') dtpPanel(); else if (ctx === 'cov' && typeof covRender === 'function') covRender(); }
async function bankFill() { for (const im of document.querySelectorAll('img[data-bank]')) { const u = await inspoURL(im.dataset.bank); if (u) im.src = u; } }
async function bankPick(ctx, id) {
  const it = inspo().items.find(i => i.id === id), b = it && await imgGet(it.imgId); if (!b) { toast('Imagem não encontrada.'); return; } const bm = await createImageBitmap(b);
  if (ctx === 'dtp') { dui.ref = bm; dui.refOn = true; dui.refRes = null; dtpPanel(); dtpDraw(); toast('Referência carregada sobre a página.'); }
  else if (ctx === 'cov') { cov.ref = bm; cov.refBlob = b; covRender(); toast('Referência escolhida para a capa.'); }
}
