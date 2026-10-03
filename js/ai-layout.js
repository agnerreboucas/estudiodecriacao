/* ===== Leitura de layout por IA (visão): lê uma referência e devolve fontes, tamanhos, cores e blocos =====
   A imagem vai ao servidor (api/ai.php), que chama o modelo com a chave guardada só lá. */
const AIL_PROMPT = `Você é um diretor de arte lendo o layout de uma peça (capa, página de livro/revista, folheto, post). Devolva SÓ um JSON com este formato:
{"orientation":"portrait|landscape|square","bg":"#RRGGBB","structure":"grid|free","cols":1,"margins":{"t":0.0,"b":0.0,"l":0.0,"r":0.0},"palette":["#RRGGBB"],
"blocks":[{"role":"title|subtitle|kicker|body|caption|quote|label|number|image|shape|logo|line","x":0.0,"y":0.0,"w":0.0,"h":0.0,"text":"texto lido, curto","font":"nome provável da fonte","fontClass":"serif|sans|slab|display|script|mono","weight":400,"italic":false,"caps":false,"align":"left|center|right|justify","sizeRel":0.0,"color":"#RRGGBB","fill":"#RRGGBB","radius":0.0}]}
Regras: x,y,w,h e margens são frações (0 a 1) da largura/altura da página; sizeRel é a altura da fonte (em) como fração da ALTURA da página; weight só 300,400,600,700,800 ou 900; no máximo 30 blocos, do maior destaque para o menor; em "image" e "shape" use fill com a cor dominante; copie o texto legível (no máximo 80 caracteres por bloco); se não souber a fonte exata, dê a mais parecida e preencha fontClass. Não invente blocos que não existem.`;
const AIL_ROLES = ['title', 'subtitle', 'kicker', 'body', 'caption', 'quote', 'label', 'number', 'image', 'shape', 'logo', 'line'];

async function ailBlob(src, max) {
  const bm = src instanceof ImageBitmap ? src : await createImageBitmap(src), s = Math.min(1, (max || 1400) / Math.max(bm.width, bm.height)), c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(bm.width * s)); c.height = Math.max(1, Math.round(bm.height * s)); const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(bm, 0, 0, c.width, c.height);
  return {url: c.toDataURL('image/jpeg', 0.85), w: bm.width, h: bm.height};
}
async function aiVisionJSON(system, user, src, max) {
  const im = await ailBlob(src), b64 = im.url.split(',')[1];
  const j = await api('ai.php', {method: 'POST', body: {system: system + '\nResponda APENAS com JSON válido, sem markdown nem comentários.', messages: [{role: 'user', content: user}], images: [{media_type: 'image/jpeg', data: b64}], max_tokens: max || 3500}});
  const s = String(j.text || '').replace(/```json|```/g, '').trim(), a = s.search(/[\[{]/), z = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']'));
  try { return {json: JSON.parse(s.slice(a, z + 1)), w: im.w, h: im.h}; } catch (e) { throw new Error('a IA devolveu um formato inesperado; tente de novo.'); }
}
/* valida o que veio da IA: números limitados, cores hexadecimais, textos curtos */
function ailClean(j, w, h) {
  const hex = (v, d) => /^#[0-9a-f]{6}$/i.test(String(v)) ? String(v).toUpperCase() : d, n = (v, lo, hi, d) => { v = +v; return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; }, str = (v, k) => String(v == null ? '' : v).slice(0, k);
  j = j && typeof j === 'object' ? j : {}; const m = j.margins || {}, blocks = (Array.isArray(j.blocks) ? j.blocks : []).slice(0, 30).filter(b => b && typeof b === 'object').map(b => ({
    role: AIL_ROLES.includes(b.role) ? b.role : 'body', x: n(b.x, 0, 1, 0), y: n(b.y, 0, 1, 0), w: n(b.w, 0.01, 1, 0.5), h: n(b.h, 0.005, 1, 0.1), text: str(b.text, 120), font: str(b.font, 60), fontClass: ['serif', 'sans', 'slab', 'display', 'script', 'mono'].includes(b.fontClass) ? b.fontClass : 'sans',
    weight: [300, 400, 600, 700, 800, 900].includes(+b.weight) ? +b.weight : 400, italic: !!b.italic, caps: !!b.caps, align: ['left', 'center', 'right', 'justify'].includes(b.align) ? b.align : 'left', sizeRel: n(b.sizeRel, 0.004, 0.4, 0.02), color: hex(b.color, '#222222'), fill: hex(b.fill, ''), radius: n(b.radius, 0, 0.5, 0)}));
  return {w, h, orientation: ['portrait', 'landscape', 'square'].includes(j.orientation) ? j.orientation : (w > h * 1.1 ? 'landscape' : h > w * 1.1 ? 'portrait' : 'square'), bg: hex(j.bg, '#FFFFFF'), structure: j.structure === 'grid' ? 'grid' : 'free', cols: Math.round(n(j.cols, 1, 6, 1)), margins: {t: n(m.t, 0, 0.4, 0.06), b: n(m.b, 0, 0.4, 0.06), l: n(m.l, 0, 0.4, 0.06), r: n(m.r, 0, 0.4, 0.06)}, palette: (Array.isArray(j.palette) ? j.palette : []).slice(0, 8).map(c => hex(c, '')).filter(Boolean), blocks};
}
/* fonte mais parecida dentro do catálogo (158 do Studio + as suas) */
const AIL_CLASS = {serif: ['Lora', 'Playfair Display', 'Cormorant Garamond', 'Source Serif 4', 'Merriweather'], sans: ['Inter', 'Montserrat', 'Poppins', 'DM Sans', 'Work Sans'], slab: ['Merriweather', 'Source Serif 4'], display: ['DM Serif Display', 'Abril Fatface', 'Bebas Neue', 'Anton', 'Playfair Display'], script: ['Caveat', 'Kalam'], mono: ['Space Grotesk', 'Inter']};
function ailMapFont(name, cls, wantHeavy) {
  const all = typeof dtpFontList === 'function' ? dtpFontList() : Object.keys(FONT_META), norm = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, ''), n = norm(name || '');
  if (n) { const ex = all.find(f => norm(f) === n); if (ex) return {font: ex, exact: true}; const part = all.filter(f => norm(f).length >= 4 && (n.includes(norm(f)) || norm(f).includes(n) && n.length >= 5)).sort((a, b) => norm(b).length - norm(a).length)[0]; if (part) return {font: part, exact: false}; }
  const L = AIL_CLASS[cls] || AIL_CLASS.sans, pick = L.find(f => all.includes(f)) || 'Inter'; return {font: wantHeavy && cls === 'display' ? (L.find(f => all.includes(f)) || pick) : pick, exact: false};
}
async function ailRead(src) {
  const r = await aiVisionJSON(AIL_PROMPT, 'Leia o layout desta imagem.', src, 3500);
  const res = ailClean(r.json, r.w, r.h); res.blocks.forEach(b => { const m = ailMapFont(b.font, b.fontClass, b.weight >= 700); b.map = m.font; b.exact = m.exact; }); return res;
}

/* ---------- tela de revisão ---------- */
const ail = {res: null, src: null, from: ''};
async function ailStart(src, from) {
  ail.src = src; ail.from = from || ''; toast('Lendo o layout com IA…');
  try { ail.res = await ailRead(src); ailReview(); } catch (e) { toast(e.status === 503 ? 'A IA não está configurada no servidor (ANTHROPIC_API_KEY em api/config.php).' : 'Não consegui ler o layout: ' + e.message); }
}
function ailReview() {
  const r = ail.res, fonts = [...new Map(r.blocks.filter(b => b.text || b.role !== 'shape').map(b => [b.map, b])).values()].filter(b => !['image', 'shape', 'line', 'logo'].includes(b.role));
  $('modalBox') && $('modalBox').classList.add('wide');
  showModal('Layout lido pela IA', `<p class="muted" style="font-size:12px;margin-top:0">Confira antes de usar. A IA lê os pixels e pode errar tamanho e fonte; tudo fica editável.</p>
  <div class="form-grid"><div><div class="okr-label">ESTRUTURA</div><p style="font-size:13px;margin:4px 0">${r.structure === 'grid' ? 'Composição em <b>grade</b>' : 'Composição <b>livre</b>'} · ${r.cols} coluna(s) · ${r.orientation === 'portrait' ? 'retrato' : r.orientation === 'landscape' ? 'paisagem' : 'quadrado'}</p><p style="font-size:12px" class="muted">Margens: topo ${(r.margins.t * 100).toFixed(0)}% · base ${(r.margins.b * 100).toFixed(0)}% · esq. ${(r.margins.l * 100).toFixed(0)}% · dir. ${(r.margins.r * 100).toFixed(0)}%</p>
  <div class="okr-label" style="margin-top:8px">CORES</div><div class="in-sw">${[r.bg, ...r.palette].map(c => `<button style="background:${esc(c)}" title="${esc(c)}"><small>${esc(c)}</small></button>`).join('')}</div></div>
  <div><div class="okr-label">FONTES (lida → usada)</div><table class="ail-t">${fonts.map(b => `<tr><td>${esc(b.font || b.fontClass)}</td><td>→</td><td><b style="font-family:'${esc(b.map)}'">${esc(b.map)}</b>${b.exact ? '' : ' <small class="muted">(parecida)</small>'}</td></tr>`).join('') || '<tr><td class="muted">Nenhum texto identificado.</td></tr>'}</table></div></div>
  <div class="okr-label" style="margin-top:8px">BLOCOS (${r.blocks.length})</div><div class="ail-blocks">${r.blocks.map(b => `<span class="tchip">${esc(b.role)}${b.text ? ': ' + esc(b.text.slice(0, 28)) : ''}</span>`).join('')}</div>
  <div class="modal-actions" style="flex-wrap:wrap"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn" onclick="ailToSlide()">Criar peça editável (capa/layout)</button>${typeof dtpDoc === 'function' && ail.from === 'dtp' && dtpDoc() ? '<button class="btn dark" onclick="ailToDoc()">Aplicar ao documento da Diagramação</button>' : ''}</div>`);
}

/* ---------- resultado 1: peça editável no Editor de Design ---------- */
async function ailToSlide() {
  const p = curProject(), r = ail.res; if (!p || !r) return;
  const W = 1600, H = Math.round(W * r.h / r.w), L = [];
  await ensureFonts(r.blocks.map(b => b.map));
  r.blocks.forEach((b, i) => {
    const x = b.x * W, y = b.y * H, w = Math.max(20, b.w * W), h = Math.max(10, b.h * H);
    if (b.role === 'shape' || b.role === 'line') L.push(RC(b.role === 'line' ? 'rule' : 'shape', {x, y, w, h: b.role === 'line' ? Math.max(3, h) : h, fill: b.fill || b.color, radius: Math.round(b.radius * Math.min(w, h))}));
    else if (b.role === 'image' || b.role === 'logo') L.push(IM(b.role === 'logo' ? 'logo' : 'photo', {x, y, w, h, brief: 'Troque pela sua imagem', radius: Math.round(b.radius * Math.min(w, h))}));
    else L.push(T(b.role, {x, y, w, content: b.text || 'Texto', family: b.map, size: Math.max(14, Math.round(b.sizeRel * H)), weight: b.weight, color: b.color, align: b.align === 'justify' ? 'left' : b.align, lh: b.role === 'body' ? 1.45 : 1.15, upper: b.caps, spans: b.italic && b.text ? [{s: 0, e: b.text.length, st: {italic: true}}] : undefined}));
  });
  const tk = brandTokens(p); Object.assign(tk, {name: 'Layout lido', bg: r.bg, fg: r.blocks.find(b => b.role === 'title') ? r.blocks.find(b => b.role === 'title').color : '#111111'});
  const set = {id: uid('ds'), name: 'Layout lido · ' + new Date().toLocaleDateString('pt-BR'), format: {id: 'custom', w: W, h: H}, tk, slides: [{id: sid(), name: 'Layout', bg: r.bg, layers: L}], created: new Date().toISOString(), updated: new Date().toISOString()};
  await ensureSetResources(set); p.design.sets.push(set); persist(); closeModal(); go('design'); dzOpen(set.id);
  toast('Peça criada. Troque os textos e imagens; use ★ Modelo no editor para guardar na galeria de layouts.');
}

/* ---------- resultado 2: estilos, cores e grade do documento da Diagramação ---------- */
function ailToDoc() {
  const d = dtpDoc(), r = ail.res; if (!d || !r) return; const H = d.page.h, W = d.page.w, by = role => r.blocks.filter(b => b.role === role).sort((a, b) => b.sizeRel - a.sizeRel);
  const S = d.styles, set = (k, b, o) => { if (!b) return; Object.assign(S[k], {font: b.map, color: b.color, align: b.align, b: b.weight >= 600 ? 1 : 0, i: b.italic ? 1 : 0, caps: b.caps ? 1 : 0}, o || {}); };
  const body = by('body')[0], title = by('title')[0], sub = by('subtitle')[0] || by('kicker')[0], cap = by('caption')[0], quote = by('quote')[0], lab = by('label')[0] || by('kicker')[0];
  if (body) { const size = Math.max(6, Math.round(body.sizeRel * H * 2) / 2); set('body', body, {size, lead: +(size * 1.45).toFixed(1), indent: body.align === 'justify' ? 12 : 0}); }
  if (title) { const size = Math.max(14, Math.round(title.sizeRel * H)); set('h1', title, {size, lead: +(size * 1.12).toFixed(1)}); S.h1.align = title.align === 'justify' ? 'left' : title.align; }
  if (sub) { const size = Math.max(10, Math.round(sub.sizeRel * H)); set('h2', sub, {size, lead: +(size * 1.2).toFixed(1)}); }
  if (lab) { const size = Math.max(6, Math.round(lab.sizeRel * H * 2) / 2); set('h3', lab, {size, lead: +(size * 1.4).toFixed(1)}); }
  if (cap) { const size = Math.max(5, Math.round(cap.sizeRel * H * 2) / 2); set('caption', cap, {size, lead: +(size * 1.35).toFixed(1)}); }
  if (quote) { const size = Math.max(8, Math.round(quote.sizeRel * H)); set('quote', quote, {size, lead: +(size * 1.4).toFixed(1)}); }
  d.paper = r.bg; d.cols = r.cols; d.margins = {t: r.margins.t * H, b: r.margins.b * H, i: r.margins.l * W, o: r.margins.r * W};
  closeModal(); dtpTouch(true); dtpSnap(); dtpRefresh(true); toast('Estilos, cores e grade aplicados. Desfaça com Ctrl+Z se não gostar.');
}
