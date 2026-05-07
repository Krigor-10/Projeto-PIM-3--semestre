import CartaoEstatistica from "../../componentes/CartaoEstatistica.jsx";
import Insignia from "../../componentes/Insignia.jsx";
import { matriculas, turmas, estatisticasCoordenador } from "../../dados/dadosMock.js";

export default function TelaDashboardCoordenador({ usuario, onMudarSecao }) {
  const matriculasPendentes = matriculas.filter((m) => m.status === "Pendente");
  const turmasAtivas = turmas.filter((t) => t.status === "Ativa").slice(0, 4);

  return (
    <div className="dashboard-coordenador">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Ola, {usuario.nome.split(" ")[0]}</h2>
          <p className="cabecalho-pagina__subtitulo">
            Gerencie matriculas, turmas e acompanhe os indicadores academicos.
          </p>
        </div>
        <Insignia texto="Coordenador" variante="aviso" />
      </header>

      <section aria-labelledby="titulo-stats-coord">
        <h2 className="visualmente-oculto" id="titulo-stats-coord">Indicadores academicos</h2>
        <div className="grade-estatisticas">
          <CartaoEstatistica icone="CU" valor={estatisticasCoordenador.totalCursos} rotulo="Cursos disponiveis" />
          <CartaoEstatistica icone="TU" valor={estatisticasCoordenador.totalTurmas} rotulo="Turmas ativas" corBorda="var(--cor-sucesso)" />
          <CartaoEstatistica icone="MA" valor={estatisticasCoordenador.matriculasPendentes} rotulo="Matriculas pendentes" corBorda="var(--cor-aviso)" />
          <CartaoEstatistica icone="AL" valor={estatisticasCoordenador.totalAlunos} rotulo="Total de alunos" corBorda="var(--cor-info)" />
        </div>
      </section>

      <div className="grade-2" style={{ marginTop: "var(--espaco-xl)" }}>
        <section className="painel-secao" aria-labelledby="titulo-pendentes-coord">
          <header className="painel-secao__cabecalho">
            <h2 className="painel-secao__titulo" id="titulo-pendentes-coord">
              Matriculas Pendentes
              {matriculasPendentes.length > 0 && (
                <span className="insignia insignia--aviso" style={{ marginLeft: "8px" }}>
                  {matriculasPendentes.length}
                </span>
              )}
            </h2>
            <button className="botao botao--fantasma botao--pequeno" onClick={() => onMudarSecao("matriculas")}>
              Ver todas
            </button>
          </header>
          <div className="painel-secao__conteudo">
            {matriculasPendentes.length === 0 ? (
              <p className="texto-vazio">Nenhuma matricula pendente.</p>
            ) : (
              <ul className="lista-matriculas" role="list">
                {matriculasPendentes.map((mat) => (
                  <li key={mat.id} className="item-matricula">
                    <div className="item-matricula__info">
                      <strong>{mat.alunoNome}</strong>
                      <span>{mat.cursoTitulo}</span>
                    </div>
                    <div className="item-matricula__acoes">
                      <button className="botao botao--sucesso botao--pequeno" aria-label={`Aprovar matricula de ${mat.alunoNome}`}>
                        Aprovar
                      </button>
                      <button className="botao botao--perigo botao--pequeno" aria-label={`Rejeitar matricula de ${mat.alunoNome}`}>
                        X
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="painel-secao" aria-labelledby="titulo-turmas-coord">
          <header className="painel-secao__cabecalho">
            <h2 className="painel-secao__titulo" id="titulo-turmas-coord">Turmas Ativas</h2>
            <button className="botao botao--fantasma botao--pequeno" onClick={() => onMudarSecao("turmas")}>
              Ver todas
            </button>
          </header>
          <div className="painel-secao__conteudo">
            <ul className="lista-turmas" role="list">
              {turmasAtivas.map((turma) => (
                <li key={turma.id} className="item-turma">
                  <div className="item-turma__info">
                    <strong className="item-turma__nome">{turma.nomeTurma}</strong>
                    <span className="item-turma__curso">{turma.professorNome}</span>
                  </div>
                  <div className="item-turma__meta">
                    <span>{turma.totalAlunos} alunos</span>
                    <Insignia texto={turma.status} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
