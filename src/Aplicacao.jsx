import { useState } from "react";
import { usuariosPorPerfil } from "./dados/dadosMock.js";
import TelaInicio from "./paginas/autenticacao/TelaInicio.jsx";
import TelaLoginAluno from "./paginas/autenticacao/TelaLoginAluno.jsx";
import TelaLoginStaff from "./paginas/autenticacao/TelaLoginStaff.jsx";
import TelaCadastro from "./paginas/autenticacao/TelaCadastro.jsx";
import LayoutWorkspace from "./paginas/LayoutWorkspace.jsx";

export default function Aplicacao() {
  const [telaAtual, setTelaAtual] = useState("inicio");
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [secaoAtual, setSecaoAtual] = useState("dashboard");

  function fazerLogin(chave) {
    setUsuarioLogado(usuariosPorPerfil[chave]);
    setSecaoAtual("dashboard");
    setTelaAtual("workspace");
  }

  function fazerLogout() {
    setUsuarioLogado(null);
    setTelaAtual("inicio");
  }

  function navegarPara(tela) {
    setTelaAtual(tela);
  }

  function mudarSecao(secao) {
    setSecaoAtual(secao);
  }

  if (telaAtual === "inicio") {
    return (
      <TelaInicio
        onNavegar={navegarPara}
      />
    );
  }

  if (telaAtual === "login" || telaAtual === "login-aluno") {
    return (
      <TelaLoginAluno
        onLogin={fazerLogin}
        onNavegar={navegarPara}
      />
    );
  }

  if (telaAtual === "login-staff") {
    return (
      <TelaLoginStaff
        onLogin={fazerLogin}
        onNavegar={navegarPara}
      />
    );
  }

  if (telaAtual === "cadastro") {
    return (
      <TelaCadastro
        onNavegar={navegarPara}
      />
    );
  }

  if (telaAtual === "workspace" && usuarioLogado) {
    return (
      <LayoutWorkspace
        usuario={usuarioLogado}
        secaoAtual={secaoAtual}
        onMudarSecao={mudarSecao}
        onLogout={fazerLogout}
      />
    );
  }

  return (
    <TelaInicio onNavegar={navegarPara} />
  );
}
