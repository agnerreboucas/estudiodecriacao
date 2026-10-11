/* ===== Briefing do cliente no Studio: criar o link, acompanhar o status, importar as respostas (empresa, público, produtos e serviços, voz) e baixar a planilha ===== */
const BFX = {busy: '', answers: null};
const bfStore = p => { if (!p.bf || typeof p.bf !== 'object') p.bf = {}; return Object.assign(p.bf, {t: p.bf.t || '', name: p.bf.name || '', createdAt: p.bf.createdAt || '', importedAt: p.bf.importedAt || '', status: p.bf.status || '', submittedAt: p.bf.submittedAt || '', updatedAt: p.bf.updatedAt || '', text: p.bf.text || '', prev: p.bf.prev || {}}); };
const bfURL = t => location.origin + location.pathname.replace(/[^/]*$/, '') + 'briefing.html?t=' + t;
const bfLines = v => String(v || '').split(/\n+/).map(x => x.replace(/^[\s\-•*\d.)]+/, '').trim()).filter(Boolean);
function briefingPanel(p) {
  const b = bfStore(p), head = `<h3 style="margin:0">📋 Briefing do cliente</h3>`;
  const goog = `<div class="row-gap" style="flex-wrap:wrap;margin-top:8px"><span class="muted" style="font-size:12.5px">Ou pelo Google Forms:</span><button class="btn sm" onclick="bfScriptOpen()">Criar o formulário no Google Forms</button><button class="btn sm" onclick="bfgOpen()">⇣ Importar respostas (CSV)</button></div>${b.source === 'google' && b.importedAt ? `<small class="muted block" style="margin-top:6px">Importado do Google Forms em ${esc(fmtDateTime(b.importedAt))}. <a href="#" onclick="bfView();return false">Ver respostas</a></small>` : ''}`;
  const wrap = body => `${typeof docCard === 'function' ? docCard(p) : ''}<div class="jp-panel">${body}${goog}</div>`;
  if (typeof API === 'undefined' || !API.available) return wrap(`<div class="section-row"><div>${head}<p class="sub" style="margin:2px 0 0">O cliente preenche um formulário e as respostas chegam aqui. Para receber pelo link, o Studio precisa estar no servidor (Hostinger). Neste arquivo local você pode usar o Google Forms e importar as respostas.</p></div></div>`);
  if (typeof needsLogin === 'function' && needsLogin()) return wrap(`<div class="section-row"><div>${head}<p class="sub" style="margin:2px 0 0">Entre no Studio para criar o link do briefing.</p></div><button class="btn dark" onclick="showLogin()">Entrar</button></div>`);
  if (!b.t) return wrap(`<div class="section-row"><div>${head}<p class="sub" style="margin:2px 0 0">Um formulário completo sobre a empresa, o público e cada produto ou serviço. O cliente preenche pelo link (pode salvar e voltar depois), você recebe por e-mail e planilha, e importa tudo para o projeto. A IA usa isso para criar anúncios, posts e as copies das landing pages.</p></div><button class="btn dark" onclick="bfCreate()" ${BFX.busy ? 'disabled' : ''}>Criar link do briefing</button></div>`);
  const url = bfURL(b.t), st = b.status === 'enviado' ? `<span class="so-badge" style="margin:0;background:#e9f7ee;color:#176b30">Enviado${b.submittedAt ? ' em ' + esc(fmtDateTime(b.submittedAt)) : ''}</span>` : b.updatedAt ? `<span class="so-badge" style="margin:0">Preenchendo (salvo ${esc(fmtDateTime(b.updatedAt))})</span>` : `<span class="so-badge" style="margin:0">Aguardando o cliente</span>`;
  const msg = encodeURIComponent(`Olá! Para eu montar o seu projeto de marketing, preciso conhecer melhor a empresa e os produtos/serviços. Pode preencher este formulário (leva uns 20 minutos e salva sozinho): ${url}`);
  return wrap(`<div class="section-row"><div>${head}<p class="sub" style="margin:2px 0 0">Status: ${st}${b.importedAt ? ` · importado em ${esc(fmtDateTime(b.importedAt))}` : ''}</p></div><div class="row-gap" style="flex-wrap:wrap"><button class="btn sm" onclick="bfRefresh()">↻ Atualizar</button><button class="btn sm dark" onclick="bfImport()" ${b.updatedAt || b.status === 'enviado' ? '' : 'disabled'}>⇣ Importar respostas</button></div></div>
    <div class="row-gap" style="flex-wrap:wrap;margin-top:8px"><input readonly value="${esc(url)}" style="flex:1;min-width:240px" onclick="this.select()"><button class="btn sm" onclick="bfCopy()">Copiar</button><a class="btn sm" href="https://wa.me/?text=${msg}" target="_blank" rel="noopener">Enviar por WhatsApp</a><a class="btn sm" href="${esc(url)}" target="_blank" rel="noopener">Abrir</a></div>
    <div class="row-gap" style="flex-wrap:wrap;margin-top:8px"><button class="btn sm" onclick="bfView()">Ver respostas</button><button class="btn sm" onclick="bfCsv()">⬇ Planilha (CSV)</button><button class="btn sm" onclick="bfRevoke()">Desativar link</button></div>
    <small class="muted block" style="margin-top:6px">Quando o cliente enviar, os e-mails do gestor (Configurações → Integrações → Distribuição de leads) recebem um aviso e a planilha conectada recebe as respostas.</small>`);
}
function bfRerender() { if (ui.page === 'project' && ui.tab === 'preproject' && typeof renderPre === 'function') keepScroll(renderPre); }
async function bfCreate() {
  const p = curProject(); BFX.busy = 'c';
  try { const j = await api('briefing.php', {method: 'POST', body: {action: 'create', project: p.id, name: p.client || p.name}}); const b = bfStore(p); Object.assign(b, {t: j.t, name: p.client || p.name, createdAt: new Date().toISOString(), status: 'rascunho', submittedAt: '', updatedAt: '', importedAt: ''}); persist(); toast('Link criado. Copie e envie ao cliente.'); }
  catch (e) { toast(e.message); } BFX.busy = ''; bfRerender();
}
async function bfFetch() { const b = bfStore(curProject()); const j = await api('briefing.php', {method: 'POST', body: {action: 'get', t: b.t}}); return j.record; }
async function bfRefresh() {
  const p = curProject(), b = bfStore(p); try { const r = await bfFetch(); b.status = r.status || 'rascunho'; b.submittedAt = r.submittedAt || ''; b.updatedAt = r.updatedAt || ''; BFX.answers = r.answers || {}; persist(); toast(r.status === 'enviado' ? 'O cliente já enviou o briefing.' : r.updatedAt ? 'O cliente está preenchendo.' : 'Ainda sem respostas.'); } catch (e) { toast(e.message); } bfRerender();
}
function bfCopy() { const t = bfURL(bfStore(curProject()).t); try { navigator.clipboard.writeText(t); toast('Link copiado.'); } catch (e) { prompt('Copie o link:', t); } }
async function bfRevoke() {
  if (!confirm('Desativar este link? O cliente não conseguirá mais abrir o formulário (as respostas já recebidas continuam no servidor).')) return; const p = curProject(), b = bfStore(p);
  try { await api('briefing.php', {method: 'POST', body: {action: 'revoke', t: b.t}}); } catch (e) { toast(e.message); return; } b.t = ''; b.status = ''; persist(); bfRerender();
}
async function bfView() { try { const b = bfStore(curProject()); const r = b.t ? await bfFetch() : {answers: b.answers || {}}; showModal('Respostas do briefing', `<pre style="white-space:pre-wrap;max-height:60vh;overflow:auto;font:13px/1.5 system-ui">${esc(bfText(r.answers, curProject().name))}</pre><div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button></div>`); $('modalBox').classList.add('wide'); } catch (e) { toast(e.message); } }
async function bfCsv() {
  try { const b = bfStore(curProject()); const r = b.t ? await bfFetch() : {answers: b.answers || {}}, q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; download('briefing-' + slug(curProject().name) + '.csv', '﻿' + bfRows(r.answers).map(x => x.map(q).join(',')).join('\r\n'), 'text/csv'); } catch (e) { toast(e.message); }
}
/* respostas → projeto: ficha, voz, produtos e serviços (o que o cliente já respondeu não é apagado) */
function bfApply(p, a) {
  a = bfMigrate(a); const b = bfStore(p), E = a.empresa || {}, C = a.contato || {}, P = a.publico || {}, K = a.concorrencia || {}, M = a.marketing || {}, br = p.brief, S = bfStr;
  const prods = (Array.isArray(a.produtos) ? a.produtos : []).filter(x => x && S(x.nome));
  const put = (k, v) => { v = S(v); if (!v) return; const cur = String(br[k] || '').trim(); if (!cur || cur === (b.prev[k] || '')) { br[k] = v; b.prev[k] = v; } };
  put('offer', prods.map(x => S(x.nome) + (S(x.oque) ? ': ' + S(x.oque) : '')).join('\n')); put('audience', P.quem); put('problem', P.problemas); put('goal', M.metas); put('channels', M.canais); put('budget', M.orcamento); put('deadline', M.prazo); put('competitors', K.lista);
  const who = `Responsável pelo briefing: ${S(C.nome)}${S(C.cargo) ? ' (' + S(C.cargo) + ')' : ''}${S(C.whatsapp) ? ' · WhatsApp ' + S(C.whatsapp) : ''}${S(C.email) ? ' · ' + S(C.email) : ''}`;
  if (!String(br.notes || '').includes('Responsável pelo briefing:')) br.notes = (br.notes ? br.notes + '\n' : '') + who;
  if (!String(p.client || '').trim() && S(E.nome)) p.client = S(E.nome);
  const v = p.voice || (p.voice = {}); const fill = (o, k, x) => { x = S(x); if (x && !String(o[k] || '').trim()) o[k] = x; };
  const I = a.identidade || {}; fill(v, 'vocabulary', E.usar || bfLines(I.usa).join(', ')); fill(v, 'antivocab', E.evitar || bfLines(I.naoUsa).join(', ')); fill(v, 'rules', E.regras); fill(v, 'personality', Array.isArray(E.tom) ? E.tom.join(', ') : E.tom); if (p.brand) fill(p.brand, 'tone', Array.isArray(E.tom) ? E.tom.join(', ') : E.tom);
  const TY = {'Serviço': 'servico', 'Produto': 'produto', 'Curso ou treinamento': 'curso', 'Evento': 'evento'}; let added = 0, upd = 0; const list = (p.products = p.products || []);
  prods.forEach(x => {
    const cand = {name: S(x.nome), type: TY[S(x.tipo)] || 'servico', summary: S(x.oque), audience: S(x.paraquem), price: S(x.preco), checkout: /^https?:\/\/\S+$/i.test(S(x.link)) ? S(x.link) : '',
      benefits: bfLines(x.diferencial), features: bfLines(x.como).concat(bfLines(x.incluso).map(t => 'Incluso: ' + t), S(x.prazo) ? ['Prazo: ' + S(x.prazo)] : []), objections: bfLines(x.objecoes).concat(bfLines(x.perguntas)), proofs: bfLines(x.provas),
      format: {'Online': 'online', 'Presencial': 'presencial', 'Produto físico': 'fisico', 'Híbrido': 'hibrido'}[S(x.formato)] || '', duration: S(x.duracao), weight: S(x.peso), size: S(x.tamanho), delivery: S(x.entrega), deliveryTime: S(x.prazo), validity: S(x.validade), warranty: S(x.garantia), payment: S(x.pagamento), notFor: S(x.naoserve), problems: bfLines(x.problemas), resolveTime: S(x.tempo)};
    const ex = list.find(y => y.name.toLowerCase() === cand.name.toLowerCase());
    if (ex) { ['summary', 'audience', 'price', 'checkout', 'format', 'duration', 'weight', 'size', 'delivery', 'deliveryTime', 'validity', 'warranty', 'payment', 'notFor', 'resolveTime'].forEach(k => { if (!String(ex[k] || '').trim() && cand[k]) ex[k] = cand[k]; }); ['benefits', 'features', 'objections', 'proofs', 'problems'].forEach(k => { if (!(ex[k] || []).length && cand[k].length) ex[k] = cand[k]; }); upd++; }
    else { list.push(Object.assign({id: uid('pd'), images: []}, cand)); added++; }
  });
  p.products = normalizeProducts(list);
  const ext = bfApplyExtra(p, a, b); added += 0;
  b.text = bfText(a, p.name).slice(0, 40000); b.importedAt = new Date().toISOString();
  if (p.pre && p.pre.history) p.pre.history.unshift({at: b.importedAt, action: 'Briefing do cliente importado', note: `${added} produto(s)/serviço(s) novo(s), ${upd} atualizado(s).`});
  return {added, upd, comp: ext.comp, dep: ext.dep, ident: ext.ident};
}
/* identidade, concorrentes, links e depoimentos (não apaga o que já existe) */
function bfApplyExtra(p, a, b) {
  const S = bfStr, I = a.identidade || {}, out = {comp: 0, dep: 0, ident: false};
  const id = p.identity = normalizeIdentity(p.identity), lab2id = (list, l) => { const x = list.find(v => v[1].toLowerCase() === String(l).trim().toLowerCase()); return x ? x[0] : ''; };
  const has = id.values.length || id.attitudes.length || id.valuesExtra.length;
  if (!has) {
    const pick = (list, arr) => { const ids = [], extra = []; (Array.isArray(arr) ? arr : []).forEach(l => { const k = lab2id(list, l); if (k) ids.push(k); else if (S(l)) extra.push(S(l)); }); return [ids, extra]; };
    const [vi, ve] = pick(ID_VALUES, I.valores), [ai, ae] = pick(ID_ATTS, I.atitudes);
    id.values = vi.slice(0, 12); id.valuesExtra = ve.concat(bfLines(I.valoresExtra)).slice(0, 10); id.attitudes = ai.slice(0, 12); id.attitudesExtra = ae.concat(bfLines(I.atitudesExtra)).slice(0, 10);
    ID_SLIDERS.forEach(k => { const n = BF_SLIDE[k].indexOf(S(I['t_' + k])); if (n >= 0) id.sliders[k] = n + 1; });
    ID_LISTS.forEach(k => { if (!id.lists[k].length) id.lists[k] = bfLines(I[k]).slice(0, 40); });
    out.ident = !!(id.values.length || id.attitudes.length || ID_LISTS.some(k => id.lists[k].length) || ID_SLIDERS.some(k => id.sliders[k] !== 3));
    const R = a.referencias || {}; if (!id.refBrands.length && S(R.admira)) id.refBrands = bfLines(R.admira).map(t => t.slice(0, 60)).slice(0, 12);
    if (out.ident && !id.notes && S(R.naoquer)) id.notes = 'Não quer que a empresa pareça: ' + S(R.naoquer).slice(0, 800);
  }
  p.identity = normalizeIdentity(id);
  if (out.ident) { const v = p.voice || (p.voice = {}), ar = ID_ARCHS[idMain(p.identity)], tt = [ar && ar.tom, idToneText(p.identity)].filter(Boolean).join('. '); if (!String(v.personality || '').trim() && tt) v.personality = tt; if (p.brand && !String(p.brand.tone || '').trim() && tt) p.brand.tone = tt; }
  (Array.isArray(a.concorrencia) ? a.concorrencia : []).filter(x => x && S(x.nome)).forEach(x => {
    const name = S(x.nome), url = /^https?:\/\/\S+$/i.test(S(x.site)) ? S(x.site) : (/^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(S(x.site)) ? 'https://' + S(x.site) : '');
    if ((p.competitors || []).some(c => c.name.toLowerCase() === name.toLowerCase() || (url && c.url === url))) return;
    const notes = [['Vende', x.oque], ['Preço', x.preco], ['Faz bem', x.forte], ['Faz mal', x.fraco], ['Nossa diferença', x.diferenca]].filter(r => S(r[1])).map(r => r[0] + ': ' + S(r[1])).join(' · ');
    (p.competitors = p.competitors || []).push({id: uid('cp'), name: name.slice(0, 120), url, social: [S(x.instagram), S(x.outros)].filter(Boolean).join(', ').slice(0, 300), notes: notes.slice(0, 1200), scan: null, teardown: null, addedAt: new Date().toISOString(), from: 'briefing'}); out.comp++;
  });
  const it = p.intake = normalizeIntake(p.intake), M = a.materiais || {}, E = a.empresa || {};
  const lk = {site: E.site, instagram: E.instagram, redes: E.redes, logo: M.logo, fotos: M.fotos, videos: M.videos, marca: M.marca, jafeito: M.jafeito}; IN_LINKS.forEach(k => { if (!S(it.links[k]) && S(lk[k])) it.links[k] = S(lk[k]).slice(0, 1200); });
  (Array.isArray(a.depoimentos) ? a.depoimentos : []).filter(x => x && S(x.nome) && (S(x.texto) || S(x.link))).forEach(x => {
    if (it.testimonials.some(t => t.who === S(x.nome).slice(0, 120) && t.text === S(x.texto).slice(0, 1500))) return;
    it.testimonials.push({id: uid('dp'), who: S(x.nome), text: S(x.texto), link: S(x.link), product: S(x.produto), auth: /^Sim/.test(S(x.autorizado)) ? 'sim' : /^Não/.test(S(x.autorizado)) ? 'nao' : 'pedir'}); out.dep++;
  });
  p.intake = normalizeIntake(it); return out;
}
/* baixa as imagens enviadas para a Biblioteca (uma vez) e guarda a lista de arquivos */
async function bfImportFiles(p, a, t) {
  const it = p.intake = normalizeIntake(p.intake); let n = 0;
  for (const f of (Array.isArray(a.arquivos) ? a.arquivos : [])) {
    if (!f || it.files.some(x => x.id === f.id)) continue; const rec = {id: f.id, ext: f.ext, cat: f.cat, name: f.name, t, lib: ''};
    if (f.ext !== 'pdf' && typeof libAddBlob === 'function') { try { const r = await fetch(`api/briefing.php?t=${t}&f=${f.id}.${f.ext}`); if (r.ok) { const li = await libAddBlob(await r.blob(), {name: 'Briefing · ' + f.cat + ' · ' + f.name, tags: ['briefing', f.cat], kind: 'upload'}); rec.lib = (li && li.id) || ''; n++; } } catch (e) { /* segue sem a imagem */ } }
    it.files.push(rec);
  }
  p.intake = normalizeIntake(it); return n;
}
async function bfImport() {
  const p = curProject(), b = bfStore(p);
  try {
    const r = await bfFetch(), a = r.answers || {}; if (!bfText(a).split('\n').length || bfText(a).length < 60) { toast('Ainda não há respostas para importar.'); return; }
    const miss = bfMissing(a); if (r.status !== 'enviado' && !confirm('O cliente ainda não enviou o briefing (falta: ' + miss.join(', ') + '). Importar o que já foi preenchido?')) return;
    const x = bfApply(p, a); x.imgs = await bfImportFiles(p, bfMigrate(a), b.t); b.status = r.status; b.submittedAt = r.submittedAt || ''; b.updatedAt = r.updatedAt || ''; persist();
    showModal('Briefing importado', `<p>As respostas foram para o projeto: ficha do briefing, voz da marca, <b>${x.added}</b> produto(s) ou serviço(s) novo(s) e ${x.upd} atualizado(s), ${x.comp} concorrente(s), ${x.dep} depoimento(s)${x.ident ? ', a identidade da marca (aba Marca e arquétipo)' : ''} e ${x.imgs} imagem(ns) na Biblioteca. O que você já tinha preenchido foi mantido.</p><p class="muted" style="font-size:13px">Agora a IA usa esse material quando você gerar o pré-projeto, os anúncios, os posts e as páginas.</p><div class="modal-actions"><button class="btn" onclick="closeModal();bfRerender()">Fechar</button><button class="btn dark" onclick="closeModal();preGenAll(true)">✦ Gerar o pré-projeto agora</button></div>`);
  } catch (e) { toast(e.message); } bfRerender();
}
