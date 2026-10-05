/* Modelos · lote 6: posts de feed e anúncios (estruturas vistas em perfis e anúncios de referência).
   Só a estrutura é recriada: textos, marcas, logos e fotos dos exemplos não entram. Tudo continua editável no Estúdio. */
if (!LAYOUT_GROUPS.includes('Feed e anúncios')) LAYOUT_GROUPS.push('Feed e anúncios');
const FA = 'Feed e anúncios';
/* círculo com seta ou sinal (botões e marcadores) */
function faDot(c, x, y, d, ch, pk) { c.r('dot', {shape: 'ellipse', x, y, w: d, h: d, pk: pk || 'acc'}); const t = c.t('cta-text', ch, {x, y: y + d * 0.14, w: d, size: Math.round(d * 0.58), align: 'center', pk: 'on', fk: 'black', fw: 400, lh: 1}); return t; }
LAYOUTS.push(
{id: 'fa-noticia-numero', name: 'Notícia com número grande', group: FA, mode: 'dark', tags: 'notícia dado estatística número mercado post feed autoridade', fields: ['kicker', 'title', 'num', 'sub', 'handle'],
  sample: {kicker: 'NOTÍCIA', title: 'O comportamento do seu cliente **mudou**', num: '53%', sub: 'Dado de exemplo: troque pelo número real e cite a fonte.', handle: 'Fonte: [CONFIRMAR]'},
  build(c) { const {copy} = c;
    const kw = Math.max(200, copy.kicker.length * 20 + 50); c.r('chip', {x: c.m, y: c.m, w: kw, h: 54, radius: 10, pk: 'acc'}); c.t('kicker', copy.kicker, {x: c.m + 18, y: c.m + 11, w: kw - 30, size: 26, fw: 800, pk: 'on', fixUp: true, ls: 2});
    const t = c.t('title', copy.title, {fk: 'cond', size: 118, lh: 0.98, fw: 400, fixUp: true, em0: 'color', y: c.m + 90}); c.fit(t, c.H * 0.3, 44);
    const y = t.y + c.h(t) + 36, h = Math.min(c.H * 0.34, c.H - y - 250);
    c.r('card', {x: c.m, y, w: c.cw, h, radius: 24, pk: 'alt'});
    const n = c.t('title', copy.num, {fk: 'cond', size: 300, lh: 1, fw: 400, pk: 'acc', x: c.m + 40, y: y + 10, w: c.cw * 0.55}); c.fit(n, h - 20, 80, 1);
    c.i('photo', {x: c.m + c.cw * 0.58, y: y + 24, w: c.cw * 0.38, h: h - 48, radius: 14});
    const s = c.t('body', copy.sub, {size: 28, pk: 'mut', lh: 1.3, y: y + h + 22, w: c.cw - 130}); c.fit(s, 110, 20);
    c.t('muted', copy.handle, {size: 20, pk: 'mut', y: c.H - c.m - 14, w: c.cw - 120});
    faDot(c, c.W - c.m - 80, c.H - c.m - 86, 80, '→'); }},
{id: 'fa-foto-titulo-embaixo', name: 'Foto cheia com título forte embaixo', group: FA, mode: 'dark', tags: 'foto retrato pessoa título condensado destaque verde feed vídeo capa', fields: ['title', 'kicker', 'handle'],
  sample: {kicker: 'BASTIDORES', title: 'O lucro no papel **não paga boleto**', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H}); c.r('overlay', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: SHADE(0, 0.78)});
    c.t('kicker', copy.kicker, {y: c.m, size: 26, ls: 5, fw: 800, pk: 'acc', fixUp: true});
    const t = c.t('title', copy.title, {fk: 'cond', size: 170, lh: 0.95, fw: 400, fixUp: true, em0: 'color', align: 'center'}); c.fit(t, c.H * 0.34, 54); t.y = c.H - c.m - 60 - c.h(t);
    c.t('brand', copy.handle, {y: c.H - c.m - 26, size: 22, align: 'center', pk: 'mut'}); }},
{id: 'fa-titulo-quadro-foto', name: 'Título em cima e foto em quadro', group: FA, mode: 'dark', tags: 'quadro foto título pergunta o que ninguém conta bastidor autoridade feed', fields: ['title', 'kicker', 'handle'],
  sample: {kicker: 'POUCA GENTE FALA', title: 'O que ninguém te conta sobre **começar**', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    const k = c.t('kicker', copy.kicker, {size: 26, ls: 5, fw: 800, pk: 'acc', fixUp: true, y: c.m});
    const t = c.t('title', copy.title, {fk: 'cond', size: 126, lh: 0.98, fw: 400, fixUp: true, em0: 'color', y: c.m + 50}); c.fit(t, c.H * 0.27, 44);
    const y = t.y + c.h(t) + 36; c.r('frame', {x: c.m - 10, y: y - 10, w: c.cw + 20, h: c.H - y - c.m - 30, radius: 26, pk: 'alt'});
    c.i('photo', {x: c.m, y, w: c.cw, h: c.H - y - c.m - 50, radius: 18});
    c.t('brand', copy.handle, {y: c.H - c.m - 14, size: 22, pk: 'mut'}); }},
{id: 'fa-comparativo-vs', name: 'Comparativo: o que diz × o que quer dizer', group: FA, mode: 'dark', tags: 'comparativo vs dicionário tradução cliente fala educativo humor feed', fields: ['title', 'sub', 'label', 'kicker'],
  sample: {kicker: 'DICIONÁRIO DO CLIENTE', title: 'O que ele **fala**', sub: '"Está caro."', label: '"Não entendi o valor."'},
  build(c) { const {copy} = c;
    c.t('kicker', copy.kicker, {y: c.m, size: 26, ls: 5, fw: 800, pk: 'acc', fixUp: true, align: 'center'});
    const t = c.t('title', copy.title, {fk: 'cond', size: 120, lh: 1, fw: 400, fixUp: true, em0: 'bg', align: 'center', y: c.m + 50}); c.fit(t, 180, 50, 2);
    const y1 = t.y + c.h(t) + 30, ch = Math.max(160, Math.min(340, (c.H - y1 - c.m - 150) / 2)); c.r('card', {x: c.m, y: y1, w: c.cw, h: ch, radius: 26, pk: 'alt'});
    const a = c.t('body', copy.sub, {x: c.m + 40, w: c.cw - 80, size: 56, fk: 'head', fw: 700, align: 'center', pk: 'fg', y: y1 + 30}); c.fit(a, ch - 40, 26); a.y = y1 + (ch - c.h(a)) / 2;
    const vy = y1 + ch + 14; c.r('vs', {shape: 'ellipse', x: c.W / 2 - 42, y: vy, w: 84, h: 84, pk: 'acc'}); c.t('cta-text', 'VS', {x: c.W / 2 - 42, w: 84, y: vy + 22, size: 38, align: 'center', pk: 'on', fk: 'black', fw: 400});
    const y2 = vy + 98; c.r('card', {x: c.m, y: y2, w: c.cw, h: ch, radius: 26, pk: 'acc'});
    const b = c.t('body', copy.label, {x: c.m + 40, w: c.cw - 80, size: 56, fk: 'head', fw: 800, align: 'center', pk: 'on', y: y2 + 30}); c.fit(b, ch - 40, 26); b.y = y2 + (ch - c.h(b)) / 2; }},
{id: 'fa-infografico-rotulos', name: 'Infográfico com rótulos e botão', group: FA, mode: 'dark', tags: 'infográfico mapa rótulos anúncio fase etapa guia gratuito cta meta', fields: ['kicker', 'tag', 'title', 'items', 'sub', 'button', 'handle'],
  sample: {kicker: 'FASE 1', tag: 'O mapa do seu negócio', title: 'Seu negócio precisa de um **mapa.**', items: '75 caminhos\n65 rotas possíveis\n8 etapas', sub: 'Entenda onde você está hoje e descubra o próximo passo.', button: 'Acesse grátis', handle: 'Sua Marca'},
  build(c) { const {copy} = c;
    c.t('kicker', copy.kicker, {y: c.m - 30, size: 26, ls: 5, pk: 'mut', fixUp: true, w: 300});
    const tw = Math.min(560, copy.tag.length * 22 + 70); c.r('pill', {x: c.m, y: c.m + 20, w: tw, h: 70, radius: 35, pk: 'none', pks: 'acc', stroke: '#fff', strokeW: 3}); c.t('muted', copy.tag, {x: c.m + 20, w: tw - 40, y: c.m + 36, size: 28, align: 'center', pk: 'fg', fw: 600});
    c.t('muted', '★★★★★', {x: c.W - c.m - 320, w: 320, y: c.m + 30, size: 42, align: 'right', pk: 'acc'});
    const t = c.t('title', copy.title, {fk: 'head', size: 88, lh: 1.08, fw: 400, em0: 'color', y: c.m + 130, w: c.cw * 0.9}); c.fit(t, c.H * 0.2, 40);
    const cy = t.y + c.h(t) + 30, d = Math.min(c.cw * 0.9, c.H - cy - 260); c.r('ring', {shape: 'ellipse', x: c.m + 10, y: cy, w: d, h: d, pk: 'none', stroke: '#fff', strokeW: 10, pks: 'acc'});
    c.r('ring2', {shape: 'ellipse', x: c.m + 10 + d * 0.18, y: cy + d * 0.18, w: d * 0.64, h: d * 0.64, pk: 'alt'});
    (copy.items || []).slice(0, 3).forEach((it, i) => { const bx = i === 1 ? c.W - c.m - 360 : c.m + (i === 0 ? 0 : 60), by = cy + (i === 0 ? d * 0.42 : i === 1 ? d * 0.05 : d * 0.74); c.r('callout', {x: bx, y: by, w: 360, h: 66, radius: 8, pk: 'line'}); c.t('body', it, {x: bx + 14, w: 332, y: by + 14, size: 30, pk: 'fg'}); });
    const s = c.t('body', copy.sub, {x: c.W - c.m - 400, w: 400, size: 28, lh: 1.3, pk: 'mut', y: cy + d * 0.5}); c.fit(s, 200, 20);
    c.t('title', copy.handle, {y: c.H - c.m - 40, size: 54, fk: 'black', fw: 400, pk: 'fg', w: 400});
    const bw = 380; c.r('cta-fill', {x: c.W - c.m - bw, y: c.H - c.m - 100, w: bw, h: 84, radius: 4, pk: 'acc'}); c.t('cta-text', copy.button, {x: c.W - c.m - bw, w: bw, y: c.H - c.m - 80, size: 34, align: 'center', pk: 'on', fw: 700}); }},
{id: 'fa-titulo-misto-pilula', name: 'Título misto com pílula e recorte', group: FA, mode: 'light', tags: 'anúncio título misto destaque pílula recorte halftone crm gestor oferta teste grátis', fields: ['title', 'sub', 'handle'],
  sample: {title: 'procura-se\n**gestor de tráfego**\npara testar grátis\num sistema novo', sub: 'transforme leads em vendas', handle: 'Sua Marca'},
  build(c) { const {copy} = c;
    const t = c.t('title', copy.title, {fk: 'head', size: 92, lh: 1.08, fw: 500, align: 'center', fixUp: false, em0: 'color', y: c.m - 10}); c.fit(t, c.H * 0.34, 40);
    const sw = Math.min(c.cw, copy.sub.length * 24 + 80), sx = (c.W - sw) / 2, sy = t.y + c.h(t) + 24; c.r('pill', {x: sx, y: sy, w: sw, h: 110, radius: 55, pk: 'acc'});
    const s = c.t('body', copy.sub, {x: sx + 20, w: sw - 40, y: sy + 22, size: 44, fw: 700, align: 'center', pk: 'on', lh: 1.1}); c.fit(s, 70, 22);
    const py = sy + 150; c.i('cutout', {x: c.m - 30, y: py, w: c.cw * 0.72, h: c.H - py - c.m + 10});
    c.t('title', copy.handle, {x: c.W - c.m - 360, w: 360, y: c.H - c.m - 40, size: 46, fk: 'head', fw: 800, align: 'right', pk: 'fg'}); }},
{id: 'fa-faixa-topo-foto-cta', name: 'Faixa de oferta, foto e barra de ação', group: FA, mode: 'dark', tags: 'anúncio oferta grátis promoção foto faixa cta pedir agora benefício meta', fields: ['kicker', 'title', 'num', 'button', 'label', 'sub'],
  sample: {kicker: 'Sua Marca + Parceiro', title: 'Agora sua empresa tem', num: 'BRINDE GRÁTIS por 1 ano', button: 'CONTRATE AGORA', label: 'Somente CNPJ', sub: '*Condições do exemplo: troque pelas reais e confirme.'},
  build(c) { const {copy} = c, th = Math.round(c.H * 0.38);
    c.r('top', {x: 0, y: 0, w: c.W, h: th, pk: 'alt'});
    const kw = Math.min(c.cw, copy.kicker.length * 20 + 60); c.r('chip', {x: (c.W - kw) / 2, y: c.m - 30, w: kw, h: 62, radius: 10, pk: 'none', pks: 'fg', stroke: '#fff', strokeW: 3}); c.t('muted', copy.kicker, {x: (c.W - kw) / 2, w: kw, y: c.m - 16, size: 28, align: 'center', pk: 'fg', fw: 600});
    const t = c.t('body', copy.title, {size: 56, align: 'center', pk: 'fg', y: c.m + 60, fw: 400}); c.fit(t, 80, 28, 1);
    const n = c.t('title', copy.num, {fk: 'head', size: 112, lh: 1, align: 'center', pk: 'acc', fw: 900, fixUp: true, y: t.y + c.h(t) + 12}); c.fit(n, th - (t.y + c.h(t)) - 30, 40, 2);
    c.i('photo', {x: 0, y: th, w: c.W, h: c.H - th - 190});
    const by = c.H - 190; c.r('cta-fill', {x: 0, y: by, w: c.W, h: 100, pk: 'acc'}); c.t('cta-text', copy.button, {x: c.m, w: 600, y: by + 26, size: 40, ls: 8, pk: 'on', fw: 800, fixUp: true});
    c.r('badge', {x: c.W - c.m - 250, y: by + 20, w: 250, h: 60, radius: 8, pk: 'bg'}); c.t('muted', copy.label, {x: c.W - c.m - 250, w: 250, y: by + 32, size: 26, align: 'center', pk: 'fg', fw: 700});
    c.r('bar', {x: 0, y: by + 100, w: c.W, h: 90, pk: 'sec'}); c.t('body', copy.sub, {x: c.m, w: c.cw, y: by + 124, size: 24, pk: 'inv'}); }},
{id: 'fa-foto-data-destaque', name: 'Foto com data e horário em destaque', group: FA, mode: 'dark', tags: 'lançamento data hora aula evento live promoção black foto pessoas feed', fields: ['title', 'num', 'kicker'],
  sample: {kicker: 'COMEÇA EM', title: 'Promoção **absurda**', num: '16/10 · 08h'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H}); c.r('overlay', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: SHADE(0.15, 0.8)});
    const t = c.t('title', copy.title, {fk: 'head', size: 96, lh: 1, fw: 800, em0: 'color', align: 'center', y: c.m}); c.fit(t, 260, 40);
    c.t('muted', copy.kicker, {size: 28, ls: 6, fw: 800, pk: 'acc', fixUp: true, align: 'center', y: c.H - c.m - 190});
    const n = c.t('title', copy.num, {fk: 'black', size: 150, lh: 1, fw: 400, pk: 'acc', align: 'center', fixUp: true, y: c.H - c.m - 150}); c.fit(n, 150, 50, 1); }},
{id: 'fa-ao-vivo-destaque', name: 'Ao vivo com foto e números em destaque', group: FA, mode: 'dark', tags: 'ao vivo live aula webinar evento vagas limitadas destaque amarelo número foto', fields: ['kicker', 'title', 'sub', 'button', 'date'],
  sample: {kicker: 'AO VIVO', title: 'Como eu faço isso com **25% de entrada** e o restante em **30x**', sub: 'Tema de exemplo', button: 'VAGAS LIMITADAS', date: '18/05 · 12:00'},
  build(c) { const {copy} = c, ph = Math.round(c.H * 0.5);
    c.i('photo', {x: 0, y: 0, w: c.W, h: ph}); c.r('overlay', {x: 0, y: ph * 0.5, w: c.W, h: ph * 0.5, pk: 'none', grad: SHADE(0, 0.7)});
    c.r('live', {shape: 'ellipse', x: c.m, y: c.m - 20, w: 26, h: 26, pk: 'acc'}); c.t('kicker', copy.kicker, {x: c.m + 40, y: c.m - 24, size: 30, fw: 800, ls: 3, fixUp: true, w: 400});
    c.t('muted', copy.date, {x: c.W - c.m - 420, w: 420, y: c.m - 22, size: 26, align: 'right', pk: 'fg'});
    const t = c.t('title', copy.title, {fk: 'head', size: 78, lh: 1.1, fw: 800, em0: 'color', y: ph + 40}); c.fit(t, c.H - ph - 200, 34);
    c.t('muted', copy.sub, {size: 26, pk: 'mut', y: t.y + c.h(t) + 14, w: c.cw - 80});
    c.t('muted', copy.button, {y: c.H - c.m - 14, size: 28, fw: 800, ls: 3, fixUp: true, pk: 'fg', w: 700}); faDot(c, c.W - c.m - 60, c.H - c.m - 40, 60, '↓', 'none'); }},
{id: 'fa-aviso-cartao-hora', name: 'Aviso em cartão com sombra e horário', group: FA, mode: 'dark', tags: 'aviso adiada mudança horário aula live lembrete cartão sombra tipografia grande urgente', fields: ['title', 'num', 'sub'],
  sample: {title: 'Aula adiada\namanhã (terça)', num: '19H', sub: ''},
  build(c) { const {copy} = c, x = 120, w = c.W - 240, y = c.H * 0.14, h = c.H * 0.7;
    c.r('shadow', {x: x + 36, y: y + 36, w, h, radius: 44, pk: 'acc'}); c.r('card', {x, y, w, h, radius: 44, pk: 'fg'});
    const t = c.t('title', copy.title, {fk: 'black', size: 112, lh: 1, fw: 400, fixUp: true, pk: 'bg', x: x + 50, w: w - 100, y: y + 60}); c.fit(t, h * 0.4, 44, 3);
    const n = c.t('title', copy.num, {fk: 'black', size: 330, lh: 0.9, fw: 400, fixUp: true, pk: 'bg', x: x + 50, w: w - 100, y: t.y + c.h(t) + 8}); c.fit(n, h * 0.42, 80, 1);
    c.r('bar', {x: x + 50, y: y + h - 90, w: w - 100, h: 36, pk: 'acc'}); }},
{id: 'fa-aviso-cartao-pilula', name: 'Aviso em cartão com pílula e frase gigante', group: FA, mode: 'dark', tags: 'últimas vagas é amanhã urgência escassez aviso cartão pílula tipografia gigante feed story', fields: ['kicker', 'title', 'sub'],
  sample: {kicker: 'É AMANHÃ', title: 'ÚLTIMAS\nVAGAS', sub: ''},
  build(c) { const {copy} = c, x = 120, w = c.W - 240, y = c.H * 0.14, h = c.H * 0.7;
    c.r('shadow', {x: x + 36, y: y + 36, w, h, radius: 44, pk: 'acc'}); c.r('card', {x, y, w, h, radius: 44, pk: 'fg'});
    const pw = Math.min(w - 120, copy.kicker.length * 40 + 100); c.r('pill', {x: x + (w - pw) / 2, y: y + 50, w: pw, h: 110, radius: 22, pk: 'acc'}); c.t('cta-text', copy.kicker, {x: x + (w - pw) / 2, w: pw, y: y + 76, size: 60, align: 'center', fk: 'black', fw: 400, fixUp: true, pk: 'on'});
    const t = c.t('title', copy.title, {fk: 'black', size: 230, lh: 0.95, fw: 400, fixUp: true, pk: 'bg', x: x + 40, w: w - 80, y: y + 200}); c.fit(t, h - 330, 70, 3); t.y = y + 200 + Math.max(0, (h - 330 - c.h(t)) / 2);
    c.r('bar', {x: x + 50, y: y + h - 80, w: w - 100, h: 36, pk: 'acc'}); }},
{id: 'fa-retro-molduras', name: 'Retrô em molduras empilhadas', group: FA, mode: 'light', tags: 'retrô vintage live selo molduras empilhado divertido evento maratona', fields: ['title', 'label', 'kicker', 'sub', 'num'],
  sample: {title: 'LIVE', label: 'INFINITA', kicker: 'com a', sub: 'SUA MARCA', num: '16 HORAS'},
  build(c) { const {copy} = c, x = 60, w = c.W - 120;
    c.r('f1', {x: 30, y: 30, w: c.W - 60, h: c.H - 60, radius: 50, pk: 'none', pks: 'fg', stroke: '#000', strokeW: 6}); c.r('f2', {x: 54, y: 54, w: c.W - 108, h: c.H - 108, radius: 40, pk: 'none', pks: 'acc', stroke: '#000', strokeW: 3});
    const b = c.H - 108 - 60, u = b / 10;
    c.r('b1', {x: x + 30, y: 90, w: w - 60, h: u * 3, radius: 36, pk: 'acc'}); const a = c.t('title', copy.title, {fk: 'black', size: 260, lh: 1, fw: 400, fixUp: true, pk: 'on', align: 'center', x: x + 30, w: w - 60, y: 90}); c.fit(a, u * 3 - 10, 60, 1); a.y = 90 + (u * 3 - c.h(a)) / 2;
    c.r('b2', {x: x, y: 90 + u * 3 + 14, w, h: u * 2.6, radius: 36, pk: 'fg'}); const l = c.t('title', copy.label, {fk: 'black', size: 200, lh: 1, fw: 400, fixUp: true, pk: 'bg', align: 'center', x: x + 20, w: w - 40, y: 90 + u * 3 + 14}); c.fit(l, u * 2.6 - 10, 50, 1); l.y = 90 + u * 3 + 14 + (u * 2.6 - c.h(l)) / 2;
    const ky = 90 + u * 5.6 + 24; c.r('b3', {x: x + 200, y: ky, w: w - 400, h: 60, radius: 30, pk: 'acc'}); c.t('cta-text', copy.kicker, {x: x + 200, w: w - 400, y: ky + 12, size: 34, align: 'center', fk: 'black', fw: 400, fixUp: true, pk: 'on'});
    const sy = ky + 84; c.r('b4', {x: x + 10, y: sy, w: w - 20, h: u * 2, radius: 40, pk: 'alt', pks: 'fg', stroke: '#000', strokeW: 3}); const s2 = c.t('title', copy.sub, {fk: 'black', size: 160, lh: 1, fw: 400, fixUp: true, pk: 'acc', align: 'center', x: x + 30, w: w - 60, y: sy}); c.fit(s2, u * 2 - 16, 44, 1); s2.y = sy + (u * 2 - c.h(s2)) / 2;
    const ny = sy + u * 2 + 20; c.r('b5', {x: x + 150, y: ny, w: w - 300, h: 84, radius: 40, pk: 'acc'}); const nn = c.t('cta-text', copy.num, {x: x + 150, w: w - 300, y: ny + 12, size: 54, align: 'center', fk: 'black', fw: 400, fixUp: true, pk: 'on'}); c.fit(nn, 64, 24, 1); }},
{id: 'fa-vaga-checklist', name: 'Vaga ou oferta com checklist e painel de ação', group: FA, mode: 'dark', tags: 'vaga contratando recrutamento checklist lista requisitos oferta serviço painel cta processo seletivo', fields: ['kicker', 'title', 'sub', 'items', 'label', 'button', 'handle'],
  sample: {kicker: 'NOME DA EMPRESA', title: 'ESTAMOS\n**CONTRATANDO**', sub: 'Nome da vaga ou da oferta', items: 'Requisito ou benefício um\nRequisito ou benefício dois\nRequisito ou benefício três\nRequisito ou benefício quatro', label: 'Descrição curta da empresa', button: 'PARTICIPE DO PROCESSO', handle: 'Cadastre-se no link abaixo'},
  build(c) { const {copy} = c;
    c.r('logo', {shape: 'ellipse', x: c.m - 20, y: c.m - 30, w: 110, h: 110, pk: 'acc'}); c.t('title', copy.kicker, {x: c.m + 110, y: c.m - 6, w: c.cw - 110, size: 56, fk: 'head', fw: 800, fixUp: true});
    const t = c.t('title', copy.title, {fk: 'black', size: 170, lh: 0.95, fw: 400, fixUp: true, em0: 'color', y: c.m + 100}); c.fit(t, c.H * 0.28, 60, 2);
    const py = t.y + c.h(t) + 20; c.r('role', {x: c.m - 10, y: py, w: c.cw + 20, h: 100, radius: 22, pk: 'fg'}); const r = c.t('title', copy.sub, {fk: 'head', size: 54, fw: 800, pk: 'bg', x: c.m + 20, w: c.cw - 40, y: py + 20, fixUp: false}); c.fit(r, 64, 24, 1);
    const nIt = Math.min(5, (copy.items || []).length || 1), y0 = py + 140, step = Math.max(82, Math.min(112, (c.H - 210 - 150 - y0) / nIt)); let y = y0; (copy.items || []).slice(0, 5).forEach(it => { c.r('ck', {shape: 'ellipse', x: c.m, y, w: 62, h: 62, pk: 'acc'}); c.t('cta-text', '✓', {x: c.m, w: 62, y: y + 8, size: 40, align: 'center', pk: 'on', fk: 'black', fw: 400}); const tx = c.t('body', it, {x: c.m + 90, w: c.cw - 90, y: y + 10, size: 38, pk: 'fg'}); c.fit(tx, 50, 22, 1); y += step; });
    c.r('line', {x: c.m, y: y + 8, w: c.cw, h: 2, pk: 'line'}); c.t('muted', copy.label, {y: y + 30, size: 28, align: 'center', pk: 'fg'});
    const ph = 210; c.r('panel', {x: 0, y: c.H - ph, w: c.W, h: ph, radius: 40, pk: 'acc'});
    const b = c.t('cta-text', copy.button, {x: c.m, w: c.cw, y: c.H - ph + 44, size: 52, fw: 800, align: 'center', pk: 'on', fixUp: true}); c.fit(b, 70, 24, 1); c.t('muted', copy.handle, {x: c.m, w: c.cw, y: c.H - ph + 126, size: 38, align: 'center', pk: 'on'}); }},
{id: 'fa-evento-story', name: 'Evento: save the date com serviço, data e local', group: FA, mode: 'dark', tags: 'evento workshop curso story save the date data local ingressos palestrante convite lançamento', fields: ['kicker', 'tag', 'title', 'label', 'sub', 'date', 'handle', 'button'],
  sample: {kicker: 'NOME DO CURSO', tag: 'SAVE THE DATE', title: 'LABORATÓRIO\nde LUZ', label: 'WORKSHOP DE EXEMPLO', sub: 'COM NOME DO CONVIDADO', date: 'SÁBADO\n31 DE OUTUBRO\n16H ÀS 21H', handle: 'LOCAL DO EVENTO\nEndereço de exemplo', button: 'INGRESSOS EM BREVE | VAGAS LIMITADAS'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H}); c.r('overlay', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: SHADE(0.45, 0.75)});
    c.t('title', copy.kicker, {y: c.m - 30, size: 50, fk: 'cond', fw: 400, fixUp: true, align: 'center', w: c.cw});
    const tw = Math.min(c.cw * 0.7, copy.tag.length * 30 + 100), ty = c.H * 0.2; c.r('tag', {x: (c.W - tw) / 2, y: ty, w: tw, h: 90, radius: 14, pk: 'none', pks: 'acc', stroke: '#fff', strokeW: 3}); c.t('muted', copy.tag, {x: (c.W - tw) / 2, w: tw, y: ty + 22, size: 44, align: 'center', fw: 800, fixUp: true, pk: 'fg'});
    const t = c.t('title', copy.title, {fk: 'head', size: 150, lh: 0.96, fw: 800, fixUp: true, align: 'center', em0: 'color', y: ty + 130}); c.fit(t, c.H * 0.26, 54);
    const l = c.t('muted', copy.label, {size: 40, ls: 8, align: 'center', fixUp: true, pk: 'fg', y: t.y + c.h(t) + 30}); c.fit(l, 100, 22, 2);
    const sw = Math.min(c.cw, copy.sub.length * 30 + 80); c.r('who', {x: (c.W - sw) / 2, y: l.y + c.h(l) + 20, w: sw, h: 70, radius: 35, pk: 'alt'}); c.t('muted', copy.sub, {x: (c.W - sw) / 2, w: sw, y: l.y + c.h(l) + 34, size: 32, ls: 5, align: 'center', fixUp: true, pk: 'fg', fw: 700});
    const iy = c.H - c.m - 330; c.r('ic1', {x: c.m, y: iy, w: 70, h: 70, radius: 14, pk: 'fg'}); c.r('ic2', {x: c.W / 2 + 10, y: iy, w: 70, h: 70, shape: 'ellipse', pk: 'acc'});
    const d = c.t('body', copy.date, {x: c.m + 90, w: c.cw / 2 - 100, y: iy - 6, size: 34, lh: 1.15, pk: 'fg', fw: 700}); c.fit(d, 150, 20); const p = c.t('body', copy.handle, {x: c.W / 2 + 100, w: c.cw / 2 - 100, y: iy - 6, size: 32, lh: 1.2, pk: 'fg', fw: 700}); c.fit(p, 150, 20);
    c.r('sep', {x: c.W / 2 - 10, y: iy, w: 2, h: 140, pk: 'line'});
    const by = c.H - c.m - 120; c.r('strip', {x: c.m, y: by, w: c.cw, h: 82, radius: 20, pk: 'none', pks: 'acc', stroke: '#fff', strokeW: 3}); const b = c.t('muted', copy.button, {x: c.m + 16, w: c.cw - 32, y: by + 22, size: 30, ls: 3, align: 'center', fixUp: true, pk: 'fg', fw: 700}); c.fit(b, 40, 16, 1); }},
{id: 'fa-poster-moldura-tag', name: 'Pôster em moldura com etiquetas', group: FA, mode: 'dark', tags: 'pôster moldura tech cartaz referência salvar etiqueta contador carrossel arte', fields: ['title', 'sub', 'tag', 'num', 'kicker'],
  sample: {tag: '//12', title: 'NOME DA\nSÉRIE', sub: 'linha de apoio em fonte técnica', num: '13/20', kicker: 'hashtag'},
  build(c) { const {copy} = c, w = c.W * 0.62, x = (c.W - w) / 2, y = c.H * 0.2, h = c.H * 0.6;
    c.t('muted', copy.tag, {x: c.m, y: c.m + 10, w: 200, size: 34, pk: 'fg', fw: 700}); c.r('ul', {x: c.m, y: c.m + 54, w: 90, h: 4, pk: 'fg'});
    const nw = Math.max(150, copy.num.length * 20 + 50); c.r('cnt', {x: c.W - c.m - nw, y: c.m, w: nw, h: 66, radius: 33, pk: 'alt'}); c.t('muted', copy.num, {x: c.W - c.m - nw, w: nw, y: c.m + 14, size: 30, align: 'center', pk: 'fg', fw: 700});
    c.r('poster', {x, y, w, h, pk: 'acc'});
    const t = c.t('title', copy.title, {fk: 'black', size: 120, lh: 0.95, fw: 400, fixUp: true, pk: 'on', x: x + 30, w: w - 60, y: y + h * 0.42}); c.fit(t, h * 0.34, 36, 3);
    c.t('muted', copy.sub, {x: x + 30, w: w - 60, y: y + h - 70, size: 22, pk: 'on', fixUp: true, ls: 2});
    c.t('muted', copy.kicker, {x: c.m, y: c.H - c.m - 14, size: 38, pk: 'fg', fw: 700}); c.r('ul2', {x: c.m, y: c.H - c.m + 30, w: 150, h: 4, pk: 'fg'}); }},
{id: 'fa-titulo-tres-fotos', name: 'Título com três fotos em linha', group: FA, mode: 'dark', tags: 'verdade preço equipe pessoas três fotos título antes depois lista feed autoridade', fields: ['kicker', 'title', 'sub', 'handle'],
  sample: {kicker: 'A VERDADE', title: 'Por trás do seu **preço**', sub: 'Três pessoas, três pontos de vista.', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.t('kicker', copy.kicker, {y: c.m, size: 26, ls: 5, fw: 800, pk: 'acc', fixUp: true});
    const t = c.t('title', copy.title, {fk: 'cond', size: 190, lh: 0.95, fw: 400, fixUp: true, em0: 'color', y: c.m + 50}); c.fit(t, c.H * 0.36, 60);
    const y = t.y + c.h(t) + 40, gap = 24, w = (c.cw - 2 * gap) / 3, h = Math.min(w * 1.25, c.H - y - 240);
    [0, 1, 2].forEach(i => c.i('photo', {x: c.m + i * (w + gap), y, w, h, radius: 20}));
    const s = c.t('body', copy.sub, {y: y + h + 30, size: 34, pk: 'mut', lh: 1.3}); c.fit(s, 130, 22);
    c.t('brand', copy.handle, {y: c.H - c.m - 14, size: 22, pk: 'mut'}); }},
{id: 'fa-beneficios-2x2', name: 'Quatro benefícios em cartões (anúncio)', group: FA, mode: 'light', tags: 'benefícios anúncio serviço produto diferenciais cartões grade quatro cta meta oferta', fields: ['kicker', 'title', 'items', 'button'],
  sample: {kicker: 'POR QUE ESCOLHER', title: 'Tudo o que você precisa em **um só lugar**', items: 'Benefício um|Frase curta que explica\nBenefício dois|Frase curta que explica\nBenefício três|Frase curta que explica\nBenefício quatro|Frase curta que explica', button: 'FALE NO WHATSAPP'},
  build(c) { const {copy} = c;
    c.t('kicker', copy.kicker, {y: c.m, size: 26, ls: 5, fw: 800, pk: 'acc', fixUp: true});
    const t = c.t('title', copy.title, {fk: 'head', size: 84, lh: 1.08, fw: 800, em0: 'bg', y: c.m + 44}); c.fit(t, c.H * 0.22, 36);
    const y = t.y + c.h(t) + 36, gap = 24, w = (c.cw - gap) / 2, bh = 110, h = (c.H - y - bh - c.m - 50 - gap) / 2;
    pairs(copy.items).slice(0, 4).forEach(([a, b], i) => { const x = c.m + (i % 2) * (w + gap), yy = y + Math.floor(i / 2) * (h + gap); c.r('card', {x, y: yy, w, h, radius: 24, pk: 'alt'}); c.r('num', {shape: 'ellipse', x: x + 28, y: yy + 28, w: 56, h: 56, pk: 'acc'}); c.t('cta-text', String(i + 1), {x: x + 28, w: 56, y: yy + 38, size: 32, align: 'center', pk: 'on', fk: 'black', fw: 400});
      const ta = c.t('title', a, {fk: 'head', size: 40, fw: 800, x: x + 28, w: w - 56, y: yy + 104, lh: 1.1}); c.fit(ta, 90, 24, 2); const tb = c.t('body', b || '', {size: 28, pk: 'mut', x: x + 28, w: w - 56, y: ta.y + c.h(ta) + 8, lh: 1.25}); c.fit(tb, h - (ta.y - yy) - c.h(ta) - 30, 18); });
    const by = c.H - c.m - bh; c.r('cta-fill', {x: c.m, y: by, w: c.cw, h: bh, radius: 20, pk: 'acc'}); const bt = c.t('cta-text', copy.button, {x: c.m, w: c.cw, y: by + 30, size: 46, fw: 800, align: 'center', pk: 'on', fixUp: true, ls: 3}); c.fit(bt, 60, 22, 1); }}
);
