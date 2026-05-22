import { useEffect } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export default function Modal({ titulo, onFechar, children, className }) {
  const refModal = useFocusTrap();

  useEffect(() => {
    function fecharComEsc(evento) {
      if (evento.key === "Escape") onFechar();
    }
    document.addEventListener("keydown", fecharComEsc);
    return () => document.removeEventListener("keydown", fecharComEsc);
  }, [onFechar]);

  return (
    <div
      className="modal-fundo"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
      onClick={(e) => e.stopPropagation()}
    >
      <article ref={refModal} className={`modal-caixa${className ? ` ${className}` : ""}`}>
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
