import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TbArrowLeft } from "react-icons/tb";
import { MdDashboard, MdCastForEducation, MdManageAccounts, MdAdminPanelSettings, MdSchool } from "react-icons/md";
import Botao from "@/componentes/Botao.jsx";
import { perfisDemo } from "@/dados/dadosMock.js";
import { ROTAS } from "@/rotas.js";

const ICONE_PERFIL = {
  aluno:       <MdSchool size={28} />,
  professor:   <MdCastForEducation size={28} />,
  coordenador: <MdManageAccounts size={28} />,
  admin:       <MdAdminPanelSettings size={28} />,
};

/* Apenas perfis de equipe (sem o aluno) */
const perfisStaff = perfisDemo.filter((p) => p.chave !== "aluno");

export default function TelaLoginStaff({ onLogin }) {
  const navigate = useNavigate();
  const [selecionado, setSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(false);

  function entrar() {
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
          <div className="visual-logo" aria-label="CodeRyse Academy">
            <span className="visual-logo__marca">
              <span>Code</span><span>Ryse</span>
            </span>
            <span className="visual-logo__subtitulo">Academy</span>
          </div>
        </div>
      </aside>

      {/* Formulário de acesso */}
      <main className="tela-login__formulario" id="conteudo-login-staff">
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

        <section className="tela-login__corpo" aria-labelledby="titulo-login-staff">
          <h1 className="tela-login__titulo" id="titulo-login-staff">Área da Equipe</h1>
          <p className="tela-login__subtitulo">
            Selecione seu perfil para acessar o painel de gestão.
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
                <span className="cartao-perfil__icone" aria-hidden="true">{ICONE_PERFIL[perfil.chave]}</span>
                <div className="cartao-perfil__info">
                  <strong className="cartao-perfil__rotulo">{perfil.rotulo}</strong>
                  <span className="cartao-perfil__descricao">{perfil.descricao}</span>
                </div>
                {selecionado === perfil.chave && (
                  <span className="cartao-perfil__check" aria-hidden="true">✓</span>
                )}
              </button>
            ))}
          </fieldset>

          <Botao
            variante="primario"
            tamanho="grande"
            className="botao--bloco"
            onClick={entrar}
            disabled={!selecionado || carregando}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            {carregando
              ? <><span className="icone-carregando" aria-hidden="true" /> Entrando...</>
              : <><MdDashboard size={20} aria-hidden="true" /> Acessar o painel</>
            }
          </Botao>

          <p className="tela-login__rodape-texto">
            É aluno?{" "}
            <button className="link-botao" onClick={() => navigate(ROTAS.LOGIN)} type="button">
              Acesso do aluno
            </button>
          </p>
        </section>
      </main>
    </div>
  );
}
