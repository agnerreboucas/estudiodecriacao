/* Modelos de layout: composições prontas (tipografia, foto + texto, camadas, promoção, estrutura, capas de vídeo).
   Cada modelo monta a peça numa tela de 1080 de largura e escala para qualquer formato; cores e fontes vêm do estilo ativo (ou do Brand Kit).
   Só a estrutura é recriada: textos, marcas e imagens dos posts de referência não entram. */
const LAYOUTS = [];
const LAYOUT_GROUPS = ['Tipografia', 'Foto + texto', 'Camadas', 'Promoção e evento', 'Estrutura', 'Capas de vídeo', 'Capas de carrossel', 'Carrossel editorial'];

/* ---- fontes por tipo: o modelo pede "condensada", "serifada", "manuscrita"; o estilo/Brand Kit decide a família ---- */
const COND = ['Anton', 'Bebas Neue', 'Oswald', 'Barlow Condensed', 'Fjalla One', 'Archivo Narrow', 'Big Shoulders Display'];
const SERIF = ['DM Serif Display', 'Playfair Display', 'Abril Fatface', 'Lora', 'Merriweather', 'Source Serif 4', 'Instrument Serif', 'Cormorant Garamond'];
function kindFamily(tk, kind) {
  const h = tk.head.family;
  if ((/^Marca /.test(h) || tk.headForce) && !['script', 'body', 'mono'].includes(kind)) return h;     // fonte própria da marca manda
  switch (kind) {
    case 'cond': return COND.includes(h) ? h : 'Anton';
    case 'serif': return SERIF.includes(h) ? h : 'DM Serif Display';
    case 'script': return 'Caveat';
    case 'marker': return 'Permanent Marker';
    case 'body': return tk.body.family;
    case 'black': return 'Archivo Black';
    default: return h;
  }
}
function fw(family, want) {
  const m = FONT_META[family]; if (m === undefined) return want; if (m === '') return 400;
  const ws = m.split(';').map(Number); return ws.reduce((a, b) => Math.abs(b - want) < Math.abs(a - want) ? b : a);
}

/* ---- paleta por modo: o mesmo modelo vira claro, escuro ou na cor da marca ---- */
function palette(tk, mode) {
  const acc = tk.accent, sec = tk.second || mixHex(acc, tk.fg, 0.45);
  let bg, fg, mut, ac = acc;
  if (mode === 'dark') { bg = lum(tk.bg) < 0.1 ? tk.bg : lum(tk.fg) < 0.14 ? tk.fg : mixHex('#0b0b10', acc, 0.12); fg = '#ffffff'; mut = mixHex(bg, '#ffffff', 0.62); }
  else if (mode === 'accent') { bg = acc; fg = readable(acc); mut = mixHex(bg, fg, 0.7); ac = contrast(sec, bg) >= 2.2 ? sec : fg; }
  else { bg = lum(tk.bg) > 0.55 ? tk.bg : '#f6f3ec'; fg = lum(tk.fg) < 0.35 ? tk.fg : '#141414'; mut = mixHex(bg, fg, 0.55); }
  return {bg, fg, mut, acc: ac, sec, on: readable(ac), inv: readable(bg), rev: readable(fg), alt: mixHex(bg, fg, 0.08), line: mixHex(bg, fg, 0.18), grad2: mixHex(acc, sec, 0.5), brand: acc === ac ? acc : tk.accent, paper: mode === 'accent' ? mixHex('#ffffff', '#d9cfb8', 0.55) : mixHex(bg, fg, 0.08), ink: '#171717'};
}
/* aplica a paleta/fonte do papel à camada (também usado ao trocar o estilo da peça) */
function themePal(L, tk, pal) {
  const col = pal[L.pk] || pal.fg;
  if (L.type === 'text') {
    L.color = col;
    if (L.fk) { L.family = kindFamily(tk, L.fk); L.weight = fw(L.family, L.fw || (L.fk === 'body' ? 400 : 800)); }
    if (L.fixUp !== undefined) L.upper = L.fixUp;
    L.emMode = L.em0 || tk.em.mode; L.emColor = pal.acc; L.emBg = pal.acc; L.emText = readable(pal.acc);
  } else if (L.type === 'rect') {
    if (!L.grad) L.fill = L.pk === 'none' ? '' : col;
    if (L.pks) L.stroke = pal[L.pks];
    if (L.grad && L.gk) L.grad = Object.assign({}, L.grad, {c1: pal[L.gk[0]] || pal.acc, c2: pal[L.gk[1]] || pal.sec});
  }
}

/* ---- construção ---- */
function layoutCtx(lay, tk, fmt, copy, brand) {
  const W = 1080, k = fmt.w / 1080, V = Math.round(fmt.h / k), pal = palette(tk, lay.mode), m = 90;
  const c = {W, H: V, tk, pal, m, cw: W - 2 * m, copy, brand, layers: []};
  const push = L => { c.layers.push(L); return L; };
  c.t = (role, content, o) => { const L = T(role, Object.assign({pk: 'fg', fk: 'body', x: m, w: c.cw, lh: 1.15}, o, {content: content == null ? '' : String(content)})); themeLayer(L, tk, pal); return push(L); };
  c.r = (role, o) => { const L = RC(role, Object.assign({pk: 'fg'}, o)); themeLayer(L, tk, pal); return push(L); };
  c.i = (role, o) => { const L = IM(role, Object.assign({}, o)); if (role === 'photo') themeLayer(L, tk, pal); if (role === 'cutout') L.fit = 'contain'; return push(L); };
  c.h = L => layoutText(L).h;
  /* gira um grupo de camadas em torno de um ponto (cada camada gira no próprio centro, então reposiciona) */
  c.rotGroup = (layers, cx, cy, deg) => { const a = deg * Math.PI / 180, co = Math.cos(a), si = Math.sin(a);
    layers.forEach(L => { const h = L.type === 'text' ? layoutText(L).h : L.h, mx = L.x + L.w / 2 - cx, my = L.y + h / 2 - cy; L.x = Math.round(cx + mx * co - my * si - L.w / 2); L.y = Math.round(cy + mx * si + my * co - h / 2); L.rot = deg; }); };
  /* reduz o tamanho até caber na altura e na largura (qualquer fonte, qualquer tamanho de texto) */
  c.fit = (L, maxH, minS, maxLines) => {
    for (let n = 0; n < 40; n++) { const lay2 = layoutText(L), wide = lay2.lines.some(l => l.w > L.w + 1); if (lay2.h <= maxH && !wide && (!maxLines || lay2.lines.length <= maxLines)) break; if (L.size <= (minS || 16)) break; L.size = Math.max(minS || 16, Math.round(L.size * 0.94 * 10) / 10); }
    return L;
  };
  c.stack = (items, y0, y1, valign, gap, x, w) => { stackPlace(items, x == null ? m : x, w || c.cw, y0, y1, valign || 'middle', gap == null ? 24 : gap); return items; };
  c.bgRect = (o) => c.r('bgfill', Object.assign({x: 0, y: 0, w: W, h: V}, o));
  return c;
}
/* texto padrão do modelo + o que o usuário preencheu */
function layoutCopy(lay, copy) {
  const s = JSON.parse(JSON.stringify(lay.sample || {})), out = Object.assign(s, Object.fromEntries(Object.entries(copy || {}).filter(([, v]) => v !== '' && v != null).map(([k, v]) => [k, v === '∅' ? '' : v])));   // '∅' = campo vazio de propósito (não usa o texto de exemplo)
  if (!Array.isArray(out.items)) out.items = String(out.items || '').split('\n').filter(Boolean);
  return out;
}
function buildLayoutSlide(lay, tk, copy, fmt, brand) {
  if (isWide(fmt)) {   // formatos largos: monta em 4:5 e reorganiza por papel
    const base = buildLayoutSlide(lay, tk, copy, FORMATS.feed45, brand);
    return resizeSlide(base, FORMATS.feed45, fmt, tk);
  }
  const k = fmt.w / 1080, c = layoutCtx(lay, tk, fmt, layoutCopy(lay, copy), brand || '');
  lay.build(c);
  const s = {id: sid(), bg: c.pal.bg, pm: lay.mode, lay: lay.id, layers: c.layers};
  if (k !== 1) scaleSlide(s, k, k);
  return s;
}
function layoutSetFrom(lay, tk, copy, fmt, brand, name) {
  const s = buildLayoutSlide(lay, tk, copy, fmt, brand);
  return {id: uid('ds'), name: name || lay.name, format: {id: fmt.id, w: fmt.w, h: fmt.h}, tk: JSON.parse(JSON.stringify(tk)), slides: [s], created: new Date().toISOString(), updated: new Date().toISOString()};
}
const layoutById = id => LAYOUTS.find(l => l.id === id);
