/* ===== Agente Editorial · 6 · Entregas: a mesma ideia/briefing vira, sem repetir dados, todas as peças do projeto:
   anúncios (headlines, subheadlines, títulos, descrições, texto principal), landing page, roteiros, carrossel, post simples e sequência de stories.
   Cada entrega é um bloco recolhível; nada é escrito até você pedir. ===== */
const ENT_ADS = [['headlines', 'Headlines', 'até ~40 caracteres', 40], ['subheadlines', 'Subheadlines', 'até ~90', 90], ['titulos', 'Títulos (para a arte)', 'até ~50', 50], ['descricoes', 'Descrições', 'até ~30 a 90', 90], ['textos', 'Texto principal', '125 visíveis, até ~300', 300]];
const ENT_LIST = [
  ['ads', 'Anúncios', 'headlines, subheadlines, títulos, descrições e texto principal'],
  ['landing', 'Landing page', 'headline, subtítulo, provas, CTA e seções'],
  ['roteiro', 'Roteiros', 'vídeo (60–90 s) ou reel/short (30–45 s)'],
  ['carrossel', 'Post carrossel', '18 textos'],
  ['post', 'Post simples', 'hook → fechamento'],
  ['stories', 'Sequência de stories', '5 a 7 telas com interação']
];
const ENT_SPEC = {
  ads: () => `ANÚNCIOS (feed pago). Entregue 5 variações DIFERENTES de cada item, todas sustentadas pela mesma ideia, sem prometer resultado e sem inventar números. JSON: {"headlines":["até 40 caracteres"],"subheadlines":["até 90"],"titulos":["até 50, curto, para a arte"],"descricoes":["até 90"],"textos":["texto principal: 1ª linha é o gancho (cabe em 125 caracteres), até 300 no total"]}. Cada lista com 5 itens.`,
  landing: () => 'LANDING PAGE de conversão. JSON: {"headline":"problema + promessa honesta, até 80 caracteres","sub":"até 160","bullets":["3 a 5 pontos de prova/benefício, sem inventar dado"],"cta":"texto do botão, até 30","secoes":[{"rotulo":"Problema","texto":""},{"rotulo":"Solução","texto":""},{"rotulo":"Como funciona","texto":""},{"rotulo":"Prova","texto":""},{"rotulo":"Objeções (FAQ)","texto":""},{"rotulo":"Chamada final","texto":""}]}',
  stories: () => 'SEQUÊNCIA DE STORIES com 5 a 7 telas: 1 gancho, telas de desenvolvimento, 1 tela de interação (enquete, caixa de pergunta ou quiz) e 1 CTA. Texto de cada tela com no máximo 90 caracteres (a tela é lida em 3 segundos). JSON: {"partes":[{"rotulo":"1 · Gancho","texto":"texto da tela","apoio":"visual / figurinha / interação"}]}'
};
const entS = () => { const s = EDS(); if (!s.ent || typeof s.ent !== 'object') s.ent = {}; return s.ent; };
const ENT_FMT = {ads: 'ad45', carrossel: 'ig34', post: 'feed45', stories: 'story'};

function eCtx() {
  const s = EDS(), it = s.ideas[s.chosen], b = s.brief, hl = s.headlines.find(h => h.pick), t = (s.analysis && s.analysis.triagem) || {evidencias: []};
  return `${eInput()}\n\nIDEIA: ${it.tese}\nBRIEFING: hook: ${b.estrutura.hook} | mecanismo: ${b.estrutura.mecanismo} | prova: ${b.estrutura.prova} | aplicação: ${b.estrutura.aplicacao} | evitar: ${b.direcao.evitar}\nEVIDÊNCIAS DISPONÍVEIS (use só estas; hipótese é hipótese): ${(t.evidencias || []).map(v => `[${v.tipo}] ${v.texto}`).join(' ; ')}\n${hl ? 'HEADLINE ESCOLHIDA (use como hook): ' + hl.headline + '\n' : ''}${eProdTxt() ? 'PRODUTO/CAMPANHA: ' + eProdTxt() + '\n' : ''}`;
}
const ENT_RULES = 'Regras: linguagem natural e específica; nada de clichês de IA; se qualquer página pudesse publicar a frase, reescreva; NUNCA invente números, estudos, datas, citações ou fontes (use [CONFIRMAR: …]); conteúdo de saúde, financeiro ou jurídico não promete resultado.';

async function eEnt(kind, sub) {
  const s = EDS(), E = entS(); if (edi.busy) return; edi.busy = 'ent-' + kind; renderEditorial();
  try {
    const spec = kind === 'roteiro' ? ED_SPEC[sub || 'video']() : (ENT_SPEC[kind] || ED_SPEC[kind])();
    const j = await motJSON(eSystem(), `${eCtx()}\nFormato — ${spec}\n${ENT_RULES}`, 6500);
    if (kind === 'ads') { const o = {pick: {}}; ENT_ADS.forEach(([k]) => { o[k] = eArr(j[k]).slice(0, 8); o.pick[k] = 0; }); if (!ENT_ADS.some(([k]) => o[k].length)) throw new Error('a IA não devolveu os anúncios.'); E.ads = o; }
    else if (kind === 'landing') { if (!j.headline) throw new Error('a IA não devolveu a landing page.'); E.landing = {headline: eStr(j.headline), sub: eStr(j.sub), bullets: eArr(j.bullets).slice(0, 6), cta: eStr(j.cta) || 'Quero saber mais', secoes: (Array.isArray(j.secoes) ? j.secoes : []).slice(0, 8).map(x => ({label: eStr(x.rotulo), texto: eStr(x.texto)}))}; }
    else {
      let parts;
      if (kind === 'carrossel') { const T = (Array.isArray(j.textos) ? j.textos : []).slice(0, 18).map(eStr); while (T.length < 18) T.push(''); parts = T.map((x, k) => ({label: `${k + 1} · ${ED_CAR(k + 1, EDX().sizes)[0]}`, texto: x})); }
      else parts = (Array.isArray(j.partes) ? j.partes : []).slice(0, 14).map(x => ({label: eStr(x.rotulo), texto: eStr(x.texto), tela: x.tela ? eStr(x.tela) : '', apoio: x.apoio ? eStr(x.apoio) : ''}));
      if (!parts.length) throw new Error('a IA não devolveu o conteúdo.');
      E[kind] = {format: kind === 'roteiro' ? (sub || 'video') : kind, parts};
    }
    toast('Entrega gerada. Revise antes de usar.');
  } catch (er) { toast(eErr(er)); }
  edi.busy = ''; eSave(); renderEditorial();
}
function eEntSet(path, v) { const E = entS(), [k, f, i] = path.split('.'); if (k === 'ads') E.ads[f][+i] = v; else if (k === 'landing') { if (f === 'bullets') E.landing.bullets[+i] = v; else E.landing[f] = v; } else E[k].parts[+f][i || 'texto'] = v; eSave(); const c = document.getElementById('cnt-' + path.replace(/\./g, '_')); if (c) c.textContent = v.length; }
const eEntTa = (path, v, rows, max) => `<div class="ent-ta"><textarea rows="${rows || 2}" oninput="eEntSet('${path}',this.value)">${esc(v)}</textarea><small class="muted"><span id="cnt-${path.replace(/\./g, '_')}">${(v || '').length}</span>${max ? '/' + max : ''}</small></div>`;
function eEntCopy(t) { try { navigator.clipboard.writeText(t); toast('Copiado.'); } catch (e) { toast('Não consegui copiar.'); } }
function eEntAdsCopy() { const a = entS().ads; eEntCopy(ENT_ADS.map(([k, l]) => `${l.toUpperCase()}\n` + a[k].map(x => '- ' + x).join('\n')).join('\n\n')); }
function eEntPartsMd(k) { const E = entS()[k]; return E.parts.map(p => `## ${p.label}\n\n${p.texto}${p.tela ? `\n\n*Tela:* ${p.tela}` : ''}${p.apoio ? `\n\n*Apoio:* ${p.apoio}` : ''}`).join('\n\n'); }
function eEntDown(k) { download(`${k}-editorial.md`, `# ${EDS().ideas[EDS().chosen].tese}\n\n` + eEntPartsMd(k), 'text/markdown'); }
/* abre o Estúdio de Design com o texto da entrega */
function eEntDesign(kind) {
  const s = EDS(), E = entS(); let lines, fmt = ENT_FMT[kind] || 'feed45';
  if (kind === 'ads') { const a = E.ads, g = k => a[k][a.pick[k] || 0] || ''; lines = [`${g('headlines')} | ${g('subheadlines')}`, g('titulos'), g('descricoes'), g('textos')].filter(x => x.trim() && x !== ' | '); }
  else if (kind === 'carrossel') { const P = E.carrossel.parts.map(p => (p.texto || '').replace(/\n+/g, ' ')); lines = [`${P[0]} | ${P[1]}`]; [[2, 3, 4, 5], [6, 7, 8, 9], [10, 11, 12], [13, 14, 15]].forEach(g => lines.push(`${P[g[0]]}: ${g.slice(1).map(i => P[i]).join(' ')}`)); lines.push(`${P[16]} | ${P[17]}`); }
  else if (kind === 'stories') lines = E.stories.parts.map(p => (p.texto || '').replace(/\n+/g, ' '));
  else { const P = E.post.parts.map(p => (p.texto || '').replace(/\n+/g, ' ')); lines = [`${P[0].slice(0, 90)} | ${(P[1] || '').slice(0, 120)}`, ...P.slice(2, -1).map((x, i) => `${E.post.parts[i + 2].label}: ${x}`), `${P[P.length - 1].slice(0, 90)} | Saiba mais`]; }
  dzNew(); dz.cmp.text = lines.join('\n'); dz.cmp.name = (s.ideas[s.chosen].tese || '').slice(0, 40) + ' · ' + kind; dz.cmp.fmt = fmt; renderDesign(); toast('Texto enviado ao Estúdio de Design. Escolha o estilo e gere as peças.');
}
/* leva a entrega para a Auditoria anti-IA genérica */
function eEntAudit(kind) { const s = EDS(), E = entS()[kind]; s.content = {format: E.format || kind, parts: E.parts.map(p => ({label: p.label, texto: p.texto, tela: p.tela || undefined, apoio: p.apoio || undefined}))}; s.format = s.content.format; s.audit = null; s.stage = 'auditoria'; eSave(); renderEditorial(); }
function eEntLanding() {
  const p = EDp(), L = entS().landing; if (!p) return;
  const l = {id: uid('lp'), name: 'LP — ' + (L.headline || 'Editorial').slice(0, 40), goal: 'Gerar lead', headline: L.headline, sub: L.sub, bullets: L.bullets.join('\n'), cta: L.cta || 'Enviar', whatsapp: '', status: 'Rascunho'};
  p.landings.push(l); persist(); toast('Landing criada no projeto (Rascunho).'); showModal('Landing page criada', `<p style="margin-top:0">A landing <b>${esc(l.name)}</b> foi criada no projeto com headline, subtítulo, provas e botão. As seções (problema, solução, prova, FAQ) ficam como roteiro de texto aqui no Agente.</p><div class="modal-actions"><button class="btn" onclick="closeModal()">Continuar aqui</button><button class="btn dark" onclick="closeModal();landingModal('${l.id}')">Abrir e ajustar a landing</button></div>`);
}
function eEntLandingMd() { const L = entS().landing; return `# ${L.headline}\n\n${L.sub}\n\n${L.bullets.map(b => '- ' + b).join('\n')}\n\n**CTA:** ${L.cta}\n\n` + L.secoes.map(x => `## ${x.label}\n\n${x.texto}`).join('\n\n'); }

function eEntBusy(k) { return edi.busy === 'ent-' + k; }
function eEntGen(kind, label, sub) { const has = !!entS()[kind === 'roteiro' ? 'roteiro' : kind]; return `<button class="btn ${has ? '' : 'dark'} sm" onclick="eEnt('${kind}'${sub ? `,'${sub}'` : ''})" ${edi.busy ? 'disabled' : ''}>${eEntBusy(kind) ? 'Escrevendo…' : (has ? '↻ ' : '✦ ') + label}</button>`; }
function eEntBody(kind) {
  const E = entS(), parts = k => E[k] ? E[k].parts.map((p, i) => `<div class="ent-part"><b>${esc(p.label)}</b>${eEntTa(k + '.' + i, p.texto, 3)}${p.tela !== undefined && p.tela !== '' ? `<small class="muted">Tela</small>${eEntTa(k + '.' + i + '.tela', p.tela, 1)}` : ''}${p.apoio ? `<small class="muted">Apoio</small>${eEntTa(k + '.' + i + '.apoio', p.apoio, 1)}` : ''}</div>`).join('') : '';
  if (kind === 'ads') {
    const a = E.ads; if (!a) return `<p class="muted">Gera 5 variações de cada item a partir da ideia e do briefing.</p><div class="row-gap">${eEntGen('ads', 'Gerar anúncios')}</div>`;
    return ENT_ADS.map(([k, l, hint, max]) => `<div class="ent-grp"><div class="okr-label">${l} <span class="muted">· ${hint}</span></div>${(a[k] || []).map((t, i) => `<label class="ent-opt ${a.pick[k] === i ? 'on' : ''}"><input type="radio" name="ad_${k}" ${a.pick[k] === i ? 'checked' : ''} onchange="entS().ads.pick['${k}']=${i};eSave();renderEditorial()">${eEntTa('ads.' + k + '.' + i, t, k === 'textos' ? 4 : 2, max)}</label>`).join('')}</div>`).join('')
      + `<small class="muted block">Os limites variam por plataforma e mudam: confira no gerenciador antes de publicar. O item marcado de cada grupo é o que vai para o editor.</small><div class="row-gap" style="margin-top:8px;flex-wrap:wrap">${eEntGen('ads', 'Refazer')}<button class="btn sm dark" onclick="eEntDesign('ads')">Abrir no Editor de Design</button><button class="btn sm" onclick="eEntAdsCopy()">Copiar tudo</button></div>`;
  }
  if (kind === 'landing') {
    const L = E.landing; if (!L) return `<p class="muted">Monta a estrutura da página: promessa, provas, botão e seções.</p><div class="row-gap">${eEntGen('landing', 'Gerar landing page')}</div>`;
    return `<div class="okr-label">HEADLINE</div>${eEntTa('landing.headline', L.headline, 2, 80)}<div class="okr-label">SUBTÍTULO</div>${eEntTa('landing.sub', L.sub, 2, 160)}<div class="okr-label">PROVAS / BENEFÍCIOS</div>${L.bullets.map((b, i) => eEntTa('landing.bullets.' + i, b, 1)).join('')}<div class="okr-label">BOTÃO</div>${eEntTa('landing.cta', L.cta, 1, 30)}
      <div class="okr-label">SEÇÕES</div>${L.secoes.map(x => `<div class="ent-part"><b>${esc(x.label)}</b><p style="margin:2px 0;font-size:12.5px">${esc(x.texto)}</p></div>`).join('')}<div class="row-gap" style="margin-top:8px;flex-wrap:wrap">${eEntGen('landing', 'Refazer')}<button class="btn sm dark" onclick="eEntLanding()">Criar landing no projeto</button><button class="btn sm" onclick="eEntCopy(eEntLandingMd())">Copiar</button></div>`;
  }
  if (kind === 'roteiro') {
    const R = E.roteiro, gen = `${eEntGen('roteiro', 'Roteiro de vídeo', 'video')} ${eEntGen('roteiro', 'Roteiro de reel/short', 'reel')}`;
    if (!R) return `<p class="muted">Roteiro falável com texto na tela, apoio visual e CTA.</p><div class="row-gap">${gen}</div>`;
    return `<small class="muted block">${R.format === 'reel' ? 'Reel / Short (30–45 s)' : 'Vídeo (60–90 s)'}</small>${parts('roteiro')}<div class="row-gap" style="margin-top:8px;flex-wrap:wrap">${gen}<button class="btn sm" onclick="eEntAudit('roteiro')">Auditar</button><button class="btn sm" onclick="eEntDown('roteiro')">⬇ .md</button></div>`;
  }
  if (!E[kind]) return `<p class="muted">${esc(ENT_LIST.find(x => x[0] === kind)[2])}.</p><div class="row-gap">${eEntGen(kind, 'Gerar ' + ENT_LIST.find(x => x[0] === kind)[1].toLowerCase())}</div>`;
  return `${parts(kind)}<div class="row-gap" style="margin-top:8px;flex-wrap:wrap">${eEntGen(kind, 'Refazer')}<button class="btn sm dark" onclick="eEntDesign('${kind}')">Abrir no Editor de Design</button><button class="btn sm" onclick="eEntAudit('${kind}')">Auditar</button><button class="btn sm" onclick="eEntDown('${kind}')">⬇ .md</button></div>`;
}
function eEntregasUI(s) {
  const it = s.ideas[s.chosen]; if (!it || !s.brief) return '<p class="muted">Escolha uma ideia e gere o briefing primeiro.</p>';
  const E = entS(), has = k => !!E[k];
  return `<div class="mot-wrap"><div style="grid-column:1/-1"><div class="mot-ch"><b>Projeto → Agente → Entregas</b><p style="margin:4px 0;font-size:12.5px">Ideia: <b>${esc(it.tese)}</b></p><small class="muted">Tudo abaixo nasce da mesma ideia, do mesmo briefing e do DNA do projeto: você não preenche nada de novo. Abra só o que precisa.</small>
    <div class="acc-bar"><button class="btn sm" onclick="accAll('ent',true)">Expandir tudo</button><button class="btn sm" onclick="accAll('ent',false)">Recolher tudo</button></div></div>
    ${ENT_LIST.map(([k, t, sub], i) => accSec('ent', k, t, has(k) ? '● pronto' : sub, eEntBody(k), i === 0)).join('')}</div></div>`;
}

/* ===== Insumos do Agente: descrição (campo acima), link de site, foto/imagem de produto, áudio e atributos do projeto.
   Cada fonte vira um bloco de texto rotulado no insumo, que você pode editar antes da triagem. ===== */
const eSrc = {busy: '', url: '', save: true, rec: null, recT: 0};
const eSrcOK = () => canUseApi();
function eSrcAdd(label, text) { const s = EDS(); text = String(text || '').trim(); if (!text) return; s.input = ((s.input ? s.input.trim() + '\n\n' : '') + `--- ${label} ---\n${text}`).slice(0, 60000); eSave(); }
function eInsumoSources(s) {
  const b = eSrc.busy, dis = b ? 'disabled' : '', can = eSrcOK();
  const st = API.status || {}, sttOn = can && st.stt && st.stt.configured;
  return accSec('edi', 'ins', 'Mais insumos: link, imagem do produto, áudio, atributos do projeto', b ? 'trabalhando…' : 'o que você tiver serve',
    `<div class="ent-src"><div class="okr-label">LINK DE SITE OU PÁGINA DO PRODUTO</div><div class="row-gap"><input style="flex:1" placeholder="https://…" value="${esc(eSrc.url)}" oninput="eSrc.url=this.value"><button class="btn sm" onclick="eSrcSite()" ${dis} ${can ? '' : 'title="Precisa do servidor PHP"'}>${b === 'site' ? 'Lendo…' : 'Ler o site'}</button></div>
    <div class="okr-label" style="margin-top:10px">FOTO OU IMAGEM DE PRODUTO</div><div class="row-gap" style="flex-wrap:wrap"><input type="file" accept="image/png,image/jpeg,image/webp" multiple onchange="eSrcImgs(this)" ${dis}><label class="ins inl"><input type="checkbox" ${eSrc.save ? 'checked' : ''} onchange="eSrc.save=this.checked"> guardar na Biblioteca de imagens (para usar no anúncio)</label></div><small class="muted block">${b === 'img' ? 'Lendo a imagem com IA…' : 'A IA descreve produto, cenário, cores e texto visível; até 3 imagens por vez.'}</small>
    <div class="okr-label" style="margin-top:10px">ÁUDIO (fala, depoimento, reunião)</div><div class="row-gap" style="flex-wrap:wrap"><input type="file" accept="audio/*,video/mp4,video/webm" onchange="eSrcAudio(this.files[0]);this.value=''" ${dis}>${eSrc.rec ? `<button class="btn sm dark" onclick="eSrcRec()">■ Parar e transcrever</button>` : `<button class="btn sm" onclick="eSrcRec()" ${dis}>● Gravar</button>`}</div><small class="muted block">${b === 'aud' ? 'Transcrevendo…' : sttOn ? 'Até 20 MB. O texto transcrito entra no insumo.' : 'Transcrição não configurada: defina ELEVENLABS_API_KEY ou OPENAI_API_KEY no servidor (Configurações → Integrações).'}</small>
    <div class="okr-label" style="margin-top:10px">ATRIBUTOS DO PROJETO</div><div class="row-gap"><button class="btn sm" onclick="eSrcProject()" ${dis}>Incluir posicionamento, tom, público, oferta e referências do projeto</button></div><small class="muted block">O DNA da marca (aba Memória e DNA) já entra em todas as etapas; aqui vai o contexto do projeto, que você pode editar no texto acima.</small></div>`, false);
}
async function eSrcRun(kind, fn) { if (eSrc.busy) return; eSrc.busy = kind; renderEditorial(); try { await fn(); } catch (e) { toast(e.message || 'Falhou.'); } eSrc.busy = ''; renderEditorial(); }
function eSrcSite() {
  const u = eSrc.url.trim(); if (!u) { toast('Cole o link.'); return; } if (!eSrcOK()) { toast(needsLogin() ? 'Entre no Studio para ler sites.' : 'A leitura de sites exige o servidor PHP.'); return; }
  eSrcRun('site', async () => { const x = await radarFetchScan(u); eSrcAdd('SITE ' + (x.url || u), [x.title && 'Título: ' + x.title, x.description && 'Descrição: ' + x.description, (x.headings || []).length && 'Títulos da página: ' + x.headings.join(' | '), (x.ctas || []).length && 'Chamadas (CTA): ' + x.ctas.join(' | '), x.textSample && 'Trecho: ' + x.textSample].filter(Boolean).join('\n')); eSrc.url = ''; toast('Site lido e adicionado ao insumo.'); });
}
const ESRC_IMG = 'Você prepara insumos para criar anúncios. Olhe a imagem (foto de produto, serviço, ambiente ou peça de referência) e devolva SÓ um JSON: {"produto":"o que é, em uma frase","descricao":"o que se vê: forma, material, cores, embalagem, cenário, pessoas","beneficios_visiveis":["o que a imagem sugere de benefício, sem inventar"],"texto_na_imagem":"textos legíveis, entre aspas","cores":["#RRGGBB"],"publico_provavel":"quem parece ser o público","tom_visual":"clima da imagem"}. Descreva só o que se vê; não invente marca, preço, medida nem resultado.';
async function eSrcImgs(inp) {
  const files = [...inp.files].slice(0, 3); inp.value = ''; if (!files.length) return; if (!aiReady()) { toast(needsLogin() ? 'Entre no Studio para usar a IA.' : 'IA não configurada (Configurações → Integrações).'); return; }
  eSrcRun('img', async () => {
    for (const f of files) {
      const r = await aiVisionJSON(ESRC_IMG, 'Leia a imagem.', f, 1500), j = r.json || {}, s = v => String(v == null ? '' : v).slice(0, 400), a = v => (Array.isArray(v) ? v : []).slice(0, 8).map(s).join('; ');
      eSrcAdd('IMAGEM · ' + f.name, [`Produto: ${s(j.produto)}`, `O que se vê: ${s(j.descricao)}`, a(j.beneficios_visiveis) && 'Benefícios sugeridos pela imagem (a confirmar): ' + a(j.beneficios_visiveis), j.texto_na_imagem && 'Texto na imagem: ' + s(j.texto_na_imagem), a(j.cores) && 'Cores: ' + a(j.cores), `Público provável: ${s(j.publico_provavel)}`, `Tom visual: ${s(j.tom_visual)}`].filter(Boolean).join('\n'));
      if (eSrc.save && typeof libAddBlob === 'function') await libAddBlob(f, {name: f.name.replace(/\.[^.]+$/, ''), kind: 'upload', tags: ['produto']}).catch(() => { });
    }
    toast('Imagem lida e adicionada ao insumo' + (eSrc.save ? ' (e à Biblioteca)' : '') + '.');
  });
}
function eSrcAudio(f) {
  if (!f) return; const st = API.status || {}; if (!eSrcOK() || !(st.stt && st.stt.configured)) { toast('Transcrição não configurada (Configurações → Integrações).'); return; } if (f.size > 20e6) { toast('Áudio grande demais (máx. 20 MB).'); return; }
  eSrcRun('aud', async () => { const r = await api('stt.php', {method: 'POST', body: {audio: await blobToDataURL(f), lang: 'pt'}}); eSrcAdd('ÁUDIO (transcrição) · ' + (f.name || 'gravação'), r.text); toast('Áudio transcrito e adicionado ao insumo.'); });
}
async function eSrcRec() {
  if (eSrc.rec) { eSrc.rec.stop(); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio: true}), mr = new MediaRecorder(stream), chunks = [];
    mr.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    mr.onstop = () => { stream.getTracks().forEach(t => t.stop()); eSrc.rec = null; const blob = new Blob(chunks, {type: mr.mimeType || 'audio/webm'}); renderEditorial(); eSrcAudio(new File([blob], 'gravacao.webm', {type: blob.type})); };
    mr.start(); eSrc.rec = mr; renderEditorial(); toast('Gravando… clique em “Parar e transcrever”.');
  } catch (e) { toast('Não consegui acessar o microfone.'); }
}
function eSrcProject() { const p = EDp(); if (!p) return; const br = p.brand || {}, extra = [br.positioning && 'Posicionamento: ' + br.positioning, br.palette && 'Paleta: ' + br.palette, br.visual && 'Direção visual: ' + br.visual, (p.assets || []).length && 'Assets cadastrados: ' + p.assets.slice(0, 12).map(x => x.name).join(', ')].filter(Boolean).join('\n'), t = [typeof projectContext === 'function' ? projectContext(p) : '', extra].filter(Boolean).join('\n'); if (!t.trim()) { toast('O projeto ainda não tem atributos preenchidos.'); return; } eSrcAdd('ATRIBUTOS DO PROJETO ' + p.name, t.slice(0, 5000)); renderEditorial(); toast('Atributos do projeto adicionados ao insumo.'); }
