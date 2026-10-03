/* ===== Minhas fontes: envie arquivos de fonte (TTF, OTF, WOFF, WOFF2) e eles entram no catálogo do Laboratório do Logo e dos editores =====
   O nome da família, os pesos e o itálico saem de dentro do arquivo (tabelas name/OS-2/fvar); WOFF2 usa o nome do arquivo. Os arquivos ficam no IndexedDB deste navegador. */
const MYFONT_SET = new Set(), MYFONT_LOADED = new Map();
const myFonts = () => { state.myFonts = Array.isArray(state.myFonts) ? state.myFonts : []; return state.myFonts; };
const MY_WNAME = [['thin', 100], ['hairline', 100], ['extralight', 200], ['ultralight', 200], ['extra light', 200], ['light', 300], ['regular', 400], ['normal', 400], ['book', 400], ['medium', 500], ['semibold', 600], ['semi bold', 600], ['demibold', 600], ['extrabold', 800], ['extra bold', 800], ['ultrabold', 800], ['bold', 700], ['black', 900], ['heavy', 900]];
const MY_CATS = [...LG_FONT_CATS];
function myGuessCat(fam) { const n = lgNorm(fam); if (/script|hand|brush|sign|callig|marker|cursive/.test(n)) return 'script'; if (/mono|code|courier|typewriter/.test(n)) return 'mono'; if (/slab|rockwell|serifa/.test(n)) return 'slab'; if (/serif|roman|garamond|didot|bodoni|caslon|baskerville|georgia|times|playfair/.test(n) && !/sans/.test(n)) return 'serif'; if (/cond|narrow|gothic|compress/.test(n)) return 'cond'; if (/display|black|poster|titling|impact/.test(n)) return 'display'; if (/round/.test(n)) return 'round'; return 'sans'; }
const mySafeFamily = s => String(s || '').replace(/[^\p{L}\p{N} \-._]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 60);
function myFromFilename(name) {
  let base = String(name).replace(/\.[^.]+$/, ''), n = base.replace(/[_]+/g, '-'), low = n.toLowerCase(), italic = /italic|oblique|slanted/.test(low), weight = 400;
  for (const [k, v] of MY_WNAME) if (low.replace(/\s|-/g, '').includes(k.replace(/\s/g, ''))) { weight = v; break; }
  let fam = n.replace(/([a-z])([A-Z])/g, '$1 $2').split('-')[0]; if (n.includes('-') === false) fam = n.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b(thin|extra ?light|light|regular|medium|semi ?bold|extra ?bold|bold|black|heavy|italic|oblique|variable)\b.*$/i, '');
  return {family: mySafeFamily(fam) || mySafeFamily(base) || 'Fonte', weight, italic, variable: null};
}
async function myInflate(u8) { const ds = new DecompressionStream('deflate'), w = ds.writable.getWriter(); w.write(u8); w.close(); return new Uint8Array(await new Response(ds.readable).arrayBuffer()); }
async function myParse(buf, filename) {
  const fallback = myFromFilename(filename); try {
    const dv = new DataView(buf), tag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3)); if (tag === 'wOF2') return fallback;
    const isW = tag === 'wOFF', n = dv.getUint16(isW ? 12 : 4), tabs = {};
    for (let i = 0; i < n; i++) { const o = (isW ? 44 : 12) + i * (isW ? 20 : 16), t = String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3)); tabs[t] = isW ? {off: dv.getUint32(o + 4), len: dv.getUint32(o + 8), orig: dv.getUint32(o + 12)} : {off: dv.getUint32(o + 8), len: dv.getUint32(o + 12), orig: dv.getUint32(o + 12)}; }
    const get = async t => { const e = tabs[t]; if (!e) return null; let u = new Uint8Array(buf, e.off, e.len); if (isW && e.len < e.orig) u = await myInflate(u); return new DataView(u.buffer, u.byteOffset, u.byteLength); };
    const nm = await get('name'); if (!nm) return fallback; const cnt = nm.getUint16(2), so = nm.getUint16(4), names = {};
    for (let i = 0; i < cnt; i++) { const r = 6 + i * 12, pid = nm.getUint16(r), id = nm.getUint16(r + 6), len = nm.getUint16(r + 8), off = nm.getUint16(r + 10); if (![1, 2, 4, 16, 17].includes(id)) continue; let s = ''; if (pid === 3 || pid === 0) for (let k = 0; k < len; k += 2) s += String.fromCharCode(nm.getUint16(so + off + k)); else for (let k = 0; k < len; k++) s += String.fromCharCode(nm.getUint8(so + off + k)); if (s && (pid === 3 || !names[id])) names[id] = s; }
    const fam = mySafeFamily(names[16] || names[1]) || fallback.family, sub = String(names[17] || names[2] || '').toLowerCase();
    let weight = fallback.weight, italic = /italic|oblique|slanted/.test(sub) || fallback.italic; const os2 = await get('OS/2'); if (os2 && os2.byteLength > 64) { const w = os2.getUint16(4); if (w >= 100 && w <= 1000) weight = Math.round(w / 100) * 100; italic = italic || !!(os2.getUint16(62) & 1); }
    let variable = null; const fv = await get('fvar'); if (fv) { const ao = fv.getUint16(4), ac = fv.getUint16(8), as = fv.getUint16(10); for (let i = 0; i < ac; i++) { const o = ao + i * as, t = String.fromCharCode(fv.getUint8(o), fv.getUint8(o + 1), fv.getUint8(o + 2), fv.getUint8(o + 3)); if (t === 'wght') variable = [Math.round(fv.getInt32(o + 4) / 65536), Math.round(fv.getInt32(o + 12) / 65536)]; } }
    return {family: fam, weight, italic, variable};
  } catch (e) { return fallback; }
}
function myWeightsOf(f) { const s = new Set(); if (!f.files) return [400]; f.files.forEach(x => { if (x.italic) return; if (x.variable) for (let w = 100; w <= 900; w += 100) { if (w >= x.variable[0] && w <= x.variable[1]) s.add(w); } else s.add(x.weight); }); if (!s.size) f.files.forEach(x => s.add(x.weight)); return [...s].sort((a, b) => a - b); }
function mySync() {
  MYFONT_SET.clear(); for (let i = LG_TYPEFACES.length - 1; i >= 0; i--) if (LG_TYPEFACES[i].mine) { delete FONT_META[LG_TYPEFACES[i].family]; delete LG_TF[LG_TYPEFACES[i].family]; LG_TYPEFACES.splice(i, 1); }
  [...myFonts(), ...PROJFONTS.filter(pf => !myFonts().some(f => f.family === pf.family))].forEach(f => { if (LG_TF[f.family] && !LG_TF[f.family].mine) return; MYFONT_SET.add(f.family); const ws = myWeightsOf(f), e = {family: f.family, cat: f.cat || 'sans', weights: ws.join(';'), scale: 1, mine: true, project: !!f.project}; LG_TYPEFACES.unshift(e); LG_TF[f.family] = e; FONT_META[f.family] = ws.length === 1 && ws[0] === 400 ? '' : ws.join(';'); });
  if (typeof FONT_LIST !== 'undefined') { FONT_LIST.length = 0; Object.keys(FONT_META).sort().forEach(k => FONT_LIST.push(k)); }
}
function myFontLoad(family) {
  if (MYFONT_LOADED.has(family)) return MYFONT_LOADED.get(family); const f = myFonts().find(x => x.family === family) || PROJFONTS.find(x => x.family === family); if (!f) return Promise.resolve();
  const p = (async () => { for (const x of f.files) { try { const src = x.path ? `url("${x.path.split('/').map(encodeURIComponent).join('/')}")` : await (async () => { const b = await imgGet(x.fileId); return b ? await b.arrayBuffer() : null; })(); if (!src) continue; const ff = new FontFace(family, src, {weight: x.variable ? x.variable[0] + ' ' + x.variable[1] : String(x.weight), style: x.italic ? 'italic' : 'normal'}); await ff.load(); document.fonts.add(ff); } catch (e) { /* arquivo ilegível */ } } })();
  MYFONT_LOADED.set(family, p); return p;
}
/* ZIP (armazenado ou deflate): extrai só as fontes */
async function myUnzip(file) {
  const buf = await file.arrayBuffer(), dv = new DataView(buf), u8 = new Uint8Array(buf), out = []; let e = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; } if (e < 0) throw new Error('ZIP inválido');
  const n = dv.getUint16(e + 10, true), cdOff = dv.getUint32(e + 16, true); let p = cdOff;
  for (let i = 0; i < n; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break; const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true), name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nlen)); p += 46 + nlen + xlen + clen;
    if (!/\.(ttf|otf|woff2?)$/i.test(name) || /__MACOSX|\/\._/.test(name)) continue; const lnl = dv.getUint16(lo + 26, true), lxl = dv.getUint16(lo + 28, true), start = lo + 30 + lnl + lxl; let data = u8.subarray(start, start + csize);
    if (method === 8) { const ds = new DecompressionStream('deflate-raw'), w = ds.writable.getWriter(); w.write(data); w.close(); data = new Uint8Array(await new Response(ds.readable).arrayBuffer()); } else if (method !== 0) continue;
    out.push(new File([data], name.split('/').pop(), {type: 'font/ttf'}));
  } return out;
}
/* pasta arrastada: percorre as subpastas */
async function myWalk(entry, acc) {
  if (!entry) return; if (entry.isFile) { await new Promise(res => entry.file(f => { acc.push(f); res(); }, res)); return; }
  if (entry.isDirectory) { const rd = entry.createReader(); for (;;) { const batch = await new Promise(res => rd.readEntries(res, () => res([]))); if (!batch.length) break; for (const en of batch) await myWalk(en, acc); } }
}
async function myCollect(items, files) {
  const acc = []; if (items && items.length && items[0].webkitGetAsEntry) { const ents = [...items].map(i => i.webkitGetAsEntry()).filter(Boolean); for (const en of ents) await myWalk(en, acc); } else acc.push(...(files || []));
  const out = []; for (const f of acc) { if (/\.zip$/i.test(f.name)) { try { out.push(...await myUnzip(f)); } catch (e) { toast('ZIP ilegível: ' + f.name); } } else out.push(f); } return out;
}
async function myAddFiles(files) {
  files = [...files]; const list = files.filter(f => /\.(ttf|otf|woff2?)$/i.test(f.name) && !/^\._/.test(f.name)), skipped = files.length - list.length, added = [], bad = [];
  if (!list.length) { toast('Envie arquivos .ttf, .otf, .woff ou .woff2.'); return; } toast('Lendo ' + list.length + ' arquivo(s)…'); let done = 0;
  for (const file of list) {
    if (++done % 10 === 0) toast('Lendo fontes… ' + done + ' de ' + list.length);
    try {
      if (file.size > 15_000_000) throw new Error('maior que 15 MB'); const buf = await file.arrayBuffer(), meta = await myParse(buf, file.name);
      const t = new FontFace('test-' + uid('f'), buf.slice(0)); await t.load();   // valida que o navegador abre o arquivo
      const fileId = uid('fnt'); await imgPut(fileId, file); let fam = myFonts().find(f => f.family === meta.family);
      if (!fam) { fam = {id: uid('mf'), family: meta.family, cat: myGuessCat(meta.family), files: [], created: new Date().toISOString()}; myFonts().push(fam); }
      const dup = fam.files.find(x => x.weight === meta.weight && !!x.italic === !!meta.italic && JSON.stringify(x.variable) === JSON.stringify(meta.variable));
      if (dup) { await imgDel(dup.fileId).catch(() => 0); fam.files = fam.files.filter(x => x !== dup); }
      fam.files.push({id: uid('ff'), fileId, name: file.name.slice(0, 80), weight: meta.weight, italic: !!meta.italic, variable: meta.variable}); MYFONT_LOADED.delete(fam.family); added.push(fam.family);
    } catch (e) { bad.push(file.name + ' (' + (e.message || 'não abriu') + ')'); }
  }
  mySync(); persist(); const fams = [...new Set(added)]; await Promise.all(fams.map(myFontLoad));
  toast(`${added.length} arquivo(s) em ${fams.length} família(s)${bad.length ? '. Não consegui: ' + bad.join('; ') : ''}${skipped ? '. ' + skipped + ' ignorado(s) por não serem fontes' : ''}.`);
  if (typeof renderDesign === 'function' && ui.page === 'design') renderDesign();
}
function myPick() { const f = document.createElement('input'); f.type = 'file'; f.accept = '.ttf,.otf,.woff,.woff2,.zip,font/*'; f.multiple = true; f.onchange = async () => myAddFiles(await myCollect(null, [...f.files])); f.click(); }
function myPickFolder() { const f = document.createElement('input'); f.type = 'file'; f.webkitdirectory = true; f.multiple = true; f.onchange = async () => myAddFiles(await myCollect(null, [...f.files])); f.click(); }
async function myDelFamily(id) { const f = myFonts().find(x => x.id === id); if (!f || !confirm('Remover a família “' + f.family + '” e todos os seus arquivos? Logos e peças que a usam voltam para uma fonte padrão.')) return; for (const x of f.files) await imgDel(x.fileId).catch(() => 0); state.myFonts = myFonts().filter(x => x.id !== id); (state.projects || []).forEach(p => { const fv = (p.design && p.design.logoLab && p.design.logoLab.brief || {}).fontFavs; if (fv) p.design.logoLab.brief.fontFavs = fv.filter(n => n !== f.family); }); MYFONT_LOADED.delete(f.family); mySync(); persist(); renderDesign(); }
function mySetCat(id, cat) { const f = myFonts().find(x => x.id === id); if (!f || !MY_CATS.some(c => c[0] === cat)) return; f.cat = cat; mySync(); persist(); renderDesign(); }
function myRename(id) { const f = myFonts().find(x => x.id === id); if (!f) return; const nn = mySafeFamily(prompt('Nome da família:', f.family)); if (!nn || nn === f.family) return; if (myFonts().some(x => x.family === nn) || (LG_TF[nn] && !LG_TF[nn].mine)) { toast('Já existe uma fonte com esse nome.'); return; } MYFONT_LOADED.delete(f.family); f.family = nn; mySync(); persist(); renderDesign(); }
function myManagerHTML() {
  const l = myFonts(), pf = PROJFONTS.length; return `<div class="lg-mine">${pf ? `<div class="lg-pfnote"><b>${pf} família(s) da pasta do projeto</b> (fonts/): já aparecem no catálogo com a etiqueta “projeto” e valem para todos os computadores.</div>` : ''}<div class="row-gap" style="justify-content:space-between;margin-bottom:6px"><div><b>Minhas fontes</b> <small class="muted">${l.length} família(s) · ${l.reduce((a, f) => a + f.files.length, 0)} arquivo(s)</small></div><div class="row-gap"><button class="btn sm" onclick="myPickFolder()" title="Escolhe uma pasta inteira (com subpastas)">＋ Enviar pasta</button><button class="btn sm dark" onclick="myPick()">＋ Enviar arquivos ou ZIP</button></div></div>
  <div class="lg-drop" id="myDrop" onclick="myPick()"><b>Arraste uma pasta, arquivos ou um ZIP de fontes aqui</b><small>.ttf · .otf · .woff · .woff2 (subpastas e ZIP incluídos); as famílias e os pesos são identificados sozinhos. Envie só fontes que você tem licença para usar.</small></div>
  ${l.length ? `<div class="lg-mlist">${l.map(f => `<div class="lg-mrow"><span class="lg-msample" style="font-family:'${esc(f.family)}',system-ui" data-fam="${esc(f.family)}">${esc(lgF.text || f.family)}</span><div class="lg-minfo"><b>${esc(f.family)}</b><small>${f.files.length} arquivo(s) · pesos ${myWeightsOf(f).join(', ')}${f.files.some(x => x.italic) ? ' · itálico' : ''}${f.files.some(x => x.variable) ? ' · variável' : ''}</small></div><select onchange="mySetCat('${esc(f.id)}',this.value)" title="Categoria">${MY_CATS.map(c => `<option value="${c[0]}" ${f.cat === c[0] ? 'selected' : ''}>${esc(c[1])}</option>`).join('')}</select><button class="btn sm" onclick="myRename('${esc(f.id)}')">Renomear</button><button class="btn sm" onclick="myDelFamily('${esc(f.id)}')">×</button></div>`).join('')}</div>` : ''}</div>`;
}
document.addEventListener('dragover', e => { if (e.target.closest && e.target.closest('#myDrop')) { e.preventDefault(); e.target.closest('#myDrop').classList.add('on'); } });
document.addEventListener('dragleave', e => { const d = e.target.closest && e.target.closest('#myDrop'); if (d) d.classList.remove('on'); });
document.addEventListener('drop', async e => { const d = e.target.closest && e.target.closest('#myDrop'); if (d) { e.preventDefault(); d.classList.remove('on'); const items = e.dataTransfer.items ? [...e.dataTransfer.items] : null, fl = [...e.dataTransfer.files]; myAddFiles(await myCollect(items, fl)); } });
/* ===== Fontes do projeto: a pasta fonts/ na raiz do site (gerada por tools/build_fonts.js → fonts/manifest.json). Vale para todos os computadores e não ocupa o navegador ===== */
const PROJFONTS = [];
async function pfLoadManifest() {
  if (location.protocol === 'file:') return;   // aberto como arquivo: o navegador bloqueia fetch local; as fontes do projeto só valem no servidor
  try { const r = await fetch('fonts/manifest.json', {cache: 'no-cache'}); if (!r.ok) return; const j = await r.json(); if (!Array.isArray(j.families)) return;
    PROJFONTS.length = 0; j.families.slice(0, 5000).forEach(f => { const fam = mySafeFamily(f.family); if (!fam || !Array.isArray(f.files)) return; PROJFONTS.push({id: 'pf-' + fam, family: fam, cat: MY_CATS.some(c => c[0] === f.cat) ? f.cat : myGuessCat(fam), project: true, files: f.files.filter(x => /^[\w\-. \/]+\.(ttf|otf|woff2?)$/i.test(x.path) && !x.path.includes('..')).map(x => ({path: 'fonts/' + x.path.replace(/^\/+/, ''), weight: Math.min(1000, Math.max(100, +x.weight || 400)), italic: !!x.italic, variable: Array.isArray(x.variable) ? [+x.variable[0] || 100, +x.variable[1] || 900] : null}))}); });
    mySync(); if (typeof renderDesign === 'function' && ui.page === 'design') renderDesign();
  } catch (e) { /* sem pasta fonts/ */ }
}
/* ao iniciar: registra no catálogo; os arquivos só são lidos quando a fonte é usada */
(function () { const boot = () => { try { if (typeof state !== 'undefined') mySync(); } catch (e) { /* estado ainda não pronto */ } }; document.addEventListener('DOMContentLoaded', () => { setTimeout(boot, 0); setTimeout(pfLoadManifest, 50); }); })();
