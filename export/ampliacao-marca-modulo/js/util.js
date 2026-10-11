/* Utilitários compartilhados */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = (p = 'id') => p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const pad = (n, l = 3) => String(n).padStart(l, '0');
const fmtNum = n => Number(n || 0).toLocaleString('pt-BR');
const fmtMoney = n => 'R$ ' + Number(n || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
const fmtPct = n => Number(n || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '%';
const fmtDate = iso => { try { return new Date(iso).toLocaleDateString('pt-BR'); } catch (e) { return ''; } };
const fmtDateTime = iso => { try { return new Date(iso).toLocaleString('pt-BR', {dateStyle: 'short', timeStyle: 'short'}); } catch (e) { return ''; } };
const today = () => new Date().toISOString().slice(0, 10);
const safeId = id => /^[\w-]{1,64}$/.test(String(id));

function toast(msg) {
  const t = $('toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => t.classList.remove('show'), 2600);
}
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
function keepScroll(fn) { const y = window.scrollY; fn(); window.scrollTo(0, y); }
function download(name, text, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], {type}));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
}
/* Mescla recursivamente objetos simples, preservando arrays e valores existentes */
function mergeDefaults(target, defaults) {
  if (!target || typeof target !== 'object' || Array.isArray(target)) return structuredClone(defaults);
  for (const k of Object.keys(defaults)) {
    const d = defaults[k];
    if (!(k in target) || target[k] == null) target[k] = structuredClone(d);
    else if (d && typeof d === 'object' && !Array.isArray(d)) target[k] = mergeDefaults(target[k], d);
  }
  return target;
}
/* Tag de inteligência: DADO · HIPÓTESE · RECOMENDAÇÃO · DECISÃO · SIMULAÇÃO */
function tag(kind) {
  const k = {dado: 'DADO', hipotese: 'HIPÓTESE', recomendacao: 'RECOMENDAÇÃO', decisao: 'DECISÃO', simulacao: 'SIMULAÇÃO'}[kind] || kind;
  return `<span class="itag itag-${kind}">${k}</span>`;
}
function emptyState(title, text, btn) {
  return `<div class="empty-state"><strong>${esc(title)}</strong><p>${esc(text)}</p>${btn || ''}</div>`;
}
