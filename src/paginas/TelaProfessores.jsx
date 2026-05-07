import { useState } from "react";
import Insignia from "../componentes/Insignia.jsx";
import Modal from "../componentes/Modal.jsx";
import ModalEdicaoUsuario from "../componentes/ModalEdicaoUsuario.jsx";
import { usuarios } from "../dados/dadosMock.js";
import { podeCriar, podeEditar } from "../dados/permissoes.js";

export default function TelaProfessores({ usuario }) {
  const [filtroNome, setFiltroNome] = useState("");
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [lista, setLista] = useState(usuarios.filter((u) => u.tipo === "Professor"));

  const tipo = usuario?.tipo;

  const professoresFiltrados = lista.filter((u) =>
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
    <div className="tela-professores">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Professores</h2>
          <p className="cabecalho-pagina__subtitulo">
            {lista.length} professores cadastrados ·{" "}
            {lista.filter((u) => u.ativo).length} ativos
          </p>
        </div>
        {podeCriar(tipo, "professores") && (
          <button className="botao botao--primario" onClick={() => setModalNovoAberto(true)} type="button">
            + Novo Professor
          </button>
        )}
      </header>

      <div className="barra-filtros">
        <label htmlFor="busca-professores" className="visualmente-oculto">Buscar professor</label>
        <input
          id="busca-professores"
          type="search"
          className="campo__entrada barra-filtros__busca"
          placeholder="Buscar por nome ou e-mail..."
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
        />
      </div>

      <ul className="lista-usuarios-completa" role="list" aria-label="Lista de professores">
        {professoresFiltrados.map((prof) => (
          <li key={prof.id} className="cartao-usuario">
            <div className="cartao-usuario__avatar" aria-hidden="true">
              {prof.nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
            </div>
            <div className="cartao-usuario__info">
              <strong className="cartao-usuario__nome">{prof.nome}</strong>
              <span className="cartao-usuario__email">{prof.email}</span>
              <span className="cartao-usuario__data">
                Cadastrado em {new Date(prof.dataCadastro).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="cartao-usuario__badges">
              <Insignia texto={prof.ativo ? "Ativo" : "Inativo"} variante={prof.ativo ? "sucesso" : "erro"} />
            </div>
            <div className="cartao-usuario__acoes">
              {podeEditar(tipo, "professores") && (
                <button
                  className={`botao botao--pequeno ${prof.ativo ? "botao--perigo" : "botao--sucesso"}`}
                  onClick={() => alternarAtivo(prof.id)}
                  type="button"
                  aria-label={`${prof.ativo ? "Desativar" : "Ativar"} professor ${prof.nome}`}
                >
                  {prof.ativo ? "Desativar" : "Ativar"}
                </button>
              )}
              {podeEditar(tipo, "professores") && (
                <button
                  className="botao botao--fantasma botao--pequeno"
                  onClick={() => setUsuarioEditando(prof)}
                  type="button"
                  aria-label={`Editar professor ${prof.nome}`}
                >
                  Editar
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {professoresFiltrados.length === 0 && (
        <p className="texto-vazio texto-vazio--central" role="status">
          Nenhum professor encontrado.
        </p>
      )}

      {modalNovoAberto && (
        <Modal titulo="Novo Professor" onFechar={() => setModalNovoAberto(false)}>
          <form className="formulario-modal" onSubmit={(e) => { e.preventDefault(); setModalNovoAberto(false); }}>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="nome-prof">Nome completo *</label>
              <input id="nome-prof" className="campo__entrada" type="text" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="email-prof">E-mail *</label>
              <input id="email-prof" className="campo__entrada" type="email" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="cpf-prof">CPF *</label>
              <input id="cpf-prof" className="campo__entrada" type="text" placeholder="000.000.000-00" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="especializacao-prof">Especialização</label>
              <input id="especializacao-prof" className="campo__entrada" type="text" placeholder="Ex: Desenvolvimento Web" />
            </div>
            <div className="modal-rodape">
              <button type="button" className="botao botao--fantasma" onClick={() => setModalNovoAberto(false)}>Cancelar</button>
              <button type="submit" className="botao botao--primario">Cadastrar Professor</button>
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
