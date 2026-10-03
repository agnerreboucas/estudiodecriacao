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
const carState = {busy: '', thumbs: 0, paste: false};
function carS() {
  const p = curProject(); if (!p) return {base: 'brandsdecoded', cover: 'tese', style: '', dark: false, idea: '', useAgent: true, texts: Array(18).fill(''), covers: []};
  if (!p.carousel || !Array.isArray(p.carousel.texts)) p.carousel = normalizeCarousel(p.carousel); return p.carousel;
}
const carSave = () => persist();

function renderCarrosseis() {
  const r = $('carrosseisRoot'), p = curProject(); if (!r) return; if (!p) { r.innerHTML = noProject('Carrosséis'); return; }
  const c = carS(), B = carBase(), cov = B.covers.find(x => x.id === c.cover) || B.covers[0], styles = lyStyles(p), ready = aiReady(), has = c.texts.some(t => t.trim()), agentOK = !!(EDS().ideas && EDS().ideas[EDS().chosen] && EDS().brief);
  const SZ = EDX().sizes;
  r.innerHTML = `<div class="page-head"><div><h1>Carrosséis</h1><p>Escolha a base (criador) e a estrutura, gere o texto, copie ou cole, e ele cai nos slides do Editor de Design, tudo editável. ${esc(p.name)}.</p></div><div class="actions">${projectSelect()}</div></div>
  <div class="car-wrap"><div class="car-left">
    <div class="car-bases">${CAR_BASES.map(b => `<button class="tchip ${b.id === B.id ? 'on' : ''}" onclick="carS().base='${b.id}';carSave();renderCarrosseis()">${esc(b.name)}</button>`).join('')}<button class="tchip" disabled title="Novos criadores entram depois da base BrandsDecoded">＋ outros criadores (em breve)</button></div>
    <small class="muted block">${esc(B.desc)}</small>
    ${accSec('car', 'cap', '1 · Estrutura da capa', esc(cov.name), B.covers.map(x => `<label class="ent-opt ${x.id === cov.id ? 'on' : ''}" style="flex-direction:column;gap:2px"><span style="display:flex;gap:8px"><input type="radio" name="carcov" ${x.id === cov.id ? 'checked' : ''} onchange="carS().cover='${x.id}';carSave();renderCarrosseis()"><b>${esc(x.name)}</b></span><small class="muted">${esc(x.how)}</small></label>`).join(''), true)}
    ${accSec('car', 'cor', '2 · Estrutura do carrossel', '18 textos · 7 slides', `<ol class="car-slots">${B.slots.map((s, i) => `<li><b>${i + 1}</b> ${esc(s)}</li>`).join('')}</ol><small class="muted">Slides: capa (1–2) · bloco A (3–6) · bloco B (7–10) · bloco C (11–13) · bloco D (14–16) · fechamento (17–18).</small>`, false)}
    ${accSec('car', 'vis', '3 · Visual dos slides', '', `<label class="ins">Estilo<select onchange="carS().style=this.value;carSave();carThumbs()">${styles.map(s => `<option value="${s.id}" ${s.id === (c.style || styles[0].id) ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label><label class="ins inl"><input type="checkbox" ${c.dark ? 'checked' : ''} onchange="carS().dark=this.checked;carSave();carThumbs()"> fundo escuro</label>`, false)}
    <div class="okr-label" style="margin-top:14px">PRÉVIA DOS SLIDES</div><div class="car-prev" id="carPrev">${has ? '<small class="muted">Montando…</small>' : '<small class="muted">A prévia aparece quando houver texto.</small>'}</div>
  </div><div class="car-main">
    <div class="car-gen"><div class="okr-label">TEMA OU IDEIA</div><textarea rows="3" id="carIdea" oninput="carS().idea=this.value" placeholder="Sobre o que é o carrossel? Cole um tema, uma tese, um texto ou use a ideia do Agente Editorial.">${esc(c.idea)}</textarea>
      <label class="ins inl"><input type="checkbox" ${c.useAgent && agentOK ? 'checked' : ''} ${agentOK ? '' : 'disabled'} onchange="carS().useAgent=this.checked;carSave()"> usar a ideia, o briefing e o DNA do Agente Editorial${agentOK ? ': “' + esc((EDS().ideas[EDS().chosen].tese || '').slice(0, 60)) + '”' : ' (escolha uma ideia no Agente)'}</label>
      <div class="row-gap" style="flex-wrap:wrap;margin-top:6px"><button class="btn dark" onclick="carGenCover()" ${carState.busy || !ready ? 'disabled' : ''} title="${ready ? '' : 'IA não configurada (Configurações → Integrações)'}">${carState.busy === 'cover' ? 'Escrevendo…' : '✦ Gerar texto da capa'}</button><button class="btn dark" onclick="carGenAll()" ${carState.busy || !ready ? 'disabled' : ''}>${carState.busy === 'all' ? 'Escrevendo…' : '✦ Gerar texto do carrossel'}</button></div></div>
    ${c.covers.length ? `<div class="okr-label" style="margin-top:12px">OPÇÕES DE CAPA (clique para usar)</div>${c.covers.map((o, i) => `<button class="ed-hl ${c.texts[0] === o.titulo && c.texts[1] === o.subtitulo ? 'on' : ''}" onclick="carPickCover(${i})"><b>${esc(o.titulo)}</b><em>${esc(o.subtitulo)}</em></button>`).join('')}` : ''}
    <div class="section-row" style="margin-top:14px"><div class="okr-label">TEXTOS (editáveis)</div><div class="row-gap"><button class="btn sm" onclick="carCopy()" ${has ? '' : 'disabled'}>⧉ Copiar texto</button><button class="btn sm" onclick="carPasteOpen()">Colar texto</button></div></div>
    ${carState.paste ? `<div class="car-paste"><textarea id="carPaste" rows="8" placeholder="Cole aqui o texto numerado (1. … 2. … até 18.). Também aceito parágrafos separados por linha em branco."></textarea><div class="row-gap"><button class="btn sm dark" onclick="carPasteApply()">Aplicar nos slides</button><button class="btn sm" onclick="carState.paste=false;renderCarrosseis()">Cancelar</button></div></div>` : ''}
    <div class="car-texts">${c.texts.map((t, i) => { const [lab, rg] = ED_CAR(i + 1, SZ); const out = t && (t.length < rg[0] || t.length > rg[1]); return `<div class="car-t"><b>${i + 1} · ${esc(lab)}</b><textarea rows="${i === 0 || i === 1 || [2, 6, 10, 13].includes(i) ? 2 : 4}" oninput="carSet(${i},this.value)" placeholder="${esc(lab)}">${esc(t)}</textarea><small class="${out ? 'bad' : 'muted'}" id="carc${i}">${t.length} / ${rg[0]}–${rg[1]}</small></div>`; }).join('')}</div>
    <div class="row-gap" style="margin-top:12px;flex-wrap:wrap"><button class="btn dark" onclick="carToSlides()" ${has ? '' : 'disabled'}>Enviar aos slides (Editor de Design)</button><button class="btn" onclick="carAudit()" ${has ? '' : 'disabled'}>Auditar (anti-IA genérica)</button><button class="btn" onclick="carClear()">Limpar</button></div>
  </div></div>`;
  if (has) carThumbs();
}
function carSet(i, v) {
  const c = carS(); c.texts[i] = v.slice(0, 1200); carSave(); const [, rg] = ED_CAR(i + 1, EDX().sizes), el = $('carc' + i);
  if (el) { el.textContent = `${v.length} / ${rg[0]}–${rg[1]}`; el.className = v && (v.length < rg[0] || v.length > rg[1]) ? 'bad' : 'muted'; } carThumbsSoon();
}
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
function carPasteOpen() { carState.paste = true; renderCarrosseis(); setTimeout(() => $('carPaste') && $('carPaste').focus(), 30); }
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
  carS().texts = o.map(x => x.slice(0, 1200)); carState.paste = false; carSave(); renderCarrosseis(); toast('Texto aplicado nos slides.');
}
function carClear() { if (!confirm('Limpar todos os textos?')) return; const c = carS(); c.texts = Array(18).fill(''); c.covers = []; carSave(); renderCarrosseis(); }
function carAudit() { const c = carS(), s = EDS(); s.content = {format: 'carrossel', parts: c.texts.map((t, i) => ({label: `${i + 1} · ${ED_CAR(i + 1, EDX().sizes)[0]}`, texto: t}))}; s.format = 'carrossel'; s.audit = null; s.stage = 'auditoria'; eSave(); go('editorial'); }
/* ---- slides ---- */
function carCopyObj() {
  const c = carS(), B = carBase(), T = c.texts.map(t => (t || '').trim()), g = B.groups;
  return {cover: {kicker: '', title: T[0] || 'Título da capa', sub: T[1]}, slides: g.map(ix => ({title: T[ix[0]], body: ix.slice(1).map(i => T[i]).filter(Boolean).join('\n\n')})).filter(s => s.title || s.body), cta: {title: T[16] || '', sub: T[17] || '', button: (EDX().prod.cta || '').trim() || 'Salvar e compartilhar'}};
}
function carTokens() {
  const p = curProject(), c = carS(), B = carBase(), cov = B.covers.find(x => x.id === c.cover) || B.covers[0], tk = JSON.parse(JSON.stringify(lyTokens(p, c.style || lyStyles(p)[0].id)));
  tk.photoMode = 'none'; tk.align = cov.align; if (c.dark) { const bg = tk.bg; tk.bg = tk.fg; tk.fg = bg; if (tk.muted) tk.muted = mixHex(tk.bg, tk.fg, 0.6); } return tk;
}
function carBuildSet(name) { const p = curProject(), tk = carTokens(), fmt = resolveFmt({fmt: 'feed45', cw: 1080, ch: 1350}); return {set: buildSet(name, tk, carCopyObj(), fmt, p.name), tk}; }
const carThumbsSoon = debounce(() => carThumbs(), 500);
async function carThumbs() {
  const box = $('carPrev'); if (!box || !carS().texts.some(t => t.trim())) return; const tok = ++carState.thumbs;
  try {
    const {set, tk} = carBuildSet('prévia'); await ensureFonts(lyFamilies(tk)); await brandFontsLoad(curProject()); if (tok !== carState.thumbs || !$('carPrev')) return;
    box.innerHTML = ''; const W = set.format.w, H = set.format.h;
    for (const sl of set.slides) { const cv = document.createElement('canvas'); cv.width = 170; cv.height = Math.round(170 * H / W); cv.className = 'car-th'; box.appendChild(cv); renderSlide(cv.getContext('2d'), sl, W, H, cv.width / W); }
  } catch (e) { box.innerHTML = `<small class="muted">Não consegui montar a prévia: ${esc(e.message)}</small>`; }
}
async function carToSlides() {
  const p = curProject(), c = carS(); if (!c.texts.some(t => t.trim())) return; toast('Montando os slides…');
  try {
    const name = ((c.texts[0] || 'Carrossel').slice(0, 40)) + ' · carrossel', {set, tk} = carBuildSet(name); await ensureFonts(lyFamilies(tk)); await brandFontsLoad(p); await ensureSetResources(set);
    p.design.sets.push(set); persist(); go('design'); dzOpen(set.id); toast('Slides criados. Clique nos textos para editar e arraste para mover.');
  } catch (e) { toast('Não consegui montar os slides: ' + e.message); }
}
/* Agente Editorial → Carrosséis: leva o carrossel gerado nas Entregas */
function eEntToCarousel() { const E = entS().carrossel; if (!E) return; const c = carS(); c.texts = E.parts.map(p => p.texto || '').concat(Array(18).fill('')).slice(0, 18); carSave(); go('carrosseis'); toast('Carrossel levado para a área de Carrosséis.'); }
