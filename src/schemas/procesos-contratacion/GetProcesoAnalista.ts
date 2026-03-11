export interface IEvaluacionAnalistaBase {
  idProceso: number;
  folio: string;
  FKIdAcceso: number;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
}

export interface IGetEvaluacionesAnalistaBase {
  evaluacionesAnalista: IEvaluacionAnalistaBase[];
}
