/* ============================================================
   TelaCatalogo — Catálogo público de cursos
   Renderiza duas vistas distintas conforme o perfil do usuário:
   • VitrineCatalogo → aluno e professor: leitura, favoritos, solicitar matrícula
   • Vista admin (componente principal) → gerenciar visibilidade e destaque
   ============================================================ */
import { useState } from "react";
import { TbPlus, TbDotsVertical, TbSettings, TbCheck, TbClock, TbSend, TbX } from "react-icons/tb";
import { motion } from "framer-motion";
import { MdSave } from "react-icons/md";
import CartaoEstatistica from "@/componentes/CartaoEstatistica.jsx";
import Modal from "@/componentes/Modal.jsx";
import Botao from "@/componentes/Botao.jsx";
import Insignia from "@/componentes/Insignia.jsx";
import SelectSimples from "@/componentes/SelectSimples.jsx";
import { db } from "@/dados/db.js";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";

/* ── Vista do aluno / professor: somente leitura ─────────────── */
function VitrineCatalogo({ listaCursos, usuario, cursosFavoritos = new Set(), onAlternarFavorito, onToast }) {
  const [busca, setBusca] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");
  /* listaMatriculas e listaTurmas lidos do localStorage (db.js) */
  const [listaMatriculas, setListaMatriculas] = useState(() => db.matriculas.listar());
  const [listaTurmas] = useState(() => db.turmas.listar());
  const [modalMatricula, setModalMatricula] = useState(null);

  /* Sets para lookup O(1) — evita .find() dentro do .map() da grade */
  const cursosMatriculados = usuario?.tipo === "Aluno"
    ? new Set(listaMatriculas.filter((m) => m.alunoId === usuario.id && m.status === "Aprovada").map((m) => m.cursoId))
    : new Set();

  const cursosPendentes = usuario?.tipo === "Aluno"
    ? new Set(listaMatriculas.filter((m) => m.alunoId === usuario.id && m.status === "Pendente").map((m) => m.cursoId))
    : new Set();

  function abrirModalMatricula(curso) {
    /* Busca a primeira turma ativa do curso para pré-preencher o modal */
    const turma = listaTurmas.find((t) => t.cursoId === curso.id && t.status === "Ativa");
    setModalMatricula({ curso, turma: turma ?? null });
  }

  function confirmarMatricula() {
    const { curso, turma } = modalMatricula;
    if (!turma) return;
    const novaMatricula = {
      id: Date.now(),
      alunoId: usuario.id,
      alunoNome: usuario.nome,
      cursoId: curso.id,
      cursoTitulo: curso.titulo,
      turmaId: turma.id,
      turmaNome: turma.nomeTurma,
      /* Código gerado com timestamp para garantir unicidade no protótipo */
      codigoMatricula: `MAT-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      status: "Pendente", /* aprovação fica a cargo da coordenação */
      dataSolicitacao: new Date().toISOString().split("T")[0],
    };
    const atualizada = [...listaMatriculas, novaMatricula];
    db.matriculas.salvar(atualizada);
    setListaMatriculas(atualizada);
    setModalMatricula(null);
    onToast?.("Solicitação enviada! Aguarde aprovação.", "sucesso");
  }

  /* Cursos visíveis: destaques sempre primeiro, depois os demais */
  const visiveis = listaCursos.filter((c) => c.visivelCatalogo);
  const destaques = visiveis.filter((c) => c.destaque);
  const demais = visiveis.filter((c) => !c.destaque);
  const ordenados = [...destaques, ...demais];

  const filtrados = ordenados.filter((c) => {
    const matchBusca = c.titulo.toLowerCase().includes(busca.toLowerCase());
    const matchNivel = !filtroNivel || c.nivel === filtroNivel;
    return matchBusca && matchNivel;
  });

  return (
    <div className="tela-catalogo">
      <header className="cabecalho-pagina">
        <div>
          <h1 className="cabecalho-pagina__titulo">Catálogo de Cursos</h1>
          <p className="cabecalho-pagina__subtitulo">
            {visiveis.length} curso{visiveis.length !== 1 ? "s" : ""} disponível{visiveis.length !== 1 ? "eis" : ""}
            {destaques.length > 0 && ` · ${destaques.length} em destaque`}
          </p>
        </div>
      </header>

      <div className="barra-filtros">
        <label htmlFor="vitrine-busca" className="visualmente-oculto">Buscar curso</label>
        <input
          id="vitrine-busca"
          type="search"
          className="campo__entrada barra-filtros__busca"
          placeholder="Buscar por título..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <SelectSimples
          value={filtroNivel}
          opcoes={[
            { valor: "",              rotulo: "Todos os níveis"  },
            { valor: "Iniciante",     rotulo: "Iniciante"        },
            { valor: "Intermediário", rotulo: "Intermediário"    },
            { valor: "Avançado",      rotulo: "Avançado"         },
          ]}
          onChange={setFiltroNivel}
          placeholder="Todos os níveis"
        />
      </div>

      {filtrados.length === 0 ? (
        <p className="texto-vazio texto-vazio--central" role="status">Nenhum curso encontrado.</p>
      ) : (
        <ul className="catalogo-grade" role="list" aria-label="Cursos disponíveis">
          {filtrados.map((curso) => {
            const matriculado = cursosMatriculados.has(curso.id);
            const pendente    = cursosPendentes.has(curso.id);
            return (
              <li
                key={curso.id}
                className={[
                  "catalogo-card",
                  matriculado                        ? "catalogo-card--matriculado" : "",
                  pendente && !matriculado           ? "catalogo-card--pendente"    : "",
                  curso.destaque && !matriculado && !pendente ? "catalogo-card--destaque" : "",
                ].filter(Boolean).join(" ")}
              >
                <div className="catalogo-card__topo">
                  <h3 className="catalogo-card__titulo">{curso.titulo}</h3>
                  <span className="menu-contexto__botao" aria-hidden="true">
                    <TbDotsVertical size={16} />
                  </span>
                </div>
                <p className="catalogo-card__descricao">{curso.descricao}</p>
                <footer className="catalogo-card__rodape">
                  <div>
                    {matriculado && (
                      <span className="badge-matriculado">
                        <TbCheck size={12} aria-hidden="true" />
                        Matriculado
                      </span>
                    )}
                    {!matriculado && pendente && (
                      <span className="badge-pendente">
                        <TbClock size={12} aria-hidden="true" />
                        Aguardando aprovação
                      </span>
                    )}
                  </div>
                  <div className="catalogo-card__rodape-acoes">
                    {/* Botão de matrícula só aparece para alunos sem matrícula ativa ou pendente */}
                    {!matriculado && !pendente && usuario?.tipo === "Aluno" && (
                      <button
                        type="button"
                        className="btn-solicitar-matricula"
                        onClick={() => abrirModalMatricula(curso)}
                        style={{ display: "flex", alignItems: "center", gap: "6px" }}
                      >
                        <TbSend size={14} aria-hidden="true" /> Solicitar matrícula
                      </button>
                    )}
                    {/* Favoritos disponíveis apenas para o perfil Aluno */}
                    {usuario?.tipo === "Aluno" && (
                      <button
                        type="button"
                        className={`btn-favorito${cursosFavoritos.has(curso.id) ? " btn-favorito--ativo" : ""}`}
                        onClick={() => onAlternarFavorito?.(curso.id)}
                        aria-label={cursosFavoritos.has(curso.id) ? `Remover ${curso.titulo} dos favoritos` : `Adicionar ${curso.titulo} aos favoritos`}
                        aria-pressed={cursosFavoritos.has(curso.id)}
                      >
                        {cursosFavoritos.has(curso.id)
                          ? <MdFavorite size={20} />
                          : <MdFavoriteBorder size={20} />
                        }
                      </button>
                    )}
                  </div>
                </footer>
              </li>
            );
          })}
        </ul>
      )}

      {/* ── Modal de confirmação de matrícula ── */}
      {modalMatricula && (
        <Modal
          titulo="Confirmar solicitação de matrícula"
          onFechar={() => setModalMatricula(null)}
        >
          <div className="modal-matricula-vitrine">
            {modalMatricula.turma ? (
              <>
                <p className="modal-matricula-vitrine__info">
                  Você será matriculado em <strong>{modalMatricula.curso.titulo}</strong>,
                  turma <strong>{modalMatricula.turma.nomeTurma}</strong>.
                  Sua solicitação ficará <strong>Pendente</strong> até ser aprovada pela coordenação.
                </p>
                <p className="modal-matricula-vitrine__info">
                  Após a aprovação, os conteúdos do curso estarão disponíveis em{" "}
                  <strong>Acadêmico &gt; Conteúdos</strong>.
                </p>
              </>
            ) : (
              <p className="modal-matricula-vitrine__sem-turma">
                Não há turmas ativas para este curso no momento.
              </p>
            )}
            <div className="modal-rodape">
              <Botao variante="secundario" onClick={() => setModalMatricula(null)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" /> Cancelar</Botao>
              <Botao
                variante="primario"
                onClick={confirmarMatricula}
                disabled={!modalMatricula.turma}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <TbCheck size={15} aria-hidden="true" /> Confirmar solicitação
              </Botao>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Vista do admin: gerenciar visibilidade e destaque ───────── */
export default function TelaCatalogo({ usuario, listaCursos, onListaCursosChange, onToast, cursosFavoritos, onAlternarFavorito }) {
  /* Aluno e Professor veem a vitrine de cursos (somente leitura) */
  if (["Professor", "Aluno"].includes(usuario?.tipo)) {
    return <VitrineCatalogo listaCursos={listaCursos ?? []} usuario={usuario} cursosFavoritos={cursosFavoritos} onAlternarFavorito={onAlternarFavorito} onToast={onToast} />;
  }

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

  /* KPIs calculados para os cards de estatística */
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

  function alternarVisivel(id) {
    setLista((prev) =>
      prev.map((c) => c.id === id ? { ...c, visivelCatalogo: !c.visivelCatalogo } : c)
    );
  }

  function alternarDestaque(id) {
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
          <h1 className="cabecalho-pagina__titulo">Catálogo Público</h1>
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
              {/* Toggle de visibilidade: controla se o curso aparece na vitrine pública */}
              <button
                className={`catalogo-toggle${curso.visivelCatalogo ? " catalogo-toggle--ativo" : ""}`}
                onClick={() => alternarVisivel(curso.id)}
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

              {/* Estrela de destaque: cursos em destaque aparecem primeiro na vitrine */}
              <button
                className={`catalogo-card__btn-estrela${curso.destaque ? " catalogo-card__btn-estrela--ativo" : ""}`}
                onClick={() => alternarDestaque(curso.id)}
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

      {/* ── Modal: criar novo curso ── */}
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
              <Botao variante="perigo" type="button" onClick={() => setModalNovo(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}><TbX size={15} aria-hidden="true" /> Cancelar</Botao>
              <Botao variante="primario" type="submit" style={{ display: "flex", alignItems: "center", gap: "6px" }}><MdSave size={19} aria-hidden="true" />Salvar</Botao>
            </footer>
          </form>
        </Modal>
      )}

      {/* ── Modal: editar informações do catálogo ── */}
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
              <Botao variante="perigo" type="button" onClick={() => setCursoEditando(null)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <TbX size={15} aria-hidden="true" /> Cancelar
              </Botao>
              <Botao variante="primario" type="submit" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <MdSave size={17} aria-hidden="true" /> Salvar
              </Botao>
            </footer>
          </form>
        </Modal>
      )}
    </div>
  );
}
