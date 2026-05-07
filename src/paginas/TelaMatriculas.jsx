import { useState } from "react";
import Insignia from "../componentes/Insignia.jsx";
import TabelaDados from "../componentes/TabelaDados.jsx";
import { matriculas } from "../dados/dadosMock.js";
import { podeEditar } from "../dados/permissoes.js";

export default function TelaMatriculas({ usuario }) {
  const tipo = usuario?.tipo;
  const [filtroStatus, setFiltroStatus] = useState("");
  const [listaMat, setListaMat] = useState(matriculas);

  /* Aluno enxerga apenas suas próprias matrículas */
  const listaBase = tipo === "Aluno"
    ? listaMat.filter((m) => m.alunoId === usuario?.id)
    : listaMat;

  const matriculasFiltradas = filtroStatus
    ? listaBase.filter((m) => m.status === filtroStatus)
    : listaBase;

  function aprovar(id) {
    setListaMat((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "Aprovada" } : m))
    );
  }

  function rejeitar(id) {
    setListaMat((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "Rejeitada" } : m))
    );
  }

  const colunasBase = [
    { chave: "codigoMatricula", rotulo: "Código" },
    { chave: "alunoNome",       rotulo: "Aluno" },
    { chave: "cursoTitulo",     rotulo: "Curso" },
    { chave: "turmaNome",       rotulo: "Turma" },
    {
      chave: "status",
      rotulo: "Status",
      renderizar: (m) => <Insignia texto={m.status} />,
    },
    {
      chave: "dataSolicitacao",
      rotulo: "Solicitado em",
      renderizar: (m) => new Date(m.dataSolicitacao).toLocaleDateString("pt-BR"),
    },
  ];

  const colunaAcoes = {
    chave: "acoes",
    rotulo: "Ações",
    renderizar: (m) =>
      m.status === "Pendente" ? (
        <div className="acoes-tabela">
          <button
            className="botao botao--sucesso botao--pequeno"
            onClick={() => aprovar(m.id)}
            type="button"
            aria-label={`Aprovar matrícula de ${m.alunoNome}`}
          >
            Aprovar
          </button>
          <button
            className="botao botao--perigo botao--pequeno"
            onClick={() => rejeitar(m.id)}
            type="button"
            aria-label={`Rejeitar matrícula de ${m.alunoNome}`}
          >
            Rejeitar
          </button>
        </div>
      ) : (
        <span className="texto-mudo">—</span>
      ),
  };

  const colunas = podeEditar(tipo, "matriculas")
    ? [...colunasBase, colunaAcoes]
    : colunasBase;

  const totalPendentes = listaBase.filter((m) => m.status === "Pendente").length;

  return (
    <div className="tela-matriculas">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">
            {tipo === "Aluno" ? "Minhas Matrículas" : "Matrículas"}
          </h2>
          <p className="cabecalho-pagina__subtitulo">
            {listaBase.length} {tipo === "Aluno" ? "matrícula(s) registrada(s)" : "matrículas no total"}
            {totalPendentes > 0 && ` — ${totalPendentes} pendente${totalPendentes > 1 ? "s" : ""}`}
          </p>
        </div>
      </header>

      <div className="barra-filtros">
        <label htmlFor="filtro-status-mat" className="visualmente-oculto">Filtrar por status</label>
        <select
          id="filtro-status-mat"
          className="campo__entrada barra-filtros__select"
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          aria-label="Filtrar matrículas por status"
        >
          <option value="">Todos os status</option>
          <option value="Pendente">Pendente</option>
          <option value="Aprovada">Aprovada</option>
          <option value="Rejeitada">Rejeitada</option>
          <option value="Cancelada">Cancelada</option>
        </select>
      </div>

      <section className="painel-secao" aria-labelledby="titulo-tabela-matriculas">
        <header className="painel-secao__cabecalho">
          <h2 className="painel-secao__titulo" id="titulo-tabela-matriculas">
            {filtroStatus || (tipo === "Aluno" ? "Minhas Matrículas" : "Todas as Matrículas")}
          </h2>
        </header>
        <TabelaDados
          colunas={colunas}
          linhas={matriculasFiltradas}
          semDadosTexto="Nenhuma matrícula encontrada."
        />
      </section>
    </div>
  );
}
