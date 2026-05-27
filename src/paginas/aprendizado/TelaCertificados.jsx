import { useState } from "react";
import { TbCertificate, TbLock, TbX, TbDownload, TbEye } from "react-icons/tb";
import Insignia from "@/componentes/Insignia.jsx";
import Modal from "@/componentes/Modal.jsx";
import BarraProgresso from "@/componentes/BarraProgresso.jsx";
import Botao from "@/componentes/Botao.jsx";
import { matriculas, cursos, modulos, conteudos, certificadosDemo } from "@/dados/dadosMock.js";
import fundoCertificado from "@/ativos/certificado-fundo.png";

function gerarConquistas(totalConcluidos, modulosConcluidos, percentualGeral) {
  return [
    { id: "primeiro-passo", icone: "✦", titulo: "Primeiro passo",    descricao: "Concluiu o 1º conteúdo",       desbloqueada: totalConcluidos >= 1  },
    { id: "em-ritmo",       icone: "◆", titulo: "Em ritmo",           descricao: "5 conteúdos concluídos",       desbloqueada: totalConcluidos >= 5  },
    { id: "modulo-completo",icone: "◎", titulo: "Módulo completo",    descricao: "Finalizou um módulo inteiro",  desbloqueada: modulosConcluidos >= 1 },
    { id: "metade",         icone: "⬟", titulo: "Metade do caminho",  descricao: "50% do curso concluído",       desbloqueada: percentualGeral >= 50  },
  ];
}

export default function TelaCertificados({ usuario, avaliacaoAprovada }) {
  const [certificadoAberto, setCertificadoAberto] = useState(null);

  const matriculasAluno = matriculas.filter(
    (m) => m.alunoId === usuario?.id && m.status === "Aprovada"
  );

  /* Retorna os dados do certificado se desbloqueado, ou null se bloqueado */
  function obterCertificado(cursoId) {
    /* Certificado real gerado pelo fluxo de avaliação desta sessão */
    if (avaliacaoAprovada && cursoId === matriculasAluno[0]?.cursoId) {
      return {
        ...avaliacaoAprovada,
        dataConclusao: new Date().toLocaleDateString("pt-BR"),
      };
    }
    /* Certificados pré-desbloqueados para demonstração */
    const demo = certificadosDemo[cursoId];
    if (demo) return demo;
    return null;
  }

  function imprimirCertificado() {
    const janela = window.open("", "_blank");
    if (!janela) return;
    janela.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>Certificado — ${certificadoAberto?.mat?.cursoTitulo ?? "CodeRyse Academy"}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            img { width: 100%; max-width: 860px; height: auto; display: block; }
            @media print { body { min-height: auto; } img { width: 100%; } }
          </style>
        </head>
        <body>
          <img src="${fundoCertificado}" alt="Certificado de conclusão" />
          <script>
            window.onload = function () { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    janela.document.close();
  }

  const totalCertificados = matriculasAluno.filter(
    (m) => obterCertificado(m.cursoId) !== null
  ).length;

  const bloqueados = matriculasAluno.length - totalCertificados;

  const modulosDosAluno = modulos.filter(
    (m) => matriculasAluno.some((mat) => mat.cursoId === m.cursoId)
  );
  const conteudosDosAluno = conteudos.filter(
    (c) => modulosDosAluno.some((m) => m.id === c.moduloId)
  );
  const totalConcluidos = conteudosDosAluno.filter((c) => c.concluido).length;
  const modulosConcluidos = modulosDosAluno.filter((mod) => {
    const itens = conteudosDosAluno.filter((c) => c.moduloId === mod.id);
    return itens.length > 0 && itens.every((c) => c.concluido);
  }).length;
  const percentualGeral = conteudosDosAluno.length > 0
    ? Math.round((totalConcluidos / conteudosDosAluno.length) * 100)
    : 0;
  const conquistas = gerarConquistas(totalConcluidos, modulosConcluidos, percentualGeral);

  return (
    <div className="tela-certificados">
      <header className="banner-certificados" aria-label="Resumo de certificados">
        <div className="banner-certificados__conteudo">
          <div className="banner-certificados__icone-area" aria-hidden="true">
            <TbCertificate size={44} />
          </div>

          <div className="banner-certificados__texto">
            <h2 className="banner-certificados__titulo">Meus Certificados</h2>
            <p className="banner-certificados__subtitulo">
              Conclua seus cursos e conquiste seus diplomas digitais.
            </p>
          </div>

          <div className="banner-certificados__stats" aria-label="Estatísticas de certificados">
            <div className="banner-certificados__stat">
              <span className="banner-certificados__stat-valor">{totalCertificados}</span>
              <span className="banner-certificados__stat-rotulo">Desbloqueados</span>
            </div>
            <div className="banner-certificados__sep" aria-hidden="true" />
            <div className="banner-certificados__stat">
              <span className="banner-certificados__stat-valor">{matriculasAluno.length}</span>
              <span className="banner-certificados__stat-rotulo">Cursos</span>
            </div>
            {bloqueados > 0 && (
              <>
                <div className="banner-certificados__sep" aria-hidden="true" />
                <div className="banner-certificados__stat">
                  <span className="banner-certificados__stat-valor banner-certificados__stat-valor--bloqueado">
                    <TbLock size={18} style={{ display: "inline", verticalAlign: "middle" }} />
                    {bloqueados}
                  </span>
                  <span className="banner-certificados__stat-rotulo">Bloqueados</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="banner-certificados__deco" aria-hidden="true" />
      </header>

      {matriculasAluno.length === 0 ? (
        <p className="texto-vazio texto-vazio--central" role="status">
          Você não possui matrículas aprovadas. Solicite sua matrícula para começar.
        </p>
      ) : (
        <ul className="lista-certificados" role="list" aria-label="Lista de certificados">
          {matriculasAluno.map((mat) => {
            const curso = cursos.find((c) => c.id === mat.cursoId);
            const cert = obterCertificado(mat.cursoId);
            const desbloqueado = cert !== null;

            return (
              <li
                key={mat.id}
                className={`item-certificado ${desbloqueado ? "item-certificado--desbloqueado" : ""}`}
              >
                {/* Faixa colorida lateral */}
                <div className="item-certificado__faixa" aria-hidden="true" />

                {/* Informações do curso */}
                <div className="item-certificado__curso">
                  <h3 className="item-certificado__titulo">{mat.cursoTitulo}</h3>
                  <p className="item-certificado__meta">
                    {curso?.nivel ?? "—"} · {mat.turmaNome}
                  </p>
                  <p className="item-certificado__codigo">{mat.codigoMatricula}</p>
                </div>

                {/* Status e progresso */}
                <div className="item-certificado__status">
                  {desbloqueado ? (
                    <>
                      <Insignia texto="Concluído" variante="sucesso" />
                      <span className="item-certificado__nota">
                        Nota {cert.nota} / {cert.notaMaxima ?? 10}
                      </span>
                    </>
                  ) : (
                    <>
                      <Insignia texto="Em andamento" variante="info" />
                      <div className="item-certificado__progresso">
                        <BarraProgresso percentual={0} mostrarTexto={false} />
                      </div>
                    </>
                  )}
                </div>

                {/* Ações */}
                <div className="item-certificado__acoes">
                  {desbloqueado ? (
                    <>
                      <Botao
                        variante="fantasma"
                        tamanho="pequeno"
                        onClick={() => setCertificadoAberto({ mat, cert, curso })}
                        aria-label={`Visualizar certificado de ${mat.cursoTitulo}`}
                        style={{ display: "flex", alignItems: "center", gap: "6px" }}
                      >
                        <TbEye size={14} aria-hidden="true" /> Visualizar
                      </Botao>
                      <Botao
                        variante="primario"
                        tamanho="pequeno"
                        onClick={() => { setCertificadoAberto({ mat, cert, curso }); setTimeout(imprimirCertificado, 300); }}
                        aria-label={`Baixar certificado de ${mat.cursoTitulo}`}
                        style={{ display: "flex", alignItems: "center", gap: "6px" }}
                      >
                        <TbDownload size={14} aria-hidden="true" /> Baixar
                      </Botao>
                    </>
                  ) : (
                    <span className="item-certificado__bloqueado" aria-label="Certificado bloqueado">
                      ⊘ Bloqueado
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

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
              {c.desbloqueada
                ? <span className="cartao-conquista__check" aria-hidden="true">✓</span>
                : <span className="cartao-conquista__cadeado" aria-hidden="true">⊘</span>
              }
            </li>
          ))}
        </ul>
      </section>

      {/* Modal do certificado */}
      {certificadoAberto && (
        <Modal
          titulo="Certificado de Conclusão"
          onFechar={() => setCertificadoAberto(null)}
        >
          <figure className="certificado-modal" id="area-impressao">
            <img
              src={fundoCertificado}
              alt={`Certificado de conclusão — ${certificadoAberto.mat.cursoTitulo}`}
              className="certificado-modal__imagem"
              width="860"
              height="609"
            />
          </figure>

          <footer className="modal-rodape">
            <Botao
              variante="perigo"
              onClick={() => setCertificadoAberto(null)}
              style={{ display: "flex", alignItems: "center", gap: "6px", marginRight: "auto" }}
            >
              <TbX size={16} aria-hidden="true" /> Fechar
            </Botao>
            <Botao
              variante="primario"
              onClick={imprimirCertificado}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <TbDownload size={16} aria-hidden="true" /> Baixar / Imprimir
            </Botao>
          </footer>
        </Modal>
      )}
    </div>
  );
}
