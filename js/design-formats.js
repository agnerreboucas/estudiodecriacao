/* Formatos e redimensionamento: uma arte pronta vira várias medidas (feed, stories, anúncios, capas, tamanho livre).
   Formatos parecidos escalam a peça (preserva sua edição); muito diferentes reconstroem por papel (título, texto, botão, foto). */

/* escala uniforme de posição/tamanho; texto acompanha o menor fator */
function scaleSlide(s, kx, ky) {
  const k = Math.min(kx, ky);
  s.layers.forEach(l => {
    if (l.type === 'path') { l.x = Math.round(l.x * kx); l.y = Math.round(l.y * ky); l.w = Math.round(l.w * kx); l.h = Math.round(l.h * ky); return; }
    if (l.role === 'logo') { const cx = (l.x + l.w / 2) * kx, cy = (l.y + l.h / 2) * ky; l.w = Math.round(l.w * k); l.h = Math.round(l.h * k); l.x = Math.round(Math.max(0, cx - l.w / 2)); l.y = Math.round(Math.max(0, cy - l.h / 2)); return; }
    l.x = Math.round(l.x * kx); l.y = Math.round(l.y * ky); l.w = Math.round(l.w * kx); if (l.blur) l.blur = Math.round(l.blur * k * 10) / 10; if (l.strokeW) l.strokeW = Math.max(1, Math.round(l.strokeW * k));
    if (l.type === 'text') { l.size = Math.max(8, Math.round(l.size * k * 10) / 10); if (l.ls) l.ls = Math.round(l.ls * k * 10) / 10; }
    else { l.h = Math.round(l.h * ky); if (l.radius) l.radius = Math.round(l.radius * k); if (l.strokeW) l.strokeW = Math.max(1, Math.round(l.strokeW * k)); }
  });
  return s;
}

/* layout lateral para formatos largos (capas, banners, 1.91:1, 16:9): texto à esquerda, foto à direita */
function slideWide(tk, copy, fmt, brand, o) {
  o = o || {};
  const W = fmt.w, H = fmt.h, box = fmt.safe ? {x: Math.round((W - fmt.safe.w) / 2), y: Math.round((H - fmt.safe.h) / 2), w: fmt.safe.w, h: fmt.safe.h} : {x: 0, y: 0, w: W, h: H};
  const m = Math.max(10, Math.round(box.h * 0.09)), ratio = box.w / box.h, layers = [];
  const withPhoto = o.photo !== false && ratio <= 4.5;
  const pw = withPhoto ? Math.round(box.w * (ratio > 3 ? 0.3 : 0.38)) : 0;
  if (withPhoto) { const ph = IM('photo', {x: box.x + box.w - pw, y: box.y, w: pw, h: box.h}); themeLayer(ph, tk); layers.push(ph); }
  const x0 = box.x + m, tw = Math.min(box.w - pw - 2 * m - (withPhoto ? m : 0), Math.round(box.h * 6.5)), al = 'left';
  const mk = drop => {
    const items = [];
    if (copy.kicker && drop < 2) items.push(T('kicker', {content: copy.kicker, size: Math.max(10, Math.round(box.h * 0.045)), ls: 2, align: al, w: tw}));
    items.push(T('title', {content: autoEmphasis(copy.title), size: 100, lh: tk.upper ? 1.02 : 1.1, align: al, w: tw}));
    if (copy.sub && drop < 3) items.push(T('body', {content: copy.sub, size: Math.max(11, Math.round(box.h * 0.07)), lh: 1.35, align: al, w: tw}));
    items.forEach(it => themeLayer(it, tk));
    if (copy.button && drop < 1) {
      const bh = Math.max(24, Math.round(box.h * 0.17)), bw = Math.min(tw, Math.round(box.h * 0.9)), btn = RC('cta-fill', {w: bw, h: bh, fill: tk.accent}), bt = T('cta-text', {content: copy.button, size: Math.max(10, Math.round(bh * 0.38)), align: 'center', w: bw - 16});
      themeLayer(btn, tk); themeLayer(bt, tk); bt.dx = 8; bt.dy = (bh - bt.size * 1.2) / 2; btn.dx = 0; btn.dy = 0; items.push({group: [btn, bt], h: bh});
    }
    return items;
  };
  const avail = box.h - 2 * m, gap = Math.max(6, Math.round(box.h * 0.04));
  let items = null;
  for (const drop of [0, 1, 2, 3]) {
    const its = mk(drop), t = its.find(i => i.role === 'title'), base = Math.round(box.h * 0.2);
    for (const k of [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.42]) {
      t.size = Math.max(10, Math.round(titleSize(copy.title, base) * k));
      const total = its.reduce((a, it) => a + (it.group ? it.h : it.type === 'text' ? layoutText(it).h : it.h), 0) + gap * (its.length - 1);
      if (total <= avail) { items = its; break; }
    }
    if (items) break; if (drop === 3) items = its;
  }
  stackPlace(items, x0, tw, box.y + m, box.y + box.h - m, 'middle', gap);
  items.forEach(it => (it.group ? it.group : [it]).forEach(l => layers.push(l)));
  if (brand && box.h >= 300) { const br = T('brand', {content: brand, size: Math.max(10, Math.round(box.h * 0.04)), ls: 2, x: x0, y: box.y + box.h - m - 14, w: tw, upper: true}); themeLayer(br, tk); layers.push(br); }
  return {id: sid(), bg: tk.bg, layers};
}

/* lê o conteúdo de uma peça por papel */
function slideCopy(sl) {
  const t = r => sl.layers.find(l => l.type === 'text' && l.role === r && l.content);
  const k = t('kicker'), ti = t('title'), b = t('body'), c = t('cta-text'), br = t('brand'), ph = sl.layers.find(l => l.type === 'image' && l.role === 'photo');
  return {kicker: k ? k.content : '', title: ti ? ti.content : '', sub: b ? b.content : '', button: c ? c.content : '', brand: br ? br.content : '', photo: ph || null};
}

/* adapta UMA peça de um formato para outro */
function resizeSlide(sl, from, to, tk) {
  if (sl.isLogo) return fitLogoSlide(sl, from, to);
  const rf = from.w / from.h, rt = to.w / to.h, rel = rt / rf, wf = isWide(from), wt = isWide(to);
  if ((wf === wt) && rel >= (wt ? 0.8 : 0.7) && rel <= (wt ? 1.25 : 1.45)) return scaleSlide(cloneSlide(sl), to.w / from.w, to.h / from.h);
  if (sl.pm && typeof palette === 'function') { const pl = palette(tk, sl.pm); tk = Object.assign({}, tk, {bg: pl.bg, fg: pl.fg, accent: pl.acc, muted: pl.mut}); }
  const cp = slideCopy(sl), photoFull = cp.photo && cp.photo.w >= from.w * 0.95 && cp.photo.h >= from.h * 0.95;
  const layout = !cp.photo ? 'none' : photoFull ? 'full' : 'auto';
  const copy = {kicker: cp.kicker, title: cp.title || 'Título', sub: cp.sub, button: cp.button};
  const out = slideAd(tk, copy, to, cp.brand, layout);
  // devolve exatamente o texto original (inclui destaques feitos à mão)
  const set = (role, v) => { const L = out.layers.find(l => l.type === 'text' && l.role === role); if (L && v) L.content = v; };
  set('title', cp.title); set('body', cp.sub); set('cta-text', cp.button); set('kicker', cp.kicker);
  if (cp.photo) { const P = out.layers.find(l => l.type === 'image' && l.role === 'photo'); if (P) Object.assign(P, {imgId: cp.photo.imgId, filter: cp.photo.filter, ovColor: cp.photo.ovColor, ovMode: cp.photo.ovMode, brief: cp.photo.brief, fx: cp.photo.fx, fy: cp.photo.fy}); }
  const lg = sl.layers.find(l => l.type === 'image' && l.role === 'logo');
  if (lg) { const k = Math.min(to.w / from.w, to.h / from.h), w = Math.round(lg.w * k), h = Math.round(lg.h * k), cx = (lg.x + lg.w / 2) / from.w, cy = (lg.y + lg.h / 2) / from.h; out.layers.push(Object.assign(cloneSlide({layers: [lg]}).layers[0], {w, h, x: Math.round(Math.min(Math.max(0, cx * to.w - w / 2), to.w - w)), y: Math.round(Math.min(Math.max(0, cy * to.h - h / 2), to.h - h))})); }
  out.bg = sl.bg || tk.bg;
  return out;
}
/* fontes já precisam estar carregadas (use ensureSetResources antes) */
function resizeSetSync(set, to, name) {
  const from = set.format, ns = {id: uid('ds'), name: name || set.name + ' · ' + (to.name || to.label), format: {id: to.id, w: to.w, h: to.h}, tk: JSON.parse(JSON.stringify(set.tk)), slides: [], created: new Date().toISOString(), updated: new Date().toISOString()};
  if (to.safe) ns.format.safe = to.safe;
  ns.slides = set.slides.map(s => resizeSlide(s, from, ns.format, ns.tk));
  return ns;
}
/* carrossel já no formato pedido: nativo (1080 de largura, não largo) usa o gerador próprio; os outros nascem em 4:5 e são adaptados */
function buildSetAny(name, tk, copy, fmt, brand) {
  if (fmt.w === 1080 && !isWide(fmt)) return buildSet(name, tk, copy, fmt, brand);
  const base = buildSet(name, tk, copy, FORMATS.feed45, brand);
  const r = resizeSetSync(base, fmt, name); r.name = name; return r;
}

/* ---- interface ---- */
function dzFmtPick(who, field, v) { const o = who === 'vf' ? dz.vf : dz.cmp; o[field] = field === 'fmt' ? v : +v; renderDesign(); }

let rsz = {setId: '', sel: {}, cw: 1080, ch: 1080, useCustom: false};
function dzResizeOpen(setId) {
  const p = dzP(), set = p.design.sets.find(x => x.id === setId); if (!set) return;
  rsz = {setId, sel: {}, cw: 1080, ch: 1080, useCustom: false};
  const grp = FORMAT_GROUPS.map(([g, list]) => `<div class="rsz-g"><h4>${g}</h4>${list.map(([id, name, w, h]) => `<label class="rsz-i ${id === set.format.id ? 'cur' : ''}"><input type="checkbox" value="${id}" onchange="rsz.sel[this.value]=this.checked;dzResizeCount()"> <span>${name}</span> <small class="muted">${w}×${h}</small></label>`).join('')}</div>`).join('');
  showModal('⤢ Adaptar para outros tamanhos', `<p class="muted" style="margin-top:0;font-size:12px">Peça atual: <b>${esc(set.name)}</b> (${set.format.w}×${set.format.h}). Cada medida marcada vira uma peça nova na biblioteca; a original não muda. Formatos parecidos mantêm sua edição; muito diferentes (ex.: capa larga) reorganizam título, texto, botão e foto.</p>
    <div class="rsz-grid">${grp}</div>
    <div class="rsz-g"><h4>Medida livre</h4><div class="ins-row"><label class="ins inl"><input type="checkbox" onchange="rsz.useCustom=this.checked;dzResizeCount()"> Incluir</label><label class="ins">Largura<input type="number" min="64" max="4096" value="1080" onchange="rsz.cw=+this.value"></label><label class="ins">Altura<input type="number" min="64" max="4096" value="1080" onchange="rsz.ch=+this.value"></label></div></div>
    <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" id="rszGo" onclick="dzResizeRun()" disabled>Gerar (0)</button></div>`);
}
function dzResizeCount() { const n = Object.values(rsz.sel).filter(Boolean).length + (rsz.useCustom ? 1 : 0), b = $('rszGo'); if (b) { b.textContent = 'Gerar (' + n + ')'; b.disabled = !n; } }
async function dzResizeRun() {
  const p = dzP(), src = p.design.sets.find(x => x.id === rsz.setId); if (!src) return;
  const targets = Object.keys(rsz.sel).filter(k => rsz.sel[k] && FORMATS[k]).map(k => FORMATS[k]); if (rsz.useCustom) targets.push(customFormat(rsz.cw, rsz.ch));
  if (!targets.length) return; const b = $('rszGo'); b.disabled = true; b.textContent = 'Gerando…';
  try {
    await ensureSetResources(src);
    const made = targets.map(t => resizeSetSync(src, t));
    for (const s of made) await ensureSetResources(s);
    p.design.sets.push(...made); persist(); closeModal(); renderDesign(); toast(made.length + ' peça(s) criada(s) na biblioteca.');
  } catch (e) { b.disabled = false; b.textContent = 'Gerar'; toast('Não consegui adaptar: ' + e.message); }
}

/* peça que é um logo: nunca reconstruir por papéis; escala uniforme e centraliza no novo formato */
function fitLogoSlide(sl, from, to) {
  const s = cloneSlide(sl); s.isLogo = true; s.noBg = sl.noBg; s.bg = sl.bg;
  const k = Math.min(to.w / from.w, to.h / from.h), ox = (to.w - from.w * k) / 2, oy = (to.h - from.h * k) / 2;
  s.layers.forEach(l => {
    const h = l.type === 'text' ? layoutText(l).h : l.h;
    l.x = Math.round(l.x * k + ox); l.y = Math.round(l.y * k + oy); l.w = Math.round(l.w * k);
    if (l.type === 'text') { l.size = Math.max(6, Math.round(l.size * k * 10) / 10); if (l.ls) l.ls = Math.round(l.ls * k * 10) / 10; if (l.blur) l.blur *= k; }
    else { l.h = Math.round(h * k); if (l.radius) l.radius = Math.round(l.radius * k); if (l.strokeW && l.type !== 'path') l.strokeW = Math.max(1, Math.round(l.strokeW * k)); }
  });
  return s;
}
