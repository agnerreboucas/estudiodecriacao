# Problemas e dúvidas

**O instalador diz que não conseguiu baixar o Elementor.**
O servidor precisa acessar o WordPress.org. Instale pelo caminho manual: Plugins → Adicionar novo → *Elementor*.

**"Não consegui instalar o plugin do Studio".**
Quase sempre é permissão de escrita em `wp-content/plugins`. Peça à hospedagem para ajustar, ou instale pelo caminho B/C da instalação.

**O Studio abre, mas a IA diz "não configurada".**
Cole a chave em Studio → Configurações → Integrações e use o botão *Testar*. A IA só funciona com chave própria.

**Aparece "Não autenticado".**
Sua sessão do WordPress expirou. Abra o Studio de novo pelo menu *Ampliação Studio*.

**Os projetos sumiram.**
Os projetos ficam em `wp-content/uploads/ampliacao-studio-data/workspace.json` e também no navegador. Se limpou o navegador, o servidor ainda tem a cópia: recarregue o Studio logado.

**O formulário não envia.**
Confira se o plugin está ativo, se a página tem o shortcode correto e se um firewall/segurança não está bloqueando `.../app/api/leads.php`.

**Página em branco ao abrir o Studio.**
Veja se o cURL e o PHP 8.0+ estão ativos (menu *Ampliação Studio*, bloco Verificação). Ative a depuração do WordPress (`WP_DEBUG_LOG`) e leia `wp-content/debug.log`.

**Posso usar em mais de um site?**
Depende da licença que você definir para o seu produto (veja `LICENCA.md`).

**Isso foi testado em WordPress real?**
Não. Foi testado com um WordPress simulado (login, permissão, gravação, chaves, abertura do app). Faça a primeira instalação num site de teste e relate o que encontrar.
