#!/usr/bin/env python3
"""Gera export/ampliacao-sites-modulo/ (e o .zip): só o módulo de criação de sites e landing pages.
Copia os arquivos necessários, monta um index.html enxuto e corrige o roteador (core.js) para as telas que existem."""
import re, shutil, pathlib, zipfile, sys
root = pathlib.Path(__file__).resolve().parent.parent
VERSION = '1.7.0'
out = root / 'export' / 'ampliacao-sites-modulo'
if out.exists(): shutil.rmtree(out)
(out / 'js').mkdir(parents=True); (out / 'css').mkdir(); (out / 'api').mkdir()
SCRIPTS = ['util','icons','wizard','store','integrations','ai-prefs','core','design-data','logo-fonts','present','design-engine','design-brand','design-layouts','ai-layout','fonts-mine','imglib','bulk','integracoes',
  'editorial-skill','editorial','editorial-ent','landing','landing-ui','builder','builder-ui','sections','tpl-import','tpl-ui','wp-theme-php','wp-theme','wp-elementor','pacote',
  'skills-text','skills-ui','doc-import','acc','mz-core','mz-presets','mz-editor','mz-actions','mz-panels','mz-modals','mz-export','mz-elementor-in','mz-ai','mz-free','mz-links','mz-fonts','mz-drag','mz-design','mz-aiimg','mz-themes',
  'leads-ui','site-ui','briefing-form','briefing-google','briefing-ui','identidade-data','sites-briefing','sites-templates','estudio-shell','sites-fluxo','sites-preview','aula-engine','aula-render','aula-ui','refs','estudio-ps','mesa-skin','sites-boot','nav','responsive']
CSS = ['base','bulk','studio','responsive','menu','mesa','mesa-dark','sites','estudio','aula']
API = ['.htaccess','_lib.php','_dispatch.php','ai.php','analyze.php','auth.php','config.sample.php','image.php','keys.php','leads.php','lp.php','models.php','status.php','workspace.php','briefing.php','preview.php']
for s in SCRIPTS:
    src = root / 'js' / (s + '.js')
    if src.exists(): shutil.copy(src, out / 'js' / src.name)
for c in CSS: shutil.copy(root / 'css' / (c + '.css'), out / 'css' / (c + '.css'))
shutil.copy(root / 'css' / 'mesa-dark-extra.css', out / 'css' / 'mesa-dark-extra.css')
for a in API: shutil.copy(root / 'api' / a, out / 'api' / a)
(out / 'api' / 'data').mkdir(); (out / 'api' / 'data' / '.htaccess').write_text((root / 'api' / 'data' / '.htaccess').read_text())
# roteador: só as telas deste módulo (funções que não existem aqui são ignoradas)
core = (out / 'js' / 'core.js').read_text()
core = re.sub(r"const PAGES = \[[^\]]*\];", "const PAGES = ['home', 'mesa', 'projects', 'landings', 'brand', 'settings', 'project', 'biblioteca', 'briefing', 'templates', 'dev', 'cliente', 'refs', 'aulas'];", core, 1)
core = re.sub(r"function renderPage\(page\) \{\n  \(\{.*?\}\[page\] \|\| \(\(\) => \{\}\)\)\(\);",
  "function renderPage(page) {\n  const MAP = {home: 'renderHome', projects: 'renderProjects', brand: 'renderBrand', settings: 'renderSettings', mesa: 'renderMesaLauncher', project: 'renderProjectTab', biblioteca: 'renderBiblioteca', landings: 'renderLandings', briefing: 'renderBriefing', templates: 'renderTemplatesBank', dev: 'renderDev', cliente: 'renderCliente', refs: 'renderRefs', aulas: 'renderAulas'};\n  const fn = window[MAP[page]]; if (typeof fn === 'function') fn();", core, 1, re.S)
(out / 'js' / 'core.js').write_text(core)
assert 'renderBriefing' in core and 'briefing' in core, 'roteador do módulo não foi ajustado'
store = (out / 'js' / 'store.js').read_text()
store = store.replace('activeProjectId: mb.id, projects: [mb, cd, se]', "activeProjectId: '', projects: []", 1)
store = store.replace("'ampliacao_studio_v1'", "'ampliacao_sites_v1'")
(out / 'js' / 'store.js').write_text(store)
shutil.copy(root / 'js' / 'app.js', out / 'js' / 'app.js')

pn = (out / 'js' / 'mz-panels.js'); t = pn.read_text()
t = t.replace("g.fillStyle = '#f2f2f5';", "const DK = document.body.classList.contains('mz-dark'); g.fillStyle = DK ? '#2f2f2f' : '#f2f2f5';").replace("g.fillStyle = '#6b6f7a'; g.strokeStyle = '#9aa0ab';", "g.fillStyle = DK ? '#a8a8a8' : '#6b6f7a'; g.strokeStyle = DK ? '#6d6d6d' : '#9aa0ab';")
pn.write_text(t)
mp = (out / 'js' / 'mz-panels.js'); mp.write_text(mp.read_text().replace('Voltar ao Studio (Esc sem seleção)', 'Voltar (Esc sem seleção)').replace('>← Studio<', '>← Voltar<'))
shutil.copy(root / 'tools' / 'sites-module' / 'sites-boot.js', out / 'js' / 'sites-boot.js')
tags = ''.join('<script src="js/%s.js"></script>\n' % x for x in SCRIPTS if x != 'sites-boot') 
# ordem: arquivos do Studio, ajustes do módulo, app.js
idx = [re.search(r'js/([\w-]+)\.js', l).group(1) for l in (root / 'index.html').read_text().splitlines() if '<script src="js/' in l]
order = [x for x in idx if x in SCRIPTS and x not in ('sites-boot','app','nav','responsive','acc','sites-briefing','sites-templates','estudio-shell','sites-fluxo','refs','estudio-ps','mesa-skin')] + ['sites-briefing', 'sites-templates', 'estudio-shell', 'sites-fluxo', 'sites-preview', 'aula-engine', 'aula-render', 'aula-ui', 'refs', 'estudio-ps', 'mesa-skin', 'sites-boot', 'app'] + [x for x in ('acc','nav','responsive') if x in SCRIPTS]
tags = ''.join('<script src="js/%s.js"></script>\n' % x for x in order)
(out / 'index.html').write_text((root / 'tools' / 'sites-module' / 'index.html').read_text().replace('<!--SCRIPTS-->', tags))
print('ok', out)
(out / 'fonts').mkdir(); (out / 'fonts' / 'manifest.json').write_text('{"families": []}\n')

shutil.copy(root / 'briefing.html', out / 'briefing.html')
shutil.copy(root / 'tools' / 'sites-module' / 'preview.htaccess.sample', out / 'preview.htaccess.sample')
shutil.copy(root / 'tools' / 'sites-module' / 'LEIA-ME.md', out / 'LEIA-ME.md')
shutil.copy(root / 'THIRD_PARTY.md', out / 'THIRD_PARTY.md')
zp = root / 'export' / ('ampliacao-sites-modulo-%s.zip' % VERSION)
if zp.exists(): zp.unlink()
with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
    for f in sorted(out.rglob('*')):
        if f.is_file(): z.write(f, 'ampliacao-sites-modulo/' + f.relative_to(out).as_posix())
print('zip', zp, round(zp.stat().st_size / 1024), 'KB')
