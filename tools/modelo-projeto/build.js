/* Gera o MODELO DE PROJETO COMPLETO (exemplo fictício) nos formatos Word e Markdown, no mesmo formato do template da Ficha.
   Uso: node build.js [arquivo-json-sem-extensão] [nome-de-saída]. Servidor estático na porta 8093 e `NODE_PATH=$(npm root -g) node tools/modelo-projeto/build.js`.
   Depois confere que o Studio lê o arquivo de volta e preenche todas as respostas (viagem de ida e volta). */
const {chromium} = require('playwright'), fs = require('fs'), path = require('path');
const R = path.resolve(__dirname, '..', '..'), SRC = process.argv[2] || 'exemplo', OUT = process.argv[3] || 'Modelo-Projeto-Completo-EXEMPLO', ans = JSON.parse(fs.readFileSync(path.join(__dirname, SRC + '.json'), 'utf8'));
(async () => {
  const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox']}), pg = await b.newPage();
  await pg.goto('http://127.0.0.1:8093/index.html'); await pg.waitForTimeout(1000);
  const r = await pg.evaluate(a => {
    const md = fdTplMd(a, false), dx = fdDocx(a, false), bytes = Array.from(new Uint8Array(dx instanceof Blob ? [] : dx.buffer ? dx : dx));
    return {md, bytes, isBlob: dx instanceof Blob, parsed: fdParse(md)};
  }, ans);
  let docx;
  if (r.isBlob) { const buf = await pg.evaluate(async a => { const bl = fdDocx(a, false); return Array.from(new Uint8Array(await bl.arrayBuffer())); }, ans); docx = Buffer.from(buf); } else docx = Buffer.from(r.bytes);
  fs.writeFileSync(path.join(R, 'docs', OUT + '.md'), r.md); fs.writeFileSync(path.join(R, 'docs', OUT + '.docx'), docx);
  // ida e volta: tudo o que foi escrito tem de voltar igual
  const got = r.parsed.answers || r.parsed.ans || r.parsed; let miss = [], total = 0;
  const norm = v => (Array.isArray(v) ? v.slice().sort().join('; ') : String(v == null ? '' : v)).replace(/\s+/g, ' ').trim();
  Object.keys(ans).forEach(k => { const A = ans[k], G = got[k]; if (Array.isArray(A)) A.forEach((it, i) => Object.keys(it).forEach(f => { if (!norm(it[f])) return; total++; if (norm(((G || [])[i] || {})[f]) !== norm(it[f])) miss.push(k + '[' + i + '].' + f); })); else Object.keys(A).forEach(f => { if (!norm(A[f])) return; total++; if (norm((G || {})[f]) !== norm(A[f])) miss.push(k + '.' + f); }); });
  console.log('campos preenchidos:', total, '· voltaram iguais:', total - miss.length, miss.length ? '· FALTARAM: ' + miss.join(', ') : '· TUDO OK');
  await b.close(); if (miss.length) process.exit(1);
})().catch(e => { console.log('ERRO', e.message); process.exit(1); });
