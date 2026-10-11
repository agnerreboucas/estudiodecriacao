/* ===== Sites de aula =====
   Um site de aula é um HTML só (CSS e JS dentro), feito para ser aberto numa sala, num celular ou numa projeção. Três jeitos de navegar:
   • horizontal: faixas de tela cheia que deslizam para o lado (menu no topo, setas, barra de progresso, teclado e deslizar o dedo);
   • vertical: seções empilhadas com rolagem encaixada e pontos de navegação ao lado;
   • mapa: uma jornada com estações; ao tocar numa estação a câmera "entra" nela e abre os passos da aula (estilo apresentação com zoom).
   Cada faixa (ou passo) usa um modelo de bloco: capa, texto, números e módulos, galeria, carrossel, antes e depois, cartões, passos, perguntas, vídeo, formulário…
   Dados em p.aulas: {id, name, mode, skin, theme, brand, logo, nav, slides:[{id, label, layout, …campos, steps:[…]}]}.
   Regra do estúdio: nada de fato inventado; o que falta fica como [CONFIRMAR: …]. */
const AU_SKINS = {
  editorial: {label: 'Editorial claro', v: {bg: '#ffffff', paper: '#F7F3EE', cream: '#EDE7DF', ink: '#1A1714', ink2: '#3A3530', ash: '#8C847A', accent: '#C4581F', on: '#ffffff', line: 'rgba(26,23,20,.12)', head: 'Cormorant Garamond', body: 'DM Sans', mono: 'DM Mono', rad: 2, hw: 400}},
  vivo: {label: 'Vivo (colorido)', v: {bg: '#1565d8', paper: 'rgba(7,52,114,.55)', cream: 'rgba(255,255,255,.14)', ink: '#ffffff', ink2: '#eaf3ff', ash: '#c4dcff', accent: '#ffd21f', on: '#10305f', line: 'rgba(255,255,255,.3)', head: 'Fredoka', body: 'Nunito', mono: 'Nunito', rad: 22, hw: 600}},
  escuro: {label: 'Escuro', v: {bg: '#121212', paper: '#1c1b19', cream: '#262522', ink: '#f3efe9', ink2: '#d8d2c9', ash: '#9a938a', accent: '#E0713A', on: '#141414', line: 'rgba(255,255,255,.14)', head: 'Cormorant Garamond', body: 'DM Sans', mono: 'DM Mono', rad: 2, hw: 400}}
};
const AU_MODES = {horizontal: 'Horizontal (faixas que deslizam)', vertical: 'Vertical (rolagem encaixada)', mapa: 'Mapa com estações (zoom)'};
const AU_ICONS = {
  livro: '<path d="M4 5.5C4 5 4.4 4.6 5 4.6c2.6 0 5 .5 7 2v13.5c-2-1.5-4.4-2-7-2-.6 0-1-.4-1-1zM20 5.5c0-.5-.4-.9-1-.9-2.6 0-5 .5-7 2v13.5c2-1.5 4.4-2 7-2 .6 0 1-.4 1-1z"/>',
  camera: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.6"/>',
  estrela: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.2 1.2 6L12 16.5 6.7 19.5l1.2-6L3.4 9.3l6-.7z"/>',
  coracao: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>',
  pessoas: '<circle cx="9" cy="8.5" r="3"/><circle cx="17" cy="9.5" r="2.4"/><path d="M3.5 19c.4-3.6 2.7-5.5 5.5-5.5s5.1 1.900 5.500 5.500zM15 14.300c.6-.3 1.300-.4 2-.4 2.300 0 3.800 1.500 4.200 4.600H16.500"/>',
  lampada: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.500 10.900c.6.5 1 1.200 1 2V16h5v-.1c0-.8.4-1.500 1-2A6 6 0 0 0 12 3z"/>',
  alvo: '<circle cx="12" cy="12" r="8.500"/><circle cx="12" cy="12" r="4.500"/><circle cx="12" cy="12" r="1"/>',
  lapis: '<path d="M4 20l1-4L16.500 4.500a2.100 2.100 0 0 1 3 3L8 19z"/><path d="M14.500 6.500l3 3"/>',
  musica: '<path d="M9 18V6l10-2v12"/><circle cx="6.500" cy="18" r="2.500"/><circle cx="16.500" cy="16" r="2.500"/>',
  mapa: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/>',
  chave: '<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M15 12v2"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2.500v3M12 18.500v3M2.500 12h3M18.500 12h3M5.300 5.300l2.100 2.100M16.600 16.600l2.100 2.100M5.300 18.700l2.100-2.100M16.600 7.400l2.100-2.100"/>'
};
const auSvg = (k, st) => `<svg viewBox="0 0 24 24" fill="${st === 'solid' ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${AU_ICONS[k] || AU_ICONS.estrela}</svg>`;

/* modelos de bloco: campos que o editor mostra. kind: line | area | img | dest | sel:a,b | rows:chave|Rótulo|tipo;… (tipo: line, area, img, tags) */
const AU_L = {
  capa: {label: 'Capa', f: [['kicker', 'Etiqueta (linha pequena)', 'line'], ['title', 'Título (use *palavra* para destacar)', 'area'], ['quote', 'Frase de apoio', 'area'], ['image', 'Imagem principal', 'img'], ['btn1', 'Botão 1: texto', 'line'], ['to1', 'Botão 1 leva a', 'dest'], ['btn2', 'Botão 2: texto', 'line'], ['to2', 'Botão 2 leva a', 'dest'], ['stats', 'Números em destaque', 'rows:n|Número|line;l|Legenda|line']]},
  texto: {label: 'Texto (com imagem e ficha)', f: [['kicker', 'Etiqueta', 'line'], ['title', 'Título', 'area'], ['text', 'Texto (um parágrafo por linha em branco)', 'area'], ['image', 'Imagem (opcional)', 'img'], ['side', 'Imagem fica à', 'sel:left|esquerda,right|direita'], ['facts', 'Ficha (formato, duração, local…)', 'rows:l|Rótulo|line;v|Valor|line'], ['btn1', 'Botão: texto', 'line'], ['to1', 'Botão leva a', 'dest']]},
  modulos: {label: 'Números e módulos', f: [['kicker', 'Etiqueta', 'line'], ['title', 'Título', 'area'], ['text', 'Texto', 'area'], ['stats', 'Números', 'rows:n|Número|line;l|Legenda|line'], ['listTitle', 'Título da lista', 'line'], ['items', 'Módulos / etapas', 'rows:h|Título|line;t|Descrição|area;tags|Tópicos (separe por vírgula)|tags']]},
  galeria: {label: 'Galeria (mosaico)', f: [['kicker', 'Etiqueta', 'line'], ['title', 'Título', 'area'], ['text', 'Texto', 'area'], ['images', 'Imagens', 'rows:img|Imagem|img;cap|Legenda|line']]},
  carrossel: {label: 'Carrossel', f: [['kicker', 'Etiqueta', 'line'], ['title', 'Título', 'area'], ['text', 'Texto', 'area'], ['images', 'Slides', 'rows:img|Imagem|img;h|Título|line;cap|Legenda|area']]},
  antes: {label: 'Antes e depois', f: [['kicker', 'Etiqueta', 'line'], ['title', 'Título', 'area'], ['text', 'Texto', 'area'], ['pairs', 'Comparações', 'rows:before|Antes|img;after|Depois|img;cap|Legenda|line']]},
  cards: {label: 'Cartões (equipe, casos, módulos)', f: [['kicker', 'Etiqueta', 'line'], ['title', 'Título', 'area'], ['text', 'Texto', 'area'], ['items', 'Cartões', 'rows:img|Foto|img;tag|Etiqueta|line;h|Título|line;t|Texto|area']]},
  passos: {label: 'Passos numerados', f: [['kicker', 'Etiqueta', 'line'], ['title', 'Título', 'area'], ['items', 'Passos', 'rows:h|Título|line;t|Descrição|area']]},
  faq: {label: 'Perguntas e respostas (sanfona)', f: [['kicker', 'Etiqueta', 'line'], ['title', 'Título', 'area'], ['items', 'Perguntas', 'rows:h|Pergunta|line;t|Resposta|area']]},
  pergunta: {label: 'Pergunta para a turma (revela a resposta)', f: [['kicker', 'Etiqueta', 'line'], ['title', 'Título', 'area'], ['items', 'Perguntas', 'rows:h|Pergunta|line;t|Resposta (aparece ao tocar)|area']]},
  citacao: {label: 'Citação', f: [['quote', 'Citação', 'area'], ['by', 'Quem disse', 'line'], ['ref', 'Fonte', 'line']]},
  video: {label: 'Vídeo (YouTube ou Vimeo)', f: [['kicker', 'Etiqueta', 'line'], ['title', 'Título', 'area'], ['url', 'Endereço do vídeo', 'line'], ['text', 'Legenda', 'area']]},
  passo: {label: 'Passo da aula (história, texto, versículo…)', f: [['kicker', 'Etapa (ex.: Pra começar)', 'line'], ['title', 'Título', 'area'], ['text', 'Texto (parágrafos separados por linha em branco)', 'area'], ['quote', 'Destaque / citação', 'area'], ['ref', 'Fonte da citação', 'line'], ['image', 'Imagem (opcional)', 'img'], ['items', 'Perguntas que revelam a resposta', 'rows:h|Pergunta|line;t|Resposta|area'], ['goal', 'Quadro de objetivo (opcional)', 'line']]},
  formulario: {label: 'Formulário e contato', f: [['kicker', 'Etiqueta', 'line'], ['title', 'Título', 'area'], ['text', 'Texto', 'area'], ['contacts', 'Contatos', 'rows:l|Rótulo|line;v|Valor|line'], ['button', 'Texto do botão', 'line'], ['ok', 'Mensagem de sucesso', 'line']]},
  cta: {label: 'Chamada final', f: [['title', 'Título', 'area'], ['text', 'Texto', 'area'], ['btn1', 'Botão: texto', 'line'], ['to1', 'Botão leva a', 'dest']]}
};
const AU_ESTACAO = [['title', 'Nome da estação', 'line'], ['phrase', 'Frase curta (aparece no mapa)', 'line'], ['ref', 'Referência (ex.: texto base)', 'line'], ['date', 'Data do encontro', 'date'], ['color', 'Cor', 'color'], ['icon', 'Ícone', 'icon'], ['root', 'É a base (fica embaixo do mapa)', 'bool']];
const auId = () => 'au' + Math.random().toString(36).slice(2, 8);
const auS = (v, n) => String(v == null ? '' : v).replace(/\u0000/g, '').slice(0, n || 400);
const auDest = v => { v = String(v || ''); return /^(slide:[\w-]{1,20}|url:https?:\/\/[^\s"'<>]{1,300}|tel:[\d+ ()-]{5,20}|mailto:[^\s"'<>]{3,120}|wa:\d{8,15})$/.test(v) ? v : ''; };
const auImgId = v => /^[\w-]{1,60}$/.test(String(v || '')) ? String(v) : '';
const auUrl = v => /^https?:\/\/[^\s"'<>]{1,400}$/.test(String(v || '')) ? String(v) : '';
const auColor = (v, d) => /^#[0-9a-f]{6}$/i.test(String(v || '')) ? String(v) : d;

function auBlock(b) {
  b = b && typeof b === 'object' ? b : {}; const L = AU_L[b.layout] ? b.layout : 'texto', def = AU_L[L], o = {id: /^[\w-]{1,20}$/.test(b.id || '') ? b.id : auId(), layout: L, label: auS(b.label, 40)};
  def.f.forEach(([k, , kind]) => {
    if (kind === 'img') { o[k] = auImgId(b[k]); o[k + 'Url'] = auUrl(b[k + 'Url']); }
    else if (kind === 'dest') o[k] = auDest(b[k]);
    else if (kind.startsWith('sel:')) { const ok = kind.slice(4).split(',').map(x => x.split('|')[0]); o[k] = ok.includes(b[k]) ? b[k] : ok[0]; }
    else if (kind.startsWith('rows:')) {
      const spec = kind.slice(5).split(';').map(x => x.split('|')); o[k] = (Array.isArray(b[k]) ? b[k] : []).slice(0, 40).map(r => { r = r && typeof r === 'object' ? r : {}; const x = {}; spec.forEach(([kk, , tt]) => { if (tt === 'img') { x[kk] = auImgId(r[kk]); x[kk + 'Url'] = auUrl(r[kk + 'Url']); } else x[kk] = auS(r[kk], tt === 'area' ? 1500 : 160); }); return x; });
    } else o[k] = auS(b[k], kind === 'area' ? 4000 : 400);
  }); return o;
}
function auSlide(s, mode) {
  s = s && typeof s === 'object' ? s : {};
  if (mode === 'mapa') {
    return {id: /^[\w-]{1,20}$/.test(s.id || '') ? s.id : auId(), layout: 'estacao', label: auS(s.label || s.title, 40), title: auS(s.title, 80), phrase: auS(s.phrase, 160), ref: auS(s.ref, 120), date: /^\d{4}-\d{2}-\d{2}$/.test(s.date || '') ? s.date : '', color: auColor(s.color, '#0B57D0'), icon: AU_ICONS[s.icon] ? s.icon : 'estrela', root: !!s.root,
      steps: (Array.isArray(s.steps) ? s.steps : []).slice(0, 20).map(x => auBlock(Object.assign({layout: 'passo'}, x)))};
  }
  const b = auBlock(s); return b;
}
function normalizeAulas(list) {
  return (Array.isArray(list) ? list : []).slice(0, 30).map(a => {
    a = a && typeof a === 'object' ? a : {}; const mode = AU_MODES[a.mode] ? a.mode : 'horizontal', skin = AU_SKINS[a.skin] ? a.skin : 'editorial', t = a.theme && typeof a.theme === 'object' ? a.theme : {}, n = a.nav && typeof a.nav === 'object' ? a.nav : {};
    return {id: /^[\w-]{1,20}$/.test(a.id || '') ? a.id : auId(), name: auS(a.name, 120) || 'Nova aula', mode, skin, brand: auS(a.brand, 60), logo: auImgId(a.logo), desc: auS(a.desc, 300), previewT: /^[a-f0-9]{16}$/.test(a.previewT || '') ? a.previewT : '',
      theme: {accent: /^#[0-9a-f]{6}$/i.test(t.accent || '') ? t.accent : '', bg: /^#[0-9a-f]{6}$/i.test(t.bg || '') ? t.bg : '', ink: /^#[0-9a-f]{6}$/i.test(t.ink || '') ? t.ink : '', head: /^[\w \-]{0,40}$/.test(t.head || '') ? auS(t.head, 40) : '', body: /^[\w \-]{0,40}$/.test(t.body || '') ? auS(t.body, 40) : ''},
      nav: {top: n.top !== false, arrows: n.arrows !== false, progress: n.progress !== false, cta: auS(n.cta, 30), ctaTo: auDest(n.ctaTo)},
      slides: (Array.isArray(a.slides) ? a.slides : []).slice(0, 60).map(s => auSlide(s, mode)), created: auS(a.created, 40) || new Date().toISOString()};
  });
}
/* conteúdo novo: o que falta fica como [CONFIRMAR] (o estúdio não inventa fato) */
const auPH = t => '[CONFIRMAR: ' + t + ']';
function auNewBlock(layout) {
  const R = (n, f) => Array.from({length: n}, (_, i) => f(i + 1));
  const d = {
    capa: {kicker: auPH('local · gratuito ou valor'), title: auPH('promessa da aula em uma frase'), quote: auPH('frase de apoio'), btn1: 'Quero participar', btn2: 'Saiba mais', stats: R(3, i => ({n: auPH('nº'), l: 'dado ' + i}))},
    texto: {kicker: 'Sobre', title: auPH('título da seção'), text: auPH('explique em dois parágrafos curtos'), facts: [{l: 'Formato', v: auPH('presencial/online')}, {l: 'Duração', v: auPH('carga horária')}, {l: 'Local', v: auPH('endereço')}]},
    modulos: {kicker: 'O curso', title: auPH('o que a pessoa vai aprender'), text: '', stats: R(4, i => ({n: auPH('nº'), l: 'dado ' + i})), listTitle: 'O que você vai aprender', items: R(3, i => ({h: 'Módulo ' + i + ': ' + auPH('nome'), t: '', tags: auPH('tópico 1') + ', ' + auPH('tópico 2')}))},
    galeria: {kicker: 'Galeria', title: auPH('título'), images: R(5, () => ({cap: ''}))},
    carrossel: {kicker: 'Exemplos', title: auPH('título'), images: R(4, i => ({h: 'Exemplo ' + i, cap: auPH('legenda')}))},
    antes: {kicker: 'Antes e depois', title: auPH('o que mudou'), pairs: R(1, () => ({cap: auPH('legenda')}))},
    cards: {kicker: 'Equipe', title: auPH('título'), items: R(3, i => ({tag: auPH('função'), h: auPH('nome ' + i), t: auPH('mini bio real')}))},
    passos: {kicker: 'Como funciona', title: auPH('o plano em passos'), items: R(3, i => ({h: 'Passo ' + i, t: auPH('descrição')}))},
    faq: {kicker: 'Dúvidas', title: 'Perguntas frequentes', items: R(3, () => ({h: auPH('pergunta'), t: auPH('resposta')}))},
    pergunta: {kicker: 'Vamos conversar', title: auPH('pergunta para a turma'), items: R(2, () => ({h: auPH('pergunta'), t: auPH('resposta')}))},
    citacao: {quote: auPH('citação'), by: auPH('quem disse')},
    video: {kicker: 'Assista', title: auPH('título do vídeo'), url: '', text: ''},
    passo: {kicker: 'Pra começar', title: auPH('pergunta ou ideia do passo'), text: auPH('texto do passo')},
    formulario: {kicker: 'Inscrições', title: 'Fale com a gente', text: '', contacts: [{l: 'WhatsApp', v: auPH('número')}, {l: 'E-mail', v: auPH('e-mail')}], button: 'Enviar', ok: 'Recebemos! Entraremos em contato.'},
    cta: {title: auPH('chamada final'), text: '', btn1: 'Quero participar'}
  }[layout] || {};
  return auBlock(Object.assign({layout, label: AU_L[layout] ? AU_L[layout].label.split(' (')[0] : ''}, d));
}
function auStarter(kind) {
  const B = (l, o) => Object.assign(auNewBlock(l), o || {});
  if (kind === 'mapa') {
    const cores = ['#0B57D0', '#CD0002', '#2E9B2A', '#C99100'], ics = ['livro', 'coracao', 'pessoas', 'estrela'];
    return normalizeAulas([{name: 'Jornada em mapa', mode: 'mapa', skin: 'vivo', brand: 'Minha aula', nav: {top: true, arrows: true, progress: true},
      slides: cores.map((c, i) => ({title: 'Encontro ' + (i + 1), phrase: auPH('ideia central'), ref: auPH('texto base'), color: c, icon: ics[i], steps: [auNewBlock('passo'), Object.assign(auNewBlock('passo'), {kicker: 'O que vamos ver', title: auPH('conteúdo')}), Object.assign(auNewBlock('passo'), {kicker: 'Pra levar pra casa', title: auPH('tarefa')})]}))
        .concat([{title: 'A base de tudo', phrase: auPH('o que sustenta a jornada'), color: '#0B57D0', icon: 'mapa', root: true, steps: [auNewBlock('passo')]}])}])[0];
  }
  if (kind === 'vertical') {
    return normalizeAulas([{name: 'Aula vertical', mode: 'vertical', skin: 'escuro', brand: 'Minha aula', slides: [B('capa'), B('texto'), B('passos'), B('carrossel'), B('antes'), B('faq'), B('formulario')]}])[0];
  }
  return normalizeAulas([{name: 'Curso em faixas', mode: 'horizontal', skin: 'editorial', brand: 'Meu curso', nav: {cta: 'Inscreva-se'}, slides: [B('capa'), B('texto'), B('modulos'), B('galeria'), B('cards'), B('antes'), B('formulario')]}])[0];
}
