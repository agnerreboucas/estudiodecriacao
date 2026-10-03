/* Modelos · lote 4: pôsteres editoriais, packs, capas tech e tipografia manuscrita (só a estrutura dos pins; textos e marcas são de exemplo) */
const pairs = items => (items || []).map(s => String(s).split('|'));
LAYOUTS.push(
/* ---- Tipografia ---- */
{id: 'texto-print-circulado', name: 'Texto + print com destaque circulado', group: 'Tipografia', mode: 'light', tags: 'tutorial dica educativo carrossel print tela passo', fields: ['title', 'sub', 'kicker', 'handle'],
  sample: {title: 'Quando for postar, clique no **painel profissional**', sub: '', kicker: 'Seu Nome', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.r('avatar', {shape: 'ellipse', x: c.m, y: c.m - 10, w: 70, h: 70, pk: 'acc'});
    c.t('kicker', copy.kicker, {x: c.m + 90, y: c.m, w: 600, size: 28, fw: 700});
    c.t('muted', copy.handle, {x: c.m + 90, y: c.m + 36, w: 600, size: 22, pk: 'mut'});
    const t = c.t('title', copy.title, {fk: 'head', size: 82, lh: 1.14, fw: 800, em0: 'bg', y: c.m + 120}); c.fit(t, c.H * 0.3, 40);
    const y = t.y + c.h(t) + 40, h = Math.min(c.H * 0.42, c.H - y - c.m - 40);
    c.i('photo', {x: c.m, y, w: c.cw, h, radius: 18});
    c.r('ring', {shape: 'ellipse', x: c.m + c.cw * 0.12, y: y + h * 0.5, w: c.cw * 0.62, h: h * 0.22, pk: 'none', stroke: '#e11d2e', strokeW: 8});
    if (copy.sub) c.t('body', copy.sub, {y: y + h + 24, size: 34, pk: 'mut', lh: 1.3}); }},
{id: 'poema-lista', name: 'Frase manuscrita + lista + fechamento', group: 'Tipografia', mode: 'light', tags: 'manifesto texto poesia lista fechamento autoridade', fields: ['title', 'items', 'sub', 'handle'],
  sample: {title: 'Nunca foi sorte, sempre foi **design.**', items: 'Se alguém bateu o olho e entendeu rápido…\nSe alguém lembrou depois que viu…\nSe alguém leu e mandou uma mensagem…\nSe alguém confiou até sem conhecer…\nSe alguém se identificou…', sub: 'o design cumpriu seu dever.', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    const t = c.t('title', copy.title, {fk: 'script', size: 110, lh: 1.05, align: 'center', pk: 'acc', fw: 700, em0: 'color', y: c.m + 20}); c.fit(t, c.H * 0.2, 50);
    const it = c.t('body', (copy.items || []).join('\n'), {size: 32, lh: 1.7, align: 'center', pk: 'mut', y: t.y + c.h(t) + 50}); c.fit(it, c.H * 0.4, 20);
    const s = c.t('title', copy.sub, {fk: 'script', size: 84, lh: 1.05, align: 'center', pk: 'acc', fw: 700, y: it.y + c.h(it) + 50}); c.fit(s, c.H * 0.16, 36);
    c.t('brand', copy.handle, {y: c.H - c.m - 20, size: 22, pk: 'mut', align: 'center'}); }},
{id: 'ilustracao-central', name: 'Ilustração central com título e legenda', group: 'Tipografia', mode: 'light', tags: 'ilustração arte inspiração diária título imagem destaque', fields: ['title', 'sub', 'kicker'],
  sample: {title: 'Foto + **Ilustra**', sub: 'Inspiração Diária 69', kicker: ''},
  build(c) { const {copy} = c;
    const t = c.t('title', copy.title, {fk: 'black', size: 130, lh: 0.98, fw: 400, em0: 'color', fixUp: false, w: c.cw * 0.7, y: c.m}); c.fit(t, 330, 54);
    c.i('cutout', {x: c.m, y: c.m + c.h(t) + 10, w: c.cw, h: c.H - c.m * 2 - c.h(t) - 160});
    const s = c.t('body', copy.sub, {fk: 'script', size: 72, align: 'center', pk: 'fg', fw: 700, y: c.H - c.m - 90}); c.fit(s, 110, 30, 1);
    if (copy.kicker) c.t('muted', copy.kicker, {y: c.H - c.m - 20, size: 22, pk: 'mut', align: 'center'}); }},

/* ---- Foto + texto ---- */
{id: 'pack-sanduiche', name: 'Pack: título em cima e embaixo, objeto no meio', group: 'Foto + texto', mode: 'light', tags: 'pack prompts coleção produto objeto condensado título duplo', fields: ['title', 'label', 'sub', 'kicker'],
  sample: {kicker: 'SUPER PACK DE', title: 'PROMPTS', label: 'FILTROS PARA FOTOS', sub: '15 filtros que transformam suas fotos em obras.'},
  build(c) { const {copy} = c;
    c.t('muted', copy.kicker, {y: c.m - 20, size: 34, fw: 700, align: 'center', ls: 4, fixUp: true, fk: 'body'});
    const a = c.t('title', copy.title, {fk: 'cond', size: 330, lh: 0.88, align: 'center', fw: 400, fixUp: true, y: c.m + 30}); c.fit(a, 300, 80, 1);
    c.i('cutout', {x: 150, y: c.m + 30 + c.h(a) + 10, w: c.W - 300, h: c.H - 2 * c.m - c.h(a) - 520});
    const b = c.t('title', copy.label, {fk: 'cond', size: 250, lh: 0.88, align: 'center', fw: 400, fixUp: true}); c.fit(b, 420, 70, 2); b.y = c.H - c.m - 70 - c.h(b);
    c.t('body', copy.sub, {y: c.H - c.m - 40, size: 24, align: 'center', pk: 'mut'}); }},
{id: 'editorial-blocos-cor', name: 'Pôster editorial com blocos de cor', group: 'Foto + texto', mode: 'light', tags: 'editorial tendências retrato blocos quadrados design grid técnico', fields: ['title', 'sub', 'kicker', 'label', 'handle'],
  sample: {kicker: 'FILE · NEWS', title: 'GRAPHIC DESIGN TRENDS 2026', sub: 'Not what looks cool, but what actually lasts.', label: 'Save for later', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.r('block', {x: c.m, y: c.H * 0.2, w: 170, h: 170, pk: 'acc'}); c.r('block', {x: c.W - c.m - 120, y: c.H * 0.46, w: 120, h: 120, pk: 'sec'});
    c.i('cutout', {x: 400, y: c.H * 0.08, w: 620, h: c.H * 0.84});
    c.r('block', {x: c.W - c.m - 330, y: c.H * 0.14, w: 90, h: 90, pk: 'acc'}); c.r('block', {x: c.m + 170, y: c.H * 0.7, w: 70, h: 70, pk: 'fg'});
    c.t('muted', copy.kicker, {y: c.m - 50, size: 20, ls: 3, fixUp: true, pk: 'mut', w: 420});
    c.t('muted', copy.handle, {y: c.m - 50, size: 20, ls: 2, pk: 'mut', align: 'right'});
    const t = c.t('title', copy.title, {fk: 'head', size: 60, lh: 1.05, fw: 800, fixUp: true, w: 330, y: c.H * 0.72}); c.fit(t, 230, 26);
    c.t('muted', copy.sub, {y: t.y + c.h(t) + 14, size: 22, w: 320, pk: 'mut', lh: 1.35});
    c.t('muted', copy.label, {y: c.H - c.m + 10, size: 20, ls: 3, fixUp: true, pk: 'mut', align: 'right'}); }},
{id: 'retrato-titulo-vertical', name: 'Retrato com título vertical', group: 'Foto + texto', mode: 'light', tags: 'retrato editorial título vertical rotacionado condensado coluna', fields: ['title', 'sub', 'kicker'],
  sample: {title: 'VOZ DO DESIGN', sub: 'Texto de apoio curto em coluna estreita que acompanha a imagem e ajuda a contar a história.', kicker: 'EDIÇÃO 04'},
  build(c) { const {copy} = c;
    c.r('block', {x: 470, y: c.H * 0.3, w: 480, h: 330, pk: 'acc', opacity: 0.85});
    c.i('cutout', {x: 400, y: c.H * 0.08, w: 620, h: c.H * 0.84});
    const t = c.t('title', copy.title, {fk: 'cond', size: 260, lh: 0.9, fw: 400, fixUp: true, align: 'center', w: c.H * 0.84, x: 0, y: 0}); c.fit(t, 330, 70, 1);
    t.w = Math.round(c.H * 0.84); const h = c.h(t); t.x = Math.round(c.m + h / 2 - t.w / 2 - 10); t.y = Math.round(c.H / 2 - h / 2); t.rot = 90;
    c.t('muted', copy.kicker, {x: c.W - c.m - 300, y: c.m - 40, w: 300, size: 20, ls: 3, fixUp: true, pk: 'mut', align: 'right'});
    c.t('muted', copy.sub, {x: c.m + 160, y: c.H - c.m - 240, w: 230, size: 22, lh: 1.4, pk: 'fg'}); }},
{id: 'objeto-circulo-cor', name: 'Objeto recortado com círculo de cor', group: 'Foto + texto', mode: 'light', tags: 'objeto mão recorte círculo cor editorial grão título esquerda', fields: ['title', 'sub', 'kicker', 'handle'],
  sample: {title: 'Resplendent.', sub: 'Um parágrafo curto que apresenta a ideia da peça com calma e muito espaço em volta.', kicker: 'The Design Journal', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.r('circle', {shape: 'ellipse', x: c.W * 0.47, y: c.H * 0.46, w: 440, h: 440, pk: 'acc'});
    c.i('cutout', {x: c.W * 0.42, y: c.H * 0.16, w: c.W * 0.56, h: c.H * 0.8});
    c.t('muted', copy.kicker, {y: c.m - 50, size: 20, ls: 3, fixUp: true, pk: 'mut', w: 500});
    c.t('muted', copy.handle, {y: c.m - 50, size: 20, ls: 2, pk: 'mut', align: 'right'});
    const t = c.t('title', copy.title, {fk: 'head', size: 100, fw: 800, lh: 1, y: c.H * 0.42, w: c.cw * 0.62, fixUp: false}); c.fit(t, 220, 40, 2);
    c.t('muted', copy.sub, {y: t.y + c.h(t) + 20, size: 22, w: 340, lh: 1.45, pk: 'mut'}); }},
{id: 'palavra-base-cena', name: 'Palavra gigante na base sobre a cena', group: 'Foto + texto', mode: 'dark', tags: 'foto cena palavra gigante base condensado título impacto', fields: ['title', 'sub', 'kicker', 'handle'],
  sample: {kicker: 'SLOW DAY AT', title: 'WORK', sub: 'Um dia devagar também produz.', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H}); c.r('overlay', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: SH(0.0, 0.55, 180)});
    c.t('muted', copy.kicker, {y: c.m - 30, size: 26, ls: 5, fixUp: true, fw: 700, pk: 'fg'});
    const t = c.t('title', copy.title, {fk: 'cond', size: 520, lh: 0.8, fw: 400, fixUp: true, pk: 'acc', align: 'center', x: 40, w: c.W - 80}); c.fit(t, 520, 120, 1); t.y = c.H * 0.62 - c.h(t) * 0.1;
    c.t('body', copy.sub, {y: c.H - c.m - 30, size: 30, pk: 'fg', align: 'center'});
    c.t('brand', copy.handle, {y: c.H - c.m + 14, size: 20, pk: 'mut', align: 'center'}); }},
{id: 'editorial-claro-serif', name: 'Editorial claro: serifa + foto pequena', group: 'Foto + texto', mode: 'light', tags: 'editorial minimal serifa foto pequena arte autor', fields: ['title', 'sub', 'kicker', 'label', 'handle'],
  sample: {title: 'Petrichor,', sub: '(noun) o cheiro da terra depois da chuva.', kicker: '1984', label: 'words.', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    const k = c.t('muted', copy.kicker, {x: c.m - 40, y: c.H * 0.5, w: 400, size: 22, ls: 3, pk: 'mut', fixUp: true}); k.w = 400; const kh = c.h(k); k.x = Math.round(c.m - 40 + 20 - k.w / 2 + kh / 2); k.rot = -90;
    c.r('tag', {x: c.W - c.m - 130, y: c.m - 30, w: 130, h: 64, radius: 4, pk: 'none', stroke: '#141414', strokeW: 3, pks: 'fg'}); c.t('muted', copy.label, {x: c.W - c.m - 130, y: c.m - 12, w: 130, size: 26, align: 'center', pk: 'fg', fw: 700});
    const t = c.t('title', copy.title, {fk: 'serif', size: 120, lh: 1, fw: 400, fixUp: false, x: c.m + 40, w: c.cw - 40, y: c.H * 0.4}); c.fit(t, 200, 50, 1);
    c.t('muted', copy.sub, {x: c.m + 44, y: t.y + c.h(t) + 14, w: 380, size: 22, pk: 'mut', lh: 1.4});
    c.i('photo', {x: c.W * 0.46, y: c.H * 0.58, w: c.W * 0.46 - c.m + 40, h: c.H * 0.3, radius: 0});
    c.t('muted', copy.handle, {y: c.H - c.m + 8, size: 18, pk: 'mut', align: 'center', ls: 2}); }},
{id: 'retangulo-geometrico-foto', name: 'Retângulo de cor sobre o retrato', group: 'Foto + texto', mode: 'dark', tags: 'retrato geométrico retângulo cor texto espaçado editorial transparência', fields: ['title', 'sub', 'kicker'],
  sample: {title: 'TRANSPARÊNCIA', sub: 'Mostre como o trabalho é feito.', kicker: 'MANIFESTO'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H});
    c.r('block', {x: c.W * 0.34, y: c.H * 0.3, w: c.W * 0.66, h: c.H * 0.36, pk: 'acc', opacity: 0.88});
    const t = c.t('title', copy.title, {fk: 'body', size: 70, fw: 400, fixUp: true, ls: 28, lh: 1.2, pk: 'on', x: c.W * 0.34 + 40, w: c.W * 0.66 - 60, y: c.H * 0.3 + 60, em0: 'color'}); c.fit(t, c.H * 0.22, 26);
    c.t('muted', copy.kicker, {x: c.W * 0.34 + 40, y: c.H * 0.3 + 24, w: 400, size: 18, ls: 4, fixUp: true, pk: 'on'});
    c.t('body', copy.sub, {x: c.W * 0.34 + 40, y: c.H * 0.66 - 70, w: c.W * 0.66 - 80, size: 26, pk: 'on'}); }},
{id: 'titulo-condensado-script', name: 'Título condensado no topo + subtítulo manuscrito', group: 'Foto + texto', mode: 'dark', tags: 'foto título condensado topo manuscrito subtítulo dica alerta', fields: ['title', 'sub', 'handle'],
  sample: {title: 'TRAVOU? PARA DE **TRABALHAR NISSO**', sub: 'Abandone o computador por algumas horas.', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H}); c.r('overlay', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: SH(0.7, 0.35, 180)});
    const t = c.t('title', copy.title, {fk: 'cond', size: 170, lh: 0.95, align: 'center', fixUp: true, fw: 400, em0: 'color', y: c.m}); c.fit(t, c.H * 0.3, 60);
    c.t('body', copy.sub, {fk: 'script', size: 58, align: 'center', pk: 'fg', fw: 700, y: t.y + c.h(t) + 14});
    c.t('brand', copy.handle, {y: c.H - c.m, size: 22, pk: 'mut', align: 'center'}); }},

/* ---- Promoção e evento ---- */
{id: 'produto-suspenso', name: 'Produto suspenso com título nas pontas', group: 'Promoção e evento', mode: 'accent', tags: 'produto anúncio suspenso fio manuscrito campanha criativo', fields: ['title', 'label', 'sub', 'handle'],
  sample: {title: 'Seu próximo vício', label: 'pode começar por um olhar', sub: '', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    const t = c.t('title', copy.title, {fk: 'script', size: 110, lh: 1, align: 'center', pk: 'fg', fw: 700, y: c.m - 10}); c.fit(t, 200, 50, 2);
    c.r('thread', {x: c.W / 2 - 2, y: t.y + c.h(t) + 6, w: 4, h: c.H * 0.2, pk: 'fg', opacity: 0.8});
    c.i('cutout', {x: 160, y: t.y + c.h(t) + c.H * 0.18, w: c.W - 320, h: c.H * 0.46});
    const l = c.t('body', copy.label, {fk: 'script', size: 100, lh: 1, align: 'center', pk: 'fg', fw: 700}); c.fit(l, 220, 44, 2); l.y = c.H - c.m - 40 - c.h(l);
    c.t('brand', copy.handle, {y: c.H - c.m + 6, size: 22, pk: 'fg', align: 'center', fw: 700}); }},

/* ---- Capas de vídeo e tech ---- */
{id: 'capa-tech-preta', name: 'Capa tech: produto + título com marca-texto', group: 'Capas de vídeo', mode: 'dark', tags: 'tecnologia produto lançamento notícia ia capa preta marca-texto', fields: ['title', 'sub', 'kicker'],
  sample: {title: 'Seu relógio te **escuta**', sub: 'Novo recurso', kicker: ''},
  build(c) { const {copy} = c;
    c.i('photo', {x: c.m, y: c.m, w: c.cw, h: c.H * 0.52, radius: 36});
    const t = c.t('title', copy.title, {fk: 'head', size: 78, lh: 1.12, fw: 700, em0: 'bg', fixUp: false, w: c.cw - 120, y: c.H * 0.64}); c.fit(t, c.H * 0.2, 38);
    c.t('muted', copy.sub, {y: t.y + c.h(t) + 14, size: 34, pk: 'mut'});
    c.r('arrow', {shape: 'ellipse', x: c.W - c.m - 64, y: c.H - c.m - 64, w: 64, h: 64, pk: 'none', stroke: '#ffffff', strokeW: 3, pks: 'fg'});
    c.t('muted', '→', {x: c.W - c.m - 64, y: c.H - c.m - 52, w: 64, size: 34, align: 'center', pk: 'fg'}); }},

/* ---- Estrutura ---- */
{id: 'piramide-niveis', name: 'Pirâmide de níveis com itens', group: 'Estrutura', mode: 'light', tags: 'níveis iniciante intermediário avançado pirâmide ranking estrutura', fields: ['title', 'items', 'kicker'],
  sample: {kicker: 'E VOCÊ?', title: 'Como você usa a IA?', items: 'Avançado|automações e agentes\nIntermediário|prompts e modelos prontos\nIniciante|usa só para perguntas'},
  build(c) { const {copy} = c, it = pairs(copy.items).slice(0, 4), n = Math.max(1, it.length);
    c.t('muted', copy.kicker, {y: c.m - 30, size: 26, ls: 4, fixUp: true, pk: 'mut', w: 600});
    const t = c.t('title', copy.title, {fk: 'head', size: 96, lh: 1.02, fw: 800, fixUp: true, w: c.cw * 0.8, y: c.m + 20}); c.fit(t, 280, 44);
    const y0 = t.y + c.h(t) + 50, gap = 14, bh = Math.min(240, (c.H - y0 - c.m - gap * (n - 1)) / n);
    it.forEach((p, i) => { const w = c.cw * (0.5 + 0.5 * i / Math.max(1, n - 1)), x = (c.W - w) / 2, y = y0 + i * (bh + gap);
      c.r('level', {x, y, w, h: bh, radius: 26, pk: i === 0 ? 'acc' : i === n - 1 ? 'fg' : 'sec'});
      const a = c.t('body', p[0], {x: x + 30, w: w - 60, y: y + bh * 0.2, size: 44, fw: 800, pk: i === 0 ? 'on' : i === n - 1 ? 'rev' : 'on', align: 'center', fk: 'head'}); c.fit(a, bh * 0.36, 22, 1);
      if (p[1]) c.t('body', p[1], {x: x + 30, w: w - 60, y: y + bh * 0.2 + c.h(a) + 4, size: 26, pk: i === 0 ? 'on' : i === n - 1 ? 'rev' : 'on', align: 'center'}); }); }}
);
