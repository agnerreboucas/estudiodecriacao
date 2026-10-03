/* ===== Fontes e combinações: ver o formato de cada fonte (ficha com alfabeto, números, pesos), escolher e combinar ===== */
(function () { const add = {'Cinzel': '400;600;700;900', 'Ubuntu': '400;500;700', 'Fira Sans Condensed': '400;500;600;700;800', 'Titillium Web': '400;600;700', 'Playfair Display SC': '400;700;900', 'Dancing Script': '400;600;700', 'Great Vibes': '', 'Pacifico': '', 'Roboto Condensed': '400;700', 'Libre Baskerville': '400;700', 'Bitter': '400;600;700;800', 'Oswald': '400;500;600;700'}; Object.entries(add).forEach(([k, v]) => { if (!(k in FONT_META)) { FONT_META[k] = v; if (typeof FONT_LIST !== 'undefined' && !FONT_LIST.includes(k)) FONT_LIST.push(k); } }); })();
const FB = {tab: 'fontes', q: '', cat: '', sel: '', pair: '', txt: '', size: 44, shown: 36, mode: 'page', cb: null, cur: ''};
const FB_WN = {100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black'};
/* combinações: [id, nome, título, texto, observação]. As pagas têm equivalente gratuito */
const FB_PAIRS = [
  ['anton-caveat', 'Anton + Caveat', 'Anton', 'Caveat', 'Equivalente grátis de Anton + Roustel'], ['psc-ubuntu', 'Playfair Display SC + Ubuntu', 'Playfair Display SC', 'Ubuntu', 'Elegante com texto técnico e limpo'],
  ['inter-vibes', 'Great Vibes + Inter', 'Great Vibes', 'Inter', 'Equivalente grátis de Inter + Tempting (script)'], ['cinzel-poppins', 'Cinzel + Poppins', 'Cinzel', 'Poppins', 'Clássica romana com texto geométrico'],
  ['firacond-titillium', 'Fira Sans Condensed + Titillium Web', 'Fira Sans Condensed', 'Titillium Web', 'Tecnológica, compacta e legível'], ['bebas-mont', 'Bebas Neue + Montserrat', 'Bebas Neue', 'Montserrat', 'Impacto em caixa alta + corpo neutro'],
  ['oswald-open', 'Oswald + Open Sans', 'Oswald', 'Open Sans', 'Notícia e promoção'], ['dmserif-dmsans', 'DM Serif Display + DM Sans', 'DM Serif Display', 'DM Sans', 'Editorial moderna'],
  ['abril-poppins', 'Abril Fatface + Poppins', 'Abril Fatface', 'Poppins', 'Revista de moda'], ['corm-mont', 'Cormorant Garamond + Montserrat', 'Cormorant Garamond', 'Montserrat', 'Luxo discreto'],
  ['archivo-work', 'Archivo Black + Work Sans', 'Archivo Black', 'Work Sans', 'Forte e direta'], ['space-inter', 'Space Grotesk + Inter', 'Space Grotesk', 'Inter', 'Tech e startup'],
  ['play-lato', 'Playfair Display + Lato', 'Playfair Display', 'Lato', 'Clássica de livro e blog'], ['merri-mont', 'Merriweather + Montserrat', 'Merriweather', 'Montserrat', 'Leitura longa com títulos firmes'],
  ['lora-mont', 'Lora + Montserrat', 'Lora', 'Montserrat', 'E-books e guias (a de livros)'], ['spartan-lora', 'League Spartan + Lora', 'League Spartan', 'Lora', 'Moderna com texto serifado'],
  ['fredoka-nunito', 'Fredoka + Nunito', 'Fredoka', 'Nunito', 'Amigável, infantil e saúde'], ['marker-roboto', 'Permanent Marker + Roboto', 'Permanent Marker', 'Roboto', 'Informal, mão na massa'],
  ['inst-inter', 'Instrument Serif + Inter', 'Instrument Serif', 'Inter', 'Moderno com toque autoral'], ['dancing-lato', 'Dancing Script + Lato', 'Dancing Script', 'Lato', 'Romântica e delicada'],
  ['bitter-sans', 'Bitter + Source Sans 3', 'Bitter', 'Source Sans 3', 'Slab com corpo neutro'], ['robcond-lora', 'Roboto Condensed + Libre Baskerville', 'Roboto Condensed', 'Libre Baskerville', 'Jornal e notícia'],
  ['bigsh-inter', 'Big Shoulders Display + Inter', 'Big Shoulders Display', 'Inter', 'Esporte e energia'], ['sora-dm', 'Sora + DM Sans', 'Sora', 'DM Sans', 'Digital e fintech']
];
const FB_TONES = [['#111111', '#FFFFFF'], ['#F4EFE6', '#222222'], ['#1F3A2E', '#F4F1EC'], ['#C96A2B', '#FFFFFF'], ['#10264A', '#FFFFFF'], ['#FFFFFF', '#111111'], ['#E9DCCB', '#3A2A20'], ['#15120D', '#F2E3B8']];
const fbCat = f => (typeof LG_TF !== 'undefined' && LG_TF[f] && LG_TF[f].cat) || 'other';
const fbAll = () => dtpFontList();
const fbList = () => fbAll().filter(f => (!FB.cat || fbCat(f) === FB.cat) && (!FB.q || f.toLowerCase().includes(FB.q.toLowerCase())));
const fbWeights = f => { const m = FONT_META[f]; return m ? m.split(';').map(Number).filter(Boolean) : [400]; };
const fbCatName = c => (LG_FONT_CATS.find(x => x[0] === c) || [0, 'Outras'])[1];

/* ---------- peças do HTML ---------- */
function fbHTML() {
  const cats = [['', 'Todas'], ...LG_FONT_CATS, ['other', 'Outras']];
  const tabs = FB.mode === 'page' ? `<div class="tchips" style="margin:6px 0"><button class="tchip ${FB.tab === 'fontes' ? 'on' : ''}" onclick="FB.tab='fontes';fbRedraw()">Fontes</button><button class="tchip ${FB.tab === 'pares' ? 'on' : ''}" onclick="FB.tab='pares';fbRedraw()">Combinações</button></div>` : '';
  return `${tabs}<div class="fb-wrap"><div class="fb-left">${FB.tab === 'fontes' ? fbFontsLeft(cats) : fbPairsLeft()}</div><div class="fb-right" id="fbSpec">${FB.tab === 'fontes' ? fbSpecHTML(FB.sel) : fbPairHTML(FB.pair)}</div></div>`;
}
function fbFontsLeft(cats) {
  const list = fbList(), shown = list.slice(0, FB.shown), txt = FB.txt || 'Aa Bb Cc';
  return `<div class="row-gap" style="flex-wrap:wrap"><input class="ly-search" placeholder="Buscar fonte (${fbAll().length})" value="${esc(FB.q)}" oninput="FB.q=this.value;FB.shown=36;fbGridSoon()"><input class="ly-search" placeholder="Texto de prévia (ex.: o nome da marca)" value="${esc(FB.txt)}" oninput="FB.txt=this.value;fbPrevTxt()"></div>
  <div class="tchips" style="margin:6px 0">${cats.map(([k, l]) => `<button class="tchip ${FB.cat === k ? 'on' : ''}" onclick="FB.cat='${k}';FB.shown=36;fbRedraw()">${esc(l)}</button>`).join('')}</div>
  <div class="fb-grid" id="fbGrid">${shown.map(f => `<button class="fb-tile ${FB.sel === f ? 'on' : ''}" data-f="${esc(f)}" onclick="fbSelect('${esc(f)}')"><span class="fb-pv" style="font-family:'${esc(f)}',sans-serif">${esc(txt)}</span><small>${esc(f)}</small></button>`).join('') || '<p class="muted">Nenhuma fonte nesta busca.</p>'}</div>
  ${list.length > shown.length ? `<div style="text-align:center;margin:8px"><button class="btn sm" onclick="FB.shown+=36;fbRedraw()">Mostrar mais (${list.length - shown.length})</button></div>` : ''}`;
}
function fbPairsLeft() {
  const lib = FONT_PAIRS.map(x => [x[0], x[1], x[2], x[3], 'Biblioteca do Studio']);
  const card = (x, i) => { const t = FB_TONES[i % FB_TONES.length]; return `<button class="fb-pair ${FB.pair === x[0] ? 'on' : ''}" onclick="fbPairSel('${x[0]}')" style="background:${t[0]};color:${t[1]}" data-pf="${esc(x[2])}|${esc(x[3])}"><b style="font-family:'${esc(x[2])}',sans-serif">Título que chama a atenção</b><span style="font-family:'${esc(x[3])}',sans-serif">Um parágrafo de apoio mostra como o texto corrido conversa com o título.</span><small>${esc(x[1])}</small></button>`; };
  return `<div class="okr-label">COMBINAÇÕES PRONTAS (${FB_PAIRS.length})</div><div class="fb-pairs">${FB_PAIRS.map(card).join('')}</div><div class="okr-label" style="margin-top:12px">DA BIBLIOTECA DO STUDIO (${lib.length})</div><div class="fb-pairs">${lib.map((x, i) => card(x, i + 3)).join('')}</div>`;
}
function fbSpecHTML(f) {
  if (!f) return '<div class="fb-empty"><b>Clique numa fonte</b><p class="muted" style="font-size:12.5px">Você vê a ficha completa: alfabeto, números, símbolos, todos os pesos e um parágrafo, e escolhe com segurança antes de usar.</p></div>';
  const ws = fbWeights(f), up = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lo = 'abcdefghijklmnopqrstuvwxyz', num = '0123456789', sy = '& ! ? @ # $ % ( ) + = * / , . : ; “ ” « » ç ã õ é ê á',
    pairs = FB_PAIRS.filter(x => x[2] === f || x[3] === f), fam = `font-family:'${esc(f)}',sans-serif`;
  const act = FB.mode === 'pick' ? `<button class="btn dark" onclick="fbUse('${esc(f)}')">Usar esta fonte</button>` : `<button class="btn dark" onclick="fbApplyLayer('${esc(f)}')">Aplicar no texto selecionado</button><button class="btn" onclick="fbKit('headFont','${esc(f)}')">Fonte de título do Kit</button><button class="btn" onclick="fbKit('bodyFont','${esc(f)}')">Fonte de texto do Kit</button>`;
  return `<div class="fb-spec"><div class="fb-spec-h"><div><b style="font-size:18px">${esc(f)}</b><small class="muted block">${esc(fbCatName(fbCat(f)))} · ${ws.length} peso(s): ${ws.map(w => FB_WN[w] || w).join(', ')}</small></div></div>
  <div class="fb-dark"><small>CHARACTER SET</small><div class="fb-big fb-live" style="${fam};font-size:${FB.size}px;font-weight:${ws.includes(700) ? 700 : ws[ws.length - 1]}">${esc(FB.txt || 'Aa Bb Cc Dd Ee Ff Gg')}</div><input type="range" min="20" max="120" value="${FB.size}" oninput="FB.size=+this.value;fbSize()"></div>
  <div class="fb-block"><small>MAIÚSCULAS</small><div style="${fam};font-size:22px;letter-spacing:.08em;word-break:break-all">${up}</div><small>MINÚSCULAS</small><div style="${fam};font-size:22px;letter-spacing:.06em;word-break:break-all">${lo}</div><small>NÚMEROS E SÍMBOLOS</small><div style="${fam};font-size:22px;letter-spacing:.06em;word-break:break-all">${num}<br>${sy}</div></div>
  <div class="fb-block"><small>PESOS</small>${ws.map(w => `<div class="fb-wl" style="${fam};font-weight:${w}"><span>${esc(FB.txt || 'Design que entende o trabalho')}</span><em>${FB_WN[w] || w}</em></div>`).join('')}${!ws.includes(400) && !ws.length ? '' : ''}</div>
  <div class="fb-block"><small>EM TEXTO CORRIDO</small><p style="${fam};font-size:15px;line-height:1.55;margin:4px 0">Bons textos pedem boa leitura. Esta é a mesma fonte em tamanho de corpo: veja como as letras se encaixam, o espaço entre as linhas e o ritmo de um parágrafo inteiro, com acentos, ç, ã e números como 2026.</p><p style="${fam};font-size:12px;line-height:1.5;margin:4px 0">Tamanho pequeno (12 px) para legendas e notas de rodapé.</p></div>
  ${pairs.length ? `<div class="fb-block"><small>COMBINA BEM COM</small>${pairs.map(x => `<button class="btn sm" onclick="FB.tab='pares';FB.pair='${x[0]}';fbRedraw()">${esc(x[1])}</button>`).join(' ')}</div>` : ''}
  <div class="row-gap" style="flex-wrap:wrap;margin-top:8px">${act}</div><small class="muted block" style="margin-top:6px">As fontes vêm do Google Fonts (precisam de internet) ou da sua pasta de fontes.</small></div>`;
}
function fbPairHTML(id) {
  const x = FB_PAIRS.find(q => q[0] === id) || (FONT_PAIRS.find(q => q[0] === id) && (q => [q[0], q[1], q[2], q[3], 'Biblioteca do Studio'])(FONT_PAIRS.find(q => q[0] === id)));
  if (!x) return '<div class="fb-empty"><b>Clique numa combinação</b><p class="muted" style="font-size:12.5px">Veja o exemplo ampliado com título e texto, edite o texto de prévia e aplique na peça aberta ou no Kit de marca.</p></div>';
  const [i0, nm, h, b, note] = x, t = FB_TONES[Math.max(0, FB_PAIRS.findIndex(q => q[0] === id)) % FB_TONES.length];
  return `<div class="fb-spec"><div class="fb-spec-h"><div><b style="font-size:18px">${esc(nm)}</b><small class="muted block">${esc(note)}</small></div></div>
  <div class="fb-poster" style="background:${t[0]};color:${t[1]}"><small style="font-family:'${esc(b)}',sans-serif;letter-spacing:.2em">${esc(FB.txt ? '' : 'EXEMPLO DE USO')}</small><h2 style="font-family:'${esc(h)}',sans-serif;font-size:40px;line-height:1.05;margin:8px 0">${esc(FB.txt || 'Título que prende o olhar')}</h2><p style="font-family:'${esc(b)}',sans-serif;font-size:15px;line-height:1.55;margin:0">O texto de apoio explica em poucas linhas, sem competir com o título. Esta é a fonte de texto da combinação, em tamanho de leitura.</p><div class="fb-btn" style="background:${t[1]};color:${t[0]};font-family:'${esc(b)}',sans-serif">Chamada para ação</div></div>
  <input class="ly-search" style="margin-top:8px;width:100%" placeholder="Digite o seu título para ver na combinação" value="${esc(FB.txt)}" oninput="FB.txt=this.value;fbPairTxt()">
  <div class="fb-block"><small>FONTES</small><div class="fb-wl" style="font-family:'${esc(h)}',sans-serif"><span>${esc(h)}</span><em>título</em></div><div class="fb-wl" style="font-family:'${esc(b)}',sans-serif"><span>${esc(b)}</span><em>texto</em></div><div class="row-gap"><button class="btn sm" onclick="FB.tab='fontes';fbSelect('${esc(h)}');fbRedraw()">Ver ficha do título</button><button class="btn sm" onclick="FB.tab='fontes';fbSelect('${esc(b)}');fbRedraw()">Ver ficha do texto</button></div></div>
  <div class="row-gap" style="flex-wrap:wrap;margin-top:8px"><button class="btn dark" onclick="fbApplyPair('${esc(h)}','${esc(b)}')">Aplicar na peça aberta</button><button class="btn" onclick="fbKitPair('${esc(h)}','${esc(b)}')">Usar no Kit de marca</button></div></div>`;
}

/* ---------- ações ---------- */
function fbRedraw() { const r = $('fbRoot'); if (r) { r.innerHTML = fbHTML(); fbMount(); } }
const fbGridSoon = (() => { let t = 0; return () => { clearTimeout(t); t = setTimeout(() => { const g = $('fbGrid'); if (!g) return; const keep = document.activeElement && document.activeElement.value; const root = $('fbRoot'), pos = document.activeElement ? document.activeElement.selectionStart : 0, idx = [...root.querySelectorAll('input.ly-search')].indexOf(document.activeElement); fbRedraw(); const ins = $('fbRoot').querySelectorAll('input.ly-search'); if (ins[idx]) { ins[idx].focus(); ins[idx].setSelectionRange(pos, pos); } }, 260); }; })();
function fbPrevTxt() { document.querySelectorAll('#fbGrid .fb-pv').forEach(e => { e.textContent = FB.txt || 'Aa Bb Cc'; }); document.querySelectorAll('#fbSpec .fb-live').forEach(e => { e.textContent = FB.txt || 'Aa Bb Cc Dd Ee Ff Gg'; }); }
function fbSize() { document.querySelectorAll('#fbSpec .fb-big').forEach(e => { e.style.fontSize = FB.size + 'px'; }); }
async function fbSelect(f) { FB.sel = f; document.querySelectorAll('#fbGrid .fb-tile').forEach(t => t.classList.toggle('on', t.dataset.f === f)); const s = $('fbSpec'); if (s) { await ensureFont(f); s.innerHTML = fbSpecHTML(f); } }
async function fbPairSel(id) { FB.pair = id; const x = FB_PAIRS.find(q => q[0] === id) || FONT_PAIRS.find(q => q[0] === id); if (x) await ensureFonts([x[2], x[3]]); document.querySelectorAll('.fb-pair').forEach(e => e.classList.toggle('on', e.getAttribute('onclick').includes("'" + id + "'"))); const s = $('fbSpec'); if (s) s.innerHTML = fbPairHTML(id); }
function fbPairTxt() { const h = document.querySelector('#fbSpec .fb-poster h2'); if (h) h.textContent = FB.txt || 'Título que prende o olhar'; }
async function fbMount() {
  const fams = FB.tab === 'fontes' ? [...document.querySelectorAll('#fbGrid .fb-tile')].map(t => t.dataset.f) : [...document.querySelectorAll('.fb-pair')].flatMap(e => e.dataset.pf.split('|'));
  for (let i = 0; i < fams.length; i += 6) { await Promise.all(fams.slice(i, i + 6).map(f => ensureFont(f))); if (!$('fbRoot')) return; }
  if (FB.tab === 'fontes' && FB.sel) { const s = $('fbSpec'); if (s) { await ensureFont(FB.sel); } }
}
function fbUse(f) { const cb = FB.cb; closeModal(); if (cb) cb(f); }
function fbApplyLayer(f) { const L = typeof dzLayer === 'function' && dz.view === 'editor' ? dzLayer() : null; if (!L || L.type !== 'text') { toast('Abra uma peça no editor e selecione um texto para aplicar a fonte.'); return; } dzFont(f); toast('Fonte aplicada ao texto.'); }
function fbKit(k, f) { const p = dzP(); if (!p) return; brandOf(p)[k] = f; persist(); toast((k === 'headFont' ? 'Fonte de título' : 'Fonte de texto') + ' do Kit de marca: ' + f); }
function fbKitPair(h, b) { const bo = brandOf(dzP()); bo.headFont = h; bo.bodyFont = b; persist(); toast('Kit de marca: ' + h + ' + ' + b); }
async function fbApplyPair(h, b) {
  const s = typeof dzSet === 'function' && dz.view === 'editor' ? dzSet() : null; if (!s) { toast('Abra uma peça no editor para aplicar a combinação (ou use no Kit de marca).'); return; }
  await ensureFonts([h, b]); s.slides.forEach(sl => sl.layers.forEach(L => { if (L.type === 'text') L.family = ['title', 'kicker', 'big', 'num', 'headline'].includes(L.role) || L.size >= 70 ? h : b; })); persist(); dzDraw && dzDraw(); toast('Combinação aplicada às peças abertas.');
}
/* seletor de fonte em janela (usado nos editores) */
function fbOpen(cb, cur) { FB.q = ''; FB.cat = ''; FB.mode = 'pick'; FB.cb = cb; FB.tab = 'fontes'; FB.sel = cur || ''; FB.shown = 36; $('modalBox') && $('modalBox').classList.add('wide'); showModal('Escolher fonte', `<div id="fbRoot">${fbHTML()}</div>`); fbMount(); }
function dzFontsOpen() { FB.mode = 'page'; FB.cb = null; dz.view = 'fonts'; go('design'); }
function renderFontsPage(p, r) {
  FB.mode = 'page'; r.innerHTML = `<div class="page-head"><div><h1>Fontes e combinações</h1><p>Veja o formato de cada fonte (alfabeto, números, pesos e texto corrido) e escolha as combinações de título + texto com exemplo. Aplique na peça aberta ou no Kit de marca.</p></div><div class="actions">${projectSelect()}<button class="btn" onclick="dzBack()">Voltar</button></div></div><div class="panel"><div id="fbRoot">${fbHTML()}</div></div>`; fbMount();
}
