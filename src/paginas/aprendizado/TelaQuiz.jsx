/* ============================================================
   TelaQuiz — Quiz de múltipla escolha baseado no material CQA
   Máquina de estados com 3 fases: inicio → questao → resultado
   Questões importadas de dadosMock/questoesQuiz.js (banco estático).
   Suporta navegação bidirecional e questões anuladas.
   ============================================================ */
import { useState } from "react";
import { TbArrowLeft } from "react-icons/tb";
import Botao from "@/componentes/Botao.jsx";
import { motion } from "framer-motion";
import { questoesQuiz } from "@/dados/questoesQuiz.js";

const TOTAL = questoesQuiz.length;

export default function TelaQuiz({ usuario, onMudarSecao }) {
  /* fase controla qual tela renderizar: "inicio" | "questao" | "resultado" */
  const [fase, setFase] = useState("inicio");
  const [indice, setIndice] = useState(0);
  const [selecionada, setSelecionada] = useState(null);
  /* confirmada = true após o aluno confirmar a resposta; bloqueia as alternativas */
  const [confirmada, setConfirmada] = useState(false);
  /* respostas acumula { id, resposta, correta } para cada questão respondida */
  const [respostas, setRespostas] = useState([]);
  /* apoioAberto controla a visibilidade do texto teórico colapsável */
  const [apoioAberto, setApoioAberto] = useState(true);

  const questao = questoesQuiz[indice];

  function iniciar() {
    setFase("questao");
    setIndice(0);
    setSelecionada(null);
    setConfirmada(false);
    setRespostas([]);
    setApoioAberto(true);
  }

  function confirmar() {
    if (!selecionada) return;
    /* Questões anuladas são sempre contadas como corretas */
    const correta = questao.anulada ? true : selecionada === questao.gabarito;
    setRespostas((prev) => [...prev, { id: questao.id, resposta: selecionada, correta }]);
    setConfirmada(true);
  }

  function voltarQuestao() {
    const idx = indice - 1;
    /* Restaura a resposta já dada para a questão anterior */
    const anterior = respostas.find((r) => r.id === questoesQuiz[idx].id);
    setIndice(idx);
    setSelecionada(anterior?.resposta ?? null);
    setConfirmada(true); /* exibe o feedback da resposta anterior */
    setApoioAberto(false);
  }

  function avancar() {
    const proxIdx = indice + 1;
    if (proxIdx < TOTAL) {
      /* Permite rever questões já respondidas sem perder a resposta */
      const jaRespondida = respostas.find((r) => r.id === questoesQuiz[proxIdx].id);
      setIndice(proxIdx);
      setSelecionada(jaRespondida?.resposta ?? null);
      setConfirmada(!!jaRespondida);
      setApoioAberto(true);
    } else {
      setFase("resultado");
    }
  }

  const acertos = respostas.filter((r) => r.correta).length;
  const porcentagem = Math.round((acertos / TOTAL) * 100);

  /* ── Fase: tela inicial com instruções ── */
  if (fase === "inicio") {
    return (
      <div className="tela-quiz">
        <div className="quiz-inicio">
          <div className="quiz-inicio__icone" aria-hidden="true">?</div>
          <h2 className="quiz-inicio__titulo">Quiz — Material CQA</h2>
          <p className="quiz-inicio__descricao">
            Teste seus conhecimentos com questões de Análise e Desenvolvimento de Sistemas
            baseadas no material oficial da UNIP.
          </p>
          <ul className="quiz-inicio__info" aria-label="Informações do quiz">
            <li><span className="quiz-inicio__info-rotulo">Questões</span><strong>{TOTAL}</strong></li>
            <li><span className="quiz-inicio__info-rotulo">Formato</span><strong>Múltipla escolha</strong></li>
            <li><span className="quiz-inicio__info-rotulo">Feedback</span><strong>Imediato</strong></li>
          </ul>
          <div className="quiz-inicio__acoes">
            <Botao
              variante="fantasma"
              onClick={() => onMudarSecao("avaliacoes")}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <TbArrowLeft size={16} aria-hidden="true" />
              Voltar
            </Botao>
            <motion.div
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              style={{ display: "inline-block" }}
            >
              {/* setTimeout de 150ms para a animação de tap terminar antes de mudar de tela */}
              <Botao
                variante="primario"
                tamanho="grande"
                onClick={() => setTimeout(iniciar, 150)}
              >
                Iniciar Quiz
              </Botao>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Fase: tela de resultado com gabarito completo ── */
  if (fase === "resultado") {
    const nivel = porcentagem >= 70 ? "aprovado" : "reprovado";
    return (
      <div className="tela-quiz">
        <div className={`quiz-resultado quiz-resultado--${nivel}`}>
          <div className="quiz-resultado__icone" aria-hidden="true">
            {porcentagem >= 70 ? "✓" : "✗"}
          </div>
          <h2 className="quiz-resultado__titulo">
            {porcentagem >= 70 ? "Parabéns!" : "Continue praticando!"}
          </h2>
          <p className="quiz-resultado__placar">
            {acertos} de {TOTAL} corretas
          </p>
          <div className="quiz-resultado__barra-wrap" role="progressbar" aria-valuenow={porcentagem} aria-valuemin={0} aria-valuemax={100}>
            <div className="quiz-resultado__barra" style={{ width: `${porcentagem}%` }} />
          </div>
          <p className="quiz-resultado__porcentagem">{porcentagem}%</p>

          {/* Lista todas as questões com a resposta do aluno e o gabarito */}
          <ul className="quiz-resultado__lista" aria-label="Resumo das respostas">
            {questoesQuiz.map((q, i) => {
              const r = respostas[i];
              return (
                <li key={q.id} className={`quiz-resultado__item quiz-resultado__item--${r?.correta ? "certo" : "errado"}`}>
                  <span className="quiz-resultado__item-num">Q{i + 1}</span>
                  <span className="quiz-resultado__item-tema">{q.tema}</span>
                  <span className="quiz-resultado__item-resp">
                    Sua resposta: <strong>{r?.resposta ?? "—"}</strong>
                    {!q.anulada && (
                      <> · Gabarito: <strong>{q.gabarito}</strong></>
                    )}
                    {q.anulada && <> · <em>Anulada</em></>}
                  </span>
                  <span className="quiz-resultado__item-status" aria-label={r?.correta ? "Correta" : "Incorreta"}>
                    {r?.correta ? "✓" : "✗"}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="quiz-resultado__acoes">
            <Botao
              variante="fantasma"
              onClick={() => onMudarSecao("avaliacoes")}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <TbArrowLeft size={16} aria-hidden="true" />
              Voltar às avaliações
            </Botao>
            <Botao
              variante="primario"
              onClick={iniciar}
            >
              Refazer quiz
            </Botao>
          </div>
        </div>
      </div>
    );
  }

  /* ── Fase: questão ativa ── */
  return (
    <div className="tela-quiz">
      <header className="quiz-cabecalho">
        <div className="quiz-progresso">
          <span className="quiz-progresso__texto">
            Questão {indice + 1} de {TOTAL}
          </span>
          <div
            className="quiz-progresso__barra"
            role="progressbar"
            aria-valuenow={indice + 1}
            aria-valuemin={1}
            aria-valuemax={TOTAL}
          >
            <div
              className="quiz-progresso__fill"
              style={{ width: `${((indice + 1) / TOTAL) * 100}%` }}
            />
          </div>
        </div>
        <span className="quiz-tema">{questao.tema}</span>
      </header>

      <div className="quiz-corpo">
        {/* Texto de apoio teórico colapsável — ajuda o aluno a contextualizar a questão */}
        <section className="quiz-apoio">
          <button
            className="quiz-apoio__toggle"
            onClick={() => setApoioAberto((v) => !v)}
            aria-expanded={apoioAberto}
            type="button"
          >
            <span>Texto de apoio</span>
            <span className="quiz-apoio__chevron" aria-hidden="true">{apoioAberto ? "▲" : "▼"}</span>
          </button>
          {apoioAberto && (
            <div className="quiz-apoio__conteudo">
              {questao.introducaoTeorica.split("\n\n").map((bloco, i) => (
                <p key={i}>{bloco}</p>
              ))}
            </div>
          )}
        </section>

        <section className="quiz-enunciado" aria-labelledby="enunciado-titulo">
          <h3 className="quiz-enunciado__titulo" id="enunciado-titulo">Enunciado</h3>
          <div className="quiz-enunciado__texto">
            {questao.enunciado.split("\n\n").map((bloco, i) => (
              <p key={i}>{bloco}</p>
            ))}
          </div>
        </section>

        {/* fieldset desabilitado após confirmar para impedir troca de resposta */}
        <fieldset className="quiz-alternativas" disabled={confirmada}>
          <legend className="visualmente-oculto">Alternativas</legend>
          {questao.alternativas.map((alt) => {
            /* Após confirmar: verde = gabarito, vermelho = errada selecionada */
            let modificador = "";
            if (confirmada) {
              if (alt.letra === questao.gabarito) modificador = "quiz-alternativa--correta";
              else if (alt.letra === selecionada) modificador = "quiz-alternativa--errada";
            } else if (alt.letra === selecionada) {
              modificador = "quiz-alternativa--selecionada";
            }
            return (
              <button
                key={alt.letra}
                type="button"
                className={`quiz-alternativa ${modificador}`}
                onClick={() => !confirmada && setSelecionada(alt.letra)}
                aria-pressed={selecionada === alt.letra}
              >
                <span className="quiz-alternativa__letra" aria-hidden="true">{alt.letra}</span>
                <span className="quiz-alternativa__texto">{alt.texto}</span>
              </button>
            );
          })}
        </fieldset>

        <div className="quiz-acoes">
          {!confirmada && (
            <Botao
              variante="primario"
              tamanho="grande"
              onClick={confirmar}
              disabled={!selecionada}
            >
              Confirmar resposta
            </Botao>
          )}
          {confirmada && (
            <>
              {/* Anterior só aparece após a 1ª questão */}
              {indice > 0 && (
                <Botao
                  variante="fantasma"
                  tamanho="grande"
                  onClick={voltarQuestao}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <TbArrowLeft size={16} aria-hidden="true" />
                  Anterior
                </Botao>
              )}
              <Botao variante="primario" tamanho="grande" onClick={avancar}>
                {indice + 1 < TOTAL ? "Próxima questão →" : "Ver resultado"}
              </Botao>
            </>
          )}
        </div>

        {/* Feedback detalhado com análise das afirmativas — exibido após confirmar */}
        {confirmada && (
          <section className="quiz-feedback" aria-live="polite">
            <div className={`quiz-feedback__cabecalho quiz-feedback__cabecalho--${selecionada === questao.gabarito || questao.anulada ? "certo" : "errado"}`}>
              <span className="quiz-feedback__icone" aria-hidden="true">
                {selecionada === questao.gabarito || questao.anulada ? "✓" : "✗"}
              </span>
              <strong>
                {questao.anulada
                  ? "Questão anulada"
                  : selecionada === questao.gabarito
                  ? "Resposta correta!"
                  : `Incorreto — gabarito: ${questao.gabarito}`}
              </strong>
            </div>
            <div className="quiz-feedback__analise">
              <h4 className="quiz-feedback__analise-titulo">Análise das afirmativas</h4>
              {questao.analiseDasAfirmativas.split("\n\n").map((bloco, i) => (
                <p key={i}>{bloco}</p>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
