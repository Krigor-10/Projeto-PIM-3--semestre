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
    duracao: "6 meses",
    nivel: "Iniciante",
    ativo: true,
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
    duracao: "8 meses",
    nivel: "Intermediário",
    ativo: true,
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
    duracao: "9 meses",
    nivel: "Avançado",
    ativo: true,
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
    duracao: "7 meses",
    nivel: "Avançado",
    ativo: true,
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
    duracao: "4 meses",
    nivel: "Iniciante",
    ativo: true,
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
    duracao: "10 meses",
    nivel: "Intermediário",
    ativo: true,
    coordenadorId: null,
  },
];

/* ── Módulos por curso ───────────────────────────────────────── */
export const modulos = [
  /* Desenvolvimento Web (cursoId: 1) */
  { id: 1,  cursoId: 1, codigoRegistro: "MOD-001", titulo: "Fundamentos de HTML5",          ordem: 1, totalConteudos: 8  },
  { id: 2,  cursoId: 1, codigoRegistro: "MOD-002", titulo: "CSS3 e Responsividade",          ordem: 2, totalConteudos: 10 },
  { id: 3,  cursoId: 1, codigoRegistro: "MOD-003", titulo: "JavaScript Moderno (ES6+)",      ordem: 3, totalConteudos: 12 },
  { id: 4,  cursoId: 1, codigoRegistro: "MOD-004", titulo: "React — Fundamentos",            ordem: 4, totalConteudos: 9  },
  { id: 5,  cursoId: 1, codigoRegistro: "MOD-005", titulo: "React — Hooks e Estado",         ordem: 5, totalConteudos: 7  },

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
  { id: 1, nomeTurma: "WEB-2024-A",   cursoId: 1, cursoTitulo: "Desenvolvimento Web",    professorId: 2, professorNome: "Heitor Nadir",   totalAlunos: 32, status: "Ativa"     },
  { id: 2, nomeTurma: "WEB-2024-B",   cursoId: 1, cursoTitulo: "Desenvolvimento Web",    professorId: 2, professorNome: "Heitor Nadir",   totalAlunos: 28, status: "Ativa"     },
  { id: 3, nomeTurma: "DATA-2024-A",  cursoId: 2, cursoTitulo: "Ciência de Dados",       professorId: 5, professorNome: "Ana Carvalho",   totalAlunos: 25, status: "Ativa"     },
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
  { id: 7, alunoId: 13, alunoNome: "Felipe Oliveira",      cursoId: 1, cursoTitulo: "Desenvolvimento Web", turmaId: 2, turmaNome: "WEB-2024-B",   codigoMatricula: "MAT-2024-007", status: "Pendente",  dataSolicitacao: "2024-03-20" },
];

/* ── Avaliações ──────────────────────────────────────────────── */
export const avaliacoes = [
  { id: 1, titulo: "Prova 1 — HTML e CSS",              cursoId: 1, cursoTitulo: "Desenvolvimento Web",    moduloId: 2,  tentativasPermitidas: 2, tempoLimiteMinutos: 60,  notaMaxima: 10, totalQuestoes: 10, status: "Publicada", novo: true },
  { id: 2, titulo: "Prova 2 — JavaScript Avançado",     cursoId: 1, cursoTitulo: "Desenvolvimento Web",    moduloId: 3,  tentativasPermitidas: 1, tempoLimiteMinutos: 90,  notaMaxima: 10, totalQuestoes: 15, status: "Publicada", novo: true },
  { id: 3, titulo: "Prova Final — React",               cursoId: 1, cursoTitulo: "Desenvolvimento Web",    moduloId: 5,  tentativasPermitidas: 1, tempoLimiteMinutos: 120, notaMaxima: 10, totalQuestoes: 20, status: "Rascunho"  },
  { id: 4, titulo: "Avaliação — Python e Pandas",       cursoId: 2, cursoTitulo: "Ciência de Dados",       moduloId: 6,  tentativasPermitidas: 3, tempoLimiteMinutos: 45,  notaMaxima: 10, totalQuestoes: 8,  status: "Publicada" },
  { id: 5, titulo: "Quiz — Fundamentos de IA",          cursoId: 3, cursoTitulo: "Inteligência Artificial", moduloId: 8,  tentativasPermitidas: 2, tempoLimiteMinutos: 30,  notaMaxima: 10, totalQuestoes: 5,  status: "Publicada" },
  { id: 6, titulo: "Prova — OWASP e Pentest",           cursoId: 4, cursoTitulo: "Cybersegurança",          moduloId: 11, tentativasPermitidas: 1, tempoLimiteMinutos: 60,  notaMaxima: 10, totalQuestoes: 12, status: "Publicada" },
  { id: 7, titulo: "Avaliação — Prototipação Figma",    cursoId: 5, cursoTitulo: "UX e UI Design",          moduloId: 13, tentativasPermitidas: 2, tempoLimiteMinutos: 40,  notaMaxima: 10, totalQuestoes: 8,  status: "Publicada" },
  { id: 8, titulo: "Prova — Arduino e Sensores",        cursoId: 6, cursoTitulo: "Robótica",                moduloId: 15, tentativasPermitidas: 2, tempoLimiteMinutos: 50,  notaMaxima: 10, totalQuestoes: 10, status: "Rascunho"  },
];

/* ── Conteúdos (ligados aos módulos do Desenvolvimento Web) ──── */
export const conteudos = [
  { id: 1,  moduloId: 1, titulo: "Introdução ao HTML5",               tipo: "Video",     duracao: "18min", concluido: true  },
  { id: 2,  moduloId: 1, titulo: "Estrutura semântica",               tipo: "Video",     duracao: "22min", concluido: true  },
  { id: 3,  moduloId: 1, titulo: "Formulários e inputs",              tipo: "Texto",     duracao: "15min", concluido: true  },
  { id: 4,  moduloId: 2, titulo: "Flexbox na prática",                tipo: "Video",     duracao: "30min", concluido: false },
  { id: 5,  moduloId: 2, titulo: "CSS Grid",                          tipo: "Video",     duracao: "28min", concluido: false },
  { id: 6,  moduloId: 2, titulo: "Media Queries e responsividade",    tipo: "Documento", duracao: "20min", concluido: false },
  { id: 7,  moduloId: 3, titulo: "Arrow functions e destructuring",   tipo: "Video",     duracao: "25min", concluido: false },
  { id: 8,  moduloId: 3, titulo: "Promises e Async/Await",            tipo: "Video",     duracao: "35min", concluido: false, novo: true },
  { id: 9,  moduloId: 4, titulo: "Introdução ao React",               tipo: "Video",     duracao: "20min", concluido: false, novo: true },
  { id: 10, moduloId: 4, titulo: "Componentes e Props",               tipo: "Video",     duracao: "32min", concluido: false, novo: true },
];

/* ── Progresso da aluna demo (Maria Isabela) ────────────────── */
export const progressoAluno = {
  cursos: [
    { cursoId: 1, cursoTitulo: "Desenvolvimento Web", percentual: 42, status: "Em andamento", ultimoAcesso: "2024-03-19" },
  ],
  modulos: [
    { moduloId: 1, moduloTitulo: "Fundamentos de HTML5",        percentual: 100, status: "Concluído"    },
    { moduloId: 2, moduloTitulo: "CSS3 e Responsividade",        percentual: 40,  status: "Em andamento" },
    { moduloId: 3, moduloTitulo: "JavaScript Moderno (ES6+)",    percentual: 0,   status: "Não iniciado" },
    { moduloId: 4, moduloTitulo: "React — Fundamentos",          percentual: 0,   status: "Não iniciado" },
  ],
};

/* ── Lista completa de usuários ─────────────────────────────── */
export const usuarios = [
  { id: 1,  nome: "Maria Isabela Branco",   email: "maria.isabela@coderyse.com",  tipo: "Aluno",       ativo: true,  dataCadastro: "2024-01-15" },
  { id: 2,  nome: "Heitor Henrique Nadir",  email: "heitor.nadir@coderyse.com",   tipo: "Professor",   ativo: true,  dataCadastro: "2023-08-01" },
  { id: 3,  nome: "Nicolas Pimentel",       email: "nicolas.pimentel@coderyse.com", tipo: "Coordenador", ativo: true, dataCadastro: "2023-07-20" },
  { id: 4,  nome: "Krigor de Sousa",        email: "krigor@coderyse.com",          tipo: "Admin",       ativo: true,  dataCadastro: "2023-01-01" },
  { id: 5,  nome: "Ana Carvalho",           email: "ana.carvalho@coderyse.com",    tipo: "Professor",   ativo: true,  dataCadastro: "2023-09-10" },
  { id: 6,  nome: "Carlos Mendes",          email: "carlos.mendes@coderyse.com",   tipo: "Professor",   ativo: true,  dataCadastro: "2023-10-05" },
  { id: 7,  nome: "Fernanda Lima",          email: "fernanda.lima@coderyse.com",   tipo: "Professor",   ativo: false, dataCadastro: "2023-06-15" },
  { id: 8,  nome: "João Pedro Alves",       email: "joao.alves@coderyse.com",      tipo: "Aluno",       ativo: true,  dataCadastro: "2024-02-01" },
  { id: 9,  nome: "Lucas Ferreira",         email: "lucas.ferreira@coderyse.com",  tipo: "Aluno",       ativo: true,  dataCadastro: "2024-03-10" },
  { id: 10, nome: "Camila Rodrigues",       email: "camila.rodrigues@coderyse.com", tipo: "Aluno",      ativo: true,  dataCadastro: "2024-03-12" },
  { id: 11, nome: "Rafael Souza",           email: "rafael.souza@coderyse.com",    tipo: "Aluno",       ativo: false, dataCadastro: "2024-01-05" },
  { id: 12, nome: "Juliana Castro",         email: "juliana.castro@coderyse.com",  tipo: "Aluno",       ativo: true,  dataCadastro: "2024-02-28" },
  { id: 13, nome: "Felipe Oliveira",        email: "felipe.oliveira@coderyse.com", tipo: "Aluno",       ativo: true,  dataCadastro: "2024-03-18" },
  { id: 14, nome: "Beatriz Mendonça",      email: "beatriz.mendonca@coderyse.com", tipo: "Aluno",      ativo: true,  dataCadastro: "2024-03-22" },
  { id: 15, nome: "Thiago Carvalho",       email: "thiago.carvalho@coderyse.com",  tipo: "Aluno",      ativo: false, dataCadastro: "2024-01-30" },
  { id: 16, nome: "Larissa Monteiro",      email: "larissa.monteiro@coderyse.com", tipo: "Aluno",      ativo: true,  dataCadastro: "2024-04-02" },
  { id: 17, nome: "Gabriel Santos",        email: "gabriel.santos@coderyse.com",   tipo: "Aluno",      ativo: true,  dataCadastro: "2024-04-05" },
  { id: 18, nome: "Natália Freitas",       email: "natalia.freitas@coderyse.com",  tipo: "Aluno",      ativo: false, dataCadastro: "2024-02-14" },
  { id: 19, nome: "Diego Nascimento",      email: "diego.nascimento@coderyse.com", tipo: "Aluno",      ativo: true,  dataCadastro: "2024-04-10" },
  { id: 20, nome: "Isabela Teixeira",      email: "isabela.teixeira@coderyse.com", tipo: "Aluno",      ativo: true,  dataCadastro: "2024-04-12" },
  { id: 21, nome: "Vitor Hugo Lima",       email: "vitor.lima@coderyse.com",       tipo: "Aluno",      ativo: false, dataCadastro: "2024-03-05" },
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
