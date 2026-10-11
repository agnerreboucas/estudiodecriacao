/* ===== Banco de templates de sites (todos na estrutura StoryBrand) + "Criar site com este briefing".
   Cada template é uma estrutura de páginas (SITE_TPL) com um visual próprio (cores, fontes, cantos, peso dos títulos e layout do topo).
   Só a estrutura e o estilo: nenhum texto, logo ou foto de terceiros. A galeria mostra a página real, já com o texto do cliente quando há briefing. ===== */
const SBT = [
  {id: 'aurora', nome: 'Aurora', nicho: 'Saúde', tipo: 'Serviço local', est: 'servicos', th: {accent: '#0f8b7d', bg: '#f6fbfa', fg: '#12302d', head: 'Fraunces', body: 'Manrope', rad: 14, hw: 600, hero: 'split', ly: {w:'normal',sh:'left',band:'alt',ben:'cards',st:'cards',pr:'cards',dor:'list',faq:'acc'}}},
  {id: 'calma', nome: 'Calma', nicho: 'Psicologia', tipo: 'Serviço local', est: 'servicos', th: {accent: '#7c5cc4', bg: '#faf7ff', fg: '#2a2140', head: 'Fraunces', body: 'Manrope', rad: 18, hw: 500, hero: 'center', ly: {w:'narrow',sh:'center',band:'none',ben:'nums',st:'line',pr:'quote',dor:'cards',faq:'acc'}}},
  {id: 'sorriso', nome: 'Sorriso Claro', nicho: 'Odontologia', tipo: 'Serviço local', est: 'servicos', th: {accent: '#0a7fb0', bg: '#f4fbff', fg: '#0b2a3a', head: 'Sora', body: 'Manrope', rad: 12, hw: 700, hero: 'split', ly: {w:'wide',sh:'left',band:'tint',ben:'rows',st:'cards',pr:'cards',dor:'cards',faq:'cols'}}},
  {id: 'toga', nome: 'Toga', nicho: 'Direito', tipo: 'Serviço local', est: 'servicos', th: {accent: '#8a6a2f', bg: '#ffffff', fg: '#1b1f2a', head: 'DM Serif Display', body: 'Manrope', rad: 4, hw: 400, hero: 'center', ly: {w:'narrow',sh:'left',band:'line',ben:'rows',st:'line',pr:'quote',dor:'list',faq:'acc'}}},
  {id: 'foro', nome: 'Foro', nicho: 'Direito', tipo: 'Serviço local', est: 'servicos', th: {accent: '#c9a24b', bg: '#14161c', fg: '#f1efe9', dark: true, head: 'DM Serif Display', body: 'Manrope', rad: 4, hw: 400, hero: 'center', ly: {w:'normal',sh:'center',band:'line',ben:'nums',st:'line',pr:'quote',dor:'list',faq:'acc'}}},
  {id: 'prumo', nome: 'Prumo', nicho: 'Contabilidade', tipo: 'Serviço local', est: 'servicos', th: {accent: '#1f6f50', bg: '#ffffff', fg: '#10243a', head: 'Manrope', body: 'Manrope', rad: 8, hw: 800, hero: 'center', ly: {w:'wide',sh:'left',band:'alt',ben:'nums',st:'cards',pr:'cards',dor:'cards',faq:'cols'}}},
  {id: 'cursopro', nome: 'Curso Pro', nicho: 'Cursos', tipo: 'Venda online', est: 'autoridade', th: {accent: '#ffb703', bg: '#0f1226', fg: '#f2f2fb', dark: true, head: 'Sora', body: 'Manrope', rad: 12, hw: 700, hero: 'big', ly: {w:'wide',sh:'center',band:'tint',ben:'cards',st:'line',pr:'cards',dor:'cards',faq:'cols'}}},
  {id: 'mentoria', nome: 'Mentoria', nicho: 'Mentoria', tipo: 'Venda online', est: 'autoridade', th: {accent: '#ff4d2e', bg: '#0c0c0c', fg: '#f5f5f5', dark: true, head: 'Sora', body: 'Manrope', rad: 0, hw: 700, hero: 'big', ly: {w:'normal',sh:'left',band:'none',ben:'rows',st:'line',pr:'quote',dor:'list',faq:'acc'}}},
  {id: 'ebook', nome: 'Lançamento', nicho: 'Infoproduto', tipo: 'Venda online', est: 'storybrand', th: {accent: '#1d6fe0', bg: '#ffffff', fg: '#0b2545', head: 'Sora', body: 'Manrope', rad: 10, hw: 600, hero: 'split', ly: {w:'narrow',sh:'center',band:'alt',ben:'cards',st:'cards',pr:'quote',dor:'cards',faq:'acc'}}},
  {id: 'nuvem', nome: 'Nuvem', nicho: 'Tecnologia', tipo: 'Venda online', est: 'storybrand', th: {accent: '#5b8cff', bg: '#0b1020', fg: '#e8ecff', dark: true, head: 'Sora', body: 'Manrope', rad: 12, hw: 600, hero: 'center', ly: {w:'wide',sh:'center',band:'line',ben:'cards',st:'line',pr:'cards',dor:'cards',faq:'cols'}}},
  {id: 'brasa', nome: 'Brasa', nicho: 'Restaurante', tipo: 'Produtos', est: 'produtos', th: {accent: '#c2410c', bg: '#fff7ee', fg: '#3a1f10', head: 'DM Serif Display', body: 'Manrope', rad: 16, hw: 400, hero: 'split', ly: {w:'normal',sh:'center',band:'tint',ben:'cards',st:'cards',pr:'quote',dor:'list',faq:'acc'}}},
  {id: 'grao', nome: 'Café Grão', nicho: 'Cafeteria', tipo: 'Produtos', est: 'produtos', th: {accent: '#7a4a21', bg: '#f6efe6', fg: '#2b1d14', head: 'Fraunces', body: 'Manrope', rad: 12, hw: 500, hero: 'split', ly: {w:'narrow',sh:'left',band:'alt',ben:'rows',st:'cards',pr:'cards',dor:'list',faq:'acc'}}},
  {id: 'petfeliz', nome: 'Pet Feliz', nicho: 'Pet', tipo: 'Produtos', est: 'produtos', th: {accent: '#d9480f', bg: '#fffdf5', fg: '#2a2a2a', head: 'Fraunces', body: 'Manrope', rad: 22, hw: 500, hero: 'split', ly: {w:'wide',sh:'center',band:'tint',ben:'nums',st:'cards',pr:'cards',dor:'cards',faq:'cols'}}},
  {id: 'lar', nome: 'Lar', nicho: 'Imobiliária', tipo: 'Produtos', est: 'produtos', th: {accent: '#b45309', bg: '#ffffff', fg: '#14213d', head: 'Manrope', body: 'Manrope', rad: 8, hw: 800, hero: 'split', ly: {w:'wide',sh:'left',band:'none',ben:'cards',st:'line',pr:'cards',dor:'cards',faq:'cols'}}},
  {id: 'estudio', nome: 'Estúdio', nicho: 'Agência', tipo: 'Portfólio', est: 'autoridade', th: {accent: '#e03e1a', bg: '#f1f1ee', fg: '#111111', head: 'Sora', body: 'Manrope', rad: 0, hw: 700, hero: 'big', ly: {w:'wide',sh:'left',band:'line',ben:'rows',st:'line',pr:'quote',dor:'list',faq:'acc'}}},
  {id: 'forma', nome: 'Forma', nicho: 'Academia', tipo: 'Serviço local', est: 'servicos', th: {accent: '#ff6a00', bg: '#0e0e10', fg: '#ffffff', dark: true, head: 'Sora', body: 'Manrope', rad: 6, hw: 700, hero: 'big', ly: {w:'wide',sh:'left',band:'alt',ben:'nums',st:'cards',pr:'cards',dor:'cards',faq:'acc'}}},
  {id: 'viva', nome: 'Beleza Viva', nicho: 'Beleza', tipo: 'Serviço local', est: 'servicos', th: {accent: '#c2185b', bg: '#fff5f7', fg: '#3b1f2b', head: 'DM Serif Display', body: 'Manrope', rad: 24, hw: 400, hero: 'split', ly: {w:'narrow',sh:'center',band:'tint',ben:'nums',st:'cards',pr:'quote',dor:'cards',faq:'acc'}}},
  {id: 'obra', nome: 'Obra Certa', nicho: 'Construção', tipo: 'Serviço local', est: 'servicos', th: {accent: '#b45309', bg: '#f4f4f2', fg: '#1d1d1d', head: 'Sora', body: 'Manrope', rad: 2, hw: 700, hero: 'big', ly: {w:'wide',sh:'left',band:'none',ben:'rows',st:'line',pr:'cards',dor:'list',faq:'cols'}}},
  {id: 'casaverde', nome: 'Casa Verde', nicho: 'Jardinagem', tipo: 'Serviço local', est: 'servicos', th: {accent: '#2e7d32', bg: '#f4faf2', fg: '#1c3321', head: 'Manrope', body: 'Manrope', rad: 10, hw: 800, hero: 'split', ly: {w:'normal',sh:'left',band:'tint',ben:'cards',st:'cards',pr:'cards',dor:'list',faq:'acc'}}}
];
const SBT_HERO = {split: 'foto ao lado do texto', center: 'topo centralizado', big: 'título grande'};
const SBG = {tab: 'estudio', q: '', tipo: [], nicho: [], tom: [], sort: 'rel', page: 1, fil: true, more: false, modal: false}, SBG_PER = 12, SBG_CACHE = new Map();
const SBT_SAMPLE = {nome: 'Seu Negócio', cidade: 'Sua cidade', whats: '', email: '', contato: '', quem: 'Quem é o cliente', problemas: ['O problema que o cliente vê no dia a dia'], ocultas: ['como esse problema faz o cliente se sentir'], desejos: 'O resultado que o cliente quer, em uma frase', objecoes: ['Dúvida que trava a compra'], perdem: '', missao: 'Por que isso não deveria acontecer', diferenciais: ['O que você faz melhor'], tempo: '', equipe: '', historia: 'A história do negócio, em poucas linhas.', dep: [{texto: 'Aqui entra um depoimento real e autorizado.', nome: 'Nome do cliente'}], foto: '', logo: '', cor: '', naoUsa: [], tomN: 0, acao: '', direto: 'Falar com a equipe',
  prods: [{nome: 'Serviço um', tipo: 'Serviço', oque: 'Explicação curta do que o cliente recebe.', paraquem: '', como: ['Primeiro passo', 'Segundo passo', 'Terceiro passo'], incluso: ['O que está incluso'], preco: '', prazo: 'Quando o cliente é atendido', diferencial: ['Diferencial um', 'Diferencial dois', 'Diferencial três'], perguntas: ['Como faço para começar?'], objecoes: [], garantia: '', pagamento: '', naoserve: [], problemas: [], acao: '', link: ''}]};
const sbThemeFor = (t, f) => { const th = Object.assign({}, t.th); if (f && f.cor) th.accent = f.cor; return th; };
/* a primeira página do site, com o texto do cliente (ou texto de exemplo), em HTML pronto para a miniatura ou a prévia */
async function sbPageHTML(t, f, bs) {
  const pg = SITE_TPL[t.est].pages[0], l = normalizeLandings([{id: 'prev_' + t.id, name: t.nome, type: 'generico', theme: sbThemeFor(t, f), cta: bs.direct, blocks: pg.blocks.map(lpBlockNew), product: {}}])[0];
  lpMerge(l, sbBlocksFor(l, f, bs, pg.role)); const h = l.blocks.find(b => b.t === 'hero'); if (h && f.foto) h.imgId = f.foto;
  return (await lpHTML(l, {name: f.nome, sites: [], landings: [l], products: []}, {preview: true})).replace(/<script[\s\S]*?<\/script>/g, '');   // miniatura e prévia não rodam scripts
}
function sbFactsNow() { const p = curProject(), f = p ? sbFacts(p) : null; return f && (f.prods.length || f.nome && f.quem || f.problemas.length) ? f : SBT_SAMPLE; }
async function sbThumbFill(root) {
  const f = sbFactsNow(), bs = sbBS(f), sig = f === SBT_SAMPLE ? 'x' : JSON.stringify([f.nome, bs, f.prods.length, f.cor, f.foto]).length + f.nome;
  for (const box of [...root.querySelectorAll('.sbg-th[data-t]')]) {
    const t = SBT.find(x => x.id === box.dataset.t); if (!t) continue; const key = t.id + '|' + sig;
    try { if (!SBG_CACHE.has(key)) SBG_CACHE.set(key, await sbPageHTML(t, f, bs)); } catch (e) { continue; }
    if (!box.isConnected) return; const w = box.clientWidth || 260, fr = document.createElement('iframe'); fr.setAttribute('sandbox', ''); fr.setAttribute('title', 'Prévia do template ' + t.nome); fr.setAttribute('tabindex', '-1'); fr.srcdoc = SBG_CACHE.get(key);
    fr.style.cssText = 'width:1100px;height:' + Math.round(box.clientHeight * 1100 / w) + 'px;transform:scale(' + (w / 1100) + ');transform-origin:0 0;border:0;pointer-events:none;position:absolute;left:0;top:0'; box.appendChild(fr);
  }
}
function sbGFiltered() {
  const q = SBG.q.trim().toLowerCase(); let l = SBT.filter(t => (!q || (t.nome + ' ' + t.nicho + ' ' + t.tipo).toLowerCase().includes(q)) && (!SBG.tipo.length || SBG.tipo.includes(t.tipo)) && (!SBG.nicho.length || SBG.nicho.includes(t.nicho)) && (!SBG.tom.length || SBG.tom.includes(t.th.dark ? 'Fundo escuro' : 'Fundo claro')));
  if (SBG.sort === 'az') l = l.slice().sort((a, b) => a.nome.localeCompare(b.nome, 'pt')); return l;
}
function sbGGrid() {
  const l = sbGFiltered(), pages = Math.max(1, Math.ceil(l.length / SBG_PER)); if (SBG.page > pages) SBG.page = pages; const sl = l.slice((SBG.page - 1) * SBG_PER, SBG.page * SBG_PER);
  return `<div class="muted" style="font-size:12.5px;margin-bottom:8px">${l.length} templates${SBG.q ? ' para “' + esc(SBG.q) + '”' : ''}</div>` +
    (sl.length ? `<div class="sbg-grid">${sl.map(t => `<div class="sbg-card"><div class="sbg-th" data-t="${t.id}"><div class="sbg-ov"><button class="btn sm" onclick="sbPreview('${t.id}')">Prévia</button><button class="btn sm dark" onclick="sbUse('${t.id}')">Usar</button></div></div><div class="sbg-tb"><strong>${esc(t.nome)}</strong><small class="muted">${esc(t.nicho)} · ${esc(t.tipo)}</small><small class="muted">${esc(SITE_TPL[t.est].label.replace('StoryBrand · ', ''))} · ${SBT_HERO[t.th.hero]}</small></div></div>`).join('')}</div>` : '<div class="panel muted" style="text-align:center">Nenhum template encontrado. Tire um filtro ou mude a busca.</div>') +
    (pages > 1 ? `<div class="sbg-pg">${Array.from({length: pages}, (_, i) => `<button class="${SBG.page === i + 1 ? 'on' : ''}" onclick="SBG.page=${i + 1};sbGRender()">${i + 1}</button>`).join('')}</div>` : '');
}
function sbGFilters() {
  const nichos = [...new Set(SBT.map(t => t.nicho))].sort((a, b) => a.localeCompare(b, 'pt')), shown = SBG.more ? nichos : nichos.slice(0, 8);
  const grp = (title, g, vals) => `<div class="sbg-fg"><strong>${title}</strong>${vals.map(v => `<label class="sb-ck"><input type="checkbox"${SBG[g].includes(v) ? ' checked' : ''} onchange="sbGTog('${g}','${esc(v).replace(/'/g, '&#39;')}')">${esc(v)}</label>`).join('')}</div>`;
  return grp('Categorias', 'tipo', ['Serviço local', 'Venda online', 'Produtos', 'Portfólio']) + grp('Nichos', 'nicho', shown) + `<button class="btn sm" onclick="SBG.more=!SBG.more;sbGRender()">${SBG.more ? 'Mostrar menos' : '+ Mostrar mais'}</button>` + grp('Propriedades', 'tom', ['Fundo claro', 'Fundo escuro']);
}
function sbGTog(g, v) { const i = SBG[g].indexOf(v); i < 0 ? SBG[g].push(v) : SBG[g].splice(i, 1); SBG.page = 1; sbGRender(); }
function sbGHTML() {
  const p = curProject(), f = sbFactsNow();
  return `${f === SBT_SAMPLE ? '<div class="sb-note">As miniaturas usam texto de exemplo. Preencha o briefing do projeto para ver o texto do cliente em cada template.</div>' : '<div class="sb-note">As miniaturas já mostram o texto e as cores do briefing de <strong>' + esc(p.name) + '</strong>.</div>'}
    <div class="row-gap" style="justify-content:space-between;flex-wrap:wrap;margin-bottom:12px"><input id="sbgQ" class="sbg-q" placeholder="Buscar por nicho: direito, saúde, restaurante…" value="${esc(SBG.q)}" oninput="SBG.q=this.value;SBG.page=1;sbGRefresh()" aria-label="Buscar template"><label class="muted" style="font-size:13px">Classificar por <select onchange="SBG.sort=this.value;SBG.page=1;sbGRender()"><option value="rel"${SBG.sort === 'rel' ? ' selected' : ''}>Relevante</option><option value="az"${SBG.sort === 'az' ? ' selected' : ''}>Nome (A–Z)</option></select></label></div>
    <div class="sbg-wrap${SBG.fil ? '' : ' nof'}"><aside class="sbg-fil"><button class="btn sm" onclick="SBG.fil=!SBG.fil;sbGRender()">${SBG.fil ? 'Esconder filtros' : 'Mostrar filtros'}</button>${SBG.fil ? sbGFilters() : ''}</aside><div id="sbgGrid" style="min-width:0">${sbGGrid()}</div></div>`;
}
function sbGRefresh() { const g = $('sbgGrid'); if (g) { g.innerHTML = sbGGrid(); sbThumbFill(g); } }
function sbGRender() { if (SBG.modal) { const b = $('modalBox'); if (b && $('sbgRoot')) { $('sbgRoot').innerHTML = sbGHTML(); sbThumbFill($('sbgRoot')); } } else renderTemplatesBank(); }
/* ---------- Meus templates: pacotes que você subiu (kit do Elementor, site em HTML, tema de WordPress) ---------- */
const sbKindName = k => ({elementor: 'Kit do Elementor', html: 'Site em HTML', wordpress: 'Tema de WordPress'}[k] || 'Pacote');
function sbMineHTML() {
  const L = typeof mzThList === 'function' ? mzThList() : [];
  const up = `<div class="panel es-p rf-drop"><div><strong>Suba os seus templates</strong><div class="es-note">ZIP do Envato (kit do Elementor, site em HTML ou tema de WordPress), JSON do Elementor ou um arquivo HTML. Eles ficam salvos neste navegador, só para você.</div></div><button class="btn pri" onclick="mzThOpen()">Subir template</button></div>`;
  if (!L.length) return up + '<div class="panel es-empty">Nenhum template seu ainda. Suba os pacotes que você comprou: cada página vira uma página da Mesa de páginas e cada bloco vira uma seção reutilizável. Use só pacotes com licença.</div>';
  return up + `<div class="sbg-grid">${L.map(t => { const th = (t.pages.find(p => p.th) || {}).th, cols = Object.values((t.ds && t.ds.colors) || {}).slice(0, 5);
    return `<div class="sbg-card"><div class="sbg-th sbg-mine">${th ? `<img data-lib="${th}" alt="" style="width:100%;height:100%;object-fit:cover;object-position:top">` : `<div class="sbg-ph"><b>${esc(t.name.slice(0, 40))}</b><span>${cols.map(c => `<i style="background:${c}"></i>`).join('')}</span></div>`}</div><div class="sbg-tb"><strong>${esc(t.name.slice(0, 48))}</strong><small class="muted">${sbKindName(t.kind)} · ${t.pages.length} página(s) · ${t.sections.length} seção(ões)</small><div class="row-gap" style="margin-top:6px;flex-wrap:wrap"><button class="btn sm dark" onclick="sbKitPages('${t.id}')">Usar na Mesa</button>${cols.length || (t.ds && t.ds.fonts && t.ds.fonts.heading) ? `<button class="btn sm" onclick="sbKitApply('${t.id}')">Cores e fontes</button>` : ''}<button class="btn sm" onclick="mzThDelete('${t.id}').then(()=>renderTemplatesBank())">Excluir</button></div></div></div>`; }).join('')}</div>`;
}
function sbKitPages(id) {
  const t = mzThList().find(x => x.id === id); if (!t) return;
  showModal(esc(t.name.slice(0, 50)), `<p class="muted" style="font-size:12.5px;margin-top:0">Escolha a página. Ela abre na Mesa de páginas, onde você edita, troca o texto pelo do cliente e exporta em HTML ou Kit do Elementor (com animação).</p><div class="sb-kitp">${t.pages.map(p => `<button class="sb-kp" onclick="sbKitUse('${t.id}','${p.id}')">${p.th ? `<img data-lib="${p.th}" alt="">` : '<span class="sb-kpn"></span>'}<b>${esc(p.name.slice(0, 40))}</b></button>`).join('')}</div><div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button></div>`);
  $('modalBox').classList.add('wide'); if (typeof libFill === 'function') libFill($('modalBox'));
}
async function sbKitUse(th, pid) { if (!curProject()) { toast('Crie um projeto primeiro.'); return; } closeModal(); if (!MZ.open) { mzOpen(); await new Promise(r => setTimeout(r, 700)); } await mzThUsePage(th, pid); }
async function sbKitApply(th) { if (!curProject()) { toast('Crie um projeto primeiro.'); return; } if (!MZ.open) { mzOpen(); await new Promise(r => setTimeout(r, 700)); } await mzThApply(th); }
/* depois de importar, a galeria atualiza sozinha */
(function () { const imp = mzThImport; mzThImport = async function () { const r = await imp.apply(this, arguments); if (ui.page === 'templates') renderTemplatesBank(); return r; }; })();
function renderTemplatesBank() {
  const root = $('templatesRoot'); if (!root) return; SBG.modal = false;
  const nm = typeof mzThList === 'function' ? mzThList().length : 0;
  root.innerHTML = esHead('Banco de templates', 'Sua base de modelos. Os do estúdio seguem a estrutura StoryBrand (o cliente é o herói e a empresa é o guia). Os seus vêm dos pacotes que você subiu.') + `<div class="sb-tabs" role="tablist"><button class="chip${SBG.tab === 'estudio' ? ' on' : ''}" onclick="SBG.tab='estudio';renderTemplatesBank()">Modelos do estúdio (${SBT.length})</button><button class="chip${SBG.tab === 'meus' ? ' on' : ''}" onclick="SBG.tab='meus';renderTemplatesBank()">Meus templates (${nm})</button></div><div id="sbgRoot">${SBG.tab === 'meus' ? sbMineHTML() : sbGHTML()}</div>`; if (SBG.tab === 'meus') { if (typeof libFill === 'function') libFill(root); } else sbThumbFill(root);
}
function sbOpenGallery() { SBG.modal = true; showModal('Escolha o template do site', `<div id="sbgRoot">${sbGHTML()}</div>`); $('modalBox').classList.add('wide'); sbThumbFill($('sbgRoot')); }
async function sbPreview(tid) {
  const t = SBT.find(x => x.id === tid), f = sbFactsNow(), bs = sbBS(f); SBG.modal = false; showModal('Prévia · ' + t.nome, '<div class="muted">Montando a prévia…</div>'); $('modalBox').classList.add('wide');
  try { const h = await sbPageHTML(t, f, bs); $('modalBox').innerHTML = `<div class="row-gap" style="justify-content:space-between;margin-bottom:8px"><h2 style="margin:0">Prévia · ${esc(t.nome)}</h2><div class="row-gap"><button class="btn dark" onclick="sbUse('${t.id}')">Usar este template</button><button class="btn" onclick="closeModal()">Fechar</button></div></div><iframe sandbox="" title="Prévia" style="width:100%;height:70vh;border:1px solid var(--line,#ddd);border-radius:10px" srcdoc="${esc(h)}"></iframe>`; } catch (e) { toast(e.message); }
}
function sbUse(tid) {
  const p = curProject(); if (!p) { toast('Crie um projeto primeiro (um por cliente).'); return; } const t = SBT.find(x => x.id === tid), f = sbFacts(p), ready = typeof aiReady === 'function' && aiReady();
  showModal('Criar site com o template ' + t.nome, `<div class="field"><label>Nome do site</label><input id="sbName" value="${esc(f.nome || p.name)}"></div>
    <p class="muted" style="font-size:13px">Estrutura: <strong>${esc(SITE_TPL[t.est].label)}</strong> (${SITE_TPL[t.est].pages.map(x => esc(x.label)).join(', ')}). O BrandScript e o texto das páginas saem do briefing de <strong>${esc(p.name)}</strong>; o que faltar fica como [CONFIRMAR].</p>
    <label class="sb-ck" style="margin:8px 0"><input type="checkbox" id="sbAI"${ready ? ' checked' : ' disabled'}> Reescrever as páginas com IA (a partir do BrandScript)${ready ? '' : ' · ligue a IA em Configurações'}</label>
    <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="sbCreateSite('${t.id}')">Criar site</button></div>`);
}
async function sbCreateSite(tid) {
  const p = curProject(), t = SBT.find(x => x.id === tid), S = SITE_TPL[t.est], ai = !!($('sbAI') && $('sbAI').checked), nm = ($('sbName') && $('sbName').value.trim()) || '';
  try { if (Object.keys(sbAns(p)).length) bfApply(p, bfMigrate(sbAns(p))); } catch (e) { /* o briefing já está guardado; só a cópia para Produtos e Marca falhou */ }
  const f = sbFacts(p), bs = sbBS(f), name = nm || f.nome || p.name || 'Meu site', pr = (p.products || [])[0], theme = Object.assign({}, lpTheme(p), sbThemeFor(t, f));
  const site = normalizeSites([{id: uid('st'), name, tpl: t.est, productId: pr ? pr.id : '', brand: name, headerCta: f.direto, style: t.id, brief: bfStore(p).text || '', footer: f.cidade ? 'Atendemos em ' + f.cidade + '.' : '', contact: [f.whats && 'WhatsApp: ' + f.whats, f.email].filter(Boolean).join('\n'), bs}])[0];
  p.sites.push(site);
  S.pages.forEach(pg => {
    const l = normalizeLandings([{id: uid('lp'), name: name + ' — ' + pg.label, siteId: site.id, slug: pg.slug, navLabel: pg.label, type: 'generico', productId: pr ? pr.id : '', product: pr ? {nome: pr.name, preco: pr.price, publico: pr.audience, checkout: pr.checkout} : {}, theme, cta: bs.direct, whatsapp: f.whats, blocks: pg.blocks.map(lpBlockNew), status: 'Rascunho'}])[0];
    l.siteRole = pg.role; lpMerge(l, sbBlocksFor(l, f, bs, pg.role)); const h = l.blocks.find(b => b.t === 'hero'); if (h && f.foto) h.imgId = f.foto; p.landings.push(l);
  });
  persist(); closeModal(); lpUI.main = 'sites'; lpUI.site = site.id; ES.site = site.id; ES.page = ''; ES.sel = ''; go('dev');
  toast(`Site criado com o template ${t.nome}. Revise o que estiver em [CONFIRMAR].`);
  if (ai && typeof siteBSText === 'function' && siteBSText(site)) { try { await siteGenAll(); } catch (e) { toast(e.message); } if (ui.page === 'dev') renderDev(); }
}
