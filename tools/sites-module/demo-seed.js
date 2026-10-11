/* Dados fictícios só da demonstração (arquivo único): dois clientes de exemplo, um já com site pronto. Roda só na primeira abertura. */
(function () {
  setTimeout(async function () {
    if (state.projects.length) return;
    const opt = (k, n) => { const f = BF_SECTIONS.find(s => s.k === 'identidade').f.find(x => x[0] === k); return (f && f[3] || []).slice(0, n); };
    const p = newProject('Clínica Sorriso Vivo (exemplo)', 'Exemplo da demonstração', {category: 'Odontologia', goal: 'Agendamentos pelo WhatsApp'});
    p.client = 'Clínica Sorriso Vivo';
    bfStore(p).answers = {
      contato: {nome: 'Marina Souza', cargo: 'Recepção e marketing', whatsapp: '(19) 90000-0000', email: 'contato@exemplo.com.br'},
      empresa: {nome: 'Clínica Sorriso Vivo', instagram: '@sorrisovivo', cidade: 'Campinas e região', historia: 'Clínica odontológica de bairro que atende famílias com hora marcada.', missao: 'Cuidar do sorriso não deveria ser demorado nem constrangedor', diferenciais: 'Atendimento com hora marcada e sem espera na recepção\nO dentista explica o plano antes de começar', regras: 'Seguir as regras do CRO: sem antes e depois e sem promessa de resultado'},
      publico: {quem: 'Famílias e adultos que querem tratar os dentes sem fila', decide: 'Quem agenda costuma ser a mãe ou o próprio paciente', problemas: 'Consultas que atrasam e filas na recepção\nNão entender o que será feito nos dentes', perguntas: 'Dói?\nQuanto custa?\nAceita convênio?', desejos: 'Um sorriso saudável, com o tratamento explicado antes de começar', ocultas: 'insegurança e medo de não entender o que será feito', objecoes: 'É caro\nTenho medo de dentista', descobre: ['Indicação', 'Instagram', 'Google']},
      produtos: [
        {nome: 'Limpeza e prevenção', tipo: 'Serviço', oque: 'Revisão completa dos dentes e orientação de higiene', como: 'Agende pelo WhatsApp\nO dentista examina e explica o plano\nVocê começa o tratamento combinado', prazo: 'Primeira consulta no horário marcado', acao: 'Falar no WhatsApp', perguntas: 'Quanto tempo dura a consulta?'},
        {nome: 'Clareamento', tipo: 'Serviço', oque: 'Clareamento feito no consultório, com acompanhamento do dentista'},
        {nome: 'Aparelho ortodôntico', tipo: 'Serviço', oque: 'Avaliação e acompanhamento mensal'}],
      identidade: {valores: opt('valores', 5), t_formal: 'Mais informal', t_humor: 'Equilibrado', t_tecnico: 'Mais simples', t_calor: 'Mais caloroso', t_ousadia: 'Equilibrado', usa: 'cuidado\nclareza\nhora marcada', naoUsa: 'barato\npromoção imperdível'},
      depoimentos: [{nome: 'Paciente de Campinas', texto: 'Fui atendida na hora marcada e entendi tudo o que seria feito.', autorizado: 'Ainda preciso pedir'}],
      materiais: {marca: 'Verde #0f8b7d'}};
    const q = newProject('Studio Raiz Pilates (exemplo)', 'Exemplo da demonstração', {category: 'Pilates', goal: 'Aulas experimentais'});
    q.client = 'Studio Raiz Pilates';
    bfStore(q).answers = {contato: {nome: 'Rafa', whatsapp: ''}, empresa: {nome: 'Studio Raiz Pilates', cidade: 'Belo Horizonte', diferenciais: 'Turmas de até quatro pessoas'}, publico: {quem: 'Adultos com dor nas costas e quem quer ganhar mobilidade'}, produtos: [{nome: 'Aula em grupo', tipo: 'Serviço', oque: 'Turma pequena com instrutor o tempo todo'}]};
    state.projects.push(p, q); state.activeProjectId = p.id; persist();
    /* três referências de exemplo (desenhos de layout), para mostrar a gaveta de referências; as suas entram pela tela Referências */
    const wire = (title, kind) => new Promise(res => { const c = document.createElement('canvas'); c.width = 900; c.height = 1100; const x = c.getContext('2d'); x.fillStyle = '#f4f4f1'; x.fillRect(0, 0, 900, 1100); x.fillStyle = '#d9d9d3';
      const box = (a, b, w, h, t) => { x.fillStyle = '#d9d9d3'; x.fillRect(a, b, w, h); if (t) { x.fillStyle = '#555'; x.font = '600 22px sans-serif'; x.fillText(t, a + 16, b + 34); } };
      x.fillStyle = '#222'; x.font = '700 30px sans-serif'; x.fillText(title, 40, 56); box(40, 90, 820, 40, 'Menu');
      if (kind === 'a') { box(40, 150, 520, 300, 'Título grande + botão'); box(580, 150, 280, 300, 'Foto'); [0, 1, 2].forEach(i => box(40 + i * 280, 480, 260, 200, 'Benefício ' + (i + 1))); box(40, 710, 820, 160, 'Depoimento'); box(40, 900, 820, 120, 'Chamada final'); }
      else if (kind === 'b') { box(40, 150, 820, 360, 'Título centralizado sobre foto'); [0, 1, 2, 3].forEach(i => box(40 + i * 208, 540, 196, 150, 'Passo ' + (i + 1))); box(40, 720, 400, 280, 'Foto'); box(460, 720, 400, 280, 'Texto + botão'); }
      else { box(40, 150, 820, 90, 'Faixa de oferta'); box(40, 260, 400, 400, 'Foto grande'); box(460, 260, 400, 190, 'Texto'); box(460, 470, 400, 190, 'Lista de benefícios'); box(40, 690, 820, 120, 'Logos de clientes'); box(40, 840, 820, 200, 'Perguntas em duas colunas'); }
      c.toBlob(res, 'image/png'); });
    for (const [t, k] of [['Layout A: topo dividido', 'a'], ['Layout B: topo com foto de fundo', 'b'], ['Layout C: faixa de oferta', 'c']]) { try { await libAddBlob(await wire(t, k), {name: 'Exemplo · ' + t, tags: ['referencia', 'exemplo'], kind: 'referencia', prompt: 'Desenho de exemplo da demonstração. Suba os seus prints na tela Referências.'}); } catch (e) { /* segue sem as referências de exemplo */ } }
    await sbCreateSite('aurora');
    ES.sel = ''; go('home'); toast('Demonstração com dois clientes de exemplo. Abra o primeiro para ver o site pronto.');
  }, 400);
})();
