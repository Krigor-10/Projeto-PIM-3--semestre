import { useState } from "react";
import { perfisDemo } from "../dados/dadosMock.js";

/* Apenas perfis de equipe (sem o aluno) */
const perfisStaff = perfisDemo.filter((p) => p.chave !== "aluno");

export default function TelaLoginStaff({ onLogin, onNavegar }) {
  const [selecionado, setSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(false);

  function handleEntrar() {
    if (!selecionado) return;
    setCarregando(true);
    setTimeout(() => onLogin(selecionado), 600);
  }

  return (
    <div className="tela-login tela-login--staff">
      <a href="#conteudo-login-staff" className="pular-para-conteudo">
        Pular para o formulário de acesso
      </a>

      {/* Painel visual lateral */}
      <aside className="tela-login__visual tela-login__visual--staff" aria-hidden="true">
        <div className="tela-login__visual-conteudo">
          <p className="tela-login__visual-tag">Área restrita</p>
          <h2 className="tela-login__visual-titulo">
            Painel da<br />
            <span>Equipe</span>
          </h2>
          <ul className="login-staff__destaques" aria-hidden="true">
            <li>Gerencie turmas, cursos e avaliações</li>
            <li>Acompanhe o desempenho dos alunos</li>
            <li>Controle matrículas e usuários</li>
          </ul>
        </div>
      </aside>

      {/* Formulário de acesso */}
      <main className="tela-login__formulario" id="conteudo-login-staff">
        <header className="tela-login__cabecalho">
          <button
            className="botao botao--fantasma botao--pequeno tela-login__voltar"
            onClick={() => onNavegar("inicio")}
            aria-label="Voltar para a página inicial"
            type="button"
          >
            Voltar
          </button>
          <a href="#" className="tela-login__logo" aria-label="CodeRyse Academy">
            <span className="tela-login__logo-marca" aria-hidden="true">
              <span>Code</span><span>Ryse</span>
            </span>
          </a>
        </header>

        <section className="tela-login__corpo" aria-labelledby="titulo-login-staff">
          <div className="login-staff__badge" aria-label="Área restrita">
            <span aria-hidden="true">🔒</span> Acesso restrito
          </div>

          <h1 className="tela-login__titulo" id="titulo-login-staff">Área da Equipe</h1>
          <p className="tela-login__subtitulo">
            Selecione seu perfil de demonstração para acessar o painel.
          </p>

          <fieldset className="tela-login__perfis" aria-legend="Selecione um perfil de equipe">
            <legend className="visualmente-oculto">Selecione um perfil de equipe</legend>
            {perfisStaff.map((perfil) => (
              <button
                key={perfil.chave}
                className={`cartao-perfil cartao-perfil--staff ${selecionado === perfil.chave ? "cartao-perfil--selecionado" : ""}`}
                onClick={() => setSelecionado(perfil.chave)}
                aria-pressed={selecionado === perfil.chave}
                type="button"
              >
                <span className="cartao-perfil__icone" aria-hidden="true">{perfil.icone}</span>
                <div className="cartao-perfil__info">
                  <strong className="cartao-perfil__rotulo">{perfil.rotulo}</strong>
                  <span className="cartao-perfil__descricao">{perfil.descricao}</span>
                </div>
                {selecionado === perfil.chave && (
                  <span className="cartao-perfil__check" aria-hidden="true">OK</span>
                )}
              </button>
            ))}
          </fieldset>

          <button
            className="botao botao--primario botao--grande botao--bloco"
            onClick={handleEntrar}
            disabled={!selecionado || carregando}
            type="button"
          >
            {carregando
              ? <><span className="icone-carregando" aria-hidden="true" /> Entrando...</>
              : "Acessar o painel"
            }
          </button>

          <div className="tela-login__divisor">
            <span>ou</span>
          </div>

          <p className="tela-login__rodape-texto">
            É aluno?{" "}
            <button
              className="link-botao"
              onClick={() => onNavegar("login-aluno")}
              type="button"
            >
              Acesso do aluno
            </button>
          </p>
        </section>
      </main>
    </div>
  );
}
