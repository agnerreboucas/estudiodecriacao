/* ===== Seções prontas do editor visual: topo, benefícios, produto, preço, depoimentos, passos, FAQ, chamadas etc.
   Cada modelo se monta com os dados do projeto (produto, preço, benefícios, características, provas) e usa as cores e fontes da página
   (que podem ser puxadas da marca do projeto). Onde falta fato real fica [CONFIRMAR]; nada é inventado. ===== */
const SEC_GROUPS = [['topo', 'Topo (hero)'], ['dor', 'Problema e público'], ['beneficios', 'Benefícios'], ['produto', 'Produto'], ['preco', 'Preço e oferta'], ['depoimentos', 'Depoimentos'], ['prova', 'Autoridade e números'], ['passos', 'Como funciona'], ['faq', 'Perguntas'], ['cta', 'Chamada final'], ['captura', 'Captura de lead']];
function secCtx(l, p) {
  const x = (p.products || []).find(y => y.id === l.productId) || {}, pk = (arr, sel) => (l.pick && l.pick.all !== false) || !x.id ? (arr || []) : (arr || []).filter((_, i) => (sel || []).includes(i));
  const fill = (arr, n, lab) => { const a = (arr || []).filter(Boolean).slice(0, n); while (a.length < Math.min(n, 3)) a.push(`[CONFIRMAR: ${lab} ${a.length + 1}]`); return a; };
  const nm = (l.product && l.product.nome) || x.name || p.name || 'Seu produto';
  return {nm, price: (l.product && l.product.preco) || x.price || '[CONFIRMAR: preço]', sum: x.summary || '[CONFIRMAR: descrição curta do produto]', aud: (l.product && l.product.publico) || x.audience || '[CONFIRMAR: para quem é]', cta: l.cta || 'Quero começar', ben: fill(pk(x.benefits, l.pick && l.pick.b), 6, 'benefício'), fea: fill(pk(x.features, l.pick && l.pick.f), 6, 'característica'), pro: x.proofs || [], obj: x.objections || [], brand: p.name};
}
const secW = {
  H: (text, tag, al, o) => bxW('heading', Object.assign({text, tag: tag || 'h2', al: al ? {d: al} : {}}, o || {})),
  T: (text, o) => bxW('text', Object.assign({text, muted: true}, o || {})),
  B: (text, o) => bxW('button', Object.assign({text}, o || {})),
  L: (items, o) => bxW('list', Object.assign({items: items.map(t => ({t, d: ''}))}, o || {})),
  F: (title, text, emoji) => bxW('feature', {title, text, emoji: emoji || ''}),
  Q: items => bxW('quote', {items}),
  FQ: items => bxW('faq', {items}),
  IMG: (o) => bxW('image', Object.assign({alt: ''}, o || {})),
  K: t => bxW('text', {text: '**' + String(t).toUpperCase() + '**', size: {d: 13}}),
  SP: h => bxW('spacer', {h: {d: h || 16}})
};
const secCols = (spans, arrs, o) => arrs.map((w, i) => bxCol(spans[i], w.filter(Boolean), Object.assign({span: {d: spans[i], t: spans[i] <= 4 && spans.length > 3 ? 6 : 12, m: 12}}, o || {})));
const secS = (name, cols, o) => Object.assign(bxSec('1', {name}), {cols}, o || {});
const secQuotes = (c, n) => Array.from({length: n}, (_, i) => c.pro[i] ? {t: c.pro[i], d: '[CONFIRMAR: nome de quem deu o depoimento]'} : {t: '[CONFIRMAR: depoimento real e autorizado]', d: '[CONFIRMAR: nome]'});
const SECTIONS = [
  {k: 'hero1', g: 'topo', n: 'Topo centralizado', d: 'Chamada, subtítulo e botão no centro.', b: (c, th) => secS('Topo', secCols([12], [[secW.K(c.brand), secW.H(c.nm, 'h1', 'center'), secW.T(c.sum, {al: {d: 'center'}, size: {d: 20, m: 17}}), secW.B(c.cta, {}), secW.T('[CONFIRMAR: frase de apoio, ex.: garantia ou acesso]', {al: {d: 'center'}, size: {d: 13}})]]))},
  {k: 'hero2', g: 'topo', n: 'Topo com imagem à direita', d: 'Texto à esquerda, imagem do produto à direita (empilha no celular).', b: c => secS('Topo', secCols([7, 5], [[secW.K(c.brand), secW.H(c.nm, 'h1'), secW.T(c.sum, {size: {d: 20, m: 17}}), secW.B(c.cta)], [secW.IMG({alt: c.nm})]]).map(x => Object.assign(x, {v: 'center'})))},
  {k: 'hero3', g: 'topo', n: 'Topo com vídeo', d: 'Título e vídeo de apresentação (YouTube, Vimeo ou mp4).', b: c => secS('Topo', secCols([12], [[secW.H(c.nm, 'h1', 'center'), secW.T(c.sum, {al: {d: 'center'}}), bxW('video', {}), secW.B(c.cta)]]))},
  {k: 'hero4', g: 'topo', n: 'Topo escuro', d: 'Fundo na cor de texto da marca, para contraste.', b: (c, th) => secS('Topo', secCols([12], [[secW.K(c.brand), secW.H(c.nm, 'h1', 'center'), secW.T(c.sum, {al: {d: 'center'}, size: {d: 20, m: 17}}), secW.B(c.cta)]]), {bg: th.fg})},
  {k: 'hero5', g: 'topo', n: 'Topo com formulário', d: 'Promessa à esquerda e formulário de cadastro à direita.', b: c => secS('Topo', secCols([7, 5], [[secW.K(c.brand), secW.H(c.nm, 'h1'), secW.T(c.sum, {size: {d: 19}}), secW.L(c.ben.slice(0, 3))], [bxW('form', {title: 'Receba agora', text: 'Preencha para continuar.'})]]).map(x => Object.assign(x, {v: 'center'})))},
  {k: 'dor1', g: 'dor', n: 'O problema (lista)', d: 'Título e lista do que o cliente vive hoje.', b: c => secS('Problema', secCols([12], [[secW.H('Você se identifica?', 'h2', 'center'), secW.L(['[CONFIRMAR: dor 1 do cliente]', '[CONFIRMAR: dor 2]', '[CONFIRMAR: dor 3]'], {icon: 'x'})]]), {alt: true})},
  {k: 'dor2', g: 'dor', n: 'É / não é para você', d: 'Duas colunas: quem deve e quem não deve comprar.', b: c => secS('Para quem é', secCols([6, 6], [[secW.H('É para você se…', 'h3'), secW.L([c.aud, '[CONFIRMAR: situação 2]'])], [secW.H('Não é para você se…', 'h3'), secW.L(['[CONFIRMAR: quem não se encaixa]'], {icon: 'x'})]]))},
  {k: 'dor3', g: 'dor', n: 'Custo de não agir', d: 'Texto curto sobre o que acontece se nada mudar.', b: () => secS('Custo de não agir', secCols([12], [[secW.H('E se nada mudar?', 'h2', 'center'), secW.T('[CONFIRMAR: consequência real de continuar como está, sem exagero]', {al: {d: 'center'}, size: {d: 19}})]]), {alt: true})},
  {k: 'ben1', g: 'beneficios', n: '3 benefícios em cartões', d: 'Três colunas com título e descrição.', b: c => secS('Benefícios', secCols([4, 4, 4], c.ben.slice(0, 3).map((t, i) => [secW.F(t, '', ['①', '②', '③'][i])])), {})},
  {k: 'ben2', g: 'beneficios', n: 'Benefícios em lista', d: 'Título e texto à esquerda, lista com marcadores à direita.', b: c => secS('Benefícios', secCols([5, 7], [[secW.H('O que você ganha', 'h2'), secW.T(c.sum)], [secW.L(c.ben)]]).map(x => Object.assign(x, {v: 'center'})), {alt: true})},
  {k: 'ben3', g: 'beneficios', n: '4 diferenciais', d: 'Quatro colunas curtas.', b: c => secS('Diferenciais', secCols([3, 3, 3, 3], [0, 1, 2, 3].map(i => [secW.F(c.ben[i] || '[CONFIRMAR: diferencial]', '', '✔')])))},
  {k: 'prod1', g: 'produto', n: 'Produto: imagem + detalhes', d: 'Imagem à esquerda; nome, resumo, características e botão à direita.', b: c => secS('Produto', secCols([5, 7], [[secW.IMG({alt: c.nm})], [secW.H(c.nm, 'h2'), secW.T(c.sum), secW.L(c.fea.slice(0, 5)), secW.B(c.cta)]]).map(x => Object.assign(x, {v: 'center'})))},
  {k: 'prod2', g: 'produto', n: 'Características em grade (6)', d: 'Seis itens em 3 colunas.', b: c => secS('Características', secCols([4, 4, 4], [0, 1, 2].map(i => [secW.F(c.fea[i] || '[CONFIRMAR: característica]', '', '◆'), secW.F(c.fea[i + 3] || '[CONFIRMAR: característica]', '', '◆')])), {alt: true})},
  {k: 'prod3', g: 'produto', n: 'O que está incluso', d: 'Lista do que vem no produto e bônus.', b: c => secS('Incluso', secCols([6, 6], [[secW.H('O que está incluso', 'h2'), secW.L(c.fea)], [secW.H('Bônus', 'h3'), secW.L(['[CONFIRMAR: bônus, se houver]'])]]))},
  {k: 'preco1', g: 'preco', n: 'Oferta única', d: 'Preço em destaque, lista do que inclui e botão.', b: (c, th) => secS('Oferta', secCols([12], [[secW.H('Comece hoje', 'h2', 'center'), secW.H(c.price, 'h2', 'center', {color: th.accent}), secW.L(c.fea.slice(0, 4)), secW.B(c.cta, {full: true}), secW.T('[CONFIRMAR: formas de pagamento / garantia]', {al: {d: 'center'}, size: {d: 13}})]]), {alt: true})},
  {k: 'preco2', g: 'preco', n: '3 planos', d: 'Três colunas para planos ou pacotes (preencha os valores reais).', b: c => secS('Planos', secCols([4, 4, 4], ['Básico', 'Completo', 'Premium'].map(n => [secW.F('Plano ' + n, '[CONFIRMAR: preço e o que inclui]', ''), secW.B(c.cta, {full: true, style: n === 'Completo' ? 'solid' : 'outline'})])))},
  {k: 'preco3', g: 'preco', n: 'Oferta + garantia', d: 'Oferta à esquerda e cartão de garantia à direita.', b: (c, th) => secS('Oferta', secCols([7, 5], [[secW.H(c.nm, 'h2'), secW.H(c.price, 'h2', '', {color: th.accent}), secW.L(c.fea.slice(0, 4)), secW.B(c.cta)], [secW.F('Garantia', '[CONFIRMAR: prazo e condições reais da garantia]', '🛡')]]).map(x => Object.assign(x, {v: 'center'})))},
  {k: 'preco4', g: 'preco', n: 'Oferta com contagem regressiva', d: 'Prazo da oferta, preço e botão.', b: (c, th) => secS('Oferta', secCols([12], [[secW.H('A oferta termina em', 'h2', 'center'), bxW('countdown', {}), secW.H(c.price, 'h2', 'center', {color: th.accent}), secW.B(c.cta)]]), {bg: th.fg})},
  {k: 'dep1', g: 'depoimentos', n: '3 depoimentos', d: 'Cartões lado a lado (vêm das provas do produto).', b: c => secS('Depoimentos', secCols([12], [[secW.H('Quem já usou', 'h2', 'center'), secW.Q(secQuotes(c, 3))]]), {alt: true})},
  {k: 'dep2', g: 'depoimentos', n: 'Depoimento em destaque', d: 'Uma frase grande centralizada.', b: c => secS('Depoimento', secCols([12], [[secW.H('“' + secQuotes(c, 1)[0].t + '”', 'h2', 'center'), secW.T(secQuotes(c, 1)[0].d, {al: {d: 'center'}})]]))},
  {k: 'dep3', g: 'depoimentos', n: 'Depoimento + imagem', d: 'Foto da pessoa à esquerda, depoimento à direita.', b: c => secS('Depoimento', secCols([4, 8], [[secW.IMG({alt: 'Foto do cliente', rad: 999})], [secW.Q(secQuotes(c, 1))]]).map(x => Object.assign(x, {v: 'center'})), {alt: true})},
  {k: 'prova1', g: 'prova', n: 'Números', d: 'Três números de resultado (use só dados reais).', b: c => secS('Números', secCols([4, 4, 4], [0, 1, 2].map(() => [secW.F('[CONFIRMAR: número real]', '[CONFIRMAR: o que ele mede]', '')])))},
  {k: 'prova2', g: 'prova', n: 'Autoridade (quem ensina)', d: 'Foto e apresentação, com empatia e credenciais reais.', b: c => secS('Autoridade', secCols([4, 8], [[secW.IMG({alt: 'Foto', rad: 20})], [secW.H('Quem está por trás', 'h2'), secW.T('[CONFIRMAR: mostre que entende o problema do cliente]'), secW.L(['[CONFIRMAR: credencial real 1]', '[CONFIRMAR: credencial real 2]'])]]).map(x => Object.assign(x, {v: 'center'})), {alt: true})},
  {k: 'passos1', g: 'passos', n: '3 passos', d: 'Plano em três colunas numeradas.', b: () => secS('Como funciona', secCols([4, 4, 4], [1, 2, 3].map(n => [secW.F('Passo ' + n, '[CONFIRMAR: o que acontece neste passo]', ['①', '②', '③'][n - 1])])))},
  {k: 'passos2', g: 'passos', n: 'Passos em lista', d: 'Título e passos numerados em lista.', b: () => secS('Como funciona', secCols([5, 7], [[secW.H('Como funciona', 'h2'), secW.T('[CONFIRMAR: promessa do processo]')], [secW.L(['1. [CONFIRMAR: passo 1]', '2. [CONFIRMAR: passo 2]', '3. [CONFIRMAR: passo 3]'], {icon: 'dot'})]]), {alt: true})},
  {k: 'faq1', g: 'faq', n: 'Perguntas (sanfona)', d: 'As objeções cadastradas viram perguntas.', b: c => secS('Perguntas', secCols([12], [[secW.H('Perguntas frequentes', 'h2', 'center'), secW.FQ((c.obj.length ? c.obj : ['[CONFIRMAR: pergunta frequente]']).slice(0, 6).map(q => ({t: q, d: '[CONFIRMAR: resposta]'})))]]))},
  {k: 'faq2', g: 'faq', n: 'Perguntas + chamada', d: 'Perguntas à direita e um cartão de contato à esquerda.', b: c => secS('Perguntas', secCols([4, 8], [[secW.H('Ainda com dúvida?', 'h2'), secW.T('[CONFIRMAR: canal de atendimento]'), secW.B('Falar no WhatsApp', {link: 'whatsapp', style: 'outline'})], [secW.FQ((c.obj.length ? c.obj : ['[CONFIRMAR: pergunta frequente]']).slice(0, 6).map(q => ({t: q, d: '[CONFIRMAR: resposta]'})))]]), {alt: true})},
  {k: 'cta1', g: 'cta', n: 'Chamada final', d: 'Título, frase e botão.', b: c => secS('Chamada final', secCols([12], [[secW.H('Pronto para começar?', 'h2', 'center'), secW.T(c.ben[0], {al: {d: 'center'}}), secW.B(c.cta)]]), {alt: true})},
  {k: 'cta2', g: 'cta', n: 'Chamada final escura', d: 'Fundo escuro de alto contraste.', b: (c, th) => secS('Chamada final', secCols([12], [[secW.H('Pronto para começar?', 'h2', 'center'), secW.T(c.ben[0], {al: {d: 'center'}}), secW.B(c.cta)]]), {bg: th.fg})},
  {k: 'cta3', g: 'cta', n: 'Chamada na cor da marca', d: 'Fundo na cor de destaque.', b: (c, th) => secS('Chamada final', secCols([12], [[secW.H('Dê o primeiro passo hoje', 'h2', 'center'), secW.B(c.cta)]]), {bg: th.accent})},
  {k: 'cap1', g: 'captura', n: 'Formulário centralizado', d: 'Título, texto e formulário com consentimento (LGPD).', b: () => secS('Cadastro', secCols([12], [[bxW('form', {title: 'Receba no seu WhatsApp', text: '[CONFIRMAR: o que a pessoa recebe ao enviar]'})]]), {alt: true})},
  {k: 'cap2', g: 'captura', n: 'Isca digital (imagem + form)', d: 'Capa do material à esquerda e formulário à direita.', b: c => secS('Isca', secCols([5, 7], [[secW.IMG({alt: 'Capa do material'})], [secW.H('Baixe grátis', 'h2'), secW.T('[CONFIRMAR: o que tem no material]'), bxW('form', {title: '', text: ''})]]).map(x => Object.assign(x, {v: 'center'})))}
];
const secBuild = (k, l, p, th) => { const d = SECTIONS.find(x => x.k === k); if (!d) return null; const s = d.b(secCtx(l, p), th || l.theme); return normalizeVis({sections: [s]}).sections[0]; };

/* ---------- galeria (editor visual) ---------- */
const secUI = {g: 'topo', brand: true};
function secGallery() {
  const l = lpCur(); if (!l) return;
  showModal('Seções prontas', `<small class="muted block" style="margin-bottom:6px">Escolha uma seção e ela entra na página já com o nome, o preço, os benefícios e as características do produto do projeto. Onde faltar um fato real, fica <b>[CONFIRMAR]</b>. Depois é só editar no editor visual.</small>
  <label class="ins inl" style="margin-bottom:8px"><input type="checkbox" id="secBrand" ${secUI.brand ? 'checked' : ''} onchange="secUI.brand=this.checked;secThumbs()"> usar as cores e fontes da marca do projeto</label>
  <div class="row-gap" style="flex-wrap:wrap;margin-bottom:8px">${SEC_GROUPS.map(([k, n]) => `<button class="btn sm ${secUI.g === k ? 'dark' : ''}" onclick="secUI.g='${k}';secGallery()">${n}</button>`).join('')}</div>
  <div class="sec-grid" id="secGrid">${secUI.g === 'importados' ? tplGridHTML() : SECTIONS.filter(s => s.g === secUI.g).map(s => `<div class="sec-card"><div class="sec-th" id="secTh_${s.k}"><small class="muted">carregando…</small></div><b>${esc(s.n)}</b><small class="muted">${esc(s.d)}</small><button class="btn sm dark" onclick="secInsert('${s.k}')">＋ Usar esta seção</button></div>`).join('')}</div>`);
  document.getElementById('modalBox').classList.add('wide'); if (secUI.g === 'importados') tplFillThumbs(document.getElementById('secGrid')); else secThumbs();
}
async function secThumbs() {
  const l = lpCur(), p = curProject(), th = secUI.brand ? Object.assign({}, l.theme, lpTheme(p)) : l.theme;
  for (const s of SECTIONS.filter(x => x.g === secUI.g)) {
    const box = document.getElementById('secTh_' + s.k); if (!box) continue;
    try { const sec = secBuild(s.k, l, p, th), fake = Object.assign({}, l, {vis: {sections: [sec]}, blocks: [], siteId: '', theme: th}), h = await lpHTML(fake, p, {preview: true}); box.innerHTML = `<iframe sandbox="" tabindex="-1" srcdoc="${esc(h)}"></iframe>`; } catch (e) { box.innerHTML = '<small class="muted">sem prévia</small>'; }
  }
}
function secInsert(k) {
  const l = lpCur(), p = curProject(); if (!l.vis) return;
  if (secUI.brand) { const t = lpTheme(p); if (t && t.accent) Object.assign(l.theme, t); }
  const sec = secBuild(k, l, p); if (!sec) return;
  closeModal(); bxMut(() => { const V = l.vis, f = bxFind(bxUI.sel), at = f ? V.sections.indexOf(f.sec) + 1 : V.sections.length; V.sections.splice(at, 0, sec); bxUI.sel = sec.id; }); toast('Seção adicionada.' + (SECTIONS.find(x => x.k === k) && JSON.stringify(sec).includes('[CONFIRMAR') ? ' Complete os trechos em [CONFIRMAR].' : ''));
}
function secStart() { const l = lpCur(); if (!l.vis) { l.vis = {sections: []}; bxUI.undo = []; bxUI.redo = []; bxUI.sel = ''; l.blocks.forEach(b => { b.on = b.on; }); persist(); } lpUI.tab = 'editor'; renderLandings(); secGallery(); }
