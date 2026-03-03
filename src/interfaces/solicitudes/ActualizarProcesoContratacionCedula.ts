export default interface IActualizarProcesoContratacionCedula {
  numPlaza: string;
  nombreCandidato: string;
  FKIdDependencia: number;
  resultadoHabilidadesWord: File;
  resultadoHabilidadesExcel: File;
  resultadoOrtografia: File;
  resultadoEvaluacionConocimiento: string;
  avaladoPor: string;
  educacionFormal: string;
}
