import BarraProgresso from "../componentes/BarraProgresso.jsx";
import Insignia from "../componentes/Insignia.jsx";
import { progressoAluno, conteudos, modulos, matriculas } from "../dados/dadosMock.js";

/* Percentuais de progresso simulados por id de matrícula (protótipo sem backend) */
const PROGRESSO_MOCK = { 1: 42, 2: 15, 6: 68 };

export default function TelaProgresso({ usuario }) {
  const tipo = usuario?.tipo;

  /* ── Vista do Aluno: seu próprio progresso ── */
  if (tipo === "Aluno") {
    const cursoPrincipal = progressoAluno.cursos[0];
    const conteudosConcluidos = conteudos.filter((c) => c.concluido).length;
    const totalConteudos = conteudos.length;
    const modulosConcluidos = progressoAluno.modulos.filter((m) =>
      m.status.normalize("NFD").replace(/[̀-ͯ]/g, "") === "Concluido"
    ).length;

    return (
      <div className="tela-progresso">
        <header className="cabecalho-pagina">
          <div>
            <h2 className="cabecalho-pagina__titulo">Meu Progresso</h2>
            <p className="cabecalho-pagina__subtitulo">
              Acompanhe sua evolução em cada módulo e conteúdo.
            </p>
          </div>
        </header>

        <section className="painel-secao" aria-labelledby="titulo-visao-geral">
          <header className="painel-secao__cabecalho">
            <h2 className="painel-secao__titulo" id="titulo-visao-geral">Visão Geral</h2>
          </header>
          <div className="painel-secao__conteudo">
            {cursoPrincipal && (
              <div className="progresso-curso-principal">
                <div className="progresso-curso-principal__header">
                  <h3 className="progresso-curso-principal__titulo">{cursoPrincipal.cursoTitulo}</h3>
                  <Insignia texto={cursoPrincipal.status} />
                </div>
                <div className="progresso-curso-principal__barra">
                  <BarraProgresso percentual={cursoPrincipal.percentual} />
                </div>
                <p className="progresso-curso-principal__meta">
                  Último acesso: {new Date(cursoPrincipal.ultimoAcesso).toLocaleDateString("pt-BR")}
                </p>
              </div>
            )}

            <div className="grade-estatisticas" style={{ marginTop: "var(--espaco-lg)" }}>
              <article className="cartao-estatistica">
                <span className="cartao-estatistica__icone" aria-hidden="true">OK</span>
                <strong className="cartao-estatistica__valor">{conteudosConcluidos}/{totalConteudos}</strong>
                <p className="cartao-estatistica__rotulo">Conteúdos concluídos</p>
              </article>
              <article className="cartao-estatistica" style={{ borderTopColor: "var(--cor-sucesso)" }}>
                <span className="cartao-estatistica__icone" aria-hidden="true">MO</span>
                <strong className="cartao-estatistica__valor">{modulosConcluidos}</strong>
                <p className="cartao-estatistica__rotulo">Módulos concluídos</p>
              </article>
              <article className="cartao-estatistica" style={{ borderTopColor: "var(--cor-info)" }}>
                <span className="cartao-estatistica__icone" aria-hidden="true">PR</span>
                <strong className="cartao-estatistica__valor">{cursoPrincipal?.percentual ?? 0}%</strong>
                <p className="cartao-estatistica__rotulo">Progresso geral</p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="painel-secao"
          style={{ marginTop: "var(--espaco-xl)" }}
          aria-labelledby="titulo-modulos-progresso"
        >
          <header className="painel-secao__cabecalho">
            <h2 className="painel-secao__titulo" id="titulo-modulos-progresso">Progresso por Módulo</h2>
          </header>
          <div className="painel-secao__conteudo">
            <ul className="lista-progresso-modulos" role="list">
              {progressoAluno.modulos.map((mod) => (
                <li key={mod.moduloId} className="item-progresso-modulo">
                  <div className="item-progresso-modulo__header">
                    <h3 className="item-progresso-modulo__titulo">{mod.moduloTitulo}</h3>
                    <Insignia texto={mod.status} />
                  </div>
                  <BarraProgresso percentual={mod.percentual} />

                  <ul
                    className="lista-conteudos-modulo"
                    role="list"
                    aria-label={`Conteúdos de ${mod.moduloTitulo}`}
                  >
                    {conteudos
                      .filter((c) => {
                        const m = modulos.find((mo) => mo.titulo === mod.moduloTitulo);
                        return m && c.moduloId === m.id;
                      })
                      .map((cont) => (
                        <li key={cont.id} className="item-conteudo-modulo">
                          <span
                            className={`item-conteudo-modulo__status ${cont.concluido ? "item-conteudo-modulo__status--ok" : ""}`}
                            aria-label={cont.concluido ? "Concluído" : "Pendente"}
                          >
                            {cont.concluido ? "OK" : "--"}
                          </span>
                          <span className="item-conteudo-modulo__titulo">{cont.titulo}</span>
                          <span className="item-conteudo-modulo__tipo">{cont.tipo} — {cont.duracao}</span>
                        </li>
                      ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    );
  }

  /* ── Vista administrativa: progresso de todos os alunos ── */
  const matriculasAprovadas = matriculas.filter((m) => m.status === "Aprovada");

  return (
    <div className="tela-progresso">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Progresso dos Alunos</h2>
          <p className="cabecalho-pagina__subtitulo">
            {matriculasAprovadas.length} aluno(s) matriculado(s) com acesso ativo.
          </p>
        </div>
      </header>

      <section className="painel-secao" aria-labelledby="titulo-lista-progresso">
        <header className="painel-secao__cabecalho">
          <h2 className="painel-secao__titulo" id="titulo-lista-progresso">Visão Geral por Aluno</h2>
        </header>
        <div className="painel-secao__conteudo">
          <ul className="lista-progresso-modulos" role="list">
            {matriculasAprovadas.map((mat) => {
              const percentual = PROGRESSO_MOCK[mat.id] ?? 0;
              return (
                <li key={mat.id} className="item-progresso-modulo">
                  <div className="item-progresso-modulo__header">
                    <h3 className="item-progresso-modulo__titulo">{mat.alunoNome}</h3>
                    <Insignia texto={mat.cursoTitulo} variante="marca" />
                  </div>
                  <BarraProgresso percentual={percentual} />
                  <p style={{ fontSize: "var(--fonte-sm)", color: "var(--cor-texto-mudo)", marginTop: "var(--espaco-xs)" }}>
                    {mat.turmaNome} — {percentual}% concluído
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
