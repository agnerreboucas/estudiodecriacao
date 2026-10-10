# Histórico de versões

## 1.10.0
- **Formulário único do cliente** (o link do briefing virou o formulário completo, 11 partes): quem responde, empresa (site, @Instagram, redes), **a marca** (valores e atitudes de clicar, tom de voz, o que fala/não fala, admira/repudia, palavras que usa/nunca usa; mostra ao cliente o arquétipo na hora), o cliente do cliente, **produtos e serviços** com a ficha completa (formato, peso, tamanho, duração, entrega, prazo, validade, garantia, pagamento, para quem não serve, problemas que resolve, tempo de resolução), **concorrentes** (até 8, com site, Instagram, o que fazem bem/mal e a diferença), referências, marketing, **depoimentos** (com campo de autorização), links e materiais que já existem e **envio de fotos e arquivos** (logo, fotos, produtos, materiais já feitos, prints; imagens JPG/PNG/WebP e PDF, conferidos pelo conteúdo).
- **Importar respostas** agora preenche, sem apagar o que já existe: Marca e arquétipo, Voice Brain (palavras que usa e proibidas), fichas de produto, **Concorrentes** (com site, @ e notas), **Materiais do cliente** (links e depoimentos) e envia as imagens para a **Biblioteca**. Importar de novo não duplica.
- **Aba nova "Materiais do cliente"**: links, depoimentos (autorizado / falta autorização / não pode usar) e arquivos recebidos.
- A IA recebe só depoimentos **autorizados**, os concorrentes informados e os links. Respostas antigas do briefing continuam funcionando (a concorrência em campos soltos é convertida).
- Google Forms: o script e a importação por CSV acompanham as perguntas novas.

## 1.9.0
- **Marca e arquétipo** (aba nova no projeto): formulário em 5 passos, de clicar. 1) **Valores** (5 a 7, com opção "outro"), 2) **Atitudes**, 3) **Seu arquétipo** (os 12 do livro *O Herói e o Fora da Lei*, com barras de afinidade, desejo, medo, sombra, tom e **marcas parecidas**; dá para escolher outro arquétipo e um secundário), 4) **Voz e palavras** (5 controles de tom; o que fala / não fala, atitudes que tem / não tem, o que admira / repudia, **palavras que usa / não usa**, com sugestões por arquétipo), 5) **Resumo** (copiar, baixar .md, enviar ao Voice Brain). Salvo no projeto (`identity`), vai junto com a sincronização.
- **Produtos e serviços** (aba nova no projeto): ficha completa por produto — formato, peso, tamanho, duração, o que inclui, preço, condição, pagamento, entrega, prazo de entrega, validade, garantia, **para quem serve / não serve**, **problemas que resolve**, **tempo de resolução**, benefícios, diferenciais, objeções, provas e limites. Medidor de "ficha completa", **colar lista** (nome ; preço ; descrição), duplicar, "Completar com IA" (itens marcados [CONFIRMAR]) e "Criar página".
- A IA de todo o Studio passa a receber a identidade (arquétipo, tom, palavras que usa e **proibidas**) e os fatos de cada produto; só o que foi preenchido é enviado.

## 1.8.0
- **Aprovados ligados ao calendário (Publicação > Calendário).** Painel "Aprovados esperando agendamento" com as peças que o cliente aprovou (ou aprovadas por prazo): arraste uma peça para um dia, ou clique em **Agendar** / **Agendar aprovado neste dia**. Você escolhe a peça, o dia, o **horário**, o **estilo** (imagem, carrossel, story, vídeo) e as **redes** (Instagram/Facebook). A legenda vem do cliente (com a edição dele, se houve) e é validada pelas regras de cada rede. Peça já agendada sai do painel; rejeitada/alterada não aparece.
- **Integração com a Meta (Instagram + Facebook) — `api/meta_social.php`.** Fila própria de publicações (o Instagram não agenda sozinho): ao agendar, o job entra na fila; um cron chama `api/meta_social.php?action=run&key=SUA_CHAVE` e o servidor publica no horário. Suporta imagem, carrossel (2–10), stories e vídeo (URL pública), 3 tentativas com espera, sem repetir o que já saiu em uma das redes, link da publicação de volta no Studio, "Publicar agora" e cancelar ao tirar de "Agendado".
- **Conexão com a Meta** (Contas e dados): botão *Entrar com o Facebook* (OAuth, token longo, escolhe Página + Instagram profissional), conexão manual por token, testar, desconectar, criar as contas no Studio e "Rodar a fila agora". Chaves ficam só no servidor (`META_*` no `config.php` ou salvas no app com a senha do Studio). Sem token (ou com `META_DRY_RUN`) tudo é simulado e nada é enviado.
- Imagens são servidas à Meta por link público assinado (HMAC) e temporário.

## 1.7.0
- **Aprovação de arte (cliente), ligada ao Studio.** Nova tela *Aprovação de arte* (menu 5 · Mostrar ao cliente): escolha as peças reais do projeto (anúncios por fase da jornada nas medidas feed e Stories, carrosséis, stories e posts do Estúdio de Design), defina marca, @ e prazo, e envie. O Studio gera as artes em JPEG, cria o link `aprovacao.html?t=CÓDIGO` (sem login para o cliente) e guarda tudo no servidor (`api/aprovacao.php`).
- **Prazo de 72 horas.** O envio grava `sentAt`; passadas as horas (editável), toda peça *não avaliada* passa a **Aprovada por prazo** (selo tracejado, aviso na tela do cliente e no portão). Alterado e Rejeitado não expiram. A regra aparece no envio, na tela do cliente e no PDF. Confirme com seu contrato se vale para o seu caso.
- **PDF de apresentação** (16:9, creme/preto/vermelho): capa com data de envio, regra do prazo, visão geral com contorno por status, uma lâmina por categoria e por peça (com a decisão do cliente quando já houver) e fechamento com o prazo.
- **Respostas e correções no Studio**: contagem por status (inclui "por prazo"), correções com antes e depois do texto, anotações, link para o painel da equipe, e-mail para a equipe quando o cliente envia a revisão.
- **Arquivo único (HTML)** com as peças e imagens dentro, para teste rápido ou hospedagem simples.
- **Correções no módulo de aprovação:** sem rolagem lateral em celular de 390 px (502 px antes); decisões feitas logo antes de fechar ou recarregar a página não se perdem; imagens reais por slide agora aparecem (o campo `img` não era usado); só é "revisão enviada" quando o cliente envia.

## 1.6.0
- **Mesa de páginas** (menu *Mesa de páginas*): editor visual de sites/landings no estilo Figma + Elementor + Webflow. Biblioteca à esquerda (Elementos, Blocos, Camadas, Biblioteca, Assets), canvas no centro, propriedades à direita (Conteúdo, Estilo, Layout, Avançado, Responsivo).
- 3 telas lado a lado (Desktop 1440, Tablet 768, Mobile 390): o que você muda numa tela vale só para ela; réguas, guias, encaixe, desfazer/refazer, várias páginas, autosave e versões (restaurar, duplicar, comparar, aprovada).
- Design System do projeto (cores, tipografia, espaçamento, raios, sombras), componentes globais, biblioteca própria, 15 blocos e 4 modelos prontos que usam briefing, ICP, oferta, logo, cores e fontes do projeto. Comandos ✨ de IA.
- Exporta JSON, HTML, CSS, ZIP e **Elementor (somente widgets gratuitos)**; importa Elementor, HTML e JSON da Mesa.
- **Modo livre (como no Canva):** arraste qualquer elemento para onde quiser (ele sai do fluxo e fica solto); Alt+arrastar reordena no layout; botão ✋ Livre liga/desliga. Setas movem 1 px (Shift = 10 px).
- **Desenhar (✏️):** caneta, pincel, marca-texto e borracha, 8 cores + cor livre, tamanho ajustável; o desenho vira uma camada da página, sai no HTML/CSS exportado (SVG) e entra no Elementor como bloco HTML. Desfazer/refazer guardam 80 passos.
- **Auto layout (como no Figma):** Horizontal/Vertical/Quebra/Grade, alinhamento 3×3, espaço e padding, filhos Ajustar/Preencher/Fixa, **Shift+A**, e **Adaptar Tablet e Celular** (no contêiner ou na página inteira): arruma no Desktop e o Studio ajusta as outras telas.
- **Texto:** aumentar/diminuir a letra arrastando o canto; barra por palavra com fonte, tamanho, cor, destaque e efeitos (também em títulos); fonte e efeitos do texto inteiro (sombra, contorno, neon, brilho, gradiente).
- **Ferramentas do Estúdio de Design na Mesa:** transparência, rotação, mesclagem, Frente/Trás, formas e recortes, gradiente rápido, tratamentos e ajustes de foto, banco de imagens e geração por IA. **Alt+arrastar duplica.**
- **Imagem com IA na Mesa:** na imagem, *✨ Gerar com IA*: descreva digitando, **falando (🎤)** ou **colando** um prompt; ✨ melhorar o prompt; 📋 copiar o prompt; até 4 **imagens de referência** (ou a imagem atual) para variar/editar; proporção automática; vários resultados na tela com *Usar aqui* e *↻ Variar*. Tudo vai para a Biblioteca.
- **Escolha da IA e do nível** (Configurações → *Escolha da IA*, e também na ✨ IA da Mesa e no modal de imagem): texto com Claude ou GPT e o modelo (rápido/equilibrado/mais inteligente); imagem com GPT Image ou Magnific, modelo e qualidade. O servidor só aceita modelos da lista dele (`api/models.php`, ajustável no `config.php`).
- Correção: janelas do Studio (escolher imagem, fontes, etc.) abriam por trás da Mesa.
- **Banco de temas (templates de site):** na Mesa, *🎁 Subir tema* (também na aba Biblioteca). Aceita o pacote do Envato inteiro (com ZIPs dentro), site em **HTML**, tema do **WordPress** (cores e fontes do `theme.json`/`style.css`, páginas do XML de demonstração), **kit do Elementor** e JSON/XML soltos. Vários ZIPs de uma vez viram vários temas. Cada tema guarda páginas, seções reutilizáveis (arraste para a página), imagens e a identidade (cores e fontes, com *Aplicar* e volta em Versões). Scripts e rastreadores são removidos.
- **Kits do Envato (Elementor):** o Studio lê o `manifest.json` do kit: páginas viram páginas, blocos (cabeçalho, rodapé, serviços, depoimentos…) viram seções reutilizáveis, com **miniaturas** (as capturas de tela do kit) e as cores e fontes globais do kit. A leitura do Elementor foi refeita: cores e tipografia globais, fundos com imagem/degradê/sobreposição, bordas, sombras, larguras, itens lado a lado, itens posicionados, formulários, preços, depoimentos, contadores; widgets sem equivalente são listados em vez de virar texto de aviso.
- **Sites em HTML/PHP:** colunas e grades do tema continuam lado a lado (larguras em %), itens fixos/preloaders e imagens externas são ignorados, imagens e CSS locais do ZIP são embutidos. Testado com pacotes reais (Lawfinity, Legalt, Landspire, The Landshaper) e kits (Gloas, Lawrist, Litera, Verdea, Novely, Myrra).
- Módulo isolado: Landings antigas continuam como estavam.

## 1.5.0
## 1.5.0
- **Documento do projeto (briefing completo).** Em *Projetos → 📄 Subir documento do projeto* (e na aba Pré-projeto) você sobe um arquivo Word (.docx), PDF, texto, Markdown, HTML, RTF, CSV ou JSON, ou cola o texto. O Studio reconhece empresa, produtos e serviços, públicos (ICP), dores, dúvidas, desejos, urgências ocultas, objetivo, canais, orçamento, concorrentes, tom de voz, vocabulário, regras, posicionamento, visual e cores. Com a IA ligada ela extrai; sem IA, um leitor de seções faz o trabalho. Mostra o que entendeu antes de aplicar.
- **Nada se perde.** Só completa campos vazios e acrescenta o que falta (produtos e públicos com o mesmo nome são completados, não duplicados). Subir o mesmo documento de novo não repete nada. Campanhas que já existem ganham as linhas novas nos bancos de dores, dúvidas, desejos e urgências; as peças prontas não mudam.
- **Tudo ligado ao projeto.** Campanhas, Stories, roteiros de vídeo, carrosséis, Motor de Ofertas e a IA passam a puxar do projeto (público, dores, produtos, documento). Sem público no Pré-projeto, usam o que o briefing diz. Uma faixa no topo de cada tela mostra de onde vêm as informações e avisa quando o projeto está vazio.
- **Logo por peça.** No editor de design, o logo ganhou: escolher qual logo (versão clara, escura, colorida), cor (original, tudo branco, tudo preto), fundo atrás do logo (nenhum, branco, preto, cinza, cor da marca ou outra) e aplicar nos slides da peça, em todas as peças ou "escolher sozinho pelo fundo", com Desfazer. Ao adicionar um logo com vários no Brand Kit, abre a escolha com prévia em fundo claro, escuro e cinza.
- **Página de entrada (landing + login).** `entrar.html` (e `entrar.php` no WordPress, também em `seusite.com/studio/`): apresenta a plataforma e pede o login. Depois de entrar, abre direto em *Projetos*. Com senha ativa e sem login, o Studio leva para essa página; sair também.
- **Atualização com a versão 1.4.1 enviada** (selecionar e excluir em lote, Motor de Ofertas, planilha matriz, Aprovação de Arte) integrada.

## 1.4.1
- **Selecionar e excluir em lote**, com **Desfazer** por 30 segundos: projetos, peças do Estúdio de Design, anúncios de uma campanha (com as 3 medidas), peças da Biblioteca, carrosséis e anúncios do Motor de Ofertas. Botão "☑ Selecionar" em cada lista.
- **Excluir projeto** direto na página Projetos (também pelo modo seleção); a exclusão pelas configurações do projeto passou a oferecer Desfazer.
- Peças que pertencem a uma campanha aparecem como "campanha" no Estúdio de Design e só podem ser apagadas pela campanha, para não deixar anúncios sem arte.

## 1.4.0
- **Motor de Ofertas e Anúncios** (menu *2 · Anúncios → Motor de Ofertas*), a partir do PRD: Projeto → Diagnóstico → 30 conceitos (com nota 0 a 100) → escolha → 30 ângulos → jornada 30 × 5 = 150 células → ofertas → copies → anúncios → plano de testes. Cada etapa é salva no projeto, tem histórico de decisões e pode ser editada e regenerada; quando algo muda, o motor mostra o que ficou desatualizado. Regras de preço, prova e urgência reais aplicadas nos prompts e conferidas por aviso na tela. Exporta documento (.md), células e anúncios (.csv), projeto (.json) e a planilha do "Subir tabela (em lote)".
- **Página Aprovação de Arte** incorporada ao plugin em `app/aprovacao.html` (portal de revisão). Ainda **não está ligada ao Studio**: usa `localStorage` e dados de exemplo. Para uso real, defina `window.AMPLIACAO_APROVACAO = { items: [...], agency: true|false }` antes do script.
- **Projeto consolidado.** Tema, plugin, documentação e a Aprovação de Arte passam a viver numa só árvore (`plugin/`, `tema/`, `docs/`). O pacote de venda é gerado por `build.sh`.
- Licença: versão citada corrigida de 1.0.0 para 1.4.0.

## 1.3.1
- **Botão "Subir tabela" em todo lugar.** No topo do menu lateral ("Subir tabela (em lote)"), no editor de carrosséis (barra de cima e caixa acima das opções), no Estúdio de Design (anúncios), na lista de Carrosséis e na de Campanhas. Um clique abre o seletor de arquivo; ao escolher o .xlsx, o Studio mostra a prévia e cria todos os anúncios e carrosséis de uma vez.
- **Textos dos carrosséis bem mais curtos.** Novos tamanhos padrão (capa título 30–70, subtítulo 40–100, títulos 20–45, parágrafos 70–140, curtos 40–90, fechamento 60–130, assinatura 15–45). Quem nunca mexeu nos tamanhos recebe os novos automaticamente; tamanhos personalizados são mantidos.
- **Regra de escrita nos geradores.** Texto direto, uma ideia por slide e, em cada slide, valor concreto, curiosidade e um gancho para o próximo. Vale para "Gerar capa", "Gerar texto do carrossel" e carrosséis do Agente Editorial.
- Arquivos do Studio agora carregam com número de versão, para o navegador não usar a versão antiga em cache.

## 1.3.0
- **Criar a partir de planilha, dentro das abas.** Carrosséis e Campanhas ganharam o botão "Criar a partir de planilha" (e o menu lateral virou "Criar de planilha").
- **Carrossel por linha:** uma planilha com um carrossel por linha (Slide 1, Slide 1 texto, Slide 2...), de 3 a 20 slides, com Objetivo (Orgânico/Anúncio), Etapa, Proporção, Legenda, Hashtags e, para anúncio, Título, Texto principal, Descrição e Botão.
- **Legendas:** aba LEGENDAS (por código do post ou ID do anúncio) completa a legenda e as hashtags (orgânico) ou o título, texto principal e descrição (anúncio). O formato POSTS + SLIDES também lê a aba LEGENDAS.
- **Independente do projeto:** a planilha pode ir para o projeto aberto ou **criar um projeto novo** só com ela (sem pré-projeto nem briefing).
- **Brand book:** opção "Respeitar o brand book" (logo como avatar, nome do projeto, fonte do título e cor de destaque do Kit de marca) e escolha do estilo. Anúncios ganham "Logo do Kit de marca" (3 medidas). "Aplicar a todos…" aceita o brand book como origem.
- Três matrizes para baixar: anúncios, carrosséis (um por linha) e carrosséis (POSTS + SLIDES + LEGENDAS).

## 1.2.0
- **Planilha matriz no formato das suas planilhas.** O Studio lê direto o arquivo de anúncios (ID, Fase, Ângulo, Headline, Sub-headline, Texto Principal, Descrição) e o de carrosséis (abas POSTS e SLIDES, uma frase por slide). Baixe as matrizes em branco (mesmos cabeçalhos) em *Planilha matriz*. A matriz de posts de imagem única da 1.1.0 foi substituída.
- **Anúncios** guardam ID, Ângulo, Texto Principal e Descrição, editáveis na peça. Fases: Atenção = Atração, Compra = Ação.
- **Carrosséis:** limite por projeto subiu de 100 para 600; lista com busca, filtro por dia e 24 por página; cada slide mostra a referência visual e o termo de busca (com botão do Google Imagens); metadados do planejamento (dia, tema, tipo, tensão) ficam no carrossel.
- **Aparência em lote:** *Aplicar a todos…* copia @, cores, estilo, botão, modelo e proporção de um carrossel para os demais, sem tocar nos textos. *Trocar modelo* ganhou "aplicar a todos". No anúncio, *Aplicar a cor e a imagem desta peça a todas*. Ao importar, dá para copiar a aparência de um carrossel ou campanha já ajustados.
- Reimportar o mesmo arquivo de carrosséis não duplica (mesmo código e título são ignorados).

## 1.1.0
- **Planilha matriz** (menu lateral, logo abaixo de *Mapa do projeto*): o site gera a planilha modelo (.xlsx) com as abas Anúncios, Posts, Carrosséis e Slides dos carrosséis. Você preenche, envia de volta e o Studio cria no projeto aberto as campanhas (anúncios nas 3 medidas), as artes e legendas dos posts e os carrosséis. Prévia com avisos e erros por linha antes de confirmar; nada existente é alterado.

## 1.0.0
- Primeira versão do pacote: tema com instalador guiado, plugin do Studio (app + API + ponte com o WordPress), formulário de leads `[amp_lead_form]` para o Elementor grátis, documentação.
