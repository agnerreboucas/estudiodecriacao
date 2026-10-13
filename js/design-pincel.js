/* Desenhar na arte com pincéis: caneta, marcador, aerógrafo e borracha. O traço vira uma camada "Desenho" (type 'draw'): dá para mover, redimensionar,
   mudar a opacidade, ocultar, travar, apagar e desfazer (um passo por traço). A renderização está em design-engine.js (drawStrokeLayer). Carregado depois de design-selecao.js. */
const DZP = {k: 'pen', c: '#ff6a18', s: 14, o: 1, es: 40, live: null, raf: 0};
const DZP_KINDS = [['pen', 'Caneta', 14, 1, 'traço firme e redondo'], ['marker', 'Marcador', 34, 0.55, 'traço largo e translúcido, como marca-texto'], ['spray', 'Aerógrafo', 70, 0.9, 'borrifo de pontinhos, bordas suaves']];

/* camada de desenho ativa da página (a que recebe os próximos traços) */
function dzpActive(sl) { return sl.layers.find(l => l.id === DZT.drawId && l.type === 'draw') || null; }
function dzpTopDraw(sl) { return [...sl.layers].reverse().find(l => l.type === 'draw' && !l.hidden && !l.locked) || null; }
/* estende a caixa da camada para a página inteira (pontos viram absolutos) para receber traços em qualquer lugar */
function dzpExpand(L) {
  const f = dzSet().format, sx = L.w / (L.bw || L.w || 1), sy = L.h / (L.bh || L.h || 1), k = (sx + sy) / 2;
  (L.strokes || []).forEach(st => { st.p = st.p.map(q => [Math.round((L.x + q[0] * sx) * 10) / 10, Math.round((L.y + q[1] * sy) * 10) / 10]); st.s = Math.round(st.s * k * 10) / 10; });
  Object.assign(L, {x: 0, y: 0, w: f.w, h: f.h, bw: f.w, bh: f.h});
}
/* encolhe a caixa até caber só nos traços (com folga), deixando a camada fácil de selecionar e mover */
function dzpTighten(L) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; (L.strokes || []).forEach(st => { if (st.k === 'erase') return; const r = (st.k === 'marker' ? st.s * 1.1 : st.s) / 2 + 3; st.p.forEach(q => { x0 = Math.min(x0, q[0] - r); y0 = Math.min(y0, q[1] - r); x1 = Math.max(x1, q[0] + r); y1 = Math.max(y1, q[1] + r); }); });
  if (x1 < x0) return; x0 = Math.floor(x0); y0 = Math.floor(y0); const w = Math.max(4, Math.ceil(x1) - x0), h = Math.max(4, Math.ceil(y1) - y0);
  L.strokes.forEach(st => { st.p = st.p.map(q => [Math.round((q[0] - x0) * 10) / 10, Math.round((q[1] - y0) * 10) / 10]); });
  Object.assign(L, {x: x0, y: y0, w, h, bw: w, bh: h});
}
function dzpDown(e, p) {
  const sl = dzSlide(), er = DZT.tool === 'eraser'; let L = dzpActive(sl);
  if (er) { L = L || dzpTopDraw(sl); if (!L) { DZP.live = null; toast('Não há nenhum desenho para apagar. Desenhe com o Pincel (B) primeiro; a borracha apaga só dentro dos desenhos.'); return; } }
  if (!L) { const f = dzSet().format; L = {id: lid(), type: 'draw', role: 'draw', name: 'Desenho', free: true, x: 0, y: 0, w: f.w, h: f.h, bw: f.w, bh: f.h, strokes: [], opacity: 1}; sl.layers.push(L); }
  else dzpExpand(L);
  DZT.drawId = L.id; if (er && L.hidden) L.hidden = false;
  const st = {k: er ? 'erase' : DZP.k, c: DZP.c, s: er ? DZP.es : DZP.s, o: er ? 1 : DZP.o, seed: Math.floor(Math.random() * 4294967295), p: [[Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10]]};
  L.strokes.push(st); DZP.live = {L, st, last: p}; dzDraw();
}
function dzpMove(e, p) {
  const v = DZP.live; if (!v) return; const min = Math.max(1.2, v.st.s * (v.st.k === 'spray' ? 0.18 : 0.06));
  if (Math.hypot(p.x - v.last.x, p.y - v.last.y) < min || v.st.p.length >= 5500) return; v.st.p.push([Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10]); v.last = p;
  if (!DZP.raf) DZP.raf = requestAnimationFrame(() => { DZP.raf = 0; dzDraw(); });
}
function dzpUp() {
  const v = DZP.live; if (!v) return; DZP.live = null; if (DZP.raf) { cancelAnimationFrame(DZP.raf); DZP.raf = 0; }
  dzpTighten(v.L); dzCommit(); dzSlidesPanel(); dzInspector(); dzDraw();
}
/* anel do tamanho do pincel seguindo o mouse */
document.addEventListener('pointermove', e => {
  let r = document.getElementById('dzpRing'); const on = dztActive() && (DZT.tool === 'brush' || DZT.tool === 'eraser') && e.target && e.target.id === 'dzCanvas';
  if (!on) { if (r) r.style.display = 'none'; return; }
  if (!r) { r = document.createElement('div'); r.id = 'dzpRing'; document.body.appendChild(r); }
  const d = Math.max(6, (DZT.tool === 'eraser' ? DZP.es : (DZP.k === 'marker' ? DZP.s * 1.5 : DZP.s)) * dz.scale); r.style.cssText = `display:block;width:${d}px;height:${d}px;left:${e.clientX}px;top:${e.clientY}px`;
}, true);

/* painel da direita quando a ferramenta é Pincel ou Borracha */
function dzpPanel() {
  const er = DZT.tool === 'eraser', sl = dzSlide(), act = sl && (dzpActive(sl) || dzpTopDraw(sl)), cols = dztBrandCols().slice(0, 10);
  return `<h3>${er ? 'Borracha' : 'Pincel'}</h3>
  <div class="dzt-seg">${DZP_KINDS.map(([k, n]) => `<button class="${!er && DZP.k === k ? 'on' : ''}" onclick="dzpKind('${k}')" title="${n}">${n}</button>`).join('')}<button class="${er ? 'on' : ''}" onclick="dztTool('eraser')" title="Borracha (E)">Borracha</button></div>
  <small class="muted block">${er ? 'Apaga só dentro do desenho (não apaga fotos nem textos).' : (DZP_KINDS.find(x => x[0] === DZP.k) || [])[4]}</small>
  ${er ? '' : `<label class="ins">Cor<input type="color" value="${esc(DZP.c)}" oninput="DZP.c=this.value;DZT.color=this.value"></label><div class="dzt-sws">${cols.map(c => `<button style="background:${esc(c)}" title="${esc(c)}" onclick="DZP.c='${esc(c)}';DZT.color='${esc(c)}';dzInspector()"></button>`).join('')}<button class="dzt-pickb" title="Contagotas (I)" onclick="dztTool('pick')">${dztSvg('pick', 14)}</button></div>`}
  <label class="ins">Tamanho <b id="dzpSv">${er ? DZP.es : DZP.s}</b><input type="range" min="1" max="${er ? 300 : 240}" step="1" value="${er ? DZP.es : DZP.s}" oninput="${er ? 'DZP.es' : 'DZP.s'}=+this.value;document.getElementById('dzpSv').textContent=this.value"></label>
  ${er ? '' : `<label class="ins">Opacidade <b id="dzpOv">${Math.round(DZP.o * 100)}%</b><input type="range" min="5" max="100" step="5" value="${Math.round(DZP.o * 100)}" oninput="DZP.o=this.value/100;document.getElementById('dzpOv').textContent=this.value+'%'"></label>`}
  <div class="dzt-links" style="margin-top:10px"><button class="dzt-btn" onclick="DZT.drawId='';toast('O próximo traço começa uma camada de desenho nova.')">Nova camada de desenho</button><button class="dzt-btn" onclick="dztTool('select')">Terminar (V)</button></div>
  <p class="dzt-tip">${act ? 'Camada ativa: <b>' + esc(act.name || 'Desenho') + '</b> (' + (act.strokes || []).length + ' traços). ' : ''}Cada traço é um passo do desfazer (Ctrl+Z). Depois de desenhar, selecione a camada com a ferramenta Selecionar (V) para mover ou redimensionar.</p>`;
}
function dzpKind(k) { const d = DZP_KINDS.find(x => x[0] === k); DZP.k = k; if (DZT.tool !== 'brush') dztTool('brush'); if (d) { DZP.s = d[2]; DZP.o = d[3]; } dzInspector(); }

/* inspetor de uma camada de desenho */
function dzDrawInspector(L, geo, acts, rg) {
  return `<h3>Desenho <small class="muted">${(L.strokes || []).length} traço(s)</small></h3>
  <div class="dzt-links"><button class="btn sm" onclick="dzpContinue()">✎ Continuar desenhando</button><button class="btn sm" onclick="dzpClear()">Limpar traços</button></div>
  <small class="muted block">Arraste para mover, use as alças para redimensionar. A borracha (E) apaga partes deste desenho.</small>
  ${rg('opacity', 'Opacidade', 0, 1, 0.05)}<h4>Posição e tamanho</h4>${geo}<h4>Camada</h4>${acts}`;
}
function dzpContinue() { const L = dzLayer(); if (!L) return; DZT.drawId = L.id; dztTool('brush'); }
function dzpClear() { const L = dzLayer(); if (!L) return; L.strokes = []; dz.sel = ''; dz.multi = []; dzSlide().layers = dzSlide().layers.filter(l => l !== L); dztDone('Desenho apagado.'); }
