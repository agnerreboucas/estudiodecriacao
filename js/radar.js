/* Radar de concorrentes e referências: lê um site público, extrai o que o mercado faz e alimenta a Matriz (hooks e ângulos).
   Serve para entender padrões e oportunidades. As peças geradas devem ser originais, nunca cópias de terceiros. */
const TD_TEXT = [['product', 'Produto / serviço'], ['offer', 'Oferta e promessa'], ['typography', 'Tipografia'], ['layout', 'Layout e estilo visual'], ['colors', 'Cores']];
const TD_LIST = [['hooks', 'Hooks / títulos que usam'], ['angles', 'Ângulos de comunicação'], ['ctas', 'CTAs'], ['proof', 'Provas e garantias'], ['opportunities', 'Lacunas e oportunidades para nós']];
const lines = v => (Array.isArray(v) ? v : String(v || '').split('\n')).map(s => String(s).trim()).filter(Boolean);

async function radarFetchScan(url) { return (await api('analyze.php', {method: 'POST', body: {url}})).scan; }
const comp = (p, id) => p.competitors.find(c => c.id === id);
const hasTeardown = c => !!(c.teardown && (c.teardown.product || c.teardown.offer || (c.teardown.hooks || []).length));

function radarHTML(p) {
  const list = p.competitors, all = {hooks: [], angles: []};
  list.forEach(c => { if (c.teardown) ['hooks', 'angles'].forEach(k => (c.teardown[k] || []).forEach(x => { if (!all[k].some(y => y.toLowerCase() === x.toLowerCase())) all[k].push(x); })); });
  return `<div class="section-row"><div><h2 style="margin:0">Radar de concorrentes</h2><p class="muted" style="margin:4px 0 0;font-size:12px">Entenda o que já funciona no mercado e transforme em conceitos próprios. Use como referência, nunca para copiar textos, imagens ou marcas de terceiros.</p></div><button class="btn dark" onclick="radarModal('')">＋ Concorrente</button></div>
  ${list.length ? `<div class="radar-grid">${list.map(c => radarCard(c)).join('')}</div>` : emptyState('Nenhum concorrente ainda', 'Cadastre 2 a 5 concorrentes diretos ou referências. O Studio lê o site público de cada um e extrai produto, oferta, hooks, tipografia e cores.', '<button class="btn dark" onclick="radarModal(\'\')">＋ Adicionar o primeiro</button>')}
  ${all.hooks.length || all.angles.length ? `<div class="panel" style="margin-top:14px"><div class="section-row"><div><h3>O que funciona no mercado ${tag('hipotese')}</h3><p class="muted" style="font-size:11px">Padrões encontrados nas análises. São hipóteses: confirme com os seus próprios testes.</p></div><button class="btn dark sm" onclick="radarToMatrix()">Enviar para a Matriz →</button></div>
    <div class="two"><div><div class="okr-label">HOOKS</div>${all.hooks.map(x => `<span class="jp-tag">${esc(x)}</span>`).join('') || '<small class="muted">—</small>'}</div><div><div class="okr-label">ÂNGULOS</div>${all.angles.map(x => `<span class="jp-tag">${esc(x)}</span>`).join('') || '<small class="muted">—</small>'}</div></div></div>` : ''}`;
}
function radarCard(c) {
  const s = c.scan, t = c.teardown;
  return `<article class="radar-card"><div class="section-row"><div><strong>${esc(c.name)}</strong><small class="muted block">${esc(c.url)}</small></div><div class="row-gap"><button class="btn sm" onclick="radarModal('${c.id}')">Editar</button><button class="btn sm" onclick="radarDelete('${c.id}')">×</button></div></div>
    <div class="row-gap" style="margin:10px 0"><button class="btn sm" onclick="radarScan('${c.id}')">${s ? '↻ Reler site' : '⌕ Ler site'}</button><button class="btn sm" onclick="radarFill('${c.id}')" ${s ? '' : 'disabled'} title="Preenche a análise com o que foi lido">Preencher da leitura</button><button class="btn sm dark" onclick="radarAI('${c.id}')">✦ Analisar com IA</button><button class="btn sm" onclick="radarEdit('${c.id}')">Editar análise</button></div>
    ${s ? `<div class="scan-box"><small class="muted">Lido em ${fmtDateTime(s.at)}</small><div class="kv"><span>Título</span><strong>${esc(s.title) || '—'}</strong></div>
      ${s.colors.length ? `<div class="kv"><span>Cores</span><strong class="swatches">${s.colors.map(x => `<i style="background:${esc(x)}" title="${esc(x)}"></i>`).join('')}<small>${s.colors.map(esc).join(' ')}</small></strong></div>` : ''}
      ${s.fonts.length ? `<div class="kv"><span>Fontes</span><strong>${s.fonts.map(esc).join(', ')}</strong></div>` : ''}
      ${s.headings.length ? `<div class="kv"><span>Títulos</span><strong>${s.headings.slice(0, 4).map(esc).join(' · ')}</strong></div>` : ''}
      ${s.ctas.length ? `<div class="kv"><span>CTAs</span><strong>${s.ctas.slice(0, 5).map(esc).join(' · ')}</strong></div>` : ''}</div>` : '<p class="muted" style="font-size:11px">Site ainda não lido.</p>'}
    ${t && hasTeardown(c) ? `<div class="teardown"><div class="section-row"><b>Análise</b>${tag(t.source === 'ai' ? 'recomendacao' : 'hipotese')}</div>${TD_TEXT.filter(([k]) => t[k]).map(([k, l]) => `<div class="kv"><span>${l}</span><strong>${esc(t[k])}</strong></div>`).join('')}${TD_LIST.filter(([k]) => (t[k] || []).length).map(([k, l]) => `<div class="kv"><span>${l}</span><strong>${t[k].map(esc).join(' · ')}</strong></div>`).join('')}</div>` : ''}
    ${c.social || c.notes ? `<small class="muted block" style="margin-top:8px">${c.social ? 'Redes: ' + esc(c.social) : ''}${c.social && c.notes ? ' · ' : ''}${c.notes ? esc(c.notes) : ''}</small>` : ''}</article>`;
}
function radarModal(id) {
  const c = id ? comp(curProject(), id) : {name: '', url: '', social: '', notes: ''};
  showModal(id ? 'Editar concorrente' : 'Novo concorrente', `<div class="form-grid"><div class="field"><label>Nome *</label><input id="rdName" value="${esc(c.name)}"></div><div class="field"><label>Site (URL) *</label><input id="rdUrl" value="${esc(c.url)}" placeholder="https://concorrente.com.br"></div>
    <div class="field full"><label>Redes sociais (links ou @)</label><input id="rdSocial" value="${esc(c.social)}" placeholder="@concorrente, instagram.com/..."></div><div class="field full"><label>Observações</label><textarea id="rdNotes" rows="2">${esc(c.notes)}</textarea></div></div>
    <p class="muted" style="font-size:11px">O Studio lê só a página informada (uma requisição pública), sem rastrear o site. Redes sociais ficam registradas para a sua consulta.</p>
    <div class="modal-actions"><button class="btn dark" onclick="radarSave('${id}')">Salvar</button></div>`);
}
function radarSave(id) {
  const p = curProject(), name = $('rdName').value.trim(), url = $('rdUrl').value.trim();
  if (!name || !url) { toast('Informe nome e site.'); return; }
  const o = {name, url, social: $('rdSocial').value.trim(), notes: $('rdNotes').value.trim()};
  if (id) { const c = comp(p, id); if (c.url !== url) c.scan = null; Object.assign(c, o); } else p.competitors.push(Object.assign({id: uid('cp'), scan: null, teardown: null, addedAt: new Date().toISOString()}, o));
  persist(); closeModal(); renderProjectTab(); toast('Concorrente salvo.');
}
function radarDelete(id) { if (!confirm('Remover este concorrente e a análise dele?')) return; const p = curProject(); p.competitors = p.competitors.filter(c => c.id !== id); persist(); renderProjectTab(); }
async function radarScan(id) {
  if (!canUseApi()) { toast(needsLogin() ? 'Entre para ler sites.' : 'A leitura de sites exige o servidor PHP (veja Integrações). Você pode preencher a análise manualmente.'); return; }
  const c = comp(curProject(), id); toast('Lendo ' + c.url + '…');
  try { c.scan = await radarFetchScan(c.url); persist(); renderProjectTab(); toast('Site lido. Agora preencha ou peça a análise.'); } catch (e) { toast('Leitura falhou: ' + e.message); }
}
function radarFill(id) {
  const c = comp(curProject(), id), s = c.scan; if (!s) return;
  const t = c.teardown || {}; c.teardown = Object.assign({product: '', offer: '', hooks: [], angles: [], typography: '', layout: '', colors: '', ctas: [], proof: [], opportunities: []}, t);
  if (!c.teardown.product) c.teardown.product = s.title; if (!c.teardown.offer) c.teardown.offer = s.description;
  if (!c.teardown.hooks.length) c.teardown.hooks = s.headings.slice(0, 3); if (!c.teardown.ctas.length) c.teardown.ctas = s.ctas.slice(0, 5);
  if (!c.teardown.typography) c.teardown.typography = s.fonts.join(', '); if (!c.teardown.colors) c.teardown.colors = s.colors.join(' ');
  c.teardown.source = c.teardown.source || 'leitura'; c.teardown.at = new Date().toISOString(); persist(); renderProjectTab(); toast('Análise preenchida com o que foi lido. Complete layout, ângulos e lacunas.');
}
async function radarAI(id) {
  if (!aiReady()) { toast('IA não configurada. Veja Integrações. Dá para usar "Preencher da leitura" e editar à mão.'); return; }
  const p = curProject(), c = comp(p, id);
  try {
    toast('Analisando…');
    const j = await aiJSON('Você faz engenharia reversa de estratégia de marketing a partir de dados públicos de um site. Descreva PADRÕES (hooks, ângulos, estrutura), nunca copie frases literais longas. Não invente: se um dado não existe, deixe vazio. Responda só JSON: {"product","offer","hooks":["..."],"angles":["..."],"typography","layout","colors","ctas":["..."],"proof":["..."],"opportunities":["lacunas que o nosso projeto pode explorar"]}. Hooks e ângulos devem ser curtos (até 6 palavras).',
      `Nosso projeto:\n${projectContext(p)}\n\nConcorrente: ${c.name} (${c.url}). Notas: ${c.notes}\nDados lidos do site: ${JSON.stringify(c.scan || {})}`);
    c.teardown = {product: String(j.product || ''), offer: String(j.offer || ''), hooks: lines(j.hooks).slice(0, 8), angles: lines(j.angles).slice(0, 8), typography: String(j.typography || ''), layout: String(j.layout || ''), colors: String(j.colors || ''), ctas: lines(j.ctas).slice(0, 8), proof: lines(j.proof).slice(0, 6), opportunities: lines(j.opportunities).slice(0, 6), source: 'ai', at: new Date().toISOString()};
    spendCredits(1); persist(); renderProjectTab(); toast('Análise pronta. É hipótese: revise e confirme com testes.');
  } catch (e) { toast('IA: ' + e.message); }
}
function radarEdit(id) {
  const c = comp(curProject(), id), t = c.teardown || {};
  showModal('Análise · ' + c.name, `<div class="form-grid">${TD_TEXT.map(([k, l]) => `<div class="field full"><label>${l}</label><input id="td_${k}" value="${esc(t[k] || '')}"></div>`).join('')}${TD_LIST.map(([k, l]) => `<div class="field full"><label>${l} <small class="muted">(um por linha)</small></label><textarea id="td_${k}" rows="3">${esc((t[k] || []).join('\n'))}</textarea></div>`).join('')}</div><div class="modal-actions"><button class="btn dark" onclick="radarEditSave('${id}')">Salvar análise</button></div>`);
}
function radarEditSave(id) {
  const c = comp(curProject(), id), t = {source: 'manual', at: new Date().toISOString()};
  TD_TEXT.forEach(([k]) => t[k] = $('td_' + k).value.trim()); TD_LIST.forEach(([k]) => t[k] = lines($('td_' + k).value)); c.teardown = t; persist(); closeModal(); renderProjectTab();
}
/* ponte com a Matriz: hooks e ângulos do mercado viram opções (já selecionadas) */
function radarToMatrix() {
  const p = curProject(), sel = ensureSel(p); let n = 0; p.matrix.custom = p.matrix.custom || {};
  const add = (k, v) => { v = String(v).trim().slice(0, 40); if (!v) return; const has = optionsOf(p, k).some(x => x.toLowerCase() === v.toLowerCase()); if (has) return; (p.matrix.custom[k] = p.matrix.custom[k] || []).push(v); sel[k].push(v); n++; };
  p.competitors.forEach(c => { if (c.teardown) { (c.teardown.hooks || []).forEach(x => add('hooks', x)); (c.teardown.angles || []).forEach(x => add('angles', x)); (c.teardown.ctas || []).forEach(x => add('ctas', x)); } });
  persist(); toast(n ? `${n} opção(ões) do mercado adicionada(s) à Matriz.` : 'Nada novo para adicionar.'); if (n) go('matrix');
}
