export default function TabelaDados({ colunas, linhas, semDadosTexto = "Nenhum registro encontrado.", titulo }) {
  return (
    /* role="region" com aria-label transforma o container em landmark navegável */
    <section className="tabela-dados-container" role="region" aria-label={titulo || "Tabela de dados"}>
      <table className="tabela-dados">
        {/* caption é lido por leitores de tela antes do conteúdo da tabela */}
        {titulo && (
          <caption className="visualmente-oculto">{titulo}</caption>
        )}
        <thead>
          <tr>
            {colunas.map((col) => (
              <th
                key={col.chave}
                scope="col"
                style={col.largura ? { width: col.largura } : {}}
              >
                {col.rotulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.length === 0 ? (
            <tr className="tabela-dados--sem-dados">
              <td colSpan={colunas.length}>{semDadosTexto}</td>
            </tr>
          ) : (
            linhas.map((linha, indice) => (
              <tr key={linha.id ?? indice}>
                {colunas.map((col) => (
                  <td key={col.chave}>
                    {/* col.renderizar permite célula customizada (ex: badge, botão, link) */}
                    {col.renderizar ? col.renderizar(linha) : linha[col.chave] ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
