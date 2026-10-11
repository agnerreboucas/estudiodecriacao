# Módulo de Marca e Briefing do Cliente (versão 1.0.0)

Este é **só o módulo de marca e briefing** do Ampliação Studio, separado para virar parte de um produto novo (o de sites).
Ele abre sozinho, com 4 telas: **Clientes**, **Briefing e marca**, **Imagens** e **Configurações**.
Não vem nenhum cliente, projeto ou fonte licenciada junto: o app começa vazio.

## O que o consultor faz aqui
1. **Cria o cliente** (nome da empresa).
2. Em **Briefing do cliente**, cria o link e manda para o cliente (há botão de WhatsApp).
3. O cliente abre o link no celular e responde, **nesta ordem**: quem está respondendo → sobre a empresa (nome da marca, site, redes) → público → **produtos e serviços** → **construção da marca** (valores, atitudes, tom de voz, arquétipo, palavras) → concorrentes → referências → marketing hoje → depoimentos → **links** (site, vídeos, materiais) → **fotos e arquivos** (logo, fotos, materiais, prints). Tudo salva sozinho.
4. O consultor clica em **Importar respostas**: empresa, produtos e serviços, depoimentos, links e fotos entram no projeto.
5. Em **Marca e arquétipo**, ajusta a marca com o cliente (ou manda só essa parte por outro link). O arquétipo vem explicado (principal, secundário e terciário), com Guia dos 12 arquétipos e Relatório da marca em PDF. Dá para baixar a planilha (.xlsx ou CSV) e importar de volta.
6. Em **Resumo para o site**, baixa o briefing (.md) ou **exporta o projeto (.json)** para o módulo de Sites (Configurações → importar, ou o botão de importar do módulo).

## Como usar (3 jeitos)
1. **Só para testar:** abra `index.html` no navegador. Os dados ficam no navegador. O link para o cliente **não** funciona assim (precisa de servidor).
2. **Hospedagem comum (Hostinger etc.):** envie **todo o conteúdo desta pasta** para `public_html` (ou uma subpasta). Precisa de PHP 8 ou mais novo. As pastas `api/data` (respostas e arquivos do cliente) precisam ser graváveis.
3. **Com IA e senha:** copie `api/config.sample.php` para `api/config.php`, crie a senha e, se quiser, cole a chave da IA (ou faça isso em Configurações → Integrações, no primeiro acesso). Em **Configurações → Integrações → Distribuição de leads** coloque os e-mails que devem receber o aviso quando o cliente enviar o formulário.

## O que tem dentro
- `index.html`, `js/`, `css/`: o aplicativo (JavaScript puro).
- `briefing.html` e `marca.html`: as páginas que o **cliente** abre (briefing completo e só a marca).
- `api/`: PHP para o formulário (`briefing.php`), senha, e-mails de aviso, IA e salvar no servidor. As respostas ficam em `api/data/briefings/` (fora do alcance da web).
- `THIRD_PARTY.md`: licenças dos ícones.

## O que NÃO vem neste módulo
Anúncios, carrosséis, sites e landing pages (é o módulo de Sites), vídeo, aprovação, publicação, performance e CRM.

## Limites (ditos com honestidade)
- Os caminhos com IA foram testados só com respostas simuladas, não com chave real.
- O envio de e-mail de aviso e o envio para planilha do Google dependem da configuração do servidor e **não foram testados com e-mail real**.
- Não vem upload de **vídeo**: vídeos entram por link (YouTube, Drive etc.). Imagens (JPG, PNG, WebP) até 4 MB e PDF até 6 MB, no máximo 60 arquivos por cliente.
- Textos dos arquétipos e frases de exemplo são interpretações escritas para o Studio. Os links das marcas de exemplo abrem buscas, não páginas verificadas.
- O link do cliente guarda os dados no **seu** servidor: avise o cliente sobre o uso das informações (o formulário já pede autorização). Prazo de guarda e política de privacidade: **[DEFINIR]**.
