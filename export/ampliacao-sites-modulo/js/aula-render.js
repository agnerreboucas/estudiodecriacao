/* ===== Sites de aula: gerador do HTML único (CSS e JS dentro) ===== */
const auE = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
/* *destaque* vira <em>; **negrito** vira <strong>; quebra de linha vira <br> */
const auR = s => auE(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
const auPlain = s => String(s || '').replace(/\*\*?/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
const auParas = s => String(s || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean).map(x => `<p>${auR(x)}</p>`).join('');
const auVars = a => { const sk = AU_SKINS[a.skin] || AU_SKINS.editorial, v = Object.assign({}, sk.v), t = a.theme || {}; ['accent', 'bg', 'ink'].forEach(k => { if (t[k]) v[k] = t[k]; }); if (t.head) v.head = t.head; if (t.body) v.body = t.body; return v; };
function auFontsLink(v) {
  const fams = [...new Set([v.head, v.body, v.mono].filter(f => f && /^[\w \-]+$/.test(f)))]; if (!fams.length) return '';
  return '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?' + fams.map(f => 'family=' + f.replace(/ /g, '+') + ':ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500').join('&') + '&display=swap">';
}
async function auImgSrc(o, k, max) { if (o[k]) { const u = await lpImg(o[k], max || 1400); if (u) return u; } return o[k + 'Url'] || ''; }
function auEmbed(u) {
  u = String(u || '').trim(); let m;
  if ((m = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,15})/.exec(u))) return 'https://www.youtube-nocookie.com/embed/' + m[1];
  if ((m = /vimeo\.com\/(?:video\/)?(\d{5,12})/.exec(u))) return 'https://player.vimeo.com/video/' + m[1];
  return '';
}
/* destino de botão: slide (por posição), endereço, telefone, e-mail ou WhatsApp */
function auHref(a, to, mode) {
  if (!to) return {attr: 'href="#"'}; let m;
  if ((m = /^slide:([\w-]+)$/.exec(to))) { const i = a.slides.findIndex(s => s.id === m[1]); if (i < 0) return {attr: 'href="#"'}; return {attr: mode === 'mapa' ? `href="#" data-open="${i}"` : `href="#s${i}" data-go="${i}"`}; }
  if ((m = /^url:(.+)$/.exec(to))) return {attr: `href="${auE(m[1])}" target="_blank" rel="noopener"`};
  if ((m = /^wa:(\d+)$/.exec(to))) return {attr: `href="https://wa.me/${m[1]}" target="_blank" rel="noopener"`};
  return {attr: `href="${auE(to)}"`};
}
const auHead = (b, cls) => `${b.kicker ? `<span class="au-k">${auE(b.kicker)}</span>` : ''}${b.title ? `<h2 class="au-h ${cls || ''}">${auR(b.title)}</h2>` : ''}${b.text && ['galeria', 'carrossel', 'antes', 'cards', 'modulos'].includes(b.layout) ? `<div class="au-lead">${auParas(b.text)}</div>` : ''}`;

/* renderizadores de bloco */
const AU_R = {
  async capa(a, b, c) {
    const img = await auImgSrc(b, 'image', 1600), btn = (t, to, cls) => t ? `<a class="au-btn ${cls}" ${auHref(a, to, c.mode).attr}>${auE(t)}</a>` : '';
    return `<div class="au-capa"><div class="au-capa-t">${b.kicker ? `<span class="au-chip">${auE(b.kicker)}</span>` : ''}<h1 class="au-h1">${auR(b.title)}</h1>${b.quote ? `<p class="au-quote">${auR(b.quote)}</p>` : ''}<div class="au-btns">${btn(b.btn1, b.to1, 'acc')}${btn(b.btn2, b.to2, 'out')}</div>${(b.stats || []).some(s => s.n) ? `<div class="au-stats">${b.stats.filter(s => s.n).map(s => `<div><b>${auE(s.n)}</b><small>${auE(s.l)}</small></div>`).join('')}</div>` : ''}</div><div class="au-capa-i"${img ? ` style="background-image:url('${img}')"` : ''}>${img ? '' : '<span>Imagem</span>'}</div></div>`;
  },
  async texto(a, b, c) {
    const img = await auImgSrc(b, 'image', 1400), btn = b.btn1 ? `<a class="au-btn acc" ${auHref(a, b.to1, c.mode).attr}>${auE(b.btn1)}</a>` : '';
    const facts = (b.facts || []).filter(f => f.l || f.v).map(f => `<div class="au-fact"><span>${auE(f.l)}</span><b>${auR(f.v)}</b></div>`).join('');
    return `<div class="au-wrap"><div class="au-split ${img ? '' : 'one'} ${b.side === 'right' ? 'rev' : ''}">${img ? `<div class="au-pic" style="background-image:url('${img}')"></div>` : ''}<div class="au-col">${auHead(b)}<div class="au-body">${auParas(b.text)}</div>${facts ? `<div class="au-facts">${facts}</div>` : ''}${btn}</div></div></div>`;
  },
  async modulos(a, b) {
    const st = (b.stats || []).filter(s => s.n).map(s => `<div><b>${auE(s.n)}</b><small>${auE(s.l)}</small></div>`).join('');
    const it = (b.items || []).filter(i => i.h || i.t).map((i, n) => `<div class="au-mod"><span class="au-mn">${String(n + 1).padStart(2, '0')}</span><div><h3>${auR(i.h)}</h3>${i.t ? `<p>${auR(i.t)}</p>` : ''}${i.tags ? `<div class="au-tags">${i.tags.split(',').map(x => x.trim()).filter(Boolean).map(x => `<span>${auE(x)}</span>`).join('')}</div>` : ''}</div></div>`).join('');
    return `<div class="au-wrap"><div class="au-split"><div class="au-col">${auHead(b)}</div>${st ? `<div class="au-statgrid">${st}</div>` : ''}</div>${it ? `<div class="au-list">${b.listTitle ? `<h3 class="au-lt">${auE(b.listTitle)}</h3>` : ''}${it}</div>` : ''}</div>`;
  },
  async galeria(a, b) {
    const im = []; for (const x of b.images || []) { const u = await auImgSrc(x, 'img', 1200); if (u) im.push({u, c: x.cap}); }
    return `<div class="au-wrap">${auHead(b)}<div class="au-mosaic n${Math.min(im.length, 7)}">${im.length ? im.map(x => `<figure><img src="${x.u}" alt="${auE(x.c)}" loading="lazy"${x.c ? `><figcaption>${auE(x.c)}</figcaption>` : '>'}</figure>`).join('') : '<p class="au-empty">Adicione imagens a este bloco.</p>'}</div></div>`;
  },
  async carrossel(a, b) {
    const it = []; for (const x of b.images || []) { const u = await auImgSrc(x, 'img', 1200); it.push({u, h: x.h, c: x.cap}); }
    return `<div class="au-wrap">${auHead(b)}<div class="au-car"><div class="au-car-t">${it.map(x => `<article class="au-car-i">${x.u ? `<img src="${x.u}" alt="${auE(x.h)}" loading="lazy">` : '<div class="au-noimg">Imagem</div>'}${x.h || x.c ? `<div class="au-car-c">${x.h ? `<h3>${auR(x.h)}</h3>` : ''}${x.c ? `<p>${auR(x.c)}</p>` : ''}</div>` : ''}</article>`).join('')}</div><button class="au-car-b l" aria-label="Anterior" type="button">‹</button><button class="au-car-b r" aria-label="Próximo" type="button">›</button></div></div>`;
  },
  async antes(a, b) {
    const ps = []; for (const x of b.pairs || []) { const u1 = await auImgSrc(x, 'before', 1200), u2 = await auImgSrc(x, 'after', 1200); ps.push({u1, u2, c: x.cap}); }
    return `<div class="au-wrap">${auHead(b)}<div class="au-bagrid n${ps.length}">${ps.map(p => p.u1 && p.u2 ? `<figure><div class="au-ba" style="--p:50%"><img class="af" src="${p.u2}" alt="Depois"><img class="bf" src="${p.u1}" alt="Antes"><span class="au-ba-h"></span><i class="l">Antes</i><i class="r">Depois</i><input type="range" min="0" max="100" value="50" aria-label="Arraste para comparar antes e depois"></div>${p.c ? `<figcaption>${auE(p.c)}</figcaption>` : ''}</figure>` : `<figure><div class="au-noimg">Escolha a imagem de antes e a de depois</div></figure>`).join('')}</div></div>`;
  },
  async cards(a, b) {
    const it = []; for (const x of b.items || []) it.push(Object.assign({u: await auImgSrc(x, 'img', 900)}, x));
    return `<div class="au-wrap">${auHead(b)}<div class="au-cards">${it.map(x => `<article class="au-card">${x.u ? `<div class="au-card-i" style="background-image:url('${x.u}')"></div>` : ''}<div class="au-card-b">${x.tag ? `<span class="au-k">${auE(x.tag)}</span>` : ''}<h3>${auR(x.h)}</h3>${x.t ? `<p>${auR(x.t)}</p>` : ''}</div></article>`).join('')}</div></div>`;
  },
  async passos(a, b) { return `<div class="au-wrap">${auHead(b)}<ol class="au-steps">${(b.items || []).filter(i => i.h || i.t).map((i, n) => `<li><span>${String(n + 1).padStart(2, '0')}</span><div><h3>${auR(i.h)}</h3>${i.t ? `<p>${auR(i.t)}</p>` : ''}</div></li>`).join('')}</ol></div>`; },
  async faq(a, b) { return `<div class="au-wrap narrow">${auHead(b)}<div class="au-faq">${(b.items || []).filter(i => i.h).map(i => `<details><summary>${auR(i.h)}</summary><div>${auParas(i.t)}</div></details>`).join('')}</div></div>`; },
  async pergunta(a, b) { return `<div class="au-wrap narrow">${auHead(b)}<div class="au-qa">${(b.items || []).filter(i => i.h).map(i => `<div class="au-qi"><button type="button" class="au-q"><span>${auR(i.h)}</span><i>Ver a resposta</i></button><div class="au-a" hidden>${auParas(i.t)}</div></div>`).join('')}</div></div>`; },
  async citacao(a, b) { return `<div class="au-wrap narrow"><blockquote class="au-bq">“${auR(b.quote)}”${b.by || b.ref ? `<cite>${auE(b.by)}${b.by && b.ref ? ' · ' : ''}${auE(b.ref)}</cite>` : ''}</blockquote></div>`; },
  async video(a, b) { const e = auEmbed(b.url); return `<div class="au-wrap narrow">${auHead(b)}<div class="au-vid">${e ? `<iframe src="${e}" title="${auE(b.title)}" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>` : '<div class="au-noimg">Cole o endereço de um vídeo do YouTube ou do Vimeo</div>'}</div>${b.text ? `<div class="au-body">${auParas(b.text)}</div>` : ''}</div>`; },
  async passo(a, b, c) {
    const img = await auImgSrc(b, 'image', 1200);
    return `<div class="au-passo">${b.kicker ? `<div class="au-etapa">${auE(b.kicker)}</div>` : ''}${b.title ? `<h3 class="au-ph3">${auR(b.title)}</h3>` : ''}${img ? `<img class="au-pimg" src="${img}" alt="">` : ''}${b.quote ? `<blockquote class="au-pq">${auR(b.quote)}${b.ref ? `<cite>${auE(b.ref)}</cite>` : ''}</blockquote>` : ''}<div class="au-body">${auParas(b.text)}</div>${!b.quote && b.ref ? `<cite class="au-ref">${auE(b.ref)}</cite>` : ''}${(b.items || []).some(i => i.h) ? `<div class="au-qa">${b.items.filter(i => i.h).map(i => `<div class="au-qi"><button type="button" class="au-q"><span>${auR(i.h)}</span><i>Ver a resposta</i></button><div class="au-a" hidden>${auParas(i.t)}</div></div>`).join('')}</div>` : ''}${b.goal ? `<div class="au-goal">${auR(b.goal)}</div>` : ''}</div>`;
  },
  async formulario(a, b, c) {
    const lu = (typeof state !== 'undefined' && state.workspace && state.workspace.leadsUrl) || '';
    const ct = (b.contacts || []).filter(x => x.l || x.v).map(x => `<div class="au-ct"><span>${auE(x.l)}</span><b>${auR(x.v)}</b></div>`).join('');
    return `<div class="au-wrap"><div class="au-split"><div class="au-col">${auHead(b)}${b.text ? `<div class="au-body">${auParas(b.text)}</div>` : ''}${ct ? `<div class="au-contacts">${ct}</div>` : ''}</div><form class="au-form" data-leads="${c.preview ? '' : auE(lu)}" data-source="${auE(a.name)}" novalidate><label>Seu nome<input name="name" autocomplete="name" required></label><label>WhatsApp<input name="phone" type="tel" autocomplete="tel" required></label><label>E-mail<input name="email" type="email" autocomplete="email"></label><label>Mensagem<textarea name="message" rows="3"></textarea></label><input name="website" class="au-hp" tabindex="-1" autocomplete="off" aria-hidden="true"><label class="au-ck"><input type="checkbox" name="consent"> Concordo em ser contatado(a) sobre esta aula.</label><button class="au-btn acc" type="submit">${auE(b.button || 'Enviar')}</button><p class="au-ok" hidden>${auE(b.ok || 'Recebemos!')}</p></form></div></div>`;
  },
  async mesa(a, b, c) {
    const m = c.p && c.p.mesa, pg = m && (m.pages || []).find(x => x.id === b.page);
    if (!pg) return `<div class="au-wrap"><div class="au-noimg">Escolha uma página da Mesa para aparecer aqui (ou crie uma nova no painel da direita).</div></div>`;
    let doc = ''; try { doc = await mzInlineImgDoc(m, pg); } catch (e) { return `<div class="au-wrap"><div class="au-noimg">Não consegui montar a página da Mesa: ${auE(e.message)}</div></div>`; }
    const k = auE(b.id), fit = `<script>(function(){function s(){parent.postMessage({auH:document.documentElement.scrollHeight,k:'${b.id}'},'*')}addEventListener('load',s);if(window.ResizeObserver)new ResizeObserver(s).observe(document.documentElement)})()<\/script>`;
    doc = doc.replace(/<\/body>(?![\s\S]*<\/body>)/i, fit + '</body>');
    return `<div class="au-mesa ${b.height || 'fit'}"><iframe data-k="${k}" title="${auE(pg.name)}" srcdoc="${auE(doc)}" loading="lazy"></iframe></div>`;
  },
  async grupo(a, b, c) {
    const kids = []; for (const k of b.blocks || []) kids.push({k, html: await auBlockHTML(a, k, Object.assign({}, c, {depth: (c.depth || 0) + 1}))});
    const nm = k => auPlain(k.title) || auPlain(k.label) || auPlain(k.kicker) || (AU_L[k.layout] ? AU_L[k.layout].label.split(' (')[0] : '');
    const head = (b.kicker || b.title || b.text) ? `<div class="au-gh0">${auHead(b)}${b.text ? `<div class="au-lead">${auParas(b.text)}</div>` : ''}</div>` : '';
    if (b.nav === 'vertical') return `<div class="au-grp v">${head}${kids.map(x => `<div class="au-gi">${x.html}</div>`).join('')}</div>`;
    if (b.nav === 'zoom') return `<div class="au-grp z">${head}<div class="au-tiles">${kids.map((x, i) => `<button type="button" class="au-tile" data-z="${i}"><span class="au-tn">${String(i + 1).padStart(2, '0')}</span><b>${auE(nm(x.k))}</b>${x.k.kicker && x.k.kicker !== nm(x.k) ? `<small>${auE(x.k.kicker)}</small>` : ''}<i>Abrir</i></button>`).join('')}</div><div class="au-zdata" hidden>${kids.map(x => `<div class="au-zc" data-t="${auE(nm(x.k))}">${x.html}</div>`).join('')}</div></div>`;
    return `<div class="au-grp h" data-n="${kids.length}">${head}<div class="au-gbar"><span class="au-gn">1 / ${kids.length}</span><span class="au-gdots">${kids.map((x, i) => `<button type="button" class="${i ? '' : 'on'}" data-gi="${i}" aria-label="${auE(nm(x.k))}" title="${auE(nm(x.k))}"></button>`).join('')}</span><span class="au-gar"><button type="button" class="au-gb l" aria-label="Anterior">‹</button><button type="button" class="au-gb r" aria-label="Próximo">›</button></span></div><div class="au-gt">${kids.map(x => `<div class="au-gp">${x.html}</div>`).join('')}</div></div>`;
  },
  async cta(a, b, c) { return `<div class="au-wrap narrow au-cta"><h2 class="au-h">${auR(b.title)}</h2>${b.text ? `<div class="au-body">${auParas(b.text)}</div>` : ''}${b.btn1 ? `<a class="au-btn acc" ${auHref(a, b.to1, c.mode).attr}>${auE(b.btn1)}</a>` : ''}</div>`; }
};
async function auBlockHTML(a, b, c) { const f = AU_R[b.layout]; return f ? await f(a, b, c) : ''; }

/* ---------- CSS ---------- */
function auCss(a) {
  const v = auVars(a);
  return `*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{--bg:${v.bg};--paper:${v.paper};--cream:${v.cream};--ink:${v.ink};--ink2:${v.ink2};--ash:${v.ash};--accent:${v.accent};--on:${v.on};--line:${v.line};--head:'${v.head}',Georgia,serif;--body:'${v.body}',system-ui,sans-serif;--mono:'${v.mono}',ui-monospace,monospace;--rad:${v.rad}px;--hw:${v.hw};--nav:62px}
html{scroll-behavior:smooth}html,body{background:var(--bg);color:var(--ink);font-family:var(--body);-webkit-font-smoothing:antialiased}
body.sk-vivo{background:radial-gradient(1200px 700px at 20% 10%,#89c4ff 0%,transparent 55%),linear-gradient(180deg,#2b7be8,#0b4aa8) fixed}
img{max-width:100%;display:block}button{font:inherit;cursor:pointer;color:inherit}a{color:inherit}
.au-nav{position:fixed;top:0;left:0;right:0;z-index:900;height:var(--nav);display:flex;align-items:center;gap:28px;padding:0 48px;background:color-mix(in srgb,var(--bg) 94%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
body.sk-vivo .au-nav{background:rgba(8,60,140,.55)}
.au-brand{display:flex;align-items:center;gap:10px;font-family:var(--head);font-size:18px;font-weight:var(--hw);cursor:pointer;flex:none;text-decoration:none}.au-brand img{height:34px;width:auto}
.au-links{flex:1;list-style:none;display:flex;justify-content:center;gap:26px;overflow:hidden}
.au-links a{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ash);text-decoration:none;padding-bottom:3px;border-bottom:1px solid transparent;cursor:pointer;white-space:nowrap}.au-links a:hover,.au-links a.on{color:var(--ink);border-color:var(--accent)}
.au-cta{}.au-ncta{background:var(--accent);color:var(--on);border:0;border-radius:calc(var(--rad)*.6);padding:10px 18px;font:600 12px var(--mono);letter-spacing:.08em;text-transform:uppercase;flex:none;text-decoration:none}
.au-menu{display:none;background:none;border:1px solid var(--line);border-radius:8px;padding:6px 10px;font-size:18px;line-height:1}
.au-prog{position:fixed;left:48px;bottom:22px;z-index:800;font:500 11px var(--mono);letter-spacing:.12em;color:var(--ash);display:flex;align-items:center;gap:12px}.au-prog em{font-style:normal;color:var(--ink)}
.au-bar{width:90px;height:2px;background:var(--line);position:relative}.au-bar::after{content:'';position:absolute;left:0;top:0;height:100%;width:var(--p,0%);background:var(--accent);transition:width .5s}
.au-arr{position:fixed;z-index:800;bottom:14px;border:1px solid var(--line);background:color-mix(in srgb,var(--bg) 90%,transparent);backdrop-filter:blur(8px);color:var(--ink);border-radius:999px;padding:10px 16px;font:500 11px var(--mono);letter-spacing:.1em;text-transform:uppercase;display:flex;gap:8px;align-items:center}
body.sk-vivo .au-arr{background:rgba(8,60,140,.6)}.au-arr.l{left:50%;transform:translateX(-120%)}.au-arr.r{right:48px}.au-arr.off{opacity:.25;pointer-events:none}
.au-wrap{max-width:1180px;margin:0 auto;padding:56px 48px 96px}.au-wrap.narrow{max-width:820px}
.au-k{font:500 11px var(--mono);letter-spacing:.18em;text-transform:uppercase;color:var(--accent);display:block;margin-bottom:14px}
.au-h,.au-h1{font-family:var(--head);font-weight:var(--hw);line-height:1.08;letter-spacing:-.01em}.au-h{font-size:clamp(30px,4.2vw,54px);margin-bottom:18px}.au-h1{font-size:clamp(40px,6.4vw,92px);margin-bottom:22px}
.au-h em,.au-h1 em,.au-ph3 em{font-style:italic;color:var(--accent)}body.sk-vivo .au-h em,body.sk-vivo .au-h1 em{font-style:normal}
.au-lead,.au-body{color:var(--ink2);font-size:17px;line-height:1.7;max-width:62ch}.au-lead{margin-bottom:34px}.au-body p+p,.au-lead p+p{margin-top:14px}.au-body strong{color:var(--ink)}
.au-btns{display:flex;flex-wrap:wrap;gap:12px;margin:26px 0}
.au-btn{display:inline-block;border-radius:calc(var(--rad)*.7);padding:14px 24px;font:600 14px var(--body);text-decoration:none;border:1.5px solid var(--accent);letter-spacing:.02em;cursor:pointer;transition:transform .2s}.au-btn:hover{transform:translateY(-2px)}
.au-btn.acc{background:var(--accent);color:var(--on)}.au-btn.out{background:transparent;color:var(--ink);border-color:var(--line)}
.au-chip{display:inline-block;border:1px solid var(--accent);color:var(--accent);font:500 11px var(--mono);letter-spacing:.14em;text-transform:uppercase;padding:6px 12px;margin-bottom:26px}
.au-capa{display:grid;grid-template-columns:1.05fr .95fr;min-height:calc(100vh - var(--nav))}.au-capa-t{padding:56px 48px 72px 52px;display:flex;flex-direction:column;justify-content:center}.au-capa-i{background:var(--cream) center/cover no-repeat;display:grid;place-items:center;color:var(--ash);min-height:320px}
.au-quote{border-left:2px solid var(--accent);padding-left:16px;font:italic 400 19px/1.55 var(--head);color:var(--ink2);max-width:46ch}
.au-stats{display:flex;gap:34px;margin-top:30px;padding-top:24px;border-top:1px solid var(--line);flex-wrap:wrap}.au-stats b,.au-statgrid b{display:block;font:var(--hw) 40px/1 var(--head);color:var(--ink)}.au-stats small,.au-statgrid small{font:500 10px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--ash)}
.au-split{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}.au-split.one{grid-template-columns:1fr}.au-split.rev .au-pic{order:2}.au-pic{min-height:420px;background:var(--cream) center/cover;border-radius:var(--rad)}
.au-facts{margin-top:26px;background:var(--paper);border-radius:var(--rad);padding:6px 20px}.au-fact{display:flex;gap:18px;padding:13px 0;border-bottom:1px solid var(--line)}.au-fact:last-child{border:0}.au-fact span{flex:0 0 120px;font:500 10px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--ash);padding-top:3px}.au-fact b{font-weight:500;color:var(--ink)}
.au-statgrid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line);border-radius:var(--rad);overflow:hidden}.au-statgrid>div{background:var(--paper);padding:26px;text-align:center}.au-statgrid>div:nth-child(4n+4),.au-statgrid>div:nth-child(1):nth-last-child(odd){background:var(--accent)}.au-statgrid>div:nth-child(4n+4) *,.au-statgrid>div:nth-child(1):nth-last-child(odd) *{color:var(--on)}
.au-list{margin-top:48px}.au-lt{font:var(--hw) 26px var(--head);margin-bottom:12px}.au-mod{display:grid;grid-template-columns:70px 1fr;gap:12px;padding:22px 0;border-top:1px solid var(--line)}.au-mn{font:500 11px var(--mono);letter-spacing:.14em;color:var(--accent);padding-top:6px}.au-mod h3{font:var(--hw) 24px var(--head);margin-bottom:6px}.au-mod p{color:var(--ink2);line-height:1.6;max-width:70ch}
.au-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.au-tags span{font:500 11px var(--mono);border:1px solid var(--line);padding:4px 10px;border-radius:999px;color:var(--ash)}
.au-mosaic{display:grid;gap:10px;grid-template-columns:repeat(4,1fr);grid-auto-rows:210px}.au-mosaic figure{position:relative;overflow:hidden;border-radius:var(--rad);background:var(--cream);cursor:zoom-in;margin:0}.au-mosaic img{width:100%;height:100%;object-fit:cover;transition:transform .5s}.au-mosaic figure:hover img{transform:scale(1.05)}
.au-mosaic figcaption{position:absolute;left:0;right:0;bottom:0;padding:22px 14px 10px;color:#fff;background:linear-gradient(transparent,rgba(0,0,0,.65));font-size:13px}.au-mosaic figure:first-child{grid-column:span 2;grid-row:span 2}.au-mosaic.n1 figure:first-child,.au-mosaic.n2 figure:first-child{grid-column:span 2}.au-empty,.au-noimg{padding:40px;text-align:center;color:var(--ash);border:1px dashed var(--line);border-radius:var(--rad)}
.au-car{position:relative}.au-car-t{display:flex;gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 2px 14px;scrollbar-width:thin}.au-car-i{flex:0 0 min(560px,86%);scroll-snap-align:start;background:var(--paper);border-radius:var(--rad);overflow:hidden;border:1px solid var(--line)}.au-car-i img{width:100%;aspect-ratio:16/10;object-fit:cover}.au-car-c{padding:18px 20px 22px}.au-car-c h3{font:var(--hw) 24px var(--head);margin-bottom:6px}.au-car-c p{color:var(--ink2);line-height:1.6}
.au-car-b{position:absolute;top:36%;width:44px;height:44px;border-radius:50%;border:0;background:var(--accent);color:var(--on);font-size:24px;line-height:1;box-shadow:0 6px 18px rgba(0,0,0,.25)}.au-car-b.l{left:-14px}.au-car-b.r{right:-14px}
.au-bagrid{display:grid;gap:26px;grid-template-columns:1fr 1fr}.au-bagrid.n1{grid-template-columns:minmax(0,820px);justify-content:center}.au-bagrid figure{margin:0}.au-bagrid figcaption{margin-top:10px;color:var(--ash);font-size:14px;text-align:center}
.au-ba{position:relative;aspect-ratio:4/3;overflow:hidden;border-radius:var(--rad);background:var(--cream);user-select:none;touch-action:pan-y}.au-ba img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.au-ba .bf{clip-path:inset(0 calc(100% - var(--p)) 0 0)}
.au-ba-h{position:absolute;top:0;bottom:0;left:var(--p);width:3px;background:#fff;transform:translateX(-50%);box-shadow:0 0 0 1px rgba(0,0,0,.25);pointer-events:none}.au-ba-h::after{content:'↔';position:absolute;top:50%;left:50%;width:42px;height:42px;border-radius:50%;background:#fff;color:#111;transform:translate(-50%,-50%);display:grid;place-items:center;font-size:18px;box-shadow:0 4px 14px rgba(0,0,0,.3)}
.au-ba i{position:absolute;top:12px;font:600 11px var(--mono);letter-spacing:.12em;text-transform:uppercase;background:rgba(0,0,0,.6);color:#fff;padding:5px 10px;border-radius:999px;font-style:normal}.au-ba i.l{left:12px}.au-ba i.r{right:12px}.au-ba input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:ew-resize;margin:0}
.au-cards{display:grid;gap:22px;grid-template-columns:repeat(auto-fit,minmax(250px,1fr))}.au-card{background:var(--paper);border-radius:var(--rad);overflow:hidden;border:1px solid var(--line)}.au-card-i{aspect-ratio:4/3;background:var(--cream) center/cover}.au-card-b{padding:20px}.au-card h3{font:var(--hw) 24px var(--head);margin-bottom:6px}.au-card p{color:var(--ink2);line-height:1.6;font-size:15px}
.au-steps{list-style:none;display:grid;gap:0}.au-steps li{display:grid;grid-template-columns:80px 1fr;padding:24px 0;border-top:1px solid var(--line)}.au-steps li>span{font:var(--hw) 34px var(--head);color:var(--accent)}.au-steps h3{font:var(--hw) 24px var(--head);margin-bottom:6px}.au-steps p{color:var(--ink2);line-height:1.6}
.au-faq details{border-top:1px solid var(--line);padding:18px 0}.au-faq summary{cursor:pointer;font:var(--hw) 22px var(--head);list-style:none;display:flex;justify-content:space-between;gap:12px}.au-faq summary::after{content:'+';color:var(--accent);font-size:26px;line-height:1}.au-faq details[open] summary::after{content:'–'}.au-faq details div{margin-top:12px;color:var(--ink2);line-height:1.7}
.au-qa{display:grid;gap:14px;margin-top:22px}.au-q{width:100%;text-align:left;background:var(--paper);border:1px solid var(--line);border-radius:var(--rad);padding:18px 20px;display:flex;justify-content:space-between;align-items:center;gap:16px;font:var(--hw) 21px/1.3 var(--head)}.au-q i{flex:none;font:600 11px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--accent);font-style:normal}.au-a{padding:16px 20px;border-left:3px solid var(--accent);margin:8px 0 0 6px;color:var(--ink2);line-height:1.7}
.au-bq{font:italic var(--hw) clamp(26px,3.6vw,44px)/1.3 var(--head);text-align:center;padding:60px 0}.au-bq cite{display:block;margin-top:22px;font:500 12px var(--mono);letter-spacing:.14em;text-transform:uppercase;font-style:normal;color:var(--accent)}
.au-vid{aspect-ratio:16/9;border-radius:var(--rad);overflow:hidden;background:#000;margin-bottom:20px}.au-vid iframe{width:100%;height:100%;border:0}
.au-contacts{margin-top:24px;display:grid;gap:12px}.au-ct{display:flex;gap:16px;border-bottom:1px solid var(--line);padding-bottom:12px}.au-ct span{flex:0 0 100px;font:500 10px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--ash);padding-top:3px}
.au-form{display:grid;gap:14px;background:var(--paper);border:1px solid var(--line);border-radius:var(--rad);padding:26px}.au-form label{display:grid;gap:6px;font:500 11px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--ash)}.au-form input:not([type=checkbox]),.au-form textarea{background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:calc(var(--rad)*.5);padding:12px;font:15px var(--body)}.au-ck{display:flex!important;grid-template-columns:none;gap:10px;align-items:flex-start;text-transform:none!important;letter-spacing:0!important;font:14px var(--body)!important}.au-hp{position:absolute!important;left:-9999px}.au-ok{color:var(--accent);font-weight:600}
.au-cta{text-align:center;padding-top:90px}.au-cta .au-body{margin:0 auto 26px}
.au-passo{max-width:760px}.au-etapa{font:600 12px var(--mono);letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:12px}.au-ph3{font:var(--hw) clamp(26px,3.2vw,42px)/1.15 var(--head);margin-bottom:18px}.au-pq{border-left:4px solid var(--accent);padding:6px 0 6px 18px;margin:18px 0;font:italic 20px/1.5 var(--head)}.au-pq cite,.au-ref{display:block;margin-top:8px;font:600 12px var(--mono);letter-spacing:.1em;color:var(--accent);font-style:normal}.au-pimg{border-radius:var(--rad);margin:0 0 18px;max-height:340px;object-fit:cover;width:100%}.au-goal{margin-top:22px;background:var(--accent);color:var(--on);border-radius:var(--rad);padding:16px 20px;font:600 18px var(--head);text-align:center}
.au-mesa iframe{display:block;width:100%;border:0;background:transparent;min-height:300px}.au-mesa.screen iframe{height:calc(100vh - var(--nav))}.au-mesa.tall iframe{height:2200px}.au-mesa.fit iframe{height:900px}
/* sequências (grupos) */
.au-grp.v .au-gi+.au-gi{border-top:1px solid var(--line)}.au-gh0{max-width:1180px;margin:0 auto;padding:48px 48px 0}.au-gh0 .au-h{margin-bottom:8px}
.au-gbar{max-width:1180px;margin:0 auto;padding:18px 48px 0;display:flex;align-items:center;gap:16px}.au-gn{font:500 11px var(--mono);letter-spacing:.12em;color:var(--ash)}.au-gdots{display:flex;gap:8px;flex:1}.au-gdots button{width:26px;height:4px;border:0;border-radius:3px;background:var(--line);padding:0}.au-gdots button.on{background:var(--accent)}.au-gar{display:flex;gap:8px}.au-gb{width:40px;height:40px;border-radius:50%;border:0;background:var(--accent);color:var(--on);font-size:22px;line-height:1}
.au-gt{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}.au-gt::-webkit-scrollbar{display:none}.au-gp{flex:0 0 100%;scroll-snap-align:start;min-width:0;max-height:calc(100vh - var(--nav) - 90px);overflow-y:auto}
.au-tiles{max-width:1180px;margin:0 auto;padding:26px 48px 64px;display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}.au-tile{position:relative;text-align:left;background:var(--paper);border:1px solid var(--line);border-radius:var(--rad);padding:22px 20px 54px;min-height:160px;display:flex;flex-direction:column;gap:8px;transition:transform .25s,border-color .25s}.au-tile:hover{transform:translateY(-4px);border-color:var(--accent)}.au-tile b{font:var(--hw) 24px/1.15 var(--head)}.au-tile small{color:var(--ash)}.au-tn{font:500 11px var(--mono);letter-spacing:.14em;color:var(--accent)}.au-tile i{position:absolute;left:20px;bottom:16px;font:600 11px var(--mono);letter-spacing:.1em;text-transform:uppercase;font-style:normal;color:var(--accent)}
.au-zm{position:fixed;inset:0;z-index:1500;background:color-mix(in srgb,var(--bg) 88%,#000);display:none;flex-direction:column}.au-zm.on{display:flex}body.sk-vivo .au-zm{background:#0a3f93}.au-zbox{flex:1;overflow-y:auto;position:relative;padding-top:14px}.au-zh{display:flex;align-items:center;gap:12px;padding:12px 24px;border-bottom:1px solid var(--line)}.au-zh b{flex:1;font:var(--hw) 20px var(--head)}.au-zh button{border:1px solid var(--line);background:transparent;border-radius:999px;padding:9px 16px;font:600 13px var(--body);color:var(--ink)}.au-zh button.x{background:var(--accent);color:var(--on);border-color:var(--accent)}
/* modo horizontal */
body.m-horizontal{overflow:hidden;height:100vh}.m-horizontal .au-reel{display:flex;height:100vh;width:calc(var(--n)*100vw);transition:transform .75s cubic-bezier(.77,0,.18,1)}.m-horizontal .au-slide{width:100vw;height:100vh;overflow-y:auto;padding-top:var(--nav);flex:none;scrollbar-width:thin}
.m-horizontal .au-capa{min-height:calc(100vh - var(--nav))}
/* modo vertical */
html.m-vertical{scroll-snap-type:y proximity}.m-vertical .au-slide{min-height:100vh;padding-top:var(--nav);scroll-snap-align:start;display:flex;flex-direction:column;justify-content:center}.m-vertical .au-slide>*{width:100%}.m-vertical .au-prog{display:none}.m-vertical .au-arr{display:none}
.au-dots{position:fixed;right:18px;top:50%;transform:translateY(-50%);z-index:800;display:grid;gap:10px}.au-dots a{width:10px;height:10px;border-radius:50%;border:1.5px solid var(--ink);opacity:.35;display:block}.au-dots a.on{background:var(--accent);border-color:var(--accent);opacity:1}.m-horizontal .au-dots{display:none}
/* modo mapa */
body.m-mapa{overflow:hidden;height:100vh}.au-world{position:absolute;left:0;top:0;transform-origin:0 0;transition:transform .9s cubic-bezier(.65,0,.25,1)}.au-trail{position:absolute;left:0;top:0;overflow:visible}
.au-st{position:absolute;transform:translate(-50%,-125px);display:flex;flex-direction:column;align-items:center;transition:opacity .7s}.au-st.dim{opacity:.07}
.au-mk{width:400px;text-align:center;border:0;background:none;color:inherit;padding:0;transition:transform .4s cubic-bezier(.2,.9,.3,1.35)}.au-mk:hover,.au-mk:focus-visible{transform:translateY(-14px)}.au-mk:focus-visible{outline:5px solid #fff;outline-offset:18px;border-radius:30px}
.au-seal{width:170px;height:170px;margin:0 auto 24px;border-radius:50%;display:grid;place-items:center;background:#fff;border:10px solid var(--c);color:var(--c);box-shadow:0 14px 0 rgba(4,40,94,.22)}.au-seal svg{width:92px;height:92px}.au-st.hoje .au-seal{box-shadow:0 0 0 16px rgba(255,255,255,.28),0 14px 0 rgba(4,40,94,.22)}.au-st.feita .au-seal{opacity:.78}
.au-plate{display:block;background:rgba(7,52,114,.5);backdrop-filter:blur(6px);border-radius:32px;padding:26px 30px 30px;box-shadow:inset 0 0 0 3px rgba(255,255,255,.2)}body:not(.sk-vivo) .au-plate{background:var(--paper);box-shadow:none;border:1px solid var(--line)}
.au-plate h2{font:var(--hw) 52px/1 var(--head);color:var(--ink)}.au-plate p{font:600 22px/1.3 var(--body);color:var(--ink2);margin-top:10px}.au-fita{display:inline-block;margin-top:14px;font:700 22px var(--body);padding:6px 20px;border-radius:999px;background:rgba(255,255,255,.16);color:var(--ink)}.hoje .au-fita{background:var(--accent);color:var(--on)}
.au-pn{position:fixed;left:0;right:0;top:var(--nav);bottom:74px;z-index:700;display:none;align-items:flex-start;justify-content:center;overflow-y:auto;padding:18px 20px}.au-pn.on{display:flex}
.au-pbox{width:min(1080px,100%);background:var(--paper);color:var(--ink);border:1px solid var(--line);border-radius:calc(var(--rad)*1.4);box-shadow:0 30px 80px rgba(0,0,0,.35);overflow:hidden}body.sk-vivo .au-pbox{background:rgba(6,45,105,.88);backdrop-filter:blur(10px)}
.au-ph{display:flex;align-items:center;gap:18px;padding:20px 28px;border-bottom:1px solid var(--line)}.au-ph .au-bub{width:62px;height:62px;border-radius:50%;background:#fff;color:var(--c);border:5px solid var(--c);display:grid;place-items:center;flex:none}.au-ph .au-bub svg{width:34px;height:34px}.au-ph small{font:600 12px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--ash)}.au-ph h2{font:var(--hw) 32px/1.1 var(--head)}.au-ph em{font-style:normal;color:var(--ash);font-size:14px}
.au-pb{padding:28px 32px 36px}.au-step{display:none}.au-step.on{display:block}
.au-pbar{position:fixed;left:0;right:0;bottom:0;z-index:750;height:74px;display:none;align-items:center;justify-content:center;gap:14px;background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(10px);border-top:1px solid var(--line)}body.sk-vivo .au-pbar{background:rgba(6,45,105,.85)}.au-pbar.on{display:flex}.au-pbar button{border:1px solid var(--line);background:transparent;border-radius:999px;padding:12px 22px;font:700 15px var(--body);color:var(--ink)}.au-pbar button.main{background:var(--accent);color:var(--on);border-color:var(--accent)}.au-pbar button:disabled{opacity:.35}
.au-pill{display:flex;gap:8px;position:fixed;right:20px;top:calc(var(--nav) + 10px);z-index:760}.au-pill button{width:34px;height:34px;border-radius:50%;border:2px solid var(--line);background:rgba(0,0,0,.18);color:var(--ink);font:700 13px var(--body)}.au-pill button[aria-pressed=true]{background:var(--accent);color:var(--on);border-color:var(--accent)}
.au-dica{position:fixed;left:0;right:0;bottom:16px;text-align:center;font:700 13px var(--body);color:var(--ink2);z-index:600;pointer-events:none}.au-lb{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,.88);display:none;place-items:center;cursor:zoom-out}.au-lb.on{display:grid}.au-lb img{max-width:92vw;max-height:90vh;border-radius:6px}
@media(max-width:900px){.au-nav{padding:0 18px;gap:12px}.au-links{display:none;position:absolute;top:var(--nav);left:0;right:0;flex-direction:column;background:var(--bg);padding:14px 22px;gap:14px;border-bottom:1px solid var(--line)}.au-links.on{display:flex}.au-menu{display:block;margin-left:auto}.au-ncta{display:none}.au-capa,.au-split{grid-template-columns:1fr}.au-capa-i{min-height:240px;order:-1}.au-capa-t{padding:32px 22px 60px}.au-wrap{padding:36px 22px 90px}.au-pic{min-height:260px}.au-mosaic{grid-template-columns:repeat(2,1fr);grid-auto-rows:150px}.au-bagrid{grid-template-columns:1fr}.au-prog{left:18px}.au-arr.r{right:14px}.au-arr.l{transform:none;left:14px}.au-arr span{display:none}.au-dots{right:8px}.au-plate h2{font-size:48px}.au-pb{padding:20px}.au-car-b{display:none}}`;
}

/* ---------- JavaScript do site (um só para os três modos) ---------- */
const AU_JS = `(function(){
var D=document,M=window.AULA||{},mode=M.mode,n=M.n||0,$=function(s,r){return(r||D).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||D).querySelectorAll(s))};
var cur=0;function lab(i){return(M.labels||[])[i]||''}
if(mode==='horizontal'||mode==='vertical'){
 var reel=$('#reel'),links=$$('.au-links a'),dots=$$('.au-dots a'),pc=$('#auC'),pb=$('#auBar'),aL=$('#auL'),aR=$('#auR');
 function go(i,soft){if(i<0||i>=n)return;cur=i;if(mode==='horizontal'){reel.style.transform='translateX(-'+(i*100)+'vw)';var s=D.getElementById('s'+i);if(s)s.scrollTop=0}else{var t=D.getElementById('s'+i);if(t)t.scrollIntoView({behavior:soft?'auto':'smooth'})}mark()}
 function mark(){links.forEach(function(a,k){a.classList.toggle('on',k===cur)});dots.forEach(function(a,k){a.classList.toggle('on',k===cur)});if(pc)pc.textContent=String(cur+1).padStart(2,'0');if(pb)pb.style.setProperty('--p',(n>1?cur/(n-1)*100:0)+'%');if(aL)aL.classList.toggle('off',cur===0);if(aR){aR.classList.toggle('off',cur===n-1);var l=$('span',aR);if(l)l.textContent=cur<n-1?lab(cur+1):''}D.title=(M.title||'')}
 window.go=go;D.addEventListener('click',function(e){var g=e.target.closest&&e.target.closest('[data-go]');if(g){e.preventDefault();go(+g.getAttribute('data-go'));var l=$('.au-links');if(l)l.classList.remove('on')}});
 D.addEventListener('keydown',function(e){if(/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||''))return;if(e.key==='ArrowRight'||(mode==='vertical'&&e.key==='ArrowDown'&&false))go(cur+1);if(e.key==='ArrowLeft')go(cur-1)});
 var tx=0,ty=0;D.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});D.addEventListener('touchend',function(e){if(mode!=='horizontal')return;if(e.target.closest&&e.target.closest('.au-car-t,.au-ba,.au-gt'))return;var dx=tx-e.changedTouches[0].clientX,dy=ty-e.changedTouches[0].clientY;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.3)go(dx>0?cur+1:cur-1)},{passive:true});
 if(mode==='vertical'&&'IntersectionObserver'in window){var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting&&en.intersectionRatio>.5){cur=+en.target.id.slice(1);mark()}})},{threshold:[.5]});$$('.au-slide').forEach(function(s){io.observe(s)})}
 var h=parseInt((location.hash||'').replace('#s',''),10);if(!isNaN(h))go(h,true);else mark();
 window.addEventListener('message',function(e){if(e.data&&e.data.auGo!==undefined)go(+e.data.auGo,true)});
}
/* mapa */
if(mode==='mapa'){
 var world=$('#world'),stations=$$('.au-st'),pn=$('#pn'),pbar=$('#pbar'),dica=$('#dica'),ST=M.st||[],open=-1,step=0,POS=[],W=1600,H=760;
 var today=new Date();today.setHours(0,0,0,0);var atual=0;ST.forEach(function(s,i){if(s.date&&!s.root&&new Date(s.date+'T00:00:00')<=today)atual=i});
 function layout(){var vw=innerWidth,vh=innerHeight,tall=vw/vh<1.15,main=[],root=-1;ST.forEach(function(s,i){if(s.root)root=i;else main.push(i)});var k=main.length||1;
  if(tall){W=760;H=Math.max(900,k*380+(root>=0?360:140));main.forEach(function(si,j){POS[si]={x:W/2+(j%2?170:-170),y:150+j*380+160}});if(root>=0)POS[root]={x:W/2,y:H-170}}
  else{var pad=230;W=Math.max(1500,k*480);H=820;main.forEach(function(si,j){POS[si]={x:pad+(W-2*pad)*(k>1?j/(k-1):.5),y:(j%2?330:230)}});if(root>=0)POS[root]={x:W/2,y:H-130}}
  world.style.width=W+'px';world.style.height=H+'px';var svg=$('#trail');svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.style.width=W+'px';svg.style.height=H+'px';
  var d='',pts=main.map(function(i){return POS[i]});pts.forEach(function(p,j){if(j===0)d='M'+p.x+' '+p.y;else{var q=pts[j-1];d+=tall?' C'+q.x+' '+(q.y+(p.y-q.y)/2)+' '+p.x+' '+(q.y+(p.y-q.y)/2)+' '+p.x+' '+p.y:' C'+(q.x+(p.x-q.x)/2)+' '+q.y+' '+(q.x+(p.x-q.x)/2)+' '+p.y+' '+p.x+' '+p.y}});
  $('#base').setAttribute('d',d||'M0 0');$('#feita').setAttribute('d',d||'M0 0');if(root>=0&&pts.length){var r=POS[root],f=pts[Math.floor(pts.length/2)];$('#raiz').setAttribute('d','M'+f.x+' '+(f.y+220)+' L'+r.x+' '+(r.y-170))}
  stations.forEach(function(el,i){el.style.left=POS[i].x+'px';el.style.top=POS[i].y+'px'});paint()}
 function paint(){var pts=ST.filter(function(s){return!s.root}).length;stations.forEach(function(el,i){var s=ST[i],f=$('.au-fita',el);el.classList.toggle('hoje',!s.root&&i===atual&&!!s.date);el.classList.toggle('feita',!s.root&&!!s.date&&i<atual);if(f)f.textContent=s.root?'':!s.date?'':(i<atual?'Já vimos · ':i===atual?'Hoje · ':'')+s.date.slice(8,10)+'/'+s.date.slice(5,7)});
  var fe=$('#feita'),t=fe.getTotalLength?fe.getTotalLength():0;if(t){fe.style.strokeDasharray=t;var dn=ST.filter(function(s,i){return!s.root&&s.date&&i<=atual}).length;fe.style.strokeDashoffset=t*(1-(pts>1?Math.max(0,dn-1)/(pts-1):0))}}
 function fit(){var vw=innerWidth,vh=innerHeight,top=(D.querySelector('.au-nav')?62:0)+10,bot=open>=0?74:64;var util=Math.max(220,vh-top-bot);
  if(open<0){var s=Math.min(vw/(W+80),util/(H+60));world.style.transform='translate('+(vw-W*s)/2+'px,'+(top+(util-H*s)/2)+'px) scale('+s+')'}
  else{var s0=Math.min(vw/(W+80),util/(H+60)),s2=Math.max(s0*2.4,.9),p=POS[open];world.style.transform='translate('+(vw/2-p.x*s2)+'px,'+(top+util/2-(p.y-60)*s2)+'px) scale('+s2+')'}}
 function show(){var el=stations[open],steps=$$('.au-step',el.querySelector('.au-pdata'));steps.forEach(function(s,i){s.classList.toggle('on',i===step)});var box=$('.au-pb',pn);box.innerHTML='';box.appendChild(steps[step].cloneNode(true));steps[step].classList.add('on');$('#prev').disabled=step===0;$('#next').textContent=step===steps.length-1?'Ver o mapa':'Próximo';var dts=$('#dots');dts.innerHTML='';steps.forEach(function(_,i){var b=D.createElement('button');b.textContent=i+1;b.setAttribute('aria-pressed',i===step);b.onclick=function(){step=i;show()};b.style.cssText='width:34px;height:34px;padding:0';dts.appendChild(b)});pn.scrollTop=0}
 function openSt(i){if(i<0||i>=stations.length)return;open=i;step=0;stations.forEach(function(el,k){el.classList.toggle('dim',k!==i)});var s=ST[i],h=$('.au-ph',pn);$('.au-bub',h).innerHTML=$('.au-seal',stations[i]).innerHTML;h.style.setProperty('--c',s.color);$('small',h).textContent=s.root?'O fundamento':'Encontro '+(i+1)+(s.date?' · '+s.date.slice(8,10)+'/'+s.date.slice(5,7):'');$('h2',h).textContent=s.title;$('em',h).textContent=[s.phrase,s.ref].filter(Boolean).join(' · ');fit();setTimeout(function(){if(open===i){pn.classList.add('on');pbar.classList.add('on');dica.hidden=true;show()}},520)}
 function closeSt(){open=-1;pn.classList.remove('on');pbar.classList.remove('on');dica.hidden=false;stations.forEach(function(el){el.classList.remove('dim')});fit()}
 function walk(d){if(open<0)return;var tot=$$('.au-step',stations[open].querySelector('.au-pdata')).length;if(step+d<0)return;if(step+d>=tot){closeSt();return}step+=d;show()}
 stations.forEach(function(el,i){$('.au-mk',el).addEventListener('click',function(){openSt(i)})});
 D.addEventListener('click',function(e){var o=e.target.closest&&e.target.closest('[data-open]');if(o){e.preventDefault();openSt(+o.getAttribute('data-open'))}});
 $('#next').onclick=function(){walk(1)};$('#prev').onclick=function(){walk(-1)};$('#back').onclick=closeSt;
 D.addEventListener('keydown',function(e){if(/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||''))return;if(e.key==='Escape')closeSt();else if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();open<0?openSt(atual):walk(1)}else if(e.key==='ArrowLeft')walk(-1)});
 var pills=$('#pills');if(pills)ST.forEach(function(s,i){if(s.root)return;var b=D.createElement('button');b.textContent=i+1;b.title=s.title;b.onclick=function(){atual=i;paint();$$('button',pills).forEach(function(x,k){x.setAttribute('aria-pressed',k===i)})};b.setAttribute('aria-pressed',i===atual);pills.appendChild(b)});
 addEventListener('resize',function(){layout();fit()});layout();fit();
 window.addEventListener('message',function(e){if(e.data&&e.data.auGo!==undefined){var i=+e.data.auGo;if(i<0)closeSt();else openSt(i)}});
}
/* sequências: horizontal (desliza) e zoom (cartões que abrem) */
D.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('.au-gb,.au-gdots button');if(t){var g=t.closest('.au-grp'),tr=$('.au-gt',g),w=tr.clientWidth;if(t.classList.contains('au-gb'))tr.scrollBy({left:t.classList.contains('l')?-w:w,behavior:'smooth'});else tr.scrollTo({left:w*(+t.getAttribute('data-gi')),behavior:'smooth'})}});
D.addEventListener('scroll',function(e){var tr=e.target;if(!tr||!tr.classList||!tr.classList.contains('au-gt'))return;var g=tr.closest('.au-grp'),i=Math.round(tr.scrollLeft/Math.max(1,tr.clientWidth)),n=+g.getAttribute('data-n')||1;$$('.au-gdots button',g).forEach(function(b,k){b.classList.toggle('on',k===i)});var c=$('.au-gn',g);if(c)c.textContent=(i+1)+' / '+n},true);
var zm=$('#zm'),zi=0,zk=[],zg=null;
function zshow(i,from){zi=(i+zk.length)%zk.length;var box=$('.au-zbox',zm);box.innerHTML=zk[zi].innerHTML;box.scrollTop=0;$('.au-zh b',zm).textContent=zk[zi].getAttribute('data-t')||'';$('.zn',zm).textContent=(zi+1)+' / '+zk.length;
 if(from&&box.animate){var r=from.getBoundingClientRect(),W=innerWidth,H=innerHeight;zm.animate([{transform:'translate('+(r.left+r.width/2-W/2)+'px,'+(r.top+r.height/2-H/2)+'px) scale('+(r.width/W)+','+(r.height/H)+')',opacity:.3,borderRadius:'18px'},{transform:'none',opacity:1,borderRadius:'0px'}],{duration:480,easing:'cubic-bezier(.2,.8,.2,1)'})}}
function zclose(){zm.classList.remove('on');D.body.style.overflow=''}
D.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('.au-tile');if(t){zg=t.closest('.au-grp');zk=$$('.au-zc',zg);zm.classList.add('on');zshow(+t.getAttribute('data-z'),t);return}
 if(!zm.classList.contains('on'))return;if(e.target.closest('.x'))zclose();else if(e.target.closest('.zp'))zshow(zi-1);else if(e.target.closest('.zn2'))zshow(zi+1)});
D.addEventListener('keydown',function(e){if(!zm.classList.contains('on'))return;if(e.key==='Escape'){zclose();e.stopImmediatePropagation()}else if(e.key==='ArrowRight'){zshow(zi+1);e.stopImmediatePropagation()}else if(e.key==='ArrowLeft'){zshow(zi-1);e.stopImmediatePropagation()}},true);
window.addEventListener('message',function(e){var d=e.data;if(d&&d.auH&&d.k){var f=$('.au-mesa.fit iframe[data-k="'+d.k+'"]');if(f)f.style.height=d.auH+'px'}});
/* componentes comuns */
D.addEventListener('click',function(e){var q=e.target.closest&&e.target.closest('.au-q');if(q){var a=q.parentNode.querySelector('.au-a');a.hidden=!a.hidden;q.querySelector('i').textContent=a.hidden?'Ver a resposta':'Esconder'}
 var cb=e.target.closest&&e.target.closest('.au-car-b');if(cb){var t=cb.parentNode.querySelector('.au-car-t'),w=t.firstElementChild?t.firstElementChild.offsetWidth+18:300;t.scrollBy({left:cb.classList.contains('l')?-w:w,behavior:'smooth'})}
 var im=e.target.closest&&e.target.closest('.au-mosaic img');if(im){var lb=$('#lb');lb.querySelector('img').src=im.src;lb.classList.add('on')}
 if(e.target.closest&&e.target.closest('#lb'))$('#lb').classList.remove('on');
 var mn=e.target.closest&&e.target.closest('.au-menu');if(mn)$('.au-links').classList.toggle('on')});
$$('.au-ba input').forEach(function(r){r.addEventListener('input',function(){r.parentNode.style.setProperty('--p',r.value+'%')})});
$$('.au-form').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();var d={source:f.getAttribute('data-source')||'aula'};new FormData(f).forEach(function(v,k){d[k]=v});if(d.website)return;if(!d.name||!d.phone||!d.consent){alert('Preencha nome, WhatsApp e marque o aceite.');return}delete d.consent;var ok=function(){var o=f.querySelector('.au-ok');if(o)o.hidden=false;f.reset()},u=f.getAttribute('data-leads');if(!u){ok();return}fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(function(r){if(!r.ok)throw 0;ok()}).catch(function(){alert('Não foi possível enviar. Tente de novo.')})})});
})();`;

/* ---------- página inteira ---------- */
async function auHTML(a, p, opts) {
  opts = opts || {}; const v = auVars(a), mode = a.mode, ctx = {mode, preview: !!opts.preview, p}, n = a.slides.length, nav = a.nav || {};
  const labels = a.slides.map((s, i) => s.label || auPlain(s.title) || auPlain(s.kicker) || ('Parte ' + (i + 1))); let body = '', title = a.name;
  const logo = a.logo ? await lpImg(a.logo, 300) : '';
  const brand = `<a class="au-brand" href="#s0" ${mode === 'mapa' ? 'data-open-none' : 'data-go="0"'}>${logo ? `<img src="${logo}" alt="">` : ''}${auE(a.brand || a.name)}</a>`;
  const cta = nav.cta ? `<a class="au-ncta" ${auHref(a, nav.ctaTo || (a.slides.length ? 'slide:' + a.slides[a.slides.length - 1].id : ''), mode).attr}>${auE(nav.cta)}</a>` : '';
  const head = nav.top === false ? '' : `<header class="au-nav">${brand}<ul class="au-links">${mode === 'mapa' ? '' : labels.map((l, i) => `<li><a data-go="${i}">${auE(l)}</a></li>`).join('')}</ul>${cta}<button class="au-menu" type="button" aria-label="Menu">☰</button></header>`;
  if (mode === 'mapa') {
    const st = []; for (const s of a.slides) {
      const steps = []; for (const b of s.steps) steps.push(`<div class="au-step">${await auBlockHTML(a, b, ctx)}</div>`);
      st.push({s, steps});
    }
    body = `<main class="au-world" id="world"><svg class="au-trail" id="trail" aria-hidden="true"><path id="raiz" d="M0 0" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="6" stroke-dasharray="12 18" stroke-linecap="round"/><path id="base" d="M0 0" fill="none" stroke="rgba(255,255,255,.38)" stroke-width="12" stroke-linecap="round"/><path id="feita" d="M0 0" fill="none" stroke="var(--accent)" stroke-width="12" stroke-linecap="round"/></svg>${st.map(({s, steps}) => `<div class="au-st" style="--c:${s.color}"><button class="au-mk" type="button" aria-label="Abrir ${auE(s.title)}"><span class="au-seal">${auSvg(s.icon, 'solid')}</span><span class="au-plate"><h2>${auE(s.title)}</h2>${s.phrase ? `<p>${auE(s.phrase)}</p>` : ''}${s.root ? '' : '<span class="au-fita"></span>'}</span></button><div class="au-pdata" hidden>${steps.join('')}</div></div>`).join('')}</main>
      <section class="au-pn" id="pn"><div class="au-pbox"><div class="au-ph"><span class="au-bub"></span><div><small></small><h2></h2><em></em></div></div><div class="au-pb"></div></div></section>
      <div class="au-pill" id="pills"></div><div class="au-pbar" id="pbar"><button id="back" type="button">Ver o mapa</button><button id="prev" type="button">Anterior</button><span id="dots" style="display:flex;gap:6px"></span><button id="next" class="main" type="button">Próximo</button></div><div class="au-dica" id="dica">Toque numa estação para entrar. Setas do teclado navegam; Esc volta ao mapa.</div>`;
  } else {
    const sl = []; for (let i = 0; i < n; i++) sl.push(`<section class="au-slide" id="s${i}">${await auBlockHTML(a, a.slides[i], ctx)}</section>`);
    body = `<main class="au-reel" id="reel" style="--n:${n}">${sl.join('')}</main>${nav.progress !== false && mode === 'horizontal' ? `<div class="au-prog"><span><em id="auC">01</em> / ${String(n).padStart(2, '0')}</span><div class="au-bar" id="auBar"></div></div>` : ''}${nav.arrows !== false && mode === 'horizontal' ? `<button class="au-arr l off" id="auL" type="button" onclick="go(cur-1)" aria-label="Anterior">‹</button><button class="au-arr r" id="auR" type="button" onclick="go(cur+1)" aria-label="Próximo"><span></span>›</button>` : ''}${mode === 'vertical' ? `<nav class="au-dots" aria-label="Seções">${labels.map((l, i) => `<a data-go="${i}" title="${auE(l)}" href="#s${i}"></a>`).join('')}</nav>` : ''}`;
  }
  const data = {mode, n, labels, title, st: mode === 'mapa' ? a.slides.map(s => ({root: !!s.root, date: s.date, title: s.title, phrase: s.phrase, ref: s.ref, color: s.color})) : []};
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${auE(a.name)}</title>${a.desc ? `<meta name="description" content="${auE(a.desc)}">` : ''}${auFontsLink(v)}<style>${auCss(a)}</style></head><body class="sk-${a.skin} m-${mode}"><script>document.documentElement.classList.add('m-${mode}')</script>${head}${body}<div class="au-lb" id="lb"><img alt=""></div><div class="au-zm" id="zm"><div class="au-zh"><b></b><button type="button" class="zp">‹ Anterior</button><span class="zn" style="font:500 12px var(--mono);color:var(--ash)"></span><button type="button" class="zn2">Próximo ›</button><button type="button" class="x">Fechar</button></div><div class="au-zbox"></div></div><script>window.AULA=${json};${AU_JS}</script></body></html>`;
}
