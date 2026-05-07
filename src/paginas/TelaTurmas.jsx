import { useState } from "react";
import Insignia from "../componentes/Insignia.jsx";
import Modal from "../componentes/Modal.jsx";
import { turmas, cursos } from "../dados/dadosMock.js";
import { podeCriar, podeEditar } from "../dados/permissoes.js";

export default function TelaTurmas({ usuario }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [filtro, setFiltro] = useState("");

  const tipo = usuario?.tipo;

  const turmasFiltradas = turmas.filter((t) =>
    t.nomeTurma.toLowerCase().includes(filtro.toLowerCase()) ||
    t.cursoTitulo.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="tela-turmas">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Turmas</h2>
          <p className="cabecalho-pagina__subtitulo">{turmas.length} turmas cadastradas</p>
        </div>
        {podeCriar(tipo, "turmas") && (
          <button className="botao botao--primario" onClick={() => setModalAberto(true)} type="button">
            + Nova Turma
          </button>
        )}
      </header>

      <div className="barra-filtros">
        <label htmlFor="busca-turmas" className="visualmente-oculto">Buscar turma</label>
        <input
          id="busca-turmas"
          type="search"
          className="campo__entrada barra-filtros__busca"
          placeholder="Buscar por nome ou curso..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <ul className="grade-turmas" role="list" aria-label="Lista de turmas">
        {turmasFiltradas.map((turma) => (
          <li key={turma.id} className="cartao-turma">
            <header className="cartao-turma__cabecalho">
              <h3 className="cartao-turma__nome">{turma.nomeTurma}</h3>
              <Insignia texto={turma.status} />
            </header>
            <p className="cartao-turma__curso">{turma.cursoTitulo}</p>
            <dl className="cartao-turma__meta">
              <div>
                <dt>Professor</dt>
                <dd>{turma.professorNome}</dd>
              </div>
              <div>
                <dt>Alunos</dt>
                <dd>{turma.totalAlunos}</dd>
              </div>
            </dl>
            <footer className="cartao-turma__rodape">
              <button className="botao botao--fantasma botao--pequeno" type="button">Ver alunos</button>
              {podeEditar(tipo, "turmas") && (
                <button className="botao botao--secundario botao--pequeno" type="button">Editar</button>
              )}
            </footer>
          </li>
        ))}
      </ul>

      {turmasFiltradas.length === 0 && (
        <p className="texto-vazio texto-vazio--central" role="status">
          Nenhuma turma encontrada para "{filtro}".
        </p>
      )}

      {modalAberto && (
        <Modal titulo="Nova Turma" onFechar={() => setModalAberto(false)}>
          <form className="formulario-modal" onSubmit={(e) => { e.preventDefault(); setModalAberto(false); }}>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="nome-turma">Nome da Turma *</label>
              <input id="nome-turma" className="campo__entrada" type="text" placeholder="Ex: WEB-2024-C" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="curso-turma">Curso *</label>
              <select id="curso-turma" className="campo__entrada" required>
                <option value="">Selecione um curso</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>{c.titulo}</option>
                ))}
              </select>
            </div>
            <div className="modal-rodape">
              <button type="button" className="botao botao--fantasma" onClick={() => setModalAberto(false)}>Cancelar</button>
              <button type="submit" className="botao botao--primario">Criar Turma</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
