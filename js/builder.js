/* ===== Editor visual (estilo Elementor): modelo, conversão a partir dos blocos e renderização responsiva =====
   Seção → colunas (grade de 12; largura por dispositivo: computador / tablet / celular) → widgets (título, texto, imagem, vídeo, botão, lista,
   destaque, espaçador, divisor, formulário, perguntas, depoimentos, contagem). Cada propriedade pode ter valor por dispositivo: o de computador
   vale para todos até que tablet ou celular definam o seu (cascata, como nos construtores de página). */
const BX_BP = {d: 'Computador', t: 'Tablet', l: 'Celular horizontal', m: 'Celular vertical'};
const BX_W = {heading: ['Título', 'H'], text: ['Texto', '¶'], image: ['Imagem', '🖼'], video: ['Vídeo', '▶'], button: ['Botão', '⬭'], list: ['Lista', '☰'], feature: ['Destaque (cartão)', '◫'], spacer: ['Espaço', '↕'], divider: ['Divisor', '―'], form: ['Formulário', '✎'], faq: ['Perguntas (sanfona)', '?'], quote: ['Depoimentos', '❝'], countdown: ['Contagem regressiva', '⏱']};
const BX_LAYOUTS = {'1': [12], '2': [6, 6], '3': [4, 4, 4], '4': [3, 3, 3, 3], '1-2': [4, 8], '2-1': [8, 4]};
const BX_LAYOUT_NAME = {'1': '1 coluna', '2': '2 colunas', '3': '3 colunas', '4': '4 colunas', '1-2': '⅓ + ⅔', '2-1': '⅔ + ⅓'};
const bxId = () => uid('bx');
const bxFontCss = w => (w.fw ? `font-weight:${+w.fw};` : '') + (w.ff ? `font-family:'${String(w.ff).replace(/[^\w \-]/g, '')}',sans-serif;` : '');
function bxW(t, o) { return Object.assign({id: bxId(), t, hide: {t: false, l: false, m: false}, al: {}, size: {}, wpct: {}, h: {}, text: '', title: '', tag: 'h2', color: '', muted: false, imgId: '', src: '', alt: '', rad: 12, ratio: '16:9', link: 'checkout', href: '', style: 'solid', full: false, icon: 'check', emoji: '', date: '', items: []}, ({heading: {text: 'Seu título aqui'}, text: {text: 'Escreva o texto aqui.'}, button: {text: 'Quero agora'}, feature: {title: 'Título', text: 'Descrição'}, list: {items: [{t: 'Primeiro item', d: ''}]}, spacer: {h: {d: 32}}, faq: {items: [{t: 'Pergunta?', d: 'Resposta.'}]}, quote: {items: [{t: '[CONFIRMAR: depoimento real]', d: '[CONFIRMAR: nome]'}]}, form: {title: 'Receba contato', text: '', text2: ''}, video: {src: ''}, image: {}, divider: {}, countdown: {}})[t] || {}, o || {}); }
const bxCol = (span, widgets, o) => Object.assign({id: bxId(), span: {d: span, t: span <= 4 ? 6 : 12, m: 12}, v: 'top', widgets: widgets || []}, o || {});
function bxSec(layout, o) { return Object.assign({id: bxId(), name: '', w: 'box', bg: '', alt: false, bgImg: '', pad: {}, padB: {}, hide: {t: false, l: false, m: false}, gap: {}, cols: (BX_LAYOUTS[layout] || [12]).map(n => bxCol(n))}, o || {}); }

/* valor efetivo de uma propriedade por dispositivo (cascata d → t → m) */
const bxGet = (o, bp) => (o && o[bp] != null ? o[bp] : (bp === 'm' || bp === 'l') && o && o.t != null ? o.t : o && o.d != null ? o.d : undefined);
const bxOwn = (o, bp) => o && o[bp] != null;

/* ---------- blocos → editor visual ---------- */
function bxFromBlocks(l) {
  const S = [], H = (text, tag, al) => bxW('heading', {text, tag: tag || 'h2', al: al ? {d: al} : {}}), T = (text, o) => bxW('text', Object.assign({text, muted: true}, o || {})), BTN = (text, o) => bxW('button', Object.assign({text: text || LP_TYPE_INFO[l.type || 'generico'].cta}, o || {}));
  const row = (items, mk, per) => { const n = Math.min(items.length, 12), span = per || (n <= 2 ? 6 : n === 4 ? 3 : 4); return items.map(i => bxCol(span, [mk(i)])); };
  const feat = i => bxW('feature', {title: i.t, text: i.d});
  (l.blocks || []).filter(b => b.on).forEach(b => {
    const ci = b.items.filter(i => i.t || i.d), mid = {al: {d: 'center'}};
    switch (b.t) {
      case 'hero': { const left = [b.kicker && bxW('text', {text: '**' + b.kicker.toUpperCase() + '**', size: {d: 13}}), bxW('heading', {text: b.title, tag: 'h1'}), b.text && T(b.text, {size: {d: 20, m: 18}}), BTN(b.cta), b.note && T(b.note, {size: {d: 13}})].filter(Boolean); S.push(bxSec('1', {name: 'Topo', cols: b.imgId ? [bxCol(7, left, {v: 'center', span: {d: 7, t: 12, m: 12}}), bxCol(5, [bxW('image', {imgId: b.imgId, alt: b.title})], {span: {d: 5, t: 12, m: 12}, v: 'center'})] : [bxCol(12, left)], pad: {d: 80, m: 40}, padB: {d: 80, m: 40}})); break; }
      case 'numeros': S.push(bxSec('1', {name: 'Números', alt: true, cols: row(ci, i => bxW('heading', {text: i.t, tag: 'h2', al: {d: 'center'}, color: l.theme.accent}).constructor === Object ? bxW('feature', {title: i.t, text: i.d, emoji: ''}) : null)})); break;
      case 'dor': S.push(bxSec('1', {name: 'Dor', cols: [bxCol(12, [b.title && H(b.title), b.text && T(b.text), ci.length && bxW('list', {icon: 'x', items: ci.map(i => ({t: i.t + (i.d ? ' ' + i.d : ''), d: ''}))})].filter(Boolean))]})); break;
      case 'solucao': case 'beneficios': case 'conteudo': case 'passos': case 'bonus': case 'palestrantes': case 'programa': case 'ingressos':
        S.push(bxSec('1', {name: LP_BLOCK[b.t].label, alt: ['solucao', 'passos', 'bonus', 'programa'].includes(b.t), cols: [bxCol(12, [b.title && H(b.title, 'h2', 'center'), b.text && T(b.text, {al: {d: 'center'}})].filter(Boolean))]})); if (ci.length) S.push(bxSec('1', {name: LP_BLOCK[b.t].label + ' — itens', alt: ['solucao', 'passos', 'bonus', 'programa'].includes(b.t), pad: {d: 8}, cols: row(ci, feat)})); if (b.t === 'ingressos' && b.cta) S.push(bxSec('1', {name: 'Botão', pad: {d: 16}, cols: [bxCol(12, [BTN(b.cta, {al: {d: 'center'}})])]})); break;
      case 'para_quem': S.push(bxSec('2', {name: 'Para quem é', alt: true, cols: [bxCol(6, [bxW('heading', {text: 'É para você se…', tag: 'h3'}), bxW('list', {items: b.yes.map(t => ({t, d: ''}))})]), bxCol(6, [bxW('heading', {text: 'Não é para você se…', tag: 'h3'}), bxW('list', {icon: 'x', items: b.no.map(t => ({t, d: ''}))})])].map(c => Object.assign(c, {span: {d: 6, t: 12, m: 12}}))})); break;
      case 'autoridade': S.push(bxSec('1', {name: 'Quem está por trás', cols: b.imgId ? [bxCol(3, [bxW('image', {imgId: b.imgId, rad: 999, alt: b.name})], {span: {d: 3, t: 4, m: 12}}), bxCol(9, [b.title && H(b.title), b.name && bxW('text', {text: '**' + b.name + '**', muted: false}), T(b.text)].filter(Boolean), {span: {d: 9, t: 8, m: 12}, v: 'center'})] : [bxCol(12, [b.title && H(b.title), b.name && bxW('text', {text: '**' + b.name + '**', muted: false}), T(b.text)].filter(Boolean))]})); break;
      case 'prova': S.push(bxSec('1', {name: 'Prova', alt: true, cols: [bxCol(12, [b.title && H(b.title, 'h2', 'center'), bxW('quote', {items: ci})].filter(Boolean))]})); break;
      case 'oferta': S.push(bxSec('1', {name: 'Oferta', cols: [bxCol(12, [b.title && H(b.title, 'h2', 'center'), b.text && T(b.text, {al: {d: 'center'}}), ci.length && bxW('list', {items: ci.map(i => ({t: i.t + (i.d ? ' ' + i.d : ''), d: ''}))}), b.price && bxW('heading', {text: b.price, tag: 'h2', al: {d: 'center'}, color: l.theme.accent}), b.note && T(b.note, {al: {d: 'center'}, size: {d: 13}}), BTN(b.cta, {al: {d: 'center'}})].filter(Boolean))]})); break;
      case 'garantia': case 'texto': case 'local': case 'cta_final': S.push(bxSec('1', {name: LP_BLOCK[b.t].label, alt: b.t === 'cta_final' || b.t === 'local', cols: [bxCol(12, [b.title && H(b.title, 'h2', 'center'), b.note && b.t === 'local' && bxW('text', {text: '**' + b.note + '**', muted: false, al: {d: 'center'}}), b.text && T(b.text, {al: {d: 'center'}}), b.t === 'cta_final' && BTN(b.cta, {al: {d: 'center'}})].filter(Boolean))]})); break;
      case 'faq': S.push(bxSec('1', {name: 'Perguntas frequentes', cols: [bxCol(12, [b.title && H(b.title, 'h2', 'center'), bxW('faq', {items: ci})].filter(Boolean))]})); break;
      case 'amostra': S.push(bxSec('1', {name: 'Amostra', alt: true, cols: b.imgId ? [bxCol(6, [bxW('image', {imgId: b.imgId, alt: b.title})]), bxCol(6, [b.title && H(b.title), b.text && T(b.text), BTN(b.cta || 'Ler uma amostra grátis')].filter(Boolean), {v: 'center'})].map(c => Object.assign(c, {span: {d: 6, t: 12, m: 12}})) : [bxCol(12, [b.title && H(b.title, 'h2', 'center'), b.text && T(b.text, {al: {d: 'center'}}), BTN(b.cta || 'Ler uma amostra grátis', {al: {d: 'center'}})].filter(Boolean))]})); break;
      case 'form': S.push(bxSec('1', {name: 'Formulário', cols: [bxCol(12, [bxW('form', {title: b.title, text: b.text, text2: b.cta, al: {d: 'center'}})])]})); break;
    }
  });
  return normalizeVis({sections: S.map(sec => { sec.cols.forEach(c => { c.widgets = c.widgets.filter(Boolean); }); return sec; })});
}

/* ---------- renderização ---------- */
const bxLum = h => { const n = parseInt(h.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const bxSafe = id => String(id).replace(/[^\w-]/g, '');
function bxVideoEmbed(src) {
  let m; if ((m = src.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/))([\w-]{11})/))) return {iframe: 'https://www.youtube-nocookie.com/embed/' + m[1] + '?rel=0'};
  if ((m = src.match(/vimeo\.com\/(?:video\/)?(\d{5,12})/))) return {iframe: 'https://player.vimeo.com/video/' + m[1]};
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(src)) return {file: src}; return null;
}
async function bxRender(l, opts) {
  const V = l.vis, P = !!opts.preview, css = {d: [], t: [], l: [], m: []}, rule = (bp, sel, decl) => { if (decl) css[bp].push(`${sel}{${decl}}`); };
  const cta = lpCta(l), hasForm = [].concat(...V.sections.map(s => [].concat(...s.cols.map(c => c.widgets)))).some(w => w.t === 'form'); let formDone = false, imgN = 0, firstBtn = '', E = lpE, R = lpRich;
  const bpEach = (id, o, f) => ['d', 't', 'l', 'm'].forEach(bp => { if (o && o[bp] != null) rule(bp, '#' + bxSafe(id), f(o[bp])); });
  const attr = (id) => P ? ` data-bx="${bxSafe(id)}"` : '';
  const wHTML = async w => {
    const id = bxSafe(w.id), a = attr(id); let h = '';
    bpEach(id, w.al, v => `text-align:${v}`); { const wf = bxFontCss(w); if (wf) rule('d', '#' + id, wf); } bpEach(id, w.size, v => `font-size:${v}px`);
    ['t', 'l', 'm'].forEach(bp => { if (w.hide[bp]) rule(bp, '#' + id, 'display:none'); });
    switch (w.t) {
      case 'heading': h = `<${w.tag} id="${id}"${a}${w.color ? ` style="color:${w.color}"` : ''}>${R(w.text)}</${w.tag}>`; break;
      case 'text': h = `<p id="${id}"${a} class="${w.muted ? 'mut' : ''}"${w.color ? ` style="color:${w.color}"` : ''}>${R(w.text)}</p>`; break;
      case 'image': { const src = w.imgId ? await lpImg(w.imgId) : (/^https?:\/\/[^\s"'<>]{1,600}$/i.test(w.src || '') ? w.src : ''); bpEach(id, w.wpct, v => `--wp:${v}%`); h = src ? `<div id="${id}"${a} class="bx-img"><img src="${E(src)}" alt="${E(w.alt)}"${lpImgAttr(src, ++imgN === 1 && !/^https?:/.test(src))} style="border-radius:${w.rad}px"></div>` : `<div id="${id}"${a} class="bx-ph">Imagem</div>`; break; }
      case 'video': { const v = w.src && bxVideoEmbed(w.src), ar = w.ratio.replace(':', '/'); h = `<div id="${id}"${a} class="bx-vid" style="aspect-ratio:${ar}">${v ? (v.iframe && /youtube-nocookie\.com\/embed\/([\w-]{11})/.test(v.iframe) ? `<button type="button" class="yt" data-y="${v.iframe.match(/embed\/([\w-]{11})/)[1]}" style="background-image:url(https://i.ytimg.com/vi/${v.iframe.match(/embed\/([\w-]{11})/)[1]}/hqdefault.jpg)" aria-label="Reproduzir vídeo"><i></i></button>` : v.iframe ? `<iframe src="${E(v.iframe)}" title="Vídeo" loading="lazy" allow="accelerometer;encrypted-media;picture-in-picture;fullscreen" allowfullscreen></iframe>` : `<video controls playsinline preload="metadata" src="${E(v.file)}"></video>`) : '<div class="bx-ph">Cole o link do YouTube, Vimeo ou arquivo .mp4</div>'}</div>`; break; }
      case 'button': { let href = '#', ext = false; if (w.link === 'checkout') ({href, ext} = cta.href === '#form' ? {href: l.product.checkout || '#', ext: !!l.product.checkout} : cta); else if (w.link === 'form') href = '#form'; else if (w.link === 'whatsapp') { href = l.whatsapp ? 'https://wa.me/' + l.whatsapp : '#'; ext = !!l.whatsapp; } else { href = /^(https?:\/\/[^\s"'<>]{1,600}|#[\w-]{1,60}|mailto:[^\s"'<>]{1,200}|tel:[+\d]{3,20})$/i.test(w.href || '') ? w.href : '#'; ext = /^https?:/.test(href); } if (!firstBtn) firstBtn = w.text; h = `<div id="${id}"${a}><a class="btn${w.style === 'outline' ? ' out' : ''}${w.full ? ' fw' : ''}" href="${E(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${E(w.text)}</a></div>`; break; }
      case 'list': h = `<ul id="${id}"${a} class="ck${w.icon === 'x' ? ' no' : w.icon === 'dot' ? ' dot' : ''}">${w.items.filter(i => i.t).map(i => `<li>${R(i.t)}</li>`).join('')}</ul>`; break;
      case 'feature': h = `<div id="${id}"${a} class="card">${w.emoji ? `<div class="bx-em">${E(w.emoji)}</div>` : ''}${w.title ? `<h3>${R(w.title)}</h3>` : ''}${w.text ? `<p>${R(w.text)}</p>` : ''}</div>`; break;
      case 'spacer': bpEach(id, w.h, v => `height:${v}px`); h = `<div id="${id}"${a} class="bx-sp"></div>`; break;
      case 'divider': h = `<hr id="${id}"${a} class="bx-hr">`; break;
      case 'form': { const first = !formDone; formDone = true; h = `<div id="${first ? 'form' : id}"${a} class="bx-form">${w.title ? `<h2>${R(w.title)}</h2>` : ''}${w.text ? `<p class="mut">${R(w.text)}</p>` : ''}${lpFormBox(l, {cta: w.text2 || 'Enviar'})}</div>`; break; }
      case 'faq': h = `<div id="${id}"${a}>${w.items.filter(i => i.t).map(i => `<details><summary>${R(i.t)}</summary><p>${R(i.d)}</p></details>`).join('')}</div>`; break;
      case 'quote': h = `<div id="${id}"${a} class="grid">${w.items.filter(i => i.t).map(i => `<div class="card"><p class="q">“${R(i.t)}”</p><p><strong>${R(i.d)}</strong></p></div>`).join('')}</div>`; break;
      case 'countdown': h = w.date ? `<div id="${id}"${a} class="cd" data-t="${E(w.date)}"><div><b class="cdd">0</b><small>dias</small></div><div><b class="cdh">0</b><small>horas</small></div><div><b class="cdm">0</b><small>min</small></div></div>` : `<div id="${id}"${a} class="bx-ph">Defina a data</div>`; break;
    }
    return h;
  };
  let html = '';
  for (const s of V.sections) {
    const sid = bxSafe(s.id), pt = {d: 64, t: 48, m: 36}, d = s.pad, db = s.padB;
    ['d', 't', 'l', 'm'].forEach(bp => { const t = d[bp], b = db[bp] != null ? db[bp] : d[bp]; if (t != null || b != null || bp === 'd') rule(bp, '#' + sid, `padding-top:${t != null ? t : bp === 'd' ? 64 : ''}px;padding-bottom:${b != null ? b : bp === 'd' ? 64 : ''}px`.replace(/padding-(top|bottom):px;?/g, '')); });
    bpEach(sid + ' .bx-row', s.gap, v => `gap:${v}px`); ['t', 'l', 'm'].forEach(bp => { if (s.hide[bp]) rule(bp, '#' + sid, 'display:none'); });
    let st = ''; if (s.bg) st += `background:${s.bg};color:${bxLum(s.bg) < .4 ? '#fff' : '#141414'};--mut:${bxLum(s.bg) < .4 ? '#d4d4d8' : '#555'};`; if (s.bgImg) { const u = await lpImg(s.bgImg); if (u) st += `background:url('${u}') center/cover;`; }
    let cols = '';
    for (const c of s.cols) {
      const cid = bxSafe(c.id); ['d', 't', 'l', 'm'].forEach(bp => { if (c.span[bp] != null) rule(bp, '#' + cid, `--sp:${c.span[bp]}`); });
      let ws = ''; for (const w of c.widgets) ws += await wHTML(w); cols += `<div id="${cid}"${attr(cid)} class="bx-col v-${c.v}" style="--sp:${c.span.d || 12}">${ws || (P ? '<div class="bx-ph bx-empty">+ Arraste ou adicione um widget</div>' : '')}</div>`;
    }
    html += `<section id="${sid}"${attr(sid)} class="bx-sec${s.alt ? ' alt' : ''}"${st ? ` style="${st}"` : ''}><div class="${s.w === 'full' ? 'wf' : 'w'}"><div class="bx-row">${cols}</div></div></section>\n`;
  }
  const extra = `.bx-vid .yt{all:unset;display:block;width:100%;height:100%;cursor:pointer;background:#000 center/cover no-repeat;position:relative}.bx-vid .yt i{position:absolute;left:50%;top:50%;width:68px;height:48px;margin:-24px 0 0 -34px;background:#e00;border-radius:12px}.bx-vid .yt i:after{content:'';position:absolute;left:27px;top:14px;border:10px solid transparent;border-left:18px solid #fff}.bx-row{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:28px}.bx-col{grid-column:span var(--sp,12);min-width:0}.bx-col.v-center{align-self:center}.bx-col.v-bottom{align-self:end}.bx-sec{padding:64px 0}.wf{padding:0}.bx-col>*+*{margin-top:16px}.bx-col h1,.bx-col h2,.bx-col h3,.bx-col p{margin-bottom:0}.bx-img{--wp:100%}.bx-img img{width:var(--wp);max-width:100%;display:inline-block;vertical-align:top}.bx-vid{width:100%;border-radius:14px;overflow:hidden;background:#000}.bx-vid iframe,.bx-vid video{width:100%;height:100%;border:0;display:block}.bx-ph{background:var(--soft);border:2px dashed var(--line);border-radius:12px;padding:28px;text-align:center;color:var(--mut);font-size:14px}.bx-hr{border:0;border-top:1px solid var(--line);width:100%}.bx-em{font-size:30px;margin-bottom:8px}.btn.out{background:transparent;color:var(--a);border:2px solid var(--a);box-shadow:none}.btn.fw{display:block;text-align:center}ul.ck.dot li::before{content:'•'}.bx-form{max-width:560px}.bx-form h2{margin-bottom:.3em}.bx-sec.alt{background:var(--soft)}`;
  const css2 = extra + css.d.join('') + `@media(max-width:1024px){${css.t.join('')}}@media(max-width:880px) and (orientation:landscape){${css.l.join('')}}@media(max-width:640px){${css.m.join('')}}`;
  return {html, css: css2, hasForm, firstBtn};
}
function bxPreviewJS(opts) {
  return `<style>[data-bx]{cursor:pointer}[data-bx]:hover{outline:2px dashed #4c6ef5;outline-offset:-2px}.bx-sel{outline:3px solid #4c6ef5!important;outline-offset:-3px}.bx-empty{cursor:pointer}</style><script>(function(){var sel=${JSON.stringify(opts.sel || '')},y=${+opts.scroll || 0};function mark(id){document.querySelectorAll('.bx-sel').forEach(function(e){e.classList.remove('bx-sel')});var e=id&&document.getElementById(id);if(e)e.classList.add('bx-sel')}mark(sel);window.scrollTo(0,y);document.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('[data-bx]');if(el){e.preventDefault();e.stopPropagation();parent.postMessage({bx:el.id},'*')}},true);var t;window.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(function(){parent.postMessage({bxScroll:window.scrollY},'*')},120)});window.addEventListener('message',function(e){if(e.data&&e.data.bxSel!==undefined)mark(e.data.bxSel)})})();</script>`;
}
