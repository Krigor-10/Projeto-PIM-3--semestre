import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { TbChevronUp, TbChevronDown, TbSelector, TbDotsVertical } from "react-icons/tb";
import Insignia from "@/componentes/Insignia.jsx";
import Modal from "@/componentes/Modal.jsx";
import Botao from "@/componentes/Botao.jsx";
import { usuarios, turmas as turmasIniciais } from "@/dados/dadosMock.js";
import { podeCriar } from "@/dados/permissoes.js";

const ITENS_POR_PAGINA = 8;

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

export default function TelaProfessores({ usuario }) {
  const [lista, setLista]               = useState(usuarios.filter((u) => u.tipo === "Professor"));
  const [turmasLista, setTurmasLista]   = useState(() => [...turmasIniciais]);
  const [busca, setBusca]               = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [ordenacao, setOrdenacao]       = useState({ campo: "nome", direcao: "asc" });
  const [pagina, setPagina]             = useState(1);

  const [selecionados, setSelecionados]         = useState(new Set());
  const [removendoEmMassa, setRemovendoEmMassa] = useState(false);

  const [kebabAberto,         setKebabAberto]         = useState(null);
  const [kebabPos,            setKebabPos]            = useState({ top: 0, left: 0 });
  const [professorDetalhe,    setProfessorDetalhe]    = useState(null);
  const [professorRemovendo,  setProfessorRemovendo]  = useState(null);
  const [professorEditando,   setProfessorEditando]   = useState(null);
  const [atribuindoTurmas,    setAtribuindoTurmas]    = useState(null);
  const [turmasSelecionadas,  setTurmasSelecionadas]  = useState(new Set());
  const [modalNovoAberto,     setModalNovoAberto]     = useState(false);

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

  function abrirEdicao(prof) {
    setProfessorEditando({ ...prof });
    setKebabAberto(null);
  }

  function salvarEdicao(e) {
    e.preventDefault();
    const f = e.target;
    const atualizado = {
      ...professorEditando,
      nome:          f["edit-nome"].value.trim(),
      email:         f["edit-email"].value.trim(),
      telefone:      f["edit-telefone"].value.trim() || undefined,
      especializacao: f["edit-espec"].value.trim() || undefined,
    };
    setLista((prev) => prev.map((u) => (u.id === atualizado.id ? atualizado : u)));
    /* Atualiza o nome do professor nas turmas quando ele muda */
    setTurmasLista((prev) =>
      prev.map((t) =>
        t.professorId === atualizado.id
          ? { ...t, professorNome: atualizado.nome.split(" ").slice(0, 2).join(" ") }
          : t
      )
    );
    if (professorDetalhe?.id === atualizado.id) setProfessorDetalhe(atualizado);
    setProfessorEditando(null);
  }

  function abrirAtribuicao(prof) {
    setAtribuindoTurmas(prof);
    setTurmasSelecionadas(
      new Set(turmasLista.filter((t) => t.professorId === prof.id).map((t) => t.id))
    );
    setKebabAberto(null);
  }

  function salvarAtribuicao() {
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
    setLista((prev) => prev.map((u) => (u.id === id ? { ...u, ativo: !u.ativo } : u)));
    if (professorDetalhe?.id === id)
      setProfessorDetalhe((prev) => ({ ...prev, ativo: !prev.ativo }));
  }

  function confirmarRemocao() {
    setLista((prev) => prev.filter((u) => u.id !== professorRemovendo));
    if (professorDetalhe?.id === professorRemovendo) setProfessorDetalhe(null);
    setProfessorRemovendo(null);
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
    { chave: "ativo",        rotulo: "Status"    },
    { chave: null,           rotulo: "Turmas"    },
  ];

  const profKebab = lista.find((p) => p.id === kebabAberto);

  return (
    <div className="tela-professores">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Professores</h2>
          <p className="cabecalho-pagina__subtitulo">
            {lista.length} cadastrados · {totalAtivos} ativos · {totalInativos} inativos
          </p>
        </div>
        {podeCriar(usuario?.tipo, "professores") && (
          <Botao variante="primario" onClick={() => setModalNovoAberto(true)}>
            + Novo Professor
          </Botao>
        )}
      </header>

      {/* ── Filtros ── */}
      <div className="barra-filtros">
        <label htmlFor="busca-professores" className="visualmente-oculto">Buscar professor</label>
        <input
          id="busca-professores"
          type="search"
          className="campo__entrada barra-filtros__busca"
          placeholder="Buscar por nome ou e-mail…"
          value={busca}
          onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
        />
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
                <td>
                  <Insignia texto={prof.ativo ? "Ativo" : "Inativo"} variante={prof.ativo ? "sucesso" : "erro"} />
                </td>
                <td><CelulaTurmas professorId={prof.id} turmasLista={turmasLista} /></td>
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
            <button className="botao botao--fantasma botao--pequeno" onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={paginaSegura === 1} type="button">‹ Anterior</button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <button key={n} className={`paginacao__pagina${paginaSegura === n ? " paginacao__pagina--ativa" : ""}`} onClick={() => setPagina(n)} type="button" aria-current={paginaSegura === n ? "page" : undefined}>{n}</button>
            ))}
            <button className="botao botao--fantasma botao--pequeno" onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={paginaSegura === totalPaginas} type="button">Próxima ›</button>
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
            <button className="botao botao--sucesso botao--pequeno" onClick={ativarSelecionados} type="button">
              Ativar
            </button>
            <button
              className="botao botao--pequeno"
              style={{ background: "var(--cor-aviso-fundo)", color: "var(--cor-aviso)", border: "1px solid var(--cor-aviso)" }}
              onClick={desativarSelecionados}
              type="button"
            >
              Desativar
            </button>
            <button className="botao botao--perigo botao--pequeno" onClick={() => setRemovendoEmMassa(true)} type="button">
              Remover
            </button>
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
          <button role="menuitem" className="kebab-menu__item" type="button"
            onClick={() => { setProfessorDetalhe(profKebab); setKebabAberto(null); }}>
            Ver detalhes
          </button>
          <button role="menuitem" className="kebab-menu__item" type="button"
            onClick={() => abrirEdicao(profKebab)}>
            Editar dados
          </button>
          <button role="menuitem" className="kebab-menu__item" type="button"
            onClick={() => abrirAtribuicao(profKebab)}>
            Atribuir turmas
          </button>
          <div className="kebab-menu__divisor" />
          <button role="menuitem" className="kebab-menu__item" type="button"
            onClick={() => { alternarAtivo(profKebab.id); setKebabAberto(null); }}>
            {profKebab.ativo ? "Desativar conta" : "Ativar conta"}
          </button>
          <div className="kebab-menu__divisor" />
          <button role="menuitem" className="kebab-menu__item kebab-menu__item--perigo" type="button"
            onClick={() => { setProfessorRemovendo(profKebab.id); setKebabAberto(null); }}>
            Remover professor
          </button>
        </div>,
        document.body
      )}

      {/* ── Modal detalhes ── */}
      {professorDetalhe && (() => {
        const turmasPro    = turmasLista.filter((t) => t.professorId === professorDetalhe.id);
        const totalAlunos  = turmasPro.reduce((acc, t) => acc + (t.totalAlunos ?? 0), 0);
        const turmasAtivas = turmasPro.filter((t) => t.status === "Ativa").length;
        return (
          <Modal titulo="Perfil do Professor" onFechar={() => setProfessorDetalhe(null)}>
            <div className="detalhe-prof">

              {/* Cabeçalho */}
              <div className="detalhe-prof__cabecalho">
                <div className="topbar__avatar detalhe-prof__avatar" aria-hidden="true">
                  {gerarIniciais(professorDetalhe.nome)}
                </div>
                <div className="detalhe-prof__identidade">
                  <h3 className="detalhe-prof__nome">{professorDetalhe.nome}</h3>
                  <span className="detalhe-prof__email">{professorDetalhe.email}</span>
                  <div className="detalhe-prof__badges">
                    <Insignia texto="Professor" variante="info" />
                    <Insignia
                      texto={professorDetalhe.ativo ? "Ativo" : "Inativo"}
                      variante={professorDetalhe.ativo ? "sucesso" : "erro"}
                    />
                  </div>
                </div>
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
                <div className="detalhe-prof__kpi">
                  <span className="detalhe-prof__kpi-valor">{turmasAtivas}</span>
                  <span className="detalhe-prof__kpi-rotulo">Ativas</span>
                </div>
              </div>

              {/* Informações de contato */}
              <section>
                <h4 className="detalhe-prof__secao-titulo">Informações</h4>
                <dl className="detalhe-prof__info-grade">
                  <div className="detalhe-prof__info-item">
                    <dt>Membro desde</dt>
                    <dd>{new Date(professorDetalhe.dataCadastro).toLocaleDateString("pt-BR")}</dd>
                  </div>
                  <div className="detalhe-prof__info-item">
                    <dt>E-mail</dt>
                    <dd>{professorDetalhe.email}</dd>
                  </div>
                  {professorDetalhe.telefone ? (
                    <div className="detalhe-prof__info-item">
                      <dt>Telefone</dt>
                      <dd>{professorDetalhe.telefone}</dd>
                    </div>
                  ) : null}
                  {professorDetalhe.especializacao ? (
                    <div className="detalhe-prof__info-item">
                      <dt>Especialização</dt>
                      <dd>{professorDetalhe.especializacao}</dd>
                    </div>
                  ) : null}
                </dl>
              </section>

              {/* Turmas */}
              <section>
                <h4 className="detalhe-prof__secao-titulo">
                  Turmas lecionadas {turmasPro.length > 0 && `(${turmasPro.length})`}
                </h4>
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
                        <div className="detalhe-prof__turma-lado">
                          <Insignia
                            texto={t.status}
                            variante={t.status === "Ativa" ? "sucesso" : "neutro"}
                          />
                          <span className="detalhe-prof__turma-alunos">{t.totalAlunos} alunos</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <footer className="modal-rodape">
              <Botao variante="fantasma" tamanho="pequeno"
                onClick={() => { abrirEdicao(professorDetalhe); setProfessorDetalhe(null); }}>
                Editar dados
              </Botao>
              <Botao variante="fantasma" tamanho="pequeno"
                onClick={() => { abrirAtribuicao(professorDetalhe); setProfessorDetalhe(null); }}>
                Atribuir turmas
              </Botao>
              <Botao
                variante={professorDetalhe.ativo ? "perigo" : "sucesso"}
                tamanho="pequeno"
                onClick={() => alternarAtivo(professorDetalhe.id)}
              >
                {professorDetalhe.ativo ? "Desativar" : "Ativar"}
              </Botao>
              <Botao variante="primario" onClick={() => setProfessorDetalhe(null)}>
                Fechar
              </Botao>
            </footer>
          </Modal>
        );
      })()}

      {/* ── Modal edição de dados ── */}
      {professorEditando && (
        <Modal titulo="Editar Professor" onFechar={() => setProfessorEditando(null)}>
          <form className="formulario-modal" onSubmit={salvarEdicao}>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="edit-nome">Nome completo *</label>
              <input
                id="edit-nome"
                className="campo__entrada"
                type="text"
                defaultValue={professorEditando.nome}
                required
              />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="edit-email">E-mail *</label>
              <input
                id="edit-email"
                className="campo__entrada"
                type="email"
                defaultValue={professorEditando.email}
                required
              />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="edit-telefone">Telefone</label>
              <input
                id="edit-telefone"
                className="campo__entrada"
                type="text"
                placeholder="(00) 00000-0000"
                defaultValue={professorEditando.telefone ?? ""}
              />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="edit-espec">Especialização</label>
              <input
                id="edit-espec"
                className="campo__entrada"
                type="text"
                placeholder="Ex: Desenvolvimento Web"
                defaultValue={professorEditando.especializacao ?? ""}
              />
            </div>
            <footer className="modal-rodape">
              <button type="button" className="botao botao--fantasma" onClick={() => setProfessorEditando(null)}>Cancelar</button>
              <button type="submit" className="botao botao--primario">Salvar alterações</button>
            </footer>
          </form>
        </Modal>
      )}

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
          <Modal titulo={`Turmas — ${atribuindoTurmas.nome.split(" ")[0]}`} onFechar={() => setAtribuindoTurmas(null)}>
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
              <button type="button" className="botao botao--fantasma" onClick={() => setAtribuindoTurmas(null)}>Cancelar</button>
              <button type="button" className="botao botao--primario" onClick={salvarAtribuicao} disabled={temConflito}>
                Salvar atribuições
              </button>
            </footer>
          </Modal>
        );
      })()}

      {/* ── Confirmação de remoção em massa ── */}
      {removendoEmMassa && (
        <Modal titulo="Remover professores" onFechar={() => setRemovendoEmMassa(false)}>
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
            Tem certeza que deseja remover <strong>{selecionados.size} {selecionados.size === 1 ? "professor" : "professores"}</strong>? Esta ação não pode ser desfeita.
          </p>
          <footer className="modal-rodape">
            <button className="botao botao--fantasma" onClick={() => setRemovendoEmMassa(false)} type="button">Cancelar</button>
            <button className="botao botao--perigo"   onClick={confirmarRemocaoEmMassa}           type="button">Confirmar remoção</button>
          </footer>
        </Modal>
      )}

      {/* ── Confirmação de remoção individual ── */}
      {professorRemovendo && (() => {
        const prof = lista.find((p) => p.id === professorRemovendo);
        return (
          <Modal titulo="Remover professor" onFechar={() => setProfessorRemovendo(null)}>
            <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
              Tem certeza que deseja remover <strong>{prof?.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            <footer className="modal-rodape">
              <button className="botao botao--fantasma" onClick={() => setProfessorRemovendo(null)} type="button">Cancelar</button>
              <button className="botao botao--perigo"   onClick={confirmarRemocao}                  type="button">Confirmar remoção</button>
            </footer>
          </Modal>
        );
      })()}

      {/* ── Modal novo professor ── */}
      {modalNovoAberto && (
        <Modal titulo="Novo Professor" onFechar={() => setModalNovoAberto(false)}>
          <form
            className="formulario-modal"
            onSubmit={(e) => {
              e.preventDefault();
              const f = e.target;
              setLista((prev) => [...prev, {
                id: Date.now(),
                nome: f["nome-prof"].value,
                email: f["email-prof"].value,
                tipo: "Professor",
                ativo: true,
                dataCadastro: new Date().toISOString().slice(0, 10),
              }]);
              setModalNovoAberto(false);
            }}
          >
            <div className="campo">
              <label className="campo__rotulo" htmlFor="nome-prof">Nome completo *</label>
              <input id="nome-prof" className="campo__entrada" type="text" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="email-prof">E-mail *</label>
              <input id="email-prof" className="campo__entrada" type="email" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="cpf-prof">CPF *</label>
              <input id="cpf-prof" className="campo__entrada" type="text" placeholder="000.000.000-00" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="especializacao-prof">Especialização</label>
              <input id="especializacao-prof" className="campo__entrada" type="text" placeholder="Ex: Desenvolvimento Web" />
            </div>
            <footer className="modal-rodape">
              <button type="button" className="botao botao--fantasma" onClick={() => setModalNovoAberto(false)}>Cancelar</button>
              <button type="submit" className="botao botao--primario">Cadastrar Professor</button>
            </footer>
          </form>
        </Modal>
      )}
    </div>
  );
}
