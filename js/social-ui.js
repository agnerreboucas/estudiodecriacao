/* ===== Publicação (Social): hoje · calendário · quadro · nova publicação · caixa · contas e dados ===== */
const soUI = {tab: 'hoje', y: new Date().getFullYear(), m: new Date().getMonth(), day: soToday(), draft: null, drag: '', msg: ''};
const SO_TABS = [['hoje', 'Hoje'], ['calendario', 'Calendário'], ['quadro', 'Quadro'], ['nova', 'Nova publicação'], ['caixa', 'Caixa'], ['contas', 'Contas e dados']];
const SO_MARCA = {aprovar: '#d93025', aguardando: '#e8a317', publicada: '#1e8e3e', rascunho: '#9aa0a6'};
const soEsc = esc;
const soCap = t => t.charAt(0).toUpperCase() + t.slice(1);
const soCh = a => (a || []).map(id => { const x = soAcc(id); return x ? `<span class="so-net" style="background:${soEsc(soNet(x.networkId).color)}" title="${soEsc(soNet(x.networkId).label + ' ' + x.handle)}"></span>` : ''; }).join('');
const soFmt = f => ({a_definir: 'formato a definir', imagem: 'imagem', carrossel: 'carrossel', video: 'vídeo', story: 'story'})[f] || f;
const soWhen = p => { const w = p.publishedAt || p.scheduledFor; return w ? KS.format.formatDateTime(w) : 'sem data'; };

function renderSocialPage() {
  const r = $('publishingRoot'), p = curProject(); if (!r) return; if (!p) { r.innerHTML = noProject('Publicação'); return; }
  soMigrate(); const S = so(), wait = KS.agenda.esperandoAprovacao(S.posts).length;
  r.innerHTML = hubHead('Publicação', 'Planeje, aprove, agende e publique nas redes. Calendário, quadro editorial, prévia e regras de cada rede.', `<button class="btn dark" onclick="soNovo()">＋ Nova publicação</button>`) +
    `<div class="edh-tabs">${SO_TABS.map(([k, l]) => `<button class="edh-tab ${soUI.tab === k ? 'on' : ''}" onclick="soTab('${k}')">${l}${k === 'quadro' && wait ? ` <span class="so-badge">${wait}</span>` : ''}${k === 'caixa' && S.inbox.some(i => i.status === 'pendente') ? ` <span class="so-badge">${S.inbox.filter(i => i.status === 'pendente').length}</span>` : ''}</button>`).join('')}</div><div id="soBody"></div>`;
  ({hoje: soHoje, calendario: soCalendario, quadro: soQuadro, nova: soNova, caixa: soCaixa, contas: soContas})[soUI.tab]($('soBody'), S);
}
function soTab(k) { soUI.tab = k; renderSocialPage(); }
function soNovo(o) { soUI.draft = soDraftFrom(o); soUI.tab = 'nova'; renderSocialPage(); }
const soRefresh = () => { if (ui.page === 'publishingHub') renderSocialPage(); else if (ui.page === 'project') renderProjectTab(); };

/* ---------- Hoje ---------- */
function soPostRow(p, extra) {
  return `<div class="list-item so-row"><div><strong>${soEsc(p.title || p.caption.slice(0, 50) || 'Sem título')}</strong><small>${soCh(p.accountIds)} ${soFmt(p.format)} · ${soWhen(p)} · ${soEsc(KS.format.FASE_LABELS[p.status])}</small></div><div class="row-gap">${extra || ''}<button class="btn sm" onclick="soEdit('${p.id}')">Abrir</button></div></div>`;
}
function soHoje(b, S) {
  const R = KS.agenda.resumirDia(soToday(), S.events, S.posts, S.inbox), fila = KS.agenda.esperandoAprovacao(S.posts);
  const box = (t, n, body) => `<div class="panel"><div class="section-row"><h3>${t}</h3><span class="so-badge">${n}</span></div>${body}</div>`;
  const none = '<p class="muted" style="margin:6px 0">Nada por aqui.</p>';
  b.innerHTML = (S.accounts.length ? '' : `<div class="panel" style="margin-bottom:12px"><h3>Comece cadastrando uma conta</h3><p class="muted">Cadastre os perfis (Instagram, Facebook, TikTok, LinkedIn, YouTube, Threads) em <b>Contas e dados</b> ou carregue os dados de exemplo para conhecer o módulo.</p><div class="row-gap"><button class="btn dark" onclick="soTab('contas')">Cadastrar conta</button><button class="btn" onclick="soExample();renderSocialPage()">Carregar dados de exemplo</button></div></div>`) +
    `<div class="so-grid">${box('Fila de aprovação', fila.length, fila.length ? fila.map(p => soPostRow(p, `<button class="btn sm dark" onclick="soDo('${p.id}','aprovado')">Aprovar</button>`)).join('') : none)}
    ${box('Publica hoje', R.publicaHoje.length, R.publicaHoje.length ? R.publicaHoje.map(p => soPostRow(p, `<button class="btn sm" onclick="soPublicar('${p.id}')">Publicar</button>`)).join('') : none)}
    ${box('Em produção com prazo', R.produzindo.length, R.produzindo.length ? R.produzindo.map(p => soPostRow(p)).join('') : none)}
    ${box('Compromissos de hoje', R.eventos.length, R.eventos.length ? R.eventos.map(e => `<div class="list-item"><div><strong>${soEsc(e.titulo)}</strong><small>${KS.format.TIPO_DE_EVENTO_LABELS[e.tipo]} · ${KS.format.formatDateTime(e.comecaEm)}${e.local ? ' · ' + soEsc(e.local) : ''}</small></div></div>`).join('') : none)}
    ${box('Já publicadas hoje', R.publicadas.length, R.publicadas.length ? R.publicadas.map(p => soPostRow(p)).join('') : none)}
    ${box('Conversas sem resposta', R.conversasPendentes, R.conversasPendentes ? `<p style="font-size:13px">${R.conversasPendentes} comentário(s)/mensagem(ns) esperando resposta.</p><button class="btn sm" onclick="soTab('caixa')">Abrir a caixa</button>` : none)}</div>`;
}
/* ação de fluxo com mensagem de motivo */
function soDo(id, to) { const r = soMove(id, to); if (!r.ok) toast(r.msg); else toast('Peça movida para “' + KS.format.FASE_LABELS[to] + '”.'); soRefresh(); }

/* ---------- Calendário ---------- */
function soCalendario(b, S) {
  const dias = KS.agenda.gradeDoMes(soUI.y, soUI.m), map = KS.agenda.distribuirPorDia(S.events, S.posts), hoje = soToday();
  const cell = d => { const its = (map.get(d) || []).slice().sort((a, c) => (a.papel === 'evento' ? a.evento.comecaEm : a.post.publishedAt || a.post.scheduledFor || '').localeCompare(c.papel === 'evento' ? c.evento.comecaEm : c.post.publishedAt || c.post.scheduledFor || ''));
    return `<div class="so-day ${d === hoje ? 'today' : ''} ${d === soUI.day ? 'sel' : ''} ${new Date(d + 'T12:00').getMonth() !== soUI.m ? 'out' : ''}" onclick="soUI.day='${d}';renderSocialPage()"><b>${+d.slice(8)}</b>${its.slice(0, 3).map(i => i.papel === 'evento' ? `<span class="so-chip" style="border-color:#4c6ef5">◆ ${soEsc(i.evento.titulo.slice(0, 16))}</span>` : `<span class="so-chip" style="border-color:${SO_MARCA[KS.agenda.marcaDaPeca(i.post)]}">${soEsc((i.post.title || i.post.caption || soFmt(i.post.format)).slice(0, 16))}</span>`).join('')}${its.length > 3 ? `<small class="muted">+${its.length - 3}</small>` : ''}</div>`; };
  const its = KS.agenda.itensDoDia(soUI.day, S.events, S.posts);
  b.innerHTML = `<div class="panel"><div class="section-row"><div class="row-gap"><button class="btn sm" onclick="soMes(-1)">‹</button><h3 style="margin:0">${soCap(KS.agenda.nomeDoMes(soUI.m))} de ${soUI.y}</h3><button class="btn sm" onclick="soMes(1)">›</button><button class="btn sm" onclick="soUI.y=new Date().getFullYear();soUI.m=new Date().getMonth();soUI.day=soToday();renderSocialPage()">Hoje</button></div>
    <div class="so-leg">${Object.entries(KS.agenda.ROTULO_DA_MARCA).map(([k, l]) => `<span><i style="background:${SO_MARCA[k]}"></i>${l}</span>`).join('')}<span><i style="background:#4c6ef5"></i>Compromisso</span></div></div>
    <div class="so-cal"><div class="so-dow">${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(x => `<span>${x}</span>`).join('')}</div><div class="so-days">${dias.map(cell).join('')}</div></div></div>
    <div class="panel" style="margin-top:12px"><div class="section-row"><h3>${soCap(KS.agenda.tituloDoDia(soUI.day))}</h3><div class="row-gap"><button class="btn sm" onclick="soEventoModal()">＋ Compromisso</button><button class="btn sm dark" onclick="soNovo({day:'${soUI.day}'})">＋ Publicação neste dia</button></div></div>
    ${its.length ? its.map(i => i.papel === 'evento' ? `<div class="list-item"><div><strong>◆ ${soEsc(i.evento.titulo)}</strong><small>${KS.format.TIPO_DE_EVENTO_LABELS[i.evento.tipo]} · ${KS.format.formatDateTime(i.evento.comecaEm)}${i.evento.local ? ' · ' + soEsc(i.evento.local) : ''}</small></div><button class="btn sm" onclick="soEventoDel('${i.evento.id}')">Excluir</button></div>` : soPostRow(i.post, `<span class="so-dot" style="background:${SO_MARCA[KS.agenda.marcaDaPeca(i.post)]}" title="${soEsc(KS.agenda.ROTULO_DA_MARCA[KS.agenda.marcaDaPeca(i.post)])}"></span>`)).join('') : '<p class="muted">Nada neste dia.</p>'}</div>`;
}
function soMes(d) { soUI.m += d; if (soUI.m < 0) { soUI.m = 11; soUI.y--; } if (soUI.m > 11) { soUI.m = 0; soUI.y++; } renderSocialPage(); }
function soEventoModal() {
  showModal('Compromisso', `<div class="form-grid"><div class="field full"><label>Título</label><input id="evT" placeholder="Ex.: Gravação de bastidores"></div><div class="field"><label>Tipo</label><select id="evTp">${Object.entries(KS.format.TIPO_DE_EVENTO_LABELS).map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></div><div class="field"><label>Data</label><input id="evD" type="date" value="${soUI.day}"></div><div class="field"><label>Hora</label><input id="evH" type="time" value="10:00"></div><div class="field"><label>Local</label><input id="evL"></div></div><div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="soEventoSave()">Salvar</button></div>`);
}
function soEventoSave() { const t = $('evT').value.trim(); if (!t) { toast('Dê um título.'); return; } so().events.push({id: uid('ev'), projectId: curProject().id, titulo: t, descricao: null, tipo: $('evTp').value, comecaEm: soLocalISO($('evD').value, $('evH').value) || new Date().toISOString(), terminaEm: null, diaInteiro: false, local: $('evL').value.trim() || null, municipioCodigo: null, responsavel: SOCIAL_ME, postIds: [], origem: 'manual', criadoPor: SOCIAL_ME, criadoEm: new Date().toISOString()}); soSave(); closeModal(); renderSocialPage(); }
function soEventoDel(id) { const S = so(); S.events = S.events.filter(e => e.id !== id); soSave(); renderSocialPage(); }

/* ---------- Quadro (Kanban) ---------- */
function soQuadro(b, S) {
  const cols = KS.agenda.montarQuadro(S.posts);
  b.innerHTML = `<small class="muted block" style="margin-bottom:8px">Arraste as peças entre as colunas. O quadro segue o fluxo editorial e explica quando um movimento não é permitido.</small><div class="so-kb">${cols.map(c => `<div class="so-col" ondragover="event.preventDefault()" ondrop="soDrop('${c.fase}')"><h4>${KS.format.FASE_LABELS[c.fase]} <span class="so-badge">${c.posts.length}</span></h4>${c.posts.map(p => {
    const nxt = ['aguardando_aprovacao', 'aprovado', 'agendado', 'publicado'].filter(s => KS.agenda.podeMoverPara(p.status, s));
    return `<div class="so-card" draggable="true" ondragstart="soUI.drag='${p.id}'"><div class="so-thumb" style="background:${p.coverGradient || '#ddd'}"></div><div><strong onclick="soEdit('${p.id}')" style="cursor:pointer">${soEsc(p.title || p.caption.slice(0, 40) || 'Sem título')}</strong><small class="muted block">${soCh(p.accountIds)} ${soFmt(p.format)} · ${soWhen(p)}</small>${p.format === 'a_definir' ? '<small class="so-warn">Escolha o formato</small>' : ''}<div class="row-gap" style="margin-top:4px;flex-wrap:wrap">${nxt.slice(0, 1).map(s => `<button class="btn sm" onclick="soDo('${p.id}','${s}')">→ ${KS.format.FASE_LABELS[s]}</button>`).join('')}</div></div></div>`; }).join('') || '<small class="muted">Vazio</small>'}</div>`).join('')}</div>`;
}
function soDrop(fase) { const id = soUI.drag; soUI.drag = ''; if (!id) return; const r = soMove(id, fase); if (!r.ok) toast(r.msg); renderSocialPage(); }

/* ---------- Nova publicação / editar ---------- */
function soDraftFrom(o) {
  o = o || {}; const S = so(), p = o.id ? soPost(o.id) : null;
  if (p) { const w = p.scheduledFor || p.publishedAt || ''; return {id: p.id, title: p.title, caption: p.caption, format: p.format, accountIds: p.accountIds.slice(), media: Object.assign({}, p.media), scheduledDate: w ? soDay(w) : '', scheduledTime: w ? new Date(w).toTimeString().slice(0, 5) : '09:00', requiresApproval: p.requiresApproval, setId: p.setId, creativeId: p.creativeId, status: p.status}; }
  return {id: '', title: '', caption: '', format: 'imagem', accountIds: S.accounts.slice(0, 1).map(a => a.id), media: Object.assign({}, KS.networks.MIDIA_PADRAO.imagem), scheduledDate: o.day || '', scheduledTime: '09:00', requiresApproval: true, setId: o.setId || '', creativeId: '', status: 'rascunho'};
}
function soEdit(id) { soUI.draft = soDraftFrom({id}); soUI.tab = 'nova'; renderSocialPage(); }
function soDraftPost() { const d = soUI.draft; return {format: d.format, caption: d.caption, media: d.media, scheduledFor: soLocalISO(d.scheduledDate, d.scheduledTime), publishedAt: null, id: 'prev', coverGradient: soGrad(0)}; }
function soNova(b, S) {
  if (!soUI.draft) soUI.draft = soDraftFrom(); const d = soUI.draft, accs = d.accountIds.map(soAcc).filter(Boolean), p = curProject();
  const issues = accs.length ? KS.networks.validateDraft({format: d.format, caption: d.caption, media: d.media}, accs) : [], avisos = KS.previa.avisosDaPrevia({legenda: d.caption, media: d.media, formato: d.format});
  const cut = KS.previa.cortarLegenda(d.caption), pieces = KS.previa.pedacosDaLegenda(cut.visivel);
  const colors = {hashtag: '#1d4ed8', mencao: '#1d4ed8', link: '#1d4ed8', texto: 'inherit'};
  const sets = p.design.sets, creatives = (state.creatives || []).filter(c => c.projectId === p.id);
  b.innerHTML = `<div class="so-compose"><div class="panel">
    <div class="section-row"><h3>${d.id ? 'Editar publicação' : 'Nova publicação'}</h3>${d.id ? `<small class="muted">${soEsc(KS.format.FASE_LABELS[d.status] || '')}</small>` : ''}</div>
    <div class="field"><label>Título interno</label><input value="${soEsc(d.title)}" oninput="soUI.draft.title=this.value" placeholder="Ex.: Carrossel — antes de assinar"></div>
    <div class="field"><label>Contas de destino</label>${S.accounts.length ? `<div class="tchips" style="justify-content:flex-start">${S.accounts.map(a => `<button class="tchip ${d.accountIds.includes(a.id) ? 'on' : ''}" onclick="soTog('${a.id}')">${soCh([a.id])} ${soEsc(soNet(a.networkId).label)} ${soEsc(a.handle)}</button>`).join('')}</div>` : '<small class="muted">Nenhuma conta. <a href="#" onclick="soTab(\'contas\');return false">Cadastre uma conta</a>.</small>'}</div>
    <div class="ins-row"><label class="ins">Trazer de Carrosséis<select onchange="soFromCarousel(this.value)"><option value="">— escolher carrossel —</option>${p.carousels.map(c => `<option value="${c.id}">${soEsc(c.name)} (${c.slides} slides)</option>`).join('')}</select></label></div>
    <div class="ins-row"><label class="ins">Trazer do Editor de Design<select onchange="soFromSet(this.value)"><option value="">— escolher peça —</option>${sets.map(s => `<option value="${s.id}" ${d.setId === s.id ? 'selected' : ''}>${soEsc(s.name)} (${s.slides.length} slide${s.slides.length > 1 ? 's' : ''})</option>`).join('')}</select></label>
    <label class="ins">Trazer texto de uma criação<select onchange="soFromCreative(this.value)"><option value="">— escolher —</option>${creatives.map(c => `<option value="${c.id}">${soEsc(c.title)}</option>`).join('')}</select></label></div>
    <div class="ins-row"><label class="ins">Formato<select onchange="soFmtSet(this.value)">${['imagem', 'carrossel', 'video', 'story', 'a_definir'].map(f => `<option value="${f}" ${d.format === f ? 'selected' : ''}>${soFmt(f)}</option>`).join('')}</select></label>
    <label class="ins">Proporção<select onchange="soUI.draft.media.aspectRatio=this.value;renderSocialPage()">${['1:1', '4:5', '9:16', '16:9'].map(a => `<option ${d.media.aspectRatio === a ? 'selected' : ''}>${a}</option>`).join('')}</select></label>
    <label class="ins">Itens<input type="number" min="1" max="20" value="${d.media.count}" onchange="soUI.draft.media.count=+this.value||1;renderSocialPage()" style="width:60px"></label>
    ${d.format === 'video' ? `<label class="ins">Duração (s)<input type="number" min="1" value="${d.media.durationSeconds || 30}" onchange="soUI.draft.media.durationSeconds=+this.value||1;renderSocialPage()" style="width:70px"></label>` : ''}</div>
    <div class="field"><label>Legenda <small class="muted">${d.caption.length} caracteres</small></label><textarea rows="7" oninput="soCaption(this.value)" placeholder="Escreva a legenda. O feed corta no “mais”.">${soEsc(d.caption)}</textarea></div>
    <div class="ins-row"><label class="ins">Data<input type="date" value="${d.scheduledDate}" onchange="soUI.draft.scheduledDate=this.value"></label><label class="ins">Hora<input type="time" value="${d.scheduledTime}" onchange="soUI.draft.scheduledTime=this.value"></label><label class="ins inl"><input type="checkbox" ${d.requiresApproval ? 'checked' : ''} onchange="soUI.draft.requiresApproval=this.checked"> exige aprovação</label></div>
    <div class="row-gap" style="flex-wrap:wrap;margin-top:8px"><button class="btn" onclick="soSaveDraft('ideia')">Salvar como ideia</button><button class="btn" onclick="soSaveDraft('rascunho')">Salvar rascunho</button><button class="btn dark" onclick="soSaveDraft('aguardando_aprovacao')">Enviar para aprovação</button>${d.id ? `<button class="btn" onclick="soSaveDraft('agendado')">Agendar</button><button class="btn" onclick="soDelAsk('${d.id}')">Excluir</button>` : ''}</div>
    ${d.id && soPost(d.id) && soPost(d.id).history.length ? `<details style="margin-top:8px"><summary class="muted">Histórico</summary>${soPost(d.id).history.slice().reverse().map(h => `<small class="block muted">${KS.format.formatDateTime(h.at)} · ${soEsc(h.by)}: ${soEsc(KS.format.FASE_LABELS[h.from] || h.from)} → ${soEsc(KS.format.FASE_LABELS[h.to] || h.to)}</small>`).join('')}</details>` : ''}</div>
  <div><div class="panel"><h3>Prévia no feed</h3><div class="so-phone"><div class="so-ph-head">${accs[0] ? soCh([accs[0].id]) + ' <b>' + soEsc(accs[0].handle) + '</b>' : '<b>@conta</b>'}</div><canvas id="soCv" class="so-cv" width="320" height="${Math.round(320 / KS.previa.razaoDaProporcao(d.media.aspectRatio))}"></canvas>
    <div class="so-cap">${cut.visivel ? `<b>${soEsc((accs[0] || {handle: '@conta'}).handle)}</b> ${pieces.map(x => `<span style="color:${colors[x.tipo]}">${soEsc(x.texto)}</span>`).join('')}${cut.cortada ? ' <span class="muted">… mais</span>' : ''}` : '<span class="muted">Sem legenda</span>'}</div></div></div>
    <div class="panel" style="margin-top:12px"><h3>Vai sair como você quer?</h3>${[...issues.map(i => ({t: i.severity === 'erro' ? 'erro' : 'aviso', m: `${soNet(i.networkId).label}: ${i.message}`})), ...avisos.map(a => ({t: a.gravidade === 'erro' ? 'erro' : 'aviso', m: a.mensagem}))].map(x => `<div class="so-issue ${x.t}">${x.t === 'erro' ? '⛔' : '⚠'} ${soEsc(x.m)}</div>`).join('') || '<small class="muted">Sem problemas encontrados.</small>'}</div>
    <div class="panel" style="margin-top:12px"><h3>Grade do perfil</h3><div class="so-grid9">${KS.previa.gradeDoPerfil([...S.posts.filter(x => x.id !== d.id), Object.assign(soDraftPost(), {caption: d.caption, id: 'prev'})].map(x => x.id === 'prev' ? Object.assign(x, {scheduledFor: x.scheduledFor || new Date(Date.now() + 864e5).toISOString()}) : x)).map(g => `<div class="so-g ${g.id === 'prev' ? 'me' : ''} ${g.futura ? 'fut' : ''}" style="background:${g.id === 'prev' ? soGrad(0) : g.coverGradient || '#ddd'}" title="${soEsc(g.trecho)}"></div>`).join('')}</div><small class="muted block">A peça nova aparece no topo, com contorno.</small></div></div></div>`;
  soPaintCover();
}
function soTog(id) { const d = soUI.draft, i = d.accountIds.indexOf(id); if (i >= 0) d.accountIds.splice(i, 1); else d.accountIds.push(id); renderSocialPage(); }
const soCaptionSoon = debounce(() => renderSocialPage(), 450);
function soCaption(v) { soUI.draft.caption = v; soCaptionSoon(); }
function soFmtSet(f) { const d = soUI.draft; d.format = f; const m = KS.networks.MIDIA_PADRAO[f]; if (m) d.media = Object.assign({}, m, f === 'carrossel' ? {count: Math.max(2, d.media.count)} : {}); renderSocialPage(); }
function soFromSet(id) {
  const d = soUI.draft; d.setId = id; const s = so() && curProject().design.sets.find(x => x.id === id); if (!s) { renderSocialPage(); return; }
  const r = s.format.w / s.format.h, ar = r > 1.3 ? '16:9' : r > 0.9 ? '1:1' : r > 0.7 ? '4:5' : '9:16'; d.media.aspectRatio = ar; d.media.count = s.slides.length;
  d.format = ar === '9:16' && s.slides.length <= 3 ? 'story' : s.slides.length > 1 ? 'carrossel' : 'imagem'; if (!d.title) d.title = s.name; renderSocialPage();
}
/* carrossel do estúdio → peça do Editor de Design (id estável, refeita a cada vez) → publicação */
async function soFromCarousel(id) {
  const p = curProject(), c = p.carousels.find(x => x.id === id); if (!c) return; toast('Montando o carrossel…');
  try {
    const {set} = carMake(c, {final: true}); await ensureFonts(lyFamilies(set.tk)); await brandFontsLoad(p); await ensureSetResources(set); set.id = 'ds_' + c.id; set.name = c.name + ' · carrossel';
    const at = p.design.sets.findIndex(x => x.id === set.id); if (at >= 0) p.design.sets[at] = set; else p.design.sets.push(set); persist();
    const d = soUI.draft; if (!d.caption) d.caption = carPubText(c); soFromSet(set.id);
  } catch (e) { toast('Não consegui montar o carrossel: ' + e.message); }
}
function soFromCreative(id) { const c = (state.creatives || []).find(x => x.id === id); if (!c) return; const d = soUI.draft; d.creativeId = id; if (!d.title) d.title = c.title; if (!d.caption) d.caption = c.copy || c.brief || ''; renderSocialPage(); }
async function soPaintCover() {
  const cv = $('soCv'), d = soUI.draft; if (!cv) return; const x = cv.getContext('2d'), s = d.setId && curProject().design.sets.find(y => y.id === d.setId);
  x.fillStyle = '#e9e9ee'; x.fillRect(0, 0, cv.width, cv.height);
  if (!s) { x.fillStyle = '#9aa0a6'; x.font = '14px sans-serif'; x.textAlign = 'center'; x.fillText('Escolha uma peça do Editor de Design', cv.width / 2, cv.height / 2); return; }
  try { await ensureSetResources(s); const sl = s.slides[0], sc = Math.min(cv.width / s.format.w, cv.height / s.format.h); x.save(); x.translate((cv.width - s.format.w * sc) / 2, (cv.height - s.format.h * sc) / 2); renderSlide(x, sl, s.format.w, s.format.h, sc); x.restore(); } catch (e) { /* sem prévia */ }
}
function soSaveDraft(to) {
  const d = soUI.draft; if (!d.accountIds.length) { toast('Escolha ao menos uma conta de destino.'); return; }
  const S = so(); let p = d.id ? soPost(d.id) : null; const when = soLocalISO(d.scheduledDate, d.scheduledTime);
  if (!p) p = soNewPost({}); const from = p.status;
  Object.assign(p, {title: d.title, caption: d.caption, format: d.format, accountIds: d.accountIds.slice(), media: Object.assign({}, d.media), requiresApproval: d.requiresApproval, setId: d.setId, creativeId: d.creativeId, scheduledFor: p.status === 'publicado' ? null : when});
  if (p.status === 'publicado') { soSave(); toast('Peça publicada atualizada.'); soUI.draft = null; soUI.tab = 'quadro'; renderSocialPage(); return; }
  if (!d.id) { p.status = to === 'agendado' ? 'rascunho' : to === 'ideia' ? 'ideia' : 'rascunho'; soHist(p, '', p.status, 'criada'); } soSave();
  if (to !== p.status) { const r = soMove(p.id, to === 'agendado' && p.requiresApproval && !p.approvedBy ? 'aprovado' : to); if (!r.ok) { toast('Salvo como ' + KS.format.FASE_LABELS[p.status] + '. ' + r.msg); } else if (to === 'agendado') { const r2 = soMove(p.id, 'agendado'); if (!r2.ok) toast(r2.msg); } }
  else if (from !== p.status) soHist(p, from, p.status);
  soSave(); soUI.draft = null; soUI.tab = 'quadro'; renderSocialPage(); toast('Publicação salva.');
}
function soDelAsk(id) { if (!confirm('Excluir esta publicação?')) return; soDelete(id); soUI.draft = null; soUI.tab = 'quadro'; renderSocialPage(); }
/* publicar: dispara a automação (webhook n8n/Make) quando existe; senão orienta a publicar à mão e marcar como publicada */
async function soPublicar(id) {
  const p = soPost(id); if (!p) return; const issues = KS.networks.validateDraft({format: p.format, caption: p.caption, media: p.media}, p.accountIds.map(soAcc).filter(Boolean));
  if (KS.networks.hasBlockingIssues(issues)) { toast('A rede recusaria: ' + issues.find(i => i.severity === 'erro').message); return; }
  const wh = canUseApi() && API.status.webhook && API.status.webhook.configured;
  if (wh) { try { await sendWebhook('publicar', {postId: p.id, titulo: p.title, legenda: p.caption, formato: p.format, contas: p.accountIds.map(soAcc).map(a => ({rede: a.networkId, handle: a.handle})), agendadoPara: p.scheduledFor}); toast('Enviado à automação (webhook).'); } catch (e) { toast('Webhook: ' + e.message); return; } }
  if (confirm((wh ? 'Marcar como publicada agora?' : 'Sem webhook configurado: publique na rede e depois confirme aqui.\n\nMarcar como publicada?'))) { p.status = p.status === 'publicado' ? p.status : 'publicado'; p.publishedAt = p.publishedAt || new Date().toISOString(); p.scheduledFor = null; soHist(p, 'agendado', 'publicado'); soSave(); soRefresh(); }
}

/* ---------- Caixa (comentários e mensagens) ---------- */
function soCaixa(b, S) {
  const C = KS.atencao.medirConversas(S.inbox), list = S.inbox.slice().sort((a, c) => (a.status === c.status ? c.receivedAt.localeCompare(a.receivedAt) : a.status === 'pendente' ? -1 : 1));
  b.innerHTML = `<div class="so-grid" style="margin-bottom:10px"><div class="panel"><small class="muted">Recebidas</small><h2 style="margin:2px 0">${C.recebidas}</h2></div><div class="panel"><small class="muted">Sem resposta</small><h2 style="margin:2px 0">${C.pendentes}</h2></div><div class="panel"><small class="muted">Taxa de resposta</small><h2 style="margin:2px 0">${KS.format.formatPercent(C.taxaDeResposta)}</h2></div></div>
  <div class="panel"><div class="section-row"><h3>Conversas</h3><button class="btn sm dark" onclick="soInboxModal()">＋ Registrar</button></div><small class="muted block" style="margin-bottom:6px">Hoje a caixa é preenchida à mão ou por importação. A leitura automática do Instagram/Facebook entra com a conexão da Meta.</small>
  ${list.length ? list.map(i => { const po = i.postId && soPost(i.postId); return `<div class="list-item"><div><strong>${soEsc(i.authorName || i.authorHandle)} <small class="muted">${soEsc(i.authorHandle)} · ${i.kind === 'mensagem' ? 'mensagem' : 'comentário'} · ${soEsc({nao_seguidor: 'não seguidor', seguidor: 'seguidor', apoiador: 'apoiador', defensor: 'defensor'}[i.relacao])}</small></strong><small class="block" style="white-space:normal;color:#222">${soEsc(i.text)}</small>${po ? `<small class="muted block">Em: ${soEsc(po.title || po.caption.slice(0, 40))}</small>` : ''}${i.replies.map(r => `<small class="block muted">↳ ${soEsc(r.author)}: ${soEsc(r.text)}</small>`).join('')}</div><div class="row-gap">${i.status === 'pendente' ? `<button class="btn sm dark" onclick="soResp('${i.id}')">Responder</button>` : '<span class="so-badge ok">respondido</span>'}<button class="btn sm" onclick="soInboxDel('${i.id}')">×</button></div></div>`; }).join('') : '<p class="muted">Sem conversas registradas.</p>'}</div>`;
}
function soInboxModal() {
  const S = so(); showModal('Registrar conversa', `<div class="form-grid"><div class="field"><label>Conta</label><select id="inA">${S.accounts.map(a => `<option value="${a.id}">${soEsc(a.handle)}</option>`).join('')}</select></div><div class="field"><label>Tipo</label><select id="inK"><option value="comentario">Comentário</option><option value="mensagem">Mensagem direta</option></select></div><div class="field"><label>@ da pessoa</label><input id="inH" placeholder="@pessoa"></div><div class="field"><label>Relação</label><select id="inR"><option value="nao_seguidor">Não seguidor</option><option value="seguidor" selected>Seguidor</option><option value="apoiador">Apoiador</option><option value="defensor">Defensor</option></select></div><div class="field full"><label>Texto</label><textarea id="inT" rows="3"></textarea></div><div class="field full"><label>Publicação de origem</label><select id="inP"><option value="">— nenhuma —</option>${S.posts.filter(x => x.status === 'publicado').map(x => `<option value="${x.id}">${soEsc(x.title || x.caption.slice(0, 40))}</option>`).join('')}</select></div></div><div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="soInboxSave()">Salvar</button></div>`);
}
function soInboxSave() { const S = so(), t = $('inT').value.trim(); if (!t || !S.accounts.length) { toast(S.accounts.length ? 'Escreva o texto.' : 'Cadastre uma conta antes.'); return; } const h = $('inH').value.trim() || '@pessoa'; S.inbox.push({id: uid('in'), accountId: $('inA').value, kind: $('inK').value, authorHandle: h, authorName: h.replace(/^@/, ''), avatarGradient: soGrad(S.inbox.length), text: t, postId: $('inP').value || null, receivedAt: new Date().toISOString(), status: 'pendente', assignedTo: null, replies: [], relacao: $('inR').value, interacoes: 1}); soSave(); closeModal(); renderSocialPage(); }
function soResp(id) { askText('Responder', 'Sua resposta (fica registrada; envie na rede se ainda não enviou)', v => { const i = so().inbox.find(x => x.id === id); i.replies.push({id: uid('r'), author: SOCIAL_ME, text: v, sentAt: new Date().toISOString()}); i.status = 'respondido'; soSave(); renderSocialPage(); }); }
function soInboxDel(id) { const S = so(); S.inbox = S.inbox.filter(i => i.id !== id); soSave(); renderSocialPage(); }

/* ---------- Contas e dados ---------- */
function soContas(b, S) {
  const nets = Object.values(KS.networks.NETWORKS);
  b.innerHTML = `<div class="panel"><div class="section-row"><h3>Contas</h3></div>${S.accounts.length ? S.accounts.map(a => `<div class="list-item"><div><strong>${soCh([a.id])} ${soEsc(soNet(a.networkId).label)} · ${soEsc(a.handle)}</strong><small>${a.origem === 'demonstracao' ? 'exemplo' : a.origem === 'oauth' ? 'conectada por OAuth' : 'acompanhamento manual'} · desde ${KS.format.formatDay(a.trackingSince)}</small></div><button class="btn sm" onclick="soAccDel('${a.id}')">Remover</button></div>`).join('') : '<p class="muted">Nenhuma conta.</p>'}
    <div class="row-gap" style="margin-top:10px;flex-wrap:wrap"><select id="acN">${nets.map(n => `<option value="${n.id}">${n.label}</option>`).join('')}</select><input id="acH" placeholder="@usuario" style="flex:1"><button class="btn dark" onclick="soAccAdd()">Adicionar conta</button></div>
    <small class="muted block" style="margin-top:6px">As contas são de acompanhamento: o Studio valida e organiza as publicações, e a saída é por automação (webhook) ou manual. A conexão direta com a Meta (login oficial por OAuth) é a próxima etapa e exige a revisão de app da Meta.</small></div>
  <div class="panel" style="margin-top:12px"><h3>Dados de exemplo</h3><p class="muted" style="font-size:12.5px">Carrega duas contas, 14 publicações com métricas, impulsionamentos, conversas e 120 dias de histórico para você explorar o módulo. Dá para remover tudo depois.</p><div class="row-gap">${S.example ? '<button class="btn" onclick="soExampleClear();renderSocialPage();toast(\'Exemplo removido.\')">Remover dados de exemplo</button>' : '<button class="btn dark" onclick="soExample();renderSocialPage()">Carregar dados de exemplo</button>'}</div></div>`;
}
function soAccAdd() { const h = $('acH').value.trim(); if (!h) { toast('Informe o @ do perfil.'); return; } soAddAccount($('acN').value, h); renderSocialPage(); }
function soAccDel(id) { if (!confirm('Remover a conta? As publicações continuam, sem esta conta.')) return; const S = so(); S.accounts = S.accounts.filter(a => a.id !== id); S.posts.forEach(p => { p.accountIds = p.accountIds.filter(x => x !== id); }); delete S.metrics[id]; soSave(); renderSocialPage(); }
