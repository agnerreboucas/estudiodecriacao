/* ===== Mesa: ligação entre páginas =====
   Um link interno é guardado como 'page:<id>' (e '#secao' opcional). Ao exportar vira o arquivo da página (index.html, sobre.html…) ou /slug/ no Elementor.
   Se a página mudar de nome ou de endereço, o link continua certo. Aqui: seletor de destino, texto amigável '@slug', menu com todas as páginas e o verificador. */
const mzPageLabel = pg => (pg.home ? 'Início' : pg.name);
function mzLinkShow(h) { const m = /^page:([\w-]+)(#[\w-]*)?$/.exec(h || ''); if (!m) return h || '#'; const pg = mzM().pages.find(x => x.id === m[1]); return pg ? '@' + (pg.home ? 'inicio' : mzSlug(pg.slug || pg.name)) + (m[2] || '') : '#'; }
function mzLinkParse(t) {
  t = String(t || '').trim(); if (!t) return '#'; const m = /^@([\w-]+)(#[\w-]*)?$/.exec(t); if (!m) return t;
  const pg = mzM().pages.find(x => (x.home && m[1] === 'inicio') || mzSlug(x.slug || x.name) === m[1]); return pg ? 'page:' + pg.id + (m[2] || '') : '#';
}
const mzPairsParse = txt => txt.split('\n').map(l => { const p = l.split('|'); return {label: (p[0] || '').trim(), href: mzLinkParse(p.slice(1).join('|') || '#')}; }).filter(x => x.label);
function mzLinkField(label, v, k) {
  const m = mzM(), cur = /^page:([\w-]+)(#[\w-]*)?$/.exec(v || ''), pid = cur ? cur[1] : '', anc = cur && cur[2] || '';
  const opts = ['<option value="">Sem link</option>', '<option value="*" ' + (v && !cur ? 'selected' : '') + '>Endereço próprio…</option>'].concat(m.pages.map(pg => `<option value="${pg.id}" ${pg.id === pid ? 'selected' : ''}>Página: ${esc(mzPageLabel(pg))}</option>`)).join('');
  return `<div class="mz-f"><span>${label}</span><select onchange="mzLinkPick('${k}',this.value)">${opts}</select>${cur ? `<input value="${esc(anc)}" placeholder="#secao (opcional)" onchange="mzSetProp('${k}','page:${pid}'+(this.value&&this.value[0]!=='#'?'#':'')+this.value.trim())">` : (v ? '' : '') }${!cur && v ? `<input value="${esc(v)}" onchange="mzSetProp('${k}',mzLinkParse(this.value),{panels:true})" placeholder="https://… ou #secao ou @pagina">` : ''}</div>`;
}
function mzLinkPick(k, val) { if (val === '') mzSetProp(k, '', {panels: true}); else if (val === '*') mzSetProp(k, 'https://', {panels: true}); else mzSetProp(k, 'page:' + val, {panels: true}); }
function mzMenuFromPages() {
  const m = mzM(), n = mzSelNode(); if (!n || n.type !== 'menu') return; const pgs = m.pages.filter(p => !p.priv && p.kind !== 'campaign' && !/^Site · Obrigado/i.test(p.name)).sort((a, b) => (b.home ? 1 : 0) - (a.home ? 1 : 0));
  mzSetProp('items', pgs.map(p => ({label: mzPageLabel(p).replace(/^Site · /, ''), href: 'page:' + p.id})), {panels: true});
}
/* todos os links da Mesa: quem aponta para onde, quebrados e páginas soltas */
function mzLinkScan() {
  const m = mzM(), out = {links: [], bad: [], incoming: {}}; m.pages.forEach(p => { out.incoming[p.id] = 0; });
  m.pages.forEach(pg => mzWalk(pg.root, n => {
    const L = []; if (n.props) { if (n.props.href !== undefined && ['button', 'link', 'image', 'logo'].includes(n.type)) L.push([n.props.href, n.props.text || n.type]); if (n.type === 'menu') (n.props.items || []).forEach(i => L.push([i.href, i.label])); }
    if (n.props && typeof n.props.html === 'string') [...n.props.html.matchAll(/<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].forEach(x => L.push([x[1].replace(/&amp;/g, '&'), x[2]]));
    L.forEach(([h, t]) => {
      const mm = /^page:([\w-]+)/.exec(h || ''); const rec = {page: pg, node: n.id, text: String(t || '').replace(/<[^>]+>/g, '').slice(0, 40), href: h || ''};
      if (mm) { const to = m.pages.find(x => x.id === mm[1]); if (to) { rec.to = to; if (to.id !== pg.id) out.incoming[to.id]++; } else out.bad.push(Object.assign({why: 'a página de destino foi excluída'}, rec)); }
      else if (!h || h === '#') out.bad.push(Object.assign({why: 'sem destino'}, rec));
      else if (/^https:\/\/$/.test(h)) out.bad.push(Object.assign({why: 'endereço incompleto'}, rec));
      out.links.push(rec);
    });
  }));
  return out;
}
function mzModalLinks() {
  const m = mzM(), s = mzLinkScan(), orphan = m.pages.filter(p => !p.home && !p.priv && !s.incoming[p.id]);
  const body = `<p class="mz-hint">Os botões, imagens e menus da Mesa podem apontar para outra página do mesmo projeto. Assim, ao exportar, cada link vira o arquivo certo.</p>
    <h4>Mapa</h4><div class="mz-lmap">${m.pages.map(p => { const to = s.links.filter(l => l.page.id === p.id && l.to && l.to.id !== p.id); const names = [...new Set(to.map(l => mzPageLabel(l.to)))]; return `<div class="mz-lrow"><b>${esc(mzPageLabel(p))}</b><span>${names.length ? '→ ' + names.map(esc).join(', ') : '<em>não leva a nenhuma página</em>'}</span><small>${s.incoming[p.id]} link(s) chegam aqui</small></div>`; }).join('')}</div>
    <h4>Problemas ${s.bad.length + orphan.length ? '(' + (s.bad.length + orphan.length) + ')' : ''}</h4>
    ${s.bad.length + orphan.length ? `<ul class="mz-lbad">${s.bad.map(b => `<li><b>${esc(mzPageLabel(b.page))}</b> · “${esc(b.text)}”: ${esc(b.why)} <button class="btn sm" onclick="mzPageOpen('${b.page.id}');mzModalClose();mzSelect('${b.node}')">Ir até lá</button></li>`).join('')}${orphan.map(p => `<li><b>${esc(mzPageLabel(p))}</b>: nenhum menu ou botão leva a esta página. <button class="btn sm" onclick="mzMenuAddPage('${p.id}')">Pôr no menu do início</button></li>`).join('')}</ul>` : '<p>Tudo ligado: nenhum link quebrado e nenhuma página solta.</p>'}
    <div class="mz-sec"><button class="btn sm dark" onclick="mzMenusUpdate()">Atualizar todos os menus com as páginas</button> <small class="mz-hint">Reescreve os menus de todas as páginas com a lista atual de páginas (início primeiro).</small></div>`;
  mzModal('Links entre páginas', body, {wide: true});
}
function mzMenusUpdate() {
  const m = mzM(); let n = 0; const pgs = m.pages.filter(p => !p.priv && p.kind !== 'campaign' && !/obrigado/i.test(p.name) && !/obrigado/i.test(p.slug || '')).sort((a, b) => (b.home ? 1 : 0) - (a.home ? 1 : 0));
  m.pages.forEach(pg => mzWalk(pg.root, nd => { if (nd.type === 'menu' && !nd.locked) { nd.props.items = pgs.map(p => ({label: mzPageLabel(p).replace(/^Site · /, ''), href: 'page:' + p.id})); n++; } }));
  mzSnap(); mzTouch(); mzRender(); mzRefreshPanels(); mzModal('Links entre páginas', `<p>${n} menu(s) atualizado(s) com ${pgs.length} página(s).</p><button class="btn sm dark" onclick="mzModalLinks()">Ver o mapa</button>`);
}
function mzMenuAddPage(id) {
  const m = mzM(), home = m.pages.find(p => p.home), pg = m.pages.find(p => p.id === id); if (!home || !pg) return; let n = 0;
  mzWalk(home.root, nd => { if (nd.type === 'menu') { nd.props.items = (nd.props.items || []).concat([{label: mzPageLabel(pg).replace(/^Site · /, ''), href: 'page:' + pg.id}]); n++; } });
  if (!n) { mzModal('Links entre páginas', '<p>A página inicial não tem um elemento de menu. Adicione um “Menu” (aba Elementos) e use “Montar o menu com as páginas”.</p>'); return; } mzSnap(); mzTouch(); mzRender(); mzModalLinks();
}
