/* Menu sanduíche: no tablet e no celular o menu lateral vira uma gaveta (css/responsive.css).
   Aqui: abrir/fechar, rótulos com o nome de cada módulo, fechar ao escolher, no Esc e ao voltar para a tela larga. */
function railToggle(on) {
  const open = on === undefined ? !document.body.classList.contains('rail-open') : !!on;
  document.body.classList.toggle('rail-open', open);
  const b = document.getElementById('burger'); if (b) { b.setAttribute('aria-expanded', String(open)); b.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); }
}
(function () {
  const labels = () => document.querySelectorAll('#rail button[data-page]').forEach(btn => { if (!btn.querySelector('.rail-lb')) { const s = document.createElement('span'); s.className = 'rail-lb'; s.textContent = btn.getAttribute('title') || ''; btn.appendChild(s); } });
  const init = () => { labels(); document.getElementById('rail').addEventListener('click', e => { if (e.target.closest('button[data-page]')) railToggle(false); }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('rail-open')) railToggle(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 1024) railToggle(false); });
  /* o menu pode ser montado depois (ícones): garante os rótulos mesmo assim */
  setTimeout(labels, 400);
})();
