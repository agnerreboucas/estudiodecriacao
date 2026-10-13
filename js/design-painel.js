/* Painel da direita da mesa do Estúdio: abas Conteúdo, Estilo, Layout, Avançado e Responsivo ("por tamanho").
   Reaproveita o inspetor que já existia (nenhum campo some): cada bloco dele é movido para a aba certa e entram os campos novos
   (mistura, sombra, gradiente, forma, rotação, alinhar, nome da camada, copiar/colar estilo, valores por tamanho). Carregado depois de design-pincel.js. */
const DZT_TABS = [['content', 'Conteúdo'], ['style', 'Estilo'], ['layout', 'Layout'], ['adv', 'Avançado'], ['resp', 'Responsivo']];
const DZT_BLENDS = [['normal', 'Normal'], ['multiply', 'Multiplicar'], ['screen', 'Tela'], ['overlay', 'Sobrepor'], ['soft-light', 'Luz suave'], ['hard-light', 'Luz forte'], ['darken', 'Escurecer'], ['lighten', 'Clarear'], ['difference', 'Diferença']];
const dzxNum = (v, d) => (isFinite(+v) ? +v : d);

function dztSecTab(L, sec, n, st) {
  if (n.nodeType === 1 && n.matches('.okr-label,.bk-chips')) return 'style';
  if (sec === 'Posição e tamanho' || sec === 'Camada') return 'layout';
  if (sec === 'Texto inteiro' || sec === 'Destaque das palavras' || sec === 'Cor do logo' || sec === 'Fundo atrás do logo') return 'style';
  if (sec === 'Qual logo' || sec === 'Nos outros slides e peças') return 'content';
  if (sec === 'g0') {
    if (L.type === 'text' || L.type === 'video' || L.type === 'draw' || L.role === 'logo') return 'content';
    if (L.type === 'image') { if (n.nodeType === 1 && n.matches('label') && /Tratamento/.test(n.textContent)) st.img = true; return st.img ? 'style' : 'content'; }
    return 'style';
  }
  return 'style';
}
const dztHexOf = c => { const m = String(c || '').match(/^#([0-9a-f]{6})/i); if (m) return '#' + m[1]; const r = String(c || '').match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i); return r ? '#' + [r[1], r[2], r[3]].map(v => (+v).toString(16).padStart(2, '0')).join('') : '#000000'; };
const dztAlphaOf = c => { const r = String(c || '').match(/rgba\([^)]*,\s*([\d.]+)\s*\)/i); return r ? +r[1] : 1; };

const dzInspectorMesa2 = dzInspector;
dzInspector = function () {
  dzInspectorMesa2(); const el = $('dzInsp'), s = dzSet(); if (!el || !s) return; const t = DZT.tool, ids = dztIds();
  if (t === 'brush' || t === 'eraser') { el.innerHTML = dzpPanel(); return; }
  if (t === 'pick') { el.innerHTML = dztPickPanel(); return; }
  if (t === 'shape') { el.innerHTML = dztShapePanel(); return; }
  if (ids.length > 1) { el.innerHTML = dztMultiPanel(ids); return; }
  const L = dzLayer(); if (!L) { el.insertAdjacentHTML('beforeend', dztPageExtras(s)); return; }
  dztTabsify(el, L);
};

function dztTabsify(el, L) {
  const nodes = Array.from(el.childNodes), panes = {content: [], style: [], layout: [], adv: [], resp: []}, head = [], st = {img: false}; let sec = 'g0', seenHead = false;
  nodes.forEach(n => {
    if (!seenHead && n.nodeType === 1 && n.tagName === 'H3') { head.push(n); seenHead = true; return; }
    if (n.nodeType === 1 && n.tagName === 'H4') sec = n.textContent.trim();
    panes[dztSecTab(L, sec, n, st)].push(n);
  });
  el.innerHTML = ''; head.forEach(n => el.appendChild(n));
  const bar = document.createElement('div'); bar.className = 'dzt-itabs'; bar.innerHTML = DZT_TABS.map(([k, n]) => `<button class="${DZT.itab === k ? 'on' : ''}" data-itab="${k}" onclick="dztITab('${k}')">${n}</button>`).join(''); el.appendChild(bar);
  const add = (tab, html) => { const d = document.createElement('div'); d.innerHTML = html; Array.from(d.childNodes).forEach(n => panes[tab].push(n)); };
  add('content', dztContentExtra(L)); add('style', dztStyleExtra(L)); add('layout', dztLayoutExtra(L)); add('adv', dztAdvHtml(L)); add('resp', dztRespHtml(L));
  DZT_TABS.forEach(([k]) => { const p = document.createElement('div'); p.className = 'dzt-pane' + (DZT.itab === k ? ' on' : ''); p.dataset.pane = k; panes[k].forEach(n => p.appendChild(n)); el.appendChild(p); if (k === 'style' && typeof accAuto === 'function') accAuto(p, 'h4', 'dz-' + L.type + (L.role === 'logo' ? 'L' : '') + '-style'); });   // os blocos da aba Estilo continuam recolhíveis (acordeão)
}
function dztITab(k) { DZT.itab = k; document.querySelectorAll('#dzInsp [data-itab]').forEach(b => b.classList.toggle('on', b.dataset.itab === k)); document.querySelectorAll('#dzInsp .dzt-pane').forEach(p => p.classList.toggle('on', p.dataset.pane === k)); }

/* ---- campos novos de cada aba ---- */
function dztContentExtra(L) {
  if (L.type !== 'rect') return '';
  const cur = L.shape || 'rect', rd = cur === 'rect' && L.radius > 0 && L.radius >= Math.min(L.w, L.h) * 0.1 ? 'round' : cur;
  return `<h4>Forma</h4><div class="dzt-shapes">${DZT_SHAPES.map(([k, n]) => `<button class="${rd === k ? 'on' : ''}" onclick="dztReshape('${k}')" title="${n}">${dztShapeSvg(k)}</button>`).join('')}</div>
  ${cur === 'ring' ? `<label class="ins">Espessura do anel <b>${Math.round((L.ringW || .22) * 100)}%</b><input type="range" min="5" max="90" value="${Math.round((L.ringW || .22) * 100)}" oninput="dzProp('ringW',this.value/100,1);this.previousElementSibling.textContent=this.value+'%'"></label>` : ''}`;
}
function dztReshape(k) {
  const L = dzLayer(); if (!L || L.type !== 'rect') return; if (k === 'round') { delete L.shape; L.radius = Math.round(Math.min(L.w, L.h) * 0.2); } else if (k === 'rect') { delete L.shape; L.radius = 0; } else { L.shape = k; if (k === 'line' && L.h > 24) L.h = 8; }
  L.name = (DZT_SHAPES.find(x => x[0] === k) || [0, L.name])[1]; dztDone();
}
function dztStyleExtra(L) {
  const sh = L.shadow, isShape = L.type === 'rect', g = L.grad;
  let h = '';
  if (isShape) h += `<h4>Preenchimento</h4><div class="dzt-seg"><button class="${g ? '' : 'on'}" onclick="dztGrad(false)">Cor</button><button class="${g ? 'on' : ''}" onclick="dztGrad(true)">Gradiente</button></div>
    ${g ? `<div class="ins-row"><label class="ins">De<input type="color" value="${esc(dztHexOf(g.c1))}" oninput="dztGradProp('c1',this.value)"></label><label class="ins">Até<input type="color" value="${esc(dztHexOf(g.c2))}" oninput="dztGradProp('c2',this.value)"></label></div><label class="ins">Ângulo <b>${Math.round(g.a || 0)}°</b><input type="range" min="0" max="360" value="${g.a || 0}" oninput="dztGradProp('a',+this.value);this.previousElementSibling.textContent=this.value+'°'"></label>` : ''}`;
  h += `<h4>Mistura</h4><label class="ins">Modo de mistura<select onchange="dztBlend(this.value)">${DZT_BLENDS.map(([v, n]) => `<option value="${v}" ${(L.blend || 'normal') === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>`;
  if (L.type !== 'image') h += `<h4>Sombra</h4><label class="ins inl"><input type="checkbox" ${sh ? 'checked' : ''} onchange="dztShadowOn(this.checked)"> Sombra</label>
    ${sh ? `<div class="ins-row"><label class="ins">Cor<input type="color" value="${esc(dztHexOf(sh.c))}" oninput="dztShadowProp('hex',this.value)"></label><label class="ins">Força <b>${Math.round(dztAlphaOf(sh.c) * 100)}%</b><input type="range" min="5" max="100" value="${Math.round(dztAlphaOf(sh.c) * 100)}" oninput="dztShadowProp('a',this.value/100);this.previousElementSibling.textContent=this.value+'%'"></label></div>
    <div class="ins-row"><label class="ins">X<input type="number" value="${sh.x}" onchange="dztShadowProp('x',+this.value)"></label><label class="ins">Y<input type="number" value="${sh.y}" onchange="dztShadowProp('y',+this.value)"></label><label class="ins">Desfoque<input type="number" min="0" value="${sh.b}" onchange="dztShadowProp('b',+this.value)"></label></div>` : ''}`;
  return h;
}
function dztGrad(on) { const L = dzLayer(); if (!L) return; if (on) L.grad = L.grad || {a: 90, c1: dztHexOf(L.fill), c2: dzSet().tk.accent === dztHexOf(L.fill) ? dzSet().tk.fg : dzSet().tk.accent}; else delete L.grad; dztDone(); }
function dztGradProp(k, v) { const L = dzLayer(); if (!L || !L.grad) return; L.grad[k] = v; dzDraw(); dzCommitSoon(); }
function dztBlend(v) { dztLayers().forEach(L => { if (v === 'normal') delete L.blend; else L.blend = v; }); dztDone(); }
function dztShadowOn(on) { dztLayers().forEach(L => { if (on) L.shadow = L.shadow || {x: 0, y: 14, b: 28, c: 'rgba(0,0,0,0.35)'}; else delete L.shadow; }); dztDone(); }
function dztShadowProp(k, v) {
  dztLayers().forEach(L => { const sh = L.shadow; if (!sh) return; if (k === 'hex' || k === 'a') { const hex = k === 'hex' ? v : dztHexOf(sh.c), a = k === 'a' ? v : dztAlphaOf(sh.c), [r, g, b] = hex2rgb(hex); sh.c = `rgba(${r},${g},${b},${Math.round(a * 100) / 100})`; } else sh[k] = v; });
  dzDraw(); dzCommitSoon();
}
function dztLayoutExtra(L) {
  const A = (k, t, ic) => `<button onclick="dztAlign('${k}')" title="${t}">${ic}</button>`;
  return `<h4>Alinhar à arte</h4><div class="dzt-al">${A('l', 'Alinhar à esquerda', '⇤')}${A('ch', 'Centralizar na horizontal', '↔')}${A('r', 'Alinhar à direita', '⇥')}${A('t', 'Alinhar ao topo', '⤒')}${A('cv', 'Centralizar na vertical', '↕')}${A('b', 'Alinhar embaixo', '⤓')}</div>
  <h4>Rotação</h4><label class="ins">Ângulo <b>${Math.round(L.rot || 0)}°</b><input type="range" min="-180" max="180" step="1" value="${L.rot || 0}" oninput="dzProp('rot',this.value,1);this.previousElementSibling.textContent=this.value+'°'"></label>`;
}
function dztAdvHtml(L) {
  const g = L.group ? 'Em grupo' : 'Sem grupo';
  return `<h4>Camada</h4><label class="ins">Nome da camada<input value="${esc(L.name || '')}" placeholder="${esc(dzmLabel(L).nm)}" onchange="dzProp('name',this.value.slice(0,40));dzLayersPanel()"></label>
  <div class="row-gap"><label class="ins inl"><input type="checkbox" ${L.locked ? 'checked' : ''} onchange="dztLockSel(this.checked)"> Travar</label><label class="ins inl"><input type="checkbox" ${L.hidden ? 'checked' : ''} onchange="dztHideSel(this.checked)"> Ocultar</label></div>
  <small class="muted block">Papel: ${esc(L.role || L.type)} · ${g}${L.free ? ' · elemento livre' : ''}</small>
  <h4>Estilo e biblioteca</h4><div class="dzt-links"><button class="btn sm" onclick="dztCopyStyle()">Copiar estilo</button><button class="btn sm" onclick="dztPasteStyle()">Colar estilo</button><button class="btn sm" onclick="dztSaveComp()">Salvar na Biblioteca</button></div>
  <div class="dzt-links" style="margin-top:6px"><button class="btn sm" onclick="dztGroup()">Agrupar</button><button class="btn sm" onclick="dztUngroup()">Desagrupar</button></div>
  <small class="muted block">Réguas: arraste das réguas para criar guias. Atalhos: tecle ? para ver a tabela.</small>`;
}
const DZT_STYLE_KEYS = ['color', 'fill', 'stroke', 'strokeW', 'opacity', 'radius', 'family', 'weight', 'size', 'lh', 'ls', 'upper', 'align', 'emMode', 'emColor', 'emBg', 'emText', 'emScale', 'shadow', 'blend', 'grad', 'filter', 'ovColor', 'ovMode'];
function dztCopyStyle() { const L = dzLayer(); if (!L) return; DZT.styleClip = {type: L.type, v: {}}; DZT_STYLE_KEYS.forEach(k => { if (L[k] !== undefined) DZT.styleClip.v[k] = JSON.parse(JSON.stringify(L[k])); }); toast('Estilo copiado. Selecione outro elemento e use Colar estilo.'); }
function dztPasteStyle() { const c = DZT.styleClip, ls = dztLayers(); if (!c || !ls.length) { toast('Copie o estilo de um elemento primeiro.'); return; } ls.forEach(L => { DZT_STYLE_KEYS.forEach(k => { if (c.v[k] === undefined) return; if (c.type !== L.type && ['family', 'weight', 'size', 'lh', 'ls', 'upper', 'align', 'emMode', 'emColor', 'emBg', 'emText', 'emScale', 'filter', 'ovColor', 'ovMode', 'fill', 'stroke', 'strokeW', 'radius', 'grad'].includes(k) && !(k === 'fill' && L.type === 'rect')) return; if (k === 'color' && L.type !== 'text') return; L[k] = JSON.parse(JSON.stringify(c.v[k])); }); }); ensureFonts(ls.filter(l => l.type === 'text').map(l => l.family)).then(() => dztDone('Estilo colado.')); }

/* ---- Responsivo: valores só deste tamanho ---- */
const DZT_INH_KEYS = [['x', 'Posição X'], ['y', 'Posição Y'], ['w', 'Largura'], ['h', 'Altura'], ['size', 'Tamanho do texto'], ['content', 'Texto'], ['color', 'Cor do texto'], ['fill', 'Cor'], ['opacity', 'Opacidade'], ['rot', 'Rotação']];
function dztSrcSet() { const s = dzSet(), p = dzP(); return s && s.srcId ? p.design.sets.find(x => x.id === s.srcId) || null : null; }
/* o que esta camada seria se acompanhasse a arte de origem (refaz a adaptação da página de origem para este tamanho) */
function dztInherited(L) {
  const s = dzSet(), src = dztSrcSet(); if (!src || !L.origin) return null; const sl = dzSlide(), srcSl = src.slides.find(x => x.id === sl.origin) || src.slides[s.slides.indexOf(sl)]; if (!srcSl) return null;
  try { const res = resizeSlide(srcSl, src.format, s.format, s.tk); return {slide: res, layer: res.layers.find(l => l.origin === L.origin) || null, src: srcSl}; } catch (e) { return null; }
}
function dztRespHtml(L) {
  const s = dzSet(), src = dztSrcSet(), p = dzP(), fam = p.design.sets.filter(x => x.srcId === s.id);
  if (!src) return `<h4>Por tamanho</h4><p class="dzt-tip" style="margin-top:0">${s.srcId ? 'A arte de origem desta versão não existe mais. ' : ''}Esta é a arte de origem (${s.format.w}×${s.format.h}). Tudo o que você muda aqui vale só para este formato.</p>
    <p class="dzt-tip">Use <b>⤢ Tamanhos</b> para gerar versões ligadas (feed, stories, capas…). Em cada versão você ajusta valores só daquele tamanho e pode <b>restaurar o herdado</b> da arte de origem.</p>
    ${fam.length ? `<h4>Versões ligadas (${fam.length})</h4>${fam.map(x => `<div class="dzt-fam"><span>${esc((x.format.id || '').slice(0, 18))} <small>${x.format.w}×${x.format.h}</small></span><button class="btn sm" onclick="dzOpen('${x.id}')">Abrir</button></div>`).join('')}` : ''}
    <button class="btn sm dark" style="margin-top:8px" onclick="dzResizeOpen(dz.setId)">⤢ Gerar outros tamanhos</button>`;
  const inh = dztInherited(L);
  let h = `<h4>Valores deste tamanho</h4><p class="dzt-tip" style="margin-top:0">Versão ligada a <b>${esc(src.name)}</b> (${src.format.w}×${src.format.h}). O que você muda aqui vale só para ${s.format.w}×${s.format.h}.</p><div class="dzt-links"><button class="btn sm" onclick="dzOpen('${src.id}')">Abrir a arte de origem</button><button class="btn sm" onclick="dzrRestoreSlide()">Restaurar a página inteira</button></div>`;
  if (!L.origin) return h + '<p class="dzt-tip">Esta camada nasceu só neste tamanho (não existe na arte de origem), então não há valor herdado.</p>';
  if (!inh || !inh.layer) return h + '<p class="dzt-tip">Não encontrei a camada correspondente na arte de origem. Se você apagou ou trocou o papel dela lá, ela passa a ser só deste tamanho.</p>';
  const rows = DZT_INH_KEYS.filter(([k]) => (k !== 'h' || L.type !== 'text') && (k !== 'size' || L.type === 'text') && (k !== 'content' || L.type === 'text') && (k !== 'color' || L.type === 'text') && (k !== 'fill' || L.type !== 'text')).map(([k, n]) => {
    const a = L[k], b = inh.layer[k]; if (a === undefined && b === undefined) return null; const diff = typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) > 1.5 && !(k === 'opacity' && Math.abs(a - b) < .01) : JSON.stringify(a) !== JSON.stringify(b); if (!diff) return null;
    const show = v => k === 'content' ? esc(String(v == null ? '' : v).replace(/\*\*/g, '').slice(0, 26)) : (typeof v === 'number' ? Math.round(v * 100) / 100 : esc(v == null ? '—' : String(v)));
    return `<div class="dzt-inh"><span>${n}</span><span class="v"><small>herdado</small> ${show(b)}</span><span class="v"><small>agora</small> ${show(a)}</span><button class="btn sm" onclick="dzrRestore('${k}')">Restaurar</button></div>`; }).filter(Boolean);
  h += rows.length ? `<div class="dzt-inhs">${rows.join('')}</div><button class="btn sm dark" onclick="dzrRestore('*')">Restaurar tudo desta camada</button>` : '<p class="dzt-ok">✓ Esta camada acompanha a arte de origem.</p>';
  return h;
}
function dzrRestore(k) {
  const L = dzLayer(), inh = L && dztInherited(L); if (!inh || !inh.layer) return; const keys = k === '*' ? DZT_INH_KEYS.map(x => x[0]) : [k];
  keys.forEach(x => { if (inh.layer[x] !== undefined) L[x] = JSON.parse(JSON.stringify(inh.layer[x])); else if (k !== '*') delete L[x]; }); if (k === '*' || k === 'content') { if (inh.layer.spans) L.spans = JSON.parse(JSON.stringify(inh.layer.spans)); else delete L.spans; }
  dztDone('Valor herdado restaurado.');
}
async function dzrRestoreSlide() {
  const s = dzSet(), src = dztSrcSet(), sl = dzSlide(); if (!src) return; const srcSl = src.slides.find(x => x.id === sl.origin) || src.slides[s.slides.indexOf(sl)]; if (!srcSl || !confirm('Refazer esta página a partir da arte de origem? As mudanças feitas só neste tamanho nesta página serão perdidas (dá para desfazer com Ctrl+Z).')) return;
  await ensureSetResources(src); const res = resizeSlide(srcSl, src.format, s.format, s.tk); res.id = sl.id; s.slides[s.slides.indexOf(sl)] = res; dztSetSel([]); dztDone('Página restaurada a partir da arte de origem.');
}

/* ---- painéis sem camada única ---- */
function dztMultiPanel(ids) {
  const ls = dztLayers(), A = (k, t, ic) => `<button onclick="dztAlign('${k}')" title="${t}">${ic}</button>`;
  return `<h3>${ids.length} elementos</h3><small class="muted block">Shift+clique soma ou tira da seleção. Arraste para mover todos.</small>
  <h5 class="dzt-h5">Alinhar entre si</h5><div class="dzt-al">${A('l', 'Esquerda', '⇤')}${A('ch', 'Centro na horizontal', '↔')}${A('r', 'Direita', '⇥')}${A('t', 'Topo', '⤒')}${A('cv', 'Centro na vertical', '↕')}${A('b', 'Base', '⤓')}</div>
  <div class="dzt-links"><button class="btn sm" onclick="dztDistribute('h')">Distribuir na horizontal</button><button class="btn sm" onclick="dztDistribute('v')">Distribuir na vertical</button></div>
  <h5 class="dzt-h5">Camadas</h5><div class="dzt-links"><button class="btn sm dark" onclick="dztGroup()">Agrupar (Ctrl G)</button><button class="btn sm" onclick="dztUngroup()">Desagrupar</button><button class="btn sm" onclick="dztDuplicate()">Duplicar</button><button class="btn sm" onclick="dztDelete()">Excluir</button></div>
  <div class="dzt-links" style="margin-top:6px"><button class="btn sm" onclick="dztOrder(1,false)">▲ Frente</button><button class="btn sm" onclick="dztOrder(-1,false)">▼ Trás</button><button class="btn sm" onclick="dztSaveComp()">Salvar na Biblioteca</button></div>
  <label class="ins" style="margin-top:10px">Opacidade de todos <b>${Math.round((ls[0].opacity == null ? 1 : ls[0].opacity) * 100)}%</b><input type="range" min="0" max="100" value="${Math.round((ls[0].opacity == null ? 1 : ls[0].opacity) * 100)}" oninput="dztOpacityAll(this.value);this.previousElementSibling.textContent=this.value+'%'"></label>
  <small class="muted block">Para mudar o texto ou a cor de um só, clique nele (ou use a lista de Camadas).</small>`;
}
function dztOpacityAll(v) { dztLayers().forEach(L => { L.opacity = v / 100; }); dzDraw(); dzCommitSoon(); }
function dztPickPanel() {
  const hex = DZT.color || '#ff6a18', sel = dztLayers().length;
  return `<h3>Contagotas</h3><div class="dzt-big" style="background:${esc(hex)}"></div><code class="dzt-code">${esc(hex)}</code>
  <p class="dzt-tip">Clique em qualquer ponto da arte para pegar a cor (ela também vai para a área de transferência). Shift+clique aplica direto no elemento selecionado.</p>
  <div class="dzt-links"><button class="dzt-btn" ${sel ? '' : 'disabled'} onclick="dztApplyColor('${esc(hex)}')">Aplicar no selecionado</button><button class="dzt-btn" onclick="DZP.c='${esc(hex)}';toast('Cor do pincel atualizada.')">Usar no pincel</button><button class="dzt-btn" onclick="dztTool('select')">Terminar (V)</button></div>`;
}
function dztShapePanel() {
  return `<h3>Forma</h3><div class="dzt-shapes">${DZT_SHAPES.map(([k, n]) => `<button class="${DZT.shape === k ? 'on' : ''}" onclick="dztPickShape('${k}')" title="${n}">${dztShapeSvg(k)}</button>`).join('')}</div>
  <p class="dzt-tip"><b>${(DZT_SHAPES.find(x => x[0] === DZT.shape) || [0, ''])[1]}</b>: arraste na arte para desenhar (Shift = proporcional). Um clique simples cria no tamanho padrão. Depois mude cor, borda e cantos no painel.</p><div class="dzt-links"><button class="dzt-btn" onclick="dztTool('select')">Terminar (V)</button></div>`;
}
function dztPageExtras(s) {
  const g = s.guides || {}, n = (g.lines || []).length, m = (s.tk && s.tk.margin != null) ? s.tk.margin : 90;
  return `<div class="dzm-pg"><h3>Réguas e guias</h3><label>Mostrar margem (${m} px) <input type="checkbox" ${g.margin ? 'checked' : ''} onchange="dzmGuide('margin',this.checked)"></label>
    <p style="color:var(--m-mut);margin:6px 0;font-size:11.5px">Arraste das réguas (em cima ou à esquerda) para criar uma guia. Arraste a guia de volta para a régua para apagar. As guias só aparecem aqui na mesa.</p><div class="dzt-links"><button class="btn sm" onclick="dztGuidesClear()" ${n ? '' : 'disabled'}>Limpar guias (${n})</button></div></div>`;
}
