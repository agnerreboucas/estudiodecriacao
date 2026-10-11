/* Mesa de páginas — auto layout (estilo Figma), ferramentas de design (efeitos, gradientes, formas, imagem, camadas) */

/* ---------- ajuda: alteração ao vivo (sem lotar o histórico) ---------- */
function mzLive(k, v, commit) { const n = mzSelNode(); if (!n) return; const o = mzStyleSet(n, MZ.bp), cv = v === '' || v == null ? '' : mzCssVal(k, v); if (cv === '') delete o[k]; else o[k] = cv; if (commit) mzCommit({panels: false}); else mzRender(); }
const mzIsTexty = n => ['heading', 'text', 'button', 'badge', 'list'].includes(n.type);
const mzIsImg = n => n.type === 'image' || n.type === 'logo';

/* ---------- AUTO LAYOUT ---------- */
const mzDirOf = n => { const st = mzStyleAt(n, MZ.bp); return String(st.flexDirection || 'row').startsWith('column') ? 'column' : 'row'; };
function mzAutoSec(n) {
  if (!mzIsCont(n) || n.type === 'page') return '';
  const st = mzStyleAt(n, MZ.bp), flex = (st.display || '').includes('flex'), grid = (st.display || '').includes('grid'), on = flex || grid, dir = mzDirOf(n), wrap = st.flexWrap === 'wrap';
  if (!on) return mzSection('Auto layout', `<p class="mz-hint">Organiza os filhos sozinho (como o Auto layout do Figma): espaçamento, alinhamento e adaptação ao Tablet e ao Celular.</p><div class="row-gap"><button class="btn sm dark" onclick="mzAutoOn()">＋ Ativar auto layout</button></div>`);
  const jc = st.justifyContent || 'flex-start', ai = st.alignItems || 'stretch', Xv = ['flex-start', 'center', 'flex-end'];
  const cell = (r, c) => { const mainIdx = dir === 'row' ? c : r, crossIdx = dir === 'row' ? r : c, mainOk = jc === Xv[mainIdx], crossOk = ai === Xv[crossIdx] || (ai === 'stretch' && false); return `<button class="${mainOk && crossOk ? 'on' : ''}" onclick="mzAutoAlign(${r},${c})"></button>`; };
  const pad = mzStV(n, 'padding') || '';
  return mzSection('Auto layout', `<div class="mz-seg-row"><button class="${flex && dir === 'row' && !wrap ? 'on' : ''}" onclick="mzAutoDir('row')" title="Lado a lado">→ Horizontal</button><button class="${flex && dir === 'column' ? 'on' : ''}" onclick="mzAutoDir('column')" title="Um embaixo do outro">↓ Vertical</button><button class="${flex && wrap ? 'on' : ''}" onclick="mzAutoDir('wrap')" title="Quebra de linha">↩ Quebra</button><button class="${grid ? 'on' : ''}" onclick="mzAutoDir('grid')" title="Grade">▦ Grade</button></div>
    ${flex ? `<div class="mz-auto"><div class="mz-al">${[0, 1, 2].map(r => [0, 1, 2].map(c => cell(r, c)).join('')).join('')}</div><div class="mz-auto-f">${mzNum(n, 'gap', 'Espaço entre itens (px)', '0')}<label class="mz-f s"><span>Padding (px)</span><input type="number" value="${parseFloat(pad) || ''}" placeholder="0" onchange="mzSetStyle('padding',this.value)"></label><label class="mz-ck"><input type="checkbox" ${jc === 'space-between' ? 'checked' : ''} onchange="mzSetStyle('justifyContent',this.checked?'space-between':'flex-start');mzRefreshPanels()"> Distribuir (espaço entre)</label></div></div>` : mzTxt('Colunas', mzStV(n, 'gridTemplateColumns'), `mzSetStyle('gridTemplateColumns',this.value)`, 'repeat(3,1fr)') + mzNum(n, 'gap', 'Espaço entre itens (px)', '0')}
    <div class="row-gap" style="margin-top:8px;flex-wrap:wrap"><button class="btn sm dark" onclick="mzAutoAdaptSel()" title="Empilha no celular, quebra no tablet e ajusta espaçamentos">↺ Adaptar Tablet e Celular</button><button class="btn sm" onclick="mzAutoOff()">Desativar</button></div><p class="mz-hint">Dica: Shift+A liga o auto layout no selecionado.</p>`);
}
function mzAutoOn() {
  const n = mzSelNode(); if (!n || !mzIsCont(n) || n.type === 'page') { toast('Selecione uma seção, contêiner ou coluna.'); return; }
  const o = mzStyleSet(n, MZ.bp), st = mzStyleAt(n, MZ.bp); o.display = 'flex'; if (!st.flexDirection) o.flexDirection = n.children.length > 1 && n.children.every(c => mzStyleAt(c, MZ.bp).width && /%|px/.test(mzStyleAt(c, MZ.bp).width)) ? 'row' : 'column'; if (!st.gap) o.gap = '16px';
  if (MZ.bp === 'd') mzAutoAdapt(n, false); mzCommit({panels: true});
}
function mzAutoOff() { const n = mzSelNode(); if (!n) return; mzStyleSet(n, MZ.bp).display = 'block'; mzCommit({panels: true}); }
function mzAutoDir(k) {
  const n = mzSelNode(); if (!n) return; const o = mzStyleSet(n, MZ.bp);
  if (k === 'grid') { o.display = 'grid'; if (!mzStyleAt(n, MZ.bp).gridTemplateColumns) o.gridTemplateColumns = 'repeat(3,1fr)'; if (!mzStyleAt(n, MZ.bp).gap) o.gap = '16px'; }
  else { o.display = 'flex'; o.flexDirection = k === 'column' ? 'column' : 'row'; o.flexWrap = k === 'wrap' ? 'wrap' : 'nowrap'; if (!mzStyleAt(n, MZ.bp).gap) o.gap = '16px'; }
  mzCommit({panels: true});
}
function mzAutoAlign(r, c) { const n = mzSelNode(); if (!n) return; const X = ['flex-start', 'center', 'flex-end'], dir = mzDirOf(n), o = mzStyleSet(n, MZ.bp); o.justifyContent = X[dir === 'row' ? c : r]; o.alignItems = X[dir === 'row' ? r : c]; mzCommit({panels: true}); }
/* tamanho do filho dentro de um auto layout: ajustar ao conteúdo / preencher / fixo */
function mzSizeSec(n, par) {
  if (!par || par.type === 'page') return ''; const pst = mzStyleAt(par, MZ.bp), pf = (pst.display || '').includes('flex'); if (!pf) return '';
  const dir = mzDirOf(par), st = mzStyleAt(n, MZ.bp), abs = st.position === 'absolute'; if (abs) return '';
  const mode = ax => { const w = st[ax === 'w' ? 'width' : 'height']; const main = (dir === 'row') === (ax === 'w'); if (main) { if (/^1/.test(String(st.flex || '')) || st.flexGrow) return 'fill'; } else if (st.alignSelf === 'stretch') return 'fill'; if (!w || w === 'auto' || w === 'fit-content') return 'hug'; return 'fixed'; };
  const seg = ax => `<div class="mz-f s"><span>${ax === 'w' ? 'Largura' : 'Altura'}</span><div class="mz-seg">${[['hug', 'Ajustar'], ['fill', 'Preencher'], ['fixed', 'Fixa']].map(([k, l]) => `<button class="${mode(ax) === k ? 'on' : ''}" onclick="mzSizing('${ax}','${k}')">${l}</button>`).join('')}</div></div>`;
  return mzSection('Tamanho no auto layout', seg('w') + seg('h'));
}
function mzSizing(ax, m) {
  const n = mzSelNode(), f = n && mzFind(mzRoot(), n.id); if (!f || !f.parent) return; const dir = mzDirOf(f.parent), main = (dir === 'row') === (ax === 'w'), o = mzStyleSet(n, MZ.bp), dim = ax === 'w' ? 'width' : 'height';
  const fr = MZ.frames[MZ.bp], el = fr && mzElOf(fr, n.id), r = el && mzRectOf(el);
  if (m === 'fill') { if (main) { o.flex = '1 1 0'; o.minWidth = ax === 'w' ? '0' : o.minWidth; delete o[dim]; if (!o.minWidth) delete o.minWidth; } else { o.alignSelf = 'stretch'; delete o[dim]; } }
  else if (m === 'hug') { if (main) { delete o.flex; delete o.flexGrow; } else if (o.alignSelf === 'stretch') delete o.alignSelf; o[dim] = ax === 'w' ? 'fit-content' : 'auto'; if (ax === 'h') delete o.height; }
  else { if (main) { delete o.flex; delete o.flexGrow; } else if (o.alignSelf === 'stretch') delete o.alignSelf; o[dim] = Math.round(r ? (ax === 'w' ? r.width : r.height) : 200) + 'px'; }
  mzCommit({panels: true});
}
/* adapta Tablet/Celular a partir do Desktop (só preenche o que ainda não foi ajustado à mão) */
function mzAutoAdapt(root, deep) {
  const px = v => { const m = /^(-?\d+(?:\.\d+)?)px$/.exec(String(v || '').trim()); return m ? +m[1] : null; }, setIf = (n, bp, k, v) => { const o = mzStyleSet(n, bp); if (o[k] == null) o[k] = v; }; let changed = 0;
  const one = n => {
    const d = n.style.d || {}, flex = (d.display || '').includes('flex'), row = flex && !String(d.flexDirection || 'row').startsWith('column'), grid = (d.display || '').includes('grid');
    if (MZ_CONT.includes(n.type) && n.type !== 'page') {
      if (row) { setIf(n, 't', 'flexWrap', 'wrap'); setIf(n, 'm', 'flexDirection', 'column'); setIf(n, 'm', 'alignItems', 'stretch'); changed++;
        n.children.forEach(c => { const cd = c.style.d || {}; if (cd.position === 'absolute') return; if (/^1/.test(String(cd.flex || '')) || cd.flexGrow) setIf(c, 't', 'minWidth', '260px'); setIf(c, 'm', 'width', '100%'); setIf(c, 'm', 'maxWidth', '100%'); setIf(c, 'm', 'flex', 'none'); setIf(c, 'm', 'minWidth', '0'); }); }
      if (grid) { const cols = (/repeat\((\d+)/.exec(d.gridTemplateColumns || '') || [])[1]; if (cols && +cols > 2) setIf(n, 't', 'gridTemplateColumns', 'repeat(2,1fr)'); setIf(n, 'm', 'gridTemplateColumns', '1fr'); changed++; }
      const gp = px(d.gap); if (gp && gp > 24) { setIf(n, 'm', 'gap', Math.round(gp * .6) + 'px'); setIf(n, 't', 'gap', Math.round(gp * .8) + 'px'); }
      ['padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'].forEach(k => { const v = px(d[k]); if (v && v >= 40) { setIf(n, 't', k, Math.round(v * .8) + 'px'); setIf(n, 'm', k, Math.round(v * .55) + 'px'); } });
      if (typeof d.padding === 'string' && /\s/.test(d.padding.trim())) { const ps = d.padding.trim().split(/\s+/).map(px); if (ps.every(v => v != null) && ps.some(v => v >= 40)) { setIf(n, 't', 'padding', ps.map(v => Math.round(v * .8) + 'px').join(' ')); setIf(n, 'm', 'padding', ps.map(v => Math.round(v * .55) + 'px').join(' ')); } }
    }
    const fs = px(d.fontSize); if (fs && (n.type === 'heading' || n.type === 'text' || n.type === 'button')) { if (fs >= 36) { setIf(n, 't', 'fontSize', Math.round(fs * .8) + 'px'); setIf(n, 'm', 'fontSize', Math.max(26, Math.round(fs * .6)) + 'px'); } else if (fs >= 20) setIf(n, 'm', 'fontSize', Math.round(fs * .88) + 'px'); }
    const w = px(d.width); if (w && w > 390 && !(d.position === 'absolute') && !['spacer', 'divider'].includes(n.type)) setIf(n, 'm', 'maxWidth', '100%');
  };
  if (deep) mzWalk(root, one); else { one(root); }
  return changed;
}
function mzAutoAdaptSel() { const n = mzSelNode(); if (!n) return; mzAutoAdapt(n, true); mzCommit({panels: true}); toast('Tablet e Celular ajustados a partir do Desktop. Confira na visão de 3 telas e refine se quiser.'); }
function mzAutoAdaptPage() { mzAutoAdapt(mzRoot(), true); mzCommit({panels: true}); toast('Página adaptada: empilha no celular, quebra no tablet e reduz títulos e espaços.'); }
function mzAutoKey() { const n = mzSelNode(); if (!n || n.type === 'page') return; if (!mzIsCont(n)) { mzGroup(); } mzAutoOn(); }

/* ---------- APARÊNCIA e CAMADAS (todo elemento) ---------- */
function mzSecAppear(n) {
  const op = Math.round((parseFloat(mzStV(n, 'opacity')) || (mzStV(n, 'opacity') === '0' ? 0 : 1)) * 100), rot = parseFloat((/rotate\((-?[\d.]+)deg\)/.exec(mzStV(n, 'transform')) || [])[1]) || 0, blend = mzStV(n, 'mixBlendMode') || 'normal', abs = mzStyleAt(n, MZ.bp).position === 'absolute';
  const bm = [['normal', 'Normal'], ['multiply', 'Multiplicar'], ['screen', 'Clarear (screen)'], ['overlay', 'Sobrepor (overlay)'], ['soft-light', 'Luz suave'], ['hard-light', 'Luz forte'], ['color-burn', 'Queimar cor'], ['color-dodge', 'Subexpor cor'], ['darken', 'Escurecer'], ['lighten', 'Clarear'], ['difference', 'Diferença'], ['luminosity', 'Luminosidade']];
  return mzSection('Aparência e camadas', `<label class="mz-f s"><span>Transparência <b id="mzOpV">${100 - op}%</b></span><input type="range" min="0" max="100" value="${100 - op}" oninput="document.getElementById('mzOpV').textContent=this.value+'%';mzLive('opacity',(100-this.value)/100)" onchange="mzLive('opacity',(100-this.value)/100,1);mzRefreshPanels()"></label>
    <label class="mz-f s"><span>Rotação <b id="mzRotV">${rot}°</b></span><input type="range" min="-180" max="180" value="${rot}" oninput="document.getElementById('mzRotV').textContent=this.value+'°';mzLive('transform',this.value==0?'':'rotate('+this.value+'deg)')" onchange="mzLive('transform',this.value==0?'':'rotate('+this.value+'deg)',1);mzRefreshPanels()"></label>
    <label class="mz-f"><span>Mesclagem com o que está embaixo</span><select onchange="mzLive('mixBlendMode',this.value==='normal'?'':this.value,1)">${bm.map(([v, l]) => `<option value="${v}" ${blend === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <div class="mz-seg-row" style="margin-top:6px"><button onclick="mzLayerMove('front')" title="Fica por cima de tudo">⤒ Frente</button><button onclick="mzLayerMove('up')">▲ Subir</button><button onclick="mzLayerMove('down')">▼ Descer</button><button onclick="mzLayerMove('back')" title="Fica por baixo de tudo">⤓ Trás</button></div>
    <div class="mz-seg-row"><button onclick="mzDup()" title="Ctrl+D ou Alt+arrastar">⧉ Duplicar</button><button onclick="mzCopy()">Copiar</button><button onclick="mzPaste()">Colar</button></div>${abs ? '' : '<p class="mz-hint">Para sobrepor um elemento a outro, arraste-o no modo ✋ Livre; depois use Frente/Trás.</p>'}`, true);
}
function mzLayerMove(dir) {
  const f = MZ.sel && mzFind(mzRoot(), MZ.sel); if (!f || !f.parent) return; const n = f.node, st = mzStyleAt(n, MZ.bp), sibs = f.parent.children.filter(c => c !== n);
  if (st.position === 'absolute' || st.position === 'relative' || st.position === 'fixed') { const zs = sibs.map(c => parseInt(mzStyleAt(c, MZ.bp).zIndex) || 0), cur = parseInt(st.zIndex) || 0, mx = Math.max(0, ...zs), mn = Math.min(0, ...zs); const o = mzStyleSet(n, MZ.bp); o.zIndex = String(dir === 'front' ? Math.max(cur, mx + 1) : dir === 'back' ? Math.min(cur, mn - 1) : dir === 'up' ? cur + 1 : cur - 1); mzCommit({panels: true}); return; }
  const a = f.parent.children; a.splice(f.idx, 1); const j = dir === 'front' ? a.length : dir === 'back' ? 0 : Math.max(0, Math.min(a.length, f.idx + (dir === 'up' ? 1 : -1))); a.splice(j, 0, n); mzCommit({panels: true});
}

/* ---------- TEXTO: fonte, efeitos ---------- */
const MZ_FXS = {shadow: 'Sombra', hard: 'Sombra dura', outline: 'Contorno', neon: 'Neon', glow: 'Brilho', grad: 'Gradiente', none: 'Sem efeito'};
function mzSecText(n) {
  const fam = (mzStV(n, 'fontFamily') || '').split(',')[0].replace(/['"]/g, '') || 'Padrão do projeto', fx = MZ.fx || (MZ.fx = {c: '#e4572e', s: 6});
  return mzSection('Fonte e efeitos do texto', `<div class="row-gap" style="margin-bottom:8px;flex-wrap:wrap"><button class="btn sm dark" onclick="mzPickFont()" title="Escolha entre mais de 1.000 fontes">Aa ${esc(fam)}</button><button class="btn sm" onclick="mzSetStyle('fontFamily','');mzRefreshPanels()">Padrão</button></div>
    <div class="mz-fxgrid">${Object.keys(MZ_FXS).map(k => `<button onclick="mzTextFx('${k}')">${MZ_FXS[k]}</button>`).join('')}</div>
    <div class="two"><label class="mz-f s"><span>Cor do efeito</span><input type="color" value="${fx.c}" oninput="MZ.fx.c=this.value"></label><label class="mz-f s"><span>Força</span><input type="range" min="1" max="20" value="${fx.s}" oninput="MZ.fx.s=+this.value"></label></div>
    <p class="mz-hint">Para mexer só numa palavra: dê dois cliques no texto, selecione a palavra e use a barra (fonte, tamanho, cor, efeito).</p>`);
}
function mzPickFont() { const n = mzSelNode(); if (!n) return; fbOpen(fam => { closeModal(); fam = String(fam).replace(/[^\w ]/g, '').slice(0, 40); if (!fam) return; mzSetStyle('fontFamily', `'${fam}', sans-serif`); mzRefreshPanels(); }, (mzStV(n, 'fontFamily') || '').split(',')[0].replace(/['"]/g, '')); }
function mzTextFx(k) {
  const n = mzSelNode(); if (!n) return; const o = mzStyleSet(n, MZ.bp), fx = MZ.fx || {c: '#e4572e', s: 6}, c = fx.c, s = fx.s;
  ['textShadow', 'WebkitTextStroke', 'WebkitTextFillColor', 'WebkitBackgroundClip', 'backgroundClip'].forEach(x => delete o[x]); if (k === 'grad' || mzStV(n, 'backgroundImage').includes('linear-gradient') && o.backgroundImage && k === 'none') { if (k === 'none') delete o.backgroundImage; }
  if (k === 'shadow') o.textShadow = `0 ${Math.round(s / 2)}px ${s * 2}px ${c}`; else if (k === 'hard') o.textShadow = `${s}px ${s}px 0 ${c}`; else if (k === 'outline') { o.WebkitTextStroke = `${Math.max(1, s / 3).toFixed(1)}px ${c}`; o.WebkitTextFillColor = 'transparent'; }
  else if (k === 'neon') { o.color = '#ffffff'; o.textShadow = `0 0 ${s}px ${c}, 0 0 ${s * 2.5}px ${c}, 0 0 ${s * 5}px ${c}`; } else if (k === 'glow') o.textShadow = `0 0 ${s * 2}px ${c}`;
  else if (k === 'grad') { o.backgroundImage = `linear-gradient(90deg, ${c}, #7b3ff2)`; o.WebkitBackgroundClip = 'text'; o.backgroundClip = 'text'; o.WebkitTextFillColor = 'transparent'; }
  mzCommit({panels: true});
}

/* ---------- FUNDO: gradiente rápido ---------- */
function mzSecGrad(n) {
  const ds = mzM().ds, cs = Object.keys(ds.colors).map(k => ds.colors[k]).filter(v => /^#[0-9a-f]{6}$/i.test(v)), g = MZ.grad || (MZ.grad = {a: cs[0] || '#111111', b: cs[2] || '#e4572e', ang: 135});
  const pre = [[0, 1], [1, 2], [0, 2], [2, 3], [3, 0], [1, 3]].filter(([x, y]) => cs[x] && cs[y]);
  return mzSection('Gradiente rápido', `<div class="mz-pre">${pre.map(([x, y]) => `<button style="background:linear-gradient(135deg,${cs[x]},${cs[y]})" onclick="mzApplyGrad('${cs[x]}','${cs[y]}',135)"></button>`).join('')}</div>
    <div class="two"><label class="mz-f s"><span>De</span><input type="color" value="${g.a}" oninput="MZ.grad.a=this.value"></label><label class="mz-f s"><span>Para</span><input type="color" value="${g.b}" oninput="MZ.grad.b=this.value"></label></div>
    <label class="mz-f s"><span>Ângulo</span><input type="range" min="0" max="360" value="${g.ang}" oninput="MZ.grad.ang=+this.value"></label><div class="row-gap"><button class="btn sm dark" onclick="mzApplyGrad(MZ.grad.a,MZ.grad.b,MZ.grad.ang)">Aplicar gradiente</button><button class="btn sm" onclick="mzSetStyle('backgroundImage','');mzRefreshPanels()">Remover</button></div>`, false);
}
function mzApplyGrad(a, b, ang) { mzSetStyles({backgroundImage: `linear-gradient(${ang}deg, ${a}, ${b})`}); }

/* ---------- FORMAS ---------- */
const MZ_CLIPS = {circle: ['Círculo', {borderRadius: '50%', clipPath: ''}], round: ['Arredondado', {borderRadius: '24px', clipPath: ''}], square: ['Reto', {borderRadius: '0', clipPath: ''}], tri: ['Triângulo', {clipPath: 'polygon(50% 0,0 100%,100% 100%)'}], diamond: ['Losango', {clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)'}], hex: ['Hexágono', {clipPath: 'polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)'}], star: ['Estrela', {clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)'}], arrow: ['Seta', {clipPath: 'polygon(0 30%,60% 30%,60% 10%,100% 50%,60% 90%,60% 70%,0 70%)'}], bubble: ['Balão', {clipPath: 'polygon(0 0,100% 0,100% 75%,60% 75%,50% 100%,40% 75%,0 75%)'}]};
function mzSecShape(n) {
  return mzSection('Forma / recorte', `<div class="mz-fxgrid">${Object.keys(MZ_CLIPS).map(k => `<button onclick="mzClip('${k}')">${MZ_CLIPS[k][0]}</button>`).join('')}</div>`, mzIsImg(n) ? true : n.cls === 'mz-shape');
}
function mzClip(k) { const n = mzSelNode(); if (!n) return; const c = MZ_CLIPS[k]; if (!c) return; const o = mzStyleSet(n, MZ.bp); if (k === 'circle' && !o.aspectRatio && !(mzStyleAt(n, MZ.bp).aspectRatio)) { o.aspectRatio = '1/1'; } if (c[1].clipPath === '') delete o.clipPath; Object.keys(c[1]).forEach(x => { if (c[1][x] !== '') o[x] = c[1][x]; }); if (!['circle', 'round', 'square'].includes(k)) o.borderRadius = '0'; mzCommit({panels: true}); }
/* elementos do tipo forma na biblioteca */
(function () {
  const sh = (id, name, st) => ({id: 'shape-' + id, cat: 'shape', nodeType: 'div', name, icon: 'target', make: () => { const n = mzNode('div', {}, Object.assign({width: 140, height: 140, backgroundColor: 'var(--mz-c-accent)'}, st), [], {name}); n.cls = 'mz-shape'; return n; }});
  [sh('rect', 'Retângulo', {width: 200, height: 120}), sh('round', 'Retângulo arredondado', {width: 200, height: 120, borderRadius: 24}), sh('circle', 'Círculo', {borderRadius: '50%'}), sh('tri', 'Triângulo', {clipPath: 'polygon(50% 0,0 100%,100% 100%)'}), sh('diamond', 'Losango', {clipPath: MZ_CLIPS.diamond[1].clipPath}), sh('hex', 'Hexágono', {clipPath: MZ_CLIPS.hex[1].clipPath}), sh('star', 'Estrela', {clipPath: MZ_CLIPS.star[1].clipPath}), sh('arrow', 'Seta', {width: 200, height: 100, clipPath: MZ_CLIPS.arrow[1].clipPath}), sh('bubble', 'Balão', {width: 200, height: 140, clipPath: MZ_CLIPS.bubble[1].clipPath}), sh('line', 'Linha', {width: 240, height: 4, borderRadius: 2}), sh('ring', 'Anel', {borderRadius: '50%', backgroundColor: 'transparent', border: '8px solid var(--mz-c-accent)'})].forEach(e => MZ_EL.push(e));
})();

/* ---------- IMAGEM: tratamentos, ajustes, fontes de imagem ---------- */
const mzPS = x => Array.isArray(x) ? {id: x[0], name: x[1], filter: x[3] || '', ovColor: x[4] || '', ovMode: x[5] || ''} : x;
function mzFilterVals(n) { const f = mzStV(n, 'filter'), g = (re, d) => { const m = re.exec(f); return m ? parseFloat(m[1]) : d; }; return {br: g(/brightness\(([\d.]+)/, 1) * 100, ct: g(/contrast\(([\d.]+)/, 1) * 100, sa: g(/saturate\(([\d.]+)/, 1) * 100, bl: g(/blur\(([\d.]+)px/, 0), gr: g(/grayscale\(([\d.]+)/, 0) * 100, sp: g(/sepia\(([\d.]+)/, 0) * 100}; }
function mzFilterSet(k, v, commit) { const n = mzSelNode(); if (!n) return; const F = mzFilterVals(n); F[k] = +v; const parts = []; if (F.br !== 100) parts.push(`brightness(${F.br / 100})`); if (F.ct !== 100) parts.push(`contrast(${F.ct / 100})`); if (F.sa !== 100) parts.push(`saturate(${F.sa / 100})`); if (F.gr) parts.push(`grayscale(${F.gr / 100})`); if (F.sp) parts.push(`sepia(${F.sp / 100})`); if (F.bl) parts.push(`blur(${F.bl}px)`); mzLive('filter', parts.join(' '), commit); }
function mzSecImage(n) {
  const F = mzFilterVals(n), sl = (k, l, min, max, step) => `<label class="mz-f s"><span>${l}</span><input type="range" min="${min}" max="${max}" step="${step || 1}" value="${F[k]}" oninput="mzFilterSet('${k}',this.value)" onchange="mzFilterSet('${k}',this.value,1)"></label>`;
  const PS = (typeof PHOTO_STYLES !== 'undefined' ? PHOTO_STYLES : []).map(mzPS), P = n.props;
  return mzSection('Imagem: tratamento e ajustes', `<label class="mz-f"><span>Tratamento (${PS.length} estilos)</span><select onchange="mzPhotoStyle(this.value)"><option value="">Sem tratamento</option>${PS.map(x => `<option value="${x.id}" ${mzStV(n, 'filter') === x.filter && (P.ovC || '') === (x.ovColor || '') && x.filter ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
    ${sl('br', 'Brilho', 20, 200)}${sl('ct', 'Contraste', 20, 200)}${sl('sa', 'Saturação', 0, 250)}${sl('gr', 'Preto e branco', 0, 100)}${sl('sp', 'Sépia', 0, 100)}${sl('bl', 'Desfoque (px)', 0, 30, .5)}
    <div class="two"><label class="mz-f s"><span>Cor por cima</span><input type="color" value="${/^#[0-9a-f]{6}$/i.test(P.ovC || '') ? P.ovC : '#1e40af'}" onchange="mzSetProp('ovC',this.value,{panels:true})"></label><label class="mz-f"><span>Mistura</span><select onchange="mzSetProp('ovM',this.value,{panels:true})">${['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'color', 'luminosity', 'darken', 'lighten'].map(m => `<option ${P.ovM === m ? 'selected' : ''}>${m}</option>`).join('')}</select></label></div>
    <div class="row-gap" style="flex-wrap:wrap"><button class="btn sm" onclick="mzSetProp('ovC','',{panels:true})">Tirar cor</button><button class="btn sm" onclick="mzLive('filter','',1);mzRefreshPanels()">Zerar ajustes</button></div>`, true);
}
function mzPhotoStyle(id) { const n = mzSelNode(); if (!n) return; const x = (typeof PHOTO_STYLES !== 'undefined' ? PHOTO_STYLES : []).map(mzPS).find(s => s.id === id); const o = mzStyleSet(n, MZ.bp); if (x && x.filter) o.filter = x.filter; else delete o.filter; n.props.ovC = x && x.ovColor && /^rgba?\(/.test(x.ovColor) ? x.ovColor : ''; n.props.ovM = x && x.ovMode ? x.ovMode : 'normal'; mzCommit({panels: true}); }
function mzImgSources(n) {
  if (!mzIsImg(n)) return '';
  const stock = typeof stockReady === 'function' && stockReady(), ai = typeof imageReady === 'function' && imageReady();
  return `<div class="row-gap" style="flex-wrap:wrap;margin:6px 0"><button class="btn sm" onclick="mzChooseImg('imgId')">📚 Biblioteca</button><button class="btn sm" onclick="mzUploadInto()">⬆ Enviar</button>${stock ? '<button class="btn sm" onclick="mzStockInto()">🔎 Banco</button>' : ''}<button class="btn sm dark" onclick="mzGenInto()" title="${ai ? 'Criar a imagem com IA' : 'Requer a chave de imagem no servidor (dá para copiar o prompt)'}">✨ Gerar com IA</button>${n.props.imgId ? '<button class="btn sm" onclick="mzGenInto({vary:1})" title="Usa a imagem atual como referência">↻ Variar com IA</button>' : ''}</div>`;
}
function mzUploadInto() { const n = mzSelNode(); const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/png,image/jpeg,image/webp,image/svg+xml'; i.onchange = async () => { const f = i.files[0]; if (!f || !n) return; try { const r = await libAddBlob(f, {name: f.name.replace(/\.[^.]+$/, '')}); const id = r && (r.imgId || r.id || r); n.props.imgId = typeof id === 'string' ? id : (id && id.imgId) || n.props.imgId; mzCommit({panels: true}); } catch (e) { toast(e.message); } }; i.click(); }
function mzStockInto() { const n = mzSelNode(); stockPick(r => { if (!n) return; n.props.imgId = r.id; mzCommit({panels: true}); }); }
/* ---------- ligação aos painéis ---------- */
const mzTabStyleBase = window.mzTabStyle, mzTabLayoutBase = window.mzTabLayout, mzTabContentBase = window.mzTabContent;
window.mzTabContent = function (n) { return mzTabContentBase(n) + (mzIsImg(n) ? `<div class="mz-sec"><h5>Trocar imagem</h5>${mzImgSources(n)}</div>` : ''); };
window.mzTabStyle = function (n) { return mzTabStyleBase(n) + (mzIsImg(n) ? mzSecImage(n) : '') + (mzIsTexty(n) ? mzSecText(n) : '') + mzSecShape(n) + mzSecGrad(n) + mzSecAppear(n); };
window.mzTabLayout = function (n) { const f = mzFind(mzRoot(), n.id); return mzAutoSec(n) + mzSizeSec(n, f && f.parent) + mzTabLayoutBase(n); };
