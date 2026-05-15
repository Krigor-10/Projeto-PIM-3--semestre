import { useState } from "react";
import Insignia from "@/componentes/Insignia.jsx";
import Botao from "@/componentes/Botao.jsx";
import { usuarios, matriculas, estatisticasAdmin } from "@/dados/dadosMock.js";
import { resetar } from "@/dados/db.js";

export default function TelaDashboardAdmin({ usuario, onMudarSecao, onToast }) {
  const [listaMatriculas, setListaMatriculas] = useState(matriculas);
  const [confirmandoReset, setConfirmandoReset] = useState(false);

  function executarReset() {
    resetar();
    window.location.reload();
  }

  const ultimosUsuarios = usuarios.slice(-5).reverse();
  const matriculasPendentes = listaMatriculas.filter((m) => m.status === "Pendente");

  function aprovar(id, nomeAluno) {
    setListaMatriculas((prev) => prev.map((m) => m.id === id ? { ...m, status: "Aprovada" } : m));
    onToast?.(`Matrícula de ${nomeAluno} aprovada com sucesso.`, "sucesso");
  }

  function rejeitar(id, nomeAluno) {
    setListaMatriculas((prev) => prev.map((m) => m.id === id ? { ...m, status: "Rejeitada" } : m));
    onToast?.(`Matrícula de ${nomeAluno} rejeitada.`, "erro");
  }

  return (
    <div className="dashboard-admin">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Painel Administrativo</h2>
          <p className="cabecalho-pagina__subtitulo">
            Visão geral da plataforma com usuários, cursos, matrículas e métricas.
          </p>
        </div>
        <Insignia texto="Admin" variante="erro" />
      </header>

      <section aria-labelledby="titulo-stats-admin">
        <h2 className="visualmente-oculto" id="titulo-stats-admin">Métricas gerais da plataforma</h2>
        <dl className="gerencial-stats-barra" aria-label="Métricas gerais da plataforma">
          <div><dt>Usuários</dt><dd>{estatisticasAdmin.totalUsuarios}</dd></div>
          <div><dt>Alunos</dt><dd>{estatisticasAdmin.totalAlunos}</dd></div>
          <div><dt>Professores</dt><dd>{estatisticasAdmin.totalProfessores}</dd></div>
          <div><dt>Coordenadores</dt><dd>{estatisticasAdmin.totalCoordenadores}</dd></div>
          <div><dt>Cursos</dt><dd>{estatisticasAdmin.totalCursos}</dd></div>
          <div><dt>Turmas</dt><dd>{estatisticasAdmin.totalTurmasAtivas}</dd></div>
          <div><dt>Matrículas pend.</dt><dd>{estatisticasAdmin.matriculasPendentes}</dd></div>
          <div><dt>Conclusão</dt><dd>{estatisticasAdmin.taxaConclusao}%</dd></div>
        </dl>
      </section>

      <div className="grade-2" style={{ marginTop: "var(--espaco-xl)" }}>
        <section className="painel-secao" aria-labelledby="titulo-ultimos-usuarios">
          <header className="painel-secao__cabecalho">
            <h2 className="painel-secao__titulo" id="titulo-ultimos-usuarios">Últimos Usuários</h2>
            <Botao variante="primario" tamanho="pequeno" onClick={() => onMudarSecao("usuarios")}>
              + Novo usuário
            </Botao>
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
              Matrículas Pendentes
              {matriculasPendentes.length > 0 && (
                <span className="insignia insignia--aviso" style={{ marginLeft: "8px" }}>
                  {matriculasPendentes.length}
                </span>
              )}
            </h2>
            <Botao variante="fantasma" tamanho="pequeno" onClick={() => onMudarSecao("matriculas")}>
              Ver todas
            </Botao>
          </header>
          <div className="painel-secao__conteudo">
            {matriculasPendentes.length === 0 ? (
              <p className="texto-vazio">Nenhuma matrícula pendente.</p>
            ) : (
              <ul className="lista-matriculas" role="list">
                {matriculasPendentes.map((mat) => (
                  <li key={mat.id} className="item-matricula">
                    <div className="item-matricula__info">
                      <strong>{mat.alunoNome}</strong>
                      <span>{mat.cursoTitulo}</span>
                    </div>
                    <div className="item-matricula__acoes">
                      <Botao variante="sucesso" tamanho="pequeno" onClick={() => aprovar(mat.id, mat.alunoNome)}>Aprovar</Botao>
                      <Botao variante="perigo" tamanho="pequeno" onClick={() => rejeitar(mat.id, mat.alunoNome)} aria-label={`Rejeitar matrícula de ${mat.alunoNome}`}>
                        Rejeitar
                      </Botao>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <section className="painel-secao painel-secao--perigo" style={{ marginTop: "var(--espaco-xl)" }} aria-labelledby="titulo-reset-dados">
        <header className="painel-secao__cabecalho">
          <h2 className="painel-secao__titulo" id="titulo-reset-dados">Dados de Demonstração</h2>
        </header>
        <div className="painel-secao__conteudo">
          {!confirmandoReset ? (
            <div className="reset-demo">
              <p className="reset-demo__descricao">
                Restaura todos os dados ao estado inicial do mock. Use antes de uma demonstração para garantir dados limpos.
              </p>
              <Botao variante="perigo" tamanho="pequeno" onClick={() => setConfirmandoReset(true)}>
                Resetar dados
              </Botao>
            </div>
          ) : (
            <div className="reset-demo reset-demo--confirmando">
              <p className="reset-demo__aviso">
                Todos os dados criados ou editados serão perdidos. Esta ação não pode ser desfeita.
              </p>
              <div className="reset-demo__acoes">
                <Botao variante="fantasma" tamanho="pequeno" onClick={() => setConfirmandoReset(false)}>
                  Cancelar
                </Botao>
                <Botao variante="perigo" tamanho="pequeno" onClick={executarReset}>
                  Confirmar reset
                </Botao>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="painel-secao" style={{ marginTop: "var(--espaco-xl)" }} aria-labelledby="titulo-acesso-rapido">
        <header className="painel-secao__cabecalho">
          <h2 className="painel-secao__titulo" id="titulo-acesso-rapido">Acesso Rápido</h2>
        </header>
        <div className="painel-secao__conteudo">
          <ul className="grade-acesso-rapido" role="list">
            {[
              { secao: "usuarios", icone: "US", rotulo: "Usuários" },
              { secao: "cursos", icone: "CU", rotulo: "Cursos" },
              { secao: "modulos", icone: "MO", rotulo: "Módulos" },
              { secao: "turmas", icone: "TU", rotulo: "Turmas" },
              { secao: "matriculas", icone: "MA", rotulo: "Matrículas" },
              { secao: "avaliacoes", icone: "AV", rotulo: "Avaliações" },
              { secao: "conteudos", icone: "KD", rotulo: "Conteúdos" },
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
