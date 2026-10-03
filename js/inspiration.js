/* ===== Inspiração: o nosso Pinterest. Referências por categoria (imagens, links e paletas), quadros, busca, filtro por cor ===== */
const INSPO_CATS = [
  {id: 'posts', label: 'Posts', hint: 'Feed, carrosséis, stories e capas'}, {id: 'diagramacao', label: 'Diagramação', hint: 'Grids, hierarquia, composição de página'}, {id: 'logos', label: 'Logos', hint: 'Marcas, símbolos e lockups'},
  {id: 'cartaz', label: 'Cartaz e pôster', hint: 'Cartazes, flyers, eventos e capas'}, {id: 'foto', label: 'Fotografia', hint: 'Luz, enquadramento, direção de arte'}, {id: 'estilos', label: 'Estilos de design', hint: 'Movimentos, tendências e linguagens visuais'}, {id: 'cores', label: 'Cores', hint: 'Paletas e combinações'}
];
const INSPO_HUES = [['red', 'Vermelho', '#e5484d'], ['orange', 'Laranja', '#f08a24'], ['yellow', 'Amarelo', '#f5c518'], ['green', 'Verde', '#30a46c'], ['teal', 'Turquesa', '#12a594'], ['blue', 'Azul', '#3e63dd'], ['purple', 'Roxo', '#8e4ec6'], ['pink', 'Rosa', '#e93d82'], ['neutral', 'Neutras', '#8b8d98']];
const insp = {cat: 'all', board: '', q: '', hue: '', sort: 'new', sel: new Set(), selMode: false, openId: '', shown: 60};
const inspo = () => { state.inspo = state.inspo && typeof state.inspo === 'object' ? state.inspo : {items: [], boards: [], cats: []}; state.inspo.items = state.inspo.items || []; state.inspo.boards = state.inspo.boards || []; state.inspo.cats = state.inspo.cats || []; return state.inspo; };
const inspoCats = () => INSPO_CATS.concat(inspo().cats);
const inspoCatLabel = id => (inspoCats().find(c => c.id === id) || {label: id}).label;
const inspoSafeUrl = u => { try { const x = new URL(String(u || '').trim()); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch (e) { return ''; } };
function inspoHue(hex) { if (!isHex(hex)) return 'neutral'; const [h, s, l] = hexHsl(hex); if (s < 0.14 || l < 0.1 || l > 0.93) return 'neutral'; return h < 15 || h >= 345 ? 'red' : h < 42 ? 'orange' : h < 68 ? 'yellow' : h < 160 ? 'green' : h < 195 ? 'teal' : h < 255 ? 'blue' : h < 295 ? 'purple' : 'pink'; }

/* ---------- imagens (IndexedDB) ---------- */
const INSPO_URL = new Map();
async function inspoURL(id) { if (!id) return ''; if (INSPO_URL.has(id)) return INSPO_URL.get(id); const b = await imgGet(id).catch(() => null); if (!b) return ''; const u = URL.createObjectURL(b); INSPO_URL.set(id, u); return u; }
function inspoAvg(bmp) { const c = document.createElement('canvas'); c.width = c.height = 24; const x = c.getContext('2d', {willReadFrequently: true}); x.drawImage(bmp, 0, 0, 24, 24); const d = x.getImageData(0, 0, 24, 24).data; let r = 0, g = 0, b = 0, n = 0; for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 100) continue; r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; } n = n || 1; return '#' + [r, g, b].map(v => Math.round(v / n).toString(16).padStart(2, '0')).join(''); }
async function inspoMake(file, opt) {
  if (!/^image\//.test(file.type) && !/\.(png|jpe?g|webp|gif|svg|avif)$/i.test(file.name)) throw new Error('não é imagem');
  if (file.size > 12_000_000) throw new Error('maior que 12 MB');
  const bmp = await bitmapFromFile(file), id = uid('in'), k = 520 / Math.max(bmp.width, bmp.height, 1), tw = Math.max(1, Math.round(bmp.width * Math.min(1, k))), th = Math.max(1, Math.round(bmp.height * Math.min(1, k)));
  const c = document.createElement('canvas'); c.width = tw; c.height = th; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, tw, th); x.drawImage(bmp, 0, 0, tw, th);
  const thumb = await new Promise(res => c.toBlob(res, 'image/jpeg', 0.84)); await imgPut(id, file); await imgPut('th-' + id, thumb);
  let colors = []; try { colors = extractColors(bmp).slice(0, 6); } catch (e) { /* sem cores */ } if (colors.length < 2) colors.push(inspoAvg(bmp));
  return {id, kind: 'img', cat: opt.cat, title: opt.title || file.name.replace(/\.[^.]+$/, '').slice(0, 80), note: '', tags: opt.tags.slice(), imgId: id, w: bmp.width, h: bmp.height, colors, hues: [...new Set(colors.slice(0, 3).map(inspoHue))], fav: false, boards: opt.board ? [opt.board] : [], created: new Date().toISOString()};
}
async function inspoAddFiles(files, opt) {
  const list = [...files], ok = [], bad = []; toast('Adicionando ' + list.length + ' referência(s)…');
  for (const f of list) { try { const it = await inspoMake(f, opt); inspo().items.unshift(it); ok.push(it); } catch (e) { bad.push(f.name + ' (' + e.message + ')'); } }
  persist(); renderInspiration(); toast(ok.length + ' adicionada(s)' + (bad.length ? '. Não consegui: ' + bad.join('; ') : '.')); return ok;
}

/* ---------- renderização ---------- */
function inspoFiltered() {
  const I = inspo(), q = lgNorm(insp.q).trim();
  let l = I.items.filter(it => (insp.cat === 'all' || (insp.cat === 'fav' ? it.fav : it.cat === insp.cat)) && (!insp.board || (it.boards || []).includes(insp.board)) && (!insp.hue || (it.hues || []).includes(insp.hue)) &&
    (!q || lgNorm([it.title, it.note, (it.tags || []).join(' '), inspoCatLabel(it.cat), it.url || ''].join(' ')).includes(q)));
  if (insp.sort === 'fav') l = l.slice().sort((a, b) => (b.fav ? 1 : 0) - (a.fav ? 1 : 0)); else if (insp.sort === 'old') l = l.slice().reverse(); else if (insp.sort === 'az') l = l.slice().sort((a, b) => a.title.localeCompare(b.title));
  return l;
}
function renderInspiration() {
  const r = $('inspoRoot'); if (!r) return; const I = inspo(), n = c => I.items.filter(i => i.cat === c).length, list = inspoFiltered(), shown = list.slice(0, insp.shown);
  const side = `<div class="in-side"><button class="in-cat ${insp.cat === 'all' ? 'on' : ''}" onclick="insp.cat='all';insp.shown=60;renderInspiration()"><span>Todas</span><b>${I.items.length}</b></button><button class="in-cat ${insp.cat === 'fav' ? 'on' : ''}" onclick="insp.cat='fav';insp.shown=60;renderInspiration()"><span>★ Favoritas</span><b>${I.items.filter(i => i.fav).length}</b></button>
    <div class="okr-label" style="margin:12px 0 4px">CATEGORIAS</div>${inspoCats().map(c => `<button class="in-cat ${insp.cat === c.id ? 'on' : ''}" title="${esc(c.hint || '')}" onclick="insp.cat='${esc(c.id)}';insp.shown=60;renderInspiration()"><span>${esc(c.label)}</span><b>${n(c.id)}</b></button>`).join('')}<button class="in-add" onclick="inspoCatAdd()">＋ Nova categoria</button>
    <div class="okr-label" style="margin:12px 0 4px">QUADROS</div>${I.boards.map(b => `<div class="in-board ${insp.board === b.id ? 'on' : ''}"><button onclick="insp.board=insp.board==='${esc(b.id)}'?'':'${esc(b.id)}';insp.shown=60;renderInspiration()"><span>${esc(b.name)}</span><b>${I.items.filter(i => (i.boards || []).includes(b.id)).length}</b></button><i title="Renomear ou excluir" onclick="inspoBoardEdit('${esc(b.id)}')">⋯</i></div>`).join('') || '<small class="muted">Quadros agrupam referências de qualquer categoria (ex.: um cliente).</small>'}<button class="in-add" onclick="inspoBoardAdd()">＋ Novo quadro</button>
    <div class="okr-label" style="margin:12px 0 4px">COR</div><div class="in-hues">${INSPO_HUES.map(([id, l, c]) => `<button class="in-hue ${insp.hue === id ? 'on' : ''}" title="${l}" style="background:${c}" onclick="insp.hue=insp.hue==='${id}'?'':'${id}';insp.shown=60;renderInspiration()"></button>`).join('')}</div></div>`;
  const bar = `<div class="in-bar"><input class="lg-search" id="inQ" placeholder="Buscar por título, nota ou tag…" value="${esc(insp.q)}" oninput="insp.q=this.value;inspoSearchSoon()"><select onchange="insp.sort=this.value;renderInspiration()" title="Ordenar"><option value="new" ${insp.sort === 'new' ? 'selected' : ''}>Mais recentes</option><option value="old" ${insp.sort === 'old' ? 'selected' : ''}>Mais antigas</option><option value="fav" ${insp.sort === 'fav' ? 'selected' : ''}>Favoritas primeiro</option><option value="az" ${insp.sort === 'az' ? 'selected' : ''}>A–Z</option></select><button class="btn sm ${insp.selMode ? 'dark' : ''}" onclick="inspoSelMode()">${insp.selMode ? 'Sair da seleção' : 'Selecionar'}</button></div>
    ${insp.selMode ? inspoBulkBar(list) : ''}${(insp.q || insp.hue || insp.board) ? `<div class="in-filters">${insp.q ? `<span>“${esc(insp.q)}”</span>` : ''}${insp.hue ? `<span>Cor: ${esc(INSPO_HUES.find(h => h[0] === insp.hue)[1])}</span>` : ''}${insp.board ? `<span>Quadro: ${esc((I.boards.find(b => b.id === insp.board) || {}).name || '')}</span>` : ''}<button class="btn sm" onclick="insp.q='';insp.hue='';insp.board='';renderInspiration()">Limpar filtros</button></div>` : ''}`;
  const empty = !I.items.length ? `<div class="in-empty"><h2>Comece a sua coleção</h2><p class="muted">Arraste imagens para cá, cole com Ctrl+V ou clique em Adicionar. Organize por categoria:</p><div class="in-hints">${INSPO_CATS.map(c => `<div><b>${esc(c.label)}</b><small>${esc(c.hint)}</small></div>`).join('')}</div><button class="btn dark" onclick="inspoAddOpen()">＋ Adicionar referências</button></div>` : '';
  r.innerHTML = `<div class="page-head"><div><h1>Inspiração</h1><p>Seu acervo de referências: posts, diagramação, logos, cartazes, fotografia, estilos e cores. Tudo fica salvo neste navegador.</p></div><div class="actions"><button class="btn" onclick="inspoPalette()">＋ Nova paleta</button><button class="btn" onclick="inspoExport()">Exportar (ZIP)</button><button class="btn dark" onclick="inspoAddOpen()">＋ Adicionar referências</button></div></div>
  <div class="in-wrap" id="inWrap">${side}<div class="in-main">${bar}${empty}${I.items.length && !list.length ? '<div class="in-none">Nenhuma referência com esses filtros.</div>' : ''}<div class="in-grid" id="inGrid">${shown.map(inspoCard).join('')}</div>${list.length > shown.length ? `<div class="row-gap" style="margin:14px 0"><button class="btn" onclick="insp.shown+=60;renderInspiration()">Mostrar mais (${list.length - shown.length})</button></div>` : ''}</div></div><div class="in-drop" id="inDrop">Solte as imagens para adicionar</div>`;
  inspoFillThumbs();
}
let inSearchT = 0; const inspoSearchSoon = () => { clearTimeout(inSearchT); inSearchT = setTimeout(() => { const el = $('inQ'), pos = el ? el.selectionStart : 0; renderInspiration(); const n = $('inQ'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }, 220); };
function inspoCard(it) {
  const sel = insp.sel.has(it.id), sw = (it.colors || []).slice(0, 5).map(c => `<i style="background:${esc(c)}"></i>`).join(''), ratio = it.kind === 'palette' ? 1.1 : Math.max(0.5, Math.min(2, (it.w || 4) / (it.h || 3)));
  const media = it.kind === 'palette' ? `<div class="in-pal">${(it.colors || []).map(c => `<span style="background:${esc(c)}"><small>${esc(c)}</small></span>`).join('')}</div>` : it.kind === 'link' && !it.imgId ? `<div class="in-link"><b>${esc(inspoHost(it.url))}</b><small>${esc(it.title)}</small></div>` : `<img data-th="${esc(it.imgId)}" alt="${esc(it.title)}" loading="lazy" style="aspect-ratio:${ratio}">`;
  return `<article class="in-card ${sel ? 'sel' : ''}" data-id="${esc(it.id)}" onclick="inspoCardClick('${esc(it.id)}',event)">${media}${insp.selMode ? `<span class="in-chk">${sel ? '✓' : ''}</span>` : ''}<span class="in-fav ${it.fav ? 'on' : ''}" title="Favoritar" onclick="event.stopPropagation();inspoFav('${esc(it.id)}')">${it.fav ? '★' : '☆'}</span>
    <div class="in-cap"><strong>${esc(it.title)}</strong><small>${esc(inspoCatLabel(it.cat))}${(it.tags || []).length ? ' · ' + esc(it.tags.slice(0, 2).join(', ')) : ''}</small>${it.kind !== 'palette' && sw ? `<div class="in-sw">${sw}</div>` : ''}</div></article>`;
}
const inspoHost = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return 'link'; } };
async function inspoFillThumbs() { const imgs = [...document.querySelectorAll('#inGrid img[data-th]')]; for (const im of imgs) { if (!im.isConnected) return; const id = im.dataset.th; let u = await inspoURL('th-' + id); if (!u) u = await inspoURL(id); if (u && im.isConnected) im.src = u; else if (!u && im.isConnected) im.alt = 'imagem indisponível neste navegador'; } }

/* ---------- ações ---------- */
function inspoFav(id) { const it = inspo().items.find(i => i.id === id); if (it) { it.fav = !it.fav; persist(); renderInspiration(); } }
function inspoSelMode() { insp.selMode = !insp.selMode; insp.sel.clear(); renderInspiration(); }
function inspoCardClick(id, e) { if (insp.selMode) { insp.sel.has(id) ? insp.sel.delete(id) : insp.sel.add(id); renderInspiration(); return; } inspoOpen(id); }
function inspoBulkBar(list) {
  const n = insp.sel.size, I = inspo();
  return `<div class="in-bulk"><b>${n} selecionada(s)</b><button class="btn sm" onclick="insp.sel=new Set(inspoFiltered().map(i=>i.id));renderInspiration()">Selecionar todas (${list.length})</button><button class="btn sm" onclick="insp.sel.clear();renderInspiration()">⊘ Desmarcar tudo</button>
  <select onchange="inspoBulkMove(this.value);this.value=''"><option value="">Mover para categoria…</option>${inspoCats().map(c => `<option value="${esc(c.id)}">${esc(c.label)}</option>`).join('')}</select>
  <select onchange="inspoBulkBoard(this.value);this.value=''"><option value="">Adicionar ao quadro…</option>${I.boards.map(b => `<option value="${esc(b.id)}">${esc(b.name)}</option>`).join('')}</select><button class="btn sm" onclick="inspoBulkFav()">★ Favoritar</button><button class="btn sm" onclick="inspoBulkDel()">Excluir</button></div>`;
}
const inspoSelItems = () => inspo().items.filter(i => insp.sel.has(i.id));
function inspoBulkMove(c) { if (!c) return; inspoSelItems().forEach(i => { i.cat = c; }); persist(); toast('Movidas para ' + inspoCatLabel(c) + '.'); renderInspiration(); }
function inspoBulkBoard(b) { if (!b) return; inspoSelItems().forEach(i => { i.boards = i.boards || []; if (!i.boards.includes(b)) i.boards.push(b); }); persist(); toast('Adicionadas ao quadro.'); renderInspiration(); }
function inspoBulkFav() { inspoSelItems().forEach(i => { i.fav = true; }); persist(); renderInspiration(); }
function inspoBulkDel() { const l = inspoSelItems(); if (!l.length || !confirm(`Excluir ${l.length} referência(s)? Isso apaga as imagens deste navegador.`)) return; l.forEach(inspoRemove); insp.sel.clear(); persist(); renderInspiration(); }
async function inspoRemove(it) { const I = inspo(); I.items = I.items.filter(i => i.id !== it.id); if (it.imgId) { await imgDel(it.imgId).catch(() => 0); await imgDel('th-' + it.imgId).catch(() => 0); INSPO_URL.delete(it.imgId); INSPO_URL.delete('th-' + it.imgId); } }
function inspoCatAdd() { askText('Nova categoria', 'Nome da categoria (ex.: Embalagens)', name => { const id = 'c-' + uid('x').slice(2, 10); inspo().cats.push({id, label: name.slice(0, 40), hint: 'Categoria sua'}); persist(); insp.cat = id; renderInspiration(); }); }
function inspoBoardAdd() { askText('Novo quadro', 'Nome do quadro (ex.: Cliente Aurora)', name => { const id = uid('bd'); inspo().boards.push({id, name: name.slice(0, 40)}); persist(); insp.board = id; renderInspiration(); }); }
function inspoBoardEdit(id) { const b = inspo().boards.find(x => x.id === id); if (!b) return; const nn = prompt('Novo nome do quadro (deixe vazio para excluir):', b.name); if (nn === null) return; if (!nn.trim()) { if (!confirm('Excluir o quadro “' + b.name + '”? As referências continuam salvas.')) return; inspo().boards = inspo().boards.filter(x => x.id !== id); inspo().items.forEach(i => { i.boards = (i.boards || []).filter(x => x !== id); }); if (insp.board === id) insp.board = ''; } else b.name = nn.trim().slice(0, 40); persist(); renderInspiration(); }

/* adicionar */
let INSPO_PENDING = [];
function inspoAddOpen(files) {
  INSPO_PENDING = files ? [...files] : []; const I = inspo(), cat = ['all', 'fav'].includes(insp.cat) ? 'posts' : insp.cat;
  showModal('Adicionar referências', `<div class="in-dz" id="inDz" onclick="inspoPick()"><b>Arraste imagens aqui, cole (Ctrl+V) ou clique para escolher</b><small id="inPend">${INSPO_PENDING.length ? INSPO_PENDING.length + ' imagem(ns) pronta(s)' : 'PNG, JPG, WebP, GIF ou SVG · até 12 MB cada'}</small></div>
  <div class="form-grid"><div class="field"><label>Categoria</label><select id="inCat">${inspoCats().map(c => `<option value="${esc(c.id)}" ${c.id === cat ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select></div><div class="field"><label>Quadro (opcional)</label><select id="inBoard"><option value="">—</option>${I.boards.map(b => `<option value="${esc(b.id)}" ${b.id === insp.board ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select></div></div>
  <div class="field"><label>Tags (separe por vírgula)</label><input id="inTags" placeholder="minimalista, serifa, verde"></div><div class="field"><label>Título <small class="muted">(vazio = nome do arquivo)</small></label><input id="inTitle"></div>
  <div class="field"><label>…ou salve um link</label><input id="inUrl" placeholder="https://… (página ou imagem)"></div>
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="inspoAddGo()">Adicionar</button></div>`);
  const dz = $('inDz'); dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('on'); }); dz.addEventListener('dragleave', () => dz.classList.remove('on')); dz.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); dz.classList.remove('on'); INSPO_PENDING = INSPO_PENDING.concat([...e.dataTransfer.files]); $('inPend').textContent = INSPO_PENDING.length + ' imagem(ns) pronta(s)'; });
}
function inspoPick() { const f = document.createElement('input'); f.type = 'file'; f.accept = 'image/*'; f.multiple = true; f.onchange = () => { INSPO_PENDING = INSPO_PENDING.concat([...f.files]); const el = $('inPend'); if (el) el.textContent = INSPO_PENDING.length + ' imagem(ns) pronta(s)'; }; f.click(); }
const inspoTags = s => String(s || '').split(',').map(t => t.trim().slice(0, 24)).filter(Boolean).slice(0, 20);
async function inspoAddGo() {
  const cat = $('inCat').value, board = $('inBoard').value, tags = inspoTags($('inTags').value), title = $('inTitle').value.trim().slice(0, 80), url = inspoSafeUrl($('inUrl').value);
  if (!INSPO_PENDING.length && !url) { toast('Escolha imagens ou cole um link.'); return; }
  closeModal(); const files = INSPO_PENDING.slice(); INSPO_PENDING = [];
  if (url) { const isImg = /\.(png|jpe?g|webp|gif|svg|avif)(\?|#|$)/i.test(url); inspo().items.unshift({id: uid('in'), kind: 'link', cat, title: title || inspoHost(url), note: '', tags, url, imgUrl: isImg ? url : '', colors: [], hues: [], fav: false, boards: board ? [board] : [], created: new Date().toISOString()}); persist(); }
  if (files.length) await inspoAddFiles(files, {cat, tags, title: files.length === 1 ? title : '', board}); else renderInspiration();
}
function inspoPalette() {
  showModal('Nova paleta', `<div class="field"><label>Nome</label><input id="ipName" placeholder="Ex.: Verão tropical"></div><div class="in-pcols">${['#1f4d3a', '#2f9e6b', '#f5c518', '#f08a24', '#fbf6ec'].map((c, i) => `<label><input type="color" id="ipC${i}" value="${c}"><input id="ipH${i}" value="${c}" maxlength="7" oninput="if(/^#[0-9a-f]{6}$/i.test(this.value))$('ipC${i}').value=this.value" onchange="$('ipC${i}').value=isHex(this.value)?this.value:$('ipC${i}').value"></label>`).join('')}</div>
  <div class="field"><label>Tags</label><input id="ipTags" placeholder="vibrante, natural"></div><div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="inspoPaletteSave()">Salvar paleta</button></div>`);
  for (let i = 0; i < 5; i++) $('ipC' + i).addEventListener('input', e => { $('ipH' + i).value = e.target.value; });
}
function inspoPaletteSave() {
  const colors = [0, 1, 2, 3, 4].map(i => $('ipC' + i).value).filter(isHex); if (colors.length < 2) { toast('Escolha ao menos 2 cores.'); return; }
  inspo().items.unshift({id: uid('in'), kind: 'palette', cat: 'cores', title: ($('ipName').value.trim() || 'Paleta ' + colors[0]).slice(0, 80), note: '', tags: inspoTags($('ipTags').value), colors, hues: [...new Set(colors.slice(0, 3).map(inspoHue))], fav: false, boards: [], created: new Date().toISOString()}); persist(); closeModal(); insp.cat = 'cores'; renderInspiration(); toast('Paleta salva.');
}

/* detalhe */
async function inspoOpen(id) {
  const I = inspo(), it = I.items.find(i => i.id === id); if (!it) return; insp.openId = id; const list = inspoFiltered(), idx = list.findIndex(i => i.id === id);
  const media = it.kind === 'palette' ? `<div class="in-pal big">${it.colors.map(c => `<span style="background:${esc(c)}" onclick="inspoCopy('${esc(c)}')"><small>${esc(c)}</small></span>`).join('')}</div>` : it.imgId ? `<img id="inBig" alt="${esc(it.title)}">` : it.imgUrl ? `<img id="inBig" src="${esc(it.imgUrl)}" alt="${esc(it.title)}" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'in-link',textContent:'Imagem indisponível'}))">` : `<div class="in-link"><b>${esc(inspoHost(it.url))}</b></div>`;
  const go = {logos: ['◇ Abrir Laboratório do Logo', 'dzLogoOpen()'], posts: ['▦ Ver modelos de layout', 'dzLayoutsOpen()'], diagramacao: ['▦ Ver modelos de layout', 'dzLayoutsOpen()'], cartaz: ['▦ Ver modelos de layout', 'dzLayoutsOpen()'], cores: ['◈ Abrir o Brand Kit', 'dzBrandOpen()'], estilos: ['⚡ Fábrica de variações', 'dzVarOpen()'], foto: ['✦ Estúdio de Design', "go('design')"]}[it.cat];
  $('modalBox').classList.add('wide');
  showModal(it.title, `<div class="in-detail"><div class="in-view">${media}<div class="row-gap" style="justify-content:space-between;margin-top:8px"><button class="btn sm" ${idx > 0 ? '' : 'disabled'} onclick="inspoOpen('${esc((list[idx - 1] || {}).id || '')}')">‹ Anterior</button><small class="muted">${idx + 1} de ${list.length}</small><button class="btn sm" ${idx < list.length - 1 ? '' : 'disabled'} onclick="inspoOpen('${esc((list[idx + 1] || {}).id || '')}')">Próxima ›</button></div></div>
  <div class="in-info"><div class="field"><label>Título</label><input value="${esc(it.title)}" onchange="inspoSet('${esc(id)}','title',this.value.slice(0,80))"></div>
  <div class="form-grid"><div class="field"><label>Categoria</label><select onchange="inspoSet('${esc(id)}','cat',this.value)">${inspoCats().map(c => `<option value="${esc(c.id)}" ${c.id === it.cat ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select></div><div class="field"><label>Tags</label><input value="${esc((it.tags || []).join(', '))}" onchange="inspoSetTags('${esc(id)}',this.value)"></div></div>
  <div class="field"><label>Notas (o que chamou a atenção)</label><textarea rows="3" onchange="inspoSet('${esc(id)}','note',this.value.slice(0,600))">${esc(it.note || '')}</textarea></div>
  ${(it.colors || []).length ? `<div class="okr-label">CORES <small class="muted">(clique para copiar)</small></div><div class="in-sw big">${it.colors.map(c => `<button style="background:${esc(c)}" title="${esc(c)}" onclick="inspoCopy('${esc(c)}')"><small>${esc(c)}</small></button>`).join('')}</div>` : ''}
  ${I.boards.length ? `<div class="okr-label" style="margin-top:10px">QUADROS</div><div class="tchips">${I.boards.map(b => `<button class="tchip ${(it.boards || []).includes(b.id) ? 'on' : ''}" onclick="inspoToggleBoard('${esc(id)}','${esc(b.id)}')">${esc(b.name)}</button>`).join('')}</div>` : ''}
  ${it.url ? `<div class="field" style="margin-top:8px"><label>Link</label><a href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">${esc(it.url.slice(0, 70))}</a></div>` : ''}
  <div class="row-gap" style="margin-top:12px;flex-wrap:wrap"><button class="btn sm ${it.fav ? 'dark' : ''}" onclick="inspoFav('${esc(id)}');inspoOpen('${esc(id)}')">${it.fav ? '★ Favorita' : '☆ Favoritar'}</button>${it.imgId ? `<button class="btn sm" onclick="inspoDown('${esc(id)}')">Baixar</button>` : ''}${(it.colors || []).length >= 2 ? `<button class="btn sm" onclick="inspoToKit('${esc(id)}')" title="Usa estas cores como base da paleta 60/30/10">Aplicar cores no Brand Kit</button>` : ''}${go ? `<button class="btn sm" onclick="closeModal();${go[1]}">${go[0]}</button>` : ''}<button class="btn sm" onclick="inspoDelOne('${esc(id)}')">Excluir</button></div></div></div>`);
  if (it.imgId) { const u = await inspoURL(it.imgId); const im = $('inBig'); if (im && u) im.src = u; }
}
function inspoSet(id, k, v) { const it = inspo().items.find(i => i.id === id); if (!it) return; it[k] = v; persist(); renderInspiration(); }
function inspoSetTags(id, v) { inspoSet(id, 'tags', inspoTags(v)); }
function inspoToggleBoard(id, b) { const it = inspo().items.find(i => i.id === id); it.boards = it.boards || []; tog(it.boards, b); persist(); inspoOpen(id); renderInspiration(); }
function inspoCopy(c) { try { navigator.clipboard.writeText(c); } catch (e) { /* sem permissão */ } toast('Copiado ' + c); }
async function inspoDown(id) { const it = inspo().items.find(i => i.id === id), b = it && await imgGet(it.imgId); if (!b) { toast('Imagem indisponível neste navegador.'); return; } const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = (it.title || 'referencia').replace(/[^\w.-]+/g, '-') + '.' + ((b.type || 'image/png').split('/')[1] || 'png').replace('jpeg', 'jpg').replace('svg+xml', 'svg'); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000); }
function inspoToKit(id) {
  const p = dzP(); if (!p) { toast('Escolha um projeto primeiro.'); return; } const it = inspo().items.find(i => i.id === id), b = brandOf(p), cs = (it.colors || []).filter(isHex); if (!cs.length) return;
  b.extracted = cs.slice(0, 6); b.primary = cs[0]; brandRecalc(p); persist(); toast('Cores aplicadas no Brand Kit de “' + p.name + '”.');
}
async function inspoDelOne(id) { const it = inspo().items.find(i => i.id === id); if (!it || !confirm('Excluir “' + it.title + '”?')) return; await inspoRemove(it); persist(); closeModal(); renderInspiration(); }
async function inspoExport() {
  const I = inspo(); if (!I.items.length) { toast('Nada para exportar.'); return; } toast('Montando o ZIP…'); const files = [];
  for (const it of I.items) { if (it.imgId) { const b = await imgGet(it.imgId); if (b) { const ext = ((b.type || 'image/png').split('/')[1] || 'png').replace('jpeg', 'jpg').replace('svg+xml', 'svg'); files.push({name: `${it.cat}/${it.id}.${ext}`, data: new Uint8Array(await b.arrayBuffer())}); } } }
  files.push({name: 'indice.json', data: new TextEncoder().encode(JSON.stringify({exportado: new Date().toISOString(), categorias: inspoCats(), quadros: I.boards, itens: I.items.map(i => ({id: i.id, tipo: i.kind, categoria: i.cat, titulo: i.title, notas: i.note, tags: i.tags, cores: i.colors, link: i.url || '', quadros: i.boards, favorita: i.fav}))}, null, 1))});
  download('inspiracao.zip', makeZip(files), 'application/zip'); toast('ZIP baixado: imagens por categoria + indice.json.');
}

/* colar e arrastar */
document.addEventListener('paste', e => { if (ui.page !== 'inspiration' || ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return; const fs = [...(e.clipboardData ? e.clipboardData.files : [])].filter(f => /^image\//.test(f.type)); if (fs.length) { e.preventDefault(); inspoAddOpen(fs); } });
['dragenter', 'dragover'].forEach(ev => document.addEventListener(ev, e => { if (ui.page !== 'inspiration' || !e.dataTransfer || ![...e.dataTransfer.types].includes('Files')) return; e.preventDefault(); const d = $('inDrop'); if (d) d.classList.add('on'); }));
document.addEventListener('dragleave', e => { if (ui.page === 'inspiration' && !e.relatedTarget) { const d = $('inDrop'); if (d) d.classList.remove('on'); } });
document.addEventListener('drop', e => { if (ui.page !== 'inspiration' || !e.dataTransfer || !e.dataTransfer.files.length) return; e.preventDefault(); const d = $('inDrop'); if (d) d.classList.remove('on'); if (!$('inDz')) inspoAddOpen(e.dataTransfer.files); });
