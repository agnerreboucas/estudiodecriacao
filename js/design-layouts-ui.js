/* Galeria de modelos de layout (folha de contato) e criação de peça a partir de um modelo */
const lyState = {group: 'Todos', q: '', style: ''};
const LY_LABEL = {title: 'Título (use **palavra** para destacar)', sub: 'Texto de apoio', kicker: 'Chamada / etiqueta', button: 'Botão ou chamada final', handle: '@ ou assinatura', num: 'Número', label: 'Texto 2', items: 'Itens (um por linha; "Título|descrição" quando houver os dois)'};
const LY_NEUTRAL = () => makeTokens(DESIGN_STYLES[0], FONT_PAIRS[0], PHOTO_STYLES[0], {name: 'Neutro', accent: '#e4572e', second: '#1d3557', bg: '#f6f3ec', fg: '#141414', muted: '#6b6b6b'});

/* estilos disponíveis para aplicar nos modelos: Kit de marca, estilos salvos e um neutro */
function lyStyles(p) {
  const out = [], b = brandOf(p);
  if (isHex(b.pal.c60)) out.push({id: 'kit', name: 'Kit de marca (ao vivo)', tk: brandTokens(p)});
  p.design.styles.filter(s => !s.kit).forEach(s => out.push({id: s.id, name: s.name, tk: s.tk}));
  out.push({id: 'neutral', name: 'Neutro (laranja e azul)', tk: LY_NEUTRAL()});
  return out;
}
const lyTokens = (p, id) => { const l = lyStyles(p); return (l.find(s => s.id === id) || l[0]).tk; };
const lyFamilies = tk => [tk.head.family, tk.body.family, 'Anton', 'DM Serif Display', 'Caveat', 'Archivo Black', 'Permanent Marker'];

function renderLayoutGallery(p, r) {
  const styles = lyStyles(p); if (!styles.some(s => s.id === lyState.style)) lyState.style = styles[0].id;
  const list = LAYOUTS.filter(l => (lyState.group === 'Todos' || l.group === lyState.group) && (!lyState.q || (l.name + ' ' + l.tags + ' ' + l.group).toLowerCase().includes(lyState.q.toLowerCase())));
  const cnt = g => LAYOUTS.filter(l => g === 'Todos' || l.group === g).length;
  r.innerHTML = `<div class="page-head"><div><h1>Modelos de layout</h1><p>${LAYOUTS.length} composições prontas. Escolha um modelo, preencha os textos e o Studio monta a peça com as cores e fontes do seu estilo ou Brand Kit. As áreas cinza são fotos ou sujeitos recortados: envie a sua imagem ou gere com IA.</p></div><div class="actions">${projectSelect()}<button class="btn" onclick="dzBack()">← Estúdio</button></div></div>
  <div class="panel"><div class="ly-bar"><div class="tchips">${['Todos', ...LAYOUT_GROUPS].map(g => `<button class="tchip ${lyState.group === g ? 'on' : ''}" onclick="lyState.group='${g}';renderDesign()">${g} <small>${cnt(g)}</small></button>`).join('')}</div>
    <div class="ly-tools"><input class="ly-search" placeholder="Buscar (ex.: oferta, depoimento, evento)" value="${esc(lyState.q)}" oninput="lyState.q=this.value;lySearchSoon()"><label class="ins inl">Estilo da prévia <select onchange="lyState.style=this.value;renderDesign()">${styles.map(s => `<option value="${esc(s.id)}" ${s.id === lyState.style ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label></div></div>
    ${list.length ? `<div class="ly-grid">${list.map(l => `<article class="ly-card" onclick="lyUseOpen('${l.id}')"><canvas data-lay="${l.id}" width="240" height="300"></canvas><strong>${esc(l.name)}</strong><small class="muted block">${esc(l.group)}</small></article>`).join('')}</div>` : emptyState('Nenhum modelo encontrado', 'Tente outra palavra ou escolha outro grupo.', '')}
    <p class="muted" style="font-size:11.5px;margin-top:12px">Layouts recriados como estrutura (posição, proporção e hierarquia). Nenhum texto, logo ou imagem dos posts de referência é usado. Fontes condensadas, serifadas e manuscritas dependem da internet para carregar.</p></div>`;
  lyPaint(p, r, list);
}
const lySearchSoon = debounce(() => { const i = document.querySelector('.ly-search'), pos = i ? i.selectionStart : 0; renderDesign(); const j = document.querySelector('.ly-search'); if (j) { j.focus(); j.setSelectionRange(pos, pos); } }, 250);
let lyToken = 0;
async function lyPaint(p, r, list) {
  const tok = ++lyToken, tk = lyTokens(p, lyState.style), fmt = FORMATS.feed45;
  await ensureFonts(lyFamilies(tk));
  const cvs = [...r.querySelectorAll('canvas[data-lay]')]; let n = 0;
  for (const cv of cvs) {
    if (tok !== lyToken || !cv.isConnected) return;
    try { const lay = layoutById(cv.dataset.lay), s = buildLayoutSlide(lay, tk, {}, fmt, p.name); LAYOUT_PREVIEW = true; try { renderSlide(cv.getContext('2d'), s, fmt.w, fmt.h, cv.width / fmt.w); } finally { LAYOUT_PREVIEW = false; } } catch (e) { console.warn('modelo', cv.dataset.lay, e); }
    if (++n % 6 === 0) await new Promise(res => setTimeout(res, 0));
  }
}
function dzLayoutsOpen() { dz.view = 'layouts'; go('design'); renderDesign(); }

/* ---- usar um modelo ---- */
let lyUse = null;
function lyUseOpen(id) {
  const p = dzP(), lay = layoutById(id); if (!lay) return;
  const styles = lyStyles(p); lyUse = {id, fmt: 'feed45', cw: 1080, ch: 1080, style: styles.some(s => s.id === lyState.style) ? lyState.style : styles[0].id};
  const f = lay.fields.map(k => { const v = Array.isArray(lay.sample[k]) ? lay.sample[k].join('\n') : (lay.sample[k] || ''), multi = ['title', 'sub', 'items'].includes(k);
    return `<div class="field"><label>${LY_LABEL[k] || k}</label>${multi ? `<textarea rows="${k === 'items' ? 5 : 2}" data-ly="${k}">${esc(v)}</textarea>` : `<input data-ly="${k}" value="${esc(v)}">`}</div>`; }).join('');
  showModal(esc(lay.name), `<p class="muted" style="margin-top:0;font-size:12px">${esc(lay.group)} · ${esc(lay.tags.split(' ').join(' · '))}</p>${f}
    <div class="ins-row"><label class="ins">Formato<select onchange="lyUse.fmt=this.value;$('lyCustom').style.display=this.value==='custom'?'flex':'none'">${fmtOptions('feed45')}</select></label><label class="ins">Estilo<select onchange="lyUse.style=this.value">${styles.map(s => `<option value="${esc(s.id)}" ${s.id === lyUse.style ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label></div>
    <div class="ins-row" id="lyCustom" style="display:none"><label class="ins">Largura<input type="number" min="64" max="4096" value="1080" onchange="lyUse.cw=+this.value"></label><label class="ins">Altura<input type="number" min="64" max="4096" value="1080" onchange="lyUse.ch=+this.value"></label></div>
    <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" id="lyGo" onclick="lyUseRun()">Criar peça e abrir o editor</button></div>`);
}
async function lyUseRun() {
  const p = dzP(), lay = layoutById(lyUse.id), btn = $('lyGo'); btn.disabled = true; btn.textContent = 'Montando…';
  const copy = {}; document.querySelectorAll('[data-ly]').forEach(el => { copy[el.dataset.ly] = el.value.trim(); });
  const tk = JSON.parse(JSON.stringify(lyTokens(p, lyUse.style))), fmt = resolveFmt(lyUse);
  try {
    await ensureFonts(lyFamilies(tk)); await brandFontsLoad(p);
    const set = layoutSetFrom(lay, tk, copy, fmt, p.name, lay.name + ' · ' + p.name); set.slides[0] = buildLayoutSlide(lay, tk, copy, fmt, p.name);
    await ensureSetResources(set);
    p.design.sets.push(set); persist(); closeModal(); dzOpen(set.id); toast('Peça criada. Troque textos, fotos e cores no editor.');
  } catch (e) { btn.disabled = false; btn.textContent = 'Criar peça e abrir o editor'; toast('Não consegui montar: ' + e.message); }
}
