/* ============================================================
   APLICACAO — Roteamento raiz e autenticação — CodeRyse Academy
   Gerencia a sessão do usuário via localStorage e define todas
   as rotas públicas e protegidas da aplicação.
   ============================================================ */
import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { usuariosPorPerfil } from "@/dados/dadosMock.js";
import { ROTAS } from "@/rotas.js";
import TelaInicio from "@/paginas/autenticacao/TelaInicio.jsx";
import TelaLoginAluno from "@/paginas/autenticacao/TelaLoginAluno.jsx";
import TelaLoginStaff from "@/paginas/autenticacao/TelaLoginStaff.jsx";
import TelaCadastro from "@/paginas/autenticacao/TelaCadastro.jsx";
import LayoutWorkspace from "@/paginas/LayoutWorkspace.jsx";
import TooltipGlobal from "@/componentes/TooltipGlobal.jsx";

/* Redireciona para a home se não houver usuário na sessão */
function RotaProtegida({ usuario, children }) {
  if (!usuario) return <Navigate to={ROTAS.INICIO} replace />;
  return children;
}

export default function Aplicacao() {
  /* Persiste o perfil ativo entre reloads via chave no localStorage */
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    const chave = localStorage.getItem("coderyse-perfil");
    return chave ? (usuariosPorPerfil[chave] ?? null) : null;
  });
  const navigate = useNavigate();

  function fazerLogin(chave) {
    localStorage.setItem("coderyse-perfil", chave);
    setUsuarioLogado(usuariosPorPerfil[chave]);
    navigate(ROTAS.PAINEL);
  }

  function fazerLogout() {
    localStorage.removeItem("coderyse-perfil");
    setUsuarioLogado(null);
    /* replace evita que o botão Voltar retorne ao painel após logout */
    navigate(ROTAS.INICIO, { replace: true });
  }

  return (
    <>
    {/* TooltipGlobal renderiza tooltips [data-tooltip] fora do stacking context */}
    <TooltipGlobal />
    <Routes>
      {/* Rotas públicas — acessíveis sem autenticação */}
      <Route path={ROTAS.INICIO}      element={<TelaInicio />} />
      <Route path={ROTAS.LOGIN}       element={<TelaLoginAluno onLogin={fazerLogin} />} />
      <Route path={ROTAS.LOGIN_STAFF} element={<TelaLoginStaff onLogin={fazerLogin} />} />
      <Route path={ROTAS.CADASTRO}    element={<TelaCadastro />} />

      {/* Rota protegida — LayoutWorkspace gerencia a navegação interna por seção */}
      <Route
        path={ROTAS.PAINEL + "/*"}
        element={
          <RotaProtegida usuario={usuarioLogado}>
            <LayoutWorkspace usuario={usuarioLogado} onLogout={fazerLogout} />
          </RotaProtegida>
        }
      />

      {/* Qualquer rota desconhecida redireciona para a home */}
      <Route path="*" element={<Navigate to={ROTAS.INICIO} replace />} />
    </Routes>
    </>
  );
}
