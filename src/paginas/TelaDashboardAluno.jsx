import CartaoEstatistica from "../componentes/CartaoEstatistica.jsx";
import BarraProgresso from "../componentes/BarraProgresso.jsx";
import Insignia from "../componentes/Insignia.jsx";
import { progressoAluno, avaliacoes, conteudos } from "../dados/dadosMock.js";

export default function TelaDashboardAluno({ usuario, onMudarSecao }) {
  const cursoPrincipal = progressoAluno.cursos[0];
  const avaliacoesPendentes = avaliacoes.filter((a) => a.status === "Publicada").slice(0, 3);
  const proximosConteudos = conteudos.filter((c) => !c.concluido).slice(0, 4);

  function tipoConteudo(tipo) {
    if (tipo === "Video") return "VD";
    if (tipo === "Texto") return "TX";
    return "AR";
  }

  return (
    <div className="dashboard-aluno">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Ola, {usuario.nome.split(" ")[0]}</h2>
          <p className="cabecalho-pagina__subtitulo">
            Continue de onde parou e acompanhe sua trilha academica.
          </p>
        </div>
        <Insignia texto="Aluno" variante="marca" />
      </header>

      <section aria-labelledby="titulo-stats-aluno">
        <h2 className="visualmente-oculto" id="titulo-stats-aluno">Resumo de atividades</h2>
        <div className="grade-estatisticas">
          <CartaoEstatistica icone="CU" valor="1" rotulo="Curso em andamento" />
          <CartaoEstatistica icone="OK" valor="3" rotulo="Conteudos concluidos" corBorda="var(--cor-sucesso)" />
          <CartaoEstatistica icone="AV" valor="3" rotulo="Avaliacoes disponiveis" corBorda="var(--cor-aviso)" />
          <CartaoEstatistica icone="PR" valor="42%" rotulo="Progresso geral" corBorda="var(--cor-info)" />
        </div>
      </section>

      {cursoPrincipal && (
        <section className="painel-secao" aria-labelledby="titulo-progresso-curso" style={{ marginTop: "var(--espaco-xl)" }}>
          <header className="painel-secao__cabecalho">
            <h2 className="painel-secao__titulo" id="titulo-progresso-curso">Curso em Andamento</h2>
            <button
              className="botao botao--fantasma botao--pequeno"
              onClick={() => onMudarSecao("progresso")}
            >
              Ver progresso completo
            </button>
          </header>
          <div className="painel-secao__conteudo">
            <div className="cartao-curso-ativo">
              <div className="cartao-curso-ativo__info">
                <h3 className="cartao-curso-ativo__titulo">{cursoPrincipal.cursoTitulo}</h3>
                <p className="cartao-curso-ativo__meta">
                  Ultimo acesso: {new Date(cursoPrincipal.ultimoAcesso).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="cartao-curso-ativo__progresso">
                <BarraProgresso percentual={cursoPrincipal.percentual} />
              </div>
            </div>

            <ul className="lista-modulos" role="list" aria-label="Progresso por modulo">
              {progressoAluno.modulos.map((mod) => (
                <li key={mod.moduloId} className="item-modulo">
                  <div className="item-modulo__info">
                    <span className="item-modulo__titulo">{mod.moduloTitulo}</span>
                    <Insignia texto={mod.status} />
                  </div>
                  <BarraProgresso percentual={mod.percentual} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="grade-2" style={{ marginTop: "var(--espaco-xl)" }}>
        <section className="painel-secao" aria-labelledby="titulo-proximos-conteudos">
          <header className="painel-secao__cabecalho">
            <h2 className="painel-secao__titulo" id="titulo-proximos-conteudos">Proximos Conteudos</h2>
            <button className="botao botao--fantasma botao--pequeno" onClick={() => onMudarSecao("conteudos")}>
              Ver todos
            </button>
          </header>
          <div className="painel-secao__conteudo">
            <ul className="lista-conteudos" role="list">
              {proximosConteudos.map((conteudo) => (
                <li key={conteudo.id} className="item-conteudo">
                  <span className="item-conteudo__icone" aria-hidden="true">
                    {tipoConteudo(conteudo.tipo)}
                  </span>
                  <div className="item-conteudo__info">
                    <span className="item-conteudo__titulo">{conteudo.titulo}</span>
                    <span className="item-conteudo__meta">{conteudo.tipo} - {conteudo.duracao}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="painel-secao" aria-labelledby="titulo-avaliacoes-aluno">
          <header className="painel-secao__cabecalho">
            <h2 className="painel-secao__titulo" id="titulo-avaliacoes-aluno">Avaliacoes Disponiveis</h2>
            <button className="botao botao--fantasma botao--pequeno" onClick={() => onMudarSecao("avaliacoes")}>
              Ver todas
            </button>
          </header>
          <div className="painel-secao__conteudo">
            <ul className="lista-avaliacoes" role="list">
              {avaliacoesPendentes.map((av) => (
                <li key={av.id} className="item-avaliacao">
                  <div className="item-avaliacao__info">
                    <span className="item-avaliacao__titulo">{av.titulo}</span>
                    <span className="item-avaliacao__meta">
                      {av.totalQuestoes} questoes - {av.tempoLimiteMinutos}min
                    </span>
                  </div>
                  <button className="botao botao--primario botao--pequeno">
                    Iniciar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
