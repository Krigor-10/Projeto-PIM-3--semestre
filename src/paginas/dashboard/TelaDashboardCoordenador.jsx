/* ============================================================
   TelaDashboardCoordenador — Painel inicial do coordenador
   Exibe KPIs acadêmicos e lista resumida das turmas ativas.
   Estatísticas vêm de dadosMock.js (estatisticasCoordenador).
   ============================================================ */
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import CartaoEstatistica from "@/componentes/CartaoEstatistica.jsx";
import Insignia from "@/componentes/Insignia.jsx";
import Botao from "@/componentes/Botao.jsx";
import { MdMenuBook, MdGroups, MdSchool } from "react-icons/md";
import { turmas, cursos, modulos, matriculas, PROGRESSO_MOCK, estatisticasCoordenador } from "@/dados/dadosMock.js";

export default function TelaDashboardCoordenador({ usuario, onMudarSecao }) {
  /* Limita a 4 turmas no painel — o restante fica em Turmas */
  const turmasAtivas = turmas.filter((t) => t.status === "Ativa").slice(0, 4);

  /* Progresso estático por curso — usado quando não há matrículas aprovadas com dados reais */
  const PROGRESSO_CURSO_FALLBACK = { 1: 28, 2: 61, 3: 44, 4: 73 };

  /* Dados do gráfico: progresso médio por curso sob coordenação */
  const meusCursos = cursos.filter((c) => c.coordenadorId === usuario.id);
  const dadosGrafico = meusCursos.map((curso) => {
    const turmasDoCurso = turmas.filter((t) => t.cursoId === curso.id);
    const alunos = matriculas.filter(
      (m) => turmasDoCurso.some((t) => t.id === m.turmaId) && m.status === "Aprovada"
    );
    const media = alunos.length > 0
      ? Math.round(alunos.reduce((acc, m) => acc + (PROGRESSO_MOCK[m.id] ?? 0), 0) / alunos.length)
      : (PROGRESSO_CURSO_FALLBACK[curso.id] ?? 0);
    const nome = curso.titulo.length > 16 ? curso.titulo.slice(0, 14) + "…" : curso.titulo;
    return { nome, progresso: media };
  });
  const maxProgresso = dadosGrafico.length > 0 ? Math.max(...dadosGrafico.map((d) => d.progresso)) : 0;

  return (
    <main className="dashboard-coordenador">
      <header className="cabecalho-pagina">
        <div>
          <h1 className="cabecalho-pagina__titulo">Olá, {usuario.nome.split(" ")[0]}</h1>
          <p className="cabecalho-pagina__subtitulo">
            Acompanhe turmas, cursos e indicadores acadêmicos.
          </p>
        </div>
        <Insignia texto="Coordenador" variante="aviso" />
      </header>

      <section aria-labelledby="titulo-stats-coord">
        <h2 className="visualmente-oculto" id="titulo-stats-coord">Indicadores acadêmicos</h2>
        <div className="grade-estatisticas">
          <CartaoEstatistica icone={<MdMenuBook size={22} />} valor={estatisticasCoordenador.totalCursos} rotulo="Cursos disponíveis" />
          <CartaoEstatistica icone={<MdGroups size={22} />}  valor={estatisticasCoordenador.totalTurmas} rotulo="Turmas ativas"     corBorda="var(--cor-sucesso)" />
          <CartaoEstatistica icone={<MdSchool size={22} />}  valor={estatisticasCoordenador.totalAlunos} rotulo="Total de alunos"   corBorda="var(--cor-info)" />
        </div>
      </section>

      {/* Gráfico — Progresso médio por curso */}
      {dadosGrafico.length > 0 && (
        <section className="painel-secao" style={{ marginTop: "var(--espaco-lg)" }} aria-labelledby="titulo-grafico-coord">
          <header className="painel-secao__cabecalho">
            <h2 className="painel-secao__titulo" id="titulo-grafico-coord">Progresso médio por curso</h2>
            <span className="admin-grafico-subtitulo">% médio dos alunos matriculados</span>
          </header>
          <div className="painel-secao__conteudo admin-grafico-wrapper">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosGrafico} barCategoryGap="30%" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="nome"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--cor-texto-suave)", fontSize: 11 }}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--cor-texto-mudo)", fontSize: 11 }}
                  width={42}
                  tickFormatter={(v) => `${v}%`}
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
                  formatter={(v) => [`${v}%`, "Progresso médio"]}
                />
                <Bar dataKey="progresso" radius={[4, 4, 0, 0]}>
                  {dadosGrafico.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.progresso === maxProgresso ? "#9d67ff" : "rgba(157,103,255,0.35)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="painel-secao" style={{ marginTop: "var(--espaco-xl)" }} aria-labelledby="titulo-turmas-coord">
        <header className="painel-secao__cabecalho">
          <h2 className="painel-secao__titulo" id="titulo-turmas-coord">Turmas Ativas</h2>
          <Botao variante="fantasma" tamanho="pequeno" onClick={() => onMudarSecao("turmas")}>
            Ver todas
          </Botao>
        </header>
        <div className="painel-secao__conteudo">
          <ul className="lista-turmas" role="list">
            {turmasAtivas.map((turma) => (
              <li key={turma.id} className="item-turma">
                <div className="item-turma__info">
                  <strong className="item-turma__nome">{turma.nomeTurma}</strong>
                  <span className="item-turma__curso">{turma.professorNome}</span>
                </div>
                <div className="item-turma__meta">
                  <span>{turma.totalAlunos} alunos</span>
                  <Insignia texto={turma.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
