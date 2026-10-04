/* ===== Briefing do cliente: perguntas do formulário (usadas pela página pública briefing.html e pelo Studio),
   texto para a IA e planilha (CSV). Tipos: text, tel, email, url, area, select, checks. ===== */
const BF_TONES = ['Formal', 'Próximo e acolhedor', 'Técnico', 'Direto', 'Divertido', 'Inspirador', 'Sério e seguro'];
const BF_SECTIONS = [
  {k: 'contato', t: 'Quem está respondendo', d: 'Para a gente falar com a pessoa certa.', f: [
    ['nome', 'Seu nome', 'text', 1], ['cargo', 'Seu cargo ou função', 'text'], ['whatsapp', 'Seu WhatsApp (com DDD)', 'tel', 1], ['email', 'Seu e-mail', 'email']]},
  {k: 'empresa', t: 'Sobre a empresa', d: 'Conte como se estivesse apresentando a empresa para alguém que não a conhece.', f: [
    ['nome', 'Nome da empresa (como as pessoas a conhecem)', 'text', 1], ['razao', 'Razão social ou CNPJ (opcional)', 'text'], ['site', 'Site (se tiver)', 'url'], ['instagram', 'Instagram (link ou @)', 'text'], ['redes', 'Outras redes: Facebook, TikTok, LinkedIn, YouTube', 'text'],
    ['cidade', 'Cidade e região onde atende', 'text'], ['tempo', 'Há quanto tempo a empresa existe', 'text'], ['equipe', 'Tamanho da equipe', 'text'],
    ['historia', 'A história da empresa, em poucas linhas', 'area'], ['missao', 'Missão, valores e propósito (se existirem)', 'area'],
    ['diferenciais', 'O que a empresa faz melhor do que os concorrentes? (um por linha)', 'area'],
    ['tom', 'Como a empresa fala com as pessoas?', 'checks', BF_TONES], ['usar', 'Palavras e expressões que a empresa USA', 'area'], ['evitar', 'Palavras e assuntos que a empresa EVITA', 'area'],
    ['regras', 'Regras do setor que a comunicação precisa seguir (OAB, CRM, CREA, ANVISA...). O que é proibido anunciar?', 'area']]},
  {k: 'publico', t: 'O cliente do seu cliente', d: 'Quem compra de você e como ele pensa. Escreva do jeito que ele fala.', f: [
    ['quem', 'Quem são os seus clientes? (perfil, idade, cidade, profissão)', 'area'], ['decide', 'Quem decide a compra? Alguém mais participa?', 'text'],
    ['situacoes', 'Em que situações as pessoas procuram vocês? (liste as mais comuns, uma por linha)', 'area'],
    ['problemas', 'Quais problemas e dores elas têm quando chegam? (uma por linha)', 'area'], ['perguntas', 'Que perguntas elas sempre fazem antes de contratar ou comprar? (uma por linha)', 'area'],
    ['desejos', 'O que elas querem alcançar?', 'area'], ['ocultas', 'O que elas sentem, mas não costumam dizer? (medo, vergonha, desconfiança)', 'area'],
    ['objecoes', 'Que objeções aparecem? ("é caro", "preciso pensar", "já tentei antes")', 'area'], ['descobre', 'Como elas encontram vocês hoje?', 'checks', ['Indicação', 'Instagram', 'Google', 'Facebook', 'WhatsApp', 'Site', 'Anúncios', 'Parceiros', 'Eventos']],
    ['perdem', 'Por que algumas pessoas procuram e não fecham?', 'area']]},
  {k: 'produtos', t: 'Produtos e serviços', d: 'Cadastre cada produto ou serviço que quer divulgar (até 8). Quanto mais detalhe, melhores serão os anúncios, os posts e a página de vendas.', repeat: 8, item: 'Produto ou serviço', f: [
    ['nome', 'Nome', 'text', 1], ['tipo', 'Tipo', 'select', ['Serviço', 'Produto', 'Curso ou treinamento', 'Evento', 'Outro']], ['oque', 'O que é, em 2 ou 3 frases', 'area'], ['paraquem', 'Para quem é', 'area'],
    ['como', 'Como funciona? Etapas, do primeiro contato até a entrega', 'area'], ['incluso', 'O que está incluso', 'area'], ['preco', 'Preço ou faixa de preço (ou "sob consulta")', 'text'], ['prazo', 'Prazo de entrega ou duração', 'text'],
    ['diferencial', 'Por que escolher este e não o do concorrente?', 'area'], ['perguntas', 'Perguntas que as pessoas fazem sobre ele (uma por linha)', 'area'],
    ['provas', 'Resultados, casos e depoimentos REAIS que você pode usar (só o que é verdadeiro e autorizado)', 'area'], ['objecoes', 'Objeções mais comuns', 'area'],
    ['acao', 'O que a pessoa deve fazer ao ver o anúncio?', 'select', ['Agendar uma conversa', 'Falar no WhatsApp', 'Pedir orçamento', 'Comprar online', 'Preencher um formulário', 'Outro']], ['link', 'Link de compra ou agendamento (se houver)', 'url']]},
  {k: 'concorrencia', t: 'Concorrentes e referências', f: [
    ['lista', 'Quem são os principais concorrentes? (nome e @ ou site, um por linha)', 'area'], ['admira', 'Quais empresas ou perfis você admira? O que gosta neles?', 'area'], ['naoquer', 'O que você NÃO quer que a empresa pareça?', 'area']]},
  {k: 'marketing', t: 'Marketing e vendas hoje', f: [
    ['canais', 'O que já usam hoje? (Instagram, Google, anúncios, blog, indicação...)', 'area'], ['ja', 'O que já foi feito e funcionou? O que não funcionou?', 'area'],
    ['orcamento', 'Orçamento mensal para anúncios (faixa; pode ser aproximado)', 'text'], ['metas', 'Metas para os próximos meses (contatos, vendas, agendamentos por mês)', 'area'], ['prazo', 'Datas importantes ou prazos', 'text'],
    ['atendimento', 'Quem atende os contatos? Em que horários? Responde rápido no WhatsApp?', 'area'], ['ferramentas', 'Usam algum CRM, planilha ou sistema de vendas?', 'text']]},
  {k: 'materiais', t: 'Materiais e acessos', d: 'Cole links (Google Drive, Dropbox...). Não envie senhas por aqui.', f: [
    ['logo', 'Link com a logo (de preferência em PNG ou SVG)', 'url'], ['fotos', 'Link com fotos da empresa, da equipe e dos produtos', 'url'], ['videos', 'Link com vídeos', 'url'], ['marca', 'Cores, fontes ou manual de marca (link ou descrição)', 'area'], ['outros', 'Outros materiais úteis (apresentações, tabelas de preço, depoimentos)', 'area']]}
];
const bfSec = k => BF_SECTIONS.find(s => s.k === k);
const bfStr = v => (Array.isArray(v) ? v.join(', ') : String(v == null ? '' : v)).trim();
/* respostas em texto corrido, para a IA e para ler */
function bfText(a, name) {
  a = a || {}; const L = [`BRIEFING DETALHADO DO CLIENTE${name ? ' · ' + name : ''}`];
  BF_SECTIONS.forEach(s => {
    if (s.repeat) { const items = (Array.isArray(a[s.k]) ? a[s.k] : []).filter(x => x && bfStr(x.nome)); if (!items.length) return; L.push(`\n## ${s.t}`); items.forEach((it, i) => { L.push(`\n${s.item} ${i + 1}: ${bfStr(it.nome)}`); s.f.slice(1).forEach(([k, l]) => { const v = bfStr(it[k]); if (v) L.push(`- ${l}: ${v}`); }); }); return; }
    const x = a[s.k] || {}, rows = s.f.map(([k, l]) => [l, bfStr(x[k])]).filter(r => r[1]); if (!rows.length) return; L.push(`\n## ${s.t}`); rows.forEach(([l, v]) => L.push(`- ${l}: ${v}`));
  });
  const ex = (Array.isArray(a.extras) ? a.extras : []).filter(x => x && x.r); if (ex.length) { L.push('\n## Outras respostas'); ex.forEach(x => L.push(`- ${x.q}: ${x.r}`)); }
  return L.join('\n');
}
/* planilha: uma linha por pergunta respondida */
function bfRows(a) {
  a = a || {}; const R = [['Seção', 'Item', 'Pergunta', 'Resposta']];
  BF_SECTIONS.forEach(s => { if (s.repeat) (Array.isArray(a[s.k]) ? a[s.k] : []).forEach((it, i) => { if (!it || !bfStr(it.nome)) return; s.f.forEach(([k, l]) => { const v = bfStr(it[k]); if (v) R.push([s.t, (s.item + ' ' + (i + 1)), l, v]); }); }); else { const x = a[s.k] || {}; s.f.forEach(([k, l]) => { const v = bfStr(x[k]); if (v) R.push([s.t, '', l, v]); }); } });
  (Array.isArray(a.extras) ? a.extras : []).forEach(x => { if (x && x.r) R.push(['Outras respostas', '', x.q, x.r]); });
  return R;
}
/* o que falta para poder enviar */
function bfMissing(a) {
  a = a || {}; const m = []; if (!bfStr((a.empresa || {}).nome)) m.push('nome da empresa'); if (!bfStr((a.contato || {}).nome)) m.push('seu nome'); if (!bfStr((a.contato || {}).whatsapp)) m.push('seu WhatsApp');
  if (!(Array.isArray(a.produtos) ? a.produtos : []).some(x => x && bfStr(x.nome))) m.push('pelo menos um produto ou serviço'); if (!a.aceite) m.push('a autorização de uso das informações'); return m;
}
