/* ===== Landing pages (tela): lista → novo (tipo de produto) → editor com insumos, blocos, visual e publicar; prévia ao vivo (desktop/celular) ===== */
const lpUI = {id: '', tab: 'produto', open: {}, device: 'desktop', busy: '', useAgent: true};
const lpCur = () => { const p = curProject(); return p && p.landings.find(x => x.id === lpUI.id); };
const lpA = esc;

function renderLandings() {
  const r = $('landingsRoot'), p = curProject(); if (!r) return; if (!p) { r.innerHTML = noProject('Landing pages'); return; }
  if (lpUI.id && !lpCur()) lpUI.id = '';
  if (lpUI.id) return lpEditor(r, p, lpCur());
  eSrc.sink = null; eSrc.render = null;
  r.innerHTML = `<div class="page-head"><div><h1>Landing pages</h1><p>Escolha o tipo de produto, passe os insumos do projeto (descrição, site, imagem, áudio, atributos) e a página é montada em blocos editáveis, com HTML responsivo pronto para publicar.</p></div><div class="actions">${projectSelect()}<button class="btn dark" onclick="lpNewModal()">＋ Nova landing page</button></div></div>
  ${p.landings.length ? `<div class="lp-list">${p.landings.map(l => { const t = LP_TYPE_INFO[l.type]; return `<div class="panel lp-card"><div><span class="so-badge" style="margin:0 6px 0 0">${lpA(t ? t.label : 'Simples')}</span><small class="muted">${lpA(l.status)}</small><h3 style="margin:6px 0 2px">${lpA(l.name)}</h3><small class="muted block">${(l.blocks || []).filter(b => b.on).length ? (l.blocks.filter(b => b.on).length + ' blocos') : 'formato simples (será convertido ao abrir)'}${lpPending(l) ? ` · <span class="so-warn">${lpPending(l)} item(ns) a confirmar</span>` : ''}</small></div><div class="row-gap"><button class="btn sm dark" onclick="lpOpen('${l.id}')">Abrir</button><button class="btn sm" onclick="lpExport('${l.id}')">⬇ HTML</button><button class="btn sm" onclick="lpDelete('${l.id}')">Excluir</button></div></div>`; }).join('')}</div>` : `<div class="panel"><h3>Nenhuma landing page ainda</h3><p class="muted">Comece pelo tipo de produto: cada um já vem com a estrutura de blocos que mais costuma converter.</p><button class="btn dark" onclick="lpNewModal()">＋ Nova landing page</button></div>`}${lpRefsHTML()}`;
}
function lpNewModal() {
  showModal('Nova landing page', `<div class="field"><label>Nome interno</label><input id="lpnName" placeholder="Ex.: Curso Finanças sem medo — lançamento"></div><div class="okr-label">TIPO DE PRODUTO</div><div class="lp-types">${Object.entries(LP_TYPE_INFO).map(([k, t], i) => `<label class="lp-type"><input type="radio" name="lpnT" value="${k}" ${i === 0 ? 'checked' : ''}><b>${lpA(t.label)}</b><small class="muted">${lpA(t.why)}</small><small class="mono muted">${t.blocks.map(b => LP_BLOCK[b].label).join(' → ')}</small></label>`).join('')}</div><div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="lpCreate()">Criar e abrir</button></div>`);
  document.getElementById('modalBox').classList.add('wide');
}
function lpTheme(p) { try { const tk = lyStyles(p)[0].tk; return {accent: tk.accent, bg: tk.bg, fg: tk.fg, dark: false, head: tk.head.family, body: tk.body.family}; } catch (e) { return {}; } }
function lpCreate(init) {
  const p = curProject(), t = init && init.type || (document.querySelector('input[name=lpnT]:checked') || {}).value || 'generico', name = init && init.name || ($('lpnName') && $('lpnName').value.trim()) || 'LP — ' + LP_TYPE_INFO[t].label;
  const l = normalizeLandings([Object.assign({id: uid('lp'), name, type: t, goal: LP_TYPE_INFO[t].goal === 'lead' ? 'Gerar lead' : 'Conteúdo', cta: LP_TYPE_INFO[t].cta, theme: lpTheme(p), blocks: lpStructure(t), whatsapp: '', status: 'Rascunho'}, init || {})])[0];
  p.landings.push(l); persist(); closeModal(); lpUI.id = l.id; lpUI.tab = 'produto'; if (ui.page !== 'landings') go('landings'); else renderLandings(); return l;
}
function lpOpen(id) {
  const l = curProject().landings.find(x => x.id === id); if (!l) return;
  if (!l.type) l.type = 'generico'; if (!(l.blocks || []).length) l.blocks = lpSeedBlocks(l);
  lpUI.id = id; lpUI.tab = 'blocos'; persist(); renderLandings();
}
function lpDelete(id) { if (!confirm('Excluir esta landing page?')) return; const p = curProject(); p.landings = p.landings.filter(x => x.id !== id); persist(); renderLandings(); }
async function lpExport(id) { const p = curProject(), l = p.landings.find(x => x.id === id); if (!l.blocks.length) { lpOpen(id); return; } if (!state.workspace.leadsUrl && l.blocks.some(b => b.t === 'form' && b.on)) toast('Dica: defina a URL de captura de leads em Configurações antes de publicar.'); if (lpPending(l)) toast(`Atenção: ${lpPending(l)} item(ns) ainda marcado(s) como [CONFIRMAR].`); download(slug(l.name) + '.html', await lpHTML(l, p), 'text/html'); l.status = 'Exportada'; persist(); renderLandings(); }

/* ---------- editor ---------- */
function lpEditor(r, p, l) {
  const tabs = [['produto', 'Produto e insumos'], ['blocos', 'Blocos'], ['visual', 'Visual'], ['publicar', 'Publicar']];
  r.innerHTML = `<div class="page-head"><div><button class="btn sm" onclick="lpUI.id='';renderLandings()">← Todas as landing pages</button><h1 style="margin-top:8px">${lpA(l.name)}</h1></div><div class="actions"><span class="so-badge" style="margin:0">${lpA((LP_TYPE_INFO[l.type] || {}).label || '')}</span><button class="btn dark" onclick="lpExport('${l.id}')">⬇ Exportar HTML</button></div></div>
  <div class="edh-tabs">${tabs.map(([k, t]) => `<button class="edh-tab ${lpUI.tab === k ? 'on' : ''}" onclick="lpUI.tab='${k}';renderLandings()">${t}</button>`).join('')}</div>
  <div class="lp-wrap"><div class="lp-side" id="lpSide"></div><div class="lp-prev"><div class="row-gap" style="margin-bottom:8px"><button class="tchip ${lpUI.device === 'desktop' ? 'on' : ''}" onclick="lpUI.device='desktop';lpDevice()">Computador</button><button class="tchip ${lpUI.device === 'mobile' ? 'on' : ''}" onclick="lpUI.device='mobile';lpDevice()">Celular</button><button class="btn sm" onclick="lpPaint()">↻ Atualizar prévia</button></div><div class="lp-frame ${lpUI.device}" id="lpFrameBox"><iframe id="lpFrame" title="Prévia da landing page"></iframe></div></div></div>`;
  ({produto: lpTabProduto, blocos: lpTabBlocos, visual: lpTabVisual, publicar: lpTabPublicar})[lpUI.tab]($('lpSide'), l, p); lpPaint();
}
function lpDevice() { document.querySelectorAll('.lp-prev .tchip').forEach((b, i) => b.classList.toggle('on', (i === 0) === (lpUI.device === 'desktop'))); const f = $('lpFrameBox'); if (f) f.className = 'lp-frame ' + lpUI.device; }
async function lpPaint() { const l = lpCur(), f = $('lpFrame'); if (!l || !f) return; try { f.srcdoc = await lpHTML(l, curProject(), {preview: true}); } catch (e) { f.srcdoc = '<p style="font:14px sans-serif;padding:20px">Não consegui montar a prévia: ' + lpA(e.message) + '</p>'; } }
const lpPaintSoon = debounce(() => lpPaint(), 450);
const lpIn = (label, val, oninput, rows, ph) => `<div class="field"><label>${label}</label>${rows ? `<textarea rows="${rows}" oninput="${oninput}" placeholder="${lpA(ph || '')}">${lpA(val)}</textarea>` : `<input value="${lpA(val)}" oninput="${oninput}" placeholder="${lpA(ph || '')}">`}</div>`;
function lpSet(path, v) { const l = lpCur(), a = path.split('.'); let o = l; for (let i = 0; i < a.length - 1; i++) o = o[a[i]]; o[a[a.length - 1]] = v; persist(); lpPaintSoon(); }

function lpTabProduto(b, l, p) {
  const t = LP_TYPE_INFO[l.type] || LP_TYPE_INFO.generico, ev = l.type === 'evento', ready = aiReady(), agentOK = !!(EDS().ideas && EDS().ideas[EDS().chosen] && EDS().brief);
  b.innerHTML = `${lpIn('Nome interno', l.name, `lpSet('name',this.value)`)}
  <div class="field"><label>Tipo de produto</label><select onchange="lpChangeType(this.value)">${Object.entries(LP_TYPE_INFO).map(([k, x]) => `<option value="${k}" ${l.type === k ? 'selected' : ''}>${lpA(x.label)}</option>`).join('')}</select><small class="muted block">${lpA(t.why)}</small></div>
  ${accSec('lp', 'prod', 'Dados do produto', lpA(l.product.nome || ''), lpIn('Nome do produto', l.product.nome, `lpSet('product.nome',this.value)`) + lpIn('Preço e condição', l.product.preco, `lpSet('product.preco',this.value)`, 0, 'Ex.: 12x de R$ 49,90 ou R$ 497 à vista') + lpIn('Público', l.product.publico, `lpSet('product.publico',this.value)`, 2) + lpIn('Link de compra / inscrição (checkout)', l.product.checkout, `lpSet('product.checkout',this.value)`, 0, 'https://…') + (ev ? lpIn('Data e hora (AAAA-MM-DDTHH:MM)', l.product.data, `lpSet('product.data',this.value)`, 0, '2026-11-20T19:00') + lpIn('Local ou link online', l.product.local, `lpSet('product.local',this.value)`) : '') + lpIn('WhatsApp (só números, com DDI)', l.whatsapp, `lpSet('whatsapp',this.value.replace(/\\D/g,''))`, 0, '5511999999999'), true)}
  <div class="field"><label>Insumos <small class="muted">${l.input.length.toLocaleString('pt-BR')} caracteres</small></label><textarea rows="9" oninput="lpCur().input=this.value;persist()" placeholder="Cole a descrição do produto, a ementa, o roteiro do evento, o que o cliente recebe, garantia, depoimentos reais… Quanto mais concreto, menos [CONFIRMAR] na página.">${lpA(l.input)}</textarea></div>
  ${eInsumoSources(null, {sink: lpSink, render: renderLandings})}
  <label class="ins inl" style="margin-top:6px"><input type="checkbox" ${lpUI.useAgent && agentOK ? 'checked' : ''} ${agentOK ? '' : 'disabled'} onchange="lpUI.useAgent=this.checked"> usar a ideia e o briefing do Agente Editorial${agentOK ? ': “' + lpA((EDS().ideas[EDS().chosen].tese || '').slice(0, 50)) + '”' : ' (escolha uma ideia no Agente)'}</label>
  <div class="row-gap" style="margin-top:10px;flex-wrap:wrap"><button class="btn dark" onclick="lpGenerate()" ${lpUI.busy || !ready ? 'disabled' : ''} title="${ready ? '' : 'IA não configurada (Configurações → Integrações)'}">${lpUI.busy ? 'Escrevendo a página…' : '✦ Gerar a página com IA'}</button></div>
  <small class="muted block" style="margin-top:6px">A IA preenche cada bloco só com o que está nos insumos. O que faltar (preço, depoimento, garantia, números) fica como <b>[CONFIRMAR]</b> para você completar: nada é inventado.</small>`;
}
function lpSink(label, text) { const l = lpCur(); l.input = ((l.input ? l.input.trim() + '\n\n' : '') + `--- ${label} ---\n${text}`).slice(0, 60000); persist(); }
function lpChangeType(t) {
  const l = lpCur(), had = l.blocks.some(b => b.title || b.text || b.items.length);
  if (had && !confirm('Trocar o tipo recria a estrutura de blocos e apaga os textos atuais. Continuar?')) { renderLandings(); return; }
  l.type = t; l.blocks = lpStructure(t); l.cta = LP_TYPE_INFO[t].cta; persist(); renderLandings();
}
function lpPrompt(l) {
  const t = LP_TYPE_INFO[l.type], P = l.product, blocks = l.blocks.filter(b => b.on);
  return `${lpRefPrompt(l)}PRODUTO: ${t.label}\nNome: ${P.nome || '(não informado)'}\nPreço/condição: ${P.preco || '(não informado)'}\nPúblico: ${P.publico || '(não informado)'}\nLink de compra: ${P.checkout ? 'informado' : 'não informado'}${l.type === 'evento' ? `\nData/hora: ${P.data || '(não informada)'}\nLocal: ${P.local || '(não informado)'}` : ''}\nWhatsApp de contato: ${l.whatsapp ? 'sim' : 'não'}\n\nINSUMOS (única fonte de fatos):\n${l.input || '(vazio)'}\n\n${lpUI.useAgent && EDS().ideas && EDS().ideas[EDS().chosen] && EDS().brief ? 'IDEIA E BRIEFING DO AGENTE EDITORIAL:\n' + eCtx() + '\n' : ''}ESTRUTURA DA PÁGINA (na ordem; devolva um objeto por bloco):\n${blocks.map((b, i) => `${i + 1}. t="${b.t}" — ${LP_BLOCK[b.t].ai}`).join('\n')}\n\nFormato: JSON {"blocks":[{"t":"hero","kicker":"","title":"","text":"","cta":"","note":"","name":"","price":"","items":[{"t":"","d":""}],"yes":[],"no":[]}]} usando só os campos pedidos em cada bloco.\nRegras: português do Brasil, frases curtas e específicas; use **negrito** para 1 ou 2 palavras-chave do título; NUNCA invente números, depoimentos, nomes, prazos, garantias, preços, credenciais ou resultados: onde o insumo não trouxer o dado, escreva [CONFIRMAR: o que falta]; não prometa resultado garantido; conteúdo de saúde, finanças ou jurídico sem promessa de cura, ganho ou aprovação.`;
}
async function lpGenerate() {
  const l = lpCur(); if (lpUI.busy) return; if (!l.input.trim() && !l.product.nome) { toast('Escreva os insumos ou ao menos o nome do produto.'); return; }
  lpUI.busy = 'gen'; renderLandings();
  try {
    const j = await motJSON('Você é um redator de resposta direta que monta landing pages que convertem sem enganar. ' + (eBrandTxt() ? '\n' + eBrandTxt().slice(0, 6000) : ''), lpPrompt(l), 7000), got = Array.isArray(j.blocks) ? j.blocks : [], used = new Set(), s = (v, n) => String(v == null ? '' : v).slice(0, n);
    if (!got.length) throw new Error('a IA não devolveu a página.');
    l.blocks.filter(b => b.on).forEach(b => {
      const i = got.findIndex((x, k) => !used.has(k) && x && x.t === b.t); if (i < 0) return; used.add(i); const g = got[i];
      LP_BLOCK[b.t].fields.forEach(([f, , kind]) => { if (kind === 'img') return; if (f === 'items') b.items = (Array.isArray(g.items) ? g.items : []).slice(0, 20).map(x => ({t: s(x && x.t, 400), d: s(x && x.d, 1200)})); else if (f === 'yes' || f === 'no') b[f] = (Array.isArray(g[f]) ? g[f] : []).slice(0, 10).map(x => s(x, 300)); else if (g[f] != null) b[f] = s(g[f], f === 'text' ? 3000 : 400); });
    });
    const h = l.blocks.find(b => b.t === 'hero'); if (h) { l.headline = h.title; l.sub = h.text; l.cta = h.cta || l.cta; }
    persist(); toast('Página escrita. Revise os blocos e complete o que estiver em [CONFIRMAR].'); lpUI.tab = 'blocos';
  } catch (e) { toast(eErr(e)); }
  lpUI.busy = ''; renderLandings();
}

function lpTabBlocos(b, l) {
  b.innerHTML = `<small class="muted block" style="margin-bottom:8px">Ligue/desligue, reordene e edite cada bloco. A prévia ao lado atualiza sozinha. Itens com <b>[CONFIRMAR]</b> precisam de um dado real antes de publicar.</small>
  ${l.blocks.map((k, i) => { const def = LP_BLOCK[k.t], pend = (JSON.stringify([k.title, k.text, k.note, k.price, k.items, k.yes, k.no]).match(/\[CONFIRMAR/g) || []).length; return accSec('lp', k.id, `<label onclick="event.stopPropagation()" style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" ${k.on ? 'checked' : ''} onchange="lpBlk('${k.id}','on',this.checked,true)"> ${i + 1}. ${lpA(def.label)}</label>`, `${pend ? `<span class="so-warn">${pend} a confirmar</span> ` : ''}${lpA((k.title || k.items[0] && k.items[0].t || '').replace(/\*\*/g, '').slice(0, 28))}`, `<div class="row-gap" style="margin-bottom:8px"><button class="btn sm" onclick="lpMove('${k.id}',-1)" ${i === 0 ? 'disabled' : ''}>▲</button><button class="btn sm" onclick="lpMove('${k.id}',1)" ${i === l.blocks.length - 1 ? 'disabled' : ''}>▼</button><button class="btn sm" onclick="lpDup('${k.id}')">Duplicar</button><button class="btn sm" onclick="lpBlkDel('${k.id}')">Remover</button></div>${def.fields.map(f => lpField(k, f)).join('')}`, i === 0); }).join('')}
  <div class="row-gap" style="margin-top:10px"><select id="lpAdd">${Object.entries(LP_BLOCK).map(([t, d]) => `<option value="${t}">${lpA(d.label)}</option>`).join('')}</select><button class="btn sm dark" onclick="lpAddBlock()">＋ Adicionar bloco</button></div>`;
}
function lpField(k, [f, label, kind]) {
  if (kind === 'line') return `<div class="field"><label>${label}</label><input value="${lpA(k[f])}" oninput="lpBlk('${k.id}','${f}',this.value)"></div>`;
  if (kind === 'area') return `<div class="field"><label>${label}</label><textarea rows="3" oninput="lpBlk('${k.id}','${f}',this.value)">${lpA(k[f])}</textarea></div>`;
  if (kind === 'list') return `<div class="field"><label>${label} (um por linha)</label><textarea rows="4" oninput="lpBlk('${k.id}','${f}',this.value.split('\\n').filter(Boolean))">${lpA(k[f].join('\n'))}</textarea></div>`;
  if (kind === 'img') return `<div class="field"><label>${label}</label><div class="row-gap"><button class="btn sm" onclick="lpPickImg('${k.id}')">${k[f] ? 'Trocar' : '📚 Escolher da biblioteca'}</button>${k[f] ? `<button class="btn sm" onclick="lpBlk('${k.id}','${f}','',true)">Remover</button>` : ''}</div></div>`;
  if (kind.startsWith('items')) { const [a, c] = kind.slice(6).split('/'); return `<div class="field"><label>${label}</label>${k.items.map((it, n) => `<div class="lp-it"><input value="${lpA(it.t)}" placeholder="${a}" oninput="lpItem('${k.id}',${n},'t',this.value)"><textarea rows="2" placeholder="${c}" oninput="lpItem('${k.id}',${n},'d',this.value)">${lpA(it.d)}</textarea><button class="btn sm" onclick="lpItemDel('${k.id}',${n})" title="Remover item">×</button></div>`).join('')}<button class="btn sm" onclick="lpItemAdd('${k.id}')">＋ Item</button></div>`; }
  return '';
}
const lpBk = id => lpCur().blocks.find(b => b.id === id);
function lpBlk(id, f, v, rerender) { lpBk(id)[f] = v; persist(); if (rerender) renderLandings(); else lpPaintSoon(); }
function lpItem(id, n, k, v) { lpBk(id).items[n][k] = v; persist(); lpPaintSoon(); }
function lpItemAdd(id) { lpBk(id).items.push({t: '', d: ''}); persist(); renderLandings(); }
function lpItemDel(id, n) { lpBk(id).items.splice(n, 1); persist(); renderLandings(); }
function lpMove(id, d) { const a = lpCur().blocks, i = a.findIndex(b => b.id === id), j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; persist(); renderLandings(); }
function lpDup(id) { const a = lpCur().blocks, i = a.findIndex(b => b.id === id), c = JSON.parse(JSON.stringify(a[i])); c.id = uid('bk'); a.splice(i + 1, 0, c); persist(); renderLandings(); }
function lpBlkDel(id) { const l = lpCur(); l.blocks = l.blocks.filter(b => b.id !== id); persist(); renderLandings(); }
function lpAddBlock() { lpCur().blocks.push(lpBlockNew($('lpAdd').value)); persist(); renderLandings(); }
function lpPickImg(id) { libPick(r => { lpBk(id).imgId = r.id; persist(); renderLandings(); }); }

function lpTabVisual(b, l, p) {
  const th = l.theme, col = (k, lab) => `<label class="ins">${lab}<input type="color" value="${th[k]}" oninput="lpSet('theme.${k}',this.value)"></label>`;
  b.innerHTML = `<div class="ins-row">${col('accent', 'Cor de destaque')}${col('bg', 'Fundo')}${col('fg', 'Texto')}<label class="ins inl"><input type="checkbox" ${th.dark ? 'checked' : ''} onchange="lpSet('theme.dark',this.checked)"> modo escuro</label></div>
  <div class="ins-row"><div class="field"><label>Fonte dos títulos</label><button class="btn sm" onclick="lpFont('head')">${lpA(th.head)} · trocar</button></div><div class="field"><label>Fonte do texto</label><button class="btn sm" onclick="lpFont('body')">${lpA(th.body)} · trocar</button></div></div>
  <div class="row-gap"><button class="btn sm" onclick="lpBrandTheme()">Usar as cores e fontes da marca</button></div><small class="muted block" style="margin-top:6px">As fontes são carregadas do Google Fonts na página publicada; sem internet o navegador usa uma fonte do sistema.</small>`;
}
function lpFont(k) { fbOpen(fam => { lpSet('theme.' + k, fam); closeModal(); renderLandings(); }, lpCur().theme[k]); }
function lpBrandTheme() { const l = lpCur(); Object.assign(l.theme, lpTheme(curProject())); persist(); renderLandings(); }

function lpTabPublicar(b, l) {
  const checks = [[!!l.blocks.find(x => x.t === 'hero' && x.on && x.title), 'Título (promessa) preenchido'], [!!(l.product.checkout || l.whatsapp || l.blocks.some(x => x.t === 'form' && x.on)), 'A página tem para onde levar o clique (checkout, WhatsApp ou formulário)'], [lpPending(l) === 0, lpPending(l) ? `${lpPending(l)} item(ns) ainda como [CONFIRMAR]` : 'Nenhum item pendente de confirmação'], [!l.blocks.some(x => x.t === 'form' && x.on) || !!state.workspace.leadsUrl, 'Formulário com destino de leads configurado (Configurações)'], [!l.blocks.some(x => x.t === 'form' && x.on) || !!l.privacyUrl, 'Link da política de privacidade (LGPD) no formulário'], [!l.blocks.some(x => x.t === 'prova' && x.on) || !/\[CONFIRMAR/.test(JSON.stringify(l.blocks.filter(x => x.t === 'prova')) ), 'Depoimentos reais e autorizados']];
  b.innerHTML = `<div class="panel"><h3>Antes de publicar</h3>${checks.map(([ok, t]) => `<div class="so-issue ${ok ? '' : 'aviso'}" style="${ok ? 'background:#e9f7ee;color:#176b30' : ''}">${ok ? '✓' : '⚠'} ${lpA(t)}</div>`).join('')}</div>
  ${lpIn('Política de privacidade (URL)', l.privacyUrl, `lpSet('privacyUrl',this.value)`, 0, 'https://…')}${lpIn('ID do Pixel da Meta (só números)', l.tracking.metaPixel, `lpSet('tracking.metaPixel',this.value.trim())`)}${lpIn('ID do Google Analytics 4 (G-XXXXXXX)', l.tracking.ga4, `lpSet('tracking.ga4',this.value.trim())`)}
  <div class="field"><label>Status</label><select onchange="lpCur().status=this.value;persist()">${['Rascunho', 'Em revisão', 'Aprovada', 'Exportada', 'Publicada'].map(s => `<option ${l.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
  <div class="row-gap" style="flex-wrap:wrap"><button class="btn dark" onclick="lpExport('${l.id}')">⬇ Exportar HTML</button><button class="btn" onclick="lpCopyHTML()">Copiar HTML</button></div><small class="muted block" style="margin-top:8px">O arquivo é uma página única, responsiva, sem dependência além das fontes. Suba na Hostinger (public_html) ou em qualquer hospedagem. O formulário envia para <span class="mono">${lpA(state.workspace.leadsUrl || 'a URL de leads (não configurada)')}</span>. O Pixel e o GA4 só entram no arquivo exportado, não na prévia.</small>`;
}
async function lpCopyHTML() { const l = lpCur(); try { await navigator.clipboard.writeText(await lpHTML(l, curProject())); toast('HTML copiado.'); } catch (e) { toast('Não consegui copiar; use Exportar.'); } }

/* ---------- referências de landing pages (URLs) ---------- */
const LP_REF_TYPES = {cadastro: 'Cadastro', curso: 'Curso', ebook: 'E-book', servico: 'Serviço', evento: 'Evento', produto: 'Produto', institucional: 'Institucional', outro: 'Outro'};
const LP_REF_SEED = [
  ['https://www.vindeacristo.org/ps/licao-sobre-o-livro-de-mormon', 'Aprenda com os missionários e receba uma cópia gratuita do Livro de Mórmon', 'cadastro', 'Enviada por você (página de cadastro).'],
  ['https://www.vindeacristo.org/ps/reunir-com-missionarios', 'Aproxime-se de Deus. Converse com os missionários.', 'cadastro', 'Mesma família de páginas de cadastro (/ps/).'],
  ['https://www.vindeacristo.org/ps/licao-sobre-jesus-cristo', 'Torne-se a melhor versão de si mesmo por meio de Jesus Cristo', 'cadastro', 'Mesma família (/ps/).'],
  ['https://www.vindeacristo.org/all/licao-de-pascoa', 'Descubra o que é possível com Jesus Cristo. Converse com os missionários.', 'cadastro', 'Versão sazonal (Páscoa).'],
  ['https://www.vindeacristo.org/formulario/descubra-a-biblia-sagrada', 'Receba um exemplar gratuito da Bíblia', 'cadastro', 'Formulário direto (/formulario/).'],
  ['https://www.vindeacristo.org/formulario/visita-dos-missionarios', 'Converse com os missionários on-line ou pessoalmente', 'cadastro', 'Formulário direto (/formulario/).'],
  ['https://enwp.com.br/treinamento/robo-monitoramento-processual', 'Robô de monitoramento processual (treinamento)', 'curso', 'Enviada por você.'],
  ['https://enwp.com.br/treinamento/governanca-de-ia', 'Governança de IA (treinamento)', 'curso', 'Enviada por você.'],
  ['https://akimobmoveis.com.br/landpage-produtos/', 'Landing de produtos (móveis)', 'produto', 'Enviada por você.'],
  ['https://anuncie.eletromidia.com.br/', 'Anuncie na Eletromidia', 'servico', 'Enviada por você (campanha de captação B2B).'],
  ['https://imidiaoutdoor.com.br/', 'Imidia Outdoor', 'servico', 'Enviada por você.']
];
function lpRefs() { if (!state.lpRefs) state.lpRefs = normalizeLpRefs(null); const R = state.lpRefs; if (!R.seeded) { R.seeded = true; LP_REF_SEED.forEach(([url, title, type, note]) => R.items.push({id: uid('rf'), url, title, type, note, use: true, scan: null})); persist(); } return R; }
function lpRefsHTML() {
  const R = lpRefs();
  return `<div class="panel" style="margin-top:14px"><div class="section-row"><div><h3>Referências de landing pages</h3><p class="muted" style="margin:2px 0 0;font-size:12.5px">URLs de páginas que servem de modelo. “Ler estrutura” lê a página pelo seu servidor (blocos, títulos, botões, fontes e cores) e a IA usa só a estrutura como inspiração ao gerar, sem copiar texto.</p></div></div>
  <div class="row-gap" style="margin:8px 0;flex-wrap:wrap"><input id="lrU" placeholder="https://…" style="flex:1;min-width:220px"><select id="lrT">${Object.entries(LP_REF_TYPES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select><input id="lrN" placeholder="Nota (opcional)" style="flex:1;min-width:140px"><button class="btn sm dark" onclick="lpRefAdd()">＋ Adicionar</button></div>
  ${R.items.map(r => `<div class="list-item lp-ref"><div style="min-width:0"><strong><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title || r.url)}</a></strong><small class="block muted" style="white-space:normal">${esc(LP_REF_TYPES[r.type])} · ${esc(r.url.replace(/^https?:\/\//, '').slice(0, 70))}${r.note ? ' · ' + esc(r.note) : ''}</small>${r.scan ? `<small class="block" style="white-space:normal;color:#176b30">✓ Lida: ${r.scan.headings.length} título(s), ${r.scan.ctas.length} botão(ões)${r.scan.fonts.length ? ' · fontes ' + esc(r.scan.fonts.slice(0, 2).join(', ')) : ''}${r.scan.colors.length ? ' · ' + r.scan.colors.slice(0, 4).map(c => `<i class="so-net" style="background:${esc(c)};width:11px;height:11px;border:1px solid #ddd"></i>`).join('') : ''}</small>` : ''}</div><div class="row-gap"><label class="ins inl" title="Usar como inspiração ao gerar"><input type="checkbox" ${r.use ? 'checked' : ''} onchange="lpRefUse('${r.id}',this.checked)"> usar</label><button class="btn sm" onclick="lpRefScan('${r.id}')" ${lpUI.refBusy ? 'disabled' : ''}>${lpUI.refBusy === r.id ? 'Lendo…' : r.scan ? 'Reler' : 'Ler estrutura'}</button><button class="btn sm" onclick="lpRefDel('${r.id}')">×</button></div></div>`).join('')}</div>`;
}
const lpCleanUrl = u => { try { const x = new URL(u); [...x.searchParams.keys()].forEach(k => { if (/^(gclid|gbraid|wbraid|fbclid|msclkid|gad_.*|utm_.*|hsa_.*|cid|cq_cmp|adlang|source|network|ef_id|s_kwcid)$/i.test(k)) x.searchParams.delete(k); }); return x.toString(); } catch (e) { return u; } };
function lpRefAdd() { const u = $('lrU').value.trim(); if (!/^https?:\/\/\S+$/i.test(u)) { toast('Cole um endereço completo, começando com https://'); return; } lpRefs().items.unshift({id: uid('rf'), url: lpCleanUrl(u), title: '', type: $('lrT').value, note: $('lrN').value.trim(), use: true, scan: null}); persist(); renderLandings(); }
function lpRefUse(id, v) { lpRefs().items.find(r => r.id === id).use = v; persist(); }
function lpRefDel(id) { const R = lpRefs(); R.items = R.items.filter(r => r.id !== id); persist(); renderLandings(); }
async function lpRefScan(id) {
  const r = lpRefs().items.find(x => x.id === id); if (!r || lpUI.refBusy) return; if (!canUseApi()) { toast(needsLogin() ? 'Entre no Studio para ler sites.' : 'A leitura de sites exige o servidor PHP (Hostinger).'); return; }
  lpUI.refBusy = id; renderLandings();
  try { const x = await radarFetchScan(r.url); r.scan = {title: x.title || '', description: x.description || '', headings: x.headings || [], ctas: x.ctas || [], fonts: x.fonts || [], colors: x.colors || [], at: new Date().toISOString()}; if (!r.title) r.title = x.title || r.title; persist(); toast('Estrutura lida.'); } catch (e) { toast(e.message); }
  lpUI.refBusy = ''; renderLandings();
}
/* trecho para o prompt: só estrutura, de referências marcadas e lidas */
function lpRefPrompt(l) {
  const R = lpRefs().items.filter(r => r.use && r.scan && (r.type === l.type || r.type === 'cadastro' && l.type === 'cadastro')).slice(0, 3);
  return R.length ? 'REFERÊNCIAS DE ESTRUTURA (use só como inspiração de ordem, tom e tamanho dos blocos; NÃO copie frases nem marcas):\n' + R.map(r => `- ${r.title}: títulos [${r.scan.headings.slice(0, 10).join(' | ')}]; botões [${r.scan.ctas.slice(0, 6).join(' | ')}]`).join('\n') + '\n\n' : '';
}
