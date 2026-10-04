/* ===== Editor de Grid (split): uma imagem grande cortada em pedaços que viram a capa de cada carrossel (grid 3 colunas) ou os fundos dos slides de um carrossel panorâmico.
   A imagem pode vir pronta (Biblioteca / envio) ou ser criada no Editor de Design com as linhas de corte já desenhadas.
   No grid do perfil o Instagram mostra o centro 3:4 de cada capa 4:5; por isso cada pedaço é cortado em 3:4 e a capa leva 3,3% a mais de cada lado (a imagem continua nas pontas). ===== */
const gridUI = {id: '', from: false, busy: false};
const gridCur = () => { const p = curProject(); return p && p.grids.find(g => g.id === gridUI.id); };
const gridSave = () => persist();
const GRID_CELL = g => g.mode === 'pan' ? [1080, 1350] : [720, 960];
const GRID_PAD = g => g.mode === 'pan' ? 0 : Math.round(720 * (33.75 / 1012.5));   // continuação lateral da capa 4:5 (px do trabalho)

function gridNewModal() {
  showModal('Novo grid (split)', `<div class="field"><label>Nome</label><input id="gdName" placeholder="Ex.: Propostas da campanha" autofocus></div>
  <div class="okr-label">TIPO</div><div class="lp-types"><label class="lp-type"><input type="radio" name="gdM" value="grid" checked><b>Grid de carrosséis</b><small class="muted">A imagem cobre o perfil (3 colunas). Cada pedaço é a capa de um carrossel diferente.</small></label><label class="lp-type"><input type="radio" name="gdM" value="pan"><b>Carrossel panorâmico</b><small class="muted">Uma imagem larga que passa de um slide para o outro, em um só carrossel.</small></label></div>
  <div id="gdModels"><div class="okr-label">MODELO DO GRID</div><div class="lp-types">${Object.entries(GRID_MODELS).map(([k, v], i) => `<label class="lp-type"><input type="radio" name="gdMod" value="${k}" ${i === 0 ? 'checked' : ''}><b>${v[0]}</b><small class="muted">${v[1]}</small></label>`).join('')}</div></div>
  <div class="ins-row"><label class="ins">Linhas (grid)<select id="gdR">${[1, 2, 3, 4, 5, 6].map(x => `<option value="${x}" ${x === 3 ? 'selected' : ''}>${x} (${x * 3} posts)</option>`).join('')}</select></label><label class="ins">Slides (panorâmico)<select id="gdC">${[3, 4, 5, 6].map(x => `<option value="${x}" ${x === 4 ? 'selected' : ''}>${x}</option>`).join('')}</select></label></div>
  <div class="okr-label">IMAGEM</div><div class="row-gap" style="flex-wrap:wrap"><label class="ins inl"><input type="radio" name="gdS" value="img" checked> já tenho a imagem pronta (Biblioteca ou envio)</label><label class="ins inl"><input type="radio" name="gdS" value="set"> criar a arte no Editor de Design, com as linhas de corte</label></div>
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="gridCreate()">Criar grid</button></div>`);
}
function gridCreate() {
  const p = curProject(), mode = (document.querySelector('input[name=gdM]:checked') || {}).value || 'grid', how = (document.querySelector('input[name=gdS]:checked') || {}).value || 'img';
  const model = (document.querySelector('input[name=gdMod]:checked') || {}).value || 'continuo', g = normalizeGrids([{id: '', model, name: ($('gdName').value || '').trim() || 'Grid', mode, cols: mode === 'pan' ? +$('gdC').value : 3, rows: mode === 'pan' ? 1 : +$('gdR').value}])[0]; p.grids.unshift(g); gridUI.id = g.id; persist(); closeModal();
  if (g.model === 'faixa') { g.src = {t: '', id: ''}; g.band = g.name.toUpperCase(); g.cells.forEach(c => { c.clean = true; }); gridSave(); feedUI.mode = 'grid'; go('feed'); return; }
  if (how === 'set') return gridCreateArt(); feedUI.mode = 'grid'; go('feed');
}
/* cria a arte no Editor de Design já com a tela do tamanho do grid e as linhas de corte (camadas “guia”, que não saem no corte) */
async function gridCreateArt() {
  const g = gridCur(), p = curProject(), cell = GRID_CELL(g), W = g.cols * cell[0], H = g.rows * cell[1], tk = JSON.parse(JSON.stringify(lyTokens(p, g.style || lyStyles(p)[0].id)));
  const layers = [IM('photo', {x: 0, y: 0, w: W, h: H, brief: 'Imagem inteira do grid (uma foto ou arte; ela será cortada em ' + g.cells.length + ' pedaços)'})]; themeLayer(layers[0], tk);
  const gl = (o) => { const L = RC('guide', Object.assign({fill: 'rgba(255,255,255,0.9)', stroke: 'rgba(228,87,46,0.9)', strokeW: 2}, o)); return L; };
  for (let c = 1; c < g.cols; c++) layers.push(gl({x: c * cell[0] - 2, y: 0, w: 4, h: H}));
  for (let r = 1; r < g.rows; r++) layers.push(gl({x: 0, y: r * cell[1] - 2, w: W, h: 4}));
  g.cells.forEach((cl, i) => { const t = T('guide', {content: String(i + 1), x: (i % g.cols) * cell[0] + 14, y: Math.floor(i / g.cols) * cell[1] + 10, w: 160, size: 54, weight: 800, color: '#ffffff', opacity: 0.9}); layers.push(t); });
  const set = {id: uid('ds'), name: 'Arte do grid · ' + g.name, format: {id: 'custom', w: W, h: H}, tk, slides: [{id: sid(), bg: '#e9e9ee', layers}], grid: {id: g.id}, created: new Date().toISOString(), updated: new Date().toISOString()};
  p.design.sets.push(set); g.src = {t: 'set', id: set.id}; gridSave(); gridUI.from = true; go('design'); dzOpen(set.id); toast('Arte criada com as linhas de corte (camadas “guia”; elas não saem no corte). Use “← Grid” para cortar.');
}
function gridBack() { gridUI.from = false; feedUI.from = false; feedUI.mode = 'grid'; go('feed'); }

/* ---------- imagem de trabalho e pedaços ---------- */
const GRID_MODELS = {
  continuo: ['Imagem contínua', 'Uma imagem inteira atravessa os posts.'],
  laterais: ['Laterais em cor', 'Cores sólidas nas pontas e a foto na coluna do meio (uma cor por linha).'],
  espelho: ['Espelho (simetria)', 'A imagem se espelha nos quatro lados, como um caleidoscópio.'],
  puzzle: ['Quebra-cabeça com margem', 'A imagem é cortada em quadros com margem arredondada e a marca embaixo.'],
  faixa: ['Faixa tipográfica', 'Uma palavra grande corre pelas colunas, uma linha de texto por linha do perfil.']
};
const gridHasSrc = g => g.model === 'faixa' || !!(g.src.t && g.src.id);
/* a imagem de origem (Biblioteca ou arte do Editor de Design) como bitmap/canvas, ou null */
async function gridBitmap(g, p) {
  if (g.src.t === 'img' && g.src.id) { const b = await imgGet(g.src.id); return b ? await createImageBitmap(b) : null; }
  if (g.src.t === 'set') { const st = p.design.sets.find(y => y.id === g.src.id); if (!st) return null; await ensureFonts(lyFamilies(st.tk)); await ensureSetResources(st); const sl = {bg: st.slides[0].bg, layers: st.slides[0].layers.filter(L => L.role !== 'guide')}, t = document.createElement('canvas'); t.width = st.format.w; t.height = st.format.h; renderSlide(t.getContext('2d'), sl, st.format.w, st.format.h, 1); return t; }
  return null;
}
function gridCover(x, bm, rx, ry, rw, rh, z, fx, fy, flipX, flipY) {
  const s = Math.max(rw / bm.width, rh / bm.height) * (z || 1), dw = bm.width * s, dh = bm.height * s; x.save(); x.beginPath(); x.rect(rx, ry, rw, rh); x.clip();
  x.translate(flipX ? rx + rw : rx, flipY ? ry + rh : ry); x.scale(flipX ? -1 : 1, flipY ? -1 : 1); x.drawImage(bm, (rw - dw) * fx, (rh - dh) * fy, dw, dh); x.restore();
}
function gridColors(g, p) {
  const tk = lyTokens(p, g.style || lyStyles(p)[0].id), auto = [tk.accent, tk.second || mixHex(tk.accent, '#ffffff', 0.5), mixHex(tk.accent, tk.fg, 0.55), mixHex(tk.accent, '#ffffff', 0.75), tk.fg, tk.bg];
  return Array.from({length: 6}, (_, i) => g.colors[i] || auto[i]);
}
async function gridInner(g, p, W, H) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'), cell = GRID_CELL(g), cw = cell[0], ch = cell[1], F = g.fit; x.fillStyle = '#e9e9ee'; x.fillRect(0, 0, W, H);
  const bm = g.model === 'faixa' ? null : await gridBitmap(g, p);
  if (g.model === 'faixa') {
    const tk = lyTokens(p, g.style || lyStyles(p)[0].id), dark = g.dark, bg = dark ? '#111214' : '#ffffff', fg = dark ? '#ffffff' : '#111111', lines = String(g.band || 'PALAVRA').split('\n').filter(Boolean); await ensureFonts([tk.head.family]); x.fillStyle = bg; x.fillRect(0, 0, W, H); x.fillStyle = fg; x.textBaseline = 'middle'; x.textAlign = 'center';
    for (let r = 0; r < g.rows; r++) { const t = (lines[r % lines.length] || '').toUpperCase(); if (!t) continue; let sz = ch * 0.5; x.font = `700 ${sz}px '${tk.head.family}', sans-serif`; const wd = x.measureText(t).width; sz = Math.min(sz * (W * 0.92) / Math.max(1, wd), ch * 0.62); x.font = `700 ${sz}px '${tk.head.family}', sans-serif`; x.fillText(t, W / 2, r * ch + ch / 2); }
    return c;
  }
  if (!bm) return c;
  if (g.model === 'laterais') {
    const cols = gridColors(g, p); for (let r = 0; r < g.rows; r++) { x.fillStyle = cols[r % cols.length]; x.fillRect(0, r * ch, W, ch); }
    gridCover(x, bm, cw, 0, cw, H, F.z, F.fx, F.fy); return c;
  }
  if (g.model === 'espelho') {
    const hw = Math.ceil(W / 2), hh = Math.ceil(H / 2); gridCover(x, bm, 0, 0, hw, hh, F.z, F.fx, F.fy); const t = document.createElement('canvas'); t.width = hw; t.height = hh; t.getContext('2d').drawImage(c, 0, 0, hw, hh, 0, 0, hw, hh);
    x.save(); x.translate(W, 0); x.scale(-1, 1); x.drawImage(t, 0, 0); x.restore(); x.save(); x.translate(0, H); x.scale(1, -1); x.drawImage(c, 0, 0, W, hh, 0, 0, W, hh); x.restore(); return c;
  }
  gridCover(x, bm, 0, 0, W, H, F.z, F.fx, F.fy); return c;
}
async function gridSource(g, p) {
  const cell = GRID_CELL(g), W = g.cols * cell[0], H = g.rows * cell[1], pad = GRID_PAD(g), iw = W + 2 * pad, c = document.createElement('canvas'); c.width = iw; c.height = H; const x = c.getContext('2d'), inner = await gridInner(g, p, W, H);
  x.drawImage(inner, pad, 0); if (pad) { x.drawImage(inner, 0, 0, 1, H, 0, 0, pad, H); x.drawImage(inner, W - 1, 0, 1, H, pad + W, 0, pad, H); } return c;
}
function gridPieceCanvas(src, g, i, out) {
  const cell = GRID_CELL(g), pad = GRID_PAD(g), c = i % g.cols, r = Math.floor(i / g.cols), o = document.createElement('canvas'); o.width = out ? out[0] : 1080; o.height = out ? out[1] : 1350; const x = o.getContext('2d');
  x.drawImage(src, c * cell[0], r * cell[1], cell[0] + 2 * pad, cell[1], 0, 0, o.width, o.height);
  if (g.model === 'puzzle' && g.mode === 'grid') {   // margem arredondada em volta do pedaço + marca embaixo
    const w = o.width, h = o.height, m = Math.round(w * 0.062), rad = Math.round(w * 0.04), bg = g.dark ? '#111214' : '#f1f1f3', mx = (w - 1012.5 * w / 1080) / 2 + m * 0.4;
    x.save(); x.fillStyle = bg; x.beginPath(); x.rect(0, 0, w, h); x.roundRect ? x.roundRect(m, m, w - 2 * m, h - 2 * m - m * 1.5, rad) : x.rect(m, m, w - 2 * m, h - 2 * m - m * 1.5); x.fill('evenodd');
    x.fillStyle = g.dark ? '#ffffff' : '#111111'; x.font = `700 ${Math.round(w * 0.026)}px system-ui, sans-serif`; x.textBaseline = 'middle'; x.fillText((g.tag || p0name()) , m + 4, h - m * 0.95); x.restore();
  }
  return o;
}
const p0name = () => { const p = curProject(); return ((p && p.name) || 'MARCA').toUpperCase().slice(0, 18) + '®'; };
const gridBlob = (cv, q) => new Promise(r => cv.toBlob(r, 'image/jpeg', q || 0.92));

/* ---------- tela ---------- */
function renderGridEditor(r, p) {
  const g = gridCur(); if (!g) { feedUI.mode = ''; return renderFeed(); }
  const has = gridHasSrc(g), done = g.cells.filter(c => c.carId && p.carousels.some(x => x.id === c.carId)).length;
  r.innerHTML = `<div class="page-head"><div><h1>Editor de grid</h1><p>${esc(g.mode === 'pan' ? 'Uma imagem larga cortada em slides de um carrossel (3 a 6).' : 'Uma imagem cortada em ' + g.cells.length + ' pedaços: cada um vira a capa de um carrossel.')} ${esc(p.name)}.</p></div><div class="actions">${projectSelect()}<button class="btn" onclick="feedUI.mode='';gridUI.id='';renderFeed()">← Planejador de feed</button></div></div>
  <div class="fd-wrap" style="grid-template-columns:330px minmax(0,1fr) 330px"><div class="fd-left">
    <div class="panel"><div class="field"><label>Grid</label><select onchange="gridUI.id=this.value;renderFeed()">${p.grids.map(x => `<option value="${x.id}" ${x.id === g.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div><div class="field"><label>Nome</label><input value="${esc(g.name)}" oninput="gridCur().name=this.value;gridSave()"></div>
      ${g.mode === 'grid' ? gridModelPanel(g, p) : ''}${g.model === 'faixa' ? '' : `<div class="field"><label>Imagem</label><div class="row-gap" style="flex-wrap:wrap"><button class="btn sm" onclick="gridPickImg()">📚 Biblioteca / enviar</button><button class="btn sm" onclick="${g.src.t === 'set' ? 'gridOpenArt()' : 'gridCreateArt()'}">${g.src.t === 'set' ? '✎ Abrir a arte no editor' : '＋ Criar a arte no editor'}</button></div><small class="muted block">${g.src.t === 'img' ? 'Imagem pronta.' : g.src.t === 'set' ? 'Arte criada no Editor de Design (as linhas “guia” não saem no corte).' : 'Escolha ou crie a imagem.'}</small></div>`}
      ${g.src.t === 'img' && g.model !== 'faixa' ? `<div class="field"><label>Zoom da imagem <small class="muted">${Math.round(g.fit.z * 100)}%</small></label><input type="range" min="100" max="300" value="${Math.round(g.fit.z * 100)}" oninput="gridFit('z',this.value/100)"></div><div class="ins-row"><label class="ins">Posição X<input type="range" min="0" max="100" value="${Math.round(g.fit.fx * 100)}" oninput="gridFit('fx',this.value/100)"></label><label class="ins">Posição Y<input type="range" min="0" max="100" value="${Math.round(g.fit.fy * 100)}" oninput="gridFit('fy',this.value/100)"></label></div>` : ''}
      <label class="ins inl"><input type="checkbox" ${g.lines ? 'checked' : ''} onchange="gridCur().lines=this.checked;gridSave();gridPaint()"> mostrar linhas de corte</label></div>
    <div class="panel"><div class="okr-label">${g.mode === 'pan' ? 'SLIDES' : 'CARROSSÉIS (um por pedaço)'}</div>${g.mode === 'grid' ? `<div class="field"><label>Slides em cada carrossel <small class="muted">(capa + miolo + fechamento)</small></label><div class="row-gap" style="flex-wrap:wrap">${[3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map(k => `<button class="btn sm ${k === g.slides ? 'dark' : ''}" onclick="gridSlides(${k})">${k}</button>`).join('')}</div><small class="muted block">Defina pela copy da linha editorial; cada carrossel ainda pode ter o seu número no estúdio.</small></div>` : ''}<small class="muted block" style="margin-bottom:6px">Título do assunto de cada pedaço. “Sem título” deixa a capa só com a imagem.</small>${g.cells.map((c, i) => `<div class="gd-cell"><b>${i + 1}</b><input value="${esc(c.label)}" placeholder="${g.mode === 'pan' ? 'Slide ' + (i + 1) : 'Assunto do carrossel ' + (i + 1)}" oninput="gridCell(${i},'label',this.value)"><label title="Capa só com a imagem"><input type="checkbox" ${c.clean ? 'checked' : ''} onchange="gridCell(${i},'clean',this.checked)"> sem título</label>${c.carId ? '<span class="fd-ok" style="position:static;display:inline-block">✓</span>' : ''}</div>`).join('')}</div></div>
  <div class="fd-center" style="flex-direction:column;align-items:center;gap:8px"><canvas id="gdMain" class="cs-main" style="max-width:100%"></canvas><small class="muted">Imagem inteira com as linhas de corte. ${g.mode === 'grid' ? 'A capa 4:5 leva um pouco mais de cada lado do pedaço, para a imagem continuar nas pontas.' : ''}</small></div>
  <div class="fd-right"><div class="panel"><div class="okr-label">COMO FICA NO PERFIL</div><canvas id="gdProf" style="width:100%;border-radius:8px;background:#fff"></canvas><small class="muted block">Cada célula mostra o centro 3:4 da capa, como o Instagram.</small></div>
    <div class="panel"><div class="okr-label">CRIAR</div><b>${done} de ${g.cells.length}</b> com carrossel<div class="fd-bar"><i style="width:${Math.round(done / g.cells.length * 100)}%"></i></div>
      <div class="row-gap" style="flex-wrap:wrap;margin-top:8px"><button class="btn dark" onclick="gridGenerate()" ${has && !gridUI.busy ? '' : 'disabled'}>${gridUI.busy ? 'Cortando…' : done ? '↻ Atualizar capas' : (g.mode === 'pan' ? '✂ Cortar e criar o carrossel' : '✂ Cortar e criar os carrosséis')}</button>${g.feedId ? '<button class="btn" onclick="gridToFeed()">Abrir no planejador de feed</button>' : ''}</div>
      <small class="muted block" style="margin-top:6px">${g.mode === 'pan' ? 'Cria um carrossel com a imagem passando pelos slides.' : 'Cria um carrossel por pedaço (a capa é o pedaço), um feed no planejador com o grid montado e mantém os carrosséis já criados: “Atualizar capas” só troca a imagem das capas.'} Depois, cada carrossel abre no estúdio para escrever os slides (pesquisa, texto e design).</small></div></div></div>
  <div class="panel" style="margin-top:14px"><div class="section-row"><div><h3>${g.mode === 'pan' ? 'Slides do carrossel panorâmico' : 'Os carrosséis que saem desta imagem'}</h3><p class="muted" style="margin:2px 0 0;font-size:12.5px">${g.mode === 'pan' ? 'A imagem passa de um slide para o outro.' : 'Cada linha é um post do perfil: a capa é o pedaço da imagem, seguida dos slides de pesquisa, texto e design. Clique em um slide para abrir o carrossel.'}</p></div></div><div id="gdStrips"></div></div>`;
  gridPaint(); gridStrips();
}
let gridTok = 0;
async function gridPaint() {
  const g = gridCur(), p = curProject(); if (!g) return; const tok = ++gridTok; if (!$('gdMain')) return;
  const src = await gridSource(g, p); if (tok !== gridTok || !$('gdMain')) return;
  const cell = GRID_CELL(g), pad = GRID_PAD(g), W = g.cols * cell[0], H = g.rows * cell[1], k = Math.min(1, 560 / W, 640 / H), cv = $('gdMain'); cv.width = Math.round(W * k); cv.height = Math.round(H * k); cv.style.width = cv.width + 'px';
  const x = cv.getContext('2d'); x.drawImage(src, pad, 0, W, H, 0, 0, cv.width, cv.height);
  if (g.lines) { x.strokeStyle = 'rgba(255,255,255,0.95)'; x.lineWidth = 2; x.setLineDash([]); for (let c = 1; c < g.cols; c++) { x.beginPath(); x.moveTo(c * cell[0] * k, 0); x.lineTo(c * cell[0] * k, cv.height); x.stroke(); } for (let r = 1; r < g.rows; r++) { x.beginPath(); x.moveTo(0, r * cell[1] * k); x.lineTo(cv.width, r * cell[1] * k); x.stroke(); }
    x.font = '700 15px system-ui'; g.cells.forEach((c, i) => { const px = (i % g.cols) * cell[0] * k + 8, py = Math.floor(i / g.cols) * cell[1] * k + 20; x.fillStyle = 'rgba(0,0,0,0.6)'; x.fillRect(px - 4, py - 15, 22, 20); x.fillStyle = '#fff'; x.fillText(String(i + 1), px, py); }); }
  const pr = $('gdProf'); if (pr) { const tw = 3 * 100 + 2 * 2, th = g.rows * 133 + (g.rows - 1) * 2; if (g.mode === 'pan') { pr.width = g.cols * 100 + (g.cols - 1) * 2; pr.height = 125; } else { pr.width = tw; pr.height = th; } const px = pr.getContext('2d'); px.fillStyle = '#fff'; px.fillRect(0, 0, pr.width, pr.height);
    g.cells.forEach((c, i) => { const cc = i % g.cols, rr = Math.floor(i / g.cols), pc = gridPieceCanvas(src, g, i); if (g.mode === 'pan') px.drawImage(pc, 0, 0, pc.width, pc.height, cc * 102, 0, 100, 125); else px.drawImage(pc, 33.75, 0, 1012.5, 1350, cc * 102, rr * 135, 100, 133); }); }
}
const gridPaintSoon = debounce(() => gridPaint(), 120);
function gridFit(k, v) { gridCur().fit[k] = +v; gridSave(); gridPaintSoon(); }
function gridCell(i, k, v) { const c = gridCur().cells[i]; c[k] = k === 'label' ? String(v).slice(0, 80) : v; gridSave(); }
function gridPickImg() { libPick(r => { const g = gridCur(); g.src = {t: 'img', id: r.id}; gridSave(); renderFeed(); }); }
function gridOpenArt() { feedUI.from = false; const g = gridCur(), st = curProject().design.sets.find(x => x.id === g.src.id); if (!st) { toast('A arte não existe mais.'); return; } gridUI.from = true; go('design'); dzOpen(st.id); }
function gridToFeed() { const g = gridCur(); if (g && g.feedId) { feedUI.id = g.feedId; feedUI.mode = ''; renderFeed(); } }

/* corta e cria/atualiza os carrosséis (ou o carrossel panorâmico) e liga tudo ao planejador de feed */
async function gridGenerate() {
  const g = gridCur(), p = curProject(); if (!g || !gridHasSrc(g) || gridUI.busy) return; gridUI.busy = true; renderFeed();
  try {
    const src = await gridSource(g, p);
    if (g.mode === 'pan') {
      let c = p.carousels.find(x => x.id === (g.cells[0] || {}).carId); if (!c) { c = carNew(g.name, '', 'foto'); c.slides = g.cols; c.texts = Array(carTotal(g.cols)).fill(''); c.idea = g.name; c.grad = 35; g.cells.forEach(cl => { cl.carId = c.id; }); gridScaffold(c, g.name); }
      for (let i = 0; i < g.cols; i++) { const old = g.cells[i].pieceId, id = uid('img'); await imgPut(id, await gridBlob(gridPieceCanvas(src, g, i))); c.media[String(i)] = id; g.cells[i].pieceId = id; if (old) { try { await imgDel(old); } catch (e) { /* ok */ } } }
      if (g.cells[0].label && !c.texts[0]) c.texts[0] = g.cells[0].label; persist(); carUI.id = ''; toast('Carrossel panorâmico criado: a imagem passa pelos slides.');
    } else {
      for (let i = 0; i < g.cells.length; i++) {
        const cl = g.cells[i], old = cl.pieceId, id = uid('img'); await imgPut(id, await gridBlob(gridPieceCanvas(src, g, i))); cl.pieceId = id;
        let c = p.carousels.find(x => x.id === cl.carId); const tpl = cl.clean ? 'foto-limpa' : 'foto';
        if (!c) { c = carNew(cl.label || (g.name + ' · ' + (i + 1)), '', tpl); c.slides = g.slides; c.texts = Array(carTotal(g.slides)).fill(''); c.idea = cl.label; c.grad = cl.clean ? 0 : 35; c.splitCover = true; if (cl.label) c.texts[0] = cl.label; cl.carId = c.id; gridScaffold(c, cl.label); }
        else { c.tpl = tpl; if (c.slides !== g.slides) carResize(c, g.slides); if (cl.label && !c.texts[0]) c.texts[0] = cl.label; }
        c.media['0'] = id; c.splitCover = true; if (old) { try { await imgDel(old); } catch (e) { /* ok */ } }
      }
      let f = p.feeds.find(x => x.id === g.feedId); if (!f) { f = feedNew('Grid · ' + g.name, 'grid', g.rows); g.feedId = f.id; }
      f.rows = g.rows; f.defKind = 'carousel'; f.view = 'pecas'; f.slots = normalizeFeeds([{rows: g.rows, slots: f.slots}])[0].slots; g.cells.forEach((cl, i) => { const s = f.slots[i]; s.kind = 'carousel'; s.tone = 'M'; s.label = cl.label; s.ref = {t: 'car', id: cl.carId}; });
      persist(); toast(`${g.cells.length} capas cortadas e ligadas ao feed. Abra cada carrossel para escrever os slides.`);
    }
    gridSave();
  } catch (e) { toast('Não consegui cortar: ' + e.message); }
  gridUI.busy = false; renderFeed();
}

/* esqueleto de 6 slides (capa, 4 de miolo e fechamento) para o carrossel nascer completo; os textos entre [ ] são para você preencher */
function gridScaffold(c, label) {
  const D = carDims(c); if (c.texts.slice(1).some(t => t.trim() && !/^\[/.test(t))) return; const L = label || 'Assunto', heads = ['Pesquisa', 'Texto', 'Design', 'Dados', 'Exemplo', 'Passo', 'Detalhe', 'Contexto', 'Conclusão'], T = Array(D.total).fill('');
  T[0] = L; T[1] = '[Subtítulo: o que o público vai descobrir]';
  D.groups.forEach((ix, k) => { ix.forEach((pos, j) => { T[pos] = j === 0 ? (k === D.groups.length - 1 ? 'Conclusão' : heads[k % (heads.length - 1)]) : '[Texto + design]'; }); });
  D.ctas.forEach((pr, k) => { T[pr[0]] = D.ctas.length > 1 ? (k === 0 ? '[Chamada: salvar ou seguir]' : '[Chamada: ação]') : '[Chamada final]'; T[pr[1]] = '[Apoio da chamada]'; }); c.texts = T.map(t => t.slice(0, 1200));
}
let gridStripTok = 0;
async function gridStrips() {
  const g = gridCur(), p = curProject(), box = $('gdStrips'); if (!g || !box) return; const tok = ++gridStripTok;
  const rows = g.mode === 'pan' ? [0] : g.cells.map((c, i) => i); box.innerHTML = rows.map(i => `<div class="gd-strip"><div class="gd-sh"><b>${g.mode === 'pan' ? 'Carrossel' : 'Post ' + (i + 1)}</b><span>${esc(g.mode === 'pan' ? g.name : (g.cells[i].label || 'sem assunto'))}</span><button class="btn sm" id="gdOpen${i}" disabled>Abrir carrossel</button></div><div class="gd-fr" id="gdFr${i}"><small class="muted">carregando…</small></div></div>`).join('');
  const has = gridHasSrc(g), src = has ? await gridSource(g, p) : null; if (tok !== gridStripTok) return; const tk = lyTokens(p, g.style || lyStyles(p)[0].id); await ensureFonts(lyFamilies(tk));
  for (const i of rows) {
    if (tok !== gridStripTok || !$('gdFr' + i)) return; const fr = $('gdFr' + i), cl = g.cells[i], c = p.carousels.find(x => x.id === cl.carId), cvs = [];
    const mk = (w, h) => { const cv = document.createElement('canvas'); cv.width = w * 2; cv.height = h * 2; cv.style.width = w + 'px'; cv.style.height = h + 'px'; return cv; };
    if (c) {
      try {
        const {set, labels} = carMake(c, {final: true}); await ensureFonts(lyFamilies(set.tk)); await ensureSetResources(set); const W = set.format.w, H = set.format.h, tw = 108, th = Math.round(tw * H / W);
        set.slides.forEach((s, k) => { const cv = mk(tw, th); renderSlide(cv.getContext('2d'), s, W, H, cv.width / W); cv.className = 'gd-sl'; cv.onclick = () => gridOpenCar(c.id, k); cvs.push([cv, (k === 0 ? 'Capa' : k === set.slides.length - 1 ? 'CTA' : String(k + 1) + ' ' + (labels[k] || ''))]); });
        const b = $('gdOpen' + i); if (b) { b.disabled = false; b.onclick = () => gridOpenCar(c.id, 0); }
      } catch (e) { console.warn('strip', e); }
    } else {
      const tw = 108, th = 144, nn = g.mode === 'pan' ? g.cols : g.slides, ph = Array.from({length: nn}, (_, k) => k === 0 ? 'Capa' : k === nn - 1 ? 'CTA' : (k + 1) + ' · texto + design');
      ph.forEach((n, k) => { const cv = mk(tw, th), x = cv.getContext('2d'); x.scale(2, 2);
        if (k === 0 && src) { const pc = gridPieceCanvas(src, g, i); x.drawImage(pc, 0, 0, pc.width, pc.height, 0, 0, tw, th); }
        else { x.fillStyle = '#f4f4f6'; x.fillRect(0, 0, tw, th); x.strokeStyle = '#c9c9d1'; x.setLineDash([5, 4]); x.strokeRect(1, 1, tw - 2, th - 2); x.fillStyle = '#9a9aa6'; x.font = '600 11px system-ui'; x.textAlign = 'center'; x.fillText(n.replace(/^\d · /, ''), tw / 2, th / 2); }
        cv.className = 'gd-sl'; cvs.push([cv, n]); });
    }
    fr.innerHTML = ''; cvs.forEach(([cv, n]) => { const d = document.createElement('div'); d.className = 'gd-slw'; d.appendChild(cv); const s = document.createElement('small'); s.textContent = n; d.appendChild(s); fr.appendChild(d); });
    await new Promise(r => setTimeout(r, 0));
  }
}
function gridOpenCar(id, frame) { gridUI.from = true; feedUI.from = false; carUI.id = id; carUI.frame = frame || 0; go('carrosseis'); }

function gridSlides(k) { const g = gridCur(); g.slides = carSlidesN(k); gridSave(); const p = curProject(); g.cells.forEach(cl => { const c = p.carousels.find(x => x.id === cl.carId); if (c && c.slides !== g.slides) carResize(c, g.slides); }); persist(); renderFeed(); }

/* modelo do grid e opções de cada modelo */
function gridModelPanel(g, p) {
  const cols = gridColors(g, p);
  return `<div class="field"><label>Modelo</label><div class="row-gap" style="flex-wrap:wrap">${Object.entries(GRID_MODELS).map(([k, v]) => `<button class="btn sm ${g.model === k ? 'dark' : ''}" onclick="gridModel('${k}')" title="${esc(v[1])}">${esc(v[0])}</button>`).join('')}</div><small class="muted block">${esc(GRID_MODELS[g.model][1])}</small></div>
  ${g.model === 'laterais' ? `<div class="field"><label>Cor de cada linha (laterais)</label><div class="row-gap" style="flex-wrap:wrap">${Array.from({length: Math.min(g.rows, 6)}, (_, i) => `<input type="color" value="${cols[i]}" oninput="gridColor(${i},this.value)" title="Linha ${i + 1}">`).join('')}<button class="btn sm" onclick="gridColor(-1)">cores da marca</button></div></div>` : ''}
  ${g.model === 'faixa' ? `<div class="field"><label>Texto da faixa (uma linha por linha do perfil)</label><textarea rows="${Math.min(g.rows, 4)}" oninput="gridBandSet(this.value)" placeholder="PROPOSTAS">${esc(g.band)}</textarea></div><label class="ins inl"><input type="checkbox" ${g.dark ? 'checked' : ''} onchange="gridDark(this.checked)"> fundo escuro</label>` : ''}
  ${g.model === 'puzzle' ? `<div class="field"><label>Marca embaixo de cada quadro</label><input value="${esc(g.tag)}" oninput="gridTagSet(this.value)" placeholder="${esc(p0name())}"></div><label class="ins inl"><input type="checkbox" ${g.dark ? 'checked' : ''} onchange="gridDark(this.checked)"> margem escura</label>` : ''}`;
}
function gridModel(k) { const g = gridCur(); g.model = k; if (k === 'faixa') { if (!g.band) g.band = g.name.toUpperCase(); g.cells.forEach(c => { c.clean = true; }); } gridSave(); renderFeed(); }
function gridColor(i, v) { const g = gridCur(); if (i < 0) g.colors = []; else { while (g.colors.length <= i) g.colors.push(''); g.colors[i] = v; } gridSave(); if (i < 0) renderFeed(); else gridPaintSoon(); }
function gridBandSet(v) { gridCur().band = String(v).slice(0, 200); gridSave(); gridPaintSoon(); }
function gridTagSet(v) { gridCur().tag = String(v).slice(0, 40); gridSave(); gridPaintSoon(); }
function gridDark(v) { gridCur().dark = !!v; gridSave(); gridPaintSoon(); }
