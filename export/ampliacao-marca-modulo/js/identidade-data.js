/* Identidade da marca: os 12 arquétipos (modelo de "O Herói e o Fora da Lei"), valores e atitudes para escolher.
   Textos escritos para o Studio. As marcas citadas são exemplos comuns na literatura de arquétipos: a classificação é interpretação e varia entre autores. */
const ID_GROUPS = {independencia: 'Independência e realização', maestria: 'Maestria e risco', pertencimento: 'Pertencimento e prazer', estabilidade: 'Estabilidade e controle'};
const ID_ARCHS = {
  inocente: {n: 'Inocente', g: 'independencia', desejo: 'Ser feliz e viver com simplicidade e segurança', medo: 'Fazer algo errado e ser punido', dom: 'Fé, otimismo e pureza', sombra: 'Ingenuidade; negar problemas reais', tom: 'Simples, positivo, gentil, sem jargão', marcas: ['Dove', 'Coca-Cola', 'Innocent'], usa: ['simples', 'bom', 'puro', 'tranquilo', 'honesto', 'sem complicação'], evita: ['ironia pesada', 'ameaça', 'cinismo', 'urgência falsa']},
  explorador: {n: 'Explorador', g: 'independencia', desejo: 'Liberdade para descobrir quem é e o que há de novo', medo: 'Ficar preso, estagnado, ser comum', dom: 'Autonomia, ambição, coragem de ir', sombra: 'Fugir de compromisso; viver só de partida', tom: 'Convidativo, curioso, espontâneo, sem pressa', marcas: ['Jeep', 'The North Face', 'Land Rover', 'Patagonia'], usa: ['descobrir', 'caminho', 'liberdade', 'novo', 'explorar', 'ir além'], evita: ['rotina', 'padrão', 'conformar', 'sempre igual']},
  sabio: {n: 'Sábio', g: 'independencia', desejo: 'Entender o mundo e transmitir a verdade', medo: 'Ser enganado ou ignorante', dom: 'Sabedoria, análise, inteligência', sombra: 'Frieza, excesso de análise, arrogância intelectual', tom: 'Claro, calmo, baseado em fatos, didático', marcas: ['Google', 'BBC', 'TED', 'Harvard'], usa: ['entender', 'dados mostram', 'na prática', 'passo a passo', 'por que', 'método'], evita: ['achismo', 'promessa milagrosa', 'gíria forçada', 'exagero']},
  heroi: {n: 'Herói', g: 'maestria', desejo: 'Provar o próprio valor com ação corajosa', medo: 'Fraqueza, vulnerabilidade, falhar', dom: 'Competência, coragem, determinação', sombra: 'Arrogância; precisar sempre de um inimigo', tom: 'Direto, motivador, confiante, de desafio', marcas: ['Nike', 'FedEx', 'Duracell', 'BMW'], usa: ['conquistar', 'superar', 'meta', 'resultado', 'força', 'vá em frente'], evita: ['desistir', 'tanto faz', 'mais ou menos', 'vitimismo']},
  foradalei: {n: 'Fora da Lei', g: 'maestria', desejo: 'Rebelião, ruptura e libertação', medo: 'Ser impotente ou irrelevante', dom: 'Coragem de questionar e de virar o jogo', sombra: 'Destruir sem construir; agressividade gratuita', tom: 'Provocador, irreverente, sem filtro, anti-regra', marcas: ['Harley-Davidson', 'Diesel', 'Virgin', 'Jack Daniel\'s'], usa: ['quebrar', 'sem regra', 'rebelde', 'chega de', 'contra o óbvio', 'verdade nua'], evita: ['tradição por tradição', 'sempre foi assim', 'politicamente correto vazio', 'servilismo']},
  mago: {n: 'Mago', g: 'maestria', desejo: 'Transformar a realidade e fazer sonhos acontecerem', medo: 'Consequências negativas inesperadas', dom: 'Visão, encantamento, transformação', sombra: 'Manipulação; prometer mais do que entrega', tom: 'Inspirador, visionário, misterioso, simbólico', marcas: ['Disney', 'Apple', 'Tesla', 'Dyson'], usa: ['transformar', 'imagine', 'descubra o segredo', 'momento', 'mágica', 'revelar'], evita: ['rotina', 'tarefa', 'burocracia', 'prometer sem provar']},
  caracomum: {n: 'Cara Comum', g: 'pertencimento', desejo: 'Pertencer e ser aceito como é', medo: 'Ser excluído ou se destacar demais', dom: 'Realismo, empatia, falta de pretensão', sombra: 'Perder a identidade para se encaixar', tom: 'Próximo, honesto, informal, de conversa', marcas: ['IKEA', 'Budweiser', 'Havaianas', 'Magazine Luiza'], usa: ['a gente', 'de verdade', 'do jeito que é', 'junto', 'no dia a dia', 'sem frescura'], evita: ['elitismo', 'palavra difícil', 'pose', 'exclusividade']},
  amante: {n: 'Amante', g: 'pertencimento', desejo: 'Intimidade, paixão e experiências sensoriais', medo: 'Ficar sozinho ou não ser desejado', dom: 'Paixão, gratidão, apreciação', sombra: 'Dependência de aprovação; superficialidade', tom: 'Caloroso, sensorial, sedutor, elegante', marcas: ['Chanel', 'Victoria\'s Secret', 'Häagen-Dazs', 'Godiva'], usa: ['sentir', 'prazer', 'cuidar de você', 'desejo', 'especial', 'sensação'], evita: ['frieza técnica', 'agressividade', 'jargão', 'pressa']},
  bobo: {n: 'Bobo da Corte', g: 'pertencimento', desejo: 'Viver o presente com diversão e leveza', medo: 'Ser ignorado ou entediar', dom: 'Alegria, humor, espontaneidade', sombra: 'Frivolidade; fugir de temas sérios', tom: 'Brincalhão, bem-humorado, leve, surpreendente', marcas: ['M&M\'s', 'Old Spice', 'Ben & Jerry\'s', 'Skol'], usa: ['bora', 'divertido', 'sem drama', 'rir', 'brincar', 'curtir'], evita: ['solenidade', 'tom professoral', 'drama', 'culpa']},
  prestativo: {n: 'Prestativo', g: 'estabilidade', desejo: 'Proteger e cuidar das pessoas', medo: 'Egoísmo e ingratidão', dom: 'Compaixão, generosidade, acolhimento', sombra: 'Martírio; deixar o outro dependente', tom: 'Acolhedor, atencioso, tranquilizador, paciente', marcas: ['Johnson & Johnson', 'UNICEF', 'Volvo', 'Campbell\'s'], usa: ['cuidar', 'estamos com você', 'apoio', 'seguro', 'ajudar', 'proteção'], evita: ['pressão', 'culpa', 'frieza', 'ironia']},
  criador: {n: 'Criador', g: 'estabilidade', desejo: 'Criar algo de valor duradouro', medo: 'Mediocridade, execução sem visão', dom: 'Criatividade, imaginação, capricho', sombra: 'Perfeccionismo; nunca terminar', tom: 'Imaginativo, expressivo, original, cuidadoso', marcas: ['Lego', 'Adobe', 'Crayola', 'Pinterest'], usa: ['criar', 'construir', 'imaginar', 'do zero', 'feito com cuidado', 'autoral'], evita: ['padrão', 'genérico', 'copiar', 'atalho']},
  governante: {n: 'Governante', g: 'estabilidade', desejo: 'Controle, ordem e prosperidade', medo: 'Caos e perder o poder', dom: 'Liderança, responsabilidade, visão de conjunto', sombra: 'Autoritarismo; distância do cliente', tom: 'Seguro, sóbrio, autoritativo, refinado', marcas: ['Mercedes-Benz', 'Rolex', 'American Express', 'Microsoft'], usa: ['padrão', 'referência', 'liderança', 'garantia', 'excelência', 'confiança'], evita: ['gíria', 'improviso', 'bagunça', 'tom de brincadeira']}
};
/* chips: [id, rótulo, arquétipos (o primeiro vale 2 pontos, os demais 1)] */
const ID_VALUES = [
  ['seguranca', 'Segurança', ['inocente', 'governante']], ['simplicidade', 'Simplicidade', ['inocente', 'caracomum']], ['honestidade', 'Honestidade', ['inocente', 'sabio', 'caracomum']], ['otimismo', 'Otimismo', ['inocente', 'bobo']], ['confianca', 'Confiança', ['inocente', 'governante', 'prestativo']],
  ['liberdade', 'Liberdade', ['explorador', 'foradalei']], ['aventura', 'Aventura', ['explorador', 'heroi']], ['autenticidade', 'Autenticidade', ['explorador', 'caracomum']], ['descoberta', 'Descoberta', ['explorador', 'sabio']],
  ['conhecimento', 'Conhecimento', ['sabio']], ['verdade', 'Verdade', ['sabio', 'foradalei']], ['clareza', 'Clareza', ['sabio', 'governante']],
  ['coragem', 'Coragem', ['heroi', 'foradalei']], ['superacao', 'Superação', ['heroi']], ['disciplina', 'Disciplina', ['heroi', 'governante']], ['excelencia', 'Excelência', ['heroi', 'governante', 'criador']], ['resultado', 'Resultado', ['heroi']],
  ['ruptura', 'Ruptura', ['foradalei']], ['rebeldia', 'Rebeldia', ['foradalei']], ['inconformismo', 'Inconformismo', ['foradalei', 'criador']],
  ['transformacao', 'Transformação', ['mago']], ['visao', 'Visão', ['mago', 'criador']], ['encantamento', 'Encantamento', ['mago', 'amante']],
  ['pertencimento', 'Pertencimento', ['caracomum']], ['igualdade', 'Igualdade', ['caracomum']], ['humildade', 'Humildade', ['caracomum']], ['comunidade', 'Comunidade', ['caracomum', 'prestativo']],
  ['intimidade', 'Intimidade', ['amante']], ['paixao', 'Paixão', ['amante']], ['beleza', 'Beleza', ['amante', 'criador']],
  ['alegria', 'Alegria', ['bobo']], ['leveza', 'Leveza', ['bobo', 'inocente']], ['humor', 'Humor', ['bobo']],
  ['cuidado', 'Cuidado', ['prestativo']], ['generosidade', 'Generosidade', ['prestativo']], ['empatia', 'Empatia', ['prestativo', 'amante']], ['servir', 'Servir', ['prestativo']],
  ['inovacao', 'Inovação', ['criador', 'mago']], ['criatividade', 'Criatividade', ['criador']], ['expressao', 'Expressão', ['criador']],
  ['lideranca', 'Liderança', ['governante', 'heroi']], ['ordem', 'Ordem', ['governante']], ['prestigio', 'Prestígio', ['governante', 'amante']], ['responsabilidade', 'Responsabilidade', ['governante', 'prestativo']]
];
const ID_ATTS = [
  ['direto', 'Fala sem rodeio', ['heroi', 'foradalei']], ['desafia', 'Desafia o que todo mundo aceita', ['foradalei']], ['acolhe', 'Protege e acolhe quem chega', ['prestativo']], ['explica', 'Explica com calma e com dados', ['sabio']],
  ['convida', 'Convida a experimentar o novo', ['explorador']], ['comum', 'Fala como gente comum', ['caracomum']], ['graca', 'Faz graça e não se leva tão a sério', ['bobo']], ['capricho', 'Cria algo do zero com capricho', ['criador']],
  ['comando', 'Assume o comando e dá direção', ['governante']], ['surpreende', 'Encanta e surpreende', ['mago']], ['carinho', 'Fala com carinho e proximidade', ['amante']], ['positivo', 'Mantém tudo simples e positivo', ['inocente']],
  ['enfrenta', 'Enfrenta o problema de frente', ['heroi']], ['quebra', 'Quebra regras que não fazem sentido', ['foradalei']], ['autoridade', 'Mostra o caminho com autoridade', ['governante', 'sabio']], ['detalhes', 'Cuida dos detalhes', ['criador', 'amante']],
  ['celebra', 'Celebra conquistas', ['heroi', 'bobo']], ['admite', 'Admite o que não sabe', ['caracomum', 'sabio']], ['escuta', 'Escuta antes de falar', ['prestativo', 'caracomum']], ['provoca', 'Provoca e incomoda para despertar', ['foradalei', 'mago']],
  ['inspira', 'Inspira a ir além do limite', ['heroi', 'explorador']], ['muda', 'Transforma a vida da pessoa', ['mago', 'heroi']], ['bastidores', 'Mostra bastidores sem filtro', ['caracomum', 'foradalei']], ['tradicao', 'Valoriza tradição e confiança', ['governante', 'inocente']],
  ['curioso', 'Mostra o mundo com curiosidade', ['explorador', 'sabio']], ['generoso', 'Dá conteúdo generoso e gratuito', ['prestativo']], ['acido', 'Usa humor ácido', ['bobo', 'foradalei']], ['facil', 'Faz o difícil parecer fácil', ['sabio', 'criador']],
  ['sonhos', 'Fala de sonhos e de futuro', ['mago', 'inocente']], ['cobra', 'Cobra resultado e disciplina', ['heroi', 'governante']]
];
const ID_SLIDER_INFO = {formal: ['Formal', 'Informal'], humor: ['Sério', 'Bem-humorado'], tecnico: ['Técnico', 'Simples'], calor: ['Reservado', 'Caloroso'], ousadia: ['Contido', 'Ousado']};
const ID_LIST_INFO = {
  fala: ['O que a marca fala', 'Assuntos e jeitos de falar que combinam com ela.'], naoFala: ['O que a marca NÃO fala', 'Assuntos e jeitos que ela evita.'],
  atitudeTem: ['Atitudes que a marca tem', 'Como ela se comporta.'], atitudeNao: ['Atitudes que a marca NÃO tem', 'O que ela nunca faria.'],
  admira: ['O que a marca admira', 'Pessoas, comportamentos e ideias que ela valoriza.'], repudia: ['O que a marca repudia', 'O que ela rejeita.'],
  usa: ['Palavras que a marca USA', 'Vocabulário próprio.'], naoUsa: ['Palavras que a marca NÃO usa', 'Vão para a lista de proibidas nas criações.']
};
const ID_SUG = {
  admira: ['Quem faz o que promete', 'Gente que persiste', 'Clareza', 'Quem escuta de verdade', 'Criatividade', 'Coragem de ser diferente', 'Cuidado com os detalhes', 'Resultado real'],
  repudia: ['Falsidade', 'Promessa milagrosa', 'Arrogância', 'Descaso com o cliente', 'Copiar os outros', 'Pressão e urgência falsa', 'Linguagem difícil de propósito', 'Desrespeito'],
  fala: ['O dia a dia do cliente', 'Bastidores do trabalho', 'Casos reais', 'Dicas práticas', 'Erros comuns', 'Mitos e verdades', 'Opinião sobre o mercado'],
  naoFala: ['Política partidária', 'Fofoca de concorrente', 'Resultado garantido', 'Preço sem contexto', 'Piada com o cliente']
};

/* pontuação: valores e atitudes escolhidos → afinidade com cada arquétipo */
function idScore(id) {
  const s = {}; Object.keys(ID_ARCHS).forEach(k => { s[k] = 0; });
  const add = (list, sel) => (sel || []).forEach(i => { const c = list.find(x => x[0] === i); if (c) c[2].forEach((a, n) => { s[a] += n === 0 ? 2 : 1; }); });
  add(ID_VALUES, id.values); add(ID_ATTS, id.attitudes);
  const arr = Object.keys(ID_ARCHS).map(k => ({id: k, score: s[k]})).sort((a, b) => b.score - a.score || Object.keys(ID_ARCHS).indexOf(a.id) - Object.keys(ID_ARCHS).indexOf(b.id)), top = arr[0].score || 1;
  return arr.map(x => ({id: x.id, score: x.score, pct: Math.round(x.score / top * 100)}));
}
const idMain = id => id.arch || (idScore(id)[0].score ? idScore(id)[0].id : '');
/* resumo do tom a partir dos controles */
function idToneText(id) {
  const S = id.sliders, w = (k, lo, hi) => S[k] <= 2 ? lo : S[k] >= 4 ? hi : '';
  return [w('formal', 'formal', 'informal'), w('humor', 'sério', 'bem-humorado'), w('tecnico', 'técnico', 'simples e direto'), w('calor', 'reservado', 'caloroso'), w('ousadia', 'contido', 'ousado')].filter(Boolean).join(', ');
}
/* texto para a IA: só o que foi preenchido */
function identityTxt(p) {
  const id = p && p.identity; if (!id) return '';
  const a = ID_ARCHS[idMain(id)], a2 = ID_ARCHS[id.arch2], L = id.lists, vals = id.values.map(v => (ID_VALUES.find(x => x[0] === v) || [0, v])[1]).concat(id.valuesExtra), ats = id.attitudes.map(v => (ID_ATTS.find(x => x[0] === v) || [0, v])[1]).concat(id.attitudesExtra);
  const lines = [a ? `Arquétipo da marca: ${a.n}${a2 ? ' (secundário: ' + a2.n + ')' : ''}. Desejo central: ${a.desejo}. Tom típico: ${a.tom}.` : '', vals.length ? 'Valores: ' + vals.join(', ') : '', ats.length ? 'Atitudes: ' + ats.join('; ') : '', idToneText(id) ? 'Tom de voz: ' + idToneText(id) : '',
    L.fala.length ? 'A marca fala de: ' + L.fala.join('; ') : '', L.naoFala.length ? 'A marca NÃO fala de: ' + L.naoFala.join('; ') : '', L.atitudeTem.length ? 'Atitudes que tem: ' + L.atitudeTem.join('; ') : '', L.atitudeNao.length ? 'Atitudes que NÃO tem: ' + L.atitudeNao.join('; ') : '',
    L.admira.length ? 'Admira: ' + L.admira.join('; ') : '', L.repudia.length ? 'Repudia: ' + L.repudia.join('; ') : '', L.usa.length ? 'PALAVRAS QUE USA: ' + L.usa.join(', ') : '', L.naoUsa.length ? 'PALAVRAS PROIBIDAS (nunca usar): ' + L.naoUsa.join(', ') : ''].filter(Boolean);
  return lines.length ? 'IDENTIDADE DA MARCA (definida pelo cliente)\n' + lines.join('\n') : '';
}
