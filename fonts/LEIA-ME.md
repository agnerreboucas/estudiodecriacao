# Fontes do projeto

Coloque aqui (pode ter subpastas) os arquivos `.ttf`, `.otf`, `.woff` e `.woff2` e rode, na raiz do projeto:

```
node tools/build_fonts.js
```

Isso lê o nome da família, os pesos e o itálico de dentro de cada arquivo e gera `fonts/manifest.json`.
Depois disso as fontes aparecem sozinhas no catálogo (etiqueta "projeto") em qualquer computador que abrir o Studio, sem precisar enviar de novo.

- Envie a pasta inteira para a Hostinger junto com o resto do site (`fonts/` e `fonts/manifest.json`).
- Use apenas fontes com licença que permita uso na web.
- Para uma lista curta de famílias, use `node tools/build_fonts.js --only "Recoleta,Cooper"`.

- Para fixar a categoria de uma família (serif, sans, display, script, cond, slab, round, mono), crie `fonts/categorias.json`, por exemplo `{"Minha Fonte": "script"}`.
- Nomes de arquivo só podem ter letras, números, espaço, ponto, hífen e sublinhado (tire parênteses e acentos).
- Quando houver o mesmo estilo em vários formatos (woff2, woff, ttf, otf), o site usa o mais leve.
- Os arquivos de leia-me dos autores ficam em `fonts/_licencas/`.
