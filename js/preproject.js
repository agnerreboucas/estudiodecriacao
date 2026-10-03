/* Journey Architect — Pré-Projeto: desafios → hipóteses → diagnóstico → justificativa → objetivo → OKR → ICP → jornada → validação */
const CHALLENGES = [
  {id: 'd1', title: 'Dependem de indicação para vender', note: 'Aquisição pouco previsível.', cat: 'demand',
   hyp: 'A dependência de indicação pode limitar a previsibilidade da geração de novas oportunidades.',
   impact: 'O volume de oportunidades oscila conforme a rede de contatos, dificultando metas e planejamento.'},
  {id: 'd2', title: 'Não têm previsão de fechamento', note: 'Baixa previsibilidade comercial.', cat: 'conversion',
   hyp: 'A ausência de previsão de fechamento pode dificultar planejamento comercial e financeiro.',
   impact: 'A receita futura é estimada por percepção, sem base em pipeline.'},
  {id: 'd3', title: 'Não possuem área comercial especializada', note: 'Venda concentrada nos donos ou sem processo.', cat: 'conversion',
   hyp: 'A ausência de uma área comercial especializada pode deixar a conversão dependente da rotina dos próprios gestores.',
   impact: 'Leads podem esfriar por falta de atendimento e follow-up consistentes.'},
  {id: 'd4', title: 'Não possuem área de marketing especializada', note: 'Marketing pontual e pouco estruturado.', cat: 'demand',
   hyp: 'A ausência de marketing especializado pode reduzir a consistência na geração e na gestão da demanda.',
   impact: 'As ações ficam pontuais, sem rotina nem aprendizado acumulado.'},
  {id: 'd5', title: 'Pensam marketing como custo', note: 'Dificuldade em tratar aquisição como parte do crescimento.', cat: 'management',
   hyp: 'Perceber marketing como custo pode dificultar sua integração aos objetivos de crescimento e aquisição.',
   impact: 'O investimento tende a ser cortado antes de gerar aprendizado.'},
  {id: 'd6', title: 'Seus donos se dividem entre operação e gestão', note: 'O crescimento compete com a operação diária.', cat: 'management',
   hyp: 'A divisão dos donos entre operação e gestão pode reduzir a capacidade de dedicar atenção contínua a crescimento e vendas.',
   impact: 'Vendas e marketing disputam tempo com a operação diária.'},
  {id: 'd7', title: 'Normalmente não focam em um produto específico', note: 'Posicionamento e comunicação ficam dispersos.', cat: 'demand',
   hyp: 'A falta de foco em um produto específico pode dispersar posicionamento, comunicação, oferta e aquisição.',
   impact: 'A mensagem fica genérica, difícil de testar e de converter.'},
  {id: 'd8', title: 'Não possuem sistema de gestão de vendas', note: 'Oportunidades e follow-ups ficam sem acompanhamento.', cat: 'conversion',
   hyp: 'A ausência de um sistema de gestão de vendas pode impedir o acompanhamento consistente de oportunidades, conversão e origem dos negócios.',
   impact: 'Não é possível saber o que gera venda nem onde os leads se perdem.'}
];
/* Relações entre hipóteses: causa, consequência ou dependência (nunca soma simples) */
const RELATIONS = [
  ['d1', 'd8', 'dependência', 'Indicação sem sistema de vendas: a origem dos negócios não é registrada, então a empresa não aprende o que realmente gera venda.'],
  ['d1', 'd4', 'causa', 'Sem marketing especializado não há canal próprio de aquisição, e a indicação vira a única fonte de demanda.'],
  ['d1', 'd2', 'consequência', 'Uma demanda que depende de indicação chega de forma irregular, o que dificulta prever fechamentos.'],
  ['d1', 'd7', 'dependência', 'Quem chega por indicação já conhece a empresa; sem produto-foco, a mensagem para quem não conhece fica sem referência.'],
  ['d2', 'd8', 'dependência', 'Sem sistema de gestão de vendas, a previsão de fechamento depende de percepção, não de pipeline.'],
  ['d2', 'd3', 'causa', 'Sem área comercial, o processo de venda não é padronizado e o fechamento fica imprevisível.'],
  ['d3', 'd6', 'causa', 'Com os donos divididos entre operação e gestão, a venda acontece nas sobras de tempo, sem área dedicada.'],
  ['d3', 'd8', 'dependência', 'Uma área comercial sem sistema de vendas não consegue acompanhar nem cobrar follow-up.'],
  ['d4', 'd5', 'causa', 'Quando marketing é visto como custo, a área especializada não é criada e as ações seguem pontuais.'],
  ['d4', 'd7', 'dependência', 'Sem marketing especializado e sem produto-foco, a comunicação se espalha por várias ofertas.'],
  ['d5', 'd7', 'consequência', 'Sem foco em um produto, é difícil demonstrar o retorno do marketing, o que reforça a visão de custo.'],
  ['d6', 'd4', 'causa', 'A rotina dos donos não deixa espaço para estruturar marketing.'],
  ['d6', 'd8', 'consequência', 'Donos sobrecarregados e sem sistema de vendas tendem a perder o follow-up de oportunidades.']
];
const JOURNEY_FIELDS = [['situacao', 'Situação'], ['duvida', 'Dúvida'], ['dor', 'Dor'], ['desejo', 'Desejo'], ['gatilho', 'Gatilho'], ['objecao', 'Objeção'], ['confianca', 'Fator de confiança']];
const ICP_FIELDS = [['name', 'Nome do ICP'], ['profile', 'Perfil'], ['situation', 'Situação'], ['need', 'Necessidade'], ['behavior', 'Comportamento'], ['intent', 'Intenção']];
const JOURNEY_HINT = ['Reconhecer', 'Entender', 'Avaliar', 'Agir', 'Continuar'];

const preP = () => curProject();
const preOf = () => curProject().pre;

/* Itens = desafios selecionados + "outros", com numeração rastreável */
function preItems(pre) {
  const items = [];
  CHALLENGES.forEach((c, i) => { if (pre.challenges[c.id]) items.push({id: c.id, num: i + 1, title: c.title, note: c.note, cat: c.cat, hyp: c.hyp, impact: c.impact}); });
  pre.other.forEach((o, i) => items.push({id: o.id, num: 9 + i, title: o.title, note: 'Informado pelo cliente.', cat: 'other',
    hyp: `O desafio “${o.title}” pode estar contribuindo para limitar a previsibilidade do crescimento e precisa ser validado.`,
    impact: 'Impacto a investigar com o cliente.'}));
  return items;
}
const hypText = (pre, it) => (pre.hyp[it.id] && pre.hyp[it.id].text) || it.hyp;
const refDes = it => 'DESAFIO-' + pad(it.num);
const refHip = it => 'HIP-' + pad(it.num);

function relationsFor(items) {
  const by = Object.fromEntries(items.map(i => [i.id, i]));
  return RELATIONS.filter(r => by[r[0]] && by[r[1]]).map(r => ({a: by[r[0]], b: by[r[1]], type: r[2], text: r[3]}));
}
const joinList = arr => arr.length <= 1 ? (arr[0] || '') : arr.slice(0, -1).join(', ') + ' e ' + arr[arr.length - 1];

function buildDrafts(pre) {
  const items = preItems(pre), rels = relationsFor(items);
  const cats = new Set(items.map(i => i.cat));
  const n = items.length;
  const low = s => s.charAt(0).toLowerCase() + s.slice(1);
  const diag = !n ? {scenario: '', causal: '', consequence: '', need: ''} : {
    scenario: `A empresa declara ${n} desafio${n > 1 ? 's' : ''}: ${joinList(items.map(i => low(i.title)))}.`,
    causal: rels.length ? rels.slice(0, 3).map(r => r.text).join(' ') : 'Os desafios selecionados ainda não permitem identificar uma relação causal clara; é preciso validar com o cliente.',
    consequence: 'Se nada mudar, ' + joinList([
      cats.has('demand') || cats.has('other') ? 'a geração de demanda tende a ser irregular' : '',
      cats.has('conversion') ? 'a conversão comercial tende a perder oportunidades' : '',
      cats.has('management') ? 'o crescimento continua competindo com a rotina operacional' : ''
    ].filter(Boolean)) + ', o que reduz a previsibilidade do crescimento.',
    need: 'É preciso construir um caminho previsível entre aquisição, conversão e acompanhamento, começando pelo que faz a demanda aparecer.'
  };
  const justification = !n ? '' :
    'Agir agora é necessário porque o cenário atual limita a previsibilidade do crescimento. Esperar a estrutura comercial ideal atrasaria a geração de demanda; por isso a prioridade é gerar tração enquanto se constrói o mínimo para capturar, registrar e acompanhar cada lead.' +
    (cats.has('conversion') ? ' Há sinais de perda de oportunidades na conversão, então o fluxo mínimo de registro e acompanhamento entra em paralelo.' : '');
  const objective = !n ? '' : 'Construir maior previsibilidade na aquisição e conversão de novas oportunidades comerciais.';
  const tr = !n ? [] : [
    'Definir uma meta inicial de leads qualificados por período (valor a validar).',
    'Colocar pelo menos um canal de aquisição em operação.',
    cats.has('demand') ? 'Reduzir a dependência de indicação como única fonte de oportunidades.' : 'Ampliar as fontes de oportunidades.',
    'Medir volume, qualidade e origem dos leads gerados.'
  ];
  const st = !n ? [] : [
    'Registrar 100% dos leads recebidos em um fluxo mínimo de acompanhamento.',
    pre.challenges.d8 ? 'Implantar um CRM ou planilha de pipeline como sistema mínimo de gestão de vendas.' : 'Manter um pipeline simples com etapas definidas.',
    pre.challenges.d3 || pre.challenges.d6 ? 'Definir um responsável pelo atendimento e pelo follow-up dos leads.' : 'Definir critérios de qualificação e responsáveis pelo atendimento.',
    'Acompanhar conversão por etapa e tempo de resposta.'
  ];
  return {diag, justification, objective, okr: {objective: n ? 'Transformar aquisição em crescimento mais previsível' : '', tr, st}};
}
/* ---- resumo executivo (abertura do projeto) e elevator pitch: rascunho a partir do que já foi definido ---- */
const SUM_KINDS = ['dado', 'hipotese', 'recomendacao'];
const lowFirst = s => s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
const clip = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n).replace(/\s\S*$/, '') + '…' : s; };
function buildSummary(p) {
  const pre = p.pre, items = preItems(pre), n = items.length, d = pre.diag, ok = items.filter(i => pre.hyp[i.id] && pre.hyp[i.id].validated).length;
  if (!n) return [];
  const B = (id, label, kind, text) => ({id, label, kind, text});
  const out = [
    B('ctx', 'Contexto', 'dado', clip(pre.briefing, 360) || `${p.name}${p.desc ? ': ' + p.desc : ''}.`),
    B('challenge', 'Desafio central', 'hipotese', [d.scenario, d.need].filter(Boolean).join(' ')),
    B('objective', 'Objetivo', 'recomendacao', pre.objective),
    B('kr', 'Como vamos medir', 'recomendacao', [pre.okr.objective && `Objetivo do OKR: ${pre.okr.objective}.`, pre.okr.tr[0] && `Tração: ${pre.okr.tr[0]}`, pre.okr.st[0] && `Estruturação: ${pre.okr.st[0]}`].filter(Boolean).join(' ')),
    B('who', 'Para quem', 'hipotese', pre.icps.length ? `Perfis prioritários: ${joinList(pre.icps.map(x => x.name).filter(Boolean))}. São hipóteses até a validação com o cliente.` : 'Perfis prioritários ainda não definidos.'),
    B('phases', 'Como vamos começar', 'recomendacao', 'Fase 1, tração: fazer a demanda aparecer enquanto se constrói o mínimo de estrutura. Fase 2, estruturação: organizar registro, acompanhamento e conversão. Depois da aprovação, o gate de Posicionamento define como a empresa ocupa espaço no mercado.'),
    B('validation', 'O que ainda precisa ser validado', 'hipotese', `${ok} de ${n} hipótese(s) validada(s); as demais seguem como hipótese até a conversa com o cliente. Metas numéricas dependem dessa validação.`),
    B('next', 'Próximos passos para abrir o projeto', 'recomendacao', '1. Validar as hipóteses com o cliente.\n2. Aprovar o pré-projeto.\n3. Definir o posicionamento.\n4. Montar a estratégia e o plano de comunicação.')
  ];
  return out.filter(b => b.text && b.text.trim());
}
function buildPitch(p) {
  const pre = p.pre, items = preItems(pre); if (!items.length) return {text: '', short: ''};
  const who = (pre.icps[0] && pre.icps[0].name) || (p.brief && p.brief.audience) || 'empresas como a sua', co = p.name || 'Nossa equipe';
  const obj = String(pre.objective || '').replace(/\.$/, ''), prob = joinList(items.slice(0, 2).map(i => lowFirst(i.title)));
  const text = [
    `${co} ajuda ${who} a ${lowFirst(obj) || 'crescer de forma mais previsível'}.`,
    prob ? `Hoje, ${prob}.` : '',
    'Por isso começamos pela tração, fazendo a demanda aparecer, e em paralelo organizamos o mínimo de estrutura para acompanhar cada oportunidade até a decisão.',
    pre.positioning ? `Nosso posicionamento: ${pre.positioning}` : '',
    'O primeiro passo é validar esse diagnóstico com você.'
  ].filter(Boolean).join(' ');
  return {text, short: `${co}: ${lowFirst(obj) || 'crescimento mais previsível'}.`};
}
function refreshExtras(p) {
  const pre = p.pre;
  if (!pre.summary || !Array.isArray(pre.summary.blocks)) pre.summary = {blocks: [], edited: false};
  if (!pre.pitch || typeof pre.pitch !== 'object') pre.pitch = {text: '', short: '', edited: false};
  if (!Array.isArray(pre.hiddenRels)) pre.hiddenRels = [];
  if (!pre.summary.edited) pre.summary.blocks = buildSummary(p);
  if (!pre.pitch.edited) { const b = buildPitch(p); pre.pitch.text = b.text; pre.pitch.short = b.short; }
}
const pitchSeconds = t => Math.max(1, Math.round(String(t || '').trim().split(/\s+/).filter(Boolean).length / 2.5));
function refreshDrafts(pre) {
  const d = buildDrafts(pre);
  if (!pre.diagEdited) pre.diag = d.diag;
  if (!pre.justEdited) pre.justification = d.justification;
  if (!pre.objEdited) pre.objective = d.objective;
  if (!pre.okr.edited) pre.okr = Object.assign(pre.okr, {objective: d.okr.objective, tr: d.okr.tr, st: d.okr.st});
}

function preValidation(pre) {
  const d = pre.diag;
  return [
    [preItems(pre).length > 0, 'Ao menos um desafio selecionado'],
    [!!(d.scenario && d.causal && d.consequence && d.need), 'Diagnóstico consolidado preenchido'],
    [!!pre.justification.trim(), 'Justificativa preenchida'],
    [!!pre.objective.trim(), 'Objetivo estratégico definido'],
    [pre.okr.tr.some(x => x.trim()) && pre.okr.st.some(x => x.trim()), 'KRs de tração e de estruturação definidos'],
    [pre.icps.length >= 1 && pre.icps.length <= 3, 'De 1 a 3 ICPs prioritários'],
    [!!(pre.summary && pre.summary.blocks.some(b => String(b.text).trim())), 'Resumo executivo com ao menos um bloco'],
    [!!(pre.pitch && String(pre.pitch.text).trim()), 'Elevator pitch preenchido']
  ];
}
function preLog(action, note) { preOf().history.unshift({at: new Date().toISOString(), action, note: note || ''}); }

/* ---- edição ---- */
function preTouch() {
  const pre = preOf();
  const reopened = pre.status === 'APROVADO';
  if (reopened) { pre.status = 'AJUSTES'; preLog('Reaberto', 'Conteúdo alterado após a aprovação; requer nova validação.'); toast('Pré-projeto alterado: precisa de nova validação.'); }
  persist(); syncPreStatusUI();
  /* os botões do fluxo dependem do status; re-render adiado para não engolir um clique em andamento */
  if (reopened) setTimeout(() => { if (ui.page === 'project' && ui.tab === 'preproject') keepScroll(renderPre); }, 250);
}
function preSet(path, v) {
  const pre = preOf(), parts = path.split('.'); let o = pre;
  while (parts.length > 1) o = o[parts.shift()];
  o[parts[0]] = v;
  if (path.startsWith('diag.')) pre.diagEdited = true;
  if (path === 'justification') pre.justEdited = true;
  if (path === 'objective') pre.objEdited = true;
  if (path === 'okr.objective') pre.okr.edited = true;
  preTouch();
}
function preRedo(fn) { fn(preOf()); preTouch(); keepScroll(renderPre); }
function preToggle(id) { preRedo(pre => { pre.challenges[id] = !pre.challenges[id]; }); }
function preAddOther() {
  const i = $('jpOtherInput'); const v = i && i.value.trim(); if (!v) return;
  preRedo(pre => pre.other.push({id: uid('o'), title: v})); toast('Desafio adicionado: gerou uma nova hipótese.');
}
function preRemoveOther(id) { preRedo(pre => { pre.other = pre.other.filter(o => o.id !== id); delete pre.hyp[id]; }); }
function preSetHyp(id, v) { const pre = preOf(); pre.hyp[id] = Object.assign(pre.hyp[id] || {}, {text: v, edited: true}); preTouch(); }
function preValidate(id) { preRedo(pre => { pre.hyp[id] = Object.assign(pre.hyp[id] || {}, {validated: !(pre.hyp[id] && pre.hyp[id].validated)}); }); }
function preResetHyp(id) { preRedo(pre => { delete pre.hyp[id]; }); }
function preRegen(what) {
  preRedo(pre => {
    if (what === 'diag') pre.diagEdited = false;
    if (what === 'just') pre.justEdited = false;
    if (what === 'obj') pre.objEdited = false;
    if (what === 'okr') pre.okr.edited = false;
    if (what === 'summary') pre.summary.edited = false;
    if (what === 'pitch') pre.pitch.edited = false;
    if (what === 'rels') pre.hiddenRels = [];
  });
  toast('Texto regenerado a partir dos desafios.');
}
/* resumo executivo: editar, apagar, mover e acrescentar blocos; pitch editável */
const sumB = () => preOf().summary.blocks;
function preSumSet(i, k, v) { const pre = preOf(); pre.summary.blocks[i][k] = v; pre.summary.edited = true; preTouch(); }
function preSumDel(i) { preRedo(pre => { pre.summary.blocks.splice(i, 1); pre.summary.edited = true; }); }
function preSumMove(i, d) { preRedo(pre => { const b = pre.summary.blocks, j = i + d; if (j < 0 || j >= b.length) return; [b[i], b[j]] = [b[j], b[i]]; pre.summary.edited = true; }); }
function preSumAdd() { preRedo(pre => { pre.summary.blocks.push({id: uid('sb'), label: 'Novo bloco', kind: 'recomendacao', text: ''}); pre.summary.edited = true; }); }
function prePitchSet(k, v) { const pre = preOf(); pre.pitch[k] = v; pre.pitch.edited = true; preTouch(); const el = $('pitchSecs'); if (el) el.textContent = pitchSeconds(pre.pitch.text); }
function preRelDel(key) { preRedo(pre => { if (!pre.hiddenRels.includes(key)) pre.hiddenRels.push(key); }); }
function preKR(kind, i, v) { preOf().okr[kind][i] = v; preOf().okr.edited = true; preTouch(); }
function preAddKR(kind) { preRedo(pre => { pre.okr[kind].push(''); pre.okr.edited = true; }); }
function preDelKR(kind, i) { preRedo(pre => { pre.okr[kind].splice(i, 1); pre.okr.edited = true; }); }

/* ICP e jornada (modais) */
function preIcpModal(i) {
  const pre = preOf();
  if (i < 0 && pre.icps.length >= 3) { toast('O Pré-Projeto aceita no máximo 3 ICPs prioritários.'); return; }
  const v = i >= 0 ? pre.icps[i] : {};
  showModal(i >= 0 ? 'Editar ICP' : 'Novo ICP', `<div class="form-grid">${ICP_FIELDS.map(([k, l]) => `<div class="field ${k === 'name' ? 'full' : ''}"><label>${l}</label>${k === 'name' ? `<input id="icp_${k}" value="${esc(v[k] || '')}">` : `<textarea id="icp_${k}" rows="2">${esc(v[k] || '')}</textarea>`}</div>`).join('')}</div>
    <p class="muted" style="font-size:11px">Personas extensas ficam para fases posteriores. Aqui basta o essencial para orientar a jornada.</p>
    <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="preIcpSave(${i})">Salvar ICP</button></div>`);
}
function preIcpSave(i) {
  const o = {}; ICP_FIELDS.forEach(([k]) => o[k] = $('icp_' + k).value.trim());
  if (!o.name) { toast('Dê um nome ao ICP.'); return; }
  preRedo(pre => { if (i >= 0) pre.icps[i] = o; else pre.icps.push(o); }); closeModal();
}
function preIcpDel(i) { if (confirm('Remover este ICP?')) preRedo(pre => pre.icps.splice(i, 1)); }
function preJourneyModal(i) {
  const s = preOf().journey[i];
  showModal(`Jornada · ${i + 1}. ${s.name}`, `<p class="muted" style="font-size:11px;margin-top:0">Nesta fase a jornada é uma <b>hipótese</b>. A versão aprofundada vem depois da validação.</p><div class="form-grid">${JOURNEY_FIELDS.map(([k, l]) => `<div class="field ${k === 'situacao' ? 'full' : ''}"><label>${l}</label><textarea id="jn_${k}" rows="2">${esc(s[k] || '')}</textarea></div>`).join('')}</div>
    <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="preJourneySave(${i})">Salvar etapa</button></div>`);
}
function preJourneySave(i) { preRedo(pre => JOURNEY_FIELDS.forEach(([k]) => pre.journey[i][k] = $('jn_' + k).value.trim())); closeModal(); }

/* Fluxo de aprovação (nenhum gate é ultrapassado silenciosamente) */
function preMissing(pre) { return preValidation(pre).filter(c => !c[0]).map(c => c[1]); }
function preSend() {
  const pre = preOf(), miss = preMissing(pre);
  if (miss.length) { toast('Faltam: ' + miss.join('; ')); return; }
  pre.status = 'EM REVISÃO'; preLog('Enviado para revisão'); persist(); keepScroll(renderPre); toast('Pré-projeto enviado para revisão.');
}
function preAdjust() {
  askText('Pedir ajustes', 'O que precisa mudar?', note => { const pre = preOf(); pre.status = 'AJUSTES'; preLog('Ajustes solicitados', note); persist(); keepScroll(renderPre); toast('Ajustes registrados.'); });
}
function preApprove() {
  const pre = preOf(), miss = preMissing(pre);
  if (miss.length) { toast('Faltam: ' + miss.join('; ')); return; }
  if (!confirm('Aprovar o pré-projeto? Isso abre o gate de Posicionamento. Hipóteses não validadas continuam como hipóteses.')) return;
  pre.status = 'APROVADO'; pre.approvedAt = new Date().toISOString(); preLog('Aprovado', 'Próximo gate: Posicionamento.'); persist(); keepScroll(renderPre); toast('Pré-projeto aprovado. Próximo gate: Posicionamento.');
}
function preReopen() { const pre = preOf(); pre.status = 'AJUSTES'; preLog('Reaberto para ajustes'); persist(); keepScroll(renderPre); }
function syncPreStatusUI() {
  const pre = preOf(), s = $('jpStatus'), g = $('jpGateLabel');
  if (s) { s.textContent = pre.status; s.className = 'jp-status st-' + pre.status.replace(/\s/g, '').toLowerCase(); }
  if (g) g.textContent = pre.status === 'APROVADO' ? 'PRÉ-PROJETO APROVADO' : 'AGUARDANDO VALIDAÇÃO';
}

/* ---- render ---- */
const taPre = (v, path, rows = 3, ph = '') => `<textarea class="jp-ta" rows="${rows}" placeholder="${esc(ph)}" onchange="preSet('${path}',this.value)">${esc(v)}</textarea>`;
function renderPre() {
  const c = $('projectContent'), p = preP(); if (!c || !p) return;
  const pre = p.pre; refreshDrafts(pre); refreshExtras(p);
  const items = preItems(pre), rels = relationsFor(items).filter(r => !pre.hiddenRels.includes(refHip(r.a) + refHip(r.b))), apr = pre.status === 'APROVADO';
  const rec = apr ? 'decisao' : 'recomendacao';
  const checks = preValidation(pre), allOk = checks.every(x => x[0]);
  const done = [items.length > 0, items.length > 0, !!pre.justification, !!pre.objective && pre.okr.tr.length > 0, ['EM REVISÃO', 'APROVADO'].includes(pre.status), !!pre.positioning, false];
  const steps = ['Diagnóstico', 'Hipóteses', 'Justificativa', 'Objetivo & OKR', 'Validação', 'Posicionamento', 'Estratégia'];
  const flow = pre.status === 'EM REVISÃO'
    ? `<button class="btn" onclick="preAdjust()">Pedir ajustes</button><button class="btn dark" onclick="preApprove()">✓ Aprovar pré-projeto</button>`
    : apr ? `<button class="btn" onclick="preReopen()">Reabrir para ajustes</button>`
    : `<button class="btn dark" onclick="preSend()">Enviar para revisão</button>`;
  const krCol = (kind, label) => `<article><div class="okr-label">${label} ${tag(rec)}</div>${pre.okr[kind].map((x, i) => `<div class="kr-row"><span>□</span><input value="${esc(x)}" onchange="preKR('${kind}',${i},this.value)"><button class="x" title="Remover" onclick="preDelKR('${kind}',${i})">×</button></div>`).join('') || '<p class="muted">Selecione desafios para gerar sugestões.</p>'}<button class="btn sm" onclick="preAddKR('${kind}')">＋ KR</button></article>`;

  c.innerHTML = `
  <div class="jp-wrap">
    <div class="jp-head"><div><div class="eyebrow">JOURNEY ARCHITECT · MOTOR DO PROJETO</div><h2>Diagnóstico & Pré-Projeto</h2><p>Transforme desafios em hipóteses, diagnóstico, justificativa e objetivo mensurável. O pré-projeto define onde começar sem antecipar decisões que dependem do posicionamento.</p></div>
      <div class="jp-actions"><span class="jp-status st-${pre.status.replace(/\s/g, '').toLowerCase()}" id="jpStatus">${pre.status}</span><button class="btn dark" onclick="preDeckOpen()" title="Abre os slides no Editor de Design">▣ Apresentação</button><button class="btn" onclick="preDeckOpen(true)" title="Refaz os slides a partir do Pré-Projeto">↻ Slides</button><button class="btn" onclick="prePresent()" title="Documento completo em HTML">▤ Documento</button><button class="btn" onclick="prePDF()">PDF</button><button class="btn" onclick="exportProject('${p.id}')" title="Baixar o projeto em JSON">⬇ JSON</button>${flow}</div></div>
    <div class="jp-progress">${steps.map((s, i) => `<span class="jp-step ${done[i] ? 'done' : ''} ${i === 0 ? 'active' : ''}">${pad(i + 1, 2)} ${s}</span>`).join('')}</div>

    <div class="jp-panel"><div class="section-row"><div><h3>Identificação e briefing</h3><p class="sub">Contexto de origem do projeto. Tudo o que for escrito aqui é tratado como ${tag('dado')}.</p></div></div>
      <div class="jp-ident"><div class="kv"><span>Projeto</span><strong>${esc(p.name)}</strong></div><div class="kv"><span>Context ID</span><strong class="mono">${esc(p.ctx)}</strong></div><div class="kv"><span>Status</span><strong>${pre.status}</strong></div></div>
      <textarea class="jp-ta" rows="3" placeholder="Escreva ou cole o briefing: oferta, público, problema, objetivo e desafios." onchange="preSet('briefing',this.value)">${esc(pre.briefing)}</textarea></div>

    <div class="jp-panel"><h3>1. Desafios de crescimento</h3><p class="sub">Selecione quantos forem necessários. Cada item gera uma hipótese própria (<span class="mono">DADO → HIPÓTESE → IMPACTO</span>). As hipóteses depois são cruzadas para formar o diagnóstico.</p>
      <div class="jp-diagnostic">${CHALLENGES.map(x => `<label class="jp-check ${pre.challenges[x.id] ? 'selected' : ''}"><input type="checkbox" ${pre.challenges[x.id] ? 'checked' : ''} onchange="preToggle('${x.id}')"><span><strong>${esc(x.title)}</strong><small>${esc(x.note)}</small></span></label>`).join('')}</div>
      <div class="jp-other"><input id="jpOtherInput" placeholder="Outro desafio que não está na lista..." onkeydown="if(event.key==='Enter')preAddOther()"><button class="btn" onclick="preAddOther()">＋ Adicionar</button></div>
      <div class="jp-summary">${pre.other.map(o => `<span class="jp-tag">${esc(o.title)} <b class="x" onclick="preRemoveOther('${o.id}')" title="Remover">×</b></span>`).join('') || (items.length ? '' : '<span class="jp-tag">Nenhum desafio selecionado ainda</span>')}</div>
    </div>

    <div class="jp-panel"><div class="section-row"><div><h3>2. Hipóteses individuais</h3><p class="sub">Edite o texto de cada hipótese. Nenhuma é tratada como fato antes da validação com o cliente.</p></div><div class="row-gap"><span class="jp-mini-badge">${items.length} hipótese(s)</span><button class="btn sm" onclick="preAI('hyp')">✦ Refinar com IA</button></div></div>
      <div class="jp-hyp-list">${items.map(it => { const h = pre.hyp[it.id] || {}; return `<article class="jp-hyp ${h.validated ? 'validated' : ''}">
        <div class="hyp-top"><span class="mono">${refHip(it)} · ${refDes(it)}</span>${h.validated ? tag('dado') : tag('hipotese')}</div>
        <strong>${esc(it.title)}</strong>
        <textarea class="jp-ta" rows="3" onchange="preSetHyp('${it.id}',this.value)">${esc(hypText(pre, it))}</textarea>
        <p class="impact"><b>Impacto hipotético:</b> ${esc(it.impact)}</p>
        <div class="row-gap"><button class="btn sm" onclick="preValidate('${it.id}')">${h.validated ? '↩ Voltar para hipótese' : '✓ Marcar como validada'}</button>${h.edited ? `<button class="btn sm" onclick="preResetHyp('${it.id}')">Restaurar texto</button>` : ''}</div></article>`; }).join('') || emptyState('Sem hipóteses ainda', 'Selecione desafios acima para o Studio levantar as hipóteses.')}</div>
    </div>

    <div class="jp-panel"><h3>3. Cruzamento das hipóteses</h3><p class="sub">Hipóteses relacionadas não são somadas: são conectadas por causa, consequência ou dependência.</p>
      <div class="jp-rel-list">${rels.map(r => `<div class="jp-rel"><div class="rel-head"><span class="mono">${refHip(r.a)} ↔ ${refHip(r.b)}</span><span class="jp-mini-badge">${r.type}</span><button class="btn sm" onclick="preRelDel('${refHip(r.a)}${refHip(r.b)}')" title="Apagar esta relação">${ico('trash', 14)}</button></div><p>${esc(r.text)}</p></div>`).join('') || `<p class="muted">${items.length > 1 ? 'Os desafios escolhidos ainda não têm relação conhecida. Valide com o cliente.' : 'Selecione ao menos dois desafios para procurar relações.'}</p>`}${pre.hiddenRels.length ? `<button class="btn sm" onclick="preRegen('rels')">↺ Restaurar ${pre.hiddenRels.length} relação(ões) apagada(s)</button>` : ''}</div>
    </div>

    <div class="jp-panel"><div class="section-row"><div><h3>4. Diagnóstico consolidado</h3><p class="sub">Cenário → hipótese causal → consequência → necessidade de transformação.</p></div><div class="row-gap"><button class="btn sm" onclick="preRegen('diag')">↻ Regenerar</button><button class="btn sm" onclick="preAI('diag')">✦ IA</button></div></div>
      <div class="jp-diagnosis-chain"><span>CENÁRIO</span><b>→</b><span>HIPÓTESE CAUSAL</span><b>→</b><span>CONSEQUÊNCIA</span><b>→</b><span>NECESSIDADE</span></div>
      <div class="jp-diagnosis-box"><div class="type">DIAGNÓSTICO · A VALIDAR ${tag('hipotese')}</div>
        ${[['scenario', 'Cenário'], ['causal', 'Hipótese causal'], ['consequence', 'Consequência'], ['need', 'Necessidade de transformação']].map(([k, l]) => `<div class="diag-row"><label>${l}</label>${taPre(pre.diag[k], 'diag.' + k, 2, 'Selecione desafios para gerar este texto.')}</div>`).join('')}</div>
      <div class="jp-intelligence"><div><b>DADO</b><p>O que o cliente informou ou validou.</p></div><div><b>HIPÓTESE</b><p>Interpretação ainda não validada.</p></div><div><b>RECOMENDAÇÃO</b><p>Caminho sugerido pelo Studio.</p></div><div><b>DECISÃO</b><p>Só existe depois da validação humana.</p></div></div>
    </div>

    <div class="jp-panel"><div class="section-row"><div><h3>5. Justificativa estratégica</h3><p class="sub">Responde: por que esse diagnóstico exige ação? Conecta o cenário ao objetivo, sem repetir o diagnóstico.</p></div><button class="btn sm" onclick="preRegen('just')">↻ Regenerar</button></div>
      <div class="jp-justification"><div class="type">JUSTIFICATIVA ${tag(rec)}</div>${taPre(pre.justification, 'justification', 4, 'Será gerada a partir dos desafios.')}</div>
    </div>

    <div class="jp-panel"><div class="section-row"><div><h3>6. Objetivo estratégico</h3><p class="sub">Responde: o que precisamos transformar?</p></div><button class="btn sm" onclick="preRegen('obj')">↻ Regenerar</button></div>
      <div class="jp-objective"><div class="type">OBJETIVO ${tag(rec)}</div>${taPre(pre.objective, 'objective', 2, 'Será gerado a partir dos desafios.')}</div></div>

    <div class="jp-panel"><div class="section-row"><div><h3>7. OKR e priorização</h3><p class="sub">Tração mede o movimento inicial de aquisição; estruturação mede a construção do processo. Números definitivos só depois da validação.</p></div><button class="btn sm" onclick="preRegen('okr')">↻ Regenerar</button></div>
      <div class="jp-okr"><div class="jp-okr-head"><div><span class="type">OBJECTIVE ${tag(rec)}</span><input class="okr-obj" value="${esc(pre.okr.objective)}" placeholder="Objetivo do OKR" onchange="preSet('okr.objective',this.value)"></div></div>
        <div class="jp-okr-grid">${krCol('tr', 'KR · TRAÇÃO')}${krCol('st', 'KR · ESTRUTURAÇÃO')}</div>
        <small class="jp-note">O Studio não inventa metas críticas: os KRs sugeridos são recomendações até serem aprovados.</small></div>
      <div class="jp-priority-flow"><div><b>FASE 1 · TRAÇÃO</b><strong>Gerar leads</strong><small>Fazer a demanda aparecer.</small></div><div class="arrow">→</div><div><b>FASE 2 · ESTRUTURAÇÃO</b><strong>Organizar conversão</strong><small>Qualificar, acompanhar, propor, fechar.</small></div><div class="arrow">→</div><div><b>FASE 3 · OTIMIZAÇÃO</b><strong>Previsibilidade</strong><small>Conversão, CAC, receita e eficiência.</small></div></div>
    </div>

    <div class="jp-panel"><div class="section-row"><div><h3>8. ICPs prioritários</h3><p class="sub">Até 3 perfis com maior aderência ao problema, à oferta e à capacidade de atendimento.</p></div><div class="row-gap"><button class="btn sm" onclick="preAI('icp')">✦ Sugerir com IA</button><button class="btn sm dark" onclick="preIcpModal(-1)" ${pre.icps.length >= 3 ? 'disabled' : ''}>＋ ICP</button></div></div>
      <div class="jp-grid">${pre.icps.map((x, i) => `<article class="jp-card"><div class="n">ICP ${i + 1} ${tag('hipotese')}</div><h4>${esc(x.name)}</h4>${ICP_FIELDS.slice(1).map(([k, l]) => x[k] ? `<p><b>${l}:</b> ${esc(x[k])}</p>` : '').join('')}<div class="row-gap"><button class="btn sm" onclick="preIcpModal(${i})">Editar</button><button class="btn sm" onclick="preIcpDel(${i})">Remover</button></div></article>`).join('') || emptyState('Nenhum ICP definido', 'Defina de 1 a 3 perfis prioritários para orientar a jornada.')}</div>
    </div>

    <div class="jp-panel"><div class="section-row"><div><h3>9. Jornada inicial</h3><p class="sub">Hipótese de comportamento: descoberta → atenção → consideração → decisão → pós-compra.</p></div><button class="btn sm" onclick="preAI('journey')">✦ Sugerir com IA</button></div>
      <div class="jp-journey-edit">${pre.journey.map((s, i) => { const n = JOURNEY_FIELDS.filter(([k]) => s[k]).length; return `<button class="jn-card" onclick="preJourneyModal(${i})"><b>${pad(i + 1, 2)} ${esc(s.name)}</b><small>${JOURNEY_HINT[i]}</small><span class="jp-mini-badge">${n}/7 campos</span>${s.situacao ? `<p>${esc(s.situacao)}</p>` : ''}</button>`; }).join('')}</div>
    </div>

    <div class="jp-panel"><div class="section-row"><div><h3>10. Resumo executivo</h3><p class="sub">Uma página para abrir o projeto com o cliente e o time. Edite, reordene, apague qualquer bloco ou acrescente os seus.</p></div><div class="row-gap"><button class="btn sm" onclick="preAI('summary')">✦ Refinar com IA</button><button class="btn sm" onclick="preRegen('summary')">↻ Regenerar</button></div></div>
      <div class="jp-sum">${pre.summary.blocks.map((b, i) => `<article class="jp-sumblk"><div class="sb-head"><input class="sb-label" value="${esc(b.label)}" onchange="preSumSet(${i},'label',this.value)" aria-label="Título do bloco"><select class="sb-kind" onchange="preSumSet(${i},'kind',this.value);keepScroll(renderPre)" aria-label="Tipo">${SUM_KINDS.map(k => `<option value="${k}" ${k === b.kind ? 'selected' : ''}>${{dado: 'Dado', hipotese: 'Hipótese', recomendacao: 'Recomendação'}[k]}</option>`).join('')}</select><span class="sb-tools"><button class="btn sm" onclick="preSumMove(${i},-1)" title="Subir" ${i === 0 ? 'disabled' : ''}>${ico('up', 14)}</button><button class="btn sm" onclick="preSumMove(${i},1)" title="Descer" ${i === pre.summary.blocks.length - 1 ? 'disabled' : ''}>${ico('down', 14)}</button><button class="btn sm" onclick="preSumDel(${i})" title="Apagar este bloco">${ico('trash', 14)}</button></span></div><textarea class="jp-ta" rows="3" onchange="preSumSet(${i},'text',this.value)">${esc(b.text)}</textarea></article>`).join('') || '<p class="muted">Nenhum bloco. Selecione desafios para gerar um rascunho ou adicione um bloco.</p>'}</div>
      <button class="btn sm" onclick="preSumAdd()">${ico('plus', 14)} Adicionar bloco</button></div>

    <div class="jp-panel"><div class="section-row"><div><h3>11. Elevator pitch</h3><p class="sub">Para explicar o projeto em cerca de <b id="pitchSecs">${pitchSeconds(pre.pitch.text)}</b> segundos, sem inventar números. Edite à vontade.</p></div><div class="row-gap"><button class="btn sm" onclick="preAI('pitch')">✦ Refinar com IA</button><button class="btn sm" onclick="preRegen('pitch')">↻ Regenerar</button></div></div>
      <div class="jp-pitchbox"><div class="type">PITCH ${tag(rec)}</div><textarea class="jp-ta" rows="5" placeholder="Será gerado a partir do diagnóstico e do objetivo." onchange="prePitchSet('text',this.value)">${esc(pre.pitch.text)}</textarea></div>
      <div class="jp-pitchbox" style="margin-top:10px"><div class="type">EM UMA FRASE</div><textarea class="jp-ta" rows="2" onchange="prePitchSet('short',this.value)">${esc(pre.pitch.short)}</textarea></div></div>

    <div class="jp-panel"><h3>12. Validação e gates</h3><p class="sub">O pré-projeto organiza a hipótese estratégica. O posicionamento continua sendo o gate antes da estratégia definitiva.</p>
      <div class="jp-checklist">${checks.map(c => `<div class="chk ${c[0] ? 'ok' : ''}"><span>${c[0] ? '✓' : '○'}</span>${esc(c[1])}</div>`).join('')}</div>
      <div class="jp-gate-flow"><span>BRIEFING</span><b>→</b><span>DIAGNÓSTICO</span><b>→</b><span>HIPÓTESES</span><b>→</b><span>JUSTIFICATIVA</span><b>→</b><span>OBJETIVO + OKR</span><b>→</b><span>VALIDAÇÃO</span><b>→</b><span>POSICIONAMENTO</span><b>→</b><span>ESTRATÉGIA</span></div>
      <div class="jp-gate"><div><strong id="jpGateLabel">${apr ? 'PRÉ-PROJETO APROVADO' : 'AGUARDANDO VALIDAÇÃO'}</strong><p>${apr ? 'Próximo gate: <b>POSICIONAMENTO</b>. Defina como a empresa quer ocupar espaço na mente do mercado antes de fechar a estratégia.' : (allOk ? 'Checklist completo: envie para revisão e depois aprove.' : 'Complete o checklist para enviar para revisão.')}</p></div>${apr ? `<button class="btn dark" onclick="state.activeProjectId='${p.id}';ui.tab='strategy';renderProjectTab()">Abrir Posicionamento →</button>` : ''}</div>
      ${pre.history.length ? `<details class="jp-history"><summary>Histórico (${pre.history.length})</summary>${pre.history.map(h => `<div><span class="mono">${fmtDateTime(h.at)}</span> <b>${esc(h.action)}</b> ${esc(h.note)}</div>`).join('')}</details>` : ''}
    </div>
  </div>`;
}

/* ---- IA (opcional): sempre produz hipóteses/recomendações editáveis ---- */
async function preAI(kind) {
  if (!aiReady()) { toast('IA não configurada. Veja Integrações.'); return; }
  const p = preP(), pre = p.pre, items = preItems(pre);
  if (!items.length && kind !== 'icp' && kind !== 'journey') { toast('Selecione ao menos um desafio.'); return; }
  const ctx = projectContext(p);
  try {
    if (kind === 'hyp') {
      const j = await aiJSON('Reescreva cada hipótese de forma específica ao negócio. Seja cauteloso: use "pode" e "sugere". Não invente números. Responda só JSON: {"HIP-001":"texto",...}',
        ctx + '\nHipóteses atuais:\n' + items.map(i => `${refHip(i)}: ${hypText(pre, i)}`).join('\n'));
      let n = 0; items.forEach(i => { const t = j[refHip(i)]; if (t && !(pre.hyp[i.id] && pre.hyp[i.id].edited)) { pre.hyp[i.id] = Object.assign(pre.hyp[i.id] || {}, {text: String(t)}); n++; } });
      toast(n + ' hipótese(s) refinada(s). Revise antes de validar.');
    } else if (kind === 'diag') {
      if ((pre.diagEdited || pre.justEdited || pre.objEdited) && !confirm('Substituir os textos que você editou?')) return;
      const j = await aiJSON('Consolide o diagnóstico em PT-BR. Não invente dados nem números. Responda só JSON: {"scenario","causal","consequence","need","justification","objective"}. A justificativa explica por que agir (sem repetir o diagnóstico); o objetivo diz o que precisa ser transformado.', ctx);
      pre.diag = {scenario: j.scenario || '', causal: j.causal || '', consequence: j.consequence || '', need: j.need || ''}; pre.diagEdited = true;
      if (j.justification) { pre.justification = j.justification; pre.justEdited = true; }
      if (j.objective) { pre.objective = j.objective; pre.objEdited = true; }
      toast('Diagnóstico sugerido pela IA. Revise e edite.');
    } else if (kind === 'summary') {
      if (pre.summary.edited && !confirm('Substituir os blocos que você editou?')) return;
      const j = await aiJSON('Escreva o resumo executivo para abrir o projeto, em PT-BR, claro e cauteloso. Não invente dados nem números; use "pode" e "sugere" quando for hipótese. Responda só JSON: [{"label","kind","text"}] com kind em dado|hipotese|recomendacao, 6 a 8 blocos curtos (contexto, desafio central, objetivo, como medir, para quem, como começar, o que validar, próximos passos).', ctx + '\nDiagnóstico: ' + JSON.stringify(pre.diag) + '\nObjetivo: ' + pre.objective + '\nKRs tração: ' + pre.okr.tr.join(' | ') + '\nKRs estruturação: ' + pre.okr.st.join(' | ') + '\nICPs: ' + pre.icps.map(x => x.name).join(', '));
      const arr = (Array.isArray(j) ? j : []).filter(x => x && x.text).slice(0, 10);
      if (!arr.length) { toast('A IA não devolveu blocos. Mantive o rascunho.'); return; }
      pre.summary = {edited: true, blocks: arr.map(x => ({id: uid('sb'), label: String(x.label || 'Bloco').slice(0, 80), kind: SUM_KINDS.includes(x.kind) ? x.kind : 'recomendacao', text: String(x.text)}))};
      toast('Resumo sugerido pela IA. Revise e apague o que não servir.');
    } else if (kind === 'pitch') {
      if (pre.pitch.edited && !confirm('Substituir o pitch que você editou?')) return;
      const j = await aiJSON('Escreva um elevator pitch de cerca de 30 segundos (70 a 90 palavras) em PT-BR, natural para falar em voz alta, e uma versão de uma frase. Não invente números nem resultados. Responda só JSON: {"text","short"}.', ctx + '\nDiagnóstico: ' + JSON.stringify(pre.diag) + '\nObjetivo: ' + pre.objective + '\nPosicionamento: ' + (pre.positioning || '(não definido)'));
      if (!j.text) { toast('A IA não devolveu o pitch. Mantive o rascunho.'); return; }
      pre.pitch = {text: String(j.text), short: String(j.short || ''), edited: true};
      toast('Pitch sugerido pela IA. Leia em voz alta e ajuste.');
    } else if (kind === 'icp') {
      if (pre.icps.length && !confirm('Substituir os ICPs atuais?')) return;
      const j = await aiJSON('Proponha até 3 ICPs prioritários, com base só no briefing. Responda só JSON: [{"name","profile","situation","need","behavior","intent"}]', ctx);
      pre.icps = (Array.isArray(j) ? j : []).slice(0, 3).map(x => Object.fromEntries(ICP_FIELDS.map(([k]) => [k, String(x[k] || '')])));
      toast('ICPs sugeridos. São hipóteses: valide com o cliente.');
    } else if (kind === 'journey') {
      const j = await aiJSON('Escreva a jornada inicial (hipótese) nas 5 etapas Descoberta, Atenção, Consideração, Decisão, Pós-compra. Responda só JSON: [{"situacao","duvida","dor","desejo","gatilho","objecao","confianca"}] com 5 itens.', ctx);
      (Array.isArray(j) ? j : []).slice(0, 5).forEach((x, i) => JOURNEY_FIELDS.forEach(([k]) => { pre.journey[i][k] = String(x[k] || ''); }));
      toast('Jornada sugerida. É uma hipótese: revise.');
    }
    preTouch(); keepScroll(renderPre);
  } catch (e) { toast('IA: ' + e.message); }
}
