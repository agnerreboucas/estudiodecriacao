/* ===== Sites de aula: tela de entrada =====
   O site de aula é um site da Mesa de páginas, só com outro jeito de navegar (faixas horizontais, rolagem vertical, mapa com zoom) e blocos próprios
   (carrossel, antes e depois, perguntas que revelam a resposta, sequências com zoom). Esta tela escolhe o modelo, abre na Mesa (com todas as ferramentas)
   e lista os sites de aula do projeto. As aulas feitas no editor anterior (p.aulas) podem ser convertidas para a Mesa. */
const AUS = {fromMesa: false};
const auTemplates = () => MZ_TEMPLATES.filter(t => /^aula-/.test(t.id));
const auPagesOf = p => ((p && p.mesa && p.mesa.pages) || []).filter(x => x.nav);
const NAV_LBL = {horizontal: 'Horizontal', vertical: 'Vertical', mapa: 'Mapa com zoom'};

function renderAulas() {
  const root = $('aulasRoot'); if (!root) return; const p = curProject();
  const head = esHead('Sites de aula', 'Apresentações interativas em HTML. São sites da Mesa de páginas: você edita com todas as ferramentas.');
  if (!p) { root.innerHTML = head + '<div class="panel es-empty">Crie um projeto para começar.<br><br><button class="btn pri" onclick="openWizard()">Novo projeto</button></div>'; return; }
  const mine = auPagesOf(p), old = p.aulas || [];
  root.innerHTML = head + `<div class="au-new"><h3>Começar por um modelo</h3><p class="muted" style="margin:0 0 12px">O modelo cria uma página na Mesa já com a navegação, os blocos e o estilo (cores e fontes). Você troca tudo.</p><div class="au-starters">${auTemplates().map(t => `<div class="au-st-c" style="cursor:default"><div class="au-th" data-t="${t.id}"><iframe sandbox="allow-scripts" title="${esc(t.name)}" tabindex="-1"></iframe></div><b>${esc(t.name)}</b><small>${esc(t.desc)}</small><button class="btn sm pri" onclick="auStart('${t.id}')">Criar na Mesa</button></div>`).join('')}</div></div>
    <h3 style="margin:26px 0 10px">Sites de aula de ${esc(p.name)} (${mine.length})</h3>${mine.length ? `<div class="au-grid">${mine.map(pg => `<div class="au-card-l"><div><b>${esc(pg.name)}</b><small>Navegação: ${esc(NAV_LBL[pg.nav] || pg.nav)} · ${(pg.root.children || []).length} seção(ões)</small></div><div class="row-gap"><button class="btn sm pri" onclick="auOpenPage('${pg.id}')">Abrir na Mesa</button></div></div>`).join('')}</div>` : '<p class="muted">Nenhum ainda. Escolha um modelo acima, ou, na Mesa, abra uma página e escolha a navegação dela no painel da página.</p>'}
    ${old.length ? `<h3 style="margin:26px 0 10px">Aulas do editor anterior (${old.length})</h3><p class="muted" style="margin:0 0 8px">Converta para a Mesa para editar com todas as ferramentas.</p><div class="au-grid">${old.map(a => `<div class="au-card-l"><div><b>${esc(a.name)}</b><small>${esc(a.mode)} · ${a.slides.length} item(ns)</small></div><div class="row-gap"><button class="btn sm pri" onclick="auConvert('${a.id}')">Converter para a Mesa</button><button class="btn sm" onclick="auOldDel('${a.id}')">Excluir</button></div></div>`).join('')}</div>` : ''}`;
  auThumbs(root, p);
}
/* miniaturas: a página do modelo montada de verdade (HTML da Mesa), com a navegação */
async function auThumbs(root, p) {
  for (const th of root.querySelectorAll('.au-th')) {
    try { const t = MZ_TEMPLATES.find(x => x.id === th.dataset.t); if (!t) continue; const rt = mzBuildTemplate(t.id, mzCtx(p)), pg = mzNormPage({id: 'tmp', name: t.name, root: rt, nav: t.nav}), ds = mzAulaSkinDs(t.skin) || mzDsDefault(); th.querySelector('iframe').srcdoc = mzDoc({pages: [pg], comps: [], ds}, pg, {img: () => ''}); } catch (e) { /* miniatura opcional */ }
  }
}
function auEnsureMesa(p) { if (!p.mesa) p.mesa = normalizeMesa({}); if (!state.mesaLib) state.mesaLib = normalizeMesaLib({}); MZ.p = p; return p.mesa; }
function auStart(tid) {
  const p = curProject(); if (!p) { toast('Crie um projeto primeiro.'); return; } auEnsureMesa(p); const t = MZ_TEMPLATES.find(x => x.id === tid); if (!t) return;
  const pg = mzPageNew(tid, t.name.replace(/^Aula · /, 'Aula ') + ' · ' + p.name); if (!pg) return; persist(); AUS.fromMesa = true; mzOpen(); setTimeout(() => { try { mzPageOpen(pg.id); } catch (e) { /* já abre na página atual */ } }, 700);
  toast('Aberto na Mesa. Edite como qualquer site; veja a navegação em Prévia.');
}
function auOpenPage(id) { const p = curProject(); if (!p) return; auEnsureMesa(p); AUS.fromMesa = true; mzOpen(); setTimeout(() => { try { mzPageOpen(id); } catch (e) { /* ok */ } }, 700); }
function auOldDel(id) { const p = curProject(), a = (p.aulas || []).find(x => x.id === id); if (!a || !confirm('Excluir a aula “' + a.name + '”? (Ela não foi convertida.)')) return; p.aulas = p.aulas.filter(x => x.id !== id); persist(); renderAulas(); }
/* aula do editor anterior → página da Mesa */
function auConvert(id) {
  const p = curProject(), a = (p.aulas || []).find(x => x.id === id); if (!a) return; const m = auEnsureMesa(p); if (m.pages.length >= MZ_LIMITS.pages) { toast('Limite de páginas da Mesa atingido.'); return; }
  const root = mzNode('page', {}, {display: 'flex', flexDirection: 'column'});
  root.children = a.mode === 'mapa' ? a.slides.map(s => AUM.estacao(s)) : a.slides.map(s => s.layout === 'mesa' ? null : AUM.build(s, false)).filter(Boolean);
  const pg = mzNormPage({id: mzId(), name: a.name, slug: '', root, nav: a.mode, navBrand: a.brand, navCta: a.nav && a.nav.cta, navArrows: !a.nav || a.nav.arrows !== false, navProgress: !a.nav || a.nav.progress !== false});
  pg.slug = mzUniqueSlug(slug(pg.name)); if (!m.pages.length) pg.home = true; m.pages.push(pg); m.cur = pg.id;
  const ds = mzAulaSkinDs(a.skin); if (ds && (m.pages.length === 1 || confirm('Aplicar o estilo (cores e fontes) da aula ao site todo?'))) { m.ds = ds; if (a.theme && a.theme.accent) m.ds.colors.accent = a.theme.accent; }
  p.aulas = p.aulas.filter(x => x.id !== id); persist(); toast('Aula convertida. Abrindo na Mesa…'); AUS.fromMesa = true; mzOpen(); setTimeout(() => { try { mzPageOpen(pg.id); } catch (e) { /* ok */ } }, 700);
}
/* aba "Sites de aula" do Banco de templates */
function auGalleryHTML() {
  return `<p class="sb-note">Sites de aula são sites da Mesa com navegação própria: faixas que deslizam, rolagem vertical ou mapa com zoom. Escolha um modelo: ele abre na Mesa, com todas as ferramentas.</p><div class="au-starters">${auTemplates().map(t => `<div class="au-st-c" style="cursor:default"><div class="au-th" data-t="${t.id}"><iframe sandbox="allow-scripts" title="${esc(t.name)}" tabindex="-1"></iframe></div><b>${esc(t.name)}</b><small>${esc(t.desc)}</small><button class="btn sm pri" onclick="auStart('${t.id}')">Usar este modelo</button></div>`).join('')}</div>`;
}
function auGalleryFill(root) { auThumbs(root, curProject()); }
