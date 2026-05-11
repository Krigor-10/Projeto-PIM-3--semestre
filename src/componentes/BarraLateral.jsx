import { useState, useEffect } from "react";
import {
  TbLayoutDashboard,
  TbUsers,
  TbSchool,
  TbChalkboard,
  TbUserCog,
  TbBook,
  TbStack2,
  TbUsersGroup,
  TbClipboardList,
  TbClipboardCheck,
  TbFileText,
  TbChartBar,
  TbCertificate,
  TbChevronsLeft,
  TbChevronsRight,
  TbChevronRight,
} from "react-icons/tb";
import { obterSecoesPermitidas, PERFIS_GESTORES } from "../dados/permissoes.js";
import { matriculas, conteudos, avaliacoes } from "../dados/dadosMock.js";

const ICONES_SECAO = {
  dashboard:     <TbLayoutDashboard size={18} />,
  usuarios:      <TbUsers size={18} />,
  alunos:        <TbSchool size={18} />,
  professores:   <TbChalkboard size={18} />,
  coordenadores: <TbUserCog size={18} />,
  cursos:        <TbBook size={18} />,
  modulos:       <TbStack2 size={18} />,
  turmas:        <TbUsersGroup size={18} />,
  matriculas:    <TbClipboardList size={18} />,
  avaliacoes:    <TbClipboardCheck size={18} />,
  conteudos:     <TbFileText size={18} />,
  progresso:     <TbChartBar size={18} />,
  certificados:  <TbCertificate size={18} />,
};

/* Definição dos grupos accordion */
const GRUPOS_DEF = {
  pessoas: {
    rotulo: "Usuários",
    Icone:  TbUsersGroup,
    filhos: ["alunos", "professores", "coordenadores"],
  },
  academico: {
    rotulo: "Acadêmico",
    Icone:  TbBook,
    filhos: ["cursos", "modulos", "turmas"],
  },
};

const FILHO_PARA_GRUPO = {
  alunos:        "pessoas",
  professores:   "pessoas",
  coordenadores: "pessoas",
  cursos:        "academico",
  modulos:       "academico",
  turmas:        "academico",
};

export default function BarraLateral({ usuario, secaoAtual, onMudarSecao, aberta, onFechar }) {
  const [recolhida, setRecolhida] = useState(
    () => localStorage.getItem("coderyse-sidebar") === "recolhida"
  );
  const [hovering, setHovering] = useState(false);
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

  function toggleGrupo(chave) {
    setExpandidos((prev) => {
      const prox = new Set(prev);
      prox.has(chave) ? prox.delete(chave) : prox.add(chave);
      return prox;
    });
  }

  const itensMenu = obterSecoesPermitidas(usuario.tipo);

  const pendentes = PERFIS_GESTORES.has(usuario.tipo)
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
      if (filhosVisiveis.length >= 2) {
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
                      onClick={() => toggleGrupo(chave)}
                      aria-expanded={aberto}
                      aria-controls={`sidebar-grupo-${chave}`}
                      title={rotulo}
                      type="button"
                    >
                      <span className="sidebar__item-icone" aria-hidden="true">
                        <Icone size={18} />
                      </span>
                      <span className="sidebar__item-rotulo">{rotulo}</span>
                      <TbChevronRight
                        size={14}
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
                              onClick={() => { onMudarSecao(filho.chave); onFechar?.(); }}
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
                    onClick={() => { onMudarSecao(item.chave); onFechar?.(); }}
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
          <div className="sidebar__usuario">
            <div className="topbar__avatar" aria-hidden="true">
              {gerarIniciais(usuario.nome)}
            </div>
            <div className="sidebar__usuario-info">
              <span className="sidebar__usuario-nome">{usuario.nome.split(" ")[0]}</span>
              <span className="sidebar__usuario-tipo">{usuario.tipo}</span>
            </div>
          </div>

          <button
            className="sidebar__toggle"
            onClick={() => setRecolhida((v) => !v)}
            aria-label={recolhida ? "Expandir menu lateral" : "Recolher menu lateral"}
            title={recolhida ? "Expandir menu" : "Recolher menu"}
            type="button"
          >
            {recolhida
              ? <TbChevronsRight size={16} aria-hidden="true" />
              : <TbChevronsLeft  size={16} aria-hidden="true" />
            }
          </button>
        </footer>
      </aside>
    </>
  );
}
