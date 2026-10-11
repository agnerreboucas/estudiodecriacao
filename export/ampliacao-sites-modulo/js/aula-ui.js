/* ===== Sites de aula: tela de aulas (lista + editor com prévia ao vivo) ===== */
const AUS = {id: '', sel: '', step: '', dev: 'desk', tab: 'bloco', t: 0};
const auList = p => (p && p.aulas) || (p.aulas = []);
const auCur = p => auList(p || curProject()).find(a => a.id === AUS.id) || null;
const auSlideCur = a => a && (a.slides.find(s => s.id === AUS.sel) || a.slides[0] || null);
function auTarget(a) { const s = auSlideCur(a); if (!s) return null; if (a.mode === 'mapa' && AUS.step) { const st = s.steps.find(x => x.id === AUS.step); if (st) return st; } return s; }
const AU_STARTERS = [
  ['horizontal', 'Curso em faixas', 'Faixas de tela cheia que deslizam para o lado, com menu no topo, setas e barra de progresso. Bom para curso, projeto social, evento.', 'editorial'],
  ['mapa', 'Jornada em mapa', 'Um mapa com estações. Tocar numa estação dá zoom e abre os passos da aula, um de cada vez. Bom para aula ao vivo, projeção, série de encontros.', 'vivo'],
  ['vertical', 'Aula vertical', 'Seções empilhadas com rolagem encaixada e pontos de navegação. Bom para aula gravada, material de apoio, página de turma.', 'escuro']
];
const auPending = a => { const t = JSON.stringify(a.slides); return (t.match(/\[CONFIRMAR/g) || []).length; };
const auFileName = a => (typeof slug === 'function' ? slug(a.name) : 'aula') || 'aula';

/* ---------- tela ---------- */
function renderAulas() {
  const root = $('aulasRoot'); if (!root) return; const p = curProject();
  const head = esHead('Sites de aula', 'Aulas em HTML: faixas horizontais, rolagem vertical ou mapa com zoom. Carrosséis, antes e depois, perguntas e formulário dentro.');
  if (!p) { root.innerHTML = head + '<div class="panel es-empty">Crie um projeto para começar.<br><br><button class="btn pri" onclick="openWizard()">Novo projeto</button></div>'; return; }
  const a = auCur(p); if (!a) { AUS.id = ''; root.innerHTML = head + auListHTML(p); return; }
  root.innerHTML = auEditorHTML(p, a); auRightFill(); auLeftFill(); auFit(); auPreview();
}
function auListHTML(p) {
  const L = auList(p);
  return `<div class="au-new"><h3>Começar por um modelo</h3><div class="au-starters">${AU_STARTERS.map(([k, n, d]) => `<button class="au-st-c" onclick="auCreate('${k}')"><b>${esc(n)}</b><small>${esc(d)}</small><span class="btn sm pri">Criar</span></button>`).join('')}</div></div>
    <h3 style="margin:26px 0 10px">Aulas de ${esc(p.name)} (${L.length})</h3>${L.length ? `<div class="au-grid">${L.map(a => `<div class="au-card-l"><div><b>${esc(a.name)}</b><small>${esc(AU_MODES[a.mode])} · ${a.slides.length} ${a.mode === 'mapa' ? 'estações' : 'faixas'}${auPending(a) ? ` · <span style="color:#d9480f">${auPending(a)} a confirmar</span>` : ''}</small></div><div class="row-gap"><button class="btn sm pri" onclick="auOpen('${a.id}')">Abrir</button><button class="btn sm" onclick="auDup('${a.id}')">Duplicar</button><button class="btn sm" onclick="auDel('${a.id}')">Excluir</button></div></div>`).join('')}</div>` : '<p class="muted">Nenhuma aula ainda. Escolha um modelo acima.</p>'}`;
}
function auCreate(kind) { const p = curProject(); if (!p) { toast('Crie um projeto primeiro.'); return; } const a = auStarter(kind); a.brand = a.brand === 'Meu curso' || a.brand === 'Minha aula' ? (p.name || a.brand) : a.brand; a.name = a.name + ' · ' + p.name; auList(p).push(a); persist(); AUS.id = a.id; AUS.sel = a.slides[0].id; AUS.step = ''; AUS.tab = 'bloco'; if (typeof ui !== 'undefined' && ui.page !== 'aulas') go('aulas'); else renderAulas(); toast('Aula criada. O que falta está como [CONFIRMAR].'); }
function auOpen(id) { const p = curProject(), a = auList(p).find(x => x.id === id); if (!a) return; AUS.id = id; AUS.sel = a.slides[0] ? a.slides[0].id : ''; AUS.step = ''; AUS.tab = 'bloco'; renderAulas(); }
function auBack() { AUS.id = ''; renderAulas(); }
function auDup(id) { const p = curProject(), a = auList(p).find(x => x.id === id); if (!a) return; const c = normalizeAulas([JSON.parse(JSON.stringify(a))])[0]; c.id = auId(); c.name = a.name + ' (cópia)'; c.previewT = ''; c.slides.forEach(s => { s.id = auId(); (s.steps || []).forEach(x => { x.id = auId(); }); }); auList(p).push(c); persist(); renderAulas(); }
function auDel(id) { const p = curProject(), a = auList(p).find(x => x.id === id); if (!a || !confirm('Excluir a aula “' + a.name + '”?')) return; p.aulas = auList(p).filter(x => x.id !== id); if (AUS.id === id) AUS.id = ''; persist(); renderAulas(); }

/* ---------- editor ---------- */
function auEditorHTML(p, a) {
  return `<div class="au-ed">
    <div class="au-bar-t"><button class="btn sm" onclick="auBack()">‹ Aulas</button><input class="au-name" value="${esc(a.name)}" oninput="auCfg('name',this.value,true)" aria-label="Nome da aula"><span class="au-sp"></span>
      <div class="ps-seg">${[['desk', 'Computador'], ['tab', 'Tablet'], ['mob', 'Celular']].map(([k, n]) => `<button class="${AUS.dev === k ? 'on' : ''}" onclick="AUS.dev='${k}';auDev()">${n}</button>`).join('')}</div>
      <button class="btn sm" onclick="auOpenTab()">Abrir em outra aba</button><button class="btn sm" onclick="auDownload('html')">Baixar HTML</button><button class="btn sm" onclick="auDownload('zip')">ZIP com imagens</button><button class="btn sm pri" onclick="auPvwOpen()">Link para o cliente</button></div>
    <div class="au-body"><aside class="au-left" id="auLeft"></aside><div class="au-center"><div class="au-frame" id="auFrameBox" data-dev="${AUS.dev}"><iframe id="auFrame" title="Prévia da aula" sandbox="allow-scripts"></iframe></div></div><aside class="au-right" id="auRight"></aside></div></div>`;
}
function auDev() { const b = $('auFrameBox'); if (b) b.dataset.dev = AUS.dev; document.querySelectorAll('.au-bar-t .ps-seg button').forEach((x, i) => x.classList.toggle('on', ['desk', 'tab', 'mob'][i] === AUS.dev)); auFit(); }
/* a prévia é desenhada na largura real (1280, 820 ou 390 px) e reduzida para caber no quadro */
function auFit() {
  const box = $('auFrameBox'), fr = $('auFrame'), c = box && box.parentElement; if (!box || !fr || !c) return; const base = {desk: 1280, tab: 820, mob: 390}[AUS.dev] || 1280, W = c.clientWidth - 24, H = c.clientHeight - 24, k = Math.min(1, W / base);
  box.style.width = Math.round(base * k) + 'px'; box.style.height = H + 'px'; fr.style.cssText = 'width:' + base + 'px;height:' + Math.round(H / k) + 'px;transform:scale(' + k + ');transform-origin:0 0';
}
window.addEventListener('resize', () => { if (typeof ui !== 'undefined' && ui.page === 'aulas') auFit(); });
function auLeftFill() {
  const box = $('auLeft'), a = auCur(); if (!box || !a) return; const mapa = a.mode === 'mapa';
  box.innerHTML = `<div class="au-lh"><b>${mapa ? 'Estações' : 'Faixas'}</b><button class="btn sm pri" onclick="auAddSlide()">+ ${mapa ? 'Estação' : 'Bloco'}</button></div><ul class="au-sl">${a.slides.map((s, i) => `<li class="${s.id === AUS.sel && !AUS.step ? 'on' : ''}"><button class="au-sb" onclick="auSelect('${s.id}')"><i>${i + 1}</i><span>${esc(mapa ? s.title : (AU_L[s.layout] || {}).label ? s.label || AU_L[s.layout].label.split(' (')[0] : s.layout)}</span></button><span class="au-sa"><button onclick="auMove('${s.id}',-1)" ${i ? '' : 'disabled'} aria-label="Subir">↑</button><button onclick="auMove('${s.id}',1)" ${i < a.slides.length - 1 ? '' : 'disabled'} aria-label="Descer">↓</button><button onclick="auDupSlide('${s.id}')" aria-label="Duplicar" title="Duplicar">⧉</button><button onclick="auDelSlide('${s.id}')" aria-label="Excluir" title="Excluir">×</button></span></li>${mapa && s.id === AUS.sel ? `<li class="au-steps-l"><ul>${s.steps.map((x, j) => `<li class="${x.id === AUS.step ? 'on' : ''}"><button class="au-sb" onclick="auSelStep('${x.id}')"><i>${j + 1}</i><span>${esc(x.kicker || x.title || 'Passo')}</span></button><span class="au-sa"><button onclick="auStepMove('${x.id}',-1)" ${j ? '' : 'disabled'}>↑</button><button onclick="auStepMove('${x.id}',1)" ${j < s.steps.length - 1 ? '' : 'disabled'}>↓</button><button onclick="auStepDel('${x.id}')">×</button></span></li>`).join('')}<li><button class="btn sm" onclick="auAddStep()">+ Passo</button></li></ul></li>` : ''}`).join('')}</ul>`;
}
function auSelect(id) { AUS.sel = id; AUS.step = ''; AUS.tab = 'bloco'; auLeftFill(); auRightFill(); auGoPreview(); }
function auSelStep(id) { AUS.step = id; AUS.tab = 'bloco'; auLeftFill(); auRightFill(); auGoPreview(); }
function auSave(refreshAll) { persist(); clearTimeout(AUS.t); AUS.t = setTimeout(auPreview, 350); if (refreshAll) { auLeftFill(); } }
function auCfg(k, v, light) { const a = auCur(); if (!a) return; a[k] = k === 'name' ? String(v).slice(0, 120) : v; auSave(); if (!light) auRightFill(); }
function auTheme(k, v) { const a = auCur(); a.theme[k] = v; auSave(); }
function auNav(k, v) { const a = auCur(); a.nav[k] = v; auSave(); if (k === 'cta') return; auRightFill(); }
function auSetMode(m) { const a = auCur(); if (!a || a.mode === m) return; if (!confirm('Trocar o modo de navegação converte as faixas ' + (m === 'mapa' ? 'em estações (cada faixa vira uma estação com um passo)' : a.mode === 'mapa' ? 'de volta em blocos (cada passo vira uma faixa)' : '') + '. Continuar?')) { auRightFill(); return; }
  if (m === 'mapa') { a.slides = a.slides.map(s => normalizeAulas([{mode: 'mapa', slides: [{id: s.id, title: s.title ? String(s.title).replace(/\*/g, '').slice(0, 60) : (s.label || AU_L[s.layout].label.split(' (')[0]), phrase: '', steps: [Object.assign({}, s, {layout: s.layout === 'capa' ? 'passo' : s.layout})]}]}])[0].slides[0]); a.mode = 'mapa'; }
  else if (a.mode === 'mapa') { a.slides = a.slides.flatMap(s => s.steps.length ? s.steps.map(x => Object.assign({}, x, {label: x.label || s.title})) : []); a.mode = m; a.slides = normalizeAulas([{mode: m, slides: a.slides}])[0].slides; if (!a.slides.length) a.slides = [auNewBlock('texto')]; }
  else a.mode = m;
  AUS.sel = a.slides[0] ? a.slides[0].id : ''; AUS.step = ''; persist(); renderAulas(); }
function auAddSlide() {
  const a = auCur(); if (!a) return;
  if (a.mode === 'mapa') { const s = normalizeAulas([{mode: 'mapa', slides: [{title: 'Nova estação', phrase: auPH('ideia central'), color: ['#0B57D0', '#CD0002', '#2E9B2A', '#C99100'][a.slides.length % 4], icon: ['livro', 'coracao', 'pessoas', 'estrela', 'lampada', 'alvo'][a.slides.length % 6], steps: [auNewBlock('passo')]}]}])[0].slides[0]; a.slides.push(s); AUS.sel = s.id; AUS.step = ''; persist(); auLeftFill(); auRightFill(); auPreview(); return; }
  showModal('Que bloco entra?', `<div class="au-lay">${Object.entries(AU_L).filter(([k]) => k !== 'passo').map(([k, d]) => `<button class="au-lay-b" onclick="auAddLayout('${k}')"><b>${esc(d.label)}</b></button>`).join('')}</div>`);
}
function auAddLayout(k) { const a = auCur(), b = auNewBlock(k), i = a.slides.findIndex(s => s.id === AUS.sel); a.slides.splice(i < 0 ? a.slides.length : i + 1, 0, b); AUS.sel = b.id; closeModal(); persist(); auLeftFill(); auRightFill(); auPreview(); }
function auAddStep() { const a = auCur(), s = auSlideCur(a); if (!s) return; const b = auNewBlock('passo'); s.steps.push(b); AUS.step = b.id; persist(); auLeftFill(); auRightFill(); auPreview(); }
function auMove(id, d) { const a = auCur(), i = a.slides.findIndex(s => s.id === id), j = i + d; if (i < 0 || j < 0 || j >= a.slides.length) return; [a.slides[i], a.slides[j]] = [a.slides[j], a.slides[i]]; persist(); auLeftFill(); auPreview(); }
function auStepMove(id, d) { const s = auSlideCur(auCur()), i = s.steps.findIndex(x => x.id === id), j = i + d; if (i < 0 || j < 0 || j >= s.steps.length) return; [s.steps[i], s.steps[j]] = [s.steps[j], s.steps[i]]; persist(); auLeftFill(); auPreview(); }
function auDupSlide(id) { const a = auCur(), i = a.slides.findIndex(s => s.id === id); if (i < 0) return; const c = normalizeAulas([{mode: a.mode, slides: [JSON.parse(JSON.stringify(a.slides[i]))]}])[0].slides[0]; c.id = auId(); (c.steps || []).forEach(x => { x.id = auId(); }); a.slides.splice(i + 1, 0, c); AUS.sel = c.id; AUS.step = ''; persist(); auLeftFill(); auRightFill(); auPreview(); }
function auDelSlide(id) { const a = auCur(); if (a.slides.length < 2) { toast('A aula precisa de pelo menos um item.'); return; } if (!confirm('Excluir este item?')) return; a.slides = a.slides.filter(s => s.id !== id); if (AUS.sel === id) { AUS.sel = a.slides[0].id; AUS.step = ''; } persist(); auLeftFill(); auRightFill(); auPreview(); }
function auStepDel(id) { const s = auSlideCur(auCur()); if (s.steps.length < 2) { toast('A estação precisa de pelo menos um passo.'); return; } s.steps = s.steps.filter(x => x.id !== id); if (AUS.step === id) AUS.step = ''; persist(); auLeftFill(); auRightFill(); auPreview(); }

/* ---------- painel da direita ---------- */
function auDestOpts(a, cur) {
  const O = ['<option value="">Sem destino</option>']; a.slides.forEach((s, i) => O.push(`<option value="slide:${s.id}"${cur === 'slide:' + s.id ? ' selected' : ''}>${a.mode === 'mapa' ? 'Estação' : 'Faixa'} ${i + 1}: ${esc((a.mode === 'mapa' ? s.title : s.label) || '')}</option>`));
  O.push(`<option value="url:https://exemplo.com.br"${/^url:/.test(cur) ? ' selected' : ''}>Endereço de fora…</option>`); return O.join('');
}
function auFieldHTML(a, b, f, path) {
  const [k, lab, kind] = f, v = b[k], on = `auSet('${k}',this.value)`;
  if (kind === 'line') return `<label class="es-f">${esc(lab)}<input value="${esc(v || '')}" oninput="${on}"></label>`;
  if (kind === 'area') return `<label class="es-f">${esc(lab)}<textarea rows="${k === 'text' ? 6 : 3}" oninput="${on}">${esc(v || '')}</textarea></label>`;
  if (kind === 'date') return `<label class="es-f">${esc(lab)}<input type="date" value="${esc(v || '')}" onchange="${on}"></label>`;
  if (kind === 'color') return `<label class="es-f">${esc(lab)}<input type="color" value="${esc(v || '#0B57D0')}" onchange="${on}"></label>`;
  if (kind === 'bool') return `<label class="es-f" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" ${v ? 'checked' : ''} onchange="auSet('${k}',this.checked)"> ${esc(lab)}</label>`;
  if (kind === 'icon') return `<div class="es-f">${esc(lab)}<div class="au-icons">${Object.keys(AU_ICONS).map(i => `<button class="${v === i ? 'on' : ''}" title="${i}" onclick="auSet('icon','${i}',true)">${auSvg(i)}</button>`).join('')}</div></div>`;
  if (kind === 'dest') return `<label class="es-f">${esc(lab)}<select onchange="${on}">${auDestOpts(a, v || '')}</select>${/^url:/.test(v || '') ? `<input class="fx-url" value="${esc(v.slice(4))}" onchange="auSet('${k}',this.value?'url:'+this.value.trim():'')">` : ''}</label>`;
  if (kind.startsWith('sel:')) return `<label class="es-f">${esc(lab)}<select onchange="${on}">${kind.slice(4).split(',').map(o => { const [x, n] = o.split('|'); return `<option value="${x}"${v === x ? ' selected' : ''}>${esc(n)}</option>`; }).join('')}</select></label>`;
  if (kind === 'img') return auImgField(lab, v, b[k + 'Url'], `auImg('${k}')`, `auImg('${k}',true)`, `auSet('${k}Url',this.value,true)`);
  if (kind.startsWith('rows:')) {
    const spec = kind.slice(5).split(';').map(x => x.split('|')), rows = v || [];
    return `<div class="es-f">${esc(lab)}${rows.map((r, i) => `<div class="au-row"><div class="au-row-h"><b>${i + 1}</b><span class="au-sp"></span><button onclick="auRowMove('${k}',${i},-1)" ${i ? '' : 'disabled'}>↑</button><button onclick="auRowMove('${k}',${i},1)" ${i < rows.length - 1 ? '' : 'disabled'}>↓</button><button onclick="auRowDel('${k}',${i})" aria-label="Remover">×</button></div>${spec.map(([kk, ll, tt]) => tt === 'img' ? auImgField(ll, r[kk], r[kk + 'Url'], `auRowImg('${k}',${i},'${kk}')`, `auRowImg('${k}',${i},'${kk}',true)`, `auRowSet('${k}',${i},'${kk}Url',this.value,true)`) : tt === 'area' ? `<textarea rows="2" placeholder="${esc(ll)}" oninput="auRowSet('${k}',${i},'${kk}',this.value)">${esc(r[kk] || '')}</textarea>` : `<input placeholder="${esc(ll)}" value="${esc(r[kk] || '')}" oninput="auRowSet('${k}',${i},'${kk}',this.value)">`).join('')}</div>`).join('')}<button class="btn sm" onclick="auRowAdd('${k}')">+ Adicionar</button></div>`;
  }
  return '';
}
function auImgField(lab, id, url, pick, clear, onUrl) { return `<div class="es-f">${esc(lab)}<div class="es-row">${id ? `<img class="es-th" data-lib="${esc(id)}" alt="">` : ''}<button class="btn sm" onclick="${pick}">${id ? 'Trocar' : 'Escolher da biblioteca'}</button>${id ? `<button class="btn sm" onclick="${clear}">Tirar</button>` : ''}</div><input class="fx-url" placeholder="ou endereço da imagem (https://…)" value="${esc(url || '')}" oninput="${onUrl}"></div>`; }
function auRightFill() {
  const box = $('auRight'), a = auCur(); if (!box || !a) return; const t = auTarget(a), s = auSlideCur(a), isSt = a.mode === 'mapa' && s && t === s;
  const tabs = `<div class="ps-tabs"><button class="${AUS.tab === 'bloco' ? 'on' : ''}" onclick="AUS.tab='bloco';auRightFill()">${a.mode === 'mapa' ? (isSt ? 'Estação' : 'Passo') : 'Bloco'}</button><button class="${AUS.tab === 'aula' ? 'on' : ''}" onclick="AUS.tab='aula';auRightFill()">Aula</button></div>`;
  let body = '';
  if (AUS.tab === 'aula') body = auConfigHTML(a);
  else if (!t) body = '<p class="es-note">Adicione um item para editar.</p>';
  else if (isSt) body = `<div class="es-p"><strong class="es-h">Estação</strong>${AU_ESTACAO.map(f => auFieldHTML(a, t, f)).join('')}<p class="es-note">Os passos da estação ficam na lista da esquerda. Clique num passo para editar.</p></div>`;
  else { const def = AU_L[t.layout]; body = `<div class="es-p"><strong class="es-h">${esc(def.label)}</strong><label class="es-f">Nome no menu<input value="${esc(t.label || '')}" oninput="auSet('label',this.value)"></label>${def.f.map(f => auFieldHTML(a, t, f)).join('')}</div>`; }
  box.innerHTML = tabs + `<div class="au-rb">${body}</div>`; if (typeof libFill === 'function') libFill(box);
}
function auConfigHTML(a) {
  const sk = AU_SKINS[a.skin].v, th = a.theme, n = a.nav;
  return `<div class="es-p"><strong class="es-h">Navegação</strong><label class="es-f">Como a aula navega<select onchange="auSetMode(this.value)">${Object.entries(AU_MODES).map(([k, l]) => `<option value="${k}"${a.mode === k ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
    <label class="es-f" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" ${n.top ? 'checked' : ''} onchange="auNav('top',this.checked)"> Menu no topo</label>
    ${a.mode === 'horizontal' ? `<label class="es-f" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" ${n.arrows ? 'checked' : ''} onchange="auNav('arrows',this.checked)"> Setas</label><label class="es-f" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" ${n.progress ? 'checked' : ''} onchange="auNav('progress',this.checked)"> Barra de progresso</label>` : ''}
    <label class="es-f">Botão do topo (texto)<input value="${esc(n.cta || '')}" oninput="auNav('cta',this.value)" placeholder="Ex.: Inscreva-se"></label>${n.cta ? `<label class="es-f">Leva a<select onchange="auNav('ctaTo',this.value)">${auDestOpts(a, n.ctaTo)}</select></label>` : ''}
    <label class="es-f">Nome da marca<input value="${esc(a.brand || '')}" oninput="auCfg('brand',this.value,true)"></label>
    ${auImgField('Logo', a.logo, '', "auLogo()", "auLogo(true)", "void 0").replace(/<input class="fx-url"[^>]*>/, '')}
    <label class="es-f">Descrição (aparece ao compartilhar)<textarea rows="2" oninput="auCfg('desc',this.value,true)">${esc(a.desc || '')}</textarea></label></div>
    <div class="es-p"><strong class="es-h">Aparência</strong><label class="es-f">Estilo<select onchange="auSkin(this.value)">${Object.entries(AU_SKINS).map(([k, s]) => `<option value="${k}"${a.skin === k ? ' selected' : ''}>${esc(s.label)}</option>`).join('')}</select></label>
    <div class="au-cols"><label class="es-f">Destaque<input type="color" value="${th.accent || sk.accent}" onchange="auTheme('accent',this.value)"></label><label class="es-f">Fundo<input type="color" value="${th.bg || (/^#/.test(sk.bg) ? sk.bg : '#1565d8')}" onchange="auTheme('bg',this.value)"></label><label class="es-f">Texto<input type="color" value="${th.ink || (/^#/.test(sk.ink) ? sk.ink : '#ffffff')}" onchange="auTheme('ink',this.value)"></label></div>
    <label class="es-f">Fonte dos títulos<input list="auFonts" value="${esc(th.head || '')}" placeholder="${esc(sk.head)}" onchange="auTheme('head',this.value)"></label><label class="es-f">Fonte do texto<input list="auFonts" value="${esc(th.body || '')}" placeholder="${esc(sk.body)}" onchange="auTheme('body',this.value)"></label><datalist id="auFonts">${(typeof MZ_FONT_LIST !== 'undefined' ? MZ_FONT_LIST : []).map(f => `<option value="${esc(f)}">`).join('')}</datalist>
    <button class="btn sm" onclick="auResetTheme()">Voltar às cores do estilo</button><small class="es-note">As fontes vêm do Google Fonts: o nome precisa existir lá.</small></div>`;
}
function auSkin(k) { const a = auCur(); a.skin = k; a.theme = {accent: '', bg: '', ink: '', head: '', body: ''}; persist(); auRightFill(); auPreview(); }
function auResetTheme() { const a = auCur(); a.theme = {accent: '', bg: '', ink: '', head: '', body: ''}; persist(); auRightFill(); auPreview(); }
function auLogo(clear) { const a = auCur(); if (clear) { a.logo = ''; persist(); auRightFill(); auPreview(); return; } libPick(r => { a.logo = r.id; persist(); auRightFill(); auPreview(); }); }
/* edição de campos */
function auSet(k, v, redraw) { const a = auCur(), t = auTarget(a); if (!t) return; if (k === 'root' && v) { a.slides.forEach(s => { s.root = false; }); } t[k] = v; if (['dest'].includes(k)) redraw = true; auSave(k === 'title' || k === 'label' || k === 'kicker'); if (redraw) auRightFill(); }
function auImg(k, clear) { const a = auCur(), t = auTarget(a); if (clear) { t[k] = ''; auSave(); auRightFill(); return; } libPick(r => { t[k] = r.id; auSave(); auRightFill(); }); }
function auRowSet(k, i, kk, v, redraw) { const t = auTarget(auCur()); if (!t[k][i]) return; t[k][i][kk] = v; auSave(); if (redraw) auRightFill(); }
function auRowImg(k, i, kk, clear) { const t = auTarget(auCur()); if (clear) { t[k][i][kk] = ''; auSave(); auRightFill(); return; } libPick(r => { t[k][i][kk] = r.id; auSave(); auRightFill(); }); }
function auRowAdd(k) { const a = auCur(), t = auTarget(a), f = AU_L[t.layout].f.find(x => x[0] === k), spec = f[2].slice(5).split(';').map(x => x.split('|')), row = {}; spec.forEach(([kk, , tt]) => { if (tt === 'img') { row[kk] = ''; row[kk + 'Url'] = ''; } else row[kk] = ''; }); t[k].push(row); auSave(); auRightFill(); }
function auRowDel(k, i) { const t = auTarget(auCur()); t[k].splice(i, 1); auSave(); auRightFill(); }
function auRowMove(k, i, d) { const t = auTarget(auCur()), j = i + d; if (j < 0 || j >= t[k].length) return; [t[k][i], t[k][j]] = [t[k][j], t[k][i]]; auSave(); auRightFill(); }

/* ---------- prévia ---------- */
async function auPreview() {
  const a = auCur(), fr = $('auFrame'); if (!a || !fr) return; const my = ++AUS.n || (AUS.n = 1); AUS.n = my;
  try { const h = await auHTML(a, curProject(), {preview: true}); if (my !== AUS.n) return; fr.onload = () => auGoPreview(); fr.srcdoc = h; } catch (e) { toast('Prévia: ' + e.message); }
}
function auGoPreview() {
  const a = auCur(), fr = $('auFrame'); if (!a || !fr || !fr.contentWindow) return; const i = a.slides.findIndex(s => s.id === AUS.sel); if (i < 0) return;
  let msg = i; if (a.mode === 'mapa') { msg = AUS.sel ? i : -1; } fr.contentWindow.postMessage({auGo: msg}, '*');
}
async function auOpenTab() { const a = auCur(); if (!a) return; const h = await auHTML(a, curProject(), {preview: true}), u = URL.createObjectURL(new Blob([h], {type: 'text/html'})); window.open(u, '_blank'); setTimeout(() => URL.revokeObjectURL(u), 60000); }
async function auDownload(kind) {
  const a = auCur(), p = curProject(); if (!a) return; if (auPending(a)) toast(`Atenção: ${auPending(a)} item(ns) ainda como [CONFIRMAR].`); toast('Montando…');
  if (kind === 'html') { const h = await auHTML(a, p, {}); download(auFileName(a) + '.html', h, 'text/html'); toast('HTML único baixado: abra no navegador ou suba em qualquer hospedagem.'); return; }
  const f = await auFiles(a, p); download(auFileName(a) + '.zip', makeZip(f), 'application/zip'); toast('ZIP com index.html e as imagens em WebP (pasta img).');
}
async function auFiles(a, p) { const h = await auHTML(a, p, {}), ex = lpExtractImgs(h), enc = new TextEncoder(); return [{name: 'index.html', data: enc.encode(ex.html)}].concat(ex.files); }

/* ---------- galeria de modelos (aba "Sites de aula" do Banco de templates) ---------- */
function auGalleryHTML() {
  return `<p class="sb-note">Sites de aula são feitos para ensinar: faixas que deslizam, rolagem vertical ou um mapa com zoom. Saem em HTML. Escolha um modelo e edite na tela <b>Sites de aula</b>.</p><div class="au-starters">${AU_STARTERS.map(([k, n, d]) => `<div class="au-st-c" style="cursor:default"><div class="au-th" data-k="${k}"><iframe sandbox="allow-scripts" title="${esc(n)}" tabindex="-1"></iframe></div><b>${esc(n)}</b><small>${esc(d)}</small><button class="btn sm pri" onclick="auCreate('${k}');go('aulas')">Usar este modelo</button></div>`).join('')}</div>`;
}
async function auGalleryFill(root) {
  for (const th of root.querySelectorAll('.au-th')) { try { const a = auStarter(th.dataset.k); a.name = 'Exemplo'; th.querySelector('iframe').srcdoc = await auHTML(a, curProject() || {}, {preview: true}); } catch (e) { /* miniatura opcional */ } }
}
