/* ===== Estúdio de Sites: Fluxo (como as páginas se ligam) =====
   Guarda DESTINOS, não endereços: 'page:<id>[#form]' = uma página do site, 'thanks' = página de obrigado, 'wa' = WhatsApp da página,
   'url:https://…' = endereço de fora. Se a página mudar de nome ou de arquivo, os links continuam certos.
   Onde entra: menu (site.menu + l.inMenu + site.navMode), botão do cabeçalho (site.headerTo), botão principal de cada página (l.ctaTo)
   e botão de cada seção (bloco.to). A tela mostra o mapa, o menu, o botão principal e o verificador. */
const FX = {open: {}};
const fxSite = () => esSiteOf(curProject());
const fxPages = p => esPageOf(p);
const fxHasForm = l => (l.blocks || []).some(b => b.t === 'form' && b.on);
const fxFormPage = p => fxPages(p).find(l => l.siteRole === 'contato' && fxHasForm(l)) || fxPages(p).find(fxHasForm) || null;
const fxName = l => l.navLabel || l.name;
/* opções de destino para um <select> */
function fxOpts(p, l, cur, o) {
  o = o || {}; const pg = fxPages(p), fp = fxFormPage(p), O = [], sel = v => (cur === v ? ' selected' : '');
  if (o.auto) O.push(`<option value=""${sel('')}>Automático (formulário, compra ou WhatsApp)</option>`);
  O.push('<optgroup label="Páginas do site">');
  pg.forEach(x => { O.push(`<option value="page:${x.id}"${sel('page:' + x.id)}>${esc(fxName(x))}${x.id === l.id ? ' (esta página)' : ''}</option>`); if (fxHasForm(x)) O.push(`<option value="page:${x.id}#form"${sel('page:' + x.id + '#form')}>${esc(fxName(x))} → direto no formulário</option>`); });
  O.push('</optgroup><optgroup label="Outros">');
  if (fp) O.push(`<option value="thanks"${sel('thanks')}>Página de obrigado</option>`);
  if (l.whatsapp) O.push(`<option value="wa"${sel('wa')}>WhatsApp (${esc(l.whatsapp)})</option>`);
  O.push(`<option value="url:https://exemplo.com.br"${/^url:/.test(cur) ? ' selected' : ''}>Endereço de fora (link)…</option></optgroup>`);
  return O.join('');
}
function fxUrlInput(cur, on) { return /^url:/.test(cur) ? `<input class="fx-url" value="${esc(cur.slice(4))}" placeholder="https://…" onchange="${on}(this.value?'url:'+this.value.trim():'')">` : ''; }
function fxDestName(to, p, l) {
  if (!to) return ''; const d = lpDest(to, l, p); if (!d) return 'destino que não existe mais'; if (d.page) return fxName(d.page) + (/#form$/.test(to) ? ' (formulário)' : ''); if (d.thanks) return 'Página de obrigado'; if (to === 'wa') return 'WhatsApp'; if (/^url:/.test(to)) return d.href.replace(/^https?:\/\//, '').slice(0, 40); return d.href;
}
/* destino real de um botão principal (o que a exportação vai gerar) */
function fxCtaOf(p, l, b) { LP_P = p; return lpCta(l, b || {}); }
function fxIssues(p, s) {
  const pg = fxPages(p), out = [], inc = {}; pg.forEach(x => { inc[x.id] = 0; }); LP_P = p;
  const seen = (to, from) => { const m = /^page:([\w-]+)/.exec(to || ''); if (m && inc[m[1]] !== undefined && m[1] !== from.id) inc[m[1]]++; };
  (s.menu || []).forEach(m => seen(m.to, {})); seen(s.headerTo, {});
  const menuOn = s.navMode !== 'cta'; if (menuOn) pg.forEach(x => { if (x.inMenu !== false) inc[x.id]++; });
  pg.forEach(l => { seen(l.ctaTo, l); (l.blocks || []).forEach(b => seen(b.to, l)); });
  const fp = fxFormPage(p);
  pg.forEach(l => {
    const nm = fxName(l), c = fxCtaOf(p, l);
    if (l.ctaTo && !lpDest(l.ctaTo, l, p)) out.push({lvl: 'err', txt: `${nm}: o botão principal aponta para uma página que não existe mais.`, fix: ['Usar automático', `fxCta('${l.id}','')`]});
    (l.blocks || []).filter(b => b.on && b.to && !lpDest(b.to, l, p)).forEach(b => out.push({lvl: 'err', txt: `${nm}: um botão da seção “${(LP_BLOCK[b.t] || {label: b.t}).label}” aponta para uma página que não existe mais.`}));
    const hasBtn = (l.blocks || []).some(b => b.on && LP_BLOCK[b.t] && LP_BLOCK[b.t].fields.some(f => f[0] === 'cta'));
    if (hasBtn && (!c.href || c.href === '#')) out.push({lvl: 'err', txt: `${nm}: o botão principal não leva a lugar nenhum (nem formulário, nem compra, nem WhatsApp).`, fix: fp && fp.id !== l.id ? ['Levar ao formulário de ' + fxName(fp), `fxCta('${l.id}','page:${fp.id}#form')`] : (l.whatsapp ? ['Levar ao WhatsApp', `fxCta('${l.id}','wa')`] : null)});
    if (/exemplo\.com/.test(c.href)) out.push({lvl: 'warn', txt: `${nm}: o botão usa o endereço de exemplo. Troque pelo link real.`});
    if (fxHasForm(l) && (l.thanks || {}).mode === 'none') out.push({lvl: 'warn', txt: `${nm}: o formulário não leva a nenhuma página de obrigado (não dá para medir a conversão).`, fix: ['Usar página de obrigado', `fxThanks('${l.id}','mode','page')`]});
    if (fxHasForm(l) && (l.thanks || {}).mode === 'url' && !(l.thanks || {}).url) out.push({lvl: 'err', txt: `${nm}: obrigado em endereço de fora, mas o endereço está vazio.`});
    if (l.siteRole !== 'home' && lpFile(l) !== 'index.html' && !inc[l.id]) out.push({lvl: 'warn', txt: `${nm}: nenhum menu ou botão leva a esta página (ela fica solta).`, fix: ['Pôr no menu', `fxMenuPage('${l.id}',true)`]});
  });
  if (s.headerCta) { const hd = lpDest(s.headerTo, pg[0] || {}, p); if (s.headerTo && !hd) out.push({lvl: 'err', txt: 'O botão do cabeçalho aponta para um destino que não existe mais.', fix: ['Usar automático', "fxHeader('headerTo','')"]}); }
  if (!pg.some(x => lpFile(x) === 'index.html')) out.push({lvl: 'err', txt: 'Nenhuma página é a inicial (index.html). O site abriria vazio.', fix: pg[0] ? ['Definir “' + fxName(pg[0]) + '” como início', `fxHome('${pg[0].id}')`] : null});
  (s.menu || []).forEach(m => { if (!lpDest(m.to, pg[0] || {}, p)) out.push({lvl: 'err', txt: `Item de menu “${m.label}”: o destino não existe mais.`}); });
  if (!out.length) out.push({lvl: 'ok', txt: 'Tudo ligado: menu, botões e formulários levam a algum lugar que existe.'});
  return out;
}
/* ---------- tela ---------- */
function fxTable(p, s) {
  const pg = fxPages(p);
  return `<div class="fx-map">${pg.map((l, i) => {
    const c = fxCtaOf(p, l), fm = fxHasForm(l), th = l.thanks || {}, to = l.ctaTo || '', menu = l.inMenu !== false;
    const dest = to ? fxDestName(to, p, l) : (c.href === '#form' ? 'o formulário desta página' : c.href === '#' || !c.href ? '— nada —' : c.ext ? (c.href.indexOf('wa.me') > -1 ? 'WhatsApp' : 'compra / link externo') : c.href);
    return `<div class="fx-pg${l.id === ES.page ? ' on' : ''}"><div class="fx-h"><b>${esc(fxName(l))}</b><code>${esc(lpFile(l))}</code>${menu ? '<span class="fx-tag">no menu</span>' : '<span class="fx-tag off">fora do menu</span>'}</div>
      <div class="fx-r"><span>Botão principal →</span><b>${esc(dest)}</b></div>${fm ? `<div class="fx-r"><span>Formulário →</span><b>${th.mode === 'none' ? 'fica na mesma página' : th.mode === 'url' ? esc(th.url || '(endereço vazio)') : 'Página de obrigado'}</b></div>` : ''}</div>`;
  }).join('')}${fxFormPage(p) ? `<div class="fx-pg fx-th${ES.thx ? ' on' : ''}"><div class="fx-h"><b>Obrigado</b><code>obrigado.html</code><span class="fx-tag off">fora do menu</span></div><div class="fx-r"><span>Botão →</span><b>WhatsApp ou Voltar ao início</b></div></div>` : ''}</div>`;
}
function fxHTML(p, s) {
  const pg = fxPages(p), l = esCur(p), iss = fxIssues(p, s), bad = iss.filter(x => x.lvl !== 'ok').length;
  const sec = (k, title, body, def) => `<details class="fx-sec" ${(FX.open[k] === undefined ? def : FX.open[k]) ? 'open' : ''} ontoggle="FX.open['${k}']=this.open"><summary>${title}</summary><div class="fx-b">${body}</div></details>`;
  const verify = `<ul class="fx-iss">${iss.map(x => `<li class="${x.lvl}"><span>${x.lvl === 'ok' ? '✓' : x.lvl === 'err' ? '✕' : '!'}</span><div>${esc(x.txt)}${x.fix ? ` <button class="btn sm" onclick="${x.fix[1]}">${esc(x.fix[0])}</button>` : ''}</div></li>`).join('')}</ul>`;
  const preset = `<div class="fx-pre"><button class="btn sm pri" onclick="fxAuto()" title="Liga menu, botões e formulário sozinho, do jeito mais comum">Ligar tudo automaticamente</button><button class="btn sm" onclick="fxPreset('lp')">Modelo: landing page + obrigado</button><button class="btn sm" onclick="fxPreset('inst')">Modelo: site institucional</button></div>`;
  const pagesBody = `<table class="fx-t"><tbody>${pg.map((x, i) => `<tr><td class="fx-mv"><button class="es-mini" ${i ? '' : 'disabled'} onclick="fxMove('${x.id}',-1)" aria-label="Subir">↑</button><button class="es-mini" ${i < pg.length - 1 ? '' : 'disabled'} onclick="fxMove('${x.id}',1)" aria-label="Descer">↓</button></td>
      <td><input value="${esc(x.navLabel || x.name)}" onchange="fxPageSet('${x.id}','navLabel',this.value)" title="Nome no menu"><small>${esc(lpFile(x))} · <a href="#" onclick="event.preventDefault();fxHome('${x.id}')">${lpFile(x) === 'index.html' ? 'é o início' : 'tornar início'}</a></small></td>
      <td><label class="fx-ck"><input type="checkbox" ${x.inMenu !== false ? 'checked' : ''} onchange="fxMenuPage('${x.id}',this.checked)"> menu</label></td><td><button class="es-mini" onclick="fxDelPage('${x.id}')" aria-label="Remover página">×</button></td></tr>`).join('')}</tbody></table>
    <div class="fx-add"><select id="fxNew"><option value="home">Início (StoryBrand)</option><option value="oferta" selected>Serviços / produtos</option><option value="sobre">Sobre</option><option value="contato">Contato</option></select><input id="fxNewN" placeholder="Nome no menu"><button class="btn sm" onclick="fxAddPage()">+ Página</button></div>`;
  const menuBody = `<label class="es-f">Como fica o menu do cabeçalho<select onchange="fxHeader('navMode',this.value)"><option value="full" ${s.navMode !== 'cta' ? 'selected' : ''}>Todas as páginas marcadas “menu” (site com várias páginas)</option><option value="cta" ${s.navMode === 'cta' ? 'selected' : ''}>Sem menu, só o botão (landing page)</option></select></label>
    <label class="es-f">Texto do botão do cabeçalho<input value="${esc(s.headerCta || '')}" onchange="fxHeader('headerCta',this.value)" placeholder="Ex.: Fale com a gente (vazio = sem botão)"></label>
    ${s.headerCta ? `<label class="es-f">O botão do cabeçalho leva a<select onchange="fxHeaderTo(this.value)">${fxOpts(p, l || pg[0] || {}, s.headerTo || '', {auto: 1})}</select>${fxUrlInput(s.headerTo || '', 'fxHeaderTo')}</label>` : ''}
    <div class="es-f">Itens extras no menu <small>link de fora ou outra página</small>${(s.menu || []).map(m => `<div class="fx-mi"><input value="${esc(m.label)}" onchange="fxMenuSet('${m.id}','label',this.value)"><select onchange="fxMenuTo('${m.id}',this.value)">${fxOpts(p, l || {}, m.to)}</select><button class="es-mini" onclick="fxMenuDel('${m.id}')" aria-label="Remover">×</button></div>${fxUrlInput(m.to, "fxMenuTo.bind(null,'" + m.id + "')")}`).join('')}<button class="btn sm" onclick="fxMenuAdd()">+ Item</button></div>
    <small class="es-note">O rodapé repete o mesmo menu.</small>`;
  const ctaBody = l ? `<label class="es-f">Em “${esc(fxName(l))}”, os botões das seções levam a<select onchange="fxCta('${l.id}',this.value)">${fxOpts(p, l, l.ctaTo || '', {auto: 1})}</select>${fxUrlInput(l.ctaTo || '', "fxCta.bind(null,'" + l.id + "')")}</label>
    <small class="es-note">Hoje: <b>${esc((() => { const c = fxCtaOf(p, l); return l.ctaTo ? fxDestName(l.ctaTo, p, l) : c.href === '#form' ? 'o formulário desta página' : (!c.href || c.href === '#') ? 'nada (sem destino)' : c.href.slice(0, 50); })())}</b>. Para mudar só um botão, clique na seção e use “Para onde o botão leva”.</small>` : '';
  const th = fxFormPage(p), tl = th && th.thanks || {};
  const thxBody = th ? `<label class="es-f">Depois de enviar o formulário<select onchange="fxThanks('${th.id}','mode',this.value)"><option value="page" ${tl.mode !== 'url' && tl.mode !== 'none' ? 'selected' : ''}>Abrir a página de obrigado</option><option value="url" ${tl.mode === 'url' ? 'selected' : ''}>Ir para um endereço de fora</option><option value="none" ${tl.mode === 'none' ? 'selected' : ''}>Só mostrar um aviso na página</option></select></label>
    ${tl.mode === 'url' ? `<label class="es-f">Endereço<input value="${esc(tl.url || '')}" onchange="fxThanks('${th.id}','url',this.value)" placeholder="https://…"></label>` : ''}
    ${tl.mode !== 'url' && tl.mode !== 'none' ? `<label class="es-f">Título do obrigado<input value="${esc(tl.title || '')}" onchange="fxThanks('${th.id}','title',this.value)" placeholder="Recebemos os seus dados"></label><label class="es-f">Mensagem<textarea rows="3" onchange="fxThanks('${th.id}','text',this.value)" placeholder="Obrigado! Nossa equipe vai entrar em contato…">${esc(tl.text || '')}</textarea></label><button class="btn sm" onclick="esThx()">Ver a página de obrigado</button>` : ''}` : '<p class="es-note">Nenhuma página tem formulário. Adicione a seção “Formulário” em uma página para ter a página de obrigado.</p>';
  return `<div class="fx"><p class="es-note">Aqui você liga as páginas: o menu, para onde cada botão vai e o que acontece depois do formulário. Os links são guardados por página, não por endereço, então continuam certos se você trocar nomes ou ordem.</p>${preset}
    ${sec('v', 'Verificador ' + (bad ? `<span class="fx-n">${bad}</span>` : '<span class="fx-ok">ok</span>'), verify, true)}
    ${sec('m', 'Mapa do site', fxTable(p, s), true)}
    ${sec('p', 'Páginas e ordem do menu', pagesBody, false)}
    ${sec('n', 'Menu e botão do cabeçalho', menuBody, false)}
    ${sec('c', 'Botão principal da página', ctaBody, false)}
    ${sec('t', 'Depois do formulário (obrigado)', thxBody, false)}</div>`;
}
/* ---------- ações ---------- */
function fxDone(preview) { persist(); const p = curProject(); if (ES.tabA === 'fluxo') { const b = document.querySelector('#psRight .ps-pb'); if (b) { const sc = b.scrollTop; esRight(); const nb = document.querySelector('#psRight .ps-pb'); if (nb) nb.scrollTop = sc; } } if (preview !== false) esPreview(); }
function fxPageSet(id, k, v) { const l = curProject().landings.find(x => x.id === id); if (!l) return; l[k] = String(v).trim().slice(0, 40) || l[k]; fxDone(); }
function fxMenuPage(id, on) { const l = curProject().landings.find(x => x.id === id); if (l) l.inMenu = !!on; fxDone(); }
function fxMove(id, d) { const p = curProject(), a = p.landings, i = a.findIndex(l => l.id === id), s = a[i].siteId; let j = i + d; while (j >= 0 && j < a.length && a[j].siteId !== s) j += d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; fxDone(); }
function fxHome(id) {
  const p = curProject(), pg = fxPages(p), l = pg.find(x => x.id === id), cur = pg.find(x => lpFile(x) === 'index.html' && x.id !== id); if (!l) return;
  if (cur) { let b = slug(fxName(cur)) || 'pagina'; if (b === 'index') b = 'inicio'; const used = pg.map(x => x.slug); let sl = b.slice(0, 40); for (let i = 2; used.includes(sl); i++) sl = (b + '-' + i).slice(0, 40); cur.slug = sl; }
  l.slug = 'index'; fxDone();
}
function fxDelPage(id) { const p = curProject(), l = p.landings.find(x => x.id === id); if (!l || fxPages(p).length < 2) { toast('O site precisa de pelo menos uma página.'); return; } if (!confirm('Remover a página “' + fxName(l) + '”? Os botões que levavam a ela voltam ao automático.')) return; p.landings = p.landings.filter(x => x.id !== id); fxClean(p, fxSite()); ES.page = ''; persist(); renderDev(); }
function fxMakePage(role, nm) {
  const p = curProject(), s = fxSite(), tpl = Object.values(SITE_TPL).flatMap(t => t.pages).find(x => x.role === role) || Object.values(SITE_TPL)[0].pages[0], base = slug(nm) || 'pagina', ex = fxPages(p).map(l => l.slug); let sl = base; for (let i = 2; ex.includes(sl); i++) sl = base + '-' + i;
  const l = normalizeLandings([{id: uid('lp'), name: s.name + ' — ' + nm, siteId: s.id, slug: sl.slice(0, 40), navLabel: nm, type: 'generico', productId: s.productId, theme: (fxPages(p)[0] || {}).theme || lpTheme(p), blocks: tpl.blocks.map(lpBlockNew)}])[0]; l.siteRole = role;
  if (typeof sbBlocksFor === 'function' && typeof lpMerge === 'function') { try { const f = sbFacts(p), bs = sbBS(f), bl = sbBlocksFor(l, f, bs, role); if (bl) lpMerge(l, bl); } catch (e) { /* segue com os textos-base */ } }
  if (role === 'contato' && !l.blocks.some(b => b.t === 'form')) l.blocks.push(lpBlockNew('form'));
  p.landings.push(l); return l;
}
function fxAddPage() { const role = $('fxNew').value, nm = ($('fxNewN').value || '').trim() || { home: 'Início', oferta: 'Serviços', sobre: 'Sobre', contato: 'Contato' }[role], l = fxMakePage(role, nm); ES.page = l.id; persist(); renderDev(); toast('Página criada: ' + nm); }
function fxHeader(k, v) { const s = fxSite(); s[k] = k === 'navMode' ? (v === 'cta' ? 'cta' : 'full') : String(v).trim().slice(0, 40); fxDone(); }
function fxHeaderTo(v) { const s = fxSite(); s.headerTo = LK_TO(v); fxDone(); }
function fxMenuAdd() { const s = fxSite(), p = curProject(); s.menu = (s.menu || []).concat([{id: uid('mn'), label: 'Novo item', to: (fxPages(p)[0] ? 'page:' + fxPages(p)[0].id : 'url:https://exemplo.com.br')}]).slice(0, 12); fxDone(); }
function fxMenuSet(id, k, v) { const m = (fxSite().menu || []).find(x => x.id === id); if (m) m[k] = String(v).trim().slice(0, 40) || m[k]; fxDone(); }
function fxMenuTo(id, v) { const m = (fxSite().menu || []).find(x => x.id === id); if (m) m.to = LK_TO(v) || m.to; fxDone(); }
function fxMenuDel(id) { const s = fxSite(); s.menu = (s.menu || []).filter(x => x.id !== id); fxDone(); }
function fxCta(lid, v) { const l = curProject().landings.find(x => x.id === lid); if (l) l.ctaTo = LK_TO(v); fxDone(); }
function fxBlockTo(v) { const [l, b] = esBlk(); if (b) { b.to = LK_TO(v); } persist(); esPreview(); esBlockEditor(); }
function fxThanks(lid, k, v) { const l = curProject().landings.find(x => x.id === lid); if (!l) return; l.thanks = Object.assign({mode: 'page', url: '', title: '', text: ''}, l.thanks); l.thanks[k] = k === 'mode' ? (['page', 'url', 'none'].includes(v) ? v : 'page') : String(v).trim().slice(0, k === 'text' ? 400 : 200); fxDone(ES.thx); if (ES.thx) esPreview(); }
function esThx() { if (!fxFormPage(curProject())) { toast('Nenhuma página tem formulário.'); return; } ES.thx = true; ES.tabA = 'fluxo'; ES.sel = ''; renderDev(); }
/* um clique: menu com as páginas, botões levando ao formulário e o formulário levando ao obrigado */
function fxClean(p, s) { const pg = fxPages(p); pg.forEach(l => { if (l.ctaTo && !lpDest(l.ctaTo, l, p)) l.ctaTo = ''; (l.blocks || []).forEach(b => { if (b.to && !lpDest(b.to, l, p)) b.to = ''; }); }); if (s.headerTo && !lpDest(s.headerTo, pg[0] || {}, p)) s.headerTo = ''; s.menu = (s.menu || []).filter(m => lpDest(m.to, pg[0] || {}, p)); }
function fxAuto(quiet) {
  const p = curProject(), s = fxSite(), pg = fxPages(p); if (!s || !pg.length) return; fxClean(p, s); const fp = fxFormPage(p), log = [];
  if (!pg.some(x => lpFile(x) === 'index.html')) { fxHome(pg[0].id); log.push('Início definido'); }
  pg.forEach(l => { if (l.inMenu === false && !/obrigado/i.test(l.slug)) { l.inMenu = true; } });
  s.navMode = pg.length < 2 ? 'cta' : 'full'; log.push(pg.length < 2 ? 'sem menu (uma página)' : 'menu com ' + pg.length + ' páginas');
  pg.forEach(l => { const hb = (l.blocks || []).find(b => b.t === 'hero'), waLabel = hb && /whats/i.test(hb.cta || ''); if (!l.ctaTo && !fxHasForm(l) && !(l.product && l.product.checkout)) { if (waLabel && l.whatsapp) { l.ctaTo = 'wa'; log.push(fxName(l) + ' → WhatsApp'); } else if (fp && fp.id !== l.id) { l.ctaTo = 'page:' + fp.id + '#form'; log.push(fxName(l) + ' → formulário'); } else if (l.whatsapp) { l.ctaTo = 'wa'; log.push(fxName(l) + ' → WhatsApp'); } } });
  if (s.headerCta && !s.headerTo && fp) { s.headerTo = fp.id === pg[0].id ? 'page:' + fp.id + '#form' : 'page:' + fp.id + '#form'; }
  pg.filter(fxHasForm).forEach(l => { l.thanks = Object.assign({mode: 'page', url: '', title: '', text: ''}, l.thanks); if (l.thanks.mode === 'none') l.thanks.mode = 'page'; });
  persist(); if (!quiet) { toast('Fluxo ligado: ' + log.join(' · ')); } renderDev();
}
function fxPreset(kind) {
  const p = curProject(), s = fxSite(), pg = fxPages(p); if (!s) return;
  if (kind === 'lp') {
    if (pg.length > 1 && !confirm('Este modelo é para página única: as outras ' + (pg.length - 1) + ' página(s) saem do menu. Continuar?')) return; pg.slice(1).forEach(x => { x.inMenu = false; });
    const l = pg[0]; if (!fxHasForm(l)) { const f = (l.blocks || []).find(b => b.t === 'form'); if (f) f.on = true; else l.blocks.push(lpBlockNew('form')); }
    s.navMode = 'cta'; l.thanks = Object.assign({}, l.thanks, {mode: 'page'}); if (!s.headerCta) s.headerCta = 'Quero começar'; s.headerTo = 'page:' + l.id + '#form'; l.ctaTo = ''; persist(); toast('Landing page: sem menu, botões levam ao formulário, e o formulário leva à página de obrigado.'); renderDev(); return;
  }
  [['home', 'Início'], ['oferta', 'Serviços'], ['sobre', 'Sobre'], ['contato', 'Contato']].forEach(([role, nm]) => { if (!pg.some(x => x.siteRole === role || (role === 'home' && lpFile(x) === 'index.html'))) fxMakePage(role, nm); });
  s.navMode = 'full'; if (!s.headerCta) s.headerCta = 'Fale com a gente'; s.headerTo = ''; fxAuto(true); toast('Site institucional: Início, Serviços, Sobre e Contato ligados pelo menu; os botões levam ao formulário do Contato.');
}
