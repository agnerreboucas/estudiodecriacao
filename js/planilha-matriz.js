/* ===== Criar a partir de planilha: o Studio usa as SUAS planilhas como padrão.
   Anúncios: ID | Fase | Ângulo | Headline | Sub-headline | Texto Principal | Descrição.   Carrosséis: abas POSTS e SLIDES (uma frase por slide, com referência visual).
   O site baixa a matriz de cada tipo no mesmo formato; você preenche, envia, vê a prévia e confirma. Nada que já existe é alterado. As imagens não vão na planilha: use o nome da imagem da biblioteca. ===== */

const PM_FASE_ID = {descoberta: 'descoberta', atencao: 'atracao', atracao: 'atracao', consideracao: 'consideracao', compra: 'acao', acao: 'acao', apologia: 'apologia'};
const PM_DEF = {
  ads: {name: 'Anúncios', cols: [
    {k: 'id', h: 'ID', w: 9, al: ['id', 'codigo'], d: 'Código do anúncio (ex.: D01). Aparece no nome e na peça.'},
    {k: 'fase', h: 'Fase', req: 1, w: 15, al: ['fase', 'fasedajornada'], list: ['Descoberta', 'Atenção', 'Consideração', 'Compra', 'Apologia'], d: 'Descoberta, Atenção, Consideração, Compra ou Apologia. (Atenção = Atração e Compra = Ação no Studio.)'},
    {k: 'angulo', h: 'Ângulo', w: 28, al: ['angulo'], d: 'O ângulo criativo do anúncio. Fica registrado na peça.'},
    {k: 'headline', h: 'Headline', req: 1, w: 44, al: ['headline', 'titulo'], d: 'O título da arte. Até 120 caracteres para caber bem.'},
    {k: 'sub', h: 'Sub-headline', w: 44, al: ['subheadline', 'subtitulo', 'textodeapoio'], d: 'A linha de apoio abaixo do título na arte.'},
    {k: 'texto', h: 'Texto Principal', w: 60, al: ['textoprincipal'], d: 'O texto principal do anúncio no Meta (até 2.200 caracteres). Fica na peça.'},
    {k: 'desc', h: 'Descrição', w: 36, al: ['descricao'], d: 'A descrição do anúncio no Meta (até 150 caracteres). Fica na peça.'},
    {k: 'botao', h: 'Botão (CTA)', w: 20, al: ['botaocta', 'botao', 'cta'], d: 'OPCIONAL. Texto do botão da arte. Em branco: o Studio usa o botão padrão da fase. Escreva - para a arte sem botão.'},
    {k: 'imagem', h: 'Imagem (nome na biblioteca)', w: 26, al: ['imagemnomenabiblioteca', 'imagem'], d: 'OPCIONAL. Nome de uma imagem já subida em Imagens. Em branco: usa a imagem da peça modelo ou fica só com texto.'},
    {k: 'campanha', h: 'Campanha', w: 26, al: ['campanha'], d: 'OPCIONAL. Para várias campanhas na mesma planilha. Em branco: tudo entra na campanha que você nomear no Studio.'}]},
  posts: {name: 'POSTS', cols: [
    {k: 'post', h: 'Post', req: 1, w: 8, al: ['post', 'codigo'], d: 'Código do post (P001...). Liga esta linha aos slides da aba SLIDES.'},
    {k: 'dia', h: 'Dia', w: 9, al: ['dia'], d: 'Dia do calendário (Dia 01...). Vira filtro na lista de carrosséis.'},
    {k: 'ordem', h: 'Ordem no dia', w: 9, al: ['ordemnodia', 'ordem'], d: 'Posição do post dentro do dia.'},
    {k: 'tema', h: 'Indústria / Cluster', w: 26, al: ['industriacluster', 'industriatema', 'tema'], d: 'Tema ou indústria do post.'},
    {k: 'publico', h: 'Público / Profissões', w: 30, al: ['publicoprofissoes', 'publico'], d: 'Quem deve se identificar.'},
    {k: 'tipo', h: 'Tipo estratégico', w: 22, al: ['tipoestrategico', 'tipo'], d: 'Ex.: Análise de Tendência, Case de Sucesso.'},
    {k: 'perguntaE', h: 'Pergunta estratégica', w: 28, al: ['perguntaestrategica'], d: 'A pergunta que o post responde.'},
    {k: 'conflito', h: 'Conflito central', w: 40, al: ['conflitocentral'], d: 'O conflito do post.'},
    {k: 'conceito', h: 'Conceito editorial', w: 40, al: ['conceitoeditorial'], d: 'O conceito editorial.'},
    {k: 'tensao', h: 'Tensão de comentário', w: 18, al: ['tensaodecomentario', 'tensao'], d: 'Ex.: Opinião, Escolha, Confronto.'},
    {k: 'perguntaC', h: 'Pergunta central', w: 36, al: ['perguntacentral'], d: 'A pergunta que vai para os comentários.'},
    {k: 'capa', h: 'Headline / Capa', w: 40, al: ['headlinecapa', 'headline', 'capa'], d: 'O título da capa. Vira o nome do carrossel (com o código).'},
    {k: 'marcas', h: 'Marcas de referência (1–5)', w: 30, al: ['marcasdereferencia15', 'marcasdereferencia', 'marcas'], d: 'Marcas que servem de referência visual.'},
    {k: 'busca', h: 'Busca principal de capa', w: 40, al: ['buscaprincipaldecapa'], d: 'Termo de busca para a imagem da capa.'},
    {k: 'objetivo', h: 'Objetivo', w: 40, al: ['objetivo'], d: 'O objetivo do post.'}]},
  slides: {name: 'SLIDES', cols: [
    {k: 'post', h: 'Post', req: 1, w: 8, al: ['post', 'codigo'], d: 'Código do post (igual ao da aba POSTS).'},
    {k: 'dia', h: 'Dia', w: 9, al: ['dia'], d: 'Dia do calendário.'},
    {k: 'slide', h: 'Slide', req: 1, w: 7, al: ['slide', 'numerodoslide', 'n'], d: 'Número do slide: 1, 2, 3... sem pular. De 3 a 20 slides por post.'},
    {k: 'tipo', h: 'Tipo', w: 16, al: ['tipo'], list: ['Capa', 'Desenvolvimento', 'CTA'], d: 'Capa, Desenvolvimento ou CTA. Só informativo: a posição do slide é que manda.'},
    {k: 'texto', h: 'Texto do slide', req: 1, w: 60, al: ['textodoslide', 'texto'], d: 'O texto do slide (uma frase). Use **palavra** para destacar.'},
    {k: 'ref', h: 'Referência visual', w: 50, al: ['referenciavisual'], d: 'Como deve ser a imagem do slide. Aparece ao lado do texto no editor.'},
    {k: 'marcas', h: 'Marca(s) de referência', w: 30, al: ['marcasdereferencia', 'marcadereferencia', 'marcas'], d: 'Marcas de referência visual.'},
    {k: 'termo', h: 'Termo de busca', w: 44, al: ['termodebusca', 'busca'], d: 'Termo para buscar a imagem (botão de busca no editor).'}]}
};
const PM_PLAN_SHEETS = [{name: 'LINHA EDITORIAL', cols: ['Elemento', 'Definição', 'Regra']}, {name: 'CLUSTERS', cols: ['Indústria / Tema', 'Cluster principal', 'Profissões / Públicos associados']}, {name: 'CALENDÁRIO', cols: ['Dia', 'Tema central', 'Posts', 'Clusters']}];
const PM_EX = {
  ads: [['(exemplo) D01', 'Descoberta', 'Curiosidade + criatividade', 'E se você pudesse desenhar com luz?', 'Aprenda a transformar luz em fotografia.', 'Já imaginou usar a luz para criar a própria imagem? Venha experimentar na prática.', 'Fotografia com luz, criatividade e prática.', '', '', ''],
        ['(exemplo) C01', 'Compra', 'Urgência + vagas', 'Últimas vagas da turma', 'Garanta a sua antes que acabe.', 'As vagas são limitadas para que cada aluno tenha atenção. Reserve a sua agora.', 'Vagas limitadas. Garanta a sua.', 'Reservar vaga', '', '']],
  posts: [['(exemplo) P001', 'Dia 01', 1, 'Novo mundo do trabalho', 'CLT, PJ, Freelancer', 'Análise de Tendência', 'O que está mudando?', 'Uma situação cotidiana esconde uma discussão maior.', 'O nome da relação não explica como o trabalho funciona.', 'Opinião', 'Como essa situação deveria ser tratada?', 'Seu trabalho mudou, mas seus direitos mudaram junto?', 'Google; Microsoft', 'Novo mundo do trabalho cinematic vertical editorial cover', 'Gerar comentários e identificação.']],
  slides: [['(exemplo) P001', 'Dia 01', 1, 'Capa', 'Seu trabalho mudou, mas seus direitos mudaram junto?', 'Imagem de capa vertical, alto contraste.', 'Google; Microsoft', 'trabalho mudou direitos cinematic vertical cover']].concat([2, 3, 4, 5, 6, 7].map(i => ['(exemplo) P001', 'Dia 01', i, 'Desenvolvimento', `Frase de desenvolvimento do slide ${i}.`, 'Imagem documental do tema.', 'Google; Microsoft', 'professional working real life'])).concat([8, 9, 10].map(i => ['(exemplo) P001', 'Dia 01', i, 'CTA', i === 10 ? 'Como essa situação deveria ser tratada? Conta nos comentários.' : 'Salve este post para rever depois.', 'Pessoa com celular; sensação de comunidade.', 'Google; Microsoft', 'person smartphone conversation']))
};


/* carrossel por linha (um carrossel por linha, slides em colunas) e aba de legendas (orgânico) / título, texto principal e descrição (anúncio) */
PM_DEF.car1 = {name: 'CARROSSÉIS', dyn: /^slide(\d{1,2})(titulo|headline|texto|subheadline|subtitulo|paragrafo)?$/, cols: [
  {k: 'carrossel', h: 'Carrossel', req: 1, w: 34, al: ['carrossel', 'nomedocarrossel', 'nome'], d: 'Nome do carrossel. Um carrossel por linha.'},
  {k: 'codigo', h: 'Código', w: 9, al: ['codigo', 'id', 'post'], d: 'OPCIONAL. Código (P001...). Serve para achar o carrossel na lista e na aba de legendas.'},
  {k: 'dia', h: 'Dia', w: 9, al: ['dia'], d: 'OPCIONAL. Dia do calendário; vira filtro na lista.'},
  {k: 'objetivo', h: 'Objetivo', w: 14, al: ['objetivo'], list: ['Orgânico', 'Anúncio'], d: 'Orgânico (usa Legenda e Hashtags) ou Anúncio (usa Título, Texto principal e Descrição). Em branco: o Studio decide pelo que estiver preenchido.'},
  {k: 'etapa', h: 'Etapa do funil', w: 14, al: ['etapadofunil', 'etapa'], list: ['Topo', 'Meio', 'Fundo'], d: 'OPCIONAL. Topo, Meio ou Fundo.'},
  {k: 'proporcao', h: 'Proporção', w: 11, al: ['proporcao'], list: ['4:5', '9:16'], d: 'OPCIONAL. 4:5 (feed) ou 9:16 (stories). Em branco: 4:5.'},
  {k: 'legenda', h: 'Legenda', w: 50, al: ['legenda'], d: 'Orgânico: a legenda da publicação (até 2.200 caracteres).'},
  {k: 'hashtags', h: 'Hashtags', w: 28, al: ['hashtags'], d: 'Orgânico: hashtags (até 400 caracteres).'},
  {k: 'tituloAd', h: 'Título do anúncio', w: 30, al: ['titulodoanuncio'], d: 'Anúncio: o título (até 80 caracteres).'},
  {k: 'texto', h: 'Texto principal', w: 50, al: ['textoprincipal', 'textodoanuncio'], d: 'Anúncio: o texto principal (até 600 caracteres).'},
  {k: 'desc', h: 'Descrição', w: 34, al: ['descricao', 'descricaodoanuncio'], d: 'Anúncio: a descrição (até 120 caracteres).'},
  {k: 'botaoAd', h: 'Botão do anúncio', w: 18, al: ['botaodoanuncio'], d: 'Anúncio: texto do botão do Meta (até 40 caracteres).'},
  {k: 'botao', h: 'Texto do botão final', w: 20, al: ['textodobotaofinal', 'botaofinal'], d: 'OPCIONAL. O texto do botão do último slide (na imagem).'}]};
PM_DEF.caps = {name: 'LEGENDAS', cols: [
  {k: 'key', h: 'Post', req: 1, w: 12, al: ['post', 'codigo', 'id', 'carrossel', 'nome'], d: 'Código do post/carrossel (P001) ou ID do anúncio (D01). Liga a legenda ao item.'},
  {k: 'objetivo', h: 'Objetivo', w: 14, al: ['objetivo'], list: ['Orgânico', 'Anúncio'], d: 'Orgânico ou Anúncio. Em branco: o Studio decide pelo que estiver preenchido.'},
  {k: 'legenda', h: 'Legenda', w: 60, al: ['legenda'], d: 'Orgânico: a legenda da publicação.'},
  {k: 'hashtags', h: 'Hashtags', w: 28, al: ['hashtags'], d: 'Orgânico: hashtags.'},
  {k: 'tituloAd', h: 'Título do anúncio', w: 30, al: ['titulodoanuncio'], d: 'Anúncio de carrossel: o título.'},
  {k: 'texto', h: 'Texto principal', w: 50, al: ['textoprincipal', 'textodoanuncio'], d: 'Anúncio: o texto principal.'},
  {k: 'desc', h: 'Descrição', w: 34, al: ['descricao', 'descricaodoanuncio'], d: 'Anúncio: a descrição.'},
  {k: 'botaoAd', h: 'Botão do anúncio', w: 18, al: ['botaodoanuncio', 'botao', 'cta'], d: 'Anúncio de carrossel: texto do botão do Meta.'}]};
PM_EX.car1 = [['(exemplo) 3 sinais de atenção', 'C001', 'Dia 01', 'Orgânico', 'Topo', '4:5', 'Saiba reconhecer os 3 sinais antes de decidir.', '#orientacao #direitos', '', '', '', '', 'Salvar e compartilhar', 'Os **3 sinais** que quase todo mundo ignora', 'Veja antes de assinar.', 'Sinal 1: a parcela muda sem aviso', 'Confira se o contrato prevê reajuste.', 'Sinal 2: ninguém explica o seguro', 'Descubra o que está embutido.', 'Quer ajuda para entender o seu caso?', 'Salve este carrossel e fale com a gente.']];
PM_EX.caps = [['(exemplo) P001', 'Orgânico', 'Antes de assinar qualquer coisa, entenda o que está em jogo. Conte com a gente.', '#orientacao #direitos', '', '', '', ''], ['(exemplo) D01', 'Anúncio', '', '', 'Entenda a sua parcela', 'Antes de assinar, veja como a parcela é calculada. Atendimento sem compromisso.', 'Sem compromisso.', 'Saiba mais']];
/* ---------- texto: normalização para comparar cabeçalhos e valores ---------- */
const pmNorm = s => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '');
const pmTrim = s => String(s == null ? '' : s).replace(/\u00a0/g, ' ').trim();
const pmIsExample = v => /^\(\s*exemplo\s*\)/i.test(pmTrim(v));

/* ---------- escrita do .xlsx (ZIP sem compressão + XML; textos em linha, abre no Excel, Google Planilhas e LibreOffice) ---------- */
const pmX = s => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pmColName = i => { let n = i + 1, s = ''; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; };
/* estilos: 0 padrão · 1 cabeçalho opcional · 2 cabeçalho obrigatório · 3 exemplo (cinza itálico) · 4 título em negrito · 5 texto corrido */
const PM_STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="4"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><i/><sz val="11"/><color rgb="FF7A7A7A"/><name val="Calibri"/></font><font><b/><sz val="13"/><name val="Calibri"/></font></fonts><fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF374151"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE8590C"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="6"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="3" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
function pmCell(ref, v, s) {
  if (typeof v === 'number') return `<c r="${ref}" s="${s}"><v>${v}</v></c>`;
  if (v === '' || v == null) return `<c r="${ref}" s="${s}"/>`;
  return `<c r="${ref}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${pmX(v)}</t></is></c>`;
}
function pmSheetXml(rows, o) {   // rows: [{cells: [[valor, estilo]], ht}]
  o = o || {}; const cols = (o.widths || []).map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('');
  const body = rows.map((r, i) => `<row r="${i + 1}"${r.ht ? ` ht="${r.ht}" customHeight="1"` : ''}>${r.cells.map((c, j) => pmCell(pmColName(j) + (i + 1), c[0], c[1])).join('')}</row>`).join('');
  const dv = (o.lists || []).filter(l => l.items.join(',').length < 250).map(l => `<dataValidation type="list" errorStyle="warning" allowBlank="1" showErrorMessage="1" errorTitle="Valor diferente" error="Este valor não está na lista. Ele pode não ser reconhecido na importação." sqref="${pmColName(l.col)}2:${pmColName(l.col)}500"><formula1>"${pmX(l.items.join(','))}"</formula1></dataValidation>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"${o.first ? ' tabSelected="1"' : ''}>${o.freeze ? '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>' : ''}</sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/>${cols ? `<cols>${cols}</cols>` : ''}<sheetData>${body}</sheetData>${dv ? `<dataValidations count="${(o.lists || []).filter(l => l.items.join(',').length < 250).length}">${dv}</dataValidations>` : ''}</worksheet>`;
}
const pmEnt = s => String(s).replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (m, e) => { e = e.toLowerCase(); if (e === 'amp') return '&'; if (e === 'lt') return '<'; if (e === 'gt') return '>'; if (e === 'quot') return '"'; if (e === 'apos') return "'"; const cp = e[1] === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); try { return String.fromCodePoint(cp); } catch (x) { return ''; } }).replace(/_x([0-9A-Fa-f]{4})_/g, (m, h) => String.fromCharCode(parseInt(h, 16)));
async function pmUnzip(buf) {   // devolve {nome: Uint8Array} só das partes que o importador usa
  const dv = new DataView(buf), u8 = new Uint8Array(buf), out = {}; let e = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Error('Este arquivo não é uma planilha .xlsx válida.');
  const n = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true);
  for (let i = 0; i < n; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true), name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nlen));
    p += 46 + nlen + xlen + clen;
    if (!/^xl\/(workbook\.xml|_rels\/workbook\.xml\.rels|sharedStrings\.xml|worksheets\/[^/]+\.xml)$/.test(name)) continue;
    const start = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true); let data = u8.subarray(start, start + csize);
    if (method === 8) { const ds = new DecompressionStream('deflate-raw'), w = ds.writable.getWriter(); w.write(data); w.close(); data = new Uint8Array(await new Response(ds.readable).arrayBuffer()); } else if (method !== 0) throw new Error('Compressão do arquivo não suportada.');
    out[name] = data;
  }
  return out;
}
const pmTexts = xml => { const r = []; String(xml).replace(/<t\b[^>]*>([\s\S]*?)<\/t>/g, (m, t) => { r.push(pmEnt(t)); return m; }); return r.join(''); };
function pmParseSheet(xml, shared) {
  const rows = [];
  String(xml).replace(/<row\b[^>]*?(?:\/>|>([\s\S]*?)<\/row>)/g, (m, inner) => {
    const rn = +((/\br="(\d+)"/.exec(m.slice(0, m.indexOf('>') + 1)) || [])[1] || (rows.length + 1)), cells = [];
    String(inner || '').replace(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g, (mm, at, body) => {
      const ref = (/\br="([A-Z]+)\d+"/.exec(at) || [])[1]; if (!ref) return mm; let ci = 0; for (const ch of ref) ci = ci * 26 + (ch.charCodeAt(0) - 64); ci--;
      const t = (/\bt="([^"]+)"/.exec(at) || [])[1] || 'n', v = (/<v\b[^>]*>([\s\S]*?)<\/v>/.exec(body || '') || [])[1];
      let val = ''; if (t === 's') val = shared[+v] || ''; else if (t === 'inlineStr') val = pmTexts(body || ''); else if (t === 'b') val = v === '1' ? 'VERDADEIRO' : 'FALSO'; else if (v != null) val = pmEnt(v);
      cells[ci] = val; return mm;
    });
    for (let i = 0; i < cells.length; i++) if (cells[i] == null) cells[i] = '';
    rows[rn - 1] = cells; return m;
  });
  for (let i = 0; i < rows.length; i++) if (!rows[i]) rows[i] = [];
  return rows;
}
async function pmReadXlsx(file) {
  const parts = await pmUnzip(await file.arrayBuffer()), dec = k => parts[k] ? new TextDecoder().decode(parts[k]) : '';
  const wb = dec('xl/workbook.xml'); if (!wb) throw new Error('Não encontrei as abas. Use a planilha matriz baixada aqui no Studio.');
  const rels = {}; dec('xl/_rels/workbook.xml.rels').replace(/<Relationship\b[^>]*>/g, m => { const id = (/\bId="([^"]+)"/.exec(m) || [])[1], tg = (/\bTarget="([^"]+)"/.exec(m) || [])[1]; if (id && tg) rels[id] = tg.replace(/^\/?(xl\/)?/, 'xl/'); return m; });
  const shared = []; dec('xl/sharedStrings.xml').replace(/<si\b[^>]*?(?:\/>|>([\s\S]*?)<\/si>)/g, (m, inner) => { shared.push(pmTexts(String(inner || '').replace(/<rPh\b[\s\S]*?<\/rPh>/g, ''))); return m; });
  const out = [];
  wb.replace(/<sheet\b[^>]*>/g, m => { const nm = (/\bname="([^"]*)"/.exec(m) || [])[1], rid = (/\br:id="([^"]+)"/.exec(m) || [])[1], path = rels[rid]; if (nm != null && path && parts[path]) out.push({name: pmEnt(nm), rows: pmParseSheet(new TextDecoder().decode(parts[path]), shared)}); return m; });
  return out;
}



/* ---------- matrizes para baixar (mesmo formato das suas planilhas) ---------- */
function pmReadme(title, lines, defs) {
  const R = [], t = (a, s) => R.push({cells: a.map(x => [x, s || 5])});
  R.push({cells: [[title, 4]], ht: 24}); t(['']); t(['Como usar']); lines.forEach(x => t([x])); t(['']);
  defs.forEach(sh => { R.push({cells: [['Aba: ' + sh.name, 4]], ht: 20}); R.push({cells: [['Coluna', 1], ['Obrigatória', 1], ['O que colocar', 1], ['Valores aceitos', 1]]}); sh.cols.forEach(c => R.push({cells: [[c.h, 5], [c.req ? 'Sim' : 'Não', 5], [c.d, 5], [c.list ? c.list.join(' · ') : '', 5]]})); t(['']); });
  return R;
}
const pmSlideCols = n => { const o = []; for (let k = 1; k <= n; k++) { o.push({h: 'Slide ' + k, w: 34, d: `Slide ${k}: o título do slide${k === 1 ? ' (na capa, o título da capa)' : ''}. Use **palavra** para destacar.`}); o.push({h: 'Slide ' + k + ' texto', w: 40, d: `Slide ${k}: ${k === 1 ? 'o subtítulo da capa' : 'o texto de apoio do slide (no último, o apoio da chamada final)'}. OPCIONAL.`}); } return o; };
function pmBuildMatrix(kind, rowsOverride) {
  const enc = new TextEncoder(), files = [], sheets = [];
  const dataSheet = (def, ex) => { const rows = [{cells: def.cols.map(c => [c.h, c.req ? 2 : 1]), ht: 32}]; ex.forEach(r => rows.push({cells: r.map(v => [v, 3])})); return {name: def.name, xml: pmSheetXml(rows, {widths: def.cols.map(c => c.w), freeze: true, lists: def.cols.map((c, i) => c.list ? {col: i, items: c.list} : null).filter(Boolean)})}; };
  const common = ['Cabeçalho laranja = coluna obrigatória; cinza = opcional. Não mude o nome das abas nem dos cabeçalhos (a ordem das colunas pode mudar).', 'Linhas que começam com (exemplo) são só para mostrar o formato e são ignoradas. Apague-as ou escreva por cima. Linhas em branco são ignoradas.', 'Nada que já existe no projeto é alterado: tudo entra como novo, em rascunho. Você pode subir a planilha num projeto que já existe ou criar um projeto novo só a partir dela.', 'As imagens não vão na planilha: suba antes em Imagens e escreva o nome da imagem (quando houver a coluna).'];
  const readme = (title, lines, defs) => ({name: 'LEIA-ME', xml: pmSheetXml(pmReadme(title, lines.concat(common), defs), {widths: [34, 14, 80, 60], first: true})});
  if (kind === 'ads') {
    sheets.push(readme('Ampliação Studio · Matriz de anúncios', ['1. Preencha a aba Anúncios: uma linha por anúncio. Headline e Sub-headline vão dentro da arte; Texto Principal e Descrição ficam na peça, para o Meta. Cada anúncio vira uma peça já nas 3 medidas (feed, vertical e horizontal).', '2. Se preferir, o texto principal e a descrição podem ir numa aba LEGENDAS (coluna Post = ID do anúncio): a aba só completa o que faltar.', '3. No Studio: Campanhas → Criar anúncios a partir de planilha. Escolha o projeto (ou crie um novo), dê o nome da campanha e confirme a prévia.'], [PM_DEF.ads]));
    sheets.push(dataSheet(PM_DEF.ads, rowsOverride || PM_EX.ads));
  } else if (kind === 'car1') {
    const def = Object.assign({}, PM_DEF.car1, {cols: PM_DEF.car1.cols.concat(pmSlideCols(10))});
    sheets.push(readme('Ampliação Studio · Matriz de carrosséis (um por linha)', ['1. Um carrossel por linha. O slide 1 é a capa e o último slide preenchido vira a chamada final com o botão. De 3 a 20 slides: para passar de 10, continue o padrão das colunas (Slide 11, Slide 11 texto...).', '2. "Slide N" é o título do slide (o que vai grande na arte) e "Slide N texto" é o apoio. Se você só tem uma frase por slide, preencha só "Slide N".', '3. Orgânico usa Legenda e Hashtags; Anúncio usa Título do anúncio, Texto principal e Descrição.', '4. No Studio: Carrosséis → Criar a partir de planilha. Escolha o estilo e respeite o brand book (logo, fonte e cores do Kit de marca) se quiser.'], [def]));
    sheets.push(dataSheet(def, PM_EX.car1.map(r => r.concat(Array(Math.max(0, def.cols.length - r.length)).fill('')))));
  } else {
    sheets.push(readme('Ampliação Studio · Matriz de carrosséis (POSTS e SLIDES)', ['1. A aba POSTS é a visão estratégica (uma linha por post). A aba SLIDES é a produção (uma linha por slide, de 3 a 20 por post). Só a aba SLIDES é indispensável.', '2. Cada post vira um carrossel. A frase de cada slide entra como título; a capa é o slide 1 e o último slide vira a chamada final com o botão.', '3. A aba LEGENDAS traz a legenda e as hashtags (orgânico) ou o título, o texto principal e a descrição (anúncio) de cada post. Coluna Post = código do post.', '4. A referência visual e o termo de busca de cada slide ficam ao lado do texto no editor, com botão de busca no Google Imagens.', '5. As abas LINHA EDITORIAL, CLUSTERS e CALENDÁRIO são seu planejamento: ficam no arquivo e o Studio não as lê.', '6. Se um post já foi importado (mesmo código e título), ele é ignorado numa nova importação, para não duplicar.'], [PM_DEF.posts, PM_DEF.slides, PM_DEF.caps]));
    sheets.push(dataSheet(PM_DEF.posts, PM_EX.posts)); sheets.push(dataSheet(PM_DEF.slides, PM_EX.slides)); sheets.push(dataSheet(PM_DEF.caps, PM_EX.caps.slice(0, 1)));
    PM_PLAN_SHEETS.forEach(s => sheets.push({name: s.name, xml: pmSheetXml([{cells: s.cols.map(h => [h, 1]), ht: 32}], {widths: s.cols.map(() => 34), freeze: true})}));
  }
  const f = (name, text) => files.push({name, data: enc.encode(text)}), n = sheets.length;
  f('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((s, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`);
  f('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
  f('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView activeTab="0"/></bookViews><sheets>${sheets.map((s, i) => `<sheet name="${pmX(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`);
  f('xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((s, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${n + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
  f('xl/styles.xml', PM_STYLES); sheets.forEach((s, i) => f(`xl/worksheets/sheet${i + 1}.xml`, s.xml));
  return makeZip(files);
}
const PM_FILES = {ads: 'matriz-anuncios-ampliacao-studio.xlsx', car: 'matriz-carrosseis-posts-slides-ampliacao-studio.xlsx', car1: 'matriz-carrosseis-um-por-linha-ampliacao-studio.xlsx'};
function pmDownload(kind) { download(PM_FILES[kind], pmBuildMatrix(kind), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); toast('Matriz baixada. Preencha e envie de volta aqui.'); }


/* ---------- leitura das abas: reconhece o tipo pelos cabeçalhos (o nome da aba não importa) ---------- */
const PM_SLIDE_COL = /^slide(\d{1,2})(titulo|headline|texto|subheadline|subtitulo|paragrafo)?$/;
function pmSniff(rows) {
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const h = new Set((rows[i] || []).map(v => pmNorm(String(v).replace(/\*/g, ''))).filter(Boolean)), arr = [...h];
    if (h.has('headline') && h.has('fase')) return 'ads'; if (h.has('slide') && h.has('textodoslide')) return 'slides'; if (h.has('post') && (h.has('headlinecapa') || h.has('tipoestrategico'))) return 'posts';
    if (arr.some(x => PM_SLIDE_COL.test(x)) && ['carrossel', 'nomedocarrossel', 'nome', 'codigo', 'post', 'id'].some(k => h.has(k))) return 'car1';
    if (['post', 'codigo', 'id', 'carrossel', 'nome'].some(k => h.has(k)) && ['legenda', 'hashtags', 'textoprincipal', 'descricao', 'titulodoanuncio', 'textodoanuncio'].some(k => h.has(k))) return 'caps';
  } return '';
}
function pmTable(rows, def, issues) {
  let hi = -1, map = null, dyn = null;
  for (let i = 0; i < Math.min(rows.length, 15) && hi < 0; i++) {
    const m = {}, dy = {}; (rows[i] || []).forEach((h, ci) => {
      const nh = pmNorm(String(h).replace(/\*/g, '')); if (!nh) return;
      if (def.dyn) { const mm = def.dyn.exec(nh); if (mm) { dy[(mm[2] && !/^(titulo|headline)$/.test(mm[2]) ? 'x' : 't') + mm[1]] = ci; return; } }
      const c = def.cols.find(x => x.al.includes(nh) || pmNorm(x.h) === nh); if (c && !(c.k in m)) m[c.k] = ci;
    });
    if (Object.keys(m).length + Object.keys(dy).length >= 2) { hi = i; map = m; dyn = dy; }
  }
  if (hi < 0) { if (rows.some(r => (r || []).some(v => pmTrim(v)))) issues.push({sheet: def.name, line: 1, level: 'erro', msg: 'Não achei os cabeçalhos desta aba. Use a matriz baixada aqui no Studio.'}); return []; }
  const miss = def.cols.filter(c => c.req && !(c.k in map)); if (miss.length) { issues.push({sheet: def.name, line: hi + 1, level: 'erro', msg: `Falta a coluna obrigatória "${miss.map(c => c.h).join('", "')}". A aba não foi lida.`}); return []; }
  const out = [];
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i] || [], o = {line: i + 1, _s: {}}; let any = false;
    def.cols.forEach(c => { const v = c.k in map ? pmTrim(r[map[c.k]]) : ''; o[c.k] = v; if (v) any = true; });
    Object.keys(dyn).forEach(k => { const v = pmTrim(r[dyn[k]]); if (v) { any = true; (o._s[+k.slice(1)] = o._s[+k.slice(1)] || {t: '', x: ''})[k[0]] = v; } });
    if (!any || pmIsExample(o[def.cols[0].k])) continue; out.push(o);
  }
  return out;
}
const pmCut = (v, n, issues, sheet, line, what) => { v = pmTrim(v); if (v.length > n) { issues.push({sheet, line, level: 'aviso', msg: `${what} tem ${v.length} caracteres; foi cortado em ${n}.`}); return v.slice(0, n); } return v; };
const pmFase = v => PM_FASE_ID[pmNorm(v).replace(/^\d+/, '')] || '';
const pmObj = (v, hasAd, hasCap) => { const s = pmNorm(v); return s.includes('anunc') ? 'anuncio' : s.includes('organ') ? 'organico' : (hasAd && !hasCap ? 'anuncio' : 'organico'); };
const pmPub = () => ({obj: '', stage: '', ratio: '', caption: '', hashtags: '', ad: {titulo: '', texto: '', descricao: '', botao: ''}, cta: ''});
function pmParseAds(rows, def, issues, ctx) {
  const groups = new Map(), out = [], S = def.name, perStage = {};
  pmTable(rows, def, issues).forEach(r => {
    const L = r.line, st = pmFase(r.fase);
    if (!st) { issues.push({sheet: S, line: L, level: 'erro', msg: `Fase "${r.fase || '(vazia)'}" inválida. Use: Descoberta, Atenção, Consideração, Compra ou Apologia.`}); return; }
    if (!r.headline) { issues.push({sheet: S, line: L, level: 'erro', msg: 'Falta a Headline.'}); return; }
    const gname = pmCut(r.campanha, 120, issues, S, L, 'O nome da campanha'), key = pmNorm(gname) || '·';
    let g = groups.get(key); if (!g) { g = {name: gname, rows: []}; groups.set(key, g); out.push(g); }
    if (g.rows.length >= 100) { issues.push({sheet: S, line: L, level: 'erro', msg: 'Uma campanha aceita até 100 anúncios. Esta linha ficou de fora.'}); return; }
    const h = pmCut(r.headline, 200, issues, S, L, 'A Headline'); if (h.length > 120) issues.push({sheet: S, line: L, level: 'aviso', msg: `A Headline tem ${h.length} caracteres; acima de 120 pode não caber bem na arte.`});
    let imgId = ''; if (r.imagem) { imgId = ctx.img(r.imagem); if (!imgId) issues.push({sheet: S, line: L, level: 'aviso', msg: `Não achei a imagem "${r.imagem}" na biblioteca; a arte usa a imagem da peça modelo ou fica só com texto.`}); }
    const k = perStage[key + st] = (perStage[key + st] || 0) + 1, code = pmCut(r.id, 20, issues, S, L, 'O ID'), fase = pmTrim(r.fase).replace(/^\d+\W*/, '');
    g.rows.push({line: L, stage: st, name: `${fase} · ${code || 'Anúncio ' + k}`.slice(0, 100), code, angle: pmCut(r.angulo, 100, issues, S, L, 'O ângulo'), h, s: pmCut(r.sub, 300, issues, S, L, 'O Sub-headline'), copy: pmCut(r.texto, 2200, issues, S, L, 'O Texto Principal'), desc: pmCut(r.desc, 150, issues, S, L, 'A Descrição'), btn: pmTrim(r.botao) === '-' ? null : pmCut(r.botao, 60, issues, S, L, 'O botão'), imgId});
  });
  return out;
}
/* uma frase por slide (text) ou título + apoio (text2). Capa = slide 1; o último slide é a chamada final; com mais de 10 slides entram 2 CTAs (os 2 últimos). */
function pmCarTexts(n, items, dims, where) {
  const D = dims(n), T = Array(D.total).fill(''), put = (i, v) => { T[i] = String(v || '').slice(0, 1200); };
  put(0, items[0].text); put(1, items[0].text2);
  D.groups.forEach((ix, k) => { const it = items[1 + k]; if (where === 'body' && ix.length > 1 && !it.text2) put(ix[1], it.text); else { put(ix[0], it.text); if (ix.length > 1) put(ix[1], it.text2); } });
  D.ctas.forEach((pr, j) => { const it = items[1 + D.groups.length + j]; put(pr[0], it.text); put(pr[1], it.text2); });
  return T;
}
/* um carrossel por linha: Slide 1..N (título) e Slide 1..N texto (apoio) em colunas */
function pmParseCarRows(rows, def, issues) {
  const S = def.name, out = [], seen = new Set();
  pmTable(rows, def, issues).forEach(r => {
    const L = r.line; if (!r.carrossel) { issues.push({sheet: S, line: L, level: 'erro', msg: 'Falta o nome do carrossel.'}); return; }
    const filled = Object.keys(r._s).map(Number), n = filled.length ? Math.max(...filled) : 0, name = pmCut(r.carrossel, 80, issues, S, L, 'O nome do carrossel');
    if (n < 3 || n > 20) { issues.push({sheet: S, line: L, level: 'erro', msg: `"${name}" tem ${n} slide(s) preenchido(s). O Studio aceita de 3 a 20.`}); return; }
    const key = pmNorm(r.codigo || name); if (seen.has(key)) { issues.push({sheet: S, line: L, level: 'erro', msg: `"${name}" aparece duas vezes. Esta linha ficou de fora.`}); return; } seen.add(key);
    const items = []; for (let k = 1; k <= n; k++) { const s = r._s[k] || {t: '', x: ''}; if (!s.t && !s.x) issues.push({sheet: S, line: L, level: 'aviso', msg: `O slide ${k} de "${name}" está vazio.`}); items.push({text: s.t, text2: s.x}); }
    const pub = pmPub(), code = pmCut(r.codigo, 20, issues, S, L, 'O código'), e = pmNorm(r.etapa);
    Object.assign(pub, {obj: r.objetivo, stage: e.includes('meio') ? 'meio' : e.includes('fundo') ? 'fundo' : e.includes('topo') ? 'topo' : '', ratio: /9\s*:\s*16|stor/i.test(r.proporcao) ? '9:16' : r.proporcao ? '4:5' : '', caption: pmCut(r.legenda, 2200, issues, S, L, 'A legenda'), hashtags: pmCut(r.hashtags, 400, issues, S, L, 'As hashtags'), cta: pmCut(r.botao, 40, issues, S, L, 'O texto do botão final'),
      ad: {titulo: pmCut(r.tituloAd, 80, issues, S, L, 'O título do anúncio'), texto: pmCut(r.texto, 600, issues, S, L, 'O texto principal'), descricao: pmCut(r.desc, 120, issues, S, L, 'A descrição'), botao: pmCut(r.botaoAd, 40, issues, S, L, 'O botão do anúncio')}});
    out.push(Object.assign({code, name, n, line: L, items, refs: [], idea: '', src: {code, day: pmTrim(r.dia).slice(0, 20), order: 0, theme: '', type: '', tension: ''}}, pub));
  });
  return out;
}
function pmParseCar(rowsP, defP, rowsS, defS, issues) {
  const posts = rowsP ? pmTable(rowsP, defP, issues) : [], slides = pmTable(rowsS, defS, issues), meta = new Map(), order = [], by = new Map(), out = [], SS = defS.name, SP = defP.name;
  posts.forEach(r => { const k = pmTrim(r.post); if (!k) { issues.push({sheet: SP, line: r.line, level: 'erro', msg: 'Falta o código do post.'}); return; } if (meta.has(k)) { issues.push({sheet: SP, line: r.line, level: 'erro', msg: `O post ${k} aparece duas vezes. Esta linha ficou de fora.`}); return; } meta.set(k, r); order.push(k); });
  slides.forEach(r => { const k = pmTrim(r.post); if (!k) { issues.push({sheet: SS, line: r.line, level: 'erro', msg: 'Falta o código do post nesta linha de slide.'}); return; } if (!by.has(k)) { by.set(k, []); if (!meta.has(k)) order.push(k); } by.get(k).push(r); });
  order.forEach(code => {
    const rs = by.get(code), m = meta.get(code) || {}, L = m.line || (rs && rs[0].line) || 0;
    if (!rs) { issues.push({sheet: SP, line: L, level: 'erro', msg: `O post ${code} não tem slides na aba ${SS}.`}); return; }
    let bad = false; rs.forEach((r, i) => { const v = pmTrim(r.slide), num = v === '' ? i + 1 : Math.round(+String(v).replace(',', '.')); if (!isFinite(num) || num < 1) { issues.push({sheet: SS, line: r.line, level: 'erro', msg: `Número de slide "${v}" inválido no post ${code}.`}); bad = true; } r.num = num; }); if (bad) return;
    rs.sort((a, b) => a.num - b.num); const nums = rs.map(r => r.num), n = nums.length;
    if (new Set(nums).size !== n) { issues.push({sheet: SS, line: rs[0].line, level: 'erro', msg: `O post ${code} tem número de slide repetido.`}); return; }
    if (nums[n - 1] !== n) { const miss = []; for (let i = 1; i <= nums[n - 1]; i++) if (!nums.includes(i)) miss.push(i); issues.push({sheet: SS, line: rs[0].line, level: 'erro', msg: `O post ${code}: faltam os slides ${miss.join(', ')}. Numere de 1 até o último, sem pular.`}); return; }
    if (n < 3 || n > 20) { issues.push({sheet: SS, line: rs[0].line, level: 'erro', msg: `O post ${code} tem ${n} slide(s). O Studio aceita de 3 a 20.`}); return; }
    rs.forEach(r => { if (!pmTrim(r.texto)) issues.push({sheet: SS, line: r.line, level: 'aviso', msg: `O slide ${r.num} do post ${code} está sem texto.`}); });
    const cover = pmTrim(m.capa) || pmTrim(rs[0].texto), name = (code + ' · ' + cover.replace(/\*\*/g, '')).slice(0, 80);
    const idea = [['Tema', m.tema], ['Público', m.publico], ['Tipo', [m.tipo, m.perguntaE].filter(Boolean).join(' — ')], ['Conflito central', m.conflito], ['Conceito editorial', m.conceito && m.conceito !== m.conflito ? m.conceito : ''], ['Tensão de comentário', m.tensao], ['Pergunta central', m.perguntaC], ['Objetivo', m.objetivo]].filter(x => pmTrim(x[1])).map(x => x[0] + ': ' + pmTrim(x[1])).join('\n').slice(0, 4000);
    out.push(Object.assign({code, name, n, line: L, items: rs.map(r => ({text: pmTrim(r.texto), text2: ''})), refs: rs.map(r => ({ref: pmTrim(r.ref).slice(0, 400), brands: pmTrim(r.marcas).slice(0, 200), term: pmTrim(r.termo).slice(0, 200)})), idea,
      src: {code, day: pmTrim(m.dia || rs[0].dia).slice(0, 20), order: +m.ordem || 0, theme: pmTrim(m.tema).slice(0, 100), type: pmTrim(m.tipo).slice(0, 60), tension: pmTrim(m.tensao).slice(0, 40)}}, pmPub()));
  });
  return out;
}
/* aba de legendas: completa o que faltar (não sobrescreve). Chave = código do post/carrossel ou ID do anúncio. */
function pmMergeCaps(rows, def, cars, camps, issues) {
  const S = def.name, ads = camps.flatMap(g => g.rows); let hit = 0;
  pmTable(rows, def, issues).forEach(r => {
    const key = pmNorm(r.key), L = r.line, car = cars.find(c => pmNorm(c.code) === key || pmNorm(c.name) === key), ad = !car && ads.find(a => pmNorm(a.code) === key);
    if (car) {
      hit++; if (!car.caption && r.legenda) car.caption = pmCut(r.legenda, 2200, issues, S, L, 'A legenda'); if (!car.hashtags && r.hashtags) car.hashtags = pmCut(r.hashtags, 400, issues, S, L, 'As hashtags'); if (!car.obj && r.objetivo) car.obj = r.objetivo;
      [['titulo', 'tituloAd', 80, 'O título do anúncio'], ['texto', 'texto', 600, 'O texto principal'], ['descricao', 'desc', 120, 'A descrição'], ['botao', 'botaoAd', 40, 'O botão do anúncio']].forEach(([k, f, n, w]) => { if (!car.ad[k] && r[f]) car.ad[k] = pmCut(r[f], n, issues, S, L, w); });
    } else if (ad) { hit++; if (!ad.copy && r.texto) ad.copy = pmCut(r.texto, 2200, issues, S, L, 'O texto principal'); if (!ad.desc && r.desc) ad.desc = pmCut(r.desc, 150, issues, S, L, 'A descrição'); }
    else issues.push({sheet: S, line: L, level: 'aviso', msg: `"${r.key}" não corresponde a nenhum carrossel ou anúncio desta planilha; a linha foi ignorada.`});
  });
  return hit;
}
function pmParseWorkbook(sheets, ctx) {
  const issues = [], ads = [], used = []; let posts = null, slides = null, car1 = null, caps = null;
  sheets.forEach(sh => { const k = pmSniff(sh.rows); if (k === 'ads') ads.push(sh); else if (k === 'posts' && !posts) posts = sh; else if (k === 'slides' && !slides) slides = sh; else if (k === 'car1' && !car1) car1 = sh; else if (k === 'caps' && !caps) caps = sh; });
  const camp = []; ads.forEach(sh => { used.push(sh.name); pmParseAds(sh.rows, Object.assign({}, PM_DEF.ads, {name: sh.name}), issues, ctx).forEach(g => camp.push(g)); });
  let car = [];
  if (slides) { used.push(slides.name); if (posts) used.push(posts.name); car = pmParseCar(posts ? posts.rows : null, Object.assign({}, PM_DEF.posts, {name: posts ? posts.name : 'POSTS'}), slides.rows, Object.assign({}, PM_DEF.slides, {name: slides.name}), issues); }
  else if (posts) issues.push({sheet: posts.name, line: 1, level: 'erro', msg: 'Achei a aba de posts, mas não a aba SLIDES (com o texto de cada slide). Os carrosséis não foram lidos.'});
  if (car1) { used.push(car1.name); car = car.concat(pmParseCarRows(car1.rows, Object.assign({}, PM_DEF.car1, {name: car1.name}), issues)); }
  if (caps) { used.push(caps.name); pmMergeCaps(caps.rows, Object.assign({}, PM_DEF.caps, {name: caps.name}), car, camp, issues); }
  if (!ads.length && !posts && !slides && !car1) issues.push({sheet: '', line: 0, level: 'erro', msg: 'Não reconheci nenhuma aba. Para anúncios preciso das colunas Fase e Headline; para carrosséis, da aba SLIDES (Post, Slide, Texto do slide) ou de uma aba com Carrossel e Slide 1, Slide 2... Use as matrizes baixadas aqui.'});
  return {campaigns: camp, carousels: car, issues, used};
}

/* ---------- criação (nada existente é alterado) ---------- */
const pmCtx = () => ({img: nm => { const k = pmNorm(String(nm).replace(/\.[a-z0-9]{2,5}$/i, '')); const it = libList().find(i => pmNorm(i.name) === k); return it ? it.imgId : ''; }, dims: n => carDims({slides: n})});
async function pmBuildCampaign(p, cm, o) {
  const model = o.adLook ? p.campaigns.find(x => x.id === o.adLook) : null, mq = model && model.pieces[0];
  const c = {id: uid('cm'), name: (cm.name || o.campName || 'Campanha').slice(0, 120), objective: model ? model.objective : '', budget: 0, channel: 'Meta Ads', status: 'Rascunho', period: '', audience: ((p.pre.icps[0] || {}).name || ''), feedFmt: model ? model.feedFmt : 'feed45', layout: model ? model.layout : 'auto', align: model ? model.align : 'left', logo: model ? !!model.logo : (!!o.adLogo && brandOf(p).logos.length > 0), bank: cmpDraftBank(p, cm.rows.length),
    test: {macro: 'Teste de ângulo: compare, dentro de cada fase, os anúncios importados (mesmo público e mesmo orçamento). (sugestão, edite)', micro: 'Com o ângulo vencedor de cada fase, troque uma coisa por vez: imagem, cor ou CTA, usando a faixa de variações.', format: 'Compare feed, vertical e horizontal do mesmo anúncio para ver qual medida rende mais.', notes: ''}, notes: [], landings: [], pieces: [], created: new Date().toISOString()};
  if (model) { c.bank.col = carJ(model.bank.col); c.bank.img = model.bank.img.slice(); }
  p.campaigns.push(c); let gi = 0; const used = {};
  for (const r of cm.rows) {
    const k = used[r.stage] = (used[r.stage] || 0) + 1, q = cmpNewPiece(c, r.stage, k - 1, {h: r.h, t: ''}, gi++);
    q.name = r.name; q.h = r.h; q.s = r.s; q.code = r.code; q.angle = r.angle; q.copy = r.copy; q.desc = r.desc;
    q.btn = r.btn === null ? '' : (r.btn || CMP_STAGE_CTA[r.stage] || (r.stage === 'acao' ? c.bank.c[0] : '') || q.btn);   // em branco: botão padrão fixo da fase (sem rodízio); "-": sem botão
    q.imgId = r.imgId || (mq ? mq.imgId : ''); if (mq) q.col = mq.col;
    if (r.s && !c.bank.s.includes(r.s) && c.bank.s.length < 20 && r.s.length <= 300) c.bank.s.push(r.s);
    if (q.btn && !c.bank.c.includes(q.btn) && c.bank.c.length < 20) c.bank.c.push(q.btn);
    c.pieces.push(q); await cmpBuildPiece(p, c, q);
  }
  return c;
}
function pmBuildCarousel(p, it, o) {
  const brand = o.carLook === 'brand', m = o.carLook && !brand ? p.carousels.find(x => x.id === o.carLook) : null, t = CAR_TPL.find(x => x.id === (m ? m.tpl : o.carTpl)) || CAR_TPL[0], adHas = !!(it.ad.titulo || it.ad.texto || it.ad.descricao);
  const c = normalizeCarousel({name: it.name, slides: it.n, stage: it.stage || (m ? m.stage : t.stage), tpl: t.id, texts: pmCarTexts(it.n, it.items, pmCtx().dims, o.carWhere), idea: it.idea, src: it.src, refs: it.refs, objective: pmObj(it.obj, adHas, !!it.caption), caption: it.caption, hashtags: it.hashtags, ad: it.ad, ratio: it.ratio || '4:5', globals: {name: p.name, handle: '', copyright: String(new Date().getFullYear()) + ' ©'}, cta: {text: it.cta}});
  if (m) { carLookApply(c, carLookPatch(m, ['ident', 'cor', 'cta', 'modelo', 'prop']), m); if (it.ratio) c.ratio = it.ratio; if (it.cta) c.cta.text = it.cta; }
  else if (brand) carLookApply(c, carBrandPatch(p, ['ident', 'cor'], o.carStyle), c);
  else if (o.carStyle) c.style = o.carStyle;
  if (m && o.carStyle) c.style = o.carStyle;
  return c;
}
async function pmImport() {
  const plan = PM.plan; if (!plan || PM.busy) return; const created = PM.dest === 'new' || !curProject(); let p = created ? null : curProject();
  const o = {campName: PM.campName.trim(), adLook: PM.adLook, adLogo: PM.adLogo, carLook: PM.carLook, carTpl: PM.carTpl, carWhere: PM.carWhere, carStyle: PM.carStyle};
  if (created) { o.adLook = ''; if (o.carLook !== 'brand') o.carLook = ''; o.carStyle = ''; }
  const have = new Set(p ? p.carousels.map(x => (x.src && x.src.code || '') + '|' + x.name) : []), fresh = plan.carousels.filter(it => !have.has(it.code + '|' + it.name)), skipped = plan.carousels.length - fresh.length;
  const nAds = plan.campaigns.reduce((a, c) => a + c.rows.length, 0), total = nAds + fresh.length; if (!total) { toast(skipped ? 'Todos esses carrosséis já foram importados.' : 'Não há nada válido para importar.'); return; }
  if (plan.campaigns.some(g => !g.name) && !o.campName) { PM.error = 'Dê um nome para a campanha dos anúncios.'; pmRender(); return; }
  if (created) { const nm = PM.newName.trim() || o.campName || 'Novo projeto'; p = newProject(nm.slice(0, 80), 'Criado a partir de planilha'); state.projects.push(p); state.activeProjectId = p.id; if (typeof updateContextUI === 'function') updateContextUI(); }
  PM.busy = true; PM.error = ''; PM.result = null; pmRender(); const res = {camp: 0, pieces: 0, car: 0, skipped, projectName: p.name, created};
  try {
    let done = 0;
    for (const g of plan.campaigns) { await pmBuildCampaign(p, g, o); res.camp++; res.pieces += g.rows.length; done += g.rows.length; toast(`Montando as artes… ${done}/${nAds}`); }
    if (fresh.length) { const cars = fresh.map(it => pmBuildCarousel(p, it, o)); p.carousels = cars.concat(p.carousels).slice(0, 600); res.car = cars.length; carHome.page = 0; carHome.q = ''; carHome.day = ''; }
    persist(); PM.result = res; PM.plan = null; PM.fileName = ''; PM.dest = 'cur'; toast('Importação concluída.');
  } catch (e) { persist(); PM.error = 'A importação parou no meio: ' + (e && e.message || e) + '. O que já foi criado ficou salvo no projeto; confira antes de enviar de novo.'; }
  PM.busy = false; pmRender();
}

/* ---------- tela ---------- */
const PM = {plan: null, fileName: '', busy: false, result: null, error: '', mode: '', dest: 'cur', newName: '', campName: '', adLook: '', adLogo: true, carLook: 'brand', carTpl: 'foto', carWhere: 'title', carStyle: ''};
/* botão "Subir tabela": abre o seletor de arquivo na hora, em qualquer tela; ao escolher, abre a prévia da importação já com a tabela lida */
function pmQuick(mode) {
  let inp = document.getElementById('pmQuickIn');
  if (!inp) { inp = document.createElement('input'); inp.type = 'file'; inp.id = 'pmQuickIn'; inp.accept = '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; inp.style.display = 'none'; document.body.appendChild(inp); }
  inp.onchange = () => { PM.mode = mode || ''; if (typeof ui !== 'undefined' && ui.page !== 'planilha') go('planilha'); pmPick(inp); };
  inp.click();
}
function pmGo(mode) { PM.mode = mode || ''; go('planilha'); }
async function pmPick(input) {
  const f = input.files && input.files[0]; input.value = ''; if (!f) return; PM.error = ''; PM.result = null; PM.plan = null;
  if (!/\.xlsx$/i.test(f.name)) { PM.error = 'Envie um arquivo .xlsx. No Google Planilhas: Arquivo → Fazer download → Microsoft Excel (.xlsx).'; pmRender(); return; }
  if (f.size > 20 * 1024 * 1024) { PM.error = 'O arquivo tem mais de 20 MB. A planilha leva só texto: confira se não há imagens coladas nela.'; pmRender(); return; }
  try { PM.fileName = f.name; PM.campName = f.name.replace(/\.xlsx$/i, '').replace(/_+/g, ' ').replace(/\b\d+\s+(an[uú]ncios?|posts?)\b/i, '').replace(/\bcampanha\b/i, '').replace(/\s+/g, ' ').trim(); if (!PM.newName.trim()) PM.newName = PM.campName; PM.plan = pmParseWorkbook(await pmReadXlsx(f), pmCtx()); } catch (e) { PM.error = (e && e.message) || 'Não consegui ler o arquivo.'; }
  pmRender();
}
function pmClear() { PM.plan = null; PM.fileName = ''; PM.error = ''; PM.result = null; pmRender(); }
function pmSet(k, v) { PM[k] = v; if (k === 'campName' || k === 'newName') return; pmRender(); }
function pmRender() {
  const root = $('planilhaRoot'); if (!root) return; const cur = curProject(), plan = PM.plan, R = PM.result, dest = !cur ? 'new' : PM.dest, p = dest === 'new' ? null : cur, mode = PM.mode;
  const nAds = plan ? plan.campaigns.reduce((a, c) => a + c.rows.length, 0) : 0, nSl = plan ? plan.carousels.reduce((a, c) => a + c.n, 0) : 0, nCar = plan ? plan.carousels.length : 0;
  const have = p ? new Set(p.carousels.map(x => (x.src && x.src.code || '') + '|' + x.name)) : new Set(), dup = plan ? plan.carousels.filter(it => have.has(it.code + '|' + it.name)).length : 0, nTot = nAds + nCar - dup;
  const errs = plan ? plan.issues.filter(i => i.level === 'erro') : [], warns = plan ? plan.issues.filter(i => i.level === 'aviso') : [], nAd = plan ? plan.carousels.filter(c => pmObj(c.obj, !!(c.ad.titulo || c.ad.texto || c.ad.descricao), !!c.caption) === 'anuncio').length : 0, nCap = plan ? plan.carousels.filter(c => c.caption).length : 0;
  const sel = (cur, opts, cb) => `<select onchange="${cb}">${opts.map(([v, l]) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  const tab = (k, l) => `<button class="btn sm ${mode === k ? 'dark' : ''}" onclick="pmSet('mode','${k}')">${l}</button>`, showA = mode !== 'car', showC = mode !== 'ads';
  const styles = p ? lyStyles(p) : [];
  root.innerHTML = `<div class="page-head"><div><h1>Criar a partir de planilha</h1><p class="sub">Suba um planejamento inteiro de uma vez: anúncios (ID, Fase, Headline, Texto Principal, Descrição...) ou carrosséis (um por linha, ou POSTS e SLIDES), com legendas. Funciona num projeto que já existe ou cria um projeto novo só com a planilha.</p></div></div>
  <div class="row-gap" style="margin-bottom:10px">${tab('', 'Tudo')}${tab('ads', 'Anúncios')}${tab('car', 'Carrosséis')}</div>
  <div class="panel"><h3 style="margin-top:0">1 · Matrizes (opcional)</h3><p style="font-size:13px;margin:0 0 10px">Já tem a planilha pronta? Pule para o passo 2: o Studio lê o seu arquivo como está. Para partir do formato em branco, baixe a matriz:</p>
    <div class="row-gap" style="flex-wrap:wrap">${showA ? '<button class="btn" onclick="pmDownload(\'ads\')">⬇ Anúncios (.xlsx)</button>' : ''}${showC ? '<button class="btn" onclick="pmDownload(\'car1\')">⬇ Carrosséis, um por linha (.xlsx)</button><button class="btn" onclick="pmDownload(\'car\')">⬇ Carrosséis, POSTS + SLIDES + LEGENDAS (.xlsx)</button>' : ''}</div></div>
  <div class="panel" style="margin-top:14px"><h3 style="margin-top:0">2 · Escolha o destino e envie a planilha preenchida</h3>
    <div class="field"><label class="ins inl" style="display:block;margin:4px 0"><input type="radio" name="pmDest" ${dest === 'cur' ? 'checked' : ''} ${cur ? '' : 'disabled'} onchange="pmSet('dest','cur')"> No projeto aberto: <b>${esc(cur ? cur.name : 'nenhum projeto aberto')}</b>${cur && state.projects.length > 1 ? ` <a href="#" onclick="openModal('context');return false">trocar</a>` : ''}</label>
      <label class="ins inl" style="display:block;margin:4px 0"><input type="radio" name="pmDest" ${dest === 'new' ? 'checked' : ''} onchange="pmSet('dest','new')"> ＋ Criar um projeto novo a partir da planilha</label>${dest === 'new' ? `<input value="${esc(PM.newName)}" oninput="PM.newName=this.value" placeholder="Nome do novo projeto" style="max-width:360px;margin-top:4px">` : ''}</div>
    <p class="muted" style="font-size:12.5px;margin:0 0 10px">Tudo entra como <b>novo e em rascunho</b>. Nada que já existe é alterado ou apagado. Não precisa ter pré-projeto nem briefing.</p>
    <div class="row-gap" style="flex-wrap:wrap"><label class="btn ${PM.busy ? '' : 'orange'}" style="cursor:pointer">Escolher a planilha (.xlsx)<input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" style="display:none" onchange="pmPick(this)" ${PM.busy ? 'disabled' : ''}></label>${PM.fileName ? `<span class="muted" style="font-size:12.5px">${esc(PM.fileName)}</span><button class="btn sm" onclick="pmClear()" ${PM.busy ? 'disabled' : ''}>Limpar</button>` : ''}</div>
    ${PM.error ? `<p style="color:#b42318;font-size:13px;margin:10px 0 0">${esc(PM.error)}</p>` : ''}
    ${plan ? `<div class="cards" style="margin-top:14px">${nAds || !nCar ? `<div class="card"><div class="label">Anúncios</div><div class="metric">${nAds}</div><small class="muted">em ${plan.campaigns.length} campanha(s) · ${nAds * 3} artes</small></div>` : ''}${nCar || !nAds ? `<div class="card"><div class="label">Carrosséis</div><div class="metric">${nCar}</div><small class="muted">${nSl} slides${nCar ? ` · ${nCap} com legenda${nAd ? ` · ${nAd} como anúncio` : ''}` : ''}${dup ? ` · ${dup} já importado(s), serão ignorados` : ''}</small></div>` : ''}</div>
      ${nAds ? `<div class="panel" style="margin-top:12px;background:#faf8f3"><b>Anúncios</b><div class="form-grid" style="margin-top:8px">${plan.campaigns.some(g => !g.name) ? `<div class="field"><label>Nome da campanha</label><input value="${esc(PM.campName)}" oninput="PM.campName=this.value" placeholder="Ex.: Laboratório de Luz"></div>` : ''}${p ? `<div class="field"><label>Layout e cores</label>${sel(PM.adLook, [['', 'Padrão do Studio (cores do Kit de marca)']].concat(p.campaigns.map(c => [c.id, 'Copiar da campanha: ' + c.name])), "pmSet('adLook',this.value)")}</div>` : ''}<div class="field"><label class="ins inl" style="display:block;margin-top:22px"><input type="checkbox" ${PM.adLogo ? 'checked' : ''} onchange="pmSet('adLogo',this.checked)"> Logo do Kit de marca na arte</label></div></div><small class="muted block">${esc(brandLine(p))} As artes usam as cores e a fonte do Kit de marca. Cada peça guarda ID, Ângulo, Texto Principal e Descrição.</small></div>` : ''}
      ${nCar ? `<div class="panel" style="margin-top:12px;background:#faf8f3"><b>Carrosséis</b><div class="form-grid" style="margin-top:8px"><div class="field"><label>Identidade visual</label>${sel(PM.carLook, [['brand', 'Respeitar o brand book (logo, fonte e cores do Kit de marca)'], ['', 'Padrão do Studio']].concat(p ? p.carousels.map(c => [c.id, 'Copiar do carrossel: ' + c.name]) : []), "pmSet('carLook',this.value)")}</div>${p && PM.carLook !== '' ? `<div class="field"><label>Estilo</label>${sel(PM.carStyle, [['', 'Automático (Kit de marca, se existir)']].concat(styles.map(s => [s.id, s.name])), "pmSet('carStyle',this.value)")}</div>` : ''}${PM.carLook === 'brand' || PM.carLook === '' ? `<div class="field"><label>Modelo (layout)</label>${sel(PM.carTpl, CAR_TPL.map(t => [t.id, t.name]), "pmSet('carTpl',this.value)")}</div>` : ''}${plan.carousels.some(c => c.items.every(i => !i.text2)) ? `<div class="field"><label>Frase de cada slide (formato POSTS/SLIDES) entra como</label>${sel(PM.carWhere, [['title', 'Título do slide (recomendado)'], ['body', 'Parágrafo do slide']], "pmSet('carWhere',this.value)")}</div>` : ''}</div><small class="muted block">${PM.carLook === 'brand' ? esc(brandLine(p)) + ' Usa o logo como avatar, o nome do projeto, a fonte do título e a cor de destaque. Os modelos têm fundos próprios (claro ou escuro).' : 'Para já nascerem com o seu @ e as suas cores, crie antes 1 carrossel, ajuste e escolha-o aqui. Depois dá para usar "Aplicar a todos…" no editor.'}</small></div>` : ''}
      ${errs.length ? `<p style="font-size:13px;margin:12px 0 4px"><b>${errs.length} linha(s) com erro</b> ficam de fora. Corrija na planilha e envie de novo, ou importe só o que está certo.</p>` : ''}
      ${plan.issues.length ? `<div class="table-wrap" style="max-height:260px;overflow:auto;margin-top:6px"><table class="tbl"><thead><tr><th>Aba</th><th>Linha</th><th></th><th>O que aconteceu</th></tr></thead><tbody>${plan.issues.slice(0, 120).map(i => `<tr><td>${esc(i.sheet)}</td><td>${i.line || ''}</td><td><b style="color:${i.level === 'erro' ? '#b42318' : '#b7791f'}">${i.level === 'erro' ? 'Erro' : 'Aviso'}</b></td><td>${esc(i.msg)}</td></tr>`).join('')}</tbody></table></div>${plan.issues.length > 120 ? `<small class="muted">Mostrando 120 de ${plan.issues.length}.</small>` : ''}` : (nTot > 0 ? '<p style="font-size:13px;margin:12px 0 0">Nenhum problema encontrado.</p>' : '')}
      <div class="row-gap" style="margin-top:12px"><button class="btn dark" onclick="pmImport()" ${nTot <= 0 || PM.busy ? 'disabled' : ''}>${PM.busy ? 'Importando…' : nTot > 0 ? `${dest === 'new' ? 'Criar projeto e importar' : 'Importar'} ${nTot} item(ns) válido(s)` : 'Nada novo para importar'}</button>${warns.length ? `<small class="muted">${warns.length} aviso(s): o item entra, com o ajuste descrito.</small>` : ''}</div>` : ''}
    ${R ? `<div class="panel" style="margin-top:14px;background:#f1f8f3"><b>Pronto.</b> ${R.created ? `Projeto novo <b>${esc(R.projectName)}</b> criado` : `Criado em <b>${esc(R.projectName)}</b>`}: ${R.camp} campanha(s) com ${R.pieces} anúncio(s) e ${R.car} carrossel(éis)${R.skipped ? `. ${R.skipped} carrossel(éis) já existiam e foram ignorados` : ''}.<div class="row-gap" style="margin-top:8px;flex-wrap:wrap">${R.camp ? `<button class="btn sm" onclick="go('campaigns')">Ver campanhas</button>` : ''}${R.car ? `<button class="btn sm" onclick="go('carrosseis')">Ver carrosséis</button>` : ''}</div></div>` : ''}
  </div>`;
}
function renderPlanilha() { pmRender(); }
