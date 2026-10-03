/* ===== Diagramação · referência (leitura de margens, colunas, entrelinha e cores de uma imagem) e exportação em PDF ===== */

/* ---------- referência ---------- */
function dtpRefHTML(d) {
  const r = dui.refRes, pc = v => (v * 100).toFixed(1) + '%';
  return `<small class="muted block">Suba um print ou foto de uma página que você quer imitar. Ela vira uma camada translúcida sobre a página (para você alinhar guias na mão) e o Studio mede margens, colunas, entrelinha e cores para aplicar no seu documento, com o seu conteúdo.</small>
  <div class="row-gap" style="margin:8px 0;flex-wrap:wrap"><button class="btn sm dark" onclick="dtpRefPick()">${dui.ref ? 'Trocar referência' : 'Subir referência'}</button>${dui.ref ? `<button class="btn sm" onclick="dui.ref=null;dui.refOn=false;dui.refRes=null;dtpDraw();dtpPanel()">Remover</button>` : ''}</div>
  ${dui.ref ? `<label class="dtp-chk"><input type="checkbox" ${dui.refOn ? 'checked' : ''} onchange="dui.refOn=this.checked;dtpDraw()"> Mostrar sobre a página</label><label class="muted" style="font-size:11px">Opacidade ${Math.round(dui.refOp * 100)}%</label><input type="range" min="10" max="90" value="${Math.round(dui.refOp * 100)}" oninput="dui.refOp=this.value/100;dtpDraw()"><div class="row-gap" style="margin-top:8px"><button class="btn sm dark" onclick="dtpRefRun()">Analisar a referência</button></div>` : ''}
  ${r ? `<div class="dtp-res"><div class="okr-label">O QUE FOI ENCONTRADO</div><ul style="margin:4px 0 8px 16px;padding:0;font-size:12px;line-height:1.55">
   <li><b>Estrutura:</b> ${r.aligned >= 0.55 ? 'composição em <b>grade</b> (textos alinhados à mesma borda)' : 'composição <b>mais livre</b> (pouco alinhamento a uma grade)'} · ${r.cols} coluna(s)${r.cols > 1 ? ` · espaço entre colunas ${(r.gutter * d.page.w).toFixed(1)} pt` : ''}</li>
   <li><b>Margens</b> (proporção da página): topo ${pc(r.m.t)} · base ${pc(r.m.b)} · esquerda ${pc(r.m.l)} · direita ${pc(r.m.r)}</li>
   <li><b>Respiro:</b> ${r.lead ? `entrelinha ≈ ${(r.lead * d.page.h).toFixed(1)} pt no seu formato → corpo ≈ ${r.size} pt` : 'não detectei linhas de texto regulares'}</li>
   <li><b>Cores:</b> fundo <span class="dtp-sw" style="background:${r.bg}"></span>${r.bg} · texto <span class="dtp-sw" style="background:${r.text}"></span>${r.text}${r.accent ? ` · destaque <span class="dtp-sw" style="background:${r.accent}"></span>${r.accent}` : ''}</li>
   ${r.warn.map(w => `<li style="color:#b45309">${esc(w)}</li>`).join('')}</ul>
   <div class="row-gap" style="flex-wrap:wrap">${[['margins', 'Margens'], ['cols', 'Colunas'], ['lead', 'Corpo e entrelinha'], ['grid', 'Grade de linha de base'], ['colors', 'Cores']].map(([k, l]) => `<label class="dtp-chk"><input type="checkbox" id="dtpRa-${k}" ${k === 'grid' ? '' : 'checked'}> ${l}</label>`).join('')}</div>
   <div class="row-gap" style="margin-top:8px"><button class="btn sm dark" onclick="dtpRefApply()">Aplicar ao documento</button></div>
   <small class="muted block" style="margin-top:6px"><b>Fontes:</b> a medição é feita só pelos pixels, então não identifica a fonte. Compare na referência e escolha na aba Estilos. A leitura da fonte e dos blocos por IA (visão) é a próxima etapa e depende da chave de IA no servidor.</small></div>` : ''}`;
}
function dtpRefPick() { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = async () => { const f = i.files[0]; if (!f) return; try { dui.ref = await createImageBitmap(f); dui.refOn = true; dui.refRes = null; dtpPanel(); dtpDraw(); } catch (e) { toast('Não consegui abrir essa imagem.'); } }; i.click(); }
function dtpRefRun() { if (!dui.ref) return; dui.refRes = dtpAnalyze(dui.ref, dtpDoc()); dtpPanel(); }
const dtpHex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
function dtpAnalyze(bm, d) {
  const W = 700, H = Math.max(40, Math.round(W * bm.height / bm.width)), c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d', {willReadFrequently: true}); x.drawImage(bm, 0, 0, W, H);
  const px = x.getImageData(0, 0, W, H).data, warn = [];
  /* fundo = cor mais comum nas bordas */
  const cnt = new Map(), edge = Math.round(Math.min(W, H) * 0.02) || 1;
  const bump = (xx, yy) => { const i = (yy * W + xx) * 4, k = (px[i] >> 4) << 8 | (px[i + 1] >> 4) << 4 | px[i + 2] >> 4, e = cnt.get(k) || {n: 0, r: 0, g: 0, b: 0}; e.n++; e.r += px[i]; e.g += px[i + 1]; e.b += px[i + 2]; cnt.set(k, e); };
  for (let yy = 0; yy < H; yy += 2) for (let xx = 0; xx < edge; xx++) { bump(xx, yy); bump(W - 1 - xx, yy); }
  for (let xx = 0; xx < W; xx += 2) for (let yy = 0; yy < edge; yy++) { bump(xx, yy); bump(xx, H - 1 - yy); }
  let bg = null; cnt.forEach(e => { if (!bg || e.n > bg.n) bg = e; }); const br = bg.r / bg.n, bgg = bg.g / bg.n, bb = bg.b / bg.n;
  const ink = new Uint8Array(W * H), dist = new Uint16Array(W * H); let inkN = 0;
  for (let i = 0; i < W * H; i++) { const q = Math.abs(px[i * 4] - br) + Math.abs(px[i * 4 + 1] - bgg) + Math.abs(px[i * 4 + 2] - bb); dist[i] = q; if (q > 90) { ink[i] = 1; inkN++; } }
  const ratio = inkN / (W * H); if (ratio > 0.55) warn.push('A referência tem fundo ou imagem ocupando quase toda a página; as medidas podem ser pouco confiáveis.');
  const rp = new Uint32Array(H), cp = new Uint32Array(W); for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) if (ink[yy * W + xx]) { rp[yy]++; cp[xx]++; }
  const rt = Math.max(2, Math.round(W * 0.004)), ct = Math.max(2, Math.round(H * 0.004));
  let t = 0, b = H - 1, l = 0, r = W - 1; while (t < H - 1 && rp[t] < rt) t++; while (b > t && rp[b] < rt) b--; while (l < W - 1 && cp[l] < ct) l++; while (r > l && cp[r] < ct) r--;
  const m = {t: t / H, b: (H - 1 - b) / H, l: l / W, r: (W - 1 - r) / W};
  if (r - l < W * 0.25 || b - t < H * 0.25) warn.push('Pouco conteúdo encontrado; margens podem estar subestimadas.');
  /* colunas: vales verticais dentro da caixa de conteúdo */
  let mx = 0; for (let xx = l; xx <= r; xx++) mx = Math.max(mx, cp[xx]);
  const gaps = []; let gs = -1; for (let xx = l; xx <= r + 1; xx++) { const empty = xx <= r && cp[xx] <= mx * 0.03; if (empty && gs < 0) gs = xx; if (!empty && gs >= 0) { if (gs > l && xx - 1 < r && xx - gs >= W * 0.012) gaps.push([gs, xx - 1]); gs = -1; } }
  let bounds = [l, ...gaps.flatMap(g => [g[0] - 1, g[1] + 1]), r], cols = []; for (let i = 0; i < bounds.length; i += 2) cols.push([bounds[i], bounds[i + 1]]); cols = cols.filter(q => q[1] - q[0] >= W * 0.08);
  if (cols.length > 6) cols = [[l, r]]; if (!cols.length) cols = [[l, r]];
  const gut = cols.length > 1 ? gaps.map(g => g[1] - g[0] + 1).sort((a, c2) => a - c2)[Math.floor(gaps.length / 2)] / W : 0;
  /* alinhamento da borda esquerda de cada faixa de texto (grade × livre) */
  const c0 = cols[0], hist = new Map(); let bands = 0;
  for (let yy = t; yy < b; yy += 4) { let fx = -1; for (let xx = c0[0] - 4; xx <= c0[1] && xx < W; xx++) { if (xx < 0) continue; let hit = 0; for (let k = 0; k < 4 && yy + k < H; k++) if (ink[(yy + k) * W + xx]) hit++; if (hit) { fx = xx; break; } } if (fx >= 0) { bands++; const k = Math.round(fx / (W * 0.012)); hist.set(k, (hist.get(k) || 0) + 1); } }
  let top1 = 0; hist.forEach((n, k) => { const s = n + (hist.get(k - 1) || 0) + (hist.get(k + 1) || 0); if (s > top1) top1 = s; }); const aligned = bands ? top1 / bands : 0;
  /* entrelinha: autocorrelação do perfil de linhas na primeira coluna */
  const pr = new Float32Array(H); for (let yy = t; yy <= b; yy++) { let n = 0; for (let xx = c0[0]; xx <= c0[1]; xx++) n += ink[yy * W + xx]; pr[yy] = n; }
  let mean = 0, cntR = b - t + 1; for (let yy = t; yy <= b; yy++) mean += pr[yy]; mean /= cntR; let v0 = 0; for (let yy = t; yy <= b; yy++) v0 += (pr[yy] - mean) ** 2;
  let bestLag = 0, bestV = 0; if (v0 > 0) for (let lag = 5; lag <= Math.min(80, cntR / 3); lag++) { let s = 0; for (let yy = t; yy + lag <= b; yy++) s += (pr[yy] - mean) * (pr[yy + lag] - mean); const v = s / v0; if (v > bestV + 0.015) { bestV = v; bestLag = lag; } }
  /* prefere o menor período cujo valor é próximo do melhor (evita múltiplos) */
  if (bestLag) for (let lag = 5; lag < bestLag; lag++) { let s = 0; for (let yy = t; yy + lag <= b; yy++) s += (pr[yy] - mean) * (pr[yy + lag] - mean); if (s / v0 >= bestV * 0.85) { bestLag = lag; break; } }
  const lead = bestV > 0.2 ? bestLag / H : 0; if (!lead) warn.push('Não encontrei linhas de texto regulares (talvez a referência seja só imagem ou título grande).');
  /* cores: texto = pixels de maior contraste; destaque = tom saturado mais frequente */
  let tr = 0, tg = 0, tb = 0, tn = 0; const sat = new Map();
  for (let i = 0; i < W * H; i++) if (ink[i]) { const R = px[i * 4], G = px[i * 4 + 1], B = px[i * 4 + 2], mxc = Math.max(R, G, B), mnc = Math.min(R, G, B), s = mxc ? (mxc - mnc) / mxc : 0; if (dist[i] > 330) { tr += R; tg += G; tb += B; tn++; } if (s > 0.35 && mxc > 60) { const k = (R >> 5) << 6 | (G >> 5) << 3 | B >> 5, e = sat.get(k) || {n: 0, r: 0, g: 0, b: 0}; e.n++; e.r += R; e.g += G; e.b += B; sat.set(k, e); } }
  let acc = null; sat.forEach(e => { if (e.n > 120 && (!acc || e.n > acc.n)) acc = e; });
  const textHex = tn ? dtpHex(tr / tn, tg / tn, tb / tn) : (lum(dtpHex(br, bgg, bb)) > 0.4 ? '#222222' : '#F5F5F5');
  const leadPt = lead * d.page.h, size = leadPt ? Math.max(6, Math.round(leadPt / 1.38 * 2) / 2) : 0;
  return {bg: dtpHex(br, bgg, bb), text: textHex, accent: acc ? dtpHex(acc.r / acc.n, acc.g / acc.n, acc.b / acc.n) : '', m, cols: cols.length, gutter: gut, aligned, lead, size, ink: ratio, warn};
}
function dtpRefApply() {
  const d = dtpDoc(), r = dui.refRes; if (!r) return; const on = k => $('dtpRa-' + k) && $('dtpRa-' + k).checked, W = d.page.w, H = d.page.h;
  if (on('margins')) { d.margins.t = Math.max(0, r.m.t * H); d.margins.b = Math.max(0, r.m.b * H); d.margins.i = Math.max(0, r.m.l * W); d.margins.o = Math.max(0, r.m.r * W); }
  if (on('cols')) { d.cols = r.cols; if (r.gutter) d.gutter = Math.max(4, r.gutter * W); }
  if (on('lead') && r.lead) { d.styles.body.lead = +(r.lead * H).toFixed(2); d.styles.body.size = r.size; d.styles.caption.size = Math.max(5, +(r.size * 0.8).toFixed(1)); d.styles.caption.lead = +(d.styles.body.lead * 0.8).toFixed(2); }
  if (on('grid') && r.lead) d.baseline = +(r.lead * H).toFixed(2);
  if (on('colors')) { d.paper = r.bg; ['body', 'caption', 'h2'].forEach(k => d.styles[k].color = r.text); if (r.accent) ['h1', 'h3', 'quote'].forEach(k => d.styles[k].color = r.accent); else d.styles.h1.color = r.text; }
  dui.refOn = false; dtpTouch(true); dtpSnap(); dtpPanel(); toast('Medidas da referência aplicadas. Desfaça com Ctrl+Z se não gostar.');
}

/* ---------- exportação ---------- */
function dtpExportHTML(d) {
  const f = dui.flow, n = dtpPageCount(d, f), over = f && f.overset ? `<div class="dtp-warn"><b>Há texto em estouro</b> (~${f.overset.words} palavras). O PDF sairá sem esse trecho.</div>` : '';
  return `${over}<small class="muted block">O PDF sai com uma página por folha, na medida exata do documento. Com marcas de corte, a folha ganha área extra e o arquivo traz as caixas de corte (TrimBox) e de sangria (BleedBox) para a gráfica.</small>
  <div class="grid-2" style="margin-top:8px"><div class="field"><label>Resolução</label><select id="dtpDpi"><option value="150">150 dpi (rascunho)</option><option value="200">200 dpi</option><option value="300" selected>300 dpi (gráfica)</option></select></div><div class="field"><label>Páginas</label><div class="row-gap"><input id="dtpFrom" type="number" min="1" max="${n}" value="1" style="width:64px"> a <input id="dtpTo" type="number" min="1" max="${n}" value="${n}" style="width:64px"></div></div></div>
  <label class="dtp-chk"><input type="checkbox" id="dtpBl" checked> Incluir sangria (${dtpFmt(d.bleed, d.unit)} ${DTP_UL[d.unit]})</label><label class="dtp-chk"><input type="checkbox" id="dtpMk"> Marcas de corte</label>
  <div class="row-gap" style="margin-top:10px;flex-wrap:wrap"><button class="btn dark" onclick="dtpExportPDF()">Baixar PDF</button><button class="btn" onclick="dtpExportPNG()">Página atual em PNG</button><button class="btn" onclick="dtpJsonDown()">Backup (.json)</button></div>
  <small class="muted block" style="margin-top:8px">Limite: o texto vai como imagem de alta resolução (não é selecionável nem tem hifenização). Para impressão em gráfica use 300 dpi.</small>`;
}
const dtpFileName = d => (d.name || 'documento').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'documento';
async function dtpRenderPage(d, f, i, dpi, bl, marks) {
  const sc = dpi / 72, S = marks ? Math.max(bl, 0) + 24 : bl, cv = document.createElement('canvas'); cv.width = Math.round((d.page.w + 2 * S) * sc); cv.height = Math.round((d.page.h + 2 * S) * sc);
  const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, cv.width, cv.height); x.save(); x.translate(S * sc, S * sc); dtpDrawPage(x, d, f, i, sc, {imgs: dui.imgs, bleed: bl}); x.restore();
  if (marks) { x.strokeStyle = '#000'; x.lineWidth = Math.max(1, 0.5 * sc); const W = d.page.w, H = d.page.h, g = 3, L = 14, line = (a, b, c, e) => { x.beginPath(); x.moveTo((S + a) * sc, (S + b) * sc); x.lineTo((S + c) * sc, (S + e) * sc); x.stroke(); }; const o = bl + g;
    [[0, 0, -1, -1], [W, 0, 1, -1], [0, H, -1, 1], [W, H, 1, 1]].forEach(([cx, cy, sx, sy]) => { line(cx, cy + sy * o, cx, cy + sy * (o + L)); line(cx + sx * o, cy, cx + sx * (o + L), cy); }); }
  return {cv, S};
}
async function dtpExportPDF() {
  const d = dtpDoc(); if (!d) return; toast('Preparando o PDF…');
  try {
    await dtpFonts(d); await dtpLoadImgs(d); const f = dtpFlow(d), n = dtpPageCount(d, f), dpi = +$('dtpDpi').value || 300, marks = $('dtpMk').checked, bl = $('dtpBl').checked ? d.bleed : 0;
    const a = Math.max(1, Math.min(n, +$('dtpFrom').value || 1)), z = Math.max(a, Math.min(n, +$('dtpTo').value || n)), pages = [];
    for (let i = a - 1; i < z; i++) {
      const {cv, S} = await dtpRenderPage(d, f, i, dpi, bl, marks), blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.92));
      pages.push({jpeg: new Uint8Array(await blob.arrayBuffer()), w: cv.width, h: cv.height, pw: d.page.w + 2 * S, ph: d.page.h + 2 * S, tb: {s: S, w: d.page.w, h: d.page.h, bl}});
      toast(`PDF: página ${i + 1} de ${z}…`); await new Promise(r => setTimeout(r, 0));
    }
    download(`${dtpFileName(d)}.pdf`, buildPDF(pages, d.page.w, d.page.h), 'application/pdf'); toast(`PDF baixado (${pages.length} página(s), ${dpi} dpi${marks ? ', com marcas de corte' : ''}).`);
  } catch (e) { toast('Falhou: ' + e.message); }
}
async function dtpExportPNG() { const d = dtpDoc(); await dtpFonts(d); await dtpLoadImgs(d); const f = dtpFlow(d), {cv} = await dtpRenderPage(d, f, dui.pi, 200, 0, false); cv.toBlob(b => download(`${dtpFileName(d)}-pag${dui.pi + 1}.png`, b, 'image/png')); }
function dtpJsonDown() { const d = dtpDoc(); download(`${dtpFileName(d)}.json`, JSON.stringify(d, null, 1)); }
