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
/* ---- quantidade de slides escolhida pelo usuário (3 a 12, com capa e fechamento) ---- */
function carDims(c) {
  const n = carSlidesN(c.slides), total = carTotal(n), groups = n === 6 ? CAR_BASES[0].groups : Array.from({length: n - 2}, (_, k) => [2 + 3 * k, 3 + 3 * k, 4 + 3 * k]);
  return {n, total, groups, cta: [total - 2, total - 1]};
}
/* rótulo e faixa de caracteres de cada texto, conforme a estrutura do carrossel */
function carSlot(c, i) {
  const d = carDims(c), SZ = EDX().sizes; if (d.n === 6) return ED_CAR(i + 1, SZ);
  if (i === 0) return ['Capa · título', SZ.capa1]; if (i === 1) return ['Capa · subtítulo', SZ.capa2]; if (i === d.total - 2) return ['Fechamento', SZ.fechamento]; if (i === d.total - 1) return ['Assinatura', SZ.assinatura];
  const k = (i - 2) % 3; return k === 0 ? ['Título', SZ.titulo] : k === 1 ? ['Parágrafo', SZ.par] : ['Parágrafo curto', SZ.curto];
}
function carSpec(c) {
  const d = carDims(c); if (d.n === 6) return ED_SPEC.carrossel(); const SZ = EDX().sizes, mid = d.n - 2;
  return `CARROSSEL de EXATAMENTE ${d.n} slides, com EXATAMENTE ${d.total} textos nesta ordem: 1-2 capa (1 título, 2 subtítulo); depois ${mid} slides de miolo, cada um com 3 textos seguidos (título, parágrafo, parágrafo curto), do texto 3 ao ${d.total - 2}; ${d.total - 1} fechamento real (decorre da narrativa, não é slogan); ${d.total} assinatura. Cada slide de miolo desenvolve UMA ideia da linha editorial, em sequência lógica, sem repetir. Faixas de tamanho em caracteres: capa título ${SZ.capa1.join('-')}, capa subtítulo ${SZ.capa2.join('-')}, títulos ${SZ.titulo.join('-')}, parágrafos ${SZ.par.join('-')}, curtos ${SZ.curto.join('-')}, fechamento ${SZ.fechamento.join('-')}, assinatura ${SZ.assinatura.join('-')}. JSON: {"textos":["..." x${d.total}]}`;
}
/* troca o nº de slides mantendo a capa, o fechamento e o que der do miolo, bloco a bloco (título + parágrafos) */
function carResize(c, n) {
  n = carSlidesN(n); const old = carDims(c); if (n === old.n) return; const T = c.texts.map(t => t || '');
  const blocks = old.groups.map(ix => ({title: T[ix[0]], paras: ix.slice(1).map(i => T[i]).filter(Boolean)})), nc = Object.assign({}, c, {slides: n}), nd = carDims(nc), out = Array(nd.total).fill('');
  out[0] = T[0]; out[1] = T[1]; out[nd.cta[0]] = T[old.cta[0]]; out[nd.cta[1]] = T[old.cta[1]];
  nd.groups.forEach((ix, k) => { const b = blocks[k]; if (!b) return; out[ix[0]] = b.title || ''; ix.slice(1).forEach((pos, j) => { out[pos] = b.paras[j] || ''; }); });
  c.slides = n; c.texts = out.map(t => t.slice(0, 1200));
}
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
    const D = carDims(c), j = await motJSON(eSystem(), `${carCtx()}\n${fixed}Formato — ${carSpec(c)}\n${ENT_RULES}`, 7000);
    const T = (Array.isArray(j.textos) ? j.textos : []).slice(0, D.total).map(eStr); if (T.filter(Boolean).length < Math.ceil(D.total * 0.55)) throw new Error('a IA não devolveu o carrossel completo.'); while (T.length < D.total) T.push('');
    if (keep) { T[0] = keep[0]; T[1] = keep[1]; }   // a capa escolhida manda, mesmo que a IA reescreva
    c.texts = T;
  } catch (e) { toast(eErr(e)); }
  carState.busy = ''; carSave(); renderCarrosseis();
}
/* ---- copiar / colar ---- */
const carMd = () => carS().texts.map((t, i) => `${i + 1}. ${t.replace(/\n+/g, ' ').trim()}`).join('\n\n');
function carCopy() { try { navigator.clipboard.writeText(carMd()); toast('Texto copiado (numerado de 1 a ' + carS().texts.length + ').'); } catch (e) { showModal('Texto do carrossel', `<textarea rows="14" style="width:100%">${esc(carMd())}</textarea><div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button></div>`); } }
function carPasteOpen() { const e = $('carPaste'); if (e) e.focus(); }
/* aceita “1. texto”, “1) texto”, “1 - texto”, “1: texto”; sem numeração, usa blocos separados por linha em branco. Devolve a lista de textos (o nº de slides se ajusta a ela). */
function carParse(raw) {
  const t = String(raw || '').replace(/\r/g, '').trim(); if (!t) return null; const out = [], re = /^\s*(\d{1,2})\s*[.)\-–:·]\s+/; let cur = -1, hit = 0;
  t.split('\n').forEach(line => { const m = line.match(re); if (m && +m[1] >= 1 && +m[1] <= 34 && +m[1] - 1 > cur) { cur = +m[1] - 1; hit++; while (out.length < cur) out.push(''); out[cur] = line.replace(re, '').trim(); } else if (cur >= 0 && line.trim()) out[cur] += (out[cur] ? ' ' : '') + line.trim(); });
  if (hit >= 3) return out;
  const blocks = t.split(/\n{2,}/).map(x => x.replace(/\n+/g, ' ').trim()).filter(Boolean); return blocks.length >= 3 ? blocks.slice(0, 34) : null;
}
/* nº de slides que comporta N textos (18 = 6 slides; senão capa 2 + 3 por slide + fechamento 2) */
const carSlidesFor = N => N <= 18 && N >= 16 ? 6 : carSlidesN(Math.ceil((N - 4) / 3) + 2);
function carPasteApply() {
  const o = carParse($('carPaste').value); if (!o) { toast('Não reconheci o texto. Use a lista numerada (1. 2. 3. …) ou parágrafos separados por linha em branco.'); return; }
  const c = carS(), n = carSlidesFor(o.length); c.slides = n; const tot = carTotal(n); c.texts = o.concat(Array(tot).fill('')).slice(0, tot).map(x => x.slice(0, 1200)); $('carPaste').value = ''; carSave(); renderCarrosseis(); toast(`Texto aplicado: ${n} slides (${tot} textos).`);
}
function carClear() { if (!confirm('Limpar todos os textos?')) return; const c = carS(); c.texts = Array(carDims(c).total).fill(''); c.covers = []; carSave(); renderCarrosseis(); }
function carAudit() { const c = carS(), s = EDS(); s.content = {format: 'carrossel', parts: c.texts.map((t, i) => ({label: `${i + 1} · ${carSlot(c, i)[0]}`, texto: t}))}; s.format = 'carrossel'; s.audit = null; s.stage = 'auditoria'; eSave(); go('editorial'); }
/* Agente Editorial → Carrosséis: leva o carrossel gerado nas Entregas */
function eEntToCarousel() { const E = entS().carrossel; if (!E) return; const c = carNew('Carrossel do Agente Editorial', 'topo', ''); c.slides = 6; c.texts = E.parts.map(p => p.texto || '').concat(Array(18).fill('')).slice(0, 18); c.idea = ''; carSave(); go('carrosseis'); toast('Carrossel levado para a área de Carrosséis.'); }
