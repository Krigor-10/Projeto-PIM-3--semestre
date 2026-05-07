import CartaoEstatistica from "../../componentes/CartaoEstatistica.jsx";
import Insignia from "../../componentes/Insignia.jsx";
import { turmas, avaliacoes, estatisticasProfessor } from "../../dados/dadosMock.js";

export default function TelaDashboardProfessor({ usuario, onMudarSecao }) {
  const minhasTurmas = turmas.filter((t) => t.professorNome === usuario.nome).slice(0, 3);
  const minhasAvaliacoes = avaliacoes.slice(0, 4);

  return (
    <div className="dashboard-professor">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Ola, Prof. {usuario.nome.split(" ")[0]}</h2>
          <p className="cabecalho-pagina__subtitulo">
            Gerencie suas turmas, avaliacoes e conteudos didaticos.
          </p>
        </div>
        <Insignia texto="Professor" variante="info" />
      </header>

      <section aria-labelledby="titulo-stats-prof">
        <h2 className="visualmente-oculto" id="titulo-stats-prof">Resumo do professor</h2>
        <div className="grade-estatisticas">
          <CartaoEstatistica icone="TU" valor={estatisticasProfessor.totalTurmas} rotulo="Turmas ativas" />
          <CartaoEstatistica icone="AL" valor={estatisticasProfessor.totalAlunos} rotulo="Alunos sob responsabilidade" corBorda="var(--cor-sucesso)" />
          <CartaoEstatistica icone="AV" valor={estatisticasProfessor.avaliacoesPublicadas} rotulo="Avaliacoes publicadas" corBorda="var(--cor-aviso)" />
          <CartaoEstatistica icone="MD" valor={estatisticasProfessor.mediaNotas} rotulo="Media geral das notas" corBorda="var(--cor-info)" />
        </div>
      </section>

      <div className="grade-2" style={{ marginTop: "var(--espaco-xl)" }}>
        <section className="painel-secao" aria-labelledby="titulo-minhas-turmas">
          <header className="painel-secao__cabecalho">
            <h2 className="painel-secao__titulo" id="titulo-minhas-turmas">Minhas Turmas</h2>
            <button className="botao botao--fantasma botao--pequeno" onClick={() => onMudarSecao("turmas")}>
              Ver todas
            </button>
          </header>
          <div className="painel-secao__conteudo">
            {minhasTurmas.length > 0 ? (
              <ul className="lista-turmas" role="list">
                {minhasTurmas.map((turma) => (
                  <li key={turma.id} className="item-turma">
                    <div className="item-turma__info">
                      <strong className="item-turma__nome">{turma.nomeTurma}</strong>
                      <span className="item-turma__curso">{turma.cursoTitulo}</span>
                    </div>
                    <div className="item-turma__meta">
                      <span>{turma.totalAlunos} alunos</span>
                      <Insignia texto={turma.status} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="texto-vazio">Nenhuma turma encontrada para o seu perfil.</p>
            )}
          </div>
        </section>

        <section className="painel-secao" aria-labelledby="titulo-minhas-avaliacoes">
          <header className="painel-secao__cabecalho">
            <h2 className="painel-secao__titulo" id="titulo-minhas-avaliacoes">Avaliacoes</h2>
            <button className="botao botao--primario botao--pequeno" onClick={() => onMudarSecao("avaliacoes")}>
              + Nova
            </button>
          </header>
          <div className="painel-secao__conteudo">
            <ul className="lista-avaliacoes" role="list">
              {minhasAvaliacoes.map((av) => (
                <li key={av.id} className="item-avaliacao">
                  <div className="item-avaliacao__info">
                    <span className="item-avaliacao__titulo">{av.titulo}</span>
                    <span className="item-avaliacao__meta">
                      {av.totalQuestoes} questoes - {av.tempoLimiteMinutos}min
                    </span>
                  </div>
                  <Insignia texto={av.status} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
