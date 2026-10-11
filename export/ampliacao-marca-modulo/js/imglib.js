/* ===== Biblioteca de imagens: sobe uma imagem, a IA lê e devolve o PROMPT dela; você altera (pose, cena, ângulo, estilo,
   referência de estilo) e gera a nova versão. Tudo fica guardado e pode ser usado em posts, capas, miolo e vídeo. ===== */
const lib = {sel: '', q: '', busy: '', work: '', change: '', style: '', angle: '', size: 'square', quality: 'medium', useSrc: true, styleRef: '', styleRefName: '', last: [], thumbs: new Map(), msg: ''};
const LIB_STYLES = [
  ['Colagem de papel recortado', 'ilustração em colagem de papel recortado, camadas sobrepostas, bordas rasgadas, textura de papel, sombras suaves entre as camadas'],
  ['Pontilhismo', 'pintura pontilhista, pequenos pontos de cor justapostos, textura de tela, luz vibrante'],
  ['Aquarela', 'aquarela delicada, manchas de cor transparentes, papel texturizado, bordas suaves'],
  ['Ilustração flat vetorial', 'ilustração vetorial flat, formas simples, cores chapadas, sem gradientes, contornos limpos'],
  ['Linogravura', 'linogravura em duas ou três cores, traços de entalhe, textura de tinta impressa'],
  ['Pintura a óleo', 'pintura a óleo, pinceladas visíveis, textura de tinta espessa, luz de ateliê'],
  ['Lápis / grafite', 'desenho a lápis grafite, hachuras, traço de esboço, fundo de papel'],
  ['3D clay', 'render 3D estilo massinha (clay), formas arredondadas, luz suave de estúdio'],
  ['Quadrinhos / pop art', 'estilo quadrinhos pop art, contornos pretos grossos, retícula de pontos, cores saturadas'],
  ['Foto realista de estúdio', 'fotografia realista de estúdio, iluminação suave, alta nitidez, fundo limpo'],
  ['Risografia', 'impressão risográfica em duas cores, grão, leve desalinhamento de camadas'],
  ['Bordado', 'bordado em linha sobre tecido, pontos visíveis, textura têxtil']
];
const LIB_ANGLES = [['Close-up', 'enquadramento em close-up'], ['Plano aberto', 'plano aberto mostrando o corpo inteiro e o ambiente'], ['Visto de cima', 'visto de cima (câmera alta, vista zenital)'], ['Visto de lado', 'visto de perfil, de lado'], ['De baixo para cima', 'câmera baixa, olhando de baixo para cima'], ['Por cima do ombro', 'por cima do ombro, em segundo plano']];
const LIB_READ = `Você é um engenheiro de prompts de imagem. Olhe a imagem e escreva o prompt que a recriaria com fidelidade num gerador de imagens. Devolva SÓ um JSON:
{"prompt_pt":"prompt detalhado em português: sujeito(s), pose, expressão, roupas, objetos, cenário, composição/enquadramento, ângulo de câmera, iluminação, paleta, estilo/técnica (foto, ilustração, colagem…), clima","prompt_en":"o mesmo prompt em inglês","style":"estilo/técnica em poucas palavras","composition":"enquadramento e ângulo","light":"iluminação","palette":["#RRGGBB"],"elements":["itens principais"],"negative":"o que evitar"}
Descreva só o que se vê; não invente marcas nem texto que não esteja na imagem. Se houver texto legível, cite-o entre aspas.`;

function libList() { return state.imglib.items; }
function libItem(id) { return libList().find(i => i.id === id); }
async function libThumb(imgId) {
  if (lib.thumbs.has(imgId)) return lib.thumbs.get(imgId);
  try { const b = await imgGet(imgId); if (b) { const u = URL.createObjectURL(b); lib.thumbs.set(imgId, u); return u; } } catch (e) { /* sem imagem */ } return '';
}
async function libFill(root) { for (const im of [...(root || document).querySelectorAll('img[data-lib]')]) { const u = await libThumb(im.dataset.lib); if (u && im.isConnected) im.src = u; } }
async function libAddBlob(blob, o) {
  o = o || {}; let w = 0, h = 0; try { const bm = await createImageBitmap(blob); w = bm.width; h = bm.height; } catch (e) { throw new Error('Não consegui ler essa imagem. Use PNG, JPG ou WebP.'); }
  const imgId = uid('img'); await imgPut(imgId, blob);
  const it = {id: uid('lb'), imgId, name: String(o.name || 'Imagem').slice(0, 120), prompt: o.prompt || '', promptEn: o.promptEn || '', style: o.style || '', tags: o.tags || [], parent: o.parent || '', kind: o.kind || 'upload', w, h, meta: o.meta || {}, created: new Date().toISOString()};
  libList().unshift(it); persist(); return it;
}
function libUpload() {
  const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/png,image/jpeg,image/webp'; i.multiple = true;
  i.onchange = async () => { let last; for (const f of [...i.files].slice(0, 30)) { try { last = await libAddBlob(f, {name: f.name.replace(/\.[^.]+$/, '')}); } catch (e) { toast(e.message); } } if (last) { lib.sel = last.id; libResetWork(last); renderBiblioteca(); toast('Imagem adicionada. Clique em “Ler o prompt”.'); } };
  i.click();
}
function libResetWork(it) { lib.work = it ? it.prompt : ''; lib.change = ''; lib.style = ''; lib.angle = ''; lib.styleRef = ''; lib.styleRefName = ''; lib.last = []; lib.msg = ''; }
function libSelect(id) { lib.sel = id; libResetWork(libItem(id)); renderBiblioteca(); }

function renderBiblioteca() {
  const r = $('bibliotecaRoot'); if (!r) return;
  const it = libItem(lib.sel), q = lib.q.toLowerCase(), list = libList().filter(i => !q || (i.name + ' ' + i.prompt + ' ' + i.style + ' ' + i.tags.join(' ')).toLowerCase().includes(q));
  r.innerHTML = `<div class="page-head"><div><h1>Biblioteca de imagens</h1><p>Suba uma imagem, peça o prompt dela, altere pose, cena, ângulo ou estilo e gere a nova versão. O que ficar guardado aqui é usado em posts, capas, miolo e vídeo.</p></div><div class="actions"><input placeholder="Buscar" value="${esc(lib.q)}" oninput="lib.q=this.value;renderBiblioteca()" style="width:160px"><button class="btn" onclick="libNewFromPrompt()">✦ Criar do zero por prompt</button><button class="btn dark" onclick="libUpload()">＋ Subir imagens</button></div></div>
  <div class="lib-wrap ${it ? 'has-sel' : ''}"><div class="lib-grid">${list.map(i => `<button class="lib-it ${i.id === lib.sel ? 'on' : ''}" onclick="libSelect('${i.id}')" title="${esc(i.name)}"><img data-lib="${i.imgId}" alt=""><span>${esc(i.name)}</span>${i.kind === 'gen' ? '<em>IA</em>' : ''}</button>`).join('') || '<p class="muted" style="grid-column:1/-1;padding:30px 0">A biblioteca está vazia. Suba uma imagem para começar.</p>'}</div>${it ? libBench(it) : ''}</div>`;
  libFill(r);
}
function libBench(it) {
  const ready = imageReady(), ai = aiReady(), chip = (arr, key, cur) => arr.map(([n]) => `<button class="chip ${cur === n ? 'on' : ''}" onclick="lib.${key}=lib.${key}==='${n.replace(/'/g, "\\'")}'?'':'${n.replace(/'/g, "\\'")}';libBenchRefresh()">${esc(n)}</button>`).join('');
  return `<div class="lib-bench"><div class="lib-pv"><img data-lib="${it.imgId}" alt=""></div>
  <div class="row-gap" style="flex-wrap:wrap;margin:6px 0"><input value="${esc(it.name)}" onchange="libSet('name',this.value)" style="flex:1;min-width:140px"><button class="btn sm" onclick="libDownload()">⬇ PNG</button><button class="btn sm" onclick="libDelete()">Excluir</button></div>
  <h3>1 · Prompt da imagem</h3><div class="row-gap"><button class="btn sm dark" onclick="libRead()" ${lib.busy || !ai ? 'disabled' : ''} title="${ai ? '' : 'IA de texto não configurada (Configurações → Integrações)'}">${lib.busy === 'read' ? 'Lendo…' : '✦ Ler o prompt desta imagem'}</button>${it.promptEn ? '<button class="btn sm" onclick="libCopy(\'en\')">Copiar em inglês</button><button class="btn sm" onclick="libUseEn()">Usar a versão em inglês</button>' : ''}</div>
  ${it.meta && (it.style || it.meta.composition) ? `<small class="muted block">${[it.style && 'Estilo: ' + esc(it.style), it.meta.composition && 'Enquadramento: ' + esc(it.meta.composition), it.meta.light && 'Luz: ' + esc(it.meta.light)].filter(Boolean).join(' · ')}</small>` : ''}
  ${(it.meta.palette || []).length ? `<div class="row-gap" style="margin:4px 0">${it.meta.palette.map(c => `<span class="lib-sw" style="background:${c}" title="${c}"></span>`).join('')}</div>` : ''}
  <textarea id="libWork" rows="6" oninput="lib.work=this.value" placeholder="O prompt aparece aqui. Você pode editar à vontade.">${esc(lib.work)}</textarea>
  <div class="row-gap"><button class="btn sm" onclick="libSavePrompt()">Guardar como prompt desta imagem</button><button class="btn sm" onclick="libCopy('pt')">Copiar prompt</button></div>
  <h3>2 · O que você quer mudar?</h3><textarea id="libChange" rows="3" oninput="lib.change=this.value;libRwState()" placeholder="Ex.: a mulher fica em pé, olhando para o cachorro e fazendo carinho nele">${esc(lib.change)}</textarea>
  <div class="row-gap"><button class="btn sm" id="libRw" onclick="libRewrite()" ${lib.busy || !ai || !lib.change.trim() ? 'disabled' : ''}>${lib.busy === 'rw' ? 'Reescrevendo…' : '✦ Aplicar a mudança no prompt'}</button></div>
  <h3>3 · Estilo</h3><div class="chips">${chip(LIB_STYLES, 'style', lib.style)}</div>
  <div class="row-gap" style="margin-top:6px;flex-wrap:wrap"><button class="btn sm" onclick="libPickStyleRef()">${lib.styleRef ? '↺ Trocar referência de estilo' : '＋ Referência de estilo (outra imagem)'}</button>${lib.styleRef ? `<small class="muted">${esc(lib.styleRefName)}</small><button class="btn sm" onclick="lib.styleRef='';libBenchRefresh()">Tirar</button>` : ''}</div>
  <h3>4 · Ângulo</h3><div class="chips">${chip(LIB_ANGLES, 'angle', lib.angle)}</div>
  <h3>5 · Gerar</h3><div class="ins-row"><label class="ins">Formato<select onchange="lib.size=this.value"><option value="square" ${lib.size === 'square' ? 'selected' : ''}>Quadrado</option><option value="portrait" ${lib.size === 'portrait' ? 'selected' : ''}>Vertical</option><option value="landscape" ${lib.size === 'landscape' ? 'selected' : ''}>Horizontal</option></select></label><label class="ins">Qualidade<select onchange="lib.quality=this.value"><option value="low" ${lib.quality === 'low' ? 'selected' : ''}>Rascunho (barata)</option><option value="medium" ${lib.quality === 'medium' ? 'selected' : ''}>Média</option><option value="high" ${lib.quality === 'high' ? 'selected' : ''}>Alta (cara)</option></select></label></div>
  <label class="ins inl"><input type="checkbox" ${lib.useSrc ? 'checked' : ''} onchange="lib.useSrc=this.checked"> Usar esta imagem como referência (mantém a pessoa/objeto)</label>
  <div class="row-gap"><button class="btn dark" onclick="libGenerate()" ${lib.busy || !ready ? 'disabled' : ''}>${lib.busy === 'gen' ? 'Gerando…' : '✦ Gerar nova imagem'}</button></div>
  ${ready ? '' : `<small class="muted block">${needsLogin() ? 'Entre no Studio para gerar.' : 'Geração de imagem não configurada: Configurações → Integrações (OPENAI_API_KEY). Você ainda pode ler e copiar o prompt.'}</small>`}
  <small class="muted block">Cada geração consome créditos da sua conta OpenAI. A IA tenta manter a pessoa/objeto, mas rostos e detalhes podem variar: gere algumas versões e escolha. ${esc(lib.msg)}</small>
  ${lib.last.length ? `<h3>Resultado</h3><div class="lib-res">${lib.last.map(id => { const x = libItem(id); return x ? `<button class="lib-it" onclick="libSelect('${id}')"><img data-lib="${x.imgId}" alt=""><span>${esc(x.name)}</span></button>` : ''; }).join('')}</div><small class="muted block">Guardado na biblioteca. Clique para abrir e continuar alterando.</small>` : ''}</div>`;
}
function libRwState() { const b = $('libRw'); if (b) b.disabled = !!lib.busy || !aiReady() || !lib.change.trim(); }
function libBenchRefresh() { const w = $('libWork'), c = $('libChange'); if (w) lib.work = w.value; if (c) lib.change = c.value; renderBiblioteca(); }
function libSet(k, v) { const it = libItem(lib.sel); if (it) { it[k] = String(v).slice(0, 120); persist(); } }
function libSavePrompt() { const it = libItem(lib.sel); if (!it) return; it.prompt = ($('libWork').value || '').slice(0, 4000); persist(); toast('Prompt guardado.'); }
function libCopy(l) { const it = libItem(lib.sel), t = l === 'en' ? it.promptEn : ($('libWork') ? $('libWork').value : it.prompt); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Copiado.'), () => showModal('Prompt', `<textarea rows="8" style="width:100%">${esc(t)}</textarea><div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button></div>`)); }
function libUseEn() { const it = libItem(lib.sel); lib.work = it.promptEn; libBenchRefresh(); }
async function libRead() {
  const it = libItem(lib.sel); if (!it || lib.busy) return; lib.busy = 'read'; libBenchRefresh();
  try {
    const b = await imgGet(it.imgId), r = await aiVisionJSON(LIB_READ, 'Leia a imagem e devolva o JSON.', b, 2500), j = r.json || {}, s = (v, n) => String(v == null ? '' : v).slice(0, n);
    it.prompt = s(j.prompt_pt, 4000); it.promptEn = s(j.prompt_en, 4000); it.style = s(j.style, 80);
    it.meta = {composition: s(j.composition, 200), light: s(j.light, 200), negative: s(j.negative, 300), palette: (Array.isArray(j.palette) ? j.palette : []).filter(c => /^#[0-9a-f]{6}$/i.test(String(c))).slice(0, 8), elements: (Array.isArray(j.elements) ? j.elements : []).slice(0, 12).map(x => s(x, 60))};
    persist(); lib.work = it.prompt; toast('Prompt lido. Edite e gere.');
  } catch (e) { toast(e.message); }
  lib.busy = ''; renderBiblioteca();
}
async function libRewrite() {
  const it = libItem(lib.sel); lib.work = $('libWork').value; lib.change = $('libChange').value; if (!lib.change.trim()) return; lib.busy = 'rw'; libBenchRefresh();
  try {
    const t = await aiText('Você reescreve prompts de geração de imagem. Receba o PROMPT ATUAL e a MUDANÇA pedida e devolva SÓ o prompt novo, no mesmo idioma do atual, mantendo tudo o que não foi mudado (sujeito, cenário, luz, estilo) e aplicando a mudança de forma explícita. Sem comentários, sem aspas.', `PROMPT ATUAL:\n${lib.work || it.prompt}\n\nMUDANÇA:\n${lib.change}`, 900);
    if (t.trim()) { lib.work = t.trim(); toast('Prompt atualizado com a mudança.'); }
  } catch (e) { toast(e.message); }
  lib.busy = ''; renderBiblioteca();
}
function libPickStyleRef() {
  libPick(async id => { const x = libItem(id); lib.styleRef = x.imgId; lib.styleRefName = x.name; renderBiblioteca(); }, {raw: true, title: 'Escolha a imagem de referência de estilo', upload: true});
}
function libFinalPrompt() {
  const st = LIB_STYLES.find(s => s[0] === lib.style), an = LIB_ANGLES.find(s => s[0] === lib.angle), base = (lib.work || '').trim(); let p = base;
  if (lib.change.trim() && base === libItem(lib.sel).prompt.trim()) p += '\n\nMudança: ' + lib.change.trim();
  if (st) p += '\n\nEstilo visual: ' + st[1] + '.';
  if (an) p += '\nÂngulo/enquadramento: ' + an[1] + '.';
  if (lib.styleRef) p += '\nUse a ÚLTIMA imagem de referência apenas como referência de estilo visual (técnica, textura, paleta, traço), sem copiar o seu conteúdo.';
  if (lib.useSrc) p += '\nUse a PRIMEIRA imagem de referência como fonte da verdade do sujeito: mantenha a mesma pessoa/objeto (rosto, cabelo, roupas, cores), alterando apenas o que foi pedido.';
  return p.trim();
}
async function libRefDataURL(imgId) { const b = await imgGet(imgId); return (await ailBlob(b, 1536)).url; }
async function libGenerate() {
  const it = libItem(lib.sel); if (!it || lib.busy) return; lib.work = $('libWork').value; lib.change = $('libChange').value;
  const prompt = libFinalPrompt(); if (prompt.length < 5) { toast('Escreva ou leia o prompt primeiro.'); return; } if (prompt.length > 3900) { toast('Prompt muito longo (máx. ~3.900 caracteres). Encurte.'); return; }
  lib.busy = 'gen'; libBenchRefresh();
  try {
    const refs = []; if (lib.useSrc) refs.push(await libRefDataURL(it.imgId)); if (lib.styleRef) refs.push(await libRefDataURL(lib.styleRef));
    const blob = await generateImage({prompt, size: lib.size, quality: lib.quality, refs}), tag = [lib.style, lib.angle].filter(Boolean);
    const n = await libAddBlob(blob, {name: it.name.replace(/ · v\d+$/, '') + ' · v' + (libList().filter(x => x.parent === it.id).length + 1), kind: 'gen', parent: it.id, prompt: lib.work, promptEn: '', style: lib.style || it.style, tags: tag, meta: {composition: lib.angle, light: '', palette: [], elements: []}});
    lib.last.unshift(n.id); toast('Imagem gerada e guardada na biblioteca.');
  } catch (e) { toast(e.message); }
  lib.busy = ''; renderBiblioteca();
}
function libNewFromPrompt() {
  if (!imageReady()) { toast(needsLogin() ? 'Entre no Studio para gerar.' : 'Geração de imagem não configurada (Configurações → Integrações).'); return; }
  showModal('✦ Criar imagem por prompt', `<div class="field"><label>Descreva a imagem</label><textarea id="lbNew" rows="5" placeholder="Ex.: mulher de 60 anos sorrindo, sentada numa poltrona de linho, luz de janela, estilo fotográfico natural"></textarea></div><div class="ins-row"><label class="ins">Formato<select id="lbNewS"><option value="square">Quadrado</option><option value="portrait">Vertical</option><option value="landscape">Horizontal</option></select></label><label class="ins">Qualidade<select id="lbNewQ"><option value="low">Rascunho</option><option value="medium" selected>Média</option><option value="high">Alta</option></select></label></div><div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" id="lbNewGo" onclick="libNewRun()">Gerar</button></div>`);
}
async function libNewRun() {
  const p = $('lbNew').value.trim(); if (p.length < 5) { toast('Descreva a imagem.'); return; } const b = $('lbNewGo'); b.disabled = true; b.textContent = 'Gerando…';
  try { const blob = await generateImage({prompt: p, size: $('lbNewS').value, quality: $('lbNewQ').value, refs: []}), it = await libAddBlob(blob, {name: p.slice(0, 40), kind: 'gen', prompt: p}); closeModal(); lib.sel = it.id; libResetWork(it); renderBiblioteca(); }
  catch (e) { b.disabled = false; b.textContent = 'Gerar'; toast(e.message); }
}
async function libDownload() { const it = libItem(lib.sel); if (!it) return; download(slug(it.name || 'imagem') + '.png', await imgGet(it.imgId), 'image/png'); }
function libDelete() { const it = libItem(lib.sel); if (!it || !confirm('Excluir esta imagem da biblioteca?')) return; state.imglib.items = libList().filter(x => x.id !== it.id); imgDel(it.imgId).catch(() => { }); lib.sel = ''; persist(); renderBiblioteca(); }

/* seletor usado pelos editores: devolve {id, ar} de uma cópia da imagem (ou, com raw, o id do item da biblioteca) */
function libPick(cb, o) {
  o = o || {}; lib.pickCb = cb; lib.pickRaw = !!o.raw; const list = libList();
  showModal(o.title || '📚 Biblioteca de imagens', `<div class="row-gap" style="margin-bottom:8px"><input id="lpQ" placeholder="Buscar" oninput="libPickFilter()" style="flex:1"><button class="btn sm" onclick="libPickUpload()">＋ Subir</button><button class="btn sm" onclick="closeModal();go('biblioteca')">Abrir a biblioteca</button></div><div class="stock-grid" id="lpGrid">${libPickCells(list)}</div>`);
  document.getElementById('modalBox').classList.add('wide'); libFill($('lpGrid'));
}
const libPickCells = list => list.map(i => `<button class="stock-it" onclick="libPickUse('${i.id}')" title="${esc(i.name)}"><img data-lib="${i.imgId}" alt=""><span>${esc(i.name.slice(0, 26))}</span></button>`).join('') || '<p class="muted" style="grid-column:1/-1">A biblioteca está vazia. Suba uma imagem.</p>';
function libPickFilter() { const q = $('lpQ').value.toLowerCase(); $('lpGrid').innerHTML = libPickCells(libList().filter(i => !q || (i.name + ' ' + i.prompt + ' ' + i.tags.join(' ')).toLowerCase().includes(q))); libFill($('lpGrid')); }
async function libPickUpload() {
  const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/png,image/jpeg,image/webp';
  i.onchange = async () => { if (!i.files[0]) return; try { const it = await libAddBlob(i.files[0], {name: i.files[0].name.replace(/\.[^.]+$/, '')}); await libPickUse(it.id); } catch (e) { toast(e.message); } }; i.click();
}
async function libPickUse(id) {
  const it = libItem(id), cb = lib.pickCb; if (!it || !cb) return;
  try { if (lib.pickRaw) { closeModal(); cb(id); return; } const b = await imgGet(it.imgId), r = await stockBlobToImg(b); closeModal(); cb(r); } catch (e) { toast(e.message); }
}
function dzLibPhoto() { libPick(r => { const L = dzLayer(); L.imgId = r.id; dzDraw(); dzCommit(); dzInspector(); dzSlidesPanel(); }); }
function dtpLibImg() { const it = dtpSelItem(); if (!it) return; libPick(r => { const q = dtpSelItem(); if (!q) return; q.imgId = r.id; q.ar = r.ar; dtpTouch(true); dtpPanel(); }); }
function covLibImg() { libPick(r => { covC().imgId = r.id; persist(); renderEditora(); }); }
