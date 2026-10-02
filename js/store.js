/* Estado do workspace: modelo de dados, persistência local, exportação/importação */
const STORE_KEY = window.DEMO_MODE ? 'ampliacao_studio_demo' : 'ampliacao_studio_v1';
const SCHEMA = 1;
const ui = {page: 'home', tab: 'overview'};   // estado de tela, não persistido

function newPre() {
  return {
    briefing: '', challenges: {}, other: [], hyp: {},
    diag: {scenario: '', causal: '', consequence: '', need: ''}, diagEdited: false,
    justification: '', justEdited: false, objective: '', objEdited: false,
    okr: {objective: '', tr: [], st: [], edited: false},
    icps: [],
    journey: ['Descoberta', 'Atenção', 'Consideração', 'Decisão', 'Pós-compra'].map(name => ({name, situacao: '', duvida: '', dor: '', desejo: '', gatilho: '', objecao: '', confianca: ''})),
    positioning: '', positioningApproved: false,
    status: 'RASCUNHO', history: [], approvedAt: null
  };
}
function newProject(name, desc, extra = {}) {
  const id = uid('p');
  return mergeDefaults(Object.assign({
    id, ctx: 'CTX-' + id.slice(-6).toUpperCase(), name, desc: desc || '', cover: 'a6',
    icon: (name || 'P').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    status: 'Em desenvolvimento', category: 'Marketing', client: '', goal: '', created: new Date().toISOString()
  }, extra), {
    brand: {positioning: '', tone: '', palette: '', visual: '', rule: '', instructions: ''},
    brief: {source: '', offer: '', audience: '', problem: '', goal: '', channels: '', budget: '', deadline: '', competitors: '', notes: '', original: '', transcript: '', hasAudio: false, audioMs: 0, createdAt: ''},
    voice: {personality: '', principles: '', vocabulary: '', antivocab: '', rules: '', channels: '', examples: '', checklist: ''},
    pre: newPre(),
    matrix: {duration: 15, sel: {}, concepts: [], stage: 100},
    video: {conceptId: '', scenes: [], steps: {}},
    campaigns: [], approvals: [], publications: [], landings: [], metrics: [], assets: [], learnNote: ''
  });
}
function seedState() {
  const mb = newProject('Mutuários Brasil', 'Aquisição e educação jurídica', {
    cover: 'a3', icon: 'MB', goal: 'Construir uma máquina de aquisição orientada pela jornada de compra.',
    brand: {positioning: 'Orientação antes da decisão', tone: 'Claro, seguro, humano', palette: 'Verde profundo · areia · laranja', visual: 'Editorial + performance', rule: 'Educar antes de converter', instructions: 'Priorizar clareza, contexto e prova. Evitar promessas absolutas. Construir peças com hierarquia visual forte, pouco ruído e uma ação principal por criativo.'}
  });
  mb.pre.briefing = 'Empresa que orienta mutuários sobre direitos e próximos passos. Hoje depende de indicação, não tem previsão de fechamento e não possui sistema de gestão de vendas.';
  ['d1', 'd2', 'd8'].forEach(id => mb.pre.challenges[id] = true);
  const cr = [['Proteja seu patrimônio','Carrossel educativo','a3'],['Não tome uma decisão no escuro','Meta Ads','a2'],['Entenda antes de assinar','Story','a1'],['3 sinais de atenção','Reels','a4'],['Você sabe o que está pagando?','Meta Ads','a5'],['Jornada do mutuário','Carrossel','a6'],['Direito explicado sem juridiquês','Post','a7'],['Seu próximo passo começa aqui','Landing','a8'],['Perguntas que você precisa fazer','Carrossel','a3'],['Checklist antes do contrato','PDF','a6'],['Quando procurar orientação','Meta Ads','a2'],['Conteúdo que gera confiança','Branding','a1']];
  const creatives = cr.map(([title, type, cls]) => ({id: uid('c'), projectId: mb.id, title, type, cls, status: 'Rascunho', brief: '', created: new Date().toISOString()}));
  const cd = newProject('Cartório Descomplicado', 'Conteúdo + geração de demanda', {cover: 'a6', icon: 'CD'});
  const se = newProject('Saber Ensinar', 'Educação criativa', {cover: 'a8', icon: 'SE'});
  return {
    schema: SCHEMA, meta: {rev: 0, dirty: false, updatedAt: 0, syncedAt: 0},
    workspace: {name: 'Ampliação Marketing', instruction: 'Criar com clareza estratégica, consistência de marca e foco na jornada de compra.'},
    credits: 30, activeProjectId: mb.id, projects: [mb, cd, se], creatives
  };
}

let state = seedState();

function normalize(s) {
  const base = seedState();
  if (!s || typeof s !== 'object' || !Array.isArray(s.projects)) return base;
  s.schema = SCHEMA;
  s.meta = mergeDefaults(s.meta, base.meta);
  s.workspace = mergeDefaults(s.workspace, base.workspace);
  s.credits = Number.isFinite(+s.credits) ? +s.credits : 30;
  s.projects = s.projects.filter(p => p && typeof p === 'object').map(p => {
    if (!safeId(p.id)) p.id = uid('p');
    return mergeDefaults(p, newProject(p.name || 'Projeto', p.desc));
  });
  s.creatives = (Array.isArray(s.creatives) ? s.creatives : []).filter(c => c && typeof c === 'object').map(c => {
    if (!safeId(c.id)) c.id = uid('c');
    return mergeDefaults(c, {projectId: '', title: 'Criação', type: 'Post', cls: 'a5', status: 'Rascunho', brief: '', created: new Date().toISOString()});
  });
  if (!s.projects.find(p => p.id === s.activeProjectId)) s.activeProjectId = s.projects[0] ? s.projects[0].id : '';
  return s;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) state = normalize(JSON.parse(raw));
  } catch (e) { console.warn('Falha ao carregar dados locais', e); }
}
const flushLocal = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { toast('Não foi possível salvar no navegador (armazenamento cheio?). Exporte o projeto.'); } };
const flushLocalSoon = debounce(flushLocal, 250);
function persist() {
  state.meta.dirty = true; state.meta.updatedAt = Date.now();
  flushLocalSoon();
  if (typeof scheduleSync === 'function') scheduleSync();
  if (typeof renderSyncBadge === 'function') renderSyncBadge();
}
window.addEventListener('beforeunload', flushLocal);

/* Acesso */
const projectById = id => state.projects.find(p => p.id === id);
const curProject = () => projectById(state.activeProjectId) || state.projects[0] || null;
const creativesOf = pid => state.creatives.filter(c => c.projectId === pid);
function setActiveProject(id) { if (projectById(id)) { state.activeProjectId = id; persist(); } }
function spendCredits(n) {
  state.credits = Math.max(0, state.credits - n);
  const el = $('credits'); if (el) el.textContent = state.credits;
  persist();
}

/* Exportação / importação */
function exportWorkspace() {
  download(`ampliacao-studio-${today()}.json`, JSON.stringify({app: 'ampliacao-studio', schema: SCHEMA, kind: 'workspace', exportedAt: new Date().toISOString(), state}, null, 2));
  toast('Workspace exportado.');
}
function exportProject(id) {
  const p = projectById(id || (curProject() || {}).id); if (!p) return;
  download(`projeto-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${today()}.json`, JSON.stringify({app: 'ampliacao-studio', schema: SCHEMA, kind: 'project', exportedAt: new Date().toISOString(), project: p, creatives: creativesOf(p.id)}, null, 2));
  toast('Projeto exportado.');
}
function importFile(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const j = JSON.parse(r.result);
      if (j.app !== 'ampliacao-studio') throw new Error('Arquivo não é do Ampliação Studio.');
      if (j.kind === 'workspace') {
        if (!confirm('Importar este workspace substitui todos os dados atuais. Continuar?')) return;
        state = normalize(j.state); state.meta.dirty = true; persist(); flushLocal(); bootRender(); toast('Workspace importado.');
      } else if (j.kind === 'project') {
        const wrapper = normalize({projects: [j.project], creatives: j.creatives || []});
        const p = wrapper.projects[0];
        if (projectById(p.id)) { const old = p.id; p.id = uid('p'); wrapper.creatives.forEach(c => { if (c.projectId === old) c.projectId = p.id; }); }
        wrapper.creatives.forEach(c => { c.projectId = p.id; if (state.creatives.some(x => x.id === c.id)) c.id = uid('c'); });
        state.projects.push(p); state.creatives.push(...wrapper.creatives); persist(); bootRender(); toast('Projeto importado: ' + p.name);
      } else throw new Error('Tipo de arquivo desconhecido.');
    } catch (e) { toast('Importação falhou: ' + e.message); }
  };
  r.readAsText(file);
}
function resetWorkspace() {
  if (!confirm('Apagar todos os dados locais e voltar ao exemplo inicial? Exporte antes se quiser guardar.')) return;
  state = seedState(); state.meta.dirty = true; persist(); flushLocal(); bootRender(); toast('Workspace reiniciado.');
}
