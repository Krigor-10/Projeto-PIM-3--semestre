import { useState, useRef, useEffect } from "react";
import { TbTrophy } from "react-icons/tb";
import Insignia from "./Insignia.jsx";

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
};

const variantePorTipo = { Aluno: "marca", Professor: "info", Coordenador: "aviso", Admin: "erro" };

export default function BarraTopo({ usuario, secaoAtual, onLogout, onAbrirSidebar, onMudarSecao }) {
  const [popupAberto, setPopupAberto] = useState(false);
  const refWrapper = useRef(null);

  const meta = metadadosPorSecao[secaoAtual] || metadadosPorSecao.dashboard;

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

  return (
    <header className="topbar" role="banner">
      <div className="topbar__esquerda">
        <button
          className="topbar__menu-mobile botao botao--fantasma botao--pequeno"
          onClick={onAbrirSidebar}
          aria-label="Abrir menu de navegação"
          type="button"
        >
          Menu
        </button>

        <div className="topbar__contexto">
          <span className="topbar__eyebrow">CodeRyse Academy</span>
          <h1 className="topbar__titulo">{meta.titulo}</h1>
          <p className="topbar__descricao">{meta.descricao}</p>
        </div>
      </div>

      {usuario.tipo === "Aluno" && (
        <button
          className={`topbar__atalho-certificados${secaoAtual === "certificados" ? " topbar__atalho-certificados--ativo" : ""}`}
          onClick={() => onMudarSecao?.("certificados")}
          aria-label="Ir para Meus Certificados"
          title="Meus Certificados"
          type="button"
        >
          <TbTrophy size={24} aria-hidden="true" />
        </button>
      )}

      <div className="topbar__acoes">
        {/* Wrapper relativo para posicionar o popup abaixo do perfil */}
        <div className="topbar__perfil-wrapper" ref={refWrapper}>
          <button
            className="topbar__perfil"
            onClick={() => setPopupAberto((v) => !v)}
            aria-haspopup="dialog"
            aria-expanded={popupAberto}
            aria-label="Abrir perfil do usuário"
            type="button"
          >
            <div className="topbar__avatar" aria-hidden="true">
              {gerarIniciais(usuario.nome)}
            </div>
            <div className="topbar__info">
              <span className="topbar__nome">{usuario.nome.split(" ")[0]}</span>
              <span className="topbar__cargo">{usuario.tipo}</span>
            </div>
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
            </div>
          )}
        </div>

        <button
          className="botao botao--fantasma botao--pequeno"
          onClick={onLogout}
          aria-label="Sair da conta"
          type="button"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
