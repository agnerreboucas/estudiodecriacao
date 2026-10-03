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
const LG_TP_COMPS = [['tp-plain', 'Só o nome'], ['tp-underline', 'Nome com sublinhado'], ['tp-dot', 'Nome com ponto colorido'], ['tp-split', 'Nome em duas cores'], ['tp-initial', 'Inicial em destaque'], ['tp-stack', 'Nome empilhado'], ['tp-boxed', 'Nome em caixa'], ['tp-lines', 'Slogan entre linhas'], ['tp-bar', 'Barra lateral'], ['tp-mix', 'Duas fontes misturadas']];
const lgIsType = sp => String(sp.comp || '').startsWith('tp-');
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
/* regra 60-30-10: 60% cor dominante (fundo/neutra), 30% secundária (símbolo e nome), 10% destaque (detalhes e slogan) */
function lgRuleColors(r) {
  const bg = r.c60, dark = lum(bg) < 0.4, ink = dark ? '#ffffff' : '#111111', main = contrast(r.c30, bg) >= 3 ? r.c30 : ink, acc = contrast(r.c10, bg) >= 2 ? r.c10 : main, text = contrast(r.c30, bg) >= 4.5 ? r.c30 : ink;
  return {bg, main, sec: mixHex(bg, main, 0.55), acc, text, mut: mixHex(bg, text, 0.6)};
}
function lgAutoRule(sp) { const P = sp.pal, C = lgColors(Object.assign({}, sp, {rule: null})); const c60 = C.bg, pick = [P[1], P[2], P[3], P[0], P[4]].filter(c => c !== c60);
  let c30 = pick.find(c => contrast(c, c60) >= 3) || pick[0], c10 = pick.filter(c => c !== c30).sort((a, b) => Math.abs(hexHsl(b)[1] - hexHsl(a)[1]) - 0)[0] || c30; const rest = pick.filter(c => c !== c30 && contrast(c, c60) >= 2); if (rest.length) c10 = rest.sort((a, b) => hexHsl(b)[1] - hexHsl(a)[1])[0];
  return {c60, c30, c10}; }
/* variações de fundo × logo: claro, médio ou escuro (tons tirados da própria paleta) */
const LG_TONES = [['light', 'claro'], ['mid', 'médio'], ['dark', 'escuro']];
function lgToneColors(P) { const mid = [P[1], P[2], P[3]].filter(c => lum(c) > 0.05 && lum(c) < 0.6).sort((a, b) => Math.abs(lum(a) - 0.25) - Math.abs(lum(b) - 0.25))[0] || P[1]; return {light: P[4], mid, dark: P[0]}; }
function lgToneC(P, t) { const T = lgToneColors(P), bg = T[t.bg], logo = T[t.logo], acc = [P[3], P[2], P[1]].find(c => contrast(c, bg) >= 2 && c !== bg) || logo; return {bg, main: logo, sec: mixHex(bg, logo, 0.55), acc, text: logo, mut: mixHex(bg, logo, 0.6)}; }
function lgColors(sp) {
  if (sp.rule && sp.rule.c60) return lgRuleColors(sp.rule);
  if (sp.tone && sp.tone.bg) return lgToneC(sp.pal, sp.tone);
  const [d, m, s, a, l] = sp.pal;
  if (sp.mode === 'dark') return {bg: d, main: contrast(m, d) >= 3 ? m : contrast(s, d) >= 3 ? s : l, sec: contrast(s, d) >= 2 ? s : l, acc: contrast(a, d) >= 2.5 ? a : l, text: l, mut: mixHex(d, l, 0.62)};
  if (sp.mode === 'color') { const fg = readable(m); return {bg: m, main: fg, sec: mixHex(m, fg, 0.55), acc: contrast(a, m) >= 2.2 ? a : fg, text: fg, mut: mixHex(m, fg, 0.7)}; }
  return {bg: l, main: contrast(m, l) >= 3 ? m : d, sec: contrast(s, l) >= 1.8 ? s : m, acc: contrast(a, l) >= 1.8 ? a : m, text: d, mut: mixHex(l, d, 0.55)};
}

/* ---------- construção do logo: devolve um slide pronto (camadas) ---------- */
function lgBuild(sp, o) {
  o = o || {}; const C = lgColors(sp), F = lgFontOf(sp), SY = lgSymDef(sp.sym || 'sparkle', sp), layers = [];
  const nm = F.upper ? String(sp.name || '').toUpperCase() : String(sp.name || ''), tgU = F.tls >= 4, tg = sp.tag ? (tgU ? String(sp.tag).toUpperCase() : String(sp.tag)) : '';
  const N = 110 * (F.scale || 1) * (sp.nameScale || 1), big = ['stack', 'badge', 'frame', 'lines', 'arc', 'ribbon', 'mono', 'overlap'].includes(sp.comp), S = (big ? 190 : sp.comp === 'pill' ? 120 : 160) * (sp.symScale || 1), TS = 30;
  const mw = (txt, fam, wt, size, ls) => { const L = T('t', {content: txt, family: fam, weight: wt, size, ls, w: 99999, lh: 1, upper: false}); const ln = layoutText(L).lines[0]; return ln ? ln.w : 0; };
  const text = (role, txt, fam, wt, size, color, ls, x, y) => { const w = mw(txt, fam, wt, size, ls) + 8; const L = T(role, {content: txt, family: fam, weight: wt, size, color, ls, x, y, w, lh: 1, align: 'left', upper: false, fixUp: false}); layers.push(L); return L; };
  const sym = (x, y, s, on) => { SY.parts.forEach(pt => { const col = on ? (pt.role === 'acc' ? on.acc : pt.role === 'sec' ? on.sec : on.main) : (pt.role === 'acc' ? C.acc : pt.role === 'sec' ? C.sec : C.main);
    layers.push({id: lid(), type: 'path', role: 'logo-symbol', vb: SY.vb || 100, x, y, w: s, h: s, d: pt.d, rule: pt.rule || '', fill: pt.stroke ? '' : col, grad: (sp.grad && !pt.stroke && pt.role === 'main' && !on) ? (C.acc !== col ? C.acc : C.sec) : '', stroke: pt.stroke ? col : '', strokeW: pt.sw || 0, opacity: 1}); }); };
  const rect = (role, o2) => { const L = RC(role, o2); layers.push(L); return L; };
  const nw = mw(nm, F.head, F.hw, N, F.ls), nh = N, tw = tg ? mw(tg, F.tag, F.tw, TS, F.tls) : 0;
  const comp = sp.comp;
  if (String(comp).startsWith('tp-')) {
    const words = nm.split(/\s+/).filter(Boolean), Nt = N * 1.25, nwt = mw(nm, F.head, F.hw, Nt, F.ls), nht = Nt, sp1 = Nt * 0.3, ba = Math.max(5, Nt * 0.07);
    const place = (txt, size, col, x, y, fam, wt, ls) => text('title', txt, fam || F.head, wt || F.hw, size, col, ls == null ? F.ls : ls, x, y);
    const tagAt = (y, w0) => { if (tg) text('body', tg, F.tag, F.tw, TS, C.mut, F.tls, -tw / 2, y); };
    if (comp === 'tp-plain') { place(nm, Nt, C.text, -nwt / 2, 0); tagAt(nht + 10); }
    else if (comp === 'tp-underline') { place(nm, Nt, C.text, -nwt / 2, 0); rect('accent', {x: -nwt / 2, y: nht + 8, w: nwt, h: ba, fill: C.acc, radius: ba / 2}); tagAt(nht + 8 + ba + 14); }
    else if (comp === 'tp-dot') { const dw = mw('.', F.head, F.hw, Nt, 0), tot = nwt + dw; place(nm, Nt, C.text, -tot / 2, 0); place('.', Nt, C.acc, -tot / 2 + nwt, 0, null, null, 0); tagAt(nht + 10); }
    else if (comp === 'tp-split') { const a = words.length > 1 ? words[0] : nm.slice(0, Math.ceil(nm.length / 2)), b = words.length > 1 ? words.slice(1).join(' ') : nm.slice(Math.ceil(nm.length / 2)), wa = mw(a, F.head, F.hw, Nt, F.ls), wb = mw(b, F.head, F.hw, Nt, F.ls), gap = words.length > 1 ? sp1 : 0, tot = wa + gap + wb;
      place(a, Nt, C.main !== C.bg ? C.main : C.text, -tot / 2, 0); place(b, Nt, C.acc, -tot / 2 + wa + gap, 0); tagAt(nht + 10); }
    else if (comp === 'tp-initial') { const ch = nm.slice(0, 1), rest = nm.slice(1), BS = Nt * 1.75, wi = mw(ch, F.head, F.hw, BS, 0), wr = mw(rest, F.head, F.hw, Nt, F.ls), tot = wi + 6 + wr;
      place(ch, BS, C.acc, -tot / 2, 0, null, null, 0); place(rest, Nt, C.text, -tot / 2 + wi + 6, (BS - Nt) * 0.82); tagAt(BS + 10); }
    else if (comp === 'tp-stack') { const ws = words.length > 1 ? words : [nm.slice(0, Math.ceil(nm.length / 2)), nm.slice(Math.ceil(nm.length / 2))], sz = Nt * (ws.length > 2 ? 0.8 : 1); let y = 0; ws.forEach((wd, i) => { const w1 = mw(wd, F.head, F.hw, sz, F.ls); place(wd, sz, i === 1 && ws.length === 2 ? C.acc : C.text, -w1 / 2, y); y += sz * 0.95; }); tagAt(y + 14); }
    else if (comp === 'tp-boxed') { const pd = Nt * 0.32; rect('box', {x: -nwt / 2 - pd, y: 0, w: nwt + 2 * pd, h: nht + 2 * pd, fill: '', stroke: C.main, strokeW: Math.max(4, Nt * 0.05), radius: 0}); place(nm, Nt, C.text, -nwt / 2, pd); tagAt(nht + 2 * pd + 16); }
    else if (comp === 'tp-lines') { place(nm, Nt, C.text, -nwt / 2, 0); if (tg) { const g = 24, ly = nht + 12 + TS * 0.55, lw = Math.max(60, (nwt - tw) / 2 - g); text('body', tg, F.tag, F.tw, TS, C.mut, F.tls, -tw / 2, nht + 12); rect('line', {x: -tw / 2 - g - lw, y: ly, w: lw, h: 3, fill: C.acc}); rect('line', {x: tw / 2 + g, y: ly, w: lw, h: 3, fill: C.acc}); } }
    else if (comp === 'tp-bar') { const bh = nht + (tg ? TS + 16 : 0); rect('bar', {x: -nwt / 2 - 38, y: 4, w: 10, h: bh - 8, fill: C.acc, radius: 5}); place(nm, Nt, C.text, -nwt / 2, 0); if (tg) text('body', tg, F.tag, F.tw, TS, C.mut, F.tls, -nwt / 2, nht + 12); }
    else if (comp === 'tp-mix') { const f2 = sp.hf2 || F.tag, w2 = sp.hw2 || lgDefaultWeight(f2), sc2 = (LG_TF[f2] || {}).scale || 1, N2 = Nt * 0.95 * sc2, a = words[0] || nm, b = words.slice(1).join(' ') || '', wa = mw(a, F.head, F.hw, Nt, F.ls), wb = b ? mw(b, f2, w2, N2, 0) : 0, gap = b ? sp1 : 0, tot = wa + gap + wb;
      place(a, Nt, C.text, -tot / 2, 0); if (b) place(b, N2, C.acc, -tot / 2 + wa + gap, (Nt - N2) * 0.82, f2, w2, 0); tagAt(nht + 10); }
  } else if (comp === 'arc') {
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
  const bw = bb.x1 - bb.x0, bh = bb.y1 - bb.y0, mg = o.tight ? (sp.pad == null ? 1 : sp.pad) * 0.06 * Math.max(bw, bh) : 0;
  let W = o.W || 1200, H = o.H || 800, k;
  if (o.tight) { W = o.W || 1600; k = W / (bw + mg * 2); H = Math.round((bh + mg * 2) * k); } else k = Math.min(W * 0.7 / bw, H * 0.6 / bh, 1.7) ;
  layers.forEach(l => { l.x -= bb.x0; l.y -= bb.y0; });
  const sl = {id: sid(), name: 'Logo', bg: C.bg, noBg: !!o.transparent, layers, isLogo: true, keep: true};
  scaleSlide(sl, k, k);
  const dx = Math.round((W - bw * k) / 2), dy = Math.round((H - bh * k) / 2); sl.layers.forEach(l => { l.x += dx; l.y += dy; });
  return {slide: sl, W, H};
}
/* fonte efetiva: o papel (LG_FONTS) pode ser trocado por qualquer família do catálogo */
function lgFontOf(sp) { const F0 = LG_FONTS[sp.font] || LG_FONTS.geo, F = Object.assign({}, F0); if (sp.hf) { F.head = sp.hf; F.hw = sp.hw || lgDefaultWeight(sp.hf); F.scale = (LG_TF[sp.hf] || {}).scale || 1; } if (sp.tf) { F.tag = sp.tf; F.tw = sp.tw || 400; } if (sp.ls != null) F.ls = sp.ls; if (sp.up != null) F.upper = sp.up; return F; }
async function lgFonts(sp) { const F = lgFontOf(sp); await ensureFonts([F.head, F.tag, sp.hf2].filter(Boolean)); }
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
    const kind = brief.kind || 'symbol', isType = kind === 'type' || (kind === 'both' && rnd() < 0.45);
    if (isType) {   // logo só tipográfico: família do catálogo (favoritas > categorias do estilo), fonte de apoio de par e composição sem símbolo
      const favs = (brief.fontFavs || []).filter(f => LG_TF[f]), cats2 = LG_STYLE_FONTCATS[st.id] || ['sans'], poolF = favs.length ? favs.map(f => LG_TF[f]) : LG_TYPEFACES.filter(f => cats2.includes(f.cat)), tf0 = pick(poolF);
      const ws = lgWeightsOf(tf0.family), hw = ws.length > 1 && rnd() < 0.6 ? pick(ws.filter(w => w >= 600).length ? ws.filter(w => w >= 600) : ws) : lgDefaultWeight(tf0.family), script = tf0.cat === 'script', up = script ? false : (tf0.cat === 'cond' || tf0.cat === 'display') ? rnd() < 0.8 : rnd() < 0.4;
      const comps = script ? ['tp-plain', 'tp-underline', 'tp-dot', 'tp-lines', 'tp-bar'] : ['tp-plain', 'tp-underline', 'tp-dot', 'tp-split', 'tp-initial', 'tp-stack', 'tp-boxed', 'tp-lines', 'tp-bar', 'tp-mix'];
      Object.assign(sp, {sym: 'sparkle', comp: pick(comps), hf: tf0.family, hw, up, ls: up ? pick([2, 6, 10]) : 0, tf: pick(lgPairs(tf0.family, 4)), tw: 400, grad: false});
      if (sp.comp === 'tp-mix') { const sc = LG_TYPEFACES.filter(f => f.cat === 'script'); sp.hf2 = pick(sc).family; sp.hw2 = lgDefaultWeight(sp.hf2); }
    }
    if (brief.rule603010) sp.rule = lgAutoRule(sp);
    sp.palId = pals.find(x => x.c.join() === sp.pal.join()).id;
    const key = [isType ? sp.hf + sp.hw : sp.sym, sp.font, sp.comp, sp.mode, sp.palId].join('|'); if (seen.has(key)) continue; seen.add(key); out.push(sp);
  }
  return out;
}

/* ---------- páginas ---------- */
function dzLogoOpen() { const p = dzP(); if (!p) return; if (lg.pid !== p.id) { lg.pid = p.id; lg.items = []; lg.cur = null; lg.fav = {}; lg.view = 'brief'; lg.step = 0; lgH.stack = []; lgH.i = -1; lgNav.stack = []; lgNav.i = -1; lgNav.last = ''; } const L = lgLab(p); lg.brief = Object.assign(lgBriefDefault(p), L.brief || {}); if (!lg.brief.name) lg.brief.name = p.name || ''; lg.view = lg.items.length && lg.cur ? lg.view : 'brief'; lg.items = lg.items.length ? lg.items : []; dz.view = 'logolab'; go('design'); renderDesign(); }
/* ---------- desfazer/refazer (dados) e voltar/avançar (páginas) ---------- */
const lgH = {stack: [], i: -1}, lgNav = {stack: [], i: -1, restoring: false, last: ''};
const lgSnap = () => JSON.stringify({brief: lg.brief, cur: lg.cur, items: lg.items, fav: lg.fav});
function lgCommit() { if (!lg.brief) return; const sn = lgSnap(); if (lgH.stack[lgH.i] === sn) return; lgH.stack = lgH.stack.slice(0, lgH.i + 1); lgH.stack.push(sn); if (lgH.stack.length > 80) lgH.stack.shift(); lgH.i = lgH.stack.length - 1; }
let lgCommitT = 0; const lgCommitSoon = () => { clearTimeout(lgCommitT); lgCommitT = setTimeout(() => { lgCommit(); lgBarUpdate(); }, 450); };
function lgRestore(i) { const o = JSON.parse(lgH.stack[i]); lgH.i = i; lg.brief = o.brief; lg.cur = o.cur; lg.items = o.items; lg.fav = o.fav || {}; if (lg.view === 'edit' && !lg.cur) lg.view = lg.items.length ? 'grid' : 'brief'; if (lg.view === 'grid' && !lg.items.length) lg.view = 'brief'; renderDesign(); }
function lgUndo() { lgCommit(); if (lgH.i > 0) lgRestore(lgH.i - 1); else toast('Nada para desfazer.'); }
function lgRedo() { if (lgH.i < lgH.stack.length - 1) lgRestore(lgH.i + 1); else toast('Nada para refazer.'); }
function lgBack() { if (lgNav.i <= 0) { toast('Esta é a primeira página.'); return; } lgGoNav(lgNav.i - 1); }
function lgForward() { if (lgNav.i >= lgNav.stack.length - 1) { toast('Não há página para avançar.'); return; } lgGoNav(lgNav.i + 1); }
function lgGoNav(i) { const e = lgNav.stack[i]; lgNav.i = i; lgNav.restoring = true; lg.view = e.view; lg.step = e.step; if ((lg.view === 'edit' || lg.view === 'mock' || lg.view === 'board' || lg.view === 'pres') && !lg.cur) lg.view = lg.items.length ? 'grid' : 'brief'; if (lg.view === 'grid' && !lg.items.length) lg.view = 'brief'; renderDesign(); }
function lgClearSel() {
  const b = lg.brief; if (lg.view === 'grid') lg.fav = {}; else if (lg.view === 'brief') { b.styles = []; b.mood = []; b.palIds = []; b.iconCats = []; b.useBrand = false; } else { toast('Nada selecionado aqui.'); return; }
  renderDesign(); toast('Seleção limpa. Use Desfazer para voltar atrás.');
}
function lgBarHTML() {
  const cu = lgH.i > 0, re = lgH.i < lgH.stack.length - 1, ba = lgNav.i > 0, fo = lgNav.i < lgNav.stack.length - 1, b = (fn, on, t, tip) => `<button class="btn sm" ${on ? '' : 'disabled'} onclick="${fn}" title="${tip}">${t}</button>`;
  return `<span class="lg-bar" id="lgBar">${b('lgBack()', ba, '‹ Voltar', 'Página anterior (Alt+←)')}${b('lgForward()', fo, 'Avançar ›', 'Próxima página (Alt+→)')}<i></i>${b('lgUndo()', cu, '↶ Desfazer', 'Desfazer (Ctrl+Z)')}${b('lgRedo()', re, '↷ Refazer', 'Refazer (Ctrl+Y)')}<i></i>${b('lgClearSel()', true, '⊘ Desmarcar tudo', 'Limpa as seleções desta tela')}</span>`;
}
function lgBarUpdate() { const el = $('lgBar'); if (el) el.outerHTML = lgBarHTML(); }
document.addEventListener('keydown', e => {
  if (typeof dz === 'undefined' || dz.view !== 'logolab' || ui.page !== 'design') return; const tg = e.target.tagName; if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tg)) return; const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
  if (mod && k === 'z') { e.preventDefault(); e.shiftKey ? lgRedo() : lgUndo(); } else if (mod && k === 'y') { e.preventDefault(); lgRedo(); } else if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); lgBack(); } else if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); lgForward(); }
});
function renderLogoLab(p, r) {
  if (!lg.brief) lg.brief = lgBriefDefault(p);
  lgCommit();
  let v = lg.view; if ((v === 'grid' && !lg.items.length) || ((v === 'edit' || v === 'mock' || v === 'board' || v === 'pres') && !lg.cur) || (v === 'fonts' && lgF.mode === 'edit' && !lg.cur)) { v = 'brief'; lg.view = 'brief'; }
  const key = v + '|' + (v === 'brief' ? lg.step || 0 : 0);
  if (!lgNav.restoring && key !== lgNav.last) { lgNav.stack = lgNav.stack.slice(0, lgNav.i + 1); lgNav.stack.push({view: v, step: lg.step || 0}); lgNav.i = lgNav.stack.length - 1; }
  lgNav.last = key; lgNav.restoring = false;
  if (v === 'grid') lgGridPage(p, r); else if (v === 'edit') lgEditPage(p, r); else if (v === 'mock') lgMockPage(p, r); else if (v === 'board') lgBoardPage(p, r); else if (v === 'pres') lgPresPage(p, r); else if (v === 'fonts') lgFontsPage(p, r); else lgBriefPage(p, r);
  const ac = r.querySelector('.page-head .actions'); if (ac) ac.insertAdjacentHTML('afterbegin', lgBarHTML());
}
const lgChip = (on, fn, label) => `<button class="tchip ${on ? 'on' : ''}" onclick="${fn}">${esc(label)}</button>`;
const LG_STEPS = ['Negócio', 'Estilo', 'Texto', 'Cores e ícones'];
function lgBriefPage(p, r) {
  const b = lg.brief, sg = lgSegment(b.seg), bp = lgBrandPalette(p), saved = lgLab(p).saved, st = lg.step || 0, last = st === LG_STEPS.length - 1;
  const head = `<div class="page-head"><div><h1>Laboratório do Logo</h1><p>Responda 4 perguntas curtas. O Studio monta dezenas de logos vetoriais; você escolhe, refina e leva para o Brand Kit.</p></div><div class="actions">${projectSelect()}${saved.length ? `<button class="btn" onclick="lgSavedOpen()">Meus logos (${saved.length})</button>` : ''}<button class="btn" onclick="dzBack()">Estúdio</button></div></div>
  <div class="lg-steps">${LG_STEPS.map((t, i) => `<button class="${i === st ? 'on' : i < st ? 'done' : ''}" onclick="lgStep(${i})"><i>${i + 1}</i>${t}</button>`).join('')}</div>`;
  let body = '';
  if (st === 0) body = `<h2 class="lg-q">Que tipo de negócio você tem?</h2><p class="muted">Isso ajuda a oferecer símbolos e slogans mais certos.</p><div class="tchips lg-big">${LG_SEGMENTS.map(s => lgChip(s.id === b.seg, `lg.brief.seg='${s.id}';lg.brief.tag='';renderDesign()`, s.label)).join('')}</div>
    <h2 class="lg-q" style="margin-top:24px">Que tipo de logo?</h2><div class="tchips lg-big">${[['symbol', 'Símbolo + nome'], ['type', 'Só tipografia'], ['both', 'Os dois']].map(([k, l]) => lgChip((b.kind || 'symbol') === k, `lg.brief.kind='${k}';renderDesign()`, l)).join('')}</div>
    ${(b.kind === 'type' || b.kind === 'both') ? `<p class="muted" style="margin-top:8px">Logos tipográficos usam só letras (com detalhes como sublinhado, ponto colorido ou duas cores). ${(b.fontFavs || []).length ? `<b>${b.fontFavs.length}</b> fonte(s) favorita(s) marcada(s).` : 'As fontes saem das famílias que combinam com o estilo.'} <button class="btn sm" onclick="lgFontsOpen('brief')">Ver prévia das fontes e marcar favoritas</button></p>` : ''}`;
  else if (st === 1) body = `<h2 class="lg-q">Qual estilo você quer para o seu logo?</h2><p class="muted">As fontes, ícones e cores refletem o estilo. Escolha até 4.</p><div class="tchips lg-big">${LG_STYLES.map(s => lgChip(b.styles.includes(s.id), `lgTogStyle('${s.id}')`, s.label)).join('')}</div>`;
  else if (st === 2) body = `<h2 class="lg-q">Que texto você quer no seu logo?</h2><p class="muted">Normalmente é o nome da marca.</p><div class="field" style="max-width:520px"><input id="lgName" value="${esc(b.name)}" placeholder="Ex.: seu nome comercial" oninput="lg.brief.name=this.value" onchange="lgCommit();lgBarUpdate()"></div>
    <h2 class="lg-q" style="margin-top:22px">Qual é o seu lema ou slogan? <small class="muted">(opcional)</small></h2><div class="field" style="max-width:520px"><input id="lgTag" value="${esc(b.tag)}" placeholder="Ex.: ${esc(sg.tag[0])}" oninput="lg.brief.tag=this.value;lg.brief.noTag=false" onchange="lgCommit();lgBarUpdate()"></div>
    <div class="tchips" style="margin-top:6px">${sg.tag.map(t => `<button class="tchip" onclick="lg.brief.tag=this.textContent;lg.brief.noTag=false;$('lgTag').value=lg.brief.tag">${esc(t)}</button>`).join('')}${lgChip(b.noTag, 'lg.brief.noTag=!lg.brief.noTag;renderDesign()', 'Sem slogan')}${aiReady() ? '<button class="tchip" onclick="lgTagAI()">✦ Sugestões com IA</button>' : ''}</div><div class="tchips" id="lgTagAI" style="margin-top:6px"></div><small class="muted block" style="margin-top:6px">Sugestões de slogan podem ser imprecisas. Confira antes de usar.</small>`;
  else body = `<h2 class="lg-q">Cores e ícones</h2>${bp ? `<label class="check"><input type="checkbox" ${b.useBrand ? 'checked' : ''} onchange="lg.brief.useBrand=this.checked;renderDesign()"> Incluir as cores do Brand Kit <span class="bk-chips" style="display:inline-flex;vertical-align:middle;margin-left:6px">${bp.c.map(c => `<i class="bk-chip" style="background:${c};width:14px;height:14px"></i>`).join('')}</span></label>` : '<small class="muted block">Quando houver um Brand Kit, as cores dele aparecem aqui como opção.</small>'}
    <div class="okr-label" style="margin-top:10px">CLIMA <small class="muted">(vazio = segue o estilo)</small></div><div class="tchips">${LG_MOODS.map(m => lgChip(b.mood.includes(m), `lgTogMood('${m}')`, m)).join('')}</div>
    <div class="okr-label" style="margin-top:10px">PALETAS ESPECÍFICAS <small class="muted">(${b.palIds.length} marcada(s))</small></div><div class="lg-pals">${LG_PALETTES.map(x => `<button class="lg-pal ${b.palIds.includes(x.id) ? 'on' : ''}" title="${esc(x.name)}" onclick="lgTogPal('${x.id}')">${x.c.map(c => `<i style="background:${c}"></i>`).join('')}<span>${esc(x.name)}</span></button>`).join('')}</div>
    <label class="check" style="margin-top:12px"><input type="checkbox" ${b.rule603010 ? 'checked' : ''} onchange="lg.brief.rule603010=this.checked;renderDesign()"> Aplicar a estrutura de cores <b>60-30-10</b> nos logos (60% fundo, 30% símbolo e nome, 10% destaque)</label>
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
  r.innerHTML = `<div class="page-head"><div><h1>${esc(lg.brief.name)} · ${lg.items.length} logos</h1><p>Marque os favoritos com ★ e clique em Editar para ajustar símbolo, fonte, cores e composição.</p></div><div class="actions">${projectSelect()}<button class="btn" onclick="lg.view='brief';lg.step=0;renderDesign()">Ajustar briefing</button><button class="btn" onclick="lgIconModal()" title="Troca o símbolo de todos os logos de uma vez, mantendo fonte, composição e cores">Ver outros ícones</button>${lg.items.some(i => i.orig) ? '<button class="btn" onclick="lgRevertIcons()">Reverter ícones</button>' : ''}<button class="btn" onclick="lg.items.forEach(i=>lg.fav[i.id]=true);renderDesign()">★ Marcar todos</button><button class="btn" onclick="lgRun(true)">＋ Gerar mais</button></div></div>
  <div class="vf-bar"><div class="matrix-tabs">${[['all', 'Todos (' + lg.items.length + ')'], ['fav', '★ Favoritos (' + nf + ')']].map(([k, l]) => `<button class="${lg.filter === k ? 'active' : ''}" onclick="lg.filter='${k}';renderDesign()">${l}</button>`).join('')}</div></div>
  <div class="vf-grid lg-grid">${view.map(it => it.kind === 'ai' ? `<article class="vf-card"><canvas data-ai="${it.imgId}" width="300" height="300"></canvas><div class="vf-meta"><b>Conceito com IA</b><small>${esc(it.note || '')}</small></div><div class="row-gap"><button class="btn sm" onclick="lgAISave('${it.id}')">Salvar no Brand Kit</button></div></article>`
    : `<article class="vf-card"><canvas data-lg="${it.id}" width="300" height="200"></canvas><div class="vf-meta"><b>${it.hf ? esc(it.hf) : esc((LG_FONTS[it.font] || {}).label || '')} · ${esc(((LG_TP_COMPS.concat(LG_COMPS)).find(c => c[0] === it.comp) || [0, it.comp])[1])}</b><small>${lgIsType(it) ? 'só tipografia' : esc(lgSymDef(it.sym, it).label || '')} · ${esc(it.mode === 'color' ? 'cor cheia' : it.mode === 'dark' ? 'escuro' : 'claro')}</small></div><div class="row-gap"><button class="btn sm ${lg.fav[it.id] ? 'dark' : ''}" onclick="lg.fav['${it.id}']=!lg.fav['${it.id}'];renderDesign()">★</button><button class="btn sm dark" onclick="lgEdit('${it.id}')">Editar</button></div></article>`).join('')}</div>`;
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
/* blocos recolhíveis do editor: o estado (aberto/fechado) fica em lg.acc e sobrevive aos redesenhos */
lg.acc = {nome: true, tipo: true, simbolo: false, comp: false, tons: false, regra: false, paleta: false};
function lgAcc(id, title, sum, body) { return `<section class="lg-acc ${lg.acc[id] ? 'open' : ''}" id="acc-${id}"><button class="lg-acc-h" onclick="lgAccToggle('${id}')"><span>${title}</span><small>${sum || ''}</small><i>▸</i></button><div class="lg-acc-b">${body}</div></section>`; }
function lgAccToggle(id) { lg.acc[id] = !lg.acc[id]; const el = $('acc-' + id); if (el) el.classList.toggle('open', lg.acc[id]); if (lg.acc[id]) { if (id === 'tons') lgTonePaint(); else if (id === 'regra') lgMeterSoon(); else if (id === 'simbolo') lgSymCanvases(); } }
function lgAccAll(on) { Object.keys(lg.acc).forEach(k => { lg.acc[k] = on; }); renderDesign(); }
function lgEditPage(p, r) {
  const s = lg.cur, pal = LG_PALETTES.concat(lgBrandPalette(p) || []);
  const pickS = lgSymPicker();
  r.innerHTML = `<div class="page-head"><div><h1>Editar logo</h1><p>Mexa em qualquer parte; a prévia atualiza na hora.</p></div><div class="actions">${projectSelect()}<button class="btn" onclick="lg.view=lg.items.length?'grid':'brief';renderDesign()">← Voltar</button></div></div>
  <div class="two dz-compose lg-edit"><div class="panel lg-prev"><canvas id="lgBig" width="720" height="480" style="width:100%;max-width:720px;border:1px solid #e6e6e6;border-radius:12px"></canvas>
    <div class="row-gap" style="margin-top:12px">${['light', 'dark', 'color'].map(m => `<button class="btn sm ${s.mode === m ? 'dark' : ''}" onclick="lgSet('mode','${m}')">${{light: 'Fundo claro', dark: 'Fundo escuro', color: 'Fundo colorido'}[m]}</button>`).join('')}</div>
    <div class="row-gap" style="margin-top:12px"><button class="btn dark" onclick="lgSaveKit()">Salvar no Brand Kit</button><button class="btn" onclick="lgDownload('png')">PNG transparente</button><button class="btn" onclick="lgDownload('svg')">SVG</button><button class="btn" onclick="lgToEditor()">Abrir no Editor</button><button class="btn dark" onclick="lgPresOpen()">Vitrine (logo aplicado)</button><button class="btn" onclick="lgMockOpen()">Ver em mockups</button><button class="btn" onclick="lgBoardOpen()">Prancha de marca</button><button class="btn" onclick="lgPackageDown()">Pacote ZIP</button><button class="btn" onclick="lgSaveLab()">Guardar em Meus logos</button></div>
    <small class="muted block" style="margin-top:6px">No SVG o texto sai como texto (a fonte precisa estar instalada onde for aberto). O PNG sai com a fonte já aplicada.</small></div>
  <div class="panel lg-opts"><div class="row-gap" style="margin-bottom:8px;justify-content:flex-end"><button class="btn sm" onclick="lgAccAll(true)">Expandir tudo</button><button class="btn sm" onclick="lgAccAll(false)">Recolher tudo</button></div>
  ${lgAcc('nome', 'Nome e slogan', esc(s.name), `<div class="field"><label>Nome</label><input value="${esc(s.name)}" oninput="lgSet('name',this.value,1)"></div><div class="field"><label>Slogan</label><input value="${esc(s.tag)}" oninput="lgSet('tag',this.value,1)"></div>`)}
  ${lgAcc('tipo', 'Tipo de logo e fonte', esc(lgFontOf(s).head) + ' · ' + lgFontOf(s).hw, `
    <div class="okr-label">TIPO DE LOGO</div><div class="row-gap" style="margin:4px 0 10px"><button class="btn sm ${lgIsType(s) ? '' : 'dark'}" onclick="lgSetKind('symbol')">Símbolo + nome</button><button class="btn sm ${lgIsType(s) ? 'dark' : ''}" onclick="lgSetKind('type')">Só tipografia</button></div>
    <div class="lg-fontbox"><div><b style="font-size:15px;font-family:'${esc(lgFontOf(s).head)}',system-ui">${esc(lgFontOf(s).head)}</b> <small class="muted">${esc(LG_WEIGHT_NAMES[lgFontOf(s).hw] || lgFontOf(s).hw)} ${lgFontOf(s).hw} · apoio: ${esc(lgFontOf(s).tag)}</small></div><button class="btn sm dark" onclick="lgFontsOpen('edit')">Escolher fonte (prévia das famílias)</button></div>
  `)}
  ${lgAcc('simbolo', lgIsType(s) ? 'Tipografia' : 'Símbolo', lgIsType(s) ? 'só letras' : esc(lgSymDef(s.sym, s).label || ''), `${lgIsType(s) ? lgTypeOpts(s) : '<div class="okr-label">SÍMBOLO</div>' + pickS}`)}
  ${lgAcc('comp', 'Composição e tamanhos', esc(((lgIsType(s) ? LG_TP_COMPS : LG_COMPS).find(c => c[0] === s.comp) || [0, s.comp])[1]), `
    <div class="ins-row"><label class="ins">Conjunto de fontes<select onchange="lgSetRole(this.value)">${Object.entries(LG_FONTS).map(([k, f]) => `<option value="${k}" ${s.font === k ? 'selected' : ''}>${esc(f.label)} · ${esc(f.head)}</option>`).join('')}</select></label>
    <label class="ins">Composição<select onchange="lgSet('comp',this.value)">${(lgIsType(s) ? LG_TP_COMPS : LG_COMPS).map(([k, l]) => `<option value="${k}" ${s.comp === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
    <div class="ins-row"><label class="ins">Símbolo <b>${Math.round(s.symScale * 100)}%</b><input type="range" min="50" max="180" value="${Math.round(s.symScale * 100)}" oninput="lgSet('symScale',this.value/100,1);this.previousElementSibling.textContent=this.value+'%'"></label>${String(s.sym).startsWith('ic:') && !lgIsFillIcon(lgIcon(s.sym.slice(3)) || []) ? `<label class="ins">Traço do ícone <b>${s.icw || 2}</b><input type="range" min="1" max="3.5" step="0.1" value="${s.icw || 2}" oninput="lgSet('icw',+this.value,1);this.previousElementSibling.textContent=this.value"></label>` : ''}<label class="ins">Nome <b>${Math.round(s.nameScale * 100)}%</b><input type="range" min="60" max="160" value="${Math.round(s.nameScale * 100)}" oninput="lgSet('nameScale',this.value/100,1);this.previousElementSibling.textContent=this.value+'%'"></label></div>
    <label class="check" style="margin:4px 0 10px"><input type="checkbox" ${s.grad ? 'checked' : ''} onchange="lgSet('grad',this.checked)"> Degradê no símbolo</label>
  `)}
  ${lgAcc('tons', 'Variações de fundo e logo', s.tone ? 'fundo ' + LG_TONES.find(t => t[0] === s.tone.bg)[1] + ' · logo ' + LG_TONES.find(t => t[0] === s.tone.logo)[1] : '6 combinações', lgToneHTML(s))}
  ${lgAcc('regra', 'Estrutura de cores 60-30-10', s.rule ? 'ativa' : 'desligada', lgRuleHTML(s))}
  ${lgAcc('paleta', 'Paleta e cores', esc((pal.find(x => x.c.join() === s.pal.join()) || {name: 'personalizada'}).name), `
    <div class="okr-label">PALETA</div><div class="lg-pals">${pal.map(x => `<button class="lg-pal ${s.pal.join() === x.c.join() ? 'on' : ''}" title="${esc(x.name)}" onclick="lgSetPal('${x.id}')">${x.c.map(c => `<i style="background:${c}"></i>`).join('')}<span>${esc(x.name)}</span></button>`).join('')}</div>
    <div class="okr-label" style="margin-top:8px">AJUSTE FINO DAS 5 CORES <small class="muted">escura · principal · apoio · destaque · clara</small></div><div class="bk-chips">${s.pal.map((c, i) => `<input type="color" value="${c}" oninput="lgSetColor(${i},this.value)" style="width:42px;height:34px;padding:0;border:1px solid #ddd;border-radius:8px">`).join('')}</div>
  `)}
  </div></div>`;
  lgDrawBig(); if (lg.acc.simbolo) lgSymCanvases(); if (lg.acc.regra) lgMeterSoon(); if (lg.acc.tons) lgTonePaint();
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
function lgToneHTML(s) {
  const cur = s.tone || null, rows = LG_TONES.flatMap(([bg, bl]) => LG_TONES.filter(([lo]) => lo !== bg).map(([lo, ll]) => ({bg, lo, bl, ll})));
  return `<div class="lg-rule"><div class="okr-label">VARIAÇÕES DE FUNDO E LOGO</div><small class="muted block">Claro, médio ou escuro, com os tons da sua paleta. Clique para aplicar.</small>
  <div class="lg-tones">${rows.map(r => { const on = cur && cur.bg === r.bg && cur.logo === r.lo; return `<button class="lg-tone ${on ? 'on' : ''}" onclick="lgToneSet('${r.bg}','${r.lo}')" title="Fundo ${r.bl}, logo ${r.ll}"><canvas data-tone="${r.bg}:${r.lo}" width="180" height="120"></canvas><span>Fundo ${r.bl} · logo ${r.ll}</span></button>`; }).join('')}</div>
  ${cur ? '<div class="row-gap" style="margin-top:6px"><button class="btn sm" onclick="lgToneSet(null)">Voltar às cores originais</button></div>' : ''}</div>`;
}
function lgToneSet(bg, lo) { lg.cur.tone = bg ? {bg, logo: lo} : null; if (bg) { lg.cur.rule = null; lg.cur.pad = 1; } renderDesign(); }
async function lgTonePaint() { for (const cv of [...document.querySelectorAll('canvas[data-tone]')]) { if (!cv.isConnected || !lg.cur) return; const [bg, lo] = cv.dataset.tone.split(':'); try { await lgPaint(cv, Object.assign({}, lg.cur, {tone: {bg, logo: lo}, rule: null})); } catch (e) { /* vazio */ } } }
/* mede quanto da peça cada cor ocupa (fundo, 30, 10) em uma versão pequena */
async function lgMeasure(sp) {
  await lgFonts(sp); const C = lgColors(sp), r = lgBuild(sp, {tight: true, W: 420}), cv = document.createElement('canvas'); cv.width = r.W; cv.height = r.H; renderSlide(cv.getContext('2d'), r.slide, r.W, r.H, 1);
  const d = cv.getContext('2d').getImageData(0, 0, r.W, r.H).data, rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const col = {c60: C.bg, c30: sp.rule ? sp.rule.c30 : C.main, c10: sp.rule ? sp.rule.c10 : C.acc}, cl = [['c60', rgb(col.c60)], ['c30', rgb(col.c30)], ['c10', rgb(col.c10)]], n = {c60: 0, c30: 0, c10: 0}; let tot = 0;
  for (let i = 0; i < d.length; i += 4) { let best = 'c60', bd = 1e9; for (const [k, c] of cl) { const dd = (d[i] - c[0]) ** 2 + (d[i + 1] - c[1]) ** 2 + (d[i + 2] - c[2]) ** 2; if (dd < bd) { bd = dd; best = k; } } n[best]++; tot++; }
  return {c60: n.c60 / tot * 100, c30: n.c30 / tot * 100, c10: n.c10 / tot * 100, colors: col};
}
async function lgFit60(sp) {   // acha o respiro do quadro para o fundo ficar perto de 60%
  let lo = 0, hi = 4, best = sp.pad == null ? 1 : sp.pad; for (let i = 0; i < 9; i++) { const mid = (lo + hi) / 2, m = await lgMeasure(Object.assign({}, sp, {pad: mid})); best = mid; if (m.c60 > 60) hi = mid; else lo = mid; } return Math.round(best * 100) / 100;
}
/* testa composições, tamanhos e respiro e fica com a combinação mais próxima de 60-30-10 */
async function lgBalance(sp) {
  const base = sp.rule && sp.rule.c60 ? sp : Object.assign({}, sp, {rule: lgAutoRule(sp)}), comps = [...new Set([sp.comp, 'pill', 'badge', 'ribbon', 'mono', 'frame', 'stack', 'horizontal'])]; let best = null;
  const score = m => Math.abs(m.c60 - 60) + 0.7 * Math.abs(m.c30 - 30) + 0.5 * Math.abs(m.c10 - 10);
  for (const comp of comps) for (const sy of [1, 1.35, 1.7]) for (const nm of [1, 1.25]) for (const pad of [0, 0.5, 1]) { const t = Object.assign({}, base, {comp, symScale: sy, nameScale: nm, pad}), m = await lgMeasure(t), sc = score(m) + (comp === sp.comp ? 0 : 1.5); if (!best || sc < best.sc) best = {sc, t, m}; }
  return best;
}
async function lgRuleBalance() { toast('Procurando o melhor equilíbrio…'); const b = await lgBalance(lg.cur); Object.assign(lg.cur, {rule: b.t.rule, comp: b.t.comp, symScale: b.t.symScale, nameScale: b.t.nameScale, pad: b.t.pad, tone: null}); renderDesign(); toast(`Equilibrado: ${b.m.c60.toFixed(0)}% / ${b.m.c30.toFixed(0)}% / ${b.m.c10.toFixed(0)}%.`); }
function lgRuleHTML(s) {
  const r = s.rule, on = !!(r && r.c60), brand = brandOf(dzP()), hasKit = isHex(brand.pal.c60) && isHex(brand.pal.c30) && isHex(brand.pal.c10);
  const sw = (key) => s.pal.map((c, i) => `<button class="bk-chip" style="background:${c}" title="${c}" onclick="lgRuleSet('${key}','${c}')"></button>`).join('');
  return `<div class="lg-rule"><div class="okr-label">ESTRUTURA DE CORES 60 · 30 · 10</div>
  <small class="muted block">A regra 60-30-10 equilibra a peça: <b>60%</b> cor dominante (fundo, neutra), <b>30%</b> cor secundária (símbolo e nome) e <b>10%</b> destaque (detalhes e slogan).</small>
  <div class="row-gap" style="margin:8px 0"><button class="btn sm ${on ? 'dark' : ''}" onclick="lgRuleAuto()">Aplicar 60-30-10 automático</button>${hasKit ? '<button class="btn sm" onclick="lgRuleKit()" title="Usa a paleta 60/30/10 do Brand Kit">Usar o Brand Kit</button>' : ''}${on ? '<button class="btn sm" onclick="lgRuleOff()">Remover regra</button>' : ''}</div>
  ${on ? `<div class="lg-rule-rows">${[['c60', '60% · Dominante (fundo)'], ['c30', '30% · Secundária (símbolo e nome)'], ['c10', '10% · Destaque (detalhes)']].map(([k, l]) => `<div class="lg-rule-row"><input type="color" value="${r[k]}" oninput="lgRuleSet('${k}',this.value,1)"><span>${l}</span><div class="bk-chips">${sw(k)}</div></div>`).join('')}</div>
  <div class="lg-meter" id="lgMeter"><small class="muted">Medindo…</small></div>` : ''}</div>`;
}
function lgRuleSet(k, v, live) { if (!lg.cur.rule) lg.cur.rule = lgAutoRule(lg.cur); lg.cur.rule[k] = v; if (live) { lgDrawBig(); lgCommitSoon(); lgMeterSoon(); } else renderDesign(); }
function lgRuleAuto() { lg.cur.tone = null; lg.cur.rule = lgAutoRule(lg.cur); renderDesign(); }
function lgRuleKit() { const b = brandOf(dzP()); lg.cur.tone = null; lg.cur.rule = {c60: b.pal.c60, c30: b.pal.c30, c10: b.pal.c10}; renderDesign(); }
function lgRuleOff() { lg.cur.rule = null; lg.cur.pad = 1; renderDesign(); }
async function lgRuleFit() { lg.cur.pad = await lgFit60(lg.cur); renderDesign(); }
let lgMeterT = 0; const lgMeterSoon = () => { clearTimeout(lgMeterT); lgMeterT = setTimeout(lgMeterDraw, 250); };
async function lgMeterDraw() {
  const el = $('lgMeter'); if (!el || !lg.cur || !(lg.cur.rule && lg.cur.rule.c60)) return; const m = await lgMeasure(lg.cur), tgt = {c60: 60, c30: 30, c10: 10}, nm = {c60: 'Dominante', c30: 'Secundária', c10: 'Destaque'};
  const ok = k => Math.abs(m[k] - tgt[k]) <= (k === 'c60' ? 10 : k === 'c30' ? 8 : 5), tips = [];
  if (m.c60 > 70) tips.push('Fundo grande demais: o logo tem pouca tinta. Aumente símbolo e nome ou use uma composição com placa (pílula, selo, emblema), ou clique em Equilibrar.'); else if (m.c60 < 50) tips.push('Pouco respiro: aumente a margem do quadro.');
  if (m.c30 < 22 && m.c60 <= 70) tips.push('Pouca cor secundária: aumente o símbolo ou o nome.'); if (m.c10 > 15) tips.push('Destaque forte demais: use-o só em detalhes.'); if (m.c10 < 2) tips.push('Quase sem destaque: use a cor de 10% em um detalhe ou no slogan.');
  el.innerHTML = `<div class="lg-stack">${['c60', 'c30', 'c10'].map(k => `<i style="width:${Math.max(1, m[k])}%;background:${m.colors[k]}" title="${nm[k]} ${m[k].toFixed(0)}%"></i>`).join('')}</div><div class="lg-stack lg-ideal">${['c60', 'c30', 'c10'].map(k => `<i style="width:${tgt[k]}%;background:${m.colors[k]};opacity:.45"></i>`).join('')}</div>
  <div class="lg-meter-rows">${['c60', 'c30', 'c10'].map(k => `<span class="${ok(k) ? 'ok' : 'off'}"><b>${m[k].toFixed(0)}%</b> ${nm[k]} <small>(ideal ${tgt[k]}%)</small></span>`).join('')}</div>
  <small class="muted block">Medido no quadro do logo (barra de cima) · ideal (barra de baixo). ${tips.length ? tips.join(' ') : 'Estrutura equilibrada.'}</small><div class="row-gap" style="margin-top:6px"><button class="btn sm dark" onclick="lgRuleBalance()" title="Testa composição, tamanho do símbolo e do nome e respiro">Equilibrar automaticamente</button><button class="btn sm" onclick="lgRuleFit()">Ajustar só o respiro</button></div><label class="ins">Respiro do quadro <b>${(lg.cur.pad == null ? 1 : lg.cur.pad).toFixed(2)}×</b><input type="range" min="0" max="4" step="0.05" value="${lg.cur.pad == null ? 1 : lg.cur.pad}" oninput="lgSet('pad',+this.value,1);this.previousElementSibling.textContent=(+this.value).toFixed(2)+'×';lgMeterSoon()"></label>`;
}
let lgBigT = 0;
function lgDrawBig() { clearTimeout(lgBigT); lgBigT = setTimeout(async () => { const cv = $('lgBig'); if (cv && lg.cur) { cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); await lgPaint(cv, lg.cur); } }, 30); }
function lgSet(k, v, live) { lg.cur[k] = v; if (live) { lgDrawBig(); lgCommitSoon(); } else renderDesign(); }
function lgSetPal(id) { const x = LG_PALETTES.concat(lgBrandPalette(dzP()) || []).find(y => y.id === id); if (x) { lg.cur.pal = x.c.slice(); lg.cur.palId = id; renderDesign(); } }
function lgSetColor(i, v) { lg.cur.pal[i] = v; lg.cur.palId = ''; lgDrawBig(); lgCommitSoon(); }

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
