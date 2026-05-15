import CartaoEstatistica from "@/componentes/CartaoEstatistica.jsx";
import Insignia from "@/componentes/Insignia.jsx";
import Botao from "@/componentes/Botao.jsx";
import { turmas, estatisticasCoordenador } from "@/dados/dadosMock.js";

export default function TelaDashboardCoordenador({ usuario, onMudarSecao }) {
  const turmasAtivas = turmas.filter((t) => t.status === "Ativa").slice(0, 4);

  return (
    <div className="dashboard-coordenador">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Olá, {usuario.nome.split(" ")[0]}</h2>
          <p className="cabecalho-pagina__subtitulo">
            Acompanhe turmas, cursos e indicadores acadêmicos.
          </p>
        </div>
        <Insignia texto="Coordenador" variante="aviso" />
      </header>

      <section aria-labelledby="titulo-stats-coord">
        <h2 className="visualmente-oculto" id="titulo-stats-coord">Indicadores acadêmicos</h2>
        <div className="grade-estatisticas">
          <CartaoEstatistica icone="CU" valor={estatisticasCoordenador.totalCursos}  rotulo="Cursos disponíveis" />
          <CartaoEstatistica icone="TU" valor={estatisticasCoordenador.totalTurmas}  rotulo="Turmas ativas"      corBorda="var(--cor-sucesso)" />
          <CartaoEstatistica icone="AL" valor={estatisticasCoordenador.totalAlunos}  rotulo="Total de alunos"    corBorda="var(--cor-info)" />
        </div>
      </section>

      <section className="painel-secao" style={{ marginTop: "var(--espaco-xl)" }} aria-labelledby="titulo-turmas-coord">
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
  );
}
