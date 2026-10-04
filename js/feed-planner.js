/* ===== Planejador de feed: escolher o tipo de feed (padrão de tons da grade 3 colunas) e a composição de cada espaço ANTES de criar os posts.
   Cada espaço pode ser post simples, vídeo (capa) ou carrossel (capa); clicar abre a criação com o modelo certo e a peça volta para o lugar.
   Os tons (escuro, médio/foto, claro, marca, apoio/frase) vêm da paleta do estilo do projeto. ===== */
const FEED_TONES = {D: ['Escuro', 'texto sobre fundo escuro'], M: ['Foto (médio)', 'foto de rotina, produto ou pessoa'], L: ['Claro', 'fundo claro com tipografia'], B: ['Marca', 'cor de destaque da marca'], S: ['Apoio (frase)', 'frase ou citação em tom suave']};
const FEED_KINDS = {carousel: ['Carrossel', '▤'], post: ['Post simples', '▣'], video: ['Vídeo (capa)', '▶']};
/* modelo de capa por tipo de peça e tom (ids do banco de layouts / modelos de carrossel) */
const FEED_MAP = {
  carousel: {D: 'editorial-escuro', M: 'foto', L: 'editorial-claro', B: 'etiquetas', S: 'notas'},
  post: {D: 'cap-editorial-escuro', M: 'cap-foto-condensado', L: 'cap-editorial-claro', B: 'ed-etiquetas', S: 'cap-notas'},
  video: {D: 'cap-legenda-central', M: 'cap-legenda-caixa', L: 'cap-foto-limpa', B: 'cap-colagem-cor', S: 'cap-legenda-caixa'}
};
const FEED_GROUPS = ['Faixas e blocos', 'Xadrez e diagonais', 'Repetições', 'Degradês', 'Mistos'];
const rnd = i => { let x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };
const cyc = (a, i) => a[((i % a.length) + a.length) % a.length];
/* cada tipo: f(i, r, c, R) devolve o tom do espaço i (linha r, coluna c) */
const FEED_TYPES = [
  {id: 'vertical', g: 0, n: 'Vertical', d: 'Cada coluna tem um tom: ritmo vertical limpo.', f: (i, r, c) => 'DML'[c]},
  {id: 'horizontal', g: 0, n: 'Horizontal', d: 'Cada linha tem um tom: três posts do mesmo tipo seguidos.', f: (i, r) => cyc(['D', 'M', 'L'], r)},
  {id: 'mini', g: 0, n: 'Mini feed (blocos de 6)', d: 'Duas linhas de um tom, depois duas de outro.', f: (i, r) => cyc(['D', 'M', 'L'], Math.floor(r / 2))},
  {id: 'blocos9', g: 0, n: 'Blocos de 9', d: 'Três linhas de cada tom: um assunto por bloco.', f: (i, r) => cyc(['B', 'L', 'D'], Math.floor(r / 3))},
  {id: 'linhas', g: 0, n: 'Linha por linha', d: 'Linhas alternadas em marca, claro, escuro e foto.', f: (i, r) => cyc(['B', 'L', 'D', 'M'], r)},
  {id: 'dupla', g: 0, n: 'Em dupla', d: 'Blocos 2×2 escuros ao lado de uma coluna clara.', f: (i, r, c) => c === 0 ? (r % 2 ? 'M' : 'L') : (r % 2 === 0 ? 'D' : c === 1 ? 'M' : 'L')},
  {id: 'dois-um', g: 0, n: '2 depois 1', d: 'Duas colunas do mesmo tom e uma coluna de contraste.', f: (i, r, c) => c < 2 ? 'D' : 'L'},
  {id: 'faixa-central', g: 0, n: 'Faixa central de texto', d: 'Fotos nas laterais e uma coluna central de frases.', f: (i, r, c) => c === 1 ? 'S' : 'M'},
  {id: 'xadrez', g: 1, n: 'Xadrez', d: 'Dois tons que se alternam em cruz.', f: (i, r, c) => (r + c) % 2 ? 'M' : 'D'},
  {id: 'xadrez-marca', g: 1, n: 'Xadrez da marca', d: 'Cor da marca e fundo claro em xadrez.', f: (i, r, c) => (r + c) % 2 ? 'L' : 'B'},
  {id: 'xadrez-3', g: 1, n: 'Xadrez de 3 tons', d: 'Três tons girando pela grade.', f: (i, r, c) => cyc(['D', 'M', 'L'], r + c)},
  {id: 'diagonal', g: 1, n: 'Diagonal', d: 'O mesmo tom desce em diagonal.', f: (i, r, c) => cyc(['D', 'M', 'L'], c - r)},
  {id: 'zigzag', g: 1, n: 'Zigue-zague', d: 'Um tom de destaque que caminha em zigue-zague.', f: (i, r, c) => c === [0, 1, 2, 1][r % 4] ? 'D' : 'L'},
  {id: 'pontos', g: 1, n: 'Pontos', d: 'Fundo uniforme com um destaque a cada duas linhas.', f: (i, r, c) => (r % 2 === 1 && c === 1) ? 'B' : 'D'},
  {id: 'espelho', g: 1, n: 'Espelho (laterais iguais)', d: 'Colunas das pontas se repetem; a do meio traz as pessoas.', f: (i, r, c) => c === 1 ? 'M' : cyc(['L', 'D'], r)},
  {id: 'rep4', g: 2, n: 'Repetir a cada 4', d: 'Quatro tons em ciclo: o padrão se desloca a cada linha.', f: i => cyc(['D', 'M', 'L', 'S'], i)},
  {id: 'rep5', g: 2, n: 'Repetir a cada 5', d: 'Cinco tons em ciclo com a marca no meio.', f: i => cyc(['D', 'M', 'L', 'B', 'S'], i)},
  {id: 'rep6', g: 2, n: 'Repetir a cada 6', d: 'Seis posts por ciclo: duas linhas formam um bloco.', f: i => cyc(['D', 'M', 'L', 'B', 'M', 'S'], i)},
  {id: 'alt-dc', g: 2, n: 'Alternar escuro e claro', d: 'Escuro e claro, um depois do outro.', f: i => i % 2 ? 'L' : 'D'},
  {id: 'alt-cc', g: 2, n: 'Alternar claro e mais claro', d: 'Claro e apoio, com um escuro de vez em quando.', f: i => i % 7 === 4 ? 'D' : (i % 2 ? 'S' : 'L')},
  {id: 'crossfade', g: 3, n: 'Cross-fade', d: 'Os tons passam de uma coluna para a outra a cada duas linhas.', f: (i, r, c) => cyc(['D', 'M', 'L'], c + Math.floor(r / 2))},
  {id: 'linefade', g: 3, n: 'Line fade', d: 'Esmaece de escuro a claro, linha a linha.', f: (i, r) => cyc(['D', 'D', 'M', 'M', 'L', 'L', 'S', 'S'], r)},
  {id: 'gradiente', g: 3, n: 'Gradiente', d: 'Do mais escuro no topo ao mais claro embaixo.', f: (i, r, c, R) => ['D', 'D', 'M', 'S', 'L', 'L', 'L', 'L'][Math.min(7, Math.floor(r * 6 / Math.max(1, R)))]},
  {id: 'aleatorio', g: 4, n: 'Aleatório', d: 'Tons espalhados, sem repetir dois iguais seguidos.', f: i => { const a = ['D', 'M', 'L', 'B', 'S']; let prev = -1, v = 0; for (let k = 0; k <= i; k++) { v = Math.floor(rnd(k) * 5); if (v === prev) v = (v + 1) % 5; prev = v; } return a[v]; }},
  {id: 'ritmo', g: 4, n: 'Foto + frase com marca', d: 'Foto e frase alternadas; a cada 5 posts, um da marca.', f: i => i % 5 === 4 ? 'B' : (i % 2 ? 'S' : 'M')},
  {id: 'grid', g: 4, n: 'Grid de carrosséis (imagem contínua)', d: 'Uma imagem cortada: cada pedaço é a capa de um carrossel (use o editor de Grid).', f: () => 'M'},
  {id: 'mix', g: 4, n: 'Mix de conteúdo', d: 'Seis tipos de assunto em ciclo (produto, citação, inspiração, dica, comunidade, bastidores).', f: i => cyc(['D', 'S', 'M', 'L', 'M', 'B'], i), lab: i => cyc(['Produto', 'Citação', 'Inspiração', 'Dica', 'Comunidade', 'Bastidores'], i)}
];
const feedType = id => FEED_TYPES.find(t => t.id === id) || FEED_TYPES[8];
const feedUI = {id: '', sel: -1, from: false, mode: ''};
const feedCur = () => { const p = curProject(); return p && p.feeds.find(f => f.id === feedUI.id); };
const feedSave = () => persist();

/* ---------- cores dos tons (da paleta do estilo) ---------- */
function feedTones(p, f) {
  const tk = lyTokens(p, f.style || lyStyles(p)[0].id), dk = palette(tk, 'dark'), lt = palette(tk, 'light');
  return {D: dk.bg, L: lt.bg, B: tk.accent, M: mixHex(dk.bg, lt.bg, 0.5), S: mixHex(tk.accent, lt.bg, 0.78), tk};
}
function feedApply(f, typeId) {
  const T = feedType(typeId), R = f.rows; f.type = T.id;
  f.slots.forEach((s, i) => { const r = Math.floor(i / 3), c = i % 3; s.tone = T.f(i, r, c, R); if (T.lab) s.label = T.lab(i); });
}
function feedNew(name, typeId, rows) {
  const p = curProject(), f = normalizeFeeds([{id: '', name: name || 'Meu feed', type: typeId, rows: rows || 4, style: '', defKind: 'carousel'}])[0]; feedApply(f, f.type); p.feeds.unshift(f); feedUI.id = f.id; feedUI.sel = -1; persist(); return f;
}

/* ---------- tela ---------- */
function renderFeed() {
  const r = $('feedRoot'), p = curProject(); if (!r) return; if (!p) { r.innerHTML = noProject('Planejador de feed'); return; }
  if (!feedCur() && p.feeds.length) feedUI.id = p.feeds[0].id;
  if (feedUI.mode === 'grid' && gridCur()) return renderGridEditor(r, p);
  const f = feedCur();
  if (!f) { r.innerHTML = `<div class="page-head"><div><h1>Planejador de feed</h1><p>Escolha o tipo de feed do perfil e a composição de cada espaço antes de criar os posts.</p></div><div class="actions">${projectSelect()}<button class="btn" onclick="gridNewModal()">✂ Grid (split)</button></div></div>${p.grids.length ? `<div class="panel" style="margin-bottom:10px"><small class="muted">Grids (imagem cortada):</small> ${p.grids.map(x => `<button class="btn sm" onclick="gridUI.id='${x.id}';feedUI.mode='grid';renderFeed()">✂ ${esc(x.name)}</button>`).join(' ')}</div>` : ''}<div class="panel"><p class="muted">Nenhum feed planejado em ${esc(p.name)}.</p><button class="btn dark" onclick="feedNewModal()">＋ Novo feed</button></div>`; return; }
  const T = feedType(f.type), styles = lyStyles(p), n = f.slots.length, sel = feedUI.sel >= 0 && feedUI.sel < n ? feedUI.sel : -1, done = f.slots.filter(s => s.ref.id).length;
  r.innerHTML = `<div class="page-head"><div><h1>Planejador de feed</h1><p>${esc(p.name)}: o padrão de tons e a composição de cada post, definidos antes de criar. Cada espaço pode ser carrossel, vídeo ou post simples.</p></div><div class="actions">${projectSelect()}<button class="btn" onclick="gridNewModal()">✂ Grid (split)</button><button class="btn dark" onclick="feedNewModal()">＋ Novo feed</button></div></div>
  ${p.grids.length ? `<div class="panel" style="margin-bottom:10px"><small class="muted">Grids (imagem cortada):</small> ${p.grids.map(x => `<button class="btn sm" onclick="gridUI.id='${x.id}';feedUI.mode='grid';renderFeed()">✂ ${esc(x.name)}</button>`).join(' ')}</div>` : ''}
  <div class="fd-wrap"><div class="fd-left">
    <div class="panel"><div class="field"><label>Feed</label><select onchange="feedUI.id=this.value;feedUI.sel=-1;renderFeed()">${p.feeds.map(x => `<option value="${x.id}" ${x.id === f.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>
      <div class="field"><label>Nome</label><input value="${esc(f.name)}" oninput="feedCur().name=this.value;feedSave()"></div>
      <div class="field"><label>Tipo de feed</label><button class="btn" style="width:100%;text-align:left" onclick="feedTypesModal()">${feedMini(T, 3, 3, feedTones(p, f), 9)} <b>${esc(T.n)}</b> · trocar</button><small class="muted block">${esc(T.d)}</small></div>
      <div class="ins-row"><label class="ins">Posts<select onchange="feedRows(+this.value)">${[3, 4, 5, 6, 7, 8].map(x => `<option value="${x}" ${x === f.rows ? 'selected' : ''}>${x * 3}</option>`).join('')}</select></label><label class="ins">Estilo<select onchange="feedCur().style=this.value;feedSave();renderFeed()">${styles.map(s => `<option value="${esc(s.id)}" ${s.id === (f.style || styles[0].id) ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label></div>
      <div class="field"><label>Tipo de peça padrão dos espaços</label><div class="row-gap">${Object.entries(FEED_KINDS).map(([k, v]) => `<button class="btn sm ${f.defKind === k ? 'dark' : ''}" onclick="feedDefKind('${k}')">${v[1]} ${v[0]}</button>`).join('')}</div><small class="muted block">Troque o tipo de um espaço clicando nele.</small></div>
      <div class="field"><label>Mostrar</label><div class="row-gap">${[['tons', 'Tons'], ['comp', 'Composições'], ['pecas', 'Peças criadas']].map(([k, v]) => `<button class="btn sm ${f.view === k ? 'dark' : ''}" onclick="feedView('${k}')">${v}</button>`).join('')}</div></div>
      <div class="row-gap" style="flex-wrap:wrap"><button class="btn sm" onclick="feedShuffle()">Embaralhar tons</button><button class="btn sm" onclick="feedDup()">⧉ Duplicar</button><button class="btn sm" onclick="feedDel()">Excluir</button></div></div>
    <div class="panel"><div class="okr-label">LEGENDA DOS TONS</div>${Object.entries(FEED_TONES).map(([k, v]) => `<div class="fd-leg"><i style="background:${feedTones(p, f)[k]}"></i><b>${v[0]}</b><small>${esc(v[1])}</small></div>`).join('')}<small class="muted block" style="margin-top:6px">As cores vêm da paleta do estilo. “Postar nº” segue a ordem de publicação: o último espaço da grade (embaixo à direita) é o primeiro a ir ao ar, porque o Instagram mostra o mais novo no topo.</small></div>
    <div class="panel"><div class="okr-label">PROGRESSO</div><b>${done} de ${n}</b> espaços com peça<div class="fd-bar"><i style="width:${Math.round(done / n * 100)}%"></i></div><button class="btn sm dark" style="margin-top:8px" onclick="feedToPublish()" ${done ? '' : 'disabled'}>Levar para a Publicação</button><small class="muted block">Cria um rascunho por espaço com peça, na ordem de postagem.</small></div>
  </div>
  <div class="fd-center"><div class="fd-phone"><div class="fd-ph-h"><b>${esc(p.name)}</b><span>⋮</span></div><div class="fd-tabs"><span class="on">▦</span><span>▶</span><span>👤</span></div><div class="fd-grid" id="fdGrid">${f.slots.map((s, i) => `<div class="fd-cell ${i === sel ? 'sel' : ''}" onclick="feedPick(${i})" style="background:${feedTones(p, f)[s.tone]}"><canvas data-fd="${i}" width="240" height="320"></canvas><span class="fd-k">${FEED_KINDS[s.kind][1]}</span><span class="fd-n">${n - i}</span>${s.label && !(f.view === 'pecas' && s.ref.id) ? `<span class="fd-l">${esc(s.label)}</span>` : ''}${s.ref.id ? '<span class="fd-ok">✓</span>' : ''}</div>`).join('')}</div></div></div>
  <div class="fd-right">${sel >= 0 ? feedInspector(p, f, sel) : '<div class="panel"><div class="okr-label">ESPAÇO</div><p class="muted" style="font-size:13px">Clique em um espaço da grade para escolher o tipo de peça, o tom e o assunto, e criar a peça com o modelo certo.</p></div>'}</div></div>`;
  feedPaint();
}
function feedMini(T, cols, rows, tones, size) {
  let h = `<span class="fd-mini" style="grid-template-columns:repeat(${cols},${size}px)">`;
  for (let i = 0; i < cols * rows; i++) h += `<i style="width:${size}px;height:${size}px;background:${tones[T.f(i, Math.floor(i / cols), i % cols, rows)]}"></i>`;
  return h + '</span>';
}
function feedInspector(p, f, i) {
  const s = f.slots[i], T = feedTones(p, f), tpl = feedLayoutOf(s), n = f.slots.length;
  return `<div class="panel"><div class="okr-label">ESPAÇO ${i + 1} · POSTAR Nº ${n - i}</div>
  <div class="field"><label>Tipo de peça</label><div class="row-gap">${Object.entries(FEED_KINDS).map(([k, v]) => `<button class="btn sm ${s.kind === k ? 'dark' : ''}" onclick="feedSlot(${i},'kind','${k}')">${v[1]} ${v[0]}</button>`).join('')}</div></div>
  <div class="field"><label>Tom / composição</label><div class="row-gap" style="flex-wrap:wrap">${Object.entries(FEED_TONES).map(([k, v]) => `<button class="btn sm ${s.tone === k ? 'dark' : ''}" onclick="feedSlot(${i},'tone','${k}')"><i class="fd-dot" style="background:${T[k]}"></i> ${v[0]}</button>`).join('')}</div></div>
  <div class="field"><label>Assunto / título provisório</label><input value="${esc(s.label)}" oninput="feedSlot(${i},'label',this.value,true)" placeholder="Ex.: Mito sobre juros"></div>
  <small class="muted block" style="margin-bottom:8px">Modelo: <b>${esc(tpl.name)}</b></small>
  ${feedQuick(p, s, i)}
  ${s.ref.id ? `<div class="row-gap" style="flex-wrap:wrap"><button class="btn dark sm" onclick="feedOpen(${i})">Abrir a peça</button><button class="btn sm" onclick="feedUnlink(${i})">Desvincular</button></div>` : `<div class="row-gap" style="flex-wrap:wrap"><button class="btn dark" onclick="feedCreate(${i})">＋ Criar ${FEED_KINDS[s.kind][0].toLowerCase()}</button><button class="btn sm" onclick="feedLinkModal(${i})">Vincular existente</button></div>`}</div>`;
}
function feedLayoutOf(s) {
  const id = FEED_MAP[s.kind][s.tone];
  if (s.kind === 'carousel') { const t = CAR_TPL.find(x => x.id === id) || CAR_TPL[0]; return {name: 'Carrossel · ' + t.name, lay: t.cover, tpl: t.id}; }
  const l = layoutById(id) || LAYOUTS[0]; return {name: (s.kind === 'video' ? 'Capa de vídeo · ' : 'Post · ') + l.name, lay: l.id};
}

/* ---------- pintura das células ---------- */
let feedTok = 0;
async function feedPaint() {
  const f = feedCur(), p = curProject(); if (!f) return; const tok = ++feedTok, TN = feedTones(p, f), tk = TN.tk; if (f.view === 'tons') return;
  await ensureFonts(lyFamilies(tk)); const fmt = FORMATS.feed45;
  for (const cv of [...document.querySelectorAll('canvas[data-fd]')]) {
    if (tok !== feedTok || !cv.isConnected) return; const s = f.slots[+cv.dataset.fd]; if (!s) continue;
    try {
      let slide = null, W = fmt.w, H = fmt.h;
      if (s.ref.id && (f.view === 'pecas' || f.view === 'comp')) {
        if (s.ref.t === 'car') { const c = p.carousels.find(x => x.id === s.ref.id); if (c) { const m = carMake(c, {final: true}); await ensureFonts(lyFamilies(m.set.tk)); await ensureSetResources(m.set); slide = m.set.slides[0]; W = m.set.format.w; H = m.set.format.h; } }
        else { const st = p.design.sets.find(x => x.id === s.ref.id); if (st) { await ensureSetResources(st); slide = st.slides[0]; W = st.format.w; H = st.format.h; } }
      }
      const real = !!slide; if (!slide && f.view === 'pecas') continue;
      if (!slide) { const lay = layoutById(feedLayoutOf(s).lay); slide = buildLayoutSlide(lay, tk, {}, fmt, p.name); }
      cv.height = Math.round(240 * H / W); LAYOUT_PREVIEW = !real; try { renderSlide(cv.getContext('2d'), slide, W, H, 240 / W); } finally { LAYOUT_PREVIEW = false; }
    } catch (e) { console.warn('feed', e); }
  }
}

/* ---------- ações ---------- */
function feedPick(i) { feedUI.sel = i === feedUI.sel ? -1 : i; renderFeed(); }
function feedSlot(i, k, v, quiet) { const s = feedCur().slots[i]; s[k] = k === 'label' ? String(v).slice(0, 80) : v; feedSave(); if (!quiet) renderFeed(); else { const c = document.querySelectorAll('.fd-cell')[i]; if (c) { let l = c.querySelector('.fd-l'); if (!l && v) { l = document.createElement('span'); l.className = 'fd-l'; c.appendChild(l); } if (l) { l.textContent = v; l.style.display = v ? '' : 'none'; } } } }
function feedRows(n) { const f = feedCur(); f.rows = n; const old = f.slots; f.slots = Array.from({length: n * 3}, (_, i) => old[i] || {kind: f.defKind, tone: 'M', label: '', ref: {t: '', id: ''}, postId: ''}); const T = feedType(f.type); f.slots.forEach((s, i) => { if (i >= old.length) s.tone = T.f(i, Math.floor(i / 3), i % 3, n); }); feedSave(); renderFeed(); }
function feedDefKind(k) { const f = feedCur(); f.defKind = k; f.slots.forEach(s => { if (!s.ref.id) s.kind = k; }); feedSave(); renderFeed(); }
function feedView(v) { feedCur().view = v; feedSave(); renderFeed(); }
function feedShuffle() { const f = feedCur(), a = ['D', 'M', 'L', 'B', 'S']; f.slots.forEach((s, i) => { s.tone = a[Math.floor(Math.random() * 5)]; }); f.type = 'aleatorio'; feedSave(); renderFeed(); }
function feedDup() { const p = curProject(), f = feedCur(), c = normalizeFeeds([Object.assign(JSON.parse(JSON.stringify(f)), {id: '', name: f.name + ' (cópia)'})])[0]; c.slots.forEach(s => { s.ref = {t: '', id: ''}; s.postId = ''; }); p.feeds.splice(p.feeds.indexOf(f) + 1, 0, c); feedUI.id = c.id; feedSave(); renderFeed(); }
function feedDel() { if (!confirm('Excluir este feed? As peças criadas continuam salvas.')) return; const p = curProject(); p.feeds = p.feeds.filter(x => x.id !== feedUI.id); feedUI.id = ''; feedSave(); renderFeed(); }
function feedNewModal() {
  showModal('Novo feed', `<div class="field"><label>Nome</label><input id="fdName" placeholder="Ex.: Feed de outubro" autofocus></div><div class="field"><label>Quantidade de posts</label><select id="fdRows">${[3, 4, 5, 6].map(x => `<option value="${x}" ${x === 4 ? 'selected' : ''}>${x * 3}</option>`).join('')}</select></div><div class="okr-label">TIPO DE FEED</div>${feedTypeGrid('fdT')}<div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="feedNewGo()">Criar feed</button></div>`);
  document.getElementById('modalBox').classList.add('wide');
}
function feedNewGo() { const t = (document.querySelector('input[name=fdT]:checked') || {}).value || 'xadrez'; feedNew(($('fdName') || {}).value && $('fdName').value.trim() || 'Meu feed', t, +$('fdRows').value); closeModal(); renderFeed(); }
function feedTypeGrid(name, cur) {
  const p = curProject(), TN = feedTones(p, feedCur() || {style: ''});
  return FEED_GROUPS.map((g, gi) => `<div class="okr-label" style="margin-top:10px">${g.toUpperCase()}</div><div class="fd-types">${FEED_TYPES.filter(t => t.g === gi).map(t => `<label class="fd-type"><input type="radio" name="${name}" value="${t.id}" ${t.id === (cur || 'xadrez') ? 'checked' : ''}>${feedMini(t, 3, 6, TN, 13)}<b>${esc(t.n)}</b><small class="muted">${esc(t.d)}</small></label>`).join('')}</div>`).join('');
}
function feedTypesModal() {
  const f = feedCur(); showModal('Tipo de feed', `<small class="muted block" style="margin-bottom:6px">Trocar o tipo refaz os tons de todos os espaços; as peças já criadas, os tipos de peça e os assuntos ficam.</small>${feedTypeGrid('fdT2', f.type)}<div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="feedTypeGo()">Usar este tipo</button></div>`);
  document.getElementById('modalBox').classList.add('wide');
}
function feedTypeGo() { const t = (document.querySelector('input[name=fdT2]:checked') || {}).value, f = feedCur(); if (t) { feedApply(f, t); feedSave(); } closeModal(); renderFeed(); }

/* criar a peça do espaço com o modelo certo */
async function feedCreate(i) {
  const p = curProject(), f = feedCur(), s = f.slots[i], L = feedLayoutOf(s), TN = feedTones(p, f);
  if (s.kind === 'carousel') { const c = carNew(s.label || ('Carrossel · ' + FEED_TONES[s.tone][0]), '', L.tpl); c.idea = s.label || ''; c.style = f.style || ''; s.ref = {t: 'car', id: c.id}; feedSave(); feedUI.from = true; carUI.id = c.id; carUI.frame = 0; go('carrosseis'); return; }
  toast('Criando a peça…');
  try {
    const tk = JSON.parse(JSON.stringify(TN.tk)), lay = layoutById(L.lay), fmt = resolveFmt({fmt: 'feed45'}), copy = {}; lay.fields.forEach(k => { const v = lay.sample[k]; copy[k] = k === 'title' && s.label ? s.label : (Array.isArray(v) ? v.join('\n') : (v || '')); });
    await ensureFonts(lyFamilies(tk)); await brandFontsLoad(p);
    const set = layoutSetFrom(lay, tk, copy, fmt, p.name, (s.label || lay.name) + ' · ' + p.name); set.slides[0] = buildLayoutSlide(lay, tk, copy, fmt, p.name); await ensureSetResources(set);
    p.design.sets.push(set); s.ref = {t: 'set', id: set.id}; feedSave(); feedUI.from = true; go('design'); dzOpen(set.id); toast('Peça criada no espaço ' + (i + 1) + '. Para voltar ao feed, use o ícone de grade no menu.');
  } catch (e) { toast('Não consegui criar: ' + e.message); }
}
function feedOpen(i) { const s = feedCur().slots[i]; feedUI.from = true; gridUI.from = false; if (s.ref.t === 'car') { carUI.id = s.ref.id; carUI.frame = 0; go('carrosseis'); } else if (s.ref.t === 'set') { go('design'); dzOpen(s.ref.id); } }
function feedUnlink(i) { feedCur().slots[i].ref = {t: '', id: ''}; feedSave(); renderFeed(); }
function feedLinkModal(i) {
  const p = curProject(), used = new Set(feedCur().slots.map(s => s.ref.id)), cars = p.carousels.filter(c => !used.has(c.id)), sets = p.design.sets.filter(x => !used.has(x.id));
  showModal('Vincular peça existente', `${cars.length ? '<div class="okr-label">CARROSSÉIS</div>' + cars.map(c => `<div class="list-item"><div><strong>${esc(c.name)}</strong></div><button class="btn sm" onclick="feedLink(${i},'car','${c.id}')">Usar</button></div>`).join('') : ''}${sets.length ? '<div class="okr-label" style="margin-top:8px">PEÇAS DO EDITOR DE DESIGN</div>' + sets.slice(0, 40).map(x => `<div class="list-item"><div><strong>${esc(x.name)}</strong><small>${x.slides.length} slide(s)</small></div><button class="btn sm" onclick="feedLink(${i},'set','${x.id}')">Usar</button></div>`).join('') : ''}${cars.length || sets.length ? '' : '<p class="muted">Nenhuma peça livre para vincular.</p>'}<div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button></div>`);
}
function feedLink(i, t, id) { const s = feedCur().slots[i]; s.ref = {t, id}; if (t === 'car') s.kind = 'carousel'; feedSave(); closeModal(); renderFeed(); }

/* leva os espaços com peça para a Publicação como rascunhos, na ordem de postagem (do último espaço para o primeiro) */
async function feedToPublish() {
  const p = curProject(), f = feedCur(), S = so(); if (!S) return; let n = 0; toast('Preparando as publicações…');
  for (let i = f.slots.length - 1; i >= 0; i--) {
    const s = f.slots[i]; if (!s.ref.id || (s.postId && S.posts.some(x => x.id === s.postId))) continue;
    const po = soNewPost({title: s.label || (s.ref.t === 'car' ? (p.carousels.find(c => c.id === s.ref.id) || {}).name : (p.design.sets.find(x => x.id === s.ref.id) || {}).name) || 'Publicação do feed', format: s.kind === 'carousel' ? 'carrossel' : s.kind === 'video' ? 'video' : 'imagem', status: 'rascunho', setId: s.ref.t === 'set' ? s.ref.id : ''});
    if (s.ref.t === 'car') { const c = p.carousels.find(x => x.id === s.ref.id); if (c) { try { const {set} = carMake(c, {final: true}); await ensureFonts(lyFamilies(set.tk)); await ensureSetResources(set); set.id = 'ds_' + c.id; set.name = c.name + ' · carrossel'; const at = p.design.sets.findIndex(x => x.id === set.id); if (at >= 0) p.design.sets[at] = set; else p.design.sets.push(set); po.setId = set.id; po.caption = (c.texts[0] || '').replace(/\*\*/g, '') + (c.texts[1] ? '\n\n' + c.texts[1] : ''); po.media = Object.assign({}, po.media, {count: set.slides.length, aspectRatio: c.ratio}); } catch (e) { /* segue sem a peça */ } } }
    s.postId = po.id; n++;
  }
  soSave(); feedSave(); toast(n ? `${n} rascunho(s) criado(s) na Publicação, na ordem de postagem.` : 'Esses espaços já foram levados para a Publicação.');
}

/* ajuste rápido do post (carrosséis): fonte, cor, fundo e foto da capa, sem sair do feed */
function feedQuick(p, s, i) {
  if (s.ref.t !== 'car') return ''; const c = p.carousels.find(x => x.id === s.ref.id); if (!c) return '';
  return `<div class="okr-label" style="margin-top:6px">AJUSTE RÁPIDO DESTE POST</div><div class="row-gap" style="flex-wrap:wrap;margin-bottom:6px"><button class="btn sm" onclick="feedQFont(${i})">Aa ${esc(c.fontHead || 'fonte do estilo')}</button>${c.fontHead ? `<button class="btn sm" onclick="feedQSet(${i},'fontHead','')">×</button>` : ''}<label class="ins inl" title="Cor de destaque">cor <input type="color" value="${c.accent || '#e4572e'}" oninput="feedQSet(${i},'accent',this.value,true)"></label>${c.accent ? `<button class="btn sm" onclick="feedQSet(${i},'accent','')">×</button>` : ''}</div>
  <div class="row-gap" style="flex-wrap:wrap;margin-bottom:6px"><label class="ins inl"><input type="checkbox" ${c.dark ? 'checked' : ''} onchange="feedQSet(${i},'dark',this.checked)"> fundo escuro nos miolos</label><button class="btn sm" onclick="feedQPhoto(${i})">📚 Foto da capa</button></div>
  <button class="btn sm" onclick="feedQAll(${i})" title="Copia a fonte e a cor deste post para todos os carrosséis do feed">Aplicar fonte e cor a todos os carrosséis do feed</button>`;
}
function feedQCar(i) { return curProject().carousels.find(c => c.id === feedCur().slots[i].ref.id); }
function feedQSet(i, k, v, quiet) { const c = feedQCar(i); if (!c) return; c[k] = v; c.updated = new Date().toISOString(); persist(); if (quiet) feedPaintSoon(); else renderFeed(); }
function feedQFont(i) { fbOpen(fam => { closeModal(); feedQSet(i, 'fontHead', String(fam).replace(/[^\w \-]/g, '').slice(0, 60)); }, (feedQCar(i) || {}).fontHead); }
function feedQPhoto(i) { libPick(r => { const c = feedQCar(i); if (c) { c.media['0'] = r.id; persist(); renderFeed(); } }); }
function feedQAll(i) { const p = curProject(), f = feedCur(), me = feedQCar(i); if (!me) return; f.slots.forEach(s => { const c = s.ref.t === 'car' && p.carousels.find(x => x.id === s.ref.id); if (c) { c.fontHead = me.fontHead; c.accent = me.accent; } }); persist(); renderFeed(); toast('Fonte e cor aplicadas aos carrosséis do feed.'); }
const feedPaintSoon = debounce(() => feedPaint(), 250);
