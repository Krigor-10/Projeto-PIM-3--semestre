import { useState } from "react";
import Insignia from "@/componentes/Insignia.jsx";
import Modal from "@/componentes/Modal.jsx";
import Botao from "@/componentes/Botao.jsx";
import { cursos, turmas, modulos } from "@/dados/dadosMock.js";
import { podeCriar, podeEditar } from "@/dados/permissoes.js";

/* ── Vista gerencial do coordenador ─────────────────────────────── */

function VistaGerencialCoordenador({ usuario }) {
  const [cursoSelecionado, setCursoSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao]             = useState(false);
  const [listaCursos, setListaCursos]           = useState(
    cursos.filter((c) => c.coordenadorId === usuario.id)
  );

  const turmasTotal   = turmas.filter((t) => listaCursos.some((c) => c.id === t.cursoId));
  const alunosTotal   = turmasTotal.reduce((acc, t) => acc + (t.totalAlunos ?? 0), 0);
  const profsUnicos   = new Set(turmasTotal.map((t) => t.professorId)).size;

  function salvarEdicao(e) {
    e.preventDefault();
    const f = e.target;
    setListaCursos((prev) => prev.map((c) =>
      c.id === cursoSelecionado.id
        ? { ...c,
            titulo:  f["edit-titulo-curso"].value,
            descricao: f["edit-descricao-curso"].value,
            nivel:   f["edit-nivel-curso"].value,
            duracao: f["edit-duracao-curso"].value,
          }
        : c
    ));
    setCursoSelecionado(null);
  }

  return (
    <div className="tela-cursos">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Cursos</h2>
          <p className="cabecalho-pagina__subtitulo">
            Cursos sob sua coordenação
          </p>
        </div>
      </header>

      <dl className="gerencial-stats-barra" aria-label="Resumo dos cursos">
        <div><dt>Cursos</dt><dd>{listaCursos.length}</dd></div>
        <div><dt>Turmas</dt><dd>{turmasTotal.length}</dd></div>
        <div><dt>Alunos</dt><dd>{alunosTotal}</dd></div>
        <div><dt>Professores</dt><dd>{profsUnicos}</dd></div>
      </dl>

      {/* Lista de cursos */}
      <ul className="gerencial-cursos__lista" role="list">
        {listaCursos.map((curso) => {
          const turmasCurso  = turmas.filter((t) => t.cursoId === curso.id);
          const modulosCurso = modulos.filter((m) => m.cursoId === curso.id);
          const alunosCurso  = turmasCurso.reduce((acc, t) => acc + (t.totalAlunos ?? 0), 0);

          return (
            <li key={curso.id} className="gerencial-curso-item">
              <div className="gerencial-curso-item__topo">
                <div className="gerencial-curso-item__identidade">
                  <h3 className="gerencial-curso-item__titulo">{curso.titulo}</h3>
                  <span className="gerencial-curso-item__codigo">{curso.codigoRegistro}</span>
                </div>
                <div className="gerencial-curso-item__badges">
                  <Insignia texto={curso.nivel} variante="info" />
                  <Insignia texto={curso.ativo ? "Ativo" : "Inativo"} variante={curso.ativo ? "sucesso" : "erro"} />
                </div>
              </div>

              <div className="gerencial-curso-item__stats">
                <span>{modulosCurso.length} módulos</span>
                <span>{turmasCurso.length} turma{turmasCurso.length !== 1 ? "s" : ""}</span>
                <span>{alunosCurso} alunos</span>
                <span>{curso.duracao}</span>
              </div>

              <div className="gerencial-curso-item__rodape">
                <Botao variante="fantasma" tamanho="pequeno"
                  onClick={() => { setCursoSelecionado(curso); setModoEdicao(false); }}>
                  Detalhes
                </Botao>
                <Botao variante="fantasma" tamanho="pequeno"
                  onClick={() => { setCursoSelecionado(curso); setModoEdicao(true); }}>
                  Editar
                </Botao>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Modal detalhes / edição */}
      {cursoSelecionado && !modoEdicao && (
        <Modal titulo="Detalhes do Curso" onFechar={() => setCursoSelecionado(null)}>
          <dl className="lista-detalhes">
            <div className="lista-detalhes__item"><dt>Título</dt><dd>{cursoSelecionado.titulo}</dd></div>
            <div className="lista-detalhes__item"><dt>Código</dt><dd>{cursoSelecionado.codigoRegistro}</dd></div>
            <div className="lista-detalhes__item"><dt>Descrição</dt><dd>{cursoSelecionado.descricao}</dd></div>
            <div className="lista-detalhes__item"><dt>Nível</dt><dd>{cursoSelecionado.nivel}</dd></div>
            <div className="lista-detalhes__item"><dt>Duração</dt><dd>{cursoSelecionado.duracao}</dd></div>
            <div className="lista-detalhes__item"><dt>Módulos</dt><dd>{modulos.filter((m) => m.cursoId === cursoSelecionado.id).length}</dd></div>
            <div className="lista-detalhes__item"><dt>Alunos matriculados</dt><dd>{turmas.filter((t) => t.cursoId === cursoSelecionado.id).reduce((a, t) => a + (t.totalAlunos ?? 0), 0)}</dd></div>
            <div className="lista-detalhes__item"><dt>Status</dt><dd><Insignia texto={cursoSelecionado.ativo ? "Ativo" : "Inativo"} /></dd></div>
          </dl>
          <div className="modal-rodape">
            <Botao variante="fantasma" onClick={() => setCursoSelecionado(null)}>Fechar</Botao>
            <Botao variante="primario" onClick={() => setModoEdicao(true)}>Editar Curso</Botao>
          </div>
        </Modal>
      )}

      {cursoSelecionado && modoEdicao && (
        <Modal titulo="Editar Curso" onFechar={() => setCursoSelecionado(null)}>
          <form className="formulario-modal" onSubmit={salvarEdicao}>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="edit-titulo-curso">Título *</label>
              <input id="edit-titulo-curso" className="campo__entrada" type="text" defaultValue={cursoSelecionado.titulo} required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="edit-descricao-curso">Descrição</label>
              <textarea id="edit-descricao-curso" className="campo__entrada" rows={3} defaultValue={cursoSelecionado.descricao} />
            </div>
            <div className="grade-2">
              <div className="campo">
                <label className="campo__rotulo" htmlFor="edit-nivel-curso">Nível</label>
                <select id="edit-nivel-curso" className="campo__entrada" defaultValue={cursoSelecionado.nivel}>
                  <option>Iniciante</option>
                  <option>Intermediário</option>
                  <option>Avançado</option>
                </select>
              </div>
              <div className="campo">
                <label className="campo__rotulo" htmlFor="edit-duracao-curso">Duração</label>
                <input id="edit-duracao-curso" className="campo__entrada" type="text" defaultValue={cursoSelecionado.duracao} />
              </div>
            </div>
            <footer className="modal-rodape">
              <Botao variante="fantasma" type="button" onClick={() => setModoEdicao(false)}>Cancelar</Botao>
              <Botao variante="primario" type="submit">Salvar</Botao>
            </footer>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default function TelaCursos({ usuario }) {
  if (usuario?.tipo === "Coordenador") return <VistaGerencialCoordenador usuario={usuario} />;

  const [filtro, setFiltro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [cursoSelecionado, setCursoSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const cursosBase = usuario?.tipo === "Coordenador"
    ? cursos.filter((c) => c.coordenadorId === usuario.id)
    : cursos;

  const [listaCursos, setListaCursos] = useState(cursosBase);

  const tipo = usuario?.tipo;

  const cursosFiltrados = listaCursos.filter((c) =>
    c.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
    c.nivel.toLowerCase().includes(filtro.toLowerCase())
  );

  function abrirDetalhe(curso) {
    setCursoSelecionado(curso);
    setModoEdicao(false);
    setModalAberto(true);
  }

  function criarCurso(e) {
    e.preventDefault();
    const f = e.target;
    setListaCursos((prev) => [...prev, {
      id: Date.now(),
      codigoRegistro: `CRS-${String(prev.length + 1).padStart(3, "0")}`,
      titulo: f["titulo-curso"].value,
      descricao: f["descricao-curso"].value,
      nivel: f["nivel-curso"].value,
      duracao: f["duracao-curso"].value || "—",
      preco: 0,
      totalModulos: 0,
      totalAlunos: 0,
      ativo: true,
    }]);
    setModalAberto(false);
  }

  function salvarEdicaoCurso(e) {
    e.preventDefault();
    const f = e.target;
    setListaCursos((prev) => prev.map((c) =>
      c.id === cursoSelecionado.id
        ? { ...c, titulo: f["edit-titulo-curso"].value, descricao: f["edit-descricao-curso"].value, nivel: f["edit-nivel-curso"].value, duracao: f["edit-duracao-curso"].value }
        : c
    ));
    setModalAberto(false);
  }

  return (
    <div className="tela-cursos">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Cursos</h2>
          <p className="cabecalho-pagina__subtitulo">{listaCursos.length} cursos cadastrados na plataforma</p>
        </div>
        {/* Admin e Coordenador podem criar cursos; Professor apenas visualiza */}
        {podeCriar(tipo, "cursos") && (
          <Botao
            variante="primario"
            onClick={() => { setCursoSelecionado(null); setModoEdicao(false); setModalAberto(true); }}
          >
            + Novo Curso
          </Botao>
        )}
      </header>

      <div className="barra-filtros">
        <label htmlFor="busca-cursos" className="visualmente-oculto">Buscar curso</label>
        <input
          id="busca-cursos"
          type="search"
          className="campo__entrada barra-filtros__busca"
          placeholder="Buscar por título ou nível..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          aria-label="Filtrar cursos por título ou nível"
        />
      </div>

      <ul className="grade-cursos" role="list" aria-label="Lista de cursos">
        {cursosFiltrados.map((curso) => (
          <li key={curso.id}>
            <article
              className="cartao-curso"
              onClick={() => abrirDetalhe(curso)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && abrirDetalhe(curso)}
              aria-label={`Ver detalhes do curso ${curso.titulo}`}
            >
              <div className="cartao-curso__topo" aria-hidden="true" />
              <div className="cartao-curso__corpo">
                <div className="cartao-curso__cabecalho">
                  <h3 className="cartao-curso__titulo">{curso.titulo}</h3>
                  <Insignia texto={curso.ativo ? "Ativo" : "Inativo"} variante={curso.ativo ? "sucesso" : "erro"} />
                </div>
                <p className="cartao-curso__descricao">{curso.descricao}</p>
                <ul className="cartao-curso__meta" aria-label="Detalhes do curso">
                  <li>{curso.duracao}</li>
                  <li>{curso.nivel}</li>
                  <li>{curso.totalModulos} módulos</li>
                  <li>{curso.totalAlunos} alunos</li>
                </ul>
              </div>
              <div className="cartao-curso__rodape">
                {tipo !== "Coordenador" && (
                  <strong className="cartao-curso__preco">
                    R$ {curso.preco.toFixed(2).replace(".", ",")}
                  </strong>
                )}
                <span className="cartao-curso__codigo">{curso.codigoRegistro}</span>
              </div>
            </article>
          </li>
        ))}
      </ul>

      {cursosFiltrados.length === 0 && (
        <p className="texto-vazio texto-vazio--central" role="status">
          Nenhum curso encontrado para "{filtro}".
        </p>
      )}

      {modalAberto && (
        <Modal
          titulo={cursoSelecionado ? (modoEdicao ? "Editar Curso" : "Detalhes do Curso") : "Novo Curso"}
          onFechar={() => setModalAberto(false)}
        >
          {cursoSelecionado && !modoEdicao && (
            <>
              <dl className="lista-detalhes">
                <div className="lista-detalhes__item"><dt>Título</dt><dd>{cursoSelecionado.titulo}</dd></div>
                <div className="lista-detalhes__item"><dt>Código</dt><dd>{cursoSelecionado.codigoRegistro}</dd></div>
                <div className="lista-detalhes__item"><dt>Descrição</dt><dd>{cursoSelecionado.descricao}</dd></div>
                <div className="lista-detalhes__item"><dt>Nível</dt><dd>{cursoSelecionado.nivel}</dd></div>
                <div className="lista-detalhes__item"><dt>Duração</dt><dd>{cursoSelecionado.duracao}</dd></div>
                {tipo !== "Coordenador" && (
                  <div className="lista-detalhes__item"><dt>Preço</dt><dd>R$ {cursoSelecionado.preco.toFixed(2).replace(".", ",")}</dd></div>
                )}
                <div className="lista-detalhes__item"><dt>Módulos</dt><dd>{cursoSelecionado.totalModulos}</dd></div>
                <div className="lista-detalhes__item"><dt>Alunos matriculados</dt><dd>{cursoSelecionado.totalAlunos}</dd></div>
                <div className="lista-detalhes__item"><dt>Status</dt><dd><Insignia texto={cursoSelecionado.ativo ? "Ativo" : "Inativo"} /></dd></div>
              </dl>
              <div className="modal-rodape">
                <Botao variante="fantasma" onClick={() => setModalAberto(false)}>Fechar</Botao>
                {podeEditar(tipo, "cursos") && (
                  <Botao variante="primario" onClick={() => setModoEdicao(true)}>Editar Curso</Botao>
                )}
              </div>
            </>
          )}

          {cursoSelecionado && modoEdicao && (
            <form className="formulario-modal" onSubmit={salvarEdicaoCurso}>
              <div className="campo">
                <label className="campo__rotulo" htmlFor="edit-titulo-curso">Título *</label>
                <input id="edit-titulo-curso" className="campo__entrada" type="text" defaultValue={cursoSelecionado.titulo} required />
              </div>
              <div className="campo">
                <label className="campo__rotulo" htmlFor="edit-descricao-curso">Descrição</label>
                <textarea id="edit-descricao-curso" className="campo__entrada" rows={3} defaultValue={cursoSelecionado.descricao} />
              </div>
              <div className="grade-2">
                <div className="campo">
                  <label className="campo__rotulo" htmlFor="edit-nivel-curso">Nível</label>
                  <select id="edit-nivel-curso" className="campo__entrada" defaultValue={cursoSelecionado.nivel}>
                    <option>Iniciante</option>
                    <option>Intermediário</option>
                    <option>Avançado</option>
                  </select>
                </div>
                <div className="campo">
                  <label className="campo__rotulo" htmlFor="edit-duracao-curso">Duração</label>
                  <input id="edit-duracao-curso" className="campo__entrada" type="text" defaultValue={cursoSelecionado.duracao} />
                </div>
              </div>
              <div className="modal-rodape">
                <Botao variante="fantasma" onClick={() => setModoEdicao(false)}>Cancelar</Botao>
                <Botao variante="primario" type="submit">Salvar alterações</Botao>
              </div>
            </form>
          )}

          {!cursoSelecionado && (
            <form className="formulario-modal" onSubmit={criarCurso}>
              <div className="campo">
                <label className="campo__rotulo" htmlFor="titulo-curso">Título *</label>
                <input id="titulo-curso" className="campo__entrada" type="text" required />
              </div>
              <div className="campo">
                <label className="campo__rotulo" htmlFor="descricao-curso">Descrição</label>
                <textarea id="descricao-curso" className="campo__entrada" rows={3} />
              </div>
              <div className="grade-2">
                <div className="campo">
                  <label className="campo__rotulo" htmlFor="nivel-curso">Nível</label>
                  <select id="nivel-curso" className="campo__entrada">
                    <option>Iniciante</option>
                    <option>Intermediário</option>
                    <option>Avançado</option>
                  </select>
                </div>
                <div className="campo">
                  <label className="campo__rotulo" htmlFor="duracao-curso">Duração</label>
                  <input id="duracao-curso" className="campo__entrada" type="text" placeholder="Ex: 6 meses" />
                </div>
              </div>
              <div className="modal-rodape">
                <Botao variante="fantasma" onClick={() => setModalAberto(false)}>Cancelar</Botao>
                <Botao variante="primario" type="submit">Criar Curso</Botao>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
