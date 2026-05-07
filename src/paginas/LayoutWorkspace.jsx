import { useState } from "react";
import { temPermissao } from "../dados/permissoes.js";
import BarraLateral from "../componentes/BarraLateral.jsx";
import BarraTopo from "../componentes/BarraTopo.jsx";
import TelaDashboardAluno from "./TelaDashboardAluno.jsx";
import TelaDashboardProfessor from "./TelaDashboardProfessor.jsx";
import TelaDashboardCoordenador from "./TelaDashboardCoordenador.jsx";
import TelaDashboardAdmin from "./TelaDashboardAdmin.jsx";
import TelaCursos from "./TelaCursos.jsx";
import TelaModulos from "./TelaModulos.jsx";
import TelaTurmas from "./TelaTurmas.jsx";
import TelaMatriculas from "./TelaMatriculas.jsx";
import TelaAvaliacoes from "./TelaAvaliacoes.jsx";
import TelaConteudos from "./TelaConteudos.jsx";
import TelaProgresso from "./TelaProgresso.jsx";
import TelaUsuarios from "./TelaUsuarios.jsx";
import TelaAlunos from "./TelaAlunos.jsx";
import TelaProfessores from "./TelaProfessores.jsx";
import TelaCoordenadores from "./TelaCoordenadores.jsx";
import TelaQuiz from "./TelaQuiz.jsx";

function resolverDashboard(tipo) {
  const dashboards = {
    Aluno: TelaDashboardAluno,
    Professor: TelaDashboardProfessor,
    Coordenador: TelaDashboardCoordenador,
    Admin: TelaDashboardAdmin,
  };
  return dashboards[tipo] || TelaDashboardAluno;
}

const mapaTelas = {
  cursos: TelaCursos,
  modulos: TelaModulos,
  turmas: TelaTurmas,
  matriculas: TelaMatriculas,
  avaliacoes: TelaAvaliacoes,
  conteudos: TelaConteudos,
  progresso: TelaProgresso,
  usuarios: TelaUsuarios,
  alunos: TelaAlunos,
  professores: TelaProfessores,
  coordenadores: TelaCoordenadores,
  quiz: TelaQuiz,
};

function TelaAcessoNegado() {
  return (
    <div className="tela-acesso-negado">
      <span aria-hidden="true">!</span>
      <h2>Acesso nao autorizado</h2>
      <p>Voce nao tem permissao para acessar esta secao.</p>
    </div>
  );
}

export default function LayoutWorkspace({ usuario, secaoAtual, onMudarSecao, onLogout }) {
  const [sidebarAberta, setSidebarAberta] = useState(false);

  function resolverTela() {
    if (secaoAtual === "dashboard") return resolverDashboard(usuario.tipo);

    if (secaoAtual === "quiz") return mapaTelas.quiz;

    if (!temPermissao(usuario.tipo, secaoAtual)) return TelaAcessoNegado;

    return mapaTelas[secaoAtual] || resolverDashboard(usuario.tipo);
  }

  const ComponenteTela = resolverTela();

  return (
    <div className="layout-workspace">
      <BarraLateral
        usuario={usuario}
        secaoAtual={secaoAtual}
        onMudarSecao={onMudarSecao}
        aberta={sidebarAberta}
        onFechar={() => setSidebarAberta(false)}
      />

      <div className="layout-conteudo">
        <BarraTopo
          usuario={usuario}
          secaoAtual={secaoAtual}
          onLogout={onLogout}
          onAbrirSidebar={() => setSidebarAberta(true)}
        />

        <main className="layout-principal" id="conteudo-principal" tabIndex={-1}>
          <ComponenteTela usuario={usuario} onMudarSecao={onMudarSecao} />
        </main>
      </div>
    </div>
  );
}
