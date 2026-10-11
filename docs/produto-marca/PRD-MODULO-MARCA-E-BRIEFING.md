# PRD · Módulo de Marca e Briefing do Cliente

**Produto:** Estúdio de Marca e Briefing do Cliente (nome provisório)
**Versão do documento:** 1.0
**Parte de:** produto de criação de sites e landing pages
**Estado do código:** o módulo já existe e roda (versão 1.0.0 do pacote, baseada no Ampliação Studio 1.16). Este PRD descreve o que ele é, o que já está pronto e o que falta para entrar no produto de sites.

> **Como ler os status:** **Pronto** = existe e foi testado em navegador com servidor PHP. **Parcial** = existe, mas com limite dito na linha. **Novo** = proposta, ainda não foi construída.

---

## 1. Resumo

O site de um cliente só fica bom se a gente souber **quem ele é, o que vende e como fala**. Hoje isso chega por conversa solta, áudio e arquivo perdido. Este módulo transforma essa coleta em um fluxo único:

1. O consultor cria o cliente e manda **um link**.
2. O cliente informa o nome da marca e da empresa, cadastra **produtos e serviços**, passa pela **construção da marca** (valores, atitudes, tom de voz e arquétipo explicado), envia **fotos** e **links** (site, vídeos, redes, materiais).
3. Tudo fica salvo em três formatos: **no projeto**, **em planilha** e **na nuvem** (o link guarda no servidor).
4. O resultado vira o **briefing do projeto de site**: o módulo de Sites usa os mesmos dados para escrever e montar as páginas, sem inventar fatos.

## 2. Problema

| Dor hoje | Consequência |
|---|---|
| Informação do cliente vem em pedaços (WhatsApp, áudio, e-mail) | O site começa com lacunas e retrabalho |
| Cliente não sabe descrever a própria marca | Texto genérico, sem personalidade |
| Fotos e links chegam sem organização | Tempo perdido procurando material |
| Preço, prazo, garantia e provas faltam | Risco de a página prometer o que o cliente não cumpre |
| Cada cliente responde de um jeito | Impossível padronizar o trabalho da agência |

## 3. Objetivos e não-objetivos

**Objetivos**
- O1. Coletar, **num só link**, tudo o que o projeto de site precisa.
- O2. Ajudar o cliente a **entender e definir a personalidade da marca** sem conhecer o jargão.
- O3. Guardar as respostas de forma **estruturada** (para a IA e para o módulo de Sites) e **portátil** (planilha, projeto, nuvem).
- O4. Nunca usar dado que o cliente não informou: o que falta fica marcado, não é inventado.

**Não-objetivos da v1**
- Gerar o site (isso é o módulo de Sites).
- Anúncios, redes sociais, vídeo, aprovação e publicação.
- Contas de usuário, cobrança e planos.
- Edição colaborativa em tempo real.

**Como saberemos que deu certo** (metas **[DEFINIR]**, não levantei números de mercado):
- % de links enviados que chegam a "enviado" pelo cliente
- tempo médio entre enviar o link e receber o briefing completo
- % de briefings com produtos, marca, pelo menos 1 link e pelo menos 3 fotos
- nº de campos que o consultor precisa corrigir à mão depois de importar

## 4. Usuários

| Usuário | Quem é | O que precisa |
|---|---|---|
| **Consultor / agência** | Quem vai fazer o site e a marca | Criar o cliente, mandar o link, acompanhar, importar, exportar para o site |
| **Cliente final** | Dono ou gestor da empresa; pouco técnico; usa celular | Responder sem se perder, salvar e voltar depois, entender o que está sendo perguntado |

## 5. Jornada

### Consultor
1. Cria o **cliente** (nome da empresa).
2. Em **Briefing do cliente**, clica em criar link e envia (copiar ou WhatsApp).
3. Acompanha o status (aguardando, em andamento, enviado).
4. Clica em **Importar respostas**.
5. Em **Marca e arquétipo**, revisa com o cliente; pode enviar um link só da marca.
6. Em **Resumo para o site**, baixa o briefing (.md) ou **exporta o projeto (.json)** para o módulo de Sites.

### Cliente (nesta ordem)
1. **Quem está respondendo** (nome, WhatsApp, e-mail).
2. **Sobre a empresa**: nome da marca e da empresa, site, Instagram e redes, cidade, história, diferenciais.
3. **O cliente do cliente** (público).
4. **Produtos e serviços** (um cartão por item, até 8).
5. **Construção da marca**: valores, atitudes, tom de voz, resultado do arquétipo (com explicação), palavras que usa e que nunca usa.
6. **Concorrentes** e **referências** (o que admira, o que evitar).
7. **Marketing e vendas hoje.**
8. **Depoimentos** (com marcação de autorização).
9. **Links**: logo, fotos, **vídeos**, manual de marca, materiais já feitos, site antigo.
10. **Fotos e arquivos**: logo, fotos da empresa, fotos de produtos, materiais, prints de depoimentos.
11. Aceite de uso das informações e **Enviar**.

Tudo salva sozinho a cada alteração; o cliente pode fechar e voltar pelo mesmo link.

## 6. Escopo da v1

**Inclui:** cliente/projeto, link de briefing, formulário completo, formulário só da marca, marca com arquétipo explicado, produtos e serviços, links, fotos, depoimentos, importação para o projeto, planilha, resumo e exportação para o site, biblioteca de imagens, configurações de e-mail de aviso e IA.

**Não inclui:** módulo de Sites, anúncios, redes sociais, publicação, performance, CRM, contas e cobrança.

## 7. Requisitos funcionais

### A. Cliente e projeto
| ID | Requisito | Status |
|---|---|---|
| RF-A1 | Criar, listar e abrir clientes (projetos) | Pronto |
| RF-A2 | Dados guardados no navegador e, com servidor, sincronizados | Pronto |
| RF-A3 | Exportar o projeto (.json) e importar em outro módulo | Pronto (testado Marca → Sites) |

### B. Briefing do cliente (link)
| ID | Requisito | Status |
|---|---|---|
| RF-B1 | Criar link com código aleatório de 24 caracteres, ligado ao projeto | Pronto |
| RF-B2 | Copiar o link e enviar por WhatsApp | Pronto |
| RF-B3 | Cliente responde pelo celular, salvamento automático, volta pelo mesmo link | Pronto |
| RF-B4 | 11 partes, na ordem do fluxo (produtos antes da marca) | Pronto |
| RF-B5 | Barra de progresso e parte "preenchida" | Pronto |
| RF-B6 | Obrigatórios no envio: nome da empresa, nome e WhatsApp de quem responde, 1 produto ou serviço, aceite | Pronto |
| RF-B7 | Cliente pode reenviar depois de editar | Pronto |
| RF-B8 | Desativar o link | Pronto |
| RF-B9 | Aviso por e-mail ao consultor quando o cliente envia | Parcial (depende do servidor; **não testado com e-mail real**) |
| RF-B10 | Lembrete automático ao cliente que não terminou | Novo |
| RF-B11 | Perguntas e partes configuráveis por tipo de projeto | Novo |

### C. Empresa, produtos e serviços
| ID | Requisito | Status |
|---|---|---|
| RF-C1 | Nome da marca/empresa, razão social, site, Instagram, outras redes, cidade, tempo, equipe, história, missão, diferenciais | Pronto |
| RF-C2 | Até 8 produtos/serviços com 26 campos: tipo, o que é, para quem, como funciona, incluso, preço, prazo, diferencial, perguntas, provas, objeções, formato, duração, peso, tamanho, entrega, validade, garantia, pagamento, para quem não serve, problemas, tempo para resolver, link de fotos, ação desejada, link de compra | Pronto |
| RF-C3 | Importar os produtos para o projeto sem duplicar | Pronto |
| RF-C4 | Medidor de ficha completa por produto | Pronto |

### D. Construção da marca
| ID | Requisito | Status |
|---|---|---|
| RF-D1 | Escolher valores (44 opções) e atitudes (30 opções), com campo "outro" | Pronto |
| RF-D2 | Tom de voz em 5 escalas (formal, humor, técnico, calor, ousadia) | Pronto |
| RF-D3 | Resultado: arquétipo **principal, secundário e terciário** (12 arquétipos), com % de afinidade; o usuário pode trocar | Pronto |
| RF-D4 | Explicação em português simples: o que é arquétipo e o papel de cada um dos três | Pronto |
| RF-D5 | Cartão por arquétipo: quem é, características, atitudes, deseja/teme, como se comunica (com frases de exemplo), palavras que usa e evita, **como influencia o trabalho** | Pronto |
| RF-D6 | Voz e palavras: o que fala/não fala, atitudes que tem/não tem, admira/repudia, palavras que usa e **proibidas** | Pronto |
| RF-D7 | **Marcas parecidas clicáveis**: site, Instagram, campanhas, anúncios (Biblioteca de Anúncios da Meta) | Parcial (os links abrem buscas, não páginas verificadas; o módulo não lê os sites) |
| RF-D8 | **Guia dos 12 arquétipos (PDF)** e **Relatório da marca (PDF)** | Pronto |
| RF-D9 | Enviar para o Voice Brain (personalidade, vocabulário, proibidas, regras) | Pronto |
| RF-D10 | Análise de comunicação de uma marca por IA a partir do site dela | Novo |
| RF-D11 | Escolha de paleta e fontes a partir do logo enviado | Novo |

### E. Formulário só da Marca (opcional)
| ID | Requisito | Status |
|---|---|---|
| RF-E1 | Link separado só com valores, atitudes, tom, arquétipo, voz e marcas admiradas | Pronto |
| RF-E2 | Resultado ao vivo para o cliente, com explicações | Pronto |
| RF-E3 | Cliente baixa **sua própria planilha** (.xlsx) e **seu relatório (PDF)** | Pronto |

### F. Três formatos de saída
| ID | Requisito | Status |
|---|---|---|
| RF-F1 | **Projeto:** importar as respostas para o projeto do cliente | Pronto |
| RF-F2 | **Planilha:** baixar .xlsx e CSV, em branco ou preenchida; importar de volta pela coluna "Chave" | Pronto |
| RF-F3 | **Nuvem:** respostas guardadas no servidor, ligadas ao link, mesmo com a página fechada | Pronto |
| RF-F4 | Guia de arquétipos dentro da própria planilha | Pronto |
| RF-F5 | Histórico de versões das respostas | Novo |

### G. Links, fotos e depoimentos
| ID | Requisito | Status |
|---|---|---|
| RF-G1 | Links: site, Instagram, outras redes, logo, fotos, **vídeos**, manual de marca, materiais já feitos | Pronto |
| RF-G2 | Link por produto (compra/agendamento) e link de fotos por produto | Pronto |
| RF-G3 | **Upload de fotos e PDF** em 5 categorias (logo, fotos da empresa, fotos de produtos, materiais, prints de depoimentos); imagem até 4 MB, PDF até 6 MB, até 60 arquivos; conferidos pelo conteúdo | Pronto |
| RF-G4 | Fotos importadas vão para a Biblioteca de imagens | Parcial (importação testada com imagem mínima; **não testada com fotos reais grandes**) |
| RF-G5 | Depoimentos com autorização (sim, falta pedir, não pode usar); só os autorizados vão para a IA | Pronto |
| RF-G6 | Upload de **vídeo** | Novo (hoje só por link) |
| RF-G7 | Upload de fotos **por produto** (hoje é por categoria + link por produto) | Novo |
| RF-G8 | Ler o conteúdo dos links (site, Instagram) e resumir | Novo |

### H. Resumo e exportação para o site
| ID | Requisito | Status |
|---|---|---|
| RF-H1 | **Resumo para o site** na tela, com contagem de produtos, marca, links, depoimentos e arquivos | Pronto |
| RF-H2 | Baixar briefing em Markdown | Pronto |
| RF-H3 | Exportar o projeto (.json) e **importar no módulo de Sites** | Pronto (testado) |
| RF-H4 | Botão "Criar site com este briefing" dentro do módulo de Sites (cria o site e as páginas já preenchidas) | **Novo** (hoje o consultor importa o projeto e cria o site) |

## 8. Como o briefing alimenta o site

| Dado do briefing | Onde aparece no site |
|---|---|
| Nome da marca/empresa | Cabeçalho, título, rodapé, textos |
| Produtos e serviços (nome, o que é, para quem, preço, link) | Páginas de serviços e landing pages por produto; botões e links de compra |
| Benefícios, objeções, provas | Blocos da página (benefícios, perguntas frequentes, prova) |
| Preço, prazo, garantia **ausentes** | Aparecem como **[CONFIRMAR]**, nunca inventados |
| Valores, atitudes, arquétipo, tom, palavras que usa e proibidas | Tom dos textos escritos pela IA e lista de palavras proibidas |
| Depoimentos **autorizados** | Prova social |
| Fotos e logo | Biblioteca de imagens, que alimenta as páginas |
| Links (site antigo, redes, vídeos, materiais) | Rodapé, redes, referências de conteúdo |
| Cores e manual de marca (texto) | Estilo da página (ajuste manual hoje) |
| Concorrentes e diferenciais | Argumentos e SEO (uso manual hoje) |

**Contrato de dados:** os dois módulos usam o mesmo esquema de projeto (versão de esquema 1). Cada projeto leva: `brief`, `products[]`, `identity`, `intake` (links, depoimentos, arquivos), `voice`, `brand`, `competitors[]`. Quando os módulos forem unidos num só produto, o briefing já estará no projeto e o botão RF-H4 deve ler esses campos diretamente.

## 9. Requisitos não funcionais

- **Segurança:** código do link aleatório; limite de acessos e de tentativas por endereço; escritas só em JSON; respostas limpas e com tamanho limitado antes de salvar; arquivos validados pelo **conteúdo** (não pelo nome); chaves de API **só no servidor**; pasta de dados fora do alcance da web.
- **Privacidade:** o cliente aceita o uso das informações antes de enviar; depoimentos só com autorização. **Política de privacidade, prazo de guarda e pedido de exclusão: [DEFINIR]** (são dados de terceiros guardados no servidor do consultor).
- **Mobile primeiro:** formulário pensado para celular.
- **Hospedagem comum:** PHP 8+, sem banco de dados (arquivos JSON).
- **Confiabilidade:** salvamento automático; se a conexão cair, o texto continua na tela e o aviso aparece.
- **Leveza:** JavaScript puro, sem framework e sem instalação.
- **Honestidade dos dados:** o que o cliente não preencheu continua em branco.

## 10. Dados e API (resumo técnico)

**No servidor** (`api/data/briefings/<código>.json` + pasta de arquivos): `t`, `kind` (`briefing` ou `marca`), `project`, `name`, `status` (`rascunho`, `enviado`), `answers`, datas, `revoked`.

**Respostas (`answers`)** por seção: `contato`, `empresa`, `publico`, `produtos[]`, `identidade`, `concorrencia[]`, `referencias`, `marketing`, `depoimentos[]`, `materiais`, `arquivos[]`, `aceite`.

**`api/briefing.php`:**
- Público (só com o código): `GET ?t=` ler; `save`, `submit`, `upload`, `rmfile`.
- Consultor (com login): `create` (com `kind`), `get`, `list`, `revoke`.

**Planilha da Marca:** abas *Como preencher*, *Marca* (Seção, Pergunta, Sua resposta, **Chave**), *Opções*, *Guia dos arquétipos*, *Resultado*. A coluna Chave é o que permite importar de volta.

## 11. O que já foi testado e o que não foi

**Testado (navegador + servidor PHP):**
- criar cliente, criar link, cliente preencher, enviar foto, enviar, importar respostas
- ordem das partes (produtos antes da marca)
- marca: papéis principal/secundário/terciário, marcas clicáveis, PDFs
- planilha .xlsx e CSV: baixar e importar de volta (Studio e cliente)
- exportar projeto do módulo de Marca e importar no módulo de Sites
- recarregar a página e os dados continuam

**Não testado:**
- e-mail de aviso e envio para planilha do Google com serviço real
- IA (só com respostas simuladas)
- fotos reais grandes e muitos arquivos
- instalação num WordPress de verdade
- acessibilidade com leitor de tela e testes com clientes reais

## 12. Riscos

| Risco | Mitigação |
|---|---|
| Formulário longo e o cliente desiste | Salvar sozinho; partes curtas; opção de link só da marca; lembrete (RF-B10) |
| Cliente envia dado errado ou promete o que não cumpre | Importar não apaga o que já existe; [CONFIRMAR] no que falta; revisão do consultor antes de gerar o site |
| Dados pessoais de terceiros no servidor | Aceite, depoimentos com autorização, política e prazo de guarda a definir |
| Textos de arquétipo vistos como "verdade" | Aviso na tela: são interpretações, não regra |
| Links das marcas levarem à página errada | São buscas; o módulo avisa e não lê os sites |
| Spam em link público | Código aleatório, limite de acessos, possibilidade de desativar |

## 13. Critérios de aceite da v1

1. O consultor cria o cliente e o link em até 3 cliques e consegue copiar ou mandar por WhatsApp.
2. O cliente preenche no celular, fecha a página, reabre o mesmo link e encontra o que escreveu.
3. A ordem das partes é: quem responde, empresa, público, **produtos e serviços**, **marca**, concorrentes, referências, marketing, depoimentos, links, fotos.
4. O cliente envia uma foto (JPG, PNG ou WebP) e um PDF; arquivos inválidos são recusados com mensagem clara.
5. O envio só é aceito com nome da empresa, nome e WhatsApp, um produto e o aceite.
6. Depois de **Importar respostas**, produtos, links, depoimentos, fotos e marca aparecem no projeto e nada que já estava preenchido é apagado.
7. A marca mostra principal, secundário e terciário com explicação, e cada marca citada abre os 4 atalhos.
8. A planilha baixada, preenchida e importada de volta reproduz as respostas.
9. **Resumo para o site** lista produtos, marca, links, depoimentos e arquivos, e o projeto exportado abre no módulo de Sites com produtos e marca.
10. Nenhum campo em branco é preenchido pelo sistema com dado inventado.

## 14. Roadmap sugerido

| Fase | Entrega |
|---|---|
| **0. Validar** | Testar com 3 clientes reais; e-mail de aviso real; fotos reais; ajustar perguntas e textos |
| **1. Ligar ao site** | RF-H4: botão "Criar site com este briefing" no módulo de Sites |
| **2. Material** | Upload de vídeo (RF-G6) e fotos por produto (RF-G7); lembrete ao cliente (RF-B10) |
| **3. Inteligência** | Ler links e resumir (RF-G8, RF-D10); paleta e fontes a partir do logo (RF-D11) |
| **4. Produto** | Contas, permissões, histórico de versões, política de privacidade, cobrança (se for serviço na nuvem) |

## 15. Decisões que dependem de você

1. Nome do produto e do módulo.
2. O briefing fica **dentro do produto de sites** (mesmo projeto) ou continua separado com importação?
3. Fase 1 antes do lançamento? (botão que cria o site direto do briefing)
4. Prazo de guarda dos dados do cliente e texto da política de privacidade.
5. Quem tem acesso ao link: apenas por código (hoje) ou também com senha do cliente?
6. Perguntas obrigatórias: manter as atuais ou reduzir para um briefing "rápido" (só empresa, 1 produto, marca e logo)?

## Apêndice · Partes do formulário

| # | Parte | Conteúdo |
|---|---|---|
| 1 | Quem está respondendo | 4 campos |
| 2 | Sobre a empresa | 12 campos |
| 3 | O cliente do seu cliente | 10 campos |
| 4 | Produtos e serviços | 26 campos, até 8 itens |
| 5 | A marca: valores, atitudes e voz | 17 campos (valores, atitudes, tom e voz) |
| 6 | Concorrentes | 9 campos, até 8 itens |
| 7 | Referências e o que evitar | 2 campos |
| 8 | Marketing e vendas hoje | 7 campos |
| 9 | Depoimentos de clientes | 5 campos, até 10 itens |
| 10 | Links e materiais que já existem | 6 campos |
| 11 | Fotos e arquivos | 5 categorias de upload |
