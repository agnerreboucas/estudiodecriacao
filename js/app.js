/* Inicialização */
document.querySelectorAll('[data-page]').forEach(b => b.addEventListener('click', () => go(b.dataset.page)));
document.querySelectorAll('#projectNav button').forEach(b => b.addEventListener('click', () => { ui.tab = b.dataset.tab; renderProjectTab(); }));
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeOverlay(); } });

(async function init() {
  loadState();
  bootRender();
  await loadStatus();
  if (canSync()) await pullWorkspace();
  refreshCurrentView();
})();
