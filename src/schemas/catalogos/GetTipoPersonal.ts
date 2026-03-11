export interface ITipoPersonalBase {
  idTipoPersonal: number;
  personal: string;
}

export interface IGetTiposPersonal {
  tiposPersonal: ITipoPersonalBase[];
}
