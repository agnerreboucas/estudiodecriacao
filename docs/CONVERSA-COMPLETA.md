# Ampliação Studio — tudo que combinamos

Resumo completo da conversa, para guardar ou levar a outra conta/sessão. Complementa `docs/HANDOFF.md` (regras e pendências) e o `README.md` (função por função).

## 1. Ideia do produto
Plataforma de produção e inteligência de marketing: do cliente e do pré-projeto até a campanha pronta (anúncios, vídeos, Stories, landing, logo), tudo editável, com banco de variações e aprovação do cliente. JavaScript puro no navegador + API em PHP (Hostinger). Agora também como plugin de WordPress.

## 2. O que você pediu, em ordem
1. **Formato de projeto portátil**: salvar e abrir o projeto em outro lugar mantendo fontes, cores e imagens (olhando Photoshop, InDesign, Premiere).
2. **Pacote de peças / campanha**: todo projeto começa com um kit básico de peças já preenchido, com banco de variações (1 briefing → dezenas de variações), tudo editável. Setor **Campanhas** dentro do projeto.
3. **3 medidas por anúncio**: horizontal, vertical e feed; mudar o layout da primeira peça propaga para as variações. Mesma ideia na landing, **mobile first**.
4. **Biblioteca de anúncios de referência** (estilo BigSpy): classificar por **dor, dúvida, desejo e urgência oculta**; bloco de notas de comentários e ideias por campanha.
5. **Jornada de compra em 5 fases**, cada uma com 5 anúncios: Descoberta (Identificação), Atração (Aspiração), Consideração (Segurança), Ação (Momento Uau), Apologia (Identidade).
6. **Mais layouts editáveis** para feed e anúncios a partir de referências (só a estrutura, nunca copiar textos, logos ou fotos).
7. **3 skills de texto**: Editorial (campanha/carrossel), Stories e Audiovisual (roteiros). Textos seguem essas skills; exemplo "A cadeira na janela" como referência de formato.
8. **Roteiros de vídeo em 6 documentos** por ângulo ou post: Ficha estratégica, Literário, Gravação, Técnico (tabela), Edição (tabela) e Glossário (sempre por último).
9. **Aprovação e download** de cada roteiro: cabeçalho com nome do projeto, responsável, documento e data de aprovação; **PDF e Docs**. Depois: layout melhor (rótulos em negrito, sem "Qual", destaques, mais espaço entre linhas).
10. **Stories da semana**: 1 a 3 sequências por dia, de 3 a 15 Stories, com o que gravar, fala, interação, sinal esperado e objetivo.
11. **Landing mobile first** e novo modelo de landing de cadastro (aguardando print ou HTML do modelo).
12. **WordPress**: primeiro exportar sites como tema (já existe em Sites → Publicar); depois a plataforma inteira como plugin (feito, ver seção 5).

## 3. Regras que valem sempre
- Português do Brasil, linguagem simples.
- Chaves de API só no servidor; dados guardados são sanitizados; sem parâmetros de rastreio (fbclid, utm).
- Nunca inventar fato clínico, financeiro ou jurídico: usar `[CONFIRMAR]`.
- A IA só foi testada com respostas simuladas; dizer isso sempre.
- Imagens vêm do app/Biblioteca; de referências, só a estrutura.
- Você tem a licença dos templates da Envato que importa.
- Depois de cada entrega: README, demo (`python3 tools/build_demo.py`), testes, commit e push na branch `claude/gallant-knuth-fmaynr`; sem PR sem pedido.

## 4. Fluxo entregue
Projeto → pré-projeto (resumo executivo, elevator pitch, apresentação em 10 slides) → **Campanha** (5 fases × anúncios nas 3 medidas) → **Roteiros de vídeo** (6 documentos) → **Stories da semana** → **Landing** (mobile first) → **Logo** → aprovação do cliente e publicação. Visão geral do fluxo no hub da campanha.

## 5. Plugin de WordPress (gerado)
- Arquivo: `wordpress/ampliacao-studio-plugin.zip` (gerado por `python3 tools/build_wp_plugin.py`).
- **Plugin e não tema**: tema só muda a aparência do site; o Studio é um sistema (app + API + dados), então vive como plugin. Os sites criados no Studio continuam podendo sair como **tema + Elementor** (Sites → Publicar).
- Instalação: Plugins → Adicionar novo → Enviar plugin → Ativar → menu **Ampliação Studio** → *Abrir o Ampliação Studio* (abre em tela cheia).
- Login: o do WordPress (administradores; filtro `amplia_studio_capability` libera outros papéis). Sem login, a API responde 401.
- Dados em `wp-content/uploads/ampliacao-studio-data` (protegida por .htaccess; fazer backup junto com o site). Chaves de IA em Configurações → Integrações dentro do Studio, ou `config.php` nessa pasta.
- **Igual ao HTML?** O app é o mesmo código. Diferenças: o projeto é salvo no servidor do site (e também no navegador), IA/imagem/voz funcionam com as chaves do servidor, e o login vem do WordPress.
- **Testado**: ponte com um WordPress simulado (login, permissão, 401 sem login, gravação em uploads, chaves, app abrindo sem erros). **Não testado** num WordPress real, nem com Nginx (a proteção da pasta de dados usa .htaccess; em Nginx precisa de regra equivalente), nem com a IA de verdade.

## 5b. Honestidade sobre limites
IA só com respostas simuladas · DOCX não aberto em Word/Google Docs reais · números do Instagram lançados à mão · sem busca na web dentro do Studio · publicação direta no Meta ainda não existe.

## 6. Pendente
1. HTML completo do fluxo para sua aprovação (campanha → anúncios → roteiros → Stories → landing → logo).
2. Modelo de landing de cadastro (lp.arr.academy/imersao está bloqueado aqui): mandar print ou HTML/zip; usar só a estrutura.
3. Teste do plugin num WordPress real e ajustes.
4. Portal do cliente (lado Studio), módulo de apresentação, Produtos e serviços, CRM/Dashboard, inspetor de plugins (aguarda os arquivos), Biblioteca de anúncios de referência, publicação direta no Meta (OAuth), skills 'post', 'landing' e 'pré' sem ligação.
5. Testes antigos `eb2` e `ad1` falhando desde antes (não investigados).
