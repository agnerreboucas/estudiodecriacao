/* ===== Estúdio de Carrosséis: início (carrosséis do projeto) → novo (etapa do funil + modelo) → estúdio (painel, slide, frames) → preview no celular.
   A capa vem do banco de layouts (js/design-layouts-e.js); os miolos seguem o estilo do modelo; texto, mídia, cores, gradiente, CTA e proporção vêm do estado do carrossel. ===== */
const CAR_STAGES = [
  ['topo', 'Topo de funil', 'Para quem ainda não conhece você: ganchos curtos, polêmicas e frases de impacto. Foco em alcance e descoberta.'],
  ['meio', 'Meio de funil', 'Para quem já te segue: listas, tutoriais e comparações. Foco em aprofundar e gerar confiança.'],
  ['fundo', 'Fundo de funil', 'Para quem está perto de decidir: prova, oferta e chamada para ação. Foco em converter.']];
const CAR_TPL = [
  {id: 'foto', stage: 'topo', name: 'Foto + título condensado', cover: 'cap-foto-condensado', inner: {bg: 'dark', head: 'cond', upper: true, align: 'left', photo: true}},
  {id: 'foto-limpa', stage: 'topo', name: 'Foto limpa (split)', cover: 'cap-foto-limpa', inner: {bg: 'dark', head: 'cond', upper: true, align: 'left', photo: true}},
  {id: 'foto-esq', stage: 'topo', name: 'Foto + título à esquerda', cover: 'cap-foto-condensado-esq', inner: {bg: 'dark', head: 'cond', upper: true, align: 'left', photo: true}},
  {id: 'serifado', stage: 'topo', name: 'Foto + título serifado', cover: 'cap-foto-serifado', inner: {bg: 'dark', head: 'serif', upper: false, align: 'left', photo: true}},
  {id: 'circulo', stage: 'topo', name: 'Sujeito sobre círculo', cover: 'cap-circulo-grande', inner: {bg: 'dark', head: 'cond', upper: true, align: 'left', photo: true}},
  {id: 'serifa-gigante', stage: 'topo', name: 'Palavra serifada gigante', cover: 'cap-serifa-gigante', inner: {bg: 'dark', head: 'serif', upper: false, align: 'left', photo: true}, short: true},
  {id: 'editorial-claro', stage: 'topo', name: 'Editorial claro + ilustração', cover: 'cap-editorial-claro', inner: {bg: 'light', head: 'cond', upper: true, align: 'left'}},
  {id: 'etiquetas', stage: 'topo', name: 'Etiquetas escalonadas', cover: 'ed-etiquetas', inner: {bg: 'accent', layout: 'ed-cartao-recortes'}},
  {id: 'halftone', stage: 'topo', name: 'Foto P&B + etiquetas', cover: 'cap-halftone-etiquetas', inner: {bg: 'dark', head: 'cond', upper: true, align: 'left', photo: true}},
  {id: 'notas', stage: 'topo', name: 'Print de notas', cover: 'cap-notas', inner: {bg: 'light', head: 'body', upper: false, align: 'left'}},
  {id: 'faixa', stage: 'meio', name: 'Foto + faixa branca', cover: 'cap-foto-faixa-branca', inner: {bg: 'light', head: 'body', upper: false, align: 'left'}},
  {id: 'editorial-escuro', stage: 'meio', name: 'Editorial escuro + ilustração', cover: 'cap-editorial-escuro', inner: {bg: 'dark', head: 'cond', upper: true, align: 'left'}},
  {id: 'indice', stage: 'meio', name: 'Título + índice numerado', cover: 'ed-indice', inner: {bg: 'accent', layout: 'ed-cartao-recortes'}},
  {id: 'numero', stage: 'meio', name: 'Número gigante + lista', cover: 'ed-numero-lista', inner: {bg: 'accent', layout: 'ed-cartao-recortes'}},
  {id: 'cartao', stage: 'meio', name: 'Cartão com recortes', cover: 'ed-cartao-recortes', inner: {bg: 'accent', layout: 'ed-cartao-recortes'}},
  {id: 'serifa-mista', stage: 'meio', name: 'Frase + palavra serifada', cover: 'cap-serifa-mista', inner: {bg: 'dark', head: 'serif', upper: false, align: 'left', photo: true}, short: true},
  {id: 'cartaz', stage: 'fundo', name: 'Cartaz creme', cover: 'cap-cartaz-creme', inner: {bg: 'light', head: 'serif', upper: false, align: 'left'}, short: true},
  {id: 'objeto', stage: 'fundo', name: 'Produto + título no topo', cover: 'cap-objeto-topo', inner: {bg: 'light', head: 'cond', upper: true, align: 'left'}},
  {id: 'colagem', stage: 'fundo', name: 'Colagem na cor da marca', cover: 'cap-colagem-cor', inner: {bg: 'accent', head: 'cond', upper: true, align: 'left'}, short: true},
  {id: 'legenda', stage: 'fundo', name: 'Legenda em caixa (vídeo)', cover: 'cap-legenda-caixa', inner: {bg: 'dark', head: 'body', upper: false, align: 'left', photo: true}, short: true}
];
const carTplOf = c => CAR_TPL.find(t => t.id === c.tpl) || CAR_TPL[0];
const carPad = n => String(n).padStart(2, '0');

/* ---------- dados ---------- */
function carNew(name, stage, tpl) {
  const p = curProject(), t = CAR_TPL.find(x => x.id === tpl) || CAR_TPL.find(x => x.stage === stage) || CAR_TPL[0];
  const c = normalizeCarousel({name: name || 'Carrossel', stage: t.stage, tpl: t.id, globals: {name: p.name, handle: '', copyright: String(new Date().getFullYear()) + ' ©'}, cta: {text: ''}});
  p.carousels.unshift(c); carUI.id = c.id; carUI.frame = 0; persist(); return c;
}
function carDup(id) { const p = curProject(), s = p.carousels.find(x => x.id === id); if (!s) return; const c = normalizeCarousel(Object.assign(JSON.parse(JSON.stringify(s)), {id: '', name: s.name + ' (cópia)', versions: [], created: '', updated: ''})); c.id = uid('car'); p.carousels.splice(p.carousels.indexOf(s) + 1, 0, c); persist(); renderCarrosseis(); toast('Carrossel duplicado.'); }
function carDel(id) { if (!confirm('Excluir este carrossel?')) return; const p = curProject(); p.carousels = p.carousels.filter(x => x.id !== id); if (carUI.id === id) carUI.id = ''; persist(); renderCarrosseis(); }
function carOpen(id) { carUI.id = id; carUI.frame = 0; renderCarrosseis(); }
function carBack() { carUI.id = ''; renderCarrosseis(); }
function carRename(v) { carS().name = v.slice(0, 80); carSave(); }

/* ---------- montagem dos slides ---------- */
function carCopyOf(c) {
  const B = carBaseOf(c), T = c.texts.map(t => (t || '').trim()), g = B.groups;
  return {cover: {title: T[0] || 'Título da capa', sub: T[1]}, blocks: g.map((ix, k) => ({idx: ix, title: T[ix[0]], body: ix.slice(1).map(i => T[i]).filter(Boolean).join('\n\n')})).filter(s => s.title || s.body), cta: {title: T[16] || '', sub: T[17] || '', button: (c.cta.text || (EDX().prod.cta || '').trim() || 'Salvar e compartilhar')}};
}
function carTk(c, tpl) {
  const p = curProject(), tk = JSON.parse(JSON.stringify(lyTokens(p, c.style || lyStyles(p)[0].id))), I = tpl.inner || {}, acc = tk.accent;
  tk.photoMode = 'none'; tk.align = I.align || 'left'; tk.upper = !!I.upper;
  if (I.bg === 'accent') { tk.bg = acc; tk.fg = readable(acc); tk.muted = mixHex(acc, tk.fg, 0.7); tk.accent = '#e7e1d3'; }
  else if (I.bg === 'light' && !c.dark) { tk.bg = '#f6f3ec'; tk.fg = '#141414'; tk.muted = '#6b6b6b'; }
  else { tk.bg = '#111214'; tk.fg = '#ffffff'; tk.muted = '#a6a6ad'; }
  if (c.accent) tk.accent = c.accent;
  const fam = I.head === 'serif' ? 'DM Serif Display' : I.head === 'cond' ? 'Anton' : null; if (fam) tk.head = {family: fam, weight: 400}; if (c.fontHead) { tk.head = {family: c.fontHead, weight: 700}; tk.headForce = true; }
  return tk;
}
const carWrap = (txt, n) => { const out = []; let cur = ''; String(txt).split(/\s+/).forEach(w => { if ((cur + ' ' + w).trim().length > n && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }); if (cur) out.push(cur); return out; };
function carCoverCopy(c, tpl, cp, total) {
  const g = c.globals, S = g.show, o = {title: cp.cover.title, sub: cp.cover.sub || '∅', tag: S.name && g.name ? g.name : '∅', handle: S.handle && g.handle ? g.handle : '∅', date: S.copyright && g.copyright ? g.copyright : '∅', button: '∅', kicker: '∅', num: '∅'};
  const id = tpl.cover;
  if (id === 'ed-etiquetas') { o.title = carWrap(cp.cover.title, 13).join('\n'); o.kicker = '∅'; o.sub = cp.cover.sub || '∅'; }
  if (id === 'cap-halftone-etiquetas') { const w = String(cp.cover.title).replace(/[.?!]+$/, '').split(/\s+/); o.kicker = (w.pop() || '').toUpperCase(); o.title = carWrap(w.join(' '), 24).join('\n'); }
  if (id === 'ed-indice' || id === 'ed-numero-lista') { o.items = cp.blocks.map(b => b.title).filter(Boolean).slice(0, 14).join('\n') || '∅'; o.num = String(cp.blocks.length || ''); if (id === 'ed-indice') o.sub = cp.cover.sub || '∅'; }
  if (id === 'cap-editorial-claro' || id === 'cap-editorial-escuro') { o.tag = 'CAPA'; o.num = carPad(1) + '/' + carPad(total); }
  if (id === 'cap-foto-limpa') o.button = 'ARRASTE →';
  if (c.splitCover && id === 'cap-foto-condensado') o.button = 'Arraste pro lado →';
  if (id === 'cap-notas') { o.kicker = '∅'; o.date = '∅'; }
  if (id === 'ed-cartao-recortes') { o.num = '//  ' + carPad(1); o.sub = cp.cover.sub || '∅'; }
  if (tpl.short && /\s/.test(cp.cover.title) && cp.cover.title.length > 22) { /* modelos de palavra única: usa a última palavra forte como destaque */ }
  return o;
}
function carMake(c, o) {
  o = o || {};
  const p = curProject(), tpl = carTplOf(c), tk = carTk(c, tpl), fmt = resolveFmt({fmt: c.ratio === '9:16' ? 'story' : 'feed45'}), cp = carCopyOf(c), g = c.globals, brand = g.name || p.name, total = cp.blocks.length + 2, I = tpl.inner || {};
  const slides = [], labels = [], lay = layoutById(tpl.cover);
  slides.push(buildLayoutSlide(lay, tk, carCoverCopy(c, tpl, cp, total), fmt, brand)); labels.push('Capa');
  cp.blocks.forEach((b, i) => {
    let s;
    if (I.layout) s = buildLayoutSlide(layoutById(I.layout), tk, {num: '//  ' + carPad(i + 2), title: b.title || '∅', sub: (b.body || '').replace(/\n+/g, ' ') || '∅', items: '∅'}, fmt, brand);
    else { const tkI = Object.assign({}, tk, {photoMode: I.photo && c.media[String(i + 1)] ? 'full' : 'none'}); s = slideContent(tkI, {title: b.title || '', body: b.body}, fmt, brand, i + 2, total); }
    slides.push(s); labels.push(b.title ? b.title.replace(/\*\*/g, '').slice(0, 26) : 'Slide ' + (i + 2));
  });
  const cta = slideCta(tk, cp.cta, fmt, brand);
  if (!c.cta.on) cta.layers = cta.layers.filter(L => L.role !== 'cta-fill' && L.role !== 'cta-text');
  else carStyleCta(cta, c.cta, tk, fmt);
  slides.push(cta); labels.push('CTA');
  slides.forEach((s, f) => {
    if (f > 0 && !I.layout) carTopStrip(s, tk, fmt, c, !!(s.layers.some(L => L.type === 'image' && L.imgId !== undefined && L.role === 'photo')));
    const ph = s.layers.filter(L => L.type === 'image' && (L.role === 'photo' || L.role === 'cutout'));
    ph.forEach((L, j) => { const id = j === 0 ? c.media[String(f)] : (f === 0 ? c.media[String(19 + j)] : ''); if (id) L.imgId = id; });
    s.layers.forEach(L => { if (L.grad && (L.role === 'overlay' || L.role === 'veil')) { const k = c.grad / 70, sc = col => String(col).replace(/rgba\((\d+),(\d+),(\d+),([\d.]+)\)/, (m, r, gg, b, a) => `rgba(${r},${gg},${b},${Math.max(0, Math.min(1, +a * k)).toFixed(3)})`); L.grad = Object.assign({}, L.grad, {c1: sc(L.grad.c1), c2: sc(L.grad.c2)}); } else if (L.role === 'overlay' && L.fill && !L.grad) { const k = c.grad / 70; L.fill = String(L.fill).replace(/rgba\((\d+),(\d+),(\d+),([\d.]+)\)/, (m, r, gg, b, a) => `rgba(${r},${gg},${b},${Math.max(0, Math.min(1, +a * k)).toFixed(3)})`); } });
    if (o.final) {   // sem imagem: fundo suave da marca no lugar do espaço de foto (o exportado não leva textos de ajuda)
      const out = []; s.layers.forEach(L => { if (L.type === 'image' && !L.imgId) { if (L.role === 'cutout') return; const full = L.w >= fmt.w - 2 && L.h >= fmt.h - 2; out.push(RC('photofill', Object.assign({x: L.x, y: L.y, w: L.w, h: L.h, radius: L.radius || 0, rot: L.rot}, full ? {fill: '', grad: {c1: mixHex(tk.bg, tk.accent, 0.38), c2: mixHex(tk.bg, tk.fg, 0.1), a: 160}} : {fill: mixHex(tk.bg, tk.fg, 0.12)}))); } else out.push(L); }); s.layers = out;
    }
    if (c.bgs[String(f)]) { s.bg = c.bgs[String(f)]; s.layers.forEach(L => { if (L.role === 'bgfill') L.fill = c.bgs[String(f)]; }); }
  });
  return {set: {id: 'car-' + c.id, name: c.name, format: {id: fmt.id, w: fmt.w, h: fmt.h}, tk, slides, created: c.created, updated: c.updated}, labels};
}
function carTopStrip(s, tk, fmt, c, onP) {
  const g = c.globals, S = g.show, W = fmt.w, y = 36, o = {size: 19, y, w: 360, ls: 0.6, upper: false, onPhoto: onP}, add = (txt, x, al) => { if (!txt) return; const L = T('muted', Object.assign({content: txt, x, align: al}, o)); themeLayer(L, tk); s.layers.push(L); };
  add(S.name && g.name ? g.name : '', 48, 'left'); add(S.handle && g.handle ? g.handle : '', (W - 360) / 2, 'center'); add(S.copyright && g.copyright ? g.copyright : '', W - 48 - 360, 'right');
}
function carStyleCta(slide, cta, tk, fmt) {
  const btn = slide.layers.find(L => L.role === 'cta-fill'), txt = slide.layers.find(L => L.role === 'cta-text'); if (!btn || !txt) return;
  const W = fmt.w, bw = btn.w; let bx = cta.align === 'center' ? (W - bw) / 2 : cta.align === 'right' ? W - 90 - bw : 90; const dx = bx - btn.x; btn.x += dx; txt.x += dx;
  if (cta.style === 'outline') { btn.fill = ''; btn.stroke = cta.color || tk.accent; btn.strokeW = 4; txt.color = cta.textColor || cta.color || tk.accent; }
  else if (cta.style === 'glass') { btn.fill = 'rgba(255,255,255,0.18)'; btn.stroke = 'rgba(255,255,255,0.55)'; btn.strokeW = 2; txt.color = cta.textColor || '#ffffff'; }
  else { if (cta.color) btn.fill = cta.color; if (cta.textColor) txt.color = cta.textColor; }
  const ic = {arrow: ' →', send: ' ➤', play: ' ▶', heart: ' ♥', star: ' ★', bookmark: ' ⚑'}[cta.icon]; if (ic && !String(txt.content).endsWith(ic)) txt.content += ic;
}

/* ---------- render (slide grande, faixa de frames, miniaturas) ---------- */
async function carRenderAll() {
  const c = carS(), tok = ++carState.thumbs; if (!$('carMain') && !document.querySelector('.cs-home')) return;
  try {
    if ($('carMain')) {
      const {set, labels} = carMake(c); await ensureFonts(lyFamilies(set.tk)); await brandFontsLoad(curProject()); await ensureSetResources(set); if (tok !== carState.thumbs || !$('carMain')) return;
      carState.set = set; carState.labels = labels; if (carUI.frame >= set.slides.length) carUI.frame = set.slides.length - 1;
      const W = set.format.w, H = set.format.h, cv = $('carMain'), css = Math.min(460, Math.round(620 * W / H)), k = 2 * css / W; cv.width = Math.round(W * k); cv.height = Math.round(H * k); cv.style.width = css + 'px'; cv.style.height = Math.round(css * H / W) + 'px'; renderSlide(cv.getContext('2d'), set.slides[carUI.frame], W, H, k);
      const st = $('carStrip'); if (st) { st.innerHTML = ''; set.slides.forEach((s, i) => { const d = document.createElement('div'); d.className = 'cs-fr' + (i === carUI.frame ? ' on' : ''); d.onclick = () => { carUI.frame = i; renderCarrosseis(); }; const cv2 = document.createElement('canvas'), tw = 120; cv2.width = tw * 2; cv2.height = Math.round(tw * 2 * H / W); cv2.style.width = tw + 'px'; cv2.style.height = Math.round(tw * H / W) + 'px'; renderSlide(cv2.getContext('2d'), s, W, H, cv2.width / W); const lb = document.createElement('small'); lb.textContent = carPad(i + 1) + ' ' + (labels[i] || ''); d.appendChild(cv2); d.appendChild(lb); st.appendChild(d); }); }
    }
  } catch (e) { console.warn('carrossel', e); const b = $('carMain'); if (b) b.insertAdjacentHTML('afterend', `<small class="muted">Não consegui montar o slide: ${esc(e.message)}</small>`); }
}
const carRenderSoon = debounce(() => carRenderAll(), 350);

/* ---------- início: carrosséis do projeto ---------- */
function renderCarrosseis() {
  const r = $('carrosseisRoot'), p = curProject(); if (!r) return; if (!p) { r.innerHTML = noProject('Carrosséis'); return; }
  const c = p.carousels.find(x => x.id === carUI.id); if (c) return carStudio(r, p, c);
  r.innerHTML = `<div class="page-head"><div><h1>Carrosséis</h1><p>Seus carrosséis de ${esc(p.name)}. Escolha a etapa do funil e um modelo, escreva ou gere o texto, ajuste mídia, cores e botão, veja no celular e exporte.</p></div><div class="actions">${projectSelect()}<button class="btn dark" onclick="carNewModal()">＋ Novo carrossel</button></div></div>
  <div class="cs-home panel">${p.carousels.length ? `<div class="cs-grid">${p.carousels.map(x => `<article class="cs-card"><div class="cs-th" onclick="carOpen('${x.id}')"><canvas data-car="${x.id}" width="320" height="400"></canvas><span class="cs-n">${carMakeCount(x)} slides</span></div><strong>${esc(x.name)}</strong><small class="muted block">${esc((CAR_STAGES.find(s => s[0] === x.stage) || [0, ''])[1])} · ${esc(carTplOf(x).name)} · ${esc(timeAgo(x.updated))}</small><div class="row-gap"><button class="btn sm dark" onclick="carOpen('${x.id}')">Abrir</button><button class="btn sm" onclick="carDup('${x.id}')">⧉ Duplicar</button><button class="btn sm" onclick="carDel('${x.id}')">×</button></div></article>`).join('')}</div>` : `<p class="muted">Nenhum carrossel ainda. Clique em <b>＋ Novo carrossel</b> e escolha um modelo.</p>`}</div>`;
  carHomeThumbs();
}
const carMakeCount = x => { try { return carCopyOf(x).blocks.length + 2; } catch (e) { return 6; } };
function timeAgo(iso) { const d = (Date.now() - new Date(iso).getTime()) / 1000; if (!isFinite(d) || d < 60) return 'agora'; if (d < 3600) return 'há ' + Math.floor(d / 60) + ' min'; if (d < 86400) return 'há ' + Math.floor(d / 3600) + ' h'; return 'há ' + Math.floor(d / 86400) + ' dia(s)'; }
async function carHomeThumbs() {
  const p = curProject(); for (const cv of [...document.querySelectorAll('canvas[data-car]')]) {
    const c = p.carousels.find(x => x.id === cv.dataset.car); if (!c || !cv.isConnected) continue;
    try { const {set} = carMake(c, {final: true}); await ensureFonts(lyFamilies(set.tk)); await ensureSetResources(set); const W = set.format.w, H = set.format.h; cv.height = Math.round(320 * H / W); renderSlide(cv.getContext('2d'), set.slides[0], W, H, 320 / W); } catch (e) { /* sem miniatura */ }
  }
}

/* ---------- novo carrossel / trocar modelo ---------- */
let carNewState = {mode: 'new', stage: 'topo'};
function carNewModal(mode) {
  carNewState = {mode: mode || 'new'}; const isNew = carNewState.mode === 'new';
  showModal(isNew ? 'Novo carrossel' : 'Trocar o modelo', `${isNew ? `<div class="field"><input id="cnName" placeholder="Nome do carrossel" autofocus></div>` : ''}<small class="muted block" style="margin-bottom:8px">Escolha a etapa do funil e o modelo da capa. Os miolos seguem o mesmo estilo; você troca cores, fontes e mídia depois.</small>
  ${CAR_STAGES.map(([k, n, d]) => `<div class="okr-label" style="margin-top:10px">${n.toUpperCase()}</div><small class="muted block" style="margin-bottom:6px">${esc(d)}</small><div class="cs-tpls">${CAR_TPL.filter(t => t.stage === k).map(t => `<label class="cs-tpl"><input type="radio" name="cnT" value="${t.id}" ${t.id === (isNew ? 'foto' : carS().tpl) ? 'checked' : ''}><canvas data-tpl="${t.id}" width="150" height="188"></canvas><small>${esc(t.name)}</small></label>`).join('')}</div>`).join('')}
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="carNewGo()">${isNew ? 'Criar carrossel' : 'Usar este modelo'}</button></div>`);
  document.getElementById('modalBox').classList.add('wide'); carTplThumbs();
}
async function carTplThumbs() {
  const p = curProject(), base = carS(), c0 = normalizeCarousel({globals: {name: p.name, handle: '@seunegocio', copyright: '2026 ©'}, style: base.style, dark: base.dark, texts: ['Seu título forte para a capa do carrossel', 'Subtítulo que abre a tensão', 'Primeiro bloco', 'Texto do primeiro bloco.', '', '', 'Segundo bloco', 'Texto do segundo bloco.'].concat(Array(10).fill(''))});
  for (const t of CAR_TPL) { const cv = document.querySelector(`canvas[data-tpl="${t.id}"]`); if (!cv) continue; try { c0.tpl = t.id; const {set} = carMake(c0); await ensureFonts(lyFamilies(set.tk)); LAYOUT_PREVIEW = true; try { renderSlide(cv.getContext('2d'), set.slides[0], set.format.w, set.format.h, cv.width / set.format.w); } finally { LAYOUT_PREVIEW = false; } } catch (e) { console.warn('tpl', t.id, e); } }
}
function carNewGo() {
  const t = (document.querySelector('input[name=cnT]:checked') || {}).value || 'foto';
  if (carNewState.mode === 'new') { const c = carNew((($('cnName') || {}).value || '').trim() || 'Carrossel', '', t); closeModal(); renderCarrosseis(); return c; }
  const c = carS(), tpl = CAR_TPL.find(x => x.id === t); c.tpl = t; c.stage = tpl.stage; carSave(); closeModal(); renderCarrosseis();
}

/* ---------- estúdio ---------- */
function carStudio(r, p, c) {
  const B = carBaseOf(c), styles = lyStyles(p), ready = aiReady(), has = c.texts.some(t => t.trim()), agentOK = !!(EDS().ideas && EDS().ideas[EDS().chosen] && EDS().brief), cov = B.covers.find(x => x.id === c.cover) || B.covers[0], cp = carCopyOf(c), nFrames = cp.blocks.length + 2;
  const fr = Math.min(carUI.frame, nFrames - 1), idx = fr === 0 ? [0, 1] : fr === nFrames - 1 ? [16, 17] : cp.blocks[fr - 1].idx, G = c.globals, S = G.show;
  const eye = k => `<button class="cs-eye ${S[k] ? '' : 'off'}" title="${S[k] ? 'Visível' : 'Oculto'}" onclick="carShow('${k}')">${S[k] ? '👁' : '◌'}</button>`;
  r.innerHTML = `<div class="cs-top"><button class="btn sm" onclick="carBack()">← Carrosséis</button>${typeof gridUI !== 'undefined' && gridUI.from && gridUI.id ? '<button class="btn sm" onclick="gridBack()">← Grid</button>' : ''}${typeof feedUI !== 'undefined' && feedUI.from && feedUI.id ? '<button class="btn sm" onclick="feedUI.from=false;go(\'feed\')">← Feed</button>' : ''}<input class="cs-name" value="${esc(c.name)}" oninput="carRename(this.value)"><span style="flex:1"></span><button class="btn sm" onclick="carPreview()">📱 Preview</button><button class="btn sm" onclick="carVersionSave()">Salvar versão</button><button class="btn sm" onclick="carNewModal('change')">Trocar modelo</button><button class="btn dark sm" onclick="carExport('zip')">⬇ Exportar PNG</button><button class="btn sm" onclick="carExport('design')">Abrir no Editor de Design</button></div>
  <div class="cs-wrap"><div class="cs-left">
    ${accSec('cs', 'cont', 'Conteúdo', has ? '18 textos' : 'vazio', `<div class="field"><label>Tema ou ideia</label><textarea rows="3" id="carIdea" oninput="carS().idea=this.value;carSave()" placeholder="Sobre o que é o carrossel? Cole um tema, tese ou texto.">${esc(c.idea)}</textarea></div>
      <label class="ins inl"><input type="checkbox" ${c.useAgent && agentOK ? 'checked' : ''} ${agentOK ? '' : 'disabled'} onchange="carS().useAgent=this.checked;carSave()"> usar a ideia e o briefing do Agente Editorial${agentOK ? '' : ' (escolha uma ideia no Agente)'}</label>
      <div class="field" style="margin-top:6px"><label>Estrutura da capa</label><select onchange="carS().cover=this.value;carSave()">${B.covers.map(x => `<option value="${x.id}" ${x.id === cov.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>
      <div class="row-gap" style="flex-wrap:wrap"><button class="btn dark sm" onclick="carGenCover()" ${carState.busy || !ready ? 'disabled' : ''}>${carState.busy === 'cover' ? 'Gerando…' : '✦ Gerar capa'}</button><button class="btn dark sm" onclick="carGenAll()" ${carState.busy || !ready ? 'disabled' : ''}>${carState.busy === 'all' ? 'Escrevendo…' : '✦ Gerar texto do carrossel'}</button></div>
      ${c.covers.length ? `<div class="okr-label" style="margin-top:8px">OPÇÕES DE CAPA</div>${c.covers.map((o, i) => `<label class="ent-opt ${o.titulo === c.texts[0] ? 'on' : ''}" style="flex-direction:column;gap:2px" onclick="carPickCover(${i})"><b style="font-size:12.5px">${esc(o.titulo)}</b><small class="muted">${esc(o.subtitulo)}</small></label>`).join('')}` : ''}
      <div class="field" style="margin-top:8px"><label>Cole o texto aqui (lista numerada 1–18 ou parágrafos)</label><textarea rows="4" id="carPaste" placeholder="- Texto linha 1&#10;- Texto linha 2"></textarea></div>
      <div class="row-gap" style="flex-wrap:wrap"><button class="btn sm dark" onclick="carPasteApply()">Aplicar texto ➤</button><button class="btn sm" onclick="carTextsModal()">Editar os 18 textos</button><button class="btn sm" onclick="carCopy()">Copiar</button><button class="btn sm" onclick="carClear()">Limpar</button></div>`, true)}
    ${accSec('cs', 'txt', 'Texto deste slide', carState.labels ? carState.labels[fr] || '' : '', idx.map(i => `<div class="field"><label>${i + 1} · ${esc(ED_CAR(i + 1, EDX().sizes)[0])} <small id="carc${i}" class="muted">${c.texts[i].length} / ${ED_CAR(i + 1, EDX().sizes)[1][0]}–${ED_CAR(i + 1, EDX().sizes)[1][1]}</small></label><textarea rows="${i === 0 || /^(Título)/.test(CAR_SLOTS[i]) ? 2 : 3}" oninput="carEdit(${i},this.value)">${esc(c.texts[i])}</textarea></div>`).join('') + '<small class="muted block">Use **palavra** para destacar na cor do estilo.</small>', true)}
    ${accSec('cs', 'glob', 'Campos globais', 'nome, @, direitos, avatar', `<div class="cs-gf"><label>Nome da marca</label>${eye('name')}</div><input value="${esc(G.name)}" oninput="carG('name',this.value)"><div class="cs-gf"><label>@ do perfil</label>${eye('handle')}</div><input value="${esc(G.handle)}" placeholder="@seunegocio" oninput="carG('handle',this.value)"><div class="cs-gf"><label>Direitos / data</label>${eye('copyright')}</div><input value="${esc(G.copyright)}" oninput="carG('copyright',this.value)"><div class="cs-gf"><label>Avatar</label>${eye('avatar')}</div><div class="row-gap"><button class="btn sm" onclick="carAvatar()">📚 ${G.avatarId ? 'Trocar' : 'Escolher'}</button>${G.avatarId ? `<button class="btn sm" onclick="carG('avatarId','')">×</button>` : ''}</div><small class="muted block">Aparecem em todos os slides que têm cabeçalho; o olho liga e desliga.</small>`)}
    ${accSec('cs', 'mid', 'Mídia', carMediaSum(c, nFrames), carMediaHTML(c, nFrames, fr))}
    ${accSec('cs', 'cor', 'Cores, fundo e estilo', '', `<label class="ins">Estilo<select onchange="carS().style=this.value;carSave();carRenderAll()">${styles.map(s => `<option value="${esc(s.id)}" ${s.id === (c.style || styles[0].id) ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label><label class="ins inl"><input type="checkbox" ${c.dark ? 'checked' : ''} onchange="carS().dark=this.checked;carSave();carRenderAll()"> fundo escuro nos miolos</label>
      <div class="okr-label" style="margin-top:8px">FUNDO DESTE SLIDE</div><div class="row-gap"><input type="color" value="${c.bgs[String(fr)] || '#ffffff'}" oninput="carBg(this.value)"><button class="btn sm" onclick="carBg('')">usar o do modelo</button></div>`)}
    ${accSec('cs', 'grad', 'Gradiente', c.grad + '%', `<small class="muted block" style="margin-bottom:6px">Escurece a parte de baixo das fotos para o texto ficar legível. 0% = sem gradiente.</small><input type="range" min="0" max="100" value="${c.grad}" oninput="carGrad(this.value)" style="width:100%"><div class="row-gap"><button class="btn sm" onclick="carGrad(70,true)">Resetar</button></div>`)}
    ${accSec('cs', 'cta', 'Botão (CTA)', c.cta.on ? 'ligado' : 'desligado', `<label class="ins inl"><input type="checkbox" ${c.cta.on ? 'checked' : ''} onchange="carCta('on',this.checked)"> mostrar botão no último slide</label><div class="field"><label>Texto do botão</label><input value="${esc(c.cta.text)}" placeholder="Salvar e compartilhar" oninput="carCta('text',this.value,true)"></div>
      <div class="ins-row"><label class="ins">Estilo<select onchange="carCta('style',this.value)">${[['solid', 'Sólido'], ['outline', 'Contorno'], ['glass', 'Glass']].map(([v, n]) => `<option value="${v}" ${c.cta.style === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label><label class="ins">Posição<select onchange="carCta('align',this.value)">${[['left', 'Esquerda'], ['center', 'Centro'], ['right', 'Direita']].map(([v, n]) => `<option value="${v}" ${c.cta.align === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label><label class="ins">Ícone<select onchange="carCta('icon',this.value)">${[['', 'nenhum'], ['arrow', '→ seta'], ['send', '➤ enviar'], ['play', '▶ play'], ['heart', '♥ coração'], ['star', '★ estrela'], ['bookmark', '⚑ salvar']].map(([v, n]) => `<option value="${v}" ${c.cta.icon === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div>
      <div class="ins-row"><label class="ins">Cor do botão<input type="color" value="${c.cta.color || '#e4572e'}" oninput="carCta('color',this.value,true)"></label><label class="ins">Cor do texto<input type="color" value="${c.cta.textColor || '#ffffff'}" oninput="carCta('textColor',this.value,true)"></label><button class="btn sm" onclick="carCta('color','');carCta('textColor','')">padrão</button></div>`)}
    ${accSec('cs', 'prop', 'Proporção', c.ratio, `<div class="row-gap"><button class="btn sm ${c.ratio === '4:5' ? 'dark' : ''}" onclick="carRatio('4:5')">4:5 (feed)</button><button class="btn sm ${c.ratio === '9:16' ? 'dark' : ''}" onclick="carRatio('9:16')">9:16 (Stories/Reels)</button></div><small class="muted block">No 9:16 o fundo aumenta acima e abaixo; o conteúdo se reorganiza.</small>`)}
    ${accSec('cs', 'hist', 'Histórico', c.versions.length ? c.versions.length + ' versões' : 'nenhuma', c.versions.length ? c.versions.map((v, i) => `<div class="list-item"><div><strong>${esc(v.label)}</strong><small>${esc(timeAgo(v.at))}</small></div><button class="btn sm" onclick="carVersionRestore(${i})">Restaurar</button></div>`).join('') : '<small class="muted">Use “Salvar versão” no topo para guardar o texto neste ponto.</small>')}
  </div>
  <div class="cs-center"><canvas id="carMain" class="cs-main"></canvas><div class="row-gap" style="justify-content:center;margin-top:8px"><button class="btn sm" onclick="carGo(-1)" ${fr === 0 ? 'disabled' : ''}>‹</button><small class="muted">Slide ${fr + 1} de ${nFrames}</small><button class="btn sm" onclick="carGo(1)" ${fr === nFrames - 1 ? 'disabled' : ''}>›</button></div><small class="muted block" style="text-align:center;margin-top:6px">Modelo: ${esc(carTplOf(c).name)}${carTplOf(c).short ? ' · funciona melhor com título curto' : ''}. Para ajustar posição e estilo de cada texto, use “Abrir no Editor de Design”.</small></div>
  <div class="cs-right"><div class="okr-label">FRAMES</div><div id="carStrip" class="cs-strip"></div></div></div>`;
  carRenderAll();
}
const carGo = d => { carUI.frame = Math.max(0, carUI.frame + d); renderCarrosseis(); };
function carEdit(i, v) { const c = carS(); c.texts[i] = v.slice(0, 1200); carSave(); const el = $('carc' + i), rg = ED_CAR(i + 1, EDX().sizes)[1]; if (el) { el.textContent = `${v.length} / ${rg[0]}–${rg[1]}`; el.className = v && (v.length < rg[0] || v.length > rg[1]) ? 'bad' : 'muted'; } carRenderSoon(); }
function carG(k, v) { const c = carS(); c.globals[k] = String(v).slice(0, 80); carSave(); if (k === 'avatarId') renderCarrosseis(); else carRenderSoon(); }
function carShow(k) { const c = carS(); c.globals.show[k] = !c.globals.show[k]; carSave(); renderCarrosseis(); }
function carAvatar() { libPick(r => { carS().globals.avatarId = r.id; carSave(); renderCarrosseis(); }); }
function carBg(v) { const c = carS(); if (v) c.bgs[String(carUI.frame)] = v; else delete c.bgs[String(carUI.frame)]; carSave(); carRenderSoon(); }
function carGrad(v, re) { const c = carS(); c.grad = Math.max(0, Math.min(100, Math.round(+v))); carSave(); if (re) renderCarrosseis(); else carRenderSoon(); }
function carCta(k, v, quiet) { const c = carS(); c.cta[k] = v; carSave(); if (quiet) carRenderSoon(); else renderCarrosseis(); }
function carRatio(r) { carS().ratio = r; carSave(); renderCarrosseis(); }
function carMediaSum(c, n) { return Object.keys(c.media).length + ' de ' + n; }
function carMediaHTML(c, n, fr) {
  const cells = Array.from({length: n}, (_, i) => { const id = c.media[String(i)]; return `<div class="cs-slot ${i === fr ? 'cur' : ''}" onclick="carMedia(${i})" title="${id ? 'Trocar imagem do slide ' + (i + 1) : 'Escolher imagem do slide ' + (i + 1)}"><b>${i + 1}</b>${id ? `<img data-img="${id}" alt="">` : '<span>＋</span>'}${id ? `<i onclick="event.stopPropagation();carMediaClear(${i})">×</i>` : ''}</div>`; }).join('');
  setTimeout(() => document.querySelectorAll('img[data-img]').forEach(async el => { try { const b = await imgGet(el.dataset.img); if (b) el.src = URL.createObjectURL(b); } catch (e) { /* sem miniatura */ } }), 30);
  return `<small class="muted block" style="margin-bottom:6px">Um espaço por slide, da Biblioteca. Slides sem foto no modelo ignoram a imagem.</small><div class="cs-slots">${cells}</div>`;
}
function carMedia(i) { libPick(r => { carS().media[String(i)] = r.id; carSave(); renderCarrosseis(); }); }
function carMediaClear(i) { delete carS().media[String(i)]; carSave(); renderCarrosseis(); }
function carTextsModal() {
  const c = carS(); showModal('Os 18 textos', `<small class="muted block" style="margin-bottom:6px">Editáveis, com faixa de caracteres por tipo.</small><div class="cs-18">${c.texts.map((t, i) => { const rg = ED_CAR(i + 1, EDX().sizes); return `<div class="field"><label>${i + 1} · ${esc(rg[0])} <small id="carc${i}" class="${t && (t.length < rg[1][0] || t.length > rg[1][1]) ? 'bad' : 'muted'}">${t.length} / ${rg[1][0]}–${rg[1][1]}</small></label><textarea rows="2" oninput="carEdit(${i},this.value)">${esc(t)}</textarea></div>`; }).join('')}</div><div class="modal-actions"><button class="btn dark" onclick="closeModal();renderCarrosseis()">Pronto</button></div>`);
  document.getElementById('modalBox').classList.add('wide');
}
function carVersionSave() { const c = carS(); c.versions.unshift({at: new Date().toISOString(), label: (c.texts[0] || 'Versão').slice(0, 50), texts: c.texts.slice()}); c.versions = c.versions.slice(0, 12); carSave(); renderCarrosseis(); toast('Versão salva.'); }
function carVersionRestore(i) { const c = carS(), v = c.versions[i]; if (!v) return; c.texts = v.texts.concat(Array(18).fill('')).slice(0, 18); carSave(); renderCarrosseis(); toast('Versão restaurada.'); }

/* ---------- exportar ---------- */
async function carExport(kind) {
  const c = carS(); if (!c.texts.some(t => t.trim())) { toast('Escreva ou gere o texto primeiro.'); return; } toast('Montando os slides…');
  try {
    const {set} = carMake(c, {final: kind === 'zip'}); set.id = uid('ds'); set.name = c.name + ' · carrossel'; await ensureFonts(lyFamilies(set.tk)); await brandFontsLoad(curProject()); await ensureSetResources(set);
    if (kind === 'zip') { download(slug(c.name) + '-carrossel.zip', await exportSetZip(set), 'application/zip'); toast('PNGs exportados (um por slide).'); return; }
    curProject().design.sets.push(set); persist(); go('design'); dzOpen(set.id); toast('Slides criados. Clique nos textos para editar e arraste para mover.');
  } catch (e) { toast('Não consegui montar os slides: ' + e.message); }
}

/* ---------- preview no celular ---------- */
async function carPreview() {
  const c = carS(); if (!c.texts.some(t => t.trim())) { toast('Escreva ou gere o texto primeiro.'); return; }
  const {set} = carMake(c, {final: true}); await ensureFonts(lyFamilies(set.tk)); await brandFontsLoad(curProject()); await ensureSetResources(set); const G = c.globals, W = set.format.w, H = set.format.h, pw = 300, ph = Math.round(pw * H / W);
  let av = ''; if (G.avatarId) { try { const b = await imgGet(G.avatarId); if (b) av = URL.createObjectURL(b); } catch (e) { /* sem avatar */ } }
  showModal('Preview no celular', `<div class="cs-phone"><div class="cs-notch"></div><div class="cs-ph-h">${av ? `<img src="${av}" alt="">` : `<span class="cs-av">${esc((G.name || '?').slice(0, 1).toUpperCase())}</span>`}<b>${esc(G.handle ? G.handle.replace(/^@/, '') : (G.name || ''))}</b><span class="cs-tick">✓</span><span style="flex:1"></span>⋮</div><div class="cs-ph-s" id="carPh" onscroll="carPhDots()">${set.slides.map((s, i) => `<canvas data-i="${i}" width="${pw * 2}" height="${ph * 2}" style="width:${pw}px;height:${ph}px"></canvas>`).join('')}</div><div class="cs-dots" id="carDots">${set.slides.map((s, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div><div class="cs-ph-a">♡ 💬 ➤ <span style="flex:1"></span>⚑</div><small class="muted">curtidas de exemplo · slide <span id="carPhN">1</span> de ${set.slides.length}</small></div><div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button></div>`);
  document.querySelectorAll('#carPh canvas').forEach(cv => renderSlide(cv.getContext('2d'), set.slides[+cv.dataset.i], W, H, cv.width / W));
}
function carPhDots() { const s = $('carPh'); if (!s) return; const i = Math.round(s.scrollLeft / s.clientWidth); document.querySelectorAll('#carDots i').forEach((d, k) => d.classList.toggle('on', k === i)); if ($('carPhN')) $('carPhN').textContent = i + 1; }
