/* ===== Menu por categorias (recolher categorias e menu) e página "Mapa do projeto": o fluxo de trabalho do começo ao fim, clicável ===== */
const FLOW = [
  {n: '1', t: 'Planejar', c: '#3b3b46', d: 'Entender o cliente e a marca antes de criar qualquer coisa.', items: [
    ['projects', 'Projetos', 'Um projeto por cliente ou marca. Tudo o que você criar fica dentro dele.'],
    ['brand', 'Brand Brain', 'Cores, fontes, tom de voz, logo e produtos da marca.'],
    ['matrix', 'Matriz de Criação', 'Públicos (ICP), jornada, hipóteses e diagnóstico.'],
    ['inspiration', 'Inspiração', 'Referências e concorrentes para se basear.']]},
  {n: '2', t: 'Criar', c: '#e4572e', d: 'Produzir as peças. Cada ferramenta usa a marca do projeto.', items: [
    ['editorial', 'Agente Editorial', 'Da ideia aos ângulos, headlines e roteiros.'],
    ['carrosseis', 'Carrosséis', '3 a 20 slides, textos, legenda e anúncio.'],
    ['feed', 'Planejador de feed', '26 tipos de feed e grids com carrossel.'],
    ['design', 'Estúdio de Design', 'Posts, stories e anúncios com editor.'],
    ['landings', 'Sites e landing pages', 'Páginas de venda, sites e templates importados.'],
    ['editora', 'Editora (e-books)', 'Capa, texto, diagramação e Amazon.'],
    ['videoLab', 'Video Lab', 'Roteiros, storyboard e narração.']], two: true},
  {n: '3', t: 'Aprovar e publicar', c: '#2f6fcf', d: 'Revisar com o cliente e colocar no ar.', items: [
    ['campaigns', 'Campanhas', 'Agrupa as peças por campanha.'],
    ['approval', 'Aprovação', 'Fila de revisão e aprovação das peças.'],
    ['publishingHub', 'Publicação', 'Calendário, legenda e envio por rede.']]},
  {n: '4', t: 'Medir', c: '#c9952a', d: 'Ver o que funcionou e aprender.', items: [
    ['analyticsHub', 'Performance', 'Resultado, leads e o que repetir.']]}
];
const FLOW_SIDE = [
  {t: 'Acervo (usado em todas as etapas)', c: '#2e7d4f', items: [['biblioteca', 'Imagens', 'Biblioteca de imagens: fotos geradas, enviadas e do produto.'], ['library', 'Peças criadas', 'Tudo o que já foi feito neste projeto.']]},
  {t: 'Ajustes', c: '#7c4dbd', items: [['settings', 'Configurações', 'Chaves das APIs, conexões e dados da conta.']]}
];
function renderFlow() {
  const r = $('flowRoot'); if (!r) return; const p = typeof curProject === 'function' ? curProject() : null, has = !!p, br = has && p.brand && (p.brand.name || p.brand.colors && p.brand.colors.length);
  const box = (c, [pg, t, d]) => `<button class="fl-box" style="--c:${c}" onclick="go('${pg}')"><b>${esc(t)}</b><small>${esc(d)}</small></button>`;
  r.innerHTML = `<div class="fl-wrap"><div class="page-head"><div><h1>Mapa do projeto</h1><p>Como o Studio funciona, do começo ao fim. Cada caixa abre a ferramenta. O menu da esquerda segue a mesma ordem.</p></div></div>
  <h3 style="margin:6px 0 0">Por onde começar</h3>
  <div class="fl-steps"><button class="fl-step ${has ? 'done' : ''}" onclick="go('projects')"><b>1</b> Criar o projeto${has ? ' ✓' : ''}</button><span>→</span><button class="fl-step ${br ? 'done' : ''}" onclick="go('brand')"><b>2</b> Preencher a marca${br ? ' ✓' : ''}</button><span>→</span><button class="fl-step" onclick="go('editorial')"><b>3</b> Escolher o que criar</button><span>→</span><button class="fl-step" onclick="go('publishingHub')"><b>4</b> Publicar e medir</button></div>
  <div class="fl-row">${FLOW.map((s, i) => `${i ? '<div class="fl-arrow">→</div>' : ''}<div class="fl-col" style="--c:${s.c}"><h3><span>${s.n}</span>${esc(s.t)}</h3><p>${esc(s.d)}</p><div class="${s.two ? 'fl-two' : ''}" style="display:${s.two ? 'grid' : 'flex'};${s.two ? '' : 'flex-direction:column;'}gap:8px">${s.items.map(it => box(s.c, it)).join('')}</div></div>`).join('')}</div>
  <div class="fl-loop"><b>↺ O ciclo:</b> o que você aprende em <b>Medir</b> volta para <b>Planejar</b> (novos públicos e hipóteses na Matriz) e gera novas ideias no Agente Editorial. A marca, as cores, as fontes e os produtos do projeto são herdados por todas as ferramentas.</div>
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
