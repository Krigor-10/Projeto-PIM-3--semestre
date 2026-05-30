import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { TbChevronUp, TbChevronDown, TbSelector, TbDotsVertical, TbPlus, TbX, TbCheck, TbTrash, TbChevronLeft, TbChevronRight, TbSettings, TbPencil, TbSearch } from "react-icons/tb";
import { motion } from "framer-motion";
import { MdSave, MdDelete } from "react-icons/md";
import Insignia from "@/componentes/Insignia.jsx";
import Modal from "@/componentes/Modal.jsx";
import Botao from "@/componentes/Botao.jsx";
import { db } from "@/dados/db.js";
import { podeCriar, podeEditar, podeExcluir } from "@/dados/permissoes.js";

const ITENS_POR_PAGINA = 8;

function gerarIniciais(nome) {
  return (nome ?? "").split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function IconeOrdenacao({ campo, ordenacao }) {
  if (ordenacao.campo !== campo) return <TbSelector size={14} aria-hidden="true" />;
  return ordenacao.direcao === "asc"
    ? <TbChevronUp   size={14} aria-hidden="true" />
    : <TbChevronDown size={14} aria-hidden="true" />;
}

export default function TelaCoordenadores({ usuario, onToast }) {
  const tipo = usuario?.tipo;
  const podeEditar_  = podeEditar(tipo, "coordenadores");
  const podeExcluir_ = podeExcluir(tipo, "coordenadores");

  const [lista, setLista]             = useState(() => db.usuarios.listar().filter((u) => u.tipo === "Coordenador"));
  const [cursosLista, setCursosLista] = useState(() => db.cursos.listar());
  useEffect(() => { db.usuarios.salvarPorTipo("Coordenador", lista); }, [lista]);
  useEffect(() => { db.cursos.salvar(cursosLista); }, [cursosLista]);

  const [busca, setBusca]               = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [ordenacao, setOrdenacao]       = useState({ campo: "nome", direcao: "asc" });
  const [pagina, setPagina]             = useState(1);

  const [selecionados, setSelecionados]         = useState(new Set());
  const [removendoEmMassa, setRemovendoEmMassa] = useState(false);

  const [kebabAberto,      setKebabAberto]      = useState(null);
  const [kebabPos,         setKebabPos]         = useState({ top: 0, left: 0 });
  const [coordDetalhe,     setCoordDetalhe]     = useState(null);
  const [modoEdicao,       setModoEdicao]       = useState(false);
  const [coordRemovendo,     setCoordRemovendo]     = useState(null);
  const [confirmandoStatus,  setConfirmandoStatus]  = useState(null);
  const [modalNovoAberto,    setModalNovoAberto]    = useState(false);
  const [atribuindoCursos,        setAtribuindoCursos]        = useState(null);
  const [cursosSelecionados,      setCursosSelecionados]      = useState(new Set());
  const [confirmandoRemocaoCurso, setConfirmandoRemocaoCurso] = useState(null);

  const kebabRef = useRef(null);

  useEffect(() => {
    if (!kebabAberto) return;
    function fechar(e) {
      if (kebabRef.current && !kebabRef.current.contains(e.target)) setKebabAberto(null);
    }
    document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, [kebabAberto]);

  function abrirKebab(e, coordId) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setKebabPos({ top: rect.bottom + 6, left: rect.right - 192 });
    setKebabAberto((prev) => (prev === coordId ? null : coordId));
  }

  function alternarAtivo(id) {
    const alvo = lista.find((u) => u.id === id);
    const novoEstado = !alvo.ativo;
    setLista((prev) => prev.map((u) => u.id === id ? { ...u, ativo: novoEstado } : u));
    if (coordDetalhe?.id === id) setCoordDetalhe((prev) => ({ ...prev, ativo: novoEstado }));
    onToast?.(
      novoEstado ? `${alvo.nome} foi ativado` : `${alvo.nome} foi desativado`,
      novoEstado ? "sucesso" : "aviso"
    );
  }

  function abrirAtribuicaoCursos(coord) {
    setAtribuindoCursos(coord);
    setCursosSelecionados(new Set(cursosLista.filter((c) => c.coordenadorId === coord.id).map((c) => c.id)));
    setCoordDetalhe(null);
  }

  function salvarAtribuicaoCursos() {
    setCursosLista((prev) =>
      prev.map((c) => {
        const eraDesteCoord = c.coordenadorId === atribuindoCursos.id;
        const agora = cursosSelecionados.has(c.id);
        if (agora)         return { ...c, coordenadorId: atribuindoCursos.id };
        if (eraDesteCoord) return { ...c, coordenadorId: null };
        return c;
      })
    );
    onToast?.(`Cursos de ${atribuindoCursos.nome.split(" ")[0]} atualizados`, "sucesso");
    setCoordDetalhe(atribuindoCursos);
    setAtribuindoCursos(null);
  }

  function alternarCurso(cursoId) {
    setCursosSelecionados((prev) => {
      const prox = new Set(prev);
      prox.has(cursoId) ? prox.delete(cursoId) : prox.add(cursoId);
      return prox;
    });
  }

  function confirmarRemocao() {
    setLista((prev) => prev.filter((u) => u.id !== coordRemovendo));
    if (coordDetalhe?.id === coordRemovendo) setCoordDetalhe(null);
    setCoordRemovendo(null);
  }

  function salvarEdicao(e) {
    e.preventDefault();
    const f = e.target;
    const atualizado = {
      ...coordDetalhe,
      nome:  f["edit-nome"].value.trim(),
      email: f["edit-email"].value.trim(),
    };
    setLista((prev) => prev.map((u) => u.id === atualizado.id ? atualizado : u));
    setCoordDetalhe(atualizado);
    setModoEdicao(false);
  }

  function alternarSelecionado(e, id) {
    e.stopPropagation();
    setSelecionados((prev) => {
      const prox = new Set(prev);
      prox.has(id) ? prox.delete(id) : prox.add(id);
      return prox;
    });
  }

  function alternarTodos(e) {
    e.stopPropagation();
    const ids = itensPagina.map((c) => c.id);
    const todos = ids.every((id) => selecionados.has(id));
    setSelecionados((prev) => {
      const prox = new Set(prev);
      todos ? ids.forEach((id) => prox.delete(id)) : ids.forEach((id) => prox.add(id));
      return prox;
    });
  }

  function ativarSelecionados() {
    setLista((prev) => prev.map((u) => selecionados.has(u.id) ? { ...u, ativo: true  } : u));
    setSelecionados(new Set());
  }

  function desativarSelecionados() {
    setLista((prev) => prev.map((u) => selecionados.has(u.id) ? { ...u, ativo: false } : u));
    setSelecionados(new Set());
  }

  function confirmarRemocaoEmMassa() {
    setLista((prev) => prev.filter((u) => !selecionados.has(u.id)));
    setSelecionados(new Set());
    setRemovendoEmMassa(false);
  }

  function alternarOrdenacao(campo) {
    setOrdenacao((prev) =>
      prev.campo === campo
        ? { campo, direcao: prev.direcao === "asc" ? "desc" : "asc" }
        : { campo, direcao: "asc" }
    );
    setPagina(1);
  }

  const listaProcessada = useMemo(() => {
    let r = lista;
    if (busca.trim()) {
      const t = busca.toLowerCase();
      r = r.filter((u) => u.nome.toLowerCase().includes(t) || u.email.toLowerCase().includes(t));
    }
    if (filtroStatus === "ativos")   r = r.filter((u) =>  u.ativo);
    if (filtroStatus === "inativos") r = r.filter((u) => !u.ativo);
    return [...r].sort((a, b) => {
      let va = ordenacao.campo === "ativo" ? (a.ativo ? 1 : 0) : a[ordenacao.campo];
      let vb = ordenacao.campo === "ativo" ? (b.ativo ? 1 : 0) : b[ordenacao.campo];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      return (va < vb ? -1 : va > vb ? 1 : 0) * (ordenacao.direcao === "asc" ? 1 : -1);
    });
  }, [lista, busca, filtroStatus, ordenacao]);

  const totalPaginas  = Math.max(1, Math.ceil(listaProcessada.length / ITENS_POR_PAGINA));
  const paginaSegura  = Math.min(pagina, totalPaginas);
  const inicio        = (paginaSegura - 1) * ITENS_POR_PAGINA;
  const itensPagina   = listaProcessada.slice(inicio, inicio + ITENS_POR_PAGINA);
  const totalAtivos   = lista.filter((u) =>  u.ativo).length;
  const totalInativos = lista.filter((u) => !u.ativo).length;

  const idsVisiveis        = itensPagina.map((c) => c.id);
  const todosSelecionados  = idsVisiveis.length > 0 && idsVisiveis.every((id) => selecionados.has(id));
  const algunsSelecionados = !todosSelecionados && idsVisiveis.some((id) => selecionados.has(id));

  const checkboxHeaderRef = useRef(null);
  useEffect(() => {
    if (checkboxHeaderRef.current)
      checkboxHeaderRef.current.indeterminate = algunsSelecionados;
  }, [algunsSelecionados]);

  const colunas = [
    { chave: "nome",         rotulo: "Coordenador" },
    { chave: "dataCadastro", rotulo: "Cadastro"    },
    { chave: "ativo",        rotulo: "Status"      },
  ];

  const coordKebab = lista.find((c) => c.id === kebabAberto);

  return (
    <div className="tela-coordenadores">
      <header className="cabecalho-pagina" style={{ alignItems: "center" }}>
        <div>
          <h1 className="cabecalho-pagina__titulo">Coordenadores</h1>
          <p className="cabecalho-pagina__subtitulo">
            {lista.length} cadastrados · {totalAtivos} ativos · {totalInativos} inativos
          </p>
        </div>
        <div style={{ position: "relative", width: "260px", flexShrink: 0, marginLeft: "auto" }}>
          <TbSearch size={15} aria-hidden="true" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--cor-texto-mudo)", pointerEvents: "none" }} />
          <label htmlFor="busca-coord" className="visualmente-oculto">Buscar coordenador</label>
          <input
            id="busca-coord"
            type="search"
            className="campo__entrada barra-filtros__busca"
            placeholder="Buscar por nome ou e-mail…"
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
            style={{ width: "100%", paddingLeft: "32px" }}
          />
        </div>
        <span style={{ width: "1px", height: "24px", background: "var(--cor-borda)", flexShrink: 0 }} aria-hidden="true" />
        {podeCriar(tipo, "coordenadores") && (
          <Botao variante="primario" onClick={() => setModalNovoAberto(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}
            variants={{ hover: { y: -1 } }} whileHover="hover"
          >
            <motion.span
              variants={{ hover: { rotate: 90 } }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              style={{ display: "flex" }}
            >
              <TbPlus size={20} aria-hidden="true" />
            </motion.span>
            Novo Coordenador
          </Botao>
        )}
      </header>

      {/* Filtros */}
      <div className="barra-filtros">
        <div className="segmented-control" role="group" aria-label="Filtrar por status">
          {[
            { valor: "todos",    rotulo: "Todos"    },
            { valor: "ativos",   rotulo: "Ativos"   },
            { valor: "inativos", rotulo: "Inativos" },
          ].map(({ valor, rotulo }) => (
            <button
              key={valor}
              className={`segmented-control__opcao${filtroStatus === valor ? " segmented-control__opcao--ativa" : ""}`}
              onClick={() => { setFiltroStatus(valor); setPagina(1); }}
              type="button"
            >
              {rotulo}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="tabela-dados-container painel-secao">
        <table className="tabela-dados" aria-label="Lista de coordenadores">
          <thead>
            <tr>
              {podeEditar_ && (
                <th scope="col" style={{ width: 40 }}>
                  <input
                    ref={checkboxHeaderRef}
                    type="checkbox"
                    className="tabela-checkbox"
                    checked={todosSelecionados}
                    onChange={alternarTodos}
                    aria-label="Selecionar todos desta página"
                  />
                </th>
              )}
              {colunas.map(({ chave, rotulo }) => (
                <th key={rotulo} scope="col">
                  <button className="tabela-dados__th-btn" onClick={() => alternarOrdenacao(chave)} type="button">
                    {rotulo} <IconeOrdenacao campo={chave} ordenacao={ordenacao} />
                  </button>
                </th>
              ))}
              <th scope="col" style={{ width: 48 }} />
            </tr>
          </thead>

          <tbody>
            {itensPagina.length === 0 ? (
              <tr className="tabela-dados--sem-dados">
                <td colSpan={podeEditar_ ? 5 : 4}>Nenhum coordenador encontrado.</td>
              </tr>
            ) : itensPagina.map((coord) => (
              <tr
                key={coord.id}
                className={`tabela-linha-clicavel${selecionados.has(coord.id) ? " tabela-linha-clicavel--selecionada" : ""}`}
                onClick={() => setCoordDetalhe(coord)}
              >
                {podeEditar_ && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="tabela-checkbox"
                      checked={selecionados.has(coord.id)}
                      onChange={(e) => alternarSelecionado(e, coord.id)}
                      aria-label={`Selecionar ${coord.nome}`}
                    />
                  </td>
                )}
                <td>
                  <div className="tabela-aluno">
                    <div className="topbar__avatar tabela-aluno__avatar" aria-hidden="true">
                      {gerarIniciais(coord.nome)}
                    </div>
                    <div>
                      <strong className="tabela-aluno__nome">{coord.nome}</strong>
                      <span className="tabela-aluno__email">{coord.email}</span>
                    </div>
                  </div>
                </td>
                <td>{new Date(coord.dataCadastro).toLocaleDateString("pt-BR")}</td>
                <td>
                  <Insignia texto={coord.ativo ? "Ativo" : "Inativo"} variante={coord.ativo ? "sucesso" : "erro"} />
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button
                    className="kebab-btn"
                    onClick={(e) => abrirKebab(e, coord.id)}
                    aria-label={`Ações para ${coord.nome}`}
                    aria-haspopup="menu"
                    aria-expanded={kebabAberto === coord.id}
                    type="button"
                  >
                    <TbDotsVertical size={16} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <nav className="paginacao" aria-label="Paginação de coordenadores">
          <span className="paginacao__info">
            {inicio + 1}–{Math.min(inicio + ITENS_POR_PAGINA, listaProcessada.length)} de {listaProcessada.length}
          </span>
          <div className="paginacao__controles">
            <Botao variante="fantasma" tamanho="pequeno" onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={paginaSegura === 1} style={{ display: "flex", alignItems: "center", gap: "4px" }}><TbChevronLeft size={14} aria-hidden="true" /> Anterior</Botao>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <button key={n} className={`paginacao__pagina${paginaSegura === n ? " paginacao__pagina--ativa" : ""}`} onClick={() => setPagina(n)} type="button" aria-current={paginaSegura === n ? "page" : undefined}>{n}</button>
            ))}
            <Botao variante="fantasma" tamanho="pequeno" onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={paginaSegura === totalPaginas} style={{ display: "flex", alignItems: "center", gap: "4px" }}>Próxima <TbChevronRight size={14} aria-hidden="true" /></Botao>
          </div>
        </nav>
      )}

      {/* Barra de ações em massa */}
      {podeEditar_ && selecionados.size > 0 && createPortal(
        <div className="barra-massa" role="toolbar" aria-label="Ações em massa">
          <span className="barra-massa__contador">
            {selecionados.size} {selecionados.size === 1 ? "selecionado" : "selecionados"}
          </span>
          <div className="barra-massa__acoes">
            <Botao variante="sucesso" tamanho="pequeno" onClick={ativarSelecionados}>Ativar</Botao>
            <Botao tamanho="pequeno" style={{ background: "var(--cor-aviso-fundo)", color: "var(--cor-aviso)", border: "1px solid var(--cor-aviso)" }} onClick={desativarSelecionados}>Desativar</Botao>
            {podeExcluir_ && (
              <Botao variante="perigo" tamanho="pequeno" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={() => setRemovendoEmMassa(true)}><TbTrash size={15} aria-hidden="true" />Remover</Botao>
            )}
          </div>
          <button className="barra-massa__limpar" onClick={() => setSelecionados(new Set())} aria-label="Limpar seleção" type="button">✕</button>
        </div>,
        document.body
      )}

      {/* Kebab portal */}
      {kebabAberto && coordKebab && createPortal(
        <div className="kebab-menu" role="menu" style={{ top: kebabPos.top, left: kebabPos.left }} ref={kebabRef}>
          <button role="menuitem" className="kebab-menu__item" type="button"
            onClick={() => { setCoordDetalhe(coordKebab); setKebabAberto(null); }} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <TbSettings size={20} aria-hidden="true" /> Opções
          </button>
        </div>,
        document.body
      )}

      {/* Modal detalhes / edição inline */}
      {coordDetalhe && (() => {
        const cursosCoord = cursosLista.filter((c) => c.coordenadorId === coordDetalhe.id);
        return (
          <Modal
            titulo={modoEdicao ? "Editar Coordenador" : "Detalhes do Coordenador"}
            onFechar={() => { setCoordDetalhe(null); setModoEdicao(false); }}
          >
            {modoEdicao ? (
              <>
                <div className="modal-edicao__avatar" aria-hidden="true">
                  {gerarIniciais(coordDetalhe.nome)}
                </div>
                <form className="formulario-modal" onSubmit={salvarEdicao}>
                  <div className="campo">
                    <label className="campo__rotulo" htmlFor="edit-nome">Nome completo *</label>
                    <input id="edit-nome" className="campo__entrada" type="text" defaultValue={coordDetalhe.nome} required />
                  </div>
                  <div className="campo">
                    <label className="campo__rotulo" htmlFor="edit-email">E-mail *</label>
                    <input id="edit-email" className="campo__entrada" type="email" defaultValue={coordDetalhe.email} required />
                  </div>
                  <footer className="modal-rodape">
                    <Botao variante="perigo" type="button" onClick={() => setModoEdicao(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" /> Cancelar</Botao>
                    <Botao variante="primario" type="submit" style={{ display: "flex", alignItems: "center", gap: "6px" }}><MdSave size={17} aria-hidden="true" /> Salvar alterações</Botao>
                  </footer>
                </form>
              </>
            ) : (
              <>
                <div className="detalhe-aluno">
                  <div className="detalhe-aluno__perfil">
                    <div className="topbar__avatar detalhe-aluno__avatar" aria-hidden="true">
                      {gerarIniciais(coordDetalhe.nome)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 className="detalhe-aluno__nome">{coordDetalhe.nome}</h3>
                      <span className="detalhe-aluno__email">{coordDetalhe.email}</span>
                    </div>
                    <Insignia texto={coordDetalhe.ativo ? "Ativo" : "Inativo"} variante={coordDetalhe.ativo ? "sucesso" : "erro"} />
                    {podeEditar_ && (
                      <button
                        type="button"
                        className="modal-cabecalho__btn-icone"
                        onClick={() => setModoEdicao(true)}
                        aria-label="Editar coordenador"
                        data-tooltip="Editar dados"
                      >
                        <TbPencil size={15} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <dl className="detalhe-aluno__dados">
                    <div className="detalhe-aluno__dado">
                      <dt>Código</dt>
                      <dd style={{ fontFamily: "var(--fonte-mono)", fontSize: "0.85rem" }}>{coordDetalhe.codigo ?? "—"}</dd>
                    </div>
                    <div className="detalhe-aluno__dado">
                      <dt>Cadastro</dt>
                      <dd>{new Date(coordDetalhe.dataCadastro).toLocaleDateString("pt-BR")}</dd>
                    </div>
                    {coordDetalhe.telefone && (
                      <div className="detalhe-aluno__dado">
                        <dt>Telefone</dt>
                        <dd>{coordDetalhe.telefone}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="coord-cursos-secao">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--espaco-sm)" }}>
                    <h4 className="coord-cursos-secao__titulo" style={{ margin: 0 }}>
                      Cursos sob coordenação {cursosCoord.length > 0 && `(${cursosCoord.length})`}
                    </h4>
                    <motion.button
                      type="button"
                      aria-label="Atribuir cursos"
                      onClick={() => abrirAtribuicaoCursos(coordDetalhe)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#22c55e", display: "flex", alignItems: "center", padding: "2px", gap: "4px" }}
                      variants={{ hover: { scale: 1.06 } }}
                      whileHover="hover"
                      whileTap={{ scale: 0.94 }}
                      transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    >
                      <motion.span
                        variants={{ hover: { rotate: 90 } }}
                        transition={{ type: "spring", stiffness: 400, damping: 18 }}
                        style={{ display: "flex" }}
                      >
                        <TbPlus size={18} aria-hidden="true" />
                      </motion.span>
                      <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Atribuir cursos</span>
                    </motion.button>
                  </div>
                  {cursosCoord.length === 0 ? (
                    <p className="texto-vazio">Nenhum curso atribuído a este coordenador.</p>
                  ) : (
                    <ul className="detalhe-prof__turmas-lista" role="list">
                      {cursosCoord.map((c) => (
                        <li key={c.id} className="detalhe-prof__turma-item">
                          <div className="detalhe-prof__turma-corpo">
                            <span className="detalhe-prof__turma-curso">{c.titulo}</span>
                            <span className="detalhe-prof__turma-meta">{c.codigoRegistro} · {c.nivel}</span>
                          </div>
                          <span style={{ fontSize: "0.72rem", color: "var(--cor-texto-mudo)", fontWeight: 500 }}>
                            {c.ativo ? "Ativo" : "Inativo"}
                          </span>
                          <button
                            type="button"
                            aria-label={`Remover curso ${c.titulo}`}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center", padding: "2px" }}
                            onClick={() => setConfirmandoRemocaoCurso(c)}
                          >
                            <motion.span
                              whileHover={{ scale: 1.3, rotate: -15 }}
                              transition={{ type: "spring", stiffness: 500, damping: 10 }}
                              style={{ display: "flex" }}
                            >
                              <MdDelete size={21} aria-hidden="true" />
                            </motion.span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="detalhe-status">
                  <div>
                    <strong className="detalhe-status__rotulo">Status da conta</strong>
                    <span className="detalhe-status__descricao">
                      {coordDetalhe.ativo ? "Coordenador tem acesso à plataforma" : "Acesso à plataforma bloqueado"}
                    </span>
                  </div>
                  <button
                    role="switch"
                    aria-checked={coordDetalhe.ativo}
                    className={`switch-ativo${coordDetalhe.ativo ? " switch-ativo--ativo" : ""}`}
                    onClick={() => setConfirmandoStatus({ id: coordDetalhe.id, nome: coordDetalhe.nome, novoEstado: !coordDetalhe.ativo })}
                    type="button"
                    aria-label={coordDetalhe.ativo ? "Ativo — clique para desativar" : "Inativo — clique para ativar"}
                    data-tooltip={coordDetalhe.ativo ? "Desativar conta" : "Ativar conta"}
                  >
                    <TbX     size={10} className="switch-ativo__icone switch-ativo__icone--esq" aria-hidden="true" />
                    <span className="switch-ativo__thumb" aria-hidden="true" />
                    <TbCheck size={10} className="switch-ativo__icone switch-ativo__icone--dir" aria-hidden="true" />
                  </button>
                </div>

                <footer className="modal-rodape">
                  <Botao variante="perigo" onClick={() => { setCoordDetalhe(null); setModoEdicao(false); }} style={{ display: "flex", alignItems: "center", gap: "6px", marginRight: "auto" }}><TbX size={15} aria-hidden="true" /> Fechar</Botao>
                </footer>
              </>
            )}
          </Modal>
        );
      })()}

      {/* Modal atribuição de cursos */}
      {atribuindoCursos && (
        <Modal titulo={`Cursos — ${atribuindoCursos.nome.split(" ")[0]}`} onFechar={() => { setCoordDetalhe(atribuindoCursos); setAtribuindoCursos(null); }}>
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-lg)", fontSize: "0.875rem" }}>
            Selecione os cursos sob coordenação de <strong>{atribuindoCursos.nome.split(" ")[0]}</strong>.
          </p>
          <ul className="atribuicao-turmas-lista" role="list">
            {cursosLista.map((c) => {
              const marcado       = cursosSelecionados.has(c.id);
              const outroCoordId  = c.coordenadorId && c.coordenadorId !== atribuindoCursos.id ? c.coordenadorId : null;
              const outroCoordNome = outroCoordId
                ? lista.find((u) => u.id === outroCoordId)?.nome.split(" ")[0] ?? "outro coordenador"
                : null;
              return (
                <li key={c.id} className={`atribuicao-turma-item${marcado ? " atribuicao-turma-item--selecionada" : ""}`}>
                  <label className="atribuicao-turma-item__label">
                    <input
                      type="checkbox"
                      className="tabela-checkbox"
                      checked={marcado}
                      onChange={() => alternarCurso(c.id)}
                    />
                    <div className="atribuicao-turma-item__info">
                      <strong className="atribuicao-turma-item__nome">{c.titulo}</strong>
                      <span className="atribuicao-turma-item__curso">{c.codigoRegistro} · {c.nivel}</span>
                      {outroCoordNome && !marcado && (
                        <span className="atribuicao-turma-item__atual">com {outroCoordNome}</span>
                      )}
                    </div>
                    <div className="atribuicao-turma-item__meta">
                      <Insignia texto={c.ativo ? "Ativo" : "Inativo"} variante={c.ativo ? "sucesso" : "erro"} />
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
          <footer className="modal-rodape" style={{ marginTop: "var(--espaco-xl)" }}>
            <button type="button" className="botao botao--perigo" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={() => { setCoordDetalhe(atribuindoCursos); setAtribuindoCursos(null); }}><TbX size={15} aria-hidden="true" /> Cancelar</button>
            <button type="button" className="botao botao--primario" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={salvarAtribuicaoCursos}>
              <MdSave size={17} aria-hidden="true" /> Salvar atribuições
            </button>
          </footer>
        </Modal>
      )}

      {/* Novo coordenador */}
      {modalNovoAberto && (
        <Modal titulo="Novo Coordenador" onFechar={() => setModalNovoAberto(false)}>
          <div className="modal-edicao__avatar" aria-hidden="true">+</div>
          <form className="formulario-modal" onSubmit={(e) => {
            e.preventDefault();
            const f = e.target;
            setLista((prev) => [...prev, {
              id: Date.now(),
              nome: f["nome-coord"].value,
              email: f["email-coord"].value,
              tipo: "Coordenador",
              ativo: true,
              dataCadastro: new Date().toISOString().slice(0, 10),
            }]);
            setModalNovoAberto(false);
          }}>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="nome-coord">Nome completo *</label>
              <input id="nome-coord" className="campo__entrada" type="text" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="email-coord">E-mail *</label>
              <input id="email-coord" className="campo__entrada" type="email" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="cpf-coord">CPF *</label>
              <input id="cpf-coord" className="campo__entrada" type="text" placeholder="000.000.000-00" required />
            </div>
            <footer className="modal-rodape">
              <Botao variante="perigo" type="button" onClick={() => setModalNovoAberto(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" /> Cancelar</Botao>
              <Botao variante="primario" type="submit" style={{ display: "flex", alignItems: "center", gap: "6px" }}><MdSave size={19} aria-hidden="true" />Salvar</Botao>
            </footer>
          </form>
        </Modal>
      )}

      {/* Confirmação de alteração de status */}
      {confirmandoStatus && (
        <Modal
          titulo={confirmandoStatus.novoEstado ? "Ativar conta" : "Desativar conta"}
          onFechar={() => setConfirmandoStatus(null)}
        >
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
            Tem certeza que deseja <strong>{confirmandoStatus.novoEstado ? "ativar" : "desativar"}</strong> a conta de <strong>{confirmandoStatus.nome}</strong>?
          </p>
          <footer className="modal-rodape">
            <Botao variante="perigo" onClick={() => setConfirmandoStatus(null)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" /> Cancelar</Botao>
            <Botao variante="sucesso" onClick={() => { alternarAtivo(confirmandoStatus.id); setConfirmandoStatus(null); }} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbCheck size={15} aria-hidden="true" /> Confirmar</Botao>
          </footer>
        </Modal>
      )}

      {/* Confirmação remoção em massa */}
      {removendoEmMassa && (
        <Modal titulo="Remover coordenadores" onFechar={() => setRemovendoEmMassa(false)}>
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
            Tem certeza que deseja remover <strong>{selecionados.size} {selecionados.size === 1 ? "coordenador" : "coordenadores"}</strong>? Esta ação não pode ser desfeita.
          </p>
          <footer className="modal-rodape">
            <Botao variante="perigo" onClick={() => setRemovendoEmMassa(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" /> Cancelar</Botao>
            <Botao variante="sucesso" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={confirmarRemocaoEmMassa}><TbTrash size={16} aria-hidden="true" />Confirmar</Botao>
          </footer>
        </Modal>
      )}

      {/* Confirmação remoção individual */}
      {coordRemovendo && (() => {
        const coord = lista.find((c) => c.id === coordRemovendo);
        return (
          <Modal titulo="Remover coordenador" onFechar={() => setCoordRemovendo(null)}>
            <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
              Tem certeza que deseja remover <strong>{coord?.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            <footer className="modal-rodape">
              <Botao variante="perigo" onClick={() => setCoordRemovendo(null)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" /> Cancelar</Botao>
              <Botao variante="sucesso" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={confirmarRemocao}><TbTrash size={16} aria-hidden="true" />Confirmar</Botao>
            </footer>
          </Modal>
        );
      })()}

      {/* Confirmação remoção de curso */}
      {confirmandoRemocaoCurso && (
        <Modal titulo="Remover curso" onFechar={() => setConfirmandoRemocaoCurso(null)}>
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
            Deseja remover o curso <strong>{confirmandoRemocaoCurso.titulo}</strong> deste coordenador?
          </p>
          <footer className="modal-rodape">
            <Botao variante="perigo" onClick={() => setConfirmandoRemocaoCurso(null)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" />Cancelar</Botao>
            <Botao variante="sucesso" onClick={() => {
              setCursosLista((prev) =>
                prev.map((c) => c.id === confirmandoRemocaoCurso.id ? { ...c, coordenadorId: null } : c)
              );
              onToast?.(`Curso "${confirmandoRemocaoCurso.titulo}" desatribuído.`, "aviso");
              setConfirmandoRemocaoCurso(null);
            }} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <TbCheck size={15} aria-hidden="true" />Confirmar
            </Botao>
          </footer>
        </Modal>
      )}
    </div>
  );
}
