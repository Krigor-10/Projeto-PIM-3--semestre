import { useState } from "react";
import Insignia from "@/componentes/Insignia.jsx";
import Modal from "@/componentes/Modal.jsx";
import BarraProgresso from "@/componentes/BarraProgresso.jsx";
import Botao from "@/componentes/Botao.jsx";
import { matriculas, cursos, certificadosDemo } from "@/dados/dadosMock.js";
import fundoCertificado from "@/ativos/certificado-fundo.png";

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
    window.print();
  }

  const totalCertificados = matriculasAluno.filter(
    (m) => obterCertificado(m.cursoId) !== null
  ).length;

  return (
    <div className="tela-certificados">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Meus Certificados</h2>
          <p className="cabecalho-pagina__subtitulo">
            {totalCertificados} certificado{totalCertificados !== 1 ? "s" : ""} desbloqueado{totalCertificados !== 1 ? "s" : ""} de {matriculasAluno.length} curso{matriculasAluno.length !== 1 ? "s" : ""}
          </p>
        </div>
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
                    {curso?.duracao ?? "—"} · {curso?.nivel ?? "—"} · {mat.turmaNome}
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
                      >
                        Visualizar
                      </Botao>
                      <Botao
                        variante="primario"
                        tamanho="pequeno"
                        onClick={() => { setCertificadoAberto({ mat, cert, curso }); setTimeout(imprimirCertificado, 300); }}
                        aria-label={`Baixar certificado de ${mat.cursoTitulo}`}
                      >
                        Baixar
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
              variante="fantasma"
              onClick={() => setCertificadoAberto(null)}
            >
              Fechar
            </Botao>
            <Botao
              variante="primario"
              onClick={imprimirCertificado}
            >
              Baixar / Imprimir
            </Botao>
          </footer>
        </Modal>
      )}
    </div>
  );
}
