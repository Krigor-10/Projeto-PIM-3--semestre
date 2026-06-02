/* ============================================================
   TelaModulos — Visualização e gestão de módulos por curso
   Exibe um carrossel de cursos; cada slide lista os módulos
   daquele curso com barra de progresso e desempenho médio.
   Acesso: Professor (vê apenas seus cursos), Coordenador
   (vê cursos sob sua responsabilidade) e Admin (vê todos).
   ============================================================ */
import { useState, useEffect } from "react";
import { siglasCurso } from "@/utils/siglas.js";
import { TbDotsVertical, TbPlus, TbSettings, TbX, TbStack, TbFileText, TbTrash, TbCheck } from "react-icons/tb";
import { motion } from "framer-motion";
import { MdSave, MdLayers } from "react-icons/md";
import Modal from "@/componentes/Modal.jsx";
import BarraProgresso from "@/componentes/BarraProgresso.jsx";
import Insignia from "@/componentes/Insignia.jsx";
import Botao from "@/componentes/Botao.jsx";
import SelectSimples from "@/componentes/SelectSimples.jsx";
import { turmas, avaliacoes, conteudos } from "@/dados/dadosMock.js";
import { db } from "@/dados/db.js";
import { podeCriar, podeExcluir } from "@/dados/permissoes.js";

/* Dados de desempenho médio por módulo (mock estático, chaveado por moduloId) */
const DESEMPENHO_MODULO = {
  1: 78, 2: 65, 3: 42, 4: 55, 5: 30,
  6: 70, 7: 58,
  8: 62, 9: 45,
  10: 71, 11: 53,
  12: 80, 13: 67,
  14: 50, 15: 38,
};

/* ── Modal de detalhes do módulo: KPIs + avaliações + conteúdos ── */
function ModalDetalhesModulo({ modulo, curso, tipo, visivel, onSolicitarVisibilidade, onFechar, onSalvar, onToast }) {
  const podeAlterarVisibilidade = tipo === "Admin" || tipo === "Coordenador";
  const conteudosMod  = conteudos.filter((c) => c.moduloId === modulo.id);
  const avaliacoesMod = avaliacoes.filter((a) => a.moduloId === modulo.id);
  /* Soma alunos de todas as turmas do curso para exibir o total */
  const totalAlunos   = turmas
    .filter((t) => t.cursoId === modulo.cursoId)
    .reduce((soma, t) => soma + t.totalAlunos, 0);
  const pct    = DESEMPENHO_MODULO[modulo.id] ?? 0;
  /* Cor semáforo: verde ≥70%, amarelo ≥40%, vermelho abaixo */
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

        {podeAlterarVisibilidade && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--espaco-md) 0", borderTop: "1px solid var(--cor-borda)" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--cor-texto-forte)", fontWeight: 600 }}>Visível para alunos</span>
            <button
              type="button"
              role="switch"
              aria-checked={visivel}
              onClick={() => onSolicitarVisibilidade(!visivel)}
              style={{
                width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                background: visivel ? "var(--cor-sucesso)" : "var(--cor-borda)",
                position: "relative", transition: "background 0.2s", flexShrink: 0,
              }}
              aria-label="Alternar visibilidade do módulo"
            >
              <span style={{
                position: "absolute", top: 3, left: visivel ? 23 : 3,
                width: 18, height: 18, borderRadius: "50%", background: "#fff",
                transition: "left 0.2s", display: "block",
              }} />
            </button>
          </div>
        )}

        <footer className="modal-rodape">
          <Botao variante="perigo" onClick={onFechar} style={{ display: "flex", alignItems: "center", gap: "6px", marginRight: "auto" }}><TbX size={15} aria-hidden="true" /> Fechar</Botao>
          <Botao variante="primario" onClick={() => {
            onSalvar?.({ ...modulo, visivel });
            onToast?.(visivel ? "Módulo visível para os alunos." : "Módulo ocultado dos alunos.", "sucesso");
            onFechar();
          }} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <MdSave size={16} aria-hidden="true" /> Salvar
          </Botao>
        </footer>
      </div>
    </Modal>
  );
}

/* ── Slide de um curso no carrossel ─────────────────────────── */
function SlideCurso({ curso, itens, menuModuloAberto, onToggleMenu, onVerDetalhes, onExcluir }) {
  const media = itens.length > 0
    ? Math.round(itens.reduce((acc, m) => acc + (DESEMPENHO_MODULO[m.id] ?? 0), 0) / itens.length)
    : 0;
  const totalConteudos = itens.reduce((acc, m) => acc + (m.totalConteudos ?? 0), 0);

  return (
    <div className="conteudos-aluno">
      <header className="conteudos-aluno__cabecalho">
        <div className="conteudos-aluno__curso-info">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--espaco-md)" }}>
            <div className="cartao-progresso-aluno__avatar conteudos-aluno__avatar-desktop" aria-hidden="true">
              <MdLayers size={20} aria-hidden="true" />
            </div>
            <h2 className="conteudos-aluno__curso-titulo">{curso.titulo}</h2>
          </div>
          <div className="conteudos-aluno__meta-chips">
            <span className="conteudos-aluno__meta-chip conteudos-aluno__meta-chip--progresso">
              <TbStack size={12} aria-hidden="true" />
              {itens.length} módulo{itens.length !== 1 ? "s" : ""}
            </span>
            <span className="conteudos-aluno__meta-chip">
              <TbFileText size={12} aria-hidden="true" />
              {totalConteudos} conteúdo{totalConteudos !== 1 ? "s" : ""}
            </span>
            {curso.codigoRegistro && (
              <span className="conteudos-aluno__meta-chip">
                {curso.codigoRegistro}
              </span>
            )}
          </div>
        </div>
        <div className="conteudos-aluno__progresso-geral">
          <p className="progresso-hero__legenda">desempenho médio</p>
          <div className="anel-progresso" aria-label={`${media} por cento de desempenho médio`}>
            <svg className="anel-progresso__svg" viewBox="0 0 120 120" aria-hidden="true">
              <defs>
                <linearGradient id={`anel-grad-mod-${curso.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#b992ff" />
                  <stop offset="100%" stopColor="#7b2ff7" />
                </linearGradient>
              </defs>
              <circle className="anel-progresso__trilha" cx="60" cy="60" r="50" />
              <circle
                className="anel-progresso__arco"
                cx="60" cy="60" r="50"
                stroke={`url(#anel-grad-mod-${curso.id})`}
                style={{ strokeDasharray: "314.16", strokeDashoffset: 314.16 * (1 - media / 100) }}
              />
            </svg>
            <span className="anel-progresso__texto" aria-hidden="true">{media}%</span>
          </div>
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
                  <span className="dado-rotulo" aria-hidden="true">Conteúdos / Desempenho</span>
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
                          style={{ display: "flex", alignItems: "center", gap: "6px" }}
                          onClick={() => { onVerDetalhes(mod); onToggleMenu(null); }}
                        >
                          <TbSettings size={20} aria-hidden="true" />Opções
                        </button>
                      </li>
                      {onExcluir && (
                        <li>
                          <button
                            type="button"
                            role="menuitem"
                            className="menu-item--perigo"
                            style={{ display: "flex", alignItems: "center", gap: "6px" }}
                            onClick={() => { onExcluir(mod); onToggleMenu(null); }}
                          >
                            <TbTrash size={20} aria-hidden="true" />Excluir
                          </button>
                        </li>
                      )}
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

/* ── Componente principal ────────────────────────────────────── */
export default function TelaModulos({ usuario, listaCursos, onToast }) {
  const [slideAtual, setSlideAtual]         = useState(0);
  const [modalAberto, setModalAberto]       = useState(false);
  const [cursoIdModal, setCursoIdModal]     = useState(null);
  const [erroCursoModal, setErroCursoModal] = useState("");
  const [listaModulos, setListaModulos]     = useState(() => db.modulos.listar());
  const [menuModuloAberto, setMenuModuloAberto] = useState(null);
  const [moduloDetalhe, setModuloDetalhe]   = useState(null);
  const [visivelAtual, setVisivelAtual]     = useState(false);
  const [confirmacaoVisib, setConfirmacaoVisib] = useState(null); // null | { novoValor: bool }
  const [moduloParaExcluir, setModuloParaExcluir] = useState(null);

  /* Persiste alterações de módulos no localStorage a cada mudança */
  useEffect(() => { db.modulos.salvar(listaModulos); }, [listaModulos]);

  /* Fecha menu kebab ao clicar em qualquer lugar fora dele */
  useEffect(() => {
    if (menuModuloAberto === null) return;
    function fechar() { setMenuModuloAberto(null); }
    document.addEventListener("click", fechar);
    return () => document.removeEventListener("click", fechar);
  }, [menuModuloAberto]);

  const tipo            = usuario?.tipo;
  const ehProfessor     = tipo === "Professor";
  const ehCoordenador   = tipo === "Coordenador";
  const podeExcluir_    = podeExcluir(tipo, "modulos");

  /* Sets de IDs para filtrar cursos e módulos por perfil em O(1) */
  const cursosIdsProfessor = ehProfessor
    ? new Set(turmas.filter((t) => t.professorId === usuario?.id).map((t) => t.cursoId))
    : null;

  const cursosIdsCoordenador = ehCoordenador
    ? new Set(listaCursos.filter((c) => c.coordenadorId === usuario?.id).map((c) => c.id))
    : null;

  /* Admin vê todos; professor e coordenador veem apenas seus cursos */
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

  /* Agrupa módulos por curso para renderizar cada slide do carrossel */
  const grupos = cursosDisponiveis.map((curso) => ({
    curso,
    itens: modulosBase.filter((m) => m.cursoId === curso.id).sort((a, b) => a.ordem - b.ordem),
  }));

  const total     = grupos.length;
  /* Clampeia o slide para nunca ficar fora dos limites após filtros */
  const slide     = Math.min(slideAtual, Math.max(0, total - 1));

  function irPara(idx) { setSlideAtual(idx); }

  function confirmarExclusao() {
    if (!moduloParaExcluir) return;
    setListaModulos((prev) => prev.filter((m) => m.id !== moduloParaExcluir.id));
    setModuloParaExcluir(null);
  }

  return (
    <div className="tela-modulos">
      <header className="cabecalho-pagina">
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--espaco-lg)", flexWrap: "wrap" }}>
            <h1 className="cabecalho-pagina__titulo">Módulos</h1>
            {total > 0 && (
              <>
                <label htmlFor="filtro-modulo-curso" className="visualmente-oculto">Selecionar curso</label>
                <select
                  id="filtro-modulo-curso"
                  className="campo__entrada barra-filtros__select"
                  value={slide}
                  onChange={(e) => irPara(Number(e.target.value))}
                  aria-label="Navegar para curso"
                  style={{ marginLeft: "auto", maxWidth: "220px" }}
                >
                  {grupos.map(({ curso }, idx) => (
                    <option key={curso.id} value={idx}>{curso.titulo}</option>
                  ))}
                </select>
              </>
            )}
            {podeCriar(tipo, "modulos") && (
              <>
                <span style={{ width: "1px", height: "24px", background: "var(--cor-borda)", flexShrink: 0 }} aria-hidden="true" />
                <Botao variante="primario" onClick={() => { setCursoIdModal(grupos[slide]?.curso.id ?? null); setErroCursoModal(""); setModalAberto(true); }} style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  variants={{ hover: { y: -1 } }} whileHover="hover"
                >
                  <motion.span variants={{ hover: { rotate: 90 } }} transition={{ type: "spring", stiffness: 400, damping: 18 }} style={{ display: "flex" }}>
                    <TbPlus size={20} aria-hidden="true" />
                  </motion.span>
                  Novo Módulo
                </Botao>
              </>
            )}
          </div>
          <p className="cabecalho-pagina__subtitulo">
            {modulosBase.length} módulo{modulosBase.length !== 1 ? "s" : ""}{" "}
            {ehProfessor ? "nos seus cursos" : "cadastrados"}
          </p>
        </div>
      </header>

      {total === 0 ? (
        <p className="texto-vazio texto-vazio--central" role="status">Nenhum módulo encontrado.</p>
      ) : (
        <div className="carrossel-cursos">
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
              onVerDetalhes={(mod) => { setModuloDetalhe(mod); setVisivelAtual(mod.visivel !== false); }}
              onExcluir={podeExcluir_ ? (mod) => setModuloParaExcluir(mod) : null}
            />
          </div>
        </div>
      )}

      {moduloParaExcluir && (
        <Modal titulo="Excluir módulo" onFechar={() => setModuloParaExcluir(null)}>
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
            Deseja excluir o módulo <strong>{moduloParaExcluir.titulo}</strong>? Esta ação não pode ser desfeita.
          </p>
          <footer className="modal-rodape">
            <Botao variante="perigo" onClick={() => setModuloParaExcluir(null)} style={{ display: "flex", alignItems: "center", gap: "6px" }} variants={{ hover: { y: -1 } }} whileHover="hover">
              <TbX size={15} aria-hidden="true" /> Cancelar
            </Botao>
            <Botao variante="sucesso" onClick={confirmarExclusao} style={{ display: "flex", alignItems: "center", gap: "6px" }} variants={{ hover: { y: -1 } }} whileHover="hover">
              <TbTrash size={15} aria-hidden="true" /> Confirmar
            </Botao>
          </footer>
        </Modal>
      )}

      {moduloDetalhe && (
        <ModalDetalhesModulo
          modulo={moduloDetalhe}
          curso={cursosDisponiveis.find((c) => c.id === moduloDetalhe.cursoId)}
          tipo={tipo}
          visivel={visivelAtual}
          onSolicitarVisibilidade={(novoValor) => setConfirmacaoVisib({ novoValor })}
          onFechar={() => { setModuloDetalhe(null); setConfirmacaoVisib(null); }}
          onSalvar={(atualizado) => setListaModulos((prev) => prev.map((m) => m.id === atualizado.id ? atualizado : m))}
          onToast={onToast}
        />
      )}
      {confirmacaoVisib && (
        <Modal titulo="Confirmar alteração" onFechar={() => setConfirmacaoVisib(null)}>
          <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
            {confirmacaoVisib.novoValor ? "Tornar este módulo visível para os alunos?" : "Ocultar este módulo dos alunos?"}
          </p>
          <footer className="modal-rodape">
            <Botao variante="perigo" onClick={() => setConfirmacaoVisib(null)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <TbX size={15} aria-hidden="true" /> Cancelar
            </Botao>
            <Botao variante="primario" onClick={() => { setVisivelAtual(confirmacaoVisib.novoValor); setConfirmacaoVisib(null); }} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <TbCheck size={15} aria-hidden="true" /> Confirmar
            </Botao>
          </footer>
        </Modal>
      )}

      {/* ── Modal: criar novo módulo ── */}
      {modalAberto && (
        <Modal titulo="Novo Módulo" onFechar={() => setModalAberto(false)}>
          <form
            className="formulario-modal"
            onSubmit={(e) => {
              e.preventDefault();
              if (!cursoIdModal) { setErroCursoModal("Selecione um curso."); return; }
              const f = e.target;
              setListaModulos((prev) => {
                /* Calcula a próxima ordem sequencial dentro do curso */
                const proximaOrdem = prev.filter((m) => m.cursoId === cursoIdModal).length + 1;
                return [...prev, {
                  id: Date.now(),
                  cursoId: cursoIdModal,
                  codigoRegistro: `MOD-${String(prev.length + 1).padStart(3, "0")}`,
                  titulo: f["titulo-modulo"].value,
                  ordem: proximaOrdem,
                  totalConteudos: 0,
                }];
              });
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
            <footer className="modal-rodape">
              <Botao variante="perigo" type="button" onClick={() => setModalAberto(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" /> Cancelar</Botao>
              <Botao variante="primario" type="submit" style={{ display: "flex", alignItems: "center", gap: "6px" }}><MdSave size={19} aria-hidden="true" />Salvar</Botao>
            </footer>
          </form>
        </Modal>
      )}
    </div>
  );
}
