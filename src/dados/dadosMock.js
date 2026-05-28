/* ============================================================
   CODERYSE ACADEMY — DADOS MOCKADOS
   Simula todas as respostas da API sem backend.
   Cursos disponíveis: Desenvolvimento Web, Ciência de Dados,
   Inteligência Artificial, Cybersegurança, UX e UI Design, Robótica.
   ============================================================ */

/* ── Perfis de demonstração (tela de login) ─────────────────── */
export const perfisDemo = [
  {
    chave: "aluno",
    rotulo: "Aluno",
    icone: "AL",
    descricao: "Maria Isabela — Desenvolvimento Web",
  },
  {
    chave: "professor",
    rotulo: "Professor",
    icone: "PR",
    descricao: "Prof. Heitor Nadir — Cybersegurança",
  },
  {
    chave: "coordenador",
    rotulo: "Coordenador",
    icone: "CO",
    descricao: "Coord. Nicolas Pimentel",
  },
  {
    chave: "admin",
    rotulo: "Administrador",
    icone: "AD",
    descricao: "Krigor de Sousa — Admin Geral",
  },
];

/* ── Usuários por perfil de login (sessão mockada) ───────────── */
export const usuariosPorPerfil = {
  aluno: {
    id: 1,
    nome: "Maria Isabela Branco",
    email: "maria.isabela@coderyse.com",
    tipo: "Aluno",
    codigoAluno: "ALU-2024-001",
    telefone: "(11) 98765-4321",
    cidade: "São Paulo",
    estado: "SP",
  },
  professor: {
    id: 2,
    nome: "Heitor Henrique Nadir",
    email: "heitor.nadir@coderyse.com",
    tipo: "Professor",
    telefone: "(11) 91234-5678",
    cidade: "São Paulo",
    estado: "SP",
  },
  coordenador: {
    id: 3,
    nome: "Nicolas Pimentel",
    email: "nicolas.pimentel@coderyse.com",
    tipo: "Coordenador",
    telefone: "(11) 99876-5432",
    cidade: "Campinas",
    estado: "SP",
  },
  admin: {
    id: 4,
    nome: "Krigor de Sousa",
    email: "krigor@coderyse.com",
    tipo: "Admin",
    telefone: "(11) 97654-3210",
    cidade: "São Paulo",
    estado: "SP",
  },
};

/* ── Catálogo de cursos ─────────────────────────────────────── */
export const cursos = [
  {
    id: 1,
    codigoRegistro: "CRS-001",
    titulo: "Desenvolvimento Web",
    descricao: "HTML, CSS, JavaScript, React e Node.js do zero ao deploy completo.",
    preco: 1299.9,
    totalModulos: 8,
    totalAlunos: 142,
    nivel: "Iniciante",
    ativo: true,
    visivelCatalogo: true,
    destaque: true,
    coordenadorId: 3,
  },
  {
    id: 2,
    codigoRegistro: "CRS-002",
    titulo: "Ciência de Dados",
    descricao: "Python, Pandas, NumPy, visualização de dados e Machine Learning na prática.",
    preco: 1499.9,
    totalModulos: 10,
    totalAlunos: 98,
    nivel: "Intermediário",
    ativo: true,
    visivelCatalogo: true,
    destaque: false,
    coordenadorId: 3,
  },
  {
    id: 3,
    codigoRegistro: "CRS-003",
    titulo: "Inteligência Artificial",
    descricao: "LLMs, redes neurais, RAG, embeddings e integração com APIs de IA generativa.",
    preco: 1890.0,
    totalModulos: 11,
    totalAlunos: 54,
    nivel: "Avançado",
    ativo: true,
    visivelCatalogo: true,
    destaque: true,
    coordenadorId: 3,
  },
  {
    id: 4,
    codigoRegistro: "CRS-004",
    titulo: "Cybersegurança",
    descricao: "Fundamentos de segurança ofensiva e defensiva, OWASP, pentest e criptografia.",
    preco: 1750.0,
    totalModulos: 9,
    totalAlunos: 67,
    nivel: "Avançado",
    ativo: true,
    visivelCatalogo: true,
    destaque: false,
    coordenadorId: 3,
  },
  {
    id: 5,
    codigoRegistro: "CRS-005",
    titulo: "UX e UI Design",
    descricao: "Pesquisa de usuário, prototipação, design system e entrega de projetos no Figma.",
    preco: 999.9,
    totalModulos: 6,
    totalAlunos: 115,
    nivel: "Iniciante",
    ativo: true,
    visivelCatalogo: true,
    destaque: false,
    coordenadorId: null,
  },
  {
    id: 6,
    codigoRegistro: "CRS-006",
    titulo: "Robótica",
    descricao: "Eletrônica básica, Arduino, microcontroladores, sensores e introdução ao ROS.",
    preco: 1590.0,
    totalModulos: 8,
    totalAlunos: 38,
    nivel: "Intermediário",
    ativo: true,
    visivelCatalogo: true,
    destaque: false,
    coordenadorId: null,
  },
];

/* ── Módulos por curso ───────────────────────────────────────── */
export const modulos = [
  /* Desenvolvimento Web (cursoId: 1) */
  { id: 1, cursoId: 1, codigoRegistro: "MOD-001", titulo: "Fundamentos de HTML5", ordem: 1, totalConteudos: 3 },
  { id: 2, cursoId: 1, codigoRegistro: "MOD-002", titulo: "CSS3 e Responsividade", ordem: 2, totalConteudos: 3 },

  /* Ciência de Dados (cursoId: 2) */
  { id: 6,  cursoId: 2, codigoRegistro: "MOD-006", titulo: "Python para Análise de Dados",  ordem: 1, totalConteudos: 10 },
  { id: 7,  cursoId: 2, codigoRegistro: "MOD-007", titulo: "Pandas e Visualização",          ordem: 2, totalConteudos: 8  },

  /* Inteligência Artificial (cursoId: 3) */
  { id: 8,  cursoId: 3, codigoRegistro: "MOD-008", titulo: "Fundamentos de IA",              ordem: 1, totalConteudos: 9  },
  { id: 9,  cursoId: 3, codigoRegistro: "MOD-009", titulo: "Redes Neurais com Python",       ordem: 2, totalConteudos: 11 },

  /* Cybersegurança (cursoId: 4) */
  { id: 10, cursoId: 4, codigoRegistro: "MOD-010", titulo: "Fundamentos de Cybersegurança",  ordem: 1, totalConteudos: 8  },
  { id: 11, cursoId: 4, codigoRegistro: "MOD-011", titulo: "Pentest e OWASP",                ordem: 2, totalConteudos: 10 },

  /* UX e UI Design (cursoId: 5) */
  { id: 12, cursoId: 5, codigoRegistro: "MOD-012", titulo: "Design Thinking e Pesquisa",     ordem: 1, totalConteudos: 7  },
  { id: 13, cursoId: 5, codigoRegistro: "MOD-013", titulo: "Prototipação com Figma",         ordem: 2, totalConteudos: 9  },

  /* Robótica (cursoId: 6) */
  { id: 14, cursoId: 6, codigoRegistro: "MOD-014", titulo: "Eletrônica para Robótica",       ordem: 1, totalConteudos: 8  },
  { id: 15, cursoId: 6, codigoRegistro: "MOD-015", titulo: "Arduino e Sensores",             ordem: 2, totalConteudos: 10 },
];

/* ── Turmas ──────────────────────────────────────────────────── */
export const turmas = [
  { id: 1, nomeTurma: "WEB-2024-A",   cursoId: 1, cursoTitulo: "Desenvolvimento Web",    professorId: 2, professorNome: "Heitor Nadir",   totalAlunos: 60, status: "Ativa"     },
  { id: 3, nomeTurma: "DATA-2024-A",  cursoId: 2, cursoTitulo: "Ciência de Dados",       professorId: 5, professorNome: "Ana Carvalho",   totalAlunos: 25, status: "Ativa"     },
  { id: 7, nomeTurma: "IA-2024-A",    cursoId: 3, cursoTitulo: "Inteligência Artificial", professorId: 5, professorNome: "Ana Carvalho",  totalAlunos: 20, status: "Ativa"     },
  { id: 4, nomeTurma: "CYBER-2024-A", cursoId: 4, cursoTitulo: "Cybersegurança",         professorId: 2, professorNome: "Heitor Nadir",   totalAlunos: 22, status: "Ativa"     },
  { id: 5, nomeTurma: "UX-2024-A",    cursoId: 5, cursoTitulo: "UX e UI Design",         professorId: 7, professorNome: "Fernanda Lima",  totalAlunos: 30, status: "Concluída" },
  { id: 6, nomeTurma: "ROB-2024-A",   cursoId: 6, cursoTitulo: "Robótica",               professorId: 6, professorNome: "Carlos Mendes",  totalAlunos: 18, status: "Ativa"     },
];

/* ── Matrículas ──────────────────────────────────────────────── */
export const matriculas = [
  { id: 1,  alunoId: 1,  alunoNome: "Maria Isabela Branco", cursoId: 1, cursoTitulo: "Desenvolvimento Web", turmaId: 1, turmaNome: "WEB-2024-A",   codigoMatricula: "MAT-2024-001", status: "Aprovada",  dataSolicitacao: "2024-02-10" },
  { id: 20, alunoId: 1,  alunoNome: "Maria Isabela Branco", cursoId: 5, cursoTitulo: "UX e UI Design",       turmaId: 5, turmaNome: "UX-2024-A",    codigoMatricula: "MAT-2023-020", status: "Aprovada",  dataSolicitacao: "2023-09-05" },
  { id: 2, alunoId: 8,  alunoNome: "João Pedro Alves",     cursoId: 1, cursoTitulo: "Desenvolvimento Web", turmaId: 1, turmaNome: "WEB-2024-A",   codigoMatricula: "MAT-2024-002", status: "Aprovada",  dataSolicitacao: "2024-02-11" },
  { id: 3, alunoId: 9,  alunoNome: "Lucas Ferreira",       cursoId: 2, cursoTitulo: "Ciência de Dados",    turmaId: 3, turmaNome: "DATA-2024-A",  codigoMatricula: "MAT-2024-003", status: "Pendente",  dataSolicitacao: "2024-03-15" },
  { id: 4, alunoId: 10, alunoNome: "Camila Rodrigues",     cursoId: 4, cursoTitulo: "Cybersegurança",      turmaId: 4, turmaNome: "CYBER-2024-A", codigoMatricula: "MAT-2024-004", status: "Pendente",  dataSolicitacao: "2024-03-18" },
  { id: 5, alunoId: 11, alunoNome: "Rafael Souza",         cursoId: 5, cursoTitulo: "UX e UI Design",      turmaId: 5, turmaNome: "UX-2024-A",    codigoMatricula: "MAT-2024-005", status: "Rejeitada", dataSolicitacao: "2024-01-20" },
  { id: 6, alunoId: 12, alunoNome: "Juliana Castro",       cursoId: 6, cursoTitulo: "Robótica",            turmaId: 6, turmaNome: "ROB-2024-A",   codigoMatricula: "MAT-2024-006", status: "Aprovada",  dataSolicitacao: "2024-03-01" },
  { id: 7, alunoId: 13, alunoNome: "Felipe Oliveira",      cursoId: 1, cursoTitulo: "Desenvolvimento Web", turmaId: 1, turmaNome: "WEB-2024-A",   codigoMatricula: "MAT-2024-007", status: "Pendente",  dataSolicitacao: "2024-03-20" },
];

/* ── Avaliações ──────────────────────────────────────────────── */
export const avaliacoes = [
  { id: 1, titulo: "Prova 1 — HTML e CSS",              cursoId: 1, cursoTitulo: "Desenvolvimento Web",    moduloId: 2,  tentativasPermitidas: 2, tempoLimiteMinutos: 60,  notaMaxima: 10, totalQuestoes: 10, status: "Publicada", novo: true },
  { id: 2, titulo: "Prova 2 — JavaScript Avançado",     cursoId: 1, cursoTitulo: "Desenvolvimento Web",    moduloId: 3,  tentativasPermitidas: 1, tempoLimiteMinutos: 90,  notaMaxima: 10, totalQuestoes: 15, status: "Publicada", novo: true },
  { id: 4, titulo: "Avaliação — Python e Pandas",       cursoId: 2, cursoTitulo: "Ciência de Dados",       moduloId: 6,  tentativasPermitidas: 3, tempoLimiteMinutos: 45,  notaMaxima: 10, totalQuestoes: 8,  status: "Publicada" },
  { id: 5, titulo: "Quiz — Fundamentos de IA",          cursoId: 3, cursoTitulo: "Inteligência Artificial", moduloId: 8,  tentativasPermitidas: 2, tempoLimiteMinutos: 30,  notaMaxima: 10, totalQuestoes: 5,  status: "Publicada" },
  { id: 6, titulo: "Prova — OWASP e Pentest",           cursoId: 4, cursoTitulo: "Cybersegurança",          moduloId: 11, tentativasPermitidas: 1, tempoLimiteMinutos: 60,  notaMaxima: 10, totalQuestoes: 12, status: "Publicada" },
  { id: 7, titulo: "Avaliação — Prototipação Figma",    cursoId: 5, cursoTitulo: "UX e UI Design",          moduloId: 13, tentativasPermitidas: 2, tempoLimiteMinutos: 40,  notaMaxima: 10, totalQuestoes: 8,  status: "Publicada" },
  { id: 8, titulo: "Prova — Arduino e Sensores",        cursoId: 6, cursoTitulo: "Robótica",                moduloId: 15, tentativasPermitidas: 2, tempoLimiteMinutos: 50,  notaMaxima: 10, totalQuestoes: 10, status: "Rascunho"  },
];

/* ── Conteúdos (ligados aos módulos do Desenvolvimento Web) ──── */
export const conteudos = [
  { id: 1, moduloId: 1, titulo: "Introdução ao HTML5",             tipo: "Video",     duracao: "18min", concluido: false },
  { id: 2, moduloId: 1, titulo: "Estrutura semântica",             tipo: "Video",     duracao: "22min", concluido: false },
  { id: 3, moduloId: 1, titulo: "Formulários e inputs",            tipo: "Texto",     duracao: "15min", concluido: false },
  { id: 4, moduloId: 2, titulo: "Flexbox na prática",              tipo: "Video",     duracao: "30min", concluido: false },
  { id: 5, moduloId: 2, titulo: "CSS Grid",                        tipo: "Video",     duracao: "28min", concluido: false },
  { id: 6, moduloId: 2, titulo: "Media Queries e responsividade",  tipo: "Documento", duracao: "20min", concluido: false },
  { id: 7, moduloId: 3, titulo: "Arrow functions e destructuring", tipo: "Video",     duracao: "25min", concluido: false },
  { id: 8, moduloId: 3, titulo: "Promises e Async/Await",          tipo: "Video",     duracao: "35min", concluido: false, novo: true },
];

/* ── Progresso da aluna demo (Maria Isabela) ────────────────── */
export const progressoAluno = {
  cursos: [
    { cursoId: 1, cursoTitulo: "Desenvolvimento Web", percentual: 42, status: "Em andamento", ultimoAcesso: "2024-03-19" },
  ],
  modulos: [
    { moduloId: 1, moduloTitulo: "Fundamentos de HTML5",     percentual: 100, status: "Concluído"    },
    { moduloId: 2, moduloTitulo: "CSS3 e Responsividade",     percentual: 40,  status: "Em andamento" },
  ],
};

/* ── Lista completa de usuários ─────────────────────────────── */
export const usuarios = [
  { id: 1,  nome: "Maria Isabela Branco",   email: "maria.isabela@coderyse.com",    tipo: "Aluno",       codigo: "ALU-2024-001", ativo: true,  dataCadastro: "2024-01-15" },
  { id: 2,  nome: "Heitor Henrique Nadir",  email: "heitor.nadir@coderyse.com",     tipo: "Professor",   codigo: "PRF-2023-001", ativo: true,  dataCadastro: "2023-08-01" },
  { id: 3,  nome: "Nicolas Pimentel",       email: "nicolas.pimentel@coderyse.com", tipo: "Coordenador", codigo: "CRD-2023-001", ativo: true,  dataCadastro: "2023-07-20" },
  { id: 4,  nome: "Krigor de Sousa",        email: "krigor@coderyse.com",            tipo: "Admin",       codigo: "ADM-2023-001", ativo: true,  dataCadastro: "2023-01-01" },
  { id: 5,  nome: "Ana Carvalho",           email: "ana.carvalho@coderyse.com",      tipo: "Professor",   codigo: "PRF-2023-002", ativo: true,  dataCadastro: "2023-09-10" },
  { id: 6,  nome: "Carlos Mendes",          email: "carlos.mendes@coderyse.com",     tipo: "Professor",   codigo: "PRF-2023-003", ativo: true,  dataCadastro: "2023-10-05" },
  { id: 7,  nome: "Fernanda Lima",          email: "fernanda.lima@coderyse.com",     tipo: "Professor",   codigo: "PRF-2023-004", ativo: false, dataCadastro: "2023-06-15" },
  { id: 8,  nome: "João Pedro Alves",       email: "joao.alves@coderyse.com",        tipo: "Aluno",       codigo: "ALU-2024-002", ativo: true,  dataCadastro: "2024-02-01" },
  { id: 9,  nome: "Lucas Ferreira",         email: "lucas.ferreira@coderyse.com",    tipo: "Aluno",       codigo: "ALU-2024-003", ativo: true,  dataCadastro: "2024-03-10" },
  { id: 10, nome: "Camila Rodrigues",       email: "camila.rodrigues@coderyse.com",  tipo: "Aluno",       codigo: "ALU-2024-004", ativo: true,  dataCadastro: "2024-03-12" },
  { id: 11, nome: "Rafael Souza",           email: "rafael.souza@coderyse.com",      tipo: "Aluno",       codigo: "ALU-2024-005", ativo: false, dataCadastro: "2024-01-05" },
  { id: 12, nome: "Juliana Castro",         email: "juliana.castro@coderyse.com",    tipo: "Aluno",       codigo: "ALU-2024-006", ativo: true,  dataCadastro: "2024-02-28" },
  { id: 13, nome: "Felipe Oliveira",        email: "felipe.oliveira@coderyse.com",   tipo: "Aluno",       codigo: "ALU-2024-007", ativo: true,  dataCadastro: "2024-03-18" },
  { id: 14, nome: "Beatriz Mendonça",       email: "beatriz.mendonca@coderyse.com",  tipo: "Aluno",       codigo: "ALU-2024-008", ativo: true,  dataCadastro: "2024-03-22" },
  { id: 15, nome: "Thiago Carvalho",        email: "thiago.carvalho@coderyse.com",   tipo: "Aluno",       codigo: "ALU-2024-009", ativo: false, dataCadastro: "2024-01-30" },
  { id: 16, nome: "Larissa Monteiro",       email: "larissa.monteiro@coderyse.com",  tipo: "Aluno",       codigo: "ALU-2024-010", ativo: true,  dataCadastro: "2024-04-02" },
  { id: 17, nome: "Gabriel Santos",         email: "gabriel.santos@coderyse.com",    tipo: "Aluno",       codigo: "ALU-2024-011", ativo: true,  dataCadastro: "2024-04-05" },
  { id: 18, nome: "Natália Freitas",        email: "natalia.freitas@coderyse.com",   tipo: "Aluno",       codigo: "ALU-2024-012", ativo: false, dataCadastro: "2024-02-14" },
  { id: 19, nome: "Diego Nascimento",       email: "diego.nascimento@coderyse.com",  tipo: "Aluno",       codigo: "ALU-2024-013", ativo: true,  dataCadastro: "2024-04-10" },
  { id: 20, nome: "Isabela Teixeira",       email: "isabela.teixeira@coderyse.com",  tipo: "Aluno",       codigo: "ALU-2024-014", ativo: true,  dataCadastro: "2024-04-12" },
  { id: 21, nome: "Vitor Hugo Lima",        email: "vitor.lima@coderyse.com",        tipo: "Aluno",       codigo: "ALU-2024-015", ativo: false, dataCadastro: "2024-03-05" },
];

/* ── Estatísticas por perfil ─────────────────────────────────── */
export const estatisticasAdmin = {
  totalUsuarios: 38,
  totalAlunos: 21,
  totalProfessores: 10,
  totalCoordenadores: 6,
  totalCursos: 6,
  totalTurmasAtivas: 5,
  matriculasPendentes: 3,
  taxaConclusao: 68,
};

export const estatisticasProfessor = {
  totalTurmas: 3,
  totalAlunos: 82,
  avaliacoesPublicadas: 5,
  mediaNotas: 7.8,
};

export const estatisticasCoordenador = {
  totalCursos: 6,
  totalTurmas: 6,
  matriculasPendentes: 3,
  totalAlunos: 210,
};

/* ── Certificados desbloqueados (demo) ───────────────────────── */
/* Chave = cursoId; representa cursos já concluídos com avaliação aprovada */
export const certificadosDemo = {
  5: { nota: 9.2, porcentagem: 92, notaMaxima: 10, dataConclusao: "10/06/2024" },
};

/* ── Progresso por matrícula (chave = matricula.id) ──────────── */
export const PROGRESSO_MOCK = {
  1:  42,
  2:  15,
  3:  60,
  4:  30,
  5:  55,
  6:  68,
  7:  20,
  20: 85,
};

/* ── Média de notas por turma (chave = turma.id) ─────────────── */
export const NOTAS_MOCK = {
  1: 7.8,
  3: 8.2,
  4: 7.1,
  5: 9.0,
  6: 6.5,
};

/* ── Questões de quiz pré-criadas pelo professor (demo) ──────── */
export const questoesProfessor = [

  /* ── Quiz 1 — Módulo: Fundamentos de HTML5 (moduloId: 1) ───── */

  {
    id: 9001,
    moduloId: 1,
    tema: "Fundamentos de HTML5",
    titulo: "Estrutura básica do HTML",
    enunciado: "Qual tag define o conteúdo principal visível de uma página HTML?",
    alternativas: [
      { letra: "A", texto: "<head>" },
      { letra: "B", texto: "<body>" },
      { letra: "C", texto: "<main>" },
      { letra: "D", texto: "<section>" },
      { letra: "E", texto: "<article>" },
    ],
    gabarito: "B",
  },
  {
    id: 9002,
    moduloId: 1,
    tema: "Fundamentos de HTML5",
    titulo: "Semântica HTML5",
    enunciado: "Qual das tags a seguir é considerada semântica no HTML5?",
    alternativas: [
      { letra: "A", texto: "<div>" },
      { letra: "B", texto: "<span>" },
      { letra: "C", texto: "<b>" },
      { letra: "D", texto: "<nav>" },
      { letra: "E", texto: "<i>" },
    ],
    gabarito: "D",
  },
  {
    id: 9003,
    moduloId: 1,
    tema: "Fundamentos de HTML5",
    titulo: "Links e âncoras",
    enunciado: "Qual atributo da tag <a> define o destino de um link?",
    alternativas: [
      { letra: "A", texto: "src" },
      { letra: "B", texto: "link" },
      { letra: "C", texto: "href" },
      { letra: "D", texto: "url" },
      { letra: "E", texto: "target" },
    ],
    gabarito: "C",
  },

  /* ── Quiz 2 — Módulo: CSS3 e Responsividade (moduloId: 2) ───── */

  {
    id: 9004,
    moduloId: 2,
    tema: "CSS3 e Responsividade",
    titulo: "Seletores CSS",
    enunciado: "Qual seletor CSS aplica estilo a todos os elementos com a classe 'destaque'?",
    alternativas: [
      { letra: "A", texto: "#destaque" },
      { letra: "B", texto: ".destaque" },
      { letra: "C", texto: "destaque" },
      { letra: "D", texto: "*destaque" },
      { letra: "E", texto: "@destaque" },
    ],
    gabarito: "B",
  },
  {
    id: 9005,
    moduloId: 2,
    tema: "CSS3 e Responsividade",
    titulo: "Media Queries",
    enunciado: "Qual regra CSS é usada para aplicar estilos condicionalmente com base no tamanho da tela?",
    alternativas: [
      { letra: "A", texto: "@keyframes" },
      { letra: "B", texto: "@import" },
      { letra: "C", texto: "@media" },
      { letra: "D", texto: "@screen" },
      { letra: "E", texto: "@viewport" },
    ],
    gabarito: "C",
  },
  {
    id: 9006,
    moduloId: 2,
    tema: "CSS3 e Responsividade",
    titulo: "Flexbox",
    enunciado: "Qual propriedade CSS ativa o Flexbox em um container?",
    alternativas: [
      { letra: "A", texto: "display: block" },
      { letra: "B", texto: "display: grid" },
      { letra: "C", texto: "display: inline" },
      { letra: "D", texto: "display: flex" },
      { letra: "E", texto: "display: table" },
    ],
    gabarito: "D",
  },

];

/* ── QUESTÕES UNIP (reserva — não usadas no seed) ────────────── */
const _questoesUnip = [
  {
    id: 9001,
    moduloId: 1,
    tema: "Ciclo de Vida de Software",
    titulo: "Modelo de ciclo de vida — Sistema de DVDs",
    introducaoTeorica:
      "1.1. Restrições de projeto\n\n" +
      "As restrições de projeto são requisitos de sistema capturados durante a fase de requisitos, nas etapas de concepção e de elaboração do sistema. Essas restrições são limitações ou condições impostas ao sistema, que podem afetar hardware, software, dados e procedimentos operacionais. Exemplos de restrições de projeto incluem prazos de entrega, orçamento disponível, requisitos de qualidade e necessidade de usar tecnologias específicas.\n\n" +
      "As restrições de projeto não podem ser confundidas com os objetivos do sistema, embora estejam diretamente relacionados. Um objetivo pode não ser alcançado devido a uma restrição que o limita ou que o impeça. Vejamos alguns exemplos:\n\n" +
      "• É objetivo do sistema permitir o acesso de fornecedores externos via internet, mas restrições de segurança não o permitem.\n" +
      "• O sistema deve ler dados de um leitor de cartão de um modelo específico, mas o fabricante não fornece o driver necessário para o sistema operacional no qual o sistema será executado.\n\n" +
      "1.2. Protótipo do sistema\n\n" +
      "O protótipo é uma simplificação do sistema a ser desenvolvido, feito para permitir ao usuário antever, verificar, experimentar e validar o sistema futuro antes que ele seja realmente construído. O protótipo pode ser usado para:\n\n" +
      "• A demonstração de uma visão do sistema aos usuários;\n" +
      "• A validação dos requisitos;\n" +
      "• A clarificação de requisitos vagos, imprecisos ou indefinidos;\n" +
      "• A comunicação entre os membros da equipe e os usuários.\n\n" +
      "Um processo de engenharia de software é dividido em fases, que têm papel fundamental para que o objetivo seja cumprido. Em cada fase, são recomendadas as tarefas a serem distribuídas entre os vários integrantes das equipes.\n\n" +
      "1.3. Processos iterativos\n\n" +
      "Os processos iterativos de software dividem o projeto de um sistema de software em ciclos curtos e repetidos (iterações ou sprints), em que o código é desenvolvido, testado e refinado progressivamente, até que a versão final seja alcançada. Um processo iterativo é oposto ao antigo desenvolvimento sequencial. Cada passagem completa pelo processo é uma iteração, e cada nova iteração deve adicionar um ou vários novos incrementos. Desse modo, ao final de todas as iterações, o sistema estará pronto.\n\n" +
      "Algumas vantagens do processo iterativo em relação ao processo sequencial são:\n\n" +
      "• Redução dos riscos de se fazer toda uma etapa e não mais retornar a ela;\n" +
      "• Aceleração no tempo de desenvolvimento porque serão trabalhados escopos menores e claros;\n" +
      "• Possibilidade de sofrer menor impacto devido às constantes alterações e atualizações pedidas pelos usuários, facilitando a adaptação e a mudança dos requisitos.",
    enunciado:
      "Um analista foi contratado para desenvolver um sistema de pesquisa de DVDs em lojas virtuais. O sistema deverá solicitar ao usuário um título de DVD, que será usado para realizar a pesquisa nas bases de dados das lojas conveniadas. Ao detectar a disponibilidade do DVD solicitado, o sistema armazenará temporariamente os dados das lojas (nome, preço, data prevista para entrega do produto) e exibirá as informações ordenadas por preço. Após analisar as informações, o cliente poderá efetuar a compra. O contratante deverá testar algumas operações do sistema antes de ele ser finalizado. Há tempo suficiente para que o analista atenda a essa solicitação e efetue eventuais modificações exigidas pelo contratante.\n\n" +
      "Com relação a essa situação, avalie as afirmativas a seguir quanto ao modelo de ciclo de vida.\n\n" +
      "I. O entendimento do sistema como um todo e a execução sequencial das fases sem retorno produzem um sistema que pode ser validado pelo contratante.\n\n" +
      "II. A elaboração do protótipo pode ser utilizada para resolver dúvidas de comunicação, o que aumenta os riscos de inclusão de novas funcionalidades não prioritárias.\n\n" +
      "III. A definição das restrições deve ser a segunda fase a ser realizada no desenvolvimento do projeto, correspondendo à etapa de engenharia.\n\n" +
      "IV. Um processo iterativo permite que versões progressivas mais completas do sistema sejam construídas e avaliadas.\n\n" +
      "É correto apenas o que se afirma em",
    alternativas: [
      { letra: "A", texto: "I e II." },
      { letra: "B", texto: "I e III." },
      { letra: "C", texto: "II e III." },
      { letra: "D", texto: "II e IV." },
      { letra: "E", texto: "III e IV." },
    ],
    gabarito: "D",
    analiseDasAfirmativas:
      "I – Afirmativa incorreta.\n" +
      "JUSTIFICATIVA. A execução sequencial das fases, sem retorno, não capturará as alterações nem as correções identificadas nas fases posteriores, sejam elas originadas internamente pelos usuários ou externamente por mudanças em legislações ou em regras.\n\n" +
      "II – Afirmativa correta.\n" +
      "JUSTIFICATIVA. O protótipo facilita a resolução de dúvidas de comunicação, mas, também, dá ao usuário a oportunidade de criar novas necessidades (prioritárias ou não), pois ele tem uma antevisão do que será o sistema.\n\n" +
      "III – Afirmativa incorreta.\n" +
      "JUSTIFICATIVA. Na etapa de engenharia, o objetivo é ter uma visão global do sistema, incluindo hardware, software, equipamentos e pessoas envolvidas. O detalhamento das restrições é feito em etapas posteriores.\n\n" +
      "IV – Afirmativa correta.\n" +
      "JUSTIFICATIVA. O processo iterativo permite versões progressivas mais completas por meio de incrementos. A cada iteração, uma nova versão produtiva é completada e se aproxima mais do objetivo de desenvolvimento do produto.",
  },

  {
    id: 9002,
    moduloId: 1,
    tema: "Orientação a Objetos",
    titulo: "Herança — Sistema da pizzaria",
    introducaoTeorica:
      "Conceitos de programação orientada a objetos\n\n" +
      "A orientação a objetos é um paradigma de programação que modulariza o código-fonte de um sistema em torno de objetos, que são entidades que combinam características (atributos) e comportamentos (métodos) relacionados em uma única unidade.\n\n" +
      "Os objetos são instanciados a partir de classes, que funcionam como \"receitas\" ou \"moldes\" para criar objetos. Por exemplo, a classe Caneta pode ser usada para criar os objetos esferografica e hidrografica, cada um com suas próprias características, mas definidos pela mesma estrutura.\n\n" +
      "No contexto de orientação a objetos, a sobrecarga é a provisão de mais de uma versão para um mesmo método. A diferenciação entre as versões é feita por assinaturas dos métodos, isto é, na lista de parâmetros que o método possui. Isso pode ser feito tanto na quantidade de parâmetros como no tipo de parâmetro informado (exemplos: string, integer, double e float).\n\n" +
      "A mensagem é uma solicitação feita de um objeto para outro. Os objetos se comunicam por mensagens que geralmente são uma chamada de um método em algum dos objetos envolvidos no processo.\n\n" +
      "Exemplo de mensagem: um objeto FormularioCliente solicita uma consulta ao objeto PessoaFisica por meio do método ConsultarCliente(cpf).",
    enunciado:
      "Uma pizzaria fez uma ampliação de suas instalações e o gerente aproveitou para melhorar o sistema informatizado, que era limitado e não atendia a todas as funções necessárias. O gerente, então, contratou uma empresa para ampliar o software. No desenvolvimento do novo sistema, a empresa aproveitou partes do sistema antigo e estendeu os componentes de maneira a usar código validado, acrescentando as novas funções solicitadas.\n\n" +
      "Que conceito de orientação a objetos está descrito na situação hipotética acima?",
    alternativas: [
      { letra: "A", texto: "Sobrecarga." },
      { letra: "B", texto: "Herança." },
      { letra: "C", texto: "Sobreposição." },
      { letra: "D", texto: "Abstração." },
      { letra: "E", texto: "Mensagem." },
    ],
    gabarito: "B",
    analiseDasAfirmativas:
      "A – Alternativa incorreta.\n" +
      "JUSTIFICATIVA. A sobrecarga não permite o reaproveitamento nem a extensão de partes do sistema antigo, pois ela simplesmente gera novas versões dos métodos com assinaturas diferentes. Esses códigos terão de ser novamente testados e validados.\n\n" +
      "B – Alternativa correta.\n" +
      "JUSTIFICATIVA. A herança aproveita tudo que foi desenvolvido e aprovado na superclasse, possibilitando o uso nas subclasses como código já testado e validado.\n\n" +
      "C – Alternativa incorreta.\n" +
      "JUSTIFICATIVA. A sobreposição não aproveita partes antigas, mas as substitui. Esse novo código também terá de ser testado e validado.\n\n" +
      "D – Alternativa incorreta.\n" +
      "JUSTIFICATIVA. A abstração é um conceito que nada tem a ver com o reaproveitamento de código.\n\n" +
      "E – Alternativa incorreta.\n" +
      "JUSTIFICATIVA. A mensagem é um conceito que se refere à comunicação entre objetos, nada tendo a ver com o reaproveitamento de código em componentes já desenvolvidos.",
  },

  {
    id: 9003,
    moduloId: 1,
    tema: "Máquinas Virtuais",
    titulo: "Conceito de Máquina Virtual",
    introducaoTeorica:
      "Máquina virtual (MV)\n\n" +
      "Uma máquina virtual (MV) é um software de ambiente computacional que permite a execução de sistemas operacionais e de aplicativos sobre um hardware hospedeiro. Ela é um ambiente operacional completo, que se comporta como se fosse um computador independente. É como se tivéssemos \"um computador dentro do outro\", sendo este último \"criado\" por softwares. Ela se comporta exatamente como se fosse uma máquina física, contendo CPU, memória e HD próprios.\n\n" +
      "A máquina virtual é composta totalmente por softwares, não tendo componentes de hardware. Por isso, com a virtualização, um servidor pode manter vários sistemas operacionais em uso. A restrição para o número de máquinas virtuais possíveis é definida pelos limites físicos de memória, espaço em disco e poder de processamento da máquina hospedeira.\n\n" +
      "Vantagens no uso de máquinas virtuais:\n\n" +
      "• Ficam isoladas umas das outras, como se estivessem fisicamente separadas, gerando um ambiente de computação completo para cada uma.\n" +
      "• Há independência do hardware real — no mesmo servidor físico, podemos executar diferentes sistemas operacionais, como Windows ou Linux.\n" +
      "• Promovem aumento da segurança, pois cada MV é independente da outra, permitindo diferentes requisitos de segurança em diferentes ambientes virtualizados.\n" +
      "• Há aumento da confiabilidade e da disponibilidade, pois a parada de um ambiente não interrompe os demais.\n" +
      "• Promovem a redução do custo, pois podemos trocar vários servidores menores por um mais poderoso.\n" +
      "• Há melhoria do suporte a aplicações legadas, mantendo o sistema operacional antigo funcionando em uma MV durante migrações.\n\n" +
      "Desvantagens no uso de máquinas virtuais:\n\n" +
      "• Como os ambientes se tornam mais complexos e heterogêneos, é necessária uma quantidade de produtos que permitam instanciar, monitorar, configurar e salvar os ambientes virtuais criados.\n" +
      "• A introdução de uma camada extra de software entre o sistema operacional e o hardware gera um aumento na carga do processamento. A adição de mais MVs degrada o desempenho do hardware como um todo.",
    enunciado:
      "O conceito de máquina virtual (MV) foi usado, na década de 1970, no sistema operacional IBM System 370. Atualmente, centros de dados (datacenters) usam MVs para migrar tarefas entre servidores conectados em rede e, assim, equilibrar carga de processamento. Além disso, plataformas atuais de desenvolvimento de software empregam MVs (Java, .NET). Uma MV pode ser construída para emular um processador ou um computador completo. Um código desenvolvido para uma máquina real pode ser executado de forma transparente em uma MV.\n\n" +
      "Com relação a essas informações, assinale a opção correta.",
    alternativas: [
      { letra: "A", texto: "O conceito de transparência mencionado indica que a MV permite que um aplicativo acesse diretamente o hardware da máquina." },
      { letra: "B", texto: "Uma das vantagens mais significativas de uma MV é a economia de carga de CPU e de memória RAM na execução de um aplicativo." },
      { letra: "C", texto: "Uma MV oferece maior controle de segurança, uma vez que aplicativos são executados em um ambiente controlado." },
      { letra: "D", texto: "Para emular uma CPU dual-core, uma MV deve ser instalada e executada em um computador com CPU dual-core." },
      { letra: "E", texto: "Como uma MV não é uma máquina real, um sistema operacional nela executado fica automaticamente imune a vírus." },
    ],
    gabarito: "C",
    analiseDasAfirmativas:
      "A – Alternativa incorreta.\n" +
      "JUSTIFICATIVA. A MV é um software que não acessa diretamente o hardware da máquina. Essa função é mantida pelo sistema operacional com o qual ela interage.\n\n" +
      "B – Alternativa incorreta.\n" +
      "JUSTIFICATIVA. A MV não permite a economia de carga de CPU ou de memória RAM. Pelo contrário, como há uma camada adicional de software, existe uma sobrecarga (overhead) na máquina física hospedeira.\n\n" +
      "C – Alternativa correta.\n" +
      "JUSTIFICATIVA. Cada MV se comporta como um ambiente completamente independente, o que reforça a segurança na execução de um aplicativo. Cada MV pode ter suas restrições de segurança independentes em função dos aplicativos que rodam em seu ambiente. Por exemplo, um vírus adquirido na máquina virtual não contamina a máquina real.\n\n" +
      "D – Alternativa incorreta.\n" +
      "JUSTIFICATIVA. A MV não emula processador e RAM — ela usa o processador e a memória instalados. Os processadores com mais de um núcleo (dual-core ou demais) são de 64 bits e, para utilizá-los, é necessário que o sistema hospedeiro da MV suporte 64 bits.\n\n" +
      "E – Alternativa incorreta.\n" +
      "JUSTIFICATIVA. As MVs estão sujeitas às mesmas ameaças de um computador físico, mas os vírus adquiridos na máquina virtual não migram para a máquina real. As mesmas preocupações de segurança têm de ser mantidas nos dois ambientes (real e virtual): bom sistema de segurança, firewalls, antivírus etc.",
  },
]; void _questoesUnip;
