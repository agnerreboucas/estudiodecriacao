# Os plugins

## 1. Ampliação Studio (incluído)
É o sistema inteiro: o app (telas do Studio), a API em PHP (IA, imagens, voz, leads, portal) e a ponte com o WordPress.

- **Menu:** *Ampliação Studio* na barra lateral do WordPress. A página mostra a verificação do servidor e os endereços de integração; o botão abre o Studio em tela cheia.
- **Login:** o do WordPress. Quem não está logado é levado ao login; quem não é administrador recebe "sem permissão".
- **Dados:** `wp-content/uploads/ampliacao-studio-data` (protegida por `.htaccess`).
- **Shortcode:** `[amp_lead_form]` (formulário de contato que envia ao Studio). Atributos: `title`, `text`, `button`, `thanks` (página de obrigado), `privacy` (política), `project` (ID do projeto).
- **Menu Clientes:** cria contas de cliente (papel "Cliente do Studio", sem acesso ao painel) e libera os portais de cada um. Shortcode `[amp_area_cliente]` mostra o login e o portal do cliente. Veja `06-AREA-DE-MEMBROS`.
- **Endereços** (aparecem na página do plugin): receber leads, webhook do WhatsApp, Portal do cliente.
- **Configuração extra (opcional):** um arquivo `config.php` na pasta de dados (modelo em `app/api/config.sample.php`, dentro do plugin) permite definir limites de uso, token de leads, webhook de saída e Meta Ads. As chaves de IA podem ser coladas dentro do Studio, sem mexer em arquivos.
- **Chaves e custos:** a IA, as imagens e a voz usam as suas contas nos fornecedores (Anthropic, OpenAI, ElevenLabs, Magnific). Há travas de uso por hora/dia no servidor.

## 2. Elementor — versão grátis (instalado pelo instalador)
Construtor visual para montar as telas do site e das landing pages. **Não precisa do Elementor Pro.** Veja `04-ELEMENTOR-GRATIS`.

## Plugins opcionais (não incluídos, não exigidos)
- **SEO** (Yoast, Rank Math...): pode usar normalmente nas páginas do Elementor.
- **Cache** (LiteSpeed Cache, WP Rocket...): se usar, exclua `wp-content/plugins/ampliacao-studio/app/` e `.../api/` do cache.
- **Segurança/firewall**: libere `.../ampliacao-studio/app/api/leads.php` e `webhook.php` para receber leads e WhatsApp.

## O que o pacote NÃO usa
Elementor Pro, WooCommerce, ACF, Jetpack. Nenhum deles é necessário.
