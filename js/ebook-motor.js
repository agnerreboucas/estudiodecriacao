/* ===== Motor de e-book: ideia/conteúdo + skill → estrutura (aprovação) → texto por capítulo → Editora ou Diagramação ===== */
const mot = {open: false, busy: '', sel: '', skillBuf: null};
const MOT_SKILL_GENERIC = {id: 'sk-generico', name: 'Criador de e-books em série (genérico)', builtin: true, text: `Você é editor(a) e redator(a) de e-books em série, para qualquer nicho. Siga este padrão.
ESTRUTURA do e-book: Apresentação (3-4 parágrafos) → Sumário → 7 capítulos → Plano final (7 itens + checklist) → Conclusão (3 parágrafos) → Bônus e fechamento (lista + texto sobre a coleção + caixa de contato + tagline) → Referências (2 fontes reais e verificáveis, nunca inventadas).
CADA CAPÍTULO: abertura (título + subtítulo de efeito) → caso prático fictício (nome + situação + resolução) → 3 parágrafos de corpo → 1 caixa de apoio (dado, dica prática, alerta ou autocuidado, o tipo mais adequado) → duas colunas "Situações comuns" × "Faça assim" (4 itens cada) → checklist (4 perguntas) → resumo (3 frases-síntese).
REGRAS: tom acolhedor e direto, nunca alarmista; terminologia consistente com o título do livro; NUNCA invente estatísticas, números, leis, estudos ou fatos técnicos: onde faltar base no material do autor, escreva [CONFIRMAR: o que falta]; atue como revisor e aponte inconsistências.`};
const MOT_SKILL_MCS = {id: 'sk-mcs', name: 'Método Cuidado Seguro (coleção da Francisca)', builtin: true, text: `Você escreve para a coleção Método Cuidado Seguro (autora: Prof.ª Mestre Francisca Antonia Almeida da Silva), voltada a cuidadores e famílias de pessoas idosas.
Tom: acolhedor, prático, sem jargão, nunca alarmista. Identidade: Playfair Display (títulos) + Montserrat (corpo).
Cada capítulo: abertura, caso prático fictício (nome + situação + resolução), 3 parágrafos de corpo, 1 caixa de apoio, colunas "Situações comuns" × "Faça assim" (4 itens), checklist de 4 perguntas e resumo de 3 frases. Fechamento com plano final, conclusão, bônus, caixa de contato e referências.
REGRA CLÍNICA: nunca invente dados, doses, protocolos ou estatísticas; use [CONFIRMAR: ...] onde precisar da validação da autora.`};
const motSkills = () => [MOT_SKILL_GENERIC, MOT_SKILL_MCS, ...(state.skills = Array.isArray(state.skills) ? state.skills : [])];
const motM = () => { const eb = typeof ebCur === 'function' && eui.id ? ebCur() : null, h = eb || curProject(); if (!h) return null; if (!h.motor || typeof h.motor !== 'object' || !h.motor.stage || !Array.isArray(h.motor.outline)) h.motor = normalizeMotor(h.motor); return h.motor; };
const motSkillCur = () => { const M = motM(); return motSkills().find(s => s.id === M.skillId) || MOT_SKILL_GENERIC; };
const motSave = () => { persist(); AUTO_AT = Date.now(); };

/* ---------- entrada ---------- */
function motOpen(stage) { bookGoTab('conteudo'); const M = motM(); if (stage && M) { M.stage = stage; renderEditora(); } }
function motClose() { bookTab('conteudo'); }
function motStage(s) { const M = motM(); if (s === 'texto' && !M.approved) { toast('Aprove a estrutura primeiro.'); return; } M.stage = s; motSave(); renderEditora(); }

/* ---------- tela ---------- */
function motRender(r, p) {
  const M = motM(), steps = [['material', '1 · Material'], ['estrutura', '2 · Estrutura'], ['texto', '3 · Texto'], ['enviar', '4 · Enviar']];
  r.innerHTML = edTabs('texto') + `<div class="page-head"><div><h1>Motor de texto</h1><p>Entre com uma ideia ou com o conteúdo bruto, escolha uma skill (o padrão de escrita), aprove a estrutura, deixe a IA escrever capítulo por capítulo, revise e mande para a Editora (4 versões) ou para a Diagramação (livro/revista). Se você já tem o texto pronto, vá direto ao passo 4.</p></div></div>
  <div class="mot-steps">${steps.map(([k, l]) => `<button class="tchip ${M.stage === k ? 'on' : ''}" onclick="motStage('${k}')">${l}</button>`).join('')}</div>
  <div id="motBody">${({material: motMaterial, estrutura: motEstrutura, texto: motTexto, enviar: motEnviar})[M.stage](M)}</div>`;
  if (eui.id) { const t = r.querySelector(':scope > .edh-tabs'), h = r.querySelector(':scope > .page-head'); if (t) t.remove(); if (h) h.remove(); }
}
const motIn = (id, lab, val, ph, rows) => `<div class="field"><label>${lab}</label>${rows ? `<textarea id="${id}" rows="${rows}" placeholder="${esc(ph || '')}" oninput="motSet('${id}',this.value)">${esc(val)}</textarea>` : `<input id="${id}" value="${esc(val)}" placeholder="${esc(ph || '')}" oninput="motSet('${id}',this.value)">`}</div>`;
function motSet(k, v) { const M = motM(); const map = {mIdea: 'idea', mSource: 'source', mAud: 'audience', mTone: 'tone', mTitle: 'title', mSub: 'subtitle', mAuthor: 'author', mFull: 'full'}; if (map[k]) M[map[k]] = v; if (k === 'mN') M.nch = Math.max(3, Math.min(14, Math.round(+v || 7))); motSave(); }

function motMaterial(M) {
  const sk = motSkillCur(), custom = !sk.builtin;
  return `<div class="mot-wrap"><div>
  ${motIn('mIdea', 'Ideia ou tema do e-book', M.idea, 'Ex.: guia para pequenos empreendedores organizarem o financeiro; ou só o assunto', 3)}
  ${motIn('mSource', 'Conteúdo-fonte (opcional): cole aqui o material bruto, anotações, transcrição, texto da autora…', M.source, 'Quanto mais material do autor, menos a IA precisa supor. Aceita arquivo .txt/.md abaixo.', 12)}
  <div class="row-gap" style="margin-bottom:10px"><input type="file" accept=".txt,.md,text/plain" onchange="motFile(this)"><small class="muted">${M.source.length.toLocaleString('pt-BR')} caracteres</small></div>
  <div class="form-grid">${motIn('mAud', 'Público-alvo (ICP)', M.audience, 'Quem vai ler')}${motIn('mTone', 'Tom e pedidos extras', M.tone, 'Ex.: acolhedor, exemplos do dia a dia')}${motIn('mTitle', 'Título provisório', M.title, '')}${motIn('mAuthor', 'Autor(a) e credencial', M.author, '')}</div>
  <div class="field"><label>Capítulos</label><input id="mN" type="number" min="3" max="14" value="${M.nch}" style="width:90px" oninput="motSet('mN',this.value)"></div>
  <div class="row-gap" style="flex-wrap:wrap"><button class="btn dark" onclick="motGenOutline()" ${mot.busy ? 'disabled' : ''}>${mot.busy === 'outline' ? 'Gerando…' : '✦ Gerar estrutura com IA'}</button><button class="btn" onclick="motStage('enviar')">Já tenho o texto completo →</button></div></div>
  <div><div class="okr-label">SKILL (PADRÃO DE ESCRITA)</div><div class="field"><select onchange="motPickSkill(this.value)">${motSkills().map(s => `<option value="${esc(s.id)}" ${s.id === sk.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
  <div class="field"><label>Instruções da skill ${sk.builtin ? '(padrão do Studio: duplique para editar)' : ''}</label><textarea id="skText" rows="14" ${sk.builtin ? 'readonly' : ''}>${esc(sk.text)}</textarea></div>
  <div class="row-gap" style="flex-wrap:wrap">${custom ? `<button class="btn sm dark" onclick="motSkillSave()">Salvar alterações</button><button class="btn sm" onclick="motSkillDel()">Excluir</button>` : `<button class="btn sm" onclick="motSkillDup()">Duplicar para editar</button>`}<button class="btn sm" onclick="motSkillUpload()">Subir skill (.md/.txt)</button></div>
  <small class="muted block" style="margin-top:6px">Uma skill é só o texto com o seu método: estrutura, tom, regras. A IA segue esse texto em todos os capítulos. Fica guardada no workspace e vale para todos os projetos.</small></div></div>`;
}
async function motFile(inp) { const f = inp.files[0]; if (!f) return; const t = await f.text(), M = motM(); M.source = (M.source ? M.source + '\n\n' : '') + t.slice(0, 60000); motSave(); renderEditora(); }
function motPickSkill(id) { motM().skillId = id; motSave(); renderEditora(); }
function motSkillDup() { const s = motSkillCur(), k = {id: uid('sk'), name: s.name + ' (cópia)', text: s.text}; state.skills.push(k); motM().skillId = k.id; motSave(); renderEditora(); }
function motSkillSave() { const s = state.skills.find(x => x.id === motM().skillId); if (!s) return; s.text = $('skText').value.slice(0, 30000); const n = prompt('Nome da skill:', s.name); if (n) s.name = n.slice(0, 80); motSave(); renderEditora(); toast('Skill salva.'); }
function motSkillDel() { const s = state.skills.find(x => x.id === motM().skillId); if (!s || !confirm('Excluir a skill “' + s.name + '”?')) return; state.skills = state.skills.filter(x => x.id !== s.id); motM().skillId = ''; motSave(); renderEditora(); }
function motSkillUpload() { const i = document.createElement('input'); i.type = 'file'; i.accept = '.md,.txt,text/plain,text/markdown'; i.onchange = async () => { const f = i.files[0]; if (!f) return; let t = await f.text(); t = t.replace(/^---[\s\S]*?---\s*/, ''); const k = {id: uid('sk'), name: f.name.replace(/\.[a-z]+$/i, '').slice(0, 80), text: t.slice(0, 30000)}; state.skills.push(k); motM().skillId = k.id; motSave(); renderEditora(); toast('Skill “' + k.name + '” carregada.'); }; i.click(); }

/* ---------- IA ---------- */
const MOT_GRAMMAR = `FORMATO DE SAÍDA do texto de capítulo (use só isto):
# Título do capítulo
## Subtítulo de efeito (a primeira linha "##" logo após o título)
Parágrafos separados por linha em branco (texto corrido, sem markdown além de **negrito** e *itálico*).
## Intertítulo (quando a seção precisar)
- item de lista   (ou 1. item numerado)
> caso: texto do caso prático (nome + situação + resolução)
> dica: ...   > atencao: ...   > sabia: ...   > cuide: ...   > nota: ...   (use a caixa mais adequada)
@comuns: situação comum (4 linhas @comuns:)
@faca: faça assim (4 linhas @faca:)
[ ] pergunta do checklist (4 linhas)
[v] frase-síntese do resumo (3 linhas)`;
function motSystem() { return motSkillCur().text + '\n\nRegras fixas: escreva em português do Brasil; não invente estatísticas, números, leis, estudos ou fatos técnicos; onde faltar base no material fornecido escreva [CONFIRMAR: o que falta]; trate o material do autor como fonte principal.'; }
const motCtx = M => [M.idea && 'IDEIA/TEMA: ' + M.idea, M.audience && 'PÚBLICO: ' + M.audience, M.tone && 'TOM/PEDIDOS: ' + M.tone, M.author && 'AUTOR(A): ' + M.author, M.source && 'MATERIAL DO AUTOR (fonte principal):\n' + M.source.slice(0, 24000)].filter(Boolean).join('\n\n');
async function motJSON(system, user, max) {
  const t = await aiText(system + '\nResponda APENAS com JSON válido, sem markdown nem comentários.', user, max || 4000), s = t.replace(/```json|```/g, '').trim(), a = s.search(/[\[{]/), z = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']'));
  try { return JSON.parse(s.slice(a, z + 1)); } catch (e) { throw new Error('a IA devolveu um formato inesperado; tente de novo.'); }
}
const motErr = e => e.status === 503 ? 'A IA não está configurada no servidor (ANTHROPIC_API_KEY em api/config.php).' : 'Falhou: ' + e.message;
async function motGenOutline(extra) {
  const M = motM(); if (!M.idea.trim() && !M.source.trim()) { toast('Escreva a ideia ou cole um conteúdo-fonte.'); return; }
  mot.busy = 'outline'; renderEditora();
  try {
    const j = await motJSON(motSystem(), `${motCtx(M)}\n\n${extra ? 'AJUSTE PEDIDO PELO AUTOR: ' + extra + '\n\n' : ''}Proponha a estrutura de um e-book com ${M.nch} capítulos (além de apresentação e fechamento, que já são padrão). JSON: {"title":"...","subtitle":"...","chapters":[{"title":"...","summary":"1-2 frases do que o capítulo resolve","points":["ponto-chave 1","ponto-chave 2","ponto-chave 3"]}]}. Use só o que o material sustenta; não invente fatos.`, 4000);
    const ch = (Array.isArray(j.chapters) ? j.chapters : []).slice(0, 14).map(c => ({id: uid('mc'), title: String(c.title || '').slice(0, 160), summary: String(c.summary || '').slice(0, 800), points: (Array.isArray(c.points) ? c.points : []).slice(0, 12).map(x => String(x).slice(0, 240))}));
    if (!ch.length) throw new Error('a IA não devolveu capítulos.');
    M.outline = ch; M.chapters = {}; M.approved = false; M.title = String(j.title || M.title).slice(0, 200); M.subtitle = String(j.subtitle || M.subtitle).slice(0, 300); M.stage = 'estrutura';
  } catch (e) { toast(motErr(e)); }
  mot.busy = ''; motSave(); renderEditora();
}
async function motWrite(id, instruction) {
  const M = motM(), i = M.outline.findIndex(c => c.id === id), c = M.outline[i]; if (!c) return; mot.busy = id; motRefreshCard(id);
  try {
    const prev = i > 0 ? (M.chapters[M.outline[i - 1].id] || '').slice(-700) : '';
    const t = await aiText(motSystem(), `${motCtx(M)}\n\nE-BOOK: ${M.title}${M.subtitle ? ' — ' + M.subtitle : ''}\nESTRUTURA COMPLETA:\n${M.outline.map((q, k) => `${k + 1}. ${q.title}: ${q.summary}`).join('\n')}\n\nESCREVA O CAPÍTULO ${i + 1}: "${c.title}"\nResumo: ${c.summary}\nPontos-chave: ${c.points.join('; ')}\n${prev ? 'Final do capítulo anterior (para dar continuidade, sem repetir):\n' + prev + '\n' : ''}${instruction ? 'INSTRUÇÃO DO AUTOR PARA ESTA VERSÃO: ' + instruction + '\n' : ''}\n${MOT_GRAMMAR}`, 4500);
    M.chapters[id] = t.replace(/```[a-z]*|```/g, '').trim();
  } catch (e) { toast(motErr(e)); }
  mot.busy = ''; motSave(); motRefreshCard(id);
}
async function motWriteAll() { const M = motM(), has = M.outline.some(c => M.chapters[c.id]), redo = has && confirm('Já existem capítulos escritos. OK = reescrever todos; Cancelar = escrever só os que faltam.'); for (const c of M.outline) { if (M.chapters[c.id] && !redo) continue; await motWrite(c.id); } toast('Capítulos escritos. Revise cada um antes de enviar.'); }

/* ---------- estrutura ---------- */
function motEstrutura(M) {
  return `<div class="form-grid">${motIn('mTitle', 'Título', M.title, '')}${motIn('mSub', 'Subtítulo', M.subtitle, '')}</div>
  <div class="okr-label">CAPÍTULOS (edite, reordene, apague ou acrescente)</div>${M.outline.map((c, i) => `<div class="mot-ch"><div class="row-gap" style="justify-content:space-between"><b>Capítulo ${i + 1}</b><span class="row-gap"><button class="btn sm" onclick="motMove(${i},-1)">↑</button><button class="btn sm" onclick="motMove(${i},1)">↓</button><button class="btn sm" onclick="motDelCh(${i})">${ico('trash', 13)}</button></span></div>
  <input value="${esc(c.title)}" onchange="motEdit(${i},'title',this.value)" style="width:100%;margin:6px 0"><textarea rows="2" onchange="motEdit(${i},'summary',this.value)" placeholder="O que este capítulo resolve">${esc(c.summary)}</textarea><textarea rows="3" onchange="motEdit(${i},'points',this.value)" placeholder="Pontos-chave, um por linha">${esc(c.points.join('\n'))}</textarea></div>`).join('') || '<p class="muted">Sem capítulos ainda. Volte ao passo 1 e gere a estrutura, ou adicione manualmente.</p>'}
  <div class="row-gap" style="flex-wrap:wrap;margin-top:8px"><button class="btn sm" onclick="motAddCh()">＋ Capítulo</button><input id="mAdj" placeholder="Pedir ajuste à IA (ex.: juntar os capítulos 3 e 4; foco em iniciantes)" style="flex:1;min-width:240px"><button class="btn sm" onclick="motGenOutline($('mAdj').value)" ${mot.busy ? 'disabled' : ''}>✦ Refazer a estrutura</button></div>
  <div class="row-gap" style="margin-top:12px"><button class="btn dark" onclick="motApprove()" ${M.outline.length ? '' : 'disabled'}>✔ Aprovar estrutura e ir para o texto</button></div>`;
}
function motEdit(i, k, v) { const c = motM().outline[i]; c[k] = k === 'points' ? v.split('\n').map(x => x.trim()).filter(Boolean).slice(0, 12) : v; motSave(); }
function motMove(i, d) { const a = motM().outline, j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; motSave(); renderEditora(); }
function motDelCh(i) { const M = motM(), c = M.outline[i]; if (!confirm('Excluir o capítulo “' + c.title + '”?')) return; M.outline.splice(i, 1); delete M.chapters[c.id]; motSave(); renderEditora(); }
function motAddCh() { motM().outline.push({id: uid('mc'), title: 'Novo capítulo', summary: '', points: []}); motSave(); renderEditora(); }
function motApprove() { const M = motM(); M.approved = true; M.stage = 'texto'; motSave(); renderEditora(); }

/* ---------- texto ---------- */
const motConf = t => (String(t || '').match(/\[CONFIRMAR/g) || []).length;
function motCard(M, c, i) {
  const t = M.chapters[c.id] || '', busy = mot.busy === c.id, n = t.split(/\s+/).filter(Boolean).length;
  return `<div class="mot-ch" id="motC-${esc(c.id)}"><div class="row-gap" style="justify-content:space-between;flex-wrap:wrap"><b>${i + 1}. ${esc(c.title)}</b><small class="muted">${t ? n + ' palavras' + (motConf(t) ? ` · <b style="color:#b45309">${motConf(t)} [CONFIRMAR]</b>` : '') : 'ainda não escrito'}</small></div>
  <textarea rows="${t ? 14 : 3}" placeholder="O texto do capítulo aparece aqui. Você pode escrever ou editar à mão." oninput="motChText('${esc(c.id)}',this.value)">${esc(t)}</textarea>
  <div class="row-gap" style="margin-top:6px;flex-wrap:wrap"><button class="btn sm dark" onclick="motWrite('${esc(c.id)}')" ${mot.busy ? 'disabled' : ''}>${busy ? 'Escrevendo…' : t ? '✦ Reescrever' : '✦ Escrever este capítulo'}</button><input id="mI-${esc(c.id)}" placeholder="Instrução para reescrever (ex.: mais curto, exemplo diferente)" style="flex:1;min-width:200px"><button class="btn sm" onclick="motWrite('${esc(c.id)}',$('mI-${esc(c.id)}').value)" ${mot.busy || !t ? 'disabled' : ''}>Reescrever com instrução</button></div></div>`;
}
function motTexto(M) {
  const done = M.outline.filter(c => (M.chapters[c.id] || '').trim()).length;
  return `<div class="row-gap" style="flex-wrap:wrap;margin-bottom:10px"><button class="btn dark" onclick="motWriteAll()" ${mot.busy ? 'disabled' : ''}>✦ Escrever todos os capítulos</button><small class="muted">${done} de ${M.outline.length} escritos · a IA usa só o seu material; o que faltar vem marcado com [CONFIRMAR]</small><span style="flex:1"></span><button class="btn" onclick="motStage('enviar')">Ir para o envio →</button></div><div id="motCards">${M.outline.map((c, i) => motCard(M, c, i)).join('')}</div>`;
}
function motChText(id, v) { motM().chapters[id] = v.slice(0, 40000); motSave(); }
function motRefreshCard(id) { const M = motM(), i = M.outline.findIndex(c => c.id === id), el = $('motC-' + id); if (!el || i < 0) { if (!el) renderEditora(); return; } const tmp = document.createElement('div'); tmp.innerHTML = motCard(M, M.outline[i], i); el.replaceWith(tmp.firstElementChild); document.querySelectorAll('#motCards button, #motCards input').forEach(b => { if (mot.busy && b.tagName === 'BUTTON') b.disabled = true; }); }

/* ---------- enviar ---------- */
function motAssemble(M) { return M.outline.map(c => (M.chapters[c.id] || '').trim()).filter(Boolean).join('\n\n'); }
function motEnviar(M) {
  const asm = motAssemble(M); if (asm && !M.full) M.full = asm; const txt = M.full || '';
  return `<p class="muted" style="font-size:13px;margin-top:0">Este é o texto completo. ${asm ? 'Veio dos capítulos aprovados; você ainda pode editar aqui.' : 'Cole o seu texto pronto aqui (com # para capítulos, ## para subtítulos, > dica: para caixas…).'} Depois escolha o destino.</p>
  ${asm ? `<div class="row-gap" style="margin-bottom:6px"><button class="btn sm" onclick="motReassemble()">Recompor a partir dos capítulos</button></div>` : ''}
  <textarea id="mFull" rows="18" style="width:100%;font-size:13px" oninput="motSet('mFull',this.value);motCountUpd()">${esc(txt)}</textarea><small class="muted" id="motCnt">${motCountTxt(txt)}</small>
  <div class="mot-wrap" style="margin-top:12px"><div class="mot-ch"><b>Aplicar no e-book</b><p class="muted" style="font-size:12.5px">O texto entra na estrutura do e-book (capítulos, caixas, checklists e resumo, nas versões celular, tablet, A4 P&B e A4 econômico) e já vai diagramado para o miolo.</p><div class="form-grid">${motIn('mTitle', 'Título', M.title, '')}${motIn('mAuthor', 'Autor(a)', M.author, '')}</div><div class="row-gap" style="flex-wrap:wrap"><button class="btn dark" onclick="motApplyBook(true)">Aplicar na estrutura e no miolo</button><button class="btn" onclick="motApplyBook(false)">Só na estrutura do e-book</button></div></div>
  <div class="mot-ch"><b>Próximos passos</b><ol style="margin:6px 0 0 18px;padding:0;font-size:12.5px;line-height:1.7"><li>Aba <b>2 · Capa</b>: escolha um layout, uma referência ou crie do zero.</li><li>Aba <b>3 · Miolo</b>: a diagramação do livro, com grade, colunas e modelos de página.</li><li>Aba <b>Áudio</b>: narração do livro com voz de IA.</li><li>Aba <b>Publicar</b>: Amazon KDP, EPUB e flipbook.</li></ol></div></div>
  <div class="row-gap" style="margin-top:8px"><button class="btn sm" onclick="motDownMd()">Baixar .md</button></div>`;
}
const motCountTxt = t => `${String(t || '').split(/\s+/).filter(Boolean).length.toLocaleString('pt-BR')} palavras · ${(String(t || '').match(/^# /gm) || []).length} capítulo(s) · ${motConf(t)} marca(s) [CONFIRMAR]`;
function motCountUpd() { const e = $('motCnt'); if (e) e.textContent = motCountTxt(motM().full); }
function motReassemble() { const M = motM(); M.full = motAssemble(M); motSave(); renderEditora(); }
function motDownMd() { const M = motM(); download((M.title || 'ebook').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.md', M.full || motAssemble(M), 'text/markdown'); }
function motApplyBook(withMiolo) {
  const M = motM(), eb = ebCur(), t = (M.full || '').trim(); if (!eb) return; if (!t) { toast('Não há texto para aplicar.'); return; }
  if (eb.sections.some(s => s.type === 'chapter' && (s.blocks || []).some(b => b.text && !/^\[/.test(b.text))) && !confirm('O e-book já tem capítulos escritos. Substituir os capítulos pelo texto do motor?')) return;
  const n = bookApplyText(eb, t); if (!n) return; if (withMiolo) { const d = bookEnsureMiolo(eb, (eb.kdp && eb.kdp.trim) || 'kdp6x9'); bookSyncMiolo(eb, true); if (eb.coverSetId && !d.front) bookCoverToMiolo(true); }
  toast(n + ' capítulo(s) aplicados' + (withMiolo ? ' na estrutura e no miolo.' : ' na estrutura do e-book.')); eui.bt = withMiolo ? 'miolo' : 'versoes'; renderEditora();
}
/* texto com marcações da Editora → matéria da Diagramação */
function motToStory(text) {
  const out = [], BOX = {caso: 'Caso', dica: 'Dica', atencao: 'Atenção', 'atenção': 'Atenção', sabia: 'Você sabia?', cuide: 'Cuide-se', nota: 'Nota'}; let para = [], firstH1 = true;
  const flush = () => { if (para.length) out.push({k: 'p', st: 'body', t: para.join(' ').trim()}); para = []; };
  for (const raw of String(text || '').replace(/\r/g, '').split('\n')) {
    const ln = raw.trim(); let m;
    if (!ln) { flush(); continue; }
    if ((m = ln.match(/^#\s+(.+)/))) { flush(); if (!firstH1) out.push({k: 'break'}); firstH1 = false; out.push({k: 'p', st: 'h1', t: m[1]}); continue; }
    if ((m = ln.match(/^##\s+(.+)/))) { flush(); out.push({k: 'p', st: 'h2', t: m[1]}); continue; }
    if ((m = ln.match(/^###\s+(.+)/))) { flush(); out.push({k: 'p', st: 'h3', t: m[1]}); continue; }
    if ((m = ln.match(/^>\s*([\p{L}]+)\s*:\s*(.+)/u)) && BOX[m[1].toLowerCase()]) { flush(); out.push({k: 'p', st: 'quote', t: `**${BOX[m[1].toLowerCase()]}:** ${m[2]}`}); continue; }
    if ((m = ln.match(/^>\s?(.+)/))) { flush(); out.push({k: 'p', st: 'quote', t: m[1]}); continue; }
    if ((m = ln.match(/^\[ \]\s*(.+)/))) { flush(); out.push({k: 'p', st: 'list', t: '☐ ' + m[1]}); continue; }
    if ((m = ln.match(/^\[[vVxX✔]\]\s*(.+)/))) { flush(); out.push({k: 'p', st: 'list', t: '✔ ' + m[1]}); continue; }
    if ((m = ln.match(/^@comuns?\s*:\s*(.+)/i))) { flush(); out.push({k: 'p', st: 'list', t: '✗ ' + m[1]}); continue; }
    if ((m = ln.match(/^@fa[cç]a\s*:\s*(.+)/i))) { flush(); out.push({k: 'p', st: 'list', t: '✓ ' + m[1]}); continue; }
    if ((m = ln.match(/^(?:[-•*]|\d+[.)])\s+(.+)/))) { flush(); out.push({k: 'p', st: 'list', t: '• ' + m[1]}); continue; }
    para.push(ln);
  }
  flush(); return out;
}
