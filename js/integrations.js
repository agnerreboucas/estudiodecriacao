/* Integrações via servidor PHP (api/): login, sincronização, IA, webhook, leads, Meta Ads.
   As chaves ficam só no servidor (api/config.php); o navegador nunca as vê. */
const API = {base: 'api', available: false, status: null, syncing: false, error: ''};

async function api(path, opts = {}) {
  const r = await fetch(API.base + '/' + path, {
    method: opts.method || 'GET', credentials: 'same-origin',
    headers: opts.body ? {'Content-Type': 'application/json'} : {},
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  let j = null; try { j = await r.json(); } catch (e) { /* resposta não é JSON */ }
  if (j === null) { const e = new Error('Servidor sem PHP/API (HTTP ' + r.status + ')'); e.status = r.status; throw e; }
  if (!r.ok) { const e = new Error(j.error || 'HTTP ' + r.status); e.status = r.status; e.data = j; throw e; }
  return j;
}
async function loadStatus() {
  try { API.status = await api('status.php'); API.available = true; } catch (e) { API.status = null; API.available = false; }
  renderSyncBadge();
  return API.status;
}
const needsLogin = () => API.available && API.status.auth.required && !API.status.auth.loggedIn;
const canUseApi = () => API.available && !needsLogin();
const aiReady = () => canUseApi() && !!(API.status.ai && API.status.ai.configured);

const imageReady = () => canUseApi() && !!(API.status.image && API.status.image.configured);
const blobToDataURL = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(b); });
/* Gera imagem pelo servidor (OpenAI). refs = data URLs de fotos de referência (ex.: foto do produto). Devolve Blob PNG. */
async function generateImage({prompt, size = 'square', quality = 'medium', refs = []}) {
  const r = await api('image.php', {method: 'POST', body: {prompt, size, quality, refs}});
  return (await fetch(r.image)).blob();
}

/* ---- login ---- */
function showLogin() {
  showModal('Entrar no Studio', `<p class="muted" style="margin-top:0;font-size:12px">Informe a senha configurada em <span class="mono">api/config.php</span> para liberar sincronização e integrações.</p>
    <div class="field"><label>Senha</label><input id="loginPass" type="password" autocomplete="current-password" onkeydown="if(event.key==='Enter')doLogin()"></div>
    <div class="modal-actions"><button class="btn" onclick="closeModal()">Agora não</button><button class="btn dark" onclick="doLogin()">Entrar</button></div>`);
  setTimeout(() => { const i = $('loginPass'); if (i) i.focus(); }, 50);
}
async function doLogin() {
  try { await api('auth.php', {method: 'POST', body: {action: 'login', password: $('loginPass').value}}); closeModal(); await loadStatus(); toast('Conectado.'); await pullWorkspace(); refreshCurrentView(); }
  catch (e) { toast(e.message); }
}
async function doLogout() { try { await api('auth.php', {method: 'POST', body: {action: 'logout'}}); } catch (e) { /* ok */ } await loadStatus(); refreshCurrentView(); toast('Sessão encerrada.'); }

/* ---- sincronização do workspace (arquivo JSON no servidor) ---- */
const canSync = () => canUseApi() && API.status.sync && API.status.sync.enabled;
const scheduleSync = debounce(() => { if (canSync() && state.meta.dirty) syncNow(false); }, 4000);
function renderSyncBadge() {
  const b = $('syncBadge'); if (!b) return;
  let txt = '● Local', cls = 'local', tip = 'Dados salvos só neste navegador. Exporte um JSON para ter cópia.';
  if (API.available && needsLogin()) { txt = '● Entrar'; cls = 'warn'; tip = 'Entre para sincronizar e usar a IA.'; }
  else if (canSync()) {
    if (API.syncing) { txt = '● Sincronizando…'; cls = 'warn'; }
    else if (state.meta.dirty) { txt = '● Pendente'; cls = 'warn'; tip = 'Alterações ainda não enviadas ao servidor.'; }
    else { txt = '● Sincronizado'; cls = 'ok'; tip = 'Última sincronização: ' + fmtDateTime(state.meta.syncedAt); }
  } else if (API.available) { txt = '● Conectado'; cls = 'ok'; }
  b.textContent = txt; b.className = 'sync-badge ' + cls; b.title = tip;
}
function syncBadgeClick() { if (needsLogin()) showLogin(); else if (canSync()) syncNow(true); else toast('Modo local: use Exportar/Importar em Configurações.'); }
async function syncNow(manual) {
  if (!canSync() || API.syncing) return;
  API.syncing = true; renderSyncBadge();
  try {
    const r = await api('workspace.php', {method: 'PUT', body: {baseRev: state.meta.rev, state}});
    state.meta.rev = r.rev; state.meta.dirty = false; state.meta.syncedAt = Date.now(); flushLocal();
    if (manual) toast('Workspace sincronizado.');
  } catch (e) {
    if (e.status === 409) {
      if (confirm('O servidor tem uma versão mais nova (outro dispositivo?). OK = baixar a versão do servidor; Cancelar = sobrescrever o servidor com esta versão.')) await pullWorkspace(true);
      else { state.meta.rev = e.data.rev; await syncNow(true); }
    } else if (e.status === 401) { await loadStatus(); } else if (manual) toast('Sincronização falhou: ' + e.message);
  } finally { API.syncing = false; renderSyncBadge(); }
}
async function pullWorkspace(force) {
  if (!canSync()) return;
  try {
    const r = await api('workspace.php');
    if (!r.state) { if (state.meta.dirty || state.meta.rev === 0) await syncNow(false); return; }
    if (force || r.rev > state.meta.rev) {
      if (!force && state.meta.dirty && !confirm('Há alterações locais não enviadas e o servidor tem uma versão mais nova. OK = usar a do servidor (perde as locais).')) return;
      state = normalize(r.state); state.meta.rev = r.rev; state.meta.dirty = false; state.meta.syncedAt = Date.now(); flushLocal(); bootRender(); toast('Workspace carregado do servidor.');
    }
  } catch (e) { /* offline: segue local */ }
}

/* ---- IA ---- */
async function aiText(system, user, max = 1500) {
  const j = await api('ai.php', {method: 'POST', body: {system, messages: [{role: 'user', content: user}], max_tokens: max}});
  return j.text || '';
}
async function aiJSON(system, user) {
  const t = await aiText(system + '\nResponda APENAS com JSON válido, sem markdown nem comentários. Escreva em português do Brasil.', user, 2200);
  const s = t.replace(/```json|```/g, '').trim();
  const a = s.search(/[\[{]/), z = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']'));
  try { return JSON.parse(s.slice(a, z + 1)); } catch (e) { throw new Error('a IA devolveu um formato inesperado; tente de novo.'); }
}
function projectContext(p) {
  const pre = p.pre, items = typeof preItems === 'function' ? preItems(pre) : [];
  return [`Projeto: ${p.name}. ${p.desc || ''}`, p.goal ? 'Objetivo do projeto: ' + p.goal : '', pre.briefing ? 'Briefing: ' + pre.briefing : '',
    items.length ? 'Desafios selecionados:\n' + items.map(i => `- ${i.title}`).join('\n') : '',
    pre.diag.scenario ? 'Diagnóstico: ' + [pre.diag.scenario, pre.diag.causal, pre.diag.consequence, pre.diag.need].join(' ') : '',
    pre.objective ? 'Objetivo estratégico: ' + pre.objective : '',
    pre.icps.length ? 'ICPs:\n' + pre.icps.map(x => `- ${x.name}: ${x.profile} | ${x.situation} | ${x.need}` + (x.pains ? ` | Dores: ${String(x.pains).split('\n').slice(0, 4).join('; ')}` : '') + (x.doubts ? ` | Dúvidas: ${String(x.doubts).split('\n').slice(0, 4).join('; ')}` : '') + (x.desires ? ` | Desejos: ${String(x.desires).split('\n').slice(0, 3).join('; ')}` : '') + (x.hidden ? ` | Dores ocultas: ${String(x.hidden).split('\n').slice(0, 3).join('; ')}` : '')).join('\n') : '', (p.products || []).length ? 'Produtos e serviços: ' + p.products.slice(0, 8).map(x => x.name + (x.summary ? ' (' + x.summary.slice(0, 100) + ')' : '')).join('; ') : '',
    p.brief.offer ? 'Oferta: ' + p.brief.offer : '', p.brief.audience ? 'Público: ' + p.brief.audience : '', p.brief.problem ? 'Problema do cliente: ' + p.brief.problem : '',
    p.competitors.some(hasTeardown) ? 'O que o mercado faz (referências): ' + p.competitors.filter(hasTeardown).map(c => `${c.name}: hooks ${(c.teardown.hooks || []).join('; ')}; ângulos ${(c.teardown.angles || []).join('; ')}`).join(' | ') : '',
    p.voice.personality ? 'Personalidade da voz: ' + p.voice.personality : '', p.voice.antivocab ? 'Nunca dizer: ' + p.voice.antivocab : '', p.voice.rules ? 'Regras de escrita: ' + p.voice.rules : '',
    p.brand.tone ? `Tom de voz: ${p.brand.tone}. Regra: ${p.brand.rule}` : '', p.brand.instructions ? 'Instruções de marca: ' + p.brand.instructions : '',
    'Regras: não invente dados, números ou resultados; trate interpretações como hipóteses; não faça promessas absolutas.'].filter(Boolean).join('\n');
}

/* ---- webhook de saída, leads de entrada e Meta Ads ---- */
async function sendWebhook(event, payload) { return api('webhook.php', {method: 'POST', body: {event, payload}}); }
async function fetchLeads() { return (await api('leads.php?action=list')).leads || []; }

/* ---- cartões de integração (aba do projeto e configurações) ---- */
function integrationsHTML() {
  const s = API.status, ok = (b, t1, t2) => `<span class="int-state ${b ? 'on' : ''}">${b ? t1 : t2}</span>`;
  if (!API.available) return `<div class="panel"><h3>Servidor de integrações não encontrado</h3><p>Você está no <b>modo local</b>: tudo funciona e é salvo neste navegador. Para ativar IA, sincronização e captura de leads, hospede a pasta completa em um servidor com PHP (Hostinger) e crie <span class="mono">api/config.php</span> a partir de <span class="mono">api/config.sample.php</span>.</p>${API.error ? `<small class="muted">${esc(API.error)}</small>` : ''}</div>`;
  const loginBox = needsLogin() ? `<div class="panel" style="margin-bottom:12px"><div class="section-row"><div><h3>Sessão</h3><p class="muted">Entre para liberar as integrações.</p></div><button class="btn dark" onclick="showLogin()">Entrar</button></div></div>` : (s.auth.required ? `<div class="panel" style="margin-bottom:12px"><div class="section-row"><div><h3>Sessão ativa</h3></div><button class="btn" onclick="doLogout()">Sair</button></div></div>` : '');
  const leadUrl = location.origin + location.pathname.replace(/[^/]*$/, '') + 'api/leads.php?project=' + (curProject() ? curProject().id : '');
  return loginBox + `<div class="integration-grid">
    <div class="card"><div class="int-ico">${ico('sparkles', 24)}</div><h3>IA de texto · ${s.ai.provider === 'openai' ? 'GPT' : 'Claude'}</h3><p>Hipóteses, diagnóstico, ICPs, jornada, roteiros e copy.</p>${ok(s.ai.configured, 'Configurada · ' + esc(s.ai.model || ''), 'Falta ANTHROPIC_API_KEY')}</div>
    <div class="card"><div class="int-ico">${ico('refresh', 24)}</div><h3>Sincronização</h3><p>Salva o workspace no servidor para abrir em outros dispositivos.</p>${ok(s.sync.enabled, 'Ativa', 'Desativada')}${s.sync.enabled ? `<button class="btn sm" onclick="syncNow(true)">Sincronizar agora</button>` : ''}</div>
    <div class="card"><div class="int-ico">${ico('webhook', 24)}</div><h3>Webhook de saída</h3><p>Envia eventos (aprovação, publicação) para n8n, Make ou Zapier.</p>${ok(s.webhook.configured, 'Configurado', 'Falta WEBHOOK_URL')}${s.webhook.configured ? `<button class="btn sm" onclick="testWebhook()">Enviar teste</button>` : ''}</div>
    <div class="card"><div class="int-ico">${ico('inbox', 24)}</div><h3>Captura de leads</h3><p>Endpoint para formulários, landing pages e webhook do WhatsApp Cloud.</p>${ok(s.leads.configured, 'Ativo', 'Falta LEADS_TOKEN')}${s.leads.configured ? `<small class="mono break">${esc(leadUrl)}&amp;token=SEU_TOKEN</small>` : ''}</div>
    <div class="card"><div class="int-ico">${ico('inbox', 24)}</div><h3>Distribuição de leads</h3><p>Para onde vai cada lead: e-mail do gestor e do vendedor, planilha, CRM e WhatsApp do vendedor.</p>${ok(s.leads.configured, 'Pronta para configurar', 'Falta LEADS_TOKEN')}<button class="btn sm" onclick="routingModal()">Configurar destinos</button></div>
    <div class="card"><div class="int-ico">${ico('image', 24)}</div><h3>Imagens · OpenAI</h3><p>Gera fotos dentro do editor e das variações. Aceita foto do produto como referência.</p>${ok(s.image && s.image.configured, 'Configurado' + (s.image && s.image.model ? ' · ' + esc(s.image.model) : ''), 'Falta OPENAI_API_KEY')}</div>
    <div class="card"><div class="int-ico">${ico('pin', 24)}</div><h3>Google Meu Negócio · Places</h3><p>Radar: endereço, telefone, nota, avaliações e horário dos concorrentes.</p>${ok(s.places && s.places.configured, 'Configurado', 'Falta GOOGLE_PLACES_API_KEY')}</div>
    <div class="card"><div class="int-ico">${ico('target', 24)}</div><h3>Meta Ads · métricas</h3><p>Importa gasto, cliques e leads para a aba Performance.</p>${ok(s.meta.configured, 'Configurado', 'Falta META_ACCESS_TOKEN')}<small class="muted">Código escrito conforme a documentação da Graph API; ainda não validado com conta real.</small></div>
    <div class="card muted-card"><div class="int-ico">${ico('plug', 24)}</div><h3>Instagram · Google Analytics · publicação direta</h3><p>Exigem autorização OAuth por conta. Planejado para a próxima fase; hoje a publicação é preparada aqui e disparada via webhook.</p><span class="int-state">Planejado</span></div>
  </div>`;
}
async function testWebhook() { try { await sendWebhook('teste', {from: 'Ampliação Studio', at: new Date().toISOString()}); toast('Webhook enviado.'); } catch (e) { toast('Webhook: ' + e.message); } }
