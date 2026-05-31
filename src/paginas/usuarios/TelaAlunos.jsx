import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { TbChevronUp, TbChevronDown, TbSelector, TbDotsVertical, TbX, TbCheck, TbTrash, TbSettings, TbChevronLeft, TbChevronRight, TbPencil, TbSearch } from "react-icons/tb";
import { MdSave } from "react-icons/md";
import Insignia from "@/componentes/Insignia.jsx";
import Modal from "@/componentes/Modal.jsx";
import Botao from "@/componentes/Botao.jsx";
import { matriculas } from "@/dados/dadosMock.js";
import { db } from "@/dados/db.js";
import { podeEditar, podeExcluir } from "@/dados/permissoes.js";

const VARIANTE_MATRICULA = { Aprovada: "sucesso", Pendente: "aviso", Rejeitada: "erro" };
const ITENS_POR_PAGINA   = 8;

function gerarIniciais(nome) {
  return (nome ?? "").split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function IconeOrdenacao({ campo, ordenacao }) {
  if (ordenacao.campo !== campo) return <TbSelector size={14} aria-hidden="true" />;
  return ordenacao.direcao === "asc"
    ? <TbChevronUp  size={14} aria-hidden="true" />
    : <TbChevronDown size={14} aria-hidden="true" />;
}

function CelulaMatricula({ alunoId }) {
  const mats = matriculas.filter((m) => m.alunoId === alunoId);
  if (mats.length === 0) return <span className="tabela-matricula__vazio">—</span>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {mats.map((m) => (
        <span key={m.id} style={{ fontSize: "0.8rem", fontFamily: "var(--fonte-mono)", color: "var(--cor-texto-suave)" }}>
          {m.codigoMatricula}
        </span>
      ))}
    </div>
  );
}

export default function TelaAlunos({ usuario, onToast }) {
  const tipo = usuario?.tipo;

  const podeEditar_   = podeEditar(tipo, "alunos");
  const podeExcluir_  = podeExcluir(tipo, "alunos");

  const [lista, setLista]               = useState(() => db.usuarios.listar().filter((u) => u.tipo === "Aluno"));
  useEffect(() => { db.usuarios.salvarPorTipo("Aluno", lista); }, [lista]);
  const [busca, setBusca]               = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [ordenacao, setOrdenacao]       = useState({ campo: "nome", direcao: "asc" });
  const [pagina, setPagina]             = useState(1);

  const [selecionados, setSelecionados]         = useState(new Set());
  const [removendoEmMassa, setRemovendoEmMassa] = useState(false);
  const [confirmandoAtivar, setConfirmandoAtivar]       = useState(false);
  const [confirmandoDesativar, setConfirmandoDesativar] = useState(false);

  const [kebabAberto,   setKebabAberto]   = useState(null);
  const [kebabPos,      setKebabPos]      = useState({ top: 0, left: 0 });
  const [alunoDetalhe,  setAlunoDetalhe]  = useState(null);
  const [modoEdicao,    setModoEdicao]    = useState(false);
  const [confirmandoStatus, setConfirmandoStatus] = useState(null);

  const kebabRef = useRef(null);

  useEffect(() => {
    if (!kebabAberto) return;
    function fechar(e) {
      if (kebabRef.current && !kebabRef.current.contains(e.target)) setKebabAberto(null);
    }
    document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, [kebabAberto]);

  function abrirKebab(e, alunoId) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setKebabPos({ top: rect.bottom + 6, left: rect.right - 168 });
    setKebabAberto((prev) => (prev === alunoId ? null : alunoId));
  }

  function alternarAtivo(id) {
    const alvo = lista.find((u) => u.id === id);
    if (!alvo) return;
    const novoEstado = !alvo.ativo;
    setLista((prev) => prev.map((u) => u.id === id ? { ...u, ativo: novoEstado } : u));
    if (alunoDetalhe?.id === id) setAlunoDetalhe((prev) => ({ ...prev, ativo: novoEstado }));
    onToast?.(
      novoEstado ? `${alvo.nome} foi ativado` : `${alvo.nome} foi desativado`,
      novoEstado ? "sucesso" : "aviso"
    );
  }

  function salvarEdicao(e) {
    e.preventDefault();
    const f = e.target;
    const atualizado = { ...alunoDetalhe, nome: f["edit-nome"].value.trim(), email: f["edit-email"].value.trim() };
    setLista((prev) => prev.map((u) => u.id === atualizado.id ? atualizado : u));
    setAlunoDetalhe(atualizado);
    setModoEdicao(false);
    onToast?.("Dados do aluno atualizados.", "sucesso");
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
    const ids = itensPagina.map((a) => a.id);
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

  const totalPaginas   = Math.max(1, Math.ceil(listaProcessada.length / ITENS_POR_PAGINA));
  const paginaSegura   = Math.min(pagina, totalPaginas);
  const inicio         = (paginaSegura - 1) * ITENS_POR_PAGINA;
  const itensPagina    = listaProcessada.slice(inicio, inicio + ITENS_POR_PAGINA);
  const totalAtivos    = lista.filter((u) =>  u.ativo).length;
  const totalInativos  = lista.filter((u) => !u.ativo).length;

  const todosAtivos   = selecionados.size > 0 && [...selecionados].every((id) => lista.find((u) => u.id === id)?.ativo ?? false);
  const todosInativos = selecionados.size > 0 && [...selecionados].every((id) => !(lista.find((u) => u.id === id)?.ativo ?? true));

  const idsVisiveis        = itensPagina.map((a) => a.id);
  const todosSelecionados  = idsVisiveis.length > 0 && idsVisiveis.every((id) => selecionados.has(id));
  const algunsSelecionados = !todosSelecionados && idsVisiveis.some((id) => selecionados.has(id));

  const checkboxHeaderRef = useRef(null);
  useEffect(() => {
    if (checkboxHeaderRef.current)
      checkboxHeaderRef.current.indeterminate = algunsSelecionados;
  }, [algunsSelecionados]);

  const colunas = [
    { chave: "nome",         rotulo: "Aluno"     },
    { chave: "dataCadastro", rotulo: "Cadastro"  },
    { chave: null,           rotulo: "Matrícula" },
    { chave: "ativo",        rotulo: "Status"    },
  ];

  const alunoKebab = lista.find((a) => a.id === kebabAberto);

  return (
    <div className="tela-alunos">
      <header className="cabecalho-pagina" style={{ alignItems: "center" }}>
        <div>
          <h1 className="cabecalho-pagina__titulo">Alunos</h1>
          <p className="cabecalho-pagina__subtitulo">
            {lista.length} cadastrados · {totalAtivos} ativos · {totalInativos} inativos
          </p>
        </div>
        <div style={{ position: "relative", width: "260px", flexShrink: 0, marginLeft: "auto" }}>
          <TbSearch size={15} aria-hidden="true" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--cor-texto-mudo)", pointerEvents: "none" }} />
          <label htmlFor="busca-alunos" className="visualmente-oculto">Buscar aluno</label>
          <input
            id="busca-alunos"
            type="search"
            className="campo__entrada barra-filtros__busca"
            placeholder="Buscar por nome ou e-mail…"
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
            style={{ width: "100%", paddingLeft: "32px" }}
          />
        </div>
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
        <table className="tabela-dados" aria-label="Lista de alunos">
          <thead>
            <tr>
              {podeEditar_ && (
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
              )}
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
                <td colSpan={podeEditar_ ? 6 : 5}>Nenhum aluno encontrado.</td>
              </tr>
            ) : itensPagina.map((aluno) => (
              <tr
                key={aluno.id}
                className={`tabela-linha-clicavel${selecionados.has(aluno.id) ? " tabela-linha-clicavel--selecionada" : ""}`}
                onClick={() => setAlunoDetalhe(aluno)}
              >
                {podeEditar_ && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="tabela-checkbox"
                      checked={selecionados.has(aluno.id)}
                      onChange={(e) => toggleSelecionado(e, aluno.id)}
                      aria-label={`Selecionar ${aluno.nome}`}
                    />
                  </td>
                )}
                <td>
                  <div className="tabela-aluno">
                    <div className="topbar__avatar tabela-aluno__avatar" aria-hidden="true">
                      {gerarIniciais(aluno.nome)}
                    </div>
                    <div>
                      <strong className="tabela-aluno__nome">{aluno.nome}</strong>
                      <span className="tabela-aluno__email">{aluno.email}</span>
                    </div>
                  </div>
                </td>
                <td>{new Date(aluno.dataCadastro).toLocaleDateString("pt-BR")}</td>
                <td><CelulaMatricula alunoId={aluno.id} /></td>
                <td>
                  <Insignia texto={aluno.ativo ? "Ativo" : "Inativo"} variante={aluno.ativo ? "sucesso" : "erro"} />
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button
                    className="kebab-btn"
                    onClick={(e) => abrirKebab(e, aluno.id)}
                    aria-label={`Ações para ${aluno.nome}`}
                    aria-haspopup="menu"
                    aria-expanded={kebabAberto === aluno.id}
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
        <nav className="paginacao" aria-label="Paginação de alunos">
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

      {/* Barra de ações em massa — Admin e Coordenador */}
      {podeEditar_ && selecionados.size > 0 && createPortal(
        <div className="barra-massa" role="toolbar" aria-label="Ações em massa">
          <span className="barra-massa__contador">
            {selecionados.size} {selecionados.size === 1 ? "selecionado" : "selecionados"}
          </span>
          <div className="barra-massa__acoes">
            {!todosAtivos && <Botao variante="sucesso" tamanho="pequeno" onClick={() => setConfirmandoAtivar(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbCheck size={14} aria-hidden="true" />Ativar</Botao>}
            {!todosInativos && <Botao tamanho="pequeno" style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--cor-aviso-fundo)", color: "var(--cor-aviso)", border: "1px solid var(--cor-aviso)" }} onClick={() => setConfirmandoDesativar(true)}><TbX size={14} aria-hidden="true" />Desativar</Botao>}
          </div>
          <button className="barra-massa__limpar" onClick={() => setSelecionados(new Set())} aria-label="Limpar seleção" type="button">✕</button>
        </div>,
        document.body
      )}

      {/* Kebab portal */}
      {kebabAberto && alunoKebab && createPortal(
        <div className="kebab-menu" role="menu" style={{ top: kebabPos.top, left: kebabPos.left }} ref={kebabRef}>
          <button role="menuitem" className="kebab-menu__item" type="button" style={{ display: "flex", alignItems: "center", gap: "6px" }}
            onClick={() => { setAlunoDetalhe(alunoKebab); setKebabAberto(null); }}>
            <TbSettings size={20} aria-hidden="true" />Opções
          </button>
        </div>,
        document.body
      )}

      {/* Modal detalhes */}
      {alunoDetalhe && (
        <Modal titulo={modoEdicao ? "Editar Aluno" : "Detalhes do Aluno"} onFechar={() => { setAlunoDetalhe(null); setModoEdicao(false); }}>
          {modoEdicao ? (
            <>
              <div className="modal-edicao__avatar" aria-hidden="true">
                {gerarIniciais(alunoDetalhe.nome)}
              </div>
              <form className="formulario-modal" onSubmit={salvarEdicao}>
                <div className="campo">
                  <label className="campo__rotulo" htmlFor="edit-nome">Nome completo *</label>
                  <input id="edit-nome" className="campo__entrada" type="text" defaultValue={alunoDetalhe.nome} required />
                </div>
                <div className="campo">
                  <label className="campo__rotulo" htmlFor="edit-email">E-mail *</label>
                  <input id="edit-email" className="campo__entrada" type="email" defaultValue={alunoDetalhe.email} required />
                </div>
                <footer className="modal-rodape">
                  <Botao variante="perigo" type="button" onClick={() => setModoEdicao(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" /> Cancelar</Botao>
                  <Botao variante="primario" type="submit" style={{ display: "flex", alignItems: "center", gap: "6px" }}><MdSave size={17} aria-hidden="true" /> Salvar alterações</Botao>
                </footer>
              </form>
            </>
          ) : (
          <div className="detalhe-aluno">
            <div className="detalhe-aluno__perfil">
              <div className="topbar__avatar detalhe-aluno__avatar" aria-hidden="true">
                {gerarIniciais(alunoDetalhe.nome)}
              </div>
              <div style={{ flex: 1 }}>
                <h3 className="detalhe-aluno__nome">{alunoDetalhe.nome}</h3>
                <span className="detalhe-aluno__email">{alunoDetalhe.email}</span>
              </div>
              <Insignia texto={alunoDetalhe.ativo ? "Ativo" : "Inativo"} variante={alunoDetalhe.ativo ? "sucesso" : "erro"} />
              {podeEditar_ && (
                <button
                  type="button"
                  className="modal-cabecalho__btn-icone"
                  onClick={() => setModoEdicao(true)}
                  aria-label="Editar aluno"
                  data-tooltip="Editar dados"
                >
                  <TbPencil size={15} aria-hidden="true" />
                </button>
              )}
            </div>

            <dl className="detalhe-aluno__dados">
              <div className="detalhe-aluno__dado">
                <dt>Código</dt>
                <dd style={{ fontFamily: "var(--fonte-mono)", fontSize: "0.85rem" }}>{alunoDetalhe.codigo ?? "—"}</dd>
              </div>
              <div className="detalhe-aluno__dado">
                <dt>Cadastro</dt>
                <dd>{new Date(alunoDetalhe.dataCadastro).toLocaleDateString("pt-BR")}</dd>
              </div>
            </dl>

            {podeEditar_ && (
              <div className="detalhe-status">
                <div>
                  <strong className="detalhe-status__rotulo">Status da conta</strong>
                  <span className="detalhe-status__descricao">
                    {alunoDetalhe.ativo ? "Aluno tem acesso à plataforma" : "Acesso à plataforma bloqueado"}
                  </span>
                </div>
                <button
                  role="switch"
                  aria-checked={alunoDetalhe.ativo}
                  className={`switch-ativo${alunoDetalhe.ativo ? " switch-ativo--ativo" : ""}`}
                  onClick={() => setConfirmandoStatus({ id: alunoDetalhe.id, nome: alunoDetalhe.nome, novoEstado: !alunoDetalhe.ativo })}
                  type="button"
                  aria-label={alunoDetalhe.ativo ? "Ativo — clique para desativar" : "Inativo — clique para ativar"}
                  data-tooltip={alunoDetalhe.ativo ? "Desativar conta" : "Ativar conta"}
                >
                  <TbX     size={10} className="switch-ativo__icone switch-ativo__icone--esq" aria-hidden="true" />
                  <span className="switch-ativo__thumb" aria-hidden="true" />
                  <TbCheck size={10} className="switch-ativo__icone switch-ativo__icone--dir" aria-hidden="true" />
                </button>
              </div>
            )}

            <section className="detalhe-aluno__matriculas">
              <h4 className="detalhe-aluno__secao-titulo">Matrículas</h4>
              {(() => {
                const mats = matriculas.filter((m) => m.alunoId === alunoDetalhe.id);
                if (mats.length === 0) return <p className="texto-vazio">Nenhuma matrícula registrada.</p>;
                return (
                  <ul className="detalhe-matriculas-lista" role="list">
                    {mats.map((m) => (
                      <li key={m.id} className="detalhe-matricula-item">
                        <div className="detalhe-matricula-item__topo">
                          <strong className="detalhe-matricula-item__curso">{m.cursoTitulo}</strong>
                          <Insignia texto={m.status} variante={VARIANTE_MATRICULA[m.status] ?? "neutro"} />
                        </div>
                        <span className="detalhe-matricula-item__meta">
                          {m.turmaNome} · {m.codigoMatricula} · {new Date(m.dataSolicitacao).toLocaleDateString("pt-BR")}
                        </span>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </section>
          </div>
          )}
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

      {/* Confirmação de ativação em massa */}
      {confirmandoAtivar && (
        <Modal titulo="Ativar alunos" onFechar={() => setConfirmandoAtivar(false)}>
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
            Ativar <strong>{selecionados.size} {selecionados.size === 1 ? "aluno" : "alunos"}</strong> selecionado{selecionados.size !== 1 ? "s" : ""}?
          </p>
          <footer className="modal-rodape">
            <Botao variante="perigo" onClick={() => setConfirmandoAtivar(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" /> Cancelar</Botao>
            <Botao variante="sucesso" onClick={() => { const n = selecionados.size; ativarSelecionados(); setConfirmandoAtivar(false); onToast?.(`${n} aluno${n !== 1 ? "s" : ""} ativado${n !== 1 ? "s" : ""}.`, "sucesso"); }} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbCheck size={15} aria-hidden="true" /> Confirmar</Botao>
          </footer>
        </Modal>
      )}

      {/* Confirmação de desativação em massa */}
      {confirmandoDesativar && (
        <Modal titulo="Desativar alunos" onFechar={() => setConfirmandoDesativar(false)}>
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
            Desativar <strong>{selecionados.size} {selecionados.size === 1 ? "aluno" : "alunos"}</strong> selecionado{selecionados.size !== 1 ? "s" : ""}?
          </p>
          <footer className="modal-rodape">
            <Botao variante="perigo" onClick={() => setConfirmandoDesativar(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" /> Cancelar</Botao>
            <Botao variante="sucesso" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={() => { const n = selecionados.size; desativarSelecionados(); setConfirmandoDesativar(false); onToast?.(`${n} aluno${n !== 1 ? "s" : ""} desativado${n !== 1 ? "s" : ""}.`, "aviso"); }}><TbCheck size={15} aria-hidden="true" /> Confirmar</Botao>
          </footer>
        </Modal>
      )}

      {/* Confirmação remoção em massa */}
      {removendoEmMassa && (
        <Modal titulo="Remover alunos" onFechar={() => setRemovendoEmMassa(false)}>
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
            Tem certeza que deseja remover <strong>{selecionados.size} {selecionados.size === 1 ? "aluno" : "alunos"}</strong>? Esta ação não pode ser desfeita.
          </p>
          <footer className="modal-rodape">
            <Botao variante="perigo" onClick={() => setRemovendoEmMassa(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" /> Cancelar</Botao>
            <Botao variante="sucesso" style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={confirmarRemocaoEmMassa}><TbTrash size={16} aria-hidden="true" />Confirmar</Botao>
          </footer>
        </Modal>
      )}

    </div>
  );
}
