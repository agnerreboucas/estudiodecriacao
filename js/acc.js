/* ===== Menus recolhíveis (acordeão) nos painéis de atributos e bloco "Não comece do zero" ===== */
const ACC = {}, ACC_ON = {};
const accOpen = (k, id, def) => { ACC[k] = ACC[k] || {}; if (!(id in ACC[k])) ACC[k][id] = !!def; return ACC[k][id]; };
function accSec(k, id, title, sum, body, def) {
  return `<section class="lg-acc ${accOpen(k, id, def) ? 'open' : ''}" id="acc-${k}-${id}"><button class="lg-acc-h" onclick="accTog('${k}','${id}')"><span>${title}</span><small>${sum || ''}</small><i>▸</i></button><div class="lg-acc-b">${body}</div></section>`;
}
function accTog(k, id) { ACC[k][id] = !ACC[k][id]; const el = $('acc-' + k + '-' + id); if (el) el.classList.toggle('open', ACC[k][id]); if (ACC[k][id] && ACC_ON[k + '-' + id]) ACC_ON[k + '-' + id](); }
function accAll(k, on) { document.querySelectorAll(`[id^="acc-${k}-"]`).forEach(el => { const id = el.id.slice(('acc-' + k + '-').length); ACC[k][id] = on; el.classList.toggle('open', on); if (on && ACC_ON[k + '-' + id]) ACC_ON[k + '-' + id](); }); }
/* transforma um painel já montado: cada título (sel) vira um bloco recolhível; o que vem antes do 1º título fica sempre visível */
function accAuto(root, sel, key, opt) {
  if (!root) return; opt = opt || {}; const nodes = Array.from(root.childNodes), groups = []; let cur = null; const lead = [];
  nodes.forEach(n => { if (n.nodeType === 1 && n.matches(sel)) { cur = {title: n.textContent.trim(), nodes: []}; groups.push(cur); } else if (cur) cur.nodes.push(n); else lead.push(n); });
  if (groups.length < 2) return;
  root.innerHTML = ''; lead.forEach(n => root.appendChild(n));
  const bar = document.createElement('div'); bar.className = 'acc-bar'; bar.innerHTML = `<button class="btn sm" onclick="accAll('${key}',true)">Expandir tudo</button><button class="btn sm" onclick="accAll('${key}',false)">Recolher tudo</button>`; root.appendChild(bar);
  groups.forEach((g, i) => { const sec = document.createElement('section'), id = 'g' + i, open = accOpen(key, id, opt.open ? opt.open.includes(i) : i === 0); sec.className = 'lg-acc' + (open ? ' open' : ''); sec.id = 'acc-' + key + '-' + id;
    const h = document.createElement('button'); h.className = 'lg-acc-h'; h.setAttribute('onclick', `accTog('${key}','${id}')`); h.innerHTML = `<span>${esc(g.title.slice(0, 48))}</span><small></small><i>▸</i>`; const b = document.createElement('div'); b.className = 'lg-acc-b'; g.nodes.forEach(n => b.appendChild(n)); sec.append(h, b); root.appendChild(sec); });
}
/* painéis de atributos: editor de design, Diagramação e capa */
(function () {
  const wrap = (name, after) => { const f = window[name]; if (typeof f !== 'function') return; window[name] = function () { const r = f.apply(this, arguments); try { after(); } catch (e) { console.warn(name, e); } return r; }; };
  wrap('dzInspector', () => { const L = typeof dzLayer === 'function' ? dzLayer() : null; accAuto($('dzInsp'), 'h4', 'dz-' + (L ? L.type + (L.role === 'logo' ? 'L' : '') : 'none')); });
  wrap('dtpPanel', () => { const it = dui.tab === 'objeto' && typeof dtpSelItem === 'function' ? dtpSelItem() : null; accAuto($('dtpPanel'), '.okr-label', 'dtp-' + dui.tab + (it ? it.k : '')); });
  wrap('covRender', () => accAuto(document.querySelector('.cov-form'), '.okr-label', 'cov', {open: [0, 1, 2, 4]}));
})();

/* ---------- "Não comece do zero": tudo o que existe para partir de uma base ---------- */
const start = {group: 'Todos'};
function startersHTML(p) {
  const A = (id, t, s, b, d) => accSec('start', id, t, s, b, d), tpl = typeof tplList === 'function' ? tplList() : [], sets = p.design.sets.slice().reverse().slice(0, 8), refs = (inspo().items || []).filter(i => i.imgId).slice(0, 24);
  const cards = [['Capa de e-book', 'Engenheiro de capa: 8 layouts, capa KDP, Kindle, celular', "bookGoTab('capa')"], ['E-book completo', 'Motor de texto: ideia → estrutura → capítulos', "bookGoTab('conteudo')"], ['Livro, revista ou folheto', 'Diagramação com grade, colunas e PDF de gráfica', "bookGoTab('miolo')"], ['Publicar na Amazon', 'Lombada, capa completa e checklist KDP', "bookGoTab('publicar')"], ['Logo', 'Laboratório do logo: tipografia, símbolos, vitrine', 'dzLogoOpen()'], ['Variações de um anúncio', 'Fábrica: textos × estilos × layouts', 'dzVarOpen()'], ['Kit de marca', 'Cores, fontes e logo do projeto', 'dzBrandOpen()'], ['Referências', 'Sua coleção de inspiração', "go('inspiration')"], ['Fontes e combinações', 'Ficha de cada fonte e pares prontos com exemplo', 'dzFontsOpen()']];
  return `<div class="panel" style="margin-top:14px" id="startBox"><div class="section-row"><div><h3>Não comece do zero</h3><p class="muted" style="font-size:12px;margin:0">Modelos, referências e atalhos de criação. Escolha uma base e adapte.</p></div><div class="row-gap"><button class="btn sm" onclick="accAll('start',true)">Expandir tudo</button><button class="btn sm" onclick="accAll('start',false)">Recolher tudo</button></div></div>
  ${A('atalhos', 'Atalhos de criação', cards.length + ' caminhos', `<div class="start-cards">${cards.map(([t, s, fn]) => `<button class="start-card" onclick="${fn}"><b>${esc(t)}</b><small class="muted">${esc(s)}</small></button>`).join('')}</div>`, true)}
  ${A('lay', 'Modelos de layout prontos', LAYOUTS.length + ' composições', startLayBody(), false)}
  ${A('tpl', 'Modelos salvos (★)', tpl.length + ' salvo(s)', tpl.length ? `<div class="tpl-list">${tpl.map(t => `<div class="tpl-row"><div><strong>${esc(t.name)}</strong><small class="muted block">${t.kind === 'deck' ? 'Apresentação' : 'Peça'} · ${t.slides.length} slide(s) · ${t.format.w}×${t.format.h}</small></div><button class="btn sm dark" onclick="dzTemplateUse('${t.id}')">Usar neste projeto</button></div>`).join('')}</div>` : '<p class="muted" style="font-size:12px">Nenhum modelo salvo ainda. No editor, use <b>★ Modelo</b> (ou crie um a partir de uma referência com “Ler layout”) para guardar o estilo de uma peça.</p>', false)}
  ${A('sets', 'Suas peças e apresentações', p.design.sets.length + ' no projeto', sets.length ? `<div class="tpl-list">${sets.map(s => `<div class="tpl-row"><div><strong>${esc(s.name)}</strong><small class="muted block">${s.slides.length} slide(s) · ${s.format.w}×${s.format.h}</small></div><div class="row-gap"><button class="btn sm" onclick="dzOpen('${s.id}')">Abrir</button><button class="btn sm" onclick="dzVarOpen('${s.id}')">Variar</button></div></div>`).join('')}</div>` : '<p class="muted" style="font-size:12px">Ainda não há peças neste projeto.</p>', false)}
  ${A('refs', 'Referências da Inspiração', (inspo().items || []).filter(i => i.imgId).length + ' imagem(ns)', refs.length ? `<div class="bank-grid start-refs">${refs.map(i => `<button class="bank-th" title="${esc(i.title)}" onclick="startRef('${esc(i.id)}')"><img data-bank="${esc(i.imgId)}" alt=""></button>`).join('')}</div><small class="muted block" style="margin-top:6px">Clique numa referência para ler o layout com IA e criar uma peça editável.</small>` : '<p class="muted" style="font-size:12px">Nenhuma referência ainda. Suba imagens na página Inspiração.</p><button class="btn sm" onclick="go(\'inspiration\')">Abrir Inspiração</button>', false)}</div>`;
}
const startLayList = () => LAYOUTS.filter(l => start.group === 'Todos' || l.group === start.group);
function startLayBody() { return `<div class="tchips">${['Todos', ...LAYOUT_GROUPS].map(g => `<button class="tchip ${start.group === g ? 'on' : ''}" onclick="startGroup('${g}')">${g}</button>`).join('')}</div><div class="ly-grid start-lay">${startLayList().map(l => `<article class="ly-card" onclick="lyQuick('${l.id}')"><canvas data-lay="${l.id}" width="200" height="250"></canvas><strong>${esc(l.name)}</strong></article>`).join('')}</div>`; }
function startGroup(g) { start.group = g; const b = document.querySelector('#acc-start-lay .lg-acc-b'); if (b) { b.innerHTML = startLayBody(); startPaint(); } }
function startPaint() { const box = $('startBox'), p = dzP(); if (box && p && ACC.start && ACC.start.lay && typeof lyPaint === 'function') { if (typeof lyState !== 'undefined' && !lyState.style) { const s = lyStyles(p); lyState.style = s[0].id; } lyPaint(p, box, startLayList()); } }
ACC_ON['start-lay'] = startPaint; ACC_ON['covg-gal'] = () => covGalPaint();
function startInit() { bankFill(); startPaint(); }
function startRef(id) {
  showModal('Usar esta referência', `<p class="muted" style="font-size:13px;margin-top:0">A IA lê fontes, cores, tamanhos e blocos e monta uma peça editável no Editor de Design. Use ★ Modelo no editor para guardar na galeria.</p><div class="modal-actions" style="flex-wrap:wrap"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn" onclick="closeModal();go('inspiration')">Ver na Inspiração</button><button class="btn dark" onclick="startRefRead('${esc(id)}')">✦ Ler layout (IA)</button></div>`);
}
async function startRefRead(id) { closeModal(); await inspoReadLayout(id); }
