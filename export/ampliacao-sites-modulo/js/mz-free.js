/* Mesa de páginas — modo livre (arrastar como no Canva) e ferramenta de desenho (pincéis) */

/* ---------- modo livre ---------- */
function mzFreeToggle() { MZ.free = !MZ.free; const b = document.getElementById('mzFreeBtn'); if (b) b.classList.toggle('on', MZ.free); toast(MZ.free ? 'Modo livre: arraste para onde quiser. Alt+arrastar duplica.' : 'Modo livre desligado: arrastar reordena dentro do layout. Alt+arrastar duplica.'); }
/* tira o elemento do fluxo e o deixa solto (absoluto) onde ele está agora */
function mzFreeConvert(fr, dr, f) {
  const n = f.node, par = f.parent; if (!par || par.type === 'page' || n.type === 'section' || n.locked) return;
  const st = mzStyleAt(n, MZ.bp); if (st.position === 'absolute' || st.position === 'fixed') return;
  const el = mzElOf(fr, n.id), pel = mzElOf(fr, par.id); if (!el || !pel) return; const r = mzRectOf(el), pr = mzRectOf(pel); if (!r || !pr) return;
  const cs = fr.doc.defaultView.getComputedStyle(pel), bl = parseFloat(cs.borderLeftWidth) || 0, bt = parseFloat(cs.borderTopWidth) || 0;
  const ps = mzStyleAt(par, 'd'); if (!ps.position || ps.position === 'static') mzStyleSet(par, 'd').position = 'relative'; if (!ps.minHeight && !ps.height) mzStyleSet(par, 'd').minHeight = Math.round(pr.height) + 'px';
  const o = mzStyleSet(n, MZ.bp); o.position = 'absolute'; o.left = Math.round(r.left - pr.left - bl) + 'px'; o.top = Math.round(r.top - pr.top - bt) + 'px'; o.width = Math.round(r.width) + 'px'; o.margin = '0'; if (!st.zIndex) o.zIndex = '5';
  dr.base = {l: parseFloat(o.left), t: parseFloat(o.top)};
}

/* ---------- desenho ---------- */
const MZ_BRUSH = {pen: {n: 'Caneta', k: 'pen', w: 1, o: 1}, marker: {n: 'Pincel', k: 'marker', w: 2.5, o: .85}, hl: {n: 'Marca-texto', k: 'hl', w: 6, o: .35}, eraser: {n: 'Borracha'}};
const MZ_SW = ['#111111', '#ffffff', '#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa'];
function mzDrawToggle(on) {
  const D = MZ.draw; D.on = on == null ? !D.on : !!on;
  if (D.on && mzRoot().type !== 'page') { D.on = false; toast('Desenhe na página (saia da edição do componente).'); }
  if (D.on) { MZ.sel = ''; mzOverlayAll(); mzRefreshPanels(); }
  Object.values(MZ.frames).forEach(f => f.doc && f.doc.body.classList.toggle('mz-drawing', D.on));
  const b = document.getElementById('mzDrawBtn'); if (b) b.classList.toggle('on', D.on); mzDrawBar();
}
function mzDrawBar() {
  const c = document.querySelector('.mz-center'); if (!c) return; let bar = document.getElementById('mzDrawBar');
  if (!MZ.draw.on) { if (bar) bar.remove(); return; }
  if (!bar) { bar = document.createElement('div'); bar.id = 'mzDrawBar'; bar.className = 'mz-drawbar'; c.appendChild(bar); }
  const D = MZ.draw;
  bar.innerHTML = Object.keys(MZ_BRUSH).map(k => `<button class="${D.tool === k ? 'on' : ''}" onclick="MZ.draw.tool='${k}';mzDrawBar()" title="${MZ_BRUSH[k].n}">${{pen: '✒️', marker: '🖌️', hl: '🖍️', eraser: '🧽'}[k]} ${MZ_BRUSH[k].n}</button>`).join('')
    + `<span class="sep"></span>` + MZ_SW.map(c => `<i class="sw ${D.color === c ? 'on' : ''}" style="background:${c}" onclick="MZ.draw.color='${c}';if(MZ.draw.tool==='eraser')MZ.draw.tool='pen';mzDrawBar()"></i>`).join('')
    + `<input type="color" value="${D.color}" onchange="MZ.draw.color=this.value;if(MZ.draw.tool==='eraser')MZ.draw.tool='pen';mzDrawBar()" title="Outra cor">`
    + `<label class="sz">Tamanho <input type="range" min="1" max="30" value="${D.size}" oninput="MZ.draw.size=+this.value;this.nextElementSibling.textContent=this.value"><b>${D.size}</b></label>`
    + `<span class="sep"></span><button onclick="mzUndo()" title="Desfazer (Ctrl+Z)">↶</button><button onclick="mzRedo()" title="Refazer">↷</button><button onclick="mzDrawClear()" title="Apagar todo o desenho">🗑 Limpar</button><button class="ok" onclick="mzDrawToggle(false)">✓ Concluir</button>`;
}
/* camada de desenho da página (uma só, no fim da página, acima do conteúdo) */
function mzDrawLayer(create) {
  const root = mzRoot(); let n = root.children.find(c => c.type === 'draw'); if (n || !create) return n;
  n = mzNode('draw', {w: MZ_BP[MZ.bp], h: 800, strokes: []}); n.name = 'Desenho'; root.children.push(n); return n;
}
function mzDrawClear() { const n = mzDrawLayer(false); if (!n || !n.props.strokes.length) { toast('Não há desenho.'); return; } n.props.strokes = []; mzCommit({panels: true}); }
function mzDrawStart(fr, e) {
  const D = MZ.draw, root = mzRoot(); if (root.type !== 'page') return; if (MZ.editing) mzEndEdit(true);
  const layer = mzDrawLayer(true), P = layer.props, sc = P.w / MZ_BP[fr.bp], doc = fr.doc, rootEl = doc.getElementById('mzRootEl');
  if (P.strokes.length >= 500 && D.tool !== 'eraser') { toast('Limite de traços atingido. Limpe parte do desenho.'); return; }
  const pt = ev => [Math.round(ev.clientX * sc * 10) / 10, Math.round((ev.clientY + (doc.defaultView.scrollY || 0)) * sc * 10) / 10];
  const eraser = D.tool === 'eraser', br = MZ_BRUSH[D.tool] || MZ_BRUSH.pen, pts = [], w = Math.max(1, D.size * (br.w || 1)) * sc;
  P.h = Math.max(P.h, Math.ceil(rootEl.scrollHeight * sc)); MZ.drag = {kind: 'draw', fr}; let live = null, path = null, changed = false;
  if (!eraser) { live = doc.createElementNS('http://www.w3.org/2000/svg', 'svg'); live.setAttribute('style', `position:absolute;left:0;top:0;width:100%;height:${rootEl.scrollHeight}px;pointer-events:none;z-index:2147482000;overflow:visible`); live.setAttribute('viewBox', `0 0 ${P.w} ${P.h}`); live.setAttribute('preserveAspectRatio', 'none'); path = doc.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('fill', 'none'); path.setAttribute('stroke', D.color); path.setAttribute('stroke-width', w); path.setAttribute('stroke-opacity', br.o); path.setAttribute('stroke-linecap', br.k === 'hl' ? 'square' : 'round'); path.setAttribute('stroke-linejoin', 'round'); live.appendChild(path); doc.body.appendChild(live); }
  const add = ev => { const p = pt(ev), l = pts.length; if (l && Math.hypot(p[0] - pts[l - 2], p[1] - pts[l - 1]) < 1.5 * sc) return; pts.push(p[0], p[1]); if (pts.length > 3200) return;
    if (eraser) { const r = (D.size * 2 + 6) * sc, before = P.strokes.length; P.strokes = P.strokes.filter(k => { for (let i = 0; i < k.pts.length; i += 2) if (Math.hypot(k.pts[i] - p[0], k.pts[i + 1] - p[1]) < r + k.w / 2) return false; return true; }); if (P.strokes.length !== before) { changed = true; mzRenderNow(); } }
    else path.setAttribute('d', mzDrawPath(pts.length < 2 ? [p[0], p[1]] : pts)); };
  const mv = ev => { ev.preventDefault(); add(ev); }, up = ev => { doc.removeEventListener('pointermove', mv, true); doc.removeEventListener('pointerup', up, true); doc.removeEventListener('pointercancel', up, true); if (live) live.remove(); MZ.drag = null;
    if (!eraser && pts.length >= 2) { P.strokes.push({c: D.color, w: Math.round(w * 10) / 10, o: br.o, k: br.k, pts: pts.slice(0, 1600)}); changed = true; }
    if (changed) mzCommit({panels: false}); };
  doc.addEventListener('pointermove', mv, true); doc.addEventListener('pointerup', up, true); doc.addEventListener('pointercancel', up, true); add(e);
}
