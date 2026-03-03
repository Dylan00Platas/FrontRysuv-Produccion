// TODO-Desarrollo:
// Catalogos encontrados, pero no se usaban.
// Se guardan para saber si son de utilidad después.

export function mapRolTipoPersonal(tipoPersonal: string) {
  switch (tipoPersonal) {
    case "confianza":
      return 1;
    case "eventual":
      return 2;
    default:
      return null;
  }
}

export function mapRolTipo(tipo: string) {
  switch (tipo) {
    case "temporal":
      return 1;
    case "definitiva":
      return 2;
    default:
      return null;
  }
}
