export interface ITipoCedulaBase {
  idTipoCedula: number;
  cedula: string;
}

export interface IGetTiposCedula {
  tiposCedula: ITipoCedulaBase[];
}
