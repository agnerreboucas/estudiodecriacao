/* ===== Editora · telas: biblioteca de e-books e editor (estrutura, páginas, blocos, identidade, verificação e exportação) ===== */
const eui = {id: '', sec: '', ver: 'mobile', page: 0, tab: 'conteudo', cache: {}, hist: [], hi: -1, busy: 0, checks: null, pages: 0};
const ebList = () => { const p = curProject(); if (!p) return []; p.ebooks = Array.isArray(p.ebooks) ? p.ebooks : []; return p.ebooks; };
const ebCur = () => ebList().find(e => e.id === eui.id);
const ebSecCur = () => { const eb = ebCur(); return eb && (eb.sections.find(s => s.id === eui.sec) || eb.sections[0]); };
const ebTypeLabel = {title: 'Página de título', toc: 'Sumário', chapter: 'Capítulo', text: 'Seção de texto'};

/* ---------- biblioteca ---------- */
function renderEditora() {
  const r = $('editoraRoot'), p = curProject(); if (!r) return; if (!p) { r.innerHTML = noProject('Editora'); return; }
  if (typeof mot !== 'undefined' && mot.open) return motRender(r, p);
  if (edh.area === 'capa') return covRender(r, p);
  if (edh.area === 'amazon') return kdpRender(r, p);
  if (edh.area === 'banca') return bancaRender(r, p);
  if (eui.id && ebCur()) return ebEditor(p, r);
  const list = ebList();
  r.innerHTML = `<div class="page-head"><div><h1>Editora</h1><p>Produza e-books completos: capítulos, caixas e checklists diagramados em 4 versões (celular, tablet 6×9, A4 preto e branco e A4 econômico), capa criada no Editor de Design, documento de revisão e EPUB.</p></div><div class="actions">${projectSelect()}<button class="btn dark" onclick="ebNewOpen()">＋ Novo e-book</button></div></div>
  ${list.length ? `<div class="dz-sets">${list.map(e => `<article class="dz-set eb-card"><div class="eb-cover" style="background:${esc(e.brand.c.primary)}"><small style="color:${esc(e.brand.c.gold)}">${esc((e.sections.find(s => s.type === 'title') || {}).label || 'GUIA PRÁTICO')}</small><b style="font-family:'${esc(e.brand.h)}',serif">${esc(e.title)}</b></div><strong>${esc(e.name)}</strong><small class="muted block">${esc(e.author || 'sem autor')} · ${e.sections.length} seções${e.coverSetId ? ' · com capa' : ''}</small><div class="row-gap" style="margin-top:8px"><button class="btn sm dark" onclick="ebOpen('${esc(e.id)}')">Abrir editor</button><button class="btn sm" onclick="ebDup('${esc(e.id)}')">Duplicar</button><button class="btn sm" onclick="ebDel('${esc(e.id)}')">×</button></div></article>`).join('')}</div>` : emptyState('Nenhum e-book ainda', 'Comece pelo modelo da coleção Método Cuidado Seguro (36 páginas, 7 capítulos) ou por um e-book em branco.', '<button class="btn dark" onclick="ebNewOpen()">＋ Novo e-book</button>')}`;
  r.insertAdjacentHTML('afterbegin', edTabs('livros'));
}
function ebNewOpen() {
  showModal('Novo e-book', `<div class="field"><label>Modelo</label><select id="ebPreset"><option value="mcs">Método Cuidado Seguro (7 capítulos, ~36 páginas)</option><option value="blank">Em branco (título, sumário e 1 capítulo)</option></select></div><div class="field"><label>Título</label><input id="ebTitle" placeholder="Ex.: Transferência segura da pessoa idosa"></div><div class="field"><label>Autor(a)</label><input id="ebAuthor" placeholder="Prof.ª Mestre Francisca Antonia Almeida da Silva"></div>
  <small class="muted block">O modelo traz só a estrutura e textos de exemplo entre [colchetes]. O Studio não inventa conteúdo técnico: o texto vem do manuscrito da autora.</small><div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="ebCreate()">Criar</button></div>`);
}
function ebCreate() { const pre = $('ebPreset').value, t = $('ebTitle').value.trim(), a = $('ebAuthor').value.trim(), eb = ebNew(pre, t, a); if (t) { const ts = eb.sections.find(s => s.type === 'title'); if (ts) ts.title = t; } ebList().push(eb); persist(); closeModal(); ebOpen(eb.id); }
function ebOpen(id) { eui.id = id; eui.sec = ''; eui.page = 0; eui.cache = {}; eui.hist = []; eui.hi = -1; eui.checks = null; ebSnap(); renderEditora(); }
function ebDup(id) { const e = ebList().find(x => x.id === id); if (!e) return; const c = JSON.parse(JSON.stringify(e)); c.id = uid('ebk'); c.name = e.name + ' (cópia)'; c.sections.forEach(s => { s.id = uid('sc'); s.blocks.forEach(b => { b.id = uid('bk'); }); }); ebList().push(c); persist(); renderEditora(); }
function ebDel(id) { const e = ebList().find(x => x.id === id); if (!e || !confirm('Excluir o e-book “' + e.name + '”? Não dá para desfazer (a capa no Editor de Design não é apagada).')) return; const p = curProject(); p.ebooks = ebList().filter(x => x.id !== id); persist(); renderEditora(); }
function ebBack() { eui.id = ''; renderEditora(); }

/* ---------- histórico e salvamento ---------- */
const ebSnapStr = () => { const e = ebCur(); return JSON.stringify({sections: e.sections, title: e.title, subtitle: e.subtitle, author: e.author, collection: e.collection, footer: e.footer, brand: e.brand, terms: e.terms, name: e.name}); };
function ebSnap() { const e = ebCur(); if (!e) return; const s = ebSnapStr(); if (eui.hist[eui.hi] === s) return; eui.hist = eui.hist.slice(0, eui.hi + 1); eui.hist.push(s); while (eui.hist.length > histLimit() + 1) eui.hist.shift(); eui.hi = eui.hist.length - 1; }
function ebUndo() { ebSnap(); if (eui.hi <= 0) { toast('Nada para desfazer.'); return; } eui.hi--; ebRestore(); }
function ebRedo() { if (eui.hi >= eui.hist.length - 1) { toast('Nada para refazer.'); return; } eui.hi++; ebRestore(); }
function ebRestore() { const e = ebCur(), o = JSON.parse(eui.hist[eui.hi]); Object.assign(e, o); if (!e.sections.some(s => s.id === eui.sec)) eui.sec = ''; eui.cache = {}; persist(); AUTO_AT = Date.now(); renderEditora(); }
let ebT1 = 0, ebT2 = 0;
function ebTouch(rebuildNow) { const e = ebCur(); if (!e) return; eui.cache = {}; eui.checks = null; persist(); AUTO_AT = Date.now(); ebStatus(); clearTimeout(ebT1); ebT1 = setTimeout(() => { ebSnap(); ebStatus(); }, 600); clearTimeout(ebT2); ebT2 = setTimeout(ebPreview, rebuildNow ? 0 : 380); }
function ebStatus() { const el = $('ebAuto'); if (el) el.innerHTML = `✓ Salvo automaticamente às ${autoTime()} · passo <b>${Math.max(0, eui.hi)}</b> de ${Math.max(0, eui.hist.length - 1)} <small>(máx. ${histLimit()})</small>`; }

/* ---------- editor ---------- */
function ebEditor(p, r) {
  const eb = ebCur(), sec = ebSecCur(); if (!eui.sec && sec) eui.sec = sec.id;
  r.innerHTML = `<div class="dz-top"><button class="btn sm" onclick="ebBack()">← Editora</button><button class="btn sm" onclick="flipRead('eb',eui.id)" title="Folhear em tela cheia">📖 Folhear</button><input class="dz-name" value="${esc(eb.name)}" onchange="ebCur().name=this.value;ebTouch()"><div class="row-gap"><button class="btn sm" onclick="ebUndo()" title="Desfazer (Ctrl+Z)">↶</button><button class="btn sm" onclick="ebRedo()" title="Refazer (Ctrl+Y)">↷</button>${histSelect()}<span class="dz-auto" id="ebAuto"></span></div></div>
  <div class="eb-wrap"><div class="eb-left" id="ebLeft">${ebStructHTML(eb)}</div><div class="eb-mid"><div class="eb-vers">${Object.values(EB_FORMATS).map(f => `<button class="tchip ${eui.ver === f.id ? 'on' : ''}" onclick="ebVer('${f.id}')">${esc(f.short)}</button>`).join('')}<button class="btn sm" onclick="ebOverview()">▦ Todas as páginas</button></div>
    <div class="eb-stage" id="ebStage"><canvas id="ebCanvas"></canvas></div><div class="eb-pager"><button class="btn sm" onclick="ebGo(eui.page-1)">‹</button><span id="ebPageInfo">…</span><button class="btn sm" onclick="ebGo(eui.page+1)">›</button><span class="muted" id="ebIssues"></span></div></div>
  <div class="eb-right"><div class="matrix-tabs">${[['conteudo', 'Conteúdo'], ['identidade', 'Identidade'], ['verificar', 'Verificar'], ['exportar', 'Capa e exportar']].map(([k, l]) => `<button class="${eui.tab === k ? 'active' : ''}" onclick="eui.tab='${k}';ebRenderRight()">${l}</button>`).join('')}</div><div id="ebRight"></div></div></div>`;
  ebRenderRight(); ebStatus(); ebPreview();
}
function ebStructHTML(eb) {
  return `<div class="okr-label">ESTRUTURA</div>${eb.sections.map((s, i) => `<div class="eb-sec ${s.id === eui.sec ? 'on' : ''}" onclick="ebSelSec('${esc(s.id)}')"><span class="eb-sec-t"><small>${esc(s.type === 'chapter' ? (s.label || 'Capítulo') : ebTypeLabel[s.type] || s.type)}</small><b>${esc(s.type === 'title' ? eb.title : s.title || '(sem título)')}</b></span><span class="eb-sec-b"><i title="Subir" onclick="event.stopPropagation();ebMoveSec(${i},-1)">▲</i><i title="Descer" onclick="event.stopPropagation();ebMoveSec(${i},1)">▼</i></span></div>`).join('')}
  <div class="row-gap" style="margin-top:8px;flex-wrap:wrap"><button class="btn sm" onclick="ebAddSec('chapter')">＋ Capítulo</button><button class="btn sm" onclick="ebAddSec('text')">＋ Seção</button></div><div class="row-gap" style="margin-top:6px"><button class="btn sm" onclick="ebImportOpen()">Importar manuscrito</button></div>`;
}
function ebSelSec(id) { eui.sec = id; const eb = ebCur(); const L = $('ebLeft'); if (L) L.innerHTML = ebStructHTML(eb); ebRenderRight(); const b = ebBuildCached(eui.ver); const i = b.pages.findIndex(pg => pg.sec === id); if (i >= 0) eui.page = i; ebPreview(); }
function ebAddSec(type) { const eb = ebCur(), n = eb.sections.filter(s => s.type === 'chapter').length + 1, s = type === 'chapter' ? ebSec('chapter', {label: 'CAPÍTULO ' + ebPad2(n), title: 'Novo capítulo', subtitle: '', blocks: [ebBlock('p', {drop: true, text: ''})]}) : ebSec('text', {title: 'Nova seção', blocks: [ebBlock('p', {text: ''})]}); const at = eb.sections.findIndex(x => x.type === 'text' && /plano|conclus/i.test(x.title)); if (type === 'chapter' && at >= 0) eb.sections.splice(at, 0, s); else eb.sections.push(s); eui.sec = s.id; ebTouch(true); ebEditorRefresh(); }
function ebMoveSec(i, d) { const a = ebCur().sections, j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; ebTouch(true); ebEditorRefresh(); }
function ebDelSec() { const eb = ebCur(), s = ebSecCur(); if (!s || !confirm('Excluir a seção “' + (s.title || s.type) + '”?')) return; eb.sections = eb.sections.filter(x => x.id !== s.id); eui.sec = ''; ebTouch(true); ebEditorRefresh(); }
function ebDupSec() { const eb = ebCur(), s = ebSecCur(), c = JSON.parse(JSON.stringify(s)); c.id = uid('sc'); c.title += ' (cópia)'; c.blocks.forEach(b => { b.id = uid('bk'); }); eb.sections.splice(eb.sections.indexOf(s) + 1, 0, c); eui.sec = c.id; ebTouch(true); ebEditorRefresh(); }
function ebEditorRefresh() { const L = $('ebLeft'); if (L) L.innerHTML = ebStructHTML(ebCur()); ebRenderRight(); }

/* ---------- prévia ---------- */
function ebBuildCached(ver) { const eb = ebCur(); if (!eui.cache[ver]) eui.cache[ver] = ebBuild(eb, ver); return eui.cache[ver]; }
function ebVer(v) { eui.ver = v; document.querySelectorAll('.eb-vers .tchip').forEach(b => b.classList.toggle('on', b.textContent === EB_FORMATS[v].short)); ebPreview(); }
function ebGo(i) { const b = ebBuildCached(eui.ver); eui.page = Math.max(0, Math.min(b.pages.length - 1, i)); ebPreview(); }
async function ebPreview() {
  const eb = ebCur(), cv = $('ebCanvas'); if (!eb || !cv) return; const tk = ++eui.busy; await ensureFonts([eb.brand.h, eb.brand.b]); if (tk !== eui.busy || !$('ebCanvas')) return;
  const b = ebBuildCached(eui.ver), F = b.fmt; eui.page = Math.max(0, Math.min(b.pages.length - 1, eui.page)); const pg = b.pages[eui.page]; if (!pg) return;
  const st = $('ebStage'), maxH = Math.max(320, window.innerHeight - 250), maxW = Math.max(240, st.clientWidth - 24), sc = Math.min(maxW / F.w, maxH / F.h), cw = Math.round(F.w * sc * 1.6) , k = Math.min(1, cw / F.w);
  cv.width = Math.round(F.w * Math.max(0.35, Math.min(0.9, sc * 1.6))); cv.height = Math.round(cv.width * F.h / F.w); cv.style.width = Math.round(F.w * sc) + 'px'; cv.style.height = Math.round(F.h * sc) + 'px'; cv.style.boxShadow = '0 6px 24px #0003'; cv.style.background = '#fff';
  await ebRenderPage(cv, pg, F, eb); if (tk !== eui.busy) return;
  const info = $('ebPageInfo'); if (info) info.textContent = pg.cover ? 'Capa' : `Página ${pg.num} de ${b.pages.filter(x => !x.cover).length}`; const is = $('ebIssues'); if (is) is.innerHTML = b.issues.length ? `<b style="color:#b4631a">⚠ ${b.issues.length} aviso(s) de espaço</b>` : '<span style="color:#2f8a4c">✓ sem estouro</span>';
}
window.addEventListener('resize', () => { if (ui.page === 'editora' && eui.id) ebPreview(); });
async function ebOverview() {
  const eb = ebCur(), b = ebBuildCached(eui.ver), F = b.fmt; showModal('Todas as páginas · ' + F.short + ' (' + b.pages.length + ')', `<div class="eb-over" id="ebOver">${b.pages.map((pg, i) => `<button class="eb-thumb" onclick="closeModal();ebGo(${i})"><canvas data-i="${i}" width="180" height="${Math.round(180 * F.h / F.w)}"></canvas><small>${pg.cover ? 'Capa' : pg.num}</small></button>`).join('')}</div>`); $('modalBox').classList.add('wide');
  await ensureFonts([eb.brand.h, eb.brand.b]); const cb = eb.coverSetId ? await ebCoverBitmap(eb) : null;
  for (const cv of [...document.querySelectorAll('#ebOver canvas')]) { if (!cv.isConnected) return; try { await ebRenderPage(cv, b.pages[+cv.dataset.i], F, eb, cb); } catch (e) { /* vazio */ } await new Promise(r => setTimeout(r, 0)); }
}

/* ---------- painel direito ---------- */
function ebRenderRight() { const el = $('ebRight'); if (!el) return; const eb = ebCur(); el.innerHTML = eui.tab === 'conteudo' ? ebContentHTML(eb) : eui.tab === 'identidade' ? ebIdentityHTML(eb) : eui.tab === 'verificar' ? ebVerifyHTML(eb) : ebExportHTML(eb); if (eui.tab === 'verificar' && !eui.checks) ebVerify(); }
const ebIn = (label, val, fn, ph) => `<label class="ins">${label}<input value="${esc(val)}" ${ph ? `placeholder="${esc(ph)}"` : ''} oninput="${fn}"></label>`;
function ebContentHTML(eb) {
  const s = ebSecCur(); if (!s) return '<small class="muted">Selecione uma seção.</small>';
  const head = s.type === 'title' ? `<h3>Página de título</h3><small class="muted block">O título, o subtítulo e o autor ficam em Identidade. Aqui você muda só a linha de cima.</small>${ebIn('Linha de cima', s.label, `ebSecSet('label',this.value)`)}`
    : s.type === 'toc' ? `<h3>Sumário</h3><small class="muted block">Montado sozinho com os capítulos e seções, com número de página de cada versão.</small>${ebIn('Título', s.title, `ebSecSet('title',this.value)`)}`
    : `<h3>${esc(ebTypeLabel[s.type] || s.type)}</h3>${s.type === 'chapter' ? ebIn('Rótulo (ex.: CAPÍTULO 01 ou ERRO Nº 01)', s.label, `ebSecSet('label',this.value)`) : ''}${ebIn('Título', s.title, `ebSecSet('title',this.value)`)}${ebIn('Subtítulo (em itálico)', s.subtitle, `ebSecSet('subtitle',this.value)`)}<div class="row-gap"><label class="check"><input type="checkbox" ${s.opener ? 'checked' : ''} onchange="ebSecSet('opener',this.checked,1)"> Página de abertura</label><label class="check"><input type="checkbox" ${s.inToc !== false ? 'checked' : ''} onchange="ebSecSet('inToc',this.checked)"> No sumário</label></div>`;
  const bl = ['title', 'toc'].includes(s.type) ? '' : `<div class="okr-label" style="margin-top:12px">BLOCOS</div>${s.blocks.map((b, i) => ebBlockHTML(b, i, s)).join('')}<div class="row-gap" style="margin-top:8px"><select id="ebAddT">${EB_BLOCK_TYPES.map(([k, l]) => `<option value="${k}">${esc(l)}</option>`).join('')}</select><button class="btn sm dark" onclick="ebAddBlock()">＋ Bloco</button></div>`;
  return `${head}${bl}<div class="row-gap" style="margin-top:14px"><button class="btn sm" onclick="ebDupSec()">⧉ Duplicar seção</button><button class="btn sm" onclick="ebDelSec()">Excluir seção</button></div>`;
}
function ebSecSet(k, v, redraw) { const s = ebSecCur(); s[k] = v; ebTouch(); if (k === 'title' || k === 'label') { const L = $('ebLeft'); if (L) L.innerHTML = ebStructHTML(ebCur()); } if (redraw) ebRenderRight(); }
function ebBlockHTML(b, i, s) {
  const tl = (EB_BLOCK_TYPES.find(x => x[0] === b.t) || [0, b.t])[1], tools = `<span class="eb-btools"><i title="Subir" onclick="ebBlockMove(${i},-1)">▲</i><i title="Descer" onclick="ebBlockMove(${i},1)">▼</i><i title="Duplicar" onclick="ebBlockDup(${i})">⧉</i><i title="Excluir" onclick="ebBlockDel(${i})">×</i></span>`;
  const ta = (k, rows, ph) => `<textarea rows="${rows}" class="jp-ta" placeholder="${esc(ph || '')}" oninput="ebBSet(${i},'${k}',this.value)">${esc(b[k] || '')}</textarea>`, lines = (k, rows, ph) => `<textarea rows="${rows}" class="jp-ta" placeholder="${esc(ph || 'Um item por linha')}" oninput="ebBLines(${i},'${k}',this.value)">${esc((b[k] || []).join('\n'))}</textarea>`;
  let body = '';
  if (b.t === 'p') body = ta('text', 5, 'Texto do parágrafo') + `<label class="check"><input type="checkbox" ${b.drop ? 'checked' : ''} onchange="ebBSet(${i},'drop',this.checked)"> Letra capitular (1º parágrafo)</label>`;
  else if (b.t === 'h2') body = `<input value="${esc(b.text)}" oninput="ebBSet(${i},'text',this.value)">`;
  else if (b.t === 'box') body = `<div class="ins-row"><label class="ins">Tipo<select onchange="ebBSet(${i},'kind',this.value,1)">${Object.entries(EB_KINDS).map(([k, v]) => `<option value="${k}" ${b.kind === k ? 'selected' : ''}>${v.icon} ${esc(v.label)}</option>`).join('')}</select></label><label class="ins">Título (opcional)<input value="${esc(b.title)}" oninput="ebBSet(${i},'title',this.value)"></label></div>${ta('text', 4, 'Texto da caixa')}`;
  else if (b.t === 'cols2') body = `<label class="ins">Coluna 1 · título<input value="${esc(b.leftTitle)}" oninput="ebBSet(${i},'leftTitle',this.value)"></label>${lines('left', 4)}<label class="ins">Coluna 2 · título<input value="${esc(b.rightTitle)}" oninput="ebBSet(${i},'rightTitle',this.value)"></label>${lines('right', 4)}`;
  else if (b.t === 'list') body = `<label class="check"><input type="checkbox" ${b.ordered ? 'checked' : ''} onchange="ebBSet(${i},'ordered',this.checked)"> Numerada</label>${lines('items', 5)}`;
  else if (b.t === 'check' || b.t === 'summary') body = `<input value="${esc(b.title)}" oninput="ebBSet(${i},'title',this.value)">${lines('items', 5)}<small class="muted">Ocupa uma página inteira${b.t === 'check' ? ' (padrão: 4 itens)' : ' (padrão: 3 itens)'}.</small>`;
  else body = '<small class="muted">Começa uma nova página.</small>';
  return `<div class="eb-blk"><div class="eb-bh"><b>${esc(tl)}</b>${tools}</div>${body}</div>`;
}
function ebBSet(i, k, v, redraw) { const s = ebSecCur(); s.blocks[i][k] = v; ebTouch(); if (redraw) ebRenderRight(); }
function ebBLines(i, k, v) { const s = ebSecCur(); s.blocks[i][k] = v.split('\n'); ebTouch(); }
function ebBlockMove(i, d) { const a = ebSecCur().blocks, j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; ebTouch(true); ebRenderRight(); }
function ebBlockDup(i) { const a = ebSecCur().blocks, c = JSON.parse(JSON.stringify(a[i])); c.id = uid('bk'); a.splice(i + 1, 0, c); ebTouch(true); ebRenderRight(); }
function ebBlockDel(i) { ebSecCur().blocks.splice(i, 1); ebTouch(true); ebRenderRight(); }
function ebAddBlock() { const t = $('ebAddT').value; ebSecCur().blocks.push(ebBlock(t)); ebTouch(true); ebRenderRight(); }

function ebIdentityHTML(eb) {
  const c = eb.brand.c, names = {primary: 'Verde principal', light: 'Verde claro', terra: 'Terracota', gold: 'Dourado', bg: 'Fundo', box: 'Fundo das caixas', text: 'Texto', soft: 'Texto suave'};
  return `<h3>Livro</h3>${ebIn('Título', eb.title, `ebMeta('title',this.value)`)}${ebIn('Subtítulo', eb.subtitle, `ebMeta('subtitle',this.value)`)}${ebIn('Autor(a)', eb.author, `ebMeta('author',this.value)`)}${ebIn('Coleção', eb.collection, `ebMeta('collection',this.value)`)}${ebIn('Rodapé (depois do número)', eb.footer, `ebMeta('footer',this.value)`)}
  <h3 style="margin-top:12px">Fontes</h3><div class="ins-row"><label class="ins">Títulos<select onchange="ebFont('h',this.value)">${fontChoices().map(f => `<option ${f === eb.brand.h ? 'selected' : ''}>${esc(f)}</option>`).join('')}</select></label><label class="ins">Corpo<select onchange="ebFont('b',this.value)">${fontChoices().map(f => `<option ${f === eb.brand.b ? 'selected' : ''}>${esc(f)}</option>`).join('')}</select></label></div>
  <h3 style="margin-top:12px">Cores</h3><div class="eb-colors">${Object.keys(names).map(k => `<label><input type="color" value="${esc(c[k])}" oninput="ebColor('${k}',this.value)"><span>${names[k]}</span></label>`).join('')}</div><button class="btn sm" style="margin-top:6px" onclick="ebResetBrand()">Voltar às cores da coleção</button>
  <h3 style="margin-top:12px">Terminologia</h3><label class="ins">Termo-chave do título<input value="${esc(eb.terms.keep)}" placeholder="ex.: transferência" oninput="ebTerm('keep',this.value)"></label><label class="ins">Termos a evitar (um por linha)<textarea rows="3" class="jp-ta" placeholder="ex.: mobilização" oninput="ebTerm('avoid',this.value)">${esc((eb.terms.avoid || []).join('\n'))}</textarea></label><small class="muted">A aba Verificar acusa qualquer sobra desses termos em textos, checklists e resumos.</small>`;
}
function ebMeta(k, v) { ebCur()[k] = v; ebTouch(); if (k === 'title' || k === 'author') { const L = $('ebLeft'); if (L) L.innerHTML = ebStructHTML(ebCur()); } }
async function ebFont(k, v) { ebCur().brand[k] = v; await ensureFonts([v]); ebTouch(true); }
function ebColor(k, v) { ebCur().brand.c[k] = v; ebTouch(); }
function ebResetBrand() { ebCur().brand = JSON.parse(JSON.stringify(EB_BRAND_MCS)); ebTouch(true); ebRenderRight(); }
function ebTerm(k, v) { ebCur().terms[k] = k === 'avoid' ? v.split('\n') : v; ebTouch(); }

/* ---------- verificar ---------- */
function ebVerifyHTML(eb) {
  if (!eui.checks) return '<h3>Verificar</h3><small class="muted">Conferindo estouro de espaço, textos de modelo, termos e repetições…</small>';
  const c = eui.checks, order = {erro: 0, aviso: 1, info: 2}, ic = {erro: '⛔', aviso: '⚠️', info: 'ℹ️'};
  return `<h3>Verificar</h3><div class="row-gap" style="margin-bottom:8px"><button class="btn sm dark" onclick="ebVerify()">Verificar de novo</button><small class="muted">${c.filter(x => x.level === 'erro').length} erro(s) · ${c.filter(x => x.level === 'aviso').length} aviso(s)</small></div>${c.length ? c.slice().sort((a, b) => order[a.level] - order[b.level]).map(x => `<div class="eb-chk ${x.level}" ${x.sec ? `onclick="ebSelSec('${esc(x.sec)}');eui.tab='conteudo';ebRenderRight()"` : ''}><span>${ic[x.level]}</span><div>${esc(x.msg)}</div></div>`).join('') : '<div class="eb-chk info">Tudo certo.</div>'}`;
}
async function ebVerify() { const eb = ebCur(); eui.checks = await ebCheck(eb); if (eui.tab === 'verificar') { const el = $('ebRight'); if (el) el.innerHTML = ebVerifyHTML(eb); } }

/* ---------- capa e exportação ---------- */
function ebExportHTML(eb) {
  const p = curProject(), set = p.design.sets.find(s => s.id === eb.coverSetId);
  return `<h3>Capa</h3>${set ? `<small class="muted block">Capa: <b>${esc(set.name)}</b> (Editor de Design). Ela entra como primeira página em todas as versões; no A4 P&B vira cinza.</small><div class="row-gap" style="margin:6px 0"><button class="btn sm dark" onclick="ebCoverOpen()">Editar a capa</button><button class="btn sm" onclick="ebCoverRemove()">Remover</button></div>` : `<small class="muted block">Sem capa: o PDF começa pela página de título. Crie a capa no Editor de Design com a identidade do livro (fontes e cores) e ela volta para cá.</small><div class="row-gap" style="margin:6px 0"><button class="btn sm dark" onclick="ebCoverMake()">＋ Criar capa no Editor de Design</button></div>`}
  <h3 style="margin-top:12px">PDF por versão</h3><div class="eb-exp">${Object.values(EB_FORMATS).map(f => `<button class="btn" onclick="ebPdf('${f.id}')"><b>${esc(f.name)}</b><small>${f.w}×${f.h}px · ${f.mode === 'bw' ? 'tons de cinza, margem de encadernação' : f.mode === 'eco' ? 'fundo branco, cor só no texto' : 'cores da coleção'}</small></button>`).join('')}</div><div class="row-gap" style="margin-top:8px"><button class="btn sm dark" onclick="ebPdfAll()">Todas as versões (ZIP de PDFs)</button></div>
  <h3 style="margin-top:12px">Outros arquivos</h3><div class="row-gap" style="flex-wrap:wrap"><button class="btn sm" onclick="ebReviewDown()" title="Um capítulo por página, caixas coloridas em tabelas; abre no Word e no Google Docs">Documento de revisão (.doc)</button><button class="btn sm" onclick="ebEpubDown()">EPUB</button><button class="btn sm" onclick="ebJsonDown()">Projeto (JSON)</button></div><small class="muted block" style="margin-top:6px">Dica de fluxo: escreva, revise com o documento de revisão, aprove, gere o PDF do celular; com a capa pronta, gere as demais versões.</small>`;
}
async function ebCoverMake() {
  const p = curProject(), eb = ebCur(), c = eb.brand.c, W = 1600, H = 2400, tk = brandTokens(p); Object.assign(tk, {name: 'Capa · ' + eb.name, bg: c.primary, fg: '#ffffff', accent: c.gold, second: c.light, muted: c.gold, head: {family: eb.brand.h, weight: 700}, body: {family: eb.brand.b, weight: 400}});
  await ensureFonts([eb.brand.h, eb.brand.b]); const ts = eb.sections.find(s => s.type === 'title'), L = [];
  L.push(T('kicker', {x: 160, y: 520, w: W - 320, content: ts ? ts.label || 'GUIA PRÁTICO' : 'GUIA PRÁTICO', family: eb.brand.b, size: 54, weight: 700, color: c.gold, ls: 12, upper: true, align: 'center'}));
  const t = T('title', {x: 160, y: 660, w: W - 320, content: eb.title, family: eb.brand.h, size: 190, weight: 700, color: '#ffffff', lh: 1.08, align: 'center'}), th = layoutText(t).h; L.push(t);
  L.push(RC('rule', {x: W / 2 - 90, y: 660 + th + 60, w: 180, h: 8, fill: c.gold, radius: 4}));
  const st = T('subtitle', {x: 160, y: 660 + th + 130, w: W - 320, content: eb.subtitle, family: eb.brand.b, size: 66, weight: 400, color: '#e8efe8', lh: 1.4, align: 'center'}); const n = plainOf(st.content).length; if (n) st.spans = [{s: 0, e: n, st: {italic: true}}]; L.push(st);
  const au = T('author', {x: 160, y: H - 420, w: W - 320, content: eb.author, family: eb.brand.h, size: 62, weight: 600, color: '#ffffff', align: 'center'}), ah = layoutText(au).h; au.y = H - 150 - (eb.collection ? 120 : 0) - ah; L.push(au);
  if (eb.collection) L.push(T('collection', {x: 160, y: H - 190, w: W - 320, content: eb.collection, family: eb.brand.b, size: 40, weight: 600, color: c.gold, ls: 7, upper: true, align: 'center'}));
  const set = {id: uid('ds'), name: 'Capa · ' + eb.name, format: {id: 'custom', w: W, h: H}, tk, slides: [{id: sid(), name: 'Capa', bg: c.primary, layers: L}], created: new Date().toISOString(), updated: new Date().toISOString()};
  p.design.sets.push(set); eb.coverSetId = set.id; persist(); eui.cache = {}; toast('Capa criada. Refine no Editor de Design e volte à Editora: ela já entra nas versões.'); go('design'); dzOpen(set.id);
}
function ebCoverOpen() { const eb = ebCur(), p = curProject(); if (!p.design.sets.some(s => s.id === eb.coverSetId)) { toast('A capa não existe mais.'); return; } go('design'); dzOpen(eb.coverSetId); }
function ebCoverRemove() { if (!confirm('Tirar a capa deste e-book? A peça continua no Editor de Design.')) return; ebCur().coverSetId = ''; ebTouch(true); ebRenderRight(); }
async function ebPagesToPDF(fid, progress) {
  const eb = ebCur(), r = ebBuild(eb, fid), F = r.fmt, out = []; await ensureFonts([eb.brand.h, eb.brand.b]); const cb = eb.coverSetId ? await ebCoverBitmap(eb) : null;
  for (let i = 0; i < r.pages.length; i++) { const cv = document.createElement('canvas'); cv.width = F.w; cv.height = F.h; await ebRenderPage(cv, r.pages[i], F, eb, cb); const blob = await new Promise(res => cv.toBlob(res, 'image/jpeg', F.mode === 'bw' ? 0.88 : 0.9)); out.push({jpeg: new Uint8Array(await blob.arrayBuffer()), w: F.w, h: F.h}); if (progress) progress(i + 1, r.pages.length); await new Promise(rs => setTimeout(rs, 0)); }
  return {pdf: buildPDF(out, F.pt[0], F.pt[1]), n: out.length, issues: r.issues};
}
const ebFileName = eb => (eb.name || 'ebook').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'ebook';
async function ebPdf(fid) { const eb = ebCur(), F = EB_FORMATS[fid]; toast('Gerando PDF · ' + F.short + '…'); try { const r = await ebPagesToPDF(fid, (i, n) => { if (i % 6 === 0) toast(`PDF ${F.short}: página ${i} de ${n}…`); }); download(`${ebFileName(eb)}-${fid}.pdf`, r.pdf, 'application/pdf'); toast(`PDF ${F.short} baixado (${r.n} páginas)${r.issues.length ? '. ATENÇÃO: ' + r.issues.length + ' aviso(s) de espaço, veja Verificar' : ''}.`); } catch (e) { toast('Não consegui gerar o PDF: ' + e.message); } }
async function ebPdfAll() { const eb = ebCur(), files = []; toast('Gerando as 4 versões…'); try { for (const fid of Object.keys(EB_FORMATS)) { const r = await ebPagesToPDF(fid); files.push({name: `${ebFileName(eb)}-${fid}.pdf`, data: new Uint8Array(await new Blob([r.pdf], {type: 'application/pdf'}).arrayBuffer())}); toast('Pronto: ' + EB_FORMATS[fid].short); } download(`${ebFileName(eb)}-versoes.zip`, makeZip(files), 'application/zip'); } catch (e) { toast('Falhou: ' + e.message); } }
function ebReviewDown() { const eb = ebCur(); download(`${ebFileName(eb)}-revisao.doc`, ebReviewHTML(eb), 'application/msword'); toast('Documento de revisão baixado. Abra no Word ou envie ao Google Drive.'); }
async function ebEpubDown() { const eb = ebCur(); try { download(`${ebFileName(eb)}.epub`, await ebEpub(eb), 'application/epub+zip'); toast('EPUB baixado.'); } catch (e) { toast('Falhou: ' + e.message); } }
function ebJsonDown() { const eb = ebCur(); download(`${ebFileName(eb)}.json`, JSON.stringify(eb, null, 1)); }
function ebImportOpen() {
  showModal('Importar manuscrito', `<p class="muted" style="font-size:12px;margin-top:0">Cole o texto com marcações simples. <b>#</b> abre um capítulo; <b>##</b> é subtítulo; linha em branco separa parágrafos; <b>&gt; dica:</b>, <b>&gt; caso:</b>, <b>&gt; atenção:</b>, <b>&gt; sabia:</b>, <b>&gt; cuide:</b> viram caixas; <b>- item</b> ou <b>1. item</b> viram listas; <b>[ ] item</b> checklist; <b>[v] item</b> resumo; <b>@comuns: …</b> e <b>@faca: …</b> viram as duas colunas.</p><textarea id="ebImp" rows="14" class="jp-ta" placeholder="# Primeiro capítulo&#10;## Subtítulo&#10;&#10;> caso: ...&#10;&#10;Primeiro parágrafo..."></textarea><div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="ebImportRun()">Importar como capítulos</button></div>`);
}
function ebImportRun() { const eb = ebCur(), t = $('ebImp').value, secs = ebImport(t, eb); if (!secs.length) { toast('Não encontrei texto para importar.'); return; } let n = eb.sections.filter(s => s.type === 'chapter').length; secs.forEach(s => { n++; s.label = 'CAPÍTULO ' + ebPad2(n); }); const at = eb.sections.findIndex(x => x.type === 'text' && /plano|conclus/i.test(x.title)); if (at >= 0) eb.sections.splice(at, 0, ...secs); else eb.sections.push(...secs); eui.sec = secs[0].id; closeModal(); ebTouch(true); ebEditorRefresh(); toast(secs.length + ' capítulo(s) importado(s).'); }
document.addEventListener('keydown', e => { if (ui.page !== 'editora' || !eui.id || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return; const m = e.ctrlKey || e.metaKey, k = e.key.toLowerCase(); if (m && k === 'z') { e.preventDefault(); e.shiftKey ? ebRedo() : ebUndo(); } else if (m && k === 'y') { e.preventDefault(); ebRedo(); } else if (e.key === 'ArrowRight') ebGo(eui.page + 1); else if (e.key === 'ArrowLeft') ebGo(eui.page - 1); });
