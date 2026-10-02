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
  list.forEach(c => { dos(c).ads.forEach(a => { const h = (a.hook || '').trim(); if (h && !all.hooks.some(y => y.toLowerCase() === h.toLowerCase())) all.hooks.push(h); }); if (c.teardown) ['hooks', 'angles'].forEach(k => (c.teardown[k] || []).forEach(x => { if (!all[k].some(y => y.toLowerCase() === x.toLowerCase())) all[k].push(x); })); });
  return `<div class="section-row"><div><h2 style="margin:0">Radar de concorrentes</h2><p class="muted" style="margin:4px 0 0;font-size:12px">Entenda o que já funciona no mercado e transforme em conceitos próprios. Use como referência, nunca para copiar textos, imagens ou marcas de terceiros.</p></div><button class="btn dark" onclick="radarModal('')">＋ Concorrente</button></div>
  ${list.length ? `<div class="radar-grid">${list.map(c => radarCard(c)).join('')}</div>` : emptyState('Nenhum concorrente ainda', 'Cadastre 2 a 5 concorrentes diretos ou referências. O Studio lê o site público de cada um e extrai produto, oferta, hooks, tipografia e cores.', '<button class="btn dark" onclick="radarModal(\'\')">＋ Adicionar o primeiro</button>')}
  ${all.hooks.length || all.angles.length ? `<div class="panel" style="margin-top:14px"><div class="section-row"><div><h3>O que funciona no mercado ${tag('hipotese')}</h3><p class="muted" style="font-size:11px">Padrões encontrados nas análises. São hipóteses: confirme com os seus próprios testes.</p></div><button class="btn dark sm" onclick="radarToMatrix()">Enviar para a Matriz →</button></div>
    <div class="two"><div><div class="okr-label">HOOKS</div>${all.hooks.map(x => `<span class="jp-tag">${esc(x)}</span>`).join('') || '<small class="muted">—</small>'}</div><div><div class="okr-label">ÂNGULOS</div>${all.angles.map(x => `<span class="jp-tag">${esc(x)}</span>`).join('') || '<small class="muted">—</small>'}</div></div></div>` : ''}`;
}
function radarCard(c) {
  const s = c.scan, t = c.teardown;
  return `<article class="radar-card"><div class="section-row"><div><strong>${esc(c.name)}</strong><small class="muted block">${esc(c.url)}</small></div><div class="row-gap"><button class="btn sm" onclick="radarModal('${c.id}')">Editar</button><button class="btn sm" onclick="radarDelete('${c.id}')">×</button></div></div>
    <div class="row-gap" style="margin:10px 0"><button class="btn sm" onclick="radarScan('${c.id}')">${s ? '↻ Reler site' : '⌕ Ler site'}</button><button class="btn sm" onclick="radarFill('${c.id}')" ${s ? '' : 'disabled'} title="Preenche a análise com o que foi lido">Preencher da leitura</button><button class="btn sm dark" onclick="radarAI('${c.id}')">✦ Analisar com IA</button><button class="btn sm" onclick="radarEdit('${c.id}')">Editar análise</button></div>
    ${dossierBlock(c)}
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
      `Nosso projeto:\n${projectContext(p)}\n\nConcorrente: ${c.name} (${c.url}). Notas: ${c.notes}\nDados lidos do site: ${JSON.stringify(c.scan || {})}\nGoogle Meu Negócio: ${JSON.stringify(dos(c).gmb)}\nInstagram (anotado por nós): ${JSON.stringify(dos(c).ig)}\nAnúncios observados: ${JSON.stringify(dos(c).ads.map(a => ({plataforma: a.platform, formato: a.format, hook: a.hook, oferta: a.offer, cta: a.cta})))}`);
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
  p.competitors.forEach(c => { if (c.teardown) { (c.teardown.hooks || []).forEach(x => add('hooks', x)); (c.teardown.angles || []).forEach(x => add('angles', x)); (c.teardown.ctas || []).forEach(x => add('ctas', x)); } dos(c).ads.forEach(a => add('hooks', a.hook)); });
  persist(); toast(n ? `${n} opção(ões) do mercado adicionada(s) à Matriz.` : 'Nada novo para adicionar.'); if (n) go('matrix');
}

/* ---- dossiê: Google Meu Negócio, Instagram e anúncios observados ---- */
const GMB_FIELDS = [['name', 'Nome no Google'], ['address', 'Endereço'], ['phone', 'Telefone'], ['rating', 'Nota (0–5)'], ['reviews', 'Nº de avaliações'], ['categories', 'Categoria'], ['hours', 'Horário'], ['website', 'Site'], ['mapsUrl', 'Link do Google Maps']];
const AD_PLATFORMS = ['Meta (Instagram/Facebook)', 'Google (Search/YouTube)', 'TikTok', 'LinkedIn', 'Outro'], AD_FORMATS = ['Imagem', 'Carrossel', 'Vídeo', 'Stories/Reels', 'Texto'];
function dos(c) {
  c.dossier = c.dossier || {}; const d = c.dossier;
  d.gmb = d.gmb || {}; d.ig = d.ig || {}; d.ads = d.ads || []; return d;
}
const adLibUrl = c => 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&search_type=keyword_unordered&q=' + encodeURIComponent(c.name);
const gAdsUrl = c => { let d = ''; try { d = new URL(/^https?:/i.test(c.url) ? c.url : 'https://' + c.url).hostname.replace(/^www\./, ''); } catch (e) { /* url inválida */ } return 'https://adstransparency.google.com/?region=BR' + (d ? '&domain=' + encodeURIComponent(d) : ''); };
const mapsUrl = c => { const g = dos(c).gmb; return g.mapsUrl || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((g.name || c.name) + ' ' + (g.address || '')); };
const igUrl = c => { const h = String(dos(c).ig.handle || c.social || '').trim(); if (/^https?:/i.test(h)) return h; const m = h.match(/@?([A-Za-z0-9._]{2,30})/); return m ? 'https://www.instagram.com/' + m[1] + '/' : ''; };
function dossierMeter(c) {
  const d = dos(c), parts = [['Site', !!c.scan], ['Google Meu Negócio', !!(d.gmb.address || d.gmb.rating || d.gmb.phone)], ['Instagram', !!(d.ig.handle || d.ig.followers || d.ig.bio)], ['Anúncios', d.ads.length > 0]];
  return {parts, done: parts.filter(x => x[1]).length};
}
function dossierBlock(c) {
  const m = dossierMeter(c), d = dos(c), g = d.gmb;
  return `<div class="dossier"><div class="section-row"><b>Levantamento</b><small class="muted">${m.done}/4 completo</small></div>
    <div class="row-gap">${m.parts.map(([l, ok]) => `<span class="dchip ${ok ? 'on' : ''}">${ok ? '✓' : '○'} ${l}${l === 'Anúncios' && ok ? ' (' + d.ads.length + ')' : ''}</span>`).join('')}<button class="btn sm" onclick="dossierModal('${c.id}')">Abrir dossiê</button></div>
    ${g.address ? `<small class="muted block" style="margin-top:6px">📍 ${esc(g.address)}${g.rating ? ' · ★ ' + esc(g.rating) + (g.reviews ? ' (' + esc(g.reviews) + ')' : '') : ''}${g.phone ? ' · ' + esc(g.phone) : ''}</small>` : ''}
    ${d.ads.length ? `<small class="muted block" style="margin-top:4px">Anúncios observados: ${d.ads.slice(0, 3).map(a => esc(a.hook || a.offer || a.format)).join(' · ')}</small>` : ''}</div>`;
}
function dossierModal(id, keep) {
  const c = comp(curProject(), id), d = dos(c), g = d.gmb, ig = d.ig, f = (k, l, v, cls) => `<div class="field ${cls || ''}"><label>${l}</label><input id="gm_${k}" value="${esc(v == null ? '' : v)}"></div>`;
  showModal('Dossiê · ' + c.name, `<div class="dossier-modal">
    <h3>Google Meu Negócio</h3><div class="row-gap" style="margin-bottom:8px"><button class="btn sm dark" onclick="dossierPlaces('${id}')">⌖ Buscar no Google</button><a class="btn sm" href="${esc(mapsUrl(c))}" target="_blank" rel="noopener noreferrer">Abrir no Maps</a><small class="muted">A busca usa a API oficial do Google Places (exige chave). Sem ela, preencha à mão.</small></div>
    <div class="form-grid">${GMB_FIELDS.map(([k, l]) => f(k, l, g[k], ['address', 'hours', 'mapsUrl'].includes(k) ? 'full' : '')).join('')}</div>
    <h3 style="margin-top:16px">Instagram</h3><div class="row-gap" style="margin-bottom:8px">${igUrl(c) ? `<a class="btn sm" href="${esc(igUrl(c))}" target="_blank" rel="noopener noreferrer">Abrir perfil</a>` : ''}<small class="muted">O Instagram não permite leitura automática de perfis de terceiros: registre o que você observa.</small></div>
    <div class="form-grid"><div class="field"><label>@ ou link</label><input id="ig_handle" value="${esc(ig.handle || c.social || '')}"></div><div class="field"><label>Seguidores</label><input id="ig_followers" value="${esc(ig.followers || '')}"></div><div class="field"><label>Frequência de posts</label><input id="ig_freq" value="${esc(ig.freq || '')}" placeholder="Ex.: 4 por semana"></div><div class="field"><label>Formatos que mais usam</label><input id="ig_formats" value="${esc(ig.formats || '')}" placeholder="Reels, carrossel..."></div><div class="field full"><label>Bio e posicionamento</label><textarea id="ig_bio" rows="2">${esc(ig.bio || '')}</textarea></div><div class="field full"><label>O que engaja / o que repetem</label><textarea id="ig_notes" rows="2">${esc(ig.notes || '')}</textarea></div></div>
    <h3 style="margin-top:16px">Anúncios observados</h3><div class="row-gap" style="margin-bottom:8px"><a class="btn sm" href="${esc(adLibUrl(c))}" target="_blank" rel="noopener noreferrer">Biblioteca de Anúncios da Meta</a><a class="btn sm" href="${esc(gAdsUrl(c))}" target="_blank" rel="noopener noreferrer">Central de Transparência do Google</a></div>
    <div class="list">${d.ads.map(a => `<div class="list-item"><div><strong>${esc(a.hook || a.offer || 'Anúncio')}</strong><small>${esc(a.platform)} · ${esc(a.format)}${a.offer ? ' · ' + esc(a.offer) : ''}${a.cta ? ' · CTA: ' + esc(a.cta) : ''}</small></div><button class="btn sm" onclick="dossierAdDel('${id}','${a.id}')">×</button></div>`).join('') || '<p class="muted" style="font-size:11px">Nenhum anúncio registrado. Abra as bibliotecas acima, observe os ativos e anote os padrões.</p>'}</div>
    <div class="form-grid" style="margin-top:8px"><div class="field"><label>Plataforma</label><select id="ad_platform">${AD_PLATFORMS.map(x => `<option>${x}</option>`).join('')}</select></div><div class="field"><label>Formato</label><select id="ad_format">${AD_FORMATS.map(x => `<option>${x}</option>`).join('')}</select></div><div class="field full"><label>Hook / título do anúncio</label><input id="ad_hook"></div><div class="field"><label>Oferta</label><input id="ad_offer"></div><div class="field"><label>CTA</label><input id="ad_cta"></div><div class="field full"><label>Link do anúncio (opcional)</label><input id="ad_url"></div></div>
    <div class="modal-actions" style="justify-content:space-between"><button class="btn" onclick="dossierAdAdd('${id}')">＋ Registrar anúncio</button><button class="btn dark" onclick="dossierSave('${id}')">Salvar dossiê</button></div></div>`);
}
function dossierRead(c) {
  const d = dos(c); GMB_FIELDS.forEach(([k]) => { const v = $('gm_' + k); if (v) d.gmb[k] = v.value.trim(); });
  d.ig = {handle: $('ig_handle').value.trim(), followers: $('ig_followers').value.trim(), freq: $('ig_freq').value.trim(), formats: $('ig_formats').value.trim(), bio: $('ig_bio').value.trim(), notes: $('ig_notes').value.trim()};
}
function dossierSave(id) { const c = comp(curProject(), id); dossierRead(c); persist(); closeModal(); renderProjectTab(); toast('Dossiê salvo.'); }
function dossierAdAdd(id) {
  const c = comp(curProject(), id), hook = $('ad_hook').value.trim(), offer = $('ad_offer').value.trim(); if (!hook && !offer) { toast('Informe ao menos o hook ou a oferta do anúncio.'); return; }
  dossierRead(c); dos(c).ads.push({id: uid('ad'), platform: $('ad_platform').value, format: $('ad_format').value, hook, offer, cta: $('ad_cta').value.trim(), url: $('ad_url').value.trim(), seen: today()}); persist(); dossierModal(id);
}
function dossierAdDel(id, adId) { const c = comp(curProject(), id); dossierRead(c); const d = dos(c); d.ads = d.ads.filter(a => a.id !== adId); persist(); dossierModal(id); }
async function dossierPlaces(id) {
  const c = comp(curProject(), id); dossierRead(c);
  if (!canUseApi() || !API.status.places || !API.status.places.configured) { toast('Google Places não configurado. Preencha à mão ou veja Integrações.'); return; }
  const q = ($('gm_name').value.trim() || c.name) + ' ' + ($('gm_address').value.trim());
  try {
    toast('Buscando no Google…'); const j = await api('places.php', {method: 'POST', body: {query: q.trim()}});
    if (!j.places.length) { toast('Nada encontrado. Inclua a cidade no nome.'); return; }
    window.__placesPick = j.places;
    if (j.places.length === 1) return dossierApplyPlace(id, 0);
    showModal('Qual é o estabelecimento?', `<div class="list">${j.places.map((x, i) => `<div class="list-item clickable" onclick="dossierApplyPlace('${id}',${i})"><div><strong>${esc(x.name)}</strong><small>${esc(x.address)}${x.rating ? ' · ★ ' + x.rating : ''}</small></div><span>→</span></div>`).join('')}</div>`);
  } catch (e) { toast('Google: ' + e.message); }
}
function dossierApplyPlace(id, i) {
  const c = comp(curProject(), id), x = window.__placesPick[i], g = dos(c).gmb;
  Object.assign(g, {name: x.name, address: x.address, phone: x.phone, rating: x.rating == null ? '' : x.rating, reviews: x.reviews == null ? '' : x.reviews, categories: x.categories, hours: x.hours, website: x.website, mapsUrl: x.mapsUrl, at: new Date().toISOString(), source: 'google'});
  persist(); dossierModal(id); toast('Dados do Google preenchidos. Confira antes de salvar.');
}
