# Módulo de Criação de Sites e Landing Pages (versão 1.3.1)

Este é **só o módulo de sites** do Ampliação Studio, separado para virar um produto novo.
Ele abre sozinho, no formato do **Estúdio de Sites**: **Início**, **Briefing do cliente**, **Banco de templates**, **Desenvolvimento**, **Referências**, **Mesa de páginas**, **Imagens** e **Configurações**. A página do cliente (formulário de 11 partes) abre em **Briefing → Ver como o cliente vê**.
Não vem nenhum projeto, cliente ou fonte licenciada junto: o app começa vazio.

## Do briefing ao site
0. **Início:** explica a conversa de venda (StoryBrand) que todo site faz e lista os projetos, cada um com a etapa em que está (Briefing, Escolher template, Em edição).
1. **Briefing do cliente:** três jeitos de receber o cliente. (a) **Texto corrido:** cole a conversa, a bio do Instagram ou anotações; o agente preenche o formulário e diz o que ainda falta perguntar. (b) **Formulário completo:** as 11 partes do briefing (empresa, cliente do cliente, produtos e serviços, marca, concorrentes, depoimentos, links, fotos), para você preencher pelo cliente. (c) **Link para o cliente** (`briefing.html`, precisa de servidor PHP): ele preenche no celular e você traz as respostas.
2. **Resumo e criar site:** mostra o que chegou e onde cada dado aparece no site. O botão abre o **Banco de templates**.
3. **Banco de templates:** galeria com busca, filtros e prévia, já com o texto e a cor do cliente. Todo template segue a estrutura **StoryBrand** (o cliente é o herói, a empresa é o guia): promessa, problema, guia, plano em 3 passos, oferta e prazo, prova, objeções, chamada final.
4. **Desenvolvimento:** a página aparece ao lado das ferramentas. Clique em qualquer seção para editar o texto (ou use a lista de seções, que também liga, desliga e reordena). Computador e celular, troca de template sem perder o texto, lista de pendências ([CONFIRMAR]) e o checklist do vendedor consultivo. **Entregar:** HTML da página, ZIP do site, modelo do Elementor e tema/pacote de WordPress. Para mais controle: editor de blocos, editor visual e Mesa de páginas.
5. **Criar site:** o BrandScript e o texto das páginas saem do briefing. O que o cliente não disse fica como **[CONFIRMAR]**; depoimento só entra se estiver marcado como autorizado. Com a IA ligada, dá para reescrever as páginas a partir do BrandScript.

## Referências, mesa de trabalho e seus templates
- **Referências:** suba prints e imagens de layouts que você admira (arraste, escolha ou cole com Ctrl+V). Ficam salvas, com nome, etiquetas e anotação. Na edição, a ferramenta **Referências** abre uma gaveta ao lado da página: **lado a lado** ou **sobreposta** com transparência.
- **Desenvolvimento** tem a mesa de trabalho: barra de opções em cima, ferramentas à esquerda, página no centro e painéis à direita (Propriedades, **Estilo**, **Layout**, Camadas com arrastar, Pendências, Vendedor consultivo e Entrega). **Sortear variação** muda o layout e dá para voltar. A barra de opções tem **Computador, Tablet, Celular e 3 telas**: as três aparecem lado a lado, ao vivo, e o clique em uma seção seleciona nas três. **Ampliar** esconde os painéis para dar mais espaço.
- **Meus templates** (em Banco de templates): suba o ZIP do Envato (kit do Elementor, site em HTML ou tema de WordPress), JSON do Elementor ou HTML. Cada página vira uma página da Mesa de páginas. Pacotes só de fontes não são templates.
- **Exportar** pela Mesa de páginas: HTML, ZIP, **Kit do Elementor (.zip)** e modelo do Elementor (.json), com **animação de entrada** (aparecer, subir, esquerda, zoom). Só widgets e contêineres grátis do Elementor.

## Como usar (3 jeitos)
1. **Só para testar:** abra `index.html` no navegador. Funciona sem servidor (os dados ficam no navegador). A IA e o envio de leads não funcionam assim.
2. **Hospedagem comum (Hostinger etc.):** envie **todo o conteúdo desta pasta** para `public_html` (ou uma subpasta). Precisa de PHP 8 ou mais novo.
3. **Com IA:** copie `api/config.sample.php` para `api/config.php`, crie a senha e cole a chave da IA (ou faça isso em Configurações → Integrações, no primeiro acesso). As chaves ficam só no servidor.

## O que tem dentro
- `index.html`, `js/`, `css/`: o aplicativo (JavaScript puro, sem instalação).
- `api/`: PHP para IA, imagens, senha, salvar no servidor, receber leads (`leads.php`) e contar visitas das páginas (`lp.php`).
- `fonts/manifest.json`: lista de fontes suas (vazia). Para usar fontes próprias, coloque os arquivos em `fonts/`.
- `THIRD_PARTY.md`: licenças dos ícones.

## O que ele faz
Veja o documento **PROJETO-EXECUTIVO** (enviado junto) para a lista completa.

## O que NÃO vem neste módulo
Anúncios, carrosséis, stories, vídeo, aprovação com o cliente, publicação em redes, painel de Performance e CRM. O formulário das páginas já envia os leads ao `api/leads.php`, mas a **tela que mostra os leads** está no Studio completo.

## Limites (ditos com honestidade)
- O Kit do Elementor e as animações exportados **não foram abertos num Elementor de verdade**: o formato segue o dos kits que você enviou (manifest + modelos .json), mas só conferi o arquivo. As imagens dos kits do Envato são links do site de demonstração do autor.
- Os modelos do estúdio têm layouts diferentes entre si (largura, faixas, benefícios, passos, prova, dúvidas, topo), mas todos partem dos mesmos blocos. A variedade maior vem dos templates que você sobe.
- Templates subidos entram na Mesa de páginas com o texto do autor: o texto do briefing ainda não é aplicado neles automaticamente (use os comandos de IA da Mesa).
- O agente de briefing e a reescrita das páginas com IA foram testados só com respostas simuladas. Sem IA ligada, o agente lê apenas linhas com rótulo (Nome:, Cidade:), telefone, e-mail, @ e links, e o texto das páginas sai de regras simples.
- Os 19 templates do banco são estilos próprios (cores, fontes, cantos, layout do topo) sobre as 4 estruturas StoryBrand. Ainda não passaram por uma revisão de design com páginas reais de clientes.
- O link do cliente e a Mesa de páginas dependem do servidor PHP; nada disso foi aberto num WordPress real.
- As partes com IA foram testadas só com respostas simuladas, não com chave real.
- O tema de WordPress e os modelos do Elementor foram conferidos por arquivo (estrutura, PHP sem erro, instalação simulada). **Não foram abertos num WordPress com Elementor de verdade.**
- Templates de terceiros (ex.: Envato) **não** vêm no pacote. Cada cliente importa o dele, com a licença dele.
- A medição de visitas (`lp.php`) só funciona no servidor.

## Ligando as páginas (aba Fluxo)
No Desenvolvimento, aba **Fluxo** (painel da direita): menu do site, para onde cada botão leva, página de obrigado e um verificador de links.
- **Ligar tudo automaticamente**: monta o menu, leva os botões ao formulário (ou ao WhatsApp) e o formulário à página de obrigado. Todo site novo já nasce assim.
- **Modelo: landing page + obrigado**: sem menu, botões levam ao formulário. **Modelo: site institucional**: Início, Serviços, Sobre e Contato ligados.
- Cada seção tem "Para onde o botão leva" (aba Propriedades). Os links são guardados por página: se você trocar nome, ordem ou endereço, continuam certos.
- Na **Mesa de páginas**: botão **Links** (mapa, links quebrados, páginas soltas), campo de link com a lista das páginas e "Montar o menu com as páginas".
