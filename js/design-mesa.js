/* Mesa escura do Estúdio de Design: o editor em tela cheia (barra de ferramentas, gerenciador de camadas, palco com réguas e zoom, propriedades à direita,
   páginas embaixo, menu "Salvar e gerar"). Reaproveita todos os recursos do editor que já existia (camadas, texto por palavra, fotos, logos, vídeos, estilos,
   exportações, variações e tamanhos). Carregado depois de design-ui.js: redefine a casca do editor, o encaixe do palco e o painel de páginas. */
const DZM = {zoom: null};
const dzmLabel = L => {
  const plain = t => String(t || '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  if (L.type === 'text') return {ic: 'T', nm: plain(L.content).slice(0, 34) || 'Texto', sub: L.role || 'texto'};
  if (L.type === 'rect') return {ic: '▭', nm: 'Forma', sub: L.role || ''};
  if (L.type === 'path') return {ic: '◇', nm: 'Símbolo', sub: L.role || ''};
  if (L.type === 'video') return {ic: '▶', nm: 'Vídeo', sub: L.role || ''};
  if (L.role === 'logo') return {ic: '◉', nm: 'Logo', sub: ''};
  return {ic: '▣', nm: 'Foto', sub: L.role || 'imagem'};
};
function dzEditorShell(p, r) {
  const s = dzSet(), back = dz.fromBook ? '‹ Voltar ao e-book' : '‹ Voltar';
  const extra = (typeof gridUI !== 'undefined' && gridUI.from ? '<button class="dzm-btn" onclick="gridBack()">‹ Grid</button>' : '') + (typeof feedUI !== 'undefined' && feedUI.from && feedUI.id ? '<button class="dzm-btn" onclick="feedUI.from=false;go(\'feed\')">‹ Feed</button>' : '');
  const M = (fn, ic, t, sub) => `<button onclick="dzmMenu(false);${fn}"><span style="width:18px;text-align:center">${ic}</span><span>${t}${sub ? `<small>${sub}</small>` : ''}</span></button>`;
  r.innerHTML = `<div class="dzm">
  <header class="dzm-top">
    <button class="dzm-btn" onclick="dzBack()">${back}</button>${extra}
    <input class="dzm-name" value="${esc(s.name)}" onchange="dzSet().name=this.value;persist()" title="Nome da arte">
    <span class="dzm-sep"></span>
    <button class="dzm-ic ${dz.mode === 'select' ? 'on' : ''}" onclick="dz.mode='select';renderDesign()" title="Selecionar e mover">⌖</button>
    <button class="dzm-ic" onclick="dzUndo()" title="Desfazer (Ctrl+Z)">↶</button><button class="dzm-ic" onclick="dzRedo()" title="Refazer (Ctrl+Y)">↷</button>
    <span class="dzm-sep"></span>
    <button class="dzm-ic" onclick="dzAddText()" title="Adicionar texto"><b>T</b></button><button class="dzm-ic" onclick="dzAddRect()" title="Adicionar forma">▭</button><button class="dzm-ic" onclick="dzAddLogo()" title="Adicionar logo">◉</button>
    <button class="dzm-ic" onclick="dzAddImage()" title="Inserir imagem do seu computador">🖼</button><button class="dzm-ic" onclick="dzAddPhoto()" title="Quadro de foto (enviar ou gerar com IA)">▣</button><button class="dzm-ic" onclick="dzAddVideo()" title="Inserir vídeo (link ou arquivo)">▶</button><button class="dzm-ic" onclick="dzLayerDup()" title="Duplicar o elemento (Ctrl+D)">⧉</button>
    <span class="dzm-sep"></span>
    <button class="dzm-ic ${dz.mode === 'emphasis' ? 'on' : ''}" onclick="dzModeEm()" title="Destacar palavras por clique">✦</button><button class="dzm-ic ${dz.mode === 'fmt' ? 'on' : ''}" onclick="dzModeFmt()" title="Formatar uma palavra (Shift estende)">✎</button>
    <span class="dzm-auto" id="dzAuto"></span><span class="dzm-grow"></span>
    <select class="dzm-zoom" onchange="dzmZoom(this.value)" title="Zoom"><option value="fit" ${DZM.zoom ? '' : 'selected'}>Ajustar</option>${[25, 50, 75, 100, 150, 200, 400].map(z => `<option value="${z}" ${DZM.zoom === z / 100 ? 'selected' : ''}>${z}%</option>`).join('')}</select>
    ${dzSet().approved ? '<span class="dzm-pill">✔ Aprovada</span>' : ''}<button class="dzm-btn acc" onclick="dzResizeOpen(dz.setId)" title="Gerar esta arte em outros tamanhos">⤢ Tamanhos</button>
    <button class="dzm-btn" onclick="dzVarOpen(dz.setId)" title="Gerar variações desta arte">⚡ Variações</button>
    <div class="dzm-gowrap"><button class="dzm-go" id="dzSaveBtn" onclick="dzSaveNow()" title="Salvar agora (o editor também salva sozinho)">Salvar</button><button class="dzm-go2" onclick="event.stopPropagation();dzmMenu()" title="Salvar e gerar">▾ Gerar</button>
      <div class="dzm-menu" id="dzMenu" onclick="event.stopPropagation()">
        <h6>Baixar</h6>${M('dzExportOne()', '⬇', 'PNG desta página')}${M('dzExportAll()', '⬇', 'Todas as páginas (ZIP)')}${M('dzExportPDF()', '⬇', 'PDF', 'uma página por slide')}${M('dzExportPSD()', '⬇', 'Photoshop (PSD) em camadas')}${M('dzExportLayers()', '⬇', 'PNG por camada', 'com manifesto')}
        <hr><h6>Gerar mais</h6>${M('dzApproveToggle()', dzSet().approved ? '✔' : '○', dzSet().approved ? 'Arte aprovada (retirar)' : 'Marcar como aprovada', 'libera outros tamanhos e variações')}${M('dzResizeOpen(dz.setId)', '⤢', 'Outros tamanhos', 'feed, stories, anúncios, capas, tamanho livre')}${M('dzVarOpen(dz.setId)', '⚡', 'Fábrica de variações', 'textos × estilos × layouts')}${M('pmQuick(\'ads\')', '📄', 'Subir tabela em lote', 'criar vários anúncios de uma vez')}
        <hr><h6>Guardar</h6>${M('pkgOpen({sets:[dzSet().id]})', '📦', 'Pacote', 'peça com imagens e fontes')}${M('dzSaveTemplate()', '★', 'Salvar como modelo')}${M('dzSaveStyle()', '◈', 'Salvar como estilo')}${M('dzApplyStyleModal()', '◇', 'Aplicar estilo…')}
        <hr>${M('flipRead(\'ds\', dz.setId)', '📖', 'Folhear como livro')}${dzSet().deck ? M('dzPresentDeck()', '▶', 'Apresentar') : ''}
        <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;color:var(--m-mut);font-size:11.5px">Histórico ${histSelect()}</div>
      </div></div>
  </header>
  <div class="dzm-body">
    <aside class="dzm-left" id="dzLeft"><h3 onclick="document.getElementById('dzLeft').classList.toggle('collapsed')">Camadas <span>⌄</span></h3><div class="dzm-lylist" id="dzLayers"></div>
      <div class="dzm-lyact"><button onclick="dzLayerMove(1)" title="Trazer para frente">▲</button><button onclick="dzLayerMove(-1)" title="Enviar para trás">▼</button><button onclick="dzLayerDup()" title="Duplicar">⧉</button><button onclick="dzLayerDel()" title="Apagar">🗑</button></div></aside>
    <section class="dzm-stagewrap"><div class="dzm-corner"></div><canvas class="dzm-rt" id="dzRT"></canvas><canvas class="dzm-rl" id="dzRL"></canvas><div class="dz-stage" id="dzStage"><canvas id="dzCanvas"></canvas></div><div class="dzm-hint">Arraste para mover · alças para redimensionar · Alt+arrastar duplica · duplo clique no texto para editar</div></section>
    <aside class="dzm-right"><div class="dz-insp" id="dzInsp"></div></aside>
  </div>
  <footer class="dzm-bottom"><div class="dzm-pt"><button onclick="dzSlideMove(-1)" title="Mover para trás">◀</button><button onclick="dzSlideMove(1)" title="Mover para frente">▶</button><button onclick="dzSlideDel()" title="Apagar esta página">×</button></div><div class="dz-slides" id="dzSlides"></div></footer>
  </div><input type="file" id="dzFile" accept="image/*" hidden>`;
  dzBindCanvas(); dzSlidesPanel(); dzInspector(); dzFit(); dzAutoUpdate(); const st = $('dzStage'); if (st) st.addEventListener('scroll', dzRulers);
  ensureSetResources(s).then(() => { dzDraw(); dzSlidesPanel(); });
  if (dz.hist.length === 0) dzSnap();
}
function dzmMenu(v) { const m = $('dzMenu'); if (!m) return; m.classList.toggle('open', v === undefined ? !m.classList.contains('open') : v); }
document.addEventListener('click', () => dzmMenu(false));
function dzmZoom(v) { DZM.zoom = v === 'fit' ? null : (+v) / 100; dzFit(); dzDraw(); }

/* palco: encaixa a arte (ou usa o zoom escolhido) e redesenha as réguas */
function dzFit() {
  const s = dzSet(), st = $('dzStage'), cv = $('dzCanvas'); if (!s || !cv) return;
  const aw = Math.max(160, st.clientWidth - 60), ah = Math.max(160, st.clientHeight - 60), fit = Math.min(aw / s.format.w, ah / s.format.h, 1);
  dz.scale = DZM.zoom || fit; cv.width = s.format.w; cv.height = s.format.h; cv.style.width = Math.round(s.format.w * dz.scale) + 'px'; cv.style.height = Math.round(s.format.h * dz.scale) + 'px'; dzRulers();
}
function dzRulers() {
  const s = dzSet(), cv = $('dzCanvas'), st = $('dzStage'), rt = $('dzRT'), rl = $('dzRL'); if (!s || !cv || !st || !rt || !rl) return;
  const sr = st.getBoundingClientRect(), cr = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1, unit = s.format.unit || 'px', ppu = unit === 'mm' ? (s.format.dpi || 300) / 25.4 : unit === 'in' ? (s.format.dpi || 300) : 1, k = dz.scale * ppu;
  const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000], step = steps.find(x => x * k >= 64) || 5000, minor = step >= 10 ? step / 5 : 0;
  const draw = (c, horiz, len, off, total) => {
    c.width = Math.round((horiz ? sr.width : 22) * dpr); c.height = Math.round((horiz ? 22 : sr.height) * dpr); const x = c.getContext('2d'); x.scale(dpr, dpr); x.fillStyle = '#141416'; x.fillRect(0, 0, 9999, 9999); x.strokeStyle = '#4a4a54'; x.fillStyle = '#8f8f99'; x.font = '9px system-ui'; x.lineWidth = 1;
    const ticks = (v, h, label) => { const p = Math.round(off + v * k) + .5; if (horiz) { x.beginPath(); x.moveTo(p, 22); x.lineTo(p, 22 - h); x.stroke(); if (label) x.fillText(String(Math.round(v * 100) / 100), p + 3, 10); } else { x.beginPath(); x.moveTo(22, p); x.lineTo(22 - h, p); x.stroke(); if (label) { x.save(); x.translate(10, p + 3); x.rotate(-Math.PI / 2); x.fillText(String(Math.round(v * 100) / 100), 0, 0); x.restore(); } } };
    for (let v = 0; v <= total + 1e-6; v += step) ticks(v, 12, true); if (minor) for (let v = 0; v <= total + 1e-6; v += minor) ticks(v, 5, false);
  };
  draw(rt, true, 0, cr.left - sr.left, s.format.w / ppu); draw(rl, false, 0, cr.top - sr.top, s.format.h / ppu);
}
window.addEventListener('resize', () => { if (document.body.classList.contains('dzm-lock') && $('dzStage')) { dzFit(); dzDraw(); } });

/* camadas */
function dzLayersPanel() {
  const el = $('dzLayers'), sl = dzSlide(); if (!el || !sl) return;
  el.innerHTML = [...sl.layers].reverse().map(L => { const m = dzmLabel(L); return `<div class="dzm-ly ${L.id === dz.sel ? 'on' : ''} ${L.hidden ? 'off' : ''}" onclick="dzmSel('${L.id}')"><span class="ic">${m.ic}</span><span class="nm">${esc(m.nm)}${m.sub ? `<small>${esc(m.sub)}</small>` : ''}</span><button class="${L.hidden ? '' : 'on'}" title="${L.hidden ? 'Mostrar' : 'Ocultar'}" onclick="event.stopPropagation();dzmVis('${L.id}')">${L.hidden ? '○' : '●'}</button><button class="${L.locked ? 'on' : ''}" title="${L.locked ? 'Destravar' : 'Travar (não move com o mouse)'}" onclick="event.stopPropagation();dzmLock('${L.id}')">${L.locked ? '🔒' : '🔓'}</button></div>`; }).join('') || '<p class="muted" style="padding:10px;color:var(--m-mut)">Esta página não tem camadas.</p>';
}
function dzmSel(id) { dz.sel = id; dz.range = null; dzInspector(); dzDraw(); }
function dzmVis(id) { const L = dzSlide().layers.find(l => l.id === id); if (!L) return; L.hidden = !L.hidden; if (L.hidden && dz.sel === id) dz.sel = ''; dzDraw(); dzCommit(); dzInspector(); dzSlidesPanel(); }
function dzmLock(id) { const L = dzSlide().layers.find(l => l.id === id); if (!L) return; L.locked = !L.locked; dzCommit(); dzLayersPanel(); }

/* páginas (miniaturas na horizontal) */
function dzSlidesPanel() {
  const s = dzSet(), el = $('dzSlides'); if (!s || !el) return;
  el.innerHTML = s.slides.map((sl, i) => `<div class="dz-sl ${i === dz.slide ? 'on' : ''}" onclick="dzGoSlide(${i})"><canvas width="108" height="${Math.round(108 * s.format.h / s.format.w)}" data-i="${i}"></canvas><span>${i + 1}</span></div>`).join('') + `<button class="dzm-padd" onclick="dzSlideAdd()" title="Duplicar esta página">＋</button>`;
  el.querySelectorAll('canvas').forEach(cv => renderSlide(cv.getContext('2d'), s.slides[+cv.dataset.i], s.format.w, s.format.h, cv.width / s.format.w)); dzLayersPanel();
}
/* painel de propriedades: com um elemento, o inspetor de sempre; sem elemento, as propriedades da página */
const dzInspectorBase = dzInspector;
dzInspector = function () {
  dzInspectorBase(); const el = $('dzInsp'), s = dzSet(); if (!el || !s) return; dzLayersPanel();
  if (dzLayer()) return;
  const g = s.guides || {}, fam = (dzP().design.sets || []).filter(x => x.srcId === s.id), unit = s.format.unit || 'px', u = unit === 'mm' ? s.format.w / ((s.format.dpi || 300) / 25.4) : unit === 'in' ? s.format.w / (s.format.dpi || 300) : s.format.w, v = unit === 'mm' ? s.format.h / ((s.format.dpi || 300) / 25.4) : unit === 'in' ? s.format.h / (s.format.dpi || 300) : s.format.h;
  el.innerHTML += `<div class="dzm-pg" style="margin-top:14px"><h3>Formato</h3><p style="color:var(--m-mut);margin:0 0 6px">${esc(s.format.id || '')} · ${Math.round(u * 100) / 100} × ${Math.round(v * 100) / 100} ${unit}${unit !== 'px' ? ` (${s.format.w}×${s.format.h} px a ${s.format.dpi || 300} dpi)` : ''}</p>
    <label>Área de segurança <input type="checkbox" ${g.safe ? 'checked' : ''} onchange="dzmGuide('safe',this.checked)"></label><label>Área de sangria <input type="checkbox" ${g.bleed ? 'checked' : ''} onchange="dzmGuide('bleed',this.checked)"></label>
    <small style="color:var(--m-mut)">As guias aparecem só aqui na mesa: não saem na arte exportada.</small></div>
    <div class="dzm-pg" style="border:0"><h3>Versões desta arte</h3><button class="btn sm dark" style="width:100%" onclick="dzResizeOpen(dz.setId)">⤢ Gerar em outros tamanhos</button>
    ${fam.length ? `<div class="dzv">${fam.map(x => `<article><canvas class="dzv-c" data-set="${x.id}" width="130" height="${Math.round(130 * x.format.h / x.format.w)}"></canvas><b>${esc((x.format.id || '').slice(0, 18))}</b><small>${x.format.w}×${x.format.h}</small><button onclick="dzOpen('${x.id}')">Abrir</button></article>`).join('')}</div>` : '<small style="color:var(--m-mut);display:block;margin-top:8px">Nenhuma versão gerada ainda. Cada tamanho vira uma arte ligada a esta.</small>'}</div>`;
  el.querySelectorAll('.dzv-c').forEach(async cv => { const x = dzP().design.sets.find(y => y.id === cv.dataset.set); if (!x) return; await ensureSetResources(x); renderSlide(cv.getContext('2d'), x.slides[0], x.format.w, x.format.h, cv.width / x.format.w); });
};
function dzmGuide(k, v) { const s = dzSet(); s.guides = Object.assign({}, s.guides, {[k]: !!v}); persist(); dzDraw(); }
/* guias (só na mesa) por cima da arte */
const dzDrawBase = dzDraw;
dzDraw = function () {
  dzDrawBase(); const s = dzSet(), cv = $('dzCanvas'); if (!s || !cv || !s.guides || (!s.guides.safe && !s.guides.bleed)) return;
  const ctx = cv.getContext('2d'), W = s.format.w, H = s.format.h, lw = 2 / dz.scale; ctx.save(); ctx.setLineDash([12 / dz.scale, 8 / dz.scale]); ctx.lineWidth = lw;
  if (s.guides.bleed) { const b = Math.round(Math.min(W, H) * 0.02); ctx.strokeStyle = '#ff3b57'; ctx.strokeRect(b, b, W - 2 * b, H - 2 * b); }
  if (s.guides.safe) { const sf = s.format.safe, b = Math.round(Math.min(W, H) * 0.06); ctx.strokeStyle = '#2bd37f'; if (sf) ctx.strokeRect((W - sf.w) / 2, (H - sf.h) / 2, sf.w, sf.h); else ctx.strokeRect(b, b, W - 2 * b, H - 2 * b); }
  ctx.restore();
};

/* a mesa ocupa a tela toda enquanto o editor está aberto */
const renderDesignBase = renderDesign;
renderDesign = function () {
  const r = $('designRoot'), on = dz.view === 'editor' && !!dzSet() && !!dzP(); if (r) r.classList.toggle('dzm-on', on); document.body.classList.toggle('dzm-lock', on);
  return renderDesignBase();
};
const goBase = go;
go = function (page) { document.body.classList.remove('dzm-lock'); const r = $('designRoot'); if (r && page !== 'design') r.classList.remove('dzm-on', 'dzs-on'); return goBase(page); };
