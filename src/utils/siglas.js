export function siglasCurso(titulo = "") {
  const palavras = titulo.trim().split(/\s+/).filter(Boolean);
  if (palavras.length === 1) return palavras[0].slice(0, 2).toUpperCase();
  return palavras.slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}
