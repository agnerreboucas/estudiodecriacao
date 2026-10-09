/* ===== Motor de Ofertas: interface das 10 etapas ===== */
const ofUI = {step: 1, busy: '', prog: '', cancel: false, fmt: 'meta', nVar: 2, fStage: '', fAngle: '', sel: {}, adLimit: 30, ans: {}};
const ofCur = () => { const p = curProject(); return {p, e: p ? ofEng(p) : null}; };
const ofRe = () => keepScroll(renderOfertas);
const ofDate = iso => { try { return new Date(iso).toLocaleDateString('pt-BR') + ' ' + new Date(iso).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}); } catch (x) { return ''; } };
const ofProgPaint = () => { const el = $('ofProg'); if (el) el.textContent = ofUI.prog; };
const ofSave = () => { ofSetStatus(ofCur().e); persist(); };
const ofPct = (a, b) => b ? Math.round(a / b * 100) : 0;

/* roda uma geração com barra de progresso; erros viram aviso e o que já foi gerado fica salvo */
async function ofRun(label, fn, ok) {
  if (ofUI.busy) return; const {p, e} = ofCur();
  if (!aiReady()) { toast('A IA não está configurada. Abra Configurações → APIs (GPT ou Claude).'); return false; }
  ofUI.busy = label; ofUI.cancel = false; ofUI.skipped = 0; ofUI.prog = label; ofRe(); let good = false;
  try { await fn(p, e, m => { ofUI.prog = m; ofProgPaint(); }); good = true; spendCredits(1); toast(ofUI.skipped ? `${ok || 'Pronto'} — mas ${ofUI.skipped} item(ns) a IA não devolveu. Use "Gerar as que faltam".` : ok || 'Pronto.'); }
  catch (x) { toast('Motor de Ofertas: ' + x.message); }
  finally { ofSave(); ofUI.busy = ''; ofUI.cancel = false; ofRe(); }
  return good;
}
function ofGo(n) { const {e} = ofCur(); if (!e || n > ofReach(e)) return; ofUI.step = n; renderOfertas(); window.scrollTo(0, 0); }
function ofReach(e) { return e.cells.some(c => c.copy) ? (e.ads.length ? 10 : 9) : e.cells.some(c => c.offer) ? 8 : e.cells.length ? 7 : e.angles.length ? 6 : e.selection ? 5 : e.concepts.length ? 4 : e.diag ? 3 : 2; }
const ofDown = (e, from) => {
  const has = {sel: !!e.selection, angles: e.angles.length > 0, cells: e.cells.length > 0, offers: e.cells.some(c => c.offer), copies: e.cells.some(c => c.copy), ads: e.ads.length > 0, concepts: e.concepts.length > 0, diag: !!e.diag};
  const order = [['diag', 'Diagnóstico'], ['concepts', 'Conceitos'], ['sel', 'Conceito escolhido'], ['angles', 'Ângulos'], ['cells', 'Jornada'], ['offers', 'Ofertas'], ['copies', 'Copies'], ['ads', 'Anúncios']];
  return order.slice(order.findIndex(o => o[0] === from) + 1).filter(o => has[o[0]]).map(o => o[1]);
};
const ofWarn = (e, o) => { const w = ofLint(e, o); return w.length ? `<div class="of-warn">⚠ ${w.map(esc).join(' · ')}</div>` : ''; };

/* ---------- página ---------- */
function renderOfertas() {
  const root = $('ofertasRoot'); if (!root) return; const {p, e} = ofCur();
  if (!p) { root.innerHTML = noProject('Motor de Ofertas'); return; }
  ofSetStatus(e); const st = ofStale(e), reach = ofReach(e), n = ofUI.step > reach ? reach : ofUI.step; ofUI.step = n;
  const done = [!!(e.input.produto.trim() || e.input.descricao.trim()), !!e.diag, e.concepts.length > 0, !!ofSel(e), e.angles.length > 0, e.cells.length > 0, e.cells.some(c => c.offer), e.cells.some(c => c.copy), e.ads.length > 0, !!e.tests];
  const stepFns = [ofS1, ofS2, ofS3, ofS4, ofS5, ofS6, ofS7, ofS8, ofS9, ofS10], staleKeys = [0, 'diagnostico', 'conceitos', 'escolha', 'angulos', 'jornada', 'ofertas', 'copies', 'anuncios'];
  const staleList = Object.keys(st).map(k => ({diag: 'Diagnóstico', concepts: 'Conceitos', sel: 'Conceito escolhido', angles: 'Ângulos', cells: 'Jornada', offers: 'Ofertas', copies: 'Copies', ads: 'Anúncios'}[k] + ': ' + st[k]));
  root.innerHTML = hubHead('Motor de Ofertas & Anúncios', 'Os anúncios nascem de uma estratégia: projeto, diagnóstico, conceito, ângulos, jornada, oferta e copy.', `<span class="of-state" title="Estado do projeto">${esc(e.status)}</span><button class="btn" onclick="ofExportModal()">⬇ Exportar</button>`) +
    (aiReady() ? '' : `<div class="of-note">A IA ainda não está configurada: você consegue preencher o projeto e editar, mas não gerar. <button class="btn sm" onclick="go('settings')">Abrir configurações</button></div>`) +
    `<nav class="of-steps" aria-label="Etapas">${OF_STEPS.map(s => { const stl = ofStepStale(st, staleKeys[s.n - 1] || s.k); return `<button class="of-st ${s.n === n ? 'on' : ''} ${done[s.n - 1] ? 'ok' : ''} ${stl ? 'stale' : ''}" ${s.n > reach ? 'disabled' : ''} onclick="ofGo(${s.n})" title="${esc(stl || s.t)}"><b>${done[s.n - 1] ? (stl ? '!' : '✓') : s.n}</b><span>${s.t}</span></button>`; }).join('')}</nav>` +
    (staleList.length ? `<div class="of-stale"><b>Algo mudou antes desta etapa.</b> Regenere o que ficou desatualizado (nada foi apagado):<ul>${staleList.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : '') +
    (ofUI.busy ? `<div class="of-busy"><span class="of-spin"></span><b id="ofProg">${esc(ofUI.prog)}</b><button class="btn sm" onclick="ofUI.cancel=true;this.disabled=true;this.textContent='Parando…'">Parar</button></div>` : '') +
    `<section class="of-panel">${stepFns[n - 1](p, e, st)}</section>` +
    `<div class="of-foot"><button class="btn" ${n < 2 ? 'disabled' : ''} onclick="ofGo(${n - 1})">‹ Voltar</button><button class="btn" onclick="ofSave();toast('Salvo no projeto.')">Salvar</button><button class="btn dark" ${n >= reach || n >= 10 ? 'disabled' : ''} onclick="ofGo(${n + 1})">Avançar ›</button></div>`;
  ofStepScroll();
}
function ofStepScroll() { const nav = document.querySelector('#ofertasRoot .of-steps'), on = nav && nav.querySelector('.of-st.on'); if (on) nav.scrollLeft = Math.max(0, on.offsetLeft - 24); }
const ofHead = (n, title, sub, act) => `<div class="of-head"><div><small>Etapa ${n} de 10</small><h2>${esc(title)}</h2><p>${esc(sub)}</p></div><div class="of-act">${act || ''}</div></div>`;
const ofEmpty = (t, b) => `<div class="of-empty"><p>${esc(t)}</p>${b}</div>`;
const ofGenBtn = (label, fn, dis) => `<button class="btn dark" ${ofUI.busy || dis ? 'disabled' : ''} onclick="${fn}">${label}</button>`;

/* ---------- 1 · Projeto ---------- */
function ofS1(p, e) {
  const f = OF_INPUT.map(x => `<div class="field ${x[3] ? 'full' : ''}"><label>${x[1]}</label>${x[3] ? `<textarea rows="3" placeholder="${esc(x[2])}" onchange="ofIn('${x[0]}',this.value)">${esc(e.input[x[0]])}</textarea>` : `<input value="${esc(e.input[x[0]])}" placeholder="${esc(x[2])}" onchange="ofIn('${x[0]}',this.value)">`}</div>`).join('');
  return ofHead(1, 'Conte o projeto', 'Pode estar incompleto. O motor pergunta o que falta e registra as hipóteses; nunca inventa preço, prova ou urgência.', `<button class="btn" onclick="ofImport()">Importar do projeto</button>${ofGenBtn('Analisar projeto →', 'ofDoDiag()')}`) +
    `<div class="form-grid">${f}</div><label class="of-chk"><input type="checkbox" ${e.useCtx ? 'checked' : ''} onchange="ofCur().e.useCtx=this.checked;ofSave()"> Usar também o que já existe no Studio (pré-projeto, ICPs, Brand Brain, produtos)</label>
    <p class="of-hint">Sem preço informado, os textos usarão <b>[PREÇO NÃO INFORMADO]</b>. Sem prova informada, <b>[PROVA NECESSÁRIA]</b>. Urgência só entra se for real e estiver em "Urgência real".</p>`;
}
function ofIn(k, v) { const {e} = ofCur(); if ((e.input[k] || '') === v) return; e.input[k] = v; ofBump(e, 'input'); ofLog(e, 'Projeto editado', 'projeto', k); ofSave(); ofRe(); }
function ofImport() {
  const {p, e} = ofCur(), b = p.brief || {}, pr = (p.products || [])[0], map = {produto: pr ? pr.name : '', publico: b.audience || ((p.pre.icps[0] || {}).profile || ''), mercado: b.competitors || p.category || '', descricao: p.desc || b.offer || (pr && pr.summary) || '', objetivos: b.goal || p.goal || '', extra: b.notes || ''};
  let n = 0; Object.keys(map).forEach(k => { if (!e.input[k].trim() && String(map[k] || '').trim()) { e.input[k] = String(map[k]).trim(); n++; } });
  if (n) { ofBump(e, 'input'); ofLog(e, 'Dados importados do projeto', 'projeto', n + ' campos'); ofSave(); } toast(n ? `${n} campo(s) importado(s). Revise e complete.` : 'Nada novo para importar: os campos já estão preenchidos.'); ofRe();
}
async function ofDoDiag() {
  const {e} = ofCur(), i = e.input; if (!(i.produto.trim() || i.descricao.trim()) && !e.useCtx) { toast('Descreva o produto ou ative o contexto do Studio.'); return; }
  if (!(i.produto.trim() || i.descricao.trim()) && !confirm('Há pouca informação. O motor vai registrar hipóteses explícitas. Continuar?')) return;
  if (e.diag && ofDown(e, 'diag').length && !confirm('Reanalisar deixa desatualizado: ' + ofDown(e, 'diag').join(', ') + '. Nada é apagado. Continuar?')) return;
  if (await ofRun('Analisando o projeto…', (p, e2) => ofGenDiag(p, e2), 'Diagnóstico pronto.')) ofUI.step = 2, ofRe();
}

/* ---------- 2 · Diagnóstico ---------- */
function ofS2(p, e) {
  if (!e.diag) return ofHead(2, 'Diagnóstico', 'Antes de qualquer conceito, o motor entende produto, cliente, dor, objeções e provas.') + ofEmpty('Ainda não há diagnóstico.', ofGenBtn('Analisar projeto', 'ofDoDiag()'));
  const d = e.diag, miss = d.missing.length ? `<div class="of-box"><b>Dados que faltam</b><p>Responda o que souber (ou ignore: o motor segue com hipóteses marcadas).</p>${d.missing.map((m, i) => `<div class="field"><label>${esc(m.q)}</label><textarea rows="2" onchange="ofCur().e.diag.missing[${i}].a=this.value">${esc(m.a)}</textarea></div>`).join('')}<button class="btn sm" ${ofUI.busy ? 'disabled' : ''} onclick="ofAnswer()">Responder e reanalisar</button></div>` : '';
  const hyp = d.assumptions.length ? `<div class="of-box warn"><b>Hipóteses usadas (não são fatos)</b><ul>${d.assumptions.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : '';
  return ofHead(2, 'Analisei seu projeto.', 'Revise e edite. Mudar o diagnóstico deixa os conceitos desatualizados.', `${ofGenBtn('Reanalisar', 'ofDoDiag()')}${ofGenBtn('Gerar 30 conceitos →', 'ofDoConcepts()')}`) + miss + hyp +
    `<div class="of-grid2">${OF_DIAG.map(x => `<div class="of-card"><label>${x[1]} <small>${x[2]}</small></label><textarea rows="4" onchange="ofDiagEdit('${x[0]}',this.value)">${esc(d.fields[x[0]])}</textarea>${ofWarn(e, {t: d.fields[x[0]]})}</div>`).join('')}</div>`;
}
function ofDiagEdit(k, v) { const {e} = ofCur(); if (e.diag.fields[k] === v) return; e.diag.fields[k] = v; ofBump(e, 'diag'); ofLog(e, 'Diagnóstico editado', 'diagnostico', k); ofSave(); ofRe(); }
async function ofAnswer() {
  const {e} = ofCur(), ans = e.diag.missing.filter(m => m.a.trim()).map(m => `[Resposta] ${m.q} ${m.a.trim()}`);
  if (!ans.length) { toast('Responda ao menos uma pergunta.'); return; }
  e.input.extra = (e.input.extra ? e.input.extra + '\n' : '') + ans.join('\n'); ofBump(e, 'input'); ofSave();
  await ofRun('Reanalisando com as respostas…', (p, e2) => ofGenDiag(p, e2), 'Diagnóstico atualizado.'); ofRe();
}
async function ofDoConcepts(append) {
  const {e} = ofCur();
  if (!append) { if (e.selection && !confirm('Regenerar os conceitos remove a escolha atual e deixa desatualizado: ' + (ofDown(e, 'concepts').join(', ') || 'nada') + '. Continuar?')) return; if (e.selection) { e.selection = null; ofBump(e, 'sel'); } }
  if (await ofRun('Gerando conceitos…', (p, e2, pr) => ofGenConcepts(p, e2, pr, append), 'Conceitos gerados.')) ofUI.step = 3, ofRe();
}

/* ---------- 3 · Conceitos ---------- */
const ofBar = v => `<span class="of-bar"><i style="width:${Math.max(0, Math.min(100, v))}%"></i></span>`;
function ofConceptCard(c, rank, e, pick) {
  const sel = e.selection && e.selection.conceptId === c.id;
  return `<article class="of-concept ${sel ? 'sel' : ''}"><div class="of-rank">#${rank}</div><div class="of-cbody"><div class="of-ctop"><div><b>${esc(c.name)}</b> <small class="muted">${c.id}</small>${sel ? ' <span class="of-tag">escolhido</span>' : ''}<p>${esc(c.description)}</p></div><div class="of-score"><b>${c.total}</b><small>/100</small></div></div>${ofBar(c.total)}
    <details><summary>Ver conceito completo e notas</summary><div class="of-det">${[['Problema', c.problem], ['Desejo', c.desire], ['Transformação', c.transformation], ['Mecanismo', c.mechanism], ['Urgência', c.urgencyNote], ['Diferenciação', c.differentiation], ['Potencial de oferta', c.offerNote], ['Justificativa', c.justification]].map(x => `<p><b>${x[0]}:</b> ${esc(x[1])}</p>`).join('')}
    <div class="of-crit">${OF_CRIT.map(k => `<div><span>${k[1]} <small>${Math.round(k[2] * 100)}%</small></span>${ofBar(c.scores[k[0]])}<em>${c.scores[k[0]]}</em></div>`).join('')}</div>${ofWarn(e, c)}</div></details>
    <div class="of-row">${pick ? `<button class="btn sm ${sel ? '' : 'dark'}" onclick="ofSelect('${c.id}')">${sel ? 'Escolhido' : 'Escolher este conceito'}</button>` : ''}<button class="btn sm" onclick="ofEdit('concept','${c.id}')">Editar</button></div></div></article>`;
}
function ofS3(p, e) {
  if (!e.concepts.length) return ofHead(3, '30 conceitos', 'Territórios estratégicos de comunicação: grandes ideias comerciais, não headlines.') + ofEmpty('Nenhum conceito ainda.', ofGenBtn('Gerar 30 conceitos', 'ofDoConcepts()', !e.diag));
  const list = e.concepts.slice().sort((a, b) => b.total - a.total);
  return ofHead(3, `Encontrei ${e.concepts.length} territórios comerciais.`, 'Ordenados pela nota (0 a 100). Nota = desejo 20% + compra 20% + necessidade 15% + urgência 15% + dor 10% + diferenciação 10% + oferta 5% + comunicação 5%.', `${e.concepts.length < 30 ? ofGenBtn('Completar até 30', 'ofDoConcepts(true)') : ''}${ofGenBtn('Regenerar os 30', 'ofDoConcepts()')}`) +
    `<div class="of-list">${list.map((c, i) => ofConceptCard(c, i + 1, e, true)).join('')}</div>`;
}

/* ---------- 4 · Escolha ---------- */
function ofSelect(id) {
  const {e} = ofCur(), c = e.concepts.find(x => x.id === id); if (!c) return;
  if (e.selection && e.selection.conceptId === id) { ofGo(4); return; }
  if (e.selection && e.selection.locked) { toast('A decisão está bloqueada. Desbloqueie na etapa 4 para trocar.'); ofGo(4); return; }
  const down = ofDown(e, 'sel'); if (e.selection && down.length && !confirm('Trocar o conceito deixa desatualizado: ' + down.join(', ') + '. Nada é apagado. Continuar?')) return;
  e.selection = {conceptId: id, at: new Date().toISOString(), by: ofWho(), locked: true, rev: e.rev.concepts}; ofBump(e, 'sel'); ofMark(e, 'sel'); ofLog(e, 'Conceito escolhido', 'escolha', c.id + ' ' + c.name); ofSave(); ofUI.step = 4; renderOfertas(); window.scrollTo(0, 0);
}
function ofLock(v) { const {e} = ofCur(); e.selection.locked = v; ofLog(e, v ? 'Decisão bloqueada' : 'Decisão desbloqueada', 'escolha', ''); ofSave(); ofRe(); }
function ofS4(p, e) {
  const c = ofSel(e);
  if (!e.selection || !c) {
    const top = e.concepts.slice().sort((a, b) => b.total - a.total).slice(0, 5);
    return ofHead(4, 'Escolha o conceito que deseja explorar.', 'Esta decisão vira a fonte estratégica de todas as etapas seguintes. Estes são os 5 melhores; os 30 estão na etapa 3.') + (e.selection ? '<div class="of-box warn">O conceito escolhido antes não existe mais nesta lista (os conceitos foram regenerados). Escolha de novo.</div>' : '') + `<div class="of-list">${top.map((x, i) => ofConceptCard(x, i + 1, e, true)).join('')}</div>`;
  }
  const s = e.selection;
  return ofHead(4, 'Conceito escolhido.', `Escolhido em ${ofDate(s.at)} por ${s.by} (conceitos v${s.rev}). ${s.locked ? 'Decisão bloqueada.' : 'Decisão desbloqueada: você pode trocar.'}`, `<button class="btn" onclick="ofLock(${!s.locked})">${s.locked ? '🔓 Desbloquear' : '🔒 Bloquear decisão'}</button>${s.locked ? '' : '<button class="btn" onclick="ofGo(3)">Escolher outro</button>'}${ofGenBtn(e.angles.length ? 'Ver ângulos →' : 'Gerar 30 ângulos →', e.angles.length ? 'ofGo(5)' : 'ofDoAngles()')}`) + `<div class="of-list">${ofConceptCard(c, e.concepts.slice().sort((a, b) => b.total - a.total).findIndex(x => x.id === c.id) + 1, e, false)}</div>`;
}
async function ofDoAngles(append) {
  const {e} = ofCur(); if (!append && e.angles.length && !confirm('Regenerar os ângulos apaga a jornada, ofertas, copies e anúncios atuais. Continuar?')) return;
  if (await ofRun('Gerando ângulos…', (p, e2, pr) => ofGenAngles(p, e2, pr, append), 'Ângulos gerados.')) ofUI.step = 5, ofRe();
}

/* ---------- 5 · Ângulos ---------- */
function ofS5(p, e) {
  if (!e.angles.length) return ofHead(5, '30 ângulos', 'Todos derivam do conceito escolhido.') + ofEmpty('Nenhum ângulo ainda.', ofGenBtn('Gerar 30 ângulos', 'ofDoAngles()', !ofSel(e)));
  const grp = OF_STAGES.map(s => ({s, a: e.angles.filter(x => x.stage === s.k)})).filter(g => g.a.length);
  return ofHead(5, `Agora são ${e.angles.length} ângulos do mesmo conceito.`, `Conceito: ${(ofSel(e) || {name: '—'}).name}. Cada ângulo tem um estágio ideal; na próxima etapa todos passam pelos 5 estágios.`, `${e.angles.length < 30 ? ofGenBtn('Completar até 30', 'ofDoAngles(true)') : ''}${ofGenBtn('Regenerar os 30', 'ofDoAngles()')}${ofGenBtn(e.cells.length ? 'Ver jornada →' : 'Montar jornada 30 × 5 →', 'ofDoCells()')}`) +
    grp.map(g => `<h3 class="of-h3">${g.s.n} <small>${g.a.length} ângulos · ideal para este estágio</small></h3><div class="of-list">${g.a.map(a => `<article class="of-angle"><div class="of-ctop"><div><b>${esc(a.name)}</b> <small class="muted">${a.id}</small><p>${esc(a.promise)}</p></div><div class="of-score"><b>${a.potential}</b><small>potencial</small></div></div>
      <details><summary>Ver ângulo completo</summary><div class="of-det">${[['Perspectiva', a.perspective], ['Dor', a.pain], ['Desejo', a.desire], ['Objeção', a.objection], ['Mecanismo', a.mechanism], ['Oportunidade de oferta', a.offerOpp]].map(x => `<p><b>${x[0]}:</b> ${esc(x[1])}</p>`).join('')}${ofWarn(e, a)}</div></details>
      <div class="of-row"><button class="btn sm" onclick="ofEdit('angle','${a.id}')">Editar</button></div></article>`).join('')}</div>`).join('');
}
function ofDoCells() {
  const {e} = ofCur(); if (!e.cells.length) { ofBuildCells(e); ofSave(); toast(`Jornada montada: ${e.angles.length} ângulos × 5 estágios = ${e.cells.length} células.`); }
  ofUI.step = 6; renderOfertas(); window.scrollTo(0, 0);
}

/* ---------- 6 · Jornada ---------- */
function ofS6(p, e, st) {
  if (!e.cells.length) return ofHead(6, 'Jornada', '30 ângulos × 5 estágios = 150 células.') + ofEmpty('A matriz ainda não foi montada.', ofGenBtn('Montar matriz', 'ofDoCells()'));
  const no = e.cells.filter(c => c.offer).length, nc = e.cells.filter(c => c.copy).length;
  return ofHead(6, `Esses ${e.angles.length} ângulos foram distribuídos pela jornada.`, `${e.cells.length} células · ${no} com oferta · ${nc} com copy · ${e.ads.length} anúncios. Toque numa célula para ver e editar.`, (st.cells ? ofGenBtn('Remontar matriz', 'ofRebuild()') : '') + ofGenBtn(no ? 'Ver ofertas →' : 'Gerar ofertas →', 'ofGo(7)')) +
    `<div class="of-scroll"><table class="of-mx"><thead><tr><th>Ângulo</th>${OF_STAGES.map(s => `<th title="${esc(s.goal)}">${s.n}<small>${esc(s.goal)}</small></th>`).join('')}</tr></thead><tbody>${e.angles.map(a => `<tr><th><b>${a.id}</b> ${esc(a.name)}</th>${OF_STAGES.map(s => { const c = ofCell(e, a.id + '-' + s.k); if (!c) return '<td></td>'; const na = e.ads.filter(x => x.cell === c.id).length;
      return `<td><button class="of-cell" onclick="ofCellModal('${c.id}')"><i class="${c.offer ? 'on' : ''}" title="Oferta">O</i><i class="${c.copy ? 'on' : ''}" title="Copy">C</i><i class="${na ? 'on' : ''}" title="Anúncios">${na || 'A'}</i></button></td>`; }).join('')}</tr>`).join('')}</tbody></table></div>
    <div class="of-legend"><b>O</b> oferta · <b>C</b> copy · <b>A</b> anúncios (número = quantidade)</div>`;
}
function ofRebuild() { const {e} = ofCur(); ofBuildCells(e); ofSave(); ofRe(); toast('Matriz remontada. O que já existia nas células foi mantido.'); }
function ofCellModal(id) {
  const {e} = ofCur(), c = ofCell(e, id); if (!c) return; const a = ofAngle(e, c.aid), s = OF_STAGE(c.stage);
  const blk = (t, o, keys, labels, kind) => o ? `<div class="of-det"><div class="of-row"><b>${t}</b><button class="btn sm" onclick="ofEdit('${kind}','${c.id}')">Editar</button></div>${keys.map((k, i) => o[k] ? `<p><b>${labels[i]}:</b> ${esc(o[k])}</p>` : '').join('')}${ofWarn(e, o)}</div>` : `<p class="muted">${t}: ainda não gerada.</p>`;
  showModal(`${c.id} · ${a.name}`, `<p class="muted"><b>${s.n}</b> — ${esc(s.goal)} Oferta ${s.offer}.</p><p><b>Promessa do ângulo:</b> ${esc(a.promise)}</p>` +
    blk('Oferta', c.offer, OF_OFK, ['Promessa', 'Benefício', 'Bônus', 'Prova', 'Garantia', 'Redução de risco', 'Mecanismo', 'CTA'], 'offer') + blk('Copy base', c.copy, OF_CPK, ['Hook', 'Contexto', 'Problema', 'Desejo', 'Mecanismo', 'Oferta', 'Prova', 'Redução de risco', 'CTA'], 'copy') +
    (e.ads.filter(x => x.cell === c.id).map(x => `<p><b>${esc(OF_FORMATS[x.fmt].n)}:</b> ${x.variants.length} variação(ões)</p>`).join('')) + `<div class="modal-actions"><button class="btn dark" onclick="closeModal()">Fechar</button></div>`);
  $('modalBox').classList.add('wide');
}

/* ---------- 7 e 8 · Ofertas e Copies ---------- */
function ofFilters(e) {
  return `<div class="of-filter"><div class="of-chips"><button class="of-chip ${!ofUI.fStage ? 'on' : ''}" onclick="ofUI.fStage='';ofRe()">Todos os estágios</button>${OF_STAGES.map(s => `<button class="of-chip ${ofUI.fStage === s.k ? 'on' : ''}" onclick="ofUI.fStage='${s.k}';ofRe()">${s.n}</button>`).join('')}</div>
  <select onchange="ofUI.fAngle=this.value;ofRe()"><option value="">Todos os ângulos</option>${e.angles.map(a => `<option value="${a.id}" ${ofUI.fAngle === a.id ? 'selected' : ''}>${a.id} · ${esc(a.name.slice(0, 50))}</option>`).join('')}</select></div>`;
}
function ofS7(p, e, st) { return ofCellsView(p, e, st, 'offer'); }
function ofS8(p, e, st) { return ofCellsView(p, e, st, 'copy'); }
function ofCellsView(p, e, st, kind) {
  const isO = kind === 'offer', n = isO ? 7 : 8, keys = isO ? OF_OFK : OF_CPK, labels = isO ? ['Promessa', 'Benefício', 'Bônus', 'Prova', 'Garantia', 'Redução de risco', 'Mecanismo', 'CTA'] : ['Hook', 'Contexto', 'Problema', 'Desejo', 'Mecanismo', 'Oferta', 'Prova', 'Redução de risco', 'CTA'];
  if (!isO && !e.cells.some(c => c.offer)) return ofHead(8, 'Copies', 'A copy base nasce da oferta de cada célula.') + ofEmpty('Gere as ofertas primeiro (etapa 7).', `<button class="btn dark" onclick="ofGo(7)">Ir para ofertas</button>`);
  const have = c => isO ? c.offer : c.copy, total = e.cells.length, done = e.cells.filter(have).length, miss = e.angles.filter(a => OF_STAGE_KEYS.some(s => { const c = ofCell(e, a.id + '-' + s); return c && !have(c) && (isO || c.offer); })).map(a => a.id);
  const angles = e.angles.filter(a => !ofUI.fAngle || a.id === ofUI.fAngle);
  const sub = isO ? 'A oferta acompanha a maturidade do cliente: implícita na descoberta, explícita na compra, de continuidade na apologia.' : 'Hook, contexto, problema, desejo, mecanismo, oferta, prova, redução de risco e CTA para cada célula.';
  return ofHead(n, isO ? 'Agora vamos transformar cada oportunidade em oferta.' : 'Copy base de cada célula.', `${done} de ${total} células. ${sub}`,
    `${miss.length && done ? ofGenBtn(`Gerar as que faltam (${miss.length} ângulos)`, `ofDoCells2('${kind}',true)`) : ''}${ofGenBtn(done ? 'Regenerar tudo' : `Gerar tudo (${e.angles.length} ângulos)`, `ofDoCells2('${kind}',false)`)}${done ? `<button class="btn" onclick="ofGo(${n + 1})">Avançar ›</button>` : ''}`) + ofFilters(e) +
    angles.map(a => { const cells = OF_STAGES.filter(s => !ofUI.fStage || s.k === ofUI.fStage).map(s => ofCell(e, a.id + '-' + s.k)).filter(Boolean), ok = cells.filter(have).length;
      return `<details class="of-ang" ${ofUI.fAngle || ofUI.fStage ? 'open' : ''}><summary><b>${a.id}</b> ${esc(a.name)} <small>${ok}/${cells.length}</small>${cells.some(c => isO ? (c.offer && c.ar !== a.rev) : (c.copy && c.co !== c.o)) ? ' <span class="of-tag warn">desatualizado</span>' : ''}</summary>
      <div class="of-row"><button class="btn sm" ${ofUI.busy || (!isO && !cells.some(c => c.offer)) ? 'disabled' : ''} onclick="ofDoCells2('${kind}',false,'${a.id}')">Regenerar só este ângulo</button></div>
      ${cells.map(c => { const o = have(c), s = OF_STAGE(c.stage), stale = o && (isO ? c.ar !== a.rev : c.co !== c.o);
        return `<div class="of-cellbox ${stale ? 'stale' : ''}"><div class="of-row"><b>${s.n}</b><small class="muted">${isO ? 'oferta ' + s.offer : s.goal}</small>${stale ? `<span class="of-tag warn">${isO ? 'ângulo editado' : 'oferta editada'}</span>` : ''}<span class="grow"></span>${o ? `<button class="btn sm" onclick="ofEdit('${kind}','${c.id}')">Editar</button>` : ''}</div>
        ${o ? keys.map((k, i) => o[k] ? `<p><b>${labels[i]}:</b> ${esc(o[k])}</p>` : '').join('') + ofWarn(e, o) : '<p class="muted">Ainda não gerada.</p>'}</div>`; }).join('')}</details>`; }).join('');
}
async function ofDoCells2(kind, onlyMissing, aid) {
  const {e} = ofCur(), isO = kind === 'offer', have = c => isO ? c.offer : c.copy;
  let ids = aid ? [aid] : onlyMissing ? e.angles.filter(a => OF_STAGE_KEYS.some(s => { const c = ofCell(e, a.id + '-' + s); return c && !have(c) && (isO || c.offer); })).map(a => a.id) : null;
  if (!aid && !onlyMissing && e.cells.some(have) && !confirm('Regenerar tudo substitui o que está nas células (incluindo edições). Continuar?')) return;
  if (ids && !ids.length) { toast('Nada faltando.'); return; }
  if (isO) await ofRun('Gerando ofertas…', (p, e2, pr) => ofGenOffers(p, e2, ids, pr), 'Ofertas geradas.'); else await ofRun('Gerando copies…', (p, e2, pr) => ofGenCopies(p, e2, ids, pr), 'Copies geradas.');
}

/* ---------- 9 · Anúncios ---------- */
const ofAdText = v => [v.headline, v.sub, v.text, v.desc, v.cta ? 'CTA: ' + v.cta : '', v.visual ? 'Visual: ' + v.visual : ''].filter(Boolean).join('\n\n');
function ofCopy(adId, i) { const {e} = ofCur(), a = e.ads.find(x => x.id === adId); if (!a) return; const t = ofAdText(a.variants[i]); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Copiado.'), () => { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('Copiado.'); } catch (x) { toast('Não foi possível copiar.'); } ta.remove(); }); }
function ofElig(e) { return e.cells.filter(c => c.copy && (!ofUI.fStage || c.stage === ofUI.fStage) && (!ofUI.fAngle || c.aid === ofUI.fAngle)); }
function ofS9(p, e) {
  if (!e.cells.some(c => c.copy)) return ofHead(9, 'Anúncios', 'Os anúncios executam a copy base no formato de cada plataforma.') + ofEmpty('Gere as copies primeiro (etapa 8).', `<button class="btn dark" onclick="ofGo(8)">Ir para copies</button>`);
  const el = ofElig(e), sel = el.filter(c => ofUI.sel[c.id]), n = sel.length, calls = Math.ceil(n / 5);
  const ads = e.ads.slice().filter(a => (!ofUI.fStage || (ofCell(e, a.cell) || {}).stage === ofUI.fStage) && (!ofUI.fAngle || (ofCell(e, a.cell) || {}).aid === ofUI.fAngle)).reverse();
  return ofHead(9, 'Anúncios', 'A estratégia não depende da plataforma: a plataforma é só a camada de execução. Escolha o formato e as células.', `<button class="btn" onclick="ofGo(10)" ${e.ads.length ? '' : 'disabled'}>Testes ›</button>`) + ofFilters(e) +
    `<div class="of-box"><div class="form-grid"><div class="field"><label>Formato / plataforma</label><select onchange="ofUI.fmt=this.value">${Object.keys(OF_FORMATS).map(k => `<option value="${k}" ${ofUI.fmt === k ? 'selected' : ''}>${esc(OF_FORMATS[k].n)}</option>`).join('')}</select></div>
    <div class="field"><label>Variações criativas por célula</label><select onchange="ofUI.nVar=+this.value">${[1, 2, 3].map(v => `<option ${ofUI.nVar === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div>
    <div class="of-row"><button class="btn sm" onclick="ofPick(true)">Marcar as ${el.length} filtradas</button><button class="btn sm" onclick="ofPick(false)">Limpar</button><span class="grow"></span><b>${n} célula(s)</b></div>
    <div class="of-picks">${el.slice(0, 150).map(c => `<label class="of-pick ${ofUI.sel[c.id] ? 'on' : ''}"><input type="checkbox" ${ofUI.sel[c.id] ? 'checked' : ''} onchange="ofUI.sel['${c.id}']=this.checked;ofRe()"><b>${c.aid}</b> ${OF_STAGE(c.stage).n}${e.ads.some(a => a.cell === c.id && a.fmt === ofUI.fmt) ? ' ✓' : ''}</label>`).join('')}</div>
    <div class="of-row">${ofGenBtn(`Gerar anúncios (${n})`, 'ofDoAds()', !n)}<small class="muted">${n ? `≈ ${calls} chamada(s) de IA.` : 'Marque as células que quer transformar em anúncio.'}</small></div></div>` +
    (ads.length ? `<div class="of-row"><h3 class="of-h3" style="margin:0">Anúncios gerados <small>${ads.length}</small></h3><span class="grow"></span>${bkBar('ofad', ads.map(x => x.id), 'renderOfertas', 'bkDelOfAds()', 'anúncio')}</div><div class="of-list">${ads.slice(0, ofUI.adLimit).map(a => ofAdCard(e, a)).join('')}</div>${ads.length > ofUI.adLimit ? `<button class="btn" onclick="ofUI.adLimit+=30;ofRe()">Mostrar mais</button>` : ''}` : '');
}
function ofPick(on) { const {e} = ofCur(); if (!on) ofUI.sel = {}; else ofElig(e).forEach(c => ofUI.sel[c.id] = true); ofRe(); }
async function ofDoAds() {
  const {e} = ofCur(), ids = ofElig(e).filter(c => ofUI.sel[c.id]).map(c => c.id); if (!ids.length) return;
  if (ids.length > 40 && !confirm(`${ids.length} células usam ≈ ${Math.ceil(ids.length / 5)} chamadas de IA e podem passar do limite por hora. Continuar?`)) return;
  const exist = ids.filter(id => e.ads.some(a => a.cell === id && a.fmt === ofUI.fmt)).length; if (exist && !confirm(`${exist} célula(s) já têm anúncio neste formato e serão substituídas. Continuar?`)) return;
  ofUI.sel = {}; await ofRun('Gerando anúncios…', (p, e2, pr) => ofGenAds(p, e2, ids, ofUI.fmt, ofUI.nVar, pr), 'Anúncios gerados.');
}
function ofAdCard(e, a) {
  const c = ofCell(e, a.cell) || {}, an = ofAngle(e, c.aid) || {name: '?'}, stale = a.cc !== c.c;
  return `<article class="of-ad${bkCls('ofad', a.id)}"${bkClick('ofad', a.id, 'renderOfertas')}><div class="of-row">${bkChk('ofad', a.id, 'renderOfertas', 1)}<b>${a.cell}</b><small class="muted">${esc(an.name)} · ${OF_STAGE(c.stage).n}</small><span class="of-tag">${esc(OF_FORMATS[a.fmt].n)}</span>${stale ? '<span class="of-tag warn">copy editada</span>' : ''}<span class="grow"></span><button class="btn sm" onclick="bkDelOfAds(['${a.id}'])">Remover</button></div>
  ${a.variants.map((v, i) => `<div class="of-var"><div class="of-row"><small class="muted">Variação ${i + 1}</small><span class="grow"></span><button class="btn sm" onclick="ofCopy('${a.id}',${i})">Copiar</button><button class="btn sm" onclick="ofEdit('variant','${a.id}',${i})">Editar</button></div>
  ${v.headline ? `<p class="of-hl">${esc(v.headline)}</p>` : ''}${v.sub ? `<p><i>${esc(v.sub)}</i></p>` : ''}${v.text ? `<p>${esc(v.text).replace(/\n/g, '<br>')}</p>` : ''}${v.desc ? `<p class="muted">${esc(v.desc)}</p>` : ''}${v.cta ? `<p><b>CTA:</b> ${esc(v.cta)}</p>` : ''}${v.visual ? `<p class="muted"><b>Visual:</b> ${esc(v.visual)}</p>` : ''}${ofWarn(e, v)}</div>`).join('')}
  <details><summary>Resultados (opcional, para o ciclo testar → medir → aprender)</summary><div class="of-met">${OF_METRICS.map(m => `<label>${m[1]}<input type="number" step="any" value="${a.metrics[m[0]] ?? ''}" onchange="ofMetric('${a.id}','${m[0]}',this.value)"></label>`).join('')}</div></details></article>`;
}
function ofMetric(id, k, v) { const {e} = ofCur(), a = e.ads.find(x => x.id === id); if (!a) return; if (v === '' || !isFinite(+v)) delete a.metrics[k]; else a.metrics[k] = +v; ofSave(); }

/* ---------- 10 · Testes ---------- */
function ofS10(p, e) {
  const t = e.tests, withM = e.ads.filter(a => Object.keys(a.metrics).length);
  return ofHead(10, 'Plano de testes e exportação.', 'O objetivo é aprender qual combinação conceito → ângulo → oferta → copy → anúncio funciona. As métricas entram na V2.', `${ofGenBtn(t ? 'Regenerar plano' : 'Gerar plano de testes', 'ofDoTests()', !e.ads.length)}<button class="btn" onclick="ofExportModal()">⬇ Exportar</button>`) +
    (t ? `<div class="of-box"><p><b>Teste macro:</b> ${esc(t.macro)}</p><p><b>Teste micro:</b> ${esc(t.micro)}</p></div><h3 class="of-h3">Hipóteses</h3><div class="of-list">${t.hypotheses.map(h => `<div class="of-cellbox"><p><b>${esc(h.h)}</b></p><small class="muted">Células: ${esc(h.cells)} · métrica que decide: ${esc(h.metric)}</small></div>`).join('')}</div><h3 class="of-h3">Regras de decisão</h3><ul>${t.rules.map(r => `<li>${esc(r)}</li>`).join('')}</ul>` : ofEmpty('Gere o plano para fechar o ciclo.', ''))
    + `<h3 class="of-h3">Resultados lançados <small>${withM.length}</small></h3>` + (withM.length ? `<div class="of-scroll"><table class="of-mx"><thead><tr><th>Anúncio</th>${OF_METRICS.map(m => `<th>${m[1]}</th>`).join('')}</tr></thead><tbody>${withM.map(a => `<tr><th>${a.cell} · ${esc(OF_FORMATS[a.fmt].n)}</th>${OF_METRICS.map(m => `<td>${a.metrics[m[0]] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '<p class="muted">Nenhum resultado lançado ainda. Preencha em cada anúncio (etapa 9).</p>')
    + `<h3 class="of-h3">Histórico de decisões <small>${e.log.length}</small></h3><div class="of-log">${e.log.slice(0, 25).map(l => `<div><small>${ofDate(l.t)}</small> <b>${esc(l.a)}</b> <span class="muted">${esc(l.d)} · ${esc(l.who)}</span></div>`).join('') || '<p class="muted">Sem registros.</p>'}</div>`;
}
async function ofDoTests() { if (await ofRun('Montando o plano de testes…', (p, e) => ofGenTests(p, e), 'Plano de testes pronto.')) ofRe(); }
function ofExportModal() {
  const {e} = ofCur(), b = (k, t, d, on) => `<div class="list-item"><div><strong>${t}</strong><small>${d}</small></div><button class="btn sm ${on ? '' : ''}" ${on ? '' : 'disabled'} onclick="ofExport(curProject(),'${k}')">Baixar</button></div>`;
  showModal('Exportar', `<div class="list">${b('md', 'Documento da estratégia (.md)', 'Diagnóstico, conceito, ângulos, ofertas, copies, anúncios e testes.', !!e.diag)}${b('cells', 'Células (.csv)', 'Ângulo × estágio com oferta e copy base.', e.cells.length)}${b('ads', 'Anúncios (.csv)', 'Todas as variações por formato.', e.ads.length)}${b('matriz', 'Planilha para "Subir tabela (em lote)" (.xlsx)', 'Meta, estático e LinkedIn viram anúncios nas 3 medidas no Studio.', e.ads.length)}${b('json', 'Projeto completo (.json)', 'Tudo, com histórico, para backup ou reimportação futura.', true)}</div><div class="modal-actions"><button class="btn dark" onclick="closeModal()">Fechar</button></div>`);
}

/* ---------- edição genérica ---------- */
const OF_ED = {
  concept: ['Editar conceito', [['name', 'Nome', 1], ['description', 'Descrição', 3], ['problem', 'Problema', 2], ['desire', 'Desejo', 2], ['transformation', 'Transformação', 2], ['mechanism', 'Mecanismo', 2], ['urgencyNote', 'Urgência', 2], ['differentiation', 'Diferenciação', 2], ['offerNote', 'Potencial de oferta', 2], ['justification', 'Justificativa', 2]]],
  angle: ['Editar ângulo', [['name', 'Nome', 1], ['perspective', 'Perspectiva', 2], ['pain', 'Dor', 2], ['desire', 'Desejo', 2], ['objection', 'Objeção', 2], ['mechanism', 'Mecanismo', 2], ['promise', 'Promessa', 2], ['offerOpp', 'Oportunidade de oferta', 2]]],
  offer: ['Editar oferta', [['promise', 'Promessa', 2], ['benefit', 'Benefício', 2], ['bonus', 'Bônus', 2], ['proof', 'Prova', 2], ['guarantee', 'Garantia', 2], ['risk', 'Redução de risco', 2], ['mechanism', 'Mecanismo', 2], ['cta', 'CTA', 1]]],
  copy: ['Editar copy', [['hook', 'Hook', 2], ['context', 'Contexto', 2], ['problem', 'Problema', 2], ['desire', 'Desejo', 2], ['mechanism', 'Mecanismo', 2], ['offer', 'Oferta', 2], ['proof', 'Prova', 2], ['risk', 'Redução de risco', 2], ['cta', 'CTA', 1]]],
  variant: ['Editar variação', [['headline', 'Headline', 2], ['sub', 'Sub-headline', 2], ['text', 'Texto', 5], ['desc', 'Descrição', 2], ['cta', 'CTA', 1], ['visual', 'Direção visual', 3]]]
};
function ofTarget(e, kind, id, i) { return kind === 'concept' ? e.concepts.find(c => c.id === id) : kind === 'angle' ? ofAngle(e, id) : kind === 'offer' ? (ofCell(e, id) || {}).offer : kind === 'copy' ? (ofCell(e, id) || {}).copy : ((e.ads.find(a => a.id === id) || {}).variants || [])[i]; }
function ofEdit(kind, id, i) {
  const {e} = ofCur(), o = ofTarget(e, kind, id, i); if (!o) return; const d = OF_ED[kind];
  showModal(d[0], `<div class="form-grid">${d[1].map(f => `<div class="field full"><label>${f[1]}</label>${f[2] === 1 ? `<input id="ofE_${f[0]}" value="${esc(o[f[0]])}">` : `<textarea id="ofE_${f[0]}" rows="${f[2]}">${esc(o[f[0]])}</textarea>`}</div>`).join('')}
  ${kind === 'concept' ? OF_CRIT.map(k => `<div class="field"><label>${k[1]} (0–100)</label><input id="ofC_${k[0]}" type="number" min="0" max="100" value="${o.scores[k[0]]}"></div>`).join('') : ''}${kind === 'angle' ? `<div class="field"><label>Potencial (0–100)</label><input id="ofC_pot" type="number" min="0" max="100" value="${o.potential}"></div>` : ''}</div>
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="ofEditSave('${kind}','${id}',${i === undefined ? -1 : i})">Salvar</button></div>`);
}
function ofEditSave(kind, id, i) {
  const {e} = ofCur(), o = ofTarget(e, kind, id, i < 0 ? undefined : i); if (!o) return;
  OF_ED[kind][1].forEach(f => { const el = $('ofE_' + f[0]); if (el) o[f[0]] = el.value.trim(); });
  if (kind === 'concept') { OF_CRIT.forEach(k => { const el = $('ofC_' + k[0]); if (el) o.scores[k[0]] = Math.max(0, Math.min(100, Math.round(+el.value || 0))); }); o.total = ofTotal(o.scores); if (e.selection && e.selection.conceptId === id) ofBump(e, 'sel'); }
  if (kind === 'angle') { const el = $('ofC_pot'); if (el) o.potential = Math.max(0, Math.min(100, Math.round(+el.value || 0))); o.rev++; }
  if (kind === 'offer') { const c = ofCell(e, id); c.o++; }
  if (kind === 'copy') { const c = ofCell(e, id); c.c++; c.co = c.o; }
  ofLog(e, 'Editado: ' + OF_ED[kind][0].replace('Editar ', ''), kind, id); ofSave(); closeModal(); ofRe();
}
