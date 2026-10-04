/* ===== Mapa de peças e textos: o que cada tipo de peça gera, quantas peças e quais textos (e limites) ela exige.
   É a referência do estúdio de carrosséis (campos e checagem) e do que se pede à IA. Limites de anúncio são referência: confira na plataforma. ===== */
const CTA_CATALOG = {
  salvar: {n: 'Salvar o post', g: 'retencao', btn: 'Salvar este post', line: 'Salve para não perder e consultar depois.'},
  seguir: {n: 'Seguir o perfil', g: 'retencao', btn: 'Seguir o perfil', line: 'Siga o perfil para ver o próximo.'},
  compartilhar: {n: 'Compartilhar', g: 'acao', btn: 'Compartilhar', line: 'Envie para quem precisa ver isso.'},
  material: {n: 'Pegar o material completo', g: 'acao', btn: 'Quero o material completo', line: 'Pegue o material completo (link na bio).'},
  analise: {n: 'Agendar análise do seu caso', g: 'acao', btn: 'Agendar análise do meu caso', line: 'Agende uma análise do seu caso.'},
  bio: {n: 'Link na bio', g: 'acao', btn: 'Link na bio', line: 'Acesse pelo link na bio.'},
  codigo: {n: 'Comentar com o código', g: 'acao', btn: 'Comente {CÓDIGO}', line: 'Comente {CÓDIGO} e receba no direct.'}
};
const AD_BUTTONS = ['Saiba mais', 'Cadastre-se', 'Fale conosco', 'Enviar mensagem', 'Comprar agora', 'Baixar', 'Agendar agora', 'Pedir orçamento'];
const AD_LIMITS = {titulo: 40, texto: 125, descricao: 30};   // referência (Meta); confira na plataforma
const CAP_LIMITS = {legenda: 2200, visivel: 125, hashtags: 30};
/* CTAs exigidos pelo nº de slides: até 10 → 1; mais de 10 → 2 (1ª de retenção, 2ª de ação) */
function carCtas(c) {
  const k = carCtaCount(carSlidesN(c.slides)), def = k > 1 ? ['salvar', 'material'] : ['salvar'], cur = c.ctas || [];
  return Array.from({length: k}, (_, i) => Object.assign({type: def[i], code: '', text: '', line: ''}, cur[i] || {}));
}
function carCtaButton(c, i) {
  const k = carCtas(c)[i] || {type: 'salvar', code: '', text: ''}; if (k.text) return k.text; if (c.cta && c.cta.text && i === carCtas(c).length - 1) return c.cta.text;
  const t = CTA_CATALOG[k.type] || CTA_CATALOG.salvar; return t.btn.replace('{CÓDIGO}', k.code || 'CÓDIGO');
}
const PIECE_MAP = [
  {t: 'Carrossel (orgânico)', q: '3 a 12 slides', f: [['Capa', 'título chamativo (gancho) · subtítulo · indicador “arraste” (opcional)'], ['Slide interno', 'título · descrição breve'], ['CTA', 'até 10 slides: 1 chamada · mais de 10: 2 (retenção + ação) · texto do botão'], ['Publicação', 'legenda (até 2.200; as primeiras ~125 aparecem antes do “mais”) · hashtags']]},
  {t: 'Carrossel (anúncio)', q: '3 a 12 slides', f: [['Peça', 'mesmos textos do carrossel orgânico'], ['Anúncio', 'título · texto principal · descrição · botão de ação'], ['Referência', 'título ~40 · texto principal ~125 · descrição ~30 caracteres']]},
  {t: 'Post simples', q: '1 peça · 104 modelos', f: [['Peça', 'título (gancho) · apoio · @ (conforme o modelo)'], ['Publicação', 'legenda · hashtags (orgânico) ou título · texto principal · descrição (anúncio)']]},
  {t: 'Stories', q: '1 tela ou sequência de 5 a 7', f: [['Tela 1', 'gancho'], ['Telas do meio', 'texto curto'], ['Última tela', 'CTA com adesivo (enquete, caixa de perguntas ou link)']]},
  {t: 'Capa de vídeo / Reel', q: '1 peça', f: [['Capa', 'título curto'], ['Publicação', 'legenda · hashtags']]},
  {t: 'Anúncio de imagem', q: '5 variações por conjunto', f: [['Anúncio', 'título · texto principal · descrição · botão de ação']]},
  {t: 'Grid de carrosséis', q: '3 a 18 carrosséis', f: [['Cada pedaço', 'assunto (título da capa) + um carrossel completo']]},
  {t: 'Feed planejado', q: '9 a 24 espaços', f: [['Cada espaço', 'tom · tipo de peça · assunto provisório']]}
];
function pieceMapModal() {
  showModal('Mapa de peças e textos', `<small class="muted block" style="margin-bottom:8px">O que cada tipo de peça gera e os textos que ela exige. O estúdio usa este mapa para os campos, para a checagem de “o que falta” e para o que pede à IA.</small>
  ${PIECE_MAP.map(x => `<div class="okr-label" style="margin-top:10px">${esc(x.t.toUpperCase())} · ${esc(x.q)}</div>${x.f.map(([a, b]) => `<div class="list-item" style="padding:6px 8px"><div><strong style="font-size:12.5px">${esc(a)}</strong><small>${esc(b)}</small></div></div>`).join('')}`).join('')}
  <div class="okr-label" style="margin-top:12px">TIPOS DE CTA</div>${Object.values(CTA_CATALOG).map(t => `<div class="list-item" style="padding:6px 8px"><div><strong style="font-size:12.5px">${esc(t.n)}</strong><small>${t.g === 'retencao' ? 'retenção' : 'ação'} · botão “${esc(t.btn)}”</small></div></div>`).join('')}
  <div class="modal-actions"><button class="btn dark" onclick="closeModal()">Fechar</button></div>`);
  document.getElementById('modalBox').classList.add('wide');
}
/* o que ainda falta no carrossel (para o estúdio avisar) */
function carMissing(c) {
  const out = [], d = carDims(c), T = c.texts, miss = i => !String(T[i] || '').trim() || /^\[/.test(String(T[i]).trim());
  if (miss(0)) out.push('título da capa'); if (miss(1)) out.push('subtítulo da capa');
  d.groups.forEach((g, k) => { if (miss(g[0])) out.push(`título do slide ${k + 2}`); if (g.slice(1).every(miss)) out.push(`descrição do slide ${k + 2}`); });
  carCtas(c).forEach((k, i) => { if (k.type === 'codigo' && !k.code) out.push('código do CTA' + (d.ctas.length > 1 ? ' ' + (i + 1) : '')); });
  if (c.objective === 'anuncio') { if (!c.ad.titulo.trim()) out.push('título do anúncio'); if (!c.ad.texto.trim()) out.push('texto principal'); if (!c.ad.descricao.trim()) out.push('descrição'); } else if (!c.caption.trim()) out.push('legenda');
  return out;
}

/* texto que acompanha o carrossel na publicação: legenda + hashtags (orgânico) ou texto principal do anúncio */
function carPubText(c) {
  if (c.objective === 'anuncio') return [c.ad.titulo, c.ad.texto, c.ad.descricao].filter(Boolean).join('\n\n');
  const cap = (c.caption || '').trim(); if (cap) return cap + (c.hashtags ? '\n\n' + c.hashtags : '');
  return (c.texts[0] || '').replace(/\*\*/g, '') + (c.texts[1] ? '\n\n' + c.texts[1] : '');
}
