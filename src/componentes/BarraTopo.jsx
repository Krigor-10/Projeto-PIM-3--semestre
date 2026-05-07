const metadadosPorSecao = {
  dashboard: {
    titulo: "Panorama",
    descricao: "Resumo central do workspace React com dados mockados.",
  },
  alunos: {
    titulo: "Gestao de alunos",
    descricao: "Consulta rapida da base academica para operacao e apoio.",
  },
  professores: {
    titulo: "Corpo docente",
    descricao: "Professores disponiveis para cursos e turmas.",
  },
  coordenadores: {
    titulo: "Coordenadores",
    descricao: "Supervisao academica dos cursos.",
  },
  cursos: {
    titulo: "Catalogo academico",
    descricao: "A mesma base alimenta a home, o cadastro e o painel.",
  },
  modulos: {
    titulo: "Modulos por curso",
    descricao: "Estrutura academica para conteudos, avaliacoes e progresso.",
  },
  turmas: {
    titulo: "Mapa de turmas",
    descricao: "Turmas organizadas para acompanhamento da plataforma.",
  },
  matriculas: {
    titulo: "Fluxo de matriculas",
    descricao: "Solicitacoes e status academico simulados.",
  },
  avaliacoes: {
    titulo: "Avaliacoes",
    descricao: "Provas, quizzes e exercicios por perfil.",
  },
  conteudos: {
    titulo: "Conteudos",
    descricao: "Materiais publicados para a jornada academica.",
  },
  progresso: {
    titulo: "Meu Progresso",
    descricao: "Acompanhamento visual da trilha do aluno.",
  },
  usuarios: {
    titulo: "Usuarios",
    descricao: "Visao administrativa dos perfis do sistema.",
  },
};

export default function BarraTopo({ usuario, secaoAtual, onLogout, onAbrirSidebar }) {
  const meta = metadadosPorSecao[secaoAtual] || metadadosPorSecao.dashboard;

  function iniciais(nome) {
    return nome
      .split(" ")
      .slice(0, 2)
      .map((parte) => parte[0])
      .join("")
      .toUpperCase();
  }

  return (
    <header className="topbar" role="banner">
      <div className="topbar__esquerda">
        <button
          className="topbar__menu-mobile botao botao--fantasma botao--pequeno"
          onClick={onAbrirSidebar}
          aria-label="Abrir menu de navegacao"
          type="button"
        >
          Menu
        </button>
        <div className="topbar__contexto">
          <span className="topbar__eyebrow">Workspace React</span>
          <h1 className="topbar__titulo">{meta.titulo}</h1>
          <p className="topbar__descricao">{meta.descricao}</p>
        </div>
      </div>

      <div className="topbar__acoes">
        <span className="insignia insignia--aviso">Modo demo</span>
        <div className="topbar__perfil" role="group" aria-label="Perfil do usuario">
          <div className="topbar__avatar" aria-hidden="true">
            {iniciais(usuario.nome)}
          </div>
          <div className="topbar__info">
            <span className="topbar__nome">{usuario.nome.split(" ")[0]}</span>
            <span className="topbar__cargo">{usuario.tipo}</span>
          </div>
        </div>

        <button
          className="botao botao--fantasma botao--pequeno"
          onClick={onLogout}
          aria-label="Sair da conta"
          type="button"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
