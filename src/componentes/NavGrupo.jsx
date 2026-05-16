import { useNavigate } from "react-router-dom";
import {
  TbLayoutDashboard,
  TbSchool,
  TbChalkboard,
  TbUserCog,
  TbBook,
  TbStack2,
  TbUsersGroup,
  TbClipboardList,
  TbClipboardCheck,
  TbFileText,
  TbChartBar,
  TbCertificate,
  TbWorld,
} from "react-icons/tb";
import { rotaPainelSecao } from "@/rotas.js";
import { obterSecoesPermitidas } from "@/dados/permissoes.js";
import { GRUPOS_DEF, FILHO_PARA_GRUPO } from "@/componentes/BarraLateral.jsx";

export const ALTURA_NAV_GRUPO = 44;

const ICONE_COMP = {
  dashboard:     TbLayoutDashboard,
  alunos:        TbSchool,
  professores:   TbChalkboard,
  coordenadores: TbUserCog,
  cursos:        TbBook,
  modulos:       TbStack2,
  turmas:        TbUsersGroup,
  matriculas:    TbClipboardList,
  avaliacoes:    TbClipboardCheck,
  conteudos:     TbFileText,
  progresso:     TbChartBar,
  certificados:  TbCertificate,
  catalogo:      TbWorld,
};

const ROTULO_SECAO = {
  dashboard:     "Panorama",
  alunos:        "Alunos",
  professores:   "Professores",
  coordenadores: "Coordenadores",
  cursos:        "Cursos",
  modulos:       "Módulos",
  turmas:        "Turmas",
  matriculas:    "Matrículas",
  avaliacoes:    "Avaliações",
  conteudos:     "Conteúdos",
  progresso:     "Progresso",
  certificados:  "Certificados",
  catalogo:      "Catálogo Público",
};

export function temNavGrupo(usuario, secaoAtual) {
  const grupoKey = FILHO_PARA_GRUPO[secaoAtual];
  if (!grupoKey) return false;
  const grupo = GRUPOS_DEF[grupoKey];
  const permitidas = obterSecoesPermitidas(usuario.tipo);
  return grupo.filhos.filter((f) => permitidas.some((s) => s.chave === f)).length >= 2;
}

function obterFilhosVisiveis(usuario, secaoAtual) {
  const grupoKey = FILHO_PARA_GRUPO[secaoAtual];
  if (!grupoKey) return null;
  const grupo = GRUPOS_DEF[grupoKey];
  const permitidas = obterSecoesPermitidas(usuario.tipo);
  const filhos = grupo.filhos
    .map((f) => permitidas.find((s) => s.chave === f))
    .filter(Boolean);
  return filhos.length >= 2 ? { grupo, filhos } : null;
}

export default function NavGrupo({ usuario, secaoAtual }) {
  const navigate = useNavigate();
  const resultado = obterFilhosVisiveis(usuario, secaoAtual);

  if (!resultado) return null;

  /* Seção com irmãos — exibe abas do grupo */
  const { grupo, filhos } = resultado;
  const { Icone, rotulo } = grupo;

  return (
    <nav className="nav-grupo" aria-label={`Subnavegação de ${rotulo}`}>
      <div className="nav-grupo__label" aria-hidden="true">
        <Icone size={13} />
        <span>{rotulo}</span>
      </div>

      <div className="nav-grupo__divisor" aria-hidden="true" />

      <div className="nav-grupo__tabs" role="tablist" aria-label={rotulo}>
        {filhos.map((filho) => {
          const Ic = ICONE_COMP[filho.chave];
          const ativo = secaoAtual === filho.chave;
          return (
            <button
              key={filho.chave}
              role="tab"
              aria-selected={ativo}
              className={`nav-grupo__tab${ativo ? " nav-grupo__tab--ativo" : ""}`}
              onClick={() => navigate(rotaPainelSecao(filho.chave))}
              type="button"
            >
              {Ic && <Ic size={15} />}
              <span>{filho.rotulo}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
