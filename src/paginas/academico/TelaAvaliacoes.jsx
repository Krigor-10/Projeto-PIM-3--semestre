import { useState, useEffect, useRef } from "react";
import Insignia from "../../componentes/Insignia.jsx";
import Modal from "../../componentes/Modal.jsx";
import { avaliacoes, cursos, modulos, matriculas, turmas } from "../../dados/dadosMock.js";
import { questoesQuiz } from "../../dados/questoesQuiz.js";

const LETRAS_GABARITO = ["A", "B", "C", "D", "E"];

/* Número máximo de tentativas permitidas por avaliação */
const LIMITE_TENTATIVAS = 3;

/* ── Helpers ─────────────────────────────────────────────────── */

function novaQuestao() {
  return {
    _id: Date.now() + Math.random(),
    introducaoTeorica: "",
    enunciado: "",
    alternativas: LETRAS_GABARITO.map((l) => ({ letra: l, texto: "" })),
    gabarito: "",
    analiseDasAfirmativas: "",
  };
}

function formVazio() {
  return {
    titulo: "",
    cursoId: "",
    tentativas: 1,
    tempo: 60,
    notaMaxima: 10,
    questoes: [novaQuestao()],
  };
}

function agruparPorCurso(lista) {
  const mapa = new Map();
  lista.forEach((av) => {
    if (!mapa.has(av.cursoId)) {
      mapa.set(av.cursoId, {
        cursoId: av.cursoId,
        cursoTitulo: av.cursoTitulo,
        itens: [],
      });
    }
    mapa.get(av.cursoId).itens.push(av);
  });
  return Array.from(mapa.values());
}

/* Converte segundos em "MM:SS" para exibição no timer */
function formatarTempo(totalSegundos) {
  const min = Math.floor(totalSegundos / 60).toString().padStart(2, "0");
  const seg = (totalSegundos % 60).toString().padStart(2, "0");
  return `${min}:${seg}`;
}

/* ── Confete — partículas decorativas de celebração ─────────── */

function Confete() {
  const CORES = ['#7b2ff7', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#f97316'];
  /* Valores determinísticos por índice — evita reflash em re-renders */
  const pecas = Array.from({ length: 54 }, (_, i) => ({
    id: i,
    cor: CORES[i % CORES.length],
    left: `${((i * 13 + 7) % 97) + 1}%`,
    delay: `${((i * 3) % 10) * 0.09}s`,
    duracao: `${1 + (i % 5) * 0.18}s`,
    tamanho: `${6 + (i % 4) * 2}px`,
    arredondado: i % 3 === 0,
  }));

  return (
    <div className="confete" aria-hidden="true">
      {pecas.map((p) => (
        <span
          key={p.id}
          className="confete__peca"
          style={{
            left: p.left,
            background: p.cor,
            animationDelay: p.delay,
            animationDuration: p.duracao,
            width: p.tamanho,
            height: p.tamanho,
            borderRadius: p.arredondado ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

/* ── Quiz embutido ───────────────────────────────────────────── */

function QuizEmbutido({ avaliacao, onConcluir }) {
  /* Prototipo: usa questoesQuiz como banco de questões da avaliação
     Em produção, viriam de avaliacao.questoes via API */
  const questoes = questoesQuiz;
  const totalQuestoes = questoes.length;

  const [indice, setIndice] = useState(0);
  const [selecionada, setSelecionada] = useState(null);
  const [confirmada, setConfirmada] = useState(false);
  const [respostas, setRespostas] = useState([]);
  const [apoioAberto, setApoioAberto] = useState(true);
  const [segundos, setSegundos] = useState(avaliacao.tempoLimiteMinutos * 60);

  /* Ref mantém as respostas atuais acessíveis dentro do callback do timer
     sem precisar recriar o intervalo a cada render */
  const respostasRef = useRef([]);
  const finalizado = useRef(false);

  const questao = questoes[indice];
  const tempoEsgotando = segundos <= 60 && segundos > 0;

  /* Timer: decrementa a cada segundo e finaliza ao zerar */
  useEffect(() => {
    const intervalo = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) {
          clearInterval(intervalo);
          finalizarAvaliacao(respostasRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  function confirmarResposta() {
    if (!selecionada) return;
    const correta = questao.anulada ? true : selecionada === questao.gabarito;
    const novasRespostas = [
      ...respostas,
      { id: questao.id, resposta: selecionada, correta },
    ];
    setRespostas(novasRespostas);
    respostasRef.current = novasRespostas;
    setConfirmada(true);
  }

  function avancarQuestao() {
    if (indice + 1 < totalQuestoes) {
      setIndice((i) => i + 1);
      setSelecionada(null);
      setConfirmada(false);
      setApoioAberto(true);
    } else {
      finalizarAvaliacao(respostasRef.current);
    }
  }

  function finalizarAvaliacao(respostasFinais) {
    /* Garante que onConcluir seja chamado apenas uma vez
       mesmo se timer e botão "Ver resultado" dispararem juntos */
    if (finalizado.current) return;
    finalizado.current = true;

    /* Conta respostas corretas (questões anuladas contam como corretas) */
    const acertos = respostasFinais.filter((r) => r.correta).length;
    /* Percentual de acerto = acertos / total × 100, arredondado para inteiro */
    const porcentagem = Math.round((acertos / totalQuestoes) * 100);
    /* Nota proporcional à nota máxima da avaliação, com 1 casa decimal */
    const nota = parseFloat(
      ((acertos / totalQuestoes) * avaliacao.notaMaxima).toFixed(1)
    );
    onConcluir({ acertos, total: totalQuestoes, porcentagem, nota });
  }

  return (
    <section className="quiz-embutido" aria-labelledby="quiz-avaliacao-titulo">
      <header className="quiz-cabecalho">
        <div className="quiz-embutido__info">
          <h2 className="quiz-embutido__titulo" id="quiz-avaliacao-titulo">
            {avaliacao.titulo}
          </h2>
          <p className="quiz-embutido__curso">{avaliacao.cursoTitulo}</p>
        </div>

        <div className="quiz-progresso">
          <span className="quiz-progresso__texto">
            Questão {indice + 1} de {totalQuestoes}
          </span>
          <div
            className="quiz-progresso__barra"
            role="progressbar"
            aria-valuenow={indice + 1}
            aria-valuemin={1}
            aria-valuemax={totalQuestoes}
            aria-label={`Questão ${indice + 1} de ${totalQuestoes}`}
          >
            <div
              className="quiz-progresso__fill"
              style={{ width: `${((indice + 1) / totalQuestoes) * 100}%` }}
            />
          </div>
        </div>

        {/* Timer: fica vermelho quando restam menos de 60 segundos */}
        <time
          className={`quiz-timer${tempoEsgotando ? " quiz-timer--urgente" : ""}`}
          aria-live="polite"
          aria-label={`Tempo restante: ${formatarTempo(segundos)}`}
          dateTime={`PT${segundos}S`}
        >
          {formatarTempo(segundos)}
        </time>
      </header>

      <div className="quiz-corpo">
        {/* Texto de apoio teórico colapsável */}
        <section className="quiz-apoio">
          <button
            className="quiz-apoio__toggle"
            onClick={() => setApoioAberto((v) => !v)}
            aria-expanded={apoioAberto}
            aria-controls="quiz-apoio-conteudo"
            type="button"
          >
            <span>Texto de apoio</span>
            <span className="quiz-apoio__chevron" aria-hidden="true">
              {apoioAberto ? "▲" : "▼"}
            </span>
          </button>
          {apoioAberto && (
            <div className="quiz-apoio__conteudo" id="quiz-apoio-conteudo">
              {questao.introducaoTeorica.split("\n\n").map((bloco, i) => (
                <p key={i}>{bloco}</p>
              ))}
            </div>
          )}
        </section>

        <section className="quiz-enunciado" aria-labelledby="enunciado-titulo">
          <h3 className="quiz-enunciado__titulo" id="enunciado-titulo">
            Enunciado
          </h3>
          <div className="quiz-enunciado__texto">
            {questao.enunciado.split("\n\n").map((bloco, i) => (
              <p key={i}>{bloco}</p>
            ))}
          </div>
        </section>

        <fieldset className="quiz-alternativas" disabled={confirmada}>
          <legend className="visualmente-oculto">
            Alternativas da questão {indice + 1}
          </legend>
          {questao.alternativas.map((alt) => {
            /* Determina modificador visual: correta, errada ou selecionada */
            let modificador = "";
            if (confirmada) {
              if (alt.letra === questao.gabarito)
                modificador = "quiz-alternativa--correta";
              else if (alt.letra === selecionada)
                modificador = "quiz-alternativa--errada";
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
                <span className="quiz-alternativa__letra" aria-hidden="true">
                  {alt.letra}
                </span>
                <span className="quiz-alternativa__texto">{alt.texto}</span>
              </button>
            );
          })}
        </fieldset>

        {!confirmada && (
          <div className="quiz-acoes">
            <button
              className="botao botao--primario botao--grande"
              onClick={confirmarResposta}
              disabled={!selecionada}
              type="button"
            >
              Confirmar resposta
            </button>
          </div>
        )}

        {confirmada && (
          <section className="quiz-feedback" aria-live="polite">
            <div
              className={`quiz-feedback__cabecalho quiz-feedback__cabecalho--${
                selecionada === questao.gabarito || questao.anulada
                  ? "certo"
                  : "errado"
              }`}
            >
              <span className="quiz-feedback__icone" aria-hidden="true">
                {selecionada === questao.gabarito || questao.anulada
                  ? "✓"
                  : "✗"}
              </span>
              <strong>
                {questao.anulada
                  ? "Questão anulada — ponto garantido"
                  : selecionada === questao.gabarito
                  ? "Resposta correta!"
                  : `Incorreto — gabarito: ${questao.gabarito}`}
              </strong>
            </div>
            <div className="quiz-feedback__analise">
              <h4 className="quiz-feedback__analise-titulo">
                Análise das afirmativas
              </h4>
              {questao.analiseDasAfirmativas.split("\n\n").map((bloco, i) => (
                <p key={i}>{bloco}</p>
              ))}
            </div>
            <div className="quiz-acoes">
              <button
                className="botao botao--primario botao--grande"
                onClick={avancarQuestao}
                type="button"
              >
                {indice + 1 < totalQuestoes
                  ? "Próxima questão"
                  : "Ver resultado"}
              </button>
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

/* ── Resultado da avaliação ──────────────────────────────────── */

function ResultadoAvaliacao({ avaliacao, resultado, tentativasUsadas, onVoltar, onRefazer, onMudarSecao }) {
  const aprovado = resultado.porcentagem >= 70;
  const podeRefazer = tentativasUsadas < LIMITE_TENTATIVAS;

  return (
    <section
      className={`quiz-resultado quiz-resultado--${aprovado ? "aprovado" : "reprovado"}`}
      aria-labelledby="resultado-avaliacao-titulo"
    >
      {/* Celebração animada — visível somente quando aprovado */}
      {aprovado && (
        <div className="celebracao-certificado">
          <Confete />
          <span className="celebracao-certificado__icone" aria-hidden="true">◈</span>
          <h2 className="celebracao-certificado__titulo">Certificado Desbloqueado!</h2>
          <p className="celebracao-certificado__desc">
            Você concluiu o curso com <strong>{resultado.porcentagem}%</strong> de aproveitamento.
          </p>
          <button
            className="botao botao--primario botao--grande celebracao-certificado__botao"
            onClick={() => onMudarSecao?.("certificados")}
            type="button"
          >
            <span aria-hidden="true">◈</span> Ver meu Certificado
          </button>
        </div>
      )}

      <div className="quiz-resultado__icone" aria-hidden="true">
        {aprovado ? "✓" : "✗"}
      </div>

      <h2
        className="quiz-resultado__titulo"
        id="resultado-avaliacao-titulo"
      >
        {aprovado ? "Parabéns! Você foi aprovado!" : "Continue praticando!"}
      </h2>

      <p className="quiz-resultado__placar">
        {resultado.acertos} de {resultado.total} questões corretas
      </p>

      {/* Barra de aproveitamento */}
      <div
        className="quiz-resultado__barra-wrap"
        role="progressbar"
        aria-valuenow={resultado.porcentagem}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Aproveitamento: ${resultado.porcentagem}%`}
      >
        <div
          className="quiz-resultado__barra"
          style={{ width: `${resultado.porcentagem}%` }}
        />
      </div>
      <p className="quiz-resultado__porcentagem">{resultado.porcentagem}%</p>

      {/* Resumo de notas */}
      <dl className="quiz-resultado__notas">
        <div className="quiz-resultado__nota-item">
          <dt>Nota obtida</dt>
          <dd>
            <strong>{resultado.nota}</strong> / {avaliacao.notaMaxima}
          </dd>
        </div>
        <div className="quiz-resultado__nota-item">
          <dt>Aproveitamento</dt>
          <dd>
            <strong>{resultado.porcentagem}%</strong>
          </dd>
        </div>
        <div className="quiz-resultado__nota-item">
          <dt>Mínimo para aprovação</dt>
          <dd>70%</dd>
        </div>
      </dl>

      <footer className="quiz-resultado__acoes">
        <button
          className="botao botao--fantasma"
          onClick={onVoltar}
          type="button"
        >
          Voltar às avaliações
        </button>
        {/* Exibe contador de tentativas e botão de refazer se ainda houver saldo */}
        <span className="resultado-tentativas">
          {tentativasUsadas} / {LIMITE_TENTATIVAS} tentativas usadas
        </span>
        {aprovado ? (
          <button
            className="botao botao--primario"
            onClick={() => onMudarSecao?.("progresso")}
            type="button"
          >
            Ver Certificado
          </button>
        ) : podeRefazer ? (
          <button
            className="botao botao--secundario"
            onClick={onRefazer}
            type="button"
          >
            Refazer avaliação
          </button>
        ) : (
          <span className="resultado-tentativas resultado-tentativas--esgotadas">
            Limite de tentativas atingido
          </span>
        )}
      </footer>
    </section>
  );
}

/* ── Formulário de criação (professores e admins) ────────────── */

function FormularioCriarAvaliacao({ onCancelar, onSalvar, cursosDisponiveis }) {
  const [form, setForm] = useState(formVazio);

  function atualizarMeta(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function adicionarQuestao() {
    setForm((f) => ({ ...f, questoes: [...f.questoes, novaQuestao()] }));
  }

  function removerQuestao(id) {
    setForm((f) => ({
      ...f,
      questoes: f.questoes.filter((q) => q._id !== id),
    }));
  }

  function atualizarQuestao(id, campo, valor) {
    setForm((f) => ({
      ...f,
      questoes: f.questoes.map((q) =>
        q._id === id ? { ...q, [campo]: valor } : q
      ),
    }));
  }

  function atualizarAlternativa(questaoId, letra, valor) {
    setForm((f) => ({
      ...f,
      questoes: f.questoes.map((q) =>
        q._id === questaoId
          ? {
              ...q,
              alternativas: q.alternativas.map((a) =>
                a.letra === letra ? { ...a, texto: valor } : a
              ),
            }
          : q
      ),
    }));
  }

  function salvarAvaliacao(e, status) {
    e.preventDefault();
    onSalvar({ ...form, status });
  }

  return (
    <div className="criar-avaliacao">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Nova Avaliação</h2>
          <p className="cabecalho-pagina__subtitulo">
            Preencha os dados e as questões da prova
          </p>
        </div>
        <button
          className="botao botao--fantasma"
          onClick={onCancelar}
          type="button"
        >
          Cancelar
        </button>
      </header>

      <form onSubmit={(e) => salvarAvaliacao(e, "Publicada")} noValidate>
        <section className="criar-avaliacao__secao">
          <h3 className="criar-avaliacao__secao-titulo">Dados gerais</h3>
          <div className="criar-avaliacao__secao-corpo">
            <div className="campo">
              <label className="campo__rotulo" htmlFor="av-titulo">
                Título da avaliação *
              </label>
              <input
                id="av-titulo"
                className="campo__entrada"
                type="text"
                placeholder="Ex: Prova 1 — Fundamentos de HTML"
                value={form.titulo}
                onChange={(e) => atualizarMeta("titulo", e.target.value)}
                required
              />
            </div>

            <div className="campo">
              <label className="campo__rotulo" htmlFor="av-curso">
                Curso *
              </label>
              <select
                id="av-curso"
                className="campo__entrada"
                value={form.cursoId}
                onChange={(e) => atualizarMeta("cursoId", e.target.value)}
                required
              >
                <option value="">Selecione um curso</option>
                {cursosDisponiveis.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titulo}
                  </option>
                ))}
              </select>
            </div>

            <div className="grade-3">
              <div className="campo">
                <label className="campo__rotulo" htmlFor="av-tentativas">
                  Tentativas permitidas
                </label>
                <input
                  id="av-tentativas"
                  className="campo__entrada"
                  type="number"
                  min="1"
                  max="10"
                  value={form.tentativas}
                  onChange={(e) =>
                    atualizarMeta("tentativas", Number(e.target.value))
                  }
                />
              </div>
              <div className="campo">
                <label className="campo__rotulo" htmlFor="av-tempo">
                  Tempo limite (min)
                </label>
                <input
                  id="av-tempo"
                  className="campo__entrada"
                  type="number"
                  min="5"
                  value={form.tempo}
                  onChange={(e) =>
                    atualizarMeta("tempo", Number(e.target.value))
                  }
                />
              </div>
              <div className="campo">
                <label className="campo__rotulo" htmlFor="av-nota">
                  Nota máxima
                </label>
                <input
                  id="av-nota"
                  className="campo__entrada"
                  type="number"
                  min="1"
                  max="100"
                  value={form.notaMaxima}
                  onChange={(e) =>
                    atualizarMeta("notaMaxima", Number(e.target.value))
                  }
                />
              </div>
            </div>
          </div>
        </section>

        <section className="criar-avaliacao__secao">
          <div className="criar-avaliacao__secao-cabecalho">
            <h3 className="criar-avaliacao__secao-titulo">
              Questões
              <span className="criar-avaliacao__contagem">
                {form.questoes.length}
              </span>
            </h3>
            <button
              className="botao botao--secundario botao--pequeno"
              onClick={adicionarQuestao}
              type="button"
            >
              + Adicionar questão
            </button>
          </div>

          <div className="criar-avaliacao__questoes">
            {form.questoes.map((q, idx) => (
              <article key={q._id} className="questao-editor">
                <header className="questao-editor__cabecalho">
                  <span className="questao-editor__num">
                    Questão {idx + 1}
                  </span>
                  {form.questoes.length > 1 && (
                    <button
                      className="questao-editor__remover"
                      onClick={() => removerQuestao(q._id)}
                      type="button"
                      aria-label={`Remover questão ${idx + 1}`}
                    >
                      Remover
                    </button>
                  )}
                </header>

                <div className="questao-editor__bloco">
                  <label
                    className="questao-editor__rotulo"
                    htmlFor={`q-intro-${q._id}`}
                  >
                    Introdução Teórica
                    <span className="questao-editor__hint">
                      Texto de apoio exibido antes do enunciado
                    </span>
                  </label>
                  <textarea
                    id={`q-intro-${q._id}`}
                    className="campo__entrada questao-editor__textarea questao-editor__textarea--alto"
                    placeholder="Insira os conceitos teóricos que embasam a questão..."
                    value={q.introducaoTeorica}
                    onChange={(e) =>
                      atualizarQuestao(q._id, "introducaoTeorica", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="questao-editor__bloco">
                  <label
                    className="questao-editor__rotulo"
                    htmlFor={`q-enun-${q._id}`}
                  >
                    Enunciado *
                  </label>
                  <textarea
                    id={`q-enun-${q._id}`}
                    className="campo__entrada questao-editor__textarea questao-editor__textarea--medio"
                    placeholder="Digite o enunciado da questão..."
                    value={q.enunciado}
                    onChange={(e) =>
                      atualizarQuestao(q._id, "enunciado", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="questao-editor__bloco">
                  <p className="questao-editor__rotulo">Alternativas *</p>
                  <div className="questao-editor__alternativas">
                    {q.alternativas.map((alt) => (
                      <div
                        key={alt.letra}
                        className="questao-editor__alternativa-linha"
                      >
                        <span className="questao-editor__letra">
                          {alt.letra}
                        </span>
                        <input
                          className="campo__entrada"
                          type="text"
                          placeholder={`Texto da alternativa ${alt.letra}`}
                          value={alt.texto}
                          onChange={(e) =>
                            atualizarAlternativa(q._id, alt.letra, e.target.value)
                          }
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="questao-editor__bloco">
                  <p className="questao-editor__rotulo">Resposta Correta *</p>
                  <div
                    className="questao-editor__gabarito"
                    role="group"
                    aria-label="Selecione a resposta correta"
                  >
                    {LETRAS_GABARITO.map((l) => (
                      <label
                        key={l}
                        className={`questao-editor__opcao-gabarito ${
                          q.gabarito === l
                            ? "questao-editor__opcao-gabarito--ativo"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name={`gabarito-${q._id}`}
                          value={l}
                          checked={q.gabarito === l}
                          onChange={() => atualizarQuestao(q._id, "gabarito", l)}
                          required
                          className="visualmente-oculto"
                        />
                        {l}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="questao-editor__bloco">
                  <label
                    className="questao-editor__rotulo"
                    htmlFor={`q-analise-${q._id}`}
                  >
                    Análise das Questões *
                    <span className="questao-editor__hint">
                      Justificativa de cada alternativa exibida após a resposta
                    </span>
                  </label>
                  <textarea
                    id={`q-analise-${q._id}`}
                    className="campo__entrada questao-editor__textarea questao-editor__textarea--alto"
                    placeholder="Explique por que cada alternativa está correta ou incorreta..."
                    value={q.analiseDasAfirmativas}
                    onChange={(e) =>
                      atualizarQuestao(
                        q._id,
                        "analiseDasAfirmativas",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="criar-avaliacao__rodape">
          <button
            className="botao botao--fantasma"
            onClick={onCancelar}
            type="button"
          >
            Cancelar
          </button>
          <div className="criar-avaliacao__rodape-direita">
            <button
              className="botao botao--secundario"
              type="button"
              onClick={(e) => salvarAvaliacao(e, "Rascunho")}
            >
              Salvar rascunho
            </button>
            <button className="botao botao--primario" type="submit">
              Publicar avaliação
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}

/* ── Componente principal ────────────────────────────────────── */

export default function TelaAvaliacoes({ usuario, onMudarSecao, quizzesAprovados = new Set(), onAvaliacaoAprovada, conteudoConcluido = false }) {
  /* modo: "lista" | "criar" | "quiz" | "resultado" */
  const [modo, setModo] = useState("lista");
  const [avaliacaoAtiva, setAvaliacaoAtiva] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("");

  /* Armazena resultados das avaliações realizadas na sessão atual
     Chave: avaliacao.id → { acertos, total, porcentagem, nota } */
  const [resultados, setResultados] = useState({});
  const [resultadoAtual, setResultadoAtual] = useState(null);

  /* Conta quantas tentativas o aluno usou por avaliação na sessão */
  const [tentativas, setTentativas] = useState({});

  const ehAluno    = usuario?.tipo === "Aluno";
  const ehProfessor = usuario?.tipo === "Professor";

  /* Cursos nos quais o professor ministra aulas (via turmas) */
  const cursosIdsProfessor = ehProfessor
    ? new Set(turmas.filter((t) => t.professorId === usuario.id).map((t) => t.cursoId))
    : null;

  /* Lista de cursos filtrada para o professor usar no form e no filtro */
  const cursosDisponiveis = ehProfessor
    ? cursos.filter((c) => cursosIdsProfessor.has(c.id))
    : cursos;

  /* Busca a matrícula aprovada do aluno para filtrar avaliações do seu curso */
  const matriculaAluno = ehAluno
    ? matriculas.find(
        (m) => m.alunoId === usuario?.id && m.status === "Aprovada"
      )
    : null;

  /* Módulos do curso do aluno — usados apenas para o banner informativo */
  const modulosDoCursoAluno = ehAluno && matriculaAluno
    ? modulos.filter((m) => m.cursoId === matriculaAluno.cursoId)
    : [];

  /* Avaliação final liberada quando todo o conteúdo do curso foi concluído */
  const avaliacaoLiberada = !ehAluno || conteudoConcluido;

  /* ── Modos especiais ── */

  if (modo === "criar") {
    return (
      <FormularioCriarAvaliacao
        onCancelar={() => setModo("lista")}
        onSalvar={() => setModo("lista")}
        cursosDisponiveis={cursosDisponiveis}
      />
    );
  }

  if (modo === "quiz" && avaliacaoAtiva) {
    return (
      <QuizEmbutido
        avaliacao={avaliacaoAtiva}
        onConcluir={(resultado) => {
          /* Persiste resultado e incrementa o contador de tentativas desta avaliação */
          setResultados((prev) => ({ ...prev, [avaliacaoAtiva.id]: resultado }));
          setTentativas((prev) => ({
            ...prev,
            [avaliacaoAtiva.id]: (prev[avaliacaoAtiva.id] || 0) + 1,
          }));
          setResultadoAtual(resultado);
          /* Libera o certificado passando nota e aproveitamento para exibição no progresso */
          if (resultado.porcentagem >= 70) onAvaliacaoAprovada?.({
            porcentagem: resultado.porcentagem,
            nota: resultado.nota,
            notaMaxima: avaliacaoAtiva.notaMaxima,
          });
          setModo("resultado");
        }}
      />
    );
  }

  if (modo === "resultado" && avaliacaoAtiva && resultadoAtual) {
    const tentativasUsadas = tentativas[avaliacaoAtiva.id] || 0;
    return (
      <ResultadoAvaliacao
        avaliacao={avaliacaoAtiva}
        resultado={resultadoAtual}
        tentativasUsadas={tentativasUsadas}
        onVoltar={() => {
          setModo("lista");
          setResultadoAtual(null);
        }}
        onRefazer={() => setModo("quiz")}
        onMudarSecao={onMudarSecao}
      />
    );
  }

  /* ── Filtragem ── */

  const avaliacoesFiltradas = avaliacoes.filter((a) => {
    /* Aluno só vê avaliações publicadas do seu curso matriculado */
    if (ehAluno && a.status !== "Publicada") return false;
    if (ehAluno && matriculaAluno && a.cursoId !== matriculaAluno.cursoId) return false;
    /* Professor só vê avaliações dos cursos em que ministra aulas */
    if (ehProfessor && !cursosIdsProfessor.has(a.cursoId)) return false;
    if (filtroStatus && a.status !== filtroStatus) return false;
    if (filtroCurso && String(a.cursoId) !== filtroCurso) return false;
    return true;
  });

  const grupos = agruparPorCurso(avaliacoesFiltradas);

  function abrirDetalhes(av) {
    setAvaliacaoAtiva(av);
    setModalAberto(true);
  }

  function iniciarAvaliacao(av) {
    setAvaliacaoAtiva(av);
    setModo("quiz");
  }

  /* Retorna o badge de status de realização para o aluno */
  function badgeRealizacao(avaliacaoId) {
    const resultado = resultados[avaliacaoId];
    if (!resultado) return <Insignia texto="Não realizada" variante="neutro" />;
    return resultado.porcentagem >= 70 ? (
      <Insignia texto={`Aprovado ${resultado.porcentagem}%`} variante="sucesso" />
    ) : (
      <Insignia texto={`Reprovado ${resultado.porcentagem}%`} variante="erro" />
    );
  }

  return (
    <div className="tela-avaliacoes">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Avaliações</h2>
          <p className="cabecalho-pagina__subtitulo">
            {avaliacoesFiltradas.length} avaliação
            {avaliacoesFiltradas.length !== 1 ? "ões" : ""} encontrada
            {avaliacoesFiltradas.length !== 1 ? "s" : ""}
          </p>
        </div>
        {!ehAluno && (
          <button
            className="botao botao--primario"
            onClick={() => setModo("criar")}
            type="button"
          >
            + Nova Avaliação
          </button>
        )}
      </header>

      {/* Filtros visíveis apenas para não-alunos */}
      {!ehAluno && (
        <div className="barra-filtros" role="search" aria-label="Filtros de avaliação">
          <label htmlFor="filtro-curso-av" className="visualmente-oculto">
            Filtrar por curso
          </label>
          <select
            id="filtro-curso-av"
            className="campo__entrada barra-filtros__select"
            value={filtroCurso}
            onChange={(e) => setFiltroCurso(e.target.value)}
          >
            <option value="">Todos os cursos</option>
            {cursosDisponiveis.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.titulo}
              </option>
            ))}
          </select>

          <label htmlFor="filtro-status-av" className="visualmente-oculto">
            Filtrar por status
          </label>
          <select
            id="filtro-status-av"
            className="campo__entrada barra-filtros__select"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="Publicada">Publicada</option>
            <option value="Rascunho">Rascunho</option>
          </select>
        </div>
      )}

      {/* Alerta de bloqueio: conteúdo do curso ainda não foi totalmente concluído */}
      {ehAluno && !avaliacaoLiberada && (
        <div className="aviso-bloqueio" role="alert">
          <span className="aviso-bloqueio__icone" aria-hidden="true">⊘</span>
          <div className="aviso-bloqueio__texto">
            <strong>Avaliação bloqueada</strong>
            <p>Conclua todos os conteúdos do curso para liberar a avaliação final.</p>
          </div>
        </div>
      )}

      {grupos.length === 0 && (
        <p className="texto-vazio texto-vazio--central" role="status">
          Nenhuma avaliação encontrada.
        </p>
      )}

      {grupos.map((grupo) => (
        <section
          key={grupo.cursoId}
          className="avaliacoes-grupo"
          aria-labelledby={`curso-${grupo.cursoId}`}
        >
          <h3
            className="avaliacoes-grupo__titulo"
            id={`curso-${grupo.cursoId}`}
          >
            <span className="avaliacoes-grupo__icone" aria-hidden="true">
              📚
            </span>
            {grupo.cursoTitulo}
            <span className="avaliacoes-grupo__contagem">
              {grupo.itens.length}
            </span>
          </h3>

          <ul
            className="grade-avaliacoes"
            role="list"
            aria-label={`Avaliações de ${grupo.cursoTitulo}`}
          >
            {grupo.itens.map((av) => {
              const jaRealizada = Boolean(resultados[av.id]);
              const tentativasUsadas = tentativas[av.id] || 0;
              const limiteAtingido = tentativasUsadas >= LIMITE_TENTATIVAS;

              return (
                <li key={av.id}>
                  <article
                    className="cartao-avaliacao"
                    aria-labelledby={`av-titulo-${av.id}`}
                  >
                    <header className="cartao-avaliacao__cabecalho">
                      <h4
                        className="cartao-avaliacao__titulo"
                        id={`av-titulo-${av.id}`}
                      >
                        {av.titulo}
                      </h4>
                      {/* Aluno vê status de realização; outros veem status de publicação */}
                      {ehAluno
                        ? badgeRealizacao(av.id)
                        : <Insignia texto={av.status} />}
                    </header>

                    <dl className="cartao-avaliacao__meta">
                      <div>
                        <dt>Questões</dt>
                        <dd>{av.totalQuestoes}</dd>
                      </div>
                      <div>
                        <dt>Tentativas</dt>
                        <dd>{av.tentativasPermitidas}</dd>
                      </div>
                      <div>
                        <dt>Tempo</dt>
                        <dd>{av.tempoLimiteMinutos}min</dd>
                      </div>
                      <div>
                        <dt>Nota máx.</dt>
                        <dd>{av.notaMaxima}</dd>
                      </div>
                    </dl>

                    <footer className="cartao-avaliacao__rodape">
                      <button
                        className="botao botao--fantasma botao--pequeno"
                        onClick={() => abrirDetalhes(av)}
                        type="button"
                        aria-label={`Ver detalhes de ${av.titulo}`}
                      >
                        Detalhes
                      </button>
                      {ehAluno && (
                        !avaliacaoLiberada ? (
                          <span className="resultado-tentativas resultado-tentativas--esgotadas">
                            Bloqueado
                          </span>
                        ) : limiteAtingido ? (
                          /* Exibe tentativas esgotadas sem botão clicável */
                          <span className="resultado-tentativas resultado-tentativas--esgotadas">
                            {LIMITE_TENTATIVAS}/{LIMITE_TENTATIVAS} tentativas
                          </span>
                        ) : (
                          <button
                            className={`botao botao--pequeno ${jaRealizada ? "botao--secundario" : "botao--primario"}`}
                            onClick={() => iniciarAvaliacao(av)}
                            type="button"
                            aria-label={`${jaRealizada ? "Refazer" : "Iniciar"} ${av.titulo} — tentativa ${tentativasUsadas + 1} de ${LIMITE_TENTATIVAS}`}
                          >
                            {jaRealizada
                              ? `Refazer (${tentativasUsadas}/${LIMITE_TENTATIVAS})`
                              : "Iniciar"}
                          </button>
                        )
                      )}
                    </footer>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {/* Modal de detalhes */}
      {modalAberto && avaliacaoAtiva && (
        <Modal
          titulo="Detalhes da Avaliação"
          onFechar={() => setModalAberto(false)}
        >
          <dl className="lista-detalhes">
            <div className="lista-detalhes__item">
              <dt>Título</dt>
              <dd>{avaliacaoAtiva.titulo}</dd>
            </div>
            <div className="lista-detalhes__item">
              <dt>Curso</dt>
              <dd>{avaliacaoAtiva.cursoTitulo}</dd>
            </div>
            <div className="lista-detalhes__item">
              <dt>Total de questões</dt>
              <dd>{avaliacaoAtiva.totalQuestoes}</dd>
            </div>
            <div className="lista-detalhes__item">
              <dt>Tentativas permitidas</dt>
              <dd>{avaliacaoAtiva.tentativasPermitidas}</dd>
            </div>
            <div className="lista-detalhes__item">
              <dt>Tempo limite</dt>
              <dd>{avaliacaoAtiva.tempoLimiteMinutos} minutos</dd>
            </div>
            <div className="lista-detalhes__item">
              <dt>Nota máxima</dt>
              <dd>{avaliacaoAtiva.notaMaxima}</dd>
            </div>
            <div className="lista-detalhes__item">
              <dt>Status</dt>
              <dd>
                <Insignia texto={avaliacaoAtiva.status} />
              </dd>
            </div>
            {resultados[avaliacaoAtiva.id] && (
              <div className="lista-detalhes__item">
                <dt>Sua nota</dt>
                <dd>
                  <strong>{resultados[avaliacaoAtiva.id].nota}</strong> /{" "}
                  {avaliacaoAtiva.notaMaxima} (
                  {resultados[avaliacaoAtiva.id].porcentagem}%)
                </dd>
              </div>
            )}
          </dl>
          <footer className="modal-rodape">
            <button
              className="botao botao--fantasma"
              onClick={() => setModalAberto(false)}
              type="button"
            >
              Fechar
            </button>
            {ehAluno && avaliacaoLiberada && (
              <button
                className="botao botao--primario"
                onClick={() => {
                  setModalAberto(false);
                  iniciarAvaliacao(avaliacaoAtiva);
                }}
                type="button"
              >
                {resultados[avaliacaoAtiva.id] ? "Refazer" : "Iniciar avaliação"}
              </button>
            )}
            {!ehAluno && (
              <button className="botao botao--primario" type="button">
                Editar
              </button>
            )}
          </footer>
        </Modal>
      )}
    </div>
  );
}
