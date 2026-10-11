/* ===== Mesa de trabalho do Desenvolvimento, no estilo dos editores de imagem (barra de opções em cima, ferramentas à esquerda, tela escura no centro,
   painéis com abas à direita e barra de estado). Substitui o renderDev simples de estudio-shell.js. Inclui a gaveta de referências, Estilo e Layout. ===== */
Object.assign(ES, {sys: {}, focus: false, tool: 'sel', tabA: 'prop', tabB: 'cam', ref: {open: false, id: '', mode: 'side', op: 45, q: ''}, snap: null, deliver: true});
const ES_FONTS = ['Poppins', 'Inter', 'Manrope', 'Sora', 'Fraunces', 'DM Serif Display', 'Playfair Display', 'Lora', 'Merriweather', 'Montserrat', 'Raleway', 'Nunito', 'Oswald', 'Anton'];
const ES_LY = [['w', 'Largura do conteúdo', [['narrow', 'Estreita'], ['normal', 'Normal'], ['wide', 'Ampla']]], ['sh', 'Títulos das seções', [['left', 'À esquerda'], ['center', 'Centralizados']]], ['band', 'Faixas de fundo', [['alt', 'Alternadas'], ['tint', 'Cor da marca'], ['line', 'Só linhas'], ['none', 'Sem faixas']]],
  ['ben', 'Benefícios', [['cards', 'Cartões'], ['rows', 'Linhas numeradas'], ['nums', 'Colunas']]], ['st', 'Plano em passos', [['cards', 'Cartões'], ['line', 'Linha do tempo']]], ['pr', 'Prova', [['cards', 'Cartões'], ['quote', 'Citação grande']]], ['dor', 'Problema', [['list', 'Lista'], ['cards', 'Cartões']]], ['faq', 'Dúvidas', [['acc', 'Sanfona estreita'], ['cols', 'Duas colunas']]]];
const ES_TOOLS = [
  ['sel', 'Selecionar seção (clique na página)', '<path d="M5 3l12 8-5.5 1.2L9 18z"/>'],
  ['txt', 'Texto da seção selecionada', '<path d="M5 5h14M12 5v14M9 19h6"/>'],
  ['img', 'Imagem da seção selecionada', '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/>'],
  ['move', 'Mover seções (painel Camadas)', '<path d="M12 3v18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3"/>'],
  ['eye', 'Ocultar ou mostrar a seção selecionada', '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>'],
  ['style', 'Estilo: cores, fontes e cantos', '<path d="M12 3a9 9 0 100 18c1.4 0 2-1 1.5-2.2-.5-1.3.2-2.3 1.6-2.3H17a4 4 0 004-4c0-5-4-9.5-9-9.5z"/><circle cx="8" cy="11" r="1.1"/><circle cx="12" cy="7.5" r="1.1"/><circle cx="16" cy="11" r="1.1"/>'],
  ['lay', 'Layout das seções', '<rect x="3.5" y="4" width="17" height="6" rx="1.5"/><rect x="3.5" y="13" width="7.5" height="7" rx="1.5"/><rect x="13" y="13" width="7.5" height="7" rx="1.5"/>'],
  ['ref', 'Referências ao lado', '<path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3z"/><path d="M5 17a3 3 0 013-3h11"/>'],
  ['more', 'Mais ferramentas', '<circle cx="5.5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18.5" cy="12" r="1.6"/>']];
const esSvg = d => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const esLay = l => (l.theme && l.theme.ly) || {};

function esLayersHTML(l) {
  if (!l) return ''; if (l.vis) return '<p class="ps-note">Esta página foi editada no editor visual. Edite as seções por lá (menu Mais).</p>';
  return `<ul class="ps-lay">${l.blocks.map((b, i) => `<li draggable="true" data-bid="${b.id}" class="${b.on ? '' : 'off'}${ES.sel === b.id ? ' sel' : ''}" ondragstart="esDragStart(event,'${b.id}')" ondragover="event.preventDefault()" ondrop="esDrop(event,'${b.id}')"><button class="ps-eye" onclick="esToggle('${b.id}')" aria-label="${b.on ? 'Ocultar' : 'Mostrar'}">${b.on ? '●' : '○'}</button><span onclick="esSelect('${b.id}',true)">${esc((LP_BLOCK[b.t] || {}).label || b.t)}</span><button class="ps-mini" ${i === 0 ? 'disabled' : ''} onclick="esMove('${b.id}',-1)" aria-label="Subir">↑</button><button class="ps-mini" ${i === l.blocks.length - 1 ? 'disabled' : ''} onclick="esMove('${b.id}',1)" aria-label="Descer">↓</button></li>`).join('')}</ul>`;
}
function esStyleHTML(p, s, l) {
  const th = (l && l.theme) || {}, t = SBT.find(x => x.id === s.style), col = (k, lab) => `<label class="ps-f"><span>${lab}</span><input type="color" value="${/^#[0-9a-f]{6}$/i.test(th[k] || '') ? th[k] : '#ffffff'}" oninput="esTheme('${k}',this.value)"></label>`;
  const fnt = (k, lab) => `<label class="ps-f"><span>${lab}</span><select onchange="esTheme('${k}',this.value)">${[...new Set([th[k]].concat(ES_FONTS))].filter(Boolean).map(f => `<option${f === th[k] ? ' selected' : ''}>${esc(f)}</option>`).join('')}</select></label>`;
  return `<label class="ps-f"><span>Template (visual)</span><select onchange="esSwap(this.value)"><option value="">${t ? '' : 'Personalizado'}</option>${SBT.map(x => `<option value="${x.id}"${x.id === s.style ? ' selected' : ''}>${esc(x.nome)} · ${esc(x.nicho)}</option>`).join('')}</select></label>
    <div class="ps-grid2">${col('accent', 'Destaque')}${col('bg', 'Fundo')}${col('fg', 'Texto')}<label class="ps-f"><span>Modo escuro</span><input type="checkbox" ${th.dark ? 'checked' : ''} onchange="esTheme('dark',this.checked)"></label></div>
    ${fnt('head', 'Fonte dos títulos')}${fnt('body', 'Fonte do texto')}
    <label class="ps-f"><span>Cantos arredondados: ${th.rad == null ? 16 : th.rad}px</span><input type="range" min="0" max="32" value="${th.rad == null ? 16 : th.rad}" oninput="this.previousElementSibling.textContent='Cantos arredondados: '+this.value+'px';esTheme('rad',+this.value)"></label>
    <label class="ps-f"><span>Peso dos títulos</span><select onchange="esTheme('hw',+this.value)">${[400, 500, 600, 700, 800].map(w => `<option value="${w}"${(th.hw || 800) === w ? ' selected' : ''}>${w}</option>`).join('')}</select></label>
    <label class="ps-f"><span>Topo da página</span><select onchange="esTheme('hero',this.value)">${[['split', 'Foto ao lado'], ['center', 'Centralizado'], ['big', 'Título grande']].map(([v, n]) => `<option value="${v}"${(th.hero || 'split') === v ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
    <p class="ps-note">As mudanças valem para todas as páginas do site.</p>`;
}
const ES_LYDEF = {w: 'normal', sh: 'left', band: 'alt', ben: 'cards', st: 'cards', pr: 'cards', dor: 'list', faq: 'acc'};
function esLayoutHTML(l) {
  const y = esLay(l);
  return `<div class="ps-row"><button class="btn sm pri" onclick="esRandom()">Sortear variação</button><button class="btn sm" ${ES.snap ? '' : 'disabled'} onclick="esUndoTheme()">Voltar ao anterior</button></div><p class="ps-note">O sorteio muda o layout (e o topo) e mantém textos, cores e fontes.</p>` +
    ES_LY.map(([k, lab, opts]) => `<label class="ps-f"><span>${lab}</span><select onchange="esTheme('${k}',this.value,true)">${opts.map(([v, n]) => `<option value="${v}"${(y[k] || ES_LYDEF[k]) === v ? ' selected' : ''}>${n}</option>`).join('')}</select></label>`).join('');
}
function esPendHTML(p) { const pend = esPending(p); return pend.length ? `<div class="ps-pend">${pend.slice(0, 60).map(x => `<button onclick="esJump('${x.lid}','${x.bid}')" title="${esc(x.page + ' · ' + x.blk)}">${esc(x.m)}</button>`).join('')}</div>` + (pend.length > 60 ? `<p class="ps-note">e mais ${pend.length - 60}…</p>` : '') : '<p class="ps-note">Nada pendente.</p>'; }
function esVendHTML(p, s) { const ck = esChecklist(p, s); return `<ul class="ps-cl">${ck.map(x => `<li class="${x[1] ? 'y' : 'n'}">${x[0]}</li>`).join('')}</ul><button class="btn sm" onclick="SBR.tab='form';go('briefing')">Completar no briefing</button>`; }
function esDeliverHTML(s, l, ready) {
  return `<div class="ps-col"><button class="btn sm" onclick="lpExport('${l ? l.id : ''}')">HTML desta página</button><button class="btn sm" onclick="siteExport('${s.id}')">ZIP do site (HTML)</button><button class="btn sm" onclick="wpElOpen('site','${s.id}')">Modelo do Elementor (.json)</button><button class="btn sm" onclick="wpGenerate('${s.id}','theme')">Tema de WordPress</button><button class="btn sm" onclick="wpGenerate('${s.id}','bundle')">Pacote WordPress completo</button><hr><button class="btn sm" ${ready ? '' : 'disabled title="Ligue a IA em Configurações"'} onclick="esAI()">Reescrever as páginas com IA</button><button class="btn sm" onclick="esRegen()">Refazer textos do briefing</button></div>`;
}
function esRightHTML(p, s, l) {
  const pend = esPending(p), ck = esChecklist(p, s), n = ck.filter(x => x[1]).length, ready = typeof aiReady === 'function' && aiReady();
  const tabs = (cur, set, list) => `<div class="ps-tabs">${list.map(([k, n2]) => `<button class="${cur === k ? 'on' : ''}" onclick="${set}('${k}')">${n2}</button>`).join('')}</div>`;
  const A = ES.tabA === 'fluxo' ? fxHTML(p, s) : ES.tabA === 'style' ? esStyleHTML(p, s, l) : ES.tabA === 'lay' ? esLayoutHTML(l) : '<div id="esEdit"></div>';
  const B = ES.tabB === 'pend' ? esPendHTML(p) : ES.tabB === 'vend' ? esVendHTML(p, s) : ES.tabB === 'bib' ? esBibHTML(p) : esLayersHTML(l);
  return `<section class="ps-pan">${tabs(ES.tabA, 'esTabA', [['prop', 'Propriedades'], ['style', 'Estilo'], ['lay', 'Layout'], ['fluxo', 'Fluxo']])}<div class="ps-pb">${A}</div></section>
    <section class="ps-pan">${tabs(ES.tabB, 'esTabB', [['cam', 'Camadas'], ['pend', 'Pendências ' + pend.length], ['vend', 'Vendedor ' + n + '/' + ck.length], ['bib', 'Biblioteca']])}<div class="ps-pb">${B}</div></section>
    <section class="ps-pan" id="esDeliver"><div class="ps-tabs"><button class="on" onclick="ES.deliver=!ES.deliver;esRight()">Entrega ${ES.deliver ? '▾' : '▸'}</button></div>${ES.deliver ? `<div class="ps-pb">${esDeliverHTML(s, l, ready)}</div>` : ''}</section>`;
}
/* Biblioteca: imagens, referências, seus templates e a Mesa (o que o painel Biblioteca da Mesa tem, aqui à mão) */
function esBibHTML(p) {
  const imgs = libList().filter(i => i.kind !== 'referencia').slice(0, 24), refs = refList().slice(0, 12), kits = typeof mzThList === 'function' ? mzThList() : [], mm = p.mesa || {}, comps = (mm.comps || []).length, mlib = (state.mesaLib && state.mesaLib.items || []).length;
  return `<h6 class="ps-h">Imagens <small>clique para usar na seção selecionada</small></h6>${imgs.length ? `<div class="ps-ig">${imgs.map(i => `<button onclick="esUseImg('${i.imgId}')" title="${esc(i.name)}"><img data-lib="${i.imgId}" alt="${esc(i.name)}"></button>`).join('')}</div>` : '<p class="ps-note">Nenhuma imagem. Suba na tela Imagens.</p>'}
    <h6 class="ps-h">Referências</h6>${refs.length ? `<div class="ps-ig">${refs.map(i => `<button onclick="ES.ref.open=true;ES.ref.id='${i.id}';esRefToggleOpen()" title="${esc(i.name)}"><img data-lib="${i.imgId}" alt="${esc(i.name)}"></button>`).join('')}</div>` : '<p class="ps-note">Nenhuma referência ainda.</p>'}<div class="ps-row"><button class="btn sm" onclick="go('refs')">Biblioteca de referências</button></div>
    <h6 class="ps-h">Meus templates</h6>${kits.length ? kits.map(t => `<div class="ps-kit"><span>${esc(t.name.slice(0, 34))}<small>${t.pages.length} páginas · ${t.sections.length} seções</small></span><button class="btn sm" onclick="sbKitPages('${t.id}')">Usar</button></div>`).join('') : '<p class="ps-note">Nenhum template seu ainda.</p>'}<div class="ps-row"><button class="btn sm" onclick="go('templates');SBG.tab='meus';renderTemplatesBank()">Subir ou gerenciar</button></div>
    <h6 class="ps-h">Na Mesa</h6><p class="ps-note">${comps} componente(s) global(is) e ${mlib} item(ns) salvos na sua biblioteca. Tudo isso fica no painel Biblioteca da Mesa.</p><div class="ps-row"><button class="btn sm pri" onclick="esToMesa()">Abrir o site na Mesa</button></div>`;
}
function esUseImg(imgId) {
  const l = esCur(curProject()), b = l && l.blocks.find(x => x.id === ES.sel); if (!b) { toast('Clique em uma seção da página primeiro.'); return; }
  const f = ((LP_BLOCK[b.t] || {}).fields || []).find(x => x[2] === 'img'); if (!f) { toast('Esta seção não tem imagem. Escolha o topo ou a autoridade.'); return; }
  b[f[0]] = imgId; persist(); esBlockEditor(); esPreview(); toast('Imagem aplicada na seção.');
}
function esRefToggleOpen() { const a = $('psRef'); if (a) a.hidden = false; esRefRefresh(); setTimeout(esFit, 30); document.querySelectorAll('.ps-tools button').forEach((x, i) => { if (ES_TOOLS[i][0] === 'ref') x.classList.add('on'); }); }
function esRight() { const box = $('psRight'); if (!box) return; const p = curProject(), s = esSiteOf(p), l = esCur(p); box.innerHTML = esRightHTML(p, s, l); box.classList.toggle('fx-on', ES.tabA === 'fluxo'); esBlockEditor(); }
const esTabA = t => { ES.tabA = t; esRight(); }, esTabB = t => { ES.tabB = t; esRight(); };

function renderDev() {
  const root = $('devRoot'); if (!root) return; const p = curProject();
  const head = esHead('Desenvolvimento', 'Clique em uma seção da página para editar. As marcas amarelas são dados que ainda faltam.');
  if (!p) { root.innerHTML = esHead('Desenvolvimento', 'Aqui o site do cliente é editado.') + '<div class="panel es-empty">Crie um projeto para começar.<br><br><button class="btn pri" onclick="openWizard()">Novo projeto</button></div>'; return; }
  const s = esSiteOf(p);
  if (!s) { const hasBf = sbProgress(p)[0] > 0; root.innerHTML = head + `<div class="panel es-empty">Este projeto ainda não tem site.<br><br><button class="btn pri" onclick="go('${hasBf ? 'templates' : 'briefing'}')">${hasBf ? 'Escolher um template' : 'Ir ao briefing'}</button></div>`; return; }
  ES.site = s.id; const pages = esPageOf(p), l = esCur(p); ES.page = l ? l.id : '';
  const t = SBT.find(x => x.id === s.style), nb = l ? l.blocks.filter(b => b.on).length : 0;
  root.innerHTML = head + `<div class="ps${ES.focus ? ' ps-focus' : ''}" id="psRoot">
    <div class="ps-opt"><div class="ps-pages">${pages.map(x => `<button class="${x.id === ES.page && !ES.thx ? 'on' : ''}" onclick="esPage('${x.id}')">${esc(x.navLabel || x.name)}</button>`).join('')}${fxFormPage(p) ? `<button class="${ES.thx ? 'on' : ''}" onclick="esThx()" title="Página que abre depois de enviar o formulário">Obrigado</button>` : ''}</div><span class="ps-sp"></span>
      <div class="ps-seg" id="psSeg">${[['desk', 'Computador'], ['tab', 'Tablet'], ['mob', 'Celular'], ['all', '3 telas']].map(([k, n]) => `<button class="${ES.device === k ? 'on' : ''}" onclick="esSetDevice('${k}')">${n}</button>`).join('')}</div><button class="ps-btn" id="psFocus" onclick="esFocusToggle()" title="Esconde os painéis para dar mais espaço à página">Ampliar</button>
      <button class="ps-btn" onclick="esRandom()" title="Sorteia um layout diferente para o site">Sortear layout</button><button class="ps-btn pri" onclick="esToMesa()" title="Abre o site na Mesa de páginas, com todas as ferramentas: camadas, desenho, modo livre, IA, versões e mais">Editar na Mesa</button><button class="ps-btn" onclick="esRefToggle()">Referências</button></div>
    <div class="ps-body"><div class="ps-tools" role="toolbar" aria-label="Ferramentas">${ES_TOOLS.map(([k, tt, d]) => `<button class="${ES.tool === k ? 'on' : ''}${k === 'ref' && ES.ref.open ? ' on' : ''}" title="${esc(tt)}" aria-label="${esc(tt)}" onclick="esTool('${k}')">${esSvg(d)}</button>`).join('')}</div>
      <aside class="ps-ref" id="psRef" ${ES.ref.open ? '' : 'hidden'}></aside>
      <div class="ps-canvas" id="psCanvas"><div class="ps-stage" id="psStage"><div class="ps-devs" id="psDevs">${esDevsHTML()}</div></div></div>
      <div class="ps-right" id="psRight"></div></div>
    <div class="ps-status"><span>${esc(s.name)}${t ? ' · ' + esc(t.nome) : ''}</span><span>${l ? esc(l.navLabel || l.name) : ''} · ${nb} seções ativas</span><span id="psZoom"></span><span class="ps-sp"></span><span>${ES.sel ? 'Seção selecionada' : 'Nada selecionado'}</span></div></div>`;
  esRight(); esFit(); esPreview(); esRefRefresh();
}
const ES_DEV = {desk: ['Computador', 1060], tab: ['Tablet', 768], mob: ['Celular', 390]};
const esDevList = () => ES.device === 'all' ? ['desk', 'tab', 'mob'] : [ES.device in ES_DEV ? ES.device : 'desk'];
const esFrames = () => [...document.querySelectorAll('.esFr')];
function esDevsHTML() {
  return esDevList().map((d, i) => `<div class="ps-dv" data-dev="${d}">${ES.device === 'all' ? `<div class="ps-dl">${ES_DEV[d][0]} · ${ES_DEV[d][1]} px</div>` : ''}<div class="es-frame"><iframe class="esFr" ${i === 0 ? 'id="esFrame" ' : ''}data-dev="${d}" sandbox="allow-scripts" title="Prévia: ${ES_DEV[d][0]}"></iframe>${i === 0 ? '<img class="ps-over" id="psOver" alt="" hidden>' : ''}</div></div>`).join('');
}
/* cada tela é desenhada na largura real (1060, 768 ou 390 px) e reduzida para caber */
function esFit() {
  const st = $('psStage'), boxes = [...document.querySelectorAll('.ps-dv')]; if (!st || !boxes.length) return; const all = boxes.length > 1;
  const H = Math.max(380, Math.round(st.clientHeight - 24 - (all ? 20 : 0))) || Math.round(window.innerHeight * 0.7), W = st.clientWidth - 24, bases = boxes.map(b => ES_DEV[b.dataset.dev][1]);
  const k = all ? Math.max(0.28, Math.min(0.62, (W - 16 * (boxes.length - 1)) / bases.reduce((a, b) => a + b, 0))) : bases[0] === 390 ? 1 : Math.min(1, W / bases[0]);
  boxes.forEach(b => { const base = ES_DEV[b.dataset.dev][1], fr = b.querySelector('iframe'), box = b.querySelector('.es-frame'); fr.style.cssText = 'width:' + base + 'px;height:' + Math.round(H / k) + 'px;transform:scale(' + k + ');transform-origin:0 0'; box.style.width = Math.round(base * k) + 'px'; box.style.height = H + 'px'; });
  const z = $('psZoom'); if (z) z.textContent = all ? '3 telas · ' + Math.round(k * 100) + '%' : bases[0] + ' px · ' + Math.round(k * 100) + '%';
}
function esSetDevice(d) {
  ES.device = d; const dv = $('psDevs'); if (dv) dv.innerHTML = esDevsHTML(); document.querySelectorAll('#psSeg button').forEach((x, i) => x.classList.toggle('on', ['desk', 'tab', 'mob', 'all'][i] === d));
  esFit(); esPreview(); esOver();
}
function esFocusToggle() { ES.focus = !ES.focus; const r = $('psRoot'); if (r) r.classList.toggle('ps-focus', ES.focus); const b = $('psFocus'); if (b) b.textContent = ES.focus ? 'Mostrar painéis' : 'Ampliar'; setTimeout(esFit, 30); }
const esDevice = () => esSetDevice(ES.device);
/* pré-visualização em todas as telas abertas */
async function esPreview() {
  const p = curProject(), l = esCur(p), frs = esFrames(); if (!l || !frs.length) return; const my = ++ES.t;
  const fpg = ES.thx && fxFormPage(p), h = fpg ? await lpThanksHTML(fpg, p) : await lpHTML(l, p, {preview: true, edit: true}); if (my !== ES.t) return;
  frs.forEach(fr => { const d = fr.dataset.dev; fr.srcdoc = h.replace(/<\/body>/i, '<script>window.__sy=' + (+ES.sys[d] || 0) + ';window.__sel=' + JSON.stringify(ES.sel || '') + ';' + ES_INJECT + '<\/script></body>'); });
}
window.addEventListener('message', e => {
  const fr = esFrames().find(f => f.contentWindow === e.source); if (!fr || !e.data || !e.data.es) return; const d = e.data;
  if (d.es === 'sy') ES.sys[fr.dataset.dev] = d.y; else if (d.es === 'sel') esSelect(d.id, false);
  else if (d.es === 'nav') { const p = curProject(), pg = esPageOf(p).find(x => lpFile(x) === d.href.replace(/^.*\//, '').replace(/#.*$/, '')); if (pg) esPage(pg.id); else if (/obrigado\.html/.test(d.href) && fxFormPage(p)) esThx(); }
});
function esSelect(bid, scroll) {
  ES.sel = bid; if (ES.tabA !== 'prop') { ES.tabA = 'prop'; esRight(); } else esBlockEditor();
  document.querySelectorAll('.ps-lay li').forEach(li => li.classList.toggle('sel', li.dataset.bid === bid));
  esFrames().forEach(fr => { if (fr.contentWindow) fr.contentWindow.postMessage({es: 'mark', id: bid, go: !!scroll}, '*'); });
  const sb = document.querySelector('.ps-status span:last-child'); if (sb) sb.textContent = 'Seção selecionada';
}
/* ferramentas */
function esTool(k) {
  const p = curProject(), l = esCur(p), b = l && l.blocks.find(x => x.id === ES.sel);
  if (k === 'ref') { esRefToggle(); return; }
  if (k === 'more') { showModal('Mais ferramentas', `<div class="es-col"><button class="btn" onclick="closeModal();esToMesa()">Abrir este site na Mesa de páginas (todas as ferramentas)</button><button class="btn" onclick="closeModal();go('mesa')">Mesa de páginas (páginas em branco)</button><button class="btn" onclick="closeModal();esAdvanced()">Editor de blocos, SEO e publicação</button><button class="btn" onclick="closeModal();go('templates')">Banco de templates</button><button class="btn" onclick="closeModal();go('refs')">Biblioteca de referências</button></div><div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button></div>`); return; }
  ES.tool = k;
  if (k === 'txt') { if (!b) { toast('Clique em uma seção da página primeiro.'); return; } ES.tabA = 'prop'; esRight(); const i = document.querySelector('#esEdit input,#esEdit textarea'); if (i) i.focus(); }
  else if (k === 'img') { if (!b) { toast('Clique em uma seção da página primeiro.'); return; } const f = ((LP_BLOCK[b.t] || {}).fields || []).find(x => x[2] === 'img'); if (!f) { toast('Esta seção não tem imagem.'); return; } esImg(f[0]); }
  else if (k === 'move') { ES.tabB = 'cam'; esRight(); }
  else if (k === 'eye') { if (!b) { toast('Clique em uma seção da página primeiro.'); return; } esToggle(b.id); return; }
  else if (k === 'style') { ES.tabA = 'style'; esRight(); }
  else if (k === 'lay') { ES.tabA = 'lay'; esRight(); }
  document.querySelectorAll('.ps-tools button').forEach((x, i) => x.classList.toggle('on', ES_TOOLS[i][0] === k || (ES_TOOLS[i][0] === 'ref' && ES.ref.open)));
}
/* arrastar camadas */
let esDragId = '';
function esDragStart(e, id) { esDragId = id; e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', id); } catch (x) { /* navegadores antigos */ } }
function esDrop(e, to) { e.preventDefault(); const l = esCur(curProject()); if (!l || !esDragId || esDragId === to) return; const a = l.blocks.findIndex(b => b.id === esDragId), z = l.blocks.findIndex(b => b.id === to); if (a < 0 || z < 0) return; const [m] = l.blocks.splice(a, 1); l.blocks.splice(z, 0, m); esDragId = ''; persist(); renderDev(); }
/* estilo e layout (valem para todas as páginas do site) */
function esTheme(k, v, ly) {
  const p = curProject(); esPageOf(p).forEach(l => { const t = l.theme = Object.assign({}, l.theme); if (ly) t.ly = Object.assign({}, t.ly, {[k]: v}); else t[k] = v; });
  const s = esSiteOf(p); if (s) s.style = ''; persist(); esPreviewLater();
}
function esSwap(tid) {
  if (!tid) return; const p = curProject(), s = esSiteOf(p), t = SBT.find(x => x.id === tid), f = sbFacts(p); s.style = tid;
  esPageOf(p).forEach(l => { l.theme = Object.assign({}, l.theme, sbThemeFor(t, f)); }); persist(); renderDev(); toast('Template ' + t.nome + ' aplicado. O texto foi mantido.');
}
function esRandom() {
  const p = curProject(), pls = esPageOf(p); if (!pls.length) return; ES.snap = pls.map(l => JSON.stringify(l.theme));
  const pk = a => a[Math.floor(Math.random() * a.length)], ly = {}; ES_LY.forEach(([k, , o]) => { ly[k] = pk(o)[0]; }), hero = pk(['split', 'center', 'big']), rad = pk([0, 4, 8, 12, 18, 24]);
  pls.forEach(l => { l.theme = Object.assign({}, l.theme, {ly, hero, rad}); }); const s = esSiteOf(p); if (s) s.style = ''; persist(); if (ES.tabA === 'lay') esRight(); esPreviewLater(); toast('Variação sorteada. Use "Voltar ao anterior" para desfazer.');
}
function esUndoTheme() { const p = curProject(), pls = esPageOf(p); if (!ES.snap) return; pls.forEach((l, i) => { try { l.theme = JSON.parse(ES.snap[i]); } catch (e) { /* mantém */ } }); ES.snap = null; persist(); esRight(); esPreviewLater(); }
/* referências ao lado da página */
function esRefToggle() { ES.ref.open = !ES.ref.open; const a = $('psRef'); if (a) a.hidden = !ES.ref.open; document.querySelectorAll('.ps-tools button').forEach((x, i) => { if (ES_TOOLS[i][0] === 'ref') x.classList.toggle('on', ES.ref.open); }); esRefRefresh(); setTimeout(esFit, 30); }
async function esRefRefresh() {
  const a = $('psRef'), ov = $('psOver'); if (!a) return; if (!ES.ref.open) { a.innerHTML = ''; if (ov) ov.hidden = true; return; }
  const all = refList().filter(i => !ES.ref.q || (i.name + ' ' + (i.tags || []).join(' ')).toLowerCase().includes(ES.ref.q.toLowerCase())), cur = libItem(ES.ref.id);
  a.innerHTML = `<div class="ps-rh"><strong>Referências</strong><button class="ps-mini" onclick="esRefToggle()" aria-label="Fechar">×</button></div>
    <div class="ps-rbar"><input placeholder="Buscar" value="${esc(ES.ref.q)}" oninput="ES.ref.q=this.value;esRefList()" aria-label="Buscar referência"><label class="btn sm" style="cursor:pointer">+ Subir<input type="file" accept="image/*" multiple hidden onchange="refUpload(this.files);this.value=''"></label></div>
    <div class="ps-rlist" id="psRList">${all.length ? all.map(i => `<button class="${i.id === ES.ref.id ? 'on' : ''}" onclick="esRefPick('${i.id}')" title="${esc(i.name)}"><img data-lib="${i.imgId}" alt="${esc(i.name)}"></button>`).join('') : '<p class="ps-note">Nenhuma referência. Suba imagens (ou cole com Ctrl+V).</p>'}</div>
    ${cur ? `<div class="ps-rview"><div class="ps-rmodes"><button class="${ES.ref.mode === 'side' ? 'on' : ''}" onclick="ES.ref.mode='side';esRefRefresh()">Lado a lado</button><button class="${ES.ref.mode === 'over' ? 'on' : ''}" onclick="ES.ref.mode='over';esRefRefresh()">Sobrepor</button></div>${ES.ref.mode === 'over' ? `<label class="ps-f"><span>Transparência: ${ES.ref.op}%</span><input type="range" min="10" max="90" value="${ES.ref.op}" oninput="ES.ref.op=+this.value;this.previousElementSibling.textContent='Transparência: '+this.value+'%';esOver()"></label>` : ''}<div class="ps-rimg"><img id="psRImg" alt="${esc(cur.name)}"></div>${cur.prompt ? `<p class="ps-note">${esc(cur.prompt)}</p>` : ''}</div>` : ''}`;
  if (typeof libFill === 'function') libFill(a);
  if (cur) { const b = await imgGet(cur.imgId); if (b) { ES.refUrl = URL.createObjectURL(b); const im = $('psRImg'); if (im) im.src = ES.refUrl; } }
  esOver();
}
function esRefList() { esRefRefresh(); }
function esRefPick(id) { ES.ref.id = id; esRefRefresh(); }
function esOver() { const ov = $('psOver'); if (!ov) return; const on = ES.ref.open && ES.ref.mode === 'over' && ES.ref.id && ES.refUrl; ov.hidden = !on; if (on) { ov.src = ES.refUrl; ov.style.opacity = ES.ref.op / 100; } }
