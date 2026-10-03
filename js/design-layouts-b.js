/* Modelos · Foto + texto e Camadas (texto atrás do sujeito) */
const SHADE = (a, b) => ({c1: 'rgba(0,0,0,' + a + ')', c2: 'rgba(0,0,0,' + b + ')', a: 180});
LAYOUTS.push(
{id: 'poster-campanha', name: 'Pôster de campanha com produto', group: 'Foto + texto', mode: 'accent', tags: 'produto campanha cartaz título topo', fields: ['title', 'sub', 'handle'],
  sample: {title: 'Precisamos conversar sobre isso!', sub: '', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    const t = c.t('title', copy.title, {fk: 'cond', size: 170, lh: 0.95, align: 'center', fixUp: true, fw: 400}); c.fit(t, c.H * 0.3, 50); t.y = c.m - 10;
    c.i('cutout', {x: 120, y: t.y + c.h(t) + 10, w: c.W - 240, h: c.H - (t.y + c.h(t)) - c.m - 90, brief: 'Produto recortado (PNG sem fundo)'});
    if (copy.sub) c.t('body', copy.sub, {size: 40, align: 'center', y: c.H - c.m - 90, pk: 'fg', fw: 700});
    c.t('brand', copy.handle, {y: c.H - c.m - 26, size: 24, align: 'center', pk: 'fg'}); }},
{id: 'titulo-pequeno-palavra-enorme', name: 'Título pequeno + palavra enorme', group: 'Foto + texto', mode: 'dark', tags: 'nicho profissão chamada foto', fields: ['kicker', 'title', 'sub', 'handle'],
  sample: {kicker: 'Se você é', title: 'DJ,', sub: 'esta publicação foi feita para você.', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H}); c.r('overlay', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: SHADE(0.55, 0.05)});
    const k = c.t('kicker', copy.kicker, {size: 64, fk: 'head', fw: 700, fixUp: false, pk: 'fg'}), t = c.t('title', copy.title, {fk: 'head', size: 360, fw: 900, pk: 'acc', lh: 0.9, fixUp: true}); c.fit(t, 380, 90);
    const s = c.t('body', copy.sub, {size: 46, w: 640, fw: 600, lh: 1.2});
    c.stack([k, t, s], c.m, c.H * 0.6, 'top', 8);
    c.t('brand', copy.handle, {y: c.H - c.m - 26, size: 24, pk: 'mut'}); }},
{id: 'foto-selo-titulo', name: 'Foto com selo e título', group: 'Foto + texto', mode: 'dark', tags: 'tutorial técnica foto selo título', fields: ['kicker', 'title', 'handle'],
  sample: {kicker: 'DICA', title: 'Dupla exposição criativa', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H}); c.r('overlay', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: SHADE(0.0, 0.8)});
    const kk = c.t('kicker', copy.kicker, {size: 30, fixUp: true, fw: 800, pk: 'on', ls: 3, w: 400, x: c.m + 26});
    const kw = layoutText(Object.assign({}, kk, {w: 4000})).lines[0].w;
    const t = c.t('title', copy.title, {fk: 'head', size: 120, lh: 1.04, fw: 800, fixUp: false}); c.fit(t, c.H * 0.3, 50);
    const ty = c.H - c.m - 90 - c.h(t); t.y = ty;
    c.r('chip', {x: c.m, y: ty - 78, w: kw + 52, h: 54, radius: 12, pk: 'acc'}); kk.y = ty - 78 + 11; kk.w = kw + 8; c.layers.push(c.layers.splice(c.layers.indexOf(kk), 1)[0]);
    c.t('brand', copy.handle, {y: c.H - c.m - 26, size: 24, pk: 'fg'}); }},
{id: 'foto-lista-numerada', name: 'Foto com lista numerada', group: 'Foto + texto', mode: 'dark', tags: 'lista foto serifado numerada', fields: ['title', 'items', 'handle'],
  sample: {title: 'Nenhum empreendedor tem os 6:', items: 'Tempo livre\nSono em dia\nSaúde em dia\nLucro estável\nEquipe pronta\nAgenda cheia', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H}); c.r('overlay', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: {c1: 'rgba(0,0,0,0.7)', c2: 'rgba(0,0,0,0.05)', a: 270}});
    const t = c.t('title', copy.title, {fk: 'serif', size: 100, lh: 1.04, fw: 400, w: 520, fixUp: false}); c.fit(t, 360, 44);
    const l = c.t('body', copy.items.map((x, i) => (i + 1) + '- ' + x).join('\n'), {size: 40, lh: 1.34, fw: 700, w: 520}); c.fit(l, 520, 22);
    c.stack([t, l], c.H * 0.3, c.H - c.m - 40, 'middle', 24);
    c.t('brand', copy.handle, {y: c.H - c.m - 26, size: 24, pk: 'mut'}); }},
{id: 'duas-pontas-curva', name: 'Duas pontas com linha curva', group: 'Foto + texto', mode: 'dark', tags: 'foto institucional título dois níveis', fields: ['kicker', 'title', 'handle'],
  sample: {kicker: 'Bom design', title: 'Design bonito vende.', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H}); c.r('overlay', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: SHADE(0.35, 0.55)});
    c.r('curve', {shape: 'ellipse', x: 150, y: c.H * 0.2, w: 1100, h: c.H * 0.62, pk: 'none', pks: 'fg', stroke: '#fff', strokeW: 3, opacity: 0.8});
    c.t('kicker', copy.kicker, {size: 62, fw: 700, w: 520, fk: 'head', fixUp: false, pk: 'fg', y: c.m});
    const t = c.t('title', copy.title, {fk: 'head', size: 118, fw: 800, align: 'right', lh: 1.02, x: 380, w: 610, fixUp: false}); c.fit(t, 360, 44); t.y = c.H - c.m - 80 - c.h(t);
    c.t('brand', copy.handle, {y: c.H - c.m - 26, size: 24, pk: 'mut', align: 'right', x: 380, w: 610}); }},
{id: 'foto-topo-titulo-contador', name: 'Título no topo + foto + contador', group: 'Foto + texto', mode: 'light', tags: 'carrossel capa foto contador explicativo', fields: ['title', 'kicker', 'button', 'handle'],
  sample: {title: 'Seu conteúdo desperta **interesse?**', kicker: 'Conteúdo que conecta', button: 'Arraste para o lado →', handle: '01/04'},
  build(c) { const {copy} = c;
    c.t('muted', copy.kicker, {size: 26, pk: 'mut', y: c.m - 30, fw: 600});
    const t = c.t('title', copy.title, {fk: 'head', size: 88, fw: 800, lh: 1.08, em0: 'color', y: c.m + 20, fixUp: false}); c.fit(t, 300, 40);
    const y = t.y + c.h(t) + 30, h = c.H - y - c.m - 70;
    c.i('photo', {x: c.m, y, w: c.cw, h, radius: 20});
    c.t('muted', copy.handle, {y: y + h + 22, size: 26, pk: 'mut', fw: 700, w: 300});
    c.t('muted', copy.button, {x: c.m + 300, w: c.cw - 300, y: y + h + 22, size: 26, pk: 'mut', align: 'right', fw: 700}); }},
{id: 'titulo-lateral', name: 'Título condensado na lateral', group: 'Foto + texto', mode: 'dark', tags: 'foto pessoa depoimento frase lateral', fields: ['title', 'sub'],
  sample: {title: 'Quem tem **fome** não espera a oportunidade sentado.', sub: ''},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H}); c.r('overlay', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: {c1: 'rgba(0,0,0,0.05)', c2: 'rgba(0,0,0,0.7)', a: 270}});
    const t = c.t('title', copy.title, {fk: 'cond', size: 110, lh: 1, align: 'right', x: 560, w: 440, fixUp: true, em0: 'color', fw: 400}); c.fit(t, c.H * 0.6, 40);
    const items = [t]; if (copy.sub) items.push(c.t('body', copy.sub, {x: 560, w: 440, size: 36, align: 'right'}));
    c.stack(items, c.m, c.H - c.m, 'middle', 24, 560, 440); }},
{id: 'retrato-anotacoes', name: 'Retrato com anotações', group: 'Foto + texto', mode: 'dark', tags: 'autoridade anotações curadoria retrato', fields: ['title', 'sub', 'items', 'handle'],
  sample: {title: 'Conheça a Curadoria', sub: 'Meu olhar sobre o mercado, na sua tela, de segunda a sexta.', items: 'tom de voz\ncores e contraste\nmenos é mais\nclareza primeiro', handle: '@seunegocio'},
  build(c) { const {copy} = c, pos = [[70, 0.12], [740, 0.1], [60, 0.36], [770, 0.34]];
    c.i('cutout', {x: 250, y: c.H * 0.06, w: 580, h: c.H * 0.6});
    copy.items.slice(0, 4).forEach((it, i) => { const [x, f] = pos[i]; c.t('body', it, {fk: 'script', size: 38, lh: 1.1, w: 280, x, y: c.H * f, fw: 700, align: i % 2 ? 'left' : 'right', pk: 'fg'}); c.r('line', {x: i % 2 ? x - 40 : x + 290, y: c.H * f + 20, w: 40, h: 3, pk: 'acc'}); });
    const t = c.t('title', copy.title, {fk: 'head', size: 108, fw: 800, fixUp: false, lh: 1.05}), s = c.t('body', copy.sub, {size: 42, pk: 'mut', w: 780, lh: 1.25});
    c.stack([t, s], c.H * 0.7, c.H - c.m - 20, 'bottom', 18);
    c.t('brand', copy.handle, {y: c.H - c.m - 4, size: 22, pk: 'mut'}); }},
{id: 'titulo-topo-palavra-rodape', name: 'Frase com palavra gigante no rodapé', group: 'Foto + texto', mode: 'dark', tags: 'foto plateia resultado ação chamada', fields: ['kicker', 'title', 'sub', 'label'],
  sample: {kicker: 'Conhecimento', title: 'só vira RESULTADO', sub: 'quando você', label: 'AGE.'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H}); c.r('overlay', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: {c1: 'rgba(0,0,0,0.75)', c2: 'rgba(0,0,0,0.78)', a: 0}});
    const k = c.t('kicker', copy.kicker, {fk: 'cond', size: 74, align: 'center', fixUp: true, fw: 400}), t = c.t('title', copy.title, {fk: 'cond', size: 130, align: 'center', fixUp: true, lh: 1, fw: 400}); c.fit(t, 230, 50);
    c.stack([k, t], c.m, c.H * 0.3, 'top', 0);
    const s = c.t('body', copy.sub, {size: 40, ls: 8, align: 'center', fixUp: true, fw: 600}), l = c.t('title', copy.label, {fk: 'cond', size: 330, align: 'center', pk: 'acc', fixUp: true, fw: 400, lh: 0.9}); c.fit(l, 330, 80);
    c.stack([s, l], c.H * 0.68, c.H - c.m, 'bottom', 0); }},
{id: 'espaco-negativo', name: 'Título no espaço negativo', group: 'Foto + texto', mode: 'dark', tags: 'foto paisagem minimal sutil', fields: ['title', 'handle'],
  sample: {title: 'a magia do **espaço negativo.**', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H});
    const t = c.t('title', copy.title, {fk: 'head', size: 64, fw: 500, lh: 1.15, w: 420, y: c.m, em0: 'bold', fixUp: false}); c.fit(t, 300, 28);
    c.t('brand', copy.handle, {y: c.H - c.m - 26, size: 24, pk: 'fg', opacity: 0.85}); }},
{id: 'sujeito-deslocado', name: 'Sujeito deslocado + título', group: 'Foto + texto', mode: 'light', tags: 'respiro minimal pessoa movimento', fields: ['title', 'sub', 'handle'],
  sample: {title: 'Você não precisa centralizar sempre!', sub: 'O que muda no design quando você tira o conteúdo do centro.', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.i('cutout', {x: 480, y: c.H * 0.38, w: 600, h: c.H * 0.62});
    const t = c.t('title', copy.title, {fk: 'head', size: 84, fw: 800, lh: 1.08, w: 700, fixUp: false}); c.fit(t, 330, 36);
    const s = c.t('body', copy.sub, {size: 36, w: 560, pk: 'mut', lh: 1.3});
    c.stack([t, s], c.m - 20, c.H * 0.45, 'top', 20);
    c.t('brand', copy.handle, {y: c.H - c.m - 26, size: 24, pk: 'mut'}); }},
{id: 'foto-cta-comente', name: 'Foto com chamada para comentar', group: 'Foto + texto', mode: 'dark', tags: 'engajamento lead comentário foto cta', fields: ['title', 'kicker', 'button', 'handle'],
  sample: {title: 'Um ensaio fotográfico', kicker: 'Com a sua cara', button: 'QUERO MEU ENSAIO', handle: 'Comente'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H}); c.r('overlay', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: SHADE(0.5, 0.35)});
    const t = c.t('title', copy.title, {fk: 'cond', size: 150, lh: 0.95, fixUp: true, fw: 400, pk: 'fg', w: 700}); c.fit(t, 420, 50);
    const k = c.t('muted', copy.kicker, {size: 34, fw: 600, pk: 'fg', fixUp: true, ls: 3, w: 700});
    c.stack([t, k], c.m, c.H * 0.45, 'top', 12);
    const bw = 520, bx = c.W - c.m - bw, by = c.H - c.m - 230; c.r('cta-fill', {x: bx, y: by, w: bw, h: 190, radius: 8, pk: 'acc'});
    c.t('muted', copy.handle, {x: bx + 24, w: bw - 48, y: by + 22, size: 26, pk: 'on', fixUp: true, ls: 4, fw: 700}); const b = c.t('cta-text', copy.button, {x: bx + 24, w: bw - 48, y: by + 66, size: 74, fk: 'cond', fixUp: true, fw: 400, pk: 'on', lh: 1}); c.fit(b, 100, 28); }},
{id: 'arco-janela', name: 'Foto em arco', group: 'Foto + texto', mode: 'dark', tags: 'elegante editorial arco moldura', fields: ['title', 'sub', 'kicker', 'handle'],
  sample: {kicker: 'MANIFESTO', title: 'Não existe estética certa. **Existe a sua.**', sub: 'Seu estilo diz quem você é antes de qualquer palavra.', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 190, y: c.H * 0.2, w: 700, h: c.H * 0.62, shape: 'arch'});
    c.t('kicker', copy.kicker, {size: 24, ls: 8, align: 'center', fixUp: true, pk: 'mut', y: c.m - 30});
    const t = c.t('title', copy.title, {fk: 'cond', size: 104, lh: 1, align: 'center', fixUp: true, em0: 'color', fw: 400, y: c.m + 20}); c.fit(t, c.H * 0.17, 40);
    c.t('body', copy.sub, {size: 30, align: 'center', pk: 'mut', y: c.H * 0.84, w: 760, x: 160, lh: 1.3});
    c.t('brand', copy.handle, {y: c.H - c.m - 6, size: 22, pk: 'mut', align: 'center'}); }},
{id: 'selo-inclinado', name: 'Selo inclinado sobre a foto', group: 'Foto + texto', mode: 'dark', tags: 'pack oferta adesivo categoria foto', fields: ['title', 'kicker', 'handle'],
  sample: {kicker: 'SUPER PACK', title: 'MÚSICA', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H}); c.r('overlay', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: SHADE(0, 0.55)});
    const y = c.H * 0.66; c.r('sticker', {x: 130, y, w: 820, h: 210, radius: 20, pk: 'acc'});
    const k = c.t('muted', copy.kicker, {size: 38, ls: 4, fixUp: true, fw: 800, pk: 'on', x: 170, w: 740, y: y + 16, align: 'left'});
    const t = c.t('title', copy.title, {fk: 'cond', size: 150, fixUp: true, fw: 400, pk: 'on', x: 170, w: 740, y: y + 62, lh: 1}); c.fit(t, 140, 40, 1);
    c.rotGroup([c.layers[c.layers.length - 3], k, t], 540, y + 105, -6);
    c.t('brand', copy.handle, {y: c.H - c.m - 26, size: 24, pk: 'fg', align: 'center'}); }},
{id: 'split-foto-bloco', name: 'Foto no topo + bloco de texto', group: 'Foto + texto', mode: 'dark', tags: 'prompt receita passo texto divisão', fields: ['kicker', 'title', 'sub', 'handle'],
  sample: {kicker: 'PASSO A PASSO', title: 'Como organizar seu conteúdo', sub: 'Um roteiro simples para postar com constância, sem se perder no meio do caminho.', handle: '@seunegocio'},
  build(c) { const {copy} = c, ph = Math.round(c.H * 0.52);
    c.i('photo', {x: 0, y: 0, w: c.W, h: ph});
    const k = c.t('kicker', copy.kicker, {size: 24, ls: 6, pk: 'acc', fixUp: true, fw: 800}), t = c.t('title', copy.title, {fk: 'head', size: 72, lh: 1.08, fw: 800, fixUp: false}), s = c.t('body', copy.sub, {size: 34, pk: 'mut', lh: 1.35});
    c.fit(t, 200, 34); c.fit(s, 200, 22); c.stack([k, t, s], ph + 40, c.H - c.m - 30, 'top', 18);
    c.t('brand', copy.handle, {y: c.H - c.m - 6, size: 22, pk: 'mut'}); }},
{id: 'wordmark-foto', name: 'Wordmark fino sobre a foto', group: 'Foto + texto', mode: 'dark', tags: 'elegante premium minimalista foto', fields: ['title', 'sub'],
  sample: {title: 'Atelier', sub: 'arraste para o lado'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H}); c.r('overlay', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: SHADE(0, 0.45)});
    const t = c.t('title', copy.title, {fk: 'serif', size: 260, align: 'center', fw: 400, fixUp: true, lh: 1, ls: 6, opacity: 0.96}); c.fit(t, 320, 60);
    t.y = c.H * 0.62; c.t('brand', copy.sub, {y: c.H - c.m - 26, size: 26, align: 'center', pk: 'fg', ls: 2}); }},

/* ---- Camadas: texto atrás do sujeito recortado ---- */
{id: 'palavra-atras-sujeito', name: 'Palavra gigante atrás do sujeito', group: 'Camadas', mode: 'accent', tags: 'camadas sujeito recortado destaque', fields: ['title', 'sub', 'handle'],
  sample: {title: 'FOCO', sub: 'Como usar o desfoque em imagens e tipografias para criar movimento e profundidade.', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.t('title', copy.title, {fk: 'black', size: 470, lh: 1, w: 1300, x: -110, y: c.H * 0.34, align: 'center', fw: 400, fixUp: true, pk: 'fg', blur: 9, opacity: 0.92});
    c.i('cutout', {x: 90, y: c.H * 0.04, w: 900, h: c.H * 0.76});
    const s = c.t('body', copy.sub, {size: 46, fw: 700, w: 640, lh: 1.2}); c.fit(s, 240, 26); s.y = c.H - c.m - 30 - c.h(s);
    c.t('brand', copy.handle, {y: c.H - c.m - 26, size: 22, pk: 'fg', x: 740, w: 250, align: 'right'}); }},
{id: 'letras-empilhadas', name: 'Letras empilhadas atrás do sujeito', group: 'Camadas', mode: 'dark', tags: 'camadas vertical impacto sujeito', fields: ['title', 'sub', 'handle'],
  sample: {title: 'MARCA', sub: 'Inspiração diária', handle: '@seunegocio'},
  build(c) { const {copy} = c, word = String(copy.title).replace(/\s+/g, '').split('').join('\n');
    const w = c.t('display', word, {fk: 'black', size: 320, lh: 0.8, x: 80, w: 500, fw: 400, fixUp: true, pk: 'fg'}); c.fit(w, c.H - 2 * c.m, 60);
    w.y = c.m;
    c.i('cutout', {x: 250, y: c.H * 0.05, w: 800, h: c.H * 0.86});
    c.t('body', copy.sub, {fk: 'script', size: 96, rot: -4, pk: 'acc', fw: 700, x: 450, w: 600, y: c.H - c.m - 190, align: 'left', fixUp: false, lh: 1});
    c.t('brand', copy.handle, {y: c.H - c.m - 26, size: 24, pk: 'fg', x: 450, w: 500}); }},
{id: 'pessoa-na-frente', name: 'Pessoa na frente da palavra', group: 'Camadas', mode: 'light', tags: 'camadas pack editorial sujeito', fields: ['kicker', 'title', 'handle'],
  sample: {kicker: 'SUPER PACK', title: 'IDEIAS\nPRONTAS', handle: 'arraste para o lado'},
  build(c) { const {copy} = c;
    c.t('kicker', copy.kicker, {size: 26, ls: 6, align: 'center', pk: 'fg', fixUp: true, fw: 700, y: c.m - 30});
    const t = c.t('title', copy.title, {fk: 'cond', size: 380, lh: 0.88, align: 'center', pk: 'fg', fixUp: true, fw: 400, y: c.m + 20}); c.fit(t, c.H * 0.62, 90);
    c.i('cutout', {x: 160, y: c.H * 0.1, w: 760, h: c.H * 0.88});
    c.t('brand', copy.handle, {y: c.H - c.m - 6, size: 24, pk: 'fg', align: 'center'}); }},
{id: 'objeto-entre-palavras', name: 'Objeto entre duas palavras', group: 'Camadas', mode: 'light', tags: 'produto pack objeto centro palavras', fields: ['kicker', 'title', 'sub', 'handle'],
  sample: {kicker: 'SUPER PACK DE', title: 'PROMPTS', sub: 'FILTROS\nPARA FOTOS', handle: '15 filtros que você vai querer testar'},
  build(c) { const {copy} = c;
    c.t('kicker', copy.kicker, {size: 30, ls: 5, align: 'center', pk: 'fg', fixUp: true, fw: 700, y: c.m - 30});
    const t = c.t('title', copy.title, {fk: 'cond', size: 330, lh: 0.9, align: 'center', pk: 'fg', fixUp: true, fw: 400, y: c.m + 10}); c.fit(t, 300, 80);
    const s = c.t('body', copy.sub, {fk: 'cond', size: 200, lh: 0.92, align: 'center', pk: 'fg', fixUp: true, fw: 400}); c.fit(s, 400, 60); s.y = c.H - c.m - 50 - c.h(s);
    c.i('cutout', {x: 200, y: t.y + c.h(t) - 40, w: 680, h: s.y - (t.y + c.h(t)) + 80});
    c.t('brand', copy.handle, {y: c.H - c.m - 14, size: 22, pk: 'mut', align: 'center'}); }}
);
