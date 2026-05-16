import { useState } from "react";
import CartaoEstatistica from "@/componentes/CartaoEstatistica.jsx";
import Modal from "@/componentes/Modal.jsx";
import Botao from "@/componentes/Botao.jsx";
import Insignia from "@/componentes/Insignia.jsx";

export default function TelaCatalogo({ listaCursos, onListaCursosChange }) {
  const lista    = listaCursos;
  const setLista = onListaCursosChange;
  const [busca, setBusca] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");
  const [filtroVisivel, setFiltroVisivel] = useState("");
  const [cursoEditando, setCursoEditando] = useState(null);

  const totalVisiveis = lista.filter((c) => c.visivelCatalogo).length;
  const totalDestaque = lista.filter((c) => c.destaque).length;
  const totalOcultos  = lista.filter((c) => !c.visivelCatalogo).length;

  const filtrados = lista.filter((c) => {
    const matchBusca   = c.titulo.toLowerCase().includes(busca.toLowerCase());
    const matchNivel   = !filtroNivel || c.nivel === filtroNivel;
    const matchVisivel =
      !filtroVisivel ||
      (filtroVisivel === "visivel" && c.visivelCatalogo) ||
      (filtroVisivel === "oculto" && !c.visivelCatalogo);
    return matchBusca && matchNivel && matchVisivel;
  });

  function toggleVisivel(id) {
    setLista((prev) =>
      prev.map((c) => c.id === id ? { ...c, visivelCatalogo: !c.visivelCatalogo } : c)
    );
  }

  function toggleDestaque(id) {
    setLista((prev) =>
      prev.map((c) => c.id === id ? { ...c, destaque: !c.destaque } : c)
    );
  }

  function salvarEdicao(e) {
    e.preventDefault();
    const f = e.target;
    setLista((prev) =>
      prev.map((c) =>
        c.id === cursoEditando.id
          ? {
              ...c,
              descricao: f["cat-descricao"].value,
              preco:     parseFloat(f["cat-preco"].value) || c.preco,
              nivel:     f["cat-nivel"].value,

            }
          : c
      )
    );
    setCursoEditando(null);
  }

  return (
    <div className="tela-catalogo">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Catálogo Público</h2>
          <p className="cabecalho-pagina__subtitulo">
            Gerencie quais cursos aparecem na homepage da plataforma
          </p>
        </div>
      </header>

      <div className="grade-estatisticas" style={{ marginBottom: "var(--espaco-xl)" }}>
        <CartaoEstatistica icone="CU" valor={lista.length}     rotulo="Total de cursos" />
        <CartaoEstatistica icone="CL" valor={totalVisiveis}    rotulo="Visíveis no catálogo"  corBorda="var(--cor-sucesso)" />
        <CartaoEstatistica icone="★"  valor={totalDestaque}    rotulo="Em destaque"            corBorda="var(--cor-aviso)" />
        <CartaoEstatistica icone="○"  valor={totalOcultos}     rotulo="Ocultos da homepage"    corBorda="var(--cor-erro)" />
      </div>

      <div className="barra-filtros">
        <label htmlFor="cat-busca" className="visualmente-oculto">Buscar curso</label>
        <input
          id="cat-busca"
          type="search"
          className="campo__entrada barra-filtros__busca"
          placeholder="Buscar por título..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Filtrar cursos por título"
        />
        <select
          className="campo__entrada barra-filtros__select"
          value={filtroNivel}
          onChange={(e) => setFiltroNivel(e.target.value)}
          aria-label="Filtrar por nível"
        >
          <option value="">Todos os níveis</option>
          <option>Iniciante</option>
          <option>Intermediário</option>
          <option>Avançado</option>
        </select>
        <select
          className="campo__entrada barra-filtros__select"
          value={filtroVisivel}
          onChange={(e) => setFiltroVisivel(e.target.value)}
          aria-label="Filtrar por visibilidade"
        >
          <option value="">Toda visibilidade</option>
          <option value="visivel">Visíveis</option>
          <option value="oculto">Ocultos</option>
        </select>
      </div>

      <ul className="catalogo-grade" role="list" aria-label="Cursos do catálogo público">
        {filtrados.map((curso) => (
          <li
            key={curso.id}
            className={[
              "catalogo-card",
              !curso.visivelCatalogo ? "catalogo-card--oculto" : "",
              curso.destaque ? "catalogo-card--destaque" : "",
            ].filter(Boolean).join(" ")}
          >
            <div className="catalogo-card__topo">
              <div className="catalogo-card__identidade">
                <h3 className="catalogo-card__titulo">{curso.titulo}</h3>
                <span className="catalogo-card__codigo">{curso.codigoRegistro}</span>
              </div>
              <button
                className={`catalogo-card__btn-estrela${curso.destaque ? " catalogo-card__btn-estrela--ativo" : ""}`}
                onClick={() => toggleDestaque(curso.id)}
                aria-label={curso.destaque ? `Remover ${curso.titulo} dos destaques` : `Destacar ${curso.titulo}`}
                title={curso.destaque ? "Remover destaque" : "Marcar como destaque"}
                type="button"
              >
                {curso.destaque ? "★" : "☆"}
              </button>
            </div>

            <p className="catalogo-card__descricao">{curso.descricao}</p>

            <div className="catalogo-card__meta">
              <Insignia texto={curso.nivel} variante="info" />
              <span className="catalogo-card__preco">
                R$ {curso.preco.toFixed(2).replace(".", ",")}
              </span>

            </div>

            <footer className="catalogo-card__rodape">
              <button
                className={`catalogo-toggle${curso.visivelCatalogo ? " catalogo-toggle--ativo" : ""}`}
                onClick={() => toggleVisivel(curso.id)}
                aria-pressed={curso.visivelCatalogo}
                aria-label={`${curso.visivelCatalogo ? "Ocultar" : "Publicar"} ${curso.titulo} no catálogo`}
                type="button"
              >
                <span className="catalogo-toggle__trilha" aria-hidden="true">
                  <span className="catalogo-toggle__thumb" />
                </span>
                <span className="catalogo-toggle__rotulo">
                  {curso.visivelCatalogo ? "Visível" : "Oculto"}
                </span>
              </button>

              <Botao
                variante="fantasma"
                tamanho="pequeno"
                onClick={() => setCursoEditando({ ...curso })}
              >
                Editar
              </Botao>
            </footer>
          </li>
        ))}
      </ul>

      {filtrados.length === 0 && (
        <p className="texto-vazio texto-vazio--central" role="status">
          Nenhum curso encontrado.
        </p>
      )}

      {cursoEditando && (
        <Modal titulo="Editar informações do catálogo" onFechar={() => setCursoEditando(null)}>
          <form className="formulario-modal" onSubmit={salvarEdicao}>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="cat-descricao">Descrição</label>
              <textarea
                id="cat-descricao"
                className="campo__entrada"
                rows={3}
                defaultValue={cursoEditando.descricao}
              />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="cat-preco">Preço (R$)</label>
              <input
                id="cat-preco"
                className="campo__entrada"
                type="number"
                step="0.01"
                min="0"
                defaultValue={cursoEditando.preco}
              />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="cat-nivel">Nível</label>
              <select id="cat-nivel" className="campo__entrada" defaultValue={cursoEditando.nivel}>
                <option>Iniciante</option>
                <option>Intermediário</option>
                <option>Avançado</option>
              </select>
            </div>
            <footer className="modal-rodape">
              <Botao variante="fantasma" type="button" onClick={() => setCursoEditando(null)}>
                Cancelar
              </Botao>
              <Botao variante="primario" type="submit">
                Salvar
              </Botao>
            </footer>
          </form>
        </Modal>
      )}
    </div>
  );
}
