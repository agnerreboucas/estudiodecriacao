/* Mesa de páginas — Temas: subir um pacote (ZIP do Envato, kit do Elementor, tema de WordPress, site em HTML, JSON do Elementor, XML de demonstração),
   guardar como tema e usar: páginas inteiras, seções soltas e a identidade (cores e fontes). Tudo fica no navegador/servidor da usuária, não vai no pacote do Studio.
   Reaproveita o leitor de ZIP do importador de templates (tpl-import.js). Scripts, rastreadores e iframes são removidos. */
const MZTH = {cache: new Map(), pkgs: [], busy: false, files: []};
const mzThList = () => state.mesaThemes || (state.mesaThemes = []);
const mzThBase = n => String(n || '').replace(/\.[^.\/]+$/, '').replace(/^.*\//, '').replace(/[-_]+/g, ' ').trim();
const mzThHex = v => { v = String(v || '').trim().toLowerCase(); if (/^#[0-9a-f]{3}$/.test(v)) v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]; return /^#[0-9a-f]{6}$/.test(v) ? v : ''; };
const mzThFont = v => String(v || '').split(',')[0].replace(/['"]/g, '').replace(/[^\w \-]/g, '').trim().slice(0, 50);

/* ---------- interface: subir ---------- */
function mzThOpen() {
  showModal('⬆ Subir tema ou pacote', `<p class="muted" style="margin-top:0;font-size:12.5px">Suba o arquivo que você baixou (Envato Elements, ThemeForest ou outro site de templates): <b>.zip</b> de site em HTML, de <b>tema do WordPress</b> ou de <b>kit do Elementor</b> (pode ser o pacote inteiro, com ZIPs dentro); também aceito <b>.html</b>, <b>.json</b> do Elementor e o <b>.xml</b> de demonstração do WordPress.</p>
    <div class="mz-drop" id="mzThDrop" ondragover="event.preventDefault();this.classList.add('on')" ondragleave="this.classList.remove('on')" ondrop="event.preventDefault();this.classList.remove('on');mzThScan(Array.from(event.dataTransfer.files))"><b>Arraste o arquivo aqui</b><span>ou</span><button class="btn dark" onclick="document.getElementById('mzThFile').click()">Escolher arquivos</button><input type="file" id="mzThFile" multiple accept=".zip,.html,.htm,.json,.xml" style="display:none" onchange="mzThScan(Array.from(this.files))"></div>
    <small class="muted block" id="mzThMsg"></small><p class="muted" style="font-size:11.5px;margin-bottom:0">Use só pacotes que você tem licença para usar. O tema fica guardado no seu navegador (e no seu servidor, se a sincronização estiver ligada) e <b>não</b> vai dentro do pacote do Studio. Funciona o que é estrutura, texto, imagens e estilos; sliders, animações e códigos do tema não são trazidos.</p>`);
}
const mzThMsg = t => { const m = document.getElementById('mzThMsg'); if (m) m.textContent = t; };

/* ---------- leitura dos pacotes ---------- */
async function mzThScan(files) {
  if (!files.length || MZTH.busy) return; MZTH.busy = true; MZTH.pkgs = []; MZTH.files = files; mzThMsg('Lendo o pacote… (arquivos grandes podem levar alguns segundos)');
  try {
    for (const f of files) {
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      if (ext === 'zip') await mzThScanZip(f, f.name.replace(/\.zip$/i, ''), 0);
      else if (ext === 'html' || ext === 'htm') MZTH.pkgs.push({label: f.name, kind: 'html', tokens: await mzThHtmlTokens(await f.text()), items: [{type: 'htmlfile', label: f.name, file: f}], notes: []});
      else if (ext === 'json') { const j = JSON.parse(await f.text()); const items = mzThJsonItems(j, f.name); MZTH.pkgs.push({label: f.name, kind: 'elementor', tokens: mzThKitTokens(j), items, notes: items.length ? [] : ['Este JSON não parece um modelo do Elementor nem uma página da Mesa.']}); }
      else if (ext === 'xml') { const t = await f.text(); MZTH.pkgs.push({label: f.name, kind: 'wordpress', tokens: {}, items: mzThWxrItems(t), notes: []}); }
    }
    MZTH.pkgs = MZTH.pkgs.filter(p => p.items.length || (p.tokens && (Object.keys(p.tokens.colors || {}).length || (p.tokens.fonts || {}).heading)));
    if (!MZTH.pkgs.length) throw new Error('Não encontrei páginas, modelos ou estilos neste arquivo. Se for um pacote com vários ZIPs, confira se o tema/kit está dentro.');
    mzThReview();
  } catch (e) { mzThMsg(e.message); toast(e.message); } finally { MZTH.busy = false; }
}
async function mzThScanZip(blob, label, depth) {
  const z = await tplZipOpen(blob), names = [...z.ents.keys()];
  /* pacotes dentro de pacotes (o Envato costuma trazer o tema, o kit e a documentação em ZIPs separados) */
  if (depth < 2) for (const n of names.filter(x => /\.zip$/i.test(x) && !/(^|\/)(doc|help|licen|__)/i.test(x))) { const e = z.ents.get(n); if (e.us > 400e6) continue; try { await mzThScanZip(new Blob([await z.read(n)], {type: 'application/zip'}), mzThBase(n), depth + 1); } catch (err) { /* zip interno inválido: segue */ } }
  const pkg = {label, kind: '', zip: z, tokens: {colors: {}, fonts: {}}, items: [], notes: []}, kinds = new Set();
  /* kit do Elementor */
  const jsons = names.filter(n => /\.json$/i.test(n) && !/(^|\/)(package|composer|manifest|theme|tsconfig|\.eslintrc|bower|settings|site-settings)\.json$/i.test(n) && !/node_modules|vendor|\/lang|translations/i.test(n)); let manifest = {};
  const mf = names.find(n => /(^|\/)manifest\.json$/i.test(n)); if (mf) { try { manifest = JSON.parse(await z.text(mf)); } catch (e) { /* sem manifesto */ } }
  const ss = names.find(n => /(^|\/)site-settings\.json$/i.test(n)); if (ss) { try { Object.assign(pkg.tokens, mzThKitTokens(JSON.parse(await z.text(ss)))); kinds.add('elementor'); } catch (e) { /* ok */ } }
  for (const n of jsons.slice(0, 200)) { const e = z.ents.get(n); if (e.us > 8e6 || e.us < 40) continue; try { const j = JSON.parse(await z.text(n)); const its = mzThJsonItems(j, (manifest.templates && manifest.templates[(n.match(/(\d+)\.json$/) || [])[1]] || {}).title || mzThBase(n)); if (its.length) { kinds.add('elementor'); its.forEach(i => pkg.items.push(i)); } } catch (e2) { /* json qualquer */ } }
  /* tema do WordPress */
  const sty = names.find(n => /(^|\/)style\.css$/i.test(n) && n.split('/').length <= 3); let styCss = '';
  if (sty) { styCss = (await z.text(sty)).slice(0, 400000); if (/Theme Name\s*:/i.test(styCss.slice(0, 3000))) { kinds.add('wordpress'); pkg.label = (/Theme Name\s*:\s*(.+)/i.exec(styCss) || [])[1] || label; } }
  const tj = names.find(n => /(^|\/)theme\.json$/i.test(n)); if (tj) { try { mzThMergeTok(pkg.tokens, mzThThemeJsonTokens(JSON.parse(await z.text(tj)))); kinds.add('wordpress'); } catch (e) { /* ok */ } }
  /* XML de demonstração (WordPress) */
  for (const n of names.filter(x => /\.xml$/i.test(x) && z.ents.get(x).us < 90e6).slice(0, 6)) { try { const t = await z.text(n); if (/wp:wxr_version/.test(t.slice(0, 4000))) { const its = mzThWxrItems(t); if (its.length) { kinds.add('wordpress'); its.forEach(i => pkg.items.push(i)); } } } catch (e) { /* ok */ } }
  /* site em HTML (ou PHP simples) */
  if (!pkg.items.length || kinds.has('wordpress') && !kinds.has('elementor')) {
    const pages = tplPages(z).filter(p => !p.doc).slice(0, 60);
    if (pages.length && !(kinds.has('wordpress') && pkg.items.length)) { pages.forEach(p => pkg.items.push({type: 'html', label: p.path, path: p.path})); kinds.add('html'); }
  }
  /* cores e fontes do CSS, quando o pacote não disse nada */
  if (!Object.keys(pkg.tokens.colors).length || !pkg.tokens.fonts.heading) { let css = styCss; for (const n of names.filter(x => /\.css$/i.test(x) && !/(bootstrap|font-?awesome|animate|swiper|slick|owl|magnific|normalize|reset|\.min\.css$)/i.test(x)).slice(0, 6)) { if (z.ents.get(n).us < 900000) css += '\n' + await z.text(n); } mzThMergeTok(pkg.tokens, mzThCssTokens(css)); }
  pkg.kind = kinds.size > 1 ? 'mix' : ([...kinds][0] || 'html');
  if (kinds.has('wordpress') && !pkg.items.length) pkg.notes.push('É um tema de WordPress sem páginas de demonstração no pacote (os .php dependem do WordPress). Trago só as cores e as fontes. Se o pacote tem um XML de demonstração ou um kit do Elementor, suba-o também.');
  if (pkg.items.length || Object.keys(pkg.tokens.colors).length || pkg.tokens.fonts.heading) MZTH.pkgs.push(pkg);
}
function mzThJsonItems(j, label) {
  const out = []; if (j && j.mesaStudio || (j && j.mesa && j.mesa.pages)) { try { normalizeMesa(j.mesa).pages.forEach(p => out.push({type: 'mesa', label: p.name || label, page: p})); } catch (e) { /* ok */ } return out; }
  const arr = Array.isArray(j) ? j : (j && (j.content || j.elements)); if (!Array.isArray(arr) || !arr.length || !arr.some(e => e && (e.elType || e.widgetType))) return out;
  out.push({type: 'elementor', label: (j && j.title) || label, json: j}); return out;
}
function mzThWxrItems(xml) {
  const out = []; try { const d = new DOMParser().parseFromString(xml, 'text/xml'); Array.from(d.getElementsByTagName('item')).forEach(it => {
    const g = tag => { const e = it.getElementsByTagName(tag)[0]; return e ? e.textContent : ''; }, type = g('wp:post_type'); if (!/^(page|elementor_library|post)$/.test(type) || g('wp:status') === 'trash') return;
    let data = ''; Array.from(it.getElementsByTagName('wp:postmeta')).forEach(m => { if (m.getElementsByTagName('wp:meta_key')[0] && m.getElementsByTagName('wp:meta_key')[0].textContent === '_elementor_data') data = m.getElementsByTagName('wp:meta_value')[0].textContent; });
    if (!data) return; let j; try { j = JSON.parse(data); } catch (e) { return; } if (Array.isArray(j) && j.length) out.push({type: 'elementor', label: g('title') || 'Página', json: {title: g('title'), content: j}}); }); } catch (e) { /* xml inválido */ }
  return out;
}
/* ---------- cores e fontes ---------- */
function mzThKitTokens(j) {
  const t = {colors: {}, fonts: {}}, S = (j && j.settings) || {}, sc = Array.isArray(S.system_colors) ? S.system_colors : [], map = {primary: 'primary', secondary: 'secondary', text: 'text', accent: 'accent'};
  sc.forEach(c => { const k = map[c._id], h = mzThHex(c.color); if (k && h) t.colors[k] = h; }); (Array.isArray(S.custom_colors) ? S.custom_colors : []).slice(0, 4).forEach((c, i) => { const h = mzThHex(c.color); if (h && !Object.values(t.colors).includes(h) && !t.colors.extra1) t.colors['extra' + (i + 1)] = h; });
  (Array.isArray(S.system_typography) ? S.system_typography : []).forEach(ty => { const f = mzThFont(ty.typography_font_family); if (!f) return; if (ty._id === 'primary') t.fonts.heading = f; if (ty._id === 'text') t.fonts.body = f; if (!t.fonts.heading) t.fonts.heading = f; });
  if (t.fonts.heading && !t.fonts.body) t.fonts.body = t.fonts.heading; return t;
}
function mzThThemeJsonTokens(j) {
  const t = {colors: {}, fonts: {}}, S = (j && j.settings) || {}, pal = (S.color && S.color.palette) || []; const P = Array.isArray(pal) ? pal : (pal.theme || []);
  P.forEach(c => { const h = mzThHex(c.color), sl = String(c.slug || '').toLowerCase(); if (!h) return; if (/primary|brand/.test(sl)) t.colors.primary = t.colors.primary || h; else if (/secondary/.test(sl)) t.colors.secondary = t.colors.secondary || h; else if (/accent|tertiary/.test(sl)) t.colors.accent = t.colors.accent || h; else if (/^(base|background|bg)/.test(sl)) t.colors.background = t.colors.background || h; else if (/contrast|foreground|text|^fg/.test(sl)) t.colors.text = t.colors.text || h; });
  const ff = (S.typography && S.typography.fontFamilies) || []; const F = Array.isArray(ff) ? ff : (ff.theme || []); if (F[0]) t.fonts.heading = mzThFont(F[0].fontFamily); if (F[1] || F[0]) t.fonts.body = mzThFont((F[1] || F[0]).fontFamily); return t;
}
function mzThCssTokens(css) {
  const t = {colors: {}, fonts: {}}, cs = tplColors(css), fs = tplFonts(css).map(mzThFont).filter(Boolean); if (cs[0]) t.colors.primary = cs[0]; if (cs[1]) t.colors.accent = cs[1]; if (cs[2]) t.colors.secondary = cs[2];
  if (fs[0]) { t.fonts.heading = fs[0]; t.fonts.body = fs[1] || fs[0]; } return t;
}
async function mzThHtmlTokens(html) { const t = mzThCssTokens((html.match(/<style[\s\S]*?<\/style>/gi) || []).join('\n')); const g = [...html.matchAll(/fonts\.googleapis\.com\/css2?\?[^"'>\s]*family=([^"'&>\s:]+)/gi)].map(m => mzThFont(decodeURIComponent(m[1]).replace(/\+/g, ' '))).filter(Boolean); if (g[0]) { t.fonts.heading = g[0]; t.fonts.body = g[1] || g[0]; } return t; }
function mzThMergeTok(a, b) { if (!b) return; a.colors = a.colors || {}; a.fonts = a.fonts || {}; Object.keys(b.colors || {}).forEach(k => { if (!a.colors[k]) a.colors[k] = b.colors[k]; }); ['heading', 'body'].forEach(k => { if (!a.fonts[k] && b.fonts && b.fonts[k]) a.fonts[k] = b.fonts[k]; }); }

/* ---------- revisão ---------- */
function mzThReview() {
  const sw = tk => Object.values((tk && tk.colors) || {}).map(c => `<i class="mz-thsw" style="background:${c}" title="${c}"></i>`).join('');
  showModal('Revisar o que foi encontrado', `${MZTH.pkgs.length > 1 ? `<p class="mz-hint">Foram encontrados ${MZTH.pkgs.length} pacotes. Cada um vira um tema separado no seu banco de templates.</p>` : ''}
    ${MZTH.pkgs.map((p, pi) => `<div class="mz-thpk"><div class="field" style="margin:0 0 6px"><label>Nome do tema</label><input data-th-name="${pi}" value="${esc(p.label.slice(0, 60))}"></div><div class="mz-thpk-h"><span></span><span class="mz-thbadge">${({html: 'Site em HTML', wordpress: 'Tema/Demo WordPress', elementor: 'Kit/Modelos Elementor', mix: 'Pacote misto'})[p.kind]}</span></div>
      ${(p.tokens && (Object.keys(p.tokens.colors || {}).length || p.tokens.fonts.heading)) ? `<div class="mz-thtok"><label class="mz-ck"><input type="checkbox" data-th-tok="${pi}" checked> Guardar identidade: ${sw(p.tokens)} ${p.tokens.fonts && p.tokens.fonts.heading ? '<span>fontes: <b>' + esc(p.tokens.fonts.heading) + '</b>' + (p.tokens.fonts.body && p.tokens.fonts.body !== p.tokens.fonts.heading ? ' + <b>' + esc(p.tokens.fonts.body) + '</b>' : '') + '</span>' : ''}</label></div>` : ''}
      ${p.items.length ? `<div class="mz-thitems">${p.items.slice(0, 60).map((it, ii) => `<label class="mz-ck"><input type="checkbox" data-th-it="${pi}:${ii}" ${ii < 14 ? 'checked' : ''}> ${esc(String(it.label).replace(/^.*\//, '').slice(0, 60))} <small class="muted">${({elementor: 'Elementor', html: 'HTML', htmlfile: 'HTML', mesa: 'Mesa'})[it.type] || ''}</small></label>`).join('')}${p.items.length > 60 ? `<small class="muted">+ ${p.items.length - 60} não listados</small>` : ''}</div>` : ''}
      ${p.notes.map(n => `<p class="mz-hint">⚠ ${esc(n)}</p>`).join('')}</div>`).join('')}
    <small class="muted block" id="mzThMsg">Marque o que quer trazer. Cada página vira uma página da Mesa e cada bloco dela vira uma seção reutilizável.</small>
    <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" id="mzThGo" onclick="mzThImport()">Importar tema</button></div>`);
}
async function mzThImport() {
  if (MZTH.busy) return; MZTH.busy = true; const btn = document.getElementById('mzThGo'); btn.disabled = true; btn.textContent = 'Importando…';
  const checks = Array.from(document.querySelectorAll('[data-th-it]')).filter(c => c.checked).map(c => c.dataset.thIt.split(':').map(Number)), total = checks.length; let done = 0, made = 0, np = 0, ns = 0; const errs = [];
  try {
    for (let pi = 0; pi < MZTH.pkgs.length; pi++) {
      const p = MZTH.pkgs[pi], toks = {colors: {}, fonts: {}}, tk = document.querySelector(`[data-th-tok="${pi}"]`); if (tk && tk.checked) mzThMergeTok(toks, p.tokens);
      const mine = checks.filter(([a]) => a === pi), ctx = {miss: 0, imgs: new Map(), created: new Set(), fonts: new Map()}, pages = [], notes = [];
      for (const [, ii] of mine) {
        const it = p.items[ii]; if (!it) continue; btn.textContent = `Importando ${++done}/${total}…`;
        try {
          let pg = null;
          if (it.type === 'elementor') pg = (mzFromElementor(it.json, it.label) || [])[0]; else if (it.type === 'mesa') pg = it.page; else if (it.type === 'htmlfile') pg = await mzFromHtml(await it.file.text(), mzThBase(it.label)); else if (it.type === 'html') pg = await mzThHtmlPage(p.zip, it.path, ctx);
          if (pg && pg.root && pg.root.children.length) { pg.name = String(it.label.replace(/^.*\//, '').replace(/\.[^.]+$/, '') || pg.name).slice(0, 60) || pg.name; pages.push(pg); } else notes.push('Sem conteúdo visível: ' + it.label);
        } catch (e) { notes.push(it.label + ': ' + e.message); }
      }
      if (!pages.length && !Object.keys(toks.colors).length && !toks.fonts.heading) { if (mine.length) errs.push(p.label + ': nada pôde ser importado. ' + (notes[0] || '')); continue; }
      const name = ((document.querySelector(`[data-th-name="${pi}"]`) || {}).value || p.label || 'Tema').trim().slice(0, 80) || 'Tema', id = 'th_' + uid('x').replace(/^x_?/, ''), secs = [], seen = new Set();
      pages.forEach(pg => pg.root.children.forEach((s, i) => { if (secs.length >= 120) return; const nodes = mzCount(s); if (nodes < 2) return; let nm = ''; mzWalk(s, n => { if (!nm && n.type === 'heading' && n.props.text) nm = n.props.text.replace(/\s+/g, ' ').slice(0, 40); }); nm = nm || 'Seção ' + (i + 1); const key = nm + nodes; if (seen.has(key)) return; seen.add(key); s.name = s.name || nm; secs.push({id: mzId(), name: nm, root: s, n: nodes}); }));
      const used = new Set(); pages.forEach(pg => mzWalk(pg.root, n => { if (n.props && n.props.imgId) used.add(n.props.imgId); ['d', 't', 'm'].forEach(b => { const m = /mzimg:([\w-]+)/.exec((n.style[b] || {}).backgroundImage || ''); if (m) used.add(m[1]); }); }));
      const payload = {pages: pages.map(pg => ({id: mzId(), name: pg.name, root: pg.root})), sections: secs};
      await imgPut('mzth_' + id, new Blob([JSON.stringify(payload)], {type: 'application/json'}));
      const meta = {id, name, kind: p.kind, ts: new Date().toISOString(), source: (MZTH.files[0] || {}).name || '', ds: toks, pages: payload.pages.map(x => ({id: x.id, name: x.name})), sections: secs.map(x => ({id: x.id, name: x.name, n: x.n})), imgs: [...new Set([...used, ...ctx.created])].slice(0, 400), notes: notes.slice(0, 8).concat(ctx.miss ? [ctx.miss + ' imagem(ns) não encontrada(s) ou grande(s) demais foram ignoradas.'] : [])};
      mzThList().unshift(normalizeMesaThemes([meta])[0]); MZTH.cache.set(id, payload); made++; np += payload.pages.length; ns += secs.length;
    }
    if (!made) throw new Error(errs[0] || 'Nada foi importado: marque pelo menos uma página ou a identidade.');
    persist(); closeModal(); toast(`${made} tema(s) no banco: ${np} página(s) e ${ns} seção(ões).` + (errs.length ? ' Alguns pacotes falharam.' : ''));
    if (MZ.open) { MZ.left = 'lib'; mzLeftTab('lib'); } else if (typeof renderMesaLauncher === 'function') renderMesaLauncher();
  } catch (e) { toast(e.message); btn.disabled = false; btn.textContent = 'Importar tema'; } finally { MZTH.busy = false; }
}
/* uma página HTML do ZIP: CSS e imagens locais entram no documento, o resto é descartado */
async function mzThHtmlPage(z, path, ctx) {
  const root = path.split('/').slice(0, -1).join('/'), html = /\.php$/i.test(path) ? await tplPhp(z, path, 0, root) : await z.text(path), doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,noscript,iframe,object,embed').forEach(n => n.remove()); const ph = r => 'https://mz-theme.invalid/' + String(r).replace(/^tplimg:/, '');
  const fixCss = async (css, base) => (await tplUrls(css, z, base, ctx, null)).replace(/url\(\s*["']?tplimg:([\w-]+)["']?\s*\)/g, (m, id) => `url(${ph(id)})`).replace(/url\(\s*["']?data:image\/svg[^)]*\)/g, 'none');
  for (const st of Array.from(doc.querySelectorAll('style'))) st.textContent = (await fixCss(st.textContent.replace(/@import[^;]+;/g, ''), path)).replace(/@font-face\s*\{[^}]*\}/gi, '');
  for (const l of Array.from(doc.querySelectorAll('link[rel~=stylesheet][href]'))) { const h = l.getAttribute('href') || ''; if (/^(https?:)?\/\//i.test(h)) { l.remove(); continue; } const e = z.find(tplJoin(path, h)); if (!e || e.us > 1.5e6) { l.remove(); continue; } try { const st = doc.createElement('style'); st.textContent = (await fixCss((await z.text(e.name)).replace(/@import[^;]+;/g, ''), e.name)).replace(/@font-face\s*\{[^}]*\}/gi, ''); l.replaceWith(st); } catch (er) { l.remove(); } }
  for (const im of Array.from(doc.querySelectorAll('img'))) { const src = (im.getAttribute('src') || im.getAttribute('data-src') || '').trim(); im.removeAttribute('srcset'); if (/^data:image\/(png|jpe?g|webp|gif)/i.test(src)) continue; if (!src || /^(https?:)?\/\//i.test(src)) continue; const r = await tplImgData(z, tplJoin(path, src), ctx); if (r && r.startsWith('tplimg:')) im.setAttribute('src', ph(r)); else im.removeAttribute('src'); }
  for (const el of Array.from(doc.querySelectorAll('[style*="url("]'))) el.setAttribute('style', await fixCss(el.getAttribute('style'), path));
  return mzFromHtml('<!doctype html>' + doc.documentElement.outerHTML, mzThBase(path));
}

/* ---------- usar o tema ---------- */
async function mzThPayload(id) {
  if (MZTH.cache.has(id)) return MZTH.cache.get(id); const b = await imgGet('mzth_' + id); if (!b) throw new Error('Os dados deste tema não estão mais neste navegador. Suba o pacote de novo.');
  const j = JSON.parse(await b.text()), norm = n => mzNormNode(n), P = {pages: (j.pages || []).map(p => ({id: p.id, name: p.name, root: norm(p.root)})).filter(p => p.root), sections: (j.sections || []).map(s => ({id: s.id, name: s.name, n: s.n, root: norm(s.root)})).filter(s => s.root)}; MZTH.cache.set(id, P); return P;
}
async function mzThUsePage(th, pid) {
  try { const P = await mzThPayload(th), pg = P.pages.find(p => p.id === pid); if (!pg) return; const m = mzM(); if (m.pages.length >= MZ_LIMITS.pages) { toast('Limite de páginas atingido.'); return; }
    const root = mzFresh(pg.root), c = mzNormPage({id: mzId(), name: pg.name, slug: mzUniqueSlug(mzSlug(pg.name)), root}); c.id = mzId(); c.home = false; m.pages.push(c); persist(); mzPageOpen(c.id); toast('Página “' + pg.name + '” do tema aberta. Troque textos e imagens pelos do projeto.'); } catch (e) { toast(e.message); }
}
function mzThSection(th, sid) { const P = MZTH.cache.get(th); const s = P && P.sections.find(x => x.id === sid); return s ? mzFresh(s.root) : null; }
async function mzThApply(th) {
  const t = mzThList().find(x => x.id === th); if (!t) return; const m = mzM(); try { await mzVersionSave('Antes de aplicar o tema ' + t.name, true); } catch (e) { /* segue */ }
  const ds = mzNormDs(Object.assign({}, m.ds, {colors: Object.assign({}, m.ds.colors, t.ds.colors), fonts: Object.assign({}, m.ds.fonts, Object.fromEntries(Object.entries(t.ds.fonts).filter(([, v]) => v)))})); m.ds = ds; mzCommit({panels: true}); toast('Cores e fontes do tema aplicadas. Dá para voltar em Versões.');
}
async function mzThDelete(th) { const t = mzThList().find(x => x.id === th); if (!t || !confirm('Excluir o tema “' + t.name + '”? As páginas que você já criou a partir dele continuam.')) return; try { await imgDel('mzth_' + th); } catch (e) { /* ok */ } mzThList().splice(mzThList().indexOf(t), 1); MZTH.cache.delete(th); persist(); if (MZ.open) mzRefreshLeft(); else renderMesaLauncher(); }
/* ---------- painel ---------- */
function mzThPanel() {
  const L = mzThList(); return `<h4>Temas importados</h4><div class="row-gap" style="margin-bottom:8px"><button class="btn sm dark" onclick="mzThOpen()">⬆ Subir tema (ZIP, Elementor, HTML)</button></div>` + (L.length ? L.map(t => `<details class="mz-th" ${L.length === 1 ? 'open' : ''} ontoggle="if(this.open)mzThEnsure('${t.id}')"><summary><b>${esc(t.name)}</b> <small>${t.pages.length} pág. · ${t.sections.length} seç.</small></summary>
    <div class="mz-thtok">${Object.values(t.ds.colors).map(c => `<i class="mz-thsw" style="background:${c}"></i>`).join('')} ${t.ds.fonts.heading ? `<small>${esc(t.ds.fonts.heading)}${t.ds.fonts.body && t.ds.fonts.body !== t.ds.fonts.heading ? ' + ' + esc(t.ds.fonts.body) : ''}</small>` : ''}</div>
    <div class="row-gap" style="flex-wrap:wrap;margin:6px 0">${Object.keys(t.ds.colors).length || t.ds.fonts.heading ? `<button class="btn sm" onclick="mzThApply('${t.id}')">🎨 Aplicar cores e fontes</button>` : ''}<button class="btn sm" onclick="mzThDelete('${t.id}')">Excluir</button></div>
    ${t.pages.length ? `<h5>Páginas</h5>${t.pages.map(p => `<div class="mz-throw"><span>${esc(p.name)}</span><button class="btn sm" onclick="mzThUsePage('${t.id}','${p.id}')">Usar como página</button></div>`).join('')}` : ''}
    ${t.sections.length ? `<h5>Seções (arraste para a página)</h5><div class="mz-grid one">${t.sections.map(s => `<div class="mz-card row" onpointerdown='mzThDrag(event,${esc(JSON.stringify({kind: 'themeSec', th: t.id, id: s.id, type: 'section', label: s.name}))})' title="Arraste ou clique para inserir"><i>${mzI('layers', 22)}</i><span>${esc(s.name)}<small>${s.n} elementos</small></span></div>`).join('')}</div>` : ''}
    ${t.notes.map(n => `<p class="mz-hint">⚠ ${esc(n)}</p>`).join('')}</details>`).join('') : '<p class="mz-hint">Nenhum tema ainda. Suba o pacote que você baixou do Envato (ou de outro site) para usar as páginas e seções dele aqui.</p>');
}
async function mzThEnsure(id) { if (MZTH.cache.has(id)) return; try { await mzThPayload(id); } catch (e) { toast(e.message); } }
function mzThDrag(e, spec) { if (!MZTH.cache.has(spec.th)) { mzThEnsure(spec.th).then(() => toast('Tema carregado: tente de novo.')); return; } mzLibDrag(e, spec); }
/* ---------- ligação aos painéis ---------- */
const mzRefreshLeftBase = window.mzRefreshLeft;
window.mzRefreshLeft = function () { mzRefreshLeftBase(); if (MZ.left === 'lib') { const c = document.getElementById('mzLeftC'); if (c) c.insertAdjacentHTML('beforeend', '<div class="mz-thwrap">' + mzThPanel() + '</div>'); } };
const mzMakeSpecBase = window.mzMakeSpec;
window.mzMakeSpec = function (spec) { if (spec.kind === 'themeSec') return mzThSection(spec.th, spec.id); return mzMakeSpecBase(spec); };
