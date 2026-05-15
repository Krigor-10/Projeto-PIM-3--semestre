import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Aplicacao from "./Aplicacao.jsx";
import { inicializar } from "./dados/db.js";

inicializar();
import "./estilos/variaveis.css";
import "./estilos/base.css";
import "./estilos/componentes.css";
import "./estilos/layout.css";
import "./estilos/paginas/publico.css";
import "./estilos/paginas/autenticacao.css";
import "./estilos/paginas/workspace.css";
import "./estilos/paginas/usuarios.css";
import "./estilos/paginas/inicio.css";
import "./estilos/paginas/login.css";
import "./estilos/paginas/avaliacoes.css";
import "./estilos/paginas/aprendizado.css";

createRoot(document.getElementById("raiz")).render(
  <BrowserRouter>
    <Aplicacao />
  </BrowserRouter>
);
