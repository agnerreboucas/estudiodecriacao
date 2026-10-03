/* ===== Diagramação · telas: biblioteca, mesa de trabalho com réguas/guias, matéria, estilos, página e objetos ===== */
const dui = {id: '', view: 'layout', pi: 0, z: 1, vx: 30, vy: 30, tool: 'v', sel: null, tab: 'texto', show: {margins: true, cols: true, grid: true, mod: true, guides: true, bleed: true, rulers: true}, hist: [], hi: -1, flow: null, imgs: {}, thumbs: {}, drag: null, mouse: null, sw: 0, ref: null, refOn: false, refOp: 0.45, space: false, refRes: null};
const DTP_RULER = 22;
const dtpList = () => { const p = curProject(); if (!p) return []; p.layouts = Array.isArray(p.layouts) ? p.layouts : []; return p.layouts; };
const dtpDoc = () => dtpList().find(d => d.id === dui.id);
const dtpUnit = () => (dtpDoc() || {}).unit || 'mm';
const dtpItems = (doc, pi) => { while (doc.pages.length <= pi) doc.pages.push({items: []}); return doc.pages[pi].items; };
const dtpFontList = () => [...new Set([...Object.keys(FONT_META), ...(typeof myFonts === 'function' ? myFonts().map(f => f.family) : [])])].sort((a, b) => a.localeCompare(b));
const dtpFontOpts = cur => dtpFontList().map(f => `<option ${f === cur ? 'selected' : ''}>${esc(f)}</option>`).join('');

/* ---------- biblioteca ---------- */
function renderDiagram() {
  const r = $('diagramRoot'), p = curProject(); if (!r) return; if (!p) { r.innerHTML = noProject('Diagramação'); return; }
  if (dui.id && dtpDoc()) return dtpEditor(p, r);
  const list = dtpList();
  r.innerHTML = edTabs('diag') + `<div class="page-head"><div><h1>Diagramação</h1><p>Monte livros, revistas, folhetos e cartazes como no InDesign: tamanho e unidades de medida, margens, sangria, colunas, grade de linha de base, régua, linhas-guia, páginas espelhadas, quadros de imagem com contorno de texto e exportação em PDF com marcas de corte.</p></div><div class="row-gap"><button class="btn dark" onclick="dtpNewOpen()">＋ Novo documento</button></div></div>
  ${list.length ? `<div class="dz-sets">${list.map(d => `<article class="dz-set"><div class="dtp-card" onclick="dtpOpen('${d.id}')"><span style="aspect-ratio:${(d.page.w / d.page.h).toFixed(3)}"></span></div><strong>${esc(d.name)}</strong><small class="muted block">${dtpFmt(d.page.w, d.unit)}×${dtpFmt(d.page.h, d.unit)} ${DTP_UL[d.unit]} · ${d.cols} col. · ${d.story.length} bloco(s)</small><div class="row-gap" style="margin-top:6px"><button class="btn sm dark" onclick="dtpOpen('${d.id}')">Abrir</button><button class="btn sm" onclick="dtpDup('${d.id}')">Duplicar</button><button class="btn sm" onclick="dtpDel('${d.id}')" title="Excluir">${ico('trash', 14)}</button></div></article>`).join('')}</div>` : emptyState('Nenhum documento ainda', 'Escolha um formato (livro, revista, folheto…) e comece a diagramar.', '<button class="btn dark" onclick="dtpNewOpen()">＋ Novo documento</button>')}`;
}
function dtpNewOpen() {
  showModal('Novo documento', `<div class="field"><label>Formato</label><select id="dtpPre" onchange="dtpPreFill()">${DTP_PRESETS.map(x => `<option value="${x.id}">${esc(x.n)}</option>`).join('')}</select></div>
  <div class="grid-2"><div class="field"><label>Nome</label><input id="dtpNm" placeholder="Ex.: Livro — Método Cuidado Seguro"></div><div class="field"><label>Unidade de medida</label><select id="dtpUn">${Object.keys(DTP_U).map(u => `<option value="${u}">${DTP_UL[u]}</option>`).join('')}</select></div></div>
  <small class="muted block">Largura, altura, margens, sangria e colunas vêm do formato e podem ser mudados depois na aba Página. Depois de criar, cole o texto na aba Texto.</small><div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="dtpCreate()">Criar</button></div>`);
}
function dtpPreFill() { const u = $('dtpUn'); if (u && $('dtpPre').value === 'a4') u.value = 'mm'; }
function dtpCreate() { const d = dtpNew($('dtpPre').value, $('dtpNm').value.trim(), $('dtpUn').value); dtpList().push(d); persist(); closeModal(); dtpOpen(d.id); }
function dtpOpen(id) { dui.id = id; dui.pi = 0; dui.sel = null; dui.hist = []; dui.hi = -1; dui.sw = 0; dui.tab = 'texto'; dui.view = 'layout'; dui.refOn = false; dui.ref = null; dui.refRes = null; dtpSnap(); renderDiagram(); }
function dtpDup(id) { const d = dtpList().find(x => x.id === id); if (!d) return; const c = JSON.parse(JSON.stringify(d)); c.id = uid('dtp'); c.name += ' (cópia)'; dtpList().push(c); persist(); renderDiagram(); }
function dtpDel(id) { const d = dtpList().find(x => x.id === id); if (!d || !confirm('Excluir o documento “' + d.name + '”? Não dá para desfazer.')) return; const p = curProject(); p.layouts = p.layouts.filter(x => x.id !== id); persist(); renderDiagram(); }
function dtpBack() { dui.id = ''; renderDiagram(); }

/* ---------- histórico e salvamento automático ---------- */
function dtpSnap() { const d = dtpDoc(); if (!d) return; const s = JSON.stringify(d); if (dui.hist[dui.hi] === s) return; dui.hist = dui.hist.slice(0, dui.hi + 1); dui.hist.push(s); while (dui.hist.length > histLimit() + 1) dui.hist.shift(); dui.hi = dui.hist.length - 1; }
function dtpUndo() { dtpSnap(); if (dui.hi <= 0) { toast('Nada para desfazer.'); return; } dui.hi--; dtpRestore(); }
function dtpRedo() { if (dui.hi >= dui.hist.length - 1) { toast('Nada para refazer.'); return; } dui.hi++; dtpRestore(); }
function dtpRestore() { const p = curProject(), i = p.layouts.findIndex(d => d.id === dui.id); p.layouts[i] = JSON.parse(dui.hist[dui.hi]); dui.sel = null; persist(); AUTO_AT = Date.now(); dtpRefresh(true); }
let dtpT1 = 0, dtpT2 = 0;
function dtpTouch(now) { persist(); AUTO_AT = Date.now(); dtpStatus(); clearTimeout(dtpT1); dtpT1 = setTimeout(() => { dtpSnap(); dtpStatus(); }, 600); clearTimeout(dtpT2); dtpT2 = setTimeout(dtpReflow, now ? 0 : 260); }
function dtpStatus() { const el = $('dtpAuto'); if (el) el.innerHTML = `✓ Salvo automaticamente às ${autoTime()} · passo <b>${Math.max(0, dui.hi)}</b> de ${Math.max(0, dui.hist.length - 1)} <small>(máx. ${histLimit()})</small>`; }

/* ---------- editor ---------- */
function dtpEditor(p, r) {
  const d = dtpDoc(), u = d.unit;
  r.innerHTML = `<div class="dz-top"><button class="btn sm" onclick="dtpBack()">← Diagramação</button><input class="dz-name" value="${esc(d.name)}" onchange="dtpDoc().name=this.value;dtpTouch()">
    <div class="row-gap" style="flex-wrap:wrap"><button class="btn sm" onclick="dtpUndo()" title="Desfazer (Ctrl+Z)">↶</button><button class="btn sm" onclick="dtpRedo()" title="Refazer (Ctrl+Y)">↷</button>
    <select class="sm" onchange="histSetLimit(this.value);dtpStatus()" title="Passos de histórico">${HIST_OPTS.map(n => `<option value="${n}" ${n === histLimit() ? 'selected' : ''}>${n} passos</option>`).join('')}</select>
    <button class="btn sm dark" onclick="dtpTabSet('exportar')">Exportar PDF</button></div></div>
  <div class="dtp-bar"><div class="row-gap">${[['v', 'Selecionar', 'V'], ['t', 'Texto', 'T'], ['i', 'Imagem', 'I'], ['r', 'Retângulo', 'R']].map(([k, l, h]) => `<button class="tchip ${dui.tool === k ? 'on' : ''}" data-tool="${k}" onclick="dtpTool('${k}')" title="${l} (${h})">${l}</button>`).join('')}</div>
    <div class="row-gap" style="flex-wrap:wrap">${[['margins', 'Margens'], ['cols', 'Colunas'], ['grid', 'Linha de base'], ['mod', 'Grade modular'], ['guides', 'Guias'], ['bleed', 'Sangria'], ['rulers', 'Réguas']].map(([k, l]) => `<label class="dtp-chk"><input type="checkbox" ${dui.show[k] ? 'checked' : ''} onchange="dui.show.${k}=this.checked;dtpDraw()"> ${l}</label>`).join('')}</div>
    <div class="row-gap"><select class="sm" onchange="dtpDoc().unit=this.value;dtpTouch();dtpPanel();dtpDraw()" title="Unidade de medida">${Object.keys(DTP_U).map(k => `<option value="${k}" ${k === u ? 'selected' : ''}>${DTP_UL[k]}</option>`).join('')}</select><button class="btn sm" onclick="dtpZoom(0.8)">−</button><span id="dtpZ" class="muted" style="min-width:44px;text-align:center;font-size:12px"></span><button class="btn sm" onclick="dtpZoom(1.25)">＋</button><button class="btn sm" onclick="dtpFit()">Ajustar</button>
    <button class="tchip ${dui.view === 'story' ? 'on' : ''}" onclick="dtpView(dui.view==='story'?'layout':'story')" title="Edição só do texto, com a marca do estouro">Editar texto (matéria)</button></div></div>
  <div class="dtp-wrap"><div class="dtp-left" id="dtpLeft"></div><div class="dtp-mid"><div class="dtp-stage" id="dtpStage"><canvas id="dtpCv"></canvas></div><div id="dtpStory" class="dtp-story" style="display:none"></div><div class="dtp-foot"><span id="dtpInfo"></span><span id="dtpAuto" class="muted"></span></div></div>
  <div class="dtp-right"><div class="matrix-tabs">${[['texto', 'Texto'], ['estilos', 'Estilos'], ['pagina', 'Página'], ['objeto', 'Objeto'], ['ref', 'Referência'], ['exportar', 'Exportar']].map(([k, l]) => `<button class="${dui.tab === k ? 'active' : ''}" onclick="dtpTabSet('${k}')">${l}</button>`).join('')}</div><div id="dtpPanel"></div></div></div>`;
  dtpBindStage(); dtpStatus(); dtpRefresh(true); setTimeout(dtpFit, 50);
}
function dtpTabSet(t) { dui.tab = t; document.querySelectorAll('.dtp-right .matrix-tabs button').forEach(b => b.classList.toggle('active', b.textContent.toLowerCase().startsWith(({texto: 'texto', estilos: 'estilos', pagina: 'página', objeto: 'objeto', ref: 'referência', exportar: 'exportar'})[t]))); dtpPanel(); }
function dtpTool(k) { dui.tool = k; document.querySelectorAll('.dtp-bar [data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === k)); const c = $('dtpCv'); if (c) c.style.cursor = k === 'v' ? 'default' : 'crosshair'; }
function dtpView(v) { dui.view = v; const s = $('dtpStage'), st = $('dtpStory'); if (!s) return; s.style.display = v === 'layout' ? '' : 'none'; st.style.display = v === 'story' ? '' : 'none'; document.querySelectorAll('.dtp-bar .tchip').forEach(b => { if (/matéria/.test(b.textContent)) b.classList.toggle('on', v === 'story'); }); if (v === 'story') dtpStoryRender(); else { dtpFit(); } }

/* ---------- fontes, imagens e refluxo ---------- */
async function dtpFonts(d) { await ensureFonts([...Object.values(d.styles).map(s => s.font), d.run.font]); }
async function dtpLoadImgs(d) {
  const ids = new Set(); d.story.forEach(s => s.k === 'img' && ids.add(s.imgId)); d.pages.forEach(pg => pg.items.forEach(i => i.k === 'img' && i.imgId && ids.add(i.imgId)));
  for (const id of ids) if (!dui.imgs[id]) { try { const b = await imgGet(id); if (b) { dui.imgs[id] = await createImageBitmap(b); if (!dui.thumbs[id]) dui.thumbs[id] = URL.createObjectURL(b); } } catch (e) { } }
}
function dtpReflow() { const d = dtpDoc(); if (!d) return; dui.flow = dtpFlow(d); const n = dtpPageCount(d, dui.flow); if (dui.pi >= n) dui.pi = n - 1; dtpDraw(); dtpThumbs(); dtpInfo(); dtpOverBar(); }
async function dtpRefresh(full) { const d = dtpDoc(); if (!d) return; await dtpFonts(d); await dtpLoadImgs(d); dtpReflow(); if (full) { dtpPanel(); if (dui.view === 'story') dtpStoryRender(); } }
function dtpInfo() { const d = dtpDoc(), f = dui.flow, el = $('dtpInfo'); if (!el || !d || !f) return; const n = dtpPageCount(d, f); el.innerHTML = `Página <b>${dui.pi + 1}</b> de <b>${n}</b> · ${dtpFmt(d.page.w, d.unit)} × ${dtpFmt(d.page.h, d.unit)} ${DTP_UL[d.unit]} · ${d.cols} coluna(s)${f.overset ? ` · <span class="dtp-over">ESTOURO: ~${f.overset.words} palavras não cabem</span>` : ''}`; const z = $('dtpZ'); if (z) z.textContent = Math.round(dui.z * 100 / 1.3333) + '%'; }
function dtpOverBar() { const el = $('dtpOver'), d = dtpDoc(); if (el) el.innerHTML = dtpOverHTML(d); }
function dtpOverHTML(d) { const f = dui.flow; if (!f || !f.overset) return ''; return `<div class="dtp-warn"><b>Texto em estouro.</b> Faltam ~${f.overset.words} palavras no fim do documento (o texto não cabe nas ${d.nPages} página(s)). <div class="row-gap" style="margin-top:6px;flex-wrap:wrap"><button class="btn sm" onclick="dtpAddPage()">＋ Adicionar página</button><button class="btn sm" onclick="dtpFitText()">Reduzir o corpo até caber</button><button class="btn sm" onclick="dtpMode(true)">Voltar ao fluxo automático</button></div></div>`; }
function dtpMode(auto) { const d = dtpDoc(); d.autoflow = auto; dtpTouch(true); dtpPanel(); }
function dtpFitText() { const d = dtpDoc(), b = d.styles.body, o = {size: b.size, lead: b.lead}; for (let i = 0; i < 40; i++) { if (!dtpFlow(d).overset) break; if (b.size <= 6) break; b.size = +(b.size - 0.25).toFixed(2); b.lead = +(b.lead - 0.35).toFixed(2); } if (dtpFlow(d).overset) { b.size = o.size; b.lead = o.lead; toast('Mesmo com o corpo mínimo (6 pt) o texto não cabe. Adicione páginas.'); } else toast(`Corpo ajustado para ${b.size} pt / entrelinha ${b.lead} pt.`); dtpTouch(true); dtpPanel(); }
function dtpAddPage() { const d = dtpDoc(); d.nPages = Math.min(400, Math.max(d.nPages, dui.flow ? dui.flow.pages.length : 1) + 1); dtpItems(d, d.nPages - 1); dtpTouch(true); dtpPanel(); }
function dtpDelPage() { const d = dtpDoc(), n = dtpPageCount(d, dui.flow); if (n <= 1) { toast('O documento precisa de ao menos 1 página.'); return; } if (!d.autoflow || d.nPages >= n) { d.pages.splice(dui.pi, 1); d.nPages = Math.max(1, d.nPages - 1); dui.pi = Math.max(0, dui.pi - 1); dui.sel = null; dtpTouch(true); dtpPanel(); } else toast('Essa página é criada pelo fluxo do texto. Apague texto ou use o modo Quadro fixo.'); }

/* ---------- visão: zoom, ajuste, páginas visíveis ---------- */
function dtpView2() { const d = dtpDoc(), n = dtpPageCount(d, dui.flow), W = d.page.w, pi = dui.pi; if (!d.facing) return [{pi, ox: 0}]; if (pi === 0) return [{pi: 0, ox: W}]; const s = pi % 2 === 1 ? pi : pi - 1, a = [{pi: s, ox: 0}]; if (s + 1 < n) a.push({pi: s + 1, ox: W}); return a; }
function dtpSpreadW() { const d = dtpDoc(); return d.facing ? d.page.w * 2 : d.page.w; }
function dtpFit() { const c = $('dtpCv'), d = dtpDoc(); if (!c || !d) return; const st = $('dtpStage'); const cw = st.clientWidth, ch = st.clientHeight, R = dui.show.rulers ? DTP_RULER : 0; dui.z = Math.max(0.1, Math.min((cw - R - 40) / dtpSpreadW(), (ch - R - 40) / d.page.h)); dui.vx = R + (cw - R - dtpSpreadW() * dui.z) / 2; dui.vy = R + (ch - R - d.page.h * dui.z) / 2; dtpDraw(); dtpInfo(); }
function dtpZoom(f, cx, cy) { const c = $('dtpCv'); if (!c) return; const st = $('dtpStage'); cx = cx != null ? cx : st.clientWidth / 2; cy = cy != null ? cy : st.clientHeight / 2; const nz = Math.max(0.1, Math.min(12, dui.z * f)); dui.vx = cx - (cx - dui.vx) * nz / dui.z; dui.vy = cy - (cy - dui.vy) * nz / dui.z; dui.z = nz; dtpDraw(); dtpInfo(); }
function dtpGo(i) { const n = dtpPageCount(dtpDoc(), dui.flow); dui.pi = Math.max(0, Math.min(n - 1, i)); dui.sel = null; dtpFit(); dtpThumbs(); dtpInfo(); dtpPanel(); }

/* ---------- desenho da mesa ---------- */
function dtpDraw() {
  const c = $('dtpCv'), d = dtpDoc(), f = dui.flow; if (!c || !d || !f) return; const st = $('dtpStage'), dpr = window.devicePixelRatio || 1, cw = st.clientWidth, ch = st.clientHeight;
  if (c.width !== Math.round(cw * dpr) || c.height !== Math.round(ch * dpr)) { c.width = Math.round(cw * dpr); c.height = Math.round(ch * dpr); c.style.width = cw + 'px'; c.style.height = ch + 'px'; }
  const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.fillStyle = '#6b6b70'; x.fillRect(0, 0, cw, ch);
  const z = dui.z, sh = dui.show;
  for (const {pi, ox} of dtpView2()) {
    const g = dtpGeom(d, pi);
    x.save(); x.translate(dui.vx + ox * z, dui.vy);
    x.shadowColor = 'rgba(0,0,0,.45)'; x.shadowBlur = 14; x.fillStyle = '#fff'; x.fillRect(0, 0, g.W * z, g.H * z); x.shadowBlur = 0;
    dtpDrawPage(x, d, f, pi, z, {imgs: dui.imgs});
    if (dui.refOn && dui.ref) { x.save(); x.globalAlpha = dui.refOp; const rw = dui.ref.width, rh = dui.ref.height, s = Math.min(g.W / rw, g.H / rh); x.drawImage(dui.ref, (g.W - rw * s) / 2 * z, (g.H - rh * s) / 2 * z, rw * s * z, rh * s * z); x.restore(); }
    x.scale(z, z); x.lineWidth = 1 / z;
    if (sh.bleed && d.bleed > 0) { x.strokeStyle = '#ef4444'; x.setLineDash([4 / z, 3 / z]); x.strokeRect(-d.bleed, -d.bleed, g.W + 2 * d.bleed, g.H + 2 * d.bleed); x.setLineDash([]); }
    if (sh.grid && d.baseline > 0) { x.strokeStyle = 'rgba(70,160,255,.45)'; x.beginPath(); for (let y = g.y0; y <= g.y1 + 0.01; y += d.baseline) { x.moveTo(g.x0, y); x.lineTo(g.x1, y); } x.stroke(); }
    if (sh.mod && d.mod && (d.mod.cols > 0 || d.mod.rows > 0)) { x.strokeStyle = 'rgba(0,170,220,.55)'; x.beginPath(); const G = dtpModLines(d, pi); G.X.forEach(v => { x.moveTo(v, g.y0); x.lineTo(v, g.y1); }); G.Y.forEach(v => { x.moveTo(g.x0, v); x.lineTo(g.x1, v); }); x.stroke(); }
    if (sh.cols) { x.fillStyle = 'rgba(140,90,255,.07)'; x.strokeStyle = 'rgba(140,90,255,.7)'; for (let k = 0; k < g.n; k++) { x.fillRect(g.colX(k), g.y0, g.colW(k), g.y1 - g.y0); x.strokeRect(g.colX(k), g.y0, g.colW(k), g.y1 - g.y0); } }
    if (sh.margins) { x.strokeStyle = '#e0338c'; x.strokeRect(g.x0, g.y0, g.x1 - g.x0, g.y1 - g.y0); }
    if (sh.guides) { x.strokeStyle = '#14b8c4'; x.beginPath(); d.guides.v.forEach(v => { x.moveTo(v, -dui.vy / z); x.lineTo(v, (ch - dui.vy) / z); }); d.guides.h.forEach(v => { x.moveTo(-5000, v); x.lineTo(9000, v); }); x.stroke(); }
    /* seleção */
    const sel = dui.sel;
    if (sel && sel.t === 'para') { x.fillStyle = 'rgba(255,200,0,.28)'; (f.pages[pi] ? f.pages[pi].lines : []).forEach(l => { if (l.sidx === sel.i) x.fillRect(l.x0 - 1, l.y, Math.max(8, l.x1 - l.x0 + 2), l.lead); }); }
    if (sel && sel.t === 'block') { (f.pages[pi] ? f.pages[pi].blocks : []).forEach(b => { if (b.sidx === sel.i) { x.strokeStyle = '#2563eb'; x.lineWidth = 2 / z; x.strokeRect(b.x, b.y, b.w, b.h); x.lineWidth = 1 / z; } }); }
    const its = (d.pages[pi] && d.pages[pi].items) || [];
    if (sel && sel.t === 'item') { const it = its.find(q => q.id === sel.id); if (it) { x.strokeStyle = '#2563eb'; x.lineWidth = 1.5 / z; x.strokeRect(it.x, it.y, it.w, it.h); x.lineWidth = 1 / z; x.fillStyle = '#fff'; dtpHandles(it).forEach(h => { const s = 6 / z; x.fillRect(h.x - s / 2, h.y - s / 2, s, s); x.strokeRect(h.x - s / 2, h.y - s / 2, s, s); }); } }
    f.frames.forEach(fr => { if (fr.pi === pi && fr.over) { const it = its.find(q => q.id === fr.id); if (it) { x.fillStyle = '#dc2626'; x.fillRect(it.x + it.w - 9, it.y + it.h - 9, 9, 9); x.fillStyle = '#fff'; x.font = '9px sans-serif'; x.fillText('+', it.x + it.w - 6.5, it.y + it.h - 1.5); } } });
    if (f.overset && !d.autoflow && pi === dtpPageCount(d, f) - 1) { x.fillStyle = '#dc2626'; x.fillRect(g.x1 - 16, g.y1 - 16, 16, 16); x.fillStyle = '#fff'; x.font = 'bold 14px sans-serif'; x.fillText('+', g.x1 - 12, g.y1 - 3); }
    x.restore();
  }
  if (sh.rulers) dtpRulers(x, cw, ch);
}
function dtpHandles(it) { const {x, y, w, h} = it; return [{n: 'nw', x, y}, {n: 'n', x: x + w / 2, y}, {n: 'ne', x: x + w, y}, {n: 'e', x: x + w, y: y + h / 2}, {n: 'se', x: x + w, y: y + h}, {n: 's', x: x + w / 2, y: y + h}, {n: 'sw', x, y: y + h}, {n: 'w', x, y: y + h / 2}]; }
function dtpRulers(x, cw, ch) {
  const d = dtpDoc(), z = dui.z, u = d.unit, pu = DTP_U[u], R = DTP_RULER; x.save(); x.fillStyle = '#f1efea'; x.fillRect(0, 0, cw, R); x.fillRect(0, 0, R, ch); x.strokeStyle = '#bbb'; x.lineWidth = 1; x.beginPath(); x.moveTo(0, R + .5); x.lineTo(cw, R + .5); x.moveTo(R + .5, 0); x.lineTo(R + .5, ch); x.stroke();
  const steps = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000]; let major = steps.find(s => s * pu * z >= 64) || 5000; const minor = major / ({'2': 4, '5': 5}[String(major)[0]] || 10);
  x.fillStyle = '#555'; x.strokeStyle = '#777'; x.font = '9px sans-serif'; x.textBaseline = 'top';
  const tick = (axis) => { const off = axis === 'x' ? dui.vx : dui.vy, len = axis === 'x' ? cw : ch, a0 = Math.floor((R - off) / z / pu / minor) * minor, a1 = Math.ceil((len - off) / z / pu / minor) * minor; x.beginPath();
    for (let v = a0; v <= a1 + 1e-9; v += minor) { const p = Math.round(off + v * pu * z) + .5; if (p < R) continue; const isMaj = Math.abs(v / major - Math.round(v / major)) < 1e-6, L = isMaj ? R : R * 0.4; if (axis === 'x') { x.moveTo(p, R - L); x.lineTo(p, R); if (isMaj) x.fillText(String(+v.toFixed(2)), p + 2, 2); } else { x.moveTo(R - L, p); x.lineTo(R, p); if (isMaj) { x.save(); x.translate(2, p + 2); x.rotate(-Math.PI / 2); x.textBaseline = 'top'; x.fillText(String(+v.toFixed(2)), -x.measureText(String(+v.toFixed(2))).width - 2, -1); x.restore(); } } }
    x.stroke(); };
  x.save(); x.beginPath(); x.rect(R, 0, cw, R); x.clip(); tick('x'); x.restore(); x.save(); x.beginPath(); x.rect(0, R, R, ch); x.clip(); tick('y'); x.restore();
  if (dui.mouse) { x.strokeStyle = '#e0338c'; x.beginPath(); x.moveTo(dui.mouse.sx + .5, 0); x.lineTo(dui.mouse.sx + .5, R); x.moveTo(0, dui.mouse.sy + .5); x.lineTo(R, dui.mouse.sy + .5); x.stroke(); }
  x.fillStyle = '#e4e1da'; x.fillRect(0, 0, R, R); x.fillStyle = '#777'; x.fillText(DTP_UL[u], 2, 6); x.restore();
}

/* ---------- interação ---------- */
const dtpPick = (sx, sy) => { const d = dtpDoc(); let best = null; for (const {pi, ox} of dtpView2()) { const x = (sx - dui.vx) / dui.z - ox, y = (sy - dui.vy) / dui.z; const o = {pi, ox, x, y, inside: x >= 0 && y >= 0 && x <= d.page.w && y <= d.page.h}; if (o.inside) return o; if (!best || Math.abs(x - d.page.w / 2) < Math.abs(best.x - d.page.w / 2)) best = o; } return best; };
/* linhas da grade modular (colunas × linhas) dentro das margens, com os cortes das células */
function dtpModLines(d, pi) {
  const g = dtpGeom(d, pi), M = d.mod || {}, X = [], Y = [], gut = Math.min(6, g.gut); const cx = M.cols | 0, ry = M.rows | 0;
  if (cx > 0) { const w = (g.x1 - g.x0 - (cx - 1) * gut) / cx; for (let k = 0; k < cx; k++) { X.push(g.x0 + k * (w + gut)); X.push(g.x0 + k * (w + gut) + w); } }
  if (ry > 0) { const h = (g.y1 - g.y0 - (ry - 1) * gut) / ry; for (let k = 0; k < ry; k++) { Y.push(g.y0 + k * (h + gut)); Y.push(g.y0 + k * (h + gut) + h); } }
  return {X, Y};
}
function dtpSnapTargets(d, pi) { const g = dtpGeom(d, pi), X = [0, g.W, g.W / 2, g.x0, g.x1, ...d.guides.v], Y = [0, g.H, g.H / 2, g.y0, g.y1, ...d.guides.h]; for (let k = 0; k < g.n; k++) { X.push(g.colX(k), g.colX(k) + g.colW(k)); } const ML = dtpModLines(d, pi); X.push(...ML.X); Y.push(...ML.Y); if (d.baseline > 0) for (let y = g.y0; y <= g.y1; y += d.baseline) Y.push(y); return {X, Y}; }
function dtpSnapV(v, T, thr) { let b = v, m = thr; for (const t of T) { const e = Math.abs(t - v); if (e < m) { m = e; b = t; } } return b; }
const dtpPosOf = e => { const r = $('dtpCv').getBoundingClientRect(); return {sx: e.clientX - r.left, sy: e.clientY - r.top}; };
function dtpBindStage() {
  const c = $('dtpCv'); if (!c) return; const pos = dtpPosOf;
  new ResizeObserver(() => { if ($('dtpCv')) dtpDraw(); }).observe($('dtpStage'));
  dtpCanvasEvents(c, pos); if (dtpBindStage.done) return; dtpBindStage.done = true; dtpWindowEvents(pos);
}
function dtpCanvasEvents(c, pos) {
  c.addEventListener('wheel', e => { e.preventDefault(); const {sx, sy} = pos(e); if (e.ctrlKey || e.metaKey) dtpZoom(e.deltaY < 0 ? 1.12 : 1 / 1.12, sx, sy); else { dui.vx -= e.shiftKey ? e.deltaY : e.deltaX; dui.vy -= e.shiftKey ? 0 : e.deltaY; dtpDraw(); } }, {passive: false});
  c.addEventListener('mousedown', e => {
    const d = dtpDoc(), {sx, sy} = pos(e), R = dui.show.rulers ? DTP_RULER : 0; dui.mouse = {sx, sy};
    if (e.button === 1 || dui.space) { dui.drag = {t: 'pan', sx, sy, vx: dui.vx, vy: dui.vy}; return; }
    if (R && sy < R && sx > R) { dui.drag = {t: 'guide', axis: 'h', v: null, isNew: true}; return; } if (R && sx < R && sy > R) { dui.drag = {t: 'guide', axis: 'v', v: null, isNew: true}; return; }
    const pk = dtpPick(sx, sy); if (!pk) return;
    if (dui.show.guides && pk.inside !== undefined) { const thr = 4 / dui.z; let gi = d.guides.v.findIndex(v => Math.abs(v - pk.x) < thr); if (gi >= 0) { dui.drag = {t: 'guide', axis: 'v', i: gi, v: d.guides.v[gi], pi: pk.pi}; return; } gi = d.guides.h.findIndex(v => Math.abs(v - pk.y) < thr); if (gi >= 0) { dui.drag = {t: 'guide', axis: 'h', i: gi, v: d.guides.h[gi], pi: pk.pi}; return; } }
    if (dui.tool !== 'v') { if (pk.inside) dui.drag = {t: 'create', pi: pk.pi, x0: pk.x, y0: pk.y, x: pk.x, y: pk.y}; return; }
    if (pk.pi !== dui.pi) { dui.pi = pk.pi; }
    const its = dtpItems(d, pk.pi), sel = dui.sel;
    if (sel && sel.t === 'item') { const it = its.find(q => q.id === sel.id); if (it) { const hs = dtpHandles(it); let hb = null, hd = 9 / dui.z; hs.forEach(h => { const dd = Math.hypot(h.x - pk.x, h.y - pk.y); if (dd < hd) { hd = dd; hb = h.n; } }); if (hb) { dui.drag = {t: 'resize', h: hb, id: it.id, pi: pk.pi, o: {x: it.x, y: it.y, w: it.w, h: it.h}, p0: pk}; return; } } }
    for (let i = its.length - 1; i >= 0; i--) { const it = its[i]; if (pk.x >= it.x && pk.x <= it.x + it.w && pk.y >= it.y && pk.y <= it.y + it.h) { dui.sel = {t: 'item', id: it.id, pi: pk.pi}; dui.drag = {t: 'move', id: it.id, pi: pk.pi, o: {x: it.x, y: it.y}, p0: pk, moved: false, dup: e.altKey}; dtpDraw(); dtpTabSet('objeto'); return; } }
    const P = dui.flow.pages[pk.pi];
    if (P) { const b = P.blocks.find(b => pk.x >= b.x && pk.x <= b.x + b.w && pk.y >= b.y && pk.y <= b.y + b.h); if (b) { dui.sel = {t: 'block', i: b.sidx}; dui.drag = {t: 'detach', kind: 'block', sidx: b.sidx, pi: pk.pi, col: 0, p0: pk, sx, sy}; dtpDraw(); dtpTabSet('texto'); dtpScrollRow(b.sidx); return; } const l = P.lines.find(l => pk.y >= l.y && pk.y <= l.y + l.lead && pk.x >= l.x0 - 2 && pk.x <= Math.max(l.x1, l.x0 + 20) + 2); if (l) { dui.sel = {t: 'para', i: l.sidx}; dui.drag = {t: 'detach', kind: 'para', sidx: l.sidx, pi: pk.pi, col: l.col, p0: pk, sx, sy}; dtpDraw(); dtpTabSet('texto'); dtpScrollRow(l.sidx); return; } }
    dui.sel = null; dtpDraw(); if (dui.tab === 'objeto') dtpPanel();
  });
  c.addEventListener('dblclick', () => { if (dui.sel && dui.sel.t === 'para') { dtpTabSet('texto'); dtpScrollRow(dui.sel.i, true); } });
}
function dtpWindowEvents(pos) {
  window.addEventListener('mousemove', e => {
    if (!$('dtpCv')) return; const d = dtpDoc(); if (!d) return; const {sx, sy} = pos(e); dui.mouse = {sx, sy}; const dr = dui.drag;
    if (!dr) { if (dui.show.rulers) dtpDraw(); return; }
    if (dr.t === 'pan') { dui.vx = dr.vx + sx - dr.sx; dui.vy = dr.vy + sy - dr.sy; dtpDraw(); return; }
    if (dr.t === 'detach') { if (Math.hypot(sx - dr.sx, sy - dr.sy) < 5) return; const fr = dtpDetach(dr); if (!fr) { dui.drag = null; return; } dui.sel = {t: 'item', id: fr.id, pi: dr.pi}; dui.drag = {t: 'move', id: fr.id, pi: dr.pi, o: {x: fr.x, y: fr.y}, p0: dr.p0, moved: true, dup: false}; dui.flow = dtpFlow(d); dtpDraw(); return; }
    const pk = dtpPick(sx, sy); if (!pk) return;
    if (dr.t === 'guide') { const x = (sx - dui.vx) / dui.z - (pk.ox || 0), y = (sy - dui.vy) / dui.z; dr.v = dr.axis === 'v' ? x : y; dr.cur = {sx, sy}; const arr = dr.axis === 'v' ? d.guides.v : d.guides.h; if (dr.isNew) { arr.push(dr.v); dr.i = arr.length - 1; dr.isNew = false; } arr[dr.i] = dr.v; dtpDraw(); return; }
    const T = dtpSnapTargets(d, dr.pi), thr = 6 / dui.z, mx = pk.pi === dr.pi ? pk.x : (sx - dui.vx) / dui.z - (dtpView2().find(v => v.pi === dr.pi) || {ox: 0}).ox, my = (sy - dui.vy) / dui.z;
    if (dr.t === 'create') { dr.x = mx; dr.y = my; dtpDraw(); const x = $('dtpCv').getContext('2d'), dpr = window.devicePixelRatio || 1, ox = (dtpView2().find(v => v.pi === dr.pi) || {ox: 0}).ox; x.save(); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.strokeStyle = '#2563eb'; x.setLineDash([4, 3]); x.strokeRect(dui.vx + (ox + Math.min(dr.x0, dr.x)) * dui.z, dui.vy + Math.min(dr.y0, dr.y) * dui.z, Math.abs(dr.x - dr.x0) * dui.z, Math.abs(dr.y - dr.y0) * dui.z); x.restore(); return; }
    const it = dtpItems(d, dr.pi).find(q => q.id === dr.id); if (!it) return;
    if (dr.t === 'move') { dr.moved = true; if (dr.dup && !dr.did) { dr.did = true; const c = JSON.parse(JSON.stringify(it)); c.id = uid('fr'); dtpItems(d, dr.pi).push(c); dui.sel = {t: 'item', id: c.id, pi: dr.pi}; dr.id = c.id; } const q = dtpItems(d, dr.pi).find(q => q.id === dr.id); let nx = dr.o.x + (mx - dr.p0.x), ny = dr.o.y + (my - dr.p0.y);
      const sxs = [nx, nx + q.w, nx + q.w / 2], sys = [ny, ny + q.h, ny + q.h / 2]; let bx = nx; let m = thr; sxs.forEach((v, k) => { const s = dtpSnapV(v, T.X, thr); if (s !== v && Math.abs(s - v) < m) { m = Math.abs(s - v); bx = nx + (s - v); } }); let by = ny; m = thr; sys.forEach((v, k) => { const s = dtpSnapV(v, T.Y, thr); if (s !== v && Math.abs(s - v) < m) { m = Math.abs(s - v); by = ny + (s - v); } });
      q.x = bx; q.y = by; dtpDraw(); return; }
    if (dr.t === 'resize') { const o = dr.o; let x0 = o.x, y0 = o.y, x1 = o.x + o.w, y1 = o.y + o.h; const sx2 = dtpSnapV(mx, T.X, thr), sy2 = dtpSnapV(my, T.Y, thr); if (dr.h.includes('w')) x0 = sx2; if (dr.h.includes('e')) x1 = sx2; if (dr.h.includes('n')) y0 = sy2; if (dr.h.includes('s')) y1 = sy2; if (x1 - x0 < 6) { if (dr.h.includes('w')) x0 = x1 - 6; else x1 = x0 + 6; } if (y1 - y0 < 6) { if (dr.h.includes('n')) y0 = y1 - 6; else y1 = y0 + 6; } it.x = x0; it.y = y0; it.w = x1 - x0; it.h = y1 - y0; dtpDraw(); }
  });
  window.addEventListener('mouseup', e => {
    const dr = dui.drag; if (!dr) return; dui.drag = null; const d = dtpDoc(); if (!d) return;
    if (dr.t === 'pan' || dr.t === 'detach') return;
    if (dr.t === 'guide') { const c = $('dtpCv').getBoundingClientRect(), sx = e.clientX - c.left, sy = e.clientY - c.top, R = DTP_RULER, arr = dr.axis === 'v' ? d.guides.v : d.guides.h; if (dr.i != null && ((dr.axis === 'v' && sx < R) || (dr.axis === 'h' && sy < R) || sx < 0 || sy < 0 || sx > c.width || sy > c.height)) arr.splice(dr.i, 1); dtpTouch(); dtpSnap(); dtpDraw(); return; }
    if (dr.t === 'create') { const w = Math.abs(dr.x - dr.x0), h = Math.abs(dr.y - dr.y0), x = Math.min(dr.x0, dr.x), y = Math.min(dr.y0, dr.y); if (w < 8 || h < 8) { dtpTool('v'); return; } const it = dtpMakeItem(dui.tool, x, y, w, h); dtpItems(d, dr.pi).push(it); dui.sel = {t: 'item', id: it.id, pi: dr.pi}; const wasImg = dui.tool === 'i'; dtpTool('v'); dtpTouch(true); dtpSnap(); dtpTabSet('objeto'); if (wasImg) dtpPickImg(); return; }
    if (dr.t === 'move' && !dr.moved) return; dtpTouch(true); dtpSnap(); dtpPanel();
  });
}
function dtpMakeItem(k, x, y, w, h) { const b = {id: uid('fr'), k, x, y, w, h, wrap: 'none', off: 6}; if (k === 'i') return Object.assign(b, {k: 'img', wrap: 'around', off: 8, imgId: '', zoom: 1}); if (k === 't') return Object.assign(b, {k: 'text', text: 'Digite o texto aqui', st: 'body', pad: 4}); return Object.assign(b, {k: 'rect', fill: '#E7DCC8', op: 1}); }
document.addEventListener('keydown', e => {
  if (ui.page !== 'diagram' || !dui.id || !dtpDoc()) return; const tg = e.target.tagName; if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tg)) return; const m = e.ctrlKey || e.metaKey, k = e.key.toLowerCase(), d = dtpDoc();
  if (e.code === 'Space') { dui.space = true; e.preventDefault(); return; }
  if (m && k === 'z') { e.preventDefault(); e.shiftKey ? dtpRedo() : dtpUndo(); } else if (m && k === 'y') { e.preventDefault(); dtpRedo(); }
  else if (m && k === 'd' && dui.sel && dui.sel.t === 'item') { e.preventDefault(); dtpItemDup(); }
  else if (!m && ['v', 't', 'i', 'r'].includes(k)) dtpTool(k);
  else if (k === 'escape') { dui.sel = null; dtpTool('v'); dtpDraw(); dtpPanel(); }
  else if ((k === 'delete' || k === 'backspace') && dui.sel && dui.sel.t === 'item') { dtpItemDel(); }
  else if (k === 'pageup') dtpGo(dui.pi - 1); else if (k === 'pagedown') dtpGo(dui.pi + 1);
  else if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(k) && dui.sel && dui.sel.t === 'item') { e.preventDefault(); const it = dtpItems(d, dui.sel.pi).find(q => q.id === dui.sel.id); if (!it) return; const s = e.shiftKey ? 10 : 1; if (k === 'arrowleft') it.x -= s; if (k === 'arrowright') it.x += s; if (k === 'arrowup') it.y -= s; if (k === 'arrowdown') it.y += s; dtpTouch(true); dtpPanel(); }
  else if (k === '+' || k === '=') dtpZoom(1.25); else if (k === '-') dtpZoom(0.8); else if (k === '0') dtpFit();
});
document.addEventListener('keyup', e => { if (e.code === 'Space') dui.space = false; });

/* ---------- painel esquerdo: páginas ---------- */
function dtpThumbs() {
  const L = $('dtpLeft'), d = dtpDoc(), f = dui.flow; if (!L || !d || !f) return; const n = Math.min(dtpPageCount(d, f), 150);
  L.innerHTML = `<div class="okr-label">PÁGINAS</div><div class="dtp-pgs">${Array.from({length: n}, (_, i) => `<div class="dtp-pg ${i === dui.pi ? 'on' : ''}" onclick="dtpGo(${i})"><canvas data-pg="${i}" width="64" height="${Math.round(64 * d.page.h / d.page.w)}"></canvas><small>${i + 1}</small></div>`).join('')}</div>
  <div class="row-gap" style="margin-top:8px;flex-wrap:wrap"><button class="btn sm" onclick="dtpAddPage()">＋ Página</button><button class="btn sm" onclick="dtpDelPage()">Excluir</button></div>${dtpPageCount(d, f) > 150 ? '<small class="muted block">Mostrando as 150 primeiras.</small>' : ''}`;
  const cs = [...L.querySelectorAll('canvas')]; let k = 0; const step = () => { const t = Date.now(); while (k < cs.length && Date.now() - t < 14) { const cv = cs[k++], i = +cv.dataset.pg, x = cv.getContext('2d'); try { dtpDrawPage(x, d, f, i, cv.width / d.page.w, {imgs: dui.imgs, noRun: false}); } catch (e) { } } if (k < cs.length) setTimeout(step, 0); }; step();
}

/* ---------- painel direito ---------- */
function dtpPanel() {
  const P = $('dtpPanel'), d = dtpDoc(); if (!P || !d) return; const u = d.unit;
  const N = (label, path, extra) => { const v = path.split('.').reduce((o, k) => o[k], d); return `<div class="field"><label>${label}</label><input type="number" step="any" value="${dtpFmt(v, u)}" onchange="dtpSetPt('${path}',this.value)" ${extra || ''}></div>`; };
  if (dui.tab === 'texto') { P.innerHTML = dtpTextoHTML(d); return; }
  if (dui.tab === 'estilos') { P.innerHTML = dtpEstilosHTML(d); return; }
  if (dui.tab === 'objeto') { P.innerHTML = dtpObjetoHTML(d, N); return; }
  if (dui.tab === 'ref') { P.innerHTML = dtpRefHTML(d); return; }
  if (dui.tab === 'exportar') { P.innerHTML = dtpExportHTML(d); return; }
  const fo = d.facing;
  P.innerHTML = `<div class="okr-label">TAMANHO E UNIDADE</div><div class="field"><label>Formato rápido</label><select onchange="dtpApplyPreset(this.value)"><option value="">Escolher…</option>${DTP_PRESETS.map(x => `<option value="${x.id}">${esc(x.n)}</option>`).join('')}</select></div>
  <div class="grid-2">${N('Largura', 'page.w')}${N('Altura', 'page.h')}</div><div class="row-gap"><button class="btn sm" onclick="dtpSwap()">⇄ Girar (retrato/paisagem)</button></div>
  <div class="okr-label" style="margin-top:12px">PÁGINAS</div><label class="dtp-chk"><input type="checkbox" ${fo ? 'checked' : ''} onchange="dtpDoc().facing=this.checked;dtpTouch(true);dtpPanel();dtpFit()"> Páginas opostas (livro/revista: margem interna e externa)</label>
  <div class="field"><label>Modo do texto</label><select onchange="dtpMode(this.value==='1')"><option value="1" ${d.autoflow ? 'selected' : ''}>Fluxo automático (cria páginas)</option><option value="0" ${!d.autoflow ? 'selected' : ''}>Quadro fixo — o que sobrar vira ESTOURO</option></select></div>
  <div class="field"><label>Número de páginas ${d.autoflow ? '(mínimo; o fluxo cria as demais)' : '(fixo)'}</label><input type="number" min="1" max="400" value="${d.nPages}" onchange="dtpDoc().nPages=Math.max(1,Math.min(400,+this.value||1));dtpTouch(true);dtpPanel()"></div><div id="dtpOver">${dtpOverHTML(d)}</div>
  <div class="okr-label" style="margin-top:12px">MARGENS</div><div class="grid-2">${N('Topo', 'margins.t')}${N('Base', 'margins.b')}${N(fo ? 'Interna (lombada)' : 'Esquerda', 'margins.i')}${N(fo ? 'Externa' : 'Direita', 'margins.o')}</div>
  <div class="okr-label" style="margin-top:12px">COLUNAS E GRADE</div><div class="grid-2"><div class="field"><label>Colunas</label><input type="number" min="1" max="8" value="${d.cols}" onchange="dtpDoc().cols=Math.max(1,Math.min(8,Math.round(+this.value||1)));dtpTouch(true)"></div>${N('Espaço entre colunas', 'gutter')}</div>
  <div class="field"><label>Grade de linha de base (${DTP_UL[u]}; 0 = desligada)</label><input type="number" step="any" value="${dtpFmt(d.baseline, u)}" onchange="dtpSetPt('baseline',this.value)"><small class="muted">Com a grade ligada, as linhas de texto e os espaços se alinham a ela, como no InDesign.</small></div>
  <div class="okr-label" style="margin-top:12px">MODELOS DE GRADE (por baixo do layout)</div><div class="field"><select onchange="dtpApplyGrid(this.value)"><option value="">Escolher um modelo de grade…</option>${DTP_GRIDS.map(x => `<option value="${x.id}">${esc(x.n)}</option>`).join('')}</select></div>
  <div class="grid-2"><div class="field"><label>Proporção das colunas</label><input value="${esc((d.colw.length ? d.colw : Array(d.cols).fill(1)).join(':'))}" onchange="dtpSetColw(this.value)" placeholder="ex.: 1:2"></div><div class="field"><label>Páginas antes do texto (capa etc.)</label><input type="number" min="0" max="20" value="${d.front | 0}" onchange="dtpDoc().front=Math.max(0,Math.min(20,+this.value||0));dtpTouch(true)"></div>
  <div class="field"><label>Grade modular · colunas</label><input type="number" min="0" max="24" value="${d.mod.cols}" onchange="dtpDoc().mod.cols=Math.max(0,Math.min(24,+this.value||0));dtpTouch(true)"></div><div class="field"><label>Grade modular · linhas</label><input type="number" min="0" max="24" value="${d.mod.rows}" onchange="dtpDoc().mod.rows=Math.max(0,Math.min(24,+this.value||0));dtpTouch(true)"></div></div>
  <small class="muted block">A grade modular (azul) não guia o texto corrido: ela serve de base para posicionar imagens e quadros, que grudam nas linhas. As colunas de texto (roxo) é que recebem o texto.</small>
  <div class="okr-label" style="margin-top:12px">SANGRIA</div>${N('Sangria (todos os lados)', 'bleed')}
  <div class="okr-label" style="margin-top:12px">FUNDO E PÁGINA-MESTRE</div><div class="field"><label>Cor do papel</label><input type="color" value="${d.paper}" onchange="dtpDoc().paper=this.value;dtpTouch(true)"></div>
  <label class="dtp-chk"><input type="checkbox" ${d.run.folio ? 'checked' : ''} onchange="dtpDoc().run.folio=this.checked;dtpTouch(true)"> Número de página (folio)</label>
  <div class="grid-2"><div class="field"><label>Posição do número</label><select onchange="dtpDoc().run.pos=this.value;dtpTouch(true)">${[['outer', 'Externa'], ['center', 'Centro'], ['inner', 'Interna']].map(([k, l]) => `<option value="${k}" ${d.run.pos === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div><div class="field"><label>Fonte do rodapé</label><select onchange="dtpDoc().run.font=this.value;dtpRefresh()">${dtpFontOpts(d.run.font)}</select></div></div>
  <div class="field"><label>Cabeçalho (páginas pares/esquerda)</label><input value="${esc(d.run.header)}" oninput="dtpDoc().run.header=this.value;dtpTouch()"></div><div class="field"><label>Cabeçalho (páginas ímpares/direita)</label><input value="${esc(d.run.headerR)}" oninput="dtpDoc().run.headerR=this.value;dtpTouch()"></div>
  <div class="okr-label" style="margin-top:12px">LINHAS-GUIA</div><small class="muted block">Arraste da régua (de cima ou da esquerda) para criar uma guia; arraste de volta para a régua para apagar. Objetos grudam nas guias, margens e colunas.</small><div class="row-gap" style="margin-top:6px"><button class="btn sm" onclick="dtpGuidesClear()">Limpar guias</button></div>`;
}
function dtpApplyGrid(id) { const G = DTP_GRIDS.find(x => x.id === id), d = dtpDoc(); if (!G) return; d.cols = G.cols; d.colw = G.colw.slice(); d.mod = Object.assign({}, G.mod); if (G.gut) d.gutter = dtpMM(G.gut); dui.show.mod = true; dtpTouch(true); dtpPanel(); dtpDraw(); toast('Grade aplicada: ' + G.n); }
function dtpSetColw(v) { const d = dtpDoc(), a = String(v).split(/[:\s,;]+/).map(Number).filter(n => n > 0); d.colw = a.length === d.cols && a.some(n => n !== a[0]) ? a : []; if (a.length > 1 && a.length !== d.cols) { d.cols = Math.min(8, a.length); d.colw = a.length === d.cols ? a : []; } dtpTouch(true); dtpPanel(); }
function dtpSetPt(path, val) { const d = dtpDoc(), ks = path.split('.'), last = ks.pop(), o = ks.reduce((a, k) => a[k], d); o[last] = Math.max(0, dtpToPt(val, d.unit)); if (path === 'page.w' || path === 'page.h') { o[last] = Math.max(36, o[last]); dtpTouch(true); dtpFit(); } else dtpTouch(true); }
function dtpSwap() { const d = dtpDoc(); [d.page.w, d.page.h] = [d.page.h, d.page.w]; dtpTouch(true); dtpPanel(); dtpFit(); }
function dtpApplyPreset(id) { const P = DTP_PRESETS.find(x => x.id === id), d = dtpDoc(); if (!P || !confirm('Aplicar o formato “' + P.n + '”? Tamanho, margens, colunas e sangria serão trocados (o texto é mantido).')) { dtpPanel(); return; } d.page = {w: dtpMM(P.w), h: dtpMM(P.h)}; d.margins = {t: dtpMM(P.m.t), b: dtpMM(P.m.b), i: dtpMM(P.m.i), o: dtpMM(P.m.o)}; d.cols = P.cols; d.facing = P.facing; d.bleed = dtpMM(P.bleed); if (P.pages) d.nPages = Math.max(d.nPages, P.pages); dtpTouch(true); dtpPanel(); dtpFit(); }
function dtpGuidesClear() { const d = dtpDoc(); d.guides = {v: [], h: []}; dtpTouch(); dtpSnap(); dtpDraw(); }

/* ---------- aba Texto ---------- */
const DTP_LOREM = ['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.', 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.'];
function dtpTextoHTML(d) {
  const s = d.story, W = 40, a = Math.max(0, Math.min(Math.max(0, s.length - W), dui.sw)), rows = s.slice(a, a + W);
  return `<div class="row-gap" style="flex-wrap:wrap"><button class="btn sm" onclick="dtpImportOpen()">Colar / importar texto</button><button class="btn sm" onclick="dtpSample()">Texto de teste</button><button class="btn sm" onclick="dtpAddPara()">＋ Parágrafo</button><button class="btn sm" onclick="dtpAddInlineImg()">＋ Imagem no texto</button><button class="btn sm" onclick="dtpAddBreak('break')">Quebra de página</button><button class="btn sm" onclick="dtpAddBreak('colbreak')">Quebra de coluna</button></div>
  <small class="muted block" style="margin:6px 0">Escreva com <b>**negrito**</b> e <i>*itálico*</i>. Clique em um texto na página para achar o parágrafo aqui. Imagem inserida no texto empurra tudo o que vem depois.</small><div id="dtpOver">${dtpOverHTML(d)}</div>
  ${s.length > W ? `<div class="row-gap" style="margin:6px 0"><button class="btn sm" onclick="dui.sw=Math.max(0,dui.sw-${W});dtpPanel()">‹ Anteriores</button><small class="muted">${a + 1}–${Math.min(s.length, a + W)} de ${s.length}</small><button class="btn sm" onclick="dui.sw=Math.min(${Math.max(0, s.length - W)},dui.sw+${W});dtpPanel()">Próximos ›</button></div>` : ''}
  <div id="dtpRows">${rows.map((it, k) => dtpRowHTML(d, it, a + k)).join('') || '<p class="muted" style="font-size:12px">Nenhum texto ainda. Use <b>Colar / importar texto</b> ou <b>Texto de teste</b>.</p>'}</div>`;
}
function dtpRowHTML(d, it, i) {
  const on = dui.sel && (dui.sel.t === 'para' || dui.sel.t === 'block') && dui.sel.i === i, mv = `<button class="btn sm" onclick="dtpMoveRow(${i},-1)">↑</button><button class="btn sm" onclick="dtpMoveRow(${i},1)">↓</button><button class="btn sm" onclick="dtpDelRow(${i})">${ico('trash', 13)}</button>`;
  if (it.k === 'break' || it.k === 'colbreak') return `<div class="dtp-row ${on ? 'on' : ''}" id="dtpR${i}"><div class="row-gap" style="justify-content:space-between"><b style="font-size:12px">— ${it.k === 'break' ? 'Quebra de página' : 'Quebra de coluna'} —</b><span class="row-gap">${mv}</span></div></div>`;
  if (it.k === 'img') return `<div class="dtp-row ${on ? 'on' : ''}" id="dtpR${i}"><div class="row-gap" style="justify-content:space-between"><b style="font-size:12px">${ico('image', 13)} Imagem no texto</b><span class="row-gap">${mv}</span></div><div class="row-gap" style="align-items:flex-start;margin-top:6px"><img class="dtp-th" src="${dui.thumbs[it.imgId] || ''}" alt=""><div style="flex:1"><div class="grid-2"><select onchange="dtpRowSet(${i},'w',this.value)"><option value="col" ${it.w !== 'full' ? 'selected' : ''}>Largura da coluna</option><option value="full" ${it.w === 'full' ? 'selected' : ''}>Largura total (topo da página)</option></select><select onchange="dtpRowSet(${i},'al',this.value)">${[['l', 'Esquerda'], ['c', 'Centro'], ['r', 'Direita']].map(([k, l]) => `<option value="${k}" ${it.al === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div><label class="muted" style="font-size:11px">Tamanho: ${Math.round(it.pct)}%</label><input type="range" min="20" max="100" value="${it.pct}" oninput="dtpRowSet(${i},'pct',+this.value)"><input placeholder="Legenda (opcional)" value="${esc(it.cap)}" oninput="dtpRowSet(${i},'cap',this.value)"></div></div></div>`;
  return `<div class="dtp-row ${on ? 'on' : ''}" id="dtpR${i}"><div class="row-gap" style="justify-content:space-between"><select class="sm" onchange="dtpRowSet(${i},'st',this.value)">${Object.keys(d.styles).map(k => `<option value="${k}" ${it.st === k ? 'selected' : ''}>${esc(d.styles[k].n)}</option>`).join('')}</select><span class="row-gap">${mv}</span></div><textarea rows="${Math.min(8, Math.max(2, Math.ceil(it.t.length / 44)))}" oninput="dtpRowSet(${i},'t',this.value,true)" onfocus="dui.sel={t:'para',i:${i}};dtpDraw()">${esc(it.t)}</textarea></div>`;
}
function dtpRowSet(i, k, v, grow) { const d = dtpDoc(); d.story[i][k] = v; dtpTouch(); if (grow) { const el = document.querySelector('#dtpR' + i + ' textarea'); if (el) el.rows = Math.min(8, Math.max(2, Math.ceil(v.length / 44))); } }
function dtpScrollRow(i, focus) { const w = 40; if (i < dui.sw || i >= dui.sw + w) { dui.sw = Math.max(0, i - 3); dtpPanel(); } else { document.querySelectorAll('.dtp-row.on').forEach(e => e.classList.remove('on')); } const el = $('dtpR' + i); if (el) { el.classList.add('on'); el.scrollIntoView({block: 'nearest', behavior: 'smooth'}); if (focus) { const t = el.querySelector('textarea'); if (t) t.focus(); } } }
function dtpMoveRow(i, dd) { const a = dtpDoc().story, j = i + dd; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; dui.sel = {t: a[j].k === 'img' ? 'block' : 'para', i: j}; dtpTouch(true); dtpPanel(); }
function dtpDelRow(i) { const d = dtpDoc(); d.story.splice(i, 1); dui.sel = null; dtpTouch(true); dtpPanel(); }
function dtpAddPara() { const d = dtpDoc(), i = dui.sel && dui.sel.i != null ? dui.sel.i + 1 : d.story.length; d.story.splice(i, 0, {k: 'p', st: 'body', t: 'Novo parágrafo'}); dui.sel = {t: 'para', i}; dtpTouch(true); dtpPanel(); setTimeout(() => dtpScrollRow(i, true), 30); }
function dtpAddBreak(k) { const d = dtpDoc(), i = dui.sel && dui.sel.i != null ? dui.sel.i + 1 : d.story.length; d.story.splice(i, 0, {k}); dtpTouch(true); dtpPanel(); }
function dtpSample() { const d = dtpDoc(); const base = d.story.length; d.story.push({k: 'p', st: 'h1', t: 'Capítulo de teste'}); for (let i = 0; i < 14; i++) { if (i % 5 === 2) d.story.push({k: 'p', st: 'h2', t: 'Subtítulo ' + (i / 5 + 0.6).toFixed(0)}); d.story.push({k: 'p', st: 'body', t: DTP_LOREM[i % 4] + ' ' + DTP_LOREM[(i + 1) % 4]}); } if (d.styles.body.drop === 0) { } dtpTouch(true); dtpPanel(); }
function dtpImportOpen() {
  showModal('Colar ou importar texto', `<p class="muted" style="font-size:12px;margin-top:0">Linha em branco separa parágrafos. <b>#</b> título 1, <b>##</b> título 2, <b>###</b> título 3, <b>&gt;</b> citação. Use <b>**negrito**</b> e <b>*itálico*</b>. Também aceita um arquivo .txt/.md.</p><textarea id="dtpImp" rows="12" placeholder="Cole o texto aqui…"></textarea><div class="row-gap" style="margin-top:6px"><input type="file" accept=".txt,.md,text/plain" onchange="dtpImpFile(this)"></div><div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn" onclick="dtpImportRun(false)">Acrescentar ao fim</button><button class="btn dark" onclick="dtpImportRun(true)">Substituir o texto</button></div>`);
}
async function dtpImpFile(inp) { const f = inp.files[0]; if (f) $('dtpImp').value = await f.text(); }
function dtpParse(t) { return String(t || '').replace(/\r/g, '').split(/\n\s*\n/).map(b => b.trim()).filter(Boolean).map(b => { let st = 'body'; const m = b.match(/^(#{1,3})\s+/); if (m) { st = ['h1', 'h2', 'h3'][m[1].length - 1]; b = b.slice(m[0].length); } else if (/^>\s?/.test(b)) { st = 'quote'; b = b.replace(/^>\s?/gm, ''); } return {k: 'p', st, t: b.replace(/\s*\n\s*/g, ' ').trim()}; }); }
function dtpImportRun(replace) { const v = $('dtpImp').value, add = dtpParse(v); if (!add.length) { toast('Não encontrei texto.'); return; } const d = dtpDoc(); if (replace) { const imgs = d.story.filter(s => s.k === 'img'); d.story = add; if (imgs.length && confirm('Manter as imagens que estavam no texto (no fim)?')) d.story.push(...imgs); } else d.story.push(...add); closeModal(); dtpTouch(true); dtpPanel(); toast(add.length + ' bloco(s) importado(s).'); }
function dtpFilePick(cb) { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = async () => { if (i.files[0]) cb(await dtpAddImageFile(i.files[0])); }; i.click(); }
async function dtpAddImageFile(file) {
  let blob = file; const bm = await createImageBitmap(file), mx = 3200;
  if (Math.max(bm.width, bm.height) > mx) { const s = mx / Math.max(bm.width, bm.height), c = document.createElement('canvas'); c.width = Math.round(bm.width * s); c.height = Math.round(bm.height * s); c.getContext('2d').drawImage(bm, 0, 0, c.width, c.height); blob = await new Promise(r => c.toBlob(r, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92)); }
  const id = uid('img'); await imgPut(id, blob); dui.imgs[id] = await createImageBitmap(blob); dui.thumbs[id] = URL.createObjectURL(blob); return {id, ar: bm.width / bm.height};
}
function dtpAddInlineImg() { dtpFilePick(r => { const d = dtpDoc(), i = dui.sel && dui.sel.i != null ? dui.sel.i + 1 : d.story.length; d.story.splice(i, 0, {k: 'img', imgId: r.id, ar: r.ar, w: 'col', pct: 100, al: 'l', cap: ''}); dui.sel = {t: 'block', i}; dtpTouch(true); dtpPanel(); }); }

/* ---------- aba Estilos ---------- */
function dtpEstilosHTML(d) {
  const u = d.unit, ks = Object.keys(d.styles);
  return `<small class="muted block">Mudar um estilo muda todos os parágrafos que o usam. Medidas de texto em pontos (pt).</small><div id="dtpOver">${dtpOverHTML(d)}</div>` + ks.map(k => { const s = d.styles[k], f = (fld, lab, step) => `<div class="field"><label>${lab}</label><input type="number" step="${step || 0.5}" value="${+s[fld].toFixed(2)}" onchange="dtpStyleSet('${k}','${fld}',+this.value)"></div>`, chk = (fld, lab) => `<label class="dtp-chk"><input type="checkbox" ${s[fld] ? 'checked' : ''} onchange="dtpStyleSet('${k}','${fld}',this.checked?1:0)"> ${lab}</label>`;
    return `<details class="dtp-style" ${k === 'body' ? 'open' : ''}><summary><b>${esc(s.n)}</b> <small class="muted">${esc(s.font)} · ${s.size}/${s.lead} pt</small></summary>
    <div class="field"><label>Fonte</label><select onchange="dtpStyleSet('${k}','font',this.value)">${dtpFontOpts(s.font)}</select></div>
    <div class="grid-2">${f('size', 'Corpo (pt)')}${f('lead', 'Entrelinha (pt)')}${f('before', 'Espaço antes (pt)')}${f('after', 'Espaço depois (pt)')}${f('indent', 'Recuo da 1ª linha (pt)')}<div class="field"><label>Letra capitular (linhas)</label><input type="number" min="0" max="8" value="${s.drop}" onchange="dtpStyleSet('${k}','drop',+this.value)"></div></div>
    <div class="grid-2"><div class="field"><label>Alinhamento</label><select onchange="dtpStyleSet('${k}','align',this.value)">${[['left', 'Esquerda'], ['justify', 'Justificado'], ['center', 'Centro'], ['right', 'Direita']].map(([a, l]) => `<option value="${a}" ${s.align === a ? 'selected' : ''}>${l}</option>`).join('')}</select></div><div class="field"><label>Cor</label><input type="color" value="${s.color}" onchange="dtpStyleSet('${k}','color',this.value)"></div></div>
    <div class="row-gap" style="flex-wrap:wrap">${chk('b', 'Negrito')}${chk('i', 'Itálico')}${chk('caps', 'CAIXA ALTA')}${chk('keep', 'Manter com o próximo')}</div>${DTP_STYLE_KEYS.includes(k) ? '' : `<button class="btn sm" onclick="dtpStyleDel('${k}')">Excluir estilo</button>`}</details>`; }).join('') + `<div class="row-gap" style="margin-top:8px"><button class="btn sm" onclick="dtpStyleNew()">＋ Novo estilo</button><button class="btn sm" onclick="dtpStyleSwap()">Trocar fonte de títulos/corpo…</button></div>`;
}
function dtpStyleSet(k, f, v) { const d = dtpDoc(); d.styles[k][f] = v; if (f === 'size' && !d.styles[k].leadTouched) { /* mantém a entrelinha informada */ } dtpTouch(true); if (f === 'font') dtpRefresh(); }
function dtpStyleNew() { const n = prompt('Nome do novo estilo:'); if (!n) return; const d = dtpDoc(), id = 's' + Date.now().toString(36); d.styles[id] = Object.assign({}, d.styles.body, {n: n.slice(0, 40)}); dtpTouch(true); dtpPanel(); }
function dtpStyleDel(k) { const d = dtpDoc(); delete d.styles[k]; d.story.forEach(s => { if (s.st === k) s.st = 'body'; }); dtpTouch(true); dtpPanel(); }
function dtpStyleSwap() { const d = dtpDoc(), h = prompt('Fonte dos títulos (nome exato):', d.styles.h1.font); if (!h) return; const b = prompt('Fonte do texto corrido (nome exato):', d.styles.body.font); if (!b) return; ['h1', 'h2', 'quote'].forEach(k => d.styles[k].font = h); ['body', 'h3', 'caption'].forEach(k => d.styles[k].font = b); dtpTouch(true); dtpRefresh(true); }

/* ---------- aba Objeto ---------- */
const dtpSelItem = () => { const d = dtpDoc(); return dui.sel && dui.sel.t === 'item' ? dtpItems(d, dui.sel.pi).find(q => q.id === dui.sel.id) : null; };
function dtpObjetoHTML(d, N) {
  const it = dtpSelItem(), u = d.unit;
  const add = `<div class="okr-label">INSERIR NA PÁGINA ${dui.pi + 1}</div><div class="row-gap" style="flex-wrap:wrap"><button class="btn sm" onclick="dtpAddFloat('img')">＋ Imagem flutuante</button><button class="btn sm" onclick="dtpAddFloat('text')">＋ Quadro de texto</button><button class="btn sm" onclick="dtpAddFloat('rect')">＋ Retângulo</button></div><small class="muted block" style="margin:6px 0">Mão livre: <b>arraste qualquer parágrafo ou imagem da página</b> e ele vira um quadro solto, que você leva para onde quiser (↩ Devolver ao fluxo volta ao texto corrido). Também dá para desenhar com as ferramentas Texto (T), Imagem (I) e Retângulo (R). Imagem flutuante com “Contornar” faz o texto desviar dela.</small>`;
  if (!it) return add + '<p class="muted" style="font-size:12px">Selecione um objeto na página para editar medidas e contorno de texto.</p>';
  const fld = (k, lab) => `<div class="field"><label>${lab}</label><input type="number" step="any" value="${dtpFmt(it[k], u)}" onchange="dtpItemSet('${k}',dtpToPt(this.value,dtpUnit()))"></div>`;
  return add + `<div class="okr-label">${it.k === 'img' ? 'IMAGEM' : it.k === 'text' ? 'QUADRO DE TEXTO' : 'RETÂNGULO'} · medidas em ${DTP_UL[u]}</div><div class="grid-2">${fld('x', 'X')}${fld('y', 'Y')}${fld('w', 'Largura')}${fld('h', 'Altura')}</div>
  <div class="row-gap" style="flex-wrap:wrap"><button class="btn sm" onclick="dtpItemAlign('h')">Centralizar na largura</button><button class="btn sm" onclick="dtpItemAlign('m')">Ajustar às margens</button><button class="btn sm" onclick="dtpItemAlign('col')">Largura da coluna</button></div>
  <div class="grid-2" style="margin-top:8px"><div class="field"><label>Texto ao redor</label><select onchange="dtpItemSet('wrap',this.value)">${[['none', 'Nenhum (por cima)'], ['around', 'Contornar o quadro'], ['jump', 'Pular (texto continua abaixo)']].map(([k, l]) => `<option value="${k}" ${it.wrap === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>${fld('off', 'Afastamento do texto')}</div>
  ${it.k === 'img' ? `<div class="row-gap" style="flex-wrap:wrap"><button class="btn sm" onclick="dtpPickImg()">${it.imgId ? 'Trocar imagem' : 'Escolher imagem'}</button></div><label class="muted" style="font-size:11px">Zoom do enquadramento: ${(it.zoom || 1).toFixed(2)}×</label><input type="range" min="1" max="4" step="0.05" value="${it.zoom || 1}" oninput="dtpItemSet('zoom',+this.value,true)">` : ''}
  ${it.k === 'rect' ? `<div class="grid-2"><div class="field"><label>Cor</label><input type="color" value="${it.fill || '#E7DCC8'}" onchange="dtpItemSet('fill',this.value)"></div><div class="field"><label>Opacidade</label><input type="range" min="0" max="1" step="0.05" value="${it.op != null ? it.op : 1}" oninput="dtpItemSet('op',+this.value,true)"></div></div>` : ''}
  ${it.k === 'text' ? `<div class="field"><label>Texto</label><textarea rows="5" oninput="dtpItemSet('text',this.value,true)">${esc(it.text)}</textarea></div><div class="grid-2"><div class="field"><label>Estilo</label><select onchange="dtpItemSet('st',this.value)">${Object.keys(d.styles).map(k => `<option value="${k}" ${it.st === k ? 'selected' : ''}>${esc(d.styles[k].n)}</option>`).join('')}</select></div><div class="field"><label>Cor de fundo</label><input type="color" value="${it.fill || '#FFFFFF'}" onchange="dtpItemSet('fill',this.value)"><label class="dtp-chk"><input type="checkbox" ${it.fill ? 'checked' : ''} onchange="dtpItemSet('fill',this.checked?'#FFFFFF':'')"> usar fundo</label></div></div>` : ''}
  ${it.k === 'text' || it.k === 'img' ? `<div class="row-gap" style="margin-top:8px;flex-wrap:wrap">${it.k === 'text' ? '<button class="btn sm" onclick="dtpItemFitH()">Ajustar altura ao texto</button>' : ''}<button class="btn sm" onclick="dtpItemToFlow()" title="Devolve ao fluxo do texto (após o parágrafo selecionado ou no fim)">↩ Devolver ao fluxo</button></div>` : ''}
  <div class="row-gap" style="margin-top:8px;flex-wrap:wrap"><button class="btn sm" onclick="dtpItemOrder(1)">Trazer para frente</button><button class="btn sm" onclick="dtpItemOrder(-1)">Enviar para trás</button><button class="btn sm" onclick="dtpItemDup()">Duplicar (Ctrl+D)</button><button class="btn sm" onclick="dtpItemDel()">${ico('trash', 13)} Excluir</button></div>`;
}
function dtpItemSet(k, v, quiet) { const it = dtpSelItem(); if (!it) return; it[k] = v; dtpTouch(true); if (!quiet && !['x', 'y', 'w', 'h', 'off'].includes(k)) dtpPanel(); }
function dtpItemAlign(m) { const d = dtpDoc(), it = dtpSelItem(); if (!it) return; const g = dtpGeom(d, dui.sel.pi); if (m === 'h') it.x = (g.W - it.w) / 2; if (m === 'm') { it.x = g.x0; it.w = g.x1 - g.x0; } if (m === 'col') { it.x = g.colX(0); it.w = g.colW(0); } dtpTouch(true); dtpPanel(); }
function dtpItemOrder(dd) { const d = dtpDoc(), a = dtpItems(d, dui.sel.pi), i = a.findIndex(q => q.id === dui.sel.id), j = Math.max(0, Math.min(a.length - 1, i + dd)); [a[i], a[j]] = [a[j], a[i]]; dtpTouch(true); }
function dtpItemDup() { const d = dtpDoc(), it = dtpSelItem(); if (!it) return; const c = JSON.parse(JSON.stringify(it)); c.id = uid('fr'); c.x += 12; c.y += 12; dtpItems(d, dui.sel.pi).push(c); dui.sel = {t: 'item', id: c.id, pi: dui.sel.pi}; dtpTouch(true); dtpPanel(); }
/* mão livre: solta o parágrafo/imagem do fluxo e vira um quadro que você arrasta para onde quiser */
function dtpDetach(dr) {
  const d = dtpDoc(), f = dui.flow, it = d.story[dr.sidx], P = f.pages[dr.pi]; if (!it || !P) return null; let fr;
  if (dr.kind === 'para' && it.k === 'p') {
    const ls = P.lines.filter(l => l.sidx === dr.sidx && l.col === dr.col); if (!ls.length) return null; const st = d.styles[it.st] || d.styles.body, pad = 4;
    const x0 = Math.min(...ls.map(l => l.x0)), x1 = Math.max(...ls.map(l => l.x1));
    fr = {id: uid('fr'), k: 'text', x: x0 - pad, y: ls[0].y - pad, w: Math.max(60, x1 - x0) + 2 * pad, h: 9999, wrap: 'around', off: 6, text: it.t, st: it.st, pad, fill: '', imgId: '', zoom: 1};
    const r = dtpFrame(d, fr, dr.pi), last = r.lines[r.lines.length - 1]; fr.h = Math.max(20, (last ? last.y + last.lead - fr.y : st.lead) + pad);
  } else if (dr.kind === 'block' && it.k === 'img') {
    const b = P.blocks.find(q => q.sidx === dr.sidx); if (!b) return null;
    fr = {id: uid('fr'), k: 'img', x: b.x, y: b.y, w: b.w, h: b.h, wrap: 'around', off: 8, imgId: it.imgId, zoom: 1, ar: it.ar};
  } else return null;
  d.story.splice(dr.sidx, 1); dtpItems(d, dr.pi).push(fr); return fr;
}
function dtpItemToFlow() {
  const d = dtpDoc(), it = dtpSelItem(); if (!it) return; const at = dui.sel && dui.sel.i != null ? dui.sel.i + 1 : d.story.length;
  if (it.k === 'text') d.story.splice(at, 0, {k: 'p', st: d.styles[it.st] ? it.st : 'body', t: it.text.replace(/\n+/g, ' ')});
  else if (it.k === 'img' && it.imgId) d.story.splice(at, 0, {k: 'img', imgId: it.imgId, ar: it.ar || it.w / it.h, w: 'col', pct: 100, al: 'l', cap: ''});
  else { toast('Só texto e imagem voltam ao fluxo.'); return; }
  const a = dtpItems(d, dui.sel.pi), i = a.findIndex(q => q.id === it.id); a.splice(i, 1); dui.sel = null; dtpTouch(true); dtpSnap(); dtpPanel(); toast('O quadro voltou para o fluxo do texto.');
}
function dtpItemFitH() { const d = dtpDoc(), it = dtpSelItem(); if (!it || it.k !== 'text') return; const t = Object.assign({}, it, {h: 9999}), r = dtpFrame(d, t, dui.sel.pi), last = r.lines[r.lines.length - 1]; if (last) { it.h = Math.max(16, last.y + last.lead - it.y + (it.pad != null ? it.pad : 4)); dtpTouch(true); dtpPanel(); } }
function dtpItemDel() { const d = dtpDoc(), a = dtpItems(d, dui.sel.pi), i = a.findIndex(q => q.id === dui.sel.id); if (i < 0) return; a.splice(i, 1); dui.sel = null; dtpTouch(true); dtpPanel(); }
function dtpAddFloat(k) { const d = dtpDoc(), g = dtpGeom(d, dui.pi), w = g.colW(0), h = k === 'text' ? 80 : g.colW(0) * 0.7; const it = dtpMakeItem(k === 'img' ? 'i' : k === 'text' ? 't' : 'r', g.colX(0), g.y0, w, h); dtpItems(d, dui.pi).push(it); dui.sel = {t: 'item', id: it.id, pi: dui.pi}; dtpTouch(true); dtpPanel(); if (k === 'img') dtpPickImg(); }
function dtpPickImg() { const it = dtpSelItem(); if (!it) return; dtpFilePick(r => { const q = dtpSelItem(); if (!q) return; q.imgId = r.id; q.ar = r.ar; dtpTouch(true); dtpPanel(); }); }

/* ---------- matéria (modo só texto, com a marca do estouro) ---------- */
const DTP_PFX = {h1: '# ', h2: '## ', h3: '### ', quote: '> ', caption: '^ ', body: ''};
const DTP_MARK = '⟦ ESTOURO — daqui para baixo o texto não cabe ⟧';
function dtpStoryText(d, mark) {
  const ov = mark && dui.flow && dui.flow.overset ? dui.flow.overset.sidx : -1;
  return d.story.map((s, i) => (i === ov ? DTP_MARK + '\n\n' : '') + (s.k === 'img' ? `[[img:${s.imgId}]]` : s.k === 'break' ? '[[quebra-de-pagina]]' : s.k === 'colbreak' ? '[[quebra-de-coluna]]' : (DTP_PFX[s.st] != null ? DTP_PFX[s.st] : '@' + s.st + ' ') + s.t)).join('\n\n');
}
function dtpTextToStory(d, t) {
  const old = d.story.filter(s => s.k === 'img'), used = new Set(), rev = Object.keys(DTP_PFX).filter(k => DTP_PFX[k]).sort((a, b) => DTP_PFX[b].length - DTP_PFX[a].length);
  return t.replace(/\r/g, '').split(/\n\s*\n/).map(b => b.trim()).filter(b => b && b !== DTP_MARK).map(b => {
    let m; if ((m = b.match(/^\[\[img:([\w-]+)\]\]$/))) { const o = old.find((q, i) => q.imgId === m[1] && !used.has(i)); if (o) { used.add(old.indexOf(o)); return o; } return null; }
    if (b === '[[quebra-de-pagina]]') return {k: 'break'}; if (b === '[[quebra-de-coluna]]') return {k: 'colbreak'};
    if ((m = b.match(/^@([\w-]+) /)) && d.styles[m[1]]) return {k: 'p', st: m[1], t: b.slice(m[0].length).replace(/\s*\n\s*/g, ' ')};
    for (const k of rev) if (b.startsWith(DTP_PFX[k])) return {k: 'p', st: k, t: b.slice(DTP_PFX[k].length).replace(/\s*\n\s*/g, ' ')};
    return {k: 'p', st: 'body', t: b.replace(/\s*\n\s*/g, ' ')};
  }).filter(Boolean);
}
function dtpStoryRender() {
  const d = dtpDoc(), el = $('dtpStory'); if (!el) return;
  el.innerHTML = `<div class="dtp-sbar"><b>Matéria</b> <small class="muted">— edição só do texto, sem a diagramação. Prefixos: # título 1, ## título 2, ### título 3, &gt; citação, ^ legenda, @estilo para estilos próprios; <code>[[img:…]]</code> é uma imagem no texto.</small><span class="row-gap"><button class="btn sm" onclick="dtpStoryApply()">Aplicar e atualizar marca do estouro</button><button class="btn sm dark" onclick="dtpView('layout')">Voltar ao layout</button></span></div><div id="dtpOver2">${dtpOverHTML(d)}</div><textarea id="dtpStoryTa" spellcheck="true">${esc(dtpStoryText(d, true))}</textarea>`;
  const ta = $('dtpStoryTa'); ta.addEventListener('input', () => { clearTimeout(dtpStoryRender.t); dtpStoryRender.t = setTimeout(() => { d.story = dtpTextToStory(d, ta.value); dtpTouch(true); }, 500); });
}
function dtpStoryApply() { const d = dtpDoc(), ta = $('dtpStoryTa'); if (!ta) return; d.story = dtpTextToStory(d, ta.value); dui.flow = dtpFlow(d); dtpTouch(true); const pos = ta.scrollTop; $('dtpStory').querySelector('#dtpOver2').innerHTML = dtpOverHTML(d); ta.value = dtpStoryText(d, true); ta.scrollTop = pos; toast(dui.flow.overset ? 'Marca de estouro posta no texto.' : 'Todo o texto cabe.'); }
