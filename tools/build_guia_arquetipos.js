/* Gera docs/Guia-dos-12-arquetipos.pdf (e .html) a partir do mesmo texto que o Studio usa (js/identidade-guia.js).
   Uso: NODE_PATH=$(npm root -g) node tools/build_guia_arquetipos.js   (precisa de um servidor estático na raiz: python3 -m http.server 8093) */
const {chromium} = require('playwright'), fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch({executablePath: process.env.CHROME || '/opt/pw-browsers/chromium', args: ['--no-sandbox']}), pg = await b.newPage();
  await pg.goto(process.env.BASE || 'http://127.0.0.1:8093/marca.html'); await pg.waitForFunction('typeof idGuideDoc === "function"');
  const html = await pg.evaluate(() => idGuideDoc()), out = path.join(__dirname, '..', 'docs');
  fs.writeFileSync(path.join(out, 'Guia-dos-12-arquetipos.html'), html);
  const p2 = await b.newPage(); await p2.setContent(html, {waitUntil: 'load'});
  await p2.pdf({path: path.join(out, 'Guia-dos-12-arquetipos.pdf'), format: 'A4', margin: {top: '16mm', bottom: '16mm', left: '14mm', right: '14mm'}, printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#777">Guia dos 12 arquétipos de marca · <span class="pageNumber"></span>/<span class="totalPages"></span></div>'});
  await b.close(); console.log('ok');
})();
