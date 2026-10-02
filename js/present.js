/* Apresentação editorial e PDF do Pré-Projeto (gerados a partir do objeto do projeto) */
const PRES_CSS = `*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Inter,system-ui,-apple-system,"Segoe UI",Arial,sans-serif;color:#111;background:#fafafa}
aside{position:fixed;left:0;top:0;bottom:0;width:220px;background:#111;color:#fff;padding:26px 14px;overflow:auto}aside b{display:block;margin:0 10px 22px;font-size:12px;letter-spacing:.08em}aside a{display:block;color:#aaa;text-decoration:none;padding:9px 10px;border-radius:8px;font-size:11px}aside a:hover,aside a.on{background:#222;color:#fff}
main{margin-left:220px}section{min-height:100vh;background:#fff;padding:70px 7vw;display:flex;flex-direction:column;justify-content:center;border-bottom:1px solid #eee}section.dark{background:#111;color:#fff}
.k{font-size:10px;letter-spacing:.16em;color:#999;font-weight:800}.dark .k{color:#aaa}h1{font-size:clamp(38px,6vw,64px);line-height:1;letter-spacing:-2.5px;margin:14px 0}h2{font-size:clamp(26px,3.6vw,40px);letter-spacing:-1.2px;margin:10px 0 22px}
.lead{font-size:17px;line-height:1.7;color:#555;max-width:860px}.dark .lead{color:#bbb}.muted{color:#777;font-size:13px}
.cards{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;max-width:980px}.cards.three{grid-template-columns:repeat(3,1fr)}.card{border:1px solid #e6e6e6;border-radius:14px;padding:20px;background:#fff}.card b{font-size:13px}.card p{font-size:12px;line-height:1.6;color:#555;margin:8px 0 0}.card .id{font-size:10px;color:#999;font-family:ui-monospace,monospace}
.flow{display:flex;gap:8px;flex-wrap:wrap}.flow span{border:1px solid #ddd;border-radius:999px;padding:10px 14px;background:#fafafa;font-size:11px}
.obj{border-left:4px solid #111;padding:14px 22px;max-width:900px;font-size:24px;line-height:1.35;font-weight:650;margin:10px 0}
.list p{font-size:14px;line-height:1.6;color:#444;margin:8px 0;max-width:860px}.list p:before{content:"□ ";color:#999}
.tag{display:inline-block;font-size:9px;font-weight:800;letter-spacing:.1em;border:1px solid #ccc;border-radius:999px;padding:3px 8px;color:#666;margin-left:6px}
.chain{display:grid;gap:10px;max-width:900px}.chain div{border:1px solid #e6e6e6;border-radius:12px;padding:16px;background:#fff}.chain small{font-size:10px;letter-spacing:.12em;color:#999;font-weight:800;display:block;margin-bottom:6px}.chain p{margin:0;font-size:14px;line-height:1.6;color:#333}
.jr{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.jr .card{padding:14px}
@media(max-width:900px){aside{display:none}main{margin:0}section{padding:44px 24px}.cards,.cards.three,.jr{grid-template-columns:1fr}}`;
const PRES_JS = `(function(){var s=[].slice.call(document.querySelectorAll('section')),a=[].slice.call(document.querySelectorAll('aside a'));
document.addEventListener('keydown',function(e){var i=s.findIndex(function(x){return x.getBoundingClientRect().bottom>window.innerHeight*.4});
if(e.key==='ArrowDown'||e.key==='PageDown'){e.preventDefault();(s[i+1]||s[i]).scrollIntoView()}if(e.key==='ArrowUp'||e.key==='PageUp'){e.preventDefault();(s[i-1]||s[0]).scrollIntoView()}});
window.addEventListener('scroll',function(){var i=s.findIndex(function(x){return x.getBoundingClientRect().bottom>window.innerHeight*.4});a.forEach(function(l,j){l.classList.toggle('on',j===i)})});})();`;

const E = esc;
function presData(p) {
  const pre = p.pre; refreshDrafts(pre);
  const items = preItems(pre);
  return {p, pre, items, rels: relationsFor(items), apr: pre.status === 'APROVADO'};
}
const kvTag = apr => `<span class="tag">${apr ? 'DECISÃO' : 'RECOMENDAÇÃO'}</span>`;

function presentationHTML(p) {
  const {pre, items, apr} = presData(p), d = pre.diag;
  const menu = [['capa', 'Capa'], ['diagnostico', 'Diagnóstico'], ['hipoteses', 'Hipóteses'], ['objetivo', 'Objetivo'], ['okr', 'OKR'], ['tracao', 'Tração'], ['estruturacao', 'Estruturação'], ['icp', 'ICP'], ['jornada', 'Jornada'], ['posicionamento', 'Posicionamento'], ['validacao', 'Validação']];
  const list = arr => arr.filter(x => x.trim()).map(x => `<p>${E(x)}</p>`).join('') || '<p class="muted" style="margin-left:0">Ainda não definido.</p>';
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pré-Projeto — ${E(p.name)}</title><style>${PRES_CSS}</style></head><body>
<aside><b>AMPLIAÇÃO STUDIO</b>${menu.map(m => `<a href="#${m[0]}">${m[1]}</a>`).join('')}</aside><main>
<section id="capa" class="dark"><div class="k">PRÉ-PROJETO · ${E(p.name.toUpperCase())}</div><h1>Jornada de Crescimento</h1><p class="lead">${E(p.desc || 'Do diagnóstico à definição do objetivo, com prioridade em gerar tração enquanto se constrói a estrutura.')}</p><p class="muted">${E(p.ctx)} · Status: ${E(pre.status)}</p></section>
<section id="diagnostico"><div class="k">01 · DIAGNÓSTICO</div><h2>O que está acontecendo</h2><div class="cards">${items.map(i => `<div class="card"><span class="id">${refDes(i)}</span><br><b>${E(i.title)}</b><p>${E(i.note)}</p></div>`).join('') || '<p class="muted">Nenhum desafio selecionado.</p>'}</div>
  <div class="chain" style="margin-top:22px">${[['CENÁRIO', d.scenario], ['HIPÓTESE CAUSAL', d.causal], ['CONSEQUÊNCIA', d.consequence], ['NECESSIDADE DE TRANSFORMAÇÃO', d.need]].map(x => `<div><small>${x[0]}</small><p>${E(x[1])}</p></div>`).join('')}</div></section>
<section id="hipoteses"><div class="k">02 · HIPÓTESES</div><h2>Cada desafio gera uma hipótese</h2><div class="cards">${items.map(i => { const h = pre.hyp[i.id] || {}; return `<div class="card"><span class="id">${refHip(i)}</span><span class="tag">${h.validated ? 'DADO · VALIDADA' : 'HIPÓTESE'}</span><p>${E(hypText(pre, i))}</p><p><b>Impacto:</b> ${E(i.impact)}</p></div>`; }).join('')}</div><p class="muted">Hipóteses precisam ser validadas; não são conclusões definitivas.</p></section>
<section id="objetivo"><div class="k">03 · JUSTIFICATIVA E OBJETIVO</div><h2>Por que agir</h2><p class="lead">${E(pre.justification)}</p><div class="obj">${E(pre.objective)} ${kvTag(apr)}</div></section>
<section id="okr" class="dark"><div class="k">04 · OKR</div><h2>${E(pre.okr.objective || 'Objetivo')}</h2><p class="lead">Tração mede o movimento inicial de aquisição; estruturação mede a construção do processo. Números definitivos dependem de validação.</p></section>
<section id="tracao"><div class="k">05 · TRAÇÃO ${kvTag(apr)}</div><h2>Fazer a demanda aparecer</h2><div class="list">${list(pre.okr.tr)}</div></section>
<section id="estruturacao"><div class="k">06 · ESTRUTURAÇÃO ${kvTag(apr)}</div><h2>Organizar a conversão</h2><div class="list">${list(pre.okr.st)}</div></section>
<section id="icp"><div class="k">07 · ICP</div><h2>Quem priorizamos</h2><div class="cards three">${pre.icps.map((x, i) => `<div class="card"><span class="id">ICP ${i + 1}</span><br><b>${E(x.name)}</b>${ICP_FIELDS.slice(1).map(([k, l]) => x[k] ? `<p><b>${l}:</b> ${E(x[k])}</p>` : '').join('')}</div>`).join('') || '<p class="muted">Nenhum ICP definido.</p>'}</div></section>
<section id="jornada"><div class="k">08 · JORNADA INICIAL <span class="tag">HIPÓTESE</span></div><h2>Da situação à decisão</h2><div class="jr">${pre.journey.map((s, i) => `<div class="card"><b>${pad(i + 1, 2)} ${E(s.name)}</b>${JOURNEY_FIELDS.map(([k, l]) => s[k] ? `<p><b>${l}:</b> ${E(s[k])}</p>` : '').join('') || '<p class="muted">—</p>'}</div>`).join('')}</div></section>
<section id="posicionamento"><div class="k">09 · POSICIONAMENTO</div><h2>Próximo gate</h2><p class="lead">O pré-projeto não define o posicionamento definitivo. Depois da aprovação, o posicionamento responde como a empresa quer ocupar espaço na mente do mercado.</p>${pre.positioning ? `<div class="obj">${E(pre.positioning)}</div>` : ''}<div class="flow"><span>Pré-Projeto</span><span>→ Posicionamento</span><span>→ Estratégia</span><span>→ Jornada aprofundada</span><span>→ Comunicação</span><span>→ Produção</span></div></section>
<section id="validacao" class="dark"><div class="k">10 · VALIDAÇÃO</div><h2>${apr ? 'Pré-projeto aprovado' : 'Aguardando validação'}</h2><p class="lead">Status: ${E(pre.status)}${pre.approvedAt ? ' · aprovado em ' + fmtDate(pre.approvedAt) : ''}. Nenhum gate estratégico é ultrapassado sem validação humana.</p></section>
</main><script>${PRES_JS}</script></body></html>`;
}

function pdfHTML(p) {
  const {pre, items, rels} = presData(p), d = pre.diag;
  const box = (h, body) => `<h2>${h}</h2>${body}`;
  const b = t => `<div class="box">${t}</div>`;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Pré-Projeto — ${E(p.name)}</title><style>body{font-family:Arial,sans-serif;padding:34px;color:#111;max-width:860px;margin:auto}h1{font-size:28px;margin:0 0 4px}h2{font-size:18px;margin:26px 0 8px;border-bottom:1px solid #ddd;padding-bottom:6px}.box{border:1px solid #ddd;padding:12px 14px;margin:8px 0;border-radius:8px;break-inside:avoid}.label{font-size:10px;letter-spacing:.12em;color:#888;font-weight:bold}p{line-height:1.55;color:#444;margin:6px 0;font-size:13px}.id{font-size:10px;color:#999;font-family:monospace}ul{padding-left:18px}li{font-size:13px;line-height:1.55;color:#444}@media print{body{padding:0}}</style></head><body>
<h1>Pré-Projeto — ${E(p.name)}</h1><p>${E(p.ctx)} · Status: ${E(pre.status)} · Gerado em ${fmtDate(new Date().toISOString())} · Ampliação Studio</p>
${box('Briefing', b(`<p>${E(pre.briefing) || 'Não informado.'}</p>`))}
${box('Desafios e hipóteses', items.map(i => b(`<span class="id">${refDes(i)} → ${refHip(i)}</span><p><b>${E(i.title)}</b></p><p>${E(hypText(pre, i))}</p><p><b>Impacto hipotético:</b> ${E(i.impact)}</p>`)).join('') || '<p>Nenhum desafio selecionado.</p>')}
${box('Cruzamento das hipóteses', rels.map(r => b(`<span class="id">${refHip(r.a)} ↔ ${refHip(r.b)} · ${r.type}</span><p>${E(r.text)}</p>`)).join('') || '<p>Sem relações identificadas.</p>')}
${box('Diagnóstico consolidado', [['Cenário', d.scenario], ['Hipótese causal', d.causal], ['Consequência', d.consequence], ['Necessidade de transformação', d.need]].map(x => b(`<div class="label">${x[0].toUpperCase()}</div><p>${E(x[1])}</p>`)).join(''))}
${box('Justificativa', b(`<p>${E(pre.justification)}</p>`))}
${box('Objetivo estratégico', b(`<p><b>${E(pre.objective)}</b></p>`))}
${box('OKR · ' + E(pre.okr.objective), b(`<div class="label">TRAÇÃO</div><ul>${pre.okr.tr.map(x => `<li>${E(x)}</li>`).join('')}</ul>`) + b(`<div class="label">ESTRUTURAÇÃO</div><ul>${pre.okr.st.map(x => `<li>${E(x)}</li>`).join('')}</ul>`))}
${box('ICPs prioritários', pre.icps.map((x, i) => b(`<div class="label">ICP ${i + 1}</div><p><b>${E(x.name)}</b></p>${ICP_FIELDS.slice(1).map(([k, l]) => x[k] ? `<p>${l}: ${E(x[k])}</p>` : '').join('')}`)).join('') || '<p>Nenhum ICP definido.</p>')}
${box('Jornada inicial (hipótese)', pre.journey.map((s, i) => b(`<div class="label">${pad(i + 1, 2)} ${E(s.name.toUpperCase())}</div>${JOURNEY_FIELDS.map(([k, l]) => s[k] ? `<p>${l}: ${E(s[k])}</p>` : '').join('') || '<p>—</p>'}`)).join(''))}
${box('Gates', `<p>Pré-Projeto (${E(pre.status)}) → Posicionamento → Estratégia → Jornada aprofundada → Plano de Comunicação → Produção.</p>${pre.positioning ? b(`<div class="label">POSICIONAMENTO</div><p>${E(pre.positioning)}</p>`) : ''}`)}
</body></html>`;
}

/* Overlay em tela cheia (sem depender de pop-ups) */
function showOverlay(title, html, filename) {
  ui.overlay = {html, filename};
  $('overlayTitle').textContent = title;
  $('overlayFrame').srcdoc = html;
  $('overlay').classList.add('open');
}
function closeOverlay() { $('overlay').classList.remove('open'); $('overlayFrame').srcdoc = ''; }
function overlayDownload() { if (ui.overlay) download(ui.overlay.filename, ui.overlay.html, 'text/html'); }
function overlayPrint() { const f = $('overlayFrame'); try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { toast('Use "Baixar HTML" e imprima pelo navegador.'); } }

const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function prePresent() { const p = preP(); showOverlay('Apresentação · ' + p.name, presentationHTML(p), `pre-projeto-${slug(p.name)}.html`); }
function prePDF() { const p = preP(); showOverlay('PDF · ' + p.name, pdfHTML(p), `pre-projeto-${slug(p.name)}.html`); setTimeout(overlayPrint, 600); toast('Na janela de impressão, escolha "Salvar como PDF".'); }
