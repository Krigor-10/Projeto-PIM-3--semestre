/* ============================================================
   QUESTOES DO QUIZ — Material CQA/UNIP, Tomo 1
   Análise e Desenvolvimento de Sistemas
   ============================================================ */

export const questoesQuiz = [
  {
    id: 1,
    tema: "Ciclo de Vida de Software",
    introducaoTeorica:
      "1.1. Restrições de projeto\n\nAs restrições de projeto são requisitos de sistema capturados durante a fase de requisitos, nas etapas de concepção e de elaboração do sistema. Essas restrições são limitações ou condições impostas ao sistema, que podem afetar hardware, software, dados e procedimentos operacionais. Exemplos de restrições de projeto incluem prazos de entrega, orçamento disponível, requisitos de qualidade e necessidade de usar tecnologias específicas.\n\nAs restrições de projeto não podem ser confundidas com os objetivos do sistema, embora estejam diretamente relacionados. Um objetivo pode não ser alcançado devido a uma restrição que o limita ou que o impeça.\n\n1.2. Protótipo do sistema\n\nO protótipo é uma simplificação do sistema a ser desenvolvido, feito para permitir ao usuário antever, verificar, experimentar e validar o sistema futuro antes que ele seja realmente construído. O protótipo pode ser usado para: demonstração de uma visão do sistema; validação dos requisitos; clarificação de requisitos vagos; comunicação entre equipe e usuários.\n\n1.3. Processos iterativos\n\nOs processos iterativos de software dividem o projeto em ciclos curtos e repetidos (iterações ou sprints), em que o código é desenvolvido, testado e refinado progressivamente. Vantagens: redução dos riscos; aceleração do desenvolvimento; menor impacto das constantes alterações pedidas pelos usuários.",
    enunciado:
      "Um analista foi contratado para desenvolver um sistema de pesquisa de DVDs em lojas virtuais. O sistema deverá solicitar ao usuário um título de DVD, que será usado para realizar a pesquisa nas bases de dados das lojas conveniadas. Ao detectar a disponibilidade do DVD solicitado, o sistema armazenará temporariamente os dados das lojas (nome, preço, data prevista para entrega do produto) e exibirá as informações ordenadas por preço. Após analisar as informações, o cliente poderá efetuar a compra. O contratante deverá testar algumas operações do sistema antes de ele ser finalizado. Há tempo suficiente para que o analista atenda a essa solicitação e efetue eventuais modificações exigidas pelo contratante.\n\nCom relação a essa situação, avalie as afirmativas a seguir quanto ao modelo de ciclo de vida.\n\nI. O entendimento do sistema como um todo e a execução sequencial das fases sem retorno produzem um sistema que pode ser validado pelo contratante.\n\nII. A elaboração do protótipo pode ser utilizada para resolver dúvidas de comunicação, o que aumenta os riscos de inclusão de novas funcionalidades não prioritárias.\n\nIII. A definição das restrições deve ser a segunda fase a ser realizada no desenvolvimento do projeto, correspondendo à etapa de engenharia.\n\nIV. Um processo iterativo permite que versões progressivas mais completas do sistema sejam construídas e avaliadas.\n\nÉ correto apenas o que se afirma em:",
    alternativas: [
      { letra: "A", texto: "I e II." },
      { letra: "B", texto: "I e III." },
      { letra: "C", texto: "II e III." },
      { letra: "D", texto: "II e IV." },
      { letra: "E", texto: "III e IV." },
    ],
    gabarito: "D",
    analiseDasAfirmativas:
      "I – Afirmativa incorreta.\nA execução sequencial das fases, sem retorno, não capturará as alterações nem as correções identificadas nas fases posteriores, sejam elas originadas internamente pelos usuários ou externamente por mudanças em legislações ou em regras.\n\nII – Afirmativa correta.\nO protótipo facilita a resolução de dúvidas de comunicação, mas, também, dá ao usuário a oportunidade de criar novas necessidades (prioritárias ou não), pois ele tem uma antevisão do que será o sistema.\n\nIII – Afirmativa incorreta.\nNa etapa de engenharia, o objetivo é ter uma visão global do sistema, incluindo hardware, software, equipamentos e pessoas envolvidas. O detalhamento das restrições é feito em etapas posteriores.\n\nIV – Afirmativa correta.\nO processo iterativo permite versões progressivas mais completas por meio de incrementos. A cada iteração, uma nova versão produtiva é completada e se aproxima mais do objetivo de desenvolvimento do produto.",
    anulada: false,
  },
  {
    id: 2,
    tema: "Orientação a Objetos",
    introducaoTeorica:
      "Conceitos de programação orientada a objetos\n\nA orientação a objetos é um paradigma de programação que modulariza o código-fonte de um sistema em torno de objetos, que são entidades que combinam características (atributos) e comportamentos (métodos) relacionados em uma única unidade.\n\nSobrecarga: provisão de mais de uma versão para um mesmo método, diferenciadas pela assinatura (quantidade ou tipo de parâmetros). Exemplo: Point p1 = new Point(); // padrão | Point p2 = new Point(1,2); // sobrecarregado.\n\nHerança: mecanismo pelo qual uma classe (subclasse) herda as propriedades de outra (superclasse), seus atributos e métodos. Exemplo de hierarquia: Animal -> Mamifero -> Cachorro.\n\nSobreposição: ocorre quando um método na subclasse é declarado com o mesmo nome e lista de argumentos do método na superclasse, reescrevendo seu comportamento interno.\n\nAbstração: limitação de um amplo universo a um domínio específico, focando apenas nos objetos e comportamentos relevantes para a aplicação. Exemplo: em um sistema de Aluguel de Carros, não se usaria o conceito de submarino.\n\nMensagem: solicitação feita de um objeto para outro, geralmente por meio de uma chamada de método.",
    enunciado:
      "Uma pizzaria fez uma ampliação de suas instalações e o gerente aproveitou para melhorar o sistema informatizado, que era limitado e não atendia a todas as funções necessárias. O gerente, então, contratou uma empresa para ampliar o software. No desenvolvimento do novo sistema, a empresa aproveitou partes do sistema antigo e estendeu os componentes de maneira a usar código validado, acrescentando as novas funções solicitadas.\n\nQue conceito de orientação a objetos está descrito na situação hipotética acima?",
    alternativas: [
      { letra: "A", texto: "Sobrecarga." },
      { letra: "B", texto: "Herança." },
      { letra: "C", texto: "Sobreposição." },
      { letra: "D", texto: "Abstração." },
      { letra: "E", texto: "Mensagem." },
    ],
    gabarito: "B",
    analiseDasAfirmativas:
      "A – Alternativa incorreta.\nA sobrecarga não permite o reaproveitamento nem a extensão de partes do sistema antigo, pois ela simplesmente gera novas versões dos métodos com assinaturas diferentes. Esses códigos terão de ser novamente testados e validados.\n\nB – Alternativa correta.\nA herança aproveita tudo que foi desenvolvido e aprovado na superclasse, possibilitando o uso nas subclasses como código já testado e validado.\n\nC – Alternativa incorreta.\nA sobreposição não aproveita partes antigas, mas as substitui. Esse novo código também terá de ser testado e validado.\n\nD – Alternativa incorreta.\nA abstração é um conceito que nada tem a ver com o reaproveitamento de código.\n\nE – Alternativa incorreta.\nA mensagem é um conceito que se refere à comunicação entre objetos, nada tendo a ver com o reaproveitamento de código em componentes já desenvolvidos.",
    anulada: false,
  },
  {
    id: 3,
    tema: "Qualidade de Software",
    introducaoTeorica:
      "Interoperabilidade, confiabilidade, portabilidade e usabilidade\n\nInteroperabilidade: habilidade de dois ou mais sistemas de tecnologia da informação de interagirem e intercambiarem dados de acordo com um método definido, obtendo os resultados esperados.\n\nConfiabilidade: probabilidade de um software operar sem ocorrência de falhas durante um período especificado em determinado ambiente. Subcaracterísticas: maturidade, tolerância a falhas, recuperabilidade e conformidade.\n\nPortabilidade: capacidade de transferência de software ou hardware de um ambiente para outro, com garantia de pleno funcionamento. Os ambientes podem diferir em sistemas operacionais (Windows, Linux, macOS), arquiteturas de hardware (x86, ARM) ou plataformas (desktop, mobile, web).\n\nUsabilidade: garantia do uso eficiente e confortável dos sistemas computacionais por seus diversos tipos de usuários. Inclui inteligibilidade (fácil entendimento), apreensibilidade (fácil aprendizado), operacionalidade (fácil uso) e atratividade (agradável aos sentidos).",
    enunciado:
      "Uma indústria de alimentos compra sementes de vários fornecedores. No recebimento das cargas, as sementes passam por uma operação de classificação por cor, em uma esteira adquirida do fabricante MAQ, equipada com sensores e software de processamento de imagens. Na etapa seguinte do processo, as sementes são separadas em lotes, pelo critério de tamanho, e são, então, empacotadas. A separação dos lotes é realizada por um mecanismo robótico, controlado remotamente por um funcionário por meio de uma interface gráfica. Pelo fato de o mecanismo robótico sofrer contínuo desgaste, ele necessita ser substituído a cada 1.000 horas de uso. Durante a última troca, em razão da indisponibilidade do equipamento produzido pela empresa MAQ, a indústria instalou, com sucesso, um equipamento robótico similar.\n\nConsiderando o processo descrito, julgue os itens a seguir, relacionados aos fatores de qualidade.\n\nI. As operações de classificação e separação de sementes se inter-relacionam e não podem falhar, pois essa falha acarretaria prejuízos. O atributo de qualidade correspondente a essas operações, e que deve ser observado pelo software, é a interoperabilidade.\n\nII. Caso o responsável pela instalação do sistema robotizado não tenha encontrado dificuldade em fazê-lo comunicar-se com o equipamento de outra marca, é correto concluir que o sistema que controla o robô é portável.\n\nIII. A maneira como ocorre a interação com o sistema computacional sugere que alguns requisitos, como ergonomia, sejam observados na interface. Por isso, é correto concluir que o software utilizado pela indústria deve contemplar o fator denominado usabilidade.\n\nAssinale a opção correta.",
    alternativas: [
      { letra: "A", texto: "Apenas um item está certo." },
      { letra: "B", texto: "Apenas os itens I e II estão certos." },
      { letra: "C", texto: "Apenas os itens I e III estão certos." },
      { letra: "D", texto: "Apenas os itens II e III estão certos." },
      { letra: "E", texto: "Todos os itens estão certos." },
    ],
    gabarito: "A",
    analiseDasAfirmativas:
      "I – Afirmativa incorreta.\nOperações de classificação e separação de sementes não podem falhar. O atributo que corresponde a essas operações é a confiabilidade (não a interoperabilidade).\n\nII – Afirmativa incorreta.\nA substituição do robô por um equipamento de outra marca não significa portabilidade, pois o ambiente de operação é mantido. O novo robô é que tem uma interface compatível com o sistema atual. A fácil comunicação entre sistemas de marcas diferentes indica interoperabilidade.\n\nIII – Afirmativa correta.\nPreocupações com ergonomia e com a forma de interação do usuário estão diretamente ligadas ao fator usabilidade do sistema.\n\nPortanto, apenas o item III está correto — alternativa A.",
    anulada: false,
  },
];
