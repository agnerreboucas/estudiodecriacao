# Ampliação Studio

Sistema de inteligência e produção de marketing orientado por projetos: **Briefing → Diagnóstico → Hipóteses → Pré-Projeto → Validação → Posicionamento → Estratégia → Jornada → Comunicação → Produção → Publicação → Resultados → Aprendizado.**

Documentos de referência em `docs/` (PRD, Guia de Estilo e o protótipo original v3).

## O que já funciona
- **Novo projeto (assistente):** briefing escrito, em **áudio** (grava, guarda o original e transcreve no Chrome) ou **entrevista guiada**; o Studio extrai oferta, público, problema e objetivo, sugere os desafios, aponta lacunas críticas e cria o projeto estruturado (Context ID, briefing original preservado, Pré-Projeto, Brand Brain e Voice Brain).
- **Radar de concorrentes:** lê uma página pública (título, textos, CTAs, fontes e cores), monta a análise (por IA ou preenchida da leitura) e envia hooks e ângulos do mercado para a Matriz. Serve de referência: as peças geradas devem ser originais. A leitura roda no servidor com proteção contra acesso a endereços internos.
- **Dossiê do concorrente:** Google Meu Negócio (busca pela API oficial do Google Places ou manual: endereço, telefone, nota, avaliações, horário), Instagram (registro manual + atalho do perfil) e anúncios observados, com atalhos para a Biblioteca de Anúncios da Meta e a Central de Transparência do Google. Os hooks dos anúncios observados vão para a Matriz.
- **Estúdio de Design:** 30 estilos de design × 30 pares de fontes × 30 estilos de fotografia, cruzados por público e tom. Gera o carrossel e abre num editor de canvas (arrastar, redimensionar, destaque por palavra, foto com tratamento, desfazer). Salva o **estilo de campanha** e aplica a todas as peças. Exporta PNG e ZIP. Fontes via Google Fonts (precisa de internet).
- **Fábrica de variações (lógica do Icon):** pega um anúncio (uma peça do Estúdio ou do zero) e gera até 100 variações combinando textos soltos (headlines, apoios, CTAs) × estilos × layouts, com diversidade garantida. Cada variação vira peça editável, PNG, PSD ou ZIP, ou vai para a Aprovação. O desempenho real (CPL por estilo, fonte, foto e CTA) volta como peso e reordena as próximas levas.
- **Exportação em camadas:** PSD (uma camada raster por elemento, RLE, validado com `psd-tools`) e ZIP de PNGs por camada com manifesto. O texto vai como camada raster (não editável como texto no Photoshop).
- **Fluxo do projeto** do briefing ao aprendizado, com os gates, na visão geral.
- **Projetos** com Context ID, marca (Brand Brain), Voice Brain, assets e tudo ligado ao projeto.
- **Pré-Projeto (Journey Architect):** desafios → hipóteses editáveis (DADO/HIPÓTESE) → cruzamento → diagnóstico → justificativa → objetivo → OKR (tração e estruturação) → até 3 ICPs → jornada de 5 etapas → checklist de validação → estados Rascunho / Em revisão / Ajustes / Aprovado. Editar um pré-projeto aprovado o reabre (nenhum gate passa em silêncio). Rastreabilidade DESAFIO-00N → HIP-00N. Apresentação editorial e PDF gerados do projeto.
- **Gate de Posicionamento** depois da aprovação.
- **Matriz de Criação** (hooks, ângulos, formatos, CTAs, direção) com funil 100 → 30 → 12 → 6 e envio para produção.
- **Video Lab:** cenas por duração, direção por cena, fluxo de 11 etapas com aprovações reais, estimativa de créditos (simulação) e exportação do storyboard.
- **Aprovação, Campanhas, Publicação** (só criações aprovadas), **Landing Pages** exportáveis em HTML com formulário que envia o lead ao seu servidor.
- **Performance & Learning:** métricas reais (manual ou Meta Ads), CPL/CTR/CAC e **pesos aprendidos** que reordenam novos conceitos.
- **Dados:** salvos no navegador, exportação/importação em JSON, sincronização opcional com o servidor.
- **IA (Claude)** opcional: refinar hipóteses, diagnóstico, ICPs, jornada, roteiros e copy. Sempre produz texto editável marcado como hipótese/recomendação.

Sem números inventados: o que não tem dado aparece como "—".

## Estrutura
    index.html        casca da aplicação
    css/              base, journey, architecture, studio
    js/               util, store, integrations, core, wizard, preproject, present, radar, design-data, design-engine, design-psd, design-ui, design-var, project, hubs, app
    api/              PHP (login, workspace, ai, webhook, leads, meta, status)
    docs/             PRD, guia de estilo, protótipo original

## Demonstração (arquivo único)
`demo/ampliacao-studio-demo.html` abre com duplo clique, com dados fictícios, sem servidor. Para regenerar depois de mudar o código: `python3 tools/build_demo.py`. Os dados fictícios ficam em `demo/demo.js`.

## Rodar localmente
Só o front (modo local, sem login nem IA):

    python3 -m http.server 8080

Front + API (precisa de PHP 8+):

    cp api/config.sample.php api/config.php   # preencha
    php -S localhost:8080

## Publicar na Hostinger
1. No hPanel: **Sites → Gerenciador de Arquivos** (ou FTP) → pasta `public_html`.
2. Envie `index.html`, `css/`, `js/`, `api/` e `.htaccess` (não precisa de `docs/`).
3. Copie `api/config.sample.php` para `api/config.php` e preencha:
   - `ADMIN_PASSWORD_HASH` (ou `ADMIN_PASSWORD`): sem isso **o app fica aberto a qualquer visitante**.
   - `ANTHROPIC_API_KEY` para a IA; `LEADS_TOKEN` para captura de leads; `WEBHOOK_URL` (https) para n8n/Make; `META_*` para métricas do Meta Ads.
   - Se possível, `DATA_DIR` apontando para uma pasta **fora** de `public_html`.
4. Abra o site, clique em **● Entrar** e informe a senha. Em **Configurações → Integrações** cada conexão mostra o status real.
5. Ative HTTPS (SSL grátis no hPanel). O `.htaccess` já comprime e faz cache.

### Captura de leads
Formulários e landing pages exportadas enviam `POST` JSON para `https://SEUSITE/api/leads.php?token=LEADS_TOKEN&project=ID_DO_PROJETO` (campos `name`, `phone`, `email`, `message`, `utm_*`). O webhook do WhatsApp Cloud aponta para o mesmo endereço (use `WHATSAPP_VERIFY_TOKEN` e `META_APP_SECRET`). Os leads aparecem em Performance.

## Segurança
- Chaves só em `api/config.php` (ignorado pelo Git; bloqueado por `.htaccess`).
- Login com sessão `HttpOnly`/`SameSite=Strict`, limite de tentativas, limite de chamadas de IA por hora, escritas exigem `Content-Type: application/json`.
- Todo texto do usuário é escapado na interface e nas exportações; importação de JSON é sanitizada.
- O token de leads é público por natureza (fica no formulário): ele só permite **gravar** leads, com honeypot e limite por IP.

## Limites conhecidos
- Publicação direta em Instagram/Facebook e Google Analytics exigem OAuth: planejado. Hoje a publicação é preparada aqui e disparada via webhook ou manualmente.
- Geração de vídeo/imagem precisa de um provedor conectado (não configurado); o Video Lab entrega roteiro, storyboard e estimativa.
- `api/meta.php` segue a documentação da Graph API, mas **não foi validado com uma conta real**.
- Sincronização é "último a gravar, com checagem de versão": dois dispositivos editando ao mesmo tempo pedem confirmação, sem merge automático.
- Assets são registrados por link (sem upload ainda).
- O Estúdio de Design ainda não gera imagem: as áreas de foto são espaços com a direção de arte (você envia a foto, e o tratamento é aplicado). A geração por IA depende de um provedor de imagem.
- **Imagens (OpenAI):** com `OPENAI_API_KEY` em `api/config.php`, o editor ganha "✦ Gerar com IA" nas áreas de foto; se já houver uma foto (ex.: do produto), ela vai como referência (endpoint de edição) para preservar o item. Há limite por hora/dia (`IMAGE_CALLS_PER_HOUR/DAY`) como trava de custo. Modelo e qualidade configuráveis; confira nomes e preços na documentação da OpenAI. Testado só com um servidor OpenAI simulado, não com a conta real.
- O Google Meu Negócio exige chave do Google Places (a busca é paga acima da cota gratuita). Instagram e anúncios de terceiros não têm leitura automática permitida.
