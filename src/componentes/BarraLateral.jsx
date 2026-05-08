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
} from "react-icons/tb";
import { obterSecoesPermitidas } from "../dados/permissoes.js";

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

export default function BarraLateral({ usuario, secaoAtual, onMudarSecao, aberta, onFechar }) {
  /* Retorna apenas as seções que o papel do usuário tem permissão de acessar */
  const itensMenu = obterSecoesPermitidas(usuario.tipo);

  /* Extrai até duas iniciais do nome completo para o avatar textual */
  function gerarIniciais(nome) {
    return nome
      .split(" ")
      .slice(0, 2)
      .map((parte) => parte[0])
      .join("")
      .toUpperCase();
  }

  return (
    <>
      {/* Overlay escurece o fundo e fecha o menu ao clicar fora em mobile */}
      {aberta && (
        <div
          className="sidebar-overlay"
          onClick={onFechar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${aberta ? "sidebar--aberta" : ""}`}
        aria-label="Menu de navegação principal"
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
          <p className="sidebar__secao-titulo">Menu do workspace</p>

          {/* ul semântica para lista de itens de navegação */}
          <ul className="sidebar__lista" role="list">
            {itensMenu.map((item) => (
              <li key={item.chave}>
                <button
                  className={`sidebar__item ${secaoAtual === item.chave ? "sidebar__item--ativo" : ""}`}
                  onClick={() => {
                    onMudarSecao(item.chave);
                    /* onFechar?.() — chamada opcional: só fecha sidebar se a prop existir (mobile) */
                    onFechar?.();
                  }}
                  aria-current={secaoAtual === item.chave ? "page" : undefined}
                  type="button"
                >
                  <span className="sidebar__item-icone" aria-hidden="true">{ICONES_SECAO[item.chave]}</span>
                  <span>{item.rotulo}</span>
                </button>
              </li>
            ))}
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
        </footer>
      </aside>
    </>
  );
}
