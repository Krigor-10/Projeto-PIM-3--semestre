import { useState } from "react";
import { TbPlus, TbDotsVertical, TbSettings } from "react-icons/tb";
import { motion } from "framer-motion";
import { MdSave } from "react-icons/md";
import CartaoEstatistica from "@/componentes/CartaoEstatistica.jsx";
import Modal from "@/componentes/Modal.jsx";
import Botao from "@/componentes/Botao.jsx";
import Insignia from "@/componentes/Insignia.jsx";
import SelectSimples from "@/componentes/SelectSimples.jsx";

export default function TelaCatalogo({ listaCursos, onListaCursosChange, onToast }) {
  const lista    = listaCursos;
  const setLista = onListaCursosChange;
  const [busca, setBusca] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");
  const [filtroVisivel, setFiltroVisivel] = useState("");
  const [cursoEditando, setCursoEditando]   = useState(null);
  const [nivelEditando, setNivelEditando]   = useState("Iniciante");
  const [modalNovo, setModalNovo]           = useState(false);
  const [nivelNovo, setNivelNovo]           = useState("Iniciante");
  const [visivelNovo, setVisivelNovo]       = useState(false);
  const [menuAbertoId, setMenuAbertoId]     = useState(null);

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
              nivel:     nivelEditando,

            }
          : c
      )
    );
    onToast?.("Curso atualizado.", "sucesso");
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
        <Botao variante="primario" onClick={() => { setModalNovo(true); setNivelNovo("Iniciante"); setVisivelNovo(false); }} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <motion.span whileHover={{ scale: 1.15, rotate: 90 }} transition={{ type: "spring", stiffness: 400, damping: 18 }} style={{ display: "flex" }}>
            <TbPlus size={20} aria-hidden="true" />
          </motion.span>
          Novo Curso
        </Botao>
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
        <SelectSimples
          value={filtroNivel}
          opcoes={[
            { valor: "", rotulo: "Todos os níveis" },
            { valor: "Iniciante",     rotulo: "Iniciante"     },
            { valor: "Intermediário", rotulo: "Intermediário" },
            { valor: "Avançado",      rotulo: "Avançado"      },
          ]}
          onChange={setFiltroNivel}
          placeholder="Todos os níveis"
        />
        <SelectSimples
          value={filtroVisivel}
          opcoes={[
            { valor: "", rotulo: "Toda visibilidade" },
            { valor: "visivel", rotulo: "Visíveis" },
            { valor: "oculto",  rotulo: "Ocultos"  },
          ]}
          onChange={setFiltroVisivel}
          placeholder="Toda visibilidade"
        />
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
              <div className="menu-contexto" style={{ position: "relative" }}>
                <button
                  className="menu-contexto__botao"
                  type="button"
                  aria-label={`Opções para ${curso.titulo}`}
                  aria-expanded={menuAbertoId === curso.id}
                  onClick={(e) => { e.stopPropagation(); setMenuAbertoId(menuAbertoId === curso.id ? null : curso.id); }}
                >
                  <TbDotsVertical size={16} aria-hidden="true" />
                </button>
                {menuAbertoId === curso.id && (
                  <ul className="menu-contexto__lista" role="menu">
                    <li>
                      <button type="button" role="menuitem" style={{ display: "flex", alignItems: "center", gap: "6px" }}
                        onClick={() => { setCursoEditando({ ...curso }); setNivelEditando(curso.nivel ?? "Iniciante"); setMenuAbertoId(null); }}>
                        <TbSettings size={15} aria-hidden="true" />Opções
                      </button>
                    </li>
                  </ul>
                )}
              </div>
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

              <button
                className={`catalogo-card__btn-estrela${curso.destaque ? " catalogo-card__btn-estrela--ativo" : ""}`}
                onClick={() => toggleDestaque(curso.id)}
                aria-label={curso.destaque ? `Remover ${curso.titulo} dos destaques` : `Destacar ${curso.titulo}`}
                title={curso.destaque ? "Remover destaque" : "Marcar como destaque"}
                type="button"
              >
                {curso.destaque ? "★" : "☆"}
              </button>
            </footer>
          </li>
        ))}
      </ul>

      {filtrados.length === 0 && (
        <p className="texto-vazio texto-vazio--central" role="status">
          Nenhum curso encontrado.
        </p>
      )}

      {modalNovo && (
        <Modal titulo="Novo Curso" onFechar={() => setModalNovo(false)}>
          <form
            className="formulario-modal"
            onSubmit={(e) => {
              e.preventDefault();
              const f = e.target;
              setLista((prev) => [...prev, {
                id:              Date.now(),
                titulo:          f["novo-titulo"].value.trim(),
                descricao:       f["novo-descricao"].value.trim(),
                preco:           parseFloat(f["novo-preco"].value) || 0,
                nivel:           nivelNovo,
                visivelCatalogo: visivelNovo,
                destaque:        false,
                codigoRegistro:  `CRS-${Date.now().toString().slice(-5)}`,
              }]);
              onToast?.("Curso criado com sucesso.", "sucesso");
              setModalNovo(false);
            }}
          >
            <div className="campo">
              <label className="campo__rotulo" htmlFor="novo-titulo">Título *</label>
              <input id="novo-titulo" className="campo__entrada" type="text" required />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="novo-descricao">Descrição</label>
              <textarea id="novo-descricao" className="campo__entrada" rows={3} />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="novo-nivel">Nível</label>
              <SelectSimples
                id="novo-nivel"
                value={nivelNovo}
                opcoes={["Iniciante", "Intermediário", "Avançado"]}
                onChange={setNivelNovo}
              />
            </div>
            <div className="campo">
              <label className="campo__rotulo" htmlFor="novo-preco">Preço (R$)</label>
              <input id="novo-preco" className="campo__entrada" type="number" step="0.01" min="0" defaultValue="0" />
            </div>
            <div className="campo">
              <span className="campo__rotulo">Visibilidade no catálogo</span>
              <button
                type="button"
                className={`catalogo-toggle${visivelNovo ? " catalogo-toggle--ativo" : ""}`}
                onClick={() => setVisivelNovo((v) => !v)}
                aria-pressed={visivelNovo}
              >
                <span className="catalogo-toggle__trilha" aria-hidden="true">
                  <span className="catalogo-toggle__thumb" />
                </span>
                <span className="catalogo-toggle__rotulo">
                  {visivelNovo ? "Visível" : "Oculto"}
                </span>
              </button>
            </div>
            <footer className="modal-rodape">
              <Botao variante="perigo" type="button" onClick={() => setModalNovo(false)}>Cancelar</Botao>
              <Botao variante="primario" type="submit" style={{ display: "flex", alignItems: "center", gap: "6px" }}><MdSave size={19} aria-hidden="true" />Salvar</Botao>
            </footer>
          </form>
        </Modal>
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
              <SelectSimples
                id="cat-nivel"
                value={nivelEditando}
                opcoes={["Iniciante", "Intermediário", "Avançado"]}
                onChange={setNivelEditando}
              />
            </div>
            <footer className="modal-rodape">
              <Botao variante="perigo" type="button" onClick={() => setCursoEditando(null)}>
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
