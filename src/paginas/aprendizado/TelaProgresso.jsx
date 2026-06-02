import { useState } from "react";
import { siglasCurso } from "@/utils/siglas.js";
import { TbTrophy, TbCertificate, TbDotsVertical, TbX, TbCheck, TbLayoutGrid, TbSettings, TbStar } from "react-icons/tb";
import { MdSchool, MdMenuBook, MdBarChart, MdGroups, MdDescription } from "react-icons/md";
import Modal from "@/componentes/Modal.jsx";
import BarraProgresso from "@/componentes/BarraProgresso.jsx";
import Insignia from "@/componentes/Insignia.jsx";
import Botao from "@/componentes/Botao.jsx";
import { conteudos, cursos, modulos, matriculas, turmas, certificadosDemo, PROGRESSO_MOCK, NOTAS_MOCK } from "@/dados/dadosMock.js";
import CartaoEstatistica from "@/componentes/CartaoEstatistica.jsx";

/* Retorna status e variante de badge a partir do progresso do módulo */
function resolverStatusModulo(concluidosModulo, totalItens) {
  if (totalItens === 0)                return { texto: "Vazio",        variante: "neutro"  };
  if (concluidosModulo === 0)          return { texto: "Não iniciado", variante: "neutro"  };
  if (concluidosModulo === totalItens) return { texto: "Concluído",    variante: "sucesso" };
  return                                      { texto: "Em andamento", variante: "info"    };
}

/* ── Vista do Aluno — slide de um curso ──────────────────────── */

function SlideProgressoCurso({ matricula, avaliacaoAprovada, resultadosQuizzes = {}, onMudarSecao, conteudosConcluidos }) {
  const curso = cursos.find((c) => c.id === matricula.cursoId);

  const modulosDoCurso = modulos
    .filter((m) => m.cursoId === matricula.cursoId)
    .sort((a, b) => a.ordem - b.ordem);

  const conteudosDoCurso = conteudos.filter((c) =>
    modulosDoCurso.some((m) => m.id === c.moduloId)
  );

  const concluidos = conteudosConcluidos ?? new Set(conteudosDoCurso.filter((c) => c.concluido).map((c) => c.id));

  const totalConteudos  = conteudosDoCurso.length;
  const totalConcluidos = conteudosDoCurso.filter((c) => concluidos.has(c.id)).length;

  const modulosComConteudo = modulosDoCurso.filter((m) => conteudosDoCurso.some((c) => c.moduloId === m.id));
  const quizzesFeitos = conteudosDoCurso.filter((c) => resultadosQuizzes[c.id] !== undefined).length;
  const totalPassos   = totalConteudos * 2;
  const passosFeitos  = totalConcluidos + quizzesFeitos;
  const percentualGeral = totalPassos > 0 ? Math.round((passosFeitos / totalPassos) * 100) : 0;

  const modulosConcluidos = modulosDoCurso.filter((modulo) => {
    const itens = conteudosDoCurso.filter((c) => c.moduloId === modulo.id);
    return itens.length > 0 &&
      itens.every((c) => concluidos.has(c.id)) &&
      itens.every((c) => resultadosQuizzes[c.id] !== undefined);
  }).length;

  const todosConcluidos   = modulosConcluidos === modulosComConteudo.length && modulosComConteudo.length > 0;
  const avaliacaoLiberada = todosConcluidos;

  const certAtivo = avaliacaoAprovada?.[matricula.cursoId]
    ? (certificadosDemo[matricula.cursoId] ?? { ...avaliacaoAprovada[matricula.cursoId], dataConclusao: new Date().toLocaleDateString("pt-BR") })
    : null;
  const certificadoDesbloqueado = Boolean(certAtivo);

  return (
    <>
      {/* ── Hero do curso ── */}
      <header className="conteudos-aluno__cabecalho" aria-label="Visão geral do curso">
        <div className="conteudos-aluno__curso-info">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--espaco-md)" }}>
            <div className="cartao-progresso-aluno__avatar conteudos-aluno__avatar-desktop" aria-hidden="true">
              <MdBarChart size={20} aria-hidden="true" />
            </div>
            <h2 className="conteudos-aluno__curso-titulo">{curso?.titulo}</h2>
          </div>
          <div className="conteudos-aluno__meta-chips">
            <span className="conteudos-aluno__meta-chip conteudos-aluno__meta-chip--progresso">
              <TbCheck size={12} aria-hidden="true" />
              {passosFeitos}/{totalPassos} passos
            </span>
            <span className="conteudos-aluno__meta-chip">
              <TbLayoutGrid size={12} aria-hidden="true" />
              {modulosConcluidos}/{modulosComConteudo.length} módulos
            </span>
          </div>
        </div>
        <div className="conteudos-aluno__progresso-geral">
          <p className="progresso-hero__legenda">{percentualGeral}%</p>
          <div className="anel-progresso" aria-label={`${percentualGeral} por cento concluído`}>
            <svg className="anel-progresso__svg" viewBox="0 0 120 120" aria-hidden="true">
              <defs>
                <linearGradient id={`anel-grad-${matricula.cursoId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#b992ff" />
                  <stop offset="100%" stopColor="#7b2ff7" />
                </linearGradient>
              </defs>
              <circle className="anel-progresso__trilha" cx="60" cy="60" r="50" />
              <circle
                className="anel-progresso__arco"
                cx="60" cy="60" r="50"
                stroke={`url(#anel-grad-${matricula.cursoId})`}
                style={{ strokeDasharray: "314.16", strokeDashoffset: 314.16 * (1 - percentualGeral / 100) }}
              />
            </svg>
            <span className="anel-progresso__texto" aria-hidden="true">{percentualGeral}%</span>
          </div>
        </div>
      </header>

      {/* ── Trilha de módulos ── */}
      <section aria-labelledby={`titulo-aproveitamento-${matricula.cursoId}`}>
        <h3 className="secao-progresso__titulo" id={`titulo-aproveitamento-${matricula.cursoId}`}>Aproveitamento</h3>
        <ol className="trilha-modulos" aria-label="Jornada por módulo">
          {modulosDoCurso.map((modulo) => {
            const itens = conteudosDoCurso.filter((c) => c.moduloId === modulo.id);
            const concluidosModulo = itens.filter((c) => concluidos.has(c.id)).length;
            const quizzesModulo = itens.filter((c) => resultadosQuizzes[c.id] !== undefined).length;
            const quizFeito = itens.length > 0 && quizzesModulo === itens.length;
            const quizPercentual = quizFeito
              ? Math.round(itens.reduce((acc, c) => acc + (resultadosQuizzes[c.id] ?? 0), 0) / itens.length)
              : undefined;
            const totalPassosModulo = itens.length * 2;
            const passosModulo = concluidosModulo + quizzesModulo;
            const percentualModulo = totalPassosModulo > 0 ? Math.round((passosModulo / totalPassosModulo) * 100) : 0;
            const concluido = totalPassosModulo > 0 && passosModulo === totalPassosModulo;
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
                    <Insignia
                      texto={concluido ? "Concluído" : emAndamento ? `${percentualModulo}%` : "Não iniciado"}
                      variante={concluido ? "sucesso" : emAndamento ? "info" : "neutro"}
                    />
                  </div>
                  {itens.length > 0 && (
                    <ul className="passo-modulo__itens" role="list">
                      {itens.map((c) => {
                        const feito = concluidos.has(c.id);
                        return (
                          <li key={c.id} className={`passo-modulo__item${feito ? " passo-modulo__item--feito" : ""}`}>
                            <span className="passo-modulo__item-icone" aria-hidden="true">{feito ? "✓" : "○"}</span>
                            <span className="passo-modulo__item-titulo">{c.titulo}</span>
                            <span className="passo-modulo__item-meta">{c.tipo} · {c.duracao}</span>
                          </li>
                        );
                      })}
                      <li className={`passo-modulo__item passo-modulo__item--quiz${quizFeito ? " passo-modulo__item--feito" : ""}`}>
                        <span className="passo-modulo__item-icone" aria-hidden="true">{quizFeito ? "✓" : "○"}</span>
                        <span className="passo-modulo__item-titulo">Quiz</span>
                        <span className="passo-modulo__item-meta">
                          {quizFeito ? `nota ${(quizPercentual / 10).toFixed(1)} · ${quizPercentual}%` : "Pendente"}
                        </span>
                      </li>
                    </ul>
                  )}
                </div>
              </li>
            );
          })}

          {/* Avaliação final */}
          <li className={`passo-modulo passo-modulo--avaliacao${certAtivo ? " passo-modulo--concluido" : avaliacaoLiberada ? " passo-modulo--andamento" : ""}`}>
            <div className="passo-modulo__esquerda">
              <div className="passo-modulo__indicador" aria-hidden="true">{certAtivo ? "✓" : "★"}</div>
            </div>
            <div className="passo-modulo__corpo">
              <div className="passo-modulo__cabecalho">
                <span className="passo-modulo__titulo">Avaliação Final</span>
                {certAtivo
                  ? <Insignia texto="Aprovado" variante="sucesso" />
                  : <Insignia texto="Pendente" variante="neutro" />}
              </div>
              {certAtivo ? (
                <div className="cartao-avaliacao-resultado__nota">
                  <span className="cartao-avaliacao-resultado__nota-valor">{certAtivo.nota}</span>
                  <span className="cartao-avaliacao-resultado__nota-max">/ {certAtivo.notaMaxima} — {certAtivo.porcentagem}% de aproveitamento</span>
                </div>
              ) : (
                <p className="passo-modulo__quiz" style={{ color: "var(--cor-texto-mudo)" }}>
                  {!todosConcluidos
                    ? `Conclua os módulos — ${modulosConcluidos}/${modulosComConteudo.length} concluídos`
                    : "Módulos concluídos — faça a avaliação para obter o certificado"}
                </p>
              )}
            </div>
          </li>
        </ol>
      </section>

      {/* ── Certificado ── */}
      {certificadoDesbloqueado ? (
        <div className="cartao-certificado-link cartao-certificado-link--desbloqueado" role="status" aria-label="Certificado disponível">
          <span className="cartao-certificado-link__trofeu" aria-hidden="true"><TbTrophy size={28} /></span>
          <div className="cartao-certificado-link__info">
            <strong>Parabéns! Certificado disponível</strong>
            <p>Nota <strong className="cartao-certificado-link__nota-valor">{certAtivo.nota}</strong>/{certAtivo.notaMaxima ?? 10} · {certAtivo.porcentagem}% de aproveitamento</p>
          </div>
          <Botao variante="primario" tamanho="pequeno" onClick={() => onMudarSecao?.("certificados")} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <TbCertificate size={15} aria-hidden="true" /> Ver meu certificado
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
    </>
  );
}

/* ── Vista do Aluno — carrossel de cursos ────────────────────── */

function VistaAluno({ usuario, avaliacaoAprovada, resultadosQuizzes, onMudarSecao, conteudosConcluidos }) {
  const matriculasAprovadas = matriculas.filter(
    (m) => m.alunoId === usuario?.id && m.status === "Aprovada"
  );
  const [slideAtual, setSlideAtual] = useState(0);
  const [touchInicioX, setTouchInicioX] = useState(null);

  if (matriculasAprovadas.length === 0) {
    return (
      <div className="tela-progresso">
        <p className="texto-vazio texto-vazio--central" role="status">
          Você não possui matrícula aprovada. Solicite sua matrícula para acompanhar o progresso.
        </p>
      </div>
    );
  }

  const total      = matriculasAprovadas.length;
  const temAnterior = slideAtual > 0;
  const temProximo  = slideAtual < total - 1;

  return (
    <div className="tela-progresso">
      <div className="carrossel-cursos">
        {total > 1 && (
          <nav className="carrossel-cursos__nav" aria-label="Navegação entre cursos">
            <button
              className="carrossel-cursos__seta"
              onClick={() => setSlideAtual((i) => i - 1)}
              disabled={!temAnterior}
              aria-label="Curso anterior"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className="carrossel-cursos__indicadores" role="tablist" aria-label="Cursos matriculados">
              {matriculasAprovadas.map((mat, idx) => (
                <button
                  key={mat.id}
                  className={`carrossel-cursos__bolinha ${idx === slideAtual ? "carrossel-cursos__bolinha--ativa" : ""}`}
                  onClick={() => setSlideAtual(idx)}
                  role="tab"
                  aria-selected={idx === slideAtual}
                  aria-label={`Curso ${idx + 1}: ${mat.cursoTitulo}`}
                  type="button"
                />
              ))}
            </div>
            <button
              className="carrossel-cursos__seta"
              onClick={() => setSlideAtual((i) => i + 1)}
              disabled={!temProximo}
              aria-label="Próximo curso"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </nav>
        )}

        <div
          className="carrossel-cursos__janela"
          onTouchStart={(e) => setTouchInicioX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchInicioX === null) return;
            const dx = e.changedTouches[0].clientX - touchInicioX;
            if (dx > 50 && slideAtual > 0) setSlideAtual((i) => i - 1);
            if (dx < -50 && slideAtual < matriculasAprovadas.length - 1) setSlideAtual((i) => i + 1);
            setTouchInicioX(null);
          }}
        >
          <SlideProgressoCurso
            matricula={matriculasAprovadas[slideAtual]}
            avaliacaoAprovada={avaliacaoAprovada}
            resultadosQuizzes={resultadosQuizzes}
            onMudarSecao={onMudarSecao}
            conteudosConcluidos={conteudosConcluidos}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Vista do Professor ──────────────────────────────────────── */

function VistaProfessor({ usuario }) {
  const [turmaDetalhe, setTurmaDetalhe] = useState(null);
  const [menuAberto, setMenuAberto] = useState(null);

  const minhasTurmas = turmas.filter((t) => t.professorId === usuario.id);

  const turmasComProgresso = minhasTurmas.map((turma) => {
    const alunosDaTurma  = matriculas.filter((m) => m.turmaId === turma.id && m.status === "Aprovada");
    const modulosDoCurso = modulos.filter((m) => m.cursoId === turma.cursoId).sort((a, b) => a.ordem - b.ordem);
    const total      = alunosDaTurma.length;
    const media      = total > 0
      ? Math.round(alunosDaTurma.reduce((acc, m) => acc + (PROGRESSO_MOCK[m.id] ?? 0), 0) / total)
      : 0;
    const concluidos  = alunosDaTurma.filter((m) => (PROGRESSO_MOCK[m.id] ?? 0) >= 100).length;
    const txConclusao = total > 0 ? Math.round((concluidos / total) * 100) : 0;
    const mediaNota   = NOTAS_MOCK[turma.id] ?? 0;
    return { turma, alunosDaTurma, modulosDoCurso, totalAlunos: total, totalModulos: modulosDoCurso.length, media, mediaNota, concluidos, txConclusao };
  });

  const totalAlunos  = turmasComProgresso.reduce((acc, t) => acc + t.totalAlunos, 0);
  const turmasAtivas = minhasTurmas.filter((t) => t.status === "Ativa").length;
  const cursoIdsDoProfessor = [...new Set(minhasTurmas.map((t) => t.cursoId))];
  const modulosDoProfessor  = modulos.filter((m) => cursoIdsDoProfessor.includes(m.cursoId));
  const totalConteudos      = conteudos.filter((c) => modulosDoProfessor.some((m) => m.id === c.moduloId)).length;
  const mediaGeral   = totalAlunos > 0
    ? Math.round(turmasComProgresso.reduce((acc, t) => acc + t.media * t.totalAlunos, 0) / totalAlunos)
    : 0;
  const mediaNotas = turmasComProgresso.length > 0
    ? (turmasComProgresso.reduce((acc, t) => acc + t.mediaNota, 0) / turmasComProgresso.length).toFixed(1)
    : "—";

  return (
    <div className="tela-progresso">
      <header className="cabecalho-pagina">
        <div>
          <h1 className="cabecalho-pagina__titulo">Progresso dos Alunos</h1>
          <p className="cabecalho-pagina__subtitulo">
            Acompanhe o desempenho das suas turmas e o progresso por módulo.
          </p>
        </div>
      </header>

      {/* KPIs */}
      <div className="grade-estatisticas" style={{ marginBottom: "var(--espaco-xl)" }}>
        <CartaoEstatistica icone={<MdDescription size={22} />} valor={totalConteudos}      rotulo="Conteúdos publicados" />
        <CartaoEstatistica icone={<MdGroups size={22} />}    valor={turmasAtivas}        rotulo="Turmas ativas"        corBorda="var(--cor-sucesso)" />
        <CartaoEstatistica icone={<MdSchool size={22} />}   valor={totalAlunos}         rotulo="Total de alunos" corBorda="var(--cor-info)" />
        <CartaoEstatistica icone={<TbStar size={22} />}     valor={mediaNotas}          rotulo="Média de notas"  corBorda="var(--cor-aviso)" />
      </div>

      {/* Lista de turmas */}
      {minhasTurmas.length === 0 ? (
        <p className="texto-vazio" role="status">Você não possui turmas atribuídas.</p>
      ) : (
        <ul className="lista-progresso-alunos" role="list" aria-label="Progresso por turma">
          {turmasComProgresso.map(({ turma, totalAlunos: total, media, mediaNota, concluidos }) => {
            const { texto: statusTexto, variante: statusVariante } = resolverStatusModulo(media, 100);
            return (
              <li key={turma.id} className="cartao-progresso-aluno">
                <div className="cartao-progresso-aluno__avatar" aria-hidden="true">
                  {siglasCurso(turma.cursoTitulo)}
                </div>
                <div className="cartao-progresso-aluno__info">
                  <strong className="cartao-progresso-aluno__nome">{turma.nomeTurma}</strong>
                  <p className="cartao-progresso-aluno__meta">
                    {turma.cursoTitulo} · {total} aluno{total !== 1 ? "s" : ""} · {concluidos} concluído{concluidos !== 1 ? "s" : ""} · ★ {mediaNota.toFixed(1)}
                  </p>
                  <div className="cartao-progresso-aluno__barra">
                    <BarraProgresso percentual={media} mostrarTexto={false} />
                  </div>
                </div>
                <div className="cartao-progresso-aluno__badges">
                  <span className="dado-rotulo" aria-hidden="true">Média</span>
                  <Insignia texto={`${media}%`} variante="neutro" />
                  <Insignia texto={statusTexto} variante={statusVariante} />
                </div>
                <div className="menu-contexto">
                  <button
                    type="button"
                    className="menu-contexto__botao"
                    onClick={(e) => { e.stopPropagation(); setMenuAberto((v) => v === turma.id ? null : turma.id); }}
                    aria-label={`Opções de ${turma.nomeTurma}`}
                  >
                    <TbDotsVertical size={16} aria-hidden="true" />
                  </button>
                  {menuAberto === turma.id && (
                    <ul className="menu-contexto__lista" role="menu">
                      <li>
                        <button type="button" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={() => { setMenuAberto(null); setTurmaDetalhe(turmasComProgresso.find((t) => t.turma.id === turma.id)); }}>
                          <TbSettings size={16} aria-hidden="true" /> Opções
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Modal detalhes da turma */}
      {turmaDetalhe && (() => {
        const { turma, modulosDoCurso, totalAlunos: total, totalModulos, media, mediaNota, concluidos, txConclusao } = turmaDetalhe;
        const corPct  = media      >= 70 ? "var(--cor-sucesso)" : media      >= 40 ? "var(--cor-aviso)" : "var(--cor-erro)";
        const corConc = txConclusao >= 70 ? "var(--cor-sucesso)" : txConclusao >= 40 ? "var(--cor-aviso)" : "var(--cor-erro)";
        const corNota = mediaNota  >= 7  ? "var(--cor-sucesso)" : mediaNota  >= 5  ? "var(--cor-aviso)" : "var(--cor-erro)";
        return (
          <Modal titulo="Detalhes da Turma" onFechar={() => setTurmaDetalhe(null)}>
            {/* Cabeçalho */}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--espaco-sm)", marginBottom: "var(--espaco-lg)", flexWrap: "wrap" }}>
              <strong style={{ fontSize: "1rem", color: "var(--cor-texto-forte)", flex: 1 }}>{turma.nomeTurma}</strong>
              <Insignia texto={turma.status} variante={turma.status === "Ativa" ? "sucesso" : "neutro"} />
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--cor-texto-mudo)", marginBottom: "var(--espaco-lg)" }}>
              {turma.cursoTitulo}
            </p>

            {/* KPIs */}
            <div className="grade-kpi-modal-curso">
              <div className="kpi-modal-curso">
                <span className="kpi-modal-curso__valor">{total}</span>
                <span className="kpi-modal-curso__rotulo">Alunos</span>
              </div>
              <div className="kpi-modal-curso">
                <span className="kpi-modal-curso__valor">{totalModulos}</span>
                <span className="kpi-modal-curso__rotulo">Módulos</span>
              </div>
              <div className="kpi-modal-curso">
                <span className="kpi-modal-curso__valor" style={{ color: corPct }}>{media}%</span>
                <span className="kpi-modal-curso__rotulo">Média</span>
              </div>
              <div className="kpi-modal-curso">
                <span className="kpi-modal-curso__valor" style={{ color: corConc }}>{txConclusao}%</span>
                <span className="kpi-modal-curso__rotulo">Conclusão</span>
              </div>
              <div className="kpi-modal-curso">
                <span className="kpi-modal-curso__valor">{concluidos}</span>
                <span className="kpi-modal-curso__rotulo">Concluídos</span>
              </div>
              <div className="kpi-modal-curso">
                <span className="kpi-modal-curso__valor" style={{ color: corNota }}>★ {mediaNota.toFixed(1)}</span>
                <span className="kpi-modal-curso__rotulo">Nota média</span>
              </div>
            </div>

            {/* Módulos */}
            <section style={{ marginTop: "var(--espaco-lg)" }}>
              <h4 style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--cor-texto-mudo)", fontWeight: 600, marginBottom: "var(--espaco-sm)" }}>
                Módulos do curso
              </h4>
              {modulosDoCurso.length === 0 ? (
                <p className="texto-vazio">Nenhum módulo cadastrado.</p>
              ) : (
                <ul className="lista-turmas-modal-coord" role="list">
                  {modulosDoCurso.map((mod) => (
                    <li key={mod.id} className="item-turma-modal-coord">
                      <div className="item-turma-modal-coord__info">
                        <span className="item-turma-modal-coord__nome">{mod.titulo}</span>
                      </div>
                      <Insignia texto={`Módulo ${mod.ordem}`} variante="neutro" />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <footer className="modal-rodape">
              <Botao variante="perigo" onClick={() => setTurmaDetalhe(null)} style={{ display: "flex", alignItems: "center", gap: "6px", marginRight: "auto" }}>
                <TbX size={15} aria-hidden="true" /> Fechar
              </Botao>
            </footer>
          </Modal>
        );
      })()}
    </div>
  );
}

/* ── Vista do Coordenador ────────────────────────────────────── */

function VistaCoordenador({ usuario }) {
  const [cursoDetalhe, setCursoDetalhe] = useState(null);
  const [menuAberto, setMenuAberto] = useState(null);

  const meusCursos = cursos.filter((c) => c.coordenadorId === usuario.id);

  const cursosComProgresso = meusCursos.map((curso) => {
    const turmasDoCurso  = turmas.filter((t) => t.cursoId === curso.id);
    const modulosDoCurso = modulos.filter((m) => m.cursoId === curso.id);
    const alunosDoCurso  = matriculas.filter(
      (m) => turmasDoCurso.some((t) => t.id === m.turmaId) && m.status === "Aprovada"
    );
    const total      = alunosDoCurso.length;
    const media      = total > 0
      ? Math.round(alunosDoCurso.reduce((acc, m) => acc + (PROGRESSO_MOCK[m.id] ?? 0), 0) / total)
      : 0;
    const concluidos = alunosDoCurso.filter((m) => (PROGRESSO_MOCK[m.id] ?? 0) >= 100).length;
    const txConclusao = total > 0 ? Math.round((concluidos / total) * 100) : 0;
    const mediaNota  = turmasDoCurso.length > 0
      ? Math.round(turmasDoCurso.reduce((acc, t) => acc + (NOTAS_MOCK[t.id] ?? 0), 0) / turmasDoCurso.length * 10) / 10
      : 0;
    return { curso, turmasDoCurso, modulosDoCurso, alunosDoCurso, totalTurmas: turmasDoCurso.length, totalModulos: modulosDoCurso.length, totalAlunos: total, media, mediaNota, concluidos, txConclusao };
  });

  const totalAlunos  = cursosComProgresso.reduce((acc, c) => acc + c.totalAlunos, 0);
  const cursosAtivos = meusCursos.filter((c) => c.ativo).length;
  const mediaGeral   = totalAlunos > 0
    ? Math.round(cursosComProgresso.reduce((acc, c) => acc + c.media * c.totalAlunos, 0) / totalAlunos)
    : 0;

  return (
    <div className="tela-progresso">
      <header className="cabecalho-pagina">
        <div>
          <h1 className="cabecalho-pagina__titulo">Progresso por Curso</h1>
          <p className="cabecalho-pagina__subtitulo">
            Acompanhe o desempenho dos alunos em cada curso sob sua coordenação.
          </p>
        </div>
      </header>

      {/* KPIs */}
      <div className="grade-estatisticas" style={{ marginBottom: "var(--espaco-xl)" }}>
        <CartaoEstatistica icone={<MdMenuBook size={22} />} valor={meusCursos.length} rotulo="Cursos" />
        <CartaoEstatistica icone={<MdMenuBook size={22} />} valor={cursosAtivos}      rotulo="Cursos ativos"   corBorda="var(--cor-sucesso)" />
        <CartaoEstatistica icone={<MdSchool size={22} />}   valor={totalAlunos}       rotulo="Total de alunos" corBorda="var(--cor-info)" />
        <CartaoEstatistica icone={<MdBarChart size={22} />} valor={`${mediaGeral}%`}  rotulo="Média geral"     corBorda="var(--cor-aviso)" />
      </div>

      {/* Lista de cursos */}
      {meusCursos.length === 0 ? (
        <p className="texto-vazio" role="status">Nenhum curso sob sua coordenação.</p>
      ) : (
        <ul className="lista-progresso-alunos" role="list" aria-label="Progresso por curso">
          {cursosComProgresso.map(({ curso, totalTurmas, totalAlunos: total, media, mediaNota }) => {
            const { texto: statusTexto, variante: statusVariante } = resolverStatusModulo(media, 100);
            return (
              <li key={curso.id} className="cartao-progresso-aluno">
                <div className="cartao-progresso-aluno__avatar" aria-hidden="true">
                  {siglasCurso(curso.titulo)}
                </div>
                <div className="cartao-progresso-aluno__info">
                  <strong className="cartao-progresso-aluno__nome">{curso.titulo}</strong>
                  <p className="cartao-progresso-aluno__meta">
                    {total} aluno{total !== 1 ? "s" : ""} · {totalTurmas} turma{totalTurmas !== 1 ? "s" : ""} · ★ {mediaNota.toFixed(1)}
                  </p>
                  <div className="cartao-progresso-aluno__barra">
                    <BarraProgresso percentual={media} mostrarTexto={false} />
                  </div>
                </div>
                <div className="cartao-progresso-aluno__badges">
                  <span className="dado-rotulo" aria-hidden="true">Média</span>
                  <Insignia texto={`${media}%`} variante="neutro" />
                  <Insignia texto={statusTexto} variante={statusVariante} />
                </div>
                <div className="menu-contexto">
                  <button
                    type="button"
                    className="menu-contexto__botao"
                    onClick={(e) => { e.stopPropagation(); setMenuAberto((v) => v === curso.id ? null : curso.id); }}
                    aria-label={`Opções de ${curso.titulo}`}
                  >
                    <TbDotsVertical size={16} aria-hidden="true" />
                  </button>
                  {menuAberto === curso.id && (
                    <ul className="menu-contexto__lista" role="menu">
                      <li>
                        <button type="button" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={() => { setMenuAberto(null); setCursoDetalhe(cursosComProgresso.find((c) => c.curso.id === curso.id)); }}>
                          <TbSettings size={16} aria-hidden="true" /> Opções
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Modal detalhes do curso */}
      {cursoDetalhe && (() => {
        const { curso, turmasDoCurso, modulosDoCurso, alunosDoCurso, totalTurmas, totalModulos, totalAlunos: total, media, mediaNota, concluidos, txConclusao } = cursoDetalhe;
        const corPct  = media      >= 70 ? "var(--cor-sucesso)" : media      >= 40 ? "var(--cor-aviso)" : "var(--cor-erro)";
        const corConc = txConclusao >= 70 ? "var(--cor-sucesso)" : txConclusao >= 40 ? "var(--cor-aviso)" : "var(--cor-erro)";
        const corNota = mediaNota  >= 7  ? "var(--cor-sucesso)" : mediaNota  >= 5  ? "var(--cor-aviso)" : "var(--cor-erro)";
        return (
          <Modal titulo="Detalhes do Curso" onFechar={() => setCursoDetalhe(null)}>
            {/* Cabeçalho do curso */}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--espaco-sm)", marginBottom: "var(--espaco-lg)", flexWrap: "wrap" }}>
              <strong style={{ fontSize: "1rem", color: "var(--cor-texto-forte)", flex: 1 }}>{curso.titulo}</strong>
              <Insignia texto={curso.nivel ?? "—"} variante="info" />
              <Insignia texto={curso.ativo ? "Ativo" : "Inativo"} variante={curso.ativo ? "sucesso" : "neutro"} />
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--cor-texto-mudo)", marginTop: "-var(--espaco-md)", marginBottom: "var(--espaco-lg)" }}>
              {curso.codigoRegistro}
            </p>

            {/* KPIs do modal */}
            <div className="grade-kpi-modal-curso">
              <div className="kpi-modal-curso">
                <span className="kpi-modal-curso__valor">{totalTurmas}</span>
                <span className="kpi-modal-curso__rotulo">Turmas</span>
              </div>
              <div className="kpi-modal-curso">
                <span className="kpi-modal-curso__valor">{total}</span>
                <span className="kpi-modal-curso__rotulo">Alunos</span>
              </div>
              <div className="kpi-modal-curso">
                <span className="kpi-modal-curso__valor">{totalModulos}</span>
                <span className="kpi-modal-curso__rotulo">Módulos</span>
              </div>
              <div className="kpi-modal-curso">
                <span className="kpi-modal-curso__valor" style={{ color: corPct }}>{media}%</span>
                <span className="kpi-modal-curso__rotulo">Média</span>
              </div>
              <div className="kpi-modal-curso">
                <span className="kpi-modal-curso__valor" style={{ color: corConc }}>{txConclusao}%</span>
                <span className="kpi-modal-curso__rotulo">Conclusão</span>
              </div>
              <div className="kpi-modal-curso">
                <span className="kpi-modal-curso__valor" style={{ color: corNota }}>★ {mediaNota.toFixed(1)}</span>
                <span className="kpi-modal-curso__rotulo">Nota média</span>
              </div>
            </div>

            {/* Turmas */}
            <section style={{ marginTop: "var(--espaco-lg)" }}>
              <h4 style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--cor-texto-mudo)", fontWeight: 600, marginBottom: "var(--espaco-sm)" }}>
                Turmas
              </h4>
              {turmasDoCurso.length === 0 ? (
                <p className="texto-vazio">Nenhuma turma vinculada.</p>
              ) : (
                <ul className="lista-turmas-modal-coord" role="list">
                  {turmasDoCurso.map((t) => {
                    const alunosTurma  = alunosDoCurso.filter((m) => m.turmaId === t.id);
                    const mediaTurma   = alunosTurma.length > 0
                      ? Math.round(alunosTurma.reduce((acc, m) => acc + (PROGRESSO_MOCK[m.id] ?? 0), 0) / alunosTurma.length)
                      : 0;
                    const corT = mediaTurma >= 70 ? "var(--cor-sucesso)" : mediaTurma >= 40 ? "var(--cor-aviso)" : "var(--cor-erro)";
                    return (
                      <li key={t.id} className="item-turma-modal-coord">
                        <div className="item-turma-modal-coord__info">
                          <span className="item-turma-modal-coord__nome">{t.nomeTurma}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "var(--espaco-sm)" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--cor-texto-mudo)" }}>{alunosTurma.length} aluno{alunosTurma.length !== 1 ? "s" : ""}</span>
                            <Insignia texto={t.status} variante={t.status === "Ativa" ? "sucesso" : "neutro"} />
                          </div>
                          <div aria-hidden="true" style={{ marginTop: "4px" }}>
                            <BarraProgresso percentual={mediaTurma} mostrarTexto={false} />
                          </div>
                        </div>
                        <span style={{ fontSize: "0.9rem", fontWeight: 700, color: corT, whiteSpace: "nowrap" }}>{mediaTurma}%</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <footer className="modal-rodape">
              <Botao variante="perigo" onClick={() => setCursoDetalhe(null)} style={{ display: "flex", alignItems: "center", gap: "6px", marginRight: "auto" }}>
                <TbX size={15} aria-hidden="true" /> Fechar
              </Botao>
            </footer>
          </Modal>
        );
      })()}
    </div>
  );
}

/* ── Vista administrativa ────────────────────────────────────── */

function VistaAdmin() {
  const matriculasAprovadas = matriculas.filter((m) => m.status === "Aprovada");

  const progressoPorCurso = cursos.map((curso) => {
    const mats = matriculasAprovadas.filter((m) => m.cursoId === curso.id);
    const media = mats.length > 0
      ? Math.round(mats.reduce((acc, m) => acc + (PROGRESSO_MOCK[m.id] ?? 0), 0) / mats.length)
      : 0;
    const concluidos = mats.filter((m) => (PROGRESSO_MOCK[m.id] ?? 0) === 100).length;
    return { curso, totalAlunos: mats.length, media, concluidos };
  });

  const cursosComAlunos = progressoPorCurso.filter((c) => c.totalAlunos > 0).length;
  const mediaGeral = cursosComAlunos > 0
    ? Math.round(progressoPorCurso.filter((c) => c.totalAlunos > 0).reduce((acc, c) => acc + c.media, 0) / cursosComAlunos)
    : 0;

  const totalCertificados = matriculasAprovadas.filter((m) => (PROGRESSO_MOCK[m.id] ?? 0) === 100).length;
  const totalAlunos = matriculasAprovadas.length;

  return (
    <div className="tela-progresso">
      <header className="cabecalho-pagina">
        <div>
          <h1 className="cabecalho-pagina__titulo">Progresso por Curso</h1>
          <p className="cabecalho-pagina__subtitulo">
            {progressoPorCurso.length} {progressoPorCurso.length === 1 ? "curso cadastrado" : "cursos cadastrados"} · média geral: {mediaGeral}%
          </p>
        </div>
      </header>

      <div className="grade-estatisticas" style={{ marginBottom: "var(--espaco-xl)" }}>
        <CartaoEstatistica icone={<MdSchool size={22} />}   valor={totalAlunos}             rotulo="Alunos matriculados" />
        <CartaoEstatistica icone={<MdMenuBook size={22} />} valor={progressoPorCurso.length} rotulo="Cursos cadastrados"   corBorda="var(--cor-info)" />
        <CartaoEstatistica icone={<MdBarChart size={22} />} valor={`${mediaGeral}%`}         rotulo="Média geral"          corBorda="var(--cor-aviso)" />
        <CartaoEstatistica icone={<TbTrophy size={22} />}   valor={totalCertificados}        rotulo="Certificados liberados" corBorda="var(--cor-sucesso)" />
      </div>

      <ul className="lista-progresso-alunos" role="list" aria-label="Progresso por curso">
        {progressoPorCurso.map(({ curso, totalAlunos, media, concluidos }) => {
          const { texto: statusTexto, variante: statusVariante } = resolverStatusModulo(media, 100);
          return (
            <li key={curso.id} className="cartao-progresso-aluno">
              <div className="cartao-progresso-aluno__avatar" aria-hidden="true">
                {siglasCurso(curso.titulo)}
              </div>
              <div className="cartao-progresso-aluno__info">
                <strong className="cartao-progresso-aluno__nome">{curso.titulo}</strong>
                <p className="cartao-progresso-aluno__meta">
                  {totalAlunos} aluno{totalAlunos !== 1 ? "s" : ""} matriculado{totalAlunos !== 1 ? "s" : ""} · {concluidos} concluído{concluidos !== 1 ? "s" : ""}
                </p>
                <div className="cartao-progresso-aluno__barra">
                  <BarraProgresso percentual={media} mostrarTexto={false} />
                </div>
              </div>
              <div className="cartao-progresso-aluno__badges">
                <span className="dado-rotulo" aria-hidden="true">Média</span>
                <Insignia texto={`${media}%`} variante="neutro" />
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
