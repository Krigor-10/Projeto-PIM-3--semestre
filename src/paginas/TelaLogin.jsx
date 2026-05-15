import { useState } from "react";
import Botao from "@/componentes/Botao.jsx";
import { perfisDemo } from "@/dados/dadosMock.js";

export default function TelaLogin({ onLogin, onNavegar }) {
  const [selecionado, setSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(false);

  function handleEntrar() {
    if (!selecionado) return;
    setCarregando(true);
    setTimeout(() => {
      onLogin(selecionado);
    }, 600);
  }

  return (
    <div className="tela-login">
      <a href="#conteudo-login" className="pular-para-conteudo">
        Pular para o formulario de login
      </a>

      <aside className="tela-login__visual" aria-hidden="true">
        <div className="tela-login__visual-conteudo">
          <p className="tela-login__visual-tag">Plataforma de Ensino</p>
          <h2 className="tela-login__visual-titulo">
            CodeRyse<br />
            <span>Academy</span>
          </h2>
          <p className="tela-login__visual-descricao">
            Acesso rapido aos perfis de demonstracao, sem backend.
          </p>
        </div>
      </aside>

      <main className="tela-login__formulario" id="conteudo-login">
        <header className="tela-login__cabecalho">
          <Botao
            variante="fantasma"
            tamanho="pequeno"
            className="tela-login__voltar"
            onClick={() => onNavegar("inicio")}
            aria-label="Voltar para a pagina inicial"
          >
            Voltar
          </Botao>
          <a href="#" className="tela-login__logo" aria-label="CodeRyse Academy">
            <span className="tela-login__logo-marca" aria-hidden="true">
              <span>Code</span>
              <span>Ryse</span>
            </span>
          </a>
        </header>

        <section className="tela-login__corpo" aria-labelledby="titulo-login">
          <h1 className="tela-login__titulo" id="titulo-login">Acesso rapido</h1>
          <p className="tela-login__subtitulo">
            Escolha um perfil para explorar a interface na apresentacao.
          </p>

          <fieldset className="tela-login__perfis" aria-legend="Selecione um perfil de demonstracao">
            <legend className="visualmente-oculto">Selecione um perfil de demonstracao</legend>
            {perfisDemo.map((perfil) => (
              <button
                key={perfil.chave}
                className={`cartao-perfil ${selecionado === perfil.chave ? "cartao-perfil--selecionado" : ""}`}
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

          <Botao
            variante="primario"
            tamanho="grande"
            className="botao--bloco"
            onClick={handleEntrar}
            disabled={!selecionado || carregando}
          >
            {carregando ? (
              <><span className="icone-carregando" aria-hidden="true" /> Entrando...</>
            ) : (
              "Entrar na plataforma"
            )}
          </Botao>
        </section>
      </main>
    </div>
  );
}
