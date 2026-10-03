/* ===== Laboratório do Logo: briefing → opções → edição → Brand Kit / exportação =====
   Os logos são vetoriais (camadas de caminho, forma e texto do motor de design), então abrem no Editor e viram qualquer tamanho. */
const lg = {view: 'brief', brief: null, items: [], fav: {}, cur: null, filter: 'all', seed: 0, busy: 0};
const lgRng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
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
  o = o || {}; const C = lgColors(sp), F = LG_FONTS[sp.font] || LG_FONTS.geo, SY = LG_SYMBOLS[sp.sym], layers = [];
  const nm = F.upper ? String(sp.name || '').toUpperCase() : String(sp.name || ''), tgU = F.tls >= 4, tg = sp.tag ? (tgU ? String(sp.tag).toUpperCase() : String(sp.tag)) : '';
  const N = 110 * (F.scale || 1) * (sp.nameScale || 1), big = ['stack', 'badge', 'frame', 'lines'].includes(sp.comp), S = (big ? 190 : sp.comp === 'pill' ? 120 : 160) * (sp.symScale || 1), TS = 30;
  const mw = (txt, fam, wt, size, ls) => { const L = T('t', {content: txt, family: fam, weight: wt, size, ls, w: 99999, lh: 1, upper: false}); const ln = layoutText(L).lines[0]; return ln ? ln.w : 0; };
  const text = (role, txt, fam, wt, size, color, ls, x, y) => { const w = mw(txt, fam, wt, size, ls) + 8; const L = T(role, {content: txt, family: fam, weight: wt, size, color, ls, x, y, w, lh: 1, align: 'left', upper: false, fixUp: false}); layers.push(L); return L; };
  const sym = (x, y, s, on) => { SY.parts.forEach(pt => { const col = on ? (pt.role === 'acc' ? on.acc : pt.role === 'sec' ? on.sec : on.main) : (pt.role === 'acc' ? C.acc : pt.role === 'sec' ? C.sec : C.main);
    layers.push({id: lid(), type: 'path', role: 'logo-symbol', x, y, w: s, h: s, d: pt.d, rule: pt.rule || '', fill: pt.stroke ? '' : col, stroke: pt.stroke ? col : '', strokeW: pt.sw || 0, opacity: 1}); }); };
  const rect = (role, o2) => { const L = RC(role, o2); layers.push(L); return L; };
  const nw = mw(nm, F.head, F.hw, N, F.ls), nh = N, tw = tg ? mw(tg, F.tag, F.tw, TS, F.tls) : 0;
  const comp = sp.comp;
  if (comp === 'stack' || comp === 'wordmark' || comp === 'badge' || comp === 'lines' || comp === 'frame') {
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
  const out = [], seen = new Set();
  for (let g = 0; g < n * 8 && out.length < n; g++) {
    const st = sts[out.length % sts.length], symPool = rnd() < 0.6 ? seg.sym.concat(st.sym) : st.sym.concat(seg.sym), sym = pick(symPool.filter(x => LG_SYMBOLS[x]));
    const sp = {id: uid('lg'), name: brief.name, tag: brief.noTag ? '' : brief.tag, sym, style: st.id, font: pick(st.fonts), comp: pick(st.comps), mode: pick(st.modes), pal: (pick(pals)).c.slice(), palId: '', symScale: 1, nameScale: 1};
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
  lgBriefPage(p, r);
}
const lgChip = (on, fn, label) => `<button class="tchip ${on ? 'on' : ''}" onclick="${fn}">${esc(label)}</button>`;
function lgBriefPage(p, r) {
  const b = lg.brief, sg = lgSegment(b.seg), bp = lgBrandPalette(p), saved = lgLab(p).saved;
  r.innerHTML = `<div class="page-head"><div><h1>Laboratório do Logo</h1><p>Conte o básico, escolha o estilo e as cores. O Studio monta dezenas de logos vetoriais; você refina, salva no Brand Kit e usa nas peças.</p></div><div class="actions">${projectSelect()}${saved.length ? `<button class="btn" onclick="lgSavedOpen()">Meus logos (${saved.length})</button>` : ''}<button class="btn" onclick="dzBack()">Estúdio</button></div></div>
  <div class="two dz-compose"><div class="panel"><h3>1. Sua marca</h3>
    <div class="field"><label>Nome da marca</label><input id="lgName" value="${esc(b.name)}" oninput="lg.brief.name=this.value"></div>
    <div class="field"><label>Segmento</label><select onchange="lg.brief.seg=this.value;lg.brief.tag='';renderDesign()">${LG_SEGMENTS.map(s => `<option value="${s.id}" ${s.id === b.seg ? 'selected' : ''}>${esc(s.label)}</option>`).join('')}</select></div>
    <div class="field"><label>Slogan <small class="muted">(opcional)</small></label><input id="lgTag" value="${esc(b.tag)}" placeholder="Ex.: ${esc(sg.tag[0])}" oninput="lg.brief.tag=this.value;lg.brief.noTag=false"><div class="tchips" style="margin-top:6px">${sg.tag.map(t => `<button class="tchip" onclick="lg.brief.tag=${esc(JSON.stringify(t)).replace(/"/g, '&quot;')};lg.brief.noTag=false;$('lgTag').value=lg.brief.tag">${esc(t)}</button>`).join('')}${lgChip(b.noTag, 'lg.brief.noTag=!lg.brief.noTag;renderDesign()', 'Sem slogan')}</div></div>
    <h3 style="margin-top:14px">2. Estilo <small class="muted">escolha até 4</small></h3><div class="tchips">${LG_STYLES.map(s => lgChip(b.styles.includes(s.id), `lgTogStyle('${s.id}')`, s.label)).join('')}</div></div>
  <div class="panel"><h3>3. Cores</h3>
    ${bp ? `<label class="check"><input type="checkbox" ${b.useBrand ? 'checked' : ''} onchange="lg.brief.useBrand=this.checked;renderDesign()"> Incluir as cores do Brand Kit <span class="bk-chips" style="display:inline-flex;vertical-align:middle;margin-left:6px">${bp.c.map(c => `<i class="bk-chip" style="background:${c};width:14px;height:14px"></i>`).join('')}</span></label>` : '<small class="muted block">Quando houver um Brand Kit, as cores dele aparecem aqui como opção.</small>'}
    <div class="okr-label" style="margin-top:10px">CLIMA <small class="muted">(deixe vazio para seguir o estilo)</small></div><div class="tchips">${LG_MOODS.map(m => lgChip(b.mood.includes(m), `lgTogMood('${m}')`, m)).join('')}</div>
    <div class="okr-label" style="margin-top:10px">PALETAS ESPECÍFICAS <small class="muted">(${b.palIds.length} marcada(s))</small></div><div class="lg-pals">${LG_PALETTES.map(x => `<button class="lg-pal ${b.palIds.includes(x.id) ? 'on' : ''}" title="${esc(x.name)}" onclick="lgTogPal('${x.id}')">${x.c.map(c => `<i style="background:${c}"></i>`).join('')}<span>${esc(x.name)}</span></button>`).join('')}</div>
    <div class="row-gap" style="margin-top:16px"><label class="ins" style="margin:0">Quantidade <b>${b.n}</b><input type="range" min="12" max="60" step="6" value="${b.n}" oninput="lg.brief.n=+this.value;this.previousElementSibling.textContent=this.value"></label><button class="btn dark" onclick="lgRun()">Gerar logos</button></div>
    ${imageReady() ? `<div class="row-gap" style="margin-top:8px"><button class="btn sm" onclick="lgAIRun()" title="Gera conceitos de logo com IA de imagem (o texto da IA pode vir com erros)">✦ Conceitos com IA</button></div>` : ''}</div></div>`;
}
function lgTogStyle(id) { const a = lg.brief.styles; const i = a.indexOf(id); if (i >= 0) a.splice(i, 1); else { if (a.length >= 4) a.shift(); a.push(id); } renderDesign(); }
function lgTogMood(m) { tog(lg.brief.mood, m); renderDesign(); }
function lgTogPal(id) { tog(lg.brief.palIds, id); renderDesign(); }
async function lgRun(more) {
  const p = dzP(), b = lg.brief; b.name = ($('lgName') ? $('lgName').value : b.name).trim(); if (!b.name) { toast('Escreva o nome da marca.'); return; }
  if (!b.styles.length) { toast('Escolha ao menos um estilo.'); return; }
  lgLab(p).brief = JSON.parse(JSON.stringify(b)); persist(); lg.seed = more ? lg.seed + 1 : Date.now() % 100000;
  const gen = lgGenerate(p, b, b.n, lg.seed); if (!gen.length) { toast('Não consegui montar opções com essas escolhas.'); return; }
  lg.items = more ? lg.items.concat(gen) : gen; lg.view = 'grid'; lg.filter = 'all'; renderDesign();
}
function lgGridPage(p, r) {
  const view = lg.items.filter(i => lg.filter === 'fav' ? lg.fav[i.id] : true), nf = lg.items.filter(i => lg.fav[i.id]).length;
  r.innerHTML = `<div class="page-head"><div><h1>${esc(lg.brief.name)} · ${lg.items.length} logos</h1><p>Marque os favoritos com ★ e clique em Editar para ajustar símbolo, fonte, cores e composição.</p></div><div class="actions">${projectSelect()}<button class="btn" onclick="lg.view='brief';renderDesign()">Ajustar briefing</button><button class="btn" onclick="lgRun(true)">＋ Gerar mais</button></div></div>
  <div class="vf-bar"><div class="matrix-tabs">${[['all', 'Todos (' + lg.items.length + ')'], ['fav', '★ Favoritos (' + nf + ')']].map(([k, l]) => `<button class="${lg.filter === k ? 'active' : ''}" onclick="lg.filter='${k}';renderDesign()">${l}</button>`).join('')}</div></div>
  <div class="vf-grid lg-grid">${view.map(it => it.kind === 'ai' ? `<article class="vf-card"><canvas data-ai="${it.imgId}" width="300" height="300"></canvas><div class="vf-meta"><b>Conceito com IA</b><small>${esc(it.note || '')}</small></div><div class="row-gap"><button class="btn sm" onclick="lgAISave('${it.id}')">Salvar no Brand Kit</button></div></article>`
    : `<article class="vf-card"><canvas data-lg="${it.id}" width="300" height="200"></canvas><div class="vf-meta"><b>${esc((LG_FONTS[it.font] || {}).label || '')} · ${esc(it.comp)}</b><small>${esc((LG_SYMBOLS[it.sym] || {}).label || '')} · ${esc(it.mode === 'color' ? 'cor cheia' : it.mode === 'dark' ? 'escuro' : 'claro')}</small></div><div class="row-gap"><button class="btn sm ${lg.fav[it.id] ? 'dark' : ''}" onclick="lg.fav['${it.id}']=!lg.fav['${it.id}'];renderDesign()">★</button><button class="btn sm dark" onclick="lgEdit('${it.id}')">Editar</button></div></article>`).join('')}</div>`;
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
  const pickS = LG_SYMBOL_IDS.map(id => `<button class="lg-sym ${s.sym === id ? 'on' : ''}" title="${esc(LG_SYMBOLS[id].label)}" onclick="lgSet('sym','${id}')"><canvas data-sym="${id}" width="56" height="56"></canvas></button>`).join('');
  r.innerHTML = `<div class="page-head"><div><h1>Editar logo</h1><p>Mexa em qualquer parte; a prévia atualiza na hora.</p></div><div class="actions">${projectSelect()}<button class="btn" onclick="lg.view=lg.items.length?'grid':'brief';renderDesign()">← Voltar</button></div></div>
  <div class="two dz-compose"><div class="panel"><canvas id="lgBig" width="720" height="480" style="width:100%;max-width:720px;border:1px solid #e6e6e6;border-radius:12px"></canvas>
    <div class="row-gap" style="margin-top:12px">${['light', 'dark', 'color'].map(m => `<button class="btn sm ${s.mode === m ? 'dark' : ''}" onclick="lgSet('mode','${m}')">${{light: 'Fundo claro', dark: 'Fundo escuro', color: 'Fundo colorido'}[m]}</button>`).join('')}</div>
    <div class="row-gap" style="margin-top:12px"><button class="btn dark" onclick="lgSaveKit()">Salvar no Brand Kit</button><button class="btn" onclick="lgDownload('png')">PNG transparente</button><button class="btn" onclick="lgDownload('svg')">SVG</button><button class="btn" onclick="lgToEditor()">Abrir no Editor</button><button class="btn" onclick="lgSaveLab()">Guardar em Meus logos</button></div>
    <small class="muted block" style="margin-top:6px">No SVG o texto sai como texto (a fonte precisa estar instalada onde for aberto). O PNG sai com a fonte já aplicada.</small></div>
  <div class="panel"><div class="field"><label>Nome</label><input value="${esc(s.name)}" oninput="lgSet('name',this.value,1)"></div><div class="field"><label>Slogan</label><input value="${esc(s.tag)}" oninput="lgSet('tag',this.value,1)"></div>
    <div class="okr-label">SÍMBOLO</div><div class="lg-syms">${pickS}</div>
    <div class="ins-row"><label class="ins">Fonte<select onchange="lgSet('font',this.value)">${Object.entries(LG_FONTS).map(([k, f]) => `<option value="${k}" ${s.font === k ? 'selected' : ''}>${esc(f.label)} · ${esc(f.head)}</option>`).join('')}</select></label>
    <label class="ins">Composição<select onchange="lgSet('comp',this.value)">${[['stack', 'Empilhada'], ['horizontal', 'Lado a lado'], ['wordmark', 'Só o nome'], ['pill', 'Pílula'], ['badge', 'Selo redondo'], ['sidebar', 'Barra lateral'], ['frame', 'Moldura'], ['lines', 'Linhas']].map(([k, l]) => `<option value="${k}" ${s.comp === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
    <div class="ins-row"><label class="ins">Símbolo <b>${Math.round(s.symScale * 100)}%</b><input type="range" min="50" max="180" value="${Math.round(s.symScale * 100)}" oninput="lgSet('symScale',this.value/100,1);this.previousElementSibling.textContent=this.value+'%'"></label><label class="ins">Nome <b>${Math.round(s.nameScale * 100)}%</b><input type="range" min="60" max="160" value="${Math.round(s.nameScale * 100)}" oninput="lgSet('nameScale',this.value/100,1);this.previousElementSibling.textContent=this.value+'%'"></label></div>
    <div class="okr-label">PALETA</div><div class="lg-pals">${pal.map(x => `<button class="lg-pal ${s.pal.join() === x.c.join() ? 'on' : ''}" title="${esc(x.name)}" onclick="lgSetPal('${x.id}')">${x.c.map(c => `<i style="background:${c}"></i>`).join('')}<span>${esc(x.name)}</span></button>`).join('')}</div>
    <div class="okr-label" style="margin-top:8px">AJUSTE FINO DAS 5 CORES <small class="muted">escura · principal · apoio · destaque · clara</small></div><div class="bk-chips">${s.pal.map((c, i) => `<input type="color" value="${c}" oninput="lgSetColor(${i},this.value)" style="width:42px;height:34px;padding:0;border:1px solid #ddd;border-radius:8px">`).join('')}</div></div></div>`;
  lgDrawBig(); document.querySelectorAll('canvas[data-sym]').forEach(cv => { const parts = LG_SYMBOLS[cv.dataset.sym].parts, x = cv.getContext('2d'); x.clearRect(0, 0, 56, 56); parts.forEach(pt => { const path = new Path2D(pt.d); x.save(); x.scale(0.56, 0.56); x.fillStyle = x.strokeStyle = pt.role === 'acc' ? '#999' : '#111'; if (pt.stroke) { x.lineWidth = pt.sw || 4; x.lineCap = 'round'; x.stroke(path); } else x.fill(path, pt.rule || 'nonzero'); x.restore(); }); });
}
let lgBigT = 0;
function lgDrawBig() { clearTimeout(lgBigT); lgBigT = setTimeout(async () => { const cv = $('lgBig'); if (cv && lg.cur) { cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); await lgPaint(cv, lg.cur); } }, 30); }
function lgSet(k, v, live) { lg.cur[k] = v; if (live) lgDrawBig(); else renderDesign(); }
function lgSetPal(id) { const x = LG_PALETTES.concat(lgBrandPalette(dzP()) || []).find(y => y.id === id); if (x) { lg.cur.pal = x.c.slice(); lg.cur.palId = id; renderDesign(); } }
function lgSetColor(i, v) { lg.cur.pal[i] = v; lg.cur.palId = ''; lgDrawBig(); }

/* ---------- saída: PNG, SVG, Brand Kit, Editor ---------- */
function lgSVG(sp, o) {
  const r = lgBuild(sp, o), e = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'), P = [];
  r.slide.layers.forEach(l => {
    if (l.type === 'rect') { const f = l.fill || 'none', st = l.stroke ? ` stroke="${e(l.stroke)}" stroke-width="${l.strokeW || 0}"` : ''; P.push(l.shape === 'ellipse' ? `<ellipse cx="${l.x + l.w / 2}" cy="${l.y + l.h / 2}" rx="${l.w / 2}" ry="${l.h / 2}" fill="${e(f)}"${st}/>` : `<rect x="${l.x}" y="${l.y}" width="${l.w}" height="${l.h}" rx="${l.radius || 0}" fill="${e(f)}"${st}/>`); }
    else if (l.type === 'path') P.push(`<path transform="translate(${l.x} ${l.y}) scale(${l.w / 100} ${l.h / 100})" d="${e(l.d)}" fill="${l.fill ? e(l.fill) : 'none'}" fill-rule="${l.rule || 'nonzero'}"${l.stroke ? ` stroke="${e(l.stroke)}" stroke-width="${l.strokeW}" stroke-linecap="round" stroke-linejoin="round"` : ''}/>`);
    else if (l.type === 'text') P.push(`<text x="${l.x}" y="${(l.y + l.size * 0.82).toFixed(1)}" font-family="${e(l.family)}, sans-serif" font-weight="${l.weight}" font-size="${l.size}" letter-spacing="${l.ls || 0}" fill="${e(l.color)}">${e(l.content)}</text>`);
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r.W} ${r.H}" width="${r.W}" height="${r.H}">${o && o.transparent ? '' : `<rect width="${r.W}" height="${r.H}" fill="${e(r.slide.bg)}"/>`}${P.join('')}</svg>`;
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
  const p = dzP(), b = lg.brief; b.name = ($('lgName') ? $('lgName').value : b.name).trim(); if (!b.name) { toast('Escreva o nome da marca.'); return; }
  const sg = lgSegment(b.seg), st = b.styles.map(id => lgStyle(id).label).join(', '), pal = (LG_PALETTES.find(x => x.id === b.palIds[0]) || lgBrandPalette(p) || LG_PALETTES[0]).c;
  const prompt = `Professional brand logo for "${b.name}", a ${sg.ai}. Style: ${st}. Flat vector logo mark with simple geometric shapes, limited palette (${pal.slice(1, 4).join(', ')}), centered on a plain light background, generous margins, no mockup, no photograph.`;
  toast('Gerando conceitos…'); try {
    const blob = await generateImage({prompt, size: 'square', quality: 'medium', refs: []}), bmp = await createImageBitmap(blob), id = uid('img'); await imgPut(id, blob); IMGS.set(id, bmp);
    lg.items.unshift({id: uid('lgai'), kind: 'ai', imgId: id, note: st}); lg.view = 'grid'; renderDesign(); toast('Conceito gerado. Salve no Brand Kit se gostar.');
  } catch (e) { toast(e.message); }
}
async function lgAISave(id) { const p = dzP(), b = brandOf(p), it = lg.items.find(i => i.id === id); await loadImage(it.imgId); const bm = IMGS.get(it.imgId); b.logos.push({id: uid('lg'), name: (lg.brief.name || 'Logo') + ' · IA', imgId: it.imgId, tone: 'any', w: bm.width, h: bm.height}); if (!b.extracted.length) { b.extracted = extractColors(bm); if (b.extracted[0]) { b.primary = b.extracted[0]; brandRecalc(p); } } persist(); toast('Conceito salvo no Brand Kit.'); }
