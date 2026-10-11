/* ===== Entrega do site: link de prévia para o cliente aprovar + Kit do Elementor =====
   "Link para o cliente": monta o site todo (as mesmas páginas do ZIP), envia ao servidor (api/preview.php) e devolve um endereço que abre o site funcionando,
   com a barra "Aprovar / Pedir ajustes". Republicar mantém o mesmo link. Se o servidor tiver PREVIEW_DOMAIN (e DNS curinga), o endereço é um subdomínio próprio:
   https://CODIGO.preview.suaagencia.com. O status (aguardando, aprovado, pediu ajustes) aparece aqui. Exige o servidor PHP e o login do Studio. */
const PVW = {busy: false, st: null};
const pvwB64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
async function pvwPublish(sid) {
  if (PVW.busy) return; if (!canUseApi()) { toast(API.available ? 'Entre com a senha do Studio para gerar o link.' : 'O link de prévia precisa do servidor com PHP (pasta api/). Neste arquivo avulso ele não funciona.'); return; }
  const p = curProject(), s = p.sites.find(x => x.id === sid); if (!s) return; PVW.busy = true; pvwModal(s, 'Montando o site…');
  try {
    const B = await siteBuildFiles(sid); if (!B) throw new Error('O site não tem páginas.'); const files = B.files.filter(f => f.name); let batch = [], size = 0, first = true, t = s.previewT || '', url = '';
    const flush = async () => { if (!batch.length && !first) return; pvwModal(s, 'Enviando para o servidor…'); const r = await api('preview.php', {method: 'POST', body: {action: 'publish', t, first, name: s.name, project: p.id, files: batch}}); t = r.t; url = r.url; batch = []; size = 0; first = false; };
    for (const f of files) { const b64 = pvwB64(f.data instanceof Uint8Array ? f.data : new TextEncoder().encode(String(f.data))); if (size + b64.length > 4_500_000 && batch.length) await flush(); batch.push({name: f.name, b64}); size += b64.length; }
    await flush(); const d = await api('preview.php', {method: 'POST', body: {action: 'done', t}}); s.previewT = t; s.previewUrl = d.url; persist(); PVW.st = null;
  } catch (e) { PVW.busy = false; pvwModal(s, '', 'Não consegui publicar: ' + e.message); return; }
  PVW.busy = false; pvwModal(s);
}
async function pvwStatus(s) { if (!s.previewT || !canUseApi()) return null; try { return await api('preview.php?action=status&t=' + s.previewT); } catch (e) { return {error: e.message}; } }
async function pvwModal(s, busy, err) {
  const st = !busy && !err && s.previewT ? (PVW.st = await pvwStatus(s)) : null, ok = st && st.ok, rev = st && (st.revoked || st.expired);
  const dec = ok && st.decisions && st.decisions.length ? st.decisions[st.decisions.length - 1] : null;
  const stTxt = !ok ? '' : rev ? 'Link desativado ou vencido.' : st.status === 'approved' ? `<b style="color:#2f9e44">Aprovado</b> pelo cliente${dec && dec.name ? ' (' + esc(dec.name) + ')' : ''} em ${new Date(dec.at).toLocaleString('pt-BR')}.` : st.status === 'changes' ? `<b style="color:#d9480f">Pediu ajustes</b>${dec ? ' em ' + new Date(dec.at).toLocaleString('pt-BR') : ''}:<blockquote style="margin:6px 0;padding:8px 10px;background:rgba(255,106,24,.12);border-left:3px solid #ff6a18;white-space:pre-wrap">${esc(dec ? dec.comment : '')}</blockquote>Ajuste o site e use <b>Atualizar o link</b>: o cliente continua no mesmo endereço.` : 'Aguardando o cliente abrir e decidir.';
  showModal('Link para o cliente aprovar', `${busy ? `<p>${esc(busy)}</p>` : ''}${err ? `<p style="color:#d9480f">${esc(err)}</p>` : ''}
    ${!busy && s.previewT && ok && !rev ? `<div class="field"><label>Endereço do site (abre funcionando, com menu e botões)</label><div class="row-gap"><input id="pvwUrl" readonly value="${esc(st.url)}" style="flex:1" onclick="this.select()"><button class="btn sm dark" onclick="pvwCopy()">Copiar</button><a class="btn sm" target="_blank" rel="noopener" href="${esc(st.url)}">Abrir</a></div></div>
      <p>${stTxt}</p>${st.url !== st.urlPath ? `<p class="muted" style="font-size:12px">Se o subdomínio ainda não abrir, o endereço direto também funciona: <a target="_blank" rel="noopener" href="${esc(st.urlPath)}">${esc(st.urlPath)}</a></p>` : ''}
      <p class="muted" style="font-size:12px">Vale até ${new Date(st.expires).toLocaleDateString('pt-BR')}. Quem tem o endereço abre o site: mande só para o cliente.</p>` : ''}
    ${!busy ? `<div class="modal-actions">${s.previewT && ok && !rev ? `<button class="btn" onclick="pvwRevoke('${s.id}')">Desativar o link</button><button class="btn" onclick="pvwModal(curProject().sites.find(x=>x.id==='${s.id}'))">Ver o status de novo</button>` : ''}<button class="btn dark" onclick="pvwPublish('${s.id}')">${s.previewT && ok && !rev ? 'Atualizar o link com o site de agora' : 'Gerar o link para o cliente'}</button></div>` : ''}`);
}
function pvwCopy() { const i = $('pvwUrl'); if (!i) return; try { navigator.clipboard.writeText(i.value); toast('Link copiado.'); } catch (e) { i.select(); document.execCommand('copy'); toast('Link copiado.'); } }
async function pvwRevoke(sid) { const s = curProject().sites.find(x => x.id === sid); if (!s || !s.previewT || !confirm('Desativar o link? O cliente deixa de abrir o site.')) return; try { await api('preview.php', {method: 'POST', body: {action: 'revoke', t: s.previewT}}); s.previewT = ''; s.previewUrl = ''; persist(); toast('Link desativado.'); pvwModal(s); } catch (e) { toast(e.message); } }
function esPvwOpen() { const s = esSiteOf(curProject()); if (!s) return; if (!canUseApi()) { toast(API.available ? 'Entre com a senha do Studio para gerar o link.' : 'O link de prévia precisa do servidor com PHP (pasta api/). Neste arquivo avulso ele não funciona.'); return; } pvwModal(s); }
/* Kit do Elementor do site todo: leva as páginas para a Mesa e abre a exportação já com "todas as páginas" */
async function esKitExport() { await esToMesa(); if (!MZ.open) return; mzModalExport(); const r = document.querySelector('input[name=mzxs][value=all]'); if (r) r.checked = true; toast('Escolha “Kit do Elementor (.zip)” para baixar o pacote do site todo.'); }
