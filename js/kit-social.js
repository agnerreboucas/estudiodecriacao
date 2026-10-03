/* GERADO por tools/build_kit_social.mjs a partir de vendor/kit-social/nucleo/*.ts. Não edite à mão. */
const KS = (() => {
  const __KS = {};
  __KS['types'] = (() => {
// Domínio da plataforma de gestão e métricas de redes sociais.
// Escopo restrito à camada social (orgânico + pago). Nada de e-commerce,
// catálogo, carrinho ou pedidos — ver docs/prd-plataforma-social.md, seção 1.4.

                                                                                                 

/** Estado da conexão OAuth de um perfil social (PRD 3.1). */
                                                                                        

/** Cliente/projeto — unidade de isolamento de dados (PRD 5, Segurança). */
                       
             
               
                 
  

                             
             
                    
                       
                 
                      
                           
     
                                                                              
                                                                          
     
                                   
                                                                                      
                      
                                                                                  
                              
                                                                                  
                                    
                                            
                                            
                                                              
                             
                         
  

/** Ponto diário do histórico sincronizado. Preservado mesmo com conta desconectada. */
                           
                             
                    
                          
                        
                       
                    
                             
                          
                            
                         
                         
  

/**
 * Os números que uma pessoa digita quando a atualização é manual.
 *
 * São os mesmos campos de `DailyMetric`, menos os que a plataforma consegue
 * derivar sozinha (`followersGained` e `followersLost` saem da diferença para o
 * dia anterior — ninguém lê isso de cabeça no painel da rede).
 */
                              
                    
                       
                    
                             
                          
                            
                         
                  
  

/**
 * Um registro manual de números.
 *
 * Vários registros podem apontar para o mesmo `date`: atualizar três vezes no
 * mesmo dia gera três registros, e o mais recente é o que vale para o histórico.
 * Guardar todos permite mostrar o que mudou entre uma atualização e a seguinte.
 */
                                 
             
                    
                                         
                             
                                                                           
                                       
                
                          
  

                                                              

                             
                    
                         
                            
                
                     
                     
                          
                         
                  
  

                                
                                                                      
                                                                                  
  

/** PRD 3.2 — disponível apenas quando a API da rede expõe o dado. */
/**
 * As faixas etárias como a Meta as devolve.
 *
 * São exatamente estas — não é escolha de projeto. Reagrupar ("18 a 35") pareceria
 * mais limpo e impediria comparar com o painel da própria rede, que é onde a
 * pessoa vai conferir se o número bate.
 */
                                                                                            

const FAIXAS_ETARIAS                = [
  "13-17",
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65+",
];

/**
 * O gênero como a rede o informa.
 *
 * `nao_informado` é uma fatia de verdade, e não um resto a ser distribuído: a
 * rede devolve `U` para quem não declarou. Diluir esses perfis entre os outros
 * dois inflaria os dois e apagaria a informação de que uma parte do público
 * simplesmente não disse.
 */
                                                                

/** Uma célula do cruzamento gênero × faixa etária, como a rede a entrega. */
                                 
                 
                     
                                                              
                  
  

                               
                     
                             
                       
                    
     
                                                           
    
                                                                              
                                                                               
                                                            
     
                                  
                   
                   
                 
                         
                           
      
                                                       
                                                                                  
                                               
  

/**
 * O que a peça é, quando alguém a vê na rede.
 *
 * `story` é diferente dos outros em duas coisas que aparecem em toda análise:
 * ele expira em 24 horas, e a rede não devolve curtidas nem salvamentos para
 * ele — devolve respostas, toques e saídas. Comparar a taxa de um story com a
 * de um post de feed sem dizer isso faz o story parecer o pior formato da conta
 * quando ele pode ser o melhor.
 *
 * `a_definir` é o estado de uma pauta que ainda não virou nada. Existe porque a
 * ideia nasce antes da decisão de formato — sobretudo a que nasce da agenda,
 * onde o que se sabe é "sábado tem caminhada", e só depois alguém decide se
 * aquilo vira carrossel, reels ou stories. Sem este valor, a plataforma teria de
 * chutar um formato na criação, e o chute ficaria lá como se fosse escolha.
 *
 * Nenhuma rede aceita publicar `a_definir`: a validação recusa, e é isso que
 * força a decisão antes de a peça sair.
 */
                                                                                  

/** O que dá para de fato publicar: tudo menos a pauta que ainda não decidiu. */
                                                                 

const FORMATOS_PUBLICAVEIS                      = ["imagem", "carrossel", "video", "story"];

/** Formatos cujas métricas de interação são comparáveis entre si. */
const FORMATOS_DE_FEED               = ["imagem", "carrossel", "video"];

/**
 * O ciclo de vida de uma peça, do que ela é antes de existir ao que ela vira.
 *
 * `ideia` é a pauta: o assunto já decidido e nada produzido ainda. Existe
 * porque o quadro de produção precisa de uma coluna onde a semana é planejada
 * — sem ela, a primeira coisa que alguém faz na plataforma é criar um rascunho
 * vazio só para marcar lugar.
 */
                        
           
              
                          
              
              
               
             

/**
 * As colunas do quadro de produção, na ordem em que o trabalho anda.
 *
 * `falhou` fica de fora de propósito: não é uma etapa do caminho, é um
 * acidente que pode acontecer no fim dele — e vira marcador na peça, não
 * coluna.
 */
const FASES_DE_PRODUCAO                                  = [
  "ideia",
  "rascunho",
  "aguardando_aprovacao",
  "aprovado",
  "agendado",
  "publicado",
];

/** O tipo de compromisso da campanha. */
                                                                       

/**
 * Um compromisso da campanha no calendário.
 *
 * Evento não é publicação, e confundir os dois foi o que faltava aqui: a
 * caminhada de sábado **acontece no mundo** e dela nascem três peças. Sem esta
 * entidade, a plataforma só sabia das peças soltas e ninguém conseguia olhar a
 * semana e entender o que ela era.
 *
 * `municipioCodigo` liga o compromisso ao mapa: um evento acontece numa cidade,
 * e a cidade é a mesma do IPS e da segmentação.
 */
                      
             
                    
                 
                           
                     
                                   
                           
                      
                                                                
                       
                                                                        
                                 
                                        
                             
                                                     
                    
                                 
     
                                                              
    
                                                                               
                                                               
     
                      
                    
                   
  

                         
                                                                        
                
                                               
                     
                            
                           
  

                    
             
                    
                                                                            
                         
     
                                                        
    
                                                                            
                                                                        
                 
     
                          
                       
                     
                  
                   
                     
                                              
                                             
                    
                            
                                                                     
                            
                         
                              
                        
  

                           
                
                      
                
                   
                 
                
     
                                   
    
                                                                                
                                                                                
                                                                                
                                                
     
                  
  

                                                                                 
                                                                             

                     
             
                 
                    
                            
                             
                       
                                
                             
                      
             
                        
                   
                   
                        
    
            
                  
                  
                        
                       
                   
       
                                                                     
      
                                                                                
                                                                               
                                                                             
                                                                           
               
      
                                                                              
                                                                              
                                                                 
       
                                                                 
    
  

/**
 * Grau de relação da pessoa com o projeto (área de Relacionamento).
 *
 * A escada existe porque tratar todo mundo igual desperdiça quem já está do
 * lado: um defensor merece um convite para amplificar, um não seguidor merece
 * uma resposta que o aproxime.
 */
                                                                                  

                                                  
                                                    

                          
             
                 
               
                                 
  

                         
             
                    
                  
                       
                     
                         
               
                        
                                     
                      
                            
                        
                                                                            
                         
                                                              
                     
  

                                                                             

                            
             
               
                
                 
     
                                                        
    
                                                                          
                                                                                
     
                     
                       
                                       
                         
     
                                                                          
                         
    
                                                                            
                                                                           
                                                                              
                                                     
     
                
                                                                      
                    
  

                      
             
                    
                       
                
                                    
                                  
                                    
                    
                                                         
                     
                        
  

/** Sessão do usuário autenticado na plataforma (PRD 3.1). */
                       
                     
                      
  

  return { FAIXAS_ETARIAS, FORMATOS_PUBLICAVEIS, FORMATOS_DE_FEED, FASES_DE_PRODUCAO };
  })();
  __KS['agenda'] = (() => {
const { FASES_DE_PRODUCAO } = __KS['types'];
                                                                      

/**
 * A agenda da campanha: eventos, produção e publicação no mesmo eixo do tempo.
 *
 * A plataforma tinha uma lista de publicações e nada mais. Quem organiza uma
 * campanha não pensa em lista: pensa em **dias**. Sábado tem caminhada, e da
 * caminhada saem três peças que precisam estar prontas até sexta. Nenhuma
 * dessas três frases cabia no modelo antigo.
 *
 * Três visões, porque são três perguntas diferentes e não vale forçá-las numa
 * tela só:
 *
 * **Produção** — em que pé está cada peça. É o quadro, com uma coluna por fase.
 * **Publicação** — o que vai ao ar e quando. É o calendário, por dia e hora.
 * **Tudo** — a semana como ela é: evento, produção e publicação misturados,
 * porque é assim que a semana chega para quem trabalha nela.
 *
 * A decisão que vale para o módulo inteiro: **o dia é a unidade**. Toda função
 * daqui agrupa por dia (`YYYY-MM-DD`), e não por semana nem por período — é o
 * dia que a pessoa clica, e é do dia que ela quer a lista inteira.
 *
 * Módulo puro.
 */

/** A chave de um dia, no fuso de quem está olhando. */
function chaveDoDia(data               )         {
  const d = typeof data === "string" ? new Date(data) : data;
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
}

function lerDia(chave        )       {
  const [ano, mes, dia] = chave.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function somarDias(data      , dias        )       {
  const proxima = new Date(data);
  proxima.setDate(proxima.getDate() + dias);
  return proxima;
}

/**
 * O que uma peça faz num dia.
 *
 * A mesma publicação aparece em dias diferentes por motivos diferentes: no dia
 * do prazo ela é trabalho a fazer; no dia da publicação ela é entrega. Separar
 * os dois papéis é o que impede o calendário de mentir sobre a carga da semana.
 */
                                                                          

                       
                                                    
                                                                              

/**
 * Coloca cada peça e cada evento no dia a que pertencem.
 *
 * Uma peça publicada entra pelo dia da publicação. Uma agendada, pelo dia
 * marcado. Uma em produção sem data não entra em dia nenhum — e é isso que a
 * separa: ela mora no quadro, não no calendário, e forçá-la para "hoje" encheria
 * o dia de hoje com trabalho que não vence hoje.
 */
function distribuirPorDia(eventos          , posts        )                           {
  const dias = new Map                     ();

  const guardar = (dia        , item           ) => {
    dias.set(dia, [...(dias.get(dia) ?? []), item]);
  };

  for (const evento of eventos) {
    const dia = chaveDoDia(evento.comecaEm);
    guardar(dia, { papel: "evento", dia, evento });

    // Evento de vários dias aparece em cada um deles: quem olha a quarta-feira
    // de uma caravana de três dias precisa vê-la ali.
    if (evento.terminaEm) {
      const fim = chaveDoDia(evento.terminaEm);
      let cursor = somarDias(lerDia(dia), 1);
      while (chaveDoDia(cursor) <= fim) {
        const chave = chaveDoDia(cursor);
        guardar(chave, { papel: "evento", dia: chave, evento });
        cursor = somarDias(cursor, 1);
      }
    }
  }

  for (const post of posts) {
    if (post.status === "publicado" && post.publishedAt) {
      const dia = chaveDoDia(post.publishedAt);
      guardar(dia, { papel: "publicado", dia, post });
      continue;
    }
    if (post.scheduledFor) {
      const dia = chaveDoDia(post.scheduledFor);
      const papel = post.status === "agendado" ? "agendado" : "producao";
      guardar(dia, { papel, dia, post });
    }
  }

  return dias;
}

/** Tudo o que acontece num dia, na ordem em que acontece. */
function itensDoDia(dia        , eventos          , posts        )              {
  const doDia = distribuirPorDia(eventos, posts).get(dia) ?? [];

  const quando = (item           )         =>
    item.papel === "evento"
      ? item.evento.comecaEm
      : (item.post.publishedAt ?? item.post.scheduledFor ?? "");

  return [...doDia].sort((a, b) => quando(a).localeCompare(quando(b)));
}

                              
                                      
                
  

/**
 * O quadro de produção: uma coluna por fase, na ordem do trabalho.
 *
 * Colunas vazias continuam aparecendo. Um quadro que esconde a coluna vazia
 * esconde justamente a informação de que ninguém está produzindo nada — que é
 * quando alguém precisa saber.
 */
function montarQuadro(posts        )                   {
  return FASES_DE_PRODUCAO.map((fase) => ({
    fase,
    posts: posts
      .filter((post) => post.status === fase)
      .sort((a, b) =>
        (a.scheduledFor ?? a.publishedAt ?? "9999").localeCompare(
          b.scheduledFor ?? b.publishedAt ?? "9999",
        ),
      ),
  }));
}

/** As transições que fazem sentido a partir de cada fase. */
const PROXIMAS_FASES                                   = {
  ideia: ["rascunho"],
  rascunho: ["ideia", "aguardando_aprovacao", "aprovado"],
  aguardando_aprovacao: ["rascunho", "aprovado"],
  aprovado: ["aguardando_aprovacao", "agendado", "publicado"],
  agendado: ["aprovado", "publicado"],
  // Publicado é fim de linha: despublicar não é operação que a rede ofereça de
  // volta, e fingir que oferece produziria um estado que a plataforma não
  // consegue sustentar.
  publicado: [],
  falhou: ["rascunho", "aprovado"],
};

function podeMoverPara(de            , para            )          {
  return PROXIMAS_FASES[de].includes(para);
}

                           
              
                    
                                             
                      
                                  
                     
                                                             
                             
                                                       
                     
                                 
                             
                                                                       
                 
  

/**
 * O dia, do jeito que alguém quer receber ao acordar.
 *
 * A ordem dos campos é a ordem da urgência, e não é acaso: evento acontece com
 * ou sem a plataforma; publicação agendada sai sozinha; aprovação pendente
 * trava outra pessoa; produção depende de quem lê. Quem tiver trinta segundos
 * lê os dois primeiros e já sabe o que o dia é.
 */
function resumirDia(
  dia        ,
  eventos          ,
  posts        ,
  inbox              = [],
)              {
  const noDia = (iso               ) => iso !== null && chaveDoDia(iso) === dia;

  const doDia = eventos
    .filter((evento) => {
      const inicio = chaveDoDia(evento.comecaEm);
      const fim = evento.terminaEm ? chaveDoDia(evento.terminaEm) : inicio;
      return dia >= inicio && dia <= fim;
    })
    .sort((a, b) => a.comecaEm.localeCompare(b.comecaEm));

  const publicaHoje = posts.filter(
    (post) => post.status === "agendado" && noDia(post.scheduledFor),
  );
  const publicadas = posts.filter((post) => post.status === "publicado" && noDia(post.publishedAt));
  const esperandoAprovacao = posts.filter((post) => post.status === "aguardando_aprovacao");

  // "Atrasado" conta como produção de hoje: prazo vencido não some da lista, ou
  // a peça esquecida fica esquecida.
  const produzindo = posts.filter(
    (post) =>
      (post.status === "ideia" || post.status === "rascunho") &&
      post.scheduledFor !== null &&
      chaveDoDia(post.scheduledFor) <= dia,
  );

  const conversasPendentes = inbox.filter((item) => item.status === "pendente").length;

  return {
    dia,
    eventos: doDia,
    publicaHoje,
    publicadas,
    esperandoAprovacao,
    produzindo,
    conversasPendentes,
    vazio:
      doDia.length === 0 &&
      publicaHoje.length === 0 &&
      publicadas.length === 0 &&
      esperandoAprovacao.length === 0 &&
      produzindo.length === 0,
  };
}

/**
 * A grade do mês, começando no domingo e fechando a última semana.
 *
 * Devolve sempre semanas inteiras — 35 ou 42 dias — porque um calendário com a
 * última linha pela metade quebra o alinhamento das colunas.
 */
function gradeDoMes(ano        , mes        )           {
  const primeiro = new Date(ano, mes, 1);
  const inicio = somarDias(primeiro, -primeiro.getDay());

  const ultimo = new Date(ano, mes + 1, 0);
  const fim = somarDias(ultimo, 6 - ultimo.getDay());

  const dias           = [];
  let cursor = inicio;
  while (cursor <= fim) {
    dias.push(chaveDoDia(cursor));
    cursor = somarDias(cursor, 1);
  }
  return dias;
}

/** A semana de um dia, de domingo a sábado. */
function semanaDe(dia        )           {
  const data = lerDia(dia);
  const domingo = somarDias(data, -data.getDay());
  return Array.from({ length: 7 }, (_, i) => chaveDoDia(somarDias(domingo, i)));
}

const DIAS_DA_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function nomeDoDiaDaSemana(dia        )         {
  return DIAS_DA_SEMANA[lerDia(dia).getDay()];
}

function nomeDoMes(mes        )         {
  return MESES[mes];
}

/** "sábado, 16 de agosto" — o dia como cabeçalho do painel expandido. */
function tituloDoDia(dia        )         {
  const data = lerDia(dia);
  const porExtenso = [
    "domingo",
    "segunda-feira",
    "terça-feira",
    "quarta-feira",
    "quinta-feira",
    "sexta-feira",
    "sábado",
  ][data.getDay()];
  return `${porExtenso}, ${data.getDate()} de ${MESES[data.getMonth()]}`;
}

/** A hora de um item, para a linha do tempo do dia. Nulo em dia inteiro. */
function horaDoItem(item           )                {
  if (item.papel === "evento") {
    if (item.evento.diaInteiro) return null;
    const data = new Date(item.evento.comecaEm);
    return `${String(data.getHours()).padStart(2, "0")}:${String(data.getMinutes()).padStart(2, "0")}`;
  }
  const iso = item.post.publishedAt ?? item.post.scheduledFor;
  if (!iso) return null;
  const data = new Date(iso);
  return `${String(data.getHours()).padStart(2, "0")}:${String(data.getMinutes()).padStart(2, "0")}`;
}

// --- Da agenda para a pauta --------------------------------------------------

/**
 * Todo compromisso da campanha é conteúdo em potencial.
 *
 * A caminhada de sábado não é só um horário na agenda: é reels, é carrossel, é
 * story. Antes, a pessoa importava a agenda inteira do Google e depois digitava
 * de novo, uma a uma, as pautas correspondentes — o mesmo trabalho duas vezes, e
 * a segunda vez sempre incompleta.
 *
 * Agora o evento entra no quadro como **pauta**, na coluna de ideias, marcada
 * como vinda da agenda. O que a pauta ainda **não** tem é formato: quem decide
 * se aquilo vira carrossel ou reels é uma pessoa olhando, e é por isso que
 * `a_definir` existe como formato de verdade em vez de um chute qualquer.
 *
 * A ligação é `origemEventoId`. É ela que faz a reimportação do mesmo
 * calendário — que o Google exporta inteiro, sempre — não criar a mesma pauta
 * pela segunda vez.
 */
function eventosSemPauta(eventos          , posts        )           {
  const jaGeraram = new Set(
    posts.map((post) => post.origemEventoId).filter((id)               => Boolean(id)),
  );
  return eventos.filter((evento) => !jaGeraram.has(evento.id));
}

/** As pautas que nasceram de um compromisso. */
function pautasDoEvento(evento        , posts        )         {
  return posts.filter((post) => post.origemEventoId === evento.id);
}

/**
 * O texto com que a pauta nasce.
 *
 * Não é a legenda final — é o bilhete que faz alguém entender, uma semana
 * depois, de que compromisso aquilo saiu. Por isso carrega quando e onde: sem a
 * data, "Caminhada" no meio de trinta pautas não diz qual caminhada.
 */
function pautaDoEvento(evento        )         {
  const partes = [evento.titulo];

  const data = new Date(evento.comecaEm);
  const dia = `${String(data.getDate()).padStart(2, "0")}/${String(data.getMonth() + 1).padStart(2, "0")}`;
  partes.push(
    evento.diaInteiro
      ? `${dia}, dia inteiro`
      : `${dia} às ${String(data.getHours()).padStart(2, "0")}h${String(data.getMinutes()).padStart(2, "0")}`,
  );

  if (evento.local) partes.push(evento.local);

  return partes.join(" · ");
}

/**
 * O que impede uma peça de avançar de fase, além da ordem das fases.
 *
 * Existe uma regra só, e ela é o motivo de `a_definir` existir: **pauta sem
 * formato não vira produção**. Deixar avançar produziria uma peça agendada que
 * nenhuma rede aceita — o erro apareceria na hora de publicar, que é o pior
 * momento possível para descobrir que ninguém decidiu se aquilo era um reels.
 *
 * Devolve o motivo em texto, e não `false`, porque o botão que recusa sem dizer
 * por quê é o botão que a pessoa clica de novo.
 */
function motivoParaNaoAvancar(post      , destino            )                {
  if (destino === "ideia" || destino === "rascunho") return null;
  if (post.format !== "a_definir") return null;
  return "Escolha o formato da peça antes de avançar: carrossel, imagem, vídeo ou story.";
}

// --- A marcação de cada peça no calendário ----------------------------------

/**
 * O que a cor de uma peça no calendário significa.
 *
 * Três estados, e a escolha deles é sobre **o que exige ação de quem olha**, não
 * sobre a fase interna da produção:
 *
 * `aprovar` — vermelho. Alguém precisa aprovar, e a peça já tem data. É o único
 * estado urgente do calendário: sem a aprovação, o horário passa e a peça não
 * sai. Vermelho porque é o que precisa ser visto de longe.
 *
 * `aguardando` — amarelo. Aprovada e ainda não publicada. Não exige ação hoje,
 * exige memória: está no forno, vai sair.
 *
 * `publicada` — verde. Foi ao ar. Não há nada a fazer, e é isso que o verde diz.
 *
 * `rascunho` — cinza. Ainda em produção, sem data marcada para aprovar. Aparece
 * porque ocupa o dia, mas não compete por atenção com o que tem prazo.
 */
                                                                              

function marcaDaPeca(post      )              {
  if (post.status === "publicado") return "publicada";
  if (post.status === "aguardando_aprovacao") return "aprovar";
  if (post.status === "aprovado" || post.status === "agendado") return "aguardando";
  return "rascunho";
}

const ROTULO_DA_MARCA                              = {
  aprovar: "Precisa aprovar",
  aguardando: "Aprovada, ainda não publicada",
  publicada: "Publicada",
  rascunho: "Em produção",
};

/**
 * As peças que travam o calendário: já têm data e ainda não foram aprovadas.
 *
 * É a lista que responde "o que eu preciso resolver hoje para nada furar". A
 * ordem é pela data de publicação, da mais próxima para a mais distante — o que
 * vence primeiro é o que aparece primeiro, e não o que foi criado primeiro.
 */
function esperandoAprovacao(posts        )         {
  return posts
    .filter((post) => marcaDaPeca(post) === "aprovar")
    .sort((a, b) =>
      (a.scheduledFor ?? a.publishedAt ?? "9999").localeCompare(
        b.scheduledFor ?? b.publishedAt ?? "9999",
      ),
    );
}

// --- Mexer numa publicação a partir do calendário -----------------------------

/**
 * O que dá para fazer com esta peça sem sair do calendário.
 *
 * A pergunta parece a mesma de `podeMoverPara`, e não é. Aquela governa o
 * **quadro de produção**, onde a peça anda de fase; esta governa o **calendário**,
 * onde a peça tem uma data e a pessoa quer mexer nela: adiar, tirar do ar antes
 * de ir ao ar, corrigir a legenda.
 *
 * A regra dura é uma só: **o que já foi publicado não se remarca nem se
 * cancela.** A rede não desfaz uma publicação a pedido nosso, e oferecer o botão
 * produziria um estado que a plataforma não consegue sustentar — a tela diria
 * "cancelada" e o post continuaria no ar.
 */
                                                             

function podeNaPeca(post      , acao            )          {
  if (post.status === "publicado") {
    // Editar segue valendo: a legenda de arquivo e os campos internos continuam
    // corrigíveis. O que não volta atrás é a data e o fato de ter saído.
    return acao === "editar";
  }
  if (acao === "cancelar") {
    // Só faz sentido cancelar o que está de fato marcado para sair. Uma ideia
    // sem data não tem compromisso a desfazer.
    return post.scheduledFor !== null;
  }
  return true;
}

/**
 * Por que o botão está desligado — a frase que a tela mostra.
 *
 * Um botão cinza sem explicação faz a pessoa clicar três vezes e concluir que a
 * plataforma travou. Devolve `null` quando a ação é permitida.
 */
function motivoParaNaoMexer(post      , acao            )                {
  if (podeNaPeca(post, acao)) return null;

  if (post.status === "publicado") {
    return acao === "reagendar"
      ? "Esta peça já foi publicada — a data de quando ela saiu é história, não agendamento."
      : "Esta peça já está no ar. A rede não desfaz publicação a nosso pedido; para tirá-la, é preciso apagar direto na rede.";
  }

  return "Esta peça ainda não tem data marcada, então não há agendamento a cancelar.";
}

/**
 * O estado em que a peça fica quando o agendamento é cancelado.
 *
 * Cancelar **não apaga**. O trabalho da peça continua existindo — o que some é o
 * compromisso de data. Uma peça aprovada volta para "aprovado" e fica pronta
 * para receber outra data; uma que ainda estava em produção volta para a fase em
 * que estava. Apagar por engano é o erro caro aqui, e "cancelar" é uma palavra
 * que muita gente lê como "descartar".
 */
function statusAoCancelar(post      )             {
  return post.status === "agendado" ? "aprovado" : post.status;
}

  return { chaveDoDia, lerDia, distribuirPorDia, itensDoDia, montarQuadro, podeMoverPara, resumirDia, gradeDoMes, semanaDe, nomeDoDiaDaSemana, nomeDoMes, tituloDoDia, horaDoItem, eventosSemPauta, pautasDoEvento, pautaDoEvento, motivoParaNaoAvancar, marcaDaPeca, ROTULO_DA_MARCA, esperandoAprovacao, podeNaPeca, motivoParaNaoMexer, statusAoCancelar };
  })();
  __KS['analytics'] = (() => {
                                                                                          

const PERIOD_DAYS                                   = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "12m": 365,
  tudo: null,
};

/** Recorta a série ao período pedido, respeitando o início do acompanhamento. */
function slicePeriod(metrics               , period           )                {
  const days = PERIOD_DAYS[period];
  if (days === null || metrics.length <= days) return metrics;
  return metrics.slice(-days);
}

function sum(metrics               , key                   )         {
  return metrics.reduce((total, metric) => total + (metric[key]          ), 0);
}

/**
 * Resumo do período com variação contra o período imediatamente anterior de
 * mesma duração. Quando não há histórico anterior suficiente, a variação é 0 —
 * a plataforma nunca extrapola dado que não existe.
 */
function summarize(metrics               , period           )                {
  const current = slicePeriod(metrics, period);
  if (current.length === 0) {
    return {
      followers: 0,
      followersDelta: 0,
      followersDeltaPct: 0,
      reach: 0,
      reachDelta: 0,
      engagement: 0,
      engagementDelta: 0,
      engagementRate: 0,
      adSpend: 0,
    };
  }

  const windowSize = current.length;
  const previousStart = Math.max(0, metrics.length - windowSize * 2);
  const previous = metrics.slice(previousStart, metrics.length - windowSize);

  const followers = current[current.length - 1].followers;
  const followersAtStart =
    previous.length > 0 ? previous[previous.length - 1].followers : current[0].followers;
  const followersDelta = followers - followersAtStart;

  const reach = sum(current, "organicReach") + sum(current, "paidReach");
  const previousReach = sum(previous, "organicReach") + sum(previous, "paidReach");
  const engagement = sum(current, "organicEngagement") + sum(current, "paidEngagement");
  const previousEngagement = sum(previous, "organicEngagement") + sum(previous, "paidEngagement");

  return {
    followers,
    followersDelta,
    followersDeltaPct: followersAtStart > 0 ? (followersDelta / followersAtStart) * 100 : 0,
    reach,
    reachDelta: previousReach > 0 ? ((reach - previousReach) / previousReach) * 100 : 0,
    engagement,
    engagementDelta:
      previousEngagement > 0 ? ((engagement - previousEngagement) / previousEngagement) * 100 : 0,
    engagementRate: reach > 0 ? (engagement / reach) * 100 : 0,
    adSpend: sum(current, "adSpend"),
  };
}

function splitOrganicPaid(metrics               )                   {
  return {
    organic: {
      reach: sum(metrics, "organicReach"),
      impressions: sum(metrics, "organicImpressions"),
      engagement: sum(metrics, "organicEngagement"),
    },
    paid: {
      reach: sum(metrics, "paidReach"),
      impressions: sum(metrics, "paidImpressions"),
      engagement: sum(metrics, "paidEngagement"),
      spend: sum(metrics, "adSpend"),
    },
  };
}

                           
               
     
                                          
    
                                                                           
                                                                               
                                    
     
                 
                                                                
               
                    
                       
                    
                            
                         
                  
  

/**
 * Reduz a série a no máximo `maxPoints` agrupando dias em buckets. Períodos
 * longos ("desde o início") viram uma curva legível sem trafegar 400 pontos.
 */
function buildSeries(metrics               , maxPoints = 90)                {
  if (metrics.length === 0) return [];
  const bucketSize = Math.max(1, Math.ceil(metrics.length / maxPoints));
  const points                = [];

  for (let i = 0; i < metrics.length; i += bucketSize) {
    const bucket = metrics.slice(i, i + bucketSize);
    const last = bucket[bucket.length - 1];
    points.push({
      date: last.date,
      inicio: bucket[0].date,
      dias: bucket.length,
      followers: last.followers,
      organicReach: sum(bucket, "organicReach"),
      paidReach: sum(bucket, "paidReach"),
      organicEngagement: sum(bucket, "organicEngagement"),
      paidEngagement: sum(bucket, "paidEngagement"),
      adSpend: Math.round(sum(bucket, "adSpend") * 100) / 100,
    });
  }

  return points;
}

/** Soma dia a dia as séries de várias contas, alinhando pelas datas presentes. */
function mergeSeries(seriesList                 )                {
  const byDate = new Map                     ();

  for (const series of seriesList) {
    for (const metric of series) {
      const existing = byDate.get(metric.date);
      if (!existing) {
        byDate.set(metric.date, { ...metric });
        continue;
      }
      existing.followers += metric.followers;
      existing.followersGained += metric.followersGained;
      existing.followersLost += metric.followersLost;
      existing.organicReach += metric.organicReach;
      existing.paidReach += metric.paidReach;
      existing.organicImpressions += metric.organicImpressions;
      existing.paidImpressions += metric.paidImpressions;
      existing.organicEngagement += metric.organicEngagement;
      existing.paidEngagement += metric.paidEngagement;
      existing.adSpend += metric.adSpend;
    }
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

  return { PERIOD_DAYS, slicePeriod, summarize, splitOrganicPaid, buildSeries, mergeSeries };
  })();
  __KS['atencao'] = (() => {
                                                  

/**
 * Quanta atenção a campanha recebeu, e quanta ela devolveu.
 *
 * Três medidas que o Painel mostra lado a lado porque só juntas contam a
 * história — e separadas cada uma engana de um jeito:
 *
 * **Alcance** é gente. Quantas pessoas diferentes viram alguma coisa.
 *
 * **Impressões** é vezes. Quantas exibições aconteceram, contando repetição.
 * Impressões sozinhas parecem alcance e são sempre maiores — quem lê "37 mil"
 * sem saber que são exibições acredita ter falado com 37 mil pessoas.
 *
 * **Frequência** é a razão entre as duas: quantas vezes, em média, cada pessoa
 * viu. É a medida que ninguém pede e que explica as outras duas. Frequência
 * baixa com alcance alto é campanha espalhada e rasa; frequência alta com
 * alcance baixo é a mesma gente vendo de novo — e, passando de um certo ponto,
 * é desgaste: a pessoa já viu, já decidiu, e continuar aparecendo cansa.
 *
 * A quarta medida é de outra natureza. **Mensagens** não é audiência, é
 * conversa: quantas pessoas escreveram e quantas ainda esperam resposta. Está
 * no mesmo lugar de propósito — numa campanha, deixar alguém sem resposta custa
 * mais do que uma impressão a menos.
 *
 * Módulo puro.
 */

                       
                                       
                  
                                       
                     
     
                                                        
    
                                                                              
                                                  
     
                     
  

function medirAtencao(alcance        , impressoes        )          {
  return {
    alcance,
    impressoes,
    frequencia: alcance > 0 ? impressoes / alcance : 0,
  };
}

/**
 * Como ler a frequência que saiu.
 *
 * As faixas não são universais — dependem do objetivo e do tempo de campanha —,
 * e por isso a frase é descritiva, não um veredito. O que ela faz é dar régua a
 * um número que, sozinho, não diz nada a quem vê pela primeira vez: "1,8" não
 * significa nada até alguém dizer que é quase duas vezes por pessoa.
 */
function lerFrequencia(frequencia        )         {
  if (frequencia <= 0) return "Ainda não há alcance no período para calcular.";
  if (frequencia < 1.2) {
    return "Quase todo mundo viu uma vez só. Alcance amplo e pouca repetição — bom para descoberta, fraco para fixar mensagem.";
  }
  if (frequencia < 2.5) {
    return `Cada pessoa viu ${formatarVezes(frequencia)} em média. É a faixa em que a mensagem começa a fixar sem cansar.`;
  }
  if (frequencia < 4) {
    return `Cada pessoa viu ${formatarVezes(frequencia)}. Repetição alta: vale conferir se o alcance parou de crescer, porque aí é a mesma gente vendo de novo.`;
  }
  return `Cada pessoa viu ${formatarVezes(frequencia)}. Repetição muito alta — a partir daqui costuma virar desgaste, e ampliar o público rende mais do que insistir.`;
}

function formatarVezes(frequencia        )         {
  return `${frequencia.toFixed(1).replace(".", ",")} vezes`;
}

// --- Mensagens ----------------------------------------------------------------

                         
                                                             
                    
                      
                    
                    
                         
                                                        
                    
                      
  

/**
 * O estado da caixa de entrada no período.
 *
 * Conta comentário e mensagem juntos no total porque as duas coisas são alguém
 * falando com a campanha e esperando retorno, e separa nos campos de baixo
 * porque respondê-las é trabalho diferente: comentário é público e mensagem é
 * privada.
 */
function medirConversas(itens             )            {
  const respondidas = itens.filter((item) => item.status === "respondido").length;
  const mensagens = itens.filter((item) => item.kind === "mensagem").length;

  return {
    recebidas: itens.length,
    respondidas,
    pendentes: itens.length - respondidas,
    taxaDeResposta: itens.length > 0 ? (respondidas / itens.length) * 100 : 0,
    mensagens,
    comentarios: itens.length - mensagens,
  };
}

/** Recorta a caixa de entrada pelo período que o Painel está mostrando. */
function noPeriodo(itens             , desde               )              {
  if (!desde) return itens;
  return itens.filter((item) => item.receivedAt >= desde);
}

                                   
                    
                                                              
                   
                    
                      
                    
  

/**
 * Quais publicações puxaram mais conversa.
 *
 * É o aprofundamento do cartão de mensagens, e responde a pergunta que decide a
 * próxima pauta: **o que faz as pessoas escreverem?** Alcance diz quem viu;
 * isto diz quem se mexeu a ponto de responder.
 *
 * As conversas sem publicação de origem entram numa linha própria em vez de
 * sumir. Mensagem direta costuma chegar assim — sem apontar para peça nenhuma —
 * e escondê-la faria o total da lista discordar do total do cartão, que é o
 * jeito mais rápido de alguém perder a confiança na tela.
 */
function pecasQuePuxamConversa(
  itens             ,
  posts        ,
  quantas = 5,
)                        {
  const porPeca = new Map                     ();
  const soltas              = [];

  for (const item of itens) {
    if (!item.postId) {
      soltas.push(item);
      continue;
    }
    porPeca.set(item.postId, [...(porPeca.get(item.postId) ?? []), item]);
  }

  const resumir = (lista             , post             , semPeca         ) => {
    const respondidas = lista.filter((item) => item.status === "respondido").length;
    return {
      post,
      semPeca,
      recebidas: lista.length,
      respondidas,
      pendentes: lista.length - respondidas,
    };
  };

  const comPeca = [...porPeca.entries()]
    .map(([postId, lista]) =>
      resumir(lista, posts.find((post) => post.id === postId) ?? null, false),
    )
    .sort((a, b) => b.recebidas - a.recebidas)
    .slice(0, quantas);

  return soltas.length > 0 ? [...comPeca, resumir(soltas, null, true)] : comPeca;
}

  return { medirAtencao, lerFrequencia, medirConversas, noPeriodo, pecasQuePuxamConversa };
  })();
  __KS['fuso'] = (() => {
/**
 * Fuso horário, com a base de dados que já vem com a plataforma.
 *
 * Existe como módulo próprio porque **dois importadores diferentes precisam da
 * mesma conta**: a agenda do Google declara `TZID=America/Sao_Paulo` nos
 * eventos, e a exportação de métricas do Instagram vem com o horário no fuso do
 * relatório, que não é o da campanha. Duplicar essa aritmética em dois lugares
 * seria garantir que um dos dois fica errado quando o horário de verão mudar em
 * algum lugar do mundo.
 *
 * Módulo puro.
 */

/**
 * O deslocamento de um fuso nomeado num instante, em minutos.
 *
 * `Intl` carrega a base de fusos completa no Node e no navegador; reimplementar
 * as regras de horário de verão aqui seria escrever de novo um dado que já vem
 * com a plataforma — e errar nas bordas, que é onde ele importa.
 */
function deslocamentoDoFuso(instante        , fuso        )         {
  const formatador = new Intl.DateTimeFormat("en-US", {
    timeZone: fuso,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const partes = Object.fromEntries(
    formatador.formatToParts(new Date(instante)).map((parte) => [parte.type, parte.value]),
  );

  const comoUtc = Date.UTC(
    Number(partes.year),
    Number(partes.month) - 1,
    Number(partes.day),
    // Meia-noite volta como "24" em algumas versões do ICU.
    Number(partes.hour) % 24,
    Number(partes.minute),
    Number(partes.second),
  );

  return (comoUtc - instante) / 60000;
}

/**
 * O instante em que um horário de parede acontece, num fuso nomeado.
 *
 * Duas passadas: a primeira estima o deslocamento pelo palpite, a segunda o
 * confirma no instante corrigido. É o que resolve as horas que ficam em cima da
 * virada do horário de verão, onde o deslocamento antes e depois é diferente.
 */
function instanteNaZona(
  ano        ,
  mes        ,
  dia        ,
  hora        ,
  minuto        ,
  segundo        ,
  fuso        ,
)         {
  const palpite = Date.UTC(ano, mes - 1, dia, hora, minuto, segundo);
  const primeiro = palpite - deslocamentoDoFuso(palpite, fuso) * 60000;
  return palpite - deslocamentoDoFuso(primeiro, fuso) * 60000;
}

/**
 * O fuso em que a campanha trabalha.
 *
 * Constante porque hoje há uma campanha só, e uma constante nomeada é melhor do
 * que `getHours()` espalhado. Quando a plataforma atender campanhas em fusos
 * diferentes, vira campo do projeto — e o único lugar a mudar é este.
 */
const FUSO_DA_CAMPANHA = "America/Sao_Paulo";

/** O dia da semana e a hora de um instante, no fuso pedido. */
                            
                     
                      
               
                 
                                 
              
  

/**
 * Onde o relógio estava, naquele fuso, naquele instante.
 *
 * Existe para tirar `Date.getHours()` da análise. `getHours()` devolve a hora
 * **da máquina que roda o código** — em desenvolvimento é o horário de quem
 * programa, e numa hospedagem é quase sempre UTC. A campanha de agosto tem uma
 * publicação às 02h31 de São Paulo, que em UTC é 05h31: a mesma peça cairia em
 * dois blocos do dia diferentes dependendo de onde o servidor está ligado, e a
 * recomendação de horário mudaria com a hospedagem.
 */
function paredeNaZona(instante                        , fuso        )               {
  const data = instante instanceof Date ? instante : new Date(instante);

  const formatador = new Intl.DateTimeFormat("en-US", {
    timeZone: fuso,
    hour12: false,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const partes = Object.fromEntries(
    formatador.formatToParts(data).map((parte) => [parte.type, parte.value]),
  );

  const DIAS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return {
    diaDaSemana: Math.max(DIAS.indexOf(partes.weekday ?? "Sun"), 0),
    // Meia-noite volta como "24" em algumas versões do ICU.
    hora: Number(partes.hour) % 24,
    minuto: Number(partes.minute),
    dia: `${partes.year}-${partes.month}-${partes.day}`,
  };
}

  return { deslocamentoDoFuso, instanteNaZona, FUSO_DA_CAMPANHA, paredeNaZona };
  })();
  __KS['conteudo'] = (() => {
const { FORMATOS_DE_FEED } = __KS['types'];
const { FUSO_DA_CAMPANHA, paredeNaZona } = __KS['fuso'];
                                                              

/**
 * Análise do conteúdo publicado.
 *
 * Responde três perguntas que o painel de números não responde: **o que rendeu,
 * o que não rendeu, e o que os dois têm em comum.** Alcance total diz que a
 * semana foi boa; isto diz qual peça puxou, e se foi o formato, o assunto, o
 * dia ou a hora.
 *
 * A decisão que governa o módulo: **todo agrupamento declara o tamanho da
 * amostra.** "Vídeo rende 3× mais" sobre duas peças não é achado, é acaso — e
 * a diferença entre os dois só aparece se o número de peças estiver escrito ao
 * lado. Por isso nenhuma função aqui devolve uma média sozinha; devolve a média
 * com quantas peças a sustentam, e quem consome decide se olha.
 *
 * Sobre assuntos: eles saem das hashtags e de palavras-chave da legenda, que é
 * o que a plataforma tem. Nenhuma rede social diz "este post é sobre saúde" —
 * quem diz é quem escreveu a legenda. Assunto inferido de legenda vazia não
 * existe, e a peça entra em "sem assunto" em vez de num balde inventado.
 *
 * Módulo puro.
 */

                                 
                
                 
                                                  
                
                       
                       
                           
                                                  
               
                                                               
                      
     
                                                            
    
                                                                       
                                                                           
                                                                
     
                    
  

/** Uma peça com os números que interessam para comparar. */
                            
             
                  
                     
               
                                                               
                      
                                                                    
                      
                     
                                                         
                             
                      
  

const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const NOME_DO_FORMATO                             = {
  a_definir: "A definir",
  imagem: "Imagem",
  carrossel: "Carrossel",
  video: "Vídeo",
  story: "Story",
};

/**
 * Palavras que viram assunto quando aparecem na legenda.
 *
 * Lista curta e explícita em vez de um classificador: quem lê o relatório
 * precisa poder discordar da classificação, e para discordar precisa saber a
 * regra. Uma lista de palavras é auditável; um modelo estatístico sobre
 * cinquenta legendas não é — e erraria mais.
 *
 * A lista é editável pelo próprio uso: hashtag é assunto direto, sem precisar
 * estar aqui.
 */
const PALAVRAS_POR_ASSUNTO                           = {
  Agenda: ["agenda", "evento", "encontro", "reunião", "reuniao", "visita", "caminhada"],
  Proposta: ["proposta", "projeto", "plano", "compromisso", "vamos fazer", "programa"],
  Bastidores: ["bastidor", "equipe", "time", "preparação", "preparacao", "making"],
  Depoimento: ["depoimento", "história", "historia", "relato", "conheça", "conheca"],
  Resultado: ["resultado", "entrega", "conquista", "aprovado", "inaugur"],
  Saúde: ["saúde", "saude", "posto", "hospital", "vacina", "médic", "medic"],
  Educação: ["educação", "educacao", "escola", "creche", "professor", "aluno"],
  Mobilidade: ["mobilidade", "ônibus", "onibus", "transporte", "trânsito", "transito", "asfalto"],
  Segurança: ["segurança", "seguranca", "polícia", "policia", "iluminação", "iluminacao"],
  Cultura: ["cultura", "festival", "show", "música", "musica", "arte", "teatro"],
};

const ASSUNTOS_CONHECIDOS = Object.keys(PALAVRAS_POR_ASSUNTO);

const SEM_ASSUNTO = "Sem assunto";

/**
 * Os assuntos de uma legenda.
 *
 * Hashtags entram como estão, com a primeira letra maiúscula; o resto vem das
 * palavras-chave. Uma peça pode ter mais de um assunto, porque uma legenda
 * sobre a inauguração de um posto de saúde é sobre as duas coisas.
 */
/** Chave de comparação sem acento nem caixa, para "#SAUDE" e "Saúde" serem um. */
function chaveDoAssunto(texto        )         {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function assuntosDe(legenda        )           {
  // Indexado pela chave sem acento: sem isso, a hashtag "#SAUDE" e a
  // palavra-chave "saúde" viravam dois assuntos diferentes na mesma peça, e o
  // relatório mostrava o mesmo tema duas vezes com números partidos ao meio.
  const encontrados = new Map                ();

  const registrar = (rotulo        , canonico         ) => {
    const chave = chaveDoAssunto(rotulo);
    // O nome conhecido vence o da hashtag: "Saúde" é como o relatório chama.
    if (canonico || !encontrados.has(chave)) encontrados.set(chave, rotulo);
  };

  for (const [, achado] of legenda.matchAll(/#([\p{L}\p{N}_]{2,})/gu)) {
    registrar(achado.charAt(0).toUpperCase() + achado.slice(1).toLowerCase(), false);
  }

  const texto = legenda.toLowerCase();
  for (const [assunto, palavras] of Object.entries(PALAVRAS_POR_ASSUNTO)) {
    if (palavras.some((palavra) => texto.includes(palavra))) registrar(assunto, true);
  }

  return [...encontrados.values()];
}

/** Interações da caixa que vieram de cada publicação. */
function comentariosPorPost(inbox             )                      {
  const mapa = new Map                ();
  for (const item of inbox) {
    if (!item.postId) continue;
    mapa.set(item.postId, (mapa.get(item.postId) ?? 0) + 1);
  }
  return mapa;
}

/**
 * Avalia cada peça publicada contra a média do conjunto.
 *
 * "Contra a média" é a forma que faz sentido para quem decide: saber que um
 * post alcançou 5.000 não diz nada sozinho; saber que alcançou 60% acima do que
 * a conta costuma alcançar diz o que fazer.
 */
function avaliarPecas(
  posts        ,
  inbox              = [],
  fuso         = FUSO_DA_CAMPANHA,
)                 {
  const publicados = posts.filter((post) => post.status === "publicado" && post.metrics);
  if (publicados.length === 0) return [];

  const comentarios = comentariosPorPost(inbox);
  const alcanceMedio =
    publicados.reduce((soma, post) => soma + post.metrics .reach, 0) / publicados.length;

  return publicados
    .map((post) => {
      const metricas = post.metrics ;
      const interacoes = metricas.likes + metricas.comments + metricas.shares + metricas.saves;
      const parede = post.publishedAt ? paredeNaZona(post.publishedAt, fuso) : null;

      return {
        post,
        alcance: metricas.reach,
        interacoes,
        taxa: metricas.reach > 0 ? (interacoes / metricas.reach) * 100 : 0,
        comentarios: comentarios.get(post.id) ?? 0,
        contraMedia: alcanceMedio > 0 ? (metricas.reach / alcanceMedio - 1) * 100 : 0,
        assuntos: assuntosDe(post.caption),
        // O dia e a hora saem do fuso da campanha, não do relógio da máquina.
        // `getHours()` devolveria a hora do servidor: a publicação de abertura,
        // que saiu às 02h31 em São Paulo, viraria 05h31 numa hospedagem em UTC —
        // e mudaria de bloco do dia, mudando a recomendação de horário.
        diaDaSemana: parede ? parede.diaDaSemana : null,
        hora: parede ? parede.hora : null,
      };
    })
    .sort((a, b) => b.alcance - a.alcance);
}

/** Agrupa as peças por uma chave qualquer e compara cada grupo com a média. */
function agrupar(
  pecas                ,
  chaveDe                                  ,
  rotuloDe                           ,
)                      {
  const grupos = new Map                        ();

  for (const peca of pecas) {
    for (const chave of chaveDe(peca)) {
      grupos.set(chave, [...(grupos.get(chave) ?? []), peca]);
    }
  }

  const alcanceMedioGeral =
    pecas.length > 0 ? pecas.reduce((soma, peca) => soma + peca.alcance, 0) / pecas.length : 0;

  return [...grupos.entries()]
    .map(([chave, doGrupo]) => {
      const alcanceTotal = doGrupo.reduce((soma, peca) => soma + peca.alcance, 0);
      const alcanceMedio = alcanceTotal / doGrupo.length;
      const interacoes = doGrupo.reduce((soma, peca) => soma + peca.interacoes, 0);

      return {
        chave,
        rotulo: rotuloDe(chave),
        pecas: doGrupo.length,
        alcanceMedio,
        alcanceTotal,
        interacoesMedias: interacoes / doGrupo.length,
        taxa: alcanceTotal > 0 ? (interacoes / alcanceTotal) * 100 : 0,
        contraMedia: alcanceMedioGeral > 0 ? (alcanceMedio / alcanceMedioGeral - 1) * 100 : 0,
      };
    })
    .sort((a, b) => b.alcanceMedio - a.alcanceMedio);
}

function porFormato(pecas                )                      {
  return agrupar(
    pecas,
    (peca) => [peca.post.format],
    (chave) => NOME_DO_FORMATO[chave              ] ?? chave,
  ).map((grupo) =>
    FORMATOS_DE_FEED.includes(grupo.chave              )
      ? grupo
      : {
          ...grupo,
          ressalva:
            "A rede não devolve curtidas nem salvamentos de story, e o alcance é limitado a quem abre stories. A taxa aqui não se compara com a do feed.",
        },
  );
}

function porAssunto(pecas                )                      {
  return agrupar(
    pecas,
    (peca) => (peca.assuntos.length > 0 ? peca.assuntos : [SEM_ASSUNTO]),
    (chave) => chave,
  );
}

function porDiaDaSemana(pecas                )                      {
  return agrupar(
    pecas.filter((peca) => peca.diaDaSemana !== null),
    (peca) => [String(peca.diaDaSemana)],
    (chave) => DIAS[Number(chave)] ?? chave,
  ).sort((a, b) => Number(a.chave) - Number(b.chave));
}

/**
 * Faixas de horário em vez de hora cheia.
 *
 * Vinte e quatro grupos sobre trinta publicações dariam um post por grupo e
 * nenhuma conclusão. Quatro faixas mantêm a amostra utilizável e correspondem
 * a como se decide de fato: "de manhã ou à noite?".
 */
const FAIXAS                                                               = [
  { chave: "madrugada", rotulo: "Madrugada (0h–5h)", de: 0, ate: 5 },
  { chave: "manha", rotulo: "Manhã (6h–11h)", de: 6, ate: 11 },
  { chave: "tarde", rotulo: "Tarde (12h–17h)", de: 12, ate: 17 },
  { chave: "noite", rotulo: "Noite (18h–23h)", de: 18, ate: 23 },
];

function porFaixaDeHorario(pecas                )                      {
  return agrupar(
    pecas.filter((peca) => peca.hora !== null),
    (peca) => {
      const faixa = FAIXAS.find((item) => peca.hora  >= item.de && peca.hora  <= item.ate);
      return faixa ? [faixa.chave] : [];
    },
    (chave) => FAIXAS.find((item) => item.chave === chave)?.rotulo ?? chave,
  );
}

/**
 * O que está funcionando e o que não está, em frases.
 *
 * `minimoDePecas` é o que separa achado de acaso. Três é o piso: com duas
 * peças, a média é a metade da soma de dois acasos.
 */
function destaques(
  pecas                ,
  minimoDePecas = 3,
)                                                                     {
  const grupos = [...porFormato(pecas), ...porAssunto(pecas), ...porFaixaDeHorario(pecas)].filter(
    // Grupo com ressalva não entra em destaque. Um destaque é uma frase curta e
    // conclusiva — "Story: −64%" — e é justamente o formato de frase que não
    // cabe numa comparação que precisa de asterisco. O story continua na
    // tabela por formato, onde a ressalva é lida junto com o número.
    (grupo) =>
      grupo.pecas >= minimoDePecas && grupo.chave !== SEM_ASSUNTO && grupo.ressalva === undefined,
  );

  return {
    // 25% acima ou abaixo da média: abaixo disso é oscilação normal entre peças.
    positivos: grupos.filter((grupo) => grupo.contraMedia >= 25).slice(0, 4),
    negativos: grupos
      .filter((grupo) => grupo.contraMedia <= -25)
      .sort((a, b) => a.contraMedia - b.contraMedia)
      .slice(0, 4),
  };
}

  return { NOME_DO_FORMATO, ASSUNTOS_CONHECIDOS, SEM_ASSUNTO, assuntosDe, avaliarPecas, porFormato, porAssunto, porDiaDaSemana, porFaixaDeHorario, destaques };
  })();
  __KS['format'] = (() => {
             
                 
              
            
             
               
           
                    

const numberFormatter = new Intl.NumberFormat("pt-BR");
const compactFormatter = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const longDateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" });
const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const formatNumber = (value        ) => numberFormatter.format(Math.round(value));
const formatCompact = (value        ) => compactFormatter.format(Math.round(value));
const formatCurrency = (value        ) => currencyFormatter.format(value);

function formatPercent(value        , fractionDigits = 1)         {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}%`;
}

function formatSignedPercent(value        )         {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatPercent(value)}`;
}

/** Datas do domínio chegam como "YYYY-MM-DD"; evita o shift de fuso do parse ISO. */
function parseDay(day        )       {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date);
}

const formatDay = (day        ) => dateFormatter.format(parseDay(day));
const formatLongDay = (day        ) => longDateFormatter.format(parseDay(day));
const formatDateTime = (iso        ) => dateTimeFormatter.format(new Date(iso));

function formatRelative(iso        , now = new Date())         {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `há ${days} d`;
  return formatDateTime(iso);
}

const PERIOD_LABELS                            = {
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "90 dias",
  "12m": "12 meses",
  tudo: "Desde o início",
};

const PERIOD_KEYS = Object.keys(PERIOD_LABELS)               ;

const POST_STATUS_LABELS                             = {
  ideia: "Ideia",
  rascunho: "Rascunho",
  aguardando_aprovacao: "Aguardando aprovação",
  aprovado: "Aprovado",
  agendado: "Agendado",
  publicado: "Publicado",
  falhou: "Falhou",
};

/**
 * O objetivo do anúncio escrito como se lê.
 *
 * O valor guardado é um identificador sem acento, e `capitalize` no CSS
 * transformava "trafego" em "Trafego" na tela — errado em português e visível
 * para qualquer pessoa que ler.
 */
/** As colunas do quadro, com o nome do trabalho e não o do estado. */
const FASE_LABELS                             = {
  ideia: "Ideia",
  rascunho: "Em produção",
  aguardando_aprovacao: "Em revisão",
  aprovado: "Aprovado",
  agendado: "Agendado",
  publicado: "Publicado",
  falhou: "Falhou",
};

const TIPO_DE_EVENTO_LABELS                               = {
  agenda: "Agenda pública",
  gravacao: "Gravação",
  prazo: "Prazo",
  interno: "Interno",
};

const BOOST_OBJECTIVE_LABELS                                 = {
  alcance: "Alcance",
  engajamento: "Engajamento",
  trafego: "Tráfego",
  mensagens: "Mensagens",
};

const BOOST_STATUS_LABELS                              = {
  em_analise: "Em análise",
  ativo: "Ativo",
  encerrado: "Encerrado",
  rejeitado: "Rejeitado",
};

const ROLE_LABELS                           = {
  administrador: "Administrador",
  gestor: "Gestor",
  editor: "Editor",
  atendimento: "Atendimento",
};

const ROLE_DESCRIPTIONS                           = {
  administrador: "Acesso total, incluindo usuários, projetos e conexões.",
  gestor: "Métricas, publicação, impulsionamento e relatórios do próprio projeto.",
  editor: "Cria e agenda publicações; depende de aprovação para publicar.",
  atendimento: "Somente caixa de entrada: responde comentários e mensagens.",
};

  return { formatNumber, formatCompact, formatCurrency, formatPercent, formatSignedPercent, parseDay, formatDay, formatLongDay, formatDateTime, formatRelative, PERIOD_LABELS, PERIOD_KEYS, POST_STATUS_LABELS, FASE_LABELS, TIPO_DE_EVENTO_LABELS, BOOST_OBJECTIVE_LABELS, BOOST_STATUS_LABELS, ROLE_LABELS, ROLE_DESCRIPTIONS };
  })();
  __KS['horarios'] = (() => {
const { NOME_DO_FORMATO } = __KS['conteudo'];
                                                        

/**
 * Quando publicar.
 *
 * A pergunta que este módulo responde é a mais repetida de qualquer equipe de
 * conteúdo — "que horas é melhor postar?" — e a resposta honesta quase nunca é
 * um horário só. É um mapa: dia da semana contra faixa do dia, com quantas
 * peças sustentam cada casa.
 *
 * Três decisões governam tudo aqui.
 *
 * **A conclusão sai de blocos de três horas; a inspeção pode ir à hora cheia.**
 * Sete dias por vinte e quatro horas são cento e sessenta e oito casas. Trinta
 * publicações espalhadas ali dão, no melhor caso, uma peça por casa — e uma peça
 * não é uma média, é um acaso com aparência de conclusão. Por isso tudo o que
 * vira recomendação (`melhoresHorarios`, `melhoresBlocos`, o mapa de calor)
 * trabalha em oito blocos por dia, que é também como a decisão é tomada de
 * verdade: "de manhã ou no fim da tarde?". O eixo de hora cheia existe só no
 * gráfico, para **olhar** — vinte e quatro barras finas mostram se o que rende
 * é o bloco todo ou uma ponta dele —, e ali cada faixa vem com o tamanho da
 * amostra do lado, porque uma barra alta feita de uma peça continua sendo uma
 * peça.
 *
 * **A ordenação é por alcance, não por taxa de engajamento.** Escolher horário
 * é escolher quando a rede vai distribuir a peça; alcance é a medida disso. A
 * taxa mede mais a qualidade do conteúdo do que o horário — um carrossel ótimo
 * publicado às três da manhã tem taxa alta sobre um alcance minúsculo, e
 * ordenar por taxa colocaria a madrugada em primeiro lugar. A taxa aparece ao
 * lado, porque ela responde a outra pergunta boa.
 *
 * **Amostra pequena não vira recomendação, mas também não some.** Uma casa com
 * uma peça é marcada como não confiável e continua visível. Esconder faria o
 * mapa mentir sobre o que existe, e a pessoa concluiria que nunca se publicou
 * naquele horário quando o caso é que se publicou pouco.
 *
 * Módulo puro.
 */

/** Um bloco de três horas do dia. */
                                                                                

const BLOCOS          = [
  { indice: 0, de: 0, ate: 2, rotulo: "0h–3h" },
  { indice: 1, de: 3, ate: 5, rotulo: "3h–6h" },
  { indice: 2, de: 6, ate: 8, rotulo: "6h–9h" },
  { indice: 3, de: 9, ate: 11, rotulo: "9h–12h" },
  { indice: 4, de: 12, ate: 14, rotulo: "12h–15h" },
  { indice: 5, de: 15, ate: 17, rotulo: "15h–18h" },
  { indice: 6, de: 18, ate: 20, rotulo: "18h–21h" },
  { indice: 7, de: 21, ate: 23, rotulo: "21h–0h" },
];

const DIAS_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DIAS_LONGOS = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

function blocoDaHora(hora        )        {
  return BLOCOS[Math.min(Math.floor(hora / 3), BLOCOS.length - 1)];
}

/** Uma casa do mapa: um dia da semana cruzado com um bloco do dia. */
                    
              
                
                
                       
                    
     
                                                                        
                                                                       
     
                      
                                                                             
                     
  

                              
                
                                                                              
                       
                                                
                
                                                                               
                       
  

                            
                                                                          
                         
  

/**
 * O mapa inteiro: uma casa por dia da semana e bloco, mesmo as vazias.
 *
 * As casas vazias vêm no resultado de propósito. Um mapa de calor com buracos
 * não se lê — o olho precisa da grade completa para comparar linhas e colunas,
 * e "nunca publicamos nesse horário" é informação, não ausência dela.
 */
function mapaDeHorarios(
  pecas                ,
  { minimoDePecas = 2 }               = {},
)                 {
  const consideradas = pecas.filter((peca) => peca.diaDaSemana !== null && peca.hora !== null);

  const alcanceMedio =
    consideradas.length > 0
      ? consideradas.reduce((soma, peca) => soma + peca.alcance, 0) / consideradas.length
      : 0;

  const acumulado = new Map                        ();
  for (const peca of consideradas) {
    const chave = `${peca.diaDaSemana}:${blocoDaHora(peca.hora ).indice}`;
    const lista = acumulado.get(chave) ?? [];
    lista.push(peca);
    acumulado.set(chave, lista);
  }

  const casas         = [];
  for (let dia = 0; dia < 7; dia += 1) {
    for (const bloco of BLOCOS) {
      const doGrupo = acumulado.get(`${dia}:${bloco.indice}`) ?? [];
      casas.push(resumirCasa(dia, bloco.indice, doGrupo, alcanceMedio, minimoDePecas));
    }
  }

  const maiorAlcance = casas
    .filter((casa) => casa.confiavel)
    .reduce((maior, casa) => Math.max(maior, casa.alcanceMedio), 0);

  return { casas, alcanceMedio, pecas: consideradas.length, maiorAlcance };
}

function resumirCasa(
  dia        ,
  bloco        ,
  doGrupo                ,
  alcanceMedio        ,
  minimoDePecas        ,
)       {
  if (doGrupo.length === 0) {
    return {
      dia,
      bloco,
      pecas: 0,
      alcanceMedio: 0,
      taxaMedia: 0,
      contraMedia: 0,
      confiavel: false,
    };
  }

  const media = doGrupo.reduce((soma, peca) => soma + peca.alcance, 0) / doGrupo.length;
  const taxa = doGrupo.reduce((soma, peca) => soma + peca.taxa, 0) / doGrupo.length;

  return {
    dia,
    bloco,
    pecas: doGrupo.length,
    alcanceMedio: media,
    taxaMedia: taxa,
    contraMedia: alcanceMedio > 0 ? (media / alcanceMedio - 1) * 100 : 0,
    confiavel: doGrupo.length >= minimoDePecas,
  };
}

/** Uma recomendação de horário, pronta para virar frase na tela. */
                                   
                                
                 
  

                                                   
                                     
                      
  

/**
 * Os melhores horários, do melhor para o pior.
 *
 * Só casas confiáveis entram — recomendar a partir de uma publicação seria
 * transformar sorte em conselho. Se nenhuma casa alcançar o mínimo, a lista
 * volta vazia, e é isso que a tela precisa dizer: ainda não há histórico
 * suficiente.
 */
function melhoresHorarios(
  pecas                ,
  { quantidade = 3, ...opcoes }                       = {},
)                 {
  return mapaDeHorarios(pecas, opcoes)
    .casas.filter((casa) => casa.confiavel && casa.pecas > 0)
    .sort((a, b) => b.alcanceMedio - a.alcanceMedio)
    .slice(0, quantidade)
    .map((casa) => ({ ...casa, quando: descreverQuando(casa) }));
}

function descreverQuando(casa                             )         {
  return `${DIAS_LONGOS[casa.dia]}, ${BLOCOS[casa.bloco].rotulo}`;
}

/**
 * O mesmo, mas só pelo horário — sem separar por dia da semana.
 *
 * Existe porque a amostra de uma campanha nova raramente sustenta o cruzamento
 * dia × bloco. Somando os sete dias, cada bloco recebe sete vezes mais peças, e
 * "no fim da tarde rende mais" vira uma conclusão defensável muito antes de
 * "na quinta-feira no fim da tarde".
 */
function melhoresBlocos(
  pecas                ,
  { minimoDePecas = 3, quantidade = 3 }                       = {},
)                 {
  return blocosDoDia(pecas, { minimoDePecas })
    .filter((casa) => casa.confiavel && casa.pecas > 0)
    .sort((a, b) => b.alcanceMedio - a.alcanceMedio)
    .slice(0, quantidade);
}

/**
 * Os oito blocos do dia, na ordem do relógio e sem filtro.
 *
 * `melhoresBlocos` devolve só o pódio, que é o que vira recomendação. Para
 * **comparar** o dia inteiro — o alcance da campanha contra a atividade do
 * público, faixa por faixa — é preciso a régua completa: um gráfico que mostra
 * apenas os três melhores blocos faz as outras cinco faixas parecerem sem
 * alcance nenhum, quando o caso pode ser que tenham alcance médio.
 */
function blocosDoDia(
  pecas                ,
  { minimoDePecas = 3 }               = {},
)                 {
  const consideradas = pecas.filter((peca) => peca.hora !== null);
  const alcanceMedio =
    consideradas.length > 0
      ? consideradas.reduce((soma, peca) => soma + peca.alcance, 0) / consideradas.length
      : 0;

  return BLOCOS.map((bloco) => {
    const doGrupo = consideradas.filter((peca) => blocoDaHora(peca.hora ).indice === bloco.indice);
    // `dia: -1` marca "todos os dias" — a casa não é de um dia da semana.
    const casa = resumirCasa(-1, bloco.indice, doGrupo, alcanceMedio, minimoDePecas);
    return { ...casa, quando: bloco.rotulo };
  });
}

                                 
                      
                 
                
                                                                             
                           
                                                               
                    
  

/**
 * O melhor horário de cada tipo de conteúdo.
 *
 * É a pergunta certa a fazer, porque a resposta muda de verdade entre formatos:
 * story é consumido no intervalo do dia e reels à noite, e um horário único
 * para tudo joga fora essa diferença. O preço é a amostra — dividir trinta
 * peças por quatro formatos deixa pouco em cada um —, e por isso o corte aqui é
 * por bloco do dia, sem cruzar com o dia da semana.
 *
 * Formato sem amostra suficiente volta com `ressalva` em vez de sumir: a
 * ausência de recomendação é ela própria a informação de que falta publicar
 * mais naquele formato para saber.
 */
function horariosPorFormato(
  pecas                ,
  { minimoDePecas = 3, quantidade = 2 }                       = {},
)                      {
  const formatos = [...new Set(pecas.map((peca) => peca.post.format))];

  return formatos
    .map((formato) => {
      const doFormato = pecas.filter((peca) => peca.post.format === formato);
      const melhores = melhoresBlocos(doFormato, { minimoDePecas, quantidade });

      return {
        formato,
        rotulo: NOME_DO_FORMATO[formato],
        pecas: doFormato.length,
        melhores,
        ...(melhores.length === 0
          ? {
              ressalva:
                doFormato.length < minimoDePecas
                  ? `Só ${doFormato.length} ${doFormato.length === 1 ? "peça publicada" : "peças publicadas"} neste formato — pouco para concluir.`
                  : "As publicações deste formato estão espalhadas demais pelos horários para apontar um melhor.",
            }
          : {}),
      };
    })
    .sort((a, b) => b.pecas - a.pecas);
}

// --- Quando o público está online -------------------------------------------

/**
 * A atividade do público por bloco do dia.
 *
 * É **outro** dado, e é o que fecha a pergunta. `mapaDeHorarios` diz quando as
 * peças da campanha renderam; isto diz quando as pessoas estão na rede, e vem
 * do perfil de público que a própria plataforma social devolve — não do que a
 * gente publicou.
 *
 * Cruzar os dois é o que produz a conclusão acionável: "o público está online no
 * fim da tarde e a campanha publica de manhã" é um problema que nenhum dos dois
 * números mostra sozinho.
 */
                                
                
                 
                                                                     
                    
                                                     
                
  

function atividadePorBloco(
  porHora                                      ,
)                     {
  const total = porHora.reduce((soma, ponto) => soma + ponto.activity, 0);

  return BLOCOS.map((bloco) => {
    const atividade = porHora
      .filter((ponto) => ponto.hour >= bloco.de && ponto.hour <= bloco.ate)
      .reduce((soma, ponto) => soma + ponto.activity, 0);

    return {
      bloco: bloco.indice,
      rotulo: bloco.rotulo,
      atividade,
      fatia: total > 0 ? atividade / total : 0,
    };
  });
}

/** O bloco em que o público está mais na rede. Nulo sem dado nenhum. */
function picoDoPublico(
  porHora                                      ,
)                          {
  const blocos = atividadePorBloco(porHora).filter((bloco) => bloco.atividade > 0);
  if (blocos.length === 0) return null;
  return blocos.reduce((maior, bloco) => (bloco.atividade > maior.atividade ? bloco : maior));
}

/**
 * A frase que compara o que a campanha faz com o que o público faz.
 *
 * Existe porque o par de números não fala por si: quem olha "18h–21h rende
 * +76%" e "público em pico às 21h–0h" ao lado não conclui nada até alguém
 * juntar. Devolve `null` quando falta um dos lados — inventar a frase com meio
 * dado seria pior do que não dizer nada.
 */
function compararComOPublico(
  melhorDaCampanha                          ,
  pico                         ,
)                {
  if (!melhorDaCampanha || !pico) return null;

  if (melhorDaCampanha.bloco === pico.bloco) {
    return `O melhor horário da campanha é o mesmo em que o público está mais na rede (${pico.rotulo}). Manter.`;
  }

  return `A campanha rende mais em ${BLOCOS[melhorDaCampanha.bloco].rotulo}, mas o público está mais na rede em ${pico.rotulo} — vale testar publicar ali.`;
}

// --- O quadro de barras: dias, horários, mídia e redes ----------------------

/**
 * Uma peça publicada, reduzida ao que o gráfico precisa.
 *
 * O servidor manda esta forma leve — sem métricas completas, sem legenda inteira
 * — e o navegador monta as barras. É deliberado: trocar de eixo (horário ou dia)
 * ou de recorte (formato ou rede) é um clique que não deve custar uma ida ao
 * servidor, senão o gráfico parece pesado e ninguém experimenta os cortes.
 */
                           
             
                     
              
               
                      
                     
                  
                     
                  
                      
     
                                                               
    
                                                                          
                                                                              
                                                                                
     
                 
  

/**
 * `horario` são os oito blocos de três horas; `hora` são as vinte e quatro horas
 * cheias.
 *
 * Os dois existem porque respondem a perguntas diferentes. O bloco é a régua de
 * **decisão** — ninguém agenda "às 14h em ponto porque 14h rende mais", agenda
 * "no começo da tarde" —, e com poucas peças é a única régua com amostra. A hora
 * cheia é a régua de **inspeção**: quando alguém desconfia que o pico está numa
 * ponta do bloco, só a barra fina mostra. Deixar as duas disponíveis custa uma
 * linha aqui e evita a escolha errada nos dois casos.
 */
                                                      
                                                 
                                                       

/** Quantas faixas cada eixo tem — a grade completa, inclusive as vazias. */
function faixasDoEixo(eixo              )                                      {
  if (eixo === "horario") {
    return BLOCOS.map((bloco) => ({ chave: `h-${bloco.indice}`, rotulo: bloco.rotulo }));
  }
  if (eixo === "hora") {
    // As vinte e quatro horas, sempre todas. Uma grade completa é o que permite
    // ler o dia como uma curva; mostrar só as horas com publicação faria 9h e
    // 19h ficarem lado a lado e o gráfico contaria uma história falsa.
    return Array.from({ length: 24 }, (_, hora) => ({
      chave: `c-${hora}`,
      rotulo: `${hora}h`,
    }));
  }
  return DIAS_CURTOS.map((dia, indice) => ({ chave: `d-${indice}`, rotulo: dia }));
}

function naFaixa(peca             , eixo              , indice        )          {
  if (eixo === "horario") return blocoDaHora(peca.hora).indice === indice;
  if (eixo === "hora") return peca.hora === indice;
  return peca.dia === indice;
}

/**
 * Deixa passar só as peças de uma rede.
 *
 * `null` (ou "todas") significa a campanha inteira, que é o padrão: a soma de
 * todas as redes é a leitura mais útil na maior parte do tempo, e quem quer o
 * corte por canal pede.
 */
function pecasDaRede(pecas               , rede                  )                {
  if (!rede) return pecas;
  return pecas.filter((peca) => peca.redes.includes(rede));
}

/** As redes que aparecem nas peças, para montar o seletor sem opções mortas. */
function redesPresentes(pecas               )              {
  const vistas = new Set           ();
  for (const peca of pecas) for (const rede of peca.redes) vistas.add(rede);
  return [...vistas];
}

                                                            

                             
                                                          
                
                 
                
                
                                                             
                         
  

/**
 * As barras do quadro, empilhadas por formato ou por rede.
 *
 * Duas notas sobre a soma, e as duas importam para o número não mentir:
 *
 * **Por formato, a divisão é exata.** Cada peça tem um formato só, então a barra
 * é a soma limpa das peças daquela faixa.
 *
 * **Por rede, o valor de cada peça é dividido igualmente entre as redes em que
 * ela saiu.** Uma peça publicada em Instagram e Facebook entra com metade em
 * cada. O total da barra continua exato; o que é aproximado é a repartição — e
 * ela precisa ser, porque a rede não devolve alcance por canal para uma peça só
 * que foi para três lugares. Somar o alcance inteiro em cada rede daria uma
 * barra maior que o alcance real, que é o erro pior.
 *
 * **Com uma rede escolhida, a barra é só a parte dela.** Filtrar por Instagram
 * mantém as peças que saíram no Instagram, mas cada uma entra apenas com a sua
 * parcela de Instagram — não com o alcance inteiro de uma peça que também foi
 * para o Facebook. Sem isso, escolher uma rede aumentaria o número em vez de
 * recortá-lo.
 */
function barrasDoQuadro(
  pecas               ,
  {
    eixo,
    recorte,
    metrica = "alcance",
    rede = null,
  }   
                       
                             
                              
                            
   ,
)                  {
  const faixas = faixasDoEixo(eixo);
  const consideradas = pecasDaRede(pecas, rede);

  return faixas.map((faixa, indice) => {
    const doGrupo = consideradas.filter((peca) => naFaixa(peca, eixo, indice));
    const soma = new Map                ();

    for (const peca of doGrupo) {
      const bruto = metrica === "alcance" ? peca.alcance : peca.interacoes;
      // Com rede escolhida, só a parcela dela conta — a peça multi-rede não
      // pode entrar inteira num recorte de um canal só.
      const valor = rede && peca.redes.length > 0 ? bruto / peca.redes.length : bruto;

      if (recorte === "formato") {
        soma.set(peca.formato, (soma.get(peca.formato) ?? 0) + valor);
        continue;
      }

      if (peca.redes.length === 0) {
        soma.set("sem_rede", (soma.get("sem_rede") ?? 0) + valor);
        continue;
      }

      if (rede) {
        soma.set(rede, (soma.get(rede) ?? 0) + valor);
        continue;
      }

      const parcela = valor / peca.redes.length;
      for (const outra of peca.redes) {
        soma.set(outra, (soma.get(outra) ?? 0) + parcela);
      }
    }

    return {
      chave: faixa.chave,
      rotulo: faixa.rotulo,
      total: [...soma.values()].reduce((total, valor) => total + valor, 0),
      pecas: doGrupo.length,
      fatias: [...soma.entries()]
        .map(([chave, valor]) => ({ chave, valor }))
        .sort((a, b) => b.valor - a.valor),
    };
  });
}

/** As categorias presentes nos dados, para a legenda e a ordem das pilhas. */
function categoriasDoQuadro(
  pecas               ,
  recorte                 ,
  rede                   = null,
)           {
  const consideradas = pecasDaRede(pecas, rede);
  const vistas = new Set        ();
  for (const peca of consideradas) {
    if (recorte === "formato") vistas.add(peca.formato);
    else if (rede) vistas.add(rede);
    else if (peca.redes.length === 0) vistas.add("sem_rede");
    else for (const outra of peca.redes) vistas.add(outra);
  }
  return [...vistas];
}

/**
 * As peças de uma barra, para o painel que abre no clique.
 *
 * Ordenadas por alcance: quem clica numa barra alta quer saber qual peça a
 * levantou, e essa é a primeira da lista.
 */
function pecasDaBarra(
  pecas               ,
  chave        ,
  rede                   = null,
)                {
  const eixo = eixoDaChave(chave);
  const indice = Number(chave.split("-")[1]);

  return pecasDaRede(pecas, rede)
    .filter((peca) => naFaixa(peca, eixo, indice))
    .sort((a, b) => b.alcance - a.alcance);
}

function eixoDaChave(chave        )               {
  const tipo = chave.split("-")[0];
  if (tipo === "h") return "horario";
  if (tipo === "c") return "hora";
  return "dia";
}

/** O rótulo de uma barra, por extenso, para o cabeçalho do painel. */
function rotuloDaBarra(chave        )         {
  const indice = Number(chave.split("-")[1]);
  const eixo = eixoDaChave(chave);
  if (eixo === "horario") return BLOCOS[indice].rotulo;
  if (eixo === "hora")
    return `${String(indice).padStart(2, "0")}h às ${String(indice).padStart(2, "0")}h59`;
  return DIAS_LONGOS[indice];
}

/**
 * O que a plataforma sabe sobre uma faixa de tempo, para o painel do clique.
 *
 * Quem clica numa barra não quer só a lista de peças: quer saber se aquela hora
 * é boa. Isso é a comparação com a média — o mesmo `contraMedia` do mapa de
 * calor — mais os dias em que se publicou naquela hora, porque "rende às 19h"
 * costuma ser na verdade "rende às 19h de terça".
 *
 * `confiavel` é falso com menos de duas peças, e a tela precisa respeitar isso:
 * com uma peça, o painel descreve o que aconteceu e não conclui nada.
 */
                              
                
                 
                       
                  
                     
                       
                                                                         
                      
                     
                                                                             
                                                                          
                                                      
                                                                                      
  

function detalharFaixa(
  pecas               ,
  chave        ,
  { rede = null, minimoDePecas = 2 }                                                      = {},
)                 {
  const universo = pecasDaRede(pecas, rede);
  const doGrupo = pecasDaBarra(pecas, chave, rede);

  const mediaGeral =
    universo.length > 0
      ? universo.reduce((soma, peca) => soma + peca.alcance, 0) / universo.length
      : 0;
  const alcance = doGrupo.reduce((soma, peca) => soma + peca.alcance, 0);
  const alcanceMedio = doGrupo.length > 0 ? alcance / doGrupo.length : 0;

  const porDia = new Map                       ();
  const porFormato = new Map                           ();
  for (const peca of doGrupo) {
    porDia.set(peca.dia, [...(porDia.get(peca.dia) ?? []), peca]);
    porFormato.set(peca.formato, [...(porFormato.get(peca.formato) ?? []), peca]);
  }

  const somaDe = (lista               ) => lista.reduce((soma, peca) => soma + peca.alcance, 0);

  return {
    chave,
    rotulo: rotuloDaBarra(chave),
    pecas: doGrupo,
    alcance,
    interacoes: doGrupo.reduce((soma, peca) => soma + peca.interacoes, 0),
    alcanceMedio,
    contraMedia: mediaGeral > 0 && doGrupo.length > 0 ? (alcanceMedio / mediaGeral - 1) * 100 : 0,
    confiavel: doGrupo.length >= minimoDePecas,
    dias: [...porDia.entries()]
      .map(([dia, lista]) => ({
        dia,
        rotulo: DIAS_LONGOS[dia],
        pecas: lista.length,
        alcance: somaDe(lista),
      }))
      .sort((a, b) => b.alcance - a.alcance),
    formatos: [...porFormato.entries()]
      .map(([formato, lista]) => ({
        formato,
        rotulo: NOME_DO_FORMATO[formato],
        pecas: lista.length,
        alcance: somaDe(lista),
      }))
      .sort((a, b) => b.alcance - a.alcance),
  };
}

  return { BLOCOS, DIAS_CURTOS, blocoDaHora, mapaDeHorarios, melhoresHorarios, descreverQuando, melhoresBlocos, blocosDoDia, horariosPorFormato, atividadePorBloco, picoDoPublico, compararComOPublico, pecasDaRede, redesPresentes, barrasDoQuadro, categoriasDoQuadro, pecasDaBarra, rotuloDaBarra, detalharFaixa };
  })();
  __KS['ics'] = (() => {
const { instanteNaZona } = __KS['fuso'];
                                                       

/**
 * Leitor de arquivos `.ics` — a agenda que já existe, sem pedir senha.
 *
 * O Google Calendar exporta `.ics` e publica um endereço `.ics` para qualquer
 * agenda. Ler esse formato traz a agenda inteira para dentro da plataforma sem
 * OAuth, sem token para expirar e sem pedir à campanha que autorize um
 * aplicativo a ler o calendário dela. É menos automático que uma integração —
 * alguém precisa reimportar quando a agenda muda — e é honesto sobre o que faz.
 *
 * **A reimportação não duplica.** Cada evento do arquivo tem um `UID`, e é por
 * ele que a plataforma reconhece o que já entrou. Reimportar o mesmo arquivo
 * atualiza horário e título em vez de criar uma segunda caminhada no sábado.
 *
 * O que este leitor cobre: `VEVENT` com `UID`, `SUMMARY`, `DESCRIPTION`,
 * `LOCATION`, `DTSTART` e `DTEND`, com desdobramento das linhas quebradas e
 * das sequências de escape. O que ele **não** cobre: repetição (`RRULE`),
 * fusos nomeados (`TZID`) e alarmes. Um evento que se repete entra como a
 * primeira ocorrência, e a tela diz isso — inventar as repetições a partir de
 * uma regra que não foi lida seria pior que não trazê-las.
 *
 * Módulo puro.
 */

                               
              
                 
                           
                       
                          
                           
                      
                                                                
                        
  

                            
                             
                                                                                 
                                                  
  

/**
 * Junta as linhas que o formato quebrou.
 *
 * O `.ics` corta linhas em 75 caracteres e continua na seguinte começando com
 * espaço ou tabulação. Sem juntar de volta, um título longo chega pela metade.
 */
function desdobrar(texto        )           {
  const linhas = texto.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const juntas           = [];

  for (const linha of linhas) {
    if ((linha.startsWith(" ") || linha.startsWith("\t")) && juntas.length > 0) {
      juntas[juntas.length - 1] += linha.slice(1);
    } else {
      juntas.push(linha);
    }
  }

  return juntas;
}

/** Desfaz as sequências de escape do formato. */
function limparValor(bruto        )         {
  return bruto
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

/**
 * Converte a data do `.ics` para um instante.
 *
 * Quatro formas aparecem em arquivos reais do Google: `20260815` (dia inteiro),
 * `20260815T120000Z` (UTC), `20260815T090000` com `TZID=America/Sao_Paulo` no
 * parâmetro, e `20260815T090000` sem nada — hora de parede sem fuso declarado.
 *
 * O `TZID` é o caso que mais dói se for ignorado: a exportação da agenda de uma
 * campanha em São Paulo traz dezenas de eventos assim, e lê-los como hora do
 * servidor coloca todos três horas fora do lugar numa máquina em UTC. Aqui o
 * fuso é respeitado quando vem declarado.
 */
function lerDataDoIcs(
  valor        ,
  fuso         ,
)                                              {
  const limpo = valor.trim();

  const soData = /^(\d{4})(\d{2})(\d{2})$/.exec(limpo);
  if (soData) {
    const [, ano, mes, dia] = soData;
    return {
      iso: new Date(Number(ano), Number(mes) - 1, Number(dia)).toISOString(),
      diaInteiro: true,
    };
  }

  const comHora = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(limpo);
  if (!comHora) return null;

  const [, ano, mes, dia, hora, minuto, segundo, zulu] = comHora;

  if (zulu) {
    const utc = Date.UTC(
      Number(ano),
      Number(mes) - 1,
      Number(dia),
      Number(hora),
      Number(minuto),
      Number(segundo),
    );
    return { iso: new Date(utc).toISOString(), diaInteiro: false };
  }

  if (fuso) {
    try {
      const instante = instanteNaZona(
        Number(ano),
        Number(mes),
        Number(dia),
        Number(hora),
        Number(minuto),
        Number(segundo),
        fuso,
      );
      return { iso: new Date(instante).toISOString(), diaInteiro: false };
    } catch {
      // Fuso desconhecido para o `Intl`: cai para hora de parede, que é o
      // mesmo que fazer sem a informação — e melhor que recusar o evento.
    }
  }

  const local = new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia),
    Number(hora),
    Number(minuto),
    Number(segundo),
  );
  return { iso: local.toISOString(), diaInteiro: false };
}

function lerIcs(texto        )               {
  const eventos                    = [];
  const ignorados                                       = [];

  let dentro = false;
  let campos                         = {};

  for (const linha of desdobrar(texto)) {
    if (linha.trim() === "BEGIN:VEVENT") {
      dentro = true;
      campos = {};
      continue;
    }

    if (linha.trim() === "END:VEVENT") {
      dentro = false;
      const titulo = limparValor(campos.SUMMARY ?? "") || "(sem título)";
      const inicio = campos.DTSTART ? lerDataDoIcs(campos.DTSTART, campos.DTSTART__TZID) : null;

      if (!inicio) {
        ignorados.push({ titulo, motivo: "sem data de início legível" });
        continue;
      }
      if (!campos.UID) {
        ignorados.push({
          titulo,
          motivo: "sem identificador — não daria para reimportar sem duplicar",
        });
        continue;
      }

      const fim = campos.DTEND ? lerDataDoIcs(campos.DTEND, campos.DTEND__TZID) : null;

      eventos.push({
        uid: campos.UID.trim(),
        titulo,
        descricao: campos.DESCRIPTION ? limparValor(campos.DESCRIPTION) : null,
        local: campos.LOCATION ? limparValor(campos.LOCATION) : null,
        comecaEm: inicio.iso,
        // Em dia inteiro o `.ics` marca o fim no dia seguinte, exclusivo. Sem
        // este ajuste, um evento de um dia aparece ocupando dois.
        terminaEm: fim ? (fim.diaInteiro ? recuarUmDia(fim.iso) : fim.iso) : null,
        diaInteiro: inicio.diaInteiro,
        temRepeticao: Boolean(campos.RRULE),
      });
      continue;
    }

    if (!dentro) continue;

    const separador = linha.indexOf(":");
    if (separador === -1) continue;

    // "DTSTART;VALUE=DATE" e "DTSTART" são o mesmo campo: os parâmetros depois
    // do ponto e vírgula não fazem parte do nome.
    const cabecalho = linha.slice(0, separador);
    const nome = cabecalho.split(";")[0].trim().toUpperCase();
    campos[nome] = linha.slice(separador + 1);

    // O fuso vem no parâmetro, não no valor: "DTSTART;TZID=America/Sao_Paulo".
    const fuso = /TZID=([^;:]+)/i.exec(cabecalho);
    if (fuso) campos[`${nome}__TZID`] = fuso[1].trim();
  }

  return { eventos, ignorados };
}

function recuarUmDia(iso        )         {
  const data = new Date(iso);
  data.setDate(data.getDate() - 1);
  return data.toISOString();
}

/**
 * Decide o tipo do compromisso pelo título.
 *
 * Lista curta e explícita, e não um classificador: quem discorda precisa poder
 * ver a regra, e o custo de errar aqui é baixo — o tipo é editável na tela.
 */
function adivinharTipo(titulo        )               {
  const texto = titulo.toLowerCase();
  if (/grava|filma|estúdio|estudio|foto/.test(texto)) return "gravacao";
  if (/prazo|entrega|deadline|fechamento/.test(texto)) return "prazo";
  if (/reunião|reuniao|interno|alinhamento|planejamento/.test(texto)) return "interno";
  return "agenda";
}

                                     
                  
                                                                     
                                                     
                                     
                 
                                                  
                       
  

/**
 * Cruza o que veio do arquivo com o que já está na plataforma.
 *
 * Função pura de propósito: quem chama decide o que gravar. Isso permite a tela
 * mostrar o que vai acontecer **antes** de acontecer — importar agenda por cima
 * de agenda é o tipo de operação que ninguém quer descobrir depois.
 */
function planejarImportacao(
  leitura              ,
  existentes          ,
  contexto                                                        ,
)                        {
  const agora = (contexto.agora ?? new Date()).toISOString();
  const porUid = new Map(
    existentes.filter((evento) => evento.uidExterno).map((evento) => [evento.uidExterno , evento]),
  );

  const novos           = [];
  const atualizados                                        = [];
  let iguais = 0;

  for (const importado of leitura.eventos) {
    const existente = porUid.get(importado.uid);

    if (!existente) {
      novos.push({
        id: `ev-${importado.uid.slice(0, 24).replace(/[^a-zA-Z0-9]/g, "")}`,
        projectId: contexto.projectId,
        titulo: importado.titulo,
        descricao: importado.descricao,
        tipo: adivinharTipo(importado.titulo),
        comecaEm: importado.comecaEm,
        terminaEm: importado.terminaEm,
        diaInteiro: importado.diaInteiro,
        local: importado.local,
        municipioCodigo: null,
        responsavel: null,
        postIds: [],
        origem: "importado",
        uidExterno: importado.uid,
        criadoPor: contexto.criadoPor,
        criadoEm: agora,
      });
      continue;
    }

    const mudou           = [];
    if (existente.titulo !== importado.titulo) mudou.push("título");
    if (existente.comecaEm !== importado.comecaEm) mudou.push("horário");
    if (existente.terminaEm !== importado.terminaEm) mudou.push("término");
    if (existente.local !== importado.local) mudou.push("local");

    if (mudou.length === 0) {
      iguais += 1;
      continue;
    }

    atualizados.push({
      evento: {
        ...existente,
        titulo: importado.titulo,
        descricao: importado.descricao,
        comecaEm: importado.comecaEm,
        terminaEm: importado.terminaEm,
        diaInteiro: importado.diaInteiro,
        local: importado.local,
      },
      mudou,
    });
  }

  return {
    novos,
    atualizados,
    iguais,
    ignorados: leitura.ignorados,
    comRepeticao: leitura.eventos.filter((evento) => evento.temRepeticao).length,
  };
}

  return { lerDataDoIcs, lerIcs, adivinharTipo, planejarImportacao };
  })();
  __KS['importacao'] = (() => {
                                                              

/**
 * Importação do histórico a partir de uma planilha.
 *
 * Digitar um ano de números dia a dia não é viável, e é exatamente isso que
 * separa uma plataforma vazia de uma plataforma útil no primeiro dia. Aqui entra
 * o arquivo que já existe — exportação do Meta Business Suite, planilha do
 * Google, CSV do agregador — e vira histórico.
 *
 * O módulo é inteiro sobre **desconfiar do arquivo**. Planilha de cliente vem
 * com cabeçalho em português ou em inglês, número com vírgula ou com ponto,
 * data em três formatos, coluna a mais, linha em branco no meio e o total na
 * última linha. Nada disso pode virar dado errado em silêncio: cada linha que
 * não dá para entender vira um problema com o número da linha, e a tela mostra
 * tudo antes de gravar qualquer coisa.
 *
 * As duas armadilhas que motivam metade do código:
 *
 * **"1.234" é mil duzentos e trinta e quatro ou é um vírgula dois?** Depende do
 * país de quem exportou. A regra adotada olha quantos dígitos vêm depois do
 * separador: três dígitos e nada mais é separador de milhar; qualquer outra
 * quantidade é decimal. Acerta "1.234" (mil) e "35.50" (trinta e cinco e meio)
 * sem precisar saber de que campo se trata.
 *
 * **"03/04/2026" é 3 de abril ou 4 de março?** Em vez de supor, o módulo lê o
 * arquivo inteiro primeiro: se em algum lugar o primeiro número passa de 12, a
 * ordem é dia/mês; se o segundo passa, é mês/dia. A ordem detectada é devolvida
 * para a tela mostrar — supor errado desloca o histórico inteiro em silêncio.
 *
 * Módulo puro: recebe texto, devolve um plano. Não grava nada.
 */

/** Os campos que a planilha pode preencher, além da data. */
                                                   

/**
 * Nomes de coluna aceitos para cada campo.
 *
 * A lista é generosa de propósito. O custo de aceitar um sinônimo a mais é
 * quase zero; o custo de recusar o cabeçalho que o cliente tem é a pessoa
 * desistir da importação e digitar tudo à mão.
 */
const SINONIMOS                                             = {
  date: ["data", "dia", "date", "day", "periodo", "período", "data do dia", "reference date"],
  followers: [
    "seguidores",
    "followers",
    "total de seguidores",
    "seguidores totais",
    "follower count",
    "fas",
    "fãs",
    "curtidas da pagina",
    "curtidas da página",
    "inscritos",
    "subscribers",
  ],
  organicReach: [
    "alcance organico",
    "alcance orgânico",
    "organic reach",
    "alcance nao pago",
    "alcance não pago",
    "contas alcancadas organico",
    "contas alcançadas orgânico",
  ],
  paidReach: ["alcance pago", "paid reach", "alcance de anuncios", "alcance de anúncios"],
  organicImpressions: [
    "impressoes organicas",
    "impressões orgânicas",
    "organic impressions",
    "visualizacoes organicas",
    "visualizações orgânicas",
  ],
  paidImpressions: [
    "impressoes pagas",
    "impressões pagas",
    "paid impressions",
    "impressoes de anuncios",
    "impressões de anúncios",
  ],
  organicEngagement: [
    "engajamento organico",
    "engajamento orgânico",
    "organic engagement",
    "interacoes organicas",
    "interações orgânicas",
    "envolvimento organico",
    "envolvimento orgânico",
  ],
  paidEngagement: ["engajamento pago", "paid engagement", "interacoes pagas", "interações pagas"],
  adSpend: [
    "investimento",
    "investido",
    "valor gasto",
    "gasto",
    "ad spend",
    "amount spent",
    "spend",
    "custo",
    "verba",
  ],
};

const CAMPOS_IMPORTAVEIS = Object.keys(SINONIMOS).filter(
  (chave) => chave !== "date",
)                     ;

/** Rótulo humano de cada campo, para a tela de conferência. */
const ROTULOS                                           = {
  date: "Data",
  followers: "Seguidores",
  organicReach: "Alcance orgânico",
  paidReach: "Alcance pago",
  organicImpressions: "Impressões orgânicas",
  paidImpressions: "Impressões pagas",
  organicEngagement: "Engajamento orgânico",
  paidEngagement: "Engajamento pago",
  adSpend: "Investimento",
};

                        
                                                       
                
                   
  

                              
                
               
                          
  

                                                                       

                     
                                                                             
                                                                           
                           
     
                                            
    
                                                                              
                                                                        
                                                                           
                                               
     
                                     
                        
                                                
                      
                           
                             
                           
                                                               
                      
  

// --- Leitura do texto -------------------------------------------------------

/**
 * Descobre o separador contando ocorrências na primeira linha.
 *
 * Planilha brasileira salva em CSV costuma usar ponto e vírgula, porque a
 * vírgula já é o separador decimal. Supor vírgula quebraria o caso mais comum
 * do público deste produto.
 */
function detectarSeparador(texto        )         {
  const primeira = texto.split(/\r?\n/).find((linha) => linha.trim().length > 0) ?? "";
  const candidatos = [";", "\t", ","];
  let melhor = ";";
  let maior = -1;

  for (const candidato of candidatos) {
    const quantidade = primeira.split(candidato).length - 1;
    if (quantidade > maior) {
      maior = quantidade;
      melhor = candidato;
    }
  }
  return maior > 0 ? melhor : ";";
}

/**
 * Divide o texto em células, respeitando aspas.
 *
 * Sem tratar aspas, uma legenda com o separador dentro desloca a linha inteira
 * e todos os números vão para a coluna errada — o pior tipo de erro, porque não
 * parece erro.
 */
function lerTabela(texto        , separador = detectarSeparador(texto))             {
  const linhas             = [];
  let celula = "";
  let atual           = [];
  let dentroDeAspas = false;

  const fecharCelula = () => {
    atual.push(celula.trim());
    celula = "";
  };
  const fecharLinha = () => {
    fecharCelula();
    if (atual.some((valor) => valor.length > 0)) linhas.push(atual);
    atual = [];
  };

  for (let i = 0; i < texto.length; i += 1) {
    const caractere = texto[i];

    if (dentroDeAspas) {
      // Aspas duplicadas dentro do campo representam uma aspa literal.
      if (caractere === '"' && texto[i + 1] === '"') {
        celula += '"';
        i += 1;
      } else if (caractere === '"') {
        dentroDeAspas = false;
      } else {
        celula += caractere;
      }
      continue;
    }

    if (caractere === '"') dentroDeAspas = true;
    else if (caractere === separador) fecharCelula();
    else if (caractere === "\n") fecharLinha();
    else if (caractere !== "\r") celula += caractere;
  }
  fecharLinha();

  return linhas;
}

// --- Interpretação de cada célula -------------------------------------------

/** Tira acento, caixa e pontuação para comparar cabeçalhos. */
function normalizar(texto        )         {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function reconhecerColuna(cabecalho        )                                  {
  const alvo = normalizar(cabecalho);
  if (!alvo) return null;

  for (const [campo, nomes] of Object.entries(SINONIMOS)) {
    if (nomes.some((nome) => normalizar(nome) === alvo)) {
      return campo                            ;
    }
  }
  return null;
}

/**
 * Converte um número escrito em qualquer uma das duas convenções.
 *
 * Ver a nota do topo sobre "1.234". Devolve `null` quando não é número — o que
 * é diferente de zero, e por isso vira problema em vez de virar dado.
 */
function interpretarNumero(bruto        )                {
  // O espaço não separável (\u00a0) merece menção: planilha exportada do Excel
  // em português usa ele como separador de milhar, e ele não casa com \s em
  // todos os motores. Sem tirá-lo, "12 345" viraria problema em vez de 12345.
  const limpo = bruto
    .replace(/R\$|%/gi, "")
    .replace(/[\s\u00a0]/g, "")
    .trim();
  if (!limpo) return null;
  if (!/^-?[\d.,]+$/.test(limpo)) return null;

  const negativo = limpo.startsWith("-");
  const corpo = negativo ? limpo.slice(1) : limpo;

  const temPonto = corpo.includes(".");
  const temVirgula = corpo.includes(",");

  let normalizado        ;
  if (temPonto && temVirgula) {
    // O separador que aparece por último é o decimal.
    normalizado =
      corpo.lastIndexOf(",") > corpo.lastIndexOf(".")
        ? corpo.replace(/\./g, "").replace(",", ".")
        : corpo.replace(/,/g, "");
  } else if (temVirgula) {
    // Vírgula sozinha é decimal em português; como separador de milhar sempre
    // vem em grupos de três, esse caso também é tratado.
    normalizado = /^\d{1,3}(,\d{3})+$/.test(corpo)
      ? corpo.replace(/,/g, "")
      : corpo.replace(",", ".");
  } else if (temPonto) {
    normalizado = /^\d{1,3}(\.\d{3})+$/.test(corpo) ? corpo.replace(/\./g, "") : corpo;
  } else {
    normalizado = corpo;
  }

  const valor = Number(normalizado);
  if (!Number.isFinite(valor)) return null;
  return negativo ? -valor : valor;
}

/** As três partes de uma data, ainda sem decidir qual é dia e qual é mês. */
function partesDaData(bruto        )                                                             {
  const limpo = bruto.trim();
  if (!limpo) return null;

  const isoCompleto = limpo.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoCompleto) {
    return {
      a: Number(isoCompleto[3]),
      b: Number(isoCompleto[2]),
      ano: Number(isoCompleto[1]),
      iso: true,
    };
  }

  const separado = limpo.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (separado) {
    const ano = Number(separado[3]);
    return {
      a: Number(separado[1]),
      b: Number(separado[2]),
      // Ano de dois dígitos: 26 vira 2026. Planilha antiga com "99" viraria
      // 2099, mas histórico de rede social não vem do século passado.
      ano: ano < 100 ? 2000 + ano : ano,
      iso: false,
    };
  }
  return null;
}

/**
 * Decide se as datas do arquivo estão em dia/mês ou mês/dia.
 *
 * Olha o arquivo inteiro antes de converter qualquer linha: basta um dia acima
 * de 12 em qualquer lugar para a ordem ficar provada.
 */
function detectarOrdemDaData(valores          )              {
  let temIso = false;
  let primeiroPassaDe12 = false;
  let segundoPassaDe12 = false;

  for (const valor of valores) {
    const partes = partesDaData(valor);
    if (!partes) continue;
    if (partes.iso) {
      temIso = true;
      continue;
    }
    if (partes.a > 12) primeiroPassaDe12 = true;
    if (partes.b > 12) segundoPassaDe12 = true;
  }

  if (primeiroPassaDe12 && segundoPassaDe12) return "indefinida";
  if (primeiroPassaDe12) return "dia-mes";
  if (segundoPassaDe12) return "mes-dia";
  if (temIso) return "iso";
  // Nenhum número acima de 12 em nenhuma linha: não há como provar. O padrão
  // brasileiro é o palpite certo para o público deste produto, e a tela informa
  // que foi um palpite.
  return "dia-mes";
}

/** Converte para "AAAA-MM-DD" usando a ordem já decidida. */
function interpretarData(bruto        , ordem             )                {
  const partes = partesDaData(bruto);
  if (!partes) return null;

  const dia = partes.iso || ordem !== "mes-dia" ? partes.a : partes.b;
  const mes = partes.iso || ordem !== "mes-dia" ? partes.b : partes.a;

  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
  // Rejeita 31 de fevereiro em vez de deixar o Date "corrigir" para 3 de março.
  const data = new Date(Date.UTC(partes.ano, mes - 1, dia));
  if (data.getUTCMonth() !== mes - 1 || data.getUTCDate() !== dia) return null;

  return `${partes.ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

// --- Montagem do plano ------------------------------------------------------

const VALORES_ZERADOS                 = {
  followers: 0,
  organicReach: 0,
  paidReach: 0,
  organicImpressions: 0,
  paidImpressions: 0,
  organicEngagement: 0,
  paidEngagement: 0,
  adSpend: 0,
};

/**
 * Lê o arquivo e monta o que seria gravado, sem gravar.
 *
 * `diasExistentes` são os dias que a conta já tem, para o plano poder avisar
 * quantos serão reescritos. Sobrescrever é o comportamento certo — a planilha é
 * a fonte mais recente —, mas precisa ser dito antes, não descoberto depois.
 */
function montarPlano(texto        , diasExistentes           = [])        {
  const tabela = lerTabela(texto);

  if (tabela.length < 2) {
    return {
      colunas: [],
      linhas: [],
      camposPresentes: [],
      problemas: [{ linha: 1, mensagem: "O arquivo não tem cabeçalho e pelo menos uma linha." }],
      conflitos: [],
      ordemDaData: "indefinida",
      primeiroDia: null,
      ultimoDia: null,
      utilizavel: false,
    };
  }

  const [cabecalhos, ...corpo] = tabela;
  const colunas = cabecalhos.map((cabecalho) => ({
    cabecalho,
    campo: reconhecerColuna(cabecalho),
  }));

  const indiceDaData = colunas.findIndex((coluna) => coluna.campo === "date");
  const camposEncontrados = colunas
    .map((coluna) => coluna.campo)
    .filter((campo)                           => campo !== null && campo !== "date");

  const problemas             = [];

  if (indiceDaData === -1) {
    problemas.push({
      linha: 1,
      mensagem: `Nenhuma coluna de data encontrada. Renomeie a coluna para "Data". Colunas lidas: ${cabecalhos.join(", ")}`,
    });
  }
  if (camposEncontrados.length === 0) {
    problemas.push({
      linha: 1,
      mensagem: `Nenhuma coluna de número reconhecida. Aceitos: ${CAMPOS_IMPORTAVEIS.map((campo) => ROTULOS[campo]).join(", ")}.`,
    });
  }

  if (indiceDaData === -1 || camposEncontrados.length === 0) {
    return {
      colunas,
      linhas: [],
      camposPresentes: [],
      problemas,
      conflitos: [],
      ordemDaData: "indefinida",
      primeiroDia: null,
      ultimoDia: null,
      utilizavel: false,
    };
  }

  const ordemDaData = detectarOrdemDaData(corpo.map((linha) => linha[indiceDaData] ?? ""));
  if (ordemDaData === "indefinida") {
    problemas.push({
      linha: 1,
      mensagem:
        "As datas do arquivo se contradizem: umas parecem dia/mês e outras mês/dia. Converta a coluna para AAAA-MM-DD antes de importar.",
    });
    return {
      colunas,
      linhas: [],
      camposPresentes: [],
      problemas,
      conflitos: [],
      ordemDaData,
      primeiroDia: null,
      ultimoDia: null,
      utilizavel: false,
    };
  }

  // Por data, para a última ocorrência vencer quando o arquivo repete o dia.
  const porData = new Map                        ();

  corpo.forEach((celulas, indice) => {
    const numeroDaLinha = indice + 2;
    const brutoData = celulas[indiceDaData] ?? "";

    // Linha de total no fim da planilha: sem data e com números. Ignorar em
    // silêncio é melhor que acusar erro, porque o arquivo está certo.
    if (!brutoData.trim()) return;

    const date = interpretarData(brutoData, ordemDaData);
    if (!date) {
      problemas.push({
        linha: numeroDaLinha,
        mensagem: `Data não reconhecida: "${brutoData}".`,
      });
      return;
    }

    const valores                 = { ...VALORES_ZERADOS };
    let algumValor = false;

    colunas.forEach((coluna, posicao) => {
      if (!coluna.campo || coluna.campo === "date") return;
      const bruto = celulas[posicao] ?? "";
      // Célula vazia vira zero sem reclamar: planilha de rede social tem buraco
      // em coluna que a rede não reporta, e recusar o arquivo por isso seria
      // recusar quase todos.
      if (!bruto.trim()) return;

      const numero = interpretarNumero(bruto);
      if (numero === null) {
        problemas.push({
          linha: numeroDaLinha,
          mensagem: `"${bruto}" não é um número, na coluna ${coluna.cabecalho}.`,
        });
        return;
      }
      if (numero < 0) {
        problemas.push({
          linha: numeroDaLinha,
          mensagem: `Valor negativo em ${coluna.cabecalho}: ${bruto}.`,
        });
        return;
      }

      valores[coluna.campo] = coluna.campo === "adSpend" ? numero : Math.round(numero);
      algumValor = true;
    });

    if (!algumValor) return;
    porData.set(date, { linha: numeroDaLinha, date, valores });
  });

  const linhas = [...porData.values()].sort((a, b) => a.date.localeCompare(b.date));
  const existentes = new Set(diasExistentes);

  return {
    colunas,
    linhas,
    camposPresentes: [...new Set(camposEncontrados)],
    problemas,
    conflitos: linhas.map((linha) => linha.date).filter((date) => existentes.has(date)),
    ordemDaData,
    primeiroDia: linhas[0]?.date ?? null,
    ultimoDia: linhas[linhas.length - 1]?.date ?? null,
    utilizavel: linhas.length > 0,
  };
}

/**
 * Aplica o plano a uma série existente.
 *
 * Ganho e perda de seguidores são recalculados **do começo ao fim** depois de
 * inserir tudo, e não linha a linha. Aplicar dia a dia daria números errados no
 * meio: o dia importado enxergaria como anterior um dia que a própria
 * importação está prestes a substituir.
 */
function aplicarPlano(serie               , plano       )                {
  const porData = new Map(serie.map((dia) => [dia.date, { ...dia }]));

  for (const linha of plano.linhas) {
    const base              = porData.get(linha.date) ?? {
      date: linha.date,
      followers: 0,
      followersGained: 0,
      followersLost: 0,
      organicReach: 0,
      paidReach: 0,
      organicImpressions: 0,
      paidImpressions: 0,
      organicEngagement: 0,
      paidEngagement: 0,
      adSpend: 0,
    };

    // Só os campos que vieram no arquivo são tocados. Ver a nota em
    // `camposPresentes`: escrever os oito sempre apagaria o que a planilha não
    // mencionou.
    for (const campo of plano.camposPresentes) {
      base[campo] = linha.valores[campo];
    }

    porData.set(linha.date, base);
  }

  const ordenada = [...porData.values()].sort((a, b) => a.date.localeCompare(b.date));

  for (let i = 0; i < ordenada.length; i += 1) {
    const anterior = ordenada[i - 1];
    const diferenca = anterior ? ordenada[i].followers - anterior.followers : 0;
    ordenada[i].followersGained = diferenca > 0 ? diferenca : 0;
    ordenada[i].followersLost = diferenca < 0 ? -diferenca : 0;
  }

  return ordenada;
}

/** Uma frase sobre o que vai acontecer, para a tela de conferência. */
function resumirPlano(plano       )         {
  if (!plano.utilizavel) return "Nada a importar.";

  const novos = plano.linhas.length - plano.conflitos.length;
  const partes = [`${plano.linhas.length} dia(s) no arquivo`];
  if (novos > 0) partes.push(`${novos} novo(s)`);
  if (plano.conflitos.length > 0)
    partes.push(`${plano.conflitos.length} que já existe(m) e será(ão) reescrito(s)`);

  return `${partes.join(", ")}. Período de ${plano.primeiroDia} a ${plano.ultimoDia}.`;
}

  return { CAMPOS_IMPORTAVEIS, ROTULOS, detectarSeparador, lerTabela, normalizar, reconhecerColuna, interpretarNumero, detectarOrdemDaData, interpretarData, montarPlano, aplicarPlano, resumirPlano };
  })();
  __KS['instagram-csv'] = (() => {
const { instanteNaZona } = __KS['fuso'];
                                             

/**
 * Leitura da exportação de conteúdo do Instagram.
 *
 * É o arquivo que sai de Insights → Conteúdo → Exportar dados: uma linha por
 * publicação, com alcance, visualizações e interações acumuladas.
 *
 * Duas armadilhas deste formato, e as duas foram confirmadas contra a exportação
 * real da campanha de agosto de 2026:
 *
 * **A data vem em MM/DD/AAAA.** `08/03/2026` é 3 de agosto, não 8 de março. Ler
 * como dia/mês não quebra nada — produz um arquivo que importa em silêncio com
 * metade das publicações no mês errado, e ninguém descobre até o relatório sair
 * com um buraco.
 *
 * **O horário não é o da campanha.** O relatório traz a hora no fuso da conta de
 * negócios, que a Meta emite em horário do Pacífico. Na exportação de agosto, a
 * publicação de abertura aparece como `08/15 22:31` e o próprio Instagram mostra
 * `16/08 02:31` — exatamente quatro horas de diferença, que é o que separa
 * `America/Los_Angeles` de `America/Sao_Paulo` em agosto. Quatro horas mudam o
 * dia da semana e o bloco do dia; ler o arquivo como hora local jogaria toda a
 * análise de horário para o lado errado.
 *
 * Por isso este módulo **nunca devolve só um horário**. Devolve os quatro:
 * o texto original, o fuso da fonte, o fuso da campanha e o instante
 * normalizado. Guardar os quatro é o que permite reconferir depois, quando
 * alguém desconfiar do número — e alguém vai desconfiar.
 *
 * Módulo puro.
 */

/** O fuso em que a Meta emite os relatórios de conta de negócios. */
const FUSO_PADRAO_DO_RELATORIO = "America/Los_Angeles";

/** O fuso da campanha, quando ninguém informa outro. */
const FUSO_PADRAO_DA_CAMPANHA = "America/Sao_Paulo";

/**
 * Como cada tipo do arquivo vira formato da plataforma.
 *
 * O nome no arquivo é do produto, não do domínio: "Reel do Instagram" é vídeo
 * vertical, e é isso que a análise por formato precisa saber. O mapa é explícito
 * — um tipo novo que a Meta invente cai em `null` e vira um problema relatado,
 * em vez de virar `imagem` por descuido do `??`.
 */
const FORMATO_DO_TIPO                             = {
  "reel do instagram": "video",
  "vídeo do instagram": "video",
  "video do instagram": "video",
  "imagem do instagram": "imagem",
  "foto do instagram": "imagem",
  "carrossel do instagram": "carrossel",
  "story do instagram": "story",
  "stories do instagram": "story",
};

/** Uma publicação lida do arquivo, com a procedência do horário preservada. */
                                   
                                                                            
                    
                       
                  
                  
                      
                                                                 
                        
                                                          
                          
               

                                                                               
                                                             
                          
                                                
                      
                                           
                         
                                                                        
                      
                                                             
                           
                                                                              
                            

                                                                                
                        
                  
                   
                      
                            
                      
                           
  

                                    
                                                         
                
                 
  

                                  
                                     
                                    
                                                                                    
                    
                      
                         
  

                               
                                                                
                       
                                     
                          
  

// --- CSV ---------------------------------------------------------------------

/**
 * Divide o CSV respeitando aspas e quebras de linha dentro de campo.
 *
 * A legenda de uma publicação tem vírgulas, aspas e parágrafos — separar por
 * `split(",")` embaralharia as colunas na primeira legenda de verdade. Este
 * arquivo é lido caractere a caractere porque é o único jeito de acertar.
 */
function lerCsv(texto        )             {
  const linhas             = [];
  let campo = "";
  let atual           = [];
  let entreAspas = false;

  // O BOM que o Excel e a Meta escrevem no início viraria parte do primeiro
  // nome de coluna, e o cabeçalho deixaria de casar.
  const limpo = texto.replace(/^﻿/, "");

  for (let i = 0; i < limpo.length; i += 1) {
    const c = limpo[i];

    if (entreAspas) {
      if (c === '"') {
        // Aspas dobradas dentro do campo representam uma aspa literal.
        if (limpo[i + 1] === '"') {
          campo += '"';
          i += 1;
        } else {
          entreAspas = false;
        }
      } else {
        campo += c;
      }
      continue;
    }

    if (c === '"') {
      entreAspas = true;
    } else if (c === ",") {
      atual.push(campo);
      campo = "";
    } else if (c === "\n") {
      atual.push(campo);
      linhas.push(atual);
      atual = [];
      campo = "";
    } else if (c !== "\r") {
      campo += c;
    }
  }

  if (campo.length > 0 || atual.length > 0) {
    atual.push(campo);
    linhas.push(atual);
  }

  return linhas.filter((linha) => linha.some((valor) => valor.trim().length > 0));
}

// --- Reconhecimento de colunas ----------------------------------------------

function normalizar(texto        )         {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/**
 * Os nomes que cada campo pode ter no arquivo.
 *
 * A Meta muda os rótulos entre idiomas e entre versões do painel. Uma lista
 * explícita de sinônimos é auditável e falha de forma clara; adivinhar por
 * posição da coluna quebra silenciosamente na primeira reordenação.
 */
const SINONIMOS                           = {
  idExterno: ["identificacao do post", "post id", "id da publicacao"],
  contaExterna: ["identificacao da conta", "account id"],
  usuario: ["nome de usuario da conta", "account username", "username"],
  legenda: ["descricao", "description", "legenda", "caption"],
  duracao: ["duracao (s)", "duration (s)", "duracao"],
  horario: ["horario de publicacao", "publish time", "data de publicacao"],
  link: ["link permanente", "permalink"],
  tipo: ["tipo de post", "post type"],
  visualizacoes: ["visualizacoes", "views", "impressoes"],
  alcance: ["alcance", "reach"],
  curtidas: ["curtidas", "likes"],
  compartilhamentos: ["compartilhamentos", "shares"],
  seguidores: ["seguimentos", "follows", "seguidores"],
  comentarios: ["comentarios", "comments"],
  salvamentos: ["salvamentos", "saves", "salvos"],
};

function mapearColunas(cabecalho          )                         {
  const indices                         = {};

  cabecalho.forEach((nome, indice) => {
    const limpo = normalizar(nome);
    for (const [campo, nomes] of Object.entries(SINONIMOS)) {
      if (indices[campo] === undefined && nomes.includes(limpo)) indices[campo] = indice;
    }
  });

  return indices;
}

function inteiro(bruto                    )         {
  if (!bruto) return 0;
  // Milhar com ponto e decimal com vírgula aparecem na exportação em português.
  const numero = Number(
    bruto
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.-]/g, ""),
  );
  return Number.isFinite(numero) ? Math.round(numero) : 0;
}

// --- Horário -----------------------------------------------------------------

                                  
                      
                           
                            
  

/**
 * Interpreta o horário do arquivo e o traz para o fuso da campanha.
 *
 * O formato é `MM/DD/AAAA HH:MM`, na ordem americana. A checagem é explícita: um
 * primeiro número acima de doze só pode ser dia, e aí o arquivo não está no
 * formato esperado — dizer isso é melhor do que aceitar e errar o mês.
 */
function normalizarHorario(
  bruto        ,
  fusoDaFonte        ,
  fusoDaCampanha        ,
)                            {
  const partes = /^(\d{1,2})\/(\d{1,2})\/(\d{4})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(
    bruto.trim(),
  );
  if (!partes) return null;

  const [, mes, dia, ano, hora, minuto, segundo] = partes.map(Number);
  if (mes > 12 || dia > 31 || hora > 23 || minuto > 59) return null;

  const instante = instanteNaZona(ano, mes, dia, hora, minuto, segundo || 0, fusoDaFonte);
  const naCampanha = instanteNaZona(ano, mes, dia, hora, minuto, segundo || 0, fusoDaCampanha);

  return {
    publicadoEm: new Date(instante).toISOString(),
    publicadoEmLocal: horarioDeParede(instante, fusoDaCampanha),
    // Quantas horas somar ao horário escrito no arquivo para chegar ao horário
    // da campanha. Positivo quando o relatório está atrasado — o caso do
    // relatório do Pacífico lido em São Paulo, que dá +4h em agosto.
    deslocamentoHoras: Math.round((instante - naCampanha) / 3_600_000),
  };
}

/** O horário de parede num fuso, no formato que uma pessoa daqui escreveria. */
function horarioDeParede(instante        , fuso        )         {
  const formatador = new Intl.DateTimeFormat("pt-BR", {
    timeZone: fuso,
    hour12: false,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const partes = Object.fromEntries(
    formatador.formatToParts(new Date(instante)).map((parte) => [parte.type, parte.value]),
  );

  // Meia-noite volta como "24" em algumas versões do ICU.
  const hora = String(Number(partes.hour) % 24).padStart(2, "0");
  return `${partes.day}/${partes.month}/${partes.year} ${hora}:${partes.minute}`;
}

// --- Leitura ------------------------------------------------------------------

function lerExportacaoDoInstagram(
  texto        ,
  {
    fusoDaFonte = FUSO_PADRAO_DO_RELATORIO,
    fusoDaCampanha = FUSO_PADRAO_DA_CAMPANHA,
  }                  = {},
)                     {
  const linhas = lerCsv(texto);
  const problemas                         = [];

  if (linhas.length < 2) {
    return {
      publicacoes: [],
      problemas: [{ linha: 1, motivo: "O arquivo não tem cabeçalho e nenhuma linha de dados." }],
      colunas: linhas[0] ?? [],
      fusoDaFonte,
      fusoDaCampanha,
    };
  }

  const cabecalho = linhas[0];
  const coluna = mapearColunas(cabecalho);

  for (const obrigatoria of ["horario", "tipo", "alcance"]) {
    if (coluna[obrigatoria] === undefined) {
      problemas.push({
        linha: 1,
        motivo: `Não achei a coluna de ${obrigatoria === "horario" ? "horário de publicação" : obrigatoria} — sem ela não dá para importar.`,
      });
    }
  }
  if (problemas.length > 0) {
    return { publicacoes: [], problemas, colunas: cabecalho, fusoDaFonte, fusoDaCampanha };
  }

  const publicacoes                        = [];
  const vistos = new Set        ();

  linhas.slice(1).forEach((linha, indice) => {
    const numeroDaLinha = indice + 2;
    const em = (campo        ) =>
      coluna[campo] === undefined ? undefined : linha[coluna[campo]]?.trim();

    const tipoNoArquivo = em("tipo") ?? "";
    const formato = FORMATO_DO_TIPO[normalizar(tipoNoArquivo)];
    if (!formato) {
      problemas.push({
        linha: numeroDaLinha,
        motivo: `Tipo de post desconhecido: "${tipoNoArquivo}".`,
      });
      return;
    }

    const bruto = em("horario") ?? "";
    const horario = normalizarHorario(bruto, fusoDaFonte, fusoDaCampanha);
    if (!horario) {
      problemas.push({
        linha: numeroDaLinha,
        motivo: `Horário fora do formato MM/DD/AAAA HH:MM: "${bruto}".`,
      });
      return;
    }

    const idExterno = em("idExterno") ?? `${bruto}-${indice}`;
    if (vistos.has(idExterno)) {
      // Reexportar períodos que se sobrepõem é o normal; a linha repetida é
      // ignorada em silêncio porque não é erro de ninguém.
      return;
    }
    vistos.add(idExterno);

    publicacoes.push({
      idExterno,
      contaExterna: em("contaExterna") ?? "",
      usuario: em("usuario") ?? "",
      legenda: em("legenda") ?? "",
      formato,
      tipoNoArquivo,
      duracaoSegundos: inteiro(em("duracao")),
      link: em("link") ?? "",
      horarioDeOrigem: bruto,
      fusoDaFonte,
      fusoDaCampanha,
      publicadoEm: horario.publicadoEm,
      publicadoEmLocal: horario.publicadoEmLocal,
      deslocamentoHoras: horario.deslocamentoHoras,
      visualizacoes: inteiro(em("visualizacoes")),
      alcance: inteiro(em("alcance")),
      curtidas: inteiro(em("curtidas")),
      comentarios: inteiro(em("comentarios")),
      compartilhamentos: inteiro(em("compartilhamentos")),
      salvamentos: inteiro(em("salvamentos")),
      seguidoresGanhos: inteiro(em("seguidores")),
    });
  });

  return {
    publicacoes: publicacoes.sort((a, b) => a.publicadoEm.localeCompare(b.publicadoEm)),
    problemas,
    colunas: cabecalho,
    fusoDaFonte,
    fusoDaCampanha,
  };
}

// --- O que a leitura soma ----------------------------------------------------

                                  
                      
                        
                  
                   
                      
                            
                      
                           
                                                                  
                     
                                                  
                          
                                            
                                 
                                    
                                  
  

/**
 * Os totais do que foi importado.
 *
 * "Interação" aqui é a soma de curtidas, comentários, compartilhamentos e
 * salvamentos — a definição precisa estar escrita em um lugar só, porque é ela
 * que sustenta a taxa, e duas definições de taxa na mesma plataforma são duas
 * conversas diferentes sobre o mesmo número.
 */
function totalizar(publicacoes                       )                     {
  const soma = (campo                           ) =>
    publicacoes.reduce((total, peca) => total + (peca[campo]          ), 0);

  const alcance = soma("alcance");
  const interacoes =
    soma("curtidas") + soma("comentarios") + soma("compartilhamentos") + soma("salvamentos");
  const ordenadas = [...publicacoes].sort((a, b) => a.publicadoEm.localeCompare(b.publicadoEm));

  return {
    publicacoes: publicacoes.length,
    visualizacoes: soma("visualizacoes"),
    alcance,
    curtidas: soma("curtidas"),
    comentarios: soma("comentarios"),
    compartilhamentos: soma("compartilhamentos"),
    salvamentos: soma("salvamentos"),
    seguidoresGanhos: soma("seguidoresGanhos"),
    interacoes,
    taxaDeInteracao: alcance > 0 ? (interacoes / alcance) * 100 : 0,
    visualizacoesPorPessoa: alcance > 0 ? soma("visualizacoes") / alcance : 0,
    primeiraPublicacao: ordenadas[0]?.publicadoEm ?? null,
    ultimaPublicacao: ordenadas[ordenadas.length - 1]?.publicadoEm ?? null,
  };
}

  return { FUSO_PADRAO_DO_RELATORIO, FUSO_PADRAO_DA_CAMPANHA, lerCsv, normalizarHorario, horarioDeParede, lerExportacaoDoInstagram, totalizar };
  })();
  __KS['localidades'] = (() => {
                                        

/**
 * Onde a campanha chegou — por cidade, por estado e por região, no Brasil todo.
 *
 * Substitui o mapa do estado de São Paulo. A troca não é só visual: o mapa
 * dependia da tabela de municípios paulistas para existir, e **descartava em
 * silêncio toda cidade fora dela**. Rodando no Brasil inteiro, isso significaria
 * alcance em Salvador, Recife ou Belém simplesmente desaparecendo da tela — sem
 * erro, sem aviso, com o total do painel continuando certo e a lista de cidades
 * não fechando com ele.
 *
 * Aqui a regra é outra: **nada do que a rede informou é descartado.** O que a
 * rede escreveu vira uma linha, mesmo que a plataforma não reconheça o lugar.
 *
 * O estado e a região saem do próprio texto quando ele vem completo ("Salvador,
 * BA" ou "Salvador, Bahia"). Quando vem só o nome da cidade, quem chama pode
 * passar um `deduzirUf` — uma lista de municípios conhecidos, por exemplo — e o
 * resultado sai marcado com `ufInferida`, porque "Rio Claro" existe em São Paulo
 * e no Rio de Janeiro e um palpite silencioso colocaria entrega no estado errado.
 * Sem dedução possível, fica sem estado e a tela diz "não identificada" em vez de
 * inventar.
 *
 * A dedução é injetada e não importada de propósito: a tabela de municípios é de
 * um estado só, e um módulo nacional que depende dela não se leva para outro
 * projeto sem arrastar 645 linhas que não servem.
 *
 * Módulo puro.
 */

                                                                               

const NOME_DA_REGIAO                         = {
  norte: "Norte",
  nordeste: "Nordeste",
  "centro-oeste": "Centro-Oeste",
  sudeste: "Sudeste",
  sul: "Sul",
};

/** Ordem de exibição: a mesma que o IBGE usa, de norte para sul. */
const REGIOES           = ["norte", "nordeste", "centro-oeste", "sudeste", "sul"];

const UF_PARA_REGIAO                         = {
  AC: "norte",
  AP: "norte",
  AM: "norte",
  PA: "norte",
  RO: "norte",
  RR: "norte",
  TO: "norte",
  AL: "nordeste",
  BA: "nordeste",
  CE: "nordeste",
  MA: "nordeste",
  PB: "nordeste",
  PE: "nordeste",
  PI: "nordeste",
  RN: "nordeste",
  SE: "nordeste",
  DF: "centro-oeste",
  GO: "centro-oeste",
  MT: "centro-oeste",
  MS: "centro-oeste",
  ES: "sudeste",
  MG: "sudeste",
  RJ: "sudeste",
  SP: "sudeste",
  PR: "sul",
  RS: "sul",
  SC: "sul",
};

const NOME_DA_UF                         = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins",
};

/** Acentos fora, minúsculas, espaços encolhidos. */
function normalizar(texto        )         {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const UF_POR_NOME = new Map(
  Object.entries(NOME_DA_UF).map(([uf, nome]) => [normalizar(nome), uf]),
);

/** Sigla da UF a partir de "BA" ou "Bahia". Devolve `null` se não for estado. */
function ufDoTexto(texto        )                {
  const limpo = texto.trim();
  const sigla = limpo.toUpperCase();
  if (sigla.length === 2 && UF_PARA_REGIAO[sigla]) return sigla;
  return UF_POR_NOME.get(normalizar(limpo)) ?? null;
}

                         
                                                      
                 
                    
                        
     
                                                                                
                          
    
                                                                                
                                                                  
     
                      
  

/**
 * Quem sabe dizer o estado de uma cidade cujo nome veio sozinho.
 *
 * Recebe o nome e devolve a sigla, ou `null` quando não reconhece. O resultado
 * entra marcado como dedução, nunca como informação da rede.
 */
                                                            

/**
 * Lê o que a rede escreveu no campo de localidade.
 *
 * A Meta devolve coisas como "Salvador, Bahia, Brazil", "São Paulo, SP" ou só
 * "Guarulhos", dependendo do relatório e do nível de agregação. O separador pode
 * ser vírgula ou hífen. "Brazil"/"Brasil" no fim é ruído e sai.
 */
function lerLocal(texto        , deduzirUf              )            {
  const partes = texto
    .split(/[,–—]|\s-\s/)
    .map((parte) => parte.trim())
    .filter((parte) => parte.length > 0 && !["brasil", "brazil", "br"].includes(normalizar(parte)));

  if (partes.length === 0) {
    return { cidade: texto.trim(), uf: null, regiao: null, ufInferida: false };
  }

  const cidade = partes[0];

  // O estado pode vir em qualquer posição depois da cidade: "Cidade, Região
  // Metropolitana, SP" acontece.
  for (const parte of partes.slice(1)) {
    const uf = ufDoTexto(parte);
    if (uf) return { cidade, uf, regiao: UF_PARA_REGIAO[uf], ufInferida: false };
  }

  // Veio só um pedaço e ele é um estado: o relatório agregou por UF, não por
  // cidade. A "cidade" é o próprio estado, e dizer isso é melhor que listar
  // "Bahia" como se fosse um município.
  if (partes.length === 1) {
    const uf = ufDoTexto(cidade);
    if (uf) {
      return { cidade: NOME_DA_UF[uf], uf, regiao: UF_PARA_REGIAO[uf], ufInferida: false };
    }
  }

  // Último recurso, e marcado como dedução: quem chamou reconhece a cidade.
  const deduzida = deduzirUf?.(cidade) ?? null;
  if (deduzida && UF_PARA_REGIAO[deduzida]) {
    return { cidade, uf: deduzida, regiao: UF_PARA_REGIAO[deduzida], ufInferida: true };
  }

  return { cidade, uf: null, regiao: null, ufInferida: false };
}

                                          
                                                                                       
                
                  
                    
                                                 
                        
     
                                                                               
    
                                                                            
                                                                             
                
     
                    
                                            
                
                             
  

/**
 * Cruza os impulsionamentos numa linha por localidade, da maior para a menor.
 *
 * Dois caminhos, como antes. Com a quebra por região que a rede devolve
 * (`porLocal`), cada cidade recebe o que de fato aconteceu nela. Sem ela, só
 * existe o total da campanha e a lista de lugares segmentados, e a divisão igual
 * é a única repartição possível — quase certamente errada, porque uma capital
 * não recebe o mesmo que uma cidade de treze mil habitantes. Por isso o
 * resultado sai marcado como estimado.
 */
function alcancePorLocal(
  impulsionamentos         ,
  deduzirUf              ,
)                   {
  const acumulado = new Map 
           
                                                                                                
   ();

  const guardar = (
    local        ,
    alcance        ,
    investido        ,
    postId        ,
    medido         ,
  ) => {
    // A chave é normalizada para "Campinas, SP" e "campinas, sp" virarem uma
    // linha só; o rótulo exibido é a primeira grafia que apareceu.
    const chave = normalizar(local);
    const atual = acumulado.get(chave) ?? {
      local: local.trim(),
      alcance: 0,
      investido: 0,
      posts: new Set        (),
      estimado: false,
    };
    atual.alcance += alcance;
    atual.investido += investido;
    atual.posts.add(postId);
    if (!medido) atual.estimado = true;
    acumulado.set(chave, atual);
  };

  for (const boost of impulsionamentos) {
    const quebra = boost.results.porLocal ?? [];
    if (quebra.length > 0) {
      for (const linha of quebra) {
        guardar(linha.local, linha.reach, linha.spend, boost.postId, true);
      }
      continue;
    }

    const lugares = boost.audience.locations.filter((local) => local.trim().length > 0);
    if (lugares.length === 0) continue;
    const fatia = 1 / lugares.length;

    for (const local of lugares) {
      guardar(
        local,
        boost.results.reach * fatia,
        boost.results.spend * fatia,
        boost.postId,
        false,
      );
    }
  }

  const total = [...acumulado.values()].reduce((soma, item) => soma + item.alcance, 0);

  return [...acumulado.values()]
    .map((item) => {
      const alcance = Math.round(item.alcance);
      const investido = Math.round(item.investido * 100) / 100;
      return {
        ...lerLocal(item.local, deduzirUf),
        local: item.local,
        alcance,
        investido,
        publicacoes: [...item.posts],
        estimado: item.estimado,
        fatia: total > 0 ? (item.alcance / total) * 100 : 0,
        custoPorMil: alcance > 0 ? (investido / alcance) * 1000 : null,
      };
    })
    .sort((a, b) => b.alcance - a.alcance);
}

                             
                                   
               
                  
                    
                                                          
                 
                                            
                
                             
                                                                         
                    
  

function agrupar(
  locais                  ,
  chave                                   ,
  nome                           ,
)                                        {
  const total = locais.reduce((soma, local) => soma + local.alcance, 0);
  const mapa = new Map                          ();

  for (const local of locais) {
    const k = chave(local);
    mapa.set(k, [...(mapa.get(k) ?? []), local]);
  }

  return [...mapa.entries()]
    .map(([k, itens]) => {
      const alcance = itens.reduce((soma, item) => soma + item.alcance, 0);
      const investido = Math.round(itens.reduce((soma, item) => soma + item.investido, 0) * 100) / 100;
      return {
        chave: k,
        nome: nome(k),
        alcance,
        investido,
        locais: itens.length,
        fatia: total > 0 ? (alcance / total) * 100 : 0,
        custoPorMil: alcance > 0 ? (investido / alcance) * 1000 : null,
        estimado: itens.some((item) => item.estimado),
      };
    })
    .sort((a, b) => b.alcance - a.alcance);
}

/** Chave usada quando a plataforma não sabe de onde é a entrega. */
const SEM_REGIAO = "nao-identificada";

function alcancePorRegiao(locais                  )                                        {
  return agrupar(
    locais,
    (local) => local.regiao ?? SEM_REGIAO,
    (chave) => (chave === SEM_REGIAO ? "Não identificada" : NOME_DA_REGIAO[chave          ]),
  );
}

function alcancePorUf(locais                  )                                        {
  return agrupar(
    locais,
    (local) => local.uf ?? SEM_REGIAO,
    (chave) => (chave === SEM_REGIAO ? "Não identificado" : `${NOME_DA_UF[chave]} (${chave})`),
  );
}

                                  
                 
                  
                  
                  
                  
                    
                             
                                                                                    
                  
                    
                                                                       
                    
  

function totalizarLocalidades(locais                  )                     {
  const alcance = locais.reduce((soma, local) => soma + local.alcance, 0);
  const investido = Math.round(locais.reduce((soma, local) => soma + local.investido, 0) * 100) / 100;

  return {
    locais: locais.length,
    cidades: new Set(locais.map((local) => normalizar(local.cidade))).size,
    estados: new Set(locais.map((local) => local.uf).filter(Boolean)).size,
    regioes: new Set(locais.map((local) => local.regiao).filter(Boolean)).size,
    alcance,
    investido,
    custoPorMil: alcance > 0 ? (investido / alcance) * 1000 : null,
    medidas: locais.filter((local) => !local.estimado).length,
    estimadas: locais.filter((local) => local.estimado).length,
    semEstado: locais.filter((local) => local.uf === null).length,
  };
}

/** Filtra por região, aceitando `null` para "todas". */
function locaisDaRegiao(
  locais                  ,
  regiao                                   ,
)                   {
  if (regiao === null) return locais;
  if (regiao === SEM_REGIAO) return locais.filter((local) => local.regiao === null);
  return locais.filter((local) => local.regiao === regiao);
}

/** Busca por nome de cidade ou estado, sem acento e sem caixa. */
function buscarLocais(locais                  , termo        )                   {
  const busca = normalizar(termo);
  if (busca.length === 0) return locais;
  return locais.filter((local) => {
    const estado = local.uf ? `${local.uf} ${NOME_DA_UF[local.uf] ?? ""}` : "";
    return normalizar(`${local.local} ${local.cidade} ${estado}`).includes(busca);
  });
}

  return { NOME_DA_REGIAO, REGIOES, UF_PARA_REGIAO, NOME_DA_UF, ufDoTexto, lerLocal, alcancePorLocal, SEM_REGIAO, alcancePorRegiao, alcancePorUf, totalizarLocalidades, locaisDaRegiao, buscarLocais };
  })();
  __KS['networks'] = (() => {
                                                                                                     

/**
 * Capacidades e limites de cada rede. A plataforma valida o conteúdo contra
 * estes limites *antes* de publicar (PRD 3.3, regra de negócio) e usa as
 * flags de capacidade para habilitar/desabilitar módulos por conta.
 *
 * Os valores refletem os limites públicos das APIs oficiais na data do PRD;
 * ao adicionar uma nova rede basta acrescentar uma entrada aqui — nenhum
 * outro módulo precisa mudar (PRD 5, Escalabilidade).
 */
                                   
                
                
                                                
                
                   
                        
                           
                                         
                                                                       
                               
                                           
                                                        
                         
                                              
                                  
                            
                                                       
                                    
                                                     
               
  

/**
 * A mídia com que cada formato nasce.
 *
 * Não é palpite estético: é o que passa na validação da maioria das redes sem
 * ajuste nenhum. Serve a dois lugares — o editor, quando alguém troca o formato
 * no meio da escrita, e o servidor, quando uma pauta da agenda finalmente
 * decide o que vai ser. Os dois precisam concordar, senão a mesma escolha
 * produz peças diferentes dependendo de onde foi feita.
 */
const MIDIA_PADRAO                                       = {
  imagem: { count: 1, aspectRatio: "4:5", fileSizeMb: 2 },
  carrossel: { count: 3, aspectRatio: "4:5", fileSizeMb: 4.5 },
  video: { count: 1, aspectRatio: "9:16", fileSizeMb: 45, durationSeconds: 30 },
  story: { count: 1, aspectRatio: "9:16", fileSizeMb: 2.5 },
};

const NETWORKS                                         = {
  instagram: {
    id: "instagram",
    label: "Instagram",
    color: "oklch(0.65 0.22 5)",
    gradient: "linear-gradient(135deg, oklch(0.72 0.2 60), oklch(0.55 0.25 350))",
    formats: ["imagem", "carrossel", "video", "story"],
    captionMaxLength: 2200,
    carousel: { min: 2, max: 10 },
    video: { minSeconds: 3, maxSeconds: 900, maxFileMb: 1024 },
    image: { maxFileMb: 8 },
    aspectRatios: ["1:1", "4:5", "9:16"],
    supportsBoost: true,
    supportsDirectMessages: true,
    supportsComments: true,
    supportsAudienceInsights: true,
    phase: 1,
  },
  facebook: {
    id: "facebook",
    label: "Facebook",
    color: "oklch(0.58 0.18 258)",
    gradient: "linear-gradient(135deg, oklch(0.6 0.19 258), oklch(0.4 0.16 265))",
    formats: ["imagem", "carrossel", "video", "story"],
    captionMaxLength: 63206,
    carousel: { min: 2, max: 10 },
    video: { minSeconds: 1, maxSeconds: 14400, maxFileMb: 4096 },
    image: { maxFileMb: 10 },
    aspectRatios: ["1:1", "4:5", "9:16", "16:9"],
    supportsBoost: true,
    supportsDirectMessages: true,
    supportsComments: true,
    supportsAudienceInsights: true,
    phase: 1,
  },
  tiktok: {
    id: "tiktok",
    label: "TikTok",
    color: "oklch(0.78 0.16 190)",
    gradient: "linear-gradient(135deg, oklch(0.8 0.16 190), oklch(0.55 0.2 350))",
    formats: ["imagem", "carrossel", "video"],
    captionMaxLength: 2200,
    carousel: { min: 2, max: 35 },
    video: { minSeconds: 3, maxSeconds: 600, maxFileMb: 4096 },
    image: { maxFileMb: 20 },
    aspectRatios: ["9:16", "1:1"],
    supportsBoost: false,
    supportsDirectMessages: false,
    supportsComments: true,
    supportsAudienceInsights: false,
    phase: 4,
  },
  youtube: {
    id: "youtube",
    label: "YouTube",
    color: "oklch(0.62 0.23 25)",
    gradient: "linear-gradient(135deg, oklch(0.65 0.24 25), oklch(0.42 0.2 20))",
    formats: ["video"],
    captionMaxLength: 5000,
    carousel: { min: 0, max: 0 },
    video: { minSeconds: 1, maxSeconds: 43200, maxFileMb: 128000 },
    image: { maxFileMb: 2 },
    aspectRatios: ["16:9", "9:16"],
    supportsBoost: false,
    supportsDirectMessages: false,
    supportsComments: true,
    supportsAudienceInsights: false,
    phase: 4,
  },
  /**
   * Threads é a sexta rede, e a escolha tem um motivo prático.
   *
   * Ela é da Meta: entra pela mesma autorização que Instagram e Facebook já
   * exigem, sem aplicativo novo para aprovar e sem custo de API. O X cobra
   * assinatura para publicar por API, e seria a única rede da lista com conta a
   * pagar — trocar um pelo outro aqui é mudar um bloco deste arquivo.
   *
   * Não aceita story nem impulsionamento próprio, e a API não devolve perfil de
   * público. A plataforma já sabe lidar com isso: o cartão aparece sem
   * investimento e a tela de Público explica a ausência.
   */
  threads: {
    id: "threads",
    label: "Threads",
    color: "oklch(0.35 0.02 260)",
    gradient: "linear-gradient(135deg, oklch(0.45 0.03 260), oklch(0.2 0.02 265))",
    formats: ["imagem", "carrossel", "video"],
    captionMaxLength: 500,
    carousel: { min: 2, max: 20 },
    video: { minSeconds: 1, maxSeconds: 300, maxFileMb: 1024 },
    image: { maxFileMb: 8 },
    aspectRatios: ["1:1", "4:5", "9:16"],
    supportsBoost: false,
    supportsDirectMessages: false,
    supportsComments: true,
    supportsAudienceInsights: false,
    phase: 4,
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    color: "oklch(0.62 0.13 240)",
    gradient: "linear-gradient(135deg, oklch(0.66 0.13 240), oklch(0.42 0.12 250))",
    formats: ["imagem", "carrossel", "video"],
    captionMaxLength: 3000,
    carousel: { min: 2, max: 20 },
    video: { minSeconds: 3, maxSeconds: 900, maxFileMb: 500 },
    image: { maxFileMb: 10 },
    aspectRatios: ["1:1", "4:5", "16:9"],
    supportsBoost: false,
    supportsDirectMessages: true,
    supportsComments: true,
    supportsAudienceInsights: false,
    phase: 4,
  },
};

const NETWORK_IDS = Object.keys(NETWORKS)               ;

                               
                    
                       
                             
                  
  

                              
                     
                  
                   
  

/**
 * Valida um rascunho contra os limites de cada conta de destino.
 * Erros bloqueiam a publicação; avisos apenas alertam o usuário.
 */
function validateDraft(draft                , accounts                 )                    {
  const issues                    = [];

  for (const account of accounts) {
    const net = NETWORKS[account.networkId];
    const push = (severity                             , message        ) =>
      issues.push({ accountId: account.id, networkId: account.networkId, severity, message });

    if (account.status !== "ativa") {
      push(
        "erro",
        `A conexão com ${net.label} está ${statusLabel(account.status)}. Reconecte a conta antes de publicar.`,
      );
    }

    if (!net.formats.includes(draft.format)) {
      push("erro", `${net.label} não aceita o formato ${draft.format}.`);
    }

    if (draft.caption.length > net.captionMaxLength) {
      push(
        "erro",
        `Legenda com ${draft.caption.length} caracteres excede o limite de ${net.captionMaxLength} do ${net.label}.`,
      );
    }

    if (!net.aspectRatios.includes(draft.media.aspectRatio)) {
      push(
        "erro",
        `Proporção ${draft.media.aspectRatio} não é suportada pelo ${net.label} (aceita ${net.aspectRatios.join(", ")}).`,
      );
    }

    if (draft.format === "story") {
      // Story fora de 9:16 é publicado com barras, o que na prática significa
      // recortado ou com faixa preta — a rede aceita, e quem vê estranha.
      if (draft.media.aspectRatio !== "9:16") {
        push(
          "aviso",
          `Story em ${draft.media.aspectRatio} aparece com bordas no ${net.label}; 9:16 ocupa a tela inteira.`,
        );
      }
      push(
        "aviso",
        `Story expira em 24 horas no ${net.label}. Depois disso os números param de crescer e a peça sai do ar.`,
      );
    }

    if (draft.format === "carrossel") {
      if (draft.media.count < net.carousel.min) {
        push("erro", `Carrossel no ${net.label} precisa de pelo menos ${net.carousel.min} itens.`);
      }
      if (draft.media.count > net.carousel.max) {
        push("erro", `Carrossel no ${net.label} aceita no máximo ${net.carousel.max} itens.`);
      }
    }

    if (draft.format === "video") {
      const duration = draft.media.durationSeconds ?? 0;
      if (duration < net.video.minSeconds) {
        push("erro", `Vídeo precisa de pelo menos ${net.video.minSeconds}s no ${net.label}.`);
      }
      if (duration > net.video.maxSeconds) {
        push(
          "erro",
          `Vídeo de ${formatDuration(duration)} excede o máximo de ${formatDuration(net.video.maxSeconds)} do ${net.label}.`,
        );
      }
      if (draft.media.fileSizeMb > net.video.maxFileMb) {
        push(
          "erro",
          `Arquivo de ${draft.media.fileSizeMb} MB excede o limite de ${net.video.maxFileMb} MB do ${net.label}.`,
        );
      }
    } else if (draft.media.fileSizeMb > net.image.maxFileMb) {
      push(
        "erro",
        `Imagem de ${draft.media.fileSizeMb} MB excede o limite de ${net.image.maxFileMb} MB do ${net.label}.`,
      );
    }

    if (
      draft.format === "video" &&
      account.networkId === "instagram" &&
      draft.media.aspectRatio !== "9:16"
    ) {
      push("aviso", "Vídeos fora de 9:16 no Instagram recebem menos alcance em Reels.");
    }
  }

  return issues;
}

function hasBlockingIssues(issues                   )          {
  return issues.some((issue) => issue.severity === "erro");
}

function statusLabel(status                         )         {
  switch (status) {
    case "ativa":
      return "ativa";
    case "expirada":
      return "expirada";
    case "erro_permissao":
      return "com erro de permissão";
    case "desconectada":
      return "desconectada";
  }
}

function formatDuration(seconds        )         {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${minutes}min` : `${minutes}min ${rest}s`;
}

  return { MIDIA_PADRAO, NETWORKS, NETWORK_IDS, validateDraft, hasBlockingIssues, statusLabel };
  })();
  __KS['organico-pago'] = (() => {
                                                             

/**
 * Cada peça, com o que veio de graça e o que foi pago.
 *
 * O Painel já separava orgânico de pago **no total do dia**. Isso responde
 * "quanto do alcance eu comprei?" e não responde a pergunta seguinte, que é a
 * que decide o próximo investimento: **qual peça rendeu com dinheiro e qual
 * rendeu sozinha?** Uma campanha pode ter alcance pago alto e estar queimando
 * verba em três peças ruins enquanto a melhor nunca foi impulsionada.
 *
 * Duas decisões governam os números aqui, e as duas são sobre não mentir.
 *
 * **O pago é subtraído do total, não somado a ele.** A rede reporta as métricas
 * da publicação já incluindo o que o impulsionamento trouxe — é o mesmo post.
 * Então orgânico = total − pago. Somar os dois contaria o alcance comprado duas
 * vezes e inflaria tudo.
 *
 * **Quando a subtração não fecha, a peça é marcada.** Alcance pago maior que o
 * total acontece de verdade: a rede estima alcance por caminhos diferentes para
 * o post e para o anúncio, e os números não batem na casa decimal. O orgânico
 * vai a zero com o piso e a peça sai com `inconsistente`, para a tela poder
 * dizer que ali o corte é aproximado — em vez de mostrar um zero que parece
 * medido.
 *
 * Módulo puro.
 */

                             
             
                                                                    
                  
                                                     
                            

                       
                      
                          

                          

                     
                      
                                                                                
                         

                    
                                                                              
                             

     
                                                                       
    
                                                                                
                                                                               
                
     
                         
  

/** Soma as interações que a rede devolve para a peça. */
function interacoesDe(post      )         {
  const m = post.metrics;
  if (!m) return 0;
  return m.likes + m.comments + m.shares + m.saves;
}

/**
 * Cruza publicações e impulsionamentos numa linha por peça.
 *
 * Só peças publicadas e com métricas entram: uma peça agendada não tem
 * desempenho a comparar, e listá-la com zeros faria a média despencar sem que
 * nada tivesse acontecido.
 */
function recortarPecas(
  posts        ,
  boosts         ,
  contas                  = [],
)                  {
  const redeDaConta = new Map(contas.map((conta) => [conta.id, conta.networkId          ]));

  return posts
    .filter((post) => post.status === "publicado" && post.metrics)
    .map((post) => {
      const daPeca = boosts.filter((boost) => boost.postId === post.id);

      const alcanceTotal = post.metrics .reach;
      const alcancePago = daPeca.reduce((soma, boost) => soma + boost.results.reach, 0);
      const investido = daPeca.reduce((soma, boost) => soma + boost.results.spend, 0);
      const cliquesDoAnuncio = daPeca.reduce((soma, boost) => soma + boost.results.clicks, 0);

      const cliquesOrganicos = post.metrics .clicks;
      // `null` quando ninguém informou nada — nem a rede para o orgânico, nem
      // houve anúncio. É diferente de zero, e a tela mostra "—".
      const cliques =
        cliquesOrganicos === undefined && daPeca.length === 0
          ? null
          : (cliquesOrganicos ?? 0) + cliquesDoAnuncio;

      return {
        post,
        redes: [
          ...new Set(
            post.accountIds
              .map((id) => redeDaConta.get(id))
              .filter((rede)                 => Boolean(rede)),
          ),
        ],
        impulsionamentos: daPeca,
        alcanceTotal,
        alcancePago,
        alcanceOrganico: Math.max(0, alcanceTotal - alcancePago),
        impressoesTotal: post.metrics .impressions,
        interacoes: interacoesDe(post),
        comentarios: post.metrics .comments,
        cliques,
        investido,
        custoPorMil: alcancePago > 0 ? (investido / alcancePago) * 1000 : null,
        inconsistente: alcancePago > alcanceTotal,
      };
    });
}

                            
             
              
          
                
                 
             
                

/**
 * Ordena o recorte, sempre do maior para o menor.
 *
 * Decrescente e não configurável porque a pergunta de um painel é sempre "o que
 * mais rendeu" — e uma tabela que às vezes começa pelo pior faz a pessoa
 * conferir a seta antes de ler o primeiro número.
 */
function ordenarRecorte(
  pecas                 ,
  ordem                ,
)                  {
  const valor = (peca               )         => {
    switch (ordem) {
      case "organico":
        return peca.alcanceOrganico;
      case "pago":
        return peca.alcancePago;
      case "interacoes":
        return peca.interacoes;
      case "comentarios":
        return peca.comentarios;
      case "cliques":
        return peca.cliques ?? -1;
      case "investido":
        return peca.investido;
      default:
        return peca.alcanceTotal;
    }
  };

  return [...pecas].sort((a, b) => valor(b) - valor(a));
}

                               
                
                        
                       
                          
                      
                     
                      
                         
                    
                             
                                                          
                    
  

function totalizarRecorte(pecas                 )                  {
  const somar = (campo                                 ) =>
    pecas.reduce((total, peca) => total + campo(peca), 0);

  const alcanceTotal = somar((peca) => peca.alcanceTotal);
  const alcancePago = somar((peca) => peca.alcancePago);
  const investido = somar((peca) => peca.investido);

  // Só soma cliques se alguma peça tiver medição. Sem isso, um conjunto em que
  // nenhuma rede informou cliques apareceria como "0 cliques", que se lê como
  // "ninguém clicou" em vez de "não medimos".
  const comCliques = pecas.filter((peca) => peca.cliques !== null);

  return {
    pecas: pecas.length,
    impulsionadas: pecas.filter((peca) => peca.impulsionamentos.length > 0).length,
    alcanceTotal,
    alcanceOrganico: somar((peca) => peca.alcanceOrganico),
    alcancePago,
    interacoes: somar((peca) => peca.interacoes),
    comentarios: somar((peca) => peca.comentarios),
    cliques:
      comCliques.length > 0
        ? comCliques.reduce((total, peca) => total + (peca.cliques ?? 0), 0)
        : null,
    investido,
    custoPorMil: alcancePago > 0 ? (investido / alcancePago) * 1000 : null,
    fatiaPaga: alcanceTotal > 0 ? (alcancePago / alcanceTotal) * 100 : 0,
  };
}

/**
 * A peça que mais rendeu sem dinheiro.
 *
 * É a pergunta mais útil que este recorte responde, e a que o painel de totais
 * não alcança: uma peça que alcança muita gente sozinha é candidata óbvia a
 * impulsionamento — já provou que funciona antes de custar.
 *
 * Só considera peças **ainda não impulsionadas**. Uma que já recebeu verba não
 * é descoberta; é investimento em andamento.
 */
function melhorOrganicaSemVerba(pecas                 )                       {
  const candidatas = pecas.filter((peca) => peca.impulsionamentos.length === 0);
  if (candidatas.length === 0) return null;
  return candidatas.reduce((melhor, peca) =>
    peca.alcanceOrganico > melhor.alcanceOrganico ? peca : melhor,
  );
}

  return { recortarPecas, ordenarRecorte, totalizarRecorte, melhorOrganicaSemVerba };
  })();
  __KS['permissions'] = (() => {
                                           

/**
 * Permissões por papel (PRD 3.7). O servidor continua sendo a fonte de verdade:
 * isto controla apenas o que a interface oferece a cada usuário.
 */
const ROLE_ABILITIES                             = {
  administrador: [
    "metricas",
    "publicar",
    "publicar_direto",
    "aprovar",
    "impulsionar",
    "inbox",
    "relatorios",
    "agenda",
    "admin",
  ],
  gestor: [
    "metricas",
    "publicar",
    // Quem cobre evento ao vivo precisa publicar sem esperar aprovação: numa
    // caminhada, meia hora de espera é a peça perdendo o momento. A rede de
    // proteção continua existindo para quem não tem esta permissão.
    "publicar_direto",
    "aprovar",
    "impulsionar",
    "inbox",
    "relatorios",
    "agenda",
  ],
  editor: ["metricas", "publicar", "inbox", "agenda"],
  atendimento: ["inbox", "agenda"],
};

function can(role                      , ability        )          {
  if (!role) return false;
  return ROLE_ABILITIES[role].includes(ability);
}

  return { can };
  })();
  __KS['post-analytics'] = (() => {
                                                    

/**
 * Desdobramento do resultado de uma publicação.
 *
 * A rede entrega o desempenho por conta e por dia; o nosso modelo guarda o
 * total. Enquanto a sincronização por publicação não existir, derivamos o
 * detalhe do total de forma determinística: o mesmo post sempre mostra a mesma
 * divisão, então a tela não "dança" a cada visita e os números somam exatamente
 * o total já exibido nas listas.
 *
 * Quando a Graph API passar a alimentar isso de verdade, estas funções são
 * substituídas pelo dado real — a interface não muda.
 */

function semente(texto        )         {
  let hash = 2166136261;
  for (let i = 0; i < texto.length; i += 1) {
    hash ^= texto.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pseudoAleatorio(chave        )         {
  // Devolve algo entre 0 e 1, estável para a mesma chave.
  return (semente(chave) % 1000) / 1000;
}

/**
 * Os campos que toda rede sempre devolve, e que por isso dá para dividir.
 *
 * Não é `keyof PostMetrics`: `clicks` é opcional porque nem toda rede informa
 * clique no link, e dividir um campo ausente produziria zeros que se leem como
 * "ninguém clicou" em vez de "não medimos". A divisão fica nos campos que
 * existem sempre; `clicks` chega à tela inteiro, do total da peça.
 */
                                                                                                 

const CAMPOS                   = ["reach", "impressions", "likes", "comments", "shares", "saves"];

/**
 * Divide o total entre as contas de destino, com pesos estáveis por conta.
 * A soma de cada métrica é igual ao total — o último recebe o resto, para o
 * arredondamento não criar nem perder unidades.
 */
function dividirPorConta(
  post                                             ,
  contas           = post.accountIds,
)                              {
  const resultado                              = {};
  if (!post.metrics || contas.length === 0) return resultado;

  const pesos = contas.map((accountId) => 0.4 + pseudoAleatorio(`${post.id}:${accountId}`) * 0.6);
  const somaPesos = pesos.reduce((total, peso) => total + peso, 0);

  const restante              = { ...post.metrics };

  contas.forEach((accountId, indice) => {
    const ehUltima = indice === contas.length - 1;
    const parcela              = {
      reach: 0,
      impressions: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
    };

    for (const campo of CAMPOS) {
      parcela[campo] = ehUltima
        ? restante[campo]
        : Math.round((post.metrics [campo] * pesos[indice]) / somaPesos);
      if (!ehUltima) restante[campo] -= parcela[campo];
    }

    resultado[accountId] = parcela;
  });

  return resultado;
}

                           
                                                    
              
               
                
                     
  

/**
 * Curva de desempenho nos primeiros dias.
 *
 * Publicação em rede social tem vida curta: a maior parte do alcance acontece
 * nas primeiras 48 horas e depois cai. A curva usa esse decaimento para mostrar
 * quando o post "morreu" — informação que o total sozinho esconde.
 */
function curvaDoPost(
  post                                              ,
  dias = 10,
)                {
  if (!post.metrics || !post.publishedAt) return [];

  const engajamento =
    post.metrics.likes + post.metrics.comments + post.metrics.shares + post.metrics.saves;

  // Decaimento geométrico: cada dia entrega uma fração do anterior.
  const fator = 0.55 + pseudoAleatorio(`${post.id}:decaimento`) * 0.15;
  const pesos = Array.from({ length: dias }, (_, dia) => fator ** dia);
  const somaPesos = pesos.reduce((total, peso) => total + peso, 0);

  const inicio = new Date(post.publishedAt);
  let alcanceRestante = post.metrics.reach;
  let engajamentoRestante = engajamento;

  return pesos.map((peso, dia) => {
    const ultimo = dia === dias - 1;
    const data = new Date(inicio);
    data.setDate(inicio.getDate() + dia);

    const alcance = ultimo ? alcanceRestante : Math.round((post.metrics .reach * peso) / somaPesos);
    const interacoes = ultimo ? engajamentoRestante : Math.round((engajamento * peso) / somaPesos);

    alcanceRestante -= alcance;
    engajamentoRestante -= interacoes;

    return {
      dia,
      data: data.toISOString().slice(0, 10),
      reach: Math.max(0, alcance),
      engagement: Math.max(0, interacoes),
    };
  });
}

/** Interações somadas — o denominador do engajamento por alcance. */
function totalDeInteracoes(metricas             )         {
  return metricas.likes + metricas.comments + metricas.shares + metricas.saves;
}

function taxaDeEngajamento(metricas             )         {
  if (metricas.reach === 0) return 0;
  return (totalDeInteracoes(metricas) / metricas.reach) * 100;
}

/** Rótulos dos itens de um carrossel, para navegar item por item. */
function itensDaMidia(post                                )           {
  if (post.format === "carrossel") {
    return Array.from({ length: post.media.count }, (_, i) => `Item ${i + 1}`);
  }
  return [post.format === "video" ? "Vídeo" : "Imagem"];
}

  return { dividirPorConta, curvaDoPost, totalDeInteracoes, taxaDeEngajamento, itensDaMidia };
  })();
  __KS['previa'] = (() => {
                                            

/**
 * Como a peça vai aparecer no Instagram, antes de existir.
 *
 * A pergunta que isto responde não é estética, é de linha editorial: a legenda
 * cortada no "mais" muda o que a pessoa lê sem tocar na tela, e o recorte da
 * grade muda o que ela vê ao abrir o perfil. As duas coisas são decididas pelo
 * Instagram, não por quem escreve — e hoje só aparecem depois de publicar, que
 * é tarde.
 *
 * Tudo aqui é cálculo sobre texto e proporção. O que o módulo **não** faz é
 * prometer pixel igual ao aplicativo: a Meta muda a interface sem avisar, e uma
 * prévia que se vende como idêntica envelhece mal. O que ela garante é o que
 * importa para decidir: onde a legenda corta, quantas marcações existem, e o
 * que o recorte vai comer.
 *
 * Módulo puro.
 */

/**
 * Quantos caracteres o feed mostra antes do "mais".
 *
 * O Instagram nunca publicou o número, e ele oscila com a largura da tela e com
 * a fonte. 125 é a medida que bate na maioria dos aparelhos e é a que a
 * literatura de redes usa. Está aqui, numa constante, porque é um palpite
 * calibrado: quando mudar, muda num lugar só.
 */
const CORTE_DO_FEED = 125;

/** Marcações por publicação aceitas pelo Instagram. Acima disso a rede recusa. */
const LIMITE_DE_HASHTAGS = 30;

                              
                                       
                  
                                                                   
                    
                   
  

/**
 * Corta a legenda onde o feed corta, numa palavra inteira.
 *
 * Cortar no meio da palavra economiza dois caracteres e custa a leitura. A
 * primeira quebra de linha também corta: o Instagram mostra o começo até a
 * primeira linha quando ela termina antes do limite, e é assim que uma legenda
 * que abre com o nome da cidade esconde o resto.
 */
function cortarLegenda(legenda        , limite = CORTE_DO_FEED)                 {
  if (legenda.length <= limite) return { visivel: legenda, escondido: "", cortada: false };

  const bruto = legenda.slice(0, limite);
  const ultimoEspaco = bruto.lastIndexOf(" ");
  const corte = ultimoEspaco > limite * 0.6 ? ultimoEspaco : limite;

  return {
    visivel: legenda.slice(0, corte).trimEnd(),
    escondido: legenda.slice(corte).trimStart(),
    cortada: true,
  };
}

                               
                                                
                
  

/**
 * Separa a legenda nos pedaços que o Instagram pinta de azul.
 *
 * Existe para a prévia mostrar a legenda como ela vai ser lida: uma legenda com
 * doze marcações no meio do texto fica azul demais, e isso só se vê colorido.
 */
function pedacosDaLegenda(legenda        )                    {
  const padrao = /(https?:\/\/\S+|www\.\S+|#[\p{L}\p{N}_]+|@[A-Za-z0-9._]+)/gu;
  const pedacos                    = [];
  let ultimo = 0;

  for (const achado of legenda.matchAll(padrao)) {
    const inicio = achado.index ?? 0;
    if (inicio > ultimo) pedacos.push({ tipo: "texto", texto: legenda.slice(ultimo, inicio) });

    const token = achado[0];
    pedacos.push({
      tipo: token.startsWith("#") ? "hashtag" : token.startsWith("@") ? "mencao" : "link",
      texto: token,
    });
    ultimo = inicio + token.length;
  }

  if (ultimo < legenda.length) pedacos.push({ tipo: "texto", texto: legenda.slice(ultimo) });
  return pedacos;
}

function hashtagsDaLegenda(legenda        )           {
  return pedacosDaLegenda(legenda)
    .filter((pedaco) => pedaco.tipo === "hashtag")
    .map((pedaco) => pedaco.texto);
}

function mencoesDaLegenda(legenda        )           {
  return pedacosDaLegenda(legenda)
    .filter((pedaco) => pedaco.tipo === "mencao")
    .map((pedaco) => pedaco.texto);
}

/**
 * As proporções que o feed do Instagram aceita sem recortar.
 *
 * Fora delas a rede recorta sozinha, e o recorte nunca é onde quem montou a arte
 * esperava. 9:16 é o caso que mais acontece: a pessoa aproveita a arte do story
 * no feed e perde o topo e o pé.
 */
const PROPORCOES_DO_FEED                             = ["1:1", "4:5"];

/**
 * A proporção do recorte da grade do perfil.
 *
 * O Instagram já mudou isso — a grade foi quadrada por anos e virou retrato. A
 * prévia usa uma constante justamente porque vai mudar de novo; trocar aqui
 * ajusta a tela inteira.
 */
const PROPORCAO_DA_GRADE = 4 / 5;

function razaoDaProporcao(proporcao                          )         {
  const [largura, altura] = proporcao.split(":").map(Number);
  return largura / altura;
}

                             
                                                              
                                
                   
  

/**
 * O que vai dar errado antes de dar errado.
 *
 * Separado do validador de rascunho de propósito: aquele responde "a rede
 * aceita?", e estes avisos respondem "vai sair como você quer?". Legenda cortada
 * no meio da frase e arte recortada passam na validação e estragam a peça.
 */
function avisosDaPrevia({
  legenda,
  media,
  formato,
}   
                  
                   
                  
 )                  {
  const avisos                  = [];
  const hashtags = hashtagsDaLegenda(legenda);

  if (hashtags.length > LIMITE_DE_HASHTAGS) {
    avisos.push({
      gravidade: "erro",
      mensagem: `${hashtags.length} marcações na legenda. O Instagram aceita ${LIMITE_DE_HASHTAGS} e recusa a publicação acima disso.`,
    });
  }

  const ehFeed = formato === "imagem" || formato === "carrossel";
  if (ehFeed && !PROPORCOES_DO_FEED.includes(media.aspectRatio)) {
    avisos.push({
      gravidade: "atencao",
      mensagem: `A arte está ${media.aspectRatio} e o feed mostra até 4:5. O Instagram vai recortar sozinho — confira se o texto da arte não fica de fora.`,
    });
  }

  if (formato === "story" && media.aspectRatio !== "9:16") {
    avisos.push({
      gravidade: "atencao",
      mensagem: `Story é 9:16. Em ${media.aspectRatio} a arte sai com tarja ou recortada.`,
    });
  }

  if (legenda.trim().length === 0) {
    avisos.push({
      gravidade: "atencao",
      mensagem: "Sem legenda. A publicação sai, mas perde o texto que faz a pessoa parar.",
    });
  } else if (cortarLegenda(legenda).cortada) {
    const { visivel } = cortarLegenda(legenda);
    const terminaEmFrase = /[.!?…:]$/.test(visivel.trimEnd());
    if (!terminaEmFrase) {
      avisos.push({
        gravidade: "atencao",
        mensagem: "O feed corta a legenda no meio da frase. Quem não tocar em “mais” lê só até ali.",
      });
    }
  }

  if (hashtags.length > 0 && legenda.trim().startsWith(hashtags[0])) {
    avisos.push({
      gravidade: "atencao",
      mensagem:
        "A legenda começa por marcação, e é ela que aparece no corte do feed. Começar pela frase aproveita melhor as primeiras linhas.",
    });
  }

  return avisos;
}

                           
             
                                                           
                 
                        
                  
                        
                                                                           
                  
  

/**
 * A grade do perfil, na ordem em que o Instagram vai mostrar.
 *
 * É a prévia da linha editorial, e a razão de existir: peça a peça cada arte
 * pode estar boa e o perfil inteiro sair repetitivo — três fundos escuros
 * seguidos, ou a mesma cor nas nove primeiras. Isso só aparece na grade.
 *
 * Mais recente primeiro, com as agendadas no topo, porque é onde elas vão cair.
 */
function gradeDoPerfil 
             
               
                    
                   
                          
                               
                                
    
 (pecas     , limite = 9)                {
  const quandoDe = (peca   ) => peca.publishedAt ?? peca.scheduledFor;

  return pecas
    .filter((peca) => quandoDe(peca) !== null && peca.format !== "story")
    .sort((a, b) => new Date(quandoDe(b) ).getTime() - new Date(quandoDe(a) ).getTime())
    .slice(0, limite)
    .map((peca) => ({
      id: peca.id,
      trecho: peca.caption.replace(/\s+/g, " ").trim().slice(0, 40),
      quando: quandoDe(peca),
      formato: peca.format,
      coverGradient: peca.coverGradient,
      futura: peca.publishedAt === null,
    }));
}

  return { CORTE_DO_FEED, LIMITE_DE_HASHTAGS, cortarLegenda, pedacosDaLegenda, hashtagsDaLegenda, mencoesDaLegenda, PROPORCOES_DO_FEED, PROPORCAO_DA_GRADE, razaoDaProporcao, avisosDaPrevia, gradeDoPerfil };
  })();
  __KS['publico'] = (() => {
const { FAIXAS_ETARIAS } = __KS['types'];
             
                  
        
                    
              
         
            
                
                    

/**
 * Perfil do público: quem é, onde está, e como se comporta.
 *
 * **Este é o módulo onde mais importa dizer de onde cada número veio**, porque
 * é o que mais parece saber coisas que ninguém sabe. Um painel que exibe "42%
 * do seu público é de Recife" com a mesma tipografia de "alcance: 12.000"
 * sugere que os dois têm o mesmo lastro. Não têm.
 *
 * As três origens, e o que cada uma pode dizer:
 *
 * **Segmentação de anúncio.** Quando uma publicação é impulsionada para uma
 * cidade, o alcance pago daquela peça foi entregue naquela cidade — está no
 * contrato do anúncio. É o dado mais firme que existe aqui, e o único que
 * permite dizer "chegamos a tantas pessoas nesta cidade" sem hipótese no meio.
 *
 * **Perfil da rede.** Instagram e Facebook expõem a distribuição por cidade dos
 * seguidores, em agregado e só acima de cem seguidores. É estimativa deles,
 * sobre seguidores — não sobre quem foi alcançado —, e a Meta vem reduzindo o
 * que devolve.
 *
 * **Leitura manual.** Alguém abriu o painel da rede, leu e digitou. Vale o que
 * vale: é uma fotografia de um dia.
 *
 * O que **não** existe, e por isso não é oferecido: a cidade de quem comentou.
 * Nenhuma rede entrega a localização de uma pessoa que interagiu — nem
 * deveria. Cruzar assunto com cidade a partir de comentários seria inventar, e
 * inventar num painel eleitoral é como uma decisão errada nasce.
 *
 * Módulo puro.
 */

                                                                               

const EXPLICACAO_DA_ORIGEM                               = {
  segmentacao:
    "Veio da segmentação dos anúncios: o alcance pago desta peça foi contratado para esta cidade.",
  perfil_da_rede:
    "Veio do perfil de público da rede, que é uma estimativa agregada sobre seguidores — não sobre quem foi alcançado.",
  leitura_manual: "Foi digitado à mão a partir do painel da rede.",
};

                               
                 
                                                                 
                      
                                                                        
                            
                                                                       
                              
                    
                                                                              
                                                                                         
                          
  

/** Tira "(+10 km)" e espaços de sobra para o mesmo lugar não virar duas linhas. */
function normalizarCidade(bruto        )         {
  return bruto
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Consolida as cidades a partir das duas fontes que existem.
 *
 * A ordenação é por alcance pago, e não pela fatia de seguidores, de propósito:
 * alcance pago é gente que a campanha realmente atingiu, e fatia de seguidores
 * é estimativa da rede. Ordenar pela estimativa colocaria o palpite na frente
 * do fato.
 */
function cidadesAlcancadas(
  impulsionamentos         ,
  perfis                   ,
  seguidoresTotais        ,
)                    {
  const porCidade = new Map                         ();

  const obter = (cidade        )                  => {
    const existente = porCidade.get(cidade);
    if (existente) return existente;
    const nova                  = {
      cidade,
      alcancePago: 0,
      fatiaDeSeguidores: 0,
      seguidoresEstimados: 0,
      investido: 0,
      publicacoes: [],
      origens: [],
    };
    porCidade.set(cidade, nova);
    return nova;
  };

  for (const boost of impulsionamentos) {
    const cidades = boost.audience.locations.map(normalizarCidade).filter(Boolean);
    if (cidades.length === 0) continue;

    // O alcance é dividido igualmente entre as cidades segmentadas. A rede não
    // devolve a quebra por cidade dentro de uma campanha, e assumir divisão
    // igual é a única hipótese que não favorece nenhuma cidade — mas é
    // hipótese, e por isso a tela mostra "estimado" quando há mais de uma.
    const fatia = 1 / cidades.length;

    for (const cidade of cidades) {
      const registro = obter(cidade);
      registro.alcancePago += boost.results.reach * fatia;
      registro.investido += boost.results.spend * fatia;
      registro.publicacoes.push({
        postId: boost.postId,
        boostId: boost.id,
        alcance: Math.round(boost.results.reach * fatia),
        investido: boost.results.spend * fatia,
      });
      if (!registro.origens.includes("segmentacao")) registro.origens.push("segmentacao");
    }
  }

  // O perfil da rede vem por conta; a fatia de cada cidade é a média das contas
  // que reportam aquela cidade.
  const fatiasPorCidade = new Map                  ();
  for (const perfil of perfis) {
    if (!perfil.available) continue;
    for (const item of perfil.topCities) {
      const cidade = normalizarCidade(item.city);
      // `share` vem em porcentagem (38 significa 38%); aqui tudo trabalha em
      // fração de 0 a 1. A conversão acontece neste único ponto — foi
      // esquecê-la que fez a tela anunciar "3.800% dos seguidores".
      fatiasPorCidade.set(cidade, [...(fatiasPorCidade.get(cidade) ?? []), item.share / 100]);
    }
  }

  for (const [cidade, fatias] of fatiasPorCidade.entries()) {
    const registro = obter(cidade);
    registro.fatiaDeSeguidores = fatias.reduce((soma, item) => soma + item, 0) / fatias.length;
    registro.seguidoresEstimados = Math.round(registro.fatiaDeSeguidores * seguidoresTotais);
    if (!registro.origens.includes("perfil_da_rede")) registro.origens.push("perfil_da_rede");
  }

  return [...porCidade.values()]
    .map((cidade) => ({
      ...cidade,
      alcancePago: Math.round(cidade.alcancePago),
      investido: Math.round(cidade.investido * 100) / 100,
    }))
    .sort((a, b) => b.alcancePago - a.alcancePago || b.fatiaDeSeguidores - a.fatiaDeSeguidores);
}

                               
                                                  
                  
                                                                                
                                          
               
                   
                 
                       
                           
                     
                           
      
                                                              
                                                  
                                                        
                            
                                                                         
                              
  

const ORDEM_DA_RELACAO                  = [
  "defensor",
  "apoiador",
  "seguidor",
  "nao_seguidor",
];

const ROTULO_DA_RELACAO                                = {
  defensor: "Defensores",
  apoiador: "Apoiadores",
  seguidor: "Seguidores",
  nao_seguidor: "Não seguidores",
};

/**
 * O perfil de quem interage, montado da caixa de entrada.
 *
 * É o retrato mais honesto que a plataforma consegue do público: não é "quem
 * são seus seguidores", é "quem fala com você". Os dois se sobrepõem bastante,
 * mas não são a mesma coisa, e a tela diz isso.
 *
 * A hora vem de quando a interação chegou, que é quando a pessoa estava ali.
 */
function perfilDoPublico(inbox             )                  {
  const porPessoa = new Map                     ();
  for (const item of inbox) {
    porPessoa.set(item.authorHandle, [...(porPessoa.get(item.authorHandle) ?? []), item]);
  }

  const porRelacao = ORDEM_DA_RELACAO.map((relacao) => {
    const pessoas = [...porPessoa.values()].filter(
      (itens) => itens[itens.length - 1].relacao === relacao,
    );
    return {
      relacao,
      pessoas: pessoas.length,
      interacoes: pessoas.reduce((soma, itens) => soma + itens.length, 0),
    };
  }).filter((linha) => linha.pessoas > 0);

  const maisAtivas = [...porPessoa.entries()]
    .map(([handle, itens]) => {
      const recente = itens.reduce((maisNova, item) =>
        item.receivedAt > maisNova.receivedAt ? item : maisNova,
      );
      return {
        handle,
        nome: recente.authorName,
        // `interacoes` do item é a contagem histórica da pessoa; sem ela, o
        // total do período serve.
        interacoes: Math.max(recente.interacoes, itens.length),
        relacao: recente.relacao,
        ultimaEm: recente.receivedAt,
        avatarGradient: recente.avatarGradient,
      };
    })
    .sort((a, b) => b.interacoes - a.interacoes)
    .slice(0, 12);

  const porHora = Array.from({ length: 24 }, (_, hora) => ({
    hora,
    interacoes: inbox.filter((item) => new Date(item.receivedAt).getHours() === hora).length,
  }));

  const pico = porHora.reduce((maior, atual) =>
    atual.interacoes > maior.interacoes ? atual : maior,
  );

  return {
    pessoas: porPessoa.size,
    porRelacao,
    maisAtivas,
    porHora,
    horaDePico: pico.interacoes > 0 ? pico.hora : null,
    interacoesPorPessoa: porPessoa.size > 0 ? inbox.length / porPessoa.size : 0,
  };
}

// ---------------------------------------------------------------------------
// Gênero e idade
// ---------------------------------------------------------------------------

/**
 * O retrato demográfico do público, somado entre as contas.
 *
 * Serve à pergunta de campanha — "estou falando com homem ou com mulher, e de
 * que idade?" — com a ressalva que a torna utilizável: **isto é sobre
 * seguidores, não sobre quem foi alcançado.** As duas coisas divergem muito
 * quando há mídia paga, e tratá-las como a mesma leva a segmentar para o
 * público que já se tem em vez do que se quer conquistar.
 *
 * Somar contas diferentes é aceitável e impreciso ao mesmo tempo: quem segue no
 * Instagram e no Facebook é contado duas vezes, porque nenhuma rede diz quem é
 * a mesma pessoa. O total declara isso em `contas`, para quem lê saber que é
 * soma de perfis e não de gente.
 */
                                   
                                                                        
                  
                                                          
                 
                                                                  
                                                                
             
                       
                     
                      
                         
                  
                                                
                  
      
                                                              
                                     
     
                                                  
    
                                                                          
                                                                               
             
     
                                                
  

function demografiaDoPublico(perfis                   )                      {
  /**
   * O campo pode não existir.
   *
   * `demografia` entrou depois no formato, e o estado da plataforma é gravado
   * como JSON: um perfil salvo por uma versão anterior volta do banco sem o
   * campo. Ler `.length` direto ali derruba a tela inteira de Público na
   * primeira atualização de versão — que é justamente quando ninguém está
   * olhando.
   */
  const celulasDe = (perfil                 )                      => perfil.demografia ?? [];

  const comDado = perfis.filter((perfil) => perfil.available && celulasDe(perfil).length > 0);

  const motivos = new Map                ();
  for (const perfil of perfis) {
    if (perfil.available && celulasDe(perfil).length > 0) continue;
    const motivo =
      perfil.unavailableReason ?? "A rede só devolve o perfil demográfico acima de cem seguidores.";
    motivos.set(motivo, (motivos.get(motivo) ?? 0) + 1);
  }
  const semDado = [...motivos.entries()].map(([motivo, contas]) => ({ motivo, contas }));

  const chave = (genero        , faixa             ) => `${genero}|${faixa}`;
  const soma = new Map                ();
  for (const perfil of comDado) {
    for (const celula of celulasDe(perfil)) {
      const atual = soma.get(chave(celula.genero, celula.faixa)) ?? 0;
      soma.set(chave(celula.genero, celula.faixa), atual + celula.pessoas);
    }
  }

  const pessoas = [...soma.values()].reduce((total, valor) => total + valor, 0);
  const de = (genero        , faixa             ) => soma.get(chave(genero, faixa)) ?? 0;

  const porGenero = (["feminino", "masculino", "nao_informado"]            )
    .map((genero) => {
      const total = FAIXAS_ETARIAS.reduce((acumulado, faixa) => acumulado + de(genero, faixa), 0);
      return { genero, pessoas: total, fatia: pessoas > 0 ? total / pessoas : 0 };
    })
    // Gênero sem ninguém não vira linha de zero na legenda.
    .filter((linha) => linha.pessoas > 0);

  const piramide = FAIXAS_ETARIAS.map((faixa) => {
    const feminino = de("feminino", faixa);
    const masculino = de("masculino", faixa);
    const naoInformado = de("nao_informado", faixa);
    const total = feminino + masculino + naoInformado;
    return {
      faixa,
      feminino,
      masculino,
      naoInformado,
      total,
      fatia: pessoas > 0 ? total / pessoas : 0,
    };
  });

  const maior = piramide.reduce(
    (campea, atual) => (atual.total > campea.total ? atual : campea),
    piramide[0],
  );

  return {
    pessoas,
    contas: comDado.length,
    porGenero,
    piramide,
    faixaDominante: maior.total > 0 ? maior.faixa : null,
    semDado,
  };
}

const NOME_DO_GENERO                         = {
  feminino: "Mulheres",
  masculino: "Homens",
  nao_informado: "Não informado",
};

  return { EXPLICACAO_DA_ORIGEM, normalizarCidade, cidadesAlcancadas, ORDEM_DA_RELACAO, ROTULO_DA_RELACAO, perfilDoPublico, demografiaDoPublico, NOME_DO_GENERO };
  })();
  __KS['rastreio'] = (() => {
                                                                                        

/**
 * O caminho de volta: do comentário até a peça que o provocou.
 *
 * Ler uma reclamação sem saber o que a causou leva a responder a reclamação. Ler
 * a mesma frase sabendo que veio de um vídeo publicado numa terça às 19h, que
 * teve dez vezes mais comentários que a média, leva a mudar o conteúdo — que é a
 * decisão que interessa.
 *
 * Duas decisões que este módulo toma:
 *
 * **A peça pode não existir.** Interação importada, publicação apagada na rede,
 * comentário em anúncio que não virou post: nesses casos `postId` aponta para o
 * vazio. A resposta é `null` e a tela diz que a origem não foi encontrada —
 * inventar um placeholder faria a pessoa procurar uma peça que não existe.
 *
 * **O resumo é fechado, não é o post inteiro.** Quem lê a conversa precisa de
 * formato, dia e tamanho da repercussão. Mandar o objeto inteiro para o
 * navegador traria rascunho, aprovador e motivo de falha para uma tela que não
 * tem o que fazer com isso.
 *
 * Módulo puro.
 */

/** O que a tela de relacionamento mostra sobre a peça de origem. */
                            
             
                      
                                                               
                 
                             
                     
                        
                                                              
                                                                              
  

const LIMITE_DO_TRECHO = 90;

/**
 * Corta a legenda numa palavra inteira.
 *
 * Cortar no meio da palavra economiza dois caracteres e custa a leitura; o
 * limite existe para caber numa linha, não para ser exato.
 */
function trechoDaLegenda(legenda        , limite = LIMITE_DO_TRECHO)         {
  const limpa = legenda.replace(/\s+/g, " ").trim();
  if (limpa.length <= limite) return limpa;

  const cortada = limpa.slice(0, limite);
  const ultimoEspaco = cortada.lastIndexOf(" ");
  return `${(ultimoEspaco > limite * 0.6 ? cortada.slice(0, ultimoEspaco) : cortada).trimEnd()}…`;
}

/** Resume uma publicação no que a tela de conversa precisa saber dela. */
function resumirPeca(post      , contas                 )               {
  const porId = new Map(contas.map((conta) => [conta.id, conta]));
  const redes = [...new Set(post.accountIds.map((id) => porId.get(id)?.networkId))].filter(
    (rede)                    => rede !== undefined,
  );

  return {
    id: post.id,
    formato: post.format,
    trecho: trechoDaLegenda(post.caption),
    publicadoEm: post.publishedAt,
    redes,
    coverGradient: post.coverGradient,
    metricas: post.metrics
      ? {
          alcance: post.metrics.reach,
          curtidas: post.metrics.likes,
          comentarios: post.metrics.comments,
        }
      : null,
  };
}

/**
 * Liga cada conversa à peça que a originou.
 *
 * Devolve um índice por `postId` e não por interação: várias conversas nascem da
 * mesma publicação, e repetir o mesmo resumo em cada uma engorda a resposta sem
 * acrescentar nada.
 */
function indexarOrigens(
  interacoes             ,
  posts        ,
  contas                 ,
)                               {
  const procurados = new Set(
    interacoes.map((item) => item.postId).filter((id)               => id !== null),
  );

  const indice                               = {};
  for (const post of posts) {
    if (procurados.has(post.id)) indice[post.id] = resumirPeca(post, contas);
  }
  return indice;
}

/**
 * Quantas conversas cada publicação gerou.
 *
 * É o número que transforma o rastreio em decisão: uma peça com vinte
 * comentários e outra com um não pedem a mesma coisa de quem produz conteúdo.
 */
function conversasPorPeca(interacoes             )                         {
  const contagem                         = {};
  for (const item of interacoes) {
    if (item.postId === null) continue;
    contagem[item.postId] = (contagem[item.postId] ?? 0) + 1;
  }
  return contagem;
}

const NOME_DO_FORMATO                             = {
  a_definir: "formato a definir",
  imagem: "imagem",
  carrossel: "carrossel",
  video: "vídeo",
  story: "story",
};

/** O formato escrito como a pessoa fala. */
function nomeDoFormato(formato            )         {
  return NOME_DO_FORMATO[formato];
}

const DIAS = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
]         ;

/**
 * "quinta-feira, 7 de agosto, 19h" — o dia como quem lembra dele.
 *
 * O dia da semana entra porque é o que a pessoa da campanha usa para lembrar
 * ("aquele vídeo de quinta"); a data sozinha exige uma conversão mental que
 * ninguém faz de graça.
 */
function diaPorExtenso(iso               )                {
  if (!iso) return null;
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return null;

  const mes = data.toLocaleDateString("pt-BR", { month: "long" });
  const hora = data.getHours();
  const minuto = data.getMinutes();
  const relogio = minuto === 0 ? `${hora}h` : `${hora}h${String(minuto).padStart(2, "0")}`;

  return `${DIAS[data.getDay()]}, ${data.getDate()} de ${mes}, ${relogio}`;
}

  return { trechoDaLegenda, resumirPeca, indexarOrigens, conversasPorPeca, nomeDoFormato, diaPorExtenso };
  })();
  __KS['recomendacoes'] = (() => {
// A extensão é explícita porque os testes rodam com o "type stripping" do Node,
// que resolve módulos como ESM e não adivinha o ".ts" — ao contrário do bundler.
const { PERIOD_DAYS, slicePeriod, summarize } = __KS['analytics'];
const { FORMATOS_DE_FEED } = __KS['types'];
                                                                                         

/**
 * Recomendações a partir dos números.
 *
 * A regra que governa este módulo inteiro: **nada é sugerido sem a conta que o
 * sustenta.** Cada recomendação carrega a evidência — os dois números que a
 * geraram — e a tela mostra essa evidência junto. Um painel que diz "poste mais
 * às terças" sem dizer por quê está pedindo confiança cega, e em campanha
 * política, decisão tomada por palpite embrulhado em interface custa caro.
 *
 * Daí vem a segunda regra: **quando a base é pequena, o silêncio é a resposta
 * certa.** Cada análise declara quantos dias ou quantas publicações precisa
 * antes de falar. Três posts não dizem qual formato rende mais; dizem que ainda
 * não dá para saber. Recomendação inventada sobre dado ralo é pior que
 * recomendação nenhuma, porque parece igual à boa.
 *
 * Módulo puro: recebe métricas e publicações, devolve texto. Sem relógio
 * próprio (o "hoje" entra como parâmetro), sem acesso a banco, testável.
 */

                                                                    

                            
                                                                   
             
                 
                                   
               
                                                               
                    
                         
                                                           
                                                                                  
                                                                
                     
  

/** O que cada análise precisa antes de abrir a boca. */
const MINIMOS = {
  /** Dias de histórico para comparar um período com o anterior. */
  diasParaTendencia: 14,
  /** Publicações do mesmo formato para comparar formatos. */
  postsPorFormato: 3,
  /** Publicações no total para falar de conteúdo. */
  postsParaConteudo: 6,
  /** Dias com investimento para avaliar eficiência de mídia paga. */
  diasComInvestimento: 7,
}         ;

                                    
                          
                                                                          
                                               
                
                    
                                                     
                              
                                                                    
                                      
                                                                       
                  
  

/**
 * Todas as observações que os números sustentam, da mais urgente para a menos.
 *
 * Devolve lista vazia sem constrangimento: é o resultado honesto de uma conta
 * nova ou de um período curto.
 */
function recomendar(entrada                      )                 {
  const encontradas = [
    ...tendenciaDeAlcance(entrada),
    ...formatoQueRende(entrada),
    ...eficienciaDoInvestimento(entrada),
    ...canalParado(entrada),
    ...perdaDeSeguidores(entrada),
    ...interacoesEsperando(entrada),
    ...frequenciaDePublicacao(entrada),
  ];

  const ordem                                   = { risco: 0, atencao: 1, oportunidade: 2 };
  return encontradas.sort((a, b) => ordem[a.peso] - ordem[b.peso]);
}

// --- Análises ---------------------------------------------------------------

/** O alcance está subindo ou caindo contra o período anterior de mesmo tamanho? */
function tendenciaDeAlcance(entrada                      )                 {
  const todos = todasAsMetricas(entrada);
  if (todos.length < MINIMOS.diasParaTendencia) return [];

  const resumo = summarize(todos, entrada.period);
  // Abaixo de 10% para qualquer lado é ruído de calendário — fim de semana,
  // feriado, um post que pegou. Chamar isso de tendência gera alarme falso.
  if (Math.abs(resumo.reachDelta) < 10) return [];

  const caiu = resumo.reachDelta < 0;
  return [
    {
      id: "alcance-tendencia",
      area: "Conteúdo",
      peso: caiu ? "atencao" : "oportunidade",
      titulo: caiu ? "O alcance caiu neste período" : "O alcance está crescendo",
      acao: caiu
        ? "Compare o que foi publicado agora com o período anterior: formato, horário e frequência. A queda costuma vir de menos publicações, não de alcance menor por publicação."
        : "Vale repetir o que foi feito: olhe as publicações de maior alcance do período e identifique o que elas têm em comum.",
      evidencia: `Alcance ${caiu ? "caiu" : "subiu"} ${Math.abs(resumo.reachDelta).toFixed(1)}% contra o período anterior (${formatarInteiro(resumo.reach)} pessoas alcançadas).`,
    },
  ];
}

/** Algum formato rende sistematicamente mais que os outros? */
function formatoQueRende(entrada                      )                 {
  const publicados = entrada.posts.filter((post) => post.status === "publicado" && post.metrics);
  if (publicados.length < MINIMOS.postsParaConteudo) return [];

  const porFormato = new Map                                            ();
  for (const post of publicados) {
    // Story fica de fora desta comparação de propósito. O alcance dele é
    // limitado a quem abre stories, e o de um post de feed não é: dizer
    // "publique menos story porque alcança menos" seria comparar coisas que a
    // rede nem entrega para o mesmo conjunto de pessoas. O story aparece na
    // tela de Conteúdo, com a ressalva — só não vira ordem de pauta.
    if (!FORMATOS_DE_FEED.includes(post.format)) continue;

    const atual = porFormato.get(post.format) ?? { total: 0, alcance: 0 };
    atual.total += 1;
    atual.alcance += post.metrics .reach;
    porFormato.set(post.format, atual);
  }

  // Só formatos com amostra suficiente entram na comparação. Um vídeo que
  // viralizou não prova que vídeo é melhor.
  const comparaveis = [...porFormato.entries()]
    .filter(([, dados]) => dados.total >= MINIMOS.postsPorFormato)
    .map(([formato, dados]) => ({
      formato,
      media: dados.alcance / dados.total,
      total: dados.total,
    }))
    .sort((a, b) => b.media - a.media);

  if (comparaveis.length < 2) return [];

  const melhor = comparaveis[0];
  const pior = comparaveis[comparaveis.length - 1];
  if (pior.media <= 0) return [];

  const vantagem = (melhor.media / pior.media - 1) * 100;
  // Menos de 30% de diferença não justifica mudar a pauta.
  if (vantagem < 30) return [];

  return [
    {
      id: "formato-vencedor",
      area: "Conteúdo",
      peso: "oportunidade",
      titulo: `${nomeDoFormato(melhor.formato)} está rendendo mais`,
      acao: `Aumente a proporção de ${nomeDoFormato(melhor.formato).toLowerCase()} na pauta e observe se a vantagem se mantém no próximo período.`,
      evidencia: `${nomeDoFormato(melhor.formato)} alcança em média ${formatarInteiro(melhor.media)} por publicação (${melhor.total} peças), contra ${formatarInteiro(pior.media)} de ${nomeDoFormato(pior.formato).toLowerCase()} (${pior.total} peças) — ${vantagem.toFixed(0)}% a mais.`,
    },
  ];
}

/** O dinheiro investido está comprando alcance a um custo razoável? */
function eficienciaDoInvestimento(entrada                      )                 {
  const todos = todasAsMetricas(entrada);
  const comGasto = todos.filter((dia) => dia.adSpend > 0);
  if (comGasto.length < MINIMOS.diasComInvestimento) return [];

  const investido = comGasto.reduce((soma, dia) => soma + dia.adSpend, 0);
  const alcancePago = comGasto.reduce((soma, dia) => soma + dia.paidReach, 0);
  if (investido <= 0 || alcancePago <= 0) return [];

  // Custo por mil pessoas alcançadas — a medida que o mercado usa e que o
  // cliente reconhece na fatura.
  const custoPorMil = (investido / alcancePago) * 1000;

  const alcanceOrganico = todos.reduce((soma, dia) => soma + dia.organicReach, 0);
  const recomendacoes                 = [];

  // A comparação que importa não é com uma tabela de mercado — que varia por
  // nicho, região e época — e sim com o que a própria conta consegue de graça.
  if (alcanceOrganico > 0 && alcancePago > alcanceOrganico * 2) {
    recomendacoes.push({
      id: "dependencia-de-midia",
      area: "Investimento",
      peso: "atencao",
      titulo: "O alcance depende muito de mídia paga",
      acao: "Vale investir em conteúdo que circule sozinho: quando o orçamento acabar, o alcance cai junto.",
      evidencia: `${formatarInteiro(alcancePago)} de alcance pago contra ${formatarInteiro(alcanceOrganico)} de orgânico no período.`,
    });
  }

  recomendacoes.push({
    id: "custo-por-mil",
    area: "Investimento",
    peso: custoPorMil > 30 ? "atencao" : "oportunidade",
    titulo:
      custoPorMil > 30 ? "O custo do alcance pago está alto" : "O alcance pago está saindo barato",
    acao:
      custoPorMil > 30
        ? "Revise segmentação e criativo: público muito amplo ou anúncio pouco atraente encarecem o alcance."
        : "Se o resultado se mantiver, há espaço para ampliar o orçamento sem perder eficiência.",
    evidencia: `${formatarMoeda(custoPorMil)} por mil pessoas alcançadas — ${formatarMoeda(investido)} investidos em ${comGasto.length} dias.`,
  });

  return recomendacoes;
}

/** Alguma conta parou de receber números? */
function canalParado(entrada                      )                 {
  const recomendacoes                 = [];
  const diasDoPeriodo = PERIOD_DAYS[entrada.period] ?? 90;

  for (const conta of entrada.contas) {
    const dias = entrada.metricasPorConta.get(conta.id) ?? [];
    if (dias.length === 0) {
      // Conta recém-conectada não é conta parada.
      recomendacoes.push({
        id: `sem-dados-${conta.id}`,
        accountId: conta.id,
        area: "Operação",
        peso: "atencao",
        titulo: `${conta.displayName} está sem números`,
        acao: "Registre uma leitura ou sincronize a conta para ela entrar nas comparações.",
        evidencia: `Nenhum dia com dados no período de ${diasDoPeriodo} dias.`,
      });
      continue;
    }

    const ultimo = dias[dias.length - 1];
    const diasParados = Math.floor(
      (entrada.agoraMs - Date.parse(`${ultimo.date}T12:00:00Z`)) / 86400000,
    );

    // Uma semana sem leitura é o ponto em que o painel começa a mentir.
    if (diasParados >= 7) {
      recomendacoes.push({
        id: `parado-${conta.id}`,
        accountId: conta.id,
        area: "Operação",
        peso: diasParados >= 21 ? "risco" : "atencao",
        titulo: `${conta.displayName} está ${diasParados} dias sem atualizar`,
        acao: "Atualize os números desta conta: enquanto ela estiver parada, os totais do projeto estão subestimados.",
        evidencia: `Última leitura em ${ultimo.date}.`,
      });
    }
  }

  return recomendacoes;
}

/** Alguma conta está perdendo mais seguidores do que ganhando? */
function perdaDeSeguidores(entrada                      )                 {
  const recomendacoes                 = [];

  for (const conta of entrada.contas) {
    const dias = entrada.metricasPorConta.get(conta.id) ?? [];
    if (dias.length < MINIMOS.diasParaTendencia) continue;

    const ganhos = dias.reduce((soma, dia) => soma + dia.followersGained, 0);
    const perdidos = dias.reduce((soma, dia) => soma + dia.followersLost, 0);
    if (perdidos <= ganhos) continue;

    recomendacoes.push({
      id: `perda-${conta.id}`,
      accountId: conta.id,
      area: "Audiência",
      peso: "risco",
      titulo: `${conta.displayName} está perdendo seguidores`,
      acao: "Olhe os dias de maior perda e o que foi publicado neles. Queda concentrada em um dia costuma ter uma causa única e identificável.",
      evidencia: `${formatarInteiro(perdidos)} saíram contra ${formatarInteiro(ganhos)} que entraram, em ${dias.length} dias.`,
    });
  }

  return recomendacoes;
}

/** Tem gente esperando resposta há tempo demais? */
function interacoesEsperando(entrada                      )                 {
  if (entrada.interacoesPendentes === 0 || !entrada.pendenteMaisAntigaEm) return [];

  const horas = Math.floor(
    (entrada.agoraMs - Date.parse(entrada.pendenteMaisAntigaEm)) / (60 * 60 * 1000),
  );
  if (horas < 24) return [];

  // As redes fecham a janela de mensagem direta em 24h. Passado esse prazo, a
  // resposta deixa de ser possível — não é só atraso, é oportunidade perdida.
  return [
    {
      id: "inbox-parada",
      area: "Relacionamento",
      peso: horas >= 48 ? "risco" : "atencao",
      titulo: `${entrada.interacoesPendentes} interação(ões) esperando resposta`,
      acao: "Responda as mais antigas primeiro. Depois de 24 horas, a janela de mensagem direta das redes se fecha e a resposta não chega mais.",
      evidencia: `A mais antiga espera há ${horas} horas.`,
    },
  ];
}

/** A conta está publicando com alguma regularidade? */
function frequenciaDePublicacao(entrada                      )                 {
  const todos = todasAsMetricas(entrada);
  if (todos.length < MINIMOS.diasParaTendencia) return [];

  const publicados = entrada.posts.filter((post) => post.status === "publicado");
  const dias = todos.length;
  const porSemana = (publicados.length / dias) * 7;

  if (porSemana >= 2) return [];

  return [
    {
      id: "frequencia-baixa",
      area: "Conteúdo",
      peso: publicados.length === 0 ? "risco" : "atencao",
      titulo:
        publicados.length === 0
          ? "Nenhuma publicação no período"
          : "A frequência de publicação está baixa",
      acao: "Duas publicações por semana é o piso para o alcance não depender só de mídia paga.",
      evidencia:
        publicados.length === 0
          ? `Nenhuma publicação em ${dias} dias de histórico.`
          : `${publicados.length} publicação(ões) em ${dias} dias — ${porSemana.toFixed(1)} por semana.`,
    },
  ];
}

// --- Auxiliares -------------------------------------------------------------

/** Todos os dias de todas as contas, somados por data e recortados ao período. */
function todasAsMetricas(entrada                      )                {
  const porData = new Map                     ();

  for (const conta of entrada.contas) {
    for (const dia of entrada.metricasPorConta.get(conta.id) ?? []) {
      const atual = porData.get(dia.date);
      if (!atual) {
        porData.set(dia.date, { ...dia });
        continue;
      }
      atual.followers += dia.followers;
      atual.followersGained += dia.followersGained;
      atual.followersLost += dia.followersLost;
      atual.organicReach += dia.organicReach;
      atual.paidReach += dia.paidReach;
      atual.organicImpressions += dia.organicImpressions;
      atual.paidImpressions += dia.paidImpressions;
      atual.organicEngagement += dia.organicEngagement;
      atual.paidEngagement += dia.paidEngagement;
      atual.adSpend += dia.adSpend;
    }
  }

  const ordenados = [...porData.values()].sort((a, b) => a.date.localeCompare(b.date));
  return slicePeriod(ordenados, entrada.period);
}

const NOMES_DE_FORMATO                         = {
  imagem: "Imagem",
  carrossel: "Carrossel",
  video: "Vídeo",
  story: "Story",
};

function nomeDoFormato(formato        )         {
  return NOMES_DE_FORMATO[formato] ?? formato;
}

function formatarInteiro(valor        )         {
  return Math.round(valor).toLocaleString("pt-BR");
}

function formatarMoeda(valor        )         {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Resumo por canal, para a visão que compara as contas entre si.
 *
 * Separado de `recomendar` de propósito: uma coisa é o quadro, outra é o
 * conselho. Somar todos os canais responde "como vamos?"; esta função responde
 * "qual canal está puxando, e qual está pesando?", que é a pergunta que leva a
 * uma decisão de onde colocar esforço.
 */
                            
                    
               
                 
                       
                         
                     
                             
                  
                      
                          
                    
                                                     
                       
                       
  

function resumirCanais(
  contas                 ,
  metricasPorConta                            ,
  period           ,
)                 {
  const linhas = contas.map((conta) => {
    const dias = slicePeriod(metricasPorConta.get(conta.id) ?? [], period);
    const resumo = summarize(metricasPorConta.get(conta.id) ?? [], period);
    const alcance = dias.reduce((soma, dia) => soma + dia.organicReach + dia.paidReach, 0);
    const engajamento = dias.reduce(
      (soma, dia) => soma + dia.organicEngagement + dia.paidEngagement,
      0,
    );

    return {
      accountId: conta.id,
      nome: conta.displayName,
      handle: conta.handle,
      networkId: conta.networkId,
      avatarGradient: conta.avatarGradient,
      seguidores: resumo.followers,
      variacaoSeguidores: resumo.followersDelta,
      alcance,
      engajamento,
      taxaEngajamento: alcance > 0 ? (engajamento / alcance) * 100 : 0,
      investido: dias.reduce((soma, dia) => soma + dia.adSpend, 0),
      participacao: 0,
      diasComDados: dias.length,
    };
  });

  const alcanceTotal = linhas.reduce((soma, linha) => soma + linha.alcance, 0);
  for (const linha of linhas) {
    linha.participacao = alcanceTotal > 0 ? linha.alcance / alcanceTotal : 0;
  }

  return linhas.sort((a, b) => b.alcance - a.alcance);
}

  return { MINIMOS, recomendar, resumirCanais };
  })();
  __KS['relacionamento'] = (() => {
                                                                      

/**
 * Regras da área de Relacionamento.
 *
 * A ideia central: uma caixa de entrada trata cada mensagem como um chamado a
 * resolver; o relacionamento trata cada mensagem como uma *pessoa* — a mesma
 * pessoa que já comentou outras dez vezes, ou que apareceu hoje pela primeira
 * vez. Quem já está do lado merece um convite; quem chegou agora merece uma
 * resposta que aproxime.
 *
 * Módulo puro de propósito: nenhuma dependência de servidor, testável direto.
 */

const RELACOES                  = ["nao_seguidor", "seguidor", "apoiador", "defensor"];

                           
                
                    
                                                                                     
                           
                
  

const RELACAO_INFO                                     = {
  nao_seguidor: {
    label: "Não seguidor",
    descricao: "Chegou pelo alcance, ainda não acompanha. Uma boa resposta aqui converte.",
    minimoInteracoes: 0,
    color: "oklch(0.62 0.02 260)",
  },
  seguidor: {
    label: "Seguidor",
    descricao: "Acompanha e interage de vez em quando.",
    minimoInteracoes: 1,
    color: "oklch(0.68 0.14 240)",
  },
  apoiador: {
    label: "Apoiador",
    descricao: "Interage com frequência e responde bem a chamados diretos.",
    minimoInteracoes: 6,
    color: "oklch(0.72 0.16 150)",
  },
  defensor: {
    label: "Defensor",
    descricao: "Compartilha, defende e traz gente nova. É quem amplifica a causa.",
    minimoInteracoes: 20,
    color: "oklch(0.74 0.18 70)",
  },
};

/**
 * Classificação automática a partir do volume de interações.
 *
 * É um ponto de partida, não um veredito: a rede não expõe "esta pessoa me
 * segue" junto de cada comentário, então o número de interações é a melhor
 * evidência disponível. A tela permite corrigir à mão, e a correção manual
 * vence — quem conhece a base é o time, não a heurística.
 */
function classificarPorInteracoes(interacoes        )                {
  if (interacoes >= RELACAO_INFO.defensor.minimoInteracoes) return "defensor";
  if (interacoes >= RELACAO_INFO.apoiador.minimoInteracoes) return "apoiador";
  if (interacoes >= RELACAO_INFO.seguidor.minimoInteracoes) return "seguidor";
  return "nao_seguidor";
}

/** Uma pessoa, consolidada a partir de tudo que ela mandou. */
                      
                 
               
                         
                         
                     
                                           
                     
                                                                
                    
                    
                          
  

/**
 * Junta os itens da caixa por pessoa.
 *
 * O mesmo `@handle` comentando no Instagram e mandando mensagem no Facebook é
 * uma pessoa só — sem isso, o time responde duas vezes e classifica dois graus
 * diferentes para quem, do outro lado, é a mesma gente.
 */
function consolidarPessoas(
  items             ,
  redePorConta                           ,
)           {
  const porHandle = new Map                ();

  for (const item of items) {
    const rede = redePorConta[item.accountId];
    const atual = porHandle.get(item.authorHandle);

    if (!atual) {
      porHandle.set(item.authorHandle, {
        handle: item.authorHandle,
        nome: item.authorName,
        avatarGradient: item.avatarGradient,
        relacao: item.relacao,
        interacoes: item.interacoes,
        redes: rede ? [rede] : [],
        itemIds: [item.id],
        pendentes: item.status === "pendente" ? 1 : 0,
        ultimoContatoEm: item.receivedAt,
      });
      continue;
    }

    // O grau mais alto encontrado vale: se em algum canal a pessoa já foi
    // marcada como defensora, ela não vira seguidora por causa de outro item.
    if (RELACOES.indexOf(item.relacao) > RELACOES.indexOf(atual.relacao)) {
      atual.relacao = item.relacao;
    }
    atual.interacoes = Math.max(atual.interacoes, item.interacoes);
    if (rede && !atual.redes.includes(rede)) atual.redes.push(rede);
    atual.itemIds.push(item.id);
    if (item.status === "pendente") atual.pendentes += 1;
    if (item.receivedAt > atual.ultimoContatoEm) atual.ultimoContatoEm = item.receivedAt;
  }

  return [...porHandle.values()].sort((a, b) => b.ultimoContatoEm.localeCompare(a.ultimoContatoEm));
}

function contarPorRelacao(items             )                                {
  const contagem                                = {
    nao_seguidor: 0,
    seguidor: 0,
    apoiador: 0,
    defensor: 0,
  };
  for (const item of items) contagem[item.relacao] += 1;
  return contagem;
}

/** Variáveis aceitas no texto de uma resposta em lote. */
const VARIAVEIS_MODELO = [
  { chave: "{nome}", descricao: "Primeiro nome de quem recebe" },
  { chave: "{handle}", descricao: "@ da pessoa" },
]         ;

/**
 * Troca as variáveis do modelo pelos dados de quem vai receber.
 *
 * Responder dez pessoas com o texto idêntico é o caminho mais curto para o
 * filtro de spam da rede — e para soar como robô. O modelo com variáveis
 * mantém a mensagem pessoal mesmo quando sai de uma seleção múltipla.
 */
function aplicarModelo(modelo        , pessoa                                  )         {
  const primeiroNome = pessoa.nome.trim().split(/\s+/)[0] ?? pessoa.nome;
  return modelo.replaceAll("{nome}", primeiroNome).replaceAll("{handle}", pessoa.handle);
}

/**
 * Modelos prontos por grau de relação. Servem de ponto de partida na tela —
 * o texto continua editável antes de enviar.
 */
const MODELOS_POR_RELACAO                                                             = {
  nao_seguidor: [
    {
      titulo: "Boas-vindas",
      texto:
        "Oi {nome}, obrigado por comentar! Se quiser acompanhar o que vem por aí, é só seguir a página — postamos novidade toda semana.",
    },
  ],
  seguidor: [
    {
      titulo: "Agradecimento",
      texto: "Valeu, {nome}! Fico feliz que você tenha curtido. Qualquer dúvida, é só chamar.",
    },
  ],
  apoiador: [
    {
      titulo: "Convite para compartilhar",
      texto:
        "{nome}, você sempre acompanha a gente por aqui — obrigado mesmo. Se puder compartilhar esse último conteúdo, ajuda muito a alcançar mais gente.",
    },
  ],
  defensor: [
    {
      titulo: "Convocação",
      texto:
        "{nome}, você é uma das pessoas que mais ajuda a levar isso adiante. Publicamos um conteúdo novo hoje: compartilhar, comentar e reagir nas primeiras horas é o que faz a mensagem chegar em quem ainda não conhece. Conto com você?",
    },
  ],
};

                             
                     
                                                  
  

/**
 * Decide, item a item, quem pode receber a resposta em lote.
 *
 * Comentário público é sempre respondível. Mensagem direta não: a rede só
 * permite responder dentro da janela de 24h depois que a pessoa escreveu, e
 * apenas em contas com a permissão de mensageria aprovada. Bloquear aqui é o
 * que evita uma tentativa que a API recusaria — ou pior, que derrubaria a
 * conta por envio em massa.
 */
function separarEnviaveis(
  items             ,
  contexto   
                    
                                                
                         
   ,
)                {
  const janelaMs = (contexto.janelaHoras ?? 24) * 3600_000;
  const enviados           = [];
  const ignorados                                       = [];

  for (const item of items) {
    if (item.kind === "comentario") {
      enviados.push(item.id);
      continue;
    }

    if (!contexto.mensageriaPorConta[item.accountId]) {
      ignorados.push({
        itemId: item.id,
        motivo: "A conta não tem permissão de mensageria aprovada pela rede.",
      });
      continue;
    }

    const idadeMs = contexto.agoraMs - new Date(item.receivedAt).getTime();
    if (idadeMs > janelaMs) {
      ignorados.push({
        itemId: item.id,
        motivo: "Fora da janela de 24h: a rede só permite responder mensagens recentes.",
      });
      continue;
    }

    enviados.push(item.id);
  }

  return { enviados, ignorados };
}

  return { RELACOES, RELACAO_INFO, classificarPorInteracoes, consolidarPessoas, contarPorRelacao, VARIAVEIS_MODELO, aplicarModelo, MODELOS_POR_RELACAO, separarEnviaveis };
  })();
  return __KS;
})();
