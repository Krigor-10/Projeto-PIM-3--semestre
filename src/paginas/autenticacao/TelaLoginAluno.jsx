import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TbArrowLeft } from "react-icons/tb";
import { MdDashboard } from "react-icons/md";
import Botao from "@/componentes/Botao.jsx";
import { perfisDemo } from "@/dados/dadosMock.js";
import { ROTAS } from "@/rotas.js";

/* Somente o perfil de aluno é exibido nesta tela */
const perfilAluno = perfisDemo.find((p) => p.chave === "aluno");

export default function TelaLoginAluno({ onLogin }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cursoParam = searchParams.get("curso");
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
          <div className="visual-logo" aria-label="CodeRyse Academy">
            <span className="visual-logo__marca">
              <span>Code</span><span>Ryse</span>
            </span>
            <span className="visual-logo__subtitulo">Academy</span>
          </div>
        </div>
      </aside>

      {/* Formulário de acesso */}
      <main className="tela-login__formulario" id="conteudo-login-aluno">
        <header className="tela-login__cabecalho">
          <button
            type="button"
            className="cadastro-voltar"
            onClick={() => navigate(ROTAS.INICIO)}
            aria-label="Voltar para a página inicial"
          >
            <TbArrowLeft size={18} aria-hidden="true" />
            Voltar
          </button>
        </header>

        <section className="tela-login__corpo" aria-labelledby="titulo-login-aluno">
          <h1 className="tela-login__titulo" id="titulo-login-aluno">Acesso do Aluno</h1>
          <p className="tela-login__subtitulo">
            Entre com sua conta para acessar sua trilha de aprendizado.
          </p>

          {/* Card do perfil aluno */}
          <div className="login-aluno__perfil-demo" aria-label="Perfil de demonstração selecionado">
            <div className="login-aluno__avatar" aria-hidden="true">
              {perfilAluno.icone}
            </div>
            <div className="login-aluno__info">
              <strong>{perfilAluno.rotulo}</strong>
            </div>
            <span className="login-aluno__check" aria-hidden="true">✓</span>
          </div>

          <Botao
            variante="primario"
            tamanho="grande"
            className="botao--bloco"
            onClick={handleEntrar}
            disabled={carregando}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            {carregando
              ? <><span className="icone-carregando" aria-hidden="true" /> Entrando...</>
              : <><MdDashboard size={20} aria-hidden="true" /> Acessar meu painel</>
            }
          </Botao>

          <p className="tela-login__rodape-texto">
            Não tem uma conta?{" "}
            <button className="link-botao" onClick={() => navigate(cursoParam ? `${ROTAS.CADASTRO}?curso=${cursoParam}` : ROTAS.CADASTRO)} type="button">
              Criar conta
            </button>
          </p>

          <p className="tela-login__rodape-texto">
            É educador ou administrador?{" "}
            <button className="link-botao" onClick={() => navigate(ROTAS.LOGIN_STAFF)} type="button">
              Acesso da equipe
            </button>
          </p>
        </section>
      </main>
    </div>
  );
}
