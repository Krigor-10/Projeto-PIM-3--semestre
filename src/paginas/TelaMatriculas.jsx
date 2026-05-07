import { useState } from "react";
import Insignia from "../componentes/Insignia.jsx";
import { matriculas } from "../dados/dadosMock.js";
import { podeEditar } from "../dados/permissoes.js";

export default function TelaMatriculas({ usuario }) {
  const tipo = usuario?.tipo;
  const [listaMat, setListaMat] = useState(matriculas);
  const [selecionados, setSelecionados] = useState(new Set());
  const [abaAtiva, setAbaAtiva] = useState("pendentes");

  const podeAgir = podeEditar(tipo, "matriculas");

  /* Aluno enxerga apenas suas próprias matrículas */
  const listaBase = tipo === "Aluno"
    ? listaMat.filter((m) => m.alunoId === usuario?.id)
    : listaMat;

  const pendentes  = listaBase.filter((m) => m.status === "Pendente" || m.status === "Rejeitada");
  const aprovadas  = listaBase.filter((m) => m.status === "Aprovada");
  const idsPendentes = pendentes.filter((m) => m.status === "Pendente").map((m) => m.id);
  const todosSelecionados = idsPendentes.length > 0 && idsPendentes.every((id) => selecionados.has(id));

  function aprovar(id) {
    setListaMat((prev) => prev.map((m) => m.id === id ? { ...m, status: "Aprovada" } : m));
    setSelecionados((prev) => { const s = new Set(prev); s.delete(id); return s; });
  }

  function rejeitar(id) {
    setListaMat((prev) => prev.map((m) => m.id === id ? { ...m, status: "Rejeitada" } : m));
    setSelecionados((prev) => { const s = new Set(prev); s.delete(id); return s; });
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
    setSelecionados(
      todosSelecionados ? new Set() : new Set(idsPendentes)
    );
  }

  /* ── Vista simplificada do Aluno ── */
  if (tipo === "Aluno") {
    return (
      <div className="tela-matriculas">
        <header className="cabecalho-pagina">
          <div>
            <h2 className="cabecalho-pagina__titulo">Minhas Matrículas</h2>
            <p className="cabecalho-pagina__subtitulo">
              {listaBase.length} matrícula(s) registrada(s)
            </p>
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

  /* ── Vista administrativa com aprovação em massa ── */
  return (
    <div className="tela-matriculas">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Matrículas</h2>
          <p className="cabecalho-pagina__subtitulo">
            {listaBase.length} no total — {idsPendentes.length} pendente{idsPendentes.length !== 1 ? "s" : ""}
          </p>
        </div>
        {podeAgir && selecionados.size > 0 && (
          <button
            className="botao botao--sucesso"
            onClick={aprovarSelecionados}
            type="button"
          >
            Aprovar selecionados ({selecionados.size})
          </button>
        )}
      </header>

      {/* ── Navegação por abas ── */}
      <div className="abas-matriculas" role="tablist" aria-label="Filtrar matrículas">
        <button
          role="tab"
          aria-selected={abaAtiva === "pendentes"}
          aria-controls="painel-pendentes"
          className={`abas-matriculas__aba ${abaAtiva === "pendentes" ? "abas-matriculas__aba--ativa" : ""}`}
          onClick={() => setAbaAtiva("pendentes")}
          type="button"
        >
          Pendentes e Rejeitadas
          {pendentes.length > 0 && (
            <span className="criar-avaliacao__contagem">{pendentes.length}</span>
          )}
        </button>
        <button
          role="tab"
          aria-selected={abaAtiva === "aprovadas"}
          aria-controls="painel-aprovadas"
          className={`abas-matriculas__aba ${abaAtiva === "aprovadas" ? "abas-matriculas__aba--ativa" : ""}`}
          onClick={() => setAbaAtiva("aprovadas")}
          type="button"
        >
          Aprovadas
          {aprovadas.length > 0 && (
            <span className="criar-avaliacao__contagem">{aprovadas.length}</span>
          )}
        </button>
      </div>

      {/* ── Painel: Pendentes e Rejeitadas ── */}
      <section
        id="painel-pendentes"
        role="tabpanel"
        aria-labelledby="painel-pendentes"
        hidden={abaAtiva !== "pendentes"}
        className="painel-secao painel-secao--sem-topo"
      >
        <div className="tabela-dados-container" role="region" aria-label="Matrículas pendentes e rejeitadas">
          <table className="tabela-dados">
            <thead>
              <tr>
                {podeAgir && (
                  <th scope="col" style={{ width: "44px" }}>
                    <input
                      type="checkbox"
                      checked={todosSelecionados}
                      onChange={toggleTodos}
                      aria-label="Selecionar todos os pendentes"
                      disabled={idsPendentes.length === 0}
                    />
                  </th>
                )}
                <th scope="col">Código</th>
                <th scope="col">Aluno</th>
                <th scope="col">Curso</th>
                <th scope="col">Turma</th>
                <th scope="col">Status</th>
                <th scope="col">Data</th>
                {podeAgir && <th scope="col">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {pendentes.length === 0 ? (
                <tr className="tabela-dados--sem-dados">
                  <td colSpan={podeAgir ? 8 : 6}>Nenhuma matrícula pendente ou rejeitada.</td>
                </tr>
              ) : (
                pendentes.map((mat) => (
                  <tr key={mat.id}>
                    {podeAgir && (
                      <td>
                        {mat.status === "Pendente" && (
                          <input
                            type="checkbox"
                            checked={selecionados.has(mat.id)}
                            onChange={() => toggleSelecionado(mat.id)}
                            aria-label={`Selecionar matrícula de ${mat.alunoNome}`}
                          />
                        )}
                      </td>
                    )}
                    <td>{mat.codigoMatricula}</td>
                    <td>{mat.alunoNome}</td>
                    <td>{mat.cursoTitulo}</td>
                    <td>{mat.turmaNome}</td>
                    <td>
                      <Insignia
                        texto={mat.status}
                        variante={mat.status === "Rejeitada" ? "erro" : "neutro"}
                      />
                    </td>
                    <td>{new Date(mat.dataSolicitacao).toLocaleDateString("pt-BR")}</td>
                    {podeAgir && (
                      <td>
                        {mat.status === "Pendente" ? (
                          <div className="acoes-tabela">
                            <button
                              className="botao botao--sucesso botao--pequeno"
                              onClick={() => aprovar(mat.id)}
                              type="button"
                              aria-label={`Aprovar matrícula de ${mat.alunoNome}`}
                            >
                              Aprovar
                            </button>
                            <button
                              className="botao botao--perigo botao--pequeno"
                              onClick={() => rejeitar(mat.id)}
                              type="button"
                              aria-label={`Rejeitar matrícula de ${mat.alunoNome}`}
                            >
                              Rejeitar
                            </button>
                          </div>
                        ) : (
                          <button
                            className="botao botao--secundario botao--pequeno"
                            onClick={() => aprovar(mat.id)}
                            type="button"
                            aria-label={`Reativar matrícula de ${mat.alunoNome}`}
                          >
                            Reativar
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Painel: Aprovadas ── */}
      <section
        id="painel-aprovadas"
        role="tabpanel"
        aria-labelledby="painel-aprovadas"
        hidden={abaAtiva !== "aprovadas"}
        className="painel-secao painel-secao--sem-topo"
      >
        <div className="tabela-dados-container" role="region" aria-label="Matrículas aprovadas">
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
              {aprovadas.length === 0 ? (
                <tr className="tabela-dados--sem-dados">
                  <td colSpan={5}>Nenhuma matrícula aprovada.</td>
                </tr>
              ) : (
                aprovadas.map((mat) => (
                  <tr key={mat.id}>
                    <td>{mat.codigoMatricula}</td>
                    <td>{mat.alunoNome}</td>
                    <td>{mat.cursoTitulo}</td>
                    <td>{mat.turmaNome}</td>
                    <td>{new Date(mat.dataSolicitacao).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
