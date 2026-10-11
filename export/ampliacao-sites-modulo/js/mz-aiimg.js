/* Mesa de páginas — imagem com IA: descrever (digitando, falando ou colando), usar imagens de referência, escolher a IA e o nível */
const MZGEN = {id: '', refs: [], results: [], busy: false, mode: 'new', size: 'auto', useCur: false, rec: null};
function mzGenInto(opts) {
  const n = mzSelNode(); if (!n) { toast('Selecione uma imagem.'); return; } opts = opts || {}; Object.assign(MZGEN, {id: n.id, refs: [], results: [], busy: false, mode: opts.vary ? 'ref' : 'new', size: 'auto', useCur: !!(opts.vary && n.props.imgId)});
  const c = mzCtx(MZ.p), base = n.props.alt || [c.name ? 'imagem para o site de ' + c.name : '', 'sem texto, sem logotipo, sem marca d’água'].filter(Boolean).join('. ');
  showModal('✨ Imagem com IA', `<div class="field"><label>Descreva a imagem (digite, fale ou cole um prompt)</label><textarea id="mzGenP" rows="4" placeholder="Ex.: mulher sorrindo usando o notebook em uma cozinha clara, luz natural">${esc(base)}</textarea>
    <div class="row-gap" style="flex-wrap:wrap;margin-top:6px"><button class="btn sm" id="mzGenMic" onclick="mzGenDictate()">🎤 Falar</button><button class="btn sm" onclick="mzGenImprove()" title="A IA reescreve como um bom prompt de imagem">✨ Melhorar prompt</button><button class="btn sm" onclick="mzGenCopy()">📋 Copiar prompt</button><button class="btn sm" onclick="mzGenPaste()">📥 Colar</button></div></div>
    <div class="field"><label>Imagens de referência <small class="muted">(até 4 — a IA usa como base: produto, pessoa, estilo)</small></label><div id="mzGenRefs"></div>
      <div class="row-gap" style="flex-wrap:wrap;margin-top:6px">${n.props.imgId ? '<label class="mz-ck" style="margin:0"><input type="checkbox" id="mzGenCur" ' + (MZGEN.useCur ? 'checked' : '') + ' onchange="MZGEN.useCur=this.checked"> Usar a imagem atual como referência</label>' : ''}<button class="btn sm" onclick="mzGenRefLib()">📚 Biblioteca</button><button class="btn sm" onclick="mzGenRefUp()">⬆ Enviar</button></div></div>
    <div class="two"><label class="mz-f"><span>Proporção</span><select onchange="MZGEN.size=this.value">${[['auto', 'Igual ao elemento'], ['square', 'Quadrada'], ['portrait', 'Vertical'], ['landscape', 'Horizontal']].map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></label></div>
    <div class="ai-pickbox" data-kind="image" data-compact="1"></div>
    <small class="muted block" id="mzGenNote"></small>
    <div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button><button class="btn dark" id="mzGenGo" onclick="mzGenRun()">✨ Gerar imagem</button></div>
    <div id="mzGenRes" class="mz-genres"></div>`);
  aiPickersRefresh(); mzGenRefsDraw(); const nt = document.getElementById('mzGenNote'); if (nt) nt.textContent = (typeof imageReady === 'function' && imageReady()) ? 'Cada geração consome créditos da conta do provedor escolhido.' : 'A geração por IA ainda não está ligada neste servidor (chave de imagem). Você pode copiar o prompt, gerar em outro app e usar ⬆ Enviar na imagem.';
}
function mzGenRefsDraw() { const d = document.getElementById('mzGenRefs'); if (!d) return; d.innerHTML = MZGEN.refs.length ? MZGEN.refs.map((id, i) => `<span class="mz-ref"><img data-lib="${id}" alt=""><button onclick="MZGEN.refs.splice(${i},1);mzGenRefsDraw()" title="Tirar">×</button></span>`).join('') : '<small class="muted">Nenhuma referência: a IA cria do zero.</small>'; libFill(d); }
function mzGenRefLib() { libPick(r => { const li = libItem(r), id = li ? li.imgId : r; if (id && MZGEN.refs.length < 4 && !MZGEN.refs.includes(id)) MZGEN.refs.push(id); mzGenRefsDraw(); }, {raw: true, title: 'Imagem de referência'}); }
function mzGenRefUp() { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/png,image/jpeg,image/webp'; i.onchange = async () => { const f = i.files[0]; if (!f || MZGEN.refs.length >= 4) return; try { const it = await libAddBlob(f, {name: f.name.replace(/\.[^.]+$/, '')}); MZGEN.refs.push(it.imgId); mzGenRefsDraw(); } catch (e) { toast(e.message); } }; i.click(); }
const mzGenText = () => (document.getElementById('mzGenP') || {value: ''}).value.trim();
function mzGenCopy() { const t = mzGenText(); if (!t) { toast('Escreva o prompt primeiro.'); return; } (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Prompt copiado.'), () => { const a = document.getElementById('mzGenP'); a.select(); document.execCommand('copy'); toast('Prompt copiado.'); }); }
function mzGenPaste() { if (!navigator.clipboard || !navigator.clipboard.readText) { toast('Seu navegador não deixa colar por aqui: use Ctrl+V no campo.'); return; } navigator.clipboard.readText().then(t => { const a = document.getElementById('mzGenP'); a.value = (a.value ? a.value + ' ' : '') + t; }, () => toast('Sem permissão para ler a área de transferência: use Ctrl+V.')); }
function mzGenDictate() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition, b = document.getElementById('mzGenMic'); if (!SR) { toast('Ditado por voz funciona no Chrome. Digite ou cole o prompt.'); return; }
  if (MZGEN.rec) { try { MZGEN.rec.stop(); } catch (e) { /* ok */ } return; }
  const r = new SR(); r.lang = 'pt-BR'; r.interimResults = false; r.continuous = true; MZGEN.rec = r; b.textContent = '⏹ Parar'; const a = document.getElementById('mzGenP');
  r.onresult = e => { for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) a.value = (a.value ? a.value.trim() + ' ' : '') + e.results[i][0].transcript.trim(); };
  r.onend = () => { MZGEN.rec = null; const m = document.getElementById('mzGenMic'); if (m) m.textContent = '🎤 Falar'; }; r.onerror = () => { MZGEN.rec = null; const m = document.getElementById('mzGenMic'); if (m) m.textContent = '🎤 Falar'; toast('Não consegui ouvir. Verifique a permissão do microfone.'); }; r.start();
}
async function mzGenImprove() {
  const t = mzGenText(); if (!t) { toast('Escreva uma ideia primeiro.'); return; } if (typeof aiReady !== 'function' || !aiReady()) { toast('A IA de texto ainda não está ligada neste servidor.'); return; }
  const c = mzCtx(MZ.p), a = document.getElementById('mzGenP'); a.disabled = true;
  try { const r = await aiText('Você escreve prompts para geração de imagem de publicidade. Reescreva a ideia como UM prompt claro e específico (sujeito, cenário, luz, enquadramento, estilo fotográfico, cores). Sem texto escrito na imagem, sem logotipos. Não invente fatos sobre o negócio. Responda só com o prompt, em português.', `Negócio: ${c.name || ''}. ${c.offer ? 'Oferta: ' + c.offer + '.' : ''}\nIdeia: ${t}`, 400); if (r.trim()) a.value = r.trim().replace(/^["“]|["”]$/g, ''); } catch (e) { toast(e.message); } finally { a.disabled = false; }
}
async function mzGenRun() {
  const f = mzFind(mzRoot(), MZGEN.id), btn = document.getElementById('mzGenGo'), prompt = mzGenText(); if (!f) return; if (!prompt) { toast('Descreva a imagem.'); return; } if (MZGEN.busy) return;
  if (typeof imageReady !== 'function' || !imageReady()) { toast(needsLogin() ? 'Entre no Studio para gerar imagens.' : 'Geração de imagem indisponível: configure a chave de imagem em api/config.php no servidor.'); return; }
  MZGEN.busy = true; btn.disabled = true; btn.textContent = 'Gerando…';
  try {
    const ids = MZGEN.refs.slice(); if (MZGEN.useCur && f.node.props.imgId && !ids.includes(f.node.props.imgId)) ids.unshift(f.node.props.imgId); const refs = [];
    for (const id of ids.slice(0, 4)) { const b = await imgGet(id); if (b) refs.push(await blobToDataURL(b)); }
    const fr = MZ.frames[MZ.bp], el = fr && mzElOf(fr, f.node.id), r = el && mzRectOf(el); let size = MZGEN.size; if (size === 'auto') { const ra = r && r.height ? r.width / r.height : 1; size = ra > 1.2 ? 'landscape' : ra < .83 ? 'portrait' : 'square'; }
    const full = refs.length ? prompt + '. Use as imagens de referência como fonte da verdade do produto/pessoa/estilo: não altere formas, cores, rótulos nem proporções do que aparece nelas.' : prompt;
    const P = aiPrefs(), pk = document.querySelector('.ai-pickbox[data-kind=image] select'), blob = await generateImage({prompt: full, size, refs});
    const it = await libAddBlob(blob, {name: 'IA · ' + prompt.slice(0, 40), prompt, kind: 'ai'}); MZGEN.results.unshift({id: it.imgId, via: (generateImage.last || {}).model || ''}); mzGenResDraw();
  } catch (e) { toast(e.message); } finally { MZGEN.busy = false; btn.disabled = false; btn.textContent = '✨ Gerar outra'; }
}
function mzGenResDraw() { const d = document.getElementById('mzGenRes'); if (!d) return; d.innerHTML = MZGEN.results.map(r => `<div class="mz-genr"><img data-lib="${r.id}" alt=""><div class="row-gap"><button class="btn sm dark" onclick="mzGenUse('${r.id}')">Usar aqui</button><button class="btn sm" onclick="mzGenAsRef('${r.id}')" title="Usar como referência para gerar outra">↻ Variar</button></div><small class="muted">${esc(r.via)}</small></div>`).join(''); libFill(d); }
function mzGenUse(id) { const f = mzFind(mzRoot(), MZGEN.id); if (!f) return; f.node.props.imgId = id; closeModal(); mzCommit({panels: true}); toast('Imagem aplicada. Ela também ficou na sua Biblioteca.'); }
function mzGenAsRef(id) { if (MZGEN.refs.length < 4 && !MZGEN.refs.includes(id)) MZGEN.refs.push(id); mzGenRefsDraw(); toast('Adicionada como referência: ajuste o prompt e gere de novo.'); }
