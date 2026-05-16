import { useEffect } from "react";

export default function Modal({ titulo, onFechar, children, className }) {
  useEffect(() => {
    /* Fecha o modal ao pressionar ESC — comportamento esperado de acessibilidade */
    function fecharComEsc(evento) {
      if (evento.key === "Escape") onFechar();
    }
    document.addEventListener("keydown", fecharComEsc);
    /* Cleanup remove o listener ao desmontar para evitar memory leak */
    return () => document.removeEventListener("keydown", fecharComEsc);
  }, [onFechar]);

  return (
    /* role="dialog" com aria-modal="true" informa leitores de tela que o foco está restrito ao modal */
    <div
      className="modal-fundo"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
      onClick={(e) => e.stopPropagation()}
    >
      <article className={`modal-caixa${className ? ` ${className}` : ""}`}>
        <header className="modal-cabecalho">
          <h2 className="modal-titulo" id="modal-titulo">{titulo}</h2>
          <button
            className="modal-fechar"
            onClick={onFechar}
            aria-label="Fechar modal"
            type="button"
          >
            ✕
          </button>
        </header>
        {children}
      </article>
    </div>
  );
}
