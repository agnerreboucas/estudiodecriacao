/* ===== Leads por origem (campanha, canal, anúncio, página), link com UTM para os anúncios e exportação CSV ===== */
const leadsUI = {days: 30, leads: []};
const LEAD_NONE = '(sem origem: acesso direto ou link sem UTM)';
function leadsInRange(leads) { const d = +leadsUI.days; if (!d) return leads; const t0 = Date.now() - d * 86400000; return leads.filter(l => new Date(l.at).getTime() >= t0); }
function leadsGroup(leads, key) {
  const m = new Map(); leads.forEach(l => { const v = key(l) || ''; m.set(v, (m.get(v) || 0) + 1); });
  return [...m.entries()].map(([k, n]) => ({k, n})).sort((a, b) => b.n - a.n);
}
function leadsTable(title, rows, total, none) {
  if (!rows.length) return '';
  return `<div class="panel" style="margin-top:8px"><h4 style="margin:0 0 6px">${esc(title)}</h4>${rows.slice(0, 8).map(r => `<div class="lbar"><div><span>${esc(r.k || none || '(vazio)')}</span><b>${r.n} · ${Math.round(r.n / total * 100)}%</b></div><div class="learning-bar"><i style="width:${Math.round(r.n / total * 100)}%"></i></div></div>`).join('')}</div>`;
}
function leadsOriginHTML(all) {
  const L = leadsInRange(all), tot = L.length, u = (l, k) => (l.utm && l.utm[k]) || '';
  const bar = `<div class="row-gap" style="flex-wrap:wrap;margin-bottom:8px"><select class="an-sel" onchange="leadsUI.days=+this.value;leadsRepaint()">${[[7, 'Últimos 7 dias'], [30, 'Últimos 30 dias'], [90, 'Últimos 90 dias'], [0, 'Todo o período']].map(([v, n]) => `<option value="${v}" ${+leadsUI.days === v ? 'selected' : ''}>${n}</option>`).join('')}</select><button class="btn sm" onclick="utmOpen()">🔗 Gerar link com UTM</button><button class="btn sm" onclick="leadsCsv()">⬇ Baixar CSV</button></div>`;
  if (!tot) return bar + '<p class="muted">Nenhum lead neste período.</p>';
  const camp = leadsGroup(L, l => u(l, 'utm_campaign')), top = camp.find(c => c.k) || null;
  return bar + `<div class="cards" style="margin-bottom:6px"><div class="card"><div class="label">Leads no período</div><div class="metric">${tot}</div></div><div class="card"><div class="label">Campanha que mais trouxe</div><div class="metric" style="font-size:18px">${top ? esc(top.k) : '—'}</div><small class="muted">${top ? top.n + ' lead(s)' : 'use links com UTM nos anúncios'}</small></div></div>`
    + leadsTable('Por campanha', camp, tot, LEAD_NONE) + leadsTable('Por canal', leadsGroup(L, l => u(l, 'utm_source')), tot, LEAD_NONE) + leadsTable('Por anúncio', leadsGroup(L, l => u(l, 'utm_content')), tot, LEAD_NONE) + leadsTable('Por página', leadsGroup(L, l => l.source), tot, '(sem página)')
    + (L.filter(l => !l.utm || !l.utm.utm_campaign).length === tot ? '<small class="muted block" style="margin-top:6px">Nenhum lead trouxe a campanha. Use <b>🔗 Gerar link com UTM</b> e coloque o link nos anúncios; assim cada lead chega com a campanha, o canal e o anúncio de origem.</small>' : '');
}
function leadsRepaint() { const b = $('leadsOrigin'); if (b) b.innerHTML = leadsOriginHTML(leadsUI.leads); }
function leadsCsv() {
  const L = leadsInRange(leadsUI.leads), q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"', hdr = ['data', 'nome', 'telefone', 'email', 'mensagem', 'pagina', 'campanha', 'canal', 'meio', 'anuncio', 'termo'];
  const rows = L.map(l => [l.at, l.name, l.phone, l.email, l.message, l.source, (l.utm || {}).utm_campaign, (l.utm || {}).utm_source, (l.utm || {}).utm_medium, (l.utm || {}).utm_content, (l.utm || {}).utm_term].map(q).join(','));
  download('leads-' + new Date().toISOString().slice(0, 10) + '.csv', '﻿' + [hdr.join(',')].concat(rows).join('\r\n'), 'text/csv');
}

/* ---------- link com UTM ---------- */
const UTM_CH = [['facebook', 'paid_social', 'Meta Ads (Facebook e Instagram)', '{{campaign.name}}', '{{ad.name}}'], ['google', 'cpc', 'Google Ads', '{campaignid}', '{creative}'], ['tiktok', 'paid_social', 'TikTok Ads', '', ''], ['instagram', 'social', 'Instagram orgânico', '', ''], ['whatsapp', 'message', 'WhatsApp (transmissão ou status)', '', ''], ['email', 'email', 'E-mail', '', ''], ['blog', 'referral', 'Blog', '', '']];
function utmSlug(v) { return String(v || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9_{}.\-]+/g, '-').replace(/^-+|-+$/g, ''); }
function utmOpen() {
  const p = curProject(), l = typeof lpCur === 'function' ? lpCur() : null, base = l && p ? (lpSeoOf(l, p).base || '') : '';
  showModal('Link com UTM para o anúncio', `<small class="muted block" style="margin-bottom:8px">Com a UTM, cada lead chega com a <b>campanha, o canal e o anúncio</b> de onde veio. Use este link como destino do anúncio.</small>
  <div class="field"><label>Endereço da página (a landing ou o site publicado)</label><input id="utmUrl" value="${esc(base)}" placeholder="https://seusite.com.br/pagina.html" oninput="utmCalc()"></div>
  <div class="field"><label>Canal</label><select id="utmCh" onchange="utmCalc()">${UTM_CH.map((c, i) => `<option value="${i}">${c[2]}</option>`).join('')}</select></div>
  <label class="ins inl" id="utmDynRow"><input type="checkbox" id="utmDyn" onchange="utmCalc()"> usar os campos automáticos da plataforma (nome da campanha e do anúncio)</label>
  <div class="field"><label>Campanha</label><input id="utmCamp" list="utmCampL" placeholder="Ex.: revisao-financiamento-sp" oninput="utmCalc()"><datalist id="utmCampL">${(p ? p.campaigns : []).map(c => `<option value="${esc(utmSlug(c.name))}">`).join('')}</datalist></div>
  <div class="field"><label>Anúncio ou criativo (opcional)</label><input id="utmCont" placeholder="Ex.: dor-parcela-atrasada-v1" oninput="utmCalc()"></div>
  <div class="field"><label>Termo / público (opcional)</label><input id="utmTerm" placeholder="Ex.: mutuario-inadimplente" oninput="utmCalc()"></div>
  <div class="field"><label>Link pronto</label><textarea id="utmOut" rows="3" readonly></textarea></div>
  <div class="row-gap"><button class="btn dark" onclick="utmCopy()">Copiar link</button></div><small class="muted block" style="margin-top:6px">Os campos automáticos: Meta <span class="mono">{{campaign.name}}</span> e <span class="mono">{{ad.name}}</span>; Google Ads <span class="mono">{campaignid}</span> e <span class="mono">{creative}</span>. Confira na plataforma se o formato continua o mesmo. No TikTok e nos demais, escreva à mão.</small>`);
  utmCalc();
}
function utmCalc() {
  const c = UTM_CH[+$('utmCh').value], dynOk = !!c[3], dyn = dynOk && $('utmDyn').checked; $('utmDynRow').style.display = dynOk ? '' : 'none';
  const camp = dyn ? c[3] : utmSlug($('utmCamp').value), cont = dyn ? c[4] : utmSlug($('utmCont').value), term = utmSlug($('utmTerm').value), u = $('utmUrl').value.trim();
  const q = [['utm_source', c[0]], ['utm_medium', c[1]], ['utm_campaign', camp], ['utm_content', cont], ['utm_term', term]].filter(x => x[1]).map(x => x[0] + '=' + x[1]).join('&');
  $('utmOut').value = u ? u + (u.includes('?') ? '&' : '?') + q : '(coloque o endereço da página)';
}
function utmCopy() { const o = $('utmOut'); o.select(); try { navigator.clipboard.writeText(o.value); } catch (e) { document.execCommand('copy'); } toast('Link copiado.'); }
