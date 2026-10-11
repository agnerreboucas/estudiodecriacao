/* ===== Mesa de edição de páginas · núcleo =====
   Modelo de dados, Design System (tokens), árvore de nós, normalizadores e geração de HTML/CSS.
   Tudo vive em projeto.mesa (um site por projeto) e state.mesaLib (biblioteca do usuário, vale para todos os projetos).
   Prefixo mz: não colide com o módulo antigo de Landings (lp). Sem módulos ES: scripts globais. */
const MZ_BP = {d: 1440, t: 768, m: 390};
const MZ_BPN = {d: 'Desktop', t: 'Tablet', m: 'Mobile'};
const MZ_CONT = ['page', 'section', 'container', 'column', 'div', 'form', 'link'];
const MZ_LEAF = ['heading', 'text', 'image', 'video', 'button', 'icon', 'svg', 'list', 'divider', 'spacer', 'input', 'checkbox', 'radio', 'menu', 'logo', 'badge', 'accordion', 'tabs', 'countdown', 'table', 'gallery', 'timeline', 'draw', 'component'];
const MZ_TYPES = MZ_CONT.concat(MZ_LEAF);
const MZ_NAMES = {page: 'Página', section: 'Seção', container: 'Contêiner', column: 'Coluna', div: 'Bloco', form: 'Formulário', link: 'Link', heading: 'Título', text: 'Texto', image: 'Imagem', video: 'Vídeo', button: 'Botão', icon: 'Ícone', svg: 'SVG', draw: 'Desenho', list: 'Lista', divider: 'Divisor', spacer: 'Espaço', input: 'Campo', checkbox: 'Caixa de seleção', radio: 'Opção', menu: 'Menu', logo: 'Logo', badge: 'Selo', accordion: 'Perguntas (acordeão)', tabs: 'Abas', countdown: 'Contagem regressiva', table: 'Tabela', gallery: 'Galeria', timeline: 'Linha do tempo', component: 'Componente'};
const MZ_PROPS = ('display flexDirection flexWrap justifyContent alignItems alignContent alignSelf flex flexGrow flexShrink flexBasis order gap rowGap columnGap gridTemplateColumns gridTemplateRows gridColumn gridRow gridAutoFlow placeItems position top right bottom left zIndex width height minWidth minHeight maxWidth maxHeight margin marginTop marginRight marginBottom marginLeft padding paddingTop paddingRight paddingBottom paddingLeft overflow overflowX overflowY color background backgroundColor backgroundImage backgroundSize backgroundPosition backgroundRepeat border borderTop borderRight borderBottom borderLeft borderWidth borderStyle borderColor borderRadius boxShadow opacity filter backdropFilter transform transition fontFamily fontSize fontWeight fontStyle lineHeight letterSpacing textAlign textTransform textDecoration whiteSpace objectFit objectPosition aspectRatio cursor mixBlendMode textShadow listStyle verticalAlign wordBreak clipPath WebkitTextStroke WebkitBackgroundClip backgroundClip WebkitTextFillColor isolation').split(' ');
const MZ_PROPSET = new Set(MZ_PROPS);
const MZ_INNER = new Set(['display', 'flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'alignContent', 'gap', 'rowGap', 'columnGap', 'gridTemplateColumns', 'gridTemplateRows', 'gridAutoFlow', 'placeItems']);
const MZ_PX = new Set(['top', 'right', 'bottom', 'left', 'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'gap', 'rowGap', 'columnGap', 'fontSize', 'borderRadius', 'borderWidth', 'letterSpacing', 'flexBasis']);
const MZ_LIMITS = {nodes: 3000, depth: 14, kids: 250, text: 20000, versions: 25, pages: 40, comps: 60, lib: 200};
const mzId = () => 'n' + Math.random().toString(36).slice(2, 9);
const mzKebab = k => k.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
const mzEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

/* ---------- Design System ---------- */
function mzDsDefault() {
  return {colors: {primary: '#111111', secondary: '#5d6068', accent: '#e4572e', background: '#ffffff', text: '#111111', muted: '#6b7280', success: '#16a34a', warning: '#d97706', error: '#dc2626'}, extra: [], fonts: {heading: 'Poppins', body: 'Inter'},
    type: {h1: {size: 56, weight: 800, lh: 1.05, ls: -1}, h2: {size: 40, weight: 700, lh: 1.12, ls: -0.5}, h3: {size: 26, weight: 700, lh: 1.2, ls: 0}, body: {size: 17, weight: 400, lh: 1.6, ls: 0}, small: {size: 14, weight: 400, lh: 1.5, ls: 0}, button: {size: 16, weight: 700, lh: 1.2, ls: 0}},
    space: {xs: 4, sm: 8, md: 16, lg: 32, xl: 64, xxl: 96}, radius: {sm: 6, md: 12, lg: 24}, border: {width: 1, color: '#e4e4ea'},
    shadow: {sm: '0 1px 2px rgba(0,0,0,.08)', md: '0 8px 24px -8px rgba(0,0,0,.22)', lg: '0 24px 60px -20px rgba(0,0,0,.35)'}, width: 1140};
}
const mzHex = v => /^#[0-9a-f]{6}$/i.test(String(v || ''));
const mzFont = v => String(v || '').replace(/[^\w \-]/g, '').trim().slice(0, 60);
function mzNormDs(x) {
  const D = mzDsDefault(); x = x && typeof x === 'object' ? x : {}; const num = (v, d, a, b) => { v = +v; return isNaN(v) ? d : Math.max(a, Math.min(b, v)); };
  Object.keys(D.colors).forEach(k => { if (x.colors && mzHex(x.colors[k])) D.colors[k] = x.colors[k].toLowerCase(); });
  D.extra = (Array.isArray(x.extra) ? x.extra : []).slice(0, 12).filter(c => c && mzHex(c.value)).map(c => ({name: String(c.name || 'Cor').slice(0, 30), value: c.value.toLowerCase()}));
  ['heading', 'body'].forEach(k => { const f = mzFont(x.fonts && x.fonts[k]); if (f) D.fonts[k] = f; });
  Object.keys(D.type).forEach(k => { const t = x.type && x.type[k]; if (t) D.type[k] = {size: num(t.size, D.type[k].size, 8, 200), weight: [300, 400, 500, 600, 700, 800, 900].includes(+t.weight) ? +t.weight : D.type[k].weight, lh: num(t.lh, D.type[k].lh, 0.8, 3), ls: num(t.ls, D.type[k].ls, -10, 20)}; });
  Object.keys(D.space).forEach(k => { D.space[k] = num(x.space && x.space[k], D.space[k], 0, 400); });
  Object.keys(D.radius).forEach(k => { D.radius[k] = num(x.radius && x.radius[k], D.radius[k], 0, 200); });
  if (x.border) { D.border.width = num(x.border.width, 1, 0, 20); if (mzHex(x.border.color)) D.border.color = x.border.color; }
  Object.keys(D.shadow).forEach(k => { const s = x.shadow && x.shadow[k]; if (typeof s === 'string' && /^[\w\s#%.,()\-]{0,120}$/.test(s)) D.shadow[k] = s; });
  D.width = num(x.width, 1140, 600, 2400); return D;
}
/* tokens → CSS (variáveis e classes de tipografia). Trocou o token, todas as páginas mudam. */
function mzDsCss(ds) {
  const v = [], c = ds.colors;
  Object.keys(c).forEach(k => v.push(`--mz-c-${k}:${c[k]}`)); ds.extra.forEach((e, i) => v.push(`--mz-c-x${i + 1}:${e.value}`));
  Object.keys(ds.space).forEach(k => v.push(`--mz-sp-${k}:${ds.space[k]}px`)); Object.keys(ds.radius).forEach(k => v.push(`--mz-r-${k}:${ds.radius[k]}px`));
  Object.keys(ds.shadow).forEach(k => v.push(`--mz-sh-${k}:${ds.shadow[k]}`)); v.push(`--mz-w:${ds.width}px`, `--mz-bw:${ds.border.width}px`, `--mz-bc:${ds.border.color}`, `--mz-f-h:'${ds.fonts.heading}',system-ui,sans-serif`, `--mz-f-b:'${ds.fonts.body}',system-ui,sans-serif`);
  const T = (k, font) => { const t = ds.type[k], f = k === 'h1' || k === 'h2' || k === 'h3' ? 'var(--mz-f-h)' : 'var(--mz-f-b)'; return {d: `font-family:${f};font-size:${t.size}px;font-weight:${t.weight};line-height:${t.lh};letter-spacing:${t.ls}px`, t: `font-size:${Math.round(t.size * (k === 'h1' ? 0.82 : k === 'h2' ? 0.86 : 0.95))}px`, m: `font-size:${Math.round(t.size * (k === 'h1' ? 0.62 : k === 'h2' ? 0.72 : k === 'h3' ? 0.84 : 0.95))}px`}; };
  let d = '', t = '', m = ''; Object.keys(ds.type).forEach(k => { const x = T(k); d += `.mz-t-${k}{${x.d}}`; t += `.mz-t-${k}{${x.t}}`; m += `.mz-t-${k}{${x.m}}`; });
  return `:root{${v.join(';')}}${d}@media (max-width:1024px){${t}}@media (max-width:767px){${m}}`;
}
/* Kit de marca do Studio → Design System */
function mzDsFromBrand(p) {
  const ds = mzDsDefault(); try { if (typeof brandOf === 'function' && p) { const b = brandOf(p), tk = brandTokens(p); if (tk) { ds.colors.background = tk.bg; ds.colors.text = tk.fg; ds.colors.accent = tk.accent; ds.colors.primary = tk.accent; ds.colors.secondary = tk.second || ds.colors.secondary; ds.colors.muted = tk.muted || ds.colors.muted; ds.fonts.heading = tk.head.family; ds.fonts.body = tk.body.family; } (b.extracted || []).slice(0, 4).forEach((h, i) => { if (mzHex(h)) ds.extra.push({name: 'Marca ' + (i + 1), value: h}); }); } } catch (e) { /* sem Kit de marca */ }
  return mzNormDs(ds);
}

/* ---------- nós ---------- */
const MZ_TYPO_DEFAULT = {heading: 'h2', text: 'body', button: 'button', badge: 'small', list: 'body', menu: 'body', input: 'body', accordion: 'body', tabs: 'body', table: 'body', timeline: 'body', countdown: 'h3', checkbox: 'body', radio: 'body'};
function mzNode(type, props, style, children, extra) {
  const n = Object.assign({id: mzId(), type, name: '', props: props || {}, style: {d: {}, t: {}, m: {}}, children: children || [], hidden: false, locked: false, cls: '', htmlId: '', attrs: {}, css: '', anim: {type: '', dur: 600, delay: 0}, vis: {d: true, t: true, m: true, from: '', to: '', param: ''}, typo: ''}, extra || {});
  if (style) { if (style.d || style.t || style.m) n.style = {d: Object.assign({}, style.d), t: Object.assign({}, style.t), m: Object.assign({}, style.m)}; else n.style.d = Object.assign({}, style); }
  return n;
}
const mzIsCont = n => MZ_CONT.includes(n.type);
function mzTypoOf(n) { if (n.typo === 'none') return ''; if (n.typo) return n.typo; if (n.type === 'heading') return ({1: 'h1', 2: 'h2', 3: 'h3', 4: 'h3', 5: 'h3', 6: 'h3'})[n.props.level || 2] || 'h2'; return MZ_TYPO_DEFAULT[n.type] || ''; }
function mzStyleAt(n, bp) { const s = Object.assign({}, n.style.d); if (bp === 't' || bp === 'm') Object.assign(s, n.style.t); if (bp === 'm') Object.assign(s, n.style.m); return s; }
function mzWalk(n, fn, parent, idx) { if (fn(n, parent, idx) === false) return; (n.children || []).forEach((c, i) => mzWalk(c, fn, n, i)); }
function mzFind(root, id) { let r = null; mzWalk(root, (n, parent, idx) => { if (n.id === id) { r = {node: n, parent, idx}; return false; } }); return r; }
function mzCount(n) { let c = 0; mzWalk(n, () => { c++; }); return c; }
function mzClone(n) { return JSON.parse(JSON.stringify(n)); }
function mzFresh(n) { const c = mzClone(n); mzWalk(c, x => { x.id = mzId(); }); return c; }
function mzIsDesc(root, anc, id) { const f = mzFind(anc, id); return !!f; }

/* ---------- normalização (todo JSON de fora passa por aqui) ---------- */
const MZ_STR = (v, n) => String(v == null ? '' : v).slice(0, n);
const MZ_URL = v => { v = String(v || '').trim(); return /^(https?:\/\/[^\s"'<>]{1,1500}|\/[^\s"'<>]{0,1500}|#[\w-]{0,80}|mailto:[^\s"'<>]{1,200}|tel:[+\d\s()\-]{3,30}|\{\{[\w.\-]{1,40}\}\})$/i.test(v) ? v : ''; };
function mzCssVal(k, v) {
  if (typeof v === 'number') return isFinite(v) ? (MZ_PX.has(k) ? v + 'px' : String(v)) : '';
  v = String(v == null ? '' : v).trim(); if (!v || v.length > 400) return '';
  if (/[;{}<>\\]|javascript:|expression\s*\(|@import|\/\*/i.test(v)) return '';
  if (/url\(/i.test(v)) { const okU = (v.match(/url\(([^)]*)\)/gi) || []).every(u => /^url\(\s*(?:mzimg:[\w-]{1,60}|https?:\/\/[^\s)'"]{1,600}|data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+\/=]+|\/[^\s)'"]{1,300})\s*\)$/i.test(u)); if (!okU || !/^[\w\s#%.,()/:+*\-"'!&=?]+$/.test(v.replace(/url\([^)]*\)/gi, 'u'))) return ''; return v; }
  return /^[\w\s#%.,()/:+*\-"'!&=?]+$/.test(v) ? v : '';
}
function mzNormStyle(s) { const o = {}; if (s && typeof s === 'object') Object.keys(s).slice(0, 80).forEach(k => { if (MZ_PROPSET.has(k)) { const v = mzCssVal(k, s[k]); if (v !== '') o[k] = v; } }); return o; }
const mzSafeSvg = h => { try { const d = new DOMParser().parseFromString(String(h || ''), 'image/svg+xml'), svg = d.documentElement; if (!svg || svg.nodeName.toLowerCase() !== 'svg' || d.querySelector('parsererror')) return ''; const ok = new Set(['svg', 'g', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'defs', 'lineargradient', 'radialgradient', 'stop', 'title', 'clippath', 'use']); const clean = n => { Array.from(n.childNodes).forEach(c => { if (c.nodeType === 1) { if (!ok.has(c.nodeName.toLowerCase())) { c.remove(); return; } Array.from(c.attributes).forEach(a => { if (/^on/i.test(a.name) || /javascript:/i.test(a.value) || (a.name === 'href' || a.name === 'xlink:href') && !/^#/.test(a.value)) c.removeAttribute(a.name); }); clean(c); } else if (c.nodeType !== 3) c.remove(); }); }; Array.from(svg.attributes).forEach(a => { if (/^on/i.test(a.name)) svg.removeAttribute(a.name); }); clean(svg); return new XMLSerializer().serializeToString(svg).slice(0, 20000); } catch (e) { return ''; } };
/* estilo de trecho: só propriedades de texto conhecidas, com valores restritos */
function mzRichStyle(v) {
  const out = []; String(v || '').split(';').forEach(d => { const i = d.indexOf(':'); if (i < 0) return; const k = d.slice(0, i).trim().toLowerCase(), x = d.slice(i + 1).trim(); if (!x || x.length > 160) return;
    const col = /^(#[0-9a-f]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*[\d.]+\s*)?\)|[a-z]{3,20}|var\(--mz-c-\w+\))$/i;
    if ((k === 'color' || k === 'background-color' || k === '-webkit-text-stroke-color') && col.test(x)) out.push(k + ':' + x);
    else if (k === 'font-weight' && /^(normal|bold|[1-9]00)$/.test(x)) out.push(k + ':' + x);
    else if (k === 'font-style' && /^(normal|italic)$/.test(x)) out.push(k + ':' + x);
    else if (k === 'font-size' && /^\d{1,3}(\.\d+)?(px|em|%)$/.test(x)) out.push(k + ':' + x);
    else if (k === 'font-family' && /^[\w ,'"-]{2,80}$/.test(x)) out.push(k + ':' + x);
    else if (k === 'letter-spacing' && /^-?\d{1,2}(\.\d+)?(px|em)$/.test(x)) out.push(k + ':' + x);
    else if (k === 'text-transform' && /^(none|uppercase|lowercase|capitalize)$/.test(x)) out.push(k + ':' + x);
    else if (k === 'text-decoration' && /^(none|underline|line-through)$/.test(x)) out.push(k + ':' + x);
    else if (k === '-webkit-text-stroke-width' && /^\d(\.\d+)?px$/.test(x)) out.push(k + ':' + x);
    else if (k === 'text-shadow' && /^[\w\s#%.,()-]+$/.test(x) && !/url|expression/i.test(x)) out.push(k + ':' + x);
    else if (k === 'background-image' && /^linear-gradient\([\w\s#%.,()-]+\)$/.test(x)) out.push(k + ':' + x);
    else if ((k === '-webkit-background-clip' || k === 'background-clip') && x === 'text') out.push(k + ':text');
    else if (k === '-webkit-text-fill-color' && col.test(x)) out.push(k + ':' + x); });
  return out.join(';');
}
/* texto rico: só negrito, itálico, sublinhado, link, quebra, marca-texto e cor */
function mzRich(h) {
  h = String(h == null ? '' : h).slice(0, MZ_LIMITS.text); if (!/[<&]/.test(h)) return mzEsc(h).replace(/\n/g, '<br>');
  try { const d = new DOMParser().parseFromString('<body>' + h + '</body>', 'text/html'), ok = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'A', 'BR', 'SPAN', 'MARK', 'SMALL', 'SUP', 'SUB', 'P', 'DIV', 'UL', 'OL', 'LI']);
    const walk = n => { Array.from(n.childNodes).forEach(c => { if (c.nodeType === 1) { if (/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|NOSCRIPT|TEMPLATE|SVG|MATH)$/.test(c.tagName)) { c.remove(); return; } if (!ok.has(c.tagName)) { c.replaceWith(...Array.from(c.childNodes)); return; } Array.from(c.attributes).forEach(a => { const nm = a.name.toLowerCase(); if (c.tagName === 'A' && nm === 'href' && MZ_URL(a.value)) return; if (c.tagName === 'A' && (nm === 'target' || nm === 'rel')) return; if (nm === 'style') { const ok2 = mzRichStyle(a.value); if (ok2) { c.setAttribute('style', ok2); return; } } c.removeAttribute(a.name); }); walk(c); } else if (c.nodeType !== 3) c.remove(); }); };
    walk(d.body); return d.body.innerHTML; } catch (e) { return mzEsc(h); }
}
function mzNormProps(type, p) {
  p = p && typeof p === 'object' ? p : {}; const o = {}, S = MZ_STR, id = v => /^[\w-]{1,80}$/.test(String(v || '')) ? String(v) : '', items = (arr, f, max) => (Array.isArray(arr) ? arr : []).slice(0, max || 40).map(f).filter(Boolean);
  if (type === 'heading') { o.text = S(p.text, 1500); o.html = p.html ? mzRich(p.html) : ''; o.hOf = S(p.hOf, 1500); o.level = [1, 2, 3, 4, 5, 6].includes(+p.level) ? +p.level : 2; }
  else if (type === 'text') o.html = mzRich(p.html != null ? p.html : p.text || '');
  else if (type === 'image' || type === 'logo') { o.imgId = id(p.imgId); o.src = MZ_URL(p.src); o.alt = S(p.alt, 200); o.href = MZ_URL(p.href); o.ovC = /^#[0-9a-fA-F]{3,8}$|^rgba?\([\d\s,.]{5,30}\)$/.test(p.ovC || '') ? p.ovC : ''; o.ovM = ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light', 'color', 'luminosity', 'darken', 'lighten', 'color-burn', 'color-dodge', 'difference'].includes(p.ovM) ? p.ovM : 'normal'; }
  else if (type === 'video') { o.url = MZ_URL(p.url); o.poster = id(p.poster); o.ratio = ['16/9', '4/3', '1/1', '9/16'].includes(p.ratio) ? p.ratio : '16/9'; }
  else if (type === 'button') { o.text = S(p.text, 120); o.href = MZ_URL(p.href); o.newTab = !!p.newTab; o.variant = ['solid', 'outline', 'ghost'].includes(p.variant) ? p.variant : 'solid'; }
  else if (type === 'icon') { o.name = /^[\w-]{1,30}$/.test(p.name || '') ? p.name : 'star'; o.size = Math.max(8, Math.min(200, +p.size || 32)); }
  else if (type === 'svg') o.svg = mzSafeSvg(p.svg);
  else if (type === 'list') { o.items = items(p.items, t => S(t, 400) || null, 40); o.ordered = !!p.ordered; o.icon = /^[\w-]{0,30}$/.test(p.icon || '') ? p.icon || '' : ''; }
  else if (type === 'divider') o.dummy = 0;
  else if (type === 'spacer') o.dummy = 0;
  else if (type === 'input') { o.kind = ['text', 'email', 'tel', 'number', 'textarea', 'select'].includes(p.kind) ? p.kind : 'text'; o.name = /^[\w-]{1,40}$/.test(p.name || '') ? p.name : 'campo'; o.label = S(p.label, 120); o.placeholder = S(p.placeholder, 120); o.required = !!p.required; o.options = items(p.options, t => S(t, 80) || null, 30); }
  else if (type === 'checkbox' || type === 'radio') { o.name = /^[\w-]{1,40}$/.test(p.name || '') ? p.name : 'opcao'; o.label = S(p.label, 300); o.value = S(p.value, 80) || 'sim'; o.required = !!p.required; }
  else if (type === 'menu') o.items = items(p.items, t => t && S(t.label, 60) ? {label: S(t.label, 60), href: MZ_URL(t.href) || '#'} : null, 20);
  else if (type === 'badge') o.text = S(p.text, 80);
  else if (type === 'draw') { o.w = Math.max(100, Math.min(4000, Math.round(+p.w) || 1440)); o.h = Math.max(100, Math.min(20000, Math.round(+p.h) || 800));
    o.strokes = (Array.isArray(p.strokes) ? p.strokes : []).slice(0, 500).map(k => { if (!k || typeof k !== 'object') return null; const pts = (Array.isArray(k.pts) ? k.pts : []).slice(0, 1600).map(v => Math.round((+v || 0) * 10) / 10); if (pts.length < 2) return null; if (pts.length % 2) pts.pop();
      return {c: /^#[0-9a-fA-F]{3,8}$/.test(k.c || '') ? k.c : '#111111', w: Math.max(1, Math.min(120, +k.w || 4)), o: Math.max(.05, Math.min(1, +k.o || 1)), k: ['pen', 'marker', 'hl'].includes(k.k) ? k.k : 'pen', pts}; }).filter(Boolean); }
  else if (type === 'accordion') o.items = items(p.items, t => t && S(t.q, 300) ? {q: S(t.q, 300), a: mzRich(t.a || '')} : null, 30);
  else if (type === 'tabs') o.items = items(p.items, t => t && S(t.t, 60) ? {t: S(t.t, 60), c: mzRich(t.c || '')} : null, 10);
  else if (type === 'countdown') { o.date = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(p.date || '') ? p.date : ''; o.done = S(p.done, 160); }
  else if (type === 'table') o.rows = (Array.isArray(p.rows) ? p.rows : []).slice(0, 30).map(r => (Array.isArray(r) ? r : []).slice(0, 8).map(c => S(c, 200)));
  else if (type === 'gallery') { o.imgs = items(p.imgs, t => id(t) || null, 24); o.cols = Math.max(1, Math.min(6, +p.cols || 3)); }
  else if (type === 'timeline') o.items = items(p.items, t => t && S(t.t, 120) ? {t: S(t.t, 120), d: S(t.d, 400), w: S(t.w, 40)} : null, 20);
  else if (type === 'component') o.ref = id(p.ref);
  else if (type === 'section' || type === 'container') { o.boxed = !!p.boxed; o.w = (+p.w || 0) ? Math.max(300, Math.min(2400, +p.w)) : 0; o.tag = ['section', 'header', 'footer', 'main', 'div'].includes(p.tag) ? p.tag : (type === 'section' ? 'section' : 'div'); }
  else if (type === 'link') { o.href = MZ_URL(p.href); o.newTab = !!p.newTab; }
  else if (type === 'form') { o.action = MZ_URL(p.action); o.thanks = MZ_URL(p.thanks); o.source = S(p.source, 60); }
  return o;
}
function mzNormNode(x, depth, ctr) {
  ctr = ctr || {n: 0}; depth = depth || 0; if (!x || typeof x !== 'object' || !MZ_TYPES.includes(x.type) || ctr.n >= MZ_LIMITS.nodes) return null; ctr.n++;
  const n = mzNode(x.type, mzNormProps(x.type, x.props)); n.id = /^[\w-]{1,40}$/.test(String(x.id || '')) ? String(x.id) : mzId(); n.name = MZ_STR(x.name, 60);
  ['d', 't', 'm'].forEach(b => { n.style[b] = mzNormStyle(x.style && x.style[b]); });
  n.hidden = !!x.hidden; n.locked = !!x.locked; n.cls = MZ_STR(x.cls, 120).replace(/[^\w\- ]/g, '').trim(); n.htmlId = /^[A-Za-z][\w-]{0,40}$/.test(x.htmlId || '') ? x.htmlId : '';
  n.typo = ['h1', 'h2', 'h3', 'body', 'small', 'button', 'none'].includes(x.typo) ? x.typo : '';
  if (x.attrs && typeof x.attrs === 'object') Object.keys(x.attrs).slice(0, 12).forEach(k => { if (/^(data-[\w-]{1,30}|aria-[\w-]{1,30}|title|role|alt|target|rel)$/.test(k)) n.attrs[k] = MZ_STR(x.attrs[k], 200).replace(/["<>]/g, ''); });
  n.css = typeof x.css === 'string' && !/[<>@]|javascript:|expression\s*\(|url\s*\(\s*['"]?\s*javascript/i.test(x.css) ? x.css.slice(0, 2000) : '';
  if (x.anim && typeof x.anim === 'object') n.anim = {type: ['', 'fade', 'up', 'down', 'left', 'right', 'zoom'].includes(x.anim.type) ? x.anim.type : '', dur: Math.max(100, Math.min(3000, +x.anim.dur || 600)), delay: Math.max(0, Math.min(3000, +x.anim.delay || 0))};
  if (x.vis && typeof x.vis === 'object') n.vis = {d: x.vis.d !== false, t: x.vis.t !== false, m: x.vis.m !== false, from: /^\d{4}-\d{2}-\d{2}/.test(x.vis.from || '') ? String(x.vis.from).slice(0, 16) : '', to: /^\d{4}-\d{2}-\d{2}/.test(x.vis.to || '') ? String(x.vis.to).slice(0, 16) : '', param: /^[\w-]{0,30}$/.test(x.vis.param || '') ? x.vis.param || '' : ''};
  if (MZ_CONT.includes(n.type) && depth < MZ_LIMITS.depth) n.children = (Array.isArray(x.children) ? x.children : []).slice(0, MZ_LIMITS.kids).map(c => mzNormNode(c, depth + 1, ctr)).filter(Boolean);
  return n;
}
function mzNormPage(x) {
  x = x && typeof x === 'object' ? x : {}; const root = mzNormNode(x.root) || mzNode('page'); root.type = 'page'; const sl = String(x.slug || '').toLowerCase().replace(/[^a-z0-9-/]/g, '').slice(0, 60);
  return {id: /^[\w-]{1,40}$/.test(x.id || '') ? x.id : mzId(), name: MZ_STR(x.name, 60) || 'Página', slug: sl, home: !!x.home, priv: !!x.priv, kind: x.kind === 'campaign' ? 'campaign' : 'page', seo: {title: MZ_STR(x.seo && x.seo.title, 120), desc: MZ_STR(x.seo && x.seo.desc, 300)}, bg: mzHex(x.bg) ? x.bg : '', guides: {v: (x.guides && Array.isArray(x.guides.v) ? x.guides.v : []).slice(0, 40).map(Number).filter(isFinite), h: (x.guides && Array.isArray(x.guides.h) ? x.guides.h : []).slice(0, 40).map(Number).filter(isFinite)}, root};
}
function normalizeMesa(x) {
  x = x && typeof x === 'object' ? x : {}; const out = {v: 1, rev: Math.max(0, Math.round(+x.rev) || 0), cur: '', ds: mzNormDs(x.ds), pages: [], comps: [], versions: [], favs: []};
  out.pages = (Array.isArray(x.pages) ? x.pages : []).slice(0, MZ_LIMITS.pages).map(mzNormPage);
  if (out.pages.length && !out.pages.some(p => p.home)) out.pages[0].home = true; else { let seen = false; out.pages.forEach(p => { if (p.home) { if (seen) p.home = false; seen = true; } }); }
  out.comps = (Array.isArray(x.comps) ? x.comps : []).slice(0, MZ_LIMITS.comps).map(c => { const r = mzNormNode(c && c.root); return r ? {id: /^[\w-]{1,40}$/.test(c.id || '') ? c.id : mzId(), name: MZ_STR(c.name, 60) || 'Componente', root: r} : null; }).filter(Boolean);
  out.versions = (Array.isArray(x.versions) ? x.versions : []).slice(0, MZ_LIMITS.versions).filter(v => v && typeof v.data === 'string' && v.data.length < 400000).map(v => ({id: /^[\w-]{1,40}$/.test(v.id || '') ? v.id : mzId(), name: MZ_STR(v.name, 80), ts: MZ_STR(v.ts, 40), approved: !!v.approved, auto: !!v.auto, data: v.data}));
  out.favs = (Array.isArray(x.favs) ? x.favs : []).slice(0, 60).filter(f => /^(el|pre|lib):[\w-]{1,60}$/.test(String(f))); out.cur = out.pages.some(p => p.id === x.cur) ? x.cur : (out.pages[0] ? out.pages[0].id : '');
  return out;
}
function normalizeMesaLib(x) {
  const items = (x && Array.isArray(x.items) ? x.items : []).slice(0, MZ_LIMITS.lib).map(i => { const r = mzNormNode(i && i.root); return r && ['section', 'component', 'block', 'page'].includes(i.kind) ? {id: /^[\w-]{1,40}$/.test(i.id || '') ? i.id : mzId(), kind: i.kind, name: MZ_STR(i.name, 60) || 'Item', root: r, ts: MZ_STR(i.ts, 40), from: MZ_STR(i.from, 80)} : null; }).filter(Boolean);
  return {items};
}
const mzPage = (m, id) => m.pages.find(p => p.id === (id || m.cur)) || m.pages[0];

/* ---------- geração de HTML e CSS ---------- */
const MZ_ICONS = {};   // preenchido em mz-presets.js
function mzIcon(name, size) { const d = MZ_ICONS[name] || MZ_ICONS.star || ''; return `<svg viewBox="0 0 24 24" width="${size || 24}" height="${size || 24}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`; }
const mzCls = n => 'n_' + n.id.replace(/[^\w-]/g, '');
function mzVideoEmbed(u) {
  let m; if ((m = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/.exec(u))) return {iframe: `https://www.youtube-nocookie.com/embed/${m[1]}`};
  if ((m = /vimeo\.com\/(\d+)/.exec(u))) return {iframe: `https://player.vimeo.com/video/${m[1]}`}; return u ? {file: u} : null;
}
function mzDrawPath(pts) { if (pts.length < 4) return `M${pts[0]} ${pts[1]}l.01 .01`; let d = `M${pts[0]} ${pts[1]}`; for (let i = 2; i < pts.length - 2; i += 2) { const mx = (pts[i] + pts[i + 2]) / 2, my = (pts[i + 1] + pts[i + 3]) / 2; d += `Q${pts[i]} ${pts[i + 1]} ${Math.round(mx * 10) / 10} ${Math.round(my * 10) / 10}`; } return d + `L${pts[pts.length - 2]} ${pts[pts.length - 1]}`; }
function mzDrawSvg(P) { return `<svg viewBox="0 0 ${P.w} ${P.h}" width="100%" xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible">${(P.strokes || []).map(k => `<path d="${mzDrawPath(k.pts)}" fill="none" stroke="${k.c}" stroke-width="${k.w}" stroke-opacity="${k.o}" stroke-linecap="${k.k === 'hl' ? 'square' : 'round'}" stroke-linejoin="round"/>`).join('')}</svg>`; }
/* ctx: {mode:'edit'|'out', comps, img(imgId)→url, ds} */
function mzNodeHtml(n, ctx, root) {
  if (n.hidden) return ''; const ed = ctx.mode === 'edit', P = n.props, cls = ['mz-e', mzCls(n)], mt = mzTypoOf(n);
  if (mt) cls.push('mz-t-' + mt); if (n.cls) cls.push(n.cls); if (n.anim.type && !ed) cls.push('mz-an', 'mz-an-' + n.anim.type);
  const at = []; if (ed) at.push(`data-n="${n.id}"`, `data-type="${n.type}"`); if (n.htmlId) at.push(`id="${n.htmlId}"`);
  Object.keys(n.attrs || {}).forEach(k => at.push(`${k}="${mzEsc(n.attrs[k])}"`)); if (!ed && (n.vis.from || n.vis.to || n.vis.param)) at.push(`data-vf="${mzEsc(n.vis.from)}" data-vt="${mzEsc(n.vis.to)}" data-vp="${mzEsc(n.vis.param)}"`);
  if (!ed && n.anim.type) at.push(`style="--mz-ad:${n.anim.dur}ms;--mz-adl:${n.anim.delay}ms"`);
  const tag = (t, inner, extra) => { const c = cls.slice(); if (!MZ_CONT.includes(n.type) && !inner && ed) c.push('mz-void'); return `<${t} class="${c.join(' ')}" ${at.join(' ')}${extra ? ' ' + extra : ''}>${inner == null ? '' : inner}</${t}>`; };
  const kids = () => (n.children || []).map(c => mzNodeHtml(c, ctx)).join('');
  const img = id => ctx.img ? ctx.img(id) : '';
  switch (n.type) {
    case 'page': return `<div class="${cls.join(' ')} mz-page" ${at.join(' ')}>${kids()}</div>`;
    case 'section': case 'container': { const t = P.tag || (n.type === 'section' ? 'section' : 'div'); if (P.boxed) return `<${t} class="${cls.join(' ')} mz-boxed" ${at.join(' ')}><div class="mz-in">${kids()}</div></${t}>`; return `<${t} class="${cls.join(' ')}" ${at.join(' ')}>${kids()}</${t}>`; }
    case 'column': case 'div': return `<div class="${cls.join(' ')}" ${at.join(' ')}>${kids()}</div>`;
    case 'form': return `<form class="${cls.join(' ')} mz-form" ${at.join(' ')} ${ed ? 'onsubmit="return false"' : `data-leads="${mzEsc(P.action)}" data-thanks="${mzEsc(P.thanks)}" data-source="${mzEsc(P.source)}" novalidate`}>${kids()}</form>`;
    case 'link': return `<a class="${cls.join(' ')}" ${at.join(' ')} href="${ed ? '#' : mzEsc(P.href || '#')}"${P.newTab && !ed ? ' target="_blank" rel="noopener"' : ''}>${kids()}</a>`;
    case 'heading': return `<h${P.level || 2} class="${cls.join(' ')}" ${at.join(' ')}>${P.html && P.hOf === P.text ? P.html : mzEsc(P.text).replace(/\n/g, '<br>')}</h${P.level || 2}>`;
    case 'text': return `<div class="${cls.join(' ')}" ${at.join(' ')}>${P.html}</div>`;
    case 'image': case 'logo': { const u = P.imgId ? img(P.imgId) : P.src; const im = u ? `<img src="${mzEsc(u)}" alt="${mzEsc(P.alt)}" ${ed ? 'draggable="false"' : 'loading="lazy"'}>` : '<span class="mz-ph">Imagem</span>'; return `<div class="${cls.join(' ')} mz-img" ${at.join(' ')}>${P.href && !ed ? `<a href="${mzEsc(P.href)}">${im}</a>` : im}${P.ovC ? `<span class="mz-ov" style="background:${P.ovC};mix-blend-mode:${P.ovM}"></span>` : ''}</div>`; }
    case 'video': { const v = mzVideoEmbed(P.url); let inner = '<span class="mz-ph">Cole o endereço do vídeo</span>'; if (v && v.iframe) inner = ed ? `<div class="mz-vph">▶ Vídeo</div>` : `<iframe src="${mzEsc(v.iframe)}" loading="lazy" allowfullscreen title="Vídeo"></iframe>`; else if (v && v.file) inner = ed ? `<div class="mz-vph">▶ Vídeo</div>` : `<video src="${mzEsc(v.file)}" controls playsinline${P.poster ? ` poster="${mzEsc(img(P.poster))}"` : ''}></video>`; return `<div class="${cls.join(' ')} mz-video" ${at.join(' ')} style="aspect-ratio:${P.ratio}">${inner}</div>`; }
    case 'button': return `<a class="${cls.join(' ')} mz-btn mz-btn-${P.variant}" ${at.join(' ')} href="${ed ? '#' : mzEsc(P.href || '#')}"${P.newTab && !ed ? ' target="_blank" rel="noopener"' : ''}>${mzEsc(P.text)}</a>`;
    case 'icon': return `<span class="${cls.join(' ')} mz-icon" ${at.join(' ')} style="font-size:${P.size}px">${mzIcon(P.name, '1em')}</span>`;
    case 'svg': return `<div class="${cls.join(' ')} mz-svg" ${at.join(' ')}>${P.svg || '<span class="mz-ph">SVG</span>'}</div>`;
    case 'list': { const t = P.ordered ? 'ol' : 'ul'; return `<${t} class="${cls.join(' ')} mz-list${P.icon ? ' mz-list-i' : ''}" ${at.join(' ')}>${P.items.map(i => `<li>${P.icon ? `<span class="mz-li">${mzIcon(P.icon, 18)}</span>` : ''}<span>${mzEsc(i)}</span></li>`).join('')}</${t}>`; }
    case 'draw': return `<div class="${cls.join(' ')} mz-draw" ${at.join(' ')}>${mzDrawSvg(P)}</div>`;
    case 'divider': return `<hr class="${cls.join(' ')}" ${at.join(' ')}>`;
    case 'spacer': return `<div class="${cls.join(' ')} mz-spacer" ${at.join(' ')}></div>`;
    case 'input': { const lab = P.label ? `<span class="mz-lab">${mzEsc(P.label)}${P.required ? ' *' : ''}</span>` : ''; let f; if (P.kind === 'textarea') f = `<textarea name="${P.name}" placeholder="${mzEsc(P.placeholder)}" rows="4"${P.required ? ' required' : ''}></textarea>`; else if (P.kind === 'select') f = `<select name="${P.name}"${P.required ? ' required' : ''}>${P.options.map(o => `<option>${mzEsc(o)}</option>`).join('')}</select>`; else f = `<input type="${P.kind}" name="${P.name}" placeholder="${mzEsc(P.placeholder)}"${P.required ? ' required' : ''}>`; return `<label class="${cls.join(' ')} mz-field" ${at.join(' ')}>${lab}${f}</label>`; }
    case 'checkbox': case 'radio': return `<label class="${cls.join(' ')} mz-check" ${at.join(' ')}><input type="${n.type}" name="${P.name}" value="${mzEsc(P.value)}"${P.required ? ' required' : ''}><span>${mzEsc(P.label)}</span></label>`;
    case 'menu': return `<nav class="${cls.join(' ')} mz-menu" ${at.join(' ')}><ul>${P.items.map(i => `<li><a href="${ed ? '#' : mzEsc(i.href)}">${mzEsc(i.label)}</a></li>`).join('')}</ul></nav>`;
    case 'badge': return `<span class="${cls.join(' ')} mz-badge" ${at.join(' ')}>${mzEsc(P.text)}</span>`;
    case 'accordion': return `<div class="${cls.join(' ')} mz-acc" ${at.join(' ')}>${P.items.map((i, k) => `<details${k === 0 && ed ? ' open' : ''}><summary>${mzEsc(i.q)}</summary><div class="mz-acc-a">${i.a}</div></details>`).join('')}</div>`;
    case 'tabs': return `<div class="${cls.join(' ')} mz-tabs" ${at.join(' ')}><div class="mz-tabs-h" role="tablist">${P.items.map((i, k) => `<button type="button" class="${k === 0 ? 'on' : ''}" data-tab="${k}">${mzEsc(i.t)}</button>`).join('')}</div>${P.items.map((i, k) => `<div class="mz-tabs-p${k === 0 ? ' on' : ''}" data-pane="${k}">${i.c}</div>`).join('')}</div>`;
    case 'countdown': return `<div class="${cls.join(' ')} mz-cd" ${at.join(' ')} data-t="${mzEsc(P.date)}" data-done="${mzEsc(P.done)}">${['dias', 'horas', 'min', 'seg'].map(l => `<div><b>0</b><small>${l}</small></div>`).join('')}</div>`;
    case 'table': return `<div class="${cls.join(' ')} mz-tbl" ${at.join(' ')}><table>${P.rows.map((r, i) => `<tr>${r.map(c => i === 0 ? `<th>${mzEsc(c)}</th>` : `<td>${mzEsc(c)}</td>`).join('')}</tr>`).join('')}</table></div>`;
    case 'gallery': return `<div class="${cls.join(' ')} mz-gal" ${at.join(' ')} style="--mz-cols:${P.cols}">${P.imgs.map(i => `<img src="${mzEsc(img(i))}" alt="" ${ed ? 'draggable="false"' : 'loading="lazy"'}>`).join('') || '<span class="mz-ph">Galeria</span>'}</div>`;
    case 'timeline': return `<ol class="${cls.join(' ')} mz-tl" ${at.join(' ')}>${P.items.map(i => `<li><b>${mzEsc(i.w)}</b><div><strong>${mzEsc(i.t)}</strong><p>${mzEsc(i.d)}</p></div></li>`).join('')}</ol>`;
    case 'component': { const c = (ctx.comps || []).find(x => x.id === P.ref); if (!c) return `<div class="${cls.join(' ')}" ${at.join(' ')}><span class="mz-ph">Componente removido</span></div>`; return `<div class="${cls.join(' ')} mz-comp" ${at.join(' ')}>${mzNodeHtml(Object.assign({}, c.root, {hidden: false}), Object.assign({}, ctx, {mode: ed ? 'inst' : ctx.mode}))}</div>`; }
  }
  return '';
}
function mzRule(sel, st, inner) {
  const o = [], inn = []; Object.keys(st).forEach(k => { const v = mzCssVal(k, st[k]); if (v === '') return; let val = v.replace(/mzimg:([\w-]+)/g, (m, id) => MZ_CTX_IMG(id)); const d = `${mzKebab(k)}:${val}`; if (inner && MZ_INNER.has(k)) inn.push(d); else o.push(d); });
  let s = ''; if (o.length) s += `${sel}{${o.join(';')}}`; if (inn.length) s += `${sel}>.mz-in{${inn.join(';')}}`; return s;
}
let MZ_CTX_IMG = () => '';
function mzNodeCss(n, ctx) {
  const sel = '.' + mzCls(n); const out = {d: '', t: '', m: ''}; const inner = !!(n.props && n.props.boxed && (n.type === 'section' || n.type === 'container'));
  MZ_CTX_IMG = ctx.img || (() => ''); ['d', 't', 'm'].forEach(b => { out[b] += mzRule(sel, n.style[b], inner); if (n.vis[b] === false) out[b] += `${sel}{display:none!important}`; });
  if (inner) { const w = n.props.w; out.d += `${sel}>.mz-in{max-width:${w ? w + 'px' : 'var(--mz-w)'};margin-left:auto;margin-right:auto;width:100%}`; }
  if (n.css) out.d += n.css.replace(/\bself\b/g, sel);
  (n.children || []).forEach(c => { if (c.hidden) return; const x = mzNodeCss(c, ctx); out.d += x.d; out.t += x.t; out.m += x.m; });
  if (n.type === 'component') { const comp = (ctx.comps || []).find(x => x.id === n.props.ref); if (comp && !(ctx.seen || (ctx.seen = new Set())).has(comp.id)) { ctx.seen.add(comp.id); const x = mzNodeCss(comp.root, ctx); out.d += x.d; out.t += x.t; out.m += x.m; } }
  return out;
}
const MZ_BASE_CSS = `*,*::before,*::after{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;font-family:var(--mz-f-b);color:var(--mz-c-text);background:var(--mz-c-background);font-size:17px;line-height:1.6}.mz-page{min-height:100vh;width:100%}.mz-e{min-width:0}
img{max-width:100%}.mz-img img{display:block;max-width:100%;height:auto;width:100%}.mz-img{display:block}.mz-video iframe,.mz-video video{width:100%;height:100%;border:0;border-radius:inherit}.mz-svg svg{max-width:100%;height:auto}
h1,h2,h3,h4,h5,h6,p{margin:0}.mz-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 26px;border-radius:var(--mz-r-md);background:var(--mz-c-primary);color:#fff;text-decoration:none;cursor:pointer;border:2px solid var(--mz-c-primary);width:fit-content}
.mz-btn-outline{background:transparent;color:var(--mz-c-primary)}.mz-btn-ghost{background:transparent;border-color:transparent;color:var(--mz-c-primary)}
.mz-icon{display:inline-flex;line-height:1}.mz-list{margin:0;padding-left:1.2em}.mz-list-i{list-style:none;padding:0}.mz-list-i li{display:flex;gap:10px;align-items:flex-start;margin:6px 0}.mz-li{color:var(--mz-c-accent);flex:none;margin-top:3px}
hr.mz-e{border:0;border-top:var(--mz-bw) solid var(--mz-bc);margin:0;width:100%}.mz-spacer{height:32px;width:100%}.mz-img{position:relative}.mz-ov{position:absolute;inset:0;pointer-events:none;border-radius:inherit}.mz-page{position:relative}.mz-draw{position:absolute;left:0;top:0;width:100%;pointer-events:none;z-index:40}.mz-field{display:flex;flex-direction:column;gap:6px;font-size:15px}.mz-lab{font-weight:600}
.mz-field input,.mz-field select,.mz-field textarea{font:inherit;padding:13px 14px;border:1.5px solid var(--mz-bc);border-radius:var(--mz-r-md);background:#fff;color:#111;width:100%}.mz-check{display:flex;gap:10px;align-items:flex-start;font-size:14px}
.mz-menu ul{display:flex;gap:24px;list-style:none;margin:0;padding:0;flex-wrap:wrap}.mz-menu a{color:inherit;text-decoration:none;font-weight:600}.mz-badge{display:inline-block;padding:4px 12px;border-radius:99px;background:var(--mz-c-accent);color:#fff;width:fit-content}
.mz-acc details{border-bottom:var(--mz-bw) solid var(--mz-bc);padding:14px 0}.mz-acc summary{cursor:pointer;font-weight:700}.mz-acc-a{margin-top:8px;color:var(--mz-c-muted)}
.mz-tabs-h{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}.mz-tabs-h button{font:inherit;font-weight:700;padding:9px 16px;border:1.5px solid var(--mz-bc);border-radius:99px;background:#fff;color:#111;cursor:pointer}.mz-tabs-h button.on{background:var(--mz-c-primary);color:#fff;border-color:var(--mz-c-primary)}.mz-tabs-p{display:none}.mz-tabs-p.on{display:block}
.mz-cd{display:flex;gap:16px}.mz-cd div{text-align:center;min-width:64px}.mz-cd b{display:block;font-size:2em;line-height:1}.mz-cd small{font-size:.8rem;opacity:.75}.mz-tbl{overflow:auto}.mz-tbl table{border-collapse:collapse;width:100%}.mz-tbl th,.mz-tbl td{border:var(--mz-bw) solid var(--mz-bc);padding:10px 12px;text-align:left}.mz-tbl th{background:rgba(0,0,0,.05)}
.mz-gal{display:grid;grid-template-columns:repeat(var(--mz-cols,3),1fr);gap:12px}.mz-gal img{width:100%;height:100%;object-fit:cover;border-radius:var(--mz-r-sm)}.mz-tl{list-style:none;margin:0;padding:0 0 0 18px;border-left:2px solid var(--mz-bc)}.mz-tl li{display:flex;gap:14px;margin:0 0 18px;position:relative}.mz-tl li::before{content:"";position:absolute;left:-25px;top:6px;width:12px;height:12px;border-radius:50%;background:var(--mz-c-accent)}.mz-tl b{min-width:72px;color:var(--mz-c-accent)}.mz-tl p{color:var(--mz-c-muted)}
.mz-comp{display:contents}.mz-ph{display:grid;place-items:center;min-height:90px;background:repeating-linear-gradient(45deg,#f1f1f4,#f1f1f4 10px,#e8e8ec 10px,#e8e8ec 20px);color:#777;font-size:13px;border-radius:8px;width:100%}.mz-vph{display:grid;place-items:center;width:100%;height:100%;background:#1b1b1f;color:#fff;font-weight:700;border-radius:inherit}
.mz-an{opacity:0;transition:opacity var(--mz-ad,600ms) ease var(--mz-adl,0ms),transform var(--mz-ad,600ms) ease var(--mz-adl,0ms)}.mz-an-up{transform:translateY(28px)}.mz-an-down{transform:translateY(-28px)}.mz-an-left{transform:translateX(-28px)}.mz-an-right{transform:translateX(28px)}.mz-an-zoom{transform:scale(.92)}.mz-an.mz-in-v{opacity:1;transform:none}
.mz-boxed{width:100%}.mz-in{width:100%}.mz-form{display:flex;flex-direction:column;gap:12px}`;
const MZ_RUNTIME = `(function(){var d=document;d.querySelectorAll('.mz-tabs').forEach(function(t){t.addEventListener('click',function(e){var b=e.target.closest('[data-tab]');if(!b)return;var k=b.getAttribute('data-tab');t.querySelectorAll('[data-tab]').forEach(function(x){x.classList.toggle('on',x===b)});t.querySelectorAll('[data-pane]').forEach(function(x){x.classList.toggle('on',x.getAttribute('data-pane')===k)})})});
function tick(){d.querySelectorAll('.mz-cd').forEach(function(c){var t=Date.parse(c.getAttribute('data-t'));if(!t)return;var s=Math.max(0,Math.floor((t-Date.now())/1000)),v=[Math.floor(s/86400),Math.floor(s%86400/3600),Math.floor(s%3600/60),s%60],b=c.querySelectorAll('b');if(s===0&&c.getAttribute('data-done')){c.textContent=c.getAttribute('data-done');return}v.forEach(function(x,i){if(b[i])b[i].textContent=x})})}tick();setInterval(tick,1000);
var q=new URLSearchParams(location.search);d.querySelectorAll('[data-vf],[data-vt],[data-vp]').forEach(function(e){var f=Date.parse(e.getAttribute('data-vf')||''),t=Date.parse(e.getAttribute('data-vt')||''),p=e.getAttribute('data-vp'),n=Date.now(),hide=false;if(f&&n<f)hide=true;if(t&&n>t)hide=true;if(p&&!q.has(p))hide=true;if(hide)e.style.display='none'});
if('IntersectionObserver'in window){var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('mz-in-v');io.unobserve(x.target)}})},{threshold:.15});d.querySelectorAll('.mz-an').forEach(function(e){io.observe(e)})}else d.querySelectorAll('.mz-an').forEach(function(e){e.classList.add('mz-in-v')});
d.querySelectorAll('form.mz-form').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();var u=f.getAttribute('data-leads');if(!u){alert('Formulário sem destino configurado.');return}var o={source:f.getAttribute('data-source')||d.title};new FormData(f).forEach(function(v,k){o[k]=v});var utm=location.search?new URLSearchParams(location.search):null;if(utm)utm.forEach(function(v,k){if(/^utm_/.test(k))o[k]=v});fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)}).then(function(r){if(!r.ok)throw 0;var t=f.getAttribute('data-thanks');if(t)location.href=t;else{f.reset();alert('Recebemos os seus dados. Obrigado!')}}).catch(function(){alert('Não foi possível enviar. Tente de novo.')})})})})();`;
/* CSS completo de uma árvore: variáveis do DS + base + regras por breakpoint (desktop primeiro; t ≤1024px; m ≤767px) */
function mzTreeCss(root, ds, ctx) {
  ctx.seen = new Set(); const c = mzNodeCss(root, ctx);
  return mzDsCss(ds) + MZ_BASE_CSS + c.d + (c.t ? `@media (max-width:1024px){${c.t}}` : '') + (c.m ? `@media (max-width:767px){${c.m}}` : '');
}
const MZ_FONT_LIST = ['Poppins', 'Inter', 'Montserrat', 'Roboto', 'Open Sans', 'Lato', 'Playfair Display', 'Merriweather', 'Raleway', 'Nunito', 'DM Sans', 'Work Sans', 'Oswald', 'Bebas Neue', 'Lora', 'Space Grotesk'];
function mzTreeFonts(root, set) { set = set || new Set(); const take = v => { String(v || '').replace(/['"]?([A-Z][\w ]{1,38})['"]?\s*(?:,|$)/g, (m, f) => { if (!/^(Arial|Helvetica|Georgia|Times|Courier|Verdana|Tahoma|Trebuchet|Impact)/i.test(f)) set.add(f.trim()); return m; }); };
  mzWalk(root, n => { ['d', 't', 'm'].forEach(b => { const f = n.style && n.style[b] && n.style[b].fontFamily; if (f) take(String(f).split(',')[0]); }); const h = n.props && (n.props.html || ''); if (h) String(h).replace(/font-family:\s*([^;"]+)/gi, (m, f) => { take(f.split(',')[0]); return m; }); }); return set; }
const mzFontsUrl = (ds, root) => { const s = new Set([ds.fonts.heading, ds.fonts.body]); if (root) mzTreeFonts(root, s); const f = [...s].filter(x => /^[A-Za-z][\w ]{1,38}$/.test(x) && (MZ_FONT_LIST.includes(x) || (root && x !== 'system-ui' && x !== 'sans-serif' && x !== 'serif'))); return f.length ? 'https://fonts.googleapis.com/css2?' + f.map(x => 'family=' + x.replace(/ /g, '+') + ':wght@300;400;500;600;700;800;900').join('&') + '&display=swap' : ''; };
/* documento completo (saída: HTML, preview, exportação) */
function mzDoc(m, page, o) {
  o = o || {}; const ctx = {mode: 'out', comps: m.comps, img: o.img || (() => '')}, body = mzNodeHtml(page.root, ctx), css = mzTreeCss(page.root, m.ds, ctx), fu = mzFontsUrl(m.ds, page.root);
  const seo = page.seo || {}, title = seo.title || page.name;
  return `<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${mzEsc(title)}</title>\n${seo.desc ? `<meta name="description" content="${mzEsc(seo.desc)}">\n` : ''}${page.priv ? '<meta name="robots" content="noindex,nofollow">\n' : ''}${fu ? `<link rel="stylesheet" href="${fu}">\n` : ''}${o.cssFile ? `<link rel="stylesheet" href="${o.cssFile}">` : `<style>\n${css}\n</style>`}\n</head>\n<body>\n${body}\n<script>${MZ_RUNTIME}</script>\n</body>\n</html>`;
}
