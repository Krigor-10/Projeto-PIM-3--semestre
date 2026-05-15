import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import BarraProgresso from "@/componentes/BarraProgresso.jsx";
import Insignia from "@/componentes/Insignia.jsx";
import Modal from "@/componentes/Modal.jsx";
import Botao from "@/componentes/Botao.jsx";
import { conteudos, cursos, modulos, matriculas, turmas } from "@/dados/dadosMock.js";
import { questoesQuiz } from "@/dados/questoesQuiz.js";
import { podeCriar, podeEditar } from "@/dados/permissoes.js";

/* Ícones e rótulos semânticos por tipo de conteúdo */
const TIPO_CONFIG = {
  Video:     { icone: "▶", rotulo: "Vídeo"     },
  Texto:     { icone: "✦", rotulo: "Texto"      },
  Documento: { icone: "⬡", rotulo: "Documento"  },
};

const QUESTOES_POR_MODULO = 3;

/* Geometria do círculo SVG (viewBox 48×48, centro 24,24) */
const RAIO_SVG = 20;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO_SVG;

/* ── Botão circular de quiz ──────────────────────────────────── */

function BotaoQuizModulo({ percentual, aprovado = false, onClick }) {
  const liberado = percentual === 100;
  /* Quanto da circunferência fica "escondido" — vai de total (0%) até 0 (100%) */
  const offset = CIRCUNFERENCIA * (1 - percentual / 100);

  return (
    <button
      className={`botao-quiz-modulo ${liberado ? "botao-quiz-modulo--liberado" : ""} ${aprovado ? "botao-quiz-modulo--aprovado" : ""}`}
      onClick={onClick}
      disabled={!liberado}
      type="button"
      aria-label={
        aprovado
          ? "Quiz aprovado — clique para refazer"
          : liberado
          ? "Iniciar quiz rápido do módulo"
          : `Quiz bloqueado — conclua ${100 - percentual}% restantes do módulo`
      }
    >
      {/* Anel de progresso SVG */}
      <span className="botao-quiz-modulo__anel" aria-hidden="true">
        <svg className="botao-quiz-modulo__svg" viewBox="0 0 48 48">
          <circle className="botao-quiz-modulo__trilha" cx="24" cy="24" r={RAIO_SVG} />
          <circle
            className="botao-quiz-modulo__arco"
            cx="24" cy="24" r={RAIO_SVG}
            strokeDasharray={CIRCUNFERENCIA}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="botao-quiz-modulo__icone">
          {aprovado ? "✓" : liberado ? "▶" : `${percentual}%`}
        </span>
      </span>

      {/* Texto identificador */}
      <span className="botao-quiz-modulo__texto">
        {aprovado ? "Quiz concluído" : liberado ? "Quiz rápido" : "Quiz bloqueado"}
      </span>
    </button>
  );
}

/* ── Modal de quiz rápido ────────────────────────────────────── */

function QuizRapidoModal({ modulo, questoes, onFechar, onAprovado }) {
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [concluido, setConcluido] = useState(false);

  const questao = questoes[indice];
  const totalQuestoes = questoes.length;
  const respostaSelecionada = respostas[questao?.id];
  const ehUltima = indice === totalQuestoes - 1;

  function selecionar(letra) {
    setRespostas((prev) => ({ ...prev, [questao.id]: letra }));
  }

  function avancar() {
    if (!respostaSelecionada) return;
    if (ehUltima) {
      /* Notifica o pai com o percentual de acerto para exibir no progresso */
      if (aprovado) onAprovado?.(percentualAcerto);
      setConcluido(true);
    } else {
      setIndice((i) => i + 1);
    }
  }

  /* Conta quantas respostas batem com o gabarito */
  const acertos = questoes.filter((q) => respostas[q.id] === q.gabarito).length;
  /* Percentual de acerto = acertos / total × 100, arredondado para inteiro */
  const percentualAcerto = Math.round((acertos / totalQuestoes) * 100);
  /* Aprovado quando ≥ 70% das questões estão corretas */
  const aprovado = percentualAcerto >= 70;

  /* ── Tela de resultado ── */
  if (concluido) {
    return (
      <Modal titulo={`Quiz — ${modulo.titulo}`} onFechar={onFechar} className="modal-caixa--quiz">
        <div className={`quiz-rapido__resultado ${aprovado ? "quiz-resultado--aprovado" : "quiz-resultado--reprovado"}`}>
          <div className="quiz-resultado__icone">
            {aprovado ? "✓" : "✗"}
          </div>
          <h3 className="quiz-resultado__titulo">
            {aprovado ? "Bom trabalho!" : "Continue estudando!"}
          </h3>
          <p className="quiz-resultado__placar">
            {acertos} de {totalQuestoes} questões corretas
          </p>
          <div className="quiz-rapido__barra-wrap">
            <div
              className="quiz-rapido__barra-fill"
              style={{ width: `${Math.round((acertos / totalQuestoes) * 100)}%` }}
            />
          </div>

          <ul className="quiz-rapido__lista" role="list">
            {questoes.map((q, i) => {
              const correto = respostas[q.id] === q.gabarito;
              return (
                <li
                  key={q.id}
                  className={`quiz-rapido__item ${correto ? "quiz-rapido__item--certo" : "quiz-rapido__item--errado"}`}
                >
                  <span className="quiz-rapido__item-num">Q{i + 1}</span>
                  <span className="quiz-rapido__item-tema">{q.tema}</span>
                  <span className="quiz-rapido__item-resp">
                    Sua resposta: <strong>{respostas[q.id] ?? "—"}</strong>
                    {!correto && <> · Correta: <strong>{q.gabarito}</strong></>}
                  </span>
                  <span className="quiz-rapido__item-status" aria-hidden="true">
                    {correto ? "✓" : "✗"}
                  </span>
                </li>
              );
            })}
          </ul>

          <footer className="modal-rodape">
            <Botao variante="primario" onClick={onFechar}>
              Fechar
            </Botao>
          </footer>
        </div>
      </Modal>
    );
  }

  /* ── Tela de questão ── */
  return (
    <Modal titulo={`Quiz — ${modulo.titulo}`} onFechar={onFechar} className="modal-caixa--quiz">
      <div className="quiz-rapido">
        {/* Barra de progresso do quiz */}
        <div
          className="quiz-rapido__progresso"
          role="progressbar"
          aria-valuenow={indice + 1}
          aria-valuemin={1}
          aria-valuemax={totalQuestoes}
          aria-label={`Questão ${indice + 1} de ${totalQuestoes}`}
        >
          <span className="quiz-rapido__progresso-texto">
            Questão {indice + 1} / {totalQuestoes}
          </span>
          <div className="quiz-rapido__progresso-trilha">
            <div
              className="quiz-rapido__progresso-fill"
              style={{ width: `${((indice + 1) / totalQuestoes) * 100}%` }}
            />
          </div>
        </div>

        {/* Tema da questão */}
        <p className="quiz-rapido__tema">{questao.tema}</p>

        {/* Enunciado — scroll interno para textos longos */}
        <div className="quiz-rapido__enunciado">
          <p>{questao.enunciado}</p>
        </div>

        {/* Alternativas */}
        <fieldset className="quiz-alternativas">
          <legend className="visualmente-oculto">Selecione uma alternativa</legend>
          {questao.alternativas.map((alt) => {
            const selecionada = respostaSelecionada === alt.letra;
            return (
              <button
                key={alt.letra}
                type="button"
                className={`quiz-alternativa ${selecionada ? "quiz-alternativa--selecionada" : ""}`}
                onClick={() => selecionar(alt.letra)}
                aria-pressed={selecionada}
              >
                <span className="quiz-alternativa__letra">{alt.letra}</span>
                <span className="quiz-alternativa__texto">{alt.texto}</span>
              </button>
            );
          })}
        </fieldset>

        <footer className="modal-rodape">
          <Botao
            variante="primario"
            onClick={avancar}
            disabled={!respostaSelecionada}
          >
            {ehUltima ? "Ver resultado" : "Próxima →"}
          </Botao>
        </footer>
      </div>
    </Modal>
  );
}

/* ── Slide de um curso (conteúdo de uma matrícula) ───────────── */

function SlideConteudoCurso({ matricula, quizzesAprovados, onQuizAprovado, onMudarSecao, onConteudoConcluido, ativo }) {
  const curso = cursos.find((c) => c.id === matricula.cursoId);

  const modulosDoCurso = modulos
    .filter((m) => m.cursoId === matricula.cursoId)
    .sort((a, b) => a.ordem - b.ordem);

  const conteudosDoCurso = conteudos.filter((c) =>
    modulosDoCurso.some((m) => m.id === c.moduloId)
  );

  const [concluidos, setConcluidos] = useState(
    () => new Set(conteudosDoCurso.filter((c) => c.concluido).map((c) => c.id))
  );
  const [modulosAbertos, setModulosAbertos] = useState(() => new Set());
  const [quizModulo, setQuizModulo] = useState(null);
  const refsModulos = useRef({});

  const totalConteudos  = conteudosDoCurso.length;
  const totalConcluidos = concluidos.size;

  /* Apenas módulos que têm conteúdo — são os únicos que exibem botão de quiz */
  const modulosComConteudo = modulosDoCurso.filter((m) =>
    conteudosDoCurso.some((c) => c.moduloId === m.id)
  );
  const totalModulos  = modulosComConteudo.length;
  const quizzesFeitos = modulosComConteudo.filter((m) => quizzesAprovados.has(m.id)).length;

  /* Progresso geral = conteúdos + quizzes (cada quiz vale tanto quanto um conteúdo) */
  const totalPassos     = totalConteudos + totalModulos;
  const passosFeitos    = totalConcluidos + quizzesFeitos;
  const percentualGeral = totalPassos > 0 ? Math.round((passosFeitos / totalPassos) * 100) : 0;
  const tudoConcluido   = passosFeitos === totalPassos && totalPassos > 0;

  /* Módulo desbloqueado se o anterior tiver todos os conteúdos concluídos E quiz aprovado */
  function estaDesbloqueado(idx) {
    if (idx === 0) return true;
    const anterior = modulosDoCurso[idx - 1];
    const itensAnteriores = conteudosDoCurso.filter((c) => c.moduloId === anterior.id);
    return (
      itensAnteriores.length > 0 &&
      itensAnteriores.every((c) => concluidos.has(c.id)) &&
      quizzesAprovados.has(anterior.id)
    );
  }

  /* Próximo conteúdo a concluir — apenas em módulos desbloqueados */
  const proximoConteudo = conteudosDoCurso.find((c) => {
    if (concluidos.has(c.id)) return false;
    const idx = modulosDoCurso.findIndex((m) => m.id === c.moduloId);
    return estaDesbloqueado(idx);
  });
  const moduloProximo   = proximoConteudo
    ? modulosDoCurso.find((m) => m.id === proximoConteudo.moduloId)
    : null;

  useEffect(() => {
    if (ativo) onConteudoConcluido?.(tudoConcluido);
  }, [tudoConcluido, ativo]);

  /* Fecha módulos que ficaram bloqueados ao desmarcar conteúdo */
  useEffect(() => {
    setModulosAbertos((prev) => {
      const copia = new Set(prev);
      modulosDoCurso.forEach((mod, idx) => {
        if (!estaDesbloqueado(idx)) copia.delete(mod.id);
      });
      return copia;
    });
  }, [concluidos, quizzesAprovados]);

  function alternarConclusao(id) {
    setConcluidos((prev) => {
      const copia = new Set(prev);
      copia.has(id) ? copia.delete(id) : copia.add(id);
      return copia;
    });
  }

  function alternarModulo(id) {
    setModulosAbertos((prev) => {
      const copia = new Set(prev);
      copia.has(id) ? copia.delete(id) : copia.add(id);
      return copia;
    });
  }

  function abrirQuizModulo(modulo) {
    const sorteadas = [...questoesQuiz]
      .sort(() => Math.random() - 0.5)
      .slice(0, QUESTOES_POR_MODULO);
    setQuizModulo({ modulo, questoes: sorteadas });
  }

  function continuarConteudo() {
    if (!moduloProximo) return;
    setModulosAbertos((prev) => {
      const copia = new Set(prev);
      copia.add(moduloProximo.id);
      return copia;
    });
    setTimeout(() => {
      refsModulos.current[moduloProximo.id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <div className="conteudos-aluno">
      <header className="conteudos-aluno__cabecalho">
        <div className="conteudos-aluno__curso-info">
          <p className="conteudos-aluno__turma">{matricula.turmaNome}</p>
          <span className="conteudos-aluno__curso-etiqueta" aria-hidden="true">Curso</span>
          <h2 className="conteudos-aluno__curso-titulo">{curso?.titulo}</h2>
          <p className="conteudos-aluno__curso-meta">
            {totalConcluidos} de {totalConteudos} conteúdos concluídos
          </p>
        </div>
        <div className="conteudos-aluno__progresso-geral">
          <span className="conteudos-aluno__progresso-label">Progresso geral</span>
          <BarraProgresso percentual={percentualGeral} />
        </div>
      </header>

      {/* Banner dinâmico */}
      {tudoConcluido ? (
        <div className="banner-continuar banner-continuar--completo" role="status">
          <span className="banner-continuar__icone" aria-hidden="true">✓</span>
          <div className="banner-continuar__texto">
            <strong className="banner-continuar__titulo">Parabéns! Todos os conteúdos foram concluídos.</strong>
          </div>
        </div>
      ) : proximoConteudo ? (
        <div className="banner-continuar" role="complementary" aria-label="Próximo conteúdo sugerido">
          <span className="banner-continuar__icone" aria-hidden="true">
            {TIPO_CONFIG[proximoConteudo.tipo]?.icone ?? "◈"}
          </span>
          <div className="banner-continuar__texto">
            <p className="banner-continuar__rotulo">Continue de onde parou</p>
            <strong className="banner-continuar__titulo">{proximoConteudo.titulo}</strong>
            <p className="banner-continuar__modulo">{moduloProximo?.titulo}</p>
          </div>
          <Botao variante="primario" tamanho="pequeno" onClick={continuarConteudo}>
            Continuar →
          </Botao>
        </div>
      ) : null}

      {/* Módulos em acordeão */}
      {modulosDoCurso.map((modulo, idx) => {
        const itens = conteudosDoCurso.filter((c) => c.moduloId === modulo.id);
        if (itens.length === 0) return null;

        const bloqueado        = !estaDesbloqueado(idx);
        const estaAberto       = !bloqueado && modulosAbertos.has(modulo.id);
        const concluidosModulo = itens.filter((c) => concluidos.has(c.id)).length;
        const percentualModulo = Math.round((concluidosModulo / itens.length) * 100);

        return (
          <section
            key={modulo.id}
            className={`conteudos-modulo${bloqueado ? " conteudos-modulo--bloqueado" : ""}`}
            ref={(el) => { refsModulos.current[modulo.id] = el; }}
          >
            <header className="conteudos-modulo__cabecalho">
              <h3 className="conteudos-modulo__cabecalho-wrapper">
                <button
                  className={`conteudos-modulo__toggle${bloqueado ? " conteudos-modulo__toggle--bloqueado" : ""}`}
                  onClick={() => !bloqueado && alternarModulo(modulo.id)}
                  aria-expanded={estaAberto}
                  aria-disabled={bloqueado}
                  type="button"
                >
                  <div className="conteudos-modulo__info">
                    <span className="conteudos-modulo__titulo">{modulo.ordem}. {modulo.titulo}</span>
                    {bloqueado
                      ? <span className="conteudos-modulo__aviso-bloqueado">Conclua o módulo anterior e o quiz</span>
                      : <span className="conteudos-modulo__contagem">{concluidosModulo}/{itens.length} concluídos</span>
                    }
                  </div>
                  {!bloqueado && (
                    <div className="conteudos-modulo__barra" aria-hidden="true">
                      <BarraProgresso percentual={percentualModulo} mostrarTexto={false} />
                    </div>
                  )}
                  {bloqueado ? (
                    <span className="conteudos-modulo__cadeado" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </span>
                  ) : (
                    <span className={`conteudos-modulo__chevron ${estaAberto ? "conteudos-modulo__chevron--aberto" : ""}`} aria-hidden="true">▾</span>
                  )}
                </button>
              </h3>
              {!bloqueado && (
                <BotaoQuizModulo
                  percentual={percentualModulo}
                  aprovado={quizzesAprovados.has(modulo.id)}
                  onClick={() => abrirQuizModulo(modulo)}
                />
              )}
            </header>

            {estaAberto && (
              <ul className="lista-conteudos-completa conteudos-modulo__lista" role="list">
                {itens.map((cont) => {
                  const config        = TIPO_CONFIG[cont.tipo] || { icone: "◈", rotulo: cont.tipo };
                  const estaConcluido = concluidos.has(cont.id);
                  return (
                    <li key={cont.id} className={`cartao-conteudo ${estaConcluido ? "cartao-conteudo--concluido" : ""}`}>
                      <span className="cartao-conteudo__icone" aria-hidden="true" title={config.rotulo}>{config.icone}</span>
                      <div className="cartao-conteudo__info">
                        <h4 className="cartao-conteudo__titulo">{cont.titulo}</h4>
                        <p className="cartao-conteudo__modulo">{config.rotulo} · {cont.duracao}</p>
                      </div>
                      <div className="cartao-conteudo__meta">
                        <Insignia texto={cont.tipo} variante="marca" />
                      </div>
                      <Botao
                        variante={estaConcluido ? "sucesso" : "fantasma"}
                        tamanho="pequeno"
                        onClick={() => alternarConclusao(cont.id)}
                        aria-pressed={estaConcluido}
                        aria-label={`${estaConcluido ? "Desmarcar" : "Marcar"} "${cont.titulo}" como concluído`}
                      >
                        {estaConcluido ? "✓ Concluído" : "Marcar como feito"}
                      </Botao>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}

      {/* Botão de avaliação final — sempre visível no slide ativo, preenche conforme progresso */}
      {ativo && (
        <button
          className={`botao-avaliacao-flutuante${tudoConcluido ? " botao-avaliacao-flutuante--liberado" : ""}`}
          onClick={() => tudoConcluido && onMudarSecao("avaliacoes")}
          disabled={!tudoConcluido}
          type="button"
          style={{ "--pct": `${percentualGeral}%` }}
          style={{ "--pct": `${percentualGeral}%` }}
          aria-label={
            tudoConcluido
              ? "Realizar avaliação final"
              : `${percentualGeral}% concluído — conclua todos os conteúdos para liberar a avaliação`
          }
        >
          <span className="botao-avaliacao-flutuante__icone" aria-hidden="true">◈</span>
          <span>{tudoConcluido ? "Realizar Avaliação Final" : `${percentualGeral}% · Avaliação Final`}</span>
        </button>
      )}

      {quizModulo && createPortal(
        <QuizRapidoModal
          modulo={quizModulo.modulo}
          questoes={quizModulo.questoes}
          onFechar={() => setQuizModulo(null)}
          onAprovado={(percentual) => onQuizAprovado?.(quizModulo.modulo.id, percentual)}
        />,
        document.body
      )}
    </div>
  );
}

/* ── Slide de uma turma (visão do professor) ─────────────────── */

function SlideCursoProfessor({ turma, tipo, onNovoConteudo }) {
  const [modulosAbertos, setModulosAbertos] = useState(() => new Set());

  const modulosDoCurso = modulos
    .filter((m) => m.cursoId === turma.cursoId)
    .sort((a, b) => a.ordem - b.ordem);

  const conteudosDoCurso = conteudos.filter((c) =>
    modulosDoCurso.some((m) => m.id === c.moduloId)
  );

  function alternarModulo(id) {
    setModulosAbertos((prev) => {
      const copia = new Set(prev);
      copia.has(id) ? copia.delete(id) : copia.add(id);
      return copia;
    });
  }

  return (
    <div className="conteudos-aluno">
      <header className="conteudos-aluno__cabecalho">
        <div className="conteudos-aluno__curso-info">
          <p className="conteudos-aluno__turma">{turma.nomeTurma}</p>
          <span className="conteudos-aluno__curso-etiqueta" aria-hidden="true">Curso</span>
          <h2 className="conteudos-aluno__curso-titulo">{turma.cursoTitulo}</h2>
          <p className="conteudos-aluno__curso-meta">
            {turma.totalAlunos} aluno{turma.totalAlunos !== 1 ? "s" : ""} · {conteudosDoCurso.length} conteúdo{conteudosDoCurso.length !== 1 ? "s" : ""}
          </p>
        </div>
        {podeCriar(tipo, "conteudos") && (
          <Botao
            variante="primario"
            tamanho="pequeno"
            onClick={onNovoConteudo}
          >
            + Novo Conteúdo
          </Botao>
        )}
      </header>

      {modulosDoCurso.map((modulo) => {
        const itens = conteudosDoCurso.filter((c) => c.moduloId === modulo.id);
        if (itens.length === 0) return null;

        const estaAberto = modulosAbertos.has(modulo.id);

        return (
          <section key={modulo.id} className="conteudos-modulo">
            <header className="conteudos-modulo__cabecalho">
              <h3 className="conteudos-modulo__cabecalho-wrapper">
                <button
                  className="conteudos-modulo__toggle"
                  onClick={() => alternarModulo(modulo.id)}
                  aria-expanded={estaAberto}
                  type="button"
                >
                  <div className="conteudos-modulo__info">
                    <span className="conteudos-modulo__titulo">{modulo.ordem}. {modulo.titulo}</span>
                    <span className="conteudos-modulo__contagem">
                      {itens.length} conteúdo{itens.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <span
                    className={`conteudos-modulo__chevron ${estaAberto ? "conteudos-modulo__chevron--aberto" : ""}`}
                    aria-hidden="true"
                  >▾</span>
                </button>
              </h3>
            </header>

            {estaAberto && (
              <ul className="lista-conteudos-completa conteudos-modulo__lista" role="list">
                {itens.map((cont) => {
                  const config = TIPO_CONFIG[cont.tipo] || { icone: "◈", rotulo: cont.tipo };
                  return (
                    <li key={cont.id} className="cartao-conteudo">
                      <span className="cartao-conteudo__icone" aria-hidden="true" title={config.rotulo}>
                        {config.icone}
                      </span>
                      <div className="cartao-conteudo__info">
                        <h4 className="cartao-conteudo__titulo">{cont.titulo}</h4>
                        <p className="cartao-conteudo__modulo">{config.rotulo} · {cont.duracao}</p>
                      </div>
                      <div className="cartao-conteudo__meta">
                        <Insignia texto={cont.tipo} variante="marca" />
                      </div>
                      {podeEditar(tipo, "conteudos") && (
                        <div className="cartao-conteudo__acoes">
                          <Botao
                            variante="fantasma"
                            tamanho="pequeno"
                            aria-label={`Editar conteúdo ${cont.titulo}`}
                          >
                            Editar
                          </Botao>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

/* ── Vista do professor — carrossel de turmas ────────────────── */

function VistaProfessor({ usuario }) {
  const [slideAtual, setSlideAtual] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);

  const minhasTurmas = turmas.filter((t) => t.professorId === usuario?.id);

  if (minhasTurmas.length === 0) {
    return (
      <p className="texto-vazio texto-vazio--central" role="status">
        Você não possui turmas atribuídas.
      </p>
    );
  }

  const total     = minhasTurmas.length;
  const temAnterior = slideAtual > 0;
  const temProximo  = slideAtual < total - 1;

  /* Módulos apenas da turma visível no carrossel — usados no select do modal */
  const modulosDaTurmaAtual = modulos.filter(
    (m) => m.cursoId === minhasTurmas[slideAtual].cursoId
  );

  return (
    <div className="carrossel-cursos">

      {total > 1 && (
        <nav className="carrossel-cursos__nav" aria-label="Navegação entre turmas">
          <button
            className="carrossel-cursos__seta"
            onClick={() => setSlideAtual((i) => i - 1)}
            disabled={!temAnterior}
            aria-label="Turma anterior"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="carrossel-cursos__indicadores" role="tablist" aria-label="Turmas do professor">
            {minhasTurmas.map((turma, idx) => (
              <button
                key={turma.id}
                className={`carrossel-cursos__bolinha ${idx === slideAtual ? "carrossel-cursos__bolinha--ativa" : ""}`}
                onClick={() => setSlideAtual(idx)}
                role="tab"
                aria-selected={idx === slideAtual}
                aria-label={`Turma ${idx + 1}: ${turma.nomeTurma}`}
                type="button"
              />
            ))}
          </div>

          <button
            className="carrossel-cursos__seta"
            onClick={() => setSlideAtual((i) => i + 1)}
            disabled={!temProximo}
            aria-label="Próxima turma"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </nav>
      )}

      <div className="carrossel-cursos__janela">
        <SlideCursoProfessor
          turma={minhasTurmas[slideAtual]}
          tipo={usuario?.tipo}
          onNovoConteudo={() => setModalAberto(true)}
        />
      </div>

      {/* Portal para modal — evita conflito de stacking context com o transform do carrossel */}
      {modalAberto && createPortal(
        <Modal
          titulo={`Novo Conteúdo — ${minhasTurmas[slideAtual].nomeTurma}`}
          onFechar={() => setModalAberto(false)}
        >
          <form
            className="formulario-modal"
            onSubmit={(e) => { e.preventDefault(); setModalAberto(false); }}
            noValidate
          >
            <div className="campo">
              <label className="campo__rotulo" htmlFor="titulo-cont-prof">Título *</label>
              <input id="titulo-cont-prof" className="campo__entrada" type="text" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="modulo-cont-prof">Módulo *</label>
              <select id="modulo-cont-prof" className="campo__entrada" required>
                <option value="">Selecione um módulo</option>
                {modulosDaTurmaAtual.map((m) => (
                  <option key={m.id} value={m.id}>{m.titulo}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="tipo-cont-prof">Tipo *</label>
              <select id="tipo-cont-prof" className="campo__entrada" required>
                <option value="">Selecione o tipo</option>
                <option value="Video">Vídeo</option>
                <option value="Texto">Texto</option>
                <option value="Documento">Documento</option>
              </select>
            </div>
            <footer className="modal-rodape">
              <Botao variante="fantasma" onClick={() => setModalAberto(false)}>
                Cancelar
              </Botao>
              <Botao variante="primario" type="submit">
                Criar Conteúdo
              </Botao>
            </footer>
          </form>
        </Modal>,
        document.body
      )}
    </div>
  );
}

/* ── Vista do aluno — carrossel de cursos ────────────────────── */

function VistaAluno({ usuario, quizzesAprovados = new Set(), onQuizAprovado, onMudarSecao, onConteudoConcluido }) {
  const matriculasAprovadas = matriculas.filter(
    (m) => m.alunoId === usuario?.id && m.status === "Aprovada"
  );

  const [slideAtual, setSlideAtual] = useState(0);

  if (matriculasAprovadas.length === 0) {
    return (
      <div className="conteudos-sem-matricula">
        <p className="texto-vazio texto-vazio--central" role="status">
          Você não possui matrícula aprovada em nenhum curso.
          Solicite sua matrícula para acessar os conteúdos.
        </p>
      </div>
    );
  }

  const total      = matriculasAprovadas.length;
  const temAnterior = slideAtual > 0;
  const temProximo  = slideAtual < total - 1;

  return (
    <div className="carrossel-cursos">

      {/* Barra de navegação — setas + indicadores de página */}
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

      {/* Janela do carrossel */}
      <div className="carrossel-cursos__janela">
        <SlideConteudoCurso
          matricula={matriculasAprovadas[slideAtual]}
          quizzesAprovados={quizzesAprovados}
          onQuizAprovado={onQuizAprovado}
          onMudarSecao={onMudarSecao}
          onConteudoConcluido={onConteudoConcluido}
          ativo={true}
        />
      </div>
    </div>
  );
}

/* ── Vista de gestão (admin, coordenador) ────────────────────── */

function VistaGestao({ usuario }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [filtroModulo, setFiltroModulo] = useState("");

  const tipo = usuario?.tipo;

  const conteudosFiltrados = filtroModulo
    ? conteudos.filter((c) => c.moduloId === Number(filtroModulo))
    : conteudos;

  return (
    <div className="tela-conteudos">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Conteúdos Didáticos</h2>
          <p className="cabecalho-pagina__subtitulo">
            {conteudos.length} conteúdo{conteudos.length !== 1 ? "s" : ""} cadastrados na plataforma
          </p>
        </div>
        {podeCriar(tipo, "conteudos") && (
          <Botao
            variante="primario"
            onClick={() => setModalAberto(true)}
          >
            + Novo Conteúdo
          </Botao>
        )}
      </header>

      <div className="barra-filtros" role="search" aria-label="Filtros de conteúdo">
        <label htmlFor="filtro-modulo-cont" className="visualmente-oculto">
          Filtrar por módulo
        </label>
        <select
          id="filtro-modulo-cont"
          className="campo__entrada barra-filtros__select"
          value={filtroModulo}
          onChange={(e) => setFiltroModulo(e.target.value)}
        >
          <option value="">Todos os módulos</option>
          {modulos.map((m) => (
            <option key={m.id} value={m.id}>
              {m.titulo}
            </option>
          ))}
        </select>
      </div>

      {conteudosFiltrados.length === 0 ? (
        <p className="texto-vazio texto-vazio--central" role="status">
          Nenhum conteúdo encontrado.
        </p>
      ) : (
        <ul
          className="lista-conteudos-completa"
          role="list"
          aria-label="Lista de conteúdos didáticos"
        >
          {conteudosFiltrados.map((cont) => {
            const modulo = modulos.find((m) => m.id === cont.moduloId);
            const config = TIPO_CONFIG[cont.tipo] || { icone: "◈", rotulo: cont.tipo };

            return (
              <li key={cont.id} className="cartao-conteudo">
                <span className="cartao-conteudo__icone" aria-hidden="true">
                  {config.icone}
                </span>
                <div className="cartao-conteudo__info">
                  <h3 className="cartao-conteudo__titulo">{cont.titulo}</h3>
                  <p className="cartao-conteudo__modulo">
                    {modulo?.titulo ?? "Módulo desconhecido"}
                  </p>
                </div>
                <div className="cartao-conteudo__meta">
                  <span className="cartao-conteudo__duracao">{cont.duracao}</span>
                  <Insignia texto={cont.tipo} variante="marca" />
                  <Insignia
                    texto={cont.concluido ? "Concluído" : "Pendente"}
                    variante={cont.concluido ? "sucesso" : "neutro"}
                  />
                </div>
                {podeEditar(tipo, "conteudos") && (
                  <div className="cartao-conteudo__acoes">
                    <Botao
                      variante="fantasma"
                      tamanho="pequeno"
                      aria-label={`Editar conteúdo ${cont.titulo}`}
                    >
                      Editar
                    </Botao>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {modalAberto && (
        <Modal
          titulo="Novo Conteúdo Didático"
          onFechar={() => setModalAberto(false)}
        >
          <form
            className="formulario-modal"
            onSubmit={(e) => { e.preventDefault(); setModalAberto(false); }}
            noValidate
          >
            <div className="campo">
              <label className="campo__rotulo" htmlFor="titulo-cont">Título *</label>
              <input id="titulo-cont" className="campo__entrada" type="text" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="modulo-cont">Módulo *</label>
              <select id="modulo-cont" className="campo__entrada" required>
                <option value="">Selecione um módulo</option>
                {modulos.map((m) => (
                  <option key={m.id} value={m.id}>{m.titulo}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="tipo-cont">Tipo *</label>
              <select id="tipo-cont" className="campo__entrada" required>
                <option value="">Selecione o tipo</option>
                <option value="Video">Vídeo</option>
                <option value="Texto">Texto</option>
                <option value="Documento">Documento</option>
              </select>
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="duracao-cont">Duração</label>
              <input
                id="duracao-cont"
                className="campo__entrada"
                type="text"
                placeholder="Ex: 20min"
              />
            </div>
            <footer className="modal-rodape">
              <Botao variante="fantasma" onClick={() => setModalAberto(false)}>
                Cancelar
              </Botao>
              <Botao variante="primario" type="submit">
                Criar Conteúdo
              </Botao>
            </footer>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ── Componente principal — seleciona a vista pelo perfil ────── */

export default function TelaConteudos({ usuario, quizzesAprovados, onQuizAprovado, onMudarSecao, onConteudoConcluido }) {
  if (usuario?.tipo === "Aluno") {
    return (
      <VistaAluno
        usuario={usuario}
        quizzesAprovados={quizzesAprovados}
        onQuizAprovado={onQuizAprovado}
        onMudarSecao={onMudarSecao}
        onConteudoConcluido={onConteudoConcluido}
      />
    );
  }
  if (usuario?.tipo === "Professor") {
    return <VistaProfessor usuario={usuario} />;
  }
  return <VistaGestao usuario={usuario} />;
}
