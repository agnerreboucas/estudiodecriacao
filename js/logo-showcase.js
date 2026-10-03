/* ===== Laboratório do Logo · Vitrine: o logo aplicado sobre fundo (foto, bokeh ou degradê) com filtro de cor, mais 3 variações (branco, preto, cor).
   Salva em "Meus logos" e abre no Editor de Design com camadas editáveis. ===== */
const lgPr = {view: 'hero', busy: 0, cache: {}};
const LG_PR_VIEWS = [['hero', 'Sobre o fundo'], ['white', 'Fundo branco'], ['black', 'Fundo preto'], ['color', 'Fundo colorido']];
const lgPresOf = sp => { if (!sp.pres) sp.pres = {bg: 'bokeh', imgId: '', tint: '', op: 0.78, seed: 7}; if (!sp.pres.tint) sp.pres.tint = sp.pal[1]; return sp.pres; };

/* fundos gerados (viram imagem para o Editor poder trocar depois) */
async function lgBgMake(kind, tint, seed) {
  const key = [kind, tint, seed].join('|'); if (lgPr.cache[key]) return lgPr.cache[key];
  const W = 1600, H = 1000, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d'), rnd = lgRng(seed || 1);
  const dk = mixHex(tint, '#000000', 0.55), lt = mixHex(tint, '#ffffff', 0.35);
  if (kind === 'gradient') { const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, lt); g.addColorStop(0.55, tint); g.addColorStop(1, dk); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  else if (kind === 'solid') { c.fillStyle = tint; c.fillRect(0, 0, W, H); }
  else {   // bokeh: fundo escuro-quente com círculos desfocados
    const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, mixHex(dk, '#000000', 0.2)); g.addColorStop(1, mixHex(tint, '#000000', 0.35)); c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 46; i++) { const x = rnd() * W, y = rnd() * H, r = 30 + rnd() * 150, col = rnd() < 0.5 ? lt : tint; c.globalAlpha = 0.06 + rnd() * 0.16; const rg = c.createRadialGradient(x, y, r * 0.2, x, y, r); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = rg; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
    c.globalAlpha = 1; for (let i = 0; i < 9; i++) { c.fillStyle = 'rgba(255,255,255,.05)'; c.fillRect(rnd() * W, 0, 6 + rnd() * 30, H); }
  }
  const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.9)), id = uid('bg'); await imgPut(id, blob); IMGS.set(id, await createImageBitmap(blob)); lgPr.cache[key] = id; return id;
}
async function lgPresBg(sp) { const P = lgPresOf(sp); if (P.bg === 'photo' && P.imgId) { await loadImage(P.imgId); if (IMGS.has(P.imgId)) return P.imgId; } return lgBgMake(P.bg === 'photo' ? 'bokeh' : P.bg, P.tint, P.seed); }

/* monta a lâmina (slide editável) de cada vista */
async function lgPresSlide(sp, view, W, H) {
  W = W || 1600; H = H || 1000; await lgFonts(sp); const P = lgPresOf(sp);
  const spx = Object.assign({}, sp, {rule: null, tone: view === 'hero' || view === 'black' ? {bg: 'dark', logo: 'light'} : view === 'white' ? {bg: 'light', logo: 'dark'} : null, mode: view === 'color' ? 'color' : sp.mode});
  const r = lgBuild(spx, {W, H}), sl = r.slide; sl.name = LG_PR_VIEWS.find(v => v[0] === view)[1]; sl.noBg = false; sl.isLogo = true; sl.keep = true;
  const lc = lgColors(spx);
  if (view === 'hero') {
    const id = await lgPresBg(sp); sl.bg = P.tint;
    const bg = IM('bg-photo', {x: 0, y: 0, w: W, h: H, imgId: id, radius: 0, fx: 0.5, fy: 0.5}); bg.role = 'bg-photo'; const tint = RC('tint', {x: 0, y: 0, w: W, h: H, fill: P.tint, opacity: P.bg === 'photo' ? P.op : Math.min(0.5, P.op * 0.6), radius: 0}); tint.role = 'tint';
    sl.layers.unshift(tint); sl.layers.unshift(bg);
  } else if (view === 'white') sl.bg = '#ffffff'; else if (view === 'black') sl.bg = '#0b0b0b'; else sl.bg = lc.bg;
  return sl;
}
async function lgPresPaint(cv, sp, view) { const sl = await lgPresSlide(sp, view, cv.width, cv.height); await Promise.all(sl.layers.filter(l => l.imgId).map(l => loadImage(l.imgId))); renderSlide(cv.getContext('2d'), sl, cv.width, cv.height, 1); return sl; }

/* ---------- página ---------- */
function lgPresOpen() { lg.view = 'pres'; renderDesign(); }
function lgPresPage(p, r) {
  const s = lg.cur, P = lgPresOf(s), tints = s.pal.concat(['#e8590c', '#c92a2a', '#1971c2', '#2b8a3e']).filter((c, i, a) => a.indexOf(c) === i);
  r.innerHTML = `<div class="page-head"><div><h1>Vitrine · ${esc(s.name)}</h1><p>O logo aplicado sobre um fundo com filtro de cor, e as variações em branco, preto e colorido. Salve ou abra no Editor para ajustar.</p></div><div class="actions">${projectSelect()}<button class="btn" onclick="lg.view='edit';renderDesign()">← Voltar ao logo</button></div></div>
  <div class="two dz-compose lg-edit"><div class="panel lg-prev"><canvas id="lgPrBig" width="1200" height="750" style="width:100%;border-radius:12px;border:1px solid #e6e6e6"></canvas>
    <div class="lg-prthumbs">${LG_PR_VIEWS.map(([k, l]) => `<button class="lg-prthumb ${lgPr.view === k ? 'on' : ''}" onclick="lgPr.view='${k}';lgPrRefresh()" title="${l}"><canvas data-v="${k}" width="240" height="150"></canvas></button>`).join('')}</div>
    <div class="row-gap" style="margin-top:12px;flex-wrap:wrap"><button class="btn dark" onclick="lgPrSave()">Salvar vitrine</button><button class="btn" onclick="lgPrEdit()">Abrir no Editor</button><button class="btn" onclick="lgPrDown('png')">PNG desta vista</button><button class="btn" onclick="lgPrDown('zip')">Baixar as 4 (ZIP)</button></div>
    <small class="muted block" style="margin-top:6px">No Editor cada vista vira um slide com camadas: fundo, filtro e logo (símbolo e texto) separados.</small></div>
  <div class="panel lg-opts"><section class="lg-acc open"><div class="lg-acc-b" style="display:block"><div class="okr-label">FUNDO</div><div class="tchips">${[['bokeh', 'Bokeh'], ['gradient', 'Degradê'], ['solid', 'Cor sólida'], ['photo', 'Foto']].map(([k, l]) => `<button class="tchip ${P.bg === k ? 'on' : ''}" onclick="lgPrBg('${k}')">${l}</button>`).join('')}</div>
    <div class="row-gap" style="margin:8px 0"><button class="btn sm" onclick="lgPrPhotoPick()">Enviar foto…</button>${inspo().items.some(i => i.imgId) ? '<button class="btn sm" onclick="lgPrInspoOpen()">Escolher da Inspiração</button>' : ''}${P.bg === 'bokeh' ? '<button class="btn sm" onclick="lgPrSet(\'seed\',Math.floor(Math.random()*9999)+1)">Outro bokeh</button>' : ''}</div>
    <div class="okr-label" style="margin-top:10px">COR DO FILTRO</div><div class="bk-chips">${tints.map(c => `<button class="bk-chip ${P.tint === c ? 'sel' : ''}" style="background:${c}" title="${c}" onclick="lgPrSet('tint','${c}')"></button>`).join('')}<input type="color" value="${P.tint}" oninput="lgPrSet('tint',this.value,1)" style="width:34px;height:30px;padding:0;border:1px solid #ddd;border-radius:8px"></div>
    <label class="ins" style="margin-top:10px">Intensidade do filtro <b>${Math.round(P.op * 100)}%</b><input type="range" min="0" max="100" value="${Math.round(P.op * 100)}" oninput="lgPrSet('op',this.value/100,1);this.previousElementSibling.textContent=this.value+'%'"></label>
    <small class="muted block">O filtro é uma camada de cor sobre a foto (como na vitrine de logos de marketplaces). Em bokeh e degradê ele é mais leve.</small></div></section></div></div>`;
  lgPrRefresh();
}
async function lgPrRefresh() {
  const tk = ++lgPr.busy, s = lg.cur; if (!s || !$('lgPrBig')) return;
  document.querySelectorAll('.lg-prthumb').forEach(b => b.classList.toggle('on', b.querySelector('canvas').dataset.v === lgPr.view));
  await lgPresPaint($('lgPrBig'), s, lgPr.view); if (tk !== lgPr.busy) return;
  for (const cv of [...document.querySelectorAll('.lg-prthumb canvas')]) { if (tk !== lgPr.busy || !cv.isConnected) return; try { await lgPresPaint(cv, s, cv.dataset.v); } catch (e) { /* vazio */ } }
}
let lgPrT = 0; function lgPrSet(k, v, live) { lgPresOf(lg.cur)[k] = v; if (live) { clearTimeout(lgPrT); lgPrT = setTimeout(() => { lgPrRefresh(); lgCommitSoon(); }, 80); } else renderDesign(); }
function lgPrBg(k) { const P = lgPresOf(lg.cur); if (k === 'photo' && !P.imgId) { lgPrPhotoPick(); return; } P.bg = k; renderDesign(); }
function lgPrPhotoPick() { dzPickFile('image/*', async file => { let bmp; try { bmp = await createImageBitmap(file); } catch (e) { toast('Não consegui ler essa imagem.'); return; } const id = uid('img'); await imgPut(id, file); IMGS.set(id, bmp); const P = lgPresOf(lg.cur); P.imgId = id; P.bg = 'photo'; if (P.op < 0.5) P.op = 0.78; renderDesign(); }); }
async function lgPrInspoOpen() {
  const list = inspo().items.filter(i => i.imgId).slice(0, 60); showModal('Escolher da Inspiração', `<div class="in-grid" id="lgPrIn" style="column-width:150px">${list.map(i => `<article class="in-card" onclick="lgPrInspoPick('${esc(i.imgId)}')"><img data-th="${esc(i.imgId)}" alt="${esc(i.title)}"><div class="in-cap"><strong>${esc(i.title)}</strong></div></article>`).join('')}</div>`);
  for (const im of document.querySelectorAll('#lgPrIn img[data-th]')) { const u = await inspoURL('th-' + im.dataset.th) || await inspoURL(im.dataset.th); if (u) im.src = u; }
}
function lgPrInspoPick(imgId) { const P = lgPresOf(lg.cur); P.imgId = imgId; P.bg = 'photo'; if (P.op < 0.5) P.op = 0.78; closeModal(); renderDesign(); }
async function lgPrDown(kind) {
  const s = lg.cur, nm = lgFile(s), one = async v => { const cv = document.createElement('canvas'); cv.width = 1600; cv.height = 1000; await lgPresPaint(cv, s, v); return new Promise(r => cv.toBlob(r, 'image/png')); };
  if (kind === 'png') { const b = await one(lgPr.view), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `vitrine-${nm}-${lgPr.view}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); return; }
  toast('Montando o ZIP…'); const files = []; for (const [v] of LG_PR_VIEWS) files.push({name: `vitrine-${nm}-${v}.png`, data: new Uint8Array(await (await one(v)).arrayBuffer())}); download(`vitrine-${nm}.zip`, makeZip(files), 'application/zip');
}
function lgPrSave() { lgPresOf(lg.cur); lgSaveLab(); toast('Vitrine guardada em Meus logos (com fundo, filtro e cores).'); }
async function lgPrEdit() {
  const p = dzP(), s = lg.cur, slides = []; for (const [v] of LG_PR_VIEWS) slides.push(await lgPresSlide(s, v));
  const set = {id: uid('ds'), name: 'Vitrine · ' + (s.name || 'marca'), format: {id: 'custom', w: 1600, h: 1000}, tk: brandTokens(p), slides, created: new Date().toISOString(), updated: new Date().toISOString()};
  await ensureSetResources(set); p.design.sets.push(set); persist(); dz.view = 'home'; dzOpen(set.id); toast('Aberto no Editor: 4 slides com fundo, filtro e logo em camadas.');
}
