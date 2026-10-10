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
    <div class="id-kv"><span>Marcas parecidas</span><b>${a.marcas.map(esc).join(' · ')}</b></div></div>`;
}
function idStep3(id) {
  const sc = idScore(id), has = sc[0].score > 0, main = idMain(id), top = sc.slice(0, 3);
  if (!has) return `<h3>3 · Seu arquétipo</h3><p class="muted">Escolha valores e atitudes nos passos 1 e 2 para ver o resultado.</p>`;
  return `<h3>3 · Seu arquétipo</h3><p class="muted">Pelos valores e atitudes que você escolheu, a marca se parece mais com:</p>
  <div class="id-rank">${top.map(x => `<div class="id-bar"><span>${esc(ID_ARCHS[x.id].n)}</span><i><u style="width:${x.pct}%"></u></i><em>${x.pct}%</em></div>`).join('')}</div>
  ${idArchCard(main, true)}
  <div class="id-note">As marcas citadas são <b>exemplos comuns</b> nos livros de arquétipos. A classificação de cada marca é interpretação e muda de autor para autor, use só como referência de sensação.</div>
  <h4 style="margin:16px 0 6px">Não concorda? Escolha você</h4><p class="muted" style="margin:0 0 8px">Principal${id.arch ? ' (escolhido por você)' : ' (sugerido)'} e, se quiser, um secundário.</p>
  <div class="id-chips">${ID_ARCH.map(k => `<button class="id-chip ${main === k ? 'on' : ''}" onclick="idSetArch('${k}')">${esc(ID_ARCHS[k].n)}</button>`).join('')}</div>
  <div class="id-chips" style="margin-top:8px"><span class="muted" style="align-self:center;font-size:12px">Secundário:</span>${top.filter(x => x.id !== main).concat(sc.filter(x => !top.includes(x) && x.id !== main).slice(0, 0)).map(x => `<button class="id-chip ${id.arch2 === x.id ? 'on' : ''}" onclick="idSetArch2('${x.id}')">${esc(ID_ARCHS[x.id].n)}</button>`).join('')}${id.arch2 ? '<button class="id-chip" onclick="idSetArch2(\'\')">sem secundário</button>' : ''}</div>
  <h4 style="margin:16px 0 6px">Marcas que você admira</h4>${idTagEditor('refBrands', id.refBrands, [], 'Ex.: Nike, uma loja do bairro…', true)}`;
}
function idSetArch(k) { const id = idD(), top = idScore(id)[0].id; id.arch = k === top ? '' : k; if (id.arch2 === k) id.arch2 = ''; idSave(); idRe(); }
function idSetArch2(k) { idD().arch2 = idD().arch2 === k ? '' : k; idSave(); idRe(); }

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
  <div class="actions" style="margin-top:12px;flex-wrap:wrap"><button class="btn dark" onclick="idApplyVoice()">Enviar para o Brand/Voice Brain</button><button class="btn" onclick="idCopy()">Copiar resumo</button><button class="btn" onclick="idDownload()">Baixar resumo (.md)</button><button class="btn" onclick="idReset()">Refazer do zero</button></div>`;
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
  return `<div class="panel id-wrap"><div class="section-row"><div><h3>Marca: valores, arquétipo e voz</h3><p class="muted" style="margin:2px 0 0;font-size:12.5px">Cinco passos curtos. Cada resposta é salva sozinha no projeto.</p></div></div>${idStepper(id)}<div class="id-body">${body}</div>
  <div class="id-nav"><button class="btn" onclick="idNext(-1)" ${id.step === 1 ? 'disabled' : ''}>‹ Voltar</button><button class="btn dark" onclick="idNext(1)" ${id.step === 5 ? 'disabled' : ''}>Continuar ›</button></div></div>`;
}

TABS.identity = identityHTML;
