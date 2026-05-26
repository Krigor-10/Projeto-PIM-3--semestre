import { TbCirclePlus, TbArrowUpRight } from "react-icons/tb";
import Insignia from "@/componentes/Insignia.jsx";
import Botao from "@/componentes/Botao.jsx";
import { turmas, avaliacoes, estatisticasProfessor } from "@/dados/dadosMock.js";

export default function TelaDashboardProfessor({ usuario, onMudarSecao }) {
  const minhasTurmas = turmas.filter((t) => t.professorId === usuario.id).slice(0, 3);
  const minhasAvaliacoes = avaliacoes.slice(0, 4);

  return (
    <div className="dashboard-professor">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Olá, Prof. {usuario.nome.split(" ")[0]}</h2>
          <p className="cabecalho-pagina__subtitulo">
            Gerencie suas turmas, avaliações e conteúdos didáticos.
          </p>
        </div>
        <Insignia texto="Professor" variante="info" />
      </header>

      <section aria-labelledby="titulo-stats-prof">
        <h2 className="visualmente-oculto" id="titulo-stats-prof">Resumo do professor</h2>
        <dl className="gerencial-stats-barra" aria-label="Resumo do professor">
          <div><dt>Turmas ativas</dt><dd>{estatisticasProfessor.totalTurmas}</dd></div>
          <div><dt>Alunos</dt><dd>{estatisticasProfessor.totalAlunos}</dd></div>
          <div><dt>Avaliações</dt><dd>{estatisticasProfessor.avaliacoesPublicadas}</dd></div>
          <div><dt>Média de notas</dt><dd>{estatisticasProfessor.mediaNotas}</dd></div>
        </dl>
      </section>

      <div className="grade-2" style={{ marginTop: "var(--espaco-xl)" }}>
        <section className="painel-secao" aria-labelledby="titulo-minhas-turmas">
          <header className="painel-secao__cabecalho">
            <h2 className="painel-secao__titulo" id="titulo-minhas-turmas">Minhas Turmas</h2>
            <Botao variante="fantasma" tamanho="pequeno" onClick={() => onMudarSecao("turmas")} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              Ver todas <TbArrowUpRight size={14} aria-hidden="true" />
            </Botao>
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
            <h2 className="painel-secao__titulo" id="titulo-minhas-avaliacoes">Avaliações</h2>
            <Botao variante="primario" tamanho="pequeno" onClick={() => onMudarSecao("avaliacoes")} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <TbCirclePlus size={18} />
              Nova
            </Botao>
          </header>
          <div className="painel-secao__conteudo">
            <ul className="lista-avaliacoes" role="list">
              {minhasAvaliacoes.map((av) => (
                <li key={av.id} className="item-avaliacao">
                  <div className="item-avaliacao__info">
                    <span className="item-avaliacao__titulo">{av.titulo}</span>
                    <span className="item-avaliacao__meta">
                      {av.totalQuestoes} questões · {av.tempoLimiteMinutos} min
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
