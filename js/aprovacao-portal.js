/* ===== Portal de aprovação dentro do Studio (sem iframe) =====
   Monta o próprio aprovacao.html (o mesmo que o cliente abre) numa "raiz sombra": o CSS dele fica isolado e o código roda
   com document/window/location substituídos por versões que só enxergam essa raiz. Quando o aprovacao.html muda, o Studio muda junto. */
const apv = {unmount: null, src: ''};
async function apvSource() {
  if (apv.src) return apv.src; if (window.APROVACAO_HTML) return (apv.src = window.APROVACAO_HTML);
  const r = await fetch('aprovacao.html'); if (!r.ok) throw new Error('Não achei aprovacao.html neste servidor.'); return (apv.src = await r.text());
}
function apvCss(css) {
  return css.replace(/:root:not\(\[data-theme="light"\]\)/g, ':host(:not([data-theme="light"]))').replace(/:root\[data-theme="(\w+)"\]/g, ':host([data-theme="$1"])').replace(/:root\b/g, ':host').replace(/(^|\})\s*body\s*\{/g, '$1 .apv-body {');
}
/* cfg: {rest, token} (peças já enviadas) ou {items} (peças locais), mais brand, handle, project, subtitle, agency */
async function apvMount(host, cfg) {
  if (apv.unmount) { try { apv.unmount(); } catch (e) { /* já desmontado */ } apv.unmount = null; }
  const src = await apvSource(), doc = new DOMParser().parseFromString(src, 'text/html');
  const css = [...doc.querySelectorAll('style')].map(s => s.textContent).sort((a, b) => b.length - a.length)[0] || '', code = [...doc.querySelectorAll('script')].map(s => s.textContent).sort((a, b) => b.length - a.length)[0] || '';
  if (!css || !code) throw new Error('aprovacao.html fora do formato esperado.');
  if (!document.getElementById('apvFonts')) { const l = document.createElement('link'); l.id = 'apvFonts'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap'; document.head.appendChild(l); }
  host.innerHTML = ''; host.setAttribute('data-theme', 'light'); const sh = host.shadowRoot || host.attachShadow({mode: 'open'});
  const part = s => { const e = doc.querySelector(s); return e ? e.outerHTML : ''; };
  sh.innerHTML = '<style>' + apvCss(css) + ' .apv-body{min-height:60vh;padding-block:0 40px;border-radius:14px} .top{margin-bottom:20px} .top .brand{order:1} .top .top-r{order:2;margin-left:auto} .top .nav{order:3;flex:0 0 100%;min-width:0;flex-wrap:wrap;overflow-x:visible;row-gap:6px} .submit{display:none!important}</style><div class="apv-body">' + part('.wrap') + part('#gatehost') + part('#toast') + '</div>';
  const ids = [], real = window, loc = {hash: '', search: ''};
  const D = new Proxy(document, {get(t, k) {
    if (k === 'querySelector') return s => sh.querySelector(s); if (k === 'querySelectorAll') return s => sh.querySelectorAll(s); if (k === 'getElementById') return i => sh.getElementById(i);
    if (k === 'addEventListener') return (type, fn, o) => (type === 'visibilitychange' ? t : sh).addEventListener(type, fn, o); if (k === 'removeEventListener') return (type, fn, o) => (type === 'visibilitychange' ? t : sh).removeEventListener(type, fn, o);
    if (k === 'activeElement') return sh.activeElement; const v = t[k]; return typeof v === 'function' ? v.bind(t) : v;
  }, set(t, k, v) { if (k === 'title') return true; t[k] = v; return true; }});
  const W = new Proxy(window, {get(t, k) {
    if (k === 'AMPLIACAO_APROVACAO') return cfg; if (k === 'claude') return undefined; if (k === 'location') return loc; if (k === 'document') return D;
    if (k === 'scrollTo') return () => { const y = host.getBoundingClientRect().top + real.scrollY - 60; real.scrollTo(0, Math.max(0, y)); };
    if (k === 'setInterval') return (...a) => { const i = real.setInterval(...a); ids.push(i); return i; };
    const v = t[k]; return typeof v === 'function' ? v.bind(t) : v;
  }, set(t, k, v) { t[k] = v; return true; }});
  new Function('document', 'window', 'location', code)(D, W, loc);
  apv.unmount = () => { ids.forEach(i => clearInterval(i)); sh.innerHTML = ''; };
  return sh;
}
