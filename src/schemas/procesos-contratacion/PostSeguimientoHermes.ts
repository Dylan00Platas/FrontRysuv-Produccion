export interface ISeguimientoHermesBase {
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

export interface IPostSeguimientoHermes {
  registros: ISeguimientoHermesBase[];
}
