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

const ROTULO_MOBILE = {
  pessoas:     "Usuários",
  academico:   "Acadêmico",
  aprendizado: "Aprender",
  conta:       "Conta",
};

function obterItensNavMobile(tipoPerfil) {
  const permitidas = obterSecoesPermitidas(tipoPerfil);

  const gruposVisiveis = {};
  for (const [chave, def] of Object.entries(GRUPOS_DEF)) {
    const filhos = def.filhos
      .map((f) => permitidas.find((s) => s.chave === f))
      .filter(Boolean);
    if (filhos.length >= 2) {
      gruposVisiveis[chave] = { ...def, filhos, navegarPara: filhos[0].chave };
    }
  }

  const emGrupo = new Set(
    Object.values(gruposVisiveis).flatMap((g) => g.filhos.map((f) => f.chave))
  );

  const itens = [];
  const gruposAdicionados = new Set();

  for (const secao of permitidas) {
    if (itens.length >= 5) break;

    const grupoKey = FILHO_PARA_GRUPO[secao.chave];
    if (grupoKey && emGrupo.has(secao.chave) && gruposVisiveis[grupoKey]) {
      if (!gruposAdicionados.has(grupoKey)) {
        gruposAdicionados.add(grupoKey);
        const grupo = gruposVisiveis[grupoKey];
        itens.push({
          chave:        grupoKey,
          tipo:         "grupo",
          rotulo:       ROTULO_MOBILE[grupoKey] ?? grupo.rotulo,
          Icone:        grupo.Icone,
          navegarPara:  grupo.navegarPara,
          filhosChaves: grupo.filhos.map((f) => f.chave),
        });
      }
    } else if (!emGrupo.has(secao.chave)) {
      itens.push({
        chave:        secao.chave,
        tipo:         "secao",
        rotulo:       secao.rotulo,
        navegarPara:  secao.chave,
        filhosChaves: [secao.chave],
      });
    }
  }

  return itens;
}

export default function BarraNavMobile({ usuario, secaoAtual }) {
  const navigate = useNavigate();
  const itens = obterItensNavMobile(usuario.tipo);

  function estaAtivo(item) {
    return item.filhosChaves.includes(secaoAtual) || secaoAtual === item.chave;
  }

  return (
    <nav className="nav-mobile" aria-label="Navegação principal">
      {itens.map((item) => {
        const ativo = estaAtivo(item);
        const Ic = item.tipo === "grupo" ? item.Icone : ICONE_COMP[item.chave];

        return (
          <button
            key={item.chave}
            className={`nav-mobile__item${ativo ? " nav-mobile__item--ativo" : ""}`}
            onClick={() => navigate(rotaPainelSecao(item.navegarPara))}
            aria-current={ativo ? "page" : undefined}
            type="button"
          >
            <span className="nav-mobile__icone" aria-hidden="true">
              {Ic && <Ic size={22} />}
            </span>
            <span className="nav-mobile__rotulo">{item.rotulo}</span>
          </button>
        );
      })}
    </nav>
  );
}
