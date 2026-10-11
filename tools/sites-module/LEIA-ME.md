# Módulo de Criação de Sites e Landing Pages (versão 1.0.0)

Este é **só o módulo de sites** do Ampliação Studio, separado para virar um produto novo.
Ele abre sozinho, com 5 telas: **Projetos**, **Sites e landing pages**, **Mesa de páginas**, **Imagens** e **Configurações**.
Não vem nenhum projeto, cliente ou fonte licenciada junto: o app começa vazio.

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
- As partes com IA foram testadas só com respostas simuladas, não com chave real.
- O tema de WordPress e os modelos do Elementor foram conferidos por arquivo (estrutura, PHP sem erro, instalação simulada). **Não foram abertos num WordPress com Elementor de verdade.**
- Templates de terceiros (ex.: Envato) **não** vêm no pacote. Cada cliente importa o dele, com a licença dele.
- A medição de visitas (`lp.php`) só funciona no servidor.
