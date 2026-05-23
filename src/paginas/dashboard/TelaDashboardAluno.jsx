import CartaoEstatistica from "@/componentes/CartaoEstatistica.jsx";
import BarraProgresso from "@/componentes/BarraProgresso.jsx";
import Insignia from "@/componentes/Insignia.jsx";
import Botao from "@/componentes/Botao.jsx";
import { motion } from "framer-motion";
import { MdFavorite } from "react-icons/md";
import { progressoAluno, conteudos } from "@/dados/dadosMock.js";

export default function TelaDashboardAluno({ usuario, onMudarSecao, listaCursos = [], cursosFavoritos = new Set(), onAlternarFavorito }) {
  const cursoPrincipal = progressoAluno.cursos[0];

  const conteudosConcluidos = conteudos.filter((c) => c.concluido).length;
  const modulosConcluidos = progressoAluno.modulos.filter((m) =>
    m.status.normalize("NFD").replace(/[̀-ͯ]/g, "") === "Concluido"
  ).length;

  const moduloEmAndamento = progressoAluno.modulos.find(
    (m) => m.status === "Em andamento"
  );
  const proximoConteudo = moduloEmAndamento
    ? conteudos.find((c) => c.moduloId === moduloEmAndamento.moduloId && !c.concluido)
    : null;

  return (
    <main className="dashboard-aluno">
      <header className="cabecalho-pagina">
        <div>
          <h2 className="cabecalho-pagina__titulo">Olá, {usuario.nome.split(" ")[0]}</h2>
          <p className="cabecalho-pagina__subtitulo">
            Continue de onde parou e acompanhe sua trilha acadêmica.
          </p>
        </div>
        <Insignia texto="Aluno" variante="marca" />
      </header>

      {moduloEmAndamento && (
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
              <Botao variante="primario" onClick={() => onMudarSecao("conteudos")}>
                Continuar agora →
              </Botao>
            </motion.div>
          </div>
        </section>
      )}

      <nav className="acesso-rapido" aria-label="Ações rápidas">
        <button className="acao-rapida" onClick={() => onMudarSecao("conteudos")}>
          <span className="acao-rapida__icone" aria-hidden="true">▶</span>
          <span className="acao-rapida__texto">
            <strong>Continuar módulo</strong>
            <span>{moduloEmAndamento?.moduloTitulo ?? "Nenhum em andamento"}</span>
          </span>
        </button>
        <button className="acao-rapida" onClick={() => onMudarSecao("avaliacoes")}>
          <span className="acao-rapida__icone" aria-hidden="true">✎</span>
          <span className="acao-rapida__texto">
            <strong>Fazer avaliação</strong>
            <span>Teste seus conhecimentos</span>
          </span>
        </button>
        <button className="acao-rapida" onClick={() => onMudarSecao("progresso")}>
          <span className="acao-rapida__icone" aria-hidden="true">◎</span>
          <span className="acao-rapida__texto">
            <strong>Meu progresso</strong>
            <span>{cursoPrincipal?.percentual ?? 0}% concluído</span>
          </span>
        </button>
      </nav>

      {cursoPrincipal && (
        <div className="cartao-curso-ativo" style={{ marginTop: "var(--espaco-xl)" }}>
          <div className="cartao-curso-ativo__info">
            <h3 className="cartao-curso-ativo__titulo">{cursoPrincipal.cursoTitulo}</h3>
            <p className="cartao-curso-ativo__meta">
              {modulosConcluidos} de {progressoAluno.modulos.length} módulos concluídos
            </p>
          </div>
          <div className="cartao-curso-ativo__progresso">
            <BarraProgresso percentual={cursoPrincipal.percentual} />
          </div>
          <Botao
            variante="fantasma"
            tamanho="pequeno"
            onClick={() => onMudarSecao("progresso")}
          >
            Ver detalhes →
          </Botao>
        </div>
      )}

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
          <CartaoEstatistica icone="CU" valor="1" rotulo="Curso em andamento" />
          <CartaoEstatistica
            icone="OK"
            valor={conteudosConcluidos}
            rotulo="Conteúdos concluídos"
            corBorda="var(--cor-sucesso)"
          />
          <CartaoEstatistica
            icone="MO"
            valor={modulosConcluidos}
            rotulo="Módulos concluídos"
            corBorda="var(--cor-info)"
          />
          <CartaoEstatistica
            icone="PR"
            valor={`${cursoPrincipal?.percentual ?? 0}%`}
            rotulo="Progresso geral"
            corBorda="var(--cor-marca)"
          />
        </div>
      </section>

    </main>
  );
}
