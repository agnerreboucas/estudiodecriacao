/* ===== Banco de templates importados: assistente de importação (ZIP), banco global, uso nas páginas/sites e painel de edição da seção ===== */
const tplUI = {zip: null, file: '', pages: [], sel: new Set(), docs: false, secs: [], busy: '', ctx: null, name: '', niche: '', kindF: '', tplF: '', brand: true, nested: []};
const tplA = s => esc(String(s == null ? '' : s));
const tplBankList = () => state.tplbank.items;
SEC_GROUPS.push(['importados', 'Importados']);

/* miniatura (iframe) de uma seção importada */
let tplFake = null;
async function tplSrcdoc(pl, id) {
  TPL_R.cache.set(id, pl); if (!tplFake) tplFake = normalizeLandings([{id: 'tplprev', name: 'prévia'}])[0];
  TPL_R.fonts = new Set(); TPL_R.css = []; TPL_R.form = true; TPL_R.hf = false;
  const sid = 'tp_' + String(id).replace(/[^\w]/g, '').slice(-10), h = await tplWidgetHTML({tpl: {id, s: {}, i: {}, h: {}, map: {}, fonts: {}}}, sid, '', false, tplFake, 800);
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=1280"><style>body{margin:0;font-family:system-ui,sans-serif;background:#fff}*{animation:none!important}</style>${lpFontsLink({head: '', body: ''}, pl.gf || [], [400, 700])}<style>${TPL_R.css.join('\n')}</style></head><body>${h}</body></html>`;
}
async function tplFillThumbs(root) {
  for (const box of [...(root || document).querySelectorAll('[data-tplth]')]) {
    const id = box.dataset.tplth; try { const pl = tplUI.tmp && tplUI.tmp.get(id) || await tplPayload(id); if (!pl) { box.innerHTML = '<small class="muted">sem prévia</small>'; continue; } box.innerHTML = `<iframe sandbox="" tabindex="-1" srcdoc="${esc(await tplSrcdoc(pl, id))}"></iframe>`; } catch (e) { box.innerHTML = '<small class="muted">sem prévia</small>'; }
  }
}

/* ---------- importação ---------- */
function tplGuess(name) {
  const base = name.replace(/^[0-9a-f]{8}-/i, '').replace(/\.zip$/i, '').replace(/-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}-utc$/i, '').replace(/^themeforest-\d+-/i, '').replace(/-(html|php|wordpress)?-?(template|theme).*$/i, '').replace(/[-_]+/g, ' ').trim();
  const nm = base.replace(/\b\w/g, c => c.toUpperCase()).slice(0, 60) || 'Template', t = name.toLowerCase();
  return {name: nm, niche: /law|attorney|lawyer|advog/.test(t) ? 'Advocacia' : /garden|lawn|landscap/.test(t) ? 'Jardinagem' : /dent|clinic|medic|health/.test(t) ? 'Saúde' : /restaurant|food/.test(t) ? 'Restaurante' : ''};
}
function tplImportOpen() {
  Object.assign(tplUI, {zip: null, file: '', pages: [], sel: new Set(), secs: [], busy: '', ctx: null, tmp: new Map(), nested: []}); tplStep1();
}
function tplStep1(msg) {
  showModal('Importar template (ZIP)', `<p style="font-size:13px;margin:0 0 8px">Suba o ZIP do template (HTML estático ou PHP simples, como vem da Envato). O arquivo é lido aqui no navegador. Eu separo as seções de cada página, tiro scripts e rastreadores e deixo textos, imagens e links editáveis. Nada do demo é publicado: o conteúdo é trocado pelo do seu projeto.</p>
  <label class="ins inl" style="margin-bottom:8px"><input type="checkbox" id="tplLic"> Tenho licença de uso deste template e vou usá-lo só em projetos permitidos por ela.</label>
  <input type="file" id="tplFile" accept=".zip,application/zip" onchange="tplOnFile(this.files[0])"><div class="muted" style="font-size:12.5px;margin-top:8px">${msg || ''}</div>
  <small class="muted block" style="margin-top:8px">Limites: sliders, menus que abrem e animações dependem de JavaScript e não são trazidos (o slider vira rolagem lateral, e a animação de entrada some). Templates WordPress (tema PHP) não rodam aqui: exporte o demo em HTML estático ou envie o template HTML equivalente.</small>`);
  $('modalBox').classList.add('wide');
}
async function tplOnFile(f) {
  if (!f) return; if (!$('tplLic').checked) { tplStep1('Marque a confirmação de licença para continuar.'); return; }
  tplStep1('Lendo o ZIP…'); $('modalBox').classList.add('wide');
  try {
    let z = await tplZipOpen(f), pages = tplPages(z), nested = [...z.ents.keys()].filter(k => /\.zip$/i.test(k));
    if (!pages.length && nested.length) { const e = nested.sort((a, b) => z.ents.get(b).us - z.ents.get(a).us)[0]; z = await tplZipOpen(new Blob([await z.read(e)])); pages = tplPages(z); }
    if (!pages.length) { tplStep1('Não achei páginas .html ou .php dentro do ZIP. Se for um tema WordPress, exporte o demo em HTML ou envie o template HTML.'); return; }
    const g = tplGuess(f.name); Object.assign(tplUI, {zip: z, file: f.name, pages, sel: new Set(pages.filter(p => !p.doc).slice(0, 3).map(p => p.path)), name: g.name, niche: g.niche, secs: []}); tplStep2();
  } catch (e) { tplStep1('Não consegui abrir: ' + esc(e.message || e)); }
}
function tplStep2(msg) {
  const U = tplUI, shown = U.pages.filter(p => U.docs || !p.doc);
  showModal('Importar template — escolha as páginas', `<small class="muted block" style="margin-bottom:6px">${tplA(U.file)} · ${U.pages.length} página(s) encontradas. Marque as que quer analisar (até 8 por vez; a página inicial costuma trazer quase todas as seções).</small>
  <div class="field"><label>Nome do template</label><input value="${tplA(U.name)}" oninput="tplUI.name=this.value"></div><div class="field"><label>Nicho (opcional, ajuda a achar depois)</label><input value="${tplA(U.niche)}" placeholder="Ex.: Advocacia, Jardinagem" oninput="tplUI.niche=this.value"></div>
  <div style="max-height:260px;overflow:auto;border:1px solid var(--line,#ddd);border-radius:8px;padding:6px">${shown.map(p => `<label class="ins inl" style="display:flex;gap:6px;padding:2px 0"><input type="checkbox" ${U.sel.has(p.path) ? 'checked' : ''} onchange="tplTogglePage('${tplA(p.path).replace(/'/g, '&#39;')}',this.checked)"> <span class="mono" style="font-size:12px">${tplA(p.path)}</span> <small class="muted">${Math.round(p.size / 1024)} KB${/\.php$/i.test(p.path) ? ' · PHP' : ''}</small></label>`).join('')}</div>
  <label class="ins inl" style="margin-top:6px"><input type="checkbox" ${U.docs ? 'checked' : ''} onchange="tplUI.docs=this.checked;tplStep2()"> mostrar também a documentação do template</label>
  <div class="row-gap" style="margin-top:10px"><button class="btn dark" id="tplGo" onclick="tplAnalyzeSel()" ${U.busy ? 'disabled' : ''}>${U.busy ? esc(U.busy) : 'Analisar páginas marcadas (' + U.sel.size + ')'}</button><button class="btn" onclick="tplStep1()">Trocar arquivo</button></div><div class="muted" style="font-size:12.5px;margin-top:6px">${msg || ''}</div>`);
  $('modalBox').classList.add('wide');
}
function tplTogglePage(p, on) { if (on) tplUI.sel.add(p); else tplUI.sel.delete(p); const b = $('tplGo'); if (b) b.textContent = 'Analisar páginas marcadas (' + tplUI.sel.size + ')'; }
async function tplAnalyzeSel() {
  const U = tplUI, pages = [...U.sel].slice(0, 8); if (!pages.length) { tplStep2('Marque pelo menos uma página.'); return; }
  U.ctx = {imgs: new Map(), fonts: new Map(), created: new Set(), miss: 0, ext: 0}; U.secs = []; U.tmp = new Map();
  for (let i = 0; i < pages.length; i++) {
    U.busy = `Analisando ${i + 1}/${pages.length}: ${pages[i].split('/').pop()}…`; const b = $('tplGo'); if (b) { b.disabled = true; b.textContent = U.busy; }
    try { const r = await tplAnalyze(U.zip, pages[i], U.ctx); r.forEach(s => { s.page = pages[i].split('/').pop().replace(/\.(html?|php)$/i, ''); s.key = 's' + U.secs.length; s.on = !['header', 'footer'].includes(s.kind); U.secs.push(s); }); } catch (e) { console.warn('tpl', pages[i], e); }
  }
  U.busy = ''; if (!U.secs.length) { tplStep2('Não encontrei seções nessas páginas. Tente outra página (a inicial costuma funcionar).'); return; } tplStep3();
}
function tplStep3() {
  const U = tplUI, byPage = {}; U.secs.forEach(s => { (byPage[s.page] = byPage[s.page] || []).push(s); });
  showModal('Importar template — escolha as seções', `<small class="muted block" style="margin-bottom:6px">${U.secs.length} seção(ões) em ${Object.keys(byPage).length} página(s). Desmarque o que não quiser guardar. Cabeçalho e rodapé vêm desmarcados, porque o Site já tem os dele.${U.ctx.miss ? ` ${U.ctx.miss} arquivo(s) de imagem/fonte não puderam ser lidos.` : ''}${U.ctx.ext ? ` ${U.ctx.ext} recurso(s) externo(s) (imagens ou CSS de CDN) foram ignorados.` : ''}</small>
  ${Object.entries(byPage).map(([pg, ss]) => `<h4 style="margin:10px 0 4px">${tplA(pg)}</h4><div class="sec-grid">${ss.map(s => `<div class="sec-card"><div class="sec-th tpl-th" data-tplth="tpx_${s.key}"><small class="muted">carregando…</small></div><label class="ins inl"><input type="checkbox" ${s.on ? 'checked' : ''} onchange="tplSecOn('${s.key}',this.checked)"> guardar</label><input value="${tplA(s.name)}" oninput="tplSecSet('${s.key}','name',this.value)"><select onchange="tplSecSet('${s.key}','kind',this.value)">${Object.entries(TPL_KINDS).map(([k, n]) => `<option value="${k}" ${s.kind === k ? 'selected' : ''}>${n}</option>`).join('')}</select><small class="muted">${Math.round(s.size / 1024)} KB · ${Object.keys(s.payload.slots.s).length} textos · ${Object.keys(s.payload.slots.i).length} imagens${s.pending ? ' · formulário' : ''}</small></div>`).join('')}</div>`).join('')}
  <div class="row-gap" style="margin-top:12px;flex-wrap:wrap"><button class="btn dark" onclick="tplSave()">Salvar no banco de templates</button><button class="btn" onclick="tplStep2()">← Páginas</button></div>`);
  $('modalBox').classList.add('wide'); U.secs.forEach(s => U.tmp.set('tpx_' + s.key, s.payload)); tplFillThumbs($('modalBox'));
}
const tplSecOn = (k, v) => { const s = tplUI.secs.find(x => x.key === k); if (s) s.on = v; };
const tplSecSet = (k, f, v) => { const s = tplUI.secs.find(x => x.key === k); if (s) s[f] = v; };
async function tplSave() {
  const U = tplUI, pick = U.secs.filter(s => s.on); if (!pick.length) { toast('Marque pelo menos uma seção.'); return; }
  const keep = new Set(), now = new Date().toISOString().slice(0, 10), nm = (U.name || 'Template').trim().slice(0, 80);
  for (const s of pick) { const id = uid('tp'); await tplPayloadPut(id, s.payload); s.payload.imgs.forEach(x => keep.add(x)); tplBankList().push({id, tpl: nm, page: s.page, name: (s.name || '').trim().slice(0, 80) || TPL_KINDS[s.kind], kind: s.kind, niche: (U.niche || '').trim().slice(0, 60), order: s.order, imgIds: s.payload.imgs.slice(0, 80), colors: s.payload.colors, fonts: s.payload.fonts, license: 'Licença informada pelo usuário em ' + now, created: now}); }
  for (const id of U.ctx.created) if (!keep.has(id)) { try { await imgDel(id); } catch (e) { /* ok */ } }
  state.tplbank = normalizeTplbank(state.tplbank); persist(); closeModal(); toast(pick.length + ' seção(ões) guardadas no banco de templates.'); tplBankOpen();
}

/* ---------- banco ---------- */
function tplCards(items) {
  return items.map(i => `<div class="sec-card"><div class="sec-th tpl-th" data-tplth="${i.id}"><small class="muted">carregando…</small></div><b>${tplA(i.name)}</b><small class="muted">${tplA(TPL_KINDS[i.kind])} · ${tplA(i.tpl)}${i.niche ? ' · ' + tplA(i.niche) : ''}</small><div class="row-gap" style="flex-wrap:wrap"><button class="btn sm dark" onclick="tplInsert('${i.id}')">＋ Usar na página</button><button class="btn sm" onclick="tplDelete('${i.id}')" title="Remover do banco">×</button></div></div>`).join('');
}
function tplBankOpen() {
  const U = tplUI, all = tplBankList(), tpls = [...new Set(all.map(i => i.tpl))], items = all.filter(i => (!U.tplF || i.tpl === U.tplF) && (!U.kindF || i.kind === U.kindF)).sort((a, b) => a.tpl.localeCompare(b.tpl) || a.page.localeCompare(b.page) || a.order - b.order);
  const groups = {}; items.forEach(i => { (groups[i.tpl + '||' + i.page] = groups[i.tpl + '||' + i.page] || []).push(i); });
  showModal('Banco de templates', `<small class="muted block" style="margin-bottom:6px">Seções importadas de templates que você tem licença para usar. Valem para qualquer projeto: ao usar uma, os textos, imagens e links ficam editáveis e as cores e fontes podem seguir a marca do projeto.</small>
  <div class="row-gap" style="flex-wrap:wrap;margin-bottom:8px"><button class="btn sm dark" onclick="tplImportOpen()">📥 Importar template (ZIP)</button><select class="an-sel" onchange="tplUI.tplF=this.value;tplBankOpen()"><option value="">Todos os templates</option>${tpls.map(t => `<option ${U.tplF === t ? 'selected' : ''}>${tplA(t)}</option>`).join('')}</select><select class="an-sel" onchange="tplUI.kindF=this.value;tplBankOpen()"><option value="">Todos os tipos</option>${Object.entries(TPL_KINDS).map(([k, n]) => `<option value="${k}" ${U.kindF === k ? 'selected' : ''}>${n}</option>`).join('')}</select><label class="ins inl"><input type="checkbox" ${U.brand ? 'checked' : ''} onchange="tplUI.brand=this.checked"> usar cores e fontes da marca do projeto</label></div>
  ${all.length ? Object.entries(groups).map(([k, ss]) => { const [t, pg] = k.split('||'); return `<div class="section-row" style="margin:12px 0 4px"><h4 style="margin:0">${tplA(t)} · ${tplA(pg || 'página')} <small class="muted">(${ss.length})</small></h4><button class="btn sm" onclick="tplNewPage('${ss[0].id}')" title="Cria uma página nova com todas as seções desta página do template">＋ Criar página com estas seções</button></div><div class="sec-grid">${tplCards(ss)}</div>`; }).join('') : '<p class="muted">O banco está vazio. Importe um ZIP de template para começar.</p>'}`);
  $('modalBox').classList.add('wide'); tplFillThumbs($('modalBox'));
}
async function tplDelete(id) {
  if (!confirm('Remover esta seção do banco de templates?')) return; const i = tplBankList().findIndex(x => x.id === id); if (i < 0) return; const it = tplBankList().splice(i, 1)[0], used = new Set(tplBankList().flatMap(x => x.imgIds));
  try { await imgDel('tplp_' + id); } catch (e) { /* ok */ } TPL_R.cache.delete(id); for (const m of it.imgIds) if (!used.has(m)) { try { await imgDel(m); } catch (e) { /* ok */ } } persist(); tplBankOpen();
}
/* seção pronta para o editor visual (com as cores e fontes da marca, se pedido) */
async function tplBuildSec(it, brand) {
  const pl = await tplPayload(it.id); if (!pl) return null; const th = brand ? lpTheme(curProject()) : {}, map = {}, fonts = {};
  if (brand && th.accent && pl.colors[0]) map[pl.colors[0]] = th.accent;
  if (brand && pl.fonts[0] && th.head) fonts[pl.fonts[0]] = th.head; if (brand && pl.fonts[1] && th.body) fonts[pl.fonts[1]] = th.body; else if (brand && pl.fonts[0] && th.body && !pl.fonts[1]) { /* uma só fonte: segue a de títulos */ }
  const w = bxW('tpl', {tpl: {id: it.id, s: {}, i: {}, h: {}, map, fonts}});
  return normalizeVis({sections: [Object.assign(bxSec('1', {name: it.name, w: 'full', pad: {d: 0}, padB: {d: 0}}), {cols: [bxCol(12, [w])]})]}).sections[0];
}
async function tplInsert(id) {
  const l = lpCur(), it = tplBankList().find(x => x.id === id); if (!it) return; if (!l || !l.vis) { toast('Abra uma página no editor visual para inserir a seção (ou use “Criar página com estas seções”).'); return; }
  const sec = await tplBuildSec(it, tplUI.brand); if (!sec) { toast('Não achei os dados desta seção.'); return; } closeModal();
  bxMut(() => { const V = l.vis, f = bxFind(bxUI.sel), at = f ? V.sections.indexOf(f.sec) + 1 : V.sections.length; V.sections.splice(at, 0, sec); bxUI.sel = sec.id; }); toast('Seção importada adicionada. Clique nela para trocar textos, imagens e links.');
}
async function tplNewPage(anyId) {
  const first = tplBankList().find(x => x.id === anyId); if (!first) return; const items = tplBankList().filter(x => x.tpl === first.tpl && x.page === first.page).sort((a, b) => a.order - b.order), p = curProject();
  const secs = []; for (const it of items) { const s = await tplBuildSec(it, tplUI.brand); if (s) secs.push(s); } if (!secs.length) { toast('Nada para criar.'); return; }
  const inSite = lpUI.site && siteCur() ? siteCur() : null, nm = first.page === 'index' ? 'Início' : first.page.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), base = slug(nm) || 'pagina', ex = p.landings.filter(l => (l.siteId || '') === (inSite ? inSite.id : '')).map(l => l.slug);
  let sl = base; for (let i = 2; ex.includes(sl); i++) sl = base + '-' + i;
  const l = normalizeLandings([{id: uid('lp'), name: (inSite ? inSite.name + ' — ' : '') + nm, siteId: inSite ? inSite.id : '', slug: sl.slice(0, 40), navLabel: nm, type: 'generico', productId: inSite ? inSite.productId : '', theme: lpTheme(p), blocks: [], vis: {sections: secs}, status: 'Rascunho'}])[0];
  l.vis = normalizeVis({sections: secs}); p.landings.push(l); persist(); closeModal(); lpUI.main = inSite ? 'sites' : 'paginas'; lpOpen(l.id); lpUI.tab = 'editor'; renderLandings(); toast('Página criada a partir do template. Troque os textos e as imagens clicando em cada seção.');
}

/* ---------- galeria "Seções prontas" ---------- */
function tplGridHTML() {
  const all = tplBankList(); if (!all.length) return `<p class="muted" style="grid-column:1/-1">Nenhum template importado ainda. <button class="btn sm dark" onclick="tplImportOpen()">📥 Importar template (ZIP)</button></p>`;
  const U = tplUI; return `<div style="grid-column:1/-1" class="row-gap"><select class="an-sel" onchange="tplUI.kindF=this.value;secGallery()"><option value="">Todos os tipos</option>${Object.entries(TPL_KINDS).map(([k, n]) => `<option value="${k}" ${U.kindF === k ? 'selected' : ''}>${n}</option>`).join('')}</select><label class="ins inl"><input type="checkbox" ${U.brand ? 'checked' : ''} onchange="tplUI.brand=this.checked"> cores e fontes da marca</label><button class="btn sm" onclick="tplImportOpen()">📥 Importar outro</button></div>` + tplCards(all.filter(i => !U.kindF || i.kind === U.kindF).sort((a, b) => a.tpl.localeCompare(b.tpl) || a.order - b.order));
}

/* ---------- painel da seção importada (editor visual) ---------- */
function tplPanel(id) { return `<div id="tplP_${id}"><small class="muted">carregando campos…</small></div><img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" style="display:none" onload="tplPanelFill('${id}')">`; }
async function tplPanelFill(id) {
  const box = $('tplP_' + id), f = box && bxFind(id); if (!box || !f) return; const o = f.o, t = o.tpl, pl = await tplPayload(t.id); if (!pl) { box.innerHTML = '<small class="muted">Esta seção foi removida do banco de templates.</small>'; return; }
  const S = pl.slots, cur = (k, n, d) => (t[k] && t[k][n] != null ? t[k][n] : d);
  const colors = pl.colors.map(c => `<label class="ins" title="Cor original ${c}"><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${c};vertical-align:middle;border:1px solid #0003"></span> → <input type="color" value="${t.map[c] || c}" onchange="tplMap('${id}','${c}',this.value)"></label>`).join(' ');
  const fonts = pl.fonts.map(fn => `<div class="row-gap"><small>${tplA(fn)} →</small><button class="btn sm" onclick="tplFontPick('${id}','${tplA(fn).replace(/'/g, '&#39;')}')">${tplA(t.fonts[fn] || 'manter')}</button>${t.fonts[fn] ? `<button class="btn sm" onclick="tplFontClear('${id}','${tplA(fn).replace(/'/g, '&#39;')}')">×</button>` : ''}</div>`).join('');
  const texts = Object.entries(S.s).map(([n, x]) => `<div class="field"><label>${tplA(x.g)} · ${tplA(x.t.slice(0, 36))}</label><textarea rows="${x.t.length > 90 ? 3 : 1}" oninput="tplSet('${id}','s','${n}',this.value)">${tplA(cur('s', n, x.t))}</textarea></div>`).join('');
  const imgs = Object.entries(S.i).map(([n, x]) => { const ov = t.i[n], src = ov ? '' : (x.k === 'img' ? x.v : x.v); const th = ov ? `<img data-lib="${ov}" alt="" style="width:56px;height:42px;object-fit:cover;border-radius:6px">` : /^tplimg:/.test(src || '') ? `<img data-lib="${src.slice(7)}" alt="" style="width:56px;height:42px;object-fit:cover;border-radius:6px">` : src ? `<img src="${tplA(src)}" alt="" style="width:56px;height:42px;object-fit:cover;border-radius:6px">` : ''; return `<div class="row-gap" style="margin-bottom:4px">${th}<small>${x.k === 'bg' ? 'fundo' : 'imagem'} ${n}${x.a ? ' · ' + tplA(x.a) : ''}</small><button class="btn sm" onclick="tplImgPick('${id}','${n}')">📚 Trocar</button>${ov ? `<button class="btn sm" onclick="tplImgClear('${id}','${n}')">Original</button>` : ''}</div>`; }).join('');
  const links = Object.entries(S.h).map(([n, x]) => `<div class="field"><label>${tplA(x.t || 'link ' + n)}</label><input value="${tplA(cur('h', n, x.h === '#' ? '' : x.h))}" placeholder="https://… · #form · tel: · mailto:" oninput="tplSet('${id}','h','${n}',this.value)"></div>`).join('');
  box.innerHTML = `<small class="muted block" style="margin-bottom:6px">Importada de <b>${tplA((tplBankList().find(x => x.id === t.id) || {}).tpl || 'template')}</b>. Troque os textos, as imagens e os links; as cores e fontes podem seguir a marca.</small>
  <div class="row-gap" style="flex-wrap:wrap"><button class="btn sm dark" onclick="tplBrandNow('${id}')">🎨 Usar a marca do projeto</button><button class="btn sm" onclick="tplResetAll('${id}')">Restaurar original</button></div>
  ${colors || fonts ? `<div style="margin:8px 0"><b style="font-size:12.5px">Cores e fontes</b><div class="row-gap" style="flex-wrap:wrap;margin:4px 0">${colors}</div>${fonts}</div>` : ''}
  <details style="margin-top:6px"><summary><b>Textos (${Object.keys(S.s).length})</b></summary>${texts}</details>
  <details style="margin-top:6px"><summary><b>Imagens (${Object.keys(S.i).length})</b></summary>${imgs}</details>
  <details style="margin-top:6px"><summary><b>Links (${Object.keys(S.h).length})</b></summary>${links}</details>`;
  libFill(box);
}
function tplSet(id, k, n, v) { bxMut(() => { const t = bxFind(id).o.tpl; if (v === '') delete t[k][n]; else t[k][n] = v; }, false); }
function tplMap(id, c, v) { bxMut(() => { const t = bxFind(id).o.tpl; if (v.toLowerCase() === c) delete t.map[c]; else t.map[c] = v; }, false); }
function tplFontPick(id, from) { fbOpen(fam => { closeModal(); bxMut(() => { bxFind(id).o.tpl.fonts[from] = String(fam).replace(/[^\w \-]/g, '').slice(0, 60); }); }, ''); }
function tplFontClear(id, from) { bxMut(() => { delete bxFind(id).o.tpl.fonts[from]; }); }
function tplImgPick(id, n) { libPick(r => bxMut(() => { bxFind(id).o.tpl.i[n] = r.id; })); }
function tplImgClear(id, n) { bxMut(() => { delete bxFind(id).o.tpl.i[n]; }); }
function tplResetAll(id) { if (!confirm('Voltar esta seção ao conteúdo original do template?')) return; bxMut(() => { const t = bxFind(id).o.tpl; t.s = {}; t.i = {}; t.h = {}; t.map = {}; t.fonts = {}; }); }
async function tplBrandNow(id) {
  const o = bxFind(id).o, pl = await tplPayload(o.tpl.id), th = lpTheme(curProject()); if (!pl) return;
  bxMut(() => { const t = bxFind(id).o.tpl; if (pl.colors[0] && th.accent) t.map[pl.colors[0]] = th.accent; if (pl.fonts[0] && th.head) t.fonts[pl.fonts[0]] = th.head; if (pl.fonts[1] && th.body) t.fonts[pl.fonts[1]] = th.body; }); toast('Cor e fontes da marca aplicadas.');
}
