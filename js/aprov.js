/* ===== Aprovação de arte (cliente): peças reais do Studio → link de aprovação com prazo de 72 horas, respostas, correções e PDF de apresentação =====
   O cliente abre aprovacao.html?t=CODIGO (sem login). Servidor: api/aprovacao.php. Sem servidor: arquivo único (HTML) com as peças dentro. */
const apr = {busy: false, est: null, msg: '', thumbs: new Map()};
const APR_KIND = {carousel: 'Carrossel', single: 'Post', story: 'Stories', ad: 'Anúncio', reels: 'Reels'};
const APR_STAGE = {descoberta: 'descoberta', atracao: 'atencao', consideracao: 'consideracao', acao: 'compra', apologia: 'apologia'};
const APR_STAGE_NAME = {descoberta: 'Descoberta', atencao: 'Atenção', consideracao: 'Consideração', compra: 'Compra', apologia: 'Apologia'};
const APR_STAGE_DESC = {descoberta: 'Apresenta a marca a quem ainda não conhece.', atencao: 'Desperta interesse pelo problema e pelo jeito da marca.', consideracao: 'Compara, prova e responde dúvidas de quem está avaliando.', compra: 'Convida a fechar: oferta, prazo e botão direto.', apologia: 'Transforma clientes satisfeitos em quem indica a marca.'};

function aprState(p) {
  const a = p.aprov = (p.aprov && typeof p.aprov === 'object') ? p.aprov : {};
  a.t = /^[a-f0-9]{24}$/.test(a.t || '') ? a.t : ''; a.hours = Math.max(1, Math.min(720, +a.hours || 72)); a.handle = String(a.handle || '').replace(/[^\w.]/g, '').slice(0, 40);
  a.brand = String(a.brand || '').replace(/[<>]/g, '').slice(0, 80); a.notify = String(a.notify || '').replace(/[<>]/g, '').slice(0, 200); a.sentAt = String(a.sentAt || '').slice(0, 40);
  a.excl = Array.isArray(a.excl) ? a.excl.filter(x => /^[\w-]{1,80}$/.test(x)).slice(0, 600) : []; a.link = String(a.link || '').slice(0, 300); return a;
}
const aprDay = iso => { const d = iso ? new Date(iso) : new Date(); return isNaN(d) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10); };
const aprFmtDate = iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('pt-BR', {day: '2-digit', month: 'long', year: 'numeric'}); };
const aprFmtDT = d => d.toLocaleString('pt-BR', {day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'});

/* texto da lâmina: maior texto = título, segundo = apoio. **destaque** vira *destaque* */
function aprSlideText(sl) {
  const tx = (sl.layers || []).filter(L => L.type === 'text' && String(L.content || '').trim()).sort((a, b) => (b.size || 0) - (a.size || 0)), cl = t => String(t || '').replace(/\*\*(.+?)\*\*/g, '*$1*').replace(/\s+/g, ' ').trim();
  return {h: cl((tx[0] || {}).content).slice(0, 380), b: cl((tx[1] || {}).content).slice(0, 700)};
}
function aprCaps(p) { const m = new Map(); try { if (typeof so === 'function') so().posts.forEach(x => { if (x.setId && (!x.projectId || x.projectId === p.id) && x.caption) m.set(x.setId, x.caption); }); } catch (e) { /* sem publicação */ } return m; }
/* peças do projeto que podem ir ao cliente (sem as imagens: elas são geradas no envio) */
function aprPieces(p) {
  const out = [], used = new Set(), sets = (p.design && p.design.sets) || [], caps = aprCaps(p), today = aprDay();
  (p.campaigns || []).forEach(c => (c.pieces || []).forEach(q => {
    [['feed', 'feed'], ['vertical', 'story']].forEach(([k, fmt]) => {
      const s = sets.find(x => x.id === (q.sets || {})[k]); if (!s || (k !== 'feed' && q.on && q.on[k] === false)) return; used.add(s.id);
      const st = APR_STAGE[q.stage] || 'descoberta', id = ('ad_' + q.id + '_' + k).slice(0, 60);
      out.push({id, kind: 'ad', set: s, stage: st, format: fmt, label: `${c.name} · ${APR_STAGE_NAME[st]} · ${q.name || 'Anúncio'}${fmt === 'story' ? ' (Stories)' : ''}`, date: aprDay(s.updated || q.syncedAt), ad: {primary: String(q.s || ''), headline: String(q.h || ''), description: '', cta: String(q.btn || ''), url: ''},
        meta: {obj: String(c.objective || ''), budget: c.budget ? 'R$ ' + c.budget : '', period: String(c.period || ''), aud: String(c.audience || '')}});
    });
  }));
  sets.forEach(s => {
    if (used.has(s.id) || !s.format || !s.slides || !s.slides.length) return; const r = s.format.h / s.format.w; if (r < 1) return;   // só vertical/feed; horizontais (capas, apresentações) ficam para a próxima fase
    const kind = r > 1.6 ? 'story' : s.slides.length > 1 ? 'carousel' : 'single';
    out.push({id: ('pc_' + s.id).slice(0, 60), kind, set: s, label: s.name || 'Peça', date: aprDay(s.updated || s.created || today), caption: caps.get(s.id) || ''});
  });
  return out;
}
/* uma lâmina → JPEG (data URL), até 1080 px de largura */
async function aprRenderSlide(set, slide) {
  await ensureSetResources(set); const W = set.format.w, H = set.format.h, k = Math.min(1, 1080 / W), c = document.createElement('canvas'); c.width = Math.round(W * k); c.height = Math.round(H * k);
  renderSlide(c.getContext('2d'), slide, W, H, k); return c.toDataURL('image/jpeg', 0.86);
}
/* peça do Studio → item do módulo (img = id do arquivo enviado, ou data URL no arquivo único) */
function aprItem(pc, imgOf) {
  const sl = pc.kind === 'ad' ? [pc.set.slides[0]] : pc.set.slides, it = {id: pc.id, kind: pc.kind, date: pc.date, caption: pc.caption || '', slides: sl.map((s, i) => Object.assign(aprSlideText(s), {img: imgOf(pc, i)}))};
  if (pc.kind === 'story' || pc.format === 'story') it.format = 'story';
  if (pc.kind === 'ad') { it.stage = pc.stage; it.ad = pc.ad; it.meta = pc.meta; if (pc.format) it.format = pc.format; }
  return it;
}
const aprSel = p => { const a = aprState(p); return aprPieces(p).filter(x => !a.excl.includes(x.id)); };

/* ---------- tela ---------- */
function renderAprarte() {
  /* a tela virou a etapa "Cliente" da página única Aprovação: fora dela, redireciona */
  if (!apr.embed || ui.page !== 'approval') { if (typeof apH === 'object') apH.tab = 'cliente'; apr.embed = false; go('approval'); return; }
  const p = curProject(), r = $(apr.root || 'aprarteRoot'); if (!r) return; if (!p) { r.innerHTML = noProject('Aprovação de arte'); return; }
  const a = aprState(p), all = aprPieces(p), sel = all.filter(x => !a.excl.includes(x.id)), srv = API.available && !needsLogin(), sent = !!a.t && !!a.sentAt;
  const grp = (t, list) => list.length ? `<h4 style="margin:14px 0 6px">${t} <small class="muted">(${list.length})</small></h4><div class="apr-list">${list.map(x => `<label class="apr-row"><input type="checkbox" ${a.excl.includes(x.id) ? '' : 'checked'} onchange="aprToggle('${x.id}',this.checked)"><canvas class="apr-th" width="60" height="75" data-pc="${x.id}"></canvas><span><b>${esc(x.label)}</b><small>${APR_KIND[x.kind]} · ${x.kind === 'ad' ? 1 : x.set.slides.length} ${x.kind === 'story' ? 'frame(s)' : 'arte(s)'}${x.caption ? ' · com legenda' : ''}</small></span></label>`).join('')}</div>` : '';
  r.innerHTML = hubHead('Aprovação de arte', 'Leve as peças ao cliente do jeito que vão aparecer, recolha a decisão, o texto editado e as anotações, e receba a lista de correções. Sem resposta no prazo, vale como aprovado.', `<button class="btn" onclick="aprPdf()">📄 PDF de apresentação</button>`) +
    `<div class="panel"><h3 style="margin-top:0">1 · O que enviar <small class="muted">${sel.length} de ${all.length} peça(s)</small></h3>${all.length ? `<div class="row-gap" style="margin-bottom:6px"><button class="btn sm" onclick="aprAll(true)">Marcar todas</button><button class="btn sm" onclick="aprAll(false)">Desmarcar</button></div>` : ''}
      ${all.length ? grp('Anúncios', all.filter(x => x.kind === 'ad')) + grp('Feed', all.filter(x => x.kind === 'single' || x.kind === 'carousel')) + grp('Stories', all.filter(x => x.kind === 'story')) : '<p class="muted">Ainda não há peças verticais ou de feed. Crie no Estúdio de Design, em Carrosséis, Stories ou numa Campanha.</p>'}
      <p class="muted" style="font-size:12px;margin-bottom:0">Sites, logos, identidade, apresentações e e-books entram na próxima fase do módulo.</p></div>
    <div class="panel" style="margin-top:14px"><h3 style="margin-top:0">2 · Prazo e envio</h3><div class="form-grid">
      <div class="field"><label>Marca que aparece para o cliente</label><input id="apBrand" value="${esc(a.brand || p.name)}" onchange="aprSet('brand',this.value)"></div>
      <div class="field"><label>@ do perfil (sem o @)</label><input id="apHandle" value="${esc(a.handle)}" placeholder="seuperfil" onchange="aprSet('handle',this.value)"></div>
      <div class="field"><label>Prazo para o cliente responder (horas corridas)</label><input id="apHours" type="number" min="1" max="720" value="${a.hours}" onchange="aprSet('hours',this.value)"></div>
      <div class="field"><label>Avisar por e-mail quando o cliente enviar a revisão</label><input id="apNotify" value="${esc(a.notify)}" placeholder="voce@agencia.com, outra@agencia.com" onchange="aprSet('notify',this.value)"></div></div>
      <p class="muted" style="font-size:12.5px">Regra: a contagem começa no envio. Passadas ${a.hours} horas, toda peça ainda <b>não avaliada</b> passa a <b>aprovada por prazo</b>. <b>Alterado</b> e <b>Rejeitado</b> não expiram. O cliente é avisado do prazo na tela e no PDF. Confirme com seu contrato se essa aprovação por prazo vale para o seu caso.</p>
      <div class="row-gap" style="flex-wrap:wrap"><button class="btn dark" id="apSend" onclick="aprSend()" ${apr.busy || !sel.length ? 'disabled' : ''}>${sent ? '↻ Reenviar (reinicia o prazo)' : '✉ Enviar para aprovação'}</button>${sent && srv ? '<button class="btn" onclick="aprUpdatePieces()" title="Atualiza as artes sem reiniciar o prazo">Atualizar artes</button>' : ''}<button class="btn" onclick="aprExportHtml()">⬇ Arquivo único (HTML)</button></div>
      <p id="apMsg" class="muted" style="font-size:12.5px;margin:8px 0 0">${esc(apr.msg || (srv ? '' : 'Servidor não conectado: dá para baixar o arquivo único, mas o link com respostas para a equipe precisa do servidor.'))}</p></div>` +
    (sent ? `<div class="panel" style="margin-top:14px"><div id="aprResp"><p class="muted">Carregando respostas…</p></div></div>` : '');
  if (apr.embed) { const h = r.querySelector('.page-head'); if (h) { const act = h.querySelector('.actions'), ps = act && act.querySelector('.proj-select'); if (ps) ps.remove(); const t = document.createElement('div'); t.className = 'ah-tools'; t.innerHTML = '<span class="muted">Leve as peças ao cliente do jeito que vão aparecer, recolha a decisão e receba a lista de correções.</span><div class="row-gap">' + (act ? act.innerHTML : '') + '</div>'; h.replaceWith(t); } }
  r.querySelectorAll('.apr-th').forEach(cv => aprThumb(cv, all.find(x => x.id === cv.dataset.pc)));
  if (sent && srv) aprRefresh();
}
async function aprThumb(cv, pc) {
  if (!pc) return; try { await ensureSetResources(pc.set); const sl = pc.set.slides[0], W = pc.set.format.w, H = pc.set.format.h, k = Math.min(60 / W, 75 / H), c = cv.getContext('2d'); cv.width = Math.round(W * k); cv.height = Math.round(H * k); renderSlide(c, sl, W, H, k); } catch (e) { /* sem miniatura */ }
}
function aprToggle(id, on) { const a = aprState(curProject()); a.excl = a.excl.filter(x => x !== id); if (!on) a.excl.push(id); persist(); const b = $('apSend'); renderAprarteKeep(); }
function renderAprarteKeep() { const y = window.scrollY; renderAprarte(); window.scrollTo(0, y); }
function aprAll(on) { const p = curProject(), a = aprState(p); a.excl = on ? [] : aprPieces(p).map(x => x.id); persist(); renderAprarteKeep(); }
function aprSet(k, v) { const a = aprState(curProject()); a[k] = v; aprState(curProject()); persist(); if (k === 'hours') renderAprarteKeep(); }
const aprMsg = t => { apr.msg = t; const m = $('apMsg'); if (m) m.textContent = t; };

/* ---------- envio ---------- */
async function aprUploadImages(t, pieces, onProg) {
  const imgs = {}; let n = 0, batch = {}, size = 0; const flush = async () => { if (!Object.keys(batch).length) return; await api('aprovacao.php', {method: 'POST', body: {action: 'imagens', t, images: batch}}); batch = {}; size = 0; };
  for (const pc of pieces) { const sl = pc.kind === 'ad' ? [pc.set.slides[0]] : pc.set.slides; for (let i = 0; i < sl.length; i++) { const id = (pc.id + '_' + i).replace(/[^\w\-]/g, ''), d = await aprRenderSlide(pc.set, sl[i]); imgs[pc.id + '#' + i] = id; batch[id] = d; size += d.length; n++; onProg && onProg(n); if (size > 2.4e6) await flush(); } }
  await flush(); return imgs;
}
async function aprSend(keepDeadline) {
  const p = curProject(), a = aprState(p), pcs = aprSel(p); if (!pcs.length) { toast('Marque pelo menos uma peça.'); return; }
  if (!(API.available && !needsLogin())) { toast(needsLogin() ? 'Entre no Studio para enviar.' : 'Sem servidor: use o arquivo único (HTML).'); return; }
  if (apr.busy) return; if (a.sentAt && !keepDeadline && !confirm('Reenviar reinicia o prazo de ' + a.hours + ' horas e zera a revisão do cliente. As respostas por peça continuam. Continuar?')) return;
  apr.busy = true; renderAprarteKeep();
  try {
    aprMsg('Criando o link…'); if (!a.t) { const r = await api('aprovacao.php', {method: 'POST', body: {action: 'criar', project: p.id, name: p.name, brandName: a.brand || p.name, handle: a.handle}}); a.t = r.t; a.link = r.link; persist(); }
    const imgs = await aprUploadImages(a.t, pcs, n => aprMsg('Gerando e enviando as artes… ' + n));
    aprMsg('Publicando para o cliente…'); const items = pcs.map(pc => aprItem(pc, (q, i) => imgs[q.id + '#' + i]));
    const r = await api('aprovacao.php', {method: 'POST', body: {action: 'publicar', t: a.t, items, deadlineHours: a.hours, start: !keepDeadline, brand: {name: a.brand || p.name, handle: a.handle}, subtitle: 'Aprovação · ' + new Date().toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'}), notifyEmails: a.notify}});
    a.sentAt = r.sentAt || a.sentAt; a.link = r.link || a.link; persist(); aprMsg(keepDeadline ? 'Artes atualizadas.' : 'Enviado. O prazo de ' + a.hours + ' horas começou agora.'); toast(keepDeadline ? 'Artes atualizadas.' : 'Enviado para aprovação.');
  } catch (e) { aprMsg('Erro: ' + e.message); toast(e.message); } finally { apr.busy = false; renderAprarteKeep(); }
}
const aprUpdatePieces = () => aprSend(true);

/* ---------- respostas ---------- */
const aprExpired = (sub) => { if (!sub || !sub.sentAt) return false; const d = new Date(sub.sentAt); return !isNaN(d) && Date.now() > d.getTime() + (+sub.deadlineHours || 72) * 3600000; };
function aprStatusOf(it, rec, exp) { if (rec && rec.published) return 'published'; if (!rec && it.published) return 'published'; const st = rec && rec.status || 'pending'; return st === 'pending' && exp ? 'auto' : st; }
const APR_LAB = {pending: 'Não avaliado', approved: 'Aprovado', altered: 'Alterado', rejected: 'Rejeitado', published: 'Publicado', auto: 'Aprovado por prazo'}, APR_COL = {pending: '#8a8a80', approved: '#17703f', altered: '#d9a521', rejected: '#b3302a', published: '#1f5fc4', auto: '#17703f'};
async function aprRefresh() {
  const p = curProject(), a = aprState(p), box = $('aprResp'); if (!a.t) return;
  try { apr.est = await api('aprovacao.php', {method: 'POST', body: {action: 'equipe', t: a.t}}); } catch (e) { if (box) box.innerHTML = `<p class="muted">Não consegui ler as respostas: ${esc(e.message)}${/não encontrado|ativo/i.test(e.message) ? ' <button class="btn sm" onclick="aprForget()">Criar novo link</button>' : ''}</p>`; return; }
  const E = apr.est, exp = aprExpired(E.submission), c = {pending: 0, approved: 0, altered: 0, rejected: 0, published: 0, auto: 0}; E.items.forEach(it => { c[aprStatusOf(it, E.records[it.id], exp)]++; });
  const d = E.submission && E.submission.sentAt ? new Date(new Date(E.submission.sentAt).getTime() + (+E.submission.deadlineHours || 72) * 3600000) : null, left = d ? d.getTime() - Date.now() : 0;
  const todo = E.items.filter(it => { const r = E.records[it.id]; return r && ['altered', 'rejected'].includes(r.status) && !r.applied && !r.published; });
  const chip = (k, n) => `<span class="apr-chip" style="--c:${APR_COL[k]}"><b>${n}</b> ${APR_LAB[k]}</span>`;
  const diff = it => { const r = E.records[it.id] || {}, v = r.vals; if (!v) return ''; const L = []; (v.slides || []).forEach((s, i) => { const o = it.slides[i] || {}; if (s.h !== o.h) L.push(`Título ${i + 1}: <s>${esc(o.h || '')}</s> → <b>${esc(s.h || '')}</b>`); if (s.b !== o.b && (s.b || o.b)) L.push(`Texto ${i + 1}: <s>${esc(o.b || '')}</s> → <b>${esc(s.b || '')}</b>`); }); if (v.caption !== undefined && v.caption !== (it.caption || '') && (v.caption || it.caption)) L.push('Legenda alterada.'); if (v.ad && it.ad) ['primary', 'headline', 'description', 'cta'].forEach(k => { if (v.ad[k] !== it.ad[k]) L.push(`${k}: <s>${esc(it.ad[k] || '')}</s> → <b>${esc(v.ad[k] || '')}</b>`); }); return L.length ? `<div class="apr-diff">${L.slice(0, 8).join('<br>')}</div>` : ''; };
  $('aprResp').innerHTML = `<h3 style="margin-top:0">3 · Respostas do cliente</h3>
    <div class="apr-link"><input readonly value="${esc(E.link)}" onclick="this.select()"><button class="btn sm" onclick="aprCopyLink()">Copiar link</button><a class="btn sm" href="${esc(E.link)}" target="_blank" rel="noopener">Abrir</a><a class="btn sm dark" href="${esc(E.link)}#correcoes" target="_blank" rel="noopener" title="Painel de correções da equipe (você está logado)">Painel da equipe</a></div>
    <p class="muted" style="font-size:12.5px">${d ? (left > 0 ? `Prazo até <b>${aprFmtDT(d)}</b> (faltam ${Math.floor(left / 3600000)} h). Enviado em ${aprFmtDate(E.submission.sentAt)}.` : `Prazo encerrado em <b>${aprFmtDT(d)}</b>: ${c.auto} peça(s) aprovada(s) por prazo.`) : 'Sem prazo registrado.'} ${E.submission && E.submission.at ? `Revisão enviada por <b>${esc(E.submission.by || '')}</b> em ${aprFmtDate(E.submission.at)}.` : 'O cliente ainda não enviou a revisão.'}</p>
    <div class="apr-chips">${['pending', 'approved', 'auto', 'altered', 'rejected', 'published'].map(k => chip(k, c[k])).join('')}</div>
    ${todo.length ? `<h4 style="margin:14px 0 6px">Correções para aplicar <small class="muted">(${todo.length})</small></h4><div class="list">${todo.map(it => { const r = E.records[it.id]; return `<div class="list-item"><div><strong>${esc(((it.slides[0] || {}).h || it.id).replace(/\*/g, '').slice(0, 80))}</strong><small>${APR_LAB[r.status]} por ${esc(r.by || '')} · ${esc(r.comment || '')}${(r.pins || []).length ? ' · ' + r.pins.length + ' anotação(ões) na imagem' : ''}</small>${diff(it)}</div></div>`; }).join('')}</div><p class="muted" style="font-size:12px">Para marcar como aplicada ou publicada, abra o <b>Painel da equipe</b> (botão acima).</p>` : '<p class="muted">Nenhuma correção pendente.</p>'}
    <div class="row-gap" style="margin-top:10px;flex-wrap:wrap"><button class="btn sm" onclick="aprRefresh()">↻ Atualizar respostas</button><button class="btn sm" onclick="aprRevoke()">Desativar link</button></div>`;
}
function aprCopyLink() { const E = apr.est; if (!E) return; (navigator.clipboard ? navigator.clipboard.writeText(E.link) : Promise.reject()).then(() => toast('Link copiado.'), () => { const i = document.querySelector('.apr-link input'); if (i) { i.select(); document.execCommand('copy'); toast('Link copiado.'); } }); }
function aprForget() { const a = aprState(curProject()); a.t = ''; a.sentAt = ''; a.link = ''; persist(); renderAprarte(); }
async function aprRevoke() { const a = aprState(curProject()); if (!confirm('Desativar o link? O cliente não conseguirá mais abrir.')) return; try { await api('aprovacao.php', {method: 'POST', body: {action: 'revogar', t: a.t}}); } catch (e) { toast(e.message); return; } aprForget(); }

/* ---------- arquivo único (sem servidor) ---------- */
async function aprExportHtml() {
  const p = curProject(), a = aprState(p), pcs = aprSel(p); if (!pcs.length) { toast('Marque pelo menos uma peça.'); return; } if (apr.busy) return; apr.busy = true;
  try {
    aprMsg('Lendo o módulo…'); let html; try { const r = await fetch('aprovacao.html', {cache: 'no-store'}); if (!r.ok) throw 0; html = await r.text(); } catch (e) { throw new Error('Não achei aprovacao.html ao lado do Studio (a demonstração em arquivo único não traz este arquivo).'); }
    const data = {}; let n = 0; for (const pc of pcs) { const sl = pc.kind === 'ad' ? [pc.set.slides[0]] : pc.set.slides; for (let i = 0; i < sl.length; i++) { data[pc.id + '#' + i] = await aprRenderSlide(pc.set, sl[i]); aprMsg('Gerando as artes… ' + (++n)); } }
    const items = pcs.map(pc => aprItem(pc, (q, i) => data[q.id + '#' + i])), sentAt = new Date().toISOString();
    const cfg = {project: p.id, brand: a.brand || p.name, handle: a.handle || '', items, sentAt, deadlineHours: a.hours, agency: false};
    const tag = '<script>window.AMPLIACAO_APROVACAO=' + JSON.stringify(cfg).replace(/</g, '\\u003c') + ';</script>\n', at = html.indexOf('<script>\n(function () {'); if (at < 0) throw new Error('Formato inesperado do aprovacao.html.');
    const out = html.slice(0, at) + tag + html.slice(at); download('aprovacao-' + slug(p.name) + '.html', out, 'text/html'); aprMsg('Arquivo gerado. As respostas ficam só no navegador de quem abrir (use o link do servidor para a equipe receber).');
  } catch (e) { aprMsg('Erro: ' + e.message); toast(e.message); } finally { apr.busy = false; }
}

/* ---------- PDF de apresentação: lâminas 16:9 (1280×720) com visão geral, categorias, uma lâmina por peça e a regra do prazo ---------- */
const APR_C = {bg: '#F4EDE0', ink: '#141210', red: '#D4281C', mut: '#6d655a', card: '#ffffff'};
function aprWrap(ctx, text, maxW, maxLines) { const words = String(text || '').split(/\s+/), lines = []; let cur = ''; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; } if (cur) lines.push(cur); if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + '…'; } return lines; }
async function aprBitmap(src) { try { if (!src) return null; if (src instanceof ImageBitmap) return src; const b = src.startsWith('data:') ? await (await fetch(src)).blob() : await (await fetch(src, {credentials: 'same-origin'})).blob(); return await createImageBitmap(b); } catch (e) { return null; } }
async function aprPdf() {
  const p = curProject(), a = aprState(p); if (!p) return; const pcs = aprSel(p); let items = [], recs = {}, sub = null, brand = a.brand || p.name;
  if (a.t && API.available && !needsLogin()) { try { const E = apr.est || await api('aprovacao.php', {method: 'POST', body: {action: 'equipe', t: a.t}}); items = E.items; recs = E.records || {}; sub = E.submission; } catch (e) { /* usa as peças locais */ } }
  if (!items.length) { if (!pcs.length) { toast('Não há peças para o PDF. Marque as peças primeiro.'); return; } toast('Gerando as artes…'); items = []; for (const pc of pcs) { const sl = pc.kind === 'ad' ? [pc.set.slides[0]] : pc.set.slides; const it = aprItem(pc, () => ''); it.slides[0].img = await aprRenderSlide(pc.set, sl[0]); items.push(it); } }
  toast('Montando o PDF…'); await ensureFonts(['Archivo', 'Pacifico', 'Hanken Grotesk']);
  const W = 1280, H = 720, K = 1.5, pages = [], sentIso = (sub && sub.sentAt) || a.sentAt || new Date().toISOString(), hours = (sub && +sub.deadlineHours) || a.hours, dl = new Date(new Date(sentIso).getTime() + hours * 3600000), exp = Date.now() > dl.getTime();
  const sentTxt = aprFmtDate(sentIso), dlTxt = aprFmtDT(dl), HEAD = '900 {s}px Archivo, "Arial Black", Impact, sans-serif', HAND = '{s}px Pacifico, "Brush Script MT", cursive', BODY = '{w} {s}px "Hanken Grotesk", system-ui, sans-serif', F = (t, s, w) => t.replace('{s}', s).replace('{w}', w || 500);
  const bmps = []; for (const it of items) bmps.push(await aprBitmap(it.slides[0] && it.slides[0].img));
  const page = fn => { const c = document.createElement('canvas'); c.width = W * K; c.height = H * K; const x = c.getContext('2d'); x.scale(K, K); x.fillStyle = APR_C.bg; x.fillRect(0, 0, W, H); fn(x); x.fillStyle = APR_C.ink; x.fillRect(0, H - 44, W, 44); x.fillStyle = '#fff'; x.font = F(BODY, 15, 600); x.textBaseline = 'middle'; x.textAlign = 'left'; x.fillText('ENVIADO EM ' + sentTxt.toUpperCase() + '  ·  PRAZO ATÉ ' + dlTxt.toUpperCase(), 40, H - 22); x.textAlign = 'right'; x.fillStyle = '#ff6b5f'; x.fillText(brand.toUpperCase() + '  ·  ' + String(pages.length + 1).padStart(2, '0'), W - 40, H - 22); pages.push(c); };
  const title = (x, t, s, px, py, mw, col) => { x.fillStyle = col || APR_C.ink; x.font = F(HEAD, s); x.textAlign = 'left'; x.textBaseline = 'top'; const ls = aprWrap(x, t.toUpperCase(), mw, 4); ls.forEach((l, i) => x.fillText(l, px, py + i * s * 1.02)); return ls.length * s * 1.02; };
  const status = it => aprStatusOf(it, recs[it.id], sub ? aprExpired(sub) : exp), cover = (x, it, bm, bx, by, bw, bh) => { x.save(); x.fillStyle = '#ddd'; x.fillRect(bx, by, bw, bh); if (bm) { const s = Math.max(bw / bm.width, bh / bm.height); x.beginPath(); x.rect(bx, by, bw, bh); x.clip(); x.drawImage(bm, bx + (bw - bm.width * s) / 2, by + (bh - bm.height * s) / 2, bm.width * s, bm.height * s); } x.restore(); };
  /* 1 capa */
  page(x => { x.fillStyle = APR_C.red; x.fillRect(0, 0, 18, H - 44); title(x, 'Aprovação de conteúdo', 96, 70, 80, 1000); x.fillStyle = APR_C.red; x.font = F(HAND, 54); x.textBaseline = 'top'; x.fillText('para você decidir com calma', 74, 330); x.fillStyle = APR_C.ink; x.font = F(BODY, 30, 700); x.fillText(brand, 74, 430); x.font = F(BODY, 24, 500); x.fillStyle = APR_C.mut; x.fillText(items.length + ' peças para revisar', 74, 474);
    x.fillStyle = APR_C.ink; x.fillRect(74, 540, 520, 96); x.fillStyle = '#fff'; x.font = F(BODY, 16, 700); x.fillText('DATA DE ENVIO', 98, 556); x.font = F(HEAD, 40); x.fillText(sentTxt.toUpperCase(), 98, 584); });
  /* 2 regra do prazo */
  page(x => { title(x, 'A regra das ' + hours + ' horas', 74, 70, 70, 700); x.fillStyle = APR_C.red; x.font = F(HEAD, 300); x.textAlign = 'right'; x.textBaseline = 'top'; x.fillText(String(hours), 1210, 90); x.font = F(HAND, 64); x.fillText('horas', 1160, 380);
    x.textAlign = 'left'; x.fillStyle = APR_C.ink; x.font = F(BODY, 28, 500); aprWrap(x, `Você tem até ${dlTxt} para decidir cada peça. Se uma peça ficar sem resposta até lá, ela conta como aprovada por prazo e a equipe pode publicar.`, 700, 5).forEach((l, i) => x.fillText(l, 74, 250 + i * 40));
    x.font = F(BODY, 22, 700); [['Aprovado', '#17703f', 'Pode publicar'], ['Alterado', '#d9a521', 'Aceito com mudanças pedidas (não expira)'], ['Rejeitado', '#b3302a', 'Não vai ao ar, com motivo (não expira)']].forEach(([t, c, d], i) => { x.fillStyle = c; x.beginPath(); x.arc(86, 500 + i * 44, 12, 0, 7); x.fill(); x.fillStyle = APR_C.ink; x.font = F(BODY, 22, 800); x.fillText(t, 112, 488 + i * 44); x.font = F(BODY, 20, 500); x.fillStyle = APR_C.mut; x.fillText(d, 250, 490 + i * 44); }); });
  /* 3 visão geral (grade com contorno por status) */
  const ring = {pending: '#bdb6a8', approved: '#2cae68', auto: '#2cae68', altered: '#d9a521', rejected: '#e0483f', published: '#3b82f6'};
  for (let off = 0; off < items.length; off += 18) page(x => { title(x, 'Visão geral' + (items.length > 18 ? ' ' + (off / 18 + 1) : ''), 56, 50, 36, 700); const cols = 9, cw = 120, ch = 150, gx = 50, gy = 118; items.slice(off, off + 18).forEach((it, i) => { const cx = gx + (i % cols) * (cw + 8), cy = gy + Math.floor(i / cols) * (ch + 16 + 100); cover(x, it, bmps[off + i], cx, cy, cw, ch); x.lineWidth = 6; x.strokeStyle = ring[status(it)]; x.strokeRect(cx, cy, cw, ch); x.fillStyle = APR_C.ink; x.font = F(BODY, 13, 700); x.textAlign = 'left'; x.textBaseline = 'top'; aprWrap(x, (it.slides[0].h || it.id).replace(/\*/g, ''), cw, 3).forEach((l, j) => x.fillText(l, cx, cy + ch + 8 + j * 16)); }); x.font = F(BODY, 15, 600); x.fillStyle = APR_C.mut; x.fillText('Contorno: verde aprovado · amarelo alterar · vermelho rejeitado · azul publicado · cinza sem resposta', 50, 650); });
  /* 4 categorias */
  const cats = []; APR_STAGE_NAME && Object.keys(APR_STAGE_NAME).forEach(k => { const l = items.map((it, i) => [it, i]).filter(([it]) => it.kind === 'ad' && it.stage === k); if (l.length) cats.push({t: 'Anúncios · ' + APR_STAGE_NAME[k], d: APR_STAGE_DESC[k], l}); });
  [['Feed', i => i.kind === 'single' || i.kind === 'carousel', 'Carrosséis e imagens únicas.'], ['Stories', i => i.kind === 'story', 'Sequências verticais.']].forEach(([t, f, d]) => { const l = items.map((it, i) => [it, i]).filter(([it]) => f(it)); if (l.length) cats.push({t, d, l}); });
  cats.forEach(c => page(x => { title(x, c.t, 66, 60, 56, 900); x.fillStyle = APR_C.red; x.font = F(HAND, 36); x.textBaseline = 'top'; x.fillText(c.l.length + (c.l.length > 1 ? ' peças' : ' peça'), 62, 200); x.fillStyle = APR_C.ink; x.font = F(BODY, 24, 500); aprWrap(x, c.d, 520, 4).forEach((l, i) => x.fillText(l, 62, 270 + i * 34)); c.l.slice(0, 6).forEach(([it, i], k) => { const bx = 640 + (k % 3) * 200, by = 90 + Math.floor(k / 3) * 270; cover(x, it, bmps[i], bx, by, 180, 225); x.lineWidth = 6; x.strokeStyle = ring[status(it)]; x.strokeRect(bx, by, 180, 225); }); }));
  /* 5 uma lâmina por peça */
  items.forEach((it, i) => page(x => {
    const s = status(it), v = (recs[it.id] || {}).vals, sl0 = it.slides[0] || {}, story = it.format === 'story', bw = story ? 300 : 440, bh = story ? 533 : 550, bx = 70, by = 50; cover(x, it, bmps[i], bx, by, bw, bh); x.lineWidth = 8; x.strokeStyle = ring[s]; x.strokeRect(bx, by, bw, bh);
    const tx = bx + bw + 60, mw = W - tx - 60; x.textAlign = 'left'; x.textBaseline = 'top'; x.fillStyle = APR_C.red; x.font = F(HAND, 34); x.fillText(({ad: 'Anúncio', single: 'Post', carousel: 'Carrossel', story: 'Stories', reels: 'Reels'})[it.kind] + (it.kind === 'ad' ? ' · ' + (APR_STAGE_NAME[it.stage] || '') : ''), tx, 56);
    const h = title(x, (sl0.h || '').replace(/\*/g, '') || 'Sem título', 46, tx, 108, mw); x.fillStyle = APR_C.ink; x.font = F(BODY, 21, 500); const desc = it.kind === 'ad' ? [it.ad.primary, it.ad.headline && 'Título: ' + it.ad.headline, it.ad.cta && 'Botão: ' + it.ad.cta].filter(Boolean).join('  ·  ') : (it.caption || sl0.b || ''); aprWrap(x, desc.replace(/\s+/g, ' '), mw, 8).forEach((l, j) => x.fillText(l, tx, 108 + h + 24 + j * 30));
    x.fillStyle = ring[s]; x.fillRect(tx, 545, 240, 44); x.fillStyle = s === 'altered' ? '#1a1507' : '#fff'; x.font = F(BODY, 18, 800); x.textBaseline = 'middle'; x.fillText(APR_LAB[s].toUpperCase(), tx + 16, 567); x.fillStyle = APR_C.mut; x.font = F(BODY, 17, 600); x.fillText((it.date ? aprFmtDate(it.date) : '') + (it.slides.length > 1 ? '  ·  ' + it.slides.length + ' ' + (story ? 'frames' : 'slides') : ''), tx + 260, 567); }));
  /* 6 fechamento */
  page(x => { title(x, 'Prazo final', 100, 70, 80, 1000); x.fillStyle = APR_C.red; x.font = F(HEAD, 96); x.textBaseline = 'top'; x.fillText(dlTxt.toUpperCase(), 74, 280); x.font = F(HAND, 48); x.fillText(exp ? 'prazo encerrado' : 'te esperamos até lá', 74, 410); x.fillStyle = APR_C.ink; x.font = F(BODY, 24, 500); aprWrap(x, `O que não tiver resposta até esse momento conta como aprovado. Alterações e rejeições continuam abertas até a equipe tratar.${a.link ? ' Link de aprovação: ' + a.link : ''}`, 1000, 3).forEach((l, i) => x.fillText(l, 74, 500 + i * 34)); });
  const jpgs = []; for (const c of pages) jpgs.push(await new Promise(r => c.toBlob(async b => r(new Uint8Array(await b.arrayBuffer())), 'image/jpeg', 0.9)));
  download('aprovacao-' + slug(p.name) + '.pdf', aprPdfBytes(jpgs.map((b, i) => ({b, w: pages[i].width, h: pages[i].height}))), 'application/pdf'); toast('PDF gerado.');
}
/* PDF mínimo: uma imagem JPEG por página (16:9) */
function aprPdfBytes(pg) {
  const enc = new TextEncoder(), parts = [], offs = []; let len = 0; const put = d => { const u = typeof d === 'string' ? enc.encode(d) : d; parts.push(u); len += u.length; }, obj = (n, body) => { offs[n] = len; put(n + ' 0 obj\n'); put(body); put('\nendobj\n'); };
  put('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'); const kids = pg.map((_, i) => (3 + i * 3) + ' 0 R').join(' ');
  obj(1, '<</Type/Catalog/Pages 2 0 R>>'); obj(2, `<</Type/Pages/Kids[${kids}]/Count ${pg.length}>>`);
  pg.forEach((x, i) => { const P = 3 + i * 3, C = P + 1, I = P + 2, cont = 'q 960 0 0 540 0 0 cm /Im0 Do Q';
    obj(P, `<</Type/Page/Parent 2 0 R/MediaBox[0 0 960 540]/Resources<</XObject<</Im0 ${I} 0 R>>>>/Contents ${C} 0 R>>`); obj(C, `<</Length ${cont.length}>>\nstream\n${cont}\nendstream`);
    offs[I] = len; put(`${I} 0 obj\n<</Type/XObject/Subtype/Image/Width ${x.w}/Height ${x.h}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${x.b.length}>>\nstream\n`); put(x.b); put('\nendstream\nendobj\n'); });
  const n = 3 + pg.length * 3, xr = len; put(`xref\n0 ${n}\n0000000000 65535 f \n`); for (let i = 1; i < n; i++) put(String(offs[i]).padStart(10, '0') + ' 00000 n \n'); put(`trailer\n<</Size ${n}/Root 1 0 R>>\nstartxref\n${xr}\n%%EOF`);
  const out = new Uint8Array(len); let o = 0; parts.forEach(u => { out.set(u, o); o += u.length; }); return out;
}
