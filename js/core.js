/* Navegação, modais genéricos, home, projetos, biblioteca, Brand Brain, configurações */
const PAGES = ['home', 'projects', 'inspiration', 'editora', 'diagram', 'editorial', 'integracoes', 'library', 'brand', 'settings', 'matrix', 'videoLab', 'campaigns', 'approval', 'publishingHub', 'analyticsHub', 'project'];
const CREATION_NAMES = {project: 'Projeto', ad: 'Anúncio', video: 'Vídeo', post: 'Post', carousel: 'Post Carrossel', story: 'Story', stories: 'Sequência de Stories'};
const CREATION_ICONS = {project: '□', ad: '◉', video: '▷', post: '▣', carousel: '▤', story: '▯', stories: '▥'};
const CREATIVE_STATUS = ['Rascunho', 'Para aprovação', 'Aprovado', 'Ajustes', 'Em produção', 'Publicado'];

/* ---- modal genérico ---- */
function showModal(title, body) {
  $('modalBox').innerHTML = `<div class="modal-head"><h2>${esc(title)}</h2><button class="close" onclick="closeModal()" aria-label="Fechar">×</button></div>${body}`;
  $('modalBack').classList.add('open');
}
function closeModal() { $('modalBack').classList.remove('open'); $('modalBox').classList.remove('wide'); }
function askText(title, label, cb) {
  window.__askCb = cb;
  showModal(title, `<div class="field"><label>${esc(label)}</label><textarea id="askInput" rows="3"></textarea></div><div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="const v=$('askInput').value.trim();if(!v){toast('Escreva uma nota.');return}closeModal();window.__askCb(v)">Confirmar</button></div>`);
  setTimeout(() => $('askInput') && $('askInput').focus(), 50);
}

/* ---- navegação ---- */
function go(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = $('page-' + page); if (el) el.classList.add('active');
  document.querySelectorAll('.rail-nav button,.rail-bottom button').forEach(b => b.classList.toggle('active', b.dataset.page === (page === 'diagram' ? 'editora' : page)));
  ui.page = page; renderPage(page); window.scrollTo(0, 0);
}
function renderPage(page) {
  ({home: renderHome, projects: renderProjects, library: renderLibrary, brand: renderBrand, settings: renderSettings, matrix: renderMatrixPage,
    videoLab: renderVideoLab, campaigns: renderCampaignsPage, approval: renderApprovalPage, publishingHub: renderPublishingPage,
    analyticsHub: renderAnalyticsPage, project: renderProjectTab, wizard: renderWizard, design: renderDesign, inspiration: renderInspiration, editora: renderEditora, diagram: renderDiagram, editorial: renderEditorial, integracoes: renderIntegracoes}[page] || (() => {}))();
}
function refreshCurrentView() { renderSyncBadge(); renderHome(); renderPage(ui.page); updateContextUI(); }
function bootRender() { $('credits').textContent = state.credits; updateContextUI(); renderHome(); renderPage(ui.page); renderSyncBadge(); }

/* ---- seletor de projeto (contexto) ---- */
function projectSelect() {
  if (!state.projects.length) return '';
  return `<label class="proj-select"><span>Projeto</span><select onchange="switchProject(this.value)">${state.projects.map(p => `<option value="${p.id}" ${p.id === state.activeProjectId ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></label>`;
}
function switchProject(id) { setActiveProject(id); updateContextUI(); renderPage(ui.page); }
function updateContextUI() {
  const p = curProject(), b = $('contextButton'), h = $('contextHint'); if (!b) return;
  if (p) { b.textContent = '✓ ' + p.name; h.textContent = 'A IA vai considerar estratégia, Brand Brain, referências e assets deste projeto.'; }
  else { b.textContent = '＋ Escolher projeto'; h.textContent = 'Crie um projeto para dar contexto às criações.'; }
}
function noProject(title) { return `<div class="subpage"><div class="page-head"><div><h1>${esc(title)}</h1></div></div>${emptyState('Nenhum projeto ainda', 'Crie um projeto para começar.', '<button class="btn dark" onclick="openModal(\'newproject\')">＋ Novo projeto</button>')}</div>`; }
function hubHead(title, desc, actions) {
  return `<div class="page-head"><div><h1>${esc(title)}</h1><p>${esc(desc)}</p></div><div class="actions">${projectSelect()}${actions || ''}</div></div>`;
}

/* ---- home ---- */
function artCard(c) {
  return `<article class="tile" onclick="openCreative('${c.id}')"><div class="art ${esc(c.cls)}"><div class="grid"></div><div class="orb"></div><small>${esc(c.type)}</small><h3>${esc(c.title)}</h3></div>
    <div class="tile-meta"><strong>${esc(c.title)}</strong><small>${esc(c.type)} · ${esc(c.status)}</small></div></article>`;
}
const newTile = () => `<article class="tile new-tile" onclick="openCreate()"><div><b>＋</b>Novo projeto</div></article>`;
function renderHome() {
  const arr = state.creatives.slice().sort((a, b) => b.created.localeCompare(a.created)).slice(0, 8);
  $('homeGallery').innerHTML = newTile() + arr.map(artCard).join('');
}
async function generate() {
  const p = curProject(); if (!p) { toast('Crie um projeto antes.'); return; }
  const text = $('prompt').value.trim() || `Crie uma campanha de aquisição para ${p.name}`;
  const c = {id: uid('c'), projectId: p.id, title: text.slice(0, 44), type: 'Novo briefing', cls: 'a5', status: 'Rascunho', brief: text, created: new Date().toISOString()};
  state.creatives.unshift(c); persist(); $('prompt').value = ''; renderHome();
  if (aiReady()) {
    toast('Briefing recebido. Gerando sugestão com a IA…');
    try {
      c.copy = await aiText('Você é um redator de performance. Dê 1 headline, 1 texto curto e 1 CTA, sem promessas absolutas e sem inventar dados.', projectContext(p) + '\nBriefing: ' + text, 600);
      spendCredits(1); persist(); toast('Sugestão da IA salva na criação.');
    } catch (e) { toast('Briefing salvo. IA: ' + e.message); }
  } else toast('Briefing salvo no projeto ' + p.name + '.');
}
function usePrompt(t) { $('prompt').value = t; $('prompt').focus(); }

/* ---- criações ---- */
function openCreative(id) {
  const c = state.creatives.find(x => x.id === id); if (!c) return; const p = projectById(c.projectId);
  showModal(c.title, `<div class="two"><div class="canvas" style="min-height:300px"><div class="poster" style="width:260px"><h2>${esc(c.title)}</h2><p>${esc(p ? p.name : '')} · ${esc(c.type)}</p></div></div>
    <div class="panel"><h3>Direção</h3><div class="kv"><span>Formato</span><strong>${esc(c.type)}</strong></div><div class="kv"><span>Status</span><strong>${esc(c.status)}</strong></div>
    ${c.brief ? `<div class="kv"><span>Briefing</span><strong>${esc(c.brief)}</strong></div>` : ''}${c.copy ? `<div class="kv"><span>Copy ${tag('recomendacao')}</span><strong style="white-space:pre-wrap">${esc(c.copy)}</strong></div>` : ''}
    <div class="modal-actions" style="flex-wrap:wrap;justify-content:flex-start"><button class="btn dark" onclick="creativeToApproval('${c.id}')">Enviar para aprovação</button><button class="btn" onclick="creativeAICopy('${c.id}')">✦ Gerar copy</button><button class="btn" onclick="creativeDelete('${c.id}')">Excluir</button></div></div></div>`);
}
function creativeToApproval(id) {
  const c = state.creatives.find(x => x.id === id), p = projectById(c.projectId); if (!p) return;
  if (p.approvals.some(a => a.refType === 'creative' && a.refId === id && a.status === 'Pendente')) { toast('Já está na fila de aprovação.'); return; }
  c.status = 'Para aprovação'; addApproval(p, c.title, 'Criativo', 'creative', id); persist(); closeModal(); renderHome(); toast('Enviado para aprovação.');
}
async function creativeAICopy(id) {
  if (!aiReady()) { toast('IA não configurada. Veja Integrações.'); return; }
  const c = state.creatives.find(x => x.id === id), p = projectById(c.projectId);
  try { toast('Gerando…'); c.copy = await aiText('Você é um redator de performance. Dê 1 headline, 1 texto curto e 1 CTA, sem promessas absolutas e sem inventar dados.', projectContext(p) + `\nPeça: ${c.title} (${c.type}). ${c.brief || ''}`, 600); spendCredits(1); persist(); openCreative(id); }
  catch (e) { toast('IA: ' + e.message); }
}
function creativeDelete(id) { if (!confirm('Excluir esta criação?')) return; state.creatives = state.creatives.filter(c => c.id !== id); persist(); closeModal(); renderHome(); if (ui.page === 'library') renderLibrary(); if (ui.page === 'project') renderProjectTab(); }
function openCreate() {
  showModal('Criar', `<div class="project-grid"><div class="project-card" onclick="closeModal();openModal('creative')"><div class="cover a5">✦</div><div class="body"><strong>Peça criativa</strong><small>Registrar uma nova criação</small></div></div><div class="project-card" onclick="closeModal();openModal('newproject')"><div class="cover a3">□</div><div class="body"><strong>Projeto</strong><small>Criar workspace de cliente</small></div></div><div class="project-card" onclick="closeModal();openModal('campaign')"><div class="cover a2">◉</div><div class="body"><strong>Campanha</strong><small>Estruturar mídia paga</small></div></div></div>`);
}
function openCreation(type) { if (type === 'context') openModal('context'); else openModal('creation', type); }

function openModal(type, data) {
  const p = curProject();
  if (type === 'creation') {
    const sel = data || 'project';
    const inherited = sel !== 'project' && p ? `A criação será construída a partir de <strong>${esc(p.name)}</strong>, usando o contexto existente.` : 'Escolha um projeto existente ou crie um novo contexto para esta produção.';
    return showModal('Criar ' + CREATION_NAMES[sel], `<div class="creation-modal"><div class="creation-context-box"><span>Projeto de referência</span><strong>${esc(p ? p.name : 'Nenhum projeto selecionado')}</strong><button class="btn" onclick="closeModal();openModal('context')">Trocar</button></div>
      <p style="color:#777;font-size:12px;line-height:1.6;margin:12px 0 18px">${inherited}</p>
      <div class="creation-options">${Object.keys(CREATION_NAMES).map(k => `<button class="creation-option ${k === sel ? 'selected' : ''}" onclick="closeModal();openCreation('${k}')"><span>${CREATION_ICONS[k]}</span><strong>${CREATION_NAMES[k]}</strong><small>${k === 'project' ? 'Estratégia, ICP e Brand Brain' : k === 'ad' ? 'Conceito, copy e variações' : k === 'video' ? 'Roteiro, cenas e direção' : 'Formato pronto para produção'}</small></button>`).join('')}</div>
      <div class="creation-form"><div class="field"><label>Nome da criação</label><input id="creationName" value="${esc(CREATION_NAMES[sel])} — novo conceito"></div><div class="field"><label>Formato</label><select id="creationFormat"><option>${CREATION_NAMES[sel]}</option><option>Variação A</option><option>Variação B</option></select></div>
      <div class="field full"><label>O que você quer criar?</label><textarea id="creationBrief" placeholder="Descreva objetivo, público, mensagem, oferta ou deixe a IA decidir com base no projeto."></textarea></div></div>
      <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn orange" onclick="confirmCreation('${sel}')">Criar ${CREATION_NAMES[sel]}</button></div></div>`);
  }
  if (type === 'context') return showModal('Escolher projeto', `<p style="color:#888;font-size:12px;margin-top:0">Quando você escolhe um projeto, toda nova criação herda o contexto que já existe nele.</p><div class="context-list">${state.projects.map(x => `<button class="context-project" onclick="selectContext('${x.id}')"><span class="context-cover ${esc(x.cover)}">${esc(x.icon)}</span><span><strong>${esc(x.name)}</strong><small>${esc(x.desc)}</small></span><b>→</b></button>`).join('')}<button class="context-project new-context" onclick="closeModal();openModal('newproject')"><span class="context-cover">＋</span><span><strong>Novo projeto</strong><small>Começar um novo contexto</small></span><b>→</b></button></div>`);
  if (type === 'newproject') { closeModal(); return openWizard(); }
  if (!p) return toast('Crie um projeto primeiro.');
  if (type === 'creative') return showModal('Nova criação', `<div class="form-grid"><div class="field"><label>Nome</label><input id="creativeName" placeholder="Nome do conceito"></div><div class="field"><label>Formato</label><select id="creativeType"><option>Meta Ads</option><option>Post</option><option>Carrossel</option><option>Story</option><option>Reels</option><option>Landing</option><option>Vídeo</option></select></div><div class="field full"><label>Briefing</label><textarea id="creativeBrief" placeholder="Descreva a ideia, público, oferta e objetivo."></textarea></div></div><div class="modal-actions"><button class="btn orange" onclick="createCreative()">Adicionar ao feed</button></div>`);
  if (type === 'campaign') return showModal('Nova campanha', `<div class="form-grid"><div class="field"><label>Nome</label><input id="cmpName" placeholder="Ex.: Conversão — WhatsApp"></div><div class="field"><label>Objetivo</label><select id="cmpObj"><option>Leads</option><option>Tráfego</option><option>Conversões</option><option>Reconhecimento</option></select></div><div class="field"><label>Orçamento diário (R$)</label><input id="cmpBudget" type="number" min="0" step="1" placeholder="150"></div><div class="field"><label>Canal</label><select id="cmpChan"><option>Meta Ads</option><option>Google Ads</option><option>TikTok Ads</option></select></div></div><div class="modal-actions"><button class="btn dark" onclick="createCampaign()">Criar campanha</button></div>`);
  if (type === 'asset') return showModal('Adicionar asset', `<div class="form-grid"><div class="field"><label>Nome</label><input id="assetName" placeholder="Ex.: Logo principal"></div><div class="field"><label>Categoria</label><select id="assetCat"><option>Logo</option><option>Foto</option><option>Documento</option><option>Referência</option></select></div><div class="field full"><label>Link (Drive, Dropbox, URL)</label><input id="assetUrl" placeholder="https://..."></div></div><p class="muted" style="font-size:11px">Por enquanto o asset é registrado por link; o upload de arquivos vem com o armazenamento no servidor.</p><div class="modal-actions"><button class="btn dark" onclick="createAsset()">Adicionar</button></div>`);
  if (type === 'voiceEdit') { const v = p.voice, f = (k, l, rows = 2) => `<div class="field full"><label>${l}</label><textarea id="v_${k}" rows="${rows}">${esc(v[k])}</textarea></div>`; return showModal('Editar Voice Brain · ' + p.name, `<p class="muted" style="font-size:11px;margin-top:0">Voice Brain = como falamos. Toda copy e roteiro gerados usam estas regras.</p><div class="form-grid">${f('personality', 'Personalidade')}${f('principles', 'Princípios')}${f('vocabulary', 'Vocabulário preferido')}${f('antivocab', 'Anti-vocabulário (o que nunca dizer)')}${f('rules', 'Regras de construção das frases')}${f('channels', 'Tom por canal')}${f('examples', 'Exemplos de boa comunicação', 3)}${f('checklist', 'Checklist de revisão')}</div><div class="modal-actions"><button class="btn dark" onclick="saveVoice()">Salvar</button></div>`); }
  if (type === 'brandEdit') { const b = p.brand; return showModal('Editar Brand Brain · ' + p.name, `<div class="form-grid"><div class="field full"><label>Posicionamento</label><input id="bPos" value="${esc(b.positioning)}"></div><div class="field"><label>Tom</label><input id="bTone" value="${esc(b.tone)}"></div><div class="field"><label>Paleta</label><input id="bPal" value="${esc(b.palette)}"></div><div class="field"><label>Direção visual</label><input id="bVis" value="${esc(b.visual)}"></div><div class="field"><label>Regra</label><input id="bRule" value="${esc(b.rule)}"></div><div class="field full"><label>Instruções para a IA</label><textarea id="bIns" rows="4">${esc(b.instructions)}</textarea></div></div><div class="modal-actions"><button class="btn dark" onclick="saveBrand()">Salvar</button></div>`); }
}
function selectContext(id) { setActiveProject(id); updateContextUI(); closeModal(); renderPage(ui.page); toast('Contexto: ' + projectById(id).name); }
function confirmCreation(type) {
  const p = curProject();
  const name = ($('creationName').value || CREATION_NAMES[type] + ' — novo conceito').trim();
  const brief = $('creationBrief').value.trim() || 'Criado a partir do contexto atual.';
  if (type === 'project') { closeModal(); openWizard(name.replace(/ — novo conceito$/, '')); return; }
  if (!p) { toast('Escolha um projeto.'); return; }
  state.creatives.unshift({id: uid('c'), projectId: p.id, title: name, type: CREATION_NAMES[type], cls: 'a5', status: 'Rascunho', brief, created: new Date().toISOString()});
  persist(); closeModal(); renderHome(); toast(CREATION_NAMES[type] + ' criado em ' + p.name + '.');
}
function createProject() {
  const n = $('npName').value.trim() || 'Novo projeto'; const p = newProject(n, 'Projeto criado no Ampliação Studio', {category: $('npCat').value, goal: $('npGoal').value.trim()});
  state.projects.push(p); state.activeProjectId = p.id; persist(); closeModal(); updateContextUI(); go('projects'); toast('Projeto criado.');
}
function createCreative() {
  const p = curProject(); const n = $('creativeName').value.trim() || 'Novo conceito';
  state.creatives.unshift({id: uid('c'), projectId: p.id, title: n, type: $('creativeType').value, cls: 'a5', status: 'Rascunho', brief: $('creativeBrief').value.trim(), created: new Date().toISOString()});
  persist(); closeModal(); renderHome(); if (ui.page === 'project') renderProjectTab(); toast('Criação adicionada ao feed.');
}
function createAsset() { const p = curProject(); const n = $('assetName').value.trim(); if (!n) { toast('Dê um nome ao asset.'); return; } p.assets.push({id: uid('a'), name: n, category: $('assetCat').value, url: $('assetUrl').value.trim()}); persist(); closeModal(); if (ui.page === 'library') renderLibrary(); if (ui.page === 'brand') renderBrand(); toast('Asset registrado.'); }
function saveVoice() { const v = curProject().voice; ['personality', 'principles', 'vocabulary', 'antivocab', 'rules', 'channels', 'examples', 'checklist'].forEach(k => v[k] = $('v_' + k).value); persist(); closeModal(); renderBrand(); toast('Voice Brain atualizado.'); }
function saveBrand() { const b = curProject().brand; b.positioning = $('bPos').value; b.tone = $('bTone').value; b.palette = $('bPal').value; b.visual = $('bVis').value; b.rule = $('bRule').value; b.instructions = $('bIns').value; persist(); closeModal(); renderBrand(); toast('Brand Brain atualizado.'); }

/* ---- projetos ---- */
function renderProjects() {
  $('projectsGrid').innerHTML = state.projects.map(p => `<article class="project-card" onclick="openProject('${p.id}')"><div class="cover ${esc(p.cover)}">${esc(p.icon)}</div><div class="body"><strong>${esc(p.name)}</strong><small>${esc(p.desc)} · Pré-projeto: ${esc(p.pre.status)}</small></div></article>`).join('') +
    `<article class="project-card" onclick="openWizard()"><div class="cover" style="background:#fafafa;border-bottom:1px dashed #ddd">＋</div><div class="body"><strong>Novo projeto</strong><small>Começar um novo trabalho</small></div></article>`;
}
function openProject(id) { setActiveProject(id); updateContextUI(); ui.tab = 'overview'; go('project'); }

/* ---- biblioteca ---- */
const LIB_FILTERS = [['all', 'Todos', () => true], ['ads', 'Anúncios', c => /ads/i.test(c.type)], ['social', 'Posts e Stories', c => /post|story|carrossel|reels|stories/i.test(c.type)], ['video', 'Vídeos', c => /v[ií]deo|reels/i.test(c.type)], ['landing', 'Landing', c => /landing/i.test(c.type)], ['brand', 'Branding e PDF', c => /brand|pdf/i.test(c.type)]];
function renderLibrary() {
  const f = LIB_FILTERS.find(x => x[0] === (ui.lib || 'all'));
  $('libraryFilters').innerHTML = LIB_FILTERS.map(x => `<button class="${x[0] === f[0] ? 'active' : ''}" onclick="ui.lib='${x[0]}';renderLibrary()">${x[1]}</button>`).join('');
  const list = state.creatives.filter(f[2]);
  const assets = state.projects.flatMap(p => p.assets.map(a => ({...a, project: p.name})));
  $('libraryGrid').innerHTML = list.map(artCard).join('') || emptyState('Nada por aqui', 'Nenhuma criação neste filtro.');
  $('libraryAssets').innerHTML = assets.length ? `<div class="panel" style="margin-top:14px"><h3>Assets e referências</h3><div class="list">${assets.map(a => `<div class="list-item"><div><strong>${esc(a.name)}</strong><small>${esc(a.category)} · ${esc(a.project)}</small></div>${a.url ? `<a class="btn" href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">Abrir</a>` : ''}</div>`).join('')}</div></div>` : '';
}

/* ---- Brand Brain (por projeto) ---- */
function renderBrand() {
  const p = curProject(), r = $('brandRoot');
  if (!p) { r.innerHTML = noProject('Brand Brain'); return; }
  const b = p.brand;
  r.innerHTML = `<div class="page-head"><div><h1>Brand Brain</h1><p>O contexto que orienta todas as criações. Brand Brain = quem somos; Voice Brain = como falamos.</p></div><div class="actions">${projectSelect()}<button class="btn dark" onclick="openModal('brandEdit')">Editar Brand Brain</button></div></div>
  <div class="two"><div class="panel"><h3>${esc(p.name)}</h3>${[['Posicionamento', b.positioning], ['Tom', b.tone], ['Paleta', b.palette], ['Direção visual', b.visual], ['Regra', b.rule]].map(([k, v]) => `<div class="kv"><span>${k}</span><strong>${esc(v) || '<em class="muted">não definido</em>'}</strong></div>`).join('')}</div>
  <div class="panel"><h3>Instruções para IA</h3><p>${esc(b.instructions) || '<span class="muted">Nenhuma instrução definida.</span>'}</p><div class="section-row" style="margin-top:12px"><h3>Assets</h3><button class="btn sm" onclick="openModal('asset')">＋ Asset</button></div><div class="list">${p.assets.map(a => `<div class="list-item"><span>${esc(a.name)}</span><strong>${esc(a.category)}</strong></div>`).join('') || '<p class="muted">Nenhum asset registrado.</p>'}</div></div></div>
  <div class="panel" style="margin-top:14px"><div class="section-row"><div><h3>Voice Brain</h3><p class="muted">Como falamos: personalidade, vocabulário e regras de construção.</p></div><button class="btn dark sm" onclick="openModal('voiceEdit')">Editar Voice Brain</button></div>${[['Personalidade', 'personality'], ['Princípios', 'principles'], ['Vocabulário', 'vocabulary'], ['Anti-vocabulário', 'antivocab'], ['Regras de construção', 'rules'], ['Tom por canal', 'channels'], ['Exemplos', 'examples'], ['Checklist', 'checklist']].map(([l, k]) => `<div class="kv"><span>${l}</span><strong>${esc(p.voice[k]) || '<em class="muted">não definido</em>'}</strong></div>`).join('')}</div>`;
}

/* ---- configurações ---- */
function renderSettings() {
  $('settingsRoot').innerHTML = `<div class="page-head"><div><h1>Configurações</h1><p>Workspace, dados e integrações.</p></div></div>
  <div class="panel"><div class="form-grid"><div class="field"><label>Nome do workspace</label><input id="workspaceName" value="${esc(state.workspace.name)}"></div>
    <div class="field"><label>Projeto principal</label><select id="mainProject" onchange="setActiveProject(this.value);updateContextUI()">${state.projects.map(p => `<option value="${p.id}" ${p.id === state.activeProjectId ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div>
    <div class="field full"><label>Instrução global</label><textarea id="globalInstruction">${esc(state.workspace.instruction)}</textarea></div>
    <div class="field full"><label>URL de captura de leads (usada nas landing pages exportadas)</label><input id="leadsUrl" placeholder="https://seusite.com/api/leads.php?token=...&project=ID" value="${esc(state.workspace.leadsUrl || '')}"></div></div>
    <div style="margin-top:15px"><button class="btn dark" onclick="saveSettings()">Salvar configurações</button></div></div>
  <div class="panel" style="margin-top:14px"><h3>Seus dados</h3><p class="muted">Tudo é salvo neste navegador. Exporte regularmente ou ative a sincronização com o servidor.</p><div class="actions" style="flex-wrap:wrap"><button class="btn" onclick="exportWorkspace()">⬇ Exportar workspace</button><button class="btn" onclick="exportProject()">⬇ Exportar projeto atual</button><button class="btn" onclick="$('importFile').click()">⬆ Importar JSON</button><button class="btn" onclick="resetWorkspace()">Reiniciar exemplo</button></div></div>
  <h2 style="margin:22px 0 10px;font-size:18px">Integrações</h2>${integrationsHTML()}`;
}
function saveSettings() { state.workspace.name = $('workspaceName').value; state.workspace.instruction = $('globalInstruction').value; state.workspace.leadsUrl = $('leadsUrl').value.trim(); persist(); toast('Configurações salvas.'); }
