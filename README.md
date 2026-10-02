# Ampliação Studio

Sistema de inteligência e produção de marketing orientado por projetos. Veja `docs/PRD_Amplia_Studio_Completo_v1.md` e `docs/Guia_de_Estilo_Amplia_Studio_v1.md`.

## Estrutura
- `index.html` — shell da aplicação
- `css/` — estilos (`base`, `journey`, `architecture`)
- `js/` — `core` (estado e navegação), `journey` (Journey Architect / Pré-Projeto), `project` (abas e modais), `matrix` (Matriz de Criação), `app` (inicialização)
- `docs/` — PRD, guia de estilo e protótipo original v3

## Rodar localmente
    python3 -m http.server 8080   # abra http://localhost:8080

## Publicar na Hostinger
Envie o conteúdo da pasta (exceto `docs/` e `.git`) para `public_html` pelo Gerenciador de Arquivos ou FTP. O `.htaccess` já ativa compressão e cache.

## Status
Fase 1: protótipo modularizado e funcionando. Próximos passos: persistência/exportação JSON, fluxo completo do Pré-Projeto, integrações via proxy PHP.
