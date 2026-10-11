/* Conta do cliente (modo plataforma): entrada obrigatória, "Minha conta" no topo e limite de sites do plano.
   Sem PLATFORM_MODE no servidor, nada disso aparece. O servidor também confere o limite ao salvar. */
const CONTA = {acc: null, owner: false};
const _loadStatus0 = loadStatus;
loadStatus = async function () {
  const st = await _loadStatus0();
  const pl = st && st.platform;
  if (pl && pl.on && /^https?:/.test(location.protocol)) {
    if (needsLogin()) { location.replace('entrar.html'); return st; }
    try { const m = await api('conta.php?action=me'); CONTA.acc = m.account; CONTA.owner = !!m.owner; } catch (e) { /* sem conta */ }
    contaBadge();
  }
  return st;
};
function contaBadge() {
  let b = document.getElementById('contaBtn'); const hdr = document.querySelector('.topbar'); if (!hdr) return;
  if (!b) { b = document.createElement('button'); b.id = 'contaBtn'; b.className = 'top-btn'; b.onclick = contaOpen; const s = document.getElementById('syncBadge'); hdr.insertBefore(b, s || null); }
  b.textContent = CONTA.owner ? '👑 Dono' : '👤 Minha conta';
  const api = document.querySelector('.topbar .top-btn[title="Chaves das APIs"]'); if (api && !CONTA.owner) api.style.display = 'none';
}
function contaSites() { return (state.projects || []).length; }
function contaLimit() { return CONTA.acc ? CONTA.acc.sitesLimit : null; }
function contaOpen() {
  if (CONTA.owner) { showModal('Painel do dono', '<p>Você está como dono do estúdio.</p><div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button><a class="btn dark" href="admin.html">Abrir o painel</a></div>'); return; }
  const a = CONTA.acc; if (!a) { location.href = 'entrar.html'; return; } const n = contaSites(), L = a.sitesLimit;
  showModal('Minha conta', `<p><b>${esc(a.name)}</b><br><span class="muted">${esc(a.email)}</span></p><p style="margin:12px 0">Plano <b>${esc(a.planName)}</b> · R$ ${a.price}/mês<br>Sites: <b>${n}</b> de ${L == null ? 'ilimitados' : L}</p>
    <div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button><a class="btn" href="entrar.html?conta=1">Plano e senha</a><button class="btn dark" onclick="contaSair()">Sair</button></div>`);
}
async function contaSair() { try { await api('conta.php', {method: 'POST', body: {action: 'logout'}}); } catch (e) { /* ok */ } location.href = 'entrar.html'; }
/* limite do plano: avisa antes de abrir o formulário de novo projeto */
function contaLimiteOk() {
  const L = contaLimit(); if (L == null || contaSites() < L) return true;
  showModal('Limite do plano', `<p>O seu plano <b>${esc(CONTA.acc.planName)}</b> permite até <b>${L} sites</b> e você já tem ${contaSites()}.</p><p class="muted" style="margin-top:8px">Para criar mais, mude de plano ou apague um site que não usa mais.</p><div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button><a class="btn dark" href="entrar.html?conta=1">Ver planos</a></div>`);
  return false;
}
const _openWizard0 = openWizard;
openWizard = function (name) { if (!contaLimiteOk()) return; return _openWizard0(name); };
const _createProject0 = createProject;
createProject = function () { if (!contaLimiteOk()) return; return _createProject0.apply(this, arguments); };
