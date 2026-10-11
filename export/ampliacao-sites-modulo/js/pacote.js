/* ===== Pacote do Studio (.ampliacao): salva um projeto inteiro ou só algumas peças (anúncios, slides, carrosséis, páginas)
   com os dados, as imagens e as fontes enviadas, num único arquivo ZIP. Dá para abrir em outro computador, outro
   navegador ou por outra pessoa, e a peça volta igual (mesmas fontes, cores e imagens). ===== */
const PKG_GROUPS = [
  ['sets', 'Anúncios e peças de design', p => p.design.sets, x => x.name],
  ['carousels', 'Carrosséis', p => p.carousels, x => x.name],
  ['landings', 'Páginas e landing pages', p => p.landings, x => x.name],
  ['creatives', 'Criativos da lista', p => creativesOf(p.id), x => x.title]
];
const pkgUI = {scope: 'all', sel: {}};
const pkgExt = t => ({'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg'}[t] || (/font|octet/.test(t || '') ? 'bin' : 'bin'));

/* procura, dentro do JSON, tudo que é um id de arquivo guardado no navegador */
async function pkgFindMedia(obj) {
  const cand = new Set(); (function walk(v) { if (typeof v === 'string') { if (/^[A-Za-z0-9_-]{3,64}$/.test(v)) cand.add(v); } else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk); })(obj);
  const out = new Map(); for (const id of cand) { try { const b = await imgGet(id); if (b && b.size) out.set(id, b); } catch (e) { /* ignora */ } } return out;
}
function pkgFamilies(obj) {
  const f = new Set(); (function walk(v, k) { if (Array.isArray(v)) v.forEach(x => walk(x)); else if (v && typeof v === 'object') Object.entries(v).forEach(([kk, x]) => walk(x, kk)); else if (typeof v === 'string' && /^(family|h|b|head|body|font|fontFamily|hf|bf)$/.test(k || '') && v && v.length < 60 && !/^#/.test(v)) f.add(v); })(obj); return [...f];
}

async function pkgBuild(scope, sel) {
  const p = curProject(); if (!p) throw new Error('Abra um projeto primeiro.');
  const data = {kind: scope === 'all' ? 'project' : 'pieces', projectName: p.name, brandText: p.brand, designBrand: p.design.brand};
  if (scope === 'all') { data.project = p; data.creatives = creativesOf(p.id); }
  else {
    data.pieces = {sets: [], carousels: [], landings: [], creatives: []};
    PKG_GROUPS.forEach(([k, , get]) => { const ids = new Set(sel[k] || []); data.pieces[k] = get(p).filter(x => ids.has(x.id)); });
    if (!PKG_GROUPS.some(([k]) => data.pieces[k].length)) throw new Error('Marque pelo menos uma peça.');
  }
  const media = await pkgFindMedia(data);
  const lib = state.imglib.items.filter(i => media.has(i.imgId)); data.library = lib;
  const text = JSON.stringify(data), fonts = state.myFonts.filter(f => text.includes('"' + f.family + '"') || f.files.some(a => media.has(a.fileId)));
  const fm = await pkgFindMedia({myFonts: fonts}); fm.forEach((b, id) => media.set(id, b)); data.myFonts = fonts;
  const fam = pkgFamilies(data), mine = new Set(fonts.map(f => f.family)), pal = (data.designBrand && data.designBrand.c) || null;
  const files = [], enc = new TextEncoder(), idx = {};
  for (const [id, b] of media) { const n = 'midia/' + id + '.' + pkgExt(b.type); idx[id] = {file: n, type: b.type || ''}; files.push({name: n, data: new Uint8Array(await b.arrayBuffer())}); }
  const manifest = {app: 'ampliacao-studio', pacote: 1, schema: SCHEMA, kind: data.kind, nome: p.name, criado: new Date().toISOString(), midia: idx,
    fontes: fam.map(f => ({familia: f, origem: mine.has(f) ? 'enviada (dentro do pacote)' : 'Google Fonts'})), cores: pal,
    contagem: scope === 'all' ? {criativos: data.creatives.length, pecas: p.design.sets.length, carrosseis: p.carousels.length, paginas: p.landings.length} : Object.fromEntries(Object.entries(data.pieces).map(([k, v]) => [k, v.length]))};
  const leia = `PACOTE DO AMPLIAÇÃO STUDIO\n\nProjeto: ${p.name}\nCriado em: ${manifest.criado}\n\nComo abrir: no Ampliação Studio, vá em Configurações → Seus dados → "Abrir pacote" e escolha este arquivo.\nO pacote leva os dados, as imagens e as fontes enviadas por você. As fontes do Google são carregadas da internet pelo nome (lista no manifest.json).\nO arquivo é um ZIP comum: dá para abrir a pasta "midia" e pegar as imagens originais.\n`;
  files.unshift({name: 'manifest.json', data: enc.encode(JSON.stringify(manifest, null, 2))}, {name: 'dados.json', data: enc.encode(text)}, {name: 'LEIA-ME.txt', data: enc.encode(leia)});
  return {blob: makeZip(files), manifest, n: media.size};
}

async function pkgSave() {
  const sc = pkgUI.scope; try {
    toast('Montando o pacote…'); const r = await pkgBuild(sc, pkgUI.sel), p = curProject();
    download(`${slug(p.name)}-${sc === 'all' ? 'projeto' : 'pecas'}-${today()}.ampliacao`, r.blob, 'application/zip'); closeModal();
    toast(`Pacote salvo (${r.n} arquivo(s) de imagem/fonte). Guarde o .ampliacao: ele abre em qualquer Studio.`);
  } catch (e) { toast(e.message || 'Não consegui montar o pacote.'); }
}
function pkgOpen(pre) {
  const p = curProject(); if (!p) return;
  pkgUI.scope = pre ? 'pieces' : 'all'; pkgUI.sel = pre ? Object.fromEntries(Object.entries(pre)) : {};
  const grp = PKG_GROUPS.map(([k, t, get, nm]) => { const L = get(p); if (!L.length) return ''; return `<div style="margin:8px 0"><b style="font-size:12.5px">${t}</b>${L.map(x => `<label style="display:flex;gap:7px;align-items:center;font-size:12.5px;margin:3px 0"><input type="checkbox" class="pkgPc" data-k="${k}" value="${esc(x.id)}" ${(pkgUI.sel[k] || []).includes(x.id) ? 'checked' : ''}> ${esc(String(nm(x) || 'Sem nome').slice(0, 70))}</label>`).join('')}</div>`; }).join('');
  showModal('Salvar pacote', `<p style="font-size:13px;margin-top:0">O pacote junta <b>dados, imagens, cores e fontes enviadas</b> num arquivo <span class="mono">.ampliacao</span>. Depois você abre em outro projeto, outro computador ou manda para outra pessoa.</p>
    <label style="display:flex;gap:7px;margin:6px 0"><input type="radio" name="pkgSc" value="all" ${pre ? '' : 'checked'} onchange="pkgUI.scope='all';$('pkgPcs').style.display='none'"> Projeto inteiro: ${esc(p.name)}</label>
    <label style="display:flex;gap:7px;margin:6px 0"><input type="radio" name="pkgSc" value="pieces" ${pre ? 'checked' : ''} onchange="pkgUI.scope='pieces';$('pkgPcs').style.display=''"> Só algumas peças</label>
    <div id="pkgPcs" style="${pre ? '' : 'display:none;'}max-height:260px;overflow:auto;border:1px solid var(--line,#ddd);border-radius:8px;padding:6px 10px" onchange="pkgUI.sel={};document.querySelectorAll('.pkgPc:checked').forEach(c=>{(pkgUI.sel[c.dataset.k]=pkgUI.sel[c.dataset.k]||[]).push(c.value)})">${grp || '<span class="muted">Este projeto ainda não tem peças.</span>'}</div>
    <div class="modal-actions" style="margin-top:12px"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="pkgSave()">⬇ Salvar pacote</button></div>`);
}

/* ---------- abrir ---------- */
let PKG_PENDING = null;
async function pkgImportFile(file) {
  try {
    const z = await tplZipOpen(file), dec = t => JSON.parse(new TextDecoder().decode(t));
    if (!z.ents.has('manifest.json') || !z.ents.has('dados.json')) throw new Error('Esse arquivo não é um pacote do Ampliação Studio.');
    const man = dec(await z.read('manifest.json')); if (man.app !== 'ampliacao-studio') throw new Error('Esse arquivo não é um pacote do Ampliação Studio.');
    const data = dec(await z.read('dados.json')); PKG_PENDING = {z, man, data};
    const g = man.contagem || {}, resumo = Object.entries(g).map(([k, v]) => `${v} ${k}`).join(' · ');
    const fo = (man.fontes || []).map(f => `<li>${esc(f.familia)} <span class="muted">· ${esc(f.origem)}</span></li>`).join('');
    const cores = man.cores ? `<div style="display:flex;gap:4px;margin:6px 0">${Object.values(man.cores).filter(c => /^#[0-9a-f]{6}$/i.test(c)).map(c => `<span title="${c}" style="width:22px;height:22px;border-radius:5px;background:${c};border:1px solid #0002"></span>`).join('')}</div>` : '';
    let alvo = '';
    if (man.kind === 'pieces') alvo = `<div class="field"><label>Colocar as peças em</label><select id="pkgTo">${state.projects.map(p => `<option value="${p.id}" ${p.id === state.activeProjectId ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}<option value="__new">＋ Novo projeto</option></select></div><label style="display:flex;gap:7px;margin:8px 0;font-size:12.5px"><input type="checkbox" id="pkgBrand"> Usar também as cores e fontes da marca deste pacote no projeto</label>`;
    showModal('Abrir pacote', `<p style="font-size:13px;margin-top:0"><b>${esc(man.nome || 'Pacote')}</b> · salvo em ${esc(String(man.criado || '').slice(0, 10))}<br><span class="muted">${esc(resumo)} · ${Object.keys(man.midia || {}).length} imagem(ns)/fonte(s)</span></p>${cores}${fo ? `<p style="font-size:12.5px;margin:6px 0 2px">Fontes usadas:</p><ul style="margin:0 0 6px 18px;font-size:12.5px">${fo}</ul>` : ''}${alvo}
      <p class="muted" style="font-size:12px">${man.kind === 'project' ? 'O projeto entra como um projeto novo, ao lado dos que você já tem.' : 'As peças entram sem apagar nada do projeto escolhido.'}</p>
      <div class="modal-actions"><button class="btn" onclick="closeModal();PKG_PENDING=null">Cancelar</button><button class="btn dark" onclick="pkgApply()">Abrir</button></div>`);
  } catch (e) { toast('Não consegui abrir: ' + e.message); }
}
async function pkgApply() {
  const P = PKG_PENDING; if (!P) return; const {z, man, data} = P;
  try {
    for (const [id, m] of Object.entries(man.midia || {})) { if (!/^[A-Za-z0-9_-]{3,64}$/.test(id) || !z.ents.has(m.file)) continue; const old = await imgGet(id); if (old) continue; await imgPut(id, new Blob([await z.read(m.file)], {type: /^(image\/(png|jpeg|webp|gif)|application\/octet-stream|font\/[a-z0-9]+|)$/.test(m.type) ? m.type : ''})); }
    const lib = normalizeImglib({items: data.library || []}).items.filter(i => !state.imglib.items.some(x => x.imgId === i.imgId)); state.imglib.items.push(...lib);
    normalizeMyFonts(data.myFonts || []).forEach(f => { if (!state.myFonts.some(x => x.family === f.family)) state.myFonts.push(f); });
    let msg;
    if (man.kind === 'project') {
      const w = normalize({projects: [data.project], creatives: data.creatives || []}), p = w.projects[0];
      if (projectById(p.id)) { const old = p.id; p.id = uid('p'); w.creatives.forEach(c => { if (c.projectId === old) c.projectId = p.id; }); }
      w.creatives.forEach(c => { c.projectId = p.id; if (state.creatives.some(x => x.id === c.id)) c.id = uid('c'); });
      state.projects.push(p); state.creatives.push(...w.creatives); state.activeProjectId = p.id; msg = 'Projeto aberto: ' + p.name;
    } else {
      let to = $('pkgTo').value, p;
      const tmp = normalize({projects: [Object.assign({id: 'tmp', name: data.projectName || 'Projeto', design: {sets: (data.pieces || {}).sets || [], brand: {}, styles: [], bank: {h: [], s: [], c: []}, batches: [], logos: []}, carousels: (data.pieces || {}).carousels || [], landings: (data.pieces || {}).landings || []})], creatives: ((data.pieces || {}).creatives || []).map(c => Object.assign({}, c, {projectId: 'tmp'}))}).projects[0];
      const tc = normalize({projects: [{id: 'tmp', name: 'x'}], creatives: ((data.pieces || {}).creatives || []).map(c => Object.assign({}, c, {projectId: 'tmp'}))}).creatives;
      if (to === '__new') { p = newProject((data.projectName || 'Projeto') + ' (pacote)', ''); state.projects.push(p); } else p = projectById(to);
      const fresh = (arr, pre, have) => arr.map(x => { if (have.some(y => y.id === x.id)) x.id = uid(pre); return x; });
      const sets = fresh(tmp.design.sets, 'ds', p.design.sets), cars = fresh(tmp.carousels, 'car', p.carousels), lps = fresh(tmp.landings, 'lp', p.landings);
      lps.forEach(l => { if (l.siteId && !(p.sites || []).some(s => s.id === l.siteId)) l.siteId = ''; });
      p.design.sets.push(...sets); p.carousels.push(...cars); p.landings.push(...lps);
      tc.forEach(c => { c.projectId = p.id; if (state.creatives.some(x => x.id === c.id)) c.id = uid('c'); state.creatives.push(c); });
      if ($('pkgBrand') && $('pkgBrand').checked && data.designBrand && typeof data.designBrand === 'object') { p.design.brand = normalize({projects: [{id: 'tmp', name: 'x', design: {brand: data.designBrand}}]}).projects[0].design.brand; if (data.brandText) p.brand = Object.assign({}, p.brand, normalize({projects: [{id: 'tmp', name: 'x', brand: data.brandText}]}).projects[0].brand); }
      state.activeProjectId = p.id; msg = `${sets.length + cars.length + lps.length + tc.length} peça(s) abertas em ${p.name}`;
    }
    PKG_PENDING = null; persist(); closeModal(); if (typeof brandFontsLoad === 'function') { try { await brandFontsLoad(curProject()); } catch (e) { /* ok */ } } bootRender(); toast(msg);
  } catch (e) { toast('Não consegui abrir: ' + e.message); }
}
