import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Botao from "@/componentes/Botao.jsx";
import { cursos } from "@/dados/dadosMock.js";
import { ROTAS } from "@/rotas.js";

/* Apenas cursos ativos aparecem na seleção */
const cursosAtivos = cursos.filter((c) => c.ativo);

/* Máscara simples aplicada ao digitar */
function mascararCpf(valor) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function mascararTelefone(valor) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

function mascararCep(valor) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, "$1-$2");
}

const estadosBR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
  "SP","SE","TO",
];

function campoVazio() {
  return {
    nome: "", sobrenome: "", email: "", cpf: "", telefone: "",
    cep: "", rua: "", numero: "", bairro: "", cidade: "", estado: "",
    senha: "", confirmarSenha: "", cursoId: "",
  };
}

export default function TelaCadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState(campoVazio);
  const [erros, setErros] = useState({});
  const [enviado, setEnviado] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  /* Atualiza campo genérico */
  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: "" }));
  }

  /* Busca endereço pelo CEP usando a API pública ViaCEP */
  async function buscarCep(cepBruto) {
    const cep = cepBruto.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const dados = await res.json();
      if (!dados.erro) {
        setForm((f) => ({
          ...f,
          rua: dados.logradouro || f.rua,
          bairro: dados.bairro || f.bairro,
          cidade: dados.localidade || f.cidade,
          estado: dados.uf || f.estado,
        }));
      }
    } catch {
      /* falha silenciosa — usuário preenche manualmente */
    } finally {
      setBuscandoCep(false);
    }
  }

  /* Validação básica dos campos obrigatórios */
  function validar() {
    const e = {};
    if (!form.nome.trim())          e.nome = "Informe o nome.";
    if (!form.sobrenome.trim())     e.sobrenome = "Informe o sobrenome.";
    if (!form.email.includes("@")) e.email = "E-mail inválido.";
    if (form.cpf.replace(/\D/g,"").length !== 11) e.cpf = "CPF incompleto.";
    if (form.telefone.replace(/\D/g,"").length < 10) e.telefone = "Telefone inválido.";
    if (form.cep.replace(/\D/g,"").length !== 8) e.cep = "CEP incompleto.";
    if (!form.rua.trim())           e.rua = "Informe a rua.";
    if (!form.numero.trim())        e.numero = "Informe o número.";
    if (!form.bairro.trim())        e.bairro = "Informe o bairro.";
    if (!form.cidade.trim())        e.cidade = "Informe a cidade.";
    if (!form.estado)               e.estado = "Selecione o estado.";
    if (form.senha.length < 8)      e.senha = "Mínimo de 8 caracteres.";
    if (form.senha !== form.confirmarSenha) e.confirmarSenha = "As senhas não coincidem.";
    if (!form.cursoId)              e.cursoId = "Selecione um curso.";
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errosEncontrados = validar();
    if (Object.keys(errosEncontrados).length > 0) {
      setErros(errosEncontrados);
      /* Rola até o primeiro erro */
      const primeiroErro = document.querySelector(".campo--erro .campo__entrada");
      primeiroErro?.focus();
      return;
    }
    /* Protótipo: simula cadastro com sucesso */
    setEnviado(true);
  }

  /* Tela de confirmação após envio */
  if (enviado) {
    return (
      <div className="tela-cadastro tela-cadastro--confirmacao">
        <div className="cadastro-confirmacao">
          <span className="cadastro-confirmacao__icone" aria-hidden="true">✓</span>
          <h1 className="cadastro-confirmacao__titulo">Cadastro realizado!</h1>
          <p className="cadastro-confirmacao__texto">
            Bem-vindo(a), <strong>{form.nome}</strong>! Seu cadastro foi registrado com sucesso.
            Em breve você receberá um e-mail de confirmação em <strong>{form.email}</strong>.
          </p>
          <div className="cadastro-confirmacao__acoes">
            <Botao
              variante="primario"
              tamanho="grande"
              onClick={() => navigate(ROTAS.LOGIN)}
            >
              Acessar a plataforma
            </Botao>
            <Botao
              variante="fantasma"
              onClick={() => navigate(ROTAS.INICIO)}
            >
              Voltar à página inicial
            </Botao>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tela-cadastro">
      <a href="#formulario-cadastro" className="pular-para-conteudo">
        Pular para o formulário
      </a>

      {/* Cabeçalho */}
      <header className="cadastro-cabecalho" role="banner">
        <div className="cadastro-cabecalho__inner">
          <a href="#" className="cabecalho-publico__logo" onClick={() => navigate(ROTAS.INICIO)} aria-label="CodeRyse Academy — página inicial">
            <span className="cabecalho-publico__logo-marca" aria-hidden="true">
              <span>Code</span><span>Ryse</span>
            </span>
            <span className="cabecalho-publico__logo-subtitulo">Academy</span>
          </a>
          <p className="cadastro-cabecalho__legenda">
            Já tem uma conta?{" "}
            <button className="link-botao" onClick={() => navigate(ROTAS.LOGIN)} type="button">
              Entrar
            </button>
          </p>
        </div>
      </header>

      <main className="cadastro-principal" id="formulario-cadastro">
        <div className="cadastro-container">
          <header className="cadastro-intro">
            <h1 className="cadastro-intro__titulo">Crie sua conta</h1>
            <p className="cadastro-intro__subtitulo">
              Preencha os dados abaixo para solicitar sua matrícula.
            </p>
          </header>

          <form
            className="formulario-cadastro"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Formulário de cadastro"
          >

            {/* Dados pessoais */}
            <fieldset className="formulario-cadastro__grupo">
              <legend className="formulario-cadastro__legenda">Dados pessoais</legend>

              <div className="grade-2">
                <div className={`campo ${erros.nome ? "campo--erro" : ""}`}>
                  <label className="campo__rotulo" htmlFor="cad-nome">Nome *</label>
                  <input
                    id="cad-nome"
                    className="campo__entrada"
                    type="text"
                    autoComplete="given-name"
                    value={form.nome}
                    onChange={(e) => set("nome", e.target.value)}
                    aria-describedby={erros.nome ? "erro-nome" : undefined}
                    aria-invalid={!!erros.nome}
                  />
                  {erros.nome && <span id="erro-nome" className="campo__erro" role="alert">{erros.nome}</span>}
                </div>

                <div className={`campo ${erros.sobrenome ? "campo--erro" : ""}`}>
                  <label className="campo__rotulo" htmlFor="cad-sobrenome">Sobrenome *</label>
                  <input
                    id="cad-sobrenome"
                    className="campo__entrada"
                    type="text"
                    autoComplete="family-name"
                    value={form.sobrenome}
                    onChange={(e) => set("sobrenome", e.target.value)}
                    aria-describedby={erros.sobrenome ? "erro-sobrenome" : undefined}
                    aria-invalid={!!erros.sobrenome}
                  />
                  {erros.sobrenome && <span id="erro-sobrenome" className="campo__erro" role="alert">{erros.sobrenome}</span>}
                </div>
              </div>

              <div className={`campo ${erros.email ? "campo--erro" : ""}`}>
                <label className="campo__rotulo" htmlFor="cad-email">E-mail *</label>
                <input
                  id="cad-email"
                  className="campo__entrada"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  aria-describedby={erros.email ? "erro-email" : undefined}
                  aria-invalid={!!erros.email}
                />
                {erros.email && <span id="erro-email" className="campo__erro" role="alert">{erros.email}</span>}
              </div>

              <div className="grade-2">
                <div className={`campo ${erros.cpf ? "campo--erro" : ""}`}>
                  <label className="campo__rotulo" htmlFor="cad-cpf">CPF *</label>
                  <input
                    id="cad-cpf"
                    className="campo__entrada"
                    type="text"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    autoComplete="off"
                    value={form.cpf}
                    onChange={(e) => set("cpf", mascararCpf(e.target.value))}
                    aria-describedby={erros.cpf ? "erro-cpf" : undefined}
                    aria-invalid={!!erros.cpf}
                  />
                  {erros.cpf && <span id="erro-cpf" className="campo__erro" role="alert">{erros.cpf}</span>}
                </div>

                <div className={`campo ${erros.telefone ? "campo--erro" : ""}`}>
                  <label className="campo__rotulo" htmlFor="cad-telefone">Telefone *</label>
                  <input
                    id="cad-telefone"
                    className="campo__entrada"
                    type="tel"
                    inputMode="numeric"
                    placeholder="(00) 00000-0000"
                    autoComplete="tel"
                    value={form.telefone}
                    onChange={(e) => set("telefone", mascararTelefone(e.target.value))}
                    aria-describedby={erros.telefone ? "erro-telefone" : undefined}
                    aria-invalid={!!erros.telefone}
                  />
                  {erros.telefone && <span id="erro-telefone" className="campo__erro" role="alert">{erros.telefone}</span>}
                </div>
              </div>
            </fieldset>

            {/* Endereço */}
            <fieldset className="formulario-cadastro__grupo">
              <legend className="formulario-cadastro__legenda">Endereço</legend>

              <div className={`campo ${erros.cep ? "campo--erro" : ""}`}>
                <label className="campo__rotulo" htmlFor="cad-cep">CEP *</label>
                <div className="campo__linha">
                  <input
                    id="cad-cep"
                    className="campo__entrada"
                    type="text"
                    inputMode="numeric"
                    placeholder="00000-000"
                    value={form.cep}
                    onChange={(e) => {
                      const mascarado = mascararCep(e.target.value);
                      set("cep", mascarado);
                      if (mascarado.replace(/\D/g,"").length === 8) buscarCep(mascarado);
                    }}
                    aria-describedby={erros.cep ? "erro-cep" : "cep-dica"}
                    aria-invalid={!!erros.cep}
                  />
                  {buscandoCep && (
                    <span className="campo__indicador" aria-live="polite">Buscando...</span>
                  )}
                </div>
                <span id="cep-dica" className="campo__dica">Preenchimento automático do endereço.</span>
                {erros.cep && <span id="erro-cep" className="campo__erro" role="alert">{erros.cep}</span>}
              </div>

              <div className="grade-endereco">
                <div className={`campo ${erros.rua ? "campo--erro" : ""}`}>
                  <label className="campo__rotulo" htmlFor="cad-rua">Rua *</label>
                  <input
                    id="cad-rua"
                    className="campo__entrada"
                    type="text"
                    autoComplete="street-address"
                    value={form.rua}
                    onChange={(e) => set("rua", e.target.value)}
                    aria-invalid={!!erros.rua}
                  />
                  {erros.rua && <span className="campo__erro" role="alert">{erros.rua}</span>}
                </div>

                <div className={`campo campo--numero ${erros.numero ? "campo--erro" : ""}`}>
                  <label className="campo__rotulo" htmlFor="cad-numero">Número *</label>
                  <input
                    id="cad-numero"
                    className="campo__entrada"
                    type="text"
                    inputMode="numeric"
                    value={form.numero}
                    onChange={(e) => set("numero", e.target.value)}
                    aria-invalid={!!erros.numero}
                  />
                  {erros.numero && <span className="campo__erro" role="alert">{erros.numero}</span>}
                </div>
              </div>

              <div className="grade-3">
                <div className={`campo ${erros.bairro ? "campo--erro" : ""}`}>
                  <label className="campo__rotulo" htmlFor="cad-bairro">Bairro *</label>
                  <input
                    id="cad-bairro"
                    className="campo__entrada"
                    type="text"
                    value={form.bairro}
                    onChange={(e) => set("bairro", e.target.value)}
                    aria-invalid={!!erros.bairro}
                  />
                  {erros.bairro && <span className="campo__erro" role="alert">{erros.bairro}</span>}
                </div>

                <div className={`campo ${erros.cidade ? "campo--erro" : ""}`}>
                  <label className="campo__rotulo" htmlFor="cad-cidade">Cidade *</label>
                  <input
                    id="cad-cidade"
                    className="campo__entrada"
                    type="text"
                    autoComplete="address-level2"
                    value={form.cidade}
                    onChange={(e) => set("cidade", e.target.value)}
                    aria-invalid={!!erros.cidade}
                  />
                  {erros.cidade && <span className="campo__erro" role="alert">{erros.cidade}</span>}
                </div>

                <div className={`campo ${erros.estado ? "campo--erro" : ""}`}>
                  <label className="campo__rotulo" htmlFor="cad-estado">Estado *</label>
                  <select
                    id="cad-estado"
                    className="campo__entrada"
                    autoComplete="address-level1"
                    value={form.estado}
                    onChange={(e) => set("estado", e.target.value)}
                    aria-invalid={!!erros.estado}
                  >
                    <option value="">UF</option>
                    {estadosBR.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                  {erros.estado && <span className="campo__erro" role="alert">{erros.estado}</span>}
                </div>
              </div>
            </fieldset>

            {/* Curso */}
            <fieldset className="formulario-cadastro__grupo">
              <legend className="formulario-cadastro__legenda">Curso de interesse</legend>

              <div className={`campo ${erros.cursoId ? "campo--erro" : ""}`}>
                <label className="campo__rotulo" htmlFor="cad-curso">Curso *</label>
                <select
                  id="cad-curso"
                  className="campo__entrada"
                  value={form.cursoId}
                  onChange={(e) => set("cursoId", e.target.value)}
                  aria-describedby={erros.cursoId ? "erro-curso" : undefined}
                  aria-invalid={!!erros.cursoId}
                >
                  <option value="">Selecione um curso</option>
                  {cursosAtivos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.titulo} — {c.nivel} · {c.duracao}
                    </option>
                  ))}
                </select>
                {erros.cursoId && <span id="erro-curso" className="campo__erro" role="alert">{erros.cursoId}</span>}
              </div>
            </fieldset>

            {/* Senha */}
            <fieldset className="formulario-cadastro__grupo">
              <legend className="formulario-cadastro__legenda">Senha de acesso</legend>

              <div className="grade-2">
                <div className={`campo ${erros.senha ? "campo--erro" : ""}`}>
                  <label className="campo__rotulo" htmlFor="cad-senha">Senha *</label>
                  <input
                    id="cad-senha"
                    className="campo__entrada"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    value={form.senha}
                    onChange={(e) => set("senha", e.target.value)}
                    aria-describedby={erros.senha ? "erro-senha" : undefined}
                    aria-invalid={!!erros.senha}
                  />
                  {erros.senha && <span id="erro-senha" className="campo__erro" role="alert">{erros.senha}</span>}
                </div>

                <div className={`campo ${erros.confirmarSenha ? "campo--erro" : ""}`}>
                  <label className="campo__rotulo" htmlFor="cad-confirmar">Confirmar senha *</label>
                  <input
                    id="cad-confirmar"
                    className="campo__entrada"
                    type="password"
                    autoComplete="new-password"
                    value={form.confirmarSenha}
                    onChange={(e) => set("confirmarSenha", e.target.value)}
                    aria-describedby={erros.confirmarSenha ? "erro-confirmar" : undefined}
                    aria-invalid={!!erros.confirmarSenha}
                  />
                  {erros.confirmarSenha && <span id="erro-confirmar" className="campo__erro" role="alert">{erros.confirmarSenha}</span>}
                </div>
              </div>
            </fieldset>

            {/* Rodapé do formulário */}
            <div className="formulario-cadastro__rodape">
              <Botao
                variante="fantasma"
                onClick={() => navigate(ROTAS.INICIO)}
              >
                Cancelar
              </Botao>
              <Botao variante="primario" tamanho="grande" type="submit">
                Criar conta
              </Botao>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
