import { useNavigate } from "react-router-dom";
import Botao from "@/componentes/Botao.jsx";
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
            >
              Acesso administrativo
            </Botao>
            <Botao
              variante="secundario"
              tamanho="pequeno"
              onClick={() => navigate(ROTAS.LOGIN)}
            >
              Entrar
            </Botao>
            <Botao
              variante="sucesso"
              tamanho="pequeno"
              onClick={() => navigate(ROTAS.CADASTRO)}
            >
              Criar conta
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
              >
                Solicitar matrícula
              </Botao>
              <a href="#cursos" className="botao botao--fantasma botao--grande">
                Ver cursos
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

                      {/* Imagem de capa do curso */}
                      <div className="cartao-curso__topo" aria-hidden="true">
                        <img
                          src={imagem}
                          alt=""
                          className="cartao-curso__imagem"
                          loading="lazy"
                          width="600"
                          height="340"
                        />
                      </div>

                      <div className="cartao-curso__corpo">
                        <div className="cartao-curso__badges">
                          <span className="cartao-curso__nivel">{curso.nivel}</span>
                        </div>

                        <h3 className="cartao-curso__titulo" id={`curso-titulo-${curso.id}`}>
                          {curso.titulo}
                        </h3>
                        <p className="cartao-curso__descricao">{curso.descricao}</p>

                        <ul className="cartao-curso__meta" aria-label="Detalhes do curso">
                          <li>{curso.totalModulos} módulos</li>
                          <li>{curso.totalAlunos} alunos</li>
                        </ul>
                      </div>

                      <footer className="cartao-curso__rodape">
                        <strong className="cartao-curso__preco">
                          R$ {curso.preco.toFixed(2).replace(".", ",")}
                        </strong>
                        <Botao
                          variante="secundario"
                          tamanho="pequeno"
                          onClick={() => navigate(ROTAS.LOGIN)}
                          aria-label={`Matricular-se em ${curso.titulo}`}
                        >
                          Matricular-se
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

      {/* Rodapé */}
      <footer className="rodape-publico" role="contentinfo">
        <div className="rodape-publico__inner">
          <p className="rodape-publico__marca">CodeRyse Academy</p>
          <p className="rodape-publico__direitos">
            Cursos digitais e gestão acadêmica em uma única plataforma.
          </p>
        </div>
      </footer>
    </>
  );
}
