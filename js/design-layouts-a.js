/* Modelos · Tipografia */
LAYOUTS.push(
{id: 'cartaz-tipografico', name: 'Cartaz tipográfico', group: 'Tipografia', mode: 'light', tags: 'serviço autoridade frase impacto condensado', fields: ['title', 'sub', 'handle'],
  sample: {title: 'Seu sonho precisa ser **VISTO.**', sub: 'Leve seu negócio a sério. Mostre o que você faz todos os dias.', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    const t = c.t('title', copy.title, {fk: 'cond', fixUp: true, size: 190, lh: 0.94, em0: 'scale', emScale: 1.2, fw: 400}); c.fit(t, c.H * 0.5, 60);
    const s = c.t('body', copy.sub, {fk: 'cond', fixUp: true, size: 46, lh: 1.12, w: c.cw * 0.86}); c.fit(s, 220, 24);
    c.stack([t, s], c.H * 0.1, c.H - c.m - 80, 'middle', 36);
    c.t('brand', copy.handle, {size: 24, pk: 'mut', y: c.H - c.m - 26, ls: 1}); }},
{id: 'carrossel-texto', name: 'Carrossel de texto', group: 'Tipografia', mode: 'light', tags: 'educativo carrossel texto marca-texto autoridade', fields: ['title', 'sub', 'handle', 'kicker'],
  sample: {title: 'Aprenda a ler as **métricas** dos seus anúncios', sub: '', kicker: 'Seu Nome', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.r('avatar', {shape: 'ellipse', x: c.m, y: c.m - 10, w: 84, h: 84, pk: 'acc'});
    c.t('kicker', copy.kicker, {x: c.m + 104, y: c.m + 6, w: 600, size: 30, fk: 'body', fw: 700, pk: 'fg'});
    c.t('muted', copy.handle, {x: c.m + 104, y: c.m + 44, w: 600, size: 24, pk: 'mut'});
    const t = c.t('title', copy.title, {fk: 'head', size: 96, lh: 1.14, em0: 'bg', fw: 800, fixUp: false}); c.fit(t, c.H * 0.55, 44);
    const items = [t]; if (copy.sub) items.push(c.t('body', copy.sub, {size: 42, pk: 'mut', lh: 1.35}));
    c.stack(items, c.m + 120, c.H - c.m, 'middle', 36); }},
{id: 'numero-gigante', name: 'Número gigante + título', group: 'Tipografia', mode: 'light', tags: 'lista dicas numero carrossel educativo', fields: ['num', 'title', 'sub', 'kicker', 'button'],
  sample: {num: '13', title: 'DICAS PARA VENDER MAIS', sub: 'Todo empreendedor deveria conhecer', kicker: '01 / 15', button: 'Arraste →'},
  build(c) { const {copy} = c, d = String(copy.num).split(''), first = d[0] || '1', rest = d.slice(1).join('');
    c.t('muted', copy.kicker, {y: c.m - 30, w: 400, size: 28, pk: 'mut', ls: 2});
    const a = c.t('display', first, {fk: 'head', fw: 900, size: 700, lh: 0.8, w: 1200, x: c.m - 30, y: c.m + 10, pk: 'acc', fixUp: false});
    const aw = layoutText(Object.assign({}, a, {w: 4000})).lines[0].w;
    if (rest) { c.t('display', rest, {fk: 'head', fw: 900, size: 700, lh: 0.8, w: 1200, x: c.m - 30 + aw * 0.86, y: c.m + 10, pk: 'sec', fixUp: false}); }
    const t = c.t('title', copy.title, {fk: 'head', fw: 900, size: 104, lh: 1.02, y: c.H * 0.46, fixUp: true, em0: 'color'}); c.fit(t, c.H * 0.25, 40);
    const s = c.t('body', copy.sub, {size: 46, y: t.y + c.h(t) + 20, fixUp: false, fk: 'body', fw: 700});
    c.t('brand', copy.button, {x: c.m, y: c.H - c.m - 30, w: c.cw, size: 34, align: 'right', pk: 'fg', fw: 700}); }},
{id: 'palavra-cortada', name: 'Palavra gigante cortada', group: 'Tipografia', mode: 'dark', tags: 'impacto foto título gigante', fields: ['title', 'sub', 'handle'],
  sample: {title: 'VENDER,', sub: 'eu faria seu perfil assim, se fosse seu social media.', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H});
    c.r('overlay', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: {c1: 'rgba(0,0,0,0.55)', c2: 'rgba(0,0,0,0.2)', a: 180}});
    c.t('title', copy.title, {fk: 'cond', fixUp: true, size: 470, lh: 0.9, w: 4000, x: -40, y: c.H * 0.06, fw: 400, pk: 'fg'});
    c.t('body', copy.sub, {w: 520, x: c.m, y: c.H * 0.5, size: 44, fw: 700, lh: 1.2});
    c.t('brand', copy.handle, {y: c.H - c.m - 26, size: 24, pk: 'mut'}); }},
{id: 'manifesto-linhas', name: 'Manifesto em linhas', group: 'Tipografia', mode: 'light', tags: 'poema valores manifesto texto', fields: ['title', 'items', 'sub', 'handle'],
  sample: {title: 'Nunca foi sorte, sempre foi trabalho.', items: 'Se alguém bateu o olho e entendeu rápido…\nSe alguém lembrou depois que viu…\nSe alguém leu e mandou uma mensagem…\nSe alguém confiou até sem conhecer…', sub: 'o trabalho cumpriu seu dever.', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    const t = c.t('title', copy.title, {fk: 'script', size: 96, align: 'center', pk: 'acc', lh: 1.05, fw: 700, fixUp: false}); c.fit(t, 330, 40);
    const body = c.t('body', copy.items.join('\n'), {size: 34, align: 'center', pk: 'mut', lh: 1.9, fk: 'body'}); c.fit(body, c.H * 0.4, 20);
    const end = c.t('body', copy.sub, {fk: 'script', size: 84, align: 'center', pk: 'acc', lh: 1.1, fw: 700}); c.fit(end, 260, 36);
    c.stack([t, body, end], c.m * 0.9, c.H - c.m - 40, 'middle', 56);
    c.t('brand', copy.handle, {y: c.H - c.m - 26, size: 22, pk: 'mut', align: 'center'}); }},
{id: 'texto-repetido', name: 'Texto repetido em degradê', group: 'Tipografia', mode: 'dark', tags: 'minimalista tipografia foco', fields: ['title', 'handle'],
  sample: {title: 'VISUALMENTE.', handle: '@seunegocio'},
  build(c) { const {copy} = c, n = 9, step = (c.H - 2 * c.m - 80) / n;
    for (let i = 0; i < n; i++) { const d = Math.abs(i - 4) / 4, mid = i === 4;
      c.t('title', copy.title, {fk: 'body', size: 70, ls: 10, fixUp: true, align: 'center', y: c.m + 20 + i * step, pk: mid ? 'fg' : 'mut', opacity: mid ? 1 : 0.28 + 0.55 * (1 - d), fw: mid ? 800 : 400, w: c.cw}); }
    c.t('brand', copy.handle, {y: c.H - c.m - 26, size: 22, pk: 'mut', align: 'center'}); }},
{id: 'texto-espalhado', name: 'Palavras soltas na grade', group: 'Tipografia', mode: 'dark', tags: 'textura tipografia ritmo minimalista', fields: ['title', 'sub', 'handle'],
  sample: {title: 'Todo design parece fácil depois que fica pronto', sub: 'Tem detalhes que ninguém nunca vai notar. ', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.t('body', Array.from({length: 40}, () => copy.sub).join(''), {size: 15, lh: 1.25, pk: 'mut', opacity: 0.5, x: 20, w: c.W - 40, y: 20, ls: 0});
    String(copy.title).split(/\s+/).forEach((w, i, a) => { c.t('title', w, {fk: 'body', fw: 700, size: 30, ls: 2, fixUp: true, w: 360, x: c.W * 0.1 + (i % 3) * 270, y: c.H * 0.16 + i * (c.H * 0.64 / Math.max(1, a.length)), pk: i % 4 === 2 ? 'acc' : 'fg'}); });
    c.t('brand', copy.handle, {y: c.H - c.m - 26, size: 22, pk: 'mut', align: 'center'}); }},
{id: 'caderno-manuscrito', name: 'Caderno manuscrito', group: 'Tipografia', mode: 'light', tags: 'manuscrito humano descontraído educativo', fields: ['title', 'handle'],
  sample: {title: 'Palavras proibidas no **ChatGPT**', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.bgRect({pk: 'alt'});
    for (let y = 150; y < c.H - 40; y += 74) c.r('line', {x: 0, y, w: c.W, h: 3, pk: 'line'});
    c.r('margin', {x: 150, y: 0, w: 3, h: c.H, pk: 'acc', opacity: 0.55});
    const t = c.t('title', copy.title, {fk: 'script', size: 150, lh: 1.05, x: 190, w: 840, fw: 700, em0: 'underline', pk: 'fg', fixUp: false}); c.fit(t, c.H * 0.62, 50);
    c.stack([t], c.H * 0.12, c.H * 0.85, 'middle', 0, 190, 840);
    c.t('brand', copy.handle, {x: 190, y: c.H - c.m - 14, size: 24, pk: 'mut'}); }},
{id: 'degrade-titulo', name: 'Degradê com título no canto', group: 'Tipografia', mode: 'accent', tags: 'degradê simples titulo moderno grão', fields: ['title', 'handle'],
  sample: {title: 'Lindos degradês', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.bgRect({pk: 'none', grad: {c1: c.pal.bg, c2: c.pal.grad2, a: 160}, gk: ['bg', 'grad2']});
    c.bgRect({pk: 'none', grain: 0.1});
    const t = c.t('title', copy.title, {fk: 'head', size: 170, lh: 1.02, fw: 800, w: 760, fixUp: false}); c.fit(t, c.H * 0.4, 60);
    t.y = c.H - c.m - 110 - c.h(t);
    c.t('brand', copy.handle, {y: c.H - c.m - 40, size: 28, pk: 'fg', fw: 600}); }},
{id: 'pergunta-centralizada', name: 'Pergunta centralizada', group: 'Tipografia', mode: 'light', tags: 'pergunta engajamento simples carrossel', fields: ['title', 'handle'],
  sample: {title: 'Demora tanto assim pra fazer um logo?', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.bgRect({pk: 'alt'});
    const t = c.t('title', copy.title, {fk: 'head', size: 88, lh: 1.12, align: 'center', fw: 800, fixUp: false, em0: 'bold'}); c.fit(t, c.H * 0.5, 40);
    c.stack([t], c.m, c.H - c.m, 'middle', 0);
    c.t('brand', copy.handle, {y: c.H - c.m - 26, size: 24, pk: 'mut', align: 'center'}); }},
{id: 'pergunta-imagem-resposta', name: 'Pergunta, imagem e resposta', group: 'Tipografia', mode: 'dark', tags: 'meme comparação humor print', fields: ['title', 'sub', 'kicker', 'handle'],
  sample: {title: 'Há quanto tempo você trabalha com isso?', kicker: 'eu:', sub: 'há muuuito tempo…', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    const q = c.t('title', copy.title, {fk: 'head', size: 72, lh: 1.1, align: 'center', fw: 700, fixUp: false}); c.fit(q, 260, 36); q.y = c.m + 10;
    const k = c.t('kicker', copy.kicker, {size: 46, align: 'center', pk: 'mut', fixUp: false, fw: 700, y: q.y + c.h(q) + 40});
    const iy = k.y + 90; c.i('thumb', {x: c.m + 50, y: iy, w: c.cw - 100, h: Math.round(c.H * 0.32), radius: 14, brief: 'Print ou imagem de apoio'});
    c.t('body', copy.sub, {size: 54, align: 'center', pk: 'mut', y: iy + Math.round(c.H * 0.32) + 40, fw: 600});
    c.t('brand', copy.handle, {y: c.H - c.m - 26, size: 22, pk: 'mut', align: 'center'}); }},
{id: 'serif-minimal', name: 'Frase serifada minimalista', group: 'Tipografia', mode: 'accent', tags: 'elegante frase minimalista reflexão', fields: ['title', 'sub'],
  sample: {title: 'Você gostava do que criou.', sub: 'Até olhar as curtidas.'},
  build(c) { const {copy} = c;
    const t = c.t('title', copy.title, {fk: 'serif', size: 62, lh: 1.3, fw: 400, w: 780, fixUp: false}), s = c.t('body', copy.sub, {fk: 'serif', size: 62, lh: 1.3, fw: 400, w: 780, fixUp: false});
    c.stack([t, s], c.m, c.H - c.m, 'middle', 0); }},
{id: 'bloco-vertical', name: 'Palavra vertical entre bordas', group: 'Tipografia', mode: 'dark', tags: 'impacto motivacional vertical condensado', fields: ['title', 'kicker', 'items', 'handle'],
  sample: {title: 'IDEIAS', kicker: 'Faça suas', items: 'Confie em você\nExperimente\nMude se precisar\nLeve até o fim', handle: '@seunegocio'},
  build(c) { const {copy} = c, word = String(copy.title).replace(/\s+/g, '').split('').join('\n');
    c.t('kicker', copy.kicker, {size: 34, ls: 8, align: 'center', fixUp: true, pk: 'fg', fw: 700, y: c.m - 20});
    const w = c.t('title', word, {fk: 'cond', size: 300, lh: 0.86, align: 'center', pk: 'acc', fixUp: true, fw: 400, x: 240, w: 600}); c.fit(w, c.H - 2 * c.m - 80, 60); w.y = c.m + 40;
    const edge = (txt, cx, rot) => c.t('muted', txt, {size: 30, ls: 7, fixUp: true, align: 'center', pk: 'fg', fw: 700, w: 760, x: cx - 380, y: c.H / 2 - 20, rot});
    copy.items.slice(0, 4).forEach((it, i) => edge(it, i % 2 ? 1015 - (i > 1 ? 70 : 0) : 65 + (i > 1 ? 70 : 0), i % 2 ? 90 : -90));
    c.t('brand', copy.handle, {y: c.H - c.m + 6, size: 22, pk: 'mut', align: 'center'}); }},
{id: 'palavra-grao', name: 'Palavra desfocada com grão', group: 'Tipografia', mode: 'dark', tags: 'urgência impacto desfoque grão', fields: ['title', 'kicker', 'sub'],
  sample: {title: 'UR\nGEN\nTE', kicker: 'O urgente não deveria…', sub: '…ser maior que a gente.'},
  build(c) { const {copy} = c;
    c.t('title', copy.title, {fk: 'cond', size: 400, lh: 0.84, align: 'left', pk: 'acc', fixUp: true, fw: 400, w: 1000, x: 40, y: c.H * 0.16, blur: 5, opacity: 0.95}); c.fit(c.layers[c.layers.length - 1], c.H * 0.7, 120);
    c.bgRect({pk: 'none', grain: 0.55});
    c.t('kicker', copy.kicker, {size: 38, y: c.m, fw: 600, pk: 'fg', fixUp: false});
    c.t('body', copy.sub, {size: 38, y: c.H - c.m - 60, align: 'right', fw: 600, pk: 'fg'}); }},
{id: 'serif-balao', name: 'Número serifado com balão', group: 'Tipografia', mode: 'accent', tags: 'lista dicas número serifado balão', fields: ['num', 'title', 'sub'],
  sample: {num: '30', title: 'códigos para usar melhor a ferramenta', sub: 'guia rápido'},
  build(c) { const {copy} = c;
    c.t('title', copy.num, {fk: 'serif', size: 640, lh: 0.8, fw: 400, w: 1000, x: c.m - 30, y: c.m - 10, fixUp: false, pk: 'fg'});
    c.r('bubble', {shape: 'ellipse', x: 260, y: c.H * 0.46, w: 760, h: 520, pk: 'fg'});
    c.r('bubble', {x: 800, y: c.H * 0.46 + 430, w: 70, h: 110, pk: 'fg', rot: 25, radius: 8});
    const t = c.t('body', copy.title, {fk: 'head', size: 66, fw: 700, pk: 'rev', align: 'center', x: 340, w: 600, lh: 1.15, fixUp: false}); c.fit(t, 330, 30); t.y = c.H * 0.46 + (520 - c.h(t)) / 2;
    c.t('brand', copy.sub, {x: c.m, y: c.H - c.m - 30, size: 30, pk: 'fg', fw: 600}); }},
{id: 'preto-branco-manuscrita', name: 'Título forte com palavra manuscrita', group: 'Tipografia', mode: 'light', tags: 'contraste manuscrita destaque cor', fields: ['title', 'kicker', 'handle'],
  sample: {title: 'Preto e Branco', kicker: '+ Cor de Destaque', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    const t = c.t('title', copy.title, {fk: 'black', size: 160, lh: 1, fw: 400, fixUp: false, align: 'left', y: c.m - 20}); c.fit(t, 330, 50);
    const k = c.t('kicker', copy.kicker, {fk: 'script', size: 120, pk: 'acc', fw: 700, fixUp: false, rot: -3, y: t.y + c.h(t) + 6}); c.fit(k, 160, 40);
    const ph = c.i('photo', {x: 0, y: k.y + c.h(k) + 30, w: c.W, h: c.H - (k.y + c.h(k) + 30)}); ph.filter = 'grayscale(1)';
    c.t('brand', copy.handle, {y: c.H - c.m, size: 22, pk: 'on', x: c.m + 400, w: 500, align: 'right'}); }}
);
