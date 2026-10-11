/* ===== Mesa de edição · janelas: páginas, Design System, versões, prévia, exportar/importar, início =====
   Também a página-lançador no menu do Studio. Janelas próprias (dentro da mesa), para não depender do modal do Studio. */
function mzModal(title, body, o) {
  o = o || {}; mzModalClose(); const app = document.getElementById('mzApp') || document.body, d = document.createElement('div'); d.id = 'mzModal'; d.className = 'mz-modal';
  d.innerHTML = `<div class="mz-mbox ${o.wide ? 'wide' : ''}"><div class="mz-mh"><h3>${title}</h3><button onclick="mzModalClose()" aria-label="Fechar">×</button></div><div class="mz-mb">${body}</div></div>`; d.addEventListener('pointerdown', e => { if (e.target === d) mzModalClose(); }); app.appendChild(d); return d;
}
function mzModalClose() { const d = document.getElementById('mzModal'); if (d) d.remove(); }

/* ---------- páginas ---------- */
function mzModalPages() {
  const m = mzM(); mzModal('Páginas do site', `<div class="mz-plist">${m.pages.map(p => `<div class="mz-prow ${p.id === m.cur ? 'on' : ''}"><div class="mz-pmeta"><input value="${esc(p.name)}" onchange="mzPageSet('${p.id}','name',this.value);mzPageSelUpdate()"><div class="mz-slug">/<input value="${esc(p.slug)}" onchange="mzPageSet('${p.id}','slug',this.value)" placeholder="${p.home ? '(início)' : 'slug'}"></div></div>
      <div class="mz-pflags"><label title="Página inicial"><input type="radio" name="mzhome" ${p.home ? 'checked' : ''} onchange="mzPageSet('${p.id}','home',1);mzModalPages()"> início</label><label><input type="checkbox" ${p.priv ? 'checked' : ''} onchange="mzPageSet('${p.id}','priv',this.checked)"> privada</label><select onchange="mzPageSet('${p.id}','kind',this.value)"><option value="page" ${p.kind === 'page' ? 'selected' : ''}>página</option><option value="campaign" ${p.kind === 'campaign' ? 'selected' : ''}>campanha</option></select></div>
      <div class="mz-pact"><button class="btn sm dark" onclick="mzPageOpen('${p.id}');mzModalClose()">Abrir</button><button class="btn sm" onclick="mzPageDup('${p.id}');mzModalPages();mzPageSelUpdate()">Duplicar</button><button class="btn sm" onclick="mzPageDel('${p.id}');mzModalPages();mzPageSelUpdate()">Excluir</button></div></div>`).join('')}</div>
    <h4>Nova página</h4><div class="mz-tpls"><button class="mz-tpl" onclick="mzNewPageGo('blank')"><b>Em branco</b><small>Comece do zero</small></button>${MZ_TEMPLATES.map(t => `<button class="mz-tpl" onclick="mzNewPageGo('${t.id}')"><b>${t.name}</b><small>${t.desc}</small></button>`).join('')}${state.mesaLib.items.filter(i => i.kind === 'page').map(i => `<button class="mz-tpl" onclick="mzNewPageGo('lib:${i.id}')"><b>${esc(i.name)}</b><small>Da minha biblioteca</small></button>`).join('')}</div>`, {wide: true});
}
function mzNewPageGo(tpl) {
  let pg; if (/^lib:/.test(tpl)) { const it = state.mesaLib.items.find(x => x.id === tpl.slice(4)); if (!it) return; pg = mzPageNew('blank', it.name); pg.root = mzFresh(it.root); pg.root.type = 'page'; } else pg = mzPageNew(tpl); if (!pg) return; mzModalClose(); mzPageSelUpdate(); mzPageOpen(pg.id); mzTouch();
}

/* ---------- Design System ---------- */
function mzModalDs() {
  const ds = mzM().ds, cn = {primary: 'Primária', secondary: 'Secundária', accent: 'Destaque', background: 'Fundo', text: 'Texto', muted: 'Apagado', success: 'Sucesso', warning: 'Alerta', error: 'Erro'}, tn = {h1: 'Título 1', h2: 'Título 2', h3: 'Título 3', body: 'Texto', small: 'Pequeno', button: 'Botão'};
  mzModal('Design System do site', `<p class="mz-hint" style="margin-top:0">Troque um token e todas as páginas mudam. Tablet e celular reduzem os títulos sozinhos; ajuste um elemento à mão se precisar.</p>
    <div class="row-gap" style="margin-bottom:10px"><button class="btn sm" onclick="mzDsBrand()">🎨 Puxar do Kit de marca do projeto</button></div>
    <h4>Cores</h4><div class="mz-dsg">${Object.keys(cn).map(k => `<label class="mz-dsc"><input type="color" value="${ds.colors[k]}" oninput="mzDsSet('colors.${k}',this.value)"><span>${cn[k]}</span><small>${ds.colors[k]}</small></label>`).join('')}</div>
    <div class="mz-f"><span>Cores extras</span><div class="mz-dsg">${ds.extra.map((e, i) => `<label class="mz-dsc"><input type="color" value="${e.value}" oninput="mzDsExtra(${i},this.value)"><span>${esc(e.name)}</span><button class="mz-mini" onclick="mzDsExtraDel(${i})">×</button></label>`).join('')}<button class="btn sm" onclick="mzDsExtraAdd()">＋ Cor</button></div></div>
    <h4>Fontes</h4><div class="two"><label class="mz-f"><span>Títulos</span><select onchange="mzDsSet('fonts.heading',this.value)">${MZ_FONT_LIST.map(f => `<option ${f === ds.fonts.heading ? 'selected' : ''}>${f}</option>`).join('')}</select></label><label class="mz-f"><span>Textos</span><select onchange="mzDsSet('fonts.body',this.value)">${MZ_FONT_LIST.map(f => `<option ${f === ds.fonts.body ? 'selected' : ''}>${f}</option>`).join('')}</select></label></div>
    <h4>Tipografia (desktop)</h4><div class="mz-dst">${Object.keys(tn).map(k => `<div class="mz-dstr"><b>${tn[k]}</b><label>px<input type="number" value="${ds.type[k].size}" onchange="mzDsSet('type.${k}.size',+this.value)"></label><label>peso<select onchange="mzDsSet('type.${k}.weight',+this.value)">${[300, 400, 500, 600, 700, 800, 900].map(w => `<option ${w === ds.type[k].weight ? 'selected' : ''}>${w}</option>`).join('')}</select></label><label>entrelinha<input type="number" step="0.05" value="${ds.type[k].lh}" onchange="mzDsSet('type.${k}.lh',+this.value)"></label><label>espaç.<input type="number" step="0.5" value="${ds.type[k].ls}" onchange="mzDsSet('type.${k}.ls',+this.value)"></label></div>`).join('')}</div>
    <h4>Espaçamentos, bordas e sombras</h4><div class="mz-dsg">${Object.keys(ds.space).map(k => `<label class="mz-dsn"><span>${k.toUpperCase()}</span><input type="number" value="${ds.space[k]}" onchange="mzDsSet('space.${k}',+this.value)"></label>`).join('')}${Object.keys(ds.radius).map(k => `<label class="mz-dsn"><span>raio ${k}</span><input type="number" value="${ds.radius[k]}" onchange="mzDsSet('radius.${k}',+this.value)"></label>`).join('')}<label class="mz-dsn"><span>borda px</span><input type="number" value="${ds.border.width}" onchange="mzDsSet('border.width',+this.value)"></label><label class="mz-dsc"><input type="color" value="${ds.border.color}" oninput="mzDsSet('border.color',this.value)"><span>cor da borda</span></label><label class="mz-dsn"><span>largura</span><input type="number" value="${ds.width}" onchange="mzDsSet('width',+this.value)"></label></div>
    <div class="mz-dss">${Object.keys(ds.shadow).map(k => `<label class="mz-f"><span>Sombra ${k}</span><input value="${esc(ds.shadow[k])}" onchange="mzDsSet('shadow.${k}',this.value)"></label>`).join('')}</div>`, {wide: true});
}
function mzDsSet(path, v) { const ds = mzM().ds, a = path.split('.'); let o = ds; for (let i = 0; i < a.length - 1; i++) o = o[a[i]]; o[a[a.length - 1]] = v; mzM().ds = mzNormDs(ds); mzCommit({}); }
function mzDsBrand() { mzM().ds = mzDsFromBrand(MZ.p); mzCommit({}); mzModalDs(); }
function mzDsExtra(i, v) { mzM().ds.extra[i].value = v; mzCommit({}); }
function mzDsExtraAdd() { const e = mzM().ds.extra; if (e.length >= 12) return; e.push({name: 'Cor ' + (e.length + 1), value: '#888888'}); mzCommit({}); mzModalDs(); }
function mzDsExtraDel(i) { mzM().ds.extra.splice(i, 1); mzCommit({}); mzModalDs(); }

/* ---------- versões ---------- */
async function mzModalVersions() {
  const m = mzM(); const row = v => `<div class="mz-vrow ${v.approved ? 'ok' : ''}"><div><b>${esc(v.name)}</b>${v.approved ? ' <span class="mz-tag ok">aprovada</span>' : ''}${v.auto ? ' <span class="mz-tag">auto</span>' : ''}<small>${new Date(v.ts).toLocaleString('pt-BR')}</small></div><div class="mz-pact"><button class="btn sm" onclick="mzVersionCompare('${v.id}')">Comparar</button><button class="btn sm" onclick="mzVersionDo('restore','${v.id}')">Restaurar</button><button class="btn sm ${v.approved ? 'dark' : ''}" onclick="mzVersionDo('approve','${v.id}')">${v.approved ? '✓ Aprovada' : 'Aprovar'}</button><button class="btn sm" onclick="mzVersionDo('del','${v.id}')">🗑</button></div></div>`;
  mzModal('Versões do site', `<div class="row-gap" style="margin-bottom:10px"><input id="mzVName" placeholder="Nome da versão (ex.: enviada ao cliente)" style="flex:1"><button class="btn dark" onclick="mzVersionNew()">Salvar versão agora</button></div><p class="mz-hint">Guarda o site inteiro (páginas, Design System e componentes), até ${MZ_LIMITS.versions}. Restaurar guarda a versão atual antes, então nada se perde. As automáticas são feitas ao fechar a mesa.</p>${m.versions.length ? m.versions.map(row).join('') : '<p class="muted">Nenhuma versão ainda.</p>'}`, {wide: true});
}
async function mzVersionNew() { const n = (document.getElementById('mzVName') || {}).value; const v = await mzVersionSave(n || 'Versão ' + new Date().toLocaleString('pt-BR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'}), false); if (v) { persist(); toast('Versão salva.'); mzModalVersions(); } }
async function mzVersionDo(act, id) { if (act === 'restore') { if (!confirm('Restaurar esta versão? A atual fica guardada como versão automática.')) return; await mzVersionRestore(id); mzModalClose(); return; } if (act === 'approve') mzVersionApprove(id); else if (act === 'del') mzVersionDel(id); persist(); mzModalVersions(); }
async function mzVersionCompare(id) {
  const m = mzM(), v = m.versions.find(x => x.id === id); if (!v) return; const j = JSON.parse(await mzGunz(v.data)), cur = mzPg(), old = (j.pages || []).find(p => p.id === cur.id) || (j.pages || [])[0]; if (!old) return;
  const mo = normalizeMesa({pages: [old], ds: j.ds, comps: j.comps}), imgFn = mzImgFn; const dOld = mzDoc(mo, mo.pages[0], {img: imgFn}), dNew = mzDoc(m, cur, {img: imgFn});
  const cnt = a => { let t = 0, w = 0; mzWalk(a, n => { t++; if (n.type === 'heading') w += n.props.text.split(/\s+/).length; }); return t; };
  mzModal('Comparar versões: ' + esc(v.name) + ' × atual', `<p class="mz-hint" style="margin-top:0">Esquerda: <b>${esc(v.name)}</b> (${cnt(mo.pages[0].root)} elementos). Direita: <b>versão atual</b> (${cnt(cur.root)} elementos). Página: ${esc(cur.name)}.</p><div class="mz-cmp"><iframe sandbox="allow-same-origin" srcdoc="${esc(dOld)}"></iframe><iframe sandbox="allow-same-origin" srcdoc="${esc(dNew)}"></iframe></div>`, {wide: true});
}

/* ---------- prévia ---------- */
let MZ_PV = {w: 1440};
async function mzModalPreview() {
  await mzLoadImgs(); mzPvOpen(MZ_PV.w);
}
async function mzPvDocUrl() { const m = mzM(), pg = mzPg(), data = await mzInlineImgDoc(m, pg); return data; }
async function mzPvOpen(w) {
  MZ_PV.w = w; const m = mzM(), pg = mzPg(), html = mzDoc(m, pg, {img: mzImgFn}); let d = document.getElementById('mzPv'); if (!d) { d = document.createElement('div'); d.id = 'mzPv'; d.className = 'mz-pv'; (document.getElementById('mzApp') || document.body).appendChild(d); }
  d.innerHTML = `<div class="mz-pvh"><b>Prévia · ${esc(pg.name)}</b><span class="mz-bps">${[['Desktop', 1440], ['Tablet', 768], ['Mobile', 390], ['Tela cheia', 0]].map(([n, x]) => `<button class="${w === x ? 'on' : ''}" onclick="mzPvOpen(${x})">${n}</button>`).join('')}</span><span class="mz-grow"></span><button class="btn sm" onclick="mzPvNewTab()">Abrir em nova aba</button><button class="btn sm dark" onclick="document.getElementById('mzPv').remove()">Fechar prévia</button></div><div class="mz-pvb"><iframe ${w ? `style="width:${w}px;max-width:100%"` : 'style="width:100%"'} srcdoc="${esc(html)}" title="Prévia"></iframe></div>`;
}
async function mzPvNewTab() { const html = await mzInlineImgDoc(mzM(), mzPg()); const b = new Blob([html], {type: 'text/html'}), u = URL.createObjectURL(b); window.open(u, '_blank'); }
async function mzBlobData(imgId) { const b = await imgGet(imgId); if (!b) return ''; return await new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); }); }
async function mzInlineImgDoc(m, pg) { const ids = new Set(); const sc = n => mzWalk(n, x => { [x.props.imgId, x.props.poster].concat(x.props.imgs || []).forEach(i => i && ids.add(i)); ['d', 't', 'm'].forEach(b => { String(x.style[b].backgroundImage || '').replace(/mzimg:([\w-]+)/g, (a, id) => { ids.add(id); return a; }); }); }); sc(pg.root); m.comps.forEach(c => sc(c.root)); const map = {}; for (const id of ids) map[id] = await mzBlobData(id); return mzDoc(m, pg, {img: id => map[id] || ''}); }

/* ---------- lançador (página do menu) ---------- */
function renderMesaLauncher() {
  const p = curProject(), r = document.getElementById('mesaRoot'); if (!r) return; if (!p) { r.innerHTML = noProject('Mesa de páginas'); return; }
  if (!p.mesa) p.mesa = normalizeMesa({}); if (!state.mesaLib) state.mesaLib = normalizeMesaLib({});
  const m = p.mesa; const pages = (m && m.pages) || [];
  r.innerHTML = hubHead('Mesa de páginas', 'Edite sites e landing pages arrastando e soltando, com Design System, versões e exportação para o Elementor, HTML ou ZIP.', `<button class="btn dark" onclick="mzOpen()">Abrir a mesa</button>`) +
    `<div class="panel"><div class="mz-launch"><div><h3 style="margin:0 0 6px">Como funciona</h3><ol class="mz-ol"><li>Escolha um modelo ou comece em branco. A mesa já puxa oferta, público, dores, logo, cores e fontes do projeto <b>${esc(p.name)}</b>.</li><li>Arraste elementos e blocos, edite o texto com duplo clique e ajuste Estilo e Layout à direita.</li><li>Veja Desktop, Tablet e Mobile lado a lado; o que você muda no tablet ou celular só vale ali.</li><li>Salve versões, aprove e exporte para o Elementor (grátis), HTML ou ZIP.</li></ol><p class="muted" style="font-size:12.5px">Este módulo convive com <b>Sites e landing pages</b> (formulário). Nada daquele módulo foi alterado.</p></div>
      <div class="mz-launch-b"><button class="btn dark" onclick="mzOpen()">Abrir a mesa${pages.length ? ' (' + pages.length + ' página' + (pages.length > 1 ? 's' : '') + ')' : ''}</button><button class="btn" onclick="mzOpenImport()">⬆ Importar (Elementor, HTML, JSON)</button><button class="btn" onclick="mzThOpen()">🎁 Subir tema (Envato, ZIP)</button></div></div></div>` +
    (pages.length ? `<div class="panel"><h3 style="margin-top:0">Páginas do site</h3><div class="list">${pages.map(pg => `<div class="list-item"><div><strong>${esc(pg.name)}${pg.home ? ' · início' : ''}</strong><small>/${esc(pg.slug)} · ${pg.kind === 'campaign' ? 'campanha' : 'página'}${pg.priv ? ' · privada' : ''}</small></div><button class="btn sm" onclick="mzOpen('${pg.id}')">Abrir</button></div>`).join('')}</div></div>` : `<div class="panel"><h3 style="margin-top:0">Comece por um modelo</h3><div class="mz-tpls">${MZ_TEMPLATES.map(t => `<button class="mz-tpl" onclick="mzStartTpl('${t.id}')"><b>${t.name}</b><small>${t.desc}</small></button>`).join('')}<button class="mz-tpl" onclick="mzStartTpl('blank')"><b>Em branco</b><small>Comece do zero</small></button></div></div>`);
}
function mzStartTpl(t) { const p = curProject(); if (!p) return; if (!p.mesa) p.mesa = normalizeMesa({}); if (!state.mesaLib) state.mesaLib = normalizeMesaLib({}); MZ.p = p; p.mesa.ds = p.mesa.rev === 0 && !p.mesa.pages.length ? mzDsFromBrand(p) : p.mesa.ds; const pg = mzPageNew(t); persist(); mzOpen(pg && pg.id); }
function mzOpenImport() { const p = curProject(); if (!p) return; mzOpen(); setTimeout(mzModalImport, 400); }
function renderMesa() { renderMesaLauncher(); }
