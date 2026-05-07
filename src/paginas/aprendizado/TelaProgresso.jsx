import BarraProgresso from "../../componentes/BarraProgresso.jsx";
import Insignia from "../../componentes/Insignia.jsx";
import { conteudos, cursos, modulos, matriculas } from "../../dados/dadosMock.js";

/* Percentuais simulados por id de matrícula para a vista administrativa */
const PROGRESSO_MOCK = { 1: 42, 2: 15, 6: 68 };

/* Retorna status e variante de badge a partir do progresso do módulo */
function resolverStatusModulo(concluidosModulo, totalItens) {
  if (totalItens === 0) return { texto: "Vazio",        variante: "neutro"  };
  if (concluidosModulo === 0)         return { texto: "Não iniciado", variante: "neutro"  };
  if (concluidosModulo === totalItens) return { texto: "Concluído",   variante: "sucesso" };
  return                                     { texto: "Em andamento", variante: "info"    };
}

/* Definição das conquistas desbloqueáveis */
function gerarConquistas(totalConcluidos, modulosConcluidos, percentualGeral) {
  return [
    {
      id: "primeiro-passo",
      icone: "✦",
      titulo: "Primeiro passo",
      descricao: "Concluiu o 1º conteúdo",
      desbloqueada: totalConcluidos >= 1,
    },
    {
      id: "em-ritmo",
      icone: "◆",
      titulo: "Em ritmo",
      descricao: "5 conteúdos concluídos",
      desbloqueada: totalConcluidos >= 5,
    },
    {
      id: "modulo-completo",
      icone: "◎",
      titulo: "Módulo completo",
      descricao: "Finalizou um módulo inteiro",
      desbloqueada: modulosConcluidos >= 1,
    },
    {
      id: "metade",
      icone: "⬟",
      titulo: "Metade do caminho",
      descricao: "50% do curso concluído",
      desbloqueada: percentualGeral >= 50,
    },
  ];
}

/* ── Vista do Aluno ──────────────────────────────────────────── */

function VistaAluno({ usuario, avaliacaoAprovada = false }) {
  const matricula = matriculas.find(
    (m) => m.alunoId === usuario?.id && m.status === "Aprovada"
  );
  const curso = matricula ? cursos.find((c) => c.id === matricula.cursoId) : null;

  const modulosDoCurso = matricula
    ? modulos
        .filter((m) => m.cursoId === matricula.cursoId)
        .sort((a, b) => a.ordem - b.ordem)
    : [];

  const conteudosDoCurso = matricula
    ? conteudos.filter((c) => modulosDoCurso.some((m) => m.id === c.moduloId))
    : [];

  const totalConteudos   = conteudosDoCurso.length;
  const totalConcluidos  = conteudosDoCurso.filter((c) => c.concluido).length;
  /* Percentual geral = concluídos / total × 100, arredondado para inteiro */
  const percentualGeral  = totalConteudos > 0
    ? Math.round((totalConcluidos / totalConteudos) * 100)
    : 0;

  /* Conta módulos onde todos os conteúdos estão marcados como concluídos */
  const modulosConcluidos = modulosDoCurso.filter((modulo) => {
    const itens = conteudosDoCurso.filter((c) => c.moduloId === modulo.id);
    return itens.length > 0 && itens.every((c) => c.concluido);
  }).length;

  const conquistas = gerarConquistas(totalConcluidos, modulosConcluidos, percentualGeral);

  if (!matricula) {
    return (
      <p className="texto-vazio texto-vazio--central" role="status">
        Você não possui matrícula aprovada. Solicite sua matrícula para acompanhar o progresso.
      </p>
    );
  }

  return (
    <div className="tela-progresso">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Meu Progresso</h2>
          <p className="cabecalho-pagina__subtitulo">Acompanhe sua evolução módulo a módulo.</p>
        </div>
      </header>

      {/* Hero do curso */}
      <section className="progresso-hero" aria-label="Visão geral do curso">
        <div className="progresso-hero__info">
          <p className="progresso-hero__turma">{matricula.turmaNome}</p>
          <h3 className="progresso-hero__titulo">{curso?.titulo}</h3>
          <p className="progresso-hero__codigo">{matricula.codigoMatricula}</p>
        </div>
        <div className="progresso-hero__direita">
          <span className="progresso-hero__percentual" aria-label={`${percentualGeral} por cento concluído`}>
            {percentualGeral}%
          </span>
          <BarraProgresso percentual={percentualGeral} />
          <p className="progresso-hero__legenda">
            {totalConcluidos} de {totalConteudos} conteúdos concluídos
          </p>
        </div>
      </section>

      {/* Estatísticas rápidas */}
      <ul className="grade-estat-progresso" role="list" aria-label="Estatísticas do curso">
        <li className="cartao-estat-progresso">
          <span className="cartao-estat-progresso__icone cartao-estat-progresso__icone--sucesso" aria-hidden="true">✓</span>
          <strong className="cartao-estat-progresso__valor">{totalConcluidos}/{totalConteudos}</strong>
          <p className="cartao-estat-progresso__rotulo">Conteúdos concluídos</p>
        </li>
        <li className="cartao-estat-progresso">
          <span className="cartao-estat-progresso__icone cartao-estat-progresso__icone--info" aria-hidden="true">◎</span>
          <strong className="cartao-estat-progresso__valor">{modulosConcluidos}/{modulosDoCurso.length}</strong>
          <p className="cartao-estat-progresso__rotulo">Módulos concluídos</p>
        </li>
        <li className="cartao-estat-progresso">
          <span className="cartao-estat-progresso__icone cartao-estat-progresso__icone--marca" aria-hidden="true">◈</span>
          <strong className="cartao-estat-progresso__valor">{percentualGeral}%</strong>
          <p className="cartao-estat-progresso__rotulo">Progresso geral</p>
        </li>
      </ul>

      {/* Progresso por módulo */}
      <section aria-labelledby="titulo-modulos-progresso">
        <h3 className="secao-progresso__titulo" id="titulo-modulos-progresso">
          Progresso por Módulo
        </h3>
        <ul className="lista-modulos-progresso" role="list">
          {modulosDoCurso.map((modulo) => {
            const itens = conteudosDoCurso.filter((c) => c.moduloId === modulo.id);
            const concluidosModulo = itens.filter((c) => c.concluido).length;
            const percentualModulo = itens.length > 0
              ? Math.round((concluidosModulo / itens.length) * 100)
              : 0;
            const { texto: statusTexto, variante: statusVariante } =
              resolverStatusModulo(concluidosModulo, itens.length);

            return (
              <li key={modulo.id} className="cartao-modulo-progresso">
                <header className="cartao-modulo-progresso__cabecalho">
                  <span className="cartao-modulo-progresso__numero" aria-hidden="true">
                    {modulo.ordem}
                  </span>
                  <div className="cartao-modulo-progresso__info">
                    <h4 className="cartao-modulo-progresso__titulo">{modulo.titulo}</h4>
                    <Insignia texto={statusTexto} variante={statusVariante} />
                  </div>
                  <span
                    className="cartao-modulo-progresso__contagem"
                    aria-label={`${concluidosModulo} de ${itens.length} concluídos`}
                  >
                    {concluidosModulo}/{itens.length}
                  </span>
                </header>

                <div className="cartao-modulo-progresso__barra">
                  <BarraProgresso percentual={percentualModulo} mostrarTexto={false} />
                </div>

                {itens.length > 0 && (
                  <ul className="lista-check-conteudos" role="list" aria-label={`Conteúdos de ${modulo.titulo}`}>
                    {itens.map((cont) => (
                      <li
                        key={cont.id}
                        className={`item-check-conteudo ${cont.concluido ? "item-check-conteudo--ok" : ""}`}
                      >
                        <span
                          className="item-check-conteudo__status"
                          aria-label={cont.concluido ? "Concluído" : "Pendente"}
                          aria-hidden="true"
                        >
                          {cont.concluido ? "✓" : "○"}
                        </span>
                        <span className="item-check-conteudo__titulo">{cont.titulo}</span>
                        <span className="item-check-conteudo__meta">{cont.tipo} · {cont.duracao}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Conquistas */}
      <section aria-labelledby="titulo-conquistas">
        <h3 className="secao-progresso__titulo" id="titulo-conquistas">Conquistas</h3>
        <ul className="grade-conquistas" role="list">
          {conquistas.map((c) => (
            <li
              key={c.id}
              className={`cartao-conquista ${c.desbloqueada ? "cartao-conquista--desbloqueada" : ""}`}
              aria-label={`${c.titulo} — ${c.desbloqueada ? "desbloqueada" : "bloqueada"}`}
            >
              <span className="cartao-conquista__icone" aria-hidden="true">{c.icone}</span>
              <strong className="cartao-conquista__titulo">{c.titulo}</strong>
              <p className="cartao-conquista__descricao">{c.descricao}</p>
              {!c.desbloqueada && (
                <span className="cartao-conquista__cadeado" aria-hidden="true">⊘</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Certificado — visível somente quando 100% concluído e avaliação final aprovada */}
      {percentualGeral === 100 && avaliacaoAprovada && (
        <section className="secao-certificado" aria-labelledby="titulo-certificado">
          <h3 className="secao-progresso__titulo" id="titulo-certificado">Certificado de Conclusão</h3>
          <div className="certificado" role="region" aria-label="Certificado de conclusão do curso">
            <div className="certificado__cabecalho">
              <span className="certificado__logo" aria-hidden="true">◈</span>
              <span className="certificado__plataforma">CodeRyse Academy</span>
            </div>
            <p className="certificado__subtitulo">Certificado de Conclusão</p>
            <p className="certificado__declara">Certificamos que</p>
            <h2 className="certificado__nome">{usuario.nome}</h2>
            <p className="certificado__texto">concluiu com êxito o curso</p>
            <h3 className="certificado__curso">{curso?.titulo}</h3>
            <dl className="certificado__meta">
              <div>
                <dt>Data de conclusão</dt>
                <dd>{new Date().toLocaleDateString("pt-BR")}</dd>
              </div>
              <div>
                <dt>Código de verificação</dt>
                <dd>CR-{matricula.codigoMatricula}-{new Date().getFullYear()}</dd>
              </div>
            </dl>
            <button
              className="botao botao--primario"
              onClick={() => window.print()}
              type="button"
            >
              Imprimir certificado
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

/* ── Vista administrativa ────────────────────────────────────── */

function VistaAdmin() {
  const matriculasAprovadas = matriculas.filter((m) => m.status === "Aprovada");
  const mediaGeral = matriculasAprovadas.length > 0
    ? Math.round(
        matriculasAprovadas.reduce((acc, m) => acc + (PROGRESSO_MOCK[m.id] ?? 0), 0) /
        matriculasAprovadas.length
      )
    : 0;

  return (
    <div className="tela-progresso">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Progresso dos Alunos</h2>
          <p className="cabecalho-pagina__subtitulo">
            {matriculasAprovadas.length} aluno(s) com matrícula ativa — média geral: {mediaGeral}%
          </p>
        </div>
      </header>

      <ul className="lista-progresso-alunos" role="list" aria-label="Progresso por aluno">
        {matriculasAprovadas.map((mat) => {
          const percentual = PROGRESSO_MOCK[mat.id] ?? 0;
          const { texto: statusTexto, variante: statusVariante } =
            resolverStatusModulo(percentual, 100);

          return (
            <li key={mat.id} className="cartao-progresso-aluno">
              <div className="cartao-progresso-aluno__avatar" aria-hidden="true">
                {mat.alunoNome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
              </div>
              <div className="cartao-progresso-aluno__info">
                <strong className="cartao-progresso-aluno__nome">{mat.alunoNome}</strong>
                <p className="cartao-progresso-aluno__meta">
                  {mat.turmaNome} · {mat.cursoTitulo}
                </p>
                <div className="cartao-progresso-aluno__barra">
                  <BarraProgresso percentual={percentual} mostrarTexto={false} />
                </div>
              </div>
              <div className="cartao-progresso-aluno__badges">
                <Insignia texto={`${percentual}%`} variante="neutro" />
                <Insignia texto={statusTexto} variante={statusVariante} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ── Componente principal ────────────────────────────────────── */

export default function TelaProgresso({ usuario, avaliacaoAprovada }) {
  if (usuario?.tipo === "Aluno") {
    return <VistaAluno usuario={usuario} avaliacaoAprovada={avaliacaoAprovada} />;
  }
  return <VistaAdmin />;
}
