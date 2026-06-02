import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TbMail, TbPhone, TbMapPin, TbUser, TbEdit, TbLock, TbX, TbCheck, TbRefresh, TbUserCircle, TbSettings, TbSun, TbMoon, TbArrowLeft, TbUserFilled } from "react-icons/tb";
import { MdSave } from "react-icons/md";
import Botao from "@/componentes/Botao.jsx";
import { resetar } from "@/dados/db.js";
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

export default function TelaPerfilUsuario({ usuario, onToast }) {
  const navigate = useNavigate();
  const { state: navState } = useLocation();
  const [aba, setAba] = useState(navState?.aba ?? "informacoes");
  const [editando, setEditando] = useState(false);
  const [temaClaro, setTemaClaro] = useState(
    () => localStorage.getItem("coderyse-tema") === "claro"
  );

  useEffect(() => {
    document.documentElement.dataset.tema = temaClaro ? "claro" : "escuro";
    localStorage.setItem("coderyse-tema", temaClaro ? "claro" : "escuro");
  }, [temaClaro]);
  const [confirmandoReset, setConfirmandoReset] = useState(false);
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
        <button
          type="button"
          className="cadastro-voltar"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
        >
          <TbArrowLeft size={18} aria-hidden="true" />
          Voltar
        </button>
        <div>
          <h1 className="cabecalho-pagina__titulo">Meu Perfil</h1>
          <p className="cabecalho-pagina__subtitulo">
            Visualize e edite suas informações pessoais.
          </p>
        </div>
      </header>

      <div className="perfil-grade">
        {/* Cartão de identidade */}
        <aside className="perfil-cartao-identidade">
          <div
            className="perfil-avatar-grande"
            style={{ "--cor-perfil": corPorTipo[usuario.tipo] ?? "#7b2ff7" }}
            aria-hidden="true"
          >
            <TbUserFilled size={48} style={{ color: "#fff" }} />
          </div>
          <h3 className="perfil-cartao-identidade__nome">{form.nome}</h3>
          <Insignia texto={usuario.tipo} variante={variantePorTipo[usuario.tipo] ?? "neutro"} style={usuario.tipo === "Admin" ? { color: "#fff" } : undefined} />

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

        {/* Painel com abas */}
        <div className="perfil-painel">
          <nav className="abas-matriculas" role="tablist" aria-label="Seções do perfil" style={{ marginBottom: "var(--espaco-lg)" }}>
            <button
              role="tab"
              aria-selected={aba === "informacoes"}
              className={`abas-matriculas__aba${aba === "informacoes" ? " abas-matriculas__aba--ativa" : ""}`}
              onClick={() => { setAba("informacoes"); setEditando(false); }}
              type="button"
            >
              <TbUserCircle size={16} aria-hidden="true" />
              Informações
            </button>
            <button
              role="tab"
              aria-selected={aba === "seguranca"}
              className={`abas-matriculas__aba${aba === "seguranca" ? " abas-matriculas__aba--ativa" : ""}`}
              onClick={() => setAba("seguranca")}
              type="button"
            >
              <TbSettings size={16} aria-hidden="true" />
              Configurações
            </button>
          </nav>

          {aba === "informacoes" && (
            <section className="painel-secao" aria-labelledby="titulo-info-pessoal">
              <header className="painel-secao__cabecalho">
                <h3 className="painel-secao__titulo" id="titulo-info-pessoal">
                  Informações pessoais
                </h3>
                {!editando && (
                  <motion.button
                    type="button"
                    onClick={() => setEditando(true)}
                    aria-label="Editar perfil"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--cor-texto-mudo)", display: "flex", alignItems: "center", padding: "4px" }}
                    data-tooltip="Editar perfil"
                    whileHover={{ scale: 1.2, rotate: -15, color: "var(--cor-marca-clara)" }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  >
                    <TbEdit size={18} aria-hidden="true" />
                  </motion.button>
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
                      <Botao variante="perigo" type="button" onClick={cancelar} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <TbX size={15} aria-hidden="true" /> Cancelar
                      </Botao>
                      <Botao variante="primario" type="submit" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <MdSave size={15} aria-hidden="true" /> Salvar alterações
                      </Botao>
                    </footer>
                  )}
                </form>
              </div>
            </section>
          )}

          {aba === "seguranca" && (
            <section className="painel-secao" aria-labelledby="titulo-seguranca">
              <header className="painel-secao__cabecalho">
                <h3 className="painel-secao__titulo" id="titulo-seguranca">
                  Configurações
                </h3>
              </header>
              <div className="painel-secao__conteudo">
                <div className="perfil-seguranca-item">
                  <div className="perfil-seguranca-item__info">
                    {temaClaro ? <TbSun size={24} aria-hidden="true" /> : <TbMoon size={24} aria-hidden="true" />}
                    <div>
                      <strong>Aparência</strong>
                      <p>{temaClaro ? "Tema claro ativado" : "Tema escuro ativado"}</p>
                    </div>
                  </div>
                  <button
                    role="switch"
                    aria-checked={temaClaro}
                    className={`switch-tema${temaClaro ? " switch-tema--claro" : ""}`}
                    onClick={() => setTemaClaro((v) => !v)}
                    aria-label={temaClaro ? "Ativar tema escuro" : "Ativar tema claro"}
                    type="button"
                  >
                    <TbMoon size={12} className="switch-tema__lua" aria-hidden="true" />
                    <span className="switch-tema__thumb" aria-hidden="true" />
                    <TbSun size={12} className="switch-tema__sol" aria-hidden="true" />
                  </button>
                </div>
                <div className="perfil-seguranca-item">
                  <div className="perfil-seguranca-item__info">
                    <TbLock size={24} aria-hidden="true" />
                    <div>
                      <strong>Senha</strong>
                      <p>Última alteração: nunca</p>
                    </div>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => onToast?.("Funcionalidade disponível em breve.", "info")}
                    aria-label="Alterar senha"
                    data-tooltip="Alterar senha"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--cor-texto-mudo)", display: "flex", alignItems: "center", padding: "4px" }}
                    whileHover={{ scale: 1.2, rotate: -15, color: "var(--cor-marca-clara)" }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  >
                    <TbEdit size={18} aria-hidden="true" />
                  </motion.button>
                </div>

                <div className="perfil-seguranca-item">
                  <div className="perfil-seguranca-item__info">
                    <TbRefresh size={24} aria-hidden="true" />
                    <div>
                      <strong>Resetar dados</strong>
                      <p>Restaura todos os dados de teste ao estado inicial</p>
                    </div>
                  </div>
                  {!confirmandoReset ? (
                    <Botao variante="perigo" tamanho="pequeno" onClick={() => setConfirmandoReset(true)}>
                      <TbRefresh size={14} aria-hidden="true" /> Reset
                    </Botao>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--cor-texto-suave)" }}>Confirmar?</span>
                      <Botao variante="perigo" tamanho="pequeno" onClick={() => { resetar(); window.location.reload(); }}>
                        <TbCheck size={14} aria-hidden="true" /> Sim
                      </Botao>
                      <Botao variante="secundario" tamanho="pequeno" onClick={() => setConfirmandoReset(false)}>
                        <TbX size={14} aria-hidden="true" /> Não
                      </Botao>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
