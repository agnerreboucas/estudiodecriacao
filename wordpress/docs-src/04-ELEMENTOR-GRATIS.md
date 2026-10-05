# Montando as telas no Elementor grátis

O pacote foi pensado para o **Elementor grátis**. O que o Pro faz que o grátis não faz está resolvido de outra forma:

| No Pro | Aqui, no grátis |
|---|---|
| Theme Builder (cabeçalho e rodapé) | O **tema** traz cabeçalho, menu e rodapé. Ajuste em **Aparência → Personalizar → Ampliação Studio** (cores, texto do rodapé, mostrar/ocultar cabeçalho) e em **Aparência → Menus**. |
| Widget Formulário | O shortcode **`[amp_lead_form]`**, num widget **Shortcode** (que é grátis). |
| Pop-ups, widgets de preço, carrossel de depoimentos, etc. | Não usamos. As páginas geradas pelo Studio usam só widgets grátis. |

## Como montar uma tela
1. **Páginas → Início → Editar com o Elementor** (ou, no instalador, *Montar a página Início no Elementor*).
2. As páginas *Início* e *Obrigado* usam o modelo **Elementor Canvas** (tela livre, sem cabeçalho/rodapé do tema). Se quiser cabeçalho e rodapé do tema, mude em **Configurações da página → Layout da página → Elementor Largura total**.
3. Monte com widgets grátis: Título, Editor de texto, Imagem, Botão, Divisor, Espaçador, Lista de ícones, Acordeão, Vídeo, HTML, Shortcode.
4. Para o formulário de contato, arraste **Shortcode** e cole `[amp_lead_form title="..." button="..." thanks="https://SEUSITE/obrigado/"]`.
5. Na visão do **celular** (ícone de telas, embaixo à esquerda), confira cada seção. O Studio trabalha *celular primeiro*; faça o mesmo.

## Trazer as páginas desenhadas no Studio
No Studio: **Sites e landing pages → Publicar → WordPress e Elementor → Páginas para o Elementor** gera arquivos `.json` (um por página). No WordPress: **Elementor → Modelos → Modelos salvos → Importar modelos**, escolha o `.json`, depois crie uma página e **Inserir** o modelo. (O caminho exato dos menus pode variar conforme a versão do Elementor; a importação de modelos existe na versão grátis.)
As páginas importadas usam apenas widgets do Elementor grátis. Foi conferido por teste automático: Título, Botão, Acordeão, Editor de texto e Shortcode nas páginas de exemplo, e a lista de tipos que o gerador produz inclui só widgets grátis.

## Boas práticas
- Imagens: use as do Studio (Biblioteca) já em WebP, para a página carregar rápido.
- Textos: copie dos roteiros e anúncios aprovados no Studio.
- Teste o formulário: envie um contato de teste e confira em Studio → leads.
- Não ative "Optimized markup" experimentais se a página quebrar; volte ao padrão.
