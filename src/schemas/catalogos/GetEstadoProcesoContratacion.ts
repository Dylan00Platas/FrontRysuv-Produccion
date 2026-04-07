export interface IEstadoProcesoContratacionBase {
  idEstadoProcesoContratacion: number;
  estado: string;
}

export interface IGetEstadosProcesoContratacion {
  estadosProcesosContratacion: IEstadoProcesoContratacionBase[];
}
