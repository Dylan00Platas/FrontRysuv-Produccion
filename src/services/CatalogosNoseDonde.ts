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

// TODO-Desarrollo: Mapear roles dinámicamente desde servidor.
const ESTADOS_PROCESO = {
  Citado: 1,
  Evaluado: 2,
  "En revision": 4,
  "En firma": 5,
  Notificado: 6,
  Cancelado: 7,
  Terminado: 8,
  Pendiente: 9,
  Entregado: 10,
  // TODO-Desarrollo: Revisar su uso: Notificado: 11,
  "Inicio procesamiento": 13,
  "Procesamiento oficio": 14,
  "Fin procesamiento": 15,
} as const;

type EstadoNombre = keyof typeof ESTADOS_PROCESO;
type EstadoId = (typeof ESTADOS_PROCESO)[EstadoNombre];

export function mapRolAFK(params: {
  rol?: EstadoNombre;
  idRol?: number;
}): EstadoId {
  if (
    params.idRol &&
    Object.values(ESTADOS_PROCESO).includes(params.idRol as EstadoId)
  ) {
    return params.idRol as EstadoId;
  }

  if (params.rol && ESTADOS_PROCESO[params.rol]) {
    return ESTADOS_PROCESO[params.rol];
  }

  return ESTADOS_PROCESO.Pendiente;
}
