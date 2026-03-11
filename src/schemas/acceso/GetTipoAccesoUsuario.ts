export interface ITipoAccesoUsuarioBase {
  idTipoAcceso: number;
  tipoAcceso: string;
}

export interface ITiposAccesoUsuario {
  tiposAcceso: ITipoAccesoUsuarioBase[];
}
