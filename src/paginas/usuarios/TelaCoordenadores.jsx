import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { TbChevronUp, TbChevronDown, TbSelector, TbDotsVertical } from "react-icons/tb";
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

export default function TelaCoordenadores({ usuario }) {
  const tipo = usuario?.tipo;
  const podeEditar_  = podeEditar(tipo, "coordenadores");
  const podeExcluir_ = podeExcluir(tipo, "coordenadores");

  const [lista, setLista] = useState(() => db.usuarios.listar().filter((u) => u.tipo === "Coordenador"));
  useEffect(() => { db.usuarios.salvarPorTipo("Coordenador", lista); }, [lista]);

  const [busca, setBusca]               = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [ordenacao, setOrdenacao]       = useState({ campo: "nome", direcao: "asc" });
  const [pagina, setPagina]             = useState(1);

  const [selecionados, setSelecionados]         = useState(new Set());
  const [removendoEmMassa, setRemovendoEmMassa] = useState(false);

  const [kebabAberto,      setKebabAberto]      = useState(null);
  const [kebabPos,         setKebabPos]         = useState({ top: 0, left: 0 });
  const [coordDetalhe,     setCoordDetalhe]     = useState(null);
  const [coordRemovendo,   setCoordRemovendo]   = useState(null);
  const [coordEditando,    setCoordEditando]    = useState(null);
  const [modalNovoAberto,  setModalNovoAberto]  = useState(false);

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
    setLista((prev) => prev.map((u) => u.id === id ? { ...u, ativo: !u.ativo } : u));
    if (coordDetalhe?.id === id) setCoordDetalhe((prev) => ({ ...prev, ativo: !prev.ativo }));
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
      ...coordEditando,
      nome:  f["edit-nome"].value.trim(),
      email: f["edit-email"].value.trim(),
    };
    setLista((prev) => prev.map((u) => u.id === atualizado.id ? atualizado : u));
    if (coordDetalhe?.id === atualizado.id) setCoordDetalhe(atualizado);
    setCoordEditando(null);
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
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Coordenadores</h2>
          <p className="cabecalho-pagina__subtitulo">
            {lista.length} cadastrados · {totalAtivos} ativos · {totalInativos} inativos
          </p>
        </div>
        {podeCriar(tipo, "coordenadores") && (
          <Botao variante="primario" onClick={() => setModalNovoAberto(true)}>
            + Novo Coordenador
          </Botao>
        )}
      </header>

      {/* Filtros */}
      <div className="barra-filtros">
        <label htmlFor="busca-coord" className="visualmente-oculto">Buscar coordenador</label>
        <input
          id="busca-coord"
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
                    onChange={toggleTodos}
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
                      onChange={(e) => toggleSelecionado(e, coord.id)}
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
            <Botao variante="fantasma" tamanho="pequeno" onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={paginaSegura === 1}>‹ Anterior</Botao>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <button key={n} className={`paginacao__pagina${paginaSegura === n ? " paginacao__pagina--ativa" : ""}`} onClick={() => setPagina(n)} type="button" aria-current={paginaSegura === n ? "page" : undefined}>{n}</button>
            ))}
            <Botao variante="fantasma" tamanho="pequeno" onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={paginaSegura === totalPaginas}>Próxima ›</Botao>
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
              <Botao variante="perigo" tamanho="pequeno" onClick={() => setRemovendoEmMassa(true)}>Remover</Botao>
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
            onClick={() => { setCoordDetalhe(coordKebab); setKebabAberto(null); }}>
            Ver detalhes
          </button>
          {podeEditar_ && (
            <button role="menuitem" className="kebab-menu__item" type="button"
              onClick={() => { setCoordEditando({ ...coordKebab }); setKebabAberto(null); }}>
              Editar dados
            </button>
          )}
          {podeEditar_ && (
            <button role="menuitem" className="kebab-menu__item" type="button"
              onClick={() => { alternarAtivo(coordKebab.id); setKebabAberto(null); }}>
              {coordKebab.ativo ? "Desativar conta" : "Ativar conta"}
            </button>
          )}
          {podeExcluir_ && (
            <>
              <div className="kebab-menu__divisor" />
              <button role="menuitem" className="kebab-menu__item kebab-menu__item--perigo" type="button"
                onClick={() => { setCoordRemovendo(coordKebab.id); setKebabAberto(null); }}>
                Remover coordenador
              </button>
            </>
          )}
        </div>,
        document.body
      )}

      {/* Modal detalhes */}
      {coordDetalhe && (() => {
        const cursosCoord = db.cursos.listar().filter((c) => c.coordenadorId === coordDetalhe.id);
        return (
        <Modal titulo="Detalhes do Coordenador" onFechar={() => setCoordDetalhe(null)}>
          <div className="detalhe-aluno">
            <div className="detalhe-aluno__perfil">
              <div className="topbar__avatar detalhe-aluno__avatar" aria-hidden="true">
                {gerarIniciais(coordDetalhe.nome)}
              </div>
              <div>
                <h3 className="detalhe-aluno__nome">{coordDetalhe.nome}</h3>
                <span className="detalhe-aluno__email">{coordDetalhe.email}</span>
              </div>
              <Insignia texto={coordDetalhe.ativo ? "Ativo" : "Inativo"} variante={coordDetalhe.ativo ? "sucesso" : "erro"} />
            </div>
            <dl className="detalhe-aluno__dados">
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
            <h4 className="coord-cursos-secao__titulo">
              Cursos sob coordenação
              <span className="coord-cursos-secao__contagem">{cursosCoord.length}</span>
            </h4>
            {cursosCoord.length === 0 ? (
              <p className="texto-vazio">Nenhum curso atribuído a este coordenador.</p>
            ) : (
              <ul className="coord-cursos-lista" role="list">
                {cursosCoord.map((c) => (
                  <li key={c.id} className="coord-cursos-lista__item">
                    <div className="coord-cursos-lista__info">
                      <span className="coord-cursos-lista__titulo">{c.titulo}</span>
                      <span className="coord-cursos-lista__codigo">{c.codigoRegistro} · {c.nivel}</span>
                    </div>
                    <Insignia texto={c.ativo ? "Ativo" : "Inativo"} variante={c.ativo ? "sucesso" : "erro"} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <footer className="modal-rodape">
            {podeEditar_ && (
              <Botao variante={coordDetalhe.ativo ? "perigo" : "sucesso"} tamanho="pequeno"
                onClick={() => alternarAtivo(coordDetalhe.id)}>
                {coordDetalhe.ativo ? "Desativar conta" : "Ativar conta"}
              </Botao>
            )}
            {podeExcluir_ && (
              <Botao variante="fantasma" tamanho="pequeno"
                onClick={() => { setCoordRemovendo(coordDetalhe.id); setCoordDetalhe(null); }}>
                Remover
              </Botao>
            )}
            <Botao variante="primario" onClick={() => setCoordDetalhe(null)}>Fechar</Botao>
          </footer>
        </Modal>
        );
      })()}

      {/* Modal edição */}
      {coordEditando && (
        <Modal titulo="Editar Coordenador" onFechar={() => setCoordEditando(null)}>
          <form className="formulario-modal" onSubmit={salvarEdicao}>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="edit-nome">Nome completo *</label>
              <input id="edit-nome" className="campo__entrada" type="text" defaultValue={coordEditando.nome} required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="edit-email">E-mail *</label>
              <input id="edit-email" className="campo__entrada" type="email" defaultValue={coordEditando.email} required />
            </div>
            <footer className="modal-rodape">
              <Botao variante="fantasma" type="button" onClick={() => setCoordEditando(null)}>Cancelar</Botao>
              <Botao variante="primario" type="submit">Salvar alterações</Botao>
            </footer>
          </form>
        </Modal>
      )}

      {/* Novo coordenador */}
      {modalNovoAberto && (
        <Modal titulo="Novo Coordenador" onFechar={() => setModalNovoAberto(false)}>
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
              <Botao variante="fantasma" type="button" onClick={() => setModalNovoAberto(false)}>Cancelar</Botao>
              <Botao variante="primario" type="submit">Cadastrar Coordenador</Botao>
            </footer>
          </form>
        </Modal>
      )}

      {/* Confirmação remoção em massa */}
      {removendoEmMassa && (
        <Modal titulo="Remover coordenadores" onFechar={() => setRemovendoEmMassa(false)}>
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
            Tem certeza que deseja remover <strong>{selecionados.size} {selecionados.size === 1 ? "coordenador" : "coordenadores"}</strong>? Esta ação não pode ser desfeita.
          </p>
          <footer className="modal-rodape">
            <Botao variante="fantasma" onClick={() => setRemovendoEmMassa(false)}>Cancelar</Botao>
            <Botao variante="perigo" onClick={confirmarRemocaoEmMassa}>Confirmar remoção</Botao>
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
              <Botao variante="fantasma" onClick={() => setCoordRemovendo(null)}>Cancelar</Botao>
              <Botao variante="perigo" onClick={confirmarRemocao}>Confirmar remoção</Botao>
            </footer>
          </Modal>
        );
      })()}
    </div>
  );
}
