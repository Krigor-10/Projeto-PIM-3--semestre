export default function TabelaDados({ colunas, linhas, semDadosTexto = "Nenhum registro encontrado." }) {
  return (
    <div className="tabela-dados-container" role="region" aria-label="Tabela de dados">
      <table className="tabela-dados">
        <thead>
          <tr>
            {colunas.map((col) => (
              <th key={col.chave} scope="col" style={col.largura ? { width: col.largura } : {}}>
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
                    {col.renderizar ? col.renderizar(linha) : linha[col.chave] ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
