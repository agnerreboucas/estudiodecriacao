/* Dados fictícios para a versão de demonstração (arquivo único). Só é incluído em demo/ampliacao-studio-demo.html. */
(function () {
  const DAY = 864e5, ago = n => new Date(Date.now() - n * DAY), isoDay = n => ago(n).toISOString().slice(0, 10), isoAt = n => ago(n).toISOString();
  let seed = 42; const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pick = a => a[Math.floor(rnd() * a.length)];

  function demoState() {
    /* ---------- Projeto 1: Mutuários Brasil (completo) ---------- */
    const mb = newProject('Mutuários Brasil', 'Aquisição e educação jurídica', {
      cover: 'a3', icon: 'MB', goal: 'Construir uma máquina de aquisição orientada pela jornada de compra.', created: isoAt(40),
      brand: {positioning: 'Orientação antes da decisão', tone: 'Claro, seguro, humano', palette: 'Verde profundo · areia · laranja', visual: 'Editorial + performance', rule: 'Educar antes de converter', instructions: 'Priorizar clareza, contexto e prova. Evitar promessas absolutas. Construir peças com hierarquia visual forte, pouco ruído e uma ação principal por criativo.'}
    });
    mb.assets = [{id: 'a-1', name: 'Logo principal', category: 'Logo', url: ''}, {id: 'a-2', name: 'Kit de cores', category: 'Documento', url: ''}, {id: 'a-3', name: 'Banco de referências', category: 'Referência', url: ''}];
    const pre = mb.pre;
    pre.briefing = 'Empresa que orienta mutuários sobre direitos e próximos passos em contratos de financiamento. Hoje depende de indicação, não tem previsão de fechamento, não possui área comercial especializada e não usa nenhum sistema de gestão de vendas. Os sócios dividem o tempo entre atendimento e gestão.';
    ['d1', 'd2', 'd3', 'd8'].forEach(id => pre.challenges[id] = true);
    pre.hyp.d1 = {text: 'A dependência de indicação pode limitar a previsibilidade de novos contratos: em meses sem indicação, a agenda fica vazia.', edited: true, validated: true};
    pre.hyp.d8 = {text: 'Sem um sistema de vendas, não sabemos de onde vêm os clientes que fecham nem onde os outros se perdem. Esta hipótese ainda precisa ser confirmada olhando a planilha atual.', edited: true};
    refreshDrafts(pre);
    pre.okr.edited = true; pre.okr.tr = ['Definir meta mensal de leads qualificados (valor a validar com os sócios).', 'Colocar o Meta Ads e uma landing page de diagnóstico em operação.', 'Reduzir a dependência de indicação como única fonte de oportunidades.', 'Medir volume, qualidade e origem dos leads gerados.'];
    pre.icps = [
      {name: 'Mutuário em dúvida', profile: 'Pessoa física com financiamento imobiliário em andamento', situation: 'Recebeu reajuste ou cobrança que não entende', need: 'Entender seus direitos antes de assinar ou pagar', behavior: 'Pesquisa no Google e no Instagram à noite', intent: 'Agendar uma conversa para avaliar o caso'},
      {name: 'Comprador de primeiro imóvel', profile: 'Casal, 28–38 anos, primeira compra financiada', situation: 'Prestes a assinar o contrato', need: 'Segurança para decidir sem ser enganado', behavior: 'Compara bancos, pede opinião a amigos', intent: 'Revisar o contrato antes da assinatura'},
      {name: 'Mutuário inadimplente', profile: 'Pessoa com parcelas atrasadas', situation: 'Medo de perder o imóvel', need: 'Alternativas legais para regularizar', behavior: 'Busca ajuda urgente via WhatsApp', intent: 'Falar com um especialista no mesmo dia'}];
    const J = [['Vê um conteúdo sobre cobrança abusiva.', 'Isso acontece comigo?', 'Medo de estar sendo lesado.', 'Clareza sobre o que é normal.', 'Reel educativo no feed.', '“É golpe de advogado.”', 'Linguagem simples, sem juridiquês.'],
      ['Percebe que o problema tem nome.', 'Meu caso se encaixa?', 'Insegurança de assinar sem entender.', 'Um diagnóstico rápido.', 'Checklist antes do contrato.', '“Vai custar caro.”', 'Conteúdo gratuito e útil.'],
      ['Compara opções de ajuda.', 'Vale a pena buscar orientação?', 'Medo de perder tempo e dinheiro.', 'Prova de que funciona.', 'Caso real explicado.', '“Não sei se preciso.”', 'Casos e autoridade.'],
      ['Decide falar com alguém.', 'Como é o primeiro contato?', 'Receio de compromisso.', 'Conversa sem pressão.', 'Landing com WhatsApp.', '“E se eu me arrepender?”', 'Primeira análise sem compromisso.'],
      ['Já é cliente.', 'E agora, qual o próximo passo?', 'Ansiedade com o andamento.', 'Ser informado sem pedir.', 'Atualização por WhatsApp.', '“Ninguém me responde.”', 'Prazos claros e retorno rápido.']];
    J.forEach((r, i) => ['situacao', 'duvida', 'dor', 'desejo', 'gatilho', 'objecao', 'confianca'].forEach((k, j) => pre.journey[i][k] = r[j]));
    pre.positioning = 'Para quem precisa decidir sobre um financiamento, a Mutuários Brasil é a orientação clara antes da assinatura: educação jurídica sem juridiquês, com prova e sem promessas absolutas.'; pre.positioningApproved = true;
    pre.status = 'APROVADO'; pre.approvedAt = isoAt(12);
    pre.history = [{at: isoAt(8), action: 'Posicionamento aprovado', note: ''}, {at: isoAt(12), action: 'Aprovado', note: 'Próximo gate: Posicionamento.'}, {at: isoAt(13), action: 'Enviado para revisão', note: ''}, {at: isoAt(14), action: 'Ajustes solicitados', note: 'Detalhar o ICP de primeiro imóvel.'}, {at: isoAt(18), action: 'Enviado para revisão', note: ''}];

    /* matriz: 100 conceitos determinísticos; 6 já em produção */
    const sel = {hooks: ['Problema', 'Curiosidade', 'Alerta', 'Pergunta'], angles: ['Problema', 'Educação', 'Erro', 'Checklist', 'Prova'], formats: ['UGC', 'Especialista', 'Cinemático'], ctas: ['Saiba mais', 'Entenda seu caso', 'Veja como funciona'], direction: ['Close', 'Plano médio', 'POV', 'Luz natural']};
    mb.matrix.sel = sel; mb.matrix.duration = 15; mb.matrix.stage = 12;
    const seen = new Set(), concepts = [];
    while (concepts.length < 100) { const c = {hook: pick(sel.hooks), angle: pick(sel.angles), format: pick(sel.formats), cta: pick(sel.ctas), direction: pick(sel.direction)}, k = Object.values(c).join('|'); if (seen.has(k)) continue; seen.add(k); concepts.push(Object.assign(c, {id: 'k-' + pad(concepts.length + 1), pinned: false, creativeId: '', score: 100 - concepts.length * 0.6 + rnd() * 3})); }
    mb.matrix.concepts = concepts;
    const prod = concepts.slice(0, 6); prod[0].pinned = true; prod[1].pinned = true;

    /* criações */
    const base = [['Proteja seu patrimônio', 'Carrossel educativo', 'a3'], ['Não tome uma decisão no escuro', 'Meta Ads', 'a2'], ['Entenda antes de assinar', 'Story', 'a1'], ['3 sinais de atenção', 'Reels', 'a4'], ['Você sabe o que está pagando?', 'Meta Ads', 'a5'], ['Jornada do mutuário', 'Carrossel', 'a6'], ['Direito explicado sem juridiquês', 'Post', 'a7'], ['Seu próximo passo começa aqui', 'Landing', 'a8'], ['Perguntas que você precisa fazer', 'Carrossel', 'a3'], ['Checklist antes do contrato', 'PDF', 'a6'], ['Quando procurar orientação', 'Meta Ads', 'a2'], ['Conteúdo que gera confiança', 'Branding', 'a1']];
    const statuses = ['Publicado', 'Aprovado', 'Aprovado', 'Publicado', 'Para aprovação', 'Aprovado', 'Rascunho', 'Em produção', 'Rascunho', 'Aprovado', 'Ajustes', 'Rascunho'];
    const creatives = base.map(([title, type, cls], i) => ({id: 'c-b' + i, projectId: mb.id, title, type, cls, status: statuses[i], brief: i === 0 ? 'Carrossel de 6 lâminas sobre os 3 direitos que o mutuário costuma desconhecer.' : '', created: isoAt(30 - i)}));
    prod.forEach((c, i) => {
      const cr = {id: 'c-p' + i, projectId: mb.id, title: `${c.hook} × ${c.angle}`, type: 'Vídeo 15s', cls: 'a4', status: i < 4 ? 'Aprovado' : 'Para aprovação', brief: hookLine(mb, c) + ' · CTA: ' + c.cta, created: isoAt(9 - i)};
      creatives.push(cr); c.creativeId = cr.id;
      mb.approvals.push({id: 'ap-' + i, title: cr.title, kind: 'Conceito', status: i < 4 ? 'Aprovado' : 'Pendente', note: '', refType: 'creative', refId: cr.id, created: isoAt(9 - i), decidedAt: i < 4 ? isoAt(7 - i) : undefined});
    });
    mb.approvals.push({id: 'ap-r', title: `Roteiro · Vídeo 15s · ${prod[0].hook} × ${prod[0].angle}`, kind: 'Roteiro', status: 'Aprovado', note: '', refType: 'video', refId: prod[0].id, created: isoAt(6), decidedAt: isoAt(5)});
    mb.approvals.push({id: 'ap-x', title: 'Carrossel · Jornada · Variação B', kind: 'Criativo', status: 'Pendente', note: '', refType: 'creative', refId: 'c-b4', created: isoAt(2)});
    mb.approvals.push({id: 'ap-y', title: 'Meta Ads · Quando procurar orientação', kind: 'Criativo', status: 'Ajustes', note: 'Trocar a imagem principal; headline longa demais.', refType: 'creative', refId: 'c-b10', created: isoAt(4), decidedAt: isoAt(3)});

    /* video lab */
    mb.video.conceptId = prod[0].id; mb.video.scenes = buildScenes(mb, prod[0]);
    mb.video.scenes[1].action = 'Mulher confere um boleto de financiamento com expressão de dúvida.'; mb.video.scenes[1].text = 'A parcela subiu. E agora?';
    mb.video.scenes[3].action = 'Especialista explica o que é possível revisar, em plano médio.'; mb.video.scenes[3].model = 'qualidade';
    ['Briefing', 'Roteiro', 'Aprovação do roteiro', 'Storyboard', 'Direção'].forEach((s, i) => mb.video.steps[s] = isoAt(6 - i * 0.5));

    /* campanhas, landings, publicações */
    mb.campaigns = [{id: 'cm-1', name: 'Educação — Dor', objective: 'Tráfego', budget: 80, channel: 'Meta Ads', status: 'Ativa'}, {id: 'cm-2', name: 'Diagnóstico — Intenção', objective: 'Leads', budget: 120, channel: 'Meta Ads', status: 'Ativa'}, {id: 'cm-3', name: 'Conversão — WhatsApp', objective: 'Conversões', budget: 150, channel: 'Meta Ads', status: 'Rascunho'}, {id: 'cm-4', name: 'Remarketing — Prova', objective: 'Leads', budget: 60, channel: 'Meta Ads', status: 'Pausada'}];
    mb.landings = [{id: 'lp-1', name: 'LP · Diagnóstico inicial', goal: 'Gerar lead', headline: 'Entenda seu financiamento antes de decidir', sub: 'Uma conversa sem compromisso para revisar o seu caso.', bullets: 'Análise do contrato em linguagem simples\nSem promessas, só clareza\nRetorno em até 1 dia útil', cta: 'Quero entender meu caso', whatsapp: '5511999990000', status: 'Exportada'}, {id: 'lp-2', name: 'LP · Revisão de contrato', goal: 'WhatsApp', headline: 'Vai assinar um contrato? Confira antes.', sub: '', bullets: '', cta: 'Falar no WhatsApp', whatsapp: '5511999990000', status: 'Rascunho'}];
    mb.publications = [{id: 'pb-1', title: 'Não tome uma decisão no escuro', creativeId: 'c-b1', channel: 'Instagram', date: isoDay(3), caption: 'Antes de assinar, entenda. 👇', status: 'Publicado'}, {id: 'pb-2', title: `${prod[0].hook} × ${prod[0].angle}`, creativeId: 'c-p0', channel: 'Meta Ads', date: isoDay(-2), caption: '', status: 'Agendado'}, {id: 'pb-3', title: 'Checklist antes do contrato', creativeId: 'c-b9', channel: 'Instagram', date: isoDay(-4), caption: 'Salve este checklist.', status: 'Agendado'}, {id: 'pb-4', title: `${prod[1].hook} × ${prod[1].angle}`, creativeId: 'c-p1', channel: 'Facebook', date: isoDay(-7), caption: '', status: 'Agendado'}];

    /* métricas: 14 dias, algumas ligadas a conceitos para o aprendizado */
    for (let d = 14; d >= 1; d--) {
      const c = d <= 12 ? prod[d % 6] : null, spend = 70 + Math.round(rnd() * 70), cpl = c ? [16, 22, 34, 19, 46, 28][prod.indexOf(c)] : 26 + rnd() * 8, leads = Math.round(spend / cpl), imp = Math.round(spend * (190 + rnd() * 60)), clk = Math.round(imp * (0.022 + rnd() * 0.012));
      mb.metrics.push({id: 'm-' + d, date: isoDay(d), spend, impressions: imp, clicks: clk, leads, conversions: leads > 3 && d % 4 === 0 ? 1 : 0, conceptId: c ? c.id : '', note: c ? 'Teste de criativo' : '', source: 'manual'});
    }

    mb.competitors = [
      {id: 'cp-1', name: 'Rival Financeira', url: 'https://rivalfinanceira.exemplo.com.br', social: '@rivalfinanceira', notes: 'Líder em anúncios de crédito no Instagram.', addedAt: isoAt(15),
       scan: {url: 'https://rivalfinanceira.exemplo.com.br', at: isoAt(15), title: 'Rival Financeira — Crédito sem enrolação', description: 'Simule seu crédito em 2 minutos, sem burocracia.', headings: ['Crédito aprovado em minutos', 'Sem taxa escondida. Sem fila.', 'Mais de 10 mil clientes atendidos'], ctas: ['Quero simular agora', 'Falar no WhatsApp'], fonts: ['Poppins'], colors: ['#0a7d5a', '#ff7a00', '#222222', '#e5e5e5', '#f6fbf9'], themeColor: '#0a7d5a', ogImage: '', textSample: ''},
       teardown: {product: 'Crédito pessoal online', offer: 'Aprovação rápida e sem taxa escondida', hooks: ['Aprovado em minutos', 'Sem fila, sem taxa'], angles: ['Rapidez', 'Transparência'], typography: 'Poppins, títulos em negrito', layout: 'Hero verde com CTA laranja e prova social logo abaixo', colors: '#0a7d5a #ff7a00', ctas: ['Quero simular agora'], proof: ['+10 mil clientes'], opportunities: ['Ninguém explica o contrato em linguagem simples', 'Pouco conteúdo educativo sobre direitos'], source: 'ai', at: isoAt(15)},
       dossier: {gmb: {name: 'Rival Financeira Matriz', address: 'Av. Paulista, 1000 · São Paulo, SP', phone: '(11) 4000-1000', rating: 4.6, reviews: 312, categories: 'Financeira', hours: 'seg a sex 09:00–18:00', website: 'https://rivalfinanceira.exemplo.com.br', mapsUrl: '', source: 'manual'},
         ig: {handle: '@rivalfinanceira', followers: '48 mil', freq: '5 por semana', formats: 'Reels e carrossel', bio: 'Crédito sem enrolação', notes: 'Reels com depoimento de cliente têm mais comentários.'},
         ads: [{id: 'ad-1', platform: 'Meta (Instagram/Facebook)', format: 'Vídeo', hook: 'Crédito aprovado em minutos', offer: 'Sem taxa escondida', cta: 'Simular agora', url: '', seen: isoDay(6)}, {id: 'ad-2', platform: 'Meta (Instagram/Facebook)', format: 'Carrossel', hook: '3 erros que encarecem seu crédito', offer: 'Guia gratuito', cta: 'Baixar guia', url: '', seen: isoDay(4)}]}},
      {id: 'cp-2', name: 'Escritório Alves & Costa', url: 'https://alvescosta.exemplo.com.br', social: '@alvescosta.adv', notes: 'Direito imobiliário, comunicação formal.', addedAt: isoAt(14), scan: null,
       teardown: {product: 'Consultoria jurídica imobiliária', offer: 'Atendimento especializado', hooks: ['Seu direito, nossa causa'], angles: ['Autoridade', 'Experiência'], typography: 'Serifada, tom formal', layout: 'Fundo escuro, fotos de equipe', colors: '#1b1b2f #c9a227', ctas: ['Agende uma consulta'], proof: ['20 anos de atuação'], opportunities: ['Linguagem difícil afasta o público comum'], source: 'manual', at: isoAt(14)}}];
    mb.matrix.custom = {hooks: ['Aprovado em minutos'], angles: ['Rapidez', 'Transparência', 'Autoridade'], ctas: []};
    mb.client = 'Mutuários Brasil Ltda.';
    Object.assign(mb.brief, {source: 'livre', offer: 'Orientação jurídica e educativa para mutuários sobre contratos de financiamento.', audience: 'Pessoas físicas com financiamento imobiliário, de 28 a 55 anos.', problem: 'Parcelas e cobranças que não entendem; medo de assinar ou pagar errado.', goal: 'Gerar demanda recorrente de consultas e organizar o atendimento.', channels: 'Indicação, Instagram orgânico.', budget: 'Até R$ 4.000/mês no início.', deadline: 'Primeiros leads em 30 dias.', competitors: 'Escritórios locais de direito imobiliário.', original: pre.briefing, createdAt: isoAt(40)});
    mb.voice = {personality: 'Especialista acolhedor: explica sem julgar.', principles: 'Clareza antes de persuasão. Uma ideia por peça. Prova antes de promessa.', vocabulary: 'entender, conferir, direito, próximo passo, sem compromisso', antivocab: 'garantimos, ganho certo, 100%, mutuário caloteiro, juridiquês', rules: 'Frases curtas. Verbo no início da chamada. Sem siglas sem explicar.', channels: 'Instagram: direto e visual. WhatsApp: pessoal e curto. Anúncio: problema + próximo passo.', examples: '“A parcela subiu. Você sabe por quê?”', checklist: 'Tem uma ação principal? Evita promessa absoluta? Linguagem simples?'};
    /* ---------- Projeto 2: em revisão ---------- */
    const cd = newProject('Cartório Descomplicado', 'Conteúdo + geração de demanda', {cover: 'a6', icon: 'CD', goal: 'Gerar demanda recorrente para serviços de cartório online.', created: isoAt(20)});
    ['d4', 'd5', 'd7'].forEach(id => cd.pre.challenges[id] = true); cd.pre.briefing = 'Cartório que quer vender serviços online (certidões, reconhecimento de firma) mas só faz ações pontuais e vê marketing como custo.';
    refreshDrafts(cd.pre); cd.pre.icps = [{name: 'Pessoa com pressa de documento', profile: 'Adulto urbano', situation: 'Precisa de certidão rápido', need: 'Resolver sem ir ao cartório', behavior: 'Busca no Google', intent: 'Pedir online'}];
    cd.pre.status = 'EM REVISÃO'; cd.pre.history = [{at: isoAt(2), action: 'Enviado para revisão', note: ''}];
    cd.brand = {positioning: 'Cartório sem burocracia', tone: 'Prático e acolhedor', palette: 'Azul · branco', visual: 'Limpo, ícones simples', rule: 'Mostrar o passo a passo', instructions: ''};
    /* ---------- Projeto 3: começando ---------- */
    const se = newProject('Saber Ensinar', 'Educação criativa', {cover: 'a8', icon: 'SE', created: isoAt(3)}); se.pre.challenges.d6 = true; se.pre.briefing = 'Escola de formação de professores com os sócios divididos entre aulas e gestão.'; refreshDrafts(se.pre);
    creatives.push({id: 'c-cd1', projectId: cd.id, title: 'Certidão em 3 passos', type: 'Carrossel', cls: 'a6', status: 'Rascunho', brief: '', created: isoAt(5)}, {id: 'c-cd2', projectId: cd.id, title: 'Quanto custa uma certidão?', type: 'Reels', cls: 'a2', status: 'Para aprovação', brief: '', created: isoAt(4)});
    cd.metrics = [{id: 'm-cd1', date: isoDay(5), spend: 90, impressions: 15000, clicks: 240, leads: 9, conversions: 2, conceptId: '', note: '', source: 'manual'}];

    return {schema: SCHEMA, meta: {rev: 0, dirty: false, updatedAt: 0, syncedAt: 0}, workspace: {name: 'Ampliação Marketing', instruction: 'Criar com clareza estratégica, consistência de marca e foco na jornada de compra.', leadsUrl: 'https://seusite.com.br/api/leads.php?token=SEU_TOKEN'}, credits: 24, activeProjectId: mb.id, projects: [mb, cd, se], creatives};
  }

  /* Substitui a semente padrão e simula servidor para mostrar a caixa de leads */
  seedState = demoState; state = demoState();
  const mbId = () => state.projects[0].id;
  radarFetchScan = async url => ({url, at: new Date().toISOString(), title: 'Site de exemplo — ' + url.replace(/^https?:\/\//, '').split('/')[0], description: 'Leitura simulada na versão de demonstração.', headings: ['Título principal da página', 'Benefícios em destaque', 'Depoimentos de clientes'], ctas: ['Quero saber mais', 'Fale conosco'], fonts: ['Inter', 'Georgia'], colors: ['#1f6feb', '#f5a524', '#111827', '#e5e7eb'], themeColor: '', ogImage: '', textSample: ''});
  const realApi = api; api = async (path, opts) => path.startsWith('places.php') ? {ok: true, places: [{name: 'Estabelecimento de exemplo', address: 'Rua das Flores, 120 · Campinas, SP', phone: '(19) 3000-2000', rating: 4.4, reviews: 87, categories: 'Serviços', hours: 'seg a sex 08:00–17:00', website: '', mapsUrl: ''}]} : realApi(path, opts);
  const realRenderDesign = renderDesign;
  renderDesign = function () {
    const p = dzP();
    if (p && !p.design.seeded && !p.design.sets.length && p === state.projects[0]) {
      p.design.seeded = true;
      (async () => {
        const tk = makeTokens(byId(DESIGN_STYLES, 'financeiro'), byId(FONT_PAIRS, 'merriweather'), byId(PHOTO_STYLES, 'callcenter')); tk.name = 'Campanha Mutuários';
        await ensureFonts([tk.head.family, tk.body.family]);
        const a = buildSet('Carrossel · Parcela subiu', tk, parseCopy(DEFAULT_COPY, p), FORMATS.feed45, p.name), b = buildSet('Stories · Chamada final', tk, parseCopy('Vai assinar um contrato? | Confira antes\nSem juridiquês: a gente explica cada cláusula.\nPrimeiro contato sem compromisso: você decide depois.\nQuer conferir seu contrato? | Falar no WhatsApp', p), FORMATS.story, p.name);
        p.design.sets.push(a, b); p.design.styles.push({id: 'st-demo', name: 'Campanha Mutuários', tk: extractStyle(a), created: new Date().toISOString()}); persist(); realRenderDesign();
      })();
    }
    return realRenderDesign();
  };
  fetchLeads = async () => [
    ['Carla Mendes', '11 98765-4410', 'Meta Ads', 'Minha parcela subiu 30% e ninguém explica. Podem revisar?', 1], ['Rogério Alves', '21 99811-2200', 'whatsapp', 'Vou assinar contrato semana que vem, queria uma opinião.', 2],
    ['Patrícia Souza', '31 98822-9080', 'site', 'Parcelas atrasadas, tenho medo de perder o imóvel.', 3], ['João Pedro', '11 97766-1234', 'Meta Ads', 'Como funciona a primeira análise?', 4], ['Mariana Lopes', '41 99900-7711', 'site', 'Quero entender meu caso.', 6]
  ].map(([name, phone, source, message, d], i) => ({id: 'l' + i, at: isoAt(d), project: mbId(), source, name, phone, email: '', message}));
  API.available = true; API.status = {auth: {required: false, loggedIn: true}, ai: {configured: false}, sync: {enabled: false}, webhook: {configured: false}, leads: {configured: true}, meta: {configured: false}, places: {configured: true}};
  loadStatus = async () => API.status; pullWorkspace = async () => {};
  renderSyncBadge = () => { const b = document.getElementById('syncBadge'); if (b) { b.textContent = '● Demo'; b.className = 'sync-badge local'; b.title = 'Versão de demonstração: dados fictícios, salvos só neste navegador.'; } };
  document.addEventListener('DOMContentLoaded', () => {
    const d = document.createElement('div'); d.className = 'demo-pill';
    d.innerHTML = 'DEMO · dados fictícios <button onclick="resetWorkspace()">Restaurar demo</button>'; document.body.appendChild(d);
    const st = document.createElement('style'); st.textContent = '.demo-pill{position:fixed;left:76px;bottom:14px;z-index:90;background:#111;color:#fff;border-radius:999px;padding:8px 8px 8px 14px;font-size:11px;display:flex;gap:10px;align-items:center;box-shadow:0 6px 24px #0003}.demo-pill button{background:#fff;color:#111;border:0;border-radius:999px;padding:5px 10px;font-size:11px;font-weight:700;cursor:pointer}@media(max-width:760px){.demo-pill{left:12px;bottom:10px}}'; document.head.appendChild(st);
  });
})();
