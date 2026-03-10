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

export enum EstadoProceso {
  Pendiente = 9,
  EnProceso = 10,
  Finalizado = 11,
}

export const mapColorEstado = (estado: EstadoProceso): string => {
  switch (estado) {
    case EstadoProceso.Pendiente:
      return "#f1c40f";
    case EstadoProceso.EnProceso:
      return "#e67e22";
    case EstadoProceso.Finalizado:
      return "#23aa12";
    default:
      return "#d11a2a";
  }
};

/**
 * Determina el color final del evento considerando si el candidato no asistió.
 */
export function resolverColor(estado: number, atendioCita: boolean): string {
  return atendioCita ? "#d11a2a" : mapColorEstado(estado);
}
