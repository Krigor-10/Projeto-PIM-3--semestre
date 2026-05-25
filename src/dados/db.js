/* ============================================================
   CODERYSE ACADEMY — CAMADA DE PERSISTÊNCIA (localStorage)
   Seed automático a partir de dadosMock.js na primeira abertura.
   Todas as entidades mutáveis são salvas aqui.
   ============================================================ */

import {
  cursos     as cursosIniciais,
  turmas     as turmasIniciais,
  modulos    as modulosIniciais,
  usuarios   as usuariosIniciais,
  matriculas as matriculasIniciais,
  avaliacoes as avaliacoesIniciais,
} from "@/dados/dadosMock.js";

const CHAVES = {
  cursos:     "cdr_cursos",
  turmas:     "cdr_turmas",
  modulos:    "cdr_modulos",
  usuarios:   "cdr_usuarios",
  matriculas: "cdr_matriculas",
  questoes:   "cdr_questoes",
  avaliacoes: "cdr_avaliacoes",
  seed:       "cdr_seed_v1",
};

function ler(chave) {
  try {
    return JSON.parse(localStorage.getItem(chave) ?? "null");
  } catch {
    return null;
  }
}

function escrever(chave, dados) {
  localStorage.setItem(chave, JSON.stringify(dados));
}

/* Popula o localStorage com os dados mock apenas na primeira abertura */
export function inicializar() {
  if (!ler(CHAVES.seed)) {
    escrever(CHAVES.cursos,     cursosIniciais);
    escrever(CHAVES.turmas,     turmasIniciais);
    escrever(CHAVES.modulos,    modulosIniciais);
    escrever(CHAVES.usuarios,   usuariosIniciais);
    escrever(CHAVES.matriculas, matriculasIniciais);
    escrever(CHAVES.avaliacoes, avaliacoesIniciais);
    escrever(CHAVES.seed, "1");
  } else if (!ler(CHAVES.avaliacoes)) {
    escrever(CHAVES.avaliacoes, avaliacoesIniciais);
  }
}

/* Apaga tudo e força re-seed no próximo carregamento */
export function resetar() {
  Object.values(CHAVES).forEach((chave) => localStorage.removeItem(chave));
}

export const db = {
  cursos: {
    listar: () => ler(CHAVES.cursos)     ?? [...cursosIniciais],
    salvar: (lista) => escrever(CHAVES.cursos, lista),
  },
  turmas: {
    listar: () => ler(CHAVES.turmas)     ?? [...turmasIniciais],
    salvar: (lista) => escrever(CHAVES.turmas, lista),
  },
  modulos: {
    listar: () => ler(CHAVES.modulos)    ?? [...modulosIniciais],
    salvar: (lista) => escrever(CHAVES.modulos, lista),
  },
  usuarios: {
    listar: () => ler(CHAVES.usuarios)   ?? [...usuariosIniciais],
    salvar: (lista) => escrever(CHAVES.usuarios, lista),
    /* Atualiza apenas os usuários de um tipo, preservando os demais */
    salvarPorTipo: (tipo, listaDoTipo) => {
      const todos   = ler(CHAVES.usuarios) ?? [...usuariosIniciais];
      const outros  = todos.filter((u) => u.tipo !== tipo);
      escrever(CHAVES.usuarios, [...outros, ...listaDoTipo]);
    },
  },
  matriculas: {
    listar: () => ler(CHAVES.matriculas) ?? [...matriculasIniciais],
    salvar: (lista) => escrever(CHAVES.matriculas, lista),
  },
  questoes: {
    listar: () => ler(CHAVES.questoes) ?? [],
    salvar: (lista) => escrever(CHAVES.questoes, lista),
  },
  avaliacoes: {
    listar: () => ler(CHAVES.avaliacoes) ?? [...avaliacoesIniciais],
    salvar: (lista) => escrever(CHAVES.avaliacoes, lista),
  },
};
