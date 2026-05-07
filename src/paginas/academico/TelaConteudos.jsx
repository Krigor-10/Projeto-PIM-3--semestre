import { useState, useRef, useEffect } from "react";
import BarraProgresso from "../../componentes/BarraProgresso.jsx";
import Insignia from "../../componentes/Insignia.jsx";
import Modal from "../../componentes/Modal.jsx";
import { conteudos, cursos, modulos, matriculas } from "../../dados/dadosMock.js";
import { questoesQuiz } from "../../dados/questoesQuiz.js";
import { podeCriar, podeEditar } from "../../dados/permissoes.js";

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
      title={
        aprovado
          ? "Quiz aprovado — clique para refazer"
          : liberado
          ? "Iniciar quiz rápido do módulo"
          : `Complete ${100 - percentual}% restantes para liberar o quiz`
      }
      aria-label={
        aprovado
          ? "Quiz aprovado"
          : liberado
          ? "Quiz liberado — clique para iniciar"
          : `Quiz bloqueado — ${percentual}% do módulo concluído`
      }
    >
      <svg
        className="botao-quiz-modulo__svg"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        {/* Trilha de fundo (anel cinza) */}
        <circle className="botao-quiz-modulo__trilha" cx="24" cy="24" r={RAIO_SVG} />
        {/* Arco de progresso preenchido */}
        <circle
          className="botao-quiz-modulo__arco"
          cx="24" cy="24" r={RAIO_SVG}
          strokeDasharray={CIRCUNFERENCIA}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="botao-quiz-modulo__icone" aria-hidden="true">
        {aprovado ? "✓" : liberado ? "▶" : `${percentual}%`}
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
      /* Notifica o pai se o módulo foi aprovado antes de exibir o resultado */
      if (aprovado) onAprovado?.();
      setConcluido(true);
    } else {
      setIndice((i) => i + 1);
    }
  }

  /* Conta quantas respostas batem com o gabarito */
  const acertos = questoes.filter((q) => respostas[q.id] === q.gabarito).length;
  /* Aprovado quando ≥ 70% das questões estão corretas */
  const aprovado = Math.round((acertos / totalQuestoes) * 100) >= 70;

  /* ── Tela de resultado ── */
  if (concluido) {
    return (
      <Modal titulo={`Quiz — ${modulo.titulo}`} onFechar={onFechar}>
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
            <button className="botao botao--primario" onClick={onFechar} type="button">
              Fechar
            </button>
          </footer>
        </div>
      </Modal>
    );
  }

  /* ── Tela de questão ── */
  return (
    <Modal titulo={`Quiz — ${modulo.titulo}`} onFechar={onFechar}>
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
        <div className="quiz-rapido__enunciado" tabIndex={0}>
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
          <button
            type="button"
            className="botao botao--primario"
            onClick={avancar}
            disabled={!respostaSelecionada}
          >
            {ehUltima ? "Ver resultado" : "Próxima →"}
          </button>
        </footer>
      </div>
    </Modal>
  );
}

/* ── Vista do aluno ──────────────────────────────────────────── */

function VistaAluno({ usuario, quizzesAprovados = new Set(), onQuizAprovado, onMudarSecao, onConteudoConcluido }) {
  const matricula = matriculas.find(
    (m) => m.alunoId === usuario?.id && m.status === "Aprovada"
  );

  const curso = matricula
    ? cursos.find((c) => c.id === matricula.cursoId)
    : null;

  const modulosDoCurso = matricula
    ? modulos
        .filter((m) => m.cursoId === matricula.cursoId)
        .sort((a, b) => a.ordem - b.ordem)
    : [];

  const conteudosDoCurso = matricula
    ? conteudos.filter((c) =>
        modulosDoCurso.some((m) => m.id === c.moduloId)
      )
    : [];

  const [concluidos, setConcluidos] = useState(
    () => new Set(conteudosDoCurso.filter((c) => c.concluido).map((c) => c.id))
  );
  const [modulosAbertos, setModulosAbertos] = useState(() => new Set());
  /* Quiz aberto: null ou { modulo, questoes } */
  const [quizModulo, setQuizModulo] = useState(null);

  const refsModulos = useRef({});

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
    /* Sorteia N questões aleatórias da pool global */
    const sorteadas = [...questoesQuiz]
      .sort(() => Math.random() - 0.5)
      .slice(0, QUESTOES_POR_MODULO);
    setQuizModulo({ modulo, questoes: sorteadas });
  }

  const totalConteudos = conteudosDoCurso.length;
  const totalConcluidos = concluidos.size;
  const percentualGeral = totalConteudos > 0
    ? Math.round((totalConcluidos / totalConteudos) * 100)
    : 0;

  const proximoConteudo = conteudosDoCurso.find((c) => !concluidos.has(c.id));
  const moduloProximo = proximoConteudo
    ? modulosDoCurso.find((m) => m.id === proximoConteudo.moduloId)
    : null;

  function continuarConteudo() {
    if (!moduloProximo) return;
    setModulosAbertos((prev) => {
      const copia = new Set(prev);
      copia.add(moduloProximo.id);
      return copia;
    });
    setTimeout(() => {
      refsModulos.current[moduloProximo.id]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  if (!matricula) {
    return (
      <div className="conteudos-sem-matricula">
        <p className="texto-vazio texto-vazio--central" role="status">
          Você não possui matrícula aprovada em nenhum curso.
          Solicite sua matrícula para acessar os conteúdos.
        </p>
      </div>
    );
  }

  const tudoConcluido = totalConcluidos === totalConteudos && totalConteudos > 0;

  /* Notifica o LayoutWorkspace sempre que o estado de conclusão mudar */
  useEffect(() => {
    onConteudoConcluido?.(tudoConcluido);
  }, [tudoConcluido]);

  /* Todos os módulos com quiz aprovado — libera o botão de avaliação final */
  const todosQuizzesAprovados = modulosDoCurso.length > 0 &&
    modulosDoCurso.every((m) => quizzesAprovados.has(m.id));

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
            <strong className="banner-continuar__titulo">
              Parabéns! Todos os conteúdos foram concluídos.
            </strong>
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
          <button
            className="botao botao--primario botao--pequeno"
            onClick={continuarConteudo}
            type="button"
          >
            Continuar →
          </button>
        </div>
      ) : null}

      {/* Módulos em acordeão */}
      {modulosDoCurso.map((modulo) => {
        const itens = conteudosDoCurso.filter((c) => c.moduloId === modulo.id);
        if (itens.length === 0) return null;

        const estaAberto = modulosAbertos.has(modulo.id);
        const concluidosModulo = itens.filter((c) => concluidos.has(c.id)).length;
        const percentualModulo = Math.round((concluidosModulo / itens.length) * 100);

        return (
          <section
            key={modulo.id}
            className="conteudos-modulo"
            ref={(el) => { refsModulos.current[modulo.id] = el; }}
          >
            {/* Cabeçalho: toggle acordeão + botão quiz circular */}
            <header className="conteudos-modulo__cabecalho">
              <h3 className="conteudos-modulo__cabecalho-wrapper">
                <button
                  className="conteudos-modulo__toggle"
                  onClick={() => alternarModulo(modulo.id)}
                  aria-expanded={estaAberto}
                  type="button"
                >
                  <div className="conteudos-modulo__info">
                    <span className="conteudos-modulo__titulo">
                      {modulo.ordem}. {modulo.titulo}
                    </span>
                    <span className="conteudos-modulo__contagem">
                      {concluidosModulo}/{itens.length} concluídos
                    </span>
                  </div>
                  <div className="conteudos-modulo__barra" aria-hidden="true">
                    <BarraProgresso percentual={percentualModulo} mostrarTexto={false} />
                  </div>
                  <span
                    className={`conteudos-modulo__chevron ${estaAberto ? "conteudos-modulo__chevron--aberto" : ""}`}
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </button>
              </h3>

              {/* Botão de quiz — círculo SVG que se preenche com o progresso */}
              <BotaoQuizModulo
                percentual={percentualModulo}
                aprovado={quizzesAprovados.has(modulo.id)}
                onClick={() => abrirQuizModulo(modulo)}
              />
            </header>

            {estaAberto && (
              <ul className="lista-conteudos-completa conteudos-modulo__lista" role="list">
                {itens.map((cont) => {
                  const config = TIPO_CONFIG[cont.tipo] || { icone: "◈", rotulo: cont.tipo };
                  const estaConcluido = concluidos.has(cont.id);

                  return (
                    <li
                      key={cont.id}
                      className={`cartao-conteudo ${estaConcluido ? "cartao-conteudo--concluido" : ""}`}
                    >
                      <span
                        className="cartao-conteudo__icone"
                        aria-hidden="true"
                        title={config.rotulo}
                      >
                        {config.icone}
                      </span>
                      <div className="cartao-conteudo__info">
                        <h4 className="cartao-conteudo__titulo">{cont.titulo}</h4>
                        <p className="cartao-conteudo__modulo">
                          {config.rotulo} · {cont.duracao}
                        </p>
                      </div>
                      <div className="cartao-conteudo__meta">
                        <Insignia texto={cont.tipo} variante="marca" />
                      </div>
                      <button
                        className={`botao botao--pequeno ${
                          estaConcluido ? "botao--sucesso" : "botao--fantasma"
                        }`}
                        onClick={() => alternarConclusao(cont.id)}
                        aria-pressed={estaConcluido}
                        aria-label={`${estaConcluido ? "Desmarcar" : "Marcar"} "${cont.titulo}" como concluído`}
                        type="button"
                      >
                        {estaConcluido ? "✓ Concluído" : "Marcar como feito"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}

      {/* Botão flutuante — aparece quando todo o conteúdo do curso foi concluído */}
      {tudoConcluido && (
        <button
          className="botao-avaliacao-flutuante"
          onClick={() => onMudarSecao("avaliacoes")}
          type="button"
          aria-label="Todos os módulos concluídos — realizar avaliação final"
        >
          <span className="botao-avaliacao-flutuante__icone" aria-hidden="true">◈</span>
          <span>Realizar Avaliação Final</span>
        </button>
      )}

      {/* Modal de quiz rápido */}
      {quizModulo && (
        <QuizRapidoModal
          modulo={quizModulo.modulo}
          questoes={quizModulo.questoes}
          onFechar={() => setQuizModulo(null)}
          onAprovado={() => onQuizAprovado?.(quizModulo.modulo.id)}
        />
      )}
    </div>
  );
}

/* ── Vista de gestão (admin, professor, coordenador) ─────────── */

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
            {conteudos.length} conteúdos cadastrados na plataforma
          </p>
        </div>
        {podeCriar(tipo, "conteudos") && (
          <button
            className="botao botao--primario"
            onClick={() => setModalAberto(true)}
            type="button"
          >
            + Novo Conteúdo
          </button>
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
                    <button
                      className="botao botao--fantasma botao--pequeno"
                      type="button"
                      aria-label={`Editar conteúdo ${cont.titulo}`}
                    >
                      Editar
                    </button>
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
              <button type="button" className="botao botao--fantasma" onClick={() => setModalAberto(false)}>
                Cancelar
              </button>
              <button type="submit" className="botao botao--primario">
                Criar Conteúdo
              </button>
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
  return <VistaGestao usuario={usuario} />;
}
