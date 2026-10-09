/* ===== Aparência em lote ===== 
   Carrosséis: ajuste um (@, cores, estilo, botão, modelo) e aplique a todos, sem mexer nos textos, mídias e legendas de cada um.
   Anúncios: aplique a cor e a imagem de uma peça a todas. Também: lista de carrosséis com busca, filtro por dia e páginas (240 miniaturas de uma vez travariam a tela). ===== */
const alNorm = s => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/* ---------- carrosséis: copiar a aparência ---------- */
const CAR_LOOK_GROUPS = [
  {k: 'ident', n: 'Identidade', d: 'nome da marca, @, direitos, avatar e o que aparece', def: 1},
  {k: 'cor', n: 'Cores e estilo', d: 'estilo, fundo escuro, cor de destaque, fonte do título e gradiente', def: 1},
  {k: 'cta', n: 'Botão (CTA)', d: 'estilo, posição, ícone e cores do botão', def: 1},
  {k: 'modelo', n: 'Modelo (layout)', d: 'o modelo da capa e dos miolos', def: 0},
  {k: 'prop', n: 'Proporção', d: '4:5 ou 9:16', def: 0}];
const carJ = o => JSON.parse(JSON.stringify(o));
function carLookPatch(src, groups) {
  const P = {}, has = k => groups.includes(k);
  if (has('ident')) P.globals = carJ(src.globals);
  if (has('cor')) Object.assign(P, {style: src.style, dark: src.dark, accent: src.accent, fontHead: src.fontHead, grad: src.grad});
  if (has('cta')) P.cta = {on: src.cta.on, style: src.cta.style, align: src.cta.align, icon: src.cta.icon, color: src.cta.color, textColor: src.cta.textColor};
  if (has('modelo')) Object.assign(P, {tpl: src.tpl, base: src.base, cover: src.cover, splitCover: src.splitCover});
  if (has('prop')) P.ratio = src.ratio;
  return P;
}
function carLookApply(c, P, src) {
  Object.keys(P).forEach(k => { if (k === 'gpart') Object.assign(c.globals, P.gpart); else if (k === 'cta') { Object.assign(c.cta, P.cta); if (!c.cta.text && src.cta.text) c.cta.text = src.cta.text; } else c[k] = carJ(P[k]); });
  c.updated = new Date().toISOString();
}
function carLookApplyAll(p, srcId, groups) {
  if (srcId === 'brand') { const P = carBrandPatch(p, groups, ''); if (!Object.keys(P).length) return 0; p.carousels.forEach(c => carLookApply(c, P, c)); return p.carousels.length; }
  const src = p.carousels.find(x => x.id === srcId); if (!src || !groups.length) return 0; const P = carLookPatch(src, groups); let n = 0;
  p.carousels.forEach(c => { if (c.id !== src.id) { carLookApply(c, P, src); n++; } }); return n;
}
function carLookModal(srcId) {
  const p = curProject(); if (!p || p.carousels.length < 2) { toast('Crie pelo menos 2 carrosséis para aplicar a aparência.'); return; }
  const cur = srcId || carUI.id || p.carousels[0].id, n = p.carousels.length - 1;
  showModal('Aplicar a aparência a todos os carrosséis', `<small class="muted block" style="margin-bottom:8px">Copia só o visual para os outros carrosséis. Os textos, legendas, referências, mídia e fundos de cada slide não mudam. <b>Brand book</b>: usa o logo como avatar, o nome do projeto, a fonte do título e a cor de destaque do Kit de marca (vale Identidade e Cores e estilo). ${esc(brandLine(p))}</small>
  <div class="field"><label>Copiar de</label><select id="clSrc"><option value="brand" ${cur === 'brand' ? 'selected' : ''}>Brand book do projeto (Kit de marca)</option>${p.carousels.map(x => `<option value="${esc(x.id)}" ${x.id === cur ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>
  ${CAR_LOOK_GROUPS.map(g => `<label class="ins inl" style="display:block;margin:6px 0"><input type="checkbox" class="clG" value="${g.k}" ${g.def ? 'checked' : ''}> <b>${g.n}</b> <small class="muted">${g.d}</small></label>`).join('')}
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="carLookGo()">Aplicar</button></div>`);
}
function carLookGo() {
  const p = curProject(), src = ($('clSrc') || {}).value, groups = [...document.querySelectorAll('.clG:checked')].map(x => x.value);
  if (!groups.length) { toast('Marque o que copiar.'); return; }
  if (!confirm('Aplicar a aparência escolhida a todos os outros carrosséis deste projeto?')) return;
  const n = carLookApplyAll(p, src, groups); if (!n) { toast('O Kit de marca ainda não tem logo, fonte ou cores: configure em Design → Kit de marca.'); return; } persist(); closeModal(); renderCarrosseis(); toast(`Aparência aplicada a ${n} carrossel(éis).`);
}

/* ---------- carrosséis: lista com busca, dia e páginas ---------- */
const carHome = {q: '', day: '', page: 0, size: 24};
function carHomeFiltered(p) {
  const q = alNorm(carHome.q).trim();
  return p.carousels.filter(x => (!carHome.day || (x.src && x.src.day) === carHome.day) && (!q || alNorm(x.name + ' ' + (x.src ? x.src.code + ' ' + x.src.theme : '')).includes(q)));
}
function carHomeList(p) {
  const all = carHomeFiltered(p), pages = Math.max(1, Math.ceil(all.length / carHome.size)); carHome.page = Math.max(0, Math.min(pages - 1, carHome.page));
  return all.slice(carHome.page * carHome.size, (carHome.page + 1) * carHome.size);
}
function carHomeBar(p) {
  if (p.carousels.length <= carHome.size && !carHome.q && !carHome.day) return '';
  const all = carHomeFiltered(p), pages = Math.max(1, Math.ceil(all.length / carHome.size)), days = [...new Set(p.carousels.map(x => x.src && x.src.day).filter(Boolean))].sort();
  return `<div class="row-gap" style="flex-wrap:wrap;align-items:center;margin-bottom:10px"><input id="carQ" placeholder="Buscar por nome, código (P001) ou tema" value="${esc(carHome.q)}" style="min-width:240px" onkeydown="if(event.key==='Enter')carHomeSet('q',this.value)" onchange="carHomeSet('q',this.value)">${days.length ? `<select onchange="carHomeSet('day',this.value)"><option value="">Todos os dias</option>${days.map(d => `<option ${d === carHome.day ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select>` : ''}<span class="muted" style="font-size:12.5px">${all.length} de ${p.carousels.length} carrosséis</span><span style="flex:1"></span><button class="btn sm" ${carHome.page === 0 ? 'disabled' : ''} onclick="carHomeSet('page',${carHome.page - 1})">‹</button><small class="muted">página ${carHome.page + 1} de ${pages}</small><button class="btn sm" ${carHome.page >= pages - 1 ? 'disabled' : ''} onclick="carHomeSet('page',${carHome.page + 1})">›</button></div>`;
}
function carHomeSet(k, v) { carHome[k] = k === 'page' ? +v : String(v); if (k !== 'page') carHome.page = 0; renderCarrosseis(); }

/* ---------- carrosséis: dados do planejamento e referência visual de cada slide ---------- */
function carRefHTML(c, fr) {
  const S = c.src || {}, R = (c.refs || [])[fr], parts = [S.code, S.day, S.theme, S.type, S.tension].filter(Boolean);
  if (!parts.length && !R) return '';
  const q = R && R.term ? encodeURIComponent(R.term) : '';
  return `<div style="margin-top:8px;padding:8px 10px;background:#f6f4ef;border-radius:8px;font-size:12px">${parts.length ? `<div class="muted">${parts.map(esc).join(' · ')}</div>` : ''}${R && R.ref ? `<div style="margin-top:6px"><b>Referência visual</b><br>${esc(R.ref)}</div>` : ''}${R && R.brands ? `<div style="margin-top:4px"><b>Marcas de referência:</b> ${esc(R.brands)}</div>` : ''}${R && R.term ? `<div style="margin-top:4px"><b>Busca de imagem:</b> ${esc(R.term)}</div><div class="row-gap" style="margin-top:6px"><a class="btn sm" target="_blank" rel="noopener" href="https://www.google.com/search?tbm=isch&q=${q}">Buscar no Google Imagens</a><button class="btn sm" onclick="navigator.clipboard&&navigator.clipboard.writeText(${esc(JSON.stringify(R.term))});toast('Termo copiado.')">Copiar termo</button></div>` : ''}</div>`;
}

/* ---------- anúncios: textos do Meta (ID, ângulo, texto principal, descrição) e cor/imagem para todas ---------- */
function cmpMetaHTML(c, q) {
  const has = q.code || q.angle || q.copy || q.desc, id = c.id + '_' + q.id;
  return `<details class="cmp-meta" style="margin:8px 0" ${has ? 'open' : ''}><summary style="cursor:pointer;font-size:12.5px"><b>Textos do anúncio no Meta</b> <small class="muted">${has ? [q.code, q.angle].filter(Boolean).map(esc).join(' · ') : 'texto principal, descrição, ângulo'}</small></summary>
  <div class="form-grid" style="margin-top:8px"><div class="field full"><label>Texto principal <small class="muted" id="cmpN_${id}">${q.copy.length} / 2200</small></label><textarea rows="4" oninput="cmpPieceTxt('${c.id}','${q.id}','copy',this.value)">${esc(q.copy)}</textarea></div>
  <div class="field full"><label>Descrição <small class="muted" id="cmpD_${id}">${q.desc.length} / 150</small></label><input value="${esc(q.desc)}" oninput="cmpPieceTxt('${c.id}','${q.id}','desc',this.value)"></div>
  <div class="field"><label>Ângulo</label><input value="${esc(q.angle)}" oninput="cmpPieceTxt('${c.id}','${q.id}','angle',this.value)"></div><div class="field"><label>ID</label><input value="${esc(q.code)}" oninput="cmpPieceTxt('${c.id}','${q.id}','code',this.value)"></div></div>
  <div class="row-gap" style="margin-top:6px"><button class="btn sm" onclick="cmpLookAll('${c.id}','${q.id}')" title="Copia a cor e a imagem desta peça para todas as outras e refaz as artes">Aplicar a cor e a imagem desta peça a todas</button></div></details>`;
}
function cmpPieceTxt(cid, pid, k, v) {
  const c = cmpOf(curProject(), cid), q = c && c.pieces.find(x => x.id === pid); if (!q || !['copy', 'desc', 'angle', 'code'].includes(k)) return;
  const max = {copy: 2200, desc: 150, angle: 100, code: 20}[k]; q[k] = String(v).slice(0, max); persist();
  const el = $(({copy: 'cmpN_', desc: 'cmpD_'}[k] || 'x') + cid + '_' + pid); if (el) el.textContent = q[k].length + ' / ' + max;
}
function cmpLookApplyAll(c, srcQ) { let n = 0; c.pieces.forEach(q => { if (q.id !== srcQ.id) { q.col = srcQ.col; q.imgId = srcQ.imgId; n++; } }); return n; }
async function cmpLookAll(cid, pid) {
  const p = curProject(), c = cmpOf(p, cid), src = c && c.pieces.find(x => x.id === pid); if (!src) return;
  if (!confirm('Copiar a cor e a imagem desta peça para todas as outras da campanha e refazer as artes? Medidas travadas (ajustadas à mão) são mantidas.')) return;
  const n = cmpLookApplyAll(c, src); cmpUI.busy = true; cmpRender();
  try { for (const q of c.pieces) { if (q.id === src.id) continue; const m = cmpSetOf(p, q.sets.feed); if (m && q.lock.feed) continue; await cmpBuildPiece(p, c, q); } } finally { cmpUI.busy = false; }
  persist(); cmpRender(); toast(`Cor e imagem aplicadas a ${n} peça(s).`);
}

/* ---------- brand book (Design → Kit de marca): logo, fontes e cores ---------- */
function brandPick(b) { return b.logos.find(l => l.tone === 'any') || b.logos.find(l => l.tone === 'light') || b.logos[0] || null; }
function brandInfo(p) { const b = brandOf(p); return {logos: b.logos.length, head: b.headFont || '', body: b.bodyFont || '', colors: isHex(b.pal.c60), accent: isHex(b.pal.c10) ? b.pal.c10 : ''}; }
function brandLine(p) {
  if (!p) return 'Projeto novo: ainda sem Kit de marca. Configure em Design → Kit de marca e depois use Aplicar a todos…';
  const i = brandInfo(p), ok = [i.logos ? 'logo' : '', i.head ? 'fonte ' + i.head : '', i.colors ? 'cores' : ''].filter(Boolean), no = [!i.logos ? 'logo' : '', !i.head ? 'fonte' : '', !i.colors ? 'cores' : ''].filter(Boolean);
  return ok.length ? `Kit de marca: ${ok.join(', ')}${no.length ? ' (falta: ' + no.join(', ') + ')' : ''}.` : 'O Kit de marca deste projeto ainda está vazio (Design → Kit de marca). Sem ele os carrosséis usam o estilo neutro; depois de configurar use Aplicar a todos….';
}
function carBrandPatch(p, groups, styleId) {
  const b = brandOf(p), lg = brandPick(b), P = {};
  if (groups.includes('ident')) { const g = {name: p.name}; if (lg) g.avatarId = lg.imgId; P.gpart = g; }
  if (groups.includes('cor')) { const hasKit = isHex(b.pal.c60) || b.headFont || lg; if (hasKit) P.style = styleId || ''; if (isHex(b.pal.c10)) P.accent = b.pal.c10; if (b.headFont) P.fontHead = String(b.headFont).replace(/[^\w \-]/g, '').trim(); }
  return P;
}
/* logo da marca na arte do anúncio: no lugar do nome da marca, na versão certa para o fundo */
function cmpPutLogo(p, sl, f, tk) {
  const b = brandOf(p); if (!b.logos.length) return; const dark = lum(tk.bg) < 0.35;
  const lg = b.logos.find(l => l.tone === (dark ? 'dark' : 'light')) || b.logos.find(l => l.tone === 'any') || b.logos[0], ar = lg.w && lg.h ? lg.w / lg.h : 3;
  const m = Math.round(Math.min(f.w, f.h) * 0.06), hh = Math.round(f.h * 0.07), ww = Math.min(Math.round(hh * ar), Math.round(f.w * 0.4)), h2 = Math.round(ww / ar);
  sl.layers = sl.layers.filter(L => L.role !== 'brand'); sl.layers.push(IM('logo', {imgId: lg.imgId, x: m, y: f.h - m - h2, w: ww, h: h2}));
}
function cmpLogoSet(cid, on) { const c = cmpOf(curProject(), cid); if (!c) return; if (on && !brandOf(curProject()).logos.length) { toast('Envie um logo em Design → Kit de marca primeiro.'); cmpRender(); return; } c.logo = !!on; persist(); toast('Clique em "Aplicar a todas as peças" para refazer as artes com esta opção.'); }
