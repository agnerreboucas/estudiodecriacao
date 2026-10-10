# Mesa de páginas

A Mesa é o editor visual de sites do Studio. Você monta a página arrastando, vê Desktop, Tablet e Mobile lado a lado e exporta para HTML ou Elementor (gratuito).

## As 3 áreas
- **Esquerda:** Elementos, Blocos prontos, Camadas, sua Biblioteca e Assets (imagens do projeto).
- **Centro:** a página nas 3 telas (1440, 768 e 390). Réguas e guias: arraste da régua para criar uma guia.
- **Direita:** Conteúdo, Estilo, Layout, Avançado e Responsivo do item selecionado.

## Como usar
1. Em **Mesa de páginas**, comece de um modelo (captura de leads, oferta, negócio local, evento) ou em branco.
2. Arraste elementos e blocos para a página. Dê dois cliques num texto para editar.
3. A aba **Responsivo** mostra o que é diferente em cada tela. Mudar o Tablet ou o Mobile não altera o Desktop.
4. **Design System**: cores, fontes, espaçamentos, raios e sombras do projeto valem para toda a página.
5. **Componentes**: transforme um item em componente; editar um muda todos.
6. **Versões**: salvas automaticamente; restaure, compare ou marque a aprovada.
7. Botão ✨: peça em texto (ex.: "fundo escuro", "3 colunas", "mais conversão").

## Mover livre e desenhar
- **✋ Livre** (ligado por padrão): arraste qualquer elemento e solte onde quiser, como no Canva. Segure **Alt** ao arrastar para **duplicar**. Desligue o ✋ Livre para reordenar dentro do layout. Para devolver ao fluxo, em Layout → Posição escolha "Normal".
- **✏️ Desenhar:** caneta, pincel, marca-texto e borracha, com cores e tamanho. O desenho fica numa camada "Desenho" (aparece em Camadas) por cima da página. Esc ou ✓ Concluir sai do modo.
- **Desfazer/refazer:** Ctrl+Z / Ctrl+Y (ou os botões ↶ ↷), até 80 passos.

## Auto layout (como no Figma)
- Selecione uma seção/contêiner → **Layout → Auto layout** (ou **Shift+A**): escolha Horizontal, Vertical, Quebra ou Grade, alinhe pelo quadradinho 3×3, defina o espaço entre itens e o padding.
- Nos itens de dentro: **Ajustar ao conteúdo / Preencher / Fixa** para largura e altura.
- **↺ Adaptar Tablet e Celular** (no contêiner ou em *Página → Adaptar a página inteira*): arrume no Desktop e o Studio empilha colunas no celular, quebra linhas no tablet e reduz títulos e espaços. Só preenche o que você ainda não ajustou; depois dá para refinar.

## Texto
- **Aumentar/diminuir pelo canto:** selecione o texto e arraste um canto: a letra cresce junto (como no Canva). Arrastar pelo lado só muda a largura.
- **Só uma palavra:** dois cliques no texto ou título, selecione e use a barra: negrito, itálico, sublinhado, riscado, **fonte** (lista + "Mais fontes"), **tamanho**, **cor**, **destaque**, **efeitos** (sombra, contorno, neon, brilho, gradiente, marca-texto) e ⌫ limpar.
- **Texto inteiro:** Estilo → *Fonte e efeitos do texto*.

## Design (trazido do Estúdio de Design)
- **Aparência e camadas:** transparência, rotação, mesclagem (multiplicar, sobrepor…), Frente/Trás/Subir/Descer, duplicar, copiar, colar. Para uma imagem sobre outra: arraste no modo Livre e ajuste Frente/Trás e a transparência.
- **Formas:** Retângulo, Círculo, Triângulo, Losango, Hexágono, Estrela, Seta, Balão, Linha e Anel (aba Elementos → Formas); recorte de qualquer imagem ou forma em Estilo → *Forma / recorte*.
- **Gradiente rápido** (cores do projeto) e gradiente livre.
- **Imagem:** tratamentos de foto do Estúdio (30 estilos), brilho, contraste, saturação, preto e branco, sépia, desfoque, cor por cima com mistura; trocar por Biblioteca, envio, Banco de imagens ou ✨ gerar com IA.

## Imagem com IA e escolha da IA
- Selecione uma imagem → **✨ Gerar com IA**. Descreva digitando, **falando (🎤 no Chrome)** ou colando um prompt. **✨ Melhorar prompt** reescreve a ideia; **📋 Copiar prompt** serve para gerar em outro app (depois use ⬆ Enviar).
- **Referências:** até 4 imagens (ou a atual) para a IA manter produto/pessoa/estilo. **↻ Variar com IA** parte da imagem atual.
- **Qual IA e qual nível:** em *Configurações → Escolha da IA* (e dentro do modal) você escolhe Claude ou GPT para texto e o modelo (mais rápido e barato × mais inteligente e caro), e GPT Image ou Magnific para imagem. O que aparece depende das chaves configuradas no servidor.
- Observação: o Magnific ainda não foi testado com chave real.

## Exportar e importar
- HTML, CSS, ZIP (página + imagens), JSON da Mesa.
- **Elementor:** gera widgets do Elementor **grátis** (nada do Pro). Em Elementor → Modelos → Importar. O que o Elementor grátis não tem fica como CSS extra (arquivo `mesa-css-extra.css`).
- Importa Elementor, HTML e JSON da Mesa.

## Limites
- A exportação para Elementor não foi testada em um Elementor real: confira a página depois de importar.
- Mover livremente só vale para itens com posição absoluta; os demais se reordenam.
