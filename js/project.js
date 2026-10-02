function renderProjectTab(){
  if(state.projectTab==='preproject'){renderJourneyArchitect();return;}
  document.querySelectorAll('#projectNav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.projectTab));
  const c=$('projectContent');
  if(state.projectTab==='overview')c.innerHTML=`
    <div class="cards">
      <div class="card"><div class="label">Investimento</div><div class="metric">R$ 8,4k</div><div class="trend">↑ 12% no período</div></div>
      <div class="card"><div class="label">Leads</div><div class="metric">326</div><div class="trend">↑ 18% no período</div></div>
      <div class="card"><div class="label">CPL médio</div><div class="metric">R$ 25,76</div><div class="trend">↓ 9% no período</div></div>
      <div class="card"><div class="label">Criativos ativos</div><div class="metric">24</div><div class="trend">8 em teste</div></div>
    </div>
    <div class="two">
      <div class="panel"><h3>Próximas ações</h3><div class="list">
        <div class="list-item"><div><strong>Produzir lote de 12 criativos</strong><small>Feed criativo · hoje</small></div><span>→</span></div>
        <div class="list-item"><div><strong>Revisar jornada de compra</strong><small>Estratégia · amanhã</small></div><span>→</span></div>
        <div class="list-item"><div><strong>Publicar nova landing</strong><small>Conversão · 05/10</small></div><span>→</span></div>
      </div></div>
      <div class="panel"><h3>Resumo estratégico</h3><div class="kv"><span>ICP</span><strong>Mutuário em situação de dúvida</strong></div><div class="kv"><span>Canal</span><strong>Meta Ads + WhatsApp</strong></div><div class="kv"><span>Mensagem</span><strong>Clareza antes da decisão</strong></div></div>
    </div>`;
  if(state.projectTab==='strategy')c.innerHTML=`<div class="two"><div class="panel"><h3>Estratégia & ICP</h3><div class="kv"><span>Problema</span><strong>Falta de clareza sobre direitos e alternativas</strong></div><div class="kv"><span>Desejo</span><strong>Segurança para decidir</strong></div><div class="kv"><span>Objeção</span><strong>“Não sei se vale a pena buscar ajuda”</strong></div><div class="kv"><span>Prova</span><strong>Conteúdo educativo + autoridade</strong></div></div><div class="panel"><h3>Jornada de compra</h3><div class="list"><div class="list-item"><strong>01 · Descoberta</strong><span>Conteúdo</span></div><div class="list-item"><strong>02 · Problema</strong><span>Diagnóstico</span></div><div class="list-item"><strong>03 · Consideração</strong><span>Prova</span></div><div class="list-item"><strong>04 · Ação</strong><span>WhatsApp</span></div></div></div></div>`;
  if(state.projectTab==='matrix')c.innerHTML=`<div class="panel"><div class="section-row"><h2>Matriz Combinatória</h2><button class="btn dark" onclick="go('matrix')">Abrir matriz completa</button></div><p>O projeto fornece o briefing; a matriz transforma esse contexto em combinações de hooks, ângulos, formatos, direção e CTA.</p><div class="cards"><div class="card"><div class="label">Hooks</div><div class="metric">12</div></div><div class="card"><div class="label">Ângulos</div><div class="metric">10</div></div><div class="card"><div class="label">Formatos</div><div class="metric">8</div></div><div class="card"><div class="label">Combinações</div><div class="metric">7.680</div></div></div></div>`;
  if(state.projectTab==='videoLab')c.innerHTML=`<div class="panel"><div class="section-row"><h2>Video Lab</h2><button class="btn dark" onclick="go('videoLab')">Abrir laboratório</button></div><p>Produção modular por cena, com roteiro aprovado, storyboard, direção de fotografia, roteamento de modelo e estimativa de créditos.</p></div>`;
  if(state.projectTab==='creative')c.innerHTML=`<div class="section-row"><h2>Feed criativo</h2><button class="btn dark" onclick="openModal('creative')">＋ Nova criação</button></div><div class="masonry">${state.creatives.map((x,i)=>artCard(x,i)).join('')}</div>`;
  if(state.projectTab==='landing')c.innerHTML=`<div class="two"><div class="panel"><h3>Landing Pages</h3><div class="list">${['LP · Proteção patrimonial','LP · Revisão de contrato','LP · Diagnóstico inicial'].map((x,i)=>`<div class="list-item"><div><strong>${x}</strong><small>Conversão · versão ${i+1}</small></div><button class="btn" onclick="openModal('landing')">Abrir</button></div>`).join('')}</div></div><div class="panel"><h3>Estrutura padrão</h3><div class="kv"><span>Hero</span><strong>Problema + promessa</strong></div><div class="kv"><span>Prova</span><strong>Casos e autoridade</strong></div><div class="kv"><span>CTA</span><strong>WhatsApp</strong></div></div></div>`;
  if(state.projectTab==='ads')c.innerHTML=`<div class="cards"><div class="card"><div class="label">Campanhas</div><div class="metric">6</div></div><div class="card"><div class="label">Conjuntos</div><div class="metric">18</div></div><div class="card"><div class="label">Anúncios</div><div class="metric">72</div></div><div class="card"><div class="label">Testes</div><div class="metric">14</div></div></div><div class="panel" style="margin-top:15px"><div class="section-row"><h2>Campanhas</h2><button class="btn dark" onclick="openModal('campaign')">＋ Nova campanha</button></div><div class="list">${['01 · Educação — Dor','02 · Diagnóstico — Intenção','03 · Conversão — WhatsApp','04 · Remarketing — Prova'].map((x,i)=>`<div class="list-item"><div><strong>${x}</strong><small>${i%2?'R$ 120/dia':'R$ 150/dia'} · ${i+3} conjuntos</small></div><span>${i===2?'● Ativa':'○ Rascunho'}</span></div>`).join('')}</div></div>`;
  if(state.projectTab==='publishing')c.innerHTML=`<div class="two"><div class="panel"><h3>Calendário editorial</h3><div class="list">${['03/10 · Carrossel educativo','05/10 · Reels — dúvida comum','07/10 · Post — checklist','09/10 · Story — CTA'].map(x=>`<div class="list-item"><strong>${x}</strong><span>Agendar</span></div>`).join('')}</div></div><div class="panel"><h3>Canais</h3><div class="kv"><span>Instagram</span><strong>Conectado</strong></div><div class="kv"><span>Meta Ads</span><strong>Conectado</strong></div><div class="kv"><span>WhatsApp</span><strong>Conectado</strong></div></div></div>`;
  if(state.projectTab==='performance')c.innerHTML=`<div class="cards"><div class="card"><div class="label">CTR</div><div class="metric">2,84%</div><div class="trend">↑ 0,41 pp</div></div><div class="card"><div class="label">CPL</div><div class="metric">R$ 25,76</div><div class="trend">↓ 9%</div></div><div class="card"><div class="label">Conversão LP</div><div class="metric">8,7%</div><div class="trend">↑ 1,2 pp</div></div><div class="card"><div class="label">WhatsApp</div><div class="metric">41%</div><div class="trend">taxa de avanço</div></div></div><div class="panel" style="margin-top:15px"><h3>Leitura de performance</h3><p>Os melhores sinais estão concentrados em criativos educativos e mensagens que reduzem a incerteza antes do contato. Use este espaço para registrar hipóteses e próximos testes.</p></div>`;
  if(state.projectTab==='integrations')c.innerHTML=`<div class="integration-grid">${[['Meta Ads','Campanhas e métricas','Conectado'],['Instagram','Publicação e insights','Conectado'],['WhatsApp','Conversas e leads','Conectado'],['Google Analytics','Web e conversões','Conectar'],['Supabase','Dados do workspace','Conectado'],['Webhook','Automação do projeto','Conectar']].map(x=>`<div class="card"><div style="font-size:25px">◈</div><h3>${x[0]}</h3><p>${x[1]}</p><button class="btn ${x[2]==='Conectado'?'':'dark'}" onclick="toast('${x[2]==='Conectado'?'Integração configurada':'Configuração aberta'}')">${x[2]}</button></div>`).join('')}</div>`;
  if(state.projectTab==='projectSettings')c.innerHTML=`<div class="panel"><div class="form-grid"><div class="field"><label>Nome do projeto</label><input value="Mutuários Brasil"></div><div class="field"><label>Status</label><select><option>Em desenvolvimento</option><option>Ativo</option><option>Pausado</option></select></div><div class="field full"><label>Objetivo</label><textarea>Construir uma máquina de aquisição orientada pela jornada de compra.</textarea></div></div><div style="margin-top:15px"><button class="btn dark" onclick="toast('Projeto salvo')">Salvar projeto</button></div></div>`;
}
function openCreative(i){const x=state.creatives[i]||state.creatives[0];openModal('creativeDetail',x)}
function openCreate(){openModal('create')}
function setContext(projectName){
  const btn=$('contextButton');
  const hint=$('contextHint');
  if(projectName){
    btn.textContent='✓ '+projectName;
    hint.textContent='A IA vai considerar estratégia, Brand Brain, referências e assets deste projeto.';
    state.context=projectName;
  }else{
    btn.textContent='＋ Escolher projeto';
    hint.textContent='As novas peças podem usar estratégia, Brand Brain e referências do projeto.';
    state.context='';
  }
}
function openCreation(type){
  if(type==='context'){ openModal('context'); return; }
  openModal('creation', type);
}

function openModal(type,data){
  let title='Nova ação',body='';
  const creationNames={project:'Projeto',ad:'Anúncio',video:'Vídeo',post:'Post',carousel:'Post Carrossel',story:'Story',stories:'Sequência de Stories'};
  const creationIcons={project:'□',ad:'◉',video:'▷',post:'▣',carousel:'▤',story:'▯',stories:'▥'};
  if(type==='creation'){
    const selected=data||'project';
    title='Criar '+creationNames[selected];
    const current=state.context||'Nenhum projeto selecionado';
    const inherited=(selected!=='project' && state.context) ? `A criação será construída a partir de <strong>${state.context}</strong>, usando o contexto existente.` : 'Escolha um projeto existente ou crie um novo contexto para esta produção.';
    body=`
      <div class="creation-modal">
        <div class="creation-context-box">
          <span>Projeto de referência</span>
          <strong>${current}</strong>
          <button class="btn" onclick="closeModal();openModal('context')">Trocar</button>
        </div>
        <p style="color:#777;font-size:12px;line-height:1.6;margin:12px 0 18px">${inherited}</p>
        <div class="creation-options">
          ${Object.keys(creationNames).map(k=>`<button class="creation-option ${k===selected?'selected':''}" onclick="closeModal();openCreation('${k}')">
            <span>${creationIcons[k]}</span><strong>${creationNames[k]}</strong><small>${k==='project'?'Estratégia, ICP e Brand Brain':k==='ad'?'Conceito, copy e variações':k==='video'?'Roteiro, cenas e direção':'Formato pronto para produção'}</small>
          </button>`).join('')}
        </div>
        <div class="creation-form">
          <div class="field"><label>Nome da criação</label><input id="creationName" value="${creationNames[selected]} — novo conceito"></div>
          <div class="field"><label>Formato</label><select id="creationFormat">
            <option>${creationNames[selected]}</option>
            <option>Variação A</option><option>Variação B</option>
          </select></div>
          <div class="field full"><label>O que você quer criar?</label><textarea id="creationBrief" placeholder="Descreva objetivo, público, mensagem, oferta ou deixe a IA decidir com base no projeto."></textarea></div>
        </div>
        <div style="margin-top:15px;display:flex;justify-content:flex-end;gap:8px">
          <button class="btn" onclick="closeModal()">Cancelar</button>
          <button class="btn orange" onclick="confirmCreation('${selected}')">Criar ${creationNames[selected]}</button>
        </div>
      </div>`;
  }
  if(type==='context'){
    title='Escolher projeto';
    body=`
      <p style="color:#888;font-size:12px;margin-top:0">Quando você escolhe um projeto, toda nova criação pode herdar o contexto que já existe nele.</p>
      <div class="context-list">
        ${state.projects.map(p=>`<button class="context-project" onclick="selectContext('${p.name.replace(/'/g,"\\\\'")}')">
          <span class="context-cover ${p.cover}">${p.icon}</span>
          <span><strong>${p.name}</strong><small>${p.desc}</small></span>
          <b>→</b>
        </button>`).join('')}
        <button class="context-project new-context" onclick="closeModal();openModal('newproject')">
          <span class="context-cover">＋</span><span><strong>Novo projeto</strong><small>Começar um novo contexto</small></span><b>→</b>
        </button>
      </div>`;
  }
  if(type==='create')body=`<div class="project-grid"><div class="project-card" onclick="closeModal();go('project');state.projectTab='creative';setTimeout(renderProjectTab,0)"><div class="cover a5">✦</div><div class="body"><strong>Peça criativa</strong><small>Gerar uma nova criação</small></div></div><div class="project-card" onclick="closeModal();openModal('newproject')"><div class="cover a3">□</div><div class="body"><strong>Projeto</strong><small>Criar workspace de cliente</small></div></div><div class="project-card" onclick="closeModal();openModal('campaign')"><div class="cover a2">◉</div><div class="body"><strong>Campanha</strong><small>Estruturar mídia paga</small></div></div></div>`;
  if(type==='newproject'){title='Novo projeto';body=`<div class="form-grid"><div class="field"><label>Nome</label><input id="npName" placeholder="Ex.: Novo cliente"></div><div class="field"><label>Categoria</label><select><option>Marketing</option><option>Branding</option><option>Conteúdo</option></select></div><div class="field full"><label>Objetivo</label><textarea placeholder="O que este projeto precisa alcançar?"></textarea></div></div><div style="margin-top:15px"><button class="btn dark" onclick="createProject()">Criar projeto</button></div>`}
  if(type==='creative'){title='Nova criação';body=`<div class="form-grid"><div class="field"><label>Nome</label><input id="creativeName" value="Novo conceito — "></div><div class="field"><label>Formato</label><select id="creativeType"><option>Meta Ads</option><option>Instagram</option><option>Stories</option><option>Landing Page</option><option>Vídeo</option></select></div><div class="field full"><label>Briefing</label><textarea placeholder="Descreva a ideia, público, oferta e objetivo."></textarea></div></div><div style="margin-top:15px"><button class="btn orange" onclick="createCreative()">Gerar criação</button></div>`}
  if(type==='campaign'){title='Nova campanha';body=`<div class="form-grid"><div class="field"><label>Nome</label><input value="Nova campanha"></div><div class="field"><label>Objetivo</label><select><option>Leads</option><option>Tráfego</option><option>Conversões</option></select></div><div class="field"><label>Orçamento</label><input value="R$ 150/dia"></div><div class="field"><label>Canal</label><select><option>Meta Ads</option><option>Google Ads</option></select></div></div><div style="margin-top:15px"><button class="btn dark" onclick="closeModal();toast('Campanha criada como rascunho')">Criar campanha</button></div>`}
  if(type==='landing'){title='Landing Page';body=`<div class="form-grid"><div class="field"><label>Nome</label><input value="LP — Nova oportunidade"></div><div class="field"><label>Objetivo</label><select><option>Gerar lead</option><option>WhatsApp</option><option>Conteúdo</option></select></div><div class="field full"><label>Headline</label><input value="Entenda seu próximo passo antes de decidir"></div></div><div style="margin-top:15px"><button class="btn dark" onclick="closeModal();toast('Estrutura criada')">Criar estrutura</button></div>`}
  if(type==='asset'){title='Adicionar asset';body=`<div class="form-grid"><div class="field"><label>Nome</label><input placeholder="Ex.: Logo principal"></div><div class="field"><label>Categoria</label><select><option>Logo</option><option>Foto</option><option>Documento</option><option>Referência</option></select></div></div><div style="margin-top:15px"><button class="btn dark" onclick="closeModal();toast('Asset adicionado')">Adicionar</button></div>`}
  if(type==='brandEdit'){title='Editar Brand Brain';body=`<div class="form-grid"><div class="field full"><label>Posicionamento</label><input value="Orientação antes da decisão"></div><div class="field"><label>Tom</label><input value="Claro, seguro, humano"></div><div class="field"><label>Paleta</label><input value="Verde · areia · laranja"></div><div class="field full"><label>Instruções</label><textarea>Educar antes de converter. Evitar ruído e promessas absolutas.</textarea></div></div><div style="margin-top:15px"><button class="btn dark" onclick="closeModal();toast('Brand Brain atualizado')">Salvar</button></div>`}
  if(type==='creativeDetail'){title=data[0];body=`<div class="two"><div class="canvas" style="min-height:370px"><div class="poster" style="width:300px"><h2>${data[0]}</h2><p>Mutuários Brasil · ${data[1]}</p></div></div><div class="panel"><h3>Direção</h3><div class="kv"><span>Formato</span><strong>${data[1]}</strong></div><div class="kv"><span>Objetivo</span><strong>Geração de demanda</strong></div><div class="kv"><span>Conceito</span><strong>Clareza</strong></div><button class="btn dark" style="margin-top:15px" onclick="closeModal();toast('Criação enviada para produção')">Usar criação</button></div></div>`}
  $('modalBox').innerHTML=`<div class="modal-head"><h2>${title}</h2><button class="close" onclick="closeModal()">×</button></div>${body}`;
  $('modalBack').classList.add('open')
}
function closeModal(){$('modalBack').classList.remove('open')}

function selectContext(name){
  setContext(name);
  closeModal();
  toast('Contexto selecionado: '+name);
}
function confirmCreation(type){
  const names={project:'Projeto',ad:'Anúncio',video:'Vídeo',post:'Post',carousel:'Post Carrossel',story:'Story',stories:'Sequência de Stories'};
  const name=($('creationName')?.value||names[type]+' — novo conceito').trim();
  const brief=$('creationBrief')?.value?.trim()||'Criado a partir do contexto atual.';
  if(type==='project'){
    state.projects.push({id:Date.now(),name:name,desc:'Projeto criado a partir do briefing',cover:'a6',icon:'＋'});
    closeModal(); renderProjects(); go('projects'); toast('Projeto criado');
    return;
  }
  const label=state.context?name+' · '+state.context:name;
  state.creatives.unshift([label,names[type],'a5']);
  state.credits=Math.max(0,state.credits-1);
  $('credits').textContent=state.credits;
  closeModal();
  renderHome();
  toast(names[type]+' criado'+(state.context?' a partir de '+state.context:''));
}
function createProject(){const n=$('npName').value.trim()||'Novo projeto';state.projects.push({id:Date.now(),name:n,desc:'Projeto criado no Ampliação Studio',cover:'a6',icon:'＋'});closeModal();renderProjects();go('projects');toast('Projeto criado')}
function createCreative(){const n=$('creativeName').value.trim()||'Novo conceito';state.creatives.unshift([n,'Nova criação','a5']);closeModal();renderHome();if(state.page==='project')renderProjectTab();toast('Criação adicionada ao feed')}
function saveSettings(){localStorage.setItem('ampliacao_workspace',JSON.stringify({name:$('workspaceName').value,instruction:$('globalInstruction').value}));toast('Configurações salvas')}
