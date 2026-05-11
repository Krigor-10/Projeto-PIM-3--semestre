import { useState } from "react";
import CartaoEstatistica from "../../componentes/CartaoEstatistica.jsx";
import Insignia from "../../componentes/Insignia.jsx";
import Botao from "../../componentes/Botao.jsx";
import { matriculas, turmas, estatisticasCoordenador } from "../../dados/dadosMock.js";

export default function TelaDashboardCoordenador({ usuario, onMudarSecao, onToast }) {
  const [listaMatriculas, setListaMatriculas] = useState(matriculas);

  const matriculasPendentes = listaMatriculas.filter((m) => m.status === "Pendente");
  const turmasAtivas = turmas.filter((t) => t.status === "Ativa").slice(0, 4);

  function aprovar(id, nomeAluno) {
    setListaMatriculas((prev) => prev.map((m) => m.id === id ? { ...m, status: "Aprovada" } : m));
    onToast?.(`Matrícula de ${nomeAluno} aprovada.`, "sucesso");
  }

  function rejeitar(id, nomeAluno) {
    setListaMatriculas((prev) => prev.map((m) => m.id === id ? { ...m, status: "Rejeitada" } : m));
    onToast?.(`Matrícula de ${nomeAluno} rejeitada.`, "erro");
  }

  return (
    <div className="dashboard-coordenador">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Olá, {usuario.nome.split(" ")[0]}</h2>
          <p className="cabecalho-pagina__subtitulo">
            Gerencie matrículas, turmas e acompanhe os indicadores acadêmicos.
          </p>
        </div>
        <Insignia texto="Coordenador" variante="aviso" />
      </header>

      <section aria-labelledby="titulo-stats-coord">
        <h2 className="visualmente-oculto" id="titulo-stats-coord">Indicadores acadêmicos</h2>
        <div className="grade-estatisticas">
          <CartaoEstatistica icone="CU" valor={estatisticasCoordenador.totalCursos} rotulo="Cursos disponíveis" />
          <CartaoEstatistica icone="TU" valor={estatisticasCoordenador.totalTurmas} rotulo="Turmas ativas" corBorda="var(--cor-sucesso)" />
          <CartaoEstatistica icone="MA" valor={estatisticasCoordenador.matriculasPendentes} rotulo="Matrículas pendentes" corBorda="var(--cor-aviso)" />
          <CartaoEstatistica icone="AL" valor={estatisticasCoordenador.totalAlunos} rotulo="Total de alunos" corBorda="var(--cor-info)" />
        </div>
      </section>

      <div className="grade-2" style={{ marginTop: "var(--espaco-xl)" }}>
        <section className="painel-secao" aria-labelledby="titulo-pendentes-coord">
          <header className="painel-secao__cabecalho">
            <h2 className="painel-secao__titulo" id="titulo-pendentes-coord">
              Matrículas Pendentes
              {matriculasPendentes.length > 0 && (
                <span className="insignia insignia--aviso" style={{ marginLeft: "8px" }}>
                  {matriculasPendentes.length}
                </span>
              )}
            </h2>
            <Botao variante="fantasma" tamanho="pequeno" onClick={() => onMudarSecao("matriculas")}>
              Ver todas
            </Botao>
          </header>
          <div className="painel-secao__conteudo">
            {matriculasPendentes.length === 0 ? (
              <p className="texto-vazio">Nenhuma matrícula pendente.</p>
            ) : (
              <ul className="lista-matriculas" role="list">
                {matriculasPendentes.map((mat) => (
                  <li key={mat.id} className="item-matricula">
                    <div className="item-matricula__info">
                      <strong>{mat.alunoNome}</strong>
                      <span>{mat.cursoTitulo}</span>
                    </div>
                    <div className="item-matricula__acoes">
                      <Botao variante="sucesso" tamanho="pequeno" onClick={() => aprovar(mat.id, mat.alunoNome)} aria-label={`Aprovar matrícula de ${mat.alunoNome}`}>
                        Aprovar
                      </Botao>
                      <Botao variante="perigo" tamanho="pequeno" onClick={() => rejeitar(mat.id, mat.alunoNome)} aria-label={`Rejeitar matrícula de ${mat.alunoNome}`}>
                        Rejeitar
                      </Botao>
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
            <Botao variante="fantasma" tamanho="pequeno" onClick={() => onMudarSecao("turmas")}>
              Ver todas
            </Botao>
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
