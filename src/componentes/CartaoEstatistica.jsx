export default function CartaoEstatistica({ icone, valor, rotulo, corBorda }) {
  /* Aplica cor de destaque na borda superior apenas quando informada pelo chamador */
  const estiloBorda = corBorda ? { borderTopColor: corBorda } : {};

  return (
    /* article é semântico pois cada cartão é uma unidade de informação independente */
    <article
      className="cartao-estatistica"
      style={estiloBorda}
      aria-label={`${rotulo}: ${valor}`}
    >
      <span className="cartao-estatistica__icone" aria-hidden="true">{icone}</span>
      <strong className="cartao-estatistica__valor">{valor}</strong>
      <p className="cartao-estatistica__rotulo">{rotulo}</p>
    </article>
  );
}
