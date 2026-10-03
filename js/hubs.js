/* Matriz de Criação, Video Lab, Campanhas, Aprovação, Publicação, Performance & Learning */
const MATRIX = {
  hooks: ['Problema', 'Curiosidade', 'Alerta', 'Identificação', 'Contradição', 'Pergunta', 'Número', 'História'],
  angles: ['Problema', 'Educação', 'Erro', 'Oportunidade', 'Comparação', 'Checklist', 'História', 'Prova', 'Objeção'],
  formats: ['UGC', 'Especialista', 'Cinemático', 'Demo', 'Storytelling', 'Voice-over'],
  ctas: ['Saiba mais', 'Entenda seu caso', 'Veja como funciona', 'Fale conosco', 'Acesse', 'Salve e compartilhe'],
  direction: ['Close', 'Plano médio', 'POV', 'Push-in', 'Handheld', 'Luz natural', 'Editorial', 'Performance']
};
const MATRIX_LABEL = {hooks: '01 · Hooks', angles: '02 · Ângulos', formats: '03 · Formatos', ctas: '04 · CTAs', direction: '05 · Direção'};
const CONCEPT_KEY = {hooks: 'hook', angles: 'angle', formats: 'format', ctas: 'cta', direction: 'direction'};
const DURATIONS = [15, 6, 10, 20, 30, 60];
const FUNNEL = [100, 30, 12, 6];

const optionsOf = (p, k) => MATRIX[k].concat((p.matrix.custom || {})[k] || []);
function ensureSel(p) { const s = p.matrix.sel; Object.keys(MATRIX).forEach(k => { if (!Array.isArray(s[k])) s[k] = MATRIX[k].slice(0, 3); }); return s; }
const comboCount = p => Object.keys(MATRIX).reduce((n, k) => n * Math.max(1, ensureSel(p)[k].length), 1);

/* ---- aprendizado: pesos por variável a partir de métricas reais ---- */
function learnWeights(p) {
  const agg = {};
  p.metrics.forEach(m => {
    const c = p.matrix.concepts.find(x => x.id === m.conceptId);
    if (!c || !(+m.leads > 0) || !(+m.spend > 0)) return;
    Object.values(CONCEPT_KEY).forEach(k => { const a = agg[k + '|' + c[k]] = agg[k + '|' + c[k]] || {k, v: c[k], spend: 0, leads: 0, n: 0}; a.spend += +m.spend; a.leads += +m.leads; a.n++; });
  });
  const rows = Object.values(agg).map(a => Object.assign(a, {cpl: a.spend / a.leads}));
  if (!rows.length) return {rows: [], map: {}};
  const best = Math.min(...rows.map(r => r.cpl)); const map = {};
  rows.forEach(r => { r.w = Math.max(1, Math.round(100 * best / r.cpl)); map[r.k + '|' + r.v] = r.w; });
  return {rows: rows.sort((a, b) => b.w - a.w), map};
}
function conceptScore(p, c, map) {
  const ws = Object.values(CONCEPT_KEY).map(k => map[k + '|' + c[k]] ?? 50);
  return ws.reduce((a, b) => a + b, 0) / ws.length + Math.random() * 8;
}
function hookLine(p, c) {
  const pre = p.pre, ic = pre.icps[0] || {}, j = pre.journey;
  const dor = (j[1] && j[1].dor) || (j[0] && j[0].dor) || ic.need || '[dor do público]';
  const situ = ic.situation || '[situação do público]', duvida = (j[2] && j[2].duvida) || (j[1] && j[1].duvida) || '[dúvida do público]';
  const tema = p.brand.positioning || p.desc || p.name;
  return ({Problema: `Você já passou por isso: ${dor}?`, Curiosidade: `O que quase ninguém conta sobre ${tema}`, Alerta: `Atenção antes de decidir: ${dor}`, Identificação: `Se ${situ}, isto é para você`,
    Contradição: `Parece óbvio, mas ${tema} funciona ao contrário`, Pergunta: `Você sabe mesmo ${duvida}?`, Número: `3 sinais de que ${tema} merece atenção`, História: `Ele chegou até nós com este problema: ${dor}`})[c.hook] || c.hook;
}
const shownConcepts = p => p.matrix.concepts.slice().sort((a, b) => (b.pinned - a.pinned) || (b.score - a.score)).slice(0, p.matrix.stage);

/* ---- Matriz de Criação ---- */
function renderMatrixPage() {
  const p = curProject(), r = $('matrixRoot'); if (!p) { r.innerHTML = noProject('Matriz de Criação'); return; }
  const sel = ensureSel(p), m = p.matrix, shown = shownConcepts(p), lw = learnWeights(p);
  r.innerHTML = `<div class="page-head"><div><h1>Matriz de Criação</h1><p>Combine contexto, hooks, ângulos, formatos e direção antes de gastar créditos. Primeiro o conceito, depois a produção.</p></div><div class="actions">${projectSelect()}<button class="btn dark" onclick="generateConcepts()">Gerar conceitos</button></div></div>
  <div class="matrix-toolbar"><div class="matrix-tabs">${DURATIONS.map(d => `<button class="${d === m.duration ? 'active' : ''}" onclick="setDuration(${d})">${d}s</button>`).join('')}</div><span class="badge hot">${esc(p.name)}</span><span class="badge">Contexto herdado do projeto</span>${lw.rows.length ? '<span class="badge">Pesos aprendidos ativos</span>' : ''}</div>
  <div class="matrix-grid">${Object.keys(MATRIX).map(k => `<div class="matrix-card"><h3>${MATRIX_LABEL[k]}</h3><div class="matrix-options">${optionsOf(p, k).map((v, i) => `<button class="matrix-opt ${sel[k].includes(v) ? 'selected' : ''}" onclick="toggleMatrix('${k}',${i})">${esc(v)}</button>`).join('')}<button class="matrix-opt add" title="Adicionar opção" onclick="addMatrixOption('${k}')">＋</button></div></div>`).join('')}
    <div class="matrix-card"><h3>Potencial combinatório</h3><div class="matrix-count">${fmtNum(comboCount(p))}</div><div class="matrix-muted">combinações possíveis antes do filtro de conceito.</div><div style="margin-top:12px"><button class="btn" onclick="selectAllMatrix()">Selecionar tudo</button></div></div></div>
  <div class="panel" style="margin-top:12px"><div class="section-row"><h2>Pipeline de conceitos</h2><span class="muted">100 → 30 → 12 → 6 → produção</span></div>
    <div class="funnel">${FUNNEL.map(n => `<button class="${m.stage === n ? 'active' : ''}" onclick="setStage(${n})"><b>${n}</b><small>${n === 100 ? 'conceitos' : n === 6 ? 'finalistas' : 'selecionados'}</small></button>`).join('')}</div>
    ${m.concepts.length ? `<div class="concept-list">${shown.map((c, i) => `<article class="concept ${c.pinned ? 'pinned' : ''}"><span class="badge ${i < 3 ? 'hot' : ''}">${c.creativeId ? 'EM PRODUÇÃO' : i < 3 ? 'TOP ' + Math.min(3, shown.length) : 'CONCEITO'}</span><strong>${esc(c.hook)} × ${esc(c.angle)}</strong><small>${m.duration}s · ${esc(c.format)} · ${esc(c.direction)} · CTA “${esc(c.cta)}”</small><p class="hook-line">${esc(hookLine(p, c))}</p><div class="row-gap"><button class="btn sm" onclick="pinConcept('${c.id}')">${c.pinned ? '★ Fixado' : '☆ Fixar'}</button><button class="btn sm" onclick="openInVideoLab('${c.id}')">Video Lab →</button></div></article>`).join('')}</div>
      <div class="modal-actions" style="justify-content:space-between"><span class="muted" style="font-size:11px">Mostrando ${shown.length} de ${m.concepts.length}. Fixe os favoritos para que sobrevivam ao funil.</span><button class="btn dark" onclick="sendToProduction()">Enviar ${shown.filter(c => !c.creativeId).length} para produção</button></div>`
      : emptyState('Nenhum conceito ainda', 'Escolha as variáveis acima e clique em “Gerar conceitos”. Gerar conceitos não consome créditos.')}
  </div>`;
}
function setDuration(d) { const p = curProject(); p.matrix.duration = d; p.video.scenes = []; persist(); renderMatrixPage(); }
function toggleMatrix(k, i) { const p = curProject(), s = ensureSel(p), v = optionsOf(p, k)[i], a = s[k]; if (a.includes(v)) a.splice(a.indexOf(v), 1); else a.push(v); persist(); keepScroll(renderMatrixPage); }
function selectAllMatrix() { const p = curProject(); Object.keys(MATRIX).forEach(k => p.matrix.sel[k] = optionsOf(p, k)); persist(); renderMatrixPage(); toast('Núcleo completo selecionado.'); }
function addMatrixOption(k) {
  askText('Nova opção · ' + MATRIX_LABEL[k], 'Texto curto (até 40 caracteres)', v => { const p = curProject(); v = v.trim().slice(0, 40); if (optionsOf(p, k).some(x => x.toLowerCase() === v.toLowerCase())) { toast('Essa opção já existe.'); return; } p.matrix.custom = p.matrix.custom || {}; (p.matrix.custom[k] = p.matrix.custom[k] || []).push(v); ensureSel(p)[k].push(v); persist(); renderMatrixPage(); });
}
function setStage(n) { curProject().matrix.stage = n; persist(); keepScroll(renderMatrixPage); }
function pinConcept(id) { const c = curProject().matrix.concepts.find(x => x.id === id); c.pinned = !c.pinned; persist(); keepScroll(renderMatrixPage); }
function generateConcepts() {
  const p = curProject(), s = ensureSel(p);
  if (Object.keys(MATRIX).some(k => !s[k].length)) { toast('Selecione ao menos uma opção em cada coluna.'); return; }
  const lw = learnWeights(p), combos = [], seen = new Set();
  const total = comboCount(p), tries = Math.min(total, 4000);
  const keep = p.matrix.concepts.filter(c => c.pinned || c.creativeId || p.metrics.some(m => m.conceptId === c.id));
  keep.forEach(c => seen.add([c.hook, c.angle, c.format, c.cta, c.direction].join('|')));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  for (let i = 0, guard = 0; combos.length < tries && guard < tries * 6; guard++) {
    const c = {hook: pick(s.hooks), angle: pick(s.angles), format: pick(s.formats), cta: pick(s.ctas), direction: pick(s.direction)}, key = Object.values(c).join('|');
    if (seen.has(key)) continue; seen.add(key); combos.push(c); i++;
  }
  const fresh = combos.map(c => Object.assign(c, {id: uid('k'), pinned: false, creativeId: '', score: conceptScore(p, c, lw.map)})).sort((a, b) => b.score - a.score).slice(0, Math.max(0, 100 - keep.length));
  p.matrix.concepts = keep.concat(fresh); p.matrix.stage = 100; persist(); renderMatrixPage();
  toast(`${p.matrix.concepts.length} conceitos gerados${lw.rows.length ? ' (ordenados pelos pesos aprendidos)' : ''}.`);
}
function sendToProduction() {
  const p = curProject(), shown = shownConcepts(p).filter(c => !c.creativeId);
  if (p.matrix.stage > 12) { toast('Reduza o funil para 12 ou 6 conceitos antes de enviar para produção.'); return; }
  if (!shown.length) { toast('Nada novo para enviar.'); return; }
  shown.forEach(c => {
    const cr = {id: uid('c'), projectId: p.id, title: `${c.hook} × ${c.angle}`, type: `Vídeo ${p.matrix.duration}s`, cls: 'a4', status: 'Para aprovação', brief: hookLine(p, c) + ` · CTA: ${c.cta}`, created: new Date().toISOString()};
    state.creatives.unshift(cr); c.creativeId = cr.id; addApproval(p, cr.title, 'Conceito', 'creative', cr.id);
  });
  persist(); renderMatrixPage(); toast(`${shown.length} conceito(s) enviados para a fila de Aprovação.`);
}
function openInVideoLab(id) { const p = curProject(); p.video.conceptId = id; p.video.scenes = []; p.video.steps = {}; persist(); go('videoLab'); }

/* ---- Video Lab ---- */
const SCENE_PLAN = {
  6: [['Hook', 2], ['Ideia', 2], ['CTA', 2]], 10: [['Hook', 2], ['Problema', 3], ['Solução', 3], ['CTA', 2]],
  15: [['Hook', 2], ['Problema', 3], ['Ideia', 3], ['Solução', 2], ['Prova', 3], ['CTA', 2]],
  20: [['Hook', 2], ['Problema', 4], ['Ideia', 4], ['Solução', 4], ['Prova', 3], ['CTA', 3]],
  30: [['Hook', 3], ['Problema', 5], ['Ideia', 5], ['Solução', 6], ['Prova', 6], ['Objeção', 3], ['CTA', 2]],
  60: [['Hook', 3], ['Problema', 8], ['Ideia', 8], ['Solução', 12], ['Prova', 12], ['Objeção', 7], ['Demonstração', 7], ['CTA', 3]]
};
const VSTEPS = ['Briefing', 'Roteiro', 'Aprovação do roteiro', 'Storyboard', 'Direção', 'Geração por cena', 'Revisão', 'Edição', 'Voz, música e SFX', 'Aprovação final', 'Exportação'];
const FRAMES = ['Close', 'Plano médio', 'POV', 'Close', 'Plano médio', 'Close', 'Plano médio', 'Close'], MOVES = ['Push-in', 'Estático', 'Handheld', 'Estático', 'Travelling', 'Estático', 'Estático', 'Push-in'], LIGHTS = ['Luz natural', 'Editorial', 'Performance'];
const sceneCost = s => s.model === 'qualidade' ? 8 : 4;
const FIXED_COST = 6;
function buildScenes(p, c) {
  const plan = SCENE_PLAN[p.matrix.duration] || SCENE_PLAN[15]; let t = 0;
  return plan.map(([stage, d], i) => {
    const s = {stage, start: t, end: t + d, frame: FRAMES[i % 8], move: MOVES[i % 8], light: LIGHTS[i % 3], lens: 'Natural, 35 mm', action: '', text: '', model: ['Hook', 'CTA'].includes(stage) ? 'rápido' : 'qualidade'};
    if (i === 0) { if (FRAMES.slice(0, 3).includes(c.direction)) s.frame = c.direction; if (['Push-in', 'Handheld'].includes(c.direction)) s.move = c.direction; s.action = hookLine(p, c); s.text = hookLine(p, c); }
    if (LIGHTS.includes(c.direction)) s.light = c.direction;
    if (stage === 'CTA') { s.action = `Chamada para ação: ${c.cta}`; s.text = c.cta; }
    t += d; return s;
  });
}
function activeConcept(p) { return p.matrix.concepts.find(c => c.id === p.video.conceptId); }
function renderVideoLab() {
  const p = curProject(), r = $('videoRoot'); if (!p) { r.innerHTML = noProject('Video Lab'); return; }
  const c = activeConcept(p);
  const head = hubHead('Video Lab', 'Roteiro → aprovação → storyboard → direção → geração por cena → edição.', c ? `<button class="btn" onclick="exportStoryboard()">⬇ Storyboard</button>` : '');
  if (!c) {
    r.innerHTML = head + (p.matrix.concepts.length
      ? `<div class="panel"><h3>Escolha um conceito</h3><p class="muted">Selecione um conceito da Matriz para montar roteiro e storyboard.</p><div class="list">${shownConcepts(p).slice(0, 12).map(x => `<div class="list-item"><div><strong>${esc(x.hook)} × ${esc(x.angle)}</strong><small>${esc(x.format)} · ${esc(x.direction)}</small></div><button class="btn sm" onclick="openInVideoLab('${x.id}')">Abrir</button></div>`).join('')}</div></div>`
      : emptyState('Sem conceito ativo', 'Gere conceitos na Matriz de Criação e escolha um para produzir.', '<button class="btn dark" onclick="go(\'matrix\')">Ir para a Matriz</button>'));
    return;
  }
  if (!p.video.scenes.length) { p.video.scenes = buildScenes(p, c); persist(); }
  const sc = p.video.scenes, cost = sc.reduce((a, s) => a + sceneCost(s), 0) + FIXED_COST, steps = p.video.steps;
  const nextIdx = VSTEPS.findIndex(s => !steps[s]);
  r.innerHTML = head + `<div class="two"><div class="panel"><h3>Vídeo de ${p.matrix.duration} segundos · conceito ativo</h3>
      <div class="kv"><span>Hook</span><strong>${esc(c.hook)}</strong></div><div class="kv"><span>Ângulo</span><strong>${esc(c.angle)}</strong></div><div class="kv"><span>Formato</span><strong>${esc(c.format)}</strong></div><div class="kv"><span>CTA</span><strong>${esc(c.cta)}</strong></div>
      <div class="kv"><span>Estrutura</span><strong>${sc.map(s => `${s.start}–${s.end}s ${esc(s.stage)}`).join(' · ')}</strong></div></div>
    <div class="credit-box"><div class="label" style="color:#aaa">Produção estimada ${tag('simulacao')}</div><div class="metric">${cost} créditos</div><div style="font-size:10px;color:#aaa">${sc.length} cenas · geração + voz + edição</div><div class="row-gap" style="margin-top:12px"><button class="btn" onclick="aiScript()">✦ Roteiro com IA</button><button class="btn" onclick="rebuildScenes()">Refazer cenas</button></div></div></div>
  <div class="panel" style="margin-top:12px"><h3>Fluxo de produção</h3><div class="vsteps">${VSTEPS.map((s, i) => `<button class="vstep ${steps[s] ? 'done' : i === nextIdx ? 'next' : ''}" onclick="toggleVStep(${i})"><b>${pad(i + 1, 2)}</b>${esc(s)}</button>`).join('')}</div><small class="muted">A geração por cena precisa de um provedor de vídeo conectado (ainda não configurado). Até lá, exporte o storyboard e gere no provedor de sua escolha.</small></div>
  <div class="panel" style="margin-top:12px"><h3>Storyboard e direção por cena</h3><div class="scene-grid">${sc.map((s, i) => `<article class="scene-card" onclick="sceneModal(${i})"><div class="scene-top"><span>CENA ${pad(i + 1, 2)} · ${s.start}–${s.end}s</span><b>${esc(s.stage)}</b></div><div class="scene-body"><strong>${esc(s.frame)} + ${esc(s.move)}</strong><small>${esc(s.light)} · modelo ${esc(s.model)} · ${sceneCost(s)} créditos</small>${s.action ? `<p>${esc(s.action)}</p>` : '<p class="muted">Clique para descrever a ação.</p>'}</div></article>`).join('')}</div></div>
  <div class="panel" style="margin-top:12px"><h3>Skills do Video Lab</h3><div class="skill-list"><div class="skill"><b>Script Writer</b><small>Hook + roteiro de performance</small></div><div class="skill"><b>Art Director</b><small>Identidade + composição</small></div><div class="skill"><b>Cinematographer</b><small>Enquadramento, lente e movimento</small></div><div class="skill"><b>Model Router</b><small>Modelo rápido vs. qualidade, por cena</small></div></div></div>`;
}
function rebuildScenes() { const p = curProject(); if (!confirm('Refazer as cenas descarta suas edições. Continuar?')) return; p.video.scenes = buildScenes(p, activeConcept(p)); persist(); renderVideoLab(); }
function sceneModal(i) {
  const s = curProject().video.scenes[i];
  showModal(`Cena ${pad(i + 1, 2)} · ${s.stage}`, `<div class="form-grid"><div class="field"><label>Enquadramento</label><input id="scFrame" value="${esc(s.frame)}"></div><div class="field"><label>Movimento</label><input id="scMove" value="${esc(s.move)}"></div><div class="field"><label>Iluminação</label><input id="scLight" value="${esc(s.light)}"></div><div class="field"><label>Lente / estética</label><input id="scLens" value="${esc(s.lens)}"></div>
    <div class="field full"><label>Ação</label><textarea id="scAction" rows="2">${esc(s.action)}</textarea></div><div class="field"><label>Texto na tela</label><input id="scText" value="${esc(s.text)}"></div><div class="field"><label>Modelo recomendado</label><select id="scModel"><option value="rápido" ${s.model === 'rápido' ? 'selected' : ''}>Rápido (4 créditos)</option><option value="qualidade" ${s.model === 'qualidade' ? 'selected' : ''}>Qualidade (8 créditos)</option></select></div></div>
    <div class="modal-actions"><button class="btn dark" onclick="sceneSave(${i})">Salvar cena</button></div>`);
}
function sceneSave(i) { const s = curProject().video.scenes[i]; Object.assign(s, {frame: $('scFrame').value, move: $('scMove').value, light: $('scLight').value, lens: $('scLens').value, action: $('scAction').value, text: $('scText').value, model: $('scModel').value}); persist(); closeModal(); renderVideoLab(); }
function toggleVStep(i) {
  const p = curProject(), st = p.video.steps, name = VSTEPS[i], c = activeConcept(p);
  if (st[name]) { if (VSTEPS.slice(i + 1).some(s => st[s])) { toast('Desfaça primeiro as etapas seguintes.'); return; } delete st[name]; persist(); renderVideoLab(); return; }
  if (i > 0 && !st[VSTEPS[i - 1]]) { toast('Conclua a etapa anterior: ' + VSTEPS[i - 1]); return; }
  const ref = k => p.approvals.find(a => a.refType === 'video' && a.refId === c.id && a.kind === k);
  if (name === 'Aprovação do roteiro' && !(ref('Roteiro') && ref('Roteiro').status === 'Aprovado')) { toast('Aprove o roteiro na tela Aprovação.'); return; }
  if (name === 'Aprovação final' && !(ref('Vídeo final') && ref('Vídeo final').status === 'Aprovado')) { toast('Aprove o vídeo final na tela Aprovação.'); return; }
  if (name === 'Roteiro' && !ref('Roteiro')) addApproval(p, `Roteiro · Vídeo ${p.matrix.duration}s · ${c.hook} × ${c.angle}`, 'Roteiro', 'video', c.id);
  if (name === 'Voz, música e SFX' && !ref('Vídeo final')) addApproval(p, `Vídeo final · ${p.matrix.duration}s · ${c.hook} × ${c.angle}`, 'Vídeo final', 'video', c.id);
  st[name] = new Date().toISOString(); persist(); renderVideoLab();
}
async function aiScript() {
  if (!aiReady()) { toast('IA não configurada. Veja Integrações.'); return; }
  const p = curProject(), c = activeConcept(p), sc = p.video.scenes;
  try {
    toast('Escrevendo roteiro…');
    const j = await aiJSON(`Escreva o roteiro de um vídeo de ${p.matrix.duration}s. Responda só JSON: um array com ${sc.length} objetos {"action","text"} na ordem das cenas: ${sc.map(s => s.stage).join(', ')}. "action" descreve o que se vê/ouve; "text" é o texto curto na tela. Sem promessas absolutas, sem inventar dados.`,
      projectContext(p) + `\nConceito: hook ${c.hook}, ângulo ${c.angle}, formato ${c.format}, CTA ${c.cta}.`);
    (Array.isArray(j) ? j : []).slice(0, sc.length).forEach((x, i) => { sc[i].action = String(x.action || ''); sc[i].text = String(x.text || ''); });
    spendCredits(1); persist(); renderVideoLab(); toast('Roteiro sugerido: revise cena a cena.');
  } catch (e) { toast('IA: ' + e.message); }
}
function exportStoryboard() {
  const p = curProject(), c = activeConcept(p), sc = p.video.scenes;
  const md = `# Storyboard — ${p.name}\n\nConceito: ${c.hook} × ${c.angle} · ${c.format} · CTA: ${c.cta} · ${p.matrix.duration}s\n\n` + sc.map((s, i) => `## Cena ${pad(i + 1, 2)} · ${s.start}–${s.end}s · ${s.stage}\n- Enquadramento: ${s.frame}\n- Movimento: ${s.move}\n- Iluminação: ${s.light}\n- Lente/estética: ${s.lens}\n- Ação: ${s.action}\n- Texto na tela: ${s.text}\n- Modelo: ${s.model} (${sceneCost(s)} créditos estimados)\n`).join('\n');
  download(`storyboard-${slug(p.name)}.md`, md, 'text/markdown');
}

/* ---- Aprovação ---- */
function addApproval(p, title, kind, refType, refId) { p.approvals.unshift({id: uid('ap'), title, kind, status: 'Pendente', note: '', refType, refId, created: new Date().toISOString()}); }
function approvalSet(id, status, note) {
  const p = curProject(), a = p.approvals.find(x => x.id === id); if (!a) return;
  a.status = status; a.note = note || ''; a.decidedAt = new Date().toISOString();
  if (a.refType === 'creative') { const c = state.creatives.find(x => x.id === a.refId); if (c) c.status = status === 'Aprovado' ? 'Aprovado' : 'Ajustes'; }
  persist(); if (API.available && API.status && API.status.webhook && API.status.webhook.configured && !needsLogin()) sendWebhook('aprovacao', {project: p.name, item: a.title, kind: a.kind, status}).catch(() => {});
  renderApprovalPage(); renderHome();
}
function approvalAdjust(id) { askText('Pedir ajustes', 'O que precisa mudar?', n => approvalSet(id, 'Ajustes', n)); }
function approveAll() { const p = curProject(), pend = p.approvals.filter(a => a.status === 'Pendente'); if (!pend.length) { toast('Nada pendente.'); return; } if (!confirm(`Aprovar ${pend.length} item(ns) pendentes?`)) return; pend.forEach(a => { a.status = 'Aprovado'; a.decidedAt = new Date().toISOString(); if (a.refType === 'creative') { const c = state.creatives.find(x => x.id === a.refId); if (c) c.status = 'Aprovado'; } }); persist(); renderApprovalPage(); toast('Lote aprovado.'); }
function approvalsHTML(p) {
  return p.approvals.length ? `<div class="list">${p.approvals.map(a => `<div class="list-item"><div><strong>${esc(a.title)}</strong><small>${esc(a.kind)} · ${fmtDate(a.created)}${a.note ? ' · ' + esc(a.note) : ''}</small></div><div class="row-gap"><span class="st-pill st-${a.status.toLowerCase()}">${esc(a.status)}</span>${a.status !== 'Aprovado' ? `<button class="btn sm dark" onclick="approvalSet('${a.id}','Aprovado')">Aprovar</button>` : ''}${a.status === 'Pendente' ? `<button class="btn sm" onclick="approvalAdjust('${a.id}')">Ajustes</button>` : ''}</div></div>`).join('')}</div>` : emptyState('Fila vazia', 'Conceitos, roteiros e criações enviados para aprovação aparecem aqui.');
}
function renderApprovalPage() {
  const p = curProject(), r = $('approvalRoot'); if (!p) { r.innerHTML = noProject('Aprovação'); return; }
  r.innerHTML = hubHead('Aprovação', 'Gate de revisão antes de publicação ou gasto de créditos.', `<button class="btn dark" onclick="approveAll()">Aprovar lote</button>`) + `<div class="panel">${approvalsHTML(p)}</div>`;
}

/* ---- Campanhas ---- */
function createCampaign() {
  const p = curProject(), n = $('cmpName').value.trim(); if (!n) { toast('Dê um nome à campanha.'); return; }
  p.campaigns.push({id: uid('cm'), name: n, objective: $('cmpObj').value, budget: +$('cmpBudget').value || 0, channel: $('cmpChan').value, status: 'Rascunho'});
  persist(); closeModal(); if (ui.page === 'project') renderProjectTab(); else renderPage(ui.page); toast('Campanha criada como rascunho.');
}
function cycleCampaign(id) { const c = curProject().campaigns.find(x => x.id === id); c.status = {Rascunho: 'Ativa', Ativa: 'Pausada', Pausada: 'Ativa'}[c.status]; persist(); ui.page === 'project' ? renderProjectTab() : renderCampaignsPage(); }
function deleteCampaign(id) { if (!confirm('Excluir campanha?')) return; const p = curProject(); p.campaigns = p.campaigns.filter(x => x.id !== id); persist(); ui.page === 'project' ? renderProjectTab() : renderCampaignsPage(); }
function campaignsHTML(p) {
  const m = p.matrix;
  return `<div class="cards"><div class="card"><div class="label">Conceitos</div><div class="metric">${m.concepts.length}</div></div><div class="card"><div class="label">No funil</div><div class="metric">${Math.min(m.stage, m.concepts.length)}</div></div><div class="card"><div class="label">Em produção</div><div class="metric">${m.concepts.filter(c => c.creativeId).length}</div></div><div class="card"><div class="label">Campanhas</div><div class="metric">${p.campaigns.length}</div></div></div>
  <div class="panel" style="margin-top:15px"><div class="section-row"><h2>Campanhas</h2><button class="btn dark" onclick="openModal('campaign')">＋ Nova campanha</button></div>
  ${p.campaigns.length ? `<div class="list">${p.campaigns.map(c => `<div class="list-item"><div><strong>${esc(c.name)}</strong><small>${esc(c.channel)} · ${esc(c.objective)}${c.budget ? ' · ' + fmtMoney(c.budget) + '/dia' : ''}</small></div><div class="row-gap"><button class="btn sm" onclick="cycleCampaign('${c.id}')">${c.status === 'Ativa' ? '● Ativa' : c.status === 'Pausada' ? '❚❚ Pausada' : '○ Rascunho'}</button><button class="btn sm" onclick="deleteCampaign('${c.id}')">×</button></div></div>`).join('')}</div>` : emptyState('Sem campanhas', 'Estruture a primeira campanha a partir do projeto e da matriz.')}
  <p class="muted" style="font-size:11px;margin-top:10px">O status aqui organiza o planejamento. A veiculação acontece no gerenciador de anúncios do canal.</p></div>`;
}
function renderCampaignsPage() {
  const p = curProject(), r = $('campaignsRoot'); if (!p) { r.innerHTML = noProject('Campanhas'); return; }
  r.innerHTML = hubHead('Campanhas', 'Campanhas construídas a partir do projeto e da matriz criativa.', '') + campaignsHTML(p);
}

/* ---- Publicação ---- */
const CHANNELS = ['Instagram', 'Facebook', 'Meta Ads', 'WhatsApp', 'Landing page', 'Outro'];
function publicationModal() {
  const p = curProject(), ok = creativesOf(p.id).filter(c => c.status === 'Aprovado');
  if (!ok.length) { toast('Aprove ao menos uma criação antes de preparar a publicação.'); return; }
  showModal('Preparar publicação', `<div class="form-grid"><div class="field full"><label>Criação aprovada</label><select id="pbCr">${ok.map(c => `<option value="${c.id}">${esc(c.title)} · ${esc(c.type)}</option>`).join('')}</select></div><div class="field"><label>Canal</label><select id="pbCh">${CHANNELS.map(c => `<option>${c}</option>`).join('')}</select></div><div class="field"><label>Data</label><input id="pbDate" type="date" value="${today()}"></div><div class="field full"><label>Legenda / texto</label><textarea id="pbCap" rows="3"></textarea></div></div><div class="modal-actions"><button class="btn dark" onclick="publicationSave()">Agendar</button></div>`);
}
function publicationSave() {
  const p = curProject(), c = state.creatives.find(x => x.id === $('pbCr').value);
  p.publications.push({id: uid('pb'), title: c.title, creativeId: c.id, channel: $('pbCh').value, date: $('pbDate').value, caption: $('pbCap').value, status: 'Agendado'});
  persist(); closeModal(); ui.page === 'project' ? renderProjectTab() : renderPublishingPage(); toast('Publicação agendada.');
}
function publicationDone(id) { const p = curProject(), x = p.publications.find(y => y.id === id); x.status = 'Publicado'; const c = state.creatives.find(y => y.id === x.creativeId); if (c) c.status = 'Publicado'; persist(); ui.page === 'project' ? renderProjectTab() : renderPublishingPage(); }
function publicationDelete(id) { const p = curProject(); p.publications = p.publications.filter(x => x.id !== id); persist(); ui.page === 'project' ? renderProjectTab() : renderPublishingPage(); }
async function publicationSend(id) {
  if (!canUseApi() || !API.status.webhook.configured) { toast('Webhook não configurado. Veja Integrações.'); return; }
  const p = curProject(), x = p.publications.find(y => y.id === id);
  try { await sendWebhook('publicacao', {project: p.name, title: x.title, channel: x.channel, date: x.date, caption: x.caption}); toast('Enviado para a automação.'); } catch (e) { toast('Webhook: ' + e.message); }
}
function publishingHTML(p) {
  const list = p.publications.slice().sort((a, b) => a.date.localeCompare(b.date)), wh = canUseApi() && API.status.webhook.configured;
  return `<div class="two"><div class="panel"><div class="section-row"><h3>Calendário editorial</h3><button class="btn dark sm" onclick="publicationModal()">＋ Preparar</button></div>${list.length ? `<div class="list">${list.map(x => `<div class="list-item"><div><strong>${esc(x.channel)} · ${esc(x.title)}</strong><small>${fmtDate(x.date)} · ${esc(x.status)}</small></div><div class="row-gap">${x.status === 'Agendado' ? `<button class="btn sm" onclick="publicationDone('${x.id}')">Marcar publicado</button>` : ''}${wh ? `<button class="btn sm" onclick="publicationSend('${x.id}')">⇢ Automação</button>` : ''}<button class="btn sm" onclick="publicationDelete('${x.id}')">×</button></div></div>`).join('')}</div>` : emptyState('Nada agendado', 'Só criações aprovadas podem ser preparadas para publicação.')}</div>
  <div class="panel"><h3>Canais</h3>${CHANNELS.slice(0, 4).map(c => `<div class="kv"><span>${c}</span><strong>${wh ? 'Via webhook (n8n/Make)' : 'Manual'}</strong></div>`).join('')}<p class="muted" style="font-size:11px">A publicação direta nas redes exige autorização OAuth (próxima fase). Hoje: prepare aqui e dispare a automação por webhook ou publique manualmente.</p></div></div>`;
}
function renderPublishingPage() { renderSocialPage(); }

/* ---- Performance & Learning ---- */
function metricModal() {
  const p = curProject();
  showModal('Registrar métricas', `<div class="form-grid"><div class="field"><label>Data</label><input id="mDate" type="date" value="${today()}"></div><div class="field"><label>Investimento (R$)</label><input id="mSpend" type="number" min="0" step="0.01"></div><div class="field"><label>Impressões</label><input id="mImp" type="number" min="0"></div><div class="field"><label>Cliques</label><input id="mClk" type="number" min="0"></div><div class="field"><label>Leads</label><input id="mLeads" type="number" min="0"></div><div class="field"><label>Vendas / conversões</label><input id="mConv" type="number" min="0"></div>
    <div class="field full"><label>Conceito da matriz (opcional, alimenta o aprendizado)</label><select id="mConcept"><option value="">— nenhum —</option>${p.matrix.concepts.filter(c => c.creativeId || c.pinned).map(c => `<option value="${c.id}">${esc(c.hook)} × ${esc(c.angle)} · ${esc(c.format)}</option>`).join('')}</select></div><div class="field full"><label>Variação de anúncio enviada (opcional, alimenta o aprendizado de estilo, fonte, foto e CTA)</label><select id="mCreative"><option value="">— nenhuma —</option>${state.creatives.filter(c => c.projectId === p.id && c.dims).map(c => `<option value="${c.id}">${esc(c.title)} · ${esc(c.brief)}</option>`).join('')}</select></div><div class="field full"><label>Observação</label><input id="mNote"></div></div>
    <p class="muted" style="font-size:11px">Só conceitos fixados ou enviados para produção aparecem na lista.</p><div class="modal-actions"><button class="btn dark" onclick="metricSave()">Salvar</button></div>`);
}
function metricSave() {
  const p = curProject(), n = id => +$(id).value || 0;
  const m = {id: uid('m'), date: $('mDate').value || today(), spend: n('mSpend'), impressions: n('mImp'), clicks: n('mClk'), leads: n('mLeads'), conversions: n('mConv'), conceptId: $('mConcept').value, creativeId: $('mCreative') ? $('mCreative').value : '', note: $('mNote').value.trim(), source: 'manual'};
  if (!m.spend && !m.impressions && !m.clicks && !m.leads && !m.conversions) { toast('Preencha ao menos um número.'); return; }
  p.metrics.push(m); persist(); closeModal(); ui.page === 'project' ? renderProjectTab() : renderAnalyticsPage(); toast('Métricas registradas.');
}
function metricDelete(id) { const p = curProject(); p.metrics = p.metrics.filter(m => m.id !== id); persist(); ui.page === 'project' ? renderProjectTab() : renderAnalyticsPage(); }
async function importMeta() {
  const p = curProject(), since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10), until = today();
  try {
    toast('Importando do Meta Ads…'); const j = await api(`meta.php?since=${since}&until=${until}`);
    p.metrics = p.metrics.filter(m => !(m.source === 'meta' && m.date >= since && m.date <= until));
    j.days.forEach(d => p.metrics.push({id: uid('m'), date: d.date, spend: d.spend, impressions: d.impressions, clicks: d.clicks, leads: d.leads, conversions: 0, conceptId: '', note: 'Meta Ads', source: 'meta'}));
    persist(); ui.page === 'project' ? renderProjectTab() : renderAnalyticsPage(); toast(`${j.days.length} dia(s) importado(s).`);
  } catch (e) { toast('Meta: ' + e.message); }
}
async function loadLeadsInbox(pid) {
  const box = $('leadsInbox'); if (!box || !canUseApi()) return;
  try {
    const leads = (await fetchLeads()).filter(l => !l.project || l.project === pid); if (!$('leadsInbox')) return;
    box.innerHTML = leads.length ? `<div class="list">${leads.slice(0, 10).map(l => `<div class="list-item"><div><strong>${esc(l.name || l.phone || 'Sem nome')}</strong><small>${esc(l.source)} · ${fmtDateTime(l.at)} · ${esc(l.phone || l.email || '')}</small>${l.message ? `<small>${esc(l.message)}</small>` : ''}</div></div>`).join('')}</div><p class="muted" style="font-size:11px">${leads.length} lead(s) recebido(s) no total.</p>` : '<p class="muted">Nenhum lead recebido ainda. Use o endpoint em Integrações.</p>';
  } catch (e) { box.innerHTML = `<p class="muted">Leads indisponíveis: ${esc(e.message)}</p>`; }
}
function performanceHTML(p) {
  const t = metricTotals(p), lw0 = learnWeights(p), ld = learnDesign(p), lw = {rows: lw0.rows.concat(ld.rows).sort((a, b) => b.w - a.w)}, metaOk = canUseApi() && API.status.meta.configured;
  const inbox = canUseApi() && API.status.leads.configured;
  if (inbox) setTimeout(() => loadLeadsInbox(p.id), 0);
  return `<div class="section-row"><div class="actions">${metaOk ? '<button class="btn" onclick="importMeta()">⇣ Importar Meta Ads</button>' : ''}<button class="btn dark" onclick="metricModal()">＋ Registrar métricas</button></div></div>
  <div class="cards"><div class="card"><div class="label">Investimento</div><div class="metric">${dash(t.n ? t.spend : null, fmtMoney)}</div></div><div class="card"><div class="label">Leads</div><div class="metric">${t.n ? fmtNum(t.leads) : '—'}</div></div><div class="card"><div class="label">CPL</div><div class="metric">${dash(t.cpl, fmtMoney)}</div></div><div class="card"><div class="label">CTR</div><div class="metric">${dash(t.ctr, fmtPct)}</div></div></div>
  <div class="cards" style="margin-top:12px"><div class="card"><div class="label">Cliques → lead</div><div class="metric">${dash(t.clickToLead, fmtPct)}</div></div><div class="card"><div class="label">Vendas</div><div class="metric">${t.n ? fmtNum(t.conversions) : '—'}</div></div><div class="card"><div class="label">CAC</div><div class="metric">${dash(t.cac, fmtMoney)}</div></div><div class="card"><div class="label">Registros</div><div class="metric">${t.n}</div></div></div>
  <div class="two" style="margin-top:14px"><div class="panel"><h3>Peso aprendido por variável</h3>${lw.rows.length ? lw.rows.slice(0, 10).map(r => `<div class="lbar"><div><span>${esc(r.k)} · ${esc(r.v)}</span><b>${r.w}</b></div><div class="learning-bar"><i style="width:${r.w}%"></i></div><small>${r.n} registro(s) · CPL ${fmtMoney(r.cpl)}</small></div>`).join('') : '<p class="muted">Sem dados ainda. Registre métricas ligadas a um conceito da matriz para o Studio aprender quais hooks, ângulos e formatos custam menos por lead.</p>'}</div>
  <div class="panel"><h3>Regra de aprendizado</h3><p>Peso = melhor CPL ÷ CPL da variável × 100. Só entram registros reais com investimento e leads. Sem dados, a matriz usa peso neutro (50). Ao gerar novos conceitos, os pesos reordenam as combinações.</p><div class="kv"><span>Fluxo</span><strong>Criativo → Publicação → Métrica → Aprendizado → Peso → Nova criação</strong></div></div></div>
  ${inbox ? `<div class="panel" style="margin-top:14px"><h3>Leads recebidos</h3><div id="leadsInbox"><p class="muted">Carregando…</p></div></div>` : ''}
  <div class="panel" style="margin-top:14px"><h3>Registros</h3>${p.metrics.length ? `<div class="table-wrap"><table class="tbl"><thead><tr><th>Data</th><th>Invest.</th><th>Impr.</th><th>Cliques</th><th>Leads</th><th>Vendas</th><th>Origem</th><th></th></tr></thead><tbody>${p.metrics.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 60).map(m => `<tr><td>${fmtDate(m.date)}</td><td>${fmtMoney(m.spend)}</td><td>${fmtNum(m.impressions)}</td><td>${fmtNum(m.clicks)}</td><td>${fmtNum(m.leads)}</td><td>${fmtNum(m.conversions)}</td><td>${esc(m.source)}${m.conceptId ? ' · matriz' : ''}</td><td><button class="btn sm" onclick="metricDelete('${m.id}')">×</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Nenhum registro. Use “Registrar métricas” ou importe do Meta Ads.</p>'}</div>`;
}
function renderAnalyticsPage() { renderSocialAnalytics(); }
