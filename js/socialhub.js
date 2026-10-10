/* ===== Social Hub e Insights: o app Social Hub (build estático, socialhub/index.html) dentro do Studio, num iframe.
   Dados: cada projeto guarda o estado inteiro do Hub em p.socialhub.snap (JSON de snapshot). Na primeira abertura o Hub
   nasce dos dados da Publicação do Studio (p.social). Cada alteração no Hub volta ao Studio por postMessage. ===== */
const shUI = {pid: '', tpl: '', busy: false, save: null, route: '/social'};
const SH_LINKS = [['/social', 'Painel'], ['/social/agenda', 'Agenda'], ['/social/conteudo', 'Insights de conteúdo'], ['/social/publico', 'Público'], ['/social/localidades', 'Localidades'], ['/social/publicacoes', 'Publicações'], ['/social/impulsionamentos', 'Impulsionar'], ['/social/relacionamento', 'Relacionamento'], ['/social/relatorios', 'Relatórios'], ['/social/atualizar', 'Atualizar números'], ['/social/importar', 'Importar histórico'], ['/social/contas', 'Contas'], ['/social/equipe', 'Equipe'], ['/social/historico', 'Histórico']];

/* snapshot do Hub a partir da Publicação do Studio */
function shSeed(p) {
  const S = p.social && Array.isArray(p.social.posts) ? p.social : normalizeSocial(p.social), pid = p.id, now = new Date().toISOString();
  const put = o => Object.assign({}, o, {projectId: pid});
  return {
    versao: 1, geradoEm: now, projects: [{id: pid, name: p.name, client: p.client || p.name}],
    users: [{id: 'user-studio', name: 'Equipe Ampliação', email: 'equipe@studio.local', role: 'administrador', projectIds: [pid], lastActiveAt: now, avatarGradient: 'linear-gradient(135deg,#232526,#5f6368)', area: ''}],
    accounts: S.accounts.map(a => Object.assign(put(a), {origem: a.origem === 'oauth' ? 'oauth' : 'demonstracao'})),
    metrics: Object.keys(S.metrics || {}).filter(k => S.accounts.some(a => a.id === k)).map(k => ({accountId: k, dias: S.metrics[k]})),
    audience: [], posts: S.posts.map(put), boosts: S.boosts.slice(), inbox: S.inbox.slice(), eventos: S.events.map(put), reports: [], atualizacoes: []
  };
}
const shData = p => { p.socialhub = normalizeSocialhub(p.socialhub); if (p.socialhub.snap) { try { return JSON.parse(p.socialhub.snap); } catch (e) { /* cai para a semente */ } } return shSeed(p); };

async function shTemplate() {
  if (shUI.tpl) return shUI.tpl;
  if (window.SOCIALHUB_TEMPLATE) return (shUI.tpl = window.SOCIALHUB_TEMPLATE);
  const r = await fetch('socialhub/index.html'); if (!r.ok) throw new Error('Não achei socialhub/index.html neste servidor.');
  return (shUI.tpl = await r.text());
}
function shHtml(tpl, snap) {
  const tag = '<script type="application/json" id="dados-plataforma">' + JSON.stringify(snap).replace(/</g, '\\u003c') + '<\/script>', i = tpl.indexOf('<script type="module">');
  if (i < 0) throw new Error('Arquivo do Social Hub fora do formato esperado.');
  return tpl.slice(0, i) + tag + '\n    ' + tpl.slice(i);
}

function renderSocialHubPage() {
  const r = $('socialhubRoot'), p = curProject(); if (!r) return; if (!p) { r.innerHTML = noProject('Social Hub e Insights'); return; }
  soMigrate(); const S = so(), snap = normalizeSocialhub(p.socialhub).snap, semDados = !snap && !S.accounts.length;
  r.innerHTML = hubHead('Social Hub e Insights', 'Painel, agenda, conteúdo, público, impulsionamento, relacionamento e relatórios das redes. Cada projeto tem o seu.', `<div class="row-gap"><button class="btn" onclick="shReseed()" title="Refaz o Hub com as contas e publicações da aba Publicação (apaga o que foi alterado só no Hub)">↻ Trazer da Publicação</button><button class="btn" onclick="shBackup()">⬇ Baixar dados (.json)</button></div>`) +
    (semDados ? `<div class="panel sh-empty"><b>Este projeto ainda não tem contas nem publicações.</b> <span class="muted">Dentro do Hub, use “Contas”, “Atualizar números” e “Importar histórico”, ou carregue dados de exemplo para conhecer as telas.</span> <button class="btn sm" onclick="soExample();shReseed(true)">Carregar dados de exemplo</button></div>` : '') +
    `<div class="sh-wrap"><iframe id="shFrame" title="Social Hub" sandbox="allow-scripts allow-same-origin allow-downloads allow-modals allow-popups allow-popups-to-escape-sandbox"></iframe><div class="sh-load" id="shLoad">Abrindo o Social Hub…</div></div>` +
    `<small class="muted block" style="margin-top:6px">${p.socialhub.at ? 'Guardado no projeto em ' + esc(fmtDateTime(p.socialhub.at)) + '. ' : ''}Sem conexão direta com a Meta aqui: os números entram à mão, por importação ou pela aba Publicação. Veja o HANDOFF (item 19).</small>`;
  shLoad(p);
}
async function shLoad(p) {
  shUI.pid = p.id; const fr = $('shFrame'), ld = $('shLoad'); if (!fr) return;
  try { const tpl = await shTemplate(); if (curProject().id !== p.id || !$('shFrame')) return; fr.srcdoc = shHtml(tpl, shData(p)); fr.onload = () => { if (ld) ld.remove(); if (shUI.route !== '/social') shGo(shUI.route, true); }; }
  catch (e) { if (ld) ld.textContent = 'Não consegui abrir o Social Hub: ' + e.message; }
}
function shGo(rota, quiet) { shUI.route = rota; const fr = $('shFrame'); if (fr && fr.contentWindow) fr.contentWindow.postMessage({tipo: 'socialhub:ir', rota}, '*'); if (!quiet) document.querySelectorAll('.sh-go').forEach((b, i) => b.classList.toggle('on', SH_LINKS[i] && SH_LINKS[i][0] === rota)); }
function shReseed(silent) {
  const p = curProject(); if (!silent && normalizeSocialhub(p.socialhub).snap && !confirm('Refazer o Social Hub com os dados da aba Publicação? O que foi alterado só dentro do Hub será substituído.')) return;
  p.socialhub = {snap: '', at: '', seededAt: new Date().toISOString()}; persist(); renderSocialHubPage();
}
function shBackup() { const p = curProject(); download('social-hub-' + slug(p.name) + '.json', JSON.stringify(shData(p), null, 2), 'application/json'); }

/* o Hub avisa a cada alteração: guardamos o estado inteiro no projeto */
window.addEventListener('message', e => {
  const fr = $('shFrame'); if (!fr || e.source !== fr.contentWindow || !e.data || e.data.tipo !== 'socialhub:estado') return;
  const j = e.data.snapshot; if (!j || typeof j.versao !== 'number' || !Array.isArray(j.accounts)) return;
  clearTimeout(shUI.save); const pid = shUI.pid;
  shUI.save = setTimeout(() => {
    const p = state.projects.find(x => x.id === pid); if (!p) return; const txt = JSON.stringify(j);
    if (txt.length > 4000000) { toast('O Social Hub ficou grande demais para guardar no projeto. Baixe os dados (.json).'); return; }
    p.socialhub = {snap: txt, at: new Date().toISOString(), seededAt: (p.socialhub && p.socialhub.seededAt) || ''}; persist();
  }, 700);
});
