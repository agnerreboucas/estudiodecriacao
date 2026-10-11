/* Subir o documento do projeto → Ficha completa.
   Lê Word (.docx), PDF, texto, Markdown, HTML, RTF, CSV e JSON. Três leitores, do mais exato ao mais livre:
   1) pelo formato do TEMPLATE da ficha (pergunta → resposta; ☑ nas escolhas) — baixe o template em Word ou Markdown, preencha e suba;
   2) com IA ligada, a IA lê um documento livre e preenche as perguntas (só com o que está escrito);
   3) o leitor de seções do Studio (Produtos, Público, Dores, Tom de voz…), que já existia.
   O que o documento trouxer entra na ficha SEM apagar o que já estava respondido (a não ser que você escolha substituir). */
const FD = {text: '', name: '', res: null, target: 'cur', newName: '', replace: false, icp: true};
const fdNorm = s => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\*|_{2,}/g, '').replace(/[^a-z0-9]+/g, '');
const fdOpts = f => (Array.isArray(f[3]) ? f[3] : f[4]) || [];
const fdSecs = () => BF_SECTIONS.filter(s => !s.files);

/* ---------- template: linhas → Markdown / Word ---------- */
function fdTplLines(a, blank) {
  a = a || {}; const L = [];
  L.push(['h1', 'Ficha completa do projeto'], ['p', 'Como preencher: escreva a resposta logo abaixo de cada pergunta. Nas escolhas, troque ☐ por ☑ (e ○ por ◉). Não mude o texto das perguntas nem dos títulos. Escreva só o que for verdadeiro; o que não souber, deixe em branco. * = obrigatório.']);
  BF_SECTIONS.forEach((s, i) => {
    L.push(['h2', `${i + 1} · ${s.t}`]); if (s.d) L.push(['p', s.d]);
    if (s.files) { L.push(['p', 'Fotos e arquivos não vão neste documento: envie pelo link do cliente ou pela Biblioteca de imagens do Studio.']); return; }
    const n = s.repeat ? (blank ? Math.min(3, s.repeat) : Math.max(1, (a[s.k] || []).length)) : 1;
    for (let k = 0; k < n; k++) {
      if (s.repeat) L.push(['h3', `${s.item} ${k + 1}`]);
      const src = s.repeat ? ((a[s.k] || [])[k] || {}) : (a[s.k] || {});
      s.f.forEach(f => {
        L.push(['q', f[1] + (f[3] === 1 ? ' *' : '')]); const o = fdOpts(f), v = src[f[0]];
        if (f[2] === 'checks') o.forEach(x => L.push(['o', ((Array.isArray(v) && v.includes(x)) ? '☑ ' : '☐ ') + x]));
        else if (f[2] === 'select') o.forEach(x => L.push(['o', (v === x ? '◉ ' : '○ ') + x]));
        else { const t = FP_CELL(v); (t ? t.split('\n') : ['']).forEach(x => L.push(['a', x])); }
      });
    }
    if (s.repeat && blank) L.push(['p', `Precisa de mais? Copie o bloco "${s.item}" quantas vezes quiser (até ${s.repeat}).`]);
  });
  return L;
}
const fdTplMd = (a, blank) => fdTplLines(a, blank).map(([t, x]) => t === 'h1' ? '# ' + x : t === 'h2' ? '\n## ' + x : t === 'h3' ? '\n### ' + x : t === 'q' ? '\n**' + x + '**' : x).join('\n');
function fdDocx(a, blank) {
  const E = s => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const ST = {h1: {b: 1, sz: 40, after: 120}, h2: {b: 1, sz: 30, before: 320, after: 80, color: 'E8590C'}, h3: {b: 1, sz: 26, before: 200, after: 60}, p: {sz: 20, color: '5D6470', after: 80}, q: {b: 1, sz: 22, before: 160, after: 40}, o: {sz: 22}, a: {sz: 22, after: 20}};
  const para = ([t, x]) => { const s = ST[t] || {}; return `<w:p><w:pPr><w:spacing w:before="${s.before || 0}" w:after="${s.after || 0}"/></w:pPr><w:r><w:rPr>${s.b ? '<w:b/>' : ''}${s.color ? `<w:color w:val="${s.color}"/>` : ''}<w:sz w:val="${s.sz || 22}"/></w:rPr><w:t xml:space="preserve">${E(x)}</w:t></w:r></w:p>`; };
  const H = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', enc = new TextEncoder(), f = (name, text) => ({name, data: enc.encode(text)});
  const doc = `${H}<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${fdTplLines(a, blank).map(para).join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  return xmZip([f('[Content_Types].xml', `${H}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`),
    f('_rels/.rels', `${H}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`), f('word/document.xml', doc)], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}
function fdDownload(kind, filled) {
  const p = curProject(), a = filled && p ? fpA() : {}, nm = 'ficha-' + (p ? slug(p.name) : 'projeto') + (filled ? '' : '-template');
  if (kind === 'docx') download(nm + '.docx', fdDocx(a, !filled), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'); else download(nm + '.md', fdTplMd(a, !filled), 'text/markdown');
}

/* ---------- leitor 1: pelo formato do template ---------- */
const fdPlaceholder = l => /^[_\-–—.…\s]{3,}$/.test(l) || /^\((escreva|responda|preencha)[^)]*\)$/i.test(l) || /^precisa de mais\?/i.test(l);
function fdConv(f, buf) {
  let lines = buf.map(x => x.replace(/^[-•*]\s+/, '')).filter((x, i, a) => !fdPlaceholder(x)); while (lines.length && !lines[0].trim()) lines.shift(); while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  const o = fdOpts(f), SEL = /^(☑|☒|✔|✓|◉|●|\[[xX✓]\]|\([xX]\)|[xX]\s)\s*(.*)$/, UN = /^(☐|○|◯|\[\s?\]|\(\s?\))\s*(.*)$/;
  if (f[2] === 'checks') { const out = []; lines.forEach(l => { if (UN.test(l)) return; const m = SEL.exec(l), tx = m ? m[2] : l; let hit = o.find(x => fdNorm(x) === fdNorm(tx)); const parts = hit ? [tx] : tx.split(/;/); parts.forEach(pt => { const op = o.find(x => fdNorm(x) === fdNorm(pt)); if (op && !out.includes(op)) out.push(op); }); }); return out; }
  if (f[2] === 'select') { for (const l of lines) { if (UN.test(l)) continue; const m = SEL.exec(l), tx = m ? m[2] : l, op = o.find(x => fdNorm(x) === fdNorm(tx)); if (op) return op; } return ''; }
  const t = lines.join(f[2] === 'area' ? '\n' : ' ').replace(/\n{3,}/g, '\n\n').trim(); return t.slice(0, 4000);
}
function fdParse(text) {
  const idx = fdSecs().map(s => ({s, key: fdNorm(s.t), labels: s.f.map(f => ({f, text: f[1], key: fdNorm(f[1].replace(/\s*\*$/, ''))}))})), ans = {}, hit = {}; let cur = null, item = 0, fld = null, buf = [], count = 0;
  const flush = () => { if (cur && fld) { const v = fdConv(fld.f, buf); if (fpFilled(v)) { if (cur.s.repeat) { if (!Array.isArray(ans[cur.s.k])) ans[cur.s.k] = []; (ans[cur.s.k][item] = ans[cur.s.k][item] || {})[fld.f[0]] = v; } else (ans[cur.s.k] = ans[cur.s.k] || {})[fld.f[0]] = v; count++; hit[cur.s.k] = (hit[cur.s.k] || 0) + 1; } } fld = null; buf = []; };
  for (const raw of String(text || '').replace(/\r/g, '').replace(/ /g, ' ').split('\n')) {
    const t = raw.trim().replace(/^[#>\s]+/, '').replace(/\*\*|__/g, '').trim(); if (!t) { if (fld) buf.push(''); continue; }
    const hk = fdNorm(t.replace(/^\d+\s*[·.\-)]\s*/, '')), sh = idx.find(x => x.key === hk); if (sh) { flush(); cur = sh; item = 0; continue; }
    if (BF_SECTIONS.some(x => x.files && fdNorm(x.t) === hk)) { flush(); cur = null; continue; }
    if (cur && cur.s.repeat) { const m = t.match(/^(.*?)\s*(\d+)$/); if (m && fdNorm(m[1]) === fdNorm(cur.s.item)) { flush(); item = Math.max(0, Math.min(cur.s.repeat - 1, +m[2] - 1)); continue; } }
    const k = fdNorm(t.replace(/\s*\*$/, '')); let lb = cur && cur.labels.find(l => l.key === k), inline = '';
    if (!lb && cur) { const l2 = cur.labels.find(l => t.length > l.text.length && fdNorm(t.slice(0, l.text.length)) === l.key && /^\s*[:\-–→]/.test(t.slice(l.text.length))); if (l2) { lb = l2; inline = t.slice(l2.text.length).replace(/^\s*[:\-–→]\s*/, ''); } }
    if (!lb && !cur) { const g = idx.flatMap(x => x.labels.filter(l => l.key === k).map(l => ({x, l}))); if (g.length === 1) { flush(); cur = g[0].x; lb = g[0].l; } }
    if (lb) { flush(); fld = lb; buf = inline ? [inline] : []; continue; }
    if (/^\s*(#{1,6}\s|\*\*[^*]+\*\*\s*$)/.test(raw)) { flush(); continue; }   // título ou pergunta em negrito que não conheço: não entra na resposta anterior
    if (fld) buf.push(raw.trim().replace(/^[#>\s]+/, '').replace(/\*\*|__/g, ''));
  }
  flush(); return {answers: ans, count, hit};
}

/* ---------- leitor 2: IA (só com IA ligada) ---------- */
function fdSanitize(j) {
  const out = {}, S = v => (Array.isArray(v) ? v.join('\n') : String(v == null ? '' : v)).trim().slice(0, 4000);
  const conv = (f, v) => { if (f[2] === 'checks') { const arr = Array.isArray(v) ? v : String(v || '').split(/;|\n/); return arr.map(x => fdOpts(f).find(o => fdNorm(o) === fdNorm(x))).filter((x, i, a) => x && a.indexOf(x) === i); } if (f[2] === 'select') return fdOpts(f).find(o => fdNorm(o) === fdNorm(v)) || ''; return S(v); };
  j = j && typeof j === 'object' ? j : {};
  fdSecs().forEach(s => {
    if (s.repeat) { const list = (Array.isArray(j[s.k]) ? j[s.k] : []).slice(0, s.repeat).map(it => { const o = {}; s.f.forEach(f => { const v = conv(f, (it || {})[f[0]]); if (fpFilled(v)) o[f[0]] = v; }); return o; }).filter(o => Object.keys(o).length); if (list.length) out[s.k] = list; }
    else { const o = {}, src = j[s.k] && typeof j[s.k] === 'object' ? j[s.k] : {}; s.f.forEach(f => { const v = conv(f, src[f[0]]); if (fpFilled(v)) o[f[0]] = v; }); if (Object.keys(o).length) out[s.k] = o; }
  });
  return out;
}
async function fdAI(text) {
  const schema = fdSecs().map(s => `${s.k}${s.repeat ? ' (LISTA de até ' + s.repeat + ' itens)' : ''}: {${s.f.map(f => f[0] + (f[2] === 'checks' ? ' [lista; só destes: ' + fdOpts(f).join(' | ') + ']' : f[2] === 'select' ? ' [um destes: ' + fdOpts(f).join(' | ') + ']' : '')).join(', ')}}`).join('\n');
  const j = await aiJSON('Você lê um documento de briefing e preenche um formulário. Responda SÓ em JSON com as chaves do esquema. Use SOMENTE o que está escrito no documento: não invente nada, não complete preço, prazo, garantia, número ou resultado. O que não estiver no documento fica de fora. Campos de texto: português do Brasil, no jeito do documento. Campos "um destes"/"só destes" aceitam apenas as opções listadas.', 'ESQUEMA:\n' + schema + '\n\nDOCUMENTO:\n' + String(text).slice(0, 26000));
  return fdSanitize(j);
}

/* ---------- leitor 3: leitor de seções que já existia (docParse) → perguntas da ficha ---------- */
function fdFromK(K) {
  const a = {}, put = (path, v) => { v = Array.isArray(v) ? v.join('\n') : String(v == null ? '' : v).trim(); if (v) fpPutIn(a, path, v.slice(0, 4000)); }, L = x => (Array.isArray(x) ? x : String(x || '').split('\n')).map(t => String(t).trim()).filter(Boolean);
  put('empresa.nome', K.client); put('empresa.regras', K.rules); put('publico.quem', K.audience || (K.icps || []).map(x => x.name + (x.profile ? ': ' + x.profile : '')).join('\n'));
  put('publico.problemas', K.problem || (K.icps || []).flatMap(x => L(x.pains)).join('\n')); put('publico.perguntas', (K.icps || []).flatMap(x => L(x.doubts)).join('\n')); put('publico.desejos', (K.icps || []).flatMap(x => L(x.desires)).join('\n')); put('publico.ocultas', (K.icps || []).flatMap(x => L(x.hidden)).join('\n'));
  put('publico.situacoes', (K.icps || []).map(x => x.situation).filter(Boolean).join('\n'));
  put('marketing.metas', K.goal); put('marketing.canais', K.channels); put('marketing.orcamento', K.budget); put('marketing.prazo', K.deadline); put('identidade.usa', K.vocab); put('identidade.naoUsa', K.antivocab);
  put('materiais.marca', [K.positioning, K.visual, K.palette || ((K.colors || []).length ? 'Cores: ' + K.colors.join(' · ') : ''), K.fonts ? 'Fontes: ' + K.fonts : ''].filter(Boolean).join('\n'));
  const prods = (K.products || []).slice(0, 8).map(x => { const o = {}, s = (k, v) => { v = Array.isArray(v) ? v.join('\n') : String(v || '').trim(); if (v) o[k] = v.slice(0, 4000); }; s('nome', x.name); s('oque', x.summary); s('paraquem', x.audience); s('preco', x.price); s('diferencial', x.benefits); s('incluso', x.features); s('objecoes', x.objections); s('provas', x.proofs); s('link', /^https?:\/\//i.test(x.checkout || '') ? x.checkout : ''); s('prazo', x.prazo); return o; }).filter(o => o.nome); if (prods.length) a.produtos = prods;
  const comp = L(K.competitors).slice(0, 8).map(t => ({nome: t.replace(/^[-•*]\s*/, '').slice(0, 120)})); if (comp.length) a.concorrencia = comp;
  return a;
}
const fdCountAnswers = a => { let n = 0; const walk = v => { if (Array.isArray(v)) { if (v.length && typeof v[0] !== 'object') n++; else v.forEach(walk); } else if (v && typeof v === 'object') Object.values(v).forEach(walk); else if (fpFilled(v)) n++; }; walk(a); return n; };

/* ---------- juntar sem apagar: só preenche o que está vazio ---------- */
function fdFillEmpty(loc, inc) {
  if (Array.isArray(inc)) {
    if (!inc.length) return loc; if (typeof inc[0] !== 'object') return Array.isArray(loc) && loc.length ? loc : inc;
    const base = Array.isArray(loc) ? loc : [], has = base.filter(x => x && Object.keys(x).length), key = x => fdNorm((x || {}).nome || (x || {}).who || '');
    if (!has.length) return inc; const out = base.slice(), seen = new Set(has.map(key)); inc.forEach(x => { if (!seen.has(key(x))) { out.push(x); seen.add(key(x)); } }); return out;
  }
  if (inc && typeof inc === 'object') { const o = loc && typeof loc === 'object' && !Array.isArray(loc) ? loc : {}; Object.keys(inc).forEach(k => { o[k] = fdFillEmpty(o[k], inc[k]); }); return o; }
  return fpFilled(loc) ? loc : inc;
}

/* ---------- tela: subir e conferir ---------- */
function fdOpen(target) {
  const p = curProject(); FD.text = ''; FD.name = ''; FD.res = null; FD.target = target || (p ? 'cur' : 'new'); FD.newName = ''; FD.replace = false;
  showModal('Subir o documento do projeto', `<p style="margin-top:0;font-size:13.5px">Suba o documento com <b>todas as informações do projeto</b> (Word, PDF, texto, Markdown, HTML). O Studio preenche a <b>Ficha completa</b> e, depois, você pode montar o resto do projeto até o site. <b>Nada que já está respondido é apagado.</b></p>
    <div class="row-gap" style="flex-wrap:wrap;margin:8px 0"><small class="muted">Sem documento? Baixe o template e preencha:</small><button class="btn sm" onclick="fdDownload('docx',false)">Word (.docx)</button><button class="btn sm" onclick="fdDownload('md',false)">Markdown (.md)</button><button class="btn sm" onclick="fpXlsx(false)" ${p ? '' : 'disabled'}>Planilha (.xlsx)</button></div>
    <input type="file" id="fdFile" accept=".docx,.pdf,.txt,.md,.markdown,.html,.htm,.rtf,.csv,.json" onchange="fdPick(this)">
    <div class="field" style="margin-top:10px"><label>Ou cole o texto do documento</label><textarea id="fdPaste" rows="6" placeholder="Cole aqui o briefing..."></textarea></div>
    <div class="id-chips" style="margin:6px 0">${p ? `<label class="pm-radio"><input type="radio" name="fdT" value="cur" ${FD.target === 'cur' ? 'checked' : ''} onchange="FD.target='cur'"> Neste projeto: <b>${esc(p.name)}</b></label>` : ''}<label class="pm-radio"><input type="radio" name="fdT" value="new" ${FD.target === 'new' ? 'checked' : ''} onchange="FD.target='new'"> Criar um projeto novo com este documento</label></div>
    <div id="fdMsg" class="muted" style="font-size:13px;margin:6px 0"></div><div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="fdRead()">Ler o documento</button></div>`);
  $('modalBox').classList.add('wide');
}
async function fdPick(inp) {
  const f = inp.files[0]; if (!f) return; if (f.size > 12e6) { $('fdMsg').textContent = 'Arquivo grande demais (máx. 12 MB).'; return; }
  $('fdMsg').textContent = 'Lendo ' + f.name + '…';
  try { FD.text = await docReadFile(f); FD.name = f.name; $('fdMsg').textContent = `Li ${FD.text.length.toLocaleString('pt-BR')} caracteres de ${f.name}. Clique em “Ler o documento”.`; $('fdPaste').value = FD.text.slice(0, 4000); } catch (e) { FD.text = ''; $('fdMsg').textContent = e.message; }
}
async function fdRead() {
  const pasted = ($('fdPaste') || {}).value || '', text = FD.text && (!pasted || pasted === FD.text.slice(0, 4000)) ? FD.text : pasted;
  if (String(text).trim().length < 40) { $('fdMsg').textContent = 'Escolha um arquivo ou cole o texto (pelo menos algumas linhas).'; return; }
  FD.text = text; if (!FD.name) FD.name = 'texto colado'; $('fdMsg').textContent = 'Lendo e reconhecendo…';
  const T = fdParse(text), K = docParse(text); let A = null, via = [], err = '';
  if (T.count) via.push('formato do template');
  if (typeof aiReady === 'function' && aiReady()) { try { A = await fdAI(text); via.push('IA'); } catch (e) { err = e.message; } }
  const KA = fdFromK(K); via.push('leitor de seções');
  let ans = fpMerge(fpMerge({}, KA), A || {}); ans = fpMerge(ans, T.answers);
  FD.res = {T, A, K, ans, via, err}; fdReview();
}
function fdReview() {
  const r = FD.res, p = curProject(), s = fdSecs(), n = fdCountAnswers(r.ans), prods = (r.ans.produtos || []).map(x => x.nome).filter(Boolean);
  const rows = s.map(sec => { const v = r.ans[sec.k]; const c = sec.repeat ? (Array.isArray(v) ? v.length : 0) : (v ? Object.keys(v).length : 0); return c ? `<div class="list-item"><div><strong>${esc(sec.t)}</strong><small>${sec.repeat ? c + ' item(ns)' : c + ' resposta(s)'}</small></div></div>` : ''; }).join('');
  showModal('O que o Studio entendeu', `<p style="margin-top:0">Reconheci <b>${n}</b> resposta(s) por: <b>${esc(r.via.join(' + '))}</b>.${r.err ? ` <span class="muted">(A IA falhou: ${esc(r.err)})</span>` : ''}</p>
    ${n < 3 ? '<div class="note" style="background:#fff8e6;border:1px solid #f0dca8;border-radius:10px;padding:8px 12px;margin:8px 0">Reconheci pouco. Para o Studio ler tudo certinho, use o <b>template</b> (Word ou Markdown) ou ligue a IA em Configurações → Integrações.</div>' : ''}
    ${rows ? `<h4>Por parte da ficha</h4><div class="list">${rows}</div>` : ''}${prods.length ? `<h4>Produtos e serviços encontrados</h4><div class="list">${prods.map(x => `<div class="list-item"><div><strong>${esc(x)}</strong></div></div>`).join('')}</div>` : ''}
    <label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" ${r.K.icps.length ? (FD.icp ? 'checked' : '') : 'disabled'} onchange="FD.icp=this.checked"> Também levar os públicos (ICP), dores, dúvidas e desejos do documento para o pré-projeto${r.K.icps.length ? ` (${r.K.icps.length} encontrado(s))` : ' (não encontrei)'}</label>
    ${FD.target === 'cur' && p ? `<label style="display:flex;gap:8px;align-items:center;margin-top:6px"><input type="checkbox" onchange="FD.replace=this.checked"> Substituir o que já está na ficha pelo que o documento trouxe (padrão: só preencher o que está vazio)</label>` : `<div class="field" style="margin-top:8px"><label>Nome do projeto novo</label><input value="${esc(FD.newName || (r.ans.empresa || {}).nome || FD.name.replace(/\.[a-z0-9]+$/i, ''))}" oninput="FD.newName=this.value"></div>`}
    <div class="modal-actions" style="flex-wrap:wrap"><button class="btn" onclick="fdOpen(FD.target)">← Voltar</button><button class="btn" onclick="fdConfirm(false)">Levar para a ficha</button><button class="btn dark" onclick="fdConfirm(true)" title="Leva para a ficha e já monta o projeto até o site">✦ Levar e montar o projeto</button></div>`);
  $('modalBox').classList.add('wide');
}
async function fdConfirm(build) {
  const r = FD.res; if (!r) return; let p = curProject();
  if (FD.target === 'new' || !p) {
    const nm = (FD.newName || (r.ans.empresa || {}).nome || FD.name.replace(/\.[a-z0-9]+$/i, '') || 'Novo projeto').trim().slice(0, 80);
    p = newProject(nm, 'Criado a partir de um documento', {category: 'Marketing'}); p.client = (r.ans.empresa || {}).nome || nm; state.projects.push(p); state.activeProjectId = p.id; if (typeof updateContextUI === 'function') updateContextUI();
  }
  const st = fpSt(p); st.answers = FD.replace && FD.target === 'cur' ? fpMerge(st.answers, r.ans) : fdFillEmpty(st.answers, r.ans); st.updatedAt = new Date().toISOString();
  const br = p.brief || (p.brief = {}), doc = br.doc || (br.doc = {name: '', at: '', text: '', prev: {}}); doc.name = FD.name.slice(0, 120); doc.at = new Date().toISOString(); doc.text = String(FD.text).slice(0, 60000);
  FD.icpDoc = FD.icp && r.K.icps.length ? r.K : null; persist(); closeModal(); FP.open = {}; setActiveProject(p.id);
  if (build && typeof esAutoRun === 'function') { ui.tab = 'esteira'; go('project'); await esAutoRun({icpDoc: FD.icpDoc}); return; }
  if (FD.icpDoc && typeof docApply === 'function') { try { docApply(p, FD.icpDoc, {banks: true}); persist(); } catch (e) { /* os públicos são um extra */ } }
  ui.tab = 'ficha'; go('project'); toast('Documento levado para a ficha. Confira as respostas e clique em Aplicar ao projeto.');
}
