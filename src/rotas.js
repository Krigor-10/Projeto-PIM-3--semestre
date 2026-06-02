/* ============================================================
   ROTAS — CodeRyse Academy
   Fonte única de verdade para todos os caminhos de navegação.
   Centralizar aqui evita strings duplicadas espalhadas no código.
   ============================================================ */

/* Caminhos públicos e protegidos da aplicação */
export const ROTAS = {
  INICIO:              "/",
  LOGIN:               "/login",
  LOGIN_STAFF:         "/login-staff",
  CADASTRO:            "/cadastro",
  PAINEL:              "/painel",
  PAINEL_CERTIFICADOS: "/painel/certificados",
};

/* Dashboard é a raiz do painel — não gera /painel/dashboard */
export function rotaPainelSecao(secao) {
  return secao === "dashboard" ? ROTAS.PAINEL : `${ROTAS.PAINEL}/${secao}`;
}
