/* ===== Stories: planejar a semana com sequências de 3 a 15 Stories por dia, cada Story pronto para executar =====
   Lógica de cada sequência: atenção → interação → consciência → desejo → ação → aprendizado. Segue a skill de Stories (função "stories").
   Nasce de esqueletos preenchidos com as dores, dúvidas, desejos e urgências ocultas do projeto ou da campanha, sem IA e sem crédito. */
const ST_LABEL = {video: 'Vídeo', foto: 'Foto', texto: 'Texto', enquete: 'Enquete', caixa: 'Caixa de pergunta', quiz: 'Quiz', slider: 'Controle deslizante', reacao: 'Reação com emoji', link: 'Link ou botão', contagem: 'Contagem regressiva'};
const ST_DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const ST_PERS_L = {direta: 'Direta', expansiva: 'Expansiva', timida: 'Mais reservada', institucional: 'Institucional', tecnica: 'Técnica', popular: 'Popular'};
const ST_PREFIX = {direta: '', expansiva: 'Gente, ', timida: 'Oi, tudo bem? ', institucional: 'Comunicado importante: ', tecnica: 'Um ponto importante: ', popular: 'Olha só: '};
const ST_KIND = {aquecimento: ['Aquecimento: mostrar a dor', 'descoberta'], preferencia: ['Descoberta de preferência', 'atracao'], educacao: ['Educação rápida', 'consideracao'], objecao: ['Quebra de objeção', 'consideracao'], prova: ['Prova', 'consideracao'], oferta: ['Oferta e ação', 'acao'], indicacao: ['Indicação e pós-venda', 'apologia']};
const ST_WEEK = ['aquecimento', 'preferencia', 'educacao', 'objecao', 'prova', 'oferta', 'indicacao'], ST_EXTRA = ['educacao', 'aquecimento', 'objecao'];
const stUI = {id: '', seq: '', busy: false};
const stPlan = (p, id) => p.stories.find(x => x.id === id);
const S_ = (type, scene, say, el, signal, goal) => ({type, scene, say, el: el || '', signal: signal || '', goal: goal || '', res: {views: 0, replies: 0, taps: 0, exits: 0, msgs: 0}});
const stQ = t => { t = String(t).trim(); return /[?.!…]$/.test(t) ? t : t + '?'; };

function stCtx(p, plan) {
  const c = plan.cid ? p.campaigns.find(x => x.id === plan.cid) : null, b = c ? c.bank : cmpDraftBank(p, 5), pr = (p.products || [])[0] || {};
  return {dor: b.dor || [], duvida: b.duvida || [], desejo: b.desejo || [], urg: b.urgencia || [], tema: pr.name || p.name, prod: pr, cta: (b.c && b.c[0]) || 'Fale com a gente no WhatsApp', P: ST_PREFIX[plan.pers] || ''};
}
const pk = (a, i, fb) => (a && a.length ? a[i % a.length] : fb);
const CAM = 'Grave olhando para a câmera, plano médio, de 8 a 12 segundos, com luz no rosto.', TXT = 'Fundo liso da cor da marca, texto grande e curto.';
/* cada tipo de sequência devolve a lista de Stories em ordem; o último é sempre o fechamento */
const ST_BP = {
  aquecimento: (x, d) => [S_('video', CAM, `${x.P}${stQ(pk(x.dor, d, '[escreva uma dor real do seu público]'))}`, '', 'Atenção e identificação', 'Abrir a sequência com uma dor que o público reconhece.'),
    S_('enquete', TXT, 'Isso já aconteceu com você?', 'Enquete: 🔘 Sim, já aconteceu · 🔘 Ainda não', 'Quem se identifica com a dor', 'Separar quem tem a dor e abrir espaço para o próximo Story.'),
    S_('caixa', TXT, `Qual é a sua maior dúvida sobre ${x.tema}? Me conta aqui.`, 'Caixa de pergunta: "Escreva sua dúvida"', 'Dúvidas reais, na linguagem do público', 'Coletar perguntas para o banco de dúvidas e para os próximos conteúdos.'),
    S_('video', CAM, `${x.P}${stQ(pk(x.duvida, d, '[responda com as suas palavras a dúvida mais comum]'))} Já vou te explicar.`, '', 'Interesse na explicação', 'Mostrar que a dúvida tem resposta e preparar o Story seguinte.'),
    S_('reacao', TXT, 'Se isso faz sentido para você, reaja com um coração.', 'Reação com emoji: ❤️', 'Quantos concordam', 'Medir adesão com o menor esforço possível.'),
    S_('video', 'Mostre um detalhe do dia a dia ou do trabalho (bastidor), 5 a 8 segundos.', '[explique, com as suas palavras, por que isso acontece. Não invente números]', '', 'Atenção sustentada', 'Dar contexto e criar confiança antes da próxima sequência.'),
    S_('texto', TXT, 'Amanhã eu continuo. Fica de olho aqui.', '', 'Retorno no dia seguinte', 'Criar expectativa para a próxima sequência.')],
  preferencia: (x, d) => [S_('video', CAM, `${x.P}Se você pudesse escolher, o que você mais quer: ${pk(x.desejo, d, '[o desejo do público]')}?`, '', 'Aspiração', 'Abrir a sequência pelo que a pessoa quer conquistar.'),
    S_('enquete', TXT, 'Qual destes pesa mais para você agora?', `Enquete: 🔘 ${pk(x.desejo, d, '[desejo A]')} · 🔘 ${pk(x.desejo, d + 1, '[desejo B]')}`, 'Qual desejo mobiliza mais', 'Descobrir a preferência para direcionar a oferta.'),
    S_('slider', TXT, 'De 0 a 10, o quanto isso te preocupa hoje?', 'Controle deslizante: 😟 → 😌', 'Nível de urgência de cada pessoa', 'Medir intensidade para escolher quem abordar primeiro.'),
    S_('quiz', TXT, 'Teste rápido: você sabe a resposta?', 'Quiz: [pergunta curta com 3 opções, uma correta]', 'Nível de conhecimento', 'Ensinar de forma leve e mostrar o que o público ainda não sabe.'),
    S_('video', CAM, `${x.P}A maioria respondeu [resultado da enquete]. Isso mostra que [o que isso significa, sem inventar dados].`, '', 'Interesse no resultado', 'Devolver o resultado e ligar com a solução.'),
    S_('caixa', TXT, 'Quer que eu fale sobre qual ponto amanhã?', 'Caixa de pergunta: "Escolha o tema"', 'Tema pedido', 'Deixar o público ajudar a decidir o próximo conteúdo.')],
  educacao: (x, d) => [S_('video', CAM, `${x.P}Vou te explicar em 1 minuto: ${stQ(pk(x.duvida, d, '[a dúvida que vai explicar]'))}`, '', 'Atenção', 'Prometer uma explicação curta e útil.'),
    S_('video', 'Mostre o passo 1 na tela ou com um objeto, 8 a 10 segundos.', 'Passo 1: [explique o primeiro passo com as suas palavras].', '', 'Compreensão', 'Ensinar a primeira parte.'),
    S_('video', 'Mostre o passo 2, 8 a 10 segundos.', 'Passo 2: [explique o segundo passo].', '', 'Compreensão', 'Ensinar a segunda parte.'),
    S_('enquete', TXT, 'Mito ou verdade: [afirmação comum sobre o tema]?', 'Enquete: 🔘 Mito · 🔘 Verdade', 'O que o público acredita', 'Descobrir a crença e corrigir no Story seguinte.'),
    S_('video', CAM, `${x.P}A resposta é [diga a resposta com cuidado, sem prometer resultado].`, '', 'Aprendizado', 'Corrigir ou confirmar a crença.'),
    S_('caixa', TXT, 'Ficou alguma dúvida? Pergunte aqui que eu respondo.', 'Caixa de pergunta: "Sua dúvida"', 'Novas dúvidas', 'Manter a conversa aberta.')],
  objecao: (x, d) => [S_('video', CAM, `${x.P}Muita gente me diz: "${pk(x.duvida, d, '[a objeção mais comum]').replace(/[?.!]+$/, '')}".`, '', 'Reconhecimento', 'Nomear a objeção sem julgar.'),
    S_('enquete', TXT, 'Você também pensa assim?', 'Enquete: 🔘 Penso assim · 🔘 Não penso', 'Quantos compartilham a objeção', 'Medir o tamanho da objeção.'),
    S_('video', CAM, `${x.P}Eu entendo. [responda a objeção com o que é verdade e comprovável].`, '', 'Segurança', 'Responder com honestidade e sem exagero.'),
    S_('foto', 'Foto de um exemplo real, material ou resultado autorizado. Sem dados pessoais.', '[CONFIRMAR] mostre uma prova real e autorizada', '', 'Confiança', 'Sustentar a resposta com um fato.'),
    S_('caixa', TXT, 'Qual outra dúvida te impede de dar o próximo passo?', 'Caixa de pergunta: "O que te trava?"', 'Outras objeções', 'Descobrir o que ainda segura a decisão.')],
  prova: (x, d) => [S_('video', CAM, `${x.P}Hoje é dia de mostrar como funciona na prática.`, '', 'Curiosidade', 'Abrir com a promessa de mostrar, não de contar.'),
    S_('video', 'Mostre bastidores do trabalho ou o processo, 8 a 12 segundos.', '[descreva o que está sendo feito, sem exagerar]', '', 'Transparência', 'Mostrar como o serviço é feito.'),
    S_('foto', 'Foto de um resultado, depoimento ou documento. Só com autorização e sem dados pessoais.', '[CONFIRMAR] depoimento ou resultado real, com permissão', '', 'Prova social', 'Dar um exemplo concreto.'),
    S_('enquete', TXT, 'Você gostaria de ver mais casos como esse?', 'Enquete: 🔘 Quero ver · 🔘 Agora não', 'Interesse em provas', 'Medir o interesse pelo próximo passo.'),
    S_('texto', TXT, 'Amanhã eu conto como você pode começar.', '', 'Retorno', 'Preparar a oferta.')],
  oferta: (x, d) => [S_('video', CAM, `${x.P}Chegou a hora: ${x.prod.summary ? x.prod.summary.split(/(?<=[.!?])\s/)[0] : '[apresente a oferta em uma frase. Sem promessa de resultado]'}`, '', 'Desejo', 'Apresentar a oferta com clareza.'),
    S_('video', 'Mostre o que está incluso, em 2 ou 3 itens, com texto na tela.', 'O que você recebe: [liste o que está incluso. Confirme antes de publicar]', '', 'Valor percebido', 'Listar o que a pessoa leva.'),
    S_('video', CAM, `${x.P}${stQ(pk(x.urg, d, '[a urgência real: prazo, vaga ou data, se existir]'))}`, '', 'Urgência', 'Dar um motivo real para agir agora, sem pressão falsa.'),
    S_('contagem', TXT, '[CONFIRMAR] data e horário limite reais', 'Contagem regressiva com o prazo', 'Lembretes ativados', 'Lembrar quem quer participar.'),
    S_('link', TXT, `${x.cta}.`, 'Link ou botão: [endereço do WhatsApp, formulário ou página]', 'Cliques e mensagens', 'Levar a pessoa para a ação.')],
  indicacao: (x, d) => [S_('video', CAM, `${x.P}Quero agradecer a quem acompanha e participa.`, '', 'Pertencimento', 'Reconhecer o público e reforçar a identidade.'),
    S_('foto', 'Mostre uma mensagem de elogio autorizada (sem nome, se não tiver permissão).', '[CONFIRMAR] mensagem real, com autorização', '', 'Identidade', 'Mostrar quem faz parte da comunidade.'),
    S_('caixa', TXT, 'Quem você conhece que precisa ver isso? Me conta aqui.', 'Caixa de pergunta: "Quem você indica?"', 'Indicações', 'Pedir indicação de forma simples.'),
    S_('link', TXT, 'Compartilhe este Story com quem precisa.', 'Botão de compartilhar', 'Compartilhamentos', 'Facilitar a indicação.'),
    S_('texto', TXT, 'Semana que vem tem mais. Obrigado por estar aqui.', '', 'Retorno', 'Fechar a semana e abrir a próxima.')]
};
const ST_FILL = [S_('reacao', TXT, 'Reaja com o emoji que mais combina com o seu dia.', 'Reação com emoji', 'Engajamento leve', 'Manter o ritmo e medir atenção.'), S_('caixa', TXT, 'Quer que eu fale de outro ponto? Me diga aqui.', 'Caixa de pergunta: "Qual tema?"', 'Temas pedidos', 'Ouvir o público.'), S_('enquete', TXT, 'Você prefere ver isso em vídeo ou em texto?', 'Enquete: 🔘 Vídeo · 🔘 Texto', 'Formato preferido', 'Descobrir o formato que o público aprecia.'), S_('foto', 'Foto de bastidor, sem dados pessoais.', 'Um pedacinho do nosso dia.', '', 'Proximidade', 'Humanizar a sequência.')];
function stItems(x, kind, d, n) {
  const base = ST_BP[kind](x, d).map(i => JSON.parse(JSON.stringify(i))), last = base.pop(); n = Math.max(3, Math.min(15, n || 6)); let out = base.slice(0, n - 1), k = 0;
  while (out.length < n - 1) { out.push(JSON.parse(JSON.stringify(ST_FILL[k % ST_FILL.length]))); k++; }
  return out.concat([last]);
}
function stBuild(p, plan, perDay, nStories) {
  const x = stCtx(p, plan), seqs = [];
  for (let d = 0; d < 7; d++) for (let s = 1; s <= perDay; s++) {
    const kind = s === 1 ? ST_WEEK[d] : ST_EXTRA[(d + s) % ST_EXTRA.length], info = ST_KIND[kind];
    seqs.push({id: uid('sq'), day: d, slot: s, kind, title: info[0], stage: info[1], goal: `Sequência de ${ST_DAYS[d].toLowerCase()}: ${info[0].toLowerCase()}, na fase ${CMP_STAGE_NAME[info[1]]} da jornada (gatilho: ${CMP_STAGE_GATILHO[info[1]]}).`, items: stItems(x, kind, d + s, nStories)});
  }
  return seqs;
}

/* ---------- criar e editar ---------- */
function stNewModal(cid) {
  const p = curProject(); if (!p) { toast('Abra um projeto primeiro.'); return; }
  showModal('Planejar a semana de Stories', `<p style="font-size:13px;margin-top:0">O Studio monta <b>7 dias de sequências</b>, cada uma pronta para gravar, com o que falar palavra por palavra, a enquete ou a caixa de pergunta e o sinal que cada Story busca. Nasce sem IA e sem gastar crédito.</p>
  <div class="form-grid"><div class="field full"><label>Nome do plano</label><input id="snN" placeholder="Ex.: Semana de lançamento"></div>
  <div class="field"><label>Campanha (opcional)</label><select id="snC"><option value="">Sem campanha</option>${p.campaigns.map(c => `<option value="${c.id}" ${c.id === cid ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
  <div class="field"><label>Início da semana (opcional)</label><input id="snS" type="date"></div>
  <div class="field"><label>Personalidade de quem comunica</label><select id="snP">${Object.entries(ST_PERS_L).map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></div>
  <div class="field"><label>Objetivo</label><select id="snO">${['Gerar conversas', 'Captar leads', 'Vender', 'Educar', 'Relacionamento'].map(o => `<option>${o}</option>`).join('')}</select></div>
  <div class="field"><label>Sequências por dia (1 a 3)</label><input id="snD" type="number" min="1" max="3" value="1"></div>
  <div class="field"><label>Stories por sequência (3 a 15)</label><input id="snQ" type="number" min="3" max="15" value="6"></div></div>
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="stCreate()">Montar a semana</button></div>`);
}
function stCreate() {
  const p = curProject(), name = $('snN').value.trim() || 'Plano de stories ' + (p.stories.length + 1); if (p.stories.length >= 40) { toast('Limite de 40 planos.'); return; }
  const per = Math.max(1, Math.min(3, +$('snD').value || 1)), n = Math.max(3, Math.min(15, +$('snQ').value || 6));
  const plan = {id: uid('st'), name, cid: $('snC').value, objective: $('snO').value, pers: $('snP').value, start: $('snS').value, resp: (state.workspace.responsible || '').trim(), status: 'Rascunho', approvedAt: '', created: new Date().toISOString(), updated: '', seqs: []};
  plan.seqs = stBuild(p, plan, per, n); p.stories.unshift(plan); stUI.id = plan.id; stUI.seq = ''; persist(); closeModal(); renderStories(); toast(`Semana montada: ${plan.seqs.length} sequências, ${plan.seqs.reduce((a, q) => a + q.items.length, 0)} Stories.`);
}
function stOpen(id) { stUI.id = id; stUI.seq = ''; renderStories(); }
function stBack() { stUI.id = ''; stUI.seq = ''; renderStories(); }
function stSeq(id) { stUI.seq = stUI.seq === id ? '' : id; renderStories(); }
function stDel(id) { const p = curProject(); if (!confirm('Excluir este plano de Stories?')) return; p.stories = p.stories.filter(x => x.id !== id); if (stUI.id === id) stUI.id = ''; persist(); renderStories(); }
function stField(k, v) { const pl = stPlan(curProject(), stUI.id); if (!pl) return; if (k === 'resp') { pl.resp = String(v).trim().slice(0, 80); if (pl.resp && !(state.workspace.responsible || '').trim()) state.workspace.responsible = pl.resp; } else if (k === 'name') pl.name = String(v).slice(0, 120) || pl.name; else if (k === 'start') pl.start = /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : ''; pl.updated = new Date().toISOString(); if (pl.status !== 'Rascunho' && k !== 'resp') { pl.status = 'Rascunho'; pl.approvedAt = ''; toast('Plano editado: voltou para rascunho.'); } persist(); renderStories(); }
function stItem(sid, i, k, v) {
  const pl = stPlan(curProject(), stUI.id), q = pl && pl.seqs.find(x => x.id === sid); if (!q || !q.items[i]) return;
  if (k === 'type') q.items[i].type = ST_TYPES.includes(v) ? v : q.items[i].type; else if (['views', 'replies', 'taps', 'exits', 'msgs'].includes(k)) { q.items[i].res[k] = Math.max(0, Math.round(+v) || 0); persist(); stRefreshLearn(); return; } else q.items[i][k] = String(v).slice(0, k === 'say' ? 900 : 700);
  pl.updated = new Date().toISOString(); if (pl.status !== 'Rascunho') { pl.status = 'Rascunho'; pl.approvedAt = ''; } persist(); if (k === 'type') renderStories();
}
function stAdd(sid) { const pl = stPlan(curProject(), stUI.id), q = pl.seqs.find(x => x.id === sid); if (q.items.length >= 15) { toast('No máximo 15 Stories por sequência.'); return; } q.items.splice(q.items.length - 1, 0, S_('video', CAM, '[escreva a fala]', '', '', '')); persist(); renderStories(); }
function stRm(sid, i) { const pl = stPlan(curProject(), stUI.id), q = pl.seqs.find(x => x.id === sid); if (q.items.length <= 3) { toast('Uma sequência tem no mínimo 3 Stories.'); return; } q.items.splice(i, 1); persist(); renderStories(); }
function stMove(sid, i, dir) { const pl = stPlan(curProject(), stUI.id), q = pl.seqs.find(x => x.id === sid), j = i + dir; if (j < 0 || j >= q.items.length) return; [q.items[i], q.items[j]] = [q.items[j], q.items[i]]; persist(); renderStories(); }
function stRedo(sid) {
  const p = curProject(), pl = stPlan(p, stUI.id), q = pl.seqs.find(x => x.id === sid); if (!confirm('Refazer esta sequência a partir do esqueleto? O texto atual dela se perde.')) return;
  q.items = stItems(stCtx(p, pl), q.kind, q.day + q.slot, q.items.length); persist(); renderStories();
}
async function stAI(sid) {
  if (!aiReady()) { toast('IA não configurada. Veja Integrações. O esqueleto continua editável.'); return; }
  const p = curProject(), pl = stPlan(p, stUI.id), q = pl.seqs.find(x => x.id === sid), n = q.items.length; if (!q) return;
  try {
    toast('Escrevendo a sequência…'); skCtx('stories', q.stage);
    const j = await aiJSON(`Você cria sequências de Stories do Instagram prontas para executar, sem sugestões vagas. Responda só JSON: um array com exatamente ${n} objetos {"type":"video|foto|texto|enquete|caixa|quiz|slider|reacao|link|contagem","scene":"o que gravar ou mostrar","say":"o que falar, palavra por palavra","el":"elemento de interação com as opções escritas","signal":"o que a resposta revela","goal":"por que este Story existe e como prepara o próximo"}. Cada Story prepara o próximo. Não invente fatos, números, preços, depoimentos ou resultados: use [CONFIRMAR]. Em setores regulados, não prometa resultado.`,
      `${projectContext(p)}\nPersonalidade de quem comunica: ${ST_PERS_L[pl.pers]}\nObjetivo do plano: ${pl.objective}\nDia: ${ST_DAYS[q.day]} · Sequência: ${q.title} · Fase da jornada: ${q.stage ? CMP_STAGE_NAME[q.stage] + ' (gatilho ' + CMP_STAGE_GATILHO[q.stage] + ')' : ''}\nEsqueleto atual:\n${q.items.map((i, k) => `${k + 1}. [${i.type}] ${i.say}`).join('\n')}`);
    const arr = (Array.isArray(j) ? j : []).slice(0, n); if (arr.length < 3) throw new Error('a IA devolveu poucos Stories.');
    q.items = arr.map((x, k) => { const o = q.items[k] || S_('video', '', '', '', '', ''); return {type: ST_TYPES.includes(x && x.type) ? x.type : o.type, scene: String((x && x.scene) || '').slice(0, 700), say: String((x && x.say) || '').slice(0, 900), el: String((x && x.el) || '').slice(0, 500), signal: String((x && x.signal) || '').slice(0, 300), goal: String((x && x.goal) || '').slice(0, 300), res: o.res}; });
    pl.status = 'Rascunho'; pl.approvedAt = ''; spendCredits(1); persist(); renderStories(); toast('Sequência reescrita. Revise.');
  } catch (e) { toast('IA: ' + e.message); }
}
async function stToAd(sid, i) {
  const p = curProject(), pl = stPlan(p, stUI.id), q = pl.seqs.find(x => x.id === sid), it = q && q.items[i], c = pl.cid && p.campaigns.find(x => x.id === pl.cid);
  if (!c) { toast('Ligue o plano a uma campanha (no topo) para transformar o Story em anúncio.'); return; }
  if (c.pieces.length >= 100) { toast('A campanha já tem o máximo de anúncios.'); return; }
  let h = String(it.say || '').replace(/^["“]|["”]$/g, '').replace(/\[[^\]]*\]/g, '').trim().split(/(?<=[.!?])\s/)[0].slice(0, 110).trim(); if (h.length < 4) { toast('Escreva a fala deste Story antes de transformar em anúncio.'); return; }
  const st = q.stage || 'acao', k = c.pieces.filter(x => x.stage === st).length, pc = cmpNewPiece(c, st, k, {h, t: ''}, c.pieces.length); pc.name = `${CMP_STAGE_NAME[st]} · Anúncio ${k + 1} (do Story)`; c.pieces.push(pc);
  toast('Montando o anúncio nas 3 medidas…'); await cmpBuildPiece(p, c, pc); persist(); toast(`Anúncio criado na campanha "${c.name}", fase ${CMP_STAGE_NAME[st]}.`);
}

/* ---------- aprovação e download (PDF e Docs) ---------- */
function stDocText(p, pl) {
  const L = [`PLANO DE STORIES · ${pl.name}`, `Objetivo: ${pl.objective} · Personalidade: ${ST_PERS_L[pl.pers]}${pl.cid && p.campaigns.find(c => c.id === pl.cid) ? ' · Campanha: ' + p.campaigns.find(c => c.id === pl.cid).name : ''}`, ''];
  for (let d = 0; d < 7; d++) { const qs = pl.seqs.filter(q => q.day === d).sort((a, b) => a.slot - b.slot); if (!qs.length) continue; const dt = pl.start ? ' · ' + new Date(new Date(pl.start + 'T12:00:00').getTime() + d * 864e5).toLocaleDateString('pt-BR') : '';
    L.push(`DIA ${d + 1} · ${ST_DAYS[d].toUpperCase()}${dt}`, '');
    qs.forEach(q => { L.push(`Sequência ${q.slot}: ${q.title}`, `Objetivo: ${q.goal}`, ''); q.items.forEach((i, k) => { L.push(`STORY ${k + 1} — ${ST_LABEL[i.type].toUpperCase()}`, `O que gravar ou mostrar: ${i.scene}`, `Fale exatamente: ${i.say}`); if (i.el) L.push(`Elemento de interação: ${i.el}`); L.push(`Sinal esperado: ${i.signal}`, `Objetivo: ${i.goal}`, ''); }); L.push('---', ''); }); }
  return L.join('\n');
}
function stSetStatus(st) { const pl = stPlan(curProject(), stUI.id); if (st === 'Aprovado' && !(pl.resp || state.workspace.responsible || '').trim()) { toast('Preencha o nome do responsável antes de aprovar: ele vai no cabeçalho.'); return; } pl.status = st; pl.approvedAt = st === 'Rascunho' ? '' : new Date().toISOString(); if (!pl.resp) pl.resp = (state.workspace.responsible || '').trim(); persist(); renderStories(); toast(st === 'Aprovado' ? 'Plano aprovado. Já dá para baixar em PDF e em Docs.' : 'Plano: ' + st.toLowerCase() + '.'); }
function stDownload(fmt) {
  const p = curProject(), pl = stPlan(p, stUI.id); if (!pl || pl.status !== 'Aprovado') { toast('Aprove o plano para baixar.'); return; }
  const d = {label: 'Plano de Stories', title: pl.name, text: stDocText(p, pl), status: pl.status, approvedAt: pl.approvedAt}, meta = {project: p.name, resp: (pl.resp || state.workspace.responsible || '').trim(), title: pl.name}, name = `${slug(p.name)}-stories-${slug(pl.name)}`;
  if (fmt === 'pdf') download(name + '.pdf', dxPdf([d], meta), 'application/pdf'); else download(name + '.docx', dxDocx([d], meta), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}
function stDownloadMd() { const p = curProject(), pl = stPlan(p, stUI.id); if (pl) download(`stories-${slug(pl.name)}.md`, stDocText(p, pl), 'text/markdown'); }

/* ---------- aprendizado ---------- */
function stStats(pl) { return pl.seqs.map(q => { const t = q.items.reduce((a, i) => { Object.keys(a).forEach(k => { a[k] += i.res[k]; }); return a; }, {views: 0, replies: 0, taps: 0, exits: 0, msgs: 0}); return {q, t, rate: t.views ? (t.replies + t.msgs) / t.views : 0}; }); }
function stLearnHTML(pl) {
  const S = stStats(pl).filter(x => x.t.views > 0).sort((a, b) => b.rate - a.rate);
  if (!S.length) return '<p class="muted" style="font-size:12.5px;margin:0">Depois de publicar, lance em cada Story as visualizações, respostas, toques, saídas e mensagens. O Studio mostra qual sequência rendeu mais e qual mecanismo repetir.</p>';
  const best = S[0], mech = {}; best.q.items.forEach(i => { mech[i.type] = (mech[i.type] || 0) + 1; }); const m = Object.entries(mech).sort((a, b) => b[1] - a[1])[0];
  return `<div class="list">${S.map(x => `<div class="list-item"><div><strong>${ST_DAYS[x.q.day]} · ${esc(x.q.title)}</strong><small>${x.t.views} visualizações · ${x.t.replies} respostas · ${x.t.msgs} mensagens · ${x.t.exits} saídas</small></div><span class="cmp-tag">${(x.rate * 100).toFixed(1)}% de resposta</span></div>`).join('')}</div><p class="muted" style="font-size:12.5px;margin:8px 0 0">Melhor sequência até agora: <b>${esc(best.q.title)}</b> (${(best.rate * 100).toFixed(1)}% de respostas e mensagens por visualização). Mecanismo mais usado nela: <b>${m ? ST_LABEL[m[0]] : '—'}</b>. Ideia: repita essa estrutura e transforme os Stories com mais respostas em anúncios (botão "→ anúncio" em cada Story).</p>`;
}
function stRefreshLearn() { const b = $('stLearn'), pl = stPlan(curProject(), stUI.id); if (b && pl) b.innerHTML = stLearnHTML(pl); }

/* ---------- tela ---------- */
function stSeqHTML(pl, q) {
  const cn = n => n;
  return `<div class="panel" style="margin-top:10px"><div class="section-row"><div><strong>${ST_DAYS[q.day]} · ${esc(q.title)}</strong> <small class="muted">${q.items.length} Stories${q.stage ? ' · ' + CMP_STAGE_NAME[q.stage] + ' · gatilho ' + CMP_STAGE_GATILHO[q.stage] : ''}</small><div class="muted" style="font-size:12px">${esc(q.goal)}</div></div><div class="row-gap"><button class="btn sm" onclick="stAI('${q.id}')" title="Usa 1 crédito">✨ Reescrever com IA</button><button class="btn sm" onclick="stRedo('${q.id}')">Refazer do esqueleto</button><button class="btn sm" onclick="stAdd('${q.id}')">＋ Story</button></div></div>
  ${q.items.map((i, k) => `<div class="panel cmp-note" style="margin-top:8px"><div class="row-gap" style="align-items:center;flex-wrap:wrap"><b>STORY ${k + 1}</b><select onchange="stItem('${q.id}',${k},'type',this.value)">${ST_TYPES.map(t => `<option value="${t}" ${t === i.type ? 'selected' : ''}>${ST_LABEL[t]}</option>`).join('')}</select><span style="flex:1"></span><button class="btn sm" onclick="stMove('${q.id}',${k},-1)" title="Subir">↑</button><button class="btn sm" onclick="stMove('${q.id}',${k},1)" title="Descer">↓</button><button class="btn sm" onclick="stToAd('${q.id}',${k})" title="Cria um anúncio nas 3 medidas na campanha ligada">→ anúncio</button><button class="btn sm" onclick="stRm('${q.id}',${k})">×</button></div>
  <div class="form-grid" style="margin-top:6px"><div class="field full"><label>O que gravar ou mostrar</label><textarea rows="2" onchange="stItem('${q.id}',${k},'scene',this.value)">${esc(i.scene)}</textarea></div><div class="field full"><label>Fale exatamente</label><textarea rows="2" onchange="stItem('${q.id}',${k},'say',this.value)">${esc(i.say)}</textarea></div>
  <div class="field"><label>Elemento de interação (com as opções)</label><input value="${esc(i.el)}" onchange="stItem('${q.id}',${k},'el',this.value)"></div><div class="field"><label>Sinal esperado</label><input value="${esc(i.signal)}" onchange="stItem('${q.id}',${k},'signal',this.value)"></div><div class="field full"><label>Objetivo (como prepara o próximo)</label><input value="${esc(i.goal)}" onchange="stItem('${q.id}',${k},'goal',this.value)"></div></div>
  <details style="margin-top:6px"><summary class="muted" style="font-size:12px;cursor:pointer">Resultados deste Story</summary><div class="row-gap" style="flex-wrap:wrap;margin-top:6px">${[['views', 'Visualizações'], ['replies', 'Respostas'], ['taps', 'Toques'], ['exits', 'Saídas'], ['msgs', 'Mensagens']].map(([r, l]) => `<label class="muted" style="font-size:12px">${l}<br><input type="number" min="0" style="width:90px" value="${i.res[r] || ''}" onchange="stItem('${q.id}',${k},'${r}',this.value)"></label>`).join('')}</div></details></div>`).join('')}</div>`;
}
function stPlanHTML(p, pl) {
  const ok = pl.status === 'Aprovado', col = {Rascunho: '#888', Pronto: '#c9952a', Aprovado: '#2e7d4f'}[pl.status], total = pl.seqs.reduce((a, q) => a + q.items.length, 0), sel = pl.seqs.find(q => q.id === stUI.seq);
  const cname = (p.campaigns.find(c => c.id === pl.cid) || {}).name;
  const days = ST_DAYS.map((dn, d) => { const qs = pl.seqs.filter(q => q.day === d).sort((a, b) => a.slot - b.slot), dt = pl.start ? new Date(new Date(pl.start + 'T12:00:00').getTime() + d * 864e5).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}) : '';
    return `<div class="st-day"><div class="st-dh"><b>${dn}</b> <small class="muted">${dt}</small></div>${qs.map(q => `<button class="st-card ${stUI.seq === q.id ? 'on' : ''}" onclick="stSeq('${q.id}')"><b>${esc(q.title)}</b><small>${q.items.length} Stories${q.stage ? ' · ' + CMP_STAGE_NAME[q.stage] : ''}</small><span>${[...new Set(q.items.map(i => ST_LABEL[i.type]))].slice(0, 3).join(' · ')}</span></button>`).join('') || '<small class="muted">Sem sequência</small>'}</div>`; }).join('');
  return `<div class="section-row" style="margin-bottom:8px"><button class="btn sm" onclick="stBack()">← Planos</button><div class="row-gap"><button class="btn sm" onclick="stDownloadMd()" title="Rascunho de trabalho">⬇ Rascunho .md</button><button class="btn sm" onclick="stDel('${pl.id}')">Excluir</button></div></div>
  <div class="panel"><div class="form-grid"><div class="field"><label>Nome</label><input value="${esc(pl.name)}" onchange="stField('name',this.value)"></div><div class="field"><label>Início da semana</label><input type="date" value="${pl.start}" onchange="stField('start',this.value)"></div></div>
  <p class="muted" style="font-size:12.5px;margin:8px 0 0">${pl.seqs.length} sequências · ${total} Stories · ${esc(pl.objective)} · ${ST_PERS_L[pl.pers]}${cname ? ' · campanha ' + esc(cname) : ' · sem campanha'}</p>
  <div class="row-gap" style="flex-wrap:wrap;align-items:center;margin-top:8px"><label class="muted" style="font-size:12.5px">Responsável (vai no cabeçalho) <input value="${esc(pl.resp || state.workspace.responsible || '')}" style="min-width:220px" onchange="stField('resp',this.value)"></label><span class="cmp-tag" style="background:${col}22;color:${col}">${pl.status}${ok && pl.approvedAt ? ' em ' + fmtDate(pl.approvedAt) : ''}</span>${ok ? `<button class="btn sm" onclick="stSetStatus('Rascunho')">Reabrir para editar</button>` : `<button class="btn sm" onclick="stSetStatus('Pronto')" ${pl.status === 'Pronto' ? 'disabled' : ''}>Marcar como pronto</button><button class="btn sm dark" onclick="stSetStatus('Aprovado')">Aprovar</button>`}<button class="btn sm" onclick="stDownload('pdf')" ${ok ? '' : 'disabled'} title="${ok ? '' : 'Aprove para baixar'}">⬇ PDF</button><button class="btn sm" onclick="stDownload('docx')" ${ok ? '' : 'disabled'} title="${ok ? 'Abre no Word e no Google Docs' : 'Aprove para baixar'}">⬇ Docs (.docx)</button></div></div>
  <div class="st-week">${days}</div>${sel ? stSeqHTML(pl, sel) : '<p class="muted" style="margin-top:10px">Clique numa sequência para ver e editar os Stories dela.</p>'}
  <div class="panel" style="margin-top:12px"><h3 style="margin-top:0">Aprendizado</h3><div id="stLearn">${stLearnHTML(pl)}</div></div>`;
}
function renderStories() {
  const p = curProject(), r = $('storiesRoot'); if (!r) return; if (!p) { r.innerHTML = noProject('Stories'); return; }
  const pl = stUI.id && stPlan(p, stUI.id);
  r.innerHTML = hubHead('Stories', 'Planeje a semana: sequências de 3 a 15 Stories por dia, prontas para gravar, com interação e aprendizado.', pl ? '' : '<button class="btn dark" onclick="stNewModal()">＋ Planejar a semana</button>') +
    (pl ? stPlanHTML(p, pl) : `<div class="panel">${p.stories.length ? `<div class="list">${p.stories.map(x => `<div class="list-item"><div><strong>${esc(x.name)}</strong><small>${x.seqs.length} sequências · ${x.seqs.reduce((a, q) => a + q.items.length, 0)} Stories · ${x.status}${x.cid && p.campaigns.find(c => c.id === x.cid) ? ' · campanha ' + esc(p.campaigns.find(c => c.id === x.cid).name) : ''}</small></div><button class="btn sm dark" onclick="stOpen('${x.id}')">Abrir</button></div>`).join('')}</div>` : '<p class="muted">Nenhum plano ainda. Clique em "Planejar a semana": o Studio monta 7 dias de sequências com o que gravar e o que falar em cada Story.</p>'}</div>`);
}
