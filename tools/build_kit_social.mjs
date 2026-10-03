/* Converte vendor/kit-social/nucleo/*.ts (TypeScript puro, sem dependências) em js/kit-social.js:
   um único script clássico (sem import/export), que o Studio carrega sem etapa de build no navegador.
   Cada módulo vira KS.<modulo> (ex.: KS.agenda.montarQuadro). Uso: node tools/build_kit_social.mjs
   Requer Node 22.13+ (module.stripTypeScriptTypes). Não edite js/kit-social.js à mão: edite o .ts e rode de novo. */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'vendor/kit-social/nucleo');
const names = readdirSync(dir).filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts')).map(f => f.slice(0, -3));
const src = {}, deps = {};
for (const n of names) {
  const code = stripTypeScriptTypes(readFileSync(path.join(dir, n + '.ts'), 'utf8'), { mode: 'strip' });
  src[n] = code; deps[n] = [...code.matchAll(/from\s+["']\.\/([\w-]+)\.ts["']/g)].map(m => m[1]);
}
const order = [], seen = new Set();
const visit = n => { if (seen.has(n)) return; seen.add(n); (deps[n] || []).forEach(visit); order.push(n); };
names.forEach(visit);

let out = `/* GERADO por tools/build_kit_social.mjs a partir de vendor/kit-social/nucleo/*.ts. Não edite à mão. */\nconst KS = (() => {\n  const __KS = {};\n`;
for (const n of order) {
  let code = src[n];
  code = code.replace(/^\s*import\s*\{([\s\S]*?)\}\s*from\s*["']\.\/([\w-]+)\.ts["'];?/gm, (_, list, mod) => {
    const items = list.split(',').map(s => s.trim()).filter(Boolean).map(s => s.replace(/^type\s+/, '')).filter(Boolean).map(s => s.replace(/\s+as\s+/, ': '));
    return items.length ? `const { ${items.join(', ')} } = __KS['${mod}'];` : '';
  });
  const exp = [];
  code = code.replace(/^export\s+(async\s+function|function|const|let|var|class)\s+(\w+)/gm, (_, kind, name) => { exp.push(name); return `${kind} ${name}`; });
  code = code.replace(/^export\s*\{([^}]*)\};?/gm, (_, list) => { list.split(',').map(s => s.trim()).filter(Boolean).forEach(s => exp.push(s.split(/\s+as\s+/).pop())); return ''; });
  if (/^export\s+default/m.test(code)) throw new Error(n + ': export default não suportado');
  if (/^\s*import\s/m.test(code)) throw new Error(n + ': import não tratado');
  out += `  __KS['${n}'] = (() => {\n${code}\n  return { ${[...new Set(exp)].join(', ')} };\n  })();\n`;
}
out += `  return __KS;\n})();\n`;
writeFileSync(path.join(root, 'js/kit-social.js'), out);
console.log(`js/kit-social.js: ${order.length} módulos, ${(out.length / 1024).toFixed(0)} KB`);
