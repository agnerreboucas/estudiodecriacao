/* uso: NODE_PATH=$(npm root -g) node tools/html2pdf.js entrada.html saida.pdf */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME||'/opt/pw-browsers/chromium'});const p=await b.newPage();
await p.goto('file://'+require('path').resolve(process.argv[2]));
await p.pdf({path:process.argv[3],format:'A4',margin:{top:'18mm',bottom:'18mm',left:'16mm',right:'16mm'},printBackground:true,displayHeaderFooter:true,headerTemplate:'<span></span>',footerTemplate:'<div style="font-size:8px;width:100%;text-align:center;color:#777">Ampliação Studio para WordPress · <span class="pageNumber"></span>/<span class="totalPages"></span></div>'});
await b.close()})()
