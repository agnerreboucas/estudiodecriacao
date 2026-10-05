/* Modo Integração: página única para ver o que está ligado (IA texto/imagem, narração, banco de imagens, upscale, vídeo),
   testar cada conexão, e os recursos que dependem delas: banco de imagens (Magnific) e narração do e-book (ElevenLabs).
   As chaves ficam só no servidor (api/config.php); aqui o navegador só vê "configurado / não configurado". */
const INT = {keys: null, keysLoading: false, voices: null, voicesErr: '', testing: '', out: {}, stock: {q: '', page: 1, res: [], busy: false, cb: null, or: ''}};
const intSt = () => (API.status || {});
const intOn = k => canUseApi() && !!(intSt()[k] && intSt()[k].configured);
const ttsReady = () => intOn('tts');
const stockReady = () => intOn('magnific');

const INT_CARDS = [
  {k: 'ai', ico: 'sparkles', t: 'IA de texto · Claude ou GPT', d: 'Motor de conteúdo, diagnóstico, copy, leitura de layout e de imagens. Escolha o provedor e cole a chave dele.', fields: [['AI_PROVIDER', 'Provedor'], ['ANTHROPIC_API_KEY', 'Chave Claude (Anthropic)'], ['OPENAI_API_KEY', 'Chave GPT (OpenAI)']], test: 'text'},
  {k: 'image', ico: 'image', t: 'Imagens com IA · OpenAI', d: 'Gera fotos e ilustrações (Biblioteca de imagens, Editor de Design, capas). Usa a mesma chave OpenAI do GPT.', fields: [['OPENAI_API_KEY', 'Chave OpenAI']], test: ''},
  {k: 'magnific', ico: 'pin', t: 'Magnific · banco de imagens e upscale', d: 'Busca imagens de banco para capa, design e miolo, e amplia a resolução para impressão.', fields: [['MAGNIFIC_API_KEY', 'Chave Magnific']], test: 'stock'},
  {k: 'tts', ico: 'video', t: 'ElevenLabs · narração e transcrição', d: 'Lê o e-book em voz alta (aba Áudio) e transcreve áudios de insumo.', fields: [['ELEVENLABS_API_KEY', 'Chave ElevenLabs']], test: 'voices'},
  {k: 'higgsfield', ico: 'video', t: 'Higgsfield · vídeo e imagem', d: 'Espaço reservado. Depois de contratar, envie a documentação da API e eu escrevo a integração (anúncios em vídeo).', fields: [['HIGGSFIELD_API_KEY', 'Chave Higgsfield']], test: '', soon: true}
];
function renderIntegracoes() {
  const r = $('integracoesRoot'); if (!r) return;
  const s = intSt(), ok = k => !!(s[k] && s[k].configured);
  if (!API.available) { r.innerHTML = intDemoPanel() + intLocalPanel() + integrationsHTML(); return; }
  if (canUseApi() && !INT.keys && !INT.keysLoading) { INT.keysLoading = true; api('keys.php').then(j => { INT.keys = j; }, () => { INT.keys = {keys: {}, editable: false}; }).then(() => { INT.keysLoading = false; renderIntegracoes(); }); }
  const aiProv = s.ai && s.ai.provider === 'openai' ? 'GPT (OpenAI)' : 'Claude (Anthropic)';
  r.innerHTML = `<div class="section-row" style="margin-bottom:10px"><div><h2 style="margin:0;font-size:18px">Integrações (APIs)</h2><p class="muted" style="margin:2px 0 0">Onde você liga as APIs. Cada chave fica só no servidor, no arquivo <span class="mono">api/config.php</span>; aqui você vê o que está ligado e testa a conexão.</p></div><button class="btn" onclick="INT.keys=null;loadStatus().then(renderIntegracoes)">↻ Atualizar status</button></div>
  ${intDemoPanel()}
  ${INT.keys && !INT.keys.editable ? intSetupPanel() : ''}
  ${needsLogin() ? `<div class="panel" style="margin-bottom:12px"><div class="section-row"><div><h3>Entre no Studio</h3><p class="muted">Sem login o servidor não mostra o status das chaves.</p></div><button class="btn dark" onclick="showLogin()">Entrar</button></div></div>` : ''}
  <div class="integration-grid int-big">${INT_CARDS.map(c => {
    const on = ok(c.k), extra = c.k === 'ai' && on ? ` · ${aiProv}${s.ai.model ? ' · ' + esc(s.ai.model) : ''}` : '';
    return `<div class="card"><div class="int-ico">${ico(c.ico, 24)}</div><h3>${esc(c.t)}</h3><p>${esc(c.d)}</p>
      ${c.soon ? '<span class="int-state">Aguardando documentação</span>' : `<span class="int-state ${on ? 'on' : ''}">${on ? 'Configurado' + extra : 'Não configurado'}</span>`}
      ${(c.fields || []).map(([n, l]) => intKeyRow(n, l)).join('')}
      ${c.test && on ? `<button class="btn sm" onclick="intTest('${c.test}')" ${INT.testing ? 'disabled' : ''}>${INT.testing === c.test ? 'Testando…' : 'Testar conexão'}</button>` : ''}
      ${INT.out[c.test] && c.test ? `<small class="int-out ${INT.out[c.test].ok ? 'ok' : 'bad'}">${esc(INT.out[c.test].msg)}</small>` : ''}</div>`;
  }).join('')}</div>
  <div class="panel" style="margin-top:14px"><h3>Onde cada integração aparece</h3><div class="int-map">
    <div><b>IA de texto</b><span>Conteúdo do e-book, Agente Editorial, leitura de layout, copy.</span></div>
    <div><b>Imagens com IA</b><span>Editor de Design (✦ Gerar com IA), capa, Laboratório de logos.</span></div>
    <div><b>Magnific</b><span>🔎 Banco de imagens na capa, no Editor de Design e nos quadros de imagem do miolo · ⤴ Melhorar resolução.</span></div>
    <div><b>ElevenLabs</b><span>Aba <b>Áudio</b> dentro de cada e-book.</span></div>
    <div><b>Higgsfield</b><span>Anúncios em vídeo (próxima etapa).</span></div></div></div>
  <div class="panel" style="margin-top:14px"><div class="section-row"><div><h3>Como ligar</h3><p class="muted" style="margin:2px 0 0">No servidor (Hostinger), copie <span class="mono">api/config.sample.php</span> para <span class="mono">api/config.php</span> e preencha as chaves. Nunca suba <span class="mono">config.php</span> para o GitHub.</p></div><button class="btn sm" onclick="intCopyCfg()">Copiar trecho do config</button></div>
  <small class="muted block" style="margin-top:8px">Os endereços da Magnific e os campos de upscale seguem a API pública como eu a conheço e ainda não foram validados com chave real: use “Testar conexão” e me mande o erro, se aparecer. A conta do GPT e a de imagens usam a mesma chave OpenAI.</small></div>
  <h2 style="margin:22px 0 10px;font-size:18px">Outras conexões</h2>${integrationsHTML()}`;
}
/* Teste de exemplo: mostra onde a chave entra e como fica o resultado de cada teste, SEM chamar nenhuma API */
const INT_DEMO = [['Texto (IA)', 'Resposta recebida: “ok”', 'Escolha o provedor e cole a chave Claude ou GPT.'], ['Imagens (IA)', '1 imagem de exemplo gerada', 'Usa a mesma chave OpenAI do GPT.'], ['Banco de imagens', '24 resultados para “flores”', 'Cole a chave Magnific.'], ['Narração', '12 vozes disponíveis na conta', 'Cole a chave ElevenLabs.']];
function intDemo() { INT.demoOut = true; renderIntegracoes(); }
function intDemoPanel() {
  return `<div class="panel" style="margin-bottom:12px;border:1px dashed #8886"><div class="section-row"><div><h3 style="margin:0">Teste de exemplo: onde a chave entra</h3><p class="muted" style="margin:2px 0 0;font-size:12.5px">Para ver como funciona antes de ter as chaves. Não chama nenhuma API e não gasta nada.</p></div><button class="btn sm" onclick="intDemo()">Simular o teste</button></div>
  <ol style="font-size:13px;margin:10px 0 6px 18px;line-height:1.6"><li>Em cada cartão abaixo há um campo <b>Chave</b>: é ali que você cola a chave da API.</li><li>Clique em <b>Salvar</b>. A chave vai para o servidor e nunca volta para o navegador (o campo mostra só "configurada").</li><li>Clique em <b>Testar conexão</b>. O resultado aparece embaixo do botão.</li></ol>
  <div class="row-gap" style="flex-wrap:wrap;margin-top:6px"><input disabled value="sk-ant-••••••••••••" style="width:200px" aria-label="campo de chave de exemplo"><button class="btn sm" disabled>Salvar</button><button class="btn sm" disabled>Testar conexão</button><span class="mono" style="font-size:11px;color:#888">← assim é o campo de cada cartão</span></div>
  ${INT.demoOut ? `<div class="list" style="margin-top:10px">${INT_DEMO.map(([n, out, how]) => `<div class="list-item"><div><strong>${esc(n)}</strong><small>${esc(how)}</small></div><span class="cmp-tag" style="background:#2e7d4f22;color:#2e7d4f">EXEMPLO · ${esc(out)}</span></div>`).join('')}</div><p class="muted" style="font-size:11.5px;margin:6px 0 0">Resultados de exemplo. O teste de verdade só aparece depois de salvar uma chave real.</p>` : ''}</div>`;
}
/* campo de chave: salva no servidor (keys.php), nunca volta para o navegador */
function intKeyRow(name, label) {
  const K = INT.keys, info = K && K.keys && K.keys[name] || {}, edit = !!(K && K.editable);
  if (name === 'AI_PROVIDER') { const cur = K && K.provider || 'anthropic'; return `<div class="int-key"><label>${esc(label)}</label><select ${edit ? '' : 'disabled'} onchange="intKeySave('AI_PROVIDER',this.value)"><option value="anthropic" ${cur === 'anthropic' ? 'selected' : ''}>Claude (Anthropic)</option><option value="openai" ${cur === 'openai' ? 'selected' : ''}>GPT (OpenAI)</option></select></div>`; }
  const st = info.configured ? (info.source === 'app' ? '● salva no app' : '● em config.php') : '○ não definida';
  return `<div class="int-key"><label>${esc(label)} <em class="${info.configured ? 'on' : ''}">${st}</em></label>${edit ? `<div class="row-gap"><input type="password" id="ik_${name}" autocomplete="off" placeholder="${info.configured ? 'cole para trocar' : 'cole a chave aqui'}"><button class="btn sm dark" onclick="intKeySave('${name}')">Salvar</button>${info.source === 'app' ? `<button class="btn sm" onclick="intKeyClear('${name}')">Remover</button>` : ''}</div>` : ''}</div>`;
}
async function intKeySave(name, val) {
  const v = val != null ? val : ($('ik_' + name) || {}).value || ''; if (!String(v).trim()) { toast('Cole a chave primeiro.'); return; }
  try { await api('keys.php', {method: 'POST', body: {name, value: String(v).trim()}}); INT.keys = null; await loadStatus(); toast('Salvo no servidor.'); renderIntegracoes(); } catch (e) { toast(e.message); }
}
async function intKeyClear(name) { if (!confirm('Remover esta chave do servidor?')) return; try { await api('keys.php', {method: 'POST', body: {name, clear: true}}); INT.keys = null; await loadStatus(); renderIntegracoes(); } catch (e) { toast(e.message); } }
function intCopyCfg() {
  const t = `'AI_PROVIDER' => 'openai',          // ou 'anthropic'\n'OPENAI_API_KEY' => '',\n'OPENAI_TEXT_MODEL' => 'gpt-4o',\n'ELEVENLABS_API_KEY' => '',\n'MAGNIFIC_API_KEY' => '',\n'HIGGSFIELD_API_KEY' => '',`;
  (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Trecho copiado.'), () => { showModal('Trecho do config.php', `<textarea rows="8" style="width:100%" class="mono">${esc(t)}</textarea><div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button></div>`); });
}
async function intTest(kind) {
  INT.testing = kind; renderIntegracoes();
  try {
    if (kind === 'text') { const t = await aiText('Responda só com a palavra: ok', 'teste', 20); INT.out.text = {ok: true, msg: 'Resposta recebida: “' + t.trim().slice(0, 40) + '”'}; }
    else if (kind === 'voices') { const v = await ttsVoices(true); INT.out.voices = {ok: true, msg: v.length + ' voz(es) disponível(is) na sua conta.'}; }
    else if (kind === 'stock') { const r = await api('magnific.php?action=stock&q=flores'); INT.out.stock = {ok: true, msg: (r.results || []).length + ' resultado(s) para “flores”.'}; }
  } catch (e) { INT.out[kind] = {ok: false, msg: e.message}; }
  INT.testing = ''; renderIntegracoes();
}

/* ---------- banco de imagens (Magnific) ---------- */
/* guarda um Blob como imagem do Studio e devolve {id, ar} (serve ao Editor de Design, à Diagramação e à capa) */
async function stockBlobToImg(blob) {
  const r = await dtpAddImageFile(blob); try { const bm = await createImageBitmap(blob); IMGS.set(r.id, bm); } catch (e) { /* ok */ } return r;
}
function stockPick(cb) {
  if (!stockReady()) { toast(needsLogin() ? 'Entre no Studio para usar o banco de imagens.' : 'Banco de imagens não configurado: defina MAGNIFIC_API_KEY (página Integrações).'); return; }
  INT.stock = Object.assign(INT.stock, {cb, res: [], page: 1, busy: false});
  showModal('🔎 Banco de imagens · Magnific', `<div class="row-gap"><input id="stQ" placeholder="Ex.: consultório moderno, folhas verdes, mulher sorrindo" style="flex:1" value="${esc(INT.stock.q)}" onkeydown="if(event.key==='Enter')stockSearch(1)"><label class="ins inl" style="white-space:nowrap"><input type="checkbox" checked onchange="INT.stock.save=this.checked"> guardar na biblioteca</label><select id="stOr" onchange="INT.stock.or=this.value"><option value="">Qualquer formato</option><option value="vertical">Vertical</option><option value="horizontal">Horizontal</option><option value="square">Quadrada</option></select><button class="btn dark" onclick="stockSearch(1)">Buscar</button></div>
    <div id="stRes" class="stock-grid"><p class="muted" style="grid-column:1/-1">Digite o que procura. Confira a licença de cada imagem no site do banco antes de publicar.</p></div><div id="stMore"></div>`);
  document.getElementById('modalBox').classList.add('wide'); setTimeout(() => $('stQ') && $('stQ').focus(), 60);
}
async function stockSearch(page) {
  const q = $('stQ').value.trim(); if (!q) { toast('Digite o que procura.'); return; }
  const S = INT.stock; S.q = q; S.page = page; $('stRes').innerHTML = '<p class="muted" style="grid-column:1/-1">Buscando…</p>';
  try {
    const r = await api('magnific.php?action=stock&q=' + encodeURIComponent(q) + '&page=' + page + (S.or ? '&orientation=' + S.or : ''));
    S.res = r.results || [];
    $('stRes').innerHTML = S.res.length ? S.res.map((x, i) => `<button class="stock-it" onclick="stockUse(${i})" title="${esc(x.title)}"><img src="${esc(x.url)}" alt="" loading="lazy" referrerpolicy="no-referrer"><span>${esc((x.author || '').slice(0, 24))}</span></button>`).join('') : '<p class="muted" style="grid-column:1/-1">Nada encontrado. Tente outra palavra (em inglês costuma render mais).</p>';
    $('stMore').innerHTML = `<div class="row-gap" style="justify-content:center;margin-top:8px">${page > 1 ? `<button class="btn sm" onclick="stockSearch(${page - 1})">← Anterior</button>` : ''}<button class="btn sm" onclick="stockSearch(${page + 1})">Próxima →</button></div>`;
  } catch (e) { $('stRes').innerHTML = `<p class="muted" style="grid-column:1/-1">${esc(e.message)}</p>`; }
}
async function stockUse(i) {
  const x = INT.stock.res[i], cb = INT.stock.cb; if (!x || !cb) return; toast('Baixando imagem…');
  try {
    const r = await api('magnific.php?action=fetch&url=' + encodeURIComponent(x.url)), blob = await (await fetch(r.image)).blob();
    if (INT.stock.save !== false && typeof libAddBlob === 'function') libAddBlob(blob, {name: x.title || 'Banco de imagens', kind: 'banco', tags: ['banco']}).catch(() => { }); const img = await stockBlobToImg(blob); closeModal(); cb(img); toast('Imagem aplicada. Lembre de conferir a licença.');
  } catch (e) { toast(e.message); }
}
/* amplia a resolução (Magnific). Devolve Blob. */
async function magUpscale(blob, scale) {
  const r = await api('magnific.php', {method: 'POST', body: {action: 'upscale', image: await blobToDataURL(blob), scale: scale || 2}});
  for (let n = 0; n < 40; n++) {
    await new Promise(z => setTimeout(z, 3000));
    const s = await api('magnific.php?action=upscale_status&task=' + encodeURIComponent(r.task));
    if (s.status === 'failed') throw new Error('O Magnific não conseguiu ampliar essa imagem.');
    if (s.status === 'done') { const f = await api('magnific.php?action=fetch&url=' + encodeURIComponent(s.url)); return (await fetch(f.image)).blob(); }
  }
  throw new Error('Tempo esgotado ampliando a imagem.');
}
/* ganchos nos editores */
function dzStockPhoto() { stockPick(r => { const L = dzLayer(); L.imgId = r.id; dzDraw(); dzCommit(); dzInspector(); dzSlidesPanel(); }); }
async function dzUpscalePhoto() {
  const L = dzLayer(); if (!L.imgId) return; if (!stockReady()) { toast('Magnific não configurado (página Integrações).'); return; }
  toast('Ampliando (pode levar ~1 min)…');
  try { const b = await magUpscale(await imgGet(L.imgId), 2), r = await stockBlobToImg(b); L.imgId = r.id; dzDraw(); dzCommit(); dzInspector(); toast('Imagem ampliada.'); } catch (e) { toast(e.message); }
}
function dtpStockImg() { const it = dtpSelItem(); if (!it) return; stockPick(r => { const q = dtpSelItem(); if (!q) return; q.imgId = r.id; q.ar = r.ar; dtpTouch(true); dtpPanel(); }); }
function covStockImg() { stockPick(r => { covC().imgId = r.id; persist(); renderEditora(); }); }

/* ---------- narração do e-book (ElevenLabs) ---------- */
async function ttsVoices(force) {
  if (INT.voices && !force) return INT.voices;
  const r = await api('tts.php?action=voices'); INT.voices = r.voices || []; return INT.voices;
}
function audText(s) {
  const L = []; if (s.label && s.type === 'chapter') L.push(s.label.toLowerCase() + '.'); if (s.title) L.push(s.title + '.'); if (s.subtitle) L.push(s.subtitle + '.');
  (s.blocks || []).forEach(b => {
    if (b.t === 'p' || b.t === 'h2' || b.t === 'box') L.push(b.text);
    else if (['list', 'check', 'summary'].includes(b.t)) L.push(...(b.items || []));
    else if (b.t === 'cols2') L.push(...(b.left || []), ...(b.right || []));
  });
  return L.filter(Boolean).join('\n\n').replace(/[*_#>`]/g, '');
}
/* divide em pedaços de até 4000 caracteres, cortando em fim de parágrafo/frase */
function audChunks(t, max) {
  max = max || 4000; const out = []; let cur = '';
  const push = s => { if ((cur + s).length > max && cur) { out.push(cur.trim()); cur = ''; } cur += s; };
  t.split(/\n{2,}/).forEach(par => {
    if (par.length <= max) { push(par + '\n\n'); return; }
    par.split(/(?<=[.!?…])\s+/).forEach(sn => { while (sn.length > max) { push(sn.slice(0, max)); sn = sn.slice(max); } push(sn + ' '); });
  });
  if (cur.trim()) out.push(cur.trim()); return out;
}
const aud = {busy: '', cache: {}, msg: ''};
const audE = eb => eb.audio || (eb.audio = {voiceId: '', voiceName: '', items: {}});
function audRender(b, eb) {
  const A = audE(eb), secs = eb.sections.filter(s => ['title', 'chapter', 'text'].includes(s.type) && audText(s).replace(/\s/g, '').length > 3), total = secs.reduce((n, s) => n + audText(s).length, 0);
  if (!ttsReady()) { b.innerHTML = `<div class="mot-wrap"><div><div class="mot-ch"><b>Áudio · ler o livro em voz alta</b><p class="muted" style="font-size:12.5px">Gera a narração de cada capítulo com a ElevenLabs, com player e download em MP3 (audiolivro, prévia para redes, acessibilidade).</p><p style="font-size:12.5px">${needsLogin() ? 'Entre no Studio para usar.' : 'Falta ligar a ElevenLabs: coloque <span class="mono">ELEVENLABS_API_KEY</span> em <span class="mono">api/config.php</span>.'}</p><button class="btn dark" onclick="go('settings')">Abrir Configurações → Integrações</button></div></div></div>`; return; }
  const vs = INT.voices;
  if (!vs && !aud.loading) { aud.loading = true; ttsVoices().then(() => { aud.loading = false; if (eui.bt === 'audio') audRender(b, eb); }, e => { aud.loading = false; INT.voices = []; INT.voicesErr = e.message; if (eui.bt === 'audio') audRender(b, eb); }); }
  const done = secs.filter(s => A.items[s.id] && A.items[s.id].ids.length).length;
  b.innerHTML = `<div class="mot-wrap"><div>
    <div class="mot-ch"><b>Narração do livro</b><p class="muted" style="font-size:12.5px">Escolha a voz, narre cada capítulo e ouça aqui. O texto narrado é o do conteúdo do e-book (aba 1). Revise o texto antes: cada geração consome créditos da sua conta ElevenLabs.</p>
      <div class="row-gap" style="flex-wrap:wrap;align-items:flex-end"><label class="ins" style="min-width:240px">Voz<select id="audVoice" onchange="audVoice(this)">${vs ? `<option value="">— escolha —</option>${vs.map(v => `<option value="${esc(v.id)}" ${v.id === A.voiceId ? 'selected' : ''}>${esc(v.name)}${v.labels && v.labels.language ? ' · ' + esc(v.labels.language) : ''}${v.category ? ' · ' + esc(v.category) : ''}</option>`).join('')}` : '<option>Carregando vozes…</option>'}</select></label>
      <button class="btn sm" onclick="audPreview()" ${A.voiceId ? '' : 'disabled'}>▶ Ouvir a voz</button><button class="btn sm dark" onclick="audAll()" ${A.voiceId && !aud.busy ? '' : 'disabled'}>Narrar tudo (${secs.length})</button><button class="btn sm" onclick="audZip()" ${done ? '' : 'disabled'}>⬇ Baixar tudo (ZIP)</button></div>
      ${INT.voicesErr ? `<small class="muted block">${esc(INT.voicesErr)}</small>` : ''}<small class="muted block" style="margin-top:6px">${total.toLocaleString('pt-BR')} caracteres no total · ${done}/${secs.length} narrados ${aud.msg ? '· ' + esc(aud.msg) : ''}</small></div>
    <div class="list" style="margin-top:10px">${secs.map(s => { const it = A.items[s.id], t = audText(s); return `<div class="list-item aud-it"><div><strong>${esc(s.label ? s.label + ' · ' : '')}${esc(s.title || '(sem título)')}</strong><small>${t.length.toLocaleString('pt-BR')} caracteres${it && it.ids.length ? ' · narrado' + (it.stale ? ' (texto mudou)' : '') : ''}</small>${it && it.ids.length ? `<audio controls preload="none" id="aud_${s.id}" style="width:100%;margin-top:4px"></audio>` : ''}</div>
      <div class="row-gap"><button class="btn sm ${it && it.ids.length ? '' : 'dark'}" onclick="audOne('${s.id}')" ${A.voiceId && !aud.busy ? '' : 'disabled'}>${aud.busy === s.id ? 'Gerando…' : it && it.ids.length ? 'Narrar de novo' : 'Narrar'}</button>${it && it.ids.length ? `<button class="btn sm" onclick="audDl('${s.id}')">⬇ MP3</button>` : ''}</div></div>`; }).join('') || '<p class="muted">Gere o conteúdo na aba 1 · Conteúdo para ter o que narrar.</p>'}</div></div></div>`;
  secs.forEach(s => { const it = A.items[s.id]; if (it && it.ids.length) audLoad(s.id, it); });
}
async function audBlob(it) { const parts = []; for (const id of it.ids) { const b = await imgGet(id); if (b) parts.push(b); } return new Blob(parts, {type: 'audio/mpeg'}); }
async function audLoad(sid, it) { const el = $('aud_' + sid); if (!el || el.dataset.ok) return; el.dataset.ok = 1; const b = await audBlob(it); if (b.size) el.src = URL.createObjectURL(b); }
function audVoice(sel) { const eb = ebCur(), A = audE(eb), v = (INT.voices || []).find(x => x.id === sel.value); A.voiceId = sel.value; A.voiceName = v ? v.name : ''; persist(); audRender($('bookBody') || sel.closest('.mot-wrap').parentNode, eb); }
async function audSpeak(text, voice) { const r = await api('tts.php', {method: 'POST', body: {text, voice_id: voice}}); return (await fetch(r.audio)).blob(); }
async function audPreview() {
  const A = audE(ebCur()), v = (INT.voices || []).find(x => x.id === A.voiceId); try { toast('Gerando prévia…'); const b = await audSpeak('Olá! Esta é a voz que vai ler o seu livro.', A.voiceId); const a = new Audio(URL.createObjectURL(b)); a.play(); } catch (e) { toast(e.message); }
}
async function audNarrate(eb, s) {
  const A = audE(eb), t = audText(s), parts = audChunks(t), ids = [];
  for (let i = 0; i < parts.length; i++) { aud.msg = (s.title || '') + ' · parte ' + (i + 1) + '/' + parts.length; const id = uid('aud'); await imgPut(id, await audSpeak(parts[i], A.voiceId)); ids.push(id); }
  const old = A.items[s.id]; if (old) for (const id of old.ids) imgDel(id).catch(() => { });
  A.items[s.id] = {ids, chars: t.length, at: new Date().toISOString()}; persist();
}
async function audOne(sid) {
  const eb = ebCur(), s = eb.sections.find(x => x.id === sid); if (!s || aud.busy) return; aud.busy = sid; audRender($('bookBody'), eb);
  try { await audNarrate(eb, s); aud.msg = 'pronto'; } catch (e) { toast(e.message); aud.msg = ''; }
  aud.busy = ''; if (eui.bt === 'audio') audRender($('bookBody'), eb);
}
async function audAll() {
  const eb = ebCur(), secs = eb.sections.filter(s => ['title', 'chapter', 'text'].includes(s.type) && audText(s).replace(/\s/g, '').length > 3);
  const chars = secs.reduce((n, s) => n + audText(s).length, 0);
  if (!confirm(`Narrar ${secs.length} seção(ões), cerca de ${chars.toLocaleString('pt-BR')} caracteres? Isso consome créditos da ElevenLabs.`)) return;
  aud.busy = 'all'; audRender($('bookBody'), eb);
  try { for (const s of secs) { await audNarrate(eb, s); audRender($('bookBody'), eb); } aud.msg = 'tudo narrado'; } catch (e) { toast(e.message); }
  aud.busy = ''; if (eui.bt === 'audio') audRender($('bookBody'), eb);
}
async function audDl(sid) { const eb = ebCur(), s = eb.sections.find(x => x.id === sid), it = audE(eb).items[sid]; if (!it) return; download(slug((s.label ? s.label + '-' : '') + (s.title || 'secao')) + '.mp3', await audBlob(it), 'audio/mpeg'); }
async function audZip() {
  const eb = ebCur(), A = audE(eb), files = []; let n = 0;
  for (const s of eb.sections) { const it = A.items[s.id]; if (!it || !it.ids.length) continue; n++; files.push({name: String(n).padStart(2, '0') + '-' + slug(s.title || 'secao') + '.mp3', data: new Uint8Array(await (await audBlob(it)).arrayBuffer())}); }
  if (!files.length) return; download(slug(eb.title || eb.name) + '-audio.zip', makeZip(files), 'application/zip');
}

/* Primeiro acesso no servidor: criar a senha do Studio pelo app (depois disso as chaves podem ser coladas nos cartões) */
function intSetupPanel() {
  return `<div class="panel" style="margin-bottom:12px;border:2px solid #111"><h3 style="margin-top:0">Primeiro acesso: crie a senha do Studio</h3><p style="font-size:13px;margin:4px 0 10px">Para colar as chaves das APIs aqui, o Studio precisa de uma senha. Sem ela, qualquer pessoa com o link do site poderia trocar as suas chaves. A senha fica só no servidor. <b>Faça isso logo depois de subir o site.</b></p>
  <div class="form-grid"><div class="field"><label>Senha (mínimo 8 caracteres)</label><input id="suPw" type="password" autocomplete="new-password"></div><div class="field"><label>Repita a senha</label><input id="suPw2" type="password" autocomplete="new-password" onkeydown="if(event.key==='Enter')intSetup()"></div><div class="field full"><label>Código de instalação <small class="muted">(só se você definiu SETUP_CODE em api/config.php)</small></label><input id="suCode" autocomplete="off"></div></div>
  <button class="btn dark" onclick="intSetup()">Criar senha e liberar as chaves</button><small class="muted block" style="margin-top:8px">Prefere definir pelo arquivo? Use <span class="mono">ADMIN_PASSWORD_HASH</span> em <span class="mono">api/config.php</span>.</small></div>`;
}
async function intSetup() {
  const a = $('suPw').value, b = $('suPw2').value; if (a.length < 8) { toast('Use uma senha com pelo menos 8 caracteres.'); return; } if (a !== b) { toast('As duas senhas não são iguais.'); return; }
  try { await api('auth.php', {method: 'POST', body: {action: 'setup', password: a, code: ($('suCode').value || '').trim()}}); INT.keys = null; await loadStatus(); toast('Senha criada. Agora cole as chaves nos cartões abaixo.'); renderIntegracoes(); } catch (e) { toast(e.message); }
}
/* Modo local (arquivo aberto no computador, sem PHP): não há onde guardar chaves; o app gera o arquivo api/config.php pronto para subir na hospedagem */
function intLocalPanel() {
  const F = [['ANTHROPIC_API_KEY', 'Chave Claude (Anthropic)'], ['OPENAI_API_KEY', 'Chave OpenAI (GPT e imagens)'], ['ELEVENLABS_API_KEY', 'Chave ElevenLabs'], ['MAGNIFIC_API_KEY', 'Chave Magnific'], ['HIGGSFIELD_API_KEY', 'Chave Higgsfield']];
  return `<h2 style="margin:0 0 10px;font-size:18px">Integrações (APIs)</h2><div class="panel" style="border:2px solid #111"><h3 style="margin-top:0">Você está no modo local: aqui as chaves não podem ficar guardadas</h3><p style="font-size:13px">Este arquivo está aberto direto no computador, sem servidor PHP, então não há onde guardar as chaves com segurança. Mas você <b>não precisa mexer em código</b>: preencha abaixo e eu gero o arquivo <span class="mono">config.php</span> pronto. As chaves não saem do seu computador.</p>
  <ol style="font-size:13px;line-height:1.7;margin:6px 0 10px"><li>Preencha só as chaves que você tem e escolha uma senha para entrar no Studio.</li><li>Clique em <b>Baixar config.php</b>.</li><li>Na Hostinger, suba a pasta do projeto para <span class="mono">public_html</span> e coloque o <span class="mono">config.php</span> dentro da pasta <span class="mono">api</span>.</li><li>Abra o Studio pelo endereço do seu site e entre com a senha. As APIs passam a funcionar (veja o status em cada cartão).</li></ol>
  <div class="form-grid">${F.map(([n, l]) => `<div class="field"><label>${esc(l)}</label><input type="password" id="cg_${n}" autocomplete="off" placeholder="cole aqui (opcional)"></div>`).join('')}
  <div class="field"><label>Provedor da IA de texto</label><select id="cg_AI_PROVIDER"><option value="anthropic">Claude (Anthropic)</option><option value="openai">GPT (OpenAI)</option></select></div><div class="field"><label>Senha do Studio (mínimo 8 caracteres)</label><input type="password" id="cg_PW" autocomplete="new-password"></div></div>
  <button class="btn dark" onclick="intCfgGen()">⬇ Baixar config.php</button><small class="muted block" style="margin-top:8px">Guarde o arquivo em local seguro e não envie para o GitHub nem por e-mail. A senha fica em texto dentro dele; se quiser, depois troque por <span class="mono">ADMIN_PASSWORD_HASH</span> (veja <span class="mono">api/config.sample.php</span>).</small></div>`;
}
function intCfgGen() {
  const q = v => "'" + String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'", L = [], names = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'ELEVENLABS_API_KEY', 'MAGNIFIC_API_KEY', 'HIGGSFIELD_API_KEY'], pw = ($('cg_PW').value || '');
  if (pw.length < 8) { toast('Escolha uma senha do Studio com pelo menos 8 caracteres.'); return; }
  for (const n of names) { const v = ($('cg_' + n).value || '').trim(); if (!v) continue; if (!/^[A-Za-z0-9._\-]{8,300}$/.test(v)) { toast('A chave ' + n + ' tem espaços ou caracteres estranhos. Cole só a chave, sem aspas.'); return; } L.push(`    ${q(n)} => ${q(v)},`); }
  if (!L.length) { toast('Cole pelo menos uma chave.'); return; }
  const txt = `<?php\n/* Gerado pelo Ampliação Studio. Coloque este arquivo em api/config.php na hospedagem. NUNCA envie para o GitHub. */\nreturn [\n    'ADMIN_PASSWORD' => ${q(pw)},\n    'AI_PROVIDER' => ${q($('cg_AI_PROVIDER').value)},\n${L.join('\n')}\n];\n`;
  download('config.php', txt, 'text/x-php'); toast('config.php gerado. Suba em api/config.php na hospedagem.');
}
