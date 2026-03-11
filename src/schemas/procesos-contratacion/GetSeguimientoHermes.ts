export interface ISeguimientoHermes {
  idSeguimiento: number;
  folio: string;
  fechaRecepcion: string;
  importancia: string;
  tipoEnvio: string;
  requiereRespuesta: boolean;
  solicita: string;
  entidadDependencia: string;
  asunto: string;
  estatus: string;
  acciones: string;
}

export interface IGetSeguimientoHermes {
  seguimientos: ISeguimientoHermes[];
}
