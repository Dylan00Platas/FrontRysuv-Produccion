export interface IUsuarioBase {
	estado: number;
	FKIdTipoAcceso: number;
	idAcceso: number;
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
