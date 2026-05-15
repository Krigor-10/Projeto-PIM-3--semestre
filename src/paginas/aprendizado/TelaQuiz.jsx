import { useState } from "react";
import Botao from "@/componentes/Botao.jsx";
import { questoesQuiz } from "@/dados/questoesQuiz.js";

const TOTAL = questoesQuiz.length;

export default function TelaQuiz({ usuario, onMudarSecao }) {
  const [fase, setFase] = useState("inicio");
  const [indice, setIndice] = useState(0);
  const [selecionada, setSelecionada] = useState(null);
  const [confirmada, setConfirmada] = useState(false);
  const [respostas, setRespostas] = useState([]);
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
    const correta = questao.anulada ? true : selecionada === questao.gabarito;
    setRespostas((prev) => [...prev, { id: questao.id, resposta: selecionada, correta }]);
    setConfirmada(true);
  }

  function avancar() {
    if (indice + 1 < TOTAL) {
      setIndice((i) => i + 1);
      setSelecionada(null);
      setConfirmada(false);
      setApoioAberto(true);
    } else {
      setFase("resultado");
    }
  }

  const acertos = respostas.filter((r) => r.correta).length;
  const porcentagem = Math.round((acertos / TOTAL) * 100);

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
            >
              Voltar
            </Botao>
            <Botao
              variante="primario"
              tamanho="grande"
              onClick={iniciar}
            >
              Iniciar Quiz
            </Botao>
          </div>
        </div>
      </div>
    );
  }

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
            >
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

        <fieldset className="quiz-alternativas" disabled={confirmada}>
          <legend className="visualmente-oculto">Alternativas</legend>
          {questao.alternativas.map((alt) => {
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

        {!confirmada && (
          <div className="quiz-acoes">
            <Botao
              variante="primario"
              tamanho="grande"
              onClick={confirmar}
              disabled={!selecionada}
            >
              Confirmar resposta
            </Botao>
          </div>
        )}

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
            <div className="quiz-acoes">
              <Botao
                variante="primario"
                tamanho="grande"
                onClick={avancar}
              >
                {indice + 1 < TOTAL ? "Próxima questão" : "Ver resultado"}
              </Botao>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
