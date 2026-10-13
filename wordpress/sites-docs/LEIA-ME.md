# Estúdio de Sites para WordPress

Instale na sua hospedagem e trabalhe lá: o estúdio roda dentro do WordPress (login do próprio WordPress) e você edita os sites com o **Elementor grátis**. O Elementor Pro não é necessário.

## O que vem aqui
- `1-TEMA/estudio-de-sites-tema.zip`: tema leve, feito para o Elementor grátis, com instalador guiado. Já leva o plugin dentro.
- `2-PLUGIN/estudio-de-sites-plugin.zip`: o plugin (o estúdio em si). Use este se preferir instalar sem o tema.

## Requisitos
WordPress 6 ou mais novo, PHP 8.0 ou mais novo, cURL ativo e permissão de escrita em `wp-content/uploads`.

## Instalar (caminho fácil)
1. WordPress → **Aparência → Temas → Adicionar novo → Enviar tema**. Envie `estudio-de-sites-tema.zip` e ative.
2. Abre sozinho **Aparência → Instalação do Estúdio de Sites**. Clique nos passos: instalar o plugin do estúdio, instalar o Elementor (grátis) e criar as páginas base (Início, Obrigado, Política de privacidade).
3. No menu do WordPress, abra **Estúdio de Sites → Abrir o Estúdio de Sites**. Atalho: `seusite.com/sites/`.

Sem o tema: **Plugins → Adicionar novo → Enviar plugin** com `estudio-de-sites-plugin.zip`, ative, e instale o Elementor.

## Trabalhar
1. No estúdio, crie o projeto, preencha o briefing, escolha o template e monte as páginas na Mesa.
2. **Exportar → Kit do Elementor (.zip)** (ou o modelo `.json` de uma página).
3. No WordPress: **Elementor → Ferramentas → Importar/Exportar Kit** (ou Modelos → Importar) e envie o arquivo. Edite as páginas no Elementor.
4. Formulário de contato no Elementor: widget **Shortcode** com `[amp_lead_form title="Receba contato" button="Quero saber mais" thanks="https://SEUSITE/obrigado/"]`.
5. Para o cliente aprovar: **Desenvolvimento → Link para o cliente aprovar**.

## Onde ficam os dados
Projetos, leads e chaves ficam em `wp-content/uploads/estudio-de-sites-data/` (protegida da web). Atualizar o plugin não apaga. Faça backup dessa pasta junto com o site.

## Chaves de IA
Dentro do estúdio, em Configurações → Integrações. Ficam só no servidor.

## O que ainda não foi testado
Foi testado com um WordPress simulado (login, gravação dos projetos, abertura do estúdio) e com checagem de sintaxe do PHP. **Falta testar num WordPress real**: instalador do tema, instalação do Elementor pelo WordPress.org e a importação do Kit no Elementor. Se algo falhar, me diga a mensagem exata.

## Observações
- Quem acessa o estúdio: administradores (filtro `esites_capability` libera outros papéis).
- A área de planos e cobrança do Estúdio de Sites (login próprio, R$190/250/390) é para a versão independente; no WordPress o login é o do WordPress.
- O link de aprovação para o cliente usa o domínio do seu site.
