import { obterSecoesPermitidas } from "../dados/permissoes.js";

export default function BarraLateral({ usuario, secaoAtual, onMudarSecao, aberta, onFechar }) {
  const itensMenu = obterSecoesPermitidas(usuario.tipo);

  function iniciais(nome) {
    return nome
      .split(" ")
      .slice(0, 2)
      .map((parte) => parte[0])
      .join("")
      .toUpperCase();
  }

  return (
    <>
      {aberta && (
        <div
          className="sidebar-overlay"
          onClick={onFechar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${aberta ? "sidebar--aberta" : ""}`}
        aria-label="Menu de navegacao principal"
      >
        <a
          href="#conteudo-principal"
          className="sidebar__logo"
          aria-label="CodeRyse Academy - ir para o painel"
        >
          <span className="sidebar__logo-marca" aria-hidden="true">
            <span>Code</span>
            <span>Ryse</span>
          </span>
          <span className="sidebar__logo-subtitulo">Academy</span>
        </a>

        <nav className="sidebar__nav" aria-label="Navegacao principal">
          <p className="sidebar__secao-titulo">Menu do workspace</p>
          {itensMenu.map((item) => (
            <button
              key={item.chave}
              className={`sidebar__item ${secaoAtual === item.chave ? "sidebar__item--ativo" : ""}`}
              onClick={() => {
                onMudarSecao(item.chave);
                onFechar?.();
              }}
              aria-current={secaoAtual === item.chave ? "page" : undefined}
              type="button"
            >
              <span className="sidebar__item-icone" aria-hidden="true">{item.icone}</span>
              <span>{item.rotulo}</span>
            </button>
          ))}
        </nav>

        <footer className="sidebar__rodape">
          <div className="sidebar__usuario">
            <div className="topbar__avatar" aria-hidden="true">
              {iniciais(usuario.nome)}
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
