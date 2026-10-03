/* Criador de Logo · dados: segmentos, estilos, símbolos vetoriais próprios, fontes e paletas.
   Todos os símbolos e paletas são originais deste projeto (nada copiado de bibliotecas de terceiros). */

/* ---- segmentos: palavra-chave → símbolos sugeridos e frases-base de slogan ---- */
const LG_SEGMENTS = [
  {id: 'beleza', label: 'Beleza e estética', kw: /beleza|est[eé]tic|cabelo|sal[aã]o|maquiag|unha|cosm[eé]t|skincare|barbear/i, sym: ['sparkle', 'leaf', 'drop', 'heart'], ai: 'beauty and aesthetics salon', tag: ['Realce o seu melhor', 'Cuidado que transforma', 'Beleza sem pressa']},
  {id: 'comida', label: 'Alimentação e restaurante', kw: /restaurante|comida|alimenta|padaria|caf[eé]|lanchon|pizz|doce|confeit|bar |gastro|hamb/i, sym: ['plate', 'flame', 'leaf', 'sun'], ai: 'restaurant and food business', tag: ['Sabor de verdade', 'Feito com carinho', 'Do jeito que você gosta']},
  {id: 'construcao', label: 'Construção e reformas', kw: /constru|reform|engenhar|obra|arquitet|pintur|marcen|el[eé]tric|encanad/i, sym: ['house', 'hex', 'gear', 'triangles'], ai: 'construction and home renovation', tag: ['Solidez em cada detalhe', 'Obra feita com confiança', 'Do projeto à entrega']},
  {id: 'imobiliaria', label: 'Imobiliária', kw: /imobili|im[oó]ve|corretor|aluguel|loca[cç][aã]o de/i, sym: ['house', 'pin', 'shield', 'hex'], ai: 'real estate agency', tag: ['Seu próximo endereço', 'Encontre o seu lugar', 'Negócio seguro, casa certa']},
  {id: 'saude', label: 'Saúde e bem-estar', kw: /sa[uú]de|cl[ií]nica|m[eé]dic|odonto|dentist|psic[oó]log|terapia|nutri|fisio|bem-estar|yoga|spa/i, sym: ['cross', 'heart', 'drop', 'leaf'], ai: 'health and wellness clinic', tag: ['Cuidar de você vem primeiro', 'Saúde com acolhimento', 'Bem-estar de verdade']},
  {id: 'fitness', label: 'Fitness e esporte', kw: /fitness|academia|treino|esporte|crossfit|corrida|personal|muscula/i, sym: ['bolt', 'flame', 'shield', 'triangles'], ai: 'fitness and sports', tag: ['Supere seus limites', 'Treine com propósito', 'Força em movimento']},
  {id: 'tecnologia', label: 'Tecnologia e apps', kw: /tecnolog|software|app|sistema|digital|ti |dados|ia |intelig[eê]ncia|startup|saas/i, sym: ['hex', 'bolt', 'circles', 'triangles'], ai: 'technology and software company', tag: ['Inovação que simplifica', 'Tecnologia a seu favor', 'O futuro começa aqui']},
  {id: 'moda', label: 'Moda e acessórios', kw: /moda|roupa|vestu[aá]rio|acess[oó]rio|joia|jóia|bijut|boutique|cal[cç]ado/i, sym: ['sparkle', 'crown', 'heart', 'drop'], ai: 'fashion and accessories brand', tag: ['Estilo é atitude', 'Vista a sua história', 'Peças com personalidade']},
  {id: 'educacao', label: 'Educação e cursos', kw: /educa|curso|escola|ensino|aula|professor|mentor|treinamento|idioma|faculdade/i, sym: ['book', 'sparkle', 'shield', 'bars'], ai: 'education and online courses', tag: ['Aprender transforma', 'Conhecimento que avança', 'Ensino com propósito']},
  {id: 'juridico', label: 'Advocacia e contabilidade', kw: /advoc|jur[ií]d|contab|direito|cart[oó]rio|despachante|consultoria legal|mutu[aá]rio/i, sym: ['shield', 'crown', 'bars', 'hex'], ai: 'law firm and accounting services', tag: ['Orientação antes da decisão', 'Seus direitos, sem juridiquês', 'Segurança em cada passo']},
  {id: 'financas', label: 'Finanças e investimentos', kw: /finan|invest|cr[eé]dito|seguro|banco|cons[oó]rcio|empr[eé]stimo|capital/i, sym: ['bars', 'shield', 'hex', 'circles'], ai: 'finance and investment company', tag: ['Seu dinheiro, com direção', 'Crescer com segurança', 'Decisões que rendem']},
  {id: 'foto', label: 'Fotografia e vídeo', kw: /fot[oó]graf|v[ií]deo|audiovisual|filmag|ensaio|est[uú]dio/i, sym: ['lens', 'sparkle', 'sun', 'ring'], ai: 'photography and video studio', tag: ['Momentos que ficam', 'Olhar que conta histórias', 'Imagens com alma']},
  {id: 'natureza', label: 'Viagem e natureza', kw: /viagem|turismo|natureza|aventura|camping|trilha|hotel|pousada|ecol[oó]g|agro|campo|fazenda/i, sym: ['mountain', 'sun', 'wave', 'leaf'], ai: 'travel, nature and outdoors', tag: ['Descubra o caminho', 'Natureza em cada detalhe', 'Aventura que inspira']},
  {id: 'musica', label: 'Música e entretenimento', kw: /m[uú]sic|banda|show|evento|festa|dj|podcast|entreten|teatro|cinema|games?/i, sym: ['wave', 'bolt', 'sparkle', 'circles'], ai: 'music and entertainment', tag: ['Ouça o que move você', 'Ritmo que conecta', 'Viva o momento']},
  {id: 'marketing', label: 'Marketing e agência', kw: /marketing|ag[eê]ncia|publicidade|branding|m[ií]dia|social media|propaganda|design/i, sym: ['sparkle', 'bars', 'circles', 'triangles'], ai: 'marketing and creative agency', tag: ['Ideias que vendem', 'Marca com estratégia', 'Crescimento com criatividade']},
  {id: 'limpeza', label: 'Limpeza e serviços', kw: /limpeza|higien|lavanderia|dedetiz|jardin|manuten|servi[cç]os? gerais|diarista/i, sym: ['drop', 'sparkle', 'house', 'leaf'], ai: 'cleaning and home services', tag: ['Tudo no lugar', 'Limpeza que dá gosto', 'Serviço de confiança']},
  {id: 'auto', label: 'Automotivo', kw: /autom[oó]v|carro|oficina|mec[aâ]nic|lava[- ]?jato|moto|pe[cç]as|transporte|log[ií]stica/i, sym: ['bolt', 'gear', 'shield', 'triangles'], ai: 'automotive and transport', tag: ['Potência e confiança', 'Seu carro em boas mãos', 'Na estrada com você']},
  {id: 'pets', label: 'Pets', kw: /pet|animal|veterin|cachorro|gato|ra[cç][aã]o/i, sym: ['heart', 'leaf', 'drop', 'sun'], ai: 'pet care and veterinary', tag: ['Amor em quatro patas', 'Cuidado de verdade', 'Felicidade que abana o rabo']},
  {id: 'outro', label: 'Outro', kw: /./, sym: ['sparkle', 'hex', 'circles', 'sun'], ai: 'small business', tag: ['Feito com propósito', 'Qualidade que você sente', 'Confiança em cada detalhe']}
];
function lgDetectSegment(text) { const t = String(text || ''); const s = LG_SEGMENTS.find(x => x.id !== 'outro' && x.kw.test(t)); return s ? s.id : 'outro'; }
const lgSegment = id => LG_SEGMENTS.find(s => s.id === id) || LG_SEGMENTS[LG_SEGMENTS.length - 1];

/* ---- estilos (etiquetas): peso por fonte, composição, símbolo, clima de cor e fundo ---- */
const LG_STYLES = [
  {id: 'dinamico', label: 'Dinâmico', fonts: ['black', 'cond', 'grotesk', 'geo'], comps: ['horizontal', 'pill', 'sidebar', 'stack'], sym: ['bolt', 'flame', 'triangles', 'bars', 'wave'], mood: ['energetico', 'vibrante'], modes: ['dark', 'color', 'light']},
  {id: 'divertido', label: 'Divertido', fonts: ['round', 'script', 'geo'], comps: ['badge', 'stack', 'pill'], sym: ['sparkle', 'sun', 'heart', 'circles', 'drop'], mood: ['divertido', 'vibrante'], modes: ['color', 'light', 'dark']},
  {id: 'alegre', label: 'Alegre', fonts: ['round', 'geo', 'script'], comps: ['stack', 'badge', 'horizontal'], sym: ['sun', 'sparkle', 'heart', 'circles', 'leaf'], mood: ['divertido', 'quente'], modes: ['light', 'color']},
  {id: 'moderno', label: 'Moderno', fonts: ['geo', 'grotesk', 'thin'], comps: ['horizontal', 'stack', 'wordmark', 'pill'], sym: ['hex', 'circles', 'triangles', 'bars', 'ring'], mood: ['tech', 'sobrio'], modes: ['light', 'dark', 'color']},
  {id: 'conservador', label: 'Conservador', fonts: ['serif', 'didone', 'geo'], comps: ['frame', 'stack', 'lines', 'badge'], sym: ['shield', 'crown', 'house', 'bars'], mood: ['sobrio', 'premium'], modes: ['light', 'dark']},
  {id: 'criativo', label: 'Criativo', fonts: ['script', 'serif', 'grotesk'], comps: ['stack', 'wordmark', 'badge'], sym: ['sparkle', 'circles', 'wave', 'drop', 'leaf'], mood: ['vibrante', 'divertido'], modes: ['color', 'light', 'dark']},
  {id: 'tech', label: 'Tech', fonts: ['grotesk', 'geo', 'thin'], comps: ['horizontal', 'pill', 'wordmark', 'stack'], sym: ['hex', 'bolt', 'circles', 'triangles', 'ring'], mood: ['tech', 'frio'], modes: ['dark', 'light', 'color']},
  {id: 'jovem', label: 'Jovem', fonts: ['black', 'round', 'geo'], comps: ['pill', 'horizontal', 'badge'], sym: ['bolt', 'sparkle', 'flame', 'circles'], mood: ['vibrante', 'energetico'], modes: ['color', 'dark', 'light']},
  {id: 'formal', label: 'Formal', fonts: ['didone', 'serif', 'thin'], comps: ['frame', 'lines', 'stack'], sym: ['shield', 'crown', 'bars', 'hex'], mood: ['sobrio', 'premium'], modes: ['light', 'dark']},
  {id: 'hipster', label: 'Hipster', fonts: ['vintage', 'script', 'serif'], comps: ['badge', 'lines', 'frame'], sym: ['mountain', 'leaf', 'sun', 'plate', 'wave'], mood: ['natural', 'quente'], modes: ['light', 'dark']},
  {id: 'elegante', label: 'Elegante', fonts: ['elegant', 'serif', 'didone'], comps: ['stack', 'lines', 'wordmark', 'frame'], sym: ['sparkle', 'leaf', 'crown', 'drop'], mood: ['premium', 'elegante'], modes: ['light', 'dark']},
  {id: 'minimalista', label: 'Minimalista', fonts: ['thin', 'geo', 'elegant'], comps: ['wordmark', 'stack', 'horizontal'], sym: ['ring', 'hex', 'circles', 'sparkle'], mood: ['sobrio', 'calmo'], modes: ['light', 'dark']},
  {id: 'vintage', label: 'Vintage', fonts: ['vintage', 'serif', 'cond'], comps: ['badge', 'lines', 'frame'], sym: ['sun', 'mountain', 'plate', 'house', 'wave'], mood: ['quente', 'natural'], modes: ['light', 'color']}
];
const lgStyle = id => LG_STYLES.find(s => s.id === id);

/* ---- fontes por papel (famílias do Google Fonts já liberadas em FONT_META) ---- */
const LG_FONTS = {
  geo:     {label: 'Geométrica', head: 'Outfit', hw: 700, tag: 'Outfit', tw: 400, upper: true, ls: 2, tls: 6},
  grotesk: {label: 'Grotesca', head: 'Space Grotesk', hw: 700, tag: 'Inter', tw: 500, upper: false, ls: 0, tls: 4},
  thin:    {label: 'Fina', head: 'Manrope', hw: 400, tag: 'Manrope', tw: 400, upper: true, ls: 10, tls: 8},
  black:   {label: 'Pesada', head: 'Archivo Black', hw: 400, tag: 'Inter', tw: 600, upper: true, ls: 1, tls: 4},
  cond:    {label: 'Condensada', head: 'Anton', hw: 400, tag: 'Barlow Condensed', tw: 600, upper: true, ls: 2, tls: 6},
  round:   {label: 'Arredondada', head: 'Fredoka', hw: 600, tag: 'Fredoka', tw: 400, upper: false, ls: 0, tls: 2},
  script:  {label: 'Manuscrita', head: 'Caveat', hw: 700, tag: 'Inter', tw: 500, upper: false, ls: 0, tls: 4, scale: 1.45},
  serif:   {label: 'Serifada', head: 'DM Serif Display', hw: 400, tag: 'Lora', tw: 400, upper: false, ls: 0, tls: 3},
  didone:  {label: 'Clássica', head: 'Playfair Display', hw: 700, tag: 'Lato', tw: 400, upper: true, ls: 3, tls: 6},
  elegant: {label: 'Elegante', head: 'Cormorant Garamond', hw: 600, tag: 'Raleway', tw: 400, upper: true, ls: 8, tls: 8},
  vintage: {label: 'Vintage', head: 'Abril Fatface', hw: 400, tag: 'Lora', tw: 400, upper: true, ls: 2, tls: 4}
};

/* ---- símbolos vetoriais: partes em viewBox 100×100. role: main | acc | sec; stroke:true = traço ---- */
const lgPoly = pts => 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L') + ' Z';
const lgRays = (n, r1, r2, w) => Array.from({length: n}, (_, i) => { const a = i * 2 * Math.PI / n, c = Math.cos(a), s = Math.sin(a), px = -s * w / 2, py = c * w / 2; return lgPoly([[50 + c * r1 + px, 50 + s * r1 + py], [50 + c * r2 + px, 50 + s * r2 + py], [50 + c * r2 - px, 50 + s * r2 - py], [50 + c * r1 - px, 50 + s * r1 - py]]); }).join(' ');
const lgGear = n => { const pts = []; for (let i = 0; i < n; i++) { const a = i * 2 * Math.PI / n, h = Math.PI / n * 0.5; [[-h * 1.0, 33], [-h * 0.55, 46], [h * 0.55, 46], [h * 1.0, 33]].forEach(([da, r]) => pts.push([50 + Math.cos(a + da) * r, 50 + Math.sin(a + da) * r])); } return lgPoly(pts); };
const LG_SYMBOLS = {
  ring:      {label: 'Anel', parts: [{d: 'M50 6a44 44 0 1 0 .01 0zM50 22a28 28 0 1 1-.01 0z', role: 'main', rule: 'evenodd'}, {d: 'M50 38a12 12 0 1 0 .01 0z', role: 'acc'}]},
  mountain:  {label: 'Montanha', parts: [{d: 'M4 86L36 28l14 24 10-14 36 48z', role: 'main'}, {d: 'M36 28l9 15-9-5-9 5z', role: 'acc'}]},
  leaf:      {label: 'Folha', parts: [{d: 'M50 94C18 76 10 42 16 12c30 4 68 16 70 46 1 20-15 33-36 36z', role: 'main'}, {d: 'M48 86C46 64 52 44 66 28', role: 'acc', stroke: true, sw: 5}]},
  flame:     {label: 'Chama', parts: [{d: 'M50 4c8 20 30 30 30 56 0 20-14 34-30 34S20 80 20 60c0-14 8-20 14-30 2 10 8 14 10 14-2-14 0-28 6-40z', role: 'main'}, {d: 'M50 94c-8 0-14-8-14-18 0-10 8-14 14-24 6 10 14 14 14 24 0 10-6 18-14 18z', role: 'acc'}]},
  hex:       {label: 'Hexágono', parts: [{d: 'M50 4L90 27v46L50 96 10 73V27zM50 20L76 35v30L50 80 24 65V35z', role: 'main', rule: 'evenodd'}, {d: 'M50 38L62 45v14L50 66 38 59V45z', role: 'acc'}]},
  sparkle:   {label: 'Brilho', parts: [{d: 'M50 4C54 32 68 46 96 50 68 54 54 68 50 96 46 68 32 54 4 50 32 46 46 32 50 4z', role: 'main'}, {d: 'M80 8c1 6 4 9 10 10-6 1-9 4-10 10-1-6-4-9-10-10 6-1 9-4 10-10z', role: 'acc'}]},
  drop:      {label: 'Gota', parts: [{d: 'M50 4C70 32 82 48 82 64c0 18-14 30-32 30S18 82 18 64C18 48 30 32 50 4z', role: 'main'}, {d: 'M36 62c0 8 5 14 12 16', role: 'acc', stroke: true, sw: 6}]},
  house:     {label: 'Casa', parts: [{d: 'M50 6L96 46H84V92H16V46H4z', role: 'main'}, {d: 'M40 92V62h20v30z', role: 'acc'}]},
  bolt:      {label: 'Raio', parts: [{d: 'M58 4L14 56h30l-6 40 48-58H56z', role: 'main'}]},
  heart:     {label: 'Coração', parts: [{d: 'M50 92C10 62 4 30 24 16c14-8 24-2 26 8 2-10 12-16 26-8 20 14 14 46-26 76z', role: 'main'}, {d: 'M28 30c-6 4-8 12-4 20', role: 'acc', stroke: true, sw: 5}]},
  crown:     {label: 'Coroa', parts: [{d: 'M6 76L12 28l24 24 14-34 14 34 24-24 6 48z', role: 'main'}, {d: 'M6 84h88v10H6z', role: 'acc'}]},
  shield:    {label: 'Escudo', parts: [{d: 'M50 4L90 18v32c0 24-18 38-40 46C28 88 10 74 10 50V18z', role: 'main'}, {d: 'M32 50l13 13 24-26', role: 'acc', stroke: true, sw: 8}]},
  triangles: {label: 'Triângulos', parts: [{d: 'M50 6L74 46H26z', role: 'main'}, {d: 'M22 54h24L34 94H10z', role: 'acc'}, {d: 'M54 54h24l12 40H66z', role: 'sec'}]},
  circles:   {label: 'Círculos', parts: [{d: 'M38 6a28 28 0 1 0 .01 0z', role: 'main'}, {d: 'M66 36a28 28 0 1 0 .01 0z', role: 'acc', op: 0.85}, {d: 'M38 56a28 28 0 1 0 .01 0z', role: 'sec', op: 0.8}]},
  wave:      {label: 'Onda', parts: [{d: 'M4 36C20 14 36 14 50 34S80 54 96 32v18C80 72 64 72 50 52S20 32 4 54z', role: 'main'}, {d: 'M4 66C20 44 36 44 50 64S80 84 96 62v18C80 100 64 100 50 80S20 60 4 82z', role: 'acc'}]},
  sun:       {label: 'Sol', parts: [{d: 'M50 28a22 22 0 1 0 .01 0z', role: 'main'}, {d: lgRays(8, 32, 46, 8), role: 'acc'}]},
  gear:      {label: 'Engrenagem', parts: [{d: lgGear(8) + 'M50 36a14 14 0 1 0 .01 0z', role: 'main', rule: 'evenodd'}]},
  pin:       {label: 'Localização', parts: [{d: 'M50 96C28 68 16 54 16 38 16 18 31 4 50 4s34 14 34 34c0 16-12 30-34 58zM50 24a14 14 0 1 0 .01 0z', role: 'main', rule: 'evenodd'}]},
  plate:     {label: 'Prato', parts: [{d: 'M50 6a44 44 0 1 0 .01 0zM50 20a30 30 0 1 1-.01 0z', role: 'main', rule: 'evenodd'}, {d: 'M42 34v32M50 34v32M58 34v32M42 52h16', role: 'acc', stroke: true, sw: 4}]},
  lens:      {label: 'Lente', parts: [{d: 'M50 4a46 46 0 1 0 .01 0zM50 18a32 32 0 1 1-.01 0z', role: 'main', rule: 'evenodd'}, {d: 'M50 34a16 16 0 1 0 .01 0z', role: 'acc'}]},
  bars:      {label: 'Crescimento', parts: [{d: 'M8 92V62h20v30z', role: 'main'}, {d: 'M40 92V38h20v54z', role: 'acc'}, {d: 'M72 92V8h20v84z', role: 'main'}]},
  book:      {label: 'Livro', parts: [{d: 'M50 24C38 14 20 14 6 20v62c14-6 32-6 44 4 12-10 30-10 44-4V20C80 14 62 14 50 24z', role: 'main'}, {d: 'M50 28v56', role: 'acc', stroke: true, sw: 4}]},
  cross:     {label: 'Cruz', parts: [{d: 'M36 6h28v30h30v28H64v30H36V64H6V36h30z', role: 'main'}, {d: 'M50 38a12 12 0 1 0 .01 0z', role: 'acc'}]}
};
const LG_SYMBOL_IDS = Object.keys(LG_SYMBOLS);

/* ---- paletas nomeadas (5 cores: escura, principal, secundária, destaque, clara) ---- */
const LG_PALETTES = [
  {id: 'p-aurora',    name: 'Aurora Boreal',  moods: ['tech', 'frio'],            c: ['#0b1d3a', '#1f6feb', '#2dd4bf', '#f5c518', '#f2f7ff']},
  {id: 'p-brasa',     name: 'Brasa Viva',     moods: ['energetico', 'quente'],    c: ['#1c1210', '#e4572e', '#f2a541', '#ffd166', '#fff6ea']},
  {id: 'p-oliva',     name: 'Oliveira',       moods: ['natural', 'calmo'],        c: ['#1f2a1c', '#4d7c3a', '#a3b18a', '#d9a441', '#f4f1e6']},
  {id: 'p-areia',     name: 'Areia & Mar',    moods: ['calmo', 'natural'],        c: ['#14313f', '#1b7f8c', '#8fcfd1', '#e9b872', '#fbf6ec']},
  {id: 'p-uva',       name: 'Uva Madura',     moods: ['premium', 'vibrante'],     c: ['#1e0b2e', '#6a2c91', '#c45bd1', '#ffb84d', '#f7eefb']},
  {id: 'p-grafite',   name: 'Grafite Ouro',   moods: ['premium', 'sobrio'],       c: ['#111111', '#2b2b2b', '#8a8a8a', '#c9a24b', '#f6f4ef']},
  {id: 'p-cereja',    name: 'Cereja',         moods: ['energetico', 'vibrante'],  c: ['#220a12', '#c2185b', '#ff5c8a', '#ffb3c6', '#fff1f5']},
  {id: 'p-menta',     name: 'Menta Fresca',   moods: ['calmo', 'frio'],           c: ['#10302a', '#0f9d7a', '#7fe0c2', '#ffd27a', '#f0fbf7']},
  {id: 'p-azulreal',  name: 'Azul Real',      moods: ['sobrio', 'tech'],          c: ['#0a1a3f', '#1e3a8a', '#3b82f6', '#f59e0b', '#eef3ff']},
  {id: 'p-terra',     name: 'Terra Batida',   moods: ['natural', 'quente'],       c: ['#2b1710', '#a0522d', '#d08c60', '#e9c46a', '#fbf1e4']},
  {id: 'p-neon',      name: 'Neon Noturno',   moods: ['tech', 'vibrante'],        c: ['#0a0a1a', '#6c4cff', '#00e5ff', '#ff3d9a', '#f1f1ff']},
  {id: 'p-algodao',   name: 'Algodão-doce',   moods: ['divertido', 'calmo'],      c: ['#3b2a4a', '#f47fb3', '#8ecae6', '#ffd6a5', '#fff7fb']},
  {id: 'p-sol',       name: 'Sol da Tarde',   moods: ['divertido', 'quente'],     c: ['#2d1b00', '#f77f00', '#fcbf49', '#d62828', '#fff8e8']},
  {id: 'p-noite',     name: 'Noite Violeta',  moods: ['elegante', 'premium'],     c: ['#120a24', '#3d2a6b', '#9b8bd1', '#e0b0ff', '#f6f2fc']},
  {id: 'p-bosque',    name: 'Bosque Fundo',   moods: ['natural', 'sobrio'],       c: ['#0c1f17', '#1b5e42', '#5fa882', '#c8b560', '#eff5ef']},
  {id: 'p-coral',     name: 'Coral Tropical', moods: ['divertido', 'vibrante'],   c: ['#2a1118', '#ff6b6b', '#4ecdc4', '#ffe66d', '#fff6f6']},
  {id: 'p-petroleo',  name: 'Petróleo',       moods: ['sobrio', 'frio'],          c: ['#0d1f26', '#14546b', '#4d9fb5', '#f2a65a', '#eef5f7']},
  {id: 'p-vinho',     name: 'Vinho & Creme',  moods: ['elegante', 'premium'],     c: ['#2a0f1b', '#7b1e3a', '#c76b85', '#d8b26e', '#faf2e8']},
  {id: 'p-lima',      name: 'Limão Siciliano', moods: ['energetico', 'divertido'], c: ['#1d2200', '#8bc34a', '#d4e157', '#ff9800', '#fbfde9']},
  {id: 'p-nuvem',     name: 'Nuvem',          moods: ['calmo', 'elegante'],       c: ['#243447', '#5b7c99', '#a8c0d6', '#e8b4a0', '#f5f8fb']},
  {id: 'p-ferrugem',  name: 'Ferrugem',       moods: ['quente', 'sobrio'],        c: ['#261612', '#b5452b', '#e07a5f', '#81b29a', '#f7efe6']},
  {id: 'p-mono',      name: 'Preto e Branco', moods: ['sobrio', 'elegante'],      c: ['#0a0a0a', '#262626', '#737373', '#d4d4d4', '#fafafa']}
];
const LG_MOODS = ['energetico', 'vibrante', 'divertido', 'tech', 'frio', 'calmo', 'natural', 'quente', 'premium', 'sobrio', 'elegante'];
