/* Ficha completa do projeto: o modelo com TODAS as perguntas que o projeto precisa (as mesmas do formulário do cliente).
   Dá para responder aqui, mandar o link ao cliente, baixar o template em planilha (.xlsx), imprimir em PDF e importar a planilha preenchida.
   As respostas ficam em p.ficha.answers e, ao clicar em "Aplicar ao projeto", vão para produtos, marca, materiais, voz e briefing. */
const FP = {open: {}};
const fpSt = p => { if (!p.ficha || typeof p.ficha !== 'object' || !p.ficha.answers) p.ficha = normalizeFicha(p.ficha); return p.ficha; };
const fpA = () => fpSt(curProject()).answers;
function fpGet(path) { let c = fpA(); for (const k of path.split('.')) { if (c == null || typeof c !== 'object') return ''; c = c[k]; } return c == null ? '' : c; }
function fpPut(path, v) { const p = path.split('.'); let c = fpA(); for (let i = 0; i < p.length - 1; i++) { if (c[p[i]] == null || typeof c[p[i]] !== 'object') c[p[i]] = /^\d+$/.test(p[i + 1]) ? [] : {}; c = c[p[i]]; } c[p[p.length - 1]] = v; }
let fpT; const fpSave = () => { fpSt(curProject()).updatedAt = new Date().toISOString(); clearTimeout(fpT); fpT = setTimeout(() => { persist(); fpProg(); }, 350); fpProg(); };
const fpSecs = () => BF_SECTIONS.filter(s => !s.files);
const fpFilled = v => Array.isArray(v) ? v.length > 0 : String(v == null ? '' : v).trim() !== '';
function fpSecDone(s) {
  const a = fpA(); if (s.repeat) return (Array.isArray(a[s.k]) ? a[s.k] : []).some(x => x && bfStr(x.nome));
  const x = a[s.k] || {}; return s.f.some(f => fpFilled(x[f[0]]));
}
function fpCount(s) { const a = fpA(); if (s.repeat) { const n = (Array.isArray(a[s.k]) ? a[s.k] : []).filter(x => x && bfStr(x.nome)).length; return n + ' item(ns)'; } const x = a[s.k] || {}; return s.f.filter(f => fpFilled(x[f[0]])).length + ' de ' + s.f.length; }
function fpProg() {
  const secs = fpSecs(), done = secs.filter(fpSecDone).length, bar = $('fpBar'), t = $('fpProgT'); if (bar) bar.style.width = Math.round(done / secs.length * 100) + '%'; if (t) t.textContent = done + ' de ' + secs.length + ' partes preenchidas';
  secs.forEach(s => { const e = $('fpSt_' + s.k); if (e) { const ok = fpSecDone(s); e.textContent = fpCount(s); e.className = 'fp-st' + (ok ? ' ok' : ''); } });
  const m = $('fpMiss'); if (m) { const miss = bfMissing(Object.assign({aceite: true}, fpA())); m.innerHTML = miss.length ? `Para aplicar, falta: <b>${miss.map(esc).join(', ')}</b>.` : 'Os itens essenciais estão preenchidos.'; }
}
/* ---------- campos ---------- */
function fpField(path, f) {
  const t = f[2], req = f[3] === 1, opts = Array.isArray(f[3]) ? f[3] : f[4], v = fpGet(path), lab = esc(f[1]) + (req ? ' <span style="color:#b3472f">*</span>' : '');
  if (t === 'area') return `<div class="field full"><label>${lab}</label><textarea rows="3" oninput="fpPut('${path}',this.value);fpSave()">${esc(v)}</textarea></div>`;
  if (t === 'select') return `<div class="field"><label>${lab}</label><select onchange="fpPut('${path}',this.value);fpSave()"><option value="">Escolha…</option>${opts.map(o => `<option ${v === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></div>`;
  if (t === 'checks') { const cur = Array.isArray(v) ? v : []; return `<div class="field full"><label>${lab}</label><div class="id-chips">${opts.map(o => `<button type="button" class="id-chip ${cur.includes(o) ? 'on' : ''}" data-p="${path}" data-v="${esc(o)}" onclick="fpTog(this)">${esc(o)}</button>`).join('')}</div></div>`; }
  return `<div class="field"><label>${lab}</label><input type="${t === 'text' ? 'text' : t}" value="${esc(v)}" oninput="fpPut('${path}',this.value);fpSave()"></div>`;
}
function fpTog(b) { const path = b.dataset.p, o = b.dataset.v; let cur = fpGet(path); cur = Array.isArray(cur) ? cur.slice() : []; const i = cur.indexOf(o); if (i >= 0) cur.splice(i, 1); else cur.push(o); fpPut(path, cur); b.classList.toggle('on', i < 0); fpSave(); }
function fpAdd(k) { const s = BF_SECTIONS.find(x => x.k === k), a = fpA(); if (!Array.isArray(a[k])) a[k] = []; if (a[k].length >= s.repeat) return; a[k].push({}); FP.open[k] = true; persist(); keepScroll(renderProjectTab); }
function fpRm(k, n) { if (!confirm('Remover este item?')) return; fpA()[k].splice(n, 1); persist(); keepScroll(renderProjectTab); }
function fpSecHTML(s, i) {
  const a = fpA(); let body = '';
  if (s.repeat) {
    const list = Array.isArray(a[s.k]) && a[s.k].length ? a[s.k] : (a[s.k] = [{}]);
    body = list.map((it, n) => `<div class="panel" style="margin:10px 0"><div class="section-row"><h4 style="margin:0">${esc(s.item)} ${n + 1}</h4>${list.length > 1 ? `<button class="btn sm" onclick="fpRm('${s.k}',${n})">Remover</button>` : ''}</div><div class="form-grid">${s.f.map(f => fpField(s.k + '.' + n + '.' + f[0], f)).join('')}</div></div>`).join('')
      + (list.length < s.repeat ? `<button class="btn" onclick="fpAdd('${s.k}')">＋ Adicionar outro ${esc(s.item.toLowerCase())}</button>` : '');
  } else body = `<div class="form-grid">${s.f.map(f => fpField(s.k + '.' + f[0], f)).join('')}</div>`;
  return `<details class="fp-sec" ${FP.open[s.k] || (FP.open[s.k] === undefined && i === 0) ? 'open' : ''} ontoggle="FP.open['${s.k}']=this.open"><summary><span class="fp-n">${i + 1}</span><b>${esc(s.t)}</b><span id="fpSt_${s.k}" class="fp-st${fpSecDone(s) ? ' ok' : ''}">${esc(fpCount(s))}</span></summary><div class="fp-body">${s.d ? `<p class="muted" style="margin:6px 0 4px;font-size:12.5px">${esc(s.d)}</p>` : ''}${body}</div></details>`;
}
/* fotos e arquivos: vão direto para a Biblioteca de imagens */
function fpFilesHTML() {
  const s = BF_SECTIONS.find(x => x.files), it = curProject().intake = normalizeIntake(curProject().intake), idx = BF_SECTIONS.indexOf(s);
  return `<details class="fp-sec" ${FP.open.arquivos ? 'open' : ''} ontoggle="FP.open.arquivos=this.open"><summary><span class="fp-n">${idx + 1}</span><b>${esc(s.t)}</b><span class="fp-st${it.files.length ? ' ok' : ''}">${it.files.length} arquivo(s)</span></summary><div class="fp-body"><p class="muted" style="margin:6px 0 8px;font-size:12.5px">${esc(s.d)} Aqui as imagens vão direto para a <b>Biblioteca</b>. O cliente também pode enviar pelo link.</p>
    ${s.files.map(([c, l]) => { const n = it.files.filter(f => f.cat === c).length; return `<div class="list-item"><div><strong>${esc(l)}</strong><small>${n} arquivo(s)</small></div><label class="btn sm" style="cursor:pointer">＋ Adicionar fotos<input type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onchange="fpUpload('${c}',this.files);this.value=''"></label></div>`; }).join('')}
    <div style="margin-top:8px"><button class="btn sm" onclick="go('biblioteca')">Abrir a Biblioteca de imagens</button></div></div></details>`;
}
async function fpUpload(cat, files) {
  const p = curProject(), it = p.intake = normalizeIntake(p.intake); let n = 0;
  for (const f of [...files].slice(0, 20)) {
    const ext = {'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp'}[f.type]; if (!ext) { toast(f.name + ': use PNG, JPG ou WebP.'); continue; }
    try { const li = await libAddBlob(f, {name: 'Projeto · ' + (IN_CAT[cat] || cat) + ' · ' + f.name, tags: ['projeto', cat]}); it.files.push({id: [...crypto.getRandomValues(new Uint8Array(8))].map(b => b.toString(16).padStart(2, '0')).join(''), ext, cat, name: f.name.slice(0, 80), t: '', lib: li.id}); n++; } catch (e) { toast(e.message); }
  }
  if (n) { p.intake = normalizeIntake(it); persist(); toast(n + ' foto(s) na Biblioteca.'); keepScroll(renderProjectTab); }
}
/* ---------- tela ---------- */
function fichaHTML(p) {
  fpSt(p); const secs = BF_SECTIONS, b = typeof bfStore === 'function' ? bfStore(p) : {};
  const bar = `<div class="panel"><div class="section-row"><div><h3 style="margin:0">📋 Ficha completa do projeto</h3><p class="muted" style="margin:2px 0 0;font-size:12.5px">O modelo com todas as perguntas que o projeto precisa. Responda aqui, mande o link ao cliente ou use a planilha. Depois clique em <b>Aplicar ao projeto</b>: produtos e serviços, marca, materiais, voz e briefing já ficam prontos para seguir.</p></div></div>
    <div class="prog" style="height:8px;background:#e6e6ea;border-radius:99px;overflow:hidden;margin:12px 0 4px"><i id="fpBar" style="display:block;height:100%;background:#111;width:0"></i></div><div class="row-gap" style="justify-content:space-between;flex-wrap:wrap"><small class="muted" id="fpProgT"></small><small class="muted" id="fpMiss"></small></div>
    <div class="row-gap" style="flex-wrap:wrap;margin-top:12px"><button class="btn" onclick="fdOpen('cur')">⬆ Subir documento do projeto</button><button class="btn dark" onclick="fpApply(false)">✔ Aplicar ao projeto</button><button class="btn dark" onclick="fpApply(true)" title="Aplica e a IA monta o pré-projeto com as respostas">✦ Aplicar e gerar o pré-projeto</button>${b.t ? '<button class="btn" onclick="fpPull()">↧ Trazer as respostas do cliente</button>' : ''}</div>
    <div class="row-gap" style="flex-wrap:wrap;margin-top:8px"><button class="btn sm" onclick="fpXlsx(false)">⬇ Template em branco (.xlsx)</button><button class="btn sm" onclick="fpXlsx(true)">⬇ Ficha preenchida (.xlsx)</button><button class="btn sm" onclick="fdDownload('docx',false)">⬇ Template em Word (.docx)</button><button class="btn sm" onclick="fdDownload('md',false)">⬇ Template em Markdown</button><button class="btn sm" onclick="fpPrint(false)">🖨 Template para imprimir (PDF)</button><button class="btn sm" onclick="fpPrint(true)">🖨 Ficha preenchida (PDF)</button><label class="btn sm" style="cursor:pointer">⬆ Importar planilha preenchida<input type="file" accept=".xlsx" hidden onchange="if(this.files[0])fpImportFile(this.files[0]);this.value=''"></label><button class="btn sm" onclick="fpClear()">Limpar respostas</button></div></div>
    <details class="fp-sec" style="margin-top:12px"><summary><span class="fp-n">↗</span><b>Mandar para o cliente preencher (link)</b><span class="fp-st">${b.t ? 'link criado' : 'sem link'}</span></summary><div class="fp-body">${typeof briefingPanel === 'function' ? briefingPanel(p) : ''}</div></details>`;
  return `${bar}<div style="margin-top:12px">${secs.map((s, i) => s.files ? fpFilesHTML() : fpSecHTML(s, i)).join('')}</div>`;
}
TABS.ficha = p => { setTimeout(fpProg, 0); return fichaHTML(p); };

/* ---------- aplicar ao projeto, trazer do cliente, limpar ---------- */
function fpApply(gen) {
  const p = curProject(), a = fpA(), miss = bfMissing(Object.assign({aceite: true}, a)).filter(x => !/WhatsApp|seu nome/.test(x));
  if (miss.length && !confirm('Falta preencher: ' + miss.join(', ') + '. Aplicar mesmo assim?')) return;
  try { const x = bfApply(p, a); persist(); keepScroll(renderProjectTab);
    if (gen) { if (typeof preGenAll === 'function') preGenAll(true); return; }
    showModal('Ficha aplicada ao projeto', `<p>Entraram no projeto: ficha do briefing, voz da marca, <b>${x.added}</b> produto(s) ou serviço(s) novo(s) e ${x.upd} atualizado(s), ${x.comp} concorrente(s), ${x.dep} depoimento(s)${x.ident ? ', a identidade da marca (aba Marca e arquétipo)' : ''}. O que já estava preenchido no projeto foi mantido.</p><p class="muted" style="font-size:13px">Próximo passo: gerar o pré-projeto com a IA, ou revisar as abas do projeto.</p><div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button><button class="btn dark" onclick="closeModal();preGenAll(true)">✦ Gerar o pré-projeto agora</button></div>`);
  } catch (e) { toast('Não consegui aplicar: ' + e.message); }
}
function fpMerge(loc, rem) {
  if (Array.isArray(rem)) { if (rem.length && (typeof rem[0] !== 'object' || rem.some(x => x && Object.keys(x).length))) return rem; return loc; }
  if (rem && typeof rem === 'object') { const o = loc && typeof loc === 'object' && !Array.isArray(loc) ? loc : {}; Object.keys(rem).forEach(k => { o[k] = fpMerge(o[k], rem[k]); }); return o; }
  return String(rem == null ? '' : rem).trim() !== '' ? rem : loc;
}
async function fpPull() {
  try { const r = await bfFetch(), a = bfMigrate(r.answers || {}); delete a.arquivos; const st = fpSt(curProject()); st.answers = fpMerge(st.answers, a); st.updatedAt = new Date().toISOString(); persist(); toast(r.status === 'enviado' ? 'Respostas do cliente trazidas para a ficha.' : 'Trouxe o que o cliente já preencheu.'); keepScroll(renderProjectTab); } catch (e) { toast(e.message); }
}
function fpClear() { if (!confirm('Apagar todas as respostas desta ficha? O que já foi aplicado ao projeto continua.')) return; const st = fpSt(curProject()); st.answers = {}; persist(); keepScroll(renderProjectTab); }

/* ---------- template em planilha (.xlsx): uma aba "Ficha" com as perguntas simples e uma aba para cada parte com vários itens ---------- */
const FP_CELL = v => Array.isArray(v) ? v.map(x => String(x).replace(/;/g, ',')).join('; ') : String(v == null ? '' : v);
function fpSheets(a, blank) {
  a = blank ? {} : a; const H1 = 1, H2 = 2, N = 3, T = 4, W = 5, simple = BF_SECTIONS.filter(s => !s.files && !s.repeat), rep = BF_SECTIONS.filter(s => s.repeat);
  const como = [[['Ficha completa do projeto', T]], [''], ...[
    'Aba "Ficha": responda na coluna C ("Sua resposta"). Não mexa na coluna D (Chave).',
    'Perguntas de escolher (valores, atitudes): copie da aba "Opções" e separe com ponto e vírgula (;).',
    'Perguntas "um por linha": escreva uma por linha (Alt+Enter dentro da célula) ou separe com ponto e vírgula (;).',
    'Produtos e serviços, Concorrentes e Depoimentos: uma linha para cada item, nas abas com o mesmo nome. Não apague a linha cinza "chave:".',
    'Fotos e arquivos: não vão na planilha. Envie pelo link do cliente ou pela Biblioteca de imagens do Studio.',
    'Quando terminar, salve e importe de volta em Ficha completa → Importar planilha preenchida.'].map((t, i) => [[(i + 1) + '. ' + t, W]])];
  const rows = [[['Parte', H1], ['Pergunta', H1], ['Sua resposta', H2], ['Chave (não mexa)', H1]]], lists = [], opt = [];
  simple.forEach(s => s.f.forEach(f => { const r = rows.length + 1, key = s.k + '.' + f[0]; rows.push([[s.t, N], [f[1] + (f[3] === 1 ? ' *' : ''), W], [FP_CELL(((a[s.k] || {})[f[0]])), W], [key, N]]); const o = Array.isArray(f[3]) ? f[3] : f[4]; if (f[2] === 'select' && o) lists.push({ref: 'C' + r, items: o}); if (f[2] === 'checks' && o) opt.push([f[1], o]); }));
  const optRows = [opt.map(([l]) => [l, H1])], mx = Math.max(0, ...opt.map(([, o]) => o.length)); for (let i = 0; i < mx; i++) optRows.push(opt.map(([, o]) => o[i] || ''));
  const out = [{name: 'Como preencher', rows: como, widths: [110]}, {name: 'Ficha', rows, widths: [26, 60, 60, 24], lists}];
  rep.forEach(s => {
    const items = Array.isArray(a[s.k]) ? a[s.k] : [], rr = [s.f.map(f => [f[1] + (f[3] === 1 ? ' *' : ''), H1]), s.f.map(f => ['chave:' + f[0], N])], ls = [];
    for (let n = 0; n < s.repeat; n++) rr.push(s.f.map(f => [FP_CELL((items[n] || {})[f[0]]), W]));
    s.f.forEach((f, j) => { const o = Array.isArray(f[3]) ? f[3] : f[4]; if (f[2] === 'select' && o) ls.push({ref: `${xmCol(j)}3:${xmCol(j)}${2 + s.repeat}`, items: o}); });
    out.push({name: s.t.slice(0, 31), rows: rr, widths: s.f.map(f => f[2] === 'area' ? 38 : 22), lists: ls});
  });
  if (optRows[0].length) out.push({name: 'Opções', rows: optRows, widths: optRows[0].map(() => 34)});
  return out;
}
function fpXlsx(filled) { const p = curProject(); download('ficha-' + slug(p.name) + (filled ? '' : '-template') + '.xlsx', xmBuild(fpSheets(filled ? fpA() : {}, !filled)), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); }
function fpFromSheets(sheets) {
  const norm = s => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ''), a = {}; let any = false;
  const fa = sheets.find(s => norm(s.name) === 'ficha'), fieldOf = path => { const [sk, fk] = path.split('.'), s = BF_SECTIONS.find(x => x.k === sk); return s && !s.repeat && !s.files ? s.f.find(f => f[0] === fk) : null; };
  const conv = (f, raw) => { raw = String(raw == null ? '' : raw).replace(/\r/g, '').trim(); if (f[2] === 'checks') return raw.split(/;|\n/).map(x => x.trim()).filter(Boolean); if (f[2] === 'select') { const o = (Array.isArray(f[3]) ? f[3] : f[4]) || []; return o.find(x => norm(x) === norm(raw)) || ''; } return raw; };
  if (fa) { const hi = fa.rows.findIndex(r => (r || []).some(c => norm(c).startsWith('chave'))); if (hi >= 0) { const kc = fa.rows[hi].findIndex(c => norm(c).startsWith('chave')), rc = fa.rows[hi].findIndex(c => norm(c).startsWith('suaresposta')), ac = rc >= 0 ? rc : kc - 1;
    fa.rows.slice(hi + 1).forEach(r => { const key = String((r || [])[kc] || '').trim(), f = fieldOf(key); if (!f) return; const v = conv(f, r[ac]); fpPutIn(a, key, v); if (fpFilled(v)) any = true; }); } }
  BF_SECTIONS.filter(s => s.repeat).forEach(s => {
    const sh = sheets.find(x => norm(x.name) === norm(s.t.slice(0, 31))); if (!sh) return; const ki = sh.rows.findIndex(r => (r || []).some(c => /^chave:/.test(String(c)))); if (ki < 0) return;
    const keys = sh.rows[ki].map(c => String(c || '').replace(/^chave:/, '').trim()), list = [];
    sh.rows.slice(ki + 1).forEach(r => { const it = {}; keys.forEach((k, j) => { const f = s.f.find(x => x[0] === k); if (f && fpFilled(r[j])) it[k] = conv(f, r[j]); }); if (Object.keys(it).length) list.push(it); });
    if (list.length) { a[s.k] = list.slice(0, s.repeat); any = true; }
  });
  if (!fa && !any) throw new Error('Não encontrei a aba "Ficha". Use o template baixado aqui, sem renomear as abas.');
  return a;
}
function fpPutIn(o, path, v) { const p = path.split('.'); let c = o; for (let i = 0; i < p.length - 1; i++) { if (c[p[i]] == null || typeof c[p[i]] !== 'object') c[p[i]] = {}; c = c[p[i]]; } c[p[p.length - 1]] = v; }
async function fpImportFile(file) {
  try {
    const a = fpFromSheets(await pmReadXlsx(file)), st = fpSt(curProject()); if (!Object.keys(a).length) { toast('A planilha não tem respostas preenchidas.'); return; }
    if (Object.keys(st.answers).length && !confirm('Já existem respostas na ficha. A planilha vai sobrescrever o que ela tiver preenchido (o resto fica). Continuar?')) return;
    st.answers = fpMerge(st.answers, a); st.updatedAt = new Date().toISOString(); persist(); toast('Planilha importada na ficha.'); keepScroll(renderProjectTab);
  } catch (e) { toast(e.message || 'Não consegui ler a planilha.'); }
}

/* ---------- template para imprimir / salvar em PDF ---------- */
function fpPrint(filled) {
  const p = curProject(), a = filled ? fpA() : {}, e = esc, css = 'body{font:13px/1.5 system-ui,Segoe UI,sans-serif;color:#16181d;margin:0}.w{max-width:800px;margin:0 auto;padding:26px 22px}h1{font-size:26px;margin:0 0 4px}h2{font-size:16px;margin:22px 0 6px;border-top:2px solid #16181d;padding-top:8px}.sub{color:#5d6470;margin:0 0 12px}.q{margin:9px 0;break-inside:avoid}.q b{display:block;font-size:12.5px}.ln{border-bottom:1px solid #aaa;height:20px}.ln.t{height:56px}.o{display:inline-block;margin:2px 10px 2px 0;font-size:12px}.ans{white-space:pre-wrap;background:#f6f6f3;border-radius:6px;padding:4px 8px;min-height:18px}.tb{position:sticky;top:0;background:#16181d;color:#fff;padding:8px 14px;display:flex;justify-content:space-between;align-items:center}.tb button{border:0;border-radius:8px;padding:7px 12px;font-weight:700;cursor:pointer}@media print{.tb{display:none}.w{padding:0}}';
  const fld = (path, f, v) => { const o = (Array.isArray(f[3]) ? f[3] : f[4]) || [], req = f[3] === 1 ? ' *' : '';
    if (f[2] === 'checks') return `<div class="q"><b>${e(f[1])}${req}</b>${o.map(x => `<span class="o">${(Array.isArray(v) && v.includes(x)) ? '☑' : '☐'} ${e(x)}</span>`).join('')}</div>`;
    if (f[2] === 'select') return `<div class="q"><b>${e(f[1])}${req}</b>${o.map(x => `<span class="o">${v === x ? '◉' : '○'} ${e(x)}</span>`).join('')}</div>`;
    return `<div class="q"><b>${e(f[1])}${req}</b>${filled && fpFilled(v) ? `<div class="ans">${e(FP_CELL(v))}</div>` : `<div class="ln${f[2] === 'area' ? ' t' : ''}"></div>`}</div>`; };
  const body = BF_SECTIONS.map((s, i) => {
    if (s.files) return `<h2>${i + 1} · ${e(s.t)}</h2><p class="sub">${e(s.d)} Marque o que vai enviar: ${s.files.map(([, l]) => '☐ ' + e(l)).join(' · ')}</p>`;
    let h = `<h2>${i + 1} · ${e(s.t)}</h2>${s.d ? `<p class="sub">${e(s.d)}</p>` : ''}`;
    if (s.repeat) { const items = Array.isArray(a[s.k]) && a[s.k].length ? a[s.k] : (filled ? [] : Array.from({length: Math.min(3, s.repeat)}, () => ({}))); items.forEach((it, n) => { h += `<div style="border:1px solid #d5d7dc;border-radius:8px;padding:2px 12px 8px;margin:8px 0"><b style="font-size:13px">${e(s.item)} ${n + 1}</b>${s.f.map(f => fld('', f, it[f[0]])).join('')}</div>`; }); if (!filled) h += `<p class="sub">Se houver mais, use outra folha (até ${s.repeat}).</p>`; }
    else h += s.f.map(f => fld('', f, (a[s.k] || {})[f[0]])).join('');
    return h; }).join('');
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Ficha do projeto</title><style>${css}</style></head><body><div class="tb"><span>Imprimir → Salvar como PDF</span><button onclick="window.print()">Imprimir / PDF</button></div><div class="w"><h1>Ficha completa do projeto${filled ? ' · ' + e(p.client || p.name) : ''}</h1><p class="sub">${filled ? 'Respostas atuais.' : 'Template em branco. * = obrigatório. Responda com calma, não existe resposta certa ou errada. Não escreva nada que não seja verdadeiro.'}</p>${body}</div></body></html>`;
  showOverlay(filled ? 'Ficha preenchida' : 'Template da ficha do projeto', html, 'ficha-' + slug(p.name) + (filled ? '' : '-template') + '.html');
}

/* ---------- criar o projeto já com o modelo completo ---------- */
function fpNewModal() {
  showModal('Novo projeto com o modelo completo', `<p class="muted" style="margin-top:0;font-size:13px">Cria o projeto já com <b>todas as perguntas</b>. Você responde, manda o link para o cliente ou usa a planilha. Depois é só aplicar ao projeto.</p>
    <div class="form-grid"><div class="field"><label>Nome do projeto *</label><input id="fpnName" placeholder="Ex.: Silva Advocacia"></div><div class="field"><label>Cliente / empresa</label><input id="fpnClient" placeholder="Se for diferente do nome"></div>
    <div class="field"><label>Categoria</label><select id="fpnCat">${['Marketing', 'Branding', 'Conteúdo', 'Lançamento', 'Performance', 'Site'].map(c => `<option>${c}</option>`).join('')}</select></div><div class="field"><label>Objetivo do projeto</label><input id="fpnGoal" placeholder="Ex.: Gerar contatos pelo WhatsApp"></div></div>
    <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="fpCreate()">Criar com o modelo completo</button></div>`);
  setTimeout(() => $('fpnName') && $('fpnName').focus(), 50);
}
function fpCreate() {
  const name = ($('fpnName').value || '').trim(); if (!name) { toast('Dê um nome ao projeto.'); return; }
  const p = newProject(name, 'Projeto criado com o modelo completo', {category: $('fpnCat').value, goal: ($('fpnGoal').value || '').trim()}); p.client = ($('fpnClient').value || '').trim() || name;
  state.projects.push(p); state.activeProjectId = p.id; const st = fpSt(p); st.answers = {empresa: {nome: p.client}}; persist(); closeModal(); if (typeof updateContextUI === 'function') updateContextUI();
  FP.open = {}; ui.tab = 'ficha'; go('project'); toast('Projeto criado com todas as perguntas.');
}
const FP_STYLE = `.fp-sec{border:1px solid #e6e6ea;border-radius:12px;background:#fff;margin:8px 0}.fp-sec>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:10px;padding:12px 14px}.fp-sec>summary::-webkit-details-marker{display:none}
.fp-n{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:#111;color:#fff;font-size:12px;flex:none}.fp-st{margin-left:auto;font-size:12px;color:#777}.fp-st.ok{color:#176b30;font-weight:700}.fp-body{padding:2px 14px 14px;border-top:1px solid #eee}`;
(function () { if (typeof document === 'undefined' || document.getElementById('fpStyle')) return; const s = document.createElement('style'); s.id = 'fpStyle'; s.textContent = FP_STYLE; document.head.appendChild(s); })();
