/* ============================================================
   QUESTOES DO QUIZ — Material CQA/UNIP, Tomo 1
   Análise e Desenvolvimento de Sistemas
   ============================================================ */

export const questoesQuiz = [
  {
    id: 1,
    tema: "Ciclo de Vida de Software",
    introducaoTeorica:
      "1.1. Restricoes de projeto\n\nAs restricoes de projeto sao requisitos de sistema capturados durante a fase de requisitos, nas etapas de concepcao e de elaboracao do sistema. Essas restricoes sao limitacoes ou condicoes impostas ao sistema, que podem afetar hardware, software, dados e procedimentos operacionais. Exemplos de restricoes de projeto incluem prazos de entrega, orcamento disponivel, requisitos de qualidade e necessidade de usar tecnologias especificas.\n\nAs restricoes de projeto nao podem ser confundidas com os objetivos do sistema, embora estejam diretamente relacionados. Um objetivo pode nao ser alcancado devido a uma restricao que o limita ou que o impeca.\n\n1.2. Prototipo do sistema\n\nO prototipo e uma simplificacao do sistema a ser desenvolvido, feito para permitir ao usuario antever, verificar, experimentar e validar o sistema futuro antes que ele seja realmente construido. O prototipo pode ser usado para: demonstracao de uma visao do sistema; validacao dos requisitos; clarificacao de requisitos vagos; comunicacao entre equipe e usuarios.\n\n1.3. Processos iterativos\n\nOs processos iterativos de software dividem o projeto em ciclos curtos e repetidos (iteracoes ou sprints), em que o codigo e desenvolvido, testado e refinado progressivamente. Vantagens: reducao dos riscos; aceleracao do desenvolvimento; menor impacto das constantes alteracoes pedidas pelos usuarios.",
    enunciado:
      "Um analista foi contratado para desenvolver um sistema de pesquisa de DVDs em lojas virtuais. O sistema devera solicitar ao usuario um titulo de DVD, que sera usado para realizar a pesquisa nas bases de dados das lojas conveniadas. Ao detectar a disponibilidade do DVD solicitado, o sistema armazenara temporariamente os dados das lojas (nome, preco, data prevista para entrega do produto) e exibira as informacoes ordenadas por preco. Apos analisar as informacoes, o cliente podera efetuar a compra. O contratante devera testar algumas operacoes do sistema antes de ele ser finalizado. Ha tempo suficiente para que o analista atenda a essa solicitacao e efetue eventuais modificacoes exigidas pelo contratante.\n\nCom relacao a essa situacao, avalie as afirmativas a seguir quanto ao modelo de ciclo de vida.\n\nI. O entendimento do sistema como um todo e a execucao sequencial das fases sem retorno produzem um sistema que pode ser validado pelo contratante.\n\nII. A elaboracao do prototipo pode ser utilizada para resolver duvidas de comunicacao, o que aumenta os riscos de inclusao de novas funcionalidades nao prioritarias.\n\nIII. A definicao das restricoes deve ser a segunda fase a ser realizada no desenvolvimento do projeto, correspondendo a etapa de engenharia.\n\nIV. Um processo iterativo permite que versoes progressivas mais completas do sistema sejam construidas e avaliadas.\n\nE correto apenas o que se afirma em",
    alternativas: [
      { letra: "A", texto: "I e II." },
      { letra: "B", texto: "I e III." },
      { letra: "C", texto: "II e III." },
      { letra: "D", texto: "II e IV." },
      { letra: "E", texto: "III e IV." },
    ],
    gabarito: "D",
    analiseDasAfirmativas:
      "I – Afirmativa incorreta.\nA execucao sequencial das fases, sem retorno, nao capturara as alteracoes nem as correcoes identificadas nas fases posteriores, sejam elas originadas internamente pelos usuarios ou externamente por mudancas em legislacoes ou em regras.\n\nII – Afirmativa correta.\nO prototipo facilita a resolucao de duvidas de comunicacao, mas, tambem, da ao usuario a oportunidade de criar novas necessidades (prioritarias ou nao), pois ele tem uma antevisao do que sera o sistema.\n\nIII – Afirmativa incorreta.\nNa etapa de engenharia, o objetivo e ter uma visao global do sistema, incluindo hardware, software, equipamentos e pessoas envolvidas. O detalhamento das restricoes e feito em etapas posteriores.\n\nIV – Afirmativa correta.\nO processo iterativo permite versoes progressivas mais completas por meio de incrementos. A cada iteracao, uma nova versao produtiva e completada e se aproxima mais do objetivo de desenvolvimento do produto.",
    anulada: false,
  },
  {
    id: 2,
    tema: "Orientacao a Objetos",
    introducaoTeorica:
      "Conceitos de programacao orientada a objetos\n\nA orientacao a objetos e um paradigma de programacao que modulariza o codigo-fonte de um sistema em torno de objetos, que sao entidades que combinam caracteristicas (atributos) e comportamentos (metodos) relacionados em uma unica unidade.\n\nSobrecarga: provisao de mais de uma versao para um mesmo metodo, diferenciadas pela assinatura (quantidade ou tipo de parametros). Exemplo: Point p1 = new Point(); // padrao | Point p2 = new Point(1,2); // sobrecarregado.\n\nHeranca: mecanismo pelo qual uma classe (subclasse) herda as propriedades de outra (superclasse), seus atributos e metodos. Exemplo de hierarquia: Animal -> Mamifero -> Cachorro.\n\nSobreposicao: ocorre quando um metodo na subclasse e declarado com o mesmo nome e lista de argumentos do metodo na superclasse, reescrevendo seu comportamento interno.\n\nAbstracao: limitacao de um amplo universo a um dominio especifico, focando apenas nos objetos e comportamentos relevantes para a aplicacao. Exemplo: em um sistema de Aluguel de Carros, nao se usaria o conceito de submarino.\n\nMensagem: solicitacao feita de um objeto para outro, geralmente por meio de uma chamada de metodo.",
    enunciado:
      "Uma pizzaria fez uma ampliacao de suas instalacoes e o gerente aproveitou para melhorar o sistema informatizado, que era limitado e nao atendia a todas as funcoes necessarias. O gerente, entao, contratou uma empresa para ampliar o software. No desenvolvimento do novo sistema, a empresa aproveitou partes do sistema antigo e estendeu os componentes de maneira a usar codigo validado, acrescentando as novas funcoes solicitadas.\n\nQue conceito de orientacao a objetos esta descrito na situacao hipotetica acima?",
    alternativas: [
      { letra: "A", texto: "Sobrecarga." },
      { letra: "B", texto: "Heranca." },
      { letra: "C", texto: "Sobreposicao." },
      { letra: "D", texto: "Abstracao." },
      { letra: "E", texto: "Mensagem." },
    ],
    gabarito: "B",
    analiseDasAfirmativas:
      "A – Alternativa incorreta.\nA sobrecarga nao permite o reaproveitamento nem a extensao de partes do sistema antigo, pois ela simplesmente gera novas versoes dos metodos com assinaturas diferentes. Esses codigos terao de ser novamente testados e validados.\n\nB – Alternativa correta.\nA heranca aproveita tudo que foi desenvolvido e aprovado na superclasse, possibilitando o uso nas subclasses como codigo ja testado e validado.\n\nC – Alternativa incorreta.\nA sobreposicao nao aproveita partes antigas, mas as substitui. Esse novo codigo tambem tera de ser testado e validado.\n\nD – Alternativa incorreta.\nA abstracao e um conceito que nada tem a ver com o reaproveitamento de codigo.\n\nE – Alternativa incorreta.\nA mensagem e um conceito que se refere a comunicacao entre objetos, nada tendo a ver com o reaproveitamento de codigo em componentes ja desenvolvidos.",
    anulada: false,
  },
  {
    id: 3,
    tema: "Qualidade de Software",
    introducaoTeorica:
      "Interoperabilidade, confiabilidade, portabilidade e usabilidade\n\nInteroperabilidade: habilidade de dois ou mais sistemas de tecnologia da informacao de interagirem e intercambiarem dados de acordo com um metodo definido, obtendo os resultados esperados.\n\nConfiabilidade: probabilidade de um software operar sem ocorrencia de falhas durante um periodo especificado em determinado ambiente. Subcaracteristicas: maturidade, tolerancia a falhas, recuperabilidade e conformidade.\n\nPortabilidade: capacidade de transferencia de software ou hardware de um ambiente para outro, com garantia de pleno funcionamento. Os ambientes podem diferir em sistemas operacionais (Windows, Linux, macOS), arquiteturas de hardware (x86, ARM) ou plataformas (desktop, mobile, web).\n\nUsabilidade: garantia do uso eficiente e confortavel dos sistemas computacionais por seus diversos tipos de usuarios. Inclui inteligibilidade (facil entendimento), apreensibilidade (facil aprendizado), operacionalidade (facil uso) e atratividade (agradavel aos sentidos).",
    enunciado:
      "Uma industria de alimentos compra sementes de varios fornecedores. No recebimento das cargas, as sementes passam por uma operacao de classificacao por cor, em uma esteira adquirida do fabricante MAQ, equipada com sensores e software de processamento de imagens. Na etapa seguinte do processo, as sementes sao separadas em lotes, pelo criterio de tamanho, e sao, entao, empacotadas. A separacao dos lotes e realizada por um mecanismo robotico, controlado remotamente por um funcionario por meio de uma interface grafica. Pelo fato de o mecanismo robotico sofrer continuo desgaste, ele necessita ser substituido a cada 1.000 horas de uso. Durante a ultima troca, em razao da indisponibilidade do equipamento produzido pela empresa MAQ, a industria instalou, com sucesso, um equipamento robotico similar.\n\nConsiderando o processo descrito, julgue os itens a seguir, relacionados aos fatores de qualidade.\n\nI. As operacoes de classificacao e separacao de sementes se interrelacionam e nao podem falhar, pois essa falha acarretaria prejuizos. O atributo de qualidade correspondente a essas operacoes, e que deve ser observado pelo software, e a interoperabilidade.\n\nII. Caso o responsavel pela instalacao do sistema robotizado nao tenha encontrado dificuldade em faze-lo comunicar-se com o equipamento de outra marca, e correto concluir que o sistema que controla o robo e portavel.\n\nIII. A maneira como ocorre a interacao com o sistema computacional sugere que alguns requisitos, como ergonomia, sejam observados na interface. Por isso, e correto concluir que o software utilizado pela industria deve contemplar o fator denominado usabilidade.\n\nAssinale a opcao correta.",
    alternativas: [
      { letra: "A", texto: "Apenas um item esta certo." },
      { letra: "B", texto: "Apenas os itens I e II estao certos." },
      { letra: "C", texto: "Apenas os itens I e III estao certos." },
      { letra: "D", texto: "Apenas os itens II e III estao certos." },
      { letra: "E", texto: "Todos os itens estao certos." },
    ],
    gabarito: "A",
    analiseDasAfirmativas:
      "I – Afirmativa incorreta.\nOperacoes de classificacao e separacao de sementes nao podem falhar. O atributo que corresponde a essas operacoes e a confiabilidade (nao a interoperabilidade).\n\nII – Afirmativa incorreta.\nA substituicao do robo por um equipamento de outra marca nao significa portabilidade, pois o ambiente de operacao e mantido. O novo robo e que tem uma interface compativel com o sistema atual. A facil comunicacao entre sistemas de marcas diferentes indica interoperabilidade.\n\nIII – Afirmativa correta.\nPreocupacoes com ergonomia e com a forma de interacao do usuario estao diretamente ligadas ao fator usabilidade do sistema.\n\nPortanto, apenas o item III esta correto — alternativa A.",
    anulada: false,
  },
];
