export const ROTAS = {
  INICIO:              "/",
  LOGIN:               "/login",
  LOGIN_STAFF:         "/login-staff",
  CADASTRO:            "/cadastro",
  PAINEL:              "/painel",
  PAINEL_CERTIFICADOS: "/painel/certificados",
};

export function rotaPainelSecao(secao) {
  return secao === "dashboard" ? ROTAS.PAINEL : `${ROTAS.PAINEL}/${secao}`;
}
