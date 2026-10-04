/* ===== Briefing pelo Google Forms: (1) script do Google Apps Script que monta o formulário com as mesmas perguntas e a planilha de respostas;
   (2) importação do CSV das respostas (Planilhas → Arquivo → Fazer download → CSV) para o projeto, com mapeamento das colunas.
   Funciona sem servidor. Serve também para formulários feitos à mão: as colunas que o app não reconhecer vão para "Outras respostas". ===== */
const BFG = {rows: [], head: [], map: [], pick: 0, name: '', stage: 0};
const BFG_PROD = 3;   // produtos por formulário do Google (o Forms não repete blocos)
const bfgNorm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const bfgTok = s => bfgNorm(s).split(' ').filter(w => w.length > 2 && !['para', 'que', 'uma', 'com', 'dos', 'das', 'como', 'qual', 'quais', 'voce', 'sua', 'seu'].includes(w));

/* ---------- 1 · script que cria o Google Forms ---------- */
function bfScript() {
  const q = v => JSON.stringify(String(v)), L = [];
  L.push('/* Ampliação Studio · cria o formulário de briefing e a planilha de respostas. Cole em script.google.com, clique em Executar (criarBriefing) e autorize. */', 'function criarBriefing() {', "  var f = FormApp.create('Briefing do projeto');", "  f.setDescription('Responda com calma. Quanto mais detalhe, melhores ficam os anúncios, os posts e a página de vendas. Você pode editar as respostas depois de enviar.');", '  f.setAllowResponseEdits(true); f.setProgressBar(true); f.setShowLinkToRespondAgain(false);',
    "  f.setConfirmationMessage('Briefing enviado, obrigado!');", "  var ss = SpreadsheetApp.create('Respostas do briefing'); f.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());", '  var it;');
  const add = (label, type, req, opts, help) => {
    const m = {text: 'addTextItem', tel: 'addTextItem', email: 'addTextItem', url: 'addTextItem', area: 'addParagraphTextItem', select: 'addListItem', checks: 'addCheckboxItem'}[type] || 'addTextItem';
    L.push(`  it = f.${m}().setTitle(${q(label)})${help ? '.setHelpText(' + q(help) + ')' : ''}${req ? '.setRequired(true)' : ''};` + (opts ? ` it.setChoiceValues(${JSON.stringify(opts)});` : ''));
  };
  BF_SECTIONS.forEach((s, si) => {
    if (s.repeat) {
      for (let n = 1; n <= BFG_PROD; n++) {
        L.push(`  f.addPageBreakItem().setTitle(${q(s.t + ' · ' + n)}).setHelpText(${q(n === 1 ? (s.d || '') : 'Deixe em branco se não houver mais produtos ou serviços.')});`);
        s.f.forEach(([k, l, t, req, opts]) => { const o = Array.isArray(req) ? req : opts; add(`${s.item} ${n} — ${l}`, t, n === 1 && req === 1, o); });
      }
      return;
    }
    if (si === 0) L.push(`  f.addSectionHeaderItem().setTitle(${q(s.t)}).setHelpText(${q(s.d || '')});`); else L.push(`  f.addPageBreakItem().setTitle(${q(s.t)})${s.d ? '.setHelpText(' + q(s.d) + ')' : ''};`);
    s.f.forEach(([k, l, t, req, opts]) => { const o = Array.isArray(req) ? req : opts; add(l, t, req === 1, o); });
  });
  L.push("  f.addPageBreakItem().setTitle('Autorização');", "  it = f.addCheckboxItem().setTitle('Autorização de uso das informações').setChoiceValues(['Autorizo o uso das informações deste formulário para elaborar o projeto de marketing. Declaro que os resultados, depoimentos e dados informados são verdadeiros e que tenho autorização para divulgá-los.']).setRequired(true);",
    "  Logger.log('LINK PARA O CLIENTE: ' + f.getPublishedUrl());", "  Logger.log('EDITAR O FORMULÁRIO: ' + f.getEditUrl());", "  Logger.log('PLANILHA DAS RESPOSTAS: ' + ss.getUrl());", '}');
  return L.join('\n');
}
function bfScriptOpen() {
  const code = bfScript();
  showModal('Criar o formulário no Google Forms', `<p style="font-size:13px;margin-top:0">Este script cria, na sua conta do Google, um <b>formulário com as mesmas perguntas do briefing</b> e a <b>planilha de respostas</b>. Leva 2 minutos:</p>
  <ol style="font-size:13px;line-height:1.7;margin:4px 0 8px"><li>Abra <a href="https://script.google.com" target="_blank" rel="noopener">script.google.com</a> e clique em <b>Novo projeto</b>.</li><li>Apague o que estiver lá, cole o código abaixo e clique em <b>Executar</b>. Autorize o acesso quando o Google pedir.</li><li>Abra o <b>Registro de execução</b>: o link para o cliente, o link de edição e o da planilha aparecem lá.</li><li>Quando o cliente responder: na planilha, <b>Arquivo → Fazer download → Valores separados por vírgula (.csv)</b>, e aqui use <b>Importar do Google Forms</b>.</li></ol>
  <textarea id="bfgCode" rows="9" readonly style="width:100%;font:12px/1.4 ui-monospace,monospace" onclick="this.select()">${esc(code)}</textarea><div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button><button class="btn" onclick="bfgDownloadScript()">⬇ Baixar .gs</button><button class="btn dark" onclick="bfgCopyScript()">Copiar código</button></div><small class="muted block">O Google Forms não repete blocos, então o formulário traz ${BFG_PROD} blocos de produto ou serviço (o 1º é obrigatório). O app entende essas colunas ao importar.</small>`);
  $('modalBox').classList.add('wide');
}
function bfgCopyScript() { try { navigator.clipboard.writeText(bfScript()); toast('Código copiado.'); } catch (e) { const t = $('bfgCode'); t.select(); document.execCommand('copy'); toast('Código copiado.'); } }
function bfgDownloadScript() { download('briefing-google-forms.gs', bfScript(), 'text/plain'); }

/* ---------- 2 · CSV ---------- */
function bfParseCSV(text) {
  text = String(text || '').replace(/^﻿/, ''); const first = text.split(/\r?\n/)[0] || '', cnt = c => (first.match(new RegExp(c === '\t' ? '\t' : '\\' + c, 'g')) || []).length, d = cnt(';') > cnt(',') && cnt(';') >= cnt('\t') ? ';' : cnt('\t') > cnt(',') ? '\t' : ',';
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true; else if (c === d) { row.push(cur); cur = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.some(x => x.trim() !== '')) rows.push(row); row = []; } else cur += c;
  }
  row.push(cur); if (row.some(x => x.trim() !== '')) rows.push(row); return rows;
}
/* apelidos comuns em formulários feitos à mão (texto sem acento; vale se o título da coluna contiver o apelido) */
const BFG_ALIAS = {
  'contato.nome': ['seu nome', 'nome completo', 'nome do responsavel', 'responsavel pelo preenchimento'], 'contato.whatsapp': ['whatsapp', 'whats app', 'telefone', 'celular'], 'contato.email': ['seu e mail', 'e mail do responsavel', 'email do responsavel', 'seu email'], 'contato.cargo': ['cargo', 'funcao'],
  'empresa.nome': ['nome da empresa', 'nome fantasia', 'nome do negocio', 'nome da sua empresa', 'nome do seu negocio', 'empresa'], 'empresa.razao': ['razao social', 'cnpj'], 'empresa.site': ['site', 'website', 'pagina na internet'], 'empresa.instagram': ['instagram'], 'empresa.cidade': ['cidade', 'regiao', 'onde atende', 'onde fica'], 'empresa.historia': ['historia da empresa', 'conte a historia', 'sobre a empresa', 'quem somos'],
  'empresa.diferenciais': ['diferenciais', 'diferencial da empresa', 'o que faz melhor'], 'empresa.tom': ['tom de voz', 'como a empresa fala', 'personalidade da marca'], 'empresa.evitar': ['palavras que evita', 'evitar', 'proibido'], 'empresa.regras': ['regras do setor', 'regras do conselho', 'oab', 'regulamentacao'],
  'publico.quem': ['quem sao os seus clientes', 'quem sao seus clientes', 'publico alvo', 'cliente ideal', 'perfil do cliente'], 'publico.problemas': ['problemas', 'dores'], 'publico.perguntas': ['perguntas frequentes', 'duvidas', 'perguntas que'], 'publico.objecoes': ['objecoes'], 'publico.desejos': ['desejos', 'o que querem'], 'publico.descobre': ['como encontram', 'como conhecem', 'como chegam'],
  'produtos.nome': ['nome do produto', 'nome do servico', 'nome do produto ou servico', 'servico principal', 'produto principal', 'qual servico', 'qual produto', 'o que voce vende', 'o que voces vendem', 'servico oferecido'], 'produtos.oque': ['descricao do servico', 'descricao do produto', 'descricao', 'o que e o servico', 'o que e o produto'], 'produtos.como': ['como funciona', 'etapas', 'passo a passo'], 'produtos.incluso': ['o que esta incluso', 'incluso'],
  'produtos.preco': ['preco', 'quanto custa', 'valor', 'investimento', 'faixa de preco'], 'produtos.prazo': ['prazo', 'duracao'], 'produtos.diferencial': ['diferencial do', 'por que escolher'], 'produtos.provas': ['depoimentos', 'resultados', 'casos reais', 'provas'], 'produtos.link': ['link de compra', 'link de agendamento'],
  'concorrencia.lista': ['concorrentes', 'concorrencia'], 'concorrencia.admira': ['admira', 'referencias', 'inspiracao'], 'marketing.canais': ['canais', 'o que ja usam', 'o que ja utiliza'], 'marketing.orcamento': ['orcamento', 'verba', 'investimento em anuncios'], 'marketing.metas': ['metas', 'objetivo do projeto', 'objetivos'], 'marketing.prazo': ['prazos', 'datas importantes'], 'marketing.atendimento': ['quem atende', 'atendimento'], 'marketing.ferramentas': ['crm', 'sistema de vendas', 'ferramentas'],
  'materiais.logo': ['logo', 'logotipo'], 'materiais.fotos': ['fotos'], 'materiais.videos': ['videos'], 'materiais.marca': ['cores', 'manual de marca', 'identidade visual']
};
/* descobre a que pergunta do briefing uma coluna se refere: {s: seção, f: campo, n: nº do produto} ou null */
function bfgGuess(h) {
  let n = 0, label = String(h || '').trim(); const m = label.match(/^(?:produto(?: ou servi[çc]o)?|servi[çc]o)\s*(\d)\s*(?:[—–\-:.·|]\s*)(.+)$/i); if (m) { n = +m[1]; label = m[2]; }
  const T = bfgNorm(label); if (!T) return null; if (/carimbo|timestamp|data hora|endereco de e mail|email address/.test(T)) return {skip: 1};
  /* 1) apelidos */
  { let hit = null, hl = 0; Object.keys(BFG_ALIAS).forEach(key => { const isRep = key.startsWith('produtos.'); if (n && !isRep) return; BFG_ALIAS[key].forEach(a => { if (a.length > hl && (' ' + T + ' ').includes(' ' + a + ' ')) { hit = key; hl = a.length; } }); });
    if (hit) { const [sec, f] = hit.split('.'); return {s: sec, f, n: sec === 'produtos' ? (n || 1) : 0, score: .9}; } }
  let best = null, bs = 0; const cands = [];
  BF_SECTIONS.forEach(s => s.f.forEach(([k, l]) => { if (s.repeat && n === 0 && false) return; cands.push({s: s.k, f: k, l, rep: !!s.repeat}); }));
  const wt = new Set(bfgTok(label));
  cands.forEach(c => {
    if (n && !c.rep) return; if (!n && c.rep && c.f !== 'nome') {/* campos de produto sem número: só se bater muito */}
    const L = bfgNorm(c.l); let sc = 0; if (L === T) sc = 1; else { const lt = new Set(bfgTok(c.l)); if (!lt.size || !wt.size) return; let hit = 0; wt.forEach(w => { if (lt.has(w)) hit++; }); sc = hit / Math.max(lt.size, wt.size) + (T.includes(L) || L.includes(T) ? .2 : 0); }
    if (c.rep && !n) sc -= .15; if (sc > bs) { bs = sc; best = c; }
  });
  if (!best || bs < .55) return null; return {s: best.s, f: best.f, n: best.rep ? (n || 1) : 0, score: bs};
}
const bfgKey = g => g ? (g.skip ? 'skip' : g.n ? `${g.s}.${g.n}.${g.f}` : `${g.s}.${g.f}`) : 'extra';
function bfgOptions() {
  let o = '<option value="skip">Ignorar</option><option value="extra">Anotar em “Outras respostas”</option>';
  BF_SECTIONS.forEach(s => { if (s.repeat) { for (let n = 1; n <= BFG_PROD; n++) o += `<optgroup label="${esc(s.t)} ${n}">${s.f.map(([k, l]) => `<option value="${s.k}.${n}.${k}">${esc(l.slice(0, 70))}</option>`).join('')}</optgroup>`; } else o += `<optgroup label="${esc(s.t)}">${s.f.map(([k, l]) => `<option value="${s.k}.${k}">${esc(l.slice(0, 70))}</option>`).join('')}</optgroup>`; });
  return o;
}
function bfgOpen() {
  BFG.stage = 0; showModal('Importar do Google Forms (CSV)', `<p style="font-size:13px;margin-top:0">Na planilha de respostas do Google Forms: <b>Arquivo → Fazer download → Valores separados por vírgula (.csv)</b>. Depois escolha o arquivo aqui. Serve para o formulário criado pelo script do Studio ou para um formulário seu: as colunas que eu não reconhecer, você aponta ou deixa em “Outras respostas”.</p><input type="file" id="bfgFile" accept=".csv,text/csv,text/plain" onchange="bfgRead(this.files[0])"><div class="row-gap" style="margin-top:10px"><button class="btn sm" onclick="bfScriptOpen()">Ainda não tenho o formulário: criar no Google Forms</button></div>`);
  $('modalBox').classList.add('wide');
}
async function bfgRead(f) {
  if (!f) return; const rows = bfParseCSV(await f.text()); if (rows.length < 2) { toast('O arquivo não tem respostas (precisa do cabeçalho e de pelo menos uma linha).'); return; }
  BFG.head = rows[0].map(h => h.trim()); BFG.rows = rows.slice(1); BFG.pick = BFG.rows.length - 1; BFG.name = f.name;
  BFG.map = BFG.head.map(h => bfgKey(bfgGuess(h))); bfgStep2();
}
function bfgStep2() {
  const R = BFG.rows, h = BFG.head, nm = r => { const i = h.findIndex(x => /empresa|nome/i.test(x) && !/produto|servi/i.test(x)); return (r[i] || r[1] || r[0] || '').slice(0, 50); };
  const rec = BFG.map.filter(k => k !== 'skip' && k !== 'extra').length;
  showModal('Importar do Google Forms · mapear as colunas', `<p style="font-size:13px;margin-top:0">${R.length} resposta(s) em <b>${esc(BFG.name)}</b>. Reconheci <b>${rec}</b> de ${h.length} colunas. Confira e ajuste o que precisar.</p>
  ${R.length > 1 ? `<div class="field"><label>Qual resposta importar?</label><select onchange="BFG.pick=+this.value;bfgStep2()">${R.map((r, i) => `<option value="${i}" ${i === BFG.pick ? 'selected' : ''}>${i + 1} · ${esc(r[0] || '')} · ${esc(nm(r))}</option>`).join('')}</select></div>` : ''}
  <div style="max-height:340px;overflow:auto;border:1px solid var(--line,#ddd);border-radius:8px"><table class="tbl"><thead><tr><th>Coluna do Google</th><th>Resposta</th><th>Vai para</th></tr></thead><tbody>${h.map((x, i) => `<tr><td style="max-width:240px">${esc(x.slice(0, 110))}</td><td style="max-width:220px;color:#666">${esc(String(R[BFG.pick][i] || '').slice(0, 70))}</td><td><select style="max-width:230px" onchange="BFG.map[${i}]=this.value">${bfgOptions().replace(`value="${BFG.map[i]}"`, `value="${BFG.map[i]}" selected`)}</select></td></tr>`).join('')}</tbody></table></div>
  <div class="modal-actions"><button class="btn" onclick="bfgOpen()">← Trocar arquivo</button><button class="btn dark" onclick="bfgImport()">Importar para o projeto</button></div>`);
  $('modalBox').classList.add('wide');
}
/* linha do CSV + mapa → objeto de respostas no formato do briefing */
function bfgAnswers(head, row, map) {
  const a = {contato: {}, empresa: {}, publico: {}, produtos: [], concorrencia: {}, marketing: {}, materiais: {}, extras: []}, ext = [];
  head.forEach((h, i) => {
    const v = String(row[i] == null ? '' : row[i]).trim(), k = map[i]; if (!v || k === 'skip') return; if (k === 'extra') { ext.push([h, v]); return; }
    const p = k.split('.'); let sec, fld, n = 0; if (p.length === 3) { sec = p[0]; n = +p[1]; fld = p[2]; } else { sec = p[0]; fld = p[1]; }
    const S = BF_SECTIONS.find(s => s.k === sec), F = S && S.f.find(x => x[0] === fld); if (!F) { ext.push([h, v]); return; }
    const val = F[2] === 'checks' ? v.split(/\s*,\s*/).filter(Boolean) : v;
    if (S.repeat) { while (a.produtos.length < n) a.produtos.push({}); a.produtos[n - 1][fld] = val; } else a[sec][fld] = val;
  });
  a.produtos = a.produtos.filter(x => x && Object.values(x).some(Boolean)); a.extras = ext.slice(0, 40).map(([q, r]) => ({q: q.slice(0, 160), r: r.slice(0, 1500)})); a.aceite = true; return a;
}
function bfgImport() {
  const p = curProject(), a = bfgAnswers(BFG.head, BFG.rows[BFG.pick], BFG.map), miss = bfMissing(Object.assign({}, a, {aceite: true}));
  if (!a.produtos.length && !confirm('Nenhum produto ou serviço foi reconhecido. Importar mesmo assim?')) return;
  const x = bfApply(p, a), b = bfStore(p); b.source = 'google'; b.answers = a; b.updatedAt = b.importedAt; b.status = 'enviado'; b.submittedAt = b.importedAt; persist(); closeModal();
  showModal('Briefing importado do Google Forms', `<p>As respostas foram para o projeto: ficha do briefing, voz da marca, <b>${x.added}</b> produto(s) ou serviço(s) novo(s) e ${x.upd} atualizado(s). ${a.extras.length ? `<b>${a.extras.length}</b> resposta(s) sem destino ficaram em “Outras respostas” e a IA também as lê.` : ''} O que você já tinha preenchido foi mantido.</p>${miss.filter(m => m !== 'a autorização de uso das informações').length ? `<div class="so-issue aviso">Faltou: ${esc(miss.filter(m => m !== 'a autorização de uso das informações').join(', '))}.</div>` : ''}<div class="modal-actions"><button class="btn" onclick="closeModal();bfRerender()">Fechar</button><button class="btn dark" onclick="closeModal();preGenAll(true)">✦ Gerar o pré-projeto agora</button></div>`); bfRerender();
}
