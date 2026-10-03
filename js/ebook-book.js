/* ===== O e-book como um só lugar: Conteúdo (motor) → Capa → Miolo (diagramação) → Versões → Áudio → Publicar ===== */
const BK_TABS = [['conteudo', '1 · Conteúdo', 'sparkles'], ['capa', '2 · Capa', 'palette'], ['miolo', '3 · Miolo', 'layout'], ['versoes', 'Versões', 'book'], ['audio', 'Áudio', 'video'], ['publicar', 'Publicar', 'send']];
function bookTab(t) { eui.bt = t; renderEditora(); }
const bookDoc = eb => (curProject().layouts || []).find(d => d.id === (eb || ebCur() || {}).dtpId);
function bookHead(eb) {
  const d = bookDoc(eb), hasCover = !!(eb.coverSetId && curProject().design.sets.some(s => s.id === eb.coverSetId)), ch = eb.sections.filter(s => s.type === 'chapter').length;
  return `<div class="bk-head"><div class="row-gap" style="flex-wrap:wrap;justify-content:space-between"><div class="row-gap"><button class="btn sm" onclick="ebBack()">← E-books</button><input class="dz-name" value="${esc(eb.name)}" onchange="ebCur().name=this.value;persist()"></div><div class="row-gap"><span class="bk-chip ${ch ? 'ok' : ''}">${ch} capítulo(s)</span><span class="bk-chip ${hasCover ? 'ok' : ''}">${hasCover ? 'capa pronta' : 'sem capa'}</span><span class="bk-chip ${d ? 'ok' : ''}">${d ? 'miolo diagramado' : 'sem miolo'}</span><button class="btn sm" onclick="flipRead('eb',eui.id)" title="Folhear em tela cheia">📖 Folhear</button></div></div>
  <div class="edh-tabs" style="margin-top:8px">${BK_TABS.map(([k, l, ic]) => `<button class="edh-tab ${eui.bt === k ? 'on' : ''}" onclick="bookTab('${k}')">${ico(ic, 15)} ${l}</button>`).join('')}</div></div>`;
}
function bookRender(p, r) {
  const eb = ebCur(); if (!eb) { eui.id = ''; return renderEditora(); } if (!BK_TABS.some(t => t[0] === eui.bt)) eui.bt = 'conteudo';
  r.innerHTML = bookHead(eb) + '<div id="bookBody"></div>'; const b = $('bookBody');
  ({conteudo: () => motRender(b, p), capa: () => covRender(b, p), miolo: () => bookMiolo(b, eb), versoes: () => ebEditor(p, b), audio: () => (typeof audRender === 'function' ? audRender(b, eb) : (b.innerHTML = '<p class="muted">Áudio indisponível.</p>')), publicar: () => kdpRender(b, p)})[eui.bt]();
}
/* abre o e-book na aba pedida (ou cria um, se não houver nenhum) */
function bookGoTab(tab) { const L = ebList(); edh.area = 'livros'; if (!L.length) { go('editora'); ebNewOpen(); return; } if (L.length === 1 || eui.id) { if (!eui.id) ebOpen(L[0].id); eui.bt = tab; go('editora'); return; } eui.id = ''; go('editora'); toast('Abra um e-book para ir direto a essa etapa.'); }
function bookNew(name, author, preset) { const eb = ebNew(preset || 'blank', name || 'Novo e-book', author || ''); ebList().push(eb); persist(); return eb; }

/* ---------- texto do e-book ⇄ marcação (a mesma da Editora) ---------- */
function ebToMarkup(eb) {
  const out = []; eb.sections.forEach(s => {
    if (!['chapter', 'text'].includes(s.type)) return; const L = ['# ' + (s.title || 'Capítulo')]; if (s.subtitle) L.push('## ' + s.subtitle);
    (s.blocks || []).forEach(b => {
      if (b.t === 'p') L.push('', b.text); else if (b.t === 'h2') L.push('', '## ' + b.text);
      else if (b.t === 'box') L.push('', `> ${({case: 'caso', tip: 'dica', warn: 'atencao', know: 'sabia', care: 'cuide', note: 'nota'})[b.kind] || 'nota'}: ${b.text}`);
      else if (b.t === 'list') L.push('', ...(b.items || []).map((it, i) => (b.ordered ? (i + 1) + '. ' : '- ') + it));
      else if (b.t === 'check') L.push('', ...(b.items || []).map(it => '[ ] ' + it)); else if (b.t === 'summary') L.push('', ...(b.items || []).map(it => '[v] ' + it));
      else if (b.t === 'cols2') L.push('', ...(b.left || []).map(it => '@comuns: ' + it), ...(b.right || []).map(it => '@faca: ' + it));
    }); out.push(L.join('\n'));
  }); return out.join('\n\n');
}
/* aplica um texto marcado (# capítulo, ## subtítulo, > dica: …) na estrutura do e-book; mantém título, sumário e seções de texto */
function bookApplyText(eb, text, opt) {
  opt = opt || {}; const secs = ebImport(text, eb); if (!secs.length) { toast('Não encontrei capítulos. Use # no título de cada capítulo.'); return 0; }
  eb.sections = eb.sections.filter(s => s.type !== 'chapter'); let n = 0; secs.forEach(s => { n++; s.label = 'CAPÍTULO ' + ebPad2(n); });
  const at = eb.sections.findIndex(x => x.type === 'text' && /plano|conclus/i.test(x.title)); if (at >= 0) eb.sections.splice(at, 0, ...secs); else eb.sections.push(...secs);
  const M = motM(); if (M && M.title) eb.title = M.title; if (M && M.subtitle) eb.subtitle = M.subtitle; if (M && M.author) eb.author = M.author; eui.cache = {}; persist(); return secs.length;
}
/* miolo: cria o documento da Diagramação ligado a este e-book */
function bookEnsureMiolo(eb, preset, styleId) {
  let d = bookDoc(eb); if (d) return d; d = dtpNew(preset || 'kdp6x9', 'Miolo · ' + (eb.title || eb.name)); d.styles.list = Object.assign({}, d.styles.body, {n: 'Lista', indent: 0, align: 'left', after: 3});
  if (typeof dtpApplyStyle === 'function') dtpApplyStyle(d, styleId || 'classico', eb.brand); d.run.header = ''; d.run.folio = true; eb.dtpId = d.id; (curProject().layouts = curProject().layouts || []).push(d); persist(); return d;
}
function bookSyncMiolo(eb, quiet) {
  const d = bookDoc(eb); if (!d) return; const text = ebToMarkup(eb); if (!text.trim()) { if (!quiet) toast('O e-book ainda não tem capítulos. Gere o conteúdo primeiro.'); return; }
  if (d.story.some(s => s.k === 'img') && !quiet && !confirm('O texto do miolo será refeito a partir do e-book. As imagens que estavam no meio do texto saem do fluxo (os quadros soltos ficam). Continuar?')) return;
  d.story = motToStory(text); if (!d.styles.list) d.styles.list = Object.assign({}, d.styles.body, {n: 'Lista', indent: 0, align: 'left', after: 3}); persist(); if (!quiet) toast('Miolo atualizado com o texto do e-book.');
}
function bookMioloOpen() { const eb = ebCur(), d = bookDoc(eb); if (!d) return; dui.fromBook = eb.id; edh.area = 'diag'; go('diagram'); dtpOpen(d.id); }
function bookMioloCreate() {
  const eb = ebCur(), pre = ($('bkPre') || {}).value || 'kdp6x9', sty = ($('bkSty') || {}).value || 'classico'; const d = bookEnsureMiolo(eb, pre, sty); bookSyncMiolo(eb, true);
  if (eb.coverSetId && !d.front) bookCoverToMiolo(true); persist(); toast('Miolo criado e diagramado com o texto do e-book.'); renderEditora();
}
async function bookCoverToMiolo(quiet) {
  const eb = ebCur(), d = bookDoc(eb), p = curProject(); if (!d || !eb.coverSetId) { if (!quiet) toast('Crie a capa e o miolo primeiro.'); return; }
  try { const r = await covRenderSetBlob(eb.coverSetId, 2000, 'image/jpeg', 0.92), imgId = uid('img'); await imgPut(imgId, r.blob); d.pages.unshift({items: [{id: uid('fr'), k: 'img', x: -d.bleed, y: -d.bleed, w: d.page.w + 2 * d.bleed, h: d.page.h + 2 * d.bleed, wrap: 'none', off: 0, imgId, zoom: 1, ar: r.W / r.H, fill: '', stroke: '', sw: 1, op: 1, px: 0, py: 0, text: '', st: 'body', pad: 4}]}); d.front = (d.front | 0) + 1; d.nPages = Math.max(d.nPages, d.front + 1); persist(); if (!quiet) { toast('Capa inserida como página 1 do miolo.'); renderEditora(); } } catch (e) { toast('Falhou: ' + e.message); }
}
function bookMioloFormat(id) { const eb = ebCur(), d = bookDoc(eb), P = DTP_PRESETS.find(x => x.id === id); if (!d || !P || !confirm('Trocar o formato do miolo para “' + P.n + '”? Tamanho, margens e sangria mudam (o texto é mantido).')) { renderEditora(); return; } d.page = {w: dtpMM(P.w), h: dtpMM(P.h)}; d.margins = {t: dtpMM(P.m.t), b: dtpMM(P.m.b), i: dtpMM(P.m.i), o: dtpMM(P.m.o)}; d.cols = P.cols; d.facing = P.facing; d.bleed = dtpMM(P.bleed); persist(); renderEditora(); }
function bookMiolo(r, eb) {
  const d = bookDoc(eb), pres = DTP_PRESETS.filter(x => x.id !== 'custom' && x.id !== 'flyer'), opts = sel => pres.map(x => `<option value="${x.id}" ${x.id === sel ? 'selected' : ''}>${esc(x.n)}</option>`).join(''), styles = typeof DTP_STYLES !== 'undefined' ? DTP_STYLES : [];
  if (!d) { r.innerHTML = `<div class="mot-wrap"><div><div class="mot-ch"><b>Criar o miolo diagramado</b><p class="muted" style="font-size:12.5px">O miolo é o interior do livro: texto em colunas, margens, sangria, imagens e modelos de página, como no InDesign. O texto vem do conteúdo do e-book (${eb.sections.filter(s => s.type === 'chapter').length} capítulo(s)).</p>
    <div class="form-grid"><div class="field"><label>Formato</label><select id="bkPre">${opts('kdp6x9')}</select></div><div class="field"><label>Estilo do miolo</label><select id="bkSty">${styles.map(s => `<option value="${s.id}">${esc(s.n)}</option>`).join('')}</select></div></div>
    <div class="row-gap"><button class="btn dark" onclick="bookMioloCreate()">Criar e diagramar o miolo</button></div><small class="muted block" style="margin-top:6px">${eb.sections.some(s => s.type === 'chapter') ? '' : 'Dica: gere ou cole o conteúdo na aba 1 · Conteúdo antes; o miolo nasce já com o texto.'}</small></div></div></div>`; return; }
  const f = dtpFlow(d), n = dtpPageCount(d, f);
  r.innerHTML = `<div class="mot-wrap"><div><div class="mot-ch"><b>Miolo · ${esc(d.name)}</b><p style="font-size:13px;margin:6px 0">${dtpFmt(d.page.w, d.unit)} × ${dtpFmt(d.page.h, d.unit)} ${DTP_UL[d.unit]} · ${n} página(s) · ${d.cols} coluna(s)${d.facing ? ' · páginas opostas' : ''} · sangria ${dtpFmt(d.bleed, d.unit)} ${DTP_UL[d.unit]}${f.overset ? ' · <b style="color:#dc2626">texto em estouro</b>' : ''}</p>
    <div class="row-gap" style="flex-wrap:wrap"><button class="btn dark" onclick="bookMioloOpen()">Abrir o editor do miolo</button><button class="btn" onclick="bookSyncMiolo(ebCur())">↻ Atualizar o texto a partir do e-book</button><button class="btn" onclick="bookCoverToMiolo()" ${eb.coverSetId ? '' : 'disabled'} title="${eb.coverSetId ? '' : 'Crie a capa primeiro'}">Inserir a capa como página 1</button><button class="btn" onclick="flipRead('dtp','${d.id}')">📖 Folhear</button></div></div>
    <div class="mot-ch"><b>Formato do livro</b><div class="field" style="margin:6px 0"><select onchange="bookMioloFormat(this.value)"><option value="">Trocar formato…</option>${opts('')}</select></div><small class="muted">Celular, tablet e os tamanhos de livro da Amazon (KDP). Na aba Publicar você confere lombada, margens e capa completa.</small></div></div>
    <div><div class="mot-ch"><b>Como funciona</b><ol style="margin:6px 0 0 18px;padding:0;font-size:12.5px;line-height:1.6"><li>O texto vem do conteúdo (Motor) e da aba Versões.</li><li>No editor do miolo você ajusta grade, colunas, estilos, modelos de página e arrasta qualquer elemento com a mão livre.</li><li>Mudou o conteúdo? Use ↻ Atualizar: os quadros e estilos do miolo são mantidos.</li></ol></div></div></div>`;
}
