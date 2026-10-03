/* ===== Distribuição de leads: para onde vai cada lead que chega pelo formulário (e-mail do gestor e do vendedor, planilha, CRM, WhatsApp do vendedor) ===== */
async function routingModal() {
  let r; try { r = await api('routing.php'); } catch (e) { toast(e.message); return; }
  const A = esc, ok = (b, t) => `<span class="int-state ${b ? 'on' : ''}">${b ? t : 'não configurado'}</span>`;
  showModal('Distribuição de leads', `<small class="muted block" style="margin-bottom:8px">Todo lead fica salvo no servidor (Performance → Leads) e, em seguida, é enviado para os destinos abaixo. Cada destino é independente: se um falhar, os outros seguem. As chaves ficam só no servidor.</small>
  <div class="field"><label>E-mails do gestor / diretor (acompanham volume e qualidade; separe por vírgula)</label><input id="rtM" value="${A(r.managers.join(', '))}" placeholder="dono@empresa.com, diretor@empresa.com"></div>
  <div class="field"><label>E-mails do vendedor (recebem o contato com link para chamar no WhatsApp)</label><input id="rtS" value="${A(r.sellers.join(', '))}" placeholder="vendas@empresa.com"></div>
  <div class="field"><label>Planilha — endereço do Google Apps Script (https://script.google.com/…/exec) ${ok(r.sheets, r.sheets)}</label><input id="rtSh" placeholder="${r.sheets ? 'já configurado; cole outro para trocar' : 'https://script.google.com/macros/s/…/exec'}"></div>
  <div class="field"><label>CRM — endereço do webhook (Pipedrive, RD, HubSpot via n8n/Make/Zapier, ou o endereço do próprio CRM) ${ok(r.crm, r.crm)}</label><input id="rtC" placeholder="${r.crm ? 'já configurado; cole outro para trocar' : 'https://…'}"></div>
  <div class="field"><label>CRM — segredo opcional (enviado no cabeçalho X-Webhook-Secret) ${ok(r.crmSecret, 'definido')}</label><input id="rtCs" placeholder="${r.crmSecret ? 'já definido; digite para trocar' : 'opcional'}"></div>
  <div class="okr-label">WHATSAPP DO VENDEDOR (WhatsApp Cloud API da Meta)</div>
  <div class="field"><label>Número do vendedor (com DDI e DDD)</label><input id="rtW" value="${A(r.sellerWhatsapp)}" placeholder="5511988887777"></div>
  <div class="ins-row"><div class="field"><label>Token ${ok(r.whatsappApi, 'token e ID salvos')}</label><input id="rtWt" placeholder="${r.whatsappApi ? 'já salvo; cole outro para trocar' : 'token da Cloud API'}"></div><div class="field"><label>ID do número (Phone number ID)</label><input id="rtWi" placeholder="${r.whatsappApi ? 'já salvo' : 'só números'}"></div></div>
  <div class="field"><label>Modelo (template) aprovado — vazio = mensagem de texto livre</label><input id="rtWm" value="${A(r.waTemplate)}" placeholder="novo_lead (3 variáveis: nome, telefone, interesse)"></div>
  <small class="muted block">A Meta só entrega texto livre dentro de 24 horas de uma conversa aberta com o número; fora dela é preciso um modelo aprovado. Não consegui testar com uma conta real da Meta nesta sessão.</small>
  ${r.log.length ? `<div class="okr-label" style="margin-top:8px">ÚLTIMOS ENVIOS</div><div class="mono" style="font-size:11.5px;max-height:120px;overflow:auto">${r.log.map(x => A(x)).join('<br>')}</div>` : ''}
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Fechar</button><button class="btn dark" onclick="routingSave()">Salvar</button></div>`);
  document.getElementById('modalBox').classList.add('wide');
}
async function routingSave() {
  const v = id => (document.getElementById(id) || {}).value || '', body = {managers: v('rtM'), sellers: v('rtS'), sellerWhatsapp: v('rtW'), waTemplate: v('rtWm').trim()};
  if (v('rtSh').trim()) body.sheetsUrl = v('rtSh').trim(); if (v('rtC').trim()) body.crmUrl = v('rtC').trim(); if (v('rtCs').trim()) body.crmSecret = v('rtCs').trim();
  try {
    await api('routing.php', {method: 'POST', body});
    if (v('rtWt').trim()) await api('keys.php', {method: 'POST', body: {name: 'WHATSAPP_TOKEN', value: v('rtWt').trim()}});
    if (v('rtWi').trim()) await api('keys.php', {method: 'POST', body: {name: 'WHATSAPP_PHONE_ID', value: v('rtWi').trim()}});
    closeModal(); toast('Destinos dos leads salvos.');
  } catch (e) { toast(e.message); }
}
