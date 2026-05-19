import { useState } from "react";
import { TbTrophy } from "react-icons/tb";
import BarraProgresso from "@/componentes/BarraProgresso.jsx";
import Insignia from "@/componentes/Insignia.jsx";
import Botao from "@/componentes/Botao.jsx";
import { conteudos, cursos, modulos, matriculas, turmas, certificadosDemo } from "@/dados/dadosMock.js";

/* Percentuais simulados por id de matrícula para a vista administrativa */
const PROGRESSO_MOCK = { 1: 42, 2: 15, 6: 68 };

/* Média de notas simulada por id de turma (escala 0–10) */
const NOTAS_MOCK = { 1: 7.8, 3: 8.2, 4: 7.1, 5: 9.0, 6: 6.5, 7: 8.5 };

/* Retorna status e variante de badge a partir do progresso do módulo */
function resolverStatusModulo(concluidosModulo, totalItens) {
  if (totalItens === 0)                return { texto: "Vazio",        variante: "neutro"  };
  if (concluidosModulo === 0)          return { texto: "Não iniciado", variante: "neutro"  };
  if (concluidosModulo === totalItens) return { texto: "Concluído",    variante: "sucesso" };
  return                                      { texto: "Em andamento", variante: "info"    };
}

/* ── Vista do Aluno ──────────────────────────────────────────── */

function VistaAluno({ usuario, avaliacaoAprovada = null, resultadosQuizzes = {}, onMudarSecao, conteudosConcluidos }) {
  const matriculasAprovadas = matriculas.filter(
    (m) => m.alunoId === usuario?.id && m.status === "Aprovada"
  );
  const [cursoAtivo, setCursoAtivo] = useState(0);
  const matricula = matriculasAprovadas[cursoAtivo] ?? null;
  const curso = matricula ? cursos.find((c) => c.id === matricula.cursoId) : null;

  const modulosDoCurso = matricula
    ? modulos.filter((m) => m.cursoId === matricula.cursoId).sort((a, b) => a.ordem - b.ordem)
    : [];

  const conteudosDoCurso = matricula
    ? conteudos.filter((c) => modulosDoCurso.some((m) => m.id === c.moduloId))
    : [];

  const concluidos = conteudosConcluidos ?? new Set(conteudosDoCurso.filter((c) => c.concluido).map((c) => c.id));

  const totalConteudos  = conteudosDoCurso.length;
  const totalConcluidos = conteudosDoCurso.filter((c) => concluidos.has(c.id)).length;

  /* Quiz conta como um passo extra por módulo — igual a TelaConteudos */
  const modulosComConteudo = modulosDoCurso.filter((m) => conteudosDoCurso.some((c) => c.moduloId === m.id));
  const quizzesFeitos = modulosComConteudo.filter((m) => resultadosQuizzes[m.id] !== undefined).length;
  const totalPassos   = totalConteudos + modulosComConteudo.length;
  const passosFeitos  = totalConcluidos + quizzesFeitos;
  const percentualGeral = totalPassos > 0 ? Math.round((passosFeitos / totalPassos) * 100) : 0;

  /* Módulo concluído = todos os conteúdos + quiz aprovado */
  const modulosConcluidos = modulosDoCurso.filter((modulo) => {
    const itens = conteudosDoCurso.filter((c) => c.moduloId === modulo.id);
    return itens.length > 0 && itens.every((c) => concluidos.has(c.id)) && resultadosQuizzes[modulo.id] !== undefined;
  }).length;

  const certAtivo = avaliacaoAprovada ?? (matricula ? certificadosDemo[matricula.cursoId] ?? null : null);
  const certificadoDesbloqueado = Boolean(certAtivo);

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

      {matriculasAprovadas.length > 1 && (
        <nav className="tabs-cursos" aria-label="Selecionar curso">
          {matriculasAprovadas.map((mat, idx) => (
            <button
              key={mat.id}
              className={`tabs-cursos__tab${idx === cursoAtivo ? " tabs-cursos__tab--ativo" : ""}`}
              onClick={() => setCursoAtivo(idx)}
              aria-current={idx === cursoAtivo ? "true" : undefined}
            >
              <span className="tabs-cursos__nome">{mat.cursoTitulo}</span>
              <span className="tabs-cursos__turma">{mat.turmaNome}</span>
            </button>
          ))}
        </nav>
      )}

      {/* ── Curso ── */}
      <section className="progresso-hero" aria-label="Visão geral do curso">
        <div className="progresso-hero__info">
          <p className="progresso-hero__turma">{matricula.turmaNome}</p>
          <h3 className="progresso-hero__titulo">{curso?.titulo}</h3>
          <p className="progresso-hero__codigo">{matricula.codigoMatricula}</p>
        </div>
        <div className="progresso-hero__direita">
          <div className="anel-progresso" aria-label={`${percentualGeral} por cento concluído`}>
            <svg className="anel-progresso__svg" viewBox="0 0 120 120" aria-hidden="true">
              <defs>
                <linearGradient id="anel-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#b992ff" />
                  <stop offset="100%" stopColor="#7b2ff7" />
                </linearGradient>
              </defs>
              <circle className="anel-progresso__trilha" cx="60" cy="60" r="50" />
              <circle
                className="anel-progresso__arco"
                cx="60" cy="60" r="50"
                stroke="url(#anel-grad)"
                style={{
                  strokeDasharray: "314.16",
                  strokeDashoffset: 314.16 * (1 - percentualGeral / 100),
                }}
              />
            </svg>
            <span className="anel-progresso__texto" aria-hidden="true">{percentualGeral}%</span>
          </div>
          <p className="progresso-hero__legenda">
            {passosFeitos}/{totalPassos} passos · {modulosConcluidos}/{modulosComConteudo.length} módulos
          </p>
        </div>
      </section>

      {/* ── Aproveitamento ── */}
      <section aria-labelledby="titulo-aproveitamento">
        <h3 className="secao-progresso__titulo" id="titulo-aproveitamento">Aproveitamento</h3>

        <ol className="trilha-modulos" aria-label="Jornada por módulo">
          {modulosDoCurso.map((modulo, idx) => {
            const itens = conteudosDoCurso.filter((c) => c.moduloId === modulo.id);
            const concluidosModulo = itens.filter((c) => concluidos.has(c.id)).length;
            const quizPercentual = resultadosQuizzes[modulo.id];
            const quizFeito = quizPercentual !== undefined;
            /* Progresso do step = conteúdos + quiz (cada um vale 1 passo) */
            const totalPassosModulo = itens.length + 1;
            const passosModulo = concluidosModulo + (quizFeito ? 1 : 0);
            const percentualModulo = Math.round((passosModulo / totalPassosModulo) * 100);
            const concluido = passosModulo === totalPassosModulo;
            const emAndamento = passosModulo > 0 && !concluido;

            return (
              <li
                key={modulo.id}
                className={`passo-modulo${concluido ? " passo-modulo--concluido" : emAndamento ? " passo-modulo--andamento" : ""}`}
              >
                <div className="passo-modulo__esquerda">
                  <div className="passo-modulo__indicador" aria-hidden="true">
                    {concluido ? "✓" : modulo.ordem}
                  </div>
                  <div className="passo-modulo__linha" aria-hidden="true" />
                </div>
                <div className="passo-modulo__corpo">
                  <div className="passo-modulo__cabecalho">
                    <span className="passo-modulo__titulo">{modulo.titulo}</span>
                  </div>
                  {itens.length > 0 && (
                    <div className="passo-modulo__progresso">
                      <BarraProgresso percentual={percentualModulo} mostrarTexto={false} />
                      <span className="passo-modulo__pct">{percentualModulo}%</span>
                    </div>
                  )}
                  {quizPercentual !== undefined && (
                    <p className="passo-modulo__quiz">Quiz aprovado — {quizPercentual}%</p>
                  )}
                </div>
              </li>
            );
          })}
          <li
            className={`passo-modulo passo-modulo--avaliacao${certAtivo ? " passo-modulo--concluido" : modulosConcluidos === modulosDoCurso.length && modulosDoCurso.length > 0 ? " passo-modulo--andamento" : ""}`}
          >
            <div className="passo-modulo__esquerda">
              <div className="passo-modulo__indicador" aria-hidden="true">
                {certAtivo ? "✓" : "★"}
              </div>
            </div>
            <div className="passo-modulo__corpo">
              <div className="passo-modulo__cabecalho">
                <span className="passo-modulo__titulo">Avaliação Final</span>
                {certAtivo
                  ? <Insignia texto="Aprovado" variante="sucesso" />
                  : <Insignia texto="Pendente" variante="neutro" />
                }
              </div>
              {certAtivo ? (
                <div className="cartao-avaliacao-resultado__nota">
                  <span className="cartao-avaliacao-resultado__nota-valor">{certAtivo.nota}</span>
                  <span className="cartao-avaliacao-resultado__nota-max">/ {certAtivo.notaMaxima} — {certAtivo.porcentagem}% de aproveitamento</span>
                </div>
              ) : (
                <p className="passo-modulo__quiz" style={{ color: "var(--cor-texto-mudo)" }}>
                  {modulosConcluidos < modulosDoCurso.length
                    ? `Conclua os módulos para liberar — ${modulosConcluidos}/${modulosDoCurso.length} concluídos`
                    : "Módulos concluídos — faça a avaliação para obter o certificado"
                  }
                </p>
              )}
            </div>
          </li>
        </ol>
      </section>

      {/* ── Certificado ── */}
      {certificadoDesbloqueado ? (
        <div className="cartao-certificado-link cartao-certificado-link--desbloqueado" role="status" aria-label="Certificado disponível">
          <span className="cartao-certificado-link__trofeu" aria-hidden="true">
            <TbTrophy size={28} />
          </span>
          <div className="cartao-certificado-link__info">
            <strong>Parabéns! Certificado disponível</strong>
            <p>
              Nota{" "}
              <strong className="cartao-certificado-link__nota-valor">{certAtivo.nota}</strong>
              /{certAtivo.notaMaxima ?? 10} · {certAtivo.porcentagem}% de aproveitamento
            </p>
          </div>
          <Botao variante="primario" tamanho="pequeno" onClick={() => onMudarSecao?.("certificados")}>
            Ver meu certificado →
          </Botao>
        </div>
      ) : (
        <div className="cartao-certificado-link" role="status" aria-label="Certificado bloqueado">
          <span className="cartao-certificado-link__icone" aria-hidden="true">⊘</span>
          <div className="cartao-certificado-link__info">
            <strong>Certificado de Conclusão</strong>
            <p>{percentualGeral}% concluído — complete o curso e a avaliação</p>
          </div>
          <span className="cartao-certificado-link__cadeado" aria-label="Bloqueado">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Vista do Professor ──────────────────────────────────────── */

function VistaProfessor({ usuario }) {
  const minhasTurmas = turmas.filter((t) => t.professorId === usuario.id);

  const turmasComProgresso = minhasTurmas.map((turma) => {
    const alunosDaTurma = matriculas.filter(
      (m) => m.turmaId === turma.id && m.status === "Aprovada"
    );
    const total = alunosDaTurma.length;
    const media = total > 0
      ? Math.round(alunosDaTurma.reduce((acc, m) => acc + (PROGRESSO_MOCK[m.id] ?? 0), 0) / total)
      : 0;
    const mediaNota = NOTAS_MOCK[turma.id] ?? 0;
    return { turma, totalAlunos: total, media, mediaNota };
  });

  const totalAlunos = turmasComProgresso.reduce((acc, t) => acc + t.totalAlunos, 0);
  const mediaGeral  = totalAlunos > 0
    ? Math.round(
        turmasComProgresso.reduce((acc, t) => acc + t.media * t.totalAlunos, 0) / totalAlunos
      )
    : 0;

  return (
    <div className="tela-progresso">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Progresso dos Alunos</h2>
          <p className="cabecalho-pagina__subtitulo">
            {minhasTurmas.length} turma{minhasTurmas.length !== 1 ? "s" : ""} ·{" "}
            {totalAlunos} aluno{totalAlunos !== 1 ? "s" : ""} com matrícula ativa · média geral: {mediaGeral}%
          </p>
        </div>
      </header>

      {minhasTurmas.length === 0 ? (
        <p className="texto-vazio" role="status">Você não possui turmas atribuídas.</p>
      ) : (
        <section className="painel-secao" aria-labelledby="titulo-progresso-turmas">
          <header className="painel-secao__cabecalho">
            <h3 className="painel-secao__titulo" id="titulo-progresso-turmas">
              Progresso por Turma
            </h3>
          </header>
          <div className="painel-secao__conteudo">
            <ul className="lista-aproveitamento" role="list" aria-label="Progresso por turma">
              {turmasComProgresso.map(({ turma, totalAlunos: total, media, mediaNota }) => {
                const corPct  = media     >= 70 ? "var(--cor-sucesso)" : media     >= 40 ? "var(--cor-aviso)" : "var(--cor-erro)";
                const corNota = mediaNota >= 7  ? "var(--cor-sucesso)" : mediaNota >= 5  ? "var(--cor-aviso)" : "var(--cor-erro)";
                return (
                  <li key={turma.id} className="item-aproveitamento">
                    <div className="item-aproveitamento__info">
                      <span className="item-aproveitamento__titulo">
                        {turma.nomeTurma}
                        <span style={{ fontSize: "0.78rem", color: "var(--cor-texto-mudo)", marginLeft: "0.5rem" }}>
                          {turma.cursoTitulo}
                        </span>
                      </span>
                      <div className="item-aproveitamento__barra" aria-hidden="true">
                        <BarraProgresso percentual={media} mostrarTexto={false} />
                      </div>
                    </div>
                    <div className="item-aproveitamento__badges">
                      <span style={{ fontSize: "0.82rem", color: "var(--cor-texto-suave)", whiteSpace: "nowrap" }}>
                        {total} aluno{total !== 1 ? "s" : ""}
                      </span>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: corPct, whiteSpace: "nowrap" }}>
                        {media}%
                      </span>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: corNota, whiteSpace: "nowrap" }} title="Média de notas">
                        ★ {mediaNota.toFixed(1)}
                      </span>
                      <Insignia texto={turma.status} variante={turma.status === "Ativa" ? "sucesso" : "neutro"} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

/* ── Vista do Coordenador ────────────────────────────────────── */

function VistaCoordenador({ usuario }) {
  const meusCursos = cursos.filter((c) => c.coordenadorId === usuario.id);

  const cursosComProgresso = meusCursos.map((curso) => {
    const turmasDoCurso = turmas.filter((t) => t.cursoId === curso.id);
    const alunosDoCurso = matriculas.filter(
      (m) => turmasDoCurso.some((t) => t.id === m.turmaId) && m.status === "Aprovada"
    );
    const total = alunosDoCurso.length;
    const media = total > 0
      ? Math.round(alunosDoCurso.reduce((acc, m) => acc + (PROGRESSO_MOCK[m.id] ?? 0), 0) / total)
      : 0;
    const mediaNota = turmasDoCurso.length > 0
      ? Math.round(
          turmasDoCurso.reduce((acc, t) => acc + (NOTAS_MOCK[t.id] ?? 0), 0) /
          turmasDoCurso.length * 10
        ) / 10
      : 0;
    return { curso, totalTurmas: turmasDoCurso.length, totalAlunos: total, media, mediaNota };
  });

  const totalAlunos = cursosComProgresso.reduce((acc, c) => acc + c.totalAlunos, 0);
  const mediaGeral  = totalAlunos > 0
    ? Math.round(
        cursosComProgresso.reduce((acc, c) => acc + c.media * c.totalAlunos, 0) / totalAlunos
      )
    : 0;

  return (
    <div className="tela-progresso">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Progresso por Curso</h2>
          <p className="cabecalho-pagina__subtitulo">
            {meusCursos.length} curso{meusCursos.length !== 1 ? "s" : ""} ·{" "}
            {totalAlunos} aluno{totalAlunos !== 1 ? "s" : ""} com matrícula ativa · média geral: {mediaGeral}%
          </p>
        </div>
      </header>

      {meusCursos.length === 0 ? (
        <p className="texto-vazio" role="status">Nenhum curso sob sua coordenação.</p>
      ) : (
        <section className="painel-secao" aria-labelledby="titulo-progresso-cursos">
          <header className="painel-secao__cabecalho">
            <h3 className="painel-secao__titulo" id="titulo-progresso-cursos">
              Progresso por Curso
            </h3>
          </header>
          <div className="painel-secao__conteudo">
            <ul className="lista-aproveitamento" role="list" aria-label="Progresso por curso">
              {cursosComProgresso.map(({ curso, totalTurmas, totalAlunos: total, media, mediaNota }) => {
                const corPct  = media     >= 70 ? "var(--cor-sucesso)" : media     >= 40 ? "var(--cor-aviso)" : "var(--cor-erro)";
                const corNota = mediaNota >= 7  ? "var(--cor-sucesso)" : mediaNota >= 5  ? "var(--cor-aviso)" : "var(--cor-erro)";
                return (
                  <li key={curso.id} className="item-aproveitamento">
                    <div className="item-aproveitamento__info">
                      <span className="item-aproveitamento__titulo">
                        {curso.titulo}
                        <span style={{ fontSize: "0.78rem", color: "var(--cor-texto-mudo)", marginLeft: "0.5rem" }}>
                          {curso.codigoRegistro}
                        </span>
                      </span>
                      <div className="item-aproveitamento__barra" aria-hidden="true">
                        <BarraProgresso percentual={media} mostrarTexto={false} />
                      </div>
                    </div>
                    <div className="item-aproveitamento__badges">
                      <span style={{ fontSize: "0.82rem", color: "var(--cor-texto-suave)", whiteSpace: "nowrap" }}>
                        {totalTurmas} turma{totalTurmas !== 1 ? "s" : ""}
                      </span>
                      <span style={{ fontSize: "0.82rem", color: "var(--cor-texto-suave)", whiteSpace: "nowrap" }}>
                        {total} aluno{total !== 1 ? "s" : ""}
                      </span>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: corPct, whiteSpace: "nowrap" }}>
                        {media}%
                      </span>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: corNota, whiteSpace: "nowrap" }} title="Média de notas">
                        ★ {mediaNota.toFixed(1)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
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

export default function TelaProgresso({ usuario, avaliacaoAprovada, resultadosQuizzes, onMudarSecao, conteudosConcluidos }) {
  if (usuario?.tipo === "Aluno") {
    return (
      <VistaAluno
        usuario={usuario}
        avaliacaoAprovada={avaliacaoAprovada}
        resultadosQuizzes={resultadosQuizzes}
        onMudarSecao={onMudarSecao}
        conteudosConcluidos={conteudosConcluidos}
      />
    );
  }
  if (usuario?.tipo === "Professor")   return <VistaProfessor   usuario={usuario} />;
  if (usuario?.tipo === "Coordenador") return <VistaCoordenador usuario={usuario} />;
  return <VistaAdmin />;
}
