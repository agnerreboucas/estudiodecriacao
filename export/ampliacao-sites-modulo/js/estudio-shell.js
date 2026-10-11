/* ===== Estúdio de Sites: a casca do produto (Início, cabeçalho com etapas, Desenvolvimento e página do cliente).
   É a estrutura do modelo aprovado (Início → Briefing → Banco de templates → Desenvolvimento), ligada ao motor real do Studio:
   páginas por blocos (lpHTML), BrandScript, exportação em HTML/ZIP/Elementor/tema de WordPress e Mesa de páginas.
   Não mexe no Estúdio de Design: só usa as mesmas funções. ===== */
const ES = {site: '', page: '', sel: '', device: 'desk', sy: 0, busy: '', t: 0};
const esSteps0 = () => [['briefing', 'Briefing'], ['templates', 'Template'], ['dev', 'Edição'], ['dev', 'Entrega']];
const esSiteOf = p => (p.sites || []).find(s => s.id === ES.site) || (p.sites || [])[0] || null;
function esStatus(p) {
  const nS = (p.sites || []).length, a = sbProgress(p)[0];
  return nS ? ['Em edição', 'ok'] : a ? ['Escolher template', ''] : ['Briefing', ''];
}
/* ---------- cabeçalho e etapas ---------- */
function esPicker() {
  return `<label class="es-pick">Projeto <select onchange="esPick(this.value)" aria-label="Projeto atual">${state.projects.map(p => `<option value="${p.id}"${p.id === state.activeProjectId ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}</select></label>`;
}
function esPick(id) { setActiveProject(id); ES.site = ''; ES.page = ''; ES.sel = ''; SBR.log = null; renderPage(ui.page); }
function esStepper() {
  const p = curProject(); if (!p || ui.page === 'home' || ui.page === 'cliente') return '';
  const has = (p.sites || []).length > 0, n = sbProgress(p)[0], cur = {briefing: 0, templates: 1, dev: 2}[ui.page], done = [n > 0, has, has && cur === 3, false];
  return `<div class="es-steps">${esSteps0().map((s, i) => `<button class="es-step${i === cur ? ' cur' : ''}${done[i] && i !== cur ? ' done' : ''}" onclick="${i === 3 ? "go('dev');setTimeout(()=>{const e=$('esDeliver');if(e)e.scrollIntoView({behavior:'smooth',block:'center'})},150)" : `go('${s[0]}')`}"><b>${done[i] && i !== cur ? '✓' : i + 1}</b>${s[1]}</button>`).join('')}</div>`;
}
function esHead(title, sub, extra) {
  return `<div class="es-top"><div><h1>${title}</h1><p class="es-sub">${sub}</p></div><div class="es-tr">${state.projects.length ? esPicker() : ''}${extra || ''}<button class="btn" onclick="openWizard()">Novo projeto</button></div></div>${esStepper()}`;
}
/* ---------- Início ---------- */
const ES_FLOW = [['Topo', 'Promessa clara do resultado e botão de ação'], ['Problema', 'O que o cliente vive por fora e por dentro'], ['Guia', 'Empatia e autoridade: por que confiar'], ['Plano', 'Três passos simples até o resultado'], ['Oferta e prazo', 'O que vende e em quanto tempo entrega'], ['Prova', 'Depoimento e garantia reais'], ['Objeções', 'As dúvidas que travam a compra, respondidas'], ['Fracasso e sucesso', 'O que perde se não agir e o que ganha'], ['Chamada final', 'Ação direta e, se houver, uma transitória']];
function esCard(p) {
  const [st, c] = esStatus(p), site = (p.sites || [])[0], t = site && SBT.find(x => x.id === site.style);
  return `<button class="es-pcard" onclick="esOpen('${p.id}')"><span class="es-tag ${c}">${st}</span><h3>${esc(p.name)}</h3><p>${esc([sbFacts(p).cidade, (sbFacts(p).prods[0] || {}).tipo].filter(Boolean).join(' · ') || 'Briefing vazio')}</p><p>${site ? 'Site: ' + esc(site.name) + (t ? ' · ' + esc(t.nome) : '') : 'Sem site ainda'}</p></button>`;
}
function esOpen(id) { setActiveProject(id); ES.site = ''; ES.page = ''; ES.sel = ''; const p = curProject(), st = esStatus(p)[0]; go(st === 'Briefing' ? 'briefing' : st === 'Escolher template' ? 'templates' : 'dev'); }
function renderEsHome() {
  const root = $('homeRoot'); if (!root) return; const ps = state.projects;
  root.innerHTML = `<div class="es-top"><div><h1>O site é o seu melhor vendedor</h1><p class="es-sub">Todo site da base segue o BrandScript do StoryBrand: o cliente é o herói e a empresa é o guia que entrega a melhor solução.</p></div><div class="es-tr"><button class="btn pri" onclick="openWizard()">Novo projeto</button></div></div>
    <div class="es-flow"><div><strong>1. Briefing</strong><span>Receba o cliente por texto corrido, formulário completo ou link para ele preencher.</span></div><div><strong>2. Template</strong><span>Escolha um modelo da base. A estrutura de venda é a mesma em todos.</span></div><div><strong>3. Edição</strong><span>Ajuste o texto direto na página e confira o checklist de venda.</span></div><div><strong>4. Entrega</strong><span>Baixe em HTML, ZIP, modelo do Elementor ou tema de WordPress.</span></div></div>
    <div class="panel es-p"><h2>A conversa de venda que todo site faz</h2><p class="es-note">Ordem fixa de cima para baixo. Você pode ocultar ou mover blocos na edição.</p><ol class="es-sbl">${ES_FLOW.map(x => `<li><strong>${x[0]}</strong><span>${x[1]}</span></li>`).join('')}</ol></div>
    <div class="panel es-p"><h2>Seus projetos</h2>${ps.length ? `<div class="es-pcards">${ps.map(esCard).join('')}</div>` : '<p class="es-note">Nenhum projeto ainda. Crie o primeiro para começar o briefing do cliente.</p><button class="btn pri" onclick="openWizard()">Novo projeto</button>'}</div>`;
}
function renderHome() { renderEsHome(); }

/* ---------- Desenvolvimento ---------- */
const ES_INJECT = [
  '(function(){var st=document.createElement("style");st.textContent="[data-bk]{cursor:pointer}[data-bk]:hover>*{outline:2px dashed rgba(255,106,24,.75);outline-offset:-2px}[data-bk].sel>*{outline:3px solid #ff6a18!important;outline-offset:-3px}";document.head.appendChild(st);',
  'function mark(id){document.querySelectorAll("[data-bk]").forEach(function(e){e.classList.toggle("sel",e.getAttribute("data-bk")===id)})}',
  'mark(window.__sel);if(window.__sy)window.scrollTo(0,window.__sy);',
  'document.addEventListener("click",function(e){var a=e.target.closest("a");if(a){e.preventDefault();var h=a.getAttribute("href")||"";if(/\\.html/.test(h))parent.postMessage({es:"nav",href:h},"*")}var b=e.target.closest("[data-bk]");if(b){mark(b.getAttribute("data-bk"));parent.postMessage({es:"sel",id:b.getAttribute("data-bk")},"*")}},true);',
  'window.addEventListener("scroll",function(){parent.postMessage({es:"sy",y:window.scrollY},"*")});',
  'window.addEventListener("message",function(e){if(e.data&&e.data.es==="mark"){mark(e.data.id);var t=document.querySelector("[data-bk=\\""+e.data.id+"\\"]");if(t&&e.data.go)t.scrollIntoView({block:"center",behavior:"smooth"})}});',
  'document.addEventListener("submit",function(e){e.preventDefault()},true);})();'].join('');
const esPageOf = p => { const s = esSiteOf(p); return s ? p.landings.filter(l => l.siteId === s.id) : []; };
const esCur = p => esPageOf(p).find(l => l.id === ES.page) || esPageOf(p)[0] || null;
function esPending(p) {
  const out = [], rx = /\[CONFIRMAR[^\]]*\]/g;
  esPageOf(p).forEach(l => (l.blocks || []).filter(b => b.on).forEach(b => { const txt = JSON.stringify([b.title, b.text, b.note, b.price, b.items, b.yes, b.no]); (txt.match(rx) || []).forEach(m => out.push({lid: l.id, bid: b.id, page: l.navLabel || l.name, blk: (LP_BLOCK[b.t] || {}).label || b.t, m})); }));
  return out;
}
function esChecklist(p, s) {
  const f = sbFacts(p), bs = s.bs || {}, ok = x => !!String(x || '').trim(), pr = f.prods[0] || {};
  return [['Cliente definido', ok(bs.who)], ['Problema (por fora)', ok(bs.external)], ['Problema (por dentro)', ok(bs.internal)], ['Autoridade do guia', ok(bs.authority)], ['Plano em 3 passos', ok(bs.step1) && ok(bs.step2) && ok(bs.step3)], ['Produtos e serviços', f.prods.length > 0], ['Prazo de entrega ou atendimento', f.prods.some(x => x.prazo)], ['Prova real (depoimento autorizado)', f.dep.length > 0], ['Objeções levantadas', f.objecoes.length > 0 || f.prods.some(x => x.perguntas.length || x.objecoes.length)], ['Resultado que ele ganha', ok(bs.success)], ['Risco de não agir', ok(bs.failure)], ['Chamada para ação', ok(bs.direct) && !!f.whats], ['Tom de voz da marca', f.tomN > 0], ['3 ou mais fotos', (Array.isArray(sbAns(p).arquivos) ? sbAns(p).arquivos : []).filter(x => ['fotos', 'produtos'].includes(x.cat)).length >= 3]];
}
function renderDev() {
  const root = $('devRoot'); if (!root) return; const p = curProject();
  const head = esHead('Desenvolvimento', 'Clique em qualquer seção da página para editar. As marcas amarelas são dados que ainda faltam.');
  if (!p) { root.innerHTML = esHead('Desenvolvimento', 'Aqui o site do cliente é editado.') + '<div class="panel es-empty">Crie um projeto para começar.<br><br><button class="btn pri" onclick="openWizard()">Novo projeto</button></div>'; return; }
  const s = esSiteOf(p);
  if (!s) { const hasBf = sbProgress(p)[0] > 0; root.innerHTML = head + `<div class="panel es-empty">Este projeto ainda não tem site.<br><br><button class="btn pri" onclick="go('${hasBf ? 'templates' : 'briefing'}')">${hasBf ? 'Escolher um template' : 'Ir ao briefing'}</button></div>`; return; }
  ES.site = s.id; const pages = esPageOf(p), l = esCur(p); ES.page = l ? l.id : '';
  const pend = esPending(p), ck = esChecklist(p, s), n = ck.filter(x => x[1]).length, t = SBT.find(x => x.id === s.style), ready = typeof aiReady === 'function' && aiReady();
  const sections = l ? (l.vis ? '<p class="es-note">Esta página foi editada no editor visual. Edite as seções por lá.</p>' : `<ul class="es-secs">${l.blocks.map((b, i) => `<li class="${b.on ? '' : 'off'}${ES.sel === b.id ? ' sel' : ''}"><span onclick="esSelect('${b.id}',true)">${esc((LP_BLOCK[b.t] || {}).label || b.t)}</span><button class="es-mini" ${i === 0 ? 'disabled' : ''} onclick="esMove('${b.id}',-1)" aria-label="Subir">↑</button><button class="es-mini" ${i === l.blocks.length - 1 ? 'disabled' : ''} onclick="esMove('${b.id}',1)" aria-label="Descer">↓</button><button class="es-mini" onclick="esToggle('${b.id}')">${b.on ? 'Ocultar' : 'Mostrar'}</button></li>`).join('')}</ul>`) : '';
  root.innerHTML = head + `<div class="es-dev"><div class="es-tools">
    <div class="panel es-p"><label class="es-f">Template (visual)<select onchange="esSwap(this.value)"><option value="">${t ? '' : 'Personalizado'}</option>${SBT.map(x => `<option value="${x.id}"${x.id === s.style ? ' selected' : ''}>${esc(x.nome)} · ${esc(x.nicho)}</option>`).join('')}</select></label><p class="es-note">Trocar o template muda só o visual. O texto e as seções ficam.</p></div>
    <div class="panel es-p"><strong class="es-h">Seções desta página</strong>${sections}</div>
    <div class="panel es-p"><strong class="es-h">Pendências <span class="es-tag warn">${pend.length}</span></strong><div class="es-pend">${pend.length ? pend.slice(0, 40).map(x => `<button onclick="esJump('${x.lid}','${x.bid}')" title="${esc(x.page + ' · ' + x.blk)}">${esc(x.m)}</button>`).join('') : '<span class="es-note">Nada pendente.</span>'}${pend.length > 40 ? `<span class="es-note">e mais ${pend.length - 40}…</span>` : ''}</div></div>
    <div class="panel es-p"><strong class="es-h">Vendedor consultivo <span class="es-tag ${n === ck.length ? 'ok' : ''}">${n} de ${ck.length}</span></strong><ul class="es-cl">${ck.map(x => `<li class="${x[1] ? 'y' : 'n'}">${x[0]}</li>`).join('')}</ul><button class="btn sm" onclick="SBR.tab='form';go('briefing')" style="margin-top:8px">Completar no briefing</button></div>
    <div class="panel es-p" id="esDeliver"><strong class="es-h">Entregar</strong><div class="es-col"><button class="btn sm" onclick="lpExport('${l ? l.id : ''}')">HTML desta página</button><button class="btn sm" onclick="siteExport('${s.id}')">ZIP do site</button><button class="btn sm" onclick="wpElOpen('site','${s.id}')">Modelo do Elementor</button><button class="btn sm" onclick="wpGenerate('${s.id}','theme')">Tema de WordPress</button><button class="btn sm" onclick="wpGenerate('${s.id}','bundle')">Pacote WordPress completo</button></div></div>
    <div class="panel es-p"><strong class="es-h">Mais</strong><div class="es-col"><button class="btn sm" ${ready ? '' : 'disabled title="Ligue a IA em Configurações"'} onclick="esAI()">Reescrever todas as páginas com IA</button><button class="btn sm" onclick="esRegen()">Refazer textos do briefing</button><button class="btn sm" onclick="esAdvanced()">Editor de blocos e editor visual</button><button class="btn sm" onclick="go('mesa')">Mesa de páginas</button></div></div>
  </div><div class="es-center"><div class="es-bar"><div class="es-pages">${pages.map(x => `<button class="chip${x.id === ES.page ? ' on' : ''}" onclick="esPage('${x.id}')">${esc(x.navLabel || x.name)}</button>`).join('')}</div><div class="es-seg"><button class="${ES.device === 'desk' ? 'on' : ''}" onclick="ES.device='desk';esDevice()">Computador</button><button class="${ES.device === 'mob' ? 'on' : ''}" onclick="ES.device='mob';esDevice()">Celular</button></div></div>
    <div class="es-stage"><div class="es-frame${ES.device === 'mob' ? ' mob' : ''}" id="esFrameBox"><iframe id="esFrame" sandbox="allow-scripts" title="Prévia do site"></iframe></div></div></div>
  <div class="es-edit" id="esEdit"></div></div>`;
  esBlockEditor(); esFit(); esPreview();
}
/* computador: a página é desenhada com 1060px de largura e reduzida para caber na área; celular: 390px reais */
function esFit() {
  const box = $('esFrameBox'), fr = $('esFrame'), st = box && box.parentElement; if (!box || !fr || !st) return; const H = Math.round(window.innerHeight * 0.78);
  if (ES.device === 'mob') { fr.style.cssText = 'width:100%;height:' + H + 'px;transform:none'; box.style.height = H + 'px'; return; }
  const W = st.clientWidth - 30, k = Math.min(1, W / 1060); fr.style.cssText = 'width:' + Math.round(W / k) + 'px;height:' + Math.round(H / k) + 'px;transform:scale(' + k + ');transform-origin:0 0'; box.style.height = H + 'px';
}
window.addEventListener('resize', () => { if (ui.page === 'dev') esFit(); });
async function esPreview() {
  const p = curProject(), l = esCur(p), fr = $('esFrame'); if (!l || !fr) return; const my = ++ES.t;
  let h = await lpHTML(l, p, {preview: true, edit: true}); if (my !== ES.t) return;
  h = h.replace(/<\/body>/i, '<script>window.__sy=' + (+ES.sy || 0) + ';window.__sel=' + JSON.stringify(ES.sel || '') + ';' + ES_INJECT + '<\/script></body>'); fr.srcdoc = h;
}
const esPreviewLater = (() => { let h; return () => { clearTimeout(h); h = setTimeout(esPreview, 350); }; })();
function esPage(id) { ES.page = id; ES.sel = ''; ES.sy = 0; renderDev(); }
function esSelect(bid, scroll) {
  ES.sel = bid; esBlockEditor(); document.querySelectorAll('.es-secs li').forEach(li => li.classList.remove('sel'));
  const fr = $('esFrame'); if (fr && fr.contentWindow) fr.contentWindow.postMessage({es: 'mark', id: bid, go: !!scroll}, '*');
  const p = curProject(), l = esCur(p), i = l ? l.blocks.findIndex(b => b.id === bid) : -1, li = document.querySelectorAll('.es-secs li')[i]; if (li) li.classList.add('sel');
}
function esJump(lid, bid) { if (lid !== ES.page) { ES.page = lid; ES.sel = bid; ES.sy = 0; renderDev(); setTimeout(() => esSelect(bid, true), 700); } else esSelect(bid, true); }
function esMove(bid, d) { const l = esCur(curProject()), i = l.blocks.findIndex(b => b.id === bid), j = i + d; if (j < 0 || j >= l.blocks.length) return; [l.blocks[i], l.blocks[j]] = [l.blocks[j], l.blocks[i]]; persist(); renderDev(); }
function esToggle(bid) { const l = esCur(curProject()), b = l.blocks.find(x => x.id === bid); b.on = !b.on; persist(); renderDev(); }
function esSwap(tid) {
  if (!tid) return; const p = curProject(), s = esSiteOf(p), t = SBT.find(x => x.id === tid), f = sbFacts(p); s.style = tid;
  esPageOf(p).forEach(l => { l.theme = Object.assign({}, l.theme, sbThemeFor(t, f)); }); persist(); renderDev(); toast('Template ' + t.nome + ' aplicado. O texto foi mantido.');
}
/* editor da seção escolhida */
function esBlockEditor() {
  const box = $('esEdit'); if (!box) return; const p = curProject(), l = esCur(p), b = l && l.blocks.find(x => x.id === ES.sel);
  if (!b) { box.innerHTML = '<div class="panel es-p"><strong class="es-h">Editar seção</strong><p class="es-note">Clique em uma seção da página (ou na lista à esquerda) para editar o texto.</p></div>'; return; }
  const def = LP_BLOCK[b.t] || {label: b.t, fields: []};
  box.innerHTML = `<div class="panel es-p"><strong class="es-h">${esc(def.label)}</strong>${def.fields.map(([k, lab, kind]) => {
    if (kind === 'line') return `<label class="es-f">${esc(lab)}<input value="${esc(b[k] || '')}" oninput="esSet('${k}',this.value)"></label>`;
    if (kind === 'area') return `<label class="es-f">${esc(lab)}<textarea rows="4" oninput="esSet('${k}',this.value)">${esc(b[k] || '')}</textarea></label>`;
    if (kind === 'list') return `<label class="es-f">${esc(lab)}<small>Um por linha</small><textarea rows="4" oninput="esSetList('${k}',this.value)">${esc((b[k] || []).join('\n'))}</textarea></label>`;
    if (kind === 'img') return `<div class="es-f">${esc(lab)}<div class="es-row">${b[k] ? '<img class="es-th" data-lib="' + esc(b[k]) + '" alt="">' : ''}<button class="btn sm" onclick="esImg('${k}')">${b[k] ? 'Trocar' : 'Escolher da biblioteca'}</button>${b[k] ? `<button class="btn sm" onclick="esImg('${k}',true)">Tirar</button>` : ''}</div></div>`;
    if (kind.startsWith('items')) { const [a, c] = kind.split(':')[1].split('/'); return `<div class="es-f">${esc(lab)}${(b.items || []).map((it, i) => `<div class="es-it"><input placeholder="${esc(a)}" value="${esc(it.t || '')}" oninput="esItem(${i},'t',this.value)"><textarea rows="2" placeholder="${esc(c)}" oninput="esItem(${i},'d',this.value)">${esc(it.d || '')}</textarea><button class="es-mini" onclick="esItemDel(${i})" aria-label="Remover">×</button></div>`).join('')}<button class="btn sm" onclick="esItemAdd()">+ Adicionar</button></div>`; }
    return '';
  }).join('')}<button class="btn sm" onclick="ES.sel='';esBlockEditor();esPreview()" style="margin-top:6px">Fechar</button></div>`;
  if (typeof libFill === 'function') libFill(box);
}
function esBlk() { const l = esCur(curProject()); return [l, l && l.blocks.find(x => x.id === ES.sel)]; }
function esDirty(l, b) { if (b.t === 'hero') { l.headline = b.title; l.sub = b.text; l.cta = b.cta || l.cta; } persist(); esPreviewLater(); }
function esSet(k, v) { const [l, b] = esBlk(); if (!b) return; b[k] = v; esDirty(l, b); }
function esSetList(k, v) { const [l, b] = esBlk(); if (!b) return; b[k] = v.split('\n').map(x => x.trim()).filter(Boolean); esDirty(l, b); }
function esItem(i, k, v) { const [l, b] = esBlk(); if (!b || !b.items[i]) return; b.items[i][k] = v; esDirty(l, b); }
function esItemAdd() { const [l, b] = esBlk(); if (!b) return; b.items.push({t: '', d: ''}); esDirty(l, b); esBlockEditor(); }
function esItemDel(i) { const [l, b] = esBlk(); if (!b) return; b.items.splice(i, 1); esDirty(l, b); esBlockEditor(); }
function esImg(k, clear) { const [l, b] = esBlk(); if (!b) return; if (clear) { b[k] = ''; persist(); esBlockEditor(); esPreview(); return; } libPick(r => { b[k] = r.id; persist(); esBlockEditor(); esPreview(); }); }
/* ações do site */
function esRegen() {
  if (!confirm('Refazer o BrandScript e o texto de todas as páginas a partir do briefing? As edições feitas à mão nas páginas serão substituídas.')) return;
  const p = curProject(), s = esSiteOf(p), f = sbFacts(p), bs = sbBS(f); s.bs = Object.assign({}, s.bs, bs);
  esPageOf(p).forEach(l => { if (!l.vis) { lpMerge(l, sbBlocksFor(l, f, bs, l.siteRole)); const h = l.blocks.find(b => b.t === 'hero'); if (h && f.foto) h.imgId = f.foto; } });
  persist(); renderDev(); toast('Textos refeitos a partir do briefing.');
}
async function esAI() { const p = curProject(), s = esSiteOf(p); if (!siteBSText(s)) { toast('Preencha o briefing antes: o BrandScript está vazio.'); return; } lpUI.site = s.id; toast('A IA está reescrevendo as páginas…'); try { await siteGenAll(); } catch (e) { toast(e.message); } renderDev(); }
function esAdvanced() { const p = curProject(), s = esSiteOf(p), l = esCur(p); lpUI.main = 'sites'; lpUI.site = s.id; if (l) { lpOpen(l.id); } go('landings'); }

/* ---------- página do cliente (o mesmo formulário do link, para preencher ao vivo ou conferir) ---------- */
let esSent = false, esErr = [];
function renderCliente() {
  const root = $('clienteRoot'); if (!root) return; const p = curProject(); if (!p) { root.innerHTML = ''; return; }
  if (esSent) { root.innerHTML = `<div class="es-cl-page"><div class="panel es-p" style="text-align:center;padding:36px"><h1>Recebemos tudo</h1><p class="es-sub">Obrigado${sbGet(p, 'contato|nome') ? ', ' + esc(sbGet(p, 'contato|nome')) : ''}. Vamos montar o seu site com o que você enviou.</p><button class="btn" onclick="esVoltar()">Voltar ao estúdio</button></div></div>`; return; }
  const [n, t] = sbProgress(p);
  root.innerHTML = `<div class="es-cl-page"><div class="es-clnote">Simulação da página que o cliente recebe pelo link (o link real é o <span class="es-mono">briefing.html</span>). <button class="btn sm" onclick="esVoltar()">Voltar ao estúdio</button></div>
    <div><h1>Vamos criar o site da sua marca</h1><p class="es-sub">Responda no seu tempo. Tudo salva sozinho e você pode fechar e voltar pelo mesmo link.</p></div>
    <div class="es-prog"><div><i style="width:${n / t * 100}%"></i></div><span>${n} de ${t} partes preenchidas</span></div>${sbFormHTML(p)}
    <label class="sb-ck" style="align-items:flex-start;margin:8px 0"><input type="checkbox"${sbAns(p).aceite ? ' checked' : ''} onchange="sbAns(curProject()).aceite=this.checked;persist()"><span>Autorizo o uso das informações e imagens enviadas para criar o meu site. <b class="es-rq">*</b></span></label>
    ${esErr.length ? `<div class="panel es-p es-err"><strong>Faltou preencher:</strong> ${esErr.map(esc).join(', ')}.</div>` : ''}<div class="es-row"><button class="btn pri" onclick="esEnviar()">Enviar ao estúdio</button><span class="es-note">Nesta simulação nada sai do seu computador.</span></div></div>`;
  if (typeof libFill === 'function') libFill(root);
}
function esEnviar() { const p = curProject(); esErr = bfMissing(sbAns(p)); if (!esErr.length) { esSent = true; const b = bfStore(p); b.status = 'enviado'; b.submittedAt = new Date().toISOString(); persist(); } renderCliente(); window.scrollTo(0, 0); }
function esVoltar() { esSent = false; esErr = []; SBR.tab = 'resumo'; go('briefing'); }
function esVerCliente() { esSent = false; esErr = []; go('cliente'); }
/* modo da página do cliente: sem menu lateral */
(function () { const g = go; go = function (page) { document.body.classList.toggle('es-solo', page === 'cliente'); return g.apply(this, arguments); }; })();
