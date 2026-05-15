import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { usuariosPorPerfil } from "@/dados/dadosMock.js";
import { ROTAS } from "@/rotas.js";
import TelaInicio from "@/paginas/autenticacao/TelaInicio.jsx";
import TelaLoginAluno from "@/paginas/autenticacao/TelaLoginAluno.jsx";
import TelaLoginStaff from "@/paginas/autenticacao/TelaLoginStaff.jsx";
import TelaCadastro from "@/paginas/autenticacao/TelaCadastro.jsx";
import LayoutWorkspace from "@/paginas/LayoutWorkspace.jsx";

function RotaProtegida({ usuario, children }) {
  if (!usuario) return <Navigate to={ROTAS.INICIO} replace />;
  return children;
}

export default function Aplicacao() {
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
    navigate(ROTAS.INICIO, { replace: true });
  }

  return (
    <Routes>
      <Route path={ROTAS.INICIO}      element={<TelaInicio />} />
      <Route path={ROTAS.LOGIN}       element={<TelaLoginAluno onLogin={fazerLogin} />} />
      <Route path={ROTAS.LOGIN_STAFF} element={<TelaLoginStaff onLogin={fazerLogin} />} />
      <Route path={ROTAS.CADASTRO}    element={<TelaCadastro />} />
      <Route
        path={ROTAS.PAINEL + "/*"}
        element={
          <RotaProtegida usuario={usuarioLogado}>
            <LayoutWorkspace usuario={usuarioLogado} onLogout={fazerLogout} />
          </RotaProtegida>
        }
      />
      <Route path="*" element={<Navigate to={ROTAS.INICIO} replace />} />
    </Routes>
  );
}
