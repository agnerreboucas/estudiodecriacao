/* Modelos · Capas de carrossel e Carrossel editorial.
   Estrutura recriada a partir de capas de feeds de conteúdo (foto cheia com título condensado, serifado, faixa branca, fundo claro com ilustração,
   círculo de marca, legenda em caixa, vitrine, cartão com recortes, etiquetas escalonadas). Só a composição é reproduzida: posição, proporção,
   hierarquia e tipo de letra por categoria. Nenhum texto, logo, rosto ou imagem dos posts de referência entra; as cores e as fontes vêm do
   estilo ativo ou do Brand Kit, e as áreas cinza são para a sua foto ou ilustração. */
const CAPA_W = L => { const l = layoutText(Object.assign({}, L, {w: 4000})).lines[0]; return l ? Math.ceil(l.w) : 0; };
const CAPA_FIX = col => ({c1: col, c2: col, a: 0});
const CAPA_SHADE = (c, from, a) => c.r('overlay', {x: 0, y: Math.round(c.H * from), w: c.W, h: c.H - Math.round(c.H * from), pk: 'none', grad: {c1: 'rgba(0,0,0,0)', c2: 'rgba(0,0,0,' + a + ')', a: 180}});
/* faixa fina no topo: etiqueta da série à esquerda, @ no meio, data ou direitos à direita */
function capaTop(c, onP) {
  const o = {size: 19, y: 36, w: 360, ls: 0.6, fw: 500, pk: onP ? 'fg' : 'mut', fixUp: false}, cp = c.copy;
  if (cp.tag) c.t('muted', cp.tag, Object.assign({x: 48}, o));
  if (cp.handle) c.t('muted', cp.handle, Object.assign({x: (c.W - 360) / 2, align: 'center'}, o));
  if (cp.date) c.t('muted', cp.date, Object.assign({x: c.W - 48 - 360, align: 'right'}, o));
}
/* selo do perfil: círculo da marca + @ + marca de verificado */
function capaChip(c, y, center, x0) {
  const h = c.copy.handle; if (!h) return;
  const lab = c.t('muted', h, {size: 22, fw: 600, pk: 'fg', w: 700, x: 0, y: y + 8, fixUp: false}), tw = CAPA_W(lab), tot = 44 + 12 + tw + 12 + 24, x = center ? Math.round((c.W - tot) / 2) : (x0 == null ? c.m : x0);
  c.r('avatar', {shape: 'ellipse', x, y, w: 44, h: 44, pk: 'acc'}); c.r('avatar-dot', {shape: 'ellipse', x: x + 12, y: y + 12, w: 20, h: 20, pk: 'on'});
  lab.x = x + 56; lab.w = tw + 8; const tx = x + 56 + tw + 12;
  c.r('verified', {shape: 'ellipse', x: tx, y: y + 10, w: 24, h: 24, pk: 'none', grad: CAPA_FIX('#1d9bf0')});
  c.t('muted', '✓', {x: tx, y: y + 11, w: 24, align: 'center', size: 16, fw: 800, pk: 'fg'});
}
/* bloco inferior: legenda curta + título + linha de chamada, com o selo acima */
function capaBottom(c, o) {
  const cp = c.copy, al = o.align || 'center', X = 60, Wd = c.W - 120, items = [];
  let cap = null;
  if (cp.sub) { cap = c.t('body', cp.sub, {size: 24, align: al, pk: 'fg', fw: 500, x: X, w: Wd, lh: 1.25}); items.push(cap); }
  const t = c.t('title', cp.title, Object.assign({align: al, x: X, w: Wd, lh: 1}, o.title)); c.fit(t, c.H * (o.maxH || 0.34), o.min || 48); items.push(t);
  if (cp.button) items.push(c.t('body', cp.button, {size: 19, align: al, pk: 'acc', fw: 700, ls: 0.5, x: X, w: Wd, fixUp: true}));
  c.stack(items, c.H * 0.4, c.H - 64, 'bottom', 18, X, Wd);
  if (o.chip !== false) capaChip(c, items[0].y - 66, al === 'center', X);
  return {title: t, top: items[0].y};
}
const CAPA_PHOTO = c => c.i('photo', {x: 0, y: 0, w: c.W, h: c.H, brief: 'Foto do assunto da capa'});
const CAPA_SAMPLE = {tag: 'Série · Episódio 01', handle: '@seunegocio', date: '2026 ©', sub: 'Legenda curta que contextualiza o assunto', title: 'Por que as marcas estão **pagando caro** por conteúdos que parecem feitos por pessoas comuns', button: '→ Cole seus posts e descubra o que vale escalar'};
const CAPA_F = ['tag', 'handle', 'date', 'sub', 'title', 'button'];
const CAPA_ILU_SAMPLE = {tag: 'CAPA', handle: '@seunegocio', date: '', num: '01/08', title: 'Seu conteúdo ensina, mas **ajuda o cliente a escolher?**', sub: '5 tipos de conteúdo para educar quem já está comparando soluções.'};

/* ilustração + título condensado em fundo claro (ou escuro) */
function capaEditorial(c) {
  const cp = c.copy; capaTop(c, false);
  const t = c.t('title', cp.title, {fk: 'cond', fixUp: true, size: 124, lh: 0.95, fw: 400, em0: 'color', x: 60, w: c.W - 120, y: 110}); c.fit(t, c.H * 0.46, 56);
  const s = c.t('body', cp.sub, {size: 30, fw: 500, lh: 1.3, x: 60, w: 520}); c.fit(s, 200, 22);
  c.stack([t, s], 110, c.H * 0.7, 'top', 26, 60, c.W - 120);
  c.i('cutout', {x: Math.round(c.W * 0.42), y: Math.round(c.H * 0.6), w: Math.round(c.W * 0.54), h: Math.round(c.H * 0.3), brief: 'Ilustração 3D ou objeto recortado (PNG sem fundo)'});
  c.r('rule', {x: 60, y: c.H - 78, w: c.W - 120, h: 2, pk: 'line'});
  c.t('muted', cp.tag, {x: 60, y: c.H - 58, w: 300, size: 18, ls: 2, pk: 'mut', fixUp: true}); c.t('muted', cp.num, {x: c.W - 360, y: c.H - 58, w: 300, size: 18, ls: 2, align: 'right', pk: 'mut'});
}

LAYOUTS.push(
/* ===== CAPAS COM FOTO ===== */
{id: 'cap-foto-condensado', name: 'Capa · foto cheia + título condensado (centro)', group: 'Capas de carrossel', mode: 'dark', tags: 'capa carrossel foto título condensado caixa-alta destaque laranja selo gradiente', fields: CAPA_F, sample: CAPA_SAMPLE,
  build(c) { CAPA_PHOTO(c); CAPA_SHADE(c, 0.4, 0.94); capaTop(c, true); capaBottom(c, {align: 'center', title: {fk: 'cond', fixUp: true, size: 108, lh: 0.98, fw: 400, em0: 'color'}}); }},
{id: 'cap-foto-condensado-esq', name: 'Capa · foto cheia + título condensado (esquerda)', group: 'Capas de carrossel', mode: 'dark', tags: 'capa carrossel foto título condensado esquerda destaque', fields: CAPA_F, sample: CAPA_SAMPLE,
  build(c) { CAPA_PHOTO(c); CAPA_SHADE(c, 0.38, 0.95); capaTop(c, true); capaBottom(c, {align: 'left', title: {fk: 'cond', fixUp: true, size: 112, lh: 0.97, fw: 400, em0: 'color'}}); }},
{id: 'cap-foto-serifado', name: 'Capa · foto cheia + título serifado', group: 'Capas de carrossel', mode: 'dark', tags: 'capa carrossel foto serifado editorial história pessoa', fields: CAPA_F, sample: Object.assign({}, CAPA_SAMPLE, {sub: '', button: '', title: 'Como a fundadora transformou uma ideia simples em um negócio que ninguém mais poderia copiar'}),
  build(c) { CAPA_PHOTO(c); CAPA_SHADE(c, 0.36, 0.92); capaTop(c, true); capaBottom(c, {align: 'left', title: {fk: 'serif', fixUp: false, size: 92, lh: 1.03, fw: 400, em0: 'color'}, maxH: 0.38, min: 44}); }},
{id: 'cap-foto-sans', name: 'Capa · foto cheia + título em letra de texto', group: 'Capas de carrossel', mode: 'dark', tags: 'capa carrossel foto título sem caixa-alta tendência mercado', fields: CAPA_F, sample: Object.assign({}, CAPA_SAMPLE, {sub: '', button: '', title: 'As marcas pequenas já encontraram a nova grande tendência do mercado'}),
  build(c) { CAPA_PHOTO(c); CAPA_SHADE(c, 0.4, 0.9); capaTop(c, true); capaBottom(c, {align: 'left', chip: false, title: {fk: 'body', fixUp: false, size: 80, lh: 1.08, fw: 800, em0: 'color'}, maxH: 0.36, min: 44}); }},
{id: 'cap-foto-faixa-branca', name: 'Capa · foto no topo + faixa branca com título', group: 'Capas de carrossel', mode: 'light', tags: 'capa carrossel série episódio foto topo faixa título escuro nicho', fields: ['tag', 'handle', 'date', 'title'], sample: {tag: 'Série · Episódio 05', handle: '@seunegocio', date: '2026', title: 'Como produzir conteúdo no nicho de **finanças:** 4 criadores provam que conteúdo chato não existe.'},
  build(c) { const ph = Math.round(c.H * 0.63);
    c.i('photo', {x: 0, y: 0, w: c.W, h: ph, brief: 'Foto principal (pessoas ou cena)'}); c.r('band', {x: 0, y: ph, w: c.W, h: c.H - ph, pk: 'bg'});
    capaTop(c, true);
    const t = c.t('title', c.copy.title, {fk: 'body', fixUp: false, size: 68, lh: 1.1, fw: 800, em0: 'color', x: 56, w: c.W - 112, y: ph + 44}); c.fit(t, c.H - ph - 90, 36); }},
{id: 'cap-circulo-grande', name: 'Capa · sujeito sobre círculo da marca', group: 'Capas de carrossel', mode: 'dark', tags: 'capa carrossel sujeito recortado círculo marca cor perfil executivo', fields: CAPA_F, sample: Object.assign({}, CAPA_SAMPLE, {sub: 'Decodificando os melhores profissionais do mercado', title: 'Como a gestão da diretora de marketing aproximou a empresa **do dia a dia** do cliente', button: ''}),
  build(c) { c.bgRect({pk: 'bg'}); const d = Math.round(c.W * 0.86);
    c.r('circle', {shape: 'ellipse', x: Math.round((c.W - d) / 2), y: 90, w: d, h: d, pk: 'acc'});
    c.i('cutout', {x: 110, y: 110, w: c.W - 220, h: Math.round(c.H * 0.62), brief: 'Pessoa recortada (PNG sem fundo)'});
    CAPA_SHADE(c, 0.52, 0.95); capaTop(c, true); capaBottom(c, {align: 'center', title: {fk: 'cond', fixUp: true, size: 96, lh: 0.98, fw: 400, em0: 'color'}, maxH: 0.26, min: 44}); }},
{id: 'cap-circulo-inset', name: 'Capa · foto cheia + círculo de detalhe', group: 'Capas de carrossel', mode: 'dark', tags: 'capa carrossel foto círculo detalhe inserido produto esporte', fields: CAPA_F, sample: Object.assign({}, CAPA_SAMPLE, {sub: '', button: '', title: 'Como a marca transformou **um detalhe** do produto em um item de desejo'}),
  build(c) { CAPA_PHOTO(c); CAPA_SHADE(c, 0.42, 0.93);
    c.r('ring', {shape: 'ellipse', x: c.W - 60 - 292, y: 80, w: 292, h: 292, pk: 'fg'}); c.i('photo', {x: c.W - 60 - 280, y: 86, w: 280, h: 280, radius: 140, brief: 'Foto de detalhe (círculo)'});
    capaTop(c, true); capaBottom(c, {align: 'center', title: {fk: 'cond', fixUp: true, size: 104, lh: 0.98, fw: 400, em0: 'color'}}); }},
{id: 'cap-split-duas', name: 'Capa · duas fotos lado a lado', group: 'Capas de carrossel', mode: 'dark', tags: 'capa carrossel comparação duas pessoas debate duelo divisão', fields: CAPA_F, sample: Object.assign({}, CAPA_SAMPLE, {sub: '', button: '', title: 'Como o **último debate** terminou antes mesmo de começar'}),
  build(c) { const h = Math.round(c.W / 2); c.i('photo', {x: 0, y: 0, w: h, h: c.H, brief: 'Foto da pessoa A'}); c.i('photo', {x: h, y: 0, w: c.W - h, h: c.H, brief: 'Foto da pessoa B'});
    c.r('divider', {x: h - 2, y: 0, w: 4, h: c.H, pk: 'fg'}); CAPA_SHADE(c, 0.5, 0.95); capaTop(c, true); capaBottom(c, {align: 'center', title: {fk: 'cond', fixUp: true, size: 100, lh: 0.98, fw: 400, em0: 'color'}, maxH: 0.28, min: 44}); }},
{id: 'cap-duas-fotos', name: 'Capa · duas fotos empilhadas com margem', group: 'Capas de carrossel', mode: 'light', tags: 'capa carrossel duas fotos bastidores evento margem branca', fields: ['tag', 'handle', 'date'], sample: {tag: '', handle: '@seunegocio', date: '2026'},
  build(c) { const g = 14, hh = Math.round((c.H - 3 * g) / 2); c.bgRect({pk: 'bg'});
    c.i('photo', {x: g, y: g, w: c.W - 2 * g, h: hh, brief: 'Foto 1'}); c.i('photo', {x: g, y: 2 * g + hh, w: c.W - 2 * g, h: hh, brief: 'Foto 2'}); capaTop(c, false); }},
{id: 'cap-grade-4', name: 'Capa · grade de 4 fotos + título', group: 'Capas de carrossel', mode: 'dark', tags: 'capa carrossel grade colagem quatro fotos equipe bastidores', fields: ['tag', 'handle', 'date', 'title'], sample: {tag: 'Série · Episódio 02', handle: '@seunegocio', date: '2026', title: 'Quatro rotinas que **mudaram** o jeito de produzir conteúdo'},
  build(c) { const g = 10, gh = Math.round(c.H * 0.64), cw = Math.round((c.W - 3 * g) / 2), ch = Math.round((gh - 3 * g) / 2); c.bgRect({pk: 'bg'});
    [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([i, j]) => c.i('photo', {x: g + i * (cw + g), y: g + j * (ch + g), w: cw, h: ch, brief: 'Foto ' + (j * 2 + i + 1)})); capaTop(c, true);
    const t = c.t('title', c.copy.title, {fk: 'cond', fixUp: true, size: 110, lh: 0.97, fw: 400, em0: 'color', x: 56, w: c.W - 112, y: gh + 30}); c.fit(t, c.H - gh - 80, 50); }},
{id: 'cap-foto-limpa', name: 'Capa · foto limpa só com o cabeçalho', group: 'Capas de carrossel', mode: 'dark', tags: 'capa carrossel foto cena sem título bastidores imagem forte', fields: ['tag', 'handle', 'date', 'button'], sample: {tag: 'Série · Episódio 03', handle: '@seunegocio', date: '2026 ©', button: 'ARRASTE →'},
  build(c) { CAPA_PHOTO(c); CAPA_SHADE(c, 0.8, 0.5); capaTop(c, true); if (c.copy.button) c.t('muted', c.copy.button, {x: 60, y: c.H - 70, w: c.W - 120, size: 22, ls: 3, align: 'right', pk: 'fg', fw: 600}); }},
{id: 'cap-legenda-caixa', name: 'Capa de vídeo · legenda em caixa colorida', group: 'Capas de carrossel', mode: 'dark', tags: 'capa reels vídeo legenda caixa amarela pergunta frame', fields: ['title'], sample: {title: 'por que viralizar no instagram está tão difícil em 2026?'},
  build(c) { CAPA_PHOTO(c); c.r('veil', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: {c1: 'rgba(0,0,0,0.12)', c2: 'rgba(0,0,0,0.3)', a: 180}});
    const t = c.t('title', c.copy.title, {fk: 'body', fixUp: false, size: 62, fw: 700, lh: 1.16, align: 'center', pk: 'on', x: 150, w: c.W - 300, y: Math.round(c.H * 0.58)}); c.fit(t, 360, 34);
    const lay = layoutText(t), mw = Math.ceil(Math.max.apply(null, lay.lines.map(l => l.w))), bw = Math.min(c.W - 140, mw + 80), bh = lay.h + 56, bx = Math.round((c.W - bw) / 2), by = t.y - 28;
    const box = c.r('capbox', {x: bx, y: by, w: bw, h: bh, radius: 26, pk: 'acc'}); c.layers.splice(c.layers.indexOf(box), 1); c.layers.splice(c.layers.indexOf(t), 0, box); t.x = bx + 40; t.w = bw - 80; }},
{id: 'cap-legenda-central', name: 'Capa de vídeo · legenda grande no centro', group: 'Capas de carrossel', mode: 'dark', tags: 'capa reels vídeo legenda central frase destaque edição', fields: ['title', 'tag'], sample: {title: 'nossas atuais obsessões no mundo do marketing', tag: '[edição #01] pedi que adorem nos seguir'},
  build(c) { CAPA_PHOTO(c); c.r('veil', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: {c1: 'rgba(0,0,0,0.38)', c2: 'rgba(0,0,0,0.5)', a: 180}});
    const t = c.t('title', c.copy.title, {fk: 'body', fixUp: false, size: 92, fw: 700, lh: 1.1, align: 'center', x: 90, w: c.W - 180}); c.fit(t, c.H * 0.5, 44); c.stack([t], c.H * 0.2, c.H * 0.8, 'middle', 0, 90, c.W - 180);
    if (c.copy.tag) c.t('muted', c.copy.tag, {x: 60, y: c.H - 90, w: c.W - 120, size: 22, align: 'center', pk: 'fg', fw: 500}); }},
{id: 'cap-halftone-etiquetas', name: 'Capa · foto P&B com título em etiquetas', group: 'Capas de carrossel', mode: 'dark', tags: 'capa carrossel foto preto e branco granulada etiquetas palavra gigante', fields: ['tag', 'date', 'title', 'kicker', 'sub'], sample: {tag: '', date: '2026', title: 'Por que pessoas criativas\npostam', kicker: 'DIFERENTE', sub: 'Enquanto todo mundo copia a trend, elas reescrevem a trend do próprio jeito.'},
  build(c) { const ph = c.i('photo', {x: 0, y: 0, w: c.W, h: c.H, brief: 'Foto (fica em preto e branco)'}); ph.filter = 'grayscale(1) contrast(1.35)'; CAPA_SHADE(c, 0.5, 0.7); capaTop(c, true);
    const lines = String(c.copy.title).split('\n').filter(Boolean); let y = Math.round(c.H * 0.3);
    lines.forEach(ln => { const t = c.t('title', ln, {fk: 'cond', fixUp: true, size: 84, fw: 400, lh: 1.05, pk: 'rev', x: 0, w: 1000, y: y + 8}); while (CAPA_W(t) > c.W - 52 - 44 - 48 && t.size > 30) t.size -= 2; const w = CAPA_W(t), bx = 52;
      const box = c.r('label', {x: bx, y, w: w + 44, h: 106, pk: 'fg'}); c.layers.splice(c.layers.indexOf(box), 1); c.layers.splice(c.layers.indexOf(t), 0, box); t.x = bx + 22; t.w = w + 10; y += 106; });
    const k = c.t('display', c.copy.kicker, {fk: 'cond', fixUp: true, size: 320, fw: 400, lh: 0.9, pk: 'acc', x: 40, w: c.W - 80, y: y + 6}); c.fit(k, 330, 90, 1);
    if (c.copy.sub) c.t('body', c.copy.sub, {size: 28, fw: 600, x: 56, w: c.W - 112, y: c.H - 150, pk: 'fg', lh: 1.25}); }},
{id: 'cap-print-post', name: 'Capa · título serifado sobre faixa escura + foto', group: 'Capas de carrossel', mode: 'dark', tags: 'capa carrossel print post série episódio serifado foto abaixo', fields: ['tag', 'handle', 'title'], sample: {tag: 'Série · Episódio 06', handle: '@seunegocio', title: 'Como o chef transformou os erros dos outros em uma **máquina infinita** de conteúdo'},
  build(c) { const ph = Math.round(c.H * 0.34); c.bgRect({pk: 'bg'}); c.i('photo', {x: 0, y: ph, w: c.W, h: c.H - ph, brief: 'Foto da pessoa'}); capaTop(c, true);
    const t = c.t('title', c.copy.title, {fk: 'serif', fixUp: false, size: 74, lh: 1.08, fw: 400, em0: 'color', x: 56, w: c.W - 112, y: 92}); c.fit(t, ph - 118, 40);
    CAPA_SHADE(c, 0.8, 0.55); capaChip(c, c.H - 96, false, 56); }},
{id: 'cap-objeto-topo', name: 'Capa · título no topo + produto no centro', group: 'Capas de carrossel', mode: 'light', tags: 'capa carrossel produto objeto cutout título topo nome mudou', fields: ['tag', 'handle', 'date', 'title', 'sub'], sample: {tag: '', handle: '@seunegocio', date: '2026', title: 'A marca trocou de **nome.**', sub: 'No Brasil, são 2 milhões de unidades por mês. Em outro país, ela tem outro nome.'},
  build(c) { capaTop(c, false); const t = c.t('title', c.copy.title, {fk: 'cond', fixUp: true, size: 150, lh: 0.94, fw: 400, em0: 'color', x: 56, w: c.W - 112, y: 100}); c.fit(t, c.H * 0.3, 70);
    c.i('cutout', {x: 100, y: t.y + c.h(t) + 20, w: c.W - 200, h: Math.round(c.H * 0.4), brief: 'Produto ou objeto recortado'});
    c.t('body', c.copy.sub, {size: 30, fw: 600, lh: 1.25, x: 56, w: c.W - 112, y: c.H - 150, pk: 'fg'}); }},
/* ===== EDITORIAL ===== */
{id: 'cap-editorial-claro', name: 'Capa editorial · título condensado + ilustração (claro)', group: 'Capas de carrossel', mode: 'light', tags: 'capa carrossel editorial fundo claro ilustração 3d título condensado subtítulo', fields: ['tag', 'handle', 'date', 'num', 'title', 'sub'], sample: CAPA_ILU_SAMPLE, build: capaEditorial},
{id: 'cap-editorial-escuro', name: 'Capa editorial · título condensado + ilustração (escuro)', group: 'Capas de carrossel', mode: 'dark', tags: 'capa carrossel editorial fundo escuro ilustração título condensado', fields: ['tag', 'handle', 'date', 'num', 'title', 'sub'], sample: CAPA_ILU_SAMPLE, build: capaEditorial},
{id: 'cap-notas', name: 'Capa · print de aplicativo de notas', group: 'Capas de carrossel', mode: 'light', tags: 'capa carrossel notas celular confissão opinião marca-texto', fields: ['kicker', 'title', 'sub', 'date'], sample: {kicker: 'Isso pode me cancelar, mas lá vai:', title: 'Eu **amo** o novo algoritmo do Instagram.', sub: 'E o motivo não é o que você imagina…', date: 'Hoje'},
  build(c) { c.t('muted', '‹ Notas', {x: 56, y: 70, w: 300, size: 30, pk: 'acc', fw: 600}); c.t('muted', c.copy.date, {x: c.W - 356, y: 74, w: 300, size: 24, align: 'right', pk: 'mut'});
    const k = c.t('body', c.copy.kicker, {size: 42, fw: 500, pk: 'mut', lh: 1.25, x: 56, w: c.W - 112}), t = c.t('title', c.copy.title, {fk: 'body', fixUp: false, size: 96, fw: 800, lh: 1.15, em0: 'bg', x: 56, w: c.W - 112}); c.fit(t, c.H * 0.4, 48);
    const s = c.t('body', c.copy.sub, {size: 38, fw: 500, pk: 'fg', lh: 1.3, x: 56, w: c.W - 112}); c.stack([k, t, s], 200, c.H - 120, 'top', 28, 56, c.W - 112); }},
{id: 'cap-colagem-cor', name: 'Capa · colagem editorial com polaroide', group: 'Capas de carrossel', mode: 'accent', tags: 'capa carrossel colagem polaroide cor da marca palavra gigante história', fields: ['kicker', 'title', 'num', 'sub'], sample: {kicker: 'por que a marca fingiu que ia', title: 'mudar de nome', num: '61 anos', sub: 'depois de'},
  build(c) { c.t('body', c.copy.kicker, {fk: 'serif', fixUp: false, size: 50, fw: 400, x: 60, w: c.W - 120, y: 80, align: 'center', pk: 'fg'});
    const t = c.t('title', c.copy.title, {fk: 'cond', fixUp: true, size: 190, lh: 0.92, fw: 400, align: 'center', x: 50, w: c.W - 100, y: 150, pk: 'fg'}); c.fit(t, 340, 80);
    const px = 250, py = t.y + c.h(t) + 30, pw = 540, ph = 560, fr = c.r('frame', {x: px, y: py, w: pw, h: ph, pk: 'paper'}), im = c.i('photo', {x: px + 26, y: py + 26, w: pw - 52, h: ph - 150, brief: 'Foto ou recorte'});
    c.rotGroup([fr, im], px + pw / 2, py + ph / 2, -4);
    c.t('body', c.copy.sub, {fk: 'serif', fixUp: false, size: 44, x: 60, y: py + ph + 30, w: 420, pk: 'fg'}); c.t('display', c.copy.num, {fk: 'cond', fixUp: true, size: 150, fw: 400, x: 380, y: py + ph - 30, w: 640, align: 'right', pk: 'sec', lh: 1}); }}
);

/* ===== CARROSSEL EDITORIAL: acentuado + creme, na cor da marca ===== */
LAYOUTS.push(
{id: 'ed-etiquetas', name: 'Editorial · frase em etiquetas escalonadas', group: 'Carrossel editorial', mode: 'accent', tags: 'capa carrossel editorial frase etiquetas escalonadas círculos cor da marca opinião', fields: ['date', 'kicker', 'title', 'sub', 'handle'], sample: {date: '© 2026', kicker: 'repita comigo:', title: 'marca\nsem\npropósito\né só um\nlogo.', sub: 'te explico o porquê.', handle: '@seunegocio'},
  build(c) { [[-380, 0, 1000], [-210, 360, 720], [-60, 640, 420]].forEach(([x, y, d]) => c.r('ring', {shape: 'ellipse', x: x, y: y, w: d, h: d, pk: 'none', pks: 'line', strokeW: 2}));
    c.t('muted', c.copy.date, {x: 60, y: 60, w: 300, size: 24, pk: 'fg'});
    const edge = c.W - 70, lines = String(c.copy.title).split('\n').filter(Boolean), sz = 124, bh = Math.round(sz * 1.08), kk = c.t('body', c.copy.kicker, {size: 40, fw: 600, pk: 'fg', align: 'right', x: edge - 700, w: 700, y: 0});
    let y = Math.round((c.H - lines.length * bh) / 2) + 10; kk.y = y - 80;
    lines.forEach(ln => { const t = c.t('title', ln, {fk: 'body', fixUp: false, size: sz, fw: 800, lh: 1, pk: 'brand', x: 0, w: 1000, y: y + 4}), w = CAPA_W(t), bx = edge - w - 56;
      const box = c.r('label', {x: bx, y, w: w + 56, h: bh, pk: 'paper'}); c.layers.splice(c.layers.indexOf(box), 1); c.layers.splice(c.layers.indexOf(t), 0, box); t.x = bx + 28; t.w = w + 10; y += bh; });
    c.t('body', c.copy.sub, {size: 40, fw: 600, pk: 'fg', align: 'right', x: edge - 700, w: 700, y: y + 36});
    c.t('muted', c.copy.handle, {x: 60, y: c.H - 84, w: 500, size: 26, pk: 'fg'}); c.r('pill', {x: c.W - 70 - 150, y: c.H - 96, w: 150, h: 56, radius: 28, pk: 'paper'}); c.r('pill-dot', {shape: 'ellipse', x: c.W - 70 - 52, y: c.H - 92, w: 48, h: 48, pk: 'brand'}); c.t('muted', '→', {x: c.W - 70 - 52, y: c.H - 88, w: 48, size: 30, align: 'center', pk: 'paper', fw: 800}); }},
{id: 'ed-indice', name: 'Editorial · título + índice numerado', group: 'Carrossel editorial', mode: 'accent', tags: 'capa carrossel editorial índice lista numerada título minúsculo cantos', fields: ['date', 'title', 'sub', 'items', 'handle'], sample: {date: '© 2026', title: 'tipos de arquitetura de marca.', sub: 'arquitetura de marca é a estrutura que organiza as diferentes marcas, produtos e serviços de um negócio.', items: 'monolítica\nendossada\nindependente\nhíbrida', handle: '@seunegocio'},
  build(c) { c.t('muted', c.copy.date, {x: 60, y: 60, w: 300, size: 24, pk: 'fg'});
    c.copy.items.forEach((it, i) => { c.t('muted', String(i + 1).padStart(2, '0'), {x: 60, y: 540 + i * 36, w: 70, size: 26, pk: 'fg'}); c.t('muted', it, {x: 160, y: 540 + i * 36, w: 300, size: 26, pk: 'fg', fw: 500}); });
    c.t('body', c.copy.sub, {size: 26, fw: 500, lh: 1.3, x: 540, y: 540, w: 480, pk: 'fg'});
    const t = c.t('title', c.copy.title, {fk: 'body', fixUp: false, size: 168, lh: 0.94, fw: 800, pk: 'paper', x: 60, w: c.W - 120, y: 740}); c.fit(t, Math.max(140, c.H - 140 - 740), 44); t.y = c.H - 140 - c.h(t);
    c.t('muted', c.copy.handle, {x: 60, y: c.H - 84, w: 500, size: 26, pk: 'fg'}); c.t('muted', '→', {x: c.W - 160, y: c.H - 110, w: 100, size: 80, align: 'right', pk: 'paper', fw: 300}); }},
{id: 'ed-numero-lista', name: 'Editorial · número gigante + lista', group: 'Carrossel editorial', mode: 'accent', tags: 'capa carrossel editorial número gigante lista estilos referências', fields: ['date', 'num', 'title', 'items', 'handle'], sample: {date: '© 2026', num: '20', title: 'estilos de design gráfico', items: 'minimalismo\nmaximalismo\nvector art\nbrutalismo\nbauhaus\npixel art\nfotografia\neditorial\ncolagem\ngrafite', handle: '@seunegocio'},
  build(c) { c.t('muted', c.copy.date, {x: 60, y: 60, w: 300, size: 24, pk: 'fg'});
    const n = c.t('display', c.copy.num, {fk: 'body', fixUp: false, size: 640, fw: 900, lh: 0.8, pk: 'paper', x: 20, y: 150, w: 760});
    c.copy.items.slice(0, 14).forEach((it, i) => c.t('muted', String(i + 1).padStart(2, '0') + '  ' + it, {x: 70, y: 250 + i * 32, w: 360, size: 21, pk: 'ink', fw: 600}));
    const t = c.t('title', c.copy.title, {fk: 'body', fixUp: false, size: 104, lh: 0.98, fw: 800, pk: 'paper', x: 540, w: 480, y: 760}); c.fit(t, 330, 56);
    c.t('muted', c.copy.handle, {x: 60, y: c.H - 84, w: 500, size: 26, pk: 'fg'}); c.t('muted', '→', {x: c.W - 160, y: c.H - 110, w: 100, size: 80, align: 'right', pk: 'paper', fw: 300}); }},
{id: 'ed-vitrine-claro', name: 'Editorial · vitrine de exemplo (fundo creme)', group: 'Carrossel editorial', mode: 'light', tags: 'miolo carrossel editorial vitrine exemplo poster lista referência numerada', fields: ['num', 'title', 'tag'], sample: {num: '//19', title: 'risografia', tag: ''},
  build(c) { c.bgRect({pk: 'paper'}); EDITORIAL_VITRINE(c, 'brand'); }},
{id: 'ed-vitrine-cor', name: 'Editorial · vitrine de exemplo (cor da marca)', group: 'Carrossel editorial', mode: 'accent', tags: 'miolo carrossel editorial vitrine exemplo poster lista referência numerada', fields: ['num', 'title', 'tag'], sample: {num: '//20', title: 'colagem', tag: ''},
  build(c) { EDITORIAL_VITRINE(c, 'fg'); }},
{id: 'ed-cartao-recortes', name: 'Editorial · cartão com recortes e texto centralizado', group: 'Carrossel editorial', mode: 'accent', tags: 'miolo carrossel editorial cartão ingresso recorte centralizado definição', fields: ['num', 'title', 'sub'], sample: {num: '// 001', title: 'monolítica', sub: 'nesse sistema toda a estrutura se apoia em uma marca principal, e as extensões usam o mesmo logotipo, diferenciando-se apenas pela descrição de cada unidade.'},
  build(c) { EDITORIAL_CARTAO(c, false); }},
{id: 'ed-cartao-arvore', name: 'Editorial · cartão com recortes + diagrama em árvore', group: 'Carrossel editorial', mode: 'accent', tags: 'miolo carrossel editorial cartão diagrama árvore ramificação estrutura', fields: ['num', 'title', 'sub', 'items'], sample: {num: '// 002', title: 'endossada', sub: 'existe sinergia entre a marca principal e as marcas do portfólio, mas elas não usam a mesma estrutura.', items: 'Marca A\nMarca B\nMarca C\nMarca D'},
  build(c) { EDITORIAL_CARTAO(c, true); }}
);
/* vitrine: cartaz de exemplo ao centro, número no canto superior e nome embaixo, ambos sublinhados */
function EDITORIAL_VITRINE(c, pkLink) {
  const ul = (txt, x, y, w, al) => { const t = c.t('muted', txt, {x, y, w, size: 36, fw: 600, pk: pkLink, align: al || 'left'}), tw = CAPA_W(t); c.r('uline', {x: al === 'right' ? x + w - tw : x, y: y + 48, w: tw, h: 2, pk: pkLink}); };
  ul(c.copy.num, 70, 70, 300); if (c.copy.tag) ul(c.copy.tag, c.W - 370, 70, 300, 'right');
  const pw = Math.round(c.W * 0.58), ph = Math.round(pw * 1.42); c.i('photo', {x: Math.round((c.W - pw) / 2), y: Math.round((c.H - ph) / 2) + 10, w: pw, h: ph, brief: 'Cartaz ou exemplo (3:4)'});
  ul(c.copy.title, 70, c.H - 130, 600);
}
/* cartão creme com meio-círculos recortados no topo e na base */
function EDITORIAL_CARTAO(c, tree) {
  const cx = 64, cy = 84, cw = c.W - 128, ch = c.H - 168; c.r('card', {x: cx, y: cy, w: cw, h: ch, radius: 70, pk: 'paper'});
  c.r('notch', {shape: 'ellipse', x: c.W / 2 - 70, y: cy - 70, w: 140, h: 140, pk: 'bg'}); c.r('notch', {shape: 'ellipse', x: c.W / 2 - 70, y: cy + ch - 70, w: 140, h: 140, pk: 'bg'});
  c.t('muted', c.copy.num, {x: cx, y: cy + 96, w: cw, size: 30, align: 'center', pk: 'brand', fw: 500});
  const t = c.t('title', c.copy.title, {fk: 'body', fixUp: false, size: 104, fw: 800, align: 'center', pk: 'brand', x: cx + 40, w: cw - 80, y: cy + 150}); c.fit(t, 150, 60, 1);
  const b = c.t('body', c.copy.sub, {size: 33, fw: 500, lh: 1.35, align: 'center', pk: 'ink', x: cx + 90, w: cw - 180, y: t.y + c.h(t) + 30}); c.fit(b, 300, 24);
  const top = b.y + c.h(b) + 56;
  if (!tree) { c.i('cutout', {x: cx + 120, y: top, w: cw - 240, h: cy + ch - top - 110, brief: 'Ilustração, diagrama ou logos'}); return; }
  const n = Math.max(2, Math.min(5, c.copy.items.length || 3)), mid = c.W / 2, step = Math.round((cw - 200) / (n - 1)), x0 = cx + 100, ly = top + 70;
  c.r('node', {shape: 'ellipse', x: mid - 20, y: top, w: 40, h: 40, pk: 'brand'}); c.r('stem', {x: mid - 2, y: top + 40, w: 4, h: 30, pk: 'brand'}); c.r('beam', {x: x0, y: ly, w: step * (n - 1), h: 4, pk: 'brand'});
  for (let i = 0; i < n; i++) { const x = x0 + i * step; c.r('drop', {x: x - 2, y: ly, w: 4, h: 50, pk: 'brand'}); c.r('node', {shape: i % 2 ? undefined : 'ellipse', x: x - 22, y: ly + 50, w: 44, h: 44, radius: i % 2 ? 10 : 0, pk: 'brand'});
    c.t('muted', c.copy.items[i] || '', {x: x - 90, y: ly + 108, w: 180, size: 22, align: 'center', pk: 'ink', fw: 600}); }
  const root = c.i('cutout', {x: cx + 220, y: ly + 170, w: cw - 440, h: cy + ch - (ly + 170) - 100, brief: 'Marca principal e marcas do portfólio (logos)'});
}

/* ===== CAPAS DE FOTO COM TIPOGRAFIA SERIFADA (estilo revista, tom quente) ===== */
const CAPA_REV = {tag: 'Estúdio | Seu nome', date: 'Branding & design', kicker: 'Eu não quero que você me', title: 'copie', sub: 'Quero que você se descubra.'};
LAYOUTS.push(
{id: 'cap-serifa-gigante', name: 'Capa · foto + palavra serifada gigante', group: 'Capas de carrossel', mode: 'dark', tags: 'capa carrossel foto palavra gigante serifa itálico revista marca pessoal', fields: ['tag', 'date', 'kicker', 'title', 'sub'], sample: CAPA_REV,
  build(c) { CAPA_PHOTO(c); c.r('veil', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: {c1: 'rgba(0,0,0,0.25)', c2: 'rgba(0,0,0,0.38)', a: 180}});
    capaTop(c, true); const k = c.t('body', c.copy.kicker, {size: 46, fw: 500, align: 'center', x: 60, w: c.W - 120, y: Math.round(c.H * 0.1), pk: 'fg'});
    const t = c.t('display', c.copy.title, {fk: 'serif', fixUp: false, size: 420, fw: 400, lh: 0.9, align: 'center', pk: 'acc', x: 30, w: c.W - 60, y: k.y + 70}); c.fit(t, 520, 120, 1);
    if (c.copy.sub) c.t('body', c.copy.sub, {size: 30, fw: 500, align: 'center', x: 60, w: c.W - 120, y: c.H - 110, pk: 'fg'}); }},
{id: 'cap-serifa-condensada', name: 'Capa · foto + título serifado condensado em caixa-alta', group: 'Capas de carrossel', mode: 'dark', tags: 'capa carrossel foto serifa condensada caixa-alta lista momentos revista', fields: ['tag', 'date', 'kicker', 'title', 'sub'], sample: {tag: 'Estúdio | Seu nome', date: 'Branding & design', kicker: 'Momentos que me fizeram feliz em', title: 'MARÇO', sub: ''},
  build(c) { CAPA_PHOTO(c); c.r('veil', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: {c1: 'rgba(0,0,0,0.4)', c2: 'rgba(0,0,0,0.1)', a: 180}});
    capaTop(c, true); const k = c.t('body', c.copy.kicker, {size: 38, fw: 500, align: 'center', x: 60, w: c.W - 120, y: Math.round(c.H * 0.085), pk: 'fg', lh: 1.15});
    const t = c.t('display', c.copy.title, {fk: 'serif', fixUp: true, size: 300, fw: 400, lh: 0.88, align: 'center', pk: 'fg', x: 40, w: c.W - 80, y: k.y + c.h(k) + 16}); c.fit(t, 440, 90, 2);
    if (c.copy.sub) c.t('body', c.copy.sub, {size: 28, fw: 500, align: 'center', x: 60, w: c.W - 120, y: c.H - 120, pk: 'fg'}); }},
{id: 'cap-serifa-mista', name: 'Capa · frase curta + palavra serifada de destaque', group: 'Capas de carrossel', mode: 'dark', tags: 'capa carrossel foto frase curta palavra serifa destaque sobreposta posicionamento', fields: ['tag', 'date', 'kicker', 'title', 'sub'], sample: {tag: 'Estúdio | Seu nome', date: 'Branding & design', kicker: 'Pequenas batalhas que eu preciso', title: 'VENCER', sub: 'para crescer a minha marca pessoal'},
  build(c) { CAPA_PHOTO(c); CAPA_SHADE(c, 0.3, 0.7); capaTop(c, true);
    const k = c.t('body', c.copy.kicker, {size: 36, fw: 600, x: 70, w: 560, y: Math.round(c.H * 0.56), pk: 'fg', lh: 1.15});
    const t = c.t('display', c.copy.title, {fk: 'serif', fixUp: true, size: 280, fw: 400, lh: 0.88, x: 60, w: c.W - 120, y: k.y + c.h(k) + 6, pk: 'fg'}); c.fit(t, 330, 90, 1);
    if (c.copy.sub) c.t('body', c.copy.sub, {size: 32, fw: 500, x: 70, w: 560, y: t.y + c.h(t) + 14, pk: 'fg', lh: 1.2}); }},
{id: 'cap-cartaz-creme', name: 'Capa · cartaz creme com foto recortada e selo', group: 'Capas de carrossel', mode: 'light', tags: 'capa carrossel cartaz procurada creme foto quadro clipe carimbo pergunta', fields: ['tag', 'date', 'title', 'sub'], sample: {tag: 'Estúdio | Seu nome', date: 'Branding & design', title: 'PROCURADA', sub: 'Como recuperar o posicionamento depois de um chá de sumiço?'},
  build(c) { capaTop(c, false); const t = c.t('title', c.copy.title, {fk: 'serif', fixUp: true, size: 190, fw: 400, lh: 0.95, align: 'center', pk: 'brand', x: 40, w: c.W - 80, y: 100}); c.fit(t, 240, 80, 1);
    const fx = 190, fy = t.y + c.h(t) + 30, fw2 = c.W - 380, fh = Math.round(c.H * 0.5); c.r('frame', {x: fx, y: fy, w: fw2, h: fh, pk: 'paper'}); c.i('photo', {x: fx + 22, y: fy + 22, w: fw2 - 44, h: fh - 44, brief: 'Foto da pessoa'});
    c.r('clip', {x: fx + fw2 - 120, y: fy - 40, w: 26, h: 120, radius: 13, pk: 'mut'});
    c.t('body', c.copy.sub, {size: 38, fw: 500, align: 'center', lh: 1.2, x: 100, w: c.W - 200, y: fy + fh + 40, pk: 'fg', em0: 'color'}); }}
);
