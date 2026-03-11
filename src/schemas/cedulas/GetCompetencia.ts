// TODO-Desarrollo: Verificar body en backend
export interface ICompetenciaClasificacionCedulaBase {
  idCompetencia: number;
}

export interface IGetCompetenciasClasificacionCedula {
  competencias: ICompetenciaClasificacionCedulaBase[];
}
