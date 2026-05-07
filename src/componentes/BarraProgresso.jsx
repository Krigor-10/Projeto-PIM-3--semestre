export default function BarraProgresso({ percentual, mostrarTexto = true }) {
  /* Clamp garante que o valor nunca ultrapasse os limites válidos de 0 a 100 */
  const valor = Math.min(100, Math.max(0, percentual));

  return (
    <div className="barra-progresso-wrapper">
      {/* role="progressbar" com atributos ARIA torna a barra acessível a leitores de tela */}
      <div
        className="barra-progresso"
        role="progressbar"
        aria-valuenow={valor}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso: ${valor}%`}
      >
        <div
          className="barra-progresso__preenchimento"
          style={{ width: `${valor}%` }}
        />
      </div>
      {mostrarTexto && (
        <span className="barra-progresso__texto" aria-hidden="true">{valor}%</span>
      )}
    </div>
  );
}
