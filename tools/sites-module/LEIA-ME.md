# Módulo de Criação de Sites e Landing Pages (versão 1.1.0)

Este é **só o módulo de sites** do Ampliação Studio, separado para virar um produto novo.
Ele abre sozinho, com 7 telas: **Projetos**, **Briefing do cliente**, **Banco de templates**, **Sites e landing pages**, **Mesa de páginas**, **Imagens** e **Configurações**.
Não vem nenhum projeto, cliente ou fonte licenciada junto: o app começa vazio.

## Do briefing ao site (novo na 1.1.0)
1. **Briefing do cliente:** três jeitos de receber o cliente. (a) **Texto corrido:** cole a conversa, a bio do Instagram ou anotações; o agente preenche o formulário e diz o que ainda falta perguntar. (b) **Formulário completo:** as 11 partes do briefing (empresa, cliente do cliente, produtos e serviços, marca, concorrentes, depoimentos, links, fotos), para você preencher pelo cliente. (c) **Link para o cliente** (`briefing.html`, precisa de servidor PHP): ele preenche no celular e você traz as respostas.
2. **Resumo e criar site:** mostra o que chegou e onde cada dado aparece no site. O botão abre o **Banco de templates**.
3. **Banco de templates:** galeria com busca, filtros e prévia, já com o texto e a cor do cliente. Todo template segue a estrutura **StoryBrand** (o cliente é o herói, a empresa é o guia): promessa, problema, guia, plano em 3 passos, oferta e prazo, prova, objeções, chamada final.
4. **Criar site:** o BrandScript e o texto das páginas saem do briefing. O que o cliente não disse fica como **[CONFIRMAR]**; depoimento só entra se estiver marcado como autorizado. Com a IA ligada, dá para reescrever as páginas a partir do BrandScript.

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
- O agente de briefing e a reescrita das páginas com IA foram testados só com respostas simuladas. Sem IA ligada, o agente lê apenas linhas com rótulo (Nome:, Cidade:), telefone, e-mail, @ e links, e o texto das páginas sai de regras simples.
- Os 19 templates do banco são estilos próprios (cores, fontes, cantos, layout do topo) sobre as 4 estruturas StoryBrand. Ainda não passaram por uma revisão de design com páginas reais de clientes.
- O link do cliente e a Mesa de páginas dependem do servidor PHP; nada disso foi aberto num WordPress real.
- As partes com IA foram testadas só com respostas simuladas, não com chave real.
- O tema de WordPress e os modelos do Elementor foram conferidos por arquivo (estrutura, PHP sem erro, instalação simulada). **Não foram abertos num WordPress com Elementor de verdade.**
- Templates de terceiros (ex.: Envato) **não** vêm no pacote. Cada cliente importa o dele, com a licença dele.
- A medição de visitas (`lp.php`) só funciona no servidor.
