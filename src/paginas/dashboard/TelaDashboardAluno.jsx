import CartaoEstatistica from "../../componentes/CartaoEstatistica.jsx";
import BarraProgresso from "../../componentes/BarraProgresso.jsx";
import Insignia from "../../componentes/Insignia.jsx";
import { progressoAluno, conteudos, matriculas } from "../../dados/dadosMock.js";

export default function TelaDashboardAluno({ usuario, onMudarSecao }) {
  const cursoPrincipal = progressoAluno.cursos[0];
  const proximosConteudos = conteudos.filter((c) => !c.concluido).slice(0, 4);

  const matriculaAluno = matriculas.find(
    (m) => m.alunoId === usuario?.id && m.status === "Aprovada"
  );

  const conteudosConcluidos = conteudos.filter((c) => c.concluido).length;
  const modulosConcluidos = progressoAluno.modulos.filter((m) =>
    m.status.normalize("NFD").replace(/[̀-ͯ]/g, "") === "Concluido"
  ).length;

  function tipoConteudo(tipo) {
    if (tipo === "Video") return "VD";
    if (tipo === "Texto") return "TX";
    return "AR";
  }

  return (
    <div className="dashboard-aluno">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Olá, {usuario.nome.split(" ")[0]}</h2>
          <p className="cabecalho-pagina__subtitulo">
            Continue de onde parou e acompanhe sua trilha acadêmica.
          </p>
        </div>
        <Insignia texto="Aluno" variante="marca" />
      </header>

      <section aria-labelledby="titulo-stats-aluno">
        <h2 className="visualmente-oculto" id="titulo-stats-aluno">Resumo de atividades</h2>
        <div className="grade-estatisticas">
          <CartaoEstatistica icone="CU" valor="1" rotulo="Curso em andamento" />
          <CartaoEstatistica
            icone="OK"
            valor={conteudosConcluidos}
            rotulo="Conteúdos concluídos"
            corBorda="var(--cor-sucesso)"
          />
          <CartaoEstatistica
            icone="MO"
            valor={modulosConcluidos}
            rotulo="Módulos concluídos"
            corBorda="var(--cor-info)"
          />
          <CartaoEstatistica
            icone="PR"
            valor={`${cursoPrincipal?.percentual ?? 0}%`}
            rotulo="Progresso geral"
            corBorda="var(--cor-marca)"
          />
        </div>
      </section>

      {/* Curso em andamento com progresso por módulo */}
      {cursoPrincipal && (
        <section
          className="painel-secao"
          aria-labelledby="titulo-progresso-curso"
          style={{ marginTop: "var(--espaco-xl)" }}
        >
          <header className="painel-secao__cabecalho">
            <h2 className="painel-secao__titulo" id="titulo-progresso-curso">Curso em Andamento</h2>
            <button
              className="botao botao--fantasma botao--pequeno"
              onClick={() => onMudarSecao("progresso")}
              type="button"
            >
              Ver progresso completo
            </button>
          </header>
          <div className="painel-secao__conteudo">
            <div className="cartao-curso-ativo">
              <div className="cartao-curso-ativo__info">
                <h3 className="cartao-curso-ativo__titulo">{cursoPrincipal.cursoTitulo}</h3>
                <p className="cartao-curso-ativo__meta">
                  Último acesso: {new Date(cursoPrincipal.ultimoAcesso).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="cartao-curso-ativo__progresso">
                <BarraProgresso percentual={cursoPrincipal.percentual} />
              </div>
            </div>

            <ul className="lista-modulos" role="list" aria-label="Progresso por módulo">
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

      {/* Próximos conteúdos e dados da matrícula */}
      <div className="grade-2" style={{ marginTop: "var(--espaco-xl)" }}>
        <section className="painel-secao" aria-labelledby="titulo-proximos-conteudos">
          <header className="painel-secao__cabecalho">
            <h2 className="painel-secao__titulo" id="titulo-proximos-conteudos">Próximos Conteúdos</h2>
            <button
              className="botao botao--fantasma botao--pequeno"
              onClick={() => onMudarSecao("conteudos")}
              type="button"
            >
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
                    <span className="item-conteudo__meta">{conteudo.tipo} — {conteudo.duracao}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Dados da matrícula aprovada */}
        {matriculaAluno && (
          <section className="painel-secao" aria-labelledby="titulo-matricula-aluno">
            <header className="painel-secao__cabecalho">
              <h2 className="painel-secao__titulo" id="titulo-matricula-aluno">Minha Matrícula</h2>
              <button
                className="botao botao--fantasma botao--pequeno"
                onClick={() => onMudarSecao("matriculas")}
                type="button"
              >
                Ver detalhes
              </button>
            </header>
            <div className="painel-secao__conteudo">
              <dl className="lista-detalhes">
                <div className="lista-detalhes__item">
                  <dt>Código</dt>
                  <dd>{matriculaAluno.codigoMatricula}</dd>
                </div>
                <div className="lista-detalhes__item">
                  <dt>Curso</dt>
                  <dd>{matriculaAluno.cursoTitulo}</dd>
                </div>
                <div className="lista-detalhes__item">
                  <dt>Turma</dt>
                  <dd>{matriculaAluno.turmaNome}</dd>
                </div>
                <div className="lista-detalhes__item">
                  <dt>Status</dt>
                  <dd><Insignia texto={matriculaAluno.status} variante="sucesso" /></dd>
                </div>
                <div className="lista-detalhes__item">
                  <dt>Desde</dt>
                  <dd>{new Date(matriculaAluno.dataSolicitacao).toLocaleDateString("pt-BR")}</dd>
                </div>
              </dl>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
