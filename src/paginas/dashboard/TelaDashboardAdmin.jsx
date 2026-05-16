import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Insignia from "@/componentes/Insignia.jsx";
import Botao from "@/componentes/Botao.jsx";
import { db, resetar } from "@/dados/db.js";
import { estatisticasAdmin } from "@/dados/dadosMock.js";

const MESES_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function gerarDados6Meses(matriculas) {
  const datas = matriculas.map((m) => new Date(m.dataSolicitacao + "T00:00:00"));
  const base = datas.length > 0 ? new Date(Math.max(...datas)) : new Date();

  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(base.getFullYear(), base.getMonth() - (5 - i), 1);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return {
      mes: MESES_PT[d.getMonth()],
      total: matriculas.filter((m) => m.dataSolicitacao.startsWith(chave)).length,
    };
  });
}

export default function TelaDashboardAdmin({ usuario, onMudarSecao, onToast }) {
  const [todosUsuarios]    = useState(() => db.usuarios.listar());
  const [listaMatriculas]  = useState(() => db.matriculas.listar());
  const [confirmandoReset, setConfirmandoReset] = useState(false);

  const matriculasPendentes = listaMatriculas.filter((m) => m.status === "Pendente");
  const totalAtivos         = todosUsuarios.filter((u) => u.ativo).length;

  function executarReset() {
    resetar();
    window.location.reload();
  }

  const kpis = [
    {
      rotulo: "Usuários",
      valor: todosUsuarios.length,
      detalhe: `${totalAtivos} ativos`,
    },
    {
      rotulo: "Alunos ativos",
      valor: todosUsuarios.filter((u) => u.tipo === "Aluno" && u.ativo).length,
      detalhe: `de ${todosUsuarios.filter((u) => u.tipo === "Aluno").length} matriculados`,
    },
    {
      rotulo: "Matrículas pend.",
      valor: matriculasPendentes.length,
      detalhe: "aguardando análise",
      destaque: matriculasPendentes.length > 0,
    },
    {
      rotulo: "Taxa de conclusão",
      valor: `${estatisticasAdmin.taxaConclusao}%`,
      detalhe: "média geral",
    },
  ];

  const dadosGrafico = gerarDados6Meses(listaMatriculas);
  const maxTotal = Math.max(...dadosGrafico.map((d) => d.total), 1);

  const acessoRapido = [
    { secao: "usuarios",   icone: "US", rotulo: "Usuários"   },
    { secao: "cursos",     icone: "CU", rotulo: "Cursos"     },
    { secao: "modulos",    icone: "MO", rotulo: "Módulos"    },
    { secao: "turmas",     icone: "TU", rotulo: "Turmas"     },
    { secao: "matriculas", icone: "MA", rotulo: "Matrículas" },
    { secao: "avaliacoes", icone: "AV", rotulo: "Avaliações" },
    { secao: "conteudos",  icone: "KD", rotulo: "Conteúdos" },
  ];

  return (
    <div className="dashboard-admin">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Painel Administrativo</h2>
          <p className="cabecalho-pagina__subtitulo">Visão geral da plataforma</p>
        </div>
        <Insignia texto="Admin" variante="erro" />
      </header>

      {/* KPI cards */}
      <section aria-label="Métricas gerais da plataforma">
        <dl className="admin-kpis">
          {kpis.map((kpi) => (
            <div key={kpi.rotulo} className={`admin-kpi${kpi.destaque ? " admin-kpi--destaque" : ""}`}>
              <dt className="admin-kpi__rotulo">{kpi.rotulo}</dt>
              <dd className="admin-kpi__valor">{kpi.valor}</dd>
              <p className="admin-kpi__detalhe">{kpi.detalhe}</p>
            </div>
          ))}
        </dl>
      </section>

      {/* Matrículas pendentes + Acesso Rápido */}
      <div className="grade-2" style={{ marginTop: "var(--espaco-lg)" }}>
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
                {matriculasPendentes.slice(0, 5).map((mat) => (
                  <li key={mat.id} className="item-matricula">
                    <div className="item-matricula__info">
                      <strong>{mat.alunoNome}</strong>
                      <span>{mat.cursoTitulo} · {mat.turmaNome}</span>
                    </div>
                    <Insignia texto="Pendente" variante="neutro" />
                  </li>
                ))}
                {matriculasPendentes.length > 5 && (
                  <li className="admin-lista-mais">
                    <button type="button" onClick={() => onMudarSecao("matriculas")}>
                      +{matriculasPendentes.length - 5} mais →
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>
        </section>

        <section className="painel-secao" aria-labelledby="titulo-acesso-rapido">
          <header className="painel-secao__cabecalho">
            <h2 className="painel-secao__titulo" id="titulo-acesso-rapido">Acesso Rápido</h2>
          </header>
          <div className="painel-secao__conteudo">
            <ul className="grade-acesso-rapido" role="list">
              {acessoRapido.map((item) => (
                <li key={item.secao}>
                  <button
                    className="botao-acesso-rapido"
                    onClick={() => onMudarSecao(item.secao)}
                    aria-label={`Ir para ${item.rotulo}`}
                    type="button"
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

      {/* Gráfico — Matrículas nos últimos 6 meses */}
      <section className="painel-secao" style={{ marginTop: "var(--espaco-lg)" }} aria-labelledby="titulo-grafico-matriculas">
        <header className="painel-secao__cabecalho">
          <h2 className="painel-secao__titulo" id="titulo-grafico-matriculas">Matrículas por mês</h2>
          <span className="admin-grafico-subtitulo">últimos 6 meses</span>
        </header>
        <div className="painel-secao__conteudo admin-grafico-wrapper">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dadosGrafico} barCategoryGap="30%" margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="mes"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--cor-texto-suave)", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--cor-texto-mudo)", fontSize: 11 }}
                width={36}
              />
              <Tooltip
                cursor={{ fill: "rgba(157,103,255,0.08)" }}
                contentStyle={{
                  background: "var(--cor-cartao)",
                  border: "1px solid var(--cor-borda)",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  color: "var(--cor-texto-forte)",
                }}
                formatter={(v) => [v, "Matrículas"]}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {dadosGrafico.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.total === maxTotal ? "#9d67ff" : "rgba(157,103,255,0.35)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Dados de Demonstração */}
      <section
        className="painel-secao painel-secao--perigo"
        style={{ marginTop: "var(--espaco-lg)" }}
        aria-labelledby="titulo-reset-dados"
      >
        <header className="painel-secao__cabecalho">
          <h2 className="painel-secao__titulo" id="titulo-reset-dados">Dados de Demonstração</h2>
        </header>
        <div className="painel-secao__conteudo">
          {!confirmandoReset ? (
            <div className="reset-demo">
              <p className="reset-demo__descricao">
                Restaura todos os dados ao estado inicial. Use antes de uma apresentação para garantir dados limpos.
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
    </div>
  );
}
