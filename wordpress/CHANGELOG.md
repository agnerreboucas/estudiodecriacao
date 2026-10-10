# Histórico de versões

## 1.6.0
- **Mesa de páginas** (menu *Mesa de páginas*): editor visual de sites/landings no estilo Figma + Elementor + Webflow. Biblioteca à esquerda (Elementos, Blocos, Camadas, Biblioteca, Assets), canvas no centro, propriedades à direita (Conteúdo, Estilo, Layout, Avançado, Responsivo).
- 3 telas lado a lado (Desktop 1440, Tablet 768, Mobile 390): o que você muda numa tela vale só para ela; réguas, guias, encaixe, desfazer/refazer, várias páginas, autosave e versões (restaurar, duplicar, comparar, aprovada).
- Design System do projeto (cores, tipografia, espaçamento, raios, sombras), componentes globais, biblioteca própria, 15 blocos e 4 modelos prontos que usam briefing, ICP, oferta, logo, cores e fontes do projeto. Comandos ✨ de IA.
- Exporta JSON, HTML, CSS, ZIP e **Elementor (somente widgets gratuitos)**; importa Elementor, HTML e JSON da Mesa.
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
