/* ===== Documento do projeto: subir um briefing completo e levar tudo para o projeto e para todas as peças =====
   Lê Word (.docx), texto, Markdown, HTML, RTF, CSV, JSON e (melhor esforço) PDF. Reconhece empresa, produtos, públicos (ICP),
   dores, dúvidas, desejos, urgências ocultas, tom de voz, regras, marca e cores. Com IA ligada, a IA extrai; sem IA, um leitor de
   seções faz o trabalho. NUNCA apaga nem sobrescreve o que você já preencheu: só completa o que está vazio e acrescenta o que falta. */
const dnorm = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const docUI = {text: '', name: '', K: null, busy: false, via: '', opt: {banks: true}};

/* ---------- leitura de arquivos ---------- */
async function docInflate(u8, raw) {
  const s = new Blob([u8]).stream().pipeThrough(new DecompressionStream(raw ? 'deflate-raw' : 'deflate'));
  return new Uint8Array(await new Response(s).arrayBuffer());
}
async function docUnzip(buf, want) {
  const u = new Uint8Array(buf), dv = new DataView(buf), out = {}; let e = -1;
  for (let i = u.length - 22; i >= Math.max(0, u.length - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Error('arquivo .docx inválido');
  const n = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true);
  for (let k = 0; k < n; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(u.subarray(p + 46, p + 46 + nl)); p += 46 + nl + xl + cl;
    if (!want(name)) continue;
    const lnl = dv.getUint16(off + 26, true), lxl = dv.getUint16(off + 28, true), data = u.subarray(off + 30 + lnl + lxl, off + 30 + lnl + lxl + csize);
    out[name] = method === 0 ? data : await docInflate(data, true);
  }
  return out;
}
function docxText(xml) {
  const d = new DOMParser().parseFromString(xml, 'application/xml'), W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main', out = [];
  const kids = (n, t) => Array.from(n.childNodes).filter(c => c.localName === t && c.namespaceURI === W);
  const para = pn => {
    let t = ''; const walk = n => { Array.from(n.childNodes).forEach(c => { if (c.namespaceURI !== W) { if (c.childNodes && c.childNodes.length) walk(c); return; }
      if (c.localName === 't') t += c.textContent; else if (c.localName === 'tab') t += ' '; else if (c.localName === 'br' || c.localName === 'cr') t += '\n'; else if (c.localName === 'r' || c.localName === 'hyperlink' || c.localName === 'smartTag' || c.localName === 'sdt' || c.localName === 'sdtContent') walk(c); }); };
    walk(pn); t = t.replace(/[ \t]+\n/g, '\n').trim(); if (!t) return '';
    const ppr = kids(pn, 'pPr')[0], sty = ppr && kids(ppr, 'pStyle')[0], sv = sty ? (sty.getAttributeNS(W, 'val') || sty.getAttribute('w:val') || '') : '';
    const hm = /^(?:heading|titulo|ttulo)\s*([1-6])/i.exec(sv) || (/^(title|titulo|ttulo)$/i.test(sv) ? [0, '1'] : /^subtitle|subttulo|subtitulo$/i.test(sv) ? [0, '2'] : null);
    if (hm) return '#'.repeat(+hm[1]) + ' ' + t.replace(/\n/g, ' ');
    if (ppr && kids(ppr, 'numPr').length) return '- ' + t.replace(/\n/g, ' ');
    const runs = kids(pn, 'r'); if (runs.length && t.length < 70 && !/[.;]$/.test(t) && runs.every(r => { const rp = kids(r, 'rPr')[0]; return !kids(r, 't').length || (rp && kids(rp, 'b').length); })) return '### ' + t.replace(/\n/g, ' ');
    return t;
  };
  const table = tn => kids(tn, 'tr').forEach(tr => {
    const cells = kids(tr, 'tc').map(tc => kids(tc, 'p').map(para).map(x => x.replace(/^#+\s+/, '').replace(/^- /, '')).filter(Boolean).join(' / '));
    if (cells.some(Boolean)) out.push('| ' + cells.join(' | ') + ' |');
  });
  const body = Array.from(d.getElementsByTagNameNS(W, 'body'))[0];
  if (body) Array.from(body.childNodes).forEach(c => { if (c.namespaceURI !== W) return; if (c.localName === 'p') { const x = para(c); if (x) out.push(x); else out.push(''); } else if (c.localName === 'tbl') { out.push(''); table(c); out.push(''); } });
  return out.join('\n').replace(/\n{3,}/g, '\n\n');
}
function docHtmlText(h) {
  const d = new DOMParser().parseFromString(h, 'text/html'); d.querySelectorAll('script,style,noscript').forEach(n => n.remove());
  d.querySelectorAll('h1,h2,h3,h4').forEach(n => { n.textContent = '#'.repeat(+n.tagName[1]) + ' ' + n.textContent.trim(); });
  d.querySelectorAll('li').forEach(n => { n.textContent = '- ' + n.textContent.trim(); });
  d.querySelectorAll('tr').forEach(tr => { tr.textContent = '| ' + Array.from(tr.children).map(c => c.textContent.trim().replace(/\s+/g, ' ')).join(' | ') + ' |'; });
  d.querySelectorAll('p,div,br,tr,li,h1,h2,h3,h4,section').forEach(n => n.insertAdjacentText('afterend', '\n'));
  return (d.body ? d.body.textContent : '').replace(/\n{3,}/g, '\n\n');
}
function docCsv(t) { const rows = typeof bfParseCSV === 'function' ? bfParseCSV(t) : t.split(/\n/).map(l => l.split(',')); if (rows.length < 2) return t; const h = rows[0]; return rows.slice(1).map(r => r.map((v, i) => (h[i] ? h[i] + ': ' : '') + v).filter(x => String(x).trim()).join('\n')).join('\n\n'); }
/* PDF (melhor esforço): descomprime os trechos, lê o mapa de letras (ToUnicode) e junta o texto. PDF escaneado ou muito especial pode falhar. */
async function docPdfText(buf) {
  const u = new Uint8Array(buf), lat = new TextDecoder('latin1').decode(u), objs = {}, cmaps = [];
  const re = /(\d+) 0 obj([\s\S]*?)endobj/g; let m;
  while ((m = re.exec(lat))) {
    const body = m[2], s = body.indexOf('stream'); let data = null;
    if (s >= 0) { let a = s + 6; if (body[a] === '\r') a++; if (body[a] === '\n') a++; const e = body.lastIndexOf('endstream'); const start = m.index + m[0].indexOf(body) + a, len = e - a;
      const raw = u.subarray(start, start + len); data = /FlateDecode/.test(body.slice(0, s)) ? await docInflate(raw, false).catch(() => null) : raw; }
    objs[m[1]] = {dict: s >= 0 ? body.slice(0, s) : body, data};
  }
  const maps = {};   // fonte → mapa de código→texto
  const parseCMap = d => { const mp = {}, t = new TextDecoder('latin1').decode(d);
    (t.match(/beginbfchar[\s\S]*?endbfchar/g) || []).forEach(b => b.replace(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g, (x, a, c) => { mp[parseInt(a, 16)] = String.fromCharCode(...(c.match(/.{4}/g) || []).map(h => parseInt(h, 16))); }));
    (t.match(/beginbfrange[\s\S]*?endbfrange/g) || []).forEach(b => b.replace(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g, (x, a, z, c) => { let lo = parseInt(a, 16), hi = parseInt(z, 16), base = parseInt(c, 16); for (let k = lo; k <= hi && k - lo < 70000; k++) mp[k] = String.fromCharCode(base + k - lo); }));
    return mp; };
  const fontMap = {}; Object.keys(objs).forEach(id => { const o = objs[id]; if (/\/Type\s*\/Font\b/.test(o.dict) && /\/ToUnicode\s+(\d+)\s+0\s+R/.test(o.dict)) { const t = objs[/\/ToUnicode\s+(\d+)\s+0\s+R/.exec(o.dict)[1]]; if (t && t.data) fontMap[id] = parseCMap(t.data); } });
  const nameToObj = {}; Object.keys(objs).forEach(id => { const o = objs[id]; const fm = /\/Font\s*<<([^>]*)>>/.exec(o.dict); if (fm) fm[1].replace(/\/(\w+)\s+(\d+)\s+0\s+R/g, (x, n, r) => { nameToObj[n] = r; }); });
  const dec = (hex, mp) => { let o = ''; if (mp && Object.keys(mp).length) { const w = hex.length % 4 === 0 && Object.keys(mp).some(k => +k > 255) ? 4 : 2; for (let i = 0; i + w <= hex.length; i += w) o += mp[parseInt(hex.substr(i, w), 16)] || ''; } else for (let i = 0; i + 2 <= hex.length; i += 2) o += String.fromCharCode(parseInt(hex.substr(i, 2), 16)); return o; };
  const lines = [];
  for (const id of Object.keys(objs)) {
    const o = objs[id]; if (!o.data || /\/Type\s*\/(XObject|Font|FontDescriptor|ObjStm|XRef)/.test(o.dict)) continue;
    const t = new TextDecoder('latin1').decode(o.data); if (!/\bBT\b/.test(t)) continue;
    let mp = null, cur = '';
    t.replace(/\/(\w+)\s+[\d.]+\s+Tf|<([0-9a-fA-F]+)>\s*Tj|\[((?:<[0-9a-fA-F]*>|\([^)]*\)|[-\d.\s])*)\]\s*TJ|\(((?:\\.|[^\\)])*)\)\s*Tj|(T\*|Td|TD|Tm|ET)/g, (x, fn, h, arr, lit, op) => {
      if (fn) { mp = fontMap[nameToObj[fn]] || null; return; }
      if (h) cur += dec(h, mp);
      else if (arr) arr.replace(/<([0-9a-fA-F]*)>|\(((?:\\.|[^\\)])*)\)|(-?[\d.]+)/g, (y, hx, lt, num) => { if (hx != null) cur += dec(hx, mp); else if (lt != null) cur += lt.replace(/\\([()\\])/g, '$1'); else if (num && +num < -250) cur += ' '; });
      else if (lit != null) cur += lit.replace(/\\([()\\])/g, '$1');
      else if (op && cur) { if (op !== 'Td' || /\S/.test(cur)) { lines.push(cur); cur = ''; } }
    });
    if (cur) lines.push(cur);
  }
  const txt = lines.map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n');
  if (txt.replace(/\W/g, '').length < 40) throw new Error('Não consegui ler o texto deste PDF (pode ser escaneado ou protegido). Exporte o documento como Word (.docx) ou cole o texto.');
  return txt;
}
async function docReadFile(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase(), buf = await file.arrayBuffer();
  if (ext === 'docx') { const f = await docUnzip(buf, n => n === 'word/document.xml'); if (!f['word/document.xml']) throw new Error('Não encontrei o texto dentro do .docx.'); return docxText(new TextDecoder().decode(f['word/document.xml'])); }
  if (ext === 'pdf') return docPdfText(buf);
  if (ext === 'doc') throw new Error('Arquivo .doc (Word antigo) não é lido. Salve como .docx e envie de novo.');
  const t = new TextDecoder('utf-8').decode(buf);
  if (ext === 'html' || ext === 'htm') return docHtmlText(t);
  if (ext === 'rtf') return t.replace(/\\par[d]?/g, '\n').replace(/\\'([0-9a-f]{2})/gi, (x, h) => String.fromCharCode(parseInt(h, 16))).replace(/\{\\\*[^}]*\}|\\[a-z]+-?\d* ?|[{}]/g, '');
  if (ext === 'csv') return docCsv(t);
  if (ext === 'json') { try { const j = JSON.parse(t), flat = (o, k) => o && typeof o === 'object' ? Object.keys(o).map(x => flat(o[x], Array.isArray(o) ? k : x)).join('\n') : (k ? k + ': ' : '') + o; return flat(j, ''); } catch (e) { return t; } }
  return t;
}

/* ---------- leitor de seções (sem IA) ---------- */
const DOC_SEC = [
  ['produtos', /^(produtos?|servicos?|ofertas?|pacotes?|planos?|cursos?|programas?|catalogo|produtos e servicos|servicos e produtos)\b/],
  ['icp', /^(icps?|personas?|avatar|avatares|cliente ideal|publicos?|publico alvo|publico principal|audiencia|quem compra|perfil do cliente|perfil do publico)\b/],
  ['dores', /^(dores?|problemas?|frustracoes?|dificuldades|medos|dores e problemas|dor)\b/],
  ['duvidas', /^(duvidas?|objecoes?|perguntas( frequentes)?|faq|resistencias)\b/],
  ['desejos', /^(desejos?|sonhos?|aspiracoes?|resultados? desejados?|o que (ele|ela|eles|elas) (quer|querem)|motivacoes)\b/],
  ['urgencias', /^(urgencias?( ocultas?)?|gatilhos?|motivos? para agir|por que agora|medos ocultos|dores ocultas)\b/],
  ['concorrentes', /^(concorrentes?|concorrencia|mercado|referencias?)\b/],
  ['objetivos', /^(objetivos?|metas?|resultados? esperados?|o que (queremos|esperamos))\b/],
  ['canais', /^(canais|canal|plataformas?|redes( sociais)?|onde (anunciar|atuar))\b/],
  ['orcamento', /^(orcamento|verba|investimento( em midia)?|budget)\b/],
  ['prazo', /^(prazos?|cronograma|datas?|lancamento)\b/],
  ['tom', /^(tom( de voz)?|voz( da marca)?|linguagem|personalidade|comunicacao|estilo de comunicacao)\b/],
  ['vocab', /^(vocabulario|palavras? (preferidas|a usar)|termos? (preferidos|a usar)|usar)\b/],
  ['antivocab', /^(evitar|palavras? (proibidas|a evitar)|nunca (dizer|falar|usar)|nao (usar|dizer|falar)|proibido)\b/],
  ['regras', /^(regras?|restricoes?|compliance|legal|juridico|lgpd|limites?|cuidados?|observacoes legais)\b/],
  ['posicionamento', /^(posicionamento|proposta de valor|diferenciais?|diferenciacao|promessa)\b/],
  ['visual', /^(identidade visual|visual|estetica|direcao de arte|estilo visual|marca)\b/],
  ['cores', /^(paleta|cores?|cor da marca|cores da marca)\b/],
  ['fontes', /^(fontes?|tipografia)\b/],
  ['empresa', /^(empresa|sobre( a)? (empresa|nos)|quem somos|negocio|institucional|cliente|dados da empresa|contexto|resumo|historia)\b/],
  ['jornada', /^(jornada( de compra)?)\b/],
  ['produto_item', /^(produto|servico|oferta|pacote|plano|curso|programa)\s*\d*\s*[:\-–—]?\s*(.+)$/],
  ['icp_item', /^(icp|persona|avatar|publico)\s*\d*\s*[:\-–—]\s*(.+)$/]
];
const DOC_LAB = {   // rótulos "Chave: valor" → campo
  empresa: [/^(empresa|razao social|nome da empresa|cliente|marca|nome fantasia)$/, 'client'], segmento: [/^(segmento|nicho|ramo|area de atuacao|setor)$/, 'segment'],
  oferta: [/^(oferta|o que (a empresa )?(vende|faz|oferece)|produto principal)$/, 'offer'], publico: [/^(publico( alvo)?|publico principal|quem compra|cliente ideal)$/, 'audience'],
  problema: [/^(problema|dor principal|problema do cliente|principal problema)$/, 'problem'], objetivo: [/^(objetivo|meta|objetivo principal|objetivos?)$/, 'goal'],
  canais: [/^(canais?|plataformas?|redes sociais|onde anunciar)$/, 'channels'], orcamento: [/^(orcamento|verba|investimento mensal|budget|investimento em midia)$/, 'budget'], prazo: [/^(prazo|data|lancamento|cronograma)$/, 'deadline'],
  concorrentes: [/^(concorrentes?|concorrencia)$/, 'competitors'], tom: [/^(tom de voz|tom|voz|personalidade|linguagem)$/, 'tone'], vocab: [/^(vocabulario|palavras? a usar|usar)$/, 'vocab'], antivocab: [/^(evitar|palavras? a evitar|nunca dizer|nao usar|proibido)$/, 'antivocab'],
  regras: [/^(regras?|restricoes?|compliance|cuidados|regras de comunicacao)$/, 'rules'], posicionamento: [/^(posicionamento|proposta de valor|promessa|diferencial)$/, 'positioning'], visual: [/^(identidade visual|estetica|direcao de arte|estilo visual|visual)$/, 'visual'],
  paleta: [/^(paleta|cores?|cores da marca)$/, 'palette'], fontes: [/^(fontes?|tipografia)$/, 'fonts'], site: [/^(site|website|instagram|whatsapp|telefone|e mail|email|endereco|linkedin|youtube|tiktok)$/, 'contact']
};
const DOC_PROD = {name: /^(nome|produto|servico|oferta|nome do (produto|servico))$/, summary: /^(descricao|o que e|o que faz|resumo|sobre|oque)$/, audience: /^(para quem|publico|publico alvo|indicado para)$/, price: /^(preco|valor|investimento|ticket|preco medio)$/,
  benefits: /^(beneficios?|diferenciais?|resultados?|vantagens|transformacao)$/, features: /^(inclui|incluso|entregaveis|como funciona|o que inclui|conteudo|etapas|modulos)$/, objections: /^(objecoes?|duvidas|perguntas( frequentes)?|resistencias)$/,
  proofs: /^(provas?|depoimentos?|cases?|prova social|resultados comprovados|garantia)$/, checkout: /^(link|checkout|url|pagina de vendas|site)$/, prazo: /^(prazo|duracao|tempo)$/};
const DOC_ICP = {name: /^(nome|persona|avatar|icp|publico)$/, profile: /^(perfil|quem e|idade|descricao)$/, situation: /^(situacao|contexto|momento)$/, need: /^(necessidade|precisa de|o que precisa)$/, behavior: /^(comportamento|habitos|como age)$/,
  intent: /^(intencao|objetivo|o que busca)$/, pains: /^(dores?|problemas?|frustracoes?|dificuldades)$/, doubts: /^(duvidas?|objecoes?|perguntas)$/, desires: /^(desejos?|sonhos?|aspiracoes?)$/, hidden: /^(urgencias?( ocultas?)?|medos?( ocultos?)?|gatilhos?|motivos? ocultos?)$/};

function docParse(text) {
  const K = {client: '', segment: '', offer: '', audience: '', problem: '', goal: '', channels: '', budget: '', deadline: '', competitors: '', tone: '', vocab: '', antivocab: '', rules: '', positioning: '', visual: '', palette: '', fonts: '', contact: '', notes: '', products: [], icps: [], colors: []};
  const raw = String(text || '').replace(/\r/g, '').replace(/ /g, ' ').split('\n'), seenHex = new Set(), SUB = ['dores', 'duvidas', 'desejos', 'urgencias'], SUBF = {dores: 'pains', duvidas: 'doubts', desejos: 'desires', urgencias: 'hidden'};
  (String(text).match(/#[0-9a-fA-F]{6}\b/g) || []).forEach(h => { h = h.toLowerCase(); if (!seenHex.has(h) && K.colors.length < 12) { seenHex.add(h); K.colors.push(h); } });
  let sec = '', prod = null, icp = null, def = null, cur = null; const notes = [], tab = {on: false};
  const clean = x => x.replace(/\*\*|__|`/g, '').replace(/^\s*>\s*/, '').trim();
  const secOf = t => { const n = dnorm(t); for (const [k, re] of DOC_SEC) { if (k.endsWith('_item')) continue; if (re.test(n)) return k; } return ''; };
  const add = (o, k, v) => { v = String(v || '').trim(); if (!v) return; o[k] = o[k] ? (o[k] + '\n' + v) : v; };
  const listAdd = (arr, v) => { String(v).split(/\s*[;•]\s*|\n/).map(t => t.replace(/^[-•*–—]\s+/, '').trim()).filter(Boolean).forEach(t => { if (!arr.includes(t) && arr.length < 30) arr.push(t); }); };
  const newProd = n => { prod = {name: String(n || '').trim().slice(0, 160), summary: '', audience: '', price: '', benefits: [], features: [], objections: [], proofs: [], checkout: '', prazo: ''}; K.products.push(prod); cur = null; return prod; };
  const newIcp = n => { icp = {name: String(n || '').trim().slice(0, 120), profile: '', situation: '', need: '', behavior: '', intent: '', pains: '', doubts: '', desires: '', hidden: ''}; K.icps.push(icp); cur = null; return icp; };
  const defIcp = () => def || (def = K.icps.find(x => /^publico( principal| alvo)?$/.test(dnorm(x.name))) || newIcp('Público principal'));
  const setField = (o, M, key, val) => { for (const [k, re] of Object.entries(M)) if (re.test(key)) { if (k === 'name') { o.name = o.name || val; } else if (Array.isArray(o[k])) listAdd(o[k], val); else add(o, k, val); return k; } return ''; };
  const bare = v => String(v).replace(/^[-•*–—]\s+|^\d+[.)]\s+/, '').trim();
  const secAdd = (s, v) => {
    v = bare(v); if (!v) return;
    if (cur) { if (Array.isArray(cur.o[cur.k])) listAdd(cur.o[cur.k], v); else add(cur.o, cur.k, v); return; }
    if (SUB.includes(s)) { add(icp || defIcp(), SUBF[s], v); return; }
    if (s === 'produtos') { if (prod) { if (!prod.summary) prod.summary = v; else if (prod.benefits.length < 30) prod.benefits.push(v); } else newProd(v); return; }
    if (s === 'icp') { if (icp) { if (!icp.profile) icp.profile = v; else add(icp, 'situation', v); } else newIcp(v); return; }
    const map = {concorrentes: 'competitors', objetivos: 'goal', canais: 'channels', orcamento: 'budget', prazo: 'deadline', tom: 'tone', vocab: 'vocab', antivocab: 'antivocab', regras: 'rules', posicionamento: 'positioning', visual: 'visual', cores: 'palette', fontes: 'fonts', empresa: 'offer', jornada: 'notes'};
    if (map[s]) add(K, map[s], v); else notes.push(v);
  };
  for (let li = 0; li < raw.length; li++) {
    let L = clean(raw[li]); if (!L) continue;
    if (L[0] === '|') {   // tabelas
      const cells = L.replace(/^\||\|$/g, '').split('|').map(c => clean(c)); if (cells.every(c => /^:?-{2,}:?$/.test(c))) continue;
      const nxt = raw[li + 1] ? clean(raw[li + 1]) : '', hs = cells.map(dnorm);
      const isHead = !tab.on && cells.length >= 2 && nxt.startsWith('|') && hs.every(c => c.length <= 32) && hs.some(c => Object.values(DOC_PROD).some(re => re.test(c)) || Object.values(DOC_ICP).some(re => re.test(c)));
      if (!tab.on && cells.length === 2 && /^(campo|item|informacao|dado|dados|topico)$/.test(hs[0]) && nxt.startsWith('|')) { tab.on = true; tab.kind = 'kv'; continue; }
      if (tab.on && tab.kind === 'kv') { L = cells[0] + ': ' + cells.slice(1).filter(Boolean).join(' · '); if (!cells[0]) continue; }
      else {
      if (isHead) { tab.on = true; tab.h = hs; tab.kind = (hs.some(h => DOC_PROD.price.test(h)) || sec === 'produtos' || hs.some(h => /^(produto|servico|oferta|curso)/.test(h))) ? 'prod' : 'icp'; continue; }
      if (tab.on && tab.kind !== 'kv' && cells.length >= 2) {
        const o = tab.kind === 'prod' ? newProd('') : newIcp(''), M = tab.kind === 'prod' ? DOC_PROD : DOC_ICP;
        cells.forEach((c, i) => { if (c) { const k = setField(o, M, tab.h[i] || '', c); if (!k && !o.name) o.name = c; } });
        if (!o.name) (tab.kind === 'prod' ? K.products : K.icps).pop(); continue;
      }
      L = cells.length >= 2 ? cells[0] + ': ' + cells.slice(1).filter(Boolean).join(' · ') : cells[0]; if (!L) continue;
      }
    } else tab.on = false;
    let hm = /^(#{1,6})\s+(.*)$/.exec(L), title = hm ? hm[2].trim() : '', level = hm ? hm[1].length : 0;
    if (!hm) {
      const nm = /^(\d+(?:\.\d+)*)[.)]\s+(.{2,80})$/.exec(L);
      if (nm && (secOf(nm[2].replace(/:$/, '')) || /^(produto|servico|icp|persona)/.test(dnorm(nm[2])))) { title = nm[2]; level = 2; }
      else if (/^[A-ZÀ-Ú0-9][A-ZÀ-Ú0-9 /&\-–—,()]{3,70}:?$/.test(L) && /[A-ZÀ-Ú]{3}/.test(L) && !/\d{4,}/.test(L)) { title = L.replace(/:$/, ''); level = 1; }
      else if (/^[^:|]{2,60}:$/.test(L) && !/^[-•*]/.test(L)) { title = L.replace(/:$/, ''); level = 3; }
    }
    if (title) {
      title = title.replace(/^\d+(\.\d+)*[.)]?\s+/, ''); const n = dnorm(title), n2 = title.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\*\*/g, '').trim(); let m;
      if ((m = /^(produto|servico|oferta|pacote|plano|curso|programa)\s*\d*\s*[:\-–—]\s*(.+)$/.exec(n2)) || (m = /^(produto|servico|oferta|pacote|plano|curso|programa)\s+(\d+)$/.exec(n))) { const nm = title.replace(/^(produto|servi[çc]o|oferta|pacote|plano|curso|programa)\s*\d*\s*[:\-–—]?\s*/i, '').trim(); newProd(nm || title); icp = null; sec = 'produtos'; continue; }
      if ((m = /^(icp|persona|avatar)\s*\d*\s*[:\-–—]?\s*(.*)$/.exec(n)) && !(DOC_SEC.find(x => x[0] === 'icp')[1].test(n) && !/^(icp|persona|avatar)\b/.test(n))) { newIcp(title.replace(/^(icp|persona|avatar)\s*\d*\s*[:\-–—]?\s*/i, '').trim() || 'Público ' + (K.icps.length + 1)); prod = null; sec = 'icp'; continue; }
      // rótulo de campo do produto ou do público como subtítulo ("Benefícios", "Perfil"...)
      if (prod && sec === 'produtos') { const k = Object.keys(DOC_PROD).find(k2 => k2 !== 'name' && DOC_PROD[k2].test(n)); if (k) { cur = {o: prod, k}; continue; } }
      if (icp && (sec === 'icp' || SUB.includes(sec))) { const k = Object.keys(DOC_ICP).find(k2 => k2 !== 'name' && DOC_ICP[k2].test(n)); if (k && !SUB.includes(secOf(title))) { cur = {o: icp, k}; continue; } }
      const s = secOf(title);
      if (s) { cur = null; if (!SUB.includes(s)) { icp = s === 'icp' ? null : null; def = s === 'icp' ? null : def; } if (s !== 'produtos') prod = null; if (s === 'produtos') icp = null; sec = s; continue; }
      if (sec === 'produtos' && level >= 2) { newProd(title); continue; }
      if (sec === 'icp' && level >= 2) { newIcp(title); continue; }
      if (level >= 1 && level <= 2) { sec = ''; prod = null; icp = null; cur = null; notes.push(title); continue; }
      if (level === 3 && !cur) { notes.push(title); continue; }
    }
    const lm = /^[-•*–—\d.)\s]*([^:]{2,50}):\s+(.+)$/.exec(L);
    if (lm) {
      const key = dnorm(lm[1]), val = lm[2].trim(); let done = false; cur = null;
      if (/^(produto|servico|oferta|pacote|plano|curso|programa)( \d+)?$/.test(key)) { newProd(val); icp = null; sec = 'produtos'; continue; }
      if (/^(icp|persona|avatar)( \d+)?$/.test(key)) { newIcp(val); prod = null; sec = 'icp'; continue; }
      if (prod && sec === 'produtos') { if (setField(prod, DOC_PROD, key, val)) { if (DOC_PROD.name.test(key) && prod.name !== val && !/^(nome|produto|servico)/.test(key)) { /* ok */ } done = true; } }
      if (!done && icp && (sec === 'icp' || SUB.includes(sec))) { if (setField(icp, DOC_ICP, key, val)) done = true; }
      if (!done && SUB.includes(secOf(lm[1]))) { add(icp || defIcp(), SUBF[secOf(lm[1])], val); done = true; }
      if (!done && (sec === 'icp' || SUB.includes(sec)) && !icp) { const t = defIcp(); if (setField(t, DOC_ICP, key, val)) done = true; }
      if (!done) for (const [, [re, f]] of Object.entries(DOC_LAB)) if (re.test(key)) { if (f === 'contact') K.contact += (K.contact ? '\n' : '') + lm[1].trim() + ': ' + val; else add(K, f, val); done = true; break; }
      if (!done) { const s = secOf(lm[1]); if (s) { const keep = sec; secAdd(s, val); sec = keep; done = true; } }
      if (!done) notes.push(L);
      continue;
    }
    secAdd(sec, L);
  }
  K.products = K.products.filter(x => x.name || x.summary).map(x => { x.name = x.name || (x.summary || '').slice(0, 60); return x; });
  K.icps = K.icps.filter(x => x.name || x.pains || x.desires).map(x => { x.name = x.name || 'Público principal'; return x; });
  K.notes = notes.filter(Boolean).slice(0, 80).join('\n');
  return K;
}

/* ---------- IA (opcional) ---------- */
async function docAI(text) {
  const sys = 'Você lê um documento de briefing de marketing e extrai os dados em JSON. Use SOMENTE o que está no documento; não invente. Campos ausentes ficam vazios. Formato: {"client":"","segment":"","offer":"","audience":"","problem":"","goal":"","channels":"","budget":"","deadline":"","competitors":"","tone":"","vocab":"","antivocab":"","rules":"","positioning":"","visual":"","palette":"","fonts":"","products":[{"name":"","summary":"","audience":"","price":"","benefits":[],"features":[],"objections":[],"proofs":[],"checkout":"","prazo":""}],"icps":[{"name":"","profile":"","situation":"","need":"","behavior":"","intent":"","pains":"uma por linha, na fala da pessoa","doubts":"uma por linha","desires":"uma por linha","hidden":"urgências ocultas, uma por linha"}]}';
  const j = await aiJSON(sys, 'DOCUMENTO:\n' + String(text).slice(0, 26000));
  const K = docParse(''); const S = v => String(v == null ? '' : v).trim(), A = v => (Array.isArray(v) ? v : String(v || '').split(/\n|;/)).map(S).filter(Boolean);
  ['client', 'segment', 'offer', 'audience', 'problem', 'goal', 'channels', 'budget', 'deadline', 'competitors', 'tone', 'vocab', 'antivocab', 'rules', 'positioning', 'visual', 'palette', 'fonts'].forEach(k => { K[k] = S(j[k]); });
  K.products = (Array.isArray(j.products) ? j.products : []).filter(x => x && S(x.name)).slice(0, 40).map(x => ({name: S(x.name), summary: S(x.summary), audience: S(x.audience), price: S(x.price), benefits: A(x.benefits), features: A(x.features), objections: A(x.objections), proofs: A(x.proofs), checkout: S(x.checkout), prazo: S(x.prazo)}));
  K.icps = (Array.isArray(j.icps) ? j.icps : []).filter(x => x && S(x.name)).slice(0, 6).map(x => ({name: S(x.name), profile: S(x.profile), situation: S(x.situation), need: S(x.need), behavior: S(x.behavior), intent: S(x.intent), pains: A(x.pains).join('\n'), doubts: A(x.doubts).join('\n'), desires: A(x.desires).join('\n'), hidden: A(x.hidden).join('\n')}));
  return K;
}
/* junta: o que o leitor de seções achou completa o que a IA deixou vazio */
function docMerge(A, B) {
  const R = Object.assign({}, A); ['client', 'segment', 'offer', 'audience', 'problem', 'goal', 'channels', 'budget', 'deadline', 'competitors', 'tone', 'vocab', 'antivocab', 'rules', 'positioning', 'visual', 'palette', 'fonts', 'contact', 'notes'].forEach(k => { if (!R[k] && B[k]) R[k] = B[k]; });
  R.colors = (A.colors && A.colors.length) ? A.colors : (B.colors || []); R.products = (A.products || []).slice(); R.icps = (A.icps || []).slice();
  (B.products || []).forEach(x => { if (!R.products.some(y => dnorm(y.name) === dnorm(x.name))) R.products.push(x); }); (B.icps || []).forEach(x => { if (!R.icps.some(y => dnorm(y.name) === dnorm(x.name))) R.icps.push(x); });
  return R;
}

/* ---------- aplicar sem perder nada ---------- */
const DOC_LIST_ICP = ['pains', 'doubts', 'desires', 'hidden'];
const docLines = v => String(v || '').split('\n').map(t => t.replace(/^[-•*\d.)\s]+/, '').replace(/\s+/g, ' ').trim()).filter(Boolean);
function docApply(p, K, opt) {
  opt = opt || {}; const br = p.brief, doc = br.doc || (br.doc = {name: '', at: '', text: '', prev: {}}); doc.prev = doc.prev || {}; const prev = doc.prev, rep = {fields: [], prodNew: 0, prodUpd: 0, icpNew: 0, icpUpd: 0, banks: 0, skipped: []};
  const put = (o, k, v, pk) => { v = String(v || '').trim(); if (!v) return; const cur = String(o[k] || '').trim(), key = pk || k; if (!cur || cur === (prev[key] || '')) { if (cur !== v) { o[k] = v; rep.fields.push(key); } prev[key] = v; } };
  put(br, 'offer', K.offer || (K.products || []).map(x => x.name + (x.summary ? ': ' + x.summary : '')).join('\n'), 'offer'); put(br, 'audience', K.audience || (K.icps || []).map(x => x.name + (x.profile ? ': ' + x.profile : '')).join('\n'), 'audience');
  put(br, 'problem', K.problem || (K.icps[0] ? docLines(K.icps[0].pains).slice(0, 4).join('\n') : ''), 'problem'); put(br, 'goal', K.goal); put(br, 'channels', K.channels); put(br, 'budget', K.budget); put(br, 'deadline', K.deadline); put(br, 'competitors', K.competitors);
  const extra = [K.segment ? 'Segmento: ' + K.segment : '', K.contact].filter(Boolean).join('\n'); if (extra && !String(br.notes || '').includes(extra.split('\n')[0])) br.notes = (br.notes ? br.notes + '\n' : '') + extra;
  if (!String(p.client || '').trim() && K.client) { p.client = K.client; rep.fields.push('client'); }
  const b = p.brand || (p.brand = {}), v = p.voice || (p.voice = {});
  put(b, 'positioning', K.positioning, 'b.positioning'); put(b, 'tone', K.tone, 'b.tone'); put(b, 'visual', K.visual, 'b.visual'); put(b, 'rule', (K.rules || '').split('\n')[0], 'b.rule');
  const pal = K.palette || ((K.colors || []).length ? 'Cores do documento: ' + K.colors.join(' · ') : ''); put(b, 'palette', pal, 'b.palette'); put(b, 'instructions', K.fonts ? 'Fontes do documento: ' + K.fonts : '', 'b.instructions');
  put(v, 'vocabulary', K.vocab, 'v.vocab'); put(v, 'antivocab', K.antivocab, 'v.anti'); put(v, 'rules', K.rules, 'v.rules'); put(v, 'personality', K.tone, 'v.pers');
  // produtos: acrescenta, nunca apaga
  const TYPE = n => /e-?book|ebook/i.test(n) ? 'ebook' : /curso|treinamento|mentoria|imers|aula/i.test(n) ? 'curso' : /evento|workshop|palestra/i.test(n) ? 'evento' : /servi|consultoria|assessoria|atendimento/i.test(n) ? 'servico' : 'produto';
  const list = (p.products = p.products || []);
  (K.products || []).forEach(x => {
    const ex = list.find(y => dnorm(y.name) === dnorm(x.name));
    if (ex) { ['summary', 'audience', 'price', 'checkout'].forEach(k => { if (!String(ex[k] || '').trim() && x[k]) ex[k] = x[k]; }); ['benefits', 'features', 'objections', 'proofs'].forEach(k => { const cur = ex[k] || (ex[k] = []); (x[k] || []).forEach(t => { if (!cur.some(c => dnorm(c) === dnorm(t)) && cur.length < 30) cur.push(t); }); }); rep.prodUpd++; }
    else if (list.length < 200) { list.push({id: uid('pd'), name: x.name, type: TYPE(x.name + ' ' + (x.summary || '')), summary: x.summary || '', price: x.price || '', audience: x.audience || '', checkout: /^https?:\/\/\S+$/i.test(x.checkout || '') ? x.checkout : '', benefits: x.benefits || [], features: (x.features || []).concat(x.prazo ? ['Prazo: ' + x.prazo] : []), objections: x.objections || [], proofs: x.proofs || [], images: []}); rep.prodNew++; }
  });
  p.products = normalizeProducts(list);
  // ICPs: completa campos vazios, soma linhas novas
  const pre = p.pre; pre.icps = pre.icps || [];
  (K.icps || []).forEach(x => {
    const nx = dnorm(x.name), ex = pre.icps.find(y => { const ny = dnorm(y.name); return ny === nx || (nx.length > 5 && (ny.startsWith(nx) || nx.startsWith(ny))); }) || ((nx === 'publico principal' && pre.icps.length === 1) ? pre.icps[0] : null);
    if (ex) { ['profile', 'situation', 'need', 'behavior', 'intent'].forEach(k => { if (!String(ex[k] || '').trim() && x[k]) ex[k] = x[k]; }); DOC_LIST_ICP.forEach(k => { const cur = docLines(ex[k]); docLines(x[k]).forEach(t => { if (!cur.some(c => dnorm(c) === dnorm(t))) cur.push(t); }); ex[k] = cur.join('\n'); }); rep.icpUpd++; }
    else if (pre.icps.length < 6) { const o = {edited: true}; ['name', 'profile', 'situation', 'need', 'behavior', 'intent', 'pains', 'doubts', 'desires', 'hidden'].forEach(k => { o[k] = String(x[k] || '').trim(); }); pre.icps.push(o); rep.icpNew++; }
    else rep.skipped.push(x.name);
  });
  if (!String(pre.briefing || '').trim()) pre.briefing = [K.client ? 'Cliente: ' + K.client + '.' : '', K.offer || '', K.audience ? 'Público: ' + K.audience : '', K.problem ? 'Problema: ' + K.problem : ''].filter(Boolean).join(' ').slice(0, 1500);
  // campanhas que já existem: soma as linhas novas aos bancos (sem apagar, sem mexer nas peças)
  if (opt.banks !== false) {
    const FIELD = {dor: 'pains', duvida: 'doubts', desejo: 'desires', urgencia: 'hidden'};
    (p.campaigns || []).forEach(c => { const bank = c.bank || (c.bank = {}); Object.keys(FIELD).forEach(k => { const cur = bank[k] || (bank[k] = []); pre.icps.forEach(i => docLines(i[FIELD[k]]).forEach(t => { if (cur.length < 20 && !cur.some(z => dnorm(z) === dnorm(t))) { cur.push(t); rep.banks++; } })); });
      const s = bank.s || (bank.s = []); (p.products || []).forEach(x => { const t = (x.summary || '').split(/(?<=[.!?])\s/)[0]; if (t && t.length <= 160 && s.length < 8 && !s.some(z => dnorm(z) === dnorm(t))) { s.push(t); rep.banks++; } }); });
  }
  if (pre.history) pre.history.unshift({at: new Date().toISOString(), action: 'Documento do projeto importado', note: `${doc.name || 'documento'}: ${rep.prodNew} produto(s) novo(s), ${rep.icpNew} público(s) novo(s), ${rep.icpUpd + rep.prodUpd} atualizado(s).`});
  if (typeof preTouch === 'function') { try { preTouch(); } catch (e) { /* sem tela do pré-projeto */ } }
  return rep;
}
/* quando ainda não há público no Pré-Projeto, as peças usam o que o briefing diz (público e problema) */
function projIcps(p) {
  const L = (p.pre && p.pre.icps) || []; if (L.length) return L;
  const br = p.brief || {}; if (!String(br.audience || '').trim() && !String(br.problem || '').trim()) return [];
  const ln = v => docLines(v); return [{name: ln(br.audience)[0] || 'Público', profile: ln(br.audience).join(' · '), situation: '', need: '', behavior: '', intent: '', pains: ln(br.problem).join('\n'), doubts: '', desires: '', hidden: ''}];
}

/* ---------- tela ---------- */
function docOpen() {
  const p = curProject(); if (!p) { toast('Crie ou escolha um projeto primeiro.'); return; }
  docUI.K = null; docUI.text = ''; docUI.name = ''; docUI.via = '';
  const d = (p.brief || {}).doc;
  showModal('Subir o documento do projeto', `<p style="margin-top:0">Suba o briefing completo (Word, PDF, texto, Markdown, HTML, CSV). O Studio reconhece <b>empresa, produtos, públicos (ICP), dores, dúvidas, desejos, urgências ocultas, tom de voz, regras e cores</b> e leva para o projeto e para todas as peças. <b>O que você já preencheu não é apagado.</b></p>
    ${d && d.name ? `<p class="muted" style="font-size:12.5px">Último documento: <b>${esc(d.name)}</b> (${esc(typeof fmtDateTime === 'function' ? fmtDateTime(d.at) : d.at)}). Subir outro só acrescenta o que falta.</p>` : ''}
    <input type="file" id="docFile" accept=".docx,.pdf,.txt,.md,.markdown,.html,.htm,.rtf,.csv,.json" onchange="docPick(this)">
    <div class="field" style="margin-top:10px"><label>Ou cole o texto do documento</label><textarea id="docPaste" rows="6" placeholder="Cole aqui o briefing..."></textarea></div>
    <div id="docMsg" class="muted" style="font-size:13px;margin:6px 0"></div><div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="docRead()">Ler o documento</button></div>`);
  $('modalBox').classList.add('wide');
}
async function docPick(inp) {
  const f = inp.files[0]; if (!f) return; if (f.size > 12e6) { $('docMsg').textContent = 'Arquivo grande demais (máx. 12 MB).'; return; }
  $('docMsg').textContent = 'Lendo ' + f.name + '…';
  try { docUI.text = await docReadFile(f); docUI.name = f.name; $('docMsg').textContent = `Li ${docUI.text.length.toLocaleString('pt-BR')} caracteres de ${f.name}. Clique em “Ler o documento”.`; $('docPaste').value = docUI.text.slice(0, 4000); }
  catch (e) { docUI.text = ''; $('docMsg').textContent = e.message; }
}
async function docRead() {
  const pasted = ($('docPaste') || {}).value || '', text = docUI.text && (!pasted || pasted === docUI.text.slice(0, 4000)) ? docUI.text : pasted;
  if (String(text).trim().length < 40) { $('docMsg').textContent = 'Escolha um arquivo ou cole o texto (pelo menos algumas linhas).'; return; }
  docUI.text = text; if (!docUI.name) docUI.name = 'texto colado'; $('docMsg').textContent = 'Reconhecendo…'; docUI.via = 'leitor de seções';
  let K = docParse(text);
  if (typeof aiReady === 'function' && aiReady()) { try { const A = await docAI(text); K = docMerge(A, K); docUI.via = 'IA + leitor de seções'; } catch (e) { docUI.via = 'leitor de seções (a IA falhou: ' + e.message + ')'; } }
  docUI.K = K; docReview();
}
function docSum(K) {
  const n = a => (a || []).length;
  return {prod: n(K.products), icp: n(K.icps), pains: K.icps.reduce((a, x) => a + docLines(x.pains).length, 0), doubts: K.icps.reduce((a, x) => a + docLines(x.doubts).length, 0), desires: K.icps.reduce((a, x) => a + docLines(x.desires).length, 0), hidden: K.icps.reduce((a, x) => a + docLines(x.hidden).length, 0)};
}
function docReview() {
  const K = docUI.K, s = docSum(K), p = curProject();
  const fld = [['Empresa/cliente', K.client], ['Segmento', K.segment], ['Oferta', K.offer], ['Público', K.audience], ['Problema', K.problem], ['Objetivo', K.goal], ['Canais', K.channels], ['Orçamento', K.budget], ['Prazo', K.deadline], ['Concorrentes', K.competitors], ['Tom de voz', K.tone], ['Vocabulário', K.vocab], ['Evitar', K.antivocab], ['Regras', K.rules], ['Posicionamento', K.positioning], ['Visual', K.visual], ['Cores', K.palette || (K.colors || []).join(' ')], ['Fontes', K.fonts]].filter(x => x[1]);
  showModal('O que o Studio entendeu', `<p style="margin-top:0">Leitura feita por <b>${esc(docUI.via)}</b>. Confira e, se estiver certo, aplique. <b>Nada que você já escreveu será apagado.</b></p>
    <div class="cards" style="margin-bottom:10px"><div class="card"><div class="label">Produtos/serviços</div><div class="metric">${s.prod}</div></div><div class="card"><div class="label">Públicos (ICP)</div><div class="metric">${s.icp}</div></div><div class="card"><div class="label">Dores</div><div class="metric">${s.pains}</div></div><div class="card"><div class="label">Dúvidas</div><div class="metric">${s.doubts}</div></div><div class="card"><div class="label">Desejos</div><div class="metric">${s.desires}</div></div><div class="card"><div class="label">Urgências ocultas</div><div class="metric">${s.hidden}</div></div></div>
    ${(!s.prod && !s.icp) ? '<div class="note" style="background:#fff8e6;border:1px solid #f0dca8;border-radius:10px;padding:8px 12px;margin:8px 0">Não reconheci produtos nem públicos. Se o documento usa outros títulos, use seções como “Produtos”, “Público (ICP)”, “Dores”, “Dúvidas”, “Desejos” e “Urgências ocultas”, ou ligue a IA em Configurações → Integrações.</div>' : ''}
    ${K.products.length ? `<h4>Produtos e serviços</h4><div class="list">${K.products.slice(0, 12).map(x => `<div class="list-item"><div><strong>${esc(x.name)}</strong><small>${esc((x.summary || '').slice(0, 140))}${x.price ? ' · ' + esc(x.price) : ''}</small></div></div>`).join('')}</div>` : ''}
    ${K.icps.length ? `<h4>Públicos</h4><div class="list">${K.icps.slice(0, 6).map(x => `<div class="list-item"><div><strong>${esc(x.name)}</strong><small>${docLines(x.pains).length} dores · ${docLines(x.doubts).length} dúvidas · ${docLines(x.desires).length} desejos · ${docLines(x.hidden).length} urgências</small></div></div>`).join('')}</div>` : ''}
    ${fld.length ? `<h4>Campos reconhecidos</h4><div class="list">${fld.map(x => `<div class="list-item"><div><strong>${x[0]}</strong><small>${esc(String(x[1]).slice(0, 160))}</small></div></div>`).join('')}</div>` : ''}
    <label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" ${docUI.opt.banks ? 'checked' : ''} onchange="docUI.opt.banks=this.checked"> Também acrescentar às campanhas que já existem (bancos de dores, dúvidas, desejos e urgências). Peças prontas não mudam.</label>
    <div class="modal-actions"><button class="btn" onclick="docOpen()">← Voltar</button><button class="btn dark" onclick="docConfirm()">Aplicar ao projeto</button></div>`);
  $('modalBox').classList.add('wide');
}
function docConfirm() {
  const p = curProject(), K = docUI.K; if (!p || !K) return;
  const doc = p.brief.doc || (p.brief.doc = {name: '', at: '', text: '', prev: {}}); doc.name = docUI.name.slice(0, 120); doc.at = new Date().toISOString(); doc.text = String(docUI.text).slice(0, 60000);
  const r = docApply(p, K, docUI.opt); persist(); closeModal();
  toast(`Documento aplicado: ${r.prodNew} produto(s) e ${r.icpNew} público(s) novos, ${r.prodUpd + r.icpUpd} completados${r.banks ? ', ' + r.banks + ' linhas nos bancos das campanhas' : ''}.`);
  showModal('Documento aplicado ao projeto', `<p style="margin-top:0">Tudo o que você já tinha foi mantido. Agora estes lugares usam o documento:</p><ul style="line-height:1.7"><li><b>Pré-projeto:</b> ${p.pre.icps.length} público(s) com dores, dúvidas, desejos e urgências ocultas.</li><li><b>Produtos e serviços:</b> ${(p.products || []).length}.</li><li><b>Campanhas, Stories, roteiros de vídeo, carrosséis, landing e IA:</b> passam a puxar daqui. Novos Stories e novas campanhas já nascem com esse material${r.banks ? '; nas campanhas existentes foram somadas ' + r.banks + ' linhas aos bancos' : ''}.</li></ul>${r.skipped.length ? `<p class="muted">O Pré-Projeto aceita 6 públicos. Ficaram de fora: ${esc(r.skipped.join(', '))}.</p>` : ''}<div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button><button class="btn dark" onclick="closeModal();go('campaigns')">Ir para as campanhas</button></div>`);
  if (typeof refreshCurrentView === 'function') refreshCurrentView();
}
/* faixa que mostra, em cada tela de criação, de onde o projeto está puxando as informações */
function docStrip(p) {
  const ic = (p.pre && p.pre.icps || []).length, pr = (p.products || []).length, d = (p.brief || {}).doc, lg = ((p.design || {}).brand || {}).logos || [];
  const empty = !ic && !pr && !String((p.brief || {}).audience || '').trim();
  return `<div class="doc-strip ${empty ? 'warn' : ''}"><span><b>Projeto: ${esc(p.name)}</b> · ${ic} público(s) · ${pr} produto(s)/serviço(s) · ${lg.length} logo(s)${d && d.name ? ' · documento: ' + esc(d.name) : ''}</span><span class="doc-strip-act">${empty ? 'As peças estão sem informações do projeto. ' : ''}<button class="btn sm ${empty ? 'dark' : ''}" onclick="docOpen()">📄 ${d && d.name ? 'Atualizar com outro documento' : 'Subir o documento do projeto'}</button></span></div>`;
}
const DOC_STRIP_PAGES = ['stories', 'campaigns', 'carrosseis', 'videoLab', 'landings', 'feed', 'editorial'];
function docInjectStrip(page) {
  if (!DOC_STRIP_PAGES.includes(page)) return; const root = $('page-' + page); if (!root) return; root.querySelectorAll('.doc-strip').forEach(n => n.remove());
  const p = curProject(); if (!p) return; const host = root.querySelector('.subpage') || root; host.insertAdjacentHTML('afterbegin', docStrip(p));
}

function docCard(p) {
  const d = (p.brief || {}).doc;
  return `<div class="jp-panel" style="border-left:4px solid #111"><div class="section-row"><div><h3 style="margin:0">📄 Documento do projeto</h3><p class="sub" style="margin:2px 0 0">Suba o briefing completo (Word, PDF, texto). O Studio reconhece produtos, públicos, dores, dúvidas, desejos, urgências, tom de voz e cores, e leva para o projeto e para <b>todas as peças</b>, sem apagar o que você já fez.${d && d.name ? ' Último: <b>' + esc(d.name) + '</b>.' : ''}</p></div><button class="btn dark" onclick="docOpen()">${d && d.name ? 'Subir outro documento' : 'Subir o documento'}</button></div></div>`;
}
