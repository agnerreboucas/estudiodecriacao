# Motor de Ofertas e Anúncios

Fica em **2 · Anúncios → Motor de Ofertas**. Em vez de "produto → anúncio", o motor constrói a estratégia antes e os anúncios saem dela.

## As 10 etapas
1. **Projeto**: descreva produto, público, preço, condições, provas, urgência real e restrições. Pode estar incompleto. "Importar do projeto" traz o que já existe no Studio.
2. **Diagnóstico**: produto, cliente, problema, desejo, dor, consequência, objeções, alternativas, diferenciação, provas, oferta e restrições. O motor lista **dados que faltam** (você responde) e **hipóteses** usadas (marcadas como hipótese).
3. **30 conceitos**: territórios de comunicação, não headlines. Nota de 0 a 100 = desejo 20% + compra 20% + necessidade 15% + urgência 15% + dor 10% + diferenciação 10% + oferta 5% + comunicação 5%. A nota é calculada pelo Studio, não pela IA.
4. **Escolha**: você escolhe um conceito. A decisão fica salva (quem, quando, versão) e bloqueada até você desbloquear.
5. **30 ângulos**, todos derivados do conceito escolhido, cada um com estágio ideal.
6. **Jornada**: 30 ângulos × 5 estágios (Descoberta, Atenção, Consideração, Compra, Apologia) = 150 células. Esta etapa não gasta IA.
7. **Ofertas**: uma por célula, no nível certo (implícita → contextual → explicada → explícita → continuidade/indicação).
8. **Copies**: hook, contexto, problema, desejo, mecanismo, oferta, prova, redução de risco e CTA.
9. **Anúncios**: escolha formato (Meta, Stories/Reels, Google, TikTok, YouTube, LinkedIn, WhatsApp, estático, UGC), variações e células.
10. **Testes**: plano macro e micro, hipóteses e regras de decisão. Cada anúncio guarda campos de resultado (CTR, CPC, CPM, CPL, CPA, conversão, ROAS, vendas e receita) para a V2.

## Regras que o motor segue
- Preço: só o informado; senão, **[PREÇO NÃO INFORMADO]**.
- Prova: nunca inventa; quando falta, **[PROVA NECESSÁRIA]**.
- Urgência: só se for real e estiver informada. A tela mostra um aviso ⚠ quando um texto cita preço, número ou urgência que não estão no projeto.

## Mudou algo? O que regenerar
Mudar o projeto desatualiza o diagnóstico; o diagnóstico, os conceitos; o conceito escolhido, os ângulos e tudo depois. Editar um ângulo desatualiza só as células dele (use "Regenerar só este ângulo"). Editar a oferta desatualiza a copy; editar a copy desatualiza os anúncios. Nada é apagado sozinho.

## Exportar
Documento da estratégia (.md), células (.csv), anúncios (.csv), projeto completo (.json) e uma planilha no formato de **Subir tabela (em lote)**, que cria os anúncios nas 3 medidas.

## Limites
Gerar tudo (30 conceitos, 30 ângulos, ofertas e copies das 150 células) usa cerca de 25 chamadas de IA. O padrão do servidor é **60 chamadas por hora** (`AI_CALLS_PER_HOUR` em `api/config.php`); suba esse valor se for gerar vários projetos seguidos. A IA usada é a configurada em `api/config.php` (GPT ou Claude).
