import CartaoEstatistica from "../../componentes/CartaoEstatistica.jsx";
import Insignia from "../../componentes/Insignia.jsx";
import { usuarios, matriculas, estatisticasAdmin } from "../../dados/dadosMock.js";

export default function TelaDashboardAdmin({ usuario, onMudarSecao }) {
  const ultimosUsuarios = usuarios.slice(-5).reverse();
  const matriculasPendentes = matriculas.filter((m) => m.status === "Pendente");

  return (
    <div className="dashboard-admin">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Painel Administrativo</h2>
          <p className="cabecalho-pagina__subtitulo">
            Visao geral da plataforma com usuarios, cursos, matriculas e metricas.
          </p>
        </div>
        <Insignia texto="Admin" variante="erro" />
      </header>

      <section aria-labelledby="titulo-stats-admin">
        <h2 className="visualmente-oculto" id="titulo-stats-admin">Metricas gerais da plataforma</h2>
        <div className="grade-estatisticas">
          <CartaoEstatistica icone="US" valor={estatisticasAdmin.totalUsuarios} rotulo="Total de usuarios" />
          <CartaoEstatistica icone="AL" valor={estatisticasAdmin.totalAlunos} rotulo="Alunos cadastrados" corBorda="var(--cor-sucesso)" />
          <CartaoEstatistica icone="PR" valor={estatisticasAdmin.totalProfessores} rotulo="Professores ativos" corBorda="var(--cor-info)" />
          <CartaoEstatistica icone="CO" valor={estatisticasAdmin.totalCoordenadores} rotulo="Coordenadores" corBorda="var(--cor-marca)" />
          <CartaoEstatistica icone="CU" valor={estatisticasAdmin.totalCursos} rotulo="Cursos disponiveis" />
          <CartaoEstatistica icone="TU" valor={estatisticasAdmin.totalTurmasAtivas} rotulo="Turmas ativas" corBorda="var(--cor-sucesso)" />
          <CartaoEstatistica icone="MA" valor={estatisticasAdmin.matriculasPendentes} rotulo="Matriculas pendentes" corBorda="var(--cor-aviso)" />
          <CartaoEstatistica icone="TX" valor={`${estatisticasAdmin.taxaConclusao}%`} rotulo="Taxa de conclusao" corBorda="var(--cor-info)" />
        </div>
      </section>

      <div className="grade-2" style={{ marginTop: "var(--espaco-xl)" }}>
        <section className="painel-secao" aria-labelledby="titulo-ultimos-usuarios">
          <header className="painel-secao__cabecalho">
            <h2 className="painel-secao__titulo" id="titulo-ultimos-usuarios">Ultimos Usuarios</h2>
            <button className="botao botao--primario botao--pequeno" onClick={() => onMudarSecao("usuarios")}>
              + Novo usuario
            </button>
          </header>
          <div className="painel-secao__conteudo">
            <ul className="lista-usuarios" role="list">
              {ultimosUsuarios.map((usr) => (
                <li key={usr.id} className="item-usuario">
                  <div className="topbar__avatar item-usuario__avatar" aria-hidden="true">
                    {usr.nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
                  </div>
                  <div className="item-usuario__info">
                    <strong>{usr.nome}</strong>
                    <span>{usr.email}</span>
                  </div>
                  <div className="item-usuario__meta">
                    <Insignia texto={usr.tipo} variante="marca" />
                    <Insignia texto={usr.ativo ? "Ativo" : "Inativo"} variante={usr.ativo ? "sucesso" : "erro"} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="painel-secao" aria-labelledby="titulo-matriculas-admin">
          <header className="painel-secao__cabecalho">
            <h2 className="painel-secao__titulo" id="titulo-matriculas-admin">
              Matriculas Pendentes
              {matriculasPendentes.length > 0 && (
                <span className="insignia insignia--aviso" style={{ marginLeft: "8px" }}>
                  {matriculasPendentes.length}
                </span>
              )}
            </h2>
            <button className="botao botao--fantasma botao--pequeno" onClick={() => onMudarSecao("matriculas")}>
              Ver todas
            </button>
          </header>
          <div className="painel-secao__conteudo">
            {matriculasPendentes.length === 0 ? (
              <p className="texto-vazio">Nenhuma matricula pendente.</p>
            ) : (
              <ul className="lista-matriculas" role="list">
                {matriculasPendentes.map((mat) => (
                  <li key={mat.id} className="item-matricula">
                    <div className="item-matricula__info">
                      <strong>{mat.alunoNome}</strong>
                      <span>{mat.cursoTitulo}</span>
                    </div>
                    <div className="item-matricula__acoes">
                      <button className="botao botao--sucesso botao--pequeno">Aprovar</button>
                      <button className="botao botao--perigo botao--pequeno" aria-label={`Rejeitar matricula de ${mat.alunoNome}`}>
                        X
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <section className="painel-secao" style={{ marginTop: "var(--espaco-xl)" }} aria-labelledby="titulo-acesso-rapido">
        <header className="painel-secao__cabecalho">
          <h2 className="painel-secao__titulo" id="titulo-acesso-rapido">Acesso Rapido</h2>
        </header>
        <div className="painel-secao__conteudo">
          <ul className="grade-acesso-rapido" role="list">
            {[
              { secao: "usuarios", icone: "US", rotulo: "Usuarios" },
              { secao: "cursos", icone: "CU", rotulo: "Cursos" },
              { secao: "modulos", icone: "MO", rotulo: "Modulos" },
              { secao: "turmas", icone: "TU", rotulo: "Turmas" },
              { secao: "matriculas", icone: "MA", rotulo: "Matriculas" },
              { secao: "avaliacoes", icone: "AV", rotulo: "Avaliacoes" },
              { secao: "conteudos", icone: "KD", rotulo: "Conteudos" },
            ].map((item) => (
              <li key={item.secao}>
                <button
                  className="botao-acesso-rapido"
                  onClick={() => onMudarSecao(item.secao)}
                  aria-label={`Ir para ${item.rotulo}`}
                >
                  <span aria-hidden="true">{item.icone}</span>
                  <span>{item.rotulo}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
