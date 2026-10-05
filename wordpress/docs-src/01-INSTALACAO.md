# Instalação

## Requisitos
- WordPress 6.0 ou mais novo.
- PHP 8.0 ou mais novo, com **cURL** ativo (a hospedagem costuma ter; no painel da Hostinger: Avançado → Configuração do PHP).
- HTTPS no site (recomendado; obrigatório para gravar áudio e usar alguns recursos do navegador).
- Permissão de escrita em `wp-content/plugins` e `wp-content/uploads`.
- Servidor **Apache ou LiteSpeed** (as hospedagens compartilhadas costumam usar um destes; confirme com a sua). Em **Nginx** a pasta de dados precisa de uma regra extra (veja "Nginx" abaixo).
- Uma conta de administrador no WordPress.

## Caminho A — pelo tema (recomendado)
1. **Aparência → Temas → Adicionar novo → Enviar tema.** Escolha `1-TEMA/ampliacao-studio-tema.zip`, clique em **Instalar agora** e depois em **Ativar**.
2. O WordPress leva você ao **instalador** (também em *Aparência → Instalação do Studio*). Ele tem 5 blocos:
   1. **Verificação** — mostra se PHP, cURL e extração de .zip estão ok.
   2. **Plugin do Ampliação Studio** — botão *Instalar e ativar o Studio* (o plugin vem dentro do tema).
   3. **Elementor (versão grátis)** — botão *Baixar e ativar o Elementor grátis* (baixa do WordPress.org; precisa de internet no servidor).
   4. **Páginas base** — cria *Início*, *Obrigado* e *Política de privacidade*. *Início* e *Obrigado* usam a tela livre do Elementor. Marque a caixa se quiser *Início* como página inicial.
   5. **Abrir** — atalhos para o Studio e para editar o *Início* no Elementor.
3. Em *Configurações → Integrações* dentro do Studio, cole as chaves de IA que for usar (opcional).

## Caminho B — manual (se o instalador falhar)
1. **Plugins → Adicionar novo → Enviar plugin** → `2-PLUGINS/ampliacao-studio-plugin.zip` → Ativar.
2. **Plugins → Adicionar novo** → pesquise **Elementor** (autor Elementor.com) → Instalar → Ativar. (Não instale o Pro.)
3. **Aparência → Temas → Enviar tema** com `1-TEMA/ampliacao-studio-tema.zip` → Ativar.
4. Crie as páginas à mão: **Páginas → Adicionar nova** (*Início*, *Obrigado*). Em *Atributos da página → Modelo*, escolha **Elementor Canvas**.

## Caminho C — por FTP/Gerenciador de arquivos
Descompacte `ampliacao-studio-plugin.zip` em `wp-content/plugins/` (fica `wp-content/plugins/ampliacao-studio/`) e o tema em `wp-content/themes/`. Depois ative no painel.

## Primeiro uso
1. Menu **Ampliação Studio** (barra lateral do WordPress, ícone de megafone) → **Abrir o Ampliação Studio**. Ele abre em tela cheia, numa aba nova, com o seu login do WordPress.
2. A tela do plugin mostra a **Verificação** (PHP, cURL, pasta de dados, Elementor) e os endereços de **leads**, **WhatsApp** e **Portal do cliente**.
3. Dentro do Studio, **Configurações → Integrações**: cole a chave da IA (Claude ou OpenAI), de voz (ElevenLabs), de imagens (OpenAI) e outras que for usar. Cada cartão tem o botão *Testar*. As chaves nunca aparecem no navegador depois de salvas.
4. Crie o primeiro projeto: **Projetos → Novo projeto** (veja `03-GUIA-DAS-TELAS`).

## Quem pode usar
Por padrão, **administradores**. Para liberar outros papéis (por exemplo, Editor), um desenvolvedor pode adicionar ao tema filho ou a um plugin de snippets:
`add_filter('amplia_studio_capability', fn() => 'edit_pages');`

## Leads (formulário)
No Elementor, arraste o widget **Shortcode** e cole:
`[amp_lead_form title="Receba contato" button="Quero saber mais" thanks="https://SEUSITE/obrigado/"]`
Os contatos chegam ao Studio e, se configurado, vão para e-mail, planilha, CRM e WhatsApp do vendedor (Configurações → Integrações → Leads). O token do formulário é gerado sozinho na ativação.

## Atualizar
Envie a versão nova do plugin por **Plugins → Adicionar novo → Enviar plugin** e aceite *Substituir a versão atual*. Seus projetos, leads e chaves ficam em `wp-content/uploads/ampliacao-studio-data`, fora do plugin, e continuam lá.

## Desinstalar
Desative e exclua o plugin e o tema. A pasta `wp-content/uploads/ampliacao-studio-data` **não é apagada** (seus dados): baixe o que quiser e apague à mão.

## Backup
Inclua `wp-content/uploads/ampliacao-studio-data` no backup do site. Dentro do Studio também dá para exportar um projeto (*Pacote do Studio, .ampliacao*) ou o espaço de trabalho em JSON.

## Nginx
O WordPress em Nginx ignora o `.htaccess`. Peça à hospedagem para bloquear o acesso web a `wp-content/uploads/ampliacao-studio-data/` (por exemplo, `location ~* /ampliacao-studio-data/ { deny all; }`). Sem isso, os arquivos de dados ficariam acessíveis por endereço direto.

## Se algo der errado
Veja `05-PROBLEMAS-E-DUVIDAS`.
