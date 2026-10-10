/* ===== Aprovação: uma página só, em 3 etapas — 1 Revisão interna → 2 Cliente → 3 Pronto para publicar.
   Junta o que antes era "Aprovação", "Aprovação de arte" e a fila da Publicação. A etapa Cliente reaproveita js/aprov.js. ===== */
const apH = {tab: 'interna', kick: 0};
const AH_STEPS = [['interna', '1', 'Revisão interna', 'A equipe confere antes de mostrar ao cliente'], ['cliente', '2', 'Cliente', 'Link de aprovação com prazo'], ['pronto', '3', 'Pronto para publicar', 'Aprovado e esperando data']];

function apHInterna(p) {
  soMigrate(); const gate = (p.approvals || []).map(a => ({src: 'gate', id: a.id, title: a.title, kind: a.kind, at: a.decidedAt || a.created, note: a.note, status: a.status}));
  const posts = so().posts.filter(x => x.status === 'aguardando_aprovacao').map(x => ({src: 'post', id: x.id, title: x.title || (x.caption || '').slice(0, 60) || 'Peça da Publicação', kind: soFmt(x.format), at: (x.history && x.history.length ? x.history[x.history.length - 1].at : '') || x.scheduledFor || '', note: '', status: 'Pendente'}));
  const all = gate.concat(posts); return {pend: all.filter(x => x.status === 'Pendente'), done: all.filter(x => x.status !== 'Pendente')};
}
function apHClienteInfo(p) {
  const a = aprState(p); if (!a.t || !a.sentAt) return {sent: false}; const E = apr.est; if (!E) return {sent: true, known: false};
  const exp = aprExpired(E.submission), c = {pending: 0, approved: 0, altered: 0, rejected: 0, published: 0, auto: 0}; E.items.forEach(it => { c[aprStatusOf(it, E.records[it.id], exp)]++; });
  return {sent: true, known: true, c, total: E.items.length, answered: E.items.length - c.pending};
}
function apHPronto(p) {
  soMigrate(); const S = so(), cli = (SM.list || []).slice(), posts = S.posts.filter(x => x.status === 'aprovado'), ok = (p.approvals || []).filter(a => a.status === 'Aprovado');
  return {cli, posts, ok, n: cli.length + posts.length};
}

function apHSteps(p) {
  const I = apHInterna(p), C = apHClienteInfo(p), R = apHPronto(p);
  const card = (k, n, t, sub, big, line, tone) => `<button class="ah-step ${apH.tab === k ? 'on' : ''} ${tone || ''}" onclick="apHGo('${k}')"><span class="ah-n">${n}</span><span class="ah-t">${t}</span><b class="ah-big">${big}</b><small>${line}</small></button>`;
  const cl = !C.sent ? card('cliente', '2', 'Cliente', '', '—', 'Ainda não enviado ao cliente', 'idle') : !C.known ? card('cliente', '2', 'Cliente', '', '…', 'Lendo as respostas', '') : card('cliente', '2', 'Cliente', '', `${C.answered}/${C.total}`, `${C.c.approved + C.c.auto} aprovadas · ${C.c.altered + C.c.rejected} para corrigir`, C.c.pending ? 'warn' : 'ok');
  return card('interna', '1', 'Revisão interna', '', I.pend.length, I.pend.length ? 'esperando a equipe' : 'nada esperando', I.pend.length ? 'warn' : 'ok') + '<i class="ah-arr">›</i>' + cl + '<i class="ah-arr">›</i>' + card('pronto', '3', 'Pronto para publicar', '', R.n, R.n ? 'aprovadas, sem data' : 'nada esperando data', R.n ? 'go' : 'idle');
}
function apHRow(x) {
  const src = x.src === 'post' ? 'Publicação' : 'Fila de criação', act = x.src === 'gate'
    ? (x.status !== 'Aprovado' ? `<button class="btn sm dark" onclick="approvalSet('${x.id}','Aprovado')">Aprovar</button>` : '') + (x.status === 'Pendente' ? `<button class="btn sm" onclick="approvalAdjust('${x.id}')">Pedir ajustes</button>` : '')
    : `<button class="btn sm dark" onclick="apHPost('${x.id}','aprovado')">Aprovar</button><button class="btn sm" onclick="apHPost('${x.id}','rascunho')">Devolver</button>`;
  return `<div class="ah-row ${x.status === 'Aprovado' ? 'ok' : x.status === 'Ajustes' ? 'adj' : ''}"><div class="ah-main"><b>${esc(x.title)}</b><small><span class="ah-chip">${esc(x.kind || 'Peça')}</span><span class="ah-chip alt">${src}</span>${x.at ? ' ' + esc(fmtDate(x.at)) : ''}${x.note ? ' · ' + esc(x.note) : ''}</small></div><div class="ah-act">${x.status !== 'Pendente' ? `<span class="st-pill st-${esc(String(x.status).toLowerCase())}">${esc(x.status)}</span>` : ''}${act}</div></div>`;
}
function apHBodyInterna(p) {
  const I = apHInterna(p);
  return `<div class="ah-sec"><div class="section-row"><div><h3>Esperando revisão da equipe <span class="so-badge">${I.pend.length}</span></h3><p class="muted">Conceitos, roteiros, criações e peças da Publicação que pedem um “ok” antes de seguir.</p></div>${p.approvals.some(a => a.status === 'Pendente') ? `<button class="btn" onclick="approveAll()">Aprovar o lote de criações</button>` : ''}</div>
    ${I.pend.length ? I.pend.map(apHRow).join('') : `<div class="ah-empty"><b>Tudo em dia.</b><span>Quando alguém enviar algo para aprovação, aparece aqui.</span></div>`}</div>
    ${I.done.length ? `<details class="ah-sec"><summary>Já decididas <span class="so-badge">${I.done.length}</span></summary>${I.done.slice().sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 30).map(apHRow).join('')}</details>` : ''}
    ${I.pend.length === 0 ? `<div class="ah-next"><b>Próximo passo</b> Mande as peças aprovadas ao cliente. <button class="btn sm dark" onclick="apHGo('cliente')">Ir para a etapa Cliente ›</button></div>` : ''}`;
}
function apHBodyPronto(p) {
  const R = apHPronto(p), srvOk = aprState(p).t && smSrv(), item = (t, sub, btn) => `<div class="ah-row ok"><div class="ah-main"><b>${esc(t)}</b><small>${sub}</small></div><div class="ah-act">${btn}</div></div>`;
  return `<div class="ah-sec"><div class="section-row"><div><h3>Pronto para publicar <span class="so-badge">${R.n}</span></h3><p class="muted">Aprovado e ainda sem data. Escolha dia, horário, estilo e redes no calendário.</p></div><button class="btn dark" onclick="soUI.tab='calendario';go('publishingHub')">Abrir o calendário</button></div>
    ${R.cli.length ? `<h4 class="ah-h4">Aprovadas pelo cliente</h4>${R.cli.map(x => item(x.title, `<span class="ah-chip">${esc(APR_KIND[x.kind] || x.kind)}</span>${x.auto ? '<span class="ah-chip alt">por prazo</span>' : x.by ? ' por ' + esc(x.by) : ''}`, `<button class="btn sm dark" onclick="smOpen('${x.id}')">Agendar</button>`)).join('')}` : (aprState(p).t ? '' : '<p class="muted" style="font-size:12.5px">As peças aprovadas pelo cliente aparecem aqui assim que ele responder.</p>')}
    ${R.posts.length ? `<h4 class="ah-h4">Aprovadas na Publicação</h4>${R.posts.map(x => item(x.title || (x.caption || '').slice(0, 60) || 'Peça', `<span class="ah-chip">${esc(soFmt(x.format))}</span> ${x.scheduledFor ? esc(KS.format.formatDateTime(x.scheduledFor)) : 'sem data'}`, `<button class="btn sm dark" onclick="soUI.tab='calendario';soUI.day='${x.scheduledFor ? soDay(x.scheduledFor) : soToday()}';go('publishingHub')">Agendar</button>`)).join('')}` : ''}
    ${R.ok.length ? `<h4 class="ah-h4">Criações aprovadas</h4>${R.ok.slice(0, 20).map(a => item(a.title, `<span class="ah-chip">${esc(a.kind)}</span> ${esc(fmtDate(a.decidedAt || a.created))}`, `<button class="btn sm" onclick="go('publishingHub')">Preparar publicação</button>`)).join('')}` : ''}
    ${R.n === 0 && !R.ok.length ? `<div class="ah-empty"><b>Nada esperando data.</b><span>O que for aprovado pela equipe ou pelo cliente chega aqui.</span></div>` : ''}</div>`;
}

function renderApprovalPage() {
  const p = curProject(), r = $('approvalRoot'); if (!r) return; if (!p) { r.innerHTML = noProject('Aprovação'); return; }
  r.innerHTML = hubHead('Aprovação', 'Do rascunho ao ar em três etapas: a equipe confere, o cliente aprova e a peça fica pronta para publicar.', '') + `<div class="ah-steps" id="ahSteps">${apHSteps(p)}</div><div id="approvalBody" class="ah-body"></div>`;
  apHBody(p); apHKick(p);
}
function apHBody(p) {
  const b = $('approvalBody'); if (!b) return; apr.embed = false;
  if (apH.tab === 'cliente') { apr.embed = true; apr.root = 'approvalBody'; renderAprarte(); return; }
  b.innerHTML = apH.tab === 'pronto' ? apHBodyPronto(p) : apHBodyInterna(p);
}
function apHGo(k) { apH.tab = k; const y = window.scrollY; renderApprovalPage(); window.scrollTo(0, y); }
function apHPost(id, to) { const r = soMove(id, to); if (!r.ok) toast(r.msg); else toast(to === 'aprovado' ? 'Peça aprovada.' : 'Peça devolvida para ajustes.'); const y = window.scrollY; renderApprovalPage(); window.scrollTo(0, y); }
/* lê, uma vez por abertura, as respostas do cliente e as peças aprovadas, e atualiza os números das etapas */
async function apHKick(p) {
  if (Date.now() - apH.kick < 4000) return; apH.kick = Date.now(); const a = aprState(p); if (!(API.available && !needsLogin())) return;
  try {
    if (a.t && a.sentAt) apr.est = await api('aprovacao.php', {method: 'POST', body: {action: 'equipe', t: a.t}});
    if (typeof smApproved === 'function' && a.t) SM.list = await smApproved(true);
  } catch (e) { return; }
  if (ui.page !== 'approval' || curProject().id !== p.id) return; const st = $('ahSteps'); if (st) st.innerHTML = apHSteps(p); if (apH.tab === 'pronto') apHBody(p);
}
