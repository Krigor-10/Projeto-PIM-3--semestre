import { useState, useEffect } from "react";
import { siglasCurso } from "@/utils/siglas.js";
import { TbDotsVertical, TbPlus, TbSettings, TbX, TbSearch, TbUsers, TbChalkboard, TbCheck, TbPencil } from "react-icons/tb";
import { motion } from "framer-motion";
import { MdSave, MdGroups } from "react-icons/md";
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

  return (
    <div className="conteudos-aluno">
      <header className="conteudos-aluno__cabecalho">
        <div className="conteudos-aluno__curso-info">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--espaco-md)" }}>
            <div className="cartao-progresso-aluno__avatar conteudos-aluno__avatar-desktop" aria-hidden="true">
              <MdGroups size={20} aria-hidden="true" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--espaco-sm)", flexWrap: "wrap" }}>
                <h2 className="conteudos-aluno__curso-titulo">{turma.nomeTurma}</h2>
                <span className="conteudos-aluno__curso-etiqueta">{turma.cursoTitulo}</span>
              </div>
            </div>
          </div>
          <div className="conteudos-aluno__meta-chips">
            <span className="conteudos-aluno__meta-chip conteudos-aluno__meta-chip--progresso">
              <TbCheck size={12} aria-hidden="true" />
              {turma.status}
            </span>
            <span className="conteudos-aluno__meta-chip">
              <TbUsers size={12} aria-hidden="true" />
              {alunos.length} aluno{alunos.length !== 1 ? "s" : ""}
            </span>
            {mediaNota !== null && (
              <span className="conteudos-aluno__meta-chip">
                Média {mediaNota.toFixed(1)}
              </span>
            )}
            <span className="conteudos-aluno__meta-chip">
              <TbChalkboard size={12} aria-hidden="true" />
              {turma.professorNome}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--espaco-sm)" }}>
          <div className="conteudos-aluno__progresso-geral">
            <p className="progresso-hero__legenda">
              {aprovados}/{alunos.length} aprovados
            </p>
            <div className="anel-progresso" aria-label={`${progressoMedio} por cento de progresso médio`}>
              <svg className="anel-progresso__svg" viewBox="0 0 120 120" aria-hidden="true">
                <defs>
                  <linearGradient id={`anel-grad-turma-${turma.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#b992ff" />
                    <stop offset="100%" stopColor="#7b2ff7" />
                  </linearGradient>
                </defs>
                <circle className="anel-progresso__trilha" cx="60" cy="60" r="50" />
                <circle
                  className="anel-progresso__arco"
                  cx="60" cy="60" r="50"
                  stroke={`url(#anel-grad-turma-${turma.id})`}
                  style={{ strokeDasharray: "314.16", strokeDashoffset: 314.16 * (1 - progressoMedio / 100) }}
                />
              </svg>
              <span className="anel-progresso__texto" aria-hidden="true">{progressoMedio}%</span>
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
                  <li><button type="button" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={() => { setMenuAberto(false); onEditar(); }}><TbSettings size={20} aria-hidden="true" />Opções</button></li>
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
              </div>
              <div className="slide-alunos__media-col">
                <span className="dado-rotulo" aria-hidden="true">Média</span>
                <span
                  className="slide-alunos__media"
                  style={{ color: corMedia(aluno.media) }}
                >
                  {aluno.media.toFixed(1)}
                </span>
              </div>
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
        ativo: u?.ativo ?? true,
      };
    })
    .filter((a) => a.ativo);
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
  const [campoEditando, setCampoEditando]     = useState(null);
  const [valoresEdit, setValoresEdit]         = useState({});

  useEffect(() => { setStatusEditando(turmaEditando?.status ?? null); setValoresEdit({}); setCampoEditando(null); }, [turmaEditando]);

  const tipo = usuario?.tipo;

  const alunosTurmaEditando = turmaEditando ? montarAlunosTurma(turmaEditando.id) : [];
  const progressoMedioEditando = alunosTurmaEditando.length > 0
    ? Math.round(alunosTurmaEditando.reduce((acc, a) => acc + (PROGRESSO_MOCK[a.matriculaId] ?? 50), 0) / alunosTurmaEditando.length)
    : 0;
  const aprovadosEditando = alunosTurmaEditando.filter((a) => a.statusMatricula === "Aprovada").length;
  const mediaNotaEditando = turmaEditando ? (NOTAS_MOCK[turmaEditando.id] ?? null) : null;
  const corNotaEditando = mediaNotaEditando === null ? "var(--cor-texto-mudo)"
    : mediaNotaEditando >= 7 ? "var(--cor-sucesso)"
    : mediaNotaEditando >= 5 ? "var(--cor-aviso)"
    : "var(--cor-erro)";

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

  function salvarEdicao() {
    setListaTurmas((prev) => prev.map((t) =>
      t.id === turmaEditando.id
        ? { ...t, nomeTurma: valoresEdit.nomeTurma ?? turmaEditando.nomeTurma, status: statusEditando ?? turmaEditando.status }
        : t
    ));
    onToast?.("Turma atualizada.", "sucesso");
    setTurmaEditando(null);
  }

  return (
    <div className="tela-turmas">
      <header className="cabecalho-pagina">
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--espaco-lg)", flexWrap: "wrap" }}>
            <h1 className="cabecalho-pagina__titulo">Turmas</h1>
            {total > 0 && (
              <>
                <label htmlFor="filtro-turma" className="visualmente-oculto">Selecionar turma</label>
                <select
                  id="filtro-turma"
                  className="campo__entrada barra-filtros__select"
                  value={slideSeguro}
                  onChange={(e) => irParaSlide(Number(e.target.value))}
                  style={{ marginLeft: "auto", maxWidth: "220px" }}
                >
                  {turmasFiltradas.map((t, idx) => (
                    <option key={t.id} value={idx}>{t.nomeTurma} — {t.cursoTitulo}</option>
                  ))}
                </select>
              </>
            )}
            <span style={{ width: "1px", height: "24px", background: "var(--cor-borda)", flexShrink: 0 }} aria-hidden="true" />
            <div style={{ position: "relative", width: "260px", flexShrink: 0 }}>
              <TbSearch size={15} aria-hidden="true" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--cor-texto-mudo)", pointerEvents: "none" }} />
              <label htmlFor="busca-aluno" className="visualmente-oculto">Buscar aluno</label>
              <input
                id="busca-aluno"
                type="search"
                className="campo__entrada barra-filtros__busca"
                placeholder="Buscar aluno..."
                value={buscaAluno}
                onChange={(e) => setBuscaAluno(e.target.value)}
                style={{ width: "100%", paddingLeft: "32px" }}
              />
            </div>
            {podeCriar(tipo, "turmas") && (
              <>
                <span style={{ width: "1px", height: "24px", background: "var(--cor-borda)", flexShrink: 0 }} aria-hidden="true" />
                <Botao variante="primario" onClick={() => { setModalNova(true); setErroNovaTurma(""); }} style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  variants={{ hover: { y: -1 } }} whileHover="hover"
                >
                  <motion.span variants={{ hover: { rotate: 90 } }} transition={{ type: "spring", stiffness: 400, damping: 18 }} style={{ display: "flex" }}>
                    <TbPlus size={20} aria-hidden="true" />
                  </motion.span>
                  Nova Turma
                </Botao>
              </>
            )}
          </div>
          <p className="cabecalho-pagina__subtitulo">
            {tipo === "Professor"
              ? `${total} turma${total !== 1 ? "s" : ""} sob sua responsabilidade`
              : `${total} turma${total !== 1 ? "s" : ""} cadastrada${total !== 1 ? "s" : ""}`}
          </p>
        </div>
      </header>

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
          <dl className="lista-detalhes">
            <div className="lista-detalhes__item">
              <dt>Nome da Turma</dt>
              {campoEditando === "nomeTurma" ? (
                <input
                  className="campo__entrada campo__entrada--inline"
                  defaultValue={valoresEdit.nomeTurma ?? turmaEditando.nomeTurma}
                  autoFocus
                  onBlur={(e) => { setValoresEdit((v) => ({ ...v, nomeTurma: e.target.value })); setCampoEditando(null); }}
                  onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                />
              ) : (
                <dd>{valoresEdit.nomeTurma ?? turmaEditando.nomeTurma}</dd>
              )}
              <button className="btn-editar-linha" type="button" title="Editar nome" onClick={() => setCampoEditando("nomeTurma")}>
                <motion.span whileHover={{ scale: 1.25, rotate: -12 }} transition={{ type: "spring", stiffness: 400, damping: 18 }} style={{ display: "flex" }}>
                  <TbPencil size={17} />
                </motion.span>
              </button>
            </div>

            <div className="lista-detalhes__item">
              <dt>Curso</dt>
              <dd>{turmaEditando.cursoTitulo}</dd>
            </div>

            <div className="lista-detalhes__item">
              <dt>Status</dt>
              <SelectSimples
                value={statusEditando ?? turmaEditando.status}
                opcoes={["Ativa", "Concluída", "Inativa"]}
                onChange={setStatusEditando}
              />
            </div>
          </dl>

          <dl className="modal-metricas-turma" aria-label="Métricas da turma">
            <div className="modal-metricas-turma__item">
              <dt>Alunos</dt>
              <dd>{alunosTurmaEditando.length}</dd>
            </div>
            <div className="modal-metricas-turma__item">
              <dt>Progresso</dt>
              <dd>{progressoMedioEditando}%</dd>
            </div>
            <div className="modal-metricas-turma__item">
              <dt>Aprovados</dt>
              <dd>{aprovadosEditando}</dd>
            </div>
            <div className="modal-metricas-turma__item">
              <dt>Média</dt>
              <dd style={{ color: corNotaEditando }}>{mediaNotaEditando !== null ? mediaNotaEditando.toFixed(1) : "—"}</dd>
            </div>
          </dl>

          <footer className="modal-rodape">
            <Botao variante="perigo" type="button" onClick={() => setTurmaEditando(null)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" /> Cancelar</Botao>
            <Botao variante="primario" type="button" onClick={salvarEdicao} style={{ display: "flex", alignItems: "center", gap: "6px" }}><MdSave size={17} aria-hidden="true" /> Salvar alterações</Botao>
          </footer>
        </Modal>
      )}
    </div>
  );
}
