/* Novo design (tela dividida: navegar modelos × criar do zero), cartões de entrada do Estúdio, tamanhos/versões ligadas à arte original e aprovação opcional
   antes de gerar mais versões. Carregado depois de design-mesa.js. */
const DZN = {step: 'choose', type: 'static', brand: '', mode: 'pre', unit: 'px', fmt: 'feed45', pfmt: 'a4', cw: 1080, ch: 1080, dpi: 300, pages: 1, name: ''};
const DZN_PRINT = [['bc', 'Cartão de visita', 90, 50, 'mm'], ['postcard', 'Cartão postal A6', 105, 148, 'mm'], ['flyer', 'Flyer DL', 99, 210, 'mm'], ['a5', 'A5', 148, 210, 'mm'], ['a4', 'A4', 210, 297, 'mm'], ['a3', 'A3', 297, 420, 'mm'], ['letter', 'Carta (Letter)', 8.5, 11, 'in'], ['bcus', 'Cartão 3,5 × 2 pol', 3.5, 2, 'in'], ['poster', 'Pôster 18 × 24 pol', 18, 24, 'in']];
const dznPx = (v, unit, dpi) => unit === 'mm' ? v / 25.4 * dpi : unit === 'in' ? v * dpi : v;
/* tamanho em pixels de uma medida em mm/pol/px; baixa a resolução se passar do limite de 4096 px */
function dznFormat(w, h, unit, dpi) {
  dpi = +dpi || 300; if (unit !== 'px') { const big = Math.max(w, h) / (unit === 'mm' ? 25.4 : 1); dpi = Math.max(72, Math.min(dpi, Math.floor(4096 / big))); }
  return {w: Math.max(64, Math.min(4096, Math.round(dznPx(+w, unit, dpi)))), h: Math.max(64, Math.min(4096, Math.round(dznPx(+h, unit, dpi)))), unit, dpi};
}
const dzNeedApproval = s => { const p = dzP(); return !!(p && p.design.opts && p.design.opts.needApproval && s && !s.approved); };

/* ---------- cartões de entrada no início do Estúdio ---------- */
function dzhHTML(p) {
  const need = !!(p.design.opts && p.design.opts.needApproval), card = (t, d, b, fn, off, alt) => `<div class="dzh-card ${off ? 'off' : ''}"><b>${t}</b><small>${d}</small>${off ? `<button class="alt" disabled>${b}</button>` : `<button class="${alt ? 'alt' : ''}" onclick="${fn}">${b}</button>`}</div>`;
  return `<section class="dzh"><h2>Criar novo design</h2><p>Comece do zero na mesa de edição, escolha um modelo, importe uma imagem ou deixe a composição com IA montar com o estilo do projeto. Depois, uma arte vira todos os outros tamanhos.</p><div class="dzh-grid">
    ${card('Criar do zero', 'Escolha o tipo (imagem, impressão), a marca, o formato (px, mm ou pol) e abra a mesa de edição.', 'Criar do zero', "dzStart('scratch')")}
    ${card('Navegar modelos', 'Modelos de layout, modelos salvos e peças já criadas neste projeto.', 'Ver modelos', "dzStart('templates')", false, true)}
    ${card('Composição com IA', 'Cruze estilo, fonte e foto com o público e gere as peças prontas para refinar.', 'Compor', 'dzNew()', false, true)}
    ${card('Importar imagem', 'Suba um PNG, JPG ou SVG: ele vira uma arte editável, com camadas de texto e forma por cima.', 'Importar', 'dzImportOpen()', false, true)}
    ${card('Fábrica de variações', 'Textos × estilos × layouts a partir de uma peça.', 'Abrir', 'dzVarOpen()', false, true)}
    ${card('Photoshop e Figma', 'Importação de PSD e de arquivos do Figma ainda não existe aqui. Por enquanto: exporte em PNG/SVG e use Importar imagem.', 'Em breve', '', true)}
  </div><label class="dzh-opt"><input type="checkbox" ${need ? 'checked' : ''} onchange="dzApprovalToggle(this.checked)"> Exigir aprovação da arte antes de gerar outros tamanhos e variações</label></section>`;
}
const dzHomeBase = dzHome;
dzHome = function (p, r) { dzHomeBase(p, r); r.insertAdjacentHTML('afterbegin', dzhHTML(p)); };
function dzApprovalToggle(v) { const p = dzP(); p.design.opts = Object.assign({}, p.design.opts, {needApproval: !!v}); persist(); toast(v ? 'Agora é preciso aprovar a arte antes de gerar tamanhos e variações.' : 'Aprovação desligada.'); }
function dzApproveToggle() { const s = dzSet(); if (!s) return; s.approved = !s.approved; persist(); toast(s.approved ? 'Arte marcada como aprovada.' : 'Aprovação retirada.'); renderDesign(); }
function dzApprovalAsk(id, then) {
  const s = dzP().design.sets.find(x => x.id === id); if (!s) return;
  showModal('Aprovação necessária', `<p style="margin-top:0">Este projeto exige que a arte seja <b>aprovada</b> antes de gerar outros tamanhos e variações. Isso evita multiplicar uma arte que ainda tem erro.</p><p class="muted" style="font-size:13px">Arte: <b>${esc(s.name)}</b></p><div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="dzApproveGo('${id}','${then || 'resize'}')">✔ Marcar como aprovada e continuar</button></div>`);
}
function dzApproveGo(id, then) { const s = dzP().design.sets.find(x => x.id === id); if (!s) return; s.approved = true; persist(); closeModal(); if (then === 'var') dzVarOpen(id); else dzResizeOpen(id); }
const dzVarOpenBase = dzVarOpen;
dzVarOpen = function (id) { const s = id && dzP().design.sets.find(x => x.id === id); if (s && dzNeedApproval(s)) return dzApprovalAsk(id, 'var'); return dzVarOpenBase(id); };

/* ---------- gerar outros tamanhos a partir da arte ---------- */
const DZN_PACKS = [['social', 'Redes sociais', ['feed45', 'square', 'story', 'fbpost']], ['ads', 'Anúncios Meta', ['adsquare', 'ad45', 'adstory', 'adlink']], ['covers', 'Capas e banners', ['fbcover', 'lipersonal', 'licompany', 'xheader', 'ytbanner']], ['yt', 'YouTube', ['ytthumb', 'ytbanner']]];
rsz = {setId: '', sel: {}, cw: 1080, ch: 1080, useCustom: false, unit: 'px', dpi: 300, link: true};
function dzResizeOpen(setId) {
  const p = dzP(), set = p.design.sets.find(x => x.id === setId); if (!set) return;
  if (dzNeedApproval(set)) return dzApprovalAsk(setId, 'resize');
  rsz = {setId, sel: {}, cw: 1080, ch: 1080, useCustom: false, unit: 'px', dpi: 300, link: true};
  const grp = FORMAT_GROUPS.map(([g, list]) => `<div class="rsz-g"><h4>${g}</h4>${list.map(([id, name, w, h]) => `<label class="rsz-i ${id === set.format.id ? 'cur' : ''}"><input type="checkbox" value="${id}" onchange="rsz.sel[this.value]=this.checked;dzResizeCount()"> <span>${name}</span> <small class="muted">${w}×${h}</small></label>`).join('')}</div>`).join('');
  showModal('⤢ Gerar a arte em outros tamanhos', `<div class="row-gap" style="align-items:flex-start;gap:14px"><canvas id="rszPrev" width="120" height="${Math.round(120 * set.format.h / set.format.w)}" style="border-radius:8px;border:1px solid #e6e6ea;flex:none"></canvas><p class="muted" style="margin:0;font-size:12.5px">Arte de origem: <b>${esc(set.name)}</b> (${set.format.w}×${set.format.h}). Cada tamanho marcado vira uma <b>arte nova ligada a esta</b>; a original não muda. Formatos parecidos mantêm a sua edição; muito diferentes (ex.: capa larga) reorganizam título, texto, botão e foto. Depois abra cada versão para ajustar.</p></div>
    <div class="row-gap" style="flex-wrap:wrap;margin:10px 0"><small class="muted">Marcar um pacote:</small>${DZN_PACKS.map(([k, l]) => `<button class="btn sm" onclick="dznPack('${k}')">${l}</button>`).join('')}<button class="btn sm" onclick="dznPack('all')">Todos</button><button class="btn sm" onclick="dznPack('none')">Limpar</button></div>
    <div class="rsz-grid">${grp}</div>
    <div class="rsz-g"><h4>Medida livre</h4><div class="ins-row" style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end"><label class="ins inl"><input type="checkbox" onchange="rsz.useCustom=this.checked;dzResizeCount()"> Incluir</label><label class="ins" style="flex:1;min-width:110px">Largura<input type="number" min="1" step="any" value="1080" onchange="rsz.cw=+this.value"></label><label class="ins" style="flex:1;min-width:110px">Altura<input type="number" min="1" step="any" value="1080" onchange="rsz.ch=+this.value"></label><label class="ins" style="flex:1;min-width:110px">Unidade<select onchange="rsz.unit=this.value"><option value="px">px</option><option value="mm">mm</option><option value="in">pol</option></select></label><label class="ins" style="flex:1;min-width:110px">DPI (mm/pol)<select onchange="rsz.dpi=+this.value"><option>300</option><option>150</option><option>72</option></select></label></div></div>
    <label style="display:flex;gap:8px;align-items:center;margin:8px 0;font-size:13px"><input type="checkbox" checked onchange="rsz.link=this.checked"> Manter as versões ligadas à arte de origem (aparecem no painel “Versões desta arte”)</label>
    <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" id="rszGo" onclick="dzResizeRun()" disabled>Gerar (0)</button></div>`);
  $('modalBox').classList.add('wide'); ensureSetResources(set).then(() => { const cv = $('rszPrev'); if (cv) renderSlide(cv.getContext('2d'), set.slides[0], set.format.w, set.format.h, cv.width / set.format.w); });
}
function dznPack(k) {
  const ids = k === 'all' ? FORMAT_GROUPS.flatMap(g => g[1].map(x => x[0])) : k === 'none' ? [] : (DZN_PACKS.find(x => x[0] === k) || [0, 0, []])[2];
  rsz.sel = {}; ids.forEach(id => { rsz.sel[id] = true; }); document.querySelectorAll('#modalBox .rsz-i input[type=checkbox]').forEach(c => { c.checked = !!rsz.sel[c.value]; }); dzResizeCount();
}
async function dzResizeRun() {
  const p = dzP(), src = p.design.sets.find(x => x.id === rsz.setId); if (!src) return;
  const targets = Object.keys(rsz.sel).filter(k => rsz.sel[k] && FORMATS[k]).map(k => FORMATS[k]);
  if (rsz.useCustom) { const f = dznFormat(rsz.cw, rsz.ch, rsz.unit, rsz.dpi), c = customFormat(f.w, f.h); if (rsz.unit !== 'px') { c.unit = rsz.unit; c.dpi = f.dpi; } targets.push(c); }
  if (!targets.length) return; const b = $('rszGo'); b.disabled = true; b.textContent = 'Gerando…';
  try {
    await ensureSetResources(src);
    const made = targets.map(t => { const n = resizeSetSync(src, t); if (t.unit) { n.format.unit = t.unit; n.format.dpi = t.dpi; } if (rsz.link) n.srcId = src.id; if (src.guides) n.guides = Object.assign({}, src.guides); return n; });
    for (const s of made) await ensureSetResources(s);
    p.design.sets.push(...made); persist(); closeModal(); renderDesign(); toast(made.length + ' arte(s) criada(s)' + (rsz.link ? ' e ligada(s) à original (painel “Versões desta arte”).' : ' na biblioteca.'));
  } catch (e) { b.disabled = false; b.textContent = 'Gerar'; toast('Não consegui adaptar: ' + e.message); }
}

/* ---------- importar imagem como arte editável ---------- */
function dzImportOpen() {
  dzPickFile('image/png,image/jpeg,image/webp,image/svg+xml,image/gif', async file => {
    const p = dzP(); let bmp; try { bmp = await createImageBitmap(file); } catch (e) { toast('Não consegui ler essa imagem. Use PNG, JPG, WebP ou SVG.'); return; }
    const k = Math.min(1, 2160 / Math.max(bmp.width, bmp.height)), w = Math.max(64, Math.round(bmp.width * k)), h = Math.max(64, Math.round(bmp.height * k)), id = uid('img'); await imgPut(id, file); IMGS.set(id, bmp);
    const tk = (typeof lyStyles === 'function' ? lyStyles(p)[0].tk : brandTokens(p)), L = IM('photo', {x: 0, y: 0, w, h, imgId: id, radius: 0}); L.role = 'image'; L.name = file.name;
    const set = {id: uid('ds'), name: file.name.replace(/\.[a-z0-9]+$/i, '').slice(0, 80), format: {id: 'custom', w, h}, tk: JSON.parse(JSON.stringify(tk)), slides: [{id: sid(), bg: '#ffffff', layers: [L]}], created: new Date().toISOString(), updated: new Date().toISOString()};
    p.design.sets.push(set); persist(); go('design'); dzOpen(set.id); toast('Imagem importada. Adicione texto, forma e logo por cima.');
  });
}

/* ---------- tela dividida: navegar modelos × criar do zero ---------- */
function dzStart(step) { DZN.step = step || 'choose'; DZN.brand = ''; DZN.name = ''; dz.view = 'start'; go('design'); }
function dzStartBack() { if (DZN.step !== 'choose') { DZN.step = 'choose'; renderDesign(); } else { dz.view = 'home'; renderDesign(); } }
const dznName = () => { if (DZN.name) return DZN.name; if (DZN.mode === 'custom') return 'arte-' + DZN.cw + 'x' + DZN.ch; const o = DZN.type === 'print' ? DZN_PRINT.find(x => x[0] === DZN.pfmt) : null; return o ? o[1].toLowerCase().replace(/[^a-z0-9]+/g, '-') : (DZN.fmt || 'arte'); };
function dzStartRender(p, r) {
  const st = DZN, styles = typeof lyStyles === 'function' ? lyStyles(p) : []; if (!st.brand && styles[0]) st.brand = styles[0].id;
  const tpls = typeof tplList === 'function' ? tplList() : [], sets = p.design.sets.slice(-8).reverse();
  const left = st.step === 'templates' ? `<div class="dzs-card" style="justify-content:flex-start;align-items:stretch;text-align:left;cursor:default"><h2 style="font-size:26px">Navegar modelos</h2><p>Escolha um ponto de partida. As cores e fontes vêm do projeto.</p>
      <div class="row-gap" style="flex-wrap:wrap"><button class="dzm-btn acc" onclick="dzLayoutsOpen()">▦ Modelos de layout</button><button class="dzm-btn" onclick="dzTemplatesOpen()">★ Modelos salvos</button><button class="dzm-btn" onclick="dzNew()">✦ Composição com IA</button></div>
      <h4 style="margin:18px 0 0;font-size:13px">Modelos salvos (${tpls.length})</h4>${tpls.length ? `<div class="dzs-tpl">${tpls.slice(0, 18).map(t => `<article><canvas class="dzs-c" data-t="${esc(t.id)}" width="150" height="${Math.round(150 * t.format.h / t.format.w)}"></canvas><b>${esc(t.name)}</b><button onclick="dzTemplateUse('${esc(t.id)}',true)">Usar</button></article>`).join('')}</div>` : '<p style="margin-top:6px">Ainda não há modelos salvos. No editor use ★ Modelo.</p>'}
      <h4 style="margin:18px 0 0;font-size:13px">Artes deste projeto</h4>${sets.length ? `<div class="dzs-tpl">${sets.map(s => `<article><canvas class="dzs-c" data-s="${s.id}" width="150" height="${Math.round(150 * s.format.h / s.format.w)}"></canvas><b>${esc(s.name)}</b><button onclick="dzOpen('${s.id}')">Abrir</button></article>`).join('')}</div>` : '<p style="margin-top:6px">Nenhuma arte ainda.</p>'}</div>`
    : `<div class="dzs-card" onclick="DZN.step='templates';renderDesign()"><h2>Navegar modelos</h2><p>Biblioteca de modelos de layout, modelos salvos e artes do projeto.</p><button class="dzs-go">›</button></div>`;
  const types = [['static', '🖼', 'Imagem estática', 'PNG / JPG / PDF'], ['print', '🖨', 'Impressão', 'PDF em mm ou pol'], ['animated', '▶', 'Animada', 'HTML5 / MP4 / GIF · em breve']], pr = st.type === 'print';
  const fmtSel = pr ? `<select onchange="DZN.pfmt=this.value;renderDesign()">${DZN_PRINT.map(([id, n, w, h, u]) => `<option value="${id}" ${st.pfmt === id ? 'selected' : ''}>${n} · ${w}×${h} ${u === 'in' ? 'pol' : u}</option>`).join('')}</select>` : `<select onchange="DZN.fmt=this.value;renderDesign()">${fmtOptions(st.fmt)}</select>`;
  const right = st.step === 'scratch' ? `<div class="dzs-card dzs-form" style="justify-content:flex-start"><h2 style="font-size:28px">Criar do zero</h2><p style="text-align:center;margin:0 auto 6px">Escolha o tipo de design e crie algo novo.</p>
      <h4>Tipo de design</h4><div class="dzs-types">${types.map(([k, ic, t, d]) => `<button class="dzs-type ${st.type === k ? 'on' : ''} ${k === 'animated' ? 'off' : ''}" ${k === 'animated' ? 'disabled' : `onclick="DZN.type='${k}';DZN.mode='pre';renderDesign()"`}><span style="font-size:20px">${ic}</span><b>${t}</b><small>${d}</small></button>`).join('')}<button class="dzs-type" onclick="dzNew()"><span style="font-size:20px">✦</span><b>Com IA</b><small>composição guiada</small></button></div>
      <h4>Marca</h4><select onchange="DZN.brand=this.value">${styles.map(s => `<option value="${esc(s.id)}" ${st.brand === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>
      <h4>Parâmetros do formato</h4><div class="dzs-row"><button class="dzs-chip ${st.mode === 'pre' ? 'on' : ''}" onclick="DZN.mode='pre';renderDesign()">Predefinido<small>formatos prontos</small></button><button class="dzs-chip ${st.mode === 'custom' ? 'on' : ''}" onclick="DZN.mode='custom';renderDesign()">Personalizado<small>suas medidas</small></button></div>
      ${st.mode === 'pre' ? `<h4>Escolha o formato</h4>${fmtSel}` : `<div class="dzs-row" style="margin-top:10px"><div><h4 style="margin-top:0">Largura</h4><input type="number" min="1" step="any" value="${st.cw}" onchange="DZN.cw=+this.value"></div><div><h4 style="margin-top:0">Altura</h4><input type="number" min="1" step="any" value="${st.ch}" onchange="DZN.ch=+this.value"></div></div><div class="dzs-row"><div><h4>Unidade</h4><select onchange="DZN.unit=this.value">${[['px', 'Pixels'], ['mm', 'Milímetros'], ['in', 'Polegadas']].map(([v, l]) => `<option value="${v}" ${st.unit === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div><div><h4>Resolução (mm/pol)</h4><select onchange="DZN.dpi=+this.value">${[300, 150, 72].map(d => `<option ${st.dpi === d ? 'selected' : ''}>${d}</option>`).join('')}</select></div></div>`}
      <div class="dzs-row"><div><h4>Nome da arte</h4><input type="text" value="${esc(DZN.name)}" placeholder="${esc(dznName())}" oninput="DZN.name=this.value"></div><div><h4>Páginas</h4><input type="number" min="1" max="20" value="${st.pages}" onchange="DZN.pages=Math.max(1,Math.min(20,+this.value||1))"></div></div>
      <button class="dzs-create" onclick="dzStartCreate()">Criar e abrir a mesa</button></div>`
    : `<div class="dzs-card acc" onclick="DZN.step='scratch';renderDesign()"><h2>Criar do zero</h2><p>Escolha o tipo de design (imagem ou impressão), a marca e o formato, e abra a mesa de edição.</p><button class="dzs-go">›</button></div>`;
  r.innerHTML = `<div class="dzs"><div class="dzs-top"><button class="dzm-btn" onclick="dzStartBack()">‹ Voltar</button><b>Novo design</b></div><div class="dzs-split">${left}${right}</div></div>`;
  r.querySelectorAll('.dzs-c').forEach(async cv => {
    const t = cv.dataset.t ? tpls.find(x => x.id === cv.dataset.t) : null, s = cv.dataset.s ? p.design.sets.find(x => x.id === cv.dataset.s) : null, src = t || s; if (!src) return;
    try { if (s) await ensureSetResources(s); const f = src.format, sl = (src.slides || [])[0]; if (sl) renderSlide(cv.getContext('2d'), sl, f.w, f.h, cv.width / f.w); } catch (e) { /* miniatura é só um enfeite */ }
  });
}
function dzStartCreate() {
  const p = dzP(), st = DZN, styles = lyStyles(p), sty = styles.find(s => s.id === st.brand) || styles[0]; let w, h, unit = 'px', dpi = 0, id = 'custom', safe = null;
  if (st.mode === 'custom') { const f = dznFormat(st.cw, st.ch, st.unit, st.dpi); w = f.w; h = f.h; unit = st.unit; dpi = f.dpi; }
  else if (st.type === 'print') { const o = DZN_PRINT.find(x => x[0] === st.pfmt) || DZN_PRINT[4], f = dznFormat(o[2], o[3], o[4], st.dpi); w = f.w; h = f.h; unit = o[4]; dpi = f.dpi; id = o[0]; }
  else { const f = FORMATS[st.fmt] || FORMATS.feed45; w = f.w; h = f.h; id = f.id; safe = f.safe || null; }
  const tk = JSON.parse(JSON.stringify(sty.tk)), fmt = {id, w, h}; if (unit !== 'px') { fmt.unit = unit; fmt.dpi = dpi; } if (safe) fmt.safe = safe;
  const slides = Array.from({length: st.pages}, () => ({id: sid(), bg: tk.bg || '#ffffff', layers: []})), set = {id: uid('ds'), name: (st.name || dznName()).slice(0, 80), format: fmt, tk, slides, created: new Date().toISOString(), updated: new Date().toISOString()};
  if (st.type === 'print') set.guides = {bleed: true, safe: true};
  p.design.sets.push(set); persist(); go('design'); dzOpen(set.id); toast('Mesa pronta. Use a barra de cima para adicionar texto, forma, logo e imagem.');
}
const renderDesignNovo = renderDesign;
renderDesign = function () {
  const p = dzP(), r = $('designRoot');
  if (p && r && dz.view === 'start') { r.classList.remove('dzm-on'); document.body.classList.remove('dzm-lock'); return dzStartRender(p, r); }
  return renderDesignNovo();
};
