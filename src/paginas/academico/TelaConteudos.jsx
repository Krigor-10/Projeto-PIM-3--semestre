import { useState, useRef, useEffect } from "react";
import { TbDotsVertical, TbPlayerPlay, TbAlignLeft, TbFileDescription, TbFile, TbPlus, TbLock, TbSettings, TbTrash, TbArrowLeft, TbArrowRight, TbPencil, TbX, TbCheck, TbBrain, TbPaperclip, TbLink, TbUpload, TbRefresh, TbChartBar } from "react-icons/tb";
import { MdSave, MdAdd, MdDelete } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import BarraProgresso from "@/componentes/BarraProgresso.jsx";
import Modal from "@/componentes/Modal.jsx";
import Botao from "@/componentes/Botao.jsx";
import SelectSimples from "@/componentes/SelectSimples.jsx";
import { conteudos, cursos, modulos, matriculas, turmas } from "@/dados/dadosMock.js";
import { db } from "@/dados/db.js";
import { questoesQuiz } from "@/dados/questoesQuiz.js";
import { podeCriar, podeEditar } from "@/dados/permissoes.js";

/* Ícones e rótulos semânticos por tipo de conteúdo */
const TIPO_CONFIG = {
  Video:     { icone: "▶", Icone: TbPlayerPlay,      rotulo: "Vídeo"      },
  Texto:     { icone: "✦", Icone: TbAlignLeft,       rotulo: "Texto"       },
  Documento: { icone: "⬡", Icone: TbFileDescription, rotulo: "Documento"   },
};
const IconePadrao = TbFile;

const QUESTOES_POR_MODULO = 3;

/* Geometria do círculo SVG (viewBox 48×48, centro 24,24) */
const RAIO_SVG = 20;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO_SVG;

/* ── Checkbox circular — marcar conteúdo como concluído ─────── */

function CheckCircular({ concluido, onClick, label }) {
  return (
    <motion.button
      type="button"
      className={`check-circular${concluido ? " check-circular--concluido" : ""}`}
      onClick={onClick}
      aria-pressed={concluido}
      aria-label={label}
      data-tooltip={label}
      whileTap={{ scale: 0.8 }}
    >
      <AnimatePresence>
        {concluido && (
          <motion.span
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            aria-hidden="true"
          >
            ✓
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

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
          {aprovado ? "✓" : liberado ? "▶" : <TbLock size={13} aria-hidden="true" />}
        </span>
      </span>

      {/* Texto identificador */}
      <span className="botao-quiz-modulo__texto">
        {aprovado ? "Quiz concluído" : liberado ? "Iniciar Quiz" : "Quiz bloqueado"}
      </span>
    </button>
  );
}

/* ── Modal de quiz rápido ────────────────────────────────────── */

function QuizRapidoModal({ modulo, questoes, onFechar, onAprovado, onProximoModulo, onUltimoModulo }) {
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

  function reiniciar() {
    setIndice(0);
    setRespostas({});
    setConcluido(false);
  }

  /* Conta quantas respostas batem com o gabarito */
  const acertos = questoes.filter((q) => respostas[q.id] === q.gabarito).length;
  /* Percentual de acerto = acertos / total × 100, arredondado para inteiro */
  const percentualAcerto = Math.round((acertos / totalQuestoes) * 100);
  /* Aprovado apenas quando TODAS as questões foram respondidas E ≥ 70% corretas */
  const todasRespondidas = questoes.every((q) => respostas[q.id] !== undefined);
  const aprovado = todasRespondidas && percentualAcerto >= 70;

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
            <Botao variante="perigo" onClick={onFechar}>
              <TbX size={16} aria-hidden="true" /> Fechar
            </Botao>
            {!aprovado && (
              <Botao variante="primario" onClick={reiniciar}>
                <TbRefresh size={16} aria-hidden="true" /> Refazer Quiz
              </Botao>
            )}
            {aprovado && onProximoModulo && (
              <Botao variante="primario" onClick={onProximoModulo}>
                Iniciar próximo módulo <TbArrowRight size={16} aria-hidden="true" />
              </Botao>
            )}
            {aprovado && !onProximoModulo && onUltimoModulo && (
              <Botao variante="sucesso" onClick={onUltimoModulo}>
                Ir para Avaliação Final <TbArrowRight size={16} aria-hidden="true" />
              </Botao>
            )}
          </footer>
        </div>
      </Modal>
    );
  }

  /* ── Tela de questão ── */
  return (
    <Modal titulo={`Quiz — ${modulo.titulo}`} onFechar={onFechar} className="modal-caixa--quiz">
      <div className="quiz-rapido">
        {indice > 0 && (
          <button
            type="button"
            className="quiz-btn-voltar"
            onClick={() => setIndice((i) => i - 1)}
          >
            <TbArrowLeft size={17} aria-hidden="true" /> Voltar
          </button>
        )}
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
            {ehUltima ? (
              <><TbChartBar size={16} aria-hidden="true" /> Ver resultado</>
            ) : (
              <>Próxima <TbArrowRight size={16} aria-hidden="true" /></>
            )}
          </Botao>
        </footer>
      </div>
    </Modal>
  );
}

/* ── Slide de um curso (conteúdo de uma matrícula) ───────────── */

function SlideConteudoCurso({ matricula, quizzesAprovados, onQuizAprovado, onMudarSecao, onConteudoConcluido, onAlternarConclusao, conteudosConcluidos, ativo }) {
  const curso = cursos.find((c) => c.id === matricula.cursoId);

  const modulosDoCurso = modulos
    .filter((m) => m.cursoId === matricula.cursoId)
    .sort((a, b) => a.ordem - b.ordem);

  const conteudosDoCurso = conteudos.filter((c) =>
    modulosDoCurso.some((m) => m.id === c.moduloId)
  );

  const totalPorTipoAluno = {};
  for (const c of conteudosDoCurso) {
    totalPorTipoAluno[c.tipo] = (totalPorTipoAluno[c.tipo] ?? 0) + 1;
  }
  const resumoTiposAluno = ["Video", "Texto", "Documento"].filter((t) => totalPorTipoAluno[t]);

  const concluidos = conteudosConcluidos ?? new Set(conteudosDoCurso.filter((c) => c.concluido).map((c) => c.id));
  const [modulosAbertos, setModulosAbertos] = useState(() => new Set());
  const [quizModulo, setQuizModulo] = useState(null);
  const [previewConteudo, setPreviewConteudo] = useState(null);
  const [quizzesIniciados, setQuizzesIniciados] = useState(() => new Set());
  const refsModulos = useRef({});

  const totalConteudos  = conteudosDoCurso.length;
  const totalConcluidos = conteudosDoCurso.filter((c) => concluidos.has(c.id)).length;

  /* Progresso geral = conteúdos + quiz por conteúdo (cada quiz vale tanto quanto um conteúdo) */
  const quizzesFeitos   = conteudosDoCurso.filter((c) => quizzesAprovados.has(c.id)).length;
  const totalPassos     = totalConteudos * 2;
  const passosFeitos    = totalConcluidos + quizzesFeitos;
  const percentualGeral = totalPassos > 0 ? Math.round((passosFeitos / totalPassos) * 100) : 0;
  const tudoConcluido   = passosFeitos === totalPassos && totalPassos > 0;

  /* Módulo desbloqueado se o anterior tiver todos os conteúdos concluídos E todos os quizzes aprovados */
  function estaDesbloqueado(idx) {
    if (idx === 0) return true;
    const anterior = modulosDoCurso[idx - 1];
    const itensAnteriores = conteudosDoCurso.filter((c) => c.moduloId === anterior.id);
    if (itensAnteriores.length === 0) return estaDesbloqueado(idx - 1);
    return (
      itensAnteriores.every((c) => concluidos.has(c.id)) &&
      itensAnteriores.every((c) => quizzesAprovados.has(c.id))
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
    onAlternarConclusao?.(id);
  }

  function alternarModulo(id) {
    setModulosAbertos((prev) => {
      const copia = new Set(prev);
      copia.has(id) ? copia.delete(id) : copia.add(id);
      return copia;
    });
  }

  function abrirQuizConteudo(cont) {
    const modulo = modulosDoCurso.find((m) => m.id === cont.moduloId);
    const questoesMod = db.questoes.listar().filter((q) => q.moduloId === cont.moduloId);
    const pool = questoesMod.length > 0 ? questoesMod : questoesQuiz;
    const sorteadas = [...pool]
      .sort(() => Math.random() - 0.5)
      .slice(0, QUESTOES_POR_MODULO);
    setQuizzesIniciados((prev) => new Set(prev).add(cont.id));
    setQuizModulo({ modulo, contId: cont.id, questoes: sorteadas });
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

  function irParaModulo(id) {
    setModulosAbertos(new Set([id]));
    setTimeout(() => refsModulos.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  return (
    <div className="conteudos-aluno">
      <header className="conteudos-aluno__cabecalho">
        <div className="conteudos-aluno__curso-info">
          <h2 className="conteudos-aluno__curso-titulo">{curso?.titulo}</h2>
          <div className="conteudos-aluno__meta-chips">
            <span className="conteudos-aluno__meta-chip conteudos-aluno__meta-chip--progresso">
              <TbCheck size={12} aria-hidden="true" />
              {totalConcluidos}/{totalConteudos} concluídos
            </span>
            {resumoTiposAluno.map((t) => {
              const { Icone, rotulo } = TIPO_CONFIG[t];
              const n = totalPorTipoAluno[t];
              return (
                <span key={t} className="conteudos-aluno__meta-chip">
                  <Icone size={12} aria-hidden="true" />
                  {n} {rotulo.toLowerCase()}{n !== 1 ? "s" : ""}
                </span>
              );
            })}
          </div>
        </div>
        <div className="conteudos-aluno__progresso-geral">
          <p className="progresso-hero__legenda">
            {passosFeitos}/{totalPassos} passos
          </p>
          <div className="anel-progresso" aria-label={`${percentualGeral} por cento concluído`}>
            <svg className="anel-progresso__svg" viewBox="0 0 120 120" aria-hidden="true">
              <defs>
                <linearGradient id={`anel-grad-cont-${matricula.cursoId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#b992ff" />
                  <stop offset="100%" stopColor="#7b2ff7" />
                </linearGradient>
              </defs>
              <circle className="anel-progresso__trilha" cx="60" cy="60" r="50" />
              <circle
                className="anel-progresso__arco"
                cx="60" cy="60" r="50"
                stroke={`url(#anel-grad-cont-${matricula.cursoId})`}
                style={{ strokeDasharray: "314.16", strokeDashoffset: 314.16 * (1 - percentualGeral / 100) }}
              />
            </svg>
            <span className="anel-progresso__texto" aria-hidden="true">{percentualGeral}%</span>
          </div>
        </div>
      </header>

      {/* Módulos em acordeão */}
      {modulosDoCurso.map((modulo, idx) => {
        const itens = conteudosDoCurso.filter((c) => c.moduloId === modulo.id);
        if (itens.length === 0) return null;

        const bloqueado        = !estaDesbloqueado(idx);
        const estaAberto       = !bloqueado && modulosAbertos.has(modulo.id);
        const concluidosModulo = itens.filter((c) => concluidos.has(c.id)).length;
        const percentualModulo = Math.round((concluidosModulo / itens.length) * 100);
        const moduloConcluido  = !bloqueado && itens.every((c) => concluidos.has(c.id) && quizzesAprovados.has(c.id));

        const contagemTiposMod = {};
        for (const c of itens) { contagemTiposMod[c.tipo] = (contagemTiposMod[c.tipo] ?? 0) + 1; }
        const resumoTiposMod = ["Video", "Texto", "Documento"].filter((t) => contagemTiposMod[t]);

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
                      : <span className="conteudos-modulo__contagem" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          {concluidosModulo}/{itens.length} concluídos
                          {resumoTiposMod.length > 0 && (
                            <>
                              <span aria-hidden="true" style={{ opacity: 0.4 }}>·</span>
                              {resumoTiposMod.map((t, i) => {
                                const { Icone } = TIPO_CONFIG[t];
                                return (
                                  <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                                    {i > 0 && <span aria-hidden="true" style={{ opacity: 0.4 }}>·</span>}
                                    <Icone size={14} aria-hidden="true" />
                                    {contagemTiposMod[t]}
                                  </span>
                                );
                              })}
                            </>
                          )}
                        </span>
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
                  ) : moduloConcluido ? (
                    <motion.span
                      className="check-circular check-circular--concluido"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      aria-label="Módulo concluído"
                      style={{ pointerEvents: "none", width: "18px", height: "18px", fontSize: "0.65rem" }}
                    >
                      <span aria-hidden="true">✓</span>
                    </motion.span>
                  ) : (
                    <span className={`conteudos-modulo__chevron ${estaAberto ? "conteudos-modulo__chevron--aberto" : ""}`} aria-hidden="true">▾</span>
                  )}
                </button>
              </h3>
            </header>

            <AnimatePresence initial={false}>
            {estaAberto && (
              <motion.div
                key={`lista-${modulo.id}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
              <ul className="lista-conteudos-completa conteudos-modulo__lista" role="list">
                {itens.map((cont, i) => {
                  const config        = TIPO_CONFIG[cont.tipo] || { icone: "◈", rotulo: cont.tipo };
                  const estaConcluido = concluidos.has(cont.id);
                  const itemBloqueado = i > 0 && !concluidos.has(itens[i - 1].id);
                  const isAtual       = !estaConcluido && !itemBloqueado && cont.id === proximoConteudo?.id;
                  return (
                    <li key={cont.id} className={`cartao-conteudo${estaConcluido ? " cartao-conteudo--concluido" : ""}${itemBloqueado ? " cartao-conteudo--bloqueado" : ""}${isAtual ? " cartao-conteudo--atual" : ""}`}>
                      {estaConcluido && !itemBloqueado && (
                        <motion.span
                          className="cartao-conteudo__badge-check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 18 }}
                          aria-label="Concluído"
                        >
                          <TbCheck size={11} aria-hidden="true" />
                        </motion.span>
                      )}
                      {itemBloqueado ? (
                        <span
                          className="cartao-conteudo__icone-btn cartao-conteudo__icone-btn--bloqueado"
                          aria-label="Conteúdo bloqueado"
                          data-tooltip="Conclua o conteúdo anterior"
                        >
                          <TbLock size={18} aria-hidden="true" />
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="cartao-conteudo__icone-btn"
                          aria-label={`Visualizar ${config.rotulo}: ${cont.titulo}`}
                          data-tooltip={`Ver ${config.rotulo}`}
                          onClick={() => setPreviewConteudo({ cont, config })}
                        >
                          {(() => { const Ic = config.Icone ?? IconePadrao; return <Ic size={18} aria-hidden="true" />; })()}
                        </button>
                      )}
                      <div className="cartao-conteudo__info">
                        <h4 className="cartao-conteudo__titulo">{cont.titulo}</h4>
                        <p className="cartao-conteudo__modulo">{config.rotulo} · {cont.duracao}</p>
                      </div>
                      {!itemBloqueado && (() => {
                        const quizFeito     = quizzesAprovados.has(cont.id);
                        const quizPendente  = quizzesIniciados.has(cont.id) && !quizFeito;
                        const quizBloqueado = !estaConcluido;
                        return (
                          <button
                            type="button"
                            className={`cartao-conteudo__quiz-btn${quizBloqueado ? " cartao-conteudo__quiz-btn--bloqueado" : quizFeito ? " cartao-conteudo__quiz-btn--feito" : quizPendente ? " cartao-conteudo__quiz-btn--pendente" : ""}`}
                            aria-label={quizFeito ? "Quiz concluído" : quizPendente ? "Quiz pendente — clique para continuar" : quizBloqueado ? "Conclua o conteúdo para desbloquear" : "Iniciar quiz"}
                            data-tooltip={quizFeito ? "Concluído" : quizPendente ? "Continuar quiz" : quizBloqueado ? "Conclua o conteúdo primeiro" : "Iniciar Quiz"}
                            onClick={() => !quizBloqueado && abrirQuizConteudo(cont)}
                            disabled={quizBloqueado}
                          >
                            {quizBloqueado
                              ? <><TbLock size={15} aria-hidden="true" /> Quiz</>
                              : quizFeito
                                ? <><TbBrain size={18} aria-hidden="true" /> Quiz concluído</>
                                : quizPendente
                                  ? <><TbBrain size={18} aria-hidden="true" /> Pendente</>
                                  : <><TbBrain size={18} aria-hidden="true" /> Quiz</>
                            }
                          </button>
                        );
                      })()}
                      {cont.tipo !== "Video" && !itemBloqueado && !estaConcluido && (
                        <CheckCircular
                          concluido={false}
                          onClick={() => alternarConclusao(cont.id)}
                          label={`Marcar "${cont.titulo}" como concluído`}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
              </motion.div>
            )}
            </AnimatePresence>
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
          onAprovado={(percentual) => {
            setQuizzesIniciados((prev) => { const c = new Set(prev); c.delete(quizModulo.contId); return c; });
            onQuizAprovado?.(quizModulo.contId, percentual);
          }}
        />,
        document.body
      )}

      {previewConteudo && createPortal(
        <Modal
          titulo={previewConteudo.cont.titulo}
          onFechar={() => setPreviewConteudo(null)}
          className="modal-caixa--preview"
        >
          <div className="preview-conteudo">
            {(() => {
              const estaConcluido = concluidos.has(previewConteudo.cont.id);
              const { cont, config } = previewConteudo;

              return (
                <>
                  <p className="preview-conteudo__meta">
                    {config.rotulo} · {cont.duracao}
                  </p>

                  {/* Tela de sucesso — igual para todos os tipos após concluir */}
                  {estaConcluido ? (
                    <motion.div
                      key="sucesso"
                      className="preview-conteudo__video-sucesso"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      <motion.div
                        className="preview-conteudo__sucesso-icone"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 18 }}
                      >
                        <TbCheck size={48} aria-hidden="true" />
                      </motion.div>
                      <p className="preview-conteudo__sucesso-titulo">
                        {cont.tipo === "Video" ? "Vídeo concluído!" : "Conteúdo concluído!"}
                      </p>
                      <span className="preview-conteudo__sucesso-sub">
                        Agora você pode iniciar o quiz
                      </span>
                      <button
                        type="button"
                        className="cartao-conteudo__quiz-btn"
                        onClick={() => { setPreviewConteudo(null); abrirQuizConteudo(cont); }}
                        style={{ marginTop: "0.5rem" }}
                      >
                        <TbBrain size={18} aria-hidden="true" /> Iniciar Quiz
                      </button>
                    </motion.div>
                  ) : cont.tipo === "Video" ? (
                    <div className="preview-conteudo__video-placeholder">
                      <TbPlayerPlay size={64} aria-hidden="true" />
                      <p>Pré-visualização de vídeo</p>
                      <span>{cont.titulo}</span>
                    </div>
                  ) : cont.tipo === "Texto" ? (
                    <div className="preview-conteudo__texto-placeholder">
                      <TbAlignLeft size={36} aria-hidden="true" />
                      <p>Conteúdo em texto</p>
                      <span>{cont.titulo}</span>
                    </div>
                  ) : (
                    <div className="preview-conteudo__doc-placeholder">
                      <TbFileDescription size={36} aria-hidden="true" />
                      <p>Documento disponível</p>
                      <span>{cont.titulo}</span>
                    </div>
                  )}

                  {/* Rodapé — visível apenas antes de concluir */}
                  <div className="preview-conteudo__rodape">
                    <Botao variante="perigo" tamanho="pequeno" onClick={() => setPreviewConteudo(null)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <TbX size={15} aria-hidden="true" /> Fechar
                    </Botao>
                    {!estaConcluido && (
                      <div className="preview-conteudo__rodape-check">
                        <span className="preview-conteudo__rodape-label">Marcar como concluído</span>
                        <CheckCircular
                          concluido={false}
                          onClick={() => alternarConclusao(cont.id)}
                          label={`Marcar "${cont.titulo}" como concluído`}
                        />
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </Modal>,
        document.body
      )}
    </div>
  );
}

/* ── Slide de uma turma (visão do professor) ─────────────────── */

function SlideCursoProfessor({ turma, tipo, onNovoConteudo, onAbrirQuiz, onExcluirQuiz, onExcluirConteudo, conteudosExtras = [], conteudosExcluidos = new Set() }) {
  const [modulosAbertos, setModulosAbertos]         = useState(() => new Set());
  const [menuConteudoAberto, setMenuConteudoAberto] = useState(null);
  const [modalOpcoesCont, setModalOpcoesCont]       = useState(null);
  const [confirmarExcluirQuiz, setConfirmarExcluirQuiz]     = useState(false);
  const [confirmarExcluirCont, setConfirmarExcluirCont]     = useState(null);

  useEffect(() => {
    if (!menuConteudoAberto) return;
    function fechar() { setMenuConteudoAberto(null); }
    document.addEventListener("click", fechar);
    return () => document.removeEventListener("click", fechar);
  }, [menuConteudoAberto]);

  const modulosDoCurso = modulos
    .filter((m) => m.cursoId === turma.cursoId)
    .sort((a, b) => a.ordem - b.ordem);

  const conteudosDoCurso = [...conteudos, ...conteudosExtras].filter((c) =>
    modulosDoCurso.some((m) => m.id === c.moduloId) && !conteudosExcluidos.has(c.id)
  );

  const totalPorTipoProf = {};
  for (const c of conteudosDoCurso) {
    totalPorTipoProf[c.tipo] = (totalPorTipoProf[c.tipo] ?? 0) + 1;
  }
  const resumoTiposProf = ["Video", "Texto", "Documento"].filter((t) => totalPorTipoProf[t]);

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
          <h2 className="conteudos-aluno__curso-titulo">{turma.cursoTitulo}</h2>
          <div className="conteudos-aluno__meta-chips">
            {resumoTiposProf.map((t) => {
              const { Icone, rotulo } = TIPO_CONFIG[t];
              const n = totalPorTipoProf[t];
              return (
                <span key={t} className="conteudos-aluno__meta-chip">
                  <Icone size={12} aria-hidden="true" />
                  {n} {rotulo.toLowerCase()}{n !== 1 ? "s" : ""}
                </span>
              );
            })}
          </div>
        </div>
      </header>

      {modulosDoCurso.map((modulo) => {
        const itens = conteudosDoCurso.filter((c) => c.moduloId === modulo.id);
        const vazio = itens.length === 0;

        const estaAberto = modulosAbertos.has(modulo.id);

        const contagemTiposModProf = {};
        for (const c of itens) { contagemTiposModProf[c.tipo] = (contagemTiposModProf[c.tipo] ?? 0) + 1; }
        const resumoTiposModProf = ["Video", "Texto", "Documento"].filter((t) => contagemTiposModProf[t]);

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
                    <span className="conteudos-modulo__contagem" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      {resumoTiposModProf.map((t, i) => {
                        const { Icone } = TIPO_CONFIG[t];
                        return (
                          <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                            {i > 0 && <span aria-hidden="true" style={{ opacity: 0.4 }}>·</span>}
                            <Icone size={14} aria-hidden="true" />
                            {contagemTiposModProf[t]}
                          </span>
                        );
                      })}
                    </span>
                  </div>
                  <span
                    className={`conteudos-modulo__chevron ${estaAberto ? "conteudos-modulo__chevron--aberto" : ""}`}
                    aria-hidden="true"
                  >▾</span>
                </button>
              </h3>
              {podeCriar(tipo, "conteudos") && (
                <button
                  className="modulo-btn-add"
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onNovoConteudo(modulo); }}
                  aria-label={`Adicionar conteúdo em ${modulo.titulo}`}
                  data-tooltip="Adicionar conteúdo"
                >
                  <motion.span
                    whileHover={{ scale: 1.15, rotate: 90 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    style={{ display: "flex" }}
                  >
                    <TbPlus size={30} aria-hidden="true" />
                  </motion.span>
                </button>
              )}
            </header>

            {vazio && (
              <p className="texto-vazio" role="status" style={{ padding: "12px 20px", fontSize: "0.85rem" }}>
                Nenhum conteúdo neste módulo.
              </p>
            )}

            {estaAberto && !vazio && (
              <ul className="lista-conteudos-completa conteudos-modulo__lista" role="list">
                {itens.map((cont) => {
                  const config = TIPO_CONFIG[cont.tipo] || { icone: "◈", rotulo: cont.tipo };
                  return (
                    <li key={cont.id} className="cartao-conteudo">
                      <button
                        type="button"
                        className="cartao-conteudo__icone-btn"
                        aria-label={`Visualizar ${config.rotulo}: ${cont.titulo}`}
                        data-tooltip={`Ver ${config.rotulo}`}
                        onClick={() => {}}
                      >
                        {(() => { const Ic = config.Icone ?? IconePadrao; return <Ic size={18} aria-hidden="true" />; })()}
                      </button>
                      <div className="cartao-conteudo__info">
                        <h4 className="cartao-conteudo__titulo">{cont.titulo}</h4>
                        <p className="cartao-conteudo__modulo">{config.rotulo} · {cont.duracao}</p>
                      </div>

                      {podeCriar(tipo, "conteudos") && (
                        <button
                          type="button"
                          className="cartao-conteudo__quiz-btn"
                          aria-label={`Gerenciar quiz de ${modulo.titulo}`}
                          data-tooltip="Gerenciar Quiz"
                          onClick={() => onAbrirQuiz(modulo)}
                        >
                          <span style={{ position: "relative", display: "inline-flex" }}>
                            <TbBrain size={20} aria-hidden="true" />
                            <span aria-hidden="true" style={{
                              position: "absolute", top: -4, right: -5,
                              background: "#fff", color: "#7c3aed",
                              borderRadius: "50%", width: 13, height: 13,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              boxShadow: "0 0 0 1.5px #7c3aed"
                            }}><MdAdd size={10} /></span>
                          </span> Quiz
                        </button>
                      )}
                      {podeEditar(tipo, "conteudos") && (
                        <div className="menu-contexto">
                          <button
                            className="menu-contexto__botao"
                            type="button"
                            aria-label={`Opções para ${cont.titulo}`}
                            onClick={(e) => { e.stopPropagation(); setMenuConteudoAberto(menuConteudoAberto === cont.id ? null : cont.id); }}
                          ><TbDotsVertical size={18} aria-hidden="true" /></button>
                          {menuConteudoAberto === cont.id && (
                            <ul className="menu-contexto__lista" role="menu">
                              <li><button type="button" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={() => { setModalOpcoesCont({ cont, modulo }); setMenuConteudoAberto(null); }}><TbSettings size={20} aria-hidden="true" />Opções</button></li>
                              {confirmarExcluirCont === cont.id ? (
                                <li className="menu-contexto__confirmar">
                                  <span>Excluir?</span>
                                  <button type="button" className="menu-contexto__confirmar-sim" onClick={() => { onExcluirConteudo(cont); setMenuConteudoAberto(null); setConfirmarExcluirCont(null); }}>Sim</button>
                                  <button type="button" className="menu-contexto__confirmar-nao" onClick={() => setConfirmarExcluirCont(null)}>Não</button>
                                </li>
                              ) : (
                                <li><button type="button" className="menu-item--perigo" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={(e) => { e.stopPropagation(); setConfirmarExcluirCont(cont.id); }}><TbTrash size={20} aria-hidden="true" />Excluir</button></li>
                              )}
                            </ul>
                          )}
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

      {modalOpcoesCont && createPortal(
        <Modal
          titulo={modalOpcoesCont.cont.titulo}
          onFechar={() => setModalOpcoesCont(null)}
        >
          {(() => {
            const { cont, modulo } = modalOpcoesCont;
            const config  = TIPO_CONFIG[cont.tipo] || { Icone: IconePadrao, rotulo: cont.tipo };
            const Ic      = config.Icone ?? IconePadrao;
            const nQuestoes = db.questoes.listar().filter((q) => q.moduloId === modulo.id).length;
            return (
              <>
                {/* Conteúdo */}
                <div className="opcoes-cont__secao">
                  <p className="opcoes-cont__rotulo">Conteúdo</p>
                  <div className="opcoes-cont__linha">
                    <span className="cartao-conteudo__icone-btn opcoes-cont__icone-estatico" aria-hidden="true">
                      <Ic size={18} />
                    </span>
                    <div style={{ flex: 1 }}>
                      <strong className="opcoes-cont__titulo">{cont.titulo}</strong>
                      <p className="opcoes-cont__meta">{config.rotulo} · {cont.duracao}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Excluir conteúdo ${cont.titulo}`}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center", padding: "2px" }}
                      onClick={() => { onExcluirConteudo(cont); setModalOpcoesCont(null); }}
                    >
                      <motion.span
                        whileHover={{ scale: 1.3, rotate: -15 }}
                        transition={{ type: "spring", stiffness: 500, damping: 10 }}
                        style={{ display: "flex" }}
                      >
                        <MdDelete size={21} aria-hidden="true" />
                      </motion.span>
                    </button>
                  </div>
                </div>

                {/* Quiz */}
                <div className="opcoes-cont__secao">
                  <p className="opcoes-cont__rotulo">Quiz do Módulo</p>
                  <div className="opcoes-cont__linha">
                    <span className="cartao-conteudo__icone-btn opcoes-cont__icone-estatico" aria-hidden="true">
                      <TbBrain size={18} />
                    </span>
                    <p className="opcoes-cont__quiz-contagem">
                      {nQuestoes === 0
                        ? "Nenhuma questão cadastrada"
                        : `${nQuestoes} questão${nQuestoes !== 1 ? "ões" : ""} cadastrada${nQuestoes !== 1 ? "s" : ""}`}
                    </p>
                    {confirmarExcluirQuiz ? (
                      <div className="opcoes-cont__confirmar">
                        <span className="opcoes-cont__confirmar-texto">Excluir quiz?</span>
                        <button
                          type="button"
                          className="opcoes-cont__confirmar-sim"
                          onClick={() => { onExcluirQuiz(modulo); setConfirmarExcluirQuiz(false); setModalOpcoesCont(null); }}
                        >Sim</button>
                        <button
                          type="button"
                          className="opcoes-cont__confirmar-nao"
                          onClick={() => setConfirmarExcluirQuiz(false)}
                        >Não</button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="quiz-mgmt__editar"
                          aria-label="Gerenciar quiz deste módulo"
                          data-tooltip="Gerenciar Quiz"
                          onClick={() => onAbrirQuiz(modulo)}
                        >
                          <TbPencil size={18} aria-hidden="true" />
                        </button>
                        {nQuestoes > 0 && (
                          <button
                            type="button"
                            aria-label="Excluir quiz deste módulo"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center", padding: "2px" }}
                            onClick={() => setConfirmarExcluirQuiz(true)}
                          >
                            <motion.span
                              whileHover={{ scale: 1.3, rotate: -15 }}
                              transition={{ type: "spring", stiffness: 500, damping: 10 }}
                              style={{ display: "flex" }}
                            >
                              <MdDelete size={21} aria-hidden="true" />
                            </motion.span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Gerenciamento */}
                <div className="modal-rodape">
                  <Botao variante="perigo" tamanho="pequeno" style={{ display: "flex", alignItems: "center", gap: "6px", marginRight: "auto" }}>
                    <TbTrash size={15} aria-hidden="true" /> Excluir
                  </Botao>
                  <Botao variante="secundario" tamanho="pequeno" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <TbPencil size={15} aria-hidden="true" /> Editar
                  </Botao>
                </div>
              </>
            );
          })()}
        </Modal>,
        document.body
      )}
    </div>
  );
}

/* ── Vista do professor — carrossel de turmas ────────────────── */

const FORM_VAZIO = { titulo: "", enunciado: "", a: "", b: "", c: "", d: "", e: "", gabarito: "" };

function VistaProfessor({ usuario, onToast }) {
  const [slideAtual, setSlideAtual]         = useState(0);
  const [touchInicioXProf, setTouchInicioXProf] = useState(null);
  const [modalAberto, setModalAberto]       = useState(false);
  const [moduloModal, setModuloModal]       = useState(null);
  const [moduloIdProf, setModuloIdProf]     = useState(null);
  const [tipoContProf, setTipoContProf]     = useState(null);
  const [tituloContProf, setTituloContProf] = useState("");
  const [anexoContProf, setAnexoContProf]   = useState("");
  const [conteudosLocais, setConteudosLocais]       = useState([]);
  const [conteudosExcluidos, setConteudosExcluidos] = useState(() => new Set());
  const [modalQuizModulo, setModalQuizModulo] = useState(null);
  const [questoesDb, setQuestoesDb]         = useState(() => db.questoes.listar());
  const [formQuestao, setFormQuestao]       = useState(null);
  const [confirmarFechar, setConfirmarFechar] = useState(false);

  useEffect(() => { setModuloIdProf(moduloModal?.id ?? null); setTipoContProf(null); setTituloContProf(""); setAnexoContProf(""); }, [moduloModal]);

  function abrirModalQuiz(modulo) {
    setQuestoesDb(db.questoes.listar());
    setModalQuizModulo(modulo);
    setFormQuestao(null);
  }

  function fecharModalQuiz() {
    setModalQuizModulo(null);
    setFormQuestao(null);
    setConfirmarFechar(false);
  }

  function salvarQuiz() {
    fecharModalQuiz();
    onToast?.("Quiz salvo com sucesso!", "sucesso");
  }

  function criarConteudo() {
    if (!tituloContProf.trim() || !moduloIdProf || !tipoContProf) return;
    const novo = {
      id: Date.now(),
      titulo: tituloContProf.trim(),
      tipo: tipoContProf,
      moduloId: moduloIdProf,
      duracao: "—",
      concluido: false,
    };
    setConteudosLocais((prev) => [...prev, novo]);
    setModalAberto(false);
    setModuloModal(null);
    setTipoContProf(null);
    setTituloContProf("");
    onToast?.("Conteúdo criado com sucesso!", "sucesso");
  }

  function excluirConteudo(cont) {
    setConteudosExcluidos((prev) => new Set([...prev, cont.id]));
    setConteudosLocais((prev) => prev.filter((c) => c.id !== cont.id));
    onToast?.(`"${cont.titulo}" excluído.`, "aviso");
  }

  function excluirTodoQuiz(modulo) {
    const restantes = db.questoes.listar().filter((q) => q.moduloId !== modulo.id);
    db.questoes.salvar(restantes);
    setQuestoesDb(restantes);
    onToast?.("Quiz excluído.", "aviso");
  }

  function salvarQuestao(e) {
    e.preventDefault();
    const questaoEditada = {
      id: formQuestao.editandoId ?? Date.now(),
      moduloId: modalQuizModulo.id,
      titulo: formQuestao.titulo,
      tema: modalQuizModulo.titulo,
      enunciado: formQuestao.enunciado,
      alternativas: [
        { letra: "A", texto: formQuestao.a },
        { letra: "B", texto: formQuestao.b },
        { letra: "C", texto: formQuestao.c },
        { letra: "D", texto: formQuestao.d },
        { letra: "E", texto: formQuestao.e },
      ],
      gabarito: formQuestao.gabarito,
    };
    const atuais = db.questoes.listar();
    const atualizada = formQuestao.editandoId
      ? atuais.map((q) => q.id === formQuestao.editandoId ? questaoEditada : q)
      : [...atuais, questaoEditada];
    db.questoes.salvar(atualizada);
    setQuestoesDb(atualizada);
    setFormQuestao(null);
  }

  function editarQuestao(q) {
    setFormQuestao({
      editandoId: q.id,
      titulo: q.titulo ?? "",
      enunciado: q.enunciado,
      a: q.alternativas[0]?.texto ?? "",
      b: q.alternativas[1]?.texto ?? "",
      c: q.alternativas[2]?.texto ?? "",
      d: q.alternativas[3]?.texto ?? "",
      e: q.alternativas[4]?.texto ?? "",
      gabarito: q.gabarito,
    });
  }

  function excluirQuestao(id) {
    const atuais = db.questoes.listar();
    const atualizada = atuais.filter((q) => q.id !== id);
    db.questoes.salvar(atualizada);
    setQuestoesDb(atualizada);
    onToast?.("Questão excluída.", "erro");
  }

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

      <header className="cabecalho-pagina" style={{ marginBottom: "var(--espaco-md)" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--espaco-md)" }}>
            <h1 className="cabecalho-pagina__titulo">Conteúdos</h1>
            <label htmlFor="filtro-prof-turma" className="visualmente-oculto">Selecionar turma</label>
            <select
              id="filtro-prof-turma"
              className="campo__entrada barra-filtros__select"
              value={slideAtual}
              onChange={(e) => setSlideAtual(Number(e.target.value))}
              aria-label="Navegar para turma"
              style={{ marginLeft: "auto", maxWidth: "240px" }}
            >
              {minhasTurmas.map((turma, idx) => (
                <option key={turma.id} value={idx}>{turma.cursoTitulo} — {turma.nomeTurma}</option>
              ))}
            </select>
          </div>
        </div>
        <Botao variante="primario" onClick={() => setModalAberto(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}
          variants={{ hover: { y: -1 } }} whileHover="hover"
        >
          <motion.span variants={{ hover: { rotate: 90 } }} transition={{ type: "spring", stiffness: 400, damping: 18 }} style={{ display: "flex" }}>
            <TbPlus size={20} aria-hidden="true" />
          </motion.span>
          Novo Conteúdo
        </Botao>
      </header>

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

      <div
        className="carrossel-cursos__janela"
        onTouchStart={(e) => setTouchInicioXProf(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchInicioXProf === null) return;
          const dx = e.changedTouches[0].clientX - touchInicioXProf;
          if (dx > 50 && slideAtual > 0) setSlideAtual((i) => i - 1);
          if (dx < -50 && slideAtual < minhasTurmas.length - 1) setSlideAtual((i) => i + 1);
          setTouchInicioXProf(null);
        }}
      >
        <SlideCursoProfessor
          turma={minhasTurmas[slideAtual]}
          tipo={usuario?.tipo}
          onNovoConteudo={(modulo = null) => { setModuloModal(modulo); setModalAberto(true); }}
          onAbrirQuiz={abrirModalQuiz}
          onExcluirQuiz={excluirTodoQuiz}
          onExcluirConteudo={excluirConteudo}
          conteudosExtras={conteudosLocais}
          conteudosExcluidos={conteudosExcluidos}
        />
      </div>

      {/* Modal de gestão de quiz por módulo */}
      {modalQuizModulo && createPortal(
        <Modal
          titulo={`Quiz — ${modalQuizModulo.titulo}`}
          onFechar={fecharModalQuiz}
        >
          <div className="quiz-mgmt">
            {formQuestao === null ? (
              <>
                <button type="button" className="quiz-mgmt__voltar" onClick={fecharModalQuiz}>
                  <TbArrowLeft size={16} aria-hidden="true" /> Voltar
                </button>
                {questoesDb.filter((q) => q.moduloId === modalQuizModulo.id).length === 0 ? (
                  <p className="quiz-mgmt__vazio">Nenhuma questão cadastrada para este módulo.</p>
                ) : (
                  <ul className="quiz-mgmt__lista" role="list">
                    {questoesDb.filter((q) => q.moduloId === modalQuizModulo.id).map((q, i) => (
                      <li key={q.id} className="quiz-mgmt__item">
                        <span className="quiz-mgmt__num">Q{i + 1}</span>
                        <span className="quiz-mgmt__enunciado">{q.titulo || q.enunciado}</span>
                        <span className="quiz-mgmt__gabarito">Gabarito: <strong>{q.gabarito}</strong></span>
                        <button
                          type="button"
                          className="quiz-mgmt__editar"
                          onClick={() => editarQuestao(q)}
                          aria-label={`Editar questão ${i + 1}`}
                          data-tooltip="Editar"
                        >
                          <motion.span whileHover={{ scale: 1.25, rotate: -12 }} transition={{ type: "spring", stiffness: 400, damping: 18 }} style={{ display: "flex" }}><TbPencil size={16} aria-hidden="true" /></motion.span>
                        </button>
                        <button
                          type="button"
                          className="quiz-mgmt__excluir"
                          onClick={() => excluirQuestao(q.id)}
                          aria-label={`Excluir questão ${i + 1}`}
                          data-tooltip="Excluir"
                        >
                          <TbTrash size={16} aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="modal-rodape">
                  <Botao variante="secundario" onClick={() => setFormQuestao({ ...FORM_VAZIO })} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <TbPlus size={16} aria-hidden="true" /> Nova questão
                  </Botao>
                  {questoesDb.filter((q) => q.moduloId === modalQuizModulo.id).length > 0 && (
                    <Botao variante="primario" onClick={salvarQuiz} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <MdSave size={16} aria-hidden="true" /> Salvar Quiz
                    </Botao>
                  )}
                </div>
              </>
            ) : (
              <form className="quiz-mgmt__form formulario-modal" onSubmit={salvarQuestao} noValidate>
                <button
                  type="button"
                  className="quiz-mgmt__voltar"
                  onClick={() => setFormQuestao(null)}
                >
                  <TbArrowLeft size={16} aria-hidden="true" />
                  Voltar
                </button>
                <div className="campo">
                  <label className="campo__rotulo" htmlFor="qz-titulo">Título *</label>
                  <input
                    id="qz-titulo"
                    className="campo__entrada"
                    type="text"
                    required
                    placeholder="Ex: Conceitos de POO"
                    value={formQuestao.titulo}
                    onChange={(e) => setFormQuestao((p) => ({ ...p, titulo: e.target.value }))}
                  />
                </div>
                <div className="campo">
                  <label className="campo__rotulo" htmlFor="qz-enunciado">Enunciado *</label>
                  <textarea
                    id="qz-enunciado"
                    className="campo__entrada"
                    rows={3}
                    required
                    value={formQuestao.enunciado}
                    onChange={(e) => setFormQuestao((p) => ({ ...p, enunciado: e.target.value }))}
                  />
                </div>
                {["a", "b", "c", "d", "e"].map((letra) => (
                  <div className="campo" key={letra}>
                    <label className="campo__rotulo" htmlFor={`qz-alt-${letra}`}>
                      Alternativa {letra.toUpperCase()} *
                    </label>
                    <input
                      id={`qz-alt-${letra}`}
                      className="campo__entrada"
                      type="text"
                      required
                      value={formQuestao[letra]}
                      onChange={(e) => setFormQuestao((p) => ({ ...p, [letra]: e.target.value }))}
                    />
                  </div>
                ))}
                <div className="campo">
                  <span className="campo__rotulo">Resposta correta *</span>
                  <div className="quiz-gabarito-opcoes" role="group" aria-label="Selecione a resposta correta">
                    {["A", "B", "C", "D", "E"].map((letra) => (
                      <button
                        key={letra}
                        type="button"
                        className={`quiz-gabarito-btn${formQuestao.gabarito === letra ? " quiz-gabarito-btn--ativo" : ""}`}
                        onClick={() => setFormQuestao((p) => ({ ...p, gabarito: letra }))}
                        aria-pressed={formQuestao.gabarito === letra}
                      >
                        {letra}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="modal-rodape">
                  <Botao
                    variante="primario"
                    type="submit"
                    disabled={
                      !formQuestao.titulo ||
                      !formQuestao.enunciado ||
                      !formQuestao.a || !formQuestao.b || !formQuestao.c || !formQuestao.d || !formQuestao.e ||
                      !formQuestao.gabarito
                    }
                  >
                    Salvar questão
                  </Botao>
                </div>
              </form>
            )}
          </div>
        </Modal>,
        document.body
      )}

      {confirmarFechar && createPortal(
        <Modal titulo="Sair mesmo assim?" onFechar={() => setConfirmarFechar(false)}>
          <div className="modal-matricula-vitrine">
            <p className="modal-matricula-vitrine__info">
              Se você sair agora, as questões que ainda não foram salvas serão <strong>perdidas</strong>.
            </p>
            <div className="modal-rodape">
              <Botao variante="perigo" onClick={() => setConfirmarFechar(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <TbX size={16} aria-hidden="true" /> Cancelar
              </Botao>
              <Botao variante="primario" onClick={fecharModalQuiz} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <TbCheck size={16} aria-hidden="true" /> Sair
              </Botao>
            </div>
          </div>
        </Modal>,
        document.body
      )}

      {/* Portal para modal — evita conflito de stacking context com o transform do carrossel */}
      {modalAberto && createPortal(
        <Modal
          titulo={moduloModal ? `Novo Conteúdo — ${moduloModal.titulo}` : "Novo Conteúdo"}
          onFechar={() => { setModalAberto(false); setModuloModal(null); setTipoContProf(null); }}
        >
          {(() => {
            const tipoAtual   = tipoContProf;
            const configAtual = TIPO_CONFIG[tipoAtual];
            const IconeAtual  = configAtual?.Icone ?? null;
            const moduloSelecionado = modulosDaTurmaAtual.find((m) => m.id === moduloIdProf);

            return (
              <form
                className="formulario-modal"
                onSubmit={(e) => { e.preventDefault(); criarConteudo(); }}
                noValidate
              >
                {/* Preview do ícone */}
                <div className="novo-cont__preview">
                  <AnimatePresence mode="wait">
                    {IconeAtual ? (
                      <motion.span
                        key={tipoAtual}
                        className="novo-cont__icone"
                        initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      >
                        <IconeAtual size={32} aria-hidden="true" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="vazio"
                        className="novo-cont__icone novo-cont__icone--vazio"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <TbFile size={32} aria-hidden="true" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <p className="novo-cont__preview-label">
                    {configAtual ? configAtual.rotulo : "Selecione o tipo"}
                  </p>
                </div>

                {/* Seletor de tipo — clips de anexo */}
                <div className="campo">
                  <p className="campo__rotulo" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <TbPaperclip size={14} aria-hidden="true" /> Tipo de Anexo *
                  </p>
                  <div className="anexo-selector" role="group" aria-label="Tipo de conteúdo">
                    {Object.entries(TIPO_CONFIG).map(([valor, cfg]) => {
                      const Ic    = cfg.Icone;
                      const ativo = tipoContProf === valor;
                      return (
                        <button
                          key={valor}
                          type="button"
                          className={`anexo-clip${ativo ? " anexo-clip--ativo" : ""}`}
                          onClick={() => setTipoContProf(valor)}
                          aria-pressed={ativo}
                        >
                          <span className="anexo-clip__icone">
                            <Ic size={22} aria-hidden="true" />
                          </span>
                          <span className="anexo-clip__label">{cfg.rotulo}</span>
                          {ativo && <span className="anexo-clip__check" aria-hidden="true">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {tipoContProf && (
                    <motion.div
                      key={tipoContProf}
                      className="campo"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                    >
                      {(() => {
                        const ANEXO_CONFIG = {
                          Video:     { label: "Anexar Vídeo",     accept: "video/*,.mp4,.mov,.avi", placeholder: "Clique para selecionar o vídeo" },
                          Texto:     { label: "Anexar Texto",     accept: ".txt,.md,.html,.docx",   placeholder: "Clique para selecionar o arquivo de texto" },
                          Documento: { label: "Anexar Documento", accept: ".pdf,.doc,.docx,.ppt,.pptx", placeholder: "Clique para selecionar o documento" },
                        };
                        const cfg = ANEXO_CONFIG[tipoContProf];
                        return (
                          <>
                            <p className="campo__rotulo" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                              <TbUpload size={14} aria-hidden="true" /> {cfg.label}
                            </p>
                            <label htmlFor="anexo-cont" className="anexo-upload">
                              <TbUpload size={20} aria-hidden="true" />
                              <span>{anexoContProf || cfg.placeholder}</span>
                              <input
                                id="anexo-cont"
                                type="file"
                                accept={cfg.accept}
                                style={{ display: "none" }}
                                onChange={(e) => setAnexoContProf(e.target.files?.[0]?.name ?? "")}
                              />
                            </label>
                          </>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="campo">
                  <label className="campo__rotulo" htmlFor="titulo-cont-prof">Título *</label>
                  <input
                    id="titulo-cont-prof"
                    className="campo__entrada"
                    type="text"
                    placeholder="Ex: Introdução ao módulo"
                    value={tituloContProf}
                    onChange={(e) => setTituloContProf(e.target.value)}
                    required
                  />
                </div>

                <div className="campo">
                  <label className="campo__rotulo" htmlFor="modulo-cont-prof">Módulo *</label>
                  <SelectSimples
                    id="modulo-cont-prof"
                    value={moduloIdProf ?? ""}
                    opcoes={modulosDaTurmaAtual.map((m) => ({ valor: m.id, rotulo: m.titulo }))}
                    onChange={(val) => setModuloIdProf(Number(val))}
                    placeholder="Selecione um módulo"
                    required
                  />
                </div>

                <div className="novo-cont__separador">
                  <span>Quiz</span>
                </div>

                <div className="novo-cont__quiz-acao">
                  <div>
                    <p className="novo-cont__quiz-desc">
                      {moduloSelecionado
                        ? `Adicionar quiz ao módulo "${moduloSelecionado.titulo}"`
                        : "Selecione um módulo para criar o quiz"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="cartao-conteudo__quiz-btn"
                    disabled={!moduloSelecionado}
                    onClick={() => { criarConteudo(); if (moduloSelecionado) abrirModalQuiz(moduloSelecionado); }}
                    style={{ opacity: moduloSelecionado ? 1 : 0.4, cursor: moduloSelecionado ? "pointer" : "not-allowed", margin: 0 }}
                  >
                    <span style={{ position: "relative", display: "inline-flex" }}>
                      <TbBrain size={20} aria-hidden="true" />
                      <span aria-hidden="true" style={{
                        position: "absolute", top: -4, right: -5,
                        background: "#fff", color: "#7c3aed",
                        borderRadius: "50%", width: 13, height: 13,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 0 0 1.5px #7c3aed"
                      }}><MdAdd size={10} /></span>
                    </span> Criar Quiz
                  </button>
                </div>

                <footer className="modal-rodape">
                  <Botao variante="perigo" type="button" onClick={() => { setModalAberto(false); setModuloModal(null); setTipoContProf(null); setTituloContProf(""); }} style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
                    <TbX size={15} aria-hidden="true" /> Cancelar
                  </Botao>
                  <Botao variante="primario" type="submit" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <TbPlus size={15} aria-hidden="true" /> Criar Conteúdo
                  </Botao>
                </footer>
              </form>
            );
          })()}
        </Modal>,
        document.body
      )}
    </div>
  );
}

/* ── Vista do aluno — carrossel de cursos ────────────────────── */

function VistaAluno({ usuario, quizzesAprovados = new Set(), onQuizAprovado, onMudarSecao, onConteudoConcluido, conteudosConcluidos, onAlternarConclusao }) {
  const matriculasAprovadas = matriculas.filter(
    (m) => m.alunoId === usuario?.id && m.status === "Aprovada"
  );

  const [slideAtual, setSlideAtual] = useState(0);
  const [touchInicioX, setTouchInicioX] = useState(null);

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
        <SlideConteudoCurso
          matricula={matriculasAprovadas[slideAtual]}
          quizzesAprovados={quizzesAprovados}
          onQuizAprovado={onQuizAprovado}
          onMudarSecao={onMudarSecao}
          onConteudoConcluido={onConteudoConcluido}
          conteudosConcluidos={conteudosConcluidos}
          onAlternarConclusao={onAlternarConclusao}
          ativo={true}
        />
      </div>
    </div>
  );
}

/* ── Slide de um curso (visão da gestão) ─────────────────────── */

function SlideCursoGestao({ curso, tipo }) {
  const [modulosAbertos, setModulosAbertos]         = useState(() => new Set());
  const [menuConteudoAberto, setMenuConteudoAberto] = useState(null);

  useEffect(() => {
    if (!menuConteudoAberto) return;
    function fechar() { setMenuConteudoAberto(null); }
    document.addEventListener("click", fechar);
    return () => document.removeEventListener("click", fechar);
  }, [menuConteudoAberto]);

  const modulosDoCurso = modulos
    .filter((m) => m.cursoId === curso.id)
    .sort((a, b) => a.ordem - b.ordem);

  const totalAlunos = turmas
    .filter((t) => t.cursoId === curso.id)
    .reduce((soma, t) => soma + t.totalAlunos, 0);

  const conteudosDoCurso = conteudos.filter((c) =>
    modulosDoCurso.some((m) => m.id === c.moduloId)
  );

  /* Sugestão 2 — resumo de tipos para o cabeçalho do curso */
  const totalPorTipo = {};
  for (const c of conteudosDoCurso) {
    totalPorTipo[c.tipo] = (totalPorTipo[c.tipo] ?? 0) + 1;
  }
  const resumoCursoItens = ["Video", "Texto", "Documento"].filter((t) => totalPorTipo[t]);

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
          <span className="conteudos-aluno__curso-etiqueta" aria-hidden="true">Curso</span>
          <h2 className="conteudos-aluno__curso-titulo">{curso.titulo}</h2>
          <p className="conteudos-aluno__curso-meta" style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            {totalAlunos} aluno{totalAlunos !== 1 ? "s" : ""} · {conteudosDoCurso.length} conteúdo{conteudosDoCurso.length !== 1 ? "s" : ""}
            {resumoCursoItens.length > 0 && (
              <>
                <span aria-hidden="true" style={{ opacity: 0.4 }}>·</span>
                {resumoCursoItens.map((t, i) => {
                  const { Icone, rotulo } = TIPO_CONFIG[t];
                  const n = totalPorTipo[t];
                  return (
                    <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                      {i > 0 && <span aria-hidden="true" style={{ opacity: 0.4 }}>·</span>}
                      <Icone size={14} aria-hidden="true" />
                      {n} {rotulo.toLowerCase()}{n !== 1 ? "s" : ""}
                    </span>
                  );
                })}
              </>
            )}
          </p>
        </div>
      </header>

      {modulosDoCurso.length === 0 ? (
        <p className="texto-vazio" role="status">Nenhum módulo cadastrado neste curso.</p>
      ) : modulosDoCurso.map((modulo) => {
        const itens      = conteudosDoCurso.filter((c) => c.moduloId === modulo.id);
        const estaAberto = modulosAbertos.has(modulo.id);
        const vazio      = itens.length === 0;

        /* Sugestão 1 — contagem de tipos por módulo */
        const contagemTipos = {};
        for (const c of itens) {
          contagemTipos[c.tipo] = (contagemTipos[c.tipo] ?? 0) + 1;
        }
        const resumoModuloItens = ["Video", "Texto", "Documento"].filter((t) => contagemTipos[t]);

        return (
          /* Sugestão 3 — módulo sempre visível; apagado quando vazio */
          <section
            key={modulo.id}
            className="conteudos-modulo"
            style={vazio ? { opacity: 0.5 } : undefined}
          >
            <header className="conteudos-modulo__cabecalho">
              <h3 className="conteudos-modulo__cabecalho-wrapper">
                <button
                  className="conteudos-modulo__toggle"
                  onClick={() => !vazio && alternarModulo(modulo.id)}
                  aria-expanded={vazio ? undefined : estaAberto}
                  style={vazio ? { cursor: "default" } : undefined}
                  type="button"
                >
                  <div className="conteudos-modulo__info">
                    <span className="conteudos-modulo__titulo">{modulo.ordem}. {modulo.titulo}</span>
                    {/* Sugestão 1 — resumo de tipos ou badge "Sem conteúdo" */}
                    <span className="conteudos-modulo__contagem" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      {vazio ? "Sem conteúdo" : resumoModuloItens.map((t, i) => {
                        const { Icone } = TIPO_CONFIG[t];
                        return (
                          <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                            {i > 0 && <span aria-hidden="true" style={{ opacity: 0.4 }}>·</span>}
                            <Icone size={16} aria-hidden="true" />
                            {contagemTipos[t]}
                          </span>
                        );
                      })}
                    </span>
                  </div>
                  {!vazio && (
                    <span
                      className={`conteudos-modulo__chevron ${estaAberto ? "conteudos-modulo__chevron--aberto" : ""}`}
                      aria-hidden="true"
                    >▾</span>
                  )}
                </button>
              </h3>
            </header>

            {!vazio && estaAberto && (
              <ul className="lista-conteudos-completa conteudos-modulo__lista" role="list">
                {itens.map((cont) => {
                  const config = TIPO_CONFIG[cont.tipo] || { icone: "◈", rotulo: cont.tipo };
                  return (
                    <li key={cont.id} className="cartao-conteudo">
                      <button
                        type="button"
                        className="cartao-conteudo__icone-btn"
                        aria-label={`Visualizar ${config.rotulo}: ${cont.titulo}`}
                        data-tooltip={`Ver ${config.rotulo}`}
                        onClick={() => {}}
                      >
                        {(() => { const Ic = config.Icone ?? IconePadrao; return <Ic size={18} aria-hidden="true" />; })()}
                      </button>
                      <div className="cartao-conteudo__info">
                        <h4 className="cartao-conteudo__titulo">{cont.titulo}</h4>
                        <p className="cartao-conteudo__modulo">{config.rotulo} · {cont.duracao}</p>
                      </div>

                      {podeEditar(tipo, "conteudos") && (
                        <div className="menu-contexto">
                          <button
                            className="menu-contexto__botao"
                            type="button"
                            aria-label={`Opções para ${cont.titulo}`}
                            onClick={(e) => { e.stopPropagation(); setMenuConteudoAberto(menuConteudoAberto === cont.id ? null : cont.id); }}
                          >
                            <TbDotsVertical size={18} aria-hidden="true" />
                          </button>
                          {menuConteudoAberto === cont.id && (
                            <ul className="menu-contexto__lista" role="menu">
                              <li><button type="button" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={() => setMenuConteudoAberto(null)}><TbSettings size={20} aria-hidden="true" />Opções</button></li>
                              <li><button type="button" className="menu-item--perigo" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={() => setMenuConteudoAberto(null)}><TbTrash size={20} aria-hidden="true" />Excluir</button></li>
                            </ul>
                          )}
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

/* ── Vista de gestão (admin, coordenador) ────────────────────── */

function VistaGestao({ usuario }) {
  const [slideAtual, setSlideAtual] = useState(0);

  const tipo  = usuario?.tipo;
  const total = cursos.length;
  const slide = Math.min(slideAtual, Math.max(0, total - 1));
  const cursoAtual = cursos[slide];

  return (
    <div className="tela-conteudos">
      <header className="cabecalho-pagina">
        <div>
          <h1 className="cabecalho-pagina__titulo">Conteúdos Didáticos</h1>
          <p className="cabecalho-pagina__subtitulo">
            {conteudos.length} conteúdo{conteudos.length !== 1 ? "s" : ""} cadastrados na plataforma
          </p>
        </div>
      </header>

      <div className="carrossel-cursos">
        <div className="barra-filtros" style={{ marginBottom: "var(--espaco-md)" }}>
          <label htmlFor="filtro-curso-cont" className="visualmente-oculto">Selecionar curso</label>
          <select
            id="filtro-curso-cont"
            className="campo__entrada barra-filtros__select"
            value={slide}
            onChange={(e) => setSlideAtual(Number(e.target.value))}
            aria-label="Navegar para curso"
          >
            {cursos.map((c, idx) => (
              <option key={c.id} value={idx}>{c.titulo}</option>
            ))}
          </select>
        </div>

        {total > 1 && (
          <nav className="carrossel-cursos__nav" aria-label="Navegação entre cursos">
            <button
              className="carrossel-cursos__seta"
              onClick={() => setSlideAtual((i) => i - 1)}
              disabled={slide === 0}
              aria-label="Curso anterior"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className="carrossel-cursos__indicadores" role="tablist" aria-label="Cursos">
              {cursos.map((c, idx) => (
                <button
                  key={c.id}
                  className={`carrossel-cursos__bolinha${idx === slide ? " carrossel-cursos__bolinha--ativa" : ""}`}
                  onClick={() => setSlideAtual(idx)}
                  role="tab"
                  aria-selected={idx === slide}
                  aria-label={`Curso ${idx + 1}: ${c.titulo}`}
                  type="button"
                />
              ))}
            </div>

            <button
              className="carrossel-cursos__seta"
              onClick={() => setSlideAtual((i) => i + 1)}
              disabled={slide === total - 1}
              aria-label="Próximo curso"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </nav>
        )}

        <div className="carrossel-cursos__janela">
          <SlideCursoGestao curso={cursoAtual} tipo={tipo} />
        </div>
      </div>
    </div>
  );
}

/* ── Componente principal — seleciona a vista pelo perfil ────── */

export default function TelaConteudos({ usuario, quizzesAprovados, onQuizAprovado, onMudarSecao, onConteudoConcluido, conteudosConcluidos, onAlternarConclusao, onToast }) {
  if (usuario?.tipo === "Aluno") {
    return (
      <VistaAluno
        usuario={usuario}
        quizzesAprovados={quizzesAprovados}
        onQuizAprovado={onQuizAprovado}
        onMudarSecao={onMudarSecao}
        onConteudoConcluido={onConteudoConcluido}
        conteudosConcluidos={conteudosConcluidos}
        onAlternarConclusao={onAlternarConclusao}
      />
    );
  }
  if (usuario?.tipo === "Professor") {
    return <VistaProfessor usuario={usuario} onToast={onToast} />;
  }
  return <VistaGestao usuario={usuario} />;
}
