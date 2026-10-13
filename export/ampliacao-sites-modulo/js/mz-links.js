/* ===== Mesa de páginas · Links e Fontes =====
   Links: mapa de links entre as páginas, atualização dos menus de todas as páginas e verificador de links quebrados.
   Fontes: lista as fontes usadas, instala do Google Fonts, envia o arquivo da fonte ou troca por outra no site inteiro.
   Link interno canônico: "/slug" (início: "/"). Na exportação (HTML/ZIP) vira "slug.html" / "index.html"; na Prévia, navega dentro da prévia. */

/* ---------- resolver links ---------- */
const MZ_SPECIAL_LINKS = ['proximo', 'anterior', 'mapa', 'inicio'];
const mzPageFile = pg => pg.home ? 'index.html' : mzSlug(pg.slug || pg.name) + '.html';
const mzPagePath = pg => pg.home ? '/' : '/' + pg.slug;
/* href interno → {page, hash}; externos, âncoras da própria página e especiais devolvem null */
function mzResolveHref(m, href) {
  let h = String(href || '').trim(); if (!h || /^(https?:|mailto:|tel:|\{\{|#)/i.test(h)) return null; let hash = '';
  const i = h.indexOf('#'); if (i >= 0) { hash = h.slice(i); h = h.slice(0, i); } const q = h.indexOf('?'); if (q >= 0) h = h.slice(0, q);
  h = h.replace(/^\.?\//, '').replace(/^\/+/, '').replace(/\/+$/, '').replace(/\.html?$/i, '');
  if (h === '' || h === 'index') return {page: m.pages.find(p => p.home) || m.pages[0], hash};
  const pg = m.pages.find(p => p.slug === h); return {page: pg || null, hash, missing: h};
}
/* mode 'file': links entre páginas viram os nomes dos arquivos; 'preview': viram um aviso para a Prévia trocar de página */
function mzHrefMapper(m, mode) { return h => { const r = mzResolveHref(m, h); if (!r || !r.page) return h; return mode === 'preview' ? '#mzgo:' + r.page.id : mzPageFile(r.page) + (r.hash || ''); }; }

/* ---------- coletar todos os links do site ---------- */
function mzCollectLinks(m) {
  m = m || mzM(); const rows = [];
  const add = (pg, comp, n, what, href, set) => rows.push({pageId: pg ? pg.id : '', pageName: pg ? pg.name : 'Componente: ' + (comp ? comp.name : ''), compId: comp ? comp.id : '', nodeId: n.id, el: n.name || MZ_NAMES[n.type] || n.type, what, href: href || '', set});
  const scan = (root, pg, comp) => mzWalk(root, n => {
    const P = n.props || {};
    if (['button', 'image', 'logo', 'link'].includes(n.type)) { if (n.type !== 'image' && n.type !== 'logo' || P.href) add(pg, comp, n, n.type === 'button' ? 'Botão “' + P.text + '”' : n.type === 'link' ? 'Área clicável' : 'Imagem', P.href, v => { n.props.href = MZ_URL(v); }); }
    if (n.type === 'menu') (P.items || []).forEach((it, i) => add(pg, comp, n, 'Item “' + it.label + '”', it.href, v => { n.props.items[i].href = MZ_URL(v) || '#'; }));
    if (n.type === 'carousel') (P.slides || []).forEach((s, i) => { if (s.href) add(pg, comp, n, 'Slide ' + (i + 1), s.href, v => { n.props.slides[i].href = MZ_URL(v); }); });
    if (n.type === 'form' && P.thanks) add(pg, comp, n, 'Página de obrigado', P.thanks, v => { n.props.thanks = MZ_URL(v); });
    const rich = (html, setHtml, what) => { const hs = []; String(html || '').replace(/href="([^"]*)"/g, (mm, u) => { hs.push(u); return mm; }); hs.forEach((u, k) => add(pg, comp, n, what + ' (link no texto)', u.replace(/&amp;/g, '&'), v => { let c = -1; setHtml(String(html).replace(/href="([^"]*)"/g, m2 => ++c === k ? 'href="' + mzEsc(MZ_URL(v) || '#') + '"' : m2)); })); };
    if (n.type === 'text') rich(P.html, h => { n.props.html = mzRich(h); }, 'Texto');
    if (n.type === 'accordion') (P.items || []).forEach((it, i) => rich(it.a, h => { n.props.items[i].a = mzRich(h); }, 'Resposta ' + (i + 1)));
    if (n.type === 'tabs') (P.items || []).forEach((it, i) => rich(it.c, h => { n.props.items[i].c = mzRich(h); }, 'Aba ' + (i + 1)));
  });
  m.pages.forEach(pg => scan(pg.root, pg, null)); m.comps.forEach(c => scan(c.root, null, c)); return rows;
}
/* existe um elemento com este ID? (na página; para componentes, em qualquer página) */
function mzHasAnchor(m, pg, id) { const has = r => { let ok = false; mzWalk(r, n => { if (n.htmlId === id) ok = true; }); return ok; }; const ps = pg ? [pg] : m.pages; return ps.some(p => has(p.root)) || m.comps.some(c => has(c.root)); }
function mzLinkStatus(m, pg, href) {
  const h = String(href || '').trim();
  if (!h || h === '#') return {s: 'warn', msg: 'Ainda sem destino (vazio ou “#”).'};
  if (/^\{\{/.test(h)) return {s: 'ok', msg: 'Variável (preenchida na publicação).'};
  if (/^mailto:/i.test(h)) return /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+/i.test(h) ? {s: 'ok', msg: 'E-mail.'} : {s: 'bad', msg: 'Endereço de e-mail incompleto.'};
  if (/^tel:/i.test(h)) return /^tel:[+\d\s()\-]{6,}/i.test(h) ? {s: 'ok', msg: 'Telefone.'} : {s: 'bad', msg: 'Telefone curto demais.'};
  if (/^https?:\/\//i.test(h)) { try { const u = new URL(h); return {s: 'ext', msg: 'Link externo (' + u.hostname + '). Daqui não dá para saber se a página responde: abra para conferir.'}; } catch (e) { return {s: 'bad', msg: 'Endereço inválido.'}; } }
  if (h[0] === '#') { const id = h.slice(1); if (MZ_SPECIAL_LINKS.includes(id)) return {s: 'ok', msg: 'Atalho da navegação da aula' + (pg && pg.nav ? '.' : ' (sem navegação de aula vai para a seção seguinte ou anterior).')}; return mzHasAnchor(m, pg, id) ? {s: 'ok', msg: 'Âncora existe nesta página.'} : {s: 'bad', msg: 'Nenhum elemento tem o ID “' + id + '” (aba Avançado → ID).'}; }
  const r = mzResolveHref(m, h); if (!r) return {s: 'bad', msg: 'Tipo de link não permitido.'};
  if (!r.page) return {s: 'bad', msg: 'A página “' + r.missing + '” não existe neste site.'};
  if (r.hash && r.hash.length > 1 && !MZ_SPECIAL_LINKS.includes(r.hash.slice(1)) && !mzHasAnchor(m, r.page, r.hash.slice(1))) return {s: 'bad', msg: 'A página “' + r.page.name + '” não tem o ID “' + r.hash.slice(1) + '”.'};
  if (r.page.priv) return {s: 'warn', msg: 'Aponta para uma página privada (“' + r.page.name + '”).'};
  return {s: 'ok', msg: 'Vai para “' + r.page.name + '”.'};
}
/* resultado completo do verificador */
function mzLinksCheck(m) {
  m = m || mzM(); const rows = mzCollectLinks(m), pgOf = id => m.pages.find(p => p.id === id); rows.forEach(r => Object.assign(r, mzLinkStatus(m, pgOf(r.pageId), r.href)));
  mzWalk0(m, (n, pg, comp) => { if (n.type === 'form' && !n.props.action) rows.push({pageId: pg ? pg.id : '', pageName: pg ? pg.name : 'Componente: ' + comp.name, compId: comp ? comp.id : '', nodeId: n.id, el: n.name || 'Formulário', what: 'Formulário', href: '', s: 'warn', msg: 'Formulário sem endereço de recebimento (leads): os contatos não serão enviados.', set: null, form: true}); });
  const pri = {bad: 0, warn: 1, ext: 2, ok: 3}; return rows.sort((a, b) => pri[a.s] - pri[b.s]);
}
function mzWalk0(m, fn) { m.pages.forEach(pg => mzWalk(pg.root, n => fn(n, pg, null))); m.comps.forEach(c => mzWalk(c.root, n => fn(n, null, c))); }
/* arestas do mapa: de página para página */
function mzLinkGraph(m) {
  m = m || mzM(); const rows = mzCollectLinks(m), edges = new Map(), inc = new Map(), ext = new Map(); m.pages.forEach(p => { inc.set(p.id, 0); ext.set(p.id, 0); });
  rows.forEach(r => { if (!r.pageId) return; if (/^https?:/i.test(r.href)) { ext.set(r.pageId, (ext.get(r.pageId) || 0) + 1); return; } const t = mzResolveHref(m, r.href); if (t && t.page && t.page.id !== r.pageId) { const k = r.pageId + '>' + t.page.id; edges.set(k, (edges.get(k) || 0) + 1); inc.set(t.page.id, (inc.get(t.page.id) || 0) + 1); } });
  return {edges: [...edges].map(([k, c]) => { const [a, b] = k.split('>'); return {from: a, to: b, count: c}; }), incoming: inc, external: ext};
}

/* ---------- janela Links ---------- */
const MZ_LK = {tab: 'map', filter: 'all', rows: [], menu: null};
function mzModalLinks(tab) {
  if (tab) MZ_LK.tab = tab; const m = mzM(), tabs = [['map', 'Mapa de links'], ['menus', 'Menus'], ['check', 'Links quebrados']];
  const body = MZ_LK.tab === 'map' ? mzLkMapHtml(m) : MZ_LK.tab === 'menus' ? mzLkMenusHtml(m) : mzLkCheckHtml(m);
  mzModal('Links do site', `<div class="mz-ltabs">${tabs.map(([k, n]) => `<button class="${MZ_LK.tab === k ? 'on' : ''}" data-lk="${k}" onclick="mzModalLinks('${k}')">${n}</button>`).join('')}</div>${body}`, {wide: true});
}
function mzLkMapHtml(m) {
  const g = mzLinkGraph(m), N = m.pages.length, W = 820, H = N <= 8 ? 400 : 120 + Math.ceil(N / 4) * 90, pos = {};
  m.pages.forEach((p, i) => { if (N <= 8) { const a = -Math.PI / 2 + i * 2 * Math.PI / Math.max(1, N); pos[p.id] = N === 1 ? [W / 2, H / 2] : [W / 2 + Math.cos(a) * 300, H / 2 + Math.sin(a) * 155]; } else pos[p.id] = [110 + (i % 4) * 200, 60 + Math.floor(i / 4) * 90]; });
  const bw = 130, bh = 36, edge = e => { const a = pos[e.from], b = pos[e.to]; if (!a || !b) return ''; const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, k = Math.min(Math.abs(bw / 2 / (ux || 1e-6)), Math.abs(bh / 2 / (uy || 1e-6))) + 3, off = 6; const x1 = a[0] + ux * k - uy * off, y1 = a[1] + uy * k + ux * off, x2 = b[0] - ux * k - uy * off, y2 = b[1] - uy * k + ux * off; return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="lke" marker-end="url(#mzArr)"><title>${esc(mzPgName(m, e.from))} → ${esc(mzPgName(m, e.to))}: ${e.count} link(s)</title></line>`; };
  const node = p => { const [x, y] = pos[p.id]; return `<g class="lkn ${p.home ? 'home' : ''} ${p.id === m.cur ? 'cur' : ''}" onclick="mzLkOpenPage('${p.id}')"><rect x="${x - bw / 2}" y="${y - bh / 2}" width="${bw}" height="${bh}" rx="9"/><text x="${x}" y="${y + 4}" text-anchor="middle">${esc((p.home ? '★ ' : '') + p.name.slice(0, 16))}</text></g>`; };
  const orphans = m.pages.filter(p => !p.home && !g.incoming.get(p.id));
  return `<p class="mz-hint" style="margin-top:0">Cada seta é um ou mais links de uma página para outra. Clique numa página para abri-la. ★ = página inicial.</p>
    <div class="mz-lkmap"><svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Mapa de links entre as páginas"><defs><marker id="mzArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="lka"/></marker></defs>${g.edges.map(edge).join('')}${m.pages.map(node).join('')}</svg></div>
    ${orphans.length ? `<div class="mz-note">Ninguém aponta para: <b>${orphans.map(p => esc(p.name)).join(', ')}</b>. Adicione essas páginas a um menu (aba Menus) ou a um botão.</div>` : ''}
    <table class="mz-lkt"><thead><tr><th>Página</th><th>Endereço</th><th>Recebe links de</th><th>Links externos</th></tr></thead><tbody>${m.pages.map(p => { const from = g.edges.filter(e => e.to === p.id).map(e => esc(mzPgName(m, e.from)) + ' (' + e.count + ')'); return `<tr><td><a href="#" onclick="mzLkOpenPage('${p.id}');return false">${esc(p.name)}</a>${p.home ? ' ★' : ''}${p.priv ? ' <span class="mz-tag">privada</span>' : ''}</td><td><code>${esc(mzPagePath(p))}</code></td><td>${from.length ? from.join(', ') : '<span class="muted">—</span>'}</td><td>${g.external.get(p.id) || 0}</td></tr>`; }).join('')}</tbody></table>`;
}
const mzPgName = (m, id) => (m.pages.find(p => p.id === id) || {}).name || '?';
function mzLkOpenPage(id) { mzModalClose(); mzPageOpen(id); mzPageSelUpdate(); }

function mzLkMenusHtml(m) {
  let cnt = 0; mzWalk0(m, n => { if (n.type === 'menu') cnt++; });
  if (!MZ_LK.menu || MZ_LK.menu.v !== m.pages.map(p => p.id).join()) { MZ_LK.menu = {v: m.pages.map(p => p.id).join(), sel: {}, lab: {}, keep: true}; m.pages.forEach(p => { MZ_LK.menu.sel[p.id] = !p.priv; MZ_LK.menu.lab[p.id] = p.name; }); }
  const M = MZ_LK.menu;
  return `<p class="mz-hint" style="margin-top:0">Escolha as páginas que entram no menu e clique em atualizar: todos os elementos “Menu” de <b>todas as páginas</b> (e dos componentes) passam a ter a mesma lista, apontando para as páginas certas. Foram encontrados <b>${cnt}</b> menu(s) no site.</p>
    <div class="mz-mnl">${m.pages.map((p, i) => `<div class="mz-mnr"><label class="mz-ck"><input type="checkbox" ${M.sel[p.id] ? 'checked' : ''} onchange="MZ_LK.menu.sel['${p.id}']=this.checked"> <code>${esc(mzPagePath(p))}</code></label><input value="${esc(M.lab[p.id])}" onchange="MZ_LK.menu.lab['${p.id}']=this.value" aria-label="Texto do menu para ${esc(p.name)}">${p.priv ? '<span class="mz-tag">privada</span>' : ''}${p.home ? '<span class="mz-tag ok">início</span>' : ''}</div>`).join('')}</div>
    <label class="mz-ck"><input type="checkbox" ${M.keep ? 'checked' : ''} onchange="MZ_LK.menu.keep=this.checked"> Manter os itens que não são páginas (âncoras como #contato e links externos)</label>
    <div class="row-gap" style="margin-top:10px"><button class="btn dark" onclick="mzMenusApply()" ${cnt ? '' : 'disabled'}>Atualizar os menus de todas as páginas</button></div>${cnt ? '' : '<p class="mz-hint">Nenhum menu no site ainda. Insira um bloco “Cabeçalho com menu” ou o elemento Menu.</p>'}<div id="mzLkMsg" class="mz-hint"></div>`;
}
function mzMenusApply() {
  const m = mzM(), M = MZ_LK.menu; if (!M) return; const items = m.pages.filter(p => M.sel[p.id]).map(p => ({label: String(M.lab[p.id] || p.name).slice(0, 60), href: mzPagePath(p)}));
  if (!items.length) { toast('Marque ao menos uma página.'); return; } let n = 0;
  mzWalk0(m, node => { if (node.type !== 'menu') return; const keep = M.keep ? (node.props.items || []).filter(it => it.href && it.href !== '#' && !mzResolveHref(m, it.href)) : []; node.props.items = items.concat(keep).slice(0, 20); n++; });
  if (!n) { toast('Nenhum menu encontrado.'); return; } mzCommit({panels: true}); toast(n + ' menu(s) atualizados.'); mzModalLinks('menus'); const e = document.getElementById('mzLkMsg'); if (e) e.textContent = n + ' menu(s) atualizados com ' + items.length + ' página(s).';
}

function mzLkCheckHtml(m) {
  const rows = mzLinksCheck(m); MZ_LK.rows = rows; const c = {ok: 0, ext: 0, warn: 0, bad: 0}; rows.forEach(r => c[r.s]++); const f = MZ_LK.filter;
  const chip = (k, t, n) => `<button class="mz-chip ${f === k ? 'on' : ''}" onclick="MZ_LK.filter='${k}';mzModalLinks('check')">${t} <b>${n}</b></button>`;
  const lab = {ok: 'OK', ext: 'Externo', warn: 'Aviso', bad: 'Quebrado'};
  const list = rows.map((r, i) => ({r, i})).filter(({r}) => f === 'all' || r.s === f);
  return `<div class="mz-chips2">${chip('all', 'Todos', rows.length)}${chip('bad', 'Quebrados', c.bad)}${chip('warn', 'Avisos', c.warn)}${chip('ext', 'Externos', c.ext)}${chip('ok', 'OK', c.ok)}<button class="btn sm" style="margin-left:auto" onclick="mzModalLinks('check')">Verificar de novo</button></div>
    ${c.bad ? `<div class="mz-note bad"><b>${c.bad}</b> link(s) quebrado(s). Corrija abaixo ou abra o elemento.</div>` : '<div class="mz-note ok">Nenhum link interno quebrado.</div>'}
    ${list.length ? `<table class="mz-lkt"><thead><tr><th></th><th>Onde</th><th>Link</th><th>Situação</th><th></th></tr></thead><tbody>${list.map(({r, i}) => `<tr class="lk-${r.s}"><td><span class="mz-st2 ${r.s}" title="${lab[r.s]}">${({ok: '✓', ext: '↗', warn: '!', bad: '✕'})[r.s]}</span></td><td><b>${esc(r.pageName)}</b><small>${esc(r.el)} · ${esc(r.what)}</small></td><td><code>${esc(r.href || '—')}</code></td><td>${esc(r.msg)}</td><td class="ac"><button class="btn sm" onclick="mzLkGo(${i})">Ver</button>${r.set && (r.s === 'bad' || r.s === 'warn') ? `<select onchange="mzLkFix(${i},this.value)" aria-label="Corrigir para"><option value="">Corrigir para…</option>${m.pages.map(p => `<option value="${esc(mzPagePath(p))}">${esc(p.name)} (${esc(mzPagePath(p))})</option>`).join('')}</select>` : ''}${/^https?:/.test(r.href) ? `<a class="btn sm" href="${esc(r.href)}" target="_blank" rel="noopener noreferrer">Abrir</a>` : ''}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">Nada nesta lista.</p>'}
    <p class="mz-hint">Links externos só têm o endereço conferido (o navegador não deixa testar outro site daqui). Âncoras (#id) e páginas do próprio site são conferidas de verdade.</p>`;
}
function mzLkGo(i) {
  const r = MZ_LK.rows[i]; if (!r) return; mzModalClose();
  if (r.compId) { mzEditComp(r.compId); setTimeout(() => mzSelect(r.nodeId), 400); return; }
  if (mzM().cur !== r.pageId || MZ.comp) { if (MZ.comp) mzExitComp(); mzPageOpen(r.pageId); mzPageSelUpdate(); } setTimeout(() => { mzSelect(r.nodeId); mzScrollToSel(); }, 500);
}
function mzLkFix(i, v) { const r = MZ_LK.rows[i]; if (!r || !r.set || !v) return; r.set(v); mzCommit({panels: true}); toast('Link corrigido para ' + v + '.'); mzModalLinks('check'); }

/* ========================== FONTES ========================== */
const MZ_SYS_FONTS = /^(Arial|Helvetica|Georgia|Times|Courier|Verdana|Tahoma|Trebuchet|Impact|system-ui|sans-serif|serif|monospace|cursive|inherit|initial|ui-)/i;
const mzFam = v => String(v || '').split(',')[0].replace(/&quot;|['"]/g, '').trim();
const mzReEsc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function mzFontsAll(m) { return [...new Set(MZ_FONT_LIST.concat(m.ds.gfonts || [], (m.ds.custom || []).map(c => c.family)))]; }
/* mapa família → {uses, where:Set} com tudo o que o site usa */
function mzFontsUsed(m) {
  m = m || mzM(); const U = new Map(), hit = (f, w) => { f = mzFam(f); if (!f || MZ_SYS_FONTS.test(f)) return; if (!U.has(f)) U.set(f, {family: f, uses: 0, where: new Set()}); const u = U.get(f); u.uses++; u.where.add(w); };
  hit(m.ds.fonts.heading, 'Títulos do Design System'); hit(m.ds.fonts.body, 'Textos do Design System');
  const scan = (root, w) => mzWalk(root, n => { ['d', 't', 'm'].forEach(b => { if (n.style[b] && n.style[b].fontFamily) hit(n.style[b].fontFamily, w); }); const P = n.props || {}, look = s => { String(s || '').replace(/font-family:\s*([^;"]+)/gi, (mm, f) => { hit(f, w); return mm; }); }; look(P.html); (P.items || []).forEach(it => { if (it && typeof it === 'object') { look(it.a); look(it.c); } }); });
  m.pages.forEach(p => scan(p.root, p.name)); m.comps.forEach(c => scan(c.root, 'Componente ' + c.name));
  (m.ds.gfonts || []).forEach(f => { if (!U.has(f)) U.set(f, {family: f, uses: 0, where: new Set()}); }); (m.ds.custom || []).forEach(c => { if (!U.has(c.family)) U.set(c.family, {family: c.family, uses: 0, where: new Set()}); });
  const out = [...U.values()]; out.forEach(u => { u.origin = mzFontOrigin(m, u.family); }); return out;
}
/* custom = enviada · google = instalada por você · auto = da lista do Studio, carrega sozinha do Google · catalog = existe no catálogo, carrega sozinha · missing = não achei */
function mzFontOrigin(m, f) {
  if ((m.ds.custom || []).some(c => c.family === f)) return 'custom'; if ((m.ds.gfonts || []).includes(f)) return 'google'; if (MZ_FONT_LIST.includes(f)) return 'auto';
  if (typeof FONT_META !== 'undefined' && FONT_META[f]) return 'catalog'; return 'missing';
}
const MZ_ORIGIN = {custom: ['Enviada por você', 'ok'], google: ['Google Fonts (instalada)', 'ok'], auto: ['Google Fonts (automática)', 'ok'], catalog: ['Google Fonts (automática)', 'ok'], missing: ['Não encontrada', 'bad']};
const mzFontsMissing = m => mzFontsUsed(m || mzM()).filter(u => u.origin === 'missing' && u.uses > 0);

function mzModalFonts(o) {
  o = o || {}; const m = mzM(), list = mzFontsUsed(m), miss = list.filter(u => u.origin === 'missing' && u.uses > 0), choices = mzFontsAll(m);
  const row = (u, i) => `<div class="mz-fnt ${u.origin}"><div class="nm" style="font-family:'${esc(u.family)}',system-ui,sans-serif">${esc(u.family)}<small>Aa Bb Cc 123</small></div>
      <div class="meta"><span class="mz-tag ${MZ_ORIGIN[u.origin][1]}">${MZ_ORIGIN[u.origin][0]}</span> ${u.uses ? `${u.uses} uso(s) · ${esc([...u.where].slice(0, 3).join(', '))}${u.where.size > 3 ? '…' : ''}` : '<span class="muted">instalada, ainda sem uso</span>'}</div>
      <div class="ac">${u.origin === 'google' || u.origin === 'custom' ? '' : `<button class="btn sm" onclick="mzFontInstall(${JSON.stringify(u.family).replace(/"/g, '&quot;')})" title="Guarda no site e sempre carrega do Google">Instalar do Google</button>`}<button class="btn sm" onclick="mzFontUploadFor(${i})">Enviar arquivo</button><select onchange="mzFontReplace(${i},this.value)" aria-label="Trocar por"><option value="">Trocar por…</option>${choices.filter(c => c !== u.family).map(c => `<option>${esc(c)}</option>`).join('')}<option value="__cat">Escolher no catálogo…</option></select><button class="btn sm" onclick="navigator.clipboard&&navigator.clipboard.writeText(${JSON.stringify(u.family).replace(/"/g, '&quot;')});toast('Nome copiado.')" title="Mostrar/copiar o nome para procurar a fonte">Copiar nome</button>${u.origin === 'custom' ? `<button class="btn sm" onclick="mzFontRemove(${i})">Remover</button>` : u.origin === 'google' && !u.uses ? `<button class="btn sm" onclick="mzFontRemove(${i})">Remover</button>` : ''}</div></div>`;
  MZ_FONTS_LIST = list;
  mzModal('Fontes do site', `${miss.length ? `<div class="mz-note bad"><b>${miss.length} fonte(s) não encontrada(s):</b> ${miss.map(u => esc(u.family)).join(', ')}. ${o.missing ? 'Elas vieram no arquivo que você importou.' : ''} Para cada uma você pode instalar do Google, enviar o arquivo da fonte ou trocar por outra. Enquanto isso, o navegador usa uma fonte comum no lugar.</div>` : '<div class="mz-note ok">Todas as fontes usadas têm origem conhecida.</div>'}
    <h4>Fontes usadas</h4><div class="mz-fnts">${list.map(row).join('') || '<p class="muted">Nenhuma fonte ainda.</p>'}</div>
    <h4>Instalar do Google Fonts</h4><div class="row-gap"><input id="mzGfIn" list="mzGfDl" placeholder="Nome da fonte (ex.: Fraunces)" style="flex:1"><datalist id="mzGfDl">${(typeof FONT_LIST !== 'undefined' ? FONT_LIST : MZ_FONT_LIST).slice(0, 600).map(f => `<option value="${esc(f)}">`).join('')}</datalist><button class="btn dark" onclick="mzFontInstall(document.getElementById('mzGfIn').value)">Instalar</button></div><p class="mz-hint">A fonte passa a carregar do Google em todas as páginas, no HTML e no ZIP. Depois ela aparece nas listas de fontes do Sistema e da barra de texto.</p>
    <h4>Enviar a fonte (arquivo)</h4><div class="mz-fup"><label class="mz-f"><span>Arquivo (.woff2, .woff, .ttf ou .otf)</span><input type="file" id="mzFfFile" accept=".woff2,.woff,.ttf,.otf" onchange="mzFfName()"></label><label class="mz-f"><span>Nome da família</span><input id="mzFfFam" placeholder="ex.: Minha Fonte"></label><label class="mz-f"><span>Peso</span><select id="mzFfW">${[100, 200, 300, 400, 500, 600, 700, 800, 900].map(w => `<option ${w === 400 ? 'selected' : ''}>${w}</option>`).join('')}</select></label><label class="mz-ck"><input type="checkbox" id="mzFfIt"> Itálico</label><button class="btn dark" onclick="mzFontUpload()">Enviar fonte</button></div><p class="mz-hint">O arquivo fica guardado neste navegador e vai junto no HTML (embutido) e no ZIP (pasta assets). Envie só fontes que você tem licença para usar na web.</p><div id="mzFfMsg" class="mz-hint"></div>
    <h4>Fontes do Design System</h4><div class="two"><label class="mz-f"><span>Títulos</span><select onchange="mzDsSet('fonts.heading',this.value);mzModalFonts()">${choices.concat(choices.includes(m.ds.fonts.heading) ? [] : [m.ds.fonts.heading]).map(f => `<option ${f === m.ds.fonts.heading ? 'selected' : ''}>${esc(f)}</option>`).join('')}</select></label><label class="mz-f"><span>Textos</span><select onchange="mzDsSet('fonts.body',this.value);mzModalFonts()">${choices.concat(choices.includes(m.ds.fonts.body) ? [] : [m.ds.fonts.body]).map(f => `<option ${f === m.ds.fonts.body ? 'selected' : ''}>${esc(f)}</option>`).join('')}</select></label></div>`, {wide: true});
}
let MZ_FONTS_LIST = [];
function mzFontInstall(name) {
  const m = mzM(), f = mzFont(name); if (!/^[A-Za-z][\w ]{1,38}$/.test(f)) { toast('Digite o nome da fonte.'); return; } if (m.ds.custom.some(c => c.family === f)) { toast('Já existe uma fonte enviada com este nome.'); return; }
  if (!m.ds.gfonts.includes(f)) { if (m.ds.gfonts.length >= 20) { toast('Limite de 20 fontes instaladas.'); return; } m.ds.gfonts.push(f); } mzCommit({}); toast('“' + f + '” instalada. Se o nome não existir no Google, a fonte não carrega: confira a grafia.'); mzModalFonts();
}
function mzFontRemove(i) {
  const u = MZ_FONTS_LIST[i], m = mzM(); if (!u) return; if (u.uses && !confirm('Esta fonte é usada em ' + u.uses + ' lugar(es). Remover mesmo assim? Eles passam a usar uma fonte comum.')) return;
  m.ds.custom = m.ds.custom.filter(c => c.family !== u.family); m.ds.gfonts = m.ds.gfonts.filter(f => f !== u.family); mzCommit({}); mzModalFonts();
}
/* troca no site inteiro: Design System, estilos de todos os elementos e trechos de texto */
function mzFontReplace(i, to) {
  const u = MZ_FONTS_LIST[i]; if (!u || !to) return;
  if (to === '__cat') { fbOpen(fam => { closeModal(); fam = mzFont(fam); if (fam) { MZ_FONTS_LIST[i] = u; mzFontDo(u.family, fam); } }, u.family); return; } mzFontDo(u.family, to);
}
function mzFontDo(from, to) {
  to = mzFont(to); if (!to || to === from) return; const m = mzM(); let n = 0;
  if (m.ds.fonts.heading === from) { m.ds.fonts.heading = to; n++; } if (m.ds.fonts.body === from) { m.ds.fonts.body = to; n++; }
  const re = new RegExp('(font-family:\\s*[\'"]?)' + mzReEsc(from) + '([\'"]?)', 'gi');
  const fix = s => typeof s === 'string' ? s.replace(re, (mm, a, b) => { n++; return a + to + b; }) : s;
  const walk = root => mzWalk(root, node => { ['d', 't', 'm'].forEach(b => { const st = node.style[b]; if (st && st.fontFamily && mzFam(st.fontFamily) === from) { const rest = String(st.fontFamily).split(',').slice(1).map(x => x.trim()).filter(Boolean); st.fontFamily = [`'${to}'`].concat(rest.length ? rest : ['sans-serif']).join(', '); n++; } });
    const P = node.props || {}; if (P.html) P.html = fix(P.html); (P.items || []).forEach(it => { if (it && typeof it === 'object') { if (it.a) it.a = fix(it.a); if (it.c) it.c = fix(it.c); } }); });
  m.pages.forEach(p => walk(p.root)); m.comps.forEach(c => walk(c.root)); m.ds = mzNormDs(m.ds); mzCommit({panels: true}); toast('“' + from + '” trocada por “' + to + '” (' + n + ' lugar(es)).'); mzModalFonts();
}
/* enviar arquivo de fonte */
function mzFfName() { const f = (document.getElementById('mzFfFile') || {}).files; if (!f || !f[0]) return; const nm = document.getElementById('mzFfFam'); if (nm && !nm.value) nm.value = f[0].name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\b(regular|bold|italic|light|medium|black|thin|semibold|extrabold|variable)\b/gi, '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\s+/g, ' ').trim().slice(0, 40); }
function mzFontUploadFor(i) { const u = MZ_FONTS_LIST[i]; if (!u) return; const fam = document.getElementById('mzFfFam'); if (fam) fam.value = u.family; const f = document.getElementById('mzFfFile'); if (f) { f.scrollIntoView({block: 'center'}); f.click(); } }
async function mzFontUpload() {
  const msg = t => { const e = document.getElementById('mzFfMsg'); if (e) e.textContent = t; }, inp = document.getElementById('mzFfFile'), file = inp && inp.files && inp.files[0], fam = mzFont((document.getElementById('mzFfFam') || {}).value);
  if (!file) { msg('Escolha o arquivo da fonte.'); return; } if (!fam) { msg('Digite o nome da família.'); return; } const fmt = ((/\.(woff2|woff|ttf|otf)$/i.exec(file.name) || [])[1] || '').toLowerCase(); if (!fmt) { msg('Use .woff2, .woff, .ttf ou .otf.'); return; } if (file.size > 4e6) { msg('Arquivo grande demais (máximo 4 MB).'); return; }
  const m = mzM(); if (m.ds.custom.length >= 12) { msg('Limite de 12 fontes enviadas.'); return; }
  try {
    const buf = await file.arrayBuffer(), t = new FontFace('mzt-' + mzId(), buf.slice(0)); await t.load();   // confere que o navegador abre o arquivo
    const mime = ({woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf', otf: 'font/otf'})[fmt], imgId = 'mzf_' + mzId(); await imgPut(imgId, new Blob([buf], {type: mime}));
    const weight = +document.getElementById('mzFfW').value || 400, italic = !!document.getElementById('mzFfIt').checked;
    m.ds.custom = m.ds.custom.filter(c => !(c.family === fam && c.weight === weight && c.italic === italic)).concat([{id: mzId(), family: fam, imgId, weight, italic, fmt}]); m.ds.gfonts = m.ds.gfonts.filter(f => f !== fam);
    try { const ff = new FontFace(fam, buf.slice(0), {weight: String(weight), style: italic ? 'italic' : 'normal'}); await ff.load(); document.fonts.add(ff); } catch (e) { /* só a prévia da janela */ }
    m.ds = mzNormDs(m.ds); await mzLoadImgs(); mzCommit({}); toast('Fonte “' + fam + '” enviada.'); mzModalFonts();
  } catch (e) { msg('Não consegui abrir este arquivo de fonte: ' + (e.message || 'arquivo inválido') + '.'); }
}
/* depois de importar: avisa se faltam fontes */
function mzFontsAfterImport() { const miss = mzFontsMissing(); if (miss.length) { toast(miss.length + ' fonte(s) do arquivo importado não foram encontradas.'); setTimeout(() => mzModalFonts({missing: true}), 300); } }
