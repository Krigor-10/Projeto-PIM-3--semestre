import { useState } from "react";
import { TbMail, TbPhone, TbMapPin, TbUser, TbEdit, TbLock } from "react-icons/tb";
import Botao from "@/componentes/Botao.jsx";
import Insignia from "@/componentes/Insignia.jsx";

const corPorTipo = {
  Aluno:       "#7b2ff7",
  Professor:   "#3b82f6",
  Coordenador: "#f59e0b",
  Admin:       "#ef4444",
};

const variantePorTipo = {
  Aluno:       "marca",
  Professor:   "info",
  Coordenador: "aviso",
  Admin:       "erro",
};

function gerarIniciais(nome) {
  return nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export default function TelaPerfilUsuario({ usuario, onToast }) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nome:     usuario.nome     ?? "",
    email:    usuario.email    ?? "",
    telefone: usuario.telefone ?? "",
    cidade:   usuario.cidade   ?? "",
    estado:   usuario.estado   ?? "",
  });

  function alterarCampo(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function salvar(e) {
    e.preventDefault();
    setEditando(false);
    onToast?.("Perfil atualizado com sucesso.", "sucesso");
  }

  function cancelar() {
    setForm({
      nome:     usuario.nome     ?? "",
      email:    usuario.email    ?? "",
      telefone: usuario.telefone ?? "",
      cidade:   usuario.cidade   ?? "",
      estado:   usuario.estado   ?? "",
    });
    setEditando(false);
  }

  return (
    <div className="tela-perfil">
      <header className="cabecalho-pagina">
        <div>
          <h1 className="cabecalho-pagina__titulo">Meu Perfil</h1>
          <p className="cabecalho-pagina__subtitulo">
            Visualize e edite suas informações pessoais.
          </p>
        </div>
        <Insignia texto={usuario.tipo} variante={variantePorTipo[usuario.tipo] ?? "neutro"} />
      </header>

      <div className="perfil-grade">
        {/* Cartão de identidade */}
        <aside className="perfil-cartao-identidade">
          <div
            className="perfil-avatar-grande"
            style={{ "--cor-perfil": corPorTipo[usuario.tipo] ?? "#7b2ff7" }}
            aria-hidden="true"
          >
            {gerarIniciais(form.nome)}
          </div>
          <h3 className="perfil-cartao-identidade__nome">{form.nome}</h3>
          <Insignia texto={usuario.tipo} variante={variantePorTipo[usuario.tipo] ?? "neutro"} />

          <dl className="perfil-cartao-identidade__dados">
            {form.email && (
              <div className="perfil-dado">
                <dt><TbMail size={14} aria-hidden="true" /> E-mail</dt>
                <dd>{form.email}</dd>
              </div>
            )}
            {form.telefone && (
              <div className="perfil-dado">
                <dt><TbPhone size={14} aria-hidden="true" /> Telefone</dt>
                <dd>{form.telefone}</dd>
              </div>
            )}
            {form.cidade && (
              <div className="perfil-dado">
                <dt><TbMapPin size={14} aria-hidden="true" /> Localização</dt>
                <dd>{form.cidade}{form.estado ? `, ${form.estado}` : ""}</dd>
              </div>
            )}
            {usuario.codigoAluno && (
              <div className="perfil-dado">
                <dt><TbUser size={14} aria-hidden="true" /> Código</dt>
                <dd>{usuario.codigoAluno}</dd>
              </div>
            )}
          </dl>
        </aside>

        {/* Painel de edição */}
        <div className="perfil-painel">
          <section className="painel-secao" aria-labelledby="titulo-info-pessoal">
            <header className="painel-secao__cabecalho">
              <h3 className="painel-secao__titulo" id="titulo-info-pessoal">
                Informações pessoais
              </h3>
              {!editando && (
                <Botao
                  variante="fantasma"
                  tamanho="pequeno"
                  onClick={() => setEditando(true)}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <TbEdit size={15} aria-hidden="true" />
                  Editar
                </Botao>
              )}
            </header>
            <div className="painel-secao__conteudo">
              <form onSubmit={salvar} className="formulario-perfil">
                <div className="formulario-perfil__grade">
                  <div className="campo formulario-perfil__campo--largo">
                    <label className="campo__rotulo" htmlFor="perfil-nome">Nome completo</label>
                    <input
                      id="perfil-nome"
                      name="nome"
                      className="campo__entrada"
                      type="text"
                      value={form.nome}
                      onChange={alterarCampo}
                      disabled={!editando}
                      required
                    />
                  </div>
                  <div className="campo formulario-perfil__campo--largo">
                    <label className="campo__rotulo" htmlFor="perfil-email">E-mail</label>
                    <input
                      id="perfil-email"
                      name="email"
                      className="campo__entrada"
                      type="email"
                      value={form.email}
                      onChange={alterarCampo}
                      disabled={!editando}
                      required
                    />
                  </div>
                  <div className="campo">
                    <label className="campo__rotulo" htmlFor="perfil-telefone">Telefone</label>
                    <input
                      id="perfil-telefone"
                      name="telefone"
                      className="campo__entrada"
                      type="tel"
                      value={form.telefone}
                      onChange={alterarCampo}
                      disabled={!editando}
                    />
                  </div>
                  <div className="campo">
                    <label className="campo__rotulo" htmlFor="perfil-cidade">Cidade</label>
                    <input
                      id="perfil-cidade"
                      name="cidade"
                      className="campo__entrada"
                      type="text"
                      value={form.cidade}
                      onChange={alterarCampo}
                      disabled={!editando}
                    />
                  </div>
                  <div className="campo">
                    <label className="campo__rotulo" htmlFor="perfil-estado">Estado (UF)</label>
                    <input
                      id="perfil-estado"
                      name="estado"
                      className="campo__entrada"
                      type="text"
                      value={form.estado}
                      onChange={alterarCampo}
                      disabled={!editando}
                      maxLength={2}
                      style={{ textTransform: "uppercase" }}
                    />
                  </div>
                  {usuario.codigoAluno && (
                    <div className="campo">
                      <label className="campo__rotulo" htmlFor="perfil-codigo">Código do aluno</label>
                      <input
                        id="perfil-codigo"
                        className="campo__entrada"
                        type="text"
                        value={usuario.codigoAluno}
                        disabled
                        readOnly
                        aria-label="Código do aluno — somente leitura"
                      />
                    </div>
                  )}
                </div>

                {editando && (
                  <footer className="formulario-perfil__rodape">
                    <Botao variante="perigo" type="button" onClick={cancelar}>
                      Cancelar
                    </Botao>
                    <Botao variante="primario" type="submit">
                      Salvar alterações
                    </Botao>
                  </footer>
                )}
              </form>
            </div>
          </section>

          <section className="painel-secao" aria-labelledby="titulo-seguranca" style={{ marginTop: "var(--espaco-lg)" }}>
            <header className="painel-secao__cabecalho">
              <h3 className="painel-secao__titulo" id="titulo-seguranca">
                Segurança
              </h3>
            </header>
            <div className="painel-secao__conteudo">
              <div className="perfil-seguranca-item">
                <div className="perfil-seguranca-item__info">
                  <TbLock size={18} aria-hidden="true" />
                  <div>
                    <strong>Senha</strong>
                    <p>Última alteração: nunca</p>
                  </div>
                </div>
                <Botao
                  variante="fantasma"
                  tamanho="pequeno"
                  onClick={() => onToast?.("Funcionalidade disponível em breve.", "info")}
                >
                  Alterar senha
                </Botao>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
