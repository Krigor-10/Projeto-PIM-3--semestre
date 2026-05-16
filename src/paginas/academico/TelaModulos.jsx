import { useState, useEffect } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { TbDotsVertical } from "react-icons/tb";
import Modal from "@/componentes/Modal.jsx";
import BarraProgresso from "@/componentes/BarraProgresso.jsx";
import Insignia from "@/componentes/Insignia.jsx";
import Botao from "@/componentes/Botao.jsx";
import SelectSimples from "@/componentes/SelectSimples.jsx";
import { turmas, avaliacoes, conteudos } from "@/dados/dadosMock.js";
import { db } from "@/dados/db.js";
import { podeCriar } from "@/dados/permissoes.js";

const DESEMPENHO_MODULO = {
  1: 78, 2: 65, 3: 42, 4: 55, 5: 30,
  6: 70, 7: 58,
  8: 62, 9: 45,
  10: 71, 11: 53,
  12: 80, 13: 67,
  14: 50, 15: 38,
};

function ModalDetalhesModulo({ modulo, curso, onFechar }) {
  const conteudosMod  = conteudos.filter((c) => c.moduloId === modulo.id);
  const avaliacoesMod = avaliacoes.filter((a) => a.moduloId === modulo.id);
  const totalAlunos   = turmas
    .filter((t) => t.cursoId === modulo.cursoId)
    .reduce((soma, t) => soma + t.totalAlunos, 0);
  const pct    = DESEMPENHO_MODULO[modulo.id] ?? 0;
  const corPct = pct >= 70 ? "var(--cor-sucesso)" : pct >= 40 ? "var(--cor-aviso)" : "var(--cor-erro)";
  const TIPO_ICONE = { Video: "▶", Texto: "✦", Documento: "⬡" };

  return (
    <Modal titulo={modulo.titulo} onFechar={onFechar}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--espaco-md)" }}>
        <p style={{ fontSize: "0.82rem", color: "var(--cor-texto-suave)", margin: 0 }}>
          {modulo.codigoRegistro} · Módulo {modulo.ordem} · {curso?.titulo}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--espaco-sm)" }}>
          <div className="admin-kpi">
            <span className="admin-kpi__valor">{modulo.totalConteudos}</span>
            <span className="admin-kpi__rotulo">Conteúdos</span>
          </div>
          <div className="admin-kpi">
            <span className="admin-kpi__valor">{totalAlunos}</span>
            <span className="admin-kpi__rotulo">Alunos</span>
          </div>
          <div className="admin-kpi">
            <span className="admin-kpi__valor" style={{ color: corPct }}>{pct}%</span>
            <span className="admin-kpi__rotulo">Desempenho</span>
          </div>
        </div>

        {avaliacoesMod.length > 0 && (
          <section>
            <h4 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--cor-texto-suave)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 var(--espaco-sm)" }}>
              Avaliações
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
              {avaliacoesMod.map((av) => (
                <li key={av.id} style={{ display: "flex", alignItems: "center", gap: "var(--espaco-sm)", padding: "var(--espaco-sm) var(--espaco-md)", background: "var(--cor-cartao)", border: "1px solid var(--cor-borda)", borderRadius: "var(--raio-sm)", fontSize: "0.875rem" }}>
                  <span aria-hidden="true" style={{ opacity: 0.7 }}>📋</span>
                  <span style={{ flex: 1 }}>{av.titulo}</span>
                  <Insignia texto={av.status} variante={av.status === "Publicada" ? "sucesso" : "neutro"} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h4 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--cor-texto-suave)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 var(--espaco-sm)" }}>
            Conteúdos
          </h4>
          {conteudosMod.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: "var(--cor-texto-mudo)", margin: 0 }}>
              Nenhum conteúdo detalhado disponível.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
              {conteudosMod.map((c) => (
                <li key={c.id} style={{ display: "flex", alignItems: "center", gap: "var(--espaco-sm)", padding: "var(--espaco-sm) var(--espaco-md)", background: "var(--cor-cartao)", border: "1px solid var(--cor-borda)", borderRadius: "var(--raio-sm)", fontSize: "0.875rem" }}>
                  <span aria-hidden="true" style={{ color: "var(--cor-acento)", minWidth: "1rem", textAlign: "center" }}>{TIPO_ICONE[c.tipo] ?? "◈"}</span>
                  <span style={{ flex: 1 }}>{c.titulo}</span>
                  <span style={{ color: "var(--cor-texto-mudo)", fontSize: "0.78rem", whiteSpace: "nowrap" }}>{c.duracao}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="modal-rodape">
          <Botao variante="primario" onClick={onFechar}>Fechar</Botao>
        </footer>
      </div>
    </Modal>
  );
}

function SlideCurso({ curso, itens, menuModuloAberto, onToggleMenu, onVerDetalhes }) {
  const media = itens.length > 0
    ? Math.round(itens.reduce((acc, m) => acc + (DESEMPENHO_MODULO[m.id] ?? 0), 0) / itens.length)
    : 0;

  return (
    <div className="slide-turma">
      <header className="slide-turma__cabecalho">
        <div className="slide-turma__identidade">
          <h3 className="slide-turma__nome">{curso.titulo}</h3>
          <span className="slide-turma__curso">
            {itens.length} módulo{itens.length !== 1 ? "s" : ""} · média {media}%
          </span>
        </div>
        <div className="slide-turma__meta">
          <span style={{ fontSize: "0.82rem", color: "var(--cor-texto-suave)" }}>
            {curso.codigoRegistro}
          </span>
        </div>
      </header>

      {itens.length === 0 ? (
        <p className="texto-vazio" role="status">Nenhum módulo cadastrado neste curso.</p>
      ) : (
        <ul className="lista-aproveitamento" role="list" aria-label={`Módulos de ${curso.titulo}`}>
          {itens.map((mod) => {
            const pct = DESEMPENHO_MODULO[mod.id] ?? 0;
            const corPct = pct >= 70 ? "var(--cor-sucesso)" : pct >= 40 ? "var(--cor-aviso)" : "var(--cor-erro)";
            return (
              <li key={mod.id} className="item-aproveitamento">
                <span className="item-aproveitamento__num" aria-label={`Módulo ${mod.ordem}`} aria-hidden="true">
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
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: corPct, whiteSpace: "nowrap" }}>
                    {pct}%
                  </span>
                </div>
                <div className="menu-contexto">
                  <button
                    className="menu-contexto__botao"
                    type="button"
                    aria-label={`Opções para ${mod.titulo}`}
                    onClick={(e) => { e.stopPropagation(); onToggleMenu(mod.id); }}
                  >
                    <TbDotsVertical size={16} aria-hidden="true" />
                  </button>
                  {menuModuloAberto === mod.id && (
                    <ul className="menu-contexto__lista" role="menu">
                      <li>
                        <button
                          type="button"
                          onClick={() => { onVerDetalhes(mod); onToggleMenu(null); }}
                        >
                          Ver Detalhes
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function TelaModulos({ usuario, listaCursos, onToast }) {
  const [slideAtual, setSlideAtual]         = useState(0);
  const [modalAberto, setModalAberto]       = useState(false);
  const [cursoIdModal, setCursoIdModal]     = useState(null);
  const [erroCursoModal, setErroCursoModal] = useState("");
  const [listaModulos, setListaModulos]     = useState(() => db.modulos.listar());
  const [menuModuloAberto, setMenuModuloAberto] = useState(null);
  const [moduloDetalhe, setModuloDetalhe]   = useState(null);

  useEffect(() => { db.modulos.salvar(listaModulos); }, [listaModulos]);

  useEffect(() => {
    if (menuModuloAberto === null) return;
    function fechar() { setMenuModuloAberto(null); }
    document.addEventListener("click", fechar);
    return () => document.removeEventListener("click", fechar);
  }, [menuModuloAberto]);

  const tipo          = usuario?.tipo;
  const ehProfessor   = tipo === "Professor";
  const ehCoordenador = tipo === "Coordenador";

  const cursosIdsProfessor = ehProfessor
    ? new Set(turmas.filter((t) => t.professorId === usuario?.id).map((t) => t.cursoId))
    : null;

  const cursosIdsCoordenador = ehCoordenador
    ? new Set(listaCursos.filter((c) => c.coordenadorId === usuario?.id).map((c) => c.id))
    : null;

  const cursosDisponiveis = ehProfessor
    ? listaCursos.filter((c) => cursosIdsProfessor.has(c.id))
    : ehCoordenador
      ? listaCursos.filter((c) => cursosIdsCoordenador.has(c.id))
      : listaCursos;

  const modulosBase = ehProfessor
    ? listaModulos.filter((m) => cursosIdsProfessor.has(m.cursoId))
    : ehCoordenador
      ? listaModulos.filter((m) => cursosIdsCoordenador.has(m.cursoId))
      : listaModulos;

  const grupos = cursosDisponiveis.map((curso) => ({
    curso,
    itens: modulosBase.filter((m) => m.cursoId === curso.id).sort((a, b) => a.ordem - b.ordem),
  }));

  const total     = grupos.length;
  const slide     = Math.min(slideAtual, Math.max(0, total - 1));

  function irPara(idx) { setSlideAtual(idx); }

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
          <Botao variante="primario" onClick={() => setModalAberto(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FiPlusCircle size={20} />
            Novo Módulo
          </Botao>
        )}
      </header>

      {total === 0 ? (
        <p className="texto-vazio texto-vazio--central" role="status">Nenhum módulo encontrado.</p>
      ) : (
        <div className="carrossel-cursos">
          <div className="barra-filtros" style={{ marginBottom: "var(--espaco-md)" }}>
            <label htmlFor="filtro-modulo-curso" className="visualmente-oculto">Selecionar curso</label>
            <select
              id="filtro-modulo-curso"
              className="campo__entrada barra-filtros__select"
              value={slide}
              onChange={(e) => irPara(Number(e.target.value))}
              aria-label="Navegar para curso"
            >
              {grupos.map(({ curso }, idx) => (
                <option key={curso.id} value={idx}>{curso.titulo}</option>
              ))}
            </select>
          </div>

          {total > 1 && (
            <nav className="carrossel-cursos__nav" aria-label="Navegação entre cursos">
              <button
                className="carrossel-cursos__seta"
                onClick={() => irPara(slide - 1)}
                disabled={slide === 0}
                aria-label="Curso anterior"
                type="button"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <div className="carrossel-cursos__indicadores" role="tablist" aria-label="Cursos">
                {grupos.map(({ curso }, idx) => (
                  <button
                    key={curso.id}
                    className={`carrossel-cursos__bolinha${idx === slide ? " carrossel-cursos__bolinha--ativa" : ""}`}
                    onClick={() => irPara(idx)}
                    role="tab"
                    aria-selected={idx === slide}
                    aria-label={`Curso ${idx + 1}: ${curso.titulo}`}
                    type="button"
                  />
                ))}
              </div>

              <button
                className="carrossel-cursos__seta"
                onClick={() => irPara(slide + 1)}
                disabled={slide === total - 1}
                aria-label="Próximo curso"
                type="button"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </nav>
          )}

          <div className="carrossel-cursos__janela">
            <SlideCurso
              curso={grupos[slide].curso}
              itens={grupos[slide].itens}
              menuModuloAberto={menuModuloAberto}
              onToggleMenu={(id) => setMenuModuloAberto((prev) => (prev === id ? null : id))}
              onVerDetalhes={(mod) => setModuloDetalhe(mod)}
            />
          </div>
        </div>
      )}

      {moduloDetalhe && (
        <ModalDetalhesModulo
          modulo={moduloDetalhe}
          curso={cursosDisponiveis.find((c) => c.id === moduloDetalhe.cursoId)}
          onFechar={() => setModuloDetalhe(null)}
        />
      )}

      {modalAberto && (
        <Modal titulo="Novo Módulo" onFechar={() => setModalAberto(false)}>
          <form
            className="formulario-modal"
            onSubmit={(e) => {
              e.preventDefault();
              if (!cursoIdModal) { setErroCursoModal("Selecione um curso."); return; }
              const f = e.target;
              setListaModulos((prev) => [...prev, {
                id: Date.now(),
                cursoId: cursoIdModal,
                codigoRegistro: `MOD-${String(prev.length + 1).padStart(3, "0")}`,
                titulo: f["titulo-modulo"].value,
                ordem: Number(f["ordem-modulo"].value) || 1,
                totalConteudos: 0,
              }]);
              onToast?.("Módulo criado com sucesso.", "sucesso");
              setCursoIdModal(null);
              setErroCursoModal("");
              setModalAberto(false);
            }}
          >
            <div className="campo">
              <label className="campo__rotulo" htmlFor="titulo-modulo">Título *</label>
              <input id="titulo-modulo" className="campo__entrada" type="text" placeholder="Ex: Fundamentos de React" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="curso-modulo">Curso *</label>
              <SelectSimples
                id="curso-modulo"
                value={cursoIdModal ?? ""}
                opcoes={cursosDisponiveis.map((c) => ({ valor: c.id, rotulo: c.titulo }))}
                onChange={(val) => { setCursoIdModal(Number(val)); setErroCursoModal(""); }}
                placeholder="Selecione um curso"
                required
                erro={erroCursoModal}
              />
              {erroCursoModal && <span className="campo__mensagem-erro" role="alert">{erroCursoModal}</span>}
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="ordem-modulo">Ordem</label>
              <input id="ordem-modulo" className="campo__entrada" type="number" min="1" defaultValue="1" />
            </div>
            <footer className="modal-rodape">
              <Botao variante="fantasma" type="button" onClick={() => setModalAberto(false)}>Cancelar</Botao>
              <Botao variante="primario" type="submit">Criar Módulo</Botao>
            </footer>
          </form>
        </Modal>
      )}
    </div>
  );
}
