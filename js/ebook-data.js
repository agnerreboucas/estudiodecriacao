/* ===== Editora · modelo de dados, modelos prontos, importação de manuscrito, verificações, documento de revisão e EPUB ===== */
const EB_BRAND_MCS = {h: 'Playfair Display', b: 'Montserrat', c: {primary: '#4F8A55', light: '#6AA170', terra: '#B99B78', gold: '#C9A876', bg: '#F4F1EC', box: '#F7F4EE', text: '#3A3733', soft: '#4A4741'}};
const EB_BLOCK_TYPES = [['p', 'Parágrafo'], ['h2', 'Subtítulo'], ['box', 'Caixa (caso, dica, atenção…)'], ['cols2', 'Duas colunas (comuns × faça assim)'], ['list', 'Lista'], ['check', 'Checklist (página cheia)'], ['summary', 'Resumo (página cheia)'], ['pagebreak', 'Quebra de página']];
const ebId = p => uid(p || 'eb');
const ebBlock = (t, o) => Object.assign({id: ebId('bk'), t}, ({p: {text: '', drop: false}, h2: {text: ''}, box: {kind: 'tip', title: '', text: ''}, cols2: {leftTitle: 'Situações comuns', left: [''], rightTitle: 'Faça assim', right: ['']}, list: {ordered: false, items: ['']}, check: {title: 'Checklist do capítulo', items: ['', '', '', '']}, summary: {title: 'Resumo do capítulo', items: ['', '', '']}, pagebreak: {}})[t] || {}, o || {});
const ebSec = (type, o) => Object.assign({id: ebId('sc'), type, label: '', title: '', subtitle: '', opener: type === 'chapter', inToc: true, blocks: []}, o || {});
const PH = s => '[' + s + ']';

function ebNew(preset, title, author) {
  const eb = {id: ebId('ebk'), name: title || 'Novo e-book', title: title || 'Título do e-book', subtitle: 'Subtítulo em itálico', author: author || '', collection: '', footer: 'MÉTODO CUIDADO SEGURO', brand: JSON.parse(JSON.stringify(EB_BRAND_MCS)), sections: [], terms: {avoid: [], keep: ''}, coverSetId: '', created: new Date().toISOString()};
  if (preset === 'mcs') {
    eb.collection = 'Coleção Método Cuidado Seguro'; eb.author = author || 'Prof.ª Mestre Francisca Antonia Almeida da Silva';
    eb.sections.push(ebSec('title', {label: 'GUIA PRÁTICO', title: 'Título', inToc: false}));
    eb.sections.push(ebSec('text', {title: 'Direitos Autorais', inToc: false, blocks: [ebBlock('p', {text: PH('CONFIRMAR: texto de direitos autorais, ano, ISBN e aviso legal da autora. Exemplo: “© ' + new Date().getFullYear() + ' ' + eb.author + '. Todos os direitos reservados. Proibida a reprodução total ou parcial sem autorização.”')}), ebBlock('p', {text: PH('CONFIRMAR: aviso de que o conteúdo é educativo e não substitui avaliação profissional individual.')})]}));
    eb.sections.push(ebSec('text', {title: 'Apresentação', blocks: [1, 2, 3].map(i => ebBlock('p', {text: PH('Escreva o parágrafo ' + i + ' da apresentação')}))}));
    eb.sections.push(ebSec('toc', {title: 'Sumário', inToc: false}));
    for (let i = 1; i <= 7; i++) eb.sections.push(ebSec('chapter', {label: 'CAPÍTULO ' + ebPad2(i), title: 'Título do capítulo ' + i, subtitle: 'Subtítulo do capítulo', blocks: [
      ebBlock('box', {kind: 'case', title: 'Caso prático', text: PH('Escreva o caso prático do capítulo ' + i)}), ebBlock('p', {drop: true, text: PH('Parágrafo 1 (com letra capitular)')}), ebBlock('p', {text: PH('Parágrafo 2')}), ebBlock('p', {text: PH('Parágrafo 3')}),
      ebBlock('box', {kind: 'tip', title: 'Dica', text: PH('Escreva a dica (ou troque o tipo da caixa: atenção, você sabia, cuide de você)')}),
      ebBlock('cols2', {left: [PH('Situação comum 1'), PH('Situação comum 2'), PH('Situação comum 3')], right: [PH('Faça assim 1'), PH('Faça assim 2'), PH('Faça assim 3')]}),
      ebBlock('check', {items: [1, 2, 3, 4].map(k => PH('Item ' + k + ' do checklist'))}), ebBlock('summary', {items: [1, 2, 3].map(k => PH('Ponto ' + k + ' do resumo'))})]}));
    eb.sections.push(ebSec('text', {title: 'Plano final', blocks: [ebBlock('list', {ordered: true, items: [1, 2, 3, 4, 5, 6, 7].map(k => PH('Passo ' + k + ' do plano'))}), ebBlock('check', {title: 'Checklist final', items: [1, 2, 3, 4].map(k => PH('Item ' + k))})]}));
    eb.sections.push(ebSec('text', {title: 'Conclusão', blocks: [1, 2, 3].map(i => ebBlock('p', {text: PH('Escreva o parágrafo ' + i + ' da conclusão')}))}));
    eb.sections.push(ebSec('text', {title: 'Bônus · Continue essa jornada', blocks: [ebBlock('list', {ordered: true, items: [PH('Bônus 1'), PH('Bônus 2'), PH('Bônus 3')]}), ebBlock('p', {text: PH('Texto sobre a coleção Método Cuidado Seguro')}), ebBlock('box', {kind: 'care', title: 'Fale com a autora', text: 'Instagram: @fisiofranalmeida\nTikTok: @fisio.fran.almeida'}), ebBlock('p', {text: PH('Frase final (tagline)')})]}));
    eb.sections.push(ebSec('text', {title: 'Referências bibliográficas', blocks: [ebBlock('list', {ordered: true, items: [PH('CONFIRMAR: referência 1 real e verificável'), PH('CONFIRMAR: referência 2 real e verificável')]})]}));
  } else {
    eb.sections.push(ebSec('title', {label: 'GUIA PRÁTICO', inToc: false}), ebSec('toc', {title: 'Sumário', inToc: false}), ebSec('chapter', {label: 'CAPÍTULO 01', title: 'Primeiro capítulo', subtitle: 'Subtítulo', blocks: [ebBlock('p', {drop: true, text: PH('Escreva aqui o texto do capítulo.')})]}));
  }
  return eb;
}

/* ---- importar manuscrito (texto com marcações simples) ----
   # Título do capítulo      → novo capítulo        ## Subtítulo → subtítulo (1º) ou subtítulo interno
   linha em branco separa parágrafos                > caso: …  > dica: …  > atenção: …  > sabia: …  > cuide: …  → caixas
   - item / 1. item → listas      [ ] item → checklist      [v] item → resumo      @comuns: item / @faca: item → duas colunas */
function ebImport(text, eb) {
  const lines = String(text || '').replace(/\r/g, '').split('\n'), out = []; let sec = null, para = [], list = null, chk = null, sum = null, cL = [], cR = [];
  const flushP = () => { if (para.length && sec) sec.blocks.push(ebBlock('p', {text: para.join(' ').trim(), drop: !sec.blocks.some(b => b.t === 'p')})); para = []; };
  const flushAll = () => { flushP(); if (list && sec) sec.blocks.push(list); list = null; if (chk && sec) sec.blocks.push(chk); chk = null; if (sum && sec) sec.blocks.push(sum); sum = null; if ((cL.length || cR.length) && sec) sec.blocks.push(ebBlock('cols2', {left: cL, right: cR})); cL = []; cR = []; };
  const BOX = {caso: 'case', dica: 'tip', atencao: 'warn', atenção: 'warn', sabia: 'know', cuide: 'care', nota: 'note'};
  let last = '';
  const kindOf = ln => /^\[ \]/.test(ln) ? 'chk' : /^\[[vVxX✔]\]/.test(ln) ? 'sum' : /^@(comuns?|fa[cç]a)\s*:/i.test(ln) ? 'col' : /^[-•*]\s+/.test(ln) ? 'ul' : /^\d+[.)]\s+/.test(ln) ? 'ol' : '';
  for (const raw of lines) {
    const ln = raw.trim(); let m;
    if ((m = ln.match(/^#\s+(.+)/))) { flushAll(); last = ''; sec = ebSec('chapter', {title: m[1].trim(), label: '', subtitle: '', blocks: []}); out.push(sec); continue; }
    if (!sec) { if (!ln) continue; sec = ebSec('chapter', {title: 'Capítulo importado', blocks: []}); out.push(sec); }
    if ((m = ln.match(/^##\s+(.+)/))) { flushAll(); last = ''; if (!sec.subtitle && !sec.blocks.length) sec.subtitle = m[1].trim(); else sec.blocks.push(ebBlock('h2', {text: m[1].trim()})); continue; }
    if (!ln) { flushP(); continue; }
    const k = kindOf(ln); if (k !== last) { flushAll(); } last = k;
    if ((m = ln.match(/^>\s*([\p{L}]+)\s*:\s*(.+)/u)) && BOX[m[1].toLowerCase()]) { flushAll(); sec.blocks.push(ebBlock('box', {kind: BOX[m[1].toLowerCase()], title: '', text: m[2].trim()})); continue; }
    if ((m = ln.match(/^\[ \]\s*(.+)/))) { chk = chk || ebBlock('check', {items: []}); chk.items.push(m[1].trim()); continue; }
    if ((m = ln.match(/^\[[vVxX✔]\]\s*(.+)/))) { sum = sum || ebBlock('summary', {items: []}); sum.items.push(m[1].trim()); continue; }
    if ((m = ln.match(/^@comuns?\s*:\s*(.+)/i))) { cL.push(m[1].trim()); continue; }
    if ((m = ln.match(/^@fa[cç]a\s*:\s*(.+)/i))) { cR.push(m[1].trim()); continue; }
    if ((m = ln.match(/^(?:[-•*]|(\d+)[.)])\s+(.+)/))) { const ord = !!m[1]; list = list || ebBlock('list', {ordered: ord, items: []}); list.items.push(m[2].trim()); continue; }
    para.push(ln);
  }
  flushAll(); return out;
}

/* ---- verificações (o revisor) ---- */
function ebTexts(eb) {   // [{sec, where, text}]
  const out = [], push = (sec, where, t) => { if (t != null && String(t).trim() !== '') out.push({sec: sec.id, where: (sec.title || sec.type) + ' · ' + where, text: String(t)}); };
  push({id: '', title: 'Capa', type: ''}, 'título', eb.title); push({id: '', title: 'Capa', type: ''}, 'subtítulo', eb.subtitle);
  (eb.sections || []).forEach(sec => { push(sec, 'título', sec.title); push(sec, 'subtítulo', sec.subtitle); (sec.blocks || []).forEach((b, i) => { const w = 'bloco ' + (i + 1); ['text', 'title', 'leftTitle', 'rightTitle'].forEach(k => push(sec, w, b[k])); ['items', 'left', 'right'].forEach(k => (b[k] || []).forEach(t => push(sec, w, t))); }); });
  return out;
}
async function ebCheck(eb) {
  const res = []; const add = (level, sec, msg) => res.push({level, sec: sec || '', msg});
  const texts = ebTexts(eb), avoid = (eb.terms.avoid || []).map(t => t.trim().toLowerCase()).filter(Boolean), keep = (eb.terms.keep || '').trim().toLowerCase();
  texts.forEach(t => {
    const low = t.text.toLowerCase();
    if (/\[CONFIRMAR[^\]]*\]/i.test(t.text)) add('aviso', t.sec, t.where + ': pede confirmação da autora (' + (t.text.match(/\[CONFIRMAR[^\]]*\]/i)[0].slice(0, 60)) + '…).');
    else if (/\[[^\]]{2,}\]/.test(t.text)) add('aviso', t.sec, t.where + ': ainda tem texto de modelo para preencher.');
    if (/ {2,}/.test(t.text)) add('info', t.sec, t.where + ': espaços duplicados.');
    const rep = t.text.match(/(^|\s)(\p{L}{2,})\s+\2(?=\s|[.,;:!?]|$)/iu); if (rep) add('aviso', t.sec, t.where + ': palavra repetida “' + rep[2] + ' ' + rep[2] + '”.');
    avoid.forEach(a => { if (low.includes(a)) add('erro', t.sec, t.where + ': termo a evitar “' + a + '” (use o termo do título).'); });
  });
  if (keep) { const n = texts.filter(t => t.text.toLowerCase().includes(keep)).length; if (!n) add('aviso', '', 'O termo-chave “' + keep + '” não aparece em nenhum texto.'); }
  (eb.sections || []).forEach(sec => { if (sec.type === 'chapter') { if (!(sec.blocks || []).some(b => b.t === 'check')) add('info', sec.id, (sec.title || 'Capítulo') + ': sem checklist.'); if (!(sec.blocks || []).some(b => b.t === 'summary')) add('info', sec.id, (sec.title || 'Capítulo') + ': sem resumo.'); } (sec.blocks || []).forEach((b, i) => { if (b.t === 'p' && !String(b.text || '').trim()) add('aviso', sec.id, (sec.title || sec.type) + ' · bloco ' + (i + 1) + ': parágrafo vazio.'); if (['check', 'summary', 'list'].includes(b.t) && !(b.items || []).some(x => String(x).trim())) add('aviso', sec.id, (sec.title || sec.type) + ' · bloco ' + (i + 1) + ': lista vazia.'); }); });
  await ensureFonts([eb.brand.h, eb.brand.b]);
  for (const fid of Object.keys(EB_FORMATS)) { const r = ebBuild(eb, fid, {noCover: true}); r.issues.forEach(is => add('erro', is.sec, '[' + EB_FORMATS[fid].short + '] ' + is.msg)); if (fid === 'mobile') add('info', '', 'Total na versão celular: ' + r.pages.length + ' páginas (padrão da coleção: ~36).'); }
  if (!eb.coverSetId) add('info', '', 'Sem capa ainda: o PDF sai com a página de título como primeira página.');
  const seen = new Set(); return res.filter(r => { const k = r.level + r.sec + r.msg; if (seen.has(k)) return false; seen.add(k); return true; });
}

/* ---- documento de revisão (abre no Word e no Google Docs; um capítulo por página) ---- */
function ebReviewHTML(eb) {
  const c = eb.brand.c, E = esc, tone = k => c[(EB_KINDS[k] || EB_KINDS.tip).tone], nl = t => E(t).replace(/\n/g, '<br>');
  const blk = b => {
    if (b.t === 'p') return `<p style="font-family:${E(eb.brand.b)},Arial;font-size:11pt;line-height:1.5">${nl(b.text)}</p>`;
    if (b.t === 'h2') return `<h3 style="font-family:${E(eb.brand.h)},Georgia;color:${c.primary}">${E(b.text)}</h3>`;
    if (b.t === 'box') { const K = EB_KINDS[b.kind] || EB_KINDS.tip; return `<table width="100%" cellpadding="10" cellspacing="0" style="border-left:6px solid ${tone(b.kind)};background:${c.box};margin:10px 0"><tr><td bgcolor="${c.box}"><b style="color:${tone(b.kind)}">${K.icon} ${E(b.title || K.label)}</b><br>${nl(b.text)}</td></tr></table>`; }
    if (b.t === 'cols2') return `<table width="100%" cellpadding="10" cellspacing="6" style="margin:10px 0"><tr><td width="50%" valign="top" bgcolor="#f4e1de"><b style="color:${c.terra}">❌ ${E(b.leftTitle)}</b><ul>${(b.left || []).map(x => '<li>' + E(x) + '</li>').join('')}</ul></td><td width="50%" valign="top" bgcolor="#e1eee2"><b style="color:${c.primary}">✅ ${E(b.rightTitle)}</b><ul>${(b.right || []).map(x => '<li>' + E(x) + '</li>').join('')}</ul></td></tr></table>`;
    if (b.t === 'list') return (b.ordered ? '<ol>' : '<ul>') + (b.items || []).map(x => '<li>' + E(x) + '</li>').join('') + (b.ordered ? '</ol>' : '</ul>');
    if (b.t === 'check' || b.t === 'summary') return `<table width="100%" cellpadding="10" style="border:1px solid ${c.primary};margin:10px 0"><tr><td><b style="color:${c.primary}">${b.t === 'check' ? '☐' : '✔'} ${E(b.title)}</b><br>${(b.items || []).map(x => (b.t === 'check' ? '☐ ' : '✔ ') + E(x)).join('<br>')}</td></tr></table>`;
    return '';
  };
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${E(eb.title)} · revisão</title><style>body{font-family:${E(eb.brand.b)},Arial,sans-serif;color:${c.text};max-width:760px;margin:30px auto}h1,h2{font-family:${E(eb.brand.h)},Georgia,serif;color:${c.primary}}.pg{page-break-before:always}.kick{color:${c.gold};letter-spacing:3px;font-size:10pt;font-weight:bold}@page{margin:2cm}</style></head><body>
  <p class="kick">${E(eb.sections.find(s => s.type === 'title') ? (eb.sections.find(s => s.type === 'title').label || 'GUIA PRÁTICO') : 'GUIA PRÁTICO')}</p><h1>${E(eb.title)}</h1><p><i>${E(eb.subtitle)}</i></p><p>${E(eb.author)}${eb.collection ? ' · ' + E(eb.collection) : ''}</p><p style="background:#fff7d6;padding:8px">Documento de revisão. Itens entre [colchetes] precisam ser preenchidos ou confirmados pela autora antes da diagramação.</p>
  ${(eb.sections || []).filter(s => s.type !== 'title' && s.type !== 'toc').map(s => `<div class="pg">${s.label ? '<p class="kick">' + E(s.label) + '</p>' : ''}<h2>${E(s.title)}</h2>${s.subtitle ? '<p><i>' + E(s.subtitle) + '</i></p>' : ''}${(s.blocks || []).map(blk).join('')}</div>`).join('')}</body></html>`;
}

/* ---- EPUB (texto reflowável, com a capa quando houver) ---- */
async function ebEpub(eb) {
  const X = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'), nl = t => X(t).replace(/\n/g, '<br/>'), c = eb.brand.c, enc = s => new TextEncoder().encode(s), files = [], id = 'urn:uuid:' + (crypto.randomUUID ? crypto.randomUUID() : eb.id);
  const css = `body{font-family:${eb.brand.b},sans-serif;color:${c.text};line-height:1.5}h1,h2,h3{font-family:${eb.brand.h},serif;color:${c.primary}}.kick{color:${c.gold};letter-spacing:.2em;font-size:.8em;font-weight:bold}.box{border-left:5px solid ${c.primary};background:${c.box};padding:.7em 1em;margin:1em 0}.box b{display:block}.cols{width:100%;border-collapse:separate;border-spacing:6px}.cols td{vertical-align:top;padding:.6em}.rose{background:#f4e1de}.green{background:#e1eee2}`;
  const blk = b => { if (b.t === 'p') return `<p>${nl(b.text)}</p>`; if (b.t === 'h2') return `<h3>${X(b.text)}</h3>`; if (b.t === 'box') { const K = EB_KINDS[b.kind] || EB_KINDS.tip; return `<div class="box" style="border-left-color:${c[K.tone]}"><b>${K.icon} ${X(b.title || K.label)}</b>${nl(b.text)}</div>`; }
    if (b.t === 'cols2') return `<table class="cols"><tr><td class="rose"><b>❌ ${X(b.leftTitle)}</b><ul>${(b.left || []).map(x => '<li>' + X(x) + '</li>').join('')}</ul></td><td class="green"><b>✅ ${X(b.rightTitle)}</b><ul>${(b.right || []).map(x => '<li>' + X(x) + '</li>').join('')}</ul></td></tr></table>`;
    if (b.t === 'list') return (b.ordered ? '<ol>' : '<ul>') + (b.items || []).map(x => '<li>' + X(x) + '</li>').join('') + (b.ordered ? '</ol>' : '</ul>');
    if (b.t === 'check' || b.t === 'summary') return `<div class="box"><b>${b.t === 'check' ? '☐' : '✔'} ${X(b.title)}</b>${(b.items || []).map(x => (b.t === 'check' ? '☐ ' : '✔ ') + X(x)).join('<br/>')}</div>`; return ''; };
  const xh = (title, body) => `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="pt-BR" lang="pt-BR"><head><title>${X(title)}</title><link rel="stylesheet" type="text/css" href="styles.css"/></head><body>${body}</body></html>`;
  const secs = (eb.sections || []).filter(s => s.type !== 'toc'), items = [];
  files.push({name: 'mimetype', data: enc('application/epub+zip')}, {name: 'META-INF/container.xml', data: enc('<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>')}, {name: 'OEBPS/styles.css', data: enc(css)});
  secs.forEach((s, i) => { const fn = 'sec' + (i + 1) + '.xhtml'; items.push({fn, title: s.type === 'title' ? eb.title : s.title, s});
    const body = s.type === 'title' ? `<div style="text-align:center;margin-top:20%"><p class="kick">${X(s.label || 'GUIA PRÁTICO')}</p><h1>${X(eb.title)}</h1><p><i>${X(eb.subtitle)}</i></p><p>${X(eb.author)}</p><p class="kick">${X(eb.collection)}</p></div>` : `${s.label ? '<p class="kick">' + X(s.label) + '</p>' : ''}<h2>${X(s.title)}</h2>${s.subtitle ? '<p><i>' + X(s.subtitle) + '</i></p>' : ''}${(s.blocks || []).map(blk).join('')}`;
    files.push({name: 'OEBPS/' + fn, data: enc(xh(items[i].title, body))}); });
  let coverMeta = '', coverItem = '';
  if (eb.coverSetId) { const cb = await ebCoverBitmap(eb); if (cb) { const blob = await new Promise(r => cb.toBlob(r, 'image/jpeg', 0.9)); files.push({name: 'OEBPS/cover.jpg', data: new Uint8Array(await blob.arrayBuffer())}); coverMeta = '<meta name="cover" content="cover-img"/>'; coverItem = '<item id="cover-img" href="cover.jpg" media-type="image/jpeg" properties="cover-image"/>'; } }
  files.push({name: 'OEBPS/nav.xhtml', data: enc(`<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Sumário</title></head><body><nav epub:type="toc" id="toc"><h1>Sumário</h1><ol>${items.map(it => `<li><a href="${it.fn}">${X(it.title)}</a></li>`).join('')}</ol></nav></body></html>`)});
  files.push({name: 'OEBPS/content.opf', data: enc(`<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="uid">${id}</dc:identifier><dc:title>${X(eb.title)}</dc:title><dc:creator>${X(eb.author)}</dc:creator><dc:language>pt-BR</dc:language><meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</meta>${coverMeta}</metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="css" href="styles.css" media-type="text/css"/>${coverItem}${items.map((it, i) => `<item id="s${i + 1}" href="${it.fn}" media-type="application/xhtml+xml"/>`).join('')}</manifest><spine>${items.map((it, i) => `<itemref idref="s${i + 1}"/>`).join('')}</spine></package>`)});
  return makeZip(files);
}
