/* Inicialização */
document.querySelectorAll('[data-page]').forEach(b => b.addEventListener('click', () => go(b.dataset.page)));
document.querySelectorAll('#projectNav button').forEach(b => b.addEventListener('click', () => { ui.tab = b.dataset.tab; renderProjectTab(); }));
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeOverlay(); } });

(async function init() {
  loadState();
  bootRender();
  await loadStatus();
  /* com senha ativa e sem login, a porta de entrada é a página de entrada (landing + login) */
  if (API.available && API.status && API.status.auth && API.status.auth.required && !API.status.auth.loggedIn && /^https?:/.test(location.protocol)) { location.replace(API.status.wp ? 'entrar.php' : 'entrar.html'); return; }
  if (canSync()) await pullWorkspace();
  refreshCurrentView();
  if (location.hash === '#projetos') go('projects');
})();
