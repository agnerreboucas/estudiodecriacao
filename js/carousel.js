/* ===== Carrosséis: bases de estrutura (criadores) → texto → slides editáveis.
   Base 1: BrandsDecoded (18 textos: capa, 4 blocos de título + parágrafos, fechamento e assinatura).
   Fluxo: dois botões de geração (texto da capa / texto do carrossel) → copiar ou colar o texto → ele cai nos slides do Editor de Design.
   Novas bases entram em CAR_BASES (mesmo formato). ===== */
const CAR_SLOTS = ['Capa · título', 'Capa · subtítulo', 'Título', 'Parágrafo', 'Parágrafo', 'Parágrafo curto', 'Título', 'Parágrafo', 'Parágrafo', 'Parágrafo curto', 'Título', 'Parágrafo', 'Parágrafo', 'Título', 'Parágrafo', 'Parágrafo', 'Fechamento', 'Assinatura'];
const CAR_BASES = [{
  id: 'brandsdecoded', name: 'BrandsDecoded', desc: '18 textos em 7 slides: capa (título + subtítulo), 4 blocos (título + parágrafos), fechamento e assinatura.',
  n: 18, slots: CAR_SLOTS,
  groups: [[2, 3, 4, 5], [6, 7, 8, 9], [10, 11, 12], [13, 14, 15]],   // índices dos textos de cada slide de miolo (o 1º é o título)
  covers: [
    {id: 'tese', name: 'Tese direta', how: 'Título afirmativo e específico que sustenta uma tese; subtítulo que abre a tensão sem entregar a resposta.', align: 'left'},
    {id: 'pergunta', name: 'Pergunta que incomoda', how: 'Título em forma de pergunta que o leitor reconhece como dele; subtítulo que promete o outro ângulo.', align: 'left'},
    {id: 'contraste', name: 'Contraste (de X para Y)', how: 'Título que opõe o que era com o que passou a ser (X virou Y); subtítulo que nomeia o que mudou.', align: 'left'},
    {id: 'dado', name: 'Fato ou número + consequência', how: 'Título que parte de um fato ou número que esteja nas evidências do insumo (se não houver, use [CONFIRMAR: …]); subtítulo com a consequência.', align: 'center'}
  ]
}];
const carBase = () => CAR_BASES.find(b => b.id === carS().base) || CAR_BASES[0];
const carBaseOf = c => CAR_BASES.find(b => b.id === c.base) || CAR_BASES[0];
const carUI = {id: '', frame: 0};
const carState = {busy: '', thumbs: 0, paste: false, set: null};
function carS() {
  const p = curProject(); if (!p) return normalizeCarousel({});
  return p.carousels.find(x => x.id === carUI.id) || normalizeCarousel({});
}
const carSave = () => { const c = carS(); c.updated = new Date().toISOString(); persist(); };

/* ---- geração: dois botões ---- */
function carCtx() {
  const c = carS(), s = EDS(), ag = c.useAgent && s.ideas && s.ideas[s.chosen] && s.brief;
  return (ag ? eCtx() + '\n' : '') + (c.idea.trim() ? `TEMA / IDEIA DO USUÁRIO:\n${c.idea.trim()}\n` : '') + (eProdTxt() ? 'PRODUTO/CAMPANHA: ' + eProdTxt() + '\n' : '');
}
async function carGenCover() {
  const c = carS(), B = carBase(), cov = B.covers.find(x => x.id === c.cover) || B.covers[0], SZ = EDX().sizes; if (carState.busy) return;
  if (!carCtx().trim()) { toast('Escreva o tema/ideia ou use a ideia do Agente.'); return; }
  carState.busy = 'cover'; renderCarrosseis();
  try {
    const j = await motJSON(eSystem(), `${carCtx()}\nEscreva 5 OPÇÕES de capa de carrossel na estrutura “${cov.name}”: ${cov.how}\nTítulo: ${SZ.capa1.join('-')} caracteres. Subtítulo: ${SZ.capa2.join('-')} caracteres. As 5 opções devem ser diferentes entre si.\n${ENT_RULES}\nJSON: {"capas":[{"titulo":"","subtitulo":""}]}`, 2500);
    c.covers = (Array.isArray(j.capas) ? j.capas : []).slice(0, 6).map(o => ({titulo: eStr(o.titulo), subtitulo: eStr(o.subtitulo)})).filter(o => o.titulo); if (!c.covers.length) throw new Error('a IA não devolveu opções de capa.');
    carPickCover(0, true);
  } catch (e) { toast(eErr(e)); }
  carState.busy = ''; carSave(); renderCarrosseis();
}
function carPickCover(i, quiet) { const c = carS(), o = c.covers[i]; if (!o) return; c.texts[0] = o.titulo; c.texts[1] = o.subtitulo; carSave(); if (!quiet) renderCarrosseis(); }
async function carGenAll() {
  const c = carS(), B = carBase(), cov = B.covers.find(x => x.id === c.cover) || B.covers[0]; if (carState.busy) return;
  if (!carCtx().trim()) { toast('Escreva o tema/ideia ou use a ideia do Agente.'); return; }
  carState.busy = 'all'; renderCarrosseis();
  try {
    const keep = c.texts[0] && c.texts[1] ? [c.texts[0], c.texts[1]] : null;
    const fixed = c.texts[0] && c.texts[1] ? `A CAPA JÁ ESTÁ DEFINIDA: use exatamente como textos 1 e 2 → título: “${c.texts[0]}” · subtítulo: “${c.texts[1]}”.\n` : `Estrutura da capa (“${cov.name}”): ${cov.how}\n`;
    const j = await motJSON(eSystem(), `${carCtx()}\n${fixed}Formato — ${ED_SPEC.carrossel()}\n${ENT_RULES}`, 7000);
    const T = (Array.isArray(j.textos) ? j.textos : []).slice(0, 18).map(eStr); if (T.filter(Boolean).length < 10) throw new Error('a IA não devolveu o carrossel completo.'); while (T.length < 18) T.push('');
    if (keep) { T[0] = keep[0]; T[1] = keep[1]; }   // a capa escolhida manda, mesmo que a IA reescreva
    c.texts = T;
  } catch (e) { toast(eErr(e)); }
  carState.busy = ''; carSave(); renderCarrosseis();
}
/* ---- copiar / colar ---- */
const carMd = () => carS().texts.map((t, i) => `${i + 1}. ${t.replace(/\n+/g, ' ').trim()}`).join('\n\n');
function carCopy() { try { navigator.clipboard.writeText(carMd()); toast('Texto copiado (numerado de 1 a 18).'); } catch (e) { showModal('Texto do carrossel', `<textarea rows="14" style="width:100%">${esc(carMd())}</textarea><div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button></div>`); } }
function carPasteOpen() { const e = $('carPaste'); if (e) e.focus(); }
/* aceita “1. texto”, “1) texto”, “1 - texto”, “1: texto”; sem numeração, usa blocos separados por linha em branco */
function carParse(raw) {
  const t = String(raw || '').replace(/\r/g, '').trim(), out = Array(18).fill(''); if (!t) return null;
  const re = /^\s*(\d{1,2})\s*[.)\-–:·]\s+/; let cur = -1, hit = 0;
  t.split('\n').forEach(line => { const m = line.match(re); if (m && +m[1] >= 1 && +m[1] <= 18 && (+m[1] - 1 === cur + 1 || cur < 0 || +m[1] - 1 > cur)) { cur = +m[1] - 1; hit++; out[cur] = line.replace(re, '').trim(); } else if (cur >= 0 && line.trim()) out[cur] += (out[cur] ? ' ' : '') + line.trim(); });
  if (hit >= 3) return out;
  const blocks = t.split(/\n{2,}/).map(x => x.replace(/\n+/g, ' ').trim()).filter(Boolean); return blocks.length >= 3 ? blocks.slice(0, 18).concat(Array(18).fill('')).slice(0, 18) : null;
}
function carPasteApply() {
  const o = carParse($('carPaste').value); if (!o) { toast('Não reconheci o texto. Use a lista numerada (1. … 18.) ou parágrafos separados por linha em branco.'); return; }
  carS().texts = o.map(x => x.slice(0, 1200)); $('carPaste').value = ''; carSave(); renderCarrosseis(); toast('Texto aplicado nos slides.');
}
function carClear() { if (!confirm('Limpar todos os textos?')) return; const c = carS(); c.texts = Array(18).fill(''); c.covers = []; carSave(); renderCarrosseis(); }
function carAudit() { const c = carS(), s = EDS(); s.content = {format: 'carrossel', parts: c.texts.map((t, i) => ({label: `${i + 1} · ${ED_CAR(i + 1, EDX().sizes)[0]}`, texto: t}))}; s.format = 'carrossel'; s.audit = null; s.stage = 'auditoria'; eSave(); go('editorial'); }
/* Agente Editorial → Carrosséis: leva o carrossel gerado nas Entregas */
function eEntToCarousel() { const E = entS().carrossel; if (!E) return; const c = carNew('Carrossel do Agente Editorial', 'topo', ''); c.texts = E.parts.map(p => p.texto || '').concat(Array(18).fill('')).slice(0, 18); c.idea = ''; carSave(); go('carrosseis'); toast('Carrossel levado para a área de Carrosséis.'); }
