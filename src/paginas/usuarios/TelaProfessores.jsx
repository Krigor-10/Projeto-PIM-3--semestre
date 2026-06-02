import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { TbChevronUp, TbChevronDown, TbSelector, TbDotsVertical, TbPlus, TbX, TbCheck, TbTrash, TbSettings, TbPencil, TbSearch, TbChevronLeft, TbChevronRight } from "react-icons/tb";
import { MdSave, MdDelete } from "react-icons/md";
import { motion } from "framer-motion";
import Insignia from "@/componentes/Insignia.jsx";
import Modal from "@/componentes/Modal.jsx";
import Botao from "@/componentes/Botao.jsx";
import { db } from "@/dados/db.js";
import { podeCriar, podeEditar, podeExcluir } from "@/dados/permissoes.js";

const ITENS_POR_PAGINA = 8;

const DADOS_VAZIO_PROF = { nome: "", sobrenome: "", email: "", cpf: "", telefone: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", cep: "", registroMec: "" };

function IconeOrdenacao({ campo, ordenacao }) {
  if (ordenacao.campo !== campo) return <TbSelector size={14} aria-hidden="true" />;
  return ordenacao.direcao === "asc"
    ? <TbChevronUp   size={14} aria-hidden="true" />
    : <TbChevronDown size={14} aria-hidden="true" />;
}

function CelulaTurmas({ professorId, turmasLista }) {
  const lista = turmasLista.filter((t) => t.professorId === professorId);
  if (lista.length === 0) return <span className="tabela-matricula__vazio">—</span>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span style={{ fontWeight: 600, color: "var(--cor-texto-forte)" }}>{lista.length}</span>
      <span style={{ fontSize: "0.8rem", color: "var(--cor-texto-mudo)" }}>
        turma{lista.length !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

export default function TelaProfessores({ usuario, onToast }) {
  const podeEditar_ = podeEditar(usuario?.tipo, "professores");
  const [lista, setLista]               = useState(() => db.usuarios.listar().filter((u) => u.tipo === "Professor"));
  const [turmasLista, setTurmasLista]   = useState(() => db.turmas.listar());
  useEffect(() => { db.usuarios.salvarPorTipo("Professor", lista); }, [lista]);
  useEffect(() => { db.turmas.salvar(turmasLista); }, [turmasLista]);
  const [busca, setBusca]               = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroTurma, setFiltroTurma]   = useState("");
  const [ordenacao, setOrdenacao]       = useState({ campo: "nome", direcao: "asc" });

  const turmasDoCoord = useMemo(() => {
    if (usuario?.tipo !== "Coordenador") return [];
    const cursosIds = new Set(
      db.cursos.listar().filter((c) => c.coordenadorId === usuario.id).map((c) => c.id)
    );
    return db.turmas.listar().filter((t) => cursosIds.has(t.cursoId));
  }, [usuario?.tipo, usuario?.id]);
  const [pagina, setPagina]             = useState(1);

  const [selecionados, setSelecionados]         = useState(new Set());
  const [removendoEmMassa, setRemovendoEmMassa] = useState(false);
  const [confirmandoAtivar, setConfirmandoAtivar]       = useState(false);
  const [confirmandoDesativar, setConfirmandoDesativar] = useState(false);

  const [kebabAberto,         setKebabAberto]         = useState(null);
  const [kebabPos,            setKebabPos]            = useState({ top: 0, left: 0 });
  const [professorDetalhe,    setProfessorDetalhe]    = useState(null);
  const [modoEdicao,          setModoEdicao]          = useState(false);
  const [confirmandoStatus,   setConfirmandoStatus]   = useState(null);
  const [atribuindoTurmas,       setAtribuindoTurmas]       = useState(null);
  const [turmasSelecionadas,     setTurmasSelecionadas]     = useState(new Set());
  const [confirmandoRemocaoTurma, setConfirmandoRemocaoTurma] = useState(null);
  const [modalNovoAberto,     setModalNovoAberto]     = useState(false);
  const [abaNovo,             setAbaNovo]             = useState(0);
  const [maxAbaNovo,          setMaxAbaNovo]          = useState(0);
  const [dadosNovo,           setDadosNovo]           = useState(DADOS_VAZIO_PROF);

  const kebabRef = useRef(null);

  useEffect(() => {
    if (!kebabAberto) return;
    function fechar(e) {
      if (kebabRef.current && !kebabRef.current.contains(e.target)) setKebabAberto(null);
    }
    document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, [kebabAberto]);

  function abrirKebab(e, profId) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setKebabPos({ top: rect.bottom + 6, left: rect.right - 192 });
    setKebabAberto((prev) => (prev === profId ? null : profId));
  }

  function salvarEdicao(e) {
    e.preventDefault();
    const f = e.target;
    const atualizado = {
      ...professorDetalhe,
      nome:           f["edit-nome"].value.trim(),
      email:          f["edit-email"].value.trim(),
      telefone:       f["edit-telefone"].value.trim() || undefined,
      especializacao: f["edit-espec"].value.trim() || undefined,
    };
    setLista((prev) => prev.map((u) => (u.id === atualizado.id ? atualizado : u)));
    setTurmasLista((prev) =>
      prev.map((t) =>
        t.professorId === atualizado.id
          ? { ...t, professorNome: atualizado.nome.split(" ").slice(0, 2).join(" ") }
          : t
      )
    );
    setProfessorDetalhe(atualizado);
    setModoEdicao(false);
  }

  function abrirAtribuicao(prof) {
    setAtribuindoTurmas(prof);
    setTurmasSelecionadas(
      new Set(turmasLista.filter((t) => t.professorId === prof.id).map((t) => t.id))
    );
    setKebabAberto(null);
  }

  function salvarAtribuicao() {
    if (!atribuindoTurmas) return;
    setTurmasLista((prev) =>
      prev.map((t) => {
        const eraDoProf  = t.professorId === atribuindoTurmas.id;
        const agora      = turmasSelecionadas.has(t.id);
        if (agora) {
          return { ...t, professorId: atribuindoTurmas.id, professorNome: atribuindoTurmas.nome.split(" ").slice(0, 2).join(" ") };
        }
        if (eraDoProf && !agora) {
          return { ...t, professorId: null, professorNome: null };
        }
        return t;
      })
    );
    onToast?.(`Turmas de ${atribuindoTurmas.nome.split(" ")[0]} atualizadas`, "sucesso");
    setProfessorDetalhe(atribuindoTurmas);
    setAtribuindoTurmas(null);
  }

  function toggleTurma(turmaId) {
    setTurmasSelecionadas((prev) => {
      const prox = new Set(prev);
      prox.has(turmaId) ? prox.delete(turmaId) : prox.add(turmaId);
      return prox;
    });
  }

  function alternarAtivo(id) {
    const alvo = lista.find((u) => u.id === id);
    if (!alvo) return;
    const novoEstado = !alvo.ativo;
    setLista((prev) => prev.map((u) => (u.id === id ? { ...u, ativo: novoEstado } : u)));
    if (professorDetalhe?.id === id)
      setProfessorDetalhe((prev) => ({ ...prev, ativo: novoEstado }));
    onToast?.(
      novoEstado ? `${alvo.nome} foi ativado` : `${alvo.nome} foi desativado`,
      novoEstado ? "sucesso" : "aviso"
    );
  }

  function toggleSelecionado(e, id) {
    e.stopPropagation();
    setSelecionados((prev) => {
      const prox = new Set(prev);
      prox.has(id) ? prox.delete(id) : prox.add(id);
      return prox;
    });
  }

  function toggleTodos(e) {
    e.stopPropagation();
    const idsVisiveis   = itensPagina.map((p) => p.id);
    const todosMarcados = idsVisiveis.every((id) => selecionados.has(id));
    setSelecionados((prev) => {
      const prox = new Set(prev);
      todosMarcados
        ? idsVisiveis.forEach((id) => prox.delete(id))
        : idsVisiveis.forEach((id) => prox.add(id));
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
    let r = usuario?.tipo === "Coordenador" ? lista.filter((u) => u.ativo) : lista;
    if (filtroTurma) {
      const profId = turmasDoCoord.find((t) => t.id === Number(filtroTurma))?.professorId;
      r = profId ? r.filter((u) => u.id === profId) : [];
    }
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
  }, [lista, busca, filtroStatus, ordenacao, filtroTurma, turmasDoCoord]);

  const totalPaginas  = Math.max(1, Math.ceil(listaProcessada.length / ITENS_POR_PAGINA));
  const paginaSegura  = Math.min(pagina, totalPaginas);
  const inicio        = (paginaSegura - 1) * ITENS_POR_PAGINA;
  const itensPagina   = listaProcessada.slice(inicio, inicio + ITENS_POR_PAGINA);

  const totalAtivos   = lista.filter((u) =>  u.ativo).length;
  const totalInativos = lista.filter((u) => !u.ativo).length;

  const todosAtivos   = selecionados.size > 0 && [...selecionados].every((id) => lista.find((u) => u.id === id)?.ativo ?? false);
  const todosInativos = selecionados.size > 0 && [...selecionados].every((id) => !(lista.find((u) => u.id === id)?.ativo ?? true));

  const idsVisiveis        = itensPagina.map((p) => p.id);
  const todosSelecionados  = idsVisiveis.length > 0 && idsVisiveis.every((id) => selecionados.has(id));
  const algunsSelecionados = !todosSelecionados && idsVisiveis.some((id) => selecionados.has(id));

  const checkboxHeaderRef = useRef(null);
  useEffect(() => {
    if (checkboxHeaderRef.current)
      checkboxHeaderRef.current.indeterminate = algunsSelecionados;
  }, [algunsSelecionados]);

  function gerarIniciais(nome) {
    return nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  }

  const colunas = [
    { chave: "nome",         rotulo: "Professor" },
    { chave: "dataCadastro", rotulo: "Cadastro"  },
    { chave: null,           rotulo: "Turmas"    },
    { chave: "ativo",        rotulo: "Status"    },
  ];

  const profKebab = lista.find((p) => p.id === kebabAberto);

  return (
    <div className="tela-professores">
      <header className="cabecalho-pagina" style={{ alignItems: "center" }}>
        <div>
          <h1 className="cabecalho-pagina__titulo">Professores</h1>
          <p className="cabecalho-pagina__subtitulo">
            {usuario?.tipo === "Coordenador"
              ? `${totalAtivos} professores ativos`
              : `${lista.length} cadastrados · ${totalAtivos} ativos · ${totalInativos} inativos`}
          </p>
        </div>
        <div style={{ position: "relative", width: "260px", flexShrink: 0, marginLeft: "auto" }}>
          <TbSearch size={15} aria-hidden="true" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--cor-texto-mudo)", pointerEvents: "none" }} />
          <label htmlFor="busca-professores" className="visualmente-oculto">Buscar professor</label>
          <input
            id="busca-professores"
            type="search"
            className="campo__entrada barra-filtros__busca"
            placeholder="Buscar por nome ou e-mail…"
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
            style={{ width: "100%", paddingLeft: "32px" }}
          />
        </div>
        <span style={{ width: "1px", height: "24px", background: "var(--cor-borda)", flexShrink: 0 }} aria-hidden="true" />
        {podeCriar(usuario?.tipo, "professores") && (
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
            Novo Professor
          </Botao>
        )}
      </header>

      {/* ── Filtros ── */}
      <div className="barra-filtros">
        {usuario?.tipo !== "Coordenador" && (
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
        )}

        {usuario?.tipo === "Coordenador" && turmasDoCoord.length > 0 && (
          <select
            className="campo__entrada"
            value={filtroTurma}
            onChange={(e) => { setFiltroTurma(e.target.value); setPagina(1); }}
            aria-label="Filtrar por turma"
            style={{ minWidth: "200px" }}
          >
            <option value="">Todas as turmas</option>
            {turmasDoCoord.map((t) => (
              <option key={t.id} value={t.id}>{t.nomeTurma} — {t.cursoTitulo}</option>
            ))}
          </select>
        )}
      </div>

      {/* ── Tabela ── */}
      <div className="tabela-dados-container painel-secao">
        <table className="tabela-dados" aria-label="Lista de professores">
          <thead>
            <tr>
              <th scope="col" style={{ width: 40 }}>
                <input
                  ref={checkboxHeaderRef}
                  type="checkbox"
                  className="tabela-checkbox"
                  checked={todosSelecionados}
                  onChange={toggleTodos}
                  aria-label="Selecionar todos desta página"
                />
              </th>
              {colunas.map(({ chave, rotulo }) => (
                <th key={rotulo} scope="col">
                  {chave ? (
                    <button className="tabela-dados__th-btn" onClick={() => alternarOrdenacao(chave)} type="button">
                      {rotulo} <IconeOrdenacao campo={chave} ordenacao={ordenacao} />
                    </button>
                  ) : (
                    <span className="tabela-dados__th-btn" style={{ cursor: "default" }}>{rotulo}</span>
                  )}
                </th>
              ))}
              <th scope="col" style={{ width: 48 }} />
            </tr>
          </thead>

          <tbody>
            {itensPagina.length === 0 ? (
              <tr className="tabela-dados--sem-dados">
                <td colSpan={6}>Nenhum professor encontrado.</td>
              </tr>
            ) : itensPagina.map((prof) => (
              <tr
                key={prof.id}
                className={`tabela-linha-clicavel${selecionados.has(prof.id) ? " tabela-linha-clicavel--selecionada" : ""}`}
                onClick={() => setProfessorDetalhe(prof)}
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="tabela-checkbox"
                    checked={selecionados.has(prof.id)}
                    onChange={(e) => toggleSelecionado(e, prof.id)}
                    aria-label={`Selecionar ${prof.nome}`}
                  />
                </td>
                <td>
                  <div className="tabela-aluno">
                    <div className="topbar__avatar tabela-aluno__avatar" aria-hidden="true">
                      {gerarIniciais(prof.nome)}
                    </div>
                    <div>
                      <strong className="tabela-aluno__nome">{prof.nome}</strong>
                      <span className="tabela-aluno__email">{prof.email}</span>
                    </div>
                  </div>
                </td>
                <td>{new Date(prof.dataCadastro).toLocaleDateString("pt-BR")}</td>
                <td><CelulaTurmas professorId={prof.id} turmasLista={turmasLista} /></td>
                <td>
                  <Insignia texto={prof.ativo ? "Ativo" : "Inativo"} variante={prof.ativo ? "sucesso" : "erro"} />
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button
                    className="kebab-btn"
                    onClick={(e) => abrirKebab(e, prof.id)}
                    aria-label={`Ações para ${prof.nome}`}
                    aria-haspopup="menu"
                    aria-expanded={kebabAberto === prof.id}
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

      {/* ── Paginação ── */}
      {totalPaginas > 1 && (
        <nav className="paginacao" aria-label="Paginação de professores">
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

      {/* ── Barra de ações em massa ── */}
      {selecionados.size > 0 && createPortal(
        <div className="barra-massa" role="toolbar" aria-label="Ações em massa">
          <span className="barra-massa__contador">
            {selecionados.size} {selecionados.size === 1 ? "selecionado" : "selecionados"}
          </span>
          <div className="barra-massa__acoes">
            {!todosAtivos && (
              <Botao variante="sucesso" tamanho="pequeno" onClick={() => setConfirmandoAtivar(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <TbCheck size={14} aria-hidden="true" />Ativar
              </Botao>
            )}
            {!todosInativos && (
              <Botao
                tamanho="pequeno"
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--cor-aviso-fundo)", color: "var(--cor-aviso)", border: "1px solid var(--cor-aviso)" }}
                onClick={() => setConfirmandoDesativar(true)}
              >
                <TbX size={14} aria-hidden="true" />Desativar
              </Botao>
            )}
          </div>
          <button
            className="barra-massa__limpar"
            onClick={() => setSelecionados(new Set())}
            aria-label="Limpar seleção"
            type="button"
          >
            ✕
          </button>
        </div>,
        document.body
      )}

      {/* ── Kebab portal ── */}
      {kebabAberto && profKebab && createPortal(
        <div
          className="kebab-menu"
          role="menu"
          style={{ top: kebabPos.top, left: kebabPos.left }}
          ref={kebabRef}
        >
          <button role="menuitem" className="kebab-menu__item" type="button" style={{ display: "flex", alignItems: "center", gap: "6px" }}
            onClick={() => { setProfessorDetalhe(profKebab); setKebabAberto(null); }}>
            <TbSettings size={20} aria-hidden="true" />Opções
          </button>
        </div>,
        document.body
      )}

      {/* ── Modal detalhes / edição inline ── */}
      {professorDetalhe && (() => {
        const turmasPro   = turmasLista.filter((t) => t.professorId === professorDetalhe.id);
        const totalAlunos = turmasPro.reduce((acc, t) => acc + (t.totalAlunos ?? 0), 0);
        return (
          <Modal
            titulo={modoEdicao ? "Editar Professor" : "Perfil do Professor"}
            onFechar={() => { setProfessorDetalhe(null); setModoEdicao(false); }}
          >
            {modoEdicao ? (
              <>
                <div className="modal-edicao__avatar" aria-hidden="true">
                  {gerarIniciais(professorDetalhe.nome)}
                </div>
                <form className="formulario-modal" onSubmit={salvarEdicao}>
                  <div className="campo">
                    <label className="campo__rotulo" htmlFor="edit-nome">Nome completo *</label>
                    <input id="edit-nome" className="campo__entrada" type="text" defaultValue={professorDetalhe.nome} required />
                  </div>
                  <div className="campo">
                    <label className="campo__rotulo" htmlFor="edit-email">E-mail *</label>
                    <input id="edit-email" className="campo__entrada" type="email" defaultValue={professorDetalhe.email} required />
                  </div>
                  <div className="campo">
                    <label className="campo__rotulo" htmlFor="edit-telefone">Telefone</label>
                    <input id="edit-telefone" className="campo__entrada" type="text" placeholder="(00) 00000-0000" defaultValue={professorDetalhe.telefone ?? ""} />
                  </div>
                  <div className="campo">
                    <label className="campo__rotulo" htmlFor="edit-espec">Especialização</label>
                    <input id="edit-espec" className="campo__entrada" type="text" placeholder="Ex: Desenvolvimento Web" defaultValue={professorDetalhe.especializacao ?? ""} />
                  </div>
                  <footer className="modal-rodape">
                    <Botao variante="perigo" type="button" onClick={() => setModoEdicao(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" />Cancelar</Botao>
                    <Botao variante="primario" type="submit" style={{ display: "flex", alignItems: "center", gap: "6px" }}><MdSave size={17} aria-hidden="true" />Salvar alterações</Botao>
                  </footer>
                </form>
              </>
            ) : (
            <>
            <div className="detalhe-prof">

              {/* Cabeçalho + informações */}
              <div className="detalhe-prof__cabecalho">
                <div className="topbar__avatar detalhe-prof__avatar" aria-hidden="true">
                  {gerarIniciais(professorDetalhe.nome)}
                </div>
                <div className="detalhe-prof__identidade" style={{ flex: 1, minWidth: 0 }}>

                  <h3 className="detalhe-prof__nome">{professorDetalhe.nome}</h3>
                  <span className="detalhe-prof__email">{professorDetalhe.email}</span>
                  <div className="detalhe-prof__badges">
                    <Insignia texto="Professor" variante="info" />
                    <Insignia texto={professorDetalhe.ativo ? "Ativo" : "Inativo"} variante={professorDetalhe.ativo ? "sucesso" : "erro"} />
                  </div>
                  <dl className="detalhe-prof__info-grade" style={{ marginTop: "var(--espaco-sm)" }}>
                    <div className="detalhe-prof__info-item">
                      <dt>Código</dt>
                      <dd style={{ fontFamily: "var(--fonte-mono)", fontSize: "0.85rem" }}>{professorDetalhe.codigo ?? "—"}</dd>
                    </div>
                    <div className="detalhe-prof__info-item">
                      <dt>Membro desde</dt>
                      <dd>{new Date(professorDetalhe.dataCadastro).toLocaleDateString("pt-BR")}</dd>
                    </div>
                    {professorDetalhe.telefone && (
                      <div className="detalhe-prof__info-item">
                        <dt>Telefone</dt>
                        <dd>{professorDetalhe.telefone}</dd>
                      </div>
                    )}
                    {professorDetalhe.especializacao && (
                      <div className="detalhe-prof__info-item">
                        <dt>Especialização</dt>
                        <dd>{professorDetalhe.especializacao}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                {podeEditar_ && (
                  <button
                    type="button"
                    className="modal-cabecalho__btn-icone"
                    onClick={() => setModoEdicao(true)}
                    aria-label="Editar professor"
                    data-tooltip="Editar dados"
                    style={{ alignSelf: "flex-start" }}
                  >
                    <TbPencil size={15} aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* KPIs */}
              <div className="detalhe-prof__kpis" aria-label="Resumo de atividade">
                <div className="detalhe-prof__kpi">
                  <span className="detalhe-prof__kpi-valor">{turmasPro.length}</span>
                  <span className="detalhe-prof__kpi-rotulo">Turmas</span>
                </div>
                <div className="detalhe-prof__kpi">
                  <span className="detalhe-prof__kpi-valor">{totalAlunos}</span>
                  <span className="detalhe-prof__kpi-rotulo">Alunos</span>
                </div>
              </div>

              {/* Turmas */}
              <section>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--espaco-sm)" }}>
                  <h4 className="detalhe-prof__secao-titulo" style={{ margin: 0 }}>
                    Turmas lecionadas {turmasPro.length > 0 && `(${turmasPro.length})`}
                  </h4>
                  <motion.button
                    type="button"
                    aria-label="Atribuir turma"
                    onClick={() => { abrirAtribuicao(professorDetalhe); setProfessorDetalhe(null); }}
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
                    <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Atribuir turma</span>
                  </motion.button>
                </div>
                {turmasPro.length === 0 ? (
                  <p className="texto-vazio">Nenhuma turma atribuída.</p>
                ) : (
                  <ul className="detalhe-prof__turmas-lista" role="list">
                    {turmasPro.map((t) => (
                      <li
                        key={t.id}
                        className={`detalhe-prof__turma-item${t.status === "Concluída" ? " detalhe-prof__turma-item--concluida" : ""}`}
                      >
                        <div className="detalhe-prof__turma-corpo">
                          <span className="detalhe-prof__turma-curso">{t.cursoTitulo}</span>
                          <span className="detalhe-prof__turma-meta">{t.nomeTurma}</span>
                        </div>
                        <span style={{ fontSize: "0.72rem", color: "var(--cor-texto-mudo)", fontWeight: 500 }}>{t.status}</span>
                        <button
                          type="button"
                          aria-label={`Remover turma ${t.nomeTurma}`}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center", padding: "2px" }}
                          onClick={() => setConfirmandoRemocaoTurma(t)}
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
              </section>

              <div className="detalhe-status">
                <div>
                  <strong className="detalhe-status__rotulo">Status da conta</strong>
                  <span className="detalhe-status__descricao">
                    {professorDetalhe.ativo ? "Professor tem acesso à plataforma" : "Acesso à plataforma bloqueado"}
                  </span>
                </div>
                <button
                  role="switch"
                  aria-checked={professorDetalhe.ativo}
                  className={`switch-ativo${professorDetalhe.ativo ? " switch-ativo--ativo" : ""}`}
                  onClick={() => setConfirmandoStatus({ id: professorDetalhe.id, nome: professorDetalhe.nome, novoEstado: !professorDetalhe.ativo })}
                  type="button"
                  aria-label={professorDetalhe.ativo ? "Ativo — clique para desativar" : "Inativo — clique para ativar"}
                  data-tooltip={professorDetalhe.ativo ? "Desativar conta" : "Ativar conta"}
                >
                  <TbX     size={10} className="switch-ativo__icone switch-ativo__icone--esq" aria-hidden="true" />
                  <span className="switch-ativo__thumb" aria-hidden="true" />
                  <TbCheck size={10} className="switch-ativo__icone switch-ativo__icone--dir" aria-hidden="true" />
                </button>
              </div>
            </div>

            <footer className="modal-rodape">
              <Botao variante="perigo" onClick={() => { setProfessorDetalhe(null); setModoEdicao(false); }} style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
                <TbX size={15} aria-hidden="true" />Fechar
              </Botao>
              <Botao variante="primario" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={() => { setProfessorDetalhe(null); setModoEdicao(false); }}>
                <MdSave size={19} aria-hidden="true" />Salvar
              </Botao>
            </footer>
            </>
            )}
          </Modal>
        );
      })()}


      {/* ── Modal atribuição de turmas ── */}
      {atribuindoTurmas && (() => {
        const cursosComConflito = new Set(
          [...turmasSelecionadas]
            .map((id) => turmasLista.find((t) => t.id === id)?.cursoId)
            .filter(Boolean)
            .filter((cursoId, _, arr) => arr.filter((c) => c === cursoId).length > 1)
        );
        const temConflito = cursosComConflito.size > 0;
        return (
          <Modal titulo={`Turmas — ${atribuindoTurmas.nome.split(" ")[0]}`} onFechar={() => { setProfessorDetalhe(atribuindoTurmas); setAtribuindoTurmas(null); }}>
            <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-lg)", fontSize: "0.875rem" }}>
              Selecione a turma de cada curso. Cada curso deve ter no máximo uma turma por professor.
            </p>
            {temConflito && (
              <div className="atribuicao-aviso-conflito" role="alert">
                Um ou mais cursos têm duas turmas selecionadas — selecione apenas uma por curso.
              </div>
            )}
            <ul className="atribuicao-turmas-lista" role="list">
              {turmasLista.map((t) => {
                const marcada       = turmasSelecionadas.has(t.id);
                const conflito      = marcada && cursosComConflito.has(t.cursoId);
                const outroProfId   = t.professorId && t.professorId !== atribuindoTurmas.id ? t.professorId : null;
                const outroProfNome = outroProfId
                  ? lista.find((p) => p.id === outroProfId)?.nome.split(" ")[0] ?? t.professorNome
                  : null;
                return (
                  <li key={t.id} className={`atribuicao-turma-item${marcada ? " atribuicao-turma-item--selecionada" : ""}${conflito ? " atribuicao-turma-item--conflito" : ""}`}>
                    <label className="atribuicao-turma-item__label">
                      <input
                        type="checkbox"
                        className="tabela-checkbox"
                        checked={marcada}
                        onChange={() => toggleTurma(t.id)}
                      />
                      <div className="atribuicao-turma-item__info">
                        <strong className="atribuicao-turma-item__nome">{t.nomeTurma}</strong>
                        <span className="atribuicao-turma-item__curso">{t.cursoTitulo}</span>
                        {outroProfNome && !marcada && (
                          <span className="atribuicao-turma-item__atual">com {outroProfNome}</span>
                        )}
                      </div>
                      <div className="atribuicao-turma-item__meta">
                        {conflito && <Insignia texto="Conflito" variante="aviso" />}
                        <Insignia texto={t.status} variante={t.status === "Ativa" ? "sucesso" : "neutro"} />
                        <span className="atribuicao-turma-item__alunos">{t.totalAlunos} alunos</span>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
            <footer className="modal-rodape" style={{ marginTop: "var(--espaco-xl)" }}>
              <Botao variante="perigo" onClick={() => { setProfessorDetalhe(atribuindoTurmas); setAtribuindoTurmas(null); }} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" />Cancelar</Botao>
              <Botao variante="primario" onClick={salvarAtribuicao} disabled={temConflito} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <MdSave size={17} aria-hidden="true" />Salvar atribuições
              </Botao>
            </footer>
          </Modal>
        );
      })()}

      {/* ── Confirmação de alteração de status ── */}
      {confirmandoStatus && (
        <Modal
          titulo={confirmandoStatus.novoEstado ? "Ativar conta" : "Desativar conta"}
          onFechar={() => setConfirmandoStatus(null)}
        >
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
            Tem certeza que deseja <strong>{confirmandoStatus.novoEstado ? "ativar" : "desativar"}</strong> a conta de <strong>{confirmandoStatus.nome}</strong>?
          </p>
          <footer className="modal-rodape">
            <Botao variante="perigo" onClick={() => setConfirmandoStatus(null)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" />Cancelar</Botao>
            <Botao variante="sucesso" onClick={() => { alternarAtivo(confirmandoStatus.id); setConfirmandoStatus(null); }} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbCheck size={15} aria-hidden="true" />Confirmar</Botao>
          </footer>
        </Modal>
      )}

      {/* ── Confirmação de remoção em massa ── */}
      {removendoEmMassa && (
        <Modal titulo="Remover professores" onFechar={() => setRemovendoEmMassa(false)}>
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
            Tem certeza que deseja remover <strong>{selecionados.size} {selecionados.size === 1 ? "professor" : "professores"}</strong>? Esta ação não pode ser desfeita.
          </p>
          <footer className="modal-rodape">
            <Botao variante="perigo" onClick={() => setRemovendoEmMassa(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" />Cancelar</Botao>
            <Botao variante="sucesso" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={confirmarRemocaoEmMassa}><TbTrash size={16} aria-hidden="true" />Confirmar</Botao>
          </footer>
        </Modal>
      )}

      {/* ── Confirmação de ativação em massa ── */}
      {confirmandoAtivar && (
        <Modal titulo="Ativar professores" onFechar={() => setConfirmandoAtivar(false)}>
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
            Ativar <strong>{selecionados.size} {selecionados.size === 1 ? "professor" : "professores"}</strong> selecionado{selecionados.size !== 1 ? "s" : ""}?
          </p>
          <footer className="modal-rodape">
            <Botao variante="perigo" onClick={() => setConfirmandoAtivar(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" />Cancelar</Botao>
            <Botao variante="sucesso" onClick={() => { ativarSelecionados(); setConfirmandoAtivar(false); onToast?.(`${selecionados.size} professor${selecionados.size !== 1 ? "es" : ""} ativado${selecionados.size !== 1 ? "s" : ""}.`, "sucesso"); }} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbCheck size={15} aria-hidden="true" />Confirmar</Botao>
          </footer>
        </Modal>
      )}

      {/* ── Confirmação de desativação em massa ── */}
      {confirmandoDesativar && (
        <Modal titulo="Desativar professores" onFechar={() => setConfirmandoDesativar(false)}>
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
            Desativar <strong>{selecionados.size} {selecionados.size === 1 ? "professor" : "professores"}</strong> selecionado{selecionados.size !== 1 ? "s" : ""}?
          </p>
          <footer className="modal-rodape">
            <Botao variante="perigo" onClick={() => setConfirmandoDesativar(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" />Cancelar</Botao>
            <Botao variante="sucesso" style={{ display: "flex", alignItems: "center", gap: "6px" }}
              onClick={() => { desativarSelecionados(); setConfirmandoDesativar(false); onToast?.(`${selecionados.size} professor${selecionados.size !== 1 ? "es" : ""} desativado${selecionados.size !== 1 ? "s" : ""}.`, "aviso"); }}
            ><TbCheck size={15} aria-hidden="true" />Confirmar</Botao>
          </footer>
        </Modal>
      )}

      {/* ── Confirmação de remoção de turma ── */}
      {confirmandoRemocaoTurma && (
        <Modal titulo="Remover turma" onFechar={() => setConfirmandoRemocaoTurma(null)}>
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
            Deseja remover a turma <strong>{confirmandoRemocaoTurma.nomeTurma}</strong> deste professor?
          </p>
          <footer className="modal-rodape">
            <Botao variante="perigo" onClick={() => setConfirmandoRemocaoTurma(null)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" />Cancelar</Botao>
            <Botao variante="sucesso" onClick={() => {
              setTurmasLista((prev) =>
                prev.map((t) =>
                  t.id === confirmandoRemocaoTurma.id
                    ? { ...t, professorId: null, professorNome: null }
                    : t
                )
              );
              onToast?.(`Turma "${confirmandoRemocaoTurma.nomeTurma}" desatribuída.`, "aviso");
              setConfirmandoRemocaoTurma(null);
            }} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <TbCheck size={15} aria-hidden="true" />Confirmar
            </Botao>
          </footer>
        </Modal>
      )}

      {/* ── Modal novo professor ── */}
      {modalNovoAberto && (
        <Modal titulo="Novo Professor" onFechar={() => { setModalNovoAberto(false); setAbaNovo(0); setMaxAbaNovo(0); setDadosNovo(DADOS_VAZIO_PROF); }} className="modal-caixa--largo">
          <nav className="abas-matriculas" style={{ width: "100%", justifyContent: "center" }}>
              {["Dados Pessoais", "Endereço", "Registro Profissional"].map((label, i) => {
                const bloqueada = i > maxAbaNovo;
                return (
                  <button
                    key={i}
                    type="button"
                    className={`abas-matriculas__aba${abaNovo === i ? " abas-matriculas__aba--ativa" : ""}`}
                    style={bloqueada ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
                    onClick={() => { if (!bloqueada) setAbaNovo(i); }}
                  >
                    {label}
                  </button>
                );
              })}
            </nav>
          <form className="formulario-modal" onSubmit={(e) => e.preventDefault()}>
            {abaNovo === 0 && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--espaco-md)" }}>
                  <div className="campo">
                    <label className="campo__rotulo" htmlFor="prof-nome">Nome *</label>
                    <input id="prof-nome" className="campo__entrada" type="text" value={dadosNovo.nome} onChange={(e) => setDadosNovo((v) => ({ ...v, nome: e.target.value }))} />
                  </div>
                  <div className="campo">
                    <label className="campo__rotulo" htmlFor="prof-sobrenome">Sobrenome *</label>
                    <input id="prof-sobrenome" className="campo__entrada" type="text" value={dadosNovo.sobrenome} onChange={(e) => setDadosNovo((v) => ({ ...v, sobrenome: e.target.value }))} />
                  </div>
                </div>
                <div className="campo">
                  <label className="campo__rotulo" htmlFor="prof-email">E-mail *</label>
                  <input id="prof-email" className="campo__entrada" type="email" value={dadosNovo.email} onChange={(e) => setDadosNovo((v) => ({ ...v, email: e.target.value }))} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--espaco-md)" }}>
                  <div className="campo">
                    <label className="campo__rotulo" htmlFor="prof-cpf">CPF *</label>
                    <input id="prof-cpf" className="campo__entrada" type="text" placeholder="000.000.000-00" value={dadosNovo.cpf} onChange={(e) => setDadosNovo((v) => ({ ...v, cpf: e.target.value }))} />
                  </div>
                  <div className="campo">
                    <label className="campo__rotulo" htmlFor="prof-telefone">Telefone *</label>
                    <input id="prof-telefone" className="campo__entrada" type="text" placeholder="(00) 00000-0000" value={dadosNovo.telefone} onChange={(e) => setDadosNovo((v) => ({ ...v, telefone: e.target.value }))} />
                  </div>
                </div>
              </>
            )}

            {abaNovo === 1 && (
              <>
                <div className="campo">
                  <label className="campo__rotulo" htmlFor="prof-cep">CEP *</label>
                  <input id="prof-cep" className="campo__entrada" type="text" placeholder="00000-000" value={dadosNovo.cep} onChange={(e) => setDadosNovo((v) => ({ ...v, cep: e.target.value }))} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--espaco-md)" }}>
                  <div className="campo">
                    <label className="campo__rotulo" htmlFor="prof-logradouro">Logradouro *</label>
                    <input id="prof-logradouro" className="campo__entrada" type="text" placeholder="Rua, Av., Travessa..." value={dadosNovo.logradouro} onChange={(e) => setDadosNovo((v) => ({ ...v, logradouro: e.target.value }))} />
                  </div>
                  <div className="campo">
                    <label className="campo__rotulo" htmlFor="prof-numero">Número *</label>
                    <input id="prof-numero" className="campo__entrada" type="text" value={dadosNovo.numero} onChange={(e) => setDadosNovo((v) => ({ ...v, numero: e.target.value }))} />
                  </div>
                </div>
                <div className="campo">
                  <label className="campo__rotulo" htmlFor="prof-complemento">Complemento <span style={{ fontWeight: 400, color: "var(--cor-texto-mudo)" }}>(opcional)</span></label>
                  <input id="prof-complemento" className="campo__entrada" type="text" placeholder="Apto, Bloco, Sala..." value={dadosNovo.complemento} onChange={(e) => setDadosNovo((v) => ({ ...v, complemento: e.target.value }))} />
                </div>
                <div className="campo">
                  <label className="campo__rotulo" htmlFor="prof-bairro">Bairro *</label>
                  <input id="prof-bairro" className="campo__entrada" type="text" value={dadosNovo.bairro} onChange={(e) => setDadosNovo((v) => ({ ...v, bairro: e.target.value }))} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--espaco-md)" }}>
                  <div className="campo" style={{ gridColumn: "1 / 3" }}>
                    <label className="campo__rotulo" htmlFor="prof-cidade">Cidade *</label>
                    <input id="prof-cidade" className="campo__entrada" type="text" value={dadosNovo.cidade} onChange={(e) => setDadosNovo((v) => ({ ...v, cidade: e.target.value }))} />
                  </div>
                  <div className="campo">
                    <label className="campo__rotulo" htmlFor="prof-estado">UF *</label>
                    <input id="prof-estado" className="campo__entrada" type="text" placeholder="SP" maxLength={2} value={dadosNovo.estado} onChange={(e) => setDadosNovo((v) => ({ ...v, estado: e.target.value.toUpperCase() }))} />
                  </div>
                </div>
              </>
            )}

            {abaNovo === 2 && (
              <div className="campo">
                <label className="campo__rotulo" htmlFor="prof-registro-mec">Registro MEC</label>
                <input id="prof-registro-mec" className="campo__entrada" type="text" placeholder="Número do registro" value={dadosNovo.registroMec} onChange={(e) => setDadosNovo((v) => ({ ...v, registroMec: e.target.value }))} />
              </div>
            )}

            <footer className="modal-rodape" style={{ marginTop: "var(--espaco-lg)" }}>
              <Botao variante="perigo" type="button" onClick={() => { setModalNovoAberto(false); setAbaNovo(0); setMaxAbaNovo(0); setDadosNovo(DADOS_VAZIO_PROF); }} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" />Cancelar</Botao>
              <div style={{ display: "flex", gap: "var(--espaco-sm)" }}>
                {abaNovo > 0 && (
                  <Botao variante="secundario" type="button" onClick={() => setAbaNovo((v) => v - 1)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbChevronLeft size={15} aria-hidden="true" />Anterior</Botao>
                )}
                {abaNovo < 2 ? (
                  <Botao variante="primario" type="button" onClick={() => {
                    if (abaNovo === 0) {
                      if (!dadosNovo.nome || !dadosNovo.sobrenome || !dadosNovo.email || !dadosNovo.cpf || !dadosNovo.telefone) { onToast?.("Preencha todos os campos obrigatórios.", "erro"); return; }
                    }
                    if (abaNovo === 1) {
                      if (!dadosNovo.logradouro || !dadosNovo.numero || !dadosNovo.bairro || !dadosNovo.cidade || !dadosNovo.estado || !dadosNovo.cep) { onToast?.("Preencha todos os campos obrigatórios do endereço.", "erro"); return; }
                    }
                    setMaxAbaNovo((v) => Math.max(v, abaNovo + 1));
                    setAbaNovo((v) => v + 1);
                  }} style={{ display: "flex", alignItems: "center", gap: "6px" }}>Próximo<TbChevronRight size={15} aria-hidden="true" /></Botao>
                ) : (
                  <Botao variante="primario" type="button" onClick={() => {
                    if (!dadosNovo.nome || !dadosNovo.sobrenome || !dadosNovo.email || !dadosNovo.cpf || !dadosNovo.telefone) { onToast?.("Preencha todos os campos obrigatórios na aba Dados Pessoais.", "erro"); setAbaNovo(0); return; }
                    setLista((prev) => [...prev, { id: Date.now(), nome: `${dadosNovo.nome} ${dadosNovo.sobrenome}`.trim(), email: dadosNovo.email, cpf: dadosNovo.cpf, telefone: dadosNovo.telefone, logradouro: dadosNovo.logradouro, numero: dadosNovo.numero, complemento: dadosNovo.complemento, bairro: dadosNovo.bairro, cidade: dadosNovo.cidade, estado: dadosNovo.estado, cep: dadosNovo.cep, registroMec: dadosNovo.registroMec, tipo: "Professor", ativo: true, dataCadastro: new Date().toISOString().slice(0, 10) }]);
                    setModalNovoAberto(false); setAbaNovo(0); setMaxAbaNovo(0); setDadosNovo(DADOS_VAZIO_PROF);
                  }} style={{ display: "flex", alignItems: "center", gap: "6px" }}><MdSave size={19} aria-hidden="true" />Salvar Cadastro</Botao>
                )}
              </div>
            </footer>
          </form>
        </Modal>
      )}
    </div>
  );
}
