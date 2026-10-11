/* Esteira do projeto: do documento até o site, em etapas que dá para corrigir, ampliar e refazer a qualquer momento.
   "Gerar tudo que falta" completa SÓ o que ainda não existe, na ordem: base (ficha → marca, produtos, materiais, públicos) → pré-projeto (IA) → campanha de anúncios →
   posts simples e stories → carrosséis → site. Tudo é montado com os fatos informados (nada é inventado; o que falta fica em branco ou [CONFIRMAR]). Nunca apaga nem sobrescreve.
   Sem IA, o pré-projeto e o texto das páginas do site não são escritos (o resto nasce igual). Cada item criado é um item comum: edite nas telas de sempre. */
const ES = {busy: false, rows: [], note: ''};
const esAIOn = () => typeof aiReady === 'function' && aiReady();
const esL = t => (Array.isArray(t) ? t : String(t == null ? '' : t).split('\n')).map(x => String(x).trim()).filter(Boolean);
const esFirst = (t, n) => { const s = String(t || '').replace(/\s+/g, ' ').trim(), m = s.split(/(?<=[.!?])\s/)[0] || ''; return (m.length > n ? m.slice(0, n - 1).trim() + '…' : m); };
const esClip = (t, n) => { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1).trim() + '…' : t; };
const esSets = p => (p.design && p.design.sets) || [];

/* ---------- situação de cada etapa (lida do projeto, sempre atual) ---------- */
function esState(p) {
  const a = fpSt(p).answers, secs = BF_SECTIONS.filter(s => !s.files), doneSecs = secs.filter(fpSecDone).length, essential = !!(((a.empresa || {}).nome) && (a.produtos || []).some(x => x && x.nome));
  const prods = (p.products || []).length, idOk = !!(p.identity && (p.identity.values.length || p.identity.attitudes.length)), icps = ((p.pre && p.pre.icps) || []).length, preOk = !!(p.pre && p.pre.summary && p.pre.summary.blocks && p.pre.summary.blocks.length);
  const camps = (p.campaigns || []), ads = camps.reduce((n, c) => n + (c.pieces || []).length, 0), posts = esSets(p).filter(x => /^Post · /.test(x.name || '')).length, stories = esSets(p).filter(x => /^Stories · /.test(x.name || '')).length, cars = (p.carousels || []).length, sites = (p.sites || []).length, pages = (p.landings || []).filter(l => l.siteId).length;
  const st = (ok, part) => ok ? 'feito' : part ? 'parcial' : 'pendente';
  return {
    ficha: {s: st(essential, doneSecs > 0), t: `${doneSecs} de ${secs.length} partes respondidas${essential ? '' : ' · falta o nome da empresa e um produto'}`},
    base: {s: st(prods > 0 && (idOk || !((a.identidade || {}).valores || []).length), doneSecs > 0), t: `${prods} produto(s) e serviço(s) · marca ${idOk ? 'definida' : 'ainda não definida'} · ${icps} público(s)`},
    pre: {s: st(preOk, icps > 0), t: preOk ? 'diagnóstico, resumo e jornada prontos' : icps ? `${icps} público(s) com dores e desejos; falta o diagnóstico e a jornada` : 'ainda não gerado'},
    camp: {s: st(camps.length > 0, false), t: camps.length ? `${camps.length} campanha(s) · ${ads} anúncio(s)` : 'nenhuma campanha ainda'},
    org: {s: st(posts > 0 && stories > 0, posts > 0 || stories > 0), t: `${posts} post(s) simples · ${stories} quadro(s) de story`},
    car: {s: st(cars > 0, false), t: `${cars} carrossel(is)`},
    site: {s: st(sites > 0, false), t: sites ? `${sites} site(s) · ${pages} página(s)` : 'nenhum site ainda'}
  };
}
const ES_DEF = [
  ['ficha', 'Ficha e documento', 'Todas as respostas do projeto num lugar só: suba o documento, responda na tela, mande o link ao cliente ou use a planilha.'],
  ['base', 'Base do projeto', 'Marca e arquétipo, produtos e serviços, materiais e públicos (dores, dúvidas e desejos) vindos da ficha.'],
  ['pre', 'Pré-projeto', 'Diagnóstico, resumo, públicos e jornada. A IA escreve; você corrige em cada bloco.'],
  ['camp', 'Anúncios', 'Campanha com as 5 fases da jornada de compra, já com as artes (feed, vertical e horizontal).'],
  ['org', 'Posts simples e stories', 'Artes prontas a partir das dores, desejos e benefícios informados, já como rascunho em Publicação.'],
  ['car', 'Carrosséis', 'Um carrossel por produto, com o que foi informado (benefícios e chamada final).'],
  ['site', 'Site', 'Site de várias páginas (StoryBrand) com o BrandScript preenchido pelos fatos; com IA, as páginas são escritas.']
];

/* ---------- etapas: cada uma só cria o que falta ---------- */
function esToK(a, icpDoc) {
  const pub = a.publico || {}, K = icpDoc ? JSON.parse(JSON.stringify(icpDoc)) : docParse(''); K.products = []; K.client = K.client || '';
  if (!(K.icps || []).length && ['quem', 'problemas', 'perguntas', 'desejos', 'ocultas', 'situacoes'].some(k => esL(pub[k]).length)) K.icps = [{name: esFirst(pub.quem, 60) || 'Cliente ideal', profile: String(pub.quem || ''), situation: String(pub.situacoes || ''), need: '', behavior: '', intent: '', pains: esL(pub.problemas).join('\n'), doubts: esL(pub.perguntas).join('\n'), desires: esL(pub.desejos).join('\n'), hidden: esL(pub.ocultas).join('\n')}];
  return K;
}
const ES_RUN = {
  async base(p, o) {
    const a = fpSt(p).answers; if (!BF_SECTIONS.filter(s => !s.files).some(fpSecDone) && !o.icpDoc) return {s: 'pulado', note: 'a ficha está vazia'};
    const x = bfApply(p, a); let icp = 0; try { const r = docApply(p, esToK(a, o.icpDoc), {banks: true}); icp = r.icpNew + r.icpUpd; } catch (e) { /* públicos são um extra */ }
    persist(); return {s: 'feito', note: `${x.added} produto(s) novo(s), ${x.upd} atualizado(s)${x.ident ? ', marca definida' : ''}${icp ? ', ' + icp + ' público(s)' : ''}`};
  },
  async pre(p) {
    if (!esAIOn()) return {s: 'pulado', note: 'precisa da IA (Configurações → Integrações). Os públicos da ficha já servem para a campanha'};
    if (typeof preGenAll !== 'function') return {s: 'pulado', note: 'indisponível aqui'}; await preGenAll(false); return {s: 'feito', note: 'pré-projeto gerado (confira os blocos)'};
  },
  async camp(p) {
    if ((p.campaigns || []).length) return {s: 'ja', note: 'já existe campanha'};
    const r = await cmpCreateRun(p, {name: (p.client || p.name) + ' · campanha inicial', objective: 'Leads', n: 3, ff: 'feed45', quiet: true}); return {s: 'feito', note: `${r.total} anúncios (${r.total * 3} artes)`};
  },
  async org(p) {
    const bank = cmpDraftBank(p, 6), prods = p.products || [], heads = []; const add = t => { t = esClip(t, 88); if (t && !heads.includes(t)) heads.push(t); };
    const mk = cmpMakeHeads(bank, 8); mk.h.forEach(add); prods.forEach(x => (x.benefits || []).slice(0, 2).forEach(add)); if (!heads.length) return {s: 'pulado', note: 'faltam dores, desejos ou benefícios para escrever os títulos'};
    const cta = (bank.c || [])[0] || 'Fale no WhatsApp', posts = [], frames = [], nP = Math.min(6, heads.length);
    for (let i = 0; i < nP; i++) { const pr = prods.length ? prods[i % prods.length] : null, sub = pr ? esFirst(pr.summary, 190) : esFirst((p.brief || {}).offer, 190); posts.push({code: 'ES-P' + String(i + 1).padStart(2, '0'), n: 0, h: heads[i], s: sub, btn: cta, caption: [pr && pr.summary, pr && pr.checkout ? 'Saiba mais: ' + pr.checkout : ''].filter(Boolean).join('\n\n').slice(0, 2200), hashtags: '', fmt: '4:5', imgId: '', date: '', obs: ''}); }
    for (let si = 0; si < Math.min(2, heads.length); si++) { const pr = prods.length ? prods[si % prods.length] : null, code = 'ES-S' + (si + 1), body = pr ? esFirst(((pr.benefits || [])[0] || pr.summary), 140) : esFirst((p.brief || {}).offer, 140);
      frames.push({code, n: 1, h: esClip(heads[si], 66), s: '', btn: '-'}, {code, n: 2, h: esClip(pr ? pr.name : (p.client || p.name), 66), s: body, btn: '-'}, {code, n: 3, h: 'Vamos conversar?', s: '', btn: cta}); }
    const base = {caption: '', hashtags: '', fmt: '9:16', imgId: '', date: '', obs: ''}, fp = posts.filter(it => !pmHaveSingle(p, it, false)), fs = frames.map(f => Object.assign({}, base, f, {btn: f.btn === '-' ? null : f.btn})).filter(it => !pmHaveSingle(p, it, true));
    if (!fp.length && !fs.length) return {s: 'ja', note: 'já existem'}; if (fp.length) await pmBuildSingles(p, fp, {adLogo: true}, 'post1'); if (fs.length) await pmBuildSingles(p, fs, {adLogo: true}, 'story'); persist();
    return {s: 'feito', note: `${fp.length} post(s) e ${fs.length} quadro(s) de story (rascunhos em Publicação)`};
  },
  async car(p) {
    if ((p.carousels || []).length) return {s: 'ja', note: 'já existe carrossel'};
    const made = [], o = {carLook: 'brand', carTpl: 'foto', carWhere: 'title', carStyle: ''};
    (p.products || []).slice(0, 3).forEach((pr, k) => {
      const mid = (pr.benefits || []).slice(0, 4).concat((pr.features || []).filter(f => !/^(Incluso|Prazo):/.test(f))).slice(0, 4); if (mid.length < 2) return;
      const items = [{text: esClip(pr.name, 90), text2: esFirst(pr.summary, 180)}].concat(mid.map(t => ({text: esClip(t, 110), text2: ''})), [{text: 'Fale com a gente', text2: ''}]); const code = 'ES-C' + (k + 1);
      try { made.push(pmBuildCarousel(p, Object.assign({code, name: esClip(pr.name, 60) + ' · o essencial', n: items.length, items, refs: [], idea: '', src: {code, day: '', order: 0, theme: '', type: '', tension: ''}}, pmPub(), {stage: 'topo', caption: pr.summary || '', cta: 'Fale com a gente'}), o)); } catch (e) { /* esse produto fica sem carrossel */ }
    });
    if (!made.length) return {s: 'pulado', note: 'cada produto precisa de pelo menos 2 benefícios ou características'}; p.carousels = made.concat(p.carousels).slice(0, 600); persist(); return {s: 'feito', note: `${made.length} carrossel(is)`};
  },
  async site(p) {
    if ((p.sites || []).length) return {s: 'ja', note: 'já existe site'};
    const r = await esSiteAuto(p); return {s: 'feito', note: r};
  }
};
/* site: modelo pelo tipo dos produtos; BrandScript preenchido SÓ com os fatos informados; com IA, as páginas são escritas */
async function esSiteAuto(p) {
  const a = fpSt(p).answers, pub = a.publico || {}, icp = ((p.pre && p.pre.icps) || [])[0] || {}, prods = p.products || [], f = prods[0] || {}, types = prods.map(x => x.type);
  const tpl = types.length && types.every(t => t === 'produto') ? 'produtos' : types.includes('curso') ? 'autoridade' : 'servicos', T = SITE_TPL[tpl], name = String(p.client || p.name).slice(0, 80);
  const steps = (f.features || []).filter(x => !/^(Incluso|Prazo):/.test(x)), pains = esL(pub.problemas).length ? esL(pub.problemas) : esL(icp.pains), des = esL(pub.desejos).length ? esL(pub.desejos) : esL(icp.desires), hid = esL(pub.ocultas).length ? esL(pub.ocultas) : esL(icp.hidden);
  const site = normalizeSites([{id: uid('st'), name, tpl, productId: f.id || '', brand: name, headerCta: 'Fale com a gente', brief: [(p.brief || {}).offer, ...prods.map(x => x.name + (x.summary ? ': ' + x.summary : ''))].filter(Boolean).join('\n').slice(0, 8000),
    bs: {who: String(pub.quem || icp.profile || ''), wants: des[0] || '', external: pains.slice(0, 3).join('; '), step1: steps[0] || '', step2: steps[1] || '', step3: steps[2] || '', agreement: String(f.warranty || ''), direct: 'Fale com a gente', failure: hid[0] || '', success: des.slice(0, 2).join('; '), authority: (f.proofs || []).join('; ')}}])[0];
  p.sites.push(site); const theme = lpTheme(p), pages = [];
  T.pages.forEach(pg => { const l = normalizeLandings([{id: uid('lp'), name: name + ' — ' + pg.label, siteId: site.id, slug: pg.slug, navLabel: pg.label, type: 'generico', productId: f.id || '', product: f.id ? {nome: f.name, preco: f.price, publico: f.audience, checkout: f.checkout} : {}, theme, cta: 'Fale com a gente', blocks: pg.blocks.map(lpBlockNew), status: 'Rascunho'}])[0]; l.siteRole = pg.role; p.landings.push(l); pages.push(l); });
  persist(); let note = `${T.label}: ${pages.length} páginas, BrandScript com os fatos informados (o que falta fica em branco)`;
  if (esAIOn() && typeof siteGenPage === 'function' && siteBSText(site)) { try { for (const l of pages) { await siteGenPage(site, l); persist(); } note += '; páginas escritas com IA (revise os [CONFIRMAR])'; } catch (e) { note += '; a IA não conseguiu escrever as páginas (' + (e.message || e) + ')'; } }
  else note += esAIOn() ? '; sem BrandScript suficiente para a IA escrever' : '; sem IA, as páginas ficam como esqueleto';
  return note;
}

/* ---------- gerar tudo que falta (com painel de andamento) ---------- */
const ES_ORDER = [['base', 'Base do projeto'], ['pre', 'Pré-projeto (IA)'], ['camp', 'Campanha de anúncios'], ['org', 'Posts simples e stories'], ['car', 'Carrosséis'], ['site', 'Site']];
const ES_ICON = {espera: '○', rodando: '⏳', feito: '✔', ja: '✔', pulado: '⚠', erro: '✖'};
function esPanel(done) {
  showModal(done ? 'Projeto montado' : 'Montando o projeto…', `<p class="muted" style="margin-top:0;font-size:13px">${done ? 'Veja o que foi criado. Tudo continua editável: abra cada etapa para corrigir ou acrescentar.' : 'Isto leva alguns segundos. Não feche a página.'}</p><div class="list">${ES.rows.map(r => `<div class="list-item"><div><strong>${ES_ICON[r.s] || '○'} ${esc(r.label)}</strong><small>${esc(r.note || (r.s === 'rodando' ? 'em andamento…' : r.s === 'espera' ? 'na fila' : ''))}</small></div></div>`).join('')}</div>${done ? `<div class="modal-actions"><button class="btn dark" onclick="closeModal();esTab('esteira')">Ver a esteira</button></div>` : ''}`);
}
async function esAutoRun(o) {
  o = o || {}; if (ES.busy) { toast('A esteira já está rodando.'); return; } const p = curProject(); if (!p) { toast('Abra um projeto.'); return; }
  ES.busy = true; ES.rows = ES_ORDER.map(([k, label]) => ({k, label, s: 'espera', note: ''})); esPanel(false);
  try {
    for (const r of ES.rows) {
      r.s = 'rodando'; if (r.k !== 'pre') esPanel(false);
      try { const x = await ES_RUN[r.k](p, o); r.s = x.s; r.note = x.note; } catch (e) { r.s = 'erro'; r.note = (e && e.message) || String(e); }
      if (r.k === 'pre') { /* a geração do pré-projeto usa o próprio painel */ }
      esPanel(false);
    }
  } finally { ES.busy = false; persist(); }
  esPanel(true); if (ui.page === 'project' && ui.tab === 'esteira') keepScroll(renderProjectTab);
}
async function esRunOne(k) {
  const p = curProject(); if (!p || ES.busy) return; ES.busy = true; toast('Montando…');
  try { const x = await ES_RUN[k](p, {}); toast(x.note ? (x.s === 'pulado' ? 'Não foi possível: ' : '') + x.note : 'Pronto.'); } catch (e) { toast('Não consegui: ' + ((e && e.message) || e)); } finally { ES.busy = false; persist(); }
  if (ui.page === 'project') keepScroll(renderProjectTab);
}

/* ---------- tela ---------- */
function esTab(t) { ui.tab = t; if (ui.page !== 'project') go('project'); else renderProjectTab(); }
function esGo(where) {
  ({ficha: () => esTab('ficha'), base: () => esTab('identity'), produtos: () => esTab('products'), pre: () => esTab('preproject'), camp: () => go('campaigns'), org: () => go('design'), car: () => go('carrosseis'), site: () => { go('landings'); lpUI.main = 'sites'; lpUI.id = ''; renderLandings(); }})[where]();
}
function esNew(kind) {
  const f = {story: () => openCreation('story'), ad: () => openCreation('ad'), post: () => openCreation('post'), carousel: () => openCreation('carousel'), camp: () => { go('campaigns'); setTimeout(cmpNewModal, 60); }, page: () => { go('landings'); lpUI.main = 'paginas'; lpUI.id = ''; renderLandings(); setTimeout(lpNewModal, 60); }, site: () => { go('landings'); lpUI.main = 'sites'; lpUI.id = ''; renderLandings(); setTimeout(siteNewModal, 60); }, sheet: () => pmQuick('')};
  (f[kind] || (() => {}))();
}
function esHTML(p) {
  const S = esState(p), done = ES_DEF.filter(d => S[d[0]].s === 'feito').length, chip = s => ({feito: ['Pronto', '#176b30', '#e9f7ee'], parcial: ['Em andamento', '#7a5a00', '#fff5db'], pendente: ['Falta', '#666', '#eee']}[s]);
  const act = {
    ficha: `<button class="btn sm" onclick="fdOpen('cur')">⬆ Subir documento</button><button class="btn sm" onclick="esTab('ficha')">Abrir a ficha</button>`,
    base: `<button class="btn sm dark" onclick="esRunOne('base')">↻ Aplicar a ficha de novo</button><button class="btn sm" onclick="esGo('base')">Marca e arquétipo</button><button class="btn sm" onclick="esGo('produtos')">Produtos e serviços</button>`,
    pre: `<button class="btn sm dark" onclick="esRunOne('pre')">✦ ${S.pre.s === 'feito' ? 'Refazer' : 'Gerar'} com IA</button><button class="btn sm" onclick="esGo('pre')">Abrir o pré-projeto</button>`,
    camp: `${S.camp.s === 'feito' ? '' : '<button class="btn sm dark" onclick="esRunOne(\'camp\')">Gerar campanha</button>'}<button class="btn sm" onclick="esGo('camp')">Abrir campanhas</button><button class="btn sm" onclick="esNew('camp')">＋ Nova campanha</button>`,
    org: `${S.org.s === 'feito' ? '' : '<button class="btn sm dark" onclick="esRunOne(\'org\')">Gerar posts e stories</button>'}<button class="btn sm" onclick="esGo('org')">Abrir o Estúdio de Design</button><button class="btn sm" onclick="esNew('post')">＋ Novo post</button><button class="btn sm" onclick="esNew('story')">＋ Novo story</button>`,
    car: `${S.car.s === 'feito' ? '' : '<button class="btn sm dark" onclick="esRunOne(\'car\')">Gerar carrosséis</button>'}<button class="btn sm" onclick="esGo('car')">Abrir carrosséis</button><button class="btn sm" onclick="esNew('carousel')">＋ Novo carrossel</button>`,
    site: `${S.site.s === 'feito' ? '' : '<button class="btn sm dark" onclick="esRunOne(\'site\')">Gerar o site</button>'}<button class="btn sm" onclick="esGo('site')">Abrir os sites</button><button class="btn sm" onclick="esNew('site')">＋ Novo site</button><button class="btn sm" onclick="esNew('page')">＋ Nova página</button>`
  };
  return `<div class="panel"><div class="section-row"><div><h3 style="margin:0">🚀 Esteira do projeto</h3><p class="muted" style="margin:2px 0 0;font-size:12.5px">Suba o documento e o Studio monta o caminho completo até o site. Cada etapa continua sua: corrija, acrescente ou crie coisas novas quando quiser. <b>Nada é apagado nem sobrescrito.</b></p></div></div>
    <div class="prog" style="height:8px;background:#e6e6ea;border-radius:99px;overflow:hidden;margin:12px 0 4px"><i style="display:block;height:100%;background:#111;width:${Math.round(done / ES_DEF.length * 100)}%"></i></div><small class="muted">${done} de ${ES_DEF.length} etapas prontas${esAIOn() ? '' : ' · IA desligada: o pré-projeto e o texto das páginas do site precisam dela'}</small>
    <div class="row-gap" style="flex-wrap:wrap;margin-top:12px"><button class="btn dark" onclick="esAutoRun()" ${ES.busy ? 'disabled' : ''}>✦ Gerar tudo que falta</button><button class="btn" onclick="fdOpen('cur')">⬆ Subir documento do projeto</button></div></div>
  <div style="margin-top:12px">${ES_DEF.map(([k, title, desc], i) => { const c = chip(S[k].s); return `<div class="list-item" style="display:block;border:1px solid #e6e6ea;border-radius:12px;margin:8px 0;padding:12px 14px"><div class="row-gap" style="justify-content:space-between;flex-wrap:wrap"><div style="display:flex;gap:10px;align-items:center"><span class="fp-n">${i + 1}</span><b>${esc(title)}</b></div><span style="font-size:12px;font-weight:700;border-radius:99px;padding:2px 10px;background:${c[2]};color:${c[1]}">${c[0]}</span></div><p class="muted" style="margin:6px 0 2px;font-size:12.5px">${esc(desc)}</p><small style="display:block;margin-bottom:8px"><b>${esc(S[k].t)}</b></small><div class="row-gap" style="flex-wrap:wrap">${act[k]}</div></div>`; }).join('')}</div>
  <div class="panel" style="margin-top:12px"><h3 style="margin:0 0 4px">＋ Acrescentar ao que já existe</h3><p class="muted" style="margin:0 0 10px;font-size:12.5px">O caminho completo já está montado? Crie coisas novas quando precisar, sem mexer no que existe.</p>
    <div class="row-gap" style="flex-wrap:wrap"><button class="btn sm" onclick="esNew('story')">▯ Novo story</button><button class="btn sm" onclick="esNew('ad')">◉ Novo anúncio</button><button class="btn sm" onclick="esNew('post')">▣ Novo post simples</button><button class="btn sm" onclick="esNew('carousel')">▤ Novo carrossel</button><button class="btn sm" onclick="esNew('camp')">📣 Nova campanha (5 fases)</button><button class="btn sm" onclick="esNew('page')">◍ Nova página</button><button class="btn sm" onclick="esNew('site')">🌐 Novo site</button><button class="btn sm" onclick="esNew('sheet')">⊞ Subir tabela em lote</button></div></div>`;
}
TABS.esteira = esHTML;
