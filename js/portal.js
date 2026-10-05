/* ===== Portal do cliente (lado do Studio): escolher o que o cliente vê, publicar, ler as respostas =====
   O cliente abre cliente.html?t=CÓDIGO (ou, no WordPress, a área de membros) e vê as peças, o cronograma e os resultados, e aprova ou pede ajustes.
   O Studio publica um "retrato" do projeto (api/portal.php): só o que está marcado aqui. Nome e telefone dos leads nunca vão; só números. */
const ptUI = {busy: false, msg: '', dec: [], pick: {}};
const ptNid = () => 'i' + Math.random().toString(36).slice(2, 10);
const ptOf = p => p.portal;
const ptLink = t => new URL('cliente.html?t=' + t, location.href).href;
const ptKind = {cmp: 'Anúncio (3 medidas)', set: 'Arte', page: 'Página', script: 'Roteiro de vídeo', stories: 'Plano de Stories'};

function ptCands(p) {
  const out = [], inCmp = new Set(); const has = k => ptOf(p).items.some(i => i.src.t + ':' + i.src.id === k);
  (p.campaigns || []).forEach(c => (c.pieces || []).forEach(q => { Object.values(q.sets || {}).forEach(id => id && inCmp.add(id)); out.push({src: {t: 'cmp', id: q.id, cid: c.id}, title: `${c.name} · ${q.name}`, kind: 'set', channel: 'Anúncio'}); }));
  (p.design.sets || []).forEach(s => { if (!inCmp.has(s.id)) out.push({src: {t: 'set', id: s.id}, title: s.name, kind: 'set', channel: ''}); });
  (p.landings || []).forEach(l => out.push({src: {t: 'page', id: l.id}, title: l.name || l.navLabel || 'Página', kind: 'page', channel: 'Site'}));
  ((p.video || {}).scripts || []).forEach(r => out.push({src: {t: 'script', id: r.id}, title: 'Roteiro: ' + (r.src && r.src.title || 'vídeo'), kind: 'text', channel: 'Vídeo'}));
  (p.stories || []).forEach(s => out.push({src: {t: 'stories', id: s.id}, title: 'Stories: ' + s.name, kind: 'text', channel: 'Stories'}));
  return out.filter(c => !has(c.src.t + ':' + c.src.id));
}
async function ptDataUrl(set, slide) {
  await ensureSetResources(set); const c = document.createElement('canvas'); c.width = set.format.w; c.height = set.format.h; renderSlide(c.getContext('2d'), slide, c.width, c.height);
  const m = Math.min(1, 1080 / Math.max(c.width, c.height)), o = document.createElement('canvas'); o.width = Math.round(c.width * m); o.height = Math.round(c.height * m); o.getContext('2d').drawImage(c, 0, 0, o.width, o.height);
  for (const q of [0.82, 0.65, 0.5]) { let u = o.toDataURL('image/webp', q); if (!u.startsWith('data:image/webp')) u = o.toDataURL('image/jpeg', q); if (u.length * 0.75 < 690000) return u; }
  return null;
}
function ptSay(m) { ptUI.msg = m; renderPortal(); }
async function ptCreate() {
  const p = curProject(); if (!API.available) { toast('O portal precisa do servidor (API). Ele funciona no WordPress ou na hospedagem com PHP.'); return; }
  try { const r = await api('portal.php', {method: 'POST', body: {action: 'create', project: p.id, name: p.name}}); ptOf(p).t = r.t; persist(); ptSay('Portal criado. Escolha o que o cliente vai ver e publique.'); } catch (e) { toast(e.message); }
}
function ptField(k, v) { ptOf(curProject())[k] = k === 'requireLogin' ? !!v : String(v).slice(0, 400); persist(); }
function ptSet(id, k, v) { const it = ptOf(curProject()).items.find(x => x.id === id); if (!it) return; it[k] = String(v).slice(0, k === 'note' ? 800 : 140); persist(); }
function ptRm(id) { const pt = ptOf(curProject()); pt.items = pt.items.filter(x => x.id !== id); persist(); renderPortal(); }
function ptAddModal() {
  const p = curProject(), cs = ptCands(p); ptUI.pick = {};
  showModal('Adicionar peças para o cliente ver', cs.length ? `<p class="muted" style="margin-top:0">Marque o que o cliente pode ver. Entram como <b>Em aprovação</b>; você muda o status depois.</p><div class="list" style="max-height:52vh;overflow:auto">${cs.map((c, i) => `<label class="list-item" style="cursor:pointer"><span style="display:flex;gap:10px;align-items:center"><input type="checkbox" onchange="ptUI.pick[${i}]=this.checked"><span><strong>${esc(c.title)}</strong><small>${esc(ptKind[c.src.t])}</small></span></span></label>`).join('')}</div><div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="ptAdd()">Adicionar</button></div>` : '<p>Não há mais peças para adicionar. Crie anúncios na Campanha, artes no Estúdio, páginas, roteiros ou Stories.</p>');
  ptUI.cands = cs;
}
function ptAdd() {
  const p = curProject(), pt = ptOf(p); let n = 0;
  (ptUI.cands || []).forEach((c, i) => { if (ptUI.pick[i] && pt.items.length < 200) { pt.items.push({id: ptNid(), src: c.src, title: c.title.slice(0, 140), kind: c.kind, status: 'Em aprovação', due: '', channel: c.channel, note: ''}); n++; } });
  persist(); closeModal(); ptSay(n ? `${n} peça(s) adicionada(s). Publique para o cliente ver.` : 'Nada marcado.');
}
async function ptBuild(p) {
  const pt = ptOf(p), images = {}, pages = {}, items = [], warn = [];
  for (const it of pt.items) {
    const rec = {id: it.id, title: it.title, kind: it.kind, status: it.status, due: it.due, channel: it.channel, note: it.note, imgs: [], page: '', copy: {}, updated: new Date().toISOString()};
    try {
      const s = it.src;
      if (s.t === 'cmp') { const c = (p.campaigns || []).find(x => x.id === s.cid), q = c && c.pieces.find(x => x.id === s.id); if (!q) { warn.push(it.title + ' (peça não existe mais)'); continue; }
        for (const k of CMP_MEASURES) { const set = q.on[k] && cmpSetOf(p, q.sets[k]); if (!set) continue; const u = await ptDataUrl(set, set.slides[0]); if (u) { images[it.id + '_' + k] = u; rec.imgs.push(it.id + '_' + k); } }
        rec.copy = {title: q.h || '', text: q.s || '', caption: q.btn || ''}; }
      else if (s.t === 'set') { const set = p.design.sets.find(x => x.id === s.id); if (!set) { warn.push(it.title + ' (arte não existe mais)'); continue; }
        for (let i = 0; i < Math.min(10, set.slides.length); i++) { const u = await ptDataUrl(set, set.slides[i]); if (u) { images[it.id + '_' + i] = u; rec.imgs.push(it.id + '_' + i); } } }
      else if (s.t === 'page') { const l = p.landings.find(x => x.id === s.id); if (!l) continue; const html = await lpHTML(l, p); if (html.length > 3.4e6) { warn.push(it.title + ' (página grande demais para o portal)'); } else { pages[it.id] = html; rec.page = it.id; } }
      else if (s.t === 'script') { const r = vsOf(p, s.id); if (!r) continue; rec.copy = {title: r.src.title, text: String(r.t.ficha || '').slice(0, 2400), caption: String(r.t.literario || '').slice(0, 2400)}; }
      else if (s.t === 'stories') { const pl = stPlan(p, s.id); if (!pl) continue; rec.copy = {title: pl.name, text: stDocText(p, pl).slice(0, 2400)}; }
    } catch (e) { warn.push(it.title + ': ' + e.message); }
    items.push(rec);
  }
  return {images, pages, items, warn};
}
async function ptPublish(notify) {
  const p = curProject(), pt = ptOf(p); if (!pt.t || ptUI.busy) return; if (!pt.items.length) { toast('Adicione ao menos uma peça.'); return; }
  ptUI.busy = true; ptSay('Preparando as imagens…');
  try {
    const b = await ptBuild(p), ids = Object.keys(b.images);
    for (let i = 0; i < ids.length; i += 6) { const part = {}; ids.slice(i, i + 6).forEach(k => part[k] = b.images[k]); await api('portal.php', {method: 'POST', body: {action: 'upload', t: pt.t, images: part}}); }
    for (const k of Object.keys(b.pages)) await api('portal.php', {method: 'POST', body: {action: 'upload', t: pt.t, pages: {[k]: b.pages[k]}}});
    const wait = b.items.filter(i => i.status === 'Em aprovação').length; pt.news.unshift({at: new Date().toISOString(), text: `Atualização: ${b.items.length} peça(s), ${wait} aguardando a sua aprovação.`, item: ''}); pt.news = pt.news.slice(0, 40);
    const pal = String((p.brand || {}).palette || '').match(/#[0-9a-f]{6}/i);
    const r = await api('portal.php', {method: 'POST', body: {action: 'publish', t: pt.t, notify: !!notify, clientEmails: pt.clientEmails, notifyEmails: pt.notifyEmails, requireLogin: pt.requireLogin,
      snapshot: {name: p.name, client: '', brand: {accent: pal ? pal[0] : '#111111'}, items: b.items, news: pt.news, campaigns: (p.campaigns || []).map(c => ({name: c.name, channel: c.channel || '', status: c.status || '', objective: c.objective || ''})), metrics: {}}}});
    pt.publishedAt = new Date().toISOString(); persist(); ptUI.busy = false;
    ptSay(`Publicado: ${r.items} peça(s), ${r.awaiting} aguardando aprovação.${notify ? ' E-mail ao cliente: ' + r.mail + '.' : ''}${b.warn.length ? ' Atenção: ' + b.warn.join('; ') : ''}`);
  } catch (e) { ptUI.busy = false; ptSay('Não consegui publicar: ' + e.message); }
}
async function ptSync() {
  const p = curProject(), pt = ptOf(p); if (!pt.t) return;
  try {
    const r = await api('portal.php', {method: 'POST', body: {action: 'decisions', t: pt.t}}); ptUI.dec = (r.decisions || []).slice().reverse(); let n = 0;
    const last = {}; (r.decisions || []).forEach(d => { last[d.item] = d; });
    pt.items.forEach(it => { const d = last[it.id]; if (!d || (it.seenAt && it.seenAt >= d.at)) return; if (d.decision === 'approve' && it.status === 'Em aprovação') { it.status = 'Aprovado'; n++; } else if (d.decision === 'changes') { it.status = 'Ajustes'; it.note = (d.comment || '').slice(0, 800); n++; } });
    pt.items.forEach(it => { if (last[it.id]) it.seenAt = last[it.id].at; });
    if (n) persist(); if (p.portal) renderPortal(); if (n) toast(`${n} peça(s) atualizada(s) com a resposta do cliente.`);
  } catch (e) { toast(e.message); }
}
function ptCopy(t) { const u = ptLink(t); (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => toast('Link copiado.'), () => prompt('Copie o link:', u)); }
async function ptRevoke() { const pt = ptOf(curProject()); if (!pt.t || !confirm('Desativar o link? O cliente deixa de ver o portal.')) return; try { await api('portal.php', {method: 'POST', body: {action: 'revoke', t: pt.t}}); pt.t = ''; persist(); ptSay('Portal desativado.'); } catch (e) { toast(e.message); } }
function renderPortal() {
  const p = curProject(), r = $('portalRoot'); if (!p) { r.innerHTML = noProject('Portal do cliente'); return; }
  const pt = ptOf(p), wp = !!(API.status && API.status.wp), st = PT_STATUS;
  const link = pt.t ? ptLink(pt.t) : '';
  r.innerHTML = hubHead('Portal do cliente', 'A área do cliente: ele vê só o que você escolher, aprova ou pede ajustes, e acompanha o cronograma e os números.', pt.t ? `<button class="btn dark" onclick="ptPublish(false)" ${ptUI.busy ? 'disabled' : ''}>Publicar para o cliente</button>` : '') +
    (ptUI.msg ? `<div class="panel" style="border-left:4px solid #d98c00">${esc(ptUI.msg)}</div>` : '') +
    (!pt.t ? `<div class="panel"><h3 style="margin-top:0">Ainda não há portal neste projeto</h3><p>O portal cria um link próprio para o cliente. Sem senha e sem instalar nada. ${wp ? 'No WordPress você também pode exigir login (área de membros).' : ''}</p><button class="btn dark" onclick="ptCreate()">Criar o portal deste projeto</button>${API.available ? '' : '<p class="muted">O servidor (API) não respondeu: o portal só funciona no WordPress ou numa hospedagem com PHP.</p>'}</div>` :
    `<div class="panel"><div class="section-row"><h3 style="margin:0">Link do cliente</h3><div class="row-gap"><button class="btn sm" onclick="ptCopy('${pt.t}')">Copiar link</button><a class="btn sm" href="${esc(link)}" target="_blank" rel="noopener">Abrir como cliente</a><button class="btn sm" onclick="ptRevoke()">Desativar</button></div></div><code style="word-break:break-all;font-size:12px">${esc(link)}</code>
      <div class="two" style="margin-top:10px"><label class="field"><span>E-mail do cliente (avisos de novidades)</span><input value="${esc(pt.clientEmails)}" onchange="ptField('clientEmails',this.value)" placeholder="cliente@empresa.com"></label><label class="field"><span>Quem da equipe recebe as respostas</span><input value="${esc(pt.notifyEmails)}" onchange="ptField('notifyEmails',this.value)" placeholder="voce@agencia.com"></label></div>
      ${wp ? `<label style="display:flex;gap:8px;align-items:center;margin-top:6px"><input type="checkbox" ${pt.requireLogin ? 'checked' : ''} onchange="ptField('requireLogin',this.checked)"> Exigir login (área de membros): só quem tem conta liberada no WordPress abre. Crie a conta em <b>Ampliação Studio → Clientes</b> no WordPress.</label>` : '<p class="muted" style="font-size:12px;margin:8px 0 0">Exigir login (área de membros) só existe na versão para WordPress. Aqui, quem tem o link abre o portal.</p>'}
      <p class="muted" style="font-size:12px;margin:8px 0 0">Última publicação: ${pt.publishedAt ? new Date(pt.publishedAt).toLocaleString('pt-BR') : 'ainda não publicou'}. Depois de mudar status, datas ou peças, publique de novo.</p></div>
    <div class="panel"><div class="section-row"><h3 style="margin:0">O que o cliente vê (${pt.items.length})</h3><div class="row-gap"><button class="btn sm dark" onclick="ptAddModal()">＋ Adicionar peças</button><button class="btn sm" onclick="ptPublish(true)" title="Publica e avisa o cliente por e-mail">Publicar e avisar por e-mail</button></div></div>
      ${pt.items.length ? `<div class="list">${pt.items.map(it => `<div class="list-item" style="align-items:flex-start;gap:8px;flex-wrap:wrap"><div style="flex:1;min-width:220px"><strong>${esc(it.title)}</strong><small>${esc(ptKind[it.src.t] || '')}</small></div>
        <select onchange="ptSet('${it.id}','status',this.value)" title="Status que o cliente vê">${st.map(s => `<option ${s === it.status ? 'selected' : ''}>${s}</option>`).join('')}</select>
        <input type="date" value="${esc(it.due)}" onchange="ptSet('${it.id}','due',this.value)" title="Data de entrega">
        <input value="${esc(it.note)}" placeholder="Recado para o cliente" style="min-width:200px" onchange="ptSet('${it.id}','note',this.value)">
        <button class="btn sm" onclick="ptRm('${it.id}')" title="Tirar do portal">×</button></div>`).join('')}</div>` : '<p class="muted">Nada ainda. Clique em “＋ Adicionar peças”.</p>'}</div>
    <div class="panel"><div class="section-row"><h3 style="margin:0">Respostas do cliente</h3><button class="btn sm" onclick="ptSync()">Buscar respostas</button></div>
      <p class="muted" style="font-size:12px">Ao buscar, “aprovou” vira status <b>Aprovado</b> e “pediu ajustes” vira <b>Ajustes</b> com o comentário no recado.</p>
      ${ptUI.dec.length ? `<div class="list">${ptUI.dec.slice(0, 30).map(d => `<div class="list-item"><div><strong>${esc(d.title)}</strong><small>${({approve: 'Aprovou', changes: 'Pediu ajustes', comment: 'Comentou'})[d.decision] || ''} · ${esc(d.who || 'cliente')} · ${new Date(d.at).toLocaleString('pt-BR')}${d.comment ? ' · ' + esc(d.comment) : ''}</small></div></div>`).join('')}</div>` : '<p class="muted">Nenhuma resposta ainda.</p>'}</div>`);
  if (pt.t && !ptUI.synced) { ptUI.synced = true; ptSync(); }
}
