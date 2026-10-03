/* ===== Amazon KDP: cálculo de lombada e capa completa, margens por nº de páginas, checklist e exportações =====
   Valores de referência do KDP (confira sempre no painel do KDP antes de publicar: eles mudam). */
const KDP_PAPER = {'bw-white': {n: 'Preto e branco · papel branco', k: 0.002252}, 'bw-cream': {n: 'Preto e branco · papel creme', k: 0.0025}, 'color-std': {n: 'Cor padrão', k: 0.002252}, 'color-premium': {n: 'Cor premium', k: 0.002347}};
const kdpTrims = () => DTP_PRESETS.filter(x => x.kdp);
const kdpK = () => { const p = curProject(); if (!p) return null; if (!p.kdp || typeof p.kdp !== 'object' || !p.kdp.trim) p.kdp = normalizeKdp(p.kdp); return p.kdp; };
const kdpDocCur = () => { const p = curProject(), k = kdpK(); return p && k ? (p.layouts || []).find(d => d.id === k.docId) : null; };
const kdp = {cnt: 0, checks: null};
function kdpMinInside(pages) { return pages <= 150 ? 0.375 : pages <= 300 ? 0.5 : pages <= 500 ? 0.625 : pages <= 700 ? 0.75 : 0.875; }
function kdpCalc(k, pagesN) {
  const P = DTP_PRESETS.find(x => x.id === k.trim) || DTP_PRESETS.find(x => x.id === 'kdp6x9'), [tw, th] = P.kdp, pages = Math.max(24, Math.ceil((pagesN || 24) / 2) * 2), spine = pages * KDP_PAPER[k.paper].k, bleed = 0.125;
  const wrapW = 2 * tw + spine + 2 * bleed, wrapH = th + 2 * bleed, minIn = kdpMinInside(pages), px = v => Math.round(v * 300);
  return {tw, th, pages, spine, bleed, wrapW, wrapH, minIn, px: {w: px(wrapW), h: px(wrapH)}, spineText: pages >= 80, preset: P};
}
const kdpPages = () => { const k = kdpK(); return k.pages > 0 ? k.pages : kdp.cnt || 24; };
const kdpIn = v => (+v).toFixed(3).replace('.', ',') + ' pol. (' + (v * 25.4).toFixed(1).replace('.', ',') + ' mm)';

function kdpRender(r, p) {
  const k = kdpK(), calc = kdpCalc(k, kdpPages()), docs = p.layouts || [], doc = kdpDocCur(), ebs = p.ebooks || [];
  r.innerHTML = edTabs('amazon') + `<div class="page-head"><div><h1>Amazon KDP</h1><p>Feche o livro para publicar na Amazon: formato do miolo, lombada, capa completa (contracapa + lombada + capa), checklist e arquivos prontos. Os números seguem as regras do KDP; confira no painel do KDP antes de enviar, porque elas mudam.</p></div></div>
  <div class="mot-wrap"><div>
  <div class="form-grid"><div class="field"><label>Formato do livro impresso (corte)</label><select onchange="kdpSet('trim',this.value)">${kdpTrims().map(x => `<option value="${x.id}" ${x.id === k.trim ? 'selected' : ''}>${esc(x.n.replace('Amazon KDP · ', ''))}</option>`).join('')}</select></div>
  <div class="field"><label>Papel e tinta</label><select onchange="kdpSet('paper',this.value)">${Object.entries(KDP_PAPER).map(([id, v]) => `<option value="${id}" ${id === k.paper ? 'selected' : ''}>${v.n}</option>`).join('')}</select></div>
  <div class="field"><label>Documento do miolo (Diagramação)</label><select onchange="kdpSet('docId',this.value)"><option value="">— nenhum —</option>${docs.map(d => `<option value="${esc(d.id)}" ${d.id === k.docId ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select></div>
  <div class="field"><label>Número de páginas ${doc ? '(vazio = contar do documento)' : ''}</label><input type="number" min="0" max="900" value="${k.pages || ''}" placeholder="${kdp.cnt || 24}" onchange="kdpSet('pages',+this.value||0)"></div></div>
  <div class="okr-label">MEDIDAS CALCULADAS (${calc.pages} páginas)</div>
  <table class="ail-t"><tr><td>Corte (página)</td><td><b>${calc.tw} × ${calc.th} pol.</b> (${(calc.tw * 25.4).toFixed(1)} × ${(calc.th * 25.4).toFixed(1)} mm)</td></tr>
  <tr><td>Lombada</td><td><b>${kdpIn(calc.spine)}</b></td></tr>
  <tr><td>Capa completa (com sangria 0,125 pol.)</td><td><b>${calc.wrapW.toFixed(3).replace('.', ',')} × ${calc.wrapH.toFixed(3).replace('.', ',')} pol.</b> → ${calc.px.w} × ${calc.px.h} px a 300 dpi</td></tr>
  <tr><td>Margem interna mínima (lombada)</td><td><b>${kdpIn(calc.minIn)}</b> para ${calc.pages} páginas</td></tr>
  <tr><td>Texto na lombada</td><td>${calc.spineText ? 'permitido (80 páginas ou mais)' : '<b style="color:#b45309">não recomendado</b> (menos de 80 páginas)'}</td></tr>
  <tr><td>Código de barras</td><td>reserve 2 × 1,2 pol. no canto inferior direito da contracapa (o KDP coloca o ISBN)</td></tr></table>
  <div class="row-gap" style="margin:10px 0;flex-wrap:wrap"><button class="btn dark" onclick="kdpApplyDoc()">${doc ? 'Ajustar o documento ao formato KDP' : 'Criar documento do miolo neste formato'}</button><button class="btn" onclick="kdpOpenDoc()" ${doc ? '' : 'disabled'}>Abrir na Diagramação</button></div>
  <div class="okr-label">CHECKLIST DO MIOLO</div><div id="kdpChecks">${kdp.checks ? kdpChecksHTML(kdp.checks) : '<p class="muted" style="font-size:12px">Escolha o documento e clique em Verificar.</p>'}</div>
  <div class="row-gap" style="margin:8px 0"><button class="btn sm" onclick="kdpVerify()" ${doc ? '' : 'disabled'}>Verificar o miolo</button></div></div>
  <div><div class="mot-ch"><b>Arquivos para a Amazon</b><p class="muted" style="font-size:12px">1) Miolo em PDF · 2) Capa completa em PDF · 3) EPUB para o Kindle · 4) Capa do Kindle (JPG).</p>
  <div class="row-gap" style="flex-direction:column;align-items:stretch;gap:6px">
  <button class="btn" onclick="kdpExportInterior()" ${doc ? '' : 'disabled'}>Miolo em PDF (300 dpi, com sangria)</button>
  <button class="btn" onclick="covWrapOpen()">Criar a capa completa (Engenheiro de capa)</button>
  <button class="btn" onclick="covExportWrap()" ${p.cover && p.cover.setId && p.cover.mode === 'wrap' ? '' : 'disabled'}>Capa completa em PDF (última criada)</button>
  <button class="btn" onclick="covExportKindle()" ${p.cover && p.cover.setId ? '' : 'disabled'}>Capa do Kindle (JPG 1600 × 2560)</button>
  ${ebs.length ? `<div class="field" style="margin:0"><label>EPUB do e-book</label><div class="row-gap"><select id="kdpEb">${ebs.map(e => `<option value="${esc(e.id)}">${esc(e.name)}</option>`).join('')}</select><button class="btn" onclick="kdpEpub()">Baixar EPUB</button><button class="btn" onclick="kdpMobile()">Versão celular (PDF 9:16)</button></div></div>` : '<small class="muted">Crie o e-book na Editora para gerar o EPUB do Kindle.</small>'}</div></div>
  <small class="muted block" style="margin-top:8px">Limites: o PDF do miolo leva o texto como imagem de 300 dpi (o KDP aceita, mas o texto não é selecionável). Confira a prévia no Visualizador do KDP antes de publicar.</small></div></div>`;
}
function kdpSet(f, v) { const k = kdpK(); k[f] = v; if (f === 'docId' || f === 'pages') kdp.checks = null; persist(); kdpCount().then(() => renderEditora()); }
async function kdpCount() { const d = kdpDocCur(); if (!d) { kdp.cnt = 0; return; } try { await ensureFonts([...Object.values(d.styles).map(s => s.font), d.run.font]); kdp.cnt = dtpPageCount(d, dtpFlow(d)); } catch (e) { kdp.cnt = 0; } }
function kdpApplyTo(d, calc) {
  const mm = v => v * 25.4 * 72 / 25.4, inch = v => v * 72, P = calc.preset;
  d.page = {w: inch(calc.tw), h: inch(calc.th)}; d.facing = true; d.bleed = inch(calc.bleed); d.margins = {t: inch(0.5), b: inch(0.5), i: inch(calc.minIn + 0.125), o: inch(0.5)}; d.front = 0; d.run.folio = true;
}
async function kdpApplyDoc() {
  const p = curProject(), k = kdpK(), calc = kdpCalc(k, kdpPages());
  let d = kdpDocCur();
  if (!d) { d = dtpNew(k.trim, 'Miolo · ' + (p.cover && p.cover.title || 'livro')); k.docId = d.id; (p.layouts = p.layouts || []).push(d); }
  else if (!confirm('Ajustar “' + d.name + '” ao formato KDP ' + calc.tw + '×' + calc.th + ' pol.? Tamanho, margens e sangria mudam (o texto é mantido).')) return;
  kdpApplyTo(d, calc); persist(); kdp.checks = null; await kdpCount(); renderEditora(); toast('Documento ajustado ao formato KDP.');
}
function kdpOpenDoc() { const d = kdpDocCur(); if (!d) return; edh.area = 'diag'; go('diagram'); dtpOpen(d.id); }
async function kdpVerify() {
  const d = kdpDocCur(), k = kdpK(); if (!d) return; await dtpFonts(d); await dtpLoadImgs(d); const f = dtpFlow(d), pages = dtpPageCount(d, f), calc = kdpCalc(k, k.pages || pages), out = [];
  const ck = (ok, t, warn) => out.push({ok, warn: !ok && warn, t});
  ck(pages >= 24, `Número de páginas: ${pages} (mínimo 24 no KDP)`);
  ck(pages % 2 === 0, `Páginas ${pages % 2 ? 'ímpares: o KDP acrescenta uma página em branco ao final' : 'pares'}`, true);
  ck(Math.abs(d.page.w - calc.tw * 72) < 1 && Math.abs(d.page.h - calc.th * 72) < 1, `Tamanho do documento ${(d.page.w / 72).toFixed(2)} × ${(d.page.h / 72).toFixed(2)} pol. ${Math.abs(d.page.w - calc.tw * 72) < 1 ? '= formato escolhido' : '≠ formato escolhido (use Ajustar)'}`);
  const inner = Math.min(d.margins.i, d.facing ? d.margins.i : Math.min(d.margins.i, d.margins.o)) / 72;
  ck(inner >= calc.minIn - 0.001, `Margem interna ${inner.toFixed(3)} pol. (mínimo ${calc.minIn} para ${calc.pages} páginas)`);
  ck(Math.min(d.margins.t, d.margins.b, d.margins.o) / 72 >= 0.25, `Margens externas, topo e base ≥ 0,25 pol. (recomendado 0,5)`);
  ck(d.bleed / 72 >= 0.124, `Sangria de ${(d.bleed / 72).toFixed(3)} pol. (0,125 se houver imagem até a borda)`, true);
  ck(!f.overset, f.overset ? `Há texto em ESTOURO (~${f.overset.words} palavras que não cabem)` : 'Todo o texto cabe nas páginas');
  const low = []; const chk = (imgId, wpt, name) => { const bm = dui.imgs[imgId]; if (!bm || !wpt) return; const ppi = bm.width / (wpt / 72); if (ppi < 200) low.push(`${name} (${Math.round(ppi)} ppi)`); };
  d.pages.forEach((pg, i) => pg.items.forEach(it => it.k === 'img' && chk(it.imgId, it.w, `quadro da pág. ${i + 1}`))); f.pages.forEach((P, i) => P.blocks.forEach(b => chk(b.imgId, b.w, `imagem da pág. ${i + 1}`)));
  ck(!low.length, low.length ? 'Imagens com resolução baixa (o KDP pede 300 ppi): ' + low.slice(0, 5).join(', ') : 'Resolução das imagens ok (≥ 200 ppi)', true);
  const miss = (d.story.some(s => s.t && /\[CONFIRMAR/.test(s.t))); ck(!miss, miss ? 'Ainda há marcas [CONFIRMAR] no texto' : 'Sem marcas [CONFIRMAR] pendentes');
  kdp.checks = out; kdp.cnt = pages; renderEditora();
}
const kdpChecksHTML = a => `<ul style="list-style:none;margin:0;padding:0;font-size:12.5px;line-height:1.7">${a.map(c => `<li>${c.ok ? '<span style="color:#15803d">✔</span>' : c.warn ? '<span style="color:#b45309">⚠</span>' : '<span style="color:#dc2626">✘</span>'} ${esc(c.t)}</li>`).join('')}</ul>`;
async function kdpExportInterior() {
  const d = kdpDocCur(); if (!d) return; toast('Gerando o miolo…');
  try { const r = await dtpPdfBuild(d, {dpi: 300, marks: false, bleed: d.bleed > 0, progress: (i, z) => toast(`Miolo: página ${i} de ${z}…`)}); download(`${dtpFileName(d)}-miolo-kdp.pdf`, r.blob, 'application/pdf'); toast(`Miolo baixado (${r.n} páginas, 300 dpi${d.bleed > 0 ? ', com sangria' : ''}).`); } catch (e) { toast('Falhou: ' + e.message); }
}
async function kdpEpub() { const id = $('kdpEb').value, keep = eui.id; eui.id = id; try { await ebEpubDown(); } finally { eui.id = keep; } }
async function kdpMobile() { const id = $('kdpEb').value, keep = eui.id; eui.id = id; try { await ebPdf('mobile'); } finally { eui.id = keep; } }
