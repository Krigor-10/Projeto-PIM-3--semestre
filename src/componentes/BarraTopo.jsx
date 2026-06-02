import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ROTAS, rotaPainelSecao } from "@/rotas.js";
import {
  TbTrophy, TbChevronDown, TbMenu2,
  TbLayoutDashboard, TbUsers, TbChalkboard, TbUserShield,
  TbBooks, TbStack, TbSchool, TbClipboardList,
  TbFileCheck, TbFileText, TbChartBar, TbUsersGroup, TbWorld,
  TbUserCircle, TbX, TbSearch, TbUserFilled,
} from "react-icons/tb";
import { db } from "@/dados/db.js";
import { obterSecoesPermitidas } from "@/dados/permissoes.js";
import { MdLogout, MdSettings } from "react-icons/md";
import Insignia from "./Insignia.jsx";
import Modal from "./Modal.jsx";
import Botao from "./Botao.jsx";
import NavGrupo from "./NavGrupo.jsx";
import { temNavGrupo } from "./NavGrupo.jsx";

const iconesPorSecao = {
  dashboard:    TbLayoutDashboard,
  alunos:       TbUsers,
  professores:  TbChalkboard,
  coordenadores:TbUserShield,
  cursos:       TbBooks,
  modulos:      TbStack,
  turmas:       TbSchool,
  matriculas:   TbClipboardList,
  avaliacoes:   TbFileCheck,
  conteudos:    TbFileText,
  progresso:    TbChartBar,
  certificados: TbTrophy,
  usuarios:     TbUsersGroup,
  catalogo:     TbWorld,
  perfil:       TbUserCircle,
};

const metadadosPorSecao = {
  dashboard:    { titulo: "Panorama",           descricao: "Resumo central do workspace com dados da plataforma."         },
  alunos:       { titulo: "Gestão de Alunos",   descricao: "Consulta rápida da base acadêmica para operação e apoio."    },
  professores:  { titulo: "Corpo Docente",       descricao: "Professores disponíveis para cursos e turmas."               },
  coordenadores:{ titulo: "Coordenadores",       descricao: "Supervisão acadêmica dos cursos."                            },
  cursos:       { titulo: "Catálogo Acadêmico",  descricao: "A mesma base alimenta a home, o cadastro e o painel."       },
  modulos:      { titulo: "Módulos por Curso",   descricao: "Estrutura acadêmica para conteúdos, avaliações e progresso."},
  turmas:       { titulo: "Mapa de Turmas",      descricao: "Turmas organizadas para acompanhamento da plataforma."      },
  matriculas:   { titulo: "Cursos",                descricao: "Solicitações e status acadêmico simulados."                 },
  avaliacoes:   { titulo: "Avaliações",          descricao: "Provas, quizzes e exercícios por perfil."                   },
  conteudos:    { titulo: "Conteúdos",           descricao: "Materiais publicados para a jornada acadêmica."             },
  progresso:    { titulo: "Meu Progresso",       descricao: "Acompanhamento visual da trilha do aluno."                  },
  certificados: { titulo: "Meus Certificados",   descricao: "Cursos concluídos e certificados disponíveis para download." },
  usuarios:     { titulo: "Usuários",            descricao: "Visão administrativa dos perfis do sistema."                },
  catalogo:     { titulo: "Catálogo Público",    descricao: "Gerencie a visibilidade dos cursos na homepage."             },
  perfil:       { titulo: "Meu Perfil",          descricao: "Visualize e edite suas informações pessoais."               },
};

const variantePorTipo = { Aluno: "marca", Professor: "info", Coordenador: "aviso", Admin: "erro" };

const corPorTipo = {
  Aluno:       "#7b2ff7",
  Professor:   "#3b82f6",
  Coordenador: "#f59e0b",
  Admin:       "#ef4444",
};

export default function BarraTopo({ usuario, secaoAtual, onLogout, onAbrirSidebar }) {
  const navigate = useNavigate();
  const [popupAberto, setPopupAberto] = useState(false);
  const [confirmarSaida, setConfirmarSaida] = useState(false);
  const [temaClaro, setTemaClaro] = useState(
    () => localStorage.getItem("coderyse-tema") === "claro"
  );
  const refWrapper = useRef(null);
  const [termoBusca, setTermoBusca] = useState("");
  const [buscaFocada, setBuscaFocada] = useState(false);
  const [indiceBusca, setIndiceBusca] = useState(-1);
  const refInputBusca = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.tema = temaClaro ? "claro" : "escuro";
    localStorage.setItem("coderyse-tema", temaClaro ? "claro" : "escuro");
  }, [temaClaro]);

  const meta = metadadosPorSecao[secaoAtual] || metadadosPorSecao.dashboard;
  const IconeSecao = iconesPorSecao[secaoAtual] || TbLayoutDashboard;

  /* Fecha o popup ao clicar fora dele */
  useEffect(() => {
    function fecharAoClicarFora(e) {
      if (refWrapper.current && !refWrapper.current.contains(e.target)) {
        setPopupAberto(false);
      }
    }
    if (popupAberto) document.addEventListener("mousedown", fecharAoClicarFora);
    return () => document.removeEventListener("mousedown", fecharAoClicarFora);
  }, [popupAberto]);

  function calcularGruposBusca(termo) {
    if (!termo.trim()) return [];
    const t = termo.toLowerCase();
    const grupos = [];

    const secoesPermitidas = obterSecoesPermitidas(usuario.tipo);
    const secoesFiltradas = secoesPermitidas
      .filter(s => metadadosPorSecao[s.chave] && (
        metadadosPorSecao[s.chave].titulo.toLowerCase().includes(t) ||
        s.chave.toLowerCase().includes(t)
      ))
      .slice(0, 3)
      .map(s => ({
        id: `sec-${s.chave}`,
        titulo: metadadosPorSecao[s.chave].titulo,
        descricao: metadadosPorSecao[s.chave].descricao,
        Icone: iconesPorSecao[s.chave] || TbLayoutDashboard,
        navegar: () => navigate(rotaPainelSecao(s.chave)),
      }));
    if (secoesFiltradas.length) grupos.push({ categoria: "Seções", itens: secoesFiltradas });

    const todosCursos = db.cursos.listar();
    const cursosFiltrados = todosCursos
      .filter(c => c.titulo.toLowerCase().includes(t) || c.descricao?.toLowerCase().includes(t))
      .slice(0, 3)
      .map(c => ({
        id: `crs-${c.id}`,
        titulo: c.titulo,
        descricao: c.nivel || "",
        Icone: TbBooks,
        navegar: () => navigate(rotaPainelSecao(["Admin", "Coordenador"].includes(usuario.tipo) ? "cursos" : "catalogo")),
      }));
    if (cursosFiltrados.length) grupos.push({ categoria: "Cursos", itens: cursosFiltrados });

    if (["Admin", "Coordenador", "Professor"].includes(usuario.tipo)) {
      const todosModulos = db.modulos.listar();
      const modulosFiltrados = todosModulos
        .filter(m => m.titulo.toLowerCase().includes(t))
        .slice(0, 3)
        .map(m => ({
          id: `mod-${m.id}`,
          titulo: m.titulo,
          descricao: `Módulo ${m.ordem}`,
          Icone: TbStack,
          navegar: () => navigate(rotaPainelSecao("modulos")),
        }));
      if (modulosFiltrados.length) grupos.push({ categoria: "Módulos", itens: modulosFiltrados });
    }

    return grupos;
  }

  const gruposBusca = calcularGruposBusca(termoBusca);
  const itensBusca = gruposBusca.flatMap(g => g.itens);

  function handleKeyDownBusca(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceBusca(i => Math.min(i + 1, itensBusca.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceBusca(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && indiceBusca >= 0 && itensBusca[indiceBusca]) {
      e.preventDefault();
      selecionarResultado(itensBusca[indiceBusca]);
    } else if (e.key === "Escape") {
      setTermoBusca("");
      setBuscaFocada(false);
      setIndiceBusca(-1);
      refInputBusca.current?.blur();
    }
  }

  function selecionarResultado(item) {
    item.navegar();
    setTermoBusca("");
    setBuscaFocada(false);
    setIndiceBusca(-1);
  }

  const comTabs = temNavGrupo(usuario, secaoAtual);

  return (
    <>
    <header className={`topbar${comTabs ? " topbar--com-tabs" : ""}`}>
      <div className="topbar__principal">
      <div className="topbar__esquerda">
        <button
          className="topbar__menu-mobile topbar__hamburger"
          onClick={onAbrirSidebar}
          aria-label="Abrir menu de navegação"
          type="button"
        >
          <TbMenu2 size={22} aria-hidden="true" />
        </button>

        <div className="topbar__contexto">
          <nav className="topbar__breadcrumb" aria-label="Localização atual">
            <span className="topbar__breadcrumb-raiz" style={{ color: "var(--cor-marca-clara)" }}>CodeRyse Academy</span>
            <span className="topbar__breadcrumb-sep" aria-hidden="true" style={{ color: "var(--cor-marca-clara)", fontSize: "1rem" }}>›</span>
            <span className="topbar__breadcrumb-secao">
              <IconeSecao size={16} aria-hidden="true" />
              {meta.titulo}
            </span>
          </nav>
        </div>
      </div>

      <div className="topbar__busca">
        <TbSearch size={15} aria-hidden="true" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--cor-texto-mudo)", pointerEvents: "none", zIndex: 1 }} />
        <input
          ref={refInputBusca}
          type="search"
          className="campo__entrada"
          placeholder="Buscar seções, cursos..."
          value={termoBusca}
          onChange={e => { setTermoBusca(e.target.value); setIndiceBusca(-1); }}
          onKeyDown={handleKeyDownBusca}
          onFocus={() => setBuscaFocada(true)}
          onBlur={() => setTimeout(() => setBuscaFocada(false), 150)}
          aria-label="Busca global"
          aria-autocomplete="list"
          style={{ width: "100%", paddingLeft: "32px", paddingRight: termoBusca ? "32px" : undefined, fontSize: "0.85rem", padding: "0.45rem 1rem 0.45rem 32px" }}
        />
        {termoBusca && (
          <button
            className="topbar__busca-limpar"
            type="button"
            aria-label="Limpar busca"
            onMouseDown={e => { e.preventDefault(); setTermoBusca(""); setIndiceBusca(-1); refInputBusca.current?.focus(); }}
          >
            <TbX size={13} aria-hidden="true" />
          </button>
        )}
        {buscaFocada && termoBusca && (
          <div className="busca-dropdown" role="listbox" aria-label="Resultados da busca">
            {gruposBusca.length > 0 ? gruposBusca.map(grupo => (
              <div key={grupo.categoria} className="busca-dropdown__grupo">
                <div className="busca-dropdown__categoria">{grupo.categoria}</div>
                {grupo.itens.map(item => {
                  const flatIdx = itensBusca.indexOf(item);
                  return (
                    <button
                      key={item.id}
                      className={`busca-dropdown__item${flatIdx === indiceBusca ? " busca-dropdown__item--ativo" : ""}`}
                      type="button"
                      role="option"
                      aria-selected={flatIdx === indiceBusca}
                      onMouseDown={() => selecionarResultado(item)}
                    >
                      <item.Icone size={16} className="busca-dropdown__item-icone" aria-hidden="true" />
                      <div className="busca-dropdown__item-texto">
                        <span className="busca-dropdown__item-titulo">{item.titulo}</span>
                        <span className="busca-dropdown__item-descricao">{item.descricao}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )) : (
              <div className="busca-dropdown__vazio">Nenhum resultado para "{termoBusca}"</div>
            )}
          </div>
        )}
      </div>

      <div className="topbar__acoes">
        {usuario.tipo === "Aluno" && (
          <>
            <motion.button
              className={`topbar__atalho-certificados${secaoAtual === "matriculas" ? " topbar__atalho-certificados--ativo" : ""}`}
              onClick={() => navigate(rotaPainelSecao("matriculas"))}
              aria-label="Ir para Meus Cursos"
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              <TbBooks size={18} aria-hidden="true" />
              <span className="topbar__atalho-certificados-label">Meus Cursos</span>
            </motion.button>
            <span className="topbar__separador" aria-hidden="true" />
            <motion.button
              className={`topbar__atalho-certificados${secaoAtual === "certificados" ? " topbar__atalho-certificados--ativo" : ""}`}
              onClick={() => navigate(ROTAS.PAINEL_CERTIFICADOS)}
              aria-label="Ir para Meus Certificados"
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              <TbTrophy size={18} aria-hidden="true" />
              <span className="topbar__atalho-certificados-label">Certificados</span>
            </motion.button>
            <span className="topbar__separador" aria-hidden="true" />
            <motion.button
              className={`topbar__atalho-certificados${secaoAtual === "catalogo" ? " topbar__atalho-certificados--ativo" : ""}`}
              onClick={() => navigate(rotaPainelSecao("catalogo"))}
              aria-label="Ir para o Catálogo"
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              <TbWorld size={18} aria-hidden="true" />
              <span className="topbar__atalho-certificados-label">Catálogo</span>
            </motion.button>
            <span className="topbar__separador" aria-hidden="true" />
          </>
        )}
        {(usuario.tipo === "Admin" || usuario.tipo === "Professor" || usuario.tipo === "Coordenador") && (
          <>
            <motion.button
              className={`topbar__atalho-certificados${secaoAtual === "catalogo" ? " topbar__atalho-certificados--ativo" : ""}`}
              onClick={() => navigate(rotaPainelSecao("catalogo"))}
              aria-label="Ir para o Catálogo"
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              <TbWorld size={18} aria-hidden="true" />
              <span className="topbar__atalho-certificados-label">Catálogo</span>
            </motion.button>
            <span className="topbar__separador" aria-hidden="true" />
          </>
        )}
        {/* Wrapper relativo para posicionar o popup abaixo do perfil */}
        <div className="topbar__perfil-wrapper" ref={refWrapper}>
          <button
            className="topbar__perfil"
            onClick={() => setPopupAberto((v) => !v)}
            aria-haspopup="dialog"
            aria-expanded={popupAberto}
            aria-label="Abrir perfil do usuário"
            type="button"
            style={{ "--cor-perfil": corPorTipo[usuario.tipo] ?? "#7b2ff7" }}
          >
            <div className="topbar__avatar" aria-hidden="true">
              <TbUserFilled size={18} style={{ color: "#fff" }} />
            </div>
            <div className="topbar__info">
              <span className="topbar__nome">{(usuario.nome ?? "").split(" ")[0]}</span>
              <span className="topbar__cargo">{usuario.tipo}</span>
            </div>
            <TbChevronDown
              size={14}
              className={`topbar__perfil-chevron${popupAberto ? " topbar__perfil-chevron--aberto" : ""}`}
              aria-hidden="true"
            />
          </button>

          <AnimatePresence>
            {popupAberto && (
              <motion.div
                className="popup-perfil"
                role="dialog"
                aria-label="Dados do perfil"
                aria-modal="false"
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                <div className="popup-perfil__cabecalho">
                  <div className="popup-perfil__avatar" aria-hidden="true">
                    <TbUserFilled size={28} style={{ color: "#fff" }} />
                  </div>
                  <div className="popup-perfil__identidade">
                    <h2 className="popup-perfil__nome">{usuario.nome}</h2>
                    <span className="popup-perfil__email">{usuario.email}</span>
                    <div><Insignia texto={usuario.tipo} variante={variantePorTipo[usuario.tipo] ?? "neutro"} style={usuario.tipo === "Admin" ? { color: "#fff" } : undefined} /></div>
                  </div>
                </div>

                <div className="popup-perfil__rodape">
                  <Botao
                    variante="fantasma"
                    className="popup-perfil__editar"
                    onClick={() => { setPopupAberto(false); navigate(rotaPainelSecao("perfil"), { state: { aba: "informacoes" } }); }}
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <TbUserCircle size={15} aria-hidden="true" />
                    Meu Perfil
                  </Botao>
                  <Botao
                    variante="fantasma"
                    className="popup-perfil__editar"
                    onClick={() => { setPopupAberto(false); navigate(rotaPainelSecao("perfil"), { state: { aba: "seguranca" } }); }}
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <MdSettings size={15} aria-hidden="true" />
                    Configurações
                  </Botao>
                  <hr style={{ border: "none", borderTop: "1px solid var(--cor-borda)", margin: "4px 0" }} />
                  <Botao
                    variante="perigo"
                    className="popup-perfil__sair"
                    onClick={() => { setConfirmarSaida(true); setPopupAberto(false); }}
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <MdLogout size={15} aria-hidden="true" />
                    Sair
                  </Botao>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
      </div>

      {comTabs && <NavGrupo usuario={usuario} secaoAtual={secaoAtual} />}
    </header>

    {confirmarSaida && (
      <Modal titulo="Sair da conta" onFechar={() => setConfirmarSaida(false)}>
        <p style={{ color: "var(--cor-texto-suave)", marginBottom: "var(--espaco-xl)" }}>
          Tem certeza que deseja sair? Você precisará fazer login novamente para acessar a plataforma.
        </p>
        <footer className="modal-rodape">
          <Botao variante="perigo" onClick={() => setConfirmarSaida(false)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <TbX size={15} aria-hidden="true" /> Cancelar
          </Botao>
          <Botao variante="sucesso" onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <MdLogout size={16} aria-hidden="true" /> Confirmar saída
          </Botao>
        </footer>
      </Modal>
    )}
    </>
  );
}
