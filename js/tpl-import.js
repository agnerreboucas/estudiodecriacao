/* ===== Importador de templates (ZIP com HTML ou PHP simples): lê o ZIP no navegador, separa as seções de cada página, limpa (sem scripts,
   rastreadores, iframes) e guarda cada seção no banco global de templates. Nada é copiado do conteúdo do demo: textos, imagens e links viram
   campos editáveis (slots) e podem ser trocados pelos do projeto. O CSS é filtrado (só o que a seção usa) e isolado dentro da seção. ===== */
const TPL_KINDS = {header: 'Cabeçalho e menu', hero: 'Topo (hero)', about: 'Sobre', services: 'Serviços e áreas', team: 'Equipe', proof: 'Depoimentos', cases: 'Casos e portfólio', blog: 'Blog e notícias', contact: 'Contato e formulário', faq: 'Perguntas frequentes', price: 'Planos e preços', numbers: 'Números', cta: 'Chamada final', logos: 'Clientes e parceiros', footer: 'Rodapé', other: 'Outras seções'};
const TPL_R = {cache: new Map(), fonts: new Set(), css: []};
const tplStr = (s, n) => String(s == null ? '' : s).slice(0, n);
const tplB64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };

/* ---------- ZIP (leitura no navegador, sem biblioteca) ---------- */
async function tplZipOpen(blob) {
  const n = blob.size, tail = new Uint8Array(await blob.slice(Math.max(0, n - 66000), n).arrayBuffer()); let i = tail.length - 22;
  for (; i >= 0; i--) if (tail[i] === 0x50 && tail[i + 1] === 0x4b && tail[i + 2] === 5 && tail[i + 3] === 6) break;
  if (i < 0) throw new Error('Esse arquivo não é um ZIP válido.');
  const dv = new DataView(tail.buffer), cnt = dv.getUint16(i + 10, true), csz = dv.getUint32(i + 12, true), coff = dv.getUint32(i + 16, true);
  const cd = new DataView(await blob.slice(coff, coff + csz).arrayBuffer()), dec = new TextDecoder(), ents = new Map(); let p = 0;
  for (let k = 0; k < cnt && p + 46 <= cd.byteLength; k++) {
    if (cd.getUint32(p, true) !== 0x02014b50) break;
    const meth = cd.getUint16(p + 10, true), cs = cd.getUint32(p + 20, true), us = cd.getUint32(p + 24, true), nl = cd.getUint16(p + 28, true), el = cd.getUint16(p + 30, true), cl = cd.getUint16(p + 32, true), off = cd.getUint32(p + 42, true);
    const name = dec.decode(new Uint8Array(cd.buffer, cd.byteOffset + p + 46, nl)); p += 46 + nl + el + cl;
    if (name.endsWith('/') || /^__MACOSX\//.test(name) || /(^|\/)\._|\.DS_Store$/.test(name)) continue; ents.set(name, {name, meth, cs, us, off});
  }
  const low = new Map([...ents.keys()].map(k => [k.toLowerCase(), k]));
  const z = {blob, ents, low, cache: new Map(),
    find(path) { if (!path) return null; if (ents.has(path)) return ents.get(path); const l = path.toLowerCase(); if (low.has(l)) return ents.get(low.get(l)); const suf = '/' + l.replace(/^\/+/, ''); for (const [k, v] of low) if (k.endsWith(suf)) return ents.get(v); return null; },
    async read(name) {
      const e = ents.get(name); if (!e) throw new Error('arquivo ausente: ' + name);
      const h = new DataView(await blob.slice(e.off, e.off + 30).arrayBuffer()), start = e.off + 30 + h.getUint16(26, true) + h.getUint16(28, true), raw = blob.slice(start, start + e.cs);
      if (e.meth === 0) return new Uint8Array(await raw.arrayBuffer());
      if (e.meth !== 8) throw new Error('compressão não suportada');
      return new Uint8Array(await new Response(raw.stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
    },
    async text(name) { const k = 't:' + name; if (!z.cache.has(k)) z.cache.set(k, new TextDecoder('utf-8').decode(await z.read(name))); return z.cache.get(k); }};
  return z;
}
/* páginas de site encontradas (a documentação do template fica de fora, a menos que peçam) */
function tplPages(zip) {
  const all = [...zip.ents.keys()].filter(k => /\.(html?|php)$/i.test(k) && !/(^|\/)(node_modules|vendor|parts?|includes?|inc|partials?|layouts?|components?|template-parts|assets?|plugins?|libs?|tests?|examples?|bower_components)\//i.test(k)).map(k => ({path: k, size: zip.ents.get(k).us, doc: /(^|[\/_-])(docs?|documentation|help|manual)\//i.test(k) || /(^|\/)(doc|documentation)\.html?$/i.test(k)}));
  all.sort((a, b) => (a.doc - b.doc) || (/index/i.test(b.path) - /index/i.test(a.path)) || (a.path.split('/').length - b.path.split('/').length) || a.path.localeCompare(b.path)); return all;
}
const tplJoin = (base, rel) => { rel = String(rel || '').split('#')[0].split('?')[0].trim(); try { rel = decodeURIComponent(rel); } catch (e) { /* mantém */ } const root = rel.startsWith('/'), parts = (root ? [] : base.split('/').slice(0, -1)).concat(rel.split('/')), o = []; parts.forEach(s => { if (s === '..') o.pop(); else if (s && s !== '.') o.push(s); }); return o.join('/'); };

/* PHP simples: resolve include/require com caminho fixo e remove o resto do código PHP */
async function tplPhp(zip, path, depth, root) {
  let t = await zip.text(path); if (depth > 6) return '';
  const parts = []; let last = 0; const re = /<\?(?:php|=)?([\s\S]*?)(?:\?>|$)/g; let m;
  while ((m = re.exec(t))) { parts.push(t.slice(last, m.index)); const inc = [...m[1].matchAll(/(?:include|require)(?:_once)?\s*\(?\s*['"]([^'"]+)['"]/g)]; for (const x of inc) { const e = zip.find(tplJoin(root, x[1])) || zip.find(tplJoin(path, x[1])); parts.push(e ? await tplPhp(zip, e.name, depth + 1, root) : ''); } last = re.lastIndex; }
  parts.push(t.slice(last)); return parts.join('');
}

/* ---------- imagens e fontes do ZIP ---------- */
async function tplImgData(zip, path, ctx) {
  const e = zip.find(path); if (!e) { ctx.miss++; return ''; } if (ctx.imgs.has(e.name)) return ctx.imgs.get(e.name);
  let out = ''; const ext = ((e.name.match(/\.(\w+)$/) || [])[1] || '').toLowerCase();
  try {
    const u8 = await zip.read(e.name);
    if (ext === 'svg') out = u8.length <= 60000 ? 'data:image/svg+xml;base64,' + tplB64(u8) : '';
    else if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'bmp'].includes(ext)) {
      const bm = await createImageBitmap(new Blob([u8], {type: 'image/' + (ext === 'jpg' ? 'jpeg' : ext)})), s = Math.min(1, 1600 / Math.max(bm.width, bm.height)), c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(bm.width * s)); c.height = Math.max(1, Math.round(bm.height * s)); c.getContext('2d').drawImage(bm, 0, 0, c.width, c.height);
      const bl = await new Promise(r => c.toBlob(r, 'image/webp', 0.82)); if (bl) { const id = uid('img'); await imgPut(id, bl); ctx.created.add(id); out = 'tplimg:' + id; }
    }
  } catch (err) { ctx.miss++; }
  ctx.imgs.set(e.name, out); return out;
}
async function tplFontData(zip, path, ctx) {
  const e = zip.find(path); if (!e || e.us > 230000) return ''; if (ctx.fonts.has(e.name)) return ctx.fonts.get(e.name);
  let out = ''; try { const ext = (e.name.match(/\.(\w+)$/) || [])[1].toLowerCase(), mt = {woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf', otf: 'font/otf'}[ext]; if (mt) out = 'data:' + mt + ';base64,' + tplB64(await zip.read(e.name)); } catch (err) { /* sem fonte */ }
  ctx.fonts.set(e.name, out); return out;
}
async function tplAsyncReplace(str, re, fn) { const ms = [...str.matchAll(re)]; if (!ms.length) return str; const rs = await Promise.all(ms.map(m => fn(...m))); let o = '', i = 0; ms.forEach((m, k) => { o += str.slice(i, m.index) + rs[k]; i = m.index + m[0].length; }); return o + str.slice(i); }
/* url() dentro do CSS: imagens locais viram tplimg:ID (ou data: se forem SVG pequenos); o que for externo é descartado */
const tplUrlRe = /url\(\s*(['"]?)([^)'"]+)\1\s*\)/g;
const tplUrls = (css, zip, base, ctx, found) => tplAsyncReplace(css, tplUrlRe, async (m, q, u) => { u = u.trim(); if (/^data:/i.test(u)) return m; if (/^(https?:)?\/\//i.test(u) || u[0] === '#') return 'none'; const r = await tplImgData(zip, tplJoin(base, u), ctx); if (r && found) found.push(r); return r ? `url("${r}")` : 'none'; });

/* ---------- CSS: filtra e isola ---------- */
const TPL_DYN = /::?(?:hover|focus|focus-within|focus-visible|active|visited|link|target|checked|disabled|enabled|before|after|first-line|first-letter|placeholder|selection|backdrop|-webkit-[\w-]+|-moz-[\w-]+|-ms-[\w-]+)(?:\([^)]*\))?/gi;
function tplSplit(s) { const o = []; let d = 0, cur = ''; for (const ch of s) { if (ch === '(' || ch === '[') d++; else if (ch === ')' || ch === ']') d--; if (ch === ',' && !d) { o.push(cur); cur = ''; } else cur += ch; } if (cur.trim()) o.push(cur); return o.map(x => x.trim()).filter(Boolean); }
function tplScopeSel(sel) { let s = sel.replace(/(^|[\s>+~(,])(html|body|:root)(?![\w-])/gi, '$1#__S__'); s = s.replace(/#__S__(\s*[>+~]?\s*#__S__)+/g, '#__S__'); return s.includes('#__S__') ? s : '#__S__ ' + s; }
function tplMatcher(el) {
  const chain = []; for (let a = el; a && a.nodeType === 1; a = a.parentElement) chain.push(a);
  return sel => { let t = sel.replace(TPL_DYN, '').trim(); if (!t || /^(\*|html|body|:root)$/i.test(t)) return true; if (/[>+~]$/.test(t)) t += '*'; try { return chain.some(a => a.matches(t)) || !!el.querySelector(t); } catch (e) { return true; } };
}
async function tplRules(rules, ctx, o) {
  let out = '';
  for (const r of rules) {
    if (r.type === 1) {   // estilo
      const keep = tplSplit(r.selectorText).filter(o.match); if (!keep.length) continue;
      const bgIds = []; const body = await tplUrls(r.style.cssText, o.zip, o.base, ctx, bgIds);
      if (bgIds.length && /background/i.test(r.style.cssText)) { const id = bgIds[bgIds.length - 1]; keep.forEach(s => { let t = s.replace(TPL_DYN, '').trim(); if (!t || /[>+~]$/.test(t)) return; try { if (o.el.matches(t)) o.el.setAttribute('data-tpl-bg', id); o.el.querySelectorAll(t).forEach(x => x.setAttribute('data-tpl-bg', id)); } catch (e) { /* seletor estranho */ } }); }
      out += keep.map(tplScopeSel).join(',') + '{' + body + '}\n';
    } else if (r.type === 4 || r.type === 12) {   // @media, @supports
      const inner = await tplRules([...r.cssRules], ctx, o); if (inner.trim()) out += (r.type === 4 ? '@media ' : '@supports ') + (r.conditionText || (r.media && r.media.mediaText) || '') + '{' + inner + '}\n';
    } else if (r.type === 5) o.faces.push(r);
    else if (r.type === 7) o.keys.push(r);
  }
  return out;
}
const TPL_NEUTRAL = `#__S__ .wow,#__S__ [data-wow-delay],#__S__ [data-wow-duration],#__S__ [data-aos],#__S__ [data-sal],#__S__ .aos-init,#__S__ .reveal,#__S__ .animated{visibility:visible!important;opacity:1!important;transform:none!important;animation-name:none!important}#__S__ .owl-carousel,#__S__ .slick-slider,#__S__ .swiper-wrapper{display:flex!important;overflow-x:auto;gap:16px;scroll-snap-type:x mandatory;transform:none!important}#__S__ .owl-carousel>*,#__S__ .slick-slider>*,#__S__ .swiper-slide{flex:0 0 min(86%,380px)!important;width:auto!important;scroll-snap-align:start}#__S__ img{max-width:100%;height:auto}#__S__ .tpl-ph{background:#e5e7eb}`;
const TPL_NEUTRAL_HERO = `#__S__ .owl-carousel,#__S__ .slick-slider,#__S__ .swiper-wrapper{display:block!important;overflow:visible}#__S__ .owl-carousel>*:not(:first-child),#__S__ .slick-slider>*:not(:first-child),#__S__ .swiper-slide:not(:first-child){display:none!important}#__S__ .owl-carousel>*,#__S__ .slick-slider>*,#__S__ .swiper-slide{flex:none!important}`;
const TPL_NEUTRAL_HEADER = `#__S__ header,#__S__ [class*=sticky],#__S__ [class*=fixed]{position:relative!important;top:auto!important;transform:none!important}`;

/* ---------- classificação ---------- */
function tplKind(el, idx, total) {
  const tag = el.tagName.toLowerCase(), at = ((el.id || '') + ' ' + (el.className && el.className.baseVal != null ? el.className.baseVal : el.className || '')).toLowerCase(), hd = ((el.querySelector('h1,h2,h3') || {}).textContent || '').toLowerCase().slice(0, 120), all = at + ' ' + hd;
  if (tag === 'footer' || /footer/.test(at)) return 'footer'; if (tag === 'header' || tag === 'nav' || /\b(header|navbar|topbar|menu-area|top-bar)\b/.test(at)) return 'header';
  const T = [['hero', /banner|hero|slider|intro|jumbotron|main-slide|welcome|masthead/], ['faq', /faq|accordion|perguntas|question/], ['price', /pric|plan|package|tarif/], ['proof', /testimon|review|feedback|depoim|client-say|avalia/], ['team', /team|lawyer|attorney|staff|expert|member|advogad|doctor|gardener/], ['cases', /case|portfolio|project|work|gallery|result/], ['blog', /blog|news|article|post|noticia/], ['numbers', /counter|fun-?fact|stat|number|achiev/], ['logos', /brand|partner|logo|sponsor|client(?!-say)/], ['contact', /contact|appointment|consult|booking|schedule|form|quote/], ['cta', /cta|call-?to-?action|subscribe|newsletter|violence|emergency/], ['services', /service|practice|area|feature|what-we|offer|solution|choose|why/], ['about', /about|committed|who-we|story|mission|experience|how-?it/]];
  const hit = T.find(([, re]) => re.test(all)); if (hit) return hit[0]; return idx === 0 && total > 2 ? 'hero' : 'other';
}
const tplNameOf = (el, kind) => { const h = ((el.querySelector('h1,h2,h3') || {}).textContent || '').replace(/\s+/g, ' ').trim(); return h ? h.slice(0, 48) : TPL_KINDS[kind] || 'Seção'; };

/* ---------- análise de uma página ---------- */
const TPL_INL = new Set(['A', 'B', 'STRONG', 'I', 'EM', 'SPAN', 'BR', 'U', 'SMALL', 'SUP', 'SUB', 'MARK', 'ABBR', 'CODE', 'FONT', 'LABEL', 'S', 'DEL', 'INS', 'BDI', 'IMG', 'SVG', 'svg', 'WBR']);
const TPL_JUNK = '#preloader,.preloader,.loader-wrap,.page-loader,[class*=back-to-top],[class*=scroll-top],[class*=scrollup],[class*=scroll-to-top],[class*=cookie],.modal,.mfp-hide';
async function tplAnalyze(zip, path, ctx) {
  let html = /\.php$/i.test(path) ? await tplPhp(zip, path, 0, path) : await zip.text(path);
  const doc = new DOMParser().parseFromString(html, 'text/html'), body = doc.body; if (!body) return [];
  /* folhas de estilo locais, em ordem; fontes do Google ficam como referência (o app já carrega do Google Fonts) */
  const sheets = [], gf = new Set();
  for (const n of [...doc.querySelectorAll('link[rel~=stylesheet],style')]) {
    if (n.tagName === 'STYLE') { sheets.push({text: n.textContent, base: path}); continue; }
    const h = n.getAttribute('href') || ''; const g = h.match(/fonts\.googleapis\.com\/css2?\?(.+)/i); if (g) { [...g[1].matchAll(/family=([^&:;]+)/g)].forEach(f => gf.add(decodeURIComponent(f[1]).replace(/\+/g, ' '))); continue; } if (/^(https?:)?\/\//i.test(h)) { ctx.ext++; continue; }
    const e = zip.find(tplJoin(path, h)); if (e) { try { sheets.push({text: await zip.text(e.name), base: e.name}); } catch (err) { /* ignora */ } }
  }
  const parsed = []; for (const s of sheets) { try { const cs = new CSSStyleSheet(); cs.replaceSync(s.text.replace(/@import[^;]+;/g, '')); parsed.push({rules: [...cs.cssRules], base: s.base}); } catch (err) { /* css inválido */ } }
  /* seções: filhos diretos do corpo (desce por invólucros e <main>) */
  const sig = e => [...e.children].filter(c => !/^(SCRIPT|STYLE|LINK|NOSCRIPT|TEMPLATE|META)$/i.test(c.tagName) && !c.matches(TPL_JUNK) && !(c.hidden));
  let top = body; for (let k = 0; k < 4; k++) { let s = sig(top); const mn = s.filter(c => /^(MAIN)$/i.test(c.tagName)); if (mn.length === 1 && sig(mn[0]).length >= 2) { top = mn[0]; s = sig(top); break; } if (s.length === 1 && sig(s[0]).length >= 1) top = s[0]; else break; }
  let list = sig(top); if (list.length === 1 && /^(MAIN|DIV)$/i.test(list[0].tagName)) list = sig(list[0]);
  const expand = (e, d) => { if (d > 4 || e.outerHTML.length < 60000) return [e]; const k = sig(e); return k.length >= 3 ? k.flatMap(x => expand(x, d + 1)) : k.length === 1 ? expand(k[0], d + 1) : [e]; };
  list = list.flatMap(e => /^(HEADER|FOOTER|NAV)$/i.test(e.tagName) ? [e] : expand(e, 0));
  list = list.filter(c => (c.textContent || '').replace(/\s+/g, '').length > 30 || c.querySelector('img'));
  const out = [], bodyCls = (body.className || '') + ' ' + (doc.documentElement.className || '');
  for (let idx = 0; idx < list.length; idx++) {
    const el = list[idx], match = tplMatcher(el), o = {zip, el, match, faces: [], keys: [], base: path};
    let css = ''; for (const sh of parsed) { o.base = sh.base; css += await tplRules(sh.rules, ctx, o); }
    const kind = tplKind(el, idx, list.length), nm = tplNameOf(el, kind);
    /* marcação (da página original) fica na cópia: cada elemento com fundo vindo do CSS ganha data-tpl-bg */
    const wrap = doc.createElement('div'); wrap.id = '__S__'; wrap.className = bodyCls.replace(/\s+/g, ' ').trim();
    let inner = el.cloneNode(true); const chain = []; for (let a = el.parentElement; a && a !== body && a.nodeType === 1; a = a.parentElement) chain.unshift(a);
    let host = wrap; chain.forEach(a => { const c = doc.createElement(a.tagName.toLowerCase()); if (a.className) c.className = a.className; if (a.id) c.id = a.id; host.appendChild(c); host = c; }); host.appendChild(inner);
    const info = await tplClean(wrap, inner, doc, zip, path, ctx);
    /* @font-face usadas, @keyframes usados */
    const fontCss = []; for (const f of o.faces) { const fam = f.style.getPropertyValue('font-family').replace(/['"]/g, '').trim(); if (!fam || !(css + wrap.outerHTML).includes(fam)) continue; const src = f.style.getPropertyValue('src'), urls = [...src.matchAll(/url\(\s*['"]?([^)'"]+)['"]?\s*\)\s*(?:format\(\s*['"]?([\w-]+)['"]?\s*\))?/g)].sort((a, b) => (/woff2/.test(b[2] || b[1]) ? 1 : 0) - (/woff2/.test(a[2] || a[1]) ? 1 : 0)); let data = ''; for (const u of urls) { if (/^data:/.test(u[1])) { data = u[1]; break; } data = await tplFontData(zip, tplJoin(o.base, u[1]), ctx); if (data) break; } if (!data) continue; fontCss.push(`@font-face{font-family:"${fam.replace(/"/g, '')}";src:url(${data});font-weight:${f.style.getPropertyValue('font-weight') || 'normal'};font-style:${f.style.getPropertyValue('font-style') || 'normal'};font-display:swap}`); }
    const keys = o.keys.filter(k => new RegExp('animation[^;{}]*\\b' + k.name.replace(/[^\w-]/g, '') + '\\b').test(css)).map(k => k.cssText).join('\n');
    css += keys; css += TPL_NEUTRAL + (kind === 'hero' ? TPL_NEUTRAL_HERO : '') + (kind === 'header' ? TPL_NEUTRAL_HEADER : '');
    if (css.length > 700000) css = css.slice(0, 700000);
    const pl = {html: wrap.outerHTML, css, ff: fontCss, gf: [...gf].slice(0, 6), slots: info.slots, imgs: [...new Set([...css.matchAll(/tplimg:([\w-]+)/g), ...wrap.outerHTML.matchAll(/tplimg:([\w-]+)/g)].map(m => m[1]))], colors: tplColors(css + ' ' + wrap.outerHTML), fonts: tplFonts(css), ver: 1};
    out.push({kind, name: nm, payload: pl, order: idx, pending: info.forms, size: pl.html.length + pl.css.length});
  }
  return out;
}

/* limpeza + campos editáveis */
async function tplClean(wrap, inner, doc, zip, path, ctx) {
  wrap.querySelectorAll('script,noscript,iframe,object,embed,link,meta,base,style,template,video,audio,source,dialog,' + TPL_JUNK).forEach(e => e.remove());
  wrap.querySelectorAll('[style*="display:none"],[style*="display: none"],[hidden]').forEach(e => e.remove());
  let forms = 0; wrap.querySelectorAll('form').forEach(f => { const real = f.querySelector('textarea') || f.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=search])').length >= 2; if (!real) { f.remove(); return; } const d = doc.createElement('div'); d.setAttribute('data-tpl-form', ''); d.setAttribute('data-cta', ((f.querySelector('button,input[type=submit]') || {}).textContent || (f.querySelector('input[type=submit]') || {}).value || '').trim().slice(0, 40)); f.replaceWith(d); forms++; });
  wrap.querySelectorAll('form').forEach(f => f.remove());
  for (const e of [...wrap.querySelectorAll('*')]) {
    [...e.attributes].forEach(a => { const n = a.name.toLowerCase(); if (n.startsWith('on') || n === 'srcdoc' || n === 'formaction' || (/^(href|src|xlink:href)$/.test(n) && /^\s*javascript:/i.test(a.value))) e.removeAttribute(a.name); });
    const st = e.getAttribute && e.getAttribute('style'); if (st && /url\(/i.test(st)) { const f = []; const ns = await tplUrls(st, zip, path, ctx, f); e.setAttribute('style', ns); if (f.length && /background/i.test(st)) e.setAttribute('data-tpl-bg', f[f.length - 1]); }
    if (e.tagName === 'A') { const h = (e.getAttribute('href') || '').trim(); if (!/^(#|mailto:|tel:|https?:\/\/)/i.test(h)) e.setAttribute('href', '#'); else if (/^https?:/i.test(h)) { e.setAttribute('rel', 'noopener'); } e.removeAttribute('target'); }
  }
  for (const im of [...wrap.querySelectorAll('img')]) {
    const src = im.getAttribute('src') || im.getAttribute('data-src') || im.getAttribute('data-lazy-src') || im.getAttribute('data-original') || ''; let r = '';
    if (/^data:image\//i.test(src)) r = src; else if (src && !/^(https?:)?\/\//i.test(src)) r = await tplImgData(zip, tplJoin(path, src), ctx); else ctx.ext++;
    ['srcset', 'data-src', 'data-lazy-src', 'data-original', 'data-srcset', 'sizes', 'loading'].forEach(a => im.removeAttribute(a)); im.parentElement && im.parentElement.tagName === 'PICTURE' && [...im.parentElement.querySelectorAll('source')].forEach(s => s.remove());
    if (r) im.setAttribute('src', r); else { im.setAttribute('src', 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#e5e7eb"/></svg>')); im.classList.add('tpl-ph'); }
  }
  /* campos editáveis */
  const slots = {s: {}, i: {}, h: {}}; let ns = 0, ni = 0, nh = 0;
  const walk = e => { for (const c of [...e.children]) {
    if (/^svg$/i.test(c.tagName) || c.hasAttribute('data-tpl-form')) continue;
    const kids = [...c.children], leaf = kids.every(k => TPL_INL.has(k.tagName)), txt = (c.textContent || '').replace(/\s+/g, ' ').trim();
    if (leaf && txt.length >= 2 && ns < 140 && !/^(IMG|SCRIPT)$/i.test(c.tagName)) { ns++; c.setAttribute('data-s', ns); slots.s[ns] = {t: txt.slice(0, 600), g: c.tagName.toLowerCase()}; } else walk(c);
  } };
  walk(wrap);
  wrap.querySelectorAll('img,[data-tpl-bg]').forEach(e => { if (ni >= 40) return; ni++; e.setAttribute('data-i', ni); const isImg = e.tagName === 'IMG'; slots.i[ni] = {k: isImg ? 'img' : 'bg', v: isImg ? e.getAttribute('src') : e.getAttribute('data-tpl-bg'), a: (e.getAttribute('alt') || '').slice(0, 80)}; });
  wrap.querySelectorAll('a[href]').forEach(a => { if (nh >= 60) return; nh++; a.setAttribute('data-h', nh); slots.h[nh] = {h: a.getAttribute('href').slice(0, 300), t: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40)}; });
  return {slots, forms};
}
/* cores e fontes mais usadas (para trocar pelas da marca do projeto) */
function tplHexNorm(c) { c = c.toLowerCase(); return c.length === 4 ? '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c; }
function tplColors(txt) {
  const cnt = new Map(), add = h => { h = tplHexNorm(h); cnt.set(h, (cnt.get(h) || 0) + 1); };
  (txt.match(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi) || []).forEach(add); [...txt.matchAll(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/gi)].forEach(m => add('#' + [m[1], m[2], m[3]].map(v => Math.min(255, +v).toString(16).padStart(2, '0')).join('')));
  const sat = h => { const n = parseInt(h.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b); return {s: mx === 0 ? 0 : (mx - mn) / mx, l: (mx + mn) / 2}; };
  const BS = ['#007bff', '#dc3545', '#28a745', '#ffc107', '#6c757d', '#17a2b8', '#0d6efd', '#198754', '#0dcaf0', '#fd7e14', '#6f42c1', '#e83e8c', '#20c997', '#6610f2', '#d63384', '#212529', '#343a40'];
  const all = [...cnt.entries()].filter(([h]) => { const x = sat(h); return x.s > 0.25 && x.l > 0.12 && x.l < 0.92; }).sort((a, b) => b[1] - a[1]), own = all.filter(([h]) => !BS.includes(h));
  return (own.length ? own : all).slice(0, 4).map(x => x[0]);
}
function tplFonts(css) {
  const cnt = new Map(); [...css.matchAll(/font-family\s*:\s*([^;}]+)/gi)].forEach(m => { const f = m[1].split(',')[0].replace(/!important|['"]/g, '').trim(); if (f && !/var\(|awesome|icon|material|glyph|dashicons|themify|linearicons|ionicons|flaticon|elegant|feather|fontello|swiper|slick|owl|inherit|initial|sans-serif|serif|monospace|system-ui/i.test(f)) cnt.set(f, (cnt.get(f) || 0) + 1); });
  return [...cnt.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(x => x[0]);
}

/* ---------- payload no banco (IndexedDB) e renderização ---------- */
async function tplPayloadPut(id, pl) { await imgPut('tplp_' + id, new Blob([JSON.stringify(pl)], {type: 'application/json'})); TPL_R.cache.set(id, pl); }
async function tplPayload(id) {
  if (TPL_R.cache.has(id)) return TPL_R.cache.get(id); let pl = null; try { const b = await imgGet('tplp_' + id); if (b) pl = JSON.parse(await b.text()); } catch (e) { /* sem dado */ } TPL_R.cache.set(id, pl); return pl;
}
const tplTokCache = new Map();
async function tplTok(str, max) {
  const ids = [...new Set([...str.matchAll(/tplimg:([\w-]+)/g)].map(m => m[1]))], map = {};
  for (const id of ids) { const k = id + ':' + (max || 1400); if (!tplTokCache.has(k)) tplTokCache.set(k, await lpImg(id, max || 1400)); map[id] = tplTokCache.get(k); }
  return str.replace(/tplimg:([\w-]+)/g, (m, id) => map[id] || 'data:image/gif;base64,R0lGODlhAQABAAAAACw=');
}
const tplEsc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
function tplRecolor(css, map) { Object.entries(map || {}).forEach(([from, to]) => { if (!/^#[0-9a-f]{6}$/i.test(from) || !/^#[0-9a-f]{6}$/i.test(to)) return; const n = parseInt(from.slice(1), 16), rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255], m = parseInt(to.slice(1), 16), nr = [(m >> 16) & 255, (m >> 8) & 255, m & 255], short = /^#(.)\1(.)\2(.)\3$/i.exec(from); css = css.replace(new RegExp(from.replace('#', '#') + '(?![0-9a-f])', 'gi'), to); if (short) css = css.replace(new RegExp('#' + short[1] + short[2] + short[3] + '(?![0-9a-f])', 'gi'), to); css = css.replace(new RegExp('(rgba?)\\(\\s*' + rgb[0] + '\\s*,\\s*' + rgb[1] + '\\s*,\\s*' + rgb[2] + '(\\s*[,)])', 'gi'), (x, fn, e) => fn + '(' + nr.join(',') + e.replace(/^\s+/, '')); }); return css; }
function tplRefont(css, map) { Object.entries(map || {}).forEach(([from, to]) => { if (!from || !to) return; const f = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); css = css.replace(/font-family\s*:[^;}]+/gi, d => d.replace(new RegExp('([\'"]?)' + f + '\\1(?=\\s*(,|$|!))', 'i'), `"${to.replace(/[^\w \-]/g, '')}"`)); }); return css; }
/* HTML final de uma seção importada (já com os textos, imagens e links trocados) */
async function tplWidgetHTML(w, id, a, P, l, max) {
  const t = w.tpl || {}, pl = await tplPayload(t.id); if (!pl) return `<div id="${id}"${a} class="bx-ph">Template removido do banco.</div>`;
  const doc = new DOMParser().parseFromString(pl.html, 'text/html'), root = doc.body.firstElementChild; if (!root) return '';
  root.querySelectorAll('[data-s]').forEach(e => { const v = (t.s || {})[e.getAttribute('data-s')]; if (v == null) return; const tn = []; const wk = doc.createTreeWalker(e, 4); let n; while ((n = wk.nextNode())) if (n.nodeValue.trim() && !(n.parentElement && n.parentElement.closest('svg'))) tn.push(n); if (tn.length) { tn[0].nodeValue = v; tn.slice(1).forEach(x => { x.nodeValue = ''; }); } else e.textContent = v; });
  for (const e of [...root.querySelectorAll('[data-i]')]) { const n = e.getAttribute('data-i'), ov = (t.i || {})[n]; if (!ov) continue; const u = await lpImg(ov, max || 1400); if (!u) continue; if (e.tagName === 'IMG') { e.setAttribute('src', u); e.classList.remove('tpl-ph'); e.removeAttribute('width'); e.removeAttribute('height'); } else e.setAttribute('style', (e.getAttribute('style') || '') + `;background-image:url('${u}')!important;background-size:cover;background-position:center`); }
  root.querySelectorAll('[data-h]').forEach(e => { const v = (t.h || {})[e.getAttribute('data-h')]; if (v && /^(https?:\/\/[^\s"'<>]{1,500}|#[\w-]{1,60}|mailto:[^\s"'<>]{1,200}|tel:[+\d]{3,20})$/i.test(v)) e.setAttribute('href', v); });
  if (!P) root.querySelectorAll('[data-s],[data-i],[data-h],[data-tpl-bg]').forEach(e => ['data-s', 'data-i', 'data-h', 'data-tpl-bg'].forEach(k => e.removeAttribute(k)));
  root.id = id; if (P) root.setAttribute('data-bx', id); root.classList.add('tpl-root');
  let h = root.outerHTML.replace(/<div data-tpl-form=""(?: data-cta="([^"]*)")?><\/div>/g, (m, c) => { if (TPL_R.form) return '<p style="text-align:center"><a class="btn" href="#form">Falar com a gente</a></p>'; TPL_R.form = TPL_R.hf = true; return `<div id="form" class="bx-form">${lpFormBox(l, {cta: tplUnesc(c) || 'Enviar'})}</div>`; });
  let css = pl.css.split('#__S__').join('#' + id); css = tplRecolor(css, t.map); css = tplRefont(css, t.fonts);
  h = await tplTok(h, max); css = await tplTok(css, max);
  (pl.ff || []).forEach(f => { if (!TPL_R.fonts.has(f)) { TPL_R.fonts.add(f); TPL_R.css.push(f); } }); TPL_R.css.push(css);
  return h;
}
const tplUnesc = s => String(s || '').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
/* fontes do Google que a seção usa (para o <link> da página) */
function tplFontList(w) { const t = w.tpl || {}, pl = TPL_R.cache.get(t.id); return [...(pl && pl.gf || []), ...Object.values(t.fonts || {})].filter(Boolean); }
