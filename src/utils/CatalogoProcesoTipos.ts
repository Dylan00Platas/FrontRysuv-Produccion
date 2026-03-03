// TODO-Desarrollo: Mapear roles dinámicamente desde servidor.
const TIPOS_SOLICITUD = {
  asignacion: 1,
  requisicion: 2,
  bolsa: 3,
} as const;

type SolicitudNombre = keyof typeof TIPOS_SOLICITUD;
type SolicitudId = (typeof TIPOS_SOLICITUD)[SolicitudNombre];

export default function mapRolAFK(params: {
  rol?: SolicitudNombre;
  idRol?: number;
}): SolicitudId {
  if (
    params.idRol &&
    Object.values(TIPOS_SOLICITUD).includes(params.idRol as SolicitudId)
  ) {
    return params.idRol as SolicitudId;
  }

  if (params.rol && TIPOS_SOLICITUD[params.rol]) {
    return TIPOS_SOLICITUD[params.rol];
  }

  return TIPOS_SOLICITUD.asignacion;
}
