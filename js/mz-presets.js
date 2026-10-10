/* ===== Mesa de edição · presets: ícones, catálogo de elementos, blocos prontos e modelos de página =====
   Blocos "avançados" são árvores de elementos básicos: o usuário edita um a um. Nada de widgets opacos.
   Regra de conteúdo do Studio: não inventar depoimentos, números nem preços. Marcadores [entre colchetes] marcam o que falta. */
Object.assign(MZ_ICONS, {
  star: '<polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/>',
  check: '<polyline points="4 12 10 18 20 6"/>', 'check-circle': '<circle cx="12" cy="12" r="10"/><polyline points="7 12.5 10.5 16 17 8.5"/>',
  'arrow-right': '<line x1="4" y1="12" x2="20" y2="12"/><polyline points="13 5 20 12 13 19"/>', 'arrow-down': '<line x1="12" y1="4" x2="12" y2="20"/><polyline points="5 13 12 20 19 13"/>',
  phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/>',
  'map-pin': '<path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>', clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  shield: '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><polyline points="8.5 12 11 14.5 15.5 9.5"/>', heart: '<path d="M12 21s-8-5.5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 10c0 5.5-8 11-8 11z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14a5 5 0 0 1 5 5"/>',
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>', search: '<circle cx="11" cy="11" r="7"/><line x1="16" y1="16" x2="21" y2="21"/>', menu: '<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>',
  x: '<line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/>', play: '<polygon points="7 4 20 12 7 20"/>', zap: '<polygon points="13 2 4 14 11 14 10 22 20 9 13 9"/>',
  award: '<circle cx="12" cy="9" r="6"/><polyline points="8.5 14 7 22 12 19 17 22 15.5 14"/>', calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>',
  camera: '<path d="M3 8h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13" r="3.5"/>', chat: '<path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-5.5A8 8 0 1 1 21 12z"/>', globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>', gift: '<rect x="3" y="9" width="18" height="12"/><line x1="12" y1="9" x2="12" y2="21"/><path d="M3 9h18v-3H3zM12 6c-3-4-6-1-4 0M12 6c3-4 6-1 4 0"/>',
  'trending-up': '<polyline points="3 17 9 11 13 15 21 6"/><polyline points="15 6 21 6 21 12"/>', target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>', 'thumbs-up': '<path d="M7 11v10H3V11zM7 11l4-8c2 0 3 1.5 2.5 3.5L13 10h6a2 2 0 0 1 2 2.4l-1.3 6A2 2 0 0 1 17.7 20H7"/>',
  dollar: '<line x1="12" y1="2" x2="12" y2="22"/><path d="M17 6.5C16 5 14 4.5 12 4.5c-3 0-5 1.5-5 3.5s2 3 5 3.5 5 1.5 5 3.5-2 3.5-5 3.5c-2 0-4-.5-5-2"/>', file: '<path d="M6 2h8l5 5v15H6z"/><polyline points="14 2 14 7 19 7"/>',
  download: '<line x1="12" y1="3" x2="12" y2="15"/><polyline points="7 11 12 16 17 11"/><line x1="4" y1="21" x2="20" y2="21"/>', link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V4h6v3"/>', book: '<path d="M4 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H4zM20 4h-7a3 3 0 0 0-3 3"/><path d="M20 4v15h-8"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>', smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14a4 4 0 0 0 8 0"/><line x1="9" y1="9" x2="9" y2="9.5"/><line x1="15" y1="9" x2="15" y2="9.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>', leaf: '<path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15z"/><path d="M5 19L14 10"/>', scale: '<line x1="12" y1="3" x2="12" y2="21"/><line x1="6" y1="21" x2="18" y2="21"/><path d="M5 7h14M5 7l-3 8a3 3 0 0 0 6 0zM19 7l-3 8a3 3 0 0 0 6 0z"/>',
  building: '<rect x="5" y="3" width="14" height="18"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>', tool: '<path d="M14 6a4 4 0 0 0 5 5l-9 9a2.8 2.8 0 0 1-4-4l9-9a4 4 0 0 0-1-1z"/>', mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8z"/><path d="M10 20a2 2 0 0 0 4 0"/>', eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', layers: '<polygon points="12 2 22 8 12 14 2 8"/><polyline points="2 12 12 18 22 12"/><polyline points="2 16 12 22 22 16"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>', truck: '<rect x="2" y="6" width="12" height="10"/><path d="M14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>', instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/>',
  whatsapp: '<path d="M3 21l1.6-4.7A9 9 0 1 1 8 19.5z"/><path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 .7a4 4 0 0 1-2-2l.7-1-1-2z"/>', plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'
});
/* ---------- construtores curtos (isolados) ---------- */
const MZB = (() => {
  const N = mzNode, st = (d, t, m) => ({d: d || {}, t: t || {}, m: m || {}});
  return {
    sec: (kids, d, t, m, props) => N('section', Object.assign({boxed: true}, props || {}), st(Object.assign({padding: '96px 24px'}, d), t, Object.assign({padding: '56px 20px'}, m)), kids),
    box: (kids, d, t, m, name) => N('container', {}, st(d, t, m), kids, name ? {name} : null),
    col: (kids, d, t, m) => N('column', {}, st(Object.assign({display: 'flex', flexDirection: 'column', gap: 16}, d), t, m), kids),
    h: (text, level, d, t, m, typo) => N('heading', {text, level: level || 2}, st(d, t, m), [], typo ? {typo} : null),
    tx: (html, d, t, m, typo) => N('text', {html: mzRich(html)}, st(d, t, m), [], typo ? {typo} : null),
    im: (imgId, d, t, m, alt) => N('image', {imgId: imgId || '', alt: alt || ''}, st(Object.assign({borderRadius: 'var(--mz-r-lg)', width: '100%'}, d), t, m)),
    btn: (text, href, variant, d, t, m) => N('button', {text, href: href || '#form', variant: variant || 'solid'}, st(d, t, m)),
    ic: (name, size, d) => N('icon', {name, size: size || 32}, st(Object.assign({color: 'var(--mz-c-accent)'}, d))),
    li: (items, icon, d) => N('list', {items, icon: icon || 'check-circle'}, st(d || {})),
    badge: (text, d) => N('badge', {text}, st(d || {})),
    inp: (kind, name, label, ph, req) => N('input', {kind, name, label, placeholder: ph || '', required: !!req}, st({})),
    chk: (name, label, req) => N('checkbox', {name, label, required: !!req}, st({})),
    row: (kids, d, t, m) => N('container', {}, st(Object.assign({display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'center'}, d), Object.assign({flexDirection: 'column'}, t), m), kids),
    grid: (n, kids, d, t, m) => N('container', {}, st(Object.assign({display: 'grid', gridTemplateColumns: `repeat(${n},1fr)`, gap: 24}, d), Object.assign({gridTemplateColumns: n > 2 ? 'repeat(2,1fr)' : '1fr'}, t), Object.assign({gridTemplateColumns: '1fr'}, m)), kids),
    card: (kids, d) => N('container', {}, st(Object.assign({display: 'flex', flexDirection: 'column', gap: 12, padding: 28, backgroundColor: '#ffffff', borderRadius: 'var(--mz-r-md)', boxShadow: 'var(--mz-sh-md)', color: '#111111'}, d)), kids),
    N, st
  };
})();
/* ---------- contexto do projeto (briefing, público, oferta, logo, cores, fontes) ---------- */
function mzCtx(p) {
  const c = {name: (p && (p.client || p.name)) || 'Sua empresa', offer: '', audience: '', problem: '', goal: '', cta: 'Quero saber mais', logo: '', product: '', benefits: [], pains: [], desires: [], doubts: [], tone: ''};
  if (!p) return c; const b = p.brief || {}, pr = (p.products || [])[0], ic = (typeof projIcps === 'function' ? projIcps(p) : ((p.pre && p.pre.icps) || []))[0] || {}, L = s => String(s || '').split('\n').map(x => x.replace(/^[-•*\d.)\s]+/, '').trim()).filter(Boolean);
  c.offer = (pr && (pr.summary || pr.name)) || String(b.offer || '').split('\n')[0] || ''; c.product = (pr && pr.name) || ''; c.audience = String(b.audience || '').split('\n')[0] || ic.name || ''; c.problem = String(b.problem || '').split('\n')[0] || L(ic.pains)[0] || ''; c.goal = b.goal || '';
  c.benefits = ((pr && pr.benefits) || []).slice(0, 6); c.pains = L(ic.pains).slice(0, 6); c.desires = L(ic.desires).slice(0, 6); c.doubts = L(ic.doubts).slice(0, 6); c.tone = (p.brand && p.brand.tone) || '';
  try { const lg = brandOf(p).logos[0]; if (lg) c.logo = lg.imgId; } catch (e) { /* sem logo */ }
  if (pr && pr.checkout) c.checkout = pr.checkout; return c;
}
const mzPh = (t, fb) => (t && String(t).trim()) ? String(t).trim() : '[' + fb + ']';
const mzPick = (a, i, fb) => (a && a[i]) ? a[i] : '[' + fb + ']';
/* ---------- blocos prontos ---------- */
const MZ_BLOCKS = [
  {id: 'header', name: 'Cabeçalho com menu', icon: 'menu', make: c => { const s = MZB.sec([MZB.row([c.logo ? MZB.N('logo', {imgId: c.logo, alt: c.name}, MZB.st({width: 140})) : MZB.h(c.name, 3, {fontWeight: 800}, null, null, 'h3'), MZB.N('menu', {items: [{label: 'Início', href: '#'}, {label: 'Benefícios', href: '#beneficios'}, {label: 'Contato', href: '#form'}]}, MZB.st({}, {}, {display: 'none'})), MZB.btn('Fale conosco', '#form', 'solid', {padding: '10px 20px'})], {justifyContent: 'space-between', gap: 24}, {flexDirection: 'row'}, {flexDirection: 'row'})], {padding: '16px 24px', position: 'sticky', top: 0, zIndex: 20, backgroundColor: 'var(--mz-c-background)', boxShadow: 'var(--mz-sh-sm)'}, null, {padding: '12px 16px'}); s.name = 'Cabeçalho'; return s; }},
  {id: 'hero', name: 'Hero (título, texto, botão e imagem)', icon: 'star', make: c => { const s = MZB.sec([MZB.row([MZB.col([MZB.badge(c.audience ? 'Para ' + c.audience : '[Para quem é]'), MZB.h(mzPh(c.offer, 'Promessa principal da oferta'), 1), MZB.tx(mzPh(c.problem ? 'Chega de ' + c.problem.toLowerCase().replace(/[.!?]+$/, '') + '.' : '', 'Subtítulo: o problema que você resolve'), {color: 'var(--mz-c-muted)', maxWidth: 560}), MZB.row([MZB.btn(c.cta, '#form'), MZB.btn('Saiba mais', '#beneficios', 'outline')], {gap: 12, flexWrap: 'wrap'}, {flexDirection: 'row'}, {flexDirection: 'column', alignItems: 'stretch'})], {flex: '1 1 50%'}), MZB.im('', {flex: '1 1 45%', aspectRatio: '4/3', objectFit: 'cover'}, null, null, 'Imagem principal')], {gap: 56, alignItems: 'center'}, {flexDirection: 'column'})], {padding: '112px 24px'}, null, {padding: '48px 20px'}); s.name = 'Hero'; s.htmlId = 'topo'; return s; }},
  {id: 'benefits', name: 'Benefícios (3 cartões)', icon: 'layers', make: c => { const it = i => MZB.card([MZB.ic(['shield', 'zap', 'heart'][i], 36), MZB.h(mzPick(c.benefits.length ? c.benefits : c.desires, i, 'Benefício ' + (i + 1)), 3), MZB.tx('[Explique em uma frase o que a pessoa ganha]', {color: '#5d6068'}, null, null, 'small')]); const s = MZB.sec([MZB.h('Por que escolher ' + (c.name), 2, {textAlign: 'center'}), MZB.grid(3, [it(0), it(1), it(2)], {marginTop: 40})], {backgroundColor: 'var(--mz-c-background)'}); s.name = 'Benefícios'; s.htmlId = 'beneficios'; return s; }},
  {id: 'problem', name: 'Problema e solução', icon: 'target', make: c => { const s = MZB.sec([MZB.grid(2, [MZB.col([MZB.h('Você se identifica?', 2), MZB.li(c.pains.length ? c.pains.slice(0, 4) : ['[Dor 1 do público]', '[Dor 2]', '[Dor 3]'], 'x', {color: 'var(--mz-c-muted)'})]), MZB.col([MZB.h('Como resolvemos', 2), MZB.li(c.desires.length ? c.desires.slice(0, 4) : ['[Resultado 1]', '[Resultado 2]', '[Resultado 3]'], 'check-circle')])], {gap: 56, alignItems: 'start'})], {backgroundColor: 'rgba(0,0,0,.03)'}); s.name = 'Problema e solução'; return s; }},
  {id: 'steps', name: 'Como funciona (3 passos)', icon: 'arrow-right', make: c => { const it = (n, t) => MZB.col([MZB.h(String(n), 2, {color: 'var(--mz-c-accent)'}), MZB.h(t, 3), MZB.tx('[Descreva o passo]', {color: 'var(--mz-c-muted)'})]); const s = MZB.sec([MZB.h('Como funciona', 2, {textAlign: 'center'}), MZB.grid(3, [it(1, 'Passo 1'), it(2, 'Passo 2'), it(3, 'Passo 3')], {marginTop: 40})]); s.name = 'Como funciona'; return s; }},
  {id: 'about', name: 'Sobre (imagem e texto)', icon: 'user', make: c => { const s = MZB.sec([MZB.row([MZB.im('', {flex: '1 1 40%', aspectRatio: '1/1'}, null, null, 'Foto'), MZB.col([MZB.h('Quem somos', 2), MZB.tx('[Conte a história de ' + c.name + ' em 3 ou 4 linhas, sem números inventados]'), MZB.btn('Fale com a gente', '#form', 'outline')], {flex: '1 1 55%'})], {gap: 56})]); s.name = 'Sobre'; return s; }},
  {id: 'offer', name: 'Oferta com lista', icon: 'gift', make: c => { const s = MZB.sec([MZB.card([MZB.badge('Oferta'), MZB.h(mzPh(c.product || c.offer, 'Nome da oferta'), 2), MZB.li(c.benefits.length ? c.benefits.slice(0, 5) : ['[O que está incluso 1]', '[O que está incluso 2]', '[O que está incluso 3]'], 'check-circle'), MZB.h('[Preço]', 3, {color: 'var(--mz-c-accent)'}), MZB.btn(c.cta, c.checkout || '#form')], {maxWidth: 680, margin: '0 auto', padding: 40})], {backgroundColor: 'rgba(0,0,0,.03)'}); s.name = 'Oferta'; return s; }},
  {id: 'pricing', name: 'Planos (3 colunas)', icon: 'dollar', make: c => { const it = (n, f) => MZB.card([MZB.h(n, 3), MZB.h('[Preço]', 2, {color: 'var(--mz-c-accent)'}), MZB.li(['[Item incluso]', '[Item incluso]', '[Item incluso]'], 'check'), MZB.btn('Escolher', '#form', f ? 'solid' : 'outline')], f ? {borderTop: '4px solid var(--mz-c-accent)'} : {}); const s = MZB.sec([MZB.h('Escolha o seu plano', 2, {textAlign: 'center'}), MZB.grid(3, [it('Básico', 0), it('Completo', 1), it('Premium', 0)], {marginTop: 40, alignItems: 'stretch'})]); s.name = 'Planos'; return s; }},
  {id: 'testimonials', name: 'Depoimentos (modelo)', icon: 'chat', make: c => { const it = () => MZB.card([MZB.tx('“[Depoimento real do cliente]”'), MZB.tx('[Nome do cliente] · [Cidade]', {color: '#5d6068'}, null, null, 'small')]); const s = MZB.sec([MZB.h('O que dizem nossos clientes', 2, {textAlign: 'center'}), MZB.grid(3, [it(), it(), it()], {marginTop: 40})]); s.name = 'Depoimentos'; return s; }},
  {id: 'faq', name: 'Perguntas frequentes', icon: 'search', make: c => { const q = (c.doubts.length ? c.doubts : ['[Pergunta 1]', '[Pergunta 2]', '[Pergunta 3]']).slice(0, 6).map(t => ({q: /[?]$/.test(t) ? t : t + '?', a: '[Resposta clara e honesta]'})); const s = MZB.sec([MZB.h('Perguntas frequentes', 2, {textAlign: 'center'}), MZB.N('accordion', {items: q}, MZB.st({maxWidth: 780, margin: '32px auto 0'}))]); s.name = 'Perguntas frequentes'; return s; }},
  {id: 'logos', name: 'Faixa de logos / selos', icon: 'award', make: c => { const s = MZB.sec([MZB.tx('Quem confia', {textAlign: 'center', color: 'var(--mz-c-muted)'}, null, null, 'small'), MZB.row([MZB.im('', {width: 120, aspectRatio: '3/1'}), MZB.im('', {width: 120, aspectRatio: '3/1'}), MZB.im('', {width: 120, aspectRatio: '3/1'}), MZB.im('', {width: 120, aspectRatio: '3/1'})], {justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginTop: 16}, {flexDirection: 'row'}, {flexDirection: 'row'})], {padding: '40px 24px'}, null, {padding: '28px 20px'}); s.name = 'Logos'; return s; }},
  {id: 'lead', name: 'Formulário de contato', icon: 'mail', make: c => { const f = MZB.N('form', {source: 'mesa'}, MZB.st({display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 520, margin: '24px auto 0', padding: 28, backgroundColor: '#ffffff', color: '#111111', borderRadius: 'var(--mz-r-md)', boxShadow: 'var(--mz-sh-md)'}), [MZB.inp('text', 'name', 'Seu nome', 'Nome completo', true), MZB.inp('tel', 'phone', 'WhatsApp', 'DDD + número', true), MZB.inp('email', 'email', 'E-mail', 'seu@email.com', false), MZB.chk('consent', 'Concordo em receber contato por WhatsApp, telefone ou e-mail.', true), MZB.btn('Enviar', '#', 'solid', {width: '100%'})]); const s = MZB.sec([MZB.h('Fale com a gente', 2, {textAlign: 'center'}), MZB.tx('Preencha e retornamos em breve. [CONFIRMAR o prazo de resposta]', {textAlign: 'center', color: 'var(--mz-c-muted)'}), f], {backgroundColor: 'rgba(0,0,0,.03)'}); s.name = 'Formulário'; s.htmlId = 'form'; return s; }},
  {id: 'cta', name: 'Chamada final (CTA)', icon: 'zap', make: c => { const s = MZB.sec([MZB.h('Pronto para começar?', 2, {textAlign: 'center', color: '#ffffff'}), MZB.tx(mzPh(c.goal, 'Frase final de convite'), {textAlign: 'center', color: 'rgba(255,255,255,.85)'}), MZB.btn(c.cta, '#form', 'solid', {backgroundColor: '#ffffff', color: '#111111', borderColor: '#ffffff', alignSelf: 'center'})], {backgroundColor: 'var(--mz-c-primary)', display: 'flex', flexDirection: 'column', gap: 16}); s.name = 'Chamada final'; return s; }},
  {id: 'footer', name: 'Rodapé', icon: 'home', make: c => { const s = MZB.sec([MZB.row([MZB.tx('© ' + new Date().getFullYear() + ' ' + c.name + '. Todos os direitos reservados.', {color: 'inherit'}, null, null, 'small'), MZB.N('menu', {items: [{label: 'Política de privacidade', href: '#'}, {label: 'Contato', href: '#form'}]}, MZB.st({}))], {justifyContent: 'space-between', gap: 16}, {flexDirection: 'row'}, {flexDirection: 'column', alignItems: 'flex-start'})], {padding: '32px 24px', backgroundColor: '#111111', color: '#ffffff'}, null, {padding: '28px 20px'}); s.name = 'Rodapé'; return s; }}
];
/* ---------- modelos de página (sequências de blocos) ---------- */
const MZ_TEMPLATES = [
  {id: 'lead', name: 'Captura de lead', desc: 'Hero, benefícios, formulário e rodapé.', blocks: ['header', 'hero', 'benefits', 'lead', 'footer']},
  {id: 'offer', name: 'Página de oferta', desc: 'Problema e solução, oferta, depoimentos, perguntas e chamada final.', blocks: ['header', 'hero', 'problem', 'benefits', 'offer', 'testimonials', 'faq', 'cta', 'footer']},
  {id: 'local', name: 'Serviço local', desc: 'Sobre, passos, perguntas e contato.', blocks: ['header', 'hero', 'about', 'steps', 'faq', 'lead', 'footer']},
  {id: 'event', name: 'Evento', desc: 'Contagem regressiva, benefícios e inscrição.', blocks: ['header', 'hero', 'benefits', 'steps', 'lead', 'footer']}
];
function mzBuildBlock(id, ctx) { const b = MZ_BLOCKS.find(x => x.id === id); return b ? b.make(ctx) : null; }
function mzBuildTemplate(id, ctx) { const t = MZ_TEMPLATES.find(x => x.id === id) || MZ_TEMPLATES[0], root = mzNode('page', {}, {display: 'flex', flexDirection: 'column'}); root.children = t.blocks.map(b => mzBuildBlock(b, ctx)).filter(Boolean); if (id === 'event') { const hero = root.children.find(c => c.htmlId === 'topo'); if (hero) hero.children[0].children[0].children.splice(3, 0, MZB.N('countdown', {date: '', done: 'O evento começou!'}, MZB.st({fontWeight: 800}))); } return root; }
/* ---------- catálogo de elementos ---------- */
const MZ_EL = [
  {id: 'section', cat: 'basic', name: 'Seção', icon: 'layers', make: () => MZB.sec([], {minHeight: 120, display: 'flex', flexDirection: 'column', gap: 16})},
  {id: 'container', cat: 'basic', name: 'Contêiner', icon: 'layers', make: () => MZB.box([], {display: 'flex', flexDirection: 'column', gap: 16, padding: 16, minHeight: 60})},
  {id: 'columns2', cat: 'basic', name: '2 colunas', icon: 'layers', make: () => MZB.row([MZB.col([], {flex: '1 1 50%'}), MZB.col([], {flex: '1 1 50%'})], {alignItems: 'stretch', gap: 24})},
  {id: 'columns3', cat: 'basic', name: '3 colunas', icon: 'layers', make: () => MZB.grid(3, [MZB.col([]), MZB.col([]), MZB.col([])])},
  {id: 'div', cat: 'basic', name: 'Bloco (div)', icon: 'layers', make: () => mzNode('div', {}, {padding: 16, minHeight: 40})},
  {id: 'heading', cat: 'basic', name: 'Título', icon: 'star', make: () => MZB.h('Escreva um título', 2)},
  {id: 'text', cat: 'basic', name: 'Texto', icon: 'file', make: () => MZB.tx('Escreva aqui o seu texto. Clique duas vezes para editar no lugar.')},
  {id: 'image', cat: 'basic', name: 'Imagem', icon: 'camera', make: () => MZB.im('', {aspectRatio: '4/3', objectFit: 'cover'})},
  {id: 'video', cat: 'basic', name: 'Vídeo', icon: 'play', make: () => mzNode('video', {url: '', ratio: '16/9'}, {borderRadius: 'var(--mz-r-md)', overflow: 'hidden', width: '100%'})},
  {id: 'button', cat: 'basic', name: 'Botão', icon: 'zap', make: () => MZB.btn('Clique aqui', '#form')},
  {id: 'icon', cat: 'basic', name: 'Ícone', icon: 'star', make: () => MZB.ic('star', 40)},
  {id: 'svg', cat: 'basic', name: 'SVG', icon: 'target', make: () => mzNode('svg', {svg: ''}, {width: 80})},
  {id: 'list', cat: 'basic', name: 'Lista', icon: 'check', make: () => MZB.li(['Primeiro item', 'Segundo item', 'Terceiro item'], 'check-circle')},
  {id: 'divider', cat: 'basic', name: 'Divisor', icon: 'menu', make: () => mzNode('divider', {}, {margin: '8px 0'})},
  {id: 'spacer', cat: 'basic', name: 'Espaço', icon: 'arrow-down', make: () => mzNode('spacer', {}, {height: 40})},
  {id: 'link', cat: 'basic', name: 'Link (área clicável)', icon: 'link', make: () => mzNode('link', {href: '#'}, {display: 'block', padding: 8}, [])},
  {id: 'badge', cat: 'basic', name: 'Selo', icon: 'award', make: () => MZB.badge('Novo')},
  {id: 'logo', cat: 'basic', name: 'Logo do projeto', icon: 'award', make: () => { const c = mzCtx(typeof curProject === 'function' ? curProject() : null); return mzNode('logo', {imgId: c.logo, alt: c.name}, {width: 140}); }},
  {id: 'form', cat: 'basic', name: 'Formulário', icon: 'mail', make: () => mzNode('form', {}, {display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 520}, [MZB.inp('text', 'name', 'Nome', '', true), MZB.inp('email', 'email', 'E-mail', '', true), MZB.btn('Enviar', '#', 'solid')])},
  {id: 'input', cat: 'basic', name: 'Campo', icon: 'file', make: () => MZB.inp('text', 'campo', 'Rótulo', 'Digite aqui', false)},
  {id: 'checkbox', cat: 'basic', name: 'Caixa de seleção', icon: 'check', make: () => MZB.chk('opcao', 'Aceito os termos', false)},
  {id: 'radio', cat: 'basic', name: 'Opção', icon: 'check', make: () => mzNode('radio', {name: 'grupo', label: 'Opção', value: 'a'})},
  {id: 'menu', cat: 'adv', name: 'Menu', icon: 'menu', make: () => mzNode('menu', {items: [{label: 'Início', href: '#'}, {label: 'Sobre', href: '#'}, {label: 'Contato', href: '#form'}]})},
  {id: 'accordion', cat: 'adv', name: 'Acordeão (FAQ)', icon: 'search', make: () => mzNode('accordion', {items: [{q: 'Primeira pergunta?', a: 'Resposta.'}, {q: 'Segunda pergunta?', a: 'Resposta.'}]}, {width: '100%'})},
  {id: 'tabs', cat: 'adv', name: 'Abas', icon: 'layers', make: () => mzNode('tabs', {items: [{t: 'Aba 1', c: 'Conteúdo da aba 1'}, {t: 'Aba 2', c: 'Conteúdo da aba 2'}]}, {width: '100%'})},
  {id: 'countdown', cat: 'adv', name: 'Contagem regressiva', icon: 'clock', make: () => mzNode('countdown', {date: '', done: 'Acabou!'}, {})},
  {id: 'table', cat: 'adv', name: 'Tabela', icon: 'layers', make: () => mzNode('table', {rows: [['Item', 'Descrição'], ['A', '[texto]'], ['B', '[texto]']]}, {width: '100%'})},
  {id: 'gallery', cat: 'adv', name: 'Galeria', icon: 'camera', make: () => mzNode('gallery', {imgs: [], cols: 3}, {width: '100%'})},
  {id: 'timeline', cat: 'adv', name: 'Linha do tempo', icon: 'calendar', make: () => mzNode('timeline', {items: [{w: '2024', t: 'Marco 1', d: '[descrição]'}, {w: '2025', t: 'Marco 2', d: '[descrição]'}]}, {})}
];
/* esquema de campos do painel Conteúdo, por tipo. t: text | area | num | url | img | sel | bool | items */
const MZ_FIELDS = {
  heading: [{k: 'text', t: 'area', l: 'Texto'}, {k: 'level', t: 'sel', l: 'Nível', o: [[1, 'H1'], [2, 'H2'], [3, 'H3'], [4, 'H4']]}],
  text: [{k: 'html', t: 'rich', l: 'Texto (duplo clique no canvas para formatar)'}],
  image: [{k: 'imgId', t: 'img', l: 'Imagem da biblioteca'}, {k: 'src', t: 'url', l: 'ou endereço da imagem'}, {k: 'alt', t: 'text', l: 'Texto alternativo'}, {k: 'href', t: 'url', l: 'Link ao clicar'}],
  logo: [{k: 'imgId', t: 'img', l: 'Logo'}, {k: 'alt', t: 'text', l: 'Texto alternativo'}, {k: 'href', t: 'url', l: 'Link'}],
  video: [{k: 'url', t: 'url', l: 'Endereço (YouTube, Vimeo ou arquivo)'}, {k: 'ratio', t: 'sel', l: 'Proporção', o: [['16/9', '16:9'], ['4/3', '4:3'], ['1/1', '1:1'], ['9/16', '9:16']]}],
  button: [{k: 'text', t: 'text', l: 'Texto'}, {k: 'href', t: 'url', l: 'Link'}, {k: 'variant', t: 'sel', l: 'Estilo', o: [['solid', 'Cheio'], ['outline', 'Contorno'], ['ghost', 'Sem fundo']]}, {k: 'newTab', t: 'bool', l: 'Abrir em nova aba'}],
  icon: [{k: 'name', t: 'icon', l: 'Ícone'}, {k: 'size', t: 'num', l: 'Tamanho (px)'}],
  svg: [{k: 'svg', t: 'area', l: 'Código SVG'}],
  list: [{k: 'items', t: 'lines', l: 'Itens (um por linha)'}, {k: 'icon', t: 'icon', l: 'Ícone dos itens (vazio = marcador)'}, {k: 'ordered', t: 'bool', l: 'Numerada'}],
  input: [{k: 'kind', t: 'sel', l: 'Tipo', o: [['text', 'Texto'], ['email', 'E-mail'], ['tel', 'Telefone'], ['number', 'Número'], ['textarea', 'Texto longo'], ['select', 'Lista']]}, {k: 'name', t: 'text', l: 'Nome do campo'}, {k: 'label', t: 'text', l: 'Rótulo'}, {k: 'placeholder', t: 'text', l: 'Dica'}, {k: 'required', t: 'bool', l: 'Obrigatório'}, {k: 'options', t: 'lines', l: 'Opções (tipo Lista)'}],
  checkbox: [{k: 'name', t: 'text', l: 'Nome'}, {k: 'label', t: 'area', l: 'Texto'}, {k: 'required', t: 'bool', l: 'Obrigatório'}],
  radio: [{k: 'name', t: 'text', l: 'Grupo'}, {k: 'label', t: 'text', l: 'Texto'}, {k: 'value', t: 'text', l: 'Valor'}],
  badge: [{k: 'text', t: 'text', l: 'Texto'}],
  menu: [{k: 'items', t: 'pairs', l: 'Itens (texto | link, um por linha)'}],
  accordion: [{k: 'items', t: 'qa', l: 'Perguntas (Pergunta :: Resposta, uma por linha)'}],
  tabs: [{k: 'items', t: 'tabs', l: 'Abas (Título :: Conteúdo, uma por linha)'}],
  countdown: [{k: 'date', t: 'datetime', l: 'Data e hora final'}, {k: 'done', t: 'text', l: 'Texto quando acabar'}],
  table: [{k: 'rows', t: 'table', l: 'Linhas (colunas separadas por | , primeira linha = cabeçalho)'}],
  gallery: [{k: 'imgs', t: 'imgs', l: 'Imagens'}, {k: 'cols', t: 'num', l: 'Colunas'}],
  timeline: [{k: 'items', t: 'tl', l: 'Marcos (Quando | Título | Descrição, uma por linha)'}],
  section: [{k: 'boxed', t: 'bool', l: 'Conteúdo em caixa (largura máxima)'}, {k: 'w', t: 'num', l: 'Largura máxima (px, 0 = padrão do site)'}, {k: 'tag', t: 'sel', l: 'Etiqueta HTML', o: [['section', 'section'], ['header', 'header'], ['footer', 'footer'], ['main', 'main'], ['div', 'div']]}],
  container: [{k: 'boxed', t: 'bool', l: 'Conteúdo em caixa'}, {k: 'w', t: 'num', l: 'Largura máxima (px)'}],
  link: [{k: 'href', t: 'url', l: 'Link'}, {k: 'newTab', t: 'bool', l: 'Abrir em nova aba'}],
  form: [{k: 'action', t: 'url', l: 'Endereço que recebe os contatos (leads)'}, {k: 'thanks', t: 'url', l: 'Página de obrigado'}, {k: 'source', t: 'text', l: 'Origem (rótulo)'}]
};
