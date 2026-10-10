/* ===== Mesa de edição · interface =====
   Casca em tela cheia, barra superior, painel esquerdo (Elementos, Blocos, Camadas, Biblioteca, Assets) e painel direito (5 abas). */
const MZ_TABS = [['content', 'Conteúdo'], ['style', 'Estilo'], ['layout', 'Layout'], ['adv', 'Avançado'], ['resp', 'Responsivo']];
const MZ_LEFT = [['elements', 'Elementos'], ['blocks', 'Blocos'], ['layers', 'Camadas'], ['lib', 'Biblioteca'], ['assets', 'Assets']];
const mzI = (name, s) => mzIcon(name, s || 22);

/* ---------- abrir e fechar ---------- */
function mzOpen(pageId) {
  const p = curProject(); if (!p) { toast('Crie ou escolha um projeto primeiro.'); return; }
  if (MZ.open) return; if (!p.mesa) p.mesa = normalizeMesa({}); if (!state.mesaLib) state.mesaLib = normalizeMesaLib({}); MZ.p = p; const m = p.mesa;
  if (!m.pages.length) { const ds = (m.ds && m.ds.colors && m.rev === 0) ? mzDsFromBrand(p) : m.ds; m.ds = ds; }
  if (!m.pages.length) { MZ.p = p; mzPageNew('lead', 'Página inicial'); persist(); }
  if (pageId && m.pages.some(x => x.id === pageId)) m.cur = pageId;
  MZ.open = true; MZ.sel = ''; MZ.comp = ''; MZ.bp = 'd'; MZ.view = 'one'; MZ.fit = true; MZ.hist = []; MZ.hi = -1; MZ.tab = 'content'; MZ.left = 'elements';
  let app = document.getElementById('mzApp'); if (app) app.remove(); app = document.createElement('div'); app.id = 'mzApp'; app.className = 'mz-app'; document.body.appendChild(app); document.body.classList.add('mz-lock');
  app.innerHTML = mzShellHtml(); mzSnap(true); mzBuildFrames(); mzRefreshPanels(); mzRefreshLeft(); mzPageSelUpdate(); mzUndoState();
  window.addEventListener('resize', mzOnResize); document.getElementById('mzCanvas').addEventListener('scroll', mzRulers); document.getElementById('mzCanvas').addEventListener('pointerdown', e => { if (e.target.id === 'mzCanvas' || e.target.id === 'mzFrames') mzSelect(''); });
  document.getElementById('mzCanvas').addEventListener('wheel', e => { if (e.ctrlKey) { e.preventDefault(); mzZoom(e.deltaY < 0 ? 0.05 : -0.05); } }, {passive: false}); mzRulers();
}
async function mzClose() {
  if (!MZ.open) return; if (MZ.editing) mzEndEdit(true); const m = mzM(); try { const last = m.versions.find(v => v.auto && /^Automática/.test(v.name)); if (!last || Date.now() - Date.parse(last.ts) > 600000) await mzVersionSave('Automática ' + new Date().toLocaleString('pt-BR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'}), true); } catch (e) { /* ok */ }
  persist(); MZ.open = false; mzMenuClose(); mzRichBarClose(); window.removeEventListener('resize', mzOnResize); const a = document.getElementById('mzApp'); if (a) a.remove(); document.body.classList.remove('mz-lock'); MZ.frames = {}; if (typeof renderMesaLauncher === 'function' && ui.page === 'mesa') renderMesaLauncher();
}
function mzOnResize() { if (MZ.fit) { mzLayoutFrames(); mzOverlayAll(); } }
function mzShellHtml() {
  return `<div class="mz-top">
    <button class="mz-btn-i" onclick="mzClose()" title="Voltar ao Studio (Esc sem seleção)">← Studio</button>
    <div class="mz-title"><b>${esc(MZ.p.name)}</b><select id="mzPageSel" onchange="mzPageOpen(this.value)" title="Página"></select><button class="mz-btn-i" onclick="mzModalPages()" title="Gerenciar páginas">Páginas</button></div>
    <div class="mz-bps"><button data-mzbp="d" class="on" onclick="mzSetBp('d')" title="Desktop 1440">🖥 1440</button><button data-mzbp="t" onclick="mzSetBp('t')" title="Tablet 768">▭ 768</button><button data-mzbp="m" onclick="mzSetBp('m')" title="Celular 390">▯ 390</button><button data-mzview="three" onclick="mzSetView(MZ.view==='three'?'one':'three')" title="Ver os três tamanhos lado a lado">⫼ 3 telas</button></div>
    <div class="mz-zoom"><button onclick="mzZoom(-0.1)" title="Menos zoom">−</button><span id="mzZoomL">100%</span><button onclick="mzZoom(0.1)" title="Mais zoom">＋</button><button onclick="mzZoomFit()" title="Ajustar à tela">Ajustar</button></div>
    <div class="mz-acts"><button class="mz-btn-i" id="mzUndo" onclick="mzUndo()" title="Desfazer (Ctrl+Z)">↶</button><button class="mz-btn-i" id="mzRedo" onclick="mzRedo()" title="Refazer (Ctrl+Y)">↷</button><span class="mz-sep"></span>
      <button class="mz-btn-i ${MZ.free ? 'on' : ''}" id="mzFreeBtn" onclick="mzFreeToggle()" title="Modo livre: arraste qualquer elemento para onde quiser (Alt+arrastar duplica)">✋ Livre</button><button class="mz-btn-i" id="mzDrawBtn" onclick="mzDrawToggle()" title="Desenhar com pincéis sobre a página">✏️ Desenhar</button>
      <button class="mz-btn-i ai" onclick="mzAiToggle()" title="Comandos de IA no layout">✨ IA</button><button class="mz-btn-i" onclick="mzModalPreview()">👁 Prévia</button><button class="mz-btn-i" onclick="mzModalVersions()">🕘 Versões</button><button class="mz-btn-i" onclick="mzModalDs()">🎨 Sistema</button><button class="mz-btn-i" onclick="mzModalImport()">⬆ Importar</button><button class="mz-btn-i dark" onclick="mzModalExport()">⬇ Exportar</button><span id="mzSaved" class="mz-saved"></span></div>
  </div>
  <div class="mz-body">
    <aside class="mz-left"><div class="mz-tabs" id="mzLeftTabs">${MZ_LEFT.map(([k, n]) => `<button data-lt="${k}" class="${k === MZ.left ? 'on' : ''}" onclick="mzLeftTab('${k}')">${n}</button>`).join('')}</div><div class="mz-search"><input id="mzSearch" placeholder="Buscar elementos, blocos, camadas…" oninput="MZ.q=this.value;mzRefreshLeft()"></div><div class="mz-left-c" id="mzLeftC"></div></aside>
    <main class="mz-center"><div id="mzCompBar" class="mz-compbar" style="display:none"></div><div id="mzAiBar" class="mz-aibar" style="display:none"></div><div class="mz-cwrap"><canvas id="mzRulerT" class="mz-ruler t"></canvas><canvas id="mzRulerL" class="mz-ruler l"></canvas><div id="mzCanvas" class="mz-canvas"><div id="mzFrames" class="mz-frames"></div></div></div></main>
    <aside class="mz-right"><div class="mz-tabs" id="mzRightTabs">${MZ_TABS.map(([k, n]) => `<button data-rt="${k}" class="${k === MZ.tab ? 'on' : ''}" onclick="mzRightTab('${k}')">${n}</button>`).join('')}</div><div class="mz-right-c" id="mzRightC"></div></aside>
  </div>`;
}
function mzPageSelUpdate() { const s = document.getElementById('mzPageSel'); if (!s) return; const m = mzM(); s.innerHTML = m.pages.map(p => `<option value="${p.id}" ${p.id === m.cur ? 'selected' : ''}>${esc(p.name)}${p.home ? ' · início' : ''}</option>`).join(''); }

/* ---------- painel esquerdo ---------- */
function mzLeftTab(k) { MZ.left = k; document.querySelectorAll('#mzLeftTabs button').forEach(b => b.classList.toggle('on', b.dataset.lt === k)); mzRefreshLeft(); }
function mzRefreshLeft() {
  const c = document.getElementById('mzLeftC'); if (!c) return; const q = dnorm(MZ.q), ok = t => !q || dnorm(t).includes(q), favs = mzM().favs;
  const card = (key, spec, ic, name) => `<div class="mz-card" onpointerdown='mzLibDrag(event,${esc(JSON.stringify(spec))})' title="Arraste para a página ou clique para inserir"><i>${mzI(ic, 24)}</i><span>${esc(name)}</span><button class="mz-fav ${favs.includes(key) ? 'on' : ''}" onpointerdown="event.stopPropagation()" onclick="event.stopPropagation();mzFav('${key}')" title="Favorito">★</button></div>`;
  if (MZ.left === 'elements') {
    const els = MZ_EL.filter(e => ok(e.name)), grp = (t, a) => a.length ? `<h4>${t}</h4><div class="mz-grid">${a.map(e => card('el:' + e.id, {kind: 'el', id: e.id, type: e.id === 'columns2' || e.id === 'columns3' ? 'container' : (e.nodeType || e.id), label: e.name}, e.icon, e.name)).join('')}</div>` : '';
    c.innerHTML = grp('★ Favoritos', els.filter(e => favs.includes('el:' + e.id))) + grp('Básicos', els.filter(e => e.cat === 'basic')) + grp('Formas', els.filter(e => e.cat === 'shape')) + grp('Avançados', els.filter(e => e.cat === 'adv')) + (els.length ? '' : '<p class="muted">Nada encontrado.</p>');
  } else if (MZ.left === 'blocks') {
    const bl = MZ_BLOCKS.filter(b => ok(b.name));
    c.innerHTML = `<h4>Blocos prontos</h4><p class="mz-hint">Árvores de elementos básicos, preenchidas com o seu projeto. Você edita cada peça. O que falta está entre [colchetes].</p><div class="mz-grid one">${bl.map(b => card('pre:' + b.id, {kind: 'block', id: b.id, type: 'section', label: b.name}, b.icon, b.name)).join('')}</div>`;
  } else if (MZ.left === 'layers') { c.innerHTML = `<div id="mzTree" class="mz-tree"></div><div class="mz-tree-act"><button class="btn sm" onclick="mzMoveStep(-1)">↑</button><button class="btn sm" onclick="mzMoveStep(1)">↓</button><button class="btn sm" onclick="mzDup()">Duplicar</button><button class="btn sm" onclick="mzDelete()">Excluir</button></div>`; mzTreeRefresh(); }
  else if (MZ.left === 'lib') {
    const L = state.mesaLib.items.filter(i => ok(i.name)), comps = mzM().comps.filter(x => ok(x.name));
    c.innerHTML = `<h4>Componentes globais</h4>${comps.length ? `<div class="mz-grid one">${comps.map(x => `<div class="mz-card row" onpointerdown='mzLibDrag(event,${esc(JSON.stringify({kind: 'comp', id: x.id, type: 'component', label: x.name}))})'><i>${mzI('layers', 22)}</i><span>${esc(x.name)}</span><button onpointerdown="event.stopPropagation()" onclick="mzEditComp('${x.id}')" title="Editar o principal">✎</button><button onpointerdown="event.stopPropagation()" onclick="mzDeleteComp('${x.id}')" title="Excluir">🗑</button></div>`).join('')}</div>` : '<p class="mz-hint">Selecione um elemento e use “Criar componente global”. Editar o principal atualiza todas as páginas.</p>'}
      <h4>Minha biblioteca <small>(vale para todos os projetos)</small></h4><div class="row-gap" style="flex-wrap:wrap;margin-bottom:8px"><button class="btn sm" onclick="mzSaveLib()">Salvar seleção</button><button class="btn sm" onclick="mzSaveLib('page')">Salvar página</button></div>
      ${L.length ? `<div class="mz-grid one">${L.map(i => `<div class="mz-card row" onpointerdown='mzLibDrag(event,${esc(JSON.stringify({kind: 'lib', id: i.id, type: i.kind === 'page' ? 'section' : i.root.type, label: i.name}))})'><i>${mzI(i.kind === 'page' ? 'file' : 'layers', 22)}</i><span>${esc(i.name)}<small>${({section: 'seção', component: 'componente', block: 'bloco', page: 'página'})[i.kind]} · ${esc(i.from || '')}</small></span><button onpointerdown="event.stopPropagation()" onclick="mzDelLib('${i.id}')" title="Remover">🗑</button></div>`).join('')}</div>` : '<p class="mz-hint">Nada salvo ainda.</p>'}`;
  } else if (MZ.left === 'assets') {
    const imgs = libList().filter(i => ok(i.name + ' ' + (i.prompt || ''))).slice(0, 60);
    c.innerHTML = `<h4>Imagens do Studio</h4><div class="row-gap" style="margin-bottom:8px"><button class="btn sm" onclick="mzUploadAsset()">＋ Subir imagem</button></div>${imgs.length ? `<div class="mz-imgs">${imgs.map(i => `<button class="mz-imgb" title="${esc(i.name)}" onclick="mzUseAsset('${i.imgId}')"><img data-lib="${i.imgId}" alt=""></button>`).join('')}</div>` : '<p class="mz-hint">Sem imagens na biblioteca do Studio.</p>'}
      <h4>Ícones</h4><div class="mz-icons">${Object.keys(MZ_ICONS).filter(k => ok(k)).map(k => `<button title="${k}" onclick="mzUseIcon('${k}')">${mzI(k, 22)}</button>`).join('')}</div>
      <h4>Fontes</h4><div class="mz-fonts">${MZ_FONT_LIST.filter(ok).map(f => `<button style="font-family:'${f}',system-ui" onclick="mzUseFont('${f}')">${f}</button>`).join('')}</div>`;
    libFill(c);
  }
}
function mzUploadAsset() { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/png,image/jpeg,image/webp,image/svg+xml'; i.onchange = async () => { if (!i.files[0]) return; try { await libAddBlob(i.files[0], {name: i.files[0].name.replace(/\.[^.]+$/, '')}); mzRefreshLeft(); } catch (e) { toast(e.message); } }; i.click(); }
function mzUseAsset(imgId) { const n = mzSelNode(); if (n && (n.type === 'image' || n.type === 'logo')) { n.props.imgId = imgId; mzCommit({panels: true}); return; } const node = MZ_EL.find(e => e.id === 'image').make(); node.props.imgId = imgId; const drop = mzDefaultDrop('image'), root = mzRoot(); let nd = node; if (drop.wrap && root.type === 'page') nd = MZB.sec([node], {minHeight: 80}); drop.parent.children.splice(drop.index, 0, nd); MZ.sel = node.id; mzCommit({panels: true}); }
function mzUseIcon(name) { const n = mzSelNode(); if (n && (n.type === 'icon')) { n.props.name = name; mzCommit({panels: true}); return; } mzInsertSpec({kind: 'el', id: 'icon', type: 'icon'}); const s = mzSelNode(); if (s && s.type === 'icon') { s.props.name = name; mzCommit({panels: true}); } }
function mzUseFont(f) { const n = mzSelNode(); if (!n) { toast('Selecione um elemento, ou defina as fontes no Design System.'); return; } mzSetStyle('fontFamily', `'${f}',system-ui,sans-serif`); mzRefreshPanels(); }

/* ---------- camadas ---------- */
function mzTreeRefresh() {
  const t = document.getElementById('mzTree'); if (!t || !MZ.open) return; const root = mzRoot(), q = dnorm(MZ.q), rows = [];
  const walk = (n, d, parent) => { const open = MZ.cols[n.id] !== true; const name = n.name || MZ_NAMES[n.type] || n.type; const show = !q || dnorm(name).includes(q);
    if (n.type !== 'page' || true) rows.push(`<div class="mz-row ${MZ.sel === n.id ? 'on' : ''} ${n.hidden ? 'off' : ''}" data-id="${n.id}" style="padding-left:${6 + d * 14}px" onpointerdown="mzRowDown(event,'${n.id}')" ondblclick="mzRowRename('${n.id}')"><span class="mz-car ${n.children.length ? (open ? 'open' : '') : 'none'}" onpointerdown="event.stopPropagation()" onclick="mzRowFold('${n.id}')">▸</span><i>${mzI(({heading: 'star', text: 'file', image: 'camera', button: 'zap', video: 'play', icon: 'star', form: 'mail', list: 'check', menu: 'menu'})[n.type] || (mzIsCont(n) ? 'layers' : 'file'), 14)}</i><span class="nm">${esc(name)}</span><b onpointerdown="event.stopPropagation()" onclick="mzToggle('${n.id}','hidden')" title="${n.hidden ? 'Mostrar' : 'Ocultar'}">${n.hidden ? '🚫' : '👁'}</b><b onpointerdown="event.stopPropagation()" onclick="mzToggle('${n.id}','locked')" title="${n.locked ? 'Desbloquear' : 'Bloquear'}">${n.locked ? '🔒' : '🔓'}</b></div>`);
    if (open) n.children.forEach(c => walk(c, d + 1, n)); };
  walk(root, 0, null); t.innerHTML = rows.join('');
}
function mzRowFold(id) { MZ.cols[id] = MZ.cols[id] === true ? false : true; mzTreeRefresh(); }
function mzRowRename(id) { const f = mzFind(mzRoot(), id); if (!f) return; const nm = prompt('Nome da camada', f.node.name || MZ_NAMES[f.node.type]); if (nm != null) mzRename(id, nm); }
function mzRowDown(e, id) {
  if (e.button !== 0) return; mzSelect(id, {noTree: true}); document.querySelectorAll('#mzTree .mz-row').forEach(r => r.classList.toggle('on', r.dataset.id === id)); const f0 = mzFind(mzRoot(), id); if (!f0 || !f0.parent || f0.node.locked) return; const x0 = e.clientX, y0 = e.clientY; let on = false, tgt = null;
  const move = ev => { if (!on) { if (Math.hypot(ev.clientX - x0, ev.clientY - y0) < 5) return; on = true; mzGhost(true, MZ_NAMES[f0.node.type]); } const row = document.elementFromPoint(ev.clientX, ev.clientY); const r = row && row.closest && row.closest('.mz-row'); document.querySelectorAll('.mz-row.dz-b,.mz-row.dz-a,.mz-row.dz-i').forEach(x => x.classList.remove('dz-b', 'dz-a', 'dz-i')); tgt = null; if (!r || r.dataset.id === id) return; const tf = mzFind(mzRoot(), r.dataset.id); if (!tf || mzFind(f0.node, tf.node.id)) return; const b = r.getBoundingClientRect(), rel = (ev.clientY - b.top) / b.height, cont = mzIsCont(tf.node); if (rel < 0.28 && tf.parent) { tgt = {par: tf.parent, idx: tf.idx}; r.classList.add('dz-b'); } else if (rel > 0.72 && tf.parent) { tgt = {par: tf.parent, idx: tf.idx + 1}; r.classList.add('dz-a'); } else if (cont) { tgt = {par: tf.node, idx: tf.node.children.length}; r.classList.add('dz-i'); } };
  const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); mzGhost(false); document.querySelectorAll('.mz-row.dz-b,.mz-row.dz-a,.mz-row.dz-i').forEach(x => x.classList.remove('dz-b', 'dz-a', 'dz-i')); if (on && tgt) mzMoveNode(id, tgt.par.id, tgt.idx); };
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
}

/* ---------- painel direito ---------- */
function mzRightTab(k) { MZ.tab = k; document.querySelectorAll('#mzRightTabs button').forEach(b => b.classList.toggle('on', b.dataset.rt === k)); mzRefreshPanels(); }
function mzRefreshPanels() {
  const c = document.getElementById('mzRightC'); if (!c || !MZ.open) return; const n = mzSelNode(), keepTop = c.scrollTop; mzCompBanner();
  if (!n) { c.innerHTML = mzPageSettingsHtml(); c.scrollTop = 0; return; }
  const head = `<div class="mz-sel"><b>${esc(n.name || MZ_NAMES[n.type])}</b><small>${n.type}${MZ.bp !== 'd' ? ' · editando só ' + MZ_BPN[MZ.bp] : ''}</small><span><button class="mz-mini" onclick="mzDup()" title="Duplicar">⧉</button><button class="mz-mini" onclick="mzDelete()" title="Excluir">🗑</button></span></div>`;
  c.innerHTML = head + ({content: mzTabContent, style: mzTabStyle, layout: mzTabLayout, adv: mzTabAdv, resp: mzTabResp}[MZ.tab] || mzTabContent)(n); c.scrollTop = keepTop; if (typeof libFill === 'function') libFill(c);
}
function mzPageSettingsHtml() {
  const pg = mzPg(), g = pg.guides; return `<div class="mz-sel"><b>Página: ${esc(pg.name)}</b><small>Selecione um elemento para editar</small></div>
    <div class="mz-sec"><h5>SEO</h5>${mzTxt('Título da página', pg.seo.title, `mzPageSet('${pg.id}','seoTitle',this.value)`)}${mzArea('Descrição', pg.seo.desc, `mzPageSet('${pg.id}','seoDesc',this.value)`)}</div>
    <div class="mz-sec"><h5>Página</h5>${mzTxt('Nome', pg.name, `mzPageSet('${pg.id}','name',this.value);mzPageSelUpdate()`)}${mzTxt('Endereço (slug)', pg.slug, `mzPageSet('${pg.id}','slug',this.value)`)}<label class="mz-ck"><input type="checkbox" ${pg.home ? 'checked' : ''} onchange="mzPageSet('${pg.id}','home',1);mzPageSelUpdate()"> Página inicial</label><label class="mz-ck"><input type="checkbox" ${pg.priv ? 'checked' : ''} onchange="mzPageSet('${pg.id}','priv',this.checked)"> Privada (não indexar)</label><label class="mz-ck"><input type="checkbox" ${pg.kind === 'campaign' ? 'checked' : ''} onchange="mzPageSet('${pg.id}','kind',this.checked?'campaign':'page')"> Página de campanha</label>
    <label class="mz-f"><span>Cor de fundo da página</span><input type="color" value="${pg.bg || '#ffffff'}" oninput="mzPageSet('${pg.id}','bg',this.value)"></label></div>
    <div class="mz-sec"><h5>Adaptar tela</h5><p class="mz-hint">Arrume no Desktop; um clique ajusta Tablet e Celular (empilha colunas, reduz títulos e espaços). Só preenche o que você ainda não ajustou.</p><button class="btn sm dark" onclick="mzAutoAdaptPage()">↺ Adaptar a página inteira</button></div>
    <div class="mz-sec"><h5>Guias</h5><p class="mz-hint">Arraste das réguas (topo e lateral) para criar. ${g.v.length + g.h.length} guia(s).</p><button class="btn sm" onclick="mzGuidesClear()">Limpar guias</button> <label class="mz-ck inline"><input type="checkbox" ${MZ.guides ? 'checked' : ''} onchange="MZ.guides=this.checked;mzOverlayAll()"> Mostrar</label></div>
    <div class="mz-sec"><h5>Atalhos</h5><p class="mz-hint">Duplo clique: editar texto · Ctrl+D duplicar · Ctrl+C/V · Ctrl+G agrupar · Del excluir · [ ] ordem · Ctrl+Z/Y · Ctrl + roda: zoom · botão direito: menu</p></div>`;
}
function mzGuidesClear() { mzPg().guides = {v: [], h: []}; mzTouch(); mzOverlayAll(); mzRefreshPanels(); }
/* controles */
const mzTxt = (l, v, on, ph) => `<label class="mz-f"><span>${l}</span><input value="${esc(v)}" ${ph ? `placeholder="${esc(ph)}"` : ''} onchange="${on}"></label>`;
const mzArea = (l, v, on, rows) => `<label class="mz-f"><span>${l}</span><textarea rows="${rows || 3}" onchange="${on}">${esc(v)}</textarea></label>`;
const mzSel = (l, v, opts, on) => `<label class="mz-f"><span>${l}</span><select onchange="${on}">${opts.map(o => `<option value="${esc(o[0])}" ${String(o[0]) === String(v) ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select></label>`;
function mzOwnMark(n, k) { const own = n.style[MZ.bp] && n.style[MZ.bp][k] != null; if (!own) return ''; return `<button class="mz-rs" title="${MZ.bp === 'd' ? 'Limpar' : 'Restaurar o valor herdado'}" onclick="mzResetStyle('${k}');">${MZ.bp === 'd' ? '×' : '↺'}</button>`; }
function mzStV(n, k) { const v = mzStyleAt(n, MZ.bp)[k]; return v == null ? '' : String(v); }
function mzNum(n, k, l, ph) { const own = n.style[MZ.bp] && n.style[MZ.bp][k] != null; return `<label class="mz-f s ${own ? 'own' : ''}"><span>${l}${mzOwnMark(n, k)}</span><input value="${esc(mzStV(n, k))}" placeholder="${esc(ph || 'auto')}" onchange="mzSetStyle('${k}',this.value)"></label>`; }
function mzSwatches(k) { const ds = mzM().ds, sw = Object.keys(ds.colors).map(c => ({n: c, v: `var(--mz-c-${c})`, h: ds.colors[c]})).concat(ds.extra.map((e, i) => ({n: e.name, v: `var(--mz-c-x${i + 1})`, h: e.value}))); return `<div class="mz-sw">${sw.map(s => `<button title="${esc(s.n)}" style="background:${s.h}" onclick="mzSetStyle('${k}','${s.v}');mzRefreshPanels()"></button>`).join('')}</div>`; }
function mzCol(n, k, l) { const v = mzStV(n, k), h = /^#[0-9a-f]{6}$/i.test(v) ? v : (/var\(--mz-c-(\w+)\)/.exec(v) ? (mzM().ds.colors[/var\(--mz-c-(\w+)\)/.exec(v)[1]] || '#000000') : '#000000'); return `<div class="mz-f s ${n.style[MZ.bp] && n.style[MZ.bp][k] != null ? 'own' : ''}"><span>${l}${mzOwnMark(n, k)}</span><div class="mz-colr"><input type="color" value="${h}" oninput="mzSetStyle('${k}',this.value)"><input class="hex" value="${esc(v)}" placeholder="—" onchange="mzSetStyle('${k}',this.value);mzRefreshPanels()"></div>${mzSwatches(k)}</div>`; }
function mzSeg(n, k, l, opts) { const v = mzStV(n, k); return `<div class="mz-f s"><span>${l}${mzOwnMark(n, k)}</span><div class="mz-seg">${opts.map(o => `<button class="${v === o[0] ? 'on' : ''}" title="${o[2] || o[1]}" onclick="mzSetStyle('${k}','${o[0]}');mzRefreshPanels()">${o[1]}</button>`).join('')}</div></div>`; }
function mzSelS(n, k, l, opts) { return mzSel(l + mzOwnMark(n, k), mzStV(n, k), [['', '—']].concat(opts), `mzSetStyle('${k}',this.value)`); }
function mzBoxVals(n, k) {
  const sh = mzStV(n, k), parts = String(sh).trim().split(/\s+/).filter(Boolean), ex = parts.length === 1 ? [parts[0], parts[0], parts[0], parts[0]] : parts.length === 2 ? [parts[0], parts[1], parts[0], parts[1]] : parts.length === 3 ? [parts[0], parts[1], parts[2], parts[1]] : parts.length >= 4 ? parts.slice(0, 4) : ['', '', '', ''];
  return ['Top', 'Right', 'Bottom', 'Left'].map((s, i) => mzStV(n, k + s) || (sh ? ex[i] : ''));
}
function mzBox(n, k, l) { const v = mzBoxVals(n, k).map(x => String(x).replace(/px$/, '')); const cell = (i, s) => `<input value="${esc(v[i])}" placeholder="0" title="${['Cima', 'Direita', 'Baixo', 'Esquerda'][i]}" onchange="mzBoxSet('${k}','${s}',this.value)">`; return `<div class="mz-f s"><span>${l}</span><div class="mz-boxg"><div></div>${cell(0, 'Top')}<div></div>${cell(3, 'Left')}<div class="mid">${l[0]}</div>${cell(1, 'Right')}<div></div>${cell(2, 'Bottom')}<div></div></div></div>`; }
function mzBoxSet(k, side, v) { const n = mzSelNode(); if (!n) return; const vals = mzBoxVals(n, k).map(x => String(x || '0')), i = ['Top', 'Right', 'Bottom', 'Left'].indexOf(side); vals[i] = /^-?[\d.]+$/.test(String(v).trim()) ? (+v) + 'px' : (String(v).trim() || '0'); const o = mzStyleSet(n, MZ.bp); ['Top', 'Right', 'Bottom', 'Left'].forEach(s2 => { delete o[k + s2]; }); const val = vals.map(x => /^-?[\d.]+$/.test(x) ? x + 'px' : x).join(' '), cv = mzCssVal(k, val); if (cv) o[k] = cv; mzCommit({panels: true}); }
function mzSection(t, body, open) { return `<details class="mz-sec" ${open === false ? '' : 'open'}><summary>${t}</summary>${body}</details>`; }
/* Conteúdo */
function mzTabContent(n) {
  const F = MZ_FIELDS[n.type] || [], P = n.props; let h = '';
  if (n.type === 'component') h += `<div class="mz-sec"><p class="mz-hint">Instância de um componente global. Para mudar, edite o principal: vale para todas as páginas.</p><button class="btn sm dark" onclick="mzEditComp('${P.ref}')">Editar o principal</button> <button class="btn sm" onclick="mzDetachComp()">Desvincular (virar cópia)</button></div>`;
  if (!F.length && n.type !== 'component') h += `<div class="mz-sec"><p class="mz-hint">${mzIsCont(n) ? 'Este é um contêiner. Arraste elementos para dentro dele e use as abas Estilo e Layout.' : 'Sem campos de conteúdo.'}</p></div>`;
  h += F.map(f => mzField(n, f)).join(''); if (n.type === 'text') h += `<p class="mz-hint">Duplo clique no texto, no canvas, para formatar (negrito, itálico, link, cor, lista).</p>`;
  if (['heading', 'text', 'button', 'badge', 'list'].includes(n.type)) h += `<div class="mz-sec"><button class="btn sm" onclick="mzAiRewrite()">✨ Melhorar este texto</button></div>`;
  return `<div class="mz-sec">${h}</div>`;
}
function mzField(n, f) {
  const v = n.props[f.k], on = `mzSetProp('${f.k}',this.value)`;
  switch (f.t) {
    case 'text': case 'url': return mzTxt(f.l, v, on);
    case 'area': return mzArea(f.l, v, on);
    case 'rich': return mzArea(f.l, v, on, 5);
    case 'num': return `<label class="mz-f"><span>${f.l}</span><input type="number" value="${esc(v)}" onchange="mzSetProp('${f.k}',+this.value)"></label>`;
    case 'bool': return `<label class="mz-ck"><input type="checkbox" ${v ? 'checked' : ''} onchange="mzSetProp('${f.k}',this.checked)"> ${f.l}</label>`;
    case 'sel': return mzSel(f.l, v, f.o, `mzSetProp('${f.k}',${typeof f.o[0][0] === 'number' ? '+' : ''}this.value)`);
    case 'datetime': return `<label class="mz-f"><span>${f.l}</span><input type="datetime-local" value="${esc(v)}" onchange="mzSetProp('${f.k}',this.value)"></label>`;
    case 'img': return `<div class="mz-f"><span>${f.l}</span><div class="mz-imgsel">${v ? `<img data-lib="${esc(v)}" alt="">` : '<em>sem imagem</em>'}<button class="btn sm" onclick="mzChooseImg('${f.k}')">${v ? 'Trocar' : 'Escolher'}</button>${v ? `<button class="btn sm" onclick="mzSetProp('${f.k}','',{panels:true})">Remover</button>` : ''}</div></div>`;
    case 'imgs': return `<div class="mz-f"><span>${f.l} (${(v || []).length})</span><div class="mz-imgsel">${(v || []).slice(0, 6).map(i => `<img data-lib="${esc(i)}" alt="">`).join('')}<button class="btn sm" onclick="mzAddGalleryImg()">＋ Adicionar</button>${(v || []).length ? `<button class="btn sm" onclick="mzSetProp('imgs',[],{panels:true})">Limpar</button>` : ''}</div></div>`;
    case 'icon': return `<div class="mz-f"><span>${f.l}</span><div class="mz-icons sm">${f.k === 'icon' ? `<button class="${!v ? 'on' : ''}" onclick="mzSetProp('icon','',{panels:true})">∅</button>` : ''}${Object.keys(MZ_ICONS).map(k => `<button class="${v === k ? 'on' : ''}" title="${k}" onclick="mzSetProp('${f.k}','${k}',{panels:true})">${mzI(k, 18)}</button>`).join('')}</div></div>`;
    case 'lines': return mzArea(f.l, (v || []).join('\n'), `mzSetProp('${f.k}',this.value.split('\\n').map(function(x){return x.trim()}).filter(Boolean))`, 5);
    case 'pairs': return mzArea(f.l, (v || []).map(i => i.label + ' | ' + i.href).join('\n'), `mzSetProp('${f.k}',this.value.split('\\n').map(function(l){var p=l.split('|');return {label:(p[0]||'').trim(),href:(p[1]||'#').trim()}}).filter(function(x){return x.label}))`, 5);
    case 'qa': return mzArea(f.l, (v || []).map(i => i.q + ' :: ' + i.a.replace(/<[^>]+>/g, '')).join('\n'), `mzSetProp('${f.k}',this.value.split('\\n').map(function(l){var p=l.split('::');return {q:(p[0]||'').trim(),a:(p.slice(1).join('::')||'').trim()}}).filter(function(x){return x.q}))`, 6);
    case 'tabs': return mzArea(f.l, (v || []).map(i => i.t + ' :: ' + i.c.replace(/<[^>]+>/g, '')).join('\n'), `mzSetProp('${f.k}',this.value.split('\\n').map(function(l){var p=l.split('::');return {t:(p[0]||'').trim(),c:(p.slice(1).join('::')||'').trim()}}).filter(function(x){return x.t}))`, 6);
    case 'table': return mzArea(f.l, (v || []).map(r => r.join(' | ')).join('\n'), `mzSetProp('${f.k}',this.value.split('\\n').map(function(l){return l.split('|').map(function(c){return c.trim()})}).filter(function(r){return r.join('')}))`, 6);
    case 'tl': return mzArea(f.l, (v || []).map(i => [i.w, i.t, i.d].join(' | ')).join('\n'), `mzSetProp('${f.k}',this.value.split('\\n').map(function(l){var p=l.split('|');return {w:(p[0]||'').trim(),t:(p[1]||'').trim(),d:(p[2]||'').trim()}}).filter(function(x){return x.t}))`, 6);
  }
  return '';
}
function mzChooseImg(k) { libPick(r => { const li = libItem(r); mzSetProp(k, li ? li.imgId : r, {panels: true}); }, {raw: true, title: 'Escolher imagem'}); }
function mzAddGalleryImg() { libPick(r => { const li = libItem(r), n = mzSelNode(); if (!n) return; mzSetProp('imgs', (n.props.imgs || []).concat([li ? li.imgId : r]), {panels: true}); }, {raw: true, title: 'Adicionar à galeria'}); }
/* Estilo */
function mzTabStyle(n) {
  const sc = mzM().ds;
  return mzSection('Tipografia', mzSel('Estilo do Design System' , n.typo || '', [['', 'Padrão do elemento'], ['h1', 'Título 1'], ['h2', 'Título 2'], ['h3', 'Título 3'], ['body', 'Texto'], ['small', 'Pequeno'], ['button', 'Botão'], ['none', 'Nenhum (livre)']], `mzSetNodeField('typo',this.value)`) +
    mzNum(n, 'fontSize', 'Tamanho (px)') + mzSelS(n, 'fontWeight', 'Peso', [['300', 'Fino'], ['400', 'Normal'], ['500', 'Médio'], ['600', 'Seminegrito'], ['700', 'Negrito'], ['800', 'Extranegrito'], ['900', 'Preto']]) + mzNum(n, 'lineHeight', 'Entrelinha', '1.5') + mzNum(n, 'letterSpacing', 'Espaçamento (px)', '0') +
    mzSeg(n, 'textAlign', 'Alinhamento', [['left', '⟸'], ['center', '≡'], ['right', '⟹'], ['justify', '☰']]) + mzSelS(n, 'textTransform', 'Caixa', [['none', 'Normal'], ['uppercase', 'MAIÚSCULAS'], ['lowercase', 'minúsculas'], ['capitalize', 'Capitalizar']]) + mzSelS(n, 'textDecoration', 'Decoração', [['none', 'Nenhuma'], ['underline', 'Sublinhado'], ['line-through', 'Riscado']]) + mzSelS(n, 'fontStyle', 'Estilo', [['normal', 'Normal'], ['italic', 'Itálico']]) + mzCol(n, 'color', 'Cor do texto')) +
    mzSection('Fundo', mzCol(n, 'backgroundColor', 'Cor') + mzTxt('Gradiente ou imagem (CSS)', mzStV(n, 'backgroundImage'), `mzSetStyle('backgroundImage',this.value)`, 'linear-gradient(135deg,#111,#e4572e)') + `<div class="row-gap" style="margin:4px 0 8px"><button class="btn sm" onclick="mzBgPick()">Imagem da biblioteca</button><button class="btn sm" onclick="mzSetStyle('backgroundImage','');mzRefreshPanels()">Limpar</button></div>` + mzSelS(n, 'backgroundSize', 'Tamanho', [['cover', 'Cobrir'], ['contain', 'Conter'], ['auto', 'Automático']]) + mzSelS(n, 'backgroundPosition', 'Posição', [['center', 'Centro'], ['top', 'Topo'], ['bottom', 'Base'], ['left', 'Esquerda'], ['right', 'Direita']]) + mzSelS(n, 'backgroundRepeat', 'Repetir', [['no-repeat', 'Não'], ['repeat', 'Sim']]), false) +
    mzSection('Borda', mzNum(n, 'borderWidth', 'Espessura (px)', '0') + mzSelS(n, 'borderStyle', 'Estilo', [['none', 'Nenhuma'], ['solid', 'Sólida'], ['dashed', 'Tracejada'], ['dotted', 'Pontilhada']]) + mzCol(n, 'borderColor', 'Cor') + mzNum(n, 'borderRadius', 'Cantos (px)', '0') + `<div class="mz-sw rad">${[['sm', 'P'], ['md', 'M'], ['lg', 'G']].map(r => `<button onclick="mzSetStyle('borderRadius','var(--mz-r-${r[0]})');mzRefreshPanels()">${r[1]}</button>`).join('')}</div>`, false) +
    mzSection('Sombra e efeitos', mzSelS(n, 'boxShadow', 'Sombra', [['none', 'Nenhuma'], ['var(--mz-sh-sm)', 'Pequena'], ['var(--mz-sh-md)', 'Média'], ['var(--mz-sh-lg)', 'Grande']]) + mzNum(n, 'opacity', 'Opacidade (0 a 1)', '1') + mzTxt('Filtro (blur, brilho…)', mzStV(n, 'filter'), `mzSetStyle('filter',this.value)`, 'blur(4px) brightness(1.1)') + mzSelS(n, 'objectFit', 'Ajuste da imagem', [['cover', 'Cobrir'], ['contain', 'Conter'], ['fill', 'Preencher']]), false);
}
function mzBgPick() { libPick(r => { const li = libItem(r); mzSetStyles({backgroundImage: `url(mzimg:${li ? li.imgId : r})`, backgroundSize: 'cover', backgroundPosition: 'center'}); }, {raw: true, title: 'Imagem de fundo'}); }
/* Layout */
function mzTabLayout(n) {
  const st = mzStyleAt(n, MZ.bp), disp = st.display || '', flex = disp.includes('flex'), grid = disp.includes('grid'), cont = mzIsCont(n);
  return (cont ? mzSection('Disposição', mzSeg(n, 'display', 'Tipo', [['block', '▭', 'Bloco'], ['flex', '⇄', 'Flex'], ['grid', '▦', 'Grade'], ['none', '∅', 'Oculto']]) +
    (flex ? mzSeg(n, 'flexDirection', 'Direção', [['row', '→', 'Linha'], ['column', '↓', 'Coluna'], ['row-reverse', '←', 'Linha invertida'], ['column-reverse', '↑', 'Coluna invertida']]) + mzSeg(n, 'flexWrap', 'Quebra', [['nowrap', 'Não'], ['wrap', 'Sim']]) + mzSelS(n, 'justifyContent', 'Alinhar (eixo principal)', [['flex-start', 'Início'], ['center', 'Centro'], ['flex-end', 'Fim'], ['space-between', 'Espaço entre'], ['space-around', 'Espaço ao redor']]) + mzSelS(n, 'alignItems', 'Alinhar (cruzado)', [['stretch', 'Esticar'], ['flex-start', 'Início'], ['center', 'Centro'], ['flex-end', 'Fim']]) : '') +
    (grid ? mzTxt('Colunas (CSS)', mzStV(n, 'gridTemplateColumns'), `mzSetStyle('gridTemplateColumns',this.value)`, 'repeat(3,1fr)') + `<div class="mz-sw rad">${[1, 2, 3, 4].map(c => `<button onclick="mzSetStyle('gridTemplateColumns','repeat(${c},1fr)');mzRefreshPanels()">${c}</button>`).join('')}</div>` : '') + (flex || grid ? mzNum(n, 'gap', 'Espaço entre itens (px)', '0') : '')) : '') +
    mzSection('Tamanho', mzNum(n, 'width', 'Largura', 'auto') + mzNum(n, 'height', 'Altura', 'auto') + mzNum(n, 'minWidth', 'Largura mín.') + mzNum(n, 'maxWidth', 'Largura máx.') + mzNum(n, 'minHeight', 'Altura mín.') + mzNum(n, 'maxHeight', 'Altura máx.') + mzNum(n, 'aspectRatio', 'Proporção', '16/9')) +
    mzSection('Espaçamento', mzBox(n, 'padding', 'Padding (interno)') + mzBox(n, 'margin', 'Margin (externo)')) +
    mzSection('Como este elemento se comporta no pai', mzNum(n, 'flex', 'Flex (ex.: 1 1 50%)', '') + mzSelS(n, 'alignSelf', 'Alinhar a si mesmo', [['auto', 'Automático'], ['flex-start', 'Início'], ['center', 'Centro'], ['flex-end', 'Fim'], ['stretch', 'Esticar']]) + mzNum(n, 'order', 'Ordem', '0') + mzTxt('Posição na grade (coluna)', mzStV(n, 'gridColumn'), `mzSetStyle('gridColumn',this.value)`, 'span 2'), false) +
    mzSection('Posição', mzSelS(n, 'position', 'Tipo', [['static', 'Normal'], ['relative', 'Relativa'], ['absolute', 'Absoluta (livre)'], ['sticky', 'Fixa ao rolar (sticky)'], ['fixed', 'Fixa na tela']]) + (['absolute', 'relative', 'sticky', 'fixed'].includes(st.position) ? mzNum(n, 'top', 'Topo') + mzNum(n, 'left', 'Esquerda') + mzNum(n, 'right', 'Direita') + mzNum(n, 'bottom', 'Base') + mzNum(n, 'zIndex', 'Camada (z-index)') + (st.position === 'absolute' ? '<p class="mz-hint">Absoluta: arraste no canvas ou use as setas (Shift = 10 px).</p>' : '') : '') + mzSelS(n, 'overflow', 'Estouro', [['visible', 'Visível'], ['hidden', 'Cortar'], ['auto', 'Rolar']]), false);
}
/* Avançado */
function mzTabAdv(n) {
  return mzSection('Identificação', mzTxt('Nome da camada', n.name, `mzSetNodeField('name',this.value);mzTreeRefresh()`) + mzTxt('ID (âncora)', n.htmlId, `mzSetNodeField('htmlId',this.value)`, 'ex.: contato') + mzTxt('Classes CSS', n.cls, `mzSetNodeField('cls',this.value)`) + mzArea('Atributos (chave=valor, um por linha)', Object.keys(n.attrs).map(k => k + '=' + n.attrs[k]).join('\n'), `mzSetNodeField('attrs',this.value)`, 3)) +
    mzSection('CSS personalizado', mzArea('Regras (use “self” para este elemento)', n.css, `mzSetNodeField('css',this.value)`, 5) + '<p class="mz-hint">Exemplo: <code>self:hover{opacity:.8}</code>. Sem @import nem scripts.</p>', false) +
    mzSection('Animação ao aparecer', mzSel('Tipo', n.anim.type, [['', 'Nenhuma'], ['fade', 'Surgir'], ['up', 'Subir'], ['down', 'Descer'], ['left', 'Da esquerda'], ['right', 'Da direita'], ['zoom', 'Zoom']], `mzSetAnim('type',this.value)`) + `<label class="mz-f s"><span>Duração (ms)</span><input type="number" value="${n.anim.dur}" onchange="mzSetAnim('dur',this.value)"></label><label class="mz-f s"><span>Atraso (ms)</span><input type="number" value="${n.anim.delay}" onchange="mzSetAnim('delay',this.value)"></label><p class="mz-hint">A animação só roda na página publicada e na prévia.</p>`, false) +
    mzSection('Condições de visibilidade', `<label class="mz-ck"><input type="checkbox" ${n.vis.d ? 'checked' : ''} onchange="mzSetVis('d',this.checked)"> Mostrar no desktop</label><label class="mz-ck"><input type="checkbox" ${n.vis.t ? 'checked' : ''} onchange="mzSetVis('t',this.checked)"> Mostrar no tablet</label><label class="mz-ck"><input type="checkbox" ${n.vis.m ? 'checked' : ''} onchange="mzSetVis('m',this.checked)"> Mostrar no celular</label><label class="mz-f s"><span>A partir de</span><input type="datetime-local" value="${esc(n.vis.from)}" onchange="mzSetVis('from',this.value)"></label><label class="mz-f s"><span>Até</span><input type="datetime-local" value="${esc(n.vis.to)}" onchange="mzSetVis('to',this.value)"></label>${mzTxt('Só se o endereço tiver o parâmetro', n.vis.param, `mzSetVis('param',this.value)`, 'ex.: oferta (…?oferta)')}`, false);
}
/* Responsivo */
function mzTabResp(n) {
  const bps = ['d', 't', 'm'], own = bp => Object.keys(n.style[bp] || {});
  return `<div class="mz-sec"><p class="mz-hint">O desktop é a base. Tablet (até 1024 px) e celular (até 767 px) <b>só sobrescrevem</b> o que você mudar neles. Escolha o tamanho na barra de cima e edite normalmente.</p>
    ${bps.map(bp => `<div class="mz-resp ${MZ.bp === bp ? 'on' : ''}"><div class="mz-resp-h"><b>${MZ_BPN[bp]}</b><span>${MZ_BP[bp]} px</span><button class="btn sm" onclick="mzSetBp('${bp}')">Editar aqui</button></div>${own(bp).length ? `<div class="mz-chips">${own(bp).map(k => `<span>${esc(k)} <button title="${bp === 'd' ? 'Limpar' : 'Restaurar herdado'}" onclick="mzResetStyle('${k}','${bp}')">↺</button></span>`).join('')}</div>` : `<small class="muted">${bp === 'd' ? 'Sem estilos próprios.' : 'Herda tudo do desktop.'}</small>`}</div>`).join('')}
    ${MZ.bp !== 'd' ? `<div class="row-gap" style="margin-top:8px"><button class="btn sm" onclick="mzCopyStyle('d',MZ.bp)">Copiar do desktop para ${MZ_BPN[MZ.bp]}</button><button class="btn sm" onclick="mzClearBp('${MZ.bp}')">Limpar ${MZ_BPN[MZ.bp]}</button></div>` : ''}
    <h5 style="margin-top:14px">Visibilidade</h5>${['d', 't', 'm'].map(bp => `<label class="mz-ck"><input type="checkbox" ${n.vis[bp] ? 'checked' : ''} onchange="mzSetVis('${bp}',this.checked)"> Mostrar no ${MZ_BPN[bp].toLowerCase()}</label>`).join('')}</div>`;
}
function mzCopyStyle(from, to) { const n = mzSelNode(); if (!n) return; n.style[to] = Object.assign({}, n.style[from]); mzCommit({panels: true}); }
function mzClearBp(bp) { const n = mzSelNode(); if (!n) return; n.style[bp] = {}; mzCommit({panels: true}); }

/* ---------- réguas e guias ---------- */
function mzRulers() {
  const cv = document.getElementById('mzCanvas'), rt = document.getElementById('mzRulerT'), rl = document.getElementById('mzRulerL'); if (!cv || !rt || !rl) return; const fr = Object.values(MZ.frames)[0]; if (!fr) return;
  const cr = cv.getBoundingClientRect(), W = cv.clientWidth, H = cv.clientHeight, dpr = devicePixelRatio || 1, z = fr.z || mzZ(), fb = fr.ifr.getBoundingClientRect();
  rt.width = W * dpr; rt.height = 18 * dpr; rt.style.width = W + 'px'; rt.style.height = '18px'; rl.width = 18 * dpr; rl.height = H * dpr; rl.style.width = '18px'; rl.style.height = H + 'px';
  const draw = (c, horiz) => { const g = c.getContext('2d'); g.scale(dpr, dpr); g.fillStyle = '#f2f2f5'; g.fillRect(0, 0, horiz ? W : 18, horiz ? 18 : H); g.fillStyle = '#6b6f7a'; g.strokeStyle = '#9aa0ab'; g.font = '9px system-ui'; g.lineWidth = 1; const step = z < 0.4 ? 200 : z < 0.8 ? 100 : 50, o = horiz ? fb.left - cr.left : fb.top - cr.top, len = horiz ? W : H;
    for (let v = -2000; v < 6000; v += step / 5) { const p = o + v * z; if (p < 18 || p > len) continue; const major = v % step === 0; g.beginPath(); if (horiz) { g.moveTo(p + .5, major ? 6 : 12); g.lineTo(p + .5, 18); } else { g.moveTo(major ? 6 : 12, p + .5); g.lineTo(18, p + .5); } g.stroke(); if (major) { if (horiz) g.fillText(String(v), p + 3, 9); else { g.save(); g.translate(9, p - 3); g.rotate(-Math.PI / 2); g.fillText(String(v), 0, 0); g.restore(); } } } };
  draw(rt, true); draw(rl, false); if (!rt.dataset.b) { rt.dataset.b = 1; rl.dataset.b = 1; [[rt, true], [rl, false]].forEach(([r, hz]) => r.addEventListener('pointerdown', e => mzGuideDrag(e, hz))); }
}
function mzGuideDrag(e, horiz) {   // horiz = régua de cima: a guia criada é horizontal (linha ao longo da largura)
  const fr = MZ.frames[MZ.bp] || Object.values(MZ.frames)[0]; if (!fr) return; e.preventDefault(); const ln = document.createElement('div'); ln.className = 'mz-gline ' + (horiz ? 'h' : 'v'); document.body.appendChild(ln); const L = [];
  const mv = ev => { if (horiz) ln.style.top = ev.clientY + 'px'; else ln.style.left = ev.clientX + 'px'; };
  const up = ev => { L.forEach(([t, ty, h]) => t.removeEventListener(ty, h, true)); ln.remove(); const cv = document.getElementById('mzCanvas').getBoundingClientRect(); if (horiz ? ev.clientY < cv.top + 24 : ev.clientX < cv.left + 24) return; const p = mzToFrame(fr, ev.clientX, ev.clientY), g = mzPg().guides; if (horiz) g.h.push(Math.round(p.y)); else g.v.push(Math.round(p.x)); mzTouch(); mzOverlayAll(); mzRefreshPanels(); };
  const hook = (t, conv) => { const m = ev => mv(conv(ev)), u = ev => up(conv(ev)); [['pointermove', m], ['pointerup', u], ['pointercancel', u]].forEach(([ty, h]) => { t.addEventListener(ty, h, true); L.push([t, ty, h]); }); };
  mv(e); hook(document, ev => ev); Object.values(MZ.frames).forEach(f => { if (f.doc) hook(f.doc, ev => { const b = f.ifr.getBoundingClientRect(), z = f.z || 1; return {clientX: b.left + ev.clientX * z, clientY: b.top + ev.clientY * z}; }); });
}
