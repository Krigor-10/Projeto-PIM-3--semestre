import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { TbSearch, TbCheck, TbX, TbClock, TbDotsVertical, TbChartBar, TbTrophy, TbStar, TbInfoCircle, TbDownload, TbRosetteDiscountCheck, TbRefresh, TbArrowLeft } from "react-icons/tb";
import imgDevWeb   from "@/ativos/curso-dev-web.png";
import imgCiencia  from "@/ativos/curso-ciencia-dados.png";
import imgIA       from "@/ativos/curso-ia.png";
import imgCyber    from "@/ativos/curso-cyber.png";
import imgUxUi     from "@/ativos/curso-ux-ui.png";
import imgRobotica from "@/ativos/curso-robotica.png";
import Insignia from "@/componentes/Insignia.jsx";

const IMAGEM_CURSO = {
  "Desenvolvimento Web":     imgDevWeb,
  "Ciência de Dados":        imgCiencia,
  "Inteligência Artificial": imgIA,
  "Cybersegurança":          imgCyber,
  "UX e UI Design":          imgUxUi,
  "Robótica":                imgRobotica,
};
import Botao from "@/componentes/Botao.jsx";
import Modal from "@/componentes/Modal.jsx";
import { db } from "@/dados/db.js";
import { podeEditar } from "@/dados/permissoes.js";
import { certificadosDemo, PROGRESSO_MOCK, NOTAS_MOCK, avaliacoes as avaliacoesMock, cursos, modulos, conteudos as conteudosMock } from "@/dados/dadosMock.js";
import fundoCertificado from "@/ativos/certificado-fundo.png";

export default function TelaMatriculas({ usuario }) {
  const tipo = usuario?.tipo;
  const [listaMat, setListaMat]                   = useState(() => db.matriculas.listar());
  useEffect(() => { db.matriculas.salvar(listaMat); }, [listaMat]);
  const [abaAtiva, setAbaAtiva]                     = useState("pendentes");
  const [selecionados, setSelecionados]             = useState(new Set());
  const [confirmandoEmMassa, setConfirmandoEmMassa] = useState(null); // "aprovar" | "rejeitar"
  const [busca, setBusca]                           = useState("");
  const [menuAbertoId, setMenuAbertoId]             = useState(null);
  const [matParaCancelar, setMatParaCancelar]       = useState(null);
  const [matDetalhes, setMatDetalhes]               = useState(null);
  const menuRef = useRef(null);

  const podeAgir = podeEditar(tipo, "matriculas");

  const listaBase = tipo === "Aluno"
    ? listaMat.filter((m) => m.alunoId === usuario?.id)
    : listaMat;

  const termo = busca.trim().toLowerCase();
  const listaFiltrada = termo
    ? listaBase.filter((m) =>
        (m.alunoNome   ?? "").toLowerCase().includes(termo) ||
        (m.cursoTitulo ?? "").toLowerCase().includes(termo) ||
        (m.turmaNome   ?? "").toLowerCase().includes(termo)
      )
    : listaBase;

  const listaPendentes  = listaFiltrada.filter((m) => m.status === "Pendente");
  const listaRejeitadas = listaFiltrada.filter((m) => m.status === "Rejeitada");
  const listaAprovadas  = listaFiltrada.filter((m) => m.status === "Aprovada");

  const idsPendentes      = listaPendentes.map((m) => m.id);
  const temSelecionados   = selecionados.size > 0;
  const todosSelecionados = idsPendentes.length > 0 && idsPendentes.every((id) => selecionados.has(id));
  const alvos             = temSelecionados ? listaPendentes.filter((m) => selecionados.has(m.id)) : listaPendentes;

  function alternarSelecionado(id) {
    setSelecionados((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function alternarTodos() {
    setSelecionados(todosSelecionados ? new Set() : new Set(idsPendentes));
  }

  function reativar(id) {
    setListaMat((prev) => prev.map((m) => m.id === id ? { ...m, status: "Pendente" } : m));
    setAbaAtiva("pendentes");
  }

  function executarEmMassa(novoStatus) {
    const ids = new Set(alvos.map((m) => m.id));
    setListaMat((prev) => prev.map((m) => ids.has(m.id) ? { ...m, status: novoStatus } : m));

    if (novoStatus === "Aprovada") {
      const todosUsuarios = db.usuarios.listar();
      const usuariosAtualizados = todosUsuarios.map((u) => {
        const foiAprovado = alvos.some((m) => m.alunoId === u.id);
        return foiAprovado && !u.ativo ? { ...u, ativo: true } : u;
      });
      // Adiciona alunos que ainda não existem na lista de usuários
      alvos.forEach((m) => {
        if (!todosUsuarios.find((u) => u.id === m.alunoId)) {
          usuariosAtualizados.push({
            id: m.alunoId,
            nome: m.alunoNome,
            email: `${m.alunoNome.toLowerCase().replace(/\s+/g, ".")}@coderyse.com`,
            tipo: "Aluno",
            ativo: true,
            dataCadastro: new Date().toISOString().slice(0, 10),
          });
        }
      });
      db.usuarios.salvar(usuariosAtualizados);
    }

    setSelecionados(new Set());
    setConfirmandoEmMassa(null);
  }

  useEffect(() => {
    function fechar(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAbertoId(null);
    }
    if (menuAbertoId) document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, [menuAbertoId]);

  function calcularProgresso(mat) {
    const modulosDoCurso   = modulos.filter((m) => m.cursoId === mat.cursoId);
    const conteudosDoCurso = conteudosMock.filter((c) => modulosDoCurso.some((m) => m.id === c.moduloId));
    const concluidos       = db.progresso.listarConcluidos();
    const resultados       = db.progresso.listarResultados();
    const totalConcluidos  = conteudosDoCurso.filter((c) => concluidos.has(c.id)).length;
    const quizzesFeitos    = conteudosDoCurso.filter((c) => resultados[c.id] !== undefined).length;
    const totalPassos      = conteudosDoCurso.length * 2;
    const real = totalPassos > 0 ? Math.round(((totalConcluidos + quizzesFeitos) / totalPassos) * 100) : 0;
    return real > 0 ? real : (PROGRESSO_MOCK[mat.id] ?? 0);
  }

  function baixarCertificado() {
    const janela = window.open("", "_blank");
    if (!janela) return;
    janela.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>Certificado</title>
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

  function cancelarMatricula(id) {
    setListaMat((prev) => prev.filter((m) => m.id !== id));
    setMatParaCancelar(null);
    setMenuAbertoId(null);
  }

  /* ── Vista do Aluno ── */
  if (tipo === "Aluno") {
    return (
      <div className="tela-matriculas">
        <header className="cabecalho-pagina">
          <div>
            <h1 className="cabecalho-pagina__titulo">Meus Cursos</h1>
            <p className="cabecalho-pagina__subtitulo">{listaBase.length} matrícula(s) registrada(s)</p>
          </div>
        </header>
        {listaBase.length === 0 ? (
          <p style={{ color: "var(--cor-texto-suave)", marginTop: "var(--espaco-lg)" }}>Nenhuma matrícula registrada.</p>
        ) : (
          <ul className="catalogo-grade" role="list" aria-label="Meus cursos" ref={menuRef}>
            {listaBase.map((mat) => (
              <li key={mat.id} className="catalogo-card">
                <div className="meus-cursos__img-wrap">
                  {IMAGEM_CURSO[mat.cursoTitulo] ? (
                    <img
                      src={IMAGEM_CURSO[mat.cursoTitulo]}
                      alt=""
                      aria-hidden="true"
                      className="meus-cursos__img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="meus-cursos__img-placeholder" aria-hidden="true" />
                  )}
                </div>
                <div className="catalogo-card__corpo">
                  <div className="meus-cursos__titulo-linha">
                    <h3 className="catalogo-card__titulo">{mat.cursoTitulo}</h3>
                    {mat.status === "Aprovada" ? (() => {
                      const pct = calcularProgresso(mat);
                      if (pct >= 100) return (
                        <span className="meus-cursos__badge-aprovada meus-cursos__badge-aprovada--concluido">
                          <TbRosetteDiscountCheck size={18} aria-hidden="true" />
                          Concluído
                        </span>
                      );
                      if (pct > 0) return (
                        <span className="meus-cursos__badge-aprovada meus-cursos__badge-aprovada--andamento">
                          <TbChartBar size={18} aria-hidden="true" />
                          Em andamento
                        </span>
                      );
                      return (
                        <span className="meus-cursos__badge-aprovada meus-cursos__badge-aprovada--nao-iniciado">
                          <TbRosetteDiscountCheck size={18} aria-hidden="true" />
                          Aprovado
                        </span>
                      );
                    })() : (
                      <Insignia
                        texto={mat.status}
                        variante={mat.status === "Rejeitada" ? "erro" : "neutro"}
                      />
                    )}
                  </div>
                  <p className="catalogo-card__turma">{mat.turmaNome}</p>
                  <p className="catalogo-card__data">
                    <TbClock size={13} aria-hidden="true" />
                    Solicitado em {new Date(mat.dataSolicitacao).toLocaleDateString("pt-BR")}
                  </p>

                  <footer className="catalogo-card__rodape-aluno">
                    <span className="catalogo-card__codigo">{mat.codigoMatricula}</span>
                    <div className="catalogo-card__menu-wrapper">
                      <button
                        type="button"
                        className="catalogo-card__btn-opcoes"
                        onClick={() => setMenuAbertoId((prev) => prev === mat.id ? null : mat.id)}
                        aria-label="Opções da matrícula"
                        aria-expanded={menuAbertoId === mat.id}
                      >
                        <TbDotsVertical size={17} aria-hidden="true" />
                      </button>
                      {menuAbertoId === mat.id && (
                        <ul className="catalogo-card__dropdown" role="menu">
                          {mat.status === "Pendente" && (
                            <li role="menuitem">
                              <button
                                type="button"
                                className="catalogo-card__dropdown-item catalogo-card__dropdown-item--perigo"
                                onClick={() => { setMatParaCancelar(mat); setMenuAbertoId(null); }}
                              >
                                <TbX size={14} aria-hidden="true" />
                                Cancelar solicitação
                              </button>
                            </li>
                          )}
                          {mat.status === "Aprovada" && (
                            <li role="menuitem">
                              <button
                                type="button"
                                className="catalogo-card__dropdown-item"
                                onClick={() => { setMatDetalhes(mat); setMenuAbertoId(null); }}
                              >
                                <TbInfoCircle size={14} aria-hidden="true" />
                                Ver detalhes
                              </button>
                            </li>
                          )}
                          {mat.status === "Rejeitada" && (
                            <li role="menuitem">
                              <span className="catalogo-card__dropdown-info">Matrícula rejeitada</span>
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  </footer>
                </div>
              </li>
            ))}
          </ul>
        )}

        {matParaCancelar && (
          <Modal titulo="Cancelar solicitação" onFechar={() => setMatParaCancelar(null)}>
            <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
              Tem certeza que deseja cancelar a solicitação para <strong>{matParaCancelar.cursoTitulo}</strong>? Esta ação não pode ser desfeita.
            </p>
            <footer className="modal-rodape">
              <Botao variante="fantasma" onClick={() => setMatParaCancelar(null)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbArrowLeft size={15} aria-hidden="true" /> Voltar</Botao>
              <Botao variante="perigo" onClick={() => cancelarMatricula(matParaCancelar.id)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <TbX size={15} aria-hidden="true" /> Confirmar cancelamento
              </Botao>
            </footer>
          </Modal>
        )}

        {matDetalhes && (() => {
          const cert      = certificadosDemo[matDetalhes.cursoId];
          const notaTurma = NOTAS_MOCK[matDetalhes.turmaId];

          const progresso = calcularProgresso(matDetalhes);
          const avsDosCurso = avaliacoesMock.filter((a) => a.cursoId === matDetalhes.cursoId);
          const certLiberado = !!cert;
          return (
            <Modal titulo="Detalhes do curso" onFechar={() => setMatDetalhes(null)}>
              {/* Cabeçalho com imagem */}
              {IMAGEM_CURSO[matDetalhes.cursoTitulo] && (
                <div className="det-mat__banner" aria-hidden="true">
                  <img src={IMAGEM_CURSO[matDetalhes.cursoTitulo]} alt="" className="det-mat__banner-img" />
                </div>
              )}

              <div className="det-mat__conteudo">
                {/* Info geral */}
                <section className="det-mat__secao">
                  <h3 className="det-mat__secao-titulo"><TbInfoCircle size={15} aria-hidden="true" /> Informações</h3>
                  <dl className="det-mat__dl">
                    <div className="det-mat__dl-item">
                      <dt>Curso</dt><dd>{matDetalhes.cursoTitulo}</dd>
                    </div>
                    <div className="det-mat__dl-item">
                      <dt>Turma</dt><dd>{matDetalhes.turmaNome}</dd>
                    </div>
                    <div className="det-mat__dl-item">
                      <dt>Código</dt><dd>{matDetalhes.codigoMatricula}</dd>
                    </div>
                    <div className="det-mat__dl-item">
                      <dt>Data de aprovação</dt>
                      <dd>{new Date(matDetalhes.dataSolicitacao).toLocaleDateString("pt-BR")}</dd>
                    </div>
                  </dl>
                </section>

                {/* Progresso */}
                <section className="det-mat__secao">
                  <h3 className="det-mat__secao-titulo"><TbChartBar size={15} aria-hidden="true" /> Progresso</h3>
                  <div className="det-mat__progresso-wrap">
                    <div className="det-mat__progresso-barra">
                      <div className="det-mat__progresso-fill" style={{ width: `${progresso}%` }} />
                    </div>
                    <span className="det-mat__progresso-pct">{progresso}%</span>
                  </div>
                </section>

                {/* Notas */}
                <section className="det-mat__secao">
                  <h3 className="det-mat__secao-titulo"><TbStar size={15} aria-hidden="true" /> Notas</h3>
                  {avsDosCurso.length === 0 ? (
                    <p className="det-mat__vazio">Nenhuma avaliação disponível.</p>
                  ) : (
                    <ul className="det-mat__lista-notas">
                      {avsDosCurso.map((av) => {
                        const nota = cert ? cert.nota : notaTurma ?? null;
                        return (
                          <li key={av.id} className="det-mat__nota-item">
                            <span className="det-mat__nota-titulo">{av.titulo}</span>
                            <span className="det-mat__nota-valor">
                              {nota != null ? `${nota} / ${av.notaMaxima}` : "—"}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>

                {/* Certificado */}
                <section className="det-mat__secao">
                  <h3 className="det-mat__secao-titulo"><TbTrophy size={15} aria-hidden="true" /> Certificado</h3>
                  <div className={`det-mat__cert${certLiberado ? " det-mat__cert--ok" : " det-mat__cert--bloqueado"}`}>
                    <TbTrophy size={22} aria-hidden="true" />
                    <div style={{ flex: 1 }}>
                      <strong>{certLiberado ? "Certificado disponível" : "Certificado não disponível"}</strong>
                      <p>{certLiberado ? `Concluído em ${cert.dataConclusao} · Nota final: ${cert.nota}` : "Complete todas as avaliações para liberar."}</p>
                    </div>
                    {certLiberado && (
                      <button
                        type="button"
                        className="det-mat__cert-download"
                        aria-label="Baixar certificado"
                        data-tooltip="Baixar certificado"
                        onClick={baixarCertificado}
                      >
                        <TbDownload size={24} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </section>
              </div>

              <footer className="modal-rodape">
                <Botao variante="perigo" onClick={() => setMatDetalhes(null)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <TbX size={15} aria-hidden="true" /> Fechar
                </Botao>
              </footer>
            </Modal>
          );
        })()}
      </div>
    );
  }

  /* ── Vista administrativa ── */
  const abas = [
    { chave: "pendentes",  rotulo: "Pendentes",  contagem: listaPendentes.length  },
    { chave: "rejeitadas", rotulo: "Rejeitadas", contagem: listaRejeitadas.length },
    { chave: "aprovadas",  rotulo: "Aprovadas",  contagem: listaAprovadas.length  },
  ];

  return (
    <div className="tela-matriculas">
      <header className="cabecalho-pagina" style={{ alignItems: "center" }}>
        <div>
          <h1 className="cabecalho-pagina__titulo">Matrículas</h1>
          <p className="cabecalho-pagina__subtitulo">
            {listaBase.length} no total — {listaBase.filter((m) => m.status === "Pendente").length} pendente{listaBase.filter((m) => m.status === "Pendente").length !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ position: "relative", width: "260px", flexShrink: 0, marginLeft: "auto" }}>
          <TbSearch size={15} aria-hidden="true" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--cor-texto-mudo)", pointerEvents: "none" }} />
          <label htmlFor="busca-matriculas" className="visualmente-oculto">Buscar matrícula</label>
          <input
            id="busca-matriculas"
            type="search"
            className="campo__entrada"
            placeholder="Buscar aluno, curso ou turma…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ width: "100%", paddingLeft: "32px" }}
          />
        </div>
      </header>

      {/* Abas */}
      <div className="abas-matriculas" role="tablist" aria-label="Filtrar matrículas por status">
        {abas.map((aba) => (
          <button
            key={aba.chave}
            role="tab"
            aria-selected={abaAtiva === aba.chave}
            aria-controls={`painel-${aba.chave}`}
            className={`abas-matriculas__aba ${abaAtiva === aba.chave ? "abas-matriculas__aba--ativa" : ""}`}
            onClick={() => setAbaAtiva(aba.chave)}
            type="button"
          >
            {aba.rotulo}
            {aba.contagem > 0 && <span className="abas-matriculas__contagem">{aba.contagem}</span>}
          </button>
        ))}
      </div>

      {/* Painel: Pendentes */}
      <section
        id="painel-pendentes"
        role="tabpanel"
        hidden={abaAtiva !== "pendentes"}
        className="painel-secao painel-secao--sem-topo"
        aria-label="Matrículas pendentes"
      >
        {podeAgir && (
          <div className="toolbar-massa-matriculas" role="toolbar" aria-label="Ações em massa">
            <span className="toolbar-massa-matriculas__contador">
              {temSelecionados
                ? `${selecionados.size} selecionada${selecionados.size !== 1 ? "s" : ""}`
                : `${listaPendentes.length} pendente${listaPendentes.length !== 1 ? "s" : ""}`
              }
            </span>
            <div className="toolbar-massa-matriculas__acoes">
              <Botao
                variante="sucesso"
                tamanho="pequeno"
                disabled={listaPendentes.length === 0}
                onClick={() => setConfirmandoEmMassa("aprovar")}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <TbCheck size={15} aria-hidden="true" />
                {temSelecionados ? "Aprovar selecionadas" : "Aprovar todas"}
              </Botao>
              <Botao
                variante="perigo"
                tamanho="pequeno"
                disabled={listaPendentes.length === 0}
                onClick={() => setConfirmandoEmMassa("rejeitar")}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <TbX size={15} aria-hidden="true" />
                {temSelecionados ? "Rejeitar selecionadas" : "Rejeitar todas"}
              </Botao>
            </div>
            {temSelecionados && (
              <button className="barra-massa__limpar" onClick={() => setSelecionados(new Set())} aria-label="Limpar seleção" type="button">✕</button>
            )}
          </div>
        )}

        <div className="tabela-dados-container" role="region">
          <table className="tabela-dados">
            <thead>
              <tr>
                {podeAgir && (
                  <th scope="col" style={{ width: 44 }}>
                    <input
                      type="checkbox"
                      className="tabela-checkbox"
                      checked={todosSelecionados}
                      onChange={alternarTodos}
                      disabled={idsPendentes.length === 0}
                      aria-label="Selecionar todos"
                    />
                  </th>
                )}
                <th scope="col">Código</th>
                <th scope="col">Aluno</th>
                <th scope="col">Curso</th>
                <th scope="col">Turma</th>
                <th scope="col">Data</th>
              </tr>
            </thead>
            <tbody>
              {listaPendentes.length === 0 ? (
                <tr className="tabela-dados--sem-dados">
                  <td colSpan={podeAgir ? 6 : 5}>Nenhuma matrícula pendente.</td>
                </tr>
              ) : listaPendentes.map((mat) => (
                <tr key={mat.id} className={selecionados.has(mat.id) ? "tabela-linha-clicavel--selecionada" : ""}>
                  {podeAgir && (
                    <td>
                      <input
                        type="checkbox"
                        className="tabela-checkbox"
                        checked={selecionados.has(mat.id)}
                        onChange={() => alternarSelecionado(mat.id)}
                        aria-label={`Selecionar ${mat.alunoNome}`}
                      />
                    </td>
                  )}
                  <td>{mat.codigoMatricula}</td>
                  <td>{mat.alunoNome}</td>
                  <td>{mat.cursoTitulo}</td>
                  <td>{mat.turmaNome}</td>
                  <td>{new Date(mat.dataSolicitacao).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Painel: Rejeitadas */}
      <section
        id="painel-rejeitadas"
        role="tabpanel"
        hidden={abaAtiva !== "rejeitadas"}
        className="painel-secao painel-secao--sem-topo"
        aria-label="Matrículas rejeitadas"
      >
        <div className="tabela-dados-container" role="region">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th scope="col">Código</th>
                <th scope="col">Aluno</th>
                <th scope="col">Curso</th>
                <th scope="col">Turma</th>
                <th scope="col">Data</th>
                {podeAgir && <th scope="col">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {listaRejeitadas.length === 0 ? (
                <tr className="tabela-dados--sem-dados">
                  <td colSpan={podeAgir ? 6 : 5}>Nenhuma matrícula rejeitada.</td>
                </tr>
              ) : listaRejeitadas.map((mat) => (
                <tr key={mat.id}>
                  <td>{mat.codigoMatricula}</td>
                  <td>{mat.alunoNome}</td>
                  <td>{mat.cursoTitulo}</td>
                  <td>{mat.turmaNome}</td>
                  <td>{new Date(mat.dataSolicitacao).toLocaleDateString("pt-BR")}</td>
                  {podeAgir && (
                    <td>
                      <Botao variante="secundario" tamanho="pequeno" onClick={() => reativar(mat.id)} aria-label={`Reativar matrícula de ${mat.alunoNome}`} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <TbRefresh size={13} aria-hidden="true" /> Reativar
                      </Botao>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Painel: Aprovadas */}
      <section
        id="painel-aprovadas"
        role="tabpanel"
        hidden={abaAtiva !== "aprovadas"}
        className="painel-secao painel-secao--sem-topo"
        aria-label="Matrículas aprovadas"
      >
        <div className="tabela-dados-container" role="region">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th scope="col">Código</th>
                <th scope="col">Aluno</th>
                <th scope="col">Curso</th>
                <th scope="col">Turma</th>
                <th scope="col">Data</th>
              </tr>
            </thead>
            <tbody>
              {listaAprovadas.length === 0 ? (
                <tr className="tabela-dados--sem-dados">
                  <td colSpan={5}>Nenhuma matrícula aprovada.</td>
                </tr>
              ) : listaAprovadas.map((mat) => (
                <tr key={mat.id}>
                  <td>{mat.codigoMatricula}</td>
                  <td>{mat.alunoNome}</td>
                  <td>{mat.cursoTitulo}</td>
                  <td>{mat.turmaNome}</td>
                  <td>{new Date(mat.dataSolicitacao).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal de confirmação em massa */}
      {confirmandoEmMassa && (
        <Modal
          titulo={confirmandoEmMassa === "aprovar" ? "Aprovar todas as pendentes" : "Rejeitar todas as pendentes"}
          onFechar={() => setConfirmandoEmMassa(null)}
        >
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
            {confirmandoEmMassa === "aprovar"
              ? <><strong>{alvos.length}</strong> {alvos.length === 1 ? "matrícula será aprovada." : "matrículas serão aprovadas."}</>
              : <><strong>{alvos.length}</strong> {alvos.length === 1 ? "matrícula será rejeitada." : "matrículas serão rejeitadas."} Esta ação não pode ser desfeita.</>
            }
          </p>
          <footer className="modal-rodape">
            <Botao variante="perigo" onClick={() => setConfirmandoEmMassa(null)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <TbX size={15} aria-hidden="true" /> Cancelar
            </Botao>
            <Botao
              variante={confirmandoEmMassa === "aprovar" ? "sucesso" : "perigo"}
              onClick={() => executarEmMassa(confirmandoEmMassa === "aprovar" ? "Aprovada" : "Rejeitada")}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <TbCheck size={15} aria-hidden="true" />
              {confirmandoEmMassa === "aprovar" ? "Confirmar aprovação" : "Confirmar rejeição"}
            </Botao>
          </footer>
        </Modal>
      )}
    </div>
  );
}
