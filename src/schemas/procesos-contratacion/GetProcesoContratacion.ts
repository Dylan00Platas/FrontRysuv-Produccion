export interface IProcesoContratacionBase {
  autorizacion: boolean;
  avaladoPor: string | null;
  beneficiado: boolean;
  capacitado: boolean | null;
  categoriaAutorizadaOficio: string | null;
  categoriaPuestoOrigen: string;
  consecutivoExpediente: string;
  diasProceso: number;
  educacionFormal: string | null;
  experienciaLaboralSolicitada: string;
  familiaFuncional: string;
  fechaAsignacionAnalista: string | null;
  fechaElaboracionPropuesta: string;
  fechaEntrevista: string;
  fechaEnvioDEyDP: string;
  fechaEnvioEvaluacionDesempenio: string;
  fechaEntregaEvaluacionDesempenio: string | null;
  fechaEvaluacionCompetencias: string;
  fechaEvaluacionDesempenio: string | null;
  fechaInicioProcesamiento: string;
  fechaLiberacionOficio: string;
  fechaNotificacion: string;
  fechaRecibido: string;
  fechaRevisionOfiEval: string;
  folio: string;
  FKIdAcceso: number;
  FKIdDependencia: number;
  FKIdEstadoProcesoContratacion: number;
  FKIdTemporalDefinitiva: number;
  FKIdTipoPersonal: number;
  FKIdTipoProceso: number;
  funcionDesempeniar: string;
  hermesNotificacion: string;
  idProceso: number;
  lineamientoOficioContinuidad: string;
  motivo: string;
  nombreCandidato: string;
  numCarpeta: number;
  numPlaza: string;
  observaciones: string;
  observacionesAnalista: string;
  periodoAutorizadoOficioFin: string;
  periodoAutorizadoOficioInicio: string;
  resultadoEvaluacionCompetencias: string;
  resultadoEvaluacionConocimiento: string;
  resultadoEvaluacionDesempenio: string | null;
  resultadoHabilidadesExcel: number;
  resultadoHabilidadesWord: number;
  resultadoOrtografia: number;
  resultadoProcesoEvaluacion: string;
  resultadoReferenciasLaborales: string;
  resultadoSeguimientoEvaluacionDesempenio: string;
  seguimientoEvaluacionDesempenio: string | null;
  titularPlaza: string;
}

export interface IGetProcesosContratacion {
  procesos: IProcesoContratacionBase[];
}

export interface IGetProcesoContratacion {
  procesoContratación: IProcesoContratacionBase;
}

export interface IProcesoContratacionCandidatoNoBeneficiadoBase {
  autorizacion: boolean;
  avaladoPor: string | null;
  beneficiado: boolean;
  capacitado: boolean | null;
  categoriaAutorizadaOficio: string | null;
  categoriaPuestoOrigen: string;
  consecutivoExpediente: string;
  diasProceso: number;
  educacionFormal: string | null;
  experienciaLaboralSolicitada: string;
  familiaFuncional: string;
  fechaAsignacionAnalista: string | null;
  fechaElaboracionPropuesta: string;
  fechaEntrevista: string;
  fechaEnvioDEyDP: string;
  fechaEnvioEvaluacionDesempenio: string;
  fechaEvaluacionCompetencias: string;
  fechaEvaluacionDesempenio: string | null;
  fechaInicioProcesamiento: string;
  fechaLiberacionOficio: string;
  fechaNotificacion: string;
  fechaRecibido: string;
  fechaRevisionOfiEval: string;
  folio: string;
  FKIdAcceso: number;
  FKIdDependencia: number;
  FKIdEstadoProcesoContratacion: number;
  FKIdTemporalDefinitiva: number;
  FKIdTipoPersonal: number;
  FKIdTipoProceso: number;
  funcionDesempeniar: string;
  hermesNotificacion: string;
  idProceso: number;
  lineamientoOficioContinuidad: string;
  motivo: string;
  nombreCandidato: string;
  numCarpeta: number;
  numPlaza: string;
  observaciones: string;
  observacionesAnalista: string;
  periodoAutorizadoOficioFin: string;
  periodoAutorizadoOficioInicio: string;
  resultadoEvaluacionCompetencias: string;
  resultadoEvaluacionConocimiento: string;
  resultadoEvaluacionDesempenio: string | null;
  resultadoHabilidadesExcel: number;
  resultadoHabilidadesWord: number;
  resultadoOrtografia: number;
  resultadoProcesoEvaluacion: string;
  resultadoReferenciasLaborales: string;
  resultadoSeguimientoEvaluacionDesempenio: string;
  seguimientoEvaluacionDesempenio: string | null;
  titularPlaza: string;
}

export interface IGetProcesosContratacionCandidatosNoBeneficiados {
  procesos: IProcesoContratacionCandidatoNoBeneficiadoBase[];
}
