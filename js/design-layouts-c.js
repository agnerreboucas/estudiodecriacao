/* Modelos · Promoção e evento, Estrutura, Capas de vídeo */
const SH = (a, b, ang) => ({c1: 'rgba(0,0,0,' + a + ')', c2: 'rgba(0,0,0,' + b + ')', a: ang == null ? 180 : ang});
LAYOUTS.push(
/* ---- Promoção e evento ---- */
{id: 'promo-faixas', name: 'Promoção com faixas de aviso', group: 'Promoção e evento', mode: 'accent', tags: 'oferta feirão liquidação campanha número', fields: ['num', 'title', 'sub', 'kicker', 'handle'],
  sample: {kicker: 'FEIRÃO', num: '100', title: 'HORAS DE OFERTAS', sub: 'Aguardem!', handle: '#seunegocio'},
  build(c) { const {copy} = c, band = (y, rot) => { const r = c.r('band', {x: -60, y, w: c.W + 120, h: 86, pk: 'fg'}), q = c.t('muted', Array(8).fill(copy.kicker).join('   ✦   '), {size: 40, fixUp: true, fw: 800, ls: 4, pk: 'rev', x: -40, w: 3000, y: y + 20}); c.rotGroup([r, q], c.W / 2, y + 43, rot); };
    band(c.H * 0.08, -4); band(c.H * 0.86, -4);
    c.i('cutout', {x: 520, y: c.H * 0.16, w: 520, h: c.H * 0.62});
    const n = c.t('display', copy.num, {fk: 'cond', size: 520, lh: 0.85, fw: 400, w: 800, x: c.m - 20, y: c.H * 0.2, pk: 'fg', fixUp: true}); c.fit(n, 520, 100);
    const t = c.t('title', copy.title, {fk: 'cond', size: 110, lh: 1, fw: 400, w: 700, pk: 'fg', fixUp: true}); c.fit(t, 230, 40);
    c.stack([t, c.t('body', copy.sub, {size: 50, fw: 800, fixUp: true, pk: 'fg'})], c.H * 0.58, c.H * 0.84, 'top', 8);
    c.t('brand', copy.handle, {y: c.H * 0.835 - 60, size: 28, pk: 'fg', fw: 700, x: c.m, w: 500}); }},
{id: 'contagem-regressiva', name: 'Contagem regressiva', group: 'Promoção e evento', mode: 'dark', tags: 'evento lançamento urgência data local', fields: ['title', 'kicker', 'sub', 'label', 'handle'],
  sample: {title: 'É AMANHÃ', kicker: 'Seu evento', sub: 'DIAS 17, 18 E 19 DE SETEMBRO', label: 'CIDADE · ESTADO', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H * 0.7}); c.r('overlay', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: SH(0.0, 0.92, 180)});
    c.t('kicker', copy.kicker, {size: 30, ls: 6, align: 'center', fixUp: true, fw: 700, y: c.m - 20});
    const t = c.t('title', copy.title, {fk: 'cond', size: 300, lh: 0.9, align: 'center', pk: 'acc', fixUp: true, fw: 400}); c.fit(t, 330, 80, 1); t.y = c.H * 0.6;
    const bx = (x, w, txt) => { c.r('pill', {x, y: c.H * 0.8, w, h: 100, radius: 14, pk: 'none', pks: 'line', stroke: '#fff', strokeW: 2}); const q = c.t('muted', txt, {x: x + 18, w: w - 36, y: c.H * 0.8 + 30, size: 28, fw: 700, align: 'center', fixUp: true, pk: 'fg', ls: 2}); c.fit(q, 60, 14); };
    bx(c.m, 520, copy.sub); bx(c.m + 540, 360, copy.label);
    c.t('brand', copy.handle, {y: c.H - c.m + 6, size: 22, pk: 'mut', align: 'center'}); }},
{id: 'evento-tres-pessoas', name: 'Cartaz de evento com palestrantes', group: 'Promoção e evento', mode: 'dark', tags: 'evento palestrantes ingresso data local', fields: ['title', 'kicker', 'sub', 'label', 'button'],
  sample: {kicker: 'EVENTO PRESENCIAL', title: 'O próximo nível da sua empresa exige outro nível de dono.', sub: 'DIAS 08 E 09 DE DEZEMBRO', label: 'CIDADE · ESTADO', button: 'GARANTA SUA VAGA'},
  build(c) { const {copy} = c;
    c.t('kicker', copy.kicker, {size: 26, ls: 6, align: 'center', fixUp: true, fw: 700, pk: 'mut', y: c.m - 30});
    [[40, 0.11, 340, 0.4], [370, 0.08, 340, 0.43], [700, 0.11, 340, 0.4]].forEach(([x, f, w, h]) => c.i('cutout', {x, y: c.H * f + 30, w, h: c.H * h}));
    const t = c.t('title', copy.title, {fk: 'cond', size: 104, lh: 1, align: 'center', fixUp: true, fw: 400, em0: 'color'}); c.fit(t, c.H * 0.2, 40); t.y = c.H * 0.56;
    const p = (x, w, txt) => { c.r('pill', {x, y: c.H * 0.77, w, h: 90, radius: 12, pk: 'alt'}); const q = c.t('muted', txt, {x: x + 14, w: w - 28, y: c.H * 0.77 + 28, size: 24, fw: 700, align: 'center', fixUp: true, pk: 'fg', ls: 1}); c.fit(q, 40, 12); };
    p(c.m, 500, copy.sub); p(c.m + 520, 380, copy.label);
    c.r('cta-fill', {x: c.m, y: c.H * 0.77 + 120, w: c.cw, h: 96, radius: 12, pk: 'acc'}); const b = c.t('cta-text', copy.button, {align: 'center', size: 44, fk: 'cond', fixUp: true, fw: 400, pk: 'on', y: c.H * 0.77 + 120 + 26, lh: 1}); c.fit(b, 60, 20); }},
{id: 'aniversario-selfie', name: 'Cartão de aniversário com selfie', group: 'Promoção e evento', mode: 'accent', tags: 'aniversário parabéns cliente relacionamento', fields: ['title', 'kicker', 'sub', 'handle'],
  sample: {kicker: 'FELIZ', title: 'ANIVERSÁRIO', sub: 'Hoje celebramos sua história e agradecemos pela confiança.', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.t('muted', copy.kicker, {fk: 'script', size: 90, pk: 'fg', fixUp: false, fw: 700, align: 'center', y: c.m - 30});
    const t = c.t('title', copy.title, {fk: 'cond', size: 170, lh: 0.95, align: 'center', pk: 'fg', fixUp: true, fw: 400, y: c.m + 50}); c.fit(t, 200, 60);
    [[40, 0.55, 120, 150], [900, 0.6, 130, 160], [70, 0.7, 110, 140]].forEach(([x, f, w, h], i) => { c.r('balloon', {shape: 'ellipse', x, y: c.H * f, w, h, pk: 'fg', opacity: 0.85}); });
    const cy = c.H * 0.27, ch = c.H * 0.46; c.r('card', {x: 250, y: cy, w: 580, h: ch, radius: 36, pk: 'fg'});
    c.i('thumb', {x: 272, y: cy + 22, w: 536, h: ch - 130, radius: 22, brief: 'Foto do aniversariante'});
    c.t('muted', '♥  ◌  ➤', {x: 280, w: 400, y: cy + ch - 90, size: 34, pk: 'rev'});
    const s = c.t('body', copy.sub, {size: 34, align: 'center', lh: 1.3, w: 800, x: 140, fw: 600, pk: 'fg'}); c.fit(s, 200, 20); s.y = c.H * 0.78;
    c.t('brand', copy.handle, {y: c.H - c.m - 4, size: 22, pk: 'fg', align: 'center'}); }},
{id: 'depoimento-conversa', name: 'Depoimento em conversa', group: 'Promoção e evento', mode: 'dark', tags: 'prova social depoimento cliente mensagem', fields: ['title', 'items', 'handle'],
  sample: {title: 'O que nossos clientes dizem', items: 'Fechou, muito obrigado! Resolveu o que eu precisava.\nIndicando para todo mundo.\nAtendimento rápido e claro do começo ao fim.', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    const t = c.t('title', copy.title, {fk: 'head', size: 66, fw: 800, align: 'center', fixUp: false, lh: 1.1}); c.fit(t, 200, 30); t.y = c.m - 20;
    let y = t.y + c.h(t) + 70;
    copy.items.slice(0, 4).forEach((it, i) => { const right = i % 2 === 1, w = 760, x = right ? c.W - c.m - w : c.m;
      const tx = c.t('body', it, {x: x + 32, w: w - 64, size: 42, lh: 1.3, pk: right ? 'on' : 'fg', y: y + 24, fw: 500, fixUp: false}), h = c.h(tx) + 48;
      c.r('bubble', {x, y, w, h, radius: 40, pk: right ? 'acc' : 'alt'}); c.layers.push(c.layers.splice(c.layers.indexOf(tx), 1)[0]); y += h + 34; });
    c.t('brand', copy.handle, {y: c.H - c.m - 6, size: 22, pk: 'mut', align: 'center'}); }},
{id: 'oferta-desconto', name: 'Oferta com desconto em destaque', group: 'Promoção e evento', mode: 'dark', tags: 'ecommerce desconto oferta pix loja', fields: ['kicker', 'num', 'title', 'sub', 'handle'],
  sample: {kicker: 'GANHE', num: '30%', title: 'OFF', sub: 'No Pix em compras acima de R$ 499', handle: '*Condições no regulamento. Imagens ilustrativas.'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H}); c.r('overlay', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: SH(0.55, 0.35)});
    c.t('kicker', copy.kicker, {size: 34, ls: 12, align: 'center', fixUp: true, fw: 600, y: c.m - 10});
    const n = c.t('display', copy.num + ' ' + copy.title, {fk: 'serif', size: 280, fw: 400, align: 'center', lh: 1, fixUp: false, y: c.m + 50, w: 940, x: 70}); c.fit(n, 360, 80);
    c.t('body', copy.sub, {size: 36, align: 'center', fw: 600, y: n.y + c.h(n) + 20, w: 760, x: 160, lh: 1.25});
    c.t('brand', copy.handle, {y: c.H - c.m - 6, size: 20, pk: 'mut', align: 'center'}); }},
{id: 'produto-script', name: 'Produto com título manuscrito', group: 'Promoção e evento', mode: 'accent', tags: 'produto lançamento campanha manuscrito elegante', fields: ['kicker', 'title', 'sub', 'handle'],
  sample: {kicker: 'Seu próximo', title: 'favorito', sub: 'pode começar por um olhar', handle: 'SEU NEGÓCIO'},
  build(c) { const {copy} = c;
    const k = c.t('kicker', copy.kicker, {fk: 'script', size: 100, align: 'center', pk: 'fg', fixUp: false, fw: 700, y: c.m - 10}), t = c.t('title', copy.title, {fk: 'script', size: 130, align: 'center', pk: 'fg', fixUp: false, fw: 700, y: c.m + 90}); c.fit(t, 200, 50);
    c.i('cutout', {x: 150, y: c.H * 0.24, w: 780, h: c.H * 0.5});
    c.t('body', copy.sub, {fk: 'script', size: 78, align: 'center', pk: 'fg', fixUp: false, fw: 700, y: c.H * 0.77, lh: 1.05}); 
    c.t('brand', copy.handle, {y: c.H - c.m - 6, size: 28, ls: 6, pk: 'fg', align: 'right', fw: 700, fixUp: true}); }},
{id: 'janela-retro', name: 'Janela retrô de erro', group: 'Promoção e evento', mode: 'light', tags: 'meme erros retrô tecnologia dica', fields: ['title', 'sub', 'kicker', 'handle'],
  sample: {kicker: 'erro.exe', title: 'Não cometa esses erros!', sub: 'Para quem está começando', handle: '@seunegocio'},
  build(c) { const {copy} = c, x = 150, y = c.H * 0.1, w = 780, h = c.H * 0.5;
    c.bgRect({pk: 'alt'});
    c.r('window', {x, y, w, h, pk: 'bg', pks: 'fg', stroke: '#000', strokeW: 5, radius: 4});
    c.r('titlebar', {x, y, w, h: 60, pk: 'fg', radius: 4}); c.t('kicker', copy.kicker, {x: x + 20, w: 500, y: y + 14, size: 28, pk: 'bg', fixUp: false, fw: 600}); c.t('muted', '✕', {x: x + w - 56, w: 40, y: y + 12, size: 32, pk: 'bg', align: 'center'});
    c.i('thumb', {x: x + 40, y: y + 100, w: w - 80, h: h - 160, brief: 'Imagem pixelada ou print'});
    const t = c.t('title', copy.title, {fk: 'head', size: 112, fw: 900, align: 'center', lh: 1.02, fixUp: false}), s = c.t('body', copy.sub, {fk: 'script', size: 56, align: 'center', pk: 'acc', fw: 700});
    c.fit(t, 330, 40); c.stack([t, s], y + h + 30, c.H - c.m - 20, 'top', 8);
    c.t('brand', copy.handle, {y: c.H - c.m - 6, size: 22, pk: 'mut', align: 'center'}); }},

/* ---- Estrutura ---- */
{id: 'cards-ligados', name: 'Cards numerados ligados ao centro', group: 'Estrutura', mode: 'dark', tags: 'lista ferramentas pilares estrutura autoridade', fields: ['title', 'kicker', 'items', 'handle'],
  sample: {kicker: 'GUIA RÁPIDO', title: '6 passos para **vender melhor**', items: 'Oferta clara\nPúblico certo\nProva social\nCanal ideal\nAção simples\nMedição', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.t('kicker', copy.kicker, {size: 24, ls: 6, align: 'center', pk: 'acc', fixUp: true, fw: 800, y: c.m - 30});
    const t = c.t('title', copy.title, {fk: 'head', size: 72, fw: 800, align: 'center', lh: 1.08, fixUp: false, em0: 'color', y: c.m + 10}); c.fit(t, 200, 34);
    const top = t.y + c.h(t) + 40, ch = 150, gap = (c.H - top - c.m - 60 - 3 * ch) / 2;
    c.i('cutout', {x: 330, y: top + 40, w: 420, h: c.H - top - c.m - 140});
    copy.items.slice(0, 6).forEach((it, i) => { const left = i < 3, x = left ? 40 : 740, y = top + (i % 3) * (ch + gap);
      c.r('line', {x: left ? x + 300 : 690, y: y + ch / 2, w: left ? 60 : 50, h: 3, pk: 'acc'});
      c.r('card', {x, y, w: 300, h: ch, radius: 18, pk: 'alt', pks: 'line', stroke: '#fff', strokeW: 1});
      c.t('muted', '0' + (i + 1), {x: x + 22, w: 80, y: y + 18, size: 24, pk: 'acc', fw: 800});
      const q = c.t('body', it, {x: x + 22, w: 256, y: y + 56, size: 34, fw: 700, lh: 1.15, fixUp: false}); c.fit(q, 80, 18);
      c.r('toggle', {x: x + 236, y: y + 18, w: 44, h: 24, radius: 12, pk: 'acc'}); });
    c.t('brand', copy.handle, {y: c.H - c.m - 6, size: 22, pk: 'mut', align: 'center'}); }},
{id: 'comparacao-linhas', name: 'Comparação em 3 linhas', group: 'Estrutura', mode: 'light', tags: 'comparação estudo tipografia antes depois opções', fields: ['title', 'items', 'handle'],
  sample: {title: 'Aa', items: 'Elegante + atemporal\nMinimalista + limpo\nForte + impactante', handle: '@seunegocio'},
  build(c) { const {copy} = c, n = 3, rh = (c.H - 2 * c.m) / n, fams = ['head', 'serif', 'cond'];
    copy.items.slice(0, n).forEach((it, i) => { const y = c.m + i * rh;
      const w = c.t('title', copy.title, {fk: fams[i], size: 300, align: 'center', fw: 800, lh: 1, fixUp: false, y: y + 10}); c.fit(w, rh - 90, 60);
      c.t('muted', it, {size: 30, fw: 700, align: 'center', pk: 'fg', y: y + rh - 70});
      if (i < n - 1) c.r('line', {x: c.m, y: y + rh - 14, w: c.cw, h: 2, pk: 'line'}); });
    c.t('brand', copy.handle, {y: c.H - c.m + 8, size: 20, pk: 'mut', align: 'center'}); }},
{id: 'grade-referencias', name: 'Grade de referências + texto', group: 'Estrutura', mode: 'dark', tags: 'moodboard referências editorial grade', fields: ['title', 'sub', 'kicker', 'items', 'handle'],
  sample: {kicker: 'REFERÊNCIAS', title: 'Direção visual', sub: 'Texto de apoio com a descrição do conceito, do clima e do que se espera de cada imagem.', items: 'Ferramenta A\nFerramenta B', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.i('photo', {x: c.m, y: c.m, w: 560, h: 700});
    c.t('kicker', copy.kicker, {x: 690, w: 300, y: c.m, size: 22, ls: 5, pk: 'acc', fixUp: true, fw: 800});
    const t = c.t('title', copy.title, {fk: 'serif', size: 56, x: 690, w: 300, fixUp: false, lh: 1.05, fw: 400, y: c.m + 40}), s = c.t('body', copy.sub, {x: 690, w: 300, size: 22, pk: 'mut', lh: 1.4}); c.fit(t, 160, 26); c.fit(s, 440, 14);
    c.stack([t, s], c.m + 40, c.m + 700, 'top', 16, 690, 300);
    const th = 190, gy = c.m + 740;
    [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([a, b]) => c.i('thumb', {x: c.m + a * (th + 16), y: gy + b * (th * 1.18 + 16), w: th, h: Math.round(th * 1.18)}));
    const l = c.t('body', 'Ferramentas:\n' + copy.items.join('\n'), {x: 690, w: 300, y: gy + 20, size: 26, pk: 'fg', lh: 1.4, fw: 700});
    const v = c.t('title', 'VISUAL\nREFERENCES', {fk: 'serif', size: 64, x: 690, w: 300, fw: 400, lh: 0.95, y: c.H - c.m - 150, fixUp: true}); c.fit(v, 150, 28); }},
{id: 'passo-a-passo', name: 'Passo a passo em 3 etapas', group: 'Estrutura', mode: 'light', tags: 'processo etapas serviço como funciona', fields: ['title', 'kicker', 'items', 'handle'],
  sample: {kicker: 'COMO FUNCIONA', title: 'Do primeiro contato ao resultado, em 3 passos', items: 'Conversa inicial|Entendemos seu objetivo e seu momento.\nPlano sob medida|Definimos o caminho e o que será entregue.\nExecução e ajuste|Acompanhamos e melhoramos a cada semana.', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.t('kicker', copy.kicker, {size: 24, ls: 6, pk: 'acc', fixUp: true, fw: 800, y: c.m - 30});
    const t = c.t('title', copy.title, {fk: 'head', size: 76, fw: 800, lh: 1.08, y: c.m + 10, fixUp: false}); c.fit(t, 250, 34);
    const top = t.y + c.h(t) + 50, rh = (c.H - top - c.m - 40) / 3;
    c.r('rail', {x: c.m + 44, y: top + 40, w: 4, h: rh * 2, pk: 'line'});
    copy.items.slice(0, 3).forEach((it, i) => { const [a, b] = it.split('|'), y = top + i * rh;
      c.r('dot', {shape: 'ellipse', x: c.m, y, w: 96, h: 96, pk: 'acc'}); c.t('title', String(i + 1), {x: c.m, w: 96, y: y + 14, size: 56, fk: 'head', fw: 900, align: 'center', pk: 'on', fixUp: false});
      c.t('body', a, {x: c.m + 130, w: c.cw - 130, y: y + 4, size: 50, fk: 'head', fw: 800, fixUp: false}); const d = c.t('body', b || '', {x: c.m + 130, w: c.cw - 130, y: y + 66, size: 34, pk: 'mut', lh: 1.3}); c.fit(d, rh - 80, 18); });
    c.t('brand', copy.handle, {y: c.H - c.m - 6, size: 22, pk: 'mut', align: 'center'}); }},
{id: 'antes-depois', name: 'Antes e depois', group: 'Estrutura', mode: 'light', tags: 'resultado transformação comparação serviço', fields: ['title', 'sub', 'kicker', 'label', 'handle'],
  sample: {title: 'A diferença que um bom trabalho faz', kicker: 'ANTES', label: 'DEPOIS', sub: 'Resultado real de um cliente, com autorização.', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    const t = c.t('title', copy.title, {fk: 'head', size: 80, fw: 800, align: 'center', lh: 1.08, fixUp: false, y: c.m}); c.fit(t, 260, 34);
    const y = t.y + c.h(t) + 40, h = c.H - y - c.m - 130, w = (c.cw - 30) / 2;
    c.i('thumb', {x: c.m, y, w, h, radius: 18, brief: 'Foto ANTES'}); c.i('thumb', {x: c.m + w + 30, y, w, h, radius: 18, brief: 'Foto DEPOIS'});
    c.r('chip', {x: c.m + 20, y: y + 20, w: 190, h: 56, radius: 12, pk: 'fg'}); c.t('kicker', copy.kicker, {x: c.m + 20, w: 190, y: y + 30, size: 28, align: 'center', pk: 'bg', fw: 800, fixUp: true, ls: 3});
    c.r('chip', {x: c.m + w + 50, y: y + 20, w: 190, h: 56, radius: 12, pk: 'acc'}); c.t('kicker', copy.label, {x: c.m + w + 50, w: 190, y: y + 30, size: 28, align: 'center', pk: 'on', fw: 800, fixUp: true, ls: 3});
    c.t('body', copy.sub, {y: y + h + 26, size: 32, pk: 'mut', align: 'center'});
    c.t('brand', copy.handle, {y: c.H - c.m - 6, size: 22, pk: 'mut', align: 'center'}); }},
{id: 'selos-confianca', name: 'Selos de confiança', group: 'Estrutura', mode: 'light', tags: 'confiança garantia loja ecommerce prova', fields: ['title', 'items', 'sub', 'handle'],
  sample: {title: 'Por que escolher a gente', items: 'Garantia|de satisfação\nAtendimento|humano\nEntrega|no prazo\nPagamento|seguro', sub: '', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    const t = c.t('title', copy.title, {fk: 'head', size: 90, fw: 800, align: 'center', lh: 1.08, fixUp: false}); c.fit(t, 260, 36); t.y = c.m + 20;
    const n = Math.min(4, copy.items.length), d = 200, gx = (c.W - n * d) / (n + 1), y = c.H * 0.38;
    copy.items.slice(0, 4).forEach((it, i) => { const [a, b] = it.split('|'), x = gx + i * (d + gx);
      c.r('seal', {shape: 'ellipse', x, y, w: d, h: d, pk: 'acc'}); c.t('title', '✓', {x, w: d, y: y + 40, size: 100, align: 'center', pk: 'on', fk: 'head', fixUp: false});
      c.t('body', a, {x: x - gx / 2 + 6, w: d + gx - 12, y: y + d + 24, size: 30, fw: 800, align: 'center', fixUp: false}); c.t('body', b || '', {x: x - gx / 2 + 6, w: d + gx - 12, y: y + d + 66, size: 26, pk: 'mut', align: 'center'}); });
    c.t('brand', copy.handle, {y: c.H - c.m - 6, size: 22, pk: 'mut', align: 'center'}); }},
{id: 'lista-icones', name: 'Lista com ícones', group: 'Estrutura', mode: 'light', tags: 'benefícios diferenciais serviço lista', fields: ['title', 'kicker', 'items', 'handle'],
  sample: {kicker: 'DIFERENCIAIS', title: 'O que você recebe', items: 'Atendimento direto|Fale com quem decide.\nPrazo combinado|Sem surpresas no caminho.\nPreço transparente|Você sabe o que paga.\nSuporte depois|A gente continua junto.', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.t('kicker', copy.kicker, {size: 24, ls: 6, pk: 'acc', fixUp: true, fw: 800, y: c.m - 30});
    const t = c.t('title', copy.title, {fk: 'head', size: 96, fw: 800, lh: 1.05, y: c.m + 10, fixUp: false}); c.fit(t, 200, 40);
    const top = t.y + c.h(t) + 50, rh = (c.H - top - c.m - 40) / 4;
    copy.items.slice(0, 4).forEach((it, i) => { const [a, b] = it.split('|'), y = top + i * rh;
      c.r('icon', {shape: 'ellipse', x: c.m, y, w: 84, h: 84, pk: 'acc'}); c.t('title', '✓', {x: c.m, w: 84, y: y + 10, size: 52, align: 'center', pk: 'on', fk: 'head', fixUp: false});
      c.t('body', a, {x: c.m + 116, w: c.cw - 116, y: y - 2, size: 46, fw: 800, fk: 'head', fixUp: false}); c.t('body', b || '', {x: c.m + 116, w: c.cw - 116, y: y + 52, size: 32, pk: 'mut'}); });
    c.t('brand', copy.handle, {y: c.H - c.m - 6, size: 22, pk: 'mut', align: 'center'}); }},
{id: 'numeros-destaque', name: 'Números em destaque', group: 'Estrutura', mode: 'dark', tags: 'resultados números autoridade prova', fields: ['title', 'items', 'sub', 'handle'],
  sample: {title: 'Nossos resultados', items: 'XX|clientes atendidos\nXX|anos de experiência\nXX|projetos entregues', sub: 'Troque XX pelos seus números reais e verificáveis.', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    const t = c.t('title', copy.title, {fk: 'head', size: 90, fw: 800, lh: 1.05, fixUp: false}); c.fit(t, 200, 40); t.y = c.m + 10;
    const top = t.y + c.h(t) + 40, rh = (c.H - top - c.m - 140) / 3;
    copy.items.slice(0, 3).forEach((it, i) => { const [a, b] = it.split('|'), y = top + i * rh;
      const n = c.t('display', a, {fk: 'cond', size: 220, lh: 1, fw: 400, w: 440, pk: 'acc', fixUp: false, y: y - 10}); c.fit(n, rh - 20, 60);
      c.t('body', b || '', {x: 560, w: 430, y: y + rh / 2 - 40, size: 42, fw: 700, fixUp: false, lh: 1.15}); c.r('line', {x: c.m, y: y + rh - 8, w: c.cw, h: 2, pk: 'line'}); });
    c.t('body', copy.sub, {y: c.H - c.m - 70, size: 26, pk: 'mut'}); }},

/* ---- Capas de vídeo ---- */
{id: 'legenda-caixa-branca', name: 'Legenda em caixa branca', group: 'Capas de vídeo', mode: 'dark', tags: 'reels vídeo legenda capa', fields: ['title'],
  sample: {title: 'Talvez você esteja medindo o resultado errado'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H});
    const t = c.t('title', copy.title, {fk: 'body', size: 50, fw: 700, align: 'center', pk: 'rev', lh: 1.2, x: c.m + 40, w: c.cw - 80, fixUp: false}); c.fit(t, 220, 24);
    const h = c.h(t) + 60; t.y = c.H * 0.76 + 30; c.r('caption', {x: c.m, y: c.H * 0.76, w: c.cw, h, radius: 16, pk: 'fg'}); c.layers.push(c.layers.splice(c.layers.indexOf(t), 1)[0]); }},
{id: 'legenda-amarela-topo', name: 'Legenda de impacto no topo', group: 'Capas de vídeo', mode: 'dark', tags: 'reels vídeo legenda amarela topo', fields: ['title', 'sub', 'handle'],
  sample: {title: 'QUEM QUERIA FAZER ESSA MISSÃO DIFÍCIL?', sub: '', handle: ''},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H}); c.r('overlay', {x: 0, y: 0, w: c.W, h: c.H * 0.4, pk: 'none', grad: SH(0.55, 0, 180)});
    const t = c.t('title', copy.title, {fk: 'cond', size: 96, fw: 400, align: 'center', pk: 'acc', fixUp: true, lh: 1.02, y: c.m}); c.fit(t, 330, 36);
    if (copy.sub) c.t('body', copy.sub, {size: 44, fw: 700, align: 'center', y: t.y + c.h(t) + 12}); }},
{id: 'moldura-arredondada', name: 'Vídeo em moldura arredondada', group: 'Capas de vídeo', mode: 'dark', tags: 'reels moldura palestra capa elegante', fields: ['title', 'handle'],
  sample: {title: 'Todo empreendedor quando termina um projeto.', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    const t = c.t('title', copy.title, {fk: 'body', size: 54, fw: 700, align: 'center', lh: 1.2, y: c.m - 20, fixUp: false}); c.fit(t, 200, 26);
    const y = t.y + c.h(t) + 36; c.i('photo', {x: 50, y, w: c.W - 100, h: c.H - y - 120, radius: 38});
    c.t('brand', copy.handle, {y: c.H - c.m - 6, size: 24, pk: 'mut', align: 'center'}); }},
{id: 'rotulos-sobre-imagem', name: 'Rótulos sobre a imagem', group: 'Capas de vídeo', mode: 'dark', tags: 'reels comparação rótulo capa duas ideias', fields: ['title', 'kicker', 'label'],
  sample: {title: 'Mesma pessoa, dois resultados', kicker: 'Isso viraliza', label: 'Isso vende'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H}); c.r('overlay', {x: 0, y: 0, w: c.W, h: c.H * 0.25, pk: 'none', grad: SH(0.55, 0, 180)});
    const t = c.t('title', copy.title, {fk: 'head', size: 64, fw: 800, align: 'center', lh: 1.1, y: c.m - 20, fixUp: false}); c.fit(t, 200, 28);
    const lab = (txt, x) => { const q = c.t('body', txt, {x: x + 20, w: 380, y: c.H * 0.34 + 18, size: 44, fw: 800, pk: 'rev', fixUp: false, align: 'center'}); c.fit(q, 70, 20); c.r('label', {x, y: c.H * 0.34, w: 420, h: 100, pk: 'fg'}); c.layers.push(c.layers.splice(c.layers.indexOf(q), 1)[0]); };
    lab(copy.kicker, 50); lab(copy.label, c.W - 470); }},
{id: 'poster-cinema', name: 'Pôster cinematográfico', group: 'Capas de vídeo', mode: 'dark', tags: 'lançamento cinema pôster dramático título serifado', fields: ['kicker', 'title', 'num', 'sub'],
  sample: {kicker: 'APRESENTA', title: 'A GRANDE\nVIRADA', num: '2', sub: 'ESTREIA EM BREVE · SÓ NOS MELHORES CANAIS'},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H}); c.r('overlay', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: SH(0.1, 0.9, 180)});
    c.t('kicker', copy.kicker, {size: 24, ls: 10, align: 'center', fixUp: true, pk: 'mut', y: c.m - 20});
    const n = c.t('display', copy.num, {fk: 'serif', size: 230, align: 'center', pk: 'acc', fw: 400, fixUp: false, lh: 1, y: c.H * 0.56});
    const t = c.t('title', copy.title, {fk: 'serif', size: 160, align: 'center', pk: 'acc', fw: 400, fixUp: true, lh: 0.98, ls: 4}); c.fit(t, 330, 60);
    c.stack([t], c.H * 0.6, c.H - c.m - 90, 'bottom', 0); n.size = 130; n.y = t.y - 150;
    c.t('muted', copy.sub, {size: 22, ls: 4, align: 'center', fixUp: true, pk: 'mut', y: c.H - c.m - 40}); }},
{id: 'crie-essa-imagem', name: 'Chamada "crie essa imagem"', group: 'Capas de vídeo', mode: 'dark', tags: 'pack ia prompt foto tutorial seta', fields: ['kicker', 'title', 'sub'],
  sample: {kicker: 'CRIE ESSA\nIMAGEM', title: 'SUPER PACK DE **7**', sub: ''},
  build(c) { const {copy} = c;
    c.i('photo', {x: 0, y: 0, w: c.W, h: c.H}); c.r('overlay', {x: 0, y: 0, w: c.W, h: c.H, pk: 'none', grad: SH(0.1, 0.78, 180)});
    c.t('kicker', copy.kicker, {size: 40, fw: 900, lh: 1.05, fixUp: true, pk: 'fg', w: 360, y: c.m - 30, fk: 'black'});
    c.t('muted', '↷', {size: 120, x: c.m + 240, y: c.m + 30, w: 160, pk: 'fg', fk: 'head', fixUp: false});
    const t = c.t('title', copy.title, {fk: 'black', size: 150, fw: 400, lh: 1, fixUp: true, em0: 'color', align: 'left', w: 900}); c.fit(t, 330, 50); t.y = c.H - c.m - 40 - c.h(t); }},
{id: 'logo-centrado', name: 'Logo e título centralizados', group: 'Capas de vídeo', mode: 'dark', tags: 'ferramenta novidade lançamento marca centro', fields: ['kicker', 'title', 'sub', 'handle'],
  sample: {kicker: 'Seu Negócio', title: 'Novidade chegando', sub: 'Em breve', handle: '@seunegocio'},
  build(c) { const {copy} = c;
    c.bgRect({pk: 'none', grad: {c1: c.pal.bg, c2: c.pal.sec, a: 200}, gk: ['bg', 'sec']});
    c.r('logo-mark', {shape: 'ellipse', x: c.W / 2 - 54, y: c.H * 0.34, w: 108, h: 108, pk: 'acc'});
    const k = c.t('kicker', copy.kicker, {fk: 'serif', size: 76, align: 'center', fw: 400, fixUp: false, pk: 'fg', y: c.H * 0.34 + 140});
    const t = c.t('title', copy.title, {fk: 'serif', size: 110, align: 'center', fw: 400, fixUp: false, lh: 1.05, y: k.y + 100}); c.fit(t, 320, 40);
    c.t('body', copy.sub, {size: 40, align: 'center', pk: 'mut', y: t.y + c.h(t) + 24, fw: 500});
    c.t('brand', copy.handle, {y: c.H - c.m - 6, size: 22, pk: 'mut', align: 'center'}); }}
);
