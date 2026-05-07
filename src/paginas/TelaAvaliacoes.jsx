import { useState } from "react";
import Insignia from "../componentes/Insignia.jsx";
import Modal from "../componentes/Modal.jsx";
import { avaliacoes, cursos } from "../dados/dadosMock.js";

const LETRAS = ["A", "B", "C", "D", "E"];

function novaQuestao() {
  return {
    _id: Date.now() + Math.random(),
    introducaoTeorica: "",
    enunciado: "",
    alternativas: LETRAS.map((l) => ({ letra: l, texto: "" })),
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
      mapa.set(av.cursoId, { cursoId: av.cursoId, cursoTitulo: av.cursoTitulo, itens: [] });
    }
    mapa.get(av.cursoId).itens.push(av);
  });
  return Array.from(mapa.values());
}

/* ── Formulário de criação ─────────────────────────────────── */
function FormularioCriarAvaliacao({ onCancelar, onSalvar }) {
  const [form, setForm] = useState(formVazio);

  function setMeta(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function adicionarQuestao() {
    setForm((f) => ({ ...f, questoes: [...f.questoes, novaQuestao()] }));
  }

  function removerQuestao(id) {
    setForm((f) => ({ ...f, questoes: f.questoes.filter((q) => q._id !== id) }));
  }

  function setQuestao(id, campo, valor) {
    setForm((f) => ({
      ...f,
      questoes: f.questoes.map((q) => q._id === id ? { ...q, [campo]: valor } : q),
    }));
  }

  function setAlternativa(questaoId, letra, valor) {
    setForm((f) => ({
      ...f,
      questoes: f.questoes.map((q) =>
        q._id === questaoId
          ? { ...q, alternativas: q.alternativas.map((a) => a.letra === letra ? { ...a, texto: valor } : a) }
          : q
      ),
    }));
  }

  function handleSubmit(e, status) {
    e.preventDefault();
    onSalvar({ ...form, status });
  }

  return (
    <div className="criar-avaliacao">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Nova Avaliação</h2>
          <p className="cabecalho-pagina__subtitulo">Preencha os dados e as questões da prova</p>
        </div>
        <button className="botao botao--fantasma" onClick={onCancelar} type="button">
          Cancelar
        </button>
      </header>

      <form onSubmit={(e) => handleSubmit(e, "Publicada")}>

        {/* Dados gerais */}
        <section className="criar-avaliacao__secao">
          <h3 className="criar-avaliacao__secao-titulo">Dados gerais</h3>
          <div className="criar-avaliacao__secao-corpo">
            <div className="campo">
              <label className="campo__rotulo" htmlFor="av-titulo">Título da avaliação *</label>
              <input
                id="av-titulo"
                className="campo__entrada"
                type="text"
                placeholder="Ex: Prova 1 — Fundamentos de HTML"
                value={form.titulo}
                onChange={(e) => setMeta("titulo", e.target.value)}
                required
              />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="av-curso">Curso *</label>
              <select
                id="av-curso"
                className="campo__entrada"
                value={form.cursoId}
                onChange={(e) => setMeta("cursoId", e.target.value)}
                required
              >
                <option value="">Selecione um curso</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>{c.titulo}</option>
                ))}
              </select>
            </div>
            <div className="grade-3">
              <div className="campo">
                <label className="campo__rotulo" htmlFor="av-tentativas">Tentativas permitidas</label>
                <input
                  id="av-tentativas"
                  className="campo__entrada"
                  type="number"
                  min="1"
                  max="10"
                  value={form.tentativas}
                  onChange={(e) => setMeta("tentativas", Number(e.target.value))}
                />
              </div>
              <div className="campo">
                <label className="campo__rotulo" htmlFor="av-tempo">Tempo limite (min)</label>
                <input
                  id="av-tempo"
                  className="campo__entrada"
                  type="number"
                  min="5"
                  value={form.tempo}
                  onChange={(e) => setMeta("tempo", Number(e.target.value))}
                />
              </div>
              <div className="campo">
                <label className="campo__rotulo" htmlFor="av-nota">Nota máxima</label>
                <input
                  id="av-nota"
                  className="campo__entrada"
                  type="number"
                  min="1"
                  max="100"
                  value={form.notaMaxima}
                  onChange={(e) => setMeta("notaMaxima", Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Questões */}
        <section className="criar-avaliacao__secao">
          <div className="criar-avaliacao__secao-cabecalho">
            <h3 className="criar-avaliacao__secao-titulo">
              Questões
              <span className="criar-avaliacao__contagem">{form.questoes.length}</span>
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
              <div key={q._id} className="questao-editor">
                <div className="questao-editor__cabecalho">
                  <span className="questao-editor__num">Questão {idx + 1}</span>
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
                </div>

                {/* Introdução teórica */}
                <div className="questao-editor__bloco">
                  <label className="questao-editor__rotulo" htmlFor={`q-intro-${q._id}`}>
                    Introdução Teórica
                    <span className="questao-editor__hint">Texto de apoio exibido antes do enunciado</span>
                  </label>
                  <textarea
                    id={`q-intro-${q._id}`}
                    className="campo__entrada questao-editor__textarea questao-editor__textarea--alto"
                    placeholder="Insira os conceitos teóricos que embasam a questão..."
                    value={q.introducaoTeorica}
                    onChange={(e) => setQuestao(q._id, "introducaoTeorica", e.target.value)}
                    required
                  />
                </div>

                {/* Enunciado */}
                <div className="questao-editor__bloco">
                  <label className="questao-editor__rotulo" htmlFor={`q-enun-${q._id}`}>
                    Enunciado *
                  </label>
                  <textarea
                    id={`q-enun-${q._id}`}
                    className="campo__entrada questao-editor__textarea questao-editor__textarea--medio"
                    placeholder="Digite o enunciado da questão..."
                    value={q.enunciado}
                    onChange={(e) => setQuestao(q._id, "enunciado", e.target.value)}
                    required
                  />
                </div>

                {/* Alternativas */}
                <div className="questao-editor__bloco">
                  <p className="questao-editor__rotulo">Alternativas *</p>
                  <div className="questao-editor__alternativas">
                    {q.alternativas.map((alt) => (
                      <div key={alt.letra} className="questao-editor__alternativa-linha">
                        <span className="questao-editor__letra">{alt.letra}</span>
                        <input
                          className="campo__entrada"
                          type="text"
                          placeholder={`Texto da alternativa ${alt.letra}`}
                          value={alt.texto}
                          onChange={(e) => setAlternativa(q._id, alt.letra, e.target.value)}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resposta correta */}
                <div className="questao-editor__bloco">
                  <p className="questao-editor__rotulo">Resposta Correta *</p>
                  <div className="questao-editor__gabarito" role="group" aria-label="Selecione a resposta correta">
                    {LETRAS.map((l) => (
                      <label key={l} className={`questao-editor__opcao-gabarito ${q.gabarito === l ? "questao-editor__opcao-gabarito--ativo" : ""}`}>
                        <input
                          type="radio"
                          name={`gabarito-${q._id}`}
                          value={l}
                          checked={q.gabarito === l}
                          onChange={() => setQuestao(q._id, "gabarito", l)}
                          required
                          className="visualmente-oculto"
                        />
                        {l}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Análise */}
                <div className="questao-editor__bloco">
                  <label className="questao-editor__rotulo" htmlFor={`q-analise-${q._id}`}>
                    Análise das Questões *
                    <span className="questao-editor__hint">Justificativa de cada alternativa exibida após a resposta</span>
                  </label>
                  <textarea
                    id={`q-analise-${q._id}`}
                    className="campo__entrada questao-editor__textarea questao-editor__textarea--alto"
                    placeholder="Explique por que cada alternativa está correta ou incorreta..."
                    value={q.analiseDasAfirmativas}
                    onChange={(e) => setQuestao(q._id, "analiseDasAfirmativas", e.target.value)}
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Rodapé de ações */}
        <div className="criar-avaliacao__rodape">
          <button className="botao botao--fantasma" onClick={onCancelar} type="button">
            Cancelar
          </button>
          <div className="criar-avaliacao__rodape-direita">
            <button
              className="botao botao--secundario"
              type="button"
              onClick={(e) => handleSubmit(e, "Rascunho")}
            >
              Salvar rascunho
            </button>
            <button className="botao botao--primario" type="submit">
              Publicar avaliação
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ── Componente principal ──────────────────────────────────── */
export default function TelaAvaliacoes({ usuario, onMudarSecao }) {
  const [modo, setModo] = useState("lista");
  const [modalAberto, setModalAberto] = useState(false);
  const [avaliacaoAtiva, setAvaliacaoAtiva] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("");

  const isAluno = usuario?.tipo === "Aluno";

  if (modo === "criar") {
    return (
      <FormularioCriarAvaliacao
        onCancelar={() => setModo("lista")}
        onSalvar={() => setModo("lista")}
      />
    );
  }

  const avaliacoesFiltradas = avaliacoes.filter((a) => {
    if (filtroStatus && a.status !== filtroStatus) return false;
    if (filtroCurso && String(a.cursoId) !== filtroCurso) return false;
    if (isAluno && a.status !== "Publicada") return false;
    return true;
  });

  const grupos = agruparPorCurso(avaliacoesFiltradas);

  function abrirDetalhes(av) {
    setAvaliacaoAtiva(av);
    setModalAberto(true);
  }

  return (
    <div className="tela-avaliacoes">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Avaliações</h2>
          <p className="cabecalho-pagina__subtitulo">
            {avaliacoesFiltradas.length} avaliação{avaliacoesFiltradas.length !== 1 ? "ões" : ""} encontrada{avaliacoesFiltradas.length !== 1 ? "s" : ""}
          </p>
        </div>
        {!isAluno && (
          <button
            className="botao botao--primario"
            onClick={() => setModo("criar")}
            type="button"
          >
            + Nova Avaliação
          </button>
        )}
      </header>

      <div className="barra-filtros">
        <label htmlFor="filtro-curso-av" className="visualmente-oculto">Filtrar por curso</label>
        <select
          id="filtro-curso-av"
          className="campo__entrada barra-filtros__select"
          value={filtroCurso}
          onChange={(e) => setFiltroCurso(e.target.value)}
        >
          <option value="">Todos os cursos</option>
          {cursos.map((c) => (
            <option key={c.id} value={String(c.id)}>{c.titulo}</option>
          ))}
        </select>

        {!isAluno && (
          <>
            <label htmlFor="filtro-status-av" className="visualmente-oculto">Filtrar por status</label>
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
          </>
        )}
      </div>

      {grupos.length === 0 && (
        <p className="texto-vazio texto-vazio--central" role="status">
          Nenhuma avaliação encontrada.
        </p>
      )}

      {grupos.map((grupo) => (
        <section key={grupo.cursoId} className="avaliacoes-grupo" aria-labelledby={`curso-${grupo.cursoId}`}>
          <h3 className="avaliacoes-grupo__titulo" id={`curso-${grupo.cursoId}`}>
            <span className="avaliacoes-grupo__icone" aria-hidden="true">📚</span>
            {grupo.cursoTitulo}
            <span className="avaliacoes-grupo__contagem">{grupo.itens.length}</span>
          </h3>
          <ul className="grade-avaliacoes" role="list" aria-label={`Avaliações de ${grupo.cursoTitulo}`}>
            {grupo.itens.map((av) => (
              <li key={av.id}>
                <article
                  className="cartao-avaliacao"
                  onClick={() => abrirDetalhes(av)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && abrirDetalhes(av)}
                  aria-label={`Ver detalhes da avaliação ${av.titulo}`}
                >
                  <header className="cartao-avaliacao__cabecalho">
                    <h4 className="cartao-avaliacao__titulo">{av.titulo}</h4>
                    <Insignia texto={av.status} />
                  </header>
                  <dl className="cartao-avaliacao__meta">
                    <div><dt>Questões</dt><dd>{av.totalQuestoes}</dd></div>
                    <div><dt>Tentativas</dt><dd>{av.tentativasPermitidas}</dd></div>
                    <div><dt>Tempo</dt><dd>{av.tempoLimiteMinutos}min</dd></div>
                    <div><dt>Nota máx.</dt><dd>{av.notaMaxima}</dd></div>
                  </dl>
                </article>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {modalAberto && avaliacaoAtiva && (
        <Modal titulo="Detalhes da Avaliação" onFechar={() => setModalAberto(false)}>
          <dl className="lista-detalhes">
            <div className="lista-detalhes__item"><dt>Título</dt><dd>{avaliacaoAtiva.titulo}</dd></div>
            <div className="lista-detalhes__item"><dt>Curso</dt><dd>{avaliacaoAtiva.cursoTitulo}</dd></div>
            <div className="lista-detalhes__item"><dt>Total de questões</dt><dd>{avaliacaoAtiva.totalQuestoes}</dd></div>
            <div className="lista-detalhes__item"><dt>Tentativas permitidas</dt><dd>{avaliacaoAtiva.tentativasPermitidas}</dd></div>
            <div className="lista-detalhes__item"><dt>Tempo limite</dt><dd>{avaliacaoAtiva.tempoLimiteMinutos} minutos</dd></div>
            <div className="lista-detalhes__item"><dt>Nota máxima</dt><dd>{avaliacaoAtiva.notaMaxima}</dd></div>
            <div className="lista-detalhes__item"><dt>Status</dt><dd><Insignia texto={avaliacaoAtiva.status} /></dd></div>
          </dl>
          <div className="modal-rodape">
            <button className="botao botao--fantasma" onClick={() => setModalAberto(false)}>Fechar</button>
            {!isAluno && <button className="botao botao--primario">Editar</button>}
          </div>
        </Modal>
      )}
    </div>
  );
}
