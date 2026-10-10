/* ===== Briefing do cliente: perguntas do formulário (usadas pela página pública briefing.html e pelo Studio),
   texto para a IA e planilha (CSV). Tipos: text, tel, email, url, area, select, checks. ===== */
const BF_SLIDE = {formal: ['Bem formal', 'Mais formal', 'Equilibrado', 'Mais informal', 'Bem informal'], humor: ['Bem sério', 'Mais sério', 'Equilibrado', 'Mais bem-humorado', 'Muito bem-humorado'], tecnico: ['Bem técnico', 'Mais técnico', 'Equilibrado', 'Mais simples', 'Bem simples e direto'], calor: ['Bem reservado', 'Mais reservado', 'Equilibrado', 'Mais caloroso', 'Bem caloroso'], ousadia: ['Bem contido', 'Mais contido', 'Equilibrado', 'Mais ousado', 'Bem ousado']};
const BF_TONES = ['Formal', 'Próximo e acolhedor', 'Técnico', 'Direto', 'Divertido', 'Inspirador', 'Sério e seguro'];
const BF_SECTIONS = [
  {k: 'contato', t: 'Quem está respondendo', d: 'Para a gente falar com a pessoa certa.', f: [
    ['nome', 'Seu nome', 'text', 1], ['cargo', 'Seu cargo ou função', 'text'], ['whatsapp', 'Seu WhatsApp (com DDD)', 'tel', 1], ['email', 'Seu e-mail', 'email']]},
  {k: 'empresa', t: 'Sobre a empresa', d: 'Conte como se estivesse apresentando a empresa para alguém que não a conhece.', f: [
    ['nome', 'Nome da empresa (como as pessoas a conhecem)', 'text', 1], ['razao', 'Razão social ou CNPJ (opcional)', 'text'], ['site', 'Site (se tiver)', 'url'], ['instagram', 'Instagram (link ou @)', 'text'], ['redes', 'Outras redes: Facebook, TikTok, LinkedIn, YouTube', 'text'],
    ['cidade', 'Cidade e região onde atende', 'text'], ['tempo', 'Há quanto tempo a empresa existe', 'text'], ['equipe', 'Tamanho da equipe', 'text'],
    ['historia', 'A história da empresa, em poucas linhas', 'area'], ['missao', 'Missão, valores e propósito (se existirem)', 'area'],
    ['diferenciais', 'O que a empresa faz melhor do que os concorrentes? (um por linha)', 'area'],
    ['regras', 'Regras do setor que a comunicação precisa seguir (OAB, CRM, CREA, ANVISA...). O que é proibido anunciar?', 'area']]},
  {k: 'identidade', t: 'A marca: valores, atitudes e voz', d: 'Clique no que combina com a empresa. Com isso o Studio descobre o arquétipo da marca e o jeito certo de falar.', f: [
    ['valores', 'Quais valores são de verdade da empresa (ou de quem a comanda)? Escolha de 5 a 7.', 'checks', (typeof ID_VALUES !== 'undefined' ? ID_VALUES.map(x => x[1]) : [])], ['valoresExtra', 'Algum valor que não está na lista? (um por linha)', 'area'],
    ['atitudes', 'Como a empresa age no dia a dia? Escolha de 5 a 7.', 'checks', (typeof ID_ATTS !== 'undefined' ? ID_ATTS.map(x => x[1]) : [])], ['atitudesExtra', 'Alguma atitude que não está na lista? (uma por linha)', 'area'],
    ['t_formal', 'Tom de voz: formal ou informal?', 'select', BF_SLIDE.formal], ['t_humor', 'Sério ou bem-humorado?', 'select', BF_SLIDE.humor], ['t_tecnico', 'Técnico ou simples?', 'select', BF_SLIDE.tecnico], ['t_calor', 'Reservado ou caloroso?', 'select', BF_SLIDE.calor], ['t_ousadia', 'Contido ou ousado?', 'select', BF_SLIDE.ousadia],
    ['fala', 'O que a empresa FALA? Assuntos e jeitos de falar (um por linha)', 'area'], ['naoFala', 'O que a empresa NÃO fala? (um por linha)', 'area'],
    ['atitudeTem', 'Atitudes que a empresa TEM (um por linha)', 'area'], ['atitudeNao', 'Atitudes que a empresa NÃO tem, o que nunca faria (um por linha)', 'area'],
    ['admira', 'O que a empresa ADMIRA? Pessoas, comportamentos, ideias (um por linha)', 'area'], ['repudia', 'O que a empresa REPUDIA? (um por linha)', 'area'],
    ['usa', 'Palavras e expressões que a empresa USA (uma por linha)', 'area'], ['naoUsa', 'Palavras e expressões que a empresa NUNCA usa (uma por linha)', 'area']]},
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
    ['formato', 'Formato', 'select', ['Online', 'Presencial', 'Produto físico', 'Híbrido']], ['duracao', 'Duração (de uso, do atendimento ou do curso)', 'text'], ['peso', 'Peso (se for produto físico)', 'text'], ['tamanho', 'Tamanho ou dimensões (se houver)', 'text'],
    ['entrega', 'Como é entregue? (e-mail, Correios, no local, retirada…)', 'text'], ['validade', 'Validade, se houver (prazo de uso ou de consumo)', 'text'], ['garantia', 'Garantia (só se existir de verdade)', 'text'], ['pagamento', 'Formas de pagamento e parcelamento', 'text'],
    ['naoserve', 'Para quem NÃO serve', 'area'], ['problemas', 'Principais problemas que ele resolve (um por linha)', 'area'], ['tempo', 'Em quanto tempo o problema costuma ser resolvido?', 'text'], ['fotosprod', 'Link com fotos deste produto (se tiver)', 'url'],
    ['acao', 'O que a pessoa deve fazer ao ver o anúncio?', 'select', ['Agendar uma conversa', 'Falar no WhatsApp', 'Pedir orçamento', 'Comprar online', 'Preencher um formulário', 'Outro']], ['link', 'Link de compra ou agendamento (se houver)', 'url']]},
  {k: 'concorrencia', t: 'Concorrentes', d: 'Cadastre os principais concorrentes (até 8). Cole o site e o Instagram de cada um e conte o pouco que você sabe.', repeat: 8, item: 'Concorrente', f: [
    ['nome', 'Nome do concorrente', 'text', 1], ['site', 'Site', 'url'], ['instagram', 'Instagram (link ou @)', 'text'], ['oque', 'O que vendem e para quem', 'area'], ['preco', 'Faixa de preço (se souber)', 'text'],
    ['forte', 'O que eles fazem bem', 'area'], ['fraco', 'O que fazem mal ou deixam de fazer', 'area'], ['diferenca', 'Em que a sua empresa é diferente deles', 'area'], ['outros', 'Outros links (anúncios, avaliações, notícias)', 'text']]},
  {k: 'referencias', t: 'Referências e o que evitar', f: [
    ['admira', 'Quais empresas ou perfis você admira (de qualquer área)? O que gosta neles?', 'area'], ['naoquer', 'O que você NÃO quer que a empresa pareça?', 'area']]},
  {k: 'marketing', t: 'Marketing e vendas hoje', f: [
    ['canais', 'O que já usam hoje? (Instagram, Google, anúncios, blog, indicação...)', 'area'], ['ja', 'O que já foi feito e funcionou? O que não funcionou?', 'area'],
    ['orcamento', 'Orçamento mensal para anúncios (faixa; pode ser aproximado)', 'text'], ['metas', 'Metas para os próximos meses (contatos, vendas, agendamentos por mês)', 'area'], ['prazo', 'Datas importantes ou prazos', 'text'],
    ['atendimento', 'Quem atende os contatos? Em que horários? Responde rápido no WhatsApp?', 'area'], ['ferramentas', 'Usam algum CRM, planilha ou sistema de vendas?', 'text']]},
  {k: 'depoimentos', t: 'Depoimentos de clientes', d: 'Só coloque o que é verdadeiro. Se a pessoa ainda não autorizou o uso, marque isso: a gente não usa sem autorização.', repeat: 10, item: 'Depoimento', f: [
    ['nome', 'Quem falou (nome, ou "cliente de Campinas")', 'text', 1], ['texto', 'O que a pessoa disse (copie do jeito que ela escreveu)', 'area'], ['link', 'Link do vídeo, post ou avaliação (se houver)', 'url'], ['produto', 'Sobre qual produto ou serviço?', 'text'], ['autorizado', 'A pessoa autorizou o uso?', 'select', ['Sim, autorizou', 'Ainda preciso pedir', 'Não pode usar']]]},
  {k: 'materiais', t: 'Links e materiais que já existem', d: 'Cole links (Google Drive, Dropbox, site, Instagram…). Não envie senhas por aqui.', f: [
    ['logo', 'Link com a logo (de preferência em PNG ou SVG)', 'url'], ['fotos', 'Link com fotos da empresa, da equipe e dos produtos', 'url'], ['videos', 'Link com vídeos', 'url'], ['marca', 'Cores, fontes ou manual de marca (link ou descrição)', 'area'],
    ['jafeito', 'Materiais de comunicação que a empresa já fez: posts, anúncios, folders, site antigo (cole os links, um por linha)', 'area'], ['outros', 'Outros materiais úteis (apresentações, tabelas de preço…)', 'area']]},
  {k: 'arquivos', t: 'Fotos e arquivos', d: 'Envie direto daqui: logo, fotos, materiais que já usa, prints de depoimentos. Imagens (JPG, PNG, WebP) e PDF.', files: [['logo', 'Logo'], ['fotos', 'Fotos da empresa e da equipe'], ['produtos', 'Fotos dos produtos'], ['materiais', 'Materiais de comunicação que já fez (posts, anúncios, folders, PDF)'], ['depoimentos', 'Prints e fotos de depoimentos']], f: []}
];
/* respostas antigas (concorrência em campos soltos) → formato novo */
function bfMigrate(a) {
  a = a && typeof a === 'object' && !Array.isArray(a) ? a : {};
  if (a.concorrencia && !Array.isArray(a.concorrencia)) {
    const K = a.concorrencia, lines = String(K.lista || '').split(/\n+/).map(x => x.trim()).filter(Boolean).slice(0, 8);
    a.concorrencia = lines.map(l => { const m = l.match(/https?:\/\/\S+/), at = l.match(/@[\w.]+/); return {nome: l.replace(/https?:\/\/\S+|@[\w.]+/g, '').replace(/[-–,;:|()]+\s*$/g, '').trim() || l.slice(0, 60), site: m ? m[0] : '', instagram: at ? at[0] : ''}; });
    if (K.admira || K.naoquer) a.referencias = Object.assign({admira: K.admira || '', naoquer: K.naoquer || ''}, a.referencias || {});
  }
  return a;
}
const bfSec = k => BF_SECTIONS.find(s => s.k === k);
const bfStr = v => (Array.isArray(v) ? v.join(', ') : String(v == null ? '' : v)).trim();
/* respostas em texto corrido, para a IA e para ler */
function bfText(a, name) {
  a = a || {}; const L = [`BRIEFING DETALHADO DO CLIENTE${name ? ' · ' + name : ''}`];
  a = bfMigrate(a);
  BF_SECTIONS.forEach(s => {
    if (s.files) { const fl = (Array.isArray(a[s.k]) ? a[s.k] : []); if (!fl.length) return; L.push(`\n## ${s.t}`); s.files.forEach(([c, l]) => { const g = fl.filter(f => f.cat === c); if (g.length) L.push(`- ${l}: ${g.length} arquivo(s) (${g.map(f => f.name).slice(0, 8).join(', ')})`); }); return; }
    if (s.repeat) { const items = (Array.isArray(a[s.k]) ? a[s.k] : []).filter(x => x && bfStr(x.nome)); if (!items.length) return; L.push(`\n## ${s.t}`); items.forEach((it, i) => { L.push(`\n${s.item} ${i + 1}: ${bfStr(it.nome)}`); s.f.slice(1).forEach(([k, l]) => { const v = bfStr(it[k]); if (v) L.push(`- ${l}: ${v}`); }); }); return; }
    const x = a[s.k] || {}, rows = s.f.map(([k, l]) => [l, bfStr(x[k])]).filter(r => r[1]); if (!rows.length) return; L.push(`\n## ${s.t}`); rows.forEach(([l, v]) => L.push(`- ${l}: ${v}`));
  });
  const ex = (Array.isArray(a.extras) ? a.extras : []).filter(x => x && x.r); if (ex.length) { L.push('\n## Outras respostas'); ex.forEach(x => L.push(`- ${x.q}: ${x.r}`)); }
  return L.join('\n');
}
/* planilha: uma linha por pergunta respondida */
function bfRows(a) {
  a = a || {}; const R = [['Seção', 'Item', 'Pergunta', 'Resposta']];
  a = bfMigrate(a); BF_SECTIONS.forEach(s => { if (s.files) { (Array.isArray(a[s.k]) ? a[s.k] : []).forEach(f => R.push([s.t, '', (s.files.find(x => x[0] === f.cat) || [0, f.cat])[1], f.name])); return; } if (s.repeat) (Array.isArray(a[s.k]) ? a[s.k] : []).forEach((it, i) => { if (!it || !bfStr(it.nome)) return; s.f.forEach(([k, l]) => { const v = bfStr(it[k]); if (v) R.push([s.t, (s.item + ' ' + (i + 1)), l, v]); }); }); else { const x = a[s.k] || {}; s.f.forEach(([k, l]) => { const v = bfStr(x[k]); if (v) R.push([s.t, '', l, v]); }); } });
  (Array.isArray(a.extras) ? a.extras : []).forEach(x => { if (x && x.r) R.push(['Outras respostas', '', x.q, x.r]); });
  return R;
}
/* o que falta para poder enviar */
function bfMissing(a) {
  a = a || {}; const m = []; if (!bfStr((a.empresa || {}).nome)) m.push('nome da empresa'); if (!bfStr((a.contato || {}).nome)) m.push('seu nome'); if (!bfStr((a.contato || {}).whatsapp)) m.push('seu WhatsApp');
  if (!(Array.isArray(a.produtos) ? a.produtos : []).some(x => x && bfStr(x.nome))) m.push('pelo menos um produto ou serviço'); if (!a.aceite) m.push('a autorização de uso das informações'); return m;
}
