// TODO-Desarrollo: Mapear roles dinámicamente desde servidor.
const ROLES = {
  admin: 1,
  user: 2,
  supervisor: 3,
  direccion: 4,
} as const;

type RolNombre = keyof typeof ROLES;
type RolId = (typeof ROLES)[RolNombre];

export default function mapRolAFK(params: {
  rol?: RolNombre;
  idRol?: number;
}): RolId {
  if (params.idRol && Object.values(ROLES).includes(params.idRol as RolId)) {
    return params.idRol as RolId;
  }

  if (params.rol && ROLES[params.rol]) {
    return ROLES[params.rol];
  }

  return ROLES.user;
}
