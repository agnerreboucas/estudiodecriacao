/* Catálogo de fontes (Google Fonts) para logos tipográficos: família → [categoria, pesos, escala opcional].
   Categorias: sans, geo (geométrica), serif, slab, cond (condensada), display, script, mono, round (arredondada).
   Os pesos listados existem em cada família; '' = só o peso 400. Mesclado em FONT_META ao carregar. */
const LG_FONT_CATS = [['sans', 'Sem serifa'], ['geo', 'Geométrica'], ['serif', 'Serifada'], ['slab', 'Slab (serifa grossa)'], ['cond', 'Condensada'], ['display', 'Display / impacto'], ['script', 'Manuscrita'], ['round', 'Arredondada'], ['mono', 'Monoespaçada']];
const LG_TYPEFACES = Object.entries({
  /* sem serifa e geométricas */
  'Inter': ['sans', '400;600;700;800;900'], 'Poppins': ['geo', '400;600;700;800;900'], 'Montserrat': ['geo', '400;600;700;800;900'], 'Outfit': ['geo', '400;600;700;900'], 'Urbanist': ['geo', '400;600;700;800;900'], 'Lexend': ['geo', '400;600;700;800'],
  'Jost': ['geo', '400;500;700;800'], 'Josefin Sans': ['geo', '400;600;700'], 'Red Hat Display': ['sans', '400;600;700;800;900'], 'Figtree': ['sans', '400;600;700;800;900'], 'Albert Sans': ['sans', '400;600;700;800;900'], 'Kumbh Sans': ['geo', '400;600;700;800;900'],
  'Epilogue': ['sans', '400;600;700;800;900'], 'Be Vietnam Pro': ['sans', '400;600;700;800;900'], 'Questrial': ['geo', ''], 'Didact Gothic': ['sans', ''], 'Nunito Sans': ['sans', '400;600;700;800;900'], 'DM Sans': ['sans', '400;500;700'],
  'Work Sans': ['sans', '400;600;700;900'], 'Manrope': ['sans', '400;600;700;800'], 'Sora': ['geo', '400;600;700;800'], 'Plus Jakarta Sans': ['sans', '400;600;700;800'], 'League Spartan': ['geo', '400;600;700;900'], 'Raleway': ['sans', '400;600;700;800;900'],
  'Open Sans': ['sans', '400;600;700;800'], 'Roboto': ['sans', '400;500;700;900'], 'Lato': ['sans', '400;700;900'], 'Space Grotesk': ['sans', '400;500;700'], 'Archivo': ['sans', '400;600;700;800;900'], 'Hanken Grotesk': ['sans', '400;600;700;800;900'],
  'Onest': ['sans', '400;600;700;800;900'], 'Schibsted Grotesk': ['sans', '400;600;700;800;900'], 'Instrument Sans': ['sans', '400;500;700'], 'Familjen Grotesk': ['sans', '400;500;700'], 'Bricolage Grotesque': ['sans', '400;600;700;800'], 'Syne': ['sans', '400;600;700;800'],
  'Unbounded': ['geo', '400;600;700;900'], 'Rubik': ['sans', '400;500;700;900'], 'Barlow': ['sans', '400;500;700'], 'Source Sans 3': ['sans', '400;600;700;900'],
  /* arredondadas */
  'Fredoka': ['round', '400;500;600;700'], 'Baloo 2': ['round', '400;600;700;800'], 'Nunito': ['round', '400;600;700;800;900'], 'Quicksand': ['round', '400;500;600;700'], 'Comfortaa': ['round', '400;500;700'], 'Varela Round': ['round', ''], 'M PLUS Rounded 1c': ['round', '400;500;700;800;900'],
  /* serifadas */
  'Playfair Display': ['serif', '400;600;700;800;900'], 'Cormorant Garamond': ['serif', '400;600;700'], 'Cormorant': ['serif', '400;500;600;700'], 'DM Serif Display': ['serif', ''], 'DM Serif Text': ['serif', ''], 'Lora': ['serif', '400;600;700'], 'Merriweather': ['serif', '400;700;900'],
  'Libre Baskerville': ['serif', '400;700'], 'Libre Caslon Text': ['serif', '400;700'], 'Cinzel': ['serif', '400;600;700;900'], 'Bodoni Moda': ['serif', '400;600;700;900'], 'Fraunces': ['serif', '400;600;700;900'], 'Gloock': ['serif', ''], 'Young Serif': ['serif', ''],
  'Abril Fatface': ['serif', ''], 'Italiana': ['serif', ''], 'Marcellus': ['serif', ''], 'Prata': ['serif', ''], 'Rufina': ['serif', '400;700'], 'EB Garamond': ['serif', '400;600;700;800'], 'Spectral': ['serif', '400;600;700;800'], 'Crimson Pro': ['serif', '400;600;700;900'],
  'Newsreader': ['serif', '400;600;700;800'], 'Source Serif 4': ['serif', '400;600;700;900'], 'Instrument Serif': ['serif', ''], 'Yeseva One': ['serif', ''], 'Oranienbaum': ['serif', ''], 'Limelight': ['display', ''], 'Cinzel Decorative': ['display', '400;700;900'], 'Chonburi': ['serif', ''],
  /* slab */
  'Roboto Slab': ['slab', '400;600;700;900'], 'Zilla Slab': ['slab', '400;500;600;700'], 'Arvo': ['slab', '400;700'], 'Bitter': ['slab', '400;600;700;900'], 'Rokkitt': ['slab', '400;600;700;900'], 'Alfa Slab One': ['slab', ''], 'Bevan': ['slab', ''], 'Josefin Slab': ['slab', '400;600;700'],
  /* condensadas */
  'Bebas Neue': ['cond', ''], 'Anton': ['cond', ''], 'Oswald': ['cond', '400;500;600;700'], 'League Gothic': ['cond', ''], 'Fjalla One': ['cond', ''], 'Teko': ['cond', '400;500;600;700'], 'Saira Condensed': ['cond', '400;600;700;900'], 'Antonio': ['cond', '400;600;700'],
  'Big Shoulders Display': ['cond', '400;700;900'], 'Barlow Condensed': ['cond', '400;600;700;800'], 'Pathway Gothic One': ['cond', ''], 'Archivo Narrow': ['cond', '400;700'], 'Staatliches': ['cond', ''],
  /* display */
  'Archivo Black': ['display', ''], 'Righteous': ['display', ''], 'Monoton': ['display', ''], 'Bungee': ['display', ''], 'Lilita One': ['display', ''], 'Chango': ['display', ''], 'Paytone One': ['display', ''], 'Titan One': ['display', ''], 'Russo One': ['display', ''],
  'Orbitron': ['display', '400;600;700;900'], 'Audiowide': ['display', ''], 'Exo 2': ['display', '400;600;700;900'], 'Michroma': ['display', ''], 'Syncopate': ['display', '400;700'], 'Rajdhani': ['display', '400;500;600;700'], 'Chakra Petch': ['display', '400;500;600;700'],
  'Krona One': ['display', ''], 'Bowlby One': ['display', ''], 'Passion One': ['display', '400;700;900'], 'Shrikhand': ['display', ''], 'Fascinate': ['display', ''], 'Special Elite': ['display', ''], 'Rubik Mono One': ['display', ''], 'Black Ops One': ['display', ''],
  /* manuscritas (escala maior: as letras são menores) */
  'Caveat': ['script', '400;600;700', 1.4], 'Pacifico': ['script', '', 1.1], 'Dancing Script': ['script', '400;600;700', 1.2], 'Great Vibes': ['script', '', 1.5], 'Sacramento': ['script', '', 1.6], 'Satisfy': ['script', '', 1.2], 'Kaushan Script': ['script', '', 1.1],
  'Lobster': ['script', '', 1.1], 'Lobster Two': ['script', '400;700', 1.15], 'Yellowtail': ['script', '', 1.3], 'Allura': ['script', '', 1.5], 'Alex Brush': ['script', '', 1.5], 'Parisienne': ['script', '', 1.4], 'Courgette': ['script', '', 1.15], 'Cookie': ['script', '', 1.4],
  'Permanent Marker': ['script', '', 1.0], 'Kalam': ['script', '400;700', 1.2], 'Shadows Into Light': ['script', '', 1.3], 'Amatic SC': ['script', '400;700', 1.5], 'Indie Flower': ['script', '', 1.2], 'Rock Salt': ['script', '', 0.9], 'Marck Script': ['script', '', 1.2],
  'Playball': ['script', '', 1.3], 'Merienda': ['script', '400;600;700;900', 1.0], 'Norican': ['script', '', 1.3], 'Mr Dafoe': ['script', '', 1.2], 'Damion': ['script', '', 1.3], 'Rochester': ['script', '', 1.2], 'Handlee': ['script', '', 1.2], 'Gloria Hallelujah': ['script', '', 1.1],
  /* mono */
  'JetBrains Mono': ['mono', '400;600;700;800'], 'Space Mono': ['mono', '400;700'], 'IBM Plex Mono': ['mono', '400;500;600;700'], 'DM Mono': ['mono', '400;500'], 'Fira Code': ['mono', '400;500;600;700'], 'Inconsolata': ['mono', '400;600;700;900']
}).map(([f, v]) => ({family: f, cat: v[0], weights: v[1], scale: v[2] || 1}));
LG_TYPEFACES.forEach(f => { if (!(f.family in FONT_META)) FONT_META[f.family] = f.weights; });
const LG_TF = {}; LG_TYPEFACES.forEach(f => { LG_TF[f.family] = f; });
const lgWeightsOf = fam => { const m = FONT_META[fam]; return m ? m.split(';').filter(Boolean).map(Number) : [400]; };
const LG_WEIGHT_NAMES = {100: 'Fino', 200: 'Extraleve', 300: 'Leve', 400: 'Regular', 500: 'Médio', 600: 'Seminegrito', 700: 'Negrito', 800: 'Extranegrito', 900: 'Black'};
const lgDefaultWeight = fam => { const ws = lgWeightsOf(fam); return ws.reduce((a, b) => Math.abs(b - 700) < Math.abs(a - 700) ? b : a, ws[0]); };
/* estilo do logo → categorias de fonte que combinam */
const LG_STYLE_FONTCATS = {dinamico: ['cond', 'display', 'sans'], divertido: ['round', 'display', 'script'], alegre: ['round', 'script', 'display'], moderno: ['geo', 'sans', 'mono'], conservador: ['serif', 'slab'], criativo: ['script', 'display', 'serif'], tech: ['mono', 'sans', 'display', 'geo'], jovem: ['display', 'cond', 'round'], formal: ['serif'], hipster: ['slab', 'script', 'display', 'serif'], elegante: ['serif', 'script'], minimalista: ['sans', 'geo', 'serif'], vintage: ['slab', 'display', 'script', 'serif']};
/* companheiras para o slogan: categoria da fonte do nome → categorias que fazem par */
const LG_PAIRCATS = {serif: ['sans', 'geo'], slab: ['sans', 'geo'], script: ['sans', 'geo', 'serif'], cond: ['sans', 'serif', 'geo'], display: ['sans', 'geo', 'mono'], sans: ['serif', 'sans'], geo: ['serif', 'sans'], round: ['sans', 'round'], mono: ['sans', 'serif']};
function lgPairs(fam, n) { const f = LG_TF[fam] || {cat: 'sans'}, cats = LG_PAIRCATS[f.cat] || ['sans'], pool = LG_TYPEFACES.filter(x => cats.includes(x.cat) && x.family !== fam && x.cat !== 'script' && x.cat !== 'display'); let h = 0; for (const c of fam) h = (h * 31 + c.charCodeAt(0)) >>> 0; const out = []; for (let i = 0; out.length < (n || 4) && i < pool.length * 2; i++) { const p = pool[(h + i * 7) % pool.length]; if (!out.includes(p.family)) out.push(p.family); } return out; }
