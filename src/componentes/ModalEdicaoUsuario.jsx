import { useState } from "react";
import Modal from "./Modal.jsx";

export default function ModalEdicaoUsuario({ usuario, onSalvar, onFechar }) {
  /* Inicializa o formulário com os dados atuais do usuário recebido por prop */
  const [formulario, setFormulario] = useState({
    nome: usuario.nome || "",
    email: usuario.email || "",
    telefone: usuario.telefone || "",
    cidade: usuario.cidade || "",
    estado: usuario.estado || "",
    ativo: usuario.ativo ?? true,
  });

  /* Atualiza campo genérico — trata checkbox separadamente pelo atributo checked */
  function atualizarCampo(evento) {
    const { name, value, type, checked } = evento.target;
    setFormulario((anterior) => ({
      ...anterior,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function salvarEdicao(evento) {
    evento.preventDefault();
    /* Spread mescla os dados originais do usuário com as alterações do formulário */
    onSalvar({ ...usuario, ...formulario });
    onFechar();
  }

  return (
    <Modal titulo={`Editar — ${usuario.nome}`} onFechar={onFechar}>
      <form className="formulario-modal" onSubmit={salvarEdicao} noValidate>

        {/* Avatar textual com iniciais — decorativo, oculto para leitores de tela */}
        <div className="modal-edicao__avatar" aria-hidden="true">
          {usuario.nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
        </div>

        <fieldset className="formulario-modal__grupo">
          <legend className="visualmente-oculto">Dados pessoais</legend>

          <div className="campo">
            <label className="campo__rotulo" htmlFor="edit-nome">Nome completo *</label>
            <input
              id="edit-nome"
              name="nome"
              className="campo__entrada"
              type="text"
              autoComplete="name"
              value={formulario.nome}
              onChange={atualizarCampo}
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
              autoComplete="email"
              value={formulario.email}
              onChange={atualizarCampo}
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
              inputMode="numeric"
              placeholder="(11) 99999-9999"
              autoComplete="tel"
              value={formulario.telefone}
              onChange={atualizarCampo}
            />
          </div>
        </fieldset>

        <fieldset className="formulario-modal__grupo">
          <legend className="visualmente-oculto">Localização</legend>

          <div className="grade-2">
            <div className="campo">
              <label className="campo__rotulo" htmlFor="edit-cidade">Cidade</label>
              <input
                id="edit-cidade"
                name="cidade"
                className="campo__entrada"
                type="text"
                autoComplete="address-level2"
                value={formulario.cidade}
                onChange={atualizarCampo}
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
                autoComplete="address-level1"
                value={formulario.estado}
                onChange={atualizarCampo}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="formulario-modal__grupo">
          <legend className="visualmente-oculto">Status da conta</legend>

          <div className="campo campo--inline">
            <input
              id="edit-ativo"
              name="ativo"
              type="checkbox"
              checked={formulario.ativo}
              onChange={atualizarCampo}
              className="campo__checkbox"
            />
            <label htmlFor="edit-ativo" className="campo__rotulo campo__rotulo--inline">
              Usuário ativo
            </label>
          </div>
        </fieldset>

        <footer className="modal-rodape">
          <button type="button" className="botao botao--fantasma" onClick={onFechar}>
            Cancelar
          </button>
          <button type="submit" className="botao botao--primario">
            Salvar alterações
          </button>
        </footer>
      </form>
    </Modal>
  );
}
