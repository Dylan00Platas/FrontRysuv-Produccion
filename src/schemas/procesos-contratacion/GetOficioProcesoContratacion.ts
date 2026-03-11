export interface IOficioProcesoContratacionBase {
  idOficio: number;
  FKIdProcesoContratacion: number;
  folio: string;
  fecha: string;
  dirigido: string;
  puestoDirigido: string;
  machote: string;
  piePagina: string;
  tipo: string;
}

export interface IGetOficiosProcesoContratacion {
  oficios: IOficioProcesoContratacionBase[];
}
