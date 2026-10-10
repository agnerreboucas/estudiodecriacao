/* ===== Publicação: aprovados no calendário + conexão com a Meta (Instagram e Facebook) =====
   1) Peças aprovadas pelo cliente (Aprovação de arte) aparecem no Calendário; arraste para o dia ou use "Agendar aprovado": escolha hora, estilo e redes.
   2) Posts agendados vão para a fila do servidor (api/meta_social.php), que publica na hora marcada pela API oficial da Meta. Sem conexão, tudo continua manual/webhook. */
const SM = {status: null, at: 0, est: null, estAt: 0, jobsAt: 0, busy: false, modal: null, pages: null};
const SM_STYLES = [['imagem', 'Feed · imagem única'], ['carrossel', 'Feed · carrossel'], ['story', 'Stories'], ['video', 'Reels (precisa de vídeo)']];
const smSrv = () => API.available && !needsLogin();
const smNets = p => [...new Set(p.accountIds.map(soAcc).filter(a => a && a.origem === 'oauth' && ['instagram', 'facebook'].includes(a.networkId)).map(a => a.networkId))];
async function smStatus(force) { if (!smSrv()) return null; if (!force && SM.status && Date.now() - SM.at < 30000) return SM.status; try { SM.status = await api('meta_social.php?action=status'); SM.at = Date.now(); } catch (e) { SM.status = null; } return SM.status; }
const smReady = () => !!(SM.status && SM.status.connected && !SM.status.dry);

/* ---------- aprovados vinculados ao calendário ---------- */
async function smApproved(force) {
  const p = curProject(), a = aprState(p); if (!a.t || !smSrv()) return [];
  if (force || !SM.est || Date.now() - SM.estAt > 60000) { try { SM.est = await api('aprovacao.php', {method: 'POST', body: {action: 'equipe', t: a.t}}); SM.estAt = Date.now(); } catch (e) { SM.est = null; } }
  const E = SM.est; if (!E) return []; const exp = aprExpired(E.submission), S = so(), pcs = new Map(aprPieces(p).map(x => [x.id, x])), out = [];
  E.items.forEach(it => {
    const r = E.records[it.id], st = aprStatusOf(it, r, exp); if (st !== 'approved' && st !== 'auto') return; if (r && r.published) return; const pc = pcs.get(it.id); if (!pc) return; if (S.posts.some(x => x.aprovItem === it.id)) return;
    const v = r && r.vals; out.push({id: it.id, set: pc.set, kind: it.kind, title: String(((v && v.slides && v.slides[0] && v.slides[0].h) || (it.slides[0] || {}).h || pc.label)).replace(/\*/g, '').slice(0, 90), label: pc.label, auto: st === 'auto', by: r && r.by || '', edited: !!(v && v.caption !== undefined && v.caption !== (it.caption || '')),
      caption: (v && v.caption !== undefined ? v.caption : (it.caption || '')) || (it.kind === 'ad' && it.ad ? [((v && v.ad) || it.ad).primary, ((v && v.ad) || it.ad).headline].filter(Boolean).join('\n\n') : ''), style: pc.kind === 'story' || pc.format === 'story' ? 'story' : pc.kind === 'carousel' ? 'carrossel' : 'imagem'});
  });
  return out;
}
async function smThumb(cv, set) { try { await ensureSetResources(set); const W = set.format.w, H = set.format.h, k = Math.min(54 / W, 68 / H); cv.width = Math.round(W * k); cv.height = Math.round(H * k); renderSlide(cv.getContext('2d'), set.slides[0], W, H, k); } catch (e) { /* sem miniatura */ } }
/* Calendário: painel dos aprovados + arrastar para o dia */
async function smCalendarExtra(b) {
  const list = await smApproved(); const old = document.getElementById('smApr'); if (old) old.remove(); if (!$('soBody') || soUI.tab !== 'calendario') return;
  const box = document.createElement('div'); box.id = 'smApr'; box.className = 'panel'; box.style.marginTop = '12px'; SM.list = list;
  box.innerHTML = `<div class="section-row"><h3 style="margin:0">Aprovados pelo cliente, prontos para agendar <small class="muted">(${list.length})</small></h3><button class="btn sm" onclick="smRefreshApproved()">↻ Atualizar</button></div>` +
    (list.length ? `<p class="muted" style="font-size:12.5px;margin:6px 0 10px">Arraste uma peça para um dia do calendário, ou clique em <b>Agendar</b>. Você escolhe hora, estilo e redes.</p><div class="sm-chips">${list.map((x, i) => `<div class="sm-chip" draggable="true" ondragstart="event.dataTransfer.setData('text/plain','${x.id}');event.dataTransfer.effectAllowed='copy'"><canvas data-i="${i}" width="40" height="50"></canvas><span><b>${esc(x.title)}</b><small>${esc(APR_KIND[x.kind] || x.kind)}${x.auto ? ' · aprovado por prazo' : x.by ? ' · por ' + esc(x.by) : ''}</small></span><button class="btn sm dark" onclick="smOpen('${x.id}')">Agendar</button></div>`).join('')}</div>` : `<p class="muted" style="margin:6px 0 0">${aprState(curProject()).t ? 'Nenhuma peça aprovada esperando agendamento. Quando o cliente aprovar (ou o prazo vencer), elas aparecem aqui.' : 'Envie peças para o cliente em <b>Aprovação de arte</b>; as aprovadas aparecem aqui.'}</p>`);
  $('soBody').appendChild(box); box.querySelectorAll('canvas[data-i]').forEach(cv => smThumb(cv, list[+cv.dataset.i].set));
  $('soBody').querySelectorAll('.so-day').forEach(d => { const m = /soUI\.day='(\d{4}-\d{2}-\d{2})'/.exec(d.getAttribute('onclick') || ''); if (!m) return; d.addEventListener('dragover', e => { e.preventDefault(); d.classList.add('sm-over'); }); d.addEventListener('dragleave', () => d.classList.remove('sm-over')); d.addEventListener('drop', e => { e.preventDefault(); d.classList.remove('sm-over'); const id = e.dataTransfer.getData('text/plain'); if (id) smOpen(id, m[1]); }); });
  const bar = $('soBody').querySelector('.panel:nth-of-type(2) .row-gap:last-child'); if (bar && !document.getElementById('smDayBtn')) bar.insertAdjacentHTML('afterbegin', `<button class="btn sm" id="smDayBtn" onclick="smOpen('', '${soUI.day}')">📌 Agendar aprovado neste dia</button>`);
}
async function smRefreshApproved() { await smApproved(true); smCalendarExtra(); }

/* ---------- agendar um aprovado ---------- */
async function smOpen(itemId, day) {
  const list = SM.list || await smApproved(); if (!list.length) { toast('Nenhuma peça aprovada esperando agendamento.'); return; } const it = list.find(x => x.id === itemId) || list[0], S = so();
  const nets = S.accounts.filter(a => ['instagram', 'facebook'].includes(a.networkId)); SM.modal = {id: it.id, day: day || soUI.day || soToday(), time: '09:00', style: it.style, caption: it.caption, accs: nets.filter(a => a.origem === 'oauth' || nets.length <= 2).map(a => a.id)}; smModalDraw(list);
}
function smModalDraw(list) {
  const m = SM.modal, S = so(), it = list.find(x => x.id === m.id) || list[0], nets = S.accounts.filter(a => ['instagram', 'facebook'].includes(a.networkId)), accs = m.accs.map(soAcc).filter(Boolean);
  const issues = accs.length ? KS.networks.validateDraft({format: m.style, caption: m.caption, media: Object.assign({}, KS.networks.MIDIA_PADRAO[m.style] || {}, {count: m.style === 'carrossel' ? Math.min(10, it.set.slides.length) : 1})}, accs) : [];
  const day = soDay(m.day + 'T12:00'), busy = S.posts.filter(p => p.scheduledFor && soDay(p.scheduledFor) === day && p.status !== 'publicado').map(p => new Date(p.scheduledFor).toTimeString().slice(0, 5));
  showModal('📌 Agendar peça aprovada', `<div class="form-grid"><div class="field full"><label>Peça aprovada</label><select onchange="SM.modal.id=this.value;SM.modal.style=SM.list.find(x=>x.id===this.value).style;SM.modal.caption=SM.list.find(x=>x.id===this.value).caption;smModalDraw(SM.list)">${list.map(x => `<option value="${x.id}" ${x.id === it.id ? 'selected' : ''}>${esc(x.title)} · ${esc(APR_KIND[x.kind] || x.kind)}</option>`).join('')}</select></div>
    <div class="field"><label>Dia</label><input type="date" value="${m.day}" onchange="SM.modal.day=this.value;smModalDraw(SM.list)"></div><div class="field"><label>Horário</label><input type="time" value="${m.time}" onchange="SM.modal.time=this.value"></div>
    <div class="field full"><small class="muted">${busy.length ? 'Já agendado neste dia: ' + busy.sort().join(', ') + '.' : 'Nada agendado neste dia.'}</small></div>
    <div class="field full"><label>Estilo da publicação</label><div class="tchips" style="justify-content:flex-start">${SM_STYLES.map(([k, l]) => `<button class="tchip ${m.style === k ? 'on' : ''}" onclick="SM.modal.style='${k}';smModalDraw(SM.list)">${l}</button>`).join('')}</div></div>
    <div class="field full"><label>Redes</label>${nets.length ? `<div class="tchips" style="justify-content:flex-start">${nets.map(a => `<button class="tchip ${m.accs.includes(a.id) ? 'on' : ''}" onclick="smTogAcc('${a.id}')">${soCh([a.id])} ${esc(soNet(a.networkId).label)} ${esc(a.handle)}${a.origem === 'oauth' ? ' ✓' : ''}</button>`).join('')}</div>` : '<small class="muted">Nenhuma conta de Instagram ou Facebook. Adicione abaixo ou conecte a Meta em Contas e dados.</small>'}
      <div class="row-gap" style="margin-top:6px"><input id="smNewAcc" placeholder="@seuperfil" style="flex:1"><button class="btn sm" onclick="smAddAcc('instagram')">＋ Instagram</button><button class="btn sm" onclick="smAddAcc('facebook')">＋ Facebook</button></div></div>
    <div class="field full"><label>Legenda ${it.edited ? '<small class="muted">(com a edição do cliente)</small>' : ''}</label><textarea rows="6" oninput="SM.modal.caption=this.value">${esc(m.caption)}</textarea></div>
    <div class="field full">${[...issues.map(i => `${i.severity === 'erro' ? '⛔' : '⚠'} ${esc(soNet(i.networkId).label)}: ${esc(i.message)}`)].map(t => `<div class="so-issue">${t}</div>`).join('') || '<small class="muted">Sem problemas para as redes escolhidas.</small>'}</div></div>
    <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn" onclick="smSchedule(true)">Salvar como rascunho</button><button class="btn dark" onclick="smSchedule(false)">Agendar</button></div>`);
}
function smTogAcc(id) { const a = SM.modal.accs, i = a.indexOf(id); if (i >= 0) a.splice(i, 1); else a.push(id); smModalDraw(SM.list); }
function smAddAcc(net) { const h = ($('smNewAcc') || {}).value || ''; if (!h.trim()) { toast('Escreva o @ do perfil.'); return; } const a = soAddAccount(net, h); if (a) SM.modal.accs.push(a.id); smModalDraw(SM.list); }
function smSchedule(draftOnly) {
  const m = SM.modal, it = (SM.list || []).find(x => x.id === m.id); if (!it) return; if (!m.accs.length) { toast('Escolha ao menos uma rede.'); return; } if (!m.day) { toast('Escolha o dia.'); return; }
  const set = it.set, r = set.format.w / set.format.h, ar = r > 1.3 ? '16:9' : r > 0.9 ? '1:1' : r > 0.7 ? '4:5' : '9:16', p = soNewPost({format: m.style});
  Object.assign(p, {title: it.title, caption: m.caption, accountIds: m.accs.slice(), media: Object.assign({}, KS.networks.MIDIA_PADRAO[m.style] || {}, {count: m.style === 'carrossel' ? Math.min(10, set.slides.length) : 1, aspectRatio: ar}), requiresApproval: true, setId: set.id, aprovItem: it.id, scheduledFor: soLocalISO(m.day, m.time)});
  soHist(p, '', 'rascunho', 'criada a partir da Aprovação de arte'); soSave(); closeModal();
  const r1 = soMove(p.id, 'aprovado'); if (!r1.ok) { toast('Salvo como rascunho. ' + r1.msg); soRefresh(); return; } p.approvedBy = 'Cliente (aprovação de arte)'; soSave();
  if (!draftOnly) { const r2 = soMove(p.id, 'agendado'); toast(r2.ok ? 'Agendado para ' + KS.format.formatDateTime(p.scheduledFor) + '.' : 'Aprovado, mas não agendou: ' + r2.msg); } else toast('Rascunho salvo e aprovado.');
  soUI.day = m.day; const d = new Date(m.day + 'T12:00'); soUI.y = d.getFullYear(); soUI.m = d.getMonth(); soRefresh();
}

/* ---------- fila da Meta ---------- */
async function smImages(p) {
  const set = curProject().design.sets.find(x => x.id === p.setId); if (!set) throw new Error('A peça de arte desta publicação não está mais no projeto.'); const sl = p.format === 'carrossel' ? set.slides.slice(0, 10) : [set.slides[0]], out = [];
  for (const s of sl) out.push(await aprRenderSlide(set, s)); return out;
}
async function smQueue(id, now) {
  const p = soPost(id); if (!p) return null; const nets = smNets(p); if (!nets.length) return null; const st = await smStatus(); if (!st || !st.connected) return null;
  const images = await smImages(p), r = await api('meta_social.php', {method: 'POST', body: {action: now ? 'publish_now' : 'queue', job: {project: curProject().id, postId: p.id, when: p.scheduledFor || new Date().toISOString(), nets, format: p.format, caption: p.caption}, images}});
  p.jobId = now ? (r.job && r.job.id) || '' : r.id; p.failureReason = undefined; soSave(); return r;
}
async function smAfterSchedule(id) {
  const p = soPost(id); if (!p) return; const st = await smStatus(); if (!st) return;
  if (!smNets(p).length) { if (st.connected) toast('Agendado no Studio. Para sair sozinho na Meta, escolha as contas conectadas (✓) na publicação.'); return; }
  try { const r = await smQueue(id, false); if (r) toast(st.dry ? 'Fila em modo de teste: nada será enviado à Meta.' : 'Na fila da Meta para ' + KS.format.formatDateTime(p.scheduledFor) + '.'); } catch (e) { toast('Fila da Meta: ' + e.message); }
}
async function smCancelJob(id) { const p = soPost(id); if (!p || !p.jobId || !smSrv()) return; try { await api('meta_social.php', {method: 'POST', body: {action: 'cancel', id: p.jobId}}); p.jobId = ''; soSave(); } catch (e) { /* segue */ } }
/* traz o resultado das tarefas (publicado ou com erro) para as publicações */
async function smSync(force) {
  const p = curProject(); if (!p || !smSrv() || (!force && Date.now() - SM.jobsAt < 25000)) return; SM.jobsAt = Date.now(); let r; try { r = await api('meta_social.php?action=jobs&project=' + encodeURIComponent(p.id)); } catch (e) { return; }
  let ch = false; const S = so();
  r.jobs.forEach(j => { const post = S.posts.find(x => x.id === j.postId); if (!post || post.jobId !== j.id) return;
    if (j.status === 'done' && !j.dry && post.status !== 'publicado') { post.status = 'publicado'; post.publishedAt = j.updated || new Date().toISOString(); post.scheduledFor = null; post.permalinks = Object.entries(j.results || {}).filter(([, v]) => v && v.url).map(([net, v]) => ({net, url: v.url})); post.failureReason = undefined; soHist(post, 'agendado', 'publicado', 'publicada pela API da Meta'); smMarkPublished(post.aprovItem); ch = true; }
    else if (j.status === 'failed' && post.status !== 'falhou' && post.status !== 'publicado') { post.status = 'falhou'; post.failureReason = String(j.error || 'Falhou ao publicar').slice(0, 300); soHist(post, 'agendado', 'falhou', post.failureReason); ch = true; }
    else if (j.status === 'queued' && j.error && post.failureReason !== String(j.error).slice(0, 300)) { post.failureReason = String(j.error).slice(0, 300); ch = true; } });
  if (ch) { soSave(); soRefresh(); }
}
async function smMarkPublished(itemId) { const a = aprState(curProject()); if (!itemId || !a.t || !SM.est) return; try { const r = Object.assign({}, SM.est.records[itemId] || {status: 'approved'}, {published: {by: 'Studio', at: new Date().toISOString()}}); await api('aprovacao.php', {method: 'POST', body: {action: 'registro', t: a.t, id: itemId, record: r}}); } catch (e) { /* só a equipe logada com senha consegue */ } }

/* ---------- ligações com a tela de Publicação ---------- */
const smBase = {cal: window.soCalendario, contas: window.soContas, move: window.soMove, pub: window.soPublicar, render: window.renderSocialPage};
window.soCalendario = function (b, S) { smBase.cal(b, S); smCalendarExtra(b); };
window.soContas = function (b, S) { smBase.contas(b, S); smContasExtra(b); };
window.soMove = function (id, to) { const p = soPost(id), from = p && p.status, r = smBase.move(id, to); if (r.ok && p) { if (to === 'agendado' && from !== 'agendado') smAfterSchedule(id); else if (from === 'agendado' && to !== 'agendado' && to !== 'publicado') smCancelJob(id); } return r; };
window.renderSocialPage = function () { smBase.render(); smStatus().then(() => smSync()); };
window.soPublicar = async function (id) {
  const p = soPost(id); if (!p) return; const nets = smNets(p), st = nets.length ? await smStatus() : null;
  if (st && st.connected) {
    const issues = KS.networks.validateDraft({format: p.format, caption: p.caption, media: p.media}, p.accountIds.map(soAcc).filter(Boolean)); if (KS.networks.hasBlockingIssues(issues)) { toast('A rede recusaria: ' + issues.find(i => i.severity === 'erro').message); return; }
    if (!confirm((st.dry ? 'MODO DE TESTE: nada será enviado à Meta.\n\n' : '') + 'Publicar agora em ' + nets.map(n => soNet(n).label).join(' e ') + '?')) return;
    toast('Publicando…'); try {
      const r = await smQueue(id, true), j = r && r.job; if (!j) throw new Error('sem resposta');
      if (j.status === 'done') { if (j.dry) { toast('Simulação concluída (modo de teste): nada foi enviado à Meta.'); } else { post: { const post = soPost(id); post.status = 'publicado'; post.publishedAt = new Date().toISOString(); post.scheduledFor = null; post.permalinks = Object.entries(j.results || {}).filter(([, v]) => v && v.url).map(([net, v]) => ({net, url: v.url})); soHist(post, post.status, 'publicado', 'publicada pela API da Meta'); smMarkPublished(post.aprovItem); soSave(); } toast('Publicado.'); } }
      else toast('Não saiu: ' + (j.error || j.status) + (j.status === 'queued' ? ' (nova tentativa automática em alguns minutos)' : ''));
    } catch (e) { toast('Meta: ' + e.message); } soRefresh(); return;
  }
  return smBase.pub(id);
};

/* ---------- Contas e dados: conexão com a Meta ---------- */
async function smContasExtra(b) {
  const st = await smStatus(true), box = document.createElement('div'); box.className = 'panel'; box.id = 'smConn'; box.style.marginTop = '12px'; const srv = smSrv();
  const f = (id, l, ph) => `<label class="ins">${l}<input id="${id}" placeholder="${ph}" autocomplete="off"></label>`;
  box.innerHTML = `<div class="section-row"><h3 style="margin:0">Conexão com a Meta (Instagram e Facebook)</h3>${st ? `<span class="pill ${st.connected && !st.dry ? 'ok' : ''}" style="font-size:12px">${st.dry ? 'modo de teste' : st.connected ? 'conectado' : 'não conectado'}</span>` : ''}</div>` +
    (!srv ? '<p class="muted">Precisa do servidor do Studio (PHP) para publicar pela Meta. Sem ele, a publicação segue manual ou por webhook.</p>' : !st ? '<p class="muted">Não consegui falar com o servidor.</p>' : `
    ${st.connected ? `<p style="margin:8px 0"><b>${esc(st.page_name || ('Página ' + st.page_id))}</b>${st.ig_username ? ' · Instagram <b>@' + esc(st.ig_username) + '</b>' : st.ig_id ? ' · Instagram ' + esc(st.ig_id) : ''} <small class="muted">(${st.source === 'chaves' ? 'chaves do servidor' : 'login com o Facebook'})</small></p>` : '<p class="muted" style="margin:8px 0">Conecte para publicar e agendar direto no Instagram e no Facebook. Sem conexão o Studio roda em <b>modo de teste</b> (simula a fila, não envia nada).</p>'}
    ${st.dry && st.connected ? '<p class="so-issue">⚠ META_DRY_RUN ligado: nada é enviado à Meta.</p>' : ''}
    <div class="row-gap" style="flex-wrap:wrap;margin:6px 0">${st.oauth ? '<button class="btn dark" onclick="smOauth()">Entrar com o Facebook</button>' : ''}${st.connected ? '<button class="btn" onclick="smTest()">Testar conexão</button><button class="btn" onclick="smDisconnect()">Desconectar</button><button class="btn" onclick="smSyncAccounts()">Criar as contas aqui</button>' : ''}<button class="btn" onclick="smRunNow()" title="Publica o que já passou da hora">Rodar a fila agora</button></div>
    <div id="smPick"></div>
    <details style="margin-top:8px"><summary class="muted">Conexão manual (token da Página + IDs) e requisitos</summary>
      <div class="ins-row" style="margin-top:8px">${f('smPid', 'ID da Página do Facebook', '1112223334445')}${f('smIg', 'ID da conta do Instagram', '17841400000000')}${f('smTok', 'Token de acesso da Página', 'EAAB…')}<button class="btn sm" onclick="smSaveKeys()">Guardar no servidor</button></div>
      <ul class="muted" style="font-size:12.5px;line-height:1.55"><li>Conta do Instagram <b>profissional</b> (comercial ou criador), ligada a uma <b>Página do Facebook</b>.</li><li>App em developers.facebook.com com as permissões <code>instagram_content_publish</code>, <code>pages_manage_posts</code>, <code>pages_read_engagement</code>, <code>instagram_basic</code>, <code>pages_show_list</code> (a Meta exige revisão do app para contas que não são suas).</li><li>Site em <b>HTTPS</b>: a Meta baixa as imagens do seu servidor (${st.https ? 'ok' : '<b>este endereço não é HTTPS</b>'}).</li><li>O Instagram não agenda pela API: a fila é do Studio e precisa de uma chamada a cada 5 minutos: <code>${esc(st.cronUrl)}</code> (cron do servidor). Limite do Instagram: 100 publicações por 24 horas.</li><li>Reels e vídeo precisam de um arquivo de vídeo público (o Studio ainda não gera vídeo).</li><li>${st.cron ? 'Agendador configurado.' : 'Defina <code>META_CRON_KEY</code> em api/config.php para o agendador.'} ${st.lastRun ? 'Última execução: ' + esc(st.lastRun) + '.' : ''}</li></ul></details>`);
  const old = document.getElementById('smConn'); if (old) old.remove(); if (soUI.tab === 'contas' && $('soBody')) $('soBody').insertBefore(box, $('soBody').firstChild.nextSibling); smPending();
}
async function smPending() { const st = SM.status; if (!st || !st.pending || !$('smPick')) return; try { const r = await api('meta_social.php?action=accounts'); $('smPick').innerHTML = `<div class="panel" style="background:#f7f8fa"><b>Escolha a Página e o Instagram</b>${r.pages.map(x => `<div class="list-item"><div><strong>${esc(x.page_name)}</strong><small>${x.ig_username ? 'Instagram @' + esc(x.ig_username) : 'sem Instagram profissional ligado'}</small></div><button class="btn sm dark" onclick="smSelect('${x.page_id}')">Usar esta</button></div>`).join('')}</div>`; } catch (e) { /* ok */ } }
async function smOauth() { try { const r = await api('meta_social.php?action=oauth_url'); const w = window.open(r.url, 'metaLogin', 'width=640,height=720'); if (!w) { toast('Libere pop-ups para entrar com o Facebook. Endereço de retorno no app da Meta: ' + r.redirect); return; } const h = e => { if (e.data && e.data.metaConnect !== undefined) { window.removeEventListener('message', h); smStatus(true).then(() => renderSocialPage()); } }; window.addEventListener('message', h); } catch (e) { toast(e.message); } }
async function smSelect(pid) { try { await api('meta_social.php', {method: 'POST', body: {action: 'select', page_id: pid}}); toast('Conectado.'); await smStatus(true); await smSyncAccounts(true); renderSocialPage(); } catch (e) { toast(e.message); } }
async function smTest() { try { const r = await api('meta_social.php?action=test'); toast(r.dry ? r.msg : 'Conexão ok: ' + [r.page && 'Página ' + r.page, r.instagram && '@' + r.instagram].filter(Boolean).join(' · ')); } catch (e) { toast(e.message); } }
async function smDisconnect() { if (!confirm('Desconectar a Meta? As publicações já feitas continuam; as agendadas deixam de sair.')) return; try { await api('meta_social.php', {method: 'POST', body: {action: 'disconnect'}}); await smStatus(true); renderSocialPage(); } catch (e) { toast(e.message); } }
async function smRunNow() { try { const r = await api('meta_social.php', {method: 'POST', body: {action: 'run'}}); toast(r.busy ? 'A fila já está rodando.' : r.ran + ' publicação(ões) processada(s).'); await smSync(true); } catch (e) { toast(e.message); } }
async function smSaveKeys() {
  const v = id => (($(id) || {}).value || '').trim(), set = async (name, value) => { if (value) await api('keys.php', {method: 'POST', body: {name, value}}); };
  try { await set('META_PAGE_ID', v('smPid')); await set('META_IG_USER_ID', v('smIg')); await set('META_PAGE_TOKEN', v('smTok')); toast('Guardado no servidor.'); await smStatus(true); await smSyncAccounts(true); renderSocialPage(); } catch (e) { toast(e.message + ' (para guardar chaves pelo app é preciso a senha do Studio ativa)'); }
}
async function smSyncAccounts(quiet) {
  const st = await smStatus(true); if (!st || !st.connected) return; const S = so(); let n = 0;
  const ensure = (net, handle, ext) => { if (!ext && !handle) return; let a = S.accounts.find(x => x.networkId === net && (x.externalId === ext || x.handle.toLowerCase() === handle.toLowerCase())); if (!a) { a = soAddAccount(net, handle); n++; } if (a) { a.origem = 'oauth'; a.externalId = String(ext || ''); } };
  if (st.ig_id) ensure('instagram', st.ig_username ? '@' + st.ig_username : '@instagram', st.ig_id); if (st.page_id) ensure('facebook', st.page_name || 'Página', st.page_id);
  soSave(); if (!quiet) toast(n ? n + ' conta(s) criada(s).' : 'Contas já estão aqui.');
}
