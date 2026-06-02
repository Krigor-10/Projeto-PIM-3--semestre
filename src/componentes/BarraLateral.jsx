import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { TbX, TbTrophy, TbUserFilled } from "react-icons/tb";
import Modal from "@/componentes/Modal.jsx";
import Botao from "@/componentes/Botao.jsx";
import { rotaPainelSecao } from "@/rotas.js";
import {
  MdDashboard,
  MdPeople,
  MdSchool,
  MdCastForEducation,
  MdManageAccounts,
  MdMenuBook,
  MdLayers,
  MdGroups,
  MdAssignment,
  MdAssignmentTurnedIn,
  MdDescription,
  MdBarChart,
  MdPublic,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
  MdChevronRight,
  MdLibraryBooks,
  MdLogout,
} from "react-icons/md";
import { obterSecoesPermitidas } from "@/dados/permissoes.js";
import { matriculas, conteudos, avaliacoes } from "@/dados/dadosMock.js";

const corPorTipo = {
  Aluno:       "#7b2ff7",
  Professor:   "#3b82f6",
  Coordenador: "#f59e0b",
  Admin:       "#ef4444",
};

const ICONES_SECAO = {
  dashboard:     <MdDashboard size={18} />,
  usuarios:      <MdPeople size={18} />,
  alunos:        <MdSchool size={18} />,
  professores:   <MdCastForEducation size={18} />,
  coordenadores: <MdManageAccounts size={18} />,
  cursos:        <MdMenuBook size={18} />,
  modulos:       <MdLayers size={18} />,
  turmas:        <MdGroups size={18} />,
  matriculas:    <MdAssignment size={18} />,
  avaliacoes:    <MdAssignmentTurnedIn size={18} />,
  conteudos:     <MdDescription size={18} />,
  progresso:     <MdBarChart size={18} />,
  certificados:  <TbTrophy size={18} />,
  catalogo:      <MdPublic size={18} />,
};

/* Definição dos grupos accordion */
export const GRUPOS_DEF = {
  pessoas: {
    rotulo: "Gestão",
    Icone:  MdGroups,
    filhos: ["usuarios", "alunos", "professores", "coordenadores", "matriculas"],
  },
  academico: {
    rotulo: "Acadêmico",
    Icone:  MdMenuBook,
    filhos: ["cursos", "modulos", "conteudos", "avaliacoes", "turmas"],
  },
  aprendizado: {
    rotulo: "Aprendizado",
    Icone:  MdLibraryBooks,
    filhos: ["progresso", "certificados"],
  },
};

export const FILHO_PARA_GRUPO = {
  usuarios:      "pessoas",
  alunos:        "pessoas",
  professores:   "pessoas",
  coordenadores: "pessoas",
  matriculas:    "pessoas",
  cursos:        "academico",
  modulos:       "academico",
  turmas:        "academico",
  conteudos:     "academico",
  avaliacoes:    "academico",
  progresso:     "aprendizado",
  certificados:  "aprendizado",
};

const SECOES_OCULTAS_SIDEBAR = {
  Aluno:       new Set(["matriculas", "catalogo"]),
  Admin:       new Set(["catalogo"]),
  Professor:   new Set(["catalogo"]),
  Coordenador: new Set(["catalogo"]),
};

export default function BarraLateral({ usuario, secaoAtual, aberta, onFechar, onLogout }) {
  const navigate = useNavigate();

  function irPara(secao) {
    navigate(rotaPainelSecao(secao));
  }
  const [recolhida, setRecolhida] = useState(
    () => localStorage.getItem("coderyse-sidebar") === "recolhida"
  );
  const [hovering, setHovering] = useState(false);
  const [confirmarSaida, setConfirmarSaida] = useState(false);
  const [expandidos, setExpandidos] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("coderyse-sidebar-grupos") ?? '["pessoas","academico"]'));
    } catch {
      return new Set(["pessoas"]);
    }
  });

  useEffect(() => {
    const largura = recolhida ? "64px" : "272px";
    document.documentElement.style.setProperty("--largura-sidebar", largura);
    localStorage.setItem("coderyse-sidebar", recolhida ? "recolhida" : "expandida");
  }, [recolhida]);

  useEffect(() => {
    localStorage.setItem("coderyse-sidebar-grupos", JSON.stringify([...expandidos]));
  }, [expandidos]);

  function alternarGrupo(chave) {
    setExpandidos((prev) => {
      const prox = new Set(prev);
      prox.has(chave) ? prox.delete(chave) : prox.add(chave);
      return prox;
    });
  }

  const ORDEM_ALUNO = ["dashboard", "catalogo", "conteudos", "avaliacoes", "progresso", "certificados", "matriculas"];

  const itensMenu = (() => {
    const ocultas = SECOES_OCULTAS_SIDEBAR[usuario.tipo] ?? new Set();
    const base = obterSecoesPermitidas(usuario.tipo).filter((s) => !ocultas.has(s.chave));
    if (usuario.tipo !== "Aluno") return base;
    return [...base].sort((a, b) => {
      const ia = ORDEM_ALUNO.indexOf(a.chave);
      const ib = ORDEM_ALUNO.indexOf(b.chave);
      if (ia === -1 && ib === -1) return 0;
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  })();

  const pendentes = usuario.tipo === "Admin"
    ? matriculas.filter((m) => m.status === "Pendente").length
    : 0;

  const totalNovosConteudos  = conteudos.filter((c) => c.novo).length;
  const totalProvasLiberadas = avaliacoes.filter((a) => a.novo).length;

  const [vistoConteudos,  setVistoConteudos]  = useState(
    () => localStorage.getItem("coderyse-visto-conteudos")  === "true"
  );
  const [vistoAvaliacoes, setVistoAvaliacoes] = useState(
    () => localStorage.getItem("coderyse-visto-avaliacoes") === "true"
  );

  useEffect(() => {
    if (secaoAtual === "conteudos" && !vistoConteudos) {
      setVistoConteudos(true);
      localStorage.setItem("coderyse-visto-conteudos", "true");
    }
    if (secaoAtual === "avaliacoes" && !vistoAvaliacoes) {
      setVistoAvaliacoes(true);
      localStorage.setItem("coderyse-visto-avaliacoes", "true");
    }
  }, [secaoAtual]);

  const badgeConteudos  = usuario.tipo === "Aluno" && !vistoConteudos  ? totalNovosConteudos  : 0;
  const badgeAvaliacoes = usuario.tipo === "Aluno" && !vistoAvaliacoes ? totalProvasLiberadas : 0;

  /* Monta a lista de renderização com grupos injetados */
  const renderItens = (() => {
    /* Pré-calcula quais grupos têm 2+ filhos visíveis */
    const gruposVisiveis = {};
    for (const [chave, def] of Object.entries(GRUPOS_DEF)) {
      const filhosVisiveis = def.filhos
        .map((f) => itensMenu.find((i) => i.chave === f))
        .filter(Boolean);
      if (filhosVisiveis.length >= 1) {
        gruposVisiveis[chave] = { ...def, filhosVisiveis };
      }
    }

    const emGrupo = new Set(
      Object.values(gruposVisiveis).flatMap((g) => g.filhosVisiveis.map((f) => f.chave))
    );

    const lista = [];
    const gruposInjetados = new Set();

    for (const item of itensMenu) {
      const grupoKey = FILHO_PARA_GRUPO[item.chave];
      if (grupoKey && emGrupo.has(item.chave) && gruposVisiveis[grupoKey]) {
        if (!gruposInjetados.has(grupoKey)) {
          gruposInjetados.add(grupoKey);
          lista.push({ tipo: "grupo", chave: grupoKey, ...gruposVisiveis[grupoKey] });
        }
      } else {
        lista.push({ tipo: "item", ...item });
      }
    }
    return lista;
  })();

  function gerarIniciais(nome) {
    return nome.split(" ").slice(0, 2).map((parte) => parte[0]).join("").toUpperCase();
  }

  function renderBadge(chave) {
    if (chave === "matriculas" && pendentes > 0)
      return <span className="sidebar__badge" aria-label={`${pendentes} matrículas pendentes`}>{pendentes}</span>;
    if (chave === "conteudos" && badgeConteudos > 0)
      return <span className="sidebar__badge" aria-label={`${badgeConteudos} novos conteúdos`}>{badgeConteudos}</span>;
    if (chave === "avaliacoes" && badgeAvaliacoes > 0)
      return <span className="sidebar__badge" aria-label={`${badgeAvaliacoes} provas liberadas`}>{badgeAvaliacoes}</span>;
    return null;
  }

  return (
    <>
      {aberta && (
        <div className="sidebar-overlay" onClick={onFechar} aria-hidden="true" />
      )}

      <aside
        className={`sidebar${aberta ? " sidebar--aberta" : ""}${recolhida && !hovering ? " sidebar--recolhida" : ""}${recolhida && hovering ? " sidebar--peek" : ""}`}
        aria-label="Menu de navegação principal"
        onMouseEnter={() => recolhida && setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <a
          href="#conteudo-principal"
          className="sidebar__logo"
          aria-label="CodeRyse Academy — ir para o painel"
        >
          <span className="sidebar__logo-marca" aria-hidden="true">
            <span>Code</span>
            <span>Ryse</span>
          </span>
          <span className="sidebar__logo-subtitulo">Academy</span>
        </a>

        <nav className="sidebar__nav" aria-label="Navegação principal">
          <ul className="sidebar__lista" role="list">
            {renderItens.map((item) => {
              if (item.tipo === "grupo") {
                const { Icone, chave, rotulo, filhosVisiveis } = item;
                const aberto      = expandidos.has(chave);
                const filhoAtivo  = filhosVisiveis.some((f) => f.chave === secaoAtual);
                return (
                  <li key={chave}>
                    <button
                      className={`sidebar__item sidebar__grupo-btn${filhoAtivo && !aberto ? " sidebar__item--ativo" : ""}${filhoAtivo ? " sidebar__grupo-btn--filho-ativo" : ""}`}
                      onClick={() => alternarGrupo(chave)}
                      aria-expanded={aberto}
                      aria-controls={`sidebar-grupo-${chave}`}
                      title={rotulo}
                      type="button"
                    >
                      <span className="sidebar__item-icone" aria-hidden="true">
                        <Icone size={18} />
                      </span>
                      <span className="sidebar__item-rotulo">{rotulo}</span>
                      <MdChevronRight
                        size={16}
                        aria-hidden="true"
                        className={`sidebar__grupo-chevron${aberto ? " sidebar__grupo-chevron--aberto" : ""}`}
                      />
                    </button>

                    {aberto && (
                      <ul
                        id={`sidebar-grupo-${chave}`}
                        className="sidebar__subitens"
                        role="list"
                      >
                        {filhosVisiveis.map((filho) => (
                          <li key={filho.chave}>
                            <button
                              className={`sidebar__item sidebar__item--filho${secaoAtual === filho.chave ? " sidebar__item--ativo" : ""}`}
                              onClick={() => { irPara(filho.chave); onFechar?.(); }}
                              aria-current={secaoAtual === filho.chave ? "page" : undefined}
                              title={filho.rotulo}
                              type="button"
                            >
                              <span className="sidebar__item-icone" aria-hidden="true">
                                {ICONES_SECAO[filho.chave]}
                                {renderBadge(filho.chave)}
                              </span>
                              <span className="sidebar__item-rotulo">{filho.rotulo}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }

              /* Item normal */
              return (
                <li key={item.chave}>
                  <button
                    className={`sidebar__item${secaoAtual === item.chave ? " sidebar__item--ativo" : ""}`}
                    onClick={() => { irPara(item.chave); onFechar?.(); }}
                    aria-current={secaoAtual === item.chave ? "page" : undefined}
                    title={item.rotulo}
                    type="button"
                  >
                    <span className="sidebar__item-icone" aria-hidden="true">
                      {ICONES_SECAO[item.chave]}
                      {renderBadge(item.chave)}
                    </span>
                    <span className="sidebar__item-rotulo">{item.rotulo}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <footer className="sidebar__rodape">
          <button
            type="button"
            className="sidebar__mini-usuario"
            onClick={() => navigate(rotaPainelSecao("perfil"))}
            title={usuario.nome}
            aria-label={`Meu perfil — ${usuario.nome}`}
          >
            <span
              className="sidebar__mini-usuario__avatar"
              style={{ "--cor-perfil": corPorTipo[usuario.tipo] ?? "#7b2ff7" }}
              aria-hidden="true"
            >
              <TbUserFilled size={15} style={{ color: "#fff" }} />
            </span>
            <span className="sidebar__mini-usuario__info">
              <span className="sidebar__mini-usuario__nome">{usuario.nome}</span>
              <span className="sidebar__mini-usuario__tipo">{usuario.tipo}</span>
            </span>
          </button>

          <button
            className="sidebar__item sidebar__item--sair"
            onClick={() => setConfirmarSaida(true)}
            title="Sair da conta"
            type="button"
            aria-label="Sair da conta"
          >
            <span className="sidebar__item-icone" aria-hidden="true">
              <MdLogout size={18} />
            </span>
            <span className="sidebar__item-rotulo">Sair</span>
          </button>

          <button
            className="sidebar__toggle"
            onClick={() => setRecolhida((v) => !v)}
            aria-label={recolhida ? "Expandir menu lateral" : "Recolher menu lateral"}
            title={recolhida ? "Expandir menu" : "Recolher menu"}
            type="button"
          >
            {recolhida
              ? <MdKeyboardDoubleArrowRight size={18} aria-hidden="true" />
              : <MdKeyboardDoubleArrowLeft  size={18} aria-hidden="true" />
            }
          </button>
        </footer>
      </aside>

      {confirmarSaida && createPortal(
        <Modal titulo="Sair da conta" onFechar={() => setConfirmarSaida(false)}>
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
            Tem certeza que deseja sair? Você precisará fazer login novamente para acessar a plataforma.
          </p>
          <footer className="modal-rodape">
            <Botao variante="perigo" onClick={() => setConfirmarSaida(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <TbX size={15} aria-hidden="true" /> Cancelar
            </Botao>
            <Botao variante="sucesso" onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <MdLogout size={16} aria-hidden="true" /> Confirmar saída
            </Botao>
          </footer>
        </Modal>,
        document.body
      )}
    </>
  );
}
