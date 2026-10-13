/* Mesa do Estúdio de Design: Versões (até 25 por arte, em set.versions), Sistema (design system da arte = set.tk), Prévia em tela cheia,
   Importar (imagem, SVG; avisa que PSD/Figma não existem) e comandos de IA para a arte. Carregado depois de design-painel.js. */
const DZV_MAX = 25;
const dzvFmtDate = iso => { try { return new Date(iso).toLocaleString('pt-BR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'}); } catch (e) { return ''; } };

/* ================= VERSÕES ================= */
const dzvList = () => { const s = dzSet(); if (!Array.isArray(s.versions)) s.versions = []; return s.versions; };
function dzvSave(name, auto) {
  const s = dzSet(), list = dzvList(); list.push({id: uid('ver'), name: String(name || '').slice(0, 60) || ('Versão ' + (list.length + 1)), at: new Date().toISOString(), approved: false, auto: !!auto, slides: JSON.parse(JSON.stringify(s.slides))});
  while (list.length > DZV_MAX) { let i = list.findIndex(v => v.auto && !v.approved); if (i < 0) i = list.findIndex(v => !v.approved); if (i < 0) i = 0; list.splice(i, 1); }
  persist(); return list[list.length - 1];
}
function dzvOpenDock() {
  const s = dzSet(), list = dzvList().slice().reverse();
  dztDock('ver', `⟲ Versões <small style="color:var(--m-mut)">${list.length}/${DZV_MAX}</small>`, `<div class="dzt-vsave"><input id="dzvName" placeholder="Nome da versão (opcional)" onkeydown="if(event.key==='Enter')dzvSaveNow()"><button class="dzm-go" style="border-radius:9px" onclick="dzvSaveNow()">Salvar versão agora</button></div>
  <p class="dzt-tip" style="margin:6px 0 10px">Uma versão guarda todas as páginas desta arte neste momento. Dá para restaurar, comparar, duplicar como arte nova e marcar uma como <b>Aprovada</b>.</p>
  <div class="dzt-vers">${list.length ? list.map(v => `<article class="${v.approved ? 'ok' : ''}"><canvas data-ver="${v.id}" width="84" height="${Math.max(30, Math.round(84 * s.format.h / s.format.w))}"></canvas><div class="vi"><b>${esc(v.name)}</b>${v.approved ? ' <span class="dzt-badge">Aprovada</span>' : ''}${v.auto ? ' <span class="dzt-badge g">automática</span>' : ''}<small>${dzvFmtDate(v.at)} · ${v.slides.length} página(s)</small>
    <div class="va"><button onclick="dzvRestore('${v.id}')">Restaurar</button><button onclick="dzvCompare('${v.id}')">Comparar</button><button onclick="dzvDup('${v.id}')">Duplicar</button><button class="${v.approved ? 'on' : ''}" onclick="dzvApprove('${v.id}')">${v.approved ? '✔ Aprovada' : 'Aprovar'}</button><button class="x" onclick="dzvDel('${v.id}')" title="Excluir">×</button></div></div></article>`).join('') : '<p class="dzt-empty">Nenhuma versão salva ainda.</p>'}</div>`, 400);
  document.querySelectorAll('#dztDock canvas[data-ver]').forEach(cv => { const v = dzvList().find(x => x.id === cv.dataset.ver); if (v && v.slides[0]) renderSlide(cv.getContext('2d'), v.slides[0], s.format.w, s.format.h, cv.width / s.format.w); });
}
DZT.docks.ver = dzvOpenDock;
function dzvSaveNow() { const n = $('dzvName'), v = dzvSave(n ? n.value.trim() : ''); toast('Versão “' + v.name + '” salva (' + dzvList().length + '/' + DZV_MAX + ').'); dzvOpenDock(); }
async function dzvRestore(id) {
  const s = dzSet(), v = dzvList().find(x => x.id === id); if (!v) return; if (!confirm('Restaurar “' + v.name + '”? A arte atual é guardada antes como versão automática.')) return;
  dzvSave('Antes de restaurar “' + v.name + '”', true); s.slides = JSON.parse(JSON.stringify(v.slides)); dz.slide = Math.min(dz.slide, s.slides.length - 1); dztSetSel([]); await ensureSetResources(s); dzCommit(); dzSlidesPanel(); dzInspector(); dzDraw(); dzvOpenDock(); toast('Versão restaurada. Ctrl+Z desfaz.');
}
function dzvDup(id) {
  const p = dzP(), s = dzSet(), v = dzvList().find(x => x.id === id); if (!v) return; const n = JSON.parse(JSON.stringify(Object.assign({}, s, {versions: []})));
  n.id = uid('ds'); n.name = (s.name + ' · ' + v.name).slice(0, 80); n.slides = JSON.parse(JSON.stringify(v.slides)); delete n.srcId; delete n.approved; n.created = n.updated = new Date().toISOString(); p.design.sets.push(n); persist(); toast('Cópia criada na biblioteca: “' + n.name + '”.');
}
function dzvApprove(id) {
  const s = dzSet(), list = dzvList(), v = list.find(x => x.id === id); if (!v) return; const on = !v.approved; list.forEach(x => { x.approved = false; }); v.approved = on; if (on) s.approved = true; persist();
  toast(on ? 'Versão “' + v.name + '” aprovada. A arte também fica marcada como aprovada (libera outros tamanhos e variações).' : 'Aprovação da versão retirada.'); dzvOpenDock(); if (on) renderDesign();
}
function dzvDel(id) { const s = dzSet(); if (!confirm('Excluir esta versão?')) return; s.versions = dzvList().filter(x => x.id !== id); persist(); dzvOpenDock(); }
/* comparar: versão × atual, com mapa de diferenças */
async function dzvCompare(id, idx) {
  const s = dzSet(), v = dzvList().find(x => x.id === id); if (!v) return; idx = Math.max(0, Math.min(idx == null ? dz.slide : idx, Math.min(v.slides.length, s.slides.length) - 1)); await ensureSetResources(s);
  const W = s.format.w, H = s.format.h, k = Math.min(1, 420 / W, 420 / H), cw = Math.round(W * k), ch = Math.round(H * k), mk = sl => { const c = document.createElement('canvas'); c.width = cw; c.height = ch; renderSlide(c.getContext('2d'), sl, W, H, k); return c; };
  const a = mk(v.slides[idx]), b = mk(s.slides[idx]), d = document.createElement('canvas'); d.width = cw; d.height = ch; const dx = d.getContext('2d'), da = a.getContext('2d').getImageData(0, 0, cw, ch), db = b.getContext('2d').getImageData(0, 0, cw, ch), out = dx.createImageData(cw, ch); let diff = 0;
  for (let i = 0; i < da.data.length; i += 4) { const c = Math.abs(da.data[i] - db.data[i]) + Math.abs(da.data[i + 1] - db.data[i + 1]) + Math.abs(da.data[i + 2] - db.data[i + 2]); if (c > 48) { out.data[i] = 255; out.data[i + 1] = 61; out.data[i + 2] = 87; out.data[i + 3] = 255; diff++; } else { const g = (db.data[i] + db.data[i + 1] + db.data[i + 2]) / 3 * 0.25 + 150 * .0; out.data[i] = out.data[i + 1] = out.data[i + 2] = g; out.data[i + 3] = 255; } }
  dx.putImageData(out, 0, 0); const old = v.slides[idx].layers, cur = s.slides[idx].layers, oi = new Map(old.map(l => [l.id, l])), ci = new Map(cur.map(l => [l.id, l]));
  const added = cur.filter(l => !oi.has(l.id)), removed = old.filter(l => !ci.has(l.id)), changed = cur.filter(l => oi.has(l.id) && JSON.stringify(oi.get(l.id)) !== JSON.stringify(l)), nm = l => esc(dzmLabel(l).nm);
  const o = document.createElement('div'); o.id = 'dztCmp'; o.className = 'dzt-over';
  o.innerHTML = `<header><b>Comparar · ${esc(v.name)} × atual</b><span class="nav">${v.slides.length > 1 ? v.slides.map((_, i) => `<button class="${i === idx ? 'on' : ''}" onclick="dzvCompare('${id}',${i})">${i + 1}</button>`).join('') : ''}</span><button onclick="document.getElementById('dztCmp').remove()">✕ Fechar</button></header>
  <div class="cmp"><figure></figure><figure></figure><figure></figure></div><div class="sum"><span><b>${((diff / (cw * ch)) * 100).toFixed(1)}%</b> da imagem mudou</span><span>${added.length} adicionada(s)${added.length ? ': ' + added.slice(0, 6).map(nm).join(', ') : ''}</span><span>${removed.length} removida(s)${removed.length ? ': ' + removed.slice(0, 6).map(nm).join(', ') : ''}</span><span>${changed.length} alterada(s)${changed.length ? ': ' + changed.slice(0, 6).map(nm).join(', ') : ''}</span></div>`;
  const old0 = $('dztCmp'); if (old0) old0.remove(); document.body.appendChild(o); const fs = o.querySelectorAll('figure'); [[a, 'Versão: ' + v.name], [b, 'Atual'], [d, 'Diferenças (vermelho)']].forEach(([c, t], i) => { fs[i].appendChild(c); const f = document.createElement('figcaption'); f.textContent = t; fs[i].appendChild(f); });
}

/* ================= SISTEMA (design system da arte) ================= */
const DZS_COLORS = [['bg', 'Fundo'], ['fg', 'Texto'], ['accent', 'Destaque'], ['muted', 'Apoio'], ['second', 'Cor 2']];
const dzsLow = c => String(c || '').toLowerCase();
function dzsTargets() { const s = dzSet(), p = dzP(), link = DZT.sisLink !== false; return [s].concat(link ? p.design.sets.filter(x => x.srcId === s.id) : []); }
function dzsOpenDock() {
  const s = dzSet(), tk = s.tk, fam = dzP().design.sets.filter(x => x.srcId === s.id), fonts = fontChoices(), margin = tk.margin != null ? tk.margin : 90, rad = tk.radius || 0;
  dztDock('sis', '◈ Sistema <small style="color:var(--m-mut)">design system da arte</small>', `<p class="dzt-tip" style="margin:0 0 8px">Mudou aqui, muda em <b>todas as camadas que usam</b> aquela cor, fonte ou medida${fam.length ? ' — e nos ' + fam.length + ' tamanho(s) ligado(s)' : ''}.</p>
  <h5 class="dzt-h5">Cores</h5><div class="dzt-tok">${DZS_COLORS.filter(([k]) => tk[k] || k !== 'second').map(([k, n]) => `<label><span>${n}</span><input type="color" data-tok="${k}" value="${esc(dztHexOf(tk[k] || '#888888'))}" oninput="dzsColor('${k}',this.value)"><code>${esc(dztHexOf(tk[k] || '#888888'))}</code></label>`).join('')}</div>
  <h5 class="dzt-h5">Fontes</h5><label class="dzt-tokf"><span>Títulos</span><select data-tokf="head" onchange="dzsFont('head',this.value)">${fonts.map(f => `<option ${f === tk.head.family ? 'selected' : ''}>${esc(f)}</option>`).join('')}</select></label><label class="dzt-tokf"><span>Textos</span><select data-tokf="body" onchange="dzsFont('body',this.value)">${fonts.map(f => `<option ${f === tk.body.family ? 'selected' : ''}>${esc(f)}</option>`).join('')}</select></label>
  <h5 class="dzt-h5">Espaçamento e bordas</h5><label class="dzt-tokf"><span>Margem (px)</span><span class="dzt-inl"><input id="dzsMargin" type="number" min="0" max="600" value="${margin}"><button onclick="dzsMargin(+$('dzsMargin').value)">Aplicar</button></span></label>
  <label class="dzt-tokf"><span>Cantos <b id="dzsRv">${rad}</b></span><input type="range" min="0" max="120" value="${rad}" oninput="$('dzsRv').textContent=this.value;dzsRadius(+this.value)"></label>
  <label class="dzt-row" style="margin-top:8px"><input type="checkbox" ${DZT.sisLink !== false ? 'checked' : ''} onchange="DZT.sisLink=this.checked"> Também nos tamanhos ligados (${fam.length})</label>
  <div class="dzt-links" style="margin-top:8px"><button class="btn sm" onclick="dzsFromBrand()">Puxar do Kit de marca</button><button class="btn sm" onclick="dzSaveStyle()">Salvar como estilo</button><button class="btn sm" onclick="dzApplyStyleModal()">Aplicar estilo…</button></div>
  <small class="muted block" style="margin-top:8px">As cores trocam onde a cor da camada é igual à do token. Margem: move os elementos que estão exatamente na margem atual (só desta arte). Desfazer volta as camadas; o token fica como está.</small>`, 380);
}
DZT.docks.sis = dzsOpenDock;
function dzsRecolor(set, old, nu, key) {
  const o = dzsLow(old), eq = c => c && dzsLow(c) === o, onlyShapes = key === 'bg'; let n = 0, tkAcc = key === 'accent' ? [readable(old), readable(nu)] : null;
  set.slides.forEach(sl => { if (eq(sl.bg)) { sl.bg = nu; n++; } sl.layers.forEach(L => {
    const props = onlyShapes ? (L.type === 'rect' || L.type === 'path' ? ['fill', 'stroke'] : []) : ['color', 'fill', 'stroke', 'emColor', 'emBg', 'ovColor', 'plate'];
    props.forEach(k => { if (eq(L[k])) { L[k] = nu; n++; } });
    if (!onlyShapes) { if (L.grad) ['c1', 'c2'].forEach(k => { if (eq(L.grad[k])) { L.grad[k] = nu; n++; } }); (L.spans || []).forEach(sp => { if (sp.st && eq(sp.st.color)) { sp.st.color = nu; n++; } }); }
    if (tkAcc && L.type === 'text' && (L.role === 'cta-text' || L.onChip) && dzsLow(L.color) === dzsLow(tkAcc[0])) L.color = tkAcc[1];
    if (tkAcc && L.type === 'text' && L.emMode === 'bg' && dzsLow(L.emText) === dzsLow(tkAcc[0])) L.emText = tkAcc[1];
  }); });
  return n;
}
function dzsColor(key, v) {
  const s = dzSet(); if (!s || !s.tk || dzsLow(s.tk[key]) === dzsLow(v)) return; let n = 0;
  dzsTargets().forEach(t => { const old = t.tk[key]; if (old) n += dzsRecolor(t, old, v, key); t.tk[key] = v; });
  document.querySelectorAll('#dztDock [data-tok="' + key + '"]').forEach(i => { if (i.nextElementSibling) i.nextElementSibling.textContent = v; }); persist(); dzDraw(); dzCommitSoon(); dzSlidesPanel();
}
async function dzsFont(which, f) {
  await ensureFont(f); const s = dzSet(); let n = 0;
  dzsTargets().forEach(t => { const old = t.tk[which].family, other = t.tk[which === 'head' ? 'body' : 'head'].family, same = old === other, heads = ['title', 'cta-text'];
    t.slides.forEach(sl => sl.layers.forEach(L => { if (L.type !== 'text') return; const isHead = heads.includes(L.role); if (L.family === old && (!same || (which === 'head') === isHead)) { L.family = f; n++; } (L.spans || []).forEach(sp => { if (sp.st && sp.st.family === old) sp.st.family = f; }); }));
    t.tk[which] = Object.assign({}, t.tk[which], {family: f}); });
  persist(); dzDraw(); dzCommit(); dzSlidesPanel(); toast(n + ' texto(s) com a nova fonte.');
}
function dzsMargin(v) {
  const s = dzSet(), old = s.tk.margin != null ? s.tk.margin : 90, nu = Math.max(0, Math.min(600, Math.round(+v || 0))), W = s.format.w; if (nu === old) return; let n = 0;
  s.slides.forEach(sl => sl.layers.forEach(L => { if (L.role === 'overlay' || L.locked) return; const left = Math.abs(L.x - old) <= 1, right = Math.abs(L.x + L.w - (W - old)) <= 1;
    if (left && right) { L.x = nu; L.w = W - 2 * nu; n++; } else if (left) { L.x = nu; n++; } else if (right) { L.x = W - nu - L.w; n++; } if (Math.abs(L.y - old) <= 1) { L.y = nu; n++; } }));
  s.tk.margin = nu; persist(); dzDraw(); dzCommit(); dzSlidesPanel(); toast(n ? n + ' ajuste(s) de posição pela nova margem.' : 'Margem guardada. Nenhum elemento estava exatamente na margem anterior.');
}
function dzsRadius(v) {
  dzsTargets().forEach((t, i) => { const base = dzSet().format.w, kv = i === 0 ? 1 : t.format.w / base, old = t.tk.radius || 0, mul = L => (L.role === 'cta-fill' ? 2 : 1);
    t.slides.forEach(sl => sl.layers.forEach(L => { if (L.type !== 'rect' && L.type !== 'image') return; const r = L.radius || 0, tgt = old * mul(L) * kv; if ((old > 0 && Math.abs(r - tgt) <= 1) || (old === 0 && r === 0 && ['photo', 'cta-fill', 'panel'].includes(L.role))) L.radius = Math.round(v * mul(L) * kv); }));
    t.tk.radius = v; });
  persist(); dzDraw(); dzCommitSoon(); dzSlidesPanel();
}
function dzsFromBrand() {
  const p = dzP(); let bt; try { bt = brandTokens(p); } catch (e) { toast('Envie as cores no Kit de marca primeiro.'); return; } ['bg', 'fg', 'accent', 'muted'].forEach(k => { if (bt[k]) dzsColor(k, bt[k]); });
  dzsFont('head', bt.head.family).then(() => dzsFont('body', bt.body.family)).then(() => dzsOpenDock());
}

/* ================= PRÉVIA ================= */
DZT.docks.prev = () => dzvPreview();
async function dzvPreview(i) {
  const s = dzSet(); if (!s) return; await ensureSetResources(s); const p = dzP(); let idx = Math.max(0, Math.min(i == null ? dz.slide : i, s.slides.length - 1));
  const sib = s.srcId ? [p.design.sets.find(x => x.id === s.srcId), ...p.design.sets.filter(x => x.srcId === s.srcId && x.id !== s.id)].filter(Boolean) : p.design.sets.filter(x => x.srcId === s.id);
  for (const x of sib) await ensureSetResources(x);
  const old = $('dztPrev'); if (old) old.remove(); const o = document.createElement('div'); o.id = 'dztPrev'; o.className = 'dzt-prev';
  o.innerHTML = `<header><b>Prévia · ${esc(s.name)}</b><span class="nav"><button onclick="dzvPrevGo(-1)">◀</button><span id="dztPrevN"></span><button onclick="dzvPrevGo(1)">▶</button></span><small>${s.format.w}×${s.format.h} · sem guias nem seleção</small><button onclick="dzvPrevClose()">✕ Fechar (Esc)</button></header>
  <div class="body"><div class="main"><canvas id="dztPrevMain"></canvas></div>${sib.length ? `<aside class="side"><h5>Tamanhos ligados</h5>${sib.map(x => `<figure><canvas data-sib="${x.id}"></canvas><figcaption>${esc((x.format.id || '').slice(0, 16))} · ${x.format.w}×${x.format.h}</figcaption></figure>`).join('')}</aside>` : ''}</div>`;
  document.body.appendChild(o); DZT.prevIdx = idx;
  const paint = () => {
    const c = $('dztPrevMain'); if (!c) return; const W = s.format.w, H = s.format.h, k = Math.min((window.innerWidth - (sib.length ? 300 : 60)) / W, (window.innerHeight - 100) / H, 2); c.width = Math.round(W * k); c.height = Math.round(H * k); renderSlide(c.getContext('2d'), s.slides[DZT.prevIdx], W, H, k); $('dztPrevN').textContent = (DZT.prevIdx + 1) + ' / ' + s.slides.length;
    o.querySelectorAll('canvas[data-sib]').forEach(cv => { const x = sib.find(y => y.id === cv.dataset.sib), sl = x && x.slides[Math.min(DZT.prevIdx, x.slides.length - 1)]; if (!sl) return; const kk = Math.min(240 / x.format.w, 240 / x.format.h); cv.width = Math.round(x.format.w * kk); cv.height = Math.round(x.format.h * kk); renderSlide(cv.getContext('2d'), sl, x.format.w, x.format.h, kk); });
  };
  DZT.prevPaint = paint; paint(); document.addEventListener('keydown', dzvPrevKey, true); window.addEventListener('resize', paint);
}
function dzvPrevGo(d) { const s = dzSet(); DZT.prevIdx = Math.max(0, Math.min(s.slides.length - 1, DZT.prevIdx + d)); if (DZT.prevPaint) DZT.prevPaint(); }
function dzvPrevKey(e) { if (!$('dztPrev')) { document.removeEventListener('keydown', dzvPrevKey, true); return; } if (e.key === 'Escape') { dzvPrevClose(); e.preventDefault(); e.stopImmediatePropagation(); } else if (e.key === 'ArrowRight') { dzvPrevGo(1); e.preventDefault(); e.stopImmediatePropagation(); } else if (e.key === 'ArrowLeft') { dzvPrevGo(-1); e.preventDefault(); e.stopImmediatePropagation(); } }
function dzvPrevClose() { const o = $('dztPrev'); if (o) o.remove(); document.removeEventListener('keydown', dzvPrevKey, true); if (DZT.prevPaint) window.removeEventListener('resize', DZT.prevPaint); DZT.prevPaint = null; }

/* ================= IMPORTAR ================= */
DZT.docks.imp = () => dztDock('imp', '⇪ Importar', `<div class="dzt-imp"><button onclick="dztDockClose();dzAddImage()"><b>Imagem na arte</b><small>PNG, JPG, WebP ou GIF do seu computador (também dá para arrastar o arquivo para a arte ou colar com Ctrl+V)</small></button>
  <button onclick="dztDockClose();dzImportOpen()"><b>Imagem como arte nova</b><small>vira uma arte do tamanho da imagem, editável por cima</small></button>
  <button onclick="dztDockClose();dzvSvgPick()"><b>SVG (vetor)</b><small>entra como imagem nítida; o desenho não fica editável por pontos</small></button>
  <button class="off" disabled><b>Photoshop (PSD)</b><small>Importar PSD <u>não existe</u> aqui. Abra no Photoshop e exporte em PNG (ou cada camada em PNG) e use “Imagem na arte”. O caminho contrário funciona: Exportar → Photoshop (PSD) em camadas.</small></button>
  <button class="off" disabled><b>Figma</b><small>Importar arquivo do Figma <u>não existe</u>. Exporte o quadro em SVG ou PNG no Figma e use as opções acima.</small></button></div>`, 400);
async function dzvInsertFile(file, at) {
  const sl = dzSlide(); if (!sl) return; let blob = file;
  if (/svg/i.test(file.type) || /\.svg$/i.test(file.name || '')) { blob = await dzvRasterSvg(file); if (!blob) return; }
  let bmp; try { bmp = await createImageBitmap(blob); } catch (e) { toast('Não consegui ler essa imagem. Use PNG, JPG, WebP, GIF ou SVG.'); return; }
  const id = uid('img'); await imgPut(id, blob); IMGS.set(id, bmp); const f = dzSet().format, r = bmp.width / bmp.height; let w = Math.min(f.w * 0.7, bmp.width), h = w / r; if (h > f.h * 0.7) { h = f.h * 0.7; w = h * r; }
  const cx = at ? at.x : f.w / 2, cy = at ? at.y : f.h / 2, L = IM('photo', {x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), w: Math.round(w), h: Math.round(h), imgId: id, radius: 0}); L.role = 'image'; L.name = String(file.name || 'Imagem').replace(/\.[a-z0-9]+$/i, '').slice(0, 40); L.free = true;
  sl.layers.push(L); dztSetSel([L.id]); dztDone('Imagem inserida.');
}
function dzvSvgPick() { dzPickFile('image/svg+xml,.svg', f => dzvInsertFile(f)); }
/* SVG vira PNG (o navegador desenha o SVG como imagem: scripts do arquivo nunca rodam) */
async function dzvRasterSvg(file) {
  if (file.size > 5 * 1048576) { toast('SVG grande demais (máx. 5 MB).'); return null; }
  const url = URL.createObjectURL(new Blob([await file.text()], {type: 'image/svg+xml'}));
  try { const img = new Image(); img.src = url; await img.decode(); let w = img.naturalWidth || 1024, h = img.naturalHeight || 1024; const k = Math.min(3, 2400 / Math.max(w, h)); w = Math.max(16, Math.round(w * k)); h = Math.max(16, Math.round(h * k));
    const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h); return await new Promise(r => c.toBlob(r, 'image/png')); }
  catch (e) { toast('Não consegui abrir esse SVG.'); return null; } finally { URL.revokeObjectURL(url); }
}
const dztDropBase = dztDropOnStage;
dztDropOnStage = function (e) {
  const fs = e.dataTransfer && e.dataTransfer.files; if (fs && fs.length && /^image\//.test(fs[0].type)) { e.preventDefault(); const cv = $('dzCanvas'), r = cv.getBoundingClientRect(); return dzvInsertFile(fs[0], {x: (e.clientX - r.left) / r.width * cv.width, y: (e.clientY - r.top) / r.height * cv.height}); }
  return dztDropBase(e);
};
document.addEventListener('paste', e => { if (!dztActive() || dztTyping(e)) return; const it = [...((e.clipboardData && e.clipboardData.items) || [])].find(i => i.kind === 'file' && /^image\//.test(i.type)); if (it) { e.preventDefault(); dzvInsertFile(it.getAsFile()); } });

/* ================= IA ================= */
const DZA_COLORS = {azul: '#1f4fd8', vermelho: '#d6283a', verde: '#12805c', amarelo: '#f5c518', laranja: '#ff6a18', rosa: '#e83e8c', roxo: '#6d3fd1', preto: '#0b0b10', branco: '#ffffff', cinza: '#6b7280'};
const dzaNorm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
const DZA_CHIPS = ['Mudar fundo escuro', 'Fundo claro', 'Aumentar título', 'Diminuir título', 'Aumentar texto', 'Mais respiro', 'Menos respiro', 'Alinhar ao centro', 'Alinhar à esquerda', 'Cantos mais redondos'];
function dzaTargets(scope) { const s = dzSet(); if (scope === 'all') return s.slides.flatMap(sl => sl.layers); if (scope === 'sel') return dztLayers(); return dzSlide().layers; }
/* comandos simples, sempre os mesmos (sem IA): devolve o que fez, ou '' se não entendeu */
function dzaLocal(cmd, scope) {
  const t = dzaNorm(cmd), s = dzSet(), tk = s.tk, W = s.format.w, H = s.format.h, slides = scope === 'all' ? s.slides : [dzSlide()], all = dzaTargets(scope), texts = all.filter(l => l.type === 'text' && !l.hidden), role = r => texts.filter(l => l.role === r);
  const rescale = (ls, f) => { const cx = W / 2, cy = H / 2; ls.forEach(l => { if (l.role === 'overlay' || (l.w >= W * 0.95 && l.h >= H * 0.95) || l.locked) return; const h0 = l.type === 'text' ? layoutText(l).h : l.h, mx = l.x + l.w / 2, my = l.y + h0 / 2; l.w = Math.round(l.w * f); if (l.type === 'text') { l.size = Math.max(8, Math.round(l.size * f * 10) / 10); if (l.ls) l.ls = Math.round(l.ls * f * 10) / 10; } else l.h = Math.round(l.h * f); const nh = l.type === 'text' ? layoutText(l).h : l.h; l.x = Math.round(cx + (mx - cx) * f - l.w / 2); l.y = Math.round(cy + (my - cy) * f - nh / 2); }); };
  const setBg = (bg) => { slides.forEach(sl => { sl.bg = bg; sl.layers.forEach(l => { if (l.type !== 'text' || l.onPhoto) return; const ink = readable(bg); if (Math.abs(lum(l.color) - lum(bg)) < 0.35) l.color = l.role === 'muted' || l.role === 'brand' ? mixHex(ink, bg, 0.35) : ink; }); }); };
  let m;
  if (/fundo (escuro|preto)|modo escuro|tema escuro|deixar escuro/.test(t)) { setBg(mixHex('#0b0b10', tk.accent || '#ff6a18', 0.07)); return 'Fundo escuro e textos legíveis' + (scope === 'all' ? ' em todas as páginas.' : ' nesta página.'); }
  if (/fundo (claro|branco)|modo claro|tema claro/.test(t)) { setBg('#ffffff'); return 'Fundo claro e textos legíveis.'; }
  if ((m = t.match(/fundo (azul|vermelho|verde|amarelo|laranja|rosa|roxo|cinza)/))) { setBg(DZA_COLORS[m[1]]); return 'Fundo ' + m[1] + ' e textos legíveis.'; }
  if (/(aumentar|maior|crescer).{0,12}titulo|titulo maior/.test(t)) { const ls = role('title'); ls.forEach(l => { l.size = Math.min(320, Math.round(l.size * 1.15)); }); return ls.length ? 'Título 15% maior (' + ls.length + ').' : ''; }
  if (/(diminuir|menor|reduzir).{0,12}titulo|titulo menor/.test(t)) { const ls = role('title'); ls.forEach(l => { l.size = Math.max(16, Math.round(l.size / 1.15)); }); return ls.length ? 'Título 15% menor (' + ls.length + ').' : ''; }
  if (/(aumentar|maior).{0,12}texto|texto maior/.test(t)) { const ls = texts.filter(l => l.role !== 'title'); ls.forEach(l => { l.size = Math.min(320, Math.round(l.size * 1.12)); }); return ls.length ? 'Textos 12% maiores (' + ls.length + ').' : ''; }
  if (/(diminuir|menor|reduzir).{0,12}texto|texto menor/.test(t)) { const ls = texts.filter(l => l.role !== 'title'); ls.forEach(l => { l.size = Math.max(14, Math.round(l.size / 1.12)); }); return ls.length ? 'Textos 12% menores (' + ls.length + ').' : ''; }
  if (/(mais|dar|ganhar) (respiro|espaco)|respiro|arejar/.test(t) && !/menos/.test(t)) { rescale(all.filter(l => !l.hidden), 0.93); texts.forEach(l => { l.lh = Math.min(1.7, Math.round(((l.lh || 1.2) + 0.08) * 100) / 100); }); return 'Mais respiro: conteúdo 7% menor, centralizado, e entrelinha maior.'; }
  if (/menos (respiro|espaco)|mais compacto|compactar/.test(t)) { rescale(all.filter(l => !l.hidden), 1.06); return 'Menos respiro: conteúdo 6% maior.'; }
  if (/alinhar.*centro|centralizar|centro/.test(t)) { texts.forEach(l => { l.align = 'center'; l.x = Math.round((W - l.w) / 2); }); all.filter(l => l.type !== 'text' && !l.hidden && l.role !== 'overlay' && l.w < W * 0.95 && (scope === 'sel')).forEach(l => { l.x = Math.round((W - l.w) / 2); }); return texts.length ? 'Textos centralizados (' + texts.length + ').' : ''; }
  if (/alinhar.*esquerda/.test(t)) { const mg = tk.margin != null ? tk.margin : 90; texts.forEach(l => { l.align = 'left'; l.x = mg; }); return texts.length ? 'Textos alinhados à esquerda (' + texts.length + ').' : ''; }
  if (/alinhar.*direita/.test(t)) { const mg = tk.margin != null ? tk.margin : 90; texts.forEach(l => { l.align = 'right'; l.x = Math.round(W - mg - l.w); }); return texts.length ? 'Textos alinhados à direita (' + texts.length + ').' : ''; }
  if (/(cantos|bordas).{0,12}(redond|arredond)|arredondar/.test(t)) { const ls = all.filter(l => l.type === 'rect' || l.role === 'photo'); ls.forEach(l => { l.radius = Math.min(200, (l.radius || 0) + 24); }); return ls.length ? 'Cantos mais arredondados (' + ls.length + ').' : ''; }
  if (/(sem|tirar).{0,10}(cantos|bordas)|cantos retos/.test(t)) { all.filter(l => l.type === 'rect' || l.role === 'photo').forEach(l => { l.radius = 0; }); return 'Cantos retos.'; }
  return '';
}
const DZA_SET = {x: [-2000, 6000], y: [-2000, 6000], w: [10, 6000], h: [2, 6000], size: [8, 600], opacity: [0, 1], lh: [0.8, 2.4], ls: [-4, 30], radius: [0, 600], rot: [-180, 180]};
/* aplica o que a IA devolveu, validando cada campo (ids existentes, números dentro de limites, cores #rrggbb, alinhamento) */
function dzaApplyJSON(j, scope) {
  const slides = scope === 'all' ? dzSet().slides : [dzSlide()], byId = {}; slides.forEach(sl => sl.layers.forEach(l => { byId[l.id] = l; })); let n = 0, hex = v => /^#[0-9a-f]{6}$/i.test(String(v));
  (Array.isArray(j && j.ops) ? j.ops : []).slice(0, 80).forEach(op => { const L = op && byId[op.id], st = op && op.set; if (!L || !st || typeof st !== 'object') return;
    Object.entries(st).forEach(([k, v]) => { if (DZA_SET[k]) { const x = +v; if (isFinite(x) && !(L.type === 'text' && k === 'h')) { L[k] = Math.round(Math.min(DZA_SET[k][1], Math.max(DZA_SET[k][0], x)) * 100) / 100; n++; } }
      else if ((k === 'color' && L.type === 'text') || (k === 'fill' && L.type !== 'text')) { if (hex(v)) { L[k] = v; n++; } }
      else if (k === 'align' && L.type === 'text' && ['left', 'center', 'right'].includes(v)) { L.align = v; n++; }
      else if (k === 'content' && L.type === 'text' && typeof v === 'string') { const old = plainOf(L.content); L.content = v.replace(/[\u0000-\u0008\u000b-\u001f<>]/g, '').slice(0, 600); if (L.spans) L.spans = remapSpans(old, plainOf(L.content), L.spans); n++; } }); });
  if (j && hex(j.bg)) { slides.forEach(sl => { sl.bg = j.bg; }); n++; }
  return n;
}
async function dzaRun(cmd, scope) {
  cmd = String(cmd || '').trim(); if (!cmd) { toast('Escreva o que você quer mudar na arte.'); return; } const s = dzSet(); scope = scope || (dztIds().length ? 'sel' : (/todas as (paginas|telas|slides)|em todas/.test(dzaNorm(cmd)) ? 'all' : 'page'));
  const out = $('dzaOut'); const say = (t, ok) => { if (out) out.innerHTML = `<div class="dzt-ia ${ok ? 'ok' : ''}">${t}</div>`; };
  let ai = false; try { ai = typeof aiReady === 'function' && aiReady(); } catch (e) { ai = false; }
  if (ai) {
    say('Pedindo para a IA…', true);
    try {
      const W = s.format.w, H = s.format.h, ls = dzaTargets(scope === 'sel' ? 'sel' : 'page').map(l => ({id: l.id, tipo: l.type, papel: l.role, x: Math.round(l.x), y: Math.round(l.y), w: Math.round(l.w), h: Math.round(l.h || (LBOX[l.id] || {}).h || 0), tamanho: l.size, cor: l.color || l.fill, alinhamento: l.align, texto: l.type === 'text' ? plainOf(l.content).slice(0, 140) : undefined}));
      const j = await aiJSON(`Você ajusta o layout de uma arte desenhada em canvas de ${W}x${H} px. Recebe as camadas da página e um pedido. Responda JSON: {"ops":[{"id":"id da camada","set":{"x":0,"y":0,"w":0,"size":0,"color":"#rrggbb","fill":"#rrggbb","align":"left|center|right","opacity":1}}],"bg":"#rrggbb (opcional)","note":"o que você fez, em uma frase"}. Altere só o que o pedido exige, mantenha tudo dentro da arte, não invente fatos nem textos novos.`, 'Camadas: ' + JSON.stringify(ls) + '\nPedido: ' + cmd);
      const n = dzaApplyJSON(j, scope === 'all' ? 'all' : 'page'); if (typeof spendCredits === 'function') spendCredits(1); dztDone(); say('✦ IA: ' + esc(String((j && j.note) || 'ajustes aplicados')).slice(0, 200) + ` <small>(${n} campo(s) alterado(s))</small>`, true); return;
    } catch (e) { say('A IA não respondeu (' + esc(e.message) + '). Tentando um comando simples…', false); }
  }
  const r = dzaLocal(cmd, scope);
  if (r) { dztDone(); say((ai ? '' : '<b>IA desligada</b> — apliquei um comando simples (sem IA): ') + esc(r), true); }
  else say((ai ? '' : '<b>IA desligada.</b> ') + 'Não entendi esse pedido sem IA. Comandos simples que funcionam: ' + DZA_CHIPS.map(c => '“' + c.toLowerCase() + '”').join(', ') + '. Para pedidos livres, ligue a IA em Integrações.', false);
}
DZT.docks.ia = () => {
  let ai = false; try { ai = typeof aiReady === 'function' && aiReady(); } catch (e) { ai = false; }
  dztDock('ia', '✦ IA para a arte', `<p class="dzt-tip" style="margin:0 0 8px">${ai ? '<b style="color:#6be29b">IA ligada.</b> O pedido vai para a IA, que ajusta posições, tamanhos e cores das camadas desta página.' : '<b style="color:#ffb27a">IA desligada.</b> Aplico só os comandos simples abaixo (sempre o mesmo resultado, sem IA). Para pedidos livres, ligue a IA em Integrações.'}</p>
  <textarea id="dzaCmd" rows="3" placeholder="Ex.: mudar fundo escuro, aumentar título, mais respiro, alinhar ao centro…" onkeydown="if(event.key==='Enter'&&(event.ctrlKey||event.metaKey))dzaGo()"></textarea>
  <div class="dzt-links" style="margin:8px 0"><select id="dzaScope"><option value="">${dztIds().length ? 'Só a seleção' : 'Esta página'}</option><option value="all">Todas as páginas</option></select><button class="dzm-go" style="border-radius:9px" onclick="dzaGo()">Aplicar</button></div>
  <div class="dzt-chips">${DZA_CHIPS.map(c => `<button onclick="$('dzaCmd').value='${c}';dzaGo()">${c}</button>`).join('')}</div><div id="dzaOut"></div>
  <small class="muted block" style="margin-top:8px">Tudo o que a IA faz entra no histórico: Ctrl+Z desfaz. (A IA só foi testada com respostas simuladas.)</small>`, 400);
};
function dzaGo() { const c = $('dzaCmd'), sc = $('dzaScope'); dzaRun(c ? c.value : '', sc && sc.value ? sc.value : ''); }
