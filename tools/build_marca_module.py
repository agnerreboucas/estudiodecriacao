#!/usr/bin/env python3
"""Gera export/ampliacao-marca-modulo/ (e o .zip): só o módulo de Marca e Briefing do cliente.
Mesmo código do Studio: copia os arquivos necessários, monta um index.html enxuto e troca o roteador (core.js) pelas telas que existem."""
import re, shutil, pathlib, zipfile
root = pathlib.Path(__file__).resolve().parent.parent
VERSION = '1.0.0'
out = root / 'export' / 'ampliacao-marca-modulo'
if out.exists(): shutil.rmtree(out)
(out / 'js').mkdir(parents=True); (out / 'css').mkdir(); (out / 'api' / 'data').mkdir(parents=True)
SCRIPTS = ['util','icons','store','integrations','ai-prefs','core','present','design-data','logo-fonts','design-engine','design-brand','design-layouts','ai-layout','fonts-mine','imglib','bulk','ofertas','integracoes',
  'skills-text','skills-ui','doc-import','planilha-matriz','briefing-form','briefing-ui','briefing-google','identidade-data','identidade-guia','xlsx-mini','marca-planilha','identidade-ui','produtos-ui','intake-ui','routing-ui','marca-tabs','marca-boot','nav','responsive']
CSS = ['base','journey','studio','responsive','menu','bulk','mesa']
API = ['.htaccess','_lib.php','_dispatch.php','ai.php','auth.php','briefing.php','config.sample.php','keys.php','models.php','routing.php','status.php','workspace.php']
for s in SCRIPTS:
    src = root / 'js' / (s + '.js')
    if src.exists(): shutil.copy(src, out / 'js' / src.name)
shutil.copy(root / 'tools' / 'marca-module' / 'marca-tabs.js', out / 'js' / 'marca-tabs.js'); shutil.copy(root / 'tools' / 'marca-module' / 'marca-boot.js', out / 'js' / 'marca-boot.js')
for c in CSS: shutil.copy(root / 'css' / (c + '.css'), out / 'css' / (c + '.css'))
for a in API: shutil.copy(root / 'api' / a, out / 'api' / a)
(out / 'api' / 'data' / '.htaccess').write_text((root / 'api' / 'data' / '.htaccess').read_text())
for h in ('briefing.html', 'marca.html'): shutil.copy(root / h, out / h)
core = (out / 'js' / 'core.js').read_text()
core = re.sub(r"const PAGES = \[[^\]]*\];", "const PAGES = ['home', 'projects', 'project', 'biblioteca', 'settings'];", core, 1)
core = re.sub(r"function renderPage\(page\) \{\n  \(\{.*?\}\[page\] \|\| \(\(\) => \{\}\)\)\(\);",
  "function renderPage(page) {\n  const MAP = {home: 'renderHome', projects: 'renderProjects', settings: 'renderSettings', project: 'renderProjectTab', biblioteca: 'renderBiblioteca'};\n  const fn = window[MAP[page]]; if (typeof fn === 'function') fn();", core, 1, re.S)
(out / 'js' / 'core.js').write_text(core)
store = (out / 'js' / 'store.js').read_text()
store = store.replace('activeProjectId: mb.id, projects: [mb, cd, se]', "activeProjectId: '', projects: []", 1).replace("'ampliacao_studio_v1'", "'ampliacao_marca_v1'")
(out / 'js' / 'store.js').write_text(store)
shutil.copy(root / 'js' / 'app.js', out / 'js' / 'app.js')
(out / 'fonts').mkdir(); (out / 'fonts' / 'manifest.json').write_text('{"families": []}\n')
idx = [re.search(r'js/([\w-]+)\.js', l).group(1) for l in (root / 'index.html').read_text().splitlines() if '<script src="js/' in l]
order = [x for x in idx if x in SCRIPTS and x not in ('identidade-ui','produtos-ui','intake-ui','marca-tabs','marca-boot','app','nav','responsive','routing-ui')]
order += ['marca-tabs','identidade-ui','produtos-ui','intake-ui','routing-ui','marca-boot','app','nav','responsive']
seen = []; [seen.append(x) for x in order if x not in seen]
(out / 'index.html').write_text((root / 'tools' / 'marca-module' / 'index.html').read_text().replace('<!--SCRIPTS-->', ''.join('<script src="js/%s.js"></script>\n' % x for x in seen)))
shutil.copy(root / 'tools' / 'marca-module' / 'LEIA-ME.md', out / 'LEIA-ME.md'); shutil.copy(root / 'THIRD_PARTY.md', out / 'THIRD_PARTY.md')
zp = root / 'export' / ('ampliacao-marca-modulo-%s.zip' % VERSION)
if zp.exists(): zp.unlink()
with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
    for f in sorted(out.rglob('*')):
        if f.is_file(): z.write(f, 'ampliacao-marca-modulo/' + f.relative_to(out).as_posix())
print('ok', out, round(zp.stat().st_size / 1024), 'KB')
