export interface IDependenciaBase {
  idDependencia: number;
  numDependencia: string;
  nombre: string;
  area: string;
  zona: string;
  subzona: string;
  areaOrganizacional: string;
}

export interface IGetDependencias {
  dependencias: IDependenciaBase[];
}
