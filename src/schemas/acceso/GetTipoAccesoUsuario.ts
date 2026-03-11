export interface ITipoAccesoUsuarioBase {
  idTipoAcceso: number;
  tipoAcceso: string;
}

export interface IGetTiposAccesoUsuario {
  tiposAcceso: ITipoAccesoUsuarioBase[];
}
