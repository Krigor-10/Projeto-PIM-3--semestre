import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { rotaPainelSecao } from "@/rotas.js";
import { temPermissao } from "@/dados/permissoes.js";
import BarraLateral from "@/componentes/BarraLateral.jsx";
import BarraTopo from "@/componentes/BarraTopo.jsx";
import TelaDashboardAluno from "./dashboard/TelaDashboardAluno.jsx";
import TelaDashboardProfessor from "./dashboard/TelaDashboardProfessor.jsx";
import TelaDashboardCoordenador from "./dashboard/TelaDashboardCoordenador.jsx";
import TelaDashboardAdmin from "./dashboard/TelaDashboardAdmin.jsx";
import TelaCursos from "./academico/TelaCursos.jsx";
import TelaModulos from "./academico/TelaModulos.jsx";
import TelaTurmas from "./academico/TelaTurmas.jsx";
import TelaMatriculas from "./academico/TelaMatriculas.jsx";
import TelaAvaliacoes from "./academico/TelaAvaliacoes.jsx";
import TelaConteudos from "./academico/TelaConteudos.jsx";
import TelaProgresso from "./aprendizado/TelaProgresso.jsx";
import TelaUsuarios from "./usuarios/TelaUsuarios.jsx";
import TelaAlunos from "./usuarios/TelaAlunos.jsx";
import TelaProfessores from "./usuarios/TelaProfessores.jsx";
import TelaCoordenadores from "./usuarios/TelaCoordenadores.jsx";
import TelaQuiz from "./aprendizado/TelaQuiz.jsx";
import TelaCertificados from "./aprendizado/TelaCertificados.jsx";
import TelaCatalogo from "./admin/TelaCatalogo.jsx";
import Toast from "@/componentes/Toast.jsx";

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
  certificados: TelaCertificados,
  catalogo: TelaCatalogo,
};

function TelaAcessoNegado() {
  return (
    <section className="tela-acesso-negado" aria-labelledby="titulo-acesso-negado">
      <span className="tela-acesso-negado__icone" aria-hidden="true">⊘</span>
      <h2 className="tela-acesso-negado__titulo" id="titulo-acesso-negado">Acesso não autorizado</h2>
      <p className="tela-acesso-negado__descricao">Você não tem permissão para acessar esta seção.</p>
    </section>
  );
}

export default function LayoutWorkspace({ usuario, onLogout }) {
  const { "*": secaoPath = "" } = useParams();
  const secaoAtual = secaoPath || "dashboard";
  const navigate = useNavigate();

  function mudarSecao(secao) {
    navigate(rotaPainelSecao(secao));
  }
  const [sidebarAberta, setSidebarAberta] = useState(false);
  /* Estado global de progresso — compartilhado entre TelaConteudos, TelaAvaliacoes e TelaProgresso */
  const [quizzesAprovados, setQuizzesAprovados] = useState(() => new Set());
  /* Percentual de acerto por módulo: { [moduloId]: número } */
  const [resultadosQuizzes, setResultadosQuizzes] = useState({});
  /* null enquanto não aprovada; objeto { porcentagem, nota, notaMaxima } após aprovação */
  const [avaliacaoAprovada, setAvaliacaoAprovada] = useState(null);
  const [conteudoConcluido, setConteudoConcluido] = useState(false);
  const [toasts, setToasts] = useState([]);

  function mostrarToast(mensagem, tipo = "sucesso") {
    const id = Date.now();
    setToasts((prev) => [...prev.slice(-2), { id, mensagem, tipo }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  function registrarQuizAprovado(moduloId, percentual) {
    setQuizzesAprovados((prev) => new Set(prev).add(moduloId));
    setResultadosQuizzes((prev) => ({ ...prev, [moduloId]: percentual }));
  }

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
          <div key={secaoAtual} className="tela-animada">
            <ComponenteTela
              usuario={usuario}
              onMudarSecao={mudarSecao}
              quizzesAprovados={quizzesAprovados}
              onQuizAprovado={registrarQuizAprovado}
              resultadosQuizzes={resultadosQuizzes}
              avaliacaoAprovada={avaliacaoAprovada}
              onAvaliacaoAprovada={(resultado) => setAvaliacaoAprovada(resultado)}
              conteudoConcluido={conteudoConcluido}
              onConteudoConcluido={setConteudoConcluido}
              onToast={mostrarToast}
            />
          </div>
        </main>
      </div>
      <Toast
        toasts={toasts}
        onFechar={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
