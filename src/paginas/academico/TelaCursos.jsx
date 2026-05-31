import { useState, useEffect } from "react";
import { TbDotsVertical, TbPlus, TbPencil, TbTrash, TbSettings, TbLogout, TbX, TbSearch } from "react-icons/tb";
import { motion } from "framer-motion";
import { MdSave } from "react-icons/md";
import Insignia from "@/componentes/Insignia.jsx";
import Modal from "@/componentes/Modal.jsx";
import Botao from "@/componentes/Botao.jsx";
import { cursos, turmas, modulos, usuarios, avaliacoes } from "@/dados/dadosMock.js";
import { db } from "@/dados/db.js";
import { podeCriar, podeEditar, podeExcluir } from "@/dados/permissoes.js";
import SelectUsuario from "@/componentes/SelectUsuario.jsx";
import SelectSimples from "@/componentes/SelectSimples.jsx";

/* ── Vista gerencial do coordenador ─────────────────────────────── */

function VistaGerencialCoordenador({ usuario }) {
  const [cursoSelecionado, setCursoSelecionado] = useState(null);
  const [menuAberto, setMenuAberto]             = useState(null);
  const [formSujo, setFormSujo]                 = useState(false);
  const [confirmarSaida, setConfirmarSaida]     = useState(false);
  const [busca, setBusca]                       = useState("");
  const [listaCursos, setListaCursos]           = useState(() =>
    db.cursos.listar()
      .filter((c) => c.coordenadorId === usuario.id)
      .map((c) => {
        const turma = turmas.find((t) => t.cursoId === c.id);
        return { ...c, professorId: turma?.professorId ?? null, professorNome: turma?.professorNome ?? null };
      })
  );
  const [profAtribuidoId, setProfAtribuidoId]   = useState(null);

  useEffect(() => {
    setFormSujo(false);
    setConfirmarSaida(false);
    setProfAtribuidoId(cursoSelecionado?.professorId ?? null);
  }, [cursoSelecionado]);

  const professoresAtivos = usuarios.filter((u) => u.tipo === "Professor" && u.ativo);

  const totalAtivos     = listaCursos.filter((c) => c.ativo).length;
  const totalAlunos     = listaCursos.filter((c) => c.ativo).reduce((acc, c) => {
    return acc + turmas.filter((t) => t.cursoId === c.id).reduce((s, t) => s + (t.totalAlunos ?? 0), 0);
  }, 0);
  const qtdTurmasAtivas = turmas.filter((t) => t.status === "Ativa" && listaCursos.some((c) => c.id === t.cursoId)).length;

  function tentarFechar() {
    if (formSujo) { setConfirmarSaida(true); } else { setCursoSelecionado(null); }
  }

  function salvarAlteracoes(e) {
    e.preventDefault();
    const professor = professoresAtivos.find((p) => p.id === profAtribuidoId);
    setListaCursos((prev) => prev.map((c) =>
      c.id === cursoSelecionado.id
        ? { ...c, professorId: profAtribuidoId, professorNome: professor?.nome ?? null }
        : c
    ));
    setCursoSelecionado(null);
  }

  return (
    <div className="tela-cursos">
      <header className="cabecalho-pagina">
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--espaco-md)", flexWrap: "wrap" }}>
            <h1 className="cabecalho-pagina__titulo">Cursos</h1>
            <div style={{ position: "relative", width: "260px", flexShrink: 0, marginLeft: "auto" }}>
              <TbSearch size={15} aria-hidden="true" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--cor-texto-mudo)", pointerEvents: "none" }} />
              <label htmlFor="busca-cursos-coord" className="visualmente-oculto">Buscar curso</label>
              <input
                id="busca-cursos-coord"
                type="search"
                className="campo__entrada barra-filtros__busca"
                placeholder="Buscar curso..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                style={{ width: "100%", paddingLeft: "32px" }}
              />
            </div>
          </div>
          <p className="cabecalho-pagina__subtitulo">Cursos sob sua coordenação</p>
        </div>
      </header>

      {/* Cabeçalho da listagem */}
      <div className="desempenho-cursos-cabecalho" aria-hidden="true">
        <span className="desempenho-cursos-cabecalho__col desempenho-cursos-cabecalho__col--identidade">Curso</span>
        <span className="desempenho-cursos-cabecalho__col desempenho-cursos-cabecalho__col--turma">Turma / Professor</span>
        <span className="desempenho-cursos-cabecalho__col desempenho-cursos-cabecalho__col--alunos">Alunos</span>
        <span className="desempenho-cursos-cabecalho__col desempenho-cursos-cabecalho__col--metricas">Módulos / Aval.</span>
        <span className="desempenho-cursos-cabecalho__col desempenho-cursos-cabecalho__col--acoes" />
      </div>

      {/* Lista de desempenho */}
      <ul className="desempenho-cursos" role="list" aria-label="Desempenho dos cursos">
        {listaCursos.filter((c) => c.ativo && (!busca.trim() || c.titulo.toLowerCase().includes(busca.toLowerCase()))).map((curso) => {
          const turmasCurso   = turmas.filter((t) => t.cursoId === curso.id);
          const modulosCurso  = modulos.filter((m) => m.cursoId === curso.id);
          const avsPublicadas = avaliacoes.filter((a) => a.cursoId === curso.id && a.status === "Publicada");
          const totalAlunos   = turmasCurso.reduce((s, t) => s + (t.totalAlunos ?? 0), 0);
          const turmaAtiva    = turmasCurso.find((t) => t.status === "Ativa");
          return (
            <li key={curso.id} className="desempenho-curso-item">
              <div className="desempenho-curso-item__identidade">
                <div className="desempenho-curso-item__cabecalho">
                  <h3 className="desempenho-curso-item__titulo">{curso.titulo}</h3>
                </div>
                <div className="desempenho-curso-item__meta">
                  <span className="desempenho-curso-item__codigo">{curso.codigoRegistro}</span>
                </div>
              </div>

              <div className="desempenho-curso-item__turma">
                <span className="dado-rotulo" aria-hidden="true">Turma / Professor</span>
                {turmaAtiva ? (
                  <>
                    <span className="desempenho-curso-item__turma-nome">{turmaAtiva.nomeTurma}</span>
                    <span className="desempenho-curso-item__professor">
                      {turmaAtiva.professorNome ?? curso.professorNome ?? "Sem professor"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="desempenho-curso-item__sem-turma">Sem turma ativa</span>
                    {curso.professorNome && (
                      <span className="desempenho-curso-item__professor">{curso.professorNome}</span>
                    )}
                  </>
                )}
              </div>

              <div className="desempenho-curso-item__alunos">
                <span className="dado-rotulo" aria-hidden="true">Alunos</span>
                <span className="desempenho-curso-item__alunos-num">{totalAlunos}</span>
              </div>

              <div className="desempenho-curso-item__metricas">
                <span className="dado-rotulo" aria-hidden="true">Módulos / Aval.</span>
                <span className="desempenho-metrica">
                  <strong>{modulosCurso.length}</strong> módulos
                </span>
                <span className="desempenho-metrica">
                  <strong>{avsPublicadas.length}</strong> avaliações
                </span>
              </div>

              <div className="menu-contexto">
                <button
                  className="menu-contexto__botao"
                  onClick={() => setMenuAberto(menuAberto === curso.id ? null : curso.id)}
                  aria-label={`Opções para ${curso.titulo}`}
                  aria-expanded={menuAberto === curso.id}
                  type="button"
                ><TbDotsVertical size={18} aria-hidden="true" /></button>
                {menuAberto === curso.id && (
                  <ul className="menu-contexto__lista" role="menu">
                    <li>
                      <button role="menuitem" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={() => { setCursoSelecionado(curso); setMenuAberto(null); }}>
                        <TbSettings size={20} aria-hidden="true" />Opções
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {listaCursos.filter((c) => c.ativo).length === 0 && (
        <p className="texto-vazio texto-vazio--central" role="status">Nenhum curso ativo sob sua coordenação.</p>
      )}

      {/* Overlay dropdown */}
      {menuAberto && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setMenuAberto(null)} aria-hidden="true" />
      )}

      {/* Modal detalhes + atribuição de professor */}
      {cursoSelecionado && (
        <Modal titulo="Detalhes do Curso" onFechar={tentarFechar} className="modal-caixa--largo">
          <form onSubmit={salvarAlteracoes}>
            <dl className="lista-detalhes">
              <div className="lista-detalhes__item"><dt>Título</dt><dd>{cursoSelecionado.titulo}</dd></div>
              <div className="lista-detalhes__item"><dt>Código</dt><dd>{cursoSelecionado.codigoRegistro}</dd></div>
              <div className="lista-detalhes__item"><dt>Nível</dt><dd>{cursoSelecionado.nivel}</dd></div>
              <div className="lista-detalhes__item"><dt>Descrição</dt><dd>{cursoSelecionado.descricao || "—"}</dd></div>
              <div className="lista-detalhes__item"><dt>Módulos</dt><dd>{modulos.filter((m) => m.cursoId === cursoSelecionado.id).length}</dd></div>
              <div className="lista-detalhes__item"><dt>Alunos</dt><dd>{turmas.filter((t) => t.cursoId === cursoSelecionado.id).reduce((a, t) => a + (t.totalAlunos ?? 0), 0)}</dd></div>
            </dl>

            <div className="detalhe-atribuicoes" style={{ gridTemplateColumns: "1fr" }}>
              <div className="campo">
                <label className="campo__rotulo" htmlFor="coord-professor">Professor</label>
                <SelectUsuario
                  id="coord-professor"
                  value={profAtribuidoId}
                  opcoes={professoresAtivos}
                  onChange={(id) => { setProfAtribuidoId(id); setFormSujo(true); }}
                  placeholder="Sem professor"
                />
              </div>
            </div>

            <div className="modal-rodape">
              <Botao variante="perigo" type="button" onClick={tentarFechar} style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" /> Fechar</Botao>
              <Botao variante="primario" type="submit" style={{ display: "flex", alignItems: "center", gap: "6px" }}><MdSave size={17} aria-hidden="true" /> Salvar alterações</Botao>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirmação de saída sem salvar */}
      {confirmarSaida && (
        <Modal titulo="Sair sem salvar?" onFechar={() => setConfirmarSaida(false)}>
          <p style={{ fontSize: "0.9rem", color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-md)" }}>
            Há alterações não salvas na atribuição do professor. Se sair agora, as alterações serão perdidas.
          </p>
          <div className="modal-rodape">
            <Botao variante="perigo" onClick={() => setConfirmarSaida(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><motion.span whileHover={{ scale: 1.25, rotate: -12 }} transition={{ type: "spring", stiffness: 400, damping: 18 }} style={{ display: "flex" }}><TbPencil size={15} aria-hidden="true" /></motion.span> Continuar editando</Botao>
            <Botao variante="perigo" onClick={() => { setCursoSelecionado(null); }} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbLogout size={15} aria-hidden="true" /> Sair sem salvar</Botao>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function TelaCursos({ usuario, listaCursos, onListaCursosChange, onToast }) {
  if (usuario?.tipo === "Coordenador") return <VistaGerencialCoordenador usuario={usuario} />;

  const [filtro, setFiltro]                     = useState("");
  const [modalAberto, setModalAberto]           = useState(false);
  const [cursoSelecionado, setCursoSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao]             = useState(false);
  const [popupExclusao, setPopupExclusao]       = useState(false);
  const [menuAberto, setMenuAberto]             = useState(null);
  const [cursoDetalhe, setCursoDetalhe]         = useState(null);
  const [formSujo, setFormSujo]                 = useState(false);
  const [confirmarSaida, setConfirmarSaida]     = useState(false);
  const [nivelModal, setNivelModal]               = useState("Iniciante");
  const [visivelNovo, setVisivelNovo]             = useState(false);
  const [campoEditando, setCampoEditando]         = useState(null);
  const [valoresEdit, setValoresEdit]             = useState({});
  const [profSelecionadoId, setProfSelecionadoId] = useState(null);
  const [coordSelecionadoId, setCoordSelecionadoId] = useState(null);
  const [selecionados, setSelecionados]           = useState(new Set());
  const [excluindoEmMassa, setExcluindoEmMassa]  = useState(false);
  const [modalGerenciarAberto, setModalGerenciarAberto] = useState(false);
  const [gerenciarProfId, setGerenciarProfId]           = useState(null);
  const [gerenciarCoordId, setGerenciarCoordId]         = useState(null);

  useEffect(() => {
    setFormSujo(false);
    setConfirmarSaida(false);
    setCampoEditando(null);
    setValoresEdit({});
    setProfSelecionadoId(cursoDetalhe?.professorId ?? null);
    setCoordSelecionadoId(cursoDetalhe?.coordenadorId ?? null);
  }, [cursoDetalhe]);

  const tipo = usuario?.tipo;
  const professoresAtivos    = db.usuarios.listar().filter((u) => u.tipo === "Professor"    && u.ativo);
  const coordenadoresAtivos  = db.usuarios.listar().filter((u) => u.tipo === "Coordenador"  && u.ativo);

  const cursosAtivos = listaCursos
    .filter((c) => c.ativo)
    .filter((c) =>
      c.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
      c.nivel.toLowerCase().includes(filtro.toLowerCase())
    );

  const totalAtivos      = listaCursos.filter((c) => c.ativo).length;
  const totalAlunosSoma  = listaCursos.filter((c) => c.ativo).reduce((acc, c) => acc + (c.totalAlunos ?? 0), 0);
  const qtdTurmasAtivas  = turmas.filter((t) => t.status === "Ativa").length;
  const qtdAvalPublicadas = avaliacoes.filter((a) => a.status === "Publicada").length;

  function abrirEdicao(curso) {
    setCursoSelecionado(curso);
    setModoEdicao(true);
    setNivelModal(curso.nivel ?? "Iniciante");
    setModalAberto(true);
  }

  function tentarFecharDetalhe() {
    if (formSujo) { setConfirmarSaida(true); } else { setCursoDetalhe(null); }
  }

  function salvarAlteracoes(e) {
    e.preventDefault();
    const prof  = professoresAtivos.find((p) => p.id === profSelecionadoId);
    const coord = coordenadoresAtivos.find((c) => c.id === coordSelecionadoId);
    onListaCursosChange((prev) =>
      prev.map((c) =>
        c.id === cursoDetalhe.id
          ? { ...c,
              ...valoresEdit,
              professorId:    profSelecionadoId,  professorNome:    prof?.nome  ?? null,
              coordenadorId:  coordSelecionadoId, coordenadorNome:  coord?.nome ?? null }
          : c
      )
    );
    onToast?.("Alterações salvas.", "sucesso");
    setCursoDetalhe(null);
  }

  function abrirExclusao(curso) {
    setCursoSelecionado(curso);
    setPopupExclusao(true);
  }

  function excluirCurso() {
    const titulo = cursoSelecionado.titulo;
    onListaCursosChange((prev) => prev.filter((c) => c.id !== cursoSelecionado.id));
    setPopupExclusao(false);
    onToast?.(`Curso "${titulo}" excluído.`, "sucesso");
  }

  function criarCurso(e) {
    e.preventDefault();
    const f = e.target;
    onListaCursosChange((prev) => [...prev, {
      id: Date.now(),
      codigoRegistro: `CRS-${String(prev.length + 1).padStart(3, "0")}`,
      titulo:   f["titulo-curso"].value,
      descricao: f["descricao-curso"].value,
      nivel:    nivelModal,
      preco: 0, totalModulos: 0, totalAlunos: 0, ativo: true,
      visivelCatalogo: visivelNovo, destaque: false,
    }]);
    setModalAberto(false);
    onToast?.("Curso criado.", "sucesso");
  }

  const todosSelecionados = cursosAtivos.length > 0 && cursosAtivos.every((c) => selecionados.has(c.id));

  function alternarSelecao(id) {
    setSelecionados((prev) => {
      const novo = new Set(prev);
      novo.has(id) ? novo.delete(id) : novo.add(id);
      return novo;
    });
  }

  function alternarTodos() {
    if (todosSelecionados) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(cursosAtivos.map((c) => c.id)));
    }
  }

  function aplicarGerenciamento() {
    const prof  = professoresAtivos.find((p) => p.id === gerenciarProfId);
    const coord = coordenadoresAtivos.find((c) => c.id === gerenciarCoordId);
    onListaCursosChange((prev) => prev.map((c) => {
      if (!selecionados.has(c.id)) return c;
      return {
        ...c,
        ...(gerenciarProfId  !== null && { professorId: prof?.id ?? null,  professorNome: prof?.nome  ?? null }),
        ...(gerenciarCoordId !== null && { coordenadorId: coord?.id ?? null, coordenadorNome: coord?.nome ?? null }),
      };
    }));
    onToast?.(`${selecionados.size} ${selecionados.size === 1 ? "curso atualizado" : "cursos atualizados"}.`, "sucesso");
    setModalGerenciarAberto(false);
    setGerenciarProfId(null);
    setGerenciarCoordId(null);
    setSelecionados(new Set());
  }

  function confirmarExclusaoEmMassa() {
    const ids = new Set(selecionados);
    onListaCursosChange((prev) => prev.filter((c) => !ids.has(c.id)));
    onToast?.(`${ids.size} ${ids.size === 1 ? "curso excluído" : "cursos excluídos"}.`, "sucesso");
    setSelecionados(new Set());
    setExcluindoEmMassa(false);
  }

  function salvarEdicaoCurso(e) {
    e.preventDefault();
    const f = e.target;
    onListaCursosChange((prev) => prev.map((c) =>
      c.id === cursoSelecionado.id
        ? { ...c, titulo: f["edit-titulo-curso"].value, descricao: f["edit-descricao-curso"].value, nivel: nivelModal }
        : c
    ));
    setModalAberto(false);
    onToast?.("Curso atualizado.", "sucesso");
  }

  return (
    <div className="tela-cursos">
      <header className="cabecalho-pagina" style={{ alignItems: "center" }}>
        <div>
          <h1 className="cabecalho-pagina__titulo">Cursos</h1>
        </div>
        <label htmlFor="busca-cursos" className="visualmente-oculto">Buscar curso</label>
        <div style={{ position: "relative", width: "260px", flexShrink: 0, marginLeft: "auto" }}>
          <TbSearch size={15} aria-hidden="true" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--cor-texto-mudo)", pointerEvents: "none" }} />
          <input
            id="busca-cursos"
            type="search"
            className="campo__entrada"
            placeholder="Buscar por título ou nível..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{ width: "100%", paddingLeft: "32px" }}
          />
        </div>
        <span style={{ width: "1px", height: "24px", background: "var(--cor-borda)", flexShrink: 0 }} aria-hidden="true" />
        {podeCriar(tipo, "cursos") && (
          <Botao variante="primario" onClick={() => { setCursoSelecionado(null); setModoEdicao(false); setNivelModal("Iniciante"); setVisivelNovo(false); setModalAberto(true); }} style={{ display: "flex", alignItems: "center", gap: "6px" }}
            variants={{ hover: { y: -1 } }} whileHover="hover"
          >
            <motion.span variants={{ hover: { rotate: 90 } }} transition={{ type: "spring", stiffness: 400, damping: 18 }} style={{ display: "flex" }}>
              <TbPlus size={20} aria-hidden="true" />
            </motion.span>
            Novo Curso
          </Botao>
        )}
      </header>

      {/* KPIs */}
      <ul className="cursos-kpis" aria-label="Indicadores gerais">
        <li className="cursos-kpi">
          <span className="cursos-kpi__valor">{totalAtivos}</span>
          <span className="cursos-kpi__rotulo">Cursos ativos</span>
        </li>
        <li className="cursos-kpi">
          <span className="cursos-kpi__valor">{totalAlunosSoma}</span>
          <span className="cursos-kpi__rotulo">Alunos matriculados</span>
        </li>
        <li className="cursos-kpi">
          <span className="cursos-kpi__valor">{qtdTurmasAtivas}</span>
          <span className="cursos-kpi__rotulo">Turmas em andamento</span>
        </li>
        <li className="cursos-kpi">
          <span className="cursos-kpi__valor">{qtdAvalPublicadas}</span>
          <span className="cursos-kpi__rotulo">Avaliações publicadas</span>
        </li>
      </ul>

      {/* Ações em massa */}
      <div className="barra-filtros">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--espaco-md)", marginLeft: "auto", flexShrink: 0 }}>
          {podeExcluir(tipo, "cursos") && (
            <>
              <motion.button
                type="button"
                disabled={selecionados.size === 0}
                onClick={() => setExcluindoEmMassa(true)}
                style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: selecionados.size > 0 ? "#f87171" : "#fff", background: "none", border: "none", cursor: selecionados.size > 0 ? "pointer" : "default", padding: 0, opacity: selecionados.size > 0 ? 1 : 0.4 }}
                variants={{ hover: { color: "#f87171", scale: 1.05 } }}
                whileHover={selecionados.size > 0 ? "hover" : undefined}
                whileTap={selecionados.size > 0 ? { scale: 0.93 } : undefined}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
              >
                <TbTrash size={13} aria-hidden="true" />
                {selecionados.size > 0 ? `Excluir (${selecionados.size})` : "Excluir selecionados"}
              </motion.button>
              <span style={{ width: "1px", height: "14px", background: "var(--cor-borda)", flexShrink: 0 }} aria-hidden="true" />
            </>
          )}
          <motion.button
            type="button"
            onClick={() => { setGerenciarProfId(null); setGerenciarCoordId(null); setModalGerenciarAberto(true); }}
            style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            variants={{ hover: { color: "var(--cor-marca)", scale: 1.05 } }}
            whileHover="hover"
            whileTap={{ scale: 0.93 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            <motion.span
              variants={{ hover: { rotate: 90 } }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              style={{ display: "flex" }}
            >
              <TbSettings size={13} aria-hidden="true" />
            </motion.span>
            Gerenciar selecionados
          </motion.button>
        </div>
      </div>

      {/* Cabeçalho da listagem */}
      <div className="desempenho-cursos-cabecalho">
        {podeExcluir(tipo, "cursos") && (
          <span className="desempenho-cursos-cabecalho__col desempenho-cursos-cabecalho__col--checkbox">
            <input
              type="checkbox"
              className="tabela-checkbox"
              checked={todosSelecionados}
              onChange={alternarTodos}
              aria-label="Selecionar todos os cursos"
            />
          </span>
        )}
        <span className="desempenho-cursos-cabecalho__col desempenho-cursos-cabecalho__col--identidade">Curso</span>
        <span className="desempenho-cursos-cabecalho__col desempenho-cursos-cabecalho__col--turma">Turma / Professor</span>
        <span className="desempenho-cursos-cabecalho__col desempenho-cursos-cabecalho__col--alunos">Alunos</span>
        <span className="desempenho-cursos-cabecalho__col desempenho-cursos-cabecalho__col--metricas">Módulos / Aval.</span>
        <span className="desempenho-cursos-cabecalho__col desempenho-cursos-cabecalho__col--acoes" aria-hidden="true" />
      </div>

      {/* Lista de desempenho */}
      <ul className="desempenho-cursos" role="list" aria-label="Desempenho dos cursos ativos">
        {cursosAtivos.map((curso) => {
          const turmasCurso   = turmas.filter((t) => t.cursoId === curso.id);
          const modulosCurso  = modulos.filter((m) => m.cursoId === curso.id);
          const avsPublicadas = avaliacoes.filter((a) => a.cursoId === curso.id && a.status === "Publicada");
          const totalAlunos   = turmasCurso.reduce((s, t) => s + (t.totalAlunos ?? 0), 0);
          const turmaAtiva    = turmasCurso.find((t) => t.status === "Ativa");
          return (
            <li key={curso.id} className={`desempenho-curso-item${selecionados.has(curso.id) ? " desempenho-curso-item--selecionado" : ""}`}>
              {/* Checkbox de seleção */}
              {podeExcluir(tipo, "cursos") && (
                <div className="desempenho-curso-item__checkbox">
                  <input
                    type="checkbox"
                    className="tabela-checkbox"
                    checked={selecionados.has(curso.id)}
                    onChange={() => alternarSelecao(curso.id)}
                    aria-label={`Selecionar ${curso.titulo}`}
                  />
                </div>
              )}
              {/* Nome + código + nível */}
              <div className="desempenho-curso-item__identidade">
                <div className="desempenho-curso-item__cabecalho">
                  <h3 className="desempenho-curso-item__titulo">{curso.titulo}</h3>
                </div>
                <div className="desempenho-curso-item__meta">
                  <span className="desempenho-curso-item__codigo">{curso.codigoRegistro}</span>
                </div>
              </div>

              {/* Turma e professor */}
              <div className="desempenho-curso-item__turma">
                <span className="dado-rotulo" aria-hidden="true">Turma / Professor</span>
                {turmaAtiva ? (
                  <>
                    <span className="desempenho-curso-item__turma-nome">{turmaAtiva.nomeTurma}</span>
                    <span className="desempenho-curso-item__professor">
                      {turmaAtiva.professorNome ?? curso.professorNome ?? "Sem professor"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="desempenho-curso-item__sem-turma">Sem turma ativa</span>
                    {curso.professorNome && (
                      <span className="desempenho-curso-item__professor">{curso.professorNome}</span>
                    )}
                  </>
                )}
              </div>

              {/* Alunos */}
              <div className="desempenho-curso-item__alunos">
                <span className="dado-rotulo" aria-hidden="true">Alunos</span>
                <span className="desempenho-curso-item__alunos-num">{totalAlunos}</span>
              </div>

              {/* Módulos e avaliações */}
              <div className="desempenho-curso-item__metricas">
                <span className="dado-rotulo" aria-hidden="true">Módulos / Aval.</span>
                <span className="desempenho-metrica">
                  <strong>{modulosCurso.length}</strong> módulos
                </span>
                <span className="desempenho-metrica">
                  <strong>{avsPublicadas.length}</strong> avaliações
                </span>
              </div>

              {/* Menu de ações */}
              <div className="menu-contexto">
                <button
                  className="menu-contexto__botao"
                  onClick={() => setMenuAberto(menuAberto === curso.id ? null : curso.id)}
                  aria-label={`Opções para ${curso.titulo}`}
                  aria-expanded={menuAberto === curso.id}
                  type="button"
                ><TbDotsVertical size={18} aria-hidden="true" /></button>
                {menuAberto === curso.id && (
                  <ul className="menu-contexto__lista" role="menu">
                    <li>
                      <button role="menuitem" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={() => { setCursoDetalhe(curso); setMenuAberto(null); }}>
                        <TbSettings size={20} aria-hidden="true" />Opções
                      </button>
                    </li>
                    {podeExcluir(tipo, "cursos") && (
                      <li>
                        <button role="menuitem" className="menu-item--perigo" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={() => { abrirExclusao(curso); setMenuAberto(null); }}>
                          <TbTrash size={20} aria-hidden="true" />Excluir
                        </button>
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {cursosAtivos.length === 0 && (
        <p className="texto-vazio texto-vazio--central" role="status">
          {filtro ? `Nenhum curso encontrado para "${filtro}".` : "Nenhum curso ativo cadastrado."}
        </p>
      )}

      {/* Overlay dropdown */}
      {menuAberto && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setMenuAberto(null)} aria-hidden="true" />
      )}

      {/* Modal detalhes + atribuições */}
      {cursoDetalhe && (
        <Modal titulo="Detalhes do Curso" onFechar={tentarFecharDetalhe} className="modal-caixa--largo">
          <form onSubmit={salvarAlteracoes}>
            <dl className="lista-detalhes">
              <div className="lista-detalhes__item">
                <dt>Título</dt>
                {campoEditando === "titulo" ? (
                  <input
                    className="campo__entrada campo__entrada--inline"
                    defaultValue={valoresEdit.titulo ?? cursoDetalhe.titulo}
                    autoFocus
                    onBlur={(e) => { setValoresEdit((v) => ({ ...v, titulo: e.target.value })); setCampoEditando(null); setFormSujo(true); }}
                    onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                  />
                ) : (
                  <dd>{valoresEdit.titulo ?? cursoDetalhe.titulo}</dd>
                )}
                {podeEditar(tipo, "cursos") && (
                  <button className="btn-editar-linha" type="button" title="Editar título" onClick={() => setCampoEditando("titulo")}><motion.span whileHover={{ scale: 1.25, rotate: -12 }} transition={{ type: "spring", stiffness: 400, damping: 18 }} style={{ display: "flex" }}><TbPencil size={17} /></motion.span></button>
                )}
              </div>

              <div className="lista-detalhes__item"><dt>Código</dt><dd>{cursoDetalhe.codigoRegistro}</dd></div>

              <div className="lista-detalhes__item">
                <dt>Nível</dt>
                {podeEditar(tipo, "cursos") ? (
                  <SelectSimples
                    value={valoresEdit.nivel ?? cursoDetalhe.nivel}
                    opcoes={["Básico", "Intermediário", "Avançado"]}
                    onChange={(val) => { setValoresEdit((v) => ({ ...v, nivel: val })); setFormSujo(true); }}
                  />
                ) : (
                  <dd>{cursoDetalhe.nivel}</dd>
                )}
              </div>

              <div className="lista-detalhes__item">
                <dt>Descrição</dt>
                {campoEditando === "descricao" ? (
                  <textarea
                    className="campo__entrada campo__entrada--inline"
                    defaultValue={valoresEdit.descricao ?? cursoDetalhe.descricao}
                    rows={3}
                    autoFocus
                    onBlur={(e) => { setValoresEdit((v) => ({ ...v, descricao: e.target.value })); setCampoEditando(null); setFormSujo(true); }}
                  />
                ) : (
                  <dd>{(valoresEdit.descricao ?? cursoDetalhe.descricao) || "—"}</dd>
                )}
                {podeEditar(tipo, "cursos") && (
                  <button className="btn-editar-linha" type="button" title="Editar descrição" onClick={() => setCampoEditando("descricao")}><motion.span whileHover={{ scale: 1.25, rotate: -12 }} transition={{ type: "spring", stiffness: 400, damping: 18 }} style={{ display: "flex" }}><TbPencil size={17} /></motion.span></button>
                )}
              </div>

              <div className="lista-detalhes__item"><dt>Catálogo</dt><dd>{cursoDetalhe.visivelCatalogo ? "Visível" : "Oculto"}</dd></div>
            </dl>

            {podeEditar(tipo, "cursos") && (
              <div className="detalhe-atribuicoes">
                <div className="campo">
                  <label className="campo__rotulo" htmlFor="det-professor">Professor</label>
                  <SelectUsuario
                    id="det-professor"
                    value={profSelecionadoId}
                    opcoes={professoresAtivos}
                    onChange={(id) => { setProfSelecionadoId(id); setFormSujo(true); }}
                    placeholder="Sem professor"
                  />
                </div>
                <div className="campo">
                  <label className="campo__rotulo" htmlFor="det-coordenador">Coordenador</label>
                  <SelectUsuario
                    id="det-coordenador"
                    value={coordSelecionadoId}
                    opcoes={coordenadoresAtivos}
                    onChange={(id) => { setCoordSelecionadoId(id); setFormSujo(true); }}
                    placeholder="Sem coordenador"
                  />
                </div>
              </div>
            )}

            <div className="modal-rodape">
              <Botao variante="perigo" type="button" onClick={tentarFecharDetalhe} style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" /> Fechar</Botao>
              {podeEditar(tipo, "cursos") && (
                <Botao variante="primario" type="submit" style={{ display: "flex", alignItems: "center", gap: "6px" }}><MdSave size={17} aria-hidden="true" /> Salvar alterações</Botao>
              )}
            </div>
          </form>

        </Modal>
      )}

      {/* Confirmação de saída sem salvar */}
      {confirmarSaida && (
        <Modal titulo="Sair sem salvar?" onFechar={() => setConfirmarSaida(false)}>
          <p style={{ fontSize: "0.9rem", color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-md)" }}>
            Há alterações não salvas nas atribuições. Se sair agora, as alterações serão perdidas.
          </p>
          <div className="modal-rodape">
            <Botao variante="perigo" onClick={() => setConfirmarSaida(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbPencil size={15} aria-hidden="true" /> Continuar editando</Botao>
            <Botao variante="perigo" onClick={() => { setCursoDetalhe(null); }} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbLogout size={15} aria-hidden="true" /> Sair sem salvar</Botao>
          </div>
        </Modal>
      )}

      {/* Modal editar */}
      {modalAberto && cursoSelecionado && modoEdicao && (
        <Modal titulo="Editar Curso" onFechar={() => setModalAberto(false)}>
          <form className="formulario-modal" onSubmit={salvarEdicaoCurso}>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="edit-titulo-curso">Título *</label>
              <input id="edit-titulo-curso" className="campo__entrada" type="text" defaultValue={cursoSelecionado.titulo} required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="edit-descricao-curso">Descrição</label>
              <textarea id="edit-descricao-curso" className="campo__entrada" rows={3} defaultValue={cursoSelecionado.descricao} />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="edit-nivel-curso">Nível</label>
              <SelectSimples
                id="edit-nivel-curso"
                value={nivelModal}
                opcoes={["Iniciante", "Intermediário", "Avançado"]}
                onChange={setNivelModal}
              />
            </div>
            <div className="modal-rodape">
              <Botao variante="perigo" type="button" onClick={() => setModalAberto(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" /> Cancelar</Botao>
              <Botao variante="primario" type="submit" style={{ display: "flex", alignItems: "center", gap: "6px" }}><MdSave size={17} aria-hidden="true" /> Salvar alterações</Botao>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal criar */}
      {modalAberto && !cursoSelecionado && (
        <Modal titulo="Novo Curso" onFechar={() => setModalAberto(false)}>
          <form className="formulario-modal" onSubmit={criarCurso}>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="titulo-curso">Título *</label>
              <input id="titulo-curso" className="campo__entrada" type="text" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="descricao-curso">Descrição</label>
              <textarea id="descricao-curso" className="campo__entrada" rows={3} />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="nivel-curso">Nível</label>
              <SelectSimples
                id="nivel-curso"
                value={nivelModal}
                opcoes={["Iniciante", "Intermediário", "Avançado"]}
                onChange={setNivelModal}
              />
            </div>
            <div className="campo">
              <span className="campo__rotulo">Visibilidade no catálogo</span>
              <button
                type="button"
                className={`catalogo-toggle${visivelNovo ? " catalogo-toggle--ativo" : ""}`}
                onClick={() => setVisivelNovo((v) => !v)}
                aria-pressed={visivelNovo}
              >
                <span className="catalogo-toggle__trilha" aria-hidden="true">
                  <span className="catalogo-toggle__thumb" />
                </span>
                <span className="catalogo-toggle__rotulo">
                  {visivelNovo ? "Visível" : "Oculto"}
                </span>
              </button>
            </div>
            <div className="modal-rodape">
              <Botao variante="perigo" type="button" onClick={() => setModalAberto(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" /> Cancelar</Botao>
              <Botao variante="primario" type="submit" style={{ display: "flex", alignItems: "center", gap: "6px" }}><MdSave size={19} aria-hidden="true" />Salvar</Botao>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal — Gerenciar selecionados */}
      {modalGerenciarAberto && (
        <Modal titulo="Gerenciar selecionados" onFechar={() => setModalGerenciarAberto(false)}>
          {selecionados.size === 0 ? (
            <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-lg)" }}>
              Nenhum curso selecionado. Marque os cursos na lista antes de gerenciar.
            </p>
          ) : (
            <>
              <p style={{ fontSize: "0.82rem", color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-md)" }}>
                {selecionados.size} {selecionados.size === 1 ? "curso selecionado" : "cursos selecionados"}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: "var(--espaco-lg)", display: "flex", flexDirection: "column", gap: "var(--espaco-xs)" }}>
                {listaCursos.filter((c) => selecionados.has(c.id)).map((c) => (
                  <li key={c.id} style={{ display: "flex", alignItems: "center", gap: "var(--espaco-sm)", padding: "var(--espaco-sm) var(--espaco-md)", background: "var(--cor-fundo)", borderRadius: "var(--raio-sm)", border: "1px solid var(--cor-borda)" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--cor-marca)", flexShrink: 0 }} aria-hidden="true" />
                    <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--cor-texto-forte)" }}>{c.titulo}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--cor-texto-mudo)", marginLeft: "auto" }}>{c.codigoRegistro}</span>
                  </li>
                ))}
              </ul>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--espaco-md)", marginBottom: "var(--espaco-xl)" }}>
                <div>
                  <label className="campo__rotulo" htmlFor="gerenciar-professor">Professor</label>
                  <SelectUsuario
                    id="gerenciar-professor"
                    opcoes={professoresAtivos}
                    value={gerenciarProfId}
                    onChange={setGerenciarProfId}
                    placeholder="Manter atual / sem alteração"
                  />
                </div>
                <div>
                  <label className="campo__rotulo" htmlFor="gerenciar-coordenador">Coordenador</label>
                  <SelectUsuario
                    id="gerenciar-coordenador"
                    opcoes={coordenadoresAtivos}
                    value={gerenciarCoordId}
                    onChange={setGerenciarCoordId}
                    placeholder="Manter atual / sem alteração"
                  />
                </div>
              </div>
            </>
          )}
          <footer className="modal-rodape">
            <Botao variante="perigo" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={() => setModalGerenciarAberto(false)}><TbX size={15} aria-hidden="true" />Cancelar</Botao>
            <Botao
              variante="sucesso"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
              disabled={selecionados.size === 0 || (gerenciarProfId === null && gerenciarCoordId === null)}
              onClick={aplicarGerenciamento}
            >
              <MdSave size={16} aria-hidden="true" /> Salvar
            </Botao>
          </footer>
        </Modal>
      )}

      {/* Confirmação exclusão em massa */}
      {excluindoEmMassa && (
        <Modal titulo="Excluir cursos" onFechar={() => setExcluindoEmMassa(false)}>
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
            Tem certeza que deseja excluir <strong>{selecionados.size} {selecionados.size === 1 ? "curso" : "cursos"}</strong>? Esta ação não pode ser desfeita.
          </p>
          <footer className="modal-rodape">
            <Botao variante="perigo" onClick={() => setExcluindoEmMassa(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" /> Cancelar</Botao>
            <Botao variante="sucesso" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={confirmarExclusaoEmMassa}><TbTrash size={16} aria-hidden="true" />Confirmar exclusão</Botao>
          </footer>
        </Modal>
      )}

      {/* Popup de exclusão */}
      {popupExclusao && cursoSelecionado && (
        <Modal titulo="Excluir curso" onFechar={() => setPopupExclusao(false)}>
          <p style={{ fontSize: "0.9rem", color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-md)" }}>
            Tem certeza que deseja excluir o curso{" "}
            <strong style={{ color: "var(--cor-texto-forte)" }}>{cursoSelecionado.titulo}</strong>?
            <br />
            <span style={{ fontSize: "0.8rem", color: "#fca5a5", marginTop: "var(--espaco-xs)", display: "block" }}>
              Esta ação não pode ser desfeita.
            </span>
          </p>
          <div className="modal-rodape">
            <Botao variante="perigo" onClick={() => setPopupExclusao(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" /> Cancelar</Botao>
            <Botao variante="perigo" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={excluirCurso}><TbTrash size={16} aria-hidden="true" />Excluir permanentemente</Botao>
          </div>
        </Modal>
      )}
    </div>
  );
}
