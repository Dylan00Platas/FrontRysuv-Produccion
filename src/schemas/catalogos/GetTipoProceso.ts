export interface ITipoProcesoBase {
  idTipoProceso: number;
  nombreTipoProceso: string;
}

export interface IGetTiposProceso {
  tiposProceso: ITipoProcesoBase[];
}
