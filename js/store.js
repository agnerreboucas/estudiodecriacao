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
    summary: {blocks: [], edited: false}, pitch: {text: '', short: '', edited: false}, hiddenRels: [],
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
    matrix: {duration: 15, sel: {}, custom: {}, concepts: [], stage: 100},
    video: {conceptId: '', scenes: [], steps: {}},
    ebooks: [], competitors: [], design: {styles: [], sets: [], bank: {h: [], s: [], c: []}, batches: [], brand: {}, logos: []}, campaigns: [], approvals: [], publications: [], landings: [], metrics: [], assets: [], learnNote: ''
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
    schema: SCHEMA, meta: {rev: 0, dirty: false, updatedAt: 0, syncedAt: 0}, templates: [], inspo: {items: [], boards: [], cats: []}, myFonts: [],
    workspace: {name: 'Ampliação Marketing', instruction: 'Criar com clareza estratégica, consistência de marca e foco na jornada de compra.'},
    credits: 30, activeProjectId: mb.id, projects: [mb, cd, se], creatives
  };
}

let state = seedState();

/* Inspiração: valida cada campo (ids, textos, cores, links http/https) para nada perigoso entrar no HTML */
function normalizeInspo(x) {
  const out = {items: [], boards: [], cats: []}; if (!x || typeof x !== 'object') return out; const str = (v, n) => String(v == null ? '' : v).slice(0, n), hex = v => /^#[0-9a-f]{6}$/i.test(String(v));
  const url = u => { try { const q = new URL(String(u || '')); return /^https?:$/.test(q.protocol) ? q.href.slice(0, 500) : ''; } catch (e) { return ''; } };
  out.cats = (Array.isArray(x.cats) ? x.cats : []).filter(c => c && safeId(c.id)).slice(0, 40).map(c => ({id: c.id, label: str(c.label, 40) || 'Categoria', hint: str(c.hint, 80)}));
  out.boards = (Array.isArray(x.boards) ? x.boards : []).filter(b => b && safeId(b.id)).slice(0, 100).map(b => ({id: b.id, name: str(b.name, 40) || 'Quadro'}));
  const bids = new Set(out.boards.map(b => b.id));
  out.items = (Array.isArray(x.items) ? x.items : []).filter(i => i && safeId(i.id)).slice(0, 5000).map(i => ({id: i.id, kind: ['img', 'link', 'palette'].includes(i.kind) ? i.kind : 'img', cat: safeId(i.cat) ? i.cat : 'posts', title: str(i.title, 80) || 'Referência', note: str(i.note, 600), tags: (Array.isArray(i.tags) ? i.tags : []).map(t => str(t, 24)).filter(Boolean).slice(0, 20),
    imgId: safeId(i.imgId) ? i.imgId : '', url: url(i.url), imgUrl: url(i.imgUrl), w: Math.min(20000, Math.max(0, +i.w || 0)), h: Math.min(20000, Math.max(0, +i.h || 0)), colors: (Array.isArray(i.colors) ? i.colors : []).filter(hex).slice(0, 8), hues: (Array.isArray(i.hues) ? i.hues : []).map(h => str(h, 10)).slice(0, 4),
    fav: !!i.fav, boards: (Array.isArray(i.boards) ? i.boards : []).filter(b => bids.has(b)), created: str(i.created, 40)}));
  return out;
}
function normalizeMyFonts(x) {
  const CATS = ['sans', 'geo', 'serif', 'slab', 'cond', 'display', 'script', 'round', 'mono'], seen = new Set();
  return (Array.isArray(x) ? x : []).filter(f => f && safeId(f.id) && typeof f.family === 'string').slice(0, 300).map(f => ({id: f.id, family: String(f.family).replace(/[^\p{L}\p{N} \-._]/gu, '').slice(0, 60).trim() || 'Fonte', cat: CATS.includes(f.cat) ? f.cat : 'sans', created: String(f.created || '').slice(0, 40),
    files: (Array.isArray(f.files) ? f.files : []).filter(a => a && safeId(a.id) && safeId(a.fileId)).slice(0, 40).map(a => ({id: a.id, fileId: a.fileId, name: String(a.name || '').slice(0, 80), weight: Math.min(1000, Math.max(100, Math.round(+a.weight || 400))), italic: !!a.italic, variable: Array.isArray(a.variable) && a.variable.length === 2 ? [Math.max(1, +a.variable[0] || 100), Math.min(1000, +a.variable[1] || 900)] : null}))}))
    .filter(f => f.files.length && !seen.has(f.family) && seen.add(f.family));
}
/* Editora: valida cada e-book (ids, textos, tipos de bloco, cores) antes de entrar no estado */
function normalizeEbooks(x) {
  const str = (v, n) => String(v == null ? '' : v).slice(0, n), hex = (v, d) => /^#[0-9a-f]{6}$/i.test(String(v)) ? String(v) : d, TYPES = ['p', 'h2', 'box', 'cols2', 'list', 'check', 'summary', 'pagebreak'], KINDS = ['case', 'tip', 'warn', 'know', 'care', 'note'], STYPES = ['title', 'toc', 'chapter', 'text'];
  const lines = a => (Array.isArray(a) ? a : []).slice(0, 80).map(t => str(t, 1200));
  const D = {primary: '#4F8A55', light: '#6AA170', terra: '#B99B78', gold: '#C9A876', bg: '#F4F1EC', box: '#F7F4EE', text: '#3A3733', soft: '#4A4741'};
  return (Array.isArray(x) ? x : []).filter(e => e && safeId(e.id)).slice(0, 200).map(e => ({
    id: e.id, name: str(e.name, 120) || 'E-book', title: str(e.title, 200), subtitle: str(e.subtitle, 300), author: str(e.author, 200), collection: str(e.collection, 200), footer: str(e.footer, 80), coverSetId: safeId(e.coverSetId) ? e.coverSetId : '', created: str(e.created, 40),
    brand: {h: str(e.brand && e.brand.h, 60) || 'Playfair Display', b: str(e.brand && e.brand.b, 60) || 'Montserrat', c: Object.fromEntries(Object.keys(D).map(k => [k, hex(e.brand && e.brand.c && e.brand.c[k], D[k])]))},
    terms: {keep: str(e.terms && e.terms.keep, 80), avoid: (e.terms && Array.isArray(e.terms.avoid) ? e.terms.avoid : []).slice(0, 50).map(t => str(t, 80))},
    sections: (Array.isArray(e.sections) ? e.sections : []).filter(s => s && safeId(s.id)).slice(0, 300).map(s => ({id: s.id, type: STYPES.includes(s.type) ? s.type : 'text', label: str(s.label, 80), title: str(s.title, 300), subtitle: str(s.subtitle, 400), opener: !!s.opener, inToc: s.inToc !== false,
      blocks: (Array.isArray(s.blocks) ? s.blocks : []).filter(b => b && safeId(b.id) && TYPES.includes(b.t)).slice(0, 400).map(b => ({id: b.id, t: b.t, text: str(b.text, 20000), drop: !!b.drop, kind: KINDS.includes(b.kind) ? b.kind : 'tip', title: str(b.title, 200), leftTitle: str(b.leftTitle, 120), rightTitle: str(b.rightTitle, 120), left: lines(b.left), right: lines(b.right), items: lines(b.items), ordered: !!b.ordered}))}))}));
}
function normalize(s) {
  const base = seedState();
  if (!s || typeof s !== 'object' || !Array.isArray(s.projects)) return base;
  s.schema = SCHEMA;
  s.meta = mergeDefaults(s.meta, base.meta);
  s.workspace = mergeDefaults(s.workspace, base.workspace);
  s.credits = Number.isFinite(+s.credits) ? +s.credits : 30;
  s.inspo = normalizeInspo(s.inspo);
  s.myFonts = normalizeMyFonts(s.myFonts);
  s.templates = (Array.isArray(s.templates) ? s.templates : []).filter(t => t && typeof t === 'object' && Array.isArray(t.slides) && t.format).map(t => { if (!safeId(t.id)) t.id = uid('tp'); t.kind = t.kind === 'deck' ? 'deck' : 'set'; t.name = String(t.name || 'Modelo').slice(0, 80); return t; });
  s.projects = s.projects.filter(p => p && typeof p === 'object').map(p => {
    if (!safeId(p.id)) p.id = uid('p');
    const q = mergeDefaults(p, newProject(p.name || 'Projeto', p.desc)); q.ebooks = normalizeEbooks(q.ebooks); return q;
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
