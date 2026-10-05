/* Estúdio de Design — telas: início (estilos e peças), composição (cruzamento 30×30×30) e editor */
const dz = {view: 'home', cmp: null, setId: '', slide: 0, sel: '', hist: [], hi: -1, scale: 0.3, mode: 'select', drag: null, saveT: 0};
const FONT_LIST = Object.keys(FONT_META).sort();
const dzP = () => curProject();
const dzSet = () => { const p = dzP(); return p && p.design.sets.find(s => s.id === dz.setId); };
const dzSlide = () => { const s = dzSet(); return s && s.slides[Math.min(dz.slide, s.slides.length - 1)]; };
const dzLayer = () => { const s = dzSlide(); return s && s.layers.find(l => l.id === dz.sel); };

function renderDesign() {
  const p = dzP(), r = $('designRoot'); if (!p) { r.innerHTML = noProject('Estúdio de Design'); return; }
  if (dz.view === 'editor' && !dzSet()) dz.view = 'home';
  if (dz.view === 'home') return dzHome(p, r);
  if (dz.view === 'compose') return dzCompose(p, r);
  if (dz.view === 'variations') return renderVariations(p, r);
  if (dz.view === 'brand') return renderBrandKit(p, r);
  if (dz.view === 'logolab') return renderLogoLab(p, r);
  if (dz.view === 'layouts') return renderLayoutGallery(p, r);
  if (dz.view === 'fonts') return renderFontsPage(p, r);
  dzEditorShell(p, r);
}

/* ================= INÍCIO ================= */
function dzHome(p, r) {
  const {styles, sets} = p.design;
  r.innerHTML = `<div class="page-head"><div><h1>Estúdio de Design</h1><p>Cruze estilos de design, fontes e fotografia com o seu público, crie as peças e refine no editor. Salve o estilo e use em toda a campanha.</p></div><div class="actions">${projectSelect()}<button class="btn" onclick="dzTemplatesOpen()">★ Modelos salvos</button><button class="btn" onclick="dzLayoutsOpen()">▦ Modelos de layout</button><button class="btn" onclick="dzFontsOpen()">Aa Fontes e combinações</button><button class="btn" onclick="dzBrandOpen()">◈ Brand Kit</button><button class="btn" onclick="dzLogoOpen()">◇ Criar logo</button><button class="btn" onclick="dzLibrary('design')">Explorar biblioteca</button><button class="btn" onclick="dzVarOpen()">⚡ Fábrica de variações</button><button class="btn dark" onclick="dzNew()">＋ Nova composição</button></div></div>
  <div class="panel"><div class="section-row"><h3>Estilos de campanha salvos</h3><small class="muted">${styles.length} salvo(s)</small></div>
    ${styles.length ? `<div class="dz-styles">${styles.map(s => `<article class="dz-style"><div class="dz-sw">${[s.tk.bg, s.tk.fg, s.tk.accent, s.tk.muted].map(c => `<i style="background:${esc(c)}"></i>`).join('')}</div><strong>${esc(s.name)}</strong><small class="muted block">${esc(s.tk.head.family)} + ${esc(s.tk.body.family)} · ${esc((s.tk.photo || {}).name || 'foto')}</small><div class="row-gap" style="margin-top:8px"><button class="btn sm dark" onclick="dzNew('${s.id}')">Usar em nova peça</button><button class="btn sm" onclick="dzStyleDel('${s.id}')">×</button></div></article>`).join('')}</div>` : emptyState('Nenhum estilo salvo', 'Crie uma peça, refine no editor e use “Salvar como estilo” para reaproveitar em toda a campanha.')}</div>
  <div class="panel" style="margin-top:14px"><div class="section-row"><h3>Peças do projeto</h3><small class="muted">${sets.length} peça(s)</small></div>
    ${sets.length ? `<div class="dz-sets">${sets.map(s => `<article class="dz-set"><canvas class="dz-thumb" data-set="${s.id}" width="216" height="${Math.round(216 * s.format.h / s.format.w)}"></canvas><strong>${esc(s.name)}</strong><small class="muted block">${s.slides.length} slide(s) · ${esc(s.format.w + '×' + s.format.h)} · ${esc(s.tk.name || '')}</small><div class="row-gap" style="margin-top:8px"><button class="btn sm dark" onclick="dzOpen('${s.id}')">Abrir editor</button><button class="btn sm" onclick="dzDup('${s.id}')">Duplicar</button><button class="btn sm" onclick="dzResizeOpen('${s.id}')" title="Adaptar para outros tamanhos">⤢</button><button class="btn sm" onclick="dzSetDel('${s.id}')">×</button></div></article>`).join('')}</div>` : emptyState('Nenhuma peça ainda', 'Comece uma nova composição: o Studio cruza as bibliotecas com o seu público e gera o carrossel.', '<button class="btn dark" onclick="dzNew()">＋ Nova composição</button>')}</div>`;
  r.querySelectorAll('.dz-thumb').forEach(async cv => { const s = p.design.sets.find(x => x.id === cv.dataset.set); await ensureSetResources(s); renderSlide(cv.getContext('2d'), s.slides[0], s.format.w, s.format.h, cv.width / s.format.w); });
}
function dzNew(styleId) {
  const p = dzP(); dz.view = 'compose';
  const st = styleId && p.design.styles.find(x => x.id === styleId);
  dz.cmp = {name: '', text: '', aud: [], audTags: [], tone: [], fmt: 'feed45', results: [], pick: {design: 'neobrutal', font: 'poppins', photo: 'documental'}, tk: st ? JSON.parse(JSON.stringify(st.tk)) : null, styleName: st ? st.name : ''};
  if (st) { dz.cmp.pick = {design: st.tk.designId, font: st.tk.fontId, photo: st.tk.photoId}; }
  go('design');
}
function dzOpen(id) { dz.fromBook = dz.pendingFrom || ''; dz.pendingFrom = ''; dz.setId = id; dz.slide = 0; dz.sel = ''; dz.view = 'editor'; dz.hist = []; dz.hi = -1; dz.mode = 'select'; renderDesign(); }
function dzBack() { if (dz.fromBook && ebList().some(e => e.id === dz.fromBook)) { const id = dz.fromBook; dz.fromBook = ''; eui.id = id; eui.bt = 'capa'; edh.area = 'livros'; go('editora'); return; } dz.view = 'home'; renderDesign(); }
function dzDup(id) { const p = dzP(), s = JSON.parse(JSON.stringify(p.design.sets.find(x => x.id === id))); s.id = uid('ds'); s.name += ' (cópia)'; p.design.sets.push(s); persist(); renderDesign(); }
function dzSetDel(id) { if (!confirm('Excluir esta peça?')) return; const p = dzP(); p.design.sets = p.design.sets.filter(s => s.id !== id); persist(); renderDesign(); }
function dzStyleDel(id) { if (!confirm('Excluir este estilo salvo?')) return; const p = dzP(); p.design.styles = p.design.styles.filter(s => s.id !== id); persist(); renderDesign(); }

/* ================= BIBLIOTECA ================= */
function dzLibrary(kind) {
  const lists = {design: ['Estilos de design', DESIGN_STYLES], font: ['Fontes', FONT_PAIRS], photo: ['Fotografia', PHOTO_STYLES]};
  const [title, list] = lists[kind];
  if (kind === 'font') ensureFonts(FONT_PAIRS.flatMap(f => [f.head, f.body]));
  const card = it => kind === 'design' ? `<div class="lib-card" style="background:${it.bg};color:${it.fg}"><b style="color:${it.accent}">Aa</b><strong>${esc(it.name)}</strong><small>${it.tags.map(t => AUDIENCE_TAGS[t] || TONE_TAGS[t] || t).join(' · ')}</small></div>`
    : kind === 'font' ? `<div class="lib-card"><b style="font-family:'${it.head}';font-weight:${it.weight}">Aa Bb</b><strong>${esc(it.name)}</strong><small style="font-family:'${it.body}'">Texto de apoio da peça</small></div>`
    : `<div class="lib-card"><b style="filter:${it.filter}">◩</b><strong>${esc(it.name)}</strong><small>${esc(it.brief)}</small></div>`;
  showModal('Biblioteca · ' + title + ` (${list.length})`, `<div class="matrix-tabs" style="margin-bottom:10px">${[['design', 'Design'], ['font', 'Fontes'], ['photo', 'Fotografia']].map(([k, l]) => `<button class="${k === kind ? 'active' : ''}" onclick="dzLibrary('${k}')">${l}</button>`).join('')}</div><div class="lib-grid">${list.map(card).join('')}</div>`);
}

/* ================= COMPOSIÇÃO (cruzamento) ================= */
const DEFAULT_COPY = 'Seu financiamento subiu e ninguém explicou? | Entenda antes de pagar\nPor que a parcela muda: a correção segue um índice que você pode conferir.\nO que você pode revisar: juros, seguros e taxas do contrato.\nPrimeiro passo: junte o contrato e a última cobrança.\nQuer entender seu caso? | Falar no WhatsApp';
function dzCompose(p, r) {
  const c = dz.cmp, aud = c.aud.flatMap(id => AUDIENCE_PRESETS.find(a => a.id === id).tags).concat(c.audTags), tone = c.tone;
  const chips = (obj, sel, fn) => Object.entries(obj).map(([k, l]) => `<button class="tchip ${sel.includes(k) ? 'on' : ''}" onclick="${fn}('${k}')">${l}</button>`).join('');
  const D = byId(DESIGN_STYLES, c.pick.design), F = byId(FONT_PAIRS, c.pick.font), P = byId(PHOTO_STYLES, c.pick.photo);
  r.innerHTML = `<div class="page-head"><div><h1>Nova composição</h1><p>Conte o que a peça precisa dizer e para quem. O Studio cruza 30 estilos de design, 30 fontes e 30 estilos de fotografia.</p></div><div class="actions"><button class="btn" onclick="dzBack()">Cancelar</button></div></div>
  <div class="two dz-compose"><div class="panel"><h3>1. A peça</h3>
    <div class="field"><label>Nome da peça</label><input value="${esc(c.name)}" oninput="dz.cmp.name=this.value" placeholder="Ex.: Carrossel · Parcela subiu"></div>
    <div class="field" style="margin-top:8px"><label>Formato</label>${fmtPicker('cmp', c)}</div>
    <div class="field" style="margin-top:8px"><label>O que dizer <small class="muted">primeira linha = capa (“Título | subtítulo”) · do meio = slides (“Título: texto”) · última = chamada (“Título | botão”)</small></label><textarea id="dzText" class="jp-ta" rows="9" oninput="dz.cmp.text=this.value" placeholder="${esc(DEFAULT_COPY)}">${esc(c.text)}</textarea></div>
    <div class="row-gap" style="margin-top:8px"><button class="btn sm" onclick="dzUseConcept()">Usar conceito da Matriz</button><button class="btn sm" onclick="dzAICopy()">✦ Escrever com IA</button><button class="btn sm" onclick="dz.cmp.text=DEFAULT_COPY;renderDesign()">Texto de exemplo</button></div></div>
  <div class="panel"><h3>2. Para quem</h3><div class="okr-label">PÚBLICO</div><div class="tchips">${AUDIENCE_PRESETS.map(a => `<button class="tchip ${c.aud.includes(a.id) ? 'on' : ''}" onclick="dzTogAud('${a.id}')">${esc(a.label)}</button>`).join('')}</div>
    <div class="okr-label" style="margin-top:10px">AJUSTE FINO DO PÚBLICO</div><div class="tchips">${chips(AUDIENCE_TAGS, c.audTags, 'dzTogAudTag')}</div>
    <div class="okr-label" style="margin-top:10px">TOM</div><div class="tchips">${chips(TONE_TAGS, tone, 'dzTogTone')}</div>
    <div class="modal-actions" style="justify-content:flex-start"><button class="btn dark" onclick="dzCross()">⚡ Cruzar bibliotecas</button><small class="muted">${aud.length + tone.length ? '' : 'Escolha público e tom para o cruzamento.'}</small></div></div></div>
  ${c.results.length ? `<div class="panel" style="margin-top:14px"><h3>Composições recomendadas ${tag('recomendacao')}</h3><p class="muted" style="font-size:11px;margin-top:0">Pontuação por tags em comum com o público e o tom escolhidos. Escolha uma; você pode ajustar cada parte abaixo.</p><div class="dz-results">${c.results.map((x, i) => `<article class="dz-res ${x.design.id === c.pick.design && x.font.id === c.pick.font && x.photo.id === c.pick.photo ? 'on' : ''}" onclick="dzPick(${i})"><canvas data-i="${i}" width="200" height="250"></canvas><strong>${esc(x.design.name)}</strong><small class="muted block">${esc(x.font.name)}</small><small class="muted block">${esc(x.photo.name)}</small><div class="why">${x.why.slice(0, 5).map(t => `<span>${esc(AUDIENCE_TAGS[t] || TONE_TAGS[t] || t)}</span>`).join('')}</div></article>`).join('')}</div></div>` : ''}
  <div class="panel" style="margin-top:14px"><h3>3. Composição escolhida ${c.styleName ? `<small class="muted">· estilo salvo “${esc(c.styleName)}”</small>` : ''}</h3>
    <div class="form-grid"><div class="field"><label>Estilo de design (${DESIGN_STYLES.length})</label><select onchange="dzSelPick('design',this.value)">${DESIGN_STYLES.map(x => `<option value="${x.id}" ${x.id === c.pick.design ? 'selected' : ''}>${x.name}</option>`).join('')}</select></div>
      <div class="field"><label>Fonte (${FONT_PAIRS.length})</label><select onchange="dzSelPick('font',this.value)">${FONT_PAIRS.map(x => `<option value="${x.id}" ${x.id === c.pick.font ? 'selected' : ''}>${x.name}</option>`).join('')}</select></div>
      <div class="field"><label>Fotografia (${PHOTO_STYLES.length})</label><select onchange="dzSelPick('photo',this.value)">${PHOTO_STYLES.map(x => `<option value="${x.id}" ${x.id === c.pick.photo ? 'selected' : ''}>${x.name}</option>`).join('')}</select></div>
      <div class="field"><label>Direção de foto</label><input value="${esc(P.brief)}" readonly></div></div>
    <div class="row-gap" style="margin-top:10px"><canvas id="dzPrev" width="240" height="300" class="dz-prev"></canvas><div><div class="okr-label">PALETA (ajustável)</div><div class="row-gap">${[['bg', 'Fundo'], ['fg', 'Texto'], ['accent', 'Destaque'], ['muted', 'Apoio']].map(([k, l]) => `<label class="pal"><input type="color" value="${esc((c.tk || D)[k])}" onchange="dzPal('${k}',this.value)"><span>${l}</span></label>`).join('')}</div></div></div>
    <div class="modal-actions"><button class="btn orange" onclick="dzGenerate()">Gerar peças e abrir o editor</button></div></div>`;
  r.insertAdjacentHTML('beforeend', startersHTML(p)); startInit();
  dzDrawPrev(); r.querySelectorAll('.dz-res canvas').forEach(cv => dzDrawComp(cv, c.results[+cv.dataset.i]));
}
const tog = (arr, k) => { const i = arr.indexOf(k); if (i < 0) arr.push(k); else arr.splice(i, 1); };
function dzTogAud(id) { tog(dz.cmp.aud, id); renderDesign(); } function dzTogAudTag(k) { tog(dz.cmp.audTags, k); renderDesign(); } function dzTogTone(k) { tog(dz.cmp.tone, k); renderDesign(); }
function dzCross() {
  const c = dz.cmp, aud = c.aud.flatMap(id => AUDIENCE_PRESETS.find(a => a.id === id).tags).concat(c.audTags);
  if (!aud.length && !c.tone.length) { toast('Escolha ao menos um público ou um tom.'); return; }
  c.results = crossCompositions([...new Set(aud)], c.tone, 6); if (c.results[0]) { c.pick = {design: c.results[0].design.id, font: c.results[0].font.id, photo: c.results[0].photo.id}; c.tk = null; }
  renderDesign(); toast(c.results.length + ' composições recomendadas.');
}
function dzPick(i) { const x = dz.cmp.results[i]; dz.cmp.pick = {design: x.design.id, font: x.font.id, photo: x.photo.id}; dz.cmp.tk = null; dz.cmp.styleName = ''; renderDesign(); }
function dzSelPick(k, v) { dz.cmp.pick[k] = v; dz.cmp.tk = null; dz.cmp.styleName = ''; renderDesign(); }
function dzPal(k, v) { const c = dz.cmp; c.tk = c.tk || makeTokens(byId(DESIGN_STYLES, c.pick.design), byId(FONT_PAIRS, c.pick.font), byId(PHOTO_STYLES, c.pick.photo)); c.tk[k] = v; dzDrawPrev(); }
function dzTokens() { const c = dz.cmp; return c.tk || makeTokens(byId(DESIGN_STYLES, c.pick.design), byId(FONT_PAIRS, c.pick.font), byId(PHOTO_STYLES, c.pick.photo)); }
async function dzDrawComp(cv, x) {
  const tk = makeTokens(x.design, x.font, x.photo), set = buildSet('prev', tk, parseCopy(dz.cmp.text || DEFAULT_COPY, dzP()), FORMATS.feed45, dzP().name);
  await ensureFonts([x.font.head, x.font.body]); const t2 = buildSet('prev', tk, parseCopy(dz.cmp.text || DEFAULT_COPY, dzP()), FORMATS.feed45, dzP().name);
  if (cv.isConnected) renderSlide(cv.getContext('2d'), t2.slides[0], 1080, 1350, cv.width / 1080);
}
async function dzDrawPrev() {
  const cv = $('dzPrev'); if (!cv) return; const tk = dzTokens(); await ensureFonts([tk.head.family, tk.body.family]);
  const set = buildSet('prev', tk, parseCopy(dz.cmp.text || DEFAULT_COPY, dzP()), FORMATS.feed45, dzP().name); if (cv.isConnected) renderSlide(cv.getContext('2d'), set.slides[0], 1080, 1350, cv.width / 1080);
}
/* "Título | subtítulo" · "Título: texto" · "Título | botão" */
function parseCopy(text, p) {
  const lines = String(text || '').split('\n').map(s => s.trim()).filter(Boolean);
  const two = (s, sep) => { const i = s.indexOf(sep); return i < 0 ? [s, ''] : [s.slice(0, i).trim(), s.slice(i + sep.length).trim()]; };
  if (lines.length < 3) {
    const base = lines[0] ? two(lines[0], '|') : ['Título da peça', ''];
    return {cover: {kicker: p.name, title: base[0], sub: base[1]}, slides: [{title: 'O problema', body: p.brief.problem || 'Descreva o problema do público.'}, {title: 'O que muda', body: p.brief.offer || 'Explique a solução em uma frase.'}, {title: 'Como funciona', body: 'Mostre o caminho em passos simples.'}], cta: {title: 'Vamos conversar?', sub: '', button: 'Fale com a gente'}};
  }
  const [ct, cs] = two(lines[0], '|'), [at, ab] = two(lines[lines.length - 1], '|');
  return {cover: {kicker: p.name, title: ct, sub: cs}, slides: lines.slice(1, -1).map(l => { const [t, b] = two(l, ':'); return {title: t, body: b}; }), cta: {title: at, sub: '', button: ab || 'Fale com a gente'}};
}
function dzUseConcept() {
  const p = dzP(), list = shownConcepts(p).slice(0, 12); if (!list.length) { toast('Gere conceitos na Matriz primeiro.'); return; }
  showModal('Escolher conceito da Matriz', `<div class="list">${list.map(c => `<div class="list-item clickable" onclick="dzApplyConcept('${c.id}')"><div><strong>${esc(c.hook)} × ${esc(c.angle)}</strong><small>${esc(hookLine(p, c))}</small></div><span>→</span></div>`).join('')}</div>`);
}
function dzApplyConcept(id) {
  const p = dzP(), c = p.matrix.concepts.find(x => x.id === id), j = p.pre.journey;
  dz.cmp.text = `${hookLine(p, c)} | ${p.brand.positioning || p.desc || ''}\n${j[1].dor ? 'O problema: ' + j[1].dor : 'O problema: descreva a dor do público'}\n${j[3].desejo ? 'O que você quer: ' + j[3].desejo : 'O que você quer: descreva o desejo'}\n${j[2].confianca ? 'Por que confiar: ' + j[2].confianca : 'Por que confiar: mostre uma prova'}\n${c.cta} | ${(p.pre.icps[0] || {}).intent || 'Falar com a gente'}`;
  if (!dz.cmp.name) dz.cmp.name = `Carrossel · ${c.hook} × ${c.angle}`; closeModal(); renderDesign();
}
async function dzAICopy() {
  if (!aiReady()) { toast('IA não configurada. Veja Integrações. Dá para escrever os textos à mão.'); return; }
  const p = dzP();
  try {
    toast('Escrevendo…');
    const j = await aiJSON('Escreva os textos de um carrossel de Instagram em PT-BR, curtos e diretos, seguindo o Voice Brain. Sem promessas absolutas, sem inventar dados. Responda só JSON: {"cover":{"title","sub"},"slides":[{"title","body"}],"cta":{"title","button"}} com 3 a 5 slides.', projectContext(p) + '\nTema/ideia: ' + (dz.cmp.text || p.pre.objective || p.desc));
    dz.cmp.text = `${j.cover.title} | ${j.cover.sub || ''}\n` + (j.slides || []).map(s => `${s.title}: ${s.body}`).join('\n') + `\n${j.cta.title} | ${j.cta.button || 'Fale com a gente'}`; spendCredits(1); renderDesign(); toast('Textos sugeridos. Edite à vontade.');
  } catch (e) { toast('IA: ' + e.message); }
}
async function dzGenerate() {
  const p = dzP(), c = dz.cmp, tk = dzTokens(), fmt = resolveFmt(c); toast('Gerando peças…');
  await ensureFonts([tk.head.family, tk.body.family]);
  const set = buildSetAny(c.name.trim() || 'Carrossel ' + (p.design.sets.length + 1), tk, parseCopy(c.text || DEFAULT_COPY, p), fmt, p.name);
  p.design.sets.push(set); persist(); dzOpen(set.id);
}

/* ================= EDITOR ================= */
function dzEditorShell(p, r) {
  const s = dzSet();
  r.innerHTML = `<div class="dz-top"><button class="btn sm" onclick="dzBack()">${dz.fromBook ? '← Voltar ao e-book' : '← Estúdio'}</button>${typeof gridUI !== 'undefined' && gridUI.from ? '<button class="btn sm" onclick="gridBack()">← Grid</button>' : ''}${typeof feedUI !== 'undefined' && feedUI.from && feedUI.id ? '<button class="btn sm" onclick="feedUI.from=false;go(\'feed\')">← Feed</button>' : ''}<input class="dz-name" value="${esc(s.name)}" onchange="dzSet().name=this.value;persist()"><div class="row-gap"><button class="btn sm" onclick="dzUndo()" title="Desfazer (Ctrl+Z)">↶</button><button class="btn sm" onclick="dzRedo()" title="Refazer (Ctrl+Y)">↷</button>${histSelect()}<span class="dz-auto" id="dzAuto"></span>
    <button class="btn sm ${dz.mode === 'emphasis' ? 'dark' : ''}" onclick="dzModeEm()" title="Clique em palavras do texto para destacar">✦ Destacar por clique</button><button class="btn sm ${dz.mode === 'fmt' ? 'dark' : ''}" onclick="dzModeFmt()" title="Clique numa palavra do slide para formatar só ela (Shift estende)">✎ Formatar palavra</button>
    ${dzSet().deck ? '<button class="btn sm dark" onclick="dzPresentDeck()" title="Apresentar e baixar em HTML">▶ Apresentar</button>' : ''}<button class="btn sm" onclick="dzResizeOpen(dz.setId)" title="Adaptar esta arte para outras medidas">⤢ Tamanhos</button>
    <button class="btn sm" onclick="dzVarOpen(dz.setId)" title="Gerar variações desta peça">⚡ Variações</button><button class="btn sm" onclick="dzAddText()">＋ Texto</button><button class="btn sm" onclick="dzAddRect()">＋ Forma</button><button class="btn sm" onclick="dzAddLogo()">＋ Logo</button><button class="btn sm" onclick="dzAddImage()" title="Inserir imagem do seu computador">＋ Imagem</button><button class="btn sm" onclick="dzAddVideo()" title="Inserir vídeo: link do YouTube/Vimeo/mp4 ou arquivo">＋ Vídeo</button><button class="btn sm" onclick="dzAddPhoto()" title="Quadro de foto para enviar ou gerar com IA">＋ Foto</button><button class="btn sm" onclick="dzLayerDup()" title="Duplicar o elemento selecionado: texto, imagem, forma ou logo (Ctrl+D)">⧉ Duplicar</button>
    <button class="btn sm dark" id="dzSaveBtn" onclick="dzSaveNow()" title="Salvar agora (o editor também salva sozinho)">Salvar</button><button class="btn sm" onclick="pkgOpen({sets:[dzSet().id]})" title="Salva esta peça com imagens e fontes num arquivo para abrir em outro lugar">📦 Pacote</button><button class="btn sm" onclick="dzSaveTemplate()" title="Guardar esta peça ou apresentação como modelo">★ Modelo</button><button class="btn sm" onclick="dzSaveStyle()">Salvar como estilo</button><button class="btn sm" onclick="dzApplyStyleModal()">Aplicar estilo…</button><button class="btn sm" onclick="dzExportOne()">PNG</button><button class="btn sm" onclick="dzExportPDF()" title="PDF com uma página por slide">⬇ PDF</button><button class="btn sm" onclick="dzExportPSD()" title="Photoshop em camadas">PSD</button><button class="btn sm" onclick="dzExportLayers()" title="PNG por camada + manifesto">Camadas</button><button class="btn sm" onclick="flipRead('ds', dz.setId)" title="Folhear como livro, em tela cheia">📖 Folhear</button><button class="btn sm dark" onclick="dzExportAll()">Baixar todos (ZIP)</button></div></div>
  <div class="dz-editor"><div class="dz-slides" id="dzSlides"></div><div class="dz-stage" id="dzStage"><canvas id="dzCanvas"></canvas></div><div class="dz-insp" id="dzInsp"></div></div><input type="file" id="dzFile" accept="image/*" hidden>`;
  dzBindCanvas(); dzSlidesPanel(); dzInspector(); dzFit(); dzAutoUpdate(); ensureSetResources(s).then(() => { dzDraw(); dzSlidesPanel(); });
  if (dz.hist.length === 0) dzSnap();
}
function dzFit() {
  const s = dzSet(), st = $('dzStage'), cv = $('dzCanvas'); if (!s || !cv) return;
  const aw = Math.max(280, st.clientWidth - 40), ah = Math.max(300, window.innerHeight - 190);
  dz.scale = Math.min(aw / s.format.w, ah / s.format.h, 1);
  cv.width = s.format.w; cv.height = s.format.h; cv.style.width = Math.round(s.format.w * dz.scale) + 'px'; cv.style.height = Math.round(s.format.h * dz.scale) + 'px';
}
function dzDraw() {
  const s = dzSet(), sl = dzSlide(), cv = $('dzCanvas'); if (!s || !sl || !cv) return;
  const ctx = cv.getContext('2d'); renderSlide(ctx, sl, s.format.w, s.format.h, 1);
  const L = dzLayer(), b = L && LBOX[L.id];
  if (b) {
    ctx.save(); if (L.rot) { const cx = b.x + b.w / 2, cy = b.y + b.h / 2; ctx.translate(cx, cy); ctx.rotate(L.rot * Math.PI / 180); ctx.translate(-cx, -cy); }
    ctx.strokeStyle = '#2f6bff'; ctx.lineWidth = 3 / dz.scale; ctx.setLineDash([10 / dz.scale, 6 / dz.scale]); ctx.strokeRect(b.x, b.y, b.w, b.h); ctx.setLineDash([]);
    const hs = 22 / dz.scale; dzHandles(L, b).forEach(h => { ctx.fillStyle = '#fff'; ctx.strokeStyle = '#2f6bff'; ctx.lineWidth = 3 / dz.scale; ctx.fillRect(h.x - hs / 2, h.y - hs / 2, hs, hs); ctx.strokeRect(h.x - hs / 2, h.y - hs / 2, hs, hs); });
    ctx.restore();
  }
  if (dz.range && L && L.type === 'text' && dz.range.id === L.id && b && b.words) dzDrawRange(ctx, b);
  if (dz.mode === 'emphasis' || dz.mode === 'fmt') sl.layers.filter(l => l.type === 'text').forEach(l => (LBOX[l.id].words || []).forEach(w => { ctx.save(); ctx.strokeStyle = 'rgba(47,107,255,.35)'; ctx.lineWidth = 2 / dz.scale; ctx.strokeRect(w.x, w.y, w.w, w.h); ctx.restore(); }));
}
function dzSlidesPanel() {
  const s = dzSet(), el = $('dzSlides'); if (!s || !el) return;
  el.innerHTML = s.slides.map((sl, i) => `<div class="dz-sl ${i === dz.slide ? 'on' : ''}" onclick="dzGoSlide(${i})"><canvas width="108" height="${Math.round(108 * s.format.h / s.format.w)}" data-i="${i}"></canvas><span>${i + 1}</span></div>`).join('') +
    `<div class="row-gap" style="margin-top:8px"><button class="btn sm" onclick="dzSlideAdd()" title="Duplicar slide">＋</button><button class="btn sm" onclick="dzSlideMove(-1)">◀</button><button class="btn sm" onclick="dzSlideMove(1)">▶</button><button class="btn sm" onclick="dzSlideDel()">×</button></div>`;
  el.querySelectorAll('canvas').forEach(cv => renderSlide(cv.getContext('2d'), s.slides[+cv.dataset.i], s.format.w, s.format.h, cv.width / s.format.w));
}
function dzGoSlide(i) { dz.slide = i; dz.sel = ''; dzSlidesPanel(); dzInspector(); dzDraw(); }
function dzSlideAdd() { const s = dzSet(), c = JSON.parse(JSON.stringify(dzSlide())); c.id = sid(); c.layers.forEach(l => l.id = lid()); s.slides.splice(dz.slide + 1, 0, c); dz.slide++; dz.sel = ''; dzCommit(); dzSlidesPanel(); dzInspector(); dzDraw(); }
function dzSlideDel() { const s = dzSet(); if (s.slides.length < 2) { toast('A peça precisa de ao menos um slide.'); return; } if (!confirm('Excluir este slide?')) return; s.slides.splice(dz.slide, 1); dz.slide = Math.max(0, dz.slide - 1); dz.sel = ''; dzCommit(); dzSlidesPanel(); dzInspector(); dzDraw(); }
function dzSlideMove(d) { const s = dzSet(), j = dz.slide + d; if (j < 0 || j >= s.slides.length) return; [s.slides[dz.slide], s.slides[j]] = [s.slides[j], s.slides[dz.slide]]; dz.slide = j; dzCommit(); dzSlidesPanel(); dzDraw(); }

/* histórico e persistência */
/* histórico: 20, 40 ou 60 passos (preferência guardada neste navegador, vale para o editor e para o Laboratório do Logo) */
const HIST_OPTS = [20, 40, 60];
function histLimit() { try { const v = +localStorage.getItem('ampl_hist'); return HIST_OPTS.includes(v) ? v : 60; } catch (e) { return 60; } }
function histSetLimit(v) { v = +v; if (!HIST_OPTS.includes(v)) return; try { localStorage.setItem('ampl_hist', String(v)); } catch (e) { /* sem armazenamento */ }
  while (dz.hist.length > v + 1) { dz.hist.shift(); } dz.hi = Math.min(dz.hi, dz.hist.length - 1); if (typeof lgH !== 'undefined') { while (lgH.stack.length > v + 1) lgH.stack.shift(); lgH.i = Math.min(lgH.i, lgH.stack.length - 1); }
  dzAutoUpdate(); if (typeof lgBarUpdate === 'function') lgBarUpdate(); toast('Histórico: ' + v + ' passos.'); }
const histSelect = () => `<select class="hist-sel" onchange="histSetLimit(this.value)" title="Quantos passos o desfazer guarda">${HIST_OPTS.map(n => `<option value="${n}" ${n === histLimit() ? 'selected' : ''}>${n} passos</option>`).join('')}</select>`;
let AUTO_AT = 0; const autoTime = () => { const d = new Date(AUTO_AT || Date.now()); return d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit', second: '2-digit'}); };
function dzAutoUpdate() { const el = $('dzAuto'); if (el) el.innerHTML = `✓ Salvo automaticamente às ${autoTime()} · passo <b>${Math.max(0, dz.hi)}</b> de ${Math.max(0, dz.hist.length - 1)} <small>(máx. ${histLimit()})</small>`; }
function dzSnap() { const s = dzSet(); dz.hist = dz.hist.slice(0, dz.hi + 1); dz.hist.push(JSON.stringify(s.slides)); const lim = histLimit() + 1; while (dz.hist.length > lim) dz.hist.shift(); dz.hi = dz.hist.length - 1; }
function dzCommit() { const s = dzSet(); s.updated = new Date().toISOString(); dzSnap(); persist(); AUTO_AT = Date.now(); dzAutoUpdate(); }
function dzCommitSoon() { clearTimeout(dz.saveT); dz.saveT = setTimeout(() => { dzCommit(); dzSlidesPanel(); }, 400); }
function dzUndo() { if (dz.hi <= 0) return; dz.hi--; dzRestore(); } function dzRedo() { if (dz.hi >= dz.hist.length - 1) return; dz.hi++; dzRestore(); }
function dzRestore() { const s = dzSet(); s.slides = JSON.parse(dz.hist[dz.hi]); dz.slide = Math.min(dz.slide, s.slides.length - 1); if (!dzLayer()) dz.sel = ''; persist(); AUTO_AT = Date.now(); dzAutoUpdate(); ensureSetResources(s).then(() => { dzSlidesPanel(); dzInspector(); dzDraw(); }); }

/* interação no canvas */
function dzBindCanvas() {
  const cv = $('dzCanvas'); if (!cv) return;
  const pt = e => { const r = cv.getBoundingClientRect(); return {x: (e.clientX - r.left) / r.width * cv.width, y: (e.clientY - r.top) / r.height * cv.height}; };
  cv.addEventListener('pointerdown', e => {
    const s = dzSlide(), p = pt(e); cv.setPointerCapture(e.pointerId);
    if (dz.mode === 'fmt') {
      const L = [...s.layers].reverse().find(l => l.type === 'text' && !l.hidden && LBOX[l.id] && p.x >= LBOX[l.id].x && p.x <= LBOX[l.id].x + LBOX[l.id].w && p.y >= LBOX[l.id].y && p.y <= LBOX[l.id].y + LBOX[l.id].h);
      const w = L && LBOX[L.id].words.find(w => p.x >= w.x && p.x <= w.x + w.w && p.y >= w.y && p.y <= w.y + w.h);
      if (w) { dz.range = (e.shiftKey && dz.range && dz.range.id === L.id) ? {id: L.id, s: Math.min(dz.range.s, w.s), e: Math.max(dz.range.e, w.e)} : {id: L.id, s: w.s, e: w.e}; dz.sel = L.id; dzInspector(); dzDraw(); } return;
    }
    if (dz.mode === 'emphasis') {
      const L = [...s.layers].reverse().find(l => l.type === 'text' && LBOX[l.id] && p.x >= LBOX[l.id].x && p.x <= LBOX[l.id].x + LBOX[l.id].w && p.y >= LBOX[l.id].y && p.y <= LBOX[l.id].y + LBOX[l.id].h);
      const w = L && LBOX[L.id].words.find(w => p.x >= w.x && p.x <= w.x + w.w && p.y >= w.y && p.y <= w.y + w.h);
      if (w) { const old = plainOf(L.content); L.content = toggleWordEm(L.content, w.ord); if (L.spans) L.spans = remapSpans(old, plainOf(L.content), L.spans); dz.sel = L.id; dzDraw(); dzCommit(); dzInspector(); dzSlidesPanel(); } return;
    }
    const cur = dzLayer(), cb = cur && LBOX[cur.id], hh = cb && dzHandleAt(cur, cb, p);
    if (hh) { dz.drag = {t: 'resize', h: hh.k, o: {x: cur.x, y: cur.y, w: cur.w, hh: cb.h, size: cur.size, ls: cur.ls, blur: cur.blur, spans: cur.spans ? JSON.parse(JSON.stringify(cur.spans)) : null, hb: cur.h}, ch: false}; return; }
    const hit = [...s.layers].reverse().find(l => !l.hidden && LBOX[l.id] && p.x >= LBOX[l.id].x && p.x <= LBOX[l.id].x + LBOX[l.id].w && p.y >= LBOX[l.id].y && p.y <= LBOX[l.id].y + LBOX[l.id].h && !(l.role === 'overlay'));
    if (hit && e.altKey) {   // Alt + clique/arrasto: duplica o elemento e arrasta a cópia (o original fica no lugar)
      const c = JSON.parse(JSON.stringify(hit)); c.id = lid(); s.layers.splice(s.layers.indexOf(hit) + 1, 0, c); dz.sel = c.id; dz.range = null;
      dz.drag = {t: 'move', sx: p.x, sy: p.y, x: c.x, y: c.y, ch: true, dup: true, moved: false}; dzInspector(); dzDraw(); return;
    }
    if (hit) { dz.sel = hit.id; dz.drag = {t: 'move', sx: p.x, sy: p.y, x: hit.x, y: hit.y, ch: false}; } else dz.sel = '';
    dzInspector(); dzDraw();
  });
  cv.addEventListener('pointermove', e => {
    const L = dzLayer(), p = pt(e);
    if (!dz.drag) { const b = L && LBOX[L.id], h = b && dz.mode === 'select' && dzHandleAt(L, b, p); cv.style.cursor = h ? h.c : ''; return; }
    const d = dz.drag; if (!L) return; d.ch = true;
    if (d.t === 'move') { if (d.dup && Math.hypot(p.x - d.sx, p.y - d.sy) > 3 / dz.scale) d.moved = true; L.x = Math.round(d.x + p.x - d.sx); L.y = Math.round(d.y + p.y - d.sy); } else dzResize(L, d, p, e.shiftKey);
    dzDraw();
  });
  const end = () => { if (dz.drag && dz.drag.dup && !dz.drag.moved) { const L = dzLayer(); if (L) { L.x += 30; L.y += 30; dzDraw(); } }   // Alt+clique sem arrastar: cópia deslocada
    if (dz.drag && dz.drag.ch) { dzCommit(); dzInspector(); dzSlidesPanel(); } dz.drag = null; };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  cv.addEventListener('dblclick', e => {
    const p = pt(e), L = dzLayer(), b = L && L.type === 'text' && LBOX[L.id], w = b && b.words.find(w => p.x >= w.x && p.x <= w.x + w.w && p.y >= w.y && p.y <= w.y + w.h);
    if (w) { dz.range = {id: L.id, s: w.s, e: w.e}; dzInspector(); dzDraw(); return; }   // duplo clique numa palavra: seleciona para formatar
    const t = $('dzTxt'); if (t) { t.focus(); t.select(); }
  });
}

/* alças de redimensionamento: 4 cantos (proporcional; Shift = livre) + 4 lados (texto: só largura) */
const DZ_HND = [['nw', 0, 0, 'nwse-resize'], ['n', .5, 0, 'ns-resize'], ['ne', 1, 0, 'nesw-resize'], ['e', 1, .5, 'ew-resize'], ['se', 1, 1, 'nwse-resize'], ['s', .5, 1, 'ns-resize'], ['sw', 0, 1, 'nesw-resize'], ['w', 0, .5, 'ew-resize']];
function dzHandles(L, b) { return DZ_HND.filter(h => !(L.type === 'text' && (h[0] === 'n' || h[0] === 's'))).map(h => ({k: h[0], c: h[3], x: b.x + b.w * h[1], y: b.y + b.h * h[2]})); }
function dzLocal(L, b, p) { if (!L.rot) return p; const cx = b.x + b.w / 2, cy = b.y + b.h / 2, a = -L.rot * Math.PI / 180, dx = p.x - cx, dy = p.y - cy; return {x: cx + dx * Math.cos(a) - dy * Math.sin(a), y: cy + dx * Math.sin(a) + dy * Math.cos(a)}; }
function dzHandleAt(L, b, p) { const q = dzLocal(L, b, p), r = 24 / dz.scale; let best = null, bd = 1e9; dzHandles(L, b).forEach(h => { const dx = Math.abs(q.x - h.x), dy = Math.abs(q.y - h.y), dd = dx * dx + dy * dy; if (dx <= r && dy <= r && dd < bd) { best = h; bd = dd; } }); return best; }   // a alça mais próxima (caixas pequenas têm alças coladas)
function dzResize(L, d, p, free) {
  const o = d.o, k = d.h, b = {x: o.x, y: o.y, w: o.w, h: o.hh}, q = dzLocal({rot: L.rot}, b, p), isT = L.type === 'text';
  const left = k.includes('w'), right = k.includes('e'), top = k.includes('n'), bot = k.includes('s'), corner = k.length === 2;
  const fx = left ? o.x + o.w : o.x, fy = top ? o.y + b.h : o.y;               // âncora = lado/canto oposto (fica parado)
  let nw = o.w, nh = b.h;
  if (left || right) nw = Math.max(isT ? 60 : 20, left ? fx - q.x : q.x - fx);
  if (top || bot) nh = Math.max(20, top ? fy - q.y : q.y - fy);
  if (corner && (!free || isT)) {                                              // proporcional
    const kk = Math.max(isT ? .15 : 20 / Math.min(o.w, b.h), Math.max(nw / o.w, nh / b.h));
    nw = o.w * kk; nh = b.h * kk;
  }
  if (isT) {
    if (corner) { const kk = nw / o.w; L.size = Math.max(8, Math.round(o.size * kk * 10) / 10); L.ls = o.ls ? Math.round(o.ls * kk * 10) / 10 : o.ls; if (o.blur) L.blur = o.blur * kk; if (o.spans) L.spans.forEach((sp, i) => { const z = o.spans[i].st.size; if (z) sp.st.size = Math.round(z * kk * 10) / 10; }); }
    L.w = Math.round(nw);
  } else { L.w = Math.round(nw); L.h = Math.round(nh); }
  const ax = left ? 1 : 0, ay = top ? 1 : 0;                                   // novo canto superior esquerdo mantendo a âncora
  let nx = fx - (left ? nw : 0), ny = fy - (top ? nh : 0);
  if (!(left || right)) nx = o.x + (o.w - nw) / 2; if (!(top || bot)) ny = o.y + (b.h - nh) / 2;
  if (L.rot) {                                                                 // com rotação, mantém a âncora no mesmo ponto da tela
    const r = L.rot * Math.PI / 180, w2 = (cx, cy, x0, y0, w0, h0, ax0, ay0) => { const mx = x0 + w0 / 2, my = y0 + h0 / 2, px = x0 + w0 * ax0 - mx, py = y0 + h0 * ay0 - my; return {x: mx + px * Math.cos(r) - py * Math.sin(r), y: my + px * Math.sin(r) + py * Math.cos(r)}; };
    const fa = (left || right) ? (left ? 1 : 0) : .5, fb = (top || bot) ? (top ? 1 : 0) : .5;
    const w0 = w2(0, 0, o.x, o.y, o.w, b.h, fa, fb), w1 = w2(0, 0, nx, ny, nw, nh, fa, fb);
    nx += w0.x - w1.x; ny += w0.y - w1.y;
  }
  L.x = Math.round(nx); L.y = Math.round(ny);
}
document.addEventListener('keydown', e => {
  if (ui.page !== 'design' || dz.view !== 'editor') return; const tg = e.target.tagName; if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tg)) return;
  const L = dzLayer(), mod = e.ctrlKey || e.metaKey;
  if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? dzRedo() : dzUndo(); return; } if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); dzRedo(); return; }
  if (mod && e.key.toLowerCase() === 'c' && L) { dz.clip = JSON.parse(JSON.stringify(L)); toast('Elemento copiado. Use Ctrl+V em qualquer slide.'); return; }
  if (mod && e.key.toLowerCase() === 'v' && dz.clip) { e.preventDefault(); dzPaste(); return; }
  if (!L) return; const st = e.shiftKey ? 10 : 1;
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); dzLayerDel(); } else if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); dzLayerDup(); }
  else if (e.key.startsWith('Arrow')) { e.preventDefault(); if (e.key === 'ArrowLeft') L.x -= st; if (e.key === 'ArrowRight') L.x += st; if (e.key === 'ArrowUp') L.y -= st; if (e.key === 'ArrowDown') L.y += st; dzDraw(); dzCommitSoon(); dzInspector(); }
});
window.addEventListener('resize', () => { if (ui.page === 'design' && dz.view === 'editor') { dzFit(); dzDraw(); } });

/* camadas */
function dzAddText() { const s = dzSlide(), tk = dzSet().tk, L = T('body', {x: 90, y: 400, w: 900, content: 'Novo **texto**', size: 64}); themeLayer(L, tk); L.role = 'body'; s.layers.push(L); dz.sel = L.id; dzCommit(); dzInspector(); dzDraw(); dzSlidesPanel(); }
function dzAddRect() { const s = dzSlide(), L = RC('accent-fill', {x: 90, y: 300, w: 400, h: 200, fill: dzSet().tk.accent, radius: 16}); s.layers.push(L); dz.sel = L.id; dzCommit(); dzInspector(); dzDraw(); dzSlidesPanel(); }
function dzAddPhoto() { const s = dzSlide(), tk = dzSet().tk, f = dzSet().format, L = IM('photo', {x: 90, y: 200, w: f.w - 180, h: Math.round(f.h * 0.4), radius: tk.radius}); themeLayer(L, tk); s.layers.push(L); dz.sel = L.id; dzCommit(); dzInspector(); dzDraw(); dzSlidesPanel(); }
function dzLayerDel() { const s = dzSlide(); s.layers = s.layers.filter(l => l.id !== dz.sel); dz.sel = ''; dzCommit(); dzInspector(); dzDraw(); dzSlidesPanel(); }
function dzPaste() { const s = dzSlide(); if (!s || !dz.clip) return; const L = JSON.parse(JSON.stringify(dz.clip)); L.id = lid(); L.x += 24; L.y += 24; dz.clip.x += 24; dz.clip.y += 24; s.layers.push(L); dz.sel = L.id; dz.range = null; dzCommit(); dzInspector(); dzDraw(); dzSlidesPanel(); }
function dzLayerDup() { const s = dzSlide(), L = JSON.parse(JSON.stringify(dzLayer())); L.id = lid(); L.x += 30; L.y += 30; s.layers.push(L); dz.sel = L.id; dzCommit(); dzInspector(); dzDraw(); dzSlidesPanel(); }
function dzLayerMove(d) { const s = dzSlide(), i = s.layers.findIndex(l => l.id === dz.sel), j = i + d; if (j < 0 || j >= s.layers.length) return; [s.layers[i], s.layers[j]] = [s.layers[j], s.layers[i]]; dzCommit(); dzDraw(); dzSlidesPanel(); }
function dzModeEm() { dz.mode = dz.mode === 'emphasis' ? 'select' : 'emphasis'; renderDesign(); toast(dz.mode === 'emphasis' ? 'Clique em uma palavra para destacar ou remover o destaque.' : 'Modo seleção.'); }

/* inspetor */
function dzProp(k, v, num) { const L = dzLayer(); if (!L) return; L[k] = num ? +v : v; dzDraw(); dzCommitSoon(); }
function dzSlideBg(v) { dzSlide().bg = v; dzDraw(); dzCommitSoon(); }
function dzInspector() {
  const el = $('dzInsp'); if (!el) return; const L = dzLayer(), sl = dzSlide();
  if (!L) { el.innerHTML = `<h3>Slide ${dz.slide + 1}</h3><label class="ins">Cor de fundo<input type="color" value="${esc(sl.bg)}" oninput="dzSlideBg(this.value)"></label><p class="muted" style="font-size:11px">Clique em um elemento da peça para editar. Arraste para mover, use o quadrado azul para redimensionar, setas para ajustar e Delete para remover.</p><small class="muted">Estilo: ${esc(dzSet().tk.name || '')}</small>`; return; }
  const n = (k, l, min, max, step) => `<label class="ins">${l}<input type="number" min="${min}" max="${max}" step="${step || 1}" value="${Math.round(L[k] * 100) / 100}" onchange="dzProp('${k}',this.value,1);dzInspector()"></label>`;
  const rg = (k, l, min, max, step) => `<label class="ins">${l} <b>${L[k]}</b><input type="range" min="${min}" max="${max}" step="${step}" value="${L[k]}" oninput="dzProp('${k}',this.value,1);this.previousElementSibling.textContent=this.value"></label>`;
  const col = (k, l) => `<label class="ins">${l}<input type="color" value="${esc(String(L[k] || '#000000').startsWith('#') ? L[k] : '#000000')}" oninput="dzProp('${k}',this.value)"></label>`;
  const geo = `<div class="ins-row">${n('x', 'X', -2000, 4000)}${n('y', 'Y', -2000, 4000)}${n('w', 'Largura', 20, 4000)}${L.type !== 'text' ? n('h', 'Altura', 20, 4000) : ''}</div>`;
  const acts = brandSwatches(L) + `<div class="row-gap" style="margin-top:10px"><button class="btn sm" onclick="dzLayerMove(1)">▲ Frente</button><button class="btn sm" onclick="dzLayerMove(-1)">▼ Trás</button><button class="btn sm" onclick="dzLayerDup()">Duplicar</button><button class="btn sm" onclick="dzLayerDel()">Excluir</button></div>`;
  if (L.type === 'text') el.innerHTML = `<h3>Texto <small class="muted">${esc(L.role)}</small></h3>
    <textarea id="dzTxt" class="jp-ta" rows="4" oninput="dzTxtInput(this.value)" onselect="dzTxtSel()" onkeyup="dzTxtSel()" onmouseup="dzTxtSel()">${esc(L.content)}</textarea>
    <div id="dzRng">${dzRangeHTML(L)}</div>
    <div class="row-gap" style="margin:6px 0"><button class="btn sm" onclick="dzEmSel()" title="Selecione palavras no texto acima">Destacar seleção</button><button class="btn sm" onclick="dzEmClear()">Limpar destaques</button></div><small class="muted">Use **palavra** para destacar. Ou ative “Destacar por clique” no topo.</small>
    <h4>Texto inteiro</h4><button class="btn sm" style="margin-bottom:6px" onclick="fbOpen(f => dzFont(f), (dzLayer() || {}).family)">Aa Ver fontes e escolher</button><label class="ins">Fonte<select onchange="dzFont(this.value)">${fontChoices().map(f => `<option ${f === L.family ? 'selected' : ''}>${esc(f)}</option>`).join('')}</select></label>
    <div class="ins-row"><label class="ins">Peso<select onchange="dzProp('weight',this.value,1)">${[300, 400, 500, 600, 700, 800, 900].map(w => `<option ${w == L.weight ? 'selected' : ''}>${w}</option>`).join('')}</select></label>${col('color', 'Cor')}</div>
    ${rg('size', 'Tamanho', 16, 320, 1)}${rg('lh', 'Entrelinha', 0.8, 2, 0.05)}${rg('ls', 'Espaçamento', -4, 24, 0.5)}
    <div class="row-gap"><button class="btn sm ${L.align === 'left' ? 'dark' : ''}" onclick="dzProp('align','left');dzInspector()">⟸</button><button class="btn sm ${L.align === 'center' ? 'dark' : ''}" onclick="dzProp('align','center');dzInspector()">☰</button><button class="btn sm ${L.align === 'right' ? 'dark' : ''}" onclick="dzProp('align','right');dzInspector()">⟹</button><label class="ins inl"><input type="checkbox" ${L.upper ? 'checked' : ''} onchange="dzProp('upper',this.checked);dzInspector()"> CAIXA ALTA</label></div>
    <h4>Destaque das palavras</h4><label class="ins">Estilo<select onchange="dzProp('emMode',this.value)">${[['color', 'Cor'], ['bg', 'Marca-texto'], ['bold', 'Negrito'], ['scale', 'Maior'], ['underline', 'Sublinhado']].map(([v, l]) => `<option value="${v}" ${v === L.emMode ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <div class="ins-row">${col('emColor', 'Cor')}${col('emBg', 'Fundo')}${col('emText', 'Texto')}</div>${rg('emScale', 'Escala (modo maior)', 1, 2, 0.05)}${rg('opacity', 'Opacidade', 0, 1, 0.05)}<h4>Posição e tamanho</h4>${geo}<h4>Camada</h4>${acts}`;
  else if (L.type === 'rect') el.innerHTML = `<h3>Forma <small class="muted">${esc(L.role)}</small></h3><div class="ins-row">${col('fill', 'Cor')}${col('stroke', 'Borda')}</div>${rg('radius', 'Cantos', 0, 400, 1)}${rg('strokeW', 'Espessura da borda', 0, 30, 1)}${rg('opacity', 'Opacidade', 0, 1, 0.05)}<h4>Posição e tamanho</h4>${geo}<h4>Camada</h4>${acts}`;
  else if (L.type === 'path') el.innerHTML = `<h3>Símbolo <small class="muted">${esc(L.role)}</small></h3><div class="ins-row">${col('fill', 'Cor')}${col('stroke', 'Contorno')}</div>${rg('opacity', 'Opacidade', 0, 1, 0.05)}<h4>Posição e tamanho</h4>${geo}<h4>Camada</h4>${acts}`;
  else if (L.type === 'video') el.innerHTML = dzVideoInspector(L, geo, acts);
  else if (L.role === 'logo') el.innerHTML = `<h3>Logo</h3><small class="muted block">Arraste e use as alças para redimensionar. Mantenha a proporção.</small>${rg('opacity', 'Opacidade', 0, 1, 0.05)}<h4>Posição e tamanho</h4>${geo}<h4>Camada</h4>${acts}`;
  else el.innerHTML = `<h3>Foto</h3><button class="btn sm dark" onclick="dzPickPhoto()">${L.imgId ? 'Trocar foto' : 'Enviar foto'}</button> <button class="btn sm" onclick="dzLibPhoto()">📚 Biblioteca</button> <button class="btn sm" onclick="dzStockPhoto()" title="Banco de imagens (Magnific)">🔎 Banco</button> ${L.imgId && stockReady() ? '<button class="btn sm" onclick="dzUpscalePhoto()" title="Aumentar a resolução (Magnific)">⤴ Melhorar</button>' : ''}<button class="btn sm" onclick="dzGenPhoto()" title="${imageReady() ? 'Gerar com IA' : 'Configure OPENAI_API_KEY no servidor'}">✦ Gerar com IA</button> ${L.imgId ? '<button class="btn sm" onclick="dzProp(\'imgId\',\'\')">Remover</button>' : ''}
    <label class="ins">Tratamento (${PHOTO_STYLES.length} estilos)<select onchange="dzPhotoStyle(this.value)"><option value="">Sem tratamento</option>${PHOTO_STYLES.map(x => `<option value="${x.id}" ${L.filter === x.filter && L.ovColor === x.ovColor ? 'selected' : ''}>${x.name}</option>`).join('')}</select></label>
    <small class="muted block">${esc(L.brief || '')}</small>${rg('radius', 'Cantos', 0, 400, 1)}${rg('fx', 'Enquadrar na horizontal', 0, 1, 0.01)}${rg('fy', 'Enquadrar na vertical', 0, 1, 0.01)}${rg('opacity', 'Opacidade', 0, 1, 0.05)}<h4>Posição e tamanho</h4>${geo}<h4>Camada</h4>${acts}`;
}
function dzModeFmt() { dz.mode = dz.mode === 'fmt' ? 'select' : 'fmt'; renderDesign(); toast(dz.mode === 'fmt' ? 'Clique numa palavra para formatar só ela. Shift+clique estende. Para letras, selecione no campo de texto.' : 'Modo de seleção.'); }
const hexOr = (v, d) => /^#[0-9a-f]{6}$/i.test(String(v || '')) ? v : d;
/* ---- formatação de trecho (letras ou palavras) ---- */
function dzTxtInput(v) {
  const L = dzLayer(); if (!L) return; const old = plainOf(L.content); L.content = v;
  if (L.spans) { L.spans = remapSpans(old, plainOf(v), L.spans); if (!L.spans.length) delete L.spans; }
  dz.range = null; dzDraw(); dzCommitSoon(); const r = $('dzRng'); if (r) r.innerHTML = dzRangeHTML(L);
}
function dzTxtSel() {
  const t = $('dzTxt'), L = dzLayer(); if (!t || !L) return; const a = t.selectionStart, b = t.selectionEnd;
  const nr = a === b ? null : {id: L.id, s: rawToPlain(t.value, a), e: rawToPlain(t.value, b)};
  if (JSON.stringify(nr) === JSON.stringify(dz.range)) return; dz.range = nr; dzRangeRefresh();
}
function dzRangeRefresh() { const L = dzLayer(), r = $('dzRng'); if (r) r.innerHTML = dzRangeHTML(L); dzDraw(); }
function dzRangeValid(L) { const rg = dz.range; if (!L || L.type !== 'text' || !rg || rg.id !== L.id) return null; const n = plainOf(L.content).length, s = Math.max(0, rg.s), e = Math.min(n, rg.e); return e > s ? {s, e} : null; }
function dzRangeHTML(L) {
  const hint = '<small class="muted block" style="margin:8px 0">Selecione letras ou palavras no campo acima (ou use “✎ Formatar palavra” e clique no slide; duplo clique também seleciona uma palavra) para mudar tamanho, cor, fonte, peso e maiúsculas só nelas.</small>';
  const rg = dzRangeValid(L); if (!rg) return hint;
  const plain = plainOf(L.content), sty = (spanStyles(L, plain.length) || []).slice(rg.s, rg.e), seg = sty.length ? sty : [], uni = k => { const v0 = seg[0] && seg[0][k]; return seg.every(x => (x && x[k]) === v0) ? v0 : undefined; };
  const size = uni('size'), color = uni('color'), fam = uni('family'), wt = uni('weight'), tr = uni('tr'), it = uni('italic'), sel = plain.slice(rg.s, rg.e).replace(/\n/g, ' ');
  return `<div class="rng"><h4>Seleção: “${esc(sel.length > 34 ? sel.slice(0, 34) + '…' : sel)}” <small class="muted">${rg.e - rg.s} caractere(s)</small></h4>
    <div class="ins-row"><label class="ins">Tamanho<input type="number" min="8" max="600" step="2" value="${size || ''}" placeholder="${Math.round(L.size)}" onchange="dzRangeProp('size',this.value===''?'':+this.value)"></label>
    <label class="ins">Cor<span class="rng-col"><input type="color" value="${hexOr(color, hexOr(L.color, '#000000'))}" oninput="dzRangeProp('color',this.value,true)" onchange="dzRangeProp('color',this.value)"><button class="btn sm" onclick="dzRangeProp('color','')" title="Voltar à cor do texto">↺</button></span></label></div>
    <label class="ins">Fonte<select onchange="dzRangeProp('family',this.value)"><option value="">(a do texto)</option>${fontChoices().map(f => `<option ${f === fam ? 'selected' : ''}>${esc(f)}</option>`).join('')}</select></label>
    <div class="ins-row"><label class="ins">Peso<select onchange="dzRangeProp('weight',this.value===''?'':+this.value)"><option value="">(o do texto)</option>${[300, 400, 500, 600, 700, 800, 900].map(w => `<option ${w === wt ? 'selected' : ''}>${w}</option>`).join('')}</select></label>
    <label class="ins">Caixa<select onchange="dzRangeProp('tr',this.value)">${[['', 'Como está'], ['upper', 'MAIÚSCULAS'], ['lower', 'minúsculas'], ['title', 'Primeira Maiúscula']].map(([v, l]) => `<option value="${v}" ${(tr || '') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
    <label class="ins inl"><input type="checkbox" ${it ? 'checked' : ''} onchange="dzRangeProp('italic',this.checked?true:'')"> Itálico</label>
    <div class="row-gap"><button class="btn sm" onclick="dzRangeClear()">Limpar formatação da seleção</button><button class="btn sm" onclick="dz.range=null;dzRangeRefresh()">Desmarcar</button></div></div>`;
}
async function dzRangeProp(k, v, quiet) {
  const L = dzLayer(), rg = dzRangeValid(L); if (!rg) return;
  if (k === 'family' && v) await ensureFont(v);
  applySpanProps(L, rg.s, rg.e, {[k]: v}); dzDraw(); dzCommitSoon(); if (!quiet) dzRangeRefresh();
}
function dzRangeClear() { const L = dzLayer(), rg = dzRangeValid(L); if (!rg) return; applySpanProps(L, rg.s, rg.e, {size: '', color: '', family: '', weight: '', tr: '', italic: ''}); dzDraw(); dzCommitSoon(); dzRangeRefresh(); }
function dzDrawRange(ctx, b) {
  const L = dzLayer(), rg = dzRangeValid(L); if (!rg) return; ctx.save(); ctx.fillStyle = 'rgba(47,107,255,.22)'; ctx.strokeStyle = 'rgba(47,107,255,.8)'; ctx.lineWidth = 2 / dz.scale;
  b.words.forEach(w => { if (w.e <= rg.s || w.s >= rg.e) return; (w.runs || []).forEach(r => {
    const a = Math.max(r.s, rg.s), z = Math.min(r.e, rg.e); if (z <= a) return; let x0 = r.x, x1 = r.x + r.w;
    if (r.t !== undefined && (a > r.s || z < r.e)) { MEAS.font = r.font; if (MEAS.letterSpacing !== undefined) MEAS.letterSpacing = (+L.ls || 0) + 'px'; x0 = r.x + MEAS.measureText(r.t.slice(0, a - r.s)).width; x1 = r.x + MEAS.measureText(r.t.slice(0, z - r.s)).width; }
    ctx.fillRect(x0, w.y, Math.max(2, x1 - x0), w.h); ctx.strokeRect(x0, w.y, Math.max(2, x1 - x0), w.h); }); });
  ctx.restore();
}
async function dzFont(f) { await ensureFont(f); dzProp('family', f); }
function dzEmSel() { const t = $('dzTxt'), L = dzLayer(); if (!t || t.selectionStart === t.selectionEnd) { toast('Selecione palavras no texto.'); return; } const a = t.value.slice(0, t.selectionStart), m = t.value.slice(t.selectionStart, t.selectionEnd), z = t.value.slice(t.selectionEnd); L.content = a + '**' + m.replace(/\*\*/g, '') + '**' + z; t.value = L.content; dzDraw(); dzCommitSoon(); }
function dzEmClear() { const L = dzLayer(); L.content = L.content.replace(/\*\*/g, ''); dzInspector(); dzDraw(); dzCommitSoon(); }
function dzPhotoStyle(id) { const L = dzLayer(), x = byId(PHOTO_STYLES, id); Object.assign(L, x ? {filter: x.filter, ovColor: x.ovColor, ovMode: x.ovMode, brief: x.brief} : {filter: '', ovColor: '', ovMode: ''}); dzDraw(); dzCommitSoon(); }
function dzGenPhoto() {
  if (!imageReady()) { toast(needsLogin() ? 'Entre no Studio para gerar imagens.' : 'Geração de imagem indisponível: configure OPENAI_API_KEY em api/config.php no servidor.'); return; }
  const L = dzLayer(), p = dzP(), has = !!L.imgId;
  const base = [L.brief || 'fotografia profissional de publicidade', p.brand && p.brand.visual ? 'identidade visual: ' + p.brand.visual : '', p.name ? 'marca/negócio: ' + p.name : '', 'sem texto, sem logotipos, sem marcas d’água; espaço limpo para receber título'].filter(Boolean).join('. ');
  showModal('✦ Gerar foto com IA', `<div class="field"><label>O que a imagem deve mostrar</label><textarea id="gpPrompt" rows="5">${esc(base)}</textarea></div>
    <div class="ins-row"><label class="ins">Qualidade<select id="gpQ"><option value="low">Rascunho (mais barata)</option><option value="medium" selected>Média</option><option value="high">Alta (mais cara)</option></select></label></div>
    ${has ? '<label class="ins inl"><input type="checkbox" id="gpRef" checked> Usar a foto atual como referência (preserva o produto/pessoa)</label>' : ''}
    <small class="muted block">Cada geração consome créditos da sua conta OpenAI (o valor depende da qualidade; veja a tabela de preços deles). O servidor limita imagens por hora e por dia.</small>
    <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" id="gpGo" onclick="dzGenPhotoRun()">Gerar</button></div>`);
}
async function dzGenPhotoRun() {
  const L = dzLayer(), btn = $('gpGo'), prompt = $('gpPrompt').value.trim(), q = $('gpQ').value, useRef = $('gpRef') && $('gpRef').checked;
  if (!prompt) { toast('Descreva a imagem.'); return; }
  btn.disabled = true; btn.textContent = 'Gerando…';
  try {
    const refs = []; if (useRef && L.imgId) { const b = await imgGet(L.imgId); if (b) refs.push(await blobToDataURL(b)); }
    const full = refs.length ? prompt + '. Use a imagem de referência como única fonte da verdade do produto/pessoa: não altere formas, cores, rótulos nem proporções.' : prompt;
    const ratio = L.w / L.h, size = ratio > 1.2 ? 'landscape' : ratio < 0.83 ? 'portrait' : 'square';
    const blob = await generateImage({prompt: full, size, quality: q, refs});
    const bmp = await createImageBitmap(blob), id = uid('img'); await imgPut(id, blob); IMGS.set(id, bmp);
    L.imgId = id; closeModal(); dzDraw(); dzCommit(); dzInspector(); dzSlidesPanel(); toast('Foto gerada e aplicada.');
  } catch (e) { btn.disabled = false; btn.textContent = 'Gerar'; toast(e.message); }
}
function dzPickPhoto() { const f = $('dzFile'); f.onchange = async () => { const file = f.files[0]; f.value = ''; if (!file) return; let bmp; try { bmp = await createImageBitmap(file); } catch (e) { toast('Não consegui ler essa imagem. Use PNG, JPG ou WebP válidos.'); return; } const id = uid('img'); await imgPut(id, file); IMGS.set(id, bmp); const L = dzLayer(); L.imgId = id; dzDraw(); dzCommit(); dzInspector(); dzSlidesPanel(); }; f.click(); }

/* estilos e exportação */
function dzSaveStyle() { askText('Salvar como estilo', 'Nome do estilo (ex.: Campanha trabalhador de escritório)', name => { const p = dzP(), tk = extractStyle(dzSet()); tk.name = name; p.design.styles.push({id: uid('st'), name, tk, created: new Date().toISOString()}); persist(); toast('Estilo salvo. Use em toda a campanha.'); }); }
function dzApplyStyleModal() {
  const p = dzP(), list = p.design.styles; if (!list.length) { toast('Salve um estilo primeiro.'); return; }
  showModal('Aplicar estilo', `<p class="muted" style="margin-top:0;font-size:12px">O estilo troca cores, fontes, destaque e tratamento de foto por papel (título, texto, destaque). Posições e textos não mudam.</p><div class="list">${list.map(s => `<div class="list-item"><div><strong>${esc(s.name)}</strong><small>${esc(s.tk.head.family)} + ${esc(s.tk.body.family)}</small></div><div class="row-gap"><button class="btn sm dark" onclick="dzApplyStyle('${s.id}',false)">Esta peça</button><button class="btn sm" onclick="dzApplyStyle('${s.id}',true)">Todas as peças</button></div></div>`).join('')}</div>`);
}
async function dzApplyStyle(id, all) {
  const p = dzP(), st = p.design.styles.find(s => s.id === id), sets = all ? p.design.sets : [dzSet()];
  await ensureFonts([st.tk.head.family, st.tk.body.family]);
  sets.forEach(s => applyStyleToSet(s, JSON.parse(JSON.stringify(st.tk)))); persist(); closeModal(); dzSnap(); dzSlidesPanel(); dzInspector(); dzDraw(); toast(all ? `Estilo aplicado a ${sets.length} peça(s).` : 'Estilo aplicado.');
}
async function dzExportOne() { const s = dzSet(), b = await slideBlob(s, dzSlide()); download(`${slug(s.name)}-${String(dz.slide + 1).padStart(2, '0')}.png`, b, 'image/png'); }
async function dzExportAll() { toast('Gerando ZIP…'); const s = dzSet(); download(`${slug(s.name)}.zip`, await exportSetZip(s), 'application/zip'); }

async function dzExportPSD() { const s = dzSet(); toast('Gerando PSD…'); download(`${slug(s.name)}-${String(dz.slide + 1).padStart(2, '0')}.psd`, await buildPSD(s, dzSlide()), 'image/vnd.adobe.photoshop'); toast('PSD gerado. O texto vai como camada raster (não editável como texto).'); }
async function dzExportLayers() { const s = dzSet(); toast('Gerando camadas…'); download(`${slug(s.name)}-${String(dz.slide + 1).padStart(2, '0')}-camadas.zip`, await buildLayersZip(s, dzSlide()), 'application/zip'); }
