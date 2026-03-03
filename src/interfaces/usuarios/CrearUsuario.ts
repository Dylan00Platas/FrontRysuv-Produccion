export default interface ICrearUsuario {
  usuario: string;
  contrasenia: string;
  FKIdTipoAcceso: number;
  nombre: string;
  primerApellido: string;
  segundoApellido?: string;
}
