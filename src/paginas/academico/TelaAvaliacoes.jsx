import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { TbDotsVertical, TbClock, TbLock, TbPlus, TbX, TbCheck, TbPencil, TbSettings } from "react-icons/tb";
import { motion } from "framer-motion";
import { MdSave, MdDelete } from "react-icons/md";
import Insignia from "@/componentes/Insignia.jsx";
import Modal from "@/componentes/Modal.jsx";
import Botao from "@/componentes/Botao.jsx";
import SelectSimples from "@/componentes/SelectSimples.jsx";
import { avaliacoes, cursos, modulos, matriculas, turmas } from "@/dados/dadosMock.js";
import { questoesQuiz } from "@/dados/questoesQuiz.js";
import fundoCertificado from "@/ativos/certificado-fundo.png";

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
  /* true quando o aluno navegou de volta a uma questão já respondida e ainda há perguntas sem resposta */
  const eRevisando = indice < respostas.length && respostas.length < totalQuestoes;

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
    /* Sempre avança para a próxima questão SEM resposta (não necessariamente indice+1) */
    const proxIndice = respostas.length;
    if (proxIndice < totalQuestoes) {
      setIndice(proxIndice);
      setSelecionada(null);
      setConfirmada(false);
      setApoioAberto(true);
    } else {
      finalizarAvaliacao(respostasRef.current);
    }
  }

  function navegarParaQuestao(idx) {
    const podeNavegar = idx <= respostas.length;
    if (!podeNavegar) return;
    const respostaExistente = respostas.find((r) => r.id === questoes[idx].id);
    setIndice(idx);
    if (respostaExistente) {
      setSelecionada(respostaExistente.resposta);
      setConfirmada(true);
    } else {
      setSelecionada(null);
      setConfirmada(false);
    }
    setApoioAberto(false);
  }

  function finalizarAvaliacao(respostasFinais) {
    /* Garante que onConcluir seja chamado apenas uma vez
       mesmo se timer e botão "
       " dispararem juntos */
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
        <div className="quiz-cabecalho__topo">
          <div className="quiz-embutido__info">
            <h2 className="quiz-embutido__titulo" id="quiz-avaliacao-titulo">
              {avaliacao.titulo}
            </h2>
            <p className="quiz-embutido__curso">{avaliacao.cursoTitulo}</p>
          </div>
          <time
            className={`quiz-timer${tempoEsgotando ? " quiz-timer--urgente" : ""}`}
            aria-live="polite"
            aria-label={`Tempo restante: ${formatarTempo(segundos)}`}
            dateTime={`PT${segundos}S`}
          >
            <TbClock size={16} aria-hidden="true" />
            {formatarTempo(segundos)}
          </time>
        </div>

        <div className="quiz-cabecalho__steps">
          <span className="quiz-cabecalho__contador">
            Questão {indice + 1} de {totalQuestoes}
          </span>
          <nav className="quiz-steps" aria-label="Progresso do quiz">
            {questoes.map((q, idx) => {
              const resposta = respostas.find((r) => r.id === q.id);
              const eAtual = idx === indice;
              let estado = idx > respostas.length ? "pendente" : "atual";
              if (resposta) estado = resposta.correta ? "correta" : "errada";
              return (
                <button
                  key={q.id}
                  type="button"
                  className={`quiz-step quiz-step--${estado}${eAtual ? " quiz-step--ativo" : ""}`}
                  onClick={() => navegarParaQuestao(idx)}
                  disabled={idx > respostas.length}
                  aria-label={`Questão ${idx + 1}${resposta ? (resposta.correta ? " — correta" : " — errada") : eAtual ? " — atual" : " — pendente"}`}
                  aria-current={eAtual ? "step" : undefined}
                >
                  {idx + 1}
                </button>
              );
            })}
          </nav>
        </div>
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

        {!confirmada && !eRevisando && (
          <div className="quiz-acoes">
            <Botao
              variante="primario"
              tamanho="grande"
              onClick={confirmarResposta}
              disabled={!selecionada}
            >
              Confirmar resposta
            </Botao>
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
              <Botao variante="primario" tamanho="grande" onClick={avancarQuestao}>
                {respostas.length < totalQuestoes
                  ? "Próxima questão"
                  : "Ver resultado"}
              </Botao>
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

/* ── Impressão isolada do certificado ───────────────────────── */

function imprimirCertificado(src) {
  document.documentElement.dataset.imprimindoCertificado = "true";

  const el = document.createElement("div");
  el.id = "cert-print-temp";
  const img = document.createElement("img");
  img.src = src;
  img.alt = "Certificado de conclusão";
  el.appendChild(img);
  document.body.appendChild(el);

  function cleanup() {
    delete document.documentElement.dataset.imprimindoCertificado;
    if (document.body.contains(el)) document.body.removeChild(el);
    window.removeEventListener("afterprint", cleanup);
  }
  window.addEventListener("afterprint", cleanup);
  window.print();
}

/* ── Resultado da avaliação ──────────────────────────────────── */

function ResultadoAvaliacao({ avaliacao, resultado, tentativasUsadas, onVoltar, onRefazer, onMudarSecao }) {
  const aprovado = resultado.porcentagem >= 70;
  const podeRefazer = tentativasUsadas < LIMITE_TENTATIVAS;
  const [certificadoAberto, setCertificadoAberto] = useState(false);

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
          <Botao
            variante="primario"
            tamanho="grande"
            className="celebracao-certificado__botao"
            onClick={() => onMudarSecao?.("certificados")}
          >
            <span aria-hidden="true">◈</span> Ver meu Certificado
          </Botao>
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
        <Botao
          variante="fantasma"
          onClick={onVoltar}
        >
          Voltar às avaliações
        </Botao>
        {/* Exibe contador de tentativas e botão de refazer se ainda houver saldo */}
        <span className="resultado-tentativas">
          {tentativasUsadas} / {LIMITE_TENTATIVAS} tentativas usadas
        </span>
        {aprovado ? (
          <Botao
            variante="primario"
            onClick={() => setCertificadoAberto(true)}
          >
            Visualizar Certificado
          </Botao>
        ) : podeRefazer ? (
          <Botao
            variante="secundario"
            onClick={onRefazer}
          >
            Refazer avaliação
          </Botao>
        ) : (
          <span className="resultado-tentativas resultado-tentativas--esgotadas">
            Limite de tentativas atingido
          </span>
        )}
      </footer>

      {certificadoAberto && (
        <Modal titulo="Certificado de Conclusão" onFechar={() => setCertificadoAberto(false)} className="modal-caixa--certificado">
          <figure className="certificado-modal">
            <img
              src={fundoCertificado}
              alt={`Certificado de conclusão — ${avaliacao.titulo}`}
              className="certificado-modal__imagem"
              width="860"
              height="609"
            />
          </figure>
          <footer className="modal-rodape">
            <Botao variante="fantasma" onClick={() => setCertificadoAberto(false)}>
              Fechar
            </Botao>
            <Botao variante="primario" onClick={() => imprimirCertificado(fundoCertificado)}>
              Baixar / Imprimir
            </Botao>
          </footer>
        </Modal>
      )}
    </section>
  );
}

/* ── Formulário de criação (professores e admins) ────────────── */

function FormularioCriarAvaliacao({ onCancelar, onSalvar, cursosDisponiveis }) {
  const [form, setForm] = useState(formVazio);
  const [confirmarCancelar, setConfirmarCancelar] = useState(false);
  const [stepAtivo, setStepAtivo] = useState("geral");

  function atualizarMeta(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function adicionarQuestao() {
    const nova = novaQuestao();
    setForm((f) => ({ ...f, questoes: [...f.questoes, nova] }));
    setStepAtivo(nova._id);
  }

  function removerQuestao(id) {
    const novas = form.questoes.filter((q) => q._id !== id);
    setForm((f) => ({ ...f, questoes: novas }));
    if (stepAtivo === id) {
      const idx = form.questoes.findIndex((q) => q._id === id);
      setStepAtivo(novas.length > 0 ? novas[Math.max(0, idx - 1)]._id : "geral");
    }
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
          ? { ...q, alternativas: q.alternativas.map((a) => a.letra === letra ? { ...a, texto: valor } : a) }
          : q
      ),
    }));
  }

  function salvarAvaliacao(e, status) {
    e.preventDefault();
    onSalvar({ ...form, status });
  }

  const questaoAtiva = stepAtivo !== "geral"
    ? form.questoes.find((q) => q._id === stepAtivo)
    : null;
  const idxAtivo = questaoAtiva ? form.questoes.indexOf(questaoAtiva) : -1;

  return (
    <div className="criar-avaliacao">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Nova Avaliação</h2>
          <p className="cabecalho-pagina__subtitulo">
            Preencha os dados e as questões da prova
          </p>
        </div>
        <Botao variante="perigo" onClick={() => setConfirmarCancelar(true)}>
          Cancelar
        </Botao>
      </header>

      <form onSubmit={(e) => salvarAvaliacao(e, "Publicada")} noValidate>
        <div className="criar-avaliacao__layout">

          {/* ── Barra de steps ─────────────────────────────── */}
          <aside className="criar-avaliacao__steps">
            <button
              type="button"
              className={`criar-avaliacao__step${stepAtivo === "geral" ? " criar-avaliacao__step--ativo" : ""}`}
              onClick={() => setStepAtivo("geral")}
            >
              <span className="criar-avaliacao__step-icone">
                {stepAtivo === "geral" ? "●" : "○"}
              </span>
              Dados Gerais
            </button>

            {form.questoes.length > 0 && (
              <div className="criar-avaliacao__step-divisor">
                <span>Questões</span>
                <span className="criar-avaliacao__contagem">{form.questoes.length}</span>
              </div>
            )}

            {form.questoes.map((q, idx) => (
              <button
                key={q._id}
                type="button"
                className={`criar-avaliacao__step criar-avaliacao__step--questao${stepAtivo === q._id ? " criar-avaliacao__step--ativo" : ""}`}
                onClick={() => setStepAtivo(q._id)}
                aria-label={`Ir para questão ${idx + 1}`}
              >
                <span className="criar-avaliacao__step-num">{idx + 1}</span>
                <span className="criar-avaliacao__step-label">Questão {idx + 1}</span>
              </button>
            ))}

            <button
              type="button"
              className="criar-avaliacao__step criar-avaliacao__step--adicionar"
              onClick={adicionarQuestao}
            >
              <span className="criar-avaliacao__step-num criar-avaliacao__step-num--mais">+</span>
              Adicionar questão
            </button>
          </aside>

          {/* ── Painel do step ativo ────────────────────────── */}
          <div className="criar-avaliacao__painel">
            {stepAtivo === "geral" ? (
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
                    <SelectSimples
                      id="av-curso"
                      value={form.cursoId}
                      opcoes={cursosDisponiveis.map((c) => ({ valor: c.id, rotulo: c.titulo }))}
                      onChange={(val) => atualizarMeta("cursoId", val)}
                      placeholder="Selecione um curso"
                      required
                    />
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
                        onChange={(e) => atualizarMeta("tentativas", Number(e.target.value))}
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
                        onChange={(e) => atualizarMeta("tempo", Number(e.target.value))}
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
                        onChange={(e) => atualizarMeta("notaMaxima", Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </section>
            ) : questaoAtiva ? (
              <article className="questao-editor">
                <header className="questao-editor__cabecalho">
                  <div className="questao-editor__nav">
                    <button
                      type="button"
                      className="questao-editor__seta"
                      disabled={idxAtivo === 0}
                      onClick={() => setStepAtivo(form.questoes[idxAtivo - 1]._id)}
                      aria-label="Questão anterior"
                    >
                      ‹
                    </button>
                    <span className="questao-editor__num">
                      Questão {idxAtivo + 1}
                      <span className="questao-editor__total"> de {form.questoes.length}</span>
                    </span>
                    <button
                      type="button"
                      className="questao-editor__seta"
                      disabled={idxAtivo === form.questoes.length - 1}
                      onClick={() => setStepAtivo(form.questoes[idxAtivo + 1]._id)}
                      aria-label="Próxima questão"
                    >
                      ›
                    </button>
                  </div>
                  <button
                    type="button"
                    className="questao-editor__remover"
                    onClick={() => removerQuestao(questaoAtiva._id)}
                    aria-label="Remover esta questão"
                  >
                    Remover
                  </button>
                </header>

                <div className="questao-editor__bloco">
                  <label className="questao-editor__rotulo" htmlFor={`q-intro-${questaoAtiva._id}`}>
                    Introdução Teórica
                    <span className="questao-editor__hint">Texto de apoio exibido antes do enunciado</span>
                  </label>
                  <textarea
                    id={`q-intro-${questaoAtiva._id}`}
                    className="campo__entrada questao-editor__textarea questao-editor__textarea--alto"
                    placeholder="Insira os conceitos teóricos que embasam a questão..."
                    value={questaoAtiva.introducaoTeorica}
                    onChange={(e) => atualizarQuestao(questaoAtiva._id, "introducaoTeorica", e.target.value)}
                    required
                  />
                </div>

                <div className="questao-editor__bloco">
                  <label className="questao-editor__rotulo" htmlFor={`q-enun-${questaoAtiva._id}`}>
                    Enunciado *
                  </label>
                  <textarea
                    id={`q-enun-${questaoAtiva._id}`}
                    className="campo__entrada questao-editor__textarea questao-editor__textarea--medio"
                    placeholder="Digite o enunciado da questão..."
                    value={questaoAtiva.enunciado}
                    onChange={(e) => atualizarQuestao(questaoAtiva._id, "enunciado", e.target.value)}
                    required
                  />
                </div>

                <div className="questao-editor__bloco">
                  <p className="questao-editor__rotulo">Alternativas *</p>
                  <div className="questao-editor__alternativas">
                    {questaoAtiva.alternativas.map((alt) => (
                      <div key={alt.letra} className="questao-editor__alternativa-linha">
                        <span className="questao-editor__letra">{alt.letra}</span>
                        <input
                          className="campo__entrada"
                          type="text"
                          placeholder={`Texto da alternativa ${alt.letra}`}
                          value={alt.texto}
                          onChange={(e) => atualizarAlternativa(questaoAtiva._id, alt.letra, e.target.value)}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="questao-editor__bloco">
                  <p className="questao-editor__rotulo">Resposta Correta *</p>
                  <div className="questao-editor__gabarito" role="group" aria-label="Selecione a resposta correta">
                    {LETRAS_GABARITO.map((l) => (
                      <label
                        key={l}
                        className={`questao-editor__opcao-gabarito${questaoAtiva.gabarito === l ? " questao-editor__opcao-gabarito--ativo" : ""}`}
                      >
                        <input
                          type="radio"
                          name={`gabarito-${questaoAtiva._id}`}
                          value={l}
                          checked={questaoAtiva.gabarito === l}
                          onChange={() => atualizarQuestao(questaoAtiva._id, "gabarito", l)}
                          required
                          className="visualmente-oculto"
                        />
                        {l}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="questao-editor__bloco">
                  <label className="questao-editor__rotulo" htmlFor={`q-analise-${questaoAtiva._id}`}>
                    Análise das Questões *
                    <span className="questao-editor__hint">Justificativa de cada alternativa exibida após a resposta</span>
                  </label>
                  <textarea
                    id={`q-analise-${questaoAtiva._id}`}
                    className="campo__entrada questao-editor__textarea questao-editor__textarea--alto"
                    placeholder="Explique por que cada alternativa está correta ou incorreta..."
                    value={questaoAtiva.analiseDasAfirmativas}
                    onChange={(e) => atualizarQuestao(questaoAtiva._id, "analiseDasAfirmativas", e.target.value)}
                    required
                  />
                </div>
              </article>
            ) : null}
          </div>
        </div>

        <footer className="criar-avaliacao__rodape">
          <Botao variante="perigo" onClick={() => setConfirmarCancelar(true)}>
            Cancelar
          </Botao>
          <div className="criar-avaliacao__rodape-direita">
            <Botao variante="secundario" onClick={(e) => salvarAvaliacao(e, "Rascunho")}>
              Salvar rascunho
            </Botao>
            <Botao variante="primario" type="submit">
              Publicar avaliação
            </Botao>
          </div>
        </footer>
      </form>

      {confirmarCancelar && (
        <Modal titulo="Cancelar avaliação?" onFechar={() => setConfirmarCancelar(false)}>
          <p style={{ fontSize: "0.9rem", color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-md)" }}>
            Tem certeza que deseja cancelar? Todas as informações preenchidas serão perdidas.
          </p>
          <div className="modal-rodape">
            <Botao variante="fantasma" onClick={() => setConfirmarCancelar(false)}>
              Continuar editando
            </Botao>
            <Botao variante="perigo" onClick={onCancelar}>
              Sim, cancelar
            </Botao>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Slide de avaliações de uma turma (visão do professor) ──── */

function SlideAvaliacoesProfessor({ turma, onCriar, onVerDetalhes, statusAvaliacoes, avaliacoesExcluidas }) {
  const [menuAberto, setMenuAberto] = useState(null);
  const avaliacoesDoCurso = avaliacoes.filter((a) => a.cursoId === turma.cursoId && !avaliacoesExcluidas?.has(a.id));

  useEffect(() => {
    if (!menuAberto) return;
    function fechar() { setMenuAberto(null); }
    document.addEventListener("click", fechar);
    return () => document.removeEventListener("click", fechar);
  }, [menuAberto]);

  return (
    <div className="conteudos-aluno">
      <header className="conteudos-aluno__cabecalho">
        <div className="conteudos-aluno__curso-info">
          <p className="conteudos-aluno__turma">{turma.nomeTurma}</p>
          <span className="conteudos-aluno__curso-etiqueta" aria-hidden="true">Curso</span>
          <h2 className="conteudos-aluno__curso-titulo">{turma.cursoTitulo}</h2>
          <p className="conteudos-aluno__curso-meta">
            {avaliacoesDoCurso.length} avaliação{avaliacoesDoCurso.length !== 1 ? "ões" : ""} cadastrada{avaliacoesDoCurso.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Botao variante="primario" tamanho="pequeno" onClick={onCriar} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <motion.span whileHover={{ scale: 1.15, rotate: 90 }} transition={{ type: "spring", stiffness: 400, damping: 18 }} style={{ display: "flex" }}>
            <TbPlus size={22} aria-hidden="true" />
          </motion.span>
          Nova Avaliação
        </Botao>
      </header>

      {avaliacoesDoCurso.length === 0 ? (
        <p className="texto-vazio">Nenhuma avaliação cadastrada para este curso.</p>
      ) : (
        <ul className="lista-conteudos-completa" role="list">
          {avaliacoesDoCurso.map((av) => (
            <li key={av.id} className="cartao-conteudo">
              <span className="cartao-conteudo__icone" aria-hidden="true">◈</span>
              <div className="cartao-conteudo__info">
                <h4 className="cartao-conteudo__titulo">{av.titulo}</h4>
                <p className="cartao-conteudo__modulo">
                  {av.totalQuestoes} questão{av.totalQuestoes !== 1 ? "ões" : ""} · {av.tempoLimiteMinutos}min · nota máx. {av.notaMaxima}
                </p>
              </div>
              <div className="cartao-conteudo__meta">
                {(() => { const s = statusAvaliacoes?.[av.id] ?? av.status; return <Insignia texto={s} variante={s === "Publicada" ? "sucesso" : "neutro"} />; })()}
              </div>
              <div className="menu-contexto">
                <button
                  className="menu-contexto__botao"
                  type="button"
                  aria-label={`Opções para ${av.titulo}`}
                  onClick={(e) => { e.stopPropagation(); setMenuAberto(menuAberto === av.id ? null : av.id); }}
                ><TbDotsVertical size={18} aria-hidden="true" /></button>
                {menuAberto === av.id && (
                  <ul className="menu-contexto__lista" role="menu">
                    <li>
                      <button type="button" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={() => { setMenuAberto(null); onVerDetalhes(av); }}>
                        <TbSettings size={15} aria-hidden="true" />Opções
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Vista do professor — carrossel de turmas (avaliações) ───── */

function VistaProfessorAvaliacoes({ usuario, onCriar, onVerDetalhes, statusAvaliacoes, avaliacoesExcluidas }) {
  const [slideAtual, setSlideAtual] = useState(0);
  const minhasTurmas = turmas.filter((t) => t.professorId === usuario?.id);

  if (minhasTurmas.length === 0) {
    return (
      <p className="texto-vazio texto-vazio--central" role="status">
        Você não possui turmas atribuídas.
      </p>
    );
  }

  const total = minhasTurmas.length;

  return (
    <div className="carrossel-cursos">
      {total > 1 && (
        <nav className="carrossel-cursos__nav" aria-label="Navegação entre turmas">
          <button
            className="carrossel-cursos__seta"
            onClick={() => setSlideAtual((i) => i - 1)}
            disabled={slideAtual === 0}
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
            disabled={slideAtual === total - 1}
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
        <SlideAvaliacoesProfessor
          turma={minhasTurmas[slideAtual]}
          onCriar={onCriar}
          onVerDetalhes={onVerDetalhes}
          statusAvaliacoes={statusAvaliacoes}
          avaliacoesExcluidas={avaliacoesExcluidas}
        />
      </div>
    </div>
  );
}

/* ── Componente principal ────────────────────────────────────── */

export default function TelaAvaliacoes({ usuario, onMudarSecao, quizzesAprovados = new Set(), onAvaliacaoAprovada, conteudoConcluido = false, onToast }) {
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

  /* Sobrescritas de status feitas pelo professor na sessão: { [av.id]: "Publicada" | "Arquivada" } */
  const [statusAvaliacoes, setStatusAvaliacoes] = useState({});
  /* Pendência de confirmação de troca de status: null | { novoStatus } */
  const [confirmandoStatusAv, setConfirmandoStatusAv] = useState(null);
  /* IDs de avaliações excluídas na sessão */
  const [avaliacoesExcluidas, setAvaliacoesExcluidas] = useState(new Set());
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  /* Edição inline de campos do modal de detalhes */
  const [campoEditando, setCampoEditando] = useState(null);
  const [valorEditando, setValorEditando] = useState("");

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

  /* Ativa blur no layout enquanto o quiz ou resultado estiver aberto */
  useEffect(() => {
    const layout = document.querySelector(".layout-workspace");
    if (!layout) return;
    const ativo = modo === "quiz" || modo === "resultado";
    layout.classList.toggle("layout-workspace--quiz-ativo", ativo);
    return () => layout.classList.remove("layout-workspace--quiz-ativo");
  }, [modo]);

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

  /* Quiz e resultado são renderizados como portal (modal imersivo) */
  const portalQuiz = (modo === "quiz" || modo === "resultado") && avaliacaoAtiva
    ? createPortal(
        <div className="quiz-overlay" role="dialog" aria-modal="true" aria-label="Avaliação em andamento">
          <div className="quiz-overlay__caixa">
            {modo === "quiz" && (
              <QuizEmbutido
                avaliacao={avaliacaoAtiva}
                onConcluir={(resultado) => {
                  setResultados((prev) => ({ ...prev, [avaliacaoAtiva.id]: resultado }));
                  setTentativas((prev) => ({
                    ...prev,
                    [avaliacaoAtiva.id]: (prev[avaliacaoAtiva.id] || 0) + 1,
                  }));
                  setResultadoAtual(resultado);
                  if (resultado.porcentagem >= 70) onAvaliacaoAprovada?.({
                    porcentagem: resultado.porcentagem,
                    nota: resultado.nota,
                    notaMaxima: avaliacaoAtiva.notaMaxima,
                  });
                  setModo("resultado");
                }}
              />
            )}
            {modo === "resultado" && resultadoAtual && (
              <ResultadoAvaliacao
                avaliacao={avaliacaoAtiva}
                resultado={resultadoAtual}
                tentativasUsadas={tentativas[avaliacaoAtiva.id] || 0}
                onVoltar={() => { setModo("lista"); setResultadoAtual(null); }}
                onRefazer={() => setModo("quiz")}
                onMudarSecao={onMudarSecao}
              />
            )}
          </div>
        </div>,
        document.body
      )
    : null;

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

  function iniciarEdicao(campo, valorAtual) {
    setCampoEditando(campo);
    setValorEditando(String(valorAtual));
  }

  function salvarEdicaoCampo(valorBruto) {
    if (!campoEditando) return;
    const valor = campoEditando === "titulo" ? String(valorBruto).trim() : Number(valorBruto);
    if (!valor && valor !== 0) return;
    setAvaliacaoAtiva((prev) => ({ ...prev, [campoEditando]: valor }));
    setCampoEditando(null);
  }

  function cancelarEdicaoCampo() { setCampoEditando(null); }

  function confirmarExclusao() {
    setAvaliacoesExcluidas((prev) => new Set(prev).add(avaliacaoAtiva.id));
    setConfirmandoExclusao(false);
    setModalAberto(false);
    onToast?.(`"${avaliacaoAtiva.titulo}" excluída`, "aviso");
  }

  function confirmarTrocaStatus() {
    const { novoStatus } = confirmandoStatusAv;
    const atualizado = { ...avaliacaoAtiva, status: novoStatus };
    setAvaliacaoAtiva(atualizado);
    setStatusAvaliacoes((prev) => ({ ...prev, [avaliacaoAtiva.id]: novoStatus }));
    setConfirmandoStatusAv(null);
    onToast?.(
      novoStatus === "Publicada"
        ? `"${avaliacaoAtiva.titulo}" publicada`
        : `"${avaliacaoAtiva.titulo}" arquivada`,
      novoStatus === "Publicada" ? "sucesso" : "aviso"
    );
  }

  function abrirDetalhes(av) {
    setAvaliacaoAtiva({ ...av, status: statusAvaliacoes[av.id] ?? av.status });
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

  /* ── Vista do professor: carrossel de turmas ── */
  if (ehProfessor) {
    return (
      <div className="tela-avaliacoes">
        <header className="cabecalho-pagina">
          <div>
            <h2 className="cabecalho-pagina__titulo">Avaliações</h2>
            <p className="cabecalho-pagina__subtitulo">Gerencie as avaliações das suas turmas</p>
          </div>
        </header>
        <VistaProfessorAvaliacoes
          usuario={usuario}
          onCriar={() => setModo("criar")}
          onVerDetalhes={(av) => { setAvaliacaoAtiva({ ...av, status: statusAvaliacoes[av.id] ?? av.status }); setModalAberto(true); }}
          statusAvaliacoes={statusAvaliacoes}
          avaliacoesExcluidas={avaliacoesExcluidas}
        />
        {modalAberto && avaliacaoAtiva && (
          <Modal titulo="Detalhes da Avaliação" onFechar={() => { setModalAberto(false); setCampoEditando(null); }}>
            <dl className="lista-detalhes">

              {/* Título — editável */}
              <div className="lista-detalhes__item">
                <dt>Título</dt>
                {campoEditando === "titulo" ? (
                  <input
                    autoFocus
                    className="campo__entrada campo__entrada--inline"
                    defaultValue={valorEditando}
                    onBlur={(e) => salvarEdicaoCampo(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") cancelarEdicaoCampo(); }}
                  />
                ) : (
                  <dd>{avaliacaoAtiva.titulo}</dd>
                )}
                <button type="button" className="btn-editar-linha" style={{ color: "#fff" }} title="Editar título" onClick={() => iniciarEdicao("titulo", avaliacaoAtiva.titulo)}>
                  <TbPencil size={18} aria-hidden="true" />
                </button>
              </div>

              {/* Curso — somente leitura */}
              <div className="lista-detalhes__item"><dt>Curso</dt><dd>{avaliacaoAtiva.cursoTitulo}</dd></div>

              {/* Total de questões — somente leitura */}
              <div className="lista-detalhes__item"><dt>Total de questões</dt><dd>{avaliacaoAtiva.totalQuestoes}</dd></div>

              {/* Tentativas — editável */}
              <div className="lista-detalhes__item">
                <dt>Tentativas permitidas</dt>
                {campoEditando === "tentativasPermitidas" ? (
                  <input
                    autoFocus
                    className="campo__entrada campo__entrada--inline"
                    type="number" min="1" max="10"
                    defaultValue={valorEditando}
                    onBlur={(e) => salvarEdicaoCampo(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") cancelarEdicaoCampo(); }}
                  />
                ) : (
                  <dd>{avaliacaoAtiva.tentativasPermitidas}</dd>
                )}
                <button type="button" className="btn-editar-linha" style={{ color: "#fff" }} title="Editar tentativas" onClick={() => iniciarEdicao("tentativasPermitidas", avaliacaoAtiva.tentativasPermitidas)}>
                  <TbPencil size={18} aria-hidden="true" />
                </button>
              </div>

              {/* Tempo limite — editável */}
              <div className="lista-detalhes__item">
                <dt>Tempo limite</dt>
                {campoEditando === "tempoLimiteMinutos" ? (
                  <input
                    autoFocus
                    className="campo__entrada campo__entrada--inline"
                    type="number" min="5"
                    defaultValue={valorEditando}
                    onBlur={(e) => salvarEdicaoCampo(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") cancelarEdicaoCampo(); }}
                  />
                ) : (
                  <dd>{avaliacaoAtiva.tempoLimiteMinutos} minutos</dd>
                )}
                <button type="button" className="btn-editar-linha" style={{ color: "#fff" }} title="Editar tempo limite" onClick={() => iniciarEdicao("tempoLimiteMinutos", avaliacaoAtiva.tempoLimiteMinutos)}>
                  <TbPencil size={18} aria-hidden="true" />
                </button>
              </div>

              {/* Nota máxima — editável */}
              <div className="lista-detalhes__item">
                <dt>Nota máxima</dt>
                {campoEditando === "notaMaxima" ? (
                  <input
                    autoFocus
                    className="campo__entrada campo__entrada--inline"
                    type="number" min="1" max="100"
                    defaultValue={valorEditando}
                    onBlur={(e) => salvarEdicaoCampo(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") cancelarEdicaoCampo(); }}
                  />
                ) : (
                  <dd>{avaliacaoAtiva.notaMaxima}</dd>
                )}
                <button type="button" className="btn-editar-linha" style={{ color: "#fff" }} title="Editar nota máxima" onClick={() => iniciarEdicao("notaMaxima", avaliacaoAtiva.notaMaxima)}>
                  <TbPencil size={18} aria-hidden="true" />
                </button>
              </div>

            </dl>
            <div className="detalhe-status">
              <div>
                <strong className="detalhe-status__rotulo">Status da avaliação</strong>
                <span className="detalhe-status__descricao">
                  {avaliacaoAtiva.status === "Publicada"
                    ? "Visível e disponível para os alunos"
                    : "Oculta — não aparece para os alunos"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--espaco-sm)" }}>
                <Insignia
                  texto={avaliacaoAtiva.status === "Publicada" ? "Publicada" : "Arquivada"}
                  variante={avaliacaoAtiva.status === "Publicada" ? "sucesso" : "neutro"}
                />
                <button
                  role="switch"
                  aria-checked={avaliacaoAtiva.status === "Publicada"}
                  className={`switch-ativo${avaliacaoAtiva.status === "Publicada" ? " switch-ativo--ativo" : ""}`}
                  onClick={() => setConfirmandoStatusAv({ novoStatus: avaliacaoAtiva.status === "Publicada" ? "Arquivada" : "Publicada" })}
                  type="button"
                  aria-label={avaliacaoAtiva.status === "Publicada" ? "Publicada — clique para arquivar" : "Arquivada — clique para publicar"}
                >
                  <TbX size={10} className="switch-ativo__icone switch-ativo__icone--esq" aria-hidden="true" />
                  <span className="switch-ativo__thumb" aria-hidden="true" />
                  <TbCheck size={10} className="switch-ativo__icone switch-ativo__icone--dir" aria-hidden="true" />
                </button>
              </div>
            </div>
            <footer className="modal-rodape">
              <Botao variante="perigo" style={{ marginRight: "auto" }} onClick={() => { setModalAberto(false); setCampoEditando(null); }}>Fechar</Botao>
              <Botao variante="perigo" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={() => setConfirmandoExclusao(true)}><MdDelete size={19} aria-hidden="true" />Excluir</Botao>
              <Botao variante="primario" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={() => { setModalAberto(false); setCampoEditando(null); onToast?.("Alterações salvas.", "sucesso"); }}><MdSave size={19} aria-hidden="true" />Salvar</Botao>
            </footer>
          </Modal>
        )}

      {confirmandoExclusao && avaliacaoAtiva && (
        <Modal titulo="Excluir avaliação" onFechar={() => setConfirmandoExclusao(false)}>
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
            Tem certeza que deseja excluir <strong>"{avaliacaoAtiva.titulo}"</strong>?
            Esta ação não pode ser desfeita.
          </p>
          <footer className="modal-rodape">
            <Botao variante="perigo" onClick={() => setConfirmandoExclusao(false)}>Cancelar</Botao>
            <Botao variante="sucesso" onClick={confirmarExclusao}>Confirmar</Botao>
          </footer>
        </Modal>
      )}

      {confirmandoStatusAv && avaliacaoAtiva && (
        <Modal
          titulo={confirmandoStatusAv.novoStatus === "Publicada" ? "Publicar avaliação" : "Arquivar avaliação"}
          onFechar={() => setConfirmandoStatusAv(null)}
        >
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
            Tem certeza que deseja{" "}
            <strong>{confirmandoStatusAv.novoStatus === "Publicada" ? "publicar" : "arquivar"}</strong>{" "}
            a avaliação <strong>"{avaliacaoAtiva.titulo}"</strong>?
            {confirmandoStatusAv.novoStatus === "Arquivada" && (
              <> Ela ficará oculta para os alunos.</>
            )}
          </p>
          <footer className="modal-rodape">
            <Botao variante="perigo" onClick={() => setConfirmandoStatusAv(null)}>Cancelar</Botao>
            <Botao variante="sucesso" onClick={confirmarTrocaStatus}>Confirmar</Botao>
          </footer>
        </Modal>
      )}
      {portalQuiz}
      </div>
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
          <Botao
            variante="primario"
            onClick={() => setModo("criar")}
          >
            + Nova Avaliação
          </Botao>
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
              const resultado = resultados[av.id];
              const aprovado = resultado?.porcentagem >= 70;

              const classesCartao = [
                "cartao-avaliacao",
                ehAluno && !avaliacaoLiberada && "cartao-avaliacao--bloqueado",
                ehAluno && resultado && (aprovado ? "cartao-avaliacao--aprovado" : "cartao-avaliacao--reprovado"),
              ].filter(Boolean).join(" ");

              return (
                <li key={av.id}>
                  <article
                    className={classesCartao}
                    aria-labelledby={`av-titulo-${av.id}`}
                  >
                    <header className="cartao-avaliacao__topo">
                      <h4
                        className="cartao-avaliacao__titulo"
                        id={`av-titulo-${av.id}`}
                      >
                        {av.titulo}
                      </h4>
                      {!ehAluno && <Insignia texto={av.status} />}
                    </header>

                    <div className="cartao-avaliacao__corpo">
                      <dl className="cartao-avaliacao__meta">
                        <div className="cartao-avaliacao__meta-item">
                          <dt>Questões</dt>
                          <dd>{av.totalQuestoes}</dd>
                        </div>
                        <div className="cartao-avaliacao__meta-item">
                          <dt>Tempo</dt>
                          <dd>{av.tempoLimiteMinutos}min</dd>
                        </div>
                        <div className="cartao-avaliacao__meta-item">
                          <dt>Nota máx.</dt>
                          <dd>{av.notaMaxima}</dd>
                        </div>
                        <div className="cartao-avaliacao__meta-item">
                          <dt>Tentativas</dt>
                          <dd>{ehAluno ? `${tentativasUsadas}/${av.tentativasPermitidas}` : av.tentativasPermitidas}</dd>
                        </div>
                      </dl>

                      <footer className="cartao-avaliacao__rodape">
                        {ehAluno && badgeRealizacao(av.id)}
                        {ehAluno && !avaliacaoLiberada ? (
                          <span className="cartao-avaliacao__bloqueado-info">
                            <TbLock size={13} aria-hidden="true" />
                            Bloqueado
                          </span>
                        ) : ehAluno && limiteAtingido ? (
                          <span className="resultado-tentativas resultado-tentativas--esgotadas">
                            {LIMITE_TENTATIVAS}/{LIMITE_TENTATIVAS} tentativas
                          </span>
                        ) : (
                          <>
                            <button
                              className="botao-icone"
                              onClick={() => abrirDetalhes(av)}
                              aria-label={`Ver detalhes de ${av.titulo}`}
                            >
                              <TbDotsVertical size={16} />
                            </button>
                            {ehAluno && (
                              <Botao
                                variante={jaRealizada ? "secundario" : "primario"}
                                tamanho="pequeno"
                                onClick={() => iniciarAvaliacao(av)}
                                aria-label={`${jaRealizada ? "Refazer" : "Iniciar"} ${av.titulo}`}
                              >
                                {jaRealizada ? `Refazer (${tentativasUsadas + 1}ª)` : "Iniciar avaliação"}
                              </Botao>
                            )}
                          </>
                        )}
                      </footer>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {portalQuiz}

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
            <Botao
              variante="fantasma"
              onClick={() => setModalAberto(false)}
            >
              Fechar
            </Botao>
            {ehAluno && avaliacaoLiberada && (
              <Botao
                variante="primario"
                onClick={() => {
                  setModalAberto(false);
                  iniciarAvaliacao(avaliacaoAtiva);
                }}
              >
                {resultados[avaliacaoAtiva.id] ? "Refazer" : "Iniciar avaliação"}
              </Botao>
            )}
            {!ehAluno && (
              <Botao variante="primario">
                Editar
              </Botao>
            )}
          </footer>
        </Modal>
      )}
    </div>
  );
}
