import { useState } from "react";
import Modal from "../../componentes/Modal.jsx";
import BarraProgresso from "../../componentes/BarraProgresso.jsx";
import Botao from "../../componentes/Botao.jsx";
import { modulos, cursos, turmas } from "../../dados/dadosMock.js";
import { podeCriar } from "../../dados/permissoes.js";

/* Percentual médio de desempenho dos alunos por módulo (simulado) */
const DESEMPENHO_MODULO = {
  1: 78, 2: 65, 3: 42, 4: 55, 5: 30,
  6: 70, 7: 58,
  8: 62, 9: 45,
  10: 71, 11: 53,
  12: 80, 13: 67,
  14: 50, 15: 38,
};

export default function TelaModulos({ usuario }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [listaModulos, setListaModulos] = useState(modulos);

  const tipo = usuario?.tipo;
  const ehProfessor    = tipo === "Professor";
  const ehCoordenador  = tipo === "Coordenador";

  const cursosIdsProfessor = ehProfessor
    ? new Set(turmas.filter((t) => t.professorId === usuario?.id).map((t) => t.cursoId))
    : null;

  const cursosIdsCoordenador = ehCoordenador
    ? new Set(cursos.filter((c) => c.coordenadorId === usuario?.id).map((c) => c.id))
    : null;

  const cursosDisponiveis = ehProfessor
    ? cursos.filter((c) => cursosIdsProfessor.has(c.id))
    : ehCoordenador
      ? cursos.filter((c) => cursosIdsCoordenador.has(c.id))
      : cursos;

  const modulosBase = ehProfessor
    ? listaModulos.filter((m) => cursosIdsProfessor.has(m.cursoId))
    : ehCoordenador
      ? listaModulos.filter((m) => cursosIdsCoordenador.has(m.cursoId))
      : listaModulos;

  /* Acordeão: todos os cursos abertos por padrão */
  const [cursosAbertos, setCursosAbertos] = useState(
    () => new Set(cursosDisponiveis.map((c) => c.id))
  );

  function alternarCurso(cursoId) {
    setCursosAbertos((prev) => {
      const copia = new Set(prev);
      copia.has(cursoId) ? copia.delete(cursoId) : copia.add(cursoId);
      return copia;
    });
  }

  /* Agrupa módulos por curso */
  const grupos = cursosDisponiveis.map((curso) => ({
    curso,
    itens: modulosBase
      .filter((m) => m.cursoId === curso.id)
      .sort((a, b) => a.ordem - b.ordem),
  }));

  return (
    <div className="tela-modulos">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Módulos</h2>
          <p className="cabecalho-pagina__subtitulo">
            {modulosBase.length} módulo{modulosBase.length !== 1 ? "s" : ""}{" "}
            {ehProfessor ? "nos seus cursos" : "cadastrados"}
          </p>
        </div>
        {podeCriar(tipo, "modulos") && (
          <Botao
            variante="primario"
            onClick={() => setModalAberto(true)}
          >
            + Novo Módulo
          </Botao>
        )}
      </header>

      {grupos.map(({ curso, itens }) => {
        const aberto = cursosAbertos.has(curso.id);
        const mediaDesempenho = itens.length > 0
          ? Math.round(itens.reduce((acc, m) => acc + (DESEMPENHO_MODULO[m.id] ?? 0), 0) / itens.length)
          : 0;

        return (
          <section
            key={curso.id}
            className="painel-secao"
            aria-labelledby={`curso-modulo-${curso.id}`}
            style={{ marginBottom: "var(--espaco-lg)" }}
          >
            <header className="painel-secao__cabecalho">
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <h3
                  className="painel-secao__titulo"
                  id={`curso-modulo-${curso.id}`}
                >
                  {curso.titulo}
                </h3>
                <p style={{ fontSize: "0.82rem", color: "var(--cor-texto-suave)" }}>
                  {itens.length} módulo{itens.length !== 1 ? "s" : ""} · média {mediaDesempenho}%
                </p>
              </div>
              <Botao
                variante="fantasma"
                tamanho="pequeno"
                onClick={() => alternarCurso(curso.id)}
                aria-expanded={aberto}
                aria-controls={`modulos-curso-${curso.id}`}
              >
                {aberto ? "Recolher ▲" : "Expandir ▼"}
              </Botao>
            </header>

            {aberto && (
              <div
                className="painel-secao__conteudo"
                id={`modulos-curso-${curso.id}`}
              >
                {itens.length === 0 ? (
                  <p className="texto-vazio" role="status">
                    Nenhum módulo cadastrado neste curso.
                  </p>
                ) : (
                  <ul className="lista-aproveitamento" role="list" aria-label={`Módulos de ${curso.titulo}`}>
                    {itens.map((mod) => {
                      const pct = DESEMPENHO_MODULO[mod.id] ?? 0;
                      return (
                        <li key={mod.id} className="item-aproveitamento">
                          <span
                            className="item-aproveitamento__num"
                            aria-label={`Módulo ${mod.ordem}`}
                            aria-hidden="true"
                          >
                            {mod.ordem}
                          </span>
                          <div className="item-aproveitamento__info">
                            <span className="item-aproveitamento__titulo">
                              {mod.titulo}
                              <span style={{ fontSize: "0.78rem", color: "var(--cor-texto-mudo)", marginLeft: "0.5rem" }}>
                                {mod.codigoRegistro}
                              </span>
                            </span>
                            <div className="item-aproveitamento__barra" aria-hidden="true">
                              <BarraProgresso percentual={pct} mostrarTexto={false} />
                            </div>
                          </div>
                          <div className="item-aproveitamento__badges">
                            <span style={{ fontSize: "0.82rem", color: "var(--cor-texto-suave)", whiteSpace: "nowrap" }}>
                              {mod.totalConteudos} conteúdo{mod.totalConteudos !== 1 ? "s" : ""}
                            </span>
                            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: pct >= 70 ? "var(--cor-sucesso)" : pct >= 40 ? "var(--cor-aviso)" : "var(--cor-erro)", whiteSpace: "nowrap" }}>
                              {pct}%
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </section>
        );
      })}

      {modulosBase.length === 0 && (
        <p className="texto-vazio texto-vazio--central" role="status">
          Nenhum módulo encontrado.
        </p>
      )}

      {modalAberto && (
        <Modal titulo="Novo Módulo" onFechar={() => setModalAberto(false)}>
          <form
            className="formulario-modal"
            onSubmit={(e) => {
              e.preventDefault();
              const f = e.target;
              const cursoId = Number(f["curso-modulo"].value);
              const ordemModulo = Number(f["ordem-modulo"].value) || 1;
              setListaModulos((prev) => [...prev, {
                id: Date.now(),
                cursoId,
                codigoRegistro: `MOD-${String(prev.length + 1).padStart(3, "0")}`,
                titulo: f["titulo-modulo"].value,
                ordem: ordemModulo,
                totalConteudos: 0,
              }]);
              setModalAberto(false);
            }}
          >
            <div className="campo">
              <label className="campo__rotulo" htmlFor="titulo-modulo">Título *</label>
              <input id="titulo-modulo" className="campo__entrada" type="text" placeholder="Ex: Fundamentos de React" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="curso-modulo">Curso *</label>
              <select id="curso-modulo" className="campo__entrada" required>
                <option value="">Selecione um curso</option>
                {cursosDisponiveis.map((c) => (
                  <option key={c.id} value={c.id}>{c.titulo}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="ordem-modulo">Ordem</label>
              <input id="ordem-modulo" className="campo__entrada" type="number" min="1" defaultValue="1" />
            </div>
            <footer className="modal-rodape">
              <Botao variante="fantasma" onClick={() => setModalAberto(false)}>Cancelar</Botao>
              <Botao variante="primario" type="submit">Criar Módulo</Botao>
            </footer>
          </form>
        </Modal>
      )}
    </div>
  );
}
