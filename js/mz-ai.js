/* ===== Mesa de edição · IA =====
   Dois caminhos: comandos locais por regras (funcionam sem chave) e a IA do Studio (aiJSON), que só devolve uma lista de operações validadas.
   Regra herdada do Studio: a IA não inventa depoimentos, números nem preços; o que falta fica entre [colchetes]. */
const MZ_AI_EX = ['Criar uma seção de perguntas frequentes', 'Trocar o fundo para escuro', 'Colocar em duas colunas', 'Melhorar a hierarquia da página', 'Deixar a página com alta conversão', 'Centralizar o texto'];
function mzAiToggle() {
  const b = document.getElementById('mzAiBar'); if (!b) return; if (b.style.display !== 'none') { b.style.display = 'none'; return; } b.style.display = 'flex';
  b.innerHTML = `<div class="mz-ai"><div class="mz-ai-h"><b>✨ IA da mesa</b><span>trabalhando em: <b>${esc(mzPg().name)}</b>${MZ.sel ? ' · selecionado: ' + esc((mzSelNode() || {}).name || MZ_NAMES[(mzSelNode() || {}).type] || '') : ''}</span><button onclick="mzAiToggle()">×</button></div><div class="mz-ai-r"><input id="mzAiIn" placeholder="Ex.: criar uma seção de depoimentos, trocar o fundo para escuro…" onkeydown="if(event.key==='Enter')mzAiRun()"><button class="btn dark" onclick="mzAiRun()">↑</button></div><div class="mz-ai-ex">${MZ_AI_EX.map(t => `<button onclick="document.getElementById('mzAiIn').value='${t}';mzAiRun()">${t}</button>`).join('')}</div><div class="ai-pickbox" data-kind="text" data-compact="1" style="margin-top:6px"></div><div id="mzAiOut" class="mz-ai-o"></div></div>`; if (typeof aiPickersRefresh === 'function') aiPickersRefresh(); setTimeout(() => { const i = document.getElementById('mzAiIn'); if (i) i.focus(); }, 30);
}
const mzAiSay = t => { const o = document.getElementById('mzAiOut'); if (o) o.textContent = t; };
const MZ_BLK_KW = [[/faq|pergunta|d[uú]vida/, 'faq'], [/depoimento|prova social|avalia/, 'testimonials'], [/formul|contato|lead|captura/, 'lead'], [/passo|como funciona|etapa/, 'steps'], [/plano|pre[cç]o/, 'pricing'], [/oferta/, 'offer'], [/rodap/, 'footer'], [/cabe[cç]alho|menu|topo/, 'header'], [/sobre|quem somos/, 'about'], [/hero|principal|capa/, 'hero'], [/benef[ií]cio|vantagem|diferencia/, 'benefits'], [/problema|solu[cç][aã]o|dor/, 'problem'], [/logo|selo|parceiro/, 'logos'], [/chamada final|cta|convite/, 'cta']];
/* interpretador local: devolve lista de operações ou null */
function mzAiLocal(t) {
  const s = dnorm(t), ops = [], n = mzSelNode(), sel = n ? n.id : '';
  if (/^(criar|adicionar|inserir|colocar|incluir|nova|novo)/.test(s) && /(secao|bloco|bloc)/.test(s) || /^(criar|adicionar|inserir|incluir) (uma |um )?(secao|bloco)/.test(s) || /^(criar|adicionar|inserir|incluir)/.test(s)) { const kw = MZ_BLK_KW.find(k => k[0].test(s)); if (kw) { ops.push({op: 'insertBlock', id: kw[1]}); return ops; } }
  if (/fundo/.test(s) && /(escuro|preto)/.test(s)) { ops.push({op: 'setStyle', target: sel || 'page', styles: {backgroundColor: '#111111', color: '#ffffff'}}); return ops; }
  if (/fundo/.test(s) && /(claro|branco)/.test(s)) { ops.push({op: 'setStyle', target: sel || 'page', styles: {backgroundColor: '#ffffff', color: '#111111'}}); return ops; }
  if (/fundo/.test(s) && /(cor primaria|primaria|marca)/.test(s)) { ops.push({op: 'setStyle', target: sel || 'page', styles: {backgroundColor: 'var(--mz-c-primary)', color: '#ffffff'}}); return ops; }
  if (/fundo/.test(s) && /(destaque|accent|laranja)/.test(s)) { ops.push({op: 'setStyle', target: sel || 'page', styles: {backgroundColor: 'var(--mz-c-accent)', color: '#ffffff'}}); return ops; }
  const cols = /(duas|2) colunas/.test(s) ? 2 : /(tres|3) colunas/.test(s) ? 3 : /(quatro|4) colunas/.test(s) ? 4 : 0; if (cols && n) { ops.push({op: 'columns', target: sel, n: cols}); return ops; }
  if (/centraliz/.test(s) && n) { ops.push({op: 'setStyle', target: sel, styles: {textAlign: 'center', justifyContent: 'center', alignItems: 'center'}}); return ops; }
  if (/(aumentar|maior|crescer)/.test(s) && n) { const f = parseFloat(mzStyleAt(n, 'd').fontSize) || (mzTypoOf(n) && mzM().ds.type[mzTypoOf(n)] ? mzM().ds.type[mzTypoOf(n)].size : 18); ops.push({op: 'setStyle', target: sel, styles: {fontSize: Math.round(f * 1.25) + 'px'}}); return ops; }
  if (/(diminuir|menor|reduzir)/.test(s) && n) { const f = parseFloat(mzStyleAt(n, 'd').fontSize) || (mzTypoOf(n) && mzM().ds.type[mzTypoOf(n)] ? mzM().ds.type[mzTypoOf(n)].size : 18); ops.push({op: 'setStyle', target: sel, styles: {fontSize: Math.max(10, Math.round(f * 0.8)) + 'px'}}); return ops; }
  if (/espa[cç]amento|respiro/.test(s) && /(mais|maior|aumentar)/.test(s) && n) { ops.push({op: 'setStyle', target: sel, styles: {padding: '120px 24px'}}); return ops; }
  if (/espa[cç]amento|respiro/.test(s) && /(menos|menor|reduzir)/.test(s) && n) { ops.push({op: 'setStyle', target: sel, styles: {padding: '48px 24px'}}); return ops; }
  if (/(arredondar|cantos)/.test(s) && n) { ops.push({op: 'setStyle', target: sel, styles: {borderRadius: 'var(--mz-r-lg)'}}); return ops; }
  if (/sombra/.test(s) && n) { ops.push({op: 'setStyle', target: sel, styles: {boxShadow: 'var(--mz-sh-md)'}}); return ops; }
  if (/(remover|excluir|apagar|deletar)/.test(s) && n) { ops.push({op: 'delete', target: sel}); return ops; }
  if (/duplicar/.test(s) && n) { ops.push({op: 'duplicate', target: sel}); return ops; }
  if (/hierarquia/.test(s)) { ops.push({op: 'hierarchy'}); return ops; }
  if (/(alta conversao|converter mais|mais conversao|conversao)/.test(s)) { ops.push({op: 'conversion'}); return ops; }
  return null;
}
function mzAiFind(id) { if (id === 'page') return {node: mzRoot()}; return mzFind(mzRoot(), id === 'sel' ? MZ.sel : id); }
/* executa operações validadas; devolve texto do que foi feito */
function mzApplyOps(ops) {
  const done = []; const root = mzRoot();
  (Array.isArray(ops) ? ops : []).slice(0, 12).forEach(o => {
    if (!o || typeof o !== 'object') return;
    if (o.op === 'insertBlock' && MZ_BLOCKS.some(b => b.id === o.id)) { const nd = mzBuildBlock(o.id, mzCtx(MZ.p)); if (nd) { const drop = mzDefaultDrop('section'); drop.parent.children.splice(drop.index, 0, nd); MZ.sel = nd.id; done.push('Seção “' + (nd.name || o.id) + '” criada'); } }
    else if (o.op === 'insertEl' && MZ_EL.some(e => e.id === o.id)) { const nd = MZ_EL.find(e => e.id === o.id).make(); const drop = mzDefaultDrop(nd.type); let x = nd; if (drop.wrap && root.type === 'page' && nd.type !== 'section') x = MZB.sec([nd], {minHeight: 60}); drop.parent.children.splice(drop.index, 0, x); MZ.sel = nd.id; done.push(MZ_NAMES[nd.type] + ' adicionado'); }
    else if (o.op === 'setStyle') { const f = mzAiFind(String(o.target || 'sel')); if (!f || !f.node) return; const bp = ['d', 't', 'm'].includes(o.bp) ? o.bp : 'd', st = mzNormStyle(o.styles); Object.assign(mzStyleSet(f.node, bp), st); done.push('Estilo aplicado em ' + (f.node.name || MZ_NAMES[f.node.type])); }
    else if (o.op === 'setProp') { const f = mzAiFind(String(o.target || 'sel')); if (!f || !f.node || !o.props) return; const np = mzNormProps(f.node.type, Object.assign({}, f.node.props, o.props)); f.node.props = np; done.push('Conteúdo atualizado'); }
    else if (o.op === 'delete') { const f = mzAiFind(String(o.target || 'sel')); if (f && f.parent && !f.node.locked) { f.parent.children.splice(f.idx, 1); MZ.sel = ''; done.push('Elemento removido'); } }
    else if (o.op === 'duplicate') { const f = mzAiFind(String(o.target || 'sel')); if (f && f.parent) { const c = mzFresh(f.node); f.parent.children.splice(f.idx + 1, 0, c); MZ.sel = c.id; done.push('Elemento duplicado'); } }
    else if (o.op === 'columns') { const f = mzAiFind(String(o.target || 'sel')); if (!f || !f.node || !mzIsCont(f.node)) return; const k = Math.max(1, Math.min(6, +o.n || 2)), tgt = f.node.props.boxed ? f.node : f.node, S = mzStyleSet(tgt, 'd'); S.display = 'grid'; S.gridTemplateColumns = `repeat(${k},1fr)`; S.gap = S.gap || '24px'; mzStyleSet(tgt, 't').gridTemplateColumns = k > 2 ? 'repeat(2,1fr)' : '1fr'; mzStyleSet(tgt, 'm').gridTemplateColumns = '1fr'; done.push(k + ' colunas'); }
    else if (o.op === 'hierarchy') { let first = true; mzWalk(root, n => { if (n.type === 'heading') { n.props.level = first ? 1 : (n.props.level === 1 ? 2 : n.props.level); n.typo = first ? 'h1' : 'h2'; first = false; } if (n.type === 'section') { const p = mzStyleSet(n, 'd'); if (!p.padding) p.padding = '96px 24px'; } if (n.type === 'text') n.typo = ''; }); done.push('Hierarquia ajustada: um H1, títulos de seção em H2 e respiro entre seções'); }
    else if (o.op === 'conversion') { let hasForm = false, hasBtn = false, hasFaq = false, hasProof = false; mzWalk(root, n => { if (n.type === 'form') hasForm = true; if (n.type === 'button') hasBtn = true; if (n.type === 'accordion') hasFaq = true; if (n.name === 'Depoimentos') hasProof = true; }); const add = id => { const nd = mzBuildBlock(id, mzCtx(MZ.p)), foot = root.children.findIndex(c => c.name === 'Rodapé'); root.children.splice(foot < 0 ? root.children.length : foot, 0, nd); done.push('Seção “' + nd.name + '” adicionada'); }; if (!hasForm) add('lead'); if (!hasFaq) add('faq'); if (!hasProof) add('testimonials'); if (!root.children.some(c => c.name === 'Chamada final')) add('cta'); if (!hasBtn) done.push('Atenção: a página não tem botão de ação'); done.push('Depoimentos e preços ficam como [marcadores]: preencha com dados reais'); }
  });
  if (done.length) { mzCommit({panels: true}); mzScrollToSel(); } return done;
}
async function mzAiRun(text) {
  const inp = document.getElementById('mzAiIn'); text = text || (inp ? inp.value : ''); text = String(text).trim(); if (!text) return; mzAiSay('Pensando…');
  const local = mzAiLocal(text); if (local) { const d = mzApplyOps(local); mzAiSay(d.length ? '✓ ' + d.join('. ') + '.' : 'Nada mudou. Selecione um elemento para este comando.'); return; }
  if (typeof aiReady !== 'function' || !aiReady()) { mzAiSay('Não entendi esse comando sem a IA. Tente: “criar uma seção de perguntas frequentes”, “trocar o fundo para escuro”, “colocar em duas colunas”, “melhorar a hierarquia”, “alta conversão”. Para comandos livres, ligue a IA em Configurações → Integrações.'); return; }
  try {
    const outline = []; mzWalk(mzRoot(), (n, p, i) => { if (outline.length < 140) outline.push(`${n.id} ${n.type}${n.name ? ' "' + n.name + '"' : ''}${n.props.text ? ' · ' + String(n.props.text).slice(0, 50) : ''}`); });
    const sys = 'Você edita uma landing page por operações. Responda JSON {"ops":[...]} com no máximo 8 operações, escolhidas entre: {"op":"insertBlock","id":"hero|benefits|problem|steps|about|offer|pricing|testimonials|faq|logos|lead|cta|footer|header"}, {"op":"insertEl","id":"heading|text|image|button|list|divider|spacer|form|accordion|tabs|countdown|table|gallery|timeline|badge"}, {"op":"setStyle","target":"<id do nó>|sel|page","bp":"d|t|m","styles":{cssCamelCase:"valor"}}, {"op":"setProp","target":"<id>","props":{...}}, {"op":"columns","target":"<id>","n":2}, {"op":"delete","target":"<id>"}, {"op":"duplicate","target":"<id>"}, {"op":"hierarchy"}, {"op":"conversion"}. Cores do Design System: var(--mz-c-primary|secondary|accent|background|text|muted). Nunca invente depoimentos, números, preços ou resultados: use [marcadores].';
    const j = await aiJSON(sys, `${projectContext(MZ.p).slice(0, 2500)}\n\nÁrvore da página (id tipo nome):\n${outline.join('\n')}\n\nSelecionado: ${MZ.sel || 'nenhum'}\nPedido: ${text}`); const d = mzApplyOps(j && j.ops); mzAiSay(d.length ? '✓ ' + d.join('. ') + '.' : 'A IA não propôs nenhuma mudança possível.');
  } catch (e) { mzAiSay('Não consegui: ' + e.message); }
}
async function mzAiRewrite() {
  const n = mzSelNode(); if (!n) return; if (typeof aiReady !== 'function' || !aiReady()) { toast('Ligue a IA em Configurações → Integrações para reescrever textos.'); return; }
  const cur = n.type === 'text' ? n.props.html.replace(/<[^>]+>/g, ' ') : (n.props.text || (n.props.items || []).join('\n')); try { const t = await aiText('Você reescreve textos de landing page em português do Brasil: claro, direto, uma ideia só. Não invente números, depoimentos nem preços; use [marcadores] se faltar dado. Responda só com o texto novo.', `${projectContext(MZ.p).slice(0, 2000)}\n\nTexto atual:\n${cur}`, 400); if (!t) return; const v = t.trim(); if (n.type === 'heading') n.props.text = v.slice(0, 300); else if (n.type === 'text') n.props.html = mzRich(v); else if (n.type === 'list') n.props.items = v.split('\n').map(x => x.replace(/^[-•*\d.)\s]+/, '').trim()).filter(Boolean); else n.props.text = v.slice(0, 200); mzCommit({panels: true}); toast('Texto reescrito. Revise antes de publicar.'); } catch (e) { toast(e.message); }
}
