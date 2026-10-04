/* ===== Gerador de tema do WordPress: cada Site vira um tema instalável. As páginas viram páginas do Elementor (seções, colunas e widgets),
   com menu, página inicial, página de obrigado, formulário de leads (shortcode), SEO básico e rastreamento. Imagens vão para assets/img em WebP. ===== */
const wpHex = () => Math.random().toString(16).slice(2, 9).padEnd(7, '0');
const wpNum = (n, d) => (isFinite(+n) ? +n : d);
const wpMix = (a, b, t) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), x = p(a), y = p(b); return '#' + x.map((v, i) => Math.round(v * (1 - t) + y[i] * t).toString(16).padStart(2, '0')).join(''); };
const wpPx = (n, k) => ({unit: 'px', size: n, sizes: []});
const wpBox = (t, r, b, l) => ({unit: 'px', top: String(t), right: String(r), bottom: String(b), left: String(l), isLinked: t === r && r === b && b === l});
const wpHtml = s => String(s == null ? '' : s);

/* tamanhos por dispositivo: computador (d), tablet (t) e celular (m) */
function wpDev(o, base, key, f) {
  const r = {}; if (!o) return r; if (o.d != null) r[base + (key || '')] = f(o.d); if (o.t != null) r[base + '_tablet'] = f(o.t); if (o.m != null) r[base + '_mobile'] = f(o.m); else if (o.l != null) r[base + '_mobile'] = f(o.l); return r;
}
async function wpImgFile(ctx, imgId, max) {
  if (!imgId) return ''; if (ctx.imgs.has(imgId)) return ctx.imgs.get(imgId);
  const u = await lpImg(imgId, max || 1600), m = u && u.match(/^data:image\/(webp|jpeg);base64,(.+)$/); if (!m) { ctx.imgs.set(imgId, ''); return ''; }
  const name = 'img-' + String(imgId).replace(/[^\w-]/g, '') + (m[1] === 'webp' ? '.webp' : '.jpg'); ctx.files.push({name: 'assets/img/' + name, data: Uint8Array.from(atob(m[2]), c => c.charCodeAt(0))}); ctx.imgs.set(imgId, name); return name;
}
/* imagens embutidas (data:) dentro de HTML/CSS importado viram arquivos do tema */
function wpExtract(ctx, str) {
  return str.replace(/data:image\/(webp|jpeg|png);base64,([A-Za-z0-9+\/=]+)/g, (m, t, b64) => {
    if (!ctx.dataImgs.has(m)) { let x = 2166136261; for (let i = 0; i < b64.length; i += 7) x = Math.imul(x ^ b64.charCodeAt(i), 16777619); const name = 'inline-' + (x >>> 0).toString(36) + (b64.length % 997).toString(36) + (t === 'webp' ? '.webp' : t === 'png' ? '.png' : '.jpg'); ctx.dataImgs.set(m, name); ctx.files.push({name: 'assets/img/' + name, data: Uint8Array.from(atob(b64), c => c.charCodeAt(0))}); }
    return '{{THEME_URI}}/assets/img/' + ctx.dataImgs.get(m);
  });
}

/* ---------- widgets do editor visual → widgets do Elementor ---------- */
async function wpWidget(w, ctx) {
  const T = ctx.th, fg = ctx.dark ? '#ffffff' : T.fg, mut = ctx.dark ? '#d4d4d8' : ctx.mut, id = wpHex(), E = lpE, R = lpRich;
  const common = {}; if (w.hide && w.hide.t) common.hide_tablet = 'hidden-tablet'; if (w.hide && (w.hide.m || w.hide.l)) common.hide_mobile = 'hidden-phone';
  const typo = (size, weight, family) => Object.assign({}, size ? Object.assign({typography_typography: 'custom'}, wpDev(size, 'typography_font_size', '', v => wpPx(v))) : {}, (weight || w.fw) ? {typography_typography: 'custom', typography_font_weight: String(w.fw || weight)} : {}, w.ff ? {typography_typography: 'custom', typography_font_family: w.ff} : {});
  const al = wpDev(w.al, 'align', '', v => v), mk = (type, settings) => ({id, elType: 'widget', widgetType: type, settings: Object.assign({}, settings, common), elements: []});
  switch (w.t) {
    case 'heading': return mk('heading', Object.assign({title: R(w.text), header_size: w.tag || 'h2', title_color: w.color || fg}, al, typo(w.size, 700)));
    case 'text': { const html = '<p>' + R(w.text).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>') + '</p>'; return mk('text-editor', Object.assign({editor: html, text_color: w.color || (w.muted ? mut : fg)}, al, typo(w.size)));
    }
    case 'image': {
      const f = await wpImgFile(ctx, w.imgId); const url = f ? '{{THEME_URI}}/assets/img/' + f : (/^https?:\/\//i.test(w.src || '') ? w.src : ''); if (!url) { ctx.warn.push('Imagem sem arquivo foi ignorada (escolha uma imagem da Biblioteca).'); return null; }
      return mk('image', Object.assign({image: {url, id: '', alt: w.alt || '', source: 'library'}, image_size: 'full', link_to: 'none', image_border_radius: wpBox(w.rad, w.rad, w.rad, w.rad)}, al, w.wpct && w.wpct.d ? {width: {unit: '%', size: w.wpct.d, sizes: []}} : {}, w.wpct && w.wpct.m ? {width_mobile: {unit: '%', size: w.wpct.m, sizes: []}} : {}));
    }
    case 'video': {
      const s = w.src || '', yt = s.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/))([\w-]{11})/), vm = s.match(/vimeo\.com\/(\d+)/), ar = {'16:9': '169', '9:16': '916', '1:1': '11', '4:5': '43'}[w.ratio] || '169';
      if (yt) return mk('video', {video_type: 'youtube', youtube_url: 'https://www.youtube.com/watch?v=' + yt[1], aspect_ratio: ar}); if (vm) return mk('video', {video_type: 'vimeo', vimeo_url: 'https://vimeo.com/' + vm[1], aspect_ratio: ar});
      if (/^https?:\/\/\S+\.(mp4|webm)(\?.*)?$/i.test(s)) return mk('video', {video_type: 'hosted', hosted_url: {url: s, id: ''}, aspect_ratio: ar}); ctx.warn.push('Vídeo sem endereço válido foi ignorado.'); return null;
    }
    case 'button': {
      let url = '#'; if (w.link === 'checkout') url = ctx.l.product.checkout || '#form'; else if (w.link === 'form') url = '#form'; else if (w.link === 'whatsapp') url = ctx.l.whatsapp ? 'https://wa.me/' + ctx.l.whatsapp : '#form'; else url = /^(https?:\/\/|#|mailto:|tel:)/i.test(w.href || '') ? w.href : '#';
      const ext = /^https?:/i.test(url), onAcc = T.accent, txt = bxLum(onAcc) < .5 ? '#ffffff' : '#141414', out = w.style === 'outline';
      return mk('button', Object.assign({text: w.text, link: {url, is_external: ext ? 'on' : '', nofollow: '', custom_attributes: ''}, size: 'lg', button_text_color: out ? onAcc : txt, background_color: out ? 'rgba(0,0,0,0)' : onAcc, border_radius: wpBox(10, 10, 10, 10)}, out ? {border_border: 'solid', border_width: wpBox(2, 2, 2, 2), border_color: onAcc} : {}, w.full ? {align: 'justify'} : al, typo(w.size, 700)));
    }
    case 'list': { const ic = {check: 'fas fa-check', x: 'fas fa-times', dot: 'fas fa-circle'}[w.icon] || 'fas fa-check'; return mk('icon-list', {icon_list: w.items.filter(i => i.t).map(i => ({text: i.t, selected_icon: {value: ic, library: 'fa-solid'}, _id: wpHex()})), text_color: fg, icon_color: w.icon === 'x' ? '#b3472f' : T.accent, icon_size: wpPx(w.icon === 'dot' ? 8 : 16), space_between: wpPx(10)}); }
    case 'feature': {
      const html = (w.emoji ? '<div style="font-size:28px;margin-bottom:6px">' + E(w.emoji) + '</div>' : '') + (w.title ? '<h3 style="margin:0 0 6px;font-size:20px">' + R(w.title) + '</h3>' : '') + (w.text ? '<p style="margin:0;color:' + mut + '">' + R(w.text) + '</p>' : '');
      return mk('text-editor', {editor: html, text_color: fg, _padding: wpBox(22, 22, 22, 22), _background_background: 'classic', _background_color: ctx.dark ? 'rgba(255,255,255,.07)' : '#ffffff', _border_radius: wpBox(14, 14, 14, 14), _border_border: 'solid', _border_width: wpBox(1, 1, 1, 1), _border_color: ctx.dark ? 'rgba(255,255,255,.18)' : T.line});
    }
    case 'spacer': return mk('spacer', Object.assign({}, wpDev(w.h, 'space', '', v => wpPx(v))));
    case 'divider': return mk('divider', {style: 'solid', weight: wpPx(1), color: T.line});
    case 'form': return mk('shortcode', {shortcode: '[amp_lead_form title="' + String(w.title || '').replace(/"/g, '') + '" text="' + String(w.text || '').replace(/"/g, '') + '" button="' + String(w.text2 || 'Enviar').replace(/"/g, '') + '"]'});
    case 'faq': return mk('accordion', {tabs: w.items.filter(i => i.t).map(i => ({tab_title: i.t, tab_content: '<p>' + R(i.d || '') + '</p>', _id: wpHex()})), title_color: fg, tab_active_color: T.accent});
    case 'quote': {
      const it = w.items.filter(i => i.t), rows = []; for (let i = 0; i < it.length; i += 3) rows.push(it.slice(i, i + 3));
      return mk('__inner', {rows: rows.map(r => r.map(q => ({id: wpHex(), elType: 'widget', widgetType: 'testimonial', settings: {testimonial_content: q.t, testimonial_name: q.d, testimonial_job: '', testimonial_alignment: 'left', content_content_color: fg, name_text_color: fg}, elements: []})))});
    }
    case 'countdown': { if (!w.date) return null; const d = E(w.date), html = `<div class="amp-cd" data-t="${d}" style="display:flex;gap:16px;justify-content:center;font:700 32px/1 inherit"><div><b class="d">0</b><small style="display:block;font-size:12px;font-weight:400">dias</small></div><div><b class="h">0</b><small style="display:block;font-size:12px;font-weight:400">horas</small></div><div><b class="m">0</b><small style="display:block;font-size:12px;font-weight:400">min</small></div></div><script>(function(){document.querySelectorAll('.amp-cd[data-t]').forEach(function(c){var t=new Date(c.dataset.t).getTime();function u(){var s=Math.max(0,Math.floor((t-Date.now())/1000));c.querySelector('.d').textContent=Math.floor(s/86400);c.querySelector('.h').textContent=Math.floor(s%86400/3600);c.querySelector('.m').textContent=Math.floor(s%3600/60)}u();setInterval(u,30000)})})();</script>`; return mk('html', {html}); }
    case 'tpl': {
      TPL_R.fonts = new Set(); TPL_R.css = []; TPL_R.form = true; TPL_R.hf = false;
      const h = await tplWidgetHTML(w, 'tpl' + id, '', false, ctx.l, 1600), css = TPL_R.css.join('\n'); ctx.warn.push('Seção importada de template vira um bloco de HTML no Elementor (editável como HTML).');
      return mk('html', {html: wpExtract(ctx, '<style>' + css + '</style>' + h)});
    }
  }
  return null;
}
/* seção → seção do Elementor (com colunas) */
async function wpSection(s, ctx, firstForm) {
  const T = ctx.th, dark = !!s.bg && bxLum(s.bg) < .4, sctx = Object.assign({}, ctx, {dark}), soft = wpMix(T.bg, T.fg, .05);
  const pd = s.pad || {}, pb = s.padB || {}, top = v => wpNum(v, 0), pt = {d: pd.d != null ? pd.d : 64, t: pd.t != null ? pd.t : (pd.d != null ? pd.d : 48), m: pd.m != null ? pd.m : (pd.t != null ? pd.t : pd.d != null ? Math.min(pd.d, 36) : 36)};
  const bt = {d: pb.d != null ? pb.d : pt.d, t: pb.t != null ? pb.t : (pb.d != null ? pb.d : pt.t), m: pb.m != null ? pb.m : (pb.t != null ? pb.t : pb.d != null ? Math.min(pb.d, 36) : pt.m)};
  const set = {layout: s.w === 'full' ? 'full_width' : 'boxed', content_width: {unit: 'px', size: 1120, sizes: []}, padding: wpBox(pt.d, 0, bt.d, 0), padding_tablet: wpBox(pt.t, 0, bt.t, 0), padding_mobile: wpBox(pt.m, 0, bt.m, 0), gap: 'custom', gap_columns_custom: wpPx(s.gap && s.gap.d != null ? s.gap.d : 28)};
  if (s.bg) Object.assign(set, {background_background: 'classic', background_color: s.bg}); else if (s.alt) Object.assign(set, {background_background: 'classic', background_color: soft});
  if (s.bgImg) { const f = await wpImgFile(ctx, s.bgImg); if (f) Object.assign(set, {background_background: 'classic', background_image: {url: '{{THEME_URI}}/assets/img/' + f, id: '', source: 'library'}, background_position: 'center center', background_size: 'cover', background_repeat: 'no-repeat'}); }
  if (s.hide && s.hide.t) set.hide_tablet = 'hidden-tablet'; if (s.hide && (s.hide.m || s.hide.l)) set.hide_mobile = 'hidden-phone';
  const hasForm = s.cols.some(c => c.widgets.some(w => w.t === 'form')); if (hasForm && firstForm) set._element_id = 'form';
  const cols = [];
  for (const c of s.cols) {
    const sp = c.span || {}, pct = n => Math.round(n / 12 * 10000) / 100, d = wpNum(sp.d, 12), cs = {_column_size: pct(d), _inline_size: pct(d), content_position: {top: 'top', center: 'center', bottom: 'bottom'}[c.v] || 'top'};
    if (sp.t != null) cs._inline_size_tablet = pct(sp.t); if (sp.m != null) cs._inline_size_mobile = pct(sp.m); else if (sp.t != null && sp.t === 12) cs._inline_size_mobile = 100;
    const els = []; for (const w of c.widgets) { const r = await wpWidget(w, sctx); if (!r) continue; if (r.widgetType === '__inner') els.push(...r.settings.rows.map(row => ({id: wpHex(), elType: 'section', settings: {structure: String(row.length) + '0', gap: 'custom', gap_columns_custom: wpPx(20)}, elements: row.map(q => ({id: wpHex(), elType: 'column', settings: {_column_size: Math.round(100 / row.length * 100) / 100, _inline_size: null}, elements: [q], isInner: true})), isInner: true}))); else els.push(r); }
    cols.push({id: wpHex(), elType: 'column', settings: cs, elements: els, isInner: false});
  }
  return {id: wpHex(), elType: 'section', settings: set, elements: cols, isInner: false};
}
/* página (landing) → lista de seções do Elementor */
async function wpPage(l, p, ctx) {
  const V = l.vis || bxFromBlocks(l), out = []; ctx.l = l; let form = true;
  for (const s of V.sections) { const sec = await wpSection(s, ctx, form); if (sec.settings._element_id === 'form') form = false; out.push(sec); }
  return out;
}

/* ---------- tema completo ---------- */
const wpSlug = s => String(s || 'tema').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'tema';
const wpFill = (t, m) => Object.keys(m).reduce((a, k) => a.split('__' + k + '__').join(m[k]), t);
async function wpThemeBuild(siteId, opt) {
  const p = curProject(), site = p.sites.find(x => x.id === siteId); if (!site) throw new Error('Site não encontrado.');
  const pages = p.landings.filter(l => l.siteId === site.id); if (!pages.length) throw new Error('O site não tem páginas.');
  opt = Object.assign({name: site.name, slug: wpSlug(site.name), version: '1.0.0'}, opt || {}); const enc = new TextEncoder(), l0 = pages[0], T0 = l0.theme || {}, hx = (v, d) => /^#[0-9a-f]{6}$/i.test(String(v)) ? v : d;
  const th = {accent: hx(T0.accent, '#e4572e'), bg: T0.dark ? '#0e0e10' : hx(T0.bg, '#ffffff'), fg: T0.dark ? '#f5f5f5' : hx(T0.fg, '#141414'), head: String(T0.head || 'Poppins').replace(/[^\w \-]/g, ''), body: String(T0.body || 'Inter').replace(/[^\w \-]/g, '')};
  th.soft = wpMix(th.bg, th.fg, .05); th.line = wpMix(th.bg, th.fg, .14); th.mut = wpMix(th.fg, th.bg, .38);
  const ctx = {th: Object.assign({}, th, {line: th.line}), mut: th.mut, files: [], imgs: new Map(), dataImgs: new Map(), warn: [], l: l0}, slug = opt.slug, root = slug + '/', out = [];
  const wp = [], templates = [];
  for (const l of pages) {
    const els = await wpPage(l, p, ctx), SO = lpSeoOf(l, p), og = SO.ogId ? await wpImgFile(ctx, SO.ogId, 1200) : '', home = (l.slug || 'index') === 'index', title = l.navLabel || l.name;
    wp.push({slug: home ? 'inicio' : (l.slug || wpSlug(title)), title, home, menu: true, seo: {title: SO.title || (title + ' · ' + (site.brand || site.name)), desc: SO.desc || '', og}, elementor: els});
    templates.push({name: wpSlug(l.slug || 'inicio') + '.json', data: {version: '0.4', title: site.name + ' · ' + title, type: 'page', content: els, page_settings: [], metadata: []}});
  }
  const fav = (SO => SO)(lpSeoOf(l0, p)).fav; let favFile = ''; if (fav) { try { const b = await lpCover(fav, 192, 192, 'image/png', 1); if (b) { out.push({name: root + 'assets/favicon.png', data: new Uint8Array(await b.arrayBuffer())}); favFile = 'ok'; } } catch (e) { /* sem favicon */ } }
  const trk = l0.tracking || {}, defaults = {brand: site.brand || site.name, header_cta: site.headerCta || '', header_cta_url: '#form', footer_text: site.footer || '', contact_text: site.contact || '', wa_number: l0.whatsapp || '', wa_message: l0.waMsg || '', privacy_url: l0.privacyUrl || '', leads_url: state.workspace.leadsUrl || '', thanks_url: '/obrigado/', thanks_title: (l0.thanks && l0.thanks.title) || '', thanks_text: (l0.thanks && l0.thanks.text) || '', pixel: trk.metaPixel || '', ga4: trk.ga4 || '', fonts: [...new Set([th.head, th.body])]};
  const meta = {NAME: opt.name.replace(/[\r\n*\/]/g, ' '), SLUG: slug, VER: opt.version, DATE: new Date().toLocaleDateString('pt-BR'), PAGES: pages.map(l => l.navLabel || l.name).join(', '), ACCENT: th.accent, BG: th.bg, FG: th.fg, SOFT: th.soft, LINE: th.line, MUT: th.mut, HEAD: th.head, BODY: th.body};
  const css = `/*\nTheme Name: ${meta.NAME}\nTheme URI: ${(site.baseUrl || '').replace(/[\r\n]/g, '')}\nAuthor: Ampliação Studio\nDescription: Tema gerado pelo Ampliação Studio. As páginas são editadas no Elementor.\nVersion: ${opt.version}\nRequires at least: 5.8\nRequires PHP: 7.4\nLicense: GPL-2.0-or-later\nLicense URI: https://www.gnu.org/licenses/gpl-2.0.html\nText Domain: ${slug}\n*/\n` + wpFill(WPT.css, meta);
  /* screenshot do tema */
  { const c = document.createElement('canvas'); c.width = 1200; c.height = 900; const x = c.getContext('2d'); x.fillStyle = th.bg; x.fillRect(0, 0, 1200, 900); x.fillStyle = th.accent; x.fillRect(0, 0, 1200, 360); x.fillStyle = '#fff'; x.font = '700 72px sans-serif'; x.fillText(String(site.brand || site.name).slice(0, 22), 70, 210); x.fillStyle = th.fg; x.font = '600 36px sans-serif'; x.fillText('Tema WordPress · Elementor', 70, 470); x.font = '28px sans-serif'; x.fillStyle = th.mut; pages.slice(0, 6).forEach((l, i) => x.fillText('• ' + (l.navLabel || l.name), 70, 540 + i * 44)); const b = await new Promise(r => c.toBlob(r, 'image/png')); out.push({name: root + 'screenshot.png', data: new Uint8Array(await b.arrayBuffer())}); }
  out.push({name: root + 'style.css', data: enc.encode(css)}, {name: root + 'functions.php', data: enc.encode(wpFill(WPT.functions, meta))}, {name: root + 'header.php', data: enc.encode(WPT.header)}, {name: root + 'footer.php', data: enc.encode(WPT.footer)}, {name: root + 'page.php', data: enc.encode(WPT.page)}, {name: root + 'index.php', data: enc.encode(WPT.index)}, {name: root + '404.php', data: enc.encode(WPT.notfound)}, {name: root + 'page-obrigado.php', data: enc.encode(WPT.thanks)},
    {name: root + 'assets/js/theme.js', data: enc.encode(WPT.js)}, {name: root + 'inc/defaults.json', data: enc.encode(JSON.stringify(defaults))}, {name: root + 'inc/pages.json', data: enc.encode(JSON.stringify(wp))}, {name: root + 'readme.txt', data: enc.encode(wpFill(WPT.readme, meta).replace(/[#*`]/g, ''))});
  ctx.files.forEach(f => out.push({name: root + f.name, data: f.data}));
  const base = '/wp-content/themes/' + slug; const tpl = templates.map(t => ({name: 'elementor-templates/' + t.name, data: enc.encode(JSON.stringify(t.data).split('{{THEME_URI}}').join(base))}));
  const warn = [...new Set(ctx.warn)]; if (!defaults.leads_url) warn.push('O endereço de captura de leads não está definido em Configurações; preencha em Aparência → Personalizar → Captura de leads.'); if (pages.some(l => l.status !== 'Aprovada')) warn.push('Há páginas do site que ainda não estão como "Aprovada".');
  return {slug, name: opt.name, themeFiles: out, templates: tpl, readme: wpFill(WPT.readme, meta), warn, pages: wp.length, images: ctx.imgs.size + ctx.dataImgs.size, size: out.reduce((a, f) => a + f.data.length, 0)};
}
async function wpThemeZip(siteId, opt) { const r = await wpThemeBuild(siteId, opt); return Object.assign(r, {zip: makeZip(r.themeFiles)}); }

/* ---------- pacote com tema, plugins e instruções ---------- */
const wpPlugList = () => { if (!Array.isArray(state.workspace.wpPlugins)) state.workspace.wpPlugins = []; return state.workspace.wpPlugins; };
async function wpBundle(siteId, opt) {
  const r = await wpThemeBuild(siteId, opt), enc = new TextEncoder(), files = [{name: r.slug + '/' + r.slug + '.zip', data: makeZip(r.themeFiles)}, {name: r.slug + '/LEIA-ME.md', data: enc.encode(r.readme)}].concat(r.templates.map(t => ({name: r.slug + '/' + t.name, data: t.data})));
  for (const pl of wpPlugList()) { try { const b = await imgGet(pl.imgId); if (b) files.push({name: r.slug + '/plugins/' + pl.file, data: new Uint8Array(await b.arrayBuffer())}); } catch (e) { /* plugin ausente */ } }
  return Object.assign(r, {zip: makeZip(files)});
}
async function wpGenerate(siteId, mode) {
  const s = curProject().sites.find(x => x.id === siteId); if (!s) return; toast('Montando o tema do WordPress…');
  try {
    const opt = {name: ($('wpName') || {}).value || s.name, slug: wpSlug(($('wpSlug') || {}).value || ($('wpName') || {}).value || s.name), version: (($('wpVer') || {}).value || '1.0.0').replace(/[^\w.\-]/g, '') || '1.0.0'};
    const r = mode === 'bundle' ? await wpBundle(siteId, opt) : await wpThemeZip(siteId, opt);
    download(r.slug + (mode === 'bundle' ? '-wordpress-pacote' : '') + '.zip', r.zip, 'application/zip'); curProject().landings.filter(l => l.siteId === siteId).forEach(l => { l.status = 'Exportada'; }); persist();
    showModal('Tema gerado', `<p><b>${esc(r.name)}</b>: ${r.pages} página(s), ${r.images} imagem(ns), ${Math.round(r.size / 1024)} KB de arquivos do tema.</p>${r.warn.length ? `<div class="so-issue aviso">${r.warn.map(esc).join('<br>')}</div>` : ''}<ol style="font-size:13px;line-height:1.7"><li>No WordPress, instale e ative o <b>Elementor</b> (gratuito).</li><li><b>Aparência → Temas → Adicionar novo → Enviar tema</b> e escolha o arquivo baixado${mode === 'bundle' ? ' (dentro do pacote: <span class="mono">' + esc(r.slug) + '.zip</span>)' : ''}. Ative.</li><li>O tema cria as páginas, o menu, a página inicial e a página Obrigado. Abra uma página e clique em <b>Editar com Elementor</b>.</li><li>Ajuste marca, WhatsApp, leads e rastreamento em <b>Aparência → Personalizar</b>.</li></ol><p class="muted" style="font-size:12.5px">As instruções completas vão no arquivo <span class="mono">LEIA-ME</span> do pacote.</p><div class="modal-actions"><button class="btn dark" onclick="closeModal();renderLandings()">Fechar</button></div>`);
  } catch (e) { toast('Não consegui gerar o tema: ' + e.message); }
}
function wpPanel(s, p) {
  const pages = p.landings.filter(l => l.siteId === s.id), ok = pages.every(l => l.status === 'Aprovada'), pl = wpPlugList();
  return `<div class="panel" style="margin-top:10px"><h3>Tema do WordPress</h3><p class="muted" style="font-size:12.5px;margin:0 0 8px">Transforma este site num tema instalável: cada página vira uma página do WordPress <b>editável no Elementor</b>, com menu, página inicial, página de Obrigado, formulário de leads, SEO básico e rastreamento.${ok ? '' : ' <b>Atenção:</b> há páginas que ainda não estão como “Aprovada”.'}</p>
  <div class="field"><label>Nome do tema</label><input id="wpName" value="${siteA(s.name)}" oninput="if($('wpSlug'))$('wpSlug').placeholder=wpSlug(this.value)"></div><div class="form-grid"><div class="field"><label>Pasta (slug)</label><input id="wpSlug" placeholder="${siteA(wpSlug(s.name))}"></div><div class="field"><label>Versão</label><input id="wpVer" value="1.0.0"></div></div>
  <div class="row-gap" style="flex-wrap:wrap"><button class="btn dark" onclick="wpGenerate('${s.id}','theme')">⬇ Gerar tema (.zip)</button><button class="btn" onclick="wpGenerate('${s.id}','bundle')" title="Tema, plugins anexados, modelos do Elementor e instruções">⬇ Pacote completo</button></div>
  <h4 style="margin:12px 0 4px;font-size:13px">Plugins que acompanham o tema</h4><small class="muted block">Anexe os plugins que você já produziu (arquivos .zip). Eles vão na pasta <span class="mono">plugins</span> do pacote completo.</small>
  ${pl.map(x => `<div class="list-item" style="padding:6px 0"><div><strong style="font-size:13px">${siteA(x.name)}</strong><small>${Math.round(x.size / 1024)} KB</small></div><button class="btn sm" onclick="wpPlugDel('${x.id}')">×</button></div>`).join('')}<button class="btn sm" style="margin-top:6px" onclick="wpPlugAdd()">＋ Anexar plugin (.zip)</button></div>`;
}
function wpPlugAdd() {
  const i = document.createElement('input'); i.type = 'file'; i.accept = '.zip,application/zip'; i.multiple = true;
  i.onchange = async () => { for (const f of [...i.files].slice(0, 10)) { if (!/\.zip$/i.test(f.name) || f.size > 40e6) { toast(f.name + ': use um .zip de até 40 MB.'); continue; } const id = uid('wpl'), imgId = uid('wpz'); await imgPut(imgId, f); wpPlugList().push({id, imgId, name: f.name.replace(/\.zip$/i, ''), file: f.name.replace(/[^\w.\-]/g, '_'), size: f.size}); } persist(); renderLandings(); };
  i.click();
}
async function wpPlugDel(id) { const L = wpPlugList(), i = L.findIndex(x => x.id === id); if (i < 0) return; try { await imgDel(L[i].imgId); } catch (e) { /* ok */ } L.splice(i, 1); persist(); renderLandings(); }
