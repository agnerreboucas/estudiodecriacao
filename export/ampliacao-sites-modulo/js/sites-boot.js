/* Ajustes do módulo de Sites (carregado depois dos arquivos do Studio, antes do app.js) */
/* projeto novo: formulário simples no lugar do assistente completo do Studio */
function openWizard(name) {
  showModal('Novo projeto', `<div class="form-grid"><div class="field"><label>Nome do projeto / cliente</label><input id="npName" value="${esc(name || '')}" placeholder="Ex.: Escritório Silva Advocacia"></div>
    <div class="field"><label>Categoria</label><input id="npCat" placeholder="Ex.: Advocacia, Odontologia, Curso online"></div>
    <div class="field full"><label>Objetivo do site</label><input id="npGoal" placeholder="Ex.: Gerar contatos pelo WhatsApp"></div></div>
    <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="createProject();go('briefing')">Criar projeto</button></div>`);
  setTimeout(() => $('npName') && $('npName').focus(), 50);
}
function openProject(id) { setActiveProject(id); if (typeof updateContextUI === 'function') updateContextUI(); if (typeof esOpen === 'function') esOpen(id); else go('landings'); }
ui.page = 'home';
/* cores e fontes da marca para novas páginas (no Studio completo isso vem da galeria de modelos de layout) */
function lyStyles(p) { const b = brandOf(p), out = []; if (typeof isHex === 'function' && isHex(b.pal.c60)) out.push({id: 'kit', name: 'Kit de marca', tk: brandTokens(p)}); return out.length ? out : [{id: 'kit', name: 'Kit de marca', tk: brandTokens(p)}]; }
