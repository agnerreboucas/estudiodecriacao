/* Brand Kit: logo, fontes próprias e paleta 60/30/10 + 3 cinzas, extraídos do logo. Vira estilo de campanha. */
const BRAND_DEFAULT = () => ({logos: [], fonts: [], extracted: [], primary: '', bgMode: 'light', accMode: 'logo', pal: {c60: '', c30: '', c10: ''}, grays: ['', '', ''], headFont: '', bodyFont: ''});
const isHex = v => /^#[0-9a-f]{6}$/i.test(String(v || ''));
const brandOf = p => { p.design.brand = mergeDefaults(p.design.brand, BRAND_DEFAULT()); return p.design.brand; };

/* ---- cor ---- */
function rgb2hsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, l]; }
function hsl2hex(h, s, l) { h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l)); const f = n => { const k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l); return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); }; return '#' + [f(0), f(8), f(4)].map(v => v.toString(16).padStart(2, '0')).join(''); }
const hexHsl = h => rgb2hsl(...hex2rgb(h));
const contrast = (a, b) => { const x = lum(a) + 0.05, y = lum(b) + 0.05; return Math.max(x, y) / Math.min(x, y); };

/* cores dominantes de uma imagem (ignora transparência e quase-branco; cinzas ficam de fora) */
function extractColors(bmp) {
  const k = 96 / Math.max(bmp.width, bmp.height), w = Math.max(1, Math.round(bmp.width * k)), h = Math.max(1, Math.round(bmp.height * k));
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', {willReadFrequently: true}); x.drawImage(bmp, 0, 0, w, h);
  const d = x.getImageData(0, 0, w, h).data, bins = new Map();
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 140) continue; const [hh, ss, ll] = rgb2hsl(d[i], d[i + 1], d[i + 2]);
    if (ll > 0.93 || ll < 0.07 || ss < 0.16) continue;
    const key = (d[i] >> 4) << 8 | (d[i + 1] >> 4) << 4 | (d[i + 2] >> 4), b = bins.get(key) || {n: 0, r: 0, g: 0, b: 0}; b.n++; b.r += d[i]; b.g += d[i + 1]; b.b += d[i + 2]; bins.set(key, b);
  }
  const list = [...bins.values()].sort((a, b) => b.n - a.n).map(b => ({n: b.n, hex: '#' + [b.r, b.g, b.b].map(v => Math.round(v / b.n).toString(16).padStart(2, '0')).join('')}));
  const out = [];
  for (const it of list) {
    const [h1] = hexHsl(it.hex);
    if (out.every(o => { const [h2] = hexHsl(o.hex); const dh = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2)); return dh > 22 || Math.abs(lum(o.hex) - lum(it.hex)) > 0.25; })) out.push(it);
    if (out.length >= 6) break;
  }
  return out.map(o => o.hex);
}

/* monta 60/30/10 + 3 cinzas a partir da cor principal. 60 = área dominante (fundo), 30 = cor da marca/painéis, 10 = destaque (botão, ênfase) */
function buildPalette(b) {
  const prim = isHex(b.primary) ? b.primary : (b.extracted[0] || '#2a5bd7'), [h, s, l] = hexHsl(prim), sat = Math.max(s, 0.5);
  const second = b.extracted.find(c => { const [h2] = hexHsl(c); const dh = Math.min(Math.abs(h - h2), 360 - Math.abs(h - h2)); return dh > 40; });
  const accH = {logo: second ? hexHsl(second)[0] : h + 180, comp: h + 180, ana: h + 30, tri: h + 120}[b.accMode] ?? h + 180;
  const accent = b.accMode === 'logo' && second ? second : hsl2hex(accH, Math.max(sat, 0.7), 0.52);
  const tint = hsl2hex(h, Math.min(0.5, Math.max(0.12, s * 0.4)), 0.95), deep = hsl2hex(h, Math.min(0.6, Math.max(0.2, s * 0.6)), 0.11);
  const brand = b.bgMode === 'dark' && l < 0.45 ? hsl2hex(h, s, 0.58) : prim;
  const pal = b.bgMode === 'dark' ? {c60: deep, c30: brand, c10: accent} : b.bgMode === 'brand' ? {c60: prim, c30: tint, c10: accent} : {c60: tint, c30: prim, c10: accent};
  const gs = Math.min(0.1, s * 0.15 + 0.03);
  return {pal, grays: [hsl2hex(h, gs, 0.92), hsl2hex(h, gs, 0.55), hsl2hex(h, gs, 0.2)]};
}
function brandRecalc(p) { const b = brandOf(p), r = buildPalette(b); b.pal = r.pal; b.grays = r.grays; }

/* ---- fontes próprias ---- */
const BRAND_FONTS_LOADED = new Set();
async function brandFontsLoad(p) {
  if (!p) return; const b = brandOf(p);
  for (const f of b.fonts) {
    if (BRAND_FONTS_LOADED.has(f.id)) continue; BRAND_FONTS_LOADED.add(f.id);
    try { const blob = await imgGet(f.fileId); if (!blob) { BRAND_FONTS_LOADED.delete(f.id); continue; } const ff = new FontFace(f.family, await blob.arrayBuffer(), {weight: String(f.weight || 400)}); await ff.load(); document.fonts.add(ff); }
    catch (e) { BRAND_FONTS_LOADED.delete(f.id); console.warn('fonte da marca', f.name, e); }
  }
}
const brandFontNames = p => brandOf(p).fonts.map(f => f.family);
const fontChoices = () => { const p = dzP(); return p ? [...new Set([...brandFontNames(p), ...FONT_LIST])] : FONT_LIST; };

/* ---- logos ---- */
async function bitmapFromFile(file) {
  try { return await createImageBitmap(file); } catch (e) { /* SVG e afins */ }
  const url = URL.createObjectURL(file);
  try { const img = new Image(); img.src = url; await img.decode(); const c = document.createElement('canvas'); c.width = img.naturalWidth || 512; c.height = img.naturalHeight || 512; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); return await createImageBitmap(c); }
  finally { URL.revokeObjectURL(url); }
}
function brandLogoPick() {
  const f = $('bkLogo'); f.onchange = async () => {
    const file = f.files[0]; f.value = ''; if (!file) return;
    if (file.size > 8_000_000) { toast('Arquivo grande demais (máx. 8 MB).'); return; }
    let bmp; try { bmp = await bitmapFromFile(file); } catch (e) { toast('Não consegui ler esse logo. Use PNG, JPG, WebP ou SVG.'); return; }
    const p = dzP(), b = brandOf(p), id = uid('img'); await imgPut(id, file); IMGS.set(id, bmp);
    b.logos.push({id: uid('lg'), name: file.name.replace(/\.[^.]+$/, '').slice(0, 40), imgId: id, tone: 'any', w: bmp.width, h: bmp.height});
    if (!b.extracted.length) { b.extracted = extractColors(bmp); if (b.extracted[0]) { b.primary = b.extracted[0]; brandRecalc(p); } }
    persist(); renderDesign(); toast(b.extracted.length ? 'Logo enviado. Paleta gerada a partir dele.' : 'Logo enviado. Não achei cores marcantes; escolha a cor principal manualmente.');
  }; f.click();
}
async function brandReextract(i) { const p = dzP(), b = brandOf(p), lg = b.logos[i]; if (!lg) return; await loadImage(lg.imgId); const bmp = IMGS.get(lg.imgId); if (!bmp) return; b.extracted = extractColors(bmp); b.primary = b.extracted[0] || b.primary; brandRecalc(p); persist(); renderDesign(); }
function brandLogoSet(i, k, v) { const b = brandOf(dzP()); b.logos[i][k] = v; persist(); }
function brandLogoDel(i) { if (!confirm('Remover este logo do kit?')) return; brandOf(dzP()).logos.splice(i, 1); persist(); renderDesign(); }

/* ---- fontes: envio ---- */
function brandFontPick() {
  const f = $('bkFont'); f.onchange = async () => {
    const file = f.files[0]; f.value = ''; if (!file) return;
    if (!/\.(woff2?|ttf|otf)$/i.test(file.name) || file.size > 6_000_000) { toast('Use arquivo .woff2, .woff, .ttf ou .otf de até 6 MB.'); return; }
    const p = dzP(), b = brandOf(p), name = file.name.replace(/\.[^.]+$/, '').replace(/[^\p{L}\p{N} _-]/gu, '').trim().slice(0, 40) || 'Fonte da marca', id = uid('bf'), fileId = uid('img');
    const weight = /bold|black|heavy/i.test(file.name) ? 700 : 400, family = 'Marca ' + name;
    try { const ff = new FontFace(family, await file.arrayBuffer(), {weight: String(weight)}); await ff.load(); document.fonts.add(ff); } catch (e) { toast('Esse arquivo de fonte não abriu. Tente outro formato (.woff2 ou .ttf).'); return; }
    await imgPut(fileId, file); BRAND_FONTS_LOADED.add(id);
    b.fonts.push({id, name, family, fileId, weight}); if (!b.headFont) b.headFont = family; if (!b.bodyFont) b.bodyFont = family;
    persist(); renderDesign(); toast('Fonte adicionada: ' + name);
  }; f.click();
}
function brandFontDel(i) { if (!confirm('Remover esta fonte? Peças que a usam voltarão para uma fonte padrão do navegador.')) return; const b = brandOf(dzP()), f = b.fonts[i]; b.fonts.splice(i, 1); if (b.headFont === f.family) b.headFont = ''; if (b.bodyFont === f.family) b.bodyFont = ''; persist(); renderDesign(); }

/* ---- edição da paleta ---- */
function brandSet(k, v) { const p = dzP(), b = brandOf(p); b[k] = v; if (['primary', 'bgMode', 'accMode'].includes(k)) brandRecalc(p); persist(); renderDesign(); }
function brandCol(group, i, v) { if (!isHex(v)) return; const b = brandOf(dzP()); if (group === 'pal') b.pal[i] = v; else b.grays[+i] = v; persist(); brandRefreshPrev(); const sw = document.querySelectorAll('[data-bk="' + group + i + '"]'); sw.forEach(e => { e.style.background = v; if (e.tagName === 'SPAN') e.textContent = v; }); }

/* ---- estilo de campanha a partir do kit ---- */
function brandTokens(p) {
  const b = brandOf(p); if (!isHex(b.pal.c60)) brandRecalc(p);
  const dark = lum(b.pal.c60) < 0.35, fg = dark ? '#ffffff' : b.grays[2], head = b.headFont || 'Poppins', body = b.bodyFont || 'Inter';
  const tk = makeTokens(DESIGN_STYLES[0], FONT_PAIRS[0], PHOTO_STYLES[0], {
    name: 'Kit de marca', designId: DESIGN_STYLES[0].id, bg: b.pal.c60, fg, accent: b.pal.c10, muted: dark ? b.grays[0] : b.grays[1], second: b.pal.c30,
    head: {family: head, weight: b.fonts.some(f => f.family === head) ? (b.fonts.find(f => f.family === head).weight || 400) : 700}, body: {family: body, weight: 400}
  });
  return tk;
}
function brandSaveStyle() {
  const p = dzP(), b = brandOf(p), tk = brandTokens(p), list = p.design.styles, ex = list.find(s => s.kit);
  if (ex) { ex.tk = tk; ex.name = 'Kit de marca · ' + p.name; } else list.push({id: uid('st'), name: 'Kit de marca · ' + p.name, kit: true, tk, created: new Date().toISOString()});
  p.brand.palette = `60% ${b.pal.c60} · 30% ${b.pal.c30} · 10% ${b.pal.c10} · cinzas ${b.grays.join(' ')}`;
  persist(); toast('Estilo "Kit de marca" salvo. Use-o em Nova composição, nas variações ou aplique às peças.'); renderDesign();
}
function brandExportCSS() {
  const b = brandOf(dzP()), n = (k, v) => `  --${k}: ${v};`;
  download('brand-kit.css', ':root {\n' + [n('cor-60-base', b.pal.c60), n('cor-30-marca', b.pal.c30), n('cor-10-destaque', b.pal.c10), n('cinza-claro', b.grays[0]), n('cinza-medio', b.grays[1]), n('cinza-escuro', b.grays[2])].join('\n') + '\n}\n', 'text/css');
}

/* ---- tela ---- */
function renderBrandKit(p, r) {
  const b = brandOf(p); if (!isHex(b.pal.c60)) brandRecalc(p);
  const sw = (grp, k, c, label) => `<label class="bk-sw"><i data-bk="${grp}${k}" style="background:${esc(c)}"></i><input type="color" value="${esc(c)}" oninput="brandCol('${grp}','${k}',this.value)"><b>${label}</b><span data-bk="${grp}${k}" style="background:none">${esc(c)}</span></label>`;
  const radio = (key, opts) => `<div class="tchips">${opts.map(([v, l]) => `<button class="tchip ${b[key] === v ? 'on' : ''}" onclick="brandSet('${key}','${v}')">${l}</button>`).join('')}</div>`;
  const fontSel = (key, l) => `<label class="ins">${l}<select onchange="brandSet('${key}',this.value)"><option value="">Padrão do estilo</option>${b.fonts.map(f => `<option value="${esc(f.family)}" ${b[key] === f.family ? 'selected' : ''}>${esc(f.name)} (enviada)</option>`).join('')}${FONT_LIST.map(f => `<option ${b[key] === f ? 'selected' : ''}>${f}</option>`).join('')}</select></label>`;
  r.innerHTML = `<div class="page-head"><div><h1>Brand Kit</h1><p>Suba o logo e as fontes da marca. O Studio extrai as cores do logo e monta a paleta 60/30/10 com 3 cinzas, que viram o estilo de toda a campanha.</p></div><div class="actions">${projectSelect()}<button class="btn" onclick="dzBack()">← Estúdio</button></div></div>
  <input type="file" id="bkLogo" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden><input type="file" id="bkFont" accept=".woff2,.woff,.ttf,.otf" hidden>
  <div class="bk-grid">
  <div class="panel"><div class="section-row"><h3>Logos</h3><button class="btn sm dark" onclick="brandLogoPick()">＋ Enviar logo</button></div>
    ${b.logos.length ? b.logos.map((l, i) => `<div class="bk-logo"><canvas data-logo="${esc(l.imgId)}" width="120" height="70" class="${l.tone === 'dark' ? 'bk-on-dark' : ''}"></canvas><div><strong>${esc(l.name)}</strong><label class="ins">Usar sobre<select onchange="brandLogoSet(${i},'tone',this.value);renderDesign()"><option value="any" ${l.tone === 'any' ? 'selected' : ''}>qualquer fundo</option><option value="light" ${l.tone === 'light' ? 'selected' : ''}>fundo claro</option><option value="dark" ${l.tone === 'dark' ? 'selected' : ''}>fundo escuro</option></select></label><div class="row-gap"><button class="btn sm" onclick="brandReextract(${i})">Extrair cores</button><button class="btn sm" onclick="brandLogoDel(${i})">×</button></div></div></div>`).join('') : '<p class="muted" style="font-size:12.5px">Envie o logo em PNG com fundo transparente (ideal), JPG, WebP ou SVG. Se tiver versão para fundo escuro, envie também.</p>'}</div>
  <div class="panel"><div class="section-row"><h3>Fontes da marca</h3><button class="btn sm dark" onclick="brandFontPick()">＋ Enviar fonte</button></div>
    ${b.fonts.length ? b.fonts.map((f, i) => `<div class="bk-font"><span style="font-family:'${esc(f.family)}';font-size:22px">Aa Bb Cc 123</span><small class="muted">${esc(f.name)}</small><button class="btn sm" onclick="brandFontDel(${i})">×</button></div>`).join('') : '<p class="muted" style="font-size:12.5px">Envie .woff2, .woff, .ttf ou .otf. Use só fontes que você tem licença para usar. Sem fonte própria, escolha uma das 30 pares da biblioteca.</p>'}
    <div class="ins-row" style="margin-top:8px">${fontSel('headFont', 'Títulos')}${fontSel('bodyFont', 'Textos')}</div></div>
  </div>
  <div class="panel" style="margin-top:14px"><div class="section-row"><h3>Paleta 60 · 30 · 10</h3><small class="muted">${b.extracted.length ? 'cores achadas no logo' : 'sem logo: escolha a cor principal'}</small></div>
    <div class="bk-extr">${b.extracted.map(c => `<button class="bk-chip ${c === b.primary ? 'on' : ''}" style="background:${esc(c)}" title="Usar como cor principal ${esc(c)}" onclick="brandSet('primary','${esc(c)}')"></button>`).join('')}<label class="ins inl">Cor principal <input type="color" value="${esc(isHex(b.primary) ? b.primary : b.pal.c30)}" onchange="brandSet('primary',this.value)"></label></div>
    <div class="ins-row" style="align-items:flex-start;margin-top:8px"><div><div class="okr-label">FUNDO DOMINANTE (60%)</div>${radio('bgMode', [['light', 'Claro'], ['dark', 'Escuro'], ['brand', 'Cor da marca']])}</div><div><div class="okr-label">DESTAQUE (10%)</div>${radio('accMode', [['logo', 'Do logo'], ['comp', 'Complementar'], ['ana', 'Análoga'], ['tri', 'Tríade']])}</div></div>
    <div class="bk-bar"><i data-bk="palc60" style="flex:60;background:${esc(b.pal.c60)}"></i><i data-bk="palc30" style="flex:30;background:${esc(b.pal.c30)}"></i><i data-bk="palc10" style="flex:10;background:${esc(b.pal.c10)}"></i></div>
    <div class="bk-sws">${sw('pal', 'c60', b.pal.c60, '60% · base')}${sw('pal', 'c30', b.pal.c30, '30% · marca')}${sw('pal', 'c10', b.pal.c10, '10% · destaque')}</div>
    <div class="okr-label" style="margin-top:12px">3 CINZAS (puxados para o tom da marca)</div><div class="bk-sws">${sw('g', '0', b.grays[0], 'Cinza claro')}${sw('g', '1', b.grays[1], 'Cinza médio')}${sw('g', '2', b.grays[2], 'Cinza escuro')}</div>
    <div class="bk-cts" id="bkCts"></div></div>
  <div class="panel" style="margin-top:14px"><div class="section-row"><h3>Prévia</h3><div class="row-gap"><button class="btn sm" onclick="brandExportCSS()">Baixar .css</button><button class="btn sm dark" onclick="brandSaveStyle()">Salvar como estilo de campanha</button></div></div><div class="bk-prev"><canvas id="bkPrev" width="360" height="450"></canvas><canvas id="bkPrev2" width="360" height="450"></canvas></div></div>`;
  r.querySelectorAll('canvas[data-logo]').forEach(async cv => { await loadImage(cv.dataset.logo); const bm = IMGS.get(cv.dataset.logo); if (!bm) return; const k = Math.min(cv.width / bm.width, cv.height / bm.height), w = bm.width * k, h = bm.height * k; cv.getContext('2d').drawImage(bm, (cv.width - w) / 2, (cv.height - h) / 2, w, h); });
  brandRefreshPrev();
}
function brandCts() {
  const b = brandOf(dzP()), el = $('bkCts'); if (!el) return;
  const dark = lum(b.pal.c60) < 0.35, fg = dark ? '#ffffff' : b.grays[2], ck = (a, bg, lab) => { const v = contrast(a, bg); return `<span class="bk-ct ${v >= 4.5 ? 'ok' : v >= 3 ? 'mid' : 'bad'}">${lab} ${v.toFixed(1)}:1 ${v >= 4.5 ? '✓ AA' : v >= 3 ? '· só texto grande' : '✗ baixo'}</span>`; };
  el.innerHTML = ck(fg, b.pal.c60, 'Texto sobre a base') + ck(readable(b.pal.c10) === '#111111' ? '#111111' : '#ffffff', b.pal.c10, 'Texto no botão') + ck(b.pal.c10, b.pal.c60, 'Destaque sobre a base');
}
let bkTimer = 0;
function brandRefreshPrev() {
  brandCts(); clearTimeout(bkTimer);
  bkTimer = setTimeout(async () => {
    const p = dzP(), a = $('bkPrev'), a2 = $('bkPrev2'); if (!p || !a) return;
    const tk = brandTokens(p); await ensureFonts([tk.head.family, tk.body.family]);
    const copy = {kicker: p.name, title: 'Seu **projeto** pronto para crescer', sub: 'Entenda antes de decidir.', button: 'Fale com a gente'};
    const s1 = slideAd(tk, copy, {w: 1080, h: 1350}, p.name, 'none'), lg = brandOf(p).logos[0];
    if (lg) { await loadImage(lg.imgId); const bm = IMGS.get(lg.imgId); if (bm) { const h = 90, w = Math.min(420, Math.round(h * bm.width / bm.height)); s1.layers.push(IM('logo', {imgId: lg.imgId, x: 90, y: 1350 - 90 - h - 40, w, h: Math.round(w * bm.height / bm.width)})); } }
    renderSlide(a.getContext('2d'), s1, 1080, 1350, a.width / 1080);
    const tk2 = JSON.parse(JSON.stringify(tk)); tk2.bg = tk.accent; tk2.fg = readable(tk.accent); tk2.accent = tk.second || tk.fg; tk2.muted = tk2.fg;
    renderSlide(a2.getContext('2d'), slideAd(tk2, {kicker: '', title: 'Uma **peça** com destaque total', sub: '', button: ''}, {w: 1080, h: 1350}, p.name, 'none'), 1080, 1350, a2.width / 1080);
  }, 120);
}
function dzBrandOpen() { dz.view = 'brand'; go('design'); renderDesign(); }

/* paleta no inspetor do editor: um clique aplica a cor na camada */
function brandSwatches(L) {
  const p = dzP(); if (!p || !L || L.type === 'image') return '';
  const b = brandOf(p); if (!isHex(b.pal.c60)) return '';
  const key = L.type === 'text' ? 'color' : 'fill', cs = [b.pal.c60, b.pal.c30, b.pal.c10, ...b.grays];
  return `<div class="okr-label" style="margin-top:10px">CORES DA MARCA</div><div class="bk-chips">${cs.map(c => `<button class="bk-chip" style="background:${esc(c)}" title="${esc(c)}" onclick="dzProp('${key}','${esc(c)}');dzInspector()"></button>`).join('')}</div>`;
}
/* ---- logo por peça: escolher qual logo, a cor (original/branco/preto) e um fundo atrás dele ---- */
const LOGO_TINT = {'': '', w: 'brightness(0) invert(1)', k: 'brightness(0)'};
const LOGO_UNDO = {list: []};
const logoDark = s => lum((s && s.bg) || '#ffffff') < 0.35;
const logoTone = (b, dark) => b.logos.find(l => l.tone === (dark ? 'dark' : 'light')) || b.logos.find(l => l.tone === 'any') || b.logos[0];
async function logoFit(L, lg) { await loadImage(lg.imgId); const bm = IMGS.get(lg.imgId); if (!bm) return false; const w = L.w || 200; L.imgId = lg.imgId; L.h = Math.round(w * bm.height / bm.width); L.fit = 'contain'; return true; }
function logoSnap(L, s, set) { return {setId: set.id, slideId: s.id, id: L.id, prev: {imgId: L.imgId, w: L.w, h: L.h, filter: L.filter, plate: L.plate, platePad: L.platePad, plateR: L.plateR}}; }
/* adiciona o logo na peça: com mais de um logo, pergunta qual (e mostra cada um sobre fundo claro, escuro e cinza) */
async function dzAddLogo(id) {
  const p = dzP(), b = brandOf(p); if (!b.logos.length) { toast('Envie um logo no Brand Kit primeiro.'); dzBrandOpen(); return; }
  if (!id && b.logos.length > 1) { dzLogoChooser(); return; }
  const s = dzSlide(), f = dzSet().format, lg = id ? b.logos.find(l => l.id === id) || b.logos[0] : logoTone(b, logoDark(s));
  await loadImage(lg.imgId); const bm = IMGS.get(lg.imgId); if (!bm) { toast('Logo indisponível.'); return; }
  const m = Math.round(Math.min(f.w, f.h) * 0.06), hh = Math.round(f.h * 0.07), ww = Math.min(Math.round(hh * bm.width / bm.height), Math.round(f.w * 0.4)), h2 = Math.round(ww * bm.height / bm.width);
  const L = IM('logo', {imgId: lg.imgId, x: m, y: f.h - m - h2, w: ww, h: h2, fit: 'contain'}); s.layers.push(L); dz.sel = L.id; closeModal(); dzCommit(); dzInspector(); dzDraw(); dzSlidesPanel();
}
function dzLogoChooser() {
  const b = brandOf(dzP()), BG = [['#ffffff', 'claro'], ['#1a1a1a', 'escuro'], ['#8a8f98', 'cinza']];
  showModal('Qual logo usar nesta peça?', `<p class="muted" style="margin-top:0">Veja cada logo sobre fundo claro, escuro e cinza e escolha o que fica melhor nesta peça. Depois dá para trocar, mudar a cor e pôr um fundo atrás do logo.</p><div class="list">${b.logos.map((l, i) => `<div class="list-item" style="align-items:center;gap:10px;flex-wrap:wrap"><div style="display:flex;gap:6px">${BG.map(([c, n]) => `<canvas data-logo="${esc(l.imgId)}" data-bg="${c}" width="110" height="64" title="Sobre fundo ${n}" style="background:${c};border-radius:8px;border:1px solid #ddd"></canvas>`).join('')}</div><div style="flex:1;min-width:120px"><strong>${esc(l.name)}</strong><small>${l.tone === 'dark' ? 'para fundo escuro' : l.tone === 'light' ? 'para fundo claro' : 'qualquer fundo'}</small></div><button class="btn sm dark" onclick="dzAddLogo('${l.id}')">Usar este</button></div>`).join('')}</div><div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn" onclick="closeModal();dzAddLogo(logoTone(brandOf(dzP()), logoDark(dzSlide())).id)">Escolher sozinho pelo fundo</button></div>`);
  $('modalBox').querySelectorAll('canvas[data-logo]').forEach(async cv => { await loadImage(cv.dataset.logo); const bm = IMGS.get(cv.dataset.logo); if (!bm) return; const k = Math.min((cv.width - 12) / bm.width, (cv.height - 12) / bm.height), w = bm.width * k, h = bm.height * k; cv.getContext('2d').drawImage(bm, (cv.width - w) / 2, (cv.height - h) / 2, w, h); });
}
function dzLogoInspector(L, geo, acts, rg) {
  const b = brandOf(dzP()), tint = Object.keys(LOGO_TINT).find(k => LOGO_TINT[k] === (L.filter || '')) || '', pc = L.plate || '', tk = (typeof brandTokens === 'function' && dzP()) ? brandTokens(dzP()) : {accent: '#e4572e'};
  const sw = (c, n) => `<button class="btn sm ${pc === c ? 'dark' : ''}" onclick="dzLogoPlate('${c}')" style="${c ? 'border-left:14px solid ' + c : ''}">${n}</button>`;
  return `<h3>Logo</h3><small class="muted block">Arraste e use as alças para redimensionar.</small>
    <h4>Qual logo</h4>${b.logos.length > 1 ? `<select onchange="dzLogoPick(this.value)">${b.logos.map(l => `<option value="${l.id}" ${l.imgId === L.imgId ? 'selected' : ''}>${esc(l.name)} · ${l.tone === 'dark' ? 'fundo escuro' : l.tone === 'light' ? 'fundo claro' : 'qualquer fundo'}</option>`).join('')}</select>` : '<small class="muted">Só há um logo no Brand Kit. Envie outras versões (branca, preta) para escolher aqui.</small>'}
    <h4>Cor do logo</h4><div class="row-gap"><button class="btn sm ${tint === '' ? 'dark' : ''}" onclick="dzLogoTint('')">Original</button><button class="btn sm ${tint === 'w' ? 'dark' : ''}" onclick="dzLogoTint('w')">Tudo branco</button><button class="btn sm ${tint === 'k' ? 'dark' : ''}" onclick="dzLogoTint('k')">Tudo preto</button></div><small class="muted block">Útil para logo sem fundo (PNG transparente) em fundo claro ou escuro.</small>
    <h4>Fundo atrás do logo</h4><div class="row-gap" style="flex-wrap:wrap">${sw('', 'Nenhum')}${sw('#ffffff', 'Branco')}${sw('#111111', 'Preto')}${sw('#e9e9ee', 'Cinza claro')}${sw(tk.accent, 'Cor da marca')}<input type="color" value="${esc(pc || '#ffffff')}" oninput="dzLogoPlate(this.value)" title="Outra cor"></div>
    ${pc ? rg('platePad', 'Margem do fundo', 0, 0.5, 0.02) + rg('plateR', 'Cantos do fundo', 0, 0.5, 0.02) : ''}
    ${rg('opacity', 'Opacidade', 0, 1, 0.05)}<h4>Nos outros slides e peças</h4><div class="row-gap" style="flex-wrap:wrap"><button class="btn sm" onclick="dzLogoAll('set')">Aplicar nos slides desta peça</button><button class="btn sm" onclick="dzLogoAll('project')">Aplicar em todas as peças</button><button class="btn sm" onclick="dzLogoAll('auto')" title="Cada peça recebe o logo marcado para o fundo dela">Escolher sozinho pelo fundo, em todas</button></div>
    <h4>Posição e tamanho</h4>${geo}<h4>Camada</h4>${acts}`;
}
async function dzLogoPick(id) { const L = dzLayer(), lg = brandOf(dzP()).logos.find(l => l.id === id); if (!L || !lg) return; if (await logoFit(L, lg)) { dzDraw(); dzCommitSoon(); dzInspector(); } else toast('Logo indisponível.'); }
function dzLogoTint(m) { const L = dzLayer(); if (!L) return; L.filter = LOGO_TINT[m] || ''; dzDraw(); dzCommitSoon(); dzInspector(); }
function dzLogoPlate(c) { const L = dzLayer(); if (!L) return; L.plate = c || ''; if (c && L.platePad == null) { L.platePad = 0.14; L.plateR = 0.2; } dzDraw(); dzCommitSoon(); dzInspector(); }
async function dzLogoAll(scope) {
  const p = dzP(), b = brandOf(p), src = dzLayer(); if (!src && scope !== 'auto') return;
  const sets = scope === 'set' ? [dzSet()] : p.design.sets, undo = []; let n = 0;
  for (const set of sets) for (const s of set.slides) for (const L of s.layers) {
    if (L.type !== 'image' || L.role !== 'logo') continue;
    undo.push(logoSnap(L, s, set));
    if (scope === 'auto') { const lg = logoTone(b, logoDark(s)); if (lg) { await logoFit(L, lg); L.filter = ''; L.plate = ''; n++; } }
    else { const lg = b.logos.find(l => l.imgId === src.imgId); if (lg) await logoFit(L, lg); else { L.imgId = src.imgId; } L.filter = src.filter || ''; L.plate = src.plate || ''; L.platePad = src.platePad; L.plateR = src.plateR; n++; }
  }
  LOGO_UNDO.list = undo; persist(); dzDraw(); dzSlidesPanel(); dzInspector();
  showModal('Logo atualizado', `<p style="margin-top:0">O logo foi trocado em <b>${n}</b> camada(s) de logo${scope === 'set' ? ' desta peça' : ' do projeto'}. Só os logos mudaram; textos, fotos e layouts ficaram como estavam.</p><div class="modal-actions"><button class="btn" onclick="dzLogoUndo()">↩ Desfazer</button><button class="btn dark" onclick="closeModal()">Ok</button></div>`);
}
function dzLogoUndo() {
  const p = dzP(); let n = 0;
  LOGO_UNDO.list.forEach(u => { const set = p.design.sets.find(s => s.id === u.setId), s = set && set.slides.find(x => x.id === u.slideId), L = s && s.layers.find(x => x.id === u.id); if (L) { Object.assign(L, u.prev); n++; } });
  LOGO_UNDO.list = []; persist(); closeModal(); dzDraw(); dzSlidesPanel(); dzInspector(); toast(n ? 'Troca de logo desfeita.' : 'Nada para desfazer.');
}
