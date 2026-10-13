/* ===== Mesa de páginas · Referências =====
   Layouts que a pessoa admira, guardados no projeto (p.mesa.refs): nome, link, imagem opcional e anotações.
   Servem só para estudar a estrutura (ordem das seções, ritmo, hierarquia). Nunca copie textos, logos nem fotos. */
const MZ_REFF = {id: '', name: '', url: '', notes: '', imgId: ''};
function mzRefsHtml(ok) {
  ok = ok || (() => true); const m = mzM(), f = MZ_REFF, list = (m.refs || []).filter(r => ok(r.name + ' ' + r.notes + ' ' + r.url));
  return `<p class="mz-hint">Guarde aqui sites e páginas que você admira, <b>só para estudar a estrutura</b> (ordem das seções, ritmo, hierarquia). Não copie textos, logos nem fotos deles.</p>
    <div class="mz-refform"><h4>${f.id ? 'Editar referência' : 'Nova referência'}</h4>
      <label class="mz-f"><span>Nome</span><input id="mzRfName" value="${esc(f.name)}" placeholder="ex.: Página de curso do concorrente" oninput="MZ_REFF.name=this.value"></label>
      <label class="mz-f"><span>Link</span><input id="mzRfUrl" value="${esc(f.url)}" placeholder="https://…" oninput="MZ_REFF.url=this.value"></label>
      <div class="mz-f"><span>Imagem (print, opcional)</span><div class="mz-imgsel">${f.imgId ? `<img data-lib="${esc(f.imgId)}" alt="">` : '<em>sem imagem</em>'}<button class="btn sm" onclick="mzRefPickImg()">${f.imgId ? 'Trocar' : 'Escolher / enviar'}</button>${f.imgId ? '<button class="btn sm" onclick="MZ_REFF.imgId=\'\';mzRefreshLeft()">Remover</button>' : ''}</div></div>
      <label class="mz-f"><span>Anotações (o que vale estudar)</span><textarea id="mzRfNotes" rows="4" placeholder="ex.: hero curto, prova social logo depois, oferta só no fim…" oninput="MZ_REFF.notes=this.value">${esc(f.notes)}</textarea></label>
      <div class="row-gap"><button class="btn dark sm" onclick="mzRefSave()">${f.id ? 'Salvar alterações' : 'Guardar referência'}</button>${f.id ? '<button class="btn sm" onclick="mzRefNew()">Cancelar</button>' : ''}</div></div>
    <h4>Minhas referências (${(m.refs || []).length})</h4>
    ${list.length ? `<div class="mz-refs">${list.map(r => `<div class="mz-refc" data-ref="${r.id}"><div class="th" onclick="mzRefView('${r.id}')" title="Abrir para estudar">${r.imgId ? `<img data-lib="${esc(r.imgId)}" alt="">` : '<em>sem imagem</em>'}</div><div class="bd"><b>${esc(r.name)}</b>${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 38))}</a>` : ''}${r.notes ? `<p>${esc(r.notes.slice(0, 120))}${r.notes.length > 120 ? '…' : ''}</p>` : ''}<div class="ac"><button class="mz-mini" onclick="mzRefView('${r.id}')">Estudar</button><button class="mz-mini" onclick="mzRefEdit('${r.id}')">Editar</button><button class="mz-mini" onclick="mzRefDel('${r.id}')">Excluir</button></div></div></div>`).join('')}</div>` : '<p class="mz-hint">Nenhuma referência ainda.</p>'}`;
}
function mzRefNew() { Object.assign(MZ_REFF, {id: '', name: '', url: '', notes: '', imgId: ''}); mzRefreshLeft(); }
function mzRefEdit(id) { const r = (mzM().refs || []).find(x => x.id === id); if (!r) return; Object.assign(MZ_REFF, {id: r.id, name: r.name, url: r.url, notes: r.notes, imgId: r.imgId}); mzLeftTab('refs'); }
function mzRefPickImg() { libPick(r => { const li = libItem(r); MZ_REFF.imgId = li ? li.imgId : r; mzRefreshLeft(); }, {raw: true, title: 'Imagem da referência'}); }
function mzRefSave() {
  const m = mzM(), f = MZ_REFF, url = String(f.url || '').trim(); if (url && !/^https?:\/\//i.test(url)) { toast('O link precisa começar com http:// ou https://'); return; }
  const r = mzNormRef({id: f.id || mzId(), name: f.name, url, notes: f.notes, imgId: f.imgId, ts: new Date().toISOString()}); if (!r) { toast('Dê um nome ou cole um link.'); return; }
  if (f.id) { const i = m.refs.findIndex(x => x.id === f.id); if (i >= 0) m.refs[i] = r; else m.refs.unshift(r); } else { if (m.refs.length >= 60) { toast('Limite de 60 referências.'); return; } m.refs.unshift(r); }
  Object.assign(MZ_REFF, {id: '', name: '', url: '', notes: '', imgId: ''}); mzTouch(); mzRefreshLeft(); toast('Referência guardada no projeto.');
}
function mzRefDel(id) { const m = mzM(), r = m.refs.find(x => x.id === id); if (!r || !confirm('Excluir a referência “' + r.name + '”?')) return; m.refs = m.refs.filter(x => x.id !== id); if (MZ_REFF.id === id) mzRefNew(); mzTouch(); mzRefreshLeft(); }
function mzRefView(id) {
  const r = (mzM().refs || []).find(x => x.id === id); if (!r) return;
  mzModal('Referência: ' + esc(r.name), `<p class="mz-hint" style="margin-top:0">Estude a estrutura: ordem das seções, o que vem primeiro, onde ficam provas e chamadas. Não copie textos, logos nem fotos.</p>${r.imgId ? `<div class="mz-refbig"><img data-lib="${esc(r.imgId)}" alt=""></div>` : ''}${r.url ? `<p><a class="btn sm" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">Abrir o site ↗</a> <small class="muted">${esc(r.url)}</small></p>` : ''}${r.notes ? `<h4>Anotações</h4><p style="white-space:pre-wrap">${esc(r.notes)}</p>` : '<p class="muted">Sem anotações.</p>'}<div class="row-gap"><button class="btn sm" onclick="mzModalClose();mzRefEdit('${r.id}')">Editar</button></div>`, {wide: true});
  const box = document.getElementById('mzModal'); if (box && typeof libFill === 'function') libFill(box);
}
