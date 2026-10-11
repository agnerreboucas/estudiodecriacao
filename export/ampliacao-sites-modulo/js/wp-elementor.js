/* ===== Base de WordPress do Studio: painel do tema, páginas avulsas para o Elementor (.json), histórico de temas e inspeção dos plugins anexados ===== */
const wpHist = () => { if (!Array.isArray(state.workspace.wpThemes)) state.workspace.wpThemes = []; return state.workspace.wpThemes; };
const wpNextVer = siteId => { const h = wpHist().filter(x => x.siteId === siteId); if (!h.length) return '1.0.0'; const v = String(h[0].version || '1.0.0').split('.').map(n => +n || 0); while (v.length < 3) v.push(0); v[2]++; return v.join('.'); };
const wpMime = n => /\.webp$/i.test(n) ? 'image/webp' : /\.png$/i.test(n) ? 'image/png' : 'image/jpeg';

/* ---------- páginas para importar no Elementor (Modelos → Importar) ---------- */
async function wpElementorBuild(pageIds, o) {
  const p = curProject(), pages = pageIds.map(id => p.landings.find(l => l.id === id)).filter(Boolean); if (!pages.length) throw new Error('Escolha pelo menos uma página.');
  const {ctx} = wpCtx(pages), site = (p.sites || []).find(s => s.id === pages[0].siteId), brand = (site && (site.brand || site.name)) || p.name, items = [];
  for (const l of pages) { const content = await wpPage(l, p, ctx); items.push({name: wpSlug(l.slug || l.navLabel || l.name) + '.json', title: brand + ' · ' + (l.navLabel || l.name), content}); }
  const files = ctx.files.filter(f => /^assets\/img\//.test(f.name)), embed = o.images !== 'url';
  const map = {}; if (embed) files.forEach(f => { const n = f.name.replace('assets/img/', ''); map[n] = 'data:' + wpMime(n) + ';base64,' + tplB64(f.data); });
  const base = String(o.baseUrl || '').replace(/\/+$/, '');
  const templates = items.map(t => { let str = JSON.stringify({version: '0.4', title: t.title, type: 'page', content: t.content, page_settings: [], metadata: []}); str = embed ? str.replace(/\{\{THEME_URI\}\}\/assets\/img\/([\w.\-]+)/g, (m, n) => map[n] || m) : str.split('{{THEME_URI}}/assets/img').join(base); return {name: t.name, title: t.title, data: new TextEncoder().encode(str)}; });
  const warn = [...new Set(ctx.warn)], size = templates.reduce((a, t) => a + t.data.length, 0);
  if (size > 8e6) warn.push('Os modelos ficaram grandes (' + Math.round(size / 1e6) + ' MB). Se o WordPress recusar o envio, gere de novo com “imagens por endereço”.');
  return {templates, images: files.map(f => ({name: f.name.replace('assets/img/', ''), data: f.data})), warn, embed, size, brand};
}
function wpElOpen(kind, id) {
  const p = curProject(), pages = kind === 'site' ? p.landings.filter(l => l.siteId === id) : p.landings.filter(l => l.id === id), site = kind === 'site' ? p.sites.find(s => s.id === id) : (p.sites || []).find(s => s.id === (pages[0] || {}).siteId);
  if (!pages.length) { toast('Não há páginas para exportar.'); return; } const base = ((site && site.baseUrl) || location.origin).replace(/\/+$/, '') + '/wp-content/uploads/estudio/';
  showModal('Páginas para o Elementor', `<p style="font-size:13px;margin-top:0">Cada página vira um <b>modelo do Elementor</b> (.json). No WordPress: <b>Modelos → Modelos salvos → Importar modelos</b>, escolha o arquivo e depois crie uma página e use <b>Inserir modelo</b>. Não precisa do tema do Studio.</p>
  ${pages.length > 1 ? `<div class="field"><label>Páginas</label>${pages.map(l => `<label class="ins inl" style="display:flex;gap:6px"><input type="checkbox" class="wpElPg" value="${l.id}" checked> ${siteA(l.navLabel || l.name)}</label>`).join('')}</div>` : ''}
  <div class="field"><label>Imagens</label><label class="ins inl" style="display:flex;gap:6px"><input type="radio" name="wpElImg" value="embed" checked onchange="$('wpElBase').style.display='none'"> embutidas no arquivo (mais simples; arquivo maior)</label><label class="ins inl" style="display:flex;gap:6px"><input type="radio" name="wpElImg" value="url" onchange="$('wpElBase').style.display=''"> por endereço (arquivo leve; você envia as imagens para o site)</label></div>
  <div class="field" id="wpElBase" style="display:none"><label>Endereço da pasta de imagens no site</label><input id="wpElBaseV" value="${siteA(base)}"><small class="muted">Você baixa um segundo arquivo com as imagens e envia essa pasta por FTP ou gerenciador de arquivos.</small></div>
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancelar</button><button class="btn dark" onclick="wpElGo('${kind}','${id}')">⬇ Gerar</button></div>`);
}
async function wpElGo(kind, id) {
  const p = curProject(), ids = kind === 'site' ? [...document.querySelectorAll('.wpElPg:checked')].map(x => x.value) : [id], mode = (document.querySelector('input[name=wpElImg]:checked') || {}).value || 'embed', baseUrl = ($('wpElBaseV') || {}).value || '';
  if (!ids.length) { toast('Marque pelo menos uma página.'); return; } if (mode === 'url' && !/^https?:\/\/\S+$/i.test(baseUrl)) { toast('Informe o endereço da pasta de imagens (começa com https://).'); return; } toast('Montando os modelos do Elementor…');
  try {
    const r = await wpElementorBuild(ids, {images: mode, baseUrl}), nm = slug(r.brand) || 'site';
    if (r.templates.length === 1) download(nm + '-' + r.templates[0].name.replace(/\.json$/, '') + '-elementor.json', new Blob([r.templates[0].data], {type: 'application/json'}), 'application/json'); else download(nm + '-elementor.zip', makeZip(r.templates.map(t => ({name: t.name, data: t.data}))), 'application/zip');
    if (!r.embed && r.images.length) download(nm + '-imagens.zip', makeZip(r.images.map(i => ({name: i.name, data: i.data}))), 'application/zip');
    showModal('Modelos gerados', `<p><b>${r.templates.length}</b> modelo(s) do Elementor${r.embed ? ' com as imagens embutidas' : ' e a pasta de imagens (' + r.images.length + ' arquivo(s))'}.</p>${r.warn.length ? `<div class="so-issue aviso">${r.warn.map(esc).join('<br>')}</div>` : ''}<ol style="font-size:13px;line-height:1.7"><li>No WordPress, com o Elementor ativo: <b>Modelos → Modelos salvos → Importar modelos</b> e escolha ${r.templates.length > 1 ? 'o .zip' : 'o .json'} baixado.</li>${r.embed ? '' : `<li>Descompacte o <span class="mono">-imagens.zip</span> e envie a pasta para <span class="mono">${esc(baseUrl)}</span>.</li>`}<li>Crie uma página, clique em <b>Editar com Elementor</b> e use o ícone de pasta (<b>Adicionar modelo</b>) para inserir.</li></ol><p class="muted" style="font-size:12.5px">Formulários viram o shortcode <span class="mono">[amp_lead_form]</span>, que existe no tema do Studio ou num plugin seu. Sem ele, o formulário aparece como texto.</p><div class="modal-actions"><button class="btn dark" onclick="closeModal()">Fechar</button></div>`);
  } catch (e) { toast('Não consegui gerar: ' + e.message); }
}

/* ---------- tema (com histórico) ---------- */
async function wpGenerate(siteId, mode) {
  const s = curProject().sites.find(x => x.id === siteId); if (!s) return; toast('Montando o tema do WordPress…');
  try {
    const opt = {name: ($('wpName') || {}).value || s.name, slug: wpSlug(($('wpSlug') || {}).value || ($('wpName') || {}).value || s.name), version: (($('wpVer') || {}).value || wpNextVer(siteId)).replace(/[^\w.\-]/g, '') || '1.0.0'};
    const r = mode === 'bundle' ? await wpBundle(siteId, opt) : await wpThemeZip(siteId, opt);
    download(r.slug + (mode === 'bundle' ? '-wordpress-pacote' : '') + '.zip', r.zip, 'application/zip'); curProject().landings.filter(l => l.siteId === siteId).forEach(l => { l.status = 'Exportada'; });
    wpHist().unshift({id: uid('wt'), siteId, siteName: s.name, name: r.name, slug: r.slug, version: opt.version, at: new Date().toISOString(), pages: r.pages, images: r.images, size: r.size, mode, warn: r.warn.slice(0, 6)}); if (wpHist().length > 40) wpHist().length = 40; persist();
    showModal('Tema gerado', `<p><b>${esc(r.name)}</b> versão ${esc(opt.version)}: ${r.pages} página(s), ${r.images} imagem(ns), ${Math.round(r.size / 1024)} KB de arquivos do tema.</p>${r.warn.length ? `<div class="so-issue aviso">${r.warn.map(esc).join('<br>')}</div>` : ''}<ol style="font-size:13px;line-height:1.7"><li>No WordPress, instale e ative o <b>Elementor</b> (gratuito).</li><li><b>Aparência → Temas → Adicionar novo → Enviar tema</b> e escolha o arquivo baixado${mode === 'bundle' ? ' (dentro do pacote: <span class="mono">' + esc(r.slug) + '.zip</span>)' : ''}. Ative.</li><li>O tema cria as páginas, o menu, a página inicial e a página Obrigado. Abra uma página e clique em <b>Editar com Elementor</b>.</li><li>Ajuste marca, WhatsApp, leads e rastreamento em <b>Aparência → Personalizar</b>.</li></ol><p class="muted" style="font-size:12.5px">As instruções completas vão no arquivo <span class="mono">LEIA-ME</span> do pacote.</p><div class="modal-actions"><button class="btn dark" onclick="closeModal();renderLandings()">Fechar</button></div>`);
  } catch (e) { toast('Não consegui gerar o tema: ' + e.message); }
}

/* ---------- inspeção dos plugins anexados ---------- */
async function wpPlugInspect(blob) {
  const out = {name: '', version: '', desc: '', author: '', php: '', wp: '', requires: [], notes: [], files: 0, php_files: 0, main: ''}, dec = new TextDecoder('utf-8');
  let z; try { z = await tplZipOpen(blob); } catch (e) { out.notes.push('O arquivo não é um .zip válido.'); return out; }
  const names = [...z.ents.keys()]; out.files = names.length; const phps = names.filter(n => /\.php$/i.test(n)).sort((a, b) => a.split('/').length - b.split('/').length || a.length - b.length); out.php_files = phps.length;
  const head = t => { const g = k => { const m = t.match(new RegExp('^[ \\t\\/*#@]*' + k + ':[ \\t]*(.+)$', 'mi')); return m ? m[1].replace(/\*\/.*$/, '').trim() : ''; }; return {name: g('Plugin Name'), version: g('Version'), desc: g('Description'), author: g('Author'), php: g('Requires PHP'), wp: g('Requires at least'), plugins: g('Requires Plugins')}; };
  for (const n of phps.slice(0, 25)) { if (z.ents.get(n).us > 400000 || n.split('/').length > 3) continue; let t = ''; try { t = dec.decode((await z.read(n)).slice(0, 8192)); } catch (e) { continue; } const h = head(t); if (h.name) { Object.assign(out, {name: h.name, version: h.version, desc: h.desc, author: h.author, php: h.php, wp: h.wp, main: n}); if (h.plugins) out.requires.push(...h.plugins.split(/[,\s]+/).filter(Boolean)); break; } }
  if (!out.name) out.notes.push('Não achei o cabeçalho de plugin do WordPress ("Plugin Name:"). Pode não ser um plugin ou estar numa pasta aninhada.');
  let all = ''; for (const n of phps.slice(0, 60)) { if (z.ents.get(n).us > 300000) continue; try { all += '\n' + dec.decode(await z.read(n)); } catch (e) { /* ignora */ } }
  const has = re => re.test(all); if (has(/woocommerce|wc_get_product|WC\(\)/i)) out.requires.push('woocommerce'); if (has(/elementor|\\Elementor\\/i)) out.requires.push(has(/ElementorPro|elementor-pro/i) ? 'elementor-pro' : 'elementor'); if (has(/get_field\(|acf_/i)) out.requires.push('advanced-custom-fields'); if (has(/jetpack/i)) out.requires.push('jetpack');
  out.requires = [...new Set(out.requires)]; if (has(/\beval\s*\(/)) out.notes.push('Usa eval(): revise o código antes de instalar.'); if ((all.match(/base64_decode\s*\(/g) || []).length > 3) out.notes.push('Usa base64_decode() em vários pontos (pode ser código ofuscado): revise.');
  if (has(/curl_exec|wp_remote_(get|post)/)) out.notes.push('Faz chamadas a serviços externos (precisa de chaves ou internet).'); if (!names.some(n => /readme\.(txt|md)$/i.test(n))) out.notes.push('Sem readme.'); if (has(/register_post_type|add_shortcode|register_block_type/)) out.notes.push('Registra conteúdo, shortcodes ou blocos próprios.');
  return out;
}
const wpPlugList2 = () => wpPlugList();
function wpPlugAdd() {
  const i = document.createElement('input'); i.type = 'file'; i.accept = '.zip,application/zip'; i.multiple = true;
  i.onchange = async () => {
    for (const f of [...i.files].slice(0, 12)) {
      if (!/\.zip$/i.test(f.name) || f.size > 60e6) { toast(f.name + ': use um .zip de até 60 MB.'); continue; } const id = uid('wpl'), imgId = uid('wpz'); await imgPut(imgId, f);
      let info = null; try { info = await wpPlugInspect(f); } catch (e) { info = {name: '', notes: ['Não consegui inspecionar: ' + e.message], requires: []}; }
      wpPlugList().push({id, imgId, name: info.name || f.name.replace(/\.zip$/i, ''), file: f.name.replace(/[^\w.\-]/g, '_'), size: f.size, use: true, info});
    }
    persist(); renderLandings();
  }; i.click();
}
async function wpPlugDel(id) { const L = wpPlugList(), i = L.findIndex(x => x.id === id); if (i < 0) return; try { await imgDel(L[i].imgId); } catch (e) { /* ok */ } L.splice(i, 1); persist(); renderLandings(); }
function wpPlugUse(id, on) { const x = wpPlugList().find(y => y.id === id); if (x) { x.use = !!on; persist(); } }
const WP_DEP = {woocommerce: 'WooCommerce', elementor: 'Elementor', 'elementor-pro': 'Elementor Pro (pago)', 'advanced-custom-fields': 'ACF', jetpack: 'Jetpack'};
function wpPlugRow(x) {
  const i = x.info || {}, req = (i.requires || []).map(r => WP_DEP[r] || r);
  return `<div class="list-item" style="padding:7px 0;align-items:flex-start"><div style="flex:1;min-width:0"><label class="ins inl" style="display:flex;gap:6px;align-items:center"><input type="checkbox" ${x.use !== false ? 'checked' : ''} onchange="wpPlugUse('${x.id}',this.checked)"> <strong style="font-size:13px">${siteA(x.name)}</strong>${i.version ? `<small>v${siteA(i.version)}</small>` : ''}<small>${Math.round(x.size / 1024)} KB · ${i.php_files || 0} arq. PHP</small></label>${i.desc ? `<small class="muted block">${siteA(String(i.desc).slice(0, 140))}</small>` : ''}${req.length ? `<small class="block" style="color:#b26a00">Depende de: ${siteA(req.join(', '))}</small>` : ''}${(i.notes || []).map(n => `<small class="muted block">• ${siteA(n)}</small>`).join('')}</div><button class="btn sm" title="Remover" onclick="wpPlugDel('${x.id}')">×</button></div>`;
}
function wpPanel(s, p) {
  const pages = p.landings.filter(l => l.siteId === s.id), ok = pages.every(l => l.status === 'Aprovada'), pl = wpPlugList(), hist = wpHist().filter(x => x.siteId === s.id).slice(0, 4), used = pl.filter(x => x.use !== false).length;
  return `<div class="panel" style="margin-top:10px"><h3>WordPress e Elementor</h3><p class="muted" style="font-size:12.5px;margin:0 0 8px">Transforma este site num <b>tema instalável</b> (cada página vira uma página do Elementor, com menu, página inicial, Obrigado, formulário de leads, SEO básico e rastreamento) ou em <b>modelos do Elementor</b> para importar em qualquer WordPress.${ok ? '' : ' <b>Atenção:</b> há páginas que ainda não estão como “Aprovada”.'}</p>
  <div class="field"><label>Nome do tema</label><input id="wpName" value="${siteA(s.name)}" oninput="if($('wpSlug'))$('wpSlug').placeholder=wpSlug(this.value)"></div><div class="form-grid"><div class="field"><label>Pasta (slug)</label><input id="wpSlug" placeholder="${siteA(wpSlug(s.name))}"></div><div class="field"><label>Versão</label><input id="wpVer" value="${siteA(wpNextVer(s.id))}"></div></div>
  <div class="row-gap" style="flex-wrap:wrap"><button class="btn dark" onclick="wpGenerate('${s.id}','theme')">⬇ Gerar tema (.zip)</button><button class="btn" onclick="wpGenerate('${s.id}','bundle')" title="Tema, plugins marcados, modelos do Elementor e instruções">⬇ Pacote completo</button><button class="btn" onclick="wpElOpen('site','${s.id}')" title="Só as páginas, para importar no Elementor de qualquer site">⬇ Páginas para o Elementor</button></div>
  ${hist.length ? `<h4 style="margin:12px 0 4px;font-size:13px">Temas gerados</h4>${hist.map(h => `<div class="list-item" style="padding:5px 0"><div><strong style="font-size:13px">${siteA(h.name)} v${siteA(h.version)}</strong><small>${esc(fmtDateTime(h.at))} · ${h.pages} página(s) · ${Math.round(h.size / 1024)} KB${h.mode === 'bundle' ? ' · pacote' : ''}</small></div></div>`).join('')}` : ''}
  <h4 style="margin:12px 0 4px;font-size:13px">Plugins para acompanhar o tema (${used} de ${pl.length} marcados)</h4><small class="muted block">Anexe os plugins que você já produziu (.zip). O Studio lê o cabeçalho, mostra do que cada um depende e o que faz. <b>Só os marcados</b> vão na pasta <span class="mono">plugins</span> do pacote completo; os que não servirem, desmarque ou remova.</small>
  ${pl.map(wpPlugRow).join('')}<button class="btn sm" style="margin-top:6px" onclick="wpPlugAdd()">＋ Anexar plugin (.zip)</button></div>`;
}
