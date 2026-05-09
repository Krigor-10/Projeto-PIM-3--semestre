import { useState } from "react";
import Insignia from "../../componentes/Insignia.jsx";
import Modal from "../../componentes/Modal.jsx";
import { turmas, cursos, matriculas } from "../../dados/dadosMock.js";
import { podeCriar, podeEditar } from "../../dados/permissoes.js";

export default function TelaTurmas({ usuario }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [listaTurmas, setListaTurmas] = useState(turmas);
  const [turmaAlunos, setTurmaAlunos] = useState(null);
  const [turmaEditando, setTurmaEditando] = useState(null);

  const tipo = usuario?.tipo;

  const turmasFiltradas = listaTurmas.filter((t) => {
    if (tipo === "Professor" && t.professorId !== usuario?.id) return false;
    return (
      t.nomeTurma.toLowerCase().includes(filtro.toLowerCase()) ||
      t.cursoTitulo.toLowerCase().includes(filtro.toLowerCase())
    );
  });

  function criarTurma(e) {
    e.preventDefault();
    const f = e.target;
    const cursoId = Number(f["curso-turma"].value);
    const cursoObj = cursos.find((c) => c.id === cursoId);
    setListaTurmas((prev) => [...prev, {
      id: Date.now(),
      nomeTurma: f["nome-turma"].value,
      cursoId,
      cursoTitulo: cursoObj?.titulo ?? "—",
      professorId: null,
      professorNome: "A definir",
      totalAlunos: 0,
      status: "Ativa",
    }]);
    setModalAberto(false);
  }

  function salvarEdicaoTurma(e) {
    e.preventDefault();
    const f = e.target;
    setListaTurmas((prev) => prev.map((t) =>
      t.id === turmaEditando.id
        ? { ...t, nomeTurma: f["edit-nome-turma"].value, status: f["edit-status-turma"].value }
        : t
    ));
    setTurmaEditando(null);
  }

  return (
    <div className="tela-turmas">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Turmas</h2>
          <p className="cabecalho-pagina__subtitulo">
            {tipo === "Professor" ? `${turmasFiltradas.length} turma(s) sob sua responsabilidade` : `${listaTurmas.length} turmas cadastradas`}
          </p>
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
              {tipo !== "Professor" && (
                <button
                  className="botao botao--fantasma botao--pequeno"
                  type="button"
                  onClick={() => setTurmaAlunos(turma)}
                  aria-label={`Ver alunos da turma ${turma.nomeTurma}`}
                >
                  Ver alunos
                </button>
              )}
              {podeEditar(tipo, "turmas") && (
                <button
                  className="botao botao--secundario botao--pequeno"
                  type="button"
                  onClick={() => setTurmaEditando(turma)}
                  aria-label={`Editar turma ${turma.nomeTurma}`}
                >
                  Editar
                </button>
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
          <form className="formulario-modal" onSubmit={criarTurma}>
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

      {turmaAlunos && (
        <Modal titulo={`Alunos — ${turmaAlunos.nomeTurma}`} onFechar={() => setTurmaAlunos(null)}>
          {(() => {
            const alunosDaTurma = matriculas.filter((m) => m.turmaId === turmaAlunos.id && m.status === "Aprovada");
            return alunosDaTurma.length === 0 ? (
              <p className="texto-vazio">Nenhum aluno matriculado nesta turma.</p>
            ) : (
              <ul className="lista-usuarios" role="list">
                {alunosDaTurma.map((m) => (
                  <li key={m.id} className="item-usuario">
                    <div className="topbar__avatar item-usuario__avatar" aria-hidden="true">
                      {m.alunoNome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
                    </div>
                    <div className="item-usuario__info">
                      <strong>{m.alunoNome}</strong>
                      <span>{m.codigoMatricula}</span>
                    </div>
                  </li>
                ))}
              </ul>
            );
          })()}
          <div className="modal-rodape">
            <button className="botao botao--fantasma" onClick={() => setTurmaAlunos(null)} type="button">Fechar</button>
          </div>
        </Modal>
      )}

      {turmaEditando && (
        <Modal titulo={`Editar — ${turmaEditando.nomeTurma}`} onFechar={() => setTurmaEditando(null)}>
          <form className="formulario-modal" onSubmit={salvarEdicaoTurma}>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="edit-nome-turma">Nome da Turma *</label>
              <input id="edit-nome-turma" className="campo__entrada" type="text" defaultValue={turmaEditando.nomeTurma} required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="edit-status-turma">Status</label>
              <select id="edit-status-turma" className="campo__entrada" defaultValue={turmaEditando.status}>
                <option value="Ativa">Ativa</option>
                <option value="Concluída">Concluída</option>
                <option value="Inativa">Inativa</option>
              </select>
            </div>
            <div className="modal-rodape">
              <button type="button" className="botao botao--fantasma" onClick={() => setTurmaEditando(null)}>Cancelar</button>
              <button type="submit" className="botao botao--primario">Salvar alterações</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
