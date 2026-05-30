import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TbDotsVertical, TbSend, TbChevronDown, TbX } from "react-icons/tb";
import { MdPersonAdd, MdAdminPanelSettings, MdLogin } from "react-icons/md";
import Botao from "@/componentes/Botao.jsx";
import Modal from "@/componentes/Modal.jsx";
import { cursos } from "@/dados/dadosMock.js";
import { ROTAS } from "@/rotas.js";
import bannerHome from "@/ativos/banner-home.png";
import imgDevWeb     from "@/ativos/curso-dev-web.png";
import imgCiencia    from "@/ativos/curso-ciencia-dados.png";
import imgIA         from "@/ativos/curso-ia.png";
import imgCyber      from "@/ativos/curso-cyber.png";
import imgUxUi       from "@/ativos/curso-ux-ui.png";
import imgRobotica   from "@/ativos/curso-robotica.png";

/* Imagem de capa por título de curso */
const IMAGEM_CURSO = {
  "Desenvolvimento Web":     imgDevWeb,
  "Ciência de Dados":        imgCiencia,
  "Inteligência Artificial": imgIA,
  "Cybersegurança":          imgCyber,
  "UX e UI Design":          imgUxUi,
  "Robótica":                imgRobotica,
};

const pilares = [
  {
    titulo: "Cursos orientados a projeto",
    descricao: "Trilhas práticas com materiais e progresso por turma.",
  },
  {
    titulo: "Matrícula acompanhada",
    descricao: "Solicitação online com status visível no painel.",
  },
  {
    titulo: "Sala digital por perfil",
    descricao: "Aluno, professor e coordenação com acessos próprios.",
  },
];

/* Cursos visíveis no catálogo público, destaques primeiro */
const cursosVisiveis = cursos
  .filter((c) => c.ativo && c.visivelCatalogo)
  .sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));

export default function TelaInicio() {
  const navigate = useNavigate();
  const [cursoModal, setCursoModal] = useState(null);

  return (
    <>
      <a href="#conteudo-principal" className="pular-para-conteudo">
        Pular para o conteúdo principal
      </a>

      {/* Cabeçalho público fixo */}
      <header className="cabecalho-publico" role="banner">
        <div className="cabecalho-publico__inner">
          <a href="#" className="cabecalho-publico__logo" aria-label="CodeRyse Academy — página inicial">
            <span className="cabecalho-publico__logo-marca" aria-hidden="true">
              <span>Code</span>
              <span>Ryse</span>
            </span>
            <span className="cabecalho-publico__logo-subtitulo">Academy</span>
          </a>

          <nav className="cabecalho-publico__nav" aria-label="Navegação principal">
            <a href="#cursos" className="botao botao--secundario botao--pequeno cabecalho-publico__link">
              Cursos
            </a>
            <Botao
              variante="secundario"
              tamanho="pequeno"
              className="cabecalho-publico__acao-admin"
              onClick={() => navigate(ROTAS.LOGIN_STAFF)}
              aria-label="Acesso administrativo"
              style={{ display: "flex", alignItems: "center" }}
            >
              <MdAdminPanelSettings size={22} aria-hidden="true" />
            </Botao>
            <Botao
              variante="secundario"
              tamanho="pequeno"
              onClick={() => navigate(ROTAS.LOGIN)}
              aria-label="Entrar"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <MdLogin size={22} aria-hidden="true" /> <span className="nav-texto">Entrar</span>
            </Botao>
            <Botao
              variante="sucesso"
              tamanho="pequeno"
              onClick={() => navigate(ROTAS.CADASTRO)}
              aria-label="Criar conta"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <MdPersonAdd size={22} aria-hidden="true" /> <span className="nav-texto">Criar conta</span>
            </Botao>
          </nav>
        </div>
      </header>

      <main id="conteudo-principal">

        {/* Hero */}
        <section className="secao-hero" aria-labelledby="titulo-hero">
          <img className="secao-hero__banner" src={bannerHome} alt="" aria-hidden="true" />

          <div className="secao-hero__conteudo">
            <p className="secao-hero__tag">Cursos digitais com acompanhamento acadêmico</p>
            <h1 className="secao-hero__titulo" id="titulo-hero">
              CodeRyse
              <br />
              <span className="secao-hero__titulo--destaque">Academy</span>
            </h1>
            <p className="secao-hero__descricao">
              Escolha uma trilha, solicite sua matrícula e acompanhe tudo em um painel acadêmico integrado.
            </p>
            <div className="secao-hero__acoes">
              <Botao
                variante="sucesso"
                tamanho="grande"
                onClick={() => navigate(ROTAS.CADASTRO)}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <TbSend size={18} aria-hidden="true" /> Solicitar matrícula
              </Botao>
              <a href="#cursos" className="botao botao--fantasma botao--grande" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                Ver cursos <TbChevronDown size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* Pilares da plataforma */}
        <section className="secao-pilares" id="sobre" aria-labelledby="titulo-pilares">
          <div className="secao-pilares__inner">
            <h2 className="visualmente-oculto" id="titulo-pilares">
              Diferenciais da plataforma
            </h2>
            <ul className="grade-pilares grade-pilares--publica" role="list">
              {pilares.map((pilar) => (
                <li key={pilar.titulo} className="cartao-pilar">
                  <h3 className="cartao-pilar__titulo">{pilar.titulo}</h3>
                  <p className="cartao-pilar__descricao">{pilar.descricao}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Catálogo de cursos ativos */}
        <section className="secao-cursos" id="cursos" aria-labelledby="titulo-cursos">
          <div className="secao-cursos__inner">
            <header className="secao-cabecalho">
              <p className="secao-cabecalho__etiqueta">Catálogo de cursos ativos</p>
              <h2 className="secao-cabecalho__titulo" id="titulo-cursos">
                Escolha uma trilha e comece pela matrícula
              </h2>
              <p className="secao-cabecalho__subtitulo">
                {cursosVisiveis.length} cursos disponíveis — do iniciante ao avançado.
              </p>
            </header>

            <ul className="grade-cursos" role="list" aria-label="Cursos disponíveis">
              {cursosVisiveis.map((curso) => {
                const imagem = IMAGEM_CURSO[curso.titulo];
                return (
                  <li key={curso.id}>
                    <article className="cartao-curso" aria-labelledby={`curso-titulo-${curso.id}`}>
                      <div className="cartao-curso__topo" aria-hidden="true">
                        <img
                          src={imagem}
                          alt=""
                          aria-hidden="true"
                          className="cartao-curso__imagem"
                          loading="lazy"
                          width="600"
                          height="340"
                        />
                      </div>

                      <div className="cartao-curso__corpo">
                        <div className="cartao-curso__cabecalho-linha">
                          <span className="cartao-curso__nivel">{curso.nivel}</span>
                          <button
                            type="button"
                            className="cartao-curso__mais"
                            onClick={() => setCursoModal(curso)}
                            aria-label={`Ver detalhes de ${curso.titulo}`}
                          >
                            <TbDotsVertical size={18} aria-hidden="true" />
                          </button>
                        </div>
                        <h3 className="cartao-curso__titulo" id={`curso-titulo-${curso.id}`}>
                          {curso.titulo}
                        </h3>
                      </div>

                      <footer className="cartao-curso__rodape">
                        <Botao
                          variante="primario"
                          tamanho="pequeno"
                          onClick={() => navigate(`${ROTAS.CADASTRO}?curso=${curso.id}`)}
                          aria-label={`Cadastrar-se em ${curso.titulo}`}
                          style={{ display: "flex", alignItems: "center", gap: "6px" }}
                        >
                          <MdPersonAdd size={18} aria-hidden="true" /> Cadastrar-se
                        </Botao>
                      </footer>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>

      {cursoModal && (
        <Modal titulo={cursoModal.titulo} onFechar={() => setCursoModal(null)}>
          <dl className="lista-detalhes">
            <div className="lista-detalhes__item">
              <dt>Nível</dt>
              <dd>{cursoModal.nivel}</dd>
            </div>
            <div className="lista-detalhes__item">
              <dt>Módulos</dt>
              <dd>{cursoModal.totalModulos}</dd>
            </div>
            <div className="lista-detalhes__item">
              <dt>Alunos matriculados</dt>
              <dd>{cursoModal.totalAlunos}</dd>
            </div>
            <div className="lista-detalhes__item">
              <dt>Preço</dt>
              <dd>
                {cursoModal.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </dd>
            </div>
            <div className="lista-detalhes__item">
              <dt>Descrição</dt>
              <dd>{cursoModal.descricao}</dd>
            </div>
          </dl>
          <footer className="modal-rodape">
            <Botao variante="perigo" onClick={() => setCursoModal(null)} style={{ display: "flex", alignItems: "center", gap: "6px", marginRight: "auto" }}><TbX size={15} aria-hidden="true" /> Fechar</Botao>
            <Botao variante="primario" onClick={() => { setCursoModal(null); navigate(`${ROTAS.CADASTRO}?curso=${cursoModal.id}`); }} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <MdPersonAdd size={20} aria-hidden="true" /> Cadastrar-se
            </Botao>
          </footer>
        </Modal>
      )}

      {/* Rodapé */}
      <footer className="rodape-publico" role="contentinfo">
        <div className="rodape-publico__inner">
          <div className="rodape-publico__marca-bloco">
            <p className="rodape-publico__marca">CodeRyse Academy</p>
            <p className="rodape-publico__direitos">
              Cursos digitais e gestão acadêmica em uma única plataforma.
            </p>
          </div>

          <nav className="rodape-publico__nav" aria-label="Links do rodapé">
            <p className="rodape-publico__nav-titulo">Plataforma</p>
            <ul className="rodape-publico__nav-lista">
              <li>
                <a href="#cursos" className="rodape-publico__nav-link">Cursos</a>
              </li>
              <li>
                <button className="rodape-publico__nav-link" onClick={() => navigate(ROTAS.LOGIN)}>
                  Entrar
                </button>
              </li>
              <li>
                <button className="rodape-publico__nav-link" onClick={() => navigate(ROTAS.CADASTRO)}>
                  Criar conta
                </button>
              </li>
              <li>
                <button className="rodape-publico__nav-link" onClick={() => navigate(ROTAS.LOGIN_STAFF)}>
                  Acesso administrativo
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="rodape-publico__barra-inferior">
          <p className="rodape-publico__copyright">
            © {new Date().getFullYear()} CodeRyse Academy. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </>
  );
}
