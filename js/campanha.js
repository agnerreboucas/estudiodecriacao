/* ===== Campanhas: cada campanha tem N peças e cada peça nasce em 3 medidas do Meta (feed, vertical, horizontal).
   A medida "feed" é a matriz: o que muda nela (texto, foto, cor, layout) é refeito nas outras duas, a não ser que você tenha
   ajustado aquela medida à mão. Bancos de variações (headlines, apoios, CTAs, imagens, cores) trocam tudo em um clique. ===== */
/* as 5 fases da jornada de compra, cada uma com seu gatilho psicológico fixo. Uma campanha reúne as 5 fases. */
const CMP_STAGES5 = ['descoberta', 'atracao', 'consideracao', 'acao', 'apologia'];
const CMP_STAGE_NAME = {descoberta: 'Descoberta', atracao: 'Atração', consideracao: 'Consideração', acao: 'Ação', apologia: 'Apologia'};
const CMP_STAGE_LABEL = {descoberta: '1 · Descoberta', atracao: '2 · Atração', consideracao: '3 · Consideração', acao: '4 · Ação', apologia: '5 · Apologia'};
const CMP_STAGE_EU = {descoberta: 'Eu sei', atracao: 'Eu gosto', consideracao: 'Quero saber mais', acao: 'Vou comprar ou experimentar', apologia: 'Eu recomendo'};
const CMP_STAGE_GATILHO = {descoberta: 'Identificação', atracao: 'Aspiração', consideracao: 'Segurança', acao: 'Momento Uau', apologia: 'Identidade'};
const CMP_STAGE_DESC = {descoberta: 'O cliente é exposto à marca pela primeira vez, por conteúdo, anúncio ou indicação.', atracao: 'Você desperta interesse suficiente para ele prestar atenção e continuar te acompanhando.', consideracao: 'Ele pesquisa, compara, lê e tira dúvidas. É a fase mais crítica do ciclo.', acao: 'Ele decide: assina, compra, agenda, o "sim" acontece.', apologia: 'Ele vira defensor da marca: renova, indica, compartilha. A jornada não termina na venda.'};
const CMP_STAGE_KINDS = {descoberta: ['dor', 'urgencia'], atracao: ['desejo', 'dor'], consideracao: ['duvida', 'dor'], acao: ['urgencia', 'desejo'], apologia: ['desejo', 'duvida']};
const CMP_STAGE_CTA = {descoberta: 'Saiba mais', atracao: 'Siga e acompanhe', consideracao: 'Tire suas dúvidas', acao: '', apologia: 'Indique para um amigo'};
const CMP_GENERIC = ['Entenda antes de decidir', 'Fale com quem entende do assunto', 'Tire suas dúvidas sem compromisso'];
const CMP_MLABEL = {feed: 'Feed', vertical: 'Vertical', horizontal: 'Horizontal'};
const CMP_MFMT = c => ({feed: FORMATS[c.feedFmt === 'square' ? 'adsquare' : 'ad45'], vertical: FORMATS.adstory, horizontal: FORMATS.adlink});
const CMP_SAFE = {top: 250, bottom: 340};   // zonas que o Meta cobre no vertical (regra prática, editável aqui)
const cmpUI = {id: '', tab: 'pecas', phase: 'descoberta', busy: false};
const cmpOf = (p, id) => p.campaigns.find(x => x.id === id);
const cmpSetOf = (p, id) => p.design.sets.find(s => s.id === id);
function cmpRender() { if (ui.page === 'project') { renderProjectTab(); cmpAfter(curProject(), document); } else renderCampaignsPage(); }

/* ---------- textos e cores iniciais, vindos do pré-projeto (sem IA, sem gastar crédito) ---------- */
const CMP_KIND_LABEL = {dor: 'Dor', duvida: 'Dúvida', desejo: 'Desejo', urgencia: 'Urgência oculta', ideia: 'Ideia', comentario: 'Comentário'};
const CMP_KIND_PL = {dor: 'Dores', duvida: 'Dúvidas', desejo: 'Desejos', urgencia: 'Urgências ocultas'};
const CMP_KIND_COLOR = {dor: '#d64545', duvida: '#3b82c4', desejo: '#2e9e5b', urgencia: '#b7791f', ideia: '#7c5cc4', comentario: '#6b7280'};
const CMP_KIND_FIELD = {dor: 'pains', duvida: 'doubts', desejo: 'desires', urgencia: 'hidden'};
const CMP_KIND_HINT = {dor: 'o que incomoda hoje', duvida: 'o que perguntam antes de decidir', desejo: 'o que querem alcançar', urgencia: 'o que sentem e não dizem'};
/* bancos a partir do pré-projeto: dores, dúvidas, desejos e urgências ocultas (sem IA, sem gastar crédito) */
function cmpDraftBank(p, n) {
  const icps = (p.pre && p.pre.icps) || [], lines = k => [...new Set(icps.flatMap(i => String(i[k] || '').split('\n').map(t => t.replace(/\s+/g, ' ').trim()).filter(Boolean)))].slice(0, 12);
  const bank = {}; CMP_KINDS.forEach(k => { bank[k] = lines(CMP_KIND_FIELD[k]); });
  const prods = p.products || [], uniq = (a, m, len) => [...new Set(a.map(t => String(t).trim()).filter(t => t && t.length <= len))].slice(0, m);
  const sub = []; prods.forEach(x => { if (x.summary) sub.push(x.summary.split(/(?<=[.!?])\s/)[0]); (x.benefits || []).slice(0, 2).forEach(b => sub.push(b)); });
  if (p.brief && p.brief.offer) sub.push(p.brief.offer.split(/(?<=[.!?])\s/)[0]); if (p.desc) sub.push(p.desc);
  const tk = brandTokens(p), col = [{name: 'Marca', bg: tk.bg, accent: tk.accent, fg: tk.fg}, {name: 'Contraste', bg: tk.accent, accent: tk.bg, fg: readable(tk.accent)}];
  return Object.assign(bank, {h: [], ht: [], s: uniq(sub, 8, 160), c: ['Fale no WhatsApp', 'Agende uma conversa', 'Peça um orçamento'], img: libList().slice(0, 3).map(i => i.imgId), col});
}
const cmpFmt = (k, t) => { t = String(t).replace(/\s+/g, ' ').trim(); if (k === 'desejo') return t.replace(/[.!]+$/, ''); if (k === 'dor' || k === 'duvida') return /[?.!…]$/.test(t) ? t : t + '?'; return t; };
/* escolhe a headline de uma peça pela fase: descoberta parte da dor, atração do desejo, consideração das dúvidas, ação da urgência oculta e apologia do desejo e da identidade */
function cmpPickHead(c, stage, k, used) {
  const kinds = CMP_STAGE_KINDS[stage], order = []; for (let i = 0; i < kinds.length; i++) order.push(kinds[(k + i) % kinds.length]); CMP_KINDS.forEach(x => { if (!order.includes(x)) order.push(x); });
  for (const kd of order) { const t = c.bank[kd].map(x => cmpFmt(kd, x)).find(x => x.length <= 120 && !used.has(x)); if (t) { used.add(t); return {h: t, t: kd}; } }
  const g = CMP_GENERIC.concat(c.bank.h).find(x => !used.has(x)); if (g) { used.add(g); return {h: g, t: ''}; } return {h: CMP_GENERIC[k % 3], t: ''};
}
/* uma headline de cada tipo por rodada: dor, dúvida, desejo, urgência oculta */
function cmpMakeHeads(bank, n, q) {
  const h = [], ht = [], seen = new Set(); q = q || (t => /[?.!…]$/.test(t) ? t : t + '?');
  for (let r = 0; r < 20 && h.length < n; r++) CMP_KINDS.forEach(k => { const t = bank[k][r]; if (!t || h.length >= n) return; const x = (k === 'desejo' ? t.replace(/[.!]+$/, '') : (k === 'dor' || k === 'duvida') ? q(t) : t); if (x.length <= 120 && !seen.has(x)) { seen.add(x); h.push(x); ht.push(k); } });
  return {h, ht};
}
function cmpNewPiece(c, stage, k, head, gi) {
  const b = c.bank, at = (a, i) => (a.length ? a[i % a.length] : ''), cta = stage === 'acao' ? at(b.c, k) : (CMP_STAGE_CTA[stage] || at(b.c, k));
  if (cta && !b.c.includes(cta) && b.c.length < 20) b.c.push(cta);
  if (head.h && !b.h.includes(head.h) && b.h.length < 30) { b.h.push(head.h); b.ht.length = b.h.length - 1; b.ht.push(head.t || ''); }
  return {id: uid('pc'), name: `${CMP_STAGE_NAME[stage]} · Anúncio ${k + 1}`, stage, h: head.h, s: at(b.s, gi), btn: cta, imgId: at(b.img, gi), col: b.col.length ? gi % b.col.length : 0, on: {feed: true, vertical: true, horizontal: true}, sets: {feed: '', vertical: '', horizontal: ''}, lock: {feed: false, vertical: false, horizontal: false}, status: 'Rascunho', syncedAt: ''};
}

/* ---------- construção das artes ---------- */
function cmpTk(p, c, q) {
  const base = brandTokens(p), tk = JSON.parse(JSON.stringify(base)), col = c.bank.col[q.col] || c.bank.col[0];
  if (col) { tk.bg = col.bg; tk.accent = col.accent; tk.fg = col.fg || tk.fg; tk.muted = mixHex(tk.bg, tk.fg, 0.65); }
  tk.align = c.align; return tk;
}
function cmpMaster(p, c, q) {
  const tk = cmpTk(p, c, q), f = CMP_MFMT(c).feed, lay = q.imgId ? (c.layout === 'auto' ? 'bottom' : c.layout) : 'none';
  const sl = slideAd(tk, {kicker: '', title: q.h || 'Título da peça', sub: q.s || '', button: q.btn || ''}, f, p.name, lay);
  if (q.imgId) { const P = sl.layers.find(l => l.type === 'image' && l.role === 'photo'); if (P) P.imgId = q.imgId; }
  return {id: uid('ds'), name: `${c.name} · ${q.name} · ${CMP_MLABEL.feed}`, format: {id: f.id, w: f.w, h: f.h}, tk, slides: [sl], created: new Date().toISOString(), updated: new Date().toISOString()};
}
/* refaz uma medida a partir da matriz (feed). O vertical é montado numa altura menor e descido para fora da zona que o Meta cobre. */
function cmpResize(master, k, c) {
  const to = CMP_MFMT(c)[k];
  if (k === 'horizontal') return resizeSetSync(master, to);
  const H = to.h - CMP_SAFE.top - CMP_SAFE.bottom, tmp = resizeSetSync(master, {id: to.id, name: to.name, label: to.label, w: to.w, h: H});
  tmp.format = {id: to.id, w: to.w, h: to.h};
  tmp.slides.forEach(sl => sl.layers.forEach(L => {
    if (L.role === 'overlay' || (L.role === 'photo' && L.y === 0 && L.w >= to.w - 10)) { if (L.h >= H - 5) { L.y = 0; L.h = to.h; } else { L.h += CMP_SAFE.top; } }
    else L.y += CMP_SAFE.top;
  }));
  return tmp;
}
function cmpAssign(p, q, k, ns, c) {
  ns.name = `${c.name} · ${q.name} · ${CMP_MLABEL[k]}`; const cur = cmpSetOf(p, q.sets[k]);
  if (cur) { cur.slides = ns.slides; cur.tk = ns.tk; cur.format = ns.format; cur.name = ns.name; cur.updated = new Date().toISOString(); } else { p.design.sets.push(ns); q.sets[k] = ns.id; }
}
async function cmpBuildPiece(p, c, q) {
  const tk = cmpTk(p, c, q); await ensureFonts([tk.head.family, tk.body.family]);
  const m = cmpMaster(p, c, q), cur = cmpSetOf(p, q.sets.feed);
  if (q.on.feed) { if (cur) { cur.slides = m.slides; cur.tk = m.tk; cur.format = m.format; cur.name = m.name; cur.updated = new Date().toISOString(); } else { p.design.sets.push(m); q.sets.feed = m.id; } }
  const master = cmpSetOf(p, q.sets.feed) || m; await ensureSetResources(master);
  for (const k of ['vertical', 'horizontal']) { if (!q.on[k]) continue; if (q.lock[k] && cmpSetOf(p, q.sets[k])) continue; cmpAssign(p, q, k, cmpResize(master, k, c), c); }
  q.syncedAt = new Date(Date.now() + 1).toISOString();
}
/* o que foi mudado na matriz (feed) vai para as outras medidas; medida editada à mão fica travada */
async function cmpAutoSync(p, c) {
  let ch = false;
  for (const q of c.pieces) {
    const m = cmpSetOf(p, q.sets.feed); if (!m) continue;
    ['vertical', 'horizontal'].forEach(k => { const t = cmpSetOf(p, q.sets[k]); if (t && !q.lock[k] && (t.updated || '') > (q.syncedAt || '')) { q.lock[k] = true; ch = true; } });
    if ((m.updated || '') > (q.syncedAt || '')) { await ensureSetResources(m); for (const k of ['vertical', 'horizontal']) { if (!q.on[k] || q.lock[k]) continue; cmpAssign(p, q, k, cmpResize(m, k, c), c); } q.syncedAt = new Date(Date.now() + 1).toISOString(); ch = true; }
  }
  if (ch) persist(); return ch;
}

/* ---------- criar ---------- */
function cmpNewModal() {
  const p = curProject(); if (!p) { toast('Abra um projeto primeiro.'); return; }
  showModal('Nova campanha', `<p style="font-size:13px;margin-top:0">Uma campanha reúne as <b>5 fases da jornada de compra</b> (descoberta, atração, consideração, ação e apologia), cada uma com o seu gatilho psicológico. Ela já nasce <b>preenchida</b> com as dores, dúvidas, desejos e urgências ocultas do pré-projeto, e cada anúncio sai em 3 medidas. Tudo continua editável.</p>
  <div class="form-grid"><div class="field full"><label>Nome da campanha</label><input id="cmN" placeholder="Ex.: Lançamento de março"></div>
  <div class="field"><label>Objetivo</label><select id="cmO">${['Leads', 'Mensagens no WhatsApp', 'Agendamentos', 'Vendas', 'Reconhecimento'].map(o => `<option>${o}</option>`).join('')}</select></div>
  <div class="field"><label>Anúncios por fase</label><input id="cmQ" type="number" min="1" max="10" value="5" oninput="cmpCount()"></div>
  <div class="field full"><label>Medida do feed</label><label style="display:flex;gap:6px;font-size:13px"><input type="radio" name="cmF" value="feed45" checked> 4:5 · 1080×1350 (recomendado)</label><label style="display:flex;gap:6px;font-size:13px"><input type="radio" name="cmF" value="square"> Quadrado 1:1 · 1080×1080</label></div></div>
  <p id="cmCt" class="muted" style="font-size:12.5px">5 fases × 5 anúncios = 25 anúncios × 3 medidas = <b>75 artes</b>. Gerar não gasta crédito de IA e leva alguns segundos.</p>
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="cmpCreate()">Gerar campanha</button></div>`);
}
function cmpCount() { const n = Math.max(1, Math.min(10, +$('cmQ').value || 1)); $('cmCt').innerHTML = `5 fases × ${n} anúncio${n > 1 ? 's' : ''} = ${n * 5} anúncios × 3 medidas = <b>${n * 15} artes</b>. Gerar não gasta crédito de IA e leva alguns segundos.`; }
async function cmpCreate() {
  const p = curProject(), name = $('cmN').value.trim(); if (!name) { toast('Dê um nome à campanha.'); return; }
  const n = Math.max(1, Math.min(10, +$('cmQ').value || 5)), ff = (document.querySelector('input[name=cmF]:checked') || {}).value || 'feed45';
  const c = {id: uid('cm'), name, objective: $('cmO').value, budget: 0, channel: 'Meta Ads', status: 'Rascunho', period: '', audience: ((p.pre.icps[0] || {}).name || ''), feedFmt: ff, layout: 'auto', align: 'left', bank: cmpDraftBank(p, n), test: {macro: '', micro: '', format: '', notes: ''}, notes: [], pieces: [], created: new Date().toISOString()};
  c.test = {macro: `Teste de ângulo: dentro de cada fase, compare os ${n} anúncios (headlines de tipos diferentes: dor, dúvida, desejo, urgência oculta), mesmo público e mesmo orçamento. (sugestão, edite)`, micro: 'Com o ângulo vencedor de cada fase, troque uma coisa por vez: imagem, cor ou CTA, usando a faixa de variações.', format: 'Compare feed, vertical e horizontal do mesmo anúncio para ver qual medida rende mais.', notes: ''};
  p.campaigns.push(c); closeModal(); cmpUI.id = c.id; cmpUI.phase = 'descoberta'; cmpUI.tab = 'pecas'; cmpUI.busy = true; const used = new Set(), total = n * 5; let gi = 0;
  try { for (const st of CMP_STAGES5) for (let k = 0; k < n; k++) { toast(`Montando as artes… ${gi + 1}/${total}`); const q = cmpNewPiece(c, st, k, cmpPickHead(c, st, k, used), gi++); c.pieces.push(q); await cmpBuildPiece(p, c, q); } } finally { cmpUI.busy = false; }
  persist(); cmpRender(); toast(`Campanha criada: ${total} anúncios, ${total * 3} artes. Troque o que quiser na faixa de variações.`);
}

/* ---------- variações em um clique ---------- */
function cmpPaintSet(set, fn) { set.slides.forEach(sl => fn(sl)); set.updated = new Date().toISOString(); }
const cmpSetRole = (set, role, text) => cmpPaintSet(set, sl => sl.layers.forEach(L => { if (L.type === 'text' && L.role === role) L.content = role === 'title' ? autoEmphasis(text) : text; }));
async function cmpPick(cid, pid, field, i) {
  const p = curProject(), c = cmpOf(p, cid), q = c.pieces.find(x => x.id === pid), b = c.bank; if (!c || !q) return;
  const sets = CMP_MEASURES.filter(k => q.on[k]).map(k => cmpSetOf(p, q.sets[k])).filter(Boolean);
  if (field === 'col') { q.col = i; const tk = cmpTk(p, c, q); sets.forEach(s => { s.tk = tk; cmpPaintSet(s, sl => { sl.bg = tk.bg; sl.layers.forEach(L => themeLayer(L, tk)); }); }); q.syncedAt = new Date(Date.now() + 1).toISOString(); }
  else if (field === 'img') { q.imgId = b.img[i] || ''; await cmpBuildPiece(p, c, q); }
  else { const map = {h: ['h', 'title'], s: ['s', 'body'], btn: ['btn', 'cta-text']}, [key, role] = map[field], src = field === 'btn' ? b.c : b[field]; q[key] = src[i] || '';
    const m = cmpSetOf(p, q.sets.feed); if (m) { cmpSetRole(m, role, q[key]); await ensureSetResources(m); for (const k of ['vertical', 'horizontal']) { if (!q.on[k]) continue; if (q.lock[k]) { const t = cmpSetOf(p, q.sets[k]); if (t) cmpSetRole(t, role, q[key]); } else cmpAssign(p, q, k, cmpResize(m, k, c), c); } q.syncedAt = new Date(Date.now() + 1).toISOString(); } }
  persist(); cmpRender();
}
async function cmpRelayout(cid) {
  const p = curProject(), c = cmpOf(p, cid); if (!c || !confirm('Refazer todas as peças com este layout? Medidas que você ajustou à mão (travadas) são mantidas.')) return;
  cmpUI.busy = true; cmpRender(); try { for (const q of c.pieces) { const m = cmpSetOf(p, q.sets.feed); if (m && q.lock.feed) continue; await cmpBuildPiece(p, c, q); } } finally { cmpUI.busy = false; } persist(); cmpRender(); toast('Layout aplicado a todas as peças.');
}
function cmpField(cid, k, v) { const c = cmpOf(curProject(), cid); if (!c) return; c[k] = k === 'budget' ? Math.max(0, +v || 0) : String(v).slice(0, 300); persist(); }
function cmpTest(cid, k, v) { const c = cmpOf(curProject(), cid); if (c) { c.test[k] = String(v).slice(0, 1500); persist(); } }
function cmpBank(cid, k, v) {
  const p = curProject(), c = cmpOf(p, cid); if (!c) return; const L = String(v).split('\n').map(t => t.trim()).filter(Boolean).slice(0, k === 'h' ? 30 : 20);
  if (k === 'h') { const m = {}; c.bank.h.forEach((t, i) => { m[t] = c.bank.ht[i] || ''; }); c.bank.ht = L.map(t => m[t] || ''); }
  c.bank[k] = L; persist(); cmpRender();
}
function cmpRebuildHeads(cid) {
  const c = cmpOf(curProject(), cid), n = Math.max(3, Math.min(30, c.pieces.length || 5)), r = cmpMakeHeads(c.bank, n);
  if (!r.h.length) { toast('Preencha dores, dúvidas, desejos ou urgências ocultas primeiro.'); return; }
  c.bank.h = r.h; c.bank.ht = r.ht; persist(); cmpRender(); toast('Headlines remontadas: uma de cada tipo por rodada. As peças já criadas não mudam sozinhas.');
}
function cmpColor(cid, i, field, v) { const c = cmpOf(curProject(), cid); if (!c || !c.bank.col[i] || !/^#[0-9a-f]{6}$/i.test(v)) return; c.bank.col[i][field] = v; persist(); }
function cmpAddColor(cid) { const p = curProject(), c = cmpOf(p, cid); if (c.bank.col.length >= 6) return; const t = brandTokens(p); c.bank.col.push({name: 'Cor ' + (c.bank.col.length + 1), bg: t.second || '#222222', accent: t.accent, fg: readable(t.second || '#222222')}); persist(); cmpRender(); }
function cmpDelColor(cid, i) { const c = cmpOf(curProject(), cid); if (c.bank.col.length <= 1) return; c.bank.col.splice(i, 1); c.pieces.forEach(q => { if (q.col >= c.bank.col.length) q.col = 0; }); persist(); cmpRender(); }
function cmpImgModal(cid) {
  const c = cmpOf(curProject(), cid), L = libList();
  showModal('Imagens da campanha', L.length ? `<p class="muted" style="font-size:12.5px;margin-top:0">Escolha até 12 imagens da Biblioteca.</p><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px;max-height:340px;overflow:auto">${L.map(i => `<label style="cursor:pointer;font-size:11px"><input type="checkbox" class="cmpIm" value="${esc(i.imgId)}" ${c.bank.img.includes(i.imgId) ? 'checked' : ''}><img data-lib="${esc(i.imgId)}" alt="" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:6px;display:block"></label>`).join('')}</div><div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="cmpImgSave('${cid}')">Usar estas</button></div>` : '<p>A Biblioteca ainda está vazia. Suba ou gere imagens em Biblioteca de imagens.</p><div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button></div>');
  if (typeof libFill === 'function') libFill($('modalBox'));
}
function cmpImgSave(cid) { const c = cmpOf(curProject(), cid); c.bank.img = [...document.querySelectorAll('.cmpIm:checked')].map(x => x.value).slice(0, 12); persist(); closeModal(); cmpRender(); }
async function cmpAI(cid) {
  if (!aiReady()) { toast('IA não configurada. Veja Integrações. Os textos atuais continuam editáveis.'); return; }
  const p = curProject(), c = cmpOf(p, cid), nt = c.notes.slice(0, 20).map(n => `[${CMP_KIND_LABEL[n.kind]}] ${n.text}`).join('\n');
  try { toast('Escrevendo…'); const j = await aiJSON('Escreva textos de anúncios do Meta em PT-BR, curtos e diretos, seguindo o Voice Brain. Sem promessas absolutas, sem inventar dados, preço ou resultado: use [CONFIRMAR] quando faltar informação. Parta de dores, dúvidas, desejos e urgências ocultas do público. As fases da jornada e seus gatilhos: Descoberta (identificação), Atração (aspiração), Consideração (segurança), Ação (momento uau), Apologia (identidade). Responda só JSON: {"h":[{"t":"dor|duvida|desejo|urgencia","x":"headline (até 60 caracteres)"}],"s":["frase de apoio"],"c":["CTA curto"]} com 8 headlines (2 de cada tipo), 3 apoios e 3 CTAs.', projectContext(p) + '\nObjetivo da campanha: ' + c.objective + '\nPúblico: ' + c.audience + (nt ? '\nNotas e comentários reais do público:\n' + nt : ''));
    const take = (a, m, len) => (Array.isArray(a) ? a : []).map(x => String(x).trim()).filter(x => x && x.length <= len).slice(0, m);
    const hs = (Array.isArray(j.h) ? j.h : []).map(x => typeof x === 'string' ? {t: '', x} : {t: CMP_KINDS.includes(x && x.t) ? x.t : '', x: String((x && x.x) || '').trim()}).filter(x => x.x && x.x.length <= 120).slice(0, 8);
    const seen = new Set(c.bank.h), nh = [], nk = []; hs.forEach(x => { if (!seen.has(x.x)) { seen.add(x.x); nh.push(x.x); nk.push(x.t); } });
    c.bank.h = [...nh, ...c.bank.h].slice(0, 12); c.bank.ht = [...nk, ...c.bank.ht].slice(0, 12);
    if (j.s) c.bank.s = [...new Set([...take(j.s, 4, 160), ...c.bank.s])].slice(0, 12); if (j.c) c.bank.c = [...new Set([...take(j.c, 4, 60), ...c.bank.c])].slice(0, 12);
    spendCredits(1); persist(); cmpRender(); toast('Bancos atualizados. As peças já criadas não mudam sozinhas: use a faixa de variações.'); } catch (e) { toast('IA: ' + e.message); }
}

/* ---------- caderno de ideias da campanha: comentários reais, dores, dúvidas, desejos, urgências e ideias soltas ---------- */
const cmpNoteUI = {filter: 'todas', kind: 'ideia'};
function cmpNoteAdd(cid) {
  const c = cmpOf(curProject(), cid), t = $('cnText').value, src = $('cnSrc').value.trim(), kind = $('cnKind').value, many = $('cnMany').checked;
  const L = (many ? t.split('\n') : [t]).map(x => x.trim()).filter(Boolean); if (!L.length) { toast('Escreva alguma coisa.'); return; }
  L.slice(0, 100).forEach(x => c.notes.unshift({id: uid('nt'), kind, text: x.slice(0, 1500), src: src.slice(0, 200), pin: false, created: new Date().toISOString()}));
  c.notes = c.notes.slice(0, 300); cmpNoteUI.kind = kind; persist(); cmpRender(); toast(L.length + ' nota(s) salva(s).');
}
function cmpNoteSet(cid, nid, k, v) { const n = cmpOf(curProject(), cid).notes.find(x => x.id === nid); if (!n) return; if (k === 'pin') n.pin = !n.pin; else n[k] = String(v).slice(0, k === 'text' ? 1500 : 200); persist(); if (k === 'pin' || k === 'kind') cmpRender(); }
function cmpNoteDel(cid, nid) { const c = cmpOf(curProject(), cid); c.notes = c.notes.filter(x => x.id !== nid); persist(); cmpRender(); }
function cmpNoteTo(cid, nid, to) {
  const p = curProject(), c = cmpOf(p, cid), n = c.notes.find(x => x.id === nid); if (!n) return; const t = n.text.trim();
  if (to === 'bank' && CMP_KINDS.includes(n.kind)) { if (!c.bank[n.kind].includes(t) && c.bank[n.kind].length < 20) c.bank[n.kind].push(t); toast('Foi para o banco de ' + CMP_KIND_PL[n.kind].toLowerCase() + '.'); }
  else if (to === 'head') { if (t.length > 120) { toast('Para headline o texto precisa ter até 120 caracteres.'); return; } if (!c.bank.h.includes(t) && c.bank.h.length < 30) { c.bank.h.push(t); c.bank.ht.length = c.bank.h.length - 1; c.bank.ht.push(CMP_KINDS.includes(n.kind) ? n.kind : ''); } toast('Entrou nas headlines. Use a faixa de variações da peça.'); }
  else if (to === 'piece') { cmpNotePiece(cid, nid); return; }
  persist(); cmpRender();
}
async function cmpNotePiece(cid, nid) {
  const p = curProject(), c = cmpOf(p, cid), n = c.notes.find(x => x.id === nid); if (!n || c.pieces.length >= 100) return; const t = n.text.trim().slice(0, 120), st = cmpUI.phase, k = c.pieces.filter(x => x.stage === st).length;
  const q = cmpNewPiece(c, st, k, {h: t, t: CMP_KINDS.includes(n.kind) ? n.kind : ''}, c.pieces.length); q.name = `${CMP_STAGE_NAME[st]} · Anúncio ${k + 1} (da nota)`; c.pieces.push(q); cmpUI.busy = true; cmpUI.tab = 'pecas'; cmpRender();
  try { await cmpBuildPiece(p, c, q); } finally { cmpUI.busy = false; } persist(); cmpRender(); toast('Anúncio criado a partir da nota, nas 3 medidas, na fase ' + CMP_STAGE_NAME[st] + '.');
}
function cmpNotesHTML(c) {
  const f = cmpNoteUI.filter, kinds = ['todas', ...CMP_NOTE_KINDS], list = c.notes.filter(n => f === 'todas' || n.kind === f).sort((a, b) => (b.pin - a.pin) || (b.created > a.created ? 1 : -1));
  const kopt = sel => CMP_NOTE_KINDS.map(k => `<option value="${k}" ${k === sel ? 'selected' : ''}>${CMP_KIND_LABEL[k]}</option>`).join('');
  return `<div class="panel" style="margin-top:12px"><p class="muted" style="font-size:12.5px;margin-top:0">Bloco de notas da campanha: cole comentários reais do público, anote dores, dúvidas, desejos, urgências ocultas e ideias soltas. Depois mande a nota para o banco, para as headlines ou para uma peça nova.</p>
  <div class="form-grid"><div class="field full"><textarea id="cnText" rows="3" placeholder="Escreva ou cole aqui. Com a caixa abaixo marcada, cada linha vira uma nota." onkeydown="if(event.key==='Enter'&&(event.ctrlKey||event.metaKey))cmpNoteAdd('${c.id}')"></textarea></div>
  <div class="field"><label>Tipo</label><select id="cnKind">${kopt(cmpNoteUI.kind)}</select></div><div class="field"><label>De onde veio (opcional)</label><input id="cnSrc" placeholder="Ex.: comentário no Instagram, conversa no WhatsApp"></div></div>
  <div class="row-gap" style="align-items:center;margin:6px 0"><label style="font-size:12.5px"><input type="checkbox" id="cnMany" checked> cada linha é uma nota</label><button class="btn sm dark" onclick="cmpNoteAdd('${c.id}')">Salvar (Ctrl+Enter)</button></div>
  <p class="muted" style="font-size:11.5px;margin:4px 0">Cuidado com dados pessoais: guarde só o texto do comentário, sem nome, telefone ou documento de ninguém.</p></div>
  <div class="edh-tabs" style="margin-top:10px">${kinds.map(k => `<button class="edh-tab ${f === k ? 'on' : ''}" onclick="cmpNoteUI.filter='${k}';cmpRender()">${k === 'todas' ? 'Todas' : CMP_KIND_LABEL[k]}${k === 'todas' ? '' : ' (' + c.notes.filter(n => n.kind === k).length + ')'}</button>`).join('')}</div>
  ${list.length ? list.map(n => `<div class="panel cmp-note"><div class="row-gap" style="align-items:center;flex-wrap:wrap"><i class="cmp-dot" style="background:${CMP_KIND_COLOR[n.kind]}"></i><select onchange="cmpNoteSet('${c.id}','${n.id}','kind',this.value)">${kopt(n.kind)}</select><input style="flex:1;min-width:140px" value="${esc(n.src)}" placeholder="origem" onchange="cmpNoteSet('${c.id}','${n.id}','src',this.value)"><button class="btn sm" title="Fixar no topo" onclick="cmpNoteSet('${c.id}','${n.id}','pin')">${n.pin ? '★' : '☆'}</button><button class="btn sm" onclick="cmpNoteDel('${c.id}','${n.id}')">×</button></div>
  <textarea rows="2" style="width:100%;margin-top:6px" onchange="cmpNoteSet('${c.id}','${n.id}','text',this.value)">${esc(n.text)}</textarea>
  <div class="row-gap" style="margin-top:6px;flex-wrap:wrap">${CMP_KINDS.includes(n.kind) ? `<button class="btn sm" onclick="cmpNoteTo('${c.id}','${n.id}','bank')">→ banco de ${CMP_KIND_PL[n.kind].toLowerCase()}</button>` : ''}<button class="btn sm" onclick="cmpNoteTo('${c.id}','${n.id}','head')">→ headline</button><button class="btn sm" onclick="cmpNoteTo('${c.id}','${n.id}','piece')">→ nova peça</button></div></div>`).join('') : '<p class="muted" style="margin-top:12px">Nenhuma nota aqui ainda.</p>'}`;
}

/* ---------- peças ---------- */
async function cmpAddPiece(cid) {
  const p = curProject(), c = cmpOf(p, cid); if (c.pieces.length >= 100) return; const st = cmpUI.phase, k = c.pieces.filter(x => x.stage === st).length;
  const q = cmpNewPiece(c, st, k, cmpPickHead(c, st, k, new Set(c.pieces.map(x => x.h))), c.pieces.length); c.pieces.push(q); cmpUI.busy = true; cmpRender();
  try { await cmpBuildPiece(p, c, q); } finally { cmpUI.busy = false; } persist(); cmpRender();
}
function cmpStage(cid, pid, v) { const q = cmpOf(curProject(), cid).pieces.find(x => x.id === pid); if (!CMP_STAGES5.includes(v)) return; q.stage = v; persist(); cmpRender(); }
function cmpDelPiece(cid, pid) {
  const p = curProject(), c = cmpOf(p, cid), q = c.pieces.find(x => x.id === pid); if (!q || !confirm('Excluir esta peça e as suas medidas?')) return;
  const ids = new Set(Object.values(q.sets)); p.design.sets = p.design.sets.filter(s => !ids.has(s.id)); c.pieces = c.pieces.filter(x => x.id !== pid); persist(); cmpRender();
}
async function cmpMeasure(cid, pid, k, on) {
  const p = curProject(), c = cmpOf(p, cid), q = c.pieces.find(x => x.id === pid); if (k === 'feed') return; q.on[k] = on;
  if (!on) { p.design.sets = p.design.sets.filter(s => s.id !== q.sets[k]); q.sets[k] = ''; q.lock[k] = false; } else { q.lock[k] = false; await cmpBuildPiece(p, c, q); }
  persist(); cmpRender();
}
function cmpLock(cid, pid, k, on) { const q = cmpOf(curProject(), cid).pieces.find(x => x.id === pid); q.lock[k] = on; persist(); if (!on) cmpRedo(cid, pid, k); }
async function cmpRedo(cid, pid, k) { const p = curProject(), c = cmpOf(p, cid), q = c.pieces.find(x => x.id === pid), m = cmpSetOf(p, q.sets.feed); if (!m) return; q.lock[k] = false; await ensureSetResources(m); cmpAssign(p, q, k, cmpResize(m, k, c), c); q.syncedAt = new Date(Date.now() + 1).toISOString(); persist(); cmpRender(); }
function cmpStatus(cid, pid, v) { const q = cmpOf(curProject(), cid).pieces.find(x => x.id === pid); q.status = v; persist(); }
function cmpEdit(setId) { go('design'); dzOpen(setId); }
function cmpDel(cid) { const p = curProject(), c = cmpOf(p, cid); if (!c || !confirm('Excluir a campanha? As artes criadas continuam na biblioteca de design.')) return; p.campaigns = p.campaigns.filter(x => x.id !== cid); cmpUI.id = ''; persist(); cmpRender(); }
function cmpPkg(cid) { const p = curProject(), c = cmpOf(p, cid); pkgOpen({sets: c.pieces.flatMap(q => Object.values(q.sets)).filter(Boolean)}); }
async function cmpZip(cid) {
  const p = curProject(), c = cmpOf(p, cid), files = [], enc = new TextEncoder(); toast('Gerando as artes…');
  for (const q of c.pieces) for (const k of CMP_MEASURES) { const s = cmpSetOf(p, q.sets[k]); if (!q.on[k] || !s) continue; await ensureSetResources(s); files.push({name: `${CMP_STAGE_LABEL[q.stage].replace(/ · /, '-').toLowerCase()}/${k}/${slug(q.name)}-${s.format.w}x${s.format.h}.png`, data: new Uint8Array(await (await slideBlob(s, s.slides[0])).arrayBuffer())}); }
  if (!files.length) { toast('Nenhuma arte para exportar.'); return; }
  files.push({name: 'LEIA-ME.txt', data: enc.encode(`Campanha: ${c.name}\nPastas por fase da jornada e, dentro, por medida: feed (${CMP_MFMT(c).feed.w}x${CMP_MFMT(c).feed.h}), vertical (1080x1920) e horizontal (1200x628).\nNo vertical o texto fica fora das faixas que o Meta cobre (topo e rodapé). Confira as medidas atuais no Gerenciador de Anúncios antes de subir.\n`)});
  download(`${slug(c.name)}-artes.zip`, makeZip(files), 'application/zip'); toast(`${files.length - 1} arte(s) exportadas, separadas por medida.`);
}

/* ---------- tela ---------- */
function cmpPaint(root) {
  const p = curProject(); root.querySelectorAll('canvas[data-cmp]').forEach(async cv => { const s = cmpSetOf(p, cv.dataset.cmp); if (!s) return; try { await ensureSetResources(s); if (cv.isConnected) renderSlide(cv.getContext('2d'), s.slides[0], s.format.w, s.format.h, cv.width / s.format.w); } catch (e) { /* sem imagem */ } });
  if (typeof libFill === 'function') libFill(root);
}
function cmpPieceHTML(p, c, q) {
  const fm = CMP_MFMT(c), b = c.bank, H = 150;
  const chips = (field, list, cur, fmt) => list.length ? `<div class="cmp-row"><span class="cmp-lb">${fmt[0]}</span>${list.map((t, i) => { const kd = field === 'h' ? (c.bank.ht[i] || '') : ''; return `<button class="cmp-chip ${t === cur ? 'on' : ''}" title="${esc((kd ? CMP_KIND_LABEL[kd] + ': ' : '') + t)}" onclick="cmpPick('${c.id}','${q.id}','${field}',${i})">${kd ? `<i class="cmp-dot" style="background:${CMP_KIND_COLOR[kd]}"></i>` : ''}${esc(String(t).slice(0, 34))}</button>`; }).join('')}</div>` : '';
  const arts = CMP_MEASURES.map(k => { const s = cmpSetOf(p, q.sets[k]), f = fm[k], w = Math.round(H * f.w / f.h);
    return `<div class="cmp-art"><div class="cmp-top"><b>${CMP_MLABEL[k]}</b><small class="muted">${f.w}×${f.h}</small>${k === 'feed' ? '<span class="cmp-tag">matriz</span>' : `<label title="Desligue para não gerar esta medida"><input type="checkbox" ${q.on[k] ? 'checked' : ''} onchange="cmpMeasure('${c.id}','${q.id}','${k}',this.checked)"> usar</label>`}</div>
    ${q.on[k] && s ? `<canvas data-cmp="${s.id}" width="${w * 2}" height="${H * 2}" style="width:${w}px;height:${H}px" onclick="cmpEdit('${s.id}')" title="Abrir no editor"></canvas>` : `<div class="cmp-off" style="width:${w}px;height:${H}px">${q.on[k] ? 'gerando…' : 'desligada'}</div>`}
    ${k !== 'feed' && q.on[k] && s ? `<label class="cmp-lock"><input type="checkbox" ${q.lock[k] ? 'checked' : ''} onchange="cmpLock('${c.id}','${q.id}','${k}',this.checked)"> ${q.lock[k] ? 'travada: ajustada à mão, não refaz' : 'travar (segue a matriz até você ajustar)'}</label>` : ''}</div>`; }).join('');
  const cols = b.col.length ? `<div class="cmp-row"><span class="cmp-lb">Cor</span>${b.col.map((v, i) => `<button class="cmp-sw ${q.col === i ? 'on' : ''}" title="${esc(v.name)}" style="background:linear-gradient(135deg,${v.bg} 55%,${v.accent} 55%)" onclick="cmpPick('${c.id}','${q.id}','col',${i})"></button>`).join('')}</div>` : '';
  const imgs = b.img.length ? `<div class="cmp-row"><span class="cmp-lb">Imagem</span>${b.img.map((id, i) => `<button class="cmp-im ${q.imgId === id ? 'on' : ''}" onclick="cmpPick('${c.id}','${q.id}','img',${i})"><img data-lib="${esc(id)}" alt=""></button>`).join('')}</div>` : '';
  return `<div class="panel cmp-piece"><div class="section-row"><div><strong>${esc(q.name)}</strong> <small class="muted">gatilho: ${CMP_STAGE_GATILHO[q.stage]}</small></div><div class="row-gap"><select title="Fase da jornada" onchange="cmpStage('${c.id}','${q.id}',this.value)">${CMP_STAGES5.map(k => `<option value="${k}" ${k === q.stage ? 'selected' : ''}>${CMP_STAGE_LABEL[k]}</option>`).join('')}</select><select onchange="cmpStatus('${c.id}','${q.id}',this.value)">${['Rascunho', 'Em revisão', 'Aprovada', 'No ar'].map(s => `<option ${s === q.status ? 'selected' : ''}>${s}</option>`).join('')}</select><button class="btn sm" onclick="cmpDelPiece('${c.id}','${q.id}')">Excluir</button></div></div>
    <div class="cmp-arts">${arts}</div>
    <div class="cmp-var"><div class="muted" style="font-size:11.5px;margin-bottom:4px">Faixa de variações: um clique troca nas 3 medidas</div>${chips('h', b.h, q.h, ['Headline'])}${chips('s', b.s, q.s, ['Apoio'])}${chips('btn', b.c, q.btn, ['CTA'])}${imgs}${cols}</div></div>`;
}
function cmpDetailHTML(p, c) {
  const on = c.pieces.reduce((n, q) => n + CMP_MEASURES.filter(k => q.on[k]).length, 0), tab = cmpUI.tab;
  const tabs = [['pecas', 'Peças'], ['bancos', 'Bancos de variações'], ['caderno', `Caderno de ideias (${c.notes.length})`], ['teste', 'Plano de teste']];
  const comb = Math.max(1, c.bank.h.length) * Math.max(1, c.bank.img.length) * Math.max(1, c.bank.col.length) * Math.max(1, c.bank.c.length);
  let body = '';
  if (tab === 'pecas') body = `<div class="panel" style="margin-top:12px"><h3 style="margin-top:0">Layout da campanha</h3><div class="row-gap" style="flex-wrap:wrap;align-items:center"><label class="muted" style="font-size:12.5px">Foto <select onchange="cmpField('${c.id}','layout',this.value)">${[['auto', 'Automático'], ['full', 'Foto no fundo'], ['top', 'Foto no topo'], ['bottom', 'Foto embaixo'], ['none', 'Sem foto']].map(([v, l]) => `<option value="${v}" ${c.layout === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label><label class="muted" style="font-size:12.5px">Texto <select onchange="cmpField('${c.id}','align',this.value)"><option value="left" ${c.align === 'left' ? 'selected' : ''}>À esquerda</option><option value="center" ${c.align === 'center' ? 'selected' : ''}>Centralizado</option></select></label><button class="btn sm dark" onclick="cmpRelayout('${c.id}')">Aplicar a todas as peças</button></div><p class="muted" style="font-size:11.5px;margin:8px 0 0">Mudou o texto, a foto ou a cor da matriz (feed) no editor? As outras medidas se refazem sozinhas ao voltar aqui. Posições arrastadas à mão numa medida não passam para as outras; para isso o Studio refaz o layout a partir do texto e da foto.</p></div><div class="edh-tabs" style="margin-top:12px">${CMP_STAGES5.map(k => `<button class="edh-tab ${cmpUI.phase === k ? 'on' : ''}" onclick="cmpUI.phase='${k}';cmpRender()">${CMP_STAGE_LABEL[k]} (${c.pieces.filter(q => q.stage === k).length})</button>`).join('')}</div><p class="muted" style="font-size:12.5px;margin:8px 0 0"><b>${CMP_STAGE_NAME[cmpUI.phase]} · "${CMP_STAGE_EU[cmpUI.phase]}"</b> · gatilho fixo: <b>${CMP_STAGE_GATILHO[cmpUI.phase]}</b>. ${CMP_STAGE_DESC[cmpUI.phase]} Foco em ${CMP_STAGE_KINDS[cmpUI.phase].map(k => CMP_KIND_PL[k].toLowerCase()).join(' e ')}.</p>${c.pieces.filter(q => q.stage === cmpUI.phase).map(q => cmpPieceHTML(p, c, q)).join('') || '<p class="muted">Nenhum anúncio nesta fase.</p>'}<div style="margin:12px 0"><button class="btn" onclick="cmpAddPiece('${c.id}')">＋ Adicionar anúncio nesta fase (+3 medidas)</button></div>`;
  else if (tab === 'bancos') body = `<div class="panel" style="margin-top:12px"><p class="muted" style="font-size:12.5px;margin-top:0">Uma opção por linha. Estas listas alimentam a faixa de variações de cada peça. Hoje: <b>${comb}</b> combinações possíveis (headlines × imagens × cores × CTAs).</p>
    <h4 style="margin:6px 0">Matéria-prima do público</h4><p class="muted" style="font-size:12px;margin:0 0 6px">Vem do pré-projeto e do caderno. Dê um clique em "Montar headlines" para gerar as headlines a partir destas quatro listas.</p><div class="form-grid">${CMP_KINDS.map(k => `<div class="field"><label><i class="cmp-dot" style="background:${CMP_KIND_COLOR[k]}"></i>${CMP_KIND_PL[k]} <small class="muted">· ${CMP_KIND_HINT[k]}</small></label><textarea rows="4" onchange="cmpBank('${c.id}','${k}',this.value)">${esc(c.bank[k].join('\n'))}</textarea></div>`).join('')}</div><div class="row-gap" style="margin:6px 0 12px"><button class="btn sm dark" onclick="cmpRebuildHeads('${c.id}')">Montar headlines a partir destas listas</button></div>
    <div class="form-grid"><div class="field full"><label>Headlines (uma por linha)</label><textarea rows="5" onchange="cmpBank('${c.id}','h',this.value)">${esc(c.bank.h.join('\n'))}</textarea></div><div class="field full"><label>Frases de apoio</label><textarea rows="4" onchange="cmpBank('${c.id}','s',this.value)">${esc(c.bank.s.join('\n'))}</textarea></div><div class="field full"><label>CTAs (texto do botão)</label><textarea rows="3" onchange="cmpBank('${c.id}','c',this.value)">${esc(c.bank.c.join('\n'))}</textarea></div></div>
    <div class="row-gap" style="margin:8px 0"><button class="btn sm" onclick="cmpImgModal('${c.id}')">Escolher imagens da Biblioteca (${c.bank.img.length})</button><button class="btn sm" onclick="cmpAI('${c.id}')" title="Usa 1 crédito">✨ Escrever com IA</button></div>
    <h4 style="margin:12px 0 6px">Cores</h4>${c.bank.col.map((v, i) => `<div class="row-gap" style="margin:4px 0;align-items:center"><input value="${esc(v.name)}" style="width:110px" onchange="cmpColor('${c.id}',${i},'name',this.value)"><label class="muted" style="font-size:12px">Fundo <input type="color" value="${v.bg}" onchange="cmpColor('${c.id}',${i},'bg',this.value)"></label><label class="muted" style="font-size:12px">Destaque <input type="color" value="${v.accent}" onchange="cmpColor('${c.id}',${i},'accent',this.value)"></label><label class="muted" style="font-size:12px">Texto <input type="color" value="${v.fg}" onchange="cmpColor('${c.id}',${i},'fg',this.value)"></label><button class="btn sm" onclick="cmpDelColor('${c.id}',${i})">×</button></div>`).join('')}<button class="btn sm" onclick="cmpAddColor('${c.id}')">＋ Cor</button>
    <p class="muted" style="font-size:11.5px">Mudou um banco? As peças já criadas ficam como estão. Escolha na faixa de cada peça o que quer usar.</p></div>`;
  else if (tab === 'caderno') body = cmpNotesHTML(c);
  else body = `<div class="panel" style="margin-top:12px"><p class="muted" style="font-size:12.5px;margin-top:0">Sugestões em 3 camadas. Edite à vontade.</p><div class="form-grid">${[['macro', 'Macroteste (ângulo)'], ['micro', 'Microteste (imagem, cor, CTA)'], ['format', 'Teste de formato'], ['notes', 'Anotações e resultados']].map(([k, l]) => `<div class="field full"><label>${l}</label><textarea rows="3" onchange="cmpTest('${c.id}','${k}',this.value)">${esc(c.test[k])}</textarea></div>`).join('')}</div></div>`;
  return `<div class="section-row" style="margin-bottom:6px"><button class="btn sm" onclick="cmpUI.id='';cmpRender()">← Campanhas</button><div class="row-gap"><button class="btn sm" onclick="cmpZip('${c.id}')">⬇ Baixar artes (por medida)</button><button class="btn sm" onclick="cmpPkg('${c.id}')">📦 Pacote</button><button class="btn sm" onclick="cmpDel('${c.id}')">Excluir</button></div></div>
  <div class="panel"><div class="form-grid"><div class="field"><label>Nome</label><input value="${esc(c.name)}" onchange="cmpField('${c.id}','name',this.value)"></div><div class="field"><label>Objetivo</label><input value="${esc(c.objective)}" onchange="cmpField('${c.id}','objective',this.value)"></div><div class="field"><label>Período</label><input value="${esc(c.period)}" placeholder="Ex.: 01/03 a 31/03" onchange="cmpField('${c.id}','period',this.value)"></div><div class="field"><label>Orçamento por dia (R$)</label><input type="number" min="0" value="${c.budget || ''}" onchange="cmpField('${c.id}','budget',this.value)"></div><div class="field full"><label>Público</label><input value="${esc(c.audience)}" onchange="cmpField('${c.id}','audience',this.value)"></div></div>
  <div class="cards" style="margin-top:12px"><div class="card"><div class="label">Anúncios (5 fases)</div><div class="metric">${c.pieces.length}</div></div><div class="card"><div class="label">Artes (peças × medidas)</div><div class="metric">${on}</div></div><div class="card"><div class="label">Aprovadas</div><div class="metric">${c.pieces.filter(q => q.status === 'Aprovada' || q.status === 'No ar').length}</div></div></div></div>
  <div class="edh-tabs" style="margin-top:12px">${tabs.map(([k, l]) => `<button class="edh-tab ${tab === k ? 'on' : ''}" onclick="cmpUI.tab='${k}';cmpRender()">${l}</button>`).join('')}</div>${cmpUI.busy ? '<p class="muted">Montando as artes…</p>' : ''}${body}`;
}
function campaignsHTML(p) {
  const c = cmpUI.id && cmpOf(p, cmpUI.id);
  if (c) return `<div id="cmpDetail">${cmpDetailHTML(p, c)}</div>`;
  return `<div class="panel"><div class="section-row"><div><h2 style="margin:0">Campanhas</h2><small class="muted">Cada peça sai em 3 medidas do Meta: feed, vertical e horizontal.</small></div><button class="btn dark" onclick="cmpNewModal()">＋ Nova campanha</button></div>
  ${p.campaigns.length ? `<div class="list" style="margin-top:10px">${p.campaigns.map(x => { const n = x.pieces.reduce((a, q) => a + CMP_MEASURES.filter(k => q.on[k]).length, 0); return `<div class="list-item"><div><strong>${esc(x.name)}</strong><small>${esc(x.channel)} · ${esc(x.objective)} · ${x.pieces.length} peça(s) · ${n} arte(s)${x.budget ? ' · ' + fmtMoney(x.budget) + '/dia' : ''}</small></div><div class="row-gap"><button class="btn sm dark" onclick="cmpUI.id='${x.id}';cmpUI.tab='pecas';cmpRender()">${x.pieces.length ? 'Abrir' : 'Gerar peças'}</button><button class="btn sm" onclick="deleteCampaign('${x.id}')">Excluir</button></div></div>`; }).join('')}</div>` : '<p class="muted" style="margin-top:12px">Nenhuma campanha ainda. Crie uma: ela já nasce preenchida com o que o pré-projeto sabe, e cada peça sai nas 3 medidas.</p>'}</div>`;
}
function renderCampaignsPage() {
  const p = curProject(), r = $('campaignsRoot'); if (!p) { r.innerHTML = noProject('Campanhas'); return; }
  r.innerHTML = hubHead('Campanhas', 'Um pacote de peças por campanha: bancos de variações, 3 medidas do Meta e plano de teste.', '') + campaignsHTML(p);
  cmpAfter(p, r);
}
async function cmpAfter(p, root) {
  const c = cmpUI.id && cmpOf(p, cmpUI.id);
  if (c && c.pieces.length && !cmpUI.busy) { let ch = false; try { ch = await cmpAutoSync(p, c); } catch (e) { /* mantém */ } const d = $('cmpDetail'); if (ch && d) d.innerHTML = cmpDetailHTML(p, c); }
  cmpPaint(root);
}
