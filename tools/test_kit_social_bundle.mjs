/* Garante que js/kit-social.js (script único) dá exatamente o mesmo resultado que os módulos .ts originais.
   Uso: node --experimental-strip-types tools/test_kit_social_bundle.mjs */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = {}; vm.createContext(ctx); vm.runInContext(readFileSync(path.join(root, 'js/kit-social.js'), 'utf8') + ';this.KS = KS;', ctx);
const KS = ctx.KS, T = n => import(pathToFileURL(path.join(root, 'vendor/kit-social/nucleo', n + '.ts')).href);
const J = o => JSON.parse(JSON.stringify(o, (k, v) => Object.prototype.toString.call(v) === '[object Map]' ? [...v.entries()] : v));
const conta = [{id: 'a', projectId: 'p', networkId: 'instagram', handle: '@x', displayName: 'X', status: 'ativa', origem: 'oauth', adAccountConnected: true, trackingSince: '2026-01-01', tokenExpiresAt: null, lastSyncAt: null, messagingApproved: true, avatarGradient: ''}];
const post = (id, status, when, reach = 0) => ({id, projectId: 'p', accountIds: ['a'], format: 'imagem', caption: 'Legenda #a @b ' + id, media: {count: 1, aspectRatio: '4:5', fileSizeMb: 2}, status, scheduledFor: status === 'publicado' ? null : when, publishedAt: status === 'publicado' ? when : null, createdBy: 'u', approvedBy: null, requiresApproval: true, metrics: status === 'publicado' ? {reach, impressions: reach * 2, likes: 10, comments: 2, shares: 1, saves: 3} : null, coverGradient: ''});
const posts = [post('1', 'publicado', '2026-09-08T09:00:00-03:00', 1000), post('2', 'publicado', '2026-09-10T19:00:00-03:00', 3000), post('3', 'agendado', '2026-10-08T12:00:00-03:00'), post('4', 'rascunho', null)];
const boosts = [{id: 'b', postId: '2', accountId: 'a', objective: 'alcance', budgetTotal: 100, durationDays: 3, startedAt: '2026-09-11', endsAt: '2026-09-14', status: 'encerrado', audience: {locations: ['Salvador, BA'], ageMin: 18, ageMax: 40, interests: []}, results: {spend: 100, reach: 1500, impressions: 3000, engagement: 50, clicks: 20, porLocal: [{local: 'Salvador, Bahia', reach: 900, spend: 60}, {local: 'Recife', reach: 600, spend: 40}]}}];
const metrics = Array.from({length: 30}, (_, i) => ({date: new Date(Date.UTC(2026, 8, 1 + i)).toISOString().slice(0, 10), followers: 1000 + i * 5, followersGained: 8, followersLost: 3, organicReach: 300 + i, paidReach: i % 4 ? 0 : 200, organicImpressions: 500, paidImpressions: 0, organicEngagement: 20, paidEngagement: 0, adSpend: 0}));
const [ag, nw, pv, an, op, lc, rc, cv, hr, fm] = await Promise.all(['agenda', 'networks', 'previa', 'analytics', 'organico-pago', 'localidades', 'recomendacoes', 'conteudo', 'horarios', 'format'].map(T));
const cases = {
  validate: [nw.validateDraft({format: 'carrossel', caption: 'x', media: {count: 14, aspectRatio: '4:5', fileSizeMb: 3}}, conta), KS.networks.validateDraft({format: 'carrossel', caption: 'x', media: {count: 14, aspectRatio: '4:5', fileSizeMb: 3}}, conta)],
  quadro: [ag.montarQuadro(posts), KS['agenda'].montarQuadro(posts)],
  dias: [ag.distribuirPorDia([], posts), KS.agenda.distribuirPorDia([], posts)],
  corte: [pv.cortarLegenda('a '.repeat(100)), KS.previa.cortarLegenda('a '.repeat(100))],
  grade: [pv.gradeDoPerfil(posts), KS.previa.gradeDoPerfil(posts)],
  recorte: [op.recortarPecas(posts, boosts, conta), KS['organico-pago'].recortarPecas(posts, boosts, conta)],
  resumo: [an.summarize(an.slicePeriod(metrics, '30d'), '30d'), KS.analytics.summarize(KS.analytics.slicePeriod(metrics, '30d'), '30d')],
  locais: [lc.alcancePorLocal(boosts), KS.localidades.alcancePorLocal(boosts)],
  horarios: [hr.melhoresHorarios(cv.avaliarPecas(posts, []), {minimoDePecas: 1}), KS.horarios.melhoresHorarios(KS.conteudo.avaliarPecas(posts, []), {minimoDePecas: 1})],
  recomendar: [rc.recomendar({contas: conta, metricasPorConta: new Map([['a', metrics]]), posts, period: '30d', interacoesPendentes: 0, pendenteMaisAntigaEm: null, agoraMs: Date.UTC(2026, 9, 1)}), KS.recomendacoes.recomendar({contas: conta, metricasPorConta: new Map([['a', metrics]]), posts, period: '30d', interacoesPendentes: 0, pendenteMaisAntigaEm: null, agoraMs: Date.UTC(2026, 9, 1)})],
  moeda: [fm.formatCurrency(1234.5), KS.format.formatCurrency(1234.5)]
};
let n = 0; for (const [k, [a, b]] of Object.entries(cases)) { assert.deepEqual(J(b), J(a), k); n++; }
console.log(`bundle = TypeScript original em ${n} funções`);
