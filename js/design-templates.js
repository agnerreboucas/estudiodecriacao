/* Salvar, modelos salvos e PDF das peças/apresentações do Editor de Design */

/* ---- salvar agora (o editor também salva sozinho a cada alteração) ---- */
async function dzSaveNow() {
  const s = dzSet(); if (!s) return;
  s.updated = new Date().toISOString(); persist(); flushLocal();
  let msg = 'Salvo neste navegador.';
  if (typeof canSync === 'function' && canSync()) { try { await syncNow(false); msg = 'Salvo e sincronizado com o servidor.'; } catch (e) { msg = 'Salvo neste navegador (a sincronização falhou).'; } }
  const b = $('dzSaveBtn'); if (b) { b.textContent = '✓ Salvo'; setTimeout(() => { const c = $('dzSaveBtn'); if (c) c.textContent = 'Salvar'; }, 1800); }
  toast(msg);
}

/* ---- modelos: guardados no workspace (valem para todos os projetos) ---- */
const tplList = () => { if (!Array.isArray(state.templates)) state.templates = []; return state.templates; };
function dzSaveTemplate() {
  const s = dzSet(); if (!s) return;
  askText('Salvar como modelo', 'Nome do modelo (ex.: Apresentação escura da Ampliação)', name => {
    if (!name || !name.trim()) return;
    const slides = JSON.parse(JSON.stringify(s.slides)); slides.forEach(sl => sl.layers.forEach(l => { if (l.type === 'image' && l.role !== 'logo') l.imgId = ''; }));
    const t = {id: uid('tp'), name: name.trim().slice(0, 80), kind: s.deck ? 'deck' : 'set', format: {id: s.format.id, w: s.format.w, h: s.format.h}, tk: JSON.parse(JSON.stringify(s.tk)), slides, from: (dzP() || {}).name || '', created: new Date().toISOString()};
    tplList().push(t); persist(); flushLocal();
    toast('Modelo salvo. Fotos foram retiradas; textos e estilo ficam. Use em Modelos salvos.');
  });
}
function dzTemplateDel(id) { if (!confirm('Excluir este modelo? As peças já criadas com ele não mudam.')) return; state.templates = tplList().filter(t => t.id !== id); persist(); dzTemplatesOpen(); }

/* aplica um modelo de apresentação aos dados do projeto atual: o texto vem do Pré-Projeto (por "slot"), o visual vem do modelo */
function tplFillDeck(t, p) {
  const fresh = deckSlides(p).slides, byName = Object.fromEntries(fresh.map(s => [s.name, s])), out = [];
  t.slides.forEach(ts => {
    const sl = cloneSlide(ts); sl.name = ts.name; sl.keep = true; sl.bg = ts.bg;
    const slotted = sl.layers.some(l => l.type === 'text' && l.slot);
    if (!slotted) { out.push(sl); return; }                    // slide só do usuário: mantém
    const src = byName[ts.name]; if (!src) return;             // sem dado equivalente neste projeto: omite
    const map = {}; src.layers.forEach(l => { if (l.type === 'text' && l.slot) map[l.slot] = l.content; });
    sl.layers.forEach(l => { if (l.type === 'text' && l.slot) l.content = l.slot in map ? map[l.slot] : ''; });
    out.push(sl);
  });
  return out;
}
async function dzTemplateUse(id, openAfter) {
  const t = tplList().find(x => x.id === id), p = dzP() || preP(); if (!t || !p) return;
  try {
    const th = deckTheme(p); await ensureFonts([th.head, th.body, ...t.slides.flatMap(s => s.layers.filter(l => l.type === 'text').map(l => l.family))]); if (typeof brandFontsLoad === 'function') await brandFontsLoad(p);
    let slides, name;
    if (t.kind === 'deck') { if (!preItems(p.pre).length) { toast('Selecione ao menos um desafio no Pré-Projeto para preencher o modelo.'); return; } slides = tplFillDeck(t, p); name = 'Apresentação · ' + p.name + ' (' + t.name + ')'; }
    else { slides = t.slides.map(s => cloneSlide(s)); name = t.name + ' · ' + p.name; }
    if (!slides.length) { toast('O modelo ficou sem slides para este projeto.'); return; }
    const set = {id: uid('ds'), name, format: {id: t.format.id, w: t.format.w, h: t.format.h}, tk: JSON.parse(JSON.stringify(t.tk)), slides, created: new Date().toISOString(), updated: new Date().toISOString()};
    if (t.kind === 'deck') { set.deck = {pre: true, tpl: t.id}; p.pre.deckSetId = set.id; }
    await ensureSetResources(set); p.design.sets.push(set); persist(); closeModal(); go('design'); dzOpen(set.id);
    toast(t.kind === 'deck' ? 'Apresentação criada a partir do modelo (' + slides.length + ' slides).' : 'Peça criada a partir do modelo.');
  } catch (e) { toast('Não consegui aplicar o modelo: ' + e.message); }
}
function dzTemplatesOpen() {
  const list = tplList();
  showModal('★ Modelos salvos', list.length ? `<p class="muted" style="margin-top:0;font-size:12px">Os modelos valem para todos os projetos. Em apresentações, o texto é refeito com os dados do projeto atual e o visual (cores, fontes, posições) vem do modelo.</p><div class="tpl-list">${list.map(t => `<div class="tpl-row"><div><strong>${esc(t.name)}</strong><small class="muted block">${t.kind === 'deck' ? 'Apresentação' : 'Peça'} · ${t.slides.length} slide(s) · ${t.format.w}×${t.format.h}${t.from ? ' · de ' + esc(t.from) : ''}</small></div><div class="row-gap"><button class="btn sm dark" onclick="dzTemplateUse('${t.id}')">Usar neste projeto</button><button class="btn sm" onclick="dzTemplateDel('${t.id}')" title="Excluir modelo">${ico('trash', 14)}</button></div></div>`).join('')}</div><div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button></div>`
    : `<p class="muted" style="font-size:13px">Nenhum modelo ainda. Edite uma peça ou apresentação e use <b>★ Modelo</b> na barra do editor para guardar o estilo.</p><div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button></div>`);
}

/* ---- PDF de verdade (uma página por slide, imagem em alta qualidade) ---- */
function buildPDF(pages, pw, ph) {
  const enc = new TextEncoder(), chunks = [], offs = []; let len = 0;
  const add = x => { const b = typeof x === 'string' ? enc.encode(x) : x; chunks.push(b); len += b.length; };
  const N = 2 + 3 * pages.length, f = v => (+v).toFixed(2);
  add('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n');
  const obj = (n, head, stream) => { offs[n] = len; add(n + ' 0 obj\n' + head); if (stream) { add('\nstream\n'); add(stream); add('\nendstream'); } add('\nendobj\n'); };
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, `<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_, i) => (3 + 3 * i) + ' 0 R').join(' ')}] >>`);
  pages.forEach((pg, i) => {
    const po = 3 + 3 * i, co = po + 1, io = po + 2, content = `q ${f(pw)} 0 0 ${f(ph)} 0 0 cm /Im0 Do Q`;
    obj(po, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${f(pw)} ${f(ph)}] /Resources << /XObject << /Im0 ${io} 0 R >> >> /Contents ${co} 0 R >>`);
    obj(co, `<< /Length ${content.length} >>`, content);
    obj(io, `<< /Type /XObject /Subtype /Image /Width ${pg.w} /Height ${pg.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pg.jpeg.length} >>`, pg.jpeg);
  });
  const xpos = len; let x = 'xref\n0 ' + (N + 1) + '\n0000000000 65535 f \n';
  for (let n = 1; n <= N; n++) x += String(offs[n]).padStart(10, '0') + ' 00000 n \n';
  add(x + `trailer\n<< /Size ${N + 1} /Root 1 0 R >>\nstartxref\n${xpos}\n%%EOF\n`);
  return new Blob(chunks, {type: 'application/pdf'});
}
async function dzExportPDF() {
  const s = dzSet(); if (!s) return; toast('Gerando PDF…');
  try {
    await ensureSetResources(s); const f = s.format, W = Math.min(2400, Math.max(1200, f.w)), H = Math.round(W * f.h / f.w), pages = [];
    for (const sl of s.slides) {
      const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H);
      renderSlide(x, sl, f.w, f.h, W / f.w);
      const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', 0.92)); pages.push({jpeg: new Uint8Array(await blob.arrayBuffer()), w: W, h: H});
      await new Promise(r => setTimeout(r, 0));
    }
    const pdf = buildPDF(pages, f.w * 0.75, f.h * 0.75); download(`${slug(s.name)}.pdf`, pdf, 'application/pdf');
    toast('PDF gerado (' + pages.length + ' página' + (pages.length > 1 ? 's' : '') + '). O texto vai como imagem.');
  } catch (e) { toast('Não consegui gerar o PDF: ' + e.message); }
}
