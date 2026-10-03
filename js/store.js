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
    ebooks: [], layouts: [], motor: {}, cover: {}, kdp: {}, editorial: {}, competitors: [], design: {styles: [], sets: [], bank: {h: [], s: [], c: []}, batches: [], brand: {}, logos: []}, campaigns: [], approvals: [], publications: [], landings: [], metrics: [], assets: [], learnNote: ''
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
    schema: SCHEMA, meta: {rev: 0, dirty: false, updatedAt: 0, syncedAt: 0}, templates: [], skills: [], imglib: {items: []}, inspo: {items: [], boards: [], cats: []}, myFonts: [],
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
function normalizeImglib(x) {
  const str = (v, n) => String(v == null ? '' : v).slice(0, n), items = x && Array.isArray(x.items) ? x.items : [];
  return {items: items.filter(i => i && safeId(i.id) && safeId(i.imgId)).slice(0, 1500).map(i => { const m = i.meta && typeof i.meta === 'object' ? i.meta : {};
    return {id: i.id, imgId: i.imgId, name: str(i.name, 120) || 'Imagem', prompt: str(i.prompt, 4000), promptEn: str(i.promptEn, 4000), style: str(i.style, 80), tags: (Array.isArray(i.tags) ? i.tags : []).slice(0, 10).map(t => str(t, 40)), parent: safeId(i.parent) ? i.parent : '', kind: ['upload', 'gen', 'banco'].includes(i.kind) ? i.kind : 'upload', w: Math.max(0, +i.w || 0), h: Math.max(0, +i.h || 0), created: str(i.created, 40),
      meta: {composition: str(m.composition, 200), light: str(m.light, 200), negative: str(m.negative, 300), palette: (Array.isArray(m.palette) ? m.palette : []).filter(c => /^#[0-9a-f]{6}$/i.test(String(c))).slice(0, 8), elements: (Array.isArray(m.elements) ? m.elements : []).slice(0, 12).map(e => str(e, 60))}}; })};
}
function normalizeMyFonts(x) {
  const CATS = ['sans', 'geo', 'serif', 'slab', 'cond', 'display', 'script', 'round', 'mono'], seen = new Set();
  return (Array.isArray(x) ? x : []).filter(f => f && safeId(f.id) && typeof f.family === 'string').slice(0, 300).map(f => ({id: f.id, family: String(f.family).replace(/[^\p{L}\p{N} \-._]/gu, '').slice(0, 60).trim() || 'Fonte', cat: CATS.includes(f.cat) ? f.cat : 'sans', created: String(f.created || '').slice(0, 40),
    files: (Array.isArray(f.files) ? f.files : []).filter(a => a && safeId(a.id) && safeId(a.fileId)).slice(0, 40).map(a => ({id: a.id, fileId: a.fileId, name: String(a.name || '').slice(0, 80), weight: Math.min(1000, Math.max(100, Math.round(+a.weight || 400))), italic: !!a.italic, variable: Array.isArray(a.variable) && a.variable.length === 2 ? [Math.max(1, +a.variable[0] || 100), Math.min(1000, +a.variable[1] || 900)] : null}))}))
    .filter(f => f.files.length && !seen.has(f.family) && seen.add(f.family));
}
/* Diagramação: valida cada documento (medidas em pt, estilos, matéria, quadros) antes de entrar no estado */
function normalizeLayouts(x) {
  const str = (v, n) => String(v == null ? '' : v).slice(0, n), num = (v, d, lo, hi) => { v = +v; return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; }, hex = (v, d) => /^#[0-9a-f]{6}$/i.test(String(v)) ? String(v) : d;
  const ALIGN = ['left', 'justify', 'center', 'right'], UNITS = ['mm', 'cm', 'in', 'pt', 'px'], WRAP = ['none', 'around', 'jump'];
  const style = (s, d) => ({n: str(s && s.n, 40) || d.n, font: str(s && s.font, 60) || d.font, size: num(s && s.size, d.size, 4, 400), lead: num(s && s.lead, d.lead, 4, 500), color: hex(s && s.color, d.color), align: ALIGN.includes(s && s.align) ? s.align : d.align, b: s && s.b ? 1 : 0, i: s && s.i ? 1 : 0, caps: s && s.caps ? 1 : 0, before: num(s && s.before, d.before, 0, 400), after: num(s && s.after, d.after, 0, 400), indent: num(s && s.indent, d.indent, 0, 200), drop: Math.round(num(s && s.drop, 0, 0, 8)), keep: s && s.keep ? 1 : 0});
  const D = {n: 'Estilo', font: 'Lora', size: 10, lead: 14, color: '#2B2B2B', align: 'left', before: 0, after: 0, indent: 0};
  return (Array.isArray(x) ? x : []).filter(d => d && safeId(d.id)).slice(0, 100).map(d => {
    const pg = d.page || {}, m = d.margins || {}, styles = {};
    const sd = d.styles && typeof d.styles === 'object' ? d.styles : {};
    Object.keys(sd).filter(k => /^[a-z0-9_-]{1,24}$/i.test(k)).slice(0, 40).forEach(k => { styles[k] = style(sd[k], D); });
    ['body', 'h1', 'h2', 'h3', 'quote', 'caption'].forEach(k => { if (!styles[k]) styles[k] = style({}, D); });
    const ov = o => { if (!o || typeof o !== 'object') return undefined; const r = {}; ['size', 'lead', 'indent', 'after', 'before'].forEach(k => { if (o[k] != null && isFinite(+o[k])) r[k] = num(o[k], 0, 0, 600); }); ['b', 'i', 'caps'].forEach(k => { if (o[k] != null) r[k] = o[k] ? 1 : 0; }); if (/^#[0-9a-f]{6}$/i.test(String(o.color))) r.color = o.color; if (ALIGN.includes(o.align)) r.align = o.align; return Object.keys(r).length ? r : undefined; };
    const items = a => (Array.isArray(a) ? a : []).filter(i => i && ['img', 'rect', 'text'].includes(i.k)).slice(0, 80).map(i => ({id: safeId(i.id) ? i.id : uid('fr'), k: i.k, x: num(i.x, 0, -5000, 9000), y: num(i.y, 0, -5000, 9000), w: num(i.w, 50, 2, 9000), h: num(i.h, 50, 2, 9000), wrap: WRAP.includes(i.wrap) ? i.wrap : 'none', off: num(i.off, 6, 0, 200), imgId: safeId(i.imgId) ? i.imgId : '', fill: i.fill ? hex(i.fill, '#CCCCCC') : '', stroke: i.stroke ? hex(i.stroke, '#000000') : '', sw: num(i.sw, 1, 0, 40), op: num(i.op, 1, 0, 1), zoom: num(i.zoom, 1, 0.2, 8), px: num(i.px, 0, -5000, 5000), py: num(i.py, 0, -5000, 5000), text: str(i.text, 6000), st: styles[i.st] ? i.st : 'body', pad: num(i.pad, 4, 0, 100), ar: num(i.ar, 0, 0, 100), ov: ov(i.ov)}));
    const story = (Array.isArray(d.story) ? d.story : []).slice(0, 4000).map(s => {
      if (!s) return null;
      if (s.k === 'break' || s.k === 'colbreak') return {k: s.k};
      if (s.k === 'img') return safeId(s.imgId) ? {k: 'img', imgId: s.imgId, ar: num(s.ar, 1.5, 0.05, 20), w: s.w === 'full' ? 'full' : 'col', pct: num(s.pct, 100, 10, 100), al: ['l', 'c', 'r'].includes(s.al) ? s.al : 'l', cap: str(s.cap, 400)} : null;
      return {k: 'p', st: styles[s.st] ? s.st : 'body', t: str(s.t, 20000)};
    }).filter(Boolean);
    const rn = d.run || {};
    return {
      id: d.id, styleId: /^[a-z0-9_-]{1,24}$/i.test(d.styleId || '') ? d.styleId : '', name: str(d.name, 120) || 'Documento', created: str(d.created, 40), unit: UNITS.includes(d.unit) ? d.unit : 'mm',
      page: {w: num(pg.w, 420, 36, 6000), h: num(pg.h, 595, 36, 6000)}, facing: !!d.facing, bleed: num(d.bleed, 8.5, 0, 72),
      margins: {t: num(m.t, 40, 0, 2000), b: num(m.b, 40, 0, 2000), i: num(m.i, 40, 0, 2000), o: num(m.o, 40, 0, 2000)},
      cols: Math.round(num(d.cols, 1, 1, 8)), colw: (Array.isArray(d.colw) ? d.colw : []).slice(0, 8).map(v => num(v, 1, 0.1, 20)), mod: {cols: Math.round(num(d.mod && d.mod.cols, 6, 0, 24)), rows: Math.round(num(d.mod && d.mod.rows, 8, 0, 24))}, front: Math.round(num(d.front, 0, 0, 20)), gutter: num(d.gutter, 14, 0, 200), baseline: num(d.baseline, 0, 0, 100), nPages: Math.round(num(d.nPages, 1, 1, 400)), autoflow: d.autoflow !== false, paper: hex(d.paper, '#FFFFFF'),
      run: {folio: !!rn.folio, pos: ['outer', 'center', 'inner'].includes(rn.pos) ? rn.pos : 'outer', header: str(rn.header, 120), headerR: str(rn.headerR, 120), size: num(rn.size, 8, 4, 40), color: hex(rn.color, '#777777'), font: str(rn.font, 60) || 'Inter'},
      styles, story,
      pages: (Array.isArray(d.pages) ? d.pages : []).slice(0, 400).map(p => ({items: items(p && p.items)})).concat([{items: []}]).slice(0, Math.max(1, Math.min(400, (Array.isArray(d.pages) ? d.pages.length : 1) || 1))),
      guides: {v: (Array.isArray(d.guides && d.guides.v) ? d.guides.v : []).slice(0, 60).map(v => num(v, 0, -5000, 9000)), h: (Array.isArray(d.guides && d.guides.h) ? d.guides.h : []).slice(0, 60).map(v => num(v, 0, -5000, 9000))}
    };
  });
}
/* Engenheiro de capa e módulo Amazon KDP: rascunhos por projeto */
function normalizeCover(c) {
  c = c && typeof c === 'object' ? c : {}; const str = (v, n) => String(v == null ? '' : v).slice(0, n), hex = (v, d) => /^#[0-9a-f]{6}$/i.test(String(v)) ? String(v) : d, p = c.pal || {};
  return {title: str(c.title, 200), subtitle: str(c.subtitle, 300), author: str(c.author, 200), collection: str(c.collection, 120), blurb: str(c.blurb, 2000), tagline: str(c.tagline, 200), layout: /^[a-z0-9_-]{1,24}$/i.test(c.layout || '') ? c.layout : 'giant',
    pal: {bg: hex(p.bg, '#1F3A2E'), fg: hex(p.fg, '#F4F1EC'), accent: hex(p.accent, '#C9A876'), second: hex(p.second, '#6AA170')}, head: str(c.head, 60) || 'Playfair Display', body: str(c.body, 60) || 'Montserrat', imgId: safeId(c.imgId) ? c.imgId : '', mode: ['front', 'wrap', 'kindle'].includes(c.mode) ? c.mode : 'front', setId: safeId(c.setId) ? c.setId : ''};
}
function normalizeKdp(k) {
  k = k && typeof k === 'object' ? k : {}; const n = (v, d, lo, hi) => { v = +v; return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
  return {trim: /^kdp[a-z0-9]{1,8}$/.test(k.trim || '') ? k.trim : 'kdp6x9', pages: Math.round(n(k.pages, 0, 0, 900)), paper: ['bw-white', 'bw-cream', 'color-std', 'color-premium'].includes(k.paper) ? k.paper : 'bw-white', docId: safeId(k.docId) ? k.docId : '', bleed: k.bleed !== false};
}
/* Agente editorial: DNA da marca, memória, histórico e sessão (JSON validado: profundidade, tamanho e tipos limitados) */
function ediClean(v, d) {
  d = d || 0; if (v == null) return v === null ? null : ''; if (typeof v === 'string') return v.slice(0, 6000); if (typeof v === 'number') return isFinite(v) ? v : 0; if (typeof v === 'boolean') return v; if (d > 6) return '';
  if (Array.isArray(v)) return v.slice(0, 80).map(x => ediClean(x, d + 1)); if (typeof v === 'object') { const o = {}; Object.keys(v).slice(0, 40).forEach(k => { if (/^[\w-]{1,40}$/.test(k)) o[k] = ediClean(v[k], d + 1); }); return o; } return '';
}
function normalizeEditorial(e) {
  e = e && typeof e === 'object' ? e : {}; const str = (v, n) => String(v == null ? '' : v).slice(0, n), obj = (o, keys, n) => Object.fromEntries(keys.map(k => [k, str(o && o[k], n)])), arr = (a, n, m) => (Array.isArray(a) ? a : []).slice(0, m).map(x => str(x, n)).filter(Boolean), s = e.session && typeof e.session === 'object' ? e.session : {};
  const SZ = {capa1: [40, 90], capa2: [60, 140], titulo: [25, 60], par: [220, 420], curto: [80, 180], fechamento: [120, 260], assinatura: [15, 60]}, sz = {};
  Object.keys(SZ).forEach(k => { const a = e.sizes && e.sizes[k]; sz[k] = Array.isArray(a) && a.length === 2 && a.every(n => isFinite(+n)) ? [Math.max(0, Math.min(3000, +a[0])), Math.max(0, Math.min(3000, +a[1]))] : SZ[k]; });
  return {
    brand: obj(e.brand, ['publico', 'posicionamento', 'tom', 'categorias', 'produtos', 'diferenciais', 'prioritarios', 'proibidos', 'aprovados', 'rejeitados'], 1500), prod: obj(e.prod, ['plataforma', 'objetivo', 'funil', 'frequencia', 'campanha', 'cta'], 300),
    mem: Object.assign(obj(e.mem, ['vocab', 'referencias', 'marcas', 'temas', 'formatos', 'padroes', 'proibidas', 'estruturas'], 1500), {negatives: arr(e.mem && e.mem.negatives, 240, 40)}), sizes: sz,
    liked: arr(e.liked, 400, 60), rejected: (Array.isArray(e.rejected) ? e.rejected : []).slice(0, 80).map(r => ({tese: str(r && r.tese, 400), why: str(r && r.why, 40)})).filter(r => r.tese),
    history: (Array.isArray(e.history) ? e.history : []).slice(0, 150).filter(h => h && /^[\w-]{1,40}$/.test(h.id || '')).map(h => ({id: h.id, t: str(h.t, 40), input: str(h.input, 300), ideas: ediClean(h.ideas), chosen: Math.round(+h.chosen) || -1, brief: !!h.brief, formats: arr(h.formats, 30, 12), headlines: arr(h.headlines, 300, 24)})),
    session: {stage: ['insumo', 'triagem', 'angulos', 'narrativa', 'auditoria'].includes(s.stage) ? s.stage : 'insumo', mode: s.mode === 'B' ? 'B' : 'A', input: str(s.input, 60000), analysis: ediClean(s.analysis), ideas: ediClean(s.ideas), chosen: Math.round(+s.chosen) >= 0 ? Math.round(+s.chosen) : -1, brief: ediClean(s.brief), headlines: ediClean(s.headlines), format: str(s.format, 30), content: ediClean(s.content), audit: ediClean(s.audit), histId: /^[\w-]{1,40}$/.test(s.histId || '') ? s.histId : '', sources: str(s.sources, 20000)}
  };
}
/* Motor de e-book: skills (workspace) e rascunho de produção (projeto) */
function normalizeSkills(x) {
  return (Array.isArray(x) ? x : []).filter(k => k && safeId(k.id) && typeof k.text === 'string').slice(0, 30).map(k => ({id: k.id, name: String(k.name || 'Skill').slice(0, 80), text: k.text.slice(0, 30000)}));
}
function normalizeMotor(m) {
  m = m && typeof m === 'object' ? m : {}; const str = (v, n) => String(v == null ? '' : v).slice(0, n);
  const out = (Array.isArray(m.outline) ? m.outline : []).slice(0, 30).filter(c => c && safeId(c.id)).map(c => ({id: c.id, title: str(c.title, 160), summary: str(c.summary, 800), points: (Array.isArray(c.points) ? c.points : []).slice(0, 12).map(t => str(t, 240))}));
  const chapters = {}; out.forEach(c => { if (m.chapters && typeof m.chapters[c.id] === 'string') chapters[c.id] = m.chapters[c.id].slice(0, 40000); });
  return {skillId: safeId(m.skillId) ? m.skillId : '', idea: str(m.idea, 4000), source: str(m.source, 60000), audience: str(m.audience, 300), tone: str(m.tone, 300), nch: Math.max(3, Math.min(14, Math.round(+m.nch || 7))), title: str(m.title, 200), subtitle: str(m.subtitle, 300), author: str(m.author, 200), outline: out, chapters, full: str(m.full, 200000), stage: ['material', 'estrutura', 'texto', 'enviar'].includes(m.stage) ? m.stage : 'material', approved: !!m.approved};
}
/* Editora: valida cada e-book (ids, textos, tipos de bloco, cores) antes de entrar no estado */
function normalizeAudio(a) {
  const o = {voiceId: '', voiceName: '', items: {}}; if (!a || typeof a !== 'object') return o;
  o.voiceId = /^[A-Za-z0-9]{0,40}$/.test(String(a.voiceId)) ? String(a.voiceId || '') : ''; o.voiceName = String(a.voiceName || '').slice(0, 80);
  Object.keys(a.items && typeof a.items === 'object' ? a.items : {}).slice(0, 300).forEach(k => { const it = a.items[k]; if (!safeId(k) || !it || !Array.isArray(it.ids)) return; const ids = it.ids.filter(safeId).slice(0, 60); if (ids.length) o.items[k] = {ids, chars: Math.max(0, +it.chars || 0), at: String(it.at || '').slice(0, 40)}; });
  return o;
}
function normalizeEbooks(x) {
  const str = (v, n) => String(v == null ? '' : v).slice(0, n), hex = (v, d) => /^#[0-9a-f]{6}$/i.test(String(v)) ? String(v) : d, TYPES = ['p', 'h2', 'box', 'cols2', 'list', 'check', 'summary', 'pagebreak'], KINDS = ['case', 'tip', 'warn', 'know', 'care', 'note'], STYPES = ['title', 'toc', 'chapter', 'text'];
  const lines = a => (Array.isArray(a) ? a : []).slice(0, 80).map(t => str(t, 1200));
  const D = {primary: '#4F8A55', light: '#6AA170', terra: '#B99B78', gold: '#C9A876', bg: '#F4F1EC', box: '#F7F4EE', text: '#3A3733', soft: '#4A4741'};
  return (Array.isArray(x) ? x : []).filter(e => e && safeId(e.id)).slice(0, 200).map(e => ({
    id: e.id, dtpId: safeId(e.dtpId) ? e.dtpId : '', motor: normalizeMotor(e.motor), cover: normalizeCover(e.cover), kdp: normalizeKdp(e.kdp), audio: normalizeAudio(e.audio), name: str(e.name, 120) || 'E-book', title: str(e.title, 200), subtitle: str(e.subtitle, 300), author: str(e.author, 200), collection: str(e.collection, 200), footer: str(e.footer, 80), coverSetId: safeId(e.coverSetId) ? e.coverSetId : '', created: str(e.created, 40),
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
  s.imglib = normalizeImglib(s.imglib); s.myFonts = normalizeMyFonts(s.myFonts); s.skills = normalizeSkills(s.skills);
  s.templates = (Array.isArray(s.templates) ? s.templates : []).filter(t => t && typeof t === 'object' && Array.isArray(t.slides) && t.format).map(t => { if (!safeId(t.id)) t.id = uid('tp'); t.kind = t.kind === 'deck' ? 'deck' : 'set'; t.name = String(t.name || 'Modelo').slice(0, 80); return t; });
  s.projects = s.projects.filter(p => p && typeof p === 'object').map(p => {
    if (!safeId(p.id)) p.id = uid('p');
    const q = mergeDefaults(p, newProject(p.name || 'Projeto', p.desc)); q.ebooks = normalizeEbooks(q.ebooks); q.layouts = normalizeLayouts(q.layouts); q.motor = normalizeMotor(q.motor); q.cover = normalizeCover(q.cover); q.kdp = normalizeKdp(q.kdp); q.editorial = normalizeEditorial(q.editorial); return q;
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
