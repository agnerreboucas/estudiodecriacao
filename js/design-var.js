/* Fábrica de variações: a partir de UM anúncio (ou do zero) gera dezenas de variações combinando
   textos soltos (headlines, apoios, CTAs) × estilos × layouts. O desempenho real volta e reordena as próximas levas. */
dz.vf = null;
const VF_DEFAULT = () => ({mode: 'slide', setId: '', slideIdx: 0, fmt: 'square', layouts: ['auto'], h: '', s: '', c: '', keepBase: true, saved: [], aud: [], tone: [], crossN: 3, randomN: 3, n: 30, batchId: '', filter: 'all', imgId: ''});
const lineList = t => [...new Set(String(t || '').split('\n').map(x => x.trim()).filter(Boolean))];

function dzVarOpen(setId) {
  const p = dzP(), bank = p.design.bank || (p.design.bank = {h: [], s: [], c: []});
  dz.vf = Object.assign(VF_DEFAULT(), {h: bank.h.join('\n'), s: bank.s.join('\n'), c: bank.c.join('\n')});
  const set = setId ? p.design.sets.find(s => s.id === setId) : p.design.sets[0];
  if (set) { dz.vf.setId = set.id; dz.vf.slideIdx = setId && setId === dz.setId ? dz.slide : 0; dz.vf.fmt = set.format.id; dz.vf.cw = set.format.w; dz.vf.ch = set.format.h; } else dz.vf.mode = 'build';
  dz.view = 'variations'; go('design');
}
/* em "a partir de uma peça", só varia o que a base tem: sem botão, CTA não muda nada; sem texto de apoio, idem */
function vfUses(p) { const b = dz.vf.mode === 'slide' && vfBaseSlide(p); if (!b) return {s: true, c: true}; const has = r => b.slide.layers.some(l => l.type === 'text' && l.role === r && l.content); return {s: has('body'), c: has('cta-text')}; }
function vfBaseSlide(p) { const s = p.design.sets.find(x => x.id === dz.vf.setId); return s && {set: s, slide: s.slides[Math.min(dz.vf.slideIdx, s.slides.length - 1)]}; }

/* ---------- configuração ---------- */
function renderVariations(p, r) {
  const v = dz.vf; if (!v) return dzBack();
  const batch = v.batchId && p.design.batches.find(b => b.id === v.batchId); if (batch) return vfResults(p, r, batch);
  const base = vfBaseSlide(p), aud = v.aud.flatMap(id => AUDIENCE_PRESETS.find(a => a.id === id).tags), H = lineList(v.h).length, us = vfUses(p), S = us.s ? lineList(v.s).length : 0, C = us.c ? lineList(v.c).length : 0;
  const nStyles = vfTokens(p, true).length, nLay = v.mode === 'build' ? v.layouts.length : 1, combos = Math.max(1, H) * Math.max(1, S) * Math.max(1, C) * Math.max(1, nStyles) * nLay * 2;
  const chip = (obj, sel, fn) => Object.entries(obj).map(([k, l]) => `<button class="tchip ${sel.includes(k) ? 'on' : ''}" onclick="${fn}('${k}')">${l}</button>`).join('');
  r.innerHTML = `<div class="page-head"><div><h1>Fábrica de variações</h1><p>Pegue um anúncio e gere dezenas de versões: textos soltos × estilos × layouts. O desempenho real reordena as próximas levas.</p></div><div class="actions">${projectSelect()}<button class="btn" onclick="dzBack()">Voltar</button></div></div>
  <div class="two dz-compose"><div class="panel"><h3>1. Anúncio base</h3>
    <div class="matrix-tabs" style="margin:8px 0"><button class="${v.mode === 'slide' ? 'active' : ''}" onclick="dz.vf.mode='slide';renderDesign()">A partir de uma peça</button><button class="${v.mode === 'build' ? 'active' : ''}" onclick="dz.vf.mode='build';renderDesign()">Do zero</button></div>
    ${v.mode === 'slide' ? (p.design.sets.length ? `<div class="form-grid"><div class="field"><label>Peça</label><select onchange="dz.vf.setId=this.value;dz.vf.slideIdx=0;renderDesign()">${p.design.sets.map(s => `<option value="${s.id}" ${s.id === v.setId ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div><div class="field"><label>Slide</label><select onchange="dz.vf.slideIdx=+this.value;renderDesign()">${(base ? base.set.slides : []).map((_, i) => `<option value="${i}" ${i === v.slideIdx ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></div></div><canvas id="vfBase" width="200" height="${base ? Math.round(200 * base.set.format.h / base.set.format.w) : 250}" class="dz-prev" style="margin-top:8px"></canvas><p class="muted" style="font-size:11px">Os elementos ficam onde estão; troca-se o texto e o estilo por papel (título, apoio, botão, destaque, foto).${!us.c ? ' <b>Esta peça não tem botão: os CTAs serão ignorados.</b> Escolha um slide com botão (o último) ou use “Do zero”.' : ''}${!us.s ? ' <b>Sem texto de apoio nesta peça: os apoios serão ignorados.</b>' : ''}</p>` : emptyState('Nenhuma peça ainda', 'Crie uma peça no Estúdio ou use “Do zero”.'))
      : `<div class="field"><label>Formato</label>${fmtPicker('vf', v)}</div><div class="okr-label" style="margin-top:10px">LAYOUTS</div><div class="tchips">${Object.entries(Object.assign({auto: 'Do estilo'}, AD_LAYOUTS)).map(([k, l]) => `<button class="tchip ${v.layouts.includes(k) ? 'on' : ''}" onclick="vfTogLayout('${k}')">${l}</button>`).join('')}</div>${vfLayoutPicker(v)}`}
    <div class="row-gap" style="margin-top:10px"><button class="btn sm" onclick="vfPhotoPick()">${v.imgId ? 'Trocar foto' : 'Foto para todas (opcional)'}</button>${v.imgId ? '<small class="muted">foto aplicada às áreas de foto</small>' : ''}</div></div>
  <div class="panel"><h3>2. Textos soltos <small class="muted">um por linha</small></h3>
    <div class="field"><label>Headlines (${H})</label><textarea class="jp-ta" rows="5" oninput="dz.vf.h=this.value;vfCount()" placeholder="Seu financiamento subiu e ninguém explicou?&#10;A parcela mudou. Você sabe por quê?&#10;Antes de pagar mais, confira isto">${esc(v.h)}</textarea></div>
    <div class="field" style="margin-top:6px"><label>Textos de apoio (${S})</label><textarea class="jp-ta" rows="3" oninput="dz.vf.s=this.value;vfCount()" placeholder="Entenda antes de pagar&#10;Análise sem compromisso">${esc(v.s)}</textarea></div>
    <div class="field" style="margin-top:6px"><label>CTAs (${C})</label><textarea class="jp-ta" rows="3" oninput="dz.vf.c=this.value;vfCount()" placeholder="Falar no WhatsApp&#10;Quero conferir meu contrato">${esc(v.c)}</textarea></div>
    <div class="row-gap" style="margin-top:8px"><button class="btn sm" onclick="vfFromBase()">Usar texto da peça base</button><button class="btn sm" onclick="vfFromMatrix()">Importar hooks da Matriz</button><button class="btn sm" onclick="vfAI()">✦ Variar com IA</button></div></div></div>
  <div class="panel" style="margin-top:14px"><h3>3. Estilos</h3><div class="two"><div>
    ${v.mode === 'slide' ? `<label class="chk-line"><input type="checkbox" ${v.keepBase ? 'checked' : ''} onchange="dz.vf.keepBase=this.checked;renderDesign()"> Manter o estilo da peça base</label>` : ''}
    <div class="okr-label" style="margin-top:8px">ESTILOS SALVOS</div>${p.design.styles.length ? `<div class="tchips">${p.design.styles.map(s => `<button class="tchip ${v.saved.includes(s.id) ? 'on' : ''}" onclick="vfTogSaved('${s.id}')">${esc(s.name)}</button>`).join('')}</div>` : '<small class="muted">Nenhum estilo salvo.</small>'}
    <div class="okr-label" style="margin-top:10px">ALEATÓRIOS DA BIBLIOTECA (30×30×30)</div><label class="ins">Quantidade <b>${v.randomN}</b><input type="range" min="0" max="30" value="${v.randomN}" oninput="dz.vf.randomN=+this.value;this.previousElementSibling.textContent=this.value;vfCount()"></label><div class="row-gap"><button class="btn sm" onclick="dz.vf.randomN=30;renderDesign()" title="Usa os 30 estilos da biblioteca de uma vez">Todos os 30 estilos</button><button class="btn sm" onclick="dz.vf.randomN=0;renderDesign()">Nenhum</button></div></div></div>
    <div><div class="okr-label">CRUZAR POR PÚBLICO E TOM</div><div class="tchips">${AUDIENCE_PRESETS.map(a => `<button class="tchip ${v.aud.includes(a.id) ? 'on' : ''}" onclick="vfTogAud('${a.id}')">${esc(a.label)}</button>`).join('')}</div><div class="tchips" style="margin-top:8px">${chip(TONE_TAGS, v.tone, 'vfTogTone')}</div>
      <label class="ins">Composições do cruzamento <b>${v.crossN}</b><input type="range" min="0" max="6" value="${v.crossN}" oninput="dz.vf.crossN=+this.value;this.previousElementSibling.textContent=this.value;vfCount()"></label></div></div></div>
  <div class="panel" style="margin-top:14px"><div class="section-row"><div><h3>4. Gerar</h3><p class="muted" id="vfInfo" style="font-size:11px;margin:0">${H || '1'} headline(s) × ${S || '1'} apoio(s) × ${C || '1'} CTA(s) × ${nStyles} estilo(s)${v.mode === 'build' ? ' × ' + nLay + ' layout(s)' : ''} × 2 destaques = ${fmtNum(combos)} combinações possíveis</p></div>
    <div class="row-gap"><label class="ins inl">Quantas <b>${v.n}</b><input type="range" min="6" max="100" value="${v.n}" oninput="dz.vf.n=+this.value;this.previousElementSibling.textContent=this.value"></label><button class="btn orange" onclick="vfGenerate()">⚡ Gerar variações</button></div></div></div><input type="file" id="vfFile" accept="image/*" hidden>`;
  vfDrawBase(base);
}
async function vfDrawBase(base) { const cv = $('vfBase'); if (!cv || !base) return; await ensureSetResources(base.set); if (cv.isConnected) renderSlide(cv.getContext('2d'), base.slide, base.set.format.w, base.set.format.h, cv.width / base.set.format.w); }
function vfCount() { const el = $('vfInfo'); if (!el) return; const p = dzP(), v = dz.vf, us = vfUses(p), H = lineList(v.h).length, S = us.s ? lineList(v.s).length : 0, C = us.c ? lineList(v.c).length : 0, ns = vfTokens(p, true).length, nl = v.mode === 'build' ? v.layouts.length : 1; el.textContent = `${H || 1} headline(s) × ${S || 1} apoio(s) × ${C || 1} CTA(s) × ${ns} estilo(s)${v.mode === 'build' ? ' × ' + nl + ' layout(s)' : ''} × 2 destaques = ${fmtNum(Math.max(1, H) * Math.max(1, S) * Math.max(1, C) * Math.max(1, ns) * nl * 2)} combinações possíveis`; }
/* os modelos de layout da galeria (${LAYOUTS.length}) entram como dimensão da fábrica: chave 'ly:<id>' */
function vfLayoutPicker(v) {
  const sel = v.layouts.filter(k => k.startsWith('ly:')).length;
  return `<div class="okr-label" style="margin-top:14px">MODELOS DE LAYOUT DA GALERIA (${LAYOUTS.length}) · ${sel} marcado(s)</div>
  <div class="row-gap" style="margin:6px 0"><button class="btn sm" onclick="vfLyAll(true)">Todos</button><button class="btn sm" onclick="vfLyAll(false)">Nenhum</button>${LAYOUT_GROUPS.map(g => `<button class="btn sm" onclick="vfLyGroup('${g}')">${esc(g)}</button>`).join('')}</div>
  <div class="tchips" style="max-height:170px;overflow:auto">${LAYOUTS.map(l => `<button class="tchip ${v.layouts.includes('ly:' + l.id) ? 'on' : ''}" onclick="vfTogLayout('ly:${l.id}')">${esc(l.name)}</button>`).join('')}</div>`;
}
function vfLyAll(on) { const v = dz.vf; v.layouts = v.layouts.filter(k => !k.startsWith('ly:')); if (on) LAYOUTS.forEach(l => v.layouts.push('ly:' + l.id)); if (!v.layouts.length) v.layouts = ['auto']; v.layouts = v.layouts.filter(k => k !== 'auto' || !v.layouts.some(x => x.startsWith('ly:'))); renderDesign(); }
function vfLyGroup(g) { const v = dz.vf, ids = LAYOUTS.filter(l => l.group === g).map(l => 'ly:' + l.id), all = ids.every(k => v.layouts.includes(k)); v.layouts = v.layouts.filter(k => !ids.includes(k) && k !== 'auto'); if (!all) v.layouts.push(...ids); if (!v.layouts.length) v.layouts = ['auto']; renderDesign(); }
function vfTogLayout(k) { tog(dz.vf.layouts, k); if (k !== 'auto' && dz.vf.layouts.includes('auto') && dz.vf.layouts.length > 1) dz.vf.layouts = dz.vf.layouts.filter(x => x !== 'auto'); if (!dz.vf.layouts.length) dz.vf.layouts = ['auto']; renderDesign(); }
function vfTogSaved(id) { tog(dz.vf.saved, id); renderDesign(); } function vfTogAud(id) { tog(dz.vf.aud, id); renderDesign(); } function vfTogTone(k) { tog(dz.vf.tone, k); renderDesign(); }
function vfPhotoPick() { const f = $('vfFile'); f.onchange = async () => { const file = f.files[0]; f.value = ''; if (!file) return; let bmp; try { bmp = await createImageBitmap(file); } catch (e) { toast('Não consegui ler essa imagem.'); return; } const id = uid('img'); await imgPut(id, file); IMGS.set(id, bmp); dz.vf.imgId = id; renderDesign(); }; f.click(); }
function vfFromBase() {
  const b = vfBaseSlide(dzP()); if (!b) { toast('Escolha uma peça base.'); return; } const g = role => { const L = b.slide.layers.find(l => l.type === 'text' && l.role === role && l.content); return L ? L.content.replace(/\*\*/g, '') : ''; };
  const add = (k, t) => { if (t) dz.vf[k] = lineList(dz.vf[k] + '\n' + t).join('\n'); }; add('h', g('title')); add('s', g('body')); add('c', g('cta-text')); renderDesign();
}
function vfFromMatrix() { const p = dzP(), list = shownConcepts(p).slice(0, 12); if (!list.length) { toast('Gere conceitos na Matriz primeiro.'); return; } dz.vf.h = lineList(dz.vf.h + '\n' + list.map(c => hookLine(p, c)).join('\n')).join('\n'); renderDesign(); toast(list.length + ' hooks importados.'); }
async function vfAI() {
  if (!aiReady()) { toast('IA não configurada. Veja Integrações. Você pode escrever as variações à mão.'); return; }
  const p = dzP(), seed = lineList(dz.vf.h)[0] || (vfBaseSlide(p) ? (vfBaseSlide(p).slide.layers.find(l => l.role === 'title') || {content: ''}).content.replace(/\*\*/g, '') : '') || p.pre.objective;
  try {
    toast('Criando variações…');
    const j = await aiJSON('Crie variações de um anúncio em PT-BR seguindo o Voice Brain. Varie o ângulo (pergunta, alerta, número, prova, benefício, urgência) sem inventar dados nem fazer promessas absolutas. Headlines até 12 palavras. Responda só JSON: {"headlines":["..."],"subs":["..."],"ctas":["..."]} com 10 headlines, 4 subs e 4 ctas.', projectContext(p) + '\nAnúncio base (headline): ' + seed);
    const add = (k, arr) => { dz.vf[k] = lineList(dz.vf[k] + '\n' + (arr || []).map(String).join('\n')).join('\n'); }; add('h', j.headlines); add('s', j.subs); add('c', j.ctas); spendCredits(1); renderDesign(); toast('Variações de texto adicionadas. Revise.');
  } catch (e) { toast('IA: ' + e.message); }
}

/* ---------- estilos do lote ---------- */
function vfTokens(p, countOnly) {
  const v = dz.vf, list = [], seen = new Set(), add = (tk, label) => { const k = tk.designId + '|' + tk.fontId + '|' + tk.photoId + '|' + tk.accent + '|' + tk.bg; if (seen.has(k)) return; seen.add(k); list.push(Object.assign(JSON.parse(JSON.stringify(tk)), {name: tk.name || label})); };
  const base = v.mode === 'slide' && vfBaseSlide(p); if (base && v.keepBase) add(base.set.tk, 'Estilo da peça');
  v.saved.forEach(id => { const s = p.design.styles.find(x => x.id === id); if (s) add(s.tk, s.name); });
  const aud = v.aud.flatMap(id => AUDIENCE_PRESETS.find(a => a.id === id).tags);
  if (v.crossN && (aud.length || v.tone.length)) crossCompositions([...new Set(aud)], v.tone, v.crossN).forEach(c => add(makeTokens(c.design, c.font, c.photo), c.design.name));
  for (let i = 0; i < v.randomN; i++) { const d = DESIGN_STYLES[(i * 7 + 3 + (v.n || 0)) % 30], f = FONT_PAIRS[(i * 11 + 5) % 30], ph = PHOTO_STYLES[(i * 13 + 2) % 30]; add(makeTokens(d, f, ph), d.name); }
  if (!list.length && !countOnly) add(base ? base.set.tk : makeTokens(byId(DESIGN_STYLES, 'pop'), byId(FONT_PAIRS, 'poppins'), byId(PHOTO_STYLES, 'documental')), 'Estilo padrão');
  return list;
}

/* ---------- geração ---------- */
async function vfGenerate() {
  const p = dzP(), v = dz.vf, us = vfUses(p), bank = {h: lineList(v.h), s: us.s ? lineList(v.s) : [], c: us.c ? lineList(v.c) : []}, base = v.mode === 'slide' && vfBaseSlide(p);
  if (v.mode === 'slide' && !base) { toast('Escolha uma peça base ou use “Do zero”.'); return; }
  if (v.mode === 'build' && !bank.h.length) { toast('Escreva ao menos uma headline.'); return; }
  const toks = vfTokens(p), W = learnDesign(p).map, fmt = v.mode === 'slide' ? base.set.format : resolveFmt(v);
  const H = bank.h.length || 1, S = bank.s.length || 1, C = bank.c.length || 1, T = toks.length, L = v.mode === 'build' ? v.layouts.length : 1, total = H * S * C * T * L * 2, pool = [], seen = new Set();
  const w = (k, val) => (W[k + '|' + val] == null ? 50 : W[k + '|' + val]);
  const mk = (h, s, c, t, l, e) => { const tk = toks[t], dims = {design: tk.designId, font: tk.fontId, photo: tk.photoId, cta: bank.c[c] || '', layout: v.mode === 'build' ? v.layouts[l] : ''}; return {id: uid('v'), h, s, c, t, l, em: e ? 'alt' : 'auto', fav: false, sent: '', dims, score: (w('design', dims.design) + w('font', dims.font) + w('photo', dims.photo) + w('cta', dims.cta)) / 4 + Math.random() * 10}; };
  if (total <= 6000) { for (let h = 0; h < H; h++) for (let s = 0; s < S; s++) for (let c = 0; c < C; c++) for (let t = 0; t < T; t++) for (let l = 0; l < L; l++) for (let e = 0; e < 2; e++) pool.push(mk(h, s, c, t, l, e)); }
  else for (let g = 0; g < 6000 && pool.length < 3000; g++) { const a = [Math.floor(Math.random() * H), Math.floor(Math.random() * S), Math.floor(Math.random() * C), Math.floor(Math.random() * T), Math.floor(Math.random() * L), Math.random() < 0.5 ? 0 : 1], k = a.join(); if (!seen.has(k)) { seen.add(k); pool.push(mk(...a)); } }
  /* diversidade: nenhuma headline nem estilo domina o lote */
  pool.sort((a, b) => b.score - a.score);
  const picked = [], cnt = {h: {}, t: {}}, capH = Math.ceil(v.n / H) + 1, capT = Math.ceil(v.n / T) + 1;
  for (const it of pool) { if (picked.length >= v.n) break; if ((cnt.h[it.h] || 0) >= capH || (cnt.t[it.t] || 0) >= capT) continue; picked.push(it); cnt.h[it.h] = (cnt.h[it.h] || 0) + 1; cnt.t[it.t] = (cnt.t[it.t] || 0) + 1; }
  for (const it of pool) { if (picked.length >= v.n) break; if (!picked.includes(it)) picked.push(it); }
  const batch = {id: uid('vb'), name: 'Lote ' + (p.design.batches.length + 1) + ' · ' + new Date().toLocaleDateString('pt-BR'), created: new Date().toISOString(), mode: v.mode, fmt: {id: fmt.id, w: fmt.w, h: fmt.h}, brand: p.name, base: base ? cloneSlide(base.slide) : null, bank, tokens: toks, layouts: v.layouts.slice(), imgId: v.imgId, learned: Object.keys(W).length > 0, items: picked};
  p.design.bank = {h: lineList(v.h), s: lineList(v.s), c: lineList(v.c)}; p.design.batches.push(batch); v.batchId = batch.id; persist(); renderDesign(); toast(`${picked.length} variações geradas${batch.learned ? ' (ordenadas pelos pesos aprendidos)' : ''}.`);
}
async function vfSlide(batch, item) {
  await ensureFonts(batch.tokens.flatMap(t => [t.head.family, t.body.family]));
  const tk = batch.tokens[item.t], texts = {h: batch.bank.h[item.h], s: batch.bank.s[item.s], c: batch.bank.c[item.c]}, fmt = batch.fmt; let sl;
  if (batch.mode === 'slide') sl = variantFromBase(batch.base, tk, texts, item.em, fmt);
  else if (String(batch.layouts[item.l]).startsWith('ly:') && layoutById(batch.layouts[item.l].slice(3))) {
    const lay = layoutById(batch.layouts[item.l].slice(3)), q = dzP(); await ensureFonts(lyFamilies(tk)); if (typeof brandFontsLoad === 'function') await brandFontsLoad(q);
    sl = buildLayoutSlide(lay, tk, {title: autoEmphasis(texts.h || 'Título', item.em), sub: texts.s || '', button: texts.c || ''}, fmt, batch.brand);
  } else sl = slideAd(tk, {kicker: '', title: autoEmphasis(texts.h || 'Título', item.em), sub: texts.s || '', button: texts.c || ''}, fmt, batch.brand, batch.layouts[item.l]);
  if (batch.imgId) sl.layers.forEach(l => { if (l.type === 'image' && l.role === 'photo') l.imgId = batch.imgId; });
  return sl;
}

/* ---------- resultados ---------- */
function vfResults(p, r, b) {
  const v = dz.vf, view = b.items.filter(i => v.filter === 'fav' ? i.fav : v.filter === 'sel' ? i.sel : true), nSel = b.items.filter(i => i.sel).length, nFav = b.items.filter(i => i.fav).length;
  r.innerHTML = `<div class="page-head"><div><h1>${esc(b.name)}</h1><p>${b.items.length} variações · ${b.tokens.length} estilo(s) · ${b.bank.h.length || 1} headline(s). ${b.learned ? 'Ordenadas pelos pesos aprendidos do seu desempenho real.' : 'Ainda sem dados de desempenho: a ordem usa só diversidade.'}</p></div><div class="actions">${projectSelect()}<button class="btn" onclick="dz.vf.batchId='';renderDesign()">Ajustar e gerar de novo</button><button class="btn" onclick="dzBack()">Estúdio</button></div></div>
  <div class="vf-bar"><div class="matrix-tabs">${[['all', 'Todas (' + b.items.length + ')'], ['fav', '★ Favoritas (' + nFav + ')'], ['sel', 'Selecionadas (' + nSel + ')']].map(([k, l]) => `<button class="${v.filter === k ? 'active' : ''}" onclick="dz.vf.filter='${k}';renderDesign()">${l}</button>`).join('')}</div>
    <div class="row-gap"><button class="btn sm" onclick="vfSelAll('${b.id}')">Selecionar visíveis</button><button class="btn sm" onclick="vfExportZip('${b.id}')">PNG (ZIP)</button><button class="btn sm dark" onclick="vfSend('${b.id}')">Enviar ${nSel || ''} para aprovação</button></div></div>
  <div class="vf-grid">${view.map(it => { const tk = b.tokens[it.t]; return `<article class="vf-card ${it.sel ? 'sel' : ''}"><canvas data-id="${it.id}" width="220" height="${Math.round(220 * b.fmt.h / b.fmt.w)}"></canvas><div class="vf-meta"><b>${esc((b.bank.h[it.h] || '').replace(/\*\*/g, '').slice(0, 54))}</b><small>${esc(tk.name)}${it.dims.cta ? ' · ' + esc(it.dims.cta) : ''}</small></div><div class="row-gap"><label class="vf-sel"><input type="checkbox" ${it.sel ? 'checked' : ''} onchange="vfSel('${b.id}','${it.id}',this.checked)"></label><button class="btn sm ${it.fav ? 'dark' : ''}" onclick="vfFav('${b.id}','${it.id}')" title="Favoritar">★</button><button class="btn sm" onclick="vfEdit('${b.id}','${it.id}')">Editar</button><button class="btn sm" onclick="vfPsd('${b.id}','${it.id}')">PSD</button>${it.sent ? '<span class="itag itag-decisao">ENVIADA</span>' : ''}</div></article>`; }).join('') || emptyState('Nada neste filtro', 'Favorite ou selecione variações para vê-las aqui.')}</div>`;
  vfPaint(b, view);
}
async function vfPaint(b, view) {
  const cvs = [...document.querySelectorAll('.vf-card canvas')]; let n = 0;
  for (const cv of cvs) { const it = b.items.find(i => i.id === cv.dataset.id); if (!it || !cv.isConnected) continue; try { const sl = await vfSlide(b, it); await Promise.all(sl.layers.filter(l => l.imgId).map(l => loadImage(l.imgId))); if (cv.isConnected) renderSlide(cv.getContext('2d'), sl, b.fmt.w, b.fmt.h, cv.width / b.fmt.w); } catch (e) { /* mantém vazio */ } if (++n % 6 === 0) await new Promise(r => setTimeout(r, 0)); }
}
const vfBatch = id => dzP().design.batches.find(b => b.id === id), vfItem = (bid, id) => vfBatch(bid).items.find(i => i.id === id);
function vfFav(bid, id) { const i = vfItem(bid, id); i.fav = !i.fav; persist(); renderDesign(); }
function vfSel(bid, id, on) { vfItem(bid, id).sel = on; persist(); const b = vfBatch(bid); const el = document.querySelector(`.vf-card canvas[data-id="${id}"]`); if (el) el.closest('.vf-card').classList.toggle('sel', on); document.querySelectorAll('.vf-bar .matrix-tabs button')[2].textContent = `Selecionadas (${b.items.filter(i => i.sel).length})`; }
function vfSelAll(bid) { const b = vfBatch(bid); [...document.querySelectorAll('.vf-card canvas')].forEach(cv => { vfItem(bid, cv.dataset.id).sel = true; }); persist(); renderDesign(); }
function vfTargets(b) { const s = b.items.filter(i => i.sel); return s.length ? s : (b.items.filter(i => i.fav).length ? b.items.filter(i => i.fav) : b.items); }
async function vfToSet(b, it, name) { const sl = await vfSlide(b, it), tk = JSON.parse(JSON.stringify(b.tokens[it.t])); return {id: uid('ds'), name, format: b.fmt, tk, slides: [sl], created: new Date().toISOString(), updated: new Date().toISOString()}; }
async function vfEdit(bid, id) { const p = dzP(), b = vfBatch(bid), it = vfItem(bid, id), set = await vfToSet(b, it, 'Variação · ' + (b.bank.h[it.h] || '').replace(/\*\*/g, '').slice(0, 30)); p.design.sets.push(set); persist(); dzOpen(set.id); }
async function vfPsd(bid, id) { const b = vfBatch(bid), it = vfItem(bid, id), set = await vfToSet(b, it, 'variacao'); toast('Gerando PSD…'); download(`variacao-${slug((b.bank.h[it.h] || 'anuncio').replace(/\*\*/g, '')).slice(0, 40)}.psd`, await buildPSD(set, set.slides[0]), 'image/vnd.adobe.photoshop'); }
async function vfExportZip(bid) {
  const b = vfBatch(bid), list = vfTargets(b), files = []; toast(`Gerando ${list.length} PNG…`);
  for (let i = 0; i < list.length; i++) { const set = await vfToSet(b, list[i], 'v'); files.push({name: `variacao-${String(i + 1).padStart(3, '0')}.png`, data: new Uint8Array(await (await slideBlob(set, set.slides[0])).arrayBuffer())}); }
  download(`${slug(b.name)}.zip`, makeZip(files), 'application/zip');
}
function vfSend(bid) {
  const p = dzP(), b = vfBatch(bid), list = b.items.filter(i => i.sel && !i.sent); if (!list.length) { toast('Selecione variações (ainda não enviadas) para a aprovação.'); return; }
  list.forEach(it => {
    const tk = b.tokens[it.t], title = (b.bank.h[it.h] || b.name).replace(/\*\*/g, ''), cr = {id: uid('c'), projectId: p.id, title: title.slice(0, 60), type: 'Anúncio (variação)', cls: 'a4', status: 'Para aprovação', brief: `${tk.name}${it.dims.cta ? ' · CTA: ' + it.dims.cta : ''}`, dims: it.dims, varRef: {batch: b.id, item: it.id}, created: new Date().toISOString()};
    state.creatives.unshift(cr); addApproval(p, cr.title, 'Criativo', 'creative', cr.id); it.sent = cr.id;
  });
  persist(); renderDesign(); toast(`${list.length} variação(ões) na fila de Aprovação.`);
}

/* ---------- aprendizado: o desempenho real de cada variação volta como peso ---------- */
function learnDesign(p) {
  const agg = {}, nm = {design: id => (byId(DESIGN_STYLES, id) || {}).name, font: id => (byId(FONT_PAIRS, id) || {}).name, photo: id => (byId(PHOTO_STYLES, id) || {}).name};
  p.metrics.forEach(m => {
    const cr = m.creativeId && state.creatives.find(c => c.id === m.creativeId); if (!cr || !cr.dims || !(+m.leads > 0) || !(+m.spend > 0)) return;
    [['design', cr.dims.design], ['font', cr.dims.font], ['photo', cr.dims.photo], ['cta', cr.dims.cta]].forEach(([k, val]) => { if (!val) return; const a = agg[k + '|' + val] = agg[k + '|' + val] || {k, v: (nm[k] ? nm[k](val) : val) || val, key: val, spend: 0, leads: 0, n: 0}; a.spend += +m.spend; a.leads += +m.leads; a.n++; });
  });
  const rows = Object.values(agg).map(a => Object.assign(a, {cpl: a.spend / a.leads})); if (!rows.length) return {rows: [], map: {}};
  const best = Math.min(...rows.map(r => r.cpl)), map = {}; rows.forEach(r => { r.w = Math.max(1, Math.round(100 * best / r.cpl)); map[r.k + '|' + r.key] = r.w; });
  return {rows: rows.sort((a, b) => b.w - a.w), map};
}
