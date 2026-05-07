import { useState } from "react";
import Modal from "./Modal.jsx";

export default function ModalEdicaoUsuario({ usuario, onSalvar, onFechar }) {
  const [formulario, setFormulario] = useState({
    nome: usuario.nome || "",
    email: usuario.email || "",
    telefone: usuario.telefone || "",
    cidade: usuario.cidade || "",
    estado: usuario.estado || "",
    ativo: usuario.ativo ?? true,
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSalvar({ ...usuario, ...formulario });
    onFechar();
  }

  return (
    <Modal titulo={`Editar — ${usuario.nome}`} onFechar={onFechar}>
      <form className="formulario-modal" onSubmit={handleSubmit}>

        <div className="modal-edicao__avatar" aria-hidden="true">
          {usuario.nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
        </div>

        <div className="campo">
          <label className="campo__rotulo" htmlFor="edit-nome">Nome completo *</label>
          <input
            id="edit-nome"
            name="nome"
            className="campo__entrada"
            type="text"
            value={formulario.nome}
            onChange={handleChange}
            required
          />
        </div>

        <div className="campo">
          <label className="campo__rotulo" htmlFor="edit-email">E-mail *</label>
          <input
            id="edit-email"
            name="email"
            className="campo__entrada"
            type="email"
            value={formulario.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="campo">
          <label className="campo__rotulo" htmlFor="edit-telefone">Telefone</label>
          <input
            id="edit-telefone"
            name="telefone"
            className="campo__entrada"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formulario.telefone}
            onChange={handleChange}
          />
        </div>

        <div className="grade-2">
          <div className="campo">
            <label className="campo__rotulo" htmlFor="edit-cidade">Cidade</label>
            <input
              id="edit-cidade"
              name="cidade"
              className="campo__entrada"
              type="text"
              value={formulario.cidade}
              onChange={handleChange}
            />
          </div>
          <div className="campo">
            <label className="campo__rotulo" htmlFor="edit-estado">Estado</label>
            <input
              id="edit-estado"
              name="estado"
              className="campo__entrada"
              type="text"
              maxLength={2}
              placeholder="SP"
              value={formulario.estado}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="campo campo--inline">
          <input
            id="edit-ativo"
            name="ativo"
            type="checkbox"
            checked={formulario.ativo}
            onChange={handleChange}
            className="campo__checkbox"
          />
          <label htmlFor="edit-ativo" className="campo__rotulo campo__rotulo--inline">
            Usuário ativo
          </label>
        </div>

        <div className="modal-rodape">
          <button type="button" className="botao botao--fantasma" onClick={onFechar}>
            Cancelar
          </button>
          <button type="submit" className="botao botao--primario">
            Salvar alterações
          </button>
        </div>
      </form>
    </Modal>
  );
}
