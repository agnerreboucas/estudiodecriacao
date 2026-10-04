/* Abas do projeto: visão geral, estratégia, feed, landing pages, anúncios, publicação, performance, integrações, configurações */
function metricTotals(p) {
  const t = {spend: 0, impressions: 0, clicks: 0, leads: 0, conversions: 0};
  p.metrics.forEach(m => { t.spend += +m.spend || 0; t.impressions += +m.impressions || 0; t.clicks += +m.clicks || 0; t.leads += +m.leads || 0; t.conversions += +m.conversions || 0; });
  return Object.assign(t, {n: p.metrics.length, cpl: t.leads ? t.spend / t.leads : null, ctr: t.impressions ? t.clicks / t.impressions * 100 : null, clickToLead: t.clicks ? t.leads / t.clicks * 100 : null, cac: t.conversions ? t.spend / t.conversions : null});
}
/* ---- fluxo do projeto: do briefing ao aprendizado ---- */
function projectFlow(p) {
  const pre = p.pre, cr = creativesOf(p.id), journeyOk = pre.journey.filter(s => ['situacao', 'duvida', 'dor', 'desejo', 'gatilho', 'objecao', 'confianca'].filter(k => s[k]).length >= 3).length >= 3;
  const st = [
    ['Briefing', !!(p.brief.original || pre.briefing), 'projectSettings', 'Contexto original do cliente'],
    ['Diagnóstico e hipóteses', preItems(pre).length > 0, 'preproject', 'Desafios → hipóteses'],
    ['Pré-Projeto', pre.status === 'APROVADO', 'preproject', pre.status],
    ['Posicionamento', pre.positioningApproved, 'strategy', 'Gate antes da estratégia'],
    ['Estratégia', pre.positioningApproved && pre.icps.length > 0 && pre.okr.tr.length > 0, 'strategy', 'ICPs + OKR'],
    ['Jornada', journeyOk, 'preproject', 'Etapas descritas'],
    ['Referências', p.competitors.some(hasTeardown), 'radar', 'Concorrentes analisados'],
    ['Estilo visual', p.design.styles.length > 0, 'page:design', 'Estilo de campanha salvo'],
    ['Comunicação', false, '', 'Matriz de Comunicação', true],
    ['Produção', cr.some(c => ['Aprovado', 'Publicado'].includes(c.status)) && p.matrix.concepts.length > 0, 'page:matrix', 'Artes e vídeos'],
    ['Publicação', p.publications.some(x => x.status === 'Publicado'), 'page:publishingHub', 'Só o que foi aprovado'],
    ['Resultados', p.metrics.length > 0, 'performance', 'Métricas reais'],
    ['Aprendizado', (learnWeights(p).rows.length + learnDesign(p).rows.length) > 0, 'performance', 'Pesos da matriz']
  ];
  let cur = false;
  return st.map(([label, done, to, hint, soon]) => { let s = soon ? 'soon' : done ? 'done' : !cur ? (cur = true, 'current') : 'todo'; return {label, state: s, to, hint}; });
}
function flowGo(to) {
  if (!to) { toast('Matriz de Comunicação: próxima etapa do desenvolvimento.'); return; }
  if (to.startsWith('page:')) go(to.slice(5)); else { ui.tab = to; renderProjectTab(); }
}
function flowHTML(p) {
  const f = projectFlow(p), cur = f.find(x => x.state === 'current');
  return `<div class="flow-wrap"><div class="section-row"><h3 style="margin:0">Fluxo do projeto</h3><small class="muted">${cur ? 'Agora: <b>' + esc(cur.label) + '</b>' : 'Fluxo completo'}</small></div><div class="flow-steps">${f.map((x, i) => `<button class="fs ${x.state}" onclick="flowGo('${x.to}')" title="${esc(x.hint)}"><i>${x.state === 'done' ? '✓' : i + 1}</i><span>${esc(x.label)}</span><small>${x.state === 'soon' ? 'em breve' : x.state === 'current' ? 'em andamento' : x.state === 'done' ? 'concluído' : 'a fazer'}</small></button>`).join('')}</div></div>`;
}
const SRC_LABEL = {livre: 'Briefing escrito', audio: 'Briefing em áudio', entrevista: 'Entrevista guiada'};
function fichaHTML(p) {
  const b = p.brief, has = BRIEF_FIELDS.some(([k]) => b[k]);
  if (p.brief.hasAudio) setTimeout(() => loadBriefAudio(p), 0);
  return `<div class="panel" style="margin-top:14px"><div class="section-row"><div><h3>Ficha do projeto</h3><p class="muted">${b.source ? SRC_LABEL[b.source] + ' · ' + fmtDate(b.createdAt) : 'Sem briefing estruturado'} ${tag('dado')}</p></div><button class="btn sm" onclick="ui.tab='projectSettings';renderProjectTab()">Editar</button></div>
    ${has ? BRIEF_FIELDS.filter(([k]) => b[k]).map(([k, l]) => `<div class="kv"><span>${l}</span><strong>${esc(b[k])}</strong></div>`).join('') : '<p class="muted">Preencha a ficha em Configurações do projeto.</p>'}
    ${p.brief.hasAudio ? `<div class="kv"><span>Áudio original</span><strong><audio id="briefAudio" controls style="width:100%"></audio></strong></div>` : ''}
    ${b.original ? `<details class="jp-history"><summary>Briefing original (preservado)</summary><div style="white-space:pre-wrap">${esc(b.original)}</div></details>` : ''}</div>`;
}
async function loadBriefAudio(p) { const el = $('briefAudio'); if (!el) return; try { const b = await audioGet(p.id); if (b) el.src = URL.createObjectURL(b); else el.replaceWith(Object.assign(document.createElement('small'), {textContent: 'Áudio não encontrado neste navegador (foi gravado em outro).'})); } catch (e) { /* sem IndexedDB */ } }
const dash = (v, f) => v == null ? '—' : f(v);
function gateBanner(p) {
  const s = p.pre.status, apr = s === 'APROVADO';
  return `<div class="gate-banner ${apr ? 'ok' : ''}"><div><b>PRÉ-PROJETO ${esc(s)}</b>${apr ? `<span class="arrow">↓</span><small>Próximo gate: <b>${p.pre.positioningApproved ? 'ESTRATÉGIA' : 'POSICIONAMENTO'}</b></small>` : '<small>A produção pode começar, mas a estratégia definitiva só depois da validação.</small>'}</div><button class="btn sm" onclick="ui.tab='preproject';renderProjectTab()">${apr ? 'Ver pré-projeto' : 'Continuar pré-projeto'}</button></div>`;
}
function nextActions(p) {
  const a = [], pre = p.pre, pend = p.approvals.filter(x => x.status === 'Pendente').length;
  if (typeof bfStore === 'function' && !bfStore(p).t && !(p.brief && p.brief.offer && String(p.brief.offer).length > 120)) a.push(['Enviar o briefing detalhado ao cliente', 'Empresa, público e cada produto ou serviço', "ui.tab='preproject';renderProjectTab()"]);
  if (pre.status !== 'APROVADO') a.push(['Concluir e aprovar o Pré-Projeto', 'Status: ' + pre.status, "ui.tab='preproject';renderProjectTab()"]);
  else if (!pre.positioning) a.push(['Definir o Posicionamento', 'Gate depois do pré-projeto aprovado', "ui.tab='strategy';renderProjectTab()"]);
  if (!p.matrix.concepts.length) a.push(['Gerar conceitos na Matriz de Criação', 'Primeiro conceito, depois produção', "go('matrix')"]);
  if (pend) a.push([`Revisar ${pend} item(ns) em Aprovação`, 'Gate antes de publicar', "go('approval')"]);
  if (!p.metrics.length) a.push(['Registrar as primeiras métricas', 'Alimenta o aprendizado da matriz', "ui.tab='performance';renderProjectTab()"]);
  if (!p.publications.length) a.push(['Preparar a primeira publicação', 'Só criações aprovadas', "go('publishingHub')"]);
  return a.slice(0, 4);
}
const TABS = {
  overview(p) {
    const t = metricTotals(p), cr = creativesOf(p.id), pre = p.pre, icp = pre.icps[0];
    return flowHTML(p) + gateBanner(p) + `<div class="cards"><div class="card"><div class="label">Investimento</div><div class="metric">${dash(t.n ? t.spend : null, fmtMoney)}</div><div class="trend">${t.n ? t.n + ' registro(s)' : 'sem métricas ainda'}</div></div>
      <div class="card"><div class="label">Leads</div><div class="metric">${t.n ? fmtNum(t.leads) : '—'}</div><div class="trend">${t.n ? 'no período registrado' : 'registre em Performance'}</div></div>
      <div class="card"><div class="label">CPL médio</div><div class="metric">${dash(t.cpl, fmtMoney)}</div><div class="trend">investimento ÷ leads</div></div>
      <div class="card"><div class="label">Criações</div><div class="metric">${cr.length}</div><div class="trend">${cr.filter(c => c.status === 'Para aprovação').length} em aprovação</div></div></div>
    <div class="two"><div class="panel"><h3>Próximas ações</h3><div class="list">${nextActions(p).map(x => `<div class="list-item clickable" onclick="${x[2]}"><div><strong>${esc(x[0])}</strong><small>${esc(x[1])}</small></div><span>→</span></div>`).join('') || '<p class="muted">Tudo em dia.</p>'}</div></div>
      <div class="panel"><h3>Resumo estratégico</h3><div class="kv"><span>ICP principal</span><strong>${esc(icp ? icp.name : 'não definido')}</strong></div><div class="kv"><span>Objetivo ${tag(pre.status === 'APROVADO' ? 'decisao' : 'recomendacao')}</span><strong>${esc(pre.objective) || '<em class="muted">definir no Pré-Projeto</em>'}</strong></div><div class="kv"><span>Posicionamento</span><strong>${esc(pre.positioning) || '<em class="muted">próximo gate</em>'}</strong></div><div class="kv"><span>Context ID</span><strong class="mono">${esc(p.ctx)}</strong></div></div></div>` + fichaHTML(p);
  },
  strategy(p) {
    const pre = p.pre, apr = pre.status === 'APROVADO';
    const posBox = apr ? `<div class="panel"><div class="section-row"><div><h3>Posicionamento ${pre.positioningApproved ? tag('decisao') : tag('recomendacao')}</h3><p class="muted">Como a empresa quer ocupar espaço na mente do mercado. Este gate vem antes da estratégia definitiva.</p></div></div>
        <textarea class="jp-ta" rows="4" placeholder="Ex.: Para [ICP] que [situação], a [marca] é a [categoria] que [diferencial], porque [prova]." onchange="savePositioning(this.value)">${esc(pre.positioning)}</textarea>
        <div class="modal-actions" style="justify-content:flex-start"><button class="btn dark" onclick="approvePositioning()" ${pre.positioningApproved ? 'disabled' : ''}>${pre.positioningApproved ? '✓ Posicionamento aprovado' : 'Aprovar posicionamento'}</button></div></div>`
      : `<div class="panel locked"><h3>Posicionamento 🔒</h3><p>Disponível depois que o Pré-Projeto for aprovado. Status atual: <b>${esc(pre.status)}</b>.</p><button class="btn" onclick="ui.tab='preproject';renderProjectTab()">Ir para o Pré-Projeto</button></div>`;
    return gateBanner(p) + `<div class="two"><div class="panel"><div class="section-row"><h3>ICPs prioritários</h3><button class="btn sm" onclick="ui.tab='preproject';renderProjectTab()">Editar</button></div>${pre.icps.map((x, i) => `<div class="kv"><span>ICP ${i + 1}</span><strong>${esc(x.name)}${x.need ? `<small class="sub-line">${esc(x.need)}</small>` : ''}</strong></div>`).join('') || '<p class="muted">Defina os ICPs no Pré-Projeto.</p>'}</div>
      <div class="panel"><div class="section-row"><h3>Jornada ${tag('hipotese')}</h3></div><div class="list">${pre.journey.map((s, i) => `<div class="list-item"><div><strong>${pad(i + 1, 2)} · ${esc(s.name)}</strong>${s.dor ? `<small>Dor: ${esc(s.dor)}</small>` : ''}</div><span>${esc(s.gatilho || '')}</span></div>`).join('')}</div></div></div><div style="margin-top:14px">${posBox}</div>`;
  },
  matrix(p) {
    const m = p.matrix; return `<div class="panel"><div class="section-row"><h2>Matriz Combinatória</h2><button class="btn dark" onclick="go('matrix')">Abrir matriz completa</button></div><p>O projeto fornece o contexto; a matriz transforma esse contexto em combinações de hooks, ângulos, formatos, direção e CTA.</p>
      <div class="cards"><div class="card"><div class="label">Conceitos gerados</div><div class="metric">${m.concepts.length}</div></div><div class="card"><div class="label">No funil</div><div class="metric">${Math.min(m.stage, m.concepts.length)}</div></div><div class="card"><div class="label">Em produção</div><div class="metric">${m.concepts.filter(c => c.creativeId).length}</div></div><div class="card"><div class="label">Duração</div><div class="metric">${m.duration}s</div></div></div></div>`;
  },
  videoLab(p) { return `<div class="panel"><div class="section-row"><h2>Video Lab</h2><button class="btn dark" onclick="go('videoLab')">Abrir laboratório</button></div><p>Produção modular por cena, com roteiro aprovado, storyboard, direção, roteamento de modelo e estimativa de créditos.</p><div class="kv"><span>Cenas planejadas</span><strong>${p.video.scenes.length || '—'}</strong></div></div>`; },
  radar(p) { return radarHTML(p); },
  creative(p) {
    const cr = creativesOf(p.id);
    return `<div class="section-row"><h2>Feed criativo</h2><button class="btn dark" onclick="openModal('creative')">＋ Nova criação</button></div>${cr.length ? `<div class="masonry">${cr.map(artCard).join('')}</div>` : emptyState('Sem criações', 'Registre a primeira criação ou gere conceitos na Matriz.')}`;
  },
  landing(p) {
    return `<div class="two"><div class="panel"><div class="section-row"><h3>Landing Pages</h3><button class="btn dark sm" onclick="go('landings');setTimeout(lpNewModal,50)">＋ Nova</button></div><div class="list">${p.landings.map(l => `<div class="list-item"><div><strong>${esc(l.name)}</strong><small>${esc(l.goal)} · ${esc(l.status)}</small></div><div class="row-gap"><button class="btn sm" onclick="go('landings');lpOpen('${l.id}')">Abrir no editor</button><button class="btn sm" onclick="landingExport('${l.id}')">Exportar HTML</button><button class="btn sm" onclick="landingDelete('${l.id}')">×</button></div></div>`).join('') || '<p class="muted">Nenhuma landing page ainda.</p>'}</div></div>
      <div class="panel"><h3>Estrutura padrão</h3><div class="kv"><span>Hero</span><strong>Problema + promessa</strong></div><div class="kv"><span>Prova</span><strong>Casos e autoridade</strong></div><div class="kv"><span>CTA</span><strong>Formulário e WhatsApp</strong></div><p class="muted" style="font-size:11px">O HTML exportado já traz um formulário que envia o lead para o seu endpoint (Configurações → URL de captura de leads). Suba o arquivo na Hostinger.</p></div></div>`;
  },
  ads(p) { return campaignsHTML(p); },
  publishing(p) { return publishingHTML(p); },
  performance(p) { return performanceHTML(p); },
  integrations() { return integrationsHTML(); },
  projectSettings(p) {
    return `<div class="panel"><div class="form-grid"><div class="field"><label>Nome do projeto</label><input id="psName" value="${esc(p.name)}"></div><div class="field"><label>Status</label><select id="psStatus">${['Em desenvolvimento', 'Ativo', 'Pausado', 'Concluído'].map(s => `<option ${s === p.status ? 'selected' : ''}>${s}</option>`).join('')}</select></div><div class="field full"><label>Descrição</label><input id="psDesc" value="${esc(p.desc)}"></div><div class="field full"><label>Objetivo do projeto</label><textarea id="psGoal">${esc(p.goal)}</textarea></div><div class="field full"><label>Cliente / empresa</label><input id="psClient" value="${esc(p.client)}"></div></div>
      <h3 style="margin:18px 0 6px">Ficha do briefing</h3><p class="muted" style="font-size:11px;margin-top:0">Edite o que mudou depois da conversa inicial. O briefing original continua guardado sem alterações.</p><div class="form-grid">${BRIEF_FIELDS.map(([k, l]) => `<div class="field full"><label>${l}</label><textarea id="pb_${k}" rows="2">${esc(p.brief[k])}</textarea></div>`).join('')}<div class="field full"><label>Observações</label><textarea id="pb_notes" rows="2">${esc(p.brief.notes)}</textarea></div></div>
      <div class="actions" style="margin-top:15px;flex-wrap:wrap"><button class="btn dark" onclick="saveProjectSettings()">Salvar projeto</button><button class="btn" onclick="exportProject('${p.id}')">⬇ Exportar projeto</button><button class="btn" onclick="deleteProject('${p.id}')">Excluir projeto</button></div></div>`;
  }
};
function renderProjectTab() {
  const p = curProject(), c = $('projectContent'); if (!c) return;
  if (!p) { c.innerHTML = emptyState('Nenhum projeto', 'Crie um projeto para começar.'); return; }
  const hero = document.querySelector('#page-project .project-hero');
  hero.querySelector('h2').textContent = p.name;
  hero.querySelector('p').textContent = (p.desc || '') + (p.goal ? ' · ' + p.goal : '');
  hero.querySelector('.eyebrow').textContent = 'Projeto · ' + p.ctx;
  hero.querySelector('.pill-status').textContent = '● ' + p.status;
  document.querySelectorAll('#projectNav button').forEach(b => b.classList.toggle('active', b.dataset.tab === ui.tab));
  const arch = $('archOverview'); if (arch) arch.style.display = ui.tab === 'overview' ? '' : 'none';
  if (ui.tab === 'preproject') { renderPre(); return; }
  c.innerHTML = (TABS[ui.tab] || TABS.overview)(p);
}
function savePositioning(v) { const pre = curProject().pre; pre.positioning = v; pre.positioningApproved = false; persist(); }
function approvePositioning() {
  const pre = curProject().pre; if (!pre.positioning.trim()) { toast('Escreva o posicionamento antes de aprovar.'); return; }
  if (!confirm('Aprovar o posicionamento? Isso libera a Estratégia definitiva.')) return;
  pre.positioningApproved = true; pre.history.unshift({at: new Date().toISOString(), action: 'Posicionamento aprovado', note: ''}); persist(); renderProjectTab(); toast('Posicionamento aprovado. Próximo gate: Estratégia.');
}
function saveProjectSettings() { const p = curProject(); p.name = $('psName').value.trim() || p.name; p.status = $('psStatus').value; p.desc = $('psDesc').value; p.goal = $('psGoal').value; p.client = $('psClient').value; BRIEF_FIELDS.concat([['notes']]).forEach(([k]) => { p.brief[k] = $('pb_' + k).value; }); persist(); renderProjectTab(); updateContextUI(); toast('Projeto salvo.'); }
function deleteProject(id) {
  const p = projectById(id); if (!confirm(`Excluir "${p.name}" e todas as suas criações? Exporte antes se quiser guardar.`)) return;
  state.projects = state.projects.filter(x => x.id !== id); state.creatives = state.creatives.filter(c => c.projectId !== id);
  state.activeProjectId = state.projects[0] ? state.projects[0].id : ''; persist(); updateContextUI(); go('projects'); toast('Projeto excluído.');
}

/* ---- landing pages exportáveis ---- */
function landingModal(id) {
  const l = id ? curProject().landings.find(x => x.id === id) : {name: 'LP — Nova oportunidade', goal: 'Gerar lead', headline: '', sub: '', bullets: '', cta: 'Quero entender meu caso', whatsapp: '', status: 'Rascunho'};
  showModal(id ? 'Editar landing page' : 'Nova landing page', `<div class="form-grid"><div class="field"><label>Nome interno</label><input id="lpName" value="${esc(l.name)}"></div><div class="field"><label>Objetivo</label><select id="lpGoal">${['Gerar lead', 'WhatsApp', 'Conteúdo'].map(s => `<option ${s === l.goal ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
    <div class="field full"><label>Headline (problema + promessa)</label><input id="lpHead" value="${esc(l.headline)}" placeholder="Entenda seu próximo passo antes de decidir"></div><div class="field full"><label>Subtítulo</label><input id="lpSub" value="${esc(l.sub)}"></div>
    <div class="field full"><label>Pontos de prova (um por linha)</label><textarea id="lpBullets" rows="3">${esc(l.bullets)}</textarea></div><div class="field"><label>Texto do botão</label><input id="lpCta" value="${esc(l.cta)}"></div><div class="field"><label>WhatsApp (só números, com DDI)</label><input id="lpWa" value="${esc(l.whatsapp)}" placeholder="5511999999999"></div></div>
    <div class="modal-actions"><button class="btn dark" onclick="landingSave('${id}')">Salvar</button></div>`);
}
function landingSave(id) {
  const p = curProject(), o = {name: $('lpName').value.trim() || 'Landing', goal: $('lpGoal').value, headline: $('lpHead').value.trim(), sub: $('lpSub').value.trim(), bullets: $('lpBullets').value, cta: $('lpCta').value.trim() || 'Enviar', whatsapp: $('lpWa').value.replace(/\D/g, ''), status: 'Rascunho'};
  if (id) Object.assign(p.landings.find(x => x.id === id), o); else p.landings.push(Object.assign({id: uid('lp')}, o));
  persist(); closeModal(); renderProjectTab(); toast('Landing salva.');
}
function landingDelete(id) { if (!confirm('Excluir esta landing page?')) return; const p = curProject(); p.landings = p.landings.filter(x => x.id !== id); persist(); renderProjectTab(); }
function landingHTML(l, p) {
  const leadsUrl = state.workspace.leadsUrl || '', b = p.brand;
  const bullets = l.bullets.split('\n').map(x => x.trim()).filter(Boolean);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(l.headline || l.name)}</title><style>*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,Arial,sans-serif;color:#111;background:#fafafa}main{max-width:720px;margin:0 auto;padding:56px 22px}h1{font-size:clamp(30px,6vw,46px);line-height:1.05;letter-spacing:-1.5px;margin:0 0 14px}p.sub{font-size:18px;color:#555;line-height:1.6}ul{padding:0;list-style:none;margin:26px 0}li{padding:12px 0 12px 28px;position:relative;border-bottom:1px solid #eee;font-size:15px}li:before{content:"✓";position:absolute;left:0;font-weight:700}form{background:#fff;border:1px solid #e6e6e6;border-radius:16px;padding:22px;display:grid;gap:12px}input,textarea{border:1px solid #ddd;border-radius:10px;padding:13px;font:inherit;width:100%}button,a.wa{border:0;border-radius:10px;background:#111;color:#fff;padding:14px;font:inherit;font-weight:700;cursor:pointer;text-align:center;text-decoration:none}a.wa{background:#1f8f4e;display:block;margin-top:12px}.hp{position:absolute;left:-9999px}small{color:#888}#ok{display:none;font-weight:700}</style></head><body><main>
<small>${esc(p.name)}${b.positioning ? ' · ' + esc(b.positioning) : ''}</small><h1>${esc(l.headline || l.name)}</h1>${l.sub ? `<p class="sub">${esc(l.sub)}</p>` : ''}${bullets.length ? `<ul>${bullets.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
${l.goal !== 'WhatsApp' ? `<form id="f"><input name="name" placeholder="Seu nome" required><input name="phone" placeholder="WhatsApp com DDD" required><input name="email" type="email" placeholder="E-mail (opcional)"><textarea name="message" rows="2" placeholder="Conte brevemente seu caso"></textarea><input class="hp" name="website" tabindex="-1" autocomplete="off"><button>${esc(l.cta)}</button><span id="ok">Recebemos seus dados. Entraremos em contato.</span><small>Usamos seus dados apenas para retornar o contato.</small></form>` : ''}
${l.whatsapp ? `<a class="wa" href="https://wa.me/${esc(l.whatsapp)}?text=${encodeURIComponent('Olá! Vim pela página: ' + (l.headline || l.name))}">${l.goal === 'WhatsApp' ? esc(l.cta) : 'Falar no WhatsApp'}</a>` : ''}
</main><script>var f=document.getElementById('f');if(f)f.addEventListener('submit',function(e){e.preventDefault();var d={source:'${esc(l.name).replace(/'/g, '')}'};new FormData(f).forEach(function(v,k){d[k]=v});var q=location.search.slice(1).split('&');q.forEach(function(x){var s=x.split('=');if(s[0].indexOf('utm_')===0)d[s[0]]=decodeURIComponent(s[1]||'')});
var url=${JSON.stringify(leadsUrl).replace(/</g, '\\u003c')};if(!url){alert('Configure a URL de captura de leads no Studio.');return}
fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(function(r){if(!r.ok)throw 0;f.querySelectorAll('input,textarea,button').forEach(function(x){x.disabled=true});document.getElementById('ok').style.display='block'}).catch(function(){alert('Não foi possível enviar. Tente pelo WhatsApp.')})});</script></body></html>`;
}
function landingExport(id) {
  const p = curProject(), l = p.landings.find(x => x.id === id);
  if (l.blocks && l.blocks.length) { lpExport(id); return; }
  if (!state.workspace.leadsUrl && l.goal !== 'WhatsApp') toast('Dica: defina a URL de captura de leads em Configurações antes de publicar.');
  download(`${slug(l.name)}.html`, landingHTML(l, p), 'text/html'); l.status = 'Exportada'; persist(); renderProjectTab();
}
