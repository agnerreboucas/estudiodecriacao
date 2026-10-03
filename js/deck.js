/* Apresentação do Pré-Projeto em slides: ~10 slides com pouco texto, montados com as camadas do Editor de Design.
   Cada slide é editável (texto, formas, fotos). O texto completo continua no Pré-Projeto e no documento completo. */
const DECK = {W: 1920, H: 1080, m: 120};
const dkClip = (s, n) => { s = String(s || '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim(); if (s.length <= n) return s; const c = s.slice(0, n), k = Math.max(c.lastIndexOf('. '), c.lastIndexOf('; ')); return (k > n * 0.55 ? c.slice(0, k + 1) : c.replace(/[\s,;:]+\S*$/, '') + '…'); };
const dkFirstSentence = (s, n) => { s = String(s || '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim(); const m = s.match(/^.+?[.!?](\s|$)/); return dkClip(m ? m[0].trim() : s, n); };

/* tema: usa o Brand Kit do projeto quando existe; senão, neutro editorial */
function deckTheme(p) {
  const b = typeof brandOf === 'function' ? brandOf(p) : null, kit = b && isHex(b.pal.c60);
  const light = kit ? (lum(b.pal.c60) > 0.6 ? b.pal.c60 : mixHex(b.pal.c60, '#ffffff', 0.9)) : '#f1f0ec';
  const dark = kit ? (lum(b.grays[2]) < 0.12 ? b.grays[2] : mixHex(b.grays[2], '#000000', 0.55)) : '#0e0e0e';
  const accent = kit ? b.pal.c10 : '#c9a96e';
  return {light, dark, ink: '#141414', white: '#ffffff', mute: '#6f6f6f', muteDark: '#a9a9a9', accent, line: '#d6d4cd', lineDark: 'rgba(255,255,255,0.22)',
    head: (kit && b.headFont) || 'Poppins', body: (kit && b.bodyFont) || 'Poppins', brandName: p.name};
}

/* construtor de slide */
function deckSlide(th, bg) {
  const layers = [], D = DECK;
  const api = {layers, th, bg};
  const dark = lum(bg) < 0.3;
  api.dark = dark;
  api.ink = dark ? th.white : th.ink; api.mute = dark ? th.muteDark : th.mute; api.line = dark ? th.lineDark : th.line;
  api.t = (role, content, o) => { const L = T(role, Object.assign({family: th.body, weight: 400, color: api.ink, w: 800, lh: 1.2, size: 32, emMode: 'color', emColor: th.accent, emBg: th.accent, emText: readable(th.accent)}, o, {content: String(content == null ? '' : content)})); layers.push(L); return L; };
  api.r = (role, o) => { const L = RC(role, Object.assign({fill: api.line}, o)); layers.push(L); return L; };
  api.h = L => layoutText(L).h;
  api.fit = (L, maxH, minS, maxLines) => { for (let n = 0; n < 40; n++) { const l = layoutText(L), wide = l.lines.some(x => x.w > L.w + 1); if (l.h <= maxH && !wide && (!maxLines || l.lines.length <= maxLines)) break; if (L.size <= (minS || 14)) break; L.size = Math.max(minS || 14, Math.round(L.size * 0.94 * 10) / 10); } return L; };
  /* etiqueta pequena com traço, como nas referências */
  api.label = (text, x, y, o) => {
    o = o || {}; const size = 22, tw = 56;
    if (o.center) {
      const probe = T('x', {content: String(text).toUpperCase(), family: th.body, weight: 600, size, ls: 4, w: 4000}), nat = layoutText(probe).lines[0].w, total = tw * 2 + 36 * 2 + nat, x0 = (D.W - total) / 2;
      api.r('label-line', {x: x0, y: y + 11, w: tw, h: 2, fill: api.ink, opacity: 0.6});
      api.t('kicker', String(text).toUpperCase(), {x: x0 + tw + 36, y, w: nat + 10, size, ls: 4, weight: 600, color: api.ink});
      api.r('label-line', {x: x0 + tw + 36 + nat + 36, y: y + 11, w: tw, h: 2, fill: api.ink, opacity: 0.6});
    } else {
      api.r('label-line', {x, y: y + 11, w: tw, h: 2, fill: api.ink, opacity: 0.6});
      api.t('kicker', String(text).toUpperCase(), {x: x + tw + 28, y, w: 900, size, ls: 4, weight: 600, color: api.ink});
    }
  };
  api.footer = (i, n, name) => {
    api.t('muted', (th.brandName + ' · Pré-Projeto').toUpperCase(), {x: D.m, y: D.H - 70, w: 900, size: 17, ls: 3, color: api.mute});
    api.t('muted', String(i).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'), {x: D.W - D.m - 300, y: D.H - 70, w: 300, size: 17, ls: 3, color: api.mute, align: 'right'});
  };
  api.finish = name => ({id: sid(), bg, layers, keep: true, name: name || ''});
  return api;
}
const dkTitle = (s, text, x, y, w, o) => { o = o || {}; const L = s.t('title', text, Object.assign({x, y, w, family: s.th.head, weight: 400, size: o.size || 104, lh: 1.06, ls: -2, color: s.ink}, o.L || {})); s.fit(L, o.maxH || 330, o.minS || 56, o.maxLines || 3); return L; };

/* ---- os 10 slides ---- */
function deckSlides(p) {
  const th = deckTheme(p), pre = p.pre; refreshDrafts(pre); refreshExtras(p);
  const items = preItems(pre), n = items.length, d = pre.diag, ok = items.filter(i => pre.hyp[i.id] && pre.hyp[i.id].validated).length, D = DECK, m = D.m;
  const sums = Object.fromEntries(pre.summary.blocks.map(b => [b.id, b.text]));
  const out = [];

  /* 1 · capa */
  { const s = deckSlide(th, th.dark);
    s.r('capa-glow', {x: 0, y: 0, w: D.W, h: D.H, fill: '', grad: {c1: 'rgba(255,255,255,0.04)', c2: 'rgba(255,255,255,0)', a: 135}});
    s.label('Pré-projeto · ' + p.ctx, m, 110);
    dkTitle(s, p.name, m, 300, 1500, {size: 150, maxH: 340, maxLines: 2, L: {color: s.ink}});
    const sub = s.t('body', dkClip(pre.objective || p.desc || 'Do diagnóstico à definição do objetivo.', 150), {x: m, y: 640, w: 980, size: 36, lh: 1.35, color: th.muteDark, weight: 400}); s.fit(sub, 150, 24, 3);
    const stats = [[n, 'Desafios\nmapeados'], [ok + '/' + n, 'Hipóteses\nvalidadas'], [pre.okr.tr.length + pre.okr.st.length, 'Resultados-chave\ndefinidos'], [pre.icps.length, 'Perfis\nprioritários']], cw = (D.W - 2 * m) / 4;
    s.r('stats-line', {x: m, y: 840, w: D.W - 2 * m, h: 2, fill: s.line});
    stats.forEach(([v, l], i) => { const x = m + i * cw; if (i) s.r('stats-sep', {x, y: 840, w: 2, h: 190, fill: s.line}); const x0 = x + (i ? 40 : 0), nat = Math.ceil(layoutText(T('title', {content: String(v), family: th.head, weight: 400, size: 96, ls: -2, w: 4000})).lines[0].w) + 8; s.t('title', v, {x: x0, y: 880, w: nat, size: 96, family: th.head, weight: 400, ls: -2, color: s.ink}); s.t('muted', l, {x: x0 + nat + 24, y: 902, w: cw - nat - 80, size: 22, lh: 1.25, color: th.muteDark}); });
    out.push(s.finish('Capa')); }

  /* 2 · resumo executivo */
  { const s = deckSlide(th, th.light);
    s.label('Resumo executivo', m, 96);
    dkTitle(s, 'O ponto de partida', m, 190, 880, {size: 112, maxH: 280, maxLines: 2});
    s.r('col-line', {x: 1040, y: 200, w: 2, h: 230, fill: s.line});
    const para = s.t('body', dkClip(sums.ctx || pre.briefing || p.desc, 260), {x: 1090, y: 200, w: 710, size: 30, lh: 1.5, color: s.mute}); s.fit(para, 260, 22, 7);
    const cards = [['Objetivo', sums.objective || pre.objective], ['Para quem', sums.who], ['Como começar', sums.phases]].filter(c => c[1]), cw = (D.W - 2 * m - 2 * 40) / 3;
    cards.forEach(([l, tx], i) => { const x = m + i * (cw + 40), y = 560; s.r('card', {x, y, w: cw, h: 380, fill: i === 0 ? th.dark : '', stroke: i === 0 ? '' : s.line, strokeW: 2, radius: 6});
      s.t('kicker', l.toUpperCase(), {x: x + 40, y: y + 40, w: cw - 80, size: 20, ls: 4, weight: 600, color: i === 0 ? th.accent : th.accent});
      const q = s.t('body', dkClip(tx, 150), {x: x + 40, y: y + 100, w: cw - 80, size: 30, lh: 1.4, color: i === 0 ? th.white : s.ink}); s.fit(q, 250, 20, 6); });
    out.push(s.finish('Resumo executivo')); }

  /* 3 · diagnóstico */
  { const s = deckSlide(th, th.light);
    s.label('Diagnóstico', m, 96);
    dkTitle(s, 'O que está acontecendo', m, 190, 900, {size: 108, maxH: 280, maxLines: 2});
    s.r('col-line', {x: 1040, y: 200, w: 2, h: 200, fill: s.line});
    const tl = s.t('body', n ? `${n} desafio${n > 1 ? 's' : ''} apontado${n > 1 ? 's' : ''}, entre eles: ` + items.slice(0, 2).map(i => dkClip(i.title.toLowerCase(), 48)).join('; ') + '.' : 'Nenhum desafio selecionado.', {x: 1090, y: 200, w: 710, size: 28, lh: 1.5, color: s.mute}); s.fit(tl, 220, 20, 6);
    const grid = [['Cenário', d.scenario], ['Hipótese causal', d.causal], ['Consequência', d.consequence], ['Necessidade', d.need]], gw = (D.W - 2 * m - 40) / 2;
    grid.forEach(([l, tx], i) => { const x = m + (i % 2) * (gw + 40), y = 500 + Math.floor(i / 2) * 250; s.r('card', {x, y, w: gw, h: 220, stroke: s.line, strokeW: 2, fill: '', radius: 6});
      s.t('kicker', l.toUpperCase(), {x: x + 36, y: y + 28, w: gw - 72, size: 19, ls: 4, weight: 600, color: th.accent});
      const q = s.t('body', dkClip(tx, 95), {x: x + 36, y: y + 70, w: gw - 72, size: 28, lh: 1.4, color: s.ink}); s.fit(q, 130, 17, 4); });
    out.push(s.finish('Diagnóstico')); }

  /* 4 · hipóteses */
  { const s = deckSlide(th, th.light);
    s.label('Hipóteses', m, 96);
    dkTitle(s, 'Cada desafio gera uma hipótese', m, 190, 1200, {size: 100, maxH: 250, maxLines: 2});
    const top = items[0], rest = items.slice(1, 5);
    if (top) { s.r('band', {x: m, y: 470, w: D.W - 2 * m, h: 230, fill: th.dark, radius: 6});
      s.t('kicker', refHip(top) + ' · ' + top.title.toUpperCase(), {x: m + 50, y: 505, w: 1500, size: 20, ls: 4, weight: 600, color: th.accent});
      const q = s.t('body', dkClip(hypText(pre, top), 190), {x: m + 50, y: 555, w: 1500, size: 34, lh: 1.35, color: th.white}); s.fit(q, 120, 22, 3); }
    const cw = (D.W - 2 * m - (Math.max(rest.length, 1) - 1) * 30) / Math.max(rest.length, 1);
    rest.forEach((it, i) => { const x = m + i * (cw + 30), y = 730; s.r('card', {x, y, w: cw, h: 250, stroke: s.line, strokeW: 2, fill: '', radius: 6});
      s.t('kicker', refHip(it), {x: x + 30, y: y + 26, w: cw - 60, size: 18, ls: 4, weight: 600, color: th.accent});
      const q = s.t('body', dkClip(hypText(pre, it), 110), {x: x + 30, y: y + 70, w: cw - 60, size: 24, lh: 1.4, color: s.ink}); s.fit(q, 160, 16, 5); });
    if (n > 5) s.t('muted', `+ ${n - 5} hipótese(s) no documento completo`, {x: m, y: 1000, w: 900, size: 20, color: s.mute});
    out.push(s.finish('Hipóteses')); }

  /* 5 · visão (essência e objetivo) */
  { const s = deckSlide(th, th.light);
    s.label('Nosso objetivo', 0, 110, {center: true});
    const t1 = dkTitle(s, dkClip(pre.objective, 150), 260, 230, 1400, {size: 92, maxH: 360, maxLines: 3, L: {align: 'center'}});
    const sup = s.t('body', dkFirstSentence(pre.justification, 150), {x: 360, y: 230 + s.h(t1) + 50, w: 1200, size: 46, lh: 1.25, align: 'center', color: s.mute, family: th.head}); s.fit(sup, 180, 28, 3);
    const yL = 230 + s.h(t1) + 50 + s.h(sup) + 50;
    s.r('accent-line', {x: D.W / 2 - 40, y: yL, w: 80, h: 3, fill: th.accent});
    const need = s.t('body', dkClip(d.need, 210), {x: 520, y: yL + 50, w: 880, size: 26, lh: 1.55, align: 'center', color: s.mute}); s.fit(need, 150, 18, 4);
    out.push(s.finish('Objetivo')); }

  /* 6 · OKR */
  { const s = deckSlide(th, th.light);
    s.label('OKR', m, 96);
    dkTitle(s, dkClip(pre.okr.objective || 'Objetivo', 90), m, 190, 1500, {size: 92, maxH: 250, maxLines: 2});
    const cols = [['Tração', pre.okr.tr], ['Estruturação', pre.okr.st]], cw = (D.W - 2 * m - 80) / 2;
    cols.forEach(([l, arr], c) => { const x = m + c * (cw + 80);
      s.t('kicker', l.toUpperCase(), {x, y: 470, w: cw, size: 22, ls: 4, weight: 600, color: th.accent}); s.r('col-head-line', {x, y: 515, w: cw, h: 2, fill: s.ink, opacity: 0.8});
      arr.filter(x => x.trim()).slice(0, 3).forEach((k, i) => { const y = 545 + i * 145;
        s.t('muted', String(i + 1).padStart(2, '0'), {x, y: y + 10, w: 70, size: 22, color: s.mute, ls: 2});
        const q = s.t('body', dkClip(k, 110), {x: x + 90, y, w: cw - 90, size: 28, lh: 1.35, color: s.ink}); s.fit(q, 110, 19, 3);
        if (i < 2) s.r('row-line', {x, y: y + 125, w: cw, h: 1, fill: s.line}); }); });
    out.push(s.finish('OKR')); }

  /* 7 · ICPs (só se existirem) */
  if (pre.icps.length) { const s = deckSlide(th, th.dark);
    s.label('Perfis prioritários', m, 96);
    dkTitle(s, 'Quem priorizamos', m, 190, 1200, {size: 108, maxH: 200, maxLines: 1});
    const k = Math.min(3, pre.icps.length), cw = (D.W - 2 * m - (k - 1) * 40) / k;
    pre.icps.slice(0, 3).forEach((x, i) => { const xx = m + i * (cw + 40), y = 460;
      s.r('card', {x: xx, y, w: cw, h: 500, stroke: s.line, strokeW: 2, fill: '', radius: 6});
      s.t('kicker', 'ICP ' + (i + 1) + ' · HIPÓTESE', {x: xx + 40, y: y + 40, w: cw - 80, size: 19, ls: 4, weight: 600, color: th.accent});
      const nm = s.t('title', dkClip(x.name || '—', 50), {x: xx + 40, y: y + 90, w: cw - 80, size: 46, lh: 1.12, family: th.head, color: th.white}); s.fit(nm, 130, 28, 2);
      const q = s.t('body', dkClip(x.need || x.profile || x.situation || '', 150), {x: xx + 40, y: y + 90 + Math.max(s.h(nm), 60) + 30, w: cw - 80, size: 25, lh: 1.45, color: th.muteDark}); s.fit(q, 230, 17, 7); });
    out.push(s.finish('ICPs')); }

  /* 8 · jornada */
  { const s = deckSlide(th, th.light);
    s.label('Jornada inicial', m, 96);
    dkTitle(s, 'Da situação à decisão', m, 190, 1300, {size: 100, maxH: 220, maxLines: 1});
    pre.journey.slice(0, 5).forEach((st, i) => { const y = 380 + i * 125, ph = st.dor || st.desejo || st.situacao || st.duvida || '—';
      s.t('muted', String(i + 1).padStart(2, '0'), {x: m, y: y + 12, w: 70, size: 22, color: s.mute, ls: 2});
      s.t('title', st.name, {x: m + 90, y: y + 4, w: 700, size: 36, family: th.head, color: s.ink});
      const q = s.t('body', dkClip(ph, 90), {x: m + 90, y: y + 52, w: 900, size: 22, lh: 1.35, color: s.mute}); s.fit(q, 60, 16, 2);
      if (i < 4) s.r('row-line', {x: m, y: y + 108, w: 1050, h: 1, fill: s.line}); });
    s.r('panel', {x: 1260, y: 380, w: 540, h: 590, fill: th.dark, radius: 6});
    s.t('kicker', 'FASES', {x: 1310, y: 420, w: 440, size: 20, ls: 4, weight: 600, color: th.accent});
    [['1 · Tração', 'fazer a demanda aparecer'], ['2 · Estruturação', 'organizar a conversão'], ['3 · Posicionamento', 'próximo gate']].forEach(([a, b], i) => { s.t('title', a, {x: 1310, y: 490 + i * 145, w: 440, size: 34, family: th.head, color: th.white}); s.t('body', b, {x: 1310, y: 540 + i * 145, w: 440, size: 24, color: th.muteDark}); });
    out.push(s.finish('Jornada')); }

  /* 9 · elevator pitch */
  { const s = deckSlide(th, th.dark);
    s.label('Elevator pitch · ~' + pitchSeconds(pre.pitch.text) + ' s', m, 96);
    const big = dkTitle(s, dkClip(pre.pitch.short || pre.objective, 130), m, 250, 1500, {size: 96, maxH: 360, maxLines: 3});
    const q = s.t('body', dkClip(pre.pitch.text, 330), {x: m, y: 250 + s.h(big) + 60, w: 1180, size: 30, lh: 1.55, color: th.muteDark}); s.fit(q, 330, 20, 8);
    out.push(s.finish('Pitch')); }

  /* 10 · próximo passo + rodapé */
  { const s = deckSlide(th, th.dark);
    s.r('final-panel', {x: m, y: 90, w: D.W - 2 * m, h: 560, fill: '', grad: {c1: mixHex(th.dark, th.accent, 0.35), c2: th.dark, a: 160}, radius: 6});
    s.label('Próximo passo', 0, 160, {center: true});
    dkTitle(s, 'Validar e abrir o projeto', 260, 240, 1400, {size: 110, maxH: 260, maxLines: 2, L: {align: 'center'}});
    const sup = s.t('body', 'Confirme as hipóteses com o cliente e aprove o pré-projeto para liberar o gate de Posicionamento.', {x: 560, y: 460, w: 800, size: 26, lh: 1.5, align: 'center', color: th.muteDark});
    s.r('cta', {x: D.W / 2 - 280, y: 560, w: 560, h: 96, fill: th.white}); s.t('cta-text', 'VALIDAR E APROVAR', {x: D.W / 2 - 260, y: 590, w: 520, size: 28, ls: 6, align: 'center', color: th.dark, weight: 500});
    s.r('foot-line', {x: m, y: 790, w: D.W - 2 * m, h: 1, fill: s.line});
    const cols = [['Projeto', p.name], ['Status', pre.status], ['Gerado em', fmtDate(new Date().toISOString())]], cw = (D.W - 2 * m) / 3;
    cols.forEach(([l, v], i) => { s.t('kicker', l.toUpperCase(), {x: m + i * cw, y: 830, w: cw - 40, size: 16, ls: 4, weight: 600, color: th.muteDark}); s.t('body', v, {x: m + i * cw, y: 868, w: cw - 40, size: 30, color: th.white}); });
    s.t('muted', 'AMPLIAÇÃO STUDIO', {x: m, y: 990, w: 700, size: 20, ls: 5, color: th.white}); s.t('muted', 'Nenhum gate estratégico é ultrapassado sem validação humana.', {x: D.W - m - 800, y: 992, w: 800, size: 17, color: th.muteDark, align: 'right'});
    out.push(s.finish('Próximo passo')); }

  /* contador de página (menos na capa e no final) */
  out.forEach((sl, i) => { if (i === 0 || i === out.length - 1) return; const dk = lum(sl.bg) < 0.3, c = dk ? th.muteDark : th.mute;
    sl.layers.push(T('muted', {content: (th.brandName + ' · Pré-Projeto').toUpperCase(), x: m, y: D.H - 60, w: 900, size: 16, ls: 3, color: c, family: th.body, weight: 400}), T('muted', {content: String(i + 1).padStart(2, '0') + ' / ' + String(out.length).padStart(2, '0'), x: D.W - m - 300, y: D.H - 60, w: 300, size: 16, ls: 3, color: c, align: 'right', family: th.body, weight: 400})); });
  out.forEach(sl => { let k = 0; sl.layers.forEach(l => { if (l.type === 'text') l.slot = sl.name + '#' + (k++); }); });
  return {slides: out, th};
}

/* ---- criar / abrir o conjunto no Editor de Design ---- */
function deckBuildSet(p) {
  const {slides, th} = deckSlides(p), tk = makeTokens(DESIGN_STYLES[0], FONT_PAIRS[0], PHOTO_STYLES[0], {name: 'Apresentação', accent: th.accent, bg: th.light, fg: th.ink, muted: th.mute});
  return {id: uid('ds'), name: 'Apresentação · ' + p.name, format: {id: 'deck', w: DECK.W, h: DECK.H}, tk, slides, deck: {pre: true}, created: new Date().toISOString(), updated: new Date().toISOString()};
}
/* com modelos salvos, pergunta de onde partir: padrão ou um dos seus modelos */
function preDeckChoose(force) {
  const list = (state.templates || []).filter(t => t.kind === 'deck');
  showModal('Montar a apresentação', `<p class="muted" style="margin-top:0;font-size:12px">Parta do visual padrão ou de um modelo seu. O texto sempre vem do Pré-Projeto.${force ? ' Os slides atuais serão substituídos.' : ''}</p><div class="tpl-list"><div class="tpl-row"><div><strong>Padrão do Studio</strong><small class="muted block">Usa as cores e fontes do Brand Kit, se houver</small></div><button class="btn sm dark" onclick="closeModal();preDeckOpen(${force ? 'true' : 'false'}, true)">Usar</button></div>${list.map(t => `<div class="tpl-row"><div><strong>${esc(t.name)}</strong><small class="muted block">Modelo salvo · ${t.slides.length} slides${t.from ? ' · de ' + esc(t.from) : ''}</small></div><button class="btn sm dark" onclick="dzTemplateUse('${t.id}')">Usar</button></div>`).join('')}</div><div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button></div>`);
}
async function preDeckOpen(force, skipChoose) {
  const p = preP(), pre = p.pre, items = preItems(pre);
  if (!items.length) { toast('Selecione ao menos um desafio para montar a apresentação.'); return; }
  let ex = pre.deckSetId && p.design.sets.find(s => s.id === pre.deckSetId);
  if ((!ex || force) && !skipChoose && (state.templates || []).some(t => t.kind === 'deck')) { preDeckChoose(!!(ex && force)); return; }
  if (ex && force && !confirm('Regenerar os slides a partir do Pré-Projeto? As edições feitas nos slides serão substituídas.')) return;
  if (!ex || force) {
    const th = deckTheme(p); await ensureFonts([th.head, th.body]); if (typeof brandFontsLoad === 'function') await brandFontsLoad(p);
    const set = deckBuildSet(p); await ensureSetResources(set);
    if (ex) { p.design.sets = p.design.sets.filter(s => s.id !== ex.id); }
    p.design.sets.push(set); pre.deckSetId = set.id; persist(); ex = set;
    if (force) toast('Slides regenerados (' + set.slides.length + ').');
  }
  go('design'); dzOpen(ex.id);
}

/* ---- apresentar / baixar: HTML com menu lateral que navega por clique ---- */
async function deckRenderImages(set, w) {
  await ensureSetResources(set); const f = set.format, h = Math.round(w * f.h / f.w), out = [];
  for (const sl of set.slides) { const c = document.createElement('canvas'); c.width = w; c.height = h; renderSlide(c.getContext('2d'), sl, f.w, f.h, w / f.w); out.push(c.toDataURL('image/jpeg', 0.9)); }
  return out;
}
function deckHTML(title, imgs, names, ratio) {
  const E2 = esc;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${E2(title)}</title><style>
*{box-sizing:border-box}html,body{margin:0;height:100%;background:#0b0b0b;color:#fff;font-family:Inter,system-ui,Arial,sans-serif;overflow:hidden}
aside{position:fixed;left:0;top:0;bottom:0;width:190px;background:#111;overflow:auto;padding:16px 12px;display:flex;flex-direction:column;align-items:center;gap:10px;scrollbar-width:none}aside::-webkit-scrollbar{display:none}aside a:first-child{margin-top:auto}aside a:last-child{margin-bottom:auto}
aside a{display:block;width:100%;border-radius:8px;cursor:pointer;padding:4px;transition:background .2s}aside a img{display:block;margin:0 auto;border-radius:4px;opacity:.6;transition:opacity .2s;aspect-ratio:${ratio};height:auto;width:min(100%,calc(max(34px,(100vh - 32px - (var(--n) - 1)*10px)/var(--n) - 8px)*${ratio}))}aside a.on,aside a:hover{background:#1d1d1d}aside a.on img,aside a:hover img{opacity:1}aside a.on img{outline:2px solid #fff}
main{margin-left:190px;height:100%;display:grid;place-items:center;padding:18px}.stage{width:min(100%,calc((100vh - 36px)*${ratio}));aspect-ratio:${ratio};position:relative}.stage img{width:100%;height:100%;display:block;border-radius:6px;object-fit:contain;cursor:pointer}
.fade{animation:fd .7s ease both}@keyframes fd{from{opacity:0}to{opacity:1}}
.fs aside{display:none}.fs main{margin:0;padding:0}.fs .stage{width:min(100vw,calc(100vh*${ratio}))}.fs .stage img{border-radius:0}
#fs{position:fixed;right:16px;bottom:16px;background:rgba(34,34,34,.85);color:#fff;border:0;border-radius:9px;padding:9px 13px;font:inherit;font-size:12px;cursor:pointer;opacity:.75;transition:opacity .2s}#fs:hover{opacity:1}.fs #fs{opacity:0}.fs #fs:hover{opacity:.9}
.all{display:none}@media(max-width:800px){aside{display:none}main{margin:0}}
@media print{aside,#fs,.stage{display:none!important}html,body{overflow:visible;height:auto}main{display:block;margin:0;padding:0}.all{display:block}.all img{display:block;width:100%;page-break-after:always}body{background:#fff}@page{size:landscape;margin:0}}
</style></head><body><aside style="--n:${imgs.length}">${imgs.map((im, i) => `<a data-i="${i}" title="${E2(names[i] || 'Slide ' + (i + 1))}"><img src="${im}" alt="${E2(names[i] || 'Slide ' + (i + 1))}"></a>`).join('')}</aside>
<main><div class="stage"><img id="cur" alt=""></div><div class="all">${imgs.map(im => `<img src="${im}" alt="">`).join('')}</div></main>
<button id="fs" title="Tela cheia (F)">Tela cheia</button>
<script>var IM=${JSON.stringify(imgs)},i=-1,cur=document.getElementById('cur'),links=[].slice.call(document.querySelectorAll('aside a'));
function show(k){k=Math.max(0,Math.min(IM.length-1,k));if(k===i)return;i=k;cur.classList.remove('fade');void cur.offsetWidth;cur.src=IM[i];cur.classList.add('fade');links.forEach(function(l,j){l.classList.toggle('on',j===i)});var a=links[i];if(a&&a.scrollIntoView)a.scrollIntoView({block:'nearest'});document.title=document.title.split(' · ')[0]+' · '+(i+1)+'/'+IM.length}
links.forEach(function(l){l.addEventListener('click',function(){show(+l.getAttribute('data-i'))})});
function fsEl(){return document.fullscreenElement||document.webkitFullscreenElement}
function toggleFs(){var d=document.documentElement;if(fsEl()){(document.exitFullscreen||document.webkitExitFullscreen).call(document)}else{(d.requestFullscreen||d.webkitRequestFullscreen||function(){}).call(d)}}
function syncFs(){document.body.classList.toggle('fs',!!fsEl())}
document.addEventListener('fullscreenchange',syncFs);document.addEventListener('webkitfullscreenchange',syncFs);
document.getElementById('fs').onclick=toggleFs;
document.addEventListener('keydown',function(e){if(['ArrowRight','ArrowDown','PageDown',' '].indexOf(e.key)>-1){e.preventDefault();show(i+1)}if(['ArrowLeft','ArrowUp','PageUp'].indexOf(e.key)>-1){e.preventDefault();show(i-1)}if(e.key==='Home')show(0);if(e.key==='End')show(IM.length-1);if(e.key==='f'||e.key==='F')toggleFs()});
cur.addEventListener('click',function(){show(i+1)});show(0);<\/script></body></html>`;
}
async function dzPresentDeck() {
  const set = dzSet(); if (!set) return; toast('Montando a apresentação…');
  const imgs = await deckRenderImages(set, 1280), p = dzP();
  showOverlay('Apresentação · ' + (p ? p.name : set.name), deckHTML(set.name, imgs, set.slides.map(s => s.name), set.format.w / set.format.h), `apresentacao-${slug(set.name)}.html`);
}
