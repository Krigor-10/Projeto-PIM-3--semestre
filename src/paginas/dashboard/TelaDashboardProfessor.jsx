/* ============================================================
   TelaDashboardProfessor — Painel inicial do professor
   Exibe resumo de turmas do professor e avaliações recentes.
   Estatísticas globais vêm de dadosMock.js (estatisticasProfessor).
   ============================================================ */
import { TbCirclePlus, TbArrowUpRight, TbStar } from "react-icons/tb";
import { MdGroups, MdSchool, MdAssignmentTurnedIn } from "react-icons/md";
import Insignia from "@/componentes/Insignia.jsx";
import Botao from "@/componentes/Botao.jsx";
import CartaoEstatistica from "@/componentes/CartaoEstatistica.jsx";
import { turmas, avaliacoes, estatisticasProfessor } from "@/dados/dadosMock.js";

export default function TelaDashboardProfessor({ usuario, onMudarSecao }) {
  /* Filtra por professorId para exibir apenas as turmas deste professor */
  const minhasTurmas = turmas.filter((t) => t.professorId === usuario.id).slice(0, 3);
  /* Avaliações recentes — lista as 4 mais recentes do mock geral */
  const minhasAvaliacoes = avaliacoes.slice(0, 4);

  return (
    <main className="dashboard-professor">
      <header className="cabecalho-pagina">
        <div>
          <h1 className="cabecalho-pagina__titulo">Olá, Prof. {(usuario.nome ?? "").split(" ")[0]}</h1>
          <p className="cabecalho-pagina__subtitulo">
            Gerencie suas turmas, avaliações e conteúdos didáticos.
          </p>
        </div>
      </header>

      <section aria-labelledby="titulo-stats-prof">
        <h2 className="visualmente-oculto" id="titulo-stats-prof">Resumo do professor</h2>
        <div className="grade-estatisticas">
          <CartaoEstatistica icone={<MdGroups size={22} />}            valor={estatisticasProfessor.totalTurmas}          rotulo="Turmas ativas" />
          <CartaoEstatistica icone={<MdSchool size={22} />}            valor={estatisticasProfessor.totalAlunos}          rotulo="Total de alunos"      corBorda="var(--cor-info)" />
          <CartaoEstatistica icone={<MdAssignmentTurnedIn size={22} />} valor={estatisticasProfessor.avaliacoesPublicadas} rotulo="Avaliações publicadas" corBorda="var(--cor-sucesso)" />
          <CartaoEstatistica icone={<TbStar size={22} />}              valor={estatisticasProfessor.mediaNotas}           rotulo="Média de notas"       corBorda="var(--cor-aviso)" />
        </div>
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
    </main>
  );
}
