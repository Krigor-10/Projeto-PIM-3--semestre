export default function CartaoEstatistica({ icone, valor, rotulo, corBorda }) {
  const estiloBorda = corBorda ? { borderTopColor: corBorda } : {};

  return (
    <article className="cartao-estatistica" style={estiloBorda}>
      <span className="cartao-estatistica__icone" aria-hidden="true">{icone}</span>
      <strong className="cartao-estatistica__valor">{valor}</strong>
      <p className="cartao-estatistica__rotulo">{rotulo}</p>
    </article>
  );
}
