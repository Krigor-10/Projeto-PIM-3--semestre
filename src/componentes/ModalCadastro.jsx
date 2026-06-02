import { useState, useEffect } from "react";
import { TbX, TbChevronLeft, TbChevronRight, TbCheck } from "react-icons/tb";
import { MdSend } from "react-icons/md";
import Modal from "@/componentes/Modal.jsx";
import Botao from "@/componentes/Botao.jsx";
import SelectSimples from "@/componentes/SelectSimples.jsx";
import { cursos } from "@/dados/dadosMock.js";

const cursosAtivos = cursos.filter((c) => c.ativo);

function mascararCpf(v) {
  return v.replace(/\D/g,"").slice(0,11)
    .replace(/(\d{3})(\d)/,"$1.$2")
    .replace(/(\d{3})(\d)/,"$1.$2")
    .replace(/(\d{3})(\d{1,2})$/,"$1-$2");
}
function mascararTelefone(v) {
  return v.replace(/\D/g,"").slice(0,11)
    .replace(/(\d{2})(\d)/,"($1) $2")
    .replace(/(\d{5})(\d{1,4})$/,"$1-$2");
}
function mascararCep(v) {
  return v.replace(/\D/g,"").slice(0,8)
    .replace(/(\d{5})(\d{1,3})$/,"$1-$2");
}

const estadosBR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
  "SP","SE","TO",
];

function formVazio(cursoIdInicial = "") {
  return {
    nome: "", sobrenome: "", email: "", cpf: "", telefone: "", cursoId: cursoIdInicial,
    cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "",
    senha: "", confirmarSenha: "",
  };
}

const ABAS = ["Dados Pessoais", "Endereço", "Senha", "Confirmação"];

export default function ModalCadastro({ aberto, onFechar, cursoIdInicial = "" }) {
  const [aba, setAba]         = useState(0);
  const [maxAba, setMaxAba]   = useState(0);
  const [form, setForm]       = useState(() => formVazio(cursoIdInicial));
  const [erros, setErros]     = useState({});
  const [enviado, setEnviado] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  useEffect(() => {
    if (aberto) {
      setAba(0); setMaxAba(0);
      setForm(formVazio(cursoIdInicial));
      setErros({}); setEnviado(false);
    }
  }, [aberto, cursoIdInicial]);

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: "" }));
  }

  async function buscarCep(cepBruto) {
    const cep = cepBruto.replace(/\D/g,"");
    if (cep.length !== 8) return;
    setBuscandoCep(true);
    try {
      const res   = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const dados = await res.json();
      if (!dados.erro) {
        setForm((f) => ({
          ...f,
          rua:    dados.logradouro || f.rua,
          bairro: dados.bairro     || f.bairro,
          cidade: dados.localidade || f.cidade,
          estado: dados.uf         || f.estado,
        }));
      }
    } catch { /* falha silenciosa */ }
    finally { setBuscandoCep(false); }
  }

  function validarAba0() {
    const e = {};
    if (!form.nome.trim())                           e.nome      = "Informe o nome.";
    if (!form.sobrenome.trim())                      e.sobrenome = "Informe o sobrenome.";
    if (!form.email.includes("@"))                   e.email     = "E-mail inválido.";
    if (form.cpf.replace(/\D/g,"").length !== 11)    e.cpf       = "CPF incompleto.";
    if (form.telefone.replace(/\D/g,"").length < 10) e.telefone  = "Telefone inválido.";
    if (!form.cursoId)                               e.cursoId   = "Selecione um curso.";
    return e;
  }

  function validarAba1() {
    const e = {};
    if (form.cep.replace(/\D/g,"").length !== 8) e.cep    = "CEP incompleto.";
    if (!form.rua.trim())                         e.rua    = "Informe a rua.";
    if (!form.numero.trim())                      e.numero = "Informe o número.";
    if (!form.bairro.trim())                      e.bairro = "Informe o bairro.";
    if (!form.cidade.trim())                      e.cidade = "Informe a cidade.";
    if (!form.estado)                             e.estado = "Selecione o estado.";
    return e;
  }

  function validarAba2() {
    const e = {};
    if (form.senha.length < 8)              e.senha          = "Mínimo de 8 caracteres.";
    if (form.senha !== form.confirmarSenha) e.confirmarSenha = "As senhas não coincidem.";
    return e;
  }

  function avancar() {
    const validadores = [validarAba0, validarAba1, validarAba2];
    if (aba < validadores.length) {
      const e = validadores[aba]();
      if (Object.keys(e).length > 0) { setErros(e); return; }
    }
    setErros({});
    setMaxAba((v) => Math.max(v, aba + 1));
    setAba((v) => v + 1);
  }

  function salvar() {
    setEnviado(true);
  }

  const cursoNome = cursosAtivos.find((c) => String(c.id) === String(form.cursoId))?.titulo ?? "—";

  if (!aberto) return null;

  return (
    <Modal titulo="Criar conta" onFechar={onFechar} className="modal-caixa--largo">
      {enviado ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--espaco-lg)", padding: "var(--espaco-xl) 0", textAlign: "center" }}>
          <span style={{ width: 56, height: 56, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TbCheck size={30} color="#fff" aria-hidden="true" />
          </span>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--cor-texto-forte)" }}>Cadastro realizado!</h2>
          <p style={{ color: "var(--cor-texto-suave)", fontSize: "0.9rem" }}>
            Bem-vindo(a), <strong>{form.nome}</strong>! Seu cadastro foi registrado.<br />
            Em breve você receberá um e-mail de confirmação em <strong>{form.email}</strong>.
          </p>
          <Botao variante="primario" onClick={onFechar} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TbCheck size={18} aria-hidden="true" /> Concluir
          </Botao>
        </div>
      ) : (
        <>
          <nav className="abas-matriculas" style={{ width: "100%", justifyContent: "center", marginBottom: "var(--espaco-lg)" }}>
            {ABAS.map((label, i) => {
              const bloqueada = i > maxAba;
              return (
                <button key={i} type="button"
                  className={`abas-matriculas__aba${aba === i ? " abas-matriculas__aba--ativa" : ""}`}
                  style={bloqueada ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
                  onClick={() => { if (!bloqueada) setAba(i); }}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          <form className="formulario-modal" onSubmit={(e) => e.preventDefault()}>

            {/* Aba 0 — Dados Pessoais */}
            {aba === 0 && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--espaco-md)" }}>
                  <div className={`campo ${erros.nome ? "campo--erro" : ""}`}>
                    <label className="campo__rotulo" htmlFor="mc-nome">Nome *</label>
                    <input id="mc-nome" className="campo__entrada" type="text" autoComplete="given-name" value={form.nome} onChange={(e) => set("nome", e.target.value)} aria-invalid={!!erros.nome} />
                    {erros.nome && <span className="campo__erro" role="alert">{erros.nome}</span>}
                  </div>
                  <div className={`campo ${erros.sobrenome ? "campo--erro" : ""}`}>
                    <label className="campo__rotulo" htmlFor="mc-sobrenome">Sobrenome *</label>
                    <input id="mc-sobrenome" className="campo__entrada" type="text" autoComplete="family-name" value={form.sobrenome} onChange={(e) => set("sobrenome", e.target.value)} aria-invalid={!!erros.sobrenome} />
                    {erros.sobrenome && <span className="campo__erro" role="alert">{erros.sobrenome}</span>}
                  </div>
                </div>
                <div className={`campo ${erros.email ? "campo--erro" : ""}`}>
                  <label className="campo__rotulo" htmlFor="mc-email">E-mail *</label>
                  <input id="mc-email" className="campo__entrada" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!erros.email} />
                  {erros.email && <span className="campo__erro" role="alert">{erros.email}</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--espaco-md)" }}>
                  <div className={`campo ${erros.cpf ? "campo--erro" : ""}`}>
                    <label className="campo__rotulo" htmlFor="mc-cpf">CPF *</label>
                    <input id="mc-cpf" className="campo__entrada" type="text" inputMode="numeric" placeholder="000.000.000-00" autoComplete="off" value={form.cpf} onChange={(e) => set("cpf", mascararCpf(e.target.value))} aria-invalid={!!erros.cpf} />
                    {erros.cpf && <span className="campo__erro" role="alert">{erros.cpf}</span>}
                  </div>
                  <div className={`campo ${erros.telefone ? "campo--erro" : ""}`}>
                    <label className="campo__rotulo" htmlFor="mc-telefone">Telefone *</label>
                    <input id="mc-telefone" className="campo__entrada" type="tel" inputMode="numeric" placeholder="(00) 00000-0000" autoComplete="tel" value={form.telefone} onChange={(e) => set("telefone", mascararTelefone(e.target.value))} aria-invalid={!!erros.telefone} />
                    {erros.telefone && <span className="campo__erro" role="alert">{erros.telefone}</span>}
                  </div>
                </div>
                <div className={`campo ${erros.cursoId ? "campo--erro" : ""}`}>
                  <label className="campo__rotulo" htmlFor="mc-curso">Curso de interesse *</label>
                  <SelectSimples id="mc-curso" value={form.cursoId} opcoes={cursosAtivos.map((c) => ({ valor: c.id, rotulo: `${c.titulo} — ${c.nivel}` }))} onChange={(val) => set("cursoId", val)} placeholder="Selecione um curso" />
                  {erros.cursoId && <span className="campo__erro" role="alert">{erros.cursoId}</span>}
                </div>
              </>
            )}

            {/* Aba 1 — Endereço */}
            {aba === 1 && (
              <>
                <div className={`campo ${erros.cep ? "campo--erro" : ""}`}>
                  <label className="campo__rotulo" htmlFor="mc-cep">CEP *</label>
                  <div className="campo__linha">
                    <input id="mc-cep" className="campo__entrada" type="text" inputMode="numeric" placeholder="00000-000" value={form.cep}
                      onChange={(e) => { const m = mascararCep(e.target.value); set("cep", m); if (m.replace(/\D/g,"").length === 8) buscarCep(m); }}
                      aria-invalid={!!erros.cep} />
                    {buscandoCep && <span className="campo__indicador" aria-live="polite">Buscando...</span>}
                  </div>
                  <span className="campo__dica">Preenchimento automático do endereço.</span>
                  {erros.cep && <span className="campo__erro" role="alert">{erros.cep}</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--espaco-md)" }}>
                  <div className={`campo ${erros.rua ? "campo--erro" : ""}`}>
                    <label className="campo__rotulo" htmlFor="mc-rua">Rua *</label>
                    <input id="mc-rua" className="campo__entrada" type="text" autoComplete="street-address" value={form.rua} onChange={(e) => set("rua", e.target.value)} aria-invalid={!!erros.rua} />
                    {erros.rua && <span className="campo__erro" role="alert">{erros.rua}</span>}
                  </div>
                  <div className={`campo ${erros.numero ? "campo--erro" : ""}`}>
                    <label className="campo__rotulo" htmlFor="mc-numero">Número *</label>
                    <input id="mc-numero" className="campo__entrada" type="text" inputMode="numeric" value={form.numero} onChange={(e) => set("numero", e.target.value)} aria-invalid={!!erros.numero} />
                    {erros.numero && <span className="campo__erro" role="alert">{erros.numero}</span>}
                  </div>
                </div>
                <div className="campo">
                  <label className="campo__rotulo" htmlFor="mc-complemento">Complemento <span style={{ fontWeight: 400, color: "var(--cor-texto-mudo)" }}>(opcional)</span></label>
                  <input id="mc-complemento" className="campo__entrada" type="text" placeholder="Apto, Bloco, Sala..." autoComplete="address-line2" value={form.complemento} onChange={(e) => set("complemento", e.target.value)} />
                </div>
                <div className={`campo ${erros.bairro ? "campo--erro" : ""}`}>
                  <label className="campo__rotulo" htmlFor="mc-bairro">Bairro *</label>
                  <input id="mc-bairro" className="campo__entrada" type="text" value={form.bairro} onChange={(e) => set("bairro", e.target.value)} aria-invalid={!!erros.bairro} />
                  {erros.bairro && <span className="campo__erro" role="alert">{erros.bairro}</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--espaco-md)" }}>
                  <div className={`campo ${erros.cidade ? "campo--erro" : ""}`} style={{ gridColumn: "1 / 3" }}>
                    <label className="campo__rotulo" htmlFor="mc-cidade">Cidade *</label>
                    <input id="mc-cidade" className="campo__entrada" type="text" autoComplete="address-level2" value={form.cidade} onChange={(e) => set("cidade", e.target.value)} aria-invalid={!!erros.cidade} />
                    {erros.cidade && <span className="campo__erro" role="alert">{erros.cidade}</span>}
                  </div>
                  <div className={`campo ${erros.estado ? "campo--erro" : ""}`}>
                    <label className="campo__rotulo" htmlFor="mc-estado">Estado *</label>
                    <SelectSimples id="mc-estado" value={form.estado} opcoes={estadosBR} onChange={(val) => set("estado", val)} placeholder="UF" />
                    {erros.estado && <span className="campo__erro" role="alert">{erros.estado}</span>}
                  </div>
                </div>
              </>
            )}

            {/* Aba 2 — Senha */}
            {aba === 2 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--espaco-md)" }}>
                <div className={`campo ${erros.senha ? "campo--erro" : ""}`}>
                  <label className="campo__rotulo" htmlFor="mc-senha">Senha *</label>
                  <input id="mc-senha" className="campo__entrada" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" value={form.senha} onChange={(e) => set("senha", e.target.value)} aria-invalid={!!erros.senha} />
                  {erros.senha && <span className="campo__erro" role="alert">{erros.senha}</span>}
                </div>
                <div className={`campo ${erros.confirmarSenha ? "campo--erro" : ""}`}>
                  <label className="campo__rotulo" htmlFor="mc-confirmar">Confirmar senha *</label>
                  <input id="mc-confirmar" className="campo__entrada" type="password" autoComplete="new-password" value={form.confirmarSenha} onChange={(e) => set("confirmarSenha", e.target.value)} aria-invalid={!!erros.confirmarSenha} />
                  {erros.confirmarSenha && <span className="campo__erro" role="alert">{erros.confirmarSenha}</span>}
                </div>
              </div>
            )}

            {/* Aba 3 — Confirmação */}
            {aba === 3 && (
              <div className="lista-detalhes">
                <p style={{ fontSize: "0.85rem", color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-sm)" }}>
                  Revise seus dados antes de finalizar o cadastro.
                </p>

                <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--cor-texto-mudo)", margin: "var(--espaco-md) 0 var(--espaco-sm)" }}>Dados Pessoais</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--espaco-sm) var(--espaco-lg)" }}>
                  {[
                    ["Nome",     `${form.nome} ${form.sobrenome}`],
                    ["E-mail",   form.email],
                    ["CPF",      form.cpf],
                    ["Telefone", form.telefone],
                    ["Curso",    cursoNome],
                  ].map(([rotulo, valor]) => (
                    <div key={rotulo} className="lista-detalhes__item" style={{ border: "none", paddingBottom: 0 }}>
                      <dt>{rotulo}</dt>
                      <dd>{valor || "—"}</dd>
                    </div>
                  ))}
                </div>

                <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--cor-texto-mudo)", margin: "var(--espaco-md) 0 var(--espaco-sm)" }}>Endereço</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--espaco-sm) var(--espaco-lg)" }}>
                  {[
                    ["CEP",          form.cep],
                    ["Rua",          form.rua],
                    ["Número",       form.numero],
                    ["Complemento",  form.complemento || "(não informado)"],
                    ["Bairro",       form.bairro],
                    ["Cidade / UF",  `${form.cidade}${form.estado ? ` — ${form.estado}` : ""}`],
                  ].map(([rotulo, valor]) => (
                    <div key={rotulo} className="lista-detalhes__item" style={{ border: "none", paddingBottom: 0 }}>
                      <dt>{rotulo}</dt>
                      <dd>{valor || "—"}</dd>
                    </div>
                  ))}
                </div>

                <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--cor-texto-mudo)", margin: "var(--espaco-md) 0 var(--espaco-sm)" }}>Senha</p>
                <div className="lista-detalhes__item" style={{ border: "none", paddingBottom: 0 }}>
                  <dt>Senha</dt>
                  <dd>{"•".repeat(form.senha.length)}</dd>
                </div>
              </div>
            )}

            <div className="modal-rodape" style={{ marginTop: "var(--espaco-lg)" }}>
              <Botao variante="perigo" type="button" onClick={onFechar} style={{ display: "flex", alignItems: "center", gap: "8px", marginRight: "auto" }}>
                <TbX size={16} aria-hidden="true" /> Cancelar
              </Botao>
              <div style={{ display: "flex", gap: "var(--espaco-sm)" }}>
                {aba > 0 && (
                  <Botao variante="secundario" type="button" onClick={() => setAba((v) => v - 1)} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <TbChevronLeft size={16} aria-hidden="true" /> Anterior
                  </Botao>
                )}
                {aba < 3 ? (
                  <Botao variante="primario" type="button" onClick={avancar} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    Próximo <TbChevronRight size={16} aria-hidden="true" />
                  </Botao>
                ) : (
                  <Botao variante="primario" type="button" onClick={salvar} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <MdSend size={18} aria-hidden="true" /> Salvar Cadastro
                  </Botao>
                )}
              </div>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
