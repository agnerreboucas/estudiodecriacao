/* ===== Motor do pré-projeto: lê o briefing e as respostas do projeto e monta o PRÉ-PROJETO COMPLETO com IA, em 3 etapas:
   1) diagnóstico, objetivo, resumo, pitch e cuidados do setor · 2) ICPs (dores, dúvidas, desejos, dores ocultas) e jornada ·
   3) produtos/serviços, pilares da linha editorial e as variáveis da Matriz de Criação.
   O resultado alimenta o resto do Studio: Matriz de conteúdo (ICP × insight × produto × funil), Agente Editorial, conceitos de anúncio e landing pages.
   Regra: nada de fato inventado (números, preços, credenciais, depoimentos); o que faltar vira hipótese ou [CONFIRMAR]. ===== */
const PRE_SYS = `Você é um estrategista sênior de marketing digital (tráfego pago, conteúdo e conversão) numa agência. Recebe o briefing de um cliente e monta o PRÉ-PROJETO, que será a base de TODO o projeto: anúncios, conteúdo orgânico, landing page, site e CRM.
REGRAS
1. Use SÓ o que está no briefing. O que faltar vira hipótese (diga "hipótese") ou [CONFIRMAR]. NUNCA invente números, preços, prazos, credenciais, prêmios, depoimentos, cases ou dados de mercado.
2. Pense no CLIENTE DO CLIENTE: quem é, em que situação está, o que sente (dor), o que pergunta (dúvida), o que quer (desejo) e o que não admite ou nem percebe (dor oculta).
3. Linguagem do público: concreta, direta, sem jargão. Dores e dúvidas escritas como a pessoa falaria.
4. Cada ICP precisa ser claramente DIFERENTE dos outros (situação, urgência e o que o move).
5. Se o setor for regulado (advocacia, saúde, finanças, educação, imóveis, etc.), liste as regras de publicidade a respeitar e evite qualquer promessa de resultado.
6. Conecte tudo ao serviço ou produto que o cliente realmente oferece. A maioria dos clientes vende SERVIÇO: pense em atendimento, etapas, primeira conversa e prazo, sem inventar valores.
7. Seja específico ao negócio. Frases genéricas que serviriam para qualquer empresa são erro.`;
const PRE_LISTS = [['pains', 'Dores', 'Dor', 'Atenção'], ['doubts', 'Dúvidas', 'Dúvida', 'Consideração'], ['desires', 'Desejos', 'Desejo', 'Decisão'], ['hidden', 'Dores ocultas', 'Dor oculta', 'Descoberta']];
const preS = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
const preLines = v => (Array.isArray(v) ? v : String(v || '').split(/\n+/)).map(x => String(x).replace(/^[\s\-•*\d.)]+/, '').replace(/\s+/g, ' ').trim()).filter(Boolean);
const preGen = {busy: false, step: 0, steps: ['Diagnóstico, objetivo e resumo', 'Públicos (ICPs), dores, dúvidas e jornada', 'Produtos, linha editorial e matriz'], err: '', done: [], note: ''};

function preEnsure(pre) {
  if (!pre.compliance) pre.compliance = {nome: '', regulado: false, cuidados: []}; if (!Array.isArray(pre.pillars)) pre.pillars = []; if (!pre.gen) pre.gen = {at: '', n: 0}; return pre;
}
/* tudo o que a pessoa respondeu, em texto, para a IA */
function preBrief(p) {
  const b = p.brief || {}, pre = p.pre, items = typeof preItems === 'function' ? preItems(pre) : [], br = p.brand || {};
  return [`Projeto: ${p.name}. Cliente: ${p.client || p.name}. Categoria: ${p.category || ''}. ${p.desc || ''}`, p.goal && 'Objetivo do projeto: ' + p.goal,
    b.offer && 'O que vende (produtos e serviços): ' + b.offer, b.audience && 'Quem compra / público: ' + b.audience, b.problem && 'Problema que o cliente tem: ' + b.problem, b.goal && 'Objetivo: ' + b.goal, b.channels && 'Canais atuais: ' + b.channels,
    b.budget && 'Orçamento: ' + b.budget, b.deadline && 'Prazo: ' + b.deadline, b.competitors && 'Concorrentes e referências: ' + b.competitors, b.notes && 'Observações: ' + b.notes,
    pre.briefing && 'Resumo do briefing: ' + pre.briefing, items.length && 'Desafios marcados: ' + items.map(i => i.title).join('; '),
    (br.tone || br.positioning) && `Marca: tom ${br.tone || '-'}; posicionamento ${br.positioning || '-'}`, (p.products || []).length && 'Produtos/serviços já cadastrados: ' + p.products.map(x => x.name + (x.summary ? ' (' + x.summary.slice(0, 120) + ')' : '')).join('; '),
    b.original && 'RESPOSTAS ORIGINAIS (texto livre ou transcrição):\n' + String(b.original).slice(0, 7000)].filter(Boolean).join('\n');
}
async function preJSON(system, user, max) {
  const t = await aiText(system + '\nResponda APENAS com JSON válido (sem markdown, sem comentários, sem vírgula sobrando no fim). Português do Brasil.', user, max || 7000), s = String(t).replace(/```json|```/g, '').trim(), a = s.search(/[\[{]/), z = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']'));
  try { return JSON.parse(s.slice(a, z + 1)); } catch (e) { throw new Error('a IA devolveu um formato inesperado (a resposta pode ter sido cortada). Tente de novo.'); }
}
async function preJSONRetry(system, user, max) { try { return await preJSON(system, user, max); } catch (e) { return await preJSON(system + '\nIMPORTANTE: a resposta anterior foi cortada. Seja mais enxuto: no máximo 4 itens por lista e frases curtas.', user, max); } }

function preGenRender() {
  if (!$('preGenBox')) return; const G = preGen;
  $('preGenBox').innerHTML = `<ol style="padding-left:18px;line-height:1.9;margin:6px 0">${G.steps.map((s, i) => `<li style="${G.done.includes(i) ? 'color:#176b30;font-weight:700' : G.step === i && G.busy ? 'font-weight:700' : 'color:#888'}">${G.done.includes(i) ? '✓ ' : G.step === i && G.busy ? '⏳ ' : ''}${esc(s)}</li>`).join('')}</ol>${G.err ? `<div class="so-issue aviso">${esc(G.err)}</div>` : ''}${G.note ? `<p class="muted" style="font-size:12.5px">${esc(G.note)}</p>` : ''}`;
}
async function preGenAll(force) {
  if (preGen.busy) return; if (typeof aiReady === 'function' && !aiReady()) { toast('A IA ainda não está ligada. Configure a chave em Configurações → Integrações.'); return; }
  const p = curProject(); if (!p) { toast('Abra um projeto primeiro.'); return; } const pre = preEnsure(p.pre), brief = preBrief(p);
  if (brief.length < 80) { toast('Preencha o briefing do projeto (o que vende, para quem, objetivo) antes de gerar.'); return; }
  if (!force && (pre.icps.length || pre.summary.blocks.length) && !confirm('Já existe conteúdo no pré-projeto. A IA vai refazer o que você ainda não editou. Continuar?')) return;
  Object.assign(preGen, {busy: true, step: 0, err: '', done: [], note: ''});
  showModal('Gerando o pré-projeto com IA', `<p class="muted" style="margin-top:0;font-size:13px">A IA lê todas as respostas do projeto e monta o pré-projeto completo. Leva cerca de 1 a 2 minutos. Nada é inventado: o que faltar vira hipótese ou [CONFIRMAR].</p><div id="preGenBox"></div><div class="modal-actions" id="preGenAct"></div>`); preGenRender();
  let ctx = 'BRIEFING DO PROJETO\n' + brief;
  try {
    /* 1 · fundamentos */
    const j1 = await preJSONRetry(PRE_SYS, ctx + `\n\nETAPA 1. Devolva JSON: {"setor":{"nome":"","regulado":false,"cuidados":["regras de publicidade e cuidados do setor, curtas"]},"diag":{"scenario":"cenário atual","causal":"causa raiz","consequence":"consequência se nada mudar","need":"o que precisa mudar"},"justification":"por que agir agora, sem repetir o diagnóstico","objective":"objetivo estratégico em uma frase","okr":{"objective":"","tr":["3 a 4 resultados-chave, sem inventar números: use [CONFIRMAR: meta]"],"st":["3 a 4 ações iniciais"]},"posicionamento":"sugestão de posicionamento em 1 ou 2 frases","summary":[{"label":"","kind":"dado|hipotese|recomendacao","text":""}],"pitch":{"text":"70 a 90 palavras, para falar em voz alta","short":"uma frase"}}\nO summary tem 7 a 9 blocos curtos: contexto, o cliente do cliente, problema, oportunidade, como o projeto funciona (anúncios → site ou landing → WhatsApp → CRM), posicionamento sugerido, cuidados do setor, próximos passos.`, 6500);
    const d = j1.diag || {};
    if (!pre.diagEdited) { pre.diag = {scenario: preS(d.scenario, 900), causal: preS(d.causal, 700), consequence: preS(d.consequence, 700), need: preS(d.need, 700)}; pre.diagEdited = true; }
    if (!pre.justEdited && j1.justification) { pre.justification = preS(j1.justification, 900); pre.justEdited = true; } if (!pre.objEdited && j1.objective) { pre.objective = preS(j1.objective, 500); pre.objEdited = true; }
    if (!pre.okr.edited && j1.okr) pre.okr = {objective: preS(j1.okr.objective || j1.objective, 300), tr: preLines(j1.okr.tr).slice(0, 5).map(x => x.slice(0, 220)), st: preLines(j1.okr.st).slice(0, 5).map(x => x.slice(0, 220)), edited: true};
    const S1 = Array.isArray(j1.summary) ? j1.summary.filter(x => x && x.text).slice(0, 10) : [];
    if (!pre.summary.edited && S1.length) pre.summary = {edited: true, blocks: S1.map(x => ({id: uid('sb'), label: preS(x.label || 'Bloco', 80), kind: ['dado', 'hipotese', 'recomendacao'].includes(x.kind) ? x.kind : 'recomendacao', text: preS(x.text, 900)}))};
    if (!pre.pitch.edited && j1.pitch && j1.pitch.text) pre.pitch = {text: preS(j1.pitch.text, 900), short: preS(j1.pitch.short, 300), edited: true};
    const st = j1.setor || {}; pre.compliance = {nome: preS(st.nome, 80), regulado: !!st.regulado, cuidados: preLines(st.cuidados).slice(0, 8).map(x => x.slice(0, 260))};
    if (!(p.brand.positioning || '').trim() && j1.posicionamento) p.brand.positioning = preS(j1.posicionamento, 400);
    preGen.done.push(0); preGen.step = 1; preGenRender(); persist();
    ctx += `\n\nDIAGNÓSTICO JÁ DEFINIDO\nCenário: ${pre.diag.scenario}\nCausa: ${pre.diag.causal}\nObjetivo: ${pre.objective}\nPosicionamento sugerido: ${j1.posicionamento || ''}${pre.compliance.regulado ? '\nSetor regulado: ' + pre.compliance.cuidados.join(' | ') : ''}`;
    /* 2 · públicos */
    const keep = pre.icps.filter(x => x.edited);
    const j2 = await preJSONRetry(PRE_SYS, ctx + `\n\nETAPA 2. Crie de 4 a 5 ICPs (o cliente do cliente), cada um com uma SITUAÇÃO e urgência diferentes${keep.length ? '. Já existem estes ICPs editados pelo usuário, não repita: ' + keep.map(x => x.name).join('; ') : ''}. Devolva JSON: {"icps":[{"name":"nome curto da situação","profile":"quem é","situation":"em que momento está","need":"o que precisa","behavior":"como procura ajuda e onde","intent":"alta|média|baixa e por quê","pains":["4 a 6 dores, na fala da pessoa"],"doubts":["4 a 6 dúvidas, como perguntas reais"],"desires":["3 a 5 desejos"],"hidden":["3 a 4 dores ocultas: o que ela sente e não diz, ou nem percebe"],"triggers":"o que a faz procurar ajuda agora","objections":["2 a 4 objeções"],"where":"onde descobre (Instagram, Google, indicação...)","voice":"3 a 5 expressões que ela usa"}],"journey":[{"name":"Descoberta","situacao":"","duvida":"","dor":"","desejo":"","gatilho":"","objecao":"","confianca":""}]}\nA journey tem 5 itens: Descoberta, Atenção, Consideração, Decisão, Pós-compra.`, 7800);
    const ic = (Array.isArray(j2.icps) ? j2.icps : []).filter(x => x && x.name).slice(0, 6).map(x => ({name: preS(x.name, 90), profile: preS(x.profile, 400), situation: preS(x.situation, 400), need: preS(x.need, 400), behavior: preS(x.behavior, 400), intent: preS(x.intent, 200),
      pains: preLines(x.pains).slice(0, 8).map(y => y.slice(0, 220)).join('\n'), doubts: preLines(x.doubts).slice(0, 8).map(y => y.slice(0, 220)).join('\n'), desires: preLines(x.desires).slice(0, 6).map(y => y.slice(0, 220)).join('\n'), hidden: preLines(x.hidden).slice(0, 6).map(y => y.slice(0, 220)).join('\n'),
      triggers: preS(x.triggers, 300), objections: preLines(x.objections).slice(0, 5).map(y => y.slice(0, 200)).join('\n'), where: preS(x.where, 200), voice: preS(x.voice, 300), ai: true}));
    if (!ic.length) throw new Error('a IA não devolveu ICPs. Tente de novo ou preencha mais o briefing.');
    pre.icps = keep.concat(ic).slice(0, 6);
    (Array.isArray(j2.journey) ? j2.journey : []).slice(0, 5).forEach((x, i) => JOURNEY_FIELDS.forEach(([k]) => { if (!(pre.journey[i][k] || '').trim() && x && x[k]) pre.journey[i][k] = preS(x[k], 400); }));
    preGen.done.push(1); preGen.step = 2; preGenRender(); persist();
    ctx += '\n\nICPS DEFINIDOS\n' + pre.icps.map((x, i) => `${i + 1}. ${x.name}: ${x.situation} | Dores: ${preLines(x.pains).slice(0, 3).join('; ')}`).join('\n');
    /* 3 · oferta, linha editorial e matriz */
    const j3 = await preJSONRetry(PRE_SYS, ctx + `\n\nETAPA 3. Devolva JSON: {"products":[{"name":"","type":"servico|produto|curso|ebook|evento","summary":"o que é, em 1 ou 2 frases","audience":"para quem","benefits":["3 a 5"],"features":["como funciona, etapas, o que está incluso: 3 a 5"],"objections":["2 a 4"],"cta":"ação principal: agendar análise, falar no WhatsApp, pedir orçamento...","price":""}],"pillars":[{"name":"pilar de conteúdo","goal":"para que serve","desc":"o que se publica nele","formats":["carrossel","reels","post","stories","artigo"],"icp":"nome do ICP que mais atende"}],"hooks":["8 a 12 hooks curtos, até 40 caracteres, ligados às dores"],"angles":["8 a 12 ângulos curtos, até 40 caracteres, ligados às dúvidas e desejos"],"ctas":["5 a 6 chamadas curtas, até 40 caracteres, coerentes com o serviço"]}\nOs products vêm SÓ do que o briefing diz que o cliente oferece (deixe price vazio se não foi dito). Os pillars são 4 a 6.`, 7000);
    const TY = ['servico', 'produto', 'curso', 'ebook', 'evento'], list = a => preLines(a).slice(0, 8).map(y => y.slice(0, 280));
    const np = (Array.isArray(j3.products) ? j3.products : []).filter(x => x && x.name).slice(0, 12).map(x => ({id: uid('pd'), name: preS(x.name, 160), type: TY.includes(x.type) ? x.type : 'servico', summary: preS(x.summary, 800), price: preS(x.price, 80), audience: preS(x.audience, 300), checkout: '', cta: preS(x.cta, 80), benefits: list(x.benefits), features: list(x.features), objections: list(x.objections), proofs: [], images: []}));
    const have = new Set((p.products || []).map(x => preS(x.name, 160).toLowerCase())), add = np.filter(x => !have.has(x.name.toLowerCase())); if (add.length) p.products = normalizeProducts((p.products || []).concat(add));
    pre.pillars = (Array.isArray(j3.pillars) ? j3.pillars : []).filter(x => x && x.name).slice(0, 8).map(x => ({id: uid('pl'), name: preS(x.name, 80), goal: preS(x.goal, 240), desc: preS(x.desc, 400), formats: preLines(x.formats).slice(0, 6).map(y => y.slice(0, 30)), icp: preS(x.icp, 90)}));
    const mx = (k, arr) => { const base = MATRIX[k] || [], cur = (p.matrix.custom[k] = p.matrix.custom[k] || []), fresh = preLines(arr).map(y => y.slice(0, 40)).filter(y => y && ![...base, ...cur].some(z => z.toLowerCase() === y.toLowerCase())).slice(0, 14); cur.push(...fresh); return fresh; };
    ensureSel(p); const nh = mx('hooks', j3.hooks), na = mx('angles', j3.angles), nc = mx('ctas', j3.ctas);
    if (nh.length) p.matrix.sel.hooks = nh.slice(0, 6); if (na.length) p.matrix.sel.angles = na.slice(0, 6); if (nc.length) p.matrix.sel.ctas = nc.slice(0, 4);
    pre.gen = {at: new Date().toISOString(), n: (pre.gen.n || 0) + 1}; pre.history.unshift({at: pre.gen.at, action: 'Pré-projeto gerado pela IA', note: `${pre.icps.length} ICPs, ${add.length} produto(s)/serviço(s), ${pre.pillars.length} pilares.`});
    preGen.done.push(2); preGen.busy = false; preGen.note = `Pronto: ${pre.icps.length} ICPs, ${add.length} produto(s) ou serviço(s), ${pre.pillars.length} pilares e ${preMatrixRows(p).length} linhas na matriz de conteúdo. Revise tudo antes de apresentar ao cliente.`;
    preTouch(); persist(); preGenRender(); $('preGenAct').innerHTML = `<button class="btn" onclick="closeModal();ui.tab='preproject';go('project')">Revisar o pré-projeto</button><button class="btn dark" onclick="closeModal();go('matrix')">Ver a matriz de conteúdo</button>`;
    if (ui.page === 'project') keepScroll(renderProjectTab);
  } catch (e) {
    preGen.busy = false; preGen.err = 'Parei na etapa ' + (preGen.step + 1) + ': ' + (e.message || e) + (preGen.done.length ? ' O que já foi gerado ficou salvo.' : ''); persist(); preGenRender();
    const a = $('preGenAct'); if (a) a.innerHTML = `<button class="btn" onclick="closeModal()">Fechar</button><button class="btn dark" onclick="preGenAll(true)">Tentar de novo</button>`;
  }
}

/* ---------- matriz de conteúdo: ICP × dor/dúvida/desejo/dor oculta × produto × etapa do funil × formato ---------- */
const PRE_FMT = {Dor: 'Anúncio + Reels', 'Dúvida': 'Carrossel educativo', Desejo: 'Anúncio para a landing', 'Dor oculta': 'Reels ou post de identificação'};
const PRE_ANG = {Dor: 'Problema', 'Dúvida': 'Educação', Desejo: 'Oportunidade', 'Dor oculta': 'Identificação'};
const PRE_CTA = {Atenção: 'Saiba mais', Consideração: 'Entenda seu caso', Decisão: 'Fale conosco', Descoberta: 'Salve e compartilhe'};
function preHookFor(tipo, t) {
  t = String(t).replace(/[.!?]+$/, '');
  return ({Dor: `Você já sentiu isto: “${t}”?`, 'Dúvida': t.endsWith('?') ? t : t + '?', Desejo: `E se você pudesse ${t.charAt(0).toLowerCase() + t.slice(1)}?`, 'Dor oculta': `Quase ninguém admite, mas ${t.charAt(0).toLowerCase() + t.slice(1)}`})[tipo] || t;
}
function preMatrixRows(p) {
  const prods = p.products || [], tk = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter(w => w.length > 3), rows = [];
  (p.pre.icps || []).forEach((ic, ii) => {
    PRE_LISTS.forEach(([key, , tipo, etapa]) => preLines(ic[key]).forEach((t, k) => {
      const W = new Set(tk(t)); let best = null, bs = 0; prods.forEach(pr => { const s = tk(pr.name + ' ' + pr.summary + ' ' + pr.benefits.join(' ')).filter(w => W.has(w)).length; if (s > bs) { bs = s; best = pr; } });
      rows.push({id: `${ii}-${key}-${k}`, icp: ic.name, icpIdx: ii, tipo, insight: t, etapa, produto: best ? best.name : prods.length === 1 ? prods[0].name : prods.length ? 'Escolher' : '', formato: PRE_FMT[tipo], angulo: PRE_ANG[tipo], hook: preHookFor(tipo, t), cta: PRE_CTA[etapa]});
    }));
  });
  return rows;
}
const mxd = {icp: '', tipo: '', etapa: '', sel: new Set(), all: false};
function preRowsFiltered(p) { return preMatrixRows(p).filter(r => (!mxd.icp || String(r.icpIdx) === mxd.icp) && (!mxd.tipo || r.tipo === mxd.tipo) && (!mxd.etapa || r.etapa === mxd.etapa)); }
function matrixDocPanel(p) {
  const rows = preMatrixRows(p), icps = p.pre.icps || [];
  if (!rows.length) return `<div class="panel" style="margin-bottom:12px"><div class="section-row"><div><h3 style="margin:0">Matriz de conteúdo</h3><p class="muted" style="margin:2px 0 0;font-size:13px">Cruza cada ICP com as dores, dúvidas, desejos e dores ocultas, o produto ou serviço e a etapa do funil. É daqui que saem os anúncios e os conteúdos. Ela aparece quando os ICPs do pré-projeto têm dores, dúvidas e desejos.</p></div><div class="row-gap"><button class="btn dark" onclick="preGenAll()">✦ Gerar pré-projeto com IA</button><button class="btn" onclick="ui.tab='preproject';go('project')">Preencher à mão</button></div></div></div>`;
  const F = preRowsFiltered(p), show = mxd.all ? F : F.slice(0, 40), selN = F.filter(r => mxd.sel.has(r.id)).length, opt = (v, cur, l) => `<option value="${v}" ${cur === v ? 'selected' : ''}>${l}</option>`;
  return `<div class="panel" style="margin-bottom:12px"><div class="section-row"><div><h3 style="margin:0">Matriz de conteúdo <small class="muted">do pré-projeto</small></h3><p class="muted" style="margin:2px 0 0;font-size:13px">${icps.length} ICP(s) · ${rows.length} combinações de ICP × insight. Marque as que quer produzir e envie para o Agente Editorial ou para os conceitos de anúncio.</p></div><div class="row-gap" style="flex-wrap:wrap"><button class="btn sm" onclick="preGenAll()">✦ Refazer com IA</button><button class="btn sm" onclick="matrixDocHTML()">⬇ Documento</button><button class="btn sm" onclick="matrixDocCSV()">⬇ Planilha (CSV)</button></div></div>
  <div class="row-gap" style="flex-wrap:wrap;margin:8px 0"><select class="an-sel" onchange="mxd.icp=this.value;renderMatrixPage()"><option value="">Todos os ICPs</option>${icps.map((x, i) => opt(String(i), mxd.icp, esc(x.name))).join('')}</select><select class="an-sel" onchange="mxd.tipo=this.value;renderMatrixPage()"><option value="">Todos os tipos</option>${PRE_LISTS.map(([, , t]) => opt(t, mxd.tipo, t)).join('')}</select><select class="an-sel" onchange="mxd.etapa=this.value;renderMatrixPage()"><option value="">Todas as etapas</option>${['Descoberta', 'Atenção', 'Consideração', 'Decisão'].map(e => opt(e, mxd.etapa, e)).join('')}</select>
  <button class="btn sm" onclick="matrixDocSel(true)">Marcar todas (${F.length})</button><button class="btn sm" onclick="matrixDocSel(false)">Limpar</button><button class="btn sm dark" onclick="matrixToConcepts()" ${selN ? '' : 'disabled'}>→ Conceitos de anúncio (${selN})</button><button class="btn sm dark" onclick="matrixToEditorial()" ${selN ? '' : 'disabled'}>→ Agente Editorial (${selN})</button></div>
  <div class="table-wrap" style="max-height:420px;overflow:auto"><table class="tbl"><thead><tr><th></th><th>ICP</th><th>Tipo</th><th>Insight</th><th>Etapa</th><th>Produto</th><th>Formato</th><th>Hook sugerido</th></tr></thead><tbody>${show.map(r => `<tr><td><input type="checkbox" ${mxd.sel.has(r.id) ? 'checked' : ''} onchange="matrixDocPick('${r.id}',this.checked)"></td><td>${esc(r.icp)}</td><td><b>${esc(r.tipo)}</b></td><td>${esc(r.insight)}</td><td>${esc(r.etapa)}</td><td>${esc(r.produto || '—')}</td><td>${esc(r.formato)}</td><td>${esc(r.hook)}</td></tr>`).join('')}</tbody></table></div>${F.length > show.length ? `<button class="btn sm" style="margin-top:6px" onclick="mxd.all=true;renderMatrixPage()">Mostrar as ${F.length} linhas</button>` : ''}</div>`;
}
function matrixDocPick(id, on) { if (on) mxd.sel.add(id); else mxd.sel.delete(id); keepScroll(renderMatrixPage); }
function matrixDocSel(on) { const F = preRowsFiltered(curProject()); F.forEach(r => on ? mxd.sel.add(r.id) : mxd.sel.delete(r.id)); keepScroll(renderMatrixPage); }
const matrixDocPicked = p => preMatrixRows(p).filter(r => mxd.sel.has(r.id));
function matrixToConcepts() {
  const p = curProject(), R = matrixDocPicked(p).slice(0, 100); if (!R.length) return; const cs = p.matrix.concepts;
  R.forEach(r => { if (cs.some(c => c.insightId === r.id)) return; const base = (MATRIX.hooks.find(h => h === ({Dor: 'Problema', 'Dúvida': 'Pergunta', Desejo: 'Curiosidade', 'Dor oculta': 'Identificação'})[r.tipo]) || 'Problema'); cs.unshift({id: uid('k'), hook: base, angle: r.angulo, format: ({Dor: 'Especialista', 'Dúvida': 'Voice-over', Desejo: 'Storytelling', 'Dor oculta': 'UGC'})[r.tipo], cta: r.cta, direction: 'Editorial', pinned: true, creativeId: '', score: 90, line: r.hook, icp: r.icp, insight: r.insight, tipo: r.tipo, insightId: r.id, produto: r.produto}); });
  persist(); toast(R.length + ' conceito(s) criado(s) e fixado(s) na Matriz. Abra o Video Lab ou o Estúdio de Design para produzir.'); renderMatrixPage();
}
function matrixToEditorial() {
  const p = curProject(), R = matrixDocPicked(p).slice(0, 12); if (!R.length) return; const s = EDS();
  s.input = `PROJETO: ${p.name}\nSERVIÇOS E PRODUTOS: ${(p.products || []).map(x => x.name).join('; ') || p.brief.offer || ''}\n\nPEDIDO: encontrar ângulos de conteúdo e de anúncio para os públicos e insights abaixo. Cada insight é uma dor, dúvida, desejo ou dor oculta REAL do cliente do cliente. Fale a língua dele, sem promessa de resultado.\n\n` + R.map((r, i) => `${i + 1}. [${r.tipo} · ${r.etapa}] ICP "${r.icp}": ${r.insight}${r.produto && r.produto !== 'Escolher' ? ` — conecta com: ${r.produto}` : ''}`).join('\n');
  edi.tab = 'agente'; s.stage = 'insumo'; persist(); go('editorial'); toast('Insumo montado com ' + R.length + ' insight(s). Clique em extrair e gerar ângulos.');
}
function matrixDocCSV() {
  const p = curProject(), q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"', R = preRowsFiltered(p);
  download(`matriz-de-conteudo-${slug(p.name)}.csv`, '﻿' + [['ICP', 'Tipo', 'Insight', 'Etapa do funil', 'Produto ou serviço', 'Formato', 'Ângulo', 'Hook sugerido', 'CTA'].join(',')].concat(R.map(r => [r.icp, r.tipo, r.insight, r.etapa, r.produto, r.formato, r.angulo, r.hook, r.cta].map(q).join(','))).join('\r\n'), 'text/csv');
}
function matrixDocHTML() {
  const p = curProject(), pre = p.pre, rows = preMatrixRows(p), E = esc, L = v => preLines(v).map(x => `<li>${E(x)}</li>`).join('');
  const css = `body{font:14px/1.5 system-ui,Segoe UI,Roboto,sans-serif;color:#141414;max-width:1100px;margin:30px auto;padding:0 20px}h1{font-size:26px;margin:0}h2{margin:28px 0 6px;border-bottom:2px solid #111;padding-bottom:4px}h3{margin:14px 0 4px}.c{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.c div{border:1px solid #ddd;border-radius:8px;padding:8px 10px}.c b{display:block;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#666}ul{margin:4px 0;padding-left:18px}table{border-collapse:collapse;width:100%;font-size:12.5px}th,td{border:1px solid #ddd;padding:5px 7px;text-align:left;vertical-align:top}th{background:#f3f3f3}.m{color:#666;font-size:12px}@media print{h2{break-after:avoid}tr{break-inside:avoid}}`;
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Matriz de conteúdo · ${E(p.name)}</title><style>${css}</style></head><body><h1>Matriz de conteúdo · ${E(p.name)}</h1><p class="m">Gerada em ${new Date().toLocaleDateString('pt-BR')}. Dores, dúvidas, desejos e dores ocultas são hipóteses a validar com atendimentos reais. Nenhum número ou resultado foi prometido.</p>
  ${pre.objective ? `<h2>Objetivo</h2><p>${E(pre.objective)}</p>` : ''}${pre.compliance && pre.compliance.cuidados.length ? `<h2>Cuidados do setor${pre.compliance.nome ? ' · ' + E(pre.compliance.nome) : ''}</h2><ul>${pre.compliance.cuidados.map(x => `<li>${E(x)}</li>`).join('')}</ul>` : ''}
  ${(p.products || []).length ? `<h2>Produtos e serviços</h2>${p.products.map(x => `<h3>${E(x.name)} <small class="m">${E(x.type)}</small></h3><p>${E(x.summary)}</p>`).join('')}` : ''}
  <h2>Públicos (ICPs)</h2>${(pre.icps || []).map(ic => `<h3>${E(ic.name)}</h3><p>${E(ic.profile)} ${E(ic.situation)}</p><div class="c">${PRE_LISTS.map(([k, l]) => `<div><b>${l}</b><ul>${L(ic[k])}</ul></div>`).join('')}</div>${ic.triggers ? `<p class="m"><b>Gatilho:</b> ${E(ic.triggers)} ${ic.where ? ' · <b>Onde descobre:</b> ' + E(ic.where) : ''}</p>` : ''}`).join('')}
  ${(pre.pillars || []).length ? `<h2>Linha editorial · pilares</h2><table><tr><th>Pilar</th><th>Para que serve</th><th>O que se publica</th><th>Formatos</th><th>ICP</th></tr>${pre.pillars.map(x => `<tr><td><b>${E(x.name)}</b></td><td>${E(x.goal)}</td><td>${E(x.desc)}</td><td>${E(x.formats.join(', '))}</td><td>${E(x.icp)}</td></tr>`).join('')}</table>` : ''}
  <h2>Matriz ICP × insight × produto × funil (${rows.length})</h2><table><tr><th>ICP</th><th>Tipo</th><th>Insight</th><th>Etapa</th><th>Produto</th><th>Formato</th><th>Hook sugerido</th><th>CTA</th></tr>${rows.map(r => `<tr><td>${E(r.icp)}</td><td>${E(r.tipo)}</td><td>${E(r.insight)}</td><td>${E(r.etapa)}</td><td>${E(r.produto || '—')}</td><td>${E(r.formato)}</td><td>${E(r.hook)}</td><td>${E(r.cta)}</td></tr>`).join('')}</table></body></html>`;
  download(`matriz-de-conteudo-${slug(p.name)}.html`, html, 'text/html');
}

/* o Agente Editorial passa a receber também os ICPs, as dores e os serviços do pré-projeto */
function preICPText(p) {
  if (!p || !p.pre || !(p.pre.icps || []).length) return '';
  return '\n\nPÚBLICOS DO PROJETO (pré-projeto)\n' + p.pre.icps.slice(0, 6).map(x => `- ${x.name}: ${x.situation || ''}\n  Dores: ${preLines(x.pains).slice(0, 4).join('; ')}\n  Dúvidas: ${preLines(x.doubts).slice(0, 4).join('; ')}\n  Desejos: ${preLines(x.desires).slice(0, 3).join('; ')}\n  Dores ocultas: ${preLines(x.hidden).slice(0, 3).join('; ')}`).join('\n') + ((p.products || []).length ? '\nSERVIÇOS E PRODUTOS: ' + p.products.slice(0, 8).map(x => x.name).join('; ') : '') + (p.pre.compliance && p.pre.compliance.regulado ? '\nSETOR REGULADO, cuidados: ' + p.pre.compliance.cuidados.join(' | ') : '');
}
(function () { const o = typeof eBrandTxt === 'function' ? eBrandTxt : null; if (o) window.eBrandTxt = function () { return o.apply(this, arguments) + preICPText(curProject()); }; })();
