/* Guia dos arquétipos: explicações em português simples, papéis (principal, secundário, terciário), marcas clicáveis, guia e relatório para imprimir/PDF.
   Roda no Studio e na página do cliente (marca.html), por isso não depende de nada do Studio além de identidade-data.js.
   Os textos são interpretações de uso comum no marketing (modelo de 12 arquétipos). Não são regra: servem de ponto de partida. */
const idEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

const ID_INTRO = {
  oque: 'Arquétipo é um tipo de personalidade que todo mundo reconhece de histórias, filmes e do dia a dia: o herói, o sábio, o cuidador, o rebelde… Uma marca também tem personalidade. Quando você descobre qual é a sua, fica fácil decidir como falar, que cores usar, que conteúdo postar e até que tipo de cliente atrair.',
  comoUsar: 'Não existe arquétipo certo ou errado. Existe o que combina com quem você é de verdade. O resultado aqui é uma sugestão a partir dos valores e atitudes que você escolheu: se não se reconhecer, troque. A decisão é sua.',
  porque: 'Para que serve: textos e anúncios com a mesma “voz”, visual coerente, e clientes que se identificam com a marca em vez de só comparar preço.'
};
const ID_ROLES = {
  principal: {t: 'Principal', d: 'É a personalidade que manda. Define o tom da maior parte dos textos, o visual e a promessa da marca. Quando estiver em dúvida sobre como falar, volte ao principal.'},
  secundario: {t: 'Secundário', d: 'Tempera o principal. Dá um segundo jeito de falar para momentos específicos (por exemplo, mostrar autoridade num anúncio ou ser acolhedor no atendimento). Não pode brigar com o principal: se parecer contraditório, use menos.'},
  terciario: {t: 'Terciário', d: 'Um toque de apoio, não uma personalidade inteira. Aparece em detalhes: uma palavra, um tipo de post, um elemento do visual. Se não combinar com você, pode ignorar.'}
};
/* conteúdo por arquétipo: quem é, características, atitudes, como se comunica (jeito + exemplos escritos para ilustrar), e como isso aparece no trabalho */
const ID_GUIA = {
  inocente: {
    quem: 'Quer um mundo simples, bom e seguro. Passa confiança, otimismo e pureza. Fala como quem acredita que as coisas podem dar certo.',
    carac: ['Otimista', 'Honesto', 'Gentil', 'Simples e direto'],
    atit: ['Explica sem complicar', 'Só promete o que cumpre', 'Evita pressão e drama', 'Mostra o lado bom sem negar os problemas'],
    comunica: 'Frases curtas, palavras do dia a dia, tom positivo e acolhedor. Sem jargão, sem ironia pesada, sem ameaça.',
    frases: ['Simples assim: poucos passos e pronto.', 'Aqui não tem letra miúda. Só o que você precisa saber.'],
    trabalho: {texto: 'Títulos curtos e claros; benefício dito de forma direta; garantia e transparência em destaque.', visual: 'Tendência: cores claras e suaves (branco, azul-claro, tons pastel), bastante espaço em branco, fotos naturais e luminosas, formas simples.', conteudo: 'Dicas fáceis, perguntas e respostas, bastidores honestos, histórias de quem resolveu sem sofrimento.'}
  },
  explorador: {
    quem: 'Quer liberdade para descobrir e ir além. Não gosta de rotina nem de ficar parado. Convida as pessoas a se aventurarem e a serem quem são.',
    carac: ['Curioso', 'Independente', 'Ambicioso', 'Inquieto'],
    atit: ['Convida a experimentar o novo', 'Mostra caminhos em vez de impor um', 'Valoriza autonomia', 'Foge do óbvio e do padrão'],
    comunica: 'Convidativo e espontâneo, com verbos de movimento (ir, descobrir, explorar). Frases abertas, sem pressa e sem cobrança.',
    frases: ['Tem um caminho novo esperando por você.', 'Vá além do que todo mundo já fez.'],
    trabalho: {texto: 'Textos que abrem possibilidades; perguntas; “e se?”; histórias de jornada.', visual: 'Tendência: cenários amplos, natureza, cores terrosas e vivas, fotos de movimento, enquadramentos abertos.', conteudo: 'Roteiros, descobertas, comparativos de opções, relatos de quem mudou de rumo.'}
  },
  sabio: {
    quem: 'Quer entender e ensinar a verdade. Confia em dados, estudo e experiência. É a marca que explica o porquê das coisas.',
    carac: ['Analítico', 'Calmo', 'Preciso', 'Didático'],
    atit: ['Explica com calma e com dados', 'Admite o que não sabe', 'Prefere método a opinião', 'Educa antes de vender'],
    comunica: 'Claro, calmo e baseado em fatos. Usa passo a passo, exemplos e comparações. Evita exagero, gíria forçada e promessa milagrosa.',
    frases: ['Entenda por que isso acontece e como resolver, passo a passo.', 'Os dados mostram um caminho mais seguro.'],
    trabalho: {texto: 'Títulos que respondem “por quê” e “como”; explicações com lógica; fontes e provas.', visual: 'Tendência: layout limpo e organizado, tipografia legível, azuis e cinzas, gráficos e esquemas.', conteudo: 'Guias, comparativos, mitos e verdades, estudos de caso, aulas curtas.'}
  },
  heroi: {
    quem: 'Quer provar seu valor com coragem e ação. Enfrenta desafios e inspira os outros a superar os seus.',
    carac: ['Corajoso', 'Determinado', 'Competitivo', 'Disciplinado'],
    atit: ['Fala sem rodeio', 'Enfrenta o problema de frente', 'Cobra resultado e disciplina', 'Celebra conquistas'],
    comunica: 'Direto, motivador e confiante, em tom de desafio. Verbos de ação, metas, resultado. Não gosta de “mais ou menos”.',
    frases: ['Chegou a hora de ir até o fim.', 'Você consegue. Aqui está o plano.'],
    trabalho: {texto: 'Chamadas fortes e imperativas; foco em resultado; metas e prazos.', visual: 'Tendência: contraste alto, vermelho, preto, azul-escuro; fotos de ação e esforço; tipografia forte.', conteudo: 'Desafios, antes e depois, histórias de superação, números e conquistas.'}
  },
  foradalei: {
    quem: 'Quer quebrar o que não funciona e virar o jogo. Provoca, incomoda e dá voz a quem não aceita o jeito antigo.',
    carac: ['Rebelde', 'Provocador', 'Sem filtro', 'Livre'],
    atit: ['Desafia o que todo mundo aceita', 'Quebra regras que não fazem sentido', 'Fala a verdade nua', 'Não pede licença'],
    comunica: 'Irreverente, curto e sem enfeite. Usa “chega de”, “contra o óbvio”. Tem opinião forte, mas precisa construir algo, não só criticar.',
    frases: ['Chega de fazer do jeito que sempre foi.', 'A regra não funciona? Então muda a regra.'],
    trabalho: {texto: 'Títulos de ruptura; inimigo claro (um hábito, não uma pessoa); opinião firme.', visual: 'Tendência: preto, vermelho, laranja; texturas ásperas, colagem, tipografia crua e quebrada.', conteudo: 'Manifestos, “o que ninguém te conta”, bastidores sem filtro, quebra de mitos.'}
  },
  mago: {
    quem: 'Quer transformar a realidade e fazer sonhos acontecerem. Mostra o antes e o depois com um toque de encantamento.',
    carac: ['Visionário', 'Inspirador', 'Misterioso', 'Transformador'],
    atit: ['Encanta e surpreende', 'Transforma a vida da pessoa', 'Fala de sonhos e de futuro', 'Revela o que estava escondido'],
    comunica: 'Inspirador e simbólico, com palavras como imagine, descubra, transforme. Cria curiosidade antes de explicar. Cuidado para não prometer mais do que entrega.',
    frases: ['Imagine acordar com isso resolvido.', 'Existe um jeito de transformar isso, e ele começa agora.'],
    trabalho: {texto: 'Títulos de transformação; antes e depois; promessa com prova.', visual: 'Tendência: roxo, azul-noite, dourado; brilho e gradientes suaves; imagens oníricas e minimalistas.', conteudo: 'Histórias de transformação, “o segredo de…”, bastidores do método, demonstrações.'}
  },
  caracomum: {
    quem: 'Quer pertencer e ser aceito como é. É a marca amiga, de conversa franca, sem pose e sem frescura.',
    carac: ['Realista', 'Próximo', 'Humilde', 'Sociável'],
    atit: ['Fala como gente comum', 'Escuta antes de falar', 'Mostra bastidores sem filtro', 'Trata todo mundo como igual'],
    comunica: 'Informal, de conversa, com “a gente” e exemplos do cotidiano. Evita palavra difícil, elitismo e exclusividade.',
    frases: ['A gente também já passou por isso.', 'Sem frescura: é assim que funciona.'],
    trabalho: {texto: 'Linguagem do dia a dia; humor leve; exemplos reais; “nós” em vez de “eu”.', visual: 'Tendência: cores quentes e naturais, fotos reais (não de banco de imagem), layouts descomplicados.', conteudo: 'Bastidores, rotina, depoimentos espontâneos, respostas às dúvidas da comunidade.'}
  },
  amante: {
    quem: 'Quer intimidade, paixão e experiências marcantes. Valoriza beleza, cuidado e prazer nos detalhes.',
    carac: ['Caloroso', 'Sensorial', 'Elegante', 'Apaixonado'],
    atit: ['Fala com carinho e proximidade', 'Cuida dos detalhes', 'Valoriza o prazer e o momento', 'Faz a pessoa se sentir especial'],
    comunica: 'Caloroso e sensorial, com palavras de sentir e saborear. Frases suaves, elegantes, sem pressa e sem agressividade.',
    frases: ['Feito para você sentir a diferença.', 'Cada detalhe pensado para o seu momento.'],
    trabalho: {texto: 'Texto sensorial e pessoal; fala direto com a pessoa; promessa de experiência.', visual: 'Tendência: vinho, rosa, dourado, tons quentes; fotos próximas, luz suave, texturas e detalhes.', conteudo: 'Experiências, rituais, histórias de cuidado, depoimentos emocionais.'}
  },
  bobo: {
    quem: 'Quer viver o presente com alegria e leveza. Usa humor para aproximar e quebrar a seriedade, sem deixar de entregar.',
    carac: ['Bem-humorado', 'Espontâneo', 'Leve', 'Surpreendente'],
    atit: ['Faz graça e não se leva tão a sério', 'Usa humor para explicar', 'Brinca com o que é chato', 'Celebra os pequenos momentos'],
    comunica: 'Brincalhão, de frases curtas e viradas inesperadas. Gíria leve, trocadilho, autoironia. Evita solenidade e tom professoral.',
    frases: ['Bora? Prometo que não dói.', 'Falar de burocracia sem bocejar: desafio aceito.'],
    trabalho: {texto: 'Humor com propósito; piadas que levam ao benefício; tom leve nas chamadas.', visual: 'Tendência: cores vibrantes e contrastantes, ilustrações divertidas, memes e animações curtas.', conteudo: 'Memes do nicho, desafios, vídeos leves, “erros comuns” em tom de brincadeira.'}
  },
  prestativo: {
    quem: 'Quer proteger e cuidar das pessoas. É generoso, acolhedor e está sempre pronto para ajudar.',
    carac: ['Acolhedor', 'Generoso', 'Paciente', 'Atencioso'],
    atit: ['Protege e acolhe quem chega', 'Escuta antes de falar', 'Dá conteúdo generoso e gratuito', 'Está presente no pós-venda'],
    comunica: 'Acolhedor, calmo e tranquilizador. Fala de apoio, segurança e cuidado. Evita pressão, culpa e frieza.',
    frases: ['Você não precisa passar por isso sozinho.', 'Estamos com você em cada etapa.'],
    trabalho: {texto: 'Empatia no começo do texto; clareza sobre o que acontece em cada etapa; ofertas de ajuda.', visual: 'Tendência: azuis e verdes suaves, tons terrosos, fotos de pessoas, formas arredondadas.', conteudo: 'Orientações, dúvidas frequentes, acompanhamento, histórias de quem foi ajudado.'}
  },
  criador: {
    quem: 'Quer criar algo de valor duradouro, com capricho e originalidade. Gosta de fazer do zero e de expressar uma visão própria.',
    carac: ['Imaginativo', 'Original', 'Perfeccionista', 'Expressivo'],
    atit: ['Cria algo do zero com capricho', 'Cuida dos detalhes', 'Faz o difícil parecer fácil', 'Mostra o processo criativo'],
    comunica: 'Imaginativo e cuidadoso, com palavras de criar, construir e imaginar. Fala do processo e do resultado feito com atenção.',
    frases: ['Feito do zero, com atenção a cada detalhe.', 'Uma ideia só sua, em forma de projeto.'],
    trabalho: {texto: 'Texto autoral, com personalidade; foco no processo e no resultado único.', visual: 'Tendência: paletas ousadas, composição artística, texturas, tipografia expressiva, ilustração.', conteudo: 'Bastidores da criação, antes e depois, processo passo a passo, portfólio.'}
  },
  governante: {
    quem: 'Quer ordem, controle e prosperidade. É a marca de referência, que passa segurança, autoridade e padrão alto.',
    carac: ['Líder', 'Responsável', 'Sóbrio', 'Refinado'],
    atit: ['Assume o comando e dá direção', 'Mostra o caminho com autoridade', 'Valoriza tradição e confiança', 'Mantém padrão e consistência'],
    comunica: 'Seguro, sóbrio e autoritativo. Frases completas, vocabulário refinado, sem gíria nem improviso. Evita tom de brincadeira.',
    frases: ['O padrão que você pode confiar.', 'Referência no que faz, com garantia de qualidade.'],
    trabalho: {texto: 'Títulos de autoridade; garantias; credenciais e provas sociais em destaque.', visual: 'Tendência: preto, azul-marinho, dourado, prata; tipografia clássica; fotos formais e muito bem produzidas.', conteudo: 'Análises de mercado, cases, certificações, posicionamento institucional.'}
  }
};
const ID_GUIA_NOTA = 'Este guia reúne interpretações de uso comum em marketing (modelo de 12 arquétipos). As marcas citadas são exemplos frequentes na literatura e a classificação de cada marca varia de autor para autor: use como referência de sensação, não como verdade. Frases de exemplo foram escritas para ilustrar o tom; não são falas reais das marcas.';

/* quem é principal, secundário e terciário: o que o usuário escolheu manda; o resto vem do ranking */
function idRoles(sel) {
  sel = sel || {}; const sc = idScore(sel), has = sc[0].score > 0;
  const main = sel.arch || (has ? sc[0].id : ''); if (!main) return {main: '', sec: '', ter: '', sc};
  const rest = sc.filter(x => x.score > 0 && x.id !== main).map(x => x.id);
  const sec = sel.arch2 && sel.arch2 !== main ? sel.arch2 : (rest[0] || '');
  const ter = rest.find(k => k !== sec) || '';
  return {main, sec, ter, sc};
}
const idPct = (sc, k) => (sc.find(x => x.id === k) || {pct: 0}).pct;
/* frase que junta os três, só com o que está nos dados */
function idCombo(r) {
  if (!r.main) return '';
  const A = ID_ARCHS, m = A[r.main], s = r.sec && A[r.sec], t = r.ter && A[r.ter];
  let h = `Na prática: o <b>${idEsc(m.n)}</b> dá o rumo (deseja ${idEsc(m.desejo.toLowerCase())}; tom: ${idEsc(m.tom.toLowerCase())}).`;
  if (s) h += ` O <b>${idEsc(s.n)}</b> acrescenta ${idEsc(s.dom.toLowerCase())}, nos momentos em que a marca precisa disso.`;
  if (t) h += ` O <b>${idEsc(t.n)}</b> entra só como um toque (${idEsc(t.tom.toLowerCase())}).`;
  return h;
}

/* ---------- blocos de HTML (usados no Studio, no formulário do cliente e nos PDFs) ---------- */
const idList = a => `<ul class="ig-ul">${a.map(x => `<li>${idEsc(x)}</li>`).join('')}</ul>`;
const idBrandBtn = (m, k) => `<button type="button" class="ig-brand" data-b="${idEsc(m)}" data-k="${k || ''}" onclick="idBrandOpen(this.dataset.b,this.dataset.k)" title="Ver a comunicação de ${idEsc(m)}">${idEsc(m)} ↗</button>`;
function idBrandBtns(k) {
  return (ID_ARCHS[k].marcas || []).map(m => idBrandBtn(m, k)).join('');
}
function idArchFull(k, role) {
  const a = ID_ARCHS[k], g = ID_GUIA[k], R = role && ID_ROLES[role];
  return `<div class="ig-card">${R ? `<div class="ig-role">${idEsc(R.t)}</div>` : ''}<h3 class="ig-h">${idEsc(a.n)}<small>${idEsc(ID_GROUPS[a.g])}</small></h3>
    <p class="ig-who">${idEsc(g.quem)}</p>
    <div class="ig-cols"><div><h5>Características</h5>${idList(g.carac)}</div><div><h5>Atitudes</h5>${idList(g.atit)}</div></div>
    <div class="ig-cols"><div><h5>Deseja</h5><p>${idEsc(a.desejo)}</p><h5>Tem medo de</h5><p>${idEsc(a.medo)}</p></div><div><h5>Dom</h5><p>${idEsc(a.dom)}</p><h5>Cuidado (sombra)</h5><p>${idEsc(a.sombra)}</p></div></div>
    <h5>Como se comunica</h5><p>${idEsc(g.comunica)}</p><p class="ig-ex">${g.frases.map(f => `“${idEsc(f)}”`).join('<br>')}</p>
    <div class="ig-cols"><div><h5>Palavras que costuma usar</h5><p>${a.usa.map(idEsc).join(', ')}</p></div><div><h5>O que evita</h5><p>${a.evita.map(idEsc).join(', ')}</p></div></div>
    <h5>Como influencia o seu trabalho</h5><ul class="ig-ul"><li><b>Texto:</b> ${idEsc(g.trabalho.texto)}</li><li><b>Visual:</b> ${idEsc(g.trabalho.visual)}</li><li><b>Conteúdo:</b> ${idEsc(g.trabalho.conteudo)}</li></ul>
    <h5>Marcas que costumam ser citadas como parecidas <small>(clique para ver a comunicação)</small></h5><div class="ig-brands">${idBrandBtns(k)}</div></div>`;
}
/* explicação do passo 3: o que é arquétipo + os três papéis + cartões */
function idIntroHTML() {
  return `<div class="ig-intro"><b>O que é um arquétipo?</b><p>${idEsc(ID_INTRO.oque)}</p><p>${idEsc(ID_INTRO.comoUsar)}</p><p class="ig-mut">${idEsc(ID_INTRO.porque)}</p>
  <div class="ig-roles">${['principal', 'secundario', 'terciario'].map(r => `<div><b>${idEsc(ID_ROLES[r].t)}</b><span>${idEsc(ID_ROLES[r].d)}</span></div>`).join('')}</div></div>`;
}
function idRolesHTML(r) {
  if (!r.main) return '';
  const row = (role, k) => k ? `<details class="ig-det" ${role === 'principal' ? 'open' : ''}><summary><b>${idEsc(ID_ROLES[role].t)}:</b> ${idEsc(ID_ARCHS[k].n)} <em>${idPct(r.sc, k)}% de afinidade</em></summary><p class="ig-mut">${idEsc(ID_ROLES[role].d)}</p>${idArchFull(k)}</details>` : '';
  return `<p class="ig-combo">${idCombo(r)}</p>${row('principal', r.main)}${row('secundario', r.sec)}${row('terciario', r.ter)}`;
}

/* ---------- marcas clicáveis ---------- */
function idBrandUrls(name) {
  const q = encodeURIComponent(name);
  return {
    site: 'https://www.google.com/search?q=' + encodeURIComponent(name + ' site oficial'),
    campanhas: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(name + ' campanha comercial'),
    anuncios: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BR&q=' + q + '&search_type=keyword_unordered',
    instagram: 'https://www.google.com/search?q=' + encodeURIComponent(name + ' instagram oficial')
  };
}
function idBrandHTML(name, k) {
  const u = idBrandUrls(name), a = k && ID_ARCHS[k], g = k && ID_GUIA[k];
  return `<div class="ig-bm"><h2>${idEsc(name)}</h2>${a ? `<p class="ig-mut">Costuma ser citada como exemplo do arquétipo <b>${idEsc(a.n)}</b>. Isso é interpretação: use como referência de sensação.</p>` : '<p class="ig-mut">Marca que você admira. Veja como ela se comunica.</p>'}
    <div class="ig-links"><a href="${u.site}" target="_blank" rel="noopener">🌐 Site oficial</a><a href="${u.instagram}" target="_blank" rel="noopener">📷 Instagram</a><a href="${u.campanhas}" target="_blank" rel="noopener">▶ Campanhas e comerciais</a><a href="${u.anuncios}" target="_blank" rel="noopener">📢 Anúncios que está rodando</a></div>
    <p class="ig-mut" style="font-size:12px">Os links abrem a busca no seu navegador (site oficial, YouTube e Biblioteca de Anúncios da Meta). O Studio não lê os sites daqui.</p>
    ${a ? `<h5>O que observar na comunicação dela</h5><ul class="ig-ul"><li><b>Tom:</b> ${idEsc(a.tom)}</li><li><b>Palavras:</b> ${a.usa.map(idEsc).join(', ')}</li><li><b>O que evita:</b> ${a.evita.map(idEsc).join(', ')}</li><li><b>Visual:</b> ${idEsc(g.trabalho.visual.replace(/^Tendência: /, ''))}</li><li><b>Perguntas:</b> como ela abre os anúncios? Que promessa faz? Como é a voz nas legendas? O que é parecido com você e o que é diferente?</li></ul>` : '<h5>O que observar</h5><ul class="ig-ul"><li>Como abre os anúncios e que promessa faz</li><li>A voz das legendas e das respostas aos clientes</li><li>Cores, fontes e tipo de foto</li><li>O que é parecido com você e o que é diferente</li></ul>'}</div>`;
}
function idBrandOpen(name, k) {
  let b = document.getElementById('idBrandBack');
  if (!b) { b = document.createElement('div'); b.id = 'idBrandBack'; b.className = 'ig-back'; b.onclick = e => { if (e.target === b) b.classList.remove('open'); }; b.innerHTML = '<div class="ig-modal"><button type="button" class="ig-x" aria-label="Fechar" onclick="document.getElementById(\'idBrandBack\').classList.remove(\'open\')">×</button><div id="idBrandBody"></div></div>'; document.body.appendChild(b); }
  document.getElementById('idBrandBody').innerHTML = idBrandHTML(String(name).slice(0, 80), k || ''); b.classList.add('open');
}

/* ---------- documentos para imprimir / salvar em PDF ---------- */
const IG_CSS = `body{font:14px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#16181d;margin:0;background:#fff}.w{max-width:820px;margin:0 auto;padding:30px 24px}
.tb{position:sticky;top:0;background:#16181d;color:#fff;padding:10px 16px;display:flex;gap:10px;align-items:center;justify-content:space-between}.tb button{border:0;border-radius:8px;padding:8px 14px;font-weight:700;cursor:pointer}
h1{font-size:32px;line-height:1.1;margin:0 0 8px}.sub{color:#5d6470;margin:0 0 18px}h2{font-size:20px;margin:26px 0 8px;border-top:2px solid #16181d;padding-top:10px}h3{font-size:18px;margin:0}h4,h5{margin:12px 0 3px;font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:#5d6470}
.card{border:1px solid #e3e5ea;border-radius:12px;padding:14px 16px;margin:12px 0;break-inside:avoid}.card small{color:#5d6470;font-weight:400;margin-left:8px;font-size:12px}.role{display:inline-block;background:#e8590c;color:#fff;border-radius:99px;padding:1px 10px;font-size:11px;font-weight:700;margin-bottom:4px}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:14px}ul{margin:4px 0;padding-left:18px}p{margin:4px 0}.ex{background:#f6f6f3;border-left:3px solid #e8590c;padding:6px 10px;border-radius:0 8px 8px 0;font-style:italic}.tag{display:inline-block;background:#f1f1ee;border-radius:99px;padding:2px 10px;margin:2px 3px 2px 0;font-size:12.5px}
.nt{font-size:12px;color:#5d6470;border-top:1px solid #e3e5ea;margin-top:24px;padding-top:8px}.box{background:#f6f6f3;border-radius:12px;padding:12px 16px;margin:12px 0}.mut{color:#5d6470}
@media print{.tb{display:none}.w{padding:0}h2{break-after:avoid}}@media(max-width:620px){.cols{grid-template-columns:1fr}}`;
const IG_TB = '<div class="tb"><span>Para salvar em PDF: Imprimir → Salvar como PDF</span><button onclick="window.print()">Imprimir / PDF</button></div>';
function idDocArch(k, role) {
  const a = ID_ARCHS[k], g = ID_GUIA[k], R = role && ID_ROLES[role], ul = x => '<ul>' + x.map(i => `<li>${idEsc(i)}</li>`).join('') + '</ul>';
  return `<div class="card">${R ? `<span class="role">${idEsc(R.t)}</span>` : ''}<h3>${idEsc(a.n)}<small>${idEsc(ID_GROUPS[a.g])}</small></h3><p>${idEsc(g.quem)}</p>
  <div class="cols"><div><h5>Características</h5>${ul(g.carac)}<h5>Deseja</h5><p>${idEsc(a.desejo)}</p><h5>Dom</h5><p>${idEsc(a.dom)}</p></div><div><h5>Atitudes</h5>${ul(g.atit)}<h5>Tem medo de</h5><p>${idEsc(a.medo)}</p><h5>Cuidado (sombra)</h5><p>${idEsc(a.sombra)}</p></div></div>
  <h5>Como se comunica</h5><p>${idEsc(g.comunica)}</p><p class="ex">${g.frases.map(f => '“' + idEsc(f) + '”').join('<br>')}</p>
  <div class="cols"><div><h5>Palavras que costuma usar</h5><p>${a.usa.map(idEsc).join(', ')}</p></div><div><h5>O que evita</h5><p>${a.evita.map(idEsc).join(', ')}</p></div></div>
  <h5>Como influencia o trabalho</h5><ul><li><b>Texto:</b> ${idEsc(g.trabalho.texto)}</li><li><b>Visual:</b> ${idEsc(g.trabalho.visual)}</li><li><b>Conteúdo:</b> ${idEsc(g.trabalho.conteudo)}</li></ul>
  <h5>Marcas citadas como parecidas</h5><p>${a.marcas.map(idEsc).join(' · ')}</p></div>`;
}
function idGuideDoc() {
  const groups = Object.keys(ID_GROUPS);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Guia dos 12 arquétipos de marca</title><style>${IG_CSS}</style></head><body>${IG_TB}<div class="w">
  <h1>Guia dos 12 arquétipos de marca</h1><p class="sub">O que são, como cada um pensa, age e se comunica, e como isso muda o seu marketing.</p>
  <div class="box"><b>O que é um arquétipo?</b><p>${idEsc(ID_INTRO.oque)}</p><p>${idEsc(ID_INTRO.comoUsar)}</p><p class="mut">${idEsc(ID_INTRO.porque)}</p></div>
  <h2>Principal, secundário e terciário</h2>${['principal', 'secundario', 'terciario'].map(r => `<p><b>${idEsc(ID_ROLES[r].t)}:</b> ${idEsc(ID_ROLES[r].d)}</p>`).join('')}
  <h2>Os 12 de relance</h2><table style="border-collapse:collapse;width:100%;font-size:13px">${Object.keys(ID_ARCHS).map(k => `<tr><td style="border:1px solid #e3e5ea;padding:5px 8px"><b>${idEsc(ID_ARCHS[k].n)}</b></td><td style="border:1px solid #e3e5ea;padding:5px 8px">${idEsc(ID_ARCHS[k].desejo)}</td><td style="border:1px solid #e3e5ea;padding:5px 8px">${idEsc(ID_ARCHS[k].tom)}</td></tr>`).join('')}</table>
  ${groups.map(g => `<h2>${idEsc(ID_GROUPS[g])}</h2>${Object.keys(ID_ARCHS).filter(k => ID_ARCHS[k].g === g).map(k => idDocArch(k)).join('')}`).join('')}
  <p class="nt">${idEsc(ID_GUIA_NOTA)}</p></div></body></html>`;
}
/* relatório da marca preenchido: d = {nome, values[], attitudes[], tom, lists{}, refBrands[], notes, arch, arch2, valuesIds[], attitudesIds[]} */
function idReportDoc(d) {
  const r = idRoles({values: d.valuesIds || [], attitudes: d.attitudesIds || [], arch: d.arch || '', arch2: d.arch2 || ''}), tags = a => (a && a.length) ? a.map(t => `<span class="tag">${idEsc(t)}</span>`).join('') : '<span class="mut">—</span>';
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Marca: valores, arquétipo e voz${d.nome ? ' · ' + idEsc(d.nome) : ''}</title><style>${IG_CSS}</style></head><body>${IG_TB}<div class="w">
  <h1>Marca: valores, arquétipo e voz</h1><p class="sub">${idEsc(d.nome || '')}${d.responsavel ? ' · respondido por ' + idEsc(d.responsavel) : ''}${d.data ? ' · ' + idEsc(d.data) : ''}</p>
  ${r.main ? `<div class="box"><b>Resultado</b><p>${idCombo(r)}</p></div>` : '<div class="box">Ainda não há valores e atitudes suficientes para sugerir um arquétipo.</div>'}
  <h2>Valores e atitudes</h2><h5>Valores</h5>${tags(d.values)}<h5>Atitudes</h5>${tags(d.attitudes)}<h5>Tom de voz</h5><p>${idEsc(d.tom || 'equilibrado')}</p>
  <h2>Voz e palavras</h2><div class="cols">${(d.listas || []).map(l => `<div><h5>${idEsc(l[0])}</h5>${tags(l[1])}</div>`).join('')}</div>
  <h2>Marcas que admira</h2>${tags(d.refBrands)}
  ${d.notes ? `<h2>Notas</h2><p>${idEsc(d.notes)}</p>` : ''}
  ${r.main ? `<h2>Seus arquétipos explicados</h2>${idDocArch(r.main, 'principal')}${r.sec ? idDocArch(r.sec, 'secundario') : ''}${r.ter ? idDocArch(r.ter, 'terciario') : ''}` : ''}
  <p class="nt">${idEsc(ID_GUIA_NOTA)}</p></div></body></html>`;
}
const IG_STYLE = `.ig-intro{background:#f4f1ea;border-radius:12px;padding:14px 16px;margin:0 0 14px;font-size:14px;line-height:1.55}.ig-intro p{margin:6px 0}.ig-mut{color:#5f6368}
.ig-roles{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px}.ig-roles div{background:#fff;border:1px solid #e3e3e8;border-radius:10px;padding:9px 11px;font-size:13px}.ig-roles b{display:block;margin-bottom:3px}
.ig-combo{background:#fff7f1;border-left:4px solid #e8590c;padding:9px 12px;border-radius:0 10px 10px 0;margin:12px 0;font-size:14px;line-height:1.55}
.ig-det{border:1px solid #e3e3e8;border-radius:12px;margin:10px 0;background:#fff}.ig-det>summary{cursor:pointer;padding:11px 14px;font-size:15px}.ig-det>summary em{font-style:normal;color:#5f6368;font-size:12.5px;margin-left:6px}.ig-det>p,.ig-det>.ig-card{margin:0 14px 12px}
.ig-card h3.ig-h{margin:2px 0 4px;font-size:19px}.ig-card h3 small{font-weight:400;color:#5f6368;font-size:12px;margin-left:8px}.ig-role{display:inline-block;background:#e8590c;color:#fff;border-radius:99px;padding:1px 10px;font-size:11px;font-weight:700}
.ig-card h5{margin:12px 0 3px;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#5f6368}.ig-card h5 small{text-transform:none;letter-spacing:0;font-weight:400}.ig-card p{margin:3px 0}.ig-ul{margin:3px 0;padding-left:18px}.ig-ul li{margin:2px 0}
.ig-cols{display:grid;grid-template-columns:1fr 1fr;gap:6px 16px}.ig-ex{background:#f6f6f3;border-left:3px solid #e8590c;padding:6px 10px;border-radius:0 8px 8px 0;font-style:italic}
.ig-brands{display:flex;flex-wrap:wrap;gap:8px}.ig-brand{border:1.5px solid #111;background:#fff;border-radius:99px;padding:5px 13px;font:600 13px/1.2 inherit;cursor:pointer}.ig-brand:hover{background:#111;color:#fff}
.ig-back{position:fixed;inset:0;background:#0007;display:none;align-items:center;justify-content:center;z-index:9999;padding:16px}.ig-back.open{display:flex}.ig-modal{position:relative;background:#fff;color:#16181d;border-radius:16px;max-width:560px;width:100%;max-height:88vh;overflow:auto;padding:22px 22px 18px;font:14px/1.55 -apple-system,Segoe UI,Roboto,sans-serif}
.ig-x{position:absolute;top:8px;right:10px;border:0;background:none;font-size:26px;cursor:pointer;line-height:1}.ig-bm h2{margin:0 0 4px;font-size:24px}.ig-links{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.ig-links a{display:block;text-align:center;border:1.5px solid #111;border-radius:10px;padding:9px 8px;color:#111;text-decoration:none;font-weight:700;font-size:13.5px}.ig-links a:hover{background:#111;color:#fff}
@media(max-width:620px){.ig-roles,.ig-cols,.ig-links{grid-template-columns:1fr}}`;
(function () { if (typeof document === 'undefined' || document.getElementById('idGuiaStyle')) return; const s = document.createElement('style'); s.id = 'idGuiaStyle'; s.textContent = IG_STYLE; (document.head || document.documentElement).appendChild(s); })();
