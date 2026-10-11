/* ===== Mesa de páginas com o visual escuro do Estúdio de Sites (só no módulo; o Studio completo continua com o visual claro).
   Não troca nenhuma função da Mesa: acrescenta a classe `mz-dark` (css/mesa-dark.css), uma faixa de ferramentas à esquerda, que chama as mesmas funções
   dos botões de cima, e a aba Referências no painel da esquerda (lado a lado ou sobreposta ao desenho). ===== */
const MRF = {id: '', mode: 'over', op: 40, w: 100, q: '', on: false, url: ''};
MZ_LEFT.push(['refs', 'Referências']);
const mzsSvg = d => `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const MZS = [
  ['sel', 'Selecionar (desliga o modo livre e o desenho)', '<path d="M5 3l12 8-5.5 1.2L9 18z"/>'],
  ['free', 'Modo livre: arraste qualquer elemento (Alt+arrastar duplica)', '<path d="M12 3v18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12h18M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>'],
  ['draw', 'Desenhar com pincéis sobre a página', '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>'],
  ['ai', 'Comandos de IA no layout', '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"/>'],
  '|',
  ['lt:elements', 'Elementos', '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'],
  ['lt:blocks', 'Blocos prontos', '<rect x="3.5" y="4" width="17" height="6" rx="1.5"/><rect x="3.5" y="13" width="17" height="7" rx="1.5"/>'],
  ['lt:layers', 'Camadas', '<path d="M12 4l9 5-9 5-9-5z"/><path d="M3 14l9 5 9-5"/>'],
  ['lt:lib', 'Biblioteca e componentes', '<path d="M5 4v16M10 4v16M15 5l4 15"/>'],
  ['lt:assets', 'Assets (imagens)', '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/>'],
  ['lt:refs', 'Referências', '<path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3z"/><path d="M5 17a3 3 0 013-3h11"/>'],
  '|',
  ['zin', 'Mais zoom', '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.2-4.2M11 8.5v5M8.5 11h5"/>'],
  ['zout', 'Menos zoom', '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.2-4.2M8.5 11h5"/>'],
  ['fit', 'Ajustar à tela', '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'],
  '|',
  ['prev', 'Prévia', '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>'],
  ['ds', 'Sistema: cores, fontes e espaços', '<path d="M12 3a9 9 0 100 18c1.4 0 2-1 1.5-2.2-.5-1.3.2-2.3 1.6-2.3H17a4 4 0 004-4c0-5-4-9.5-9-9.5z"/><circle cx="8" cy="11" r="1.1"/><circle cx="12" cy="7.5" r="1.1"/><circle cx="16" cy="11" r="1.1"/>'],
  ['ver', 'Versões', '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>']];
function mzsAct(k) {
  if (k === 'sel') { if (MZ.free) mzFreeToggle(); if (MZ.draw && MZ.draw.on) mzDrawToggle(false); }
  else if (k === 'free') mzFreeToggle(); else if (k === 'draw') mzDrawToggle(); else if (k === 'ai') mzAiToggle();
  else if (k.startsWith('lt:')) mzLeftTab(k.slice(3));
  else if (k === 'zin') mzZoom(0.1); else if (k === 'zout') mzZoom(-0.1); else if (k === 'fit') mzZoomFit();
  else if (k === 'prev') mzModalPreview(); else if (k === 'ds') mzModalDs(); else if (k === 'ver') mzModalVersions();
  mzsState();
}
function mzsState() {
  document.querySelectorAll('.mz-strip button').forEach(b => { const k = b.dataset.k; b.classList.toggle('on', k === 'free' ? !!MZ.free : k === 'draw' ? !!(MZ.draw && MZ.draw.on) : k === 'sel' ? !MZ.free && !(MZ.draw && MZ.draw.on) : k === 'ai' ? (document.getElementById('mzAiBar') || {style: {display: 'none'}}).style.display !== 'none' : k.startsWith('lt:') ? MZ.left === k.slice(3) : false); });
}
function mzsBuild() {
  const body = document.querySelector('.mz-body'); if (!body || body.querySelector('.mz-strip')) return;
  const nav = document.createElement('nav'); nav.className = 'mz-strip'; nav.setAttribute('aria-label', 'Ferramentas');
  nav.innerHTML = MZS.map(t => t === '|' ? '<hr>' : `<button data-k="${t[0]}" title="${esc(t[1])}" aria-label="${esc(t[1])}" onclick="mzsAct('${t[0]}')">${mzsSvg(t[2])}</button>`).join('');
  body.insertBefore(nav, body.firstChild); mzsState();
}
/* abrir e fechar: classe escura no corpo e faixa de ferramentas */
(function () {
  const open0 = mzOpen, close0 = mzClose, tab0 = mzLeftTab;
  mzOpen = function () { document.body.classList.add('mz-dark'); const r = open0.apply(this, arguments); if (MZ.open) mzsBuild(); else document.body.classList.remove('mz-dark'); return r; };
  mzClose = async function () { const r = await close0.apply(this, arguments); if (!MZ.open) { document.body.classList.remove('mz-dark', 'mz-refwide'); MRF.on = false; } return r; };
  mzLeftTab = function (k) { tab0.apply(this, arguments); mzsState(); mzRefWide(); };
  const aiT = mzAiToggle; mzAiToggle = function () { const r = aiT.apply(this, arguments); mzsState(); return r; };
  const fr = mzFreeToggle; mzFreeToggle = function () { const r = fr.apply(this, arguments); mzsState(); return r; };
  const dr = mzDrawToggle; mzDrawToggle = function () { const r = dr.apply(this, arguments); mzsState(); return r; };
  const ref0 = window.mzRefreshLeft; window.mzRefreshLeft = function () { if (MZ.left === 'refs') { mzRefPanel(); return; } ref0.apply(this, arguments); };
})();
/* ---------- aba Referências ---------- */
const mzRefWide = () => document.body.classList.toggle('mz-refwide', MZ.open && MZ.left === 'refs' && MRF.mode === 'side' && !!MRF.id);
async function mzRefPanel() {
  const c = document.getElementById('mzLeftC'); if (!c) return; const q = MRF.q.toLowerCase(), L = refList().filter(i => !q || (i.name + ' ' + (i.tags || []).join(' ')).toLowerCase().includes(q)), cur = libItem(MRF.id);
  c.innerHTML = `<h4>Referências</h4><p class="mz-hint">Layouts que você admira, salvos na biblioteca de referências. Use só para estudar a estrutura.</p>
    <div class="mz-rbar"><input placeholder="Buscar" value="${esc(MRF.q)}" oninput="MRF.q=this.value;mzRefPanel()" aria-label="Buscar referência"><label class="btn sm" style="cursor:pointer">+ Subir<input type="file" accept="image/*" multiple hidden onchange="refUpload(this.files).then(mzRefPanel);this.value=''"></label></div>
    <div class="mz-rgrid">${L.length ? L.map(i => `<button class="${i.id === MRF.id ? 'on' : ''}" onclick="mzRefPick('${i.id}')" title="${esc(i.name)}"><img data-lib="${i.imgId}" alt="${esc(i.name)}"></button>`).join('') : '<p class="mz-hint">Nenhuma referência. Suba imagens aqui ou na tela Referências (também dá para colar com Ctrl+V).</p>'}</div>
    ${cur ? `<div class="mz-rview"><div class="mz-rmodes"><button class="${MRF.mode === 'over' ? 'on' : ''}" onclick="MRF.mode='over';mzRefPanel()">Sobrepor</button><button class="${MRF.mode === 'side' ? 'on' : ''}" onclick="MRF.mode='side';mzRefPanel()">Lado a lado</button></div>
      ${MRF.mode === 'over' ? `<label class="mz-rf"><span>Transparência: ${MRF.op}%</span><input type="range" min="10" max="90" value="${MRF.op}" oninput="MRF.op=+this.value;this.previousElementSibling.textContent='Transparência: '+this.value+'%';mzRefOver()"></label><label class="mz-rf"><span>Largura: ${MRF.w}%</span><input type="range" min="30" max="150" value="${MRF.w}" oninput="MRF.w=+this.value;this.previousElementSibling.textContent='Largura: '+this.value+'%';mzRefOver()"></label><button class="btn sm" onclick="MRF.id='';mzRefOver();mzRefPanel()">Tirar a referência da tela</button>` : `<div class="mz-rimg"><img id="mzRImg" alt="${esc(cur.name)}"></div>`}${cur.prompt ? `<p class="mz-hint">${esc(cur.prompt)}</p>` : ''}</div>` : ''}`;
  if (typeof libFill === 'function') libFill(c);
  if (cur) { const b = await imgGet(cur.imgId); if (b) { MRF.url = URL.createObjectURL(b); const im = document.getElementById('mzRImg'); if (im) im.src = MRF.url; } }
  mzRefOver(); mzRefWide();
}
function mzRefPick(id) { MRF.id = id; mzRefPanel(); }
function mzRefOver() {
  const w = document.querySelector('.mz-cwrap'); if (!w) return; let o = document.getElementById('mzRefOver');
  const on = MZ.open && MRF.mode === 'over' && MRF.id && MRF.url;
  if (!on) { if (o) o.hidden = true; return; } if (!o) { o = document.createElement('img'); o.id = 'mzRefOver'; o.alt = ''; w.appendChild(o); }
  o.hidden = false; o.src = MRF.url; o.style.cssText = 'position:absolute;left:18px;top:18px;width:calc((100% - 18px) * ' + MRF.w / 100 + ');opacity:' + MRF.op / 100 + ';pointer-events:none;z-index:2;max-width:none';
}

/* ---------- do Desenvolvimento para a Mesa: cada página do site vira uma página da Mesa (com todas as ferramentas de lá) ---------- */
async function esToMesa() {
  const p = curProject(), pages = typeof esPageOf === 'function' ? esPageOf(p) : []; if (!p || !pages.length) { toast('Este projeto ainda não tem site.'); return; }
  toast('Levando as páginas do site para a Mesa…');
  if (!MZ.open) { mzOpen(); await new Promise(r => setTimeout(r, 800)); } const m = mzM(); let first = '', n = 0; const idOf = {}, mine = [];
  const blank = m.pages.length === 1 && m.pages[0].home && m.pages[0].name === 'Página inicial' && confirm('A Mesa só tem a página de exemplo “Página inicial”. Trocar pelo site (OK) ou manter as duas (Cancelar)?') ? [m.pages[0]] : [];
  for (const l of pages) {
    try {
      /* links entre as páginas do site viram links de página da Mesa (guardados por id, continuam certos se mudar o nome) */
      const html = (await lpHTML(l, p, {preview: true})).replace(/<script[\s\S]*?<\/script>/gi, '').replace(/href="([\w-]+\.html)(#[\w-]*)?"/g, 'href="/__pg/$1$2"'), pg = await mzFromHtml(html, l.navLabel || l.name); if (!pg || !pg.root || m.pages.length >= MZ_LIMITS.pages) continue;
      const c = mzNormPage(pg); c.id = mzId(); c.home = false; c.name = l.navLabel || l.name; c.slug = mzUniqueSlug(mzSlug(l.navLabel || l.name)); idOf[lpFile(l)] = c.id; mine.push([c, l]); m.pages.push(c); if (!first) first = c.id; n++;
    } catch (e) { toast((l.navLabel || l.name) + ': ' + e.message); }
  }
  if (!n) { toast('Não consegui levar as páginas para a Mesa.'); return; }
  mine.forEach(([c]) => mzWalk(c.root, nd => {
    const fix = h => { const k = /^\/__pg\/([\w-]+\.html)(#[\w-]*)?$/.exec(h || ''); return k ? (idOf[k[1]] ? 'page:' + idOf[k[1]] + (k[2] || '') : '#') : h; };
    if (nd.props && typeof nd.props.html === 'string' && nd.props.html.indexOf('/__pg/') > -1) nd.props.html = nd.props.html.replace(/href="(\/__pg\/[\w-]+\.html(?:#[\w-]*)?)"/g, (x, h) => 'href="' + fix(h) + '"');
    if (nd.props && nd.props.href) nd.props.href = fix(nd.props.href); if (nd.type === 'menu') (nd.props.items || []).forEach(i => { i.href = fix(i.href); });
  }));
  const hp = mine.find(([, l]) => lpFile(l) === 'index.html'); if (hp && blank.length) { m.pages.forEach(x => { x.home = false; }); hp[0].home = true; hp[0].slug = ''; m.pages = m.pages.filter(x => !blank.includes(x)); if (!m.pages.some(x => x.id === m.cur)) m.cur = hp[0].id; }
  persist(); mzPageOpen(first); mzPageSelUpdate && mzPageSelUpdate(); mzRefreshPanels(); toast(n + ' página(s) do site na Mesa, já ligadas entre si. Use o botão Links para ver o mapa.');
}
