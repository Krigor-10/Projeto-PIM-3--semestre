import { useState } from "react";
import Insignia from "../../componentes/Insignia.jsx";
import Modal from "../../componentes/Modal.jsx";
import ModalEdicaoUsuario from "../../componentes/ModalEdicaoUsuario.jsx";
import { usuarios } from "../../dados/dadosMock.js";
import { podeCriar, podeEditar } from "../../dados/permissoes.js";

export default function TelaUsuarios({ usuario }) {
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroNome, setFiltroNome] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [lista, setLista] = useState(usuarios);

  const tipo = usuario?.tipo;

  const usuariosFiltrados = lista.filter((u) => {
    const matchTipo = filtroTipo ? u.tipo === filtroTipo : true;
    const matchNome = filtroNome
      ? u.nome.toLowerCase().includes(filtroNome.toLowerCase())
      : true;
    return matchTipo && matchNome;
  });

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

  const contagem = {
    total: lista.length,
    alunos: lista.filter((u) => u.tipo === "Aluno").length,
    professores: lista.filter((u) => u.tipo === "Professor").length,
    coordenadores: lista.filter((u) => u.tipo === "Coordenador").length,
    admins: lista.filter((u) => u.tipo === "Admin").length,
  };

  return (
    <div className="tela-usuarios">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Usuários</h2>
          <p className="cabecalho-pagina__subtitulo">
            {contagem.total} usuários · {contagem.alunos} alunos · {contagem.professores} professores · {contagem.coordenadores} coordenadores
          </p>
        </div>
        {podeCriar(tipo, "usuarios") && (
          <button className="botao botao--primario" onClick={() => setModalAberto(true)} type="button">
            + Novo Usuário
          </button>
        )}
      </header>

      <div className="barra-filtros">
        <label htmlFor="busca-usuarios" className="visualmente-oculto">Buscar usuário</label>
        <input
          id="busca-usuarios"
          type="search"
          className="campo__entrada barra-filtros__busca"
          placeholder="Buscar por nome..."
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
        />
        <label htmlFor="filtro-tipo-usr" className="visualmente-oculto">Filtrar por tipo</label>
        <select
          id="filtro-tipo-usr"
          className="campo__entrada barra-filtros__select"
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="">Todos os tipos</option>
          <option value="Aluno">Aluno</option>
          <option value="Professor">Professor</option>
          <option value="Coordenador">Coordenador</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      <ul className="lista-usuarios-completa" role="list" aria-label="Lista de usuários">
        {usuariosFiltrados.map((usr) => (
          <li key={usr.id} className="cartao-usuario">
            <div className="cartao-usuario__avatar" aria-hidden="true">
              {usr.nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
            </div>
            <div className="cartao-usuario__info">
              <strong className="cartao-usuario__nome">{usr.nome}</strong>
              <span className="cartao-usuario__email">{usr.email}</span>
              <span className="cartao-usuario__data">
                Cadastrado em {new Date(usr.dataCadastro).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="cartao-usuario__badges">
              <Insignia texto={usr.tipo} variante="marca" />
              <Insignia texto={usr.ativo ? "Ativo" : "Inativo"} variante={usr.ativo ? "sucesso" : "erro"} />
            </div>
            <div className="cartao-usuario__acoes">
              {podeEditar(tipo, "usuarios") && (
                <button
                  className={`botao botao--pequeno ${usr.ativo ? "botao--perigo" : "botao--sucesso"}`}
                  onClick={() => alternarAtivo(usr.id)}
                  type="button"
                  aria-label={`${usr.ativo ? "Desativar" : "Ativar"} usuário ${usr.nome}`}
                >
                  {usr.ativo ? "Desativar" : "Ativar"}
                </button>
              )}
              {podeEditar(tipo, "usuarios") && (
                <button
                  className="botao botao--fantasma botao--pequeno"
                  onClick={() => setUsuarioEditando(usr)}
                  type="button"
                  aria-label={`Editar usuário ${usr.nome}`}
                >
                  Editar
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {usuariosFiltrados.length === 0 && (
        <p className="texto-vazio texto-vazio--central" role="status">
          Nenhum usuário encontrado.
        </p>
      )}

      {usuarioEditando && (
        <ModalEdicaoUsuario
          usuario={usuarioEditando}
          onSalvar={salvarEdicao}
          onFechar={() => setUsuarioEditando(null)}
        />
      )}

      {modalAberto && (
        <Modal titulo="Novo Usuário" onFechar={() => setModalAberto(false)}>
          <form
            className="formulario-modal"
            onSubmit={(e) => {
              e.preventDefault();
              const f = e.target;
              setLista((prev) => [...prev, {
                id: Date.now(),
                nome: f["nome-usr"].value,
                email: f["email-usr"].value,
                tipo: f["tipo-usr"].value,
                ativo: true,
                dataCadastro: new Date().toISOString().slice(0, 10),
              }]);
              setModalAberto(false);
            }}
          >
            <div className="campo">
              <label className="campo__rotulo" htmlFor="nome-usr">Nome completo *</label>
              <input id="nome-usr" className="campo__entrada" type="text" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="email-usr">E-mail *</label>
              <input id="email-usr" className="campo__entrada" type="email" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="tipo-usr">Tipo *</label>
              <select id="tipo-usr" className="campo__entrada" required>
                <option value="">Selecione o tipo</option>
                <option value="Aluno">Aluno</option>
                <option value="Professor">Professor</option>
                <option value="Coordenador">Coordenador</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="telefone-usr">Telefone</label>
              <input id="telefone-usr" className="campo__entrada" type="tel" placeholder="(11) 99999-9999" />
            </div>
            <div className="modal-rodape">
              <button type="button" className="botao botao--fantasma" onClick={() => setModalAberto(false)}>Cancelar</button>
              <button type="submit" className="botao botao--primario">Criar Usuário</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
