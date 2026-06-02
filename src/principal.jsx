/* ============================================================
   PRINCIPAL — Ponto de entrada da aplicação CodeRyse Academy
   Inicializa o banco de dados local (localStorage) antes de
   qualquer renderização, depois monta a árvore React no DOM.
   ============================================================ */
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Aplicacao from "./Aplicacao.jsx";
import { inicializar } from "./dados/db.js";

/* Garante que o localStorage já tem os dados padrão antes do primeiro render */
inicializar();

/* ── Estilos globais — ordem importa: variáveis → base → componentes → páginas ── */
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

/* BrowserRouter envolve tudo para que o React Router funcione em qualquer rota */
createRoot(document.getElementById("raiz")).render(
  <BrowserRouter>
    <Aplicacao />
  </BrowserRouter>
);
