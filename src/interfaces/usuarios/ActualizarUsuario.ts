export default interface IActualizarUsuario {
  usuario: string;
  contrasenia: string;
  FKIdTipoAcceso: number;
  nombre: string;
  primerApellido: string;
  segundoApellido?: string;
  estado: 1;
  idAcceso?: number;
}
