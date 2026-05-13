import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { TbChevronUp, TbChevronDown, TbSelector, TbDotsVertical } from "react-icons/tb";
import Insignia from "../../componentes/Insignia.jsx";
import Modal from "../../componentes/Modal.jsx";
import Botao from "../../componentes/Botao.jsx";
import { usuarios, matriculas } from "../../dados/dadosMock.js";
import { podeEditar, podeExcluir } from "../../dados/permissoes.js";

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

export default function TelaAlunos({ usuario }) {
  const tipo = usuario?.tipo;

  const podeEditar_   = podeEditar(tipo, "alunos");
  const podeExcluir_  = podeExcluir(tipo, "alunos");

  const [lista, setLista]               = useState(usuarios.filter((u) => u.tipo === "Aluno"));
  const [busca, setBusca]               = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [ordenacao, setOrdenacao]       = useState({ campo: "nome", direcao: "asc" });
  const [pagina, setPagina]             = useState(1);

  const [selecionados, setSelecionados]     = useState(new Set());
  const [removendoEmMassa, setRemovendoEmMassa] = useState(false);

  const [kebabAberto,   setKebabAberto]   = useState(null);
  const [kebabPos,      setKebabPos]      = useState({ top: 0, left: 0 });
  const [alunoDetalhe,  setAlunoDetalhe]  = useState(null);
  const [alunoRemovendo, setAlunoRemovendo] = useState(null);

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
    setLista((prev) => prev.map((u) => u.id === id ? { ...u, ativo: !u.ativo } : u));
    if (alunoDetalhe?.id === id) setAlunoDetalhe((prev) => ({ ...prev, ativo: !prev.ativo }));
  }

  function confirmarRemocao() {
    setLista((prev) => prev.filter((u) => u.id !== alunoRemovendo));
    if (alunoDetalhe?.id === alunoRemovendo) setAlunoDetalhe(null);
    setAlunoRemovendo(null);
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
    { chave: "ativo",        rotulo: "Status"    },
    { chave: null,           rotulo: "Matrícula" },
  ];

  const alunoKebab = lista.find((a) => a.id === kebabAberto);

  return (
    <div className="tela-alunos">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Alunos</h2>
          <p className="cabecalho-pagina__subtitulo">
            {lista.length} cadastrados · {totalAtivos} ativos · {totalInativos} inativos
          </p>
        </div>
      </header>

      {/* Filtros */}
      <div className="barra-filtros">
        <label htmlFor="busca-alunos" className="visualmente-oculto">Buscar aluno</label>
        <input
          id="busca-alunos"
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
                <td>
                  <Insignia texto={aluno.ativo ? "Ativo" : "Inativo"} variante={aluno.ativo ? "sucesso" : "erro"} />
                </td>
                <td><CelulaMatricula alunoId={aluno.id} /></td>
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
            <Botao variante="fantasma" tamanho="pequeno" onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={paginaSegura === 1}>‹ Anterior</Botao>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <button key={n} className={`paginacao__pagina${paginaSegura === n ? " paginacao__pagina--ativa" : ""}`} onClick={() => setPagina(n)} type="button" aria-current={paginaSegura === n ? "page" : undefined}>{n}</button>
            ))}
            <Botao variante="fantasma" tamanho="pequeno" onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={paginaSegura === totalPaginas}>Próxima ›</Botao>
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
      {kebabAberto && alunoKebab && createPortal(
        <div className="kebab-menu" role="menu" style={{ top: kebabPos.top, left: kebabPos.left }} ref={kebabRef}>
          <button role="menuitem" className="kebab-menu__item" type="button"
            onClick={() => { setAlunoDetalhe(alunoKebab); setKebabAberto(null); }}>
            Ver detalhes
          </button>
          {podeEditar_ && (
            <button role="menuitem" className="kebab-menu__item" type="button"
              onClick={() => { alternarAtivo(alunoKebab.id); setKebabAberto(null); }}>
              {alunoKebab.ativo ? "Desativar conta" : "Ativar conta"}
            </button>
          )}
          {podeExcluir_ && (
            <>
              <div className="kebab-menu__divisor" />
              <button role="menuitem" className="kebab-menu__item kebab-menu__item--perigo" type="button"
                onClick={() => { setAlunoRemovendo(alunoKebab.id); setKebabAberto(null); }}>
                Remover aluno
              </button>
            </>
          )}
        </div>,
        document.body
      )}

      {/* Modal detalhes */}
      {alunoDetalhe && (
        <Modal titulo="Detalhes do Aluno" onFechar={() => setAlunoDetalhe(null)}>
          <div className="detalhe-aluno">
            <div className="detalhe-aluno__perfil">
              <div className="topbar__avatar detalhe-aluno__avatar" aria-hidden="true">
                {gerarIniciais(alunoDetalhe.nome)}
              </div>
              <div>
                <h3 className="detalhe-aluno__nome">{alunoDetalhe.nome}</h3>
                <span className="detalhe-aluno__email">{alunoDetalhe.email}</span>
              </div>
              <Insignia texto={alunoDetalhe.ativo ? "Ativo" : "Inativo"} variante={alunoDetalhe.ativo ? "sucesso" : "erro"} />
            </div>

            <dl className="detalhe-aluno__dados">
              <div className="detalhe-aluno__dado">
                <dt>Cadastro</dt>
                <dd>{new Date(alunoDetalhe.dataCadastro).toLocaleDateString("pt-BR")}</dd>
              </div>
            </dl>

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

          <footer className="modal-rodape">
            {podeEditar_ && (
              <Botao variante={alunoDetalhe.ativo ? "perigo" : "sucesso"} tamanho="pequeno" onClick={() => alternarAtivo(alunoDetalhe.id)}>
                {alunoDetalhe.ativo ? "Desativar conta" : "Ativar conta"}
              </Botao>
            )}
            {podeExcluir_ && (
              <Botao variante="fantasma" tamanho="pequeno" onClick={() => { setAlunoRemovendo(alunoDetalhe.id); setAlunoDetalhe(null); }}>
                Remover aluno
              </Botao>
            )}
            <Botao variante="primario" onClick={() => setAlunoDetalhe(null)}>Fechar</Botao>
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
            <Botao variante="fantasma" onClick={() => setRemovendoEmMassa(false)}>Cancelar</Botao>
            <Botao variante="perigo" onClick={confirmarRemocaoEmMassa}>Confirmar remoção</Botao>
          </footer>
        </Modal>
      )}

      {/* Confirmação remoção individual */}
      {alunoRemovendo && (() => {
        const aluno = lista.find((a) => a.id === alunoRemovendo);
        return (
          <Modal titulo="Remover aluno" onFechar={() => setAlunoRemovendo(null)}>
            <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
              Tem certeza que deseja remover <strong>{aluno?.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            <footer className="modal-rodape">
              <Botao variante="fantasma" onClick={() => setAlunoRemovendo(null)}>Cancelar</Botao>
              <Botao variante="perigo" onClick={confirmarRemocao}>Confirmar remoção</Botao>
            </footer>
          </Modal>
        );
      })()}
    </div>
  );
}
