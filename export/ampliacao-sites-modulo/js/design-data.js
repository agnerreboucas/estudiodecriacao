/* Estúdio de Design — bibliotecas (30 estilos de design, 30 pares de fontes, 30 estilos de fotografia) e cruzamento por público e tom.
   Cada item tem "tags". O cruzamento pontua as tags do público (peso 2) e do tom (peso 3). */
const AUDIENCE_TAGS = {
  corporativo: 'Corporativo', popular: 'Popular', jovem: 'Jovem', feminino: 'Feminino', masculino: 'Masculino', senior: 'Sênior (50+)', familia: 'Família',
  tecnologia: 'Tecnologia', saude: 'Saúde', financeiro: 'Financeiro', educacao: 'Educação'
};
const TONE_TAGS = {serio: 'Sério', acolhedor: 'Acolhedor', energetico: 'Energético', premium: 'Premium', divertido: 'Divertido', urgente: 'Urgente', confiavel: 'Confiável', moderno: 'Moderno', minimalista: 'Minimalista'};
const AUDIENCE_PRESETS = [
  ['escritorio', 'Trabalhadores de escritório e telemarketing', 'corporativo popular moderno acolhedor'], ['autonomos', 'Autônomos e MEI', 'popular confiavel energetico'],
  ['pequenas', 'Donos de pequenos negócios', 'popular corporativo confiavel'], ['jovens', 'Jovens adultos (18–28)', 'jovem moderno divertido'], ['mulheres', 'Mulheres 25–45', 'feminino acolhedor moderno'],
  ['senior', 'Público 50+', 'senior confiavel acolhedor serio'], ['familias', 'Famílias', 'familia acolhedor divertido'], ['executivos', 'Executivos e decisores', 'corporativo premium serio'],
  ['tech', 'Tecnologia e startups', 'tecnologia moderno jovem'], ['saude', 'Saúde e bem-estar', 'saude acolhedor confiavel'], ['financeiro', 'Financeiro e crédito', 'financeiro confiavel serio popular'],
  ['educacao', 'Educação', 'educacao acolhedor jovem'], ['varejo', 'Público popular (varejo)', 'popular urgente energetico']
].map(([id, label, tags]) => ({id, label, tags: tags.split(' ')}));

/* ---- 30 estilos de design: [id, nome, tags, bg, fg, destaque, apoio, alinhamento, foto, marcador, caixa-alta, raio] ----
   foto: none | top | half | full · marcador: bar | underline | chip | none */
const DESIGN_STYLES = [
  ['brutalista', 'Brutalista', 'popular jovem energetico moderno', '#f2f0e6', '#111111', '#ff3b30', '#555555', 'left', 'none', 'chip', 1, 0],
  ['suico', 'Minimalista suíço', 'corporativo serio minimalista moderno confiavel', '#ffffff', '#111111', '#e11d2e', '#777777', 'left', 'none', 'underline', 0, 0],
  ['editorial', 'Editorial de revista', 'premium feminino serio moderno', '#f7f3ee', '#1c1917', '#b45309', '#78716c', 'left', 'top', 'underline', 0, 0],
  ['pop', 'Pop colorido', 'jovem divertido popular energetico', '#ffd60a', '#111111', '#ff2d55', '#333333', 'center', 'none', 'chip', 1, 24],
  ['corp-limpo', 'Corporativo limpo', 'corporativo confiavel serio moderno financeiro', '#0b2545', '#ffffff', '#4cc9f0', '#a9b8cf', 'left', 'half', 'bar', 0, 12],
  ['neon-tech', 'Neon tech', 'tecnologia jovem moderno energetico', '#0b0b12', '#f5f5ff', '#00f5d4', '#8888aa', 'left', 'none', 'underline', 1, 8],
  ['retro70', 'Retrô anos 70', 'familia acolhedor divertido popular', '#f4e4c1', '#3b2314', '#d2691e', '#7a5c3e', 'center', 'none', 'bar', 0, 20],
  ['promo', 'Promoção de varejo', 'popular urgente energetico', '#e11d2e', '#ffffff', '#ffe500', '#ffd9d9', 'center', 'none', 'chip', 1, 12],
  ['luxo', 'Luxo escuro dourado', 'premium serio financeiro', '#0d0d0d', '#f4efe6', '#c9a227', '#8c8472', 'center', 'none', 'underline', 0, 0],
  ['organico', 'Orgânico terroso', 'saude acolhedor feminino familia', '#efe6d8', '#3a3226', '#7a8450', '#7d7060', 'left', 'top', 'bar', 0, 28],
  ['memphis', 'Memphis geométrico', 'jovem divertido moderno', '#ffffff', '#111111', '#7c3aed', '#ff5ea8', 'left', 'none', 'chip', 1, 16],
  ['cartaz', 'Cartaz tipográfico', 'popular energetico urgente jovem', '#111111', '#f5f5f5', '#ffb703', '#aaaaaa', 'left', 'none', 'none', 1, 0],
  ['glass', 'Glassmorphism', 'tecnologia premium moderno', '#1e1b4b', '#ffffff', '#a78bfa', '#c7c2f0', 'left', 'full', 'none', 0, 28],
  ['gradiente', 'Gradiente moderno', 'jovem tecnologia moderno', '#312e81', '#ffffff', '#f472b6', '#c7d2fe', 'left', 'none', 'chip', 0, 24],
  ['jornal', 'Jornalístico', 'corporativo serio urgente confiavel', '#fafafa', '#111111', '#c1121f', '#666666', 'left', 'top', 'underline', 0, 0],
  ['infantil', 'Infantil lúdico', 'familia divertido acolhedor', '#e0f2fe', '#1e3a8a', '#f97316', '#475569', 'center', 'none', 'chip', 0, 32],
  ['mono', 'Monocromático premium', 'premium minimalista serio corporativo', '#ececec', '#111111', '#111111', '#666666', 'left', 'none', 'underline', 0, 0],
  ['saas', 'Startup SaaS', 'tecnologia corporativo moderno confiavel', '#ffffff', '#0f172a', '#6366f1', '#64748b', 'left', 'half', 'chip', 0, 14],
  ['street', 'Streetwear', 'jovem masculino energetico', '#151515', '#fafafa', '#d4ff00', '#888888', 'left', 'full', 'none', 1, 0],
  ['bem-estar', 'Saúde e bem-estar', 'saude acolhedor feminino senior confiavel', '#ecfdf5', '#064e3b', '#10b981', '#4b7a68', 'left', 'top', 'bar', 0, 24],
  ['financeiro', 'Financeiro confiável', 'financeiro corporativo senior confiavel serio popular', '#f8fafc', '#0b3b2e', '#16a34a', '#55705f', 'left', 'half', 'bar', 0, 12],
  ['educacao', 'Educação amigável', 'educacao jovem familia acolhedor divertido', '#fff7ed', '#7c2d12', '#ea580c', '#9a6b50', 'left', 'none', 'chip', 0, 20],
  ['urgente', 'Notícia urgente', 'urgente popular energetico', '#ffffff', '#111111', '#e11d2e', '#444444', 'left', 'top', 'chip', 1, 0],
  ['carimbo', 'Vintage carimbo', 'popular acolhedor familia', '#f1e7d0', '#2b2118', '#b3261e', '#7a6a52', 'center', 'none', 'underline', 1, 0],
  ['neobrutal', 'Neobrutalismo', 'jovem moderno divertido popular tecnologia', '#fef3c7', '#000000', '#8b5cf6', '#333333', 'left', 'none', 'chip', 0, 8],
  ['aquarela', 'Aquarela suave', 'feminino acolhedor saude familia', '#fdf2f8', '#4a2040', '#db7093', '#8a6a80', 'center', 'none', 'bar', 0, 30],
  ['industrial', 'Industrial', 'masculino corporativo serio popular', '#2a2d34', '#f1f1f1', '#f59e0b', '#a0a4ad', 'left', 'none', 'bar', 1, 0],
  ['esportivo', 'Esportivo dinâmico', 'jovem masculino energetico popular', '#0a0a0a', '#ffffff', '#ff4d00', '#bbbbbb', 'left', 'full', 'none', 1, 0],
  ['fitness', 'Fitness neon', 'jovem saude energetico moderno', '#0f0f1a', '#ffffff', '#39ff14', '#aaaaaa', 'left', 'full', 'chip', 1, 8],
  ['serifado', 'Serifado elegante', 'premium feminino serio senior', '#f9f6f1', '#2a1f1a', '#8b5a3c', '#7d6e63', 'center', 'none', 'underline', 0, 0]
].map(([id, name, tags, bg, fg, accent, muted, align, photo, mark, upper, radius]) => ({id, name, tags: tags.split(' '), bg, fg, accent, muted, align, photo, mark, upper: !!upper, radius}));

/* ---- 30 pares de fontes (Google Fonts): [id, nome, títulos, texto, peso do título, tags] ---- */
const FONT_META = { // família → pesos disponíveis (vazio = só 400)
  'Poppins': '400;600;700;800;900', 'Inter': '400;600;700;800;900', 'Montserrat': '400;600;700;800;900', 'Open Sans': '400;600;700;800', 'Roboto': '400;500;700;900', 'Lato': '400;700;900',
  'Nunito': '400;600;700;800;900', 'Raleway': '400;600;700;800;900', 'Oswald': '400;500;600;700', 'Bebas Neue': '', 'Anton': '', 'Playfair Display': '400;600;700;800;900', 'Merriweather': '400;700;900',
  'Lora': '400;600;700', 'DM Serif Display': '', 'DM Sans': '400;500;700', 'Abril Fatface': '', 'Archivo Black': '', 'Rubik': '400;500;700;900', 'Work Sans': '400;600;700;900', 'Manrope': '400;600;700;800',
  'Space Grotesk': '400;500;700', 'Sora': '400;600;700;800', 'Outfit': '400;600;700;900', 'Plus Jakarta Sans': '400;600;700;800', 'Barlow Condensed': '400;600;700;800', 'Barlow': '400;500;700',
  'League Spartan': '400;600;700;900', 'Fredoka': '400;500;600;700', 'Baloo 2': '400;600;700;800', 'Caveat': '400;600;700', 'Bricolage Grotesque': '400;600;700;800', 'Source Serif 4': '400;600;700;900', 'Source Sans 3': '400;600;700;900', 'Instrument Serif': '', 'Cormorant Garamond': '400;600;700', 'Fjalla One': '', 'Archivo Narrow': '400;700', 'Kalam': '400;700', 'Permanent Marker': '', 'Big Shoulders Display': '400;700;900'
};
const FONT_PAIRS = [
  ['poppins', 'Poppins + Inter', 'Poppins', 'Inter', 800, 'moderno popular confiavel jovem'], ['montserrat', 'Montserrat + Open Sans', 'Montserrat', 'Open Sans', 800, 'corporativo confiavel moderno'],
  ['inter', 'Inter + Inter', 'Inter', 'Inter', 800, 'minimalista corporativo moderno serio'], ['roboto', 'Roboto + Roboto', 'Roboto', 'Roboto', 900, 'corporativo popular senior confiavel'],
  ['opensans', 'Open Sans + Lato', 'Open Sans', 'Lato', 800, 'popular senior acolhedor'], ['nunito', 'Nunito + Nunito', 'Nunito', 'Nunito', 800, 'acolhedor familia saude feminino educacao'],
  ['raleway', 'Raleway + Lato', 'Raleway', 'Lato', 800, 'premium feminino minimalista moderno'], ['oswald', 'Oswald + Open Sans', 'Oswald', 'Open Sans', 700, 'urgente popular energetico masculino'],
  ['bebas', 'Bebas Neue + Roboto', 'Bebas Neue', 'Roboto', 400, 'urgente energetico jovem popular masculino'], ['anton', 'Anton + Inter', 'Anton', 'Inter', 400, 'urgente energetico popular jovem'],
  ['playfair', 'Playfair Display + Lato', 'Playfair Display', 'Lato', 800, 'premium feminino serio senior'], ['merriweather', 'Merriweather + Open Sans', 'Merriweather', 'Open Sans', 900, 'serio senior confiavel financeiro'],
  ['lora', 'Lora + Inter', 'Lora', 'Inter', 700, 'acolhedor feminino premium serio'], ['dmserif', 'DM Serif Display + DM Sans', 'DM Serif Display', 'DM Sans', 400, 'premium moderno feminino'],
  ['abril', 'Abril Fatface + Poppins', 'Abril Fatface', 'Poppins', 400, 'premium divertido feminino'], ['archivo', 'Archivo Black + Inter', 'Archivo Black', 'Inter', 400, 'energetico jovem masculino popular'],
  ['rubik', 'Rubik + Rubik', 'Rubik', 'Rubik', 900, 'jovem divertido moderno popular'], ['worksans', 'Work Sans + Work Sans', 'Work Sans', 'Work Sans', 900, 'corporativo moderno minimalista'],
  ['manrope', 'Manrope + Manrope', 'Manrope', 'Manrope', 800, 'tecnologia moderno confiavel corporativo'], ['grotesk', 'Space Grotesk + Inter', 'Space Grotesk', 'Inter', 700, 'tecnologia jovem moderno'],
  ['sora', 'Sora + Sora', 'Sora', 'Sora', 800, 'tecnologia moderno jovem'], ['outfit', 'Outfit + Outfit', 'Outfit', 'Outfit', 900, 'moderno jovem minimalista'],
  ['jakarta', 'Plus Jakarta Sans', 'Plus Jakarta Sans', 'Plus Jakarta Sans', 800, 'moderno corporativo tecnologia confiavel'], ['barlowc', 'Barlow Condensed + Barlow', 'Barlow Condensed', 'Barlow', 800, 'masculino urgente energetico'],
  ['spartan', 'League Spartan + Inter', 'League Spartan', 'Inter', 900, 'jovem moderno energetico'], ['fredoka', 'Fredoka + Nunito', 'Fredoka', 'Nunito', 700, 'familia divertido educacao'],
  ['baloo', 'Baloo 2 + Nunito', 'Baloo 2', 'Nunito', 800, 'popular divertido familia acolhedor'], ['caveat', 'Caveat + Open Sans', 'Caveat', 'Open Sans', 700, 'acolhedor familia divertido feminino'],
  ['bricolage', 'Bricolage Grotesque + Inter', 'Bricolage Grotesque', 'Inter', 800, 'jovem moderno divertido'], ['sourceserif', 'Source Serif 4 + Source Sans 3', 'Source Serif 4', 'Source Sans 3', 900, 'serio educacao senior confiavel']
].map(([id, name, head, body, weight, tags]) => ({id, name, head, body, weight, tags: tags.split(' ')}));

/* ---- 30 estilos de fotografia: [id, nome, direção de arte, filtro, cor da sobreposição, modo, tags] ---- */
const PHOTO_STYLES = [
  ['documental', 'Documental popular', 'Gente real em situação do dia a dia, luz natural, nada posado.', 'saturate(1.05) contrast(1.05)', '', '', 'popular familia acolhedor'],
  ['retrato-corp', 'Retrato corporativo luminoso', 'Profissional em escritório claro, sorriso natural, fundo desfocado.', 'brightness(1.05)', '', '', 'corporativo confiavel serio'],
  ['pb', 'Preto e branco contrastado', 'Alto contraste, sombras profundas, expressão forte.', 'grayscale(1) contrast(1.25)', '', '', 'serio premium urgente'],
  ['duotone', 'Duotone azul e laranja', 'Foto tratada em duas cores, fundo chapado.', 'grayscale(1) contrast(1.1)', 'rgba(30,64,175,0.55)', 'multiply', 'jovem moderno energetico'],
  ['luz-quente', 'Luz natural quente', 'Hora dourada, tons quentes, sensação acolhedora.', 'saturate(1.2) brightness(1.03)', 'rgba(255,170,80,0.14)', 'overlay', 'acolhedor familia feminino'],
  ['flash', 'Flash direto de celular', 'Estética de foto de celular, flash estourado, espontânea.', 'contrast(1.2) brightness(1.08) saturate(1.1)', '', '', 'popular jovem urgente'],
  ['limpo', 'Fundo limpo minimalista', 'Sujeito isolado em fundo liso e claro, muito espaço vazio.', 'brightness(1.08) saturate(0.9)', '', '', 'minimalista corporativo premium moderno'],
  ['cinema', 'Cinematográfico teal e laranja', 'Cena com profundidade, contraste de cor frio e quente.', 'contrast(1.1) saturate(1.15)', 'rgba(0,128,128,0.18)', 'soft-light', 'premium moderno serio'],
  ['polaroid', 'Polaroid nostálgico', 'Tons desbotados, moldura clara, memória afetiva.', 'sepia(0.25) contrast(0.95) saturate(0.9)', '', '', 'acolhedor familia feminino'],
  ['neon', 'Neon noturno', 'Luzes coloridas, noite, contraste alto.', 'contrast(1.3) saturate(1.4) brightness(0.9)', 'rgba(120,0,255,0.2)', 'screen', 'jovem tecnologia energetico'],
  ['moda', 'Editorial de moda', 'Pose estudada, luz de estúdio, cores sóbrias.', 'contrast(1.1) saturate(0.85)', '', '', 'premium feminino moderno'],
  ['lifestyle', 'Lifestyle espontâneo', 'Pessoas vivendo o produto, gestos naturais.', 'saturate(1.1) brightness(1.03)', '', '', 'jovem familia acolhedor feminino'],
  ['produto-cor', 'Produto em fundo colorido', 'Produto centralizado em fundo chapado vibrante.', 'saturate(1.2) contrast(1.05)', '', '', 'jovem divertido popular moderno'],
  ['macro', 'Macro e detalhe', 'Close extremo em textura ou detalhe do produto.', 'contrast(1.1) saturate(1.1)', '', '', 'premium tecnologia saude'],
  ['aerea', 'Aérea e ampla', 'Vista de cima, escala, paisagem ou cidade.', 'saturate(1.1) contrast(1.05)', '', '', 'corporativo financeiro'],
  ['trabalho', 'Mão na massa', 'Pessoa trabalhando, mãos em primeiro plano, esforço real.', 'contrast(1.08) saturate(1.05)', '', '', 'popular masculino corporativo'],
  ['grao35', 'Grão de filme 35 mm', 'Grão visível, cores levemente desbotadas.', 'contrast(1.1) saturate(0.9) sepia(0.1)', '', '', 'premium acolhedor jovem'],
  ['pastel', 'Pastel suave', 'Cores claras e dessaturadas, luz difusa.', 'brightness(1.1) saturate(0.75) contrast(0.9)', '', '', 'feminino acolhedor saude minimalista'],
  ['urbano-noite', 'Urbano noturno', 'Rua à noite, reflexos, atitude.', 'contrast(1.25) saturate(1.2) brightness(0.85)', 'rgba(20,20,60,0.25)', 'multiply', 'jovem masculino energetico'],
  ['flat-lay', 'Flat lay de estúdio', 'Objetos organizados vistos de cima, fundo liso.', 'brightness(1.06) saturate(1.05)', '', '', 'minimalista feminino premium moderno'],
  ['callcenter', 'Atendimento com headset', 'Pessoa sorrindo de headset em escritório, estilo popular e próximo.', 'brightness(1.04) saturate(1.05)', '', '', 'popular corporativo acolhedor'],
  ['equipe', 'Equipe em escritório moderno', 'Time diverso conversando em ambiente claro e aberto.', 'brightness(1.04) contrast(1.02)', '', '', 'corporativo moderno confiavel tecnologia'],
  ['emocao', 'Close de emoção', 'Rosto em primeiro plano, expressão marcante, fundo escuro.', 'contrast(1.15) saturate(1.05)', '', '', 'urgente serio acolhedor'],
  ['antes-depois', 'Antes e depois', 'Duas situações lado a lado, contraste claro de resultado.', 'contrast(1.1) saturate(1.1)', '', '', 'popular saude financeiro urgente'],
  ['grafico', 'Foto com elementos gráficos', 'Pessoa recortada com formas e setas desenhadas por cima.', 'saturate(1.2) contrast(1.1)', '', '', 'jovem divertido popular'],
  ['sticker', 'Recorte estilo sticker', 'Pessoa recortada com contorno branco grosso.', 'saturate(1.15) contrast(1.05)', '', '', 'jovem divertido popular moderno'],
  ['preto-ouro', 'Preto e dourado', 'Fundo preto, luz dourada, sensação de luxo.', 'contrast(1.2) saturate(1.1)', 'rgba(201,162,39,0.12)', 'overlay', 'premium financeiro serio'],
  ['natureza', 'Verde e natureza', 'Folhagem, luz suave, respiro.', 'saturate(1.1) brightness(1.03)', 'rgba(60,140,80,0.1)', 'overlay', 'saude acolhedor feminino familia'],
  ['movimento', 'Esporte em movimento', 'Ação congelada ou borrão de movimento, energia.', 'contrast(1.2) saturate(1.2)', '', '', 'jovem masculino energetico saude'],
  ['familia-casa', 'Família em casa', 'Cena doméstica, luz de janela, proximidade.', 'saturate(1.05) brightness(1.04)', 'rgba(255,200,140,0.1)', 'overlay', 'familia acolhedor senior popular']
].map(([id, name, brief, filter, ovColor, ovMode, tags]) => ({id, name, brief, filter, ovColor, ovMode, tags: tags.split(' ')}));

const byId = (list, id) => list.find(x => x.id === id);

/* ---- cruzamento ---- */
function scoreItem(item, aud, tone) {
  const a = item.tags.filter(t => aud.includes(t)), o = item.tags.filter(t => tone.includes(t));
  return {score: a.length * 2 + o.length * 3, why: a.concat(o)};
}
function recommendLibrary(list, aud, tone, n = 3) {
  return list.map(it => Object.assign({item: it}, scoreItem(it, aud, tone))).sort((x, y) => y.score - x.score || x.item.name.localeCompare(y.item.name)).slice(0, n);
}
/* combina os melhores de cada biblioteca; limita repetição do mesmo design */
function crossCompositions(aud, tone, max = 6) {
  const D = recommendLibrary(DESIGN_STYLES, aud, tone, 4), F = recommendLibrary(FONT_PAIRS, aud, tone, 4), P = recommendLibrary(PHOTO_STYLES, aud, tone, 4), out = [];
  D.forEach(d => F.forEach(f => P.forEach(p => out.push({design: d.item, font: f.item, photo: p.item, score: d.score * 1.4 + f.score + p.score, why: [...new Set(d.why.concat(f.why, p.why))]}))));
  out.sort((a, b) => b.score - a.score);
  const pick = [], used = {};
  out.forEach(c => { if (pick.length < max && (used[c.design.id] || 0) < 2 && !pick.some(x => x.design.id === c.design.id && x.font.id === c.font.id)) { pick.push(c); used[c.design.id] = (used[c.design.id] || 0) + 1; } });
  return pick;
}
