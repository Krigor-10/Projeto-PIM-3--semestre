import { useState } from "react";
import Insignia from "../../componentes/Insignia.jsx";
import Modal from "../../componentes/Modal.jsx";
import ModalEdicaoUsuario from "../../componentes/ModalEdicaoUsuario.jsx";
import { usuarios } from "../../dados/dadosMock.js";
import { podeCriar, podeEditar } from "../../dados/permissoes.js";

export default function TelaAlunos({ usuario }) {
  const [filtroNome, setFiltroNome] = useState("");
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [lista, setLista] = useState(usuarios.filter((u) => u.tipo === "Aluno"));

  const tipo = usuario?.tipo;

  const alunosFiltrados = lista.filter((u) =>
    u.nome.toLowerCase().includes(filtroNome.toLowerCase()) ||
    u.email.toLowerCase().includes(filtroNome.toLowerCase())
  );

  function alternarAtivo(id) {
    setLista((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ativo: !u.ativo } : u))
    );
  }

  function salvarEdicao(usuarioAtualizado) {
    setLista((prev) =>
      prev.map((u) => (u.id === usuarioAtualizado.id ? usuarioAtualizado : u))
    );
  }

  return (
    <div className="tela-alunos">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Alunos</h2>
          <p className="cabecalho-pagina__subtitulo">
            {lista.length} alunos cadastrados ·{" "}
            {lista.filter((u) => u.ativo).length} ativos
          </p>
        </div>
        {podeCriar(tipo, "alunos") && (
          <button className="botao botao--primario" onClick={() => setModalNovoAberto(true)} type="button">
            + Novo Aluno
          </button>
        )}
      </header>

      <div className="barra-filtros">
        <label htmlFor="busca-alunos" className="visualmente-oculto">Buscar aluno</label>
        <input
          id="busca-alunos"
          type="search"
          className="campo__entrada barra-filtros__busca"
          placeholder="Buscar por nome ou e-mail..."
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
        />
      </div>

      <ul className="lista-usuarios-completa" role="list" aria-label="Lista de alunos">
        {alunosFiltrados.map((aluno) => (
          <li key={aluno.id} className="cartao-usuario">
            <div className="cartao-usuario__avatar" aria-hidden="true">
              {aluno.nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
            </div>
            <div className="cartao-usuario__info">
              <strong className="cartao-usuario__nome">{aluno.nome}</strong>
              <span className="cartao-usuario__email">{aluno.email}</span>
              <span className="cartao-usuario__data">
                Cadastrado em {new Date(aluno.dataCadastro).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="cartao-usuario__badges">
              <Insignia texto={aluno.ativo ? "Ativo" : "Inativo"} variante={aluno.ativo ? "sucesso" : "erro"} />
            </div>
            <div className="cartao-usuario__acoes">
              {podeEditar(tipo, "alunos") && (
                <button
                  className={`botao botao--pequeno ${aluno.ativo ? "botao--perigo" : "botao--sucesso"}`}
                  onClick={() => alternarAtivo(aluno.id)}
                  type="button"
                  aria-label={`${aluno.ativo ? "Desativar" : "Ativar"} aluno ${aluno.nome}`}
                >
                  {aluno.ativo ? "Desativar" : "Ativar"}
                </button>
              )}
              {podeEditar(tipo, "alunos") && (
                <button
                  className="botao botao--fantasma botao--pequeno"
                  onClick={() => setUsuarioEditando(aluno)}
                  type="button"
                  aria-label={`Editar aluno ${aluno.nome}`}
                >
                  Editar
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {alunosFiltrados.length === 0 && (
        <p className="texto-vazio texto-vazio--central" role="status">
          Nenhum aluno encontrado.
        </p>
      )}

      {modalNovoAberto && (
        <Modal titulo="Novo Aluno" onFechar={() => setModalNovoAberto(false)}>
          <form
            className="formulario-modal"
            onSubmit={(e) => {
              e.preventDefault();
              const f = e.target;
              setLista((prev) => [...prev, {
                id: Date.now(),
                nome: f["nome-aluno"].value,
                email: f["email-aluno"].value,
                tipo: "Aluno",
                ativo: true,
                dataCadastro: new Date().toISOString().slice(0, 10),
              }]);
              setModalNovoAberto(false);
            }}
          >
            <div className="campo">
              <label className="campo__rotulo" htmlFor="nome-aluno">Nome completo *</label>
              <input id="nome-aluno" className="campo__entrada" type="text" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="email-aluno">E-mail *</label>
              <input id="email-aluno" className="campo__entrada" type="email" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="cpf-aluno">CPF *</label>
              <input id="cpf-aluno" className="campo__entrada" type="text" placeholder="000.000.000-00" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="telefone-aluno">Telefone</label>
              <input id="telefone-aluno" className="campo__entrada" type="tel" placeholder="(11) 99999-9999" />
            </div>
            <div className="modal-rodape">
              <button type="button" className="botao botao--fantasma" onClick={() => setModalNovoAberto(false)}>Cancelar</button>
              <button type="submit" className="botao botao--primario">Cadastrar Aluno</button>
            </div>
          </form>
        </Modal>
      )}

      {usuarioEditando && (
        <ModalEdicaoUsuario
          usuario={usuarioEditando}
          onSalvar={salvarEdicao}
          onFechar={() => setUsuarioEditando(null)}
        />
      )}
    </div>
  );
}
