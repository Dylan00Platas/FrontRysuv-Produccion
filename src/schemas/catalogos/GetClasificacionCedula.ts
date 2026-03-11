export interface IClasificacionCedulaBase {
  idClasificacionCedulas: number;
  numCedula: number;
  nombre: string;
}

export interface IGetClasificacionesCedula {
  clasificacionCedulas: IClasificacionCedulaBase[];
}
