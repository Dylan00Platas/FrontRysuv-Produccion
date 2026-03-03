// TODO-Desarrollo: Verificar que datos son obligatorios y en que endpoints

export default interface ISolicitud {
  // Identificadores principales
  folio: string;
  consecutivoExpediente: string;
  numCarpeta: string;
  numPlaza: string;

  // Datos del candidato/plaza
  nombreCandidato: string;
  titularPlaza: string;
  categoriaPuestoOrigen: string;
  funcionDesempeniar: string;
  familiaFuncional: string;
  experienciaLaboralSolicitada: string;
  beneficiado: boolean;
  motivo: string;

  // Fechas del proceso (orden cronológico)
  fechaRecibido: Date;
  fechaInicioProcesamiento: Date;
  fechaEntrevista: Date;
  fechaEvaluacionCompetencias: Date;
  fechaEvaluacionDesempenio: Date;
  fechaEnvioEvaluacionDesempenio: Date;
  fechaEntregaEvaluacionDesempenio: Date;
  fechaRevisionOfiEval: Date;
  fechaElaboracionPropuesta: Date;
  fechaLiberacionOficio: Date;
  periodoAutorizadoOficioInicio: Date;
  periodoAutorizadoOficioFin: Date;
  fechaEnvioDEyDP: Date;
  fechaNotificacion: Date;

  // Resultados de evaluaciones
  resultadoEvaluacionConocimiento: string;
  resultadoEvaluacionCompetencias: string;
  resultadoEvaluacionDesempenio: string;
  resultadoSeguimientoEvaluacionDesempenio: string;
  resultadoReferenciasLaborales: string;
  resultadoHabilidadesWord: string;
  resultadoHabilidadesExcel: string;
  resultadoOrtografia: string;
  resultadoProcesoEvaluacion: string;

  // Observaciones y seguimiento
  observaciones: string;
  observacionesAnalista: string;
  seguimientoEvaluacionDesempenio: boolean;
  diasProceso: string;
  lineamientoOficioContinuidad: string;
  hermesNotificacion: string;

  // Claves foráneas / relaciones
  FKIdTipoProceso: number;
  FKIdTipoPersonal: number;
  FKIdEstadoProcesoContratacion: number;
  FKIdTemporalDefinitiva: number;
  FKIdDependencia: number;
  FKIdAcceso: number;
}
