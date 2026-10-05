/* ===== Menu por categorias (recolher categorias e menu) e página "Mapa do projeto": o fluxo de trabalho do começo ao fim, clicável ===== */
/* Fluxo de trabalho real: cliente → pré-projeto → anúncios → site/landing → mostrar ao cliente → resultados e vendas.
   Status de cada item: ok = pronto, part = parcial, soon = ainda não existe (aparece sem link). */
const FLOW = [
  {n: '1', t: 'Cliente e pré-projeto', c: '#3b3b46', d: 'O cliente entra em contato, você agenda a reunião, entende a necessidade e monta o pré-projeto.', items: [
    [null, 'Contato e reunião', 'Primeiro contato e agenda da reunião. Entra junto com o CRM.', 'soon'],
    ['projects', 'Projetos', 'Um projeto por cliente. A IA lê as respostas e gera o pré-projeto completo: ICPs, produtos e serviços, linha editorial.', 'ok'],
    ['projects', 'Briefing do cliente', 'Formulário que o cliente preenche por link (empresa, público, produtos e serviços). As respostas viram a base do pré-projeto.', 'ok'],
    ['matrix', 'Matriz de Criação', 'ICPs com dores, dúvidas, desejos e urgências ocultas, cruzados com os serviços. Gera a matriz de conteúdo.', 'ok'],
    ['brand', 'Brand Brain', 'Marca: cores, fontes, tom e logo. Tem logo, suba aqui; não tem, crie no Estúdio de Design (Logo Lab).', 'ok'],
    ['inspiration', 'Inspiração', 'Referências e concorrentes.', 'ok']]},
  {n: '2', t: 'Anúncios', c: '#e4572e', d: 'Muitos ângulos por produto, cada um falando com uma dor ou dúvida do ICP.', items: [
    ['editorial', 'Agente Editorial', 'Da dor ao ângulo, à headline, ao texto e ao roteiro.', 'ok'],
    ['design', 'Estúdio de Design', 'Os criativos dos anúncios, posts e stories, com editor.', 'ok'],
    ['videoLab', 'Video Lab', 'Roteiros, storyboard e narração de vídeos.', 'part'],
    ['campaigns', 'Campanhas', 'Cada campanha tem N peças em 3 medidas do Meta (feed, vertical, horizontal), bancos de variações e plano de teste.', 'ok'],
    [null, 'Subir no Meta, Google e TikTok', 'Hoje você sobe nas plataformas; o envio direto ainda não existe.', 'soon']]},
  {n: '3', t: 'Site e landing page', c: '#2f6fcf', d: 'Para onde o anúncio leva. Sem site, cria o site; com site, uma landing page por produto. Ou vai direto ao WhatsApp.', items: [
    ['landings', 'Sites e landing pages', 'Sites, landing pages por produto, templates importados, formulário, WhatsApp e tema do WordPress (Elementor).', 'ok']]},
  {n: '4', t: 'Conteúdo orgânico', c: '#2e7d4f', d: 'Posts que reforçam a autoridade do cliente nas redes e no blog.', items: [
    ['carrosseis', 'Carrosséis', 'De 3 a 20 slides, com legenda.', 'ok'],
    ['feed', 'Planejador de feed', 'Posts simples, stories, vídeos e grids.', 'ok'],
    ['editora', 'Editora (e-books)', 'E-books e materiais ricos. Artigos saem do Agente Editorial.', 'part'],
    [null, 'Blog do cliente', 'Publicar os artigos direto no blog.', 'soon']]},
  {n: '5', t: 'Mostrar ao cliente', c: '#7c4dbd', d: 'Aprovar, publicar e mostrar os anúncios que estão no ar.', items: [
    ['approval', 'Aprovação', 'Fila de revisão das peças.', 'ok'],
    ['publishingHub', 'Publicação', 'Calendário, legenda e envio por rede.', 'part'],
    [null, 'Portal do cliente', 'Área para o cliente ver o projeto, o cronograma, as peças e os anúncios no ar, e aprovar.', 'soon']]},
  {n: '6', t: 'Resultados e vendas', c: '#c9952a', d: 'Alcance, cliques, de onde vêm e quem interage. Depois, o CRM.', items: [
    ['analyticsHub', 'Performance', 'Alcance, cliques, leads, origem e público. Importa do Meta Ads.', 'part'],
    [null, 'Dashboard para o cliente', 'O que hoje fica no Looker Studio, dentro do Studio e para compartilhar.', 'soon'],
    [null, 'CRM de vendas', 'Conversa → CRM → vendas fechadas por campanha.', 'soon']]}
];
const FLOW_SIDE = [
  {t: 'Acervo (usado em todas as etapas)', c: '#2e7d4f', items: [['biblioteca', 'Imagens', 'Fotos geradas, enviadas e do produto.', 'ok'], ['library', 'Peças criadas', 'Tudo o que já foi feito neste projeto.', 'ok']]},
  {t: 'Ajustes', c: '#7c4dbd', items: [['settings', 'Configurações', 'Chaves das APIs, conexões e dados da conta.', 'ok']]}
];
const FLOW_ST = {ok: ['pronto', '#2e7d4f'], part: ['parcial', '#c9952a'], soon: ['em breve', '#888']};
function renderFlow() {
  const r = $('flowRoot'); if (!r) return; const p = typeof curProject === 'function' ? curProject() : null, has = !!p, br = has && p.brand && (p.brand.name || p.brand.colors && p.brand.colors.length);
  const box = (c, [pg, t, d, st]) => { const [lb, col] = FLOW_ST[st || 'ok'], inner = `<b>${esc(t)} <em class="fl-st" style="--s:${col}">${lb}</em></b><small>${esc(d)}</small>`; return pg ? `<button class="fl-box" style="--c:${c}" onclick="go('${pg}')">${inner}</button>` : `<div class="fl-box soon" style="--c:${c}">${inner}</div>`; };
  const chips = ['Contato', 'Reunião', 'Pré-projeto', 'Anúncios', 'Site ou landing', 'Mostrar ao cliente', 'Resultados', 'CRM e vendas'];
  r.innerHTML = `<div class="fl-wrap"><div class="page-head"><div><h1>Mapa do projeto</h1><p>O seu fluxo de trabalho, do primeiro contato do cliente até as vendas. Cada caixa abre a ferramenta. O menu da esquerda segue a mesma ordem.</p></div></div>
  <div class="fl-line">${chips.map((c, i) => `${i ? '<span>→</span>' : ''}<b>${c}</b>`).join('')}</div>
  <div class="fl-steps"><small>Por onde começar:</small><button class="fl-step ${has ? 'done' : ''}" onclick="go('projects')"><b>1</b> Criar o projeto${has ? ' ✓' : ''}</button><span>→</span><button class="fl-step ${br ? 'done' : ''}" onclick="go('brand')"><b>2</b> Preencher a marca${br ? ' ✓' : ''}</button><span>→</span><button class="fl-step" onclick="go('matrix')"><b>3</b> Entender o cliente dele</button><span>→</span><button class="fl-step" onclick="go('editorial')"><b>4</b> Criar os anúncios</button></div>
  <div class="fl-grid">${FLOW.map(s => `<div class="fl-col" style="--c:${s.c}"><h3><span>${s.n}</span>${esc(s.t)}</h3><p>${esc(s.d)}</p>${s.items.map(it => box(s.c, it)).join('')}</div>`).join('')}</div>
  <div class="fl-loop"><b>↺ O ciclo:</b> o que você vê em <b>Resultados</b> (quais anúncios e públicos trazem cliente) volta para a <b>Matriz de Criação</b> e gera novos ângulos de anúncio. A marca, as cores, as fontes e os produtos do projeto são usados por todas as ferramentas. <span class="fl-leg"><em class="fl-st" style="--s:#2e7d4f">pronto</em> <em class="fl-st" style="--s:#c9952a">parcial</em> <em class="fl-st" style="--s:#888">em breve</em></span></div>
  <div class="fl-side">${FLOW_SIDE.map(s => `<div class="fl-col" style="--c:${s.c}"><h3>${esc(s.t)}</h3>${s.items.map(it => box(s.c, it)).join('')}</div>`).join('')}</div></div>`;
}

/* ---- menu: recolher categorias e recolher o menu todo ---- */
(function () {
  const KEY = 'amp_rail_closed', MINI = 'amp_rail_mini';
  const load = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }, save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } };
  const grp = () => [...document.querySelectorAll('#rail .rail-grp')];
  function closed() { return grp().filter(g => g.classList.contains('closed')).map(g => g.dataset.g); }
  function apply() { const c = load(KEY) || []; grp().forEach(g => { const on = c.includes(g.dataset.g); g.classList.toggle('closed', on); const h = g.querySelector('.rail-gh'); if (h) h.setAttribute('aria-expanded', String(!on)); }); }
  window.railMini = function (on) { const m = on === undefined ? !document.body.classList.contains('rail-mini') : !!on; document.body.classList.toggle('rail-mini', m); save(MINI, m); const b = document.getElementById('railMini'); if (b) { b.firstChild.textContent = m ? '▶ ' : '◀ '; b.title = m ? 'Expandir o menu' : 'Recolher o menu'; } };
  window.railShowActive = function () { const a = document.querySelector('#rail button[data-page].active'); const g = a && a.closest('.rail-grp'); if (g && g.classList.contains('closed')) { g.classList.remove('closed'); save(KEY, closed()); const h = g.querySelector('.rail-gh'); if (h) h.setAttribute('aria-expanded', 'true'); } };
  const init = () => {
    apply(); if (load(MINI)) railMini(true);
    document.getElementById('rail').addEventListener('click', e => { const h = e.target.closest('.rail-gh'); if (!h) return; const g = h.closest('.rail-grp'); g.classList.toggle('closed'); h.setAttribute('aria-expanded', String(!g.classList.contains('closed'))); save(KEY, closed()); });
    const g0 = window.go; if (typeof g0 === 'function') window.go = function (page) { const r = g0.apply(this, arguments); railShowActive(); return r; };
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
