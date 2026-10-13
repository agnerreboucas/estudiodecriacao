/* Mesa do Estúdio de Design: trilho de ferramentas (estilo Figma/Photoshop), painel da esquerda em abas (Elementos, Camadas, Biblioteca, Assets, Referências),
   barra de cima (Livre, IA, Prévia, Versões, Sistema, Importar, Exportar, Atalhos), elementos e formas que entram na arte.
   Carregado depois de design-novo.js. Seleção/guias/atalhos: design-selecao.js · abas do painel da direita: design-painel.js · pincéis: design-pincel.js · versões/sistema/prévia/IA: design-versoes.js. */
const DZT = {tool: 'select', panel: null, panelFor: '', lclosed: false, itab: 'content', snap: true, shape: 'rect', color: '#ff6a18', dock: '', docks: {}, q: '', eq: '', collapsed: {}, snapLines: [], dist: [], marquee: null, gdrag: null, size: null, sel0: '', clip: [], dragKind: ''};
const DZT_IC = {
  select: '<path d="M5 3l14 7.5-6.2 1.9L10.5 19z"/>', hand: '<path d="M8 13V6.5a1.5 1.5 0 013 0V11m0-5.5a1.5 1.5 0 013 0V11m0-4a1.5 1.5 0 013 0v6.5c0 4-2.2 7-6 7-3 0-4.6-1.6-6-4l-2-3.2a1.4 1.4 0 012.2-1.6L8 13"/>',
  text: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>', shape: '<path d="M5 5h14v14H5z"/>', image: '<path d="M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15.5 9.5h.01"/>', logo: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/>',
  video: '<path d="M4 6h12v12H4zM16 10.5l5-3v9l-5-3"/>', brush: '<path d="M4 20c3 0 4.5-1 4.5-3A3 3 0 0111.5 14M9.5 14.5L19.5 4.5l1.5 1.5-10 10z"/>', eraser: '<path d="M4.5 15.5l8-9 7 6-5 6H8.5zM9 20.5h11"/>',
  zoom: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5M8 10.5h5M10.5 8v5"/>', pick: '<path d="M15 4.5l4.5 4.5-3 1L9 17.5 6.5 18l.5-2.5 7.5-7.5zM14 6l4 4"/>',
  el: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>', ly: '<path d="M12 3l9 5-9 5-9-5zM3 12.5l9 5 9-5M3 16.5l9 5 9-5"/>', lib: '<path d="M5 4h4v16H5zM11 4h4v16h-4zM17 5.5l3.2.8-3.4 13.7-3.2-.8z"/>', as: '<path d="M3 6.5h7l2 2.2h9V19H3z"/>', ref: '<path d="M6 3.5h12V21l-6-4-6 4z"/>'
};
const dztSvg = (k, s) => `<svg class="dzt-svg" viewBox="0 0 24 24" width="${s || 20}" height="${s || 20}">${DZT_IC[k] || ''}</svg>`;
const DZT_TOOLS = [['select', 'V', 'Selecionar', 'Selecionar e mover'], ['hand', 'H', 'Mão', 'Mover a prancheta (ou segure Espaço)'], ['text', 'T', 'Texto', 'Clique na arte para escrever'], ['shape', 'R', 'Forma', 'Arraste na arte para desenhar uma forma'],
  ['image', 'F', 'Imagem', 'Inserir imagem do computador'], ['logo', 'L', 'Logo', 'Inserir o logo do projeto'], ['video', 'Y', 'Vídeo', 'Inserir vídeo (link ou arquivo)'], null,
  ['brush', 'B', 'Pincel', 'Desenhar na arte: caneta, marcador, aerógrafo'], ['eraser', 'E', 'Borracha', 'Apagar partes de um desenho'], ['zoom', 'Z', 'Zoom', 'Clique aproxima, Alt+clique afasta (ou segure Z e clique)'], ['pick', 'I', 'Contagotas', 'Pegar uma cor da arte']];
const DZT_PANELS = [['el', 'Elementos'], ['ly', 'Camadas'], ['lib', 'Biblioteca'], ['as', 'Assets'], ['ref', 'Referências']];
const DZT_SHAPES = [['rect', 'Retângulo'], ['round', 'Retângulo arredondado'], ['ellipse', 'Círculo'], ['triangle', 'Triângulo'], ['diamond', 'Losango'], ['hexagon', 'Hexágono'], ['star', 'Estrela'], ['arrow', 'Seta'], ['bubble', 'Balão'], ['line', 'Linha'], ['ring', 'Anel']];
const DZT_BASIC = [['title', 'Título', 'T'], ['text', 'Texto', 'T'], ['image', 'Imagem', 'image'], ['photo', 'Foto (quadro)', 'image'], ['logo', 'Logo', 'logo'], ['button', 'Botão', 'btn'], ['badge', 'Selo', 'badge'], ['divider', 'Divisor', 'div'], ['list', 'Lista', 'list'], ['icon', 'Ícone', 'ico'], ['video', 'Vídeo', 'video']];
const DZT_ICONS = {check: ['Certo', 'M18 52 L40 74 L84 26 L74 17 L40 54 L28 42 Z'], star: ['Estrela', DZ_POLY.star.map(([x, y], i) => (i ? 'L' : 'M') + (x * 100).toFixed(1) + ' ' + (y * 100 / 1).toFixed(1)).join(' ') + ' Z'], heart: ['Coração', 'M50 90 C8 58 4 32 22 19 C35 10 46 16 50 27 C54 16 65 10 78 19 C96 32 92 58 50 90 Z'],
  bolt: ['Raio', 'M58 4 L18 56 L44 56 L38 96 L82 40 L54 40 Z'], pin: ['Local', 'M50 95 C27 67 19 52 19 36 A31 31 0 0 1 81 36 C81 52 73 67 50 95 Z M50 25 A11 11 0 1 0 50 47 A11 11 0 1 0 50 25 Z', 'evenodd'], chat: ['Mensagem', 'M10 14 H90 V68 H46 L26 88 V68 H10 Z'],
  mail: ['E-mail', 'M10 24 H90 V76 H10 Z M10 24 L50 55 L90 24', '', 'stroke'], arrow: ['Seta', 'M8 40 H60 V20 L94 50 L60 80 V60 H8 Z'], play: ['Reproduzir', 'M28 12 L90 50 L28 88 Z'], plus: ['Mais', 'M41 10 H59 V41 H90 V59 H59 V90 H41 V59 H10 V41 H41 Z'], close: ['Fechar', 'M22 10 L50 38 L78 10 L90 22 L62 50 L90 78 L78 90 L50 62 L22 90 L10 78 L38 50 L10 22 Z']};
const dztShapeSvg = k => {
  const poly = pts => `<polygon points="${pts.map(([x, y]) => (x * 24).toFixed(1) + ',' + (y * 24).toFixed(1)).join(' ')}"/>`, P = DZ_POLY;
  const b = {rect: '<rect x="3" y="4" width="18" height="16"/>', round: '<rect x="3" y="4" width="18" height="16" rx="5"/>', ellipse: '<circle cx="12" cy="12" r="9"/>', ring: '<path fill-rule="evenodd" d="M12 3a9 9 0 100 18 9 9 0 000-18zm0 5.2a3.8 3.8 0 110 7.6 3.8 3.8 0 010-7.6z"/>', line: '<rect x="2" y="10.5" width="20" height="3" rx="1.5"/>',
    bubble: '<path d="M5 4h14a2 2 0 012 2v9a2 2 0 01-2 2h-8l-4 4v-4H5a2 2 0 01-2-2V6a2 2 0 012-2z"/>', triangle: poly(P.triangle), diamond: poly(P.diamond), hexagon: poly(P.hexagon), star: poly(P.star), arrow: poly(P.arrow)};
  return `<svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">${b[k] || ''}</svg>`;
};
const dztEl = (k) => ({title: '<b style="font:800 18px/1 inherit">Tt</b>', T: '<b style="font:800 18px/1 inherit">T</b>', btn: '<span class="dzt-mb"></span>', badge: '<span class="dzt-mc"></span>', div: '<span class="dzt-md"></span>', list: '<span style="font:700 15px/1 inherit">• • •</span>', ico: '<span style="font-size:19px">★</span>', video: dztSvg('video', 26), image: dztSvg('image', 26), logo: dztSvg('logo', 26)}[k] || '');

/* ---------- ajudantes de seleção usados por todos os arquivos da mesa ---------- */
function dztIds() {
  const sl = dzSlide(); if (!sl) return []; const have = new Set(sl.layers.map(l => l.id));
  if (Array.isArray(dz.multi) && dz.multi.length > 1 && dz.multi.every(i => have.has(i)) && dz.multi.includes(dz.sel)) return dz.multi.slice();
  dz.multi = []; return dz.sel && have.has(dz.sel) ? [dz.sel] : [];
}
const dztLayers = () => { const sl = dzSlide(), ids = dztIds(); return sl ? sl.layers.filter(l => ids.includes(l.id)) : []; };
function dztSetSel(ids) { ids = [...new Set(ids)]; dz.multi = ids.length > 1 ? ids : []; dz.sel = ids.length ? ids[ids.length - 1] : ''; dz.range = null; }
const dztActive = () => typeof ui !== 'undefined' && ui.page === 'design' && dz.view === 'editor' && !!$('dzStage');
const dztBox = L => { const b = LBOX[L.id]; return b ? {x: b.x, y: b.y, w: b.w, h: b.h} : {x: L.x, y: L.y, w: L.w, h: L.h || 0}; };
function dztUnion(list) { if (!list.length) return null; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; list.forEach(L => { const b = dztBox(L); x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h); }); return {x: x0, y: y0, w: x1 - x0, h: y1 - y0}; }
function dztDone(msg) { dzCommit(); dzInspector(); dzDraw(); dzSlidesPanel(); if (msg) toast(msg); }

/* nomes e ícones das camadas */
const DZT_SHAPE_NAME = {rect: 'Retângulo', ellipse: 'Círculo', arch: 'Arco', triangle: 'Triângulo', diamond: 'Losango', hexagon: 'Hexágono', star: 'Estrela', arrow: 'Seta', bubble: 'Balão', line: 'Linha', ring: 'Anel'};
dzmLabel = function (L) {
  const plain = t => String(t || '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim(), nm = L.name ? String(L.name).slice(0, 40) : '';
  if (L.type === 'text') return {ic: 'T', nm: nm || plain(L.content).slice(0, 34) || 'Texto', sub: L.role === 'free' ? '' : (L.role || 'texto')};
  if (L.type === 'rect') return {ic: ({ellipse: '●', triangle: '▲', diamond: '◆', hexagon: '⬢', star: '★', arrow: '➜', bubble: '💬', line: '―', ring: '◎'})[L.shape] || '▭', nm: nm || DZT_SHAPE_NAME[L.shape || 'rect'] || 'Forma', sub: L.role === 'free' ? '' : (L.role || '')};
  if (L.type === 'path') return {ic: L.role === 'icon' ? '✦' : '◇', nm: nm || (L.role === 'icon' ? 'Ícone' : 'Símbolo'), sub: L.role === 'icon' ? '' : (L.role || '')};
  if (L.type === 'draw') return {ic: '✎', nm: nm || 'Desenho', sub: ((L.strokes || []).length) + ' traço(s)'};
  if (L.type === 'video') return {ic: '▶', nm: nm || 'Vídeo', sub: L.role || ''};
  if (L.role === 'logo') return {ic: '◉', nm: nm || 'Logo', sub: ''};
  return {ic: '▣', nm: nm || 'Foto', sub: L.role || 'imagem'};
};

/* ---------- casca do editor ---------- */
const dztRail = () => `<div class="dzt-tools">${DZT_TOOLS.map(t => !t ? '<i class="dzt-hr"></i>' : `<button class="dzt-t ${DZT.tool === t[0] ? 'on' : ''}" data-tool="${t[0]}" data-tip="${t[2]}  ·  ${t[1]}" title="${t[2]} (${t[1]}) — ${t[3]}" onclick="dztTool('${t[0]}')">${t[0] === 'shape' ? dztSvg(DZT.shape === 'rect' || DZT.shape === 'round' ? 'shape' : 'shape') : dztSvg(t[0])}<kbd>${t[1]}</kbd></button>`).join('')}</div>
  <i class="dzt-hr"></i><div class="dzt-tools">${DZT_PANELS.map(([k, n]) => `<button class="dzt-t dzt-p ${DZT.panel === k && !DZT.lclosed ? 'on' : ''}" data-panel="${k}" data-tip="${n}" title="Painel ${n}" onclick="dztPanel('${k}')">${dztSvg(k)}</button>`).join('')}</div>`;
function dzEditorShell(p, r) {
  const s = dzSet(), back = dz.fromBook ? '‹ Voltar ao e-book' : '‹ Voltar';
  const extra = (typeof gridUI !== 'undefined' && gridUI.from ? '<button class="dzm-btn" onclick="gridBack()">‹ Grid</button>' : '') + (typeof feedUI !== 'undefined' && feedUI.from && feedUI.id ? '<button class="dzm-btn" onclick="feedUI.from=false;go(\'feed\')">‹ Feed</button>' : '');
  const M = (fn, ic, t, sub) => `<button onclick="dzmMenu(false);${fn}"><span style="width:18px;text-align:center">${ic}</span><span>${t}${sub ? `<small>${sub}</small>` : ''}</span></button>`;
  if (DZT.panelFor !== s.id) { DZT.panelFor = s.id; DZT.panel = s.slides.every(sl => !sl.layers.length) ? 'el' : 'ly'; DZT.tool = 'select'; DZT.q = ''; }
  const TB = (id, ic, t, tip) => `<button class="dzm-btn dzt-tb ${DZT.dock === id ? 'on' : ''}" data-dock="${id}" onclick="dztToggle('${id}')" title="${tip}">${ic ? `<span>${ic}</span>` : ''}${t}</button>`;
  r.innerHTML = `<div class="dzm">
  <header class="dzm-top">
    <button class="dzm-btn" onclick="dzBack()">${back}</button>${extra}
    <input class="dzm-name" value="${esc(s.name)}" onchange="dzSet().name=this.value;persist()" title="Nome da arte">
    <span class="dzm-sep"></span>
    <button class="dzm-ic" onclick="dzUndo()" title="Desfazer (Ctrl+Z)">↶</button><button class="dzm-ic" onclick="dzRedo()" title="Refazer (Ctrl+Y)">↷</button>
    <button class="dzm-ic ${dz.mode === 'emphasis' ? 'on' : ''}" onclick="dzModeEm()" title="Destacar palavras por clique">✦</button><button class="dzm-ic ${dz.mode === 'fmt' ? 'on' : ''}" onclick="dzModeFmt()" title="Formatar uma palavra (Shift estende)">✎</button>
    <span class="dzm-sep"></span>
    ${TB('free', '✥', 'Livre', 'Livre: arraste qualquer elemento para onde quiser. Alt+arrastar duplica. Imãs e guias ajudam a alinhar.')}${TB('ia', '✦', 'IA', 'Comandos para a arte: mudar fundo, aumentar título, mais respiro, alinhar…')}${TB('prev', '▶', 'Prévia', 'A arte limpa em tela cheia, sem guias')}${TB('ver', '⟲', 'Versões', 'Salvar, restaurar, comparar e aprovar versões desta arte')}${TB('sis', '◈', 'Sistema', 'Design system da arte: cores, fontes, margem e cantos')}${TB('imp', '⇪', 'Importar', 'Imagem, SVG e outras fontes')}
    <span class="dzm-grow"></span><span class="dzm-auto" id="dzAuto"></span>
    <select class="dzm-zoom" onchange="dzmZoom(this.value)" title="Zoom"><option value="fit" ${DZM.zoom ? '' : 'selected'}>Ajustar</option>${[25, 50, 75, 100, 150, 200, 400].map(z => `<option value="${z}" ${DZM.zoom === z / 100 ? 'selected' : ''}>${z}%</option>`).join('')}</select>
    ${TB('keys', '⌨', '', 'Atalhos de teclado (tecle ?)')}
    ${s.approved ? '<span class="dzm-pill">✔ Aprovada</span>' : ''}<button class="dzm-btn acc" onclick="dzResizeOpen(dz.setId)" title="Gerar esta arte em outros tamanhos">⤢ Tamanhos</button>
    <button class="dzm-btn" onclick="dzVarOpen(dz.setId)" title="Gerar variações desta arte">⚡ Variações</button>
    <button class="dzm-btn" onclick="event.stopPropagation();dzmMenu()" title="Baixar PNG, PDF, PSD, pacote…">⬇ Exportar</button>
    <div class="dzm-gowrap"><button class="dzm-go" id="dzSaveBtn" onclick="dzSaveNow()" title="Salvar agora (Ctrl+S). O editor também salva sozinho">Salvar</button><button class="dzm-go2" onclick="event.stopPropagation();dzmMenu()" title="Salvar e gerar">▾ Gerar</button>
      <div class="dzm-menu" id="dzMenu" onclick="event.stopPropagation()">
        <h6>Baixar</h6>${M('dzExportOne()', '⬇', 'PNG desta página')}${M('dzExportAll()', '⬇', 'Todas as páginas (ZIP)')}${M('dzExportPDF()', '⬇', 'PDF', 'uma página por slide')}${M('dzExportPSD()', '⬇', 'Photoshop (PSD) em camadas')}${M('dzExportLayers()', '⬇', 'PNG por camada', 'com manifesto')}
        <hr><h6>Gerar mais</h6>${M('dzApproveToggle()', s.approved ? '✔' : '○', s.approved ? 'Arte aprovada (retirar)' : 'Marcar como aprovada', 'libera outros tamanhos e variações')}${M('dzResizeOpen(dz.setId)', '⤢', 'Outros tamanhos', 'feed, stories, anúncios, capas, tamanho livre')}${M('dzVarOpen(dz.setId)', '⚡', 'Fábrica de variações', 'textos × estilos × layouts')}${M('pmQuick(\'ads\')', '📄', 'Subir tabela em lote', 'criar vários anúncios de uma vez')}
        <hr><h6>Guardar</h6>${M('pkgOpen({sets:[dzSet().id]})', '📦', 'Pacote', 'peça com imagens e fontes')}${M('dzSaveTemplate()', '★', 'Salvar como modelo')}${M('dzSaveStyle()', '◈', 'Salvar como estilo')}${M('dzApplyStyleModal()', '◇', 'Aplicar estilo…')}
        <hr>${M('flipRead(\'ds\', dz.setId)', '📖', 'Folhear como livro')}${s.deck ? M('dzPresentDeck()', '▶', 'Apresentar') : ''}
        <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;color:var(--m-mut);font-size:11.5px">Histórico ${histSelect()}</div>
      </div></div>
  </header>
  <div class="dzm-body dzt-body ${DZT.lclosed ? 'lc' : ''}" id="dzBody">
    <nav class="dzt-rail" id="dzRail">${dztRail()}</nav>
    <aside class="dzm-left" id="dzLeft"><div class="dzt-ltabs" id="dzLTabs"></div><div class="dzt-lbody" id="dzLeftBody"></div></aside>
    <section class="dzm-stagewrap"><div class="dzm-corner"></div><canvas class="dzm-rt" id="dzRT" title="Arraste para baixo para criar uma guia horizontal"></canvas><canvas class="dzm-rl" id="dzRL" title="Arraste para a direita para criar uma guia vertical"></canvas><div class="dz-stage" id="dzStage"><canvas id="dzCanvas"></canvas></div><div class="dzm-hint" id="dzHint"></div></section>
    <aside class="dzm-right"><div class="dz-insp" id="dzInsp"></div></aside>
  </div>
  <footer class="dzm-bottom"><div class="dzm-pt"><button onclick="dzSlideMove(-1)" title="Mover para trás">◀</button><button onclick="dzSlideMove(1)" title="Mover para frente">▶</button><button onclick="dzSlideDel()" title="Apagar esta página">×</button></div><div class="dz-slides" id="dzSlides"></div></footer>
  </div><input type="file" id="dzFile" accept="image/*" hidden>`;
  dzBindCanvas(); dztBind(); dzLeftRender(); dzSlidesPanel(); dzInspector(); dzFit(); dzAutoUpdate(); dztHint(); const st = $('dzStage'); if (st) st.addEventListener('scroll', dzRulers);
  ensureSetResources(s).then(() => { dzDraw(); dzSlidesPanel(); });
  if (dz.hist.length === 0) dzSnap();
  if (DZT.dock && DZT.docks[DZT.dock]) DZT.docks[DZT.dock]();
}
function dztHint() { const h = $('dzHint'); if (!h) return; const t = DZT.tool; h.textContent = ({select: 'Arraste para mover · alças redimensionam · Shift+clique soma · Alt+arrastar duplica · duplo clique no texto edita', hand: 'Arraste para mover a prancheta', text: 'Clique na arte para escrever', shape: 'Arraste para desenhar a forma · Shift = proporcional', brush: 'Arraste para desenhar · tamanho e cor à direita', eraser: 'Arraste sobre um desenho para apagar', zoom: 'Clique aproxima · Alt+clique afasta', pick: 'Clique em qualquer ponto para pegar a cor'})[t] || ''; }

function dzAutoUpdate() { const el = $('dzAuto'); if (el) el.innerHTML = `<span class="dzt-saved" title="Salvo automaticamente neste navegador · passo ${Math.max(0, dz.hi)} de ${Math.max(0, dz.hist.length - 1)} do desfazer">✓ Salvo ${autoTime().slice(0, 5)}</span>`; }

/* ---------- ferramentas ---------- */
function dztTool(t) {
  if (t === 'image') { dzAddImage(); return dztFlash(t); } if (t === 'logo') { dzAddLogo(); return dztFlash(t); } if (t === 'video') { dzAddVideo(); return dztFlash(t); }
  if (t === 'shape' && DZT.tool === 'shape') return dztFly();
  DZT.tool = t; dz.mode = 'select'; DZT.snapLines = []; DZT.marquee = null;
  if (t === 'brush' || t === 'eraser' || t === 'pick') { dz.sel = ''; dz.multi = []; dz.range = null; }
  dztRailMark(); const st = $('dzStage'); if (st) st.className = st.className.replace(/\bdzt-t-\w+/g, '').trim() + ' dzt-t-' + t; dztHint();
  if (t === 'shape') dztFly(); else dztFlyClose(); dzInspector(); dzDraw(); dzLayersPanel();
}
function dztFlash(t) { const b = document.querySelector(`.dzt-t[data-tool="${t}"]`); if (b) { b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 500); } }
function dztRailMark() { document.querySelectorAll('.dzt-t[data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === DZT.tool)); }
function dztFly() {
  dztFlyClose(); const b = document.querySelector('.dzt-t[data-tool="shape"]'), r = b && b.getBoundingClientRect(); if (!r) return; const d = document.createElement('div'); d.id = 'dztFly'; d.className = 'dzt-fly'; d.style.left = (r.right + 6) + 'px'; d.style.top = Math.max(50, r.top - 4) + 'px';
  d.innerHTML = DZT_SHAPES.map(([k, n]) => `<button class="${DZT.shape === k ? 'on' : ''}" onclick="dztPickShape('${k}')" title="${n}">${dztShapeSvg(k)}<span>${n}</span></button>`).join(''); document.body.appendChild(d);
}
function dztFlyClose() { const d = $('dztFly'); if (d) d.remove(); }
function dztPickShape(k) { DZT.shape = k; DZT.tool = 'shape'; dztFlyClose(); dztRailMark(); dztHint(); dzInspector(); }
document.addEventListener('click', e => { if (!e.target.closest || (!e.target.closest('#dztFly') && !e.target.closest('.dzt-t[data-tool="shape"]'))) dztFlyClose(); });

/* ---------- painéis flutuantes (Livre, IA, Versões, Sistema, Importar, Atalhos) ---------- */
function dztToggle(id) { if (id === 'prev') { dztDockClose(); return DZT.docks.prev && DZT.docks.prev(); } if (DZT.dock === id) dztDockClose(); else { dztDockClose(); DZT.dock = id; (DZT.docks[id] || (() => { }))(); } dztDockMark(); }
function dztDockMark() { document.querySelectorAll('.dzt-tb[data-dock]').forEach(b => b.classList.toggle('on', b.dataset.dock === DZT.dock)); }
function dztDock(id, title, html, w) {
  const host = document.querySelector('.dzm'); if (!host) return; let d = $('dztDock'); if (!d) { d = document.createElement('div'); d.id = 'dztDock'; host.appendChild(d); }
  d.className = 'dzt-dock'; d.dataset.id = id; d.style.width = (w || 380) + 'px'; d.innerHTML = `<header><b>${title}</b><button onclick="dztDockClose()" title="Fechar (Esc)">×</button></header><div class="dzt-dock-b">${html}</div>`; d.style.display = 'block'; DZT.dock = id; dztDockMark();
}
function dztDockClose() { const d = $('dztDock'); if (d) d.style.display = 'none'; DZT.dock = ''; dztDockMark(); }
DZT.docks.free = () => dztDock('free', '✥ Livre', `<p style="margin:0 0 10px;color:var(--m-mut)">Na mesa <b>tudo é livre</b>: arraste qualquer elemento para onde quiser, sem grade nem colunas.</p>
  <ul class="dzt-ul"><li><b>Alt + arrastar</b> duplica o elemento e leva a cópia.</li><li><b>Shift + arrastar</b> trava na horizontal ou na vertical.</li><li><b>Setas</b> movem 1 px (Shift = 10 px).</li><li>Segure <b>Ctrl</b> enquanto arrasta para soltar sem imãs.</li></ul>
  <label class="dzt-row"><input type="checkbox" ${DZT.snap ? 'checked' : ''} onchange="DZT.snap=this.checked"> Imãs: encaixar nas guias, nas bordas, no centro e nos outros elementos</label>`, 360);

/* ---------- painel da esquerda ---------- */
function dztPanel(k) { if (DZT.panel === k && !DZT.lclosed) { DZT.lclosed = true; } else { DZT.panel = k; DZT.lclosed = false; } const b = $('dzBody'); if (b) b.classList.toggle('lc', DZT.lclosed); document.querySelectorAll('.dzt-p').forEach(x => x.classList.toggle('on', x.dataset.panel === DZT.panel && !DZT.lclosed)); dzLeftRender(); setTimeout(() => { dzFit(); dzDraw(); }, 30); }
function dzLeftRender() {
  const tabs = $('dzLTabs'), body = $('dzLeftBody'); if (!tabs || !body) return;
  tabs.innerHTML = DZT_PANELS.map(([k, n]) => `<button class="${DZT.panel === k ? 'on' : ''}" data-ltab="${k}" onclick="dztPanel2('${k}')">${dztSvg(k, 15)}<span>${n}</span></button>`).join('');
  body.innerHTML = ({el: dztPaneEl, ly: dztPaneLy, lib: dztPaneLib, as: dztPaneAs, ref: dztPaneRef})[DZT.panel]();
  if (DZT.panel === 'ly') dzLayersPanel(); else if (DZT.panel === 'lib') dztLibPaint(); else if (DZT.panel === 'as') dztAsPaint(); else if (DZT.panel === 'ref') dztRefPaint();
}
function dztPanel2(k) { DZT.panel = k; DZT.lclosed = false; const b = $('dzBody'); if (b) b.classList.remove('lc'); document.querySelectorAll('.dzt-p').forEach(x => x.classList.toggle('on', x.dataset.panel === k)); dzLeftRender(); }

/* --- Elementos --- */
function dztPaneEl() {
  return `<div class="dzt-sh"><input type="search" placeholder="Buscar elemento" value="${esc(DZT.eq)}" oninput="DZT.eq=this.value;dztElRefresh()"></div>
  <div id="dztElBody">${dztElHtml()}</div>`;
}
/* favoritos (★): só neste navegador */
const dztFavs = () => { try { const a = JSON.parse(localStorage.getItem('dzt_favs') || '[]'); return Array.isArray(a) ? a.filter(x => typeof x === 'string').slice(0, 30) : []; } catch (e) { return []; } };
function dztFav(k) { const a = dztFavs(), i = a.indexOf(k); if (i < 0) a.push(k); else a.splice(i, 1); try { localStorage.setItem('dzt_favs', JSON.stringify(a)); } catch (e) { /* sem armazenamento */ } dztElRefresh(); }
function dztElHtml() {
  const q = DZT.eq.toLowerCase(), favs = dztFavs(), has = n => !q || n.toLowerCase().includes(q);
  const tile = (key, n, inner, small) => `<button class="dzt-tile ${small ? 's' : ''}" draggable="true" ${key.startsWith('shape:') ? `data-shape="${key.slice(6)}"` : `data-el="${key}"`} ondragstart="dztDragStart(event,'${key}')" ondragend="DZT.dragKind=''" onclick="dztInsert('${key}')" title="${n}: clique para inserir ou arraste para a arte"><i class="fav ${favs.includes(key) ? 'on' : ''}" title="${favs.includes(key) ? 'Tirar dos favoritos' : 'Marcar como favorito'}" onclick="event.stopPropagation();dztFav('${key}')">★</i>${inner}${small ? '' : `<span>${n}</span>`}</button>`;
  const basics = DZT_BASIC.filter(b => has(b[1])), shapes = DZT_SHAPES.filter(s => has(s[1])), all = [...DZT_BASIC.map(b => ['', b]), ...DZT_SHAPES.map(s => ['shape:', s])];
  const favTiles = favs.map(k => { const b = DZT_BASIC.find(x => x[0] === k), sh = k.startsWith('shape:') && DZT_SHAPES.find(x => x[0] === k.slice(6)); return b ? tile(k, b[1], dztEl(b[2])) : sh ? tile(k, sh[1], dztShapeSvg(sh[0]), true) : ''; }).filter(Boolean); void all;
  return `${favTiles.length && !q ? `<h5>Favoritos ★</h5><div class="dzt-grid4">${favTiles.join('')}</div>` : ''}${basics.length ? `<h5>Básicos</h5><div class="dzt-grid3">${basics.map(([k, n, ic]) => tile(k, n, dztEl(ic))).join('')}</div>` : ''}
  ${shapes.length ? `<h5>Formas</h5><div class="dzt-grid4">${shapes.map(([k, n]) => tile('shape:' + k, n, dztShapeSvg(k), true)).join('')}</div>` : ''}
  ${!basics.length && !shapes.length ? '<p class="dzt-empty">Nada com esse nome.</p>' : ''}<p class="dzt-tip">Clique para inserir no centro da arte ou arraste para o lugar certo. Passe o mouse e clique na ★ para marcar favoritos. Para desenhar uma forma com o mouse use a ferramenta Forma (R).</p>`;
}
function dztElRefresh() { const b = $('dztElBody'); if (b) b.innerHTML = dztElHtml(); }
function dztDragStart(e, k) { DZT.dragKind = k; try { e.dataTransfer.setData('text/plain', 'dzel:' + k); e.dataTransfer.effectAllowed = 'copy'; } catch (_) { /* sem dataTransfer */ } }

/* constrói as camadas de cada elemento (centro em `at`, em px da arte) */
function dztBuild(key, at) {
  const s = dzSet(), tk = s.tk, f = s.format, cx = at ? at.x : f.w / 2, cy = at ? at.y : f.h / 2, base = Math.round(Math.min(f.w, f.h) * 0.26), out = [], free = L => { L.free = true; return L; };
  const emphasis = L => Object.assign(L, {emMode: (tk.em && tk.em.mode) || 'color', emColor: tk.accent, emBg: tk.accent, emText: readable(tk.accent)});
  const txt = (content, o, role) => { const L = T('body', Object.assign({content, w: Math.round(f.w * 0.62)}, o)); themeLayer(L, tk); L.role = 'free'; if (role === 'head') Object.assign(L, {family: tk.head.family, weight: tk.head.weight, upper: tk.upper}); return free(emphasis(L)); };
  const centerY = L => { L.x = Math.round(cx - L.w / 2); L.y = Math.round(cy - layoutText(L).h / 2); return L; };
  if (key === 'text') out.push(centerY(txt('Novo **texto**', {size: Math.round(f.w * 0.055)})));
  else if (key === 'title') out.push(centerY(txt('Título da **arte**', {size: Math.round(f.w * 0.095), lh: 1.08}, 'head')));
  else if (key === 'list') out.push(centerY(txt('• Primeiro item\n• Segundo item\n• Terceiro item', {size: Math.round(f.w * 0.045), lh: 1.55})));
  else if (key === 'divider') { const w = Math.round(f.w * 0.5); out.push(free(RC('free', {shape: 'line', x: Math.round(cx - w / 2), y: Math.round(cy - 4), w, h: 8, fill: tk.accent, radius: 4}))); out[0].name = 'Divisor'; }
  else if (key === 'button') {
    const w = Math.round(f.w * 0.5), h = Math.round(w * 0.22), g = uid('G'), r = free(RC('free', {x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), w, h, fill: tk.accent, radius: Math.round(h / 2)})); r.name = 'Botão'; r.group = g;
    const t = txt('Fale com a gente', {size: Math.round(h * 0.38), w: w - 40, align: 'center', color: readable(tk.accent), upper: false}, 'head'); t.color = readable(tk.accent); t.group = g; t.x = Math.round(cx - t.w / 2); t.y = Math.round(cy - layoutText(t).h / 2); t.name = 'Texto do botão'; out.push(r, t);
  } else if (key === 'badge') {
    const d = Math.round(f.w * 0.24), g = uid('G'), r = free(RC('free', {shape: 'ellipse', x: Math.round(cx - d / 2), y: Math.round(cy - d / 2), w: d, h: d, fill: tk.accent})); r.name = 'Selo'; r.group = g;
    const t = txt('NOVO', {size: Math.round(d * 0.24), w: d - 20, align: 'center', color: readable(tk.accent)}, 'head'); t.color = readable(tk.accent); t.group = g; t.x = Math.round(cx - t.w / 2); t.y = Math.round(cy - layoutText(t).h / 2); t.name = 'Texto do selo'; out.push(r, t);
  } else if (key.startsWith('icon:')) {
    const ic = DZT_ICONS[key.slice(5)]; if (!ic) return []; const d = Math.round(base * 0.8), L = free({id: lid(), type: 'path', role: 'icon', name: ic[0], x: Math.round(cx - d / 2), y: Math.round(cy - d / 2), w: d, h: d, vb: 100, d: ic[1], fill: ic[3] ? '' : tk.accent, stroke: ic[3] ? tk.accent : '', strokeW: ic[3] ? 7 : 0, opacity: 1}); if (ic[2]) L.rule = ic[2]; out.push(L);
  } else if (key.startsWith('shape:')) {
    const k = key.slice(6), kind = k === 'round' ? 'rect' : k; let w = base, h = base;
    if (k === 'line') { w = Math.round(base * 1.6); h = 8; } else if (k === 'arrow') { w = Math.round(base * 1.4); h = Math.round(base * 0.7); } else if (k === 'bubble') { w = Math.round(base * 1.4); h = base; }
    const L = free(RC('free', {shape: kind === 'rect' ? undefined : kind, x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), w, h, fill: k === 'line' ? tk.fg : tk.accent, radius: k === 'round' ? Math.round(Math.min(w, h) * 0.18) : 0})); if (!L.shape) delete L.shape; L.name = (DZT_SHAPES.find(x => x[0] === k) || [0, 'Forma'])[1]; if (k === 'line') L.radius = 4; out.push(L);
  }
  return out;
}
function dztInsert(key, at) {
  if (key === 'image') return dzAddImage(); if (key === 'photo') return dzAddPhoto(); if (key === 'logo') return dzAddLogo(); if (key === 'video') return dzAddVideo();
  if (key === 'icon') { DZT.panel = 'as'; DZT.lclosed = false; const b = $('dzBody'); if (b) b.classList.remove('lc'); dzLeftRender(); const h = $('dztIcons'); if (h) h.scrollIntoView({block: 'nearest'}); return; }
  const sl = dzSlide(); if (!sl) return; const L = dztBuild(key, at); if (!L.length) return; sl.layers.push(...L); dztSetSel(L.map(x => x.id)); if (DZT.tool !== 'select') dztToolQuiet('select'); dztDone();
}
function dztDropOnStage(e) {
  const d = (e.dataTransfer && e.dataTransfer.getData('text/plain')) || '', k = d.startsWith('dzel:') ? d.slice(5) : DZT.dragKind; if (!k) return; e.preventDefault(); DZT.dragKind = '';
  const cv = $('dzCanvas'), r = cv.getBoundingClientRect(), at = {x: Math.round((e.clientX - r.left) / r.width * cv.width), y: Math.round((e.clientY - r.top) / r.height * cv.height)};
  if (k.startsWith('lib:')) return dztInsertLib(k.slice(4), at); if (k.startsWith('cmp:')) return dztInsertComp(k.slice(4), at); dztInsert(k, at);
}

/* --- Camadas (árvore) --- */
function dztPaneLy() {
  return `<div class="dzt-sh"><input type="search" placeholder="Buscar camada" value="${esc(DZT.q)}" oninput="DZT.q=this.value;dzLayersPanel()"></div><div class="dzm-lylist" id="dzLayers"></div>
  <div class="dzm-lyact"><button onclick="dzLayerMove(1)" title="Trazer para frente ( ] )">▲</button><button onclick="dzLayerMove(-1)" title="Enviar para trás ( [ )">▼</button><button onclick="dzLayerDup()" title="Duplicar (Ctrl+D)">⧉</button><button onclick="dztGroup()" title="Agrupar (Ctrl+G)">▣</button><button onclick="dztUngroup()" title="Desagrupar (Ctrl+Shift+G)">▢</button><button onclick="dzLayerDel()" title="Apagar (Delete)">🗑</button></div>`;
}
function dzLayersPanel() {
  const el = $('dzLayers'), sl = dzSlide(); if (!el || !sl) return;
  const q = (DZT.q || '').trim().toLowerCase(), ids = dztIds(), rev = [...sl.layers].reverse(), row = (L, ind) => {
    const m = dzmLabel(L); return `<div class="dzm-ly ${ids.includes(L.id) ? 'on' : ''} ${L.hidden ? 'off' : ''} ${ind ? 'ind' : ''}" draggable="true" data-id="${L.id}" onclick="dzmSel('${L.id}',event)" ondragstart="dztLyDrag(event,'${L.id}')" ondragover="dztLyOver(event)" ondragleave="this.classList.remove('da','db')" ondrop="dztLyDrop(event,'${L.id}')"><span class="ic">${m.ic}</span><span class="nm">${esc(m.nm)}${m.sub ? `<small>${esc(m.sub)}</small>` : ''}</span><span class="hv"><button title="Duplicar" onclick="event.stopPropagation();dzmDup('${L.id}')">⧉</button><button title="Excluir" onclick="event.stopPropagation();dzmDel('${L.id}')">×</button></span><button class="${L.hidden ? '' : 'on'}" title="${L.hidden ? 'Mostrar' : 'Ocultar'}" onclick="event.stopPropagation();dzmVis('${L.id}')">${L.hidden ? '○' : '●'}</button><button class="${L.locked ? 'on' : ''}" title="${L.locked ? 'Destravar' : 'Travar (não move com o mouse)'}" onclick="event.stopPropagation();dzmLock('${L.id}')">${L.locked ? '🔒' : '🔓'}</button></div>`;
  }, out = [];
  if (q) { rev.forEach(L => { const m = dzmLabel(L); if ((m.nm + ' ' + m.sub + ' ' + (L.role || '') + ' ' + (L.type || '')).toLowerCase().includes(q)) out.push(row(L, false)); }); }
  else { const seen = new Set(); rev.forEach(L => {
    if (L.group) { if (seen.has(L.group)) return; seen.add(L.group); const mem = rev.filter(x => x.group === L.group), open = !DZT.collapsed[L.group], allHid = mem.every(x => x.hidden), allLock = mem.every(x => x.locked), on = mem.every(x => ids.includes(x.id));
      out.push(`<div class="dzm-ly grp ${on ? 'on' : ''} ${allHid ? 'off' : ''}" draggable="true" data-id="${mem[0].id}" data-grp="${L.group}" onclick="dztSelGroup('${L.group}',event)" ondragstart="dztLyDrag(event,'${mem[0].id}')" ondragover="dztLyOver(event)" ondragleave="this.classList.remove('da','db')" ondrop="dztLyDrop(event,'${mem[0].id}')"><span class="ic" onclick="event.stopPropagation();dztColl('${L.group}')">${open ? '▾' : '▸'}</span><span class="nm">Grupo<small>${mem.length} elementos</small></span><button class="${allHid ? '' : 'on'}" title="Ocultar/mostrar o grupo" onclick="event.stopPropagation();dztGrpFlag('${L.group}','hidden')">${allHid ? '○' : '●'}</button><button class="${allLock ? 'on' : ''}" title="Travar/destravar o grupo" onclick="event.stopPropagation();dztGrpFlag('${L.group}','locked')">${allLock ? '🔒' : '🔓'}</button></div>`);
      if (open) mem.forEach(x => out.push(row(x, true))); } else out.push(row(L, false)); }); }
  el.innerHTML = out.join('') || `<p class="muted" style="padding:10px;color:var(--m-mut)">${q ? 'Nenhuma camada com esse nome.' : 'Esta página não tem camadas. Use a aba Elementos ou a ferramenta Texto (T).'}</p>`;
}
function dztColl(g) { DZT.collapsed[g] = !DZT.collapsed[g]; dzLayersPanel(); }
function dztSelGroup(g, ev) { const sl = dzSlide(), ids = sl.layers.filter(l => l.group === g).map(l => l.id); if (ev && (ev.shiftKey || ev.ctrlKey || ev.metaKey)) ids.push(...dztIds()); dztSetSel(ids); DZT.sel0 = ''; dzInspector(); dzDraw(); dzLayersPanel(); }
function dztGrpFlag(g, k) { const sl = dzSlide(), mem = sl.layers.filter(l => l.group === g), v = !mem.every(x => x[k]); mem.forEach(x => { x[k] = v; }); if (k === 'hidden' && v) dztSetSel([]); dztDone(); }
function dzmSel(id, ev) {
  const sl = dzSlide(), L = sl && sl.layers.find(l => l.id === id); if (!L) return; let ids = L.group ? sl.layers.filter(l => l.group === L.group).map(l => l.id) : [id];
  if (ev && (ev.shiftKey || ev.ctrlKey || ev.metaKey)) { const cur = dztIds(); ids = ids.every(i => cur.includes(i)) ? cur.filter(i => !ids.includes(i)) : [...cur, ...ids]; }
  dztSetSel(ids); dzInspector(); dzDraw(); dzLayersPanel();
}
function dzmVis(id) { const L = dzSlide().layers.find(l => l.id === id); if (!L) return; L.hidden = !L.hidden; if (L.hidden && dz.sel === id) dz.sel = ''; dzDraw(); dzCommit(); dzInspector(); dzSlidesPanel(); }
function dzmLock(id) { const L = dzSlide().layers.find(l => l.id === id); if (!L) return; L.locked = !L.locked; dzCommit(); dzLayersPanel(); }
function dzmDup(id) { const sl = dzSlide(), L = sl.layers.find(l => l.id === id); if (!L) return; dztSetSel([id]); dztDuplicate(); }
function dzmDel(id) { dztSetSel([id]); dztDelete(); }
let LYD = null;
function dztLyDrag(e, id) { const sl = dzSlide(), L = sl.layers.find(l => l.id === id), ids = dztIds(); LYD = ids.includes(id) ? ids : (L && L.group ? sl.layers.filter(l => l.group === L.group).map(l => l.id) : [id]); try { e.dataTransfer.setData('text/plain', 'dzly:' + id); e.dataTransfer.effectAllowed = 'move'; } catch (_) { /* sem dataTransfer */ } }
function dztLyOver(e) { e.preventDefault(); const t = e.currentTarget, r = t.getBoundingClientRect(), up = e.clientY < r.top + r.height / 2; t.classList.toggle('da', up); t.classList.toggle('db', !up); }
function dztLyDrop(e, id) {
  e.preventDefault(); const t = e.currentTarget, up = t.classList.contains('da'); t.classList.remove('da', 'db'); if (!LYD) return; const ids = LYD; LYD = null; dztReorder(ids, id, up);
}
/* "acima" na lista = mais à frente na arte (índice maior) */
function dztReorder(ids, targetId, above) {
  const sl = dzSlide(); if (!sl || ids.includes(targetId)) return; const mv = sl.layers.filter(l => ids.includes(l.id)), rest = sl.layers.filter(l => !ids.includes(l.id));
  const tg = sl.layers.find(l => l.id === targetId), tids = tg && tg.group ? sl.layers.filter(l => l.group === tg.group && !ids.includes(l.id)).map(l => l.id) : [targetId];
  const idx = tids.map(i => rest.findIndex(l => l.id === i)).filter(i => i >= 0); if (!idx.length) return; const at = above ? Math.max(...idx) + 1 : Math.min(...idx);
  rest.splice(at, 0, ...mv); sl.layers = rest; dztDone();
}

/* --- Biblioteca --- */
function dztPaneLib() {
  const p = dzP(), lib = (p.design.lib || []), styles = p.design.styles || [];
  return `<h5>Meus componentes <small>${lib.length}</small></h5><button class="dzt-btn" onclick="dztSaveComp()">＋ Salvar seleção como componente</button>
  <div class="dzt-cmps" id="dztCmps">${lib.length ? lib.map(c => `<article draggable="true" ondragstart="dztDragStart(event,'cmp:${c.id}')" ondragend="DZT.dragKind=''"><canvas data-cmp="${c.id}" width="110" height="${Math.max(30, Math.min(110, Math.round(110 * c.h / c.w)))}"></canvas><b>${esc(c.name)}</b><div><button onclick="dztInsertComp('${c.id}')">Inserir</button><button title="Excluir" onclick="dztDelComp('${c.id}')">×</button></div></article>`).join('') : '<p class="dzt-empty">Selecione elementos na arte e salve aqui para reusar em qualquer arte do projeto.</p>'}</div>
  <h5>Estilos salvos <small>${styles.length}</small></h5>${styles.length ? styles.map(s => `<div class="dzt-sty"><span class="sw">${[s.tk.bg, s.tk.fg, s.tk.accent, s.tk.muted].map(c => `<i style="background:${esc(c)}"></i>`).join('')}</span><b>${esc(s.name)}</b><button onclick="dzApplyStyle('${s.id}',false)">Aplicar</button></div>`).join('') : '<p class="dzt-empty">Nenhum estilo salvo. Use “Salvar como estilo” no menu Gerar.</p>'}
  <h5>Modelos</h5><div class="dzt-links"><button class="dzt-btn" onclick="dzLayoutsOpen()">▦ Modelos de layout</button><button class="dzt-btn" onclick="dzTemplatesOpen()">★ Modelos salvos</button><button class="dzt-btn" onclick="dzBrandOpen()">◈ Brand Kit</button></div>
  <h5>Cores da marca</h5><div class="dzt-sws" id="dztSws"></div><p class="dzt-tip">Clique numa cor para aplicar no elemento selecionado (texto ou forma).</p>`;
}
function dztBrandCols() { const p = dzP(), tk = dzSet().tk; let cs = [tk.bg, tk.fg, tk.accent, tk.muted, tk.second].filter(Boolean); try { const b = brandOf(p); if (b && b.pal) cs.push(b.pal.c60, b.pal.c30, b.pal.c10, ...(b.grays || [])); } catch (e) { /* sem brand kit */ } return [...new Set(cs.filter(c => /^#[0-9a-f]{6}$/i.test(String(c))).map(c => c.toLowerCase()))]; }
function dztLibPaint() {
  const sw = $('dztSws'); if (sw) sw.innerHTML = dztBrandCols().map(c => `<button style="background:${esc(c)}" title="${esc(c)}" onclick="dztApplyColor('${esc(c)}')"></button>`).join('');
  const p = dzP(); document.querySelectorAll('canvas[data-cmp]').forEach(async cv => { const c = (p.design.lib || []).find(x => x.id === cv.dataset.cmp); if (!c) return; await ensureSetResources({slides: [{layers: c.layers}]}); const k = cv.width / c.w; renderSlide(cv.getContext('2d'), {noBg: true, layers: JSON.parse(JSON.stringify(c.layers))}, c.w, c.h, k); });
}
function dztApplyColor(c) { const ls = dztLayers(); if (!ls.length) { DZT.color = c; toast('Cor ' + c + ' escolhida para o pincel. Selecione um elemento para aplicar nele.'); dzInspector(); return; } ls.forEach(L => { if (L.type === 'text') L.color = c; else if (L.type === 'rect' || L.type === 'path') L.fill = c; }); dztDone(); }
function dztSaveComp() {
  const ls = dztLayers(); if (!ls.length) { toast('Selecione um ou mais elementos na arte.'); return; } const u = dztUnion(ls), p = dzP();
  askText('Salvar componente', 'Nome do componente (ex.: Botão principal)', name => { const layers = JSON.parse(JSON.stringify(ls)); layers.forEach(l => { l.x = Math.round(l.x - u.x); l.y = Math.round(l.y - u.y); delete l.locked; delete l.hidden; });
    p.design.lib = (p.design.lib || []).concat([{id: uid('cp'), name: name.slice(0, 60), w: Math.max(1, Math.round(u.w)), h: Math.max(1, Math.round(u.h)), layers}]).slice(-80); persist(); dzLeftRender(); toast('Componente salvo na Biblioteca.'); });
}
function dztInsertComp(id, at) {
  const p = dzP(), c = (p.design.lib || []).find(x => x.id === id), sl = dzSlide(); if (!c || !sl) return; const f = dzSet().format, k = Math.min(1, f.w * 0.9 / c.w, f.h * 0.9 / c.h), cx = at ? at.x : f.w / 2, cy = at ? at.y : f.h / 2, gm = {};
  const ls = JSON.parse(JSON.stringify(c.layers)).map(l => { l.id = lid(); if (l.group) { gm[l.group] = gm[l.group] || uid('G'); l.group = gm[l.group]; } l.x = Math.round(cx - c.w * k / 2 + l.x * k); l.y = Math.round(cy - c.h * k / 2 + l.y * k); l.w = Math.round(l.w * k); if (l.type === 'text') l.size = Math.max(8, Math.round(l.size * k * 10) / 10); else if (l.h) l.h = Math.round(l.h * k); return l; });
  sl.layers.push(...ls); dztSetSel(ls.map(l => l.id)); dztDone();
}
function dztDelComp(id) { const p = dzP(); p.design.lib = (p.design.lib || []).filter(c => c.id !== id); persist(); dzLeftRender(); }

/* --- Assets --- */
function dztPaneAs() {
  const fonts = (() => { try { return [...new Set([...brandFontNames(dzP()), ...(dzSet().tk ? [dzSet().tk.head.family, dzSet().tk.body.family] : [])])]; } catch (e) { return []; } })(), more = ['Inter', 'Poppins', 'Montserrat', 'Playfair Display', 'Anton', 'Oswald', 'Lora', 'Bebas Neue'].filter(f => f in FONT_META && !fonts.includes(f));
  return `<h5>Imagens do Studio</h5><div class="dzt-links"><button class="dzt-btn" onclick="dzAddImage()">＋ Subir imagem</button><button class="dzt-btn" onclick="go('biblioteca')">📚 Biblioteca</button></div><div class="dzt-imgs" id="dztImgs"></div>
  <h5 id="dztIcons">Ícones</h5><div class="dzt-grid4">${Object.entries(DZT_ICONS).map(([k, v]) => `<button class="dzt-tile s" draggable="true" ondragstart="dztDragStart(event,'icon:${k}')" ondragend="DZT.dragKind=''" onclick="dztInsert('icon:${k}')" title="${v[0]}"><svg viewBox="0 0 100 100" width="28" height="28" ${v[3] ? 'fill="none" stroke="currentColor" stroke-width="8"' : 'fill="currentColor"'} ${v[2] ? 'fill-rule="evenodd"' : ''}><path d="${v[1]}"/></svg></button>`).join('')}</div>
  <h5>Fontes</h5><div class="dzt-fonts">${[...fonts, ...more].slice(0, 16).map(f => `<button style="font-family:'${esc(f)}',system-ui" onclick="dztApplyFont('${esc(f)}')">${esc(f)}</button>`).join('')}</div><button class="dzt-btn" onclick="fbOpen(f => dztApplyFont(f), (dzLayer() || {}).family)">Aa Ver todas as fontes</button><p class="dzt-tip">Clique numa fonte para aplicar no texto selecionado.</p>`;
}
function dztApplyFont(f) { const ls = dztLayers().filter(l => l.type === 'text'); if (!ls.length) { toast('Selecione um texto na arte.'); return; } ensureFont(f).then(() => { ls.forEach(l => { l.family = f; }); dztDone(); }); }
function dztAsPaint() {
  const el = $('dztImgs'); if (!el) return; let list = []; try { list = libList().slice(0, 36); } catch (e) { /* sem biblioteca */ }
  el.innerHTML = list.length ? list.map(i => `<button draggable="true" ondragstart="dztDragStart(event,'lib:${i.imgId}')" ondragend="DZT.dragKind=''" onclick="dztInsertLib('${i.imgId}')" title="${esc(i.name)}"><img data-lib="${i.imgId}" alt=""></button>`).join('') : '<p class="dzt-empty">Nenhuma imagem na biblioteca ainda.</p>';
  try { libFill(el); } catch (e) { /* sem miniaturas */ }
  ensureFonts(['Inter', 'Poppins', 'Montserrat', 'Playfair Display', 'Anton', 'Oswald', 'Lora', 'Bebas Neue']);
}
async function dztInsertLib(imgId, at) {
  const sl = dzSlide(); if (!sl) return; await loadImage(imgId); const bm = IMGS.get(imgId); if (!bm) { toast('Imagem indisponível.'); return; }
  const f = dzSet().format, r = bm.width / bm.height; let w = Math.min(f.w * 0.7, bm.width), h = w / r; if (h > f.h * 0.7) { h = f.h * 0.7; w = h * r; }
  const cx = at ? at.x : f.w / 2, cy = at ? at.y : f.h / 2, L = IM('photo', {x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), w: Math.round(w), h: Math.round(h), imgId, radius: 0}); L.role = 'image'; L.free = true;
  sl.layers.push(L); dztSetSel([L.id]); dztDone();
}

/* --- Referências (só para estudar: não saem na arte exportada) --- */
function dztPaneRef() {
  const s = dzSet(), r = s.refImg;
  return `<p class="dzt-tip" style="margin-top:0">Referências servem só para estudar a estrutura. A imagem de referência aparece <b>por cima da arte, transparente, só aqui na mesa</b>, e nunca sai no PNG, PDF ou PSD.</p>
  ${r ? `<div class="dzt-refon"><b>Referência na mesa</b><label>Opacidade <input type="range" min="5" max="100" value="${Math.round(r.opacity * 100)}" oninput="dztRefOp(this.value)"></label><div class="dzt-links"><button class="dzt-btn" onclick="dztRefToggle()">${r.on === false ? 'Mostrar' : 'Ocultar'}</button><button class="dzt-btn" onclick="dztRefClear()">Remover</button></div></div>` : ''}
  <div class="dzt-links"><button class="dzt-btn" onclick="dztRefUpload()">＋ Enviar imagem de referência</button><button class="dzt-btn" onclick="go('inspiration')">Abrir Inspiração</button></div>
  <h5>Da sua Inspiração</h5><div class="dzt-imgs" id="dztRefs"></div><h5>Paletas</h5><div id="dztPals"></div>`;
}
function dztRefPaint() {
  let items = []; try { items = (inspo().items || []); } catch (e) { /* sem inspiração */ }
  const imgs = items.filter(i => i.imgId).slice(0, 40), pals = items.filter(i => i.kind === 'palette' && (i.colors || []).length).slice(0, 8), el = $('dztRefs');
  if (el) { el.innerHTML = imgs.length ? imgs.map(i => `<button onclick="dztRefUse('${i.imgId}')" title="${esc(i.title)}: usar como referência na mesa"><img data-lib="${i.imgId}" alt=""></button>`).join('') : '<p class="dzt-empty">Nenhuma referência na Inspiração ainda.</p>'; try { libFill(el); } catch (e) { /* sem miniaturas */ } }
  const pe = $('dztPals'); if (pe) pe.innerHTML = pals.length ? pals.map(i => `<div class="dzt-pal"><b>${esc(i.title)}</b><span>${i.colors.map(c => `<button style="background:${esc(c)}" title="${esc(c)}" onclick="dztApplyColor('${esc(c)}')"></button>`).join('')}</span></div>`).join('') : '<p class="dzt-empty">Nenhuma paleta salva.</p>';
}
async function dztRefUse(imgId) { await loadImage(imgId); const s = dzSet(); s.refImg = {imgId, opacity: .4, on: true, name: ''}; persist(); dzLeftRender(); dzDraw(); }
function dztRefUpload() { dzPickFile('image/*', async file => { let bmp; try { bmp = await createImageBitmap(file); } catch (e) { toast('Não consegui ler essa imagem.'); return; } const id = uid('img'); await imgPut(id, file); IMGS.set(id, bmp); const s = dzSet(); s.refImg = {imgId: id, opacity: .4, on: true, name: file.name.slice(0, 80)}; persist(); dzLeftRender(); dzDraw(); toast('Referência na mesa. Ela não sai na arte exportada.'); }); }
function dztRefOp(v) { const s = dzSet(); if (s.refImg) { s.refImg.opacity = Math.max(.05, Math.min(1, +v / 100)); persist(); dzDraw(); } }
function dztRefToggle() { const s = dzSet(); if (s.refImg) { s.refImg.on = s.refImg.on === false; persist(); dzLeftRender(); dzDraw(); } }
function dztRefClear() { const s = dzSet(); delete s.refImg; persist(); dzLeftRender(); dzDraw(); }

/* ---------- ouvir a mesa: ferramentas na arte, arrastar elementos, soltar na arte ---------- */
function dztBind() {
  const st = $('dzStage'), cv = $('dzCanvas'); if (!st || !cv) return;
  st.classList.add('dzt-t-' + DZT.tool);
  st.addEventListener('dragover', e => { if (DZT.dragKind) e.preventDefault(); }); st.addEventListener('drop', dztDropOnStage);
  if (typeof dztBindSel === 'function') dztBindSel(st, cv);
}
