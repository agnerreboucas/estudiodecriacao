/* Aba "Produtos" do projeto: ficha completa de cada produto ou serviço (fonte dos fatos para ofertas, anúncios e páginas). */
const prUI = {id: '', open: {0: 1}};
const PR_FORMAT = {'': 'Não definido', online: 'Online', presencial: 'Presencial', fisico: 'Produto físico', hibrido: 'Híbrido'}, PR_STATUS = {ativo: 'Ativo', pausado: 'Pausado', em_breve: 'Em breve'};
const prList = () => curProject().products || (curProject().products = []);
const prGet = id => prList().find(x => x.id === id);
/* campos que contam para o "ficha pronta": [chave, rótulo] */
const PR_CHECK = [['name', 'Nome'], ['summary', 'Descrição'], ['price', 'Preço'], ['audience', 'Para quem serve'], ['notFor', 'Para quem não serve'], ['problems', 'Problemas que resolve'], ['resolveTime', 'Tempo para resolver o problema'], ['delivery', 'Como é entregue'], ['deliveryTime', 'Prazo de entrega'], ['benefits', 'Benefícios'], ['features', 'Características'], ['objections', 'Objeções'], ['differentials', 'Diferenciais'], ['proofs', 'Provas reais']];
function prDone(x) { const miss = PR_CHECK.filter(([k]) => { const v = x[k]; return Array.isArray(v) ? !v.length : !String(v || '').trim() || (k === 'name' && x.name === 'Produto'); }); return {pct: Math.round((PR_CHECK.length - miss.length) / PR_CHECK.length * 100), miss: miss.map(m => m[1])}; }
/* fatos do produto para a IA: só o que foi preenchido */
function prodFacts(x, full) {
  const L = (t, v) => (Array.isArray(v) ? v.length : String(v || '').trim()) ? ` | ${t}: ${Array.isArray(v) ? v.slice(0, 6).join('; ') : String(v).slice(0, 220)}` : '';
  const s = L('Formato', x.format ? PR_FORMAT[x.format] : '') + L('Peso', x.weight) + L('Tamanho', x.size) + L('Duração', x.duration) + L('Inclui', x.includes) + L('Condição de preço', x.priceNote) + L('Pagamento', x.payment) + L('Entrega', x.delivery) + L('Prazo de entrega', x.deliveryTime) + L('Validade', x.validity) + L('Garantia', x.warranty) + L('Serve para', full ? '' : x.audience) + L('NÃO serve para', x.notFor) + L('Problemas que resolve', x.problems) + L('Tempo para resolver', x.resolveTime) + L('Diferenciais', x.differentials) + L('Limites', x.limits);
  return full ? s.replace(/ \| /g, '\n').replace(/^\n?/, '') + (s ? '\n' : '') : s;
}

function prHTML(p) {
  if (prUI.id && prGet(prUI.id)) return prForm(prGet(prUI.id));
  const L = prList();
  return `<div class="panel"><div class="section-row"><div><h3>Produtos e serviços</h3><p class="muted" style="margin:2px 0 0;font-size:12.5px">Liste tudo o que a marca vende. Cada ficha completa fortalece a oferta, os anúncios e as páginas. O Studio só usa o que estiver preenchido.</p></div><div class="row-gap"><button class="btn" onclick="prQuick()">Colar lista</button><button class="btn dark" onclick="prNew()">＋ Novo produto/serviço</button></div></div>
  ${L.length ? `<div class="pr-grid">${L.map(x => { const d = prDone(x); return `<div class="pr-card ${x.status !== 'ativo' ? 'off' : ''}" onclick="prOpen('${x.id}')"><div class="pr-top"><strong>${esc(x.name)}</strong><small>${esc((LP_TYPE_INFO[x.type] || {label: 'Produto físico / catálogo'}).label)}${x.status !== 'ativo' ? ' · ' + PR_STATUS[x.status] : ''}</small></div><p>${esc(x.summary).slice(0, 110) || '<span class="muted">Sem descrição.</span>'}</p><div class="pr-meter"><i style="width:${d.pct}%"></i></div><small class="muted">Ficha ${d.pct}% completa${d.miss.length ? ' · falta: ' + esc(d.miss.slice(0, 3).join(', ')) + (d.miss.length > 3 ? '…' : '') : ''}</small></div>`; }).join('')}</div>` : emptyState('Nenhum produto ainda', 'Clique em “Novo produto/serviço” ou em “Colar lista” para começar.')}</div>`;
}
function prNew() { const x = normalizeProducts([{id: uid('pr'), name: 'Novo produto'}])[0]; x.name = ''; prList().push(x); prUI.id = x.id; prUI.open = {0: 1}; persist(); renderProjectTab(); setTimeout(() => { const n = $('pr_name'); if (n) n.focus(); }, 60); }
function prOpen(id) { prUI.id = id; prUI.open = {0: 1}; renderProjectTab(); window.scrollTo(0, 0); }
function prBack() { const x = prGet(prUI.id); if (x && !x.name.trim() && !x.summary.trim()) prList().splice(prList().indexOf(x), 1); else if (x && !x.name.trim()) x.name = 'Produto'; prUI.id = ''; persist(); renderProjectTab(); }
function prQuick() {
  showModal('Colar lista de produtos e serviços', `<p style="margin-top:0;font-size:13px">Um por linha. Pode colar de uma planilha: <b>nome</b> ou <b>nome ; preço</b> ou <b>nome ; preço ; descrição</b>. Depois você completa a ficha de cada um.</p><textarea id="prQ" rows="9" style="width:100%" placeholder="Consulta inicial ; R$ 250\nMentoria 3 meses ; R$ 3.000 ; Acompanhamento semanal"></textarea><div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="prQuickSave()">Adicionar</button></div>`);
}
function prQuickSave() {
  const rows = $('prQ').value.split('\n').map(l => l.split(/\t|;/).map(c => c.trim())).filter(r => r[0]), L = prList(); let n = 0;
  rows.slice(0, 80).forEach(r => { if (L.some(x => x.name.toLowerCase() === r[0].toLowerCase())) return; L.push(normalizeProducts([{id: uid('pr'), name: r[0], price: r[1] || '', summary: r[2] || ''}])[0]); n++; });
  persist(); closeModal(); renderProjectTab(); toast(n ? n + ' produto(s) adicionado(s).' : 'Nada novo para adicionar.');
}
function prDup(id) { const x = prGet(id), c = JSON.parse(JSON.stringify(x)); c.id = uid('pr'); c.name = x.name + ' (cópia)'; c.created = new Date().toISOString(); prList().push(c); prUI.id = c.id; persist(); renderProjectTab(); }
function prDel(id) { if (!confirm('Excluir este produto? As páginas já criadas continuam.')) return; const L = prList(); L.splice(L.findIndex(x => x.id === id), 1); prUI.id = ''; persist(); renderProjectTab(); }
/* grava direto no objeto a cada mudança */
function prSet(k, v, isLines) { const x = prGet(prUI.id); if (!x) return; x[k] = isLines ? String(v).split('\n').map(t => t.trim()).filter(Boolean) : String(v); prDebounce(); prMeter(); }
let prT; function prDebounce() { clearTimeout(prT); prT = setTimeout(() => { const x = prGet(prUI.id); if (x) { const n = normalizeProducts([x])[0]; Object.assign(x, n); } persist(); }, 400); }
function prMeter() { const x = prGet(prUI.id), d = x && prDone(x), el = $('prMeter'); if (el && d) { el.querySelector('i').style.width = d.pct + '%'; el.nextElementSibling.textContent = `Ficha ${d.pct}% completa${d.miss.length ? ' · falta: ' + d.miss.join(', ') : ' · pronta para oferta'}`; } }
function prToggle(i) { prUI.open[i] = !prUI.open[i]; keepScroll(renderProjectTab); }

function prForm(x) {
  const d = prDone(x), f = (k, l, o = {}) => `<div class="field ${o.full ? 'full' : ''}"><label>${l}</label>${o.area ? `<textarea rows="${o.rows || 3}" id="pr_${k}" placeholder="${esc(o.ph || '')}" oninput="prSet('${k}',this.value,${!!o.lines})">${esc(o.lines ? (x[k] || []).join('\n') : x[k])}</textarea>` : `<input id="pr_${k}" value="${esc(x[k])}" placeholder="${esc(o.ph || '')}" oninput="prSet('${k}',this.value)">`}${o.hint ? `<small class="muted">${o.hint}</small>` : ''}</div>`;
  const sel = (k, l, map) => `<div class="field"><label>${l}</label><select onchange="prSet('${k}',this.value);${k === 'type' ? '' : ''}">${Object.entries(map).map(([a, b]) => `<option value="${a}" ${x[k] === a ? 'selected' : ''}>${esc(b)}</option>`).join('')}</select></div>`;
  const types = {}; ['produto', 'curso', 'ebook', 'servico', 'evento', 'cadastro'].forEach(t => { types[t] = (LP_TYPE_INFO[t] || {label: 'Produto físico / catálogo'}).label; });
  const sec = (i, t, sub, inner) => `<div class="pr-sec ${prUI.open[i] ? 'open' : ''}"><button class="pr-sech" onclick="prToggle(${i})"><b>${t}</b><small>${sub}</small><i>${prUI.open[i] ? '▾' : '▸'}</i></button>${prUI.open[i] ? `<div class="form-grid pr-secb">${inner}</div>` : ''}</div>`;
  return `<div class="panel"><div class="section-row"><div><button class="btn sm" onclick="prBack()">‹ Todos os produtos</button><h3 style="margin:10px 0 2px">${esc(x.name) || 'Novo produto ou serviço'}</h3></div><div class="row-gap"><button class="btn sm" onclick="prSuggest()" ${aiReady() ? '' : 'disabled'} title="Sugere itens a partir da descrição. Tudo vem marcado [CONFIRMAR]">✦ Completar com IA</button><button class="btn sm dark" onclick="lpNewFromProduct('${x.id}')">Criar página</button><button class="btn sm" onclick="prDup('${x.id}')">Duplicar</button><button class="btn sm" onclick="prDel('${x.id}')">Excluir</button></div></div>
  <div class="pr-meter" id="prMeter" style="margin:10px 0 4px"><i style="width:${d.pct}%"></i></div><small class="muted">Ficha ${d.pct}% completa${d.miss.length ? ' · falta: ' + esc(d.miss.join(', ')) : ' · pronta para oferta'}</small>
  ${sec(0, '1 · O básico', 'nome, tipo e descrição', f('name', 'Nome', {full: 1, ph: 'Ex.: Mentoria de 3 meses'}) + sel('type', 'Tipo', types) + sel('status', 'Situação', PR_STATUS) + f('summary', 'Descrição', {full: 1, area: 1, ph: 'O que é, em uma ou duas frases.'}) + f('sku', 'Código interno (opcional)'))}
  ${sec(1, '2 · Características', 'formato, peso, tamanho, duração, o que inclui', sel('format', 'Formato', PR_FORMAT) + f('duration', 'Duração', {ph: 'Ex.: 12 encontros de 1 h · uso por 6 meses'}) + f('weight', 'Peso', {ph: 'Ex.: 350 g'}) + f('size', 'Tamanho / dimensões', {ph: 'Ex.: 20 × 15 × 8 cm'}) + f('includes', 'O que está incluso', {full: 1, area: 1, lines: 1, ph: 'Um por linha', hint: 'Um item por linha.'}) + f('features', 'Outras características', {full: 1, area: 1, lines: 1, ph: 'Um por linha'}))}
  ${sec(2, '3 · Preço e entrega', 'preço, pagamento, entrega, prazo, validade, garantia', f('price', 'Preço', {ph: 'Ex.: R$ 297'}) + f('priceNote', 'Condição do preço', {ph: 'Ex.: ou 3x sem juros'}) + f('payment', 'Formas de pagamento', {full: 1}) + f('delivery', 'Como é entregue', {full: 1, ph: 'Ex.: acesso por e-mail · envio pelos Correios · atendimento no local'}) + f('deliveryTime', 'Prazo de entrega', {ph: 'Ex.: em até 5 dias úteis'}) + f('validity', 'Validade', {ph: 'Ex.: acesso por 12 meses · vence em 6 meses'}) + f('warranty', 'Garantia', {full: 1, ph: 'Só o que existe de verdade'}) + f('checkout', 'Link de compra ou inscrição', {full: 1, ph: 'https://…'}))}
  ${sec(3, '4 · Para quem serve', 'quem serve, quem não serve, problemas e tempo de resolução', f('audience', 'Para quem serve', {full: 1, area: 1}) + f('notFor', 'Para quem NÃO serve', {full: 1, area: 1, hint: 'Dizer isso aumenta a confiança e filtra curiosos.'}) + f('problems', 'Principais problemas que resolve', {full: 1, area: 1, lines: 1, rows: 4, ph: 'Um por linha'}) + f('resolveTime', 'Tempo para resolver o problema', {ph: 'Ex.: primeiros resultados em 30 dias'}) + f('limits', 'Limites e avisos', {full: 1, area: 1, lines: 1, ph: 'Ex.: não substitui acompanhamento médico'}))}
  ${sec(4, '5 · Argumentos de venda', 'benefícios, diferenciais, objeções', f('benefits', 'Benefícios (o que a pessoa ganha)', {full: 1, area: 1, lines: 1, rows: 4, ph: 'Um por linha'}) + f('differentials', 'Diferenciais (por que escolher este)', {full: 1, area: 1, lines: 1, ph: 'Um por linha'}) + f('objections', 'Objeções comuns', {full: 1, area: 1, lines: 1, ph: 'Ex.: Não tenho tempo'}))}
  ${sec(5, '6 · Provas e notas', 'provas reais e observações', f('proofs', 'Provas reais (números, depoimentos autorizados, casos)', {full: 1, area: 1, lines: 1, rows: 4, ph: 'Só o que existe de verdade'}) + f('notes', 'Notas internas', {full: 1, area: 1}))}</div>`;
}
async function prSuggest() {
  const x = prGet(prUI.id); if (!x || !(x.summary || '').trim()) { toast('Escreva a descrição primeiro.'); return; } const btn = event && event.target; if (btn) { btn.disabled = true; btn.textContent = 'Pensando…'; }
  try {
    const j = await aiJSON('Você ajuda a organizar a ficha de um produto ou serviço. Com base SÓ no que foi escrito, sugira itens. Nunca invente números, prazos, preços, garantias, resultados ou fatos. Todo item que for suposição termina com " [CONFIRMAR]". JSON: {"problems":[""],"benefits":[""],"differentials":[""],"objections":[""],"notFor":""}', `Nome: ${x.name}\nDescrição: ${x.summary}\nPúblico: ${x.audience}`);
    ['problems', 'benefits', 'differentials', 'objections'].forEach(k => { const add = (Array.isArray(j[k]) ? j[k] : []).slice(0, 6).map(t => String(t).slice(0, 280)).filter(t => t && !x[k].includes(t)); x[k] = x[k].concat(add).slice(0, 20); });
    if (j.notFor && !x.notFor) x.notFor = String(j.notFor).slice(0, 500); persist(); renderProjectTab(); toast('Sugestões adicionadas, marcadas [CONFIRMAR]. Revise.');
  } catch (e) { toast(e.message); }
  if (btn) { btn.disabled = false; btn.textContent = '✦ Completar com IA'; }
}

TABS.products = prHTML;
