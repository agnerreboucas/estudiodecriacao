/* ===== Engenheiro de capa: capas de livro (frente, capa completa KDP, Kindle e celular) com layouts prontos, referência (IA) e envio à Diagramação ===== */
const cov = {ref: null, refBlob: null, busy: '', concepts: null, T: 0, nrm: null};
const covC = () => { const eb = typeof ebCur === 'function' && eui.id ? ebCur() : null, h = eb || curProject(); if (!h) return null; if (!h.cover || typeof h.cover !== 'object' || !h.cover.layout) h.cover = normalizeCover(h.cover); return h.cover; };
const COV_PALS = [
  ['Verde cuidado', {bg: '#4F8A55', fg: '#F4F1EC', accent: '#C9A876', second: '#6AA170'}], ['Vermelho e amarelo', {bg: '#DC2318', fg: '#FDB92F', accent: '#FDB92F', second: '#4A3B33'}], ['Preto e dourado', {bg: '#15120D', fg: '#F2E3B8', accent: '#D8A93A', second: '#6B5320'}],
  ['Laranja névoa', {bg: '#C96A2B', fg: '#FFFFFF', accent: '#FFE2B8', second: '#7A3B12'}], ['Verde escuro e linha dourada', {bg: '#173A32', fg: '#FFFFFF', accent: '#C9B26B', second: '#A8C66C'}], ['Azul-marinho', {bg: '#10264A', fg: '#FFFFFF', accent: '#F2B84B', second: '#4A74C9'}],
  ['Branco e preto', {bg: '#FFFFFF', fg: '#111111', accent: '#111111', second: '#888888'}], ['Terracota', {bg: '#E9DCCB', fg: '#3A2A20', accent: '#B4532A', second: '#7B8F5E'}]
];
const covFit = (L, maxW, maxH, minS) => { minS = minS || 12; for (let i = 0; i < 70; i++) { const l = layoutText(L); if (!l.lines.some(x => x.w > maxW + 1) && (!maxH || l.h <= maxH)) break; if (L.size <= minS) break; L.size = Math.max(minS, Math.round(L.size * 0.94)); } return L; };
const covTxt = (role, o) => covFit(T(role, Object.assign({w: 800}, o)), o.fitW || o.w, o.fitH, o.minS);
const covPh = (f, o) => IM('photo', Object.assign({imgId: f.imgId || '', brief: 'Foto ou ilustração da capa', fx: 0.5, fy: 0.5}, o));

/* ---------- layouts: cada um recebe o formulário f e a região da frente R ({x,y,w,h,full}) ---------- */
const COV_LAYOUTS = {
  giant: {n: 'Tipografia gigante', pal: {bg: '#1B1B1B', fg: '#F2EFE8', accent: '#E5B53B', second: '#8C8C8C'}, head: 'Anton', body: 'Montserrat', build(f, R) {
    const u = R.w / 1000, p = f.pal, pad = 70 * u, L = [RC('bg', Object.assign({}, R.full, {fill: p.bg}))], W = R.w - 2 * pad, words = f.title.toUpperCase().split(/\s+/).filter(Boolean);
    const content = words.length <= 5 ? words.join('\n') : f.title.toUpperCase();
    L.push(covTxt('kicker', {x: R.x + pad, y: R.y + pad * 0.8, w: W, content: (f.collection || f.tagline || '').toUpperCase(), family: f.body, size: 34 * u, weight: 700, color: p.second, ls: 6 * u, fitW: W}));
    const t = covTxt('title', {x: R.x + pad, y: R.y + pad * 1.9, w: W, content, family: f.head, size: 430 * u, weight: 700, color: p.fg, lh: 0.92, fitW: W, fitH: R.h * 0.56, minS: 40 * u}); L.push(t); const th = layoutText(t).h;
    if (f.subtitle) L.push(covTxt('subtitle', {x: R.x + pad, y: R.y + pad * 1.9 + th + 30 * u, w: W, content: f.subtitle.toUpperCase(), family: f.head, size: 70 * u, weight: 400, color: p.accent, lh: 1.1, ls: 3 * u, fitW: W}));
    const a = covTxt('author', {x: R.x + pad, y: R.y + R.h - pad * 1.2 - 360 * u, w: W * 0.62, content: f.author.toUpperCase().split(/\s+/).join('\n'), family: f.head, size: 150 * u, weight: 700, color: p.second === p.bg ? p.accent : p.second, lh: 0.95, fitW: W * 0.62, fitH: 360 * u, minS: 30 * u}); a.y = R.y + R.h - pad - layoutText(a).h; L.push(a);
    return L; }},
  photo: {n: 'Foto com título branco', pal: {bg: '#2A1E14', fg: '#FFFFFF', accent: '#F2C27B', second: '#C96A2B'}, head: 'Montserrat', body: 'Montserrat', build(f, R) {
    const u = R.w / 1000, p = f.pal, pad = 80 * u, W = R.w - 2 * pad, L = [RC('bg', Object.assign({}, R.full, {fill: p.bg})), covPh(f, Object.assign({}, R.full))];
    L.push(RC('shade', Object.assign({}, R.full, {fill: '#000000', opacity: 0.55, grad: {a: 0, c1: 'rgba(0,0,0,0.65)', c2: 'rgba(0,0,0,0)'}})));
    L.push(covTxt('author', {x: R.x + pad, y: R.y + pad, w: W, content: f.author, family: f.body, size: 78 * u, weight: 400, color: '#FFFFFF', fitW: W}));
    const t = covTxt('title', {x: R.x + pad, y: R.y + R.h * 0.3, w: W, content: f.title.toUpperCase(), family: f.head, size: 190 * u, weight: 800, color: '#FFFFFF', lh: 1.02, fitW: W, fitH: R.h * 0.4, minS: 40 * u}); L.push(t);
    if (f.subtitle) L.push(covTxt('subtitle', {x: R.x + pad, y: R.y + R.h * 0.3 + layoutText(t).h + 40 * u, w: W, content: f.subtitle, family: f.body, size: 58 * u, weight: 400, color: '#FFFFFF', lh: 1.3, fitW: W}));
    if (f.collection) L.push(covTxt('selo', {x: R.x + pad, y: R.y + R.h - pad - 40 * u, w: W, content: f.collection.toUpperCase(), family: f.body, size: 30 * u, weight: 700, color: '#FFFFFF', ls: 8 * u, align: 'center', fitW: W}));
    return L; }},
  band: {n: 'Foto em cima, faixa de cor embaixo', pal: {bg: '#F4EFE6', fg: '#2B2B2B', accent: '#B4532A', second: '#7B8F5E'}, head: 'Playfair Display', body: 'Montserrat', build(f, R) {
    const u = R.w / 1000, p = f.pal, pad = 70 * u, W = R.w - 2 * pad, ph = R.h * 0.56, L = [RC('bg', Object.assign({}, R.full, {fill: p.bg})), covPh(f, {x: R.full.x, y: R.full.y, w: R.full.w, h: ph + (R.y - R.full.y)})];
    L.push(RC('band', {x: R.full.x, y: R.y + ph - 10 * u, w: R.full.w, h: 14 * u, fill: p.accent}));
    const t = covTxt('title', {x: R.x + pad, y: R.y + ph + 60 * u, w: W, content: f.title, family: f.head, size: 130 * u, weight: 700, color: p.fg, lh: 1.08, fitW: W, fitH: R.h * 0.22, minS: 36 * u}); L.push(t);
    if (f.subtitle) L.push(covTxt('subtitle', {x: R.x + pad, y: R.y + ph + 60 * u + layoutText(t).h + 20 * u, w: W, content: f.subtitle, family: f.body, size: 46 * u, weight: 400, color: p.accent, lh: 1.3, fitW: W}));
    L.push(covTxt('author', {x: R.x + pad, y: R.y + R.h - pad - 60 * u, w: W, content: f.author.toUpperCase(), family: f.body, size: 46 * u, weight: 700, color: p.fg, ls: 6 * u, fitW: W}));
    return L; }},
  line: {n: 'Linha dourada sobre fundo escuro', pal: {bg: '#173A32', fg: '#FFFFFF', accent: '#C9B26B', second: '#A8C66C'}, head: 'Montserrat', body: 'Cormorant Garamond', build(f, R) {
    const u = R.w / 1000, p = f.pal, pad = 80 * u, W = R.w - 2 * pad, L = [RC('bg', Object.assign({}, R.full, {fill: p.bg}))];
    L.push(covTxt('author', {x: R.x + pad, y: R.y + pad * 0.9, w: W, content: f.author.toUpperCase(), family: f.body, size: 62 * u, weight: 600, color: p.fg, ls: 12 * u, align: 'center', fitW: W}));
    L.push({id: lid(), type: 'path', role: 'art', vb: 100, x: R.x + R.w * 0.12, y: R.y + R.h * 0.12, w: R.w * 0.8, h: R.h * 0.5, d: 'M50 100 C48 82 50 70 50 56 C40 52 28 46 20 34 C32 30 44 36 50 48 C54 36 64 26 80 20 C78 34 68 46 54 54 M50 70 C38 66 26 66 14 58 C26 52 40 56 50 66 M50 76 C60 68 74 66 90 70 C80 80 64 82 50 78', rule: '', fill: '', stroke: p.accent, strokeW: 3 * u, opacity: 1});
    const t = covTxt('title', {x: R.x + pad, y: R.y + R.h * 0.68, w: W, content: f.title.toUpperCase(), family: f.head, size: 112 * u, weight: 700, color: p.fg, lh: 1.08, fitW: W, fitH: R.h * 0.17, minS: 30 * u}); L.push(t);
    const yb = R.y + R.h * 0.68 + layoutText(t).h + 22 * u; L.push(RC('rule', {x: R.x, y: yb, w: R.w, h: 3 * u, fill: p.accent}));
    if (f.subtitle) L.push(covTxt('subtitle', {x: R.x + pad, y: yb + 26 * u, w: W, content: f.subtitle, family: f.head, size: 52 * u, weight: 700, color: p.second, fitW: W}));
    return L; }},
  serif: {n: 'Minimalista serifado, centralizado', pal: {bg: '#4F8A55', fg: '#F4F1EC', accent: '#C9A876', second: '#6AA170'}, head: 'Playfair Display', body: 'Montserrat', build(f, R) {
    const u = R.w / 1000, p = f.pal, pad = 90 * u, W = R.w - 2 * pad, L = [RC('bg', Object.assign({}, R.full, {fill: p.bg})), RC('frame', {x: R.x + 40 * u, y: R.y + 40 * u, w: R.w - 80 * u, h: R.h - 80 * u, fill: '', stroke: p.accent, strokeW: 3 * u, radius: 0})];
    if (f.imgId) L.push(covPh(f, {x: R.x + 40 * u, y: R.y + 40 * u, w: R.w - 80 * u, h: R.h * 0.42}));
    const y0 = R.y + R.h * (f.imgId ? 0.5 : 0.24);
    L.push(covTxt('kicker', {x: R.x + pad, y: y0 - 90 * u, w: W, content: (f.collection || '').toUpperCase(), family: f.body, size: 34 * u, weight: 700, color: p.accent, ls: 10 * u, align: 'center', fitW: W}));
    const t = covTxt('title', {x: R.x + pad, y: y0, w: W, content: f.title, family: f.head, size: 150 * u, weight: 700, color: p.fg, lh: 1.08, align: 'center', fitW: W, fitH: R.h * 0.3, minS: 36 * u}); L.push(t); const th = layoutText(t).h;
    L.push(RC('rule', {x: R.x + R.w / 2 - 70 * u, y: y0 + th + 30 * u, w: 140 * u, h: 6 * u, fill: p.accent, radius: 3 * u}));
    if (f.subtitle) { const s = covTxt('subtitle', {x: R.x + pad, y: y0 + th + 70 * u, w: W, content: f.subtitle, family: f.body, size: 52 * u, weight: 400, color: p.fg, lh: 1.35, align: 'center', fitW: W}); const n = plainOf(s.content).length; if (n) s.spans = [{s: 0, e: n, st: {italic: true}}]; L.push(s); }
    L.push(covTxt('author', {x: R.x + pad, y: R.y + R.h - 190 * u, w: W, content: f.author, family: f.head, size: 56 * u, weight: 600, color: p.fg, align: 'center', fitW: W}));
    return L; }},
  circle: {n: 'Círculo com imagem', pal: {bg: '#E9DCCB', fg: '#3A2A20', accent: '#B4532A', second: '#D9A066'}, head: 'DM Serif Display', body: 'Montserrat', build(f, R) {
    const u = R.w / 1000, p = f.pal, pad = 80 * u, W = R.w - 2 * pad, d = R.w * 0.72, L = [RC('bg', Object.assign({}, R.full, {fill: p.bg}))];
    L.push(covTxt('author', {x: R.x + pad, y: R.y + pad, w: W, content: f.author.toUpperCase(), family: f.body, size: 40 * u, weight: 700, color: p.accent, ls: 8 * u, align: 'center', fitW: W}));
    L.push(RC('disc', {x: R.x + (R.w - d) / 2, y: R.y + R.h * 0.12, w: d, h: d, fill: p.second, radius: d / 2})); if (f.imgId) L.push(covPh(f, {x: R.x + (R.w - d) / 2, y: R.y + R.h * 0.12, w: d, h: d, radius: d / 2}));
    const ty = R.y + R.h * 0.12 + d + 50 * u, t = covTxt('title', {x: R.x + pad, y: ty, w: W, content: f.title, family: f.head, size: 120 * u, weight: 400, color: p.fg, lh: 1.05, align: 'center', fitW: W, fitH: R.h * 0.16, minS: 30 * u}); L.push(t);
    if (f.subtitle) L.push(covTxt('subtitle', {x: R.x + pad, y: ty + layoutText(t).h + 16 * u, w: W, content: f.subtitle, family: f.body, size: 42 * u, weight: 400, color: p.fg, align: 'center', fitW: W}));
    return L; }},
  duo: {n: 'Duotone com título sobreposto', pal: {bg: '#C96A2B', fg: '#FFFFFF', accent: '#FFE2B8', second: '#7A3B12'}, head: 'Bebas Neue', body: 'Montserrat', build(f, R) {
    const u = R.w / 1000, p = f.pal, pad = 60 * u, W = R.w - 2 * pad, L = [RC('bg', Object.assign({}, R.full, {fill: p.bg}))];
    L.push(covPh(f, Object.assign({}, R.full, {filter: 'grayscale(1) contrast(1.6)', ovColor: p.bg, ovMode: 'multiply'})));
    const t = covTxt('title', {x: R.x + pad, y: R.y + pad, w: W, content: f.title.toUpperCase(), family: f.head, size: 230 * u, weight: 400, color: p.fg, lh: 0.95, fitW: W, fitH: R.h * 0.32, minS: 40 * u}); L.push(t);
    if (f.subtitle) L.push(covTxt('subtitle', {x: R.x + pad, y: R.y + pad + layoutText(t).h + 20 * u, w: W, content: f.subtitle.toUpperCase(), family: f.body, size: 40 * u, weight: 700, color: p.accent, ls: 4 * u, fitW: W}));
    const a = covTxt('author', {x: R.x + pad, y: R.y + R.h * 0.62, w: W, content: f.author.toUpperCase().split(/\s+/).join('\n'), family: f.head, size: 300 * u, weight: 400, color: p.fg, lh: 0.9, fitW: W, fitH: R.h * 0.34, minS: 40 * u}); a.y = R.y + R.h - pad - layoutText(a).h; L.push(a);
    return L; }},
  severina: {n: 'Cor sobre cor, título condensado', pal: {bg: '#DC2318', fg: '#FDB92F', accent: '#FDB92F', second: '#4A3B33'}, head: 'Anton', body: 'Montserrat', build(f, R) {
    const u = R.w / 1000, p = f.pal, pad = 64 * u, W = R.w - 2 * pad, L = [RC('bg', Object.assign({}, R.full, {fill: p.bg}))];
    L.push(covTxt('kicker', {x: R.x + pad, y: R.y + pad * 0.7, w: W, content: (f.collection || f.tagline || '').toUpperCase(), family: f.body, size: 30 * u, weight: 700, color: p.fg, ls: 5 * u, fitW: W}));
    const t = covTxt('title', {x: R.x + pad, y: R.y + pad * 1.8, w: W, content: f.title.toUpperCase().split(/\s+/).join('\n'), family: f.head, size: 400 * u, weight: 400, color: p.fg, lh: 0.92, fitW: W * 0.9, fitH: R.h * 0.5, minS: 60 * u}); L.push(t); const th = layoutText(t).h;
    if (f.subtitle) L.push(covTxt('subtitle', {x: R.x + pad + 20 * u, y: R.y + pad * 1.8 + th + 14 * u, w: W, content: f.subtitle.toUpperCase(), family: f.head, size: 64 * u, weight: 400, color: p.fg, ls: 2 * u, lh: 1.05, fitW: W * 0.8}));
    const a = covTxt('author', {x: R.x + pad, y: R.y + R.h * 0.62, w: W * 0.6, content: f.author.toUpperCase().split(/\s+/).join('\n'), family: f.head, size: 220 * u, weight: 400, color: p.second, lh: 0.92, fitW: W * 0.6, fitH: R.h * 0.3, minS: 40 * u}); a.y = R.y + R.h - pad - layoutText(a).h; L.push(a);
    L.push(covTxt('selo', {x: R.x + R.w - pad - 360 * u, y: R.y + R.h - pad - 40 * u, w: 360 * u, content: (f.tagline || '').toUpperCase(), family: f.body, size: 30 * u, weight: 700, color: p.fg, ls: 6 * u, align: 'right', fitW: 360 * u}));
    return L; }},
  photo2: {n: 'Foto de paisagem, título branco forte', pal: {bg: '#B8541F', fg: '#FFFFFF', accent: '#FFE2B8', second: '#7A3B12'}, head: 'Montserrat', body: 'Montserrat', build(f, R) {
    const u = R.w / 1000, p = f.pal, pad = 70 * u, W = R.w - 2 * pad, L = [RC('bg', Object.assign({}, R.full, {fill: p.bg})), covPh(f, Object.assign({}, R.full))];
    L.push(RC('shade', Object.assign({}, R.full, {fill: '#000000', opacity: 0.5, grad: {a: 0, c1: 'rgba(40,10,0,0.45)', c2: 'rgba(40,10,0,0.05)'}})));
    const au = covTxt('author', {x: R.x + pad, y: R.y + pad * 0.8, w: W, content: f.author, family: f.body, size: 110 * u, weight: 400, color: p.fg, lh: 1.05, fitW: W, fitH: 250 * u, minS: 30 * u}); L.push(au); let yy = R.y + pad * 0.8 + layoutText(au).h + 20 * u;
    if (f.tagline) { L.push(covTxt('tagline', {x: R.x + pad, y: yy, w: W, content: f.tagline, family: f.body, size: 36 * u, weight: 700, color: p.fg, fitW: W})); yy += 70 * u; }
    const ty = Math.max(R.y + R.h * 0.22, yy + 40 * u), t = covTxt('title', {x: R.x + pad, y: ty, w: W, content: f.title.toUpperCase(), family: f.head, size: 190 * u, weight: 800, color: p.fg, lh: 1.0, fitW: W * 0.92, fitH: R.h * 0.4, minS: 40 * u}); L.push(t);
    if (f.subtitle) L.push(covTxt('subtitle', {x: R.x + pad, y: ty + layoutText(t).h + 30 * u, w: W, content: f.subtitle, family: f.body, size: 54 * u, weight: 400, color: p.fg, lh: 1.25, fitW: W}));
    if (f.collection) L.push(covTxt('selo', {x: R.x + pad, y: R.y + R.h - pad - 30 * u, w: W, content: f.collection.toUpperCase(), family: f.body, size: 28 * u, weight: 700, color: p.fg, ls: 10 * u, align: 'center', fitW: W}));
    return L; }},
  gold: {n: 'Cinematográfico dourado', pal: {bg: '#15120D', fg: '#F2E3B8', accent: '#D8A93A', second: '#6B5320'}, head: 'Cinzel', body: 'Cinzel', build(f, R) {
    const u = R.w / 1000, p = f.pal, pad = 80 * u, W = R.w - 2 * pad, L = [RC('bg', Object.assign({}, R.full, {fill: p.bg})), covPh(f, Object.assign({}, R.full, {opacity: 0.55}))];
    L.push(RC('glow', {x: R.full.x, y: R.full.y, w: R.full.w, h: R.full.h * 0.7, fill: '#000', grad: {a: 180, c1: 'rgba(216,169,58,0.38)', c2: 'rgba(0,0,0,0)'}}));
    L.push(RC('shade', Object.assign({}, R.full, {fill: '#000', grad: {a: 0, c1: 'rgba(0,0,0,0.85)', c2: 'rgba(0,0,0,0)'}})));
    const ws = f.title.toUpperCase().split(/\s+/).filter(Boolean), last = ws.length > 2 ? ws.pop() : '', first = ws.join(' '), y0 = R.y + R.h * 0.5;
    if (last) L.push(covTxt('kicker', {x: R.x + pad, y: y0 - 20 * u, w: W, content: first, family: f.head, size: 76 * u, weight: 600, color: p.accent, ls: 6 * u, align: 'center', fitW: W}));
    L.push(covTxt('title', {x: R.x + pad, y: y0 + (last ? 90 : 0) * u, w: W, content: last || first, family: f.head, size: 300 * u, weight: 900, color: p.accent, lh: 1, align: 'center', fitW: W, fitH: R.h * 0.2, minS: 50 * u}));
    if (f.subtitle) L.push(covTxt('subtitle', {x: R.x + pad, y: R.y + R.h * 0.82, w: W, content: f.subtitle.toUpperCase(), family: f.body, size: 34 * u, weight: 400, color: p.fg, ls: 8 * u, align: 'center', fitW: W}));
    L.push(covTxt('author', {x: R.x + pad, y: R.y + R.h - pad - 40 * u, w: W, content: f.author.toUpperCase(), family: f.body, size: 40 * u, weight: 400, color: p.fg, ls: 14 * u, align: 'center', fitW: W}));
    return L; }},
  vertical: {n: 'Palavra gigante na vertical', pal: {bg: '#2B2B2B', fg: '#FFFFFF', accent: '#9A9A9A', second: '#5A5A5A'}, head: 'Bebas Neue', body: 'Montserrat', build(f, R) {
    const u = R.w / 1000, p = f.pal, pad = 60 * u, L = [RC('bg', Object.assign({}, R.full, {fill: p.bg}))], len = R.h - 2 * pad;
    const t = covTxt('title', {x: 0, y: 0, w: len, content: f.title.toUpperCase(), family: f.head, size: 520 * u, weight: 400, color: p.second, lh: 1, fitW: len, fitH: R.w * 0.36, minS: 60 * u}), th = layoutText(t).h;
    t.x = R.x + pad + th / 2 - len / 2; t.y = R.y + R.h / 2 - th / 2; t.rot = -90; L.push(t);
    const cx = R.x + pad + th + 60 * u, cw = R.x + R.w - pad - cx;
    L.push(covTxt('kicker', {x: cx, y: R.y + pad, w: cw, content: (f.collection || '').toUpperCase(), family: f.body, size: 28 * u, weight: 700, color: p.accent, ls: 6 * u, fitW: cw}));
    L.push(covTxt('subtitle', {x: cx, y: R.y + R.h * 0.3, w: cw, content: f.subtitle || f.tagline || '', family: f.body, size: 44 * u, weight: 700, color: p.fg, lh: 1.25, fitW: cw, fitH: R.h * 0.35, minS: 20 * u}));
    L.push(RC('rule', {x: cx, y: R.y + R.h - pad - 200 * u, w: cw, h: 3 * u, fill: p.accent}));
    L.push(covTxt('author', {x: cx, y: R.y + R.h - pad - 170 * u, w: cw, content: f.author, family: f.body, size: 40 * u, weight: 700, color: p.fg, lh: 1.2, fitW: cw}));
    return L; }},
  bigblack: {n: 'Autor dourado, título preto enorme', pal: {bg: '#FFFFFF', fg: '#111111', accent: '#C9A227', second: '#444444'}, head: 'Anton', body: 'Montserrat', build(f, R) {
    const u = R.w / 1000, p = f.pal, pad = 70 * u, W = R.w - 2 * pad, L = [RC('bg', Object.assign({}, R.full, {fill: p.bg}))];
    L.push(covTxt('author', {x: R.x + pad, y: R.y + pad * 1.1, w: W, content: f.author.toUpperCase(), family: f.body, size: 70 * u, weight: 800, color: p.accent, ls: 14 * u, align: 'center', fitW: W}));
    const t = covTxt('title', {x: R.x + pad, y: R.y + R.h * 0.22, w: W, content: f.title.toUpperCase().split(/\s+/).length <= 5 ? f.title.toUpperCase().split(/\s+/).join('\n') : f.title.toUpperCase(), family: f.head, size: 330 * u, weight: 400, color: p.fg, lh: 0.95, align: 'center', fitW: W, fitH: R.h * 0.5, minS: 50 * u}); L.push(t);
    if (f.subtitle) L.push(covTxt('subtitle', {x: R.x + pad, y: R.y + R.h * 0.22 + layoutText(t).h + 40 * u, w: W, content: f.subtitle.toUpperCase(), family: f.body, size: 56 * u, weight: 800, color: p.accent, ls: 4 * u, lh: 1.2, align: 'center', fitW: W}));
    L.push(covTxt('selo', {x: R.x + pad, y: R.y + R.h - pad - 30 * u, w: W, content: (f.collection || '').toUpperCase(), family: f.body, size: 30 * u, weight: 700, color: p.second, ls: 10 * u, align: 'center', fitW: W}));
    return L; }},
  grid: {n: 'Grade modular (estilo adidas)', pal: {bg: '#FFFFFF', fg: '#111111', accent: '#00AEEF', second: '#FF8FA3'}, head: 'Archivo Black', body: 'Inter', build(f, R) {
    const u = R.w / 1000, p = f.pal, gx = R.w / 6, gy = R.h / 8, L = [RC('bg', Object.assign({}, R.full, {fill: p.bg}))];
    for (let i = 1; i < 6; i++) L.push(RC('gridline', {x: R.x + i * gx - 1, y: R.y, w: 2 * u, h: R.h, fill: p.accent, opacity: 0.25}));
    for (let j = 1; j < 8; j++) L.push(RC('gridline', {x: R.x, y: R.y + j * gy - 1, w: R.w, h: 2 * u, fill: p.accent, opacity: 0.25}));
    L.push(RC('block', {x: R.x + 2 * gx, y: R.y + 1 * gy, w: 3 * gx, h: 3 * gy, fill: p.second})); L.push(covPh(f, {x: R.x + 2 * gx, y: R.y + 1 * gy, w: 3 * gx, h: 3 * gy}));
    const t = covTxt('title', {x: R.x + gx, y: R.y + 4.4 * gy, w: 5 * gx, content: f.title.toUpperCase(), family: f.head, size: 140 * u, weight: 800, color: p.fg, lh: 1, fitW: 5 * gx, fitH: 2.4 * gy, minS: 30 * u}); L.push(t);
    if (f.subtitle) L.push(covTxt('subtitle', {x: R.x + gx, y: R.y + 4.4 * gy + layoutText(t).h + 14 * u, w: 4 * gx, content: f.subtitle, family: f.body, size: 40 * u, weight: 400, color: p.fg, fitW: 4 * gx}));
    L.push(covTxt('author', {x: R.x + gx, y: R.y + 7.1 * gy, w: 4 * gx, content: f.author.toUpperCase(), family: f.body, size: 36 * u, weight: 700, color: p.accent, ls: 6 * u, fitW: 4 * gx}));
    return L; }}
};
const COV_MODES = {front: {n: 'Capa frontal', w: 1600, h: 2400}, kindle: {n: 'Kindle (1600 × 2560)', w: 1600, h: 2560}, mobile: {n: 'Celular / Stories (1080 × 1920)', w: 1080, h: 1920}, wrap: {n: 'Capa completa para a Amazon (contracapa + lombada + capa)'}};

/* ---------- montagem da peça ---------- */
function covForm(c) { return {title: c.title || 'Título do livro', subtitle: c.subtitle, author: c.author || 'Nome do autor', collection: c.collection, tagline: c.tagline, pal: c.pal, head: c.head, body: c.body, imgId: c.imgId}; }
function covBuild(c, mode) {
  const f = covForm(c), lay = COV_LAYOUTS[c.layout] || COV_LAYOUTS.giant;
  if (mode !== 'wrap') { const M = COV_MODES[mode] || COV_MODES.front, R = {x: 0, y: 0, w: M.w, h: M.h}; R.full = {x: 0, y: 0, w: M.w, h: M.h}; return {W: M.w, H: M.h, layers: lay.build(f, R), bg: c.pal.bg}; }
  const k = kdpK(), calc = kdpCalc(k, kdpPages()), D = 300, W = calc.px.w, H = calc.px.h, bl = calc.bleed * D, tw = calc.tw * D, sp = calc.spine * D, p = c.pal, u = tw / 1000;
  const front = {x: bl + tw + sp, y: bl, w: tw, h: calc.th * D}; front.full = {x: front.x, y: 0, w: tw + bl, h: H};
  const L = [RC('bg', {x: 0, y: 0, w: W, h: H, fill: p.bg})]; const fl = lay.build(f, front);
  /* a frente sangra à direita, em cima e embaixo; o fundo da frente cobre a sangria */
  const back = {x: bl, y: bl, w: tw, h: calc.th * D}, pad = 0.5 * D;
  L.push(covTxt('blurb-title', {x: back.x + pad, y: back.y + pad, w: back.w - 2 * pad, content: f.tagline || f.title, family: f.head, size: 70 * u, weight: 700, color: p.fg, lh: 1.15, fitW: back.w - 2 * pad, fitH: back.h * 0.2, minS: 24}));
  L.push(covTxt('blurb', {x: back.x + pad, y: back.y + pad + 190 * u, w: back.w - 2 * pad, content: c.blurb || 'Texto da contracapa: escreva aqui a sinopse, o que o leitor vai aprender e a chamada para a compra.', family: f.body, size: 34 * u, weight: 400, color: p.fg, lh: 1.5, fitW: back.w - 2 * pad, fitH: back.h * 0.5, minS: 14}));
  L.push(RC('barcode', {x: back.x + back.w - 0.25 * D - 2 * D, y: back.y + back.h - 0.25 * D - 1.2 * D, w: 2 * D, h: 1.2 * D, fill: '#FFFFFF'}));
  L.push(T('barcode-note', {x: back.x + back.w - 0.25 * D - 2 * D, y: back.y + back.h - 0.25 * D - 0.75 * D, w: 2 * D, content: 'Espaço do código de barras (KDP)', family: 'Inter', size: 26, weight: 400, color: '#999999', align: 'center'}));
  if (calc.spineText) { const len = calc.th * D - 2 * 0.6 * D, st = covTxt('spine-title', {x: 0, y: 0, w: len, content: f.title, family: f.head, size: sp * 0.52, weight: 700, color: p.fg, lh: 1, fitW: len * 0.66, minS: 20}), sa = covTxt('spine-author', {x: 0, y: 0, w: len * 0.3, content: f.author, family: f.body, size: sp * 0.34, weight: 600, color: p.accent, align: 'right', fitW: len * 0.3, minS: 14}), cx = bl + tw + sp / 2, cy = H / 2, th = layoutText(st).h, ah = layoutText(sa).h;
    st.w = len * 0.66; st.x = cx - st.w / 2 - len * 0.17; st.y = cy - th / 2; st.rot = 90; sa.w = len * 0.3; sa.x = cx - sa.w / 2 + len * 0.33; sa.y = cy - ah / 2; sa.rot = 90; L.push(st, sa); }
  L.push(...fl); L.push(RC('fold', {x: bl + tw - 1, y: 0, w: 2, h: H, fill: '#00AEEF', opacity: 0})); return {W, H, layers: L, bg: p.bg, calc};
}
async function covFontsAndImgs(set) { await ensureFonts(set.slides[0].layers.filter(l => l.type === 'text').map(l => l.family)); if (typeof ensureSetResources === 'function') await ensureSetResources(set); }
async function covPreview() {
  const c = covC(), cv = $('covCv'); if (!cv || !c) return; const mode = c.mode, b = covBuild(c, mode), set = {id: 'cov-prev', format: {id: 'custom', w: b.W, h: b.H}, tk: {}, slides: [{id: 'p', name: 'p', bg: b.bg, layers: b.layers}]};
  const my = ++cov.T; await covFontsAndImgs(set); if (my !== cov.T || !$('covCv')) return;
  const sc = Math.min(1, 900 / b.W); cv.width = Math.round(b.W * sc); cv.height = Math.round(b.H * sc); const x = cv.getContext('2d'); renderSlide(x, set.slides[0], b.W, b.H, sc);
  const info = $('covInfo'); if (info) info.textContent = mode === 'wrap' ? `Capa completa ${b.calc.wrapW.toFixed(2)} × ${b.calc.wrapH.toFixed(2)} pol. · lombada ${b.calc.spine.toFixed(3)} pol. · ${b.W} × ${b.H} px` : `${b.W} × ${b.H} px`;
}
const covPrevSoon = () => { clearTimeout(cov.tm); cov.tm = setTimeout(covPreview, 260); };

/* ---------- tela ---------- */
function covRender(r, p) {
  const c = covC(), L = COV_LAYOUTS;
  r.innerHTML = edTabs('capa') + `<div class="page-head"><div><h1>Engenheiro de capa</h1><p>Monte a capa do livro: escolha um layout, preencha os textos, ponha a foto e a paleta. Crie a capa para a frente, para a Amazon (capa completa com lombada), para o Kindle ou para o celular. Depois refine no Editor de Design e mande para a Diagramação ou para o e-book.</p></div></div>
  <div class="cov-wrap"><div class="cov-form">
  <div class="okr-label">FORMATO</div><div class="tchips">${Object.entries(COV_MODES).map(([k, v]) => `<button class="tchip ${c.mode === k ? 'on' : ''}" onclick="covSet('mode','${k}')">${esc(v.n)}</button>`).join('')}</div>
  <div class="okr-label" style="margin-top:10px">TEXTOS</div><div class="form-grid">${[['title', 'Título'], ['subtitle', 'Subtítulo'], ['author', 'Autor(a)'], ['collection', 'Coleção / selo / editora'], ['tagline', 'Chamada (contracapa)']].map(([k, l]) => `<div class="field"><label>${l}</label><input value="${esc(c[k])}" oninput="covSet('${k}',this.value,true)"></div>`).join('')}</div>
  ${c.mode === 'wrap' ? `<div class="field"><label>Texto da contracapa (sinopse)</label><textarea rows="4" oninput="covSet('blurb',this.value,true)">${esc(c.blurb)}</textarea></div>` : ''}
  <div class="okr-label">LAYOUT (um clique aplica fontes e paleta)</div><label class="dtp-chk"><input type="checkbox" ${cov.keepPal ? 'checked' : ''} onchange="cov.keepPal=this.checked"> Manter a minha paleta ao trocar de layout</label><div class="cov-lays">${Object.entries(L).map(([k, v]) => `<button class="cov-lay ${c.layout === k ? 'on' : ''}" onclick="covPick('${k}')"><canvas data-cl="${k}" width="120" height="180"></canvas><b>${esc(v.n)}</b><small class="muted">${esc(v.head)} + ${esc(v.body)}</small></button>`).join('')}</div>
  ${accSec('covg', 'gal', 'Modelos de layout da galeria (' + LAYOUTS.length + ')', 'um clique cria a capa', covGalBody(), false)}
  <div class="okr-label" style="margin-top:10px">PALETA</div><div class="tchips">${COV_PALS.map(([n, pl], i) => `<button class="tchip" onclick="covPal(${i})" title="${esc(n)}"><span class="cov-sw" style="background:${pl.bg}"></span><span class="cov-sw" style="background:${pl.fg}"></span><span class="cov-sw" style="background:${pl.accent}"></span> ${esc(n)}</button>`).join('')}</div>
  <div class="row-gap" style="margin:6px 0;flex-wrap:wrap">${[['bg', 'Fundo'], ['fg', 'Texto'], ['accent', 'Destaque'], ['second', 'Apoio']].map(([k, l]) => `<label class="dtp-chk">${l} <input type="color" value="${c.pal[k]}" onchange="covPalSet('${k}',this.value)"></label>`).join('')}</div>
  <div class="row-gap" style="margin-bottom:4px"><button class="btn sm" onclick="fbOpen(f => covSet('head', f), covC().head)">Aa Ver fontes do título</button><button class="btn sm" onclick="fbOpen(f => covSet('body', f), covC().body)">Aa Ver fontes do texto</button></div><div class="form-grid"><div class="field"><label>Fonte dos títulos</label><select onchange="covSet('head',this.value)">${dtpFontOpts(c.head)}</select></div><div class="field"><label>Fonte do texto</label><select onchange="covSet('body',this.value)">${dtpFontOpts(c.body)}</select></div></div>
  <div class="row-gap" style="flex-wrap:wrap"><button class="btn sm" onclick="covPickImg()">${c.imgId ? 'Trocar a foto/ilustração' : 'Subir foto/ilustração de fundo'}</button><button class="btn sm" onclick="covStockImg()">🔎 Banco de imagens</button>${c.imgId ? '<button class="btn sm" onclick="covSet(\'imgId\',\'\')">Tirar a foto</button>' : ''}<button class="btn sm" onclick="covConcepts()" ${cov.busy ? 'disabled' : ''}>${cov.busy === 'con' ? 'Pensando…' : '✦ Sugestões da IA'}</button></div>
  ${cov.concepts ? `<div class="cov-cons">${cov.concepts.map((k, i) => `<div class="mot-ch"><b>${esc(k.name)}</b><p class="muted" style="font-size:12px;margin:3px 0">${esc(k.why)}</p><p style="font-size:12px;margin:3px 0"><b>Imagem:</b> ${esc(k.imageBrief)}</p><button class="btn sm" onclick="covApplyConcept(${i})">Aplicar</button></div>`).join('')}</div>` : ''}
  ${refBankHTML('cov', ['capas', 'cartaz', 'posts'])}
  ${cov.ref ? `<div class="row-gap" style="flex-wrap:wrap;margin-bottom:8px"><span class="muted" style="font-size:12px">Referência escolhida.</span><button class="btn sm dark" onclick="ailStart(cov.ref,'cov')">✦ Ler layout com IA → peça editável</button><button class="btn sm" onclick="cov.ref=null;covRender()">Tirar</button></div>` : ''}
  </div><div class="cov-prev"><canvas id="covCv" class="cov-cv"></canvas><small class="muted block" id="covInfo"></small>
  <div class="row-gap" style="margin-top:8px;flex-wrap:wrap"><button class="btn dark" onclick="covCreate()">Criar no Editor de Design</button><button class="btn" onclick="covMockupDown()">Mockup do livro (PNG)</button></div>
  <div class="mot-ch" style="margin-top:10px"><b>Esta capa é a do e-book</b><p class="muted" style="font-size:12px;margin:4px 0">Ao criar, ela fica ligada automaticamente ao e-book (versões e EPUB).</p><div class="row-gap" style="flex-wrap:wrap"><button class="btn sm" onclick="bookCoverToMiolo()" ${ebCur() && ebCur().coverSetId ? '' : 'disabled'}>Inserir como página 1 do miolo</button><button class="btn sm" onclick="covOpenSet()" ${ebCur() && ebCur().coverSetId ? '' : 'disabled'}>Abrir no Editor de Design</button></div></div></div></div>`;
  if (eui.id) { const t = r.querySelector(':scope > .edh-tabs'), h = r.querySelector(':scope > .page-head'); if (t) t.remove(); if (h) h.remove(); }
  bankFill(); covPreview(); covThumbs(); if (ACC.covg && ACC.covg.gal) covGalPaint();
}
function covSet(k, v, soft) { const c = covC(); c[k] = v; persist(); if (soft) covPrevSoon(); else { renderEditora(); } }
function covPick(k) { const c = covC(), l = COV_LAYOUTS[k]; c.layout = k; c.head = l.head; c.body = l.body; if (l.pal && !cov.keepPal) c.pal = Object.assign({}, l.pal); persist(); renderEditora(); }
function covPal(i) { covC().pal = Object.assign({}, COV_PALS[i][1]); persist(); renderEditora(); }
function covPalSet(k, v) { covC().pal[k] = v; persist(); covPrevSoon(); }
function covWrapOpen() { const c = covC(); c.mode = 'wrap'; persist(); if (eui.id) bookTab('capa'); else bookGoTab('capa'); }
function covPickImg() { dtpFilePick(r => { covC().imgId = r.id; persist(); renderEditora(); }); }
async function covCreate() {
  const p = curProject(), c = covC(), b = covBuild(c, c.mode), set = {id: uid('ds'), name: (c.mode === 'wrap' ? 'Capa completa · ' : 'Capa · ') + (c.title || 'livro'), format: {id: 'custom', w: b.W, h: b.H}, tk: Object.assign(brandTokens(p), {name: 'Capa', bg: b.bg, fg: c.pal.fg, accent: c.pal.accent, head: {family: c.head, weight: 700}, body: {family: c.body, weight: 400}}), slides: [{id: sid(), name: 'Capa', bg: b.bg, layers: b.layers}], created: new Date().toISOString(), updated: new Date().toISOString()};
  await covFontsAndImgs(set); p.design.sets.push(set); c.setId = set.id; const eb = ebCur(); if (eb) { if (c.mode !== 'wrap') eb.coverSetId = set.id; eb.cover = c; dz.pendingFrom = eb.id; } persist(); toast('Capa criada e ligada ao e-book. Refine no Editor de Design e volte pelo botão Voltar ao e-book.'); go('design'); dzOpen(set.id);
}
async function covRenderSetBlob(setId, maxW, type, q) {
  const p = curProject(), set = p.design.sets.find(s => s.id === setId); if (!set) throw new Error('A capa não existe mais. Crie de novo.'); await ensureSetResources(set); await ensureFonts(set.slides[0].layers.filter(l => l.type === 'text').map(l => l.family));
  const W = set.format.w, H = set.format.h, s = maxW ? Math.min(1, maxW / W) : 1, cv = document.createElement('canvas'); cv.width = Math.round(W * s); cv.height = Math.round(H * s); const x = cv.getContext('2d'); renderSlide(x, set.slides[0], W, H, s);
  return {cv, blob: await new Promise(r => cv.toBlob(r, type || 'image/png', q)), W, H};
}
function covOpenSet() { const eb = ebCur(); if (!eb || !eb.coverSetId) return; dz.pendingFrom = eb.id; go('design'); dzOpen(eb.coverSetId); }

/* ---------- exportações ---------- */
async function covExportWrap() {
  const c = covC(); toast('Gerando a capa completa…');
  try { const r = await covRenderSetBlob(c.setId, 0, 'image/jpeg', 0.92), calc = kdpCalc(kdpK(), kdpPages()), buf = new Uint8Array(await r.blob.arrayBuffer());
    download(`${dtpFileName({name: c.title || 'livro'})}-capa-completa-kdp.pdf`, buildPDF([{jpeg: buf, w: r.cv.width, h: r.cv.height, pw: calc.wrapW * 72, ph: calc.wrapH * 72}], calc.wrapW * 72, calc.wrapH * 72), 'application/pdf'); toast('Capa completa baixada (' + r.cv.width + ' × ' + r.cv.height + ' px).'); } catch (e) { toast('Falhou: ' + e.message); }
}
async function covExportKindle() {
  const c = covC(); try { const r = await covRenderSetBlob(c.setId, 0, 'image/png'); const cv = document.createElement('canvas'); cv.height = 2560; cv.width = 1600; const x = cv.getContext('2d'); x.fillStyle = c.pal.bg; x.fillRect(0, 0, 1600, 2560); const s = Math.min(1600 / r.cv.width, 2560 / r.cv.height); x.drawImage(r.cv, (1600 - r.cv.width * s) / 2, (2560 - r.cv.height * s) / 2, r.cv.width * s, r.cv.height * s); cv.toBlob(b => download(`${dtpFileName({name: c.title || 'livro'})}-capa-kindle.jpg`, b, 'image/jpeg'), 'image/jpeg', 0.92); toast('Capa do Kindle baixada.'); } catch (e) { toast('Falhou: ' + e.message); }
}
async function covMockupDown() {
  const c = covC(), b = covBuild(c, c.mode === 'wrap' ? 'front' : c.mode), set = {id: 'cov-m', format: {id: 'custom', w: b.W, h: b.H}, tk: {}, slides: [{id: 'p', name: 'p', bg: b.bg, layers: b.layers}]}; await covFontsAndImgs(set);
  const cv = document.createElement('canvas'); cv.width = cv.height = 1600; const x = cv.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 1600); g.addColorStop(0, '#EDEBE6'); g.addColorStop(0.72, '#D9D5CC'); g.addColorStop(0.72, '#C9A878'); g.addColorStop(1, '#B38F5E'); x.fillStyle = g; x.fillRect(0, 0, 1600, 1600);
  const bh = 1180, bw = Math.round(bh * b.W / b.H), bx = (1600 - bw) / 2 + 20, by = 190, sp = 38;
  x.fillStyle = 'rgba(0,0,0,.28)'; x.filter = 'blur(26px)'; x.beginPath(); x.ellipse(bx + bw / 2, by + bh + 8, bw * 0.62, 36, 0, 0, 7); x.fill(); x.filter = 'none';
  const t = document.createElement('canvas'); t.width = b.W; t.height = b.H; renderSlide(t.getContext('2d'), set.slides[0], b.W, b.H, 1); x.drawImage(t, bx, by, bw, bh);
  const sg = x.createLinearGradient(bx - sp, 0, bx, 0); sg.addColorStop(0, 'rgba(0,0,0,.55)'); sg.addColorStop(1, 'rgba(0,0,0,.18)'); x.fillStyle = c.pal.bg; x.fillRect(bx - sp, by + 4, sp, bh - 8); x.fillStyle = sg; x.fillRect(bx - sp, by + 4, sp, bh - 8);
  const hl = x.createLinearGradient(bx, 0, bx + bw, 0); hl.addColorStop(0, 'rgba(255,255,255,.18)'); hl.addColorStop(0.08, 'rgba(255,255,255,0)'); hl.addColorStop(1, 'rgba(0,0,0,.12)'); x.fillStyle = hl; x.fillRect(bx, by, bw, bh);
  cv.toBlob(bl => download(`${dtpFileName({name: c.title || 'livro'})}-mockup.png`, bl, 'image/png'), 'image/png'); toast('Mockup baixado.');
}

/* ---------- IA: sugestões de conceito ---------- */
async function covConcepts() {
  const c = covC(), M = motM(); cov.busy = 'con'; renderEditora();
  try {
    const j = await motJSON('Você é diretor(a) de arte de capas de livros. Pense no mercado editorial brasileiro.', `Livro: ${c.title || M.title || '(sem título)'}${c.subtitle ? ' — ' + c.subtitle : ''}. Autor(a): ${c.author || M.author}. Tema: ${M.idea || '(não informado)'}. Público: ${M.audience || '(não informado)'}.\nProponha 3 conceitos de capa diferentes. JSON: {"concepts":[{"name":"...","why":"1 frase","layout":"${Object.keys(COV_LAYOUTS).join('|')}","palette":{"bg":"#RRGGBB","fg":"#RRGGBB","accent":"#RRGGBB","second":"#RRGGBB"},"head":"fonte","body":"fonte","imageBrief":"descrição da imagem ideal"}]}. Fontes só da lista: ${dtpFontList().slice(0, 70).join(', ')}.`, 2500);
    const fl = dtpFontList(), hex = (v, d) => /^#[0-9a-f]{6}$/i.test(String(v)) ? String(v).toUpperCase() : d;
    cov.concepts = (j.concepts || []).slice(0, 3).map(k => ({name: String(k.name || 'Conceito').slice(0, 60), why: String(k.why || '').slice(0, 200), imageBrief: String(k.imageBrief || '').slice(0, 240), layout: COV_LAYOUTS[k.layout] ? k.layout : 'giant', pal: {bg: hex(k.palette && k.palette.bg, c.pal.bg), fg: hex(k.palette && k.palette.fg, c.pal.fg), accent: hex(k.palette && k.palette.accent, c.pal.accent), second: hex(k.palette && k.palette.second, c.pal.second)}, head: fl.includes(k.head) ? k.head : COV_LAYOUTS[k.layout] ? COV_LAYOUTS[k.layout].head : c.head, body: fl.includes(k.body) ? k.body : c.body}));
  } catch (e) { toast(motErr(e)); }
  cov.busy = ''; renderEditora();
}
function covApplyConcept(i) { const k = cov.concepts[i], c = covC(); if (!k) return; Object.assign(c, {layout: k.layout, pal: k.pal, head: k.head, body: k.body}); persist(); renderEditora(); toast('Conceito aplicado. Suba a imagem sugerida na foto de fundo.'); }

/* miniaturas dos layouts de capa (com a paleta e as fontes de cada um) */
async function covThumbs() {
  const cvs = [...document.querySelectorAll('canvas[data-cl]')], my = ++cov.TT; await ensureFonts(Object.values(COV_LAYOUTS).flatMap(l => [l.head, l.body]));
  for (const cv of cvs) { if (my !== cov.TT || !cv.isConnected) return; const l = COV_LAYOUTS[cv.dataset.cl], f = {title: 'Título do livro', subtitle: 'Subtítulo de exemplo', author: 'Nome do Autor', collection: 'Editora', tagline: 'Autor de outro livro', pal: l.pal || covC().pal, head: l.head, body: l.body, imgId: ''}, R = {x: 0, y: 0, w: 1600, h: 2400}; R.full = R;
    try { const x = cv.getContext('2d'), sl = {id: 't', name: 't', bg: f.pal.bg, layers: l.build(f, R)}; LAYOUT_PREVIEW = true; try { renderSlide(x, sl, 1600, 2400, cv.width / 1600); } finally { LAYOUT_PREVIEW = false; } } catch (e) { console.warn('thumb', e); } await new Promise(r => setTimeout(r, 0)); }
}
cov.TT = 0; cov.keepPal = false; cov.gal = 'Todos';
/* os modelos de layout da galeria (73) aplicados à capa: um clique cria a peça com os textos do livro e as cores da paleta */
function covGalTokens() { const p = curProject(), c = covC(), tk = JSON.parse(JSON.stringify(lyTokens(p, 'neutral'))); Object.assign(tk, {bg: c.pal.bg, fg: c.pal.fg, accent: c.pal.accent, second: c.pal.second, muted: c.pal.fg}); tk.head = {family: c.head, weight: 700}; tk.body = {family: c.body, weight: 400}; return tk; }
function covGalCopy(lay) { const c = covC(), copy = {}; lay.fields.forEach(k => { const sm = Array.isArray(lay.sample[k]) ? lay.sample[k].join('\n') : (lay.sample[k] || ''); copy[k] = k === 'title' ? (c.title || sm) : k === 'sub' ? (c.subtitle || sm) : k === 'kicker' ? (c.collection || sm) : k === 'handle' ? (c.author || sm) : k === 'button' ? (c.tagline || 'Leia agora') : sm; }); return copy; }
function covGalBody() { const l = LAYOUTS.filter(x => cov.gal === 'Todos' || x.group === cov.gal); return `<div class="tchips">${['Todos', ...LAYOUT_GROUPS].map(g => `<button class="tchip ${cov.gal === g ? 'on' : ''}" onclick="covGalGroup('${g}')">${g}</button>`).join('')}</div><div class="ly-grid start-lay">${l.map(x => `<article class="ly-card" onclick="covFromGallery('${x.id}')"><canvas data-cg="${x.id}" width="150" height="225"></canvas><strong>${esc(x.name)}</strong></article>`).join('')}</div>`; }
function covGalGroup(g) { cov.gal = g; const b = document.querySelector('#acc-covg-gal .lg-acc-b'); if (b) { b.innerHTML = covGalBody(); covGalPaint(); } }
async function covGalPaint() {
  const cvs = [...document.querySelectorAll('canvas[data-cg]')]; if (!cvs.length) return; const my = ++cov.GT, tk = covGalTokens(); await ensureFonts(lyFamilies(tk)); const fmt = resolveFmt({fmt: 'custom', cw: 1200, ch: 1800}); let n = 0;
  for (const cv of cvs) { if (my !== cov.GT || !cv.isConnected) return; try { const lay = layoutById(cv.dataset.cg), s = buildLayoutSlide(lay, tk, covGalCopy(lay), fmt, curProject().name); LAYOUT_PREVIEW = true; try { renderSlide(cv.getContext('2d'), s, fmt.w, fmt.h, cv.width / fmt.w); } finally { LAYOUT_PREVIEW = false; } } catch (e) { console.warn('gal', e); } if (++n % 5 === 0) await new Promise(r => setTimeout(r, 0)); }
}
cov.GT = 0;
async function covFromGallery(id) {
  const p = curProject(), c = covC(), lay = layoutById(id); if (!lay) return; toast('Abrindo o layout na capa…'); const tk = covGalTokens(), fmt = resolveFmt({fmt: 'custom', cw: 1200, ch: 1800});
  try { await ensureFonts(lyFamilies(tk)); const copy = covGalCopy(lay), set = layoutSetFrom(lay, tk, copy, fmt, p.name, 'Capa · ' + lay.name + ' · ' + (c.title || p.name)); set.slides[0] = buildLayoutSlide(lay, tk, copy, fmt, p.name); await ensureSetResources(set); p.design.sets.push(set); c.setId = set.id; const eb = ebCur(); if (eb) { eb.coverSetId = set.id; dz.pendingFrom = eb.id; } persist(); go('design'); dzOpen(set.id); toast('Capa criada a partir do layout. Edite os textos e a imagem.'); } catch (e) { toast('Não consegui abrir: ' + e.message); }
}
