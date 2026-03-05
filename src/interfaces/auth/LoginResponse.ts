interface UserData {
  Resultado: number;
  idAcceso: number;
  usuario: string;
  tipoDeAcceso: number;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  estado: boolean;
}

export default interface ILoginResponse {
  usuario: UserData;
}
