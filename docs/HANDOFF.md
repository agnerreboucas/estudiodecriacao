# Ampliação Studio — pacote de continuidade

Leia este arquivo primeiro numa conversa nova. A memória de verdade é este repositório (código + README + este documento).

## O que é
Plataforma de produção e inteligência de marketing. JavaScript puro no navegador (`js/`, `css/`, `index.html`) + API em PHP para Hostinger (`api/`). Dados do projeto em `js/store.js` (estado) e IndexedDB (imagens). Demo de arquivo único: `demo/ampliacao-studio-demo.html`, gerada por `python3 tools/build_demo.py`.

## Combinados fixos (não quebrar)
- Responder em português do Brasil, linguagem simples.
- Chaves de API só no servidor; sanitizar dados guardados; não guardar parâmetros de rastreio (fbclid, utm).
- Nunca inventar fato clínico, financeiro ou jurídico: usar `[CONFIRMAR]`.
- Caminhos de IA só foram testados com resposta simulada; dizer isso com honestidade.
- Imagens vêm do app/Biblioteca. De referências e templates, reproduzir só a estrutura (sem textos, logos ou fotos copiados).
- Sem identificador de modelo em arquivos do repositório.
- Depois de cada entrega: atualizar README, `python3 tools/build_demo.py`, rodar testes, commit, push, enviar o demo.
- Commit/push só na branch `claude/gallant-knuth-fmaynr`. Não abrir PR sem pedido.

## Mapa do fluxo
Projeto → pré-projeto → Campanha (5 fases da jornada: Descoberta, Atração, Consideração, Ação, Apologia; gatilhos Identificação, Aspiração, Segurança, Momento Uau, Identidade; anúncios nas 3 medidas) → Roteiros de vídeo (6 documentos, `js/video-roteiros.js`) → Stories da semana (`js/stories.js`) → Landing (mobile first, `js/landing-ui.js`, `js/builder-ui.js`) → Logo (`js/logo-lab.js`).
Skills de texto: `js/skills-text.js` (editorial, stories, audiovisual, exemplo "A cadeira na janela") e `js/skills-ui.js`.
Exportação de PDF/Docs dos roteiros: `js/doc-export.js` (rótulo em negrito, destaque em Hook/CTA/Big Idea/Promessa/Objetivo/Ângulo).

## Testes
Playwright com Chromium em `/opt/pw-browsers/chromium`, servidor estático `python3 -m http.server 8093`, bloqueando `**/status.php` e `**/fonts.googleapis.com/**`, simulando `**/ai.php`. PDF conferido com pdftotext/pdftoppm; DOCX com python-docx. Não abre num Word real.

## Pendente (ordem)
1. Revisar o fluxo inteiro e mandar um HTML completo (campanha → anúncios → roteiros → Stories → landing → logo) para aprovação.
2. Ela vai mandar outro modelo de landing de cadastro (o link lp.arr.academy/imersao é bloqueado aqui: pedir print ou HTML/zip salvo). Usar só a estrutura.
3. Plugin de WordPress JÁ GERADO (`python3 tools/build_wp_plugin.py` → `wordpress/ampliacao-studio-plugin.zip`; fontes em `wordpress/plugin-src/`; app em `app/`, API com ponte `wp-bridge.php`, dados em uploads). Testado só com WordPress simulado; falta teste em WordPress real. Ver `docs/CONVERSA-COMPLETA.md`.
4. Backlog: módulo de apresentação, "Produtos e serviços", CRM/Dashboard, inspetor de plugins (aguarda arquivos), Biblioteca de anúncios de referência (dor/dúvida/desejo/urgência), publicação direta no Meta (OAuth), skills 'post', 'landing', 'pre' ainda sem ligação, sem busca na web no Studio.
5. Testes que já falhavam antes (não investigados): eb2 e ad1.

6. Pacote de venda: `python3 tools/build_wp_package.py` → `wordpress/ampliacao-studio-pacote.zip` (tema com instalador + plugin + documentação + licença modelo). Fontes: `wordpress/theme-src`, `plugin-src`, `docs-src`. Requisito dela: **Elementor GRÁTIS, nunca Pro**. Pendente: teste em WordPress real; licença final (campos [CONFIRMAR]); servidor de licenças só se ela pedir.
7. Portal do cliente / área de membros FEITO (`js/portal.js`, `cliente.html`, `api/portal.php` com `pt_gate`, plugin: papel `amplia_cliente`, menu Clientes, shortcode `[amp_area_cliente]`). Falta teste em WordPress real. Teste: `pt1.test.js` (PHP em 8095).
8. v1.5.0: integrada a versão 1.4.1 enviada pela usuária (selecionar/excluir em lote, Motor de Ofertas, planilha matriz, aprovação de arte; fonte original em upload, base idêntica ao repositório). Entregues: documento do projeto (`js/doc-import.js`, teste `doc1.test.js`), logo por peça (`design-brand.js`, `logo1.test.js`), página de entrada (`entrar.html`/`entrar.php`, `ent1.test.js`). Pacote: `python3 tools/build_wp_package.py` → `wordpress/ampliacao-studio-pacote-<versão>.zip` (versão lida de `wordpress/plugin-src/ampliacao-studio.php`).
9. v1.6.0: **Mesa de páginas** (`js/mz-core|presets|editor|actions|panels|modals|export|ai.js`, `css/mesa.css`, dados em `p.mesa`, biblioteca em `state.mesaLib`). Testes mz1–mz5 (scratchpad) passam. Não verificado: importar o JSON exportado dentro de um Elementor real; IA só com stub; sem autoscroll ao arrastar; mover livre só para elementos absolutos. Pointer events: em iframes, ouvir no documento pai E em cada frame (ver `mzLibDrag`, `mzGuideDrag`).
10. Mesa: `js/mz-free.js` = modo livre (`mzFreeConvert`, Alt inverte) + desenho (tipo `draw`, camada única no fim da página, traços em `props.strokes`). Teste mz6. Histórico: 80 passos.
11. Mesa: `js/mz-design.js` = auto layout (`mzAutoSec/mzAutoAdapt`), aparência/camadas, efeitos de texto, formas, gradiente, imagem; barra rica por trecho em `mz-editor.js` (`mzRichBar/mzRichApply`, sanitizador `mzRichStyle`); fontes usadas entram no link do Google Fonts via `mzTreeFonts`. Teste mz7. Alt+arrastar = duplicar. Ainda não: seleção múltipla, snap ao arrastar livre, recorte de fundo.
