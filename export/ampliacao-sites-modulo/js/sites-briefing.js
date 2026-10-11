/* ===== Briefing do cliente → site (RF-H4 do PRD de Marca e Briefing).
   Três jeitos de receber o cliente: texto corrido lido por um agente, formulário completo (11 partes, o mesmo do link do cliente) e o próprio link.
   Daqui sai o BrandScript do StoryBrand e o texto das páginas. O que o cliente não disse fica como [CONFIRMAR]; nada é inventado. ===== */
const SBR = {tab: 'agente', open: 'contato', busy: '', log: null};
const sbCF = x => '[CONFIRMAR: ' + x + ']';
const sbAns = p => { const b = bfStore(p); if (!b.answers || typeof b.answers !== 'object' || Array.isArray(b.answers)) b.answers = {}; return b.answers; };
const sbHas = v => Array.isArray(v) ? v.length > 0 : !!bfStr(v);
const sbGet = (p, path) => { const [k, x, y] = path.split('|'), a = sbAns(p)[k]; return y === undefined ? (a && !Array.isArray(a) ? a[x] : undefined) : ((Array.isArray(a) ? a[+x] : null) || {})[y]; };
function sbPut(p, path, v) {
  const [k, x, y] = path.split('|'), A = sbAns(p);
  if (y === undefined) { if (!A[k] || Array.isArray(A[k])) A[k] = {}; A[k][x] = v; }
  else { if (!Array.isArray(A[k])) A[k] = []; (A[k][+x] = A[k][+x] || {})[y] = v; }
}
const sbSecFilled = (p, sec) => { const a = sbAns(p)[sec.k]; if (!a) return false; if (sec.files) return Array.isArray(a) && a.length > 0; return Array.isArray(a) ? a.some(o => o && Object.values(o).some(sbHas)) : Object.values(a).some(sbHas); };
const sbProgress = p => [BF_SECTIONS.filter(s => sbSecFilled(p, s)).length, BF_SECTIONS.length];

/* ---------- fatos do briefing (o que o gerador pode usar) ---------- */
const sbWaDigits = v => { const d = String(v || '').replace(/\D/g, ''); return d.length >= 10 && d.length <= 11 ? '55' + d : d; };
function sbFacts(p) {
  const a = bfMigrate(sbAns(p)), E = a.empresa || {}, C = a.contato || {}, Pu = a.publico || {}, I = a.identidade || {}, M = a.materiais || {}, S = bfStr, L = bfLines;
  let prods = (Array.isArray(a.produtos) ? a.produtos : []).filter(x => x && S(x.nome)).map(x => ({nome: S(x.nome), tipo: S(x.tipo), oque: S(x.oque), paraquem: S(x.paraquem), como: L(x.como), incluso: L(x.incluso), preco: S(x.preco), prazo: S(x.prazo), diferencial: L(x.diferencial), perguntas: L(x.perguntas), objecoes: L(x.objecoes), garantia: S(x.garantia), pagamento: S(x.pagamento), naoserve: L(x.naoserve), problemas: L(x.problemas), acao: S(x.acao), link: S(x.link)}));
  if (!prods.length) prods = (p.products || []).map(x => ({nome: x.name, tipo: '', oque: x.summary || '', paraquem: x.audience || '', como: [], incluso: [], preco: x.price || '', prazo: x.deliveryTime || '', diferencial: x.benefits || [], perguntas: [], objecoes: x.objections || [], garantia: x.warranty || '', pagamento: x.payment || '', naoserve: [], problemas: [], acao: '', link: x.checkout || ''}));
  const dep = (Array.isArray(a.depoimentos) ? a.depoimentos : []).filter(d => d && S(d.texto) && S(d.autorizado) === 'Sim, autorizou').map(d => ({texto: S(d.texto), nome: S(d.nome)}));
  const files = Array.isArray(a.arquivos) ? a.arquivos : [], pick = cats => (files.find(f => cats.includes(f.cat) && f.imgId) || {}).imgId || '';
  const p1 = prods[0] || {}, hex = (S(M.marca).match(/#[0-9a-f]{6}/i) || [''])[0];
  const acao = {'Agendar uma conversa': 'Agendar uma conversa', 'Falar no WhatsApp': 'Chamar no WhatsApp', 'Pedir orçamento': 'Pedir orçamento', 'Comprar online': 'Comprar agora', 'Preencher um formulário': 'Preencher o formulário'}[p1.acao] || '';
  const whats = sbWaDigits(C.whatsapp);
  return {nome: S(E.nome) || p.client || p.name || '', cidade: S(E.cidade), whats, email: S(C.email), contato: S(C.nome), quem: S(Pu.quem), problemas: L(Pu.problemas), ocultas: L(Pu.ocultas), desejos: S(Pu.desejos), objecoes: L(Pu.objecoes), perdem: S(Pu.perdem),
    missao: S(E.missao), diferenciais: L(E.diferenciais), tempo: S(E.tempo), equipe: S(E.equipe), historia: S(E.historia), prods, dep, foto: pick(['fotos', 'produtos']), logo: pick(['logo']), cor: hex,
    naoUsa: L(I.naoUsa), tomN: Object.keys(I).filter(k => /^t_/.test(k) && S(I[k])).length, acao, direto: acao || (whats ? 'Chamar no WhatsApp' : 'Falar com a equipe')};
}
/* BrandScript do StoryBrand a partir dos fatos (só preenche o que o cliente disse) */
function sbBS(f) {
  const p1 = f.prods[0] || {}, oc = f.ocultas.join(', '), aut = [f.tempo && 'No mercado há ' + f.tempo, f.equipe && 'Equipe: ' + f.equipe, f.diferenciais.slice(1).join('. ')].filter(Boolean).join('. ');
  const st = (p1.como || []).map(x => x.replace(/^(passo|etapa)\s*\d+\s*[:.-]\s*/i, ''));
  return {who: f.quem, wants: f.desejos, external: f.problemas.join('. '), internal: oc, philosophical: f.missao, empathy: oc ? 'Sabemos que muita gente chega sentindo ' + oc + '.' : '', authority: aut,
    step1: st[0] || '', step2: st[1] || '', step3: st[2] || '', agreement: p1.garantia || '', direct: f.direto, transitional: '', failure: '', success: f.desejos, identity: ''};
}
/* texto das páginas por regras (quando não há IA, ou como ponto de partida): um objeto por bloco, no formato do lpMerge */
function sbBlocksFor(l, f, bs, role) {
  const p1 = f.prods[0] || {}, CF = sbCF, tr = (a, n) => a.slice(0, n), items = (arr, mk) => arr.map(mk);
  const faqQ = tr([].concat(p1.perguntas || [], f.objecoes, p1.objecoes || []), 6).map(x => ({t: x.charAt(0).toUpperCase() + x.slice(1).replace(/[?.!]+$/, '') + '?', d: CF('resposta')}));
  const steps = [bs.step1, bs.step2, bs.step3].map((x, i) => ({t: 'Passo ' + (i + 1), d: x || CF('o que acontece neste passo')}));
  const mk = {
    hero: () => ({title: bs.success || f.diferenciais[0] || CF('promessa para o cliente'), text: p1.oque || bs.who || CF('o que o negócio faz e para quem'), kicker: [p1.tipo !== 'Outro' && p1.tipo, f.cidade].filter(Boolean).join(' · '), cta: bs.direct, note: p1.prazo ? 'Prazo: ' + p1.prazo : ''}),
    dor: () => ({title: 'Você passa por isso?', text: bs.philosophical || '', items: (f.problemas.length ? items(tr(f.problemas, 4), x => ({t: x, d: ''})) : [{t: CF('problema que o cliente vê'), d: ''}]).concat(bs.internal ? [{t: 'No fundo', d: 'O que pesa é ' + bs.internal + '.'}] : [])}),
    solucao: () => ({title: 'Como resolvemos', text: p1.oque || CF('como o serviço resolve o problema'), items: (p1.diferencial.length ? tr(p1.diferencial, 3) : [CF('pilar 1'), CF('pilar 2'), CF('pilar 3')]).map(x => ({t: x, d: ''}))}),
    beneficios: () => ({title: 'O que você ganha', items: (tr([].concat(p1.diferencial || [], p1.incluso || []), 6).length ? tr([].concat(p1.diferencial || [], p1.incluso || []), 6) : [bs.success || CF('benefício')]).map(x => ({t: x, d: ''}))}),
    passos: () => ({title: 'Como funciona', items: steps}),
    prova: () => ({title: 'Quem já foi atendido', items: f.dep.length ? f.dep.map(d => ({t: d.texto, d: d.nome || CF('nome')})) : [{t: CF('depoimento real e autorizado de cliente'), d: CF('nome')}]}),
    autoridade: () => ({title: 'Quem está por trás', name: f.nome, text: bs.authority || CF('autoridade: tempo de atuação, formação, número de clientes')}),
    faq: () => ({title: 'Dúvidas comuns', items: faqQ.length ? faqQ : [{t: 'Como faço para começar?', d: f.whats ? 'Chame no WhatsApp.' : CF('forma de contato')}, {t: 'Quanto custa?', d: p1.preco || CF('valores')}, {t: 'Onde fica?', d: f.cidade ? 'Atendemos em ' + f.cidade + '. ' + CF('endereço completo') : CF('endereço')}]}),
    cta_final: () => ({title: 'Pronto para resolver?', text: 'Fale com a gente e veja o melhor caminho para o seu caso.', cta: bs.direct}),
    form: () => ({title: 'Fale com a gente', text: 'Deixe seus dados e retornamos o contato.', cta: 'Enviar'}),
    texto: () => ({title: role === 'oferta' ? 'Sobre o serviço' : 'Sobre nós', text: f.historia || p1.oque || CF('história do negócio')}),
    conteudo: () => ({title: 'O que oferecemos', items: f.prods.length ? f.prods.map(x => ({t: x.nome, d: x.oque})) : [{t: CF('produto ou serviço'), d: ''}]}),
    oferta: () => ({title: 'Condições', text: p1.prazo ? 'Prazo: ' + p1.prazo : '', items: (p1.incluso.length ? p1.incluso : [CF('o que está incluso')]).map(x => ({t: x, d: ''})), price: p1.preco || CF('preço'), note: p1.pagamento || '', cta: bs.direct}),
    garantia: () => ({title: 'Garantia', text: p1.garantia || CF('política de garantia')}),
    para_quem: () => ({title: 'Para quem é', yes: [f.quem || CF('quem é o cliente')], no: p1.naoserve || []}),
    numeros: () => ({items: []}), amostra: () => ({title: '', text: ''}), bonus: () => ({items: []}), programa: () => ({items: []}), palestrantes: () => ({items: []}),
    local: () => ({title: 'Onde estamos', text: f.cidade ? f.cidade + '. ' + CF('endereço completo') : CF('endereço'), note: ''}), ingressos: () => ({items: []})
  };
  return l.blocks.map(b => Object.assign({t: b.t}, (mk[b.t] || (() => ({})))()));
}

/* ---------- formulário completo (as mesmas 11 partes do link do cliente) ---------- */
function sbFieldHtml(p, fl, path) {
  const [, lab, type, opt] = fl, val = sbGet(p, path), req = opt === 1, L = `<span>${esc(lab)}${req ? ' <b style="color:var(--accent,#d9480f)">*</b>' : ''}</span>`;
  if (type === 'area') return `<label class="field full">${L}<textarea data-a="${esc(path)}" oninput="sbSet(this)">${esc(val || '')}</textarea></label>`;
  if (type === 'select') return `<label class="field">${L}<select data-a="${esc(path)}" onchange="sbSet(this)"><option value=""></option>${opt.map(o => `<option${val === o ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
  if (type === 'checks') { const cur = Array.isArray(val) ? val : []; return `<div class="field full">${L}<div class="sb-cks">${opt.map(o => `<label class="sb-ck"><input type="checkbox" data-a="${esc(path)}" data-v="${esc(o)}"${cur.includes(o) ? ' checked' : ''} onchange="sbSet(this)">${esc(o)}</label>`).join('')}</div></div>`; }
  return `<label class="field">${L}<input type="${type === 'tel' ? 'tel' : type === 'email' ? 'email' : 'text'}" data-a="${esc(path)}" value="${esc(val || '')}" oninput="sbSet(this)"></label>`;
}
function sbSecBody(p, sec) {
  if (sec.files) { const fl = Array.isArray(sbAns(p).arquivos) ? sbAns(p).arquivos : [];
    return sec.files.map(([c, lab]) => { const mine = fl.map((f, i) => [f, i]).filter(x => x[0].cat === c); return `<div style="margin-bottom:12px"><strong>${esc(lab)}</strong><div class="row-gap" style="margin-top:4px"><label class="btn sm" style="cursor:pointer">Escolher imagens<input type="file" accept="image/*" multiple hidden onchange="sbUpload('${c}',this)"></label><small class="muted">${mine.length} enviada(s) · vão para a biblioteca de imagens</small></div>${mine.length ? `<div class="sb-ph">${mine.map(([f, i]) => `<div><img data-lib="${esc(f.imgId)}" alt=""><button class="btn sm" onclick="sbRmFile(${i})" aria-label="Remover">×</button></div>`).join('')}</div>` : ''}</div>`; }).join(''); }
  if (sec.repeat) { const arr = Array.isArray(sbAns(p)[sec.k]) ? sbAns(p)[sec.k] : [], n = Math.max(1, arr.length);
    return Array.from({length: n}, (_, i) => `<div class="sb-rep"><div class="row-gap" style="justify-content:space-between;margin-bottom:8px"><strong>${esc(sec.item)} ${i + 1}</strong>${n > 1 ? `<button class="btn sm" onclick="sbDel('${sec.k}',${i})">Remover</button>` : ''}</div><div class="form-grid">${sec.f.map(fl => sbFieldHtml(p, fl, sec.k + '|' + i + '|' + fl[0])).join('')}</div></div>`).join('') + (n < sec.repeat ? `<button class="btn sm" onclick="sbAdd('${sec.k}')">+ Adicionar ${esc(sec.item.toLowerCase())}</button>` : ''); }
  return `<div class="form-grid">${sec.f.map(fl => sbFieldHtml(p, fl, sec.k + '|' + fl[0])).join('')}</div>`;
}
function sbFormHTML(p) {
  return BF_SECTIONS.map((sec, i) => `<details class="sb-sec" data-k="${sec.k}"${SBR.open === sec.k ? ' open' : ''} ontoggle="if(this.open)SBR.open='${sec.k}'"><summary><span class="sb-n">${i + 1}</span><span class="sb-t">${esc(sec.t)}</span><span class="sb-st${sbSecFilled(p, sec) ? ' y' : ''}">${sbSecFilled(p, sec) ? 'preenchida' : 'em branco'}</span></summary><div class="sb-bd">${sec.d ? `<p class="muted" style="margin:0 0 10px;font-size:12.5px">${esc(sec.d)}</p>` : ''}${sbSecBody(p, sec)}</div></details>`).join('');
}
function sbSet(el) {
  const p = curProject(), path = el.dataset.a;
  if (el.type === 'checkbox') { const cur = (Array.isArray(sbGet(p, path)) ? sbGet(p, path) : []).slice(), i = cur.indexOf(el.dataset.v); i < 0 ? cur.push(el.dataset.v) : cur.splice(i, 1); sbPut(p, path, cur); }
  else sbPut(p, path, el.value);
  if (path === 'empresa|nome' && !String(p.client || '').trim()) p.client = el.value;
  persist();
  const d = el.closest('details'), sec = d && BF_SECTIONS.find(s => s.k === d.dataset.k), b = d && d.querySelector('.sb-st');
  if (sec && b) { const y = sbSecFilled(p, sec); b.textContent = y ? 'preenchida' : 'em branco'; b.classList.toggle('y', y); }
}
function sbAdd(k) { const p = curProject(); if (!Array.isArray(sbAns(p)[k])) sbAns(p)[k] = []; sbAns(p)[k].push({}); persist(); sbRender(); }
function sbDel(k, i) { const p = curProject(); sbAns(p)[k].splice(i, 1); persist(); sbRender(); }
async function sbUpload(cat, input) {
  const p = curProject(), A = sbAns(p); if (!Array.isArray(A.arquivos)) A.arquivos = [];
  for (const f of [...input.files].filter(x => x.type.startsWith('image/')).slice(0, 12)) {
    try { const it = await libAddBlob(f, {name: 'Briefing · ' + cat + ' · ' + f.name, tags: ['briefing', cat], kind: 'upload'}); A.arquivos.push({cat, name: f.name, imgId: it.imgId, lib: it.id}); } catch (e) { toast(e.message); }
  }
  persist(); sbRender();
}
function sbRmFile(i) { const p = curProject(); sbAns(p).arquivos.splice(i, 1); persist(); sbRender(); }

/* ---------- agente: lê o texto corrido e preenche o formulário ---------- */
const SB_LABELS = {nome: 'empresa|nome', negocio: 'empresa|nome', empresa: 'empresa|nome', cidade: 'empresa|cidade', whatsapp: 'contato|whatsapp', telefone: 'contato|whatsapp', instagram: 'empresa|instagram', site: 'empresa|site', publico: 'publico|quem', 'público': 'publico|quem', problema: 'publico|problemas', problemas: 'publico|problemas', resultado: 'publico|desejos', diferencial: 'empresa|diferenciais', diferenciais: 'empresa|diferenciais', prazo: 'produtos|0|prazo', garantia: 'produtos|0|garantia', preco: 'produtos|0|preco', 'preço': 'produtos|0|preco', servico: 'produtos|0|nome', 'serviço': 'produtos|0|nome', produto: 'produtos|0|nome', 'o que faz': 'produtos|0|oque', depoimento: 'depoimentos|0|texto', missao: 'empresa|missao', 'missão': 'empresa|missao'};
function sbRuleRead(p, text) {
  const found = [], put = (path, v, lab) => { v = String(v || '').trim(); if (v && !sbHas(sbGet(p, path))) { sbPut(p, path, v); found.push([lab, v]); } };
  text.split('\n').forEach(l => { const m = l.match(/^\s*([A-Za-zÀ-ú ]{2,18})\s*[:\-]\s*(.+)$/); if (m && SB_LABELS[m[1].trim().toLowerCase()]) put(SB_LABELS[m[1].trim().toLowerCase()], m[2], m[1].trim().toLowerCase()); });
  const em = text.match(/[\w.+-]+@[\w-]+\.[a-z.]{2,}/i); if (em) put('contato|email', em[0], 'e-mail');
  const ph = text.match(/\(?\b\d{2}\)?\s?9?\d{4}[-\s]?\d{4}\b/); if (ph) put('contato|whatsapp', ph[0], 'whatsapp');
  const hs = [...new Set(text.replace(/[\w.+-]+@[\w-]+\.[a-z.]+/ig, '').match(/@[\w.]{3,}/g) || [])], us = [...new Set(text.match(/https?:\/\/[^\s]+|www\.[^\s]+/g) || [])];
  const ig = hs[0]; if (ig) put('empresa|instagram', ig, 'instagram');
  const rest = [...hs.slice(1), ...us].filter(x => !String(sbGet(p, 'empresa|redes') || '').includes(x)); if (rest.length) { sbPut(p, 'empresa|redes', ((sbGet(p, 'empresa|redes') || '') + '\n' + rest.join('\n')).trim()); found.push(['redes e links', rest.join(', ')]); }
  return found;
}
/* esquema que a IA recebe: as perguntas do formulário, com as opções permitidas */
function sbAISchema() { return BF_SECTIONS.filter(s => !s.files).map(s => `${s.k}${s.repeat ? ' (lista de objetos)' : ''}: ` + s.f.map(([k, l, t, o]) => `${k} = ${l}${t === 'select' ? ' [um de: ' + o.join(' | ') + ']' : t === 'checks' ? ' [lista com itens de: ' + o.slice(0, 60).join(' | ') + ']' : ''}`).join('; ')).join('\n'); }
function sbMergeAI(p, j) {
  const A = sbAns(p), str = v => bfStr(v).slice(0, 3000); let n = 0;
  const clean = (fl, v) => { const [, , t, o] = fl; if (t === 'checks') return (Array.isArray(v) ? v : []).filter(x => o.includes(x)); if (t === 'select') return o.includes(v) ? v : ''; return str(v); };
  BF_SECTIONS.filter(s => !s.files).forEach(s => {
    const src = j && j[s.k]; if (!src) return;
    if (s.repeat) { const list = (Array.isArray(src) ? src : []).slice(0, s.repeat); if (!list.length) return; if (!Array.isArray(A[s.k])) A[s.k] = [];
      list.forEach((o, i) => { if (!o || typeof o !== 'object') return; const cur = (A[s.k][i] = A[s.k][i] || {}); s.f.forEach(fl => { const v = clean(fl, o[fl[0]]); if (sbHas(v) && !sbHas(cur[fl[0]])) { cur[fl[0]] = v; n++; } }); if (s.k === 'depoimentos' && !cur.autorizado) cur.autorizado = 'Ainda preciso pedir'; }); }
    else { if (typeof src !== 'object' || Array.isArray(src)) return; if (!A[s.k] || Array.isArray(A[s.k])) A[s.k] = {}; s.f.forEach(fl => { const v = clean(fl, src[fl[0]]); if (sbHas(v) && !sbHas(A[s.k][fl[0]])) { A[s.k][fl[0]] = v; n++; } }); }
  });
  return n;
}
async function sbAgent() {
  const p = curProject(), ta = $('sbRaw'), text = (ta ? ta.value : '').trim(); if (!text) { toast('Cole o texto do cliente primeiro.'); return; }
  const b = bfStore(p); b.raw = text.slice(0, 40000); const before = sbProgress(p)[0], found = sbRuleRead(p, text); let ai = '', n = 0;
  if (typeof aiReady === 'function' && aiReady()) {
    SBR.busy = 'agent'; sbRender();
    try {
      const j = await aiJSON('Você é um agente de briefing de uma agência de sites. Leia o texto que o cliente mandou (conversa, bio de rede social, anotações) e preencha um formulário. Use SOMENTE o que está no texto. Não invente nada: o que não aparecer, deixe de fora. Depoimentos só se o texto trouxer a fala de um cliente. Devolva um objeto JSON cujas chaves são as seções abaixo. Seções de lista devem ser arrays de objetos. Campos com opções só aceitam as opções listadas.\n\nSEÇÕES E CAMPOS:\n' + sbAISchema(), 'TEXTO DO CLIENTE:\n' + text.slice(0, 12000));
      n = sbMergeAI(p, j); ai = 'IA';
    } catch (e) { ai = 'regras (a IA falhou: ' + e.message + ')'; }
    SBR.busy = '';
  } else ai = 'regras simples (sem IA ligada)';
  persist();
  const f = sbFacts(p), falta = [];
  if (!f.nome) falta.push('Nome da empresa'); if (!f.whats) falta.push('WhatsApp'); if (!f.prods.length) falta.push('Produto ou serviço'); if (!f.quem) falta.push('Quem é o cliente'); if (!f.problemas.length) falta.push('Problemas do cliente');
  if (!f.prods.some(x => x.prazo)) falta.push('Prazo de entrega ou atendimento'); if (!f.tomN) falta.push('Tom de voz'); if (!f.foto) falta.push('Fotos'); if (!f.dep.length) falta.push('Depoimento autorizado'); if (!f.objecoes.length && !f.prods.some(x => x.objecoes.length || x.perguntas.length)) falta.push('Objeções e perguntas dos clientes');
  SBR.log = {found, n: n + found.length, via: ai, falta, antes: before, depois: sbProgress(p)[0]}; sbRender();
}
function sbPull() {
  const p = curProject(), b = bfStore(p); if (!b.t) { toast('Crie o link do cliente primeiro.'); return; }
  bfFetch().then(r => { const a = bfMigrate(r.answers || {}), A = sbAns(p); let n = 0; BF_SECTIONS.forEach(s => { const src = a[s.k]; if (src == null) return;
      if (Array.isArray(src)) { if (!Array.isArray(A[s.k]) || !A[s.k].length) { A[s.k] = src; n++; } } else { A[s.k] = Object.assign({}, src, A[s.k] || {}); n++; } });
    b.status = r.status || b.status; persist(); toast(`Respostas do link trazidas (${n} parte(s)). O que você já tinha preenchido foi mantido.`); sbRender(); }).catch(e => toast(e.message));
}

/* ---------- tela Briefing ---------- */
const SB_MAP = [['Nome da empresa', 'Cabeçalho, título e rodapé', f => f.nome], ['Produtos e serviços', 'Oferta e páginas de serviço', f => f.prods.length], ['Problemas e dores', 'Bloco "Você passa por isso?"', f => f.problemas.length], ['Desejos do cliente', 'Promessa do topo', f => f.desejos], ['Como funciona', 'Plano em 3 passos', f => (f.prods[0] || {}).como && f.prods[0].como.length], ['Prazo', 'Faixa de prazo na oferta', f => f.prods.some(x => x.prazo)], ['Objeções e perguntas', 'Bloco de objeções', f => f.objecoes.length || f.prods.some(x => x.perguntas.length || x.objecoes.length)], ['Depoimentos autorizados', 'Prova', f => f.dep.length], ['Tempo de mercado e equipe', 'Autoridade do guia', f => f.tempo || f.equipe], ['Tom de voz', 'Tom dos textos', f => f.tomN], ['Fotos', 'Topo da página e biblioteca', f => f.foto], ['Cor da marca', 'Cor dos botões', f => f.cor], ['WhatsApp e ação', 'Botões e chamada final', f => f.whats]];
function renderBriefing() {
  const root = $('briefingRoot'); if (!root) return; const p = curProject();
  if (!p) { root.innerHTML = `<div class="page-head"><div><h1>Briefing do cliente</h1><p>Crie um projeto (um por cliente) para começar.</p></div></div><div class="panel"><button class="btn dark" onclick="openWizard()">Novo projeto</button></div>`; return; }
  const tabs = [['agente', 'Texto corrido com agente'], ['form', 'Formulário e link do cliente'], ['resumo', 'Resumo e criar site']], [n, t] = sbProgress(p), L = SBR.log, b = bfStore(p);
  let body = '';
  if (SBR.tab === 'agente') {
    body = `<div class="panel"><div class="field full"><label>Cole aqui tudo que o cliente mandou</label><small class="muted">Conversa de WhatsApp, áudio transcrito, bio do Instagram, texto do site atual, anotações da reunião.</small><textarea id="sbRaw" style="min-height:220px" placeholder="Exemplo:\nNome: Clínica Sorriso Vivo\nCidade: Campinas\nInstagram: @sorrisovivo\n(19) 90000-0000\nO cliente reclama de fila na recepção…">${esc(b.raw || '')}</textarea></div>
      <div class="row-gap" style="margin-top:10px;flex-wrap:wrap"><button class="btn dark" onclick="sbAgent()" ${SBR.busy ? 'disabled' : ''}>${SBR.busy ? 'O agente está lendo…' : 'Agente: ler e preencher'}</button><small class="muted">${typeof aiReady === 'function' && aiReady() ? 'IA ligada: o agente entende texto solto e preenche o formulário.' : 'Sem IA ligada: o agente lê linhas com rótulo (Nome:, Cidade:), telefone, e-mail, @ e links. Ligue a IA em Configurações para ele entender texto solto.'}</small></div></div>` +
      (L ? `<div class="form-grid"><div class="panel"><strong>O que o agente entendeu</strong><small class="muted block">Lido por: ${esc(L.via)}</small>${L.found.length || L.n ? `<ul class="sb-ul y">${L.found.map(x => `<li><b>${esc(x[0])}:</b> ${esc(x[1].length > 70 ? x[1].slice(0, 70) + '…' : x[1])}</li>`).join('')}${L.n - L.found.length > 0 ? `<li>${L.n - L.found.length} campo(s) preenchido(s) pela IA</li>` : ''}</ul>` : '<p class="muted">Nada que ele consiga ler neste texto.</p>'}</div>
        <div class="panel"><strong>O que ainda falta perguntar ao cliente</strong>${L.falta.length ? `<ul class="sb-ul n">${L.falta.map(x => `<li>${esc(x)}</li>`).join('')}</ul><button class="btn sm" onclick="SBR.tab='form';renderBriefing()">Abrir o formulário</button>` : '<p class="muted">Tudo o que é essencial já veio.</p>'}</div></div>` : '');
  } else if (SBR.tab === 'form') {
    body = `${typeof briefingPanel === 'function' ? briefingPanel(p) : ''}<div class="row-gap" style="margin:10px 0;flex-wrap:wrap"><button class="btn sm" onclick="sbPull()">⬇ Trazer as respostas do link</button><small class="muted">Você também pode preencher pelo cliente: é o mesmo formulário de 11 partes. ${n} de ${t} partes preenchidas.</small></div>${sbFormHTML(p)}`;
  } else {
    const f = sbFacts(p), aut = (Array.isArray(sbAns(p).depoimentos) ? sbAns(p).depoimentos : []).filter(d => d && bfStr(d.texto));
    body = `<div class="panel"><div class="sb-kp"><div><b>${f.prods.length}</b><span>Produtos</span></div><div><b>${f.dep.length} de ${aut.length}</b><span>Depoimentos autorizados</span></div><div><b>${(Array.isArray(sbAns(p).arquivos) ? sbAns(p).arquivos : []).length}</b><span>Fotos e arquivos</span></div><div><b>${n} de ${t}</b><span>Partes do formulário</span></div></div></div>
      <div class="panel"><strong>Como o briefing vira site</strong><small class="muted block" style="margin-bottom:8px">O que o cliente não preencheu aparece como [CONFIRMAR]. Nada é inventado.</small><div style="overflow-x:auto"><table class="sb-tb"><thead><tr><th>Dado do briefing</th><th>Onde aparece no site</th><th>Situação</th></tr></thead><tbody>${SB_MAP.map(m => { const ok = !!m[2](f); return `<tr><td>${m[0]}</td><td>${m[1]}</td><td class="${ok ? 'y' : 'n'}">${ok ? 'recebido' : 'faltando'}</td></tr>`; }).join('')}</tbody></table></div></div>
      <div class="panel row-gap" style="justify-content:space-between;flex-wrap:wrap"><div><strong>Criar site com este briefing</strong><small class="muted block">Escolha um template do banco. O BrandScript e o texto das páginas saem do briefing.</small></div><button class="btn dark" onclick="sbOpenGallery()">Escolher o template e criar o site</button></div>`;
  }
  root.innerHTML = `<div class="page-head"><div><h1>Briefing do cliente</h1><p>Receba o cliente do jeito que ele preferir: texto corrido, formulário completo ou link para ele preencher. Projeto: <strong>${esc(p.name)}</strong></p></div></div>
    <div class="sb-tabs" role="tablist">${tabs.map(x => `<button class="chip${SBR.tab === x[0] ? ' on' : ''}" role="tab" aria-selected="${SBR.tab === x[0]}" onclick="SBR.tab='${x[0]}';renderBriefing()">${x[1]}</button>`).join('')}</div>${body}`;
  if (typeof libFill === 'function') libFill(root);
}
const sbRender = () => { if (ui.page !== 'briefing') return; if (typeof keepScroll === 'function') keepScroll(renderBriefing); else renderBriefing(); };
/* o gerador de páginas por IA usa motJSON (do módulo de e-books); aqui há uma cópia mínima para o módulo de Sites */
if (typeof motJSON !== 'function') { var motJSON = async function (system, user, max) { const t = await aiText(system + '\nResponda APENAS com JSON válido, sem markdown nem comentários.', user, max || 4000), s = t.replace(/```json|```/g, '').trim(), a = s.search(/[\[{]/), z = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']')); try { return JSON.parse(s.slice(a, z + 1)); } catch (e) { throw new Error('a IA devolveu um formato inesperado; tente de novo.'); } }; }

