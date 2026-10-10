# Como o Social Hub entra no Studio

`socialhub/index.html` é o app **Social Hub** (repositório `agnerreboucas/socialhub`, commit `133aa2b`) compilado em um arquivo só (`bun run build:html`), com três ajustes na camada estática (`src/static/`), listados em `socialhub-studio.patch`:

1. `dados-embutidos.ts`: `gravarEstado` manda o estado inteiro ao Studio por `postMessage` (`socialhub:estado`).
2. `sessao-stub.ts`: dentro de um iframe a pessoa já entra sozinha (a sessão é a do Studio), até clicar em Sair.
3. `main.tsx`: o Studio troca de tela por mensagem (`socialhub:ir`) e a rota inicial pode vir do `#hash`.

## Refazer o arquivo
```
git clone https://github.com/agnerreboucas/socialhub && cd socialhub && git checkout 133aa2b
git apply /caminho/para/tools/socialhub/socialhub-studio.patch
mv dados/plataforma.json /tmp/        # o arquivo NÃO pode levar dados de cliente
bun install && bun run build:html
```
Depois troque no `dist-static/social-hub.html` os textos da semente que identificam a campanha original (nome da campanha e e-mail de contato) e copie para `socialhub/index.html`.
O Studio injeta, na hora de abrir, uma tag `<script type="application/json" id="dados-plataforma">` com os dados do projeto.
