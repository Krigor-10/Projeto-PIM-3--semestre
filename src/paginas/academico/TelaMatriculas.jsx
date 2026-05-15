import { useState, useEffect } from "react";
import Insignia from "@/componentes/Insignia.jsx";
import Botao from "@/componentes/Botao.jsx";
import { db } from "@/dados/db.js";
import { podeEditar } from "@/dados/permissoes.js";

function TabelaSimples({ colunas, linhas, semDados }) {
  return (
    <div className="tabela-dados-container" role="region">
      <table className="tabela-dados">
        <thead>
          <tr>{colunas.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
        </thead>
        <tbody>
          {linhas.length === 0 ? (
            <tr className="tabela-dados--sem-dados">
              <td colSpan={colunas.length}>{semDados}</td>
            </tr>
          ) : linhas}
        </tbody>
      </table>
    </div>
  );
}

export default function TelaMatriculas({ usuario }) {
  const tipo = usuario?.tipo;
  const [listaMat, setListaMat] = useState(() => db.matriculas.listar());
  useEffect(() => { db.matriculas.salvar(listaMat); }, [listaMat]);
  const [selecionados, setSelecionados] = useState(new Set());
  const [abaAtiva, setAbaAtiva] = useState("pendentes");

  const podeAgir = podeEditar(tipo, "matriculas");

  const listaBase = tipo === "Aluno"
    ? listaMat.filter((m) => m.alunoId === usuario?.id)
    : listaMat;

  const listaPendentes  = listaBase.filter((m) => m.status === "Pendente");
  const listaRejeitadas = listaBase.filter((m) => m.status === "Rejeitada");
  const listaAprovadas  = listaBase.filter((m) => m.status === "Aprovada");

  const idsPendentes = listaPendentes.map((m) => m.id);
  const todosSelecionados =
    idsPendentes.length > 0 && idsPendentes.every((id) => selecionados.has(id));

  function aprovar(id) {
    setListaMat((prev) => prev.map((m) => m.id === id ? { ...m, status: "Aprovada" } : m));
    setSelecionados((prev) => { const s = new Set(prev); s.delete(id); return s; });
  }

  function rejeitar(id) {
    setListaMat((prev) => prev.map((m) => m.id === id ? { ...m, status: "Rejeitada" } : m));
    setSelecionados((prev) => { const s = new Set(prev); s.delete(id); return s; });
  }

  function reativar(id) {
    setListaMat((prev) => prev.map((m) => m.id === id ? { ...m, status: "Pendente" } : m));
    setAbaAtiva("pendentes");
  }

  function aprovarSelecionados() {
    setListaMat((prev) =>
      prev.map((m) => selecionados.has(m.id) ? { ...m, status: "Aprovada" } : m)
    );
    setSelecionados(new Set());
  }

  function toggleSelecionado(id) {
    setSelecionados((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function toggleTodos() {
    setSelecionados(todosSelecionados ? new Set() : new Set(idsPendentes));
  }

  /* ── Vista do Aluno ── */
  if (tipo === "Aluno") {
    return (
      <div className="tela-matriculas">
        <header className="cabecalho-pagina">
          <div>
            <h2 className="cabecalho-pagina__titulo">Minhas Matrículas</h2>
            <p className="cabecalho-pagina__subtitulo">{listaBase.length} matrícula(s) registrada(s)</p>
          </div>
        </header>
        <ul className="lista-usuarios-completa" role="list" aria-label="Minhas matrículas">
          {listaBase.map((mat) => (
            <li key={mat.id} className="cartao-usuario">
              <div className="cartao-usuario__info">
                <strong className="cartao-usuario__nome">{mat.cursoTitulo}</strong>
                <span className="cartao-usuario__email">{mat.turmaNome} · {mat.codigoMatricula}</span>
                <span className="cartao-usuario__data">
                  Solicitado em {new Date(mat.dataSolicitacao).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="cartao-usuario__badges">
                <Insignia
                  texto={mat.status}
                  variante={mat.status === "Aprovada" ? "sucesso" : mat.status === "Rejeitada" ? "erro" : "neutro"}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  /* ── Vista administrativa ── */
  const abas = [
    { chave: "pendentes",  rotulo: "Pendentes",  contagem: listaPendentes.length  },
    { chave: "rejeitadas", rotulo: "Rejeitadas", contagem: listaRejeitadas.length },
    { chave: "aprovadas",  rotulo: "Aprovadas",  contagem: listaAprovadas.length  },
  ];

  return (
    <div className="tela-matriculas">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Matrículas</h2>
          <p className="cabecalho-pagina__subtitulo">
            {listaBase.length} no total — {listaPendentes.length} pendente{listaPendentes.length !== 1 ? "s" : ""}
          </p>
        </div>
        {podeAgir && selecionados.size > 0 && (
          <Botao variante="sucesso" onClick={aprovarSelecionados}>
            Aprovar selecionados ({selecionados.size})
          </Botao>
        )}
      </header>

      {/* ── Abas ── */}
      <div className="abas-matriculas" role="tablist" aria-label="Filtrar matrículas por status">
        {abas.map((aba) => (
          <button
            key={aba.chave}
            role="tab"
            aria-selected={abaAtiva === aba.chave}
            aria-controls={`painel-${aba.chave}`}
            className={`abas-matriculas__aba ${abaAtiva === aba.chave ? "abas-matriculas__aba--ativa" : ""}`}
            onClick={() => setAbaAtiva(aba.chave)}
            type="button"
          >
            {aba.rotulo}
            {aba.contagem > 0 && (
              <span className="abas-matriculas__contagem">{aba.contagem}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Painel: Pendentes ── */}
      <section
        id="painel-pendentes"
        role="tabpanel"
        hidden={abaAtiva !== "pendentes"}
        className="painel-secao painel-secao--sem-topo"
        aria-label="Matrículas pendentes"
      >
        <div className="tabela-dados-container" role="region">
          <table className="tabela-dados">
            <thead>
              <tr>
                {podeAgir && (
                  <th scope="col" style={{ width: "44px" }}>
                    <input
                      type="checkbox"
                      checked={todosSelecionados}
                      onChange={toggleTodos}
                      disabled={idsPendentes.length === 0}
                      aria-label="Selecionar todos"
                    />
                  </th>
                )}
                <th scope="col">Código</th>
                <th scope="col">Aluno</th>
                <th scope="col">Curso</th>
                <th scope="col">Turma</th>
                <th scope="col">Data</th>
                {podeAgir && <th scope="col">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {listaPendentes.length === 0 ? (
                <tr className="tabela-dados--sem-dados">
                  <td colSpan={podeAgir ? 7 : 5}>Nenhuma matrícula pendente.</td>
                </tr>
              ) : listaPendentes.map((mat) => (
                <tr key={mat.id}>
                  {podeAgir && (
                    <td>
                      <input
                        type="checkbox"
                        checked={selecionados.has(mat.id)}
                        onChange={() => toggleSelecionado(mat.id)}
                        aria-label={`Selecionar ${mat.alunoNome}`}
                      />
                    </td>
                  )}
                  <td>{mat.codigoMatricula}</td>
                  <td>{mat.alunoNome}</td>
                  <td>{mat.cursoTitulo}</td>
                  <td>{mat.turmaNome}</td>
                  <td>{new Date(mat.dataSolicitacao).toLocaleDateString("pt-BR")}</td>
                  {podeAgir && (
                    <td>
                      <div className="acoes-tabela">
                        <Botao
                          variante="sucesso"
                          tamanho="pequeno"
                          onClick={() => aprovar(mat.id)}
                          aria-label={`Aprovar ${mat.alunoNome}`}
                        >
                          Aprovar
                        </Botao>
                        <Botao
                          variante="perigo"
                          tamanho="pequeno"
                          onClick={() => rejeitar(mat.id)}
                          aria-label={`Rejeitar ${mat.alunoNome}`}
                        >
                          Rejeitar
                        </Botao>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Painel: Rejeitadas ── */}
      <section
        id="painel-rejeitadas"
        role="tabpanel"
        hidden={abaAtiva !== "rejeitadas"}
        className="painel-secao painel-secao--sem-topo"
        aria-label="Matrículas rejeitadas"
      >
        <div className="tabela-dados-container" role="region">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th scope="col">Código</th>
                <th scope="col">Aluno</th>
                <th scope="col">Curso</th>
                <th scope="col">Turma</th>
                <th scope="col">Data</th>
                {podeAgir && <th scope="col">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {listaRejeitadas.length === 0 ? (
                <tr className="tabela-dados--sem-dados">
                  <td colSpan={podeAgir ? 6 : 5}>Nenhuma matrícula rejeitada.</td>
                </tr>
              ) : listaRejeitadas.map((mat) => (
                <tr key={mat.id}>
                  <td>{mat.codigoMatricula}</td>
                  <td>{mat.alunoNome}</td>
                  <td>{mat.cursoTitulo}</td>
                  <td>{mat.turmaNome}</td>
                  <td>{new Date(mat.dataSolicitacao).toLocaleDateString("pt-BR")}</td>
                  {podeAgir && (
                    <td>
                      <Botao
                        variante="secundario"
                        tamanho="pequeno"
                        onClick={() => reativar(mat.id)}
                        aria-label={`Reativar matrícula de ${mat.alunoNome}`}
                      >
                        Reativar
                      </Botao>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Painel: Aprovadas ── */}
      <section
        id="painel-aprovadas"
        role="tabpanel"
        hidden={abaAtiva !== "aprovadas"}
        className="painel-secao painel-secao--sem-topo"
        aria-label="Matrículas aprovadas"
      >
        <div className="tabela-dados-container" role="region">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th scope="col">Código</th>
                <th scope="col">Aluno</th>
                <th scope="col">Curso</th>
                <th scope="col">Turma</th>
                <th scope="col">Data</th>
              </tr>
            </thead>
            <tbody>
              {listaAprovadas.length === 0 ? (
                <tr className="tabela-dados--sem-dados">
                  <td colSpan={5}>Nenhuma matrícula aprovada.</td>
                </tr>
              ) : listaAprovadas.map((mat) => (
                <tr key={mat.id}>
                  <td>{mat.codigoMatricula}</td>
                  <td>{mat.alunoNome}</td>
                  <td>{mat.cursoTitulo}</td>
                  <td>{mat.turmaNome}</td>
                  <td>{new Date(mat.dataSolicitacao).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
