import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROTAS, rotaPainelSecao } from "@/rotas.js";
import {
  TbTrophy, TbSun, TbMoon, TbChevronDown,
  TbLayoutDashboard, TbUsers, TbChalkboard, TbUserShield,
  TbBooks, TbStack, TbSchool, TbClipboardList,
  TbFileCheck, TbFileText, TbChartBar, TbUsersGroup, TbWorld,
} from "react-icons/tb";
import Insignia from "./Insignia.jsx";
import Modal from "./Modal.jsx";
import Botao from "./Botao.jsx";
import NavGrupo from "./NavGrupo.jsx";
import { temNavGrupo } from "./NavGrupo.jsx";

const iconesPorSecao = {
  dashboard:    TbLayoutDashboard,
  alunos:       TbUsers,
  professores:  TbChalkboard,
  coordenadores:TbUserShield,
  cursos:       TbBooks,
  modulos:      TbStack,
  turmas:       TbSchool,
  matriculas:   TbClipboardList,
  avaliacoes:   TbFileCheck,
  conteudos:    TbFileText,
  progresso:    TbChartBar,
  certificados: TbTrophy,
  usuarios:     TbUsersGroup,
  catalogo:     TbWorld,
};

const metadadosPorSecao = {
  dashboard:    { titulo: "Panorama",           descricao: "Resumo central do workspace com dados da plataforma."         },
  alunos:       { titulo: "Gestão de Alunos",   descricao: "Consulta rápida da base acadêmica para operação e apoio."    },
  professores:  { titulo: "Corpo Docente",       descricao: "Professores disponíveis para cursos e turmas."               },
  coordenadores:{ titulo: "Coordenadores",       descricao: "Supervisão acadêmica dos cursos."                            },
  cursos:       { titulo: "Catálogo Acadêmico",  descricao: "A mesma base alimenta a home, o cadastro e o painel."       },
  modulos:      { titulo: "Módulos por Curso",   descricao: "Estrutura acadêmica para conteúdos, avaliações e progresso."},
  turmas:       { titulo: "Mapa de Turmas",      descricao: "Turmas organizadas para acompanhamento da plataforma."      },
  matriculas:   { titulo: "Fluxo de Matrículas", descricao: "Solicitações e status acadêmico simulados."                 },
  avaliacoes:   { titulo: "Avaliações",          descricao: "Provas, quizzes e exercícios por perfil."                   },
  conteudos:    { titulo: "Conteúdos",           descricao: "Materiais publicados para a jornada acadêmica."             },
  progresso:    { titulo: "Meu Progresso",       descricao: "Acompanhamento visual da trilha do aluno."                  },
  certificados: { titulo: "Meus Certificados",   descricao: "Cursos concluídos e certificados disponíveis para download." },
  usuarios:     { titulo: "Usuários",            descricao: "Visão administrativa dos perfis do sistema."                },
  catalogo:     { titulo: "Catálogo Público",    descricao: "Gerencie a visibilidade dos cursos na homepage."             },
};

const variantePorTipo = { Aluno: "marca", Professor: "info", Coordenador: "aviso", Admin: "erro" };

const corPorTipo = {
  Aluno:       "#7b2ff7",
  Professor:   "#3b82f6",
  Coordenador: "#f59e0b",
  Admin:       "#ef4444",
};

export default function BarraTopo({ usuario, secaoAtual, onLogout, onAbrirSidebar }) {
  const navigate = useNavigate();
  const [popupAberto, setPopupAberto] = useState(false);
  const [confirmarSaida, setConfirmarSaida] = useState(false);
  const [temaClaro, setTemaClaro] = useState(
    () => localStorage.getItem("coderyse-tema") === "claro"
  );
  const refWrapper = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.tema = temaClaro ? "claro" : "escuro";
    localStorage.setItem("coderyse-tema", temaClaro ? "claro" : "escuro");
  }, [temaClaro]);

  const meta = metadadosPorSecao[secaoAtual] || metadadosPorSecao.dashboard;
  const IconeSecao = iconesPorSecao[secaoAtual] || TbLayoutDashboard;

  /* Fecha o popup ao clicar fora dele */
  useEffect(() => {
    function fecharAoClicarFora(e) {
      if (refWrapper.current && !refWrapper.current.contains(e.target)) {
        setPopupAberto(false);
      }
    }
    if (popupAberto) document.addEventListener("mousedown", fecharAoClicarFora);
    return () => document.removeEventListener("mousedown", fecharAoClicarFora);
  }, [popupAberto]);

  function gerarIniciais(nome) {
    return nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  }

  const comTabs = temNavGrupo(usuario, secaoAtual);

  return (
    <>
    <header className={`topbar${comTabs ? " topbar--com-tabs" : ""}`}>
      <div className="topbar__principal">
      <div className="topbar__esquerda">
        <Botao
          variante="fantasma"
          tamanho="pequeno"
          className="topbar__menu-mobile"
          onClick={onAbrirSidebar}
          aria-label="Abrir menu de navegação"
        >
          Menu
        </Botao>

        <div className="topbar__contexto">
          <nav className="topbar__breadcrumb" aria-label="Localização atual">
            <span className="topbar__breadcrumb-raiz">CodeRyse Academy</span>
            <span className="topbar__breadcrumb-sep" aria-hidden="true">›</span>
            <span className="topbar__breadcrumb-secao">
              <IconeSecao size={16} aria-hidden="true" />
              {meta.titulo}
            </span>
          </nav>
        </div>
      </div>

      <div className="topbar__acoes">
        {usuario.tipo === "Aluno" && (
          <>
            <button
              className={`topbar__atalho-certificados${secaoAtual === "certificados" ? " topbar__atalho-certificados--ativo" : ""}`}
              onClick={() => navigate(ROTAS.PAINEL_CERTIFICADOS)}
              aria-label="Ir para Meus Certificados"
              title="Meus Certificados"
              type="button"
            >
              <TbTrophy size={25} aria-hidden="true" />
            </button>
            <span className="topbar__separador" aria-hidden="true" />
          </>
        )}
        <button
          role="switch"
          aria-checked={temaClaro}
          className={`switch-tema${temaClaro ? " switch-tema--claro" : ""}`}
          onClick={() => setTemaClaro((v) => !v)}
          aria-label={temaClaro ? "Ativar tema escuro" : "Ativar tema claro"}
          title={temaClaro ? "Tema escuro" : "Tema claro"}
          type="button"
        >
          <TbMoon size={12} className="switch-tema__lua" aria-hidden="true" />
          <span className="switch-tema__thumb" aria-hidden="true" />
          <TbSun  size={12} className="switch-tema__sol" aria-hidden="true" />
        </button>
        {/* Wrapper relativo para posicionar o popup abaixo do perfil */}
        <div className="topbar__perfil-wrapper" ref={refWrapper}>
          <button
            className="topbar__perfil"
            onClick={() => setPopupAberto((v) => !v)}
            aria-haspopup="dialog"
            aria-expanded={popupAberto}
            aria-label="Abrir perfil do usuário"
            type="button"
            style={{ "--cor-perfil": corPorTipo[usuario.tipo] ?? "#7b2ff7" }}
          >
            <div className="topbar__avatar" aria-hidden="true">
              {gerarIniciais(usuario.nome)}
            </div>
            <div className="topbar__info">
              <span className="topbar__nome">{usuario.nome.split(" ")[0]}</span>
              <span className="topbar__cargo">{usuario.tipo}</span>
            </div>
            <TbChevronDown
              size={14}
              className={`topbar__perfil-chevron${popupAberto ? " topbar__perfil-chevron--aberto" : ""}`}
              aria-hidden="true"
            />
          </button>

          {popupAberto && (
            <div
              className="popup-perfil"
              role="dialog"
              aria-label="Dados do perfil"
              aria-modal="false"
            >
              <div className="popup-perfil__cabecalho">
                <div className="popup-perfil__avatar" aria-hidden="true">
                  {gerarIniciais(usuario.nome)}
                </div>
                <div className="popup-perfil__identidade">
                  <h2 className="popup-perfil__nome">{usuario.nome}</h2>
                  <Insignia texto={usuario.tipo} variante={variantePorTipo[usuario.tipo] ?? "neutro"} />
                </div>
              </div>

              <dl className="popup-perfil__dados">
                <div className="popup-perfil__linha">
                  <dt className="popup-perfil__chave">E-mail</dt>
                  <dd className="popup-perfil__valor">{usuario.email}</dd>
                </div>
                {usuario.telefone && (
                  <div className="popup-perfil__linha">
                    <dt className="popup-perfil__chave">Telefone</dt>
                    <dd className="popup-perfil__valor">{usuario.telefone}</dd>
                  </div>
                )}
                {usuario.cidade && (
                  <div className="popup-perfil__linha">
                    <dt className="popup-perfil__chave">Localização</dt>
                    <dd className="popup-perfil__valor">{usuario.cidade}, {usuario.estado}</dd>
                  </div>
                )}
                {usuario.codigoAluno && (
                  <div className="popup-perfil__linha">
                    <dt className="popup-perfil__chave">Código do aluno</dt>
                    <dd className="popup-perfil__valor">{usuario.codigoAluno}</dd>
                  </div>
                )}
              </dl>

              <div className="popup-perfil__rodape">
                <Botao
                  variante="perigo"
                  className="popup-perfil__sair"
                  onClick={() => { setConfirmarSaida(true); setPopupAberto(false); }}
                >
                  Sair da conta
                </Botao>
              </div>
            </div>
          )}
        </div>

      </div>
      </div>

      {comTabs && <NavGrupo usuario={usuario} secaoAtual={secaoAtual} />}
    </header>

    {confirmarSaida && (
      <Modal titulo="Sair da conta" onFechar={() => setConfirmarSaida(false)}>
        <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
          Tem certeza que deseja sair? Você precisará fazer login novamente para acessar a plataforma.
        </p>
        <footer style={{ display: "flex", gap: "var(--espaco-md)", justifyContent: "flex-end" }}>
          <Botao variante="fantasma" onClick={() => setConfirmarSaida(false)}>
            Cancelar
          </Botao>
          <Botao variante="perigo" onClick={onLogout}>
            Confirmar saída
          </Botao>
        </footer>
      </Modal>
    )}
    </>
  );
}
