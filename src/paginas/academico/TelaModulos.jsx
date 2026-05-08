import { useState } from "react";
import TabelaDados from "../../componentes/TabelaDados.jsx";
import Modal from "../../componentes/Modal.jsx";
import { modulos, cursos } from "../../dados/dadosMock.js";
import { podeCriar } from "../../dados/permissoes.js";

export default function TelaModulos({ usuario }) {
  const [filtroId, setFiltroId] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [listaModulos, setListaModulos] = useState(modulos);

  const tipo = usuario?.tipo;

  const modulosFiltrados = filtroId
    ? listaModulos.filter((m) => m.cursoId === Number(filtroId))
    : listaModulos;

  const colunas = [
    { chave: "codigoRegistro", rotulo: "Código" },
    { chave: "titulo", rotulo: "Título" },
    {
      chave: "cursoId",
      rotulo: "Curso",
      renderizar: (m) => cursos.find((c) => c.id === m.cursoId)?.titulo ?? "—",
    },
    { chave: "ordem", rotulo: "Ordem" },
    { chave: "totalConteudos", rotulo: "Conteúdos" },
  ];

  return (
    <div className="tela-modulos">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Módulos</h2>
          <p className="cabecalho-pagina__subtitulo">{listaModulos.length} módulos cadastrados</p>
        </div>
        {podeCriar(tipo, "modulos") && (
          <button className="botao botao--primario" onClick={() => setModalAberto(true)} type="button">
            + Novo Módulo
          </button>
        )}
      </header>

      <div className="barra-filtros">
        <label htmlFor="filtro-curso-modulo" className="visualmente-oculto">Filtrar por curso</label>
        <select
          id="filtro-curso-modulo"
          className="campo__entrada barra-filtros__select"
          value={filtroId}
          onChange={(e) => setFiltroId(e.target.value)}
          aria-label="Filtrar módulos por curso"
        >
          <option value="">Todos os cursos</option>
          {cursos.map((c) => (
            <option key={c.id} value={c.id}>{c.titulo}</option>
          ))}
        </select>
      </div>

      <section className="painel-secao" aria-labelledby="titulo-tabela-modulos">
        <header className="painel-secao__cabecalho">
          <h2 className="painel-secao__titulo" id="titulo-tabela-modulos">
            {filtroId ? `Módulos — ${cursos.find((c) => c.id === Number(filtroId))?.titulo}` : "Todos os Módulos"}
          </h2>
        </header>
        <TabelaDados
          colunas={colunas}
          linhas={modulosFiltrados}
          semDadosTexto="Nenhum módulo encontrado."
        />
      </section>

      {modalAberto && (
        <Modal titulo="Novo Módulo" onFechar={() => setModalAberto(false)}>
          <form
            className="formulario-modal"
            onSubmit={(e) => {
              e.preventDefault();
              const f = e.target;
              const cursoId = Number(f["curso-modulo"].value);
              const ordemModulo = Number(f["ordem-modulo"].value) || 1;
              setListaModulos((prev) => [...prev, {
                id: Date.now(),
                cursoId,
                codigoRegistro: `MOD-${String(prev.length + 1).padStart(3, "0")}`,
                titulo: f["titulo-modulo"].value,
                ordem: ordemModulo,
                totalConteudos: 0,
              }]);
              setModalAberto(false);
            }}
          >
            <div className="campo">
              <label className="campo__rotulo" htmlFor="titulo-modulo">Título *</label>
              <input id="titulo-modulo" className="campo__entrada" type="text" placeholder="Ex: Fundamentos de React" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="curso-modulo">Curso *</label>
              <select id="curso-modulo" className="campo__entrada" required>
                <option value="">Selecione um curso</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>{c.titulo}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="ordem-modulo">Ordem</label>
              <input id="ordem-modulo" className="campo__entrada" type="number" min="1" defaultValue="1" />
            </div>
            <div className="modal-rodape">
              <button type="button" className="botao botao--fantasma" onClick={() => setModalAberto(false)}>Cancelar</button>
              <button type="submit" className="botao botao--primario">Criar Módulo</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
