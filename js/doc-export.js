/* ===== Exportação de documentos em PDF e DOCX (Word e Google Docs), sem bibliotecas =====
   Os dois levam um cabeçalho em todas as páginas com o nome do projeto e do responsável.
   O PDF usa as fontes padrão Helvetica (acentos do português); o DOCX é um arquivo Open XML comum. */
const DX_STATUS_LINE = d => (d.status === 'Aprovado' && d.approvedAt ? 'Aprovado em ' + new Date(d.approvedAt).toLocaleDateString('pt-BR') : d.status || '');

/* ---------- texto → blocos (título, subtítulo, parágrafo, tabela, linha) ---------- */
function dxBlocks(text) {
  const L = String(text || '').replace(/\r/g, '').split('\n'), B = []; let para = [], first = true;
  const flush = () => { if (para.length) { B.push({t: 'p', lines: para}); para = []; } };
  for (let i = 0; i < L.length; i++) {
    const tl = L[i].trim();
    if (!tl) { flush(); continue; }
    if (/^(-{3,}|\* \* \*|\*{3,})$/.test(tl)) { flush(); B.push({t: 'hr'}); continue; }
    if (tl.startsWith('|')) {
      flush(); const rows = [];
      while (i < L.length && L[i].trim().startsWith('|')) { const cells = L[i].trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim()); if (!cells.every(c => /^:?-{2,}:?$/.test(c))) rows.push(cells); i++; }
      i--; B.push({t: 'table', rows}); continue;
    }
    if (first) { first = false; B.push({t: 'h1', text: tl}); continue; }
    if (/^Cena \d+/.test(tl) || (!/:$/.test(tl) && tl === tl.toUpperCase() && /^[A-ZÀ-Ú][A-ZÀ-Ú0-9\s/—–:.,()%-]{3,}$/.test(tl) && tl.length < 90)) { flush(); B.push({t: 'h2', text: tl}); continue; }
    para.push(tl);
  }
  flush(); return B;
}

/* ---------- PDF ---------- */
const DX_W = {
  r: [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584],
  b: [278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584]
};
const DX_SPECIAL = {'–': ['\x96', 556], '—': ['\x97', 1000], '‘': ['\x91', 222], '’': ['\x92', 222], '“': ['\x93', 333], '”': ['\x94', 333], '•': ['\x95', 350], '…': ['\x85', 1000], '€': ['\x80', 556]};
const DX_FALL = {'→': '->', '←': '<-', '★': '*', '☆': '*', '✓': 'v', '✗': 'x', '✨': '', '⬇': '', '＋': '+', ' ': ' '};
/* converte para os caracteres que a fonte do PDF tem (WinAnsi); o resto vira um equivalente simples */
function dxLatin(s) { let o = ''; for (const ch of String(s)) { if (DX_SPECIAL[ch]) o += DX_SPECIAL[ch][0]; else { const c = ch.charCodeAt(0); if (c < 32 && ch !== ' ') o += ' '; else if (c < 256) o += ch; else o += DX_FALL[ch] != null ? DX_FALL[ch] : (ch.normalize('NFD').replace(/[̀-ͯ]/g, '').charCodeAt(0) < 128 ? ch.normalize('NFD').replace(/[̀-ͯ]/g, '') : '?'); } } return o; }
function dxCharW(ch, bold) {
  const c = ch.charCodeAt(0), t = bold ? DX_W.b : DX_W.r;
  if (c >= 32 && c <= 126) return t[c - 32];
  for (const k in DX_SPECIAL) if (DX_SPECIAL[k][0] === ch) return DX_SPECIAL[k][1];
  if (c === 0xD7) return 584;
  if (c >= 192 && c <= 255) { const base = ch.normalize('NFD').replace(/[̀-ͯ]/g, ''); if (base.length && base.charCodeAt(0) < 127 && base !== ch) return t[base.charCodeAt(0) - 32]; if (c === 0xE7 || c === 0xC7) return t[(c === 0xE7 ? 99 : 67) - 32]; }
  return 556;
}
const dxWidth = (s, size, bold) => { let w = 0; for (const ch of s) w += dxCharW(ch, bold); return w * size / 1000; };
function dxWrap(s, size, bold, maxW) {
  const out = []; for (const para of String(s).split('\n')) {
    let line = ''; for (const word of para.split(/\s+/).filter(Boolean)) {
      let cand = line ? line + ' ' + word : word;
      if (dxWidth(cand, size, bold) <= maxW) { line = cand; continue; }
      if (line) { out.push(line); line = ''; }
      if (dxWidth(word, size, bold) <= maxW) { line = word; continue; }
      let part = ''; for (const ch of word) { if (dxWidth(part + ch, size, bold) > maxW && part) { out.push(part); part = ch; } else part += ch; } line = part;
    }
    out.push(line);
  }
  return out;
}
/* "Rótulo: texto" (rótulo curto, sem número) e rótulos que merecem destaque */
const dxLabel = l => { const m = /^([A-Za-zÀ-ÿ][^:\n]{1,34}):\s+(\S.*)$/.exec(l); return m && !/\d:/.test(m[1]) ? m : null; };
/* rótulo sozinho na linha ("Qual Hook?" + valor) vira "Hook: valor"; tira "Qual/Quais/Em qual" do início */
const dxClean = l => l.replace(/^(?:Em qual|Qual|Quais|Quem)\s+/i, m => '').replace(/^./, c => c.toUpperCase());
function dxLines(lines) {
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i], m = /^([^:?\n]{2,40})[:?]$/.exec(l);
    if (m && i + 1 < lines.length && !/^([A-Za-zÀ-ÿ][^:\n]{1,34}):\s/.test(lines[i + 1]) || m && i + 1 < lines.length && lines[i + 1].length > 40) { out.push(dxClean(m[1]) + ': ' + lines[i + 1]); i++; }
    else { const k = dxLabel(l); out.push(k ? dxClean(k[1]) + ': ' + k[2] : l); }
  }
  return out;
}
const DX_HL = /^(Hook|CTA|Big Idea|Promessa|Objetivo|Ângulo)\b/i;
const dxEsc = s => s.replace(/[\\()]/g, m => '\\' + m);
/* docs: [{label, title, text, status, approvedAt}] → Uint8Array do PDF. meta: {project, resp, title} */
function dxPdf(docs, meta) {
  const W = 595.28, H = 841.89, ML = 48, MR = 48, TOP = 92, BOT = 54, CW = W - ML - MR, pages = [];
  let ops, y, cur = null;
  const newPage = () => {
    ops = []; pages.push({ops, doc: cur}); y = TOP;
    const fr = (t, x, yy, sz, b) => ops.push(`BT /${b ? 'F2' : 'F1'} ${sz} Tf ${x.toFixed(2)} ${(H - yy).toFixed(2)} Td (${dxEsc(dxLatin(t))}) Tj ET`);
    fr('Projeto: ' + (meta.project || ''), ML, 42, 10, true);
    const l2 = [`Responsável: ${meta.resp || '—'}`, cur && cur.label, cur && DX_STATUS_LINE(cur)].filter(Boolean).join('   ·   ');
    fr(l2, ML, 56, 9, false); fr(cur && cur.title ? cur.title : meta.title || '', ML, 69, 9, false);
    ops.push(`0.6 G 0.6 w ${ML} ${(H - 78).toFixed(2)} m ${(W - MR).toFixed(2)} ${(H - 78).toFixed(2)} l S 0 G`);
  };
  const need = h => { if (y + h > H - BOT) newPage(); };
  const text = (t, x, yy, sz, bold, gray) => ops.push(`${gray ? '0.35 g ' : ''}BT /${bold ? 'F2' : 'F1'} ${sz} Tf ${x.toFixed(2)} ${(H - yy).toFixed(2)} Td (${dxEsc(dxLatin(t))}) Tj ET${gray ? ' 0 g' : ''}`);
  const para = (t, size, bold, gap, indent) => { const lh = size * 1.5; for (const ln of dxWrap(t, size, bold, CW - (indent || 0))) { need(lh); y += lh; text(ln, ML + (indent || 0), y - size * 0.3, size, bold); } y += gap || 0; };
  /* linha "Rótulo: texto" → rótulo em negrito; destaque = fundo sombreado e barra lateral */
  const labelPara = (lab, val, size, hl) => {
    const lh = size * 1.55, pad = hl ? 5 : 0, lw = dxWidth(lab + ': ', size, true), inner = CW - 2 * pad;
    const first = dxWrap(val, size, false, inner - lw)[0] || '', rest = val.slice(first.length).trim(), lines = rest ? dxWrap(rest, size, false, inner) : [], n = 1 + lines.length, h = n * lh + 2 * pad;
    need(h + 2); const top = y;
    if (hl) ops.push(`1 0.95 0.72 rg ${ML} ${(H - top - h).toFixed(2)} ${CW.toFixed(2)} ${h.toFixed(2)} re f 0.85 0.55 0 rg ${ML} ${(H - top - h).toFixed(2)} 2.4 ${h.toFixed(2)} re f 0 g`);
    y += pad + lh; text(lab + ':', ML + pad + (hl ? 3 : 0), y - size * 0.3, size, true); text(first, ML + pad + (hl ? 3 : 0) + lw, y - size * 0.3, size, false);
    lines.forEach(l => { y += lh; text(l, ML + pad + (hl ? 3 : 0), y - size * 0.3, size, false); }); y += pad + (hl ? 4 : 1);
  };
  docs.forEach((d, di) => {
    cur = d; if (di === 0) newPage(); else { newPage(); }
    for (const b of dxBlocks(d.text)) {
      if (b.t === 'h1') { y += 4; para(b.text, 16, true, 8); }
      else if (b.t === 'h2') { y += 6; need(30); para(b.text, 11.5, true, 3); }
      else if (b.t === 'p') { const term = d.label === 'Glossário' && b.lines.length >= 2 && b.lines[0].length <= 40; (term ? b.lines : dxLines(b.lines)).forEach((l, li) => { const m = !term && dxLabel(l); if (m) labelPara(m[1], m[2], 10, DX_HL.test(m[1])); else para(l, 10, term && li === 0, 2); }); y += 7; }
      else if (b.t === 'hr') { need(14); y += 7; ops.push(`0.75 G 0.4 w ${ML} ${(H - y).toFixed(2)} m ${(W - MR).toFixed(2)} ${(H - y).toFixed(2)} l S 0 G`); y += 7; }
      else if (b.t === 'table' && b.rows.length) {
        const n = Math.max(...b.rows.map(r => r.length)), size = 7.8, pad = 3, lh = size * 1.3;
        /* largura mínima de cada coluna = a maior palavra (para não quebrar no meio); o resto da largura vai pelo tamanho do texto */
        const minW = Array.from({length: n}, (_, c) => Math.max(...b.rows.map((r, ri) => Math.max(0, ...String(r[c] || '').split(/\s+/).map(wd => dxWidth(wd, size, ri === 0))))) + 2 * pad + 2), want = Array.from({length: n}, (_, c) => Math.max(...b.rows.map(r => Math.min(String(r[c] || '').length, 42))) + 6);
        const sumMin = minW.reduce((a, x) => a + x, 0), free = Math.max(0, CW - sumMin), wsum = want.reduce((a, x) => a + x, 0), cws = minW.map((m, c) => sumMin > CW ? m * CW / sumMin : m + free * want[c] / wsum);
        const drawRow = (row, head) => {
          const cells = cws.map((w, c) => dxWrap(String(row[c] || ''), size, head, w - 2 * pad)), h = Math.max(...cells.map(x => x.length)) * lh + 2 * pad;
          if (y + h > H - BOT) { newPage(); if (!head && b.rows.length > 1) drawRow(b.rows[0], true); }
          let x = ML; if (head) ops.push(`0.92 g ${ML} ${(H - y - h).toFixed(2)} ${CW.toFixed(2)} ${h.toFixed(2)} re f 0 g`);
          cells.forEach((ls, c) => { ops.push(`0.6 G 0.4 w ${x.toFixed(2)} ${(H - y - h).toFixed(2)} ${cws[c].toFixed(2)} ${h.toFixed(2)} re S 0 G`); ls.forEach((ln, k) => text(ln, x + pad, y + pad + (k + 1) * lh - size * 0.3, size, head)); x += cws[c]; });
          y += h;
        };
        y += 3; b.rows.forEach((r, ri) => drawRow(r, ri === 0)); y += 8;
      }
    }
  });
  const N = pages.length; pages.forEach((pg, i) => { pg.ops.push(`BT /F1 8 Tf ${(W / 2 - 80).toFixed(2)} 28 Td (${dxEsc(dxLatin(`Ampliação Studio  ·  página ${i + 1} de ${N}`))}) Tj ET`); });
  /* objetos */
  const objs = []; const add = s => { objs.push(s); return objs.length; };
  add('<< /Type /Catalog /Pages 2 0 R >>'); add('PAGES'); add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'); add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  add(`<< /Title (${dxEsc(dxLatin(meta.title || 'Roteiro'))}) /Author (${dxEsc(dxLatin(meta.resp || ''))}) /Subject (${dxEsc(dxLatin('Projeto: ' + (meta.project || '')))}) /Producer (Ampliacao Studio) >>`);
  const kids = [];
  pages.forEach(pg => { const body = pg.ops.join('\n'), c = add(`<< /Length ${body.length} >>\nstream\n${body}\nendstream`), p = add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${c} 0 R >>`); kids.push(p + ' 0 R'); });
  objs[1] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${N} >>`;
  let out = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'; const off = [];
  objs.forEach((o, i) => { off.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xr = out.length; out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + off.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R /Info 5 0 R >>\nstartxref\n${xr}\n%%EOF`;
  const u = new Uint8Array(out.length); for (let i = 0; i < out.length; i++) u[i] = out.charCodeAt(i) & 255; return u;
}

/* ---------- DOCX ---------- */
const dxX = s => String(s).replace(/[&<>"]/g, m => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[m])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
const dxRun = (t, o) => `<w:r>${o ? `<w:rPr>${o.b ? '<w:b/>' : ''}${o.sz ? `<w:sz w:val="${o.sz}"/>` : ''}${o.color ? `<w:color w:val="${o.color}"/>` : ''}</w:rPr>` : ''}<w:t xml:space="preserve">${dxX(t)}</w:t></w:r>`;
function dxDocx(docs, meta) {
  const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
  let body = '';
  docs.forEach((d, di) => {
    if (di > 0) body += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
    if (docs.length > 1 || d.label) body += `<w:p><w:pPr><w:pStyle w:val="Rotulo"/></w:pPr>${dxRun([d.label, DX_STATUS_LINE(d)].filter(Boolean).join('  ·  '), {sz: 18, color: '666666'})}</w:p>`;
    for (const b of dxBlocks(d.text)) {
      if (b.t === 'h1') body += `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr>${dxRun(b.text)}</w:p>`;
      else if (b.t === 'h2') body += `<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr>${dxRun(b.text)}</w:p>`;
      else if (b.t === 'p') { const term = d.label === 'Glossário' && b.lines.length >= 2 && b.lines[0].length <= 40; (term ? b.lines : dxLines(b.lines)).forEach(l => { const m = !term && dxLabel(l), hl = m && DX_HL.test(m[1]); body += `<w:p><w:pPr>${hl ? '<w:pBdr><w:left w:val="single" w:sz="18" w:space="6" w:color="D98C00"/></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="FFF2B8"/>' : ''}<w:spacing w:after="${hl ? 80 : 60}" w:line="${hl ? 336 : 324}" w:lineRule="auto"/></w:pPr>${m ? dxRun(m[1] + ': ', {b: 1}) + dxRun(m[2]) : dxRun(l, term && l === b.lines[0] ? {b: 1} : null)}</w:p>`; }); }
      else if (b.t === 'hr') body += '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr></w:p>';
      else if (b.t === 'table' && b.rows.length) {
        const n = Math.max(...b.rows.map(r => r.length)), wt = Array.from({length: n}, (_, c) => Math.max(...b.rows.map(r => Math.min(String(r[c] || '').length, 42))) + 6), tot = wt.reduce((a, x) => a + x, 0), tw = 9638, cw = wt.map(x => Math.max(560, Math.round(x / tot * tw)));
        const bd = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(k => `<w:${k} w:val="single" w:sz="4" w:space="0" w:color="999999"/>`).join('');
        body += `<w:tbl><w:tblPr><w:tblW w:w="${tw}" w:type="dxa"/><w:tblBorders>${bd}</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="70" w:type="dxa"/><w:right w:w="70" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${cw.map(x => `<w:gridCol w:w="${x}"/>`).join('')}</w:tblGrid>` +
          b.rows.map((r, ri) => `<w:tr>${ri === 0 ? '<w:trPr><w:tblHeader/></w:trPr>' : '<w:trPr><w:cantSplit/></w:trPr>'}${cw.map((w, c) => `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${ri === 0 ? '<w:shd w:val="clear" w:color="auto" w:fill="EEEEEE"/>' : ''}</w:tcPr><w:p><w:pPr><w:spacing w:before="20" w:after="20"/></w:pPr>${dxRun(String(r[c] || ''), {sz: 16, b: ri === 0})}</w:p></w:tc>`).join('')}</w:tr>`).join('') + '</w:tbl><w:p/>';
      }
    }
  });
  const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${W}><w:body>${body}<w:sectPr><w:headerReference w:type="default" r:id="rId2"/><w:footerReference w:type="default" r:id="rId3"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1700" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  const l2 = [`Responsável: ${meta.resp || '—'}`, docs.length === 1 && docs[0].label, docs.length === 1 && DX_STATUS_LINE(docs[0]), docs.length > 1 && meta.title].filter(Boolean).join('   ·   ');
  const hdr = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr ${W}><w:p>${dxRun('Projeto: ' + (meta.project || ''), {b: 1, sz: 20})}</w:p><w:p>${dxRun(l2, {sz: 18})}</w:p><w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="999999"/></w:pBdr></w:pPr>${dxRun(docs.length === 1 ? (docs[0].title || meta.title || '') : '', {sz: 18, color: '666666'})}</w:p></w:hdr>`;
  const ftr = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr ${W}><w:p><w:pPr><w:jc w:val="center"/></w:pPr>${dxRun('Ampliação Studio  ·  página ', {sz: 16})}<w:r><w:rPr><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:sz w:val="16"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:rPr><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r>${dxRun('1', {sz: 16})}<w:r><w:rPr><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>`;
  const sty = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles ${W}><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="20"/><w:lang w:val="pt-BR"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="100" w:line="312" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="120" w:after="160"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="200" w:after="60"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="23"/></w:rPr></w:style><w:style w:type="paragraph" w:customStyle="1" w:styleId="Rotulo"><w:name w:val="Rotulo"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="40"/></w:pPr></w:style></w:styles>`;
  const ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>';
  const rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>';
  const drels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>';
  const core = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${dxX(meta.title || 'Roteiro')}</dc:title><dc:creator>${dxX(meta.resp || '')}</dc:creator><dc:subject>${dxX('Projeto: ' + (meta.project || ''))}</dc:subject></cp:coreProperties>`;
  const enc = new TextEncoder(), f = (name, s) => ({name, data: enc.encode(s)});
  return makeZip([f('[Content_Types].xml', ct), f('_rels/.rels', rels), f('word/document.xml', doc), f('word/_rels/document.xml.rels', drels), f('word/styles.xml', sty), f('word/header1.xml', hdr), f('word/footer1.xml', ftr), f('docProps/core.xml', core)]);
}
