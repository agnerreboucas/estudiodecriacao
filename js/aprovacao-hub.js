/* ===== Aprovação: o portal do cliente (aprovacao.html: Início, Anúncios, Feed, Stories e Reels, Correções) montado dentro do Studio em modo equipe,
   com uma barra do Studio por cima (enviar ao cliente, link, PDF, fila da equipe, prontas para publicar). ===== */
const apH = {kick: 0, modal: '', sendOpen: false};

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
    ${I.pend.length === 0 ? `<div class="ah-next"><b>Próximo passo</b> Mande as peças ao cliente. <button class="btn sm dark" onclick="closeModal();apHSend()">Enviar ao cliente ›</button></div>` : ''}`;
}
function apHBodyPronto(p) {
  const R = apHPronto(p), srvOk = aprState(p).t && smSrv(), item = (t, sub, btn) => `<div class="ah-row ok"><div class="ah-main"><b>${esc(t)}</b><small>${sub}</small></div><div class="ah-act">${btn}</div></div>`;
  return `<div class="ah-sec"><div class="section-row"><div><h3>Pronto para publicar <span class="so-badge">${R.n}</span></h3><p class="muted">Aprovado e ainda sem data. Escolha dia, horário, estilo e redes no calendário.</p></div><button class="btn dark" onclick="soUI.tab='calendario';go('publishingHub')">Abrir o calendário</button></div>
    ${R.cli.length ? `<h4 class="ah-h4">Aprovadas pelo cliente</h4>${R.cli.map(x => item(x.title, `<span class="ah-chip">${esc(APR_KIND[x.kind] || x.kind)}</span>${x.auto ? '<span class="ah-chip alt">por prazo</span>' : x.by ? ' por ' + esc(x.by) : ''}`, `<button class="btn sm dark" onclick="smOpen('${x.id}')">Agendar</button>`)).join('')}` : (aprState(p).t ? '' : '<p class="muted" style="font-size:12.5px">As peças aprovadas pelo cliente aparecem aqui assim que ele responder.</p>')}
    ${R.posts.length ? `<h4 class="ah-h4">Aprovadas na Publicação</h4>${R.posts.map(x => item(x.title || (x.caption || '').slice(0, 60) || 'Peça', `<span class="ah-chip">${esc(soFmt(x.format))}</span> ${x.scheduledFor ? esc(KS.format.formatDateTime(x.scheduledFor)) : 'sem data'}`, `<button class="btn sm dark" onclick="soUI.tab='calendario';soUI.day='${x.scheduledFor ? soDay(x.scheduledFor) : soToday()}';go('publishingHub')">Agendar</button>`)).join('')}` : ''}
    ${R.ok.length ? `<h4 class="ah-h4">Criações aprovadas</h4>${R.ok.slice(0, 20).map(a => item(a.title, `<span class="ah-chip">${esc(a.kind)}</span> ${esc(fmtDate(a.decidedAt || a.created))}`, `<button class="btn sm" onclick="go('publishingHub')">Preparar publicação</button>`)).join('')}` : ''}
    ${R.n === 0 && !R.ok.length ? `<div class="ah-empty"><b>Nada esperando data.</b><span>O que for aprovado pela equipe ou pelo cliente chega aqui.</span></div>` : ''}</div>`;
}


/* ---------- página: a barra do Studio + o portal (o mesmo aprovacao.html do cliente, em modo equipe) ---------- */
const apHImgCache = new Map();
async function apHLocalItems(p, onProg) {
  const pcs = aprSel(p), out = []; let n = 0;
  for (const pc of pcs) {
    const sl = pc.kind === 'ad' ? [pc.set.slides[0]] : pc.set.slides, imgs = [];
    for (let i = 0; i < sl.length; i++) { const key = pc.id + '#' + i + ':' + JSON.stringify(sl[i]).length; if (!apHImgCache.has(key)) apHImgCache.set(key, await aprRenderSlide(pc.set, sl[i])); imgs.push(apHImgCache.get(key)); n++; onProg && onProg(n); }
    out.push(aprItem(pc, (q, i) => imgs[i]));
  }
  return out;
}
const apHToday = () => new Date().toISOString().slice(0, 10);
function apHToolbar(p) {
  const a = aprState(p), sent = !!a.t && !!a.sentAt, I = apHInterna(p), R = apHPronto(p);
  return `<div class="ah-bar"><div class="ah-bar-l">${typeof projectSelect === 'function' ? projectSelect() : ''}<span class="ah-state ${sent ? 'on' : ''}">${sent ? 'Enviado ao cliente em ' + esc(fmtDate(a.sentAt)) : 'Ainda não enviado: esta é a prévia da equipe'}</span></div>
    <div class="ah-bar-r"><button class="btn sm dark" onclick="apHSend()">${sent ? '↻ Reenviar ao cliente' : '✉ Enviar ao cliente'}</button>${sent ? `<button class="btn sm" onclick="apHCopy()">Copiar link</button>` : ''}<button class="btn sm" onclick="aprPdf()" title="PDF de apresentação das peças">📄 PDF</button><button class="btn sm" onclick="aprExportHtml()" title="Arquivo único para abrir sem servidor">⇣ Arquivo único</button>
    <button class="btn sm" onclick="apHQueue()">Fila da equipe <span class="so-badge" id="ahQn">${I.pend.length}</span></button><button class="btn sm" onclick="apHReady()">Prontas para publicar <span class="so-badge" id="ahRn">${R.n}</span></button></div></div>`;
}
let apHToken = 0;
function renderApprovalPage(force) {
  const p = curProject(), r = $('approvalRoot'); if (!r) return; if (!p) { r.innerHTML = noProject('Aprovação'); return; }
  const mounted = $('apvHost') && $('apvHost').dataset.pid === p.id && !force;
  if (mounted) { const bar = $('ahBar'); if (bar) bar.innerHTML = apHToolbar(p); if (apH.modal) apHModal(); return; }
  r.innerHTML = `<div id="ahBar">${apHToolbar(p)}</div><div id="apvHost" data-pid="${p.id}" class="ah-host"><div class="ah-load">Preparando o portal de aprovação…</div></div>`;
  apHMount(p); apHKick(p);
}
async function apHMount(p) {
  const my = ++apHToken, host = $('apvHost'); if (!host) return; const a = aprState(p), srv = API.available && !needsLogin(), sent = !!a.t && !!a.sentAt && srv;
  const reviewer = {name: 'Equipe', day: apHToday()};
  try {
    let cfg;
    if (sent) cfg = {rest: 'api/aprovacao.php', token: a.t, agency: true, reviewer, project: 'rest'};
    else {
      const load = host.querySelector('.ah-load'), items = await apHLocalItems(p, n => { if (load && my === apHToken) load.textContent = 'Preparando as artes… ' + n; });
      if (my !== apHToken) return;
      if (!items.length) { host.innerHTML = '<div class="ah-empty big"><b>Ainda não há peças para aprovar.</b><span>Crie anúncios na Campanha ou carrosséis, posts e stories no Estúdio de Design. Eles aparecem aqui prontos para revisar e enviar ao cliente.</span></div>'; return; }
      cfg = {items, agency: true, reviewer, brand: a.brand || p.name, handle: a.handle || '', project: 'studio-' + p.id, subtitle: 'Prévia da equipe · ' + new Date().toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'})};
    }
    if (my !== apHToken) return; await apvMount(host, cfg);
  } catch (e) { if (my === apHToken) host.innerHTML = '<div class="ah-empty big"><b>Não consegui abrir o portal.</b><span>' + esc(e.message) + '</span></div>'; }
}
/* janelas: enviar, fila da equipe, prontas para publicar */
function apHModal() {
  const p = curProject(); if (!p || !apH.modal) return; const box = $('apHM'); if (!box) return;
  box.innerHTML = apH.modal === 'fila' ? apHBodyInterna(p) : apHBodyPronto(p);
}
function apHQueue() { apH.modal = 'fila'; showModal('Fila da equipe', '<div id="apHM"></div>'); $('modalBox').classList.add('wide'); apHModal(); }
function apHReady() { apH.modal = 'pronto'; apHKickList(); showModal('Prontas para publicar', '<div id="apHM"></div>'); $('modalBox').classList.add('wide'); apHModal(); }
function apHSend() { apH.modal = ''; apH.sendOpen = true; showModal('Enviar ao cliente', '<div id="aprModalBody"></div>'); $('modalBox').classList.add('wide'); apr.embed = true; apr.root = 'aprModalBody'; renderAprarte(); }
const _apHClose = closeModal;
closeModal = function () { const was = apH.sendOpen; _apHClose(); apH.modal = ''; if (was) { apH.sendOpen = false; apr.embed = false; renderApprovalPage(true); } };
function apHCopy() { const a = aprState(curProject()), u = a.link || (apr.est && apr.est.link) || ''; if (!u) { toast('Abra “Reenviar” para gerar o link.'); return; } (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => toast('Link copiado.'), () => prompt('Copie o link:', u)); }
function apHPost(id, to) { const r = soMove(id, to); if (!r.ok) toast(r.msg); else toast(to === 'aprovado' ? 'Peça aprovada.' : 'Peça devolvida para ajustes.'); renderApprovalPage(); }
async function apHKickList() { const p = curProject(), a = aprState(p); if (!(API.available && !needsLogin()) || !a.t || typeof smApproved !== 'function') return; try { SM.list = await smApproved(true); } catch (e) { return; } if (apH.modal === 'pronto') apHModal(); const n = $('ahRn'); if (n) n.textContent = apHPronto(p).n; }
async function apHKick(p) { if (Date.now() - apH.kick < 4000) return; apH.kick = Date.now(); await apHKickList(); }
