/* ===== Agente Editorial (Furacão Editorial Engine + BrandsDecoded Content Agent) =====
   insumo → extração → triagem → ângulos (curadoria) → escolha → briefing + headlines → formato → auditoria → entrega */
const edi = {tab: 'agente', busy: '', skillFile: 'skill.md', openDisc: false};
const ED_STAGES = [['insumo', '1 · Insumo'], ['triagem', '2 · Triagem'], ['angulos', '3 · Ângulos'], ['narrativa', '4 · Briefing e formato'], ['auditoria', '5 · Auditoria e entrega'], ['entregas', '6 · Entregas']];
const ED_FORMATS = [['carrossel', 'Carrossel (18 textos)'], ['post', 'Post'], ['video', 'Vídeo'], ['reel', 'Reel / Short'], ['thread', 'Thread'], ['newsletter', 'Newsletter'], ['artigo', 'Artigo'], ['campanha', 'Campanha']];
const ED_CATS = ['contraste', 'investigação', 'comportamento', 'geracional', 'crise', 'novidade', 'mudança cultural', 'disputa de status', 'identidade', 'referência pop', 'Brasil', 'nome próprio'];
const ED_LENSES = ['cultural', 'negócios', 'comportamental', 'estratégica', 'tecnológica', 'contradição', 'consequência', 'futuro'];
const ED_HL = ['Tensão cultural', 'Diagnóstico sistêmico', 'Contradição', 'Consequência', 'Comportamento', 'Mercado'];
const ED_SLOP = [['em um mundo cada vez mais', /em um mundo cada vez mais/i], ['“não é apenas / não é só… é”', /n[ãa]o (é|foi|são|era) (apenas|s[óo]|somente|simplesmente)\b/i], ['“é mais do que”', /\bé mais do que\b/i], ['“isso muda tudo”', /isso muda tudo/i], ['“a pergunta que fica”', /a pergunta que fica/i], ['“no fim das contas”', /no fim das contas/i], ['“uma nova era”', /uma nova era/i], ['“o impacto disso/da…”', /\bo impacto d(isso|a|o|e)\b/i], ['“o futuro chegou”', /o futuro chegou/i], ['“mergulhar / jornada / cenário”', /\b(mergulh\w+|jornada|cen[áa]rio atual)\b/i], ['corporativês (alavancar, sinergia, ecossistema, robusto, paradigma)', /\b(alavanc\w+|sinergia|ecossistema|robust[oa]s?|paradigma|disruptiv\w+)\b/i], ['“transformador/revolucionário”', /\b(transformador\w*|revolucion[áa]ri\w+)\b/i], ['simetria artificial “não X, mas Y”', /n[ãa]o (é|foi|são|se trata de) [^.,;!?]{2,40}[,;]? (mas|e sim|é) /i]];

const EDp = () => curProject();
const EDX = () => { const p = EDp(); if (!p) return null; if (!p.editorial || !p.editorial.session || !p.editorial.sizes) p.editorial = normalizeEditorial(p.editorial); return p.editorial; };
const EDS = () => EDX().session;
const eSave = () => { persist(); AUTO_AT = Date.now(); };
const eTok = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 3);
const eSim = (a, b) => { const A = new Set(eTok(a)), B = new Set(eTok(b)); if (!A.size || !B.size) return 0; let n = 0; A.forEach(w => { if (B.has(w)) n++; }); return n / (A.size + B.size - n); };

/* ---------- contexto enviado à IA ---------- */
function eBrandTxt() {
  const e = EDX(), p = EDp(), b = e.brand, L = [['Marca', p.name], ['Público', b.publico], ['Posicionamento', b.posicionamento], ['Tom', b.tom], ['Categorias', b.categorias], ['Produtos', b.produtos], ['Diferenciais', b.diferenciais], ['Temas prioritários', b.prioritarios], ['TEMAS PROIBIDOS', b.proibidos], ['Exemplos aprovados', b.aprovados], ['Exemplos rejeitados', b.rejeitados]].filter(x => x[1]).map(x => x.join(': '));
  const m = e.mem, M = [['Vocabulário', m.vocab], ['Referências', m.referencias], ['Marcas', m.marcas], ['Temas recorrentes', m.temas], ['Formatos preferidos', m.formatos], ['Padrões de headline', m.padroes], ['PALAVRAS PROIBIDAS', m.proibidas], ['Estruturas preferidas', m.estruturas]].filter(x => x[1]).map(x => x.join(': '));
  const R = [e.liked.length ? 'Teses que o usuário aprovou: ' + e.liked.slice(0, 8).join(' | ') : '', e.rejected.length ? 'Teses rejeitadas (não repetir nem parafrasear): ' + e.rejected.slice(0, 12).map(r => r.tese + (r.why ? ` [${r.why}]` : '')).join(' | ') : '', m.negatives.length ? 'Preferências negativas: ' + m.negatives.join(' | ') : '', 'Histórico de teses já usadas: ' + e.history.slice(0, 15).flatMap(h => (h.ideas || []).filter(i => i.status === 'chosen').map(i => i.tese)).join(' | ')].filter(x => x && !/: $/.test(x));
  return [L.length ? 'DNA DA MARCA\n' + L.join('\n') : '', M.length ? 'MEMÓRIA EDITORIAL\n' + M.join('\n') : '', R.join('\n')].filter(Boolean).join('\n\n');
}
const eProdTxt = () => { const p = EDX().prod; return ['plataforma', 'objetivo', 'funil', 'frequencia', 'campanha', 'cta'].filter(k => p[k]).map(k => k + ': ' + p[k]).join(' · '); };
const eSystem = () => (EDS_CORE.map(f => EDS_FILES[f]).join('\n\n') + '\n\n' + eBrandTxt()).slice(0, 23000);
const eInput = () => { const s = EDS(); return `INSUMO (${s.mode === 'B' ? 'hipótese/insight a investigar' : 'conteúdo existente'}):\n${s.input.slice(0, 22000)}${s.sources ? '\n\nFONTES E EVIDÊNCIAS FORNECIDAS PELO USUÁRIO:\n' + s.sources.slice(0, 12000) : ''}${eProdTxt() ? '\n\nCONTEXTO DE PRODUÇÃO: ' + eProdTxt() : ''}`; };
const eErr = e => e.status === 503 ? 'A IA não está configurada no servidor (ANTHROPIC_API_KEY em api/config.php).' : 'Falhou: ' + e.message;
const eStr = v => String(v == null ? '' : v).slice(0, 1500);
const eArr = v => (Array.isArray(v) ? v : []).slice(0, 12).map(eStr).filter(Boolean);

/* ---------- navegação do agente ---------- */
function renderEditorial() {
  const r = $('editorialRoot'), p = EDp(); if (!r) return; if (!p) { r.innerHTML = noProject('Agente Editorial'); return; }
  const s = EDS(), tabs = [['agente', 'Agente'], ['memoria', 'Memória e DNA'], ['metricas', 'Métricas'], ['skill', 'Skill editorial']];
  r.innerHTML = `<div class="page-head"><div><h1>Agente Editorial</h1><p>Uma IA que encontra o que vale a pena dizer antes de escrever. Do insumo bruto à ideia, à narrativa no formato certo e à auditoria contra conteúdo genérico de IA.</p></div><div class="actions">${projectSelect()}</div></div>
  <div class="edh-tabs">${tabs.map(([k, l]) => `<button class="edh-tab ${edi.tab === k ? 'on' : ''}" onclick="edi.tab='${k}';renderEditorial()">${l}</button>`).join('')}</div>
  <div id="ediBody">${({agente: eAgent, memoria: eMemory, metricas: eMetrics, skill: eSkillTab})[edi.tab](s)}</div>`;
}
function eAgent(s) {
  const idx = ED_STAGES.findIndex(x => x[0] === s.stage);
  return `<div class="mot-steps">${ED_STAGES.map(([k, l], i) => `<button class="tchip ${s.stage === k ? 'on' : ''}" ${i > idx && !eReady(k) ? 'disabled' : ''} onclick="eStage('${k}')">${l}</button>`).join('')}<span style="flex:1"></span><button class="btn sm" onclick="eReset()">Reiniciar</button></div>${({insumo: eInsumo, triagem: eTriagemUI, angulos: eAngulosUI, narrativa: eNarrativaUI, auditoria: eAuditoriaUI, entregas: eEntregasUI})[s.stage](s)}`;
}
function eReady(k) { const s = EDS(); return k === 'insumo' || (k === 'triagem' && s.analysis) || (k === 'angulos' && s.ideas && s.ideas.length) || (k === 'narrativa' && s.brief) || (k === 'auditoria' && s.content) || (k === 'entregas' && s.brief); }
function eStage(k) { if (!eReady(k)) return; EDS().stage = k; eSave(); renderEditorial(); }
function eReset() { if (!confirm('Reiniciar a sessão? O histórico e a memória são mantidos.')) return; EDX().session = normalizeEditorial({}).session; eSave(); renderEditorial(); }
const eIn = (id, lab, val, ph, rows, path) => `<div class="field"><label>${lab}</label>${rows ? `<textarea rows="${rows}" placeholder="${esc(ph || '')}" oninput="${path}">${esc(val)}</textarea>` : `<input value="${esc(val)}" placeholder="${esc(ph || '')}" oninput="${path}">`}</div>`;

/* ---------- 1 · insumo ---------- */
function eInsumo(s) {
  const e = EDX(), pr = e.prod;
  return `<div class="mot-wrap"><div>
  <div class="tchips" style="margin-bottom:8px"><button class="tchip ${s.mode === 'A' ? 'on' : ''}" onclick="EDS().mode='A';eSave();renderEditorial()">A · Transformação (tenho um conteúdo)</button><button class="tchip ${s.mode === 'B' ? 'on' : ''}" onclick="EDS().mode='B';eSave();renderEditorial()">B · Investigação (tenho uma hipótese)</button></div>
  ${eIn('in', s.mode === 'B' ? 'Hipótese, insight ou observação' : 'Texto, notícia, transcrição, briefing, ideia ou tema', s.input, s.mode === 'B' ? 'Ex.: acho que as pessoas estão trocando o café por ritual…' : 'Cole aqui o material. Links: cole o texto da página (a plataforma não abre links sozinha).', 12, "EDS().input=this.value;eSave()")}
  <div class="row-gap" style="margin-bottom:8px"><input type="file" accept=".txt,.md,text/plain" onchange="eFile(this)"><small class="muted">${EDS().input.length.toLocaleString('pt-BR')} caracteres</small></div>
  ${typeof eInsumoSources === 'function' ? eInsumoSources(s) : ''}
  ${accSec('edi', 'src', 'Fontes e evidências que você tem', 'dados, links, trechos de estudos', eIn('src', 'Cole fontes, dados e trechos (com a origem de cada um)', s.sources, 'Ex.: IBGE 2024: …; reportagem X (data): …', 6, "EDS().sources=this.value;eSave()") + '<small class="muted">O agente só trata como dado o que estiver aqui ou no insumo. O resto vira “a confirmar”.</small>', false)}
  <div class="row-gap" style="margin-top:10px;flex-wrap:wrap"><button class="btn dark" onclick="eTriage()" ${edi.busy ? 'disabled' : ''}>${edi.busy === 'tri' ? 'Lendo…' : '✦ Ler e fazer a triagem'}</button><small class="muted">Não exige briefing completo: o agente infere o contexto e pergunta só o que falta.</small></div></div>
  <div><div class="okr-label">CONTEXTO DE PRODUÇÃO</div>${[['plataforma', 'Plataforma'], ['objetivo', 'Objetivo'], ['funil', 'Funil'], ['frequencia', 'Frequência'], ['campanha', 'Campanha'], ['cta', 'CTA']].map(([k, l]) => eIn('p' + k, l, pr[k], '', 0, `EDX().prod.${k}=this.value;eSave()`)).join('')}<small class="muted block">O DNA da marca e a memória ficam na aba <b>Memória e DNA</b> e entram em todas as etapas.</small></div></div>`;
}
async function eFile(inp) { const f = inp.files[0]; if (!f) return; EDS().input = (EDS().input ? EDS().input + '\n\n' : '') + (await f.text()).slice(0, 60000); eSave(); renderEditorial(); }

/* ---------- 2 · triagem (extração + diagnóstico + pesquisa) ---------- */
async function eTriage() {
  const s = EDS(); if (s.input.trim().length < 3) { toast('Cole o insumo primeiro.'); return; }
  edi.busy = 'tri'; renderEditorial();
  try {
    const j = await motJSON(eSystem(), `${eInput()}\n\nFaça a leitura e a triagem editorial. ${s.mode === 'B' ? 'MODO B: a hipótese NÃO é fato. Teste-a contra o que está no material e nas fontes fornecidas, aponte contrapontos e o que falta verificar; se a sustentação for fraca, reformule a tese para o tamanho das evidências.' : 'MODO A: transforme o conteúdo existente numa leitura editorial, sem repetir o material.'}\nNunca invente números, estudos, datas, citações ou fontes. O que não estiver no material vai em "verificar".\nJSON: {"extracao":{"atores":[],"fatos":[],"contexto":"","causa":"","consequencia":"","conflito":"","mudanca":"","reacao":"","comportamento":"","timing":"","sinais":[]},"diagnostico":{"fato":"","fenomeno":"","interpretacao":""},"triagem":{"transformacao":"o que mudou ou está mudando","friccao":"o conflito real (não é o tema)","angulo":"leitura editorial mais forte","evidencias":[{"texto":"","tipo":"fato|dado|exemplo|interpretacao|hipotese","fonte":"onde está no material ou (a confirmar)"}]},"pesquisa":{"verificar":[],"contrapontos":[],"forca":"forte|media|fraca","recomendacao":""},"faltando":"pergunta única se faltar algo crítico, senão vazio"}`, 4500);
    const T = j.triagem || {}, X = j.extracao || {}, P = j.pesquisa || {};
    s.analysis = {extracao: {atores: eArr(X.atores), fatos: eArr(X.fatos), contexto: eStr(X.contexto), causa: eStr(X.causa), consequencia: eStr(X.consequencia), conflito: eStr(X.conflito), mudanca: eStr(X.mudanca), reacao: eStr(X.reacao), comportamento: eStr(X.comportamento), timing: eStr(X.timing), sinais: eArr(X.sinais)}, diagnostico: {fato: eStr(j.diagnostico && j.diagnostico.fato), fenomeno: eStr(j.diagnostico && j.diagnostico.fenomeno), interpretacao: eStr(j.diagnostico && j.diagnostico.interpretacao)}, triagem: {transformacao: eStr(T.transformacao), friccao: eStr(T.friccao), angulo: eStr(T.angulo), evidencias: (Array.isArray(T.evidencias) ? T.evidencias : []).slice(0, 14).map(v => ({texto: eStr(v.texto), tipo: ['fato', 'dado', 'exemplo', 'interpretacao', 'hipotese'].includes(v.tipo) ? v.tipo : 'hipotese', fonte: eStr(v.fonte) || '(a confirmar)'}))}, pesquisa: {verificar: eArr(P.verificar), contrapontos: eArr(P.contrapontos), forca: ['forte', 'media', 'fraca'].includes(P.forca) ? P.forca : 'media', recomendacao: eStr(P.recomendacao)}, faltando: eStr(j.faltando)};
    s.ideas = []; s.chosen = -1; s.brief = null; s.headlines = []; s.content = null; s.audit = null; s.stage = 'triagem';
  } catch (e) { toast(eErr(e)); }
  edi.busy = ''; eSave(); renderEditorial();
}
const ED_TIPO = {fato: ['Fato', '#15803d'], dado: ['Dado', '#1d4ed8'], exemplo: ['Exemplo', '#7c3aed'], interpretacao: ['Interpretação', '#b45309'], hipotese: ['Hipótese', '#dc2626']};
function eTriagemUI(s) {
  const a = s.analysis; if (!a) return '<p class="muted">Faça a leitura primeiro.</p>'; const x = a.extracao, d = a.diagnostico, t = a.triagem, p = a.pesquisa;
  const li = arr => arr.length ? `<ul style="margin:2px 0 6px 16px;padding:0;font-size:12.5px">${arr.map(v => `<li>${esc(v)}</li>`).join('')}</ul>` : '<small class="muted">—</small>';
  return `${a.faltando ? `<div class="dtp-warn"><b>O agente precisa de uma informação:</b> ${esc(a.faltando)}</div>` : ''}
  <div class="mot-wrap"><div>
  <div class="okr-label">TRIAGEM EDITORIAL (edite se discordar)</div>
  ${[['transformacao', 'Transformação · o que mudou'], ['friccao', 'Fricção central · o conflito real'], ['angulo', 'Ângulo narrativo dominante']].map(([k, l]) => `<div class="field"><label>${l}</label><textarea rows="2" oninput="EDS().analysis.triagem.${k}=this.value;eSave()">${esc(t[k])}</textarea></div>`).join('')}
  <div class="okr-label">EVIDÊNCIAS</div>${t.evidencias.map(v => `<div class="ed-ev"><span class="ed-badge" style="background:${ED_TIPO[v.tipo][1]}">${ED_TIPO[v.tipo][0]}</span> ${esc(v.texto)}<small class="muted block">${esc(v.fonte)}</small></div>`).join('') || '<small class="muted">Nenhuma evidência extraída.</small>'}
  <div class="row-gap" style="margin-top:12px;flex-wrap:wrap"><button class="btn dark" onclick="eAngles()" ${edi.busy ? 'disabled' : ''}>${edi.busy === 'ang' ? 'Gerando e curando…' : '✦ Gerar ângulos e ideias'}</button><button class="btn" onclick="eStage('insumo')">Alterar insumo / pesquisar novamente</button></div></div>
  <div>${accSec('edi', 'diag', 'Diagnóstico', 'fato · fenômeno · interpretação', `<b>Fato</b><p style="font-size:12.5px;margin:2px 0 6px">${esc(d.fato)}</p><b>Fenômeno</b><p style="font-size:12.5px;margin:2px 0 6px">${esc(d.fenomeno)}</p><b>Interpretação</b><p style="font-size:12.5px;margin:2px 0">${esc(d.interpretacao)}</p>`, true)}
  ${accSec('edi', 'pesq', 'Pesquisa e sustentação', 'força: ' + p.forca, `<p style="font-size:12.5px;margin:2px 0"><b>Força das evidências:</b> ${esc(p.forca)}</p><b>A verificar</b>${li(p.verificar)}<b>Contrapontos</b>${li(p.contrapontos)}<p style="font-size:12.5px"><b>Recomendação:</b> ${esc(p.recomendacao)}</p><small class="muted">A plataforma não pesquisa na web sozinha: confirme os itens acima em fontes primárias e cole o resultado em “Fontes e evidências”.</small>`, s.mode === 'B')}
  ${accSec('edi', 'lei', 'Leitura do insumo', 'atores, causa, conflito, timing…', `<b>Atores</b>${li(x.atores)}<b>Fatos</b>${li(x.fatos)}${[['contexto', 'Contexto'], ['causa', 'Causa'], ['consequencia', 'Consequência'], ['conflito', 'Conflito'], ['mudanca', 'Mudança'], ['reacao', 'Reação'], ['comportamento', 'Comportamento'], ['timing', 'Timing']].map(([k, l]) => x[k] ? `<p style="font-size:12.5px;margin:2px 0"><b>${l}:</b> ${esc(x[k])}</p>` : '').join('')}<b>Sinais culturais</b>${li(x.sinais)}`, false)}</div></div>`;
}

/* ---------- 3 · ângulos + curadoria ---------- */
async function eAngles() {
  const s = EDS(), e = EDX(); edi.busy = 'ang'; renderEditorial();
  try {
    const t = s.analysis.triagem, ctx = `${eInput()}\n\nTRIAGEM: transformação: ${t.transformacao} | fricção: ${t.friccao} | ângulo: ${t.angulo}\nEVIDÊNCIAS: ${t.evidencias.map(v => `[${v.tipo}] ${v.texto}`).join(' ; ')}`;
    const j = await motJSON(eSystem(), `${ctx}\n\nGere 8 teses editoriais candidatas, cada uma uma NARRATIVA diferente (não variações da mesma headline; assunto ≠ tese). Cada uma usa uma categoria (${ED_CATS.join(', ')}) e uma lente (${ED_LENSES.join(', ')}). Ancore no caso do material.\nJSON: {"ideias":[{"tese":"afirmação concreta e comunicável","categoria":"","lente":"","funil":"Descoberta|Consideração|Autoridade|Conversão","captura":"o gancho","reenquadramento":"a nova leitura","stake":"o que está em jogo","mecanismo":"por que acontece","ancora":"caso, nome ou dado concreto do material","porque":"por que a ideia é boa","quando":"quando escolher"}]}`, 5000);
    let cand = (Array.isArray(j.ideias) ? j.ideias : []).slice(0, 10).map(i => ({tese: eStr(i.tese), categoria: eStr(i.categoria), lente: eStr(i.lente), funil: eStr(i.funil) || 'Descoberta', captura: eStr(i.captura), reenquadramento: eStr(i.reenquadramento), stake: eStr(i.stake), mecanismo: eStr(i.mecanismo), ancora: eStr(i.ancora), porque: eStr(i.porque), quando: eStr(i.quando)})).filter(i => i.tese);
    const dropped = [];
    cand = cand.filter(i => { const past = e.history.flatMap(h => (h.ideas || []).filter(q => q.status === 'chosen' || q.status === 'rejected' || q.status === 'generic').map(q => q.tese)).concat(e.rejected.map(r => r.tese)); const hit = past.find(q => eSim(q, i.tese) >= 0.55); if (hit) { dropped.push({tese: i.tese, motivo: 'parecida com uma tese já usada ou rejeitada: “' + hit.slice(0, 90) + '”'}); return false; } return true; });
    cand = cand.filter((i, k) => { const dup = cand.slice(0, k).find(q => eSim(q.tese, i.tese) >= 0.6); if (dup) { dropped.push({tese: i.tese, motivo: 'variação de outra ideia da lista'}); return false; } return true; });
    if (!cand.length) throw new Error('todas as ideias repetiam teses já usadas; refaça com outro insumo ou ajuste a memória.');
    let cur = null; try { cur = await motJSON('Você é o curador editorial. Seja rigoroso: nota 0 a 5 em cada critério.', `Teses:\n${cand.map((i, k) => `${k}. ${i.tese} (ancora: ${i.ancora})`).join('\n')}\n\nCritérios: especificidade, tensão, originalidade, desenvolvimento (há material no insumo?), relevância (para o público/marca), clareza, ancoragem (no caso original), diferenciação (entre si). Temas proibidos da marca: ${e.brand.proibidos || 'nenhum'}. Preferências negativas: ${e.mem.negatives.join('; ') || 'nenhuma'}.\nJSON: {"notas":[{"i":0,"especificidade":0,"tensao":0,"originalidade":0,"desenvolvimento":0,"relevancia":0,"clareza":0,"ancoragem":0,"diferenciacao":0,"manter":true,"motivo":"se descartar"}]}`, 3000); } catch (er) { cur = null; }
    const keys = ['especificidade', 'tensao', 'originalidade', 'desenvolvimento', 'relevancia', 'clareza', 'ancoragem', 'diferenciacao'];
    cand.forEach((i, k) => { const n = cur && (cur.notas || []).find(q => +q.i === k) || {}; i.scores = Object.fromEntries(keys.map(c => [c, Math.max(0, Math.min(5, +n[c] || 0))])); i.avg = cur ? +(keys.reduce((a, c) => a + i.scores[c], 0) / keys.length).toFixed(2) : 3.5; i.manter = n.manter !== false; i.motivo = eStr(n.motivo); i.status = ''; });
    let keep = cand.filter(i => i.manter && i.avg >= 3.2).sort((a, b) => b.avg - a.avg); cand.filter(i => !keep.includes(i)).forEach(i => dropped.push({tese: i.tese, motivo: i.motivo || 'nota média ' + i.avg + ' (abaixo de 3,2)'})); if (keep.length < 3) keep = cand.slice().sort((a, b) => b.avg - a.avg).slice(0, 3);
    s.ideas = keep.slice(0, 5); s.dropped = dropped.slice(0, 12); s.chosen = -1;
    const hid = uid('eh'); s.histId = hid; e.history.unshift({id: hid, t: new Date().toISOString(), input: s.input.slice(0, 160), ideas: s.ideas.map((i, k) => ({tese: i.tese, lente: i.lente, categoria: i.categoria, funil: i.funil, idx: k, status: 'shown'})), chosen: -1, brief: false, formats: [], headlines: []}); e.history = e.history.slice(0, 150);
    s.stage = 'angulos';
  } catch (er) { toast(eErr(er)); }
  edi.busy = ''; eSave(); renderEditorial();
}
const eHist = () => EDX().history.find(h => h.id === EDS().histId);
function eMark(i, st, why) {
  const s = EDS(), e = EDX(), it = s.ideas[i], h = eHist(); if (!it) return; it.status = st; if (h && h.ideas[i]) h.ideas[i].status = st;
  if (st === 'liked' && !e.liked.includes(it.tese)) e.liked.unshift(it.tese); if (st === 'generic' || st === 'rejected') e.rejected.unshift({tese: it.tese, why: st === 'generic' ? 'muito genérico' : (why || 'rejeitada')}); e.liked = e.liked.slice(0, 60); e.rejected = e.rejected.slice(0, 80);
  eSave(); renderEditorial(); toast(st === 'liked' ? 'Registrado: você gostou dessa tese.' : st === 'generic' ? 'Registrado: tese genérica. O agente evita esse tipo.' : 'Registrado.');
}
function eNeg() { const v = prompt('O que o agente deve evitar daqui para frente? (ex.: tom alarmista, comparação com concorrente, ironia)'); if (!v) return; EDX().mem.negatives.unshift(v.slice(0, 240)); EDX().mem.negatives = EDX().mem.negatives.slice(0, 40); eSave(); toast('Preferência negativa registrada.'); }
function eAngulosUI(s) {
  const L = s.ideas || [];
  return `<p class="muted" style="font-size:13px;margin-top:0">Escolha a ideia que conversa melhor com o que você quer construir. Depois de escolher, o agente para de gerar teses e aprofunda a escolhida.</p>
  <div style="overflow:auto"><table class="ed-tbl"><thead><tr><th>#</th><th>Ideia central</th><th>Etapa do funil</th><th>Por que essa ideia é boa</th><th>Quando escolher</th><th></th></tr></thead><tbody>${L.map((i, k) => `<tr class="${s.chosen === k ? 'on' : ''}"><td>${k + 1}</td><td><b>${esc(i.tese)}</b><small class="muted block">${esc(i.categoria)}${i.lente ? ' · lente ' + esc(i.lente) : ''} · nota ${i.avg}</small><details><summary class="muted" style="font-size:11.5px;cursor:pointer">captura, reenquadramento, stake, mecanismo, âncora</summary><div style="font-size:12px;line-height:1.5"><b>Captura:</b> ${esc(i.captura)}<br><b>Reenquadramento:</b> ${esc(i.reenquadramento)}<br><b>Stake:</b> ${esc(i.stake)}<br><b>Mecanismo:</b> ${esc(i.mecanismo)}<br><b>Âncora:</b> ${esc(i.ancora)}<br><small class="muted">${Object.entries(i.scores || {}).map(([a, b]) => a + ' ' + b).join(' · ')}</small></div></details></td><td>${esc(i.funil)}</td><td>${esc(i.porque)}</td><td>${esc(i.quando)}</td><td class="ed-act"><button class="btn sm dark" onclick="eChoose(${k})" ${edi.busy ? 'disabled' : ''}>Escolher</button><button class="btn sm" onclick="eMark(${k},'liked')" title="Gostei">👍</button><button class="btn sm" onclick="eMark(${k},'generic')" title="Muito genérico">genérica</button><button class="btn sm" onclick="eMark(${k},'rejected')" title="Rejeitar">✕</button></td></tr>`).join('')}</tbody></table></div>
  <div class="row-gap" style="margin-top:10px;flex-wrap:wrap"><button class="btn" onclick="eAngles()" ${edi.busy ? 'disabled' : ''}>${edi.busy === 'ang' ? 'Gerando…' : '↻ Refazer ângulos'}</button><button class="btn" onclick="eNeg()">Não quero esse tom…</button><button class="btn" onclick="eStage('triagem')">Voltar à triagem</button>${(s.dropped || []).length ? `<button class="btn sm" onclick="edi.openDisc=!edi.openDisc;renderEditorial()">${s.dropped.length} ideia(s) descartada(s) pela curadoria</button>` : ''}</div>
  ${edi.openDisc ? `<div class="mot-ch" style="margin-top:8px">${s.dropped.map(d => `<p style="font-size:12.5px;margin:3px 0"><b>${esc(d.tese)}</b><br><span class="muted">${esc(d.motivo)}</span></p>`).join('')}</div>` : ''}`;
}

/* ---------- 4 · briefing, headlines e formato ---------- */
async function eChoose(i) {
  const s = EDS(), it = s.ideas[i], h = eHist(), t = s.analysis.triagem; if (!it) return; s.chosen = i; it.status = 'chosen'; if (h) { h.chosen = i; if (h.ideas[i]) h.ideas[i].status = 'chosen'; }
  edi.busy = 'brief'; renderEditorial();
  try {
    const j = await motJSON(eSystem(), `${eInput()}\n\nTRIAGEM: ${t.transformacao} | fricção: ${t.friccao}\nEVIDÊNCIAS: ${t.evidencias.map(v => `[${v.tipo}] ${v.texto}`).join(' ; ')}\n\nIDEIA ESCOLHIDA: ${it.tese}\nâncora: ${it.ancora}; captura: ${it.captura}; reenquadramento: ${it.reenquadramento}; stake: ${it.stake}; mecanismo: ${it.mecanismo}\n\nAprofunde SÓ essa ideia. Gere o briefing editorial e o Headline Engine (escolha 4 dos 6 estilos conforme a ideia: ${ED_HL.join(', ')}; 2 headlines por estilo; headline não é resumo da tese). Não invente fatos.\nJSON: {"ideia":{"central":"","funil":"","objetivo":"","resultado":""},"transformacao":{"mudou":"","logica":"","importa":""},"tensao":{"conflito":"","contradicao":"","pergunta":""},"direcao":{"explorar":"","implicito":"","evitar":"","generica":"onde a ideia pode ficar genérica"},"estrutura":{"hook":"","mecanismo":"","prova":"","aplicacao":""},"headlines":[{"estilo":"","headline":"","porque":""}]}`, 4500);
    s.brief = {ideia: ediPick(j.ideia, ['central', 'funil', 'objetivo', 'resultado']), transformacao: ediPick(j.transformacao, ['mudou', 'logica', 'importa']), tensao: ediPick(j.tensao, ['conflito', 'contradicao', 'pergunta']), direcao: ediPick(j.direcao, ['explorar', 'implicito', 'evitar', 'generica']), estrutura: ediPick(j.estrutura, ['hook', 'mecanismo', 'prova', 'aplicacao'])};
    s.headlines = (Array.isArray(j.headlines) ? j.headlines : []).slice(0, 12).map(x => ({estilo: eStr(x.estilo), headline: eStr(x.headline), porque: eStr(x.porque), pick: false})).filter(x => x.headline); s.content = null; s.audit = null; if (h) { h.brief = true; h.headlines = s.headlines.map(x => x.headline).slice(0, 24); } s.stage = 'narrativa';
  } catch (er) { toast(eErr(er)); }
  edi.busy = ''; eSave(); renderEditorial();
}
const ediPick = (o, ks) => Object.fromEntries(ks.map(k => [k, eStr(o && o[k])]));
async function eHeadlines() {
  const s = EDS(); edi.busy = 'hl'; renderEditorial();
  try { const it = s.ideas[s.chosen], j = await motJSON(eSystem(), `Ideia: ${it.tese}\nBriefing: tensão: ${s.brief.tensao.conflito} | contradição: ${s.brief.tensao.contradicao}\nHeadlines já geradas (NÃO repetir): ${s.headlines.map(h => h.headline).join(' | ')}\nGere 8 headlines novas em estilos diferentes (${ED_HL.join(', ')}). Headline é artefato editorial, não resumo. Sem clichês.\nJSON: {"headlines":[{"estilo":"","headline":"","porque":""}]}`, 2500); s.headlines = (Array.isArray(j.headlines) ? j.headlines : []).slice(0, 10).map(x => ({estilo: eStr(x.estilo), headline: eStr(x.headline), porque: eStr(x.porque), pick: false})).filter(x => x.headline); const h = eHist(); if (h) h.headlines = h.headlines.concat(s.headlines.map(x => x.headline)).slice(-24); } catch (er) { toast(eErr(er)); }
  edi.busy = ''; eSave(); renderEditorial();
}
function eNarrativaUI(s) {
  const b = s.brief, it = s.ideas[s.chosen]; if (!b || !it) return '<p class="muted">Escolha uma ideia primeiro.</p>';
  const row = (l, v) => v ? `<p style="font-size:12.5px;margin:3px 0"><b>${l}:</b> ${esc(v)}</p>` : '';
  return `<div class="mot-wrap"><div>
  <div class="mot-ch"><b>Ideia escolhida</b><p style="margin:4px 0"><b>${esc(it.tese)}</b></p></div>
  ${accSec('edi', 'b1', 'Ideia e objetivo', esc(b.ideia.funil), row('Ideia central', b.ideia.central) + row('Etapa do funil', b.ideia.funil) + row('Objetivo', b.ideia.objetivo) + row('Resultado esperado', b.ideia.resultado), true)}
  ${accSec('edi', 'b2', 'Transformação', '', row('O que mudou', b.transformacao.mudou) + row('Nova lógica', b.transformacao.logica) + row('Por que importa', b.transformacao.importa), false)}
  ${accSec('edi', 'b3', 'Tensão', '', row('Conflito central', b.tensao.conflito) + row('Contradição', b.tensao.contradicao) + row('Pergunta editorial implícita', b.tensao.pergunta), false)}
  ${accSec('edi', 'b4', 'Direção criativa', '', row('Explorar', b.direcao.explorar) + row('Deixar implícito', b.direcao.implicito) + row('Evitar', b.direcao.evitar) + row('Onde pode ficar genérica', b.direcao.generica), false)}
  ${accSec('edi', 'b5', 'Estrutura narrativa', 'Hook → Mecanismo → Prova → Aplicação', row('Hook', b.estrutura.hook) + row('Mecanismo', b.estrutura.mecanismo) + row('Prova', b.estrutura.prova) + row('Aplicação', b.estrutura.aplicacao), false)}</div>
  <div><div class="okr-label">HEADLINES (clique para fixar como hook)</div>${s.headlines.map((h, k) => `<button class="ed-hl ${h.pick ? 'on' : ''}" onclick="eHlPick(${k})"><small>${esc(h.estilo)}</small><b>${esc(h.headline)}</b><em>${esc(h.porque)}</em></button>`).join('')}
  <div class="row-gap" style="margin:6px 0"><button class="btn sm" onclick="eHeadlines()" ${edi.busy ? 'disabled' : ''}>${edi.busy === 'hl' ? 'Gerando…' : '↻ Refazer headlines'}</button></div>
  <div class="okr-label" style="margin-top:12px">FORMATO</div><div class="tchips">${ED_FORMATS.map(([k, l]) => `<button class="tchip ${s.format === k ? 'on' : ''}" onclick="EDS().format='${k}';eSave();renderEditorial()">${l}</button>`).join('')}</div>
  <div class="row-gap" style="margin-top:10px"><button class="btn dark" onclick="eProduce()" ${!s.format || edi.busy ? 'disabled' : ''}>${edi.busy === 'prod' ? 'Escrevendo…' : '✦ Produzir no formato'}</button></div><small class="muted block" style="margin-top:6px">A ideia só é adaptada ao formato agora, depois da escolha.</small><div class="row-gap" style="margin-top:10px"><button class="btn" onclick="eStage('entregas')">Ver todas as entregas (anúncios, landing, roteiros, posts, stories) →</button></div></div></div>`;
}
function eHlPick(k) { const s = EDS(); s.headlines.forEach((h, i) => { h.pick = i === k ? !h.pick : false; }); eSave(); renderEditorial(); }

/* ---------- produção por formato ---------- */
const ED_CAR = (n, SZ) => n === 1 ? ['Capa · título', SZ.capa1] : n === 2 ? ['Capa · subtítulo', SZ.capa2] : [3, 7, 11, 14].includes(n) ? ['Título', SZ.titulo] : [6, 10].includes(n) ? ['Parágrafo curto', SZ.curto] : n === 17 ? ['Fechamento', SZ.fechamento] : n === 18 ? ['Assinatura', SZ.assinatura] : ['Parágrafo', SZ.par];
const ED_SPEC = {
  carrossel: () => `CARROSSEL de EXATAMENTE 18 textos, nesta ordem: 1-2 capa (1 título, 2 subtítulo); 3, 7, 11 e 14 títulos; 4, 5, 8, 9, 12, 13, 15 e 16 parágrafos; 6 e 10 parágrafos curtos; 17 fechamento real (decorre da narrativa, não é slogan); 18 assinatura. Faixas de tamanho em caracteres: capa título ${EDX().sizes.capa1.join('-')}, capa subtítulo ${EDX().sizes.capa2.join('-')}, títulos ${EDX().sizes.titulo.join('-')}, parágrafos ${EDX().sizes.par.join('-')}, curtos ${EDX().sizes.curto.join('-')}, fechamento ${EDX().sizes.fechamento.join('-')}, assinatura ${EDX().sizes.assinatura.join('-')}. JSON: {"textos":["..." x18]}`,
  post: () => 'POST: HOOK → CONTEXTO → TENSÃO → EVIDÊNCIA → REENQUADRAMENTO → FECHAMENTO, em texto corrido concentrado (não é carrossel comprimido). JSON: {"partes":[{"rotulo":"Hook","texto":""},{"rotulo":"Contexto","texto":""},{"rotulo":"Tensão","texto":""},{"rotulo":"Evidência","texto":""},{"rotulo":"Reenquadramento","texto":""},{"rotulo":"Fechamento","texto":""}]}',
  video: () => 'VÍDEO: HOOK → PROMESSA → CONTEXTO → TENSÃO → MECANISMO → EXEMPLO → REENQUADRAMENTO → FECHAMENTO. Roteiro falável (frases curtas, oral), com texto na tela, apoio visual/B-roll, ritmo/cortes/pausas e CTA. JSON: {"partes":[{"rotulo":"Hook","texto":"fala","tela":"texto na tela","apoio":"B-roll/visual/ritmo"}, ...8 blocos...]}',
  reel: () => 'REEL/SHORT de 30-45 s: Hook falado → Contexto mínimo → Tensão → Mecanismo → Exemplo → Virada → Fechamento. O hook funciona oralmente. JSON: {"partes":[{"rotulo":"Hook falado","texto":"fala","tela":"texto na tela","apoio":"visual/corte"}, ...7 blocos...]}',
  thread: () => 'THREAD: gancho + uma ideia por mensagem (até 280 caracteres cada) + fechamento que devolve a tese. JSON: {"partes":[{"rotulo":"1/","texto":""}, ...8 a 10...]}',
  newsletter: () => 'NEWSLETTER: abertura com o caso, leitura do fenômeno, tese, implicações, convite. JSON: {"partes":[{"rotulo":"Abertura","texto":""},{"rotulo":"Leitura","texto":""},{"rotulo":"Tese","texto":""},{"rotulo":"Implicações","texto":""},{"rotulo":"Convite","texto":""}]}',
  artigo: () => 'ARTIGO: tese no 1º parágrafo, argumento em blocos com intertítulos, contraponto, síntese. JSON: {"partes":[{"rotulo":"Abertura","texto":""},{"rotulo":"Argumento 1","texto":""},{"rotulo":"Argumento 2","texto":""},{"rotulo":"Contraponto","texto":""},{"rotulo":"Síntese","texto":""}]}',
  campanha: () => 'CAMPANHA: tese-mãe + desdobramentos por formato e etapa do funil. JSON: {"partes":[{"rotulo":"Tese-mãe","texto":""},{"rotulo":"Descoberta","texto":""},{"rotulo":"Consideração","texto":""},{"rotulo":"Autoridade","texto":""},{"rotulo":"Conversão","texto":""}]}'
};
async function eProduce(extra, only) {
  const s = EDS(), it = s.ideas[s.chosen], b = s.brief, hl = s.headlines.find(h => h.pick), t = s.analysis.triagem; edi.busy = 'prod'; renderEditorial();
  try {
    const j = await motJSON(eSystem(), `${eInput()}\n\nIDEIA: ${it.tese}\nBRIEFING: hook: ${b.estrutura.hook} | mecanismo: ${b.estrutura.mecanismo} | prova: ${b.estrutura.prova} | aplicação: ${b.estrutura.aplicacao} | evitar: ${b.direcao.evitar}\nEVIDÊNCIAS DISPONÍVEIS (use só estas; hipótese é hipótese): ${t.evidencias.map(v => `[${v.tipo}] ${v.texto}`).join(' ; ')}\n${hl ? 'HEADLINE ESCOLHIDA (use como hook): ' + hl.headline + '\n' : ''}${extra ? 'AJUSTE PEDIDO: ' + extra + '\n' : ''}\nFormato — ${ED_SPEC[s.format]()}\nRegras: linguagem natural e específica; nada de clichês de IA; se qualquer página pudesse publicar a frase, reescreva; NUNCA invente números, estudos, datas, citações ou fontes (use [CONFIRMAR: …]); o fechamento decorre da narrativa.`, 7000);
    let parts;
    if (s.format === 'carrossel') { const T = (Array.isArray(j.textos) ? j.textos : []).slice(0, 18).map(eStr); while (T.length < 18) T.push(''); parts = T.map((x, k) => ({label: `${k + 1} · ${ED_CAR(k + 1, EDX().sizes)[0]}`, texto: x})); }
    else parts = (Array.isArray(j.partes) ? j.partes : []).slice(0, 14).map(x => ({label: eStr(x.rotulo), texto: eStr(x.texto), tela: x.tela ? eStr(x.tela) : undefined, apoio: x.apoio ? eStr(x.apoio) : undefined}));
    if (!parts.length) throw new Error('a IA não devolveu o conteúdo.');
    s.content = {format: s.format, parts}; s.audit = null; const h = eHist(); if (h && !h.formats.includes(s.format)) h.formats.push(s.format); s.stage = 'auditoria';
  } catch (er) { toast(eErr(er)); }
  edi.busy = ''; eSave(); renderEditorial();
}

/* ---------- 5 · auditoria (local + IA) e entrega ---------- */
const eText = c => c.parts.map(p => [p.texto, p.tela, p.apoio].filter(Boolean).join(' ')).join('\n');
function eAuditLocal(s) {
  const c = s.content, E_ = EDX(), grounds = eTok(s.input + ' ' + s.sources + ' ' + s.analysis.triagem.evidencias.map(v => v.texto).join(' ')).join(' ') + ' ' + (s.input + s.sources).toLowerCase().replace(/\s+/g, ' ');
  const slop = [], nums = [], size = [], forb = [];
  c.parts.forEach((p, k) => {
    const full = [p.texto, p.tela].filter(Boolean).join(' ');
    ED_SLOP.forEach(([name, re]) => { if (re.test(full)) slop.push({k, name, trecho: (full.match(re) || [''])[0]}); });
    (full.match(/\d[\d.,]*\s?%?/g) || []).forEach(n => { const nn = n.trim(); if ((nn.replace(/\D/g, '').length >= 2 || /%/.test(nn)) && !grounds.includes(nn.replace(/\s/g, '').toLowerCase()) && !grounds.includes(nn.toLowerCase())) nums.push({k, n: nn}); });
    (E_.mem.proibidas || '').split(/[,;\n]/).map(w => w.trim().toLowerCase()).filter(w => w.length > 2).forEach(w => { if (full.toLowerCase().includes(w)) forb.push({k, w}); });
    if (c.format === 'carrossel') { const [nm, r] = ED_CAR(k + 1, E_.sizes), len = (p.texto || '').length; if (len < r[0] || len > r[1]) size.push({k, nm, len, r}); }
  });
  const confirmar = c.parts.filter(p => /\[CONFIRMAR/.test(p.texto || '')).length;
  return {slop, nums, size, forb, confirmar, cont: c.format === 'carrossel' ? c.parts.length : null};
}
async function eAudit() {
  const s = EDS(), c = s.content; edi.busy = 'aud'; renderEditorial(); const loc = eAuditLocal(s);
  try {
    const j = await motJSON('Você é o revisor de qualidade do agente editorial. Seja exigente e específico. Nota 0 a 5.', `INSUMO E EVIDÊNCIAS:\n${eInput().slice(0, 12000)}\nEVIDÊNCIAS EXTRAÍDAS: ${s.analysis.triagem.evidencias.map(v => `[${v.tipo}] ${v.texto}`).join(' ; ')}\n\nIDEIA: ${s.ideas[s.chosen].tese}\n\nCONTEÚDO (${c.format}):\n${c.parts.map((p, k) => `[${k}] ${p.label}: ${p.texto}${p.tela ? ' | tela: ' + p.tela : ''}`).join('\n')}\n\nAudite: FACTUAL (afirmações sustentadas pelo material? algo inventado? hipótese apresentada como fato?), NARRATIVA (conflito, progressão, cada bloco acrescenta algo, fechamento decorre da narrativa), COPY (hook forte, linguagem natural, especificidade, clichês), FORMATO (quantidade, estrutura), EDITORIAL (tese proporcional às evidências, sem exagero). Responda à pergunta central: isso parece conteúdo genérico de IA ou uma leitura editorial que alguém realmente teve?\nJSON: {"notas":{"factual":0,"narrativa":0,"copy":0,"formato":0,"editorial":0},"problemas":[{"k":0,"area":"factual|narrativa|copy|formato|editorial","problema":"","sugestao":""}],"veredito":"leitura editorial|conteudo generico","justificativa":""}`, 3500);
    s.audit = {loc, notas: Object.fromEntries(['factual', 'narrativa', 'copy', 'formato', 'editorial'].map(k => [k, Math.max(0, Math.min(5, +(j.notas && j.notas[k]) || 0))])), problemas: (Array.isArray(j.problemas) ? j.problemas : []).slice(0, 20).map(x => ({k: Math.round(+x.k), area: eStr(x.area), problema: eStr(x.problema), sugestao: eStr(x.sugestao)})), veredito: j.veredito === 'leitura editorial' ? 'leitura editorial' : 'conteudo generico', justificativa: eStr(j.justificativa)};
  } catch (er) { s.audit = {loc, notas: null, problemas: [], veredito: '', justificativa: '', semIA: true}; toast('A auditoria local rodou; a da IA falhou: ' + eErr(er)); }
  edi.busy = ''; eSave(); renderEditorial();
}
async function eFix() {
  const s = EDS(), a = s.audit; if (!a) return; const bad = new Set([...a.loc.slop.map(x => x.k), ...a.loc.nums.map(x => x.k), ...a.loc.size.map(x => x.k), ...a.problemas.map(x => x.k)].filter(k => k >= 0 && k < s.content.parts.length)); if (!bad.size) { toast('Nada para corrigir.'); return; }
  edi.busy = 'fix'; renderEditorial();
  try {
    const items = [...bad].map(k => { const p = s.content.parts[k], pr = a.problemas.filter(x => x.k === k).map(x => x.problema + ' → ' + x.sugestao), sl = a.loc.slop.filter(x => x.k === k).map(x => 'clichê: ' + x.name), nu = a.loc.nums.filter(x => x.k === k).map(x => 'número sem base no material: ' + x.n), sz = a.loc.size.filter(x => x.k === k).map(x => `tamanho ${x.len}, deveria ficar entre ${x.r[0]} e ${x.r[1]} caracteres`); return `[${k}] ${p.label}: ${p.texto}\n   problemas: ${[...pr, ...sl, ...nu, ...sz].join('; ')}`; });
    const j = await motJSON(eSystem(), `Reescreva SÓ os trechos abaixo, corrigindo os problemas. Remova clichês de IA, retire ou qualifique números sem base ([CONFIRMAR: …]), respeite o tamanho. Mantenha a voz e a progressão.\n${items.join('\n')}\nJSON: {"trechos":[{"k":0,"texto":""}]}`, 5000);
    (j.trechos || []).forEach(x => { const k = Math.round(+x.k); if (s.content.parts[k] && x.texto) s.content.parts[k].texto = eStr(x.texto); }); s.audit = null; toast('Trechos reescritos. Rode a auditoria de novo.');
  } catch (er) { toast(eErr(er)); }
  edi.busy = ''; eSave(); renderEditorial();
}
async function eRewrite(k) { const s = EDS(), p = s.content.parts[k], ins = ($('eIns' + k) || {}).value || ''; edi.busy = 'rw' + k; renderEditorial(); try { const t = await aiText(eSystem(), `Reescreva este trecho (${p.label}) do ${s.content.format}. ${ins ? 'Instrução: ' + ins : 'Aprofunde com mais especificidade.'}\nSem clichês de IA; sem inventar dados.\nTrecho atual: ${p.texto}\nDevolva só o novo texto.`, 1200); p.texto = t.replace(/^["“]|["”]$/g, '').trim(); s.audit = null; } catch (er) { toast(eErr(er)); } edi.busy = ''; eSave(); renderEditorial(); }
async function eShorten() { const s = EDS(); edi.busy = 'prod'; renderEditorial(); try { const j = await motJSON(eSystem(), `Reduza cerca de 30% cada trecho, mantendo a tese e a progressão.${s.content.format === 'carrossel' ? ' Respeite as faixas de tamanho.' : ''}\n${s.content.parts.map((p, k) => `[${k}] ${p.label}: ${p.texto}`).join('\n')}\nJSON: {"trechos":[{"k":0,"texto":""}]}`, 6000); (j.trechos || []).forEach(x => { const k = Math.round(+x.k); if (s.content.parts[k] && x.texto) s.content.parts[k].texto = eStr(x.texto); }); s.audit = null; } catch (er) { toast(eErr(er)); } edi.busy = ''; eSave(); renderEditorial(); }
function ePartSet(k, f, v) { EDS().content.parts[k][f] = v; EDS().audit = null; eSave(); const c = $('eLen' + k); if (c) c.textContent = v.length + ' car.'; }
function eAuditoriaUI(s) {
  const c = s.content, a = s.audit; if (!c) return '<p class="muted">Produza o conteúdo primeiro.</p>';
  const bad = k => a && (a.loc.slop.some(x => x.k === k) || a.loc.nums.some(x => x.k === k) || a.loc.size.some(x => x.k === k) || a.problemas.some(x => x.k === k));
  const parts = c.parts.map((p, k) => `<div class="mot-ch ${bad(k) ? 'ed-bad' : ''}"><div class="row-gap" style="justify-content:space-between"><b style="font-size:12.5px">${esc(p.label)}</b><small class="muted" id="eLen${k}">${(p.texto || '').length} car.${c.format === 'carrossel' ? ' (faixa ' + ED_CAR(k + 1, EDX().sizes)[1].join('-') + ')' : ''}</small></div><textarea rows="${Math.min(8, Math.max(2, Math.ceil((p.texto || '').length / 60)))}" oninput="ePartSet(${k},'texto',this.value)">${esc(p.texto)}</textarea>${p.tela !== undefined ? `<input value="${esc(p.tela)}" placeholder="texto na tela" oninput="ePartSet(${k},'tela',this.value)" style="width:100%;margin-top:4px">` : ''}${p.apoio !== undefined ? `<input value="${esc(p.apoio)}" placeholder="apoio visual / B-roll / ritmo" oninput="ePartSet(${k},'apoio',this.value)" style="width:100%;margin-top:4px">` : ''}<div class="row-gap" style="margin-top:4px"><input id="eIns${k}" placeholder="Aprofundar / reescrever com instrução" style="flex:1"><button class="btn sm" onclick="eRewrite(${k})" ${edi.busy ? 'disabled' : ''}>${edi.busy === 'rw' + k ? '…' : 'Reescrever'}</button></div></div>`).join('');
  return `<div class="mot-wrap"><div>${parts}</div><div>
  <div class="okr-label">AUDITORIA</div>
  <div class="row-gap" style="flex-wrap:wrap;margin-bottom:8px"><button class="btn dark" onclick="eAudit()" ${edi.busy ? 'disabled' : ''}>${edi.busy === 'aud' ? 'Auditando…' : a ? '↻ Auditar de novo' : '✦ Auditar'}</button>${a ? `<button class="btn" onclick="eFix()" ${edi.busy ? 'disabled' : ''}>${edi.busy === 'fix' ? 'Corrigindo…' : 'Corrigir com IA'}</button>` : ''}<button class="btn" onclick="eShorten()" ${edi.busy ? 'disabled' : ''}>Reduzir 30%</button><button class="btn" onclick="eStage('narrativa')">Alterar formato</button></div>
  ${a ? eAuditHTML(a, c) : '<p class="muted" style="font-size:12.5px">A auditoria confere clichês de IA, números sem base no material, tamanhos, memória de palavras proibidas e pede à IA uma revisão factual, narrativa, de copy e de formato.</p>'}
  <div class="okr-label" style="margin-top:12px">ENTREGA</div><div class="row-gap" style="flex-direction:column;align-items:stretch;gap:6px">${['carrossel', 'post'].includes(c.format) ? '<button class="btn" onclick="eToDesign()">Enviar ao Estúdio de Design (Nova composição)</button>' : ''}<button class="btn" onclick="eToMotor()">Enviar ao Motor de texto (e-book)</button><button class="btn" onclick="eCopy()">Copiar tudo</button><button class="btn" onclick="eDown()">Baixar .md</button></div></div></div>`;
}
function eAuditHTML(a, c) {
  const l = a.loc, sc = a.notas, li = (arr, f) => arr.length ? `<ul style="margin:2px 0 8px 16px;padding:0;font-size:12.5px">${arr.map(f).join('')}</ul>` : '<p class="muted" style="font-size:12px;margin:2px 0 8px">nada encontrado ✔</p>';
  return `${a.veredito ? `<div class="${a.veredito === 'leitura editorial' ? 'ed-ok' : 'dtp-warn'}" style="padding:8px 10px;border-radius:10px"><b>${a.veredito === 'leitura editorial' ? 'Parece uma leitura editorial que alguém teve.' : 'Parece conteúdo genérico de IA.'}</b><br><span style="font-size:12.5px">${esc(a.justificativa)}</span></div>` : ''}
  ${sc ? `<div class="ed-scores">${Object.entries(sc).map(([k, v]) => `<div><b>${v}</b><small>${k}</small></div>`).join('')}</div>` : ''}
  <b style="font-size:12.5px">Clichês de IA (${l.slop.length})</b>${li(l.slop, x => `<li>${esc(c.parts[x.k].label)}: ${esc(x.name)}</li>`)}
  <b style="font-size:12.5px">Números sem base no material (${l.nums.length})</b>${li(l.nums, x => `<li>${esc(c.parts[x.k].label)}: <b>${esc(x.n)}</b></li>`)}
  ${c.format === 'carrossel' ? `<b style="font-size:12.5px">Formato (18 textos · faixas de tamanho)</b>${l.cont === 18 ? '' : `<p style="color:#dc2626;font-size:12.5px;margin:2px 0">Quantidade ${l.cont} ≠ 18.</p>`}${li(l.size, x => `<li>${esc(x.nm)} (${x.k + 1}): ${x.len} car., faixa ${x.r.join('-')}</li>`)}` : ''}
  ${l.forb.length ? `<b style="font-size:12.5px">Palavras proibidas da memória</b>${li(l.forb, x => `<li>${esc(c.parts[x.k].label)}: ${esc(x.w)}</li>`)}` : ''}
  <p style="font-size:12.5px;margin:2px 0 8px"><b>[CONFIRMAR] pendentes:</b> ${l.confirmar} trecho(s)</p>
  ${a.problemas.length ? `<b style="font-size:12.5px">Revisão da IA</b><ul style="margin:2px 0 8px 16px;padding:0;font-size:12.5px">${a.problemas.map(x => `<li><b>${esc(x.area)}</b>${x.k >= 0 && c.parts[x.k] ? ' · ' + esc(c.parts[x.k].label) : ''}: ${esc(x.problema)}<br><span class="muted">→ ${esc(x.sugestao)}</span></li>`).join('')}</ul>` : ''}${a.semIA ? '<p class="muted" style="font-size:12px">Sem revisão da IA nesta rodada.</p>' : ''}`;
}
const eMd = () => { const s = EDS(), c = s.content, it = s.ideas[s.chosen]; return `# ${(s.headlines.find(h => h.pick) || {}).headline || it.tese}\n\n> Tese: ${it.tese}\n\n` + c.parts.map(p => `## ${p.label}\n\n${p.texto}${p.tela ? `\n\n*Tela:* ${p.tela}` : ''}${p.apoio ? `\n\n*Apoio:* ${p.apoio}` : ''}`).join('\n\n') + '\n'; };
function eCopy() { try { navigator.clipboard.writeText(eMd()); toast('Copiado.'); } catch (e) { toast('Não consegui copiar.'); } }
function eDown() { download('conteudo-editorial.md', eMd(), 'text/markdown'); }
function eToDesign() {
  const s = EDS(), c = s.content, P = c.parts.map(p => (p.texto || '').replace(/\n+/g, ' ')); let lines;
  if (c.format === 'carrossel') { lines = [`${P[0]} | ${P[1]}`]; [[2, 3, 4, 5], [6, 7, 8, 9], [10, 11, 12], [13, 14, 15]].forEach(g => lines.push(`${P[g[0]]}: ${g.slice(1).map(i => P[i]).join(' ')}`)); lines.push(`${P[16]} | ${P[17]}`); }
  else lines = [`${P[0].slice(0, 90)} | ${(P[1] || '').slice(0, 120)}`, ...P.slice(2, -1).map((x, i) => `${c.parts[i + 2].label}: ${x}`), `${P[P.length - 1].slice(0, 90)} | Saiba mais`];
  dzNew(); dz.cmp.text = lines.join('\n'); dz.cmp.name = (s.ideas[s.chosen].tese || '').slice(0, 50); go('design'); toast('Texto enviado. Escolha estilo, fontes e gere as peças.');
}
function eToMotor() { const s = EDS(), t = s.ideas[s.chosen].tese, eb = bookNew((t || 'Novo e-book').slice(0, 60), ''); const M = (eb.motor = normalizeMotor({})); M.idea = t; M.source = (s.input.slice(0, 20000) + '\n\n--- Conteúdo editorial ---\n' + eMd()).slice(0, 60000); persist(); edh.area = 'livros'; ebOpen(eb.id); go('editora'); toast('Novo e-book criado com a tese e o conteúdo editorial. Gere a estrutura no motor.'); }

/* ---------- memória e DNA ---------- */
function eMemory() {
  const e = EDX(), B = e.brand, M = e.mem, f = (grp, k, l, rows) => `<div class="field"><label>${l}</label>${rows ? `<textarea rows="${rows}" oninput="EDX().${grp}.${k}=this.value;eSave()">${esc(e[grp][k])}</textarea>` : `<input value="${esc(e[grp][k])}" oninput="EDX().${grp}.${k}=this.value;eSave()">`}</div>`;
  return `<div style="max-width:980px">${accSec('edm', 'dna', 'DNA da marca', 'público, posicionamento, tom, temas', `<div class="form-grid">${[['publico', 'Público'], ['posicionamento', 'Posicionamento'], ['tom', 'Tom'], ['categorias', 'Categorias'], ['produtos', 'Produtos'], ['diferenciais', 'Diferenciais']].map(([k, l]) => f('brand', k, l, 2)).join('')}</div>${f('brand', 'prioritarios', 'Temas prioritários', 2)}${f('brand', 'proibidos', 'Temas proibidos', 2)}${f('brand', 'aprovados', 'Exemplos de conteúdos aprovados', 3)}${f('brand', 'rejeitados', 'Exemplos de conteúdos rejeitados', 3)}<small class="muted">O nome do projeto e o contexto do Brand Brain também são considerados.</small>`, true)}
  ${accSec('edm', 'mem', 'Memória editorial', 'vocabulário, referências, padrões', `<div class="form-grid">${[['vocab', 'Vocabulário'], ['referencias', 'Referências'], ['marcas', 'Marcas'], ['temas', 'Temas recorrentes'], ['formatos', 'Formatos preferidos'], ['padroes', 'Padrões de headline'], ['proibidas', 'Palavras proibidas (separe por vírgula)'], ['estruturas', 'Estruturas preferidas']].map(([k, l]) => f('mem', k, l, 2)).join('')}</div><div class="okr-label">REGRAS NEGATIVAS</div>${M.negatives.map((n, i) => `<div class="row-gap" style="justify-content:space-between;font-size:12.5px"><span>${esc(n)}</span><button class="btn sm" onclick="EDX().mem.negatives.splice(${i},1);eSave();renderEditorial()">×</button></div>`).join('') || '<small class="muted">Nenhuma. Use “Não quero esse tom…” na tela de ângulos.</small>'}`, false)}
  ${accSec('edm', 'sz', 'Tamanhos do carrossel (caracteres por bloco)', '18 textos', `<div class="form-grid">${[['capa1', 'Capa · título'], ['capa2', 'Capa · subtítulo'], ['titulo', 'Títulos (3, 7, 11, 14)'], ['par', 'Parágrafos'], ['curto', 'Parágrafos curtos (6, 10)'], ['fechamento', 'Fechamento (17)'], ['assinatura', 'Assinatura (18)']].map(([k, l]) => `<div class="field"><label>${l}</label><div class="row-gap"><input type="number" min="0" value="${e.sizes[k][0]}" style="width:80px" onchange="EDX().sizes.${k}[0]=+this.value;eSave()"> a <input type="number" min="0" value="${e.sizes[k][1]}" style="width:80px" onchange="EDX().sizes.${k}[1]=+this.value;eSave()"></div></div>`).join('')}</div>`, false)}
  ${accSec('edm', 'pref', 'Preferências aprendidas', e.liked.length + ' aprovadas · ' + e.rejected.length + ' rejeitadas', `<b style="font-size:12.5px">Teses que você aprovou</b>${e.liked.map((t, i) => `<div class="row-gap" style="justify-content:space-between;font-size:12.5px"><span>${esc(t)}</span><button class="btn sm" onclick="EDX().liked.splice(${i},1);eSave();renderEditorial()">×</button></div>`).join('') || '<br><small class="muted">nenhuma</small>'}<br><b style="font-size:12.5px">Teses rejeitadas</b>${e.rejected.map((r, i) => `<div class="row-gap" style="justify-content:space-between;font-size:12.5px"><span>${esc(r.tese)} <small class="muted">${esc(r.why)}</small></span><button class="btn sm" onclick="EDX().rejected.splice(${i},1);eSave();renderEditorial()">×</button></div>`).join('') || '<br><small class="muted">nenhuma</small>'}`, false)}
  ${accSec('edm', 'his', 'Histórico', e.history.length + ' sessão(ões)', e.history.map((h, i) => `<div class="mot-ch"><div class="row-gap" style="justify-content:space-between"><b style="font-size:12.5px">${esc(h.input || '(sem título)')}</b><small class="muted">${new Date(h.t).toLocaleDateString('pt-BR')}</small></div>${(h.ideas || []).map(q => `<div style="font-size:12px"><span class="ed-badge" style="background:${q.status === 'chosen' ? '#15803d' : q.status === 'liked' ? '#1d4ed8' : q.status === 'shown' ? '#888' : '#dc2626'}">${esc(q.status)}</span> ${esc(q.tese)}</div>`).join('')}${h.formats.length ? `<small class="muted">formatos: ${esc(h.formats.join(', '))}</small>` : ''}<div class="row-gap" style="margin-top:4px"><button class="btn sm" onclick="EDX().history.splice(${i},1);eSave();renderEditorial()">Excluir</button></div></div>`).join('') || '<small class="muted">Ainda sem sessões.</small>', false)}</div>`;
}

/* ---------- métricas ---------- */
function eMetrics() {
  const H = EDX().history, shown = H.reduce((a, h) => a + (h.ideas || []).length, 0), chosen = H.filter(h => h.chosen >= 0), pct = (a, b) => b ? Math.round(a / b * 100) + '%' : '—';
  const rej = H.reduce((a, h) => a + (h.ideas || []).filter(i => ['rejected', 'generic'].includes(i.status)).length, 0), dev = chosen.filter(h => h.brief).length, prod = chosen.filter(h => h.formats.length).length, reuse = prod ? (chosen.reduce((a, h) => a + h.formats.length, 0) / prod).toFixed(1) : '—', first = chosen.filter(h => h.chosen <= 1).length;
  const lenses = new Set(H.flatMap(h => (h.ideas || []).map(i => (i.categoria || '') + '|' + (i.lente || '')))), total = shown;
  const cards = [['Idea Acceptance Rate', pct(chosen.length, shown), 'ideias escolhidas / ideias mostradas'], ['First-Choice Rate', pct(first, chosen.length), 'sessões em que a escolha foi uma das 2 primeiras'], ['Rejection Rate', pct(rej, shown), 'ideias rejeitadas ou marcadas como genéricas'], ['Development Rate', pct(dev, chosen.length), 'escolhidas que viraram briefing'], ['Production Rate', pct(prod, dev), 'briefings que viraram conteúdo'], ['Reuse Rate', reuse, 'formatos por ideia desenvolvida'], ['Editorial Diversity', total ? lenses.size + ' ângulos' : '—', 'combinações distintas de categoria e lente']];
  return `<p class="muted" style="font-size:13px;margin-top:0">Métricas de qualidade editorial (não de volume), calculadas do histórico deste projeto: ${H.length} sessão(ões), ${shown} ideia(s) mostrada(s).</p><div class="start-cards">${cards.map(([t, v, d]) => `<div class="start-card" style="cursor:default"><small class="muted">${t}</small><b style="font-size:26px">${v}</b><small class="muted">${d}</small></div>`).join('')}</div>`;
}

/* ---------- skill ---------- */
function eSkillTab() {
  const f = edi.skillFile;
  return `<p class="muted" style="font-size:13px;margin-top:0">A skill é a camada reutilizável: ensina o modelo a pensar editorialmente, sem depender desta interface. É a mesma que o agente usa aqui. Baixe e use em outros GPTs, agentes ou workflows.</p>
  <div class="row-gap" style="margin-bottom:8px;flex-wrap:wrap"><button class="btn dark" onclick="eSkillZip()">Baixar a skill (.zip)</button><button class="btn" onclick="eSkillToMotor()">Registrar no Motor de texto</button></div>
  <div class="mot-wrap"><div class="ed-files">${EDS_ORDER.map(n => `<button class="${n === f ? 'on' : ''}" onclick="edi.skillFile='${n}';renderEditorial()">${esc(n)}</button>`).join('')}</div><div><pre class="ed-pre">${esc(EDS_FILES[f] || '')}</pre></div></div>`;
}
async function eSkillZip() { const enc = new TextEncoder(); const files = EDS_ORDER.map(n => ({name: 'editorial-skill/' + n, data: enc.encode(EDS_FILES[n])})); download('editorial-skill.zip', makeZip(files), 'application/zip'); toast('Skill baixada (' + files.length + ' arquivos).'); }
function eSkillToMotor() { const k = {id: uid('sk'), name: 'Skill Editorial (Furacão + BrandsDecoded)', text: EDS_CORE.map(f => EDS_FILES[f]).join('\n\n').slice(0, 30000)}; state.skills = Array.isArray(state.skills) ? state.skills : []; state.skills.push(k); persist(); toast('Skill registrada no Motor de texto.'); }
