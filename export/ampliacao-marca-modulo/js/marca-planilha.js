/* Planilha da Marca (valores, atitudes, arquétipo e voz): gera o .xlsx / .csv em branco ou preenchido e lê de volta.
   Usado no Studio e na página do cliente (marca.html). Precisa de: identidade-data.js, identidade-guia.js, briefing-form.js, xlsx-mini.js.
   Formato: aba "Marca" com as colunas Seção | Pergunta | Sua resposta | Chave. A coluna Chave é o que o Studio usa para ler de volta. */
const MP_TON = ['formal', 'humor', 'tecnico', 'calor', 'ousadia'];
function mpFields() {
  const sec = BF_SECTIONS.find(s => s.k === 'identidade'), nomes = Object.keys(ID_ARCHS).map(k => ID_ARCHS[k].n);
  const base = sec.f.map(f => ({k: 'identidade.' + f[0], q: f[1], t: f[2], o: f[2] === 'checks' || f[2] === 'select' ? f[3] : null}));
  return [{k: 'contato.nome', q: 'Seu nome', t: 'text', o: null}].concat(base, [
    {k: 'identidade.arq', q: 'Arquétipo principal que você acha que é o da empresa (opcional: deixe em branco para o Studio sugerir)', t: 'select', o: nomes},
    {k: 'identidade.arq2', q: 'Arquétipo secundário (opcional)', t: 'select', o: nomes},
    {k: 'referencias.admira', q: 'Marcas que você admira ou que se parecem com a sua (uma por linha)', t: 'area', o: null}]);
}
function mpGet(a, path) { let c = a; for (const k of path.split('.')) { if (c == null || typeof c !== 'object') return ''; c = c[k]; } return c == null ? '' : c; }
function mpPut(a, path, v) { const p = path.split('.'); let c = a; for (let i = 0; i < p.length - 1; i++) { if (c[p[i]] == null || typeof c[p[i]] !== 'object') c[p[i]] = {}; c = c[p[i]]; } c[p[p.length - 1]] = v; }
const mpCell = v => Array.isArray(v) ? v.map(x => String(x).replace(/;/g, ',')).join('; ') : String(v == null ? '' : v);
function mpSecName(k) { return k === 'contato.nome' ? 'Quem responde' : /identidade\.(valores|valoresExtra)$/.test(k) ? '1 · Valores' : /identidade\.(atitudes|atitudesExtra)$/.test(k) ? '2 · Atitudes' : /identidade\.t_/.test(k) ? '3 · Tom de voz' : /identidade\.arq/.test(k) ? '4 · Arquétipo' : k === 'referencias.admira' ? '6 · Marcas que você admira' : '5 · Voz e palavras'; }
/* resultado (principal, secundário, terciário) a partir das respostas */
function mpResult(a) {
  const I = a.identidade || {}, ids = (list, labs) => (Array.isArray(labs) ? labs : []).map(l => { const x = list.find(v => v[1].toLowerCase() === String(l).trim().toLowerCase()); return x && x[0]; }).filter(Boolean);
  const nm = l => { const k = Object.keys(ID_ARCHS).find(x => ID_ARCHS[x].n.toLowerCase() === String(l || '').trim().toLowerCase()); return k || ''; };
  return idRoles({values: ids(ID_VALUES, I.valores), attitudes: ids(ID_ATTS, I.atitudes), arch: nm(I.arq), arch2: nm(I.arq2)});
}
function mpSheets(a, nome) {
  a = a || {}; const F = mpFields(), r = mpResult(a), H1 = 1, H2 = 2, N = 3, T = 4, W = 5;
  const como = [[['Como preencher a planilha da Marca', T]], [''],
    [['1. Vá na aba "Marca" e escreva na coluna C ("Sua resposta"). Não mexa na coluna D (Chave) nem nos títulos.', W]],
    [['2. Valores e atitudes: copie da aba "Opções" os que combinam com a empresa (de 5 a 7 de cada) e separe com ponto e vírgula (;).', W]],
    [['3. Tom de voz: escolha na lista que aparece na célula (ou digite igual).', W]],
    [['4. Palavras e atitudes: escreva uma por linha (Alt+Enter dentro da célula) ou separe com ponto e vírgula (;).', W]],
    [['5. A aba "Guia dos arquétipos" explica cada um dos 12 arquétipos. Ela é só para consulta.', W]],
    [['6. Quando terminar, salve e envie a planilha de volta para quem pediu. Ela será lida automaticamente.', W]]];
  const rows = [[['Seção', H1], ['Pergunta', H1], ['Sua resposta', H2], ['Chave (não mexa)', H1]]], lists = [];
  F.forEach((f, i) => { rows.push([[mpSecName(f.k), N], [f.q, W], [mpCell(mpGet(a, f.k)), W], [f.k, N]]); if (f.t === 'select' && f.o) lists.push({ref: 'C' + (i + 2), items: f.o}); });
  const op = [[['Valores (escolha de 5 a 7)', H1], ['Atitudes (escolha de 5 a 7)', H1], ['Arquétipos', H1]]], mx = Math.max(ID_VALUES.length, ID_ATTS.length, 12);
  for (let i = 0; i < mx; i++) op.push([ID_VALUES[i] ? ID_VALUES[i][1] : '', ID_ATTS[i] ? ID_ATTS[i][1] : '', Object.keys(ID_ARCHS)[i] ? ID_ARCHS[Object.keys(ID_ARCHS)[i]].n : '']);
  const guia = [[['Arquétipo', H1], ['Quem é', H1], ['Atitudes', H1], ['Como se comunica', H1], ['Marcas citadas', H1]]];
  Object.keys(ID_ARCHS).forEach(k => { const x = ID_ARCHS[k], g = ID_GUIA[k]; guia.push([[x.n, 0], [g.quem, W], [g.atit.join('; '), W], [g.comunica, W], [x.marcas.join(', '), W]]); });
  const res = [[['Resultado (calculado ao baixar)', H1], ['', H1]]];
  if (r.main) { res.push(['Principal', ID_ARCHS[r.main].n]); if (r.sec) res.push(['Secundário', ID_ARCHS[r.sec].n]); if (r.ter) res.push(['Terciário', ID_ARCHS[r.ter].n]); } else res.push(['Sem resultado ainda', 'Preencha valores e atitudes para o Studio sugerir o arquétipo.']);
  return [{name: 'Como preencher', rows: como, widths: [110]}, {name: 'Marca', rows, widths: [22, 60, 60, 22], lists}, {name: 'Opções', rows: op, widths: [30, 44, 22]}, {name: 'Guia dos arquétipos', rows: guia, widths: [16, 50, 50, 50, 28]}, {name: 'Resultado', rows: res, widths: [20, 60]}];
}
function mpCsv(a) {
  const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  return '﻿' + [['Seção', 'Pergunta', 'Sua resposta', 'Chave']].concat(mpFields().map(f => [mpSecName(f.k), f.q, mpCell(mpGet(a || {}, f.k)), f.k])).map(r => r.map(q).join(';')).join('\r\n');
}
/* linhas lidas de um .xlsx/.csv → respostas */
function mpReadRows(rows) {
  const norm = s => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '');
  let hi = rows.findIndex(r => (r || []).some(c => norm(c).startsWith('chave'))); if (hi < 0) throw new Error('Não encontrei a coluna "Chave". Use a planilha baixada da Marca, sem apagar as colunas.');
  const kc = rows[hi].findIndex(c => norm(c).startsWith('chave')), rc = rows[hi].findIndex(c => norm(c).startsWith('suaresposta')), ac = rc >= 0 ? rc : kc - 1, F = mpFields(), a = {};
  rows.slice(hi + 1).forEach(r => {
    const key = String((r || [])[kc] || '').trim(), f = F.find(x => x.k === key); if (!f) return; const raw = String((r || [])[ac] == null ? '' : r[ac]).replace(/\r/g, '').trim();
    if (f.t === 'checks') mpPut(a, key, raw.split(/;|\n/).map(x => x.trim()).filter(Boolean));
    else if (f.t === 'select') { const o = (f.o || []).find(x => norm(x) === norm(raw)); mpPut(a, key, o || ''); }
    else mpPut(a, key, raw);
  });
  return a;
}
/* acha a aba certa em um arquivo lido (lista de {name, rows}) */
function mpFromSheets(sheets) {
  const ok = s => (s.rows || []).some(r => (r || []).some(c => /^chave/i.test(String(c).trim().normalize('NFD').replace(/[̀-ͯ]/g, ''))));
  const s = sheets.find(x => /^marca$/i.test(x.name) && ok(x)) || sheets.find(ok); if (!s) throw new Error('Não encontrei a aba "Marca" com a coluna "Chave". Use a planilha baixada da Marca.');
  return mpReadRows(s.rows);
}
