/* ============================================================
   PERMISSÕES E SEÇÕES — CodeRyse Academy
   Controla visibilidade de seções e ações por perfil de acesso
   ============================================================ */

/* Perfis com poderes de gestão administrativa */
export const PERFIS_GESTORES = new Set(["Admin", "Coordenador"]);

/* ── Seções visíveis na sidebar por perfil ───────────────────── */
export const SECOES = [
  {
    chave: "dashboard",
    rotulo: "Panorama",
    icone: "PN",
    perfis: ["Admin", "Coordenador", "Professor", "Aluno"],
  },
  {
    chave: "usuarios",
    rotulo: "Usuários",
    icone: "US",
    perfis: [],
  },
  {
    chave: "alunos",
    rotulo: "Alunos",
    icone: "AL",
    perfis: ["Admin", "Coordenador", "Professor"],
  },
  {
    chave: "professores",
    rotulo: "Professores",
    icone: "PR",
    perfis: ["Admin", "Coordenador"],
  },
  {
    chave: "coordenadores",
    rotulo: "Coordenadores",
    icone: "CO",
    perfis: ["Admin"],
  },
  {
    chave: "cursos",
    rotulo: "Cursos",
    icone: "CU",
    perfis: ["Admin", "Coordenador"],
  },
  {
    chave: "modulos",
    rotulo: "Módulos",
    icone: "MO",
    perfis: ["Admin", "Coordenador", "Professor"],
  },
  {
    chave: "turmas",
    rotulo: "Turmas",
    icone: "TU",
    perfis: ["Admin", "Coordenador", "Professor"],
  },
  {
    chave: "matriculas",
    rotulo: "Matrículas",
    icone: "MA",
    perfis: ["Admin", "Aluno"],
  },
  {
    chave: "avaliacoes",
    rotulo: "Avaliações",
    icone: "AV",
    perfis: ["Professor", "Aluno"],
  },
  {
    chave: "conteudos",
    rotulo: "Conteúdos",
    icone: "CT",
    perfis: ["Professor", "Aluno"],
  },
  {
    chave: "progresso",
    rotulo: "Progresso",
    icone: "PG",
    perfis: ["Coordenador", "Professor", "Aluno"],
  },
  {
    chave: "certificados",
    rotulo: "Certificados",
    icone: "CR",
    perfis: ["Aluno"],
  },
  {
    chave: "catalogo",
    rotulo: "Catálogo Público",
    icone: "CL",
    perfis: ["Admin"],
  },
];

/* ── Permissões de ação por seção ────────────────────────────── */
/*
   Cada seção define quais perfis podem: criar, editar, excluir.
   Perfis não listados têm acesso somente leitura (quando a seção
   é visível para eles).
*/
const ACOES = {
  usuarios:     { criar: ["Admin"],                          editar: ["Admin"],                          excluir: ["Admin"]                   },
  alunos:       { criar: ["Admin", "Coordenador"],           editar: ["Admin", "Coordenador"],           excluir: ["Admin"]                   },
  professores:  { criar: ["Admin", "Coordenador"],           editar: ["Admin", "Coordenador"],           excluir: ["Admin"]                   },
  coordenadores:{ criar: ["Admin"],                          editar: ["Admin"],                          excluir: ["Admin"]                   },
  cursos:       { criar: ["Admin"],                          editar: ["Admin", "Coordenador"],           excluir: ["Admin"]                   },
  modulos:      { criar: ["Admin", "Coordenador", "Professor"], editar: ["Admin", "Coordenador"],           excluir: ["Admin", "Coordenador"]     },
  turmas:       { criar: ["Admin", "Coordenador"],           editar: ["Admin", "Coordenador"],           excluir: ["Admin"]                   },
  matriculas:   { criar: ["Admin"],                          editar: ["Admin"],                          excluir: ["Admin"]                   },
  avaliacoes:   { criar: ["Professor"],                      editar: ["Professor"],                      excluir: ["Professor"]               },
  conteudos:    { criar: ["Professor"],                      editar: ["Professor"],                      excluir: ["Professor"]               },
  progresso:    { criar: [],                                 editar: [],                                 excluir: []                          },
  catalogo:     { criar: [],                                 editar: ["Admin"],                          excluir: ["Admin"]                   },
};

/* ── Funções auxiliares ──────────────────────────────────────── */
export function obterSecoesPermitidas(tipoPerfil) {
  return SECOES.filter((s) => s.perfis.includes(tipoPerfil));
}

export function temPermissao(tipoPerfil, chaveSecao) {
  const secao = SECOES.find((s) => s.chave === chaveSecao);
  return secao ? secao.perfis.includes(tipoPerfil) : false;
}

export function podeCriar(tipoPerfil, chaveSecao) {
  return ACOES[chaveSecao]?.criar.includes(tipoPerfil) ?? false;
}

export function podeEditar(tipoPerfil, chaveSecao) {
  return ACOES[chaveSecao]?.editar.includes(tipoPerfil) ?? false;
}

export function podeExcluir(tipoPerfil, chaveSecao) {
  return ACOES[chaveSecao]?.excluir.includes(tipoPerfil) ?? false;
}

export function eGestor(tipoPerfil) {
  return PERFIS_GESTORES.has(tipoPerfil);
}
