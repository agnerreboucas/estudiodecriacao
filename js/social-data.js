/* ===== Social (kit-social): dados do projeto + regras. As regras vêm de KS (js/kit-social.js, gerado do kit TypeScript);
   aqui só guardamos, validamos e ligamos ao resto do Studio. Nada fala com as redes: a publicação sai por webhook (n8n/Make)
   ou à mão, e os números entram por importação ou digitação, até a conexão OAuth da Meta existir. ===== */
const SOCIAL_ME = 'Você';
function so() { const p = curProject(); if (!p) return null; if (!p.social || !Array.isArray(p.social.posts)) p.social = normalizeSocial(p.social); return p.social; }
const soSave = () => persist();
const soPost = id => so().posts.find(p => p.id === id);
const soAcc = id => so().accounts.find(a => a.id === id);
const soNet = id => KS.networks.NETWORKS[id] || {label: id, color: '#888', gradient: '#888'};
const soDay = d => { const x = d instanceof Date ? d : new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
const soToday = () => soDay(new Date());
const soLocalISO = (dt, tm) => dt ? `${dt}T${tm || '09:00'}:00${(() => { const o = -new Date().getTimezoneOffset(), s = o >= 0 ? '+' : '-', a = Math.abs(o); return s + String(Math.floor(a / 60)).padStart(2, '0') + ':' + String(a % 60).padStart(2, '0'); })()}` : null;
const soGrad = i => ['linear-gradient(135deg,#ff9a56,#d6336c)', 'linear-gradient(135deg,#4facfe,#00c6ff)', 'linear-gradient(135deg,#43e97b,#38b2ac)', 'linear-gradient(135deg,#a18cd1,#fbc2eb)', 'linear-gradient(135deg,#f6d365,#fda085)', 'linear-gradient(135deg,#232526,#5f6368)'][i % 6];

function soAddAccount(networkId, handle) {
  const S = so(), net = soNet(networkId), h = String(handle || '').trim(); if (!h) return null;
  const a = {id: uid('ac'), projectId: curProject().id, networkId, handle: h.startsWith('@') || networkId === 'youtube' ? h : '@' + h, displayName: h.replace(/^@/, ''), status: 'ativa', origem: 'manual', adAccountConnected: false, trackingSince: soToday(), tokenExpiresAt: null, lastSyncAt: null, messagingApproved: false, avatarGradient: net.gradient};
  S.accounts.push(a); soSave(); return a;
}
function soNewPost(o) {
  const S = so(), f = o.format || 'a_definir', m = KS.networks.MIDIA_PADRAO[f] || {count: 1, aspectRatio: '4:5', fileSizeMb: 2};
  const p = Object.assign({id: uid('po'), projectId: curProject().id, accountIds: [], format: f, caption: '', title: '', media: Object.assign({}, m), status: 'rascunho', scheduledFor: null, publishedAt: null, createdBy: SOCIAL_ME, approvedBy: null, requiresApproval: true, metrics: null, coverGradient: soGrad(S.posts.length), setId: '', creativeId: '', pubId: '', history: []}, o);
  S.posts.push(p); return p;
}
function soHist(p, from, to, note) { p.history = (p.history || []).concat({at: new Date().toISOString(), by: SOCIAL_ME, from, to, note: note || ''}).slice(-30); }
/* mover no quadro: as regras (o que pode e o motivo) são do kit */
function soMove(id, to) {
  const p = soPost(id); if (!p) return {ok: false, msg: 'Peça não encontrada.'};
  if (p.status === to) return {ok: true};
  if (!KS.agenda.podeMoverPara(p.status, to)) return {ok: false, msg: `De “${KS.format.FASE_LABELS[p.status]}” não dá para ir direto a “${KS.format.FASE_LABELS[to]}”. Siga o fluxo: ideia → produção → revisão → aprovado → agendado → publicado.`};
  const why = KS.agenda.motivoParaNaoAvancar(p, to); if (why) return {ok: false, msg: why};
  if (to === 'agendado' && !p.scheduledFor) return {ok: false, msg: 'Defina a data e a hora de publicação antes de agendar.'};
  if (to === 'aprovado' || to === 'agendado' || to === 'publicado') { const issues = KS.networks.validateDraft({format: p.format, caption: p.caption, media: p.media}, p.accountIds.map(soAcc).filter(Boolean)); if (KS.networks.hasBlockingIssues(issues) && to !== 'publicado') return {ok: false, msg: 'A rede recusaria esta peça: ' + issues.find(i => i.severity === 'erro').message}; }
  const from = p.status; p.status = to; if (to === 'aprovado') p.approvedBy = SOCIAL_ME; if (to === 'publicado' && !p.publishedAt) { p.publishedAt = new Date().toISOString(); p.scheduledFor = null; } soHist(p, from, to); soSave(); return {ok: true};
}
function soDelete(id) { const S = so(); S.posts = S.posts.filter(p => p.id !== id); S.boosts = S.boosts.filter(b => b.postId !== id); S.inbox.forEach(i => { if (i.postId === id) i.postId = null; }); soSave(); }

/* publicações antigas (calendário da aba Publicação) entram no quadro uma única vez */
function soMigrate() {
  const S = so(), p = curProject(); if (!S || S.migrated) return; S.migrated = true;
  (p.publications || []).forEach(x => {
    if (S.posts.some(q => q.pubId === x.id)) return; const c = (state.creatives || []).find(y => y.id === x.creativeId), done = x.status === 'Publicado';
    const ch = String(x.channel || '').toLowerCase(), net = /insta/.test(ch) ? 'instagram' : /face/.test(ch) ? 'facebook' : /tik/.test(ch) ? 'tiktok' : /linked/.test(ch) ? 'linkedin' : /you/.test(ch) ? 'youtube' : 'instagram';
    let acc = S.accounts.find(a => a.networkId === net); if (!acc) acc = soAddAccount(net, (net === 'instagram' ? '@' : '') + slug(p.name || 'conta'));
    const when = x.date ? soLocalISO(String(x.date).slice(0, 10), '09:00') : null;
    soNewPost({title: x.title || (c && c.title) || 'Publicação', caption: x.caption || '', accountIds: acc ? [acc.id] : [], format: /carrossel/i.test(c && c.type || '') ? 'carrossel' : /stor/i.test(c && c.type || '') ? 'story' : /v[ií]deo/i.test(c && c.type || '') ? 'video' : 'imagem', status: done ? 'publicado' : 'agendado', scheduledFor: done ? null : when, publishedAt: done ? when : null, creativeId: x.creativeId || '', pubId: x.id, approvedBy: SOCIAL_ME});
  }); soSave();
}

/* ---------- dados de exemplo (para conhecer o módulo; removíveis) ---------- */
function soExample() {
  const S = so(), p = curProject(); if (S.example) { toast('Os dados de exemplo já estão carregados.'); return; }
  const ig = {id: 'ex_ig', projectId: p.id, networkId: 'instagram', handle: '@exemplo.marca', displayName: 'Exemplo Marca', status: 'ativa', origem: 'demonstracao', adAccountConnected: true, trackingSince: soDay(new Date(Date.now() - 120 * 864e5)), tokenExpiresAt: null, lastSyncAt: null, messagingApproved: true, avatarGradient: soNet('instagram').gradient};
  const fb = Object.assign({}, ig, {id: 'ex_fb', networkId: 'facebook', handle: 'Exemplo Marca', avatarGradient: soNet('facebook').gradient});
  S.accounts.push(ig, fb);
  const at = (d, h) => { const x = new Date(); x.setDate(x.getDate() + d); x.setHours(h, 0, 0, 0); return x.toISOString(); };
  const fmts = ['imagem', 'carrossel', 'video', 'imagem', 'carrossel', 'story'], hrs = [9, 12, 19, 19, 12, 9, 18, 20];
  for (let i = 0; i < 14; i++) {
    const reach = 1500 + ((i * 7919) % 9000) + (i % 3 === 0 ? 4000 : 0), f = fmts[i % 6];
    const po = soNewPost({id: 'ex_p' + i, title: 'Publicação de exemplo ' + (i + 1), caption: ['Três erros que fazem a parcela parecer leve e o contrato ficar eterno. Salve para conferir antes de assinar. #financas #consignado', 'Bastidores da semana: o que mais perguntaram e o que respondemos.', 'Você sabe quanto paga de juros por mês? A conta nem sempre fecha no papel. @exemplo.marca'][i % 3], format: f, media: Object.assign({}, KS.networks.MIDIA_PADRAO[f] || {count: 1, aspectRatio: '4:5', fileSizeMb: 2}), accountIds: i % 4 === 0 ? ['ex_ig', 'ex_fb'] : ['ex_ig'], status: 'publicado', publishedAt: at(-(60 - i * 4), hrs[i % 8]), approvedBy: SOCIAL_ME, coverGradient: soGrad(i),
      metrics: {reach, impressions: Math.round(reach * (1.4 + (i % 4) * 0.15)), likes: Math.round(reach * 0.04), comments: Math.round(reach * 0.004), shares: Math.round(reach * 0.006), saves: Math.round(reach * 0.012)}});
    po.scheduledFor = null;
  }
  [['ex_f1', 'ideia', null, 'a_definir'], ['ex_f2', 'rascunho', null, 'carrossel'], ['ex_f3', 'aguardando_aprovacao', 2, 'imagem'], ['ex_f4', 'aprovado', 4, 'carrossel'], ['ex_f5', 'agendado', 6, 'video']].forEach(([id, st, d, f], i) => soNewPost({id, title: ['Pauta: perguntas da semana', 'Carrossel: juros compostos', 'Post: dica da segunda', 'Carrossel: antes de assinar', 'Reels: bastidores'][i], caption: i > 1 ? 'Legenda de exemplo para a peça ' + (i + 1) + '. Salve e compartilhe. #exemplo' : '', format: f, accountIds: ['ex_ig'], status: st, scheduledFor: d ? at(d, 12) : null, approvedBy: ['aprovado', 'agendado'].includes(st) ? SOCIAL_ME : null, coverGradient: soGrad(i + 3), media: Object.assign({}, KS.networks.MIDIA_PADRAO[f === 'a_definir' ? 'imagem' : f]), }));
  S.boosts.push({id: 'ex_b1', postId: 'ex_p2', accountId: 'ex_ig', objective: 'alcance', budgetTotal: 400, durationDays: 7, startedAt: soDay(new Date(Date.now() - 50 * 864e5)), endsAt: soDay(new Date(Date.now() - 43 * 864e5)), status: 'encerrado', audience: {locations: ['Salvador, BA'], ageMin: 25, ageMax: 54, interests: []}, results: {spend: 400, reach: 6000, impressions: 13000, engagement: 300, clicks: 150, porLocal: [{local: 'Salvador, Bahia', reach: 3500, spend: 230}, {local: 'Recife, PE', reach: 1500, spend: 100}, {local: 'Feira de Santana', reach: 1000, spend: 70}]}});
  S.boosts.push({id: 'ex_b2', postId: 'ex_p6', accountId: 'ex_ig', objective: 'engajamento', budgetTotal: 150, durationDays: 4, startedAt: soDay(new Date(Date.now() - 36 * 864e5)), endsAt: soDay(new Date(Date.now() - 32 * 864e5)), status: 'encerrado', audience: {locations: ['Curitiba', 'Porto Alegre, RS'], ageMin: 18, ageMax: 44, interests: []}, results: {spend: 150, reach: 2200, impressions: 4800, engagement: 110, clicks: 35}});
  const who = [['@pessoa.um', 'Pessoa Um', 'seguidor', 3], ['@pessoa.dois', 'Pessoa Dois', 'defensor', 11], ['@pessoa.tres', 'Pessoa Três', 'apoiador', 5], ['@pessoa.quatro', 'Pessoa Quatro', 'nao_seguidor', 1]];
  ['Vocês vão passar no meu bairro?', 'Parabéns pelo conteúdo!', 'Como faço para ajudar?', 'Qual o valor?'].forEach((t, i) => S.inbox.push({id: 'ex_i' + i, accountId: 'ex_ig', kind: i % 2 ? 'comentario' : 'mensagem', authorHandle: who[i][0], authorName: who[i][1], avatarGradient: soGrad(i), text: t, postId: 'ex_p' + (11 + (i % 3)), receivedAt: at(-1 - i, 10), status: i === 1 ? 'respondido' : 'pendente', assignedTo: null, replies: i === 1 ? [{id: 'ex_r1', author: SOCIAL_ME, text: 'Obrigado!', sentAt: at(-1, 15)}] : [], relacao: who[i][2], interacoes: who[i][3]}));
  S.events.push({id: 'ex_e1', projectId: p.id, titulo: 'Gravação de bastidores', descricao: null, tipo: 'gravacao', comecaEm: at(3, 10), terminaEm: null, diaInteiro: false, local: 'Estúdio', municipioCodigo: null, responsavel: SOCIAL_ME, postIds: [], origem: 'manual', criadoPor: SOCIAL_ME, criadoEm: new Date().toISOString()});
  ['ex_ig', 'ex_fb'].forEach((id, k) => { S.metrics[id] = Array.from({length: 120}, (_, i) => { const d = new Date(Date.now() - (119 - i) * 864e5); return {date: soDay(d), followers: 3000 + i * (k ? 4 : 9), followersGained: 14 + (i % 5), followersLost: 4 + (i % 3), organicReach: 900 + i * 12 + (i % 7) * 60, paidReach: i % 9 === 0 ? 1500 : 0, organicImpressions: 1500 + i * 18, paidImpressions: i % 9 === 0 ? 3200 : 0, organicEngagement: 60 + i, paidEngagement: i % 9 === 0 ? 80 : 0, adSpend: i % 9 === 0 ? 95 : 0}; }); });
  S.example = true; soSave();
}
function soExampleClear() {
  const S = so(); S.accounts = S.accounts.filter(a => !/^ex_/.test(a.id)); S.posts = S.posts.filter(x => !/^ex_/.test(x.id)); S.boosts = S.boosts.filter(b => !/^ex_/.test(b.id)); S.inbox = S.inbox.filter(i => !/^ex_/.test(i.id)); S.events = S.events.filter(e => !/^ex_/.test(e.id));
  Object.keys(S.metrics).forEach(k => { if (/^ex_/.test(k)) delete S.metrics[k]; }); S.example = false; soSave();
}
