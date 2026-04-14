export default interface IPutProcesoContratacion {
  atendioCita?: boolean;
  avaladoPor?: string;
  beneficiado?: boolean;
  capacitado?: boolean;
  categoriaAutorizadaOficio?: string;
  categoriaPuestoOrigen?: string;
  citaVirtual?: boolean;
  consecutivoExpediente?: string;
  diasProceso?: string;
  educacionFormal?: string;
  experienciaLaboralSolicitada?: string;
  familiaFuncional?: string;
  fechaAsignacionAnalista?: string;
  fechaElaboracionPropuesta?: string;
  fechaEntrevista?: string;
  fechaEnvioDEyDP?: string;
  fechaEnvioEvaluacionDesempenio?: string;
  fechaEvaluacionCompetencias?: string;
  fechaInicioProcesamiento?: string;
  fechaLiberacionOficio?: string;
  fechaNotificacion?: string;
  fechaRecibido?: string;
  fechaRevisionOfiEval?: string;
  folio?: string;
  FKIdAcceso?: number;
  FKIdDependencia?: number;
  FKIdEstadoProcesoContratacion?: number;
  FKIdTemporalDefinitiva?: number;
  FKIdTipoPersonal?: number;
  FKIdTipoProceso?: number;
  funcionDesempeniar?: string;
  hermesNotificacion?: string;
  lineamientoOficioContinuidad?: string;
  motivo?: string;
  nombreCandidato?: string;
  numCarpeta?: string;
  numPlaza?: string;
  observaciones?: string;
  observacionesAnalista?: string;
  periodoAutorizadoOficioFin?: string;
  periodoAutorizadoOficioInicio?: string;
  resultadoEvaluacionCompetencias?: string;
  resultadoEvaluacionConocimiento?: string;
  resultadoHabilidadesExcel?: string;
  resultadoHabilidadesWord?: string;
  resultadoOrtografia?: string;
  resultadoProcesoEvaluacion?: string;
  resultadoReferenciasLaborales?: string;
  resultadoSeguimientoEvaluacionDesempenio?: string;
  seguimientoEvaluacionDesempenio?: boolean;
  titularPlaza?: string;
  candidato?: boolean
}

export type IPutProcesoContratacionCedula = Pick<
  IPutProcesoContratacion,
  | "FKIdDependencia"
  //| "numeroPlaza"
  | "nombreCandidato"
  | "resultadoHabilidadesWord"
  | "resultadoHabilidadesExcel"
  | "resultadoOrtografia"
  //| "evaluacionConocimientos"
  | "avaladoPor"
  | "educacionFormal"
>;
