// TODO-Desarrollo: Verificar body en backend
export interface ICompetenciaClasificacionCedulaBase {
  idCompetencia: number;
  nombreCompetencia: string;
  resultadoPorcentaje: number;
}

export interface IGetCompetenciasClasificacionCedula {
  competencias: ICompetenciaClasificacionCedulaBase[];
}
