import BarraProgresso from "../../componentes/BarraProgresso.jsx";
import Insignia from "../../componentes/Insignia.jsx";
import { conteudos, cursos, modulos, matriculas, turmas } from "../../dados/dadosMock.js";

/* Percentuais simulados por id de matrícula para a vista administrativa */
const PROGRESSO_MOCK = { 1: 42, 2: 15, 6: 68 };

/* Retorna status e variante de badge a partir do progresso do módulo */
function resolverStatusModulo(concluidosModulo, totalItens) {
  if (totalItens === 0)                return { texto: "Vazio",        variante: "neutro"  };
  if (concluidosModulo === 0)          return { texto: "Não iniciado", variante: "neutro"  };
  if (concluidosModulo === totalItens) return { texto: "Concluído",    variante: "sucesso" };
  return                                      { texto: "Em andamento", variante: "info"    };
}

/* Definição das conquistas desbloqueáveis */
function gerarConquistas(totalConcluidos, modulosConcluidos, percentualGeral) {
  return [
    {
      id: "primeiro-passo",
      icone: "✦",
      titulo: "Primeiro passo",
      descricao: "Concluiu o 1º conteúdo",
      desbloqueada: totalConcluidos >= 1,
    },
    {
      id: "em-ritmo",
      icone: "◆",
      titulo: "Em ritmo",
      descricao: "5 conteúdos concluídos",
      desbloqueada: totalConcluidos >= 5,
    },
    {
      id: "modulo-completo",
      icone: "◎",
      titulo: "Módulo completo",
      descricao: "Finalizou um módulo inteiro",
      desbloqueada: modulosConcluidos >= 1,
    },
    {
      id: "metade",
      icone: "⬟",
      titulo: "Metade do caminho",
      descricao: "50% do curso concluído",
      desbloqueada: percentualGeral >= 50,
    },
  ];
}

/* ── Vista do Aluno ──────────────────────────────────────────── */

function VistaAluno({ usuario, avaliacaoAprovada = null, resultadosQuizzes = {} }) {
  const matricula = matriculas.find(
    (m) => m.alunoId === usuario?.id && m.status === "Aprovada"
  );
  const curso = matricula ? cursos.find((c) => c.id === matricula.cursoId) : null;

  const modulosDoCurso = matricula
    ? modulos.filter((m) => m.cursoId === matricula.cursoId).sort((a, b) => a.ordem - b.ordem)
    : [];

  const conteudosDoCurso = matricula
    ? conteudos.filter((c) => modulosDoCurso.some((m) => m.id === c.moduloId))
    : [];

  const totalConteudos  = conteudosDoCurso.length;
  const totalConcluidos = conteudosDoCurso.filter((c) => c.concluido).length;
  /* Percentual geral = concluídos / total × 100, arredondado para inteiro */
  const percentualGeral = totalConteudos > 0
    ? Math.round((totalConcluidos / totalConteudos) * 100)
    : 0;

  /* Conta módulos onde todos os conteúdos estão marcados como concluídos */
  const modulosConcluidos = modulosDoCurso.filter((modulo) => {
    const itens = conteudosDoCurso.filter((c) => c.moduloId === modulo.id);
    return itens.length > 0 && itens.every((c) => c.concluido);
  }).length;

  const conquistas = gerarConquistas(totalConcluidos, modulosConcluidos, percentualGeral);
  const certificadoDesbloqueado = percentualGeral === 100 && Boolean(avaliacaoAprovada);

  if (!matricula) {
    return (
      <p className="texto-vazio texto-vazio--central" role="status">
        Você não possui matrícula aprovada. Solicite sua matrícula para acompanhar o progresso.
      </p>
    );
  }

  return (
    <div className="tela-progresso">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Meu Progresso</h2>
          <p className="cabecalho-pagina__subtitulo">
            Acompanhe seu desempenho e conquiste seu certificado.
          </p>
        </div>
      </header>

      {/* ── Curso ── */}
      <section className="progresso-hero" aria-label="Visão geral do curso">
        <div className="progresso-hero__info">
          <p className="progresso-hero__turma">{matricula.turmaNome}</p>
          <h3 className="progresso-hero__titulo">{curso?.titulo}</h3>
          <p className="progresso-hero__codigo">{matricula.codigoMatricula}</p>
        </div>
        <div className="progresso-hero__direita">
          <span
            className="progresso-hero__percentual"
            aria-label={`${percentualGeral} por cento concluído`}
          >
            {percentualGeral}%
          </span>
          <BarraProgresso percentual={percentualGeral} />
          <p className="progresso-hero__legenda">
            {totalConcluidos}/{totalConteudos} conteúdos · {modulosConcluidos}/{modulosDoCurso.length} módulos
          </p>
        </div>
      </section>

      {/* ── Aproveitamento ── */}
      <section aria-labelledby="titulo-aproveitamento">
        <h3 className="secao-progresso__titulo" id="titulo-aproveitamento">Aproveitamento</h3>

        <ul className="lista-aproveitamento" role="list">
          {modulosDoCurso.map((modulo) => {
            const itens = conteudosDoCurso.filter((c) => c.moduloId === modulo.id);
            const concluidosModulo = itens.filter((c) => c.concluido).length;
            /* Percentual de conclusão do módulo = concluídos / total × 100 */
            const percentualModulo = itens.length > 0
              ? Math.round((concluidosModulo / itens.length) * 100)
              : 0;
            const { texto: statusTexto, variante: statusVariante } =
              resolverStatusModulo(concluidosModulo, itens.length);
            const quizPercentual = resultadosQuizzes[modulo.id];

            return (
              <li key={modulo.id} className="item-aproveitamento">
                <span className="item-aproveitamento__num" aria-hidden="true">
                  {modulo.ordem}
                </span>
                <div className="item-aproveitamento__info">
                  <span className="item-aproveitamento__titulo">{modulo.titulo}</span>
                  <div className="item-aproveitamento__barra" aria-hidden="true">
                    <BarraProgresso percentual={percentualModulo} mostrarTexto={false} />
                  </div>
                </div>
                <div className="item-aproveitamento__badges">
                  <Insignia texto={statusTexto} variante={statusVariante} />
                  {quizPercentual !== undefined ? (
                    <Insignia texto={`Quiz ${quizPercentual}%`} variante="sucesso" />
                  ) : (
                    <Insignia texto="Quiz pendente" variante="neutro" />
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Resultado da avaliação final */}
        <div
          className={`cartao-avaliacao-resultado ${avaliacaoAprovada ? "cartao-avaliacao-resultado--aprovado" : ""}`}
          role="status"
          aria-label="Resultado da avaliação final"
        >
          <span className="cartao-avaliacao-resultado__icone" aria-hidden="true">
            {avaliacaoAprovada ? "✓" : "⊘"}
          </span>
          <div className="cartao-avaliacao-resultado__info">
            <strong className="cartao-avaliacao-resultado__titulo">Avaliação Final</strong>
            <p className="cartao-avaliacao-resultado__detalhe">
              {avaliacaoAprovada
                ? `Nota ${avaliacaoAprovada.nota} / ${avaliacaoAprovada.notaMaxima} — ${avaliacaoAprovada.porcentagem}% de aproveitamento`
                : "Não realizada"}
            </p>
          </div>
          {avaliacaoAprovada && <Insignia texto="Aprovado" variante="sucesso" />}
        </div>
      </section>

      {/* ── Conquistas ── */}
      <section aria-labelledby="titulo-conquistas">
        <h3 className="secao-progresso__titulo" id="titulo-conquistas">Conquistas</h3>
        <ul className="grade-conquistas" role="list">
          {conquistas.map((c) => (
            <li
              key={c.id}
              className={`cartao-conquista ${c.desbloqueada ? "cartao-conquista--desbloqueada" : ""}`}
              aria-label={`${c.titulo} — ${c.desbloqueada ? "desbloqueada" : "bloqueada"}`}
            >
              <span className="cartao-conquista__icone" aria-hidden="true">{c.icone}</span>
              <strong className="cartao-conquista__titulo">{c.titulo}</strong>
              <p className="cartao-conquista__descricao">{c.descricao}</p>
              {!c.desbloqueada && (
                <span className="cartao-conquista__cadeado" aria-hidden="true">⊘</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Certificado ── */}
      <section className="secao-certificado" aria-labelledby="titulo-certificado">
        <h3 className="secao-progresso__titulo" id="titulo-certificado">
          Certificado de Conclusão
        </h3>

        {certificadoDesbloqueado ? (
          <div className="certificado" role="region" aria-label="Certificado de conclusão do curso">
            <div className="certificado__cabecalho">
              <span className="certificado__logo" aria-hidden="true">◈</span>
              <span className="certificado__plataforma">CodeRyse Academy</span>
            </div>
            <p className="certificado__subtitulo">Certificado de Conclusão</p>
            <p className="certificado__declara">Certificamos que</p>
            <h2 className="certificado__nome">{usuario.nome}</h2>
            <p className="certificado__texto">concluiu com êxito o curso</p>
            <h3 className="certificado__curso">{curso?.titulo}</h3>
            <dl className="certificado__meta">
              <div>
                <dt>Data de conclusão</dt>
                <dd>{new Date().toLocaleDateString("pt-BR")}</dd>
              </div>
              <div>
                <dt>Aproveitamento</dt>
                <dd>{avaliacaoAprovada.porcentagem}%</dd>
              </div>
              <div>
                <dt>Código de verificação</dt>
                <dd>CR-{matricula.codigoMatricula}-{new Date().getFullYear()}</dd>
              </div>
            </dl>
            <button
              className="botao botao--primario"
              onClick={() => window.print()}
              type="button"
            >
              Imprimir certificado
            </button>
          </div>
        ) : (
          <div className="certificado-bloqueado" aria-label="Certificado bloqueado">
            <span className="certificado-bloqueado__icone" aria-hidden="true">⊘</span>
            <h4 className="certificado-bloqueado__titulo">Certificado bloqueado</h4>
            <p className="certificado-bloqueado__desc">
              Complete os requisitos abaixo para desbloquear seu certificado.
            </p>
            <ul className="certificado-bloqueado__requisitos" role="list">
              <li className={`requisito ${percentualGeral === 100 ? "requisito--ok" : ""}`}>
                <span className="requisito__icone" aria-hidden="true">
                  {percentualGeral === 100 ? "✓" : "○"}
                </span>
                <span>Concluir todos os conteúdos do curso</span>
                <Insignia
                  texto={`${percentualGeral}%`}
                  variante={percentualGeral === 100 ? "sucesso" : "neutro"}
                />
              </li>
              <li className={`requisito ${Boolean(avaliacaoAprovada) ? "requisito--ok" : ""}`}>
                <span className="requisito__icone" aria-hidden="true">
                  {Boolean(avaliacaoAprovada) ? "✓" : "○"}
                </span>
                <span>Aprovação na avaliação final com ≥ 70%</span>
                <Insignia
                  texto={Boolean(avaliacaoAprovada) ? "Aprovado" : "Pendente"}
                  variante={Boolean(avaliacaoAprovada) ? "sucesso" : "neutro"}
                />
              </li>
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

/* ── Vista do Professor ──────────────────────────────────────── */

function VistaProfessor({ usuario }) {
  const minhasTurmas = turmas.filter((t) => t.professorId === usuario.id);
  const minhasTurmaIds = new Set(minhasTurmas.map((t) => t.id));

  const matriculasMinhasTurmas = matriculas.filter(
    (m) => minhasTurmaIds.has(m.turmaId) && m.status === "Aprovada"
  );

  const totalAlunos = matriculasMinhasTurmas.length;
  const mediaGeral = totalAlunos > 0
    ? Math.round(
        matriculasMinhasTurmas.reduce((acc, m) => acc + (PROGRESSO_MOCK[m.id] ?? 0), 0) /
        totalAlunos
      )
    : 0;

  return (
    <div className="tela-progresso">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Progresso dos Alunos</h2>
          <p className="cabecalho-pagina__subtitulo">
            {minhasTurmas.length} turma(s) · {totalAlunos} aluno(s) com matrícula ativa — média geral: {mediaGeral}%
          </p>
        </div>
      </header>

      {minhasTurmas.length === 0 && (
        <p className="texto-vazio" role="status">Você não possui turmas atribuídas.</p>
      )}

      {minhasTurmas.map((turma) => {
        const alunosDaTurma = matriculasMinhasTurmas.filter((m) => m.turmaId === turma.id);

        return (
          <section
            key={turma.id}
            className="painel-secao"
            aria-labelledby={`titulo-turma-${turma.id}`}
            style={{ marginBottom: "var(--espaco-xl)" }}
          >
            <header className="painel-secao__cabecalho">
              <div>
                <h3 className="painel-secao__titulo" id={`titulo-turma-${turma.id}`}>
                  {turma.nomeTurma}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--cor-texto-suave)", marginTop: "4px" }}>
                  {turma.cursoTitulo} · {alunosDaTurma.length} aluno(s)
                </p>
              </div>
              <Insignia
                texto={turma.status}
                variante={turma.status === "Ativa" ? "sucesso" : "neutro"}
              />
            </header>

            <div className="painel-secao__conteudo">
              {alunosDaTurma.length === 0 ? (
                <p className="texto-vazio" role="status">Nenhum aluno com matrícula aprovada nesta turma.</p>
              ) : (
                <ul className="lista-progresso-alunos" role="list" aria-label={`Alunos da turma ${turma.nomeTurma}`}>
                  {alunosDaTurma.map((mat) => {
                    const percentual = PROGRESSO_MOCK[mat.id] ?? 0;
                    const { texto: statusTexto, variante: statusVariante } =
                      resolverStatusModulo(percentual, 100);

                    return (
                      <li key={mat.id} className="cartao-progresso-aluno">
                        <div className="cartao-progresso-aluno__avatar" aria-hidden="true">
                          {mat.alunoNome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
                        </div>
                        <div className="cartao-progresso-aluno__info">
                          <strong className="cartao-progresso-aluno__nome">{mat.alunoNome}</strong>
                          <p className="cartao-progresso-aluno__meta">{mat.codigoMatricula}</p>
                          <div className="cartao-progresso-aluno__barra">
                            <BarraProgresso percentual={percentual} mostrarTexto={false} />
                          </div>
                        </div>
                        <div className="cartao-progresso-aluno__badges">
                          <Insignia texto={`${percentual}%`} variante="neutro" />
                          <Insignia texto={statusTexto} variante={statusVariante} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ── Vista administrativa ────────────────────────────────────── */

function VistaAdmin() {
  const matriculasAprovadas = matriculas.filter((m) => m.status === "Aprovada");
  const mediaGeral = matriculasAprovadas.length > 0
    ? Math.round(
        matriculasAprovadas.reduce((acc, m) => acc + (PROGRESSO_MOCK[m.id] ?? 0), 0) /
        matriculasAprovadas.length
      )
    : 0;

  return (
    <div className="tela-progresso">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Progresso dos Alunos</h2>
          <p className="cabecalho-pagina__subtitulo">
            {matriculasAprovadas.length} aluno(s) com matrícula ativa — média geral: {mediaGeral}%
          </p>
        </div>
      </header>

      <ul className="lista-progresso-alunos" role="list" aria-label="Progresso por aluno">
        {matriculasAprovadas.map((mat) => {
          const percentual = PROGRESSO_MOCK[mat.id] ?? 0;
          const { texto: statusTexto, variante: statusVariante } =
            resolverStatusModulo(percentual, 100);

          return (
            <li key={mat.id} className="cartao-progresso-aluno">
              <div className="cartao-progresso-aluno__avatar" aria-hidden="true">
                {mat.alunoNome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
              </div>
              <div className="cartao-progresso-aluno__info">
                <strong className="cartao-progresso-aluno__nome">{mat.alunoNome}</strong>
                <p className="cartao-progresso-aluno__meta">
                  {mat.turmaNome} · {mat.cursoTitulo}
                </p>
                <div className="cartao-progresso-aluno__barra">
                  <BarraProgresso percentual={percentual} mostrarTexto={false} />
                </div>
              </div>
              <div className="cartao-progresso-aluno__badges">
                <Insignia texto={`${percentual}%`} variante="neutro" />
                <Insignia texto={statusTexto} variante={statusVariante} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ── Componente principal ────────────────────────────────────── */

export default function TelaProgresso({ usuario, avaliacaoAprovada, resultadosQuizzes }) {
  if (usuario?.tipo === "Aluno") {
    return (
      <VistaAluno
        usuario={usuario}
        avaliacaoAprovada={avaliacaoAprovada}
        resultadosQuizzes={resultadosQuizzes}
      />
    );
  }
  if (usuario?.tipo === "Professor") {
    return <VistaProfessor usuario={usuario} />;
  }
  return <VistaAdmin />;
}
