export interface IControlVersionBase {
  idControlVersion: number;
  FKIdProceso: number;
  nombreCompleto: string;
  jsonDatos: string;
}

export interface IGetControlVerionesProceso {
  controlesVersiones: IControlVersionBase[];
}
