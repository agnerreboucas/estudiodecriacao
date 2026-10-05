/* ===== Video Lab · Roteiros em 4 tipos para cada ângulo de anúncio ou post escolhido =====
   Literário (a fala e a narrativa), técnico (planos, lentes, luz), de gravação (o que fazer na hora de gravar) e de edição (cortes, legendas, trilha).
   Nascem de um esqueleto com os dados do projeto (sem IA, sem crédito) e dá para reescrever cada um com a IA, usando as skills de vídeo. */
const VS_LABEL = {literario: 'Literário', tecnico: 'Técnico', gravacao: 'Gravação', edicao: 'Edição'};
const VS_DESC = {literario: 'A narrativa e a fala, cena a cena.', tecnico: 'Planos, movimentos, lentes, luz e áudio por cena.', gravacao: 'O que preparar e como gravar, na ordem certa.', edicao: 'Cortes, legendas, B-roll, trilha, transições e exportação.'};
const vlUI = {tab: 'prod', src: 'concept', cid: '', cmp: '', piece: '', car: '', ftitle: '', fbase: '', dur: 15, id: '', kind: 'literario', busy: false};
const vsOf = (p, id) => p.video.scripts.find(x => x.id === id);

/* ---------- origem do roteiro ---------- */
function vsSource(p) {
  const u = vlUI;
  if (u.src === 'concept') { const c = p.matrix.concepts.find(x => x.id === u.cid); if (!c) return null; return {type: 'concept', id: c.id, title: `${c.hook} × ${c.angle}`, hook: hookLine(p, c), angle: c.angle, cta: c.cta, stage: '', base: ''}; }
  if (u.src === 'piece') { const c = p.campaigns.find(x => x.id === u.cmp), q = c && c.pieces.find(x => x.id === u.piece); if (!q) return null; return {type: 'piece', id: q.id, title: `${c.name} · ${q.name}`, hook: q.h, angle: `${CMP_STAGE_NAME[q.stage]} (gatilho: ${CMP_STAGE_GATILHO[q.stage]})`, cta: q.btn, stage: q.stage, base: q.s}; }
  if (u.src === 'carousel') { const c = p.carousels.find(x => x.id === u.car); if (!c) return null; return {type: 'carousel', id: c.id, title: c.name, hook: c.name, angle: c.idea || '', cta: '', stage: '', base: c.idea || ''}; }
  const t = u.ftitle.trim(); if (!t) return null; return {type: 'free', id: '', title: t.slice(0, 160), hook: t.slice(0, 300), angle: '', cta: '', stage: '', base: u.fbase.trim().slice(0, 3000)};
}
const vsLines = v => String(v || '').split('\n').map(s => s.trim()).filter(Boolean);
function vsPlan(dur) { const plan = SCENE_PLAN[dur] || SCENE_PLAN[15]; let t = 0; return plan.map(([stage, d], i) => { const r = {stage, a: t, b: t + d, i}; t += d; return r; }); }
function vsFala(p, src, stage) {
  const ic = (p.pre.icps || [])[0] || {}, pr = (p.products || [])[0] || {};
  const pain = vsLines(ic.pains)[0], doubt = vsLines(ic.doubts)[0], des = vsLines(ic.desires)[0];
  switch (stage) {
    case 'Hook': return src.hook || '[escreva a frase de abertura]';
    case 'Problema': return pain ? `Fale da dor, na voz do cliente: "${pain}"` : '[descreva o problema do público]';
    case 'Ideia': return src.angle ? `Apresente a ideia do ângulo: ${src.angle}` : (src.base ? src.base.split(/(?<=[.!?])\s/)[0] : '[apresente a ideia central]');
    case 'Solução': return pr.summary ? `Mostre a solução: ${pr.summary.split(/(?<=[.!?])\s/)[0]}` : '[CONFIRMAR] explique como o serviço ou produto resolve o problema';
    case 'Prova': return '[CONFIRMAR] use só prova real e autorizada (caso, depoimento ou número com fonte)';
    case 'Objeção': return doubt ? `Responda a dúvida: "${doubt}"` : '[responda a objeção mais comum]';
    case 'Demonstração': return '[mostre o passo a passo, com a tela ou o produto à mostra]';
    case 'CTA': return src.cta || 'Fale com a gente';
    default: return des ? `Fale do que a pessoa quer: "${des}"` : '[escreva a fala desta cena]';
  }
}
const vsShort = t => String(t).replace(/^(Fale|Apresente|Mostre|Responda)[^:]*:\s*/, '').replace(/^"|"$/g, '').split(/\s+/).slice(0, 7).join(' ');
/* esqueletos: dados do projeto organizados, sem texto inventado (o que falta fica entre colchetes) */
function vsSkeleton(p, src, dur) {
  const plan = vsPlan(dur), head = `Título: ${src.title}\nÂngulo: ${src.angle || '[defina o ângulo]'}\nDuração: ${dur} s · Formato: vertical 9:16 (1080×1920)\n`;
  const lit = `ROTEIRO LITERÁRIO\n${head}${src.base ? 'Ideia de base: ' + src.base + '\n' : ''}\n` + plan.map(s => { const f = vsFala(p, src, s.stage); return `[${s.a}–${s.b} s] ${s.stage.toUpperCase()}\nFala: ${/^\[|^(Fale|Apresente|Mostre|Responda)/.test(f) ? f : '"' + f + '"'}\nTexto na tela: ${vsShort(f)}\n`; }).join('\n');
  const tec = `ROTEIRO TÉCNICO\n${head}\n` + plan.map(s => `CENA ${String(s.i + 1).padStart(2, '0')} · ${s.a}–${s.b} s · ${s.stage}\n- Plano: ${FRAMES[s.i % 8]}\n- Movimento: ${MOVES[s.i % 8]}\n- Lente: natural, 35 mm\n- Luz: ${LIGHTS[s.i % 3]}\n- Áudio: ${s.stage === 'CTA' ? 'fala direta e trilha baixa' : 'fala direta'}\n- Elementos em cena: [liste o que aparece]\n- Texto na tela: ${vsShort(vsFala(p, src, s.stage))}\n`).join('\n') + '\nObservação: mantenha o rosto e o texto fora das faixas que o Reels e os Stories cobrem (cerca de 250 px no topo e 340 px no rodapé). Confira as medidas atuais antes de publicar.\n';
  const gr = `ROTEIRO DE GRAVAÇÃO\n${head}\nANTES DE GRAVAR\n- [ ] Local com pouco ruído e luz que bate no rosto (de frente ou de lado)\n- [ ] Celular na vertical, lente limpa, modo avião ligado\n- [ ] Microfone ou fone com microfone, se tiver\n- [ ] Fundo limpo e roupa que combine com a marca\n- [ ] Falas lidas em voz alta pelo menos uma vez\n- [ ] Itens de cena separados: [liste]\n\nORDEM DE GRAVAÇÃO (agrupe por local e por plano, não pela ordem do vídeo)\n` +
    plan.map(s => `${s.i + 1}. ${s.stage} (${s.a}–${s.b} s) · ${FRAMES[s.i % 8]}, ${MOVES[s.i % 8].toLowerCase()}\n   Fale: ${vsShort(vsFala(p, src, s.stage))}…\n   Faça 2 ou 3 takes. Pause 1 segundo antes e depois da fala para facilitar o corte.`).join('\n') + '\n\nDICAS\n- Olhe para a lente, não para a tela\n- Comece o Hook com energia e sem cumprimento longo\n- Regrave o Hook e o CTA por último, quando estiver mais solto\n- Em setores regulados, não prometa resultado e confira as regras do conselho\n';
  const ed = `ROTEIRO DE EDIÇÃO\n${head}\nRITMO\n- Corte nas pausas; evite cena parada por mais de 3 segundos\n- Legendas grandes e legíveis, dentro da área segura\n\nLINHA DO TEMPO\n` +
    plan.map(s => `${s.a}–${s.b} s · ${s.stage}\n   Corte: ${s.i === 0 ? 'abrir direto no Hook, sem vinheta' : 'corte seco na pausa'}\n   Legenda: ${vsShort(vsFala(p, src, s.stage))}\n   B-roll: [sugira o que cobrir]\n   Trilha e SFX: ${s.stage === 'Hook' ? 'efeito curto de entrada' : s.stage === 'CTA' ? 'trilha sobe levemente' : 'trilha baixa constante'}\n   Transição: ${s.i === 0 ? 'nenhuma' : 'corte direto'}`).join('\n') + '\n\nFECHAMENTO\n- Selo ou logo no CTA\n- Capa do vídeo com o texto do Hook\n- Exportar em 1080×1920, MP4, com legenda queimada e uma versão sem legenda\n';
  return {literario: lit, tecnico: tec, gravacao: gr, edicao: ed};
}

/* ---------- ações ---------- */
function vsCreate() {
  const p = curProject(), src = vsSource(p); if (!src) { toast('Escolha o ângulo, o anúncio ou escreva a ideia.'); return; }
  if (p.video.scripts.length >= 60) { toast('Limite de 60 roteiros.'); return; }
  const r = {id: uid('vs'), src, dur: vlUI.dur, t: vsSkeleton(p, src, vlUI.dur), created: new Date().toISOString(), updated: ''};
  p.video.scripts.unshift(r); vlUI.id = r.id; vlUI.kind = 'literario'; persist(); renderVideoLab(); toast('Os 4 roteiros foram montados. Revise e, se quiser, reescreva com a IA.');
}
function vsOpen(id) { vlUI.id = vlUI.id === id ? '' : id; vlUI.kind = 'literario'; renderVideoLab(); }
function vsKind(k) { vsKeep(); vlUI.kind = k; renderVideoLab(); }
function vsKeep() { const r = vsOf(curProject(), vlUI.id), ta = $('vsText'); if (r && ta) { r.t[vlUI.kind] = ta.value.slice(0, 14000); } }
function vsSave() { vsKeep(); const r = vsOf(curProject(), vlUI.id); if (r) r.updated = new Date().toISOString(); persist(); toast('Roteiro salvo.'); }
function vsDel(id) { const p = curProject(), r = vsOf(p, id); if (!r || !confirm('Excluir este conjunto de roteiros?')) return; p.video.scripts = p.video.scripts.filter(x => x.id !== id); if (vlUI.id === id) vlUI.id = ''; persist(); renderVideoLab(); }
function vsReset(id, k) { const p = curProject(), r = vsOf(p, id); if (!r || !confirm('Voltar este roteiro ao esqueleto original? O que você escreveu nele se perde.')) return; r.t[k] = vsSkeleton(p, r.src, r.dur)[k]; persist(); renderVideoLab(); }
async function vsCopy() { vsKeep(); try { await navigator.clipboard.writeText($('vsText').value); toast('Copiado.'); } catch (e) { $('vsText').select(); toast('Selecione e copie com Ctrl+C.'); } }
function vsDownload(id) {
  vsKeep(); const p = curProject(), r = vsOf(p, id); if (!r) return;
  download(`roteiros-${slug(r.src.title)}.md`, `# Roteiros · ${r.src.title}\n\nProjeto: ${p.name} · ${r.dur} s\n\n` + VS_KINDS.map(k => `## Roteiro ${VS_LABEL[k].toLowerCase()}\n\n${r.t[k]}\n`).join('\n'), 'text/markdown');
}
const VS_AI = {
  literario: 'Reescreva o ROTEIRO LITERÁRIO: a narrativa e as falas, cena a cena, em português do Brasil, falável e natural. Para cada cena traga tempo, fala (entre aspas) e texto na tela. Mantenha as cenas e os tempos do esqueleto.',
  tecnico: 'Reescreva o ROTEIRO TÉCNICO: para cada cena traga plano, movimento de câmera, lente, iluminação, áudio, elementos em cena e texto na tela, de forma que um operador de câmera execute sem perguntas. Mantenha as cenas e os tempos.',
  gravacao: 'Reescreva o ROTEIRO DE GRAVAÇÃO: um guia prático para quem vai gravar, com preparação, lista de materiais, a ORDEM de gravação (agrupada por local e plano), as marcações de cada take, falas a decorar e dicas de performance. Pensado para quem grava sozinho no celular.',
  edicao: 'Reescreva o ROTEIRO DE EDIÇÃO: linha do tempo com cortes, ritmo, legendas, B-roll sugerido, trilha e efeitos sonoros, transições, capa e exportação. Pensado para um editor que não viu a gravação.'
};
async function vsAI(id, k, quiet) {
  if (!aiReady()) { toast('IA não configurada. Veja Integrações. O esqueleto continua editável.'); return false; }
  vsKeep(); const p = curProject(), r = vsOf(p, id); if (!r) return false;
  try {
    if (!quiet) toast('Escrevendo o roteiro ' + VS_LABEL[k].toLowerCase() + '…');
    skCtx('video', r.src.stage);
    const t = await aiText(`Você é roteirista e diretor de vídeos curtos para redes sociais. ${VS_AI[k]} Não invente fatos, números, preços, depoimentos nem resultados: use [CONFIRMAR] quando faltar informação. Em setores regulados, não prometa resultado. Responda só com o roteiro em texto simples.`,
      `${projectContext(p)}\nÂngulo ou post: ${r.src.title}\nHook: ${r.src.hook}\nÂngulo: ${r.src.angle}\nCTA: ${r.src.cta}\nIdeia de base: ${r.src.base}\nDuração: ${r.dur} s\n\nESQUELETO ATUAL (use como base):\n${r.t[k]}`, 2200);
    if (!t.trim()) throw new Error('a IA devolveu um texto vazio.');
    r.t[k] = t.trim().slice(0, 14000); r.updated = new Date().toISOString(); spendCredits(1); persist(); if (!quiet) { renderVideoLab(); toast('Roteiro ' + VS_LABEL[k].toLowerCase() + ' reescrito. Revise.'); } return true;
  } catch (e) { toast('IA: ' + e.message); return false; }
}
async function vsAIAll(id) {
  if (!aiReady()) { toast('IA não configurada. Veja Integrações. O esqueleto continua editável.'); return; }
  if (!confirm('Reescrever os 4 roteiros com a IA? Gasta 4 créditos e troca o texto atual de cada um.')) return;
  vlUI.busy = true; renderVideoLab(); let n = 0; try { for (const k of VS_KINDS) { toast(`Escrevendo ${n + 1}/4…`); if (await vsAI(id, k, true)) n++; else break; } } finally { vlUI.busy = false; } renderVideoLab(); toast(n + ' de 4 roteiros reescritos. Revise.');
}

/* ---------- tela ---------- */
function vsPickHTML(p) {
  const u = vlUI, concepts = shownConcepts(p).slice(0, 30), cmps = p.campaigns.filter(c => (c.pieces || []).length), cm = cmps.find(c => c.id === u.cmp) || cmps[0];
  const srcs = [['concept', 'Ângulo da Matriz'], ['piece', 'Anúncio da campanha'], ['carousel', 'Carrossel ou post'], ['free', 'Ideia livre']];
  let box = '';
  if (u.src === 'concept') box = concepts.length ? `<select onchange="vlUI.cid=this.value">${concepts.map(c => `<option value="${c.id}" ${c.id === u.cid ? 'selected' : ''}>${esc(c.hook)} × ${esc(c.angle)} · ${esc(c.format)}</option>`).join('')}</select>` : '<p class="muted">Gere conceitos na Matriz de Criação.</p>';
  else if (u.src === 'piece') box = cmps.length ? `<div class="ins-row"><label class="ins">Campanha<select onchange="vlUI.cmp=this.value;vlUI.piece='';renderVideoLab()">${cmps.map(c => `<option value="${c.id}" ${cm && c.id === cm.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label><label class="ins">Anúncio<select onchange="vlUI.piece=this.value">${cm.pieces.map(q => `<option value="${q.id}" ${q.id === u.piece ? 'selected' : ''}>${esc(q.name)} · ${esc(String(q.h).slice(0, 50))}</option>`).join('')}</select></label></div>` : '<p class="muted">Ainda não há campanha com anúncios.</p>';
  else if (u.src === 'carousel') box = p.carousels.length ? `<select onchange="vlUI.car=this.value">${p.carousels.map(c => `<option value="${c.id}" ${c.id === u.car ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>` : '<p class="muted">Ainda não há carrosséis neste projeto.</p>';
  else box = `<div class="form-grid"><div class="field full"><label>Título ou ângulo</label><input id="vsFT" value="${esc(u.ftitle)}" oninput="vlUI.ftitle=this.value" placeholder="Ex.: O que ninguém conta sobre renegociar"></div><div class="field full"><label>Texto ou ideia de base (opcional)</label><textarea id="vsFB" rows="3" oninput="vlUI.fbase=this.value">${esc(u.fbase)}</textarea></div></div>`;
  return `<div class="panel"><h3 style="margin-top:0">De qual ângulo, anúncio ou post?</h3><div class="edh-tabs" style="margin-bottom:8px">${srcs.map(([k, l]) => `<button class="edh-tab ${u.src === k ? 'on' : ''}" onclick="vlUI.src='${k}';renderVideoLab()">${l}</button>`).join('')}</div>${box}
  <div class="row-gap" style="margin-top:10px;align-items:center;flex-wrap:wrap"><label class="muted" style="font-size:12.5px">Duração <select onchange="vlUI.dur=+this.value">${VS_DURS.map(d => `<option value="${d}" ${d === u.dur ? 'selected' : ''}>${d} s</option>`).join('')}</select></label><button class="btn dark" onclick="vsCreate()">Criar os 4 roteiros</button></div>
  <p class="muted" style="font-size:12px;margin:8px 0 0">Literário, técnico, de gravação e de edição nascem do esqueleto do projeto, sem gastar crédito. Depois você reescreve cada um com a IA (1 crédito cada), e as skills de vídeo entram no pedido.</p></div>`;
}
function vsEditHTML(r) {
  const k = vlUI.kind, aiOk = typeof aiReady === 'function' && aiReady();
  return `<div class="panel" style="margin-top:12px"><div class="section-row"><div><strong>${esc(r.src.title)}</strong> <small class="muted">${r.dur} s${r.src.stage ? ' · ' + CMP_STAGE_NAME[r.src.stage] : ''}</small></div><div class="row-gap"><button class="btn sm" onclick="vsDownload('${r.id}')">⬇ Baixar os 4 (.md)</button><button class="btn sm" onclick="vsAIAll('${r.id}')" ${vlUI.busy ? 'disabled' : ''} title="Gasta 4 créditos">✨ Reescrever os 4 com IA</button><button class="btn sm" onclick="vsDel('${r.id}')">Excluir</button></div></div>
  <div class="edh-tabs" style="margin:10px 0">${VS_KINDS.map(x => `<button class="edh-tab ${k === x ? 'on' : ''}" onclick="vsKind('${x}')">${VS_LABEL[x]}</button>`).join('')}</div><p class="muted" style="font-size:12.5px;margin:0 0 6px">${VS_DESC[k]}</p>
  <textarea id="vsText" rows="22" style="width:100%;font-size:12.5px;font-family:ui-monospace,monospace">${esc(r.t[k])}</textarea>
  <div class="row-gap" style="margin-top:8px;flex-wrap:wrap"><button class="btn dark" onclick="vsSave()">Salvar</button><button class="btn" onclick="vsCopy()">Copiar</button><button class="btn" onclick="vsAI('${r.id}','${k}')" ${vlUI.busy ? 'disabled' : ''}>✨ Reescrever este com IA</button><button class="btn" onclick="vsReset('${r.id}','${k}')">Voltar ao esqueleto</button></div>
  ${aiOk ? '' : '<p class="muted" style="font-size:12px;margin:8px 0 0">A IA ainda não está configurada: o esqueleto é seu para editar e copiar.</p>'}</div>`;
}
function vsTabHTML(p) {
  const L = p.video.scripts;
  return vsPickHTML(p) + `<div class="panel" style="margin-top:12px"><h3 style="margin-top:0">Seus roteiros (${L.length})</h3>${L.length ? `<div class="list">${L.map(r => `<div class="list-item"><div><strong>${esc(r.src.title)}</strong><small>${r.dur} s · ${{concept: 'Ângulo da Matriz', piece: 'Anúncio da campanha', carousel: 'Carrossel ou post', free: 'Ideia livre'}[r.src.type]} · ${fmtDate(r.created)}</small></div><button class="btn sm ${vlUI.id === r.id ? '' : 'dark'}" onclick="vsOpen('${r.id}')">${vlUI.id === r.id ? 'Fechar' : 'Abrir os 4'}</button></div>`).join('')}</div>` : '<p class="muted">Nenhum ainda. Escolha acima e clique em "Criar os 4 roteiros".</p>'}</div>` + (vsOf(p, vlUI.id) ? vsEditHTML(vsOf(p, vlUI.id)) : '');
}
const vlBase = renderVideoLab;
renderVideoLab = function () {
  const p = curProject(), r = $('videoRoot'); if (!p) { vlBase(); return; }
  const tabs = `<div class="edh-tabs" style="margin:10px 0">${[['prod', 'Produção do vídeo'], ['roteiros', 'Roteiros (4 tipos)']].map(([k, l]) => `<button class="edh-tab ${vlUI.tab === k ? 'on' : ''}" onclick="vsKeep();vlUI.tab='${k}';renderVideoLab()">${l}${k === 'roteiros' ? ' (' + p.video.scripts.length + ')' : ''}</button>`).join('')}</div>`;
  if (vlUI.tab === 'roteiros') {
    const cs = shownConcepts(p); if (!vlUI.cid && cs[0]) vlUI.cid = cs[0].id; const cm = p.campaigns.find(c => (c.pieces || []).length); if (!vlUI.cmp && cm) vlUI.cmp = cm.id; const cm2 = p.campaigns.find(c => c.id === vlUI.cmp); if (cm2 && !cm2.pieces.some(q => q.id === vlUI.piece)) vlUI.piece = (cm2.pieces[0] || {}).id || ''; if (!vlUI.car && p.carousels[0]) vlUI.car = p.carousels[0].id;
    r.innerHTML = hubHead('Video Lab', 'Quatro roteiros para cada ângulo, anúncio ou post: literário, técnico, de gravação e de edição.', '') + tabs + vsTabHTML(p); return;
  }
  vlBase(); const h = r.firstElementChild; if (h) h.insertAdjacentHTML('afterend', tabs);
};
