/* Metadados de título e descrição indexados por seção —
   permitem que a barra topo reflita o contexto da página atual */
const metadadosPorSecao = {
  dashboard: {
    titulo: "Panorama",
    descricao: "Resumo central do workspace com dados da plataforma.",
  },
  alunos: {
    titulo: "Gestão de Alunos",
    descricao: "Consulta rápida da base acadêmica para operação e apoio.",
  },
  professores: {
    titulo: "Corpo Docente",
    descricao: "Professores disponíveis para cursos e turmas.",
  },
  coordenadores: {
    titulo: "Coordenadores",
    descricao: "Supervisão acadêmica dos cursos.",
  },
  cursos: {
    titulo: "Catálogo Acadêmico",
    descricao: "A mesma base alimenta a home, o cadastro e o painel.",
  },
  modulos: {
    titulo: "Módulos por Curso",
    descricao: "Estrutura acadêmica para conteúdos, avaliações e progresso.",
  },
  turmas: {
    titulo: "Mapa de Turmas",
    descricao: "Turmas organizadas para acompanhamento da plataforma.",
  },
  matriculas: {
    titulo: "Fluxo de Matrículas",
    descricao: "Solicitações e status acadêmico simulados.",
  },
  avaliacoes: {
    titulo: "Avaliações",
    descricao: "Provas, quizzes e exercícios por perfil.",
  },
  conteudos: {
    titulo: "Conteúdos",
    descricao: "Materiais publicados para a jornada acadêmica.",
  },
  progresso: {
    titulo: "Meu Progresso",
    descricao: "Acompanhamento visual da trilha do aluno.",
  },
  usuarios: {
    titulo: "Usuários",
    descricao: "Visão administrativa dos perfis do sistema.",
  },
};

export default function BarraTopo({ usuario, secaoAtual, onLogout, onAbrirSidebar }) {
  /* Usa os metadados da seção atual; fallback para dashboard se a seção não estiver mapeada */
  const meta = metadadosPorSecao[secaoAtual] || metadadosPorSecao.dashboard;

  /* Extrai até duas iniciais do nome completo para o avatar textual */
  function gerarIniciais(nome) {
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
          aria-label="Abrir menu de navegação"
          type="button"
        >
          Menu
        </button>

        {/* Contexto dinâmico da seção atual — título e descrição mudam conforme a navegação */}
        <div className="topbar__contexto">
          <span className="topbar__eyebrow">CodeRyse Academy</span>
          <h1 className="topbar__titulo">{meta.titulo}</h1>
          <p className="topbar__descricao">{meta.descricao}</p>
        </div>
      </div>

      <div className="topbar__acoes">
        <span className="insignia insignia--aviso" role="status">Modo demo</span>

        {/* Grupo de perfil agrupa avatar e informações do usuário logado */}
        <div className="topbar__perfil" role="group" aria-label="Perfil do usuário logado">
          <div className="topbar__avatar" aria-hidden="true">
            {gerarIniciais(usuario.nome)}
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
