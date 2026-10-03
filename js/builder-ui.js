/* ===== Editor visual: estrutura (árvore), inspetor por dispositivo, prévia clicável com 5 dispositivos e desfazer ===== */
const BX_DEV = {desktop: ['Computador', 1280, 800, 'd'], 'tablet-p': ['Tablet vertical', 768, 1024, 't'], 'tablet-l': ['Tablet horizontal', 1024, 768, 't'], 'mobile-p': ['Celular vertical', 390, 844, 'm'], 'mobile-l': ['Celular horizontal', 844, 390, 'l']};
const bxUI = {sel: '', undo: [], redo: [], scroll: 0, drag: ''};
const bxA = esc, bxBp = () => (BX_DEV[lpUI.device] || BX_DEV.desktop)[3];
const bxV = () => lpCur() && lpCur().vis;

function bxFind(id) {
  const V = bxV(); if (!V) return null;
  for (let i = 0; i < V.sections.length; i++) { const s = V.sections[i]; if (s.id === id) return {kind: 'sec', o: s, sec: s, arr: V.sections, i};
    for (let j = 0; j < s.cols.length; j++) { const c = s.cols[j]; if (c.id === id) return {kind: 'col', o: c, sec: s, col: c, arr: s.cols, i: j};
      for (let k = 0; k < c.widgets.length; k++) if (c.widgets[k].id === id) return {kind: 'w', o: c.widgets[k], sec: s, col: c, arr: c.widgets, i: k}; } }
  return null;
}
/* alteração com desfazer */
function bxMut(fn, rerender) {
  const l = lpCur(); bxUI.undo.push(JSON.stringify(l.vis)); if (bxUI.undo.length > 40) bxUI.undo.shift(); bxUI.redo = [];
  fn(); persist(); if (rerender === false) lpPaintSoon(); else renderLandings();
}
function bxUndo() { const l = lpCur(); if (!bxUI.undo.length) return; bxUI.redo.push(JSON.stringify(l.vis)); l.vis = JSON.parse(bxUI.undo.pop()); persist(); renderLandings(); }
function bxRedo() { const l = lpCur(); if (!bxUI.redo.length) return; bxUI.undo.push(JSON.stringify(l.vis)); l.vis = JSON.parse(bxUI.redo.pop()); persist(); renderLandings(); }
document.addEventListener('keydown', e => { if (ui.page === 'landings' && lpUI.tab === 'editor' && (e.ctrlKey || e.metaKey) && !/INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || '')) { if (e.key === 'z') { e.preventDefault(); e.shiftKey ? bxRedo() : bxUndo(); } else if (e.key === 'y') { e.preventDefault(); bxRedo(); } } });
window.addEventListener('message', e => { const d = e.data || {}; if (d.bxScroll != null) bxUI.scroll = d.bxScroll; if (d.bx && lpUI.tab === 'editor' && bxFind(d.bx)) { bxUI.sel = d.bx; renderLandings(); } });

function lpToVisual() {
  const l = lpCur(); if (l.vis && !confirm('Refazer o layout a partir dos blocos? Os ajustes do editor visual serão substituídos.')) return;
  l.vis = bxFromBlocks(l); bxUI.undo = []; bxUI.redo = []; bxUI.sel = ''; lpUI.tab = 'editor'; persist(); renderLandings();
}
function lpToBlocks() { if (!confirm('Voltar ao modo de blocos? O layout do editor visual será descartado.')) return; lpCur().vis = null; lpUI.tab = 'blocos'; persist(); renderLandings(); }

/* ---------- aba Editor visual ---------- */
function bxTab(b, l, p) {
  if (!l.vis) { b.innerHTML = `<div class="panel"><h3>Editor visual</h3><p style="font-size:13px">Monte a página como num construtor (Elementor): seções, colunas e widgets de <b>texto, imagem, vídeo, botão, lista, formulário</b> e mais, com a largura e o alinhamento ajustáveis para <b>computador, tablet e celular (vertical e horizontal)</b>.</p><p class="muted" style="font-size:12.5px">Começa a partir dos blocos que você já tem (texto da IA, produto, imagens). Dá para voltar aos blocos depois.</p><div class="row-gap" style="flex-wrap:wrap"><button class="btn dark" onclick="lpToVisual()">Abrir no editor visual</button><button class="btn" onclick="secStart()">📦 Começar por seções prontas</button></div></div>`; return; }
  const V = l.vis, bp = bxBp(), sel = bxFind(bxUI.sel) || null;
  const tr = V.sections.map((s, si) => `<div class="bx-t-sec ${bxUI.sel === s.id ? 'on' : ''}"><div class="bx-t-row" onclick="bxPick('${s.id}')"><b>▾ ${bxA(s.name || 'Seção ' + (si + 1))}</b><span class="bx-t-act">${bxActs(s.id, si === 0, si === V.sections.length - 1)}</span></div>${s.cols.map((c, ci) => `<div class="bx-t-col ${bxUI.sel === c.id ? 'on' : ''}" ondragover="event.preventDefault()" ondrop="bxDrop('${c.id}','')"><div class="bx-t-row" onclick="bxPick('${c.id}')"><span>Coluna ${ci + 1} <small class="muted">${bxGet(c.span, bp) || 12}/12</small></span><span class="bx-t-act"><button class="btn sm" onclick="event.stopPropagation();bxAddWidget('${c.id}')" title="Adicionar widget nesta coluna">＋</button></span></div>${c.widgets.map((w, wi) => `<div class="bx-t-w ${bxUI.sel === w.id ? 'on' : ''}" draggable="true" ondragstart="bxUI.drag='${w.id}'" ondragover="event.preventDefault()" ondrop="event.stopPropagation();bxDrop('${c.id}','${w.id}')" onclick="bxPick('${w.id}')"><span>${BX_W[w.t][1]} ${bxA((w.text || w.title || (w.items[0] && w.items[0].t) || BX_W[w.t][0]).replace(/\*\*/g, '').slice(0, 26))}</span><span class="bx-t-act">${bxActs(w.id, wi === 0, wi === c.widgets.length - 1)}</span></div>`).join('')}</div>`).join('')}</div>`).join('');
  b.innerHTML = `<div class="row-gap" style="margin-bottom:8px;flex-wrap:wrap"><button class="btn sm" onclick="bxUndo()" ${bxUI.undo.length ? '' : 'disabled'}>↶ Desfazer</button><button class="btn sm" onclick="bxRedo()" ${bxUI.redo.length ? '' : 'disabled'}>↷ Refazer</button><select id="bxLay" class="an-sel">${Object.entries(BX_LAYOUT_NAME).map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select><button class="btn sm dark" onclick="bxAddSection()">＋ Seção</button><button class="btn sm dark" onclick="secGallery()" title="Modelos prontos preenchidos com os dados do projeto">📦 Seções prontas</button><button class="btn sm" onclick="lpToBlocks()" title="Descarta o layout do editor visual">Voltar aos blocos</button></div>
  <div class="bx-edit-note">Editando para: <b>${BX_BP[bp]}</b>${bp !== 'd' ? ' — o que você mudar aqui vale só deste dispositivo' : ' — vale para todos, até que tablet ou celular tenham ajuste próprio'}</div>
  ${sel ? `<div class="panel bx-insp">${bxInspector(sel, bp)}</div>` : '<small class="muted block" style="margin:6px 0">Clique em qualquer parte da página (ao lado) ou na estrutura abaixo para editar.</small>'}
  <div class="bx-tree">${tr || '<p class="muted">Página vazia. Adicione uma seção.</p>'}</div>`;
}
const bxActs = (id, first, last) => `<button class="btn sm" onclick="event.stopPropagation();bxMove('${id}',-1)" ${first ? 'disabled' : ''}>▲</button><button class="btn sm" onclick="event.stopPropagation();bxMove('${id}',1)" ${last ? 'disabled' : ''}>▼</button><button class="btn sm" onclick="event.stopPropagation();bxDup('${id}')">⧉</button><button class="btn sm" onclick="event.stopPropagation();bxDel('${id}')">×</button>`;
function bxPick(id) { bxUI.sel = id; renderLandings(); }
function bxAddSection() { const k = $('bxLay').value; bxMut(() => { const V = bxV(), s = bxSec(k), f = bxFind(bxUI.sel), at = f ? V.sections.indexOf(f.sec) + 1 : V.sections.length; V.sections.splice(at, 0, s); bxUI.sel = s.id; }); }
function bxAddWidget(colId) {
  showModal('Adicionar widget', `<div class="bx-wgrid">${Object.entries(BX_W).map(([t, [n, ic]]) => `<button class="bx-wbtn" onclick="bxDoAdd('${colId}','${t}')"><span>${ic}</span>${bxA(n)}</button>`).join('')}</div>`);
}
function bxDoAdd(colId, t) { closeModal(); bxMut(() => { const f = bxFind(colId), w = bxW(t); f.o.widgets.push(w); bxUI.sel = w.id; }); }
function bxMove(id, d) { bxMut(() => { const f = bxFind(id), j = f.i + d; if (j < 0 || j >= f.arr.length) return; [f.arr[f.i], f.arr[j]] = [f.arr[j], f.arr[f.i]]; }); }
function bxDup(id) { bxMut(() => { const f = bxFind(id), c = JSON.parse(JSON.stringify(f.o)), re = o => { o.id = bxId(); (o.cols || []).forEach(re); (o.widgets || []).forEach(re); }; re(c); f.arr.splice(f.i + 1, 0, c); bxUI.sel = c.id; }); }
function bxDel(id) { if (!confirm('Remover este item?')) return; bxMut(() => { const f = bxFind(id); f.arr.splice(f.i, 1); bxUI.sel = ''; }); }
function bxDrop(colId, beforeId) { const id = bxUI.drag; bxUI.drag = ''; if (!id || id === beforeId) return; const src = bxFind(id); if (!src || src.kind !== 'w') return; bxMut(() => { const f = bxFind(id); f.arr.splice(f.i, 1); const dst = bxFind(colId).o.widgets, at = beforeId ? dst.findIndex(w => w.id === beforeId) : dst.length; dst.splice(at < 0 ? dst.length : at, 0, f.o); }); }

/* ---------- inspetor ---------- */
const bxSet = (id, path, v, rerender) => { bxMut(() => { const f = bxFind(id); let o = f.o; const a = path.split('.'); for (let i = 0; i < a.length - 1; i++) o = o[a[i]]; o[a[a.length - 1]] = v; }, rerender === true); };
const bxLine = (id, label, path, val, ta) => `<div class="field"><label>${label}</label>${ta ? `<textarea rows="${ta}" oninput="bxSet('${id}','${path}',this.value)">${bxA(val)}</textarea>` : `<input value="${bxA(val)}" oninput="bxSet('${id}','${path}',this.value)">`}</div>`;
function bxBpField(id, label, obj, key, kind, opts) {
  const bp = bxBp(), own = bxOwn(obj, bp), eff = bxGet(obj, bp), tag = own ? '' : (eff != null ? ` <small class="muted">(herdado: ${kind === 'sel' ? eff : eff})</small>` : ' <small class="muted">(automático)</small>');
  if (kind === 'sel') return `<div class="field"><label>${label} — ${BX_BP[bp]}${tag}</label><select onchange="bxBpSet('${id}','${key}','${bp}',this.value)"><option value="">${own ? '↺ voltar a herdar' : 'automático / herdado'}</option>${opts.map(([v, t]) => `<option value="${v}" ${own && obj[bp] == v ? 'selected' : ''}>${t}</option>`).join('')}</select></div>`;
  return `<div class="field"><label>${label} — ${BX_BP[bp]}${tag}</label><div class="row-gap"><input type="number" min="${opts[0]}" max="${opts[1]}" value="${own ? obj[bp] : ''}" placeholder="${eff != null ? eff : 'auto'}" onchange="bxBpSet('${id}','${key}','${bp}',this.value)" style="width:90px"><small class="muted">${opts[2] || ''}</small></div></div>`;
}
function bxBpSet(id, key, bp, v) { bxMut(() => { const f = bxFind(id); if (!f.o[key] || typeof f.o[key] !== 'object') f.o[key] = {}; if (v === '' || v == null) delete f.o[key][bp]; else f.o[key][bp] = isNaN(+v) ? v : +v; }); }
function bxHideField(id, o) { const bp = bxBp(); if (bp === 'd') return ''; return `<label class="ins inl"><input type="checkbox" ${o.hide[bp] ? 'checked' : ''} onchange="bxSet('${id}','hide.${bp}',this.checked,true)"> ocultar neste dispositivo (${BX_BP[bp]})</label>`; }
function bxInspector(f, bp) {
  const o = f.o, id = o.id, A = [['left', 'Esquerda'], ['center', 'Centro'], ['right', 'Direita']];
  if (f.kind === 'sec') return `<h4>Seção</h4>${bxLine(id, 'Nome (só para você)', 'name', o.name)}<div class="ins-row"><label class="ins">Largura<select onchange="bxSet('${id}','w',this.value,true)"><option value="box" ${o.w === 'box' ? 'selected' : ''}>Centralizada</option><option value="full" ${o.w === 'full' ? 'selected' : ''}>Tela cheia</option></select></label><label class="ins">Fundo<input type="color" value="${o.bg || '#ffffff'}" oninput="bxSet('${id}','bg',this.value,false)"></label><button class="btn sm" onclick="bxSet('${id}','bg','',true)">sem cor</button><label class="ins inl"><input type="checkbox" ${o.alt ? 'checked' : ''} onchange="bxSet('${id}','alt',this.checked,true)"> fundo suave</label></div>
    ${bxBpField(id, 'Espaço acima', o.pad, 'pad', 'num', [0, 240, 'px'])}${bxBpField(id, 'Espaço abaixo', o.padB, 'padB', 'num', [0, 240, 'px'])}${bxBpField(id, 'Espaço entre colunas', o.gap, 'gap', 'num', [0, 80, 'px'])}
    <div class="row-gap"><button class="btn sm" onclick="bxSecBg('${id}')">${o.bgImg ? 'Trocar' : '📚 Imagem'} de fundo</button>${o.bgImg ? `<button class="btn sm" onclick="bxSet('${id}','bgImg','',true)">Tirar</button>` : ''}</div>
    <div class="field"><label>Trocar o número de colunas</label><select onchange="bxRelayout('${id}',this.value)"><option value="">— escolher —</option>${Object.entries(BX_LAYOUT_NAME).map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select></div>${bxHideField(id, o)}`;
  if (f.kind === 'col') return `<h4>Coluna</h4>${bxBpField(id, 'Largura (de 12)', o.span, 'span', 'sel', Array.from({length: 12}, (_, i) => [i + 1, (i + 1) + '/12' + (i + 1 === 12 ? ' (inteira)' : i + 1 === 6 ? ' (metade)' : '')]))}<div class="field"><label>Alinhamento vertical</label><select onchange="bxSet('${id}','v',this.value,true)">${[['top', 'Topo'], ['center', 'Meio'], ['bottom', 'Base']].map(([v, t]) => `<option value="${v}" ${o.v === v ? 'selected' : ''}>${t}</option>`).join('')}</select></div><small class="muted block">Ex.: 6/12 no computador e 12/12 no celular = duas colunas lado a lado que empilham no celular.</small>`;
  const t = o.t, L = (k, lab, ta) => bxLine(id, lab, k, o[k], ta), common = bxBpField(id, 'Alinhamento', o.al, 'al', 'sel', A) + (['heading', 'text', 'feature'].includes(t) ? bxBpField(id, 'Tamanho da fonte', o.size, 'size', 'num', [10, 120, 'px']) + bxFontField(id, o) : '') + bxHideField(id, o);
  let body = '';
  if (t === 'heading') body = L('text', 'Texto (use **negrito**)', 3) + `<div class="ins-row"><label class="ins">Nível<select onchange="bxSet('${id}','tag',this.value,false)">${['h1', 'h2', 'h3'].map(x => `<option ${o.tag === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label><label class="ins">Cor<input type="color" value="${o.color || '#141414'}" oninput="bxSet('${id}','color',this.value,false)"></label><button class="btn sm" onclick="bxSet('${id}','color','',true)">padrão</button></div>`;
  else if (t === 'text') body = L('text', 'Texto (use **negrito**)', 5) + `<label class="ins inl"><input type="checkbox" ${o.muted ? 'checked' : ''} onchange="bxSet('${id}','muted',this.checked,false)"> cor suave</label>`;
  else if (t === 'image') body = `<div class="row-gap" style="flex-wrap:wrap"><button class="btn sm" onclick="bxImgPick('${id}')">📚 Biblioteca</button><button class="btn sm" onclick="bxImgUpload('${id}')">⬆ Enviar imagem</button>${o.imgId || o.src ? `<button class="btn sm" onclick="bxImgClear('${id}')">Remover</button>` : ''}</div>${bxLine(id, 'ou endereço da imagem (https://…)', 'src', o.src)}${bxLine(id, 'Texto alternativo (acessibilidade)', 'alt', o.alt)}<div class="ins-row"><label class="ins">Cantos (px)<input type="number" min="0" max="999" value="${o.rad}" onchange="bxSet('${id}','rad',+this.value,false)" style="width:70px"></label></div>${bxBpField(id, 'Largura da imagem', o.wpct, 'wpct', 'num', [10, 100, '% da coluna'])}`;
  else if (t === 'video') body = bxLine(id, 'Link do vídeo (YouTube, Vimeo ou .mp4)', 'src', o.src) + `<div class="field"><label>Proporção</label><select onchange="bxSet('${id}','ratio',this.value,false)">${['16:9', '9:16', '1:1', '4:5'].map(x => `<option ${o.ratio === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div><small class="muted block">Para vídeos grandes, hospede no YouTube/Vimeo e cole o link: o arquivo da página fica leve.</small>`;
  else if (t === 'button') body = L('text', 'Texto do botão') + `<div class="field"><label>Para onde leva</label><select onchange="bxSet('${id}','link',this.value,true)">${[['checkout', 'Link de compra do produto'], ['form', 'Formulário da página'], ['whatsapp', 'WhatsApp'], ['custom', 'Outro endereço']].map(([v, n]) => `<option value="${v}" ${o.link === v ? 'selected' : ''}>${n}</option>`).join('')}</select></div>${o.link === 'custom' ? bxLine(id, 'Endereço (https://… ou #âncora)', 'href', o.href) : ''}<div class="ins-row"><label class="ins">Estilo<select onchange="bxSet('${id}','style',this.value,false)"><option value="solid" ${o.style === 'solid' ? 'selected' : ''}>Cheio</option><option value="outline" ${o.style === 'outline' ? 'selected' : ''}>Contorno</option></select></label><label class="ins inl"><input type="checkbox" ${o.full ? 'checked' : ''} onchange="bxSet('${id}','full',this.checked,false)"> largura total</label></div>`;
  else if (t === 'list') body = `<div class="field"><label>Itens (um por linha)</label><textarea rows="5" oninput="bxSetItems('${id}',this.value)">${bxA(o.items.map(i => i.t).join('\n'))}</textarea></div><div class="field"><label>Marcador</label><select onchange="bxSet('${id}','icon',this.value,false)">${[['check', '✓'], ['x', '✕'], ['dot', '•']].map(([v, n]) => `<option value="${v}" ${o.icon === v ? 'selected' : ''}>${n}</option>`).join('')}</select></div>`;
  else if (t === 'feature') body = L('emoji', 'Ícone (emoji, opcional)') + L('title', 'Título') + L('text', 'Descrição', 3);
  else if (t === 'spacer') body = bxBpField(id, 'Altura', o.h, 'h', 'num', [0, 400, 'px']);
  else if (t === 'form') body = L('title', 'Título') + L('text', 'Texto abaixo do título', 2) + L('text2', 'Texto do botão');
  else if (t === 'countdown') body = bxLine(id, 'Data e hora (AAAA-MM-DDTHH:MM)', 'date', o.date);
  else if (t === 'faq' || t === 'quote') body = o.items.map((it, n) => `<div class="lp-it"><input value="${bxA(it.t)}" placeholder="${t === 'faq' ? 'Pergunta' : 'Depoimento'}" oninput="bxItem('${id}',${n},'t',this.value)"><textarea rows="2" placeholder="${t === 'faq' ? 'Resposta' : 'Quem disse'}" oninput="bxItem('${id}',${n},'d',this.value)">${bxA(it.d)}</textarea><button class="btn sm" onclick="bxItemDel('${id}',${n})">×</button></div>`).join('') + `<button class="btn sm" onclick="bxItemAdd('${id}')">＋ Item</button>`;
  return `<h4>${BX_W[t][0]}</h4>${body}${common}`;
}
function bxSetItems(id, v) { bxMut(() => { bxFind(id).o.items = v.split('\n').filter(x => x.trim()).map(x => ({t: x, d: ''})); }, false); }
function bxItem(id, n, k, v) { bxMut(() => { bxFind(id).o.items[n][k] = v; }, false); }
function bxItemAdd(id) { bxMut(() => { bxFind(id).o.items.push({t: '', d: ''}); }); }
function bxItemDel(id, n) { bxMut(() => { bxFind(id).o.items.splice(n, 1); }); }
function bxImgPick(id) { libPick(r => bxMut(() => { const o = bxFind(id).o; o.imgId = r.id; o.src = ''; })); }
function bxImgUpload(id) { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/png,image/jpeg,image/webp'; i.onchange = async () => { if (!i.files[0]) return; try { const it = await libAddBlob(i.files[0], {name: i.files[0].name.replace(/\.[^.]+$/, ''), tags: ['site']}); bxMut(() => { const o = bxFind(id).o; o.imgId = it.imgId; o.src = ''; }); } catch (e) { toast(e.message); } }; i.click(); }
function bxImgClear(id) { bxMut(() => { const o = bxFind(id).o; o.imgId = ''; o.src = ''; }); }
function bxSecBg(id) { libPick(r => bxMut(() => { bxFind(id).o.bgImg = r.id; })); }
function bxRelayout(id, k) { if (!k) return; bxMut(() => { const s = bxFind(id).o, spans = BX_LAYOUTS[k], old = s.cols, nc = spans.map((n, i) => old[i] ? Object.assign(old[i], {span: {d: n, t: n <= 4 ? 6 : 12, m: 12}}) : bxCol(n)); old.slice(spans.length).forEach(c => nc[nc.length - 1].widgets.push(...c.widgets)); s.cols = nc; }); }

/* peso e fonte por elemento (vale em todos os dispositivos; vazio = herda da página) */
function bxFontField(id, o) {
  return `<div class="ins-row"><label class="ins">Peso<select onchange="bxSet('${id}','fw',+this.value,true)">${[[0, 'padrão'], [300, 'Fino 300'], [400, 'Normal 400'], [500, 'Médio 500'], [600, 'Semi 600'], [700, 'Negrito 700'], [800, 'Extra 800'], [900, 'Preto 900']].map(([v, n]) => `<option value="${v}" ${(+o.fw || 0) === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label><label class="ins">Fonte<button class="btn sm" onclick="bxFontPick('${id}')">${bxA(o.ff || 'da página')} · trocar</button></label>${o.ff ? `<button class="btn sm" onclick="bxSet('${id}','ff','',true)">padrão</button>` : ''}</div>`;
}
function bxFontPick(id) { fbOpen(fam => { closeModal(); bxSet(id, 'ff', String(fam).replace(/[^\w \-]/g, '').slice(0, 60), true); }, (bxFind(id).o || {}).ff); }
