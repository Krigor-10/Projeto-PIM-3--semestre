import { useState, useEffect } from "react";
import Insignia from "@/componentes/Insignia.jsx";
import Modal from "@/componentes/Modal.jsx";
import Botao from "@/componentes/Botao.jsx";
import { cursos, turmas, modulos, usuarios, avaliacoes } from "@/dados/dadosMock.js";
import { db } from "@/dados/db.js";
import { podeCriar, podeEditar, podeExcluir } from "@/dados/permissoes.js";

/* ── Vista gerencial do coordenador ─────────────────────────────── */

function VistaGerencialCoordenador({ usuario }) {
  const [cursoSelecionado, setCursoSelecionado] = useState(null);
  const [menuAberto, setMenuAberto]             = useState(null);
  const [formSujo, setFormSujo]                 = useState(false);
  const [confirmarSaida, setConfirmarSaida]     = useState(false);
  const [listaCursos, setListaCursos]           = useState(() =>
    db.cursos.listar()
      .filter((c) => c.coordenadorId === usuario.id)
      .map((c) => {
        const turma = turmas.find((t) => t.cursoId === c.id);
        return { ...c, professorId: turma?.professorId ?? null, professorNome: turma?.professorNome ?? null };
      })
  );

  useEffect(() => { setFormSujo(false); setConfirmarSaida(false); }, [cursoSelecionado]);

  const professoresAtivos = usuarios.filter((u) => u.tipo === "Professor" && u.ativo);

  const totalAtivos     = listaCursos.filter((c) => c.ativo).length;
  const totalAlunos     = listaCursos.filter((c) => c.ativo).reduce((acc, c) => {
    return acc + turmas.filter((t) => t.cursoId === c.id).reduce((s, t) => s + (t.totalAlunos ?? 0), 0);
  }, 0);
  const qtdTurmasAtivas = turmas.filter((t) => t.status === "Ativa" && listaCursos.some((c) => c.id === t.cursoId)).length;

  function tentarFechar() {
    if (formSujo) { setConfirmarSaida(true); } else { setCursoSelecionado(null); }
  }

  function salvarAlteracoes(e) {
    e.preventDefault();
    const profId    = Number(e.target["coord-professor"].value) || null;
    const professor = professoresAtivos.find((p) => p.id === profId);
    setListaCursos((prev) => prev.map((c) =>
      c.id === cursoSelecionado.id
        ? { ...c, professorId: profId, professorNome: professor?.nome ?? null }
        : c
    ));
    setCursoSelecionado(null);
  }

  return (
    <div className="tela-cursos">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Cursos</h2>
          <p className="cabecalho-pagina__subtitulo">Cursos sob sua coordenação</p>
        </div>
      </header>

      {/* KPIs */}
      <ul className="cursos-kpis" aria-label="Indicadores dos seus cursos">
        <li className="cursos-kpi">
          <span className="cursos-kpi__valor">{totalAtivos}</span>
          <span className="cursos-kpi__rotulo">Cursos ativos</span>
        </li>
        <li className="cursos-kpi">
          <span className="cursos-kpi__valor">{totalAlunos}</span>
          <span className="cursos-kpi__rotulo">Alunos matriculados</span>
        </li>
        <li className="cursos-kpi">
          <span className="cursos-kpi__valor">{qtdTurmasAtivas}</span>
          <span className="cursos-kpi__rotulo">Turmas em andamento</span>
        </li>
        <li className="cursos-kpi">
          <span className="cursos-kpi__valor">{listaCursos.length}</span>
          <span className="cursos-kpi__rotulo">Sob coordenação</span>
        </li>
      </ul>

      {/* Cabeçalho da listagem */}
      <div className="desempenho-cursos-cabecalho" aria-hidden="true">
        <span className="desempenho-cursos-cabecalho__col desempenho-cursos-cabecalho__col--identidade">Curso</span>
        <span className="desempenho-cursos-cabecalho__col desempenho-cursos-cabecalho__col--turma">Turma / Professor</span>
        <span className="desempenho-cursos-cabecalho__col desempenho-cursos-cabecalho__col--alunos">Alunos</span>
        <span className="desempenho-cursos-cabecalho__col desempenho-cursos-cabecalho__col--metricas">Módulos / Aval.</span>
        <span className="desempenho-cursos-cabecalho__col desempenho-cursos-cabecalho__col--acoes" />
      </div>

      {/* Lista de desempenho */}
      <ul className="desempenho-cursos" role="list" aria-label="Desempenho dos cursos">
        {listaCursos.filter((c) => c.ativo).map((curso) => {
          const turmasCurso   = turmas.filter((t) => t.cursoId === curso.id);
          const modulosCurso  = modulos.filter((m) => m.cursoId === curso.id);
          const avsPublicadas = avaliacoes.filter((a) => a.cursoId === curso.id && a.status === "Publicada");
          const totalAlunos   = turmasCurso.reduce((s, t) => s + (t.totalAlunos ?? 0), 0);
          const turmaAtiva    = turmasCurso.find((t) => t.status === "Ativa");
          return (
            <li key={curso.id} className="desempenho-curso-item">
              <div className="desempenho-curso-item__identidade">
                <div className="desempenho-curso-item__cabecalho">
                  <h3 className="desempenho-curso-item__titulo">{curso.titulo}</h3>
                </div>
                <div className="desempenho-curso-item__meta">
                  <span className="desempenho-curso-item__codigo">{curso.codigoRegistro}</span>
                  <Insignia texto={curso.nivel} variante="neutro" />

                </div>
              </div>

              <div className="desempenho-curso-item__turma">
                {turmaAtiva ? (
                  <>
                    <span className="desempenho-curso-item__turma-nome">{turmaAtiva.nomeTurma}</span>
                    <span className="desempenho-curso-item__professor">
                      {turmaAtiva.professorNome ?? curso.professorNome ?? "Sem professor"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="desempenho-curso-item__sem-turma">Sem turma ativa</span>
                    {curso.professorNome && (
                      <span className="desempenho-curso-item__professor">{curso.professorNome}</span>
                    )}
                  </>
                )}
              </div>

              <div className="desempenho-curso-item__alunos">
                <span className="desempenho-curso-item__alunos-num">{totalAlunos}</span>
              </div>

              <div className="desempenho-curso-item__metricas">
                <span className="desempenho-metrica">
                  <strong>{modulosCurso.length}</strong> módulos
                </span>
                <span className="desempenho-metrica">
                  <strong>{avsPublicadas.length}</strong> avaliações
                </span>
              </div>

              <div className="menu-contexto">
                <button
                  className="menu-contexto__botao"
                  onClick={() => setMenuAberto(menuAberto === curso.id ? null : curso.id)}
                  aria-label={`Opções para ${curso.titulo}`}
                  aria-expanded={menuAberto === curso.id}
                  type="button"
                >···</button>
                {menuAberto === curso.id && (
                  <ul className="menu-contexto__lista" role="menu">
                    <li>
                      <button role="menuitem" onClick={() => { setCursoSelecionado(curso); setMenuAberto(null); }}>
                        Opções
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {listaCursos.filter((c) => c.ativo).length === 0 && (
        <p className="texto-vazio texto-vazio--central" role="status">Nenhum curso ativo sob sua coordenação.</p>
      )}

      {/* Overlay dropdown */}
      {menuAberto && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setMenuAberto(null)} aria-hidden="true" />
      )}

      {/* Modal detalhes + atribuição de professor */}
      {cursoSelecionado && (
        <Modal titulo="Detalhes do Curso" onFechar={tentarFechar} className="modal-caixa--largo">
          <form onSubmit={salvarAlteracoes}>
            <dl className="lista-detalhes">
              <div className="lista-detalhes__item"><dt>Título</dt><dd>{cursoSelecionado.titulo}</dd></div>
              <div className="lista-detalhes__item"><dt>Código</dt><dd>{cursoSelecionado.codigoRegistro}</dd></div>
              <div className="lista-detalhes__item"><dt>Nível</dt><dd>{cursoSelecionado.nivel}</dd></div>
              <div className="lista-detalhes__item"><dt>Descrição</dt><dd>{cursoSelecionado.descricao || "—"}</dd></div>
              <div className="lista-detalhes__item"><dt>Módulos</dt><dd>{modulos.filter((m) => m.cursoId === cursoSelecionado.id).length}</dd></div>
              <div className="lista-detalhes__item"><dt>Alunos</dt><dd>{turmas.filter((t) => t.cursoId === cursoSelecionado.id).reduce((a, t) => a + (t.totalAlunos ?? 0), 0)}</dd></div>
            </dl>

            <div className="detalhe-atribuicoes" style={{ gridTemplateColumns: "1fr" }}>
              <div className="campo">
                <label className="campo__rotulo" htmlFor="coord-professor">Professor</label>
                <select id="coord-professor" className="campo__entrada" defaultValue={cursoSelecionado.professorId ?? ""} onChange={() => setFormSujo(true)}>
                  <option value="">Sem professor</option>
                  {professoresAtivos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-rodape">
              <Botao variante="perigo" type="button" onClick={tentarFechar} style={{ marginRight: "auto" }}>Fechar</Botao>
              <Botao variante="primario" type="submit">Salvar alterações</Botao>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirmação de saída sem salvar */}
      {confirmarSaida && (
        <Modal titulo="Sair sem salvar?" onFechar={() => setConfirmarSaida(false)}>
          <p style={{ fontSize: "0.9rem", color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-md)" }}>
            Há alterações não salvas na atribuição do professor. Se sair agora, as alterações serão perdidas.
          </p>
          <div className="modal-rodape">
            <Botao variante="fantasma" onClick={() => setConfirmarSaida(false)}>Continuar editando</Botao>
            <Botao variante="perigo" onClick={() => { setCursoSelecionado(null); }}>Sair sem salvar</Botao>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function TelaCursos({ usuario, listaCursos, onListaCursosChange, onToast }) {
  if (usuario?.tipo === "Coordenador") return <VistaGerencialCoordenador usuario={usuario} />;

  const [filtro, setFiltro]                     = useState("");
  const [modalAberto, setModalAberto]           = useState(false);
  const [cursoSelecionado, setCursoSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao]             = useState(false);
  const [popupExclusao, setPopupExclusao]       = useState(false);
  const [menuAberto, setMenuAberto]             = useState(null);
  const [cursoDetalhe, setCursoDetalhe]         = useState(null);
  const [formSujo, setFormSujo]                 = useState(false);
  const [confirmarSaida, setConfirmarSaida]     = useState(false);

  useEffect(() => { setFormSujo(false); setConfirmarSaida(false); }, [cursoDetalhe]);

  const tipo = usuario?.tipo;
  const professoresAtivos    = db.usuarios.listar().filter((u) => u.tipo === "Professor"    && u.ativo);
  const coordenadoresAtivos  = db.usuarios.listar().filter((u) => u.tipo === "Coordenador"  && u.ativo);

  const cursosAtivos = listaCursos
    .filter((c) => c.ativo)
    .filter((c) =>
      c.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
      c.nivel.toLowerCase().includes(filtro.toLowerCase())
    );

  const totalAtivos      = listaCursos.filter((c) => c.ativo).length;
  const totalAlunosSoma  = listaCursos.filter((c) => c.ativo).reduce((acc, c) => acc + (c.totalAlunos ?? 0), 0);
  const qtdTurmasAtivas  = turmas.filter((t) => t.status === "Ativa").length;
  const qtdAvalPublicadas = avaliacoes.filter((a) => a.status === "Publicada").length;

  function abrirEdicao(curso) {
    setCursoSelecionado(curso);
    setModoEdicao(true);
    setModalAberto(true);
  }

  function tentarFecharDetalhe() {
    if (formSujo) { setConfirmarSaida(true); } else { setCursoDetalhe(null); }
  }

  function salvarAlteracoes(e) {
    e.preventDefault();
    const profId  = Number(e.target["det-professor"].value)  || null;
    const coordId = Number(e.target["det-coordenador"].value) || null;
    const prof  = professoresAtivos.find((p) => p.id === profId);
    const coord = coordenadoresAtivos.find((c) => c.id === coordId);
    onListaCursosChange((prev) =>
      prev.map((c) =>
        c.id === cursoDetalhe.id
          ? { ...c,
              professorId:    profId,  professorNome:    prof?.nome  ?? null,
              coordenadorId:  coordId, coordenadorNome:  coord?.nome ?? null }
          : c
      )
    );
    onToast?.("Atribuições salvas.", "sucesso");
    setCursoDetalhe(null);
  }

  function abrirExclusao(curso) {
    setCursoSelecionado(curso);
    setPopupExclusao(true);
  }

  function excluirCurso() {
    const titulo = cursoSelecionado.titulo;
    onListaCursosChange((prev) => prev.filter((c) => c.id !== cursoSelecionado.id));
    setPopupExclusao(false);
    onToast?.(`Curso "${titulo}" excluído.`, "sucesso");
  }

  function criarCurso(e) {
    e.preventDefault();
    const f = e.target;
    onListaCursosChange((prev) => [...prev, {
      id: Date.now(),
      codigoRegistro: `CRS-${String(prev.length + 1).padStart(3, "0")}`,
      titulo:   f["titulo-curso"].value,
      descricao: f["descricao-curso"].value,
      nivel:    f["nivel-curso"].value,
      preco: 0, totalModulos: 0, totalAlunos: 0, ativo: true,
      visivelCatalogo: false, destaque: false,
    }]);
    setModalAberto(false);
    onToast?.("Curso criado.", "sucesso");
  }

  function salvarEdicaoCurso(e) {
    e.preventDefault();
    const f = e.target;
    onListaCursosChange((prev) => prev.map((c) =>
      c.id === cursoSelecionado.id
        ? { ...c, titulo: f["edit-titulo-curso"].value, descricao: f["edit-descricao-curso"].value, nivel: f["edit-nivel-curso"].value }
        : c
    ));
    setModalAberto(false);
    onToast?.("Curso atualizado.", "sucesso");
  }

  return (
    <div className="tela-cursos">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Cursos</h2>
          <p className="cabecalho-pagina__subtitulo">{totalAtivos} cursos ativos na plataforma</p>
        </div>
        {podeCriar(tipo, "cursos") && (
          <Botao variante="primario" onClick={() => { setCursoSelecionado(null); setModoEdicao(false); setModalAberto(true); }}>
            + Novo Curso
          </Botao>
        )}
      </header>

      {/* KPIs */}
      <ul className="cursos-kpis" aria-label="Indicadores gerais">
        <li className="cursos-kpi">
          <span className="cursos-kpi__valor">{totalAtivos}</span>
          <span className="cursos-kpi__rotulo">Cursos ativos</span>
        </li>
        <li className="cursos-kpi">
          <span className="cursos-kpi__valor">{totalAlunosSoma}</span>
          <span className="cursos-kpi__rotulo">Alunos matriculados</span>
        </li>
        <li className="cursos-kpi">
          <span className="cursos-kpi__valor">{qtdTurmasAtivas}</span>
          <span className="cursos-kpi__rotulo">Turmas em andamento</span>
        </li>
        <li className="cursos-kpi">
          <span className="cursos-kpi__valor">{qtdAvalPublicadas}</span>
          <span className="cursos-kpi__rotulo">Avaliações publicadas</span>
        </li>
      </ul>

      {/* Filtro */}
      <div className="barra-filtros">
        <label htmlFor="busca-cursos" className="visualmente-oculto">Buscar curso</label>
        <input
          id="busca-cursos"
          type="search"
          className="campo__entrada barra-filtros__busca"
          placeholder="Buscar por título ou nível..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      {/* Cabeçalho da listagem */}
      <div className="desempenho-cursos-cabecalho" aria-hidden="true">
        <span className="desempenho-cursos-cabecalho__col desempenho-cursos-cabecalho__col--identidade">Curso</span>
        <span className="desempenho-cursos-cabecalho__col desempenho-cursos-cabecalho__col--turma">Turma / Professor</span>
        <span className="desempenho-cursos-cabecalho__col desempenho-cursos-cabecalho__col--alunos">Alunos</span>
        <span className="desempenho-cursos-cabecalho__col desempenho-cursos-cabecalho__col--metricas">Módulos / Aval.</span>
        <span className="desempenho-cursos-cabecalho__col desempenho-cursos-cabecalho__col--acoes" />
      </div>

      {/* Lista de desempenho */}
      <ul className="desempenho-cursos" role="list" aria-label="Desempenho dos cursos ativos">
        {cursosAtivos.map((curso) => {
          const turmasCurso   = turmas.filter((t) => t.cursoId === curso.id);
          const modulosCurso  = modulos.filter((m) => m.cursoId === curso.id);
          const avsPublicadas = avaliacoes.filter((a) => a.cursoId === curso.id && a.status === "Publicada");
          const totalAlunos   = turmasCurso.reduce((s, t) => s + (t.totalAlunos ?? 0), 0);
          const turmaAtiva    = turmasCurso.find((t) => t.status === "Ativa");
          return (
            <li key={curso.id} className="desempenho-curso-item">
              {/* Nome + código + nível */}
              <div className="desempenho-curso-item__identidade">
                <div className="desempenho-curso-item__cabecalho">
                  <h3 className="desempenho-curso-item__titulo">{curso.titulo}</h3>
                </div>
                <div className="desempenho-curso-item__meta">
                  <span className="desempenho-curso-item__codigo">{curso.codigoRegistro}</span>
                  <Insignia texto={curso.nivel} variante="neutro" />

                </div>
              </div>

              {/* Turma e professor */}
              <div className="desempenho-curso-item__turma">
                {turmaAtiva ? (
                  <>
                    <span className="desempenho-curso-item__turma-nome">{turmaAtiva.nomeTurma}</span>
                    <span className="desempenho-curso-item__professor">
                      {turmaAtiva.professorNome ?? curso.professorNome ?? "Sem professor"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="desempenho-curso-item__sem-turma">Sem turma ativa</span>
                    {curso.professorNome && (
                      <span className="desempenho-curso-item__professor">{curso.professorNome}</span>
                    )}
                  </>
                )}
              </div>

              {/* Alunos */}
              <div className="desempenho-curso-item__alunos">
                <span className="desempenho-curso-item__alunos-num">{totalAlunos}</span>
              </div>

              {/* Módulos e avaliações */}
              <div className="desempenho-curso-item__metricas">
                <span className="desempenho-metrica">
                  <strong>{modulosCurso.length}</strong> módulos
                </span>
                <span className="desempenho-metrica">
                  <strong>{avsPublicadas.length}</strong> avaliações
                </span>
              </div>

              {/* Menu de ações */}
              <div className="menu-contexto">
                <button
                  className="menu-contexto__botao"
                  onClick={() => setMenuAberto(menuAberto === curso.id ? null : curso.id)}
                  aria-label={`Opções para ${curso.titulo}`}
                  aria-expanded={menuAberto === curso.id}
                  type="button"
                >···</button>
                {menuAberto === curso.id && (
                  <ul className="menu-contexto__lista" role="menu">
                    <li>
                      <button role="menuitem" onClick={() => { setCursoDetalhe(curso); setMenuAberto(null); }}>
                        Opções
                      </button>
                    </li>
                    {podeExcluir(tipo, "cursos") && (
                      <li>
                        <button role="menuitem" className="menu-item--perigo" onClick={() => { abrirExclusao(curso); setMenuAberto(null); }}>
                          Excluir
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

      {cursosAtivos.length === 0 && (
        <p className="texto-vazio texto-vazio--central" role="status">
          {filtro ? `Nenhum curso encontrado para "${filtro}".` : "Nenhum curso ativo cadastrado."}
        </p>
      )}

      {/* Overlay dropdown */}
      {menuAberto && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setMenuAberto(null)} aria-hidden="true" />
      )}

      {/* Modal detalhes + atribuições */}
      {cursoDetalhe && (
        <Modal titulo="Detalhes do Curso" onFechar={tentarFecharDetalhe} className="modal-caixa--largo">
          <form onSubmit={salvarAlteracoes}>
            <dl className="lista-detalhes">
              <div className="lista-detalhes__item"><dt>Título</dt><dd>{cursoDetalhe.titulo}</dd></div>
              <div className="lista-detalhes__item"><dt>Código</dt><dd>{cursoDetalhe.codigoRegistro}</dd></div>
              <div className="lista-detalhes__item"><dt>Nível</dt><dd>{cursoDetalhe.nivel}</dd></div>
              <div className="lista-detalhes__item"><dt>Descrição</dt><dd>{cursoDetalhe.descricao || "—"}</dd></div>
              <div className="lista-detalhes__item"><dt>Catálogo</dt><dd>{cursoDetalhe.visivelCatalogo ? "Visível" : "Oculto"}</dd></div>
            </dl>

            {podeEditar(tipo, "cursos") && (
              <div className="detalhe-atribuicoes">
                <div className="campo">
                  <label className="campo__rotulo" htmlFor="det-professor">Professor</label>
                  <select id="det-professor" className="campo__entrada" defaultValue={cursoDetalhe.professorId ?? ""} onChange={() => setFormSujo(true)}>
                    <option value="">Sem professor</option>
                    {professoresAtivos.map((p) => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="campo">
                  <label className="campo__rotulo" htmlFor="det-coordenador">Coordenador</label>
                  <select id="det-coordenador" className="campo__entrada" defaultValue={cursoDetalhe.coordenadorId ?? ""} onChange={() => setFormSujo(true)}>
                    <option value="">Sem coordenador</option>
                    {coordenadoresAtivos.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="modal-rodape">
              <Botao variante="perigo" type="button" onClick={tentarFecharDetalhe} style={{ marginRight: "auto" }}>Fechar</Botao>
              {podeEditar(tipo, "cursos") && (
                <Botao variante="secundario" type="button" onClick={() => { abrirEdicao(cursoDetalhe); setCursoDetalhe(null); }}>Editar curso</Botao>
              )}
              {podeEditar(tipo, "cursos") && (
                <Botao variante="primario" type="submit">Salvar alterações</Botao>
              )}
            </div>
          </form>

        </Modal>
      )}

      {/* Confirmação de saída sem salvar */}
      {confirmarSaida && (
        <Modal titulo="Sair sem salvar?" onFechar={() => setConfirmarSaida(false)}>
          <p style={{ fontSize: "0.9rem", color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-md)" }}>
            Há alterações não salvas nas atribuições. Se sair agora, as alterações serão perdidas.
          </p>
          <div className="modal-rodape">
            <Botao variante="fantasma" onClick={() => setConfirmarSaida(false)}>Continuar editando</Botao>
            <Botao variante="perigo" onClick={() => { setCursoDetalhe(null); }}>Sair sem salvar</Botao>
          </div>
        </Modal>
      )}

      {/* Modal editar */}
      {modalAberto && cursoSelecionado && modoEdicao && (
        <Modal titulo="Editar Curso" onFechar={() => setModalAberto(false)}>
          <form className="formulario-modal" onSubmit={salvarEdicaoCurso}>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="edit-titulo-curso">Título *</label>
              <input id="edit-titulo-curso" className="campo__entrada" type="text" defaultValue={cursoSelecionado.titulo} required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="edit-descricao-curso">Descrição</label>
              <textarea id="edit-descricao-curso" className="campo__entrada" rows={3} defaultValue={cursoSelecionado.descricao} />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="edit-nivel-curso">Nível</label>
              <select id="edit-nivel-curso" className="campo__entrada" defaultValue={cursoSelecionado.nivel}>
                <option>Iniciante</option>
                <option>Intermediário</option>
                <option>Avançado</option>
              </select>
            </div>
            <div className="modal-rodape">
              <Botao variante="fantasma" type="button" onClick={() => setModalAberto(false)}>Cancelar</Botao>
              <Botao variante="primario" type="submit">Salvar alterações</Botao>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal criar */}
      {modalAberto && !cursoSelecionado && (
        <Modal titulo="Novo Curso" onFechar={() => setModalAberto(false)}>
          <form className="formulario-modal" onSubmit={criarCurso}>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="titulo-curso">Título *</label>
              <input id="titulo-curso" className="campo__entrada" type="text" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="descricao-curso">Descrição</label>
              <textarea id="descricao-curso" className="campo__entrada" rows={3} />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="nivel-curso">Nível</label>
              <select id="nivel-curso" className="campo__entrada">
                <option>Iniciante</option>
                <option>Intermediário</option>
                <option>Avançado</option>
              </select>
            </div>
            <div className="modal-rodape">
              <Botao variante="fantasma" type="button" onClick={() => setModalAberto(false)}>Cancelar</Botao>
              <Botao variante="primario" type="submit">Criar Curso</Botao>
            </div>
          </form>
        </Modal>
      )}

      {/* Popup de exclusão */}
      {popupExclusao && cursoSelecionado && (
        <Modal titulo="Excluir curso" onFechar={() => setPopupExclusao(false)}>
          <p style={{ fontSize: "0.9rem", color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-md)" }}>
            Tem certeza que deseja excluir o curso{" "}
            <strong style={{ color: "var(--cor-texto-forte)" }}>{cursoSelecionado.titulo}</strong>?
            <br />
            <span style={{ fontSize: "0.8rem", color: "#fca5a5", marginTop: "var(--espaco-xs)", display: "block" }}>
              Esta ação não pode ser desfeita.
            </span>
          </p>
          <div className="modal-rodape">
            <Botao variante="fantasma" onClick={() => setPopupExclusao(false)}>Cancelar</Botao>
            <Botao variante="perigo" onClick={excluirCurso}>Excluir permanentemente</Botao>
          </div>
        </Modal>
      )}
    </div>
  );
}
