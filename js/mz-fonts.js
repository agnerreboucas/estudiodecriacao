/* ===== Mesa: fontes dos temas =====
   Mostra que fontes a página usa e o que fazer com as que faltam: (1) as do Google Fonts carregam sozinhas, (2) as que estão na sua biblioteca
   (arquivos enviados) entram na página e na exportação, (3) as que não existem em lugar nenhum aparecem com o nome para você procurar, enviar o arquivo
   ou trocar por outra. Fontes da biblioteca viram @font-face (dados embutidos) no editor, na prévia e no HTML exportado. */
/* o módulo de sites não carrega o laboratório de logos, onde mora lgNorm (usado por fonts-mine.js) */
if (typeof lgNorm === 'undefined') window.lgNorm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const MZF = {st: {}, css: {}, busy: null};
const MZF_SYS = /^(Arial|Helvetica|Georgia|Times|Courier|Verdana|Tahoma|Trebuchet|Impact|system-ui|sans-serif|serif|monospace|inherit|initial|ui-)/i;
const mzFontInLib = f => typeof myFonts === 'function' && (myFonts().some(x => x.family === f) || (typeof PROJFONTS !== 'undefined' && PROJFONTS.some(x => x.family === f)));
function mzFontsUsed(roots) {
  const m = mzM(), s = new Set(); if (!roots) { [m.ds.fonts.heading, m.ds.fonts.body].forEach(f => f && s.add(f)); }
  (roots || m.pages.map(p => p.root)).forEach(r => mzTreeFonts(r, s));
  return [...s].map(f => String(f).trim()).filter(f => f && !MZF_SYS.test(f) && /^[A-Za-z][\w \-]{1,38}$/.test(f)).sort();
}
async function mzFontCheck(f) {
  if (mzFontInLib(f)) return 'lib'; if (MZF.st[f] && MZF.st[f] !== 'unknown') return MZF.st[f];
  try { const r = await fetch('https://fonts.googleapis.com/css2?family=' + encodeURIComponent(f).replace(/%20/g, '+') + '&display=swap'); MZF.st[f] = r.ok ? 'google' : 'missing'; } catch (e) { MZF.st[f] = 'unknown'; }
  return MZF.st[f];
}
/* @font-face das fontes da biblioteca (dados embutidos): mzFontsPrepare monta, mzFontFaceCss lê */
const mzFileB64 = blob => new Promise(res => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => res(''); r.readAsDataURL(blob); });
async function mzFontsPrepare(fams) {
  fams = fams || mzFontsUsed(); let changed = false;
  for (const fam of fams) {
    if (MZF.css[fam] !== undefined || !mzFontInLib(fam)) continue; const f = myFonts().find(x => x.family === fam) || (typeof PROJFONTS !== 'undefined' && PROJFONTS.find(x => x.family === fam)); let css = '';
    for (const x of (f && f.files) || []) {
      try { const src = x.path ? x.path : await (async () => { const b = await imgGet(x.fileId); return b ? await mzFileB64(b) : ''; })(); if (!src) continue; const fmt = /\.woff2$/i.test(x.name || '') ? 'woff2' : /\.woff$/i.test(x.name || '') ? 'woff' : /\.otf$/i.test(x.name || '') ? 'opentype' : 'truetype';
        css += `@font-face{font-family:'${fam.replace(/'/g, '')}';src:url("${src}") format('${fmt}');font-weight:${x.variable ? x.variable[0] + ' ' + x.variable[1] : x.weight || 400};font-style:${x.italic ? 'italic' : 'normal'};font-display:swap}\n`; } catch (e) { /* arquivo ilegível */ }
    }
    MZF.css[fam] = css; changed = true;
  }
  if (changed && MZ.open) mzRender();
}
function mzFontFaceCss(root) {
  const fams = mzFontsUsed(root ? [root] : null).filter(mzFontInLib); const miss = fams.filter(f => MZF.css[f] === undefined);
  if (miss.length && !MZF.busy) { MZF.busy = mzFontsPrepare(miss).finally(() => { MZF.busy = null; }); }
  return fams.map(f => MZF.css[f] || '').join('');
}
/* trocar uma família por outra em todas as páginas e no sistema de design */
function mzFontSwap(from, to) {
  const m = mzM(); const fix = v => String(v).split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '') === from ? `'${to}'` : x).join(', ');
  m.pages.forEach(pg => mzWalk(pg.root, n => {
    ['d', 't', 'm'].forEach(b => { const S = n.style && n.style[b]; if (S && S.fontFamily && S.fontFamily.indexOf(from) > -1) S.fontFamily = fix(S.fontFamily); });
    if (n.props && typeof n.props.html === 'string' && n.props.html.indexOf(from) > -1) n.props.html = n.props.html.split(`'${from}'`).join(`'${to}'`).split(`"${from}"`).join(`"${to}"`).split('font-family:' + from).join('font-family:' + to);
  }));
  ['heading', 'body'].forEach(k => { if (m.ds.fonts[k] === from) m.ds.fonts[k] = to; });
  mzCommit({panels: true});
}
async function mzFontAdd(files, want) {
  const before = new Set(myFonts().map(f => f.family)); await myAddFiles(files); const after = myFonts().map(f => f.family).filter(f => !before.has(f));
  MZF.st = {}; await mzFontsPrepare(); if (want && !mzFontInLib(want) && after.length === 1 && confirm(`A fonte enviada se chama “${after[0]}”, e a página pede “${want}”. Usar “${after[0]}” no lugar, em todas as páginas?`)) { await mzFontsPrepare([after[0]]); mzFontSwap(want, after[0]); }
  mzRender(); mzModalFonts();
}
function mzFontPick(want) { const f = document.createElement('input'); f.type = 'file'; f.accept = '.ttf,.otf,.woff,.woff2,.zip,font/*'; f.multiple = true; f.onchange = () => { if (f.files.length) mzFontAdd(f.files, want || ''); }; f.click(); }
function mzFontCopy(fam) { try { navigator.clipboard.writeText(fam); toast('Nome copiado: ' + fam); } catch (e) { toast(fam); } }
const MZF_LBL = {google: ['ok', 'Google Fonts: carrega sozinha'], lib: ['ok', 'Na sua biblioteca de fontes'], missing: ['bad', 'Não achei: precisa instalar'], unknown: ['warn', 'Sem internet para conferir']};
async function mzModalFonts(auto) {
  const fams = mzFontsUsed(), m = mzM(); if (!fams.length) { mzModal('Fontes da página', '<p>As páginas usam só fontes do sistema. Nada a instalar.</p>'); return; }
  const lib = typeof myFonts === 'function' ? myFonts().map(f => f.family) : [], opts = [...new Set(MZ_FONT_LIST.concat(lib))].sort();
  mzModal('Fontes das páginas', `<p class="mz-hint">Os temas usam fontes específicas. As do <b>Google Fonts</b> carregam sozinhas. As que não acho, você pode <b>enviar o arquivo</b> (.ttf, .otf, .woff, .woff2 ou um .zip), <b>procurar pelo nome</b> ou <b>trocar por outra</b>. Heading e texto do sistema: <b>${esc(m.ds.fonts.heading || '—')}</b> e <b>${esc(m.ds.fonts.body || '—')}</b>.</p><div id="mzFontRows" class="mz-fonts">${fams.map(f => `<div class="mz-frow" data-f="${esc(f)}"><b style="font-family:'${esc(f)}',sans-serif">${esc(f)}</b><span class="mz-fst warn">Conferindo…</span><span class="mz-fact"></span></div>`).join('')}</div><div class="mz-sec"><button class="btn sm dark" onclick="mzFontPick('')">Enviar arquivo de fonte</button> <small class="mz-hint">As fontes enviadas ficam na sua biblioteca e valem para todos os projetos.</small></div>`, {wide: true});
  await mzFontsPrepare(fams); let miss = 0;
  for (const f of fams) {
    const st = await mzFontCheck(f), row = document.querySelector(`#mzFontRows [data-f="${CSS.escape(f)}"]`); if (!row) continue; const [cls, txt] = MZF_LBL[st]; if (st === 'missing') miss++;
    row.querySelector('.mz-fst').className = 'mz-fst ' + cls; row.querySelector('.mz-fst').textContent = txt;
    row.querySelector('.mz-fact').innerHTML = st === 'missing' || st === 'unknown' ? `<button class="btn sm dark" onclick="mzFontPick('${esc(f)}')">Enviar arquivo</button><a class="btn sm" target="_blank" rel="noopener" href="https://fonts.google.com/?query=${encodeURIComponent(f)}">Procurar no Google Fonts</a><button class="btn sm" onclick="mzFontCopy('${esc(f)}')">Copiar nome</button><select onchange="if(this.value){mzFontSwap('${esc(f)}',this.value);mzModalFonts()}"><option value="">Trocar por…</option>${opts.map(o => `<option>${esc(o)}</option>`).join('')}</select>` : '';
  }
  if (!miss && auto) mzModalClose();
}
/* aviso depois de usar uma página de tema: só abre a janela se faltar alguma fonte */
async function mzFontsWatch() {
  try { const fams = mzFontsUsed(); await mzFontsPrepare(fams); const st = await Promise.all(fams.map(mzFontCheck)); const bad = fams.filter((f, i) => st[i] === 'missing'); if (bad.length) { toast('Faltam fontes: ' + bad.join(', ') + '. Abrindo a lista…'); mzModalFonts(true); } } catch (e) { /* sem aviso */ }
}
