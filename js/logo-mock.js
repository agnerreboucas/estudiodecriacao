/* ===== Laboratório do Logo · aplicações: mockups desenhados, prancha de marca e pacote ZIP ===== */
const lgLogoBM = {};
async function lgBitmap(sp, mode) { const s2 = Object.assign({}, sp, {mode}), b = await lgBlob(s2, {tight: true, transparent: true}); return createImageBitmap(b); }
function lgRR(x, ctx, X, Y, W, H, r) { ctx.beginPath(); ctx.moveTo(X + r, Y); ctx.arcTo(X + W, Y, X + W, Y + H, r); ctx.arcTo(X + W, Y + H, X, Y + H, r); ctx.arcTo(X, Y + H, X, Y, r); ctx.arcTo(X, Y, X + W, Y, r); ctx.closePath(); }
const lgShadow = (c, b, y, a) => { c.shadowColor = `rgba(20,30,50,${a == null ? 0.18 : a})`; c.shadowBlur = b; c.shadowOffsetY = y; };
const lgNoShadow = c => { c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetY = 0; };
function lgPut(c, bm, cx, cy, mw, mh) { const k = Math.min(mw / bm.width, mh / bm.height); c.drawImage(bm, cx - bm.width * k / 2, cy - bm.height * k / 2, bm.width * k, bm.height * k); }
const lgTint = (hex, t) => mixHex(hex, '#ffffff', t);

async function lgMockups(sp) {
  await lgFonts(sp); const F = LG_FONTS[sp.font] || LG_FONTS.geo, P = sp.pal, C = lgColors(sp), out = [];
  const L = await lgBitmap(sp, 'light'), D = await lgBitmap(sp, 'dark'), K = await lgBitmap(sp, 'color'), mk = () => { const cv = document.createElement('canvas'); cv.width = 1200; cv.height = 900; return [cv, cv.getContext('2d')]; };
  const head = (c, size, col) => { c.font = `${F.hw} ${size}px "${F.head}", sans-serif`; c.fillStyle = col; };
  const bar = (c, x, y, w, col, h) => { c.fillStyle = col; lgRR(0, c, x, y, w, h || 12, (h || 12) / 2); c.fill(); };
  /* cartões de visita */
  { const [cv, c] = mk(); c.fillStyle = '#e9edf3'; c.fillRect(0, 0, 1200, 900); c.fillStyle = '#dde3ec'; c.beginPath(); c.arc(330, 380, 250, 0, 7); c.fill();
    lgShadow(c, 40, 18); c.fillStyle = P[1]; lgRR(0, c, 140, 150, 640, 380, 10); c.fill(); lgNoShadow(c);
    head(c, 40, readable(P[1])); c.textBaseline = 'alphabetic'; c.fillText('Seu Nome', 190, 235); bar(c, 190, 430, 300, readable(P[1]) + '99', 8); bar(c, 190, 460, 240, readable(P[1]) + '99', 8); bar(c, 190, 490, 270, readable(P[1]) + '99', 8);
    lgShadow(c, 44, 22); c.fillStyle = '#ffffff'; lgRR(0, c, 420, 340, 660, 400, 10); c.fill(); lgNoShadow(c); lgPut(c, L, 750, 540, 460, 250);
    out.push({id: 'cartao', label: 'Cartão de visita', cv}); }
  /* perfil de rede social */
  { const [cv, c] = mk(); c.fillStyle = lgTint(P[2], 0.82); c.fillRect(0, 0, 1200, 900);
    lgShadow(c, 50, 20); c.fillStyle = '#ffffff'; lgRR(0, c, 400, 40, 400, 820, 58); c.fill(); lgNoShadow(c); c.strokeStyle = '#161616'; c.lineWidth = 14; lgRR(0, c, 400, 40, 400, 820, 58); c.stroke();
    c.fillStyle = '#161616'; lgRR(0, c, 540, 56, 120, 22, 11); c.fill();
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(500, 210, 58, 0, 7); c.fill(); c.strokeStyle = '#e4e4e4'; c.lineWidth = 3; c.stroke(); lgPut(c, L, 500, 210, 84, 66);
    c.fillStyle = '#161616'; c.font = '700 26px Inter, sans-serif'; c.textAlign = 'center'; [['37', 'posts', 610], ['56', 'seguidores', 690], ['35', 'seguindo', 760]].forEach(([n, l, x]) => { c.fillText(n, x, 200); c.font = '400 13px Inter, sans-serif'; c.fillText(l, x, 222); c.font = '700 26px Inter, sans-serif'; });
    c.textAlign = 'left'; c.font = '700 22px Inter, sans-serif'; c.fillText(sp.name || 'Marca', 445, 312); bar(c, 445, 330, 220, '#c9ced6', 10); bar(c, 445, 352, 260, '#c9ced6', 10);
    c.fillStyle = P[1]; lgRR(0, c, 445, 385, 150, 44, 8); c.fill(); c.fillStyle = readable(P[1]); c.font = '600 16px Inter, sans-serif'; c.textAlign = 'center'; c.fillText('Seguir', 520, 413); c.fillStyle = '#eceff3'; lgRR(0, c, 610, 385, 150, 44, 8); c.fill(); c.fillStyle = '#161616'; c.fillText('Mensagem', 685, 413);
    c.save(); lgRR(0, c, 407, 47, 386, 806, 52); c.clip(); const tints = [0.15, 0.45, 0.7, 0.3, 0.6, 0.85, 0.5, 0.2, 0.75, 0.4, 0.65, 0.25]; for (let i = 0; i < 12; i++) { c.fillStyle = lgTint(i % 3 === 0 ? P[1] : i % 3 === 1 ? P[2] : P[3], tints[i]); c.fillRect(420 + (i % 3) * 120, 465 + Math.floor(i / 3) * 120, 118, 118); } c.restore();
    c.textAlign = 'left'; out.push({id: 'perfil', label: 'Perfil de rede social', cv}); }
  /* site no notebook */
  { const [cv, c] = mk(); c.fillStyle = '#eef1f6'; c.fillRect(0, 0, 1200, 900);
    lgShadow(c, 50, 24); c.fillStyle = '#ffffff'; lgRR(0, c, 140, 100, 920, 580, 34); c.fill(); lgNoShadow(c);
    c.fillStyle = '#f2f4f8'; lgRR(0, c, 190, 130, 820, 38, 19); c.fill(); c.fillStyle = '#9aa3b2'; c.font = '14px Inter, sans-serif'; c.fillText('https://www.suamarca.com.br', 215, 154);
    c.save(); lgRR(0, c, 170, 190, 860, 460, 6); c.clip(); c.fillStyle = C.bg === P[4] ? P[4] : '#f4f4f4'; c.fillRect(170, 190, 430, 460); c.fillStyle = P[0]; c.fillRect(600, 190, 430, 460); c.restore();
    lgPut(c, L, 385, 420, 300, 190); head(c, 40, P[4]); c.fillText('Bem-vindo', 650, 340); bar(c, 650, 375, 300, P[4] + '88', 9); bar(c, 650, 400, 260, P[4] + '88', 9); bar(c, 650, 425, 280, P[4] + '88', 9); c.fillStyle = P[3]; lgRR(0, c, 650, 470, 160, 46, 6); c.fill();
    c.fillStyle = '#dfe3ea'; lgRR(0, c, 70, 690, 1060, 34, 17); c.fill(); out.push({id: 'site', label: 'Site', cv}); }
  /* produtos: sacola, camiseta, caneca, adesivos */
  { const [cv, c] = mk(); c.fillStyle = '#eef1f6'; c.fillRect(0, 0, 1200, 900); c.fillStyle = '#e1e6ef'; c.beginPath(); c.arc(760, 520, 380, 0, 7); c.fill();
    c.strokeStyle = '#d9dde4'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(210, 330); c.bezierCurveTo(210, 190, 300, 190, 300, 330); c.moveTo(330, 330); c.bezierCurveTo(330, 190, 420, 190, 420, 330); c.stroke();
    lgShadow(c, 36, 16); c.fillStyle = '#fbfbfb'; lgRR(0, c, 110, 320, 420, 460, 8); c.fill(); lgNoShadow(c); lgPut(c, L, 320, 560, 250, 200);
    lgShadow(c, 36, 16); c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(620, 190); c.lineTo(700, 160); c.quadraticCurveTo(760, 215, 820, 160); c.lineTo(900, 190); c.lineTo(1000, 290); c.lineTo(930, 350); c.lineTo(890, 315); c.lineTo(890, 650); c.lineTo(630, 650); c.lineTo(630, 315); c.lineTo(590, 350); c.lineTo(520, 290); c.closePath(); c.fill(); lgNoShadow(c); lgPut(c, L, 760, 430, 170, 140);
    lgShadow(c, 24, 12); c.fillStyle = '#ffffff'; lgRR(0, c, 880, 560, 190, 210, 26); c.fill(); c.strokeStyle = '#ffffff'; c.lineWidth = 26; c.beginPath(); c.arc(1075, 660, 52, -1.2, 1.2); c.stroke(); lgNoShadow(c); lgPut(c, L, 975, 665, 120, 100);
    lgShadow(c, 18, 8); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(640, 760, 82, 0, 7); c.fill(); c.fillStyle = P[1]; c.beginPath(); c.arc(840, 800, 62, 0, 7); c.fill(); lgNoShadow(c); lgPut(c, L, 640, 760, 110, 90); lgPut(c, K, 840, 800, 80, 66);
    out.push({id: 'produtos', label: 'Sacola, camiseta, caneca e adesivos', cv}); }
  /* aplicação sobre fundo escuro e colorido */
  { const [cv, c] = mk(); c.fillStyle = P[0]; c.fillRect(0, 0, 600, 900); c.fillStyle = P[1]; c.fillRect(600, 0, 600, 900); lgPut(c, D, 300, 450, 440, 340); lgPut(c, K, 900, 450, 440, 340); out.push({id: 'fundos', label: 'Fundo escuro e colorido', cv}); }
  return out;
}
const lgCanvasPNG = cv => new Promise(res => cv.toBlob(res, 'image/png'));

/* ---------- prancha de marca ---------- */
function lgDrawSymbol(c, sp, x, y, s, cols) {
  if (lgIsType(sp)) { const F = lgFontOf(sp), ch = (String(sp.name || 'A').match(/\S/) || ['A'])[0]; c.save(); c.font = `${F.hw} ${s * 1.05}px "${F.head}", sans-serif`; c.fillStyle = cols.main; c.textBaseline = 'alphabetic'; const w = c.measureText(ch).width; c.fillText(ch, x + (s - w) / 2, y + s * 0.88); c.restore(); return; }
  const def = lgSymDef(sp.sym, sp), vb = def.vb || 100;
  def.parts.forEach(pt => { const path = new Path2D(pt.d), col = cols[pt.role] || cols.main; c.save(); c.translate(x, y); c.scale(s / vb, s / vb);
    if (pt.stroke) { c.lineWidth = pt.sw || 2; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col; c.stroke(path); } else { c.fillStyle = col; c.fill(path, pt.rule || 'nonzero'); } c.restore(); });
}
async function lgBoard(sp, mocks) {
  await lgFonts(sp); const F = LG_FONTS[sp.font] || LG_FONTS.geo, P = sp.pal, cv = document.createElement('canvas'); cv.width = 1920; cv.height = 1500; const c = cv.getContext('2d');
  c.fillStyle = '#ffffff'; c.fillRect(0, 0, 1920, 1500); c.textBaseline = 'alphabetic';
  const lab = (t, x, y) => { c.fillStyle = '#8a8f98'; c.font = '600 18px Inter, sans-serif'; c.letterSpacing = '3px'; c.fillText(t, x, y); c.letterSpacing = '0px'; };
  c.fillStyle = '#111'; c.font = '700 22px Inter, sans-serif'; c.fillText('MANUAL DE MARCA · ' + String(sp.name || '').toUpperCase(), 80, 70); c.fillStyle = '#e6e8ec'; c.fillRect(80, 92, 1760, 2);
  const lockup = async (comp, x, y, w, h, mode) => { const s2 = Object.assign({}, sp, {comp, mode}), bm = await lgBitmap(s2, mode), C2 = lgColors(s2); c.fillStyle = mode === 'light' ? '#f3f4f6' : C2.bg; lgRR(0, c, x, y, w, h, 18); c.fill(); lgPut(c, bm, x + w / 2, y + h / 2, w * 0.7, h * 0.66); };
  lab('LOGO', 80, 140); await lockup('horizontal', 80, 160, 900, 250, 'light'); await lockup(sp.comp === 'horizontal' ? 'stack' : sp.comp, 80, 430, 440, 330, 'light'); await lockup(sp.comp === 'horizontal' ? 'stack' : sp.comp, 540, 430, 440, 330, 'dark');
  lab('PALETA', 1030, 140); [['Escura', P[0]], ['Principal', P[1]], ['Apoio', P[2]], ['Destaque', P[3]], ['Clara', P[4]]].forEach(([n, h], i) => { const y = 160 + i * 120; c.fillStyle = h; lgRR(0, c, 1030, y, 420, 104, 14); c.fill(); if (lum(h) > 0.9) { c.strokeStyle = '#e1e3e7'; c.lineWidth = 2; lgRR(0, c, 1030, y, 420, 104, 14); c.stroke(); } c.fillStyle = readable(h); c.font = '700 22px Inter, sans-serif'; c.fillText(n, 1054, y + 44); c.font = '500 18px Inter, sans-serif'; c.fillText(h.toUpperCase(), 1054, y + 74); });
  lab('TIPOGRAFIA', 1500, 140); c.fillStyle = '#111'; c.font = `${F.hw} 150px "${F.head}", sans-serif`; c.fillText('Aa', 1500, 300); c.font = `${F.hw} 30px "${F.head}", sans-serif`; c.fillText(F.head, 1500, 350); c.font = '500 18px Inter, sans-serif'; c.fillStyle = '#6b7280'; c.fillText('Títulos e nome da marca', 1500, 378);
  c.fillStyle = '#111'; c.font = `${F.tw} 64px "${F.tag}", sans-serif`; c.fillText('Aa', 1500, 500); c.font = `${F.tw} 28px "${F.tag}", sans-serif`; c.fillText(F.tag, 1500, 548); c.font = '500 18px Inter, sans-serif'; c.fillStyle = '#6b7280'; c.fillText('Slogan e textos de apoio', 1500, 576);
  c.fillStyle = '#111'; c.font = `${F.tw} 22px "${F.tag}", sans-serif`; c.font = `${F.tw} 18px "${F.tag}", sans-serif`; c.fillText('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 1500, 640); c.fillText('abcdefghijklmnopqrstuvwxyz', 1500, 672); c.fillText('0123456789', 1500, 704);
  lab('ELEMENTOS', 80, 820); const tiles = [[P[4], {main: P[1], acc: P[3], sec: P[2]}], [P[1], {main: P[4], acc: P[3], sec: P[4]}], [P[0], {main: P[2], acc: P[3], sec: P[4]}], [P[3], {main: P[0], acc: P[4], sec: P[0]}]];
  tiles.forEach(([bg, cols], i) => { const x = 80 + i * 250; c.fillStyle = bg; lgRR(0, c, x, 840, 230, 230, 18); c.fill(); if (lum(bg) > 0.9) { c.strokeStyle = '#e1e3e7'; c.lineWidth = 2; lgRR(0, c, x, 840, 230, 230, 18); c.stroke(); } lgDrawSymbol(c, sp, x + 55, 895, 120, cols); });
  c.fillStyle = P[4]; lgRR(0, c, 1100, 840, 740, 230, 18); c.fill(); c.strokeStyle = '#e1e3e7'; c.lineWidth = 2; lgRR(0, c, 1100, 840, 740, 230, 18); c.stroke();
  c.save(); lgRR(0, c, 1100, 840, 740, 230, 18); c.clip(); for (let r = 0; r < 3; r++) for (let k = 0; k < 9; k++) lgDrawSymbol(c, sp, 1120 + k * 84 + (r % 2) * 40, 860 + r * 72, 56, {main: [P[1], P[2], P[3]][(r + k) % 3], acc: P[3], sec: P[2]}); c.restore();
  lab('APLICAÇÕES', 80, 1130); const want = ['cartao', 'perfil', 'produtos', 'site']; want.forEach((id, i) => { const m = mocks.find(x => x.id === id); if (!m) return; const x = 80 + i * 440; c.save(); lgRR(0, c, x, 1150, 420, 315, 14); c.clip(); c.drawImage(m.cv, 0, 0, 1200, 900, x, 1150, 420, 315); c.restore(); });
  return cv;
}

/* ---------- pacote ---------- */
async function lgPackage(sp) {
  const mocks = await lgMockups(sp), board = await lgBoard(sp, mocks), files = [], add = async (name, blob) => files.push({name, data: new Uint8Array(await blob.arrayBuffer())}), txt = (name, t) => files.push({name, data: new TextEncoder().encode(t)}), nm = lgFile(sp);
  for (const m of [['claro', 'light'], ['escuro', 'dark'], ['colorido', 'color']]) await add(`logo/${nm}-${m[0]}.png`, await lgBlob(Object.assign({}, sp, {mode: m[1]}), {tight: true, transparent: true}));
  for (const [bg, bl] of [['light', 'claro'], ['mid', 'medio'], ['dark', 'escuro']]) for (const [lo, ll] of [['light', 'claro'], ['mid', 'medio'], ['dark', 'escuro']]) { if (bg === lo) continue; await add(`variacoes/fundo-${bl}-logo-${ll}.png`, await lgBlob(Object.assign({}, sp, {tone: {bg, logo: lo}, rule: null}), {W: 1600, H: 1000})); }
  txt(`logo/${nm}.svg`, lgSVG(sp, {tight: true, transparent: true})); await add('prancha-de-marca.png', await lgCanvasPNG(board));
  for (const m of mocks) await add(`mockups/${m.id}.png`, await lgCanvasPNG(m.cv));
  const F = LG_FONTS[sp.font] || LG_FONTS.geo; txt('paleta-e-fontes.txt', `${sp.name}\n\nPaleta\nEscura: ${sp.pal[0]}\nPrincipal: ${sp.pal[1]}\nApoio: ${sp.pal[2]}\nDestaque: ${sp.pal[3]}\nClara: ${sp.pal[4]}\n\nFontes\nTítulo: ${F.head} (${F.hw})\nApoio: ${F.tag} (${F.tw})\n`);
  txt('LEIA-ME.txt', 'Pacote gerado pelo Laboratório do Logo.\nvariacoes/: logo com fundo claro, médio e escuro em cada combinação de cor de logo.\nPNGs transparentes em três versões (fundo claro, escuro e colorido). No SVG o texto continua como texto: instale as fontes do arquivo paleta-e-fontes.txt para abrir igual.\n');
  return makeZip(files);
}

/* ---------- páginas ---------- */
async function lgMockPage(p, r) {
  r.innerHTML = `<div class="page-head"><div><h1>Aplicações · ${esc(lg.cur.name)}</h1><p>O logo aplicado em cartão, perfil de rede social, site e produtos. São mockups desenhados no Studio (não são fotos).</p></div><div class="actions">${projectSelect()}<button class="btn" onclick="lg.view='edit';renderDesign()">← Voltar ao logo</button></div></div><div class="vf-grid lg-mocks" id="lgMocks"><small class="muted">Montando…</small></div>`;
  const tk = ++lg.busy, list = await lgMockups(lg.cur); if (tk !== lg.busy || !$('lgMocks')) return; lg.mocks = list;
  $('lgMocks').innerHTML = list.map(m => `<article class="vf-card"><canvas data-m="${m.id}" width="600" height="450"></canvas><div class="vf-meta"><b>${esc(m.label)}</b></div><div class="row-gap"><button class="btn sm" onclick="lgMockDown('${m.id}')">PNG</button></div></article>`).join('');
  document.querySelectorAll('#lgMocks canvas').forEach(cv => cv.getContext('2d').drawImage(list.find(m => m.id === cv.dataset.m).cv, 0, 0, 600, 450));
}
async function lgMockDown(id) { const m = lg.mocks.find(x => x.id === id), b = await lgCanvasPNG(m.cv), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `${lgFile(lg.cur)}-${id}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
function lgMockOpen() { lg.view = 'mock'; renderDesign(); }
async function lgBoardPage(p, r) {
  r.innerHTML = `<div class="page-head"><div><h1>Prancha de marca · ${esc(lg.cur.name)}</h1><p>Logo, paleta, tipografia, elementos e aplicações em uma página, no estilo de um manual de marca.</p></div><div class="actions">${projectSelect()}<button class="btn" onclick="lg.view='edit';renderDesign()">← Voltar ao logo</button><button class="btn" onclick="lgBoardDown('png')">PNG</button><button class="btn" onclick="lgBoardDown('pdf')">PDF</button><button class="btn dark" onclick="lgPackageDown()">Pacote da marca (ZIP)</button></div></div><div class="panel"><canvas id="lgBoard" width="960" height="675" style="width:100%;border:1px solid #e6e6e6;border-radius:12px"></canvas></div>`;
  const tk = ++lg.busy, mocks = await lgMockups(lg.cur), cv = await lgBoard(lg.cur, mocks); if (tk !== lg.busy || !$('lgBoard')) return; lg.boardCv = cv; $('lgBoard').getContext('2d').drawImage(cv, 0, 0, 960, 675);
}
function lgBoardOpen() { lg.view = 'board'; renderDesign(); }
async function lgBoardDown(kind) {
  if (!lg.boardCv) return; const cv = lg.boardCv;
  if (kind === 'png') { const b = await lgCanvasPNG(cv), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `prancha-${lgFile(lg.cur)}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); return; }
  const jb = await new Promise(res => cv.toBlob(res, 'image/jpeg', 0.93)); download(`prancha-${lgFile(lg.cur)}.pdf`, buildPDF([{jpeg: new Uint8Array(await jb.arrayBuffer()), w: cv.width, h: cv.height}], cv.width * 0.5, cv.height * 0.5), 'application/pdf');
}
async function lgPackageDown() { toast('Montando o pacote…'); try { const z = await lgPackage(lg.cur); download(`marca-${lgFile(lg.cur)}.zip`, z, 'application/zip'); toast('Pacote baixado: logos PNG/SVG, prancha, mockups e paleta.'); } catch (e) { toast('Não consegui montar o pacote: ' + e.message); } }
