/* ===== Laboratório do Logo · logos tipográficos e página de fontes (prévia das famílias) ===== */
const lgF = {mode: 'edit', q: '', cat: '', sel: '', hw: 0, tf: '', tw: 400, hf2: '', text: '', shown: 36, onlyFav: false};

function lgSetRole(v) { const c = lg.cur; c.font = v; delete c.hf; delete c.hw; delete c.tf; delete c.tw; delete c.hf2; renderDesign(); }
function lgSetKind(k) {
  const c = lg.cur; if (k === 'type' && !lgIsType(c)) { c.comp = 'tp-plain'; if (!c.hf) { const F = lgFontOf(c); c.hf = F.head; c.hw = F.hw; } c.grad = false; }
  if (k === 'symbol' && lgIsType(c)) { c.comp = 'stack'; if (!c.sym || c.sym === 'sparkle') c.sym = 'hex'; }
  renderDesign();
}
function lgTypeOpts(s) {
  const F = lgFontOf(s), mix = s.comp === 'tp-mix';
  return `<div class="okr-label">AJUSTES DA TIPOGRAFIA</div><div class="row-gap" style="margin:4px 0 8px"><button class="btn sm ${F.upper ? 'dark' : ''}" onclick="lgSet('up',true)">MAIÚSCULAS</button><button class="btn sm ${F.upper ? '' : 'dark'}" onclick="lgSet('up',false)">Minúsculas / normal</button></div>
  <label class="ins">Espaçamento entre letras <b>${F.ls}</b><input type="range" min="-2" max="20" step="1" value="${F.ls}" oninput="lgSet('ls',+this.value,1);this.previousElementSibling.textContent=this.value"></label>
  ${mix ? `<label class="ins">Segunda fonte (mistura)<select onchange="lgSet('hf2',this.value)">${LG_TYPEFACES.map(f => `<option ${f.family === (s.hf2 || F.tag) ? 'selected' : ''}>${esc(f.family)}</option>`).join('')}</select></label>` : ''}`;
}

/* ---------- página de fontes ---------- */
function lgFontsOpen(mode) {
  lgF.mode = mode || 'edit'; lgF.shown = 36; lgF.q = ''; lgF.cat = ''; lgF.onlyFav = false;
  if (lgF.mode === 'edit') { const F = lgFontOf(lg.cur); lgF.sel = F.head; lgF.hw = F.hw; lgF.tf = F.tag; lgF.tw = F.tw || 400; lgF.hf2 = lg.cur.hf2 || ''; lgF.text = lg.cur.name || lg.brief.name || 'Sua Marca'; }
  else { lgF.sel = ''; lgF.text = lg.brief.name || 'Sua Marca'; }
  lg.view = 'fonts'; renderDesign();
}
function lgFontList() { const q = lgNorm(lgF.q).trim(); const fav = lg.brief.fontFavs || []; return LG_TYPEFACES.filter(f => (!lgF.cat || f.cat === lgF.cat) && (!q || lgNorm(f.family).includes(q)) && (!lgF.onlyFav || fav.includes(f.family))); }
const lgCatLabel = id => (LG_FONT_CATS.find(c => c[0] === id) || [0, id])[1];
function lgFontCard(f) {
  const fav = (lg.brief.fontFavs || []).includes(f.family), sel = lgF.sel === f.family, w = lgDefaultWeight(f.family), sc = Math.min(1.5, f.scale || 1);
  return `<button class="lg-fcard ${sel ? 'on' : ''}" onclick="lgFontPick('${esc(f.family)}')" data-fam="${esc(f.family)}"><span class="lg-fsample" style="font-family:'${esc(f.family)}',system-ui,sans-serif;font-weight:${w};font-size:${Math.round(28 * sc)}px">${esc(lgF.text || 'Sua Marca')}</span><span class="lg-fmeta"><b>${esc(f.family)}</b><small>${esc(lgCatLabel(f.cat))} · ${lgWeightsOf(f.family).length} peso(s)</small></span><i class="lg-fstar ${fav ? 'on' : ''}" title="Favorita" onclick="event.stopPropagation();lgFontFav('${esc(f.family)}')">${fav ? '★' : '☆'}</i></button>`;
}
function lgFontsPage(p, r) {
  const list = lgFontList(), shown = list.slice(0, lgF.shown), edit = lgF.mode === 'edit', fav = lg.brief.fontFavs || [];
  r.innerHTML = `<div class="page-head"><div><h1>${edit ? 'Escolher fonte do logo' : 'Fontes favoritas para os logos'}</h1><p>${edit ? 'Veja cada família com o nome da sua marca, escolha o peso e o par para o slogan.' : 'Marque com ★ as fontes que você quer ver nos logos tipográficos. Elas passam na frente na geração.'}</p></div><div class="actions">${projectSelect()}<button class="btn" onclick="lgFontsDone(${edit ? 'false' : 'true'})">${edit ? '← Cancelar' : 'Concluir'}</button></div></div>
  <div class="lg-fonts"><div class="lg-flist"><div class="row-gap" style="margin-bottom:8px"><input class="lg-search" id="lgFq" placeholder="Buscar fonte…" value="${esc(lgF.q)}" oninput="lgF.q=this.value;lgF.shown=36;lgFontsRefresh()"><input class="lg-search" style="max-width:240px" placeholder="Texto de teste" value="${esc(lgF.text)}" oninput="lgF.text=this.value;lgFontsRefresh()"></div>
    <div class="tchips" style="margin-bottom:8px"><button class="tchip ${lgF.cat ? '' : 'on'}" onclick="lgF.cat='';lgF.shown=36;lgFontsRefresh()">Todas (${LG_TYPEFACES.length})</button>${LG_FONT_CATS.map(c => `<button class="tchip ${lgF.cat === c[0] ? 'on' : ''}" onclick="lgF.cat='${c[0]}';lgF.shown=36;lgFontsRefresh()">${esc(c[1])} (${LG_TYPEFACES.filter(f => f.cat === c[0]).length})</button>`).join('')}<button class="tchip ${lgF.onlyFav ? 'on' : ''}" onclick="lgF.onlyFav=!lgF.onlyFav;lgFontsRefresh()">★ Favoritas (${fav.length})</button></div>
    <div class="lg-fgrid" id="lgFgrid">${shown.map(lgFontCard).join('') || '<small class="muted">Nenhuma fonte encontrada.</small>'}</div>${list.length > shown.length ? `<div class="row-gap" style="margin-top:10px"><button class="btn" onclick="lgF.shown+=36;lgFontsRefresh()">Mostrar mais (${list.length - shown.length})</button></div>` : ''}</div>
  ${edit ? `<div class="lg-fdetail" id="lgFdetail">${lgFontDetail()}</div>` : ''}</div>`;
  lgFontsLoad(shown.map(f => f.family)); if (edit) lgFontPaint();
}
function lgFontsRefresh() { const s = $('lgFq'), pos = s ? s.selectionStart : 0; renderDesign(); const n = $('lgFq'); if (n && lgF.q) { n.focus(); n.setSelectionRange(pos, pos); } }
async function lgFontsLoad(fams) { await ensureFonts(fams); }
function lgFontPick(fam) {
  if (lgF.mode !== 'edit') { lgFontFav(fam); return; }
  lgF.sel = fam; lgF.hw = lgDefaultWeight(fam); lgF.tf = lgPairs(fam, 4)[0]; lgF.tw = 400; document.querySelectorAll('.lg-fcard').forEach(el => el.classList.toggle('on', el.dataset.fam === fam)); lgFontDetailRefresh();
}
function lgFontFav(fam) { const b = lg.brief; b.fontFavs = b.fontFavs || []; tog(b.fontFavs, fam); renderDesign(); }
function lgFontDetail() {
  const f = lgF.sel, ws = lgWeightsOf(f), pairs = lgPairs(f, 4), tg = (lg.cur && lg.cur.tag) || (lg.brief && lg.brief.tag) || 'Seu slogan aqui', cat = (LG_TF[f] || {cat: 'sans'}).cat;
  return `<div class="okr-label">FAMÍLIA SELECIONADA</div><h3 style="margin:2px 0 2px;font-family:'${esc(f)}',system-ui">${esc(f)}</h3><small class="muted block">${esc(lgCatLabel(cat))} · pesos disponíveis: ${ws.map(w => w).join(', ')}</small>
  <canvas id="lgFprev" width="620" height="300" style="width:100%;border:1px solid #e6e6e6;border-radius:12px;margin:10px 0"></canvas>
  <div class="okr-label">PESOS DA FAMÍLIA <small class="muted">(clique para escolher)</small></div><div class="lg-wlist">${ws.map(w => `<button class="lg-w ${lgF.hw === w ? 'on' : ''}" onclick="lgF.hw=${w};lgFontDetailRefresh()"><span style="font-family:'${esc(f)}',system-ui;font-weight:${w};font-size:22px">${esc(lgF.text || 'Sua Marca')}</span><small>${esc(LG_WEIGHT_NAMES[w] || w)} · ${w}</small></button>`).join('')}</div>
  <div class="okr-label" style="margin-top:12px">FONTE DE APOIO (SLOGAN) · PARES SUGERIDOS</div><div class="lg-wlist">${pairs.map(t => `<button class="lg-w ${lgF.tf === t ? 'on' : ''}" onclick="lgF.tf='${esc(t)}';lgF.tw=400;lgFontDetailRefresh()"><span style="font-family:'${esc(t)}',system-ui;font-size:15px">${esc(tg)}</span><small>${esc(t)}</small></button>`).join('')}</div>
  <label class="ins" style="margin-top:8px">Ou escolha outra para o slogan<select onchange="lgF.tf=this.value;lgF.tw=400;lgFontDetailRefresh()">${LG_TYPEFACES.filter(x => x.cat !== 'script' && x.cat !== 'display').map(x => `<option ${x.family === lgF.tf ? 'selected' : ''}>${esc(x.family)}</option>`).join('')}</select></label>
  <div class="row-gap" style="margin-top:14px"><button class="btn dark" onclick="lgFontsDone(true)">Usar esta fonte</button><button class="btn" onclick="lgFontsDone(false)">Cancelar</button></div>`;
}
async function lgFontDetailRefresh() { const el = $('lgFdetail'); if (!el) return; el.innerHTML = lgFontDetail(); await ensureFonts([lgF.sel, lgF.tf]); el.innerHTML = lgFontDetail(); lgFontPaint(); }
async function lgFontPaint() { const cv = $('lgFprev'); if (!cv || !lg.cur) return; await ensureFonts([lgF.sel, lgF.tf, lgF.hf2].filter(Boolean)); const t = Object.assign({}, lg.cur, {hf: lgF.sel, hw: lgF.hw, tf: lgF.tf, tw: lgF.tw, name: lgF.text || lg.cur.name}); if (lgF.hf2) t.hf2 = lgF.hf2; await lgPaint(cv, t); }
function lgFontsDone(apply) {
  if (lgF.mode === 'edit') { if (apply && lgF.sel) { const c = lg.cur; Object.assign(c, {hf: lgF.sel, hw: lgF.hw, tf: lgF.tf, tw: lgF.tw}); if (lgIsType(c) && c.up == null) { const cat = (LG_TF[lgF.sel] || {}).cat; c.up = cat === 'script' ? false : c.up; } } lg.view = 'edit'; }
  else lg.view = 'brief';
  renderDesign();
}
