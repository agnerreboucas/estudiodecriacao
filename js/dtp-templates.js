/* ===== Diagramação · estilos de miolo e modelos de página (a estrutura das referências: revistas, livros e jornais) ===== */
const DTP_STYLES = [
  {id: 'classico', n: 'Clássico de livro', head: 'Playfair Display', body: 'Lora', ink: '#2B2B2B', accent: '#8A5A2B', paper: '#FFFFFF', size: 10.5, lead: 15, align: 'justify', drop: 3, caps: 0, cols: 1},
  {id: 'botanico', n: 'Revista botânica (verde e terracota)', head: 'Montserrat', body: 'Libre Baskerville', ink: '#24332D', accent: '#1F3D36', paper: '#FFFFFF', size: 9.5, lead: 14, align: 'left', drop: 0, caps: 1, cols: 2, second: '#C47B4A', sage: '#6F8F68'},
  {id: 'petroleo', n: 'Editorial azul-petróleo', head: 'Playfair Display', body: 'Source Serif 4', ink: '#1A1A1A', accent: '#16A2B3', paper: '#FFFFFF', size: 9.5, lead: 13.5, align: 'justify', drop: 4, caps: 0, cols: 2, second: '#CDE9EE'},
  {id: 'minimal', n: 'Livro minimalista (vermelho e preto)', head: 'Montserrat', body: 'Inter', ink: '#222222', accent: '#E3262D', paper: '#FFFFFF', size: 9.5, lead: 14.5, align: 'left', drop: 0, caps: 1, cols: 1, second: '#EDEDED'},
  {id: 'blocos', n: 'Revista em blocos (vermelho e cinza)', head: 'Archivo Black', body: 'Inter', ink: '#1E1E1E', accent: '#E5402D', paper: '#F7F7F5', size: 8.5, lead: 12, align: 'left', drop: 0, caps: 1, cols: 3, second: '#C9C9C9'},
  {id: 'jornal', n: 'Jornal (colunas estreitas)', head: 'Playfair Display', body: 'Libre Baskerville', ink: '#111111', accent: '#111111', paper: '#FFFFFF', size: 8, lead: 10.5, align: 'justify', drop: 0, caps: 0, cols: 4, second: '#E7E7E7'},
  {id: 'outdoor', n: 'Magazine outdoor (mostarda)', head: 'Bebas Neue', body: 'Source Serif 4', ink: '#1C1C1C', accent: '#E0A31B', paper: '#FFFFFF', size: 9, lead: 13, align: 'left', drop: 3, caps: 1, cols: 2, second: '#F4E3B3'}
];
function dtpApplyStyle(d, id, brand, withCols) {
  const S = DTP_STYLES.find(x => x.id === id) || DTP_STYLES[0], st = d.styles, fs = Math.max(0.7, Math.min(1.8, d.page.w / dtpMM(140))) * 0 + 1, ink = S.ink, ac = S.accent;
  const set = (k, o) => Object.assign(st[k], o); d.paper = S.paper;
  set('body', {font: S.body, size: S.size, lead: S.lead, color: ink, align: S.align, drop: S.drop, indent: S.align === 'justify' ? 12 : 0});
  set('h1', {font: S.head, size: Math.round(S.size * 3), lead: Math.round(S.size * 3.3), color: ac, b: 1, caps: S.caps, after: 16});
  set('h2', {font: S.head, size: Math.round(S.size * 1.8), lead: Math.round(S.size * 2.2), color: ink, b: 1, caps: S.caps, before: 14, after: 6});
  set('h3', {font: S.body, size: S.size, lead: S.lead, color: ac, b: 1, caps: 1});
  set('quote', {font: S.head, size: Math.round(S.size * 1.35), lead: Math.round(S.size * 1.9), color: ac, i: S.head === 'Bebas Neue' ? 0 : 1});
  set('caption', {font: S.body, size: Math.max(6, S.size - 2), lead: Math.max(8, S.lead - 3), color: ink});
  if (st.list) Object.assign(st.list, {font: S.body, size: S.size, lead: S.lead, color: ink});
  d.run.font = S.body; d.run.color = ac; if (withCols !== false) { d.cols = S.cols; d.colw = []; d.gutter = dtpMM(S.cols >= 4 ? 4 : 5.5); }
  d.styleId = S.id; return S;
}
const dtpStyleOf = d => DTP_STYLES.find(x => x.id === d.styleId) || DTP_STYLES[0];

/* ---------- modelos de página: quadros prontos em cima da grade do documento ---------- */
const dtpFr = o => Object.assign({id: uid('fr'), k: 'rect', x: 0, y: 0, w: 50, h: 50, wrap: 'none', off: 8, imgId: '', fill: '', stroke: '', sw: 1, op: 1, zoom: 1, px: 0, py: 0, text: '', st: 'body', pad: 4, ar: 0}, o);
const dtpBlock = g => dtpFr({k: 'rect', x: g.x0, y: g.y0, w: g.x1 - g.x0, h: g.y1 - g.y0, op: 0, wrap: 'jump', off: 0, fill: '#FFFFFF'});
const dtpTx = (g, o) => dtpFr(Object.assign({k: 'text', wrap: 'none'}, o));
const dtpImg = o => dtpFr(Object.assign({k: 'img', wrap: 'jump', off: 10}, o));
const DTP_TEMPLATES = [
  {id: 'abertura', n: 'Abertura de capítulo (número grande + foto)', build(d, g, S) { const mid = g.x0 + (g.x1 - g.x0) * 0.46; return [dtpBlock(g), dtpImg({x: mid, y: -d.bleed, w: g.W - mid + d.bleed, h: g.H + 2 * d.bleed, wrap: 'none'}), dtpTx(g, {x: g.x0, y: g.y0 + 30, w: mid - g.x0 - 20, h: 110, text: '01', st: 'h1', ov: {size: 96, lead: 100, color: S.accent}, pad: 0}), dtpTx(g, {x: g.x0, y: g.y0 + 150, w: mid - g.x0 - 20, h: 150, text: 'Título do capítulo', st: 'h1', ov: {size: 22, lead: 26, color: S.ink}, pad: 0}), dtpTx(g, {x: g.x0, y: g.y0 + 310, w: mid - g.x0 - 20, h: 90, text: 'Uma frase curta que abre o capítulo e diz o que o leitor vai encontrar.', st: 'body', ov: {italic: 1, i: 1, align: 'left', indent: 0}, pad: 0})]; }},
  {id: 'foto-texto', n: 'Foto grande no topo + texto em colunas', build(d, g) { const h = (g.y1 - g.y0) * 0.5; return [dtpImg({x: g.x0, y: g.y0, w: g.x1 - g.x0, h}), dtpTx(g, {x: g.x0, y: g.y0 + h + 4, w: g.x1 - g.x0, h: 26, text: 'Legenda da foto, com crédito.', st: 'caption', pad: 0})]; }},
  {id: 'barra', n: 'Texto com barra lateral colorida', build(d, g, S) { const bw = (g.x1 - g.x0) * 0.3, x = g.x1 - bw; return [dtpFr({k: 'rect', x, y: g.y0, w: bw + (g.W - g.x1), h: g.y1 - g.y0, fill: S.second || S.accent, op: 0.35, wrap: 'around', off: 14}), dtpTx(g, {x: x + 10, y: g.y0 + 16, w: bw - 14, h: 120, text: 'Nota lateral', st: 'h3', pad: 0}), dtpTx(g, {x: x + 10, y: g.y0 + 46, w: bw - 14, h: 200, text: 'Use este espaço para um conceito, uma dica rápida ou um dado de apoio.', st: 'caption', pad: 0})]; }},
  {id: 'citacao', n: 'Citação em destaque (página de cor)', build(d, g, S) { return [dtpFr({k: 'rect', x: -d.bleed, y: -d.bleed, w: g.W + 2 * d.bleed, h: g.H + 2 * d.bleed, fill: S.accent, wrap: 'jump', off: 0}), dtpTx(g, {x: g.x0 + 10, y: g.H * 0.3, w: g.x1 - g.x0 - 20, h: g.H * 0.34, text: '“Uma frase marcante do livro, em letras grandes.”', st: 'quote', ov: {size: 26, lead: 32, color: '#FFFFFF', i: 1, align: 'left'}, pad: 0}), dtpTx(g, {x: g.x0 + 10, y: g.H * 0.66, w: g.x1 - g.x0 - 20, h: 30, text: 'Nome do autor ou da fonte', st: 'caption', ov: {color: '#FFFFFF'}, pad: 0})]; }},
  {id: 'duas-fotos', n: 'Duas fotos lado a lado + legendas', build(d, g) { const w = (g.x1 - g.x0 - 12) / 2, h = (g.y1 - g.y0) * 0.38; return [dtpImg({x: g.x0, y: g.y0, w, h}), dtpImg({x: g.x0 + w + 12, y: g.y0, w, h}), dtpTx(g, {x: g.x0, y: g.y0 + h + 3, w, h: 26, text: 'Legenda 1', st: 'caption', pad: 0}), dtpTx(g, {x: g.x0 + w + 12, y: g.y0 + h + 3, w, h: 26, text: 'Legenda 2', st: 'caption', pad: 0})]; }},
  {id: 'imagem-total', n: 'Imagem de página inteira (sangrada)', build(d, g) { return [dtpImg({x: -d.bleed, y: -d.bleed, w: g.W + 2 * d.bleed, h: g.H + 2 * d.bleed, wrap: 'jump', off: 0}), dtpTx(g, {x: g.x0, y: g.y1 - 30, w: g.x1 - g.x0, h: 26, text: 'Legenda ou crédito da imagem', st: 'caption', ov: {color: '#FFFFFF'}, pad: 0})]; }},
  {id: 'faixa', n: 'Faixa de cor com título', build(d, g, S) { const h = g.H * 0.24; return [dtpFr({k: 'rect', x: -d.bleed, y: -d.bleed, w: g.W + 2 * d.bleed, h: h + d.bleed, fill: S.accent, wrap: 'jump', off: 10}), dtpTx(g, {x: g.x0, y: h * 0.28, w: g.x1 - g.x0, h: h * 0.6, text: 'Título da seção', st: 'h1', ov: {color: '#FFFFFF', size: 28, lead: 32}, pad: 0})]; }},
  {id: 'grade4', n: 'Grade de 4 imagens + legendas', build(d, g) { const w = (g.x1 - g.x0 - 12) / 2, h = (g.y1 - g.y0 - 70) / 2, o = []; for (let i = 0; i < 4; i++) { const x = g.x0 + (i % 2) * (w + 12), y = g.y0 + Math.floor(i / 2) * (h + 36); o.push(dtpImg({x, y, w, h}), dtpTx(g, {x, y: y + h + 3, w, h: 22, text: 'Legenda ' + (i + 1), st: 'caption', pad: 0})); } return o; }},
  {id: 'rosto', n: 'Folha de rosto', build(d, g, S) { const W = g.x1 - g.x0; return [dtpBlock(g), dtpTx(g, {x: g.x0, y: g.H * 0.28, w: W, h: 120, text: d.name.replace(/^Miolo · /, ''), st: 'h1', ov: {align: 'center', size: 30, lead: 34, color: S.ink}, pad: 0}), dtpFr({k: 'rect', x: g.x0 + W / 2 - 24, y: g.H * 0.28 + 128, w: 48, h: 3, fill: S.accent}), dtpTx(g, {x: g.x0, y: g.H * 0.28 + 146, w: W, h: 60, text: 'Subtítulo do livro', st: 'body', ov: {align: 'center', i: 1, indent: 0}, pad: 0}), dtpTx(g, {x: g.x0, y: g.y1 - 60, w: W, h: 40, text: 'Nome do autor', st: 'h3', ov: {align: 'center', color: S.ink}, pad: 0})]; }},
  {id: 'creditos', n: 'Créditos e direitos autorais', build(d, g) { return [dtpBlock(g), dtpTx(g, {x: g.x0, y: g.y1 - 190, w: Math.min(g.x1 - g.x0, 260), h: 190, text: 'Título do livro\nTexto © Autor, ano\nTodos os direitos reservados.\nRevisão: nome\nProjeto gráfico: nome\nISBN: [CONFIRMAR]', st: 'caption', pad: 0})]; }},
  {id: 'sumario', n: 'Sumário', build(d, g, S) { return [dtpBlock(g), dtpTx(g, {x: g.x0, y: g.y0 + 10, w: g.x1 - g.x0, h: 50, text: 'Sumário', st: 'h1', ov: {size: 26, lead: 30, color: S.ink}, pad: 0}), dtpTx(g, {x: g.x0, y: g.y0 + 70, w: g.x1 - g.x0, h: g.y1 - g.y0 - 80, text: '01   Capítulo um\n02   Capítulo dois\n03   Capítulo três\n04   Capítulo quatro\n05   Capítulo cinco', st: 'list', ov: {lead: 26, size: 12}, pad: 0})]; }},
  {id: 'branca', n: 'Página em branco (sem quadros)', build() { return []; }}
];
function dtpTplItems(d, id, pi) { const T = DTP_TEMPLATES.find(x => x.id === id); if (!T) return []; const g = dtpGeom(d, pi), S = Object.assign({}, dtpStyleOf(d), {accent: d.styles.h1.color || dtpStyleOf(d).accent, ink: d.styles.body.color}); return T.build(d, g, S); }
function dtpTplApply(id, mode) {
  const d = dtpDoc(); if (!d) return; const T = DTP_TEMPLATES.find(x => x.id === id); if (!T) return;
  if (mode === 'insert') { const at = dui.pi + 1; while (d.pages.length < at) d.pages.push({items: []}); d.pages.splice(at, 0, {items: []}); d.nPages = Math.max(d.nPages, d.pages.length); dui.pi = at; }
  const items = dtpTplItems(d, id, dui.pi); d.pages[dui.pi] = d.pages[dui.pi] || {items: []}; d.pages[dui.pi].items = items; dui.sel = null; dtpTouch(true); dtpSnap(); dtpFit(); dtpThumbs(); dtpPanel(); toast(mode === 'insert' ? 'Página inserida: ' + T.n : 'Modelo aplicado à página ' + (dui.pi + 1) + '. Arraste os quadros, troque as imagens e edite os textos.');
}
function dtpStyleApply(id) { const d = dtpDoc(), S = DTP_STYLES.find(x => x.id === id); if (!S) return; const cols = $('dtpStCols') ? $('dtpStCols').checked : true; dtpApplyStyle(d, id, null, cols); dtpTouch(true); dtpSnap(); dtpRefresh(true); toast('Estilo do miolo aplicado: ' + S.n); }
function dtpModelosHTML(d) {
  setTimeout(dtpModelosPaint, 40);
  return `<div class="okr-label">ESTILO DO MIOLO</div><small class="muted block">Fontes, cores, tamanhos de texto e colunas de uma vez, baseados nas referências de revistas e livros.</small><label class="dtp-chk" style="margin:6px 0"><input type="checkbox" id="dtpStCols" checked> Aplicar também o número de colunas</label>
  <div class="dtp-sty">${DTP_STYLES.map(s => `<button class="dtp-sty-b ${d.styleId === s.id ? 'on' : ''}" onclick="dtpStyleApply('${s.id}')"><span style="background:${s.paper};border-color:${s.accent}"><i style="background:${s.accent}"></i><i style="background:${s.second || s.ink}"></i></span><b style="font-family:'${esc(s.head)}'">${esc(s.n)}</b><small>${esc(s.head)} + ${esc(s.body)} · ${s.cols} col.</small></button>`).join('')}</div>
  <div class="okr-label" style="margin-top:12px">MODELOS DE PÁGINA</div><small class="muted block">Quadros prontos sobre a grade. <b>Aplicar</b> troca os quadros da página atual; <b>＋ Inserir</b> cria uma página nova depois dela. O texto corrido desvia dos quadros sozinho.</small>
  <div class="dtp-tpl">${DTP_TEMPLATES.map(t => `<div class="dtp-tpl-c"><canvas data-tpl="${t.id}" width="96" height="${Math.round(96 * d.page.h / d.page.w)}"></canvas><b>${esc(t.n)}</b><div class="row-gap"><button class="btn sm" onclick="dtpTplApply('${t.id}')">Aplicar</button><button class="btn sm" onclick="dtpTplApply('${t.id}','insert')">＋ Inserir</button></div></div>`).join('')}</div>`;
}
async function dtpModelosPaint() {
  const d = dtpDoc(); if (!d) return; const cvs = [...document.querySelectorAll('canvas[data-tpl]')]; if (!cvs.length) return; await dtpFonts(d);
  for (const cv of cvs) { if (!cv.isConnected) return; const tmp = JSON.parse(JSON.stringify(d)); tmp.story = []; tmp.front = 0; tmp.autoflow = false; tmp.nPages = 1; tmp.facing = false; tmp.pages = [{items: dtpTplItems(tmp, cv.dataset.tpl, 0)}, {items: []}]; tmp.run.folio = false; tmp.run.header = ''; tmp.run.headerR = '';
    try { const f = dtpFlow(tmp), x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, cv.width, cv.height); x.save(); x.beginPath(); x.rect(0, 0, cv.width, cv.height); x.clip(); dtpDrawPage(x, tmp, f, 0, cv.width / d.page.w, {imgs: dui.imgs}); x.restore(); } catch (e) { console.warn('tpl', e); } await new Promise(r => setTimeout(r, 0)); }
}
