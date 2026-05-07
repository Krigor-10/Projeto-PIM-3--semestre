const variantePorValor = {
  Aprovada: "sucesso",
  Ativa: "sucesso",
  Concluído: "sucesso",
  Publicada: "sucesso",
  "Em andamento": "info",
  Pendente: "aviso",
  Rascunho: "aviso",
  Rejeitada: "erro",
  Cancelada: "erro",
  Inativo: "erro",
  "Não iniciado": "neutro",
  Concluída: "neutro",
};

export default function Insignia({ texto, variante }) {
  const varianteResolvida = variante || variantePorValor[texto] || "neutro";

  return (
    <span className={`insignia insignia--${varianteResolvida}`} role="status">
      {texto}
    </span>
  );
}
