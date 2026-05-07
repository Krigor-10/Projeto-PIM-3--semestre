import { useState } from "react";
import Insignia from "../../componentes/Insignia.jsx";
import Modal from "../../componentes/Modal.jsx";
import { cursos } from "../../dados/dadosMock.js";
import { podeCriar, podeEditar } from "../../dados/permissoes.js";

export default function TelaCursos({ usuario }) {
  const [filtro, setFiltro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [cursoSelecionado, setCursoSelecionado] = useState(null);

  const tipo = usuario?.tipo;

  const cursosFiltrados = cursos.filter((c) =>
    c.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
    c.nivel.toLowerCase().includes(filtro.toLowerCase())
  );

  function abrirDetalhe(curso) {
    setCursoSelecionado(curso);
    setModalAberto(true);
  }

  return (
    <div className="tela-cursos">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Cursos</h2>
          <p className="cabecalho-pagina__subtitulo">{cursos.length} cursos cadastrados na plataforma</p>
        </div>
        {/* Admin e Coordenador podem criar cursos; Professor apenas visualiza */}
        {podeCriar(tipo, "cursos") && (
          <button
            className="botao botao--primario"
            onClick={() => { setCursoSelecionado(null); setModalAberto(true); }}
            type="button"
          >
            + Novo Curso
          </button>
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
                <strong className="cartao-curso__preco">
                  R$ {curso.preco.toFixed(2).replace(".", ",")}
                </strong>
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
          titulo={cursoSelecionado ? "Detalhes do Curso" : "Novo Curso"}
          onFechar={() => setModalAberto(false)}
        >
          {cursoSelecionado ? (
            <>
              <dl className="lista-detalhes">
                <div className="lista-detalhes__item"><dt>Título</dt><dd>{cursoSelecionado.titulo}</dd></div>
                <div className="lista-detalhes__item"><dt>Código</dt><dd>{cursoSelecionado.codigoRegistro}</dd></div>
                <div className="lista-detalhes__item"><dt>Descrição</dt><dd>{cursoSelecionado.descricao}</dd></div>
                <div className="lista-detalhes__item"><dt>Nível</dt><dd>{cursoSelecionado.nivel}</dd></div>
                <div className="lista-detalhes__item"><dt>Duração</dt><dd>{cursoSelecionado.duracao}</dd></div>
                <div className="lista-detalhes__item"><dt>Preço</dt><dd>R$ {cursoSelecionado.preco.toFixed(2).replace(".", ",")}</dd></div>
                <div className="lista-detalhes__item"><dt>Módulos</dt><dd>{cursoSelecionado.totalModulos}</dd></div>
                <div className="lista-detalhes__item"><dt>Alunos matriculados</dt><dd>{cursoSelecionado.totalAlunos}</dd></div>
                <div className="lista-detalhes__item"><dt>Status</dt><dd><Insignia texto={cursoSelecionado.ativo ? "Ativo" : "Inativo"} /></dd></div>
              </dl>
              <div className="modal-rodape">
                <button className="botao botao--fantasma" onClick={() => setModalAberto(false)} type="button">Fechar</button>
                {podeEditar(tipo, "cursos") && (
                  <button className="botao botao--primario" type="button">Editar Curso</button>
                )}
              </div>
            </>
          ) : (
            <form className="formulario-modal" onSubmit={(e) => { e.preventDefault(); setModalAberto(false); }}>
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
                <button type="button" className="botao botao--fantasma" onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit" className="botao botao--primario">Criar Curso</button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
