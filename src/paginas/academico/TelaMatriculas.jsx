import { useState, useEffect } from "react";
import Insignia from "@/componentes/Insignia.jsx";
import Botao from "@/componentes/Botao.jsx";
import Modal from "@/componentes/Modal.jsx";
import { db } from "@/dados/db.js";
import { podeEditar } from "@/dados/permissoes.js";

export default function TelaMatriculas({ usuario }) {
  const tipo = usuario?.tipo;
  const [listaMat, setListaMat]                   = useState(() => db.matriculas.listar());
  useEffect(() => { db.matriculas.salvar(listaMat); }, [listaMat]);
  const [abaAtiva, setAbaAtiva]                     = useState("pendentes");
  const [selecionados, setSelecionados]             = useState(new Set());
  const [confirmandoEmMassa, setConfirmandoEmMassa] = useState(null); // "aprovar" | "rejeitar"

  const podeAgir = podeEditar(tipo, "matriculas");

  const listaBase = tipo === "Aluno"
    ? listaMat.filter((m) => m.alunoId === usuario?.id)
    : listaMat;

  const listaPendentes  = listaBase.filter((m) => m.status === "Pendente");
  const listaRejeitadas = listaBase.filter((m) => m.status === "Rejeitada");
  const listaAprovadas  = listaBase.filter((m) => m.status === "Aprovada");

  const idsPendentes      = listaPendentes.map((m) => m.id);
  const temSelecionados   = selecionados.size > 0;
  const todosSelecionados = idsPendentes.length > 0 && idsPendentes.every((id) => selecionados.has(id));
  const alvos             = temSelecionados ? listaPendentes.filter((m) => selecionados.has(m.id)) : listaPendentes;

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

  function reativar(id) {
    setListaMat((prev) => prev.map((m) => m.id === id ? { ...m, status: "Pendente" } : m));
    setAbaAtiva("pendentes");
  }

  function executarEmMassa(novoStatus) {
    const ids = new Set(alvos.map((m) => m.id));
    setListaMat((prev) => prev.map((m) => ids.has(m.id) ? { ...m, status: novoStatus } : m));

    if (novoStatus === "Aprovada") {
      const todosUsuarios = db.usuarios.listar();
      const usuariosAtualizados = todosUsuarios.map((u) => {
        const foiAprovado = alvos.some((m) => m.alunoId === u.id);
        return foiAprovado && !u.ativo ? { ...u, ativo: true } : u;
      });
      // Adiciona alunos que ainda não existem na lista de usuários
      alvos.forEach((m) => {
        if (!todosUsuarios.find((u) => u.id === m.alunoId)) {
          usuariosAtualizados.push({
            id: m.alunoId,
            nome: m.alunoNome,
            email: `${m.alunoNome.toLowerCase().replace(/\s+/g, ".")}@coderyse.com`,
            tipo: "Aluno",
            ativo: true,
            dataCadastro: new Date().toISOString().slice(0, 10),
          });
        }
      });
      db.usuarios.salvar(usuariosAtualizados);
    }

    setSelecionados(new Set());
    setConfirmandoEmMassa(null);
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
      </header>

      {/* Abas */}
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
            {aba.contagem > 0 && <span className="abas-matriculas__contagem">{aba.contagem}</span>}
          </button>
        ))}
      </div>

      {/* Painel: Pendentes */}
      <section
        id="painel-pendentes"
        role="tabpanel"
        hidden={abaAtiva !== "pendentes"}
        className="painel-secao painel-secao--sem-topo"
        aria-label="Matrículas pendentes"
      >
        {podeAgir && (
          <div className="toolbar-massa-matriculas" role="toolbar" aria-label="Ações em massa">
            <span className="toolbar-massa-matriculas__contador">
              {temSelecionados
                ? `${selecionados.size} selecionada${selecionados.size !== 1 ? "s" : ""}`
                : `${listaPendentes.length} pendente${listaPendentes.length !== 1 ? "s" : ""}`
              }
            </span>
            <div className="toolbar-massa-matriculas__acoes">
              <Botao
                variante="sucesso"
                tamanho="pequeno"
                disabled={listaPendentes.length === 0}
                onClick={() => setConfirmandoEmMassa("aprovar")}
              >
                {temSelecionados ? "Aprovar selecionadas" : "Aprovar todas"}
              </Botao>
              <Botao
                variante="perigo"
                tamanho="pequeno"
                disabled={listaPendentes.length === 0}
                onClick={() => setConfirmandoEmMassa("rejeitar")}
              >
                {temSelecionados ? "Rejeitar selecionadas" : "Rejeitar todas"}
              </Botao>
            </div>
            {temSelecionados && (
              <button className="barra-massa__limpar" onClick={() => setSelecionados(new Set())} aria-label="Limpar seleção" type="button">✕</button>
            )}
          </div>
        )}

        <div className="tabela-dados-container" role="region">
          <table className="tabela-dados">
            <thead>
              <tr>
                {podeAgir && (
                  <th scope="col" style={{ width: 44 }}>
                    <input
                      type="checkbox"
                      className="tabela-checkbox"
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
              </tr>
            </thead>
            <tbody>
              {listaPendentes.length === 0 ? (
                <tr className="tabela-dados--sem-dados">
                  <td colSpan={podeAgir ? 6 : 5}>Nenhuma matrícula pendente.</td>
                </tr>
              ) : listaPendentes.map((mat) => (
                <tr key={mat.id} className={selecionados.has(mat.id) ? "tabela-linha-clicavel--selecionada" : ""}>
                  {podeAgir && (
                    <td>
                      <input
                        type="checkbox"
                        className="tabela-checkbox"
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Painel: Rejeitadas */}
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
                      <Botao variante="secundario" tamanho="pequeno" onClick={() => reativar(mat.id)} aria-label={`Reativar matrícula de ${mat.alunoNome}`}>
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

      {/* Painel: Aprovadas */}
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

      {/* Modal de confirmação em massa */}
      {confirmandoEmMassa && (
        <Modal
          titulo={confirmandoEmMassa === "aprovar" ? "Aprovar todas as pendentes" : "Rejeitar todas as pendentes"}
          onFechar={() => setConfirmandoEmMassa(null)}
        >
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
            {confirmandoEmMassa === "aprovar"
              ? <><strong>{alvos.length}</strong> {alvos.length === 1 ? "matrícula será aprovada." : "matrículas serão aprovadas."}</>
              : <><strong>{alvos.length}</strong> {alvos.length === 1 ? "matrícula será rejeitada." : "matrículas serão rejeitadas."} Esta ação não pode ser desfeita.</>
            }
          </p>
          <footer className="modal-rodape">
            <Botao variante="fantasma" onClick={() => setConfirmandoEmMassa(null)}>Cancelar</Botao>
            <Botao
              variante={confirmandoEmMassa === "aprovar" ? "sucesso" : "perigo"}
              onClick={() => executarEmMassa(confirmandoEmMassa === "aprovar" ? "Aprovada" : "Rejeitada")}
            >
              {confirmandoEmMassa === "aprovar" ? "Confirmar aprovação" : "Confirmar rejeição"}
            </Botao>
          </footer>
        </Modal>
      )}
    </div>
  );
}
