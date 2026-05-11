import { useState } from "react";
import Botao from "../../componentes/Botao.jsx";
import { perfisDemo } from "../../dados/dadosMock.js";

/* Somente o perfil de aluno é exibido nesta tela */
const perfilAluno = perfisDemo.find((p) => p.chave === "aluno");

export default function TelaLoginAluno({ onLogin, onNavegar }) {
  const [carregando, setCarregando] = useState(false);

  function handleEntrar() {
    setCarregando(true);
    setTimeout(() => onLogin(perfilAluno.chave), 600);
  }

  return (
    <div className="tela-login tela-login--aluno">
      <a href="#conteudo-login-aluno" className="pular-para-conteudo">
        Pular para o formulário de acesso
      </a>

      {/* Painel visual lateral */}
      <aside className="tela-login__visual tela-login__visual--aluno" aria-hidden="true">
        <div className="tela-login__visual-conteudo">
          <p className="tela-login__visual-tag">Sua jornada de aprendizado</p>
          <h2 className="tela-login__visual-titulo">
            Bem-vindo(a)<br />
            <span>de volta!</span>
          </h2>
          <ul className="login-aluno__destaques" aria-hidden="true">
            <li>Acompanhe seu progresso por módulo</li>
            <li>Acesse avaliações e materiais do curso</li>
            <li>Visualize sua matrícula em tempo real</li>
          </ul>
        </div>
      </aside>

      {/* Formulário de acesso */}
      <main className="tela-login__formulario" id="conteudo-login-aluno">
        <header className="tela-login__cabecalho">
          <Botao
            variante="fantasma"
            tamanho="pequeno"
            className="tela-login__voltar"
            onClick={() => onNavegar("inicio")}
            aria-label="Voltar para a página inicial"
          >
            Voltar
          </Botao>
          <a href="#" className="tela-login__logo" aria-label="CodeRyse Academy">
            <span className="tela-login__logo-marca" aria-hidden="true">
              <span>Code</span><span>Ryse</span>
            </span>
          </a>
        </header>

        <section className="tela-login__corpo" aria-labelledby="titulo-login-aluno">
          <h1 className="tela-login__titulo" id="titulo-login-aluno">Acesso do Aluno</h1>
          <p className="tela-login__subtitulo">
            Demonstração — clique em entrar para acessar o painel do aluno.
          </p>

          {/* Card do perfil aluno */}
          <div className="login-aluno__perfil-demo" aria-label="Perfil de demonstração selecionado">
            <div className="login-aluno__avatar" aria-hidden="true">
              {perfilAluno.icone}
            </div>
            <div className="login-aluno__info">
              <strong>{perfilAluno.rotulo}</strong>
              <span>{perfilAluno.descricao}</span>
            </div>
            <span className="login-aluno__check" aria-hidden="true">✓</span>
          </div>

          <Botao
            variante="primario"
            tamanho="grande"
            className="botao--bloco"
            onClick={handleEntrar}
            disabled={carregando}
          >
            {carregando
              ? <><span className="icone-carregando" aria-hidden="true" /> Entrando...</>
              : "Acessar meu painel"
            }
          </Botao>

          <p className="tela-login__rodape-texto">
            Não tem uma conta?{" "}
            <button
              className="link-botao"
              onClick={() => onNavegar("cadastro")}
              type="button"
            >
              Criar conta
            </button>
          </p>

          <div className="tela-login__divisor">
            <span>ou</span>
          </div>

          <p className="tela-login__rodape-texto">
            É educador ou administrador?{" "}
            <button
              className="link-botao"
              onClick={() => onNavegar("login-staff")}
              type="button"
            >
              Acesso da equipe
            </button>
          </p>
        </section>
      </main>
    </div>
  );
}
