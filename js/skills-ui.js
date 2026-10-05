/* ===== Skills de texto: instruções (suas) que a IA segue ao escrever, por função e por fase da jornada. =====
   Ficam guardadas no Studio e entram no pedido enviado à IA. Sem a IA configurada nada é enviado: use "Ver o pedido" para conferir ou copiar. */
const SK_FN_INFO = {
  campanha: ['Campanha: headlines, apoio e CTA dos anúncios', true], carrossel: ['Carrossel: textos dos slides', true], video: ['Vídeo: roteiro', true],
  post: ['Post e legenda', false], stories: ['Stories', false], landing: ['Landing page', false], pre: ['Pré-projeto', false], editorial: ['Agente Editorial (já tem a sua skill própria)', false]
};
const skUI = {id: '', fn: 'campanha', stage: '', tab: 'skills'};
let AI_CTX = null;   // contexto de uma chamada: {fn, stage}. Vale só para o próximo pedido à IA.
const skList = () => (state.skills = Array.isArray(state.skills) ? state.skills : []);
const skCtx = (fn, stage) => { AI_CTX = {fn, stage: stage || ''}; };
function skillsFor(fn, stage) {
  return skList().filter(k => k.auto && k.on !== false && (k.fns || []).includes(fn) && (!(k.stages || []).length || !stage || k.stages.includes(stage))).sort((a, b) => (b.prio || 50) - (a.prio || 50));
}
/* monta o texto de sistema: skills primeiro (maior prioridade primeiro), depois o pedido da função */
function skillSystem(fn, stage, base) {
  const L = skillsFor(fn, stage); if (!L.length) return base;
  let txt = L.map(k => `### SKILL: ${k.name}\n${k.text}`).join('\n\n'); if (txt.length > 40000) txt = txt.slice(0, 40000);
  return `INSTRUÇÕES DE SKILL. Siga em toda a resposta, sem contrariar a regra de nunca inventar dados e sem mudar o formato de resposta pedido no PEDIDO abaixo:\n\n${txt}\n\n=== PEDIDO ===\n${base}`;
}
const skSize = t => { const n = String(t || '').length; return `${n.toLocaleString('pt-BR')} caracteres (~${Math.round(n / 4).toLocaleString('pt-BR')} tokens)`; };

/* ---------- ações ---------- */
const SK_READY = {
  editorial: {id: 'sk_editorial_engine', name: 'BrandsDecoded Editorial Engine', desc: 'Agente editorial: encontra a história antes de escrever (triagem, ângulos, carrossel de 18 textos, post, vídeo, auditoria).', text: () => SKT_EDITORIAL, auto: true, prio: 50, fns: ['campanha', 'carrossel'], draft: false},
  audiovisual: {id: 'sk_audiovisual', name: 'Skill Mestre: Inteligência Editorial e Roteiros Audiovisuais', desc: 'Da informação ao vídeo: ficha estratégica, roteiro literário, de gravação, técnico (em tabela), de edição e glossário.', text: () => SKT_AUDIOVISUAL, auto: true, prio: 70, fns: ['video'], draft: false},
  stories: {id: 'sk_stories_engine', name: 'Motor de Stories (rascunho)', desc: 'Rascunho escrito a partir da sua descrição. Revise antes de ligar.', text: () => SKT_STORIES, auto: false, prio: 50, fns: ['stories'], draft: true}
};
function skAddReady(kind) {
  const L = skList(); if (L.length >= 30) { toast('Limite de 30 skills.'); return; }
  const d = SK_READY[kind]; if (!d) return; const k = {id: d.id, name: d.name, desc: d.desc, text: d.text(), auto: d.auto, on: true, prio: d.prio, fns: d.fns.slice(), stages: [], draft: d.draft};
  if (L.some(x => x.id === k.id)) { toast('Essa skill já está na lista.'); return; }
  L.push(k); persist(); skUI.id = k.id; renderSkillsPage(); toast('Skill adicionada. Confira onde ela vale' + (k.auto ? '.' : ' e ligue o uso automático.'));
}
function skNew() { const L = skList(); if (L.length >= 30) { toast('Limite de 30 skills.'); return; } const k = {id: uid('sk'), name: 'Nova skill', desc: '', text: '', auto: false, on: true, prio: 50, fns: [], stages: [], draft: false}; L.push(k); persist(); skUI.id = k.id; renderSkillsPage(); }
function skUpload() {
  const i = document.createElement('input'); i.type = 'file'; i.accept = '.md,.txt,text/plain,text/markdown';
  i.onchange = async () => { const f = i.files[0]; if (!f) return; if (f.size > 200000) { toast('Arquivo grande demais (máximo 200 KB).'); return; } const t = (await f.text()).slice(0, 30000), L = skList(); if (L.length >= 30) { toast('Limite de 30 skills.'); return; }
    const k = {id: uid('sk'), name: f.name.replace(/\.[^.]+$/, '').slice(0, 80), desc: '', text: t, auto: false, on: true, prio: 50, fns: [], stages: [], draft: false}; L.push(k); persist(); skUI.id = k.id; renderSkillsPage(); toast('Skill carregada' + (f.size > 30000 ? ' (cortada em 30 mil caracteres)' : '') + '.'); };
  i.click();
}
function skSel(id) { skUI.id = skUI.id === id ? '' : id; renderSkillsPage(); }
function skSave() {
  const k = skList().find(x => x.id === skUI.id); if (!k) return;
  k.name = ($('skName').value.trim() || 'Skill').slice(0, 80); k.desc = $('skDesc').value.slice(0, 300); k.text = $('skText').value.slice(0, 30000); k.prio = Math.max(0, Math.min(99, Math.round(+$('skPrio').value) || 50));
  k.auto = $('skAuto').checked; k.on = $('skOn').checked; k.draft = $('skDraft').checked;
  k.fns = [...document.querySelectorAll('.skFn:checked')].map(x => x.value); k.stages = [...document.querySelectorAll('.skSt:checked')].map(x => x.value);
  persist(); renderSkillsPage(); toast('Skill salva.');
}
function skToggle(id) { const k = skList().find(x => x.id === id); if (!k) return; k.on = k.on === false; persist(); renderSkillsPage(); }
function skDel(id) { const k = skList().find(x => x.id === id); if (!k || !confirm('Excluir a skill “' + k.name + '”?')) return; state.skills = skList().filter(x => x.id !== id); if (skUI.id === id) skUI.id = ''; persist(); renderSkillsPage(); }
function skDup(id) { const k = skList().find(x => x.id === id); if (!k || skList().length >= 30) return; const c = JSON.parse(JSON.stringify(k)); c.id = uid('sk'); c.name = (k.name + ' (cópia)').slice(0, 80); c.auto = false; skList().push(c); persist(); skUI.id = c.id; renderSkillsPage(); }
function skPreviewOpen() {
  const fns = Object.keys(SK_FN_INFO);
  showModal('Ver o pedido que será enviado', `<p class="muted" style="font-size:12.5px;margin-top:0">É o texto de instruções que vai antes do pedido de cada função. Você pode copiar e colar na sua IA.</p>
  <div class="ins-row"><label class="ins">Função<select id="skPvFn" onchange="skPreviewDraw()">${fns.map(f => `<option value="${f}" ${f === skUI.fn ? 'selected' : ''}>${esc(SK_FN_INFO[f][0])}</option>`).join('')}</select></label>
  <label class="ins">Fase da jornada<select id="skPvSt" onchange="skPreviewDraw()"><option value="">Qualquer</option>${CMP_STAGES5.map(k => `<option value="${k}">${CMP_STAGE_LABEL[k]}</option>`).join('')}</select></label></div>
  <p id="skPvInfo" class="muted" style="font-size:12px"></p><textarea id="skPvTxt" readonly rows="14" style="width:100%;font-size:12px"></textarea>
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button><button class="btn dark" onclick="skPreviewCopy()">Copiar</button></div>`);
  $('modalBox').classList.add('wide'); skPreviewDraw();
}
function skPreviewDraw() {
  const fn = $('skPvFn').value, st = $('skPvSt').value, L = skillsFor(fn, st), txt = skillSystem(fn, st, '[aqui entra o pedido da função, com o contexto do projeto, as dores, dúvidas, desejos e urgências ocultas, e o gatilho da fase]');
  $('skPvTxt').value = txt; $('skPvInfo').textContent = L.length ? `${L.length} skill(s) valem aqui: ${L.map(k => k.name).join(', ')} · ${skSize(txt)}` : 'Nenhuma skill vale para esta função e fase. O pedido sai sem instruções extras.';
}
async function skPreviewCopy() { const t = $('skPvTxt').value; try { await navigator.clipboard.writeText(t); toast('Copiado.'); } catch (e) { $('skPvTxt').select(); toast('Selecione e copie com Ctrl+C.'); } }

/* ---------- tela ---------- */
function skEditHTML(k) {
  return `<div class="panel" style="margin-top:12px"><div class="form-grid"><div class="field"><label>Nome</label><input id="skName" value="${esc(k.name)}"></div><div class="field"><label>Prioridade (0 a 99, maior vale primeiro)</label><input id="skPrio" type="number" min="0" max="99" value="${k.prio || 50}"></div>
  <div class="field full"><label>Para que serve (uma frase)</label><input id="skDesc" value="${esc(k.desc || '')}"></div>
  <div class="field full"><label>Texto da skill <small class="muted">· ${skSize(k.text)} · máximo 30 mil caracteres</small></label><textarea id="skText" rows="14" style="font-size:12.5px">${esc(k.text)}</textarea></div></div>
  <h4 style="margin:10px 0 4px">Onde vale</h4><p class="muted" style="font-size:12px;margin:0 0 6px">Marque as funções. Sem nenhuma fase marcada, vale em todas as fases da jornada.</p>
  <div style="display:flex;flex-wrap:wrap;gap:6px 18px">${Object.entries(SK_FN_INFO).map(([f, [l, w]]) => `<label style="font-size:12.5px"><input type="checkbox" class="skFn" value="${f}" ${(k.fns || []).includes(f) ? 'checked' : ''}> ${esc(l)}${w ? '' : ' <small class="muted">(ainda sem ligação)</small>'}</label>`).join('')}</div>
  <div style="display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:8px">${CMP_STAGES5.map(s => `<label style="font-size:12.5px"><input type="checkbox" class="skSt" value="${s}" ${(k.stages || []).includes(s) ? 'checked' : ''}> ${CMP_STAGE_LABEL[s]}</label>`).join('')}</div>
  <div style="display:flex;flex-wrap:wrap;gap:6px 22px;margin:12px 0"><label style="font-size:13px"><input type="checkbox" id="skAuto" ${k.auto ? 'checked' : ''}> <b>Usar automaticamente</b> nas funções marcadas</label><label style="font-size:13px"><input type="checkbox" id="skOn" ${k.on !== false ? 'checked' : ''}> ligada</label><label style="font-size:13px"><input type="checkbox" id="skDraft" ${k.draft ? 'checked' : ''}> rascunho (ainda em revisão)</label></div>
  <div class="row-gap"><button class="btn dark" onclick="skSave()">Salvar</button><button class="btn" onclick="skDup('${k.id}')">Duplicar</button><button class="btn" onclick="skDel('${k.id}')">Excluir</button></div></div>`;
}
function renderSkillsPage() {
  const r = $('skillsRoot'); if (!r) return; const L = skList(), ids = new Set(L.map(k => k.id));
  const ready = [['editorial', SK_READY.editorial.name, 'O texto que você enviou: encontra a história antes de escrever (campanha e carrossel).'], ['audiovisual', SK_READY.audiovisual.name, 'A Skill 3 que você enviou: ficha, roteiro literário, de gravação, técnico, de edição e glossário (Video Lab).'], ['stories', SK_READY.stories.name, 'Escrito a partir da sua descrição. Precisa da sua revisão.']].filter(([k]) => !ids.has(SK_READY[k].id));
  const sel = L.find(k => k.id === skUI.id);
  const tabs = `<div class="edh-tabs" style="margin:10px 0">${[['skills', 'Skills'], ['potencial', 'Potencial de criação']].map(([k, l]) => `<button class="edh-tab ${skUI.tab === k ? 'on' : ''}" onclick="skUI.tab='${k}';renderSkillsPage()">${l}</button>`).join('')}</div>`;
  r.innerHTML = `<div class="page-head"><div><h1>Skills de texto</h1><p>Instruções suas que a IA segue ao escrever. Cada skill vale para certas funções e, se quiser, certas fases da jornada. Quando a IA estiver configurada elas entram no pedido sozinhas.</p></div><div class="row-gap"><button class="btn" onclick="skPreviewOpen()">Ver o pedido que será enviado</button><button class="btn" onclick="skUpload()">⬆ Subir arquivo</button><button class="btn dark" onclick="skNew()">＋ Nova skill</button></div></div>
  ${tabs}
  ${skUI.tab === 'potencial' ? skPotentialHTML() : ''}
  <div ${skUI.tab === 'skills' ? '' : 'hidden'}>${ready.length ? `<div class="panel"><h3 style="margin-top:0">Prontas para adicionar</h3>${ready.map(([k, n, d]) => `<div class="list-item"><div><strong>${esc(n)}</strong><small>${esc(d)}</small></div><button class="btn sm dark" onclick="skAddReady('${k}')">Adicionar</button></div>`).join('')}</div>` : ''}
  <div class="panel" style="margin-top:12px"><h3 style="margin-top:0">Suas skills (${L.length})</h3>${L.length ? `<div class="list">${L.map(k => `<div class="list-item"><div><strong>${esc(k.name)}</strong> ${k.draft ? '<span class="cmp-tag">rascunho</span>' : ''}<small>${esc(k.desc || 'Sem descrição')} · ${skSize(k.text)}</small><small>${k.auto && k.on !== false ? 'Uso automático em: ' + ((k.fns || []).map(f => SK_FN_INFO[f][0].split(':')[0]).join(', ') || 'nenhuma função marcada') + ((k.stages || []).length ? ' · fases: ' + k.stages.map(s => CMP_STAGE_NAME[s]).join(', ') : ' · todas as fases') : 'Sem uso automático (só manual)'}</small></div><div class="row-gap"><button class="btn sm" onclick="skToggle('${k.id}')">${k.on === false ? '○ desligada' : '● ligada'}</button><button class="btn sm dark" onclick="skSel('${k.id}')">${skUI.id === k.id ? 'Fechar' : 'Abrir'}</button></div></div>`).join('')}</div>` : '<p class="muted">Nenhuma skill ainda. Adicione uma pronta, suba um arquivo `.md` ou `.txt`, ou crie uma e cole o texto.</p>'}</div>
  ${sel ? skEditHTML(sel) : ''}
  <p class="muted" style="font-size:12px;margin-top:10px">Skills longas aumentam o custo de cada geração. Se duas valem para a mesma função e fase, entram juntas, a de maior prioridade primeiro. A qualidade real do texto só dá para avaliar com a sua chave de IA ativa.</p></div>`;
}

/* ---------- aba "Potencial de criação": o que esperar da junção das skills, com o estado real no Studio ---------- */
/* tipo: texto = vale pela instrução enviada à IA · pesquisa = precisa buscar fontes na web · post = precisa da função post ligada · comando = pede conversa */
const SK_CAPS = [
  ['Estratégia editorial', [['Atua como estrategista editorial, pesquisador, editor e roteirista', 'texto'], ['Encontra a história antes de começar a escrever', 'texto'], ['Transforma textos, links, notícias, estudos, transcrições ou hipóteses em narrativas com tensão, evidência e contexto', 'texto'], ['Extrai a transformação, a fricção central, o ângulo dominante e as evidências de um material', 'texto'], ['Procura o significado cultural por trás de marcas, produtos, campanhas e tendências (comportamento, identidade, status, hábito, conflito, mudança de época)', 'texto']]],
  ['Pesquisa e evidência', [['Diferencia fatos, dados, exemplos, interpretações e hipóteses', 'texto'], ['Pesquisa fontes, contrapontos e mecanismos antes de tratar uma hipótese como verdade', 'pesquisa'], ['Não inventa dados, fontes ou acontecimentos e reduz a tese quando as evidências são insuficientes', 'texto']]],
  ['Ângulos e headlines', [['Gera dez caminhos narrativos realmente diferentes, sem variações mornas da mesma ideia', 'texto'], ['Cria headlines específicas, tensionadas e ancoradas em conflito, identidade, consequência ou mecanismo', 'texto']]],
  ['Formatos', [['Produz carrosséis com exatamente 18 textos, respeitando a função de cada bloco', 'carrossel18'], ['Escreve posts com hook, contexto, tensão, evidência, reenquadramento e fechamento', 'post'], ['Desenvolve roteiros de vídeo faláveis, com falas, texto de tela, apoio visual, B-roll, ritmo e cortes', 'video'], ['Adapta a mesma narrativa para outros formatos sem copiar a estrutura anterior', 'texto']]],
  ['Revisão', [['Remove clichês, abstrações vagas, corporativês, frases artificiais e padrões de texto genérico', 'texto'], ['Audita fatos, progressão narrativa, hook, densidade, formato, originalidade e proporcionalidade da tese', 'texto']]],
  ['Comandos', [['Obedece "reiniciar", "refazer ângulos", "refazer headlines", "aprofundar", "mudar formato" e "pesquisar novamente"', 'comando']]]
];
const skOn = (id, fn) => { const k = skList().find(x => x.id === id); return !!(k && k.auto && k.on !== false && (!fn || (k.fns || []).includes(fn))); };
function skEditorialOn(fn) { const k = skList().find(x => x.id === 'sk_editorial_engine'); return !!(k && k.auto && k.on !== false && (!fn || (k.fns || []).includes(fn))); }
/* [rótulo, cor, explicação] do que dá para esperar hoje */
function skCapStatus(kind) {
  const G = '#2e7d4f', Y = '#c9952a', R = '#b04040', ai = typeof aiReady === 'function' && aiReady(), has = skList().some(x => x.id === 'sk_editorial_engine');
  if (!has) return ['adicione a skill', R, 'A Editorial Engine ainda não está na sua lista.'];
  const lig = skEditorialOn(); if (!lig) return ['skill desligada', R, 'Ligue o uso automático para ela entrar nos pedidos.'];
  const tail = ai ? '' : ' Só funciona quando a IA de texto estiver configurada.';
  if (kind === 'texto') return [ai ? 'ativo' : 'pronto, falta a IA', ai ? G : Y, 'Vai como instrução em campanha, carrossel e vídeo.' + tail];
  if (kind === 'video') return skillsFor('video', '').length ? [ai ? 'ativo' : 'pronto, falta a IA', ai ? G : Y, 'Os roteiros do Video Lab já saem com estrutura própria (4 tipos + ficha e glossário); com a IA, a skill de vídeo entra no pedido.' + tail] : ['sem ligação', R, 'Nenhuma skill ligada à função Vídeo. Adicione a Skill Mestre de roteiros.'];
  if (kind === 'post') return ['ainda sem ligação', R, 'O Studio ainda não tem geração de post com skill. Hoje vale em campanha, carrossel e vídeo.'];
  if (kind === 'carrossel18') return ['parcial', Y, 'O carrossel de 18 textos está no Agente Editorial (que tem a skill própria). Nos carrosséis de slides do Studio a skill orienta, mas o formato pedido é o do Studio.'];
  if (kind === 'pesquisa') return ['depende de pesquisa na web', R, 'O Studio ainda não busca fontes na web: ele lê o link que você colar, mas não pesquisa sozinho. Sem isso, a IA só trabalha com o material que você der.'];
  if (kind === 'comando') return ['ainda sem chat', Y, 'Os comandos viram botões (o Agente Editorial já tem refazer ângulos e headlines). Não há conversa de comandos.'];
  return ['?', Y, ''];
}
function skPotentialHTML() {
  const ai = typeof aiReady === 'function' && aiReady(), L = skList(), act = L.filter(k => k.auto && k.on !== false);
  const wired = Object.entries(SK_FN_INFO).filter(([, v]) => v[1]).map(([k]) => k), covered = wired.filter(f => act.some(k => (k.fns || []).includes(f)));
  const all = SK_CAPS.flatMap(([, a]) => a), st = all.map(([, k]) => skCapStatus(k)[1]), okN = st.filter(c => c === '#2e7d4f').length, midN = st.filter(c => c === '#c9952a').length;
  const row = (l, ok, note) => `<div class="list-item"><div><strong>${ok ? '✓' : '✗'} ${esc(l)}</strong><small>${esc(note)}</small></div></div>`;
  return `<div class="panel"><h3 style="margin-top:0">Seu potencial hoje</h3><div class="list">
    ${row('Skill Editorial Engine adicionada e ligada', skEditorialOn(), skEditorialOn() ? 'Em ' + (L.find(k => k.id === 'sk_editorial_engine').fns || []).map(f => SK_FN_INFO[f][0].split(':')[0]).join(', ') : 'Adicione na aba Skills e ligue o uso automático.')}
    ${row('IA de texto configurada', ai, ai ? 'As skills entram nos pedidos automaticamente.' : 'Sem a IA, nada é gerado. Use "Ver o pedido que será enviado" para copiar o texto.')}
    ${row('Pesquisa na web', false, 'Ainda não existe no Studio. Cole o texto ou o link da fonte para a IA usar.')}
    ${row('Funções com skill ativa (' + covered.length + ' de ' + wired.length + ' ligadas)', covered.length > 0, covered.length ? covered.map(f => SK_FN_INFO[f][0].split(':')[0]).join(', ') : 'Nenhuma ainda.')}
    ${row('Skill Mestre de roteiros audiovisuais ligada ao Video Lab', skOn('sk_audiovisual', 'video'), skOn('sk_audiovisual', 'video') ? 'Entra nos roteiros do Video Lab.' : 'Adicione na aba Skills e ligue o uso automático.')}
    ${row('Motor de Stories', false, 'Está em rascunho e o módulo de Stories ainda não existe.')}</div>
    <p class="muted" style="font-size:12.5px;margin:10px 0 0"><b>${okN}</b> de ${all.length} capacidades ativas agora · <b>${midN}</b> prontas ou parciais · <b>${all.length - okN - midN}</b> dependem de algo que ainda falta.</p></div>
  <div class="panel" style="margin-top:12px"><h3 style="margin-top:0">O que esperar da Editorial Engine</h3><p class="muted" style="font-size:12.5px;margin-top:0">Cada linha mostra o estado real no Studio, não só o que a skill promete.</p>
  ${SK_CAPS.map(([g, a]) => `<h4 style="margin:12px 0 4px">${esc(g)}</h4>${a.map(([t, k]) => { const [lb, col, nt] = skCapStatus(k); return `<div class="list-item"><div><strong style="font-weight:600">${esc(t)}</strong><small>${esc(nt)}</small></div><span class="cmp-tag" style="background:${col}22;color:${col};white-space:nowrap">${esc(lb)}</span></div>`; }).join('')}`).join('')}
  </div>${skAudioPanel()}<div class="panel" style="margin-top:12px"><p class="muted" style="font-size:12px;margin:0">A skill não serve só para escrever um texto: ela organiza o raciocínio editorial antes da redação. Ela também impõe limites: não inventa dados, fontes ou acontecimentos, e reduz a tese quando a evidência é fraca.</p></div>`;
}

/* ---- o que esperar da Skill Mestre de roteiros audiovisuais ---- */
const SK_CAPS_AV = [
  ['Entrega no Video Lab', [['Ficha estratégica, roteiro literário, de gravação, técnico, de edição e glossário, nessa ordem', 'av_doc'], ['Roteiro técnico sempre em tabela, com o tempo em intervalos (00–03s) e vocabulário de planos e movimentos', 'av_doc'], ['Cadeia de consistência: o técnico só usa as cenas da gravação e a edição só usa o material previsto', 'av_chain'], ['Glossário só com os termos que aparecem nos roteiros, sempre na última seção', 'av_doc']]],
  ['Inteligência editorial', [['Lê o material e transforma dados, insights e oportunidades em ideias com razão para existir', 'av_ia'], ['Mineração de dores, desejos, objeções, dúvidas, medos, padrões e linguagem do público', 'av_data'], ['Diferencia dado observado, insight, hipótese e inferência criativa e não inventa dados', 'av_ia'], ['Vários tipos de hook (curiosidade, contradição, pergunta, identificação, resultado...)', 'av_ia'], ['Prioriza oportunidades (alta, média, baixa) e escolhe o formato pela plataforma e pelo objetivo', 'av_ia']]],
  ['Modos de operação', [['Faz perguntas objetivas quando faltam informações essenciais', 'av_chat'], ['Modo revisão: audita inconsistências, cenas ausentes, dados inventados, duração e CTA fraco', 'av_review']]]
];
function skAvStatus(kind) {
  const G = '#2e7d4f', Y = '#c9952a', R = '#b04040', ai = typeof aiReady === 'function' && aiReady(), has = skList().some(x => x.id === 'sk_audiovisual');
  if (!has) return ['adicione a skill', R, 'A Skill Mestre ainda não está na sua lista.'];
  if (!skOn('sk_audiovisual', 'video')) return ['skill desligada', R, 'Ligue o uso automático na função Vídeo.'];
  if (kind === 'av_doc') return ['pronto no Video Lab', G, 'Os 6 documentos já nascem do esqueleto, sem IA e sem crédito. Com a IA, cada um pode ser reescrito.'];
  if (kind === 'av_chain') return [ai ? 'ativo com a IA' : 'pronto, falta a IA', ai ? G : Y, 'Os esqueletos já seguem as mesmas cenas; na reescrita com IA os outros documentos vão junto no pedido para manter a cadeia.'];
  if (kind === 'av_ia') return [ai ? 'ativo' : 'pronto, falta a IA', ai ? G : Y, 'Vale como instrução na reescrita com IA do Video Lab.' + (ai ? '' : ' Só funciona com a IA de texto configurada.')];
  if (kind === 'av_data') return ['parcial', Y, 'O Studio usa o que está no projeto (pré-projeto, caderno de ideias, briefing, campanha). Planilhas, métricas e comentários em lote ainda não entram sozinhos.'];
  if (kind === 'av_chat') return ['ainda sem chat', Y, 'Não há conversa para perguntas. O esqueleto marca com [CONFIRMAR] o que falta e você completa.'];
  if (kind === 'av_review') return ['ainda não existe', R, 'Não há botão de revisão. Hoje dá para pedir a reescrita com IA ou revisar à mão.'];
  return ['?', Y, ''];
}
function skAudioPanel() {
  return `<div class="panel" style="margin-top:12px"><h3 style="margin-top:0">O que esperar da Skill Mestre de roteiros audiovisuais</h3><p class="muted" style="font-size:12.5px;margin-top:0">Também com o estado real no Studio.</p>${SK_CAPS_AV.map(([g, a]) => `<h4 style="margin:12px 0 4px">${esc(g)}</h4>${a.map(([t, k]) => { const [lb, col, nt] = skAvStatus(k); return `<div class="list-item"><div><strong style="font-weight:600">${esc(t)}</strong><small>${esc(nt)}</small></div><span class="cmp-tag" style="background:${col}22;color:${col};white-space:nowrap">${esc(lb)}</span></div>`; }).join('')}`).join('')}</div>`;
}
