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
    ebooks: [], layouts: [], motor: {}, cover: {}, kdp: {}, editorial: {}, carousel: {}, carousels: [], feeds: [], grids: [], social: {}, products: [], sites: [], competitors: [], design: {styles: [], sets: [], bank: {h: [], s: [], c: []}, batches: [], brand: {}, logos: []}, campaigns: [], approvals: [], publications: [], landings: [], metrics: [], assets: [], learnNote: ''
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
    schema: SCHEMA, meta: {rev: 0, dirty: false, updatedAt: 0, syncedAt: 0}, templates: [], skills: [], imglib: {items: []}, tplbank: {items: []}, lpRefs: {items: [], seeded: false, seen: []}, inspo: {items: [], boards: [], cats: []}, myFonts: [],
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
/* Referências de landing pages (URLs de outras páginas, com tipo, nota e leitura opcional da estrutura) */
function normalizeLpRefs(x) {
  const str = (v, n) => String(v == null ? '' : v).slice(0, n), arr = (a, n, m) => (Array.isArray(a) ? a : []).slice(0, m).map(t => str(t, n)), TY = ['cadastro', 'curso', 'ebook', 'servico', 'evento', 'produto', 'institucional', 'outro'];
  x = x && typeof x === 'object' ? x : {};
  return {seeded: !!x.seeded, seen: (Array.isArray(x.seen) ? x.seen : []).slice(0, 400).map(u => str(u, 600)), items: (Array.isArray(x.items) ? x.items : []).filter(r => r && /^[\w-]{1,60}$/.test(r.id || '') && /^https?:\/\/[^\s"'<>]{1,600}$/i.test(r.url || '')).slice(0, 300).map(r => ({id: r.id, url: r.url, title: str(r.title, 200), type: TY.includes(r.type) ? r.type : 'outro', note: str(r.note, 600), use: r.use !== false,
    scan: r.scan && typeof r.scan === 'object' ? {title: str(r.scan.title, 200), description: str(r.scan.description, 400), headings: arr(r.scan.headings, 160, 20), ctas: arr(r.scan.ctas, 60, 15), fonts: arr(r.scan.fonts, 60, 6), colors: arr(r.scan.colors, 9, 8), at: str(r.scan.at, 40)} : null}))};
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
    session: {stage: ['insumo', 'triagem', 'angulos', 'narrativa', 'auditoria', 'entregas'].includes(s.stage) ? s.stage : 'insumo', mode: s.mode === 'B' ? 'B' : 'A', input: str(s.input, 60000), analysis: ediClean(s.analysis), ideas: ediClean(s.ideas), chosen: Math.round(+s.chosen) >= 0 ? Math.round(+s.chosen) : -1, brief: ediClean(s.brief), headlines: ediClean(s.headlines), format: str(s.format, 30), content: ediClean(s.content), audit: ediClean(s.audit), ent: ediClean(s.ent), histId: /^[\w-]{1,40}$/.test(s.histId || '') ? s.histId : '', sources: str(s.sources, 20000)}
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
/* Social (kit-social): contas, publicações, impulsionamentos, caixa, eventos e histórico diário. Tudo validado: tipos, limites e ids. */
function normalizeSocial(x) {
  x = x && typeof x === 'object' ? x : {};
  const str = (v, n) => String(v == null ? '' : v).slice(0, n), num = (v, lo, hi) => { v = +v; return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo; }, sid = v => /^[\w-]{1,60}$/.test(String(v || '')), iso = v => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}([T ][\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/.test(v) ? v : null), en = (v, a, d) => a.includes(v) ? v : d;
  const NETS = ['instagram', 'facebook', 'tiktok', 'linkedin', 'youtube', 'threads'], FORM = ['a_definir', 'imagem', 'carrossel', 'video', 'story'], STAT = ['ideia', 'rascunho', 'aguardando_aprovacao', 'aprovado', 'agendado', 'publicado', 'falhou'], AR = ['1:1', '4:5', '9:16', '16:9'];
  const grad = v => (/^[\w#(),.%\s\-]{0,160}$/.test(String(v || '')) ? String(v || '') : '');
  const accounts = (Array.isArray(x.accounts) ? x.accounts : []).filter(a => a && sid(a.id)).slice(0, 30).map(a => ({id: a.id, projectId: str(a.projectId, 60), networkId: en(a.networkId, NETS, 'instagram'), handle: str(a.handle, 80), displayName: str(a.displayName, 80) || str(a.handle, 80), status: en(a.status, ['ativa', 'expirada', 'erro_permissao', 'desconectada'], 'ativa'), origem: en(a.origem, ['manual', 'oauth', 'demonstracao'], 'manual'), externalId: str(a.externalId, 60), adAccountConnected: !!a.adAccountConnected, trackingSince: iso(a.trackingSince) || new Date().toISOString().slice(0, 10), tokenExpiresAt: iso(a.tokenExpiresAt), lastSyncAt: iso(a.lastSyncAt), messagingApproved: !!a.messagingApproved, avatarGradient: grad(a.avatarGradient)}));
  const posts = (Array.isArray(x.posts) ? x.posts : []).filter(p => p && sid(p.id)).slice(0, 2000).map(p => { const m = p.media || {}, mt = p.metrics && typeof p.metrics === 'object' ? p.metrics : null; return {
    id: p.id, projectId: str(p.projectId, 60), accountIds: (Array.isArray(p.accountIds) ? p.accountIds : []).filter(sid).slice(0, 10), format: en(p.format, FORM, 'a_definir'), caption: str(p.caption, 5000), title: str(p.title, 160),
    media: {count: Math.round(num(m.count || 1, 1, 20)), aspectRatio: en(m.aspectRatio, AR, '4:5'), fileSizeMb: num(m.fileSizeMb, 0, 4000), ...(m.durationSeconds != null ? {durationSeconds: num(m.durationSeconds, 0, 36000)} : {})},
    status: en(p.status, STAT, 'rascunho'), scheduledFor: iso(p.scheduledFor), publishedAt: iso(p.publishedAt), createdBy: str(p.createdBy, 60), approvedBy: p.approvedBy ? str(p.approvedBy, 60) : null, requiresApproval: p.requiresApproval !== false, failureReason: str(p.failureReason, 300) || undefined,
    metrics: mt ? {reach: num(mt.reach, 0, 1e10), impressions: num(mt.impressions, 0, 1e10), likes: num(mt.likes, 0, 1e10), comments: num(mt.comments, 0, 1e10), shares: num(mt.shares, 0, 1e10), saves: num(mt.saves, 0, 1e10), ...(mt.clicks != null ? {clicks: num(mt.clicks, 0, 1e10)} : {})} : null,
    coverGradient: grad(p.coverGradient), setId: sid(p.setId) ? p.setId : '', creativeId: sid(p.creativeId) ? p.creativeId : '', pubId: sid(p.pubId) ? p.pubId : '', extId: str(p.extId, 80), origemEventoId: sid(p.origemEventoId) ? p.origemEventoId : undefined,
    history: (Array.isArray(p.history) ? p.history : []).slice(-30).map(h => ({at: str(h && h.at, 40), by: str(h && h.by, 60), from: str(h && h.from, 30), to: str(h && h.to, 30), note: str(h && h.note, 200)}))}; });
  const boosts = (Array.isArray(x.boosts) ? x.boosts : []).filter(b => b && sid(b.id) && sid(b.postId)).slice(0, 500).map(b => { const r = b.results || {}, a = b.audience || {}; return {id: b.id, postId: b.postId, accountId: str(b.accountId, 60), objective: en(b.objective, ['alcance', 'engajamento', 'trafego', 'mensagens'], 'alcance'), budgetTotal: num(b.budgetTotal, 0, 1e9), durationDays: Math.round(num(b.durationDays, 0, 365)), startedAt: iso(b.startedAt) || '', endsAt: iso(b.endsAt) || '', status: en(b.status, ['em_analise', 'ativo', 'encerrado', 'rejeitado'], 'encerrado'),
    audience: {locations: (Array.isArray(a.locations) ? a.locations : []).slice(0, 30).map(t => str(t, 80)), ageMin: Math.round(num(a.ageMin, 13, 65)), ageMax: Math.round(num(a.ageMax || 65, 13, 65)), interests: (Array.isArray(a.interests) ? a.interests : []).slice(0, 30).map(t => str(t, 60))},
    results: {spend: num(r.spend, 0, 1e9), reach: num(r.reach, 0, 1e10), impressions: num(r.impressions, 0, 1e10), engagement: num(r.engagement, 0, 1e10), clicks: num(r.clicks, 0, 1e10), ...(Array.isArray(r.porLocal) ? {porLocal: r.porLocal.slice(0, 200).map(l => ({local: str(l && l.local, 80), reach: num(l && l.reach, 0, 1e10), spend: num(l && l.spend, 0, 1e9)}))} : {})}}; });
  const inbox = (Array.isArray(x.inbox) ? x.inbox : []).filter(i => i && sid(i.id)).slice(0, 2000).map(i => ({id: i.id, accountId: str(i.accountId, 60), kind: en(i.kind, ['comentario', 'mensagem'], 'comentario'), authorHandle: str(i.authorHandle, 80), authorName: str(i.authorName, 80), avatarGradient: grad(i.avatarGradient), text: str(i.text, 3000), postId: sid(i.postId) ? i.postId : null, receivedAt: iso(i.receivedAt) || new Date().toISOString(), status: en(i.status, ['pendente', 'respondido'], 'pendente'), assignedTo: i.assignedTo ? str(i.assignedTo, 60) : null,
    replies: (Array.isArray(i.replies) ? i.replies : []).slice(0, 30).map(r => ({id: str(r && r.id, 60) || 'r', author: str(r && r.author, 60), text: str(r && r.text, 3000), sentAt: iso(r && r.sentAt) || ''})), relacao: en(i.relacao, ['nao_seguidor', 'seguidor', 'apoiador', 'defensor'], 'seguidor'), interacoes: Math.round(num(i.interacoes, 0, 1e6))}));
  const events = (Array.isArray(x.events) ? x.events : []).filter(e => e && sid(e.id)).slice(0, 500).map(e => ({id: e.id, projectId: str(e.projectId, 60), titulo: str(e.titulo, 160), descricao: e.descricao ? str(e.descricao, 1000) : null, tipo: en(e.tipo, ['agenda', 'gravacao', 'prazo', 'interno'], 'agenda'), comecaEm: iso(e.comecaEm) || new Date().toISOString(), terminaEm: iso(e.terminaEm), diaInteiro: !!e.diaInteiro, local: e.local ? str(e.local, 160) : null, municipioCodigo: null, responsavel: e.responsavel ? str(e.responsavel, 80) : null, postIds: (Array.isArray(e.postIds) ? e.postIds : []).filter(sid).slice(0, 30), origem: en(e.origem, ['manual', 'importado'], 'manual'), criadoPor: str(e.criadoPor, 60), criadoEm: iso(e.criadoEm) || new Date().toISOString()}));
  const metrics = {}; if (x.metrics && typeof x.metrics === 'object') Object.keys(x.metrics).filter(sid).slice(0, 30).forEach(k => { metrics[k] = (Array.isArray(x.metrics[k]) ? x.metrics[k] : []).slice(-800).filter(d => d && iso(d.date)).map(d => { const o = {date: String(d.date).slice(0, 10)}; ['followers', 'followersGained', 'followersLost', 'organicReach', 'paidReach', 'organicImpressions', 'paidImpressions', 'organicEngagement', 'paidEngagement', 'adSpend'].forEach(f => { o[f] = num(d[f], 0, 1e10); }); return o; }); });
  return {accounts, posts, boosts, inbox, events, metrics, migrated: !!x.migrated, example: !!x.example};
}
/* Landing pages: dados do produto, insumos, blocos (tipos fixos, textos limitados), visual e rastreio. Mantém os campos antigos (headline, sub, bullets, cta, whatsapp). */
const LP_BLOCK_TYPES = ['hero', 'numeros', 'dor', 'solucao', 'beneficios', 'passos', 'conteudo', 'amostra', 'para_quem', 'autoridade', 'prova', 'oferta', 'bonus', 'garantia', 'faq', 'programa', 'palestrantes', 'local', 'ingressos', 'texto', 'cta_final', 'form'];
/* Produtos do projeto: a fonte dos fatos (benefícios, características, objeções, provas) que alimenta as landing pages e os sites */
/* Sites: várias páginas com cabeçalho, menu e rodapé compartilhados + BrandScript (StoryBrand). As páginas são landings com siteId. */
const seoBase = v => { const m = String(v || '').trim().match(/^https?:\/\/[a-z0-9.\-]{3,100}(:\d{2,5})?(\/[\w\-./]{0,100})?$/i); return m ? m[0].replace(/\/+$/, '') : ''; };
function lpSeoNorm(o) {
  o = o && typeof o === 'object' ? o : {}; const str = (v, n) => String(v == null ? '' : v).slice(0, n), sid = v => /^[\w-]{1,60}$/.test(String(v || '')) ? v : '';
  return {title: str(o.title, 120), desc: str(o.desc, 320), keyword: str(o.keyword, 80), baseUrl: seoBase(o.baseUrl), ogImgId: sid(o.ogImgId), faviconImgId: sid(o.faviconImgId)};
}
function normalizeGrids(arr) {
  const str = (v, n) => String(v == null ? '' : v).slice(0, n), sid = v => /^[\w-]{1,60}$/.test(String(v || '')) ? String(v) : '', num = (v, lo, hi, d) => { v = +v; return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
  return (Array.isArray(arr) ? arr : []).filter(g => g && typeof g === 'object').slice(0, 30).map(g => {
    const mode = g.mode === 'pan' ? 'pan' : 'grid', cols = mode === 'pan' ? Math.round(num(g.cols, 3, 6, 4)) : 3, rows = mode === 'pan' ? 1 : Math.round(num(g.rows, 1, 6, 3)), src = g.src && typeof g.src === 'object' ? g.src : {}, ft = g.fit && typeof g.fit === 'object' ? g.fit : {}, cl = Array.isArray(g.cells) ? g.cells : [];
    return {id: sid(g.id) || uid('gr'), name: str(g.name, 80) || 'Grid', mode, slides: carSlidesN(g.slides), model: mode === 'grid' && ['continuo', 'laterais', 'espelho', 'puzzle', 'faixa'].includes(g.model) ? g.model : 'continuo', colors: (Array.isArray(g.colors) ? g.colors : []).slice(0, 6).map(v => /^#[0-9a-f]{6}$/i.test(String(v)) ? String(v) : ''), band: str(g.band, 200), tag: str(g.tag, 40), dark: !!g.dark, cols, rows, src: {t: ['img', 'set'].includes(src.t) ? src.t : '', id: sid(src.id)}, fit: {z: num(ft.z, 1, 3, 1), fx: num(ft.fx, 0, 1, 0.5), fy: num(ft.fy, 0, 1, 0.5)}, lines: g.lines !== false, feedId: sid(g.feedId), style: /^[\w-]{0,40}$/.test(g.style || '') ? (g.style || '') : '',
      cells: Array.from({length: cols * rows}, (_, i) => { const c = cl[i] && typeof cl[i] === 'object' ? cl[i] : {}; return {label: str(c.label, 80), clean: !!c.clean, carId: sid(c.carId), pieceId: sid(c.pieceId)}; }), created: str(g.created, 40) || new Date().toISOString()};
  });
}
function normalizeFeeds(arr) {
  const str = (v, n) => String(v == null ? '' : v).slice(0, n), sid = v => /^[\w-]{1,60}$/.test(String(v || '')) ? String(v) : '';
  return (Array.isArray(arr) ? arr : []).filter(f => f && typeof f === 'object').slice(0, 30).map(f => {
    const rows = Math.max(3, Math.min(8, Math.round(+f.rows) || 4)), sl = Array.isArray(f.slots) ? f.slots : [];
    return {id: sid(f.id) || uid('fd'), name: str(f.name, 80) || 'Feed', type: /^[\w-]{1,40}$/.test(f.type || '') ? f.type : 'xadrez', rows, style: /^[\w-]{0,40}$/.test(f.style || '') ? (f.style || '') : '', defKind: ['carousel', 'post', 'video'].includes(f.defKind) ? f.defKind : 'carousel', view: ['tons', 'comp', 'pecas'].includes(f.view) ? f.view : 'comp',
      slots: Array.from({length: rows * 3}, (_, i) => { const s = sl[i] && typeof sl[i] === 'object' ? sl[i] : {}, r = s.ref && typeof s.ref === 'object' ? s.ref : {};
        return {kind: ['carousel', 'post', 'video'].includes(s.kind) ? s.kind : ['carousel', 'post', 'video'].includes(f.defKind) ? f.defKind : 'carousel', tone: ['D', 'M', 'L', 'B', 'S'].includes(s.tone) ? s.tone : 'M', label: str(s.label, 80), ref: {t: ['car', 'set'].includes(r.t) ? r.t : '', id: sid(r.id)}, postId: sid(s.postId)}; }), created: str(f.created, 40) || new Date().toISOString()};
  });
}
function normalizeSites(x) {
  const str = (v, n) => String(v == null ? '' : v).slice(0, n), sid = v => /^[\w-]{1,60}$/.test(String(v || ''));
  return (Array.isArray(x) ? x : []).filter(s => s && sid(s.id)).slice(0, 50).map(s => { const b = s.bs || {}, o = (k, n) => str(b[k], n);
    return {id: s.id, name: str(s.name, 120) || 'Site', tpl: str(s.tpl, 30), productId: sid(s.productId) ? s.productId : '', brief: str(s.brief, 8000), brand: str(s.brand, 80), headerCta: str(s.headerCta, 40), footer: str(s.footer, 400), contact: str(s.contact, 300), desc: str(s.desc, 300), baseUrl: seoBase(s.baseUrl), ogImgId: sid(s.ogImgId) ? s.ogImgId : '', faviconImgId: sid(s.faviconImgId) ? s.faviconImgId : '',
      bs: {who: o('who', 800), wants: o('wants', 800), external: o('external', 800), internal: o('internal', 800), philosophical: o('philosophical', 800), empathy: o('empathy', 800), authority: o('authority', 1200), step1: o('step1', 400), step2: o('step2', 400), step3: o('step3', 400), agreement: o('agreement', 800), direct: o('direct', 200), transitional: o('transitional', 300), failure: o('failure', 1000), success: o('success', 1000), identity: o('identity', 600)}, created: str(s.created, 40) || new Date().toISOString()}; });
}
/* Campanhas: peças × medidas (feed, vertical, horizontal), bancos de variações e plano de teste, tudo com limites fixos */
const CMP_KINDS = ['dor', 'duvida', 'desejo', 'urgencia'], CMP_NOTE_KINDS = ['ideia', 'comentario', 'dor', 'duvida', 'desejo', 'urgencia'], CMP_MEASURES = ['feed', 'vertical', 'horizontal'], CMP_STAGES = ['topo', 'meio', 'fundo', 'pos'];
function normalizeCampaigns(x) {
  const str = (v, n) => String(v == null ? '' : v).slice(0, n), sid = v => /^[\w-]{1,60}$/.test(String(v || '')), hex = v => /^#[0-9a-f]{6}$/i.test(String(v || '')), lines = (a, n, m) => (Array.isArray(a) ? a : []).slice(0, m).map(t => str(t, n).trim()).filter(Boolean);
  return (Array.isArray(x) ? x : []).filter(c => c && typeof c === 'object' && sid(c.id)).slice(0, 100).map(c => {
    const bank = c.bank || {}, pieces = (Array.isArray(c.pieces) ? c.pieces : []).filter(q => q && sid(q.id)).slice(0, 60).map(q => {
      const on = {}, sets = {}, lock = {}; CMP_MEASURES.forEach(m => { on[m] = !(q.on && q.on[m] === false); sets[m] = q.sets && sid(q.sets[m]) ? q.sets[m] : ''; lock[m] = !!(q.lock && q.lock[m]); });
      return {id: q.id, name: str(q.name, 100) || 'Peça', stage: CMP_STAGES.includes(q.stage) ? q.stage : 'meio', h: str(q.h, 200), s: str(q.s, 300), btn: str(q.btn, 60), imgId: sid(q.imgId) ? q.imgId : '', col: Math.max(0, Math.min(9, +q.col || 0)), on, sets, lock, status: ['Rascunho', 'Em revisão', 'Aprovada', 'No ar'].includes(q.status) ? q.status : 'Rascunho', syncedAt: str(q.syncedAt, 40)};
    });
    return {id: c.id, name: str(c.name, 120) || 'Campanha', objective: str(c.objective, 120), budget: Math.max(0, +c.budget || 0), channel: str(c.channel, 60) || 'Meta Ads', status: ['Rascunho', 'Ativa', 'Pausada'].includes(c.status) ? c.status : 'Rascunho', period: str(c.period, 80), audience: str(c.audience, 300),
      feedFmt: c.feedFmt === 'square' ? 'square' : 'feed45', layout: ['auto', 'full', 'top', 'bottom', 'none'].includes(c.layout) ? c.layout : 'auto', align: c.align === 'center' ? 'center' : 'left', bank: {dor: lines(bank.dor, 200, 12), duvida: lines(bank.duvida, 200, 12), desejo: lines(bank.desejo, 200, 12), urgencia: lines(bank.urgencia, 200, 12), h: lines(bank.h, 200, 12), ht: (Array.isArray(bank.ht) ? bank.ht : []).slice(0, 12).map(t => CMP_KINDS.includes(t) ? t : ''), s: lines(bank.s, 300, 12), c: lines(bank.c, 60, 12), img: (Array.isArray(bank.img) ? bank.img : []).filter(sid).slice(0, 12), col: (Array.isArray(bank.col) ? bank.col : []).filter(v => v && hex(v.bg) && hex(v.accent)).slice(0, 6).map(v => ({name: str(v.name, 30), bg: v.bg, accent: v.accent, fg: hex(v.fg) ? v.fg : '#ffffff'}))},
      notes: (Array.isArray(c.notes) ? c.notes : []).filter(n => n && sid(n.id) && str(n.text, 1500).trim()).slice(0, 300).map(n => ({id: n.id, kind: CMP_NOTE_KINDS.includes(n.kind) ? n.kind : 'ideia', text: str(n.text, 1500), src: str(n.src, 200), pin: !!n.pin, created: str(n.created, 40) || new Date().toISOString()})),
      test: {macro: str(c.test && c.test.macro, 400), micro: str(c.test && c.test.micro, 400), format: str(c.test && c.test.format, 400), notes: str(c.test && c.test.notes, 1500)}, pieces, created: str(c.created, 40) || new Date().toISOString()};
  });
}
function normalizeProducts(x) {
  const str = (v, n) => String(v == null ? '' : v).slice(0, n), sid = v => /^[\w-]{1,60}$/.test(String(v || '')), lines = (a, n, m) => (Array.isArray(a) ? a : []).slice(0, m).map(t => str(t, n)).filter(Boolean), TY = ['curso', 'ebook', 'servico', 'evento', 'produto', 'cadastro'];
  return (Array.isArray(x) ? x : []).filter(r => r && sid(r.id)).slice(0, 200).map(r => ({id: r.id, name: str(r.name, 160) || 'Produto', type: TY.includes(r.type) ? r.type : 'produto', summary: str(r.summary, 2000), price: str(r.price, 80), audience: str(r.audience, 400), checkout: /^https?:\/\/[^\s"'<>]{1,500}$/i.test(r.checkout || '') ? r.checkout : '',
    benefits: lines(r.benefits, 300, 30), features: lines(r.features, 300, 40), objections: lines(r.objections, 300, 20), proofs: lines(r.proofs, 400, 20), images: (Array.isArray(r.images) ? r.images : []).filter(sid).slice(0, 8), created: str(r.created, 40) || new Date().toISOString()}));
}
/* Editor visual (estilo Elementor): seções → colunas (grade de 12, com largura por dispositivo) → widgets. Tudo com tipos e limites fixos. */
const BX_WIDGETS = ['heading', 'text', 'image', 'video', 'button', 'list', 'feature', 'spacer', 'divider', 'form', 'faq', 'quote', 'countdown', 'tpl'];
function tplWidgetNorm(t) {
  t = t && typeof t === 'object' ? t : {}; const ok = k => /^\d{1,3}$/.test(String(k)), obj = (o, f, max) => { const r = {}; Object.keys(o && typeof o === 'object' ? o : {}).filter(ok).slice(0, max).forEach(k => { const v = f(o[k]); if (v != null) r[k] = v; }); return r; };
  const hexMap = o => { const r = {}; Object.keys(o && typeof o === 'object' ? o : {}).slice(0, 8).forEach(k => { if (/^#[0-9a-f]{6}$/i.test(k) && /^#[0-9a-f]{6}$/i.test(String(o[k]))) r[k.toLowerCase()] = String(o[k]).toLowerCase(); }); return r; };
  const fonts = {}; Object.keys(t.fonts && typeof t.fonts === 'object' ? t.fonts : {}).slice(0, 4).forEach(k => { const a = String(k).replace(/[^\w \-]/g, '').slice(0, 60), b = String(t.fonts[k]).replace(/[^\w \-]/g, '').trim().slice(0, 60); if (a && b) fonts[a] = b; });
  return {id: /^[\w-]{1,60}$/.test(String(t.id || '')) ? t.id : '', s: obj(t.s, v => String(v == null ? '' : v).slice(0, 600), 140), i: obj(t.i, v => /^[\w-]{1,60}$/.test(String(v || '')) ? v : null, 40), h: obj(t.h, v => /^(https?:\/\/[^\s"'<>]{1,500}|#[\w-]{1,60}|mailto:[^\s"'<>]{1,200}|tel:[+\d]{3,20})$/i.test(String(v || '')) ? String(v) : null, 60), map: hexMap(t.map), fonts};
}
function normalizeTplbank(x) {
  const str = (v, n) => String(v == null ? '' : v).slice(0, n), items = x && Array.isArray(x.items) ? x.items : [];
  return {items: items.filter(i => i && safeId(i.id)).slice(0, 600).map(i => ({id: i.id, tpl: str(i.tpl, 80) || 'Template', page: str(i.page, 120), name: str(i.name, 80) || 'Seção', kind: typeof TPL_KINDS === 'object' && TPL_KINDS[i.kind] ? i.kind : 'other', niche: str(i.niche, 60), order: Math.max(0, Math.round(+i.order) || 0), imgIds: (Array.isArray(i.imgIds) ? i.imgIds : []).filter(safeId).slice(0, 80), colors: (Array.isArray(i.colors) ? i.colors : []).filter(c => /^#[0-9a-f]{6}$/i.test(String(c))).slice(0, 4), fonts: (Array.isArray(i.fonts) ? i.fonts : []).map(f => str(f, 60)).slice(0, 2), license: str(i.license, 160), created: str(i.created, 40)}))};
}
function normalizeVis(v) {
  if (!v || typeof v !== 'object' || !Array.isArray(v.sections)) return null;
  const str = (x, n) => String(x == null ? '' : x).slice(0, n), sid = x => /^[\w-]{1,60}$/.test(String(x || '')) ? x : uid('bx'), hex = x => /^#[0-9a-f]{6}$/i.test(String(x)) ? String(x) : '', num = (x, lo, hi, d) => { x = +x; return isFinite(x) ? Math.min(hi, Math.max(lo, Math.round(x))) : d; };
  const bp = (o, f) => { o = o && typeof o === 'object' ? o : {}; const r = {}; ['d', 't', 'l', 'm'].forEach(k => { if (o[k] != null && o[k] !== '') { const y = f(o[k]); if (y != null) r[k] = y; } }); return r; };
  const hide = o => ({t: !!(o && o.t), l: !!(o && o.l), m: !!(o && o.m)}), al = x => ['left', 'center', 'right'].includes(x) ? x : null;
  const url = x => (/^https?:\/\/[^\s"'<>]{1,600}$/i.test(String(x || '')) ? String(x) : '');
  const widget = w => { if (!w || !BX_WIDGETS.includes(w.t)) return null; return {id: sid(w.id), t: w.t, hide: hide(w.hide), al: bp(w.al, al), size: bp(w.size, x => num(x, 10, 120, null)), wpct: bp(w.wpct, x => num(x, 10, 100, null)), h: bp(w.h, x => num(x, 0, 400, null)),
    text: str(w.text, 4000), title: str(w.title, 300), tag: ['h1', 'h2', 'h3'].includes(w.tag) ? w.tag : 'h2', color: hex(w.color), fw: [300, 400, 500, 600, 700, 800, 900].includes(+w.fw) ? +w.fw : 0, ff: str(w.ff, 60).replace(/[^\w \-]/g, '').trim(), muted: !!w.muted, imgId: /^[\w-]{1,60}$/.test(w.imgId || '') ? w.imgId : '', src: url(w.src), alt: str(w.alt, 200), rad: num(w.rad, 0, 60, 12),
    ratio: ['16:9', '9:16', '1:1', '4:5'].includes(w.ratio) ? w.ratio : '16:9', link: ['checkout', 'form', 'whatsapp', 'custom'].includes(w.link) ? w.link : 'checkout', href: /^(https?:\/\/[^\s"'<>]{1,600}|#[\w-]{1,60}|mailto:[^\s"'<>]{1,200}|tel:[+\d]{3,20})$/i.test(w.href || '') ? w.href : '', style: ['solid', 'outline'].includes(w.style) ? w.style : 'solid', full: !!w.full, icon: ['check', 'x', 'dot'].includes(w.icon) ? w.icon : 'check', emoji: str(w.emoji, 4), date: /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(w.date || '') ? w.date : '',
    items: (Array.isArray(w.items) ? w.items : []).slice(0, 30).map(i => (typeof i === 'string' ? {t: str(i, 400), d: ''} : {t: str(i && i.t, 400), d: str(i && i.d, 1200)})), ...(w.t === 'tpl' ? {tpl: tplWidgetNorm(w.tpl)} : {})}; };
  const sections = v.sections.slice(0, 40).map(s => s && typeof s === 'object' ? ({id: sid(s.id), name: str(s.name, 80), w: s.w === 'full' ? 'full' : 'box', bg: hex(s.bg), alt: !!s.alt, bgImg: /^[\w-]{1,60}$/.test(s.bgImg || '') ? s.bgImg : '', pad: bp(s.pad, x => num(x, 0, 240, null)), padB: bp(s.padB, x => num(x, 0, 240, null)), hide: hide(s.hide), gap: bp(s.gap, x => num(x, 0, 80, null)),
    cols: (Array.isArray(s.cols) ? s.cols : []).slice(0, 24).map(c => ({id: sid(c && c.id), span: bp(c && c.span, x => num(x, 1, 12, null)), v: ['top', 'center', 'bottom'].includes(c && c.v) ? c.v : 'top', widgets: (Array.isArray(c && c.widgets) ? c.widgets : []).slice(0, 30).map(widget).filter(Boolean)}))}) : null).filter(Boolean);
  return {sections};
}
function normalizeLandings(x) {
  const str = (v, n) => String(v == null ? '' : v).slice(0, n), sid = v => /^[\w-]{1,60}$/.test(String(v || '')), hex = (v, d) => /^#[0-9a-f]{6}$/i.test(String(v)) ? String(v) : d, TY = ['curso', 'ebook', 'servico', 'evento', 'cadastro', 'generico'];
  return (Array.isArray(x) ? x : []).filter(l => l && typeof l === 'object').slice(0, 200).map(l => {
    const pr = l.product || {}, th = l.theme || {}, tr = l.tracking || {};
    return {id: sid(l.id) ? l.id : uid('lp'), name: str(l.name, 120) || 'Landing page', goal: str(l.goal, 30) || 'Gerar lead', headline: str(l.headline, 300), sub: str(l.sub, 500), bullets: str(l.bullets, 3000), cta: str(l.cta, 80) || 'Enviar', whatsapp: str(l.whatsapp, 20).replace(/\D/g, ''), waFloat: l.waFloat !== false, waAfter: !!l.waAfter, waMsg: str(l.waMsg, 200), thanks: {mode: ['page', 'url', 'none'].includes((l.thanks || {}).mode) ? l.thanks.mode : 'page', url: /^https?:\/\/[^\s"'<>]{1,500}$/i.test((l.thanks || {}).url || '') ? l.thanks.url : '', title: str((l.thanks || {}).title, 120), text: str((l.thanks || {}).text, 400)}, status: str(l.status, 30) || 'Rascunho',
      type: TY.includes(l.type) ? l.type : '', productId: sid(l.productId) ? l.productId : '', pick: {b: (l.pick && Array.isArray(l.pick.b) ? l.pick.b : []).slice(0, 40).map(n => Math.max(0, Math.round(+n) || 0)), f: (l.pick && Array.isArray(l.pick.f) ? l.pick.f : []).slice(0, 40).map(n => Math.max(0, Math.round(+n) || 0)), all: !l.pick || l.pick.all !== false}, siteId: sid(l.siteId) ? l.siteId : '', siteRole: str(l.siteRole, 20), slug: /^[a-z0-9-]{1,40}$/.test(l.slug || '') ? l.slug : '', navLabel: str(l.navLabel, 40), group: sid(l.group) ? l.group : '', variant: /^[A-Z]$/.test(l.variant || '') ? l.variant : '', angle: str(l.angle, 120), product: {nome: str(pr.nome, 160), preco: str(pr.preco, 80), publico: str(pr.publico, 400), checkout: /^https?:\/\/[^\s"'<>]{1,500}$/i.test(pr.checkout || '') ? pr.checkout : '', data: str(pr.data, 80), local: str(pr.local, 200)}, input: str(l.input, 60000),
      theme: {accent: hex(th.accent, '#e4572e'), bg: hex(th.bg, '#ffffff'), fg: hex(th.fg, '#141414'), dark: !!th.dark, head: str(th.head, 60) || 'Poppins', body: str(th.body, 60) || 'Inter'},
      seo: lpSeoNorm(l.seo),
      tracking: {metaPixel: /^\d{5,20}$/.test(tr.metaPixel || '') ? tr.metaPixel : '', ga4: /^G-[A-Z0-9]{4,14}$/.test(tr.ga4 || '') ? tr.ga4 : ''}, privacyUrl: /^https?:\/\/[^\s"'<>]{1,500}$/i.test(l.privacyUrl || '') ? l.privacyUrl : '',
      blocks: (Array.isArray(l.blocks) ? l.blocks : []).filter(b => b && LP_BLOCK_TYPES.includes(b.t)).slice(0, 40).map(b => ({id: sid(b.id) ? b.id : uid('bk'), t: b.t, on: b.on !== false, title: str(b.title, 300), text: str(b.text, 3000), kicker: str(b.kicker, 120), cta: str(b.cta, 80), note: str(b.note, 300), name: str(b.name, 160), price: str(b.price, 80), imgId: sid(b.imgId) ? b.imgId : '',
        items: (Array.isArray(b.items) ? b.items : []).slice(0, 30).map(i => ({t: str(i && i.t, 400), d: str(i && i.d, 1200)})), yes: (Array.isArray(b.yes) ? b.yes : []).slice(0, 12).map(t => str(t, 300)), no: (Array.isArray(b.no) ? b.no : []).slice(0, 12).map(t => str(t, 300))})),
      vis: normalizeVis(l.vis), created: str(l.created, 40) || new Date().toISOString()};
  });
}
/* nº de slides (3 a 12, capa e fechamento incluídos) → nº de textos: 6 slides = estrutura BrandsDecoded (18 textos); os demais = capa (2) + 3 por slide de miolo + fechamento (2) */
const carSlidesN = v => Math.max(3, Math.min(20, Math.round(+v) || 6));
/* até 10 slides: 1 chamada para ação; com mais de 10: 2 (uma de retenção e uma de ação) */
const carCtaCount = n => n > 10 ? 2 : 1, carMidCount = n => n > 10 ? n - 3 : n - 2;
const carTotal = n => n === 6 ? 18 : 2 + 3 * carMidCount(n) + 2 * carCtaCount(n);
const CTA_TYPES = ['salvar', 'seguir', 'compartilhar', 'material', 'analise', 'bio', 'codigo'];
function normalizeCarousel(c) {
  c = c && typeof c === 'object' ? c : {}; const str = (v, n) => String(v == null ? '' : v).slice(0, n), sid = v => /^[\w-]{1,60}$/.test(String(v || '')) ? String(v) : '', hex = v => /^#[0-9a-f]{6}$/i.test(String(v)) ? String(v) : '', nSl = carSlidesN(c.slides), T = (Array.isArray(c.texts) ? c.texts : []).slice(0, carTotal(nSl)).map(t => str(t, 1200)); while (T.length < carTotal(nSl)) T.push('');
  const map = (o, f, n) => { const r = {}; if (o && typeof o === 'object') Object.keys(o).slice(0, 30).forEach(k => { if (/^\d{1,2}$/.test(k)) { const v = f(o[k]); if (v) r[k] = v; } }); return r; }, g = c.globals && typeof c.globals === 'object' ? c.globals : {}, ct = c.cta && typeof c.cta === 'object' ? c.cta : {};
  return {id: sid(c.id) || uid('car'), name: str(c.name, 80) || 'Carrossel', slides: nSl, stage: ['topo', 'meio', 'fundo'].includes(c.stage) ? c.stage : 'topo', tpl: /^[\w-]{1,40}$/.test(c.tpl || '') ? c.tpl : 'foto', ratio: c.ratio === '9:16' ? '9:16' : '4:5', grad: Math.max(0, Math.min(100, Math.round(+c.grad >= 0 ? +c.grad : 70))),
    media: map(c.media, sid), bgs: map(c.bgs, hex), fx: map(c.fx, v => (v && typeof v === 'object' ? {x: Math.max(0, Math.min(1, +v.x || 0.5)), y: Math.max(0, Math.min(1, +v.y || 0.5))} : null)),
    globals: {handle: str(g.handle, 60), name: str(g.name, 60), copyright: str(g.copyright, 80), verified: g.verified !== false, avatarId: sid(g.avatarId), show: {handle: !(g.show && g.show.handle === false), name: !(g.show && g.show.name === false), copyright: !(g.show && g.show.copyright === false), avatar: !(g.show && g.show.avatar === false)}},
    objective: c.objective === 'anuncio' ? 'anuncio' : 'organico', caption: str(c.caption, 2200), hashtags: str(c.hashtags, 400), ad: {titulo: str(c.ad && c.ad.titulo, 80), texto: str(c.ad && c.ad.texto, 600), descricao: str(c.ad && c.ad.descricao, 120), botao: str(c.ad && c.ad.botao, 40)}, ctas: (Array.isArray(c.ctas) ? c.ctas : []).slice(0, 2).map(k => ({type: CTA_TYPES.includes(k && k.type) ? k.type : 'salvar', code: str(k && k.code, 30).replace(/[^\w\-]/g, '').toUpperCase(), text: str(k && k.text, 60), line: str(k && k.line, 160)})), splitCover: !!c.splitCover, fontHead: str(c.fontHead, 60).replace(/[^\w \-]/g, '').trim(), accent: hex(c.accent), cta: {on: ct.on !== false, text: str(ct.text, 40), style: ['solid', 'outline', 'glass'].includes(ct.style) ? ct.style : 'solid', align: ['left', 'center', 'right'].includes(ct.align) ? ct.align : 'left', icon: ['', 'arrow', 'send', 'play', 'heart', 'star', 'bookmark'].includes(ct.icon) ? ct.icon : 'arrow', color: hex(ct.color), textColor: hex(ct.textColor)},
    versions: (Array.isArray(c.versions) ? c.versions : []).slice(0, 12).map(v => ({at: str(v && v.at, 40), label: str(v && v.label, 60), texts: (Array.isArray(v && v.texts) ? v.texts : []).slice(0, 60).map(t => str(t, 1200)), slides: carSlidesN(v && v.slides)})).filter(v => v.texts.length),
    base: /^[\w-]{1,30}$/.test(c.base || '') ? c.base : 'brandsdecoded', cover: /^[\w-]{1,30}$/.test(c.cover || '') ? c.cover : 'tese', style: /^[\w-]{0,40}$/.test(c.style || '') ? (c.style || '') : '', dark: !!c.dark, idea: str(c.idea, 4000), useAgent: c.useAgent !== false, texts: T,
    covers: (Array.isArray(c.covers) ? c.covers : []).slice(0, 8).map(o => ({titulo: str(o && o.titulo, 300), subtitulo: str(o && o.subtitulo, 500)})).filter(o => o.titulo), created: str(c.created, 40) || new Date().toISOString(), updated: str(c.updated, 40) || new Date().toISOString()};
}
/* vários carrosséis por projeto; o carrossel único antigo (p.carousel) vira o primeiro da lista, uma vez */
function normalizeCarousels(arr, legacy) {
  const out = (Array.isArray(arr) ? arr : []).filter(x => x && typeof x === 'object').slice(0, 100).map(normalizeCarousel);
  if (!out.length && legacy && Array.isArray(legacy.texts) && legacy.texts.some(t => String(t).trim())) out.push(Object.assign(normalizeCarousel(legacy), {name: String(legacy.texts[0] || 'Carrossel').slice(0, 60)}));
  return out;
}
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
  s.imglib = normalizeImglib(s.imglib); s.tplbank = normalizeTplbank(s.tplbank); s.lpRefs = normalizeLpRefs(s.lpRefs); s.myFonts = normalizeMyFonts(s.myFonts); s.skills = normalizeSkills(s.skills);
  s.templates = (Array.isArray(s.templates) ? s.templates : []).filter(t => t && typeof t === 'object' && Array.isArray(t.slides) && t.format).map(t => { if (!safeId(t.id)) t.id = uid('tp'); t.kind = t.kind === 'deck' ? 'deck' : 'set'; t.name = String(t.name || 'Modelo').slice(0, 80); return t; });
  s.projects = s.projects.filter(p => p && typeof p === 'object').map(p => {
    if (!safeId(p.id)) p.id = uid('p');
    const q = mergeDefaults(p, newProject(p.name || 'Projeto', p.desc)); q.ebooks = normalizeEbooks(q.ebooks); q.layouts = normalizeLayouts(q.layouts); q.motor = normalizeMotor(q.motor); q.cover = normalizeCover(q.cover); q.kdp = normalizeKdp(q.kdp); q.editorial = normalizeEditorial(q.editorial); q.carousel = normalizeCarousel(q.carousel); q.carousels = normalizeCarousels(q.carousels, q.carousel); q.feeds = normalizeFeeds(q.feeds); q.grids = normalizeGrids(q.grids); q.social = normalizeSocial(q.social); q.landings = normalizeLandings(q.landings); q.products = normalizeProducts(q.products); q.campaigns = normalizeCampaigns(q.campaigns); q.sites = normalizeSites(q.sites); return q;
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
  if (/\.(ampliacao|zip)$/i.test(file.name || '')) { pkgImportFile(file); return; }
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
