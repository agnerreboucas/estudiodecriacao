/* ===== Motor de Engenharia de Ofertas & Anúncios (PRD) =====
   Projeto → Diagnóstico → 30 conceitos → escolha → 30 ângulos → jornada (150 células) → ofertas → copies → anúncios → testes.
   Os anúncios são consequência da estratégia. Cada etapa devolve JSON, é salva no projeto (p.engine) e pode ser regenerada. */
const OF_STAGES = [
  {k: 'descoberta', n: 'Descoberta', xl: 'Descoberta', goal: 'Gerar atenção, identificação e percepção de oportunidade.', offer: 'implícita', rule: 'a oferta fica implícita: só sugere que existe um caminho, sem preço nem pedido de compra.'},
  {k: 'atencao', n: 'Atenção', xl: 'Atenção', goal: 'Aprofundar problema, desejo e relevância.', offer: 'contextual', rule: 'a oferta é contextual: aparece como parte da solução do problema que está sendo aprofundado.'},
  {k: 'consideracao', n: 'Consideração', xl: 'Consideração', goal: 'Construir confiança, diferenciação, prova e preferência.', offer: 'explicada', rule: 'a oferta é explicada: o que é, como funciona, por que é diferente, com a prova que sustenta.'},
  {k: 'compra', n: 'Compra', xl: 'Compra', goal: 'Reduzir risco, apresentar oferta, preço e CTA.', offer: 'explícita', rule: 'a oferta é explícita: o que se leva, condições, preço (só se informado), redução de risco e CTA direto.'},
  {k: 'apologia', n: 'Apologia', xl: 'Apologia', goal: 'Transformar cliente em promotor, indicador e defensor.', offer: 'de continuidade e indicação', rule: 'a oferta é de continuidade ou indicação: próximo passo para quem já comprou e convite para indicar.'}
];
const OF_STAGE_KEYS = OF_STAGES.map(s => s.k), OF_STAGE = k => OF_STAGES.find(s => s.k === k) || OF_STAGES[0];
const OF_STATES = ['DRAFT', 'DIAGNOSIS_READY', 'CONCEPTS_GENERATED', 'CONCEPT_SELECTED', 'ANGLES_GENERATED', 'JOURNEY_GENERATED', 'OFFERS_GENERATED', 'COPIES_GENERATED', 'ADS_GENERATED', 'READY_FOR_TEST'];
const OF_STEPS = [
  {n: 1, k: 'projeto', t: 'Projeto'}, {n: 2, k: 'diagnostico', t: 'Diagnóstico'}, {n: 3, k: 'conceitos', t: '30 conceitos'}, {n: 4, k: 'escolha', t: 'Escolha'}, {n: 5, k: 'angulos', t: '30 ângulos'},
  {n: 6, k: 'jornada', t: 'Jornada 150'}, {n: 7, k: 'ofertas', t: 'Ofertas'}, {n: 8, k: 'copies', t: 'Copies'}, {n: 9, k: 'anuncios', t: 'Anúncios'}, {n: 10, k: 'testes', t: 'Testes'}
];
const OF_INPUT = [
  ['produto', 'Produto / serviço', 'O que está sendo vendido?'], ['publico', 'Público', 'Quem compra?'], ['mercado', 'Mercado', 'Segmento, região, concorrentes diretos'], ['descricao', 'Descrição', 'Como funciona, o que entrega', 1],
  ['diferenciais', 'Características e diferenciais', 'O que só este projeto tem', 1], ['preco', 'Preço', 'Deixe vazio se não houver: aparecerá [PREÇO NÃO INFORMADO]'], ['condicoes', 'Condições comerciais', 'Parcelamento, garantia, bônus, prazos'],
  ['provas', 'Provas reais', 'Resultados, números, certificações que você pode comprovar', 1], ['depoimentos', 'Depoimentos reais', 'Só os que existem'], ['urgencias', 'Urgência real', 'Prazo, estoque, evento ou capacidade que existem de verdade'],
  ['restricoes', 'Restrições', 'O que não pode ser prometido ou dito', 1], ['objetivos', 'Objetivos', 'Meta de vendas, leads, agenda...'], ['extra', 'Outras informações', 'Materiais, links, observações', 1]
];
const OF_DIAG = [['produto', 'Produto', 'O que está sendo vendido?'], ['cliente', 'Cliente', 'Quem compra?'], ['problema', 'Problema', 'Qual problema é resolvido?'], ['desejo', 'Desejo', 'O que o cliente realmente quer?'], ['dor', 'Dor', 'O que incomoda?'], ['consequencia', 'Consequência', 'O que acontece se nada mudar?'],
  ['objecoes', 'Objeções', 'Por que o cliente hesitaria?'], ['alternativas', 'Alternativas', 'Contra o que compete?'], ['diferenciacao', 'Diferenciação', 'Por que escolher esta solução?'], ['provas', 'Provas', 'O que comprova a promessa?'], ['oferta', 'Oferta', 'O que pode ser oferecido?'], ['restricoes', 'Restrições', 'O que não pode ser prometido?']];
const OF_CRIT = [['desire', 'Desejo', 0.20], ['purchase', 'Potencial de compra', 0.20], ['need', 'Necessidade percebida', 0.15], ['urgency', 'Urgência legítima', 0.15], ['pain', 'Intensidade da dor', 0.10], ['differentiation', 'Diferenciação', 0.10], ['offer', 'Potencial de oferta', 0.05], ['communication', 'Facilidade de comunicação', 0.05]];
const OF_FORMATS = {
  meta: {n: 'Meta Ads · Feed (Instagram e Facebook)', spec: 'headline até 40 caracteres; sub: linha de apoio até 90; text: texto principal até 500 caracteres; desc até 30; visual: direção do criativo estático.'},
  stories: {n: 'Stories / Reels (roteiro curto)', spec: 'headline: gancho dos 2 primeiros segundos; text: roteiro em 3 a 5 cenas curtas; visual: direção de cada cena; desc vazio.'},
  google: {n: 'Google Search (anúncio responsivo)', spec: 'headline: 3 títulos separados por " | ", cada um com até 30 caracteres; text: 2 descrições separadas por " | ", cada uma com até 90 caracteres; visual vazio.'},
  tiktok: {n: 'TikTok (roteiro UGC)', spec: 'headline: gancho falado nos 2 primeiros segundos; text: roteiro falado em primeira pessoa, 15 a 30 s; visual: o que aparece na tela.'},
  youtube: {n: 'YouTube (vídeo curto)', spec: 'headline: gancho falado; text: roteiro de 20 a 45 s com abertura, desenvolvimento e CTA; visual: planos principais.'},
  linkedin: {n: 'LinkedIn', spec: 'headline até 70 caracteres; text: texto principal profissional até 600 caracteres; desc até 70; visual: direção do criativo.'},
  whatsapp: {n: 'WhatsApp (mensagem de abordagem)', spec: 'headline: primeira linha da mensagem; text: mensagem completa e curta, tom de conversa, até 400 caracteres; visual vazio.'},
  estatico: {n: 'Criativo estático (texto na arte)', spec: 'headline até 60 caracteres; sub até 100; desc: texto de apoio até 150; cta curto; visual: composição da arte.'},
  ugc: {n: 'UGC (depoimento gravado)', spec: 'headline: abertura do relato; text: roteiro em primeira pessoa SEM inventar resultados nem depoimentos (marque [PROVA NECESSÁRIA] onde o relato exigir prova real); visual: direção da gravação.'}
};
const OF_METRICS = [['ctr', 'CTR %'], ['cpc', 'CPC'], ['cpm', 'CPM'], ['cpl', 'CPL'], ['cpa', 'CPA'], ['conv', 'Conversão %'], ['roas', 'ROAS'], ['sales', 'Vendas'], ['revenue', 'Receita']];
const OF_PARENT = {diag: 'input', concepts: 'diag', sel: 'concepts', angles: 'sel', cells: 'angles'};
const OF_REVKEYS = ['input', 'diag', 'concepts', 'sel', 'angles', 'cells'];

/* ---------- modelo ---------- */
function newEngine() {
  const input = {}; OF_INPUT.forEach(f => input[f[0]] = '');
  return {v: 1, status: 'DRAFT', useCtx: true, input, diag: null, concepts: [], selection: null, angles: [], cells: [], ads: [], tests: null,
    rev: {input: 1, diag: 0, concepts: 0, sel: 0, angles: 0, cells: 0}, from: {}, log: []};
}
function normalizeEngine(x) {
  const e = newEngine(); if (!x || typeof x !== 'object') return e;
  const str = (v, n) => String(v == null ? '' : v).slice(0, n || 2000), sid = v => /^[\w-]{1,80}$/.test(String(v || '')), arr = (a, m) => (Array.isArray(a) ? a : []).filter(i => i && typeof i === 'object').slice(0, m);
  const num = (v, d) => { v = +v; return isFinite(v) ? v : d; }, o = v => (v && typeof v === 'object' ? v : {});
  e.status = OF_STATES.includes(x.status) ? x.status : 'DRAFT'; e.useCtx = x.useCtx !== false;
  OF_INPUT.forEach(f => e.input[f[0]] = str(o(x.input)[f[0]], 4000));
  OF_REVKEYS.forEach(k => e.rev[k] = Math.max(0, num(o(x.rev)[k], e.rev[k]))); OF_REVKEYS.forEach(k => { if (o(x.from)[k] != null) e.from[k] = num(x.from[k], 0); });
  if (x.diag && typeof x.diag === 'object') { const f = {}; OF_DIAG.forEach(d => f[d[0]] = str(o(x.diag.fields)[d[0]], 3000)); e.diag = {fields: f, missing: arr(x.diag.missing, 20).map(m => ({field: str(m.field, 80), q: str(m.q, 300), a: str(m.a, 1500)})), assumptions: (Array.isArray(x.diag.assumptions) ? x.diag.assumptions : []).slice(0, 20).map(t => str(t, 400)), at: str(x.diag.at, 40)}; }
  const CF = ['name', 'description', 'problem', 'desire', 'transformation', 'mechanism', 'urgencyNote', 'differentiation', 'offerNote', 'justification'];
  e.concepts = arr(x.concepts, 60).filter(c => sid(c.id)).map(c => { const r = {id: c.id}; CF.forEach(k => r[k] = str(c[k], 1500)); r.scores = {}; OF_CRIT.forEach(k => r.scores[k[0]] = Math.max(0, Math.min(100, num(o(c.scores)[k[0]], 50)))); r.total = ofTotal(r.scores); return r; });
  if (x.selection && sid(x.selection.conceptId)) e.selection = {conceptId: x.selection.conceptId, at: str(x.selection.at, 40), by: str(x.selection.by, 80), locked: x.selection.locked !== false, rev: num(x.selection.rev, 0)};
  const AF = ['name', 'perspective', 'pain', 'desire', 'objection', 'mechanism', 'promise', 'offerOpp'];
  e.angles = arr(x.angles, 60).filter(a => sid(a.id)).map(a => { const r = {id: a.id, stage: OF_STAGE_KEYS.includes(a.stage) ? a.stage : 'descoberta', potential: Math.max(0, Math.min(100, num(a.potential, 50))), rev: Math.max(0, num(a.rev, 0))}; AF.forEach(k => r[k] = str(a[k], 1500)); return r; });
  const OFK = ['promise', 'benefit', 'bonus', 'proof', 'guarantee', 'risk', 'mechanism', 'cta'], CPK = ['hook', 'context', 'problem', 'desire', 'mechanism', 'offer', 'proof', 'risk', 'cta'];
  e.cells = arr(x.cells, 200).filter(c => sid(c.id) && sid(c.aid) && OF_STAGE_KEYS.includes(c.stage)).map(c => {
    const r = {id: c.id, aid: c.aid, stage: c.stage, ar: Math.max(0, num(c.ar, 0)), o: Math.max(0, num(c.o, 0)), co: Math.max(0, num(c.co, 0)), c: Math.max(0, num(c.c, 0)), offer: null, copy: null};
    if (c.offer && typeof c.offer === 'object') { r.offer = {}; OFK.forEach(k => r.offer[k] = str(c.offer[k], 1200)); }
    if (c.copy && typeof c.copy === 'object') { r.copy = {}; CPK.forEach(k => r.copy[k] = str(c.copy[k], 1200)); } return r; });
  e.ads = arr(x.ads, 600).filter(a => sid(a.id) && sid(a.cell)).map(a => ({id: a.id, cell: a.cell, fmt: OF_FORMATS[a.fmt] ? a.fmt : 'meta', cc: Math.max(0, num(a.cc, 0)), created: str(a.created, 40),
    variants: arr(a.variants, 6).map(v => ({id: sid(v.id) ? v.id : uid('vr'), headline: str(v.headline, 600), sub: str(v.sub, 600), text: str(v.text, 4000), desc: str(v.desc, 600), cta: str(v.cta, 200), visual: str(v.visual, 2000)})),
    metrics: (() => { const m = {}; OF_METRICS.forEach(k => { const v = o(a.metrics)[k[0]]; if (v !== undefined && v !== '' && isFinite(+v)) m[k[0]] = +v; }); return m; })()}));
  if (x.tests && typeof x.tests === 'object') e.tests = {macro: str(x.tests.macro, 3000), micro: str(x.tests.micro, 3000), hypotheses: arr(x.tests.hypotheses, 20).map(h => ({h: str(h.h, 500), cells: str(h.cells, 300), metric: str(h.metric, 200)})), rules: (Array.isArray(x.tests.rules) ? x.tests.rules : []).slice(0, 20).map(t => str(t, 400)), at: str(x.tests.at, 40)};
  e.log = arr(x.log, 300).map(l => ({t: str(l.t, 40), who: str(l.who, 60), a: str(l.a, 80), s: str(l.s, 40), d: str(l.d, 300)}));
  return e;
}
const ofEng = p => { if (!p.engine || p.engine.v !== 1 || !p.engine.rev) p.engine = normalizeEngine(p.engine); return p.engine; };
const ofTotal = s => Math.round(OF_CRIT.reduce((a, c) => a + (+s[c[0]] || 0) * c[2], 0) * 10) / 10;
const ofWho = () => 'Usuário';
function ofLog(e, a, s, d) { e.log.unshift({t: new Date().toISOString(), who: ofWho(), a, s: s || '', d: String(d || '').slice(0, 300)}); if (e.log.length > 300) e.log.length = 300; }
function ofSetStatus(e) {
  let i = 0; const ok = [!!e.diag, e.concepts.length > 0, !!e.selection, e.angles.length > 0, e.cells.length > 0, e.cells.some(c => c.offer), e.cells.some(c => c.copy), e.ads.length > 0, !!e.tests];
  ok.forEach((v, k) => { if (v && i === k) i = k + 1; });
  e.status = OF_STATES[Math.min(i, OF_STATES.length - 1)];
}
function ofBump(e, k) { e.rev[k] = (e.rev[k] || 0) + 1; }
function ofMark(e, k) { e.from[k] = e.rev[OF_PARENT[k]] || 0; }
function ofSel(e) { return e.selection ? e.concepts.find(c => c.id === e.selection.conceptId) || null : null; }
const ofAngle = (e, id) => e.angles.find(a => a.id === id), ofCell = (e, id) => e.cells.find(c => c.id === id);
/* O que ficou desatualizado depois de uma edição (PRD §5 e §19) */
function ofStale(e) {
  const s = {}, st = k => e.from[k] !== undefined && e.from[k] !== e.rev[OF_PARENT[k]];
  if (e.diag && st('diag')) s.diag = 'o projeto mudou depois do diagnóstico';
  if (e.concepts.length && st('concepts')) s.concepts = 'o diagnóstico mudou depois dos conceitos';
  if (e.selection && st('sel')) s.sel = 'os conceitos foram regenerados ou o conceito escolhido foi editado';
  if (e.angles.length && st('angles')) s.angles = 'o conceito escolhido mudou depois dos ângulos';
  if (e.cells.length && st('cells')) s.cells = 'os ângulos foram regenerados depois da matriz';
  const bo = e.cells.filter(c => c.offer && ofAngle(e, c.aid) && c.ar !== ofAngle(e, c.aid).rev).length, bc = e.cells.filter(c => c.copy && c.co !== c.o).length, ba = e.ads.filter(a => { const c = ofCell(e, a.cell); return c && a.cc !== c.c; }).length;
  if (bo) s.offers = bo + ' célula(s) com ângulo editado depois da oferta'; if (bc) s.copies = bc + ' copy(ies) com oferta editada depois'; if (ba) s.ads = ba + ' anúncio(s) com copy editada depois';
  return s;
}
const ofStepStale = (st, k) => ({diagnostico: st.diag, conceitos: st.concepts, escolha: st.sel, angulos: st.angles, jornada: st.cells, ofertas: st.offers, copies: st.copies, anuncios: st.ads})[k] || '';

/* ---------- regras (preço, prova, urgência) ---------- */
function ofLint(e, o) {
  const t = Object.values(o || {}).filter(v => typeof v === 'string').join(' \n '), i = e.input, w = [];
  if (!i.preco.trim() && /R\$\s?\d|\d+\s*(reais|x de\s?\d)|por apenas \d/i.test(t)) w.push('Cita preço, mas nenhum preço foi informado');
  if (!i.provas.trim() && !i.depoimentos.trim() && /\d+[.,]?\d*\s?(%|mil\b|clientes|alunos|pacientes|vendas|avalia)|depoimento de|nota \d|certificad/i.test(t) && !/PROVA NECESS/i.test(t)) w.push('Cita número ou prova que não está no projeto');
  if (!i.urgencias.trim() && /última chance|últimas vagas|só hoje|acaba hoje|termina hoje|restam \d|corra|contagem regressiva|por tempo limitado/i.test(t)) w.push('Urgência sem base real informada');
  if (/100%|sem risco|garantido para sempre|nunca mais|resultado garantido/i.test(t) && !/garantia/i.test(i.condicoes)) w.push('Promessa absoluta ou garantia não informada');
  return w;
}

/* ---------- IA ---------- */
const OF_RULES = `REGRAS INEGOCIÁVEIS:
- Nunca invente informação comercial. Preço: use só o informado; se não houver, escreva [PREÇO NÃO INFORMADO].
- Nunca invente depoimentos, números, clientes, resultados, avaliações, certificações ou estatísticas. Quando a prova for necessária e não existir, escreva [PROVA NECESSÁRIA] e diga que tipo de prova falta.
- Urgência só se for real (prazo, condição, estoque, evento ou capacidade informados no projeto). Proibido escassez inventada, contador falso, "última chance" falsa e desconto fictício.
- Respeite as restrições do projeto. Sem promessas absolutas. Garantias e bônus só se informados; senão escreva [A DEFINIR PELO CLIENTE] ou uma sugestão começando com "Sugestão:".
- Escreva em português do Brasil, direto, sem clichê de marketing.`;
function ofCtx(p, e, withDiag) {
  const i = e.input, lines = OF_INPUT.map(f => i[f[0]].trim() ? `${f[1]}: ${i[f[0]].trim()}` : '').filter(Boolean);
  let t = 'PROJETO / PRÉ-PROJETO (informado pelo usuário):\n' + (lines.join('\n') || '(sem campos preenchidos)');
  if (!i.preco.trim()) t += '\nPreço: [PREÇO NÃO INFORMADO]';
  if (e.useCtx && typeof projectContext === 'function') { try { t += '\n\nCONTEXTO JÁ CADASTRADO NO STUDIO:\n' + projectContext(p).slice(0, 5000); } catch (x) { } }
  if (withDiag && e.diag) t += '\n\nDIAGNÓSTICO:\n' + OF_DIAG.map(d => `${d[1]}: ${e.diag.fields[d[0]]}`).join('\n') + (e.diag.assumptions.length ? '\nHipóteses registradas: ' + e.diag.assumptions.join(' | ') : '');
  return t;
}
async function ofJSON(system, user, max) {
  let last;
  for (let n = 0; n < 2; n++) {
    const t = await aiText(system + '\nResponda APENAS com JSON válido, sem markdown e sem comentários. Aspas duplas, sem vírgula sobrando.', user + (n ? '\n\n(Sua resposta anterior não era JSON válido ou veio cortada. Seja mais curto em cada campo e devolva só o JSON.)' : ''), max || 6500);
    const s = String(t).replace(/```json|```/g, '').trim(), a = s.search(/[\[{]/), z = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']'));
    try { return JSON.parse(s.slice(a, z + 1)); } catch (x) { last = x; }
  }
  throw new Error('a IA devolveu um formato inesperado; tente de novo.');
}
const ofStr = (v, n) => String(v == null ? '' : v).trim().slice(0, n || 600);
/* Divide o lote ao meio quando a resposta vem cortada ou inválida */
async function ofBatch(items, fn, onDone) {
  if (!items.length) return;
  try { await fn(items); if (onDone) onDone(items.length); }
  catch (x) {
    if (/Limite|IA não|IA \(|401|403|429|503/.test(String(x.message))) throw x;
    if (items.length < 2) { ofUI.skipped = (ofUI.skipped || 0) + 1; return; }
    const h = Math.ceil(items.length / 2); await ofBatch(items.slice(0, h), fn, onDone); await ofBatch(items.slice(h), fn, onDone); }
}

async function ofGenDiag(p, e) {
  const j = await ofJSON('Você é um estrategista de aquisição. Faça o diagnóstico estratégico do projeto antes de qualquer conceito ou anúncio. ' + OF_RULES + `
Devolva: {"fields":{"produto":"","cliente":"","problema":"","desejo":"","dor":"","consequencia":"","objecoes":"","alternativas":"","diferenciacao":"","provas":"","oferta":"","restricoes":""},"missing":[{"field":"campo","q":"pergunta objetiva ao usuário"}],"assumptions":["hipótese explícita usada onde faltou dado"]}
Cada campo com no máximo 400 caracteres. Em "provas", liste só as que existem no projeto; se não há, escreva [PROVA NECESSÁRIA] e o tipo. Em "missing" liste só dados críticos que faltam (máx. 6). Em "assumptions", toda hipótese que você precisou usar (máx. 6), claramente marcada como hipótese.`, ofCtx(p, e, false), 4000);
  const f = {}; OF_DIAG.forEach(d => f[d[0]] = ofStr((j.fields || {})[d[0]], 1500));
  e.diag = {fields: f, missing: (Array.isArray(j.missing) ? j.missing : []).slice(0, 6).map(m => ({field: ofStr(m.field, 80), q: ofStr(m.q, 300), a: ''})), assumptions: (Array.isArray(j.assumptions) ? j.assumptions : []).slice(0, 6).map(t => ofStr(t, 400)), at: new Date().toISOString()};
  ofBump(e, 'diag'); ofMark(e, 'diag'); ofLog(e, 'Diagnóstico gerado', 'diagnostico', e.diag.missing.length + ' dado(s) faltando');
}

const OF_FAM = ['dor, consequência de não agir, necessidade e urgência legítima', 'desejo, transformação, identidade, status e mecanismo', 'diferenciação, alternativas, inimigo comum, prova, redução de risco e oferta'];
async function ofGenConcepts(p, e, prog, append) {
  const keep = e.concepts.slice(); if (!append) e.concepts = []; let err = null, tries = 0;
  while (e.concepts.length < 30 && tries++ < 5 && !ofUI.cancel) {
    prog(`Conceitos ${e.concepts.length}/30`);
    const need = Math.min(10, 30 - e.concepts.length), fam = OF_FAM[Math.floor(e.concepts.length / 10) % 3], names = e.concepts.map(c => c.name).join('; ');
    try {
      const j = await ofJSON('Você cria TERRITÓRIOS ESTRATÉGICOS de comunicação (grandes ideias comerciais). Não são headlines, anúncios nem slogans. ' + OF_RULES + `
Gere exatamente ${need} conceitos NOVOS, bem diferentes entre si e dos já criados. Foco deste lote: ${fam}.
Devolva {"concepts":[{"name":"","description":"até 200 caracteres","problem":"","desire":"","transformation":"","mechanism":"","urgencyNote":"urgência legítima possível ou 'sem urgência real informada'","differentiation":"","offerNote":"potencial de oferta","justification":"por que funciona","scores":{"desire":0,"purchase":0,"need":0,"urgency":0,"pain":0,"differentiation":0,"offer":0,"communication":0}}]}
Notas de 0 a 100 honestas e variadas (nem todas acima de 85). Urgência só alta se houver urgência real no projeto. Cada campo de texto com até 160 caracteres.`, ofCtx(p, e, true) + (names ? '\n\nCONCEITOS JÁ CRIADOS (não repita): ' + names : ''), 7000);
      (Array.isArray(j.concepts) ? j.concepts : []).slice(0, need).forEach(c => {
        if (!c || !c.name || e.concepts.length >= 30) return; const sc = {}; OF_CRIT.forEach(k => sc[k[0]] = Math.max(0, Math.min(100, Math.round(+(c.scores || {})[k[0]] || 0))));
        e.concepts.push({id: 'C' + String(e.concepts.length + 1).padStart(2, '0'), name: ofStr(c.name, 120), description: ofStr(c.description, 400), problem: ofStr(c.problem, 400), desire: ofStr(c.desire, 400), transformation: ofStr(c.transformation, 400), mechanism: ofStr(c.mechanism, 400), urgencyNote: ofStr(c.urgencyNote, 400), differentiation: ofStr(c.differentiation, 400), offerNote: ofStr(c.offerNote, 400), justification: ofStr(c.justification, 600), scores: sc, total: ofTotal(sc)});
      });
    } catch (x) { err = x; break; }
  }
  if (!e.concepts.length) { e.concepts = keep; throw err || new Error('nenhum conceito foi gerado.'); }
  ofBump(e, 'concepts'); ofMark(e, 'concepts'); ofLog(e, append ? 'Conceitos completados' : 'Conceitos gerados', 'conceitos', e.concepts.length + ' conceitos');
  if (err) throw new Error(`só ${e.concepts.length} de 30 conceitos foram gerados (${err.message}). Use "Completar até 30".`);
}
async function ofGenAngles(p, e, prog, append) {
  const c = ofSel(e); if (!c) throw new Error('escolha um conceito antes.');
  const keep = e.angles.slice(); if (!append) { e.angles = []; e.cells = []; e.ads = []; } let err = null, tries = 0;
  const cs = `CONCEITO ESCOLHIDO (fonte estratégica principal):\nNome: ${c.name}\nDescrição: ${c.description}\nProblema: ${c.problem}\nDesejo: ${c.desire}\nTransformação: ${c.transformation}\nMecanismo: ${c.mechanism}\nDiferenciação: ${c.differentiation}`;
  while (e.angles.length < 30 && tries++ < 5 && !ofUI.cancel) {
    prog(`Ângulos ${e.angles.length}/30`);
    const need = Math.min(10, 30 - e.angles.length), names = e.angles.map(a => a.name).join('; ');
    try {
      const j = await ofJSON('Você deriva ÂNGULOS de comunicação a partir de UM conceito. Todo ângulo precisa nascer do conceito e nunca contradizê-lo nem abandoná-lo. ' + OF_RULES + `
Gere exatamente ${need} ângulos NOVOS e diferentes entre si, distribuídos entre os estágios ideais da jornada (descoberta, atencao, consideracao, compra, apologia), equilibrando com os já criados.
Devolva {"angles":[{"name":"","perspective":"ponto de vista","pain":"","desire":"","objection":"","mechanism":"","promise":"promessa sem exagero","offerOpp":"oportunidade de oferta","stage":"descoberta|atencao|consideracao|compra|apologia","potential":0}]}
potential = potencial comercial de 0 a 100. Cada campo com até 140 caracteres.`, ofCtx(p, e, true) + '\n\n' + cs + (names ? '\n\nÂNGULOS JÁ CRIADOS (não repita): ' + names : ''), 7000);
      (Array.isArray(j.angles) ? j.angles : []).slice(0, need).forEach(a => {
        if (!a || !a.name || e.angles.length >= 30) return;
        e.angles.push({id: 'A' + String(e.angles.length + 1).padStart(2, '0'), name: ofStr(a.name, 120), perspective: ofStr(a.perspective, 400), pain: ofStr(a.pain, 400), desire: ofStr(a.desire, 400), objection: ofStr(a.objection, 400), mechanism: ofStr(a.mechanism, 400), promise: ofStr(a.promise, 400), offerOpp: ofStr(a.offerOpp, 400),
          stage: OF_STAGE_KEYS.includes(a.stage) ? a.stage : 'descoberta', potential: Math.max(0, Math.min(100, Math.round(+a.potential || 50))), rev: 0});
      });
    } catch (x) { err = x; break; }
  }
  if (!e.angles.length) { e.angles = keep; throw err || new Error('nenhum ângulo foi gerado.'); }
  ofBump(e, 'angles'); ofMark(e, 'angles'); ofLog(e, append ? 'Ângulos completados' : 'Ângulos gerados', 'angulos', e.angles.length + ' ângulos');
  if (err) throw new Error(`só ${e.angles.length} de 30 ângulos foram gerados (${err.message}). Use "Completar até 30".`);
}
/* A matriz 30 × 5 é determinística: ângulo × estágio, sem custo de IA */
function ofBuildCells(e) {
  const old = {}; e.cells.forEach(c => old[c.id] = c); e.cells = [];
  e.angles.forEach(a => OF_STAGES.forEach(s => { const id = a.id + '-' + s.k, o = old[id]; e.cells.push(o ? o : {id, aid: a.id, stage: s.k, ar: a.rev, o: 0, co: 0, c: 0, offer: null, copy: null}); }));
  ofMark(e, 'cells'); ofLog(e, 'Jornada montada', 'jornada', e.cells.length + ' células');
}
const ofAnglesTxt = (e, list) => list.map(a => `${a.id} "${a.name}" | promessa: ${a.promise} | mecanismo: ${a.mechanism} | objeção: ${a.objection} | oportunidade de oferta: ${a.offerOpp}`).join('\n');
const OF_OFK = ['promise', 'benefit', 'bonus', 'proof', 'guarantee', 'risk', 'mechanism', 'cta'], OF_CPK = ['hook', 'context', 'problem', 'desire', 'mechanism', 'offer', 'proof', 'risk', 'cta'];
async function ofGenOffers(p, e, aids, prog) {
  const angles = e.angles.filter(a => !aids || aids.includes(a.id)), c = ofSel(e); let done = 0;
  const grp = []; for (let i = 0; i < angles.length; i += 6) grp.push(angles.slice(i, i + 6));
  for (const g of grp) {
    if (ofUI.cancel) break; prog(`Ofertas ${done}/${angles.length} ângulos`);
    await ofBatch(g, async list => {
      const j = await ofJSON('Você monta a OFERTA de cada célula (ângulo × estágio). Oferta não é só preço: pode mudar promessa, benefício enfatizado, bônus, prova, garantia, redução de risco, mecanismo e CTA. A oferta acompanha a maturidade do cliente:\n' + OF_STAGES.map(s => `- ${s.n}: ${s.rule}`).join('\n') + '\n' + OF_RULES + `
Devolva {"offers":[{"cell":"A01-descoberta","promise":"","benefit":"","bonus":"","proof":"","guarantee":"","risk":"","mechanism":"","cta":""}]}
Uma oferta para CADA ângulo × estágio da lista (${list.length * 5} itens). Cada campo com até 110 caracteres; se não se aplica ao estágio, deixe "".`, ofCtx(p, e, true) + '\nCONCEITO: ' + (c ? c.name + ' — ' + c.description : '') + '\n\nÂNGULOS:\n' + ofAnglesTxt(e, list), 7500);
      (Array.isArray(j.offers) ? j.offers : []).forEach(o => { const cell = ofCell(e, ofStr(o && o.cell, 80)); if (!cell || !list.some(a => a.id === cell.aid)) return; cell.offer = {}; OF_OFK.forEach(k => cell.offer[k] = ofStr(o[k], 600)); cell.o++; cell.ar = (ofAngle(e, cell.aid) || {rev: 0}).rev; });
      if (list.some(a => OF_STAGE_KEYS.some(s => !(ofCell(e, a.id + '-' + s) || {}).offer))) throw new Error('lote incompleto');
    }, n => { done += n; });
  }
  ofLog(e, 'Ofertas geradas', 'ofertas', (aids ? aids.join(',') : 'todas'));
}
async function ofGenCopies(p, e, aids, prog) {
  const angles = e.angles.filter(a => (!aids || aids.includes(a.id)) && OF_STAGE_KEYS.some(s => (ofCell(e, a.id + '-' + s) || {}).offer)), c = ofSel(e); let done = 0;
  const grp = []; for (let i = 0; i < angles.length; i += 3) grp.push(angles.slice(i, i + 3));
  for (const g of grp) {
    if (ofUI.cancel) break; prog(`Copies ${done}/${angles.length} ângulos`);
    await ofBatch(g, async list => {
      const cells = list.flatMap(a => OF_STAGE_KEYS.map(s => ofCell(e, a.id + '-' + s)).filter(x => x && x.offer));
      const j = await ofJSON('Você escreve a COPY BASE de cada célula estratégica. A copy segue o estágio da jornada e a oferta da célula, sem mudar a estratégia. ' + OF_RULES + `
Devolva {"copies":[{"cell":"A01-descoberta","hook":"primeira ideia que interrompe a atenção","context":"por que importa","problem":"tensão explorada","desire":"","mechanism":"como a solução resolve","offer":"o que é proposto, no nível do estágio","proof":"o que sustenta (ou [PROVA NECESSÁRIA])","risk":"por que é seguro avançar","cta":"próximo passo"}]}
Uma copy para CADA célula listada (${cells.length}). Cada campo com até 150 caracteres. Descoberta e Atenção não pedem compra direta.`,
        ofCtx(p, e, true) + '\nCONCEITO: ' + (c ? c.name + ' — ' + c.description : '') + '\n\nCÉLULAS:\n' + cells.map(x => { const a = ofAngle(e, x.aid); return `${x.id} | ângulo "${a.name}" | estágio ${OF_STAGE(x.stage).n} (${OF_STAGE(x.stage).goal}) | promessa: ${x.offer.promise} | benefício: ${x.offer.benefit} | bônus: ${x.offer.bonus} | prova: ${x.offer.proof} | garantia: ${x.offer.guarantee} | risco: ${x.offer.risk} | CTA: ${x.offer.cta}`; }).join('\n'), 7800);
      (Array.isArray(j.copies) ? j.copies : []).forEach(o => { const cell = ofCell(e, ofStr(o && o.cell, 80)); if (!cell || !cell.offer || !list.some(a => a.id === cell.aid)) return; cell.copy = {}; OF_CPK.forEach(k => cell.copy[k] = ofStr(o[k], 600)); cell.c++; cell.co = cell.o; });
      if (cells.some(x => !x.copy)) throw new Error('lote incompleto');
    }, n => { done += n; });
  }
  ofLog(e, 'Copies geradas', 'copies', aids ? aids.join(',') : 'todas');
}
async function ofGenAds(p, e, cellIds, fmt, nVar, prog) {
  const cells = cellIds.map(id => ofCell(e, id)).filter(c => c && c.copy), F = OF_FORMATS[fmt], c0 = ofSel(e); let done = 0;
  for (let i = 0; i < cells.length; i += 5) {
    if (ofUI.cancel) break; prog(`Anúncios ${done}/${cells.length}`);
    await ofBatch(cells.slice(i, i + 5), async list => {
      const j = await ofJSON(`Você transforma a COPY BASE em anúncios finais para: ${F.n}. A estratégia já está decidida (conceito, ângulo, estágio, oferta e copy): não a mude, só a execute neste formato. ` + OF_RULES + `
Formato: ${F.spec}
Devolva {"ads":[{"cell":"A01-descoberta","variants":[{"headline":"","sub":"","text":"","desc":"","cta":"","visual":""}]}]}
Para CADA célula, ${nVar} variação(ões) criativa(s) realmente diferentes (outro gancho ou outra forma de abrir), mantendo a mesma estratégia. Campos que o formato não usa ficam "".`,
        ofCtx(p, e, false).slice(0, 3500) + '\nCONCEITO: ' + (c0 ? c0.name : '') + '\n\nCÉLULAS:\n' + list.map(x => { const a = ofAngle(e, x.aid); return `${x.id} | ângulo "${a.name}" | estágio ${OF_STAGE(x.stage).n} | ${OF_CPK.map(k => k + ': ' + x.copy[k]).join(' | ')}`; }).join('\n'), 7500);
      (Array.isArray(j.ads) ? j.ads : []).forEach(o => { const cell = ofCell(e, ofStr(o && o.cell, 80)); if (!cell || !list.includes(cell)) return;
        const vs = (Array.isArray(o.variants) ? o.variants : []).slice(0, nVar).map(v => ({id: uid('vr'), headline: ofStr(v.headline, 600), sub: ofStr(v.sub, 600), text: ofStr(v.text, 4000), desc: ofStr(v.desc, 600), cta: ofStr(v.cta, 200), visual: ofStr(v.visual, 2000)})); if (!vs.length) return;
        e.ads = e.ads.filter(a => !(a.cell === cell.id && a.fmt === fmt)); e.ads.push({id: uid('ad'), cell: cell.id, fmt, cc: cell.c, created: new Date().toISOString(), variants: vs, metrics: {}}); });
      if (list.some(x => !e.ads.some(a => a.cell === x.id && a.fmt === fmt))) throw new Error('lote incompleto');
    }, n => { done += n; });
  }
  ofLog(e, 'Anúncios gerados', 'anuncios', `${F.n}: ${cells.length} célula(s)`);
}
async function ofGenTests(p, e) {
  const top = e.cells.filter(c => c.copy).map(c => ({c, a: ofAngle(e, c.aid)})).sort((x, y) => (y.a.potential || 0) - (x.a.potential || 0)).slice(0, 12), cn = ofSel(e);
  const j = await ofJSON('Você desenha o PLANO DE TESTES de uma estrutura de anúncios. Não invente metas nem resultados: recomende a lógica do teste (o que comparar, em que ordem, qual métrica decide e quando parar). ' + OF_RULES + `
Devolva {"macro":"teste de conceito e ângulo","micro":"teste de variações dentro do ângulo vencedor","hypotheses":[{"h":"hipótese","cells":"ids das células","metric":"métrica que decide"}],"rules":["regra de decisão"]}
Até 6 hipóteses e 6 regras. Cada texto com até 250 caracteres.`, ofCtx(p, e, true).slice(0, 3500) + '\nCONCEITO: ' + (cn ? cn.name : '') + '\nCÉLULAS PRIORITÁRIAS:\n' + top.map(x => `${x.c.id} (${x.a.name}; potencial ${x.a.potential}; estágio ${OF_STAGE(x.c.stage).n}; anúncios: ${e.ads.filter(a => a.cell === x.c.id).length})`).join('\n'), 4000);
  e.tests = {macro: ofStr(j.macro, 1500), micro: ofStr(j.micro, 1500), hypotheses: (Array.isArray(j.hypotheses) ? j.hypotheses : []).slice(0, 6).map(h => ({h: ofStr(h.h, 400), cells: ofStr(h.cells, 200), metric: ofStr(h.metric, 150)})), rules: (Array.isArray(j.rules) ? j.rules : []).slice(0, 6).map(t => ofStr(t, 300)), at: new Date().toISOString()};
  ofLog(e, 'Plano de testes gerado', 'testes', '');
}

/* ---------- exportação ---------- */
const ofCsv = rows => '\ufeff' + rows.map(r => r.map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""').replace(/\r?\n/g, ' ') + '"').join(';')).join('\r\n');
function ofExport(p, what) {
  const e = ofEng(p), slug = (p.name || 'projeto').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'projeto';
  if (what === 'json') { download(`motor-ofertas-${slug}.json`, JSON.stringify(e, null, 2)); return; }
  if (what === 'cells') {
    const rows = [['Célula', 'Ângulo', 'Estágio', 'Objetivo', 'Promessa', 'Benefício', 'Bônus', 'Prova', 'Garantia', 'Redução de risco', 'Mecanismo', 'CTA da oferta', 'Hook', 'Contexto', 'Problema', 'Desejo', 'Mecanismo (copy)', 'Oferta (copy)', 'Prova (copy)', 'Risco (copy)', 'CTA (copy)']];
    e.cells.forEach(c => { const a = ofAngle(e, c.aid) || {}, o = c.offer || {}, k = c.copy || {}; rows.push([c.id, a.name, OF_STAGE(c.stage).n, OF_STAGE(c.stage).goal, o.promise, o.benefit, o.bonus, o.proof, o.guarantee, o.risk, o.mechanism, o.cta, k.hook, k.context, k.problem, k.desire, k.mechanism, k.offer, k.proof, k.risk, k.cta]); });
    download(`celulas-${slug}.csv`, ofCsv(rows), 'text/csv;charset=utf-8'); return;
  }
  if (what === 'ads') {
    const rows = [['Célula', 'Ângulo', 'Estágio', 'Formato', 'Variação', 'Headline', 'Sub-headline', 'Texto', 'Descrição', 'CTA', 'Direção visual']];
    e.ads.forEach(a => { const c = ofCell(e, a.cell) || {}, an = ofAngle(e, c.aid) || {}; a.variants.forEach((v, i) => rows.push([a.cell, an.name, OF_STAGE(c.stage).n, OF_FORMATS[a.fmt].n, i + 1, v.headline, v.sub, v.text, v.desc, v.cta, v.visual])); });
    download(`anuncios-${slug}.csv`, ofCsv(rows), 'text/csv;charset=utf-8'); return;
  }
  if (what === 'matriz') {   /* planilha no formato "Subir tabela (em lote)": cria os anúncios nas 3 medidas */
    const rows = []; e.ads.filter(a => ['meta', 'estatico', 'linkedin'].includes(a.fmt)).forEach(a => { const c = ofCell(e, a.cell) || {}, an = ofAngle(e, c.aid) || {}; a.variants.forEach((v, i) => rows.push([`${a.cell}${a.variants.length > 1 ? '-v' + (i + 1) : ''}`, OF_STAGE(c.stage).xl, an.name, v.headline, v.sub, v.text, v.desc, v.cta, '', ''])); });
    if (!rows.length) { toast('Gere anúncios nos formatos Meta, Criativo estático ou LinkedIn primeiro.'); return; }
    download(`matriz-anuncios-${slug}.xlsx`, pmBuildMatrix('ads', rows), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); toast('Planilha pronta: envie em "Subir tabela (em lote)".'); return;
  }
  if (what === 'md') {
    const c = ofSel(e), L = []; L.push(`# ${p.name} — Estratégia de ofertas e anúncios`, '');
    if (e.diag) { L.push('## Diagnóstico'); OF_DIAG.forEach(d => L.push(`- **${d[1]}:** ${e.diag.fields[d[0]]}`)); if (e.diag.assumptions.length) L.push('', '**Hipóteses usadas:** ' + e.diag.assumptions.join(' | ')); L.push(''); }
    if (c) L.push('## Conceito escolhido', `**${c.name}** (nota ${c.total}) — ${c.description}`, `- Problema: ${c.problem}`, `- Desejo: ${c.desire}`, `- Transformação: ${c.transformation}`, `- Mecanismo: ${c.mechanism}`, `- Justificativa: ${c.justification}`, '');
    e.angles.forEach(a => { L.push(`## ${a.id} · ${a.name}`, `_${a.perspective}_ — promessa: ${a.promise}`, ''); OF_STAGES.forEach(s => { const x = ofCell(e, a.id + '-' + s.k); if (!x || !(x.offer || x.copy)) return; L.push(`### ${s.n}`); if (x.offer) L.push(`**Oferta (${s.offer}):** ${x.offer.promise} ${x.offer.benefit} ${x.offer.bonus} ${x.offer.guarantee} CTA: ${x.offer.cta}`); if (x.copy) L.push(`**Hook:** ${x.copy.hook}`, `**Copy:** ${[x.copy.context, x.copy.problem, x.copy.desire, x.copy.mechanism, x.copy.offer, x.copy.proof, x.copy.risk].filter(Boolean).join(' ')} **CTA:** ${x.copy.cta}`); e.ads.filter(ad => ad.cell === x.id).forEach(ad => ad.variants.forEach((v, i) => L.push(`- _${OF_FORMATS[ad.fmt].n} #${i + 1}:_ ${v.headline} — ${v.text}`))); L.push(''); }); });
    if (e.tests) L.push('## Plano de testes', `**Macro:** ${e.tests.macro}`, `**Micro:** ${e.tests.micro}`, ...e.tests.hypotheses.map(h => `- ${h.h} (${h.cells}; métrica: ${h.metric})`), ...e.tests.rules.map(r => `- Regra: ${r}`));
    download(`estrategia-${slug}.md`, L.join('\n'), 'text/markdown;charset=utf-8');
  }
}
