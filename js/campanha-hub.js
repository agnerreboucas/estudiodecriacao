/* ===== Campanha completa: a visão geral do fluxo e as abas de roteiros de vídeo, Stories e landing page =====
   Reúne no mesmo lugar tudo o que a campanha precisa: textos, anúncios nas 3 medidas, roteiros, Stories, landing page, logo e teste. */
const cmpGo = t => { cmpUI.tab = t; cmpRender(); };
const cmpScripts = (p, c) => p.video.scripts.filter(r => r.src.type === 'piece' && c.pieces.some(q => q.id === r.src.id));
const cmpPlans = (p, c) => p.stories.filter(x => x.cid === c.id);
const cmpLands = (p, c) => (c.landings || []).map(id => p.landings.find(l => l.id === id)).filter(Boolean);
function cmpGeralHTML(p, c) {
  const lists = CMP_KINDS.reduce((a, k) => a + c.bank[k].length, 0), artes = c.pieces.reduce((a, q) => a + CMP_MEASURES.filter(k => q.on[k] && q.sets[k]).length, 0), apr = c.pieces.filter(q => q.status === 'Aprovada' || q.status === 'No ar').length;
  const sc = cmpScripts(p, c), docsOk = sc.reduce((a, r) => a + VS_KINDS6.filter(k => vsSt(r, k) === 'Aprovado').length, 0), pl = cmpPlans(p, c), seqs = pl.reduce((a, x) => a + x.seqs.length, 0), ld = cmpLands(p, c), logos = (p.design.logos || []).length;
  const steps = [
    ['Pré-projeto: público, dores, desejos e urgências', p.pre.icps.length > 0, p.pre.icps.length ? `${p.pre.icps.length} público(s) descrito(s)` : 'Ainda sem público descrito', "go('preproject')", 'Abrir pré-projeto'],
    ['Bancos de textos da campanha', lists > 0, `${lists} itens do público · ${c.bank.h.length} headlines · ${c.bank.c.length} CTAs`, "cmpGo('bancos')", 'Ver bancos'],
    ['Anúncios nas 3 medidas do Meta', c.pieces.length > 0, `${c.pieces.length} anúncios · ${artes} artes · ${apr} aprovados`, "cmpGo('pecas')", 'Ver anúncios'],
    ['Roteiros de vídeo (6 documentos)', sc.length > 0, `${sc.length} de ${c.pieces.length} anúncios com roteiro · ${docsOk} de ${sc.length * 6} documentos aprovados`, "cmpGo('roteiros')", 'Ver roteiros'],
    ['Stories da semana', pl.length > 0, pl.length ? `${pl.length} plano(s) · ${seqs} sequências` : 'Nenhum plano ligado a esta campanha', "cmpGo('stories')", 'Ver Stories'],
    ['Landing page', ld.length > 0, ld.length ? `${ld.length} página(s)` : 'Nenhuma página criada', "cmpGo('landing')", 'Ver landing'],
    ['Logo e identidade visual', logos > 0, logos ? `${logos} logo(s) no projeto` : 'Sem logo no projeto (cores e fontes vêm do Brand Brain)', "go('design');setTimeout(()=>{if(typeof dzLogoOpen==='function')dzLogoOpen()},60)", 'Abrir logos'],
    ['Plano de teste e exportação', !!(c.test.macro || c.test.micro), c.test.macro ? 'Plano de teste escrito' : 'Plano de teste ainda vazio', "cmpGo('teste')", 'Ver plano']
  ], done = steps.filter(s => s[1]).length, next = steps.find(s => !s[1]);
  return `<div class="panel" style="margin-top:12px"><div class="section-row"><div><h3 style="margin:0">Fluxo da campanha</h3><small class="muted">Do público ao teste, tudo ligado nesta campanha.</small></div><b>${done} de ${steps.length}</b></div>
  <div style="height:8px;background:#8882;border-radius:99px;margin:10px 0"><div style="height:8px;width:${Math.round(done / steps.length * 100)}%;background:#2e7d4f;border-radius:99px"></div></div>
  <div class="list">${steps.map((s, i) => `<div class="list-item"><div><strong>${s[1] ? '✓' : '○'} ${i + 1}. ${esc(s[0])}</strong><small>${esc(s[2])}</small></div><button class="btn sm ${s[1] ? '' : 'dark'}" onclick="${s[3]}">${s[4]}</button></div>`).join('')}</div>
  ${next ? `<p class="muted" style="font-size:12.5px;margin:10px 0 0"><b>Próximo passo:</b> ${esc(next[0])}.</p>` : '<p style="margin:10px 0 0;font-size:13px"><b>Fluxo completo.</b> Exporte as artes ou salve a campanha como pacote.</p>'}</div>`;
}
function cmpRoteirosHTML(p, c) {
  if (!c.pieces.length) return '<div class="panel" style="margin-top:12px"><p class="muted">Crie anúncios na aba Anúncios primeiro. Cada anúncio pode ganhar os 6 roteiros: ficha, literário, gravação, técnico, edição e glossário.</p></div>';
  return `<div class="panel" style="margin-top:12px"><p class="muted" style="font-size:12.5px;margin-top:0">Cada anúncio vira um vídeo com 6 documentos, na ordem da Skill Mestre. Eles nascem do esqueleto (sem crédito) e abrem no Video Lab, onde você aprova e baixa em PDF e Docs.</p><div class="list">${CMP_STAGES5.map(st => c.pieces.filter(q => q.stage === st).map(q => { const r = p.video.scripts.find(x => x.src.type === 'piece' && x.src.id === q.id), n = r ? VS_KINDS6.filter(k => vsSt(r, k) === 'Aprovado').length : 0;
    return `<div class="list-item"><div><strong>${esc(q.name)}</strong><small>${CMP_STAGE_NAME[st]} · ${esc(String(q.h).slice(0, 70))}${r ? ` · ${n} de 6 documentos aprovados` : ' · sem roteiro'}</small></div><button class="btn sm ${r ? '' : 'dark'}" onclick="vsCreateFor('${c.id}','${q.id}')">${r ? 'Abrir no Video Lab' : 'Criar os 6 roteiros'}</button></div>`; }).join('')).join('')}</div></div>`;
}
function cmpStoriesHTML(p, c) {
  const pl = cmpPlans(p, c);
  return `<div class="panel" style="margin-top:12px"><div class="section-row"><div><h3 style="margin:0">Stories da campanha</h3><small class="muted">A semana de sequências usa os bancos desta campanha (dores, dúvidas, desejos e urgências).</small></div><button class="btn dark" onclick="stNewModal('${c.id}')">＋ Planejar a semana de Stories</button></div>
  ${pl.length ? `<div class="list" style="margin-top:10px">${pl.map(x => `<div class="list-item"><div><strong>${esc(x.name)}</strong><small>${x.seqs.length} sequências · ${x.seqs.reduce((a, q) => a + q.items.length, 0)} Stories · ${x.status}</small></div><button class="btn sm dark" onclick="go('stories');stOpen('${x.id}')">Abrir</button></div>`).join('')}</div>` : '<p class="muted" style="margin-top:10px">Nenhum plano ainda.</p>'}</div>`;
}
function cmpLandingHTML(p, c) {
  const ld = cmpLands(p, c);
  return `<div class="panel" style="margin-top:12px"><div class="section-row"><div><h3 style="margin:0">Landing page da campanha</h3><small class="muted">A página para onde os anúncios levam. O que é criado aqui aparece também em Sites e landing pages.</small></div><button class="btn dark" onclick="cmpLandingModal('${c.id}')">＋ Criar landing page</button></div>
  ${ld.length ? `<div class="list" style="margin-top:10px">${ld.map(l => `<div class="list-item"><div><strong>${esc(l.name)}</strong><small>${esc((LP_TYPE_INFO[l.type] || {label: l.type}).label)} · ${esc(l.status || 'Rascunho')}</small></div><button class="btn sm dark" onclick="go('landings');lpOpen('${l.id}')">Abrir</button></div>`).join('')}</div>` : '<p class="muted" style="margin-top:10px">Nenhuma página criada para esta campanha.</p>'}</div>`;
}
function cmpLandingModal(cid) {
  const p = curProject(), c = cmpOf(p, cid); if (!c) return;
  showModal('Criar landing page da campanha', `<div class="form-grid"><div class="field full"><label>Nome interno</label><input id="clN" value="${esc('LP · ' + c.name)}"></div><div class="field"><label>Tipo de página</label><select id="clT">${Object.entries(LP_TYPE_INFO).map(([k, v]) => `<option value="${k}" ${k === 'cadastro' ? 'selected' : ''}>${esc(v.label)}</option>`).join('')}</select></div><div class="field"><label>Produto ou serviço (opcional)</label><select id="clP"><option value="">Nenhum</option>${(p.products || []).map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select></div></div>
  <p class="muted" style="font-size:12.5px">A página já recebe as dores, dúvidas e desejos desta campanha como material de base. Você edita no editor visual, que abre na visão do celular.</p>
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="cmpLandingCreate('${cid}')">Criar e abrir</button></div>`);
}
function cmpLandingCreate(cid) {
  const p = curProject(), c = cmpOf(p, cid); if (!c) return; c.landings = c.landings || []; if (c.landings.length >= 20) return;
  const l = lpCreate({type: $('clT').value, name: ($('clN').value.trim() || 'LP · ' + c.name), productId: $('clP').value});
  const base = ['Dores', 'Dúvidas', 'Desejos', 'Urgências ocultas'].map((t, i) => { const L = c.bank[CMP_KINDS[i]]; return L.length ? `${t}: ${L.slice(0, 5).join('; ')}` : ''; }).filter(Boolean).join('\n');
  if (base) l.input = ((l.input || '') + (l.input ? '\n' : '') + 'Campanha ' + c.name + '\n' + base).slice(0, 4000);
  c.landings.push(l.id); persist();
}
