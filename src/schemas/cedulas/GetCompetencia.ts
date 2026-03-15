// TODO-Desarrollo: Verificar body en backend
export interface ICompetenciaClasificacionCedulaBase {
  idCompetencia: number;
  nombreCompetencia: string;
}

export interface IGetCompetenciasClasificacionCedula {
  competencias: ICompetenciaClasificacionCedulaBase[];
}
