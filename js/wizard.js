/* Assistente de novo projeto: briefing livre, áudio ou entrevista guiada → o Studio extrai contexto → usuário revisa → projeto nasce estruturado */
const WIZ_STEPS = ['Sobre o projeto', 'Contexto', 'Revisão', 'Identidade'];
const BRIEF_FIELDS = [['offer', 'Oferta (o que vende)'], ['audience', 'Público'], ['problem', 'Problema que resolve'], ['goal', 'Objetivo'], ['channels', 'Canais atuais'], ['budget', 'Orçamento'], ['deadline', 'Prazo'], ['competitors', 'Concorrentes e referências']];
const CRITICAL = ['offer', 'audience', 'goal'];
const INTERVIEW = [
  ['offer', 'O que vocês vendem ou oferecem?', 'Produto, serviço, ticket médio, diferencial.'], ['audience', 'Quem compra hoje (e quem deveria comprar)?', 'Perfil, situação, de onde vêm.'],
  ['problem', 'Que problema o cliente tem quando procura vocês?', 'Na palavra do cliente, se possível.'], ['goal', 'O que querem alcançar com este projeto?', 'Resultado desejado, mesmo que ainda sem número.'],
  ['challenges', 'O que hoje atrapalha o crescimento?', 'Vendas, equipe, sistemas, tempo, marketing...'], ['channels', 'Quais canais já usam?', 'Instagram, WhatsApp, site, indicação, anúncios...'],
  ['budget', 'Existe orçamento ou limite de investimento?', 'Pode ser uma faixa.'], ['deadline', 'Há prazo ou data importante?', 'Lançamento, sazonalidade.'], ['competitors', 'Concorrentes ou referências que admiram?', 'Nomes ou links.']
];
/* Palavras-chave que sugerem desafios do Pré-Projeto (sempre revisadas pelo usuário) */
const DETECT = [
  ['d1', /indica[çc][ãa]o|boca a boca/i],
  ['d2', /previs[ãa]o de (fechamento|venda)|sem previsibilidade|n[ãa]o sabemos quanto (vamos )?(fechar|vender)/i],
  ['d3', /(n[ãa]o (temos|tem|possu[ií]mos|possui|possuem)|sem) (uma |um )?(área|equipe|time|setor|departamento)( especializad[ao])? (comercial|de vendas)|n[ãa]o (temos|tem) vendedor/i],
  ['d4', /(n[ãa]o (temos|tem|possu[ií]mos|possui|possuem)|sem) (uma |um )?(área|equipe|time|setor|departamento)( especializad[ao])? (de )?marketing/i],
  ['d5', /marketing (é|e|como|visto como|encarado como) (um )?(custo|gasto|despesa)|marketing .{0,25}(custo|gasto)/i],
  ['d6', /s[óo]cios|donos? .{0,40}(operaç|gest)|operaç[ãa]o.{0,40}gest[ãa]o/i],
  ['d7', /n[ãa]o (temos|tem|focamos|possu[ií]mos).{0,30}(produto|servi[çc]o)|vendemos de tudo|v[áa]rios produtos|sem foco em (um )?produto/i],
  ['d8', /(n[ãa]o (temos|tem|usamos|possu[ií]mos|possui|possuem)|sem) .{0,25}(crm|sistema de (vendas|gest[ãa]o)|controle de vendas)/i]
];
const SENT_KEYS = {
  offer: /vend(emos|e)\b|oferec|nosso (produto|servi[çc]o)|trabalh(amos|a) com|atuamos|somos uma?\b/i, audience: /p[úu]blico|clientes? (s[ãa]o|ideal)|atendemos|quem (compra|contrata)|pessoas que/i,
  problem: /problema|dificuldade|desafio|\bdor\b|n[ãa]o consegue|depende/i, goal: /objetivo|queremos|\bmeta\b|precisamos|pretendemos|gostar[ií]amos/i,
  channels: /instagram|facebook|google|whatsapp|\bsite\b|tr[áa]fego|meta ads|youtube|tiktok|linkedin|e-?mail/i, budget: /R\$\s?[\d.,]+|or[çc]amento|invest/i,
  deadline: /prazo|at[ée] (o dia|dia|\w+)|em \d+ (dias|semanas|meses)|lan[çc]amento/i, competitors: /concorrent|refer[êe]ncia|nos inspiramos/i
};
let wiz = null;
const newWiz = () => ({step: 1, name: '', client: '', category: 'Marketing', desc: '', mode: 'livre', text: '', transcript: '', interview: {}, audioBlob: null, audioMs: 0, recording: false,
  ext: {offer: '', audience: '', problem: '', goal: '', channels: '', budget: '', deadline: '', competitors: ''}, challenges: {}, hits: {}, other: [], extracted: false, brand: {tone: '', palette: '', visual: '', rule: ''}});

/* ---- áudio: IndexedDB (o original é preservado junto com a transcrição) ---- */
const idb = () => new Promise((res, rej) => { const r = indexedDB.open('ampliacao_studio_media', 1); r.onupgradeneeded = () => r.result.createObjectStore('audio'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
async function audioPut(id, blob) { const db = await idb(); return new Promise((res, rej) => { const t = db.transaction('audio', 'readwrite'); t.objectStore('audio').put(blob, id); t.oncomplete = res; t.onerror = () => rej(t.error); }); }
async function audioGet(id) { const db = await idb(); return new Promise((res, rej) => { const q = db.transaction('audio').objectStore('audio').get(id); q.onsuccess = () => res(q.result || null); q.onerror = () => rej(q.error); }); }

function openWizard(prefName) { wiz = newWiz(); if (typeof prefName === 'string') wiz.name = prefName; go('wizard'); }
function renderWizard() {
  const r = $('wizardRoot'); if (!wiz) wiz = newWiz();
  const w = wiz, steps = `<div class="jp-progress">${WIZ_STEPS.map((s, i) => `<span class="jp-step ${i + 1 === w.step ? 'active' : i + 1 < w.step ? 'done' : ''}">${pad(i + 1, 2)} ${s}</span>`).join('')}</div>`;
  let body = '';
  if (w.step === 1) body = `<div class="panel wiz-panel"><h3>Sobre o projeto</h3><p class="sub">Só o essencial. O Studio cria o restante a partir do contexto no próximo passo.</p>
    <div class="form-grid"><div class="field"><label>Nome do projeto *</label><input id="wzName" value="${esc(w.name)}" oninput="wiz.name=this.value" placeholder="Ex.: Mutuários Brasil"></div><div class="field"><label>Cliente / empresa</label><input value="${esc(w.client)}" oninput="wiz.client=this.value" placeholder="Quem é o dono do projeto"></div>
    <div class="field"><label>Categoria</label><select onchange="wiz.category=this.value">${['Marketing', 'Branding', 'Conteúdo', 'Lançamento', 'Performance'].map(c => `<option ${c === w.category ? 'selected' : ''}>${c}</option>`).join('')}</select></div><div class="field"><label>Descrição curta</label><input value="${esc(w.desc)}" oninput="wiz.desc=this.value" placeholder="Em uma linha"></div></div></div>`;
  if (w.step === 2) body = `<div class="panel wiz-panel"><h3>Conte o contexto</h3><p class="sub">Escreva, fale ou responda uma entrevista curta. Você não precisa organizar nada: o Studio extrai o que entendeu e você revisa no próximo passo.</p>
    <div class="matrix-tabs wiz-tabs">${[['livre', 'Escrever ou colar'], ['audio', 'Falar (áudio)'], ['entrevista', 'Entrevista guiada']].map(([k, l]) => `<button class="${w.mode === k ? 'active' : ''}" onclick="wizMode('${k}')">${l}</button>`).join('')}</div>
    ${w.mode === 'livre' ? `<textarea class="jp-ta wiz-big" id="wzText" rows="10" oninput="wiz.text=this.value" placeholder="Fale tudo de uma vez: o que a empresa vende, para quem, qual o problema, o que querem alcançar, o que hoje atrapalha, canais, prazos...">${esc(w.text)}</textarea>` : ''}
    ${w.mode === 'audio' ? wizAudioHTML() : ''}
    ${w.mode === 'entrevista' ? `<p class="muted" style="font-size:11px">Preencha só o que for realmente importante. Campos vazios viram lacunas que o Studio aponta depois.</p><div class="form-grid">${INTERVIEW.map(([k, q, h]) => `<div class="field full"><label>${esc(q)} <small class="muted">${esc(h)}</small></label><textarea rows="2" oninput="wiz.interview['${k}']=this.value">${esc(w.interview[k] || '')}</textarea></div>`).join('')}</div>` : ''}</div>`;
  if (w.step === 3) body = wizReviewHTML();
  if (w.step === 4) body = wizFinalHTML();
  r.innerHTML = `<div class="page-head"><div><h1>Novo projeto</h1><p>O projeto é a unidade central: tudo que for criado fica ligado a ele.</p></div><div class="actions"><button class="btn" onclick="wizCancel()">Cancelar</button></div></div>${steps}${body}
    <div class="wiz-nav">${w.step > 1 ? `<button class="btn" onclick="wizBack()">← Voltar</button>` : '<span></span>'}${w.step < 4 ? `<button class="btn dark" onclick="wizNext()">${w.step === 2 ? 'Extrair contexto →' : 'Continuar →'}</button>` : `<button class="btn orange" onclick="wizCreate()">Criar projeto e abrir o Pré-Projeto</button>`}</div>`;
}
function wizAudioHTML() {
  const w = wiz;
  return `<div class="wiz-audio"><div class="rec-row">${w.recording ? `<button class="btn dark rec-on" onclick="wizRecStop()">■ Parar</button><span class="mono" id="wizTimer">00:00</span><span class="rec-dot"></span><small class="muted">Gravando…</small>` : `<button class="btn dark" onclick="wizRecStart()">● ${w.audioBlob ? 'Gravar de novo' : 'Gravar'}</button><button class="btn" onclick="$('wizAudioFile').click()">⬆ Anexar áudio existente</button><input type="file" id="wizAudioFile" accept="audio/*" hidden onchange="wizAudioFile(this.files[0])">`}</div>
    ${w.audioBlob ? `<audio controls src="${URL.createObjectURL(w.audioBlob)}" style="width:100%;margin:10px 0"></audio><small class="muted">O áudio original é guardado com o projeto (${Math.round(w.audioBlob.size / 1024)} KB).</small>` : ''}
    <div class="field full" style="margin-top:12px"><label>Transcrição ${typeof (window.SpeechRecognition || window.webkitSpeechRecognition) === 'undefined' ? '<small class="muted">(este navegador não transcreve sozinho: digite ou cole o texto)</small>' : '<small class="muted">(gerada ao vivo no Chrome; edite se precisar)</small>'}</label><textarea class="jp-ta" id="wizTranscript" rows="7" oninput="wiz.transcript=this.value" placeholder="O que foi dito aparece aqui.">${esc(w.transcript)}</textarea></div></div>`;
}
function wizMode(m) { wiz.mode = m; renderWizard(); }
function wizCancel() { if (wiz && wiz.recording) wizRecStop(); wiz = null; go('projects'); }
function wizBack() { wiz.step--; renderWizard(); }
async function wizNext() {
  const w = wiz;
  if (w.step === 1) { if (!w.name.trim()) { toast('Dê um nome ao projeto.'); return; } w.step = 2; return renderWizard(); }
  if (w.step === 2) {
    if (w.recording) wizRecStop();
    if (!wizSource().trim()) { toast('Conte o contexto (escrevendo, falando ou na entrevista).'); return; }
    toast('Lendo o contexto…'); await wizExtract(); w.step = 3; return renderWizard();
  }
  if (w.step === 3) { w.step = 4; return renderWizard(); }
}
/* texto-fonte do briefing, conforme o modo */
function wizSource() {
  const w = wiz;
  if (w.mode === 'livre') return w.text;
  if (w.mode === 'audio') return w.transcript;
  return INTERVIEW.map(([k, q]) => w.interview[k] ? `${q}\n${w.interview[k]}` : '').filter(Boolean).join('\n\n');
}
const sentences = t => t.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(s => s.length > 8);

async function wizExtract() {
  const w = wiz, src = wizSource(), ext = {offer: '', audience: '', problem: '', goal: '', channels: '', budget: '', deadline: '', competitors: ''};
  w.hits = {}; w.challenges = {}; w.other = []; w.aiUsed = false;
  if (w.mode === 'entrevista') BRIEF_FIELDS.forEach(([k]) => ext[k] = (w.interview[k] || '').trim());
  else { const ss = sentences(src); Object.keys(ext).forEach(k => { ext[k] = ss.filter(s => SENT_KEYS[k].test(s)).slice(0, 2).join(' '); }); }
  DETECT.forEach(([id, rx]) => { const m = src.match(rx); if (m) { w.challenges[id] = true; w.hits[id] = m[0].trim(); } });
  if (aiReady()) {
    try {
      const j = await aiJSON('Você extrai o contexto de um briefing de marketing. Use SOMENTE o que foi dito; se algo não foi dito, deixe string vazia (não invente). Responda só JSON: {"offer","audience","problem","goal","channels","budget","deadline","competitors","challenges":["d1".."d8"],"other":["..."]}. Desafios: d1 depende de indicação; d2 sem previsão de fechamento; d3 sem área comercial; d4 sem área de marketing; d5 vê marketing como custo; d6 donos divididos entre operação e gestão; d7 sem foco em produto; d8 sem sistema de gestão de vendas.', 'Briefing:\n' + src);
      BRIEF_FIELDS.forEach(([k]) => { if (typeof j[k] === 'string' && j[k].trim()) ext[k] = j[k].trim(); });
      if (Array.isArray(j.challenges)) { w.challenges = {}; w.hits = {}; j.challenges.filter(x => /^d[1-8]$/.test(x)).forEach(x => { w.challenges[x] = true; w.hits[x] = 'identificado pela IA'; }); }
      w.other = (Array.isArray(j.other) ? j.other : []).map(String).filter(Boolean).slice(0, 5).map(t => ({id: uid('o'), title: t}));
      w.aiUsed = true;
    } catch (e) { toast('IA indisponível, usei a leitura por palavras-chave: ' + e.message); }
  }
  w.ext = ext; w.extracted = true;
}
function wizReviewHTML() {
  const w = wiz, missing = CRITICAL.filter(k => !w.ext[k].trim());
  return `<div class="panel wiz-panel"><h3>Revise o que o Studio entendeu</h3><p class="sub">${w.aiUsed ? 'Leitura feita pela IA' : 'Leitura por palavras-chave'} a partir do que você contou. O que veio do cliente é ${tag('dado')}; tudo que o Studio deduz é ${tag('hipotese')} e fica editável.</p>
    ${missing.length ? `<div class="gap-box"><b>Lacunas críticas</b>: ${missing.map(k => BRIEF_FIELDS.find(f => f[0] === k)[1]).join(', ')}. Complete abaixo ou siga e valide com o cliente depois.</div>` : ''}
    <div class="form-grid">${BRIEF_FIELDS.map(([k, l]) => `<div class="field full"><label>${l}${CRITICAL.includes(k) ? ' *' : ''}</label><textarea rows="2" oninput="wiz.ext['${k}']=this.value">${esc(w.ext[k])}</textarea></div>`).join('')}</div></div>
  <div class="panel wiz-panel" style="margin-top:12px"><h3>Desafios identificados</h3><p class="sub">Cada desafio marcado gera uma hipótese no Pré-Projeto. Desmarque o que não se aplica e marque o que faltou.</p>
    <div class="jp-diagnostic">${CHALLENGES.map(c => `<label class="jp-check ${w.challenges[c.id] ? 'selected' : ''}"><input type="checkbox" ${w.challenges[c.id] ? 'checked' : ''} onchange="wiz.challenges['${c.id}']=this.checked;this.parentNode.classList.toggle('selected',this.checked)"><span><strong>${esc(c.title)}</strong><small>${w.hits[c.id] ? 'Detectado: “' + esc(w.hits[c.id]) + '”' : esc(c.note)}</small></span></label>`).join('')}</div>
    <div class="jp-other"><input id="wzOther" placeholder="Outro desafio..." onkeydown="if(event.key==='Enter')wizAddOther()"><button class="btn" onclick="wizAddOther()">＋ Adicionar</button></div>
    <div class="jp-summary">${w.other.map(o => `<span class="jp-tag">${esc(o.title)} <b class="x" onclick="wizRemoveOther('${o.id}')">×</b></span>`).join('')}</div></div>`;
}
function wizAddOther() { const i = $('wzOther'), v = i && i.value.trim(); if (!v) return; wiz.other.push({id: uid('o'), title: v}); renderWizard(); }
function wizRemoveOther(id) { wiz.other = wiz.other.filter(o => o.id !== id); renderWizard(); }
function wizFinalHTML() {
  const w = wiz, n = CHALLENGES.filter(c => w.challenges[c.id]).length + w.other.length;
  return `<div class="panel wiz-panel"><h3>Identidade da marca <small class="muted">(opcional, dá para completar depois)</small></h3><p class="sub">Base do Brand Brain. O Voice Brain (como falamos) é editado na tela Brand Brain.</p>
    <div class="form-grid"><div class="field"><label>Tom de voz</label><input value="${esc(w.brand.tone)}" oninput="wiz.brand.tone=this.value" placeholder="Claro, seguro, humano"></div><div class="field"><label>Paleta</label><input value="${esc(w.brand.palette)}" oninput="wiz.brand.palette=this.value" placeholder="Verde profundo · areia"></div><div class="field"><label>Direção visual</label><input value="${esc(w.brand.visual)}" oninput="wiz.brand.visual=this.value" placeholder="Editorial + performance"></div><div class="field"><label>Regra de ouro</label><input value="${esc(w.brand.rule)}" oninput="wiz.brand.rule=this.value" placeholder="Educar antes de converter"></div></div></div>
  <div class="panel wiz-panel" style="margin-top:12px"><h3>O que será criado</h3><div class="wiz-sum">
    <div><b>${esc(w.name)}</b><small>Projeto com Context ID próprio</small></div><div><b>Briefing original</b><small>${w.mode === 'audio' && w.audioBlob ? 'texto + áudio preservados' : 'texto preservado, sem alterações'}</small></div>
    <div><b>Pré-Projeto</b><small>${n} desafio(s) → ${n} hipótese(s) para validar</small></div><div><b>Brand Brain e Voice Brain</b><small>${w.brand.tone || w.brand.palette ? 'iniciados com sua identidade' : 'vazios, para completar'}</small></div>
    <div><b>Matriz, Video Lab, Aprovação</b><small>prontos para quando o pré-projeto for aprovado</small></div><div><b>Fluxo do projeto</b><small>do briefing à análise, com os gates</small></div></div></div>`;
}

async function wizCreate() {
  const w = wiz, e = w.ext;
  const p = newProject(w.name.trim(), w.desc.trim() || w.client.trim(), {category: w.category, client: w.client.trim(), goal: e.goal, brand: {positioning: '', tone: w.brand.tone, palette: w.brand.palette, visual: w.brand.visual, rule: w.brand.rule, instructions: ''}});
  p.brief = Object.assign(p.brief, e, {source: w.mode, original: wizSource(), transcript: w.mode === 'audio' ? w.transcript : '', hasAudio: !!w.audioBlob, audioMs: w.audioMs, createdAt: new Date().toISOString()});
  CHALLENGES.forEach(c => { if (w.challenges[c.id]) p.pre.challenges[c.id] = true; });
  p.pre.other = w.other.slice();
  p.pre.briefing = [e.offer && 'Oferta: ' + e.offer, e.audience && 'Público: ' + e.audience, e.problem && 'Problema: ' + e.problem, e.goal && 'Objetivo: ' + e.goal].filter(Boolean).join('\n') || wizSource().slice(0, 600);
  p.pre.history.unshift({at: new Date().toISOString(), action: 'Projeto criado', note: 'A partir de briefing ' + ({livre: 'escrito', audio: 'em áudio', entrevista: 'por entrevista guiada'})[w.mode] + '.'});
  if (w.audioBlob) { try { await audioPut(p.id, w.audioBlob); } catch (err) { p.brief.hasAudio = false; toast('Não consegui guardar o áudio neste navegador; o texto foi salvo.'); } }
  refreshDrafts(p.pre);
  state.projects.push(p); state.activeProjectId = p.id; persist(); wiz = null; updateContextUI();
  ui.tab = 'preproject'; go('project'); toast('Projeto criado. Revise as hipóteses e siga o fluxo.');
}

/* ---- gravação ---- */
async function wizRecStart() {
  const w = wiz;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio: true}), chunks = [], mr = new MediaRecorder(stream), t0 = Date.now();
    mr.ondataavailable = ev => { if (ev.data.size) chunks.push(ev.data); };
    mr.onstop = () => { stream.getTracks().forEach(t => t.stop()); w.audioBlob = new Blob(chunks, {type: mr.mimeType || 'audio/webm'}); w.audioMs = Date.now() - t0; w.recording = false; clearInterval(w.tick); try { w.sr && w.sr.stop(); } catch (x) { /* ok */ } if (wiz === w) renderWizard(); };
    mr.start(); w.mr = mr; w.recording = true; w.t0 = t0;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const sr = new SR(); sr.lang = 'pt-BR'; sr.continuous = true; sr.interimResults = false;
      sr.onresult = ev => { let f = ''; for (let i = ev.resultIndex; i < ev.results.length; i++) if (ev.results[i].isFinal) f += ev.results[i][0].transcript + ' '; if (f) { w.transcript += (w.transcript ? ' ' : '') + f.trim(); const t = $('wizTranscript'); if (t) t.value = w.transcript; } };
      sr.onend = () => { if (w.recording) try { sr.start(); } catch (x) { /* ok */ } };
      try { sr.start(); w.sr = sr; } catch (x) { /* ok */ }
    }
    renderWizard();
    w.tick = setInterval(() => { const t = $('wizTimer'); if (t) { const s = Math.floor((Date.now() - t0) / 1000); t.textContent = pad(Math.floor(s / 60), 2) + ':' + pad(s % 60, 2); } }, 500);
  } catch (e) { toast('Microfone indisponível (' + e.message + '). Anexe um áudio ou digite a transcrição.'); }
}
function wizRecStop() { if (wiz && wiz.mr && wiz.recording) wiz.mr.stop(); }
function wizAudioFile(f) { if (!f) return; wiz.audioBlob = f; wiz.audioMs = 0; renderWizard(); toast('Áudio anexado. Digite ou cole a transcrição para o Studio ler o conteúdo.'); }
