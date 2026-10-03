/* ===== Editora · motor de diagramação de e-books =====
   O conteúdo (seções com blocos) é paginado em camadas do motor de design (texto, formas), nas versões: celular 9:16, tablet 6×9 pol, A4 preto e branco (margem de encadernação) e A4 econômico.
   Todas as medidas abaixo estão em "unidades-base" (corpo = 38) e são multiplicadas por S = corpo da versão / 38. */
const EB_FORMATS = {
  mobile: {id: 'mobile', name: 'Celular (Stories 9:16)', short: 'Celular', w: 1080, h: 1920, fs: 38, mode: 'color', pt: [810, 1440]},
  tablet: {id: 'tablet', name: 'Tablet / desktop (6×9 pol)', short: 'Tablet 6×9', w: 1050, h: 1575, fs: 29, mode: 'color', pt: [432, 648]},
  a4bw: {id: 'a4bw', name: 'Impressão A4 preto e branco', short: 'A4 P&B', w: 1240, h: 1754, fs: 29, mode: 'bw', bind: true, pt: [595, 842]},
  a4eco: {id: 'a4eco', name: 'Impressão econômica A4', short: 'A4 econômico', w: 1240, h: 1754, fs: 29, mode: 'eco', pt: [595, 842]}
};
const EB_KINDS = {
  case: {label: 'Caso prático', icon: '📖', tone: 'primary'}, tip: {label: 'Dica', icon: '💡', tone: 'gold'}, warn: {label: 'Atenção', icon: '⚠️', tone: 'terra'},
  know: {label: 'Você sabia?', icon: '🧠', tone: 'light'}, care: {label: 'Cuide de você', icon: '❤️', tone: 'terra'}, note: {label: 'Nota', icon: '✎', tone: 'gold'}
};
const ebPad2 = n => String(n).padStart(2, '0');
const ebGray = h => { const [r, g, b] = hex2rgb(h), v = Math.round(0.299 * r + 0.587 * g + 0.114 * b); return '#' + [v, v, v].map(x => x.toString(16).padStart(2, '0')).join(''); };

/* paleta por versão: color = identidade; bw = só cinzas e preto (sem blocos pesados); eco = fundo branco, cor só no texto e em contornos */
function ebColors(eb, mode) {
  const c = eb.brand.c;
  if (mode === 'bw') return {mode, bg: '#ffffff', text: '#000000', soft: '#1c1c1c', primary: '#000000', light: '#444444', terra: '#333333', gold: '#555555', boxBg: '#f1f1f1', roseBg: '#e9e9e9', greenBg: '#f6f6f6', openBg: '#ffffff', openText: '#000000', openAcc: '#333333', line: '#000000', fillBoxes: true, solidOpen: false};
  if (mode === 'eco') return {mode, bg: '#ffffff', text: c.text, soft: c.soft, primary: c.primary, light: c.light, terra: c.terra, gold: c.gold, boxBg: '', roseBg: '', greenBg: '', openBg: '#ffffff', openText: c.primary, openAcc: c.gold, line: c.primary, fillBoxes: false, solidOpen: false};
  return {mode, bg: c.bg, text: c.text, soft: c.soft, primary: c.primary, light: c.light, terra: c.terra, gold: c.gold, boxBg: c.box, roseBg: '#f4e1de', greenBg: '#e1eee2', openBg: c.primary, openText: '#ffffff', openAcc: c.gold, line: c.primary, fillBoxes: true, solidOpen: true};
}

function ebBuild(eb, fid, o) {
  o = o || {}; const F = EB_FORMATS[fid] || EB_FORMATS.mobile, S = F.fs / 38, C = ebColors(eb, F.mode), HF = eb.brand.h, BF = eb.brand.b, W = F.w, H = F.h;
  const pages = [], issues = [], secStart = {}, limitBottom = H - 150 * S, topM = 120 * S;
  let cur = null, curSec = null; const tocN = o.tocPages || 1;
  const txt = (role, content, x, y, w, p) => { const L = T(role, Object.assign({x, y, w, content: String(content == null ? '' : content).replace(/\*\*/g, ''), family: BF, size: 38 * S, weight: 400, color: C.text, lh: 1.45, align: 'left', ls: 0}, p)); return L; };
  const rect = (x, y, w, h, p) => RC('shape', Object.assign({x, y, w, h, fill: '', radius: 0}, p));
  const italic = L => { const n = plainOf(L.content).length; if (n) L.spans = [{s: 0, e: n, st: {italic: true}}]; return L; };
  const hOf = L => layoutText(L).h;
  const margins = n => F.bind ? (n % 2 === 1 ? [190 * S, 110 * S] : [110 * S, 190 * S]) : [90 * S, 90 * S];
  function newPage(p) { p = p || {}; const n = pages.filter(x => !x.cover).length + 1, [ml, mr] = margins(n); cur = {layers: [], bg: p.bg || C.bg, sec: curSec ? curSec.id : '', kind: p.kind || 'flow', ml, mr, cw: W - ml - mr, y: topM, num: n, solid: !!p.solid}; pages.push(cur); return cur; }
  const left = () => limitBottom - cur.y;
  const add = (L, y) => { if (y != null) L.y = y; cur.layers.push(L); return L; };

  /* ---- parágrafo com quebra entre páginas e (opcional) letra capitular ---- */
  function flowP(text, p) {
    p = p || {}; let rest = String(text || '').replace(/\*\*/g, '').trim(); if (!rest) return;
    const gap = (p.gap == null ? 26 : p.gap) * S;
    if (p.drop && rest.length > 30) {
      const ch = rest[0], body = rest.slice(1), dsz = 38 * S * 3.3, dw = (() => { const t = txt('d', ch, 0, 0, 999, {family: HF, size: dsz, weight: 700}); return layoutText(t).lines[0].w + 14 * S; })();
      const narrow = txt('n', body, cur.ml + dw, 0, cur.cw - dw), lay = layoutText(narrow), k = Math.min(3, lay.lines.length), cut = k < lay.lines.length ? lay.lines[k].words[0].s : body.length, need = lay.lines.slice(0, k).reduce((a, l) => a + l.h, 0);
      if (need + 20 * S > left()) newPage({kind: 'flow'});
      add(txt('drop', ch, cur.ml, cur.y - dsz * 0.07, dw, {family: HF, size: dsz, weight: 700, color: C.primary, lh: 1}));
      add(txt('p', body.slice(0, cut).trim(), cur.ml + dw, cur.y, cur.cw - dw)); cur.y += Math.max(need, dsz * 0.8);
      rest = body.slice(cut).trim(); if (!rest) { cur.y += gap; return; }
    }
    for (let guard = 0; guard < 60 && rest; guard++) {
      const L = txt('p', rest, cur.ml, cur.y, cur.cw, p.style || {}), lay = layoutText(L), lines = lay.lines; let acc = 0, fit = 0; for (const l of lines) { if (acc + l.h > left() + 0.5) break; acc += l.h; fit++; }
      if (fit === lines.length) { add(L); cur.y += lay.h + gap; return; }
      if (fit < 2 && cur.y > topM + 30 * S) { newPage({kind: 'flow'}); continue; }                       // não deixa 1 linha sozinha no pé
      if (lines.length - fit === 1 && fit > 2) fit--;                                                       // nem 1 linha sozinha no topo
      if (fit < 1) { issues.push({sec: curSec && curSec.id, msg: 'Um parágrafo não cabe nem em uma página vazia.'}); add(L); cur.y += lay.h + gap; return; }
      const cutAt = lines[fit].words[0].s; L.content = rest.slice(0, cutAt).trim(); add(L); rest = rest.slice(cutAt).trim(); newPage({kind: 'flow'});
    }
  }
  function ensure(h, what) { if (h > left()) { if (cur.y > topM + 4) newPage({kind: 'flow'}); if (h > left()) issues.push({sec: curSec && curSec.id, msg: (what || 'Bloco') + ' não cabe em uma página inteira (altura ' + Math.round(h) + ' > ' + Math.round(left()) + '). Encurte o texto.'}); } }
  function heading(text, p) { p = p || {}; const t = txt('h', text, cur.ml, cur.y, cur.cw, {family: HF, size: (p.size || 58) * S, weight: 700, color: C.primary, lh: 1.15}); ensure(hOf(t) + 40 * S, 'Título'); t.x = cur.ml; t.y = cur.y; t.w = cur.cw; add(t); cur.y += hOf(t) + (p.after == null ? 28 : p.after) * S; }

  /* ---- caixas ---- */
  function box(b) {
    const K = EB_KINDS[b.kind] || EB_KINDS.tip, tone = C[K.tone], pad = 34 * S, bar = 9 * S; ensure(120 * S, 'Caixa');
    const w = cur.cw, tw = w - 2 * pad - bar, title = (b.title || K.label), head = txt('bt', K.icon + '  ' + title, cur.ml + bar + pad, 0, tw, {family: BF, size: 31 * S, weight: 700, color: tone, lh: 1.25, upper: false, ls: 0.3 * S}), body = txt('bb', b.text || '', cur.ml + bar + pad, 0, tw, {size: 35 * S, color: C.soft, lh: 1.5});
    const hh = hOf(head), bh = (b.text || '').trim() ? hOf(body) : 0, tot = pad + hh + (bh ? 14 * S + bh : 0) + pad;
    if (tot > left()) { newPage({kind: 'flow'}); if (tot > left()) issues.push({sec: curSec && curSec.id, msg: 'Caixa “' + title + '” é mais alta que a página.'}); }
    const y = cur.y; if (C.fillBoxes) add(rect(cur.ml, y, w, tot, {fill: C.boxBg, radius: 16 * S})); else add(rect(cur.ml, y, w, tot, {fill: '', stroke: tone, strokeW: 3 * S, radius: 16 * S}));
    add(rect(cur.ml, y + 6 * S, bar, tot - 12 * S, {fill: tone, radius: bar / 2}));
    head.y = y + pad; add(head); if (bh) { body.y = y + pad + hh + 14 * S; add(body); } cur.y += tot + 30 * S;
  }
  function cols2(b) {
    const gap = 26 * S, w = (cur.cw - gap) / 2, pad = 26 * S, mk = (title, items, fill, tone, icon) => {
      const head = txt('ch', icon + ' ' + title, 0, 0, w - 2 * pad, {family: BF, size: 30 * S, weight: 700, color: tone, lh: 1.2}), its = (items || []).filter(Boolean).map(t => txt('ci', '•  ' + t, 0, 0, w - 2 * pad, {size: 31 * S, color: C.soft, lh: 1.4}));
      const h = pad + hOf(head) + 18 * S + its.reduce((a, l) => a + hOf(l) + 14 * S, 0) + pad - 14 * S * (its.length ? 1 : 0); return {head, its, h, fill, tone};
    };
    const L = mk(b.leftTitle || 'Situações comuns', b.left, C.roseBg, C.terra, '❌'), R = mk(b.rightTitle || 'Faça assim', b.right, C.greenBg, C.primary, '✅'), h = Math.max(L.h, R.h);
    if (h > left()) { newPage({kind: 'flow'}); if (h > left()) issues.push({sec: curSec && curSec.id, msg: 'As duas colunas não cabem em uma página. Reduza os itens.'}); }
    const y = cur.y;
    [[L, cur.ml], [R, cur.ml + w + gap]].forEach(([c, x]) => { if (C.fillBoxes) add(rect(x, y, w, h, {fill: c.fill, radius: 16 * S})); else add(rect(x, y, w, h, {fill: '', stroke: c.tone, strokeW: 3 * S, radius: 16 * S}));
      c.head.x = x + pad; c.head.y = y + pad; add(c.head); let yy = y + pad + hOf(c.head) + 18 * S; c.its.forEach(l => { l.x = x + pad; l.y = yy; add(l); yy += hOf(l) + 14 * S; }); });
    cur.y += h + 30 * S;
  }
  function list(b) { (b.items || []).filter(Boolean).forEach((t, i) => { const mark = b.ordered ? (i + 1) + '.' : '•', mw = 52 * S, L = txt('li', t, cur.ml + mw, 0, cur.cw - mw), h = hOf(L); ensure(h + 14 * S, 'Item de lista'); add(txt('lm', mark, cur.ml, cur.y, mw, {weight: 700, color: C.primary})); L.y = cur.y; L.x = cur.ml + mw; L.w = cur.cw - mw; add(L); cur.y += h + 14 * S; }); cur.y += 14 * S; }
  function fullPage(b, kind) {   // checklist ou resumo: página inteira
    newPage({kind: 'full'}); const tone = kind === 'check' ? C.primary : C.gold;
    add(txt('fl', (kind === 'check' ? '✅ ' : '✔ ') + 'CAPÍTULO ' + (curSec && curSec.num ? ebPad2(curSec.num) : ''), cur.ml, cur.y, cur.cw, {size: 26 * S, weight: 600, color: C.gold, ls: 4 * S, upper: true})); cur.y += 52 * S;
    heading(b.title || (kind === 'check' ? 'Checklist do capítulo' : 'Resumo do capítulo'), {size: 64, after: 46}); const items = (b.items || []).filter(Boolean); const sz = 42 * S;
    const nodes = items.map(t => txt('it', t, cur.ml + 96 * S, 0, cur.cw - 96 * S, {size: sz, lh: 1.45})), total = nodes.reduce((a, l) => a + Math.max(hOf(l), 66 * S), 0), room = left() - 20 * S, gapE = Math.max(26 * S, Math.min(150 * S, (room - total) / Math.max(1, items.length)));
    if (total + gapE * items.length > room + 1) issues.push({sec: curSec && curSec.id, msg: (kind === 'check' ? 'Checklist' : 'Resumo') + ' não cabe na página inteira.'});
    nodes.forEach(l => { const hh = Math.max(hOf(l), 66 * S);
      if (kind === 'check') add(rect(cur.ml, cur.y + (hh - 56 * S) / 2, 56 * S, 56 * S, {fill: '', stroke: C.primary, strokeW: 4 * S, radius: 10 * S}));
      else { if (C.fillBoxes) add(rect(cur.ml, cur.y + (hh - 60 * S) / 2, 60 * S, 60 * S, {fill: C.primary, radius: 30 * S})); else add(rect(cur.ml, cur.y + (hh - 60 * S) / 2, 60 * S, 60 * S, {fill: '', stroke: C.primary, strokeW: 4 * S, radius: 30 * S})); add(txt('ck', '✔', cur.ml, cur.y + (hh - 40 * S) / 2, 60 * S, {size: 34 * S, weight: 700, color: C.fillBoxes ? '#ffffff' : C.primary, align: 'center', lh: 1.2})); }
      l.x = cur.ml + 96 * S; l.y = cur.y + (hh - hOf(l)) / 2; add(l); cur.y += hh + gapE; }); cur.y = limitBottom;
  }
  function blocks(arr, sec) {
    let firstP = true;
    (arr || []).forEach(b => {
      if (b.t === 'p') { flowP(b.text, {drop: !!b.drop || (b.drop == null && false)}); firstP = false; }
      else if (b.t === 'h2') { const t = txt('h2', b.text, cur.ml, cur.y, cur.cw, {family: HF, size: 46 * S, weight: 700, color: C.primary, lh: 1.2}); ensure(hOf(t) + 80 * S, 'Subtítulo'); cur.y += 8 * S; t.y = cur.y; add(t); cur.y += hOf(t) + 20 * S; }
      else if (b.t === 'box') box(b); else if (b.t === 'cols2') cols2(b); else if (b.t === 'list') list(b);
      else if (b.t === 'check') fullPage(b, 'check'); else if (b.t === 'summary') fullPage(b, 'sum'); else if (b.t === 'pagebreak') newPage({kind: 'flow'});
    });
  }
  /* ---- páginas especiais ---- */
  function titlePage(sec) {
    newPage({kind: 'title'}); const w = cur.cw, mid = H * 0.30; add(txt('k', (sec.label || 'GUIA PRÁTICO'), cur.ml, mid, w, {size: 34 * S, weight: 700, color: C.gold, ls: 7 * S, upper: true, align: 'center'}));
    const t = txt('t', eb.title, cur.ml, mid + 100 * S, w, {family: HF, size: 112 * S, weight: 700, color: C.primary, lh: 1.08, align: 'center'}); add(t); let y = mid + 100 * S + hOf(t) + 40 * S;
    add(rect(W / 2 - 60 * S, y, 120 * S, 5 * S, {fill: C.gold, radius: 3 * S})); y += 50 * S;
    if (eb.subtitle) { const s2 = italic(txt('s', eb.subtitle, cur.ml, y, w, {size: 44 * S, color: C.soft, align: 'center', lh: 1.4})); add(s2); y += hOf(s2) + 40 * S; }
    const au = txt('a', eb.author || '', cur.ml, 0, w, {family: HF, size: 38 * S, weight: 600, color: C.text, align: 'center', lh: 1.25}), ah = hOf(au), co = eb.collection ? txt('c', eb.collection, cur.ml, 0, w, {size: 26 * S, color: C.gold, ls: 4 * S, upper: true, align: 'center', weight: 600, lh: 1.3}) : null, tot = ah + (co ? 24 * S + hOf(co) : 0), y0 = H - 190 * S - tot; au.y = y0; add(au); if (co) { co.y = y0 + ah + 24 * S; add(co); }
  }
  function opener(sec) {
    newPage({kind: 'open', bg: C.openBg, solid: C.solidOpen}); const w = cur.cw, y0 = H * 0.30;
    add(txt('ol', sec.label || '', cur.ml, y0, w, {size: 34 * S, weight: 700, color: C.openAcc, ls: 7 * S, upper: true}));
    const t = txt('ot', sec.title, cur.ml, y0 + 90 * S, w, {family: HF, size: 100 * S, weight: 700, color: C.openText, lh: 1.1}); add(t); let y = y0 + 90 * S + hOf(t) + 34 * S;
    add(rect(cur.ml, y, 150 * S, C.solidOpen ? 5 * S : 7 * S, {fill: C.openAcc, radius: 3 * S})); y += 52 * S;
    if (sec.subtitle) add(italic(txt('os', sec.subtitle, cur.ml, y, w, {size: 42 * S, color: C.solidOpen ? '#e8efe8' : C.soft, lh: 1.4})));
  }
  function tocPage(sec, entries) {
    let i = 0; while (i < entries.length || i === 0) {
      newPage({kind: 'toc'}); if (i === 0) heading(sec.title || 'Sumário', {size: 64, after: 40});
      for (; i < entries.length; i++) { const e = entries[i], t = txt('tt', e.label ? e.label + ' · ' + e.title : e.title, cur.ml, cur.y, cur.cw - 130 * S, {size: 34 * S, lh: 1.3}), h = hOf(t); if (h + 36 * S > left()) break; add(t); add(txt('tn', String(e.page), cur.ml + cur.cw - 110 * S, cur.y, 110 * S, {size: 34 * S, weight: 700, color: C.primary, align: 'right'}));
        add(rect(cur.ml, cur.y + h + 12 * S, cur.cw, 1.5 * S, {fill: C.mode === 'color' ? '#d9d2c4' : '#999999'})); cur.y += h + 34 * S; }
      if (i >= entries.length) break;
    }
  }
  /* ---- percorre as seções ---- */
  const entries = []; let chNum = 0; const secs = eb.sections || [];
  secs.forEach(sec => {
    curSec = sec; secStart[sec.id] = pages.filter(x => !x.cover).length + 1;
    if (sec.type === 'title') titlePage(sec);
    else if (sec.type === 'toc') { for (let k = 0; k < tocN; k++) pages.push({layers: [], bg: C.bg, sec: sec.id, kind: 'toc', placeholder: true, num: 0}); }
    else {
      if (sec.type === 'chapter') { chNum++; sec.num = chNum; } if (sec.opener) opener(sec);
      if (!sec.opener) { newPage({kind: 'flow'}); if (sec.title) heading(sec.title, {size: 64, after: 36}); } else newPage({kind: 'flow'});
      blocks(sec.blocks, sec); if (sec.opener && cur && !cur.layers.length) { pages.pop(); }
      if (sec.inToc !== false) entries.push({label: sec.type === 'chapter' ? (sec.label || '').trim() : '', title: sec.title, sec: sec.id});
    }
  });
  entries.forEach(e => { e.page = secStart[e.sec]; });
  /* sumário: substitui as páginas reservadas */
  const toc = secs.find(s => s.type === 'toc');
  if (toc) {
    const at = pages.findIndex(p => p.placeholder), rest = pages.splice(at).filter(p => !p.placeholder); curSec = toc; cur = null; tocPage(toc, entries);
    const made = pages.length - at; rest.forEach(p => pages.push(p));
    if (made !== tocN && !o.retry) return ebBuild(eb, fid, Object.assign({}, o, {tocPages: made, retry: true}));
  }
  /* numeração e rodapé */
  let n = 0; pages.forEach(p => { if (p.cover) return; n++; p.num = n; const [ml, mr] = margins(n); p.ml = ml; p.mr = mr;
    const dark = p.solid; p.layers.push(txt('ft', ebPad2(n) + ' · ' + (eb.footer || 'MÉTODO CUIDADO SEGURO'), 0, H - 84 * S, W, {size: 22 * S, weight: 600, color: dark ? '#cfe0d0' : C.soft, ls: 3 * S, upper: true, align: 'center', opacity: 0.9})); });
  if (eb.coverSetId && !o.noCover) pages.unshift({cover: true, setId: eb.coverSetId, num: 0});
  return {pages, issues, fmt: F, entries, tocPages: o.tocPages || 1};
}

/* ---- desenho de uma página no canvas (cobre a capa e o filtro P&B) ---- */
async function ebCoverBitmap(eb) { const p = curProject(), set = p && p.design.sets.find(s => s.id === eb.coverSetId); if (!set) return null; await ensureSetResources(set); const sl = set.slides[0], f = set.format, c = document.createElement('canvas'); c.width = f.w; c.height = f.h; renderSlide(c.getContext('2d'), sl, f.w, f.h, 1); return c; }
async function ebRenderPage(cv, page, F, eb, coverCache) {
  const ctx = cv.getContext('2d'), k = cv.width / F.w; let src = cv;
  if (F.mode === 'bw') { src = document.createElement('canvas'); src.width = cv.width; src.height = cv.height; }
  const c2 = src.getContext('2d');
  if (page.cover) { const cb = coverCache || await ebCoverBitmap(eb); c2.fillStyle = '#fff'; c2.fillRect(0, 0, cv.width, cv.height); if (cb) { const s = Math.max(cv.width / cb.width, cv.height / cb.height); c2.drawImage(cb, (cv.width - cb.width * s) / 2, (cv.height - cb.height * s) / 2, cb.width * s, cb.height * s); } }
  else renderSlide(c2, {bg: page.bg, layers: page.layers}, F.w, F.h, k);
  if (src !== cv) { ctx.save(); ctx.filter = 'grayscale(1) contrast(1.15)'; ctx.drawImage(src, 0, 0); ctx.restore(); }
}
