/* ===== Biblioteca de referências: prints e imagens de sites e layouts que você admira.
   Ficam salvas (mesma biblioteca de imagens do app, com kind 'referencia') e podem ser abertas numa gaveta ao lado da edição,
   lado a lado ou sobrepostas à página com transparência. Use só referências para estudo de estrutura: não copie textos, logos ou fotos. ===== */
const REF = {q: '', tag: ''};
const refList = () => libList().filter(i => i.kind === 'referencia');
const refTags = () => [...new Set(refList().flatMap(i => (i.tags || []).filter(t => t !== 'referencia')))].sort((a, b) => a.localeCompare(b, 'pt'));
const refFiltered = () => refList().filter(i => (!REF.q || (i.name + ' ' + (i.tags || []).join(' ') + ' ' + (i.prompt || '')).toLowerCase().includes(REF.q.toLowerCase())) && (!REF.tag || (i.tags || []).includes(REF.tag)));
async function refUpload(files, tags) {
  const imgs = [...files].filter(f => /^image\//.test(f.type)); if (!imgs.length) { toast('Escolha imagens (PNG, JPG ou WebP).'); return 0; } let n = 0;
  for (const f of imgs.slice(0, 40)) { try { await libAddBlob(f, {name: f.name.replace(/\.[^.]+$/, '').slice(0, 80) || 'Referência', tags: ['referencia'].concat(tags || []), kind: 'referencia'}); n++; } catch (e) { toast(f.name + ': ' + e.message); } }
  if (n) toast(n + ' referência(s) salva(s) na biblioteca.'); if (ui.page === 'refs') renderRefs(); if (typeof esRefRefresh === 'function') esRefRefresh(); return n;
}
function refSet(id, k, v) { const it = libItem(id); if (!it) return; if (k === 'tags') it.tags = ['referencia'].concat(String(v).split(',').map(x => x.trim().slice(0, 40)).filter(Boolean)).slice(0, 10); else if (k === 'name') it.name = String(v).slice(0, 120) || 'Referência'; else if (k === 'note') it.prompt = String(v).slice(0, 4000); persist(); }
async function refDel(id) { const it = libItem(id); if (!it || !confirm('Excluir esta referência da biblioteca?')) return; state.imglib.items = libList().filter(x => x.id !== id); try { await imgDel(it.imgId); } catch (e) { /* o registro já saiu da lista */ } persist(); if (typeof ES !== 'undefined' && ES.ref && ES.ref.id === id) ES.ref.id = ''; if (ui.page === 'refs') renderRefs(); if (typeof esRefRefresh === 'function') esRefRefresh(); }
async function refView(id) {
  const it = libItem(id); if (!it) return; const b = await imgGet(it.imgId); if (!b) return; const u = URL.createObjectURL(b);
  showModal(esc(it.name), `<img src="${u}" alt="" style="max-width:100%;max-height:75vh;display:block;margin:0 auto;border-radius:8px"><div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button></div>`); $('modalBox').classList.add('wide');
}
function refCard(i) {
  return `<div class="rf-card"><button class="rf-th" onclick="refView('${i.id}')" aria-label="Abrir ${esc(i.name)}"><img data-lib="${i.imgId}" alt=""></button><div class="rf-bd"><input value="${esc(i.name)}" onchange="refSet('${i.id}','name',this.value)" aria-label="Nome"><input value="${esc((i.tags || []).filter(t => t !== 'referencia').join(', '))}" placeholder="Etiquetas: saúde, topo grande…" onchange="refSet('${i.id}','tags',this.value);renderRefs()" aria-label="Etiquetas"><textarea rows="2" placeholder="O que chamou a atenção neste layout?" onchange="refSet('${i.id}','note',this.value)" aria-label="Anotação">${esc(i.prompt || '')}</textarea><div class="row-gap"><button class="btn sm" onclick="refView('${i.id}')">Abrir</button><button class="btn sm" onclick="refDel('${i.id}')">Excluir</button></div></div></div>`;
}
function renderRefs() {
  const root = $('refsRoot'); if (!root) return; const l = refFiltered(), tags = refTags();
  root.innerHTML = esHead('Referências', 'Suba os layouts que você admira. Eles ficam salvos e abrem ao lado da página quando você está editando um site.') +
    `<div class="panel es-p rf-drop" id="rfDrop" ondragover="event.preventDefault();this.classList.add('on')" ondragleave="this.classList.remove('on')" ondrop="event.preventDefault();this.classList.remove('on');refUpload(event.dataTransfer.files)"><div><strong>Arraste imagens aqui</strong><div class="es-note">ou cole um print com Ctrl+V. PNG, JPG ou WebP.</div></div><label class="btn pri" style="cursor:pointer">Escolher imagens<input type="file" accept="image/*" multiple hidden onchange="refUpload(this.files);this.value=''"></label></div>
    <div class="es-row" style="margin-bottom:12px"><input class="sbg-q" placeholder="Buscar por nome, etiqueta ou anotação" value="${esc(REF.q)}" oninput="REF.q=this.value;renderRefsGrid()" aria-label="Buscar referência"><div class="es-pages"><button class="chip${REF.tag ? '' : ' on'}" onclick="REF.tag='';renderRefs()">Todas</button>${tags.map(t => `<button class="chip${REF.tag === t ? ' on' : ''}" onclick="REF.tag='${esc(t).replace(/'/g, '&#39;')}';renderRefs()">${esc(t)}</button>`).join('')}</div></div>
    <div id="rfGrid">${refGridHTML(l)}</div>`;
  if (typeof libFill === 'function') libFill(root);
}
const refGridHTML = l => l.length ? `<div class="rf-grid">${l.map(refCard).join('')}</div>` : `<div class="panel es-empty">${refList().length ? 'Nenhuma referência com esse filtro.' : 'Nenhuma referência ainda. Suba prints de sites e layouts que você gosta: eles ficam aqui e abrem ao lado da página na hora de editar.'}</div>`;
function renderRefsGrid() { const g = $('rfGrid'); if (g) { g.innerHTML = refGridHTML(refFiltered()); if (typeof libFill === 'function') libFill(g); } }
/* colar print (Ctrl+V) na tela de referências ou com a gaveta aberta */
document.addEventListener('paste', e => { if (ui.page !== 'refs' && !(typeof ES !== 'undefined' && ES.ref && ES.ref.open)) return; const fs = [...(e.clipboardData && e.clipboardData.files || [])].filter(f => /^image\//.test(f.type)); if (fs.length) { e.preventDefault(); refUpload(fs); } });
