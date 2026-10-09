/* Motor do Estúdio de Design: modelo de peça, layout de texto com destaque por palavra, render em canvas,
   geração de carrossel a partir de um estilo, extração/aplicação de estilo e exportação (PNG e ZIP). */
/* Catálogo de formatos. Medidas conforme as plataformas publicam hoje; elas mudam, então confira antes de produzir em escala. */
const FORMAT_GROUPS = [
  ['Instagram', [
    ['feed45', 'Feed 4:5', 1080, 1350], ['square', 'Feed quadrado 1:1', 1080, 1080], ['ig34', 'Feed 3:4 (grade nova)', 1080, 1440],
    ['iglandscape', 'Feed paisagem 1.91:1', 1080, 566], ['story', 'Stories / Reels 9:16', 1080, 1920], ['igprofile', 'Foto de perfil', 320, 320]]],
  ['Anúncios Meta (Facebook + Instagram)', [
    ['adsquare', 'Feed 1:1', 1080, 1080], ['ad45', 'Feed 4:5', 1080, 1350], ['adstory', 'Stories / Reels 9:16', 1080, 1920],
    ['adlink', 'Link / paisagem 1.91:1', 1200, 628], ['adcarousel', 'Carrossel 1:1', 1080, 1080], ['admarket', 'Marketplace 1:1', 1080, 1080]]],
  ['Apresentação', [['deck', 'Slide 16:9', 1920, 1080]]],
  ['Capas e banners de redes', [
    ['fbcover', 'Facebook · capa da página', 851, 315, 'No celular a capa é cortada nas laterais: mantenha o texto no centro.'], ['fbevent', 'Facebook · capa de evento', 1920, 1005],
    ['fbpost', 'Facebook · post com link', 1200, 630], ['ytbanner', 'YouTube · banner do canal', 2560, 1440, 'Só a faixa central (1546×423) aparece em todos os aparelhos: o texto fica nela.', {w: 1546, h: 423}],
    ['ytthumb', 'YouTube · miniatura', 1280, 720], ['lipersonal', 'LinkedIn · capa pessoal', 1584, 396], ['licompany', 'LinkedIn · capa da empresa', 1128, 191],
    ['xheader', 'X · capa do perfil', 1500, 500], ['xpost', 'X · post com imagem 16:9', 1600, 900], ['pin', 'Pinterest · pin 2:3', 1000, 1500]]]
];
const FORMATS = {};
FORMAT_GROUPS.forEach(([g, list]) => list.forEach(([id, name, w, h, note, safe]) => { FORMATS[id] = {id, group: g, label: name + ' · ' + w + '×' + h, name, w, h, note: note || '', safe: safe || null}; }));
const customFormat = (w, h) => { w = Math.max(64, Math.min(4096, Math.round(+w) || 1080)); h = Math.max(64, Math.min(4096, Math.round(+h) || 1080)); return {id: 'custom', group: 'Personalizado', label: 'Personalizado · ' + w + '×' + h, name: 'Personalizado', w, h, note: '', safe: null}; };
/* o: {fmt, cw, ch} → objeto de formato */
const resolveFmt = o => o.fmt === 'custom' ? customFormat(o.cw, o.ch) : (FORMATS[o.fmt] || FORMATS.feed45);
const fmtOptions = sel => FORMAT_GROUPS.map(([g, list]) => `<optgroup label="${g}">${list.map(([id, name, w, h]) => `<option value="${id}" ${id === sel ? 'selected' : ''}>${name} · ${w}×${h}</option>`).join('')}</optgroup>`).join('') + `<optgroup label="Livre"><option value="custom" ${sel === 'custom' ? 'selected' : ''}>Personalizado… (digite as medidas)</option></optgroup>`;
/* seletor completo (lista + medidas livres). who = 'cmp' ou 'vf' (estado em dz) */
function fmtPicker(who, o) {
  const f = resolveFmt(o);
  return `<select onchange="dzFmtPick('${who}','fmt',this.value)">${fmtOptions(o.fmt)}</select>` +
    (o.fmt === 'custom' ? `<div class="ins-row" style="margin-top:6px"><label class="ins">Largura (px)<input type="number" min="64" max="4096" value="${f.w}" onchange="dzFmtPick('${who}','cw',this.value)"></label><label class="ins">Altura (px)<input type="number" min="64" max="4096" value="${f.h}" onchange="dzFmtPick('${who}','ch',this.value)"></label></div>` : '') +
    (f.note ? `<small class="muted block">${f.note}</small>` : '');
}

/* ---- fontes (Google Fonts, carregadas sob demanda) ---- */
const FONTS_LOADED = new Set();
function ensureFont(family) {
  if (typeof MYFONT_SET !== 'undefined' && MYFONT_SET.has(family)) return Promise.race([myFontLoad(family), new Promise(r => setTimeout(r, 4000))]);
  if (!family || FONTS_LOADED.has(family) || !(family in FONT_META)) return Promise.resolve();
  FONTS_LOADED.add(family);
  const w = FONT_META[family], link = document.createElement('link');
  link.rel = 'stylesheet'; link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}${w ? ':wght@' + w : ''}&display=swap`;
  document.head.appendChild(link);
  const ready = new Promise(res => { link.onload = res; link.onerror = res; }).then(() => Promise.all([400, 700].map(wt => document.fonts.load(`${wt} 40px "${family}"`).catch(() => 0))));
  return Promise.race([ready, new Promise(r => setTimeout(r, 2500))]);
}
const ensureFonts = fams => Promise.all([...new Set(fams)].map(ensureFont));
const fontStack = f => `"${f}", system-ui, -apple-system, "Segoe UI", sans-serif`;

/* ---- cores ---- */
const hex2rgb = h => { h = String(h || '#000000').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h.slice(0, 6), 16) || 0; return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const lum = h => { const [r, g, b] = hex2rgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const readable = h => lum(h) > 0.4 ? '#111111' : '#ffffff';
const mixHex = (a, b, t) => { const x = hex2rgb(a), y = hex2rgb(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join(''); };

/* ---- texto: **palavra** marca destaque; \n quebra de linha; L.spans formata trechos (letras ou palavras) ----
   Posições (s,e) dos trechos são índices no texto "limpo" (sem os ** dos destaques). */
function parseText(content) {
  let ord = 0, pos = 0;
  return String(content || '').split('\n').map(par => {
    const words = [], re = /\*\*([^*]+)\*\*|([^*]+|\*)/g; let m;
    while ((m = re.exec(par))) {
      const em = m[1] !== undefined, seg = em ? m[1] : m[2], tk = /\S+|\s+/g; let t;
      while ((t = tk.exec(seg))) { if (/^\s/.test(t[0])) pos += t[0].length; else { words.push({t: t[0], em, ord: ord++, s: pos, e: pos + t[0].length}); pos += t[0].length; } }
    }
    pos += 1; return words;
  });
}
const plainOf = c => String(c || '').split('\n').map(par => par.replace(/\*\*([^*]+)\*\*/g, '$1')).join('\n');
/* índice no texto do <textarea> (com **) → índice no texto limpo */
function rawToPlain(content, idx) {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)); let removed = 0, off = 0;
  for (const par of String(content || '').split('\n')) {
    const re = /\*\*([^*]+)\*\*/g; let m;
    while ((m = re.exec(par))) { const a = off + m.index, b = a + m[0].length; removed += clamp(idx - a, 0, 2) + clamp(idx - (b - 2), 0, 2); }
    off += par.length + 1;
  }
  return Math.max(0, idx - removed);
}
function serializeText(paras) {
  return paras.map(words => { const out = []; let i = 0; while (i < words.length) { if (words[i].em) { const g = []; while (i < words.length && words[i].em) g.push(words[i++].t); out.push('**' + g.join(' ') + '**'); } else out.push(words[i++].t); } return out.join(' '); }).join('\n');
}
function toggleWordEm(content, ord) { const paras = parseText(content); paras.forEach(p => p.forEach(w => { if (w.ord === ord) w.em = !w.em; })); return serializeText(paras); }

/* estilo por caractere: junta os trechos (o último sobrepõe) */
const SPAN_KEYS = ['size', 'color', 'family', 'weight', 'tr', 'italic'];
function spanStyles(L, n) {
  if (!L.spans || !L.spans.length) return null; const arr = new Array(n).fill(null);
  L.spans.forEach(sp => { for (let i = Math.max(0, sp.s); i < Math.min(n, sp.e); i++) arr[i] = Object.assign({}, arr[i] || {}, sp.st); });
  return arr;
}
/* grava estilos por caractere de volta como trechos compactos */
function spansFromStyles(arr) {
  const out = []; let cur = null;
  const same = (a, b) => (!a && !b) || (a && b && SPAN_KEYS.every(k => a[k] === b[k]));
  arr.forEach((st, i) => { if (st && !Object.keys(st).length) st = null; if (cur && same(cur.st, st)) cur.e = i + 1; else { cur = st ? {s: i, e: i + 1, st: Object.assign({}, st)} : null; if (cur) out.push(cur); } });
  return out;
}
/* aplica props (valor undefined/'' remove a propriedade) ao trecho [s,e) */
function applySpanProps(L, s, e, props) {
  const n = plainOf(L.content).length, arr = spanStyles(L, n) || new Array(n).fill(null);
  s = Math.max(0, Math.min(n, s)); e = Math.max(s, Math.min(n, e));
  for (let i = s; i < e; i++) { const st = Object.assign({}, arr[i] || {}); Object.keys(props).forEach(k => { if (props[k] === undefined || props[k] === '' || props[k] === null) delete st[k]; else st[k] = props[k]; }); arr[i] = Object.keys(st).length ? st : null; }
  L.spans = spansFromStyles(arr); if (!L.spans.length) delete L.spans;
}
/* texto mudou: desloca os trechos conforme a parte alterada */
function remapSpans(oldPlain, newPlain, spans) {
  if (!spans || !spans.length) return spans; let p = 0; const mx = Math.min(oldPlain.length, newPlain.length);
  while (p < mx && oldPlain[p] === newPlain[p]) p++;
  let q = 0; while (q < mx - p && oldPlain[oldPlain.length - 1 - q] === newPlain[newPlain.length - 1 - q]) q++;
  const oe = oldPlain.length - q, d = newPlain.length - oldPlain.length, out = [];
  spans.forEach(sp => { let s = sp.s, e = sp.e; if (e <= p) { out.push({...sp}); return; } if (s >= oe) { out.push({...sp, s: s + d, e: e + d}); return; } s = Math.min(s, p); e = Math.max(s, e + d); e = Math.min(e, newPlain.length); if (e > s) out.push({...sp, s, e}); });
  return out;
}

const MEAS = document.createElement('canvas').getContext('2d');
const LBOX = {};   // caixas calculadas na última renderização (hit-test e destaque por clique)
const fontOf = (family, size, weight, italic) => `${italic ? 'italic ' : ''}${weight} ${size}px ${fontStack(family)}`;
const fontStr = (L, size, weight) => fontOf(L.family, size, weight);
const emFont = L => L.emMode === 'bold' ? {size: L.size, weight: Math.min(900, (+L.weight || 400) + 300)} : L.emMode === 'scale' ? {size: L.size * (L.emScale || 1.25), weight: L.weight} : {size: L.size, weight: L.weight};
const trText = (txt, tr, upper, atWordStart) => { const t = tr || (upper ? 'upper' : ''); return t === 'upper' ? txt.toUpperCase() : t === 'lower' ? txt.toLowerCase() : t === 'title' ? (atWordStart ? txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase() : txt.toLowerCase()) : txt; };
function layoutText(L, ctx) {
  ctx = ctx || MEAS;
  const lines = [], ls = +L.ls || 0, pad = L.emMode === 'bg' ? 12 : 0, paras = parseText(L.content), plainLen = plainOf(L.content).length, sty = spanStyles(L, plainLen);
  if (ctx.letterSpacing !== undefined) ctx.letterSpacing = ls + 'px';
  const space = () => { ctx.font = fontStr(L, L.size, L.weight); return ctx.measureText(' ').width + ls; };
  /* uma palavra vira trechos (runs) com o mesmo estilo; sem formatação é um trecho só */
  const buildRuns = (wd) => {
    const runs = [], text = wd.t, key = i => { const st = sty && sty[wd.s + i]; return st ? JSON.stringify(st) : ''; };
    let a = 0; for (let i = 1; i <= text.length; i++) if (i === text.length || key(i) !== key(a)) { runs.push({a, b: i, st: sty && sty[wd.s + a] || null}); a = i; }
    return runs.map(r => {
      const st = r.st || {}, base = wd.em ? emFont(L) : {size: L.size, weight: L.weight};
      const size = (st.size || L.size) * (wd.em && L.emMode === 'scale' ? (L.emScale || 1.25) : 1), weight = st.weight || (wd.em && L.emMode === 'bold' ? base.weight : L.weight), family = st.family || L.family, italic = !!st.italic;
      const txt = trText(text.slice(r.a, r.b), st.tr, L.upper, r.a === 0); ctx.font = fontOf(family, size, weight, italic);
      return {t: txt, w: ctx.measureText(txt).width, size, weight, family, italic, color: st.color || '', font: ctx.font, s: wd.s + r.a, e: wd.s + r.b};
    });
  };
  paras.forEach(words => {
    let cur = {words: [], w: 0, maxSize: L.size};
    if (!words.length) { lines.push(cur); return; }
    words.forEach(wd => {
      const runs = buildRuns(wd), p = wd.em ? pad : 0, ww = runs.reduce((a, r) => a + r.w, 0) + p * 2, sp = cur.words.length ? space() : 0, msz = Math.max(...runs.map(r => r.size));
      if (cur.words.length && cur.w + sp + ww > L.w) { lines.push(cur); cur = {words: [], w: 0, maxSize: L.size}; }
      const x = cur.words.length ? cur.w + space() : 0;
      cur.words.push({t: runs.map(r => r.t).join(''), em: wd.em, x, w: ww, pad: p, size: msz, weight: runs[0].weight, ord: wd.ord, s: wd.s, e: wd.e, runs}); cur.w = x + ww; cur.maxSize = Math.max(cur.maxSize, msz);
    });
    lines.push(cur);
  });
  let y = 0;
  lines.forEach(l => { l.h = l.maxSize * (L.lh || 1.2); l.y = y; y += l.h; l.off = L.align === 'center' ? (L.w - l.w) / 2 : L.align === 'right' ? (L.w - l.w) : 0; });
  return {lines, h: Math.max(y, L.size)};
}
function rr(ctx, x, y, w, h, r) { r = Math.max(0, Math.min(r || 0, w / 2, h / 2)); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

function drawText(ctx, L) {
  const lay = layoutText(L, ctx), words = [];
  ctx.save(); ctx.globalAlpha = L.opacity == null ? 1 : L.opacity; ctx.textBaseline = 'alphabetic';
  if (L.blur && 'filter' in ctx) ctx.filter = `blur(${L.blur}px)`;
  if (ctx.letterSpacing !== undefined) ctx.letterSpacing = (+L.ls || 0) + 'px';
  lay.lines.forEach(l => {
    const base = L.y + l.y + (l.h - l.maxSize) / 2 + l.maxSize * 0.82;
    l.words.forEach(w => {
      const x = L.x + l.off + w.x;
      if (w.em && L.emMode === 'bg') { ctx.fillStyle = L.emBg; rr(ctx, x, base - w.size * 0.86, w.w, w.size * 1.12, 10); ctx.fill(); }
      let cx = x + w.pad; const rb = [];
      w.runs.forEach(r => {
        ctx.font = r.font; ctx.fillStyle = r.color || (w.em ? (L.emMode === 'bg' ? (L.emText || '#000') : (L.emColor || L.color)) : L.color); ctx.fillText(r.t, cx, base);
        rb.push({x: cx, w: r.w, s: r.s, e: r.e, font: r.font, t: r.t}); cx += r.w;
      });
      if (w.em && L.emMode === 'underline') ctx.fillRect(x, base + w.size * 0.1, w.w, Math.max(4, w.size * 0.06));
      words.push({x, y: L.y + l.y, w: w.w, h: l.h, ord: w.ord, s: w.s, e: w.e, runs: rb});
    });
  });
  ctx.restore(); LBOX[L.id] = {x: L.x, y: L.y, w: L.w, h: lay.h, words}; return lay;
}
/* formas: retângulo (com cantos), elipse e arco (janela com topo redondo) */
function shapePath(ctx, L) {
  if (L.shape === 'ellipse') { ctx.beginPath(); ctx.ellipse(L.x + L.w / 2, L.y + L.h / 2, L.w / 2, L.h / 2, 0, 0, Math.PI * 2); }
  else if (L.shape === 'arch') { const r = L.w / 2; ctx.beginPath(); ctx.moveTo(L.x, L.y + L.h); ctx.lineTo(L.x, L.y + r); ctx.arc(L.x + r, L.y + r, r, Math.PI, 0); ctx.lineTo(L.x + L.w, L.y + L.h); ctx.closePath(); }
  else rr(ctx, L.x, L.y, L.w, L.h, L.radius);
}
let GRAIN_PAT = null;
function grainFill(ctx) {
  if (!GRAIN_PAT) { const c = document.createElement('canvas'); c.width = c.height = 160; const x = c.getContext('2d'), d = x.createImageData(160, 160); let s = 7; for (let i = 0; i < d.data.length; i += 4) { s = (s * 16807) % 2147483647; const v = s % 256; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); GRAIN_PAT = ctx.createPattern(c, 'repeat'); }
  return GRAIN_PAT;
}
function drawRect(ctx, L) {
  ctx.save(); ctx.globalAlpha = L.opacity == null ? 1 : L.opacity; shapePath(ctx, L);
  if (L.grad) { const a = (L.grad.a || 0) * Math.PI / 180, cx = L.x + L.w / 2, cy = L.y + L.h / 2, d = Math.abs(L.w * Math.sin(a)) / 2 + Math.abs(L.h * Math.cos(a)) / 2, g = ctx.createLinearGradient(cx - Math.sin(a) * d, cy + Math.cos(a) * d, cx + Math.sin(a) * d, cy - Math.cos(a) * d); g.addColorStop(0, L.grad.c1); g.addColorStop(1, L.grad.c2); ctx.fillStyle = g; ctx.fill(); }
  else if (L.fill) { ctx.fillStyle = L.fill; ctx.fill(); }
  if (L.grain) { ctx.save(); ctx.clip(); ctx.globalAlpha = (L.opacity == null ? 1 : L.opacity) * L.grain; ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = grainFill(ctx); ctx.fillRect(L.x, L.y, L.w, L.h); ctx.restore(); }
  if (L.stroke && L.strokeW) { ctx.lineWidth = L.strokeW; ctx.strokeStyle = L.stroke; ctx.stroke(); } ctx.restore();
}
const IMGS = new Map();   // imgId → ImageBitmap
function drawImageLayer(ctx, L, slide) {
  if (L.plate) { const m = Math.min(L.w, L.h), pd = (L.platePad == null ? 0.14 : L.platePad) * m; ctx.save(); ctx.globalAlpha = 1; ctx.fillStyle = L.plate; rr(ctx, L.x - pd, L.y - pd, L.w + 2 * pd, L.h + 2 * pd, (L.plateR == null ? 0.2 : L.plateR) * m); ctx.fill(); ctx.restore(); }
  ctx.save(); shapePath(ctx, L); ctx.clip(); ctx.globalAlpha = L.opacity == null ? 1 : L.opacity;
  const img = L.imgId && IMGS.get(L.imgId);
  if (img) {
    const r = (L.fit === 'contain' ? Math.min : Math.max)(L.w / img.width, L.h / img.height), dw = img.width * r, dh = img.height * r;
    if (L.filter && 'filter' in ctx) ctx.filter = L.filter;
    ctx.drawImage(img, L.x + (L.w - dw) * (L.fx == null ? 0.5 : L.fx), L.y + (L.h - dh) * (L.fy == null ? 0.5 : L.fy), dw, dh); ctx.filter = 'none';
    if (L.ovColor) { ctx.globalCompositeOperation = L.ovMode || 'source-over'; ctx.fillStyle = L.ovColor; ctx.fillRect(L.x, L.y, L.w, L.h); }
  } else if (LAYOUT_PREVIEW) placeholderArt(ctx, L);
  else {
    const g = ctx.createLinearGradient(L.x, L.y, L.x + L.w, L.y + L.h); g.addColorStop(0, 'rgba(120,120,130,0.28)'); g.addColorStop(1, 'rgba(120,120,130,0.12)');
    ctx.fillStyle = g; ctx.fillRect(L.x, L.y, L.w, L.h); ctx.setLineDash([14, 10]); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(120,120,130,0.55)'; ctx.strokeRect(L.x + 12, L.y + 12, L.w - 24, L.h - 24); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(90,90,100,0.9)'; ctx.textAlign = 'center'; ctx.font = `700 ${Math.max(26, Math.min(44, L.w / 18))}px ${fontStack('Inter')}`; ctx.fillText(L.role === 'cutout' ? 'SUJEITO' : 'FOTO', L.x + L.w / 2, L.y + L.h / 2 - 8);
    ctx.font = `400 ${Math.max(20, Math.min(30, L.w / 28))}px ${fontStack('Inter')}`;
    String(L.brief || 'Clique e envie uma foto').match(/.{1,46}(\s|$)/g).slice(0, 3).forEach((ln, i) => ctx.fillText(ln.trim(), L.x + L.w / 2, L.y + L.h / 2 + 34 + i * 32));
  }
  ctx.restore(); LBOX[L.id] = {x: L.x, y: L.y, w: L.w, h: L.h};
}
/* prévia da galeria: no lugar do cinza tracejado, uma silhueta para dar para julgar a composição */
let LAYOUT_PREVIEW = false;
function placeholderArt(ctx, L) {
  const x = L.x, y = L.y, w = L.w, h = L.h;
  if (L.role === 'cutout') {
    ctx.fillStyle = 'rgba(30,30,40,0.82)'; const hr = Math.min(w, h) * 0.17; ctx.beginPath(); ctx.arc(x + w / 2, y + h * 0.3, hr, 0, 7); ctx.fill();
    rr(ctx, x + w * 0.16, y + h * 0.3 + hr * 1.15, w * 0.68, h * 0.7, w * 0.22); ctx.fill(); return;
  }
  const g = ctx.createLinearGradient(x, y, x + w * 0.4, y + h); g.addColorStop(0, 'rgba(150,160,175,0.95)'); g.addColorStop(1, 'rgba(70,78,95,0.95)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.beginPath(); ctx.arc(x + w * 0.62, y + h * 0.38, Math.min(w, h) * 0.2, 0, 7); ctx.fill(); rr(ctx, x + w * 0.42, y + h * 0.58, w * 0.4, h * 0.6, w * 0.15); ctx.fill();
}
/* camada vetorial (símbolos de logo): d em viewBox 100×100, escalada para a caixa x,y,w,h */
function drawPathLayer(ctx, L) {
  ctx.save(); ctx.globalAlpha = L.opacity == null ? 1 : L.opacity; ctx.translate(L.x, L.y); ctx.scale(L.w / (L.vb || 100), L.h / (L.vb || 100));
  const p = new Path2D(L.d);
  if (L.fill && L.grad) { const vb = L.vb || 100, g = ctx.createLinearGradient(0, 0, vb, vb); g.addColorStop(0, L.fill); g.addColorStop(1, L.grad); ctx.fillStyle = g; ctx.fill(p, L.rule || 'nonzero'); }
  else if (L.fill) { ctx.fillStyle = L.fill; ctx.fill(p, L.rule || 'nonzero'); }
  if (L.stroke && L.strokeW) { ctx.lineWidth = L.strokeW; ctx.strokeStyle = L.stroke; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(p); }
  ctx.restore(); LBOX[L.id] = {x: L.x, y: L.y, w: L.w, h: L.h};
}
function drawVideoLayer(ctx, L) {
  const {x, y, w, h} = L, s = Math.min(w, h); ctx.save(); ctx.globalAlpha = L.opacity == null ? 1 : L.opacity;
  const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#20242c'); g.addColorStop(1, '#0c0e12'); ctx.fillStyle = g; rr(ctx, x, y, w, h, Math.min(24, s * 0.06)); ctx.fill();
  const cx = x + w / 2, cy = y + h / 2, r = s * 0.17; ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.moveTo(cx - r * 0.3, cy - r * 0.46); ctx.lineTo(cx - r * 0.3, cy + r * 0.46); ctx.lineTo(cx + r * 0.52, cy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = `600 ${Math.max(14, Math.round(s * 0.05))}px Inter, system-ui, sans-serif`; ctx.textBaseline = 'alphabetic'; ctx.fillText(String(L.name || 'Vídeo').slice(0, 60), x + s * 0.05, y + h - s * 0.05);
  ctx.restore(); LBOX[L.id] = {x, y, w, h};
}
function drawLayer(ctx, L) {
  if (L.hidden) return;
  const draw = () => { if (L.type === 'path') drawPathLayer(ctx, L); else if (L.type === 'text') drawText(ctx, L); else if (L.type === 'rect') { drawRect(ctx, L); LBOX[L.id] = {x: L.x, y: L.y, w: L.w, h: L.h}; } else if (L.type === 'image') drawImageLayer(ctx, L); else if (L.type === 'video') drawVideoLayer(ctx, L); };
  if (!L.rot) return draw();
  const h = L.type === 'text' ? layoutText(L).h : L.h, cx = L.x + L.w / 2, cy = L.y + h / 2;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(L.rot * Math.PI / 180); ctx.translate(-cx, -cy); draw(); ctx.restore();
}
function renderSlide(ctx, slide, W, H, scale) {
  const k = scale || 1; ctx.setTransform(k, 0, 0, k, 0, 0); ctx.clearRect(0, 0, W, H); if (!slide.noBg) { ctx.fillStyle = slide.bg || '#fff'; ctx.fillRect(0, 0, W, H); }
  slide.layers.forEach(L => drawLayer(ctx, L));
}

/* ---- imagens (IndexedDB 'images') ---- */
async function imgPut(id, blob) { const db = await idb(); return new Promise((res, rej) => { const t = db.transaction('images', 'readwrite'); t.objectStore('images').put(blob, id); t.oncomplete = res; t.onerror = () => rej(t.error); }); }
async function imgDel(id) { const db = await idb(); return new Promise((res, rej) => { const t = db.transaction('images', 'readwrite'); t.objectStore('images').delete(id); t.oncomplete = res; t.onerror = () => rej(t.error); }); }
async function imgGet(id) { const db = await idb(); return new Promise((res, rej) => { const q = db.transaction('images').objectStore('images').get(id); q.onsuccess = () => res(q.result || null); q.onerror = () => rej(q.error); }); }
async function loadImage(id) { if (!id || IMGS.has(id)) return; try { const b = await imgGet(id); if (b) IMGS.set(id, await createImageBitmap(b)); } catch (e) { /* sem imagem */ } }
async function ensureSetResources(set) {
  const fams = [], ids = [];
  set.slides.forEach(s => s.layers.forEach(L => { if (L.type === 'text') fams.push(L.family); if (L.type === 'image' && L.imgId) ids.push(L.imgId); }));
  await Promise.all([ensureFonts(fams), ...ids.map(loadImage), typeof brandFontsLoad === 'function' ? brandFontsLoad(curProject()) : 0]);
}

/* ---- construção de camadas ---- */
let LSEQ = 0;
const lid = () => 'L' + Date.now().toString(36) + (LSEQ++);
const sid = () => 'S' + Date.now().toString(36) + (LSEQ++);
const T = (role, o) => Object.assign({id: lid(), type: 'text', role, x: 0, y: 0, w: 900, content: '', family: 'Inter', size: 48, weight: 400, color: '#111111', align: 'left', lh: 1.2, ls: 0, upper: false, emMode: 'color', emColor: '#ff0000', emBg: '#ff0000', emText: '#000000', emScale: 1.25, opacity: 1}, o);
const RC = (role, o) => Object.assign({id: lid(), type: 'rect', role, x: 0, y: 0, w: 100, h: 100, fill: '#000000', radius: 0, opacity: 1, stroke: '', strokeW: 0}, o);
const IM = (role, o) => Object.assign({id: lid(), type: 'image', role, x: 0, y: 0, w: 100, h: 100, imgId: '', radius: 0, filter: '', ovColor: '', ovMode: '', brief: '', fx: 0.5, fy: 0.5, opacity: 1}, o);

/* tokens de estilo a partir das três bibliotecas (+ ajustes de paleta) */
function makeTokens(design, font, photo, over) {
  const em = {chip: 'bg', underline: 'underline', bar: 'color', none: 'color'}[design.mark] || 'color';
  return Object.assign({
    name: design.name + ' · ' + font.name, designId: design.id, fontId: font.id, photoId: photo.id,
    bg: design.bg, fg: design.fg, accent: design.accent, muted: design.muted,
    head: {family: font.head, weight: font.weight}, body: {family: font.body, weight: 400}, upper: design.upper, mark: design.mark, align: design.align, photoMode: design.photo, radius: design.radius,
    em: {mode: em}, photo: {filter: photo.filter, ovColor: photo.ovColor, ovMode: photo.ovMode, brief: photo.brief, name: photo.name}
  }, over || {});
}
/* aplica o estilo (por papel) a uma camada: é o que permite trocar o estilo de toda a campanha */
function themeLayer(L, tk, pal) {
  if (pal && L.pk && L.type !== 'image') return themePal(L, tk, pal);   // camadas de modelo de layout: cor por papel da paleta
  const onP = !!L.onPhoto, emT = readable(tk.accent), mode = tk.em.mode;
  if (L.type === 'text') {
    if (L.role === 'title') Object.assign(L, {family: tk.head.family, weight: tk.head.weight, color: onP ? '#ffffff' : tk.fg, upper: tk.upper, emMode: mode, emColor: tk.accent, emBg: tk.accent, emText: emT});
    else if (L.role === 'body') Object.assign(L, {family: tk.body.family, weight: tk.body.weight || 400, color: onP ? '#f2f2f2' : tk.fg, upper: false});
    else if (L.role === 'kicker') Object.assign(L, {family: tk.body.family, weight: 700, color: L.onChip ? readable(tk.accent) : (onP ? '#ffffff' : tk.accent), upper: true});
    else if (L.role === 'muted' || L.role === 'brand') Object.assign(L, {family: tk.body.family, color: onP ? '#e5e5e5' : tk.muted});
    else if (L.role === 'cta-text') Object.assign(L, {family: tk.head.family, weight: tk.head.weight, color: emT, upper: tk.upper});
  } else if (L.type === 'rect') {
    if (L.role === 'accent-fill' || L.role === 'cta-fill') L.fill = tk.accent;
    if (L.role === 'cta-fill') L.radius = Math.max(tk.radius, 0) ? tk.radius * 2 : 0;
    if (L.role === 'panel') L.fill = tk.second ? mixHex(tk.bg, tk.second, 0.16) : mixHex(tk.bg, tk.fg, 0.07);
  } else if (L.type === 'image' && L.role === 'photo') Object.assign(L, {filter: tk.photo.filter, ovColor: tk.photo.ovColor, ovMode: tk.photo.ovMode, brief: tk.photo.brief});
}
function themeSlide(slide, tk) { const pal = slide.pm && typeof palette === 'function' ? palette(tk, slide.pm) : null; slide.bg = pal ? pal.bg : tk.bg; slide.layers.forEach(L => themeLayer(L, tk, pal)); }
function applyStyleToSet(set, tk) { set.tk = tk; set.slides.forEach(s => themeSlide(s, tk)); }

/* empilha itens verticalmente, medindo o texto de verdade */
function stackPlace(items, x, w, y0, y1, valign, gap) {
  const hs = items.map(it => { if (it.group) return it.h; if (it.type === 'text') { it.x = x; it.w = it.w || w; return layoutText(it).h; } return it.h; });
  const total = hs.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
  let y = valign === 'bottom' ? y1 - total : valign === 'middle' ? y0 + Math.max(0, (y1 - y0 - total) / 2) : y0;
  items.forEach((it, i) => {
    if (it.group) it.group.forEach(g => { g.y = y + (g.dy || 0); g.x = x + (g.dx || 0); delete g.dy; delete g.dx; });
    else { it.y = y; if (it.type !== 'text') it.x = it.x == null ? x : it.x; if (it.type === 'text') it.x = x; }
    y += hs[i] + gap;
  });
}
function chipGroup(text, tk, onP) {
  const k = T('kicker', {content: text, size: 30, ls: 3, w: 900, onChip: true, onPhoto: onP}); themeLayer(k, tk);
  const lay = layoutText(Object.assign({}, k, {w: 4000})), tw = Math.ceil(lay.lines[0] ? lay.lines[0].w : 100);
  const box = RC('accent-fill', {w: tw + 56, h: Math.round(k.size * 1.9), radius: 999, fill: tk.accent}); k.w = tw + 8; k.dx = 28; k.dy = (box.h - k.size * 1.2) / 2;
  return {group: [box, k], h: box.h};
}
function autoEmphasis(title, strat) {
  if (/\*\*/.test(title) || strat === 'none') return title.replace(/\*\*/g, strat === 'none' ? '' : '**');
  const ws = title.split(/\s+/), cand = ws.map((w, i) => [w.replace(/[^\p{L}\p{N}]/gu, '').length, i]).filter(x => x[0] > 4).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  const pick = cand[strat === 'alt' && cand.length > 1 ? 1 : 0]; if (!pick) return title; ws[pick[1]] = '**' + ws[pick[1]] + '**'; return ws.join(' ');
}
const titleSize = (t, base) => { const n = t.replace(/\*/g, '').length; return n <= 22 ? base : n <= 40 ? Math.round(base * 0.86) : n <= 64 ? Math.round(base * 0.72) : Math.round(base * 0.6); };

function slideCover(tk, copy, fmt, brand, total) {
  const W = fmt.w, H = fmt.h, m = 90, cw = W - 2 * m, mode = tk.photoMode, onP = mode === 'full', layers = [];
  let y0 = m, y1 = H - m - 90, valign = 'middle';
  if (mode === 'full') { layers.push(IM('photo', {x: 0, y: 0, w: W, h: H}), RC('overlay', {x: 0, y: 0, w: W, h: H, fill: 'rgba(0,0,0,0.5)'})); valign = 'bottom'; }
  if (mode === 'top') { const ph = Math.round(H * 0.46); layers.push(IM('photo', {x: 0, y: 0, w: W, h: ph})); y0 = ph + 60; valign = 'top'; }
  if (mode === 'half') { const py = Math.round(H * 0.5), ph = H - m - 80 - py; layers.push(IM('photo', {x: m, y: py, w: cw, h: ph, radius: tk.radius})); y1 = py - 50; valign = 'bottom'; }
  const items = [], al = tk.align;
  if (copy.kicker) items.push(tk.mark === 'chip' ? chipGroup(copy.kicker, tk, onP) : T('kicker', {content: copy.kicker, size: 30, ls: 4, align: al, w: cw, onPhoto: onP}));
  if (tk.mark === 'bar') items.push(RC('accent-fill', {w: 130, h: 14, x: al === 'center' ? (W - 130) / 2 : m}));
  items.push(T('title', {content: autoEmphasis(copy.title), size: titleSize(copy.title, 124), lh: tk.upper ? 1.02 : 1.1, align: al, w: cw, onPhoto: onP}));
  if (tk.mark === 'underline') items.push(RC('accent-fill', {w: al === 'center' ? 220 : 160, h: 8, x: al === 'center' ? (W - 220) / 2 : m}));
  if (copy.sub) items.push(T('body', {content: copy.sub, size: 40, lh: 1.4, align: al, w: cw, onPhoto: onP}));
  items.forEach(it => { if (it.type === 'text') themeLayer(it, tk); else if (it.type === 'rect') themeLayer(it, tk); });
  if (al === 'center') items.forEach(it => { if (it.group) it.group.forEach(g => { if (g.type === 'text') { g.align = 'left'; } }); });
  stackPlace(items, m, cw, y0, y1, valign, 34);
  items.forEach(it => (it.group ? it.group : [it]).forEach(l => layers.push(l)));
  if (al === 'center') items.filter(it => it.group).forEach(it => { const b = it.group[0], t = it.group[1], shift = (W - b.w) / 2 - b.x; b.x += shift; t.x += shift; });
  layers.push(T('brand', {content: brand, size: 28, ls: 2, x: m, y: H - m - 34, w: 600, upper: true, onPhoto: onP}), T('muted', {content: total > 1 ? 'ARRASTE  →' : '', size: 28, ls: 3, x: W - m - 400, y: H - m - 34, w: 400, align: 'right', onPhoto: onP}));
  layers.slice(-2).forEach(l => themeLayer(l, tk));
  return {id: sid(), bg: tk.bg, layers};
}
function slideContent(tk, c, fmt, brand, idx, total) {
  const W = fmt.w, H = fmt.h, m = 90, cw = W - 2 * m, mode = tk.photoMode, layers = [], al = tk.align === 'center' ? 'center' : 'left';
  let y0 = m + 20, y1 = H - m - 90, onP = false;
  if (mode === 'full') { onP = true; layers.push(IM('photo', {x: 0, y: 0, w: W, h: H}), RC('overlay', {x: 0, y: 0, w: W, h: H, fill: 'rgba(0,0,0,0.55)'})); }
  else if (mode === 'top' || mode === 'half') { const ph = Math.round(H * 0.32); layers.push(IM('photo', {x: 0, y: 0, w: W, h: ph})); y0 = ph + 56; }
  const items = [];
  const num = String(idx).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
  items.push(tk.mark === 'chip' ? chipGroup(num, tk, onP) : T('kicker', {content: num, size: 30, ls: 4, align: al, w: cw, onPhoto: onP}));
  if (tk.mark === 'bar') items.push(RC('accent-fill', {w: 110, h: 12, x: al === 'center' ? (W - 110) / 2 : m}));
  items.push(T('title', {content: autoEmphasis(c.title), size: titleSize(c.title, 84), lh: tk.upper ? 1.04 : 1.12, align: al, w: cw, onPhoto: onP}));
  if (tk.mark === 'underline') items.push(RC('accent-fill', {w: 140, h: 7, x: al === 'center' ? (W - 140) / 2 : m}));
  if (c.body) items.push(T('body', {content: c.body, size: mode === 'none' ? 52 : 44, lh: 1.45, align: al, w: cw, onPhoto: onP}));
  items.forEach(it => { if (it.group) { /* chip já tematizado */ } else themeLayer(it, tk); });
  stackPlace(items, m, cw, y0, y1, mode === 'full' ? 'bottom' : mode === 'none' ? 'middle' : 'top', 38);
  items.forEach(it => (it.group ? it.group : [it]).forEach(l => layers.push(l)));
  if (al === 'center') items.filter(it => it.group).forEach(it => { const b = it.group[0], t = it.group[1], shift = (W - b.w) / 2 - b.x; b.x += shift; t.x += shift; });
  const f = [T('brand', {content: brand, size: 28, ls: 2, x: m, y: H - m - 34, w: 600, upper: true, onPhoto: onP}), T('muted', {content: idx + '/' + total, size: 28, ls: 3, x: W - m - 300, y: H - m - 34, w: 300, align: 'right', onPhoto: onP})];
  f.forEach(l => { themeLayer(l, tk); layers.push(l); });
  return {id: sid(), bg: tk.bg, layers};
}
function slideCta(tk, c, fmt, brand) {
  const W = fmt.w, H = fmt.h, m = 90, cw = W - 2 * m, layers = [], al = tk.align === 'center' ? 'center' : 'left', items = [];
  items.push(T('title', {content: autoEmphasis(c.title), size: titleSize(c.title, 100), lh: tk.upper ? 1.02 : 1.1, align: al, w: cw}));
  if (c.sub) items.push(T('body', {content: c.sub, size: 46, lh: 1.4, align: al, w: cw}));
  items.forEach(it => themeLayer(it, tk));
  const bw = Math.min(cw, 720), btn = RC('cta-fill', {w: bw, h: 128, fill: tk.accent}), bt = T('cta-text', {content: c.button || 'Fale com a gente', size: 46, align: 'center', w: bw - 40});
  themeLayer(btn, tk); themeLayer(bt, tk); bt.dx = 20; bt.dy = (128 - bt.size * 1.2) / 2; btn.dx = 0; btn.dy = 0;
  items.push({group: [btn, bt], h: 128});
  stackPlace(items, m, cw, m, H - m - 90, 'middle', 44);
  items.forEach(it => (it.group ? it.group : [it]).forEach(l => layers.push(l)));
  if (al === 'center') { const shift = (W - bw) / 2 - btn.x; btn.x += shift; bt.x += shift; }
  const f = [T('brand', {content: brand, size: 28, ls: 2, x: m, y: H - m - 34, w: 600, upper: true})]; f.forEach(l => { themeLayer(l, tk); layers.push(l); });
  return {id: sid(), bg: tk.bg, layers};
}
/* copy: {cover:{kicker,title,sub}, slides:[{title,body}], cta:{title,sub,button}} */
function buildSet(name, tk, copy, fmt, brand) {
  const total = copy.slides.length + 2, slides = [slideCover(tk, copy.cover, fmt, brand, total)];
  copy.slides.forEach((c, i) => slides.push(slideContent(tk, c, fmt, brand, i + 2, total)));
  slides.push(slideCta(tk, copy.cta, fmt, brand));
  return {id: uid('ds'), name, format: {id: fmt.id, w: fmt.w, h: fmt.h}, tk, slides, created: new Date().toISOString(), updated: new Date().toISOString()};
}

/* extrai o estilo do que está na tela (o que o usuário refinou à mão) para salvar e reutilizar */
function extractStyle(set) {
  const tk = JSON.parse(JSON.stringify(set.tk)), all = set.slides.flatMap(s => s.layers);
  const t = all.find(L => L.type === 'text' && L.role === 'title' && !L.onPhoto) || all.find(L => L.type === 'text' && L.role === 'title');
  const b = all.find(L => L.type === 'text' && L.role === 'body'), mu = all.find(L => L.type === 'text' && L.role === 'muted' && !L.onPhoto), ac = all.find(L => L.type === 'rect' && L.role === 'accent-fill'), im = all.find(L => L.type === 'image' && L.role === 'photo');
  tk.bg = set.slides[0].bg || tk.bg;
  const orig = set.tk.accent, cands = [];
  if (t) { tk.head = {family: t.family, weight: t.weight}; tk.fg = t.onPhoto ? tk.fg : t.color; tk.upper = !!t.upper; tk.em = {mode: t.emMode}; cands.push(t.emMode === 'bg' ? t.emBg : t.emColor); }
  if (ac) cands.push(ac.fill);
  tk.accent = cands.find(c => c && c.toLowerCase() !== String(orig).toLowerCase()) || orig;   // vale o que o usuário realmente mudou
  if (b) tk.body = {family: b.family, weight: b.weight}; if (mu) tk.muted = mu.color;
  if (im) tk.photo = Object.assign({}, tk.photo, {filter: im.filter, ovColor: im.ovColor, ovMode: im.ovMode});
  return tk;
}

/* ---- exportação ---- */
async function slideBlob(set, slide) {
  await ensureSetResources(set);
  const c = document.createElement('canvas'); c.width = set.format.w; c.height = set.format.h; renderSlide(c.getContext('2d'), slide, c.width, c.height);
  return new Promise(res => c.toBlob(res, 'image/png'));
}
const CRC_T = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = u8 => { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC_T[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function makeZip(files) {   // armazenamento sem compressão (PNG já é comprimido)
  const enc = new TextEncoder(), chunks = [], central = []; let off = 0;
  files.forEach(f => {
    const name = enc.encode(f.name), crc = crc32(f.data), h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true); h.setUint16(10, 0, true); h.setUint16(12, 0x21, true);
    h.setUint32(14, crc, true); h.setUint32(18, f.data.length, true); h.setUint32(22, f.data.length, true); h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
    chunks.push(new Uint8Array(h.buffer), name, f.data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true); c.setUint16(12, 0, true); c.setUint16(14, 0x21, true);
    c.setUint32(16, crc, true); c.setUint32(20, f.data.length, true); c.setUint32(24, f.data.length, true); c.setUint16(28, name.length, true); c.setUint32(42, off, true);
    central.push(new Uint8Array(c.buffer), name); off += 30 + name.length + f.data.length;
  });
  const csize = central.reduce((a, b) => a + b.length, 0), e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, csize, true); e.setUint32(16, off, true);
  return new Blob([...chunks, ...central, new Uint8Array(e.buffer)], {type: 'application/zip'});
}
async function exportSetZip(set) {
  const files = [];
  for (let i = 0; i < set.slides.length; i++) files.push({name: `${slug(set.name)}-${String(i + 1).padStart(2, '0')}.png`, data: new Uint8Array(await (await slideBlob(set, set.slides[i])).arrayBuffer())});
  return makeZip(files);
}

/* ================= ANÚNCIO DE IMAGEM ÚNICA E VARIAÇÕES ================= */
const AD_LAYOUTS = {top: 'Foto no topo', bottom: 'Foto embaixo', full: 'Foto cheia', none: 'Só tipografia'};
/* anúncio: headline + apoio + botão, com a foto conforme o layout */
/* anúncio em qualquer medida: formatos largos usam o layout lateral; os demais são montados em 1080 de largura e escalados */
const isWide = f => f.w / f.h >= 1.5;
function slideAd(tk, copy, fmt, brand, layout) {
  if (isWide(fmt)) return slideWide(tk, copy, fmt, brand, {photo: layout !== 'none'});
  if (fmt.w === 1080) return slideAdBase(tk, copy, fmt, brand, layout);
  const k = fmt.w / 1080, s = slideAdBase(tk, copy, {w: 1080, h: Math.round(fmt.h / k)}, brand, layout);
  return scaleSlide(s, k, k);
}
function slideAdBase(tk, copy, fmt, brand, layout) {
  const W = fmt.w, H = fmt.h, m = 90, cw = W - 2 * m, al = tk.align === 'center' ? 'center' : 'left', layers = [];
  const mode = layout && layout !== 'auto' ? layout : ({half: 'bottom'}[tk.photoMode] || tk.photoMode), onP = mode === 'full';
  let y0 = m, y1 = H - m - 70;
  if (mode === 'full') layers.push(IM('photo', {x: 0, y: 0, w: W, h: H}), RC('overlay', {x: 0, y: 0, w: W, h: H, fill: 'rgba(0,0,0,0.5)'}));
  if (mode === 'top') { const ph = Math.round(H * 0.42); layers.push(IM('photo', {x: 0, y: 0, w: W, h: ph})); y0 = ph + 50; }
  if (mode === 'bottom') { const ph = Math.round(H * 0.36), py = H - m - 70 - ph; layers.push(IM('photo', {x: m, y: py, w: cw, h: ph, radius: tk.radius})); y1 = py - 50; }
  const items = [];
  if (copy.kicker) items.push(tk.mark === 'chip' ? chipGroup(copy.kicker, tk, onP) : T('kicker', {content: copy.kicker, size: 28, ls: 4, align: al, w: cw, onPhoto: onP}));
  if (tk.mark === 'bar') items.push(RC('accent-fill', {w: 120, h: 12, x: al === 'center' ? (W - 120) / 2 : m}));
  items.push(T('title', {content: autoEmphasis(copy.title), size: titleSize(copy.title, mode === 'none' ? 118 : 96), lh: tk.upper ? 1.02 : 1.1, align: al, w: cw, onPhoto: onP}));
  if (tk.mark === 'underline') items.push(RC('accent-fill', {w: 150, h: 7, x: al === 'center' ? (W - 150) / 2 : m}));
  if (copy.sub) items.push(T('body', {content: copy.sub, size: 42, lh: 1.4, align: al, w: cw, onPhoto: onP}));
  items.forEach(it => { if (!it.group) themeLayer(it, tk); });
  let bw = 0, btn, bt;
  if (copy.button) {
    bw = Math.min(cw, 640); btn = RC('cta-fill', {w: bw, h: 112, fill: tk.accent}); bt = T('cta-text', {content: copy.button, size: 42, align: 'center', w: bw - 40});
    themeLayer(btn, tk); themeLayer(bt, tk); bt.dx = 20; bt.dy = (112 - bt.size * 1.2) / 2; btn.dx = 0; btn.dy = 0; items.push({group: [btn, bt], h: 112});
  }
  stackPlace(items, m, cw, y0, y1, mode === 'full' ? 'bottom' : 'middle', 36);
  items.forEach(it => (it.group ? it.group : [it]).forEach(l => layers.push(l)));
  if (al === 'center') items.filter(it => it.group).forEach(it => { const b = it.group[0], t = it.group[1], shift = (W - b.w) / 2 - b.x; b.x += shift; t.x += shift; });
  const br = T('brand', {content: brand, size: 26, ls: 2, x: m, y: H - m - 30, w: 700, upper: true, onPhoto: onP}); themeLayer(br, tk); layers.push(br);
  return {id: sid(), bg: tk.bg, layers};
}
function cloneSlide(slide) { const c = JSON.parse(JSON.stringify(slide)); c.id = sid(); c.layers.forEach(l => { l.id = lid(); }); return c; }
const FIXED_ROLES = ['photo', 'overlay', 'brand', 'muted'];
/* troca textos por papel e re-estiliza; reorganiza o que fica abaixo e, se o texto novo não couber, reduz o título até caber */
function variantFromBase(base, tk, texts, emMode, fmt) {
  const s = cloneSlide(base), H = fmt.h, m = 90, limit = H - m - 70, topMin = 60;
  const first = role => s.layers.find(l => l.type === 'text' && l.role === role && l.content);
  const targets = [['title', texts.h && autoEmphasis(texts.h, emMode)], ['body', texts.s], ['cta-text', texts.c]].map(([r, v]) => [first(r), v]).filter(([L, v]) => L && v);
  const orig = new Map(s.layers.map(l => [l.id, l.y]));
  const olds = targets.map(([L]) => ({L, y: L.y, h: layoutText(L).h, size: L.size}));
  targets.forEach(([L, v]) => { L.content = v; delete L.spans; });
  themeSlide(s, tk);
  const movable = l => !FIXED_ROLES.includes(l.role) && l.type !== 'image' && !(l.type === 'rect' && l.w >= fmt.w - 2);
  const tOld = olds.find(o => o.L.role === 'title');
  const pass = k => {
    if (tOld) tOld.L.size = Math.max(24, Math.round(tOld.size * k));
    olds.forEach(o => { o.d = layoutText(o.L).h - o.h; });
    let top = 1e9, bot = 0;
    s.layers.forEach(l => {
      if (!movable(l)) return; let sh = 0; olds.forEach(o => { if (o.L !== l && orig.get(l.id) >= o.y + o.h - 2) sh += o.d; });
      l.y = orig.get(l.id) + sh; top = Math.min(top, l.y); bot = Math.max(bot, l.y + (l.type === 'text' ? layoutText(l).h : l.h));
    });
    return {top, bot};
  };
  let fit; for (const k of [1, 0.92, 0.85, 0.78, 0.7, 0.62, 0.55, 0.48, 0.4]) { fit = pass(k); if (fit.bot - fit.top <= limit - topMin) break; }
  if (fit.bot > limit) { const up = Math.min(fit.bot - limit, Math.max(0, fit.top - topMin)); s.layers.forEach(l => { if (movable(l)) l.y -= up; }); }
  return s;
}
