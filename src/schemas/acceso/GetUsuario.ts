export interface IUsuarioBase {
  idAcceso: number;
  estado: number;
  FKIdTipoAcceso: number;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  usuario: string;
}

export interface IGetUsuarios {
  usuarios: IUsuarioBase[];
}

export interface IGetUsuario {
  usuario: IUsuarioBase;
}
