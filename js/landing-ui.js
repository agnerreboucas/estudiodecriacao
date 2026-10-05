/* ===== Landing pages (tela): lista → novo (tipo de produto) → editor com insumos, blocos, visual e publicar; prévia ao vivo (desktop/celular) ===== */
const lpUI = {id: '', tab: 'produto', open: {}, device: 'desktop', busy: '', useAgent: true};
const lpCur = () => { const p = curProject(); return p && p.landings.find(x => x.id === lpUI.id); };
const lpA = esc;

function renderLandings() {
  const r = $('landingsRoot'), p = curProject(); if (!r) return; if (!p) { r.innerHTML = noProject('Sites e landing pages'); return; }
  if (lpUI.id && !lpCur()) lpUI.id = '';
  if (lpUI.id) return lpEditor(r, p, lpCur());
  eSrc.sink = null; eSrc.render = null; const T = lpUI.main || 'paginas';
  r.innerHTML = `<div class="page-head"><div><h1>Sites e landing pages</h1><p>Escolha o produto do projeto e o tipo de página; a página nasce dos benefícios e características dele, com variações A/B para ver qual converte mais.</p></div><div class="actions">${projectSelect()}<button class="btn dark" onclick="lpNewModal()">＋ Nova página</button></div></div>
  <div class="edh-tabs">${[['paginas', 'Páginas'], ['sites', 'Sites'], ['produtos', 'Produtos do projeto'], ['refs', 'Referências']].map(([k, t]) => `<button class="edh-tab ${T === k ? 'on' : ''}" onclick="lpUI.main='${k}';renderLandings()">${t}</button>`).join('')}</div><div id="lpMain"></div>`;
  ({paginas: lpMainPaginas, sites: lpMainSites, produtos: lpMainProdutos, refs: lpMainRefs})[T]($('lpMain'), p);
}
const lpMainRefs = b => { b.innerHTML = lpRefsHTML().replace('style="margin-top:14px"', ''); };

/* ---------- lista de páginas, agrupadas por variação (A/B) + medição ---------- */
async function lpLoadStats(p) {
  if (!canUseApi() || lpUI.statsAt === p.id + p.landings.length) return; lpUI.statsAt = p.id + p.landings.length;
  try { const j = await api('lp.php?action=stats&ids=' + encodeURIComponent(p.landings.map(l => l.id).join(','))); lpUI.stats = j.stats || {}; if (lpUI.main === 'paginas' && ui.page === 'landings' && !lpUI.id) renderLandings(); } catch (e) { lpUI.stats = lpUI.stats || {}; }
}
function lpGroups(p) { const g = new Map(); p.landings.filter(l => !l.siteId).forEach(l => { const k = l.group || l.id; if (!g.has(k)) g.set(k, []); g.get(k).push(l); }); return [...g.values()].map(a => a.sort((x, y) => (x.variant || 'A').localeCompare(y.variant || 'A'))); }
/* duas proporções: só declara vencedor com amostra mínima e diferença estatisticamente clara (z ≥ 1,96) */
function lpAB(a, b) {
  const MIN = 100; if (a.view < MIN || b.view < MIN) return {ok: false, msg: `sem amostra suficiente (mínimo de ${MIN} visitas por versão)`};
  const pa = a.lead / a.view, pb = b.lead / b.view, pp = (a.lead + b.lead) / (a.view + b.view), se = Math.sqrt(pp * (1 - pp) * (1 / a.view + 1 / b.view)); if (!se) return {ok: false, msg: 'sem leads suficientes para comparar'};
  const z = (pa - pb) / se; return Math.abs(z) >= 1.96 ? {ok: true, win: z > 0 ? 'a' : 'b', msg: 'diferença estatisticamente clara (95%)'} : {ok: false, msg: 'diferença ainda dentro do acaso: continue o teste'};
}
function lpMainPaginas(b, p) {
  lpLoadStats(p); const S = lpUI.stats || {}, groups = lpGroups(p), st = l => S[l.id] || {view: 0, cta: 0, lead: 0};
  b.innerHTML = groups.length ? groups.map(g => { const win = g.length > 1 ? (() => { const best = g.slice().sort((x, y) => (st(y).lead / Math.max(1, st(y).view)) - (st(x).lead / Math.max(1, st(x).view))); const r = lpAB(st(best[0]), st(best[1])); return r.ok ? {id: best[0].id, msg: r.msg} : {id: '', msg: r.msg}; })() : null;
    return `<div class="panel lp-group"><div class="section-row"><div><h3 style="margin:0">${lpA(g[0].name.replace(/ · [A-Z]$/, ''))}</h3><small class="muted">${lpA((LP_TYPE_INFO[g[0].type] || {label: 'Simples'}).label)}${g[0].productId ? ' · ' + lpA(((p.products || []).find(x => x.id === g[0].productId) || {}).name || '') : ''}</small></div><div class="row-gap"><button class="btn sm" onclick="lpVariantModal('${g[0].id}')">＋ Variação</button></div></div>
    <div class="lp-vars">${g.map(l => { const s = st(l), cv = s.view ? s.lead / s.view * 100 : 0; return `<div class="lp-var ${win && win.id === l.id ? 'win' : ''}"><div class="row-gap" style="justify-content:space-between"><b>${g.length > 1 || l.variant ? 'Versão ' + (l.variant || 'A') : lpA(l.name)}</b>${win && win.id === l.id ? '<span class="so-badge ok" style="margin:0">vencedora</span>' : `<small class="muted">${lpA(l.status)}</small>`}</div>${l.angle ? `<small class="muted block">Abordagem: ${lpA(l.angle)}</small>` : ''}<small class="muted block">${(l.blocks || []).filter(x => x.on).length ? l.blocks.filter(x => x.on).length + ' blocos' : 'formato simples'}${lpPending(l) ? ` · <span class="so-warn">${lpPending(l)} a confirmar</span>` : ''}</small>
      <div class="lp-stats"><span><b>${s.view}</b><small>visitas</small></span><span><b>${s.lead}</b><small>leads</small></span><span><b>${s.view ? cv.toFixed(1).replace('.', ',') + '%' : '—'}</b><small>conversão</small></span></div>
      <div class="row-gap" style="margin-top:6px;flex-wrap:wrap"><button class="btn sm dark" onclick="lpOpen('${l.id}')">Abrir</button><button class="btn sm" onclick="lpExport('${l.id}')">⬇ HTML</button><button class="btn sm" onclick="lpDelete('${l.id}')">×</button></div></div>`; }).join('')}</div>
    ${win ? `<small class="muted block" style="margin-top:6px">${lpA(win.msg)}${!canUseApi() ? ' · a medição precisa do servidor (Hostinger) e da URL de leads configurada' : ''}</small>` : ''}</div>`; }).join('') : `<div class="panel"><h3>Nenhuma página ainda</h3><p class="muted">Comece pelo produto e pelo tipo de página: cada tipo já vem com a estrutura de blocos que mais costuma converter.</p><button class="btn dark" onclick="lpNewModal()">＋ Nova página</button></div>`;
}
function lpVariantModal(id) {
  const l = curProject().landings.find(x => x.id === id), ang = ['Dor e urgência', 'Benefício principal', 'Prova e resultado', 'Curiosidade', 'Simplicidade e facilidade', 'Garantia e segurança'];
  showModal('Nova variação (teste A/B)', `<p style="margin-top:0;font-size:13px">Cria uma cópia da página para testar contra a original. Mude <b>uma coisa de cada vez</b> (a abordagem do topo) para o resultado ser claro.</p><div class="field"><label>Abordagem desta variação</label><select id="lvA">${ang.map(a => `<option>${a}</option>`).join('')}</select></div><label class="ins inl"><input type="checkbox" id="lvG" checked> reescrever o topo e o botão com essa abordagem (IA)</label><div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="lpVariantMake('${id}')">Criar variação</button></div>`);
}
async function lpVariantMake(id) {
  const p = curProject(), src = p.landings.find(x => x.id === id), ang = $('lvA').value, gen = $('lvG').checked; closeModal();
  if (!src.group) { src.group = uid('lg'); src.variant = 'A'; src.name = src.name.replace(/ · [A-Z]$/, ''); }
  const used = p.landings.filter(x => x.group === src.group).map(x => x.variant), v = 'ABCDEFGH'.split('').find(c => !used.includes(c)) || 'Z', c = JSON.parse(JSON.stringify(src));
  c.id = uid('lp'); c.variant = v; c.angle = ang; c.status = 'Rascunho'; c.name = src.name.replace(/ · [A-Z]$/, '') + ' · ' + v; c.blocks.forEach(b => { b.id = uid('bk'); }); p.landings.push(c); persist();
  lpUI.id = c.id; lpUI.tab = 'blocos'; renderLandings();
  if (gen && aiReady()) { lpUI.busy = 'gen'; renderLandings(); try { await lpRewriteTop(c); toast('Variação criada com a abordagem “' + ang + '”.'); } catch (e) { toast(eErr(e)); } lpUI.busy = ''; renderLandings(); } else toast('Variação ' + v + ' criada. Edite o topo para testar a abordagem.');
}
async function lpRewriteTop(l) {
  const h = l.blocks.find(b => b.t === 'hero'); if (!h) return;
  const j = await motJSON('Você é um redator de resposta direta. Reescreva só o topo de uma landing page com a ABORDAGEM pedida, mantendo os fatos. Nunca invente dados, números, depoimentos ou garantias: use [CONFIRMAR: …] quando faltar. ' + (eBrandTxt() ? '\n' + eBrandTxt().slice(0, 4000) : ''), `ABORDAGEM: ${l.angle}\nPRODUTO: ${l.product.nome || l.name}\n${lpProductFacts(l)}INSUMOS:\n${(l.input || '').slice(0, 6000)}\nTOPO ATUAL: título="${h.title}" subtítulo="${h.text}" botão="${h.cta}"\nJSON: {"kicker":"","title":"até 80 caracteres; **negrito** em 1-2 palavras","text":"até 180","cta":"","note":""}`, 1200);
  ['kicker', 'title', 'text', 'cta', 'note'].forEach(k => { if (j[k] != null) h[k] = String(j[k]).slice(0, k === 'text' ? 400 : 300); }); l.headline = h.title; l.sub = h.text; persist();
}

/* ---------- produtos do projeto ---------- */
function lpMainProdutos(b, p) {
  b.innerHTML = `<div class="panel"><div class="section-row"><div><h3>Produtos do projeto</h3><p class="muted" style="margin:2px 0 0;font-size:12.5px">A fonte dos fatos: benefícios, características, objeções e provas reais. As páginas e os sites são gerados a partir da seleção que você fizer aqui, sem inventar o que não estiver cadastrado.</p></div><button class="btn dark sm" onclick="prodModal('')">＋ Novo produto</button></div>
  ${(p.products || []).length ? p.products.map(x => `<div class="list-item"><div><strong>${lpA(x.name)}</strong><small>${lpA((LP_TYPE_INFO[x.type] || {label: 'Produto'}).label)} · ${x.benefits.length} benefício(s) · ${x.features.length} característica(s)${x.price ? ' · ' + lpA(x.price) : ''}</small></div><div class="row-gap"><button class="btn sm dark" onclick="lpNewFromProduct('${x.id}')">Criar página</button><button class="btn sm" onclick="prodModal('${x.id}')">Editar</button><button class="btn sm" onclick="prodDel('${x.id}')">×</button></div></div>`).join('') : '<p class="muted" style="margin-top:10px">Nenhum produto ainda. Cadastre o primeiro: nome, para quem é, benefícios e características.</p>'}</div>`;
}
function prodModal(id) {
  const x = id ? curProject().products.find(y => y.id === id) : {name: '', type: 'produto', summary: '', price: '', audience: '', checkout: '', benefits: [], features: [], objections: [], proofs: []}, ta = (k, l, ph) => `<div class="field full"><label>${l} (um por linha)</label><textarea id="pd_${k}" rows="4" placeholder="${lpA(ph || '')}">${lpA((x[k] || []).join('\n'))}</textarea></div>`;
  showModal(id ? 'Editar produto' : 'Novo produto', `<div class="form-grid"><div class="field"><label>Nome</label><input id="pd_name" value="${lpA(x.name)}"></div><div class="field"><label>Tipo</label><select id="pd_type">${['produto', 'curso', 'ebook', 'servico', 'evento', 'cadastro'].map(t => `<option value="${t}" ${x.type === t ? 'selected' : ''}>${lpA((LP_TYPE_INFO[t] || {label: 'Produto físico / catálogo'}).label)}</option>`).join('')}</select></div>
    <div class="field full"><label>Descrição</label><textarea id="pd_summary" rows="3">${lpA(x.summary)}</textarea></div><div class="field"><label>Preço e condição</label><input id="pd_price" value="${lpA(x.price)}"></div><div class="field"><label>Link de compra / inscrição</label><input id="pd_checkout" value="${lpA(x.checkout)}" placeholder="https://…"></div><div class="field full"><label>Público</label><input id="pd_audience" value="${lpA(x.audience)}"></div>
    ${ta('benefits', 'Benefícios (o que a pessoa ganha)', 'Ex.: Entende a parcela antes de assinar')}${ta('features', 'Características (o que o produto é ou tem)', 'Ex.: 6 módulos em vídeo; planilha de comparação')}${ta('objections', 'Objeções comuns', 'Ex.: Não tenho tempo')}${ta('proofs', 'Provas reais (números, depoimentos autorizados, casos)', 'Só o que existe de verdade')}</div>
  <div class="modal-actions"><button class="btn" onclick="prodSuggest()" ${aiReady() ? '' : 'disabled'} title="Sugere benefícios e características a partir da descrição">✦ Sugerir da descrição</button><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="prodSave('${id}')">Salvar</button></div>`);
  document.getElementById('modalBox').classList.add('wide');
}
const prodLines = id => $(id).value.split('\n').map(t => t.trim()).filter(Boolean);
function prodSave(id) {
  const p = curProject(), name = $('pd_name').value.trim(); if (!name) { toast('Dê um nome ao produto.'); return; }
  const o = normalizeProducts([{id: id || uid('pr'), name, type: $('pd_type').value, summary: $('pd_summary').value, price: $('pd_price').value, audience: $('pd_audience').value, checkout: $('pd_checkout').value.trim(), benefits: prodLines('pd_benefits'), features: prodLines('pd_features'), objections: prodLines('pd_objections'), proofs: prodLines('pd_proofs'), images: id ? (p.products.find(y => y.id === id) || {}).images : []}])[0];
  if (id) p.products[p.products.findIndex(y => y.id === id)] = o; else p.products.push(o); persist(); closeModal(); renderLandings();
}
function prodDel(id) { if (!confirm('Excluir este produto? As páginas já criadas continuam.')) return; const p = curProject(); p.products = p.products.filter(x => x.id !== id); persist(); renderLandings(); }
async function prodSuggest() {
  const d = $('pd_summary').value.trim(); if (!d) { toast('Escreva a descrição primeiro.'); return; } const btn = event && event.target; if (btn) { btn.disabled = true; btn.textContent = 'Pensando…'; }
  try { const j = await aiJSON('Você ajuda a organizar fatos de um produto. Com base SÓ na descrição, sugira benefícios (o que a pessoa ganha) e características (o que o produto é/tem). Não invente números, prazos, garantias nem resultados. Se algo for suposição, termine o item com " [CONFIRMAR]". JSON: {"benefits":[""],"features":[""],"objections":[""]}', d);
    ['benefits', 'features', 'objections'].forEach(k => { const t = $('pd_' + k); const add = (Array.isArray(j[k]) ? j[k] : []).slice(0, 8).map(x => String(x).slice(0, 300)); t.value = [t.value.trim(), ...add].filter(Boolean).join('\n'); }); toast('Sugestões adicionadas. Revise antes de salvar.'); } catch (e) { toast(e.message); }
  if (btn) { btn.disabled = false; btn.textContent = '✦ Sugerir da descrição'; }
}
function lpNewFromProduct(id) { lpNewModal(id); }
/* fatos do produto selecionado, para o prompt */
function lpProductFacts(l) {
  const p = curProject(), x = (p.products || []).find(y => y.id === l.productId); if (!x) return '';
  const pick = (arr, sel) => (l.pick && l.pick.all !== false) ? arr : arr.filter((_, i) => (sel || []).includes(i));
  return `PRODUTO DO PROJETO (fatos cadastrados; use SÓ estes):\nBenefícios: ${pick(x.benefits, l.pick && l.pick.b).join(' | ') || '(nenhum)'}\nCaracterísticas: ${pick(x.features, l.pick && l.pick.f).join(' | ') || '(nenhuma)'}\nObjeções: ${x.objections.join(' | ') || '(nenhuma)'}\nProvas reais: ${x.proofs.join(' | ') || '(nenhuma: use [CONFIRMAR])'}\n\n`;
}
function lpNewModal(productId) {
  const p = curProject(), prods = p.products || [], pr = prods.find(x => x.id === productId), def = pr ? (LP_TYPE_INFO[pr.type] ? pr.type : 'generico') : 'curso';
  showModal('Nova página', `<div class="field"><label>Produto do projeto</label><select id="lpnP" onchange="lpnPick(this.value)"><option value="">— sem produto (preencho depois) —</option>${prods.map(x => `<option value="${x.id}" ${x.id === productId ? 'selected' : ''}>${lpA(x.name)}</option>`).join('')}</select>${prods.length ? '' : '<small class="muted block">Cadastre produtos na aba “Produtos do projeto” para gerar a página a partir dos benefícios e características.</small>'}</div>
  <div class="field"><label>Nome interno</label><input id="lpnName" value="${lpA(pr ? 'LP — ' + pr.name : '')}" placeholder="Ex.: Curso Finanças — lançamento"></div><div class="okr-label">TIPO DE PÁGINA</div><div class="lp-types">${Object.entries(LP_TYPE_INFO).map(([k, t]) => `<label class="lp-type"><input type="radio" name="lpnT" value="${k}" ${k === def ? 'checked' : ''}><b>${lpA(t.label)}</b><small class="muted">${lpA(t.why)}</small><small class="mono muted">${t.blocks.map(b => LP_BLOCK[b].label).join(' → ')}</small></label>`).join('')}</div><div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="lpCreate()">Criar e abrir</button></div>`);
  document.getElementById('modalBox').classList.add('wide');
}
function lpnPick(id) { const x = curProject().products.find(y => y.id === id); if (!x) return; const n = $('lpnName'); if (!n.value.trim() || /^LP — /.test(n.value)) n.value = 'LP — ' + x.name; const t = document.querySelector(`input[name=lpnT][value="${LP_TYPE_INFO[x.type] ? x.type : 'generico'}"]`); if (t) t.checked = true; }
function lpTheme(p) { try { const tk = lyStyles(p)[0].tk; return {accent: tk.accent, bg: tk.bg, fg: tk.fg, dark: false, head: tk.head.family, body: tk.body.family}; } catch (e) { return {}; } }
function lpCreate(init) {
  const p = curProject(), t = init && init.type || (document.querySelector('input[name=lpnT]:checked') || {}).value || 'generico', name = init && init.name || ($('lpnName') && $('lpnName').value.trim()) || 'LP — ' + LP_TYPE_INFO[t].label;
  const pid = init && init.productId || ($('lpnP') && $('lpnP').value) || '', pr = pid && (p.products || []).find(x => x.id === pid), prod = pr ? {nome: pr.name, preco: pr.price, publico: pr.audience, checkout: pr.checkout, data: '', local: ''} : undefined;
  const l = normalizeLandings([Object.assign({id: uid('lp'), name, type: t, productId: pr ? pr.id : '', product: prod, input: pr ? [pr.summary && 'Descrição: ' + pr.summary].filter(Boolean).join('\n') : '', goal: LP_TYPE_INFO[t].goal === 'lead' ? 'Gerar lead' : 'Conteúdo', cta: LP_TYPE_INFO[t].cta, theme: lpTheme(p), blocks: lpStructure(t), whatsapp: '', status: 'Rascunho'}, init || {})])[0];
  p.landings.push(l); persist(); closeModal(); lpUI.id = l.id; lpUI.tab = 'produto'; if (ui.page !== 'landings') go('landings'); else renderLandings(); return l;
}
function lpOpen(id) {
  const l = curProject().landings.find(x => x.id === id); if (!l) return;
  if (!l.type) l.type = 'generico'; if (!(l.blocks || []).length) l.blocks = lpSeedBlocks(l);
  lpUI.id = id; lpUI.tab = 'blocos'; if (!lpUI.back) lpUI.back = ''; persist(); renderLandings();
}
function lpDelete(id) { if (!confirm('Excluir esta landing page?')) return; const p = curProject(); p.landings = p.landings.filter(x => x.id !== id); persist(); renderLandings(); }
async function lpExport(id) { const p = curProject(), l = p.landings.find(x => x.id === id); if (!l.blocks.length) { lpOpen(id); return; } if (!state.workspace.leadsUrl && l.blocks.some(b => b.t === 'form' && b.on)) toast('Dica: defina a URL de captura de leads em Configurações antes de publicar.'); if (lpPending(l)) toast(`Atenção: ${lpPending(l)} item(ns) ainda marcado(s) como [CONFIRMAR].`); const ex = lpExtractImgs(await lpHTML(l, p)), html = ex.html, as = (await lpAssets(l, p)).concat(ex.files), thx = (l.thanks || {}).mode !== 'none' && (l.thanks || {}).mode !== 'url' && l.blocks.some(b => b.t === 'form' && b.on) || (l.vis && JSON.stringify(l.vis).includes('"t":"form"')) ? [{name: 'obrigado.html', data: new TextEncoder().encode(await lpThanksHTML(l, p))}] : []; if (as.length || thx.length) { const enc = new TextEncoder(); download(slug(l.name) + '.zip', makeZip([{name: 'index.html', data: enc.encode(html)}].concat(thx, as)), 'application/zip'); toast('ZIP com index.html' + (thx.length ? ', a página obrigado.html' : '') + ' e as imagens em WebP (pasta img). Suba tudo na mesma pasta.'); } else download(slug(l.name) + '.html', html, 'text/html'); l.status = 'Exportada'; persist(); renderLandings(); }

/* ---------- editor ---------- */
function lpEditor(r, p, l) {
  const tabs = [['produto', 'Produto e insumos'], ['blocos', 'Blocos'], ['editor', 'Editor visual'], ['visual', 'Estilo'], ['publicar', 'Publicar']];
  r.innerHTML = `<div class="page-head"><div><button class="btn sm" onclick="lpBack()">${lpUI.back === 'site' ? '← Voltar ao site' : '← Todas as páginas'}</button><h1 style="margin-top:8px">${lpA(l.name)}</h1></div><div class="actions"><span class="so-badge" style="margin:0">${lpA((LP_TYPE_INFO[l.type] || {}).label || '')}</span><button class="btn dark" onclick="lpExport('${l.id}')">⬇ Exportar HTML</button></div></div>
  <div class="edh-tabs">${tabs.map(([k, t]) => `<button class="edh-tab ${lpUI.tab === k ? 'on' : ''}" onclick="lpUI.tab='${k}';renderLandings()">${t}</button>`).join('')}</div>
  <div class="lp-wrap"><div class="lp-side" id="lpSide"></div><div class="lp-prev"><div class="row-gap" style="margin-bottom:8px;flex-wrap:wrap">${Object.entries(BX_DEV).map(([k, d]) => `<button class="tchip ${lpUI.device === k ? 'on' : ''}" onclick="lpUI.device='${k}';lpDevice();renderLandings()" title="${d[1]}×${d[2]} px">${d[0]}</button>`).join('')}<button class="btn sm" onclick="lpPaint()">↻</button></div><div class="lp-frame" id="lpFrameBox"><iframe id="lpFrame" title="Prévia da landing page"></iframe></div></div></div>`;
  ({produto: lpTabProduto, blocos: lpTabBlocos, editor: bxTab, visual: lpTabVisual, publicar: lpTabPublicar})[lpUI.tab]($('lpSide'), l, p); lpDevice(); lpPaint();
}
function lpDevice() {
  const box = $('lpFrameBox'), f = $('lpFrame'); if (!box || !f) return; const d = BX_DEV[lpUI.device] || BX_DEV.desktop, W = d[1], H = d[2], avail = Math.max(280, (box.parentElement.clientWidth || 800) - 4), sc = Math.min(1, avail / W);
  box.style.width = Math.round(W * sc) + 'px'; box.style.height = Math.min(Math.round(H * sc), Math.round(window.innerHeight - 250)) + 'px'; f.style.width = W + 'px'; f.style.height = Math.round(Math.min(H, (window.innerHeight - 250) / sc)) + 'px'; f.style.transform = `scale(${sc})`; f.style.transformOrigin = '0 0';
}
async function lpPaint() { const l = lpCur(), f = $('lpFrame'); if (!l || !f) return; try { f.srcdoc = await lpHTML(l, curProject(), {preview: true, sel: lpUI.tab === 'editor' ? bxUI.sel : '', scroll: bxUI.scroll}); } catch (e) { f.srcdoc = '<p style="font:14px sans-serif;padding:20px">Não consegui montar a prévia: ' + lpA(e.message) + '</p>'; } }
const lpPaintSoon = debounce(() => lpPaint(), 450);
const lpIn = (label, val, oninput, rows, ph) => `<div class="field"><label>${label}</label>${rows ? `<textarea rows="${rows}" oninput="${oninput}" placeholder="${lpA(ph || '')}">${lpA(val)}</textarea>` : `<input value="${lpA(val)}" oninput="${oninput}" placeholder="${lpA(ph || '')}">`}</div>`;
function lpSet(path, v) { const l = lpCur(), a = path.split('.'); let o = l; for (let i = 0; i < a.length - 1; i++) o = o[a[i]]; o[a[a.length - 1]] = v; persist(); lpPaintSoon(); }

function lpTabProduto(b, l, p) {
  const t = LP_TYPE_INFO[l.type] || LP_TYPE_INFO.generico, ev = l.type === 'evento', ready = aiReady(), agentOK = !!(EDS().ideas && EDS().ideas[EDS().chosen] && EDS().brief);
  const prods = p.products || [], pr = prods.find(x => x.id === l.productId), pk = (arr, key) => arr.map((t, i) => `<label class="lp-pk"><input type="checkbox" ${l.pick.all !== false || l.pick[key].includes(i) ? 'checked' : ''} onchange="lpPick('${key}',${i},this.checked)"> ${lpA(t)}</label>`).join('') || '<small class="muted">nenhum cadastrado</small>';
  b.innerHTML = `${lpIn('Nome interno', l.name, `lpSet('name',this.value)`)}
  <div class="field"><label>Produto do projeto</label><select onchange="lpUseProduct(this.value)"><option value="">— nenhum —</option>${prods.map(x => `<option value="${x.id}" ${x.id === l.productId ? 'selected' : ''}>${lpA(x.name)}</option>`).join('')}</select>${l.variant ? `<small class="muted block">Versão ${l.variant}${l.angle ? ' · abordagem: ' + lpA(l.angle) : ''} (teste A/B)</small>` : ''}</div>
  ${pr ? accSec('lp', 'pick', 'Benefícios e características usados', `${pr.benefits.length + pr.features.length} cadastrados`, `<div class="okr-label">BENEFÍCIOS</div>${pk(pr.benefits, 'b')}<div class="okr-label" style="margin-top:8px">CARACTERÍSTICAS</div>${pk(pr.features, 'f')}<small class="muted block" style="margin-top:6px">Desmarque o que não deve entrar nesta página. Dá para editar os fatos na aba “Produtos do projeto”.</small>`, false) : ''}
  <div class="field"><label>Tipo de produto</label><select onchange="lpChangeType(this.value)">${Object.entries(LP_TYPE_INFO).map(([k, x]) => `<option value="${k}" ${l.type === k ? 'selected' : ''}>${lpA(x.label)}</option>`).join('')}</select><small class="muted block">${lpA(t.why)}</small></div>
  ${accSec('lp', 'prod', 'Dados do produto', lpA(l.product.nome || ''), lpIn('Nome do produto', l.product.nome, `lpSet('product.nome',this.value)`) + lpIn('Preço e condição', l.product.preco, `lpSet('product.preco',this.value)`, 0, 'Ex.: 12x de R$ 49,90 ou R$ 497 à vista') + lpIn('Público', l.product.publico, `lpSet('product.publico',this.value)`, 2) + lpIn('Link de compra / inscrição (checkout)', l.product.checkout, `lpSet('product.checkout',this.value)`, 0, 'https://…') + (ev ? lpIn('Data e hora (AAAA-MM-DDTHH:MM)', l.product.data, `lpSet('product.data',this.value)`, 0, '2026-11-20T19:00') + lpIn('Local ou link online', l.product.local, `lpSet('product.local',this.value)`) : '') + lpIn('WhatsApp (só números, com DDI)', l.whatsapp, `lpSet('whatsapp',this.value.replace(/\\D/g,''))`, 0, '5511999999999'), true)}
  <div class="field"><label>Insumos <small class="muted">${l.input.length.toLocaleString('pt-BR')} caracteres</small></label><textarea rows="9" oninput="lpCur().input=this.value;persist()" placeholder="Cole a descrição do produto, a ementa, o roteiro do evento, o que o cliente recebe, garantia, depoimentos reais… Quanto mais concreto, menos [CONFIRMAR] na página.">${lpA(l.input)}</textarea></div>
  ${eInsumoSources(null, {sink: lpSink, render: renderLandings})}
  <label class="ins inl" style="margin-top:6px"><input type="checkbox" ${lpUI.useAgent && agentOK ? 'checked' : ''} ${agentOK ? '' : 'disabled'} onchange="lpUI.useAgent=this.checked"> usar a ideia e o briefing do Agente Editorial${agentOK ? ': “' + lpA((EDS().ideas[EDS().chosen].tese || '').slice(0, 50)) + '”' : ' (escolha uma ideia no Agente)'}</label>
  <div class="row-gap" style="margin-top:10px;flex-wrap:wrap"><button class="btn dark" onclick="lpGenerate()" ${lpUI.busy || !ready ? 'disabled' : ''} title="${ready ? '' : 'IA não configurada (Configurações → Integrações)'}">${lpUI.busy ? 'Escrevendo a página…' : '✦ Gerar a página com IA'}</button></div>
  <small class="muted block" style="margin-top:6px">A IA preenche cada bloco só com o que está nos insumos. O que faltar (preço, depoimento, garantia, números) fica como <b>[CONFIRMAR]</b> para você completar: nada é inventado.</small>`;
}
function lpSink(label, text) { const l = lpCur(); l.input = ((l.input ? l.input.trim() + '\n\n' : '') + `--- ${label} ---\n${text}`).slice(0, 60000); persist(); }
function lpChangeType(t) {
  const l = lpCur(), had = l.blocks.some(b => b.title || b.text || b.items.length);
  if (had && !confirm('Trocar o tipo recria a estrutura de blocos e apaga os textos atuais. Continuar?')) { renderLandings(); return; }
  l.type = t; l.blocks = lpStructure(t); l.cta = LP_TYPE_INFO[t].cta; persist(); renderLandings();
}
function lpPrompt(l) {
  const t = LP_TYPE_INFO[l.type], P = l.product, blocks = l.blocks.filter(b => b.on);
  return `${lpRefPrompt(l)}${lpProductFacts(l)}${l.angle ? 'ABORDAGEM DESTA VARIAÇÃO (A/B): ' + l.angle + ' — o topo e o botão devem seguir essa abordagem.\n\n' : ''}PRODUTO: ${t.label}\nNome: ${P.nome || '(não informado)'}\nPreço/condição: ${P.preco || '(não informado)'}\nPúblico: ${P.publico || '(não informado)'}\nLink de compra: ${P.checkout ? 'informado' : 'não informado'}${l.type === 'evento' ? `\nData/hora: ${P.data || '(não informada)'}\nLocal: ${P.local || '(não informado)'}` : ''}\nWhatsApp de contato: ${l.whatsapp ? 'sim' : 'não'}\n\nINSUMOS (única fonte de fatos):\n${l.input || '(vazio)'}\n\n${lpUI.useAgent && EDS().ideas && EDS().ideas[EDS().chosen] && EDS().brief ? 'IDEIA E BRIEFING DO AGENTE EDITORIAL:\n' + eCtx() + '\n' : ''}ESTRUTURA DA PÁGINA (na ordem; devolva um objeto por bloco):\n${blocks.map((b, i) => `${i + 1}. t="${b.t}" — ${LP_BLOCK[b.t].ai}`).join('\n')}\n\nFormato: JSON {"blocks":[{"t":"hero","kicker":"","title":"","text":"","cta":"","note":"","name":"","price":"","items":[{"t":"","d":""}],"yes":[],"no":[]}]} usando só os campos pedidos em cada bloco.\nRegras: português do Brasil, frases curtas e específicas; use **negrito** para 1 ou 2 palavras-chave do título; NUNCA invente números, depoimentos, nomes, prazos, garantias, preços, credenciais ou resultados: onde o insumo não trouxer o dado, escreva [CONFIRMAR: o que falta]; não prometa resultado garantido; conteúdo de saúde, finanças ou jurídico sem promessa de cura, ganho ou aprovação.`;
}
/* aplica no(s) bloco(s) o que a IA devolveu; só os campos de cada tipo de bloco */
function lpMerge(l, got) {
  const used = new Set(), s = (v, n) => String(v == null ? '' : v).slice(0, n);
  l.blocks.filter(b => b.on).forEach(b => {
    const i = got.findIndex((x, k) => !used.has(k) && x && x.t === b.t); if (i < 0) return; used.add(i); const g = got[i];
    LP_BLOCK[b.t].fields.forEach(([f, , kind]) => { if (kind === 'img') return; if (f === 'items') b.items = (Array.isArray(g.items) ? g.items : []).slice(0, 20).map(x => ({t: s(x && x.t, 400), d: s(x && x.d, 1200)})); else if (f === 'yes' || f === 'no') b[f] = (Array.isArray(g[f]) ? g[f] : []).slice(0, 10).map(x => s(x, 300)); else if (g[f] != null) b[f] = s(g[f], f === 'text' ? 3000 : 400); });
  });
  const h = l.blocks.find(b => b.t === 'hero'); if (h) { l.headline = h.title; l.sub = h.text; l.cta = h.cta || l.cta; }
}
async function lpGenerate() {
  const l = lpCur(); if (lpUI.busy) return; if (!l.input.trim() && !l.product.nome) { toast('Escreva os insumos ou ao menos o nome do produto.'); return; }
  lpUI.busy = 'gen'; renderLandings();
  try {
    const j = await motJSON('Você é um redator de resposta direta que monta landing pages que convertem sem enganar. ' + (eBrandTxt() ? '\n' + eBrandTxt().slice(0, 6000) : ''), lpPrompt(l), 7000), got = Array.isArray(j.blocks) ? j.blocks : [];
    if (!got.length) throw new Error('a IA não devolveu a página.');
    lpMerge(l, got);
    if (l.vis && confirm('Substituir o layout do editor visual pelo novo texto?')) l.vis = bxFromBlocks(l);
    persist(); toast('Página escrita. Revise os blocos e complete o que estiver em [CONFIRMAR].'); lpUI.tab = l.vis ? 'editor' : 'blocos';
  } catch (e) { toast(eErr(e)); }
  lpUI.busy = ''; renderLandings();
}

function lpTabBlocos(b, l) {
  if (l.vis) { b.innerHTML = `<div class="panel"><h3>Esta página usa o editor visual</h3><p class="muted" style="font-size:12.5px">Os blocos ficam guardados, mas o que aparece na página é o layout do editor visual. Para editar textos e posições, use a aba <b>Editor visual</b>.</p><div class="row-gap"><button class="btn dark" onclick="lpUI.tab='editor';renderLandings()">Ir ao editor visual</button><button class="btn" onclick="lpToVisual()">Refazer o layout a partir dos blocos</button></div></div>`; return; }
  b.innerHTML = `<div class="row-gap" style="margin-bottom:8px"><button class="btn sm dark" onclick="lpToVisual()">Abrir no editor visual →</button><small class="muted">arrastar, colunas, vídeo, tablet e celular</small></div><small class="muted block" style="margin-bottom:8px">Ligue/desligue, reordene e edite cada bloco. A prévia ao lado atualiza sozinha. Itens com <b>[CONFIRMAR]</b> precisam de um dado real antes de publicar.</small>
  ${l.blocks.map((k, i) => { const def = LP_BLOCK[k.t], pend = (JSON.stringify([k.title, k.text, k.note, k.price, k.items, k.yes, k.no]).match(/\[CONFIRMAR/g) || []).length; return accSec('lp', k.id, `<label onclick="event.stopPropagation()" style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" ${k.on ? 'checked' : ''} onchange="lpBlk('${k.id}','on',this.checked,true)"> ${i + 1}. ${lpA(def.label)}</label>`, `${pend ? `<span class="so-warn">${pend} a confirmar</span> ` : ''}${lpA((k.title || k.items[0] && k.items[0].t || '').replace(/\*\*/g, '').slice(0, 28))}`, `<div class="row-gap" style="margin-bottom:8px"><button class="btn sm" onclick="lpMove('${k.id}',-1)" ${i === 0 ? 'disabled' : ''}>▲</button><button class="btn sm" onclick="lpMove('${k.id}',1)" ${i === l.blocks.length - 1 ? 'disabled' : ''}>▼</button><button class="btn sm" onclick="lpDup('${k.id}')">Duplicar</button><button class="btn sm" onclick="lpBlkDel('${k.id}')">Remover</button></div>${def.fields.map(f => lpField(k, f)).join('')}`, i === 0); }).join('')}
  <div class="row-gap" style="margin-top:10px"><select id="lpAdd">${Object.entries(LP_BLOCK).map(([t, d]) => `<option value="${t}">${lpA(d.label)}</option>`).join('')}</select><button class="btn sm dark" onclick="lpAddBlock()">＋ Adicionar bloco</button></div>`;
}
function lpField(k, [f, label, kind]) {
  if (kind === 'line') return `<div class="field"><label>${label}</label><input value="${lpA(k[f])}" oninput="lpBlk('${k.id}','${f}',this.value)"></div>`;
  if (kind === 'area') return `<div class="field"><label>${label}</label><textarea rows="3" oninput="lpBlk('${k.id}','${f}',this.value)">${lpA(k[f])}</textarea></div>`;
  if (kind === 'list') return `<div class="field"><label>${label} (um por linha)</label><textarea rows="4" oninput="lpBlk('${k.id}','${f}',this.value.split('\\n').filter(Boolean))">${lpA(k[f].join('\n'))}</textarea></div>`;
  if (kind === 'img') return `<div class="field"><label>${label}</label><div class="row-gap"><button class="btn sm" onclick="lpPickImg('${k.id}')">${k[f] ? 'Trocar' : '📚 Escolher da biblioteca'}</button>${k[f] ? `<button class="btn sm" onclick="lpBlk('${k.id}','${f}','',true)">Remover</button>` : ''}</div></div>`;
  if (kind.startsWith('items')) { const [a, c] = kind.slice(6).split('/'); return `<div class="field"><label>${label}</label>${k.items.map((it, n) => `<div class="lp-it"><input value="${lpA(it.t)}" placeholder="${a}" oninput="lpItem('${k.id}',${n},'t',this.value)"><textarea rows="2" placeholder="${c}" oninput="lpItem('${k.id}',${n},'d',this.value)">${lpA(it.d)}</textarea><button class="btn sm" onclick="lpItemDel('${k.id}',${n})" title="Remover item">×</button></div>`).join('')}<button class="btn sm" onclick="lpItemAdd('${k.id}')">＋ Item</button></div>`; }
  return '';
}
const lpBk = id => lpCur().blocks.find(b => b.id === id);
function lpBlk(id, f, v, rerender) { lpBk(id)[f] = v; persist(); if (rerender) renderLandings(); else lpPaintSoon(); }
function lpItem(id, n, k, v) { lpBk(id).items[n][k] = v; persist(); lpPaintSoon(); }
function lpItemAdd(id) { lpBk(id).items.push({t: '', d: ''}); persist(); renderLandings(); }
function lpItemDel(id, n) { lpBk(id).items.splice(n, 1); persist(); renderLandings(); }
function lpMove(id, d) { const a = lpCur().blocks, i = a.findIndex(b => b.id === id), j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; persist(); renderLandings(); }
function lpDup(id) { const a = lpCur().blocks, i = a.findIndex(b => b.id === id), c = JSON.parse(JSON.stringify(a[i])); c.id = uid('bk'); a.splice(i + 1, 0, c); persist(); renderLandings(); }
function lpBlkDel(id) { const l = lpCur(); l.blocks = l.blocks.filter(b => b.id !== id); persist(); renderLandings(); }
function lpAddBlock() { lpCur().blocks.push(lpBlockNew($('lpAdd').value)); persist(); renderLandings(); }
function lpPickImg(id) { libPick(r => { lpBk(id).imgId = r.id; persist(); renderLandings(); }); }

function lpTabVisual(b, l, p) {
  const th = l.theme, col = (k, lab) => `<label class="ins">${lab}<input type="color" value="${th[k]}" oninput="lpSet('theme.${k}',this.value)"></label>`;
  b.innerHTML = `<div class="ins-row">${col('accent', 'Cor de destaque')}${col('bg', 'Fundo')}${col('fg', 'Texto')}<label class="ins inl"><input type="checkbox" ${th.dark ? 'checked' : ''} onchange="lpSet('theme.dark',this.checked)"> modo escuro</label></div>
  <div class="ins-row"><div class="field"><label>Fonte dos títulos</label><button class="btn sm" onclick="lpFont('head')">${lpA(th.head)} · trocar</button></div><div class="field"><label>Fonte do texto</label><button class="btn sm" onclick="lpFont('body')">${lpA(th.body)} · trocar</button></div></div>
  <div class="row-gap"><button class="btn sm" onclick="lpBrandTheme()">Usar as cores e fontes da marca</button></div><small class="muted block" style="margin-top:6px">As fontes são carregadas do Google Fonts na página publicada; sem internet o navegador usa uma fonte do sistema.</small>`;
}
function lpFont(k) { fbOpen(fam => { lpSet('theme.' + k, fam); closeModal(); renderLandings(); }, lpCur().theme[k]); }
function lpBrandTheme() { const l = lpCur(); Object.assign(l.theme, lpTheme(curProject())); persist(); renderLandings(); }

function lpTabPublicar(b, l) {
  const checks = [[!!l.blocks.find(x => x.t === 'hero' && x.on && x.title), 'Título (promessa) preenchido'], [!!(l.product.checkout || l.whatsapp || l.blocks.some(x => x.t === 'form' && x.on)), 'A página tem para onde levar o clique (checkout, WhatsApp ou formulário)'], [lpPending(l) === 0, lpPending(l) ? `${lpPending(l)} item(ns) ainda como [CONFIRMAR]` : 'Nenhum item pendente de confirmação'], [!l.blocks.some(x => x.t === 'form' && x.on) || !!state.workspace.leadsUrl, 'Formulário com destino de leads configurado (Configurações)'], [!l.blocks.some(x => x.t === 'form' && x.on) || !!l.privacyUrl, 'Link da política de privacidade (LGPD) no formulário'], [!l.blocks.some(x => x.t === 'prova' && x.on) || !/\[CONFIRMAR/.test(JSON.stringify(l.blocks.filter(x => x.t === 'prova')) ), 'Depoimentos reais e autorizados']];
  b.innerHTML = `<div class="panel"><h3>Antes de publicar</h3>${checks.map(([ok, t]) => `<div class="so-issue ${ok ? '' : 'aviso'}" style="${ok ? 'background:#e9f7ee;color:#176b30' : ''}">${ok ? '✓' : '⚠'} ${lpA(t)}</div>`).join('')}</div>
  ${lpSeoPanel(l, curProject())}
  <div class="panel" style="margin-top:10px"><h3>WhatsApp e leads</h3>${lpIn('WhatsApp de atendimento (DDI + DDD + número)', l.whatsapp, `lpSet('whatsapp',this.value.replace(/\\D/g,''))`, 0, '5511988887777')}
  <label class="ins inl"><input type="checkbox" ${l.waFloat !== false ? 'checked' : ''} onchange="lpSet('waFloat',this.checked)"> botão flutuante do WhatsApp na página</label><br><label class="ins inl"><input type="checkbox" ${l.waAfter ? 'checked' : ''} onchange="lpSet('waAfter',this.checked)"> depois de enviar o formulário, abrir a conversa no WhatsApp</label>
  <div class="row-gap" style="margin:6px 0"><button class="btn sm" onclick="utmOpen()" title="Para saber de qual campanha e anúncio cada lead veio">🔗 Gerar link com UTM para o anúncio</button></div>
  ${lpIn('Mensagem inicial no WhatsApp', l.waMsg, `lpSet('waMsg',this.value)`, 0, 'Olá! Vim pela página e quero saber mais')}
  <small class="muted block">O formulário grava o lead no servidor e distribui para e-mail do gestor e do vendedor, planilha, CRM e WhatsApp do vendedor, conforme configurado em <b>Configurações → Integrações → Distribuição de leads</b>. O lead leva nome, telefone e o interesse escrito pela pessoa.</small></div>
  <div class="panel" style="margin-top:10px"><h3>Depois do envio do formulário</h3><div class="field"><label>O que acontece quando a pessoa clica em enviar</label><select onchange="lpSet('thanks.mode',this.value);renderLandings()">${[['page', 'Ir para uma página de obrigado (recomendado)'], ['url', 'Ir para outro endereço (URL)'], ['none', 'Só mostrar a mensagem na própria página']].map(([v, n]) => `<option value="${v}" ${(l.thanks || {}).mode === v ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
  ${(l.thanks || {}).mode === 'url' ? lpIn('Endereço da página de obrigado', l.thanks.url, `lpSet('thanks.url',this.value.trim())`, 0, 'https://…') : ''}${(l.thanks || {}).mode === 'page' ? lpIn('Título da página de obrigado', l.thanks.title, `lpSet('thanks.title',this.value)`, 0, 'Recebemos os seus dados') + lpIn('Texto', l.thanks.text, `lpSet('thanks.text',this.value)`, 0, 'Nossa equipe vai entrar em contato em breve, pelo WhatsApp informado.') : ''}
  <small class="muted block">Com a página de obrigado, a exportação inclui o arquivo <span class="mono">obrigado.html</span> (suba na mesma pasta). É nela que o Pixel da Meta e o Google Analytics registram o <b>lead</b>, e ela leva ao WhatsApp. Os dados (nome, telefone, e-mail e a origem do anúncio) já foram para o servidor, e-mails, planilha, CRM e WhatsApp antes dessa página abrir.</small></div>
  ${lpIn('Política de privacidade (URL)', l.privacyUrl, `lpSet('privacyUrl',this.value)`, 0, 'https://…')}${lpIn('ID do Pixel da Meta (só números)', l.tracking.metaPixel, `lpSet('tracking.metaPixel',this.value.trim())`)}${lpIn('ID do Google Analytics 4 (G-XXXXXXX)', l.tracking.ga4, `lpSet('tracking.ga4',this.value.trim())`)}
  <div class="field"><label>Status</label><select onchange="lpCur().status=this.value;persist()">${['Rascunho', 'Em revisão', 'Aprovada', 'Exportada', 'Publicada'].map(s => `<option ${l.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
  <div class="row-gap" style="flex-wrap:wrap"><button class="btn dark" onclick="lpExport('${l.id}')">⬇ Exportar HTML</button><button class="btn" onclick="lpCopyHTML()">Copiar HTML</button><button class="btn" onclick="wpElOpen('page','${l.id}')" title="Modelo para importar no Elementor de qualquer WordPress">⬇ Modelo do Elementor</button></div><small class="muted block" style="margin-top:8px">O arquivo é uma página única, responsiva, sem dependência além das fontes. Suba na Hostinger (public_html) ou em qualquer hospedagem. O formulário envia para <span class="mono">${lpA(state.workspace.leadsUrl || 'a URL de leads (não configurada)')}</span>. O Pixel e o GA4 só entram no arquivo exportado, não na prévia.</small>`;
}
/* ---------- SEO + compartilhamento ---------- */
const lpHasImg = id => id ? '✓ definida' : 'não definida';
function lpSeoPanel(l, p) {
  const o = lpSeoOf(l, p), q = l.seo, s = o.site;
  setTimeout(lpSeoLive, 30);
  return `<div class="panel" style="margin-top:10px"><h3>SEO e compartilhamento</h3>
  <small class="muted block" style="margin-bottom:6px">O que aparece no Google e no cartão que se abre ao colar o link no WhatsApp, Facebook, LinkedIn ou X. Campos vazios usam o texto da própria página${s ? ' e os dados do site' : ''}.</small>
  <div class="field"><label>Título da página <span id="seoTc" class="muted"></span></label><input id="seoT" value="${lpA(q.title)}" oninput="lpSeoSet('title',this.value)" placeholder="automático a partir do título principal"></div>
  <div class="field"><label>Descrição <span id="seoDc" class="muted"></span></label><textarea id="seoD" rows="3" oninput="lpSeoSet('desc',this.value)" placeholder="${lpA(s && s.desc ? 'usa a descrição do site' : 'automático a partir do subtítulo')}">${lpA(q.desc)}</textarea></div>
  <div class="field"><label>Palavra-chave principal</label><input value="${lpA(q.keyword)}" oninput="lpSeoSet('keyword',this.value)" placeholder="ex.: renegociar dívida consignado"></div>
  ${s && l.slug !== 'index' ? `<div class="field"><label>Endereço da página (slug)</label><input value="${lpA(l.slug)}" onchange="lpSlugSet(this.value)" placeholder="servicos"><small class="muted">arquivo: ${lpA(o.file)} (os links do menu acompanham)</small></div>` : ''}
  ${s ? `<small class="muted block">Imagem, favicon e endereço do site são definidos em <b>Sites → Cabeçalho, menu e rodapé</b>; aqui você pode trocar só para esta página.</small>` : ''}
  <div class="field"><label>Endereço do site publicado (começa com https://)</label><input value="${lpA(q.baseUrl)}" onchange="lpSeoSet('baseUrl',this.value,true)" placeholder="${lpA(s && s.baseUrl ? s.baseUrl : 'https://www.seudominio.com.br')}"></div>
  <div class="row-gap" style="flex-wrap:wrap;margin-bottom:6px"><button class="btn sm" onclick="lpSeoImg('ogImgId')">📚 Imagem de compartilhamento (${lpHasImg(q.ogImgId)})</button>${q.ogImgId ? `<button class="btn sm" onclick="lpSeoImgClear('ogImgId')">×</button>` : ''}<button class="btn sm" onclick="lpSeoImg('faviconImgId')">📚 Favicon (${lpHasImg(q.faviconImgId)})</button>${q.faviconImgId ? `<button class="btn sm" onclick="lpSeoImgClear('faviconImgId')">×</button>` : ''}</div>
  <div id="seoLive"></div></div>`;
}
let lpSeoTimer = 0;
function lpSeoSet(k, v, re) { const l = lpCur(); l.seo[k] = k === 'baseUrl' ? seoBase(v) : v; persist(); lpPaintSoon(); if (re) renderLandings(); else { clearTimeout(lpSeoTimer); lpSeoTimer = setTimeout(lpSeoLive, 350); } }
function lpSlugSet(v) { const l = lpCur(), p = curProject(), sl = slug(v).slice(0, 40); if (!sl || p.landings.some(x => x.id !== l.id && x.siteId === l.siteId && x.slug === sl)) { toast('Endereço vazio ou já usado por outra página.'); renderLandings(); return; } l.slug = sl; persist(); renderLandings(); }
function lpSeoImg(k) { libPick(r => { lpCur().seo[k] = r.id; persist(); renderLandings(); }); }
function lpSeoImgClear(k) { lpCur().seo[k] = ''; persist(); renderLandings(); }
async function lpSeoLive() {
  const box = $('seoLive'); if (!box) return; const l = lpCur(), p = curProject(); if (!l) return;
  const h = await lpHTML(l, p, {preview: true}), o = lpSeoOf(l, p), g = re => { const m = h.match(re); return m ? m[1] : ''; };
  const un = s => String(s).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  const title = un(g(/<title>([\s\S]*?)<\/title>/)), desc = un(g(/<meta name="description" content="([^"]*)"/));
  const body = h.slice(h.indexOf('<body')), hs = [...body.matchAll(/<h([1-6])[\s>][\s\S]*?<\/h\1>/g)].map(m => ({n: +m[1], t: m[0].replace(/<[^>]+>/g, '').trim()}));
  const h1 = hs.filter(x => x.n === 1), jump = hs.some((x, i) => i && x.n - hs[i - 1].n > 1) || (hs[0] && hs[0].n > 1), noAlt = (body.match(/<img(?![^>]*\balt="[^"]+")[^>]*>/g) || []).length, kw = o.keyword.toLowerCase(), has = t => !kw || t.toLowerCase().includes(kw);
  $('seoTc') && ($('seoTc').textContent = title.length + ' caracteres (ideal 30–60)'); $('seoDc') && ($('seoDc').textContent = desc.length + ' caracteres (ideal 70–160)');
  const C = [[title.length >= 30 && title.length <= 60, `Título com ${title.length} caracteres (ideal 30–60)`], [desc.length >= 70 && desc.length <= 160, `Descrição com ${desc.length} caracteres (ideal 70–160)`], [h1.length === 1, h1.length === 1 ? 'Um único H1 na página' : `${h1.length} títulos H1 (o ideal é exatamente 1)`], [!jump, jump ? 'A hierarquia pula níveis (ex.: H1 → H3); use H2 entre eles' : 'Hierarquia H1 → H2 → H3 sem pulos'], [noAlt === 0, noAlt ? `${noAlt} imagem(ns) sem texto alternativo` : 'Imagens com texto alternativo']];
  if (kw) C.push([has(title), 'Palavra-chave no título'], [has(desc), 'Palavra-chave na descrição'], [h1[0] ? h1[0].t.toLowerCase().includes(kw) : false, 'Palavra-chave no H1']);
  C.push([!!o.ogId, o.ogId ? 'Imagem de compartilhamento definida' + (l.seo.ogImgId || (o.site && o.site.ogImgId) ? '' : ' (pegou a primeira imagem da página)') : 'Sem imagem de compartilhamento: o link sai sem imagem nas redes'], [!!o.base, o.base ? 'Endereço do site informado (necessário para a imagem aparecer nas redes)' : 'Informe o endereço do site publicado: sem ele a imagem do cartão não é incluída'], [!!o.fav, o.fav ? 'Favicon definido' : 'Sem favicon (o ícone da aba fica genérico)']);
  const img = await lpOgData(o.ogId), host = (o.base || '').replace(/^https?:\/\//, '').split('/')[0] || 'seudominio.com.br';
  box.innerHTML = `<div class="okr-label">COMO O LINK APARECE AO COMPARTILHAR</div><div class="seo-card">${img ? `<img src="${img}" alt="">` : '<div class="seo-noimg">sem imagem</div>'}<div class="seo-t"><small>${lpA(host.toUpperCase())}</small><b>${lpA(title.slice(0, 70))}</b><span>${lpA(desc.slice(0, 120))}</span></div></div>
  <div class="okr-label" style="margin-top:10px">VERIFICAÇÃO</div>${C.map(([ok, t]) => `<div class="so-issue ${ok ? '' : 'aviso'}" style="${ok ? 'background:#e9f7ee;color:#176b30' : ''}">${ok ? '✓' : '⚠'} ${lpA(t)}</div>`).join('')}
  <details style="margin-top:6px"><summary class="muted" style="cursor:pointer">Estrutura de títulos (${hs.length})</summary>${hs.map(x => `<div style="margin-left:${(x.n - 1) * 14}px;font-size:12.5px"><b class="mono">H${x.n}</b> ${lpA(x.t.slice(0, 70))}</div>`).join('') || '<small class="muted">nenhum título</small>'}</details>
  <small class="muted block" style="margin-top:6px">As redes só mostram a imagem se ela estiver hospedada em um endereço público: o arquivo <span class="mono">${lpA(o.ogFile)}</span> vai junto na exportação (ZIP); suba na mesma pasta da página. Depois de publicar, use o Depurador de Compartilhamento do Facebook para atualizar o cache.</small>`;
}
async function lpCopyHTML() { const l = lpCur(); try { await navigator.clipboard.writeText(await lpHTML(l, curProject())); toast('HTML copiado.'); } catch (e) { toast('Não consegui copiar; use Exportar.'); } }

/* ---------- referências de landing pages (URLs) ---------- */
const LP_REF_TYPES = {cadastro: 'Cadastro', curso: 'Curso', ebook: 'E-book', servico: 'Serviço', evento: 'Evento', produto: 'Produto', institucional: 'Institucional', outro: 'Outro'};
const LP_REF_SEED = [
  ['https://www.vindeacristo.org/ps/licao-sobre-o-livro-de-mormon', 'Aprenda com os missionários e receba uma cópia gratuita do Livro de Mórmon', 'cadastro', 'Enviada por você (página de cadastro).'],
  ['https://www.vindeacristo.org/ps/reunir-com-missionarios', 'Aproxime-se de Deus. Converse com os missionários.', 'cadastro', 'Mesma família de páginas de cadastro (/ps/).'],
  ['https://www.vindeacristo.org/ps/licao-sobre-jesus-cristo', 'Torne-se a melhor versão de si mesmo por meio de Jesus Cristo', 'cadastro', 'Mesma família (/ps/).'],
  ['https://www.vindeacristo.org/all/licao-de-pascoa', 'Descubra o que é possível com Jesus Cristo. Converse com os missionários.', 'cadastro', 'Versão sazonal (Páscoa).'],
  ['https://www.vindeacristo.org/formulario/descubra-a-biblia-sagrada', 'Receba um exemplar gratuito da Bíblia', 'cadastro', 'Formulário direto (/formulario/).'],
  ['https://www.vindeacristo.org/formulario/visita-dos-missionarios', 'Converse com os missionários on-line ou pessoalmente', 'cadastro', 'Formulário direto (/formulario/).'],
  ['https://enwp.com.br/treinamento/robo-monitoramento-processual', 'Robô de monitoramento processual (treinamento)', 'curso', 'Enviada por você.'],
  ['https://enwp.com.br/treinamento/governanca-de-ia', 'Governança de IA (treinamento)', 'curso', 'Enviada por você.'],
  ['https://akimobmoveis.com.br/landpage-produtos/', 'Landing de produtos (móveis)', 'produto', 'Enviada por você.'],
  ['https://anuncie.eletromidia.com.br/', 'Anuncie na Eletromidia', 'servico', 'Enviada por você (campanha de captação B2B).'],
  ['https://imidiaoutdoor.com.br/', 'Imidia Outdoor', 'servico', 'Enviada por você.'],
  ['https://landingi.com/pt-br/landing-page/ebook-exemplos/', 'Landingi · exemplos de landing page de e-book', 'ebook', 'Enviada por você (inclui o exemplo Emily Kimelman: gráficos, amostra grátis, escolha de formato, vídeo do autor, avaliações e preço claro).'],
  ['https://landingi.com/landing-page/ebook-examples/', 'Landingi · 20 best ebook landing page examples', 'ebook', 'Versão em inglês da galeria.'],
  ['https://blog.greatpages.com.br/post/landing-page-ebook-exemplos-passo-a-passo-converter', 'GreatPages · landing page de e-book: 10 exemplos e passo a passo', 'ebook', 'Achada por busca (português).'],
  ['https://blog.greatpages.com.br/post/landing-page-ebook-exemplos-como-criar', 'GreatPages · 10 exemplos reais e como criar a sua', 'ebook', 'Achada por busca (português).'],
  ['https://www.rdstation.com/blog/materiais-educativos/ebooks/exemplos-de-landing-pages/', 'RD Station · 34 exemplos de landing pages que convertem', 'ebook', 'Achada por busca (português).'],
  ['https://www.zoho.com/blog/pt-br/marketing/landing-page-para-ebook.html', 'Zoho · landing page para e-book: 3 exemplos que funcionam', 'ebook', 'Achada por busca (português).'],
  ['https://studioartemis.co/conteudos/negocios/landing-page-para-ebook-estrutura-ideal-para-vender-mais/', 'Studio Artemis · estrutura ideal de landing page para e-book', 'ebook', 'Achada por busca (estrutura).'],
  ['https://www.mailerlite.com/landing-page-examples/ebook', 'MailerLite · galeria de landing pages de e-book', 'ebook', 'Achada por busca.']
];
function lpRefs() { if (!state.lpRefs) state.lpRefs = normalizeLpRefs(null); const R = state.lpRefs; if (!Array.isArray(R.seen)) R.seen = []; let ch = false; LP_REF_SEED.forEach(([url, title, type, note]) => { if (R.seen.includes(url) || R.items.some(r => r.url === url)) { if (!R.seen.includes(url)) { R.seen.push(url); ch = true; } return; } R.seen.push(url); R.items.push({id: uid('rf'), url, title, type, note, use: true, scan: null}); ch = true; }); R.seeded = true; if (ch) persist(); return R; }
function lpRefsHTML() {
  const R = lpRefs();
  return `<div class="panel" style="margin-top:14px"><div class="section-row"><div><h3>Referências de landing pages</h3><p class="muted" style="margin:2px 0 0;font-size:12.5px">URLs de páginas que servem de modelo. “Ler estrutura” lê a página pelo seu servidor (blocos, títulos, botões, fontes e cores) e a IA usa só a estrutura como inspiração ao gerar, sem copiar texto.</p></div></div>
  <div class="row-gap" style="margin:8px 0;flex-wrap:wrap"><input id="lrU" placeholder="https://…" style="flex:1;min-width:220px"><select id="lrT">${Object.entries(LP_REF_TYPES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select><input id="lrN" placeholder="Nota (opcional)" style="flex:1;min-width:140px"><button class="btn sm dark" onclick="lpRefAdd()">＋ Adicionar</button></div>
  ${R.items.map(r => `<div class="list-item lp-ref"><div style="min-width:0"><strong><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title || r.url)}</a></strong><small class="block muted" style="white-space:normal">${esc(LP_REF_TYPES[r.type])} · ${esc(r.url.replace(/^https?:\/\//, '').slice(0, 70))}${r.note ? ' · ' + esc(r.note) : ''}</small>${r.scan ? `<small class="block" style="white-space:normal;color:#176b30">✓ Lida: ${r.scan.headings.length} título(s), ${r.scan.ctas.length} botão(ões)${r.scan.fonts.length ? ' · fontes ' + esc(r.scan.fonts.slice(0, 2).join(', ')) : ''}${r.scan.colors.length ? ' · ' + r.scan.colors.slice(0, 4).map(c => `<i class="so-net" style="background:${esc(c)};width:11px;height:11px;border:1px solid #ddd"></i>`).join('') : ''}</small>` : ''}</div><div class="row-gap"><label class="ins inl" title="Usar como inspiração ao gerar"><input type="checkbox" ${r.use ? 'checked' : ''} onchange="lpRefUse('${r.id}',this.checked)"> usar</label><button class="btn sm" onclick="lpRefScan('${r.id}')" ${lpUI.refBusy ? 'disabled' : ''}>${lpUI.refBusy === r.id ? 'Lendo…' : r.scan ? 'Reler' : 'Ler estrutura'}</button><button class="btn sm" onclick="lpRefDel('${r.id}')">×</button></div></div>`).join('')}</div>`;
}
const lpCleanUrl = u => { try { const x = new URL(u); [...x.searchParams.keys()].forEach(k => { if (/^(gclid|gbraid|wbraid|fbclid|msclkid|gad_.*|utm_.*|hsa_.*|cid|cq_cmp|adlang|source|network|ef_id|s_kwcid)$/i.test(k)) x.searchParams.delete(k); }); return x.toString(); } catch (e) { return u; } };
function lpRefAdd() { const u = $('lrU').value.trim(); if (!/^https?:\/\/\S+$/i.test(u)) { toast('Cole um endereço completo, começando com https://'); return; } lpRefs().items.unshift({id: uid('rf'), url: lpCleanUrl(u), title: '', type: $('lrT').value, note: $('lrN').value.trim(), use: true, scan: null}); persist(); renderLandings(); }
function lpRefUse(id, v) { lpRefs().items.find(r => r.id === id).use = v; persist(); }
function lpRefDel(id) { const R = lpRefs(); R.items = R.items.filter(r => r.id !== id); persist(); renderLandings(); }
async function lpRefScan(id) {
  const r = lpRefs().items.find(x => x.id === id); if (!r || lpUI.refBusy) return; if (!canUseApi()) { toast(needsLogin() ? 'Entre no Studio para ler sites.' : 'A leitura de sites exige o servidor PHP (Hostinger).'); return; }
  lpUI.refBusy = id; renderLandings();
  try { const x = await radarFetchScan(r.url); r.scan = {title: x.title || '', description: x.description || '', headings: x.headings || [], ctas: x.ctas || [], fonts: x.fonts || [], colors: x.colors || [], at: new Date().toISOString()}; if (!r.title) r.title = x.title || r.title; persist(); toast('Estrutura lida.'); } catch (e) { toast(e.message); }
  lpUI.refBusy = ''; renderLandings();
}
/* trecho para o prompt: só estrutura, de referências marcadas e lidas */
function lpRefPrompt(l) {
  const R = lpRefs().items.filter(r => r.use && r.scan && (r.type === l.type || r.type === 'cadastro' && l.type === 'cadastro')).slice(0, 3);
  return R.length ? 'REFERÊNCIAS DE ESTRUTURA (use só como inspiração de ordem, tom e tamanho dos blocos; NÃO copie frases nem marcas):\n' + R.map(r => `- ${r.title}: títulos [${r.scan.headings.slice(0, 10).join(' | ')}]; botões [${r.scan.ctas.slice(0, 6).join(' | ')}]`).join('\n') + '\n\n' : '';
}

function lpUseProduct(id) {
  const l = lpCur(), x = curProject().products.find(y => y.id === id); l.productId = id || ''; l.pick = {b: [], f: [], all: true};
  if (x) { Object.assign(l.product, {nome: x.name, preco: x.price || l.product.preco, publico: x.audience || l.product.publico, checkout: x.checkout || l.product.checkout}); if (x.summary && !/Descrição:/.test(l.input)) l.input = ((l.input ? l.input + '\n\n' : '') + 'Descrição: ' + x.summary).slice(0, 60000); }
  persist(); renderLandings();
}
function lpPick(key, i, on) {
  const l = lpCur(), x = curProject().products.find(y => y.id === l.productId); if (!x) return;
  if (l.pick.all !== false) { l.pick = {b: x.benefits.map((_, n) => n), f: x.features.map((_, n) => n), all: false}; }
  const a = l.pick[key], at = a.indexOf(i); if (on && at < 0) a.push(i); if (!on && at >= 0) a.splice(at, 1); persist();
}

function lpBack() { lpUI.id = ''; if (lpUI.back === 'site') { lpUI.main = 'sites'; } lpUI.back = ''; renderLandings(); }
