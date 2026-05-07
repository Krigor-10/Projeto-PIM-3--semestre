import { useState } from "react";
import Insignia from "../componentes/Insignia.jsx";
import Modal from "../componentes/Modal.jsx";
import ModalEdicaoUsuario from "../componentes/ModalEdicaoUsuario.jsx";
import { usuarios } from "../dados/dadosMock.js";
import { podeCriar, podeEditar } from "../dados/permissoes.js";

export default function TelaCoordenadores({ usuario }) {
  const [filtroNome, setFiltroNome] = useState("");
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [lista, setLista] = useState(usuarios.filter((u) => u.tipo === "Coordenador"));

  const tipo = usuario?.tipo;

  const coordFiltrados = lista.filter((u) =>
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
    <div className="tela-coordenadores">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Coordenadores</h2>
          <p className="cabecalho-pagina__subtitulo">
            {lista.length} coordenadores cadastrados ·{" "}
            {lista.filter((u) => u.ativo).length} ativos
          </p>
        </div>
        {podeCriar(tipo, "coordenadores") && (
          <button className="botao botao--primario" onClick={() => setModalNovoAberto(true)} type="button">
            + Novo Coordenador
          </button>
        )}
      </header>

      <div className="barra-filtros">
        <label htmlFor="busca-coord" className="visualmente-oculto">Buscar coordenador</label>
        <input
          id="busca-coord"
          type="search"
          className="campo__entrada barra-filtros__busca"
          placeholder="Buscar por nome ou e-mail..."
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
        />
      </div>

      <ul className="lista-usuarios-completa" role="list" aria-label="Lista de coordenadores">
        {coordFiltrados.map((coord) => (
          <li key={coord.id} className="cartao-usuario">
            <div className="cartao-usuario__avatar" aria-hidden="true">
              {coord.nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
            </div>
            <div className="cartao-usuario__info">
              <strong className="cartao-usuario__nome">{coord.nome}</strong>
              <span className="cartao-usuario__email">{coord.email}</span>
              <span className="cartao-usuario__data">
                Cadastrado em {new Date(coord.dataCadastro).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="cartao-usuario__badges">
              <Insignia texto={coord.ativo ? "Ativo" : "Inativo"} variante={coord.ativo ? "sucesso" : "erro"} />
            </div>
            <div className="cartao-usuario__acoes">
              {podeEditar(tipo, "coordenadores") && (
                <button
                  className={`botao botao--pequeno ${coord.ativo ? "botao--perigo" : "botao--sucesso"}`}
                  onClick={() => alternarAtivo(coord.id)}
                  type="button"
                  aria-label={`${coord.ativo ? "Desativar" : "Ativar"} coordenador ${coord.nome}`}
                >
                  {coord.ativo ? "Desativar" : "Ativar"}
                </button>
              )}
              {podeEditar(tipo, "coordenadores") && (
                <button
                  className="botao botao--fantasma botao--pequeno"
                  onClick={() => setUsuarioEditando(coord)}
                  type="button"
                  aria-label={`Editar coordenador ${coord.nome}`}
                >
                  Editar
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {coordFiltrados.length === 0 && (
        <p className="texto-vazio texto-vazio--central" role="status">
          Nenhum coordenador encontrado.
        </p>
      )}

      {modalNovoAberto && (
        <Modal titulo="Novo Coordenador" onFechar={() => setModalNovoAberto(false)}>
          <form className="formulario-modal" onSubmit={(e) => { e.preventDefault(); setModalNovoAberto(false); }}>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="nome-coord">Nome completo *</label>
              <input id="nome-coord" className="campo__entrada" type="text" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="email-coord">E-mail *</label>
              <input id="email-coord" className="campo__entrada" type="email" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="cpf-coord">CPF *</label>
              <input id="cpf-coord" className="campo__entrada" type="text" placeholder="000.000.000-00" required />
            </div>
            <div className="modal-rodape">
              <button type="button" className="botao botao--fantasma" onClick={() => setModalNovoAberto(false)}>Cancelar</button>
              <button type="submit" className="botao botao--primario">Cadastrar Coordenador</button>
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
