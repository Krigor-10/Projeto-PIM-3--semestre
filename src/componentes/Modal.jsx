import { useEffect } from "react";

export default function Modal({ titulo, onFechar, children }) {
  useEffect(() => {
    function fecharComEsc(e) {
      if (e.key === "Escape") onFechar();
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
      onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}
    >
      <div className="modal-caixa">
        <header className="modal-cabecalho">
          <h2 className="modal-titulo" id="modal-titulo">{titulo}</h2>
          <button
            className="modal-fechar"
            onClick={onFechar}
            aria-label="Fechar modal"
          >
            X
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
