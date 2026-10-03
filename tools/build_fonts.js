#!/usr/bin/env node
/* Varre fonts/ (com subpastas) e gera fonts/manifest.json: família, categoria sugerida, pesos, itálico e fontes variáveis.
   Uso: node tools/build_fonts.js [--only "Familia1,Familia2"] */
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const root = path.resolve(__dirname, '../fonts'), only = (() => { const i = process.argv.indexOf('--only'); return i > 0 ? process.argv[i + 1].split(',').map(s => s.trim().toLowerCase()) : null; })();
const WN = [['thin', 100], ['hairline', 100], ['extralight', 200], ['ultralight', 200], ['light', 300], ['regular', 400], ['normal', 400], ['book', 400], ['medium', 500], ['semibold', 600], ['demibold', 600], ['extrabold', 800], ['ultrabold', 800], ['bold', 700], ['black', 900], ['heavy', 900]];
const safe = s => String(s || '').replace(/[^\p{L}\p{N} \-._]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 60);
const norm = t => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function guessCat(fam) { const n = norm(fam); if (/script|hand|brush|sign|callig|marker|cursive/.test(n)) return 'script'; if (/mono|code|courier|typewriter/.test(n)) return 'mono'; if (/slab|rockwell/.test(n)) return 'slab'; if (/serif|roman|garamond|didot|bodoni|caslon|baskerville|georgia|times|playfair/.test(n) && !/sans/.test(n)) return 'serif'; if (/cond|narrow|gothic|compress/.test(n)) return 'cond'; if (/display|black|poster|titling|impact/.test(n)) return 'display'; if (/round/.test(n)) return 'round'; return 'sans'; }
function fromName(file) { const base = path.basename(file).replace(/\.[^.]+$/, ''), low = base.toLowerCase(); let weight = 400; for (const [k, v] of WN) if (low.replace(/[\s_-]/g, '').includes(k)) { weight = v; break; } const fam = base.replace(/([a-z])([A-Z])/g, '$1 $2').split(/[-_]/)[0]; return {family: safe(fam) || 'Fonte', weight, italic: /italic|oblique|slanted/.test(low), variable: null}; }
function parse(file) {
  const fb = fromName(file); try {
    let buf = fs.readFileSync(file); const tag = buf.toString('latin1', 0, 4); if (tag === 'wOF2') return fb;
    const isW = tag === 'wOFF', n = buf.readUInt16BE(isW ? 12 : 4), tabs = {};
    for (let i = 0; i < n; i++) { const o = (isW ? 44 : 12) + i * (isW ? 20 : 16), t = buf.toString('latin1', o, o + 4); tabs[t] = isW ? {off: buf.readUInt32BE(o + 4), len: buf.readUInt32BE(o + 8), orig: buf.readUInt32BE(o + 12)} : {off: buf.readUInt32BE(o + 8), len: buf.readUInt32BE(o + 12), orig: buf.readUInt32BE(o + 12)}; }
    const get = t => { const e = tabs[t]; if (!e) return null; let b = buf.subarray(e.off, e.off + e.len); if (isW && e.len < e.orig) b = zlib.inflateSync(b); return b; };
    const nm = get('name'); if (!nm) return fb; const cnt = nm.readUInt16BE(2), so = nm.readUInt16BE(4), names = {};
    for (let i = 0; i < cnt; i++) { const r = 6 + i * 12, pid = nm.readUInt16BE(r), id = nm.readUInt16BE(r + 6), len = nm.readUInt16BE(r + 8), off = nm.readUInt16BE(r + 10); if (![1, 2, 16, 17].includes(id)) continue; let s = ''; if (pid === 3 || pid === 0) for (let k = 0; k < len; k += 2) s += String.fromCharCode(nm.readUInt16BE(so + off + k)); else s = nm.toString('latin1', so + off, so + off + len); if (s && (pid === 3 || !names[id])) names[id] = s; }
    const family = safe(names[16] || names[1]) || fb.family, sub = String(names[17] || names[2] || '').toLowerCase(); let weight = fb.weight, italic = /italic|oblique|slanted/.test(sub) || fb.italic;
    const os2 = get('OS/2'); if (os2 && os2.length > 64) { const w = os2.readUInt16BE(4); if (w >= 100 && w <= 1000) weight = Math.round(w / 100) * 100; italic = italic || !!(os2.readUInt16BE(62) & 1); }
    let variable = null; const fv = get('fvar'); if (fv) { const ao = fv.readUInt16BE(4), ac = fv.readUInt16BE(8), as = fv.readUInt16BE(10); for (let i = 0; i < ac; i++) { const o = ao + i * as; if (fv.toString('latin1', o, o + 4) === 'wght') variable = [Math.round(fv.readInt32BE(o + 4) / 65536), Math.round(fv.readInt32BE(o + 12) / 65536)]; } }
    return {family, weight, italic, variable};
  } catch (e) { return fb; }
}
function walk(d, out) { for (const n of fs.readdirSync(d, {withFileTypes: true})) { const p = path.join(d, n.name); if (n.isDirectory()) walk(p, out); else if (/\.(ttf|otf|woff2?)$/i.test(n.name) && !n.name.startsWith('._')) out.push(p); } return out; }
if (!fs.existsSync(root)) { console.error('Pasta fonts/ não encontrada.'); process.exit(1); }
const catOverride = (() => { try { return JSON.parse(fs.readFileSync(path.join(root, 'categorias.json'), 'utf8')); } catch (e) { return {}; } })();
const fams = new Map(); let count = 0; const PREF = ['.woff2', '.woff', '.ttf', '.otf'];
/* um arquivo por estilo: lê os dados do primeiro formato legível (ttf/otf/woff) e publica o formato mais leve (woff2 > woff > ttf > otf) */
const groups = new Map(); walk(root, []).sort().forEach(f => { if (path.basename(path.dirname(f)).startsWith('_')) return; const key = f.replace(/\.[^.]+$/, ''); (groups.get(key) || groups.set(key, []).get(key)).push(f); });
groups.forEach(files => {
  const readable = files.find(f => /\.(ttf|otf|woff)$/i.test(f)) || files[0], m = parse(readable); if (only && !only.includes(m.family.toLowerCase())) return;
  const best = files.slice().sort((a, b) => PREF.indexOf(path.extname(a).toLowerCase()) - PREF.indexOf(path.extname(b).toLowerCase()))[0], rel = path.relative(root, best).split(path.sep).join('/');
  if (!/^[\w\-. \/]+$/.test(rel)) { console.warn('ignorado (nome com caracteres especiais):', rel); return; }
  if (!fams.has(m.family)) fams.set(m.family, {family: m.family, cat: catOverride[m.family] || guessCat(m.family), files: []}); fams.get(m.family).files.push({path: rel, weight: m.weight, italic: m.italic, variable: m.variable}); count++;
});
const families = [...fams.values()].sort((a, b) => a.family.localeCompare(b.family));
fs.writeFileSync(path.join(root, 'manifest.json'), JSON.stringify({generated: new Date().toISOString(), families}, null, 1));
console.log(`${families.length} famílias, ${count} estilos → fonts/manifest.json`);
