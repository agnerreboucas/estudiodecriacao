/* ===== Mesa de edição · ações =====
   Inserir, mover, duplicar, excluir, copiar/colar, agrupar, componentes globais, biblioteca do usuário, propriedades, páginas, versões e menu de contexto. */
const mzList = () => (MZ.p && MZ.p.mesa) ? MZ.p.mesa : null;
function mzMakeSpec(spec) {
  if (spec.kind === 'el') { const e = MZ_EL.find(x => x.id === spec.id); return e ? e.make() : null; }
  if (spec.kind === 'block') return mzBuildBlock(spec.id, mzCtx(MZ.p));
  if (spec.kind === 'lib') { const it = state.mesaLib.items.find(x => x.id === spec.id); return it ? (it.kind === 'page' ? Object.assign(mzFresh(it.root), {type: 'section', props: Object.assign({}, it.root.props, {boxed: true})}) : mzFresh(it.root)) : null; }
  if (spec.kind === 'comp') return mzNode('component', {ref: spec.id});
  if (spec.kind === 'tpl') { const r = mzBuildTemplate(spec.id, mzCtx(MZ.p)); return r; }
  return null;
}
function mzSpecType(spec) { if (spec.kind === 'block') return 'section'; if (spec.kind === 'lib') { const it = state.mesaLib.items.find(x => x.id === spec.id); return it ? (it.kind === 'page' ? 'section' : it.root.type) : 'div'; } if (spec.kind === 'comp') return 'component'; return spec.type || (MZ_EL.find(x => x.id === spec.id) || {}).id || 'div'; }
function mzDefaultDrop(type) {
  const root = mzRoot(), page = root.type === 'page', sel = mzSelNode();
  if (!sel) return {parent: root, index: root.children.length, wrap: page && type !== 'section'};
  const f = mzFind(root, sel.id);
  if (type === 'section' && page) { let c = sel, pf = f; while (pf && pf.parent && pf.parent !== root) { c = pf.parent; pf = mzFind(root, c.id); } const i = root.children.indexOf(c); return {parent: root, index: i < 0 ? root.children.length : i + 1}; }
  if (mzIsCont(sel) && sel.type !== 'page') return {parent: sel, index: sel.children.length};
  return {parent: f.parent || root, index: (f.idx || 0) + 1};
}
function mzInsertSpec(spec, drop) {
  let node = mzMakeSpec(spec); if (!node) { toast('Não consegui criar este elemento.'); return; }
  if (spec.kind === 'tpl') { toast('Use "Páginas" para aplicar um modelo.'); return; }
  const t = node.type; drop = drop || mzDefaultDrop(t); const root = mzRoot();
  if (drop.wrap && root.type === 'page' && t !== 'section') { const w = MZB.sec([node], {minHeight: 80}); w.name = 'Seção'; node = w; }
  if (mzCount(root) + mzCount(node) > MZ_LIMITS.nodes) { toast('A página chegou ao limite de elementos.'); return; }
  const par = mzFind(root, drop.parent.id) ? drop.parent : root; if (!mzIsCont(par)) { toast('Este elemento não aceita filhos.'); return; }
  par.children.splice(Math.max(0, Math.min(drop.index, par.children.length)), 0, node); MZ.sel = node.id; mzCommit({panels: true}); mzScrollToSel();
}
function mzScrollToSel() { setTimeout(() => { const fr = MZ.frames[MZ.bp]; if (!fr || !fr.doc) return; const el = mzElOf(fr, MZ.sel), cv = document.getElementById('mzCanvas'); if (!el || !cv) return; const r = mzRectOf(el), b = fr.ifr.getBoundingClientRect(), y = b.top + r.top * (fr.z || 1) - cv.getBoundingClientRect().top; if (y < 40 || y > cv.clientHeight - 80) cv.scrollTop += y - 120; }, 60); }
function mzMoveNode(id, parentId, index) {
  const root = mzRoot(), f = mzFind(root, id), pf = mzFind(root, parentId) || {node: root}; if (!f || !f.parent) return; const par = pf.node;
  if (!mzIsCont(par) || par.id === id || mzFind(f.node, par.id)) { toast('Não dá para mover para dentro de si mesmo.'); return; }
  if (f.node.type === 'section' && root.type === 'page' && par !== root) { toast('Seção só pode ficar na raiz da página.'); return; }
  const same = f.parent === par; f.parent.children.splice(f.idx, 1); if (same && f.idx < index) index--; par.children.splice(Math.max(0, Math.min(index, par.children.length)), 0, f.node); MZ.sel = id; mzCommit({panels: true});
}
function mzMoveStep(d) { const f = MZ.sel && mzFind(mzRoot(), MZ.sel); if (!f || !f.parent) return; const j = f.idx + d; if (j < 0 || j >= f.parent.children.length) return; const a = f.parent.children; [a[f.idx], a[j]] = [a[j], a[f.idx]]; mzCommit({panels: true}); }
function mzDelete(id) {
  id = id || MZ.sel; const f = id && mzFind(mzRoot(), id); if (!f || !f.parent) return; if (f.node.locked) { toast('Elemento bloqueado.'); return; } f.parent.children.splice(f.idx, 1);
  const nx = f.parent.children[Math.min(f.idx, f.parent.children.length - 1)]; MZ.sel = nx ? nx.id : (f.parent.type === 'page' ? '' : f.parent.id); mzCommit({panels: true});
}
function mzDup(id) { id = id || MZ.sel; const f = id && mzFind(mzRoot(), id); if (!f || !f.parent) return; const c = mzFresh(f.node); c.name = f.node.name ? f.node.name + ' (cópia)' : ''; f.parent.children.splice(f.idx + 1, 0, c); MZ.sel = c.id; mzCommit({panels: true}); }
function mzCopy() { const n = mzSelNode(); if (!n || n.type === 'page') return; MZ.clip = JSON.stringify(n); try { localStorage.setItem('mz_clip', MZ.clip); } catch (e) { /* sem armazenamento */ } toast('Copiado.'); }
function mzPaste() {
  let j = MZ.clip; if (!j) { try { j = localStorage.getItem('mz_clip'); } catch (e) { /* ok */ } } if (!j) { toast('Nada copiado.'); return; } let n; try { n = mzNormNode(JSON.parse(j)); } catch (e) { return; } if (!n) return; mzWalk(n, x => { x.id = mzId(); });
  const drop = mzDefaultDrop(n.type), root = mzRoot(); if (drop.wrap && root.type === 'page' && n.type !== 'section') { const w = MZB.sec([n], {minHeight: 80}); n = w; } drop.parent.children.splice(drop.index, 0, n); MZ.sel = n.id; mzCommit({panels: true});
}
function mzGroup() { const f = MZ.sel && mzFind(mzRoot(), MZ.sel); if (!f || !f.parent || f.node.type === 'section') return; const g = mzNode('container', {}, {display: 'flex', flexDirection: 'column', gap: 16}, [f.node], {name: 'Grupo'}); f.parent.children[f.idx] = g; MZ.sel = g.id; mzCommit({panels: true}); }
function mzUngroup() { const f = MZ.sel && mzFind(mzRoot(), MZ.sel); if (!f || !f.parent || !mzIsCont(f.node) || f.node.type === 'page' || !f.node.children.length) return; f.parent.children.splice(f.idx, 1, ...f.node.children); MZ.sel = f.node.children[0].id; mzCommit({panels: true}); }
function mzRename(id, name) { const f = mzFind(mzRoot(), id); if (!f) return; f.node.name = String(name || '').slice(0, 60); mzCommit({noRender: true}); mzTreeRefresh(); }
function mzToggle(id, k) { const f = mzFind(mzRoot(), id); if (!f) return; f.node[k] = !f.node[k]; mzCommit({panels: k === 'locked'}); mzTreeRefresh(); }

/* ---------- propriedades ---------- */
function mzSetProp(k, v, o) {
  const n = mzSelNode(); if (!n) return; const np = mzNormProps(n.type, Object.assign({}, n.props, {[k]: v})); n.props = Object.assign({}, n.props, {[k]: np[k]}); if (n.type === 'accordion' || n.type === 'tabs' || n.type === 'timeline' || n.type === 'menu' || n.type === 'table' || n.type === 'list' || n.type === 'gallery') n.props = np;
  mzCommit(Object.assign({}, o));
}
function mzSetStyle(k, v, bp) {
  const n = mzSelNode(); if (!n || !MZ_PROPSET.has(k)) return; const o = mzStyleSet(n, bp), cv = (v === '' || v == null) ? '' : mzCssVal(k, v); if (cv === '') delete o[k]; else o[k] = isNaN(+v) || v === '' || !MZ_PX.has(k) ? cv : (+v) + 'px'; mzCommit({});
}
function mzSetStyles(obj, bp) { const n = mzSelNode(); if (!n) return; const o = mzStyleSet(n, bp); Object.keys(obj).forEach(k => { const cv = mzCssVal(k, obj[k]); if (cv === '') delete o[k]; else o[k] = cv; }); mzCommit({panels: true}); }
function mzResetStyle(k, bp) { const n = mzSelNode(); if (!n) return; delete mzStyleSet(n, bp)[k]; mzCommit({panels: true}); }
function mzSetNodeField(k, v) { const n = mzSelNode(); if (!n) return; if (k === 'cls') n.cls = String(v).replace(/[^\w\- ]/g, '').slice(0, 120); else if (k === 'htmlId') n.htmlId = /^[A-Za-z][\w-]{0,40}$/.test(v) ? v : ''; else if (k === 'typo') n.typo = v; else if (k === 'css') n.css = (typeof v === 'string' && !/[<>@]|javascript:|expression\s*\(/i.test(v)) ? v.slice(0, 2000) : n.css; else if (k === 'name') n.name = String(v).slice(0, 60); else if (k === 'attrs') { const o = {}; String(v).split('\n').slice(0, 12).forEach(l => { const m = /^\s*([\w-]+)\s*=\s*(.*)$/.exec(l); if (m && /^(data-[\w-]{1,30}|aria-[\w-]{1,30}|title|role|alt|target|rel)$/.test(m[1])) o[m[1]] = m[2].replace(/["<>]/g, '').slice(0, 200); }); n.attrs = o; } mzCommit({});
}
function mzSetAnim(k, v) { const n = mzSelNode(); if (!n) return; n.anim[k] = k === 'type' ? (['', 'fade', 'up', 'down', 'left', 'right', 'zoom'].includes(v) ? v : '') : Math.max(0, Math.min(3000, +v || 0)); mzCommit({}); }
function mzSetVis(k, v) { const n = mzSelNode(); if (!n) return; if (k === 'd' || k === 't' || k === 'm') n.vis[k] = !!v; else if (k === 'param') n.vis.param = /^[\w-]{0,30}$/.test(v) ? v : n.vis.param; else n.vis[k] = /^\d{4}-\d{2}-\d{2}/.test(v || '') ? String(v).slice(0, 16) : ''; mzCommit({}); }

/* ---------- componentes globais ---------- */
function mzMakeComp() {
  const f = MZ.sel && mzFind(mzRoot(), MZ.sel); if (!f || !f.parent || f.node.type === 'component') { toast('Selecione um elemento (que não seja um componente).'); return; } const m = mzM(); if (m.comps.length >= MZ_LIMITS.comps) { toast('Limite de componentes.'); return; }
  const name = prompt('Nome do componente (ex.: Cabeçalho, Botão principal)', f.node.name || MZ_NAMES[f.node.type]); if (!name) return; const root = mzFresh(f.node); root.name = name; const c = {id: mzId(), name: name.slice(0, 60), root}; m.comps.push(c);
  const inst = mzNode('component', {ref: c.id}, null, [], {name}); f.parent.children[f.idx] = inst; MZ.sel = inst.id; mzCommit({panels: true}); toast('Componente criado. Alterar o principal atualiza todas as páginas.');
}
function mzEditComp(id) { const c = mzM().comps.find(x => x.id === id); if (!c) return; MZ.comp = id; MZ.sel = ''; MZ.hist = []; MZ.hi = -1; mzSnap(true); mzBuildFrames(); mzCompBanner(); mzRefreshPanels(); }
function mzExitComp() { MZ.comp = ''; MZ.sel = ''; MZ.hist = []; MZ.hi = -1; mzSnap(true); mzBuildFrames(); mzCompBanner(); mzRefreshPanels(); }
function mzDetachComp(id) { id = id || MZ.sel; const f = mzFind(mzRoot(), id); if (!f || f.node.type !== 'component') return; const c = mzM().comps.find(x => x.id === f.node.props.ref); if (!c) return; const cl = mzFresh(c.root); f.parent.children[f.idx] = cl; MZ.sel = cl.id; mzCommit({panels: true}); }
function mzDeleteComp(id) {
  const m = mzM(), c = m.comps.find(x => x.id === id); if (!c || !confirm(`Excluir o componente "${c.name}"? As instâncias viram elementos normais (cópias).`)) return;
  const un = n => mzWalk(n, (x, par, i) => { if (x.type === 'component' && x.props.ref === id && par) par.children[i] = mzFresh(c.root); }); m.pages.forEach(p => un(p.root)); m.comps.forEach(k => { if (k.id !== id) un(k.root); }); m.comps = m.comps.filter(x => x.id !== id); if (MZ.comp === id) MZ.comp = ''; mzCommit({panels: true}); mzBuildFrames();
}
function mzCompBanner() { const b = document.getElementById('mzCompBar'); if (!b) return; const c = MZ.comp && mzM().comps.find(x => x.id === MZ.comp); b.style.display = c ? 'flex' : 'none'; if (c) b.innerHTML = `<span>Editando o componente principal <b>${mzEsc(c.name)}</b>. As mudanças valem para todas as páginas.</span><button class="btn sm dark" onclick="mzExitComp()">Voltar à página</button>`; }

/* ---------- biblioteca do usuário (vale para todos os projetos) ---------- */
function mzSaveLib(kind) {
  const L = state.mesaLib.items; if (L.length >= MZ_LIMITS.lib) { toast('A biblioteca chegou ao limite (200).'); return; } let node, name;
  if (kind === 'page') { node = mzClone(mzPg().root); name = mzPg().name; } else { const n = mzSelNode(); if (!n || n.type === 'page') { toast('Selecione um elemento para salvar.'); return; } node = mzClone(n); name = n.name || MZ_NAMES[n.type]; kind = kind || (n.type === 'section' ? 'section' : n.type === 'component' ? 'component' : 'block'); }
  const nm = prompt('Nome na biblioteca', name); if (!nm) return; const it = {id: mzId(), kind, name: nm.slice(0, 60), root: node, ts: new Date().toISOString(), from: MZ.p.name}; L.unshift(it); state.mesaLib = normalizeMesaLib(state.mesaLib); persist(); toast('Salvo na biblioteca. Dá para usar em outros projetos.'); mzRefreshLeft();
}
function mzDelLib(id) { state.mesaLib.items = state.mesaLib.items.filter(x => x.id !== id); persist(); mzRefreshLeft(); }
function mzFav(key) { const f = mzM().favs, i = f.indexOf(key); if (i >= 0) f.splice(i, 1); else f.push(key); mzTouch(); mzRefreshLeft(); }

/* ---------- páginas ---------- */
function mzPageNew(tpl, name) {
  const m = mzM(); if (m.pages.length >= MZ_LIMITS.pages) { toast('Limite de páginas.'); return null; } const root = tpl && tpl !== 'blank' ? mzBuildTemplate(tpl, mzCtx(MZ.p)) : mzNode('page', {}, {display: 'flex', flexDirection: 'column'});
  const pg = mzNormPage({id: mzId(), name: name || (tpl && tpl !== 'blank' ? (MZ_TEMPLATES.find(t => t.id === tpl) || {}).name : 'Nova página'), slug: '', root}); pg.slug = mzUniqueSlug(slug(pg.name)); if (!m.pages.length) pg.home = true; m.pages.push(pg); m.cur = pg.id; return pg;
}
function mzUniqueSlug(s) { const m = mzM(); let b = s || 'pagina', x = b, i = 2; while (m.pages.some(p => p.slug === x)) x = b + '-' + (i++); return x; }
function mzPageOpen(id) { const m = mzM(); if (!m.pages.some(p => p.id === id)) return; if (MZ.comp) MZ.comp = ''; m.cur = id; MZ.sel = ''; MZ.hist = []; MZ.hi = -1; mzSnap(true); mzBuildFrames(); mzCompBanner(); mzRefreshPanels(); mzPageSelUpdate(); }
function mzPageDup(id) { const m = mzM(), pg = m.pages.find(p => p.id === id); if (!pg || m.pages.length >= MZ_LIMITS.pages) return; const c = mzNormPage(mzClone(pg)); c.id = mzId(); c.name = pg.name + ' (cópia)'; c.slug = mzUniqueSlug(pg.slug + '-copia'); c.home = false; mzWalk(c.root, x => { x.id = mzId(); }); m.pages.splice(m.pages.indexOf(pg) + 1, 0, c); mzTouch(); return c; }
function mzPageDel(id) { const m = mzM(); if (m.pages.length <= 1) { toast('O site precisa de ao menos uma página.'); return; } const pg = m.pages.find(p => p.id === id); if (!pg || !confirm(`Excluir a página "${pg.name}"?`)) return; m.pages = m.pages.filter(p => p.id !== id); if (!m.pages.some(p => p.home)) m.pages[0].home = true; if (m.cur === id) mzPageOpen(m.pages[0].id); mzTouch(); }
function mzPageSet(id, k, v) { const m = mzM(), pg = m.pages.find(p => p.id === id); if (!pg) return; if (k === 'name') pg.name = String(v).slice(0, 60) || pg.name; else if (k === 'slug') pg.slug = String(v).toLowerCase().replace(/[^a-z0-9-/]/g, '').slice(0, 60); else if (k === 'home') { m.pages.forEach(p => { p.home = p.id === id; }); } else if (k === 'priv') pg.priv = !!v; else if (k === 'kind') pg.kind = v === 'campaign' ? 'campaign' : 'page'; else if (k === 'seoTitle') pg.seo.title = String(v).slice(0, 120); else if (k === 'seoDesc') pg.seo.desc = String(v).slice(0, 300); else if (k === 'bg') pg.bg = mzHex(v) ? v : ''; mzTouch(); mzRender(); }

/* ---------- versões (gzip + base64) ---------- */
async function mzGz(str) { const cs = new Blob([str]).stream().pipeThrough(new CompressionStream('gzip')); const u = new Uint8Array(await new Response(cs).arrayBuffer()); let s = ''; for (let i = 0; i < u.length; i += 8192) s += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); return 'gz:' + btoa(s); }
async function mzGunz(d) { if (!d.startsWith('gz:')) return d; const bin = atob(d.slice(3)), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); const ds = new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip')); return await new Response(ds).text(); }
async function mzVersionSave(name, auto) {
  const m = mzM(), j = JSON.stringify({pages: m.pages, ds: m.ds, comps: m.comps}), data = await mzGz(j); if (data.length > 390000) { toast('O site ficou grande demais para guardar uma versão (reduza imagens embutidas ou páginas).'); return null; }
  const v = {id: mzId(), name: name || (auto ? 'Automática' : 'Versão'), ts: new Date().toISOString(), approved: false, auto: !!auto, data}; m.versions.unshift(v);
  while (m.versions.length > MZ_LIMITS.versions) { let i = m.versions.map(x => x).reverse().findIndex(x => !x.approved && x.auto); if (i < 0) i = m.versions.slice().reverse().findIndex(x => !x.approved); if (i < 0) break; m.versions.splice(m.versions.length - 1 - i, 1); } mzTouch(); return v;
}
async function mzVersionRestore(id) {
  const m = mzM(), v = m.versions.find(x => x.id === id); if (!v) return; const j = JSON.parse(await mzGunz(v.data)); await mzVersionSave('Antes de restaurar "' + v.name + '"', true);
  const keep = m.versions, cur = m.cur; const r = normalizeMesa({pages: j.pages, ds: j.ds, comps: j.comps, cur}); r.versions = keep; r.favs = m.favs; r.rev = m.rev + 1; MZ.p.mesa = r; MZ.sel = ''; MZ.comp = ''; MZ.hist = []; MZ.hi = -1; mzSnap(true); mzTouch(); mzBuildFrames(); mzRefreshPanels(); toast('Versão restaurada. A anterior ficou guardada.');
}
function mzVersionApprove(id) { const m = mzM(); m.versions.forEach(v => { v.approved = v.id === id ? !v.approved : false; }); mzTouch(); }
function mzVersionDel(id) { const m = mzM(); m.versions = m.versions.filter(v => v.id !== id); mzTouch(); }

/* ---------- menu de contexto ---------- */
let MZ_MENU = null;
function mzMenuClose() { if (MZ_MENU) MZ_MENU.remove(); MZ_MENU = null; MZ.menuClose = false; }
function mzMenuOpen(x, y) {
  mzMenuClose(); const n = mzSelNode(), root = n && n.type === 'page'; const it = [];
  if (n && !root) { it.push(['Editar texto', 'mzEditSel()', MZ_EDITABLE.includes(n.type)], ['Duplicar', 'mzDup()', 1, 'Ctrl+D'], ['Copiar', 'mzCopy()', 1, 'Ctrl+C'], ['Colar', 'mzPaste()', 1, 'Ctrl+V'], ['Agrupar', 'mzGroup()', n.type !== 'section', 'Ctrl+G'], ['Desagrupar', 'mzUngroup()', mzIsCont(n) && n.children.length > 0 && n.type !== 'section', 'Ctrl+Shift+G'], ['Subir', 'mzMoveStep(-1)', 1, '['], ['Descer', 'mzMoveStep(1)', 1, ']'], ['—'], ['Criar componente global', 'mzMakeComp()', n.type !== 'component'], ['Desvincular componente', 'mzDetachComp()', n.type === 'component'], ['Editar componente principal', `mzEditComp('${n.props.ref || ''}')`, n.type === 'component'], ['Salvar na biblioteca', 'mzSaveLib()', 1], ['—'], [n.hidden ? 'Mostrar' : 'Ocultar', `mzToggle('${n.id}','hidden')`, 1], [n.locked ? 'Desbloquear' : 'Bloquear', `mzToggle('${n.id}','locked')`, 1], ['Excluir', 'mzDelete()', 1, 'Del']); }
  else it.push(['Colar', 'mzPaste()', 1, 'Ctrl+V']);
  MZ_MENU = document.createElement('div'); MZ_MENU.className = 'mz-menu'; MZ_MENU.innerHTML = it.filter(i => i[0] === '—' || i[2]).map(i => i[0] === '—' ? '<hr>' : `<button onclick="mzMenuClose();${i[1]}"><span>${i[0]}</span><small>${i[3] || ''}</small></button>`).join('');
  document.body.appendChild(MZ_MENU); const w = MZ_MENU.offsetWidth, h = MZ_MENU.offsetHeight; MZ_MENU.style.left = Math.min(x, innerWidth - w - 8) + 'px'; MZ_MENU.style.top = Math.min(y, innerHeight - h - 8) + 'px'; MZ.menuClose = true; setTimeout(() => document.addEventListener('pointerdown', mzMenuAway, {once: true, capture: true}), 0);
}
function mzMenuAway(e) { if (MZ_MENU && !MZ_MENU.contains(e.target)) mzMenuClose(); }
function mzEditSel() { const fr = MZ.frames[MZ.bp]; if (fr && MZ.sel) mzStartEdit(fr, MZ.sel); }
