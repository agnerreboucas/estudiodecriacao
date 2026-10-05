/* ===== Video Lab · Roteiros em 4 tipos para cada ângulo de anúncio ou post escolhido =====
   Literário (a fala e a narrativa), técnico (planos, lentes, luz), de gravação (o que fazer na hora de gravar) e de edição (cortes, legendas, trilha).
   Nascem de um esqueleto com os dados do projeto (sem IA, sem crédito) e dá para reescrever cada um com a IA, usando as skills de vídeo. */
const VS_KINDS6 = ['ficha', 'literario', 'gravacao', 'tecnico', 'edicao', 'glossario'];   // ordem fixa da Skill Mestre
const VS_LABEL = {ficha: 'Ficha estratégica', literario: 'Literário', gravacao: 'Gravação', tecnico: 'Técnico', edicao: 'Edição', glossario: 'Glossário'};
const VS_DESC = {ficha: 'O mapa do projeto: por que existe, para quem, onde, como.', literario: 'A história completa, sem termos técnicos.', gravacao: 'Cena a cena, o que precisa ser gravado.', tecnico: 'Tabela de planos com o tempo em intervalos.', edicao: 'Tabela de montagem: cortes, lettering, áudio, efeitos.', glossario: 'Os termos técnicos usados nos roteiros (sempre por último).'};
const vlUI = {useEx: true, tab: 'prod', src: 'concept', cid: '', cmp: '', piece: '', car: '', ftitle: '', fbase: '', dur: 15, id: '', kind: 'ficha', busy: false};
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
const VS_PLAN45 = [['Hook', 4], ['Problema', 6], ['Ideia', 6], ['Solução', 7], ['Prova', 8], ['Objeção', 8], ['CTA', 6]];
function vsPlan(dur) { const plan = dur === 45 ? VS_PLAN45 : (SCENE_PLAN[dur] || SCENE_PLAN[15]); let t = 0; return plan.map(([stage, d], i) => { const r = {stage, a: t, b: t + d, i}; t += d; return r; }); }
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
/* vocabulário da Skill Mestre: um plano e um movimento por tipo de cena, cada um com função narrativa */
const VS_TEC = {Hook: ['Primeiro Plano', 'Push-in'], Problema: ['Plano Médio', 'Estática'], Ideia: ['Close', 'Estática'], 'Solução': ['Plano Detalhe', 'Tilt'], Prova: ['Plano Americano', 'Estática'], 'Objeção': ['Primeiro Plano', 'Estática'], 'Demonstração': ['Plano Detalhe', 'Travelling'], CTA: ['Plano Médio', 'Push-in']};
const VS_WHY = {Hook: 'prende a atenção no rosto', Problema: 'mostra a pessoa dentro da situação', Ideia: 'aproxima para destacar a ideia', 'Solução': 'detalha o que resolve', Prova: 'mostra o corpo e o contexto da prova', 'Objeção': 'aproxima para responder com sinceridade', 'Demonstração': 'acompanha o passo a passo', CTA: 'aproxima na chamada final'};
const vsT = n => String(Math.round(n)).padStart(2, '0');
const vsRange = s => `${vsT(s.a)}–${vsT(s.b)}s`;
const vsCena = s => 'Cena ' + String(s.i + 1).padStart(2, '0');
/* esqueletos: dados do projeto organizados na ordem da Skill Mestre, sem texto inventado (o que falta fica entre colchetes) */
function vsSkeleton(p, src, dur) {
  const plan = vsPlan(dur), ic = (p.pre.icps || [])[0] || {}, pr = (p.products || [])[0] || {}, pain = vsLines(ic.pains)[0], des = vsLines(ic.desires)[0], doubt = vsLines(ic.doubts)[0];
  const ficha = `FICHA ESTRATÉGICA\n\nO que estamos produzindo: vídeo de ${dur} s sobre "${src.title}"\nPor que estamos produzindo: ${src.angle || '[explique o motivo estratégico: qual dor, desejo, dúvida ou urgência oculta do público este vídeo toca]'}\nPara quem: ${ic.name ? ic.name + (ic.profile ? ' · ' + ic.profile : '') : '[defina o público]'}\nEm qual plataforma: [Instagram Reels, Stories, TikTok, YouTube Shorts ou anúncio]\nQual formato: vertical 9:16 (1080 × 1920)\nQual duração: ${dur} s\nQual objetivo: [venda, autoridade, engajamento, alcance, educação ou marca]\nQual ângulo: ${src.angle || '[defina o ângulo]'}\nQual Big Idea: ${src.base || '[a grande ideia em uma frase]'}\nQual promessa: [o que o público leva ao assistir. Não prometa resultado]\nQual Hook: ${src.hook || '[escreva o hook]'}\nQual emoção principal: ${pain ? 'identificação com a dor "' + pain + '"' : '[defina a emoção]'}\nQual CTA: ${src.cta || '[defina a chamada final]'}\nQuem participa: [pessoas que aparecem]\nOnde será gravado: [locação]\nQual estética: ${p.brand && p.brand.visual ? p.brand.visual : '[defina a estética]'}\nQuais referências: [liste]\nQuais restrições: ${p.brand && p.brand.rule ? p.brand.rule : '[orçamento, equipamentos, regras do setor]'}\n\nEsta ficha é o mapa do projeto: os documentos seguintes devem obedecê-la.\n\nObservação de origem: dado observado vem do pré-projeto e do briefing; o que está entre colchetes é decisão sua (hipótese ou inferência criativa).\n`;
  const lit = `ROTEIRO LITERÁRIO\n\nEste texto conta a história inteira, sem termos técnicos. Escreva como prosa corrida.\n\nContexto: ${pain ? 'A pessoa vive esta situação: ' + pain + '.' : '[descreva a situação do público]'}\nPersonagens: [quem aparece e quem é para o público]\nAmbiente: [onde acontece]\nSituação inicial: [como o dia começa]\nConflito: ${src.angle ? 'O que torna isto interessante: ' + src.angle + '.' : '[qual é o conflito]'}${doubt ? '\nA dúvida que trava a pessoa: "' + doubt + '"' : ''}\nDesenvolvimento: [o que acontece em seguida]\nDescoberta: ${pr.summary ? pr.summary.split(/(?<=[.!?])\s/)[0] : '[CONFIRMAR] o que a pessoa descobre sobre o serviço ou produto'}\nTransformação: ${des ? 'Do "' + pain + '" a "' + des + '".' : '[mostre o antes e o depois, sem prometer resultado]'}\nDiálogos e narração: [escreva as falas entre aspas]\nConclusão: [feche a história]\nCTA: ${src.cta || '[chamada final]'}\n\nAbertura sugerida (Hook): "${src.hook || '[escreva]'}"\n`;
  const gr = `ROTEIRO DE GRAVAÇÃO\n\nPara gravar com o celular: lente limpa, vertical, luz no rosto, ambiente sem ruído.\n\n` + plan.map(s => { const f = vsFala(p, src, s.stage), dial = /^\[|^(Fale|Apresente|Mostre|Responda)/.test(f) ? f : '"' + f + '"'; return `${vsCena(s)} · ${s.stage}\n- Local: [onde]\n- Personagem: [quem aparece]\n- Ação: [o que a pessoa faz]\n- Diálogo ou narração: ${dial}\n- Figurino: [roupa]\n- Objetos e props: [liste]\n- Cenário: [como deve estar]\n- Comportamento e expressão: [tom e intenção]\n- B-roll: [imagens de apoio a captar]\n- Material necessário: [equipamento]\n- Observações de produção: grave 2 ou 3 takes e deixe 1 segundo de pausa antes e depois da fala.\n`; }).join('\n') + '\nSe precisar de banco de imagens, arquivo, captura de tela ou animação, escreva aqui qual cena usa e de onde vem.\n';
  const tec = `ROTEIRO TÉCNICO\n\nSó existem aqui as cenas previstas no Roteiro de Gravação.\n\n| Tempo | Cena | Plano | Movimento | Ação | Áudio | Observações |\n|---|---|---|---|---|---|---|\n` + plan.map(s => { const [pl, mv] = VS_TEC[s.stage] || ['Plano Médio', 'Estática']; return `| ${vsRange(s)} | ${vsCena(s)} | ${pl} | ${mv} | ${vsShort(vsFala(p, src, s.stage))} | ${s.stage === 'CTA' ? 'Diálogo e trilha baixa' : 'Diálogo'} | ${VS_WHY[s.stage] || ''} |`; }).join('\n') + '\n\nMantenha rosto e texto dentro da área segura do vertical (fora dos cerca de 250 px do topo e 340 px do rodapé que o Reels e os Stories cobrem). Confira as medidas atuais antes de publicar.\n';
  const ed = `ROTEIRO DE EDIÇÃO\n\nUse só o material previsto na gravação.\n\n| Tempo | Material | Corte | Lettering | Legenda | Áudio | Efeito | Observações |\n|---|---|---|---|---|---|---|---|\n` + plan.map(s => `| ${vsRange(s)} | A-roll ${vsCena(s)} (${s.stage}) | ${s.i === 0 ? 'abrir direto no Hook' : 'corte seco na pausa'} | ${vsShort(vsFala(p, src, s.stage))} | legenda da fala | ${s.stage === 'Hook' ? 'efeito curto de entrada' : s.stage === 'CTA' ? 'trilha sobe levemente' : 'trilha baixa'} | ${s.i === 0 ? 'nenhum' : 'sem efeito'} | [B-roll de apoio, se houver] |`).join('\n') + `\n\nRITMO: cortes nas pausas, sem cena parada por mais de 3 segundos.\nCTA: texto e logo na tela final, trilha reduzida para a fala.\nSafe area: legendas e lettering dentro da área segura.\nCorreção de cor: [defina o padrão da marca].\n\nVERSÕES E EXPORTAÇÃO\n- Vertical 9:16, 1080 × 1920, ${dur} s\n- Com legenda e sem legenda; versão limpa e versão com CTA\n- Outros formatos só se o projeto pedir: 4:5 (1080 × 1350), 1:1 (1080 × 1080), 16:9 (1920 × 1080)\n- Frame rate, codec e formato: [defina conforme a plataforma]\n`;
  const r = {ficha, literario: lit, gravacao: gr, tecnico: tec, edicao: ed}; r.glossario = vsGlossary(r, plan); return r;
}
/* glossário: só os termos que aparecem nos outros documentos, sempre por último */
const VS_TERMS = [['Hook', 'Gancho inicial utilizado para chamar a atenção.'], ['CTA', 'Chamada para ação: o que a pessoa deve fazer depois de assistir.'], ['A-roll', 'Imagem principal, em geral a pessoa falando para a câmera.'], ['B-roll', 'Imagens de apoio que cobrem a fala (mãos, objetos, ambiente).'], ['Plano Geral', 'Mostra o ambiente inteiro e a pessoa pequena dentro dele.'], ['Plano Conjunto', 'Mostra um grupo de pessoas e o espaço ao redor.'], ['Plano Médio', 'Enquadra a pessoa da cintura para cima.'], ['Plano Americano', 'Enquadra a pessoa dos joelhos para cima.'], ['Primeiro Plano', 'Enquadra o rosto e os ombros.'], ['Super Close', 'Aproximação extrema de um detalhe do rosto ou de um objeto (também chamado ECU).'], ['Close', 'Enquadra só o rosto, de perto.'], ['Plano Detalhe', 'Mostra um detalhe pequeno: mãos, objeto, tela.'], ['Pan', 'Câmera gira no próprio eixo na horizontal.'], ['Tilt', 'Câmera gira no próprio eixo na vertical.'], ['Push-in', 'A câmera se aproxima do assunto.'], ['Pull-out', 'A câmera se afasta do assunto.'], ['Dolly', 'Câmera sobre trilho ou base que anda para a frente ou para trás.'], ['Travelling', 'A câmera acompanha o assunto andando ao lado.'], ['Rack Focus', 'Troca o foco de um ponto para outro dentro do mesmo plano.'], ['Zoom', 'Aproximação feita pela lente, sem mover a câmera.'], ['Jump Cut', 'Corte seco que pula um pedaço da mesma tomada.'], ['Cutaway', 'Corte para uma imagem de apoio e volta.'], ['Match Cut', 'Corte que liga duas imagens parecidas na forma ou no movimento.'], ['J-Cut', 'O áudio da próxima cena entra antes da imagem.'], ['L-Cut', 'O áudio da cena anterior continua sobre a imagem seguinte.'], ['Lettering', 'Texto que aparece na tela como elemento gráfico.'], ['Lower Third', 'Faixa de texto no terço inferior da tela (nome, cargo).'], ['Motion Graphics', 'Elementos gráficos animados.'], ['Supers', 'Textos sobrepostos à imagem.'], ['VO', 'Voice Over: voz ou narração ouvida enquanto vemos outras imagens.'], ['SFX', 'Efeitos sonoros.'], ['Sound Design', 'Construção do som do vídeo (efeitos, ambiente, transições).'], ['Fade', 'Transição gradual entre imagem ou áudio e outra imagem ou silêncio.'], ['Speed ramp', 'Aceleração ou desaceleração gradual da imagem.'], ['Trilha', 'Música utilizada para contribuir com o clima emocional.'], ['Room Tone', 'O som de ambiente do local, gravado em silêncio, para cobrir cortes.'], ['Key Light', 'Luz principal da cena.'], ['Fill Light', 'Luz de preenchimento que suaviza as sombras.'], ['Back Light', 'Luz por trás do assunto, separa do fundo.'], ['Rim Light', 'Luz de contorno nas bordas do assunto.'], ['temperatura de cor', 'Tom da luz, mais quente (amarelado) ou mais frio (azulado).'], ['profundidade de campo', 'O quanto da imagem fica nítido, do primeiro plano ao fundo.'], ['9:16', 'Proporção vertical de tela cheia (1080 × 1920).'], ['4:5', 'Proporção vertical de feed (1080 × 1350).'], ['1:1', 'Proporção quadrada (1080 × 1080).'], ['16:9', 'Proporção horizontal (1920 × 1080).']];
function vsGlossary(docs, plan) {
  const body = [docs.ficha, docs.literario, docs.gravacao, docs.tecnico, docs.edicao].join('\n'), tecRows = String(docs.tecnico || '').split('\n').filter(l => /^\| \d/.test(l));
  const esc2 = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), re = t => t === 'Close' ? /(?<!super )(?<![\wÀ-ú])close(?![\wÀ-ú])/i : new RegExp('(?<![\\wÀ-ú])' + esc2(t) + '(?![\\wÀ-ú])', 'i');
  const used = VS_TERMS.filter(([t]) => re(t).test(body));
  const app = t => { const rows = tecRows.filter(l => l.toLowerCase().includes('| ' + t.toLowerCase() + ' |')).map(l => l.split('|')[2].trim() + ' (' + l.split('|')[1].trim() + ')'); return rows.length ? 'usado em ' + rows.join(', ') + '.' : ''; };
  return 'GLOSSÁRIO / VOCABULÁRIO DA PRODUÇÃO\n\nSó entram os termos usados nos roteiros acima.\n\n' + (used.length ? used.map(([t, m]) => `${t}\n${m}${app(t) ? '\nNeste projeto: ' + app(t) : ''}`).join('\n\n---\n\n') : 'Nenhum termo técnico foi usado ainda.') + '\n';
}

/* ---------- ações ---------- */
function vsCreate() {
  const p = curProject(), src = vsSource(p); if (!src) { toast('Escolha o ângulo, o anúncio ou escreva a ideia.'); return; }
  if (p.video.scripts.length >= 60) { toast('Limite de 60 roteiros.'); return; }
  const r = {id: uid('vs'), src, dur: vlUI.dur, t: vsSkeleton(p, src, vlUI.dur), resp: '', ap: Object.fromEntries(VS_KINDS6.map(k => [k, {s: 'Rascunho', at: ''}])), created: new Date().toISOString(), updated: ''};
  p.video.scripts.unshift(r); vlUI.id = r.id; vlUI.kind = 'ficha'; persist(); renderVideoLab(); toast('Os 6 documentos foram montados, na ordem da Skill Mestre. Revise e, se quiser, reescreva com a IA.');
}
function vsLoadExample() {
  const p = curProject(), ex = p.video.scripts.find(x => x.ex); if (ex) { vlUI.id = ex.id; vlUI.kind = 'ficha'; renderVideoLab(); return; }
  if (p.video.scripts.length >= 60) { toast('Limite de 60 roteiros.'); return; }
  const E = VS_EXAMPLE, r = {id: uid('vs'), ex: true, resp: '', ap: Object.fromEntries(VS_KINDS6.map(k => [k, {s: 'Rascunho', at: ''}])), src: {type: 'free', id: '', title: E.title + ' (exemplo)', hook: 'Todos os dias, às seis da tarde, ele colocava uma cadeira na janela.', angle: 'A esperança pode permanecer mesmo quando o tempo passa.', cta: 'Quem você ainda espera?', stage: '', base: 'Curta vertical de storytelling emocional sobre saudade, espera e esperança.'}, dur: E.dur, t: {ficha: E.ficha, literario: E.literario, gravacao: E.gravacao, tecnico: E.tecnico, edicao: E.edicao, glossario: E.glossario}, created: new Date().toISOString(), updated: ''};
  p.video.scripts.unshift(r); vlUI.id = r.id; vlUI.kind = 'ficha'; persist(); renderVideoLab(); toast('Exemplo carregado. É só para consulta e referência: crie os seus acima.');
}
const VS_DOCNAME = {ficha: 'Ficha estratégica', literario: 'Roteiro literário', gravacao: 'Roteiro de gravação', tecnico: 'Roteiro técnico', edicao: 'Roteiro de edição', glossario: 'Glossário'};
const vsSt = (r, k) => ((r.ap || {})[k] || {}).s || 'Rascunho';
const vsResp = (p, r) => (r.resp || (p.workspaceResp) || state.workspace.responsible || '').trim();
function vsSetResp(v) { const p = curProject(), r = vsOf(p, vlUI.id); if (!r) return; r.resp = String(v).trim().slice(0, 80); if (r.resp && !(state.workspace.responsible || '').trim()) state.workspace.responsible = r.resp; persist(); renderVideoLab(); }
function vsSetStatus(id, k, st) {
  vsKeep(); const p = curProject(), r = vsOf(p, id); if (!r) return;
  if (st === 'Aprovado' && !vsResp(p, r)) { toast('Preencha o nome do responsável antes de aprovar: ele vai no cabeçalho do documento.'); return; }
  (r.ap = r.ap || {})[k] = {s: st, at: st === 'Rascunho' ? '' : new Date().toISOString()}; persist(); renderVideoLab(); toast(st === 'Aprovado' ? VS_DOCNAME[k] + ' aprovado. Já dá para baixar em PDF e em Docs.' : VS_DOCNAME[k] + ': ' + st.toLowerCase() + '.');
}
const vsDocData = (r, k) => ({label: VS_DOCNAME[k], title: r.src.title, text: r.t[k], status: vsSt(r, k), approvedAt: ((r.ap || {})[k] || {}).at || ''});
function vsDownloadDoc(id, k, fmt) {
  vsKeep(); const p = curProject(), r = vsOf(p, id); if (!r) return;
  if (vsSt(r, k) !== 'Aprovado') { toast('Aprove o documento para baixar.'); return; }
  const meta = {project: p.name, resp: vsResp(p, r), title: r.src.title}, d = vsDocData(r, k), name = `${slug(p.name)}-${slug(VS_DOCNAME[k])}-${slug(r.src.title)}`;
  if (fmt === 'pdf') download(name + '.pdf', dxPdf([d], meta), 'application/pdf'); else download(name + '.docx', dxDocx([d], meta), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  toast('Baixando ' + VS_DOCNAME[k] + ' em ' + (fmt === 'pdf' ? 'PDF' : 'Docs (.docx)') + '.');
}
function vsDownloadSet(id, fmt) {
  vsKeep(); const p = curProject(), r = vsOf(p, id); if (!r) return;
  if (!VS_KINDS6.every(k => vsSt(r, k) === 'Aprovado')) { toast('Aprove os 6 documentos para baixar o conjunto.'); return; }
  const meta = {project: p.name, resp: vsResp(p, r), title: r.src.title}, docs = VS_KINDS6.map(k => vsDocData(r, k)), name = `${slug(p.name)}-roteiros-${slug(r.src.title)}`;
  if (fmt === 'pdf') download(name + '.pdf', dxPdf(docs, meta), 'application/pdf'); else download(name + '.docx', dxDocx(docs, meta), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}
function vsOpen(id) { vlUI.id = vlUI.id === id ? '' : id; vlUI.kind = 'ficha'; renderVideoLab(); }
function vsKind(k) { vsKeep(); vlUI.kind = k; renderVideoLab(); }
function vsKeep() { const r = vsOf(curProject(), vlUI.id), ta = $('vsText'); if (r && ta) { const nv = ta.value.slice(0, 14000); if (nv !== r.t[vlUI.kind] && vsSt(r, vlUI.kind) !== 'Rascunho') { (r.ap = r.ap || {})[vlUI.kind] = {s: 'Rascunho', at: ''}; toast('Você editou o documento: ele voltou para rascunho e precisa ser aprovado de novo.'); } r.t[vlUI.kind] = nv; } }
function vsSave() { const r0 = vsOf(curProject(), vlUI.id), was = r0 && vsSt(r0, vlUI.kind); vsKeep(); const r = vsOf(curProject(), vlUI.id); if (r) r.updated = new Date().toISOString(); persist(); if (r && was !== vsSt(r, vlUI.kind)) renderVideoLab(); else toast('Roteiro salvo.'); }
function vsDel(id) { const p = curProject(), r = vsOf(p, id); if (!r || !confirm('Excluir este conjunto de roteiros?')) return; p.video.scripts = p.video.scripts.filter(x => x.id !== id); if (vlUI.id === id) vlUI.id = ''; persist(); renderVideoLab(); }
function vsReset(id, k) { const p = curProject(), r = vsOf(p, id); if (!r || !confirm(k === 'glossario' ? 'Refazer o glossário a partir dos roteiros atuais?' : 'Voltar este roteiro ao esqueleto original? O que você escreveu nele se perde.')) return; r.t[k] = k === 'glossario' ? vsGlossary(r.t, vsPlan(r.dur)) : vsSkeleton(p, r.src, r.dur)[k]; (r.ap = r.ap || {})[k] = {s: 'Rascunho', at: ''}; persist(); renderVideoLab(); }
async function vsCopy() { vsKeep(); try { await navigator.clipboard.writeText($('vsText').value); toast('Copiado.'); } catch (e) { $('vsText').select(); toast('Selecione e copie com Ctrl+C.'); } }
function vsDownloadMd(id) {
  vsKeep(); const p = curProject(), r = vsOf(p, id); if (!r) return;
  download(`roteiros-${slug(r.src.title)}.md`, `# Roteiros · ${r.src.title}\n\nProjeto: ${p.name} · ${r.dur} s\n\n` + VS_KINDS6.map(k => `${r.t[k]}\n`).join('\n* * *\n\n'), 'text/markdown');
}
const VS_AI = {
  ficha: 'Reescreva a FICHA ESTRATÉGICA respondendo: o que estamos produzindo, por que, para quem, plataforma, formato, duração, objetivo, ângulo, Big Idea, promessa, Hook, emoção principal, CTA, quem participa, onde será gravado, estética, referências e restrições. Diferencie dado observado, insight, hipótese e inferência criativa.',
  literario: 'Reescreva o ROTEIRO LITERÁRIO: a história completa, compreensível sozinha, em prosa fluida, sem tabela e sem termos técnicos (nada de tipo de plano, movimento de câmera ou código de edição). Descreva contexto, personagens, ambiente, situação inicial, conflito, desenvolvimento, descoberta, transformação, diálogos, narração, ações, conclusão e CTA. Não precisa numerar cenas.',
  gravacao: 'Reescreva o ROTEIRO DE GRAVAÇÃO: organize em Cena 01, Cena 02, Cena 03... e, para cada cena, indique quando relevante local, personagem, ação, diálogo, narração, figurino, objetos e props, cenário, comportamento e expressão, B-roll, material necessário e observações de produção. A equipe precisa conseguir executar.',
  tecnico: 'Reescreva o ROTEIRO TÉCNICO SEMPRE EM TABELA markdown, com a primeira coluna Tempo escrita só como intervalo (00–03s, 03–06s...) e as colunas: Tempo | Cena | Plano | Movimento | Ação | Áudio | Observações. Use o vocabulário: Plano Geral, Plano Conjunto, Plano Médio, Plano Americano, Primeiro Plano, Close, Super Close/ECU, Plano Detalhe; Pan, Tilt, Push-in, Pull-out, Dolly, Travelling, Rack Focus, Zoom. Cada escolha deve ter função narrativa. Use SÓ as cenas do Roteiro de Gravação.',
  edicao: 'Reescreva o ROTEIRO DE EDIÇÃO em tabela markdown: Tempo | Material | Corte | Lettering | Legenda | Áudio | Efeito | Observações. Inclua ordem dos cortes, ritmo, B-roll, A-roll, trilha e SFX, transições, correção de cor, CTA, logo, tela final, safe area, versões e exportação (9:16 1080×1920, 4:5 1080×1350, 1:1 1080×1080, 16:9 1920×1080, conforme o projeto). O editor não pode precisar adivinhar. Use só material previsto na gravação e identifique stock, arquivo, captura de tela ou animação.',
  glossario: 'Reescreva o GLOSSÁRIO / VOCABULÁRIO DA PRODUÇÃO: apenas os termos técnicos que aparecem nos outros documentos. Para cada termo: Termo, Significado e Aplicação neste projeto, quando relevante. Não inclua termos que não foram usados.'
};
const VS_CTX_ORDER = ['ficha', 'literario', 'gravacao', 'tecnico', 'edicao'];
async function vsAI(id, k, quiet) {
  if (!aiReady()) { toast('IA não configurada. Veja Integrações. O esqueleto continua editável.'); return false; }
  vsKeep(); const p = curProject(), r = vsOf(p, id); if (!r) return false;
  try {
    if (!quiet) toast('Escrevendo: ' + VS_LABEL[k].toLowerCase() + '…');
    skCtx('video', r.src.stage);
    const others = VS_CTX_ORDER.filter(x => x !== k).map(x => `--- ${VS_LABEL[x].toUpperCase()} (já existente) ---\n${String(r.t[x]).slice(0, 3500)}`).join('\n\n');
    const t = await aiText(`Você é roteirista e diretor de vídeos curtos para redes sociais. ${VS_AI[k]} Mantenha a cadeia de consistência: ficha, literário, gravação, técnico, edição e glossário não podem se contradizer. Não invente fatos, números, preços, depoimentos nem resultados: use [CONFIRMAR] quando faltar informação. Em setores regulados, não prometa resultado. Responda só com o documento, em texto simples (tabelas em markdown quando pedido).`,
      `${projectContext(p)}\nÂngulo ou post: ${r.src.title}\nHook: ${r.src.hook}\nÂngulo: ${r.src.angle}\nCTA: ${r.src.cta}\nIdeia de base: ${r.src.base}\nDuração: ${r.dur} s\n\nOUTROS DOCUMENTOS (para manter a consistência):\n${others}\n\nESQUELETO ATUAL DESTE DOCUMENTO (use como base):\n${r.t[k]}${vlUI.useEx && VS_EXAMPLE[k] ? `\n\nEXEMPLO DE FORMATO PARA ESTE DOCUMENTO (referência de estrutura e nível de detalhe de outra história; NÃO copie o conteúdo):\n${VS_EXAMPLE[k]}` : ''}`, 2600);
    if (!t.trim()) throw new Error('a IA devolveu um texto vazio.');
    r.t[k] = t.trim().slice(0, 14000); (r.ap = r.ap || {})[k] = {s: 'Rascunho', at: ''}; r.updated = new Date().toISOString(); spendCredits(1); persist(); if (!quiet) { renderVideoLab(); toast('Documento ' + VS_LABEL[k].toLowerCase() + ' reescrito. Revise.'); } return true;
  } catch (e) { toast('IA: ' + e.message); return false; }
}
async function vsAIAll(id) {
  if (!aiReady()) { toast('IA não configurada. Veja Integrações. O esqueleto continua editável.'); return; }
  if (!confirm('Reescrever os 6 documentos com a IA, na ordem da Skill Mestre? Gasta 6 créditos e troca o texto atual de cada um.')) return;
  vlUI.busy = true; renderVideoLab(); let n = 0; try { for (const k of VS_KINDS6) { toast(`Escrevendo ${n + 1}/6…`); if (await vsAI(id, k, true)) n++; else break; } } finally { vlUI.busy = false; } renderVideoLab(); toast(n + ' de 6 documentos reescritos. Revise.');
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
  <div class="row-gap" style="margin-top:10px;align-items:center;flex-wrap:wrap"><label class="muted" style="font-size:12.5px">Duração <select onchange="vlUI.dur=+this.value">${VS_DURS.map(d => `<option value="${d}" ${d === u.dur ? 'selected' : ''}>${d} s</option>`).join('')}</select></label><button class="btn dark" onclick="vsCreate()">Criar os roteiros</button></div>
  <div style="margin-top:8px"><button class="btn sm" onclick="vsLoadExample()">Ver um exemplo completo: A cadeira na janela</button></div><p class="muted" style="font-size:12px;margin:8px 0 0">Os 6 documentos (ficha estratégica, literário, gravação, técnico, edição e glossário) nascem do esqueleto do projeto, na ordem da Skill Mestre, sem gastar crédito. Depois você reescreve cada um com a IA (1 crédito cada), e as skills de vídeo entram no pedido.</p></div>`;
}
function vsEnsure(p, r) { const sk = vsSkeleton(p, r.src, r.dur); VS_KINDS6.forEach(k => { if (!String(r.t[k] || '').trim()) r.t[k] = sk[k]; }); }
function vsApprovalHTML(r, k) {
  const p = curProject(), st = vsSt(r, k), ok = st === 'Aprovado', col = {Rascunho: '#888', Pronto: '#c9952a', Aprovado: '#2e7d4f'}[st], all = VS_KINDS6.every(x => vsSt(r, x) === 'Aprovado'), n = VS_KINDS6.filter(x => vsSt(r, x) === 'Aprovado').length;
  return `<div class="panel" style="margin:0 0 8px;background:transparent"><div class="row-gap" style="flex-wrap:wrap;align-items:center"><label class="muted" style="font-size:12.5px">Responsável (vai no cabeçalho) <input value="${esc(vsResp(p, r))}" placeholder="Nome de quem responde por este roteiro" style="min-width:230px" onchange="vsSetResp(this.value)"></label><span class="cmp-tag" style="background:${col}22;color:${col}">${st}${ok && ((r.ap[k] || {}).at) ? ' em ' + fmtDate(r.ap[k].at) : ''}</span>
  ${ok ? `<button class="btn sm" onclick="vsSetStatus('${r.id}','${k}','Rascunho')">Reabrir para editar</button>` : `<button class="btn sm" onclick="vsSetStatus('${r.id}','${k}','Pronto')" ${st === 'Pronto' ? 'disabled' : ''}>Marcar como pronto</button><button class="btn sm dark" onclick="vsSetStatus('${r.id}','${k}','Aprovado')">Aprovar</button>`}</div>
  <div class="row-gap" style="margin-top:8px;flex-wrap:wrap;align-items:center"><button class="btn sm" onclick="vsDownloadDoc('${r.id}','${k}','pdf')" ${ok ? '' : 'disabled'} title="${ok ? 'Baixar em PDF' : 'Aprove para baixar'}">⬇ PDF</button><button class="btn sm" onclick="vsDownloadDoc('${r.id}','${k}','docx')" ${ok ? '' : 'disabled'} title="${ok ? 'Abre no Word e no Google Docs' : 'Aprove para baixar'}">⬇ Docs (.docx)</button>
  <span class="muted" style="font-size:12px">|</span><button class="btn sm" onclick="vsDownloadSet('${r.id}','pdf')" ${all ? '' : 'disabled'} title="${all ? '' : 'Aprove os 6 documentos'}">⬇ PDF dos 6</button><button class="btn sm" onclick="vsDownloadSet('${r.id}','docx')" ${all ? '' : 'disabled'} title="${all ? '' : 'Aprove os 6 documentos'}">⬇ Docs dos 6</button><small class="muted">${n} de 6 aprovados</small></div>${ok ? '' : '<p class="muted" style="font-size:12px;margin:6px 0 0">O PDF e o Docs saem depois de aprovado, com o nome do projeto e do responsável no cabeçalho.</p>'}</div>`;
}
function vsEditHTML(r) {
  vsEnsure(curProject(), r); const k = vlUI.kind, aiOk = typeof aiReady === 'function' && aiReady();
  return `<div class="panel" style="margin-top:12px"><div class="section-row"><div><strong>${esc(r.src.title)}</strong> <small class="muted">${r.dur} s${r.src.stage ? ' · ' + CMP_STAGE_NAME[r.src.stage] : ''}</small></div><div class="row-gap"><button class="btn sm" onclick="vsDownloadMd('${r.id}')" title="Rascunho de trabalho, sem cabeçalho">⬇ Rascunho .md</button><button class="btn sm" onclick="vsAIAll('${r.id}')" ${vlUI.busy ? 'disabled' : ''} title="Gasta 6 créditos">✨ Reescrever os 6 com IA</button><button class="btn sm" onclick="vsDel('${r.id}')">Excluir</button></div></div>
  <div class="edh-tabs" style="margin:10px 0">${VS_KINDS6.map(x => `<button class="edh-tab ${k === x ? 'on' : ''}" onclick="vsKind('${x}')">${VS_LABEL[x]}</button>`).join('')}</div><p class="muted" style="font-size:12.5px;margin:0 0 6px">${VS_DESC[k]}</p>${vsApprovalHTML(r, k)}
  <textarea id="vsText" rows="22" style="width:100%;font-size:12.5px;font-family:ui-monospace,monospace">${esc(r.t[k])}</textarea>
  <div class="row-gap" style="margin-top:8px;flex-wrap:wrap"><button class="btn dark" onclick="vsSave()">Salvar</button><button class="btn" onclick="vsCopy()">Copiar</button><button class="btn" onclick="vsAI('${r.id}','${k}')" ${vlUI.busy ? 'disabled' : ''}>✨ Reescrever este com IA</button><label style="font-size:12.5px;display:flex;align-items:center;gap:5px" title="Envia junto um exemplo do formato deste documento (mais tokens)"><input type="checkbox" ${vlUI.useEx ? 'checked' : ''} onchange="vlUI.useEx=this.checked"> usar o exemplo como referência de formato</label><button class="btn" onclick="vsReset('${r.id}','${k}')">${k === 'glossario' ? 'Atualizar a partir dos roteiros' : 'Voltar ao esqueleto'}</button></div>
  ${aiOk ? '' : '<p class="muted" style="font-size:12px;margin:8px 0 0">A IA ainda não está configurada: o esqueleto é seu para editar e copiar.</p>'}</div>`;
}
function vsTabHTML(p) {
  const L = p.video.scripts;
  return vsPickHTML(p) + `<div class="panel" style="margin-top:12px"><h3 style="margin-top:0">Seus roteiros (${L.length})</h3>${L.length ? `<div class="list">${L.map(r => `<div class="list-item"><div><strong>${esc(r.src.title)}</strong><small>${r.ex ? '<b>exemplo</b> · ' : ''}${r.dur} s · ${{concept: 'Ângulo da Matriz', piece: 'Anúncio da campanha', carousel: 'Carrossel ou post', free: 'Ideia livre'}[r.src.type]} · ${fmtDate(r.created)}</small></div><button class="btn sm ${vlUI.id === r.id ? '' : 'dark'}" onclick="vsOpen('${r.id}')">${vlUI.id === r.id ? 'Fechar' : 'Abrir'}</button></div>`).join('')}</div>` : '<p class="muted">Nenhum ainda. Escolha acima e clique em "Criar os roteiros".</p>'}</div>` + (vsOf(p, vlUI.id) ? vsEditHTML(vsOf(p, vlUI.id)) : '');
}
const vlBase = renderVideoLab;
renderVideoLab = function () {
  const p = curProject(), r = $('videoRoot'); if (!p) { vlBase(); return; }
  const tabs = `<div class="edh-tabs" style="margin:10px 0">${[['prod', 'Produção do vídeo'], ['roteiros', 'Roteiros (6 documentos)']].map(([k, l]) => `<button class="edh-tab ${vlUI.tab === k ? 'on' : ''}" onclick="vsKeep();vlUI.tab='${k}';renderVideoLab()">${l}${k === 'roteiros' ? ' (' + p.video.scripts.length + ')' : ''}</button>`).join('')}</div>`;
  if (vlUI.tab === 'roteiros') {
    const cs = shownConcepts(p); if (!vlUI.cid && cs[0]) vlUI.cid = cs[0].id; const cm = p.campaigns.find(c => (c.pieces || []).length); if (!vlUI.cmp && cm) vlUI.cmp = cm.id; const cm2 = p.campaigns.find(c => c.id === vlUI.cmp); if (cm2 && !cm2.pieces.some(q => q.id === vlUI.piece)) vlUI.piece = (cm2.pieces[0] || {}).id || ''; if (!vlUI.car && p.carousels[0]) vlUI.car = p.carousels[0].id;
    r.innerHTML = hubHead('Video Lab', 'Os roteiros de cada ângulo, anúncio ou post: ficha estratégica, literário, gravação, técnico, edição e glossário.', '') + tabs + vsTabHTML(p); return;
  }
  vlBase(); const h = r.firstElementChild; if (h) h.insertAdjacentHTML('afterend', tabs);
};
