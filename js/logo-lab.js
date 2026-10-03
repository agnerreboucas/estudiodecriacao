/* ===== Laboratório do Logo: briefing → opções → edição → Brand Kit / exportação =====
   Os logos são vetoriais (camadas de caminho, forma e texto do motor de design), então abrem no Editor e viram qualquer tamanho. */
const lg = {view: 'brief', brief: null, items: [], fav: {}, cur: null, filter: 'all', seed: 0, busy: 0};
const lgRng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
/* símbolo: 'ic:<nome>' vem da biblioteca de ícones (traço, viewBox 24); os demais são os símbolos próprios */
let LG_ICON_MAP = null;
const lgIcon = name => { if (!LG_ICON_MAP) { LG_ICON_MAP = {}; LG_ICONS.forEach(i => { LG_ICON_MAP[i[0]] = i; }); } return LG_ICON_MAP[name]; };
const lgInCat = (i, ci) => i[2] === ci || (i[7] || []).includes(ci);
const lgIsBrandIcon = i => /^si-|-logo$/.test(i[0]);   // logotipos de terceiros: só entram nos logos se a categoria Redes for marcada
const lgIsFillIcon = i => !!i[6];   // Phosphor: caminhos preenchidos; Lucide: traço
const lgSymDef = (id, sp) => { if (String(id).startsWith('ic:')) { const ic = lgIcon(id.slice(3)); if (!ic) return LG_SYMBOLS.sparkle; return lgIsFillIcon(ic) ? {label: ic[1], vb: ic[5] || 256, parts: [{d: ic[3], role: 'main'}]} : {label: ic[1], vb: ic[5] || 24, parts: [{d: ic[3], role: 'main', stroke: true, sw: (sp && sp.icw) || 2}]}; } return LG_SYMBOLS[id] || LG_SYMBOLS.sparkle; };
const LG_SEG_ICONS = {beleza: ['beleza', 'natureza', 'atendimento'], comida: ['alimentos', 'vendas'], construcao: ['casa', 'ferramentas', 'negocios'], imobiliaria: ['casa', 'negocios', 'justica'], saude: ['saude', 'atendimento'], fitness: ['esporte', 'vendas'], tecnologia: ['tecnologia', 'atendimento'], moda: ['beleza', 'vendas'], educacao: ['educacao', 'atendimento'], juridico: ['justica', 'seguranca', 'negocios'], financas: ['negocios', 'vendas', 'justica'], foto: ['musica', 'vendas'], natureza: ['natureza', 'viagem'], musica: ['musica', 'eventos'], marketing: ['vendas', 'comunicacao', 'negocios'], limpeza: ['casa', 'atendimento', 'energia'], auto: ['transporte', 'ferramentas', 'vendas'], pets: ['animais', 'atendimento'], outro: ['negocios', 'vendas', 'atendimento']};
const lgNorm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
[['hipster', ['arc', 'ribbon']], ['vintage', ['arc', 'ribbon']], ['conservador', ['arc', 'ribbon']], ['formal', ['ribbon']], ['moderno', ['mono', 'overlap']], ['minimalista', ['mono']], ['tech', ['mono', 'overlap']], ['criativo', ['overlap', 'mono']], ['jovem', ['mono']], ['divertido', ['arc', 'overlap']], ['elegante', ['mono']]].forEach(([id, cs]) => { const st = lgStyle(id); if (st) cs.forEach(c => { if (!st.comps.includes(c)) st.comps.push(c); }); });
const LG_COMPS = [['stack', 'Empilhada'], ['horizontal', 'Lado a lado'], ['wordmark', 'Só o nome'], ['pill', 'Pílula'], ['badge', 'Selo redondo'], ['sidebar', 'Barra lateral'], ['frame', 'Moldura'], ['lines', 'Linhas'], ['arc', 'Selo com texto em arco'], ['ribbon', 'Emblema com faixa'], ['mono', 'Monograma'], ['overlap', 'Formas sobrepostas']];
const lgLab = p => { p.design.logoLab = p.design.logoLab || {saved: [], brief: null}; return p.design.logoLab; };

function lgBriefDefault(p) {
  const txt = [p.name, p.niche, p.segment, p.description, p.audience, p.product].filter(Boolean).join(' ');
  const seg = lgDetectSegment(txt), sg = lgSegment(seg);
  return {name: p.name || '', tag: '', noTag: false, seg, styles: ['moderno', 'criativo', 'minimalista'], palIds: [], mood: [], useBrand: false, n: 24, sgTag: sg.tag};
}
function lgBrandPalette(p) {
  const b = brandOf(p); if (!isHex(b.primary)) return null;
  return {id: 'p-brand', name: 'Cores do Brand Kit', moods: [], c: [mixHex(b.primary, '#000000', 0.78), b.primary, mixHex(b.primary, '#ffffff', 0.45), isHex(b.pal.c10) ? b.pal.c10 : b.primary, mixHex(b.primary, '#ffffff', 0.94)]};
}

/* ---------- cores por modo ---------- */
function lgColors(sp) {
  const [d, m, s, a, l] = sp.pal;
  if (sp.mode === 'dark') return {bg: d, main: contrast(m, d) >= 3 ? m : contrast(s, d) >= 3 ? s : l, sec: contrast(s, d) >= 2 ? s : l, acc: contrast(a, d) >= 2.5 ? a : l, text: l, mut: mixHex(d, l, 0.62)};
  if (sp.mode === 'color') { const fg = readable(m); return {bg: m, main: fg, sec: mixHex(m, fg, 0.55), acc: contrast(a, m) >= 2.2 ? a : fg, text: fg, mut: mixHex(m, fg, 0.7)}; }
  return {bg: l, main: contrast(m, l) >= 3 ? m : d, sec: contrast(s, l) >= 1.8 ? s : m, acc: contrast(a, l) >= 1.8 ? a : m, text: d, mut: mixHex(l, d, 0.55)};
}

/* ---------- construção do logo: devolve um slide pronto (camadas) ---------- */
function lgBuild(sp, o) {
  o = o || {}; const C = lgColors(sp), F = LG_FONTS[sp.font] || LG_FONTS.geo, SY = lgSymDef(sp.sym, sp), layers = [];
  const nm = F.upper ? String(sp.name || '').toUpperCase() : String(sp.name || ''), tgU = F.tls >= 4, tg = sp.tag ? (tgU ? String(sp.tag).toUpperCase() : String(sp.tag)) : '';
  const N = 110 * (F.scale || 1) * (sp.nameScale || 1), big = ['stack', 'badge', 'frame', 'lines', 'arc', 'ribbon', 'mono', 'overlap'].includes(sp.comp), S = (big ? 190 : sp.comp === 'pill' ? 120 : 160) * (sp.symScale || 1), TS = 30;
  const mw = (txt, fam, wt, size, ls) => { const L = T('t', {content: txt, family: fam, weight: wt, size, ls, w: 99999, lh: 1, upper: false}); const ln = layoutText(L).lines[0]; return ln ? ln.w : 0; };
  const text = (role, txt, fam, wt, size, color, ls, x, y) => { const w = mw(txt, fam, wt, size, ls) + 8; const L = T(role, {content: txt, family: fam, weight: wt, size, color, ls, x, y, w, lh: 1, align: 'left', upper: false, fixUp: false}); layers.push(L); return L; };
  const sym = (x, y, s, on) => { SY.parts.forEach(pt => { const col = on ? (pt.role === 'acc' ? on.acc : pt.role === 'sec' ? on.sec : on.main) : (pt.role === 'acc' ? C.acc : pt.role === 'sec' ? C.sec : C.main);
    layers.push({id: lid(), type: 'path', role: 'logo-symbol', vb: SY.vb || 100, x, y, w: s, h: s, d: pt.d, rule: pt.rule || '', fill: pt.stroke ? '' : col, grad: (sp.grad && !pt.stroke && pt.role === 'main' && !on) ? (C.acc !== col ? C.acc : C.sec) : '', stroke: pt.stroke ? col : '', strokeW: pt.sw || 0, opacity: 1}); }); };
  const rect = (role, o2) => { const L = RC(role, o2); layers.push(L); return L; };
  const nw = mw(nm, F.head, F.hw, N, F.ls), nh = N, tw = tg ? mw(tg, F.tag, F.tw, TS, F.tls) : 0;
  const comp = sp.comp;
  if (comp === 'arc') {
    const R = Math.max(S * 1.3, 235), ring = (r, w) => rect('ring', {x: -r, y: -r, w: 2 * r, h: 2 * r, shape: 'ellipse', fill: '', stroke: C.main, strokeW: w});
    ring(R, 8); ring(R - 24, 2); sym(-S * 0.36, -S * 0.36 - 8, S * 0.72);
    const arcText = (txt, fam, wt, size, color, ls, r, top) => { const cw = [...txt].map(ch => (ch === ' ' ? size * 0.34 : mw(ch, fam, wt, size, ls)) + ls); let tot = cw.reduce((a, b) => a + b, 0), sz = size; while (tot / r > 2.9 && sz > 12) { sz *= 0.92; tot *= 0.92; for (let i = 0; i < cw.length; i++) cw[i] *= 0.92; } let cum = 0;
      [...txt].forEach((ch, i) => { const half = cw[i] / 2, off = cum + half - tot / 2; cum += cw[i]; if (ch === ' ') return; const th = top ? -Math.PI / 2 + off / r : Math.PI / 2 - off / r, px = r * Math.cos(th), py = r * Math.sin(th), bw = sz * 1.5, L = T('t', {content: ch, family: fam, weight: wt, size: sz, color, ls: 0, x: px - bw / 2, y: py - sz * 0.5, w: bw, lh: 1, align: 'center', upper: false, fixUp: false, rot: Math.round((th * 180 / Math.PI + (top ? 90 : -90)) * 10) / 10}); layers.push(L); }); };
    arcText(nm, F.head, F.hw, 54 * (F.scale || 1), C.text, F.ls, R - 66, true); if (tg) arcText(tg, F.tag, F.tw, 26, C.mut, Math.min(F.tls, 3), R - 56, false);
  } else if (comp === 'ribbon') {
    const H = S * 1.35, pts = [0, 1, 2, 3, 4, 5].map(i => [50 + 48 * Math.cos((-90 + 60 * i) * Math.PI / 180), 50 + 48 * Math.sin((-90 + 60 * i) * Math.PI / 180)]);
    layers.push({id: lid(), type: 'path', role: 'logo-shape', vb: 100, x: -H / 2, y: 0, w: H, h: H, d: lgPoly(pts), rule: '', fill: C.main, stroke: '', strokeW: 0, opacity: 1});
    const on = {main: readable(C.main), acc: contrast(C.acc, C.main) >= 2 ? C.acc : readable(C.main), sec: readable(C.main)}; sym(-S * 0.42, H / 2 - S * 0.5, S * 0.84, on);
    const fw = Math.max(nw + 90, H * 0.9), fh = N * 1.35, fy = H * 0.72, fc = contrast(C.acc, C.bg) >= 1.5 ? C.acc : C.text;
    rect('ribbon', {x: -fw / 2, y: fy, w: fw, h: fh, fill: fc, radius: 6}); text('title', nm, F.head, F.hw, N, readable(fc), F.ls, -nw / 2, fy + (fh - nh) / 2);
    if (tg) text('body', tg, F.tag, F.tw, TS, C.mut, F.tls, -tw / 2, fy + fh + 18);
  } else if (comp === 'mono') {
    const D = S * 1.15, ch = (nm.match(/\S/) || ['A'])[0].toUpperCase(), fs = D * 0.62;
    rect('mono', {x: -D / 2, y: 0, w: D, h: D, fill: C.main, radius: sp.monoRound ? D / 2 : D * 0.26}); const lw = mw(ch, F.head, F.hw, fs, 0);
    text('title', ch, F.head, F.hw, fs, readable(C.main), 0, -lw / 2, D / 2 - fs / 2); text('title', nm, F.head, F.hw, N * 0.8, C.text, F.ls, -nw * 0.8 / 2, D + 26);
    if (tg) text('body', tg, F.tag, F.tw, TS, C.mut, F.tls, -tw / 2, D + 26 + N * 0.8 + 12);
  } else if (comp === 'overlap') {
    const d = S * 0.95; rect('o1', {x: -d * 0.72, y: 0, w: d, h: d, shape: 'ellipse', fill: C.main, opacity: 0.92}); rect('o2', {x: -d * 0.28, y: 0, w: d, h: d, shape: 'ellipse', fill: C.acc !== C.main ? C.acc : C.sec, opacity: 0.78});
    text('title', nm, F.head, F.hw, N, C.text, F.ls, -nw / 2, d + 28); if (tg) text('body', tg, F.tag, F.tw, TS, C.mut, F.tls, -tw / 2, d + 28 + nh + 10);
  } else if (comp === 'stack' || comp === 'wordmark' || comp === 'badge' || comp === 'lines' || comp === 'frame') {
    const hasSym = comp !== 'wordmark', cw = Math.max(nw, tw, hasSym ? S : 0);
    let y = 0, pad = 0, boxTop = 0;
    if (comp === 'frame') { pad = 70; y = pad; }
    if (comp === 'badge') { const D = S + 120; rect('badge', {x: -D / 2, y: 0, w: D, h: D, shape: 'ellipse', fill: C.main, radius: 0}); sym(-S / 2, 60, S, {main: readable(C.main), acc: contrast(C.acc, C.main) >= 2 ? C.acc : readable(C.main), sec: readable(C.main)}); y = D + 34; }
    else if (hasSym) { const s2 = comp === 'frame' || comp === 'lines' ? S * 0.7 : S; sym(-s2 / 2, y, s2); y += s2 + 30; }
    text('title', nm, F.head, F.hw, N, C.text, F.ls, -nw / 2, y); y += nh + 10;
    if (comp === 'wordmark') { rect('accent', {x: -30, y: y + 4, w: 60, h: 8, fill: C.acc, radius: 4}); y += 34; }
    if (tg) { if (comp === 'lines') { const g = 26, tx = -tw / 2, ly = y + TS * 0.55, lw = Math.max(70, (nw - tw) / 2 - g); text('body', tg, F.tag, F.tw, TS, C.mut, F.tls, tx, y); rect('line', {x: tx - g - lw, y: ly, w: lw, h: 3, fill: C.main}); rect('line', {x: tx + tw + g, y: ly, w: lw, h: 3, fill: C.main}); }
      else text('body', tg, F.tag, F.tw, TS, C.mut, F.tls, -tw / 2, y); y += TS + 6; }
    if (comp === 'frame') { const fw = cw + pad * 2 + 40; rect('frame', {x: -fw / 2, y: 0, w: fw, h: y + pad - 10, fill: '', stroke: C.main, strokeW: 6, radius: 0}); }
  } else if (comp === 'horizontal' || comp === 'sidebar') {
    const gap = 38, bar = comp === 'sidebar'; let x = 0;
    const blockH = nh + (tg ? TS + 14 : 0), H = Math.max(S, blockH), ty = (H - blockH) / 2;
    sym(0, (H - S) / 2, S); x = S + gap;
    if (bar) { rect('bar', {x, y: H * 0.1, w: 8, h: H * 0.8, fill: C.acc, radius: 4}); x += 8 + gap; }
    text('title', nm, F.head, F.hw, N, C.text, F.ls, x, ty); if (tg) text('body', tg, F.tag, F.tw, TS, C.mut, F.tls, x, ty + nh + 12);
  } else if (comp === 'pill') {
    const gap = 30, padX = 56, H = S + 56, W = padX * 2 + S + gap + nw, on = {main: readable(C.main), acc: contrast(C.acc, C.main) >= 2 ? C.acc : readable(C.main), sec: readable(C.main)};
    rect('pill', {x: 0, y: 0, w: W, h: H, fill: C.main, radius: H / 2}); sym(padX, 28, S, on);
    text('title', nm, F.head, F.hw, N, on.main, F.ls, padX + S + gap, (H - nh) / 2);
    if (tg) text('body', tg, F.tag, F.tw, TS, C.mut, F.tls, (W - tw) / 2, H + 26);
  }
  /* centraliza e ajusta ao quadro */
  const bb = layers.reduce((b, l) => { const h = l.type === 'text' ? layoutText(l).h : l.h; return {x0: Math.min(b.x0, l.x), y0: Math.min(b.y0, l.y), x1: Math.max(b.x1, l.x + l.w), y1: Math.max(b.y1, l.y + h)}; }, {x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9});
  const bw = bb.x1 - bb.x0, bh = bb.y1 - bb.y0, mg = o.tight ? 0.06 * Math.max(bw, bh) : 0;
  let W = o.W || 1200, H = o.H || 800, k;
  if (o.tight) { W = o.W || 1600; k = W / (bw + mg * 2); H = Math.round((bh + mg * 2) * k); } else k = Math.min(W * 0.7 / bw, H * 0.6 / bh, 1.7);
  layers.forEach(l => { l.x -= bb.x0; l.y -= bb.y0; });
  const sl = {id: sid(), name: 'Logo', bg: C.bg, noBg: !!o.transparent, layers, isLogo: true, keep: true};
  scaleSlide(sl, k, k);
  const dx = Math.round((W - bw * k) / 2), dy = Math.round((H - bh * k) / 2); sl.layers.forEach(l => { l.x += dx; l.y += dy; });
  return {slide: sl, W, H};
}
async function lgFonts(sp) { const F = LG_FONTS[sp.font] || LG_FONTS.geo; await ensureFonts([F.head, F.tag]); }
async function lgPaint(cv, sp, o) { await lgFonts(sp); const r = lgBuild(sp, o); renderSlide(cv.getContext('2d'), r.slide, r.W, r.H, cv.width / r.W); return r; }

/* ---------- geração ---------- */
function lgGenerate(p, brief, n, seed) {
  const rnd = lgRng(seed), pick = a => a[Math.floor(rnd() * a.length)], seg = lgSegment(brief.seg);
  const sts = (brief.styles.length ? brief.styles : ['moderno']).map(lgStyle).filter(Boolean);
  let pals = brief.palIds.map(id => LG_PALETTES.find(x => x.id === id)).filter(Boolean);
  const bp = brief.useBrand && lgBrandPalette(p); if (bp) pals.unshift(bp);
  if (!pals.length) { const moods = new Set(brief.mood.length ? brief.mood : sts.flatMap(s => s.mood)); pals = LG_PALETTES.filter(x => x.moods.some(m => moods.has(m))); if (!pals.length) pals = LG_PALETTES.slice(); }
  const cats = (brief.iconCats && brief.iconCats.length ? brief.iconCats : LG_SEG_ICONS[brief.seg] || ['formas']), ci = cats.map(id => LG_ICON_CATS.findIndex(c => c[0] === id)).filter(i => i >= 0), icPool = LG_ICONS.filter(i => (!lgIsBrandIcon(i) || (brief.iconCats || []).includes('redes')) && ci.some(c => lgInCat(i, c)) && (!brief.iconStyle || (brief.iconStyle === 'fill' ? i[6] === 'f' : i[6] !== 'f')));
  const out = [], seen = new Set();
  for (let g = 0; g < n * 8 && out.length < n; g++) {
    const st = sts[out.length % sts.length], useIc = brief.icons !== false && rnd() < (brief.iconCats && brief.iconCats.length ? 0.85 : 0.4) && icPool.length;
    const symPool = rnd() < 0.6 ? seg.sym.concat(st.sym) : st.sym.concat(seg.sym), sym = useIc ? 'ic:' + pick(icPool)[0] : pick(symPool.filter(x => LG_SYMBOLS[x]));
    const sp = {id: uid('lg'), name: brief.name, tag: brief.noTag ? '' : brief.tag, sym, icw: 2.4, style: st.id, font: pick(st.fonts), comp: pick(st.comps), mode: pick(st.modes), pal: (pick(pals)).c.slice(), palId: '', symScale: 1, nameScale: 1, grad: rnd() < 0.22, monoRound: rnd() < 0.4};
    sp.palId = pals.find(x => x.c.join() === sp.pal.join()).id;
    const key = [sp.sym, sp.font, sp.comp, sp.mode, sp.palId].join('|'); if (seen.has(key)) continue; seen.add(key); out.push(sp);
  }
  return out;
}

/* ---------- páginas ---------- */
function dzLogoOpen() { const p = dzP(); if (!p) return; const L = lgLab(p); lg.brief = Object.assign(lgBriefDefault(p), L.brief || {}); if (!lg.brief.name) lg.brief.name = p.name || ''; lg.view = lg.items.length && lg.cur ? lg.view : 'brief'; lg.items = lg.items.length ? lg.items : []; dz.view = 'logolab'; go('design'); renderDesign(); }
function renderLogoLab(p, r) {
  if (!lg.brief) lg.brief = lgBriefDefault(p);
  if (lg.view === 'grid' && lg.items.length) return lgGridPage(p, r);
  if (lg.view === 'edit' && lg.cur) return lgEditPage(p, r);
  if (lg.view === 'mock' && lg.cur) return lgMockPage(p, r);
  if (lg.view === 'board' && lg.cur) return lgBoardPage(p, r);
  lgBriefPage(p, r);
}
const lgChip = (on, fn, label) => `<button class="tchip ${on ? 'on' : ''}" onclick="${fn}">${esc(label)}</button>`;
const LG_STEPS = ['Negócio', 'Estilo', 'Texto', 'Cores e ícones'];
function lgBriefPage(p, r) {
  const b = lg.brief, sg = lgSegment(b.seg), bp = lgBrandPalette(p), saved = lgLab(p).saved, st = lg.step || 0, last = st === LG_STEPS.length - 1;
  const head = `<div class="page-head"><div><h1>Laboratório do Logo</h1><p>Responda 4 perguntas curtas. O Studio monta dezenas de logos vetoriais; você escolhe, refina e leva para o Brand Kit.</p></div><div class="actions">${projectSelect()}${saved.length ? `<button class="btn" onclick="lgSavedOpen()">Meus logos (${saved.length})</button>` : ''}<button class="btn" onclick="dzBack()">Estúdio</button></div></div>
  <div class="lg-steps">${LG_STEPS.map((t, i) => `<button class="${i === st ? 'on' : i < st ? 'done' : ''}" onclick="lgStep(${i})"><i>${i + 1}</i>${t}</button>`).join('')}</div>`;
  let body = '';
  if (st === 0) body = `<h2 class="lg-q">Que tipo de negócio você tem?</h2><p class="muted">Isso ajuda a oferecer símbolos e slogans mais certos.</p><div class="tchips lg-big">${LG_SEGMENTS.map(s => lgChip(s.id === b.seg, `lg.brief.seg='${s.id}';lg.brief.tag='';renderDesign()`, s.label)).join('')}</div>`;
  else if (st === 1) body = `<h2 class="lg-q">Qual estilo você quer para o seu logo?</h2><p class="muted">As fontes, ícones e cores refletem o estilo. Escolha até 4.</p><div class="tchips lg-big">${LG_STYLES.map(s => lgChip(b.styles.includes(s.id), `lgTogStyle('${s.id}')`, s.label)).join('')}</div>`;
  else if (st === 2) body = `<h2 class="lg-q">Que texto você quer no seu logo?</h2><p class="muted">Normalmente é o nome da marca.</p><div class="field" style="max-width:520px"><input id="lgName" value="${esc(b.name)}" placeholder="Ex.: seu nome comercial" oninput="lg.brief.name=this.value"></div>
    <h2 class="lg-q" style="margin-top:22px">Qual é o seu lema ou slogan? <small class="muted">(opcional)</small></h2><div class="field" style="max-width:520px"><input id="lgTag" value="${esc(b.tag)}" placeholder="Ex.: ${esc(sg.tag[0])}" oninput="lg.brief.tag=this.value;lg.brief.noTag=false"></div>
    <div class="tchips" style="margin-top:6px">${sg.tag.map(t => `<button class="tchip" onclick="lg.brief.tag=this.textContent;lg.brief.noTag=false;$('lgTag').value=lg.brief.tag">${esc(t)}</button>`).join('')}${lgChip(b.noTag, 'lg.brief.noTag=!lg.brief.noTag;renderDesign()', 'Sem slogan')}${aiReady() ? '<button class="tchip" onclick="lgTagAI()">✦ Sugestões com IA</button>' : ''}</div><div class="tchips" id="lgTagAI" style="margin-top:6px"></div><small class="muted block" style="margin-top:6px">Sugestões de slogan podem ser imprecisas. Confira antes de usar.</small>`;
  else body = `<h2 class="lg-q">Cores e ícones</h2>${bp ? `<label class="check"><input type="checkbox" ${b.useBrand ? 'checked' : ''} onchange="lg.brief.useBrand=this.checked;renderDesign()"> Incluir as cores do Brand Kit <span class="bk-chips" style="display:inline-flex;vertical-align:middle;margin-left:6px">${bp.c.map(c => `<i class="bk-chip" style="background:${c};width:14px;height:14px"></i>`).join('')}</span></label>` : '<small class="muted block">Quando houver um Brand Kit, as cores dele aparecem aqui como opção.</small>'}
    <div class="okr-label" style="margin-top:10px">CLIMA <small class="muted">(vazio = segue o estilo)</small></div><div class="tchips">${LG_MOODS.map(m => lgChip(b.mood.includes(m), `lgTogMood('${m}')`, m)).join('')}</div>
    <div class="okr-label" style="margin-top:10px">PALETAS ESPECÍFICAS <small class="muted">(${b.palIds.length} marcada(s))</small></div><div class="lg-pals">${LG_PALETTES.map(x => `<button class="lg-pal ${b.palIds.includes(x.id) ? 'on' : ''}" title="${esc(x.name)}" onclick="lgTogPal('${x.id}')">${x.c.map(c => `<i style="background:${c}"></i>`).join('')}<span>${esc(x.name)}</span></button>`).join('')}</div>
    <div class="okr-label" style="margin-top:12px">BIBLIOTECA DE ÍCONES <small class="muted">(${LG_ICONS.length} ícones)</small></div><label class="check"><input type="checkbox" ${b.icons !== false ? 'checked' : ''} onchange="lg.brief.icons=this.checked;renderDesign()"> Usar ícones da biblioteca nos logos</label>
    <div class="tchips" style="margin-top:6px">${LG_ICON_CATS.map(c => lgChip((b.iconCats || []).includes(c[0]), `lgTogIconCat('${c[0]}')`, c[1])).join('')}</div>${(b.iconCats || []).includes('redes') ? '<small class="muted block lg-tm">Os logotipos de redes e apps são marcas registradas dos seus donos. Use para indicar presença (“Siga-nos”), não como símbolo da sua marca.</small>' : ''}<div class="tchips" style="margin-top:8px">${lgChip(!b.iconStyle, "lg.brief.iconStyle='';renderDesign()", 'Linha e cheio')}${lgChip(b.iconStyle === 'line', "lg.brief.iconStyle='line';renderDesign()", 'Só linha')}${lgChip(b.iconStyle === 'fill', "lg.brief.iconStyle='fill';renderDesign()", 'Só cheio (mais forte para logo)')}</div><small class="muted block">Sem categoria marcada, usa as do segmento (${(LG_SEG_ICONS[b.seg] || []).map(id => (LG_ICON_CATS.find(c => c[0] === id) || [0, id])[1]).join(', ')}).</small>
    <div class="row-gap" style="margin-top:14px"><label class="ins" style="margin:0">Quantidade <b>${b.n}</b><input type="range" min="12" max="60" step="6" value="${b.n}" oninput="lg.brief.n=+this.value;this.previousElementSibling.textContent=this.value"></label></div>
    ${imageReady() ? `<div class="row-gap" style="margin-top:8px"><button class="btn sm" onclick="lgAIRun()" title="Gera conceitos de logo com IA de imagem (o texto da IA pode vir com erros)">✦ Conceitos com IA</button></div>` : ''}`;
  r.innerHTML = head + `<div class="panel lg-step">${body}<div class="lg-nav">${st > 0 ? `<button class="btn" onclick="lgStep(${st - 1})">← Voltar</button>` : '<span></span>'}<div class="row-gap">${!last ? `<button class="btn" onclick="lgStep(${st + 1})">Pular</button><button class="btn dark" onclick="lgStep(${st + 1})">Próximo →</button>` : '<button class="btn dark" onclick="lgRun()">Gerar logos</button>'}</div></div></div>`;
  const f = $(st === 2 ? 'lgName' : ''); if (f && !b.name) f.focus();
}
function lgStep(i) { lg.step = Math.max(0, Math.min(LG_STEPS.length - 1, i)); renderDesign(); }
async function lgTagAI() {
  const b = lg.brief, box = $('lgTagAI'); if (!b.name.trim()) { toast('Escreva o nome primeiro.'); return; } box.innerHTML = '<small class="muted">Pensando…</small>';
  try { const j = await aiJSON('Você sugere slogans curtos (até 6 palavras) para logos de pequenas empresas brasileiras. Não prometa resultados nem invente fatos.', `Marca: ${b.name}. Segmento: ${lgSegment(b.seg).label}. Estilos: ${b.styles.join(', ')}. Devolva {"slogans":["...","...","...","...","..."]}`);
    box.innerHTML = (j.slogans || []).slice(0, 6).map(t => `<button class="tchip" onclick="lg.brief.tag=this.textContent;lg.brief.noTag=false;$('lgTag').value=lg.brief.tag">${esc(String(t))}</button>`).join('') || '<small class="muted">Sem sugestões.</small>';
  } catch (e) { box.innerHTML = ''; toast(e.message); }
}
function lgTogStyle(id) { const a = lg.brief.styles; const i = a.indexOf(id); if (i >= 0) a.splice(i, 1); else { if (a.length >= 4) a.shift(); a.push(id); } renderDesign(); }
function lgTogIconCat(id) { lg.brief.iconCats = lg.brief.iconCats || []; tog(lg.brief.iconCats, id); renderDesign(); }
function lgTogMood(m) { tog(lg.brief.mood, m); renderDesign(); }
function lgTogPal(id) { tog(lg.brief.palIds, id); renderDesign(); }
async function lgRun(more) {
  const p = dzP(), b = lg.brief; b.name = String(b.name || '').trim(); if (!b.name) { toast('Escreva o nome da marca.'); lg.step = 2; renderDesign(); return; }
  if (!b.styles.length) { toast('Escolha ao menos um estilo.'); return; }
  lgLab(p).brief = JSON.parse(JSON.stringify(b)); persist(); lg.seed = more ? lg.seed + 1 : Date.now() % 100000;
  const gen = lgGenerate(p, b, b.n, lg.seed); if (!gen.length) { toast('Não consegui montar opções com essas escolhas.'); return; }
  lg.items = more ? lg.items.concat(gen) : gen; lg.view = 'grid'; lg.filter = 'all'; renderDesign();
}
function lgGridPage(p, r) {
  const view = lg.items.filter(i => lg.filter === 'fav' ? lg.fav[i.id] : true), nf = lg.items.filter(i => lg.fav[i.id]).length;
  r.innerHTML = `<div class="page-head"><div><h1>${esc(lg.brief.name)} · ${lg.items.length} logos</h1><p>Marque os favoritos com ★ e clique em Editar para ajustar símbolo, fonte, cores e composição.</p></div><div class="actions">${projectSelect()}<button class="btn" onclick="lg.view='brief';lg.step=0;renderDesign()">Ajustar briefing</button><button class="btn" onclick="lgIconModal()" title="Troca o símbolo de todos os logos de uma vez, mantendo fonte, composição e cores">Ver outros ícones</button>${lg.items.some(i => i.orig) ? '<button class="btn" onclick="lgRevertIcons()">Reverter ícones</button>' : ''}<button class="btn" onclick="lgRun(true)">＋ Gerar mais</button></div></div>
  <div class="vf-bar"><div class="matrix-tabs">${[['all', 'Todos (' + lg.items.length + ')'], ['fav', '★ Favoritos (' + nf + ')']].map(([k, l]) => `<button class="${lg.filter === k ? 'active' : ''}" onclick="lg.filter='${k}';renderDesign()">${l}</button>`).join('')}</div></div>
  <div class="vf-grid lg-grid">${view.map(it => it.kind === 'ai' ? `<article class="vf-card"><canvas data-ai="${it.imgId}" width="300" height="300"></canvas><div class="vf-meta"><b>Conceito com IA</b><small>${esc(it.note || '')}</small></div><div class="row-gap"><button class="btn sm" onclick="lgAISave('${it.id}')">Salvar no Brand Kit</button></div></article>`
    : `<article class="vf-card"><canvas data-lg="${it.id}" width="300" height="200"></canvas><div class="vf-meta"><b>${esc((LG_FONTS[it.font] || {}).label || '')} · ${esc(it.comp)}</b><small>${esc(lgSymDef(it.sym, it).label || '')} · ${esc(it.mode === 'color' ? 'cor cheia' : it.mode === 'dark' ? 'escuro' : 'claro')}</small></div><div class="row-gap"><button class="btn sm ${lg.fav[it.id] ? 'dark' : ''}" onclick="lg.fav['${it.id}']=!lg.fav['${it.id}'];renderDesign()">★</button><button class="btn sm dark" onclick="lgEdit('${it.id}')">Editar</button></div></article>`).join('')}</div>`;
  lgPaintGrid();
}
async function lgPaintGrid() {
  const cvs = [...document.querySelectorAll('.lg-grid canvas')]; let n = 0;
  for (const cv of cvs) { if (!cv.isConnected) return;
    if (cv.dataset.lg) { const it = lg.items.find(i => i.id === cv.dataset.lg); if (it) try { await lgPaint(cv, it); } catch (e) { /* mantém vazio */ } }
    else if (cv.dataset.ai) { try { await loadImage(cv.dataset.ai); const bm = IMGS.get(cv.dataset.ai); if (bm) cv.getContext('2d').drawImage(bm, 0, 0, cv.width, cv.height); } catch (e) { /* ok */ } }
    if (++n % 6 === 0) await new Promise(r => setTimeout(r, 0)); }
}
function lgEdit(id) { lg.cur = JSON.parse(JSON.stringify(lg.items.find(i => i.id === id) || lgLab(dzP()).saved.find(i => i.id === id))); lg.view = 'edit'; renderDesign(); }
function lgEditPage(p, r) {
  const s = lg.cur, pal = LG_PALETTES.concat(lgBrandPalette(p) || []);
  const pickS = lgSymPicker();
  r.innerHTML = `<div class="page-head"><div><h1>Editar logo</h1><p>Mexa em qualquer parte; a prévia atualiza na hora.</p></div><div class="actions">${projectSelect()}<button class="btn" onclick="lg.view=lg.items.length?'grid':'brief';renderDesign()">← Voltar</button></div></div>
  <div class="two dz-compose"><div class="panel"><canvas id="lgBig" width="720" height="480" style="width:100%;max-width:720px;border:1px solid #e6e6e6;border-radius:12px"></canvas>
    <div class="row-gap" style="margin-top:12px">${['light', 'dark', 'color'].map(m => `<button class="btn sm ${s.mode === m ? 'dark' : ''}" onclick="lgSet('mode','${m}')">${{light: 'Fundo claro', dark: 'Fundo escuro', color: 'Fundo colorido'}[m]}</button>`).join('')}</div>
    <div class="row-gap" style="margin-top:12px"><button class="btn dark" onclick="lgSaveKit()">Salvar no Brand Kit</button><button class="btn" onclick="lgDownload('png')">PNG transparente</button><button class="btn" onclick="lgDownload('svg')">SVG</button><button class="btn" onclick="lgToEditor()">Abrir no Editor</button><button class="btn" onclick="lgMockOpen()">Ver em mockups</button><button class="btn" onclick="lgBoardOpen()">Prancha de marca</button><button class="btn" onclick="lgPackageDown()">Pacote ZIP</button><button class="btn" onclick="lgSaveLab()">Guardar em Meus logos</button></div>
    <small class="muted block" style="margin-top:6px">No SVG o texto sai como texto (a fonte precisa estar instalada onde for aberto). O PNG sai com a fonte já aplicada.</small></div>
  <div class="panel"><div class="field"><label>Nome</label><input value="${esc(s.name)}" oninput="lgSet('name',this.value,1)"></div><div class="field"><label>Slogan</label><input value="${esc(s.tag)}" oninput="lgSet('tag',this.value,1)"></div>
    <div class="okr-label">SÍMBOLO</div>${pickS}
    <div class="ins-row"><label class="ins">Fonte<select onchange="lgSet('font',this.value)">${Object.entries(LG_FONTS).map(([k, f]) => `<option value="${k}" ${s.font === k ? 'selected' : ''}>${esc(f.label)} · ${esc(f.head)}</option>`).join('')}</select></label>
    <label class="ins">Composição<select onchange="lgSet('comp',this.value)">${LG_COMPS.map(([k, l]) => `<option value="${k}" ${s.comp === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
    <div class="ins-row"><label class="ins">Símbolo <b>${Math.round(s.symScale * 100)}%</b><input type="range" min="50" max="180" value="${Math.round(s.symScale * 100)}" oninput="lgSet('symScale',this.value/100,1);this.previousElementSibling.textContent=this.value+'%'"></label>${String(s.sym).startsWith('ic:') && !lgIsFillIcon(lgIcon(s.sym.slice(3)) || []) ? `<label class="ins">Traço do ícone <b>${s.icw || 2}</b><input type="range" min="1" max="3.5" step="0.1" value="${s.icw || 2}" oninput="lgSet('icw',+this.value,1);this.previousElementSibling.textContent=this.value"></label>` : ''}<label class="ins">Nome <b>${Math.round(s.nameScale * 100)}%</b><input type="range" min="60" max="160" value="${Math.round(s.nameScale * 100)}" oninput="lgSet('nameScale',this.value/100,1);this.previousElementSibling.textContent=this.value+'%'"></label></div>
    <label class="check" style="margin:4px 0 10px"><input type="checkbox" ${s.grad ? 'checked' : ''} onchange="lgSet('grad',this.checked)"> Degradê no símbolo</label>
    <div class="okr-label">PALETA</div><div class="lg-pals">${pal.map(x => `<button class="lg-pal ${s.pal.join() === x.c.join() ? 'on' : ''}" title="${esc(x.name)}" onclick="lgSetPal('${x.id}')">${x.c.map(c => `<i style="background:${c}"></i>`).join('')}<span>${esc(x.name)}</span></button>`).join('')}</div>
    <div class="okr-label" style="margin-top:8px">AJUSTE FINO DAS 5 CORES <small class="muted">escura · principal · apoio · destaque · clara</small></div><div class="bk-chips">${s.pal.map((c, i) => `<input type="color" value="${c}" oninput="lgSetColor(${i},this.value)" style="width:42px;height:34px;padding:0;border:1px solid #ddd;border-radius:8px">`).join('')}</div></div></div>`;
  lgDrawBig(); lgSymCanvases();
}
/* seletor de símbolo: próprios + biblioteca de ícones (busca e categorias) */
const lgIc = {tab: 'own', q: '', cat: '', sty: ''};
const lgIconSVG = (i, sw) => lgIsFillIcon(i) ? `<svg viewBox="0 0 ${i[5] || 256} ${i[5] || 256}" fill="currentColor"><path d="${i[3]}"/></svg>` : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw || 2}" stroke-linecap="round" stroke-linejoin="round"><path d="${i[3]}"/></svg>`;
const lgIconOk = (i, ci, q, sty) => (ci < 0 || lgInCat(i, ci)) && (!sty || (sty === 'fill' ? i[6] === 'f' : i[6] !== 'f')) && q.every(w => lgNorm(i[0] + ' ' + i[1] + ' ' + i[4] + ' ' + LG_ICON_CATS[i[2]][1]).includes(w));
function lgIconList() { const q = lgNorm(lgIc.q).trim().split(/\s+/).filter(Boolean); const ci = lgIc.cat ? LG_ICON_CATS.findIndex(c => c[0] === lgIc.cat) : -1;
  return LG_ICONS.filter(i => lgIconOk(i, ci, q, lgIc.sty)); }
function lgSymPicker() {
  const s = lg.cur, tabs = `<div class="matrix-tabs" style="margin:6px 0"><button class="${lgIc.tab === 'own' ? 'active' : ''}" onclick="lgIc.tab='own';lgSymRender()">Símbolos próprios (${LG_SYMBOL_IDS.length})</button><button class="${lgIc.tab === 'icons' ? 'active' : ''}" onclick="lgIc.tab='icons';lgSymRender()">Biblioteca de ícones (${LG_ICONS.length})</button></div>`;
  if (lgIc.tab === 'own') return `<div id="lgSymBox">${tabs}<div class="lg-syms">${LG_SYMBOL_IDS.map(id => `<button class="lg-sym ${s.sym === id ? 'on' : ''}" title="${esc(LG_SYMBOLS[id].label)}" onclick="lgSet('sym','${id}')"><canvas data-sym="${id}" width="56" height="56"></canvas></button>`).join('')}</div></div>`;
  const list = lgIconList();
  return `<div id="lgSymBox">${tabs}<input class="lg-search" placeholder="Buscar: casa, coração, café, raio…" value="${esc(lgIc.q)}" oninput="lgIc.q=this.value;lgIconGrid()"><div class="tchips" style="margin:6px 0"><button class="tchip ${lgIc.cat ? '' : 'on'}" onclick="lgIc.cat='';lgSymRender()">Todas</button>${LG_ICON_CATS.map(c => `<button class="tchip ${lgIc.cat === c[0] ? 'on' : ''}" onclick="lgIc.cat='${c[0]}';lgSymRender()">${esc(c[1])}</button>`).join('')}</div><div class="row-gap" style="margin:0 0 6px"><button class="tchip ${lgIc.sty ? '' : 'on'}" onclick="lgIc.sty='';lgSymRender()">Todos os estilos</button><button class="tchip ${lgIc.sty === 'line' ? 'on' : ''}" onclick="lgIc.sty='line';lgSymRender()">Linha</button><button class="tchip ${lgIc.sty === 'fill' ? 'on' : ''}" onclick="lgIc.sty='fill';lgSymRender()">Cheio</button></div>${lgIc.cat === 'redes' ? '<small class="muted block lg-tm">Os logotipos de redes e apps são marcas registradas dos seus donos. Use para indicar presença (“Siga-nos”), não como símbolo da sua marca.</small>' : ''}<div class="lg-icons" id="lgIcons">${lgIconGridHTML(list)}</div></div>`;
}
const lgIconGridHTML = list => list.length ? list.slice(0, 240).map(i => `<button class="lg-ic ${lg.cur && lg.cur.sym === 'ic:' + i[0] ? 'on' : ''}" title="${esc(i[1])}" onclick="lgSet('sym','ic:${i[0]}')">${lgIconSVG(i, 1.8)}</button>`).join('') + (list.length > 240 ? `<small class="muted block" style="grid-column:1/-1">Mostrando 240 de ${list.length}. Refine a busca ou escolha uma categoria.</small>` : '') : '<small class="muted">Nenhum ícone encontrado.</small>';
function lgIconGrid() { const el = $('lgIcons'); if (el) el.innerHTML = lgIconGridHTML(lgIconList()); }
function lgSymRender() { const el = $('lgSymBox'); if (!el) return; el.outerHTML = lgSymPicker(); lgSymCanvases(); }
function lgSymCanvases() { document.querySelectorAll('canvas[data-sym]').forEach(cv => { const parts = LG_SYMBOLS[cv.dataset.sym].parts, x = cv.getContext('2d'); x.clearRect(0, 0, 56, 56); parts.forEach(pt => { const path = new Path2D(pt.d); x.save(); x.scale(0.56, 0.56); x.fillStyle = x.strokeStyle = pt.role === 'acc' ? '#999' : '#111'; if (pt.stroke) { x.lineWidth = pt.sw || 4; x.lineCap = 'round'; x.stroke(path); } else x.fill(path, pt.rule || 'nonzero'); x.restore(); }); }); }
let lgBigT = 0;
function lgDrawBig() { clearTimeout(lgBigT); lgBigT = setTimeout(async () => { const cv = $('lgBig'); if (cv && lg.cur) { cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); await lgPaint(cv, lg.cur); } }, 30); }
function lgSet(k, v, live) { lg.cur[k] = v; if (live) lgDrawBig(); else renderDesign(); }
function lgSetPal(id) { const x = LG_PALETTES.concat(lgBrandPalette(dzP()) || []).find(y => y.id === id); if (x) { lg.cur.pal = x.c.slice(); lg.cur.palId = id; renderDesign(); } }
function lgSetColor(i, v) { lg.cur.pal[i] = v; lg.cur.palId = ''; lgDrawBig(); }

/* ---------- saída: PNG, SVG, Brand Kit, Editor ---------- */
function lgSVG(sp, o) {
  const r = lgBuild(sp, o), e = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'), P = [], DEFS = []; let gi = 0;
  r.slide.layers.forEach(l => {
    if (l.type === 'rect') { const f = l.fill || 'none', st = l.stroke ? ` stroke="${e(l.stroke)}" stroke-width="${l.strokeW || 0}"` : ''; P.push(l.shape === 'ellipse' ? `<ellipse cx="${l.x + l.w / 2}" cy="${l.y + l.h / 2}" rx="${l.w / 2}" ry="${l.h / 2}" fill="${e(f)}"${st}/>` : `<rect x="${l.x}" y="${l.y}" width="${l.w}" height="${l.h}" rx="${l.radius || 0}" fill="${e(f)}"${st}/>`); }
    else if (l.type === 'path') { let fill = l.fill ? e(l.fill) : 'none'; if (l.fill && l.grad) { const id = 'g' + (gi++), vb = l.vb || 100; DEFS.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${vb}" y2="${vb}"><stop offset="0" stop-color="${e(l.fill)}"/><stop offset="1" stop-color="${e(l.grad)}"/></linearGradient>`); fill = `url(#${id})`; }
      P.push(`<path transform="translate(${l.x} ${l.y}) scale(${l.w / (l.vb || 100)} ${l.h / (l.vb || 100)})" d="${e(l.d)}" fill="${fill}" fill-rule="${l.rule || 'nonzero'}"${l.stroke ? ` stroke="${e(l.stroke)}" stroke-width="${l.strokeW}" stroke-linecap="round" stroke-linejoin="round"` : ''}/>`); }
    else if (l.type === 'text') { const ctr = l.align === 'center', tx = ctr ? l.x + l.w / 2 : l.x, ty = l.y + l.size * 0.82, rot = l.rot ? ` transform="rotate(${l.rot} ${l.x + l.w / 2} ${l.y + l.size / 2})"` : ''; P.push(`<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}"${ctr ? ' text-anchor="middle"' : ''}${rot} font-family="${e(l.family)}, sans-serif" font-weight="${l.weight}" font-size="${l.size}" letter-spacing="${l.ls || 0}" fill="${e(l.color)}">${e(l.content)}</text>`); }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r.W} ${r.H}" width="${r.W}" height="${r.H}">${DEFS.length ? '<defs>' + DEFS.join('') + '</defs>' : ''}${o && o.transparent ? '' : `<rect width="${r.W}" height="${r.H}" fill="${e(r.slide.bg)}"/>`}${P.join('')}</svg>`;
}
async function lgBlob(sp, o) { await lgFonts(sp); const r = lgBuild(sp, o), cv = document.createElement('canvas'); cv.width = r.W; cv.height = r.H; renderSlide(cv.getContext('2d'), r.slide, r.W, r.H, 1); return new Promise(res => cv.toBlob(res, 'image/png')); }
const lgFile = sp => (sp.name || 'logo').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'logo';
async function lgDownload(kind) {
  const sp = lg.cur, o = {tight: true, transparent: true};
  if (kind === 'svg') { download(`logo-${lgFile(sp)}.svg`, lgSVG(sp, o), 'image/svg+xml'); return; }
  const b = await lgBlob(sp, o); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `logo-${lgFile(sp)}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
async function lgSaveKit() {
  const p = dzP(), b = brandOf(p), sp = lg.cur, add = async (mode, tone) => { const s2 = Object.assign({}, sp, {mode}); const blob = await lgBlob(s2, {tight: true, transparent: true}), id = uid('img'), bmp = await createImageBitmap(blob); await imgPut(id, blob); IMGS.set(id, bmp); b.logos.push({id: uid('lg'), name: (sp.name || 'Logo').slice(0, 30) + ' · ' + (tone === 'dark' ? 'p/ fundo escuro' : 'p/ fundo claro'), imgId: id, tone, w: bmp.width, h: bmp.height, lab: sp.id}); return bmp; };
  const bm = await add('light', 'light'); await add('dark', 'dark');
  const pal = sp.pal; b.primary = pal[1]; b.extracted = [pal[1], pal[2], pal[3]].filter(isHex); brandRecalc(p); lgLab(p).saved = lgLab(p).saved.filter(x => x.id !== sp.id).concat([JSON.parse(JSON.stringify(sp))]);
  persist(); toast('Logo salvo no Brand Kit (versões para fundo claro e escuro) e paleta atualizada.');
}
function lgSaveLab() { const p = dzP(), L = lgLab(p); L.saved = L.saved.filter(x => x.id !== lg.cur.id).concat([JSON.parse(JSON.stringify(lg.cur))]); persist(); toast('Guardado em Meus logos.'); }
function lgSavedOpen() { const p = dzP(), L = lgLab(p); lg.items = L.saved.map(s => JSON.parse(JSON.stringify(s))); lg.view = 'grid'; renderDesign(); }
async function lgToEditor() {
  const p = dzP(), sp = lg.cur, r = (await lgFonts(sp), lgBuild(sp, {W: 1200, H: 800})), tk = brandTokens(p);
  const set = {id: uid('ds'), name: 'Logo · ' + (sp.name || 'marca'), format: {id: 'custom', w: r.W, h: r.H}, tk, slides: [r.slide], created: new Date().toISOString(), updated: new Date().toISOString()};
  p.design.sets.push(set); persist(); dz.view = 'home'; dzOpen(set.id);
}
async function lgAIRun() {
  const p = dzP(), b = lg.brief; b.name = String(b.name || '').trim(); if (!b.name) { toast('Escreva o nome da marca.'); return; }
  const sg = lgSegment(b.seg), st = b.styles.map(id => lgStyle(id).label).join(', '), pal = (LG_PALETTES.find(x => x.id === b.palIds[0]) || lgBrandPalette(p) || LG_PALETTES[0]).c;
  const prompt = `Professional brand logo for "${b.name}", a ${sg.ai}. Style: ${st}. Flat vector logo mark with simple geometric shapes, limited palette (${pal.slice(1, 4).join(', ')}), centered on a plain light background, generous margins, no mockup, no photograph.`;
  toast('Gerando conceitos…'); try {
    const blob = await generateImage({prompt, size: 'square', quality: 'medium', refs: []}), bmp = await createImageBitmap(blob), id = uid('img'); await imgPut(id, blob); IMGS.set(id, bmp);
    lg.items.unshift({id: uid('lgai'), kind: 'ai', imgId: id, note: st}); lg.view = 'grid'; renderDesign(); toast('Conceito gerado. Salve no Brand Kit se gostar.');
  } catch (e) { toast(e.message); }
}
async function lgAISave(id) { const p = dzP(), b = brandOf(p), it = lg.items.find(i => i.id === id); await loadImage(it.imgId); const bm = IMGS.get(it.imgId); b.logos.push({id: uid('lg'), name: (lg.brief.name || 'Logo') + ' · IA', imgId: it.imgId, tone: 'any', w: bm.width, h: bm.height}); if (!b.extracted.length) { b.extracted = extractColors(bm); if (b.extracted[0]) { b.primary = b.extracted[0]; brandRecalc(p); } } persist(); toast('Conceito salvo no Brand Kit.'); }

/* ---------- trocar o ícone de todos os logos da grade ---------- */
const lgM = {q: '', cat: '', sty: ''};
function lgIconModal() {
  lgM.q = ''; lgM.cat = ''; lgM.sty = '';
  showModal('Escolher ícone para todos os logos', `<input class="lg-search" id="lgMq" placeholder="Buscar: casa, café, raio…" oninput="lgM.q=this.value;lgModalGrid()"><div class="tchips" style="margin:8px 0" id="lgMcats"></div><div class="lg-icons" id="lgMgrid" style="max-height:340px"></div><div class="modal-actions"><button class="btn" onclick="lgIconRandom()">Aleatório</button><button class="btn" onclick="closeModal()">Fechar</button></div>`);
  lgModalGrid();
}
function lgModalGrid() {
  const q = lgNorm(lgM.q).trim().split(/\s+/).filter(Boolean), ci = lgM.cat ? LG_ICON_CATS.findIndex(c => c[0] === lgM.cat) : -1;
  $('lgMcats').innerHTML = `<button class="tchip ${lgM.sty === 'line' ? 'on' : ''}" onclick="lgM.sty=lgM.sty==='line'?'':'line';lgModalGrid()">Linha</button><button class="tchip ${lgM.sty === 'fill' ? 'on' : ''}" onclick="lgM.sty=lgM.sty==='fill'?'':'fill';lgModalGrid()">Cheio</button> <button class="tchip ${lgM.cat ? '' : 'on'}" onclick="lgM.cat='';lgModalGrid()">Todas</button>` + LG_ICON_CATS.map(c => `<button class="tchip ${lgM.cat === c[0] ? 'on' : ''}" onclick="lgM.cat='${c[0]}';lgModalGrid()">${esc(c[1])}</button>`).join('');
  const list = LG_ICONS.filter(i => lgIconOk(i, ci, q, lgM.sty));
  $('lgMgrid').innerHTML = list.length ? list.slice(0, 200).map(i => `<button class="lg-ic" title="${esc(i[1])}" onclick="lgApplyIconAll('ic:${i[0]}')">${lgIconSVG(i, 1.8)}</button>`).join('') : '<small class="muted">Nenhum ícone encontrado.</small>';
}
function lgApplyIconAll(sym) { lg.items.forEach(it => { if (it.kind) return; if (!it.orig) it.orig = it.sym; it.sym = sym; }); closeModal(); renderDesign(); toast('Ícone aplicado em todos os logos.'); }
function lgIconRandom() { const ci = lgM.cat ? LG_ICON_CATS.findIndex(c => c[0] === lgM.cat) : -1, pool = LG_ICONS.filter(i => lgIconOk(i, ci, [], lgM.sty)); lgApplyIconAll('ic:' + pool[Math.floor(Math.random() * pool.length)][0]); }
function lgRevertIcons() { lg.items.forEach(it => { if (it.orig) { it.sym = it.orig; delete it.orig; } }); renderDesign(); }
