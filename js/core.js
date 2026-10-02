const state={
  page:'home',projectTab:'overview',credits:30,context:'',
  projects:[
    {id:1,name:'Mutuários Brasil',desc:'Aquisição e educação jurídica',cover:'a3',icon:'MB'},
    {id:2,name:'Cartório Descomplicado',desc:'Conteúdo + geração de demanda',cover:'a6',icon:'CD'},
    {id:3,name:'Saber Ensinar',desc:'Educação criativa',cover:'a8',icon:'SE'}
  ],
  creatives:[
    ['Proteja seu patrimônio','Carrossel educativo','a3'],['Não tome uma decisão no escuro','Meta Ads','a2'],
    ['Entenda antes de assinar','Story','a1'],['3 sinais de atenção','Reels','a4'],
    ['Você sabe o que está pagando?','Meta Ads','a5'],['Jornada do mutuário','Carrossel','a6'],
    ['Direito explicado sem juridiquês','Post','a7'],['Seu próximo passo começa aqui','Landing','a8'],
    ['Perguntas que você precisa fazer','Carrossel','a3'],['Checklist antes do contrato','PDF','a6'],
    ['Quando procurar orientação','Meta Ads','a2'],['Conteúdo que gera confiança','Branding','a1']
  ]
};
function $(id){return document.getElementById(id)}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),2200)}
function go(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const el=$('page-'+page); if(el)el.classList.add('active');
  document.querySelectorAll('.rail-nav button,.rail-bottom button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
  state.page=page;
  if(page==='projects')renderProjects();
  if(page==='library')renderLibrary();
}
function usePrompt(text){$('prompt').value=text;$('prompt').focus()}
function generate(){
  const p=$('prompt').value.trim()||'Crie uma campanha de aquisição para Mutuários Brasil';
  state.credits=Math.max(0,state.credits-1);$('credits').textContent=state.credits;
  state.creatives.unshift([p.slice(0,44),'Novo briefing','a5']);
  renderHome();
  toast('Briefing recebido — projeto criativo criado.');
}
function artCard(item,index){
  const [title,type,cls]=item;
  return `<article class="tile" onclick="openCreative(${index})">
    <div class="art ${cls}"><div class="grid"></div><div class="orb"></div><small>${type}</small><h3>${title}</h3></div>
    <div class="tile-meta"><strong>${title}</strong><small>${type} · Ampliação Studio</small></div>
  </article>`;
}
function newTile(){return `<article class="tile new-tile" onclick="openCreate()"><div><b>＋</b>Novo projeto</div></article>`}
function renderHome(){
  const arr=[...state.creatives.slice(0,8)];
  $('homeGallery').innerHTML=newTile()+arr.map((x,i)=>artCard(x,i)).join('');
}
function renderProjects(){
  $('projectsGrid').innerHTML=state.projects.map(p=>`<article class="project-card" onclick="openProject(${p.id})">
    <div class="cover ${p.cover}">${p.icon}</div><div class="body"><strong>${p.name}</strong><small>${p.desc}</small></div>
  </article>`).join('')+`<article class="project-card" onclick="openCreate()"><div class="cover" style="background:#fafafa;border-bottom:1px dashed #ddd">＋</div><div class="body"><strong>Novo projeto</strong><small>Começar um novo trabalho</small></div></article>`;
}
function renderLibrary(){
  $('libraryGrid').innerHTML=state.creatives.map((x,i)=>artCard(x,i)).join('');
}
function openProject(id){
  const p=state.projects.find(x=>x.id===id)||state.projects[0];
  document.querySelector('#page-project .project-hero h2').textContent=p.name;
  document.querySelector('#page-project .project-hero p').textContent=p.desc+' · Projeto construído dentro do Ampliação Studio.';
  state.projectTab='overview';renderProjectTab();go('project');
}

