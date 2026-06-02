/* ============================================================
   TelaDashboardAluno — Painel inicial do aluno
   Exibe resumo do progresso, card de retomada, ações rápidas
   e lista de cursos favoritos.
   ============================================================ */
import CartaoEstatistica from "@/componentes/CartaoEstatistica.jsx";
import BarraProgresso from "@/componentes/BarraProgresso.jsx";
import Botao from "@/componentes/Botao.jsx";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MdFavorite } from "react-icons/md";
import { TbPlayerPlay, TbBooks, TbCheck, TbStack, TbChartBar, TbRocket } from "react-icons/tb";
import { conteudos, modulos, PROGRESSO_MOCK } from "@/dados/dadosMock.js";
import { db } from "@/dados/db.js";
import { rotaPainelSecao } from "@/rotas.js";

export default function TelaDashboardAluno({ usuario, onMudarSecao, listaCursos = [], cursosFavoritos = new Set(), onAlternarFavorito }) {
  const navigate = useNavigate();
  /* Progresso real do db */
  const concluidos = db.progresso.listarConcluidos();
  const resultados  = db.progresso.listarResultados();
  const todasMatriculas = db.matriculas.listar();
  const minhasMatriculas = todasMatriculas.filter(
    (m) => m.alunoId === usuario?.id && m.status === "Aprovada"
  );

  /* Verifica se o aluno já interagiu com algum conteúdo */
  const temDadosReais = concluidos.size > 0 || Object.keys(resultados).length > 0;

  /* Percentual real de um módulo baseado nos conteúdos concluídos */
  function pctModulo(modId) {
    const conts = conteudos.filter((c) => c.moduloId === modId);
    if (conts.length === 0) return resultados[modId] != null ? 100 : 0;
    const done = conts.filter((c) => concluidos.has(c.id)).length;
    return Math.round((done / conts.length) * 100);
  }

  /* Módulos de todos os cursos do aluno */
  const modulosDosAlunos = modulos.filter((m) =>
    minhasMatriculas.some((mat) => mat.cursoId === m.cursoId)
  );

  /* Matrícula e curso principal (primeiro aprovado) */
  const matriculaPrincipal = minhasMatriculas[0] ?? null;
  const pctPrincipal = (() => {
    if (!matriculaPrincipal) return 0;
    const mods = modulos.filter((m) => m.cursoId === matriculaPrincipal.cursoId);
    const conts = conteudos.filter((c) => mods.some((m) => m.id === c.moduloId));
    if (conts.length === 0) return PROGRESSO_MOCK[matriculaPrincipal.id] ?? 0;
    const done = conts.filter((c) => concluidos.has(c.id)).length;
    const real = Math.round((done / conts.length) * 100);
    return real > 0 ? real : (PROGRESSO_MOCK[matriculaPrincipal.id] ?? 0);
  })();
  const cursoPrincipal = matriculaPrincipal
    ? { ...matriculaPrincipal, percentual: pctPrincipal }
    : null;

  /* KPIs */
  const conteudosConcluidos = conteudos.filter(
    (c) => modulosDosAlunos.some((m) => m.id === c.moduloId) && concluidos.has(c.id)
  ).length;
  const modulosConcluidos = modulosDosAlunos.filter((m) => pctModulo(m.id) >= 100).length;

  /* Hero: módulo em andamento (apenas quando há dados reais) */
  const moduloEmAndamento = temDadosReais
    ? (() => {
        for (const mat of minhasMatriculas) {
          const mods = modulos
            .filter((m) => m.cursoId === mat.cursoId)
            .sort((a, b) => a.ordem - b.ordem);
          const m = mods.find((m) => { const p = pctModulo(m.id); return p > 0 && p < 100; });
          if (m) return { moduloId: m.id, moduloTitulo: m.titulo, percentual: pctModulo(m.id) };
        }
        return null;
      })()
    : null;

  /* Primeiro conteúdo não concluído do módulo ativo */
  const proximoConteudo = moduloEmAndamento
    ? conteudos.find((c) => c.moduloId === moduloEmAndamento.moduloId && !concluidos.has(c.id))
    : null;

  return (
    <main className="dashboard-aluno">
      <header className="cabecalho-pagina">
        <div>
          <h1 className="cabecalho-pagina__titulo">Olá, {(usuario.nome ?? "").split(" ")[0]}</h1>
          <p className="cabecalho-pagina__subtitulo">
            Continue de onde parou e acompanhe sua trilha acadêmica.
          </p>
        </div>
      </header>

      {!temDadosReais && cursoPrincipal ? (
        <section className="cartao-retomar cartao-retomar--inicio" aria-label="Iniciar jornada">
          <div className="cartao-retomar__info">
            <span className="cartao-retomar__etiqueta">Pronto para começar</span>
            <h3 className="cartao-retomar__modulo">{cursoPrincipal.cursoTitulo}</h3>
            <p className="cartao-retomar__proximo">
              Acesse o primeiro módulo e dê o primeiro passo na sua jornada.
            </p>
          </div>
          <div className="cartao-retomar__acao">
            <motion.div
              animate={{
                scale: [1, 1.07, 1],
                boxShadow: [
                  "0 0 0px rgba(123, 47, 247, 0)",
                  "0 6px 28px rgba(123, 47, 247, 0.65)",
                  "0 0 0px rgba(123, 47, 247, 0)",
                ],
              }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              whileHover={{ scale: 1.1, boxShadow: "0 8px 32px rgba(123, 47, 247, 0.8)" }}
              whileTap={{ scale: 0.95 }}
              style={{ display: "inline-block", borderRadius: "var(--raio-md)" }}
            >
              <Botao variante="primario" onClick={() => navigate(rotaPainelSecao("conteudos"), { state: { abrirPrimeiro: true } })} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <TbRocket size={16} aria-hidden="true" /> Iniciar jornada
              </Botao>
            </motion.div>
          </div>
        </section>
      ) : moduloEmAndamento ? (
        <section className="cartao-retomar" aria-label="Continuar onde parou">
          <div className="cartao-retomar__info">
            <span className="cartao-retomar__etiqueta">Em andamento</span>
            <h3 className="cartao-retomar__modulo">{moduloEmAndamento.moduloTitulo}</h3>
            {proximoConteudo && (
              <p className="cartao-retomar__proximo">
                Próximo: <strong>{proximoConteudo.titulo}</strong> — {proximoConteudo.duracao}
              </p>
            )}
            <div className="cartao-retomar__barra">
              <BarraProgresso percentual={moduloEmAndamento.percentual} />
            </div>
          </div>
          <div className="cartao-retomar__acao">
            <motion.div
              animate={{
                scale: [1, 1.07, 1],
                boxShadow: [
                  "0 0 0px rgba(123, 47, 247, 0)",
                  "0 6px 28px rgba(123, 47, 247, 0.65)",
                  "0 0 0px rgba(123, 47, 247, 0)",
                ],
              }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              whileHover={{ scale: 1.1, boxShadow: "0 8px 32px rgba(123, 47, 247, 0.8)" }}
              whileTap={{ scale: 0.95 }}
              style={{ display: "inline-block", borderRadius: "var(--raio-md)" }}
            >
              <Botao variante="primario" onClick={() => onMudarSecao("conteudos")} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <TbPlayerPlay size={16} aria-hidden="true" /> Continuar agora
              </Botao>
            </motion.div>
          </div>
        </section>
      ) : null}


      <section aria-labelledby="titulo-favoritos" style={{ marginTop: "var(--espaco-xl)" }}>
        <h2 className="secao-titulo" id="titulo-favoritos">
          <MdFavorite size={18} aria-hidden="true" style={{ color: "var(--cor-marca)", verticalAlign: "middle", marginRight: "6px" }} />
          Meus Favoritos
        </h2>
        {cursosFavoritos.size === 0 ? (
          <p className="favoritos-vazio">
            Nenhum curso favoritado ainda. Explore o <button type="button" className="favoritos-vazio__link" onClick={() => onMudarSecao("catalogo")}>catálogo</button> e salve os que te interessam.
          </p>
        ) : (
          <ul className="favoritos-lista" role="list">
            {listaCursos.filter((c) => cursosFavoritos.has(c.id) && c.visivelCatalogo).map((curso) => (
              <li key={curso.id} className="favorito-card">
                <div className="favorito-card__info">
                  <h3 className="favorito-card__titulo">{curso.titulo}</h3>
                  <p className="favorito-card__descricao">{curso.descricao}</p>
                </div>
                <button
                  type="button"
                  className="btn-favorito btn-favorito--ativo"
                  onClick={() => onAlternarFavorito?.(curso.id)}
                  aria-label={`Remover ${curso.titulo} dos favoritos`}
                >
                  <MdFavorite size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="titulo-stats-aluno" style={{ marginTop: "var(--espaco-xl)" }}>
        <h2 className="visualmente-oculto" id="titulo-stats-aluno">Resumo de atividades</h2>
        <div className="grade-estatisticas">
          <CartaoEstatistica icone={<TbBooks size={22} />} valor="1" rotulo="Curso em andamento" />
          <CartaoEstatistica
            icone={<TbCheck size={22} />}
            valor={conteudosConcluidos}
            rotulo="Conteúdos concluídos"
            corBorda="var(--cor-sucesso)"
          />
          <CartaoEstatistica
            icone={<TbStack size={22} />}
            valor={modulosConcluidos}
            rotulo="Módulos concluídos"
            corBorda="var(--cor-info)"
          />
          <CartaoEstatistica
            icone={<TbChartBar size={22} />}
            valor={`${cursoPrincipal?.percentual ?? 0}%`}
            rotulo="Progresso geral"
            corBorda="var(--cor-marca)"
          />
        </div>
      </section>

    </main>
  );
}
