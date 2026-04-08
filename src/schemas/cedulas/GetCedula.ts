export interface ICedulaBase {
  idCedula: number;
  adscripcion: { idDepndencia: number; nombre: string; zona: string } | null;
  analista: string;
  antecedentesFamiliaresUV: string;
  aprobadoDireccion: boolean;
  aprobadoJefeOficina: boolean;
  aprueba?: string;
  archivoAdjunto: boolean;
  categoriaPuestoOrigen: string;
  competenciaDesarrollar: string;
  competenciaReforzar: string;
  competenciasSobresaliente: string;
  conclusiones: string;
  consecutivoExpediente: string;
  dependencia: string;
  descripcionDesarrollar: string;
  descripcionReforzar: string;
  diasProceso: string;
  edad: string;
  educacionFormal: string;
  efectoContratacion: string;
  estado: boolean;
  evaluacionConocimientos: string;
  expectativaLaboral: string;
  experiencia: string;
  experienciaLaboralSolicitada: string;
  experienciaRelacionada: string;
  familiaFuncional: string;
  fechaCedulaInterna: string;
  fechaCedulaResultados: string;
  fechaElaboracionPropuesta: string;
  fechaEntrevista: string;
  fechaEnvioDEyDP: string;
  fechaEnvioEvaluacionDesempenio: string;
  fechaEvaluacionCompetencias: string;
  fechaEvaluacionDesempenio: string;
  fechaInicioProcesamiento: string;
  fechaLiberacionOficio: string;
  fechaNotificacion: string;
  fechaRecibido: string;
  fechaRevisionOfiEval: string;
  FKIdClasificacionCedula: number;
  FKIdProceso: number;
  FKIdResultado: number;
  FKIdTipoCedula: number;
  folio: string;
  funcionDesempeniar: string;
  hermesNotificacion: string;
  lineamientoOficioContinuidad: string;
  motivo: string;
  motivoCedulaInterna: string;
  motivoCedulaResultados: string;
  nombreCandidato: string;
  numCarpeta: string;
  numPlaza: string;
  observaciones: string;
  observacionesAnalista: string;
  oficio?: string;
  oficioAutorizacionDeOcupacion: string;
  periodoAutorizadoOficioFin: string;
  periodoAutorizadoOficioInicio: string;
  plaza: string;
  puesto: string;
  psicometriaAnalisisProblemas: string;
  psicometriaComunicacion: string;
  psicometriaControlActividades: string;
  psicometriaDinamismo: string;
  psicometriaEnfoqueCalidad: string;
  psicometriaEnfoqueResultados: string;
  psicometriaInnovacion: string;
  psicometriaLiderazgo: string;
  psicometriaNegociacion: string;
  psicometriaOrientacionAlServicio: string;
  psicometriaPensamientoEstrategico: string;
  psicometriaPlaneacionOrganizacion: string;
  psicometriaRelacionesInterpersonales: string;
  psicometriaSensibilidadALineamientos: string;
  psicometriaTomaDecisiones: string;
  psicometriaTrabajoEnEquipo: string;
  referidoPor: string;
  resultado: string;
  resultadoEvaluacionCompetencias: string;
  resultadoEvaluacionConocimiento: string;
  resultadoHabilidadesExcel: string;
  resultadoHabilidadesWord: string;
  resultadoOrtografia: string;
  resultadoPorcentaje: string;
  resultadoProcesoEvaluacion: string;
  resultadoReferenciasLaborales: string;
  resultadoSeguimientoEvaluacionDesempenio: string;
  revisa?: string;
  seguimientoEvaluacionDesempenio: string;
  temporalidad?: "1" | "2" | "";
  titularPlaza: string;
  valida?: string;
}

export type ICedulaBasePartial = Partial<ICedulaBase>;

export interface IGetCedula {
  cedula: ICedulaBase[];
}

export interface IGetCedulas {
  cedulas: ICedulaBase[];
}

export interface ICedulaActivaBase {
  idCedula: number;
  antecedentesFamiliaresUV: string;
  capacitado: boolean;
  competenciaDesarrollar: string;
  competenciaReforzar: string;
  competenciasSobresaliente: string;
  conclusiones: string;
  descripcionDesarrollar: string;
  descripcionReforzar: string;
  edad: string;
  educacionFormal: string;
  efectoContratacion: string;
  evaluacionConocimientos: string;
  expectativaLaboral: string;
  experiencia: string;
  experienciaRelacionada: string;
  FKIdClasificacionCedula: number;
  FKIdProceso: number;
  FKIdResultado: number;
  FKIdTipoCedula: number;
  fechaCedulaInterna: string;
  fechaCedulaResultados: string;
  motivoCedulaInterna: string;
  motivoCedulaResultados: string;
  nombreCandidato: string;
  oficioAutorizacionDeOcupacion: string;
  plaza: string;
  puesto: string;
  referidoPor: string;
  resultado: string;
}

export interface IGetCedulasActivas {
  cedulas: ICedulaActivaBase[];
}

export interface ICedulaProcesoBase {
  idCedula: number;
  antecedentesFamiliaresUV: string;
  competenciaDesarrollar: string;
  competenciaReforzar: string;
  competenciasSobresaliente: string;
  conclusiones: string;
  descripcionDesarrollar: string;
  descripcionReforzar: string;
  edad: string;
  educacionFormal: string;
  efectoContratacion: string;
  evaluacionConocimientos: string;
  expectativaLaboral: string;
  experiencia: string;
  experienciaRelacionada: string;
  FKIdClasificacionCedula: number;
  FKIdProceso: number;
  FKIdResultado: number;
  FKIdTipoCedula: number;
  fechaCedulaInterna: string;
  fechaCedulaResultados: string;
  motivoCedulaInterna: string;
  motivoCedulaResultados: string;
  oficioAutorizacionDeOcupacion: string;
  plaza: string;
  puesto: string;
  referidoPor: string;
  resultado: string;
}

export interface IGetCedulaProceso {
  cedula: ICedulaProcesoBase[];
}
