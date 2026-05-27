import { useState, useEffect } from "react";
import { TbDotsVertical, TbPlus, TbSettings, TbX } from "react-icons/tb";
import { motion } from "framer-motion";
import { MdSave } from "react-icons/md";
import Insignia from "@/componentes/Insignia.jsx";
import Modal from "@/componentes/Modal.jsx";
import Botao from "@/componentes/Botao.jsx";
import { matriculas, usuarios, PROGRESSO_MOCK, NOTAS_MOCK } from "@/dados/dadosMock.js";
import { db } from "@/dados/db.js";
import { podeCriar, podeEditar } from "@/dados/permissoes.js";
import SelectSimples from "@/componentes/SelectSimples.jsx";


function gerarIniciais(nome) {
  return (nome ?? "").split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function SlideTurma({ turma, alunos, busca, tipo, onEditar }) {
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    if (!menuAberto) return;
    function fechar() { setMenuAberto(false); }
    document.addEventListener("click", fechar);
    return () => document.removeEventListener("click", fechar);
  }, [menuAberto]);

  const alunosFiltrados = busca.trim()
    ? alunos.filter((a) => a.nome.toLowerCase().includes(busca.toLowerCase()))
    : alunos;

  const aprovados      = alunos.filter((a) => a.statusMatricula === "Aprovada").length;
  const progressoMedio = alunos.length > 0
    ? Math.round(alunos.reduce((acc, a) => acc + (PROGRESSO_MOCK[a.matriculaId] ?? 50), 0) / alunos.length)
    : 0;
  const mediaNota      = NOTAS_MOCK[turma.id] ?? null;

  const corProgresso = progressoMedio >= 70 ? "var(--cor-sucesso)" : progressoMedio >= 40 ? "var(--cor-aviso)" : "var(--cor-erro)";
  const corNota      = mediaNota === null    ? "var(--cor-texto-mudo)"
    : mediaNota >= 7 ? "var(--cor-sucesso)"
    : mediaNota >= 5 ? "var(--cor-aviso)"
    : "var(--cor-erro)";

  const RAIO = 30;
  const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

  return (
    <div className="slide-turma">
      {/* Cabeçalho da turma com métricas integradas */}
      <header className="slide-turma__cabecalho">
        <div className="slide-turma__identidade">
          <div className="slide-turma__nome-linha">
            <h3 className="slide-turma__nome">{turma.nomeTurma}</h3>
            <Insignia texto={turma.status} variante={turma.status === "Ativa" ? "sucesso" : "neutro"} />
          </div>
          <span className="slide-turma__curso">{turma.cursoTitulo}</span>
        </div>

        <div className="slide-turma__metricas">
          <div className="anel-turma" aria-label={`${progressoMedio}% de progresso médio`}>
            <svg viewBox="0 0 80 80" aria-hidden="true">
              <circle cx="40" cy="40" r={RAIO} fill="none" stroke="rgba(123,47,247,0.1)" strokeWidth="7" />
              <circle
                cx="40" cy="40" r={RAIO} fill="none"
                stroke={corProgresso}
                strokeWidth="7"
                strokeDasharray={CIRCUNFERENCIA}
                strokeDashoffset={CIRCUNFERENCIA * (1 - progressoMedio / 100)}
                strokeLinecap="round"
                style={{ transform: "rotate(-90deg)", transformOrigin: "40px 40px" }}
              />
            </svg>
            <span className="anel-turma__texto">{progressoMedio}%</span>
          </div>

          <div className="slide-turma__kpis">
            <div className="slide-turma__kpi">
              <span className="slide-turma__kpi-valor">{alunos.length}</span>
              <span className="slide-turma__kpi-rotulo">alunos</span>
            </div>
            <div className="slide-turma__kpi">
              <span className="slide-turma__kpi-valor" style={{ color: corNota }}>
                {mediaNota !== null ? mediaNota.toFixed(1) : "—"}
              </span>
              <span className="slide-turma__kpi-rotulo">média</span>
            </div>
            <div className="slide-turma__kpi">
              <span className="slide-turma__kpi-valor">{aprovados}</span>
              <span className="slide-turma__kpi-rotulo">aprovados</span>
            </div>
          </div>

          {podeEditar(tipo, "turmas") && (
            <div className="menu-contexto">
              <button
                className="menu-contexto__botao"
                type="button"
                aria-label="Opções da turma"
                onClick={(e) => { e.stopPropagation(); setMenuAberto((v) => !v); }}
              ><TbDotsVertical size={18} aria-hidden="true" /></button>
              {menuAberto && (
                <ul className="menu-contexto__lista" role="menu">
                  <li><button type="button" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={() => { setMenuAberto(false); onEditar(); }}><TbSettings size={15} aria-hidden="true" />Opções</button></li>
                </ul>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Lista de alunos */}
      {alunos.length === 0 ? (
        <p className="texto-vazio">Nenhum aluno matriculado nesta turma.</p>
      ) : alunosFiltrados.length === 0 ? (
        <p className="texto-vazio">Nenhum aluno encontrado para "{busca}".</p>
      ) : (
        <ul className="slide-alunos__lista" role="list">
          {alunosFiltrados.map((aluno) => (
            <li key={aluno.matriculaId} className="slide-alunos__linha">
              <div className="topbar__avatar" aria-hidden="true" style={{ flexShrink: 0 }}>
                {gerarIniciais(aluno.nome)}
              </div>
              <div className="slide-alunos__linha-info">
                <strong className="slide-alunos__linha-nome">{aluno.nome}</strong>
                <span className="slide-alunos__linha-email">{aluno.email}</span>
              </div>
              <span
                className="slide-alunos__media"
                style={{ color: corMedia(aluno.media) }}
                title={`Média: ${aluno.media.toFixed(1)}`}
              >
                {aluno.media.toFixed(1)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function mediaMock(alunoId) {
  return (((alunoId * 17 + 43) % 45) + 55) / 10;
}


function corMedia(media) {
  if (media >= 7) return "var(--cor-sucesso)";
  if (media >= 5) return "var(--cor-aviso)";
  return "var(--cor-erro)";
}

function montarAlunosTurma(turmaId) {
  return matriculas
    .filter((m) => m.turmaId === turmaId)
    .map((m) => {
      const u = usuarios.find((usr) => usr.id === m.alunoId);
      return {
        matriculaId: m.id,
        nome: m.alunoNome,
        email: u?.email ?? "—",
        statusMatricula: m.status,
        media: mediaMock(m.alunoId),
      };
    });
}

export default function TelaTurmas({ usuario, listaCursos, onToast }) {
  const [slideAtual, setSlideAtual]   = useState(0);
  const [buscaAluno, setBuscaAluno]   = useState("");
  const [listaTurmas, setListaTurmas] = useState(() => db.turmas.listar());
  useEffect(() => { db.turmas.salvar(listaTurmas); }, [listaTurmas]);
  const [modalNova, setModalNova]             = useState(false);
  const [turmaEditando, setTurmaEditando]     = useState(null);
  const [erroNovaTurma, setErroNovaTurma]     = useState("");
  const [cursoIdNovaTurma, setCursoIdNovaTurma] = useState(null);
  const [statusEditando, setStatusEditando]   = useState(null);

  useEffect(() => { setStatusEditando(turmaEditando?.status ?? null); }, [turmaEditando]);

  const tipo = usuario?.tipo;

  const turmasFiltradas = listaTurmas.filter((t) => {
    if (tipo === "Professor" && t.professorId !== usuario?.id) return false;
    if (tipo === "Coordenador") {
      const cursosDoCoordenador = new Set(
        listaCursos.filter((c) => c.coordenadorId === usuario?.id).map((c) => c.id)
      );
      if (!cursosDoCoordenador.has(t.cursoId)) return false;
    }
    return true;
  });

  const total        = turmasFiltradas.length;
  const slideSeguro  = Math.min(slideAtual, Math.max(0, total - 1));

  function irParaSlide(idx) {
    setSlideAtual(idx);
    setBuscaAluno("");
  }

  function criarTurma(e) {
    e.preventDefault();
    const f = e.target;

    if (!cursoIdNovaTurma) {
      setErroNovaTurma("Selecione um curso.");
      return;
    }

    if (listaTurmas.some((t) => t.cursoId === cursoIdNovaTurma)) {
      setErroNovaTurma("Este curso já possui uma turma cadastrada.");
      return;
    }

    const cursoObj = listaCursos.find((c) => c.id === cursoIdNovaTurma);
    setListaTurmas((prev) => [...prev, {
      id: Date.now(),
      nomeTurma: f["nome-turma"].value,
      cursoId: cursoIdNovaTurma,
      cursoTitulo: cursoObj?.titulo ?? "—",
      professorId: null,
      professorNome: "A definir",
      totalAlunos: 0,
      status: "Ativa",
    }]);
    onToast?.(`Turma "${f["nome-turma"].value}" criada com sucesso.`, "sucesso");
    setCursoIdNovaTurma(null);
    setModalNova(false);
  }

  function salvarEdicao(e) {
    e.preventDefault();
    const f = e.target;
    setListaTurmas((prev) => prev.map((t) =>
      t.id === turmaEditando.id
        ? { ...t, nomeTurma: f["edit-nome-turma"].value, status: statusEditando ?? turmaEditando.status }
        : t
    ));
    onToast?.("Turma atualizada.", "sucesso");
    setTurmaEditando(null);
  }

  return (
    <div className="tela-turmas">
      <header className="cabecalho-pagina">
        <div>
          <h1 className="cabecalho-pagina__titulo">Turmas</h1>
          <p className="cabecalho-pagina__subtitulo">
            {tipo === "Professor"
              ? `${total} turma${total !== 1 ? "s" : ""} sob sua responsabilidade`
              : `${total} turma${total !== 1 ? "s" : ""} cadastrada${total !== 1 ? "s" : ""}`}
          </p>
        </div>
        {podeCriar(tipo, "turmas") && (
          <Botao variante="primario" onClick={() => { setModalNova(true); setErroNovaTurma(""); }} style={{ display: "flex", alignItems: "center", gap: "6px" }}
            variants={{ hover: { y: -1 } }} whileHover="hover"
          >
            <motion.span variants={{ hover: { rotate: 90 } }} transition={{ type: "spring", stiffness: 400, damping: 18 }} style={{ display: "flex" }}>
              <TbPlus size={20} aria-hidden="true" />
            </motion.span>
            Nova Turma
          </Botao>
        )}
      </header>

      {/* Filtros */}
      <div className="barra-filtros">
        <label htmlFor="filtro-turma" className="visualmente-oculto">Selecionar turma</label>
        <select
          id="filtro-turma"
          className="campo__entrada barra-filtros__select"
          value={slideSeguro}
          onChange={(e) => irParaSlide(Number(e.target.value))}
        >
          {turmasFiltradas.map((t, idx) => (
            <option key={t.id} value={idx}>
              {t.nomeTurma} — {t.cursoTitulo}
            </option>
          ))}
        </select>

        <label htmlFor="busca-aluno" className="visualmente-oculto">Buscar aluno</label>
        <input
          id="busca-aluno"
          type="search"
          className="campo__entrada barra-filtros__busca"
          placeholder="Buscar aluno por nome..."
          value={buscaAluno}
          onChange={(e) => setBuscaAluno(e.target.value)}
        />
      </div>

      {total === 0 ? (
        <p className="texto-vazio texto-vazio--central" role="status">
          Nenhuma turma encontrada.
        </p>
      ) : (
        <div className="carrossel-cursos">
          {/* Navegação */}
          {total > 0 && (
            <nav className="carrossel-cursos__nav" aria-label="Navegação entre turmas">
              <button
                className="carrossel-cursos__seta"
                onClick={() => irParaSlide(slideSeguro - 1)}
                disabled={slideSeguro === 0}
                aria-label="Turma anterior"
                type="button"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <div className="carrossel-cursos__indicadores" role="tablist" aria-label="Turmas">
                {turmasFiltradas.map((t, idx) => (
                  <button
                    key={t.id}
                    className={`carrossel-cursos__bolinha${idx === slideSeguro ? " carrossel-cursos__bolinha--ativa" : ""}`}
                    onClick={() => irParaSlide(idx)}
                    role="tab"
                    aria-selected={idx === slideSeguro}
                    aria-label={`Turma ${idx + 1}: ${t.nomeTurma}`}
                    type="button"
                  />
                ))}
              </div>

              <button
                className="carrossel-cursos__seta"
                onClick={() => irParaSlide(slideSeguro + 1)}
                disabled={slideSeguro === total - 1}
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
            <SlideTurma
              turma={turmasFiltradas[slideSeguro]}
              alunos={montarAlunosTurma(turmasFiltradas[slideSeguro].id)}
              busca={buscaAluno}
              tipo={tipo}
              onEditar={() => setTurmaEditando(turmasFiltradas[slideSeguro])}
            />
          </div>
        </div>
      )}

      {/* Modal nova turma */}
      {modalNova && (
        <Modal titulo="Nova Turma" onFechar={() => setModalNova(false)}>
          <div className="modal-edicao__avatar" aria-hidden="true">+</div>
          <form className="formulario-modal" onSubmit={criarTurma}>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="nome-turma">Nome da Turma *</label>
              <input id="nome-turma" className="campo__entrada" type="text" placeholder="Ex: WEB-2024-C" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="curso-turma">Curso *</label>
              <SelectSimples
                id="curso-turma"
                value={cursoIdNovaTurma ?? ""}
                opcoes={listaCursos.map((c) => {
                  const jaTemTurma = listaTurmas.some((t) => t.cursoId === c.id);
                  return { valor: c.id, rotulo: jaTemTurma ? `${c.titulo} (já tem turma)` : c.titulo, desabilitado: jaTemTurma };
                })}
                onChange={(val) => { setCursoIdNovaTurma(Number(val)); setErroNovaTurma(""); }}
                placeholder="Selecione um curso"
                required
              />
              {erroNovaTurma && (
                <span className="campo__erro" role="alert">{erroNovaTurma}</span>
              )}
            </div>
            <footer className="modal-rodape">
              <Botao variante="perigo" type="button" onClick={() => setModalNova(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" /> Cancelar</Botao>
              <Botao variante="primario" type="submit" style={{ display: "flex", alignItems: "center", gap: "6px" }}><MdSave size={19} aria-hidden="true" />Salvar</Botao>
            </footer>
          </form>
        </Modal>
      )}

      {/* Modal edição */}
      {turmaEditando && (
        <Modal titulo="Editar Turma" onFechar={() => setTurmaEditando(null)}>
          <div
            className="modal-edicao__avatar"
            aria-hidden="true"
          >
            {turmaEditando.nomeTurma.split("-").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
          </div>
          <form className="formulario-modal" onSubmit={salvarEdicao}>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="edit-nome-turma">Nome da Turma *</label>
              <input
                id="edit-nome-turma"
                className="campo__entrada"
                type="text"
                defaultValue={turmaEditando.nomeTurma}
                required
              />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="edit-curso-turma">Curso</label>
              <input
                id="edit-curso-turma"
                className="campo__entrada"
                type="text"
                value={turmaEditando.cursoTitulo}
                disabled
                style={{ opacity: 0.6, cursor: "not-allowed" }}
              />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="edit-status-turma">Status</label>
              <SelectSimples
                id="edit-status-turma"
                value={statusEditando ?? turmaEditando.status}
                opcoes={["Ativa", "Concluída", "Inativa"]}
                onChange={setStatusEditando}
              />
            </div>
            <footer className="modal-rodape">
              <Botao variante="perigo" type="button" onClick={() => setTurmaEditando(null)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" /> Cancelar</Botao>
              <Botao variante="primario" type="submit" style={{ display: "flex", alignItems: "center", gap: "6px" }}><MdSave size={17} aria-hidden="true" /> Salvar alterações</Botao>
            </footer>
          </form>
        </Modal>
      )}
    </div>
  );
}
