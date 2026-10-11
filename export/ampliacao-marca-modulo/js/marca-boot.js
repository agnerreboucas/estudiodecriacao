/* Ajustes do módulo de Marca e Briefing (carregado depois das telas, antes do app.js) */
const MK_TABS = {briefing: 'Briefing do cliente', products: 'Produtos e serviços', identity: 'Marca e arquétipo', intake: 'Materiais do cliente', resumo: 'Resumo para o site'};
/* projeto novo: formulário simples */
function openWizard(name) {
  showModal('Novo cliente', `<div class="form-grid"><div class="field"><label>Nome do cliente / empresa</label><input id="npName" value="${esc(name || '')}" placeholder="Ex.: Escritório Silva Advocacia"></div>
    <div class="field"><label>Categoria</label><input id="npCat" placeholder="Ex.: Advocacia, Odontologia, Curso online"></div>
    <div class="field full"><label>Objetivo do projeto</label><input id="npGoal" placeholder="Ex.: Criar o site e a marca"></div></div>
    <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="createProject();ui.tab='briefing';go('project')">Criar cliente</button></div>`);
  setTimeout(() => $('npName') && $('npName').focus(), 50);
}
function openProject(id) { setActiveProject(id); if (typeof updateContextUI === 'function') updateContextUI(); ui.tab = 'briefing'; go('project'); }
function bfRerender() { if (ui.page === 'project') keepScroll(renderProjectTab); }

/* ---------- resumo do briefing para o projeto de site ---------- */
function mkProducts(p) {
  return (p.products || []).map(x => [`### ${x.name}${x.type ? ' (' + x.type + ')' : ''}`, x.summary && x.summary, x.audience && 'Para quem: ' + x.audience, x.price && 'Preço: ' + x.price, x.checkout && 'Link: ' + x.checkout,
    (x.benefits || []).length && 'Benefícios: ' + x.benefits.join('; '), (x.features || []).length && 'Como funciona / incluso: ' + x.features.join('; '), (x.objections || []).length && 'Objeções: ' + x.objections.join('; '), (x.proofs || []).length && 'Provas: ' + x.proofs.join('; ')].filter(Boolean).join('\n')).join('\n\n');
}
function mkLinks(p) { const it = p.intake || {links: {}}; return IN_LINKS.filter(k => (it.links[k] || '').trim()).map(k => `- ${IN_LINK_LAB[k]}: ${it.links[k].trim()}`).join('\n'); }
function mkDepoimentos(p) { return ((p.intake || {}).testimonials || []).filter(t => t.text || t.who).map(t => `- ${t.who || 'Sem nome'}${t.product ? ' (' + t.product + ')' : ''} · ${IN_AUTH[t.auth]}${t.text ? ': "' + t.text + '"' : ''}${t.link ? ' ' + t.link : ''}`).join('\n'); }
function mkBriefMD(p) {
  const b = p.brief || {}, sec = (t, body) => body && String(body).trim() ? `\n## ${t}\n${body}\n` : '';
  return `# Briefing para o site · ${p.client || p.name}\n` + sec('Empresa', [p.client && 'Nome: ' + p.client, b.offer && 'O que oferece: ' + b.offer, b.audience && 'Público: ' + b.audience, b.problem && 'Problema que resolve: ' + b.problem, b.goal && 'Metas: ' + b.goal, b.channels && 'Canais: ' + b.channels, b.competitors && 'Concorrentes: ' + b.competitors, b.notes && b.notes].filter(Boolean).join('\n'))
    + sec('Produtos e serviços', mkProducts(p)) + sec('Marca: valores, arquétipo e voz', typeof identityTxt === 'function' ? identityTxt(p) : '') + sec('Links', mkLinks(p)) + sec('Depoimentos', mkDepoimentos(p))
    + sec('Arquivos recebidos', ((p.intake || {}).files || []).map(f => `- ${IN_CAT[f.cat] || f.cat}: ${f.name}`).join('\n'))
    + `\n---\nRegra: não inventar dados, números ou resultados. Depoimentos só os autorizados. O que está em branco ainda não foi informado.\n`;
}
function mkResumoHTML(p) {
  const md = mkBriefMD(p), n = {prod: (p.products || []).length, links: IN_LINKS.filter(k => ((p.intake || {}).links || {})[k]).length, dep: ((p.intake || {}).testimonials || []).length, files: ((p.intake || {}).files || []).length, id: !!(p.identity && (p.identity.values.length || p.identity.attitudes.length))};
  return `<div class="panel"><div class="section-row"><div><h3>Resumo para o projeto de site</h3><p class="muted" style="margin:2px 0 0;font-size:12.5px">Tudo o que o cliente informou, num lugar só. O módulo de Sites usa estes mesmos dados: produtos e serviços para as páginas, marca e voz para o texto, depoimentos autorizados como prova, fotos e links como material.</p></div></div>
  <div class="id-tags" style="margin:10px 0"><span class="id-tag">${n.prod} produto(s)/serviço(s)</span><span class="id-tag">${n.id ? 'marca definida' : 'marca ainda não definida'}</span><span class="id-tag">${n.links} link(s)</span><span class="id-tag">${n.dep} depoimento(s)</span><span class="id-tag">${n.files} arquivo(s)</span></div>
  <div class="row-gap" style="flex-wrap:wrap;margin-bottom:10px"><button class="btn dark" onclick="download('briefing-'+slug(curProject().name)+'.md',mkBriefMD(curProject()),'text/markdown')">⬇ Baixar o briefing (.md)</button><button class="btn" onclick="exportProject()">⬇ Exportar o projeto (.json) para o módulo de Sites</button><button class="btn" onclick="try{navigator.clipboard.writeText(mkBriefMD(curProject()));toast('Copiado.')}catch(e){toast('Copie pelo texto abaixo.')}">Copiar</button></div>
  <pre style="white-space:pre-wrap;background:#fafafa;border:1px solid #eee;border-radius:10px;padding:12px;font:12.5px/1.55 system-ui;max-height:60vh;overflow:auto">${esc(md)}</pre></div>`;
}
TABS.briefing = p => (typeof briefingPanel === 'function' ? briefingPanel(p) : '') + `<p class="muted" style="margin:10px 2px;font-size:12.5px">Quando o cliente enviar, use <b>Importar respostas</b>: empresa, produtos e serviços, depoimentos, links e fotos entram neste projeto. Em seguida, defina a marca com ele na aba <b>Marca e arquétipo</b> (ou mande o link só dessa parte).</p>`;
TABS.resumo = mkResumoHTML;

function renderProjectTab() {
  const p = curProject(), c = $('projectContent'); if (!c) return;
  if (!p) { c.innerHTML = emptyState('Nenhum cliente ainda', 'Crie um cliente para começar o briefing.', '<button class="btn dark" onclick="openWizard()">＋ Novo cliente</button>'); return; }
  if (!MK_TABS[ui.tab]) ui.tab = 'briefing';
  const hero = document.querySelector('#page-project .project-hero');
  hero.querySelector('h2').textContent = p.client || p.name; hero.querySelector('p').textContent = (p.desc || '') + (p.goal ? ' · ' + p.goal : ''); hero.querySelector('.eyebrow').textContent = 'Cliente';
  hero.querySelector('.pill-status').style.display = 'none';
  document.querySelectorAll('#projectNav button').forEach(b => b.classList.toggle('active', b.dataset.tab === ui.tab));
  c.innerHTML = TABS[ui.tab](p);
}
ui.page = 'project'; ui.tab = 'briefing';
/* o aviso de importação do Studio completo oferece "Gerar o pré-projeto"; aqui o próximo passo é a marca e o resumo para o site */
{ const mkShow = showModal; showModal = function (t, b) { if (t === 'Briefing importado') b = String(b).replace('Agora a IA usa esse material quando você gerar o pré-projeto, os anúncios, os posts e as páginas.', 'Próximo passo: defina a marca com o cliente (aba Marca e arquétipo) e use o resumo para o projeto de site.').replace(/<button class="btn dark" onclick="closeModal\(\);preGenAll\(true\)">[^<]*<\/button>/, '<button class="btn dark" onclick="closeModal();ui.tab=\'identity\';renderProjectTab()">Definir a marca</button>'); return mkShow(t, b); }; }
