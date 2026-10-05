# Área do cliente (portal e área de membros)

É o que você compartilha com o cliente: um lugar só dele, onde ele **vê o que você escolheu mostrar, aprova ou pede ajustes** e acompanha o andamento. Funciona de dois jeitos:

| | Link do portal | Área de membros (WordPress) |
|---|---|---|
| Como o cliente entra | Abre o link, sem senha | Faz login com e-mail e senha |
| Quem pode abrir | Quem tiver o link | Só a conta liberada (e a equipe) |
| Onde existe | Studio com PHP (WordPress ou hospedagem) | Só na versão para WordPress |

## O que o cliente vê
- **Visão geral:** quantas peças aguardam a aprovação dele, o que está no ar, as próximas entregas, novidades e o que já foi entregue.
- **Cronograma:** quadro por status (Em criação, Ajustes, Em aprovação, Aprovado, Agendado, No ar, Concluído) e calendário por data de entrega.
- **Peças:** cada peça abre com as imagens (anúncios nas 3 medidas, artes), a prévia da página, textos e o recado que você escreveu. Ele escolhe **Aprovar**, **Pedir ajustes** (comentário obrigatório) ou **Comentar**, informando o nome.
- **Resultados:** quantos contatos chegaram (30 dias, 7 dias), de qual campanha, canal e anúncio. **Nunca aparecem nome, telefone nem e-mail dos contatos.**
O cliente **não vê** o resto do Studio, nem rascunhos, nem peças que você não adicionou.

## Passo a passo (Studio)
1. Menu **Portal do cliente** → **Criar o portal deste projeto**.
2. **＋ Adicionar peças:** marque anúncios das campanhas, artes, páginas, roteiros de vídeo e planos de Stories. Cada uma entra como *Em aprovação*.
3. Ajuste **status**, **data de entrega** e o **recado** de cada peça.
4. Preencha o **e-mail do cliente** (para avisos) e o da equipe (para receber as respostas).
5. **Publicar para o cliente** (ou **Publicar e avisar por e-mail**). Copie o **link** e envie.
6. Depois, use **Buscar respostas**: o que o cliente aprovou vira *Aprovado*; o que ele pediu para ajustar vira *Ajustes*, com o comentário no recado. Depois de mudar algo, publique de novo.
7. **Desativar** encerra o link na hora.

## Área de membros no WordPress (login)
1. No Studio, no portal do projeto, marque **Exigir login** e publique.
2. No WordPress: **Ampliação Studio → Clientes**. Informe nome e e-mail do cliente, marque o(s) portal(is) que ele pode ver e clique em **Criar conta e enviar e-mail**. Ele recebe um e-mail para criar a senha.
3. O instalador do tema cria a página **Área do cliente** (com o shortcode `[amp_area_cliente]`). Mande esse endereço ao cliente. Ele entra, e vê só os portais liberados. Quem tem vários projetos escolhe pelos botões no topo.
4. A conta de cliente **não entra no painel do WordPress**: ao logar, vai direto para a Área do cliente, sem barra de administração.
5. Para tirar o acesso: edite a conta (desmarque o portal) ou **Remover conta**.

Você pode colocar a área em qualquer página do Elementor grátis com o widget **Shortcode**: `[amp_area_cliente]`.

## Honestidade sobre limites
- Com **Exigir login desligado**, quem tem o link abre o portal (ele serve para compartilhar rápido). Ligue o login quando o conteúdo for sensível.
- As imagens e páginas do portal são **cópias publicadas** no momento do clique em Publicar. Se mudar uma arte no Studio, publique de novo.
- Páginas de site muito grandes (mais de ~3,4 MB) não vão para o portal; o Studio avisa.
- O envio de e-mails depende do e-mail do servidor (função `mail` do PHP ou do WordPress). Se não chegar, verifique spam e a configuração de e-mail da hospedagem.
- O portal foi testado de ponta a ponta no Studio com PHP (criar, publicar, o cliente abrir, aprovar, o Studio buscar a resposta, desativar) e a regra de login foi testada com um WordPress simulado. **Não foi testado em WordPress real**, e a tela *Clientes* e o shortcode `[amp_area_cliente]` foram conferidos só por sintaxe.
