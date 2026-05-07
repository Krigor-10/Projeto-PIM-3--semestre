import { createRoot } from "react-dom/client";
import Aplicacao from "./Aplicacao.jsx";
import "./estilos/global.css";
import "./estilos/paginas.css";

createRoot(document.getElementById("raiz")).render(<Aplicacao />);
