/* Aba "Marca" do projeto: valores → atitudes → arquétipo → voz → resumo. Tudo salvo em p.identity. */
const idUI = {};
const idP = () => curProject(), idD = () => { const p = idP(); if (!p.identity || !p.identity.step) p.identity = normalizeIdentity(p.identity); return p.identity; };
const idSave = () => { persist(); };
const idRe = () => keepScroll(renderProjectTab);
const idStepNames = ['Valores', 'Atitudes', 'Seu arquétipo', 'Voz e palavras', 'Resumo'];

function idStepper(id) {
  return `<div class="id-steps">${idStepNames.map((n, i) => `<button class="id-step ${id.step === i + 1 ? 'on' : ''} ${id.step > i + 1 ? 'done' : ''}" onclick="idGo(${i + 1})"><b>${i + 1}</b><span>${n}</span></button>`).join('')}</div>`;
}
function idGo(n) { const id = idD(); if (n >= 3 && !id.values.length && !id.valuesExtra.length && !id.attitudes.length) { toast('Escolha alguns valores ou atitudes primeiro.'); n = id.values.length ? n : 1; } id.step = n; if (n === 5 && !id.doneAt) id.doneAt = new Date().toISOString(); idSave(); idRe(); }
function idNext(d) { idGo(Math.min(5, Math.max(1, idD().step + d))); }

function idChips(list, sel, key, extraKey) {
  const id = idD();
  return `<div class="id-chips">${list.map(([k, l]) => `<button class="id-chip ${sel.includes(k) ? 'on' : ''}" onclick="idToggle('${key}','${k}')">${esc(l)}</button>`).join('')}${id[extraKey].map((t, i) => `<button class="id-chip on own" title="Tirar" onclick="idDelExtra('${extraKey}',${i})">${esc(t)} ✕</button>`).join('')}</div>
  <div class="row-gap" style="margin-top:10px"><input id="idExtra_${key}" placeholder="Outro (digite e aperte Enter)" style="flex:1;max-width:340px" onkeydown="if(event.key==='Enter'){event.preventDefault();idAddExtra('${key}','${extraKey}')}"><button class="btn sm" onclick="idAddExtra('${key}','${extraKey}')">＋ Adicionar</button></div>`;
}
function idToggle(key, k) { const a = idD()[key], i = a.indexOf(k); if (i >= 0) a.splice(i, 1); else if (a.length >= 12) { toast('Escolha no máximo 12. O ideal é de 5 a 7.'); return; } else a.push(k); idSave(); idRe(); }
function idAddExtra(key, extraKey) { const el = $('idExtra_' + key), t = (el.value || '').trim(); if (!t) return; const a = idD()[extraKey]; if (!a.some(x => x.toLowerCase() === t.toLowerCase()) && a.length < 10) a.push(t.slice(0, 90)); idSave(); idRe(); }
function idDelExtra(extraKey, i) { idD()[extraKey].splice(i, 1); idSave(); idRe(); }

function idCount(n, lo, hi) { return `<p class="muted" style="margin:6px 0 12px">${n} escolhido(s). ${n < lo ? `Escolha de ${lo} a ${hi}.` : n > hi ? `Tente ficar entre ${lo} e ${hi}: quanto menos, mais claro.` : 'Está bom.'}</p>`; }

function idStep1(id) {
  return `<h3>1 · Os valores</h3><p class="muted">Clique nos valores que são <b>de verdade</b> da pessoa ou da marca, os que ela defenderia mesmo perdendo dinheiro. Escolha de 5 a 7.</p>${idCount(id.values.length + id.valuesExtra.length, 5, 7)}${idChips(ID_VALUES, id.values, 'values', 'valuesExtra')}`;
}
function idStep2(id) {
  return `<h3>2 · As atitudes</h3><p class="muted">Agora, como a marca <b>age</b> no dia a dia. Clique no que combina. Escolha de 5 a 7.</p>${idCount(id.attitudes.length + id.attitudesExtra.length, 5, 7)}${idChips(ID_ATTS, id.attitudes, 'attitudes', 'attitudesExtra')}`;
}
function idArchCard(k, big) {
  const a = ID_ARCHS[k];
  return `<div class="id-arch ${big ? 'big' : ''}"><div class="id-arch-h"><h2>${esc(a.n)}</h2><small>${esc(ID_GROUPS[a.g])}</small></div>
    <div class="id-kv"><span>Deseja</span><b>${esc(a.desejo)}</b></div><div class="id-kv"><span>Tem medo de</span><b>${esc(a.medo)}</b></div><div class="id-kv"><span>Dom</span><b>${esc(a.dom)}</b></div><div class="id-kv"><span>Cuidado (sombra)</span><b>${esc(a.sombra)}</b></div><div class="id-kv"><span>Tom de voz</span><b>${esc(a.tom)}</b></div>
    <div class="id-kv"><span>Marcas parecidas</span><b class="ig-brands">${a.marcas.map(m => idBrandBtn(m, k)).join('')}</b></div></div>`;
}
function idStep3(id) {
  const sc = idScore(id), has = sc[0].score > 0, r = idRoles(id), top = sc.slice(0, 3);
  if (!has) return `<h3>3 · Seu arquétipo</h3>${idIntroHTML()}<p class="muted">Escolha valores e atitudes nos passos 1 e 2 para ver o resultado.</p>`;
  const opts = ID_ARCH.map(k => `<option value="${k}">${esc(ID_ARCHS[k].n)}</option>`).join('');
  return `<h3>3 · Seu arquétipo</h3>${idIntroHTML()}
  <p class="muted">Pelos valores e atitudes que você escolheu, a marca se parece mais com:</p>
  <div class="id-rank">${top.map(x => `<div class="id-bar"><span>${esc(ID_ARCHS[x.id].n)}</span><i><u style="width:${x.pct}%"></u></i><em>${x.pct}%</em></div>`).join('')}</div>
  ${idRolesHTML(r)}
  <div class="id-note">As marcas citadas são <b>exemplos comuns</b> nos livros de arquétipos. A classificação de cada marca é interpretação e muda de autor para autor, use só como referência de sensação.</div>
  <h4 style="margin:16px 0 6px">Não concorda? Escolha você</h4><p class="muted" style="margin:0 0 8px">Principal${id.arch ? ' (escolhido por você)' : ' (sugerido)'}.</p>
  <div class="id-chips">${ID_ARCH.map(k => `<button class="id-chip ${r.main === k ? 'on' : ''}" onclick="idSetArch('${k}')">${esc(ID_ARCHS[k].n)}</button>`).join('')}</div>
  <p class="muted" style="margin:10px 0 8px">Secundário${id.arch2 ? ' (escolhido por você)' : ' (sugerido)'}. O terciário é sempre o próximo mais forte.</p>
  <div class="id-chips">${ID_ARCH.filter(k => k !== r.main).map(k => `<button class="id-chip ${r.sec === k ? 'on' : ''}" onclick="idSetArch2('${k}')">${esc(ID_ARCHS[k].n)}</button>`).join('')}${id.arch2 ? '<button class="id-chip" onclick="idSetArch2(\'\')">voltar ao sugerido</button>' : ''}</div>
  <div class="row-gap" style="margin-top:14px;flex-wrap:wrap"><button class="btn sm" onclick="idGuidePDF()">📘 Guia dos 12 arquétipos (PDF)</button><button class="btn sm" onclick="idReportPDF()">📄 Relatório da marca (PDF)</button></div>
  <h4 style="margin:16px 0 6px">Marcas que você admira</h4>${idTagEditor('refBrands', id.refBrands, [], 'Ex.: Nike, uma loja do bairro…', true)}
  ${id.refBrands.length ? `<p class="muted" style="margin:6px 0 4px;font-size:12.5px">Clique para ver a comunicação:</p><div class="ig-brands">${id.refBrands.map(m => idBrandBtn(m, '')).join('')}</div>` : ''}`;
}
function idSetArch(k) { const id = idD(), top = idScore(id)[0].id; id.arch = k === top ? '' : k; if (id.arch2 === k) id.arch2 = ''; idSave(); idRe(); }
function idSetArch2(k) { const id = idD(); id.arch2 = id.arch2 === k ? '' : k; idSave(); idRe(); }

/* editor de lista com sugestões */
function idTagEditor(key, arr, sugg, ph, top) {
  const isList = !top;
  return `<div class="id-tags">${arr.map((t, i) => `<span class="id-tag">${esc(t)}<button title="Tirar" onclick="idUntag('${key}',${i},${isList})">✕</button></span>`).join('') || '<small class="muted">Nada ainda.</small>'}</div>
  ${sugg.filter(s => !arr.includes(s)).length ? `<div class="id-sug"><small>Sugestões, clique para usar:</small>${sugg.filter(s => !arr.includes(s)).slice(0, 10).map(s => `<button onclick="idTag('${key}',this.textContent,${isList})">${esc(s)}</button>`).join('')}</div>` : ''}
  <div class="row-gap" style="margin-top:6px"><input id="idT_${key}" placeholder="${esc(ph || 'Escreva e aperte Enter')}" style="flex:1" onkeydown="if(event.key==='Enter'){event.preventDefault();idTag('${key}',this.value,${isList})}"><button class="btn sm" onclick="idTag('${key}',$('idT_${key}').value,${isList})">＋</button></div>`;
}
function idArr(key, isList) { return isList ? idD().lists[key] : idD()[key]; }
function idTag(key, t, isList) { t = String(t || '').trim().slice(0, 90); if (!t) return; const a = idArr(key, isList); if (!a.some(x => x.toLowerCase() === t.toLowerCase()) && a.length < 40) a.push(t); idSave(); idRe(); }
function idUntag(key, i, isList) { idArr(key, isList).splice(i, 1); idSave(); idRe(); }

function idListSug(k, id) {
  const a = ID_ARCHS[idMain(id)] || {}, sc = idScore(id), low = id.attitudes.length ? ID_ATTS.filter(x => !id.attitudes.includes(x[0]) && x[2].every(r => (sc.find(s => s.id === r) || {pct: 0}).pct < 40)).map(x => x[1]) : [];
  return {usa: a.usa || [], naoUsa: a.evita || [], atitudeTem: id.attitudes.map(v => (ID_ATTS.find(x => x[0] === v) || [0, ''])[1]).filter(Boolean), atitudeNao: low.slice(0, 8), fala: ID_SUG.fala, naoFala: ID_SUG.naoFala, admira: ID_SUG.admira, repudia: ID_SUG.repudia}[k] || [];
}
function idStep4(id) {
  const sl = ID_SLIDERS.map(k => { const [a, b] = ID_SLIDER_INFO[k]; return `<div class="id-sl"><span>${a}</span><input type="range" min="1" max="5" value="${id.sliders[k]}" oninput="idSlider('${k}',this.value)"><span>${b}</span></div>`; }).join('');
  return `<h3>4 · Voz e palavras</h3><p class="muted">Defina como a marca fala. Use as sugestões (clique) ou escreva as suas.</p>
  <div class="panel" style="margin:0 0 14px"><h4 style="margin:0 0 8px">Tom de voz</h4>${sl}<p class="muted" id="idToneTxt" style="margin:8px 0 0">${esc(idToneText(id) ? 'Resumo: ' + idToneText(id) + '.' : 'Tom equilibrado.')}</p></div>
  <div class="id-lists">${ID_LISTS.map(k => `<div class="panel"><h4 style="margin:0">${esc(ID_LIST_INFO[k][0])}</h4><p class="muted" style="margin:2px 0 8px;font-size:12px">${esc(ID_LIST_INFO[k][1])}</p>${idTagEditor(k, id.lists[k], idListSug(k, id), '', false)}</div>`).join('')}</div>`;
}
function idSlider(k, v) { const id = idD(); id.sliders[k] = +v; idSave(); const t = $('idToneTxt'); if (t) t.textContent = idToneText(id) ? 'Resumo: ' + idToneText(id) + '.' : 'Tom equilibrado.'; }

function idSummary(p) {
  const id = p.identity, a = ID_ARCHS[idMain(id)], L = id.lists, lab = (list, ids) => ids.map(v => (list.find(x => x[0] === v) || [0, v])[1]);
  const sec = (t, arr) => arr.length ? `**${t}:** ${arr.join('; ')}\n\n` : '';
  return `# Identidade da marca — ${p.name}\n\n` + (a ? `**Arquétipo:** ${a.n}${id.arch2 ? ' + ' + ID_ARCHS[id.arch2].n : ''}\n\n**Deseja:** ${a.desejo}\n\n**Tem medo de:** ${a.medo}\n\n**Cuidado (sombra):** ${a.sombra}\n\n**Marcas parecidas (referência):** ${a.marcas.join(', ')}\n\n` : '') + sec('Valores', lab(ID_VALUES, id.values).concat(id.valuesExtra)) + sec('Atitudes', lab(ID_ATTS, id.attitudes).concat(id.attitudesExtra)) + sec('Marcas que admira', id.refBrands) + (idToneText(id) ? `**Tom de voz:** ${idToneText(id)}${a ? '. ' + a.tom : ''}\n\n` : '') +
    ID_LISTS.map(k => sec(ID_LIST_INFO[k][0], L[k])).join('') + (id.notes ? `**Notas:** ${id.notes}\n` : '');
}
function idStep5(id) {
  const p = idP(), main = idMain(id), L = id.lists, chip = arr => arr.length ? arr.map(t => `<span class="id-tag">${esc(t)}</span>`).join('') : '<small class="muted">—</small>', lab = (list, ids) => ids.map(v => (list.find(x => x[0] === v) || [0, v])[1]);
  if (!main && !ID_LISTS.some(k => L[k].length)) return `<h3>5 · Resumo</h3><p class="muted">Preencha os passos anteriores para ver o resumo.</p>`;
  return `<h3>5 · Resumo da marca</h3><p class="muted">Já está salvo no projeto. As criações com IA passam a usar isto (arquétipo, tom, palavras que usa e as proibidas).</p>
  ${main ? idArchCard(main, true) : ''}
  <div class="two" style="margin-top:12px"><div class="panel"><h4>Valores</h4><div class="id-tags">${chip(lab(ID_VALUES, id.values).concat(id.valuesExtra))}</div><h4 style="margin-top:12px">Atitudes</h4><div class="id-tags">${chip(lab(ID_ATTS, id.attitudes).concat(id.attitudesExtra))}</div><h4 style="margin-top:12px">Tom de voz</h4><p>${esc(idToneText(id) || 'equilibrado')}</p></div>
  <div class="panel">${ID_LISTS.map(k => `<h4 style="margin:${k === 'fala' ? 0 : 10}px 0 4px">${esc(ID_LIST_INFO[k][0])}</h4><div class="id-tags">${chip(L[k])}</div>`).join('')}</div></div>
  <div class="field full" style="margin-top:12px"><label>Notas</label><textarea rows="3" oninput="idD().notes=this.value.slice(0,1500);idSave()">${esc(id.notes)}</textarea></div>
  <div class="actions" style="margin-top:12px;flex-wrap:wrap"><button class="btn dark" onclick="idApplyVoice()">Enviar para o Brand/Voice Brain</button><button class="btn" onclick="idCopy()">Copiar resumo</button><button class="btn" onclick="idDownload()">Baixar resumo (.md)</button><button class="btn" onclick="idReportPDF()">📄 Relatório (PDF)</button><button class="btn" onclick="idGuidePDF()">📘 Guia dos arquétipos (PDF)</button><button class="btn" onclick="idReset()">Refazer do zero</button></div>`;
}
function idApplyVoice() {
  const p = idP(), id = p.identity, a = ID_ARCHS[idMain(id)], L = id.lists, v = p.voice || (p.voice = {}), b = p.brand;
  const want = {personality: [a ? `${a.n}: ${a.tom}` : '', idToneText(id)].filter(Boolean).join('. '), vocabulary: L.usa.join(', '), antivocab: L.naoUsa.join(', '), rules: [L.naoFala.length ? 'Não falar de: ' + L.naoFala.join('; ') : '', L.atitudeNao.length ? 'Nunca ter a atitude: ' + L.atitudeNao.join('; ') : '', L.repudia.length ? 'Repudia: ' + L.repudia.join('; ') : ''].filter(Boolean).join('\n')};
  const clash = Object.keys(want).filter(k => want[k] && String(v[k] || '').trim() && String(v[k]).trim() !== want[k]);
  if (clash.length && !confirm('O Voice Brain já tem texto em: ' + clash.join(', ') + '. Substituir pelo que você definiu aqui?')) return;
  Object.keys(want).forEach(k => { if (want[k]) v[k] = want[k]; }); if (a && !String(b.tone || '').trim()) b.tone = a.tom; persist(); toast('Voice Brain atualizado.');
}
function idCopy() { const t = idSummary(idP()); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Resumo copiado.'), () => { download('identidade-da-marca.md', t, 'text/markdown'); }); }
function idDownload() { download('identidade-da-marca.md', idSummary(idP()), 'text/markdown'); }
function idReset() { if (!confirm('Apagar tudo o que foi respondido nesta aba?')) return; idP().identity = normalizeIdentity({}); idSave(); idRe(); }

function identityHTML(p) {
  const id = idD(), body = [idStep1, idStep2, idStep3, idStep4, idStep5][id.step - 1](id);
  return `${idFormPanel(idP())}<div class="panel id-wrap"><div class="section-row"><div><h3>Marca: valores, arquétipo e voz</h3><p class="muted" style="margin:2px 0 0;font-size:12.5px">Cinco passos curtos. Cada resposta é salva sozinha no projeto.</p></div><div class="row-gap"><button class="btn sm" onclick="idGuidePDF()">📘 Guia dos arquétipos (PDF)</button></div></div>${idStepper(id)}<div class="id-body">${body}</div>
  <div class="id-nav"><button class="btn" onclick="idNext(-1)" ${id.step === 1 ? 'disabled' : ''}>‹ Voltar</button><button class="btn dark" onclick="idNext(1)" ${id.step === 5 ? 'disabled' : ''}>Continuar ›</button></div></div>`;
}

TABS.identity = identityHTML;

/* ---------- PDFs: guia dos 12 arquétipos e relatório da marca ---------- */
function idGuidePDF() { showOverlay('Guia dos 12 arquétipos', idGuideDoc(), 'guia-dos-12-arquetipos.html'); }
function idReportData(p) {
  const id = idD(), lab = (list, ids) => ids.map(v => (list.find(x => x[0] === v) || [0, v])[1]);
  return {nome: p.client || p.name, data: new Date().toLocaleDateString('pt-BR'), values: lab(ID_VALUES, id.values).concat(id.valuesExtra), attitudes: lab(ID_ATTS, id.attitudes).concat(id.attitudesExtra), valuesIds: id.values, attitudesIds: id.attitudes, arch: id.arch, arch2: id.arch2, tom: idToneText(id), refBrands: id.refBrands, notes: id.notes,
    listas: ID_LISTS.map(k => [ID_LIST_INFO[k][0], id.lists[k]])};
}
function idReportPDF() { const p = idP(); showOverlay('Relatório da marca', idReportDoc(idReportData(p)), 'relatorio-da-marca-' + slug(p.name) + '.html'); }

/* ---------- formulário para o cliente preencher (link, planilha e projeto) ---------- */
const idFormURL = t => location.origin + location.pathname.replace(/[^/]*$/, '') + 'marca.html?t=' + t;
const idFormSt = p => { const id = idD(); if (!id.form) id.form = {}; return id.form; };
function idFormPanel(p) {
  const f = idFormSt(p), head = '<h3 style="margin:0">📨 Enviar para o cliente preencher</h3>', srv = typeof API !== 'undefined' && API.available && !(typeof needsLogin === 'function' && needsLogin());
  const sheet = `<div class="row-gap" style="flex-wrap:wrap;margin-top:8px"><button class="btn sm" onclick="idXlsx(false)">⬇ Planilha em branco (.xlsx)</button><button class="btn sm" onclick="idXlsx(true)">⬇ Planilha com as respostas atuais</button><button class="btn sm" onclick="idCsv()">⬇ CSV</button><label class="btn sm" style="cursor:pointer">⬆ Importar planilha preenchida<input type="file" accept=".xlsx,.csv,.txt" hidden onchange="if(this.files[0])idImportFile(this.files[0]);this.value=''"></label></div>`;
  const three = '<small class="muted block" style="margin-top:6px">Três formatos: <b>projeto</b> (as respostas entram aqui, neste projeto), <b>planilha</b> (baixar ou receber de volta) e <b>nuvem</b> (o link guarda tudo no servidor, mesmo se o cliente fechar a página).</small>';
  let body;
  if (!srv) body = `<p class="sub" style="margin:2px 0 0">O link para o cliente precisa do Studio no servidor (e com login). Sem ele, use a planilha: baixe, mande ao cliente, e importe de volta.</p>${sheet}`;
  else if (!f.t) body = `<p class="sub" style="margin:2px 0 0">Crie um link só desta parte (valores, arquétipo e voz). O cliente responde pelo celular e salva sozinho. Fica ligado a este projeto.</p><div class="row-gap" style="margin-top:8px"><button class="btn dark" onclick="idFormCreate()">Criar link para o cliente</button></div>${sheet}`;
  else {
    const url = idFormURL(f.t), msg = encodeURIComponent('Olá! Preciso conhecer melhor a personalidade da sua marca. Pode responder este formulário rápido (uns 10 minutos, salva sozinho)? ' + url);
    const st = f.status === 'enviado' ? `<span class="so-badge" style="margin:0;background:#e9f7ee;color:#176b30">Enviado${f.submittedAt ? ' em ' + esc(fmtDateTime(f.submittedAt)) : ''}</span>` : f.updatedAt ? `<span class="so-badge" style="margin:0;background:#fff5db;color:#7a5a00">Em andamento</span>` : '<span class="so-badge" style="margin:0">Aguardando o cliente</span>';
    body = `<p class="sub" style="margin:2px 0 0">Status: ${st}${f.importedAt ? ` · importado em ${esc(fmtDateTime(f.importedAt))}` : ''}</p>
    <div class="row-gap" style="flex-wrap:wrap;margin-top:8px"><input readonly value="${esc(url)}" style="flex:1;min-width:240px" onclick="this.select()"><button class="btn sm" onclick="idFormCopy()">Copiar</button><a class="btn sm" href="https://wa.me/?text=${msg}" target="_blank" rel="noopener">WhatsApp</a></div>
    <div class="row-gap" style="flex-wrap:wrap;margin-top:8px"><button class="btn sm" onclick="idFormRefresh()">↻ Ver se o cliente respondeu</button><button class="btn dark sm" onclick="idFormImport()">Importar respostas para este projeto</button><button class="btn sm" onclick="idFormView()">Ver respostas</button><button class="btn sm" onclick="idFormRevoke()">Desativar link</button></div>${sheet}`;
  }
  return `<div class="jp-panel" style="margin-bottom:14px"><div class="section-row"><div>${head}</div></div>${body}${three}</div>`;
}
async function idFormCreate() {
  const p = idP(); try { const j = await api('briefing.php', {method: 'POST', body: {action: 'create', kind: 'marca', project: p.id, name: p.client || p.name}}); Object.assign(idFormSt(p), {t: j.t, status: 'rascunho', createdAt: new Date().toISOString()}); persist(); toast('Link criado.'); } catch (e) { toast(e.message); } idRe();
}
async function idFormFetch() { const j = await api('briefing.php', {method: 'POST', body: {action: 'get', t: idFormSt(idP()).t}}); return j.record; }
async function idFormRefresh() { try { const r = await idFormFetch(), f = idFormSt(idP()); Object.assign(f, {status: r.status || 'rascunho', submittedAt: r.submittedAt || '', updatedAt: r.updatedAt || ''}); persist(); toast(r.status === 'enviado' ? 'O cliente enviou as respostas.' : r.updatedAt ? 'O cliente está preenchendo.' : 'Ainda não começou.'); } catch (e) { toast(e.message); } idRe(); }
function idFormCopy() { const t = idFormURL(idFormSt(idP()).t); try { navigator.clipboard.writeText(t); toast('Link copiado.'); } catch (e) { prompt('Copie o link:', t); } }
async function idFormRevoke() {
  if (!confirm('Desativar este link? O cliente não conseguirá mais abrir o formulário (as respostas já recebidas continuam no servidor).')) return; const f = idFormSt(idP());
  try { await api('briefing.php', {method: 'POST', body: {action: 'revoke', t: f.t}}); } catch (e) { toast(e.message); return; } f.t = ''; f.status = ''; persist(); idRe();
}
async function idFormView() {
  try { const r = await idFormFetch(), a = r.answers || {}, rows = mpFields().map(f => { const v = mpGet(a, f.k); return `<tr><td style="vertical-align:top;padding:4px 10px 4px 0;color:#666;width:42%">${esc(f.q)}</td><td style="vertical-align:top;padding:4px 0">${esc(mpCell(v)).replace(/\n/g, '<br>') || '<span class="muted">—</span>'}</td></tr>`; }).join('');
    showModal('Respostas do cliente', `<div style="max-height:62vh;overflow:auto;font-size:13px"><table style="border-collapse:collapse">${rows}</table></div><div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button><button class="btn dark" onclick="closeModal();idFormImport()">Importar para o projeto</button></div>`); } catch (e) { toast(e.message); }
}
/* respostas → aba Marca do projeto (a pedido, substitui o que já está na aba) */
function idAnswersOf() {
  const id = idD(), lab = (list, ids) => ids.map(v => (list.find(x => x[0] === v) || [0, v])[1]), I = {valores: lab(ID_VALUES, id.values), valoresExtra: id.valuesExtra.join('\n'), atitudes: lab(ID_ATTS, id.attitudes), atitudesExtra: id.attitudesExtra.join('\n')};
  ID_SLIDERS.forEach(k => { I['t_' + k] = BF_SLIDE[k][id.sliders[k] - 1]; }); ID_LISTS.forEach(k => { I[k] = id.lists[k].join('\n'); });
  if (id.arch) I.arq = ID_ARCHS[id.arch].n; if (id.arch2) I.arq2 = ID_ARCHS[id.arch2].n;
  return {identidade: I, referencias: {admira: id.refBrands.join('\n')}, contato: {}};
}
function idApplyAnswers(p, a) {
  const S = bfStr, I = a.identidade || {}, id = normalizeIdentity(p.identity), lab2id = (list, l) => { const x = list.find(v => v[1].toLowerCase() === String(l).trim().toLowerCase()); return x ? x[0] : ''; };
  const pick = (list, arr) => { const ids = [], extra = []; (Array.isArray(arr) ? arr : []).forEach(l => { const k = lab2id(list, l); if (k) ids.push(k); else if (S(l)) extra.push(S(l)); }); return [ids, extra]; }, lines = t => bfLines(t);
  const [vi, ve] = pick(ID_VALUES, I.valores), [ai, ae] = pick(ID_ATTS, I.atitudes);
  id.values = vi.slice(0, 12); id.valuesExtra = ve.concat(lines(I.valoresExtra)).slice(0, 10); id.attitudes = ai.slice(0, 12); id.attitudesExtra = ae.concat(lines(I.atitudesExtra)).slice(0, 10);
  ID_SLIDERS.forEach(k => { const n = BF_SLIDE[k].indexOf(S(I['t_' + k])); id.sliders[k] = n >= 0 ? n + 1 : 3; });
  ID_LISTS.forEach(k => { id.lists[k] = lines(I[k]).slice(0, 40); });
  const nm = l => ID_ARCH.find(k => ID_ARCHS[k].n.toLowerCase() === S(l).toLowerCase()) || ''; id.arch = nm(I.arq); id.arch2 = nm(I.arq2) === id.arch ? '' : nm(I.arq2);
  id.refBrands = lines((a.referencias || {}).admira).map(t => t.slice(0, 60)).slice(0, 12);
  p.identity = normalizeIdentity(id); const ok = id.values.length || id.attitudes.length || ID_LISTS.some(k => id.lists[k].length);
  if (ok) { const v = p.voice || (p.voice = {}), ar = ID_ARCHS[idMain(p.identity)], tt = [ar && ar.tom, idToneText(p.identity)].filter(Boolean).join('. '); if (!String(v.personality || '').trim() && tt) v.personality = tt; if (p.brand && !String(p.brand.tone || '').trim() && tt) p.brand.tone = tt; }
  return ok;
}
const idHasContent = p => { const id = idD(); return id.values.length || id.attitudes.length || id.valuesExtra.length || ID_LISTS.some(k => id.lists[k].length); };
async function idFormImport() {
  const p = idP(), f = idFormSt(p);
  try {
    const r = await idFormFetch(), a = r.answers || {}; if (!a.identidade || !((a.identidade.valores || []).length || (a.identidade.atitudes || []).length)) { toast('Ainda não há respostas para importar.'); return; }
    if (r.status !== 'enviado' && !confirm('O cliente ainda não enviou. Importar o que já foi preenchido?')) return;
    if (idHasContent(p) && !confirm('Esta aba já tem respostas. Substituir pelas do cliente?')) return;
    idApplyAnswers(p, a); Object.assign(f, {status: r.status, submittedAt: r.submittedAt || '', updatedAt: r.updatedAt || '', importedAt: new Date().toISOString()}); idD().step = 3; persist(); toast('Respostas do cliente importadas.');
  } catch (e) { toast(e.message); } idRe();
}
/* planilha: baixar e importar */
function idXlsx(filled) { const p = idP(); download('marca-' + slug(p.name) + (filled ? '' : '-em-branco') + '.xlsx', xmBuild(mpSheets(filled ? idAnswersOf() : {}, p.name)), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); }
function idCsv() { const p = idP(); download('marca-' + slug(p.name) + '.csv', mpCsv(idHasContent(p) ? idAnswersOf() : {}), 'text/csv'); }
async function idImportFile(file) {
  const p = idP();
  try {
    let sheets; if (/\.xlsx$/i.test(file.name)) sheets = await pmReadXlsx(file); else sheets = await pmReadCsvFile(file);
    const a = mpFromSheets(sheets); if (!((a.identidade || {}).valores || []).length && !((a.identidade || {}).atitudes || []).length) { toast('A planilha não tem valores nem atitudes preenchidos.'); return; }
    if (idHasContent(p) && !confirm('Esta aba já tem respostas. Substituir pelas da planilha?')) return;
    idApplyAnswers(p, a); idD().step = 3; persist(); toast('Planilha importada.');
  } catch (e) { toast(e.message || 'Não consegui ler a planilha.'); } idRe();
}
