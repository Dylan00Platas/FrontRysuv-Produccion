export interface IGetEstadisticaAnalista {
	folio: string;
	numPlaza: string;
	fechaRecibido: string;
	fechaEntrevista: string;
	resultadoEvaluacionConocimiento: string;
	fechaEnvioDEyDP: string;
	fechaNotificacion: string;
	categoriaPuestoOrigen: string;
	diasProceso: number;
	hermesNotificacion: string;
	titularPlaza: string;
	lineamientoOficioContinuidad: string;
	motivo: string;
	fechaElaboracionPropuesta: string;
	fechaLiberacionOficio: string;
	periodoAutorizadoOficioInicio: string;
	periodoAutorizadoOficioFin: string;
	observaciones: string;
	numCarpeta: string;
	nombreCandidato: string;
	funcionDesempeniar: string;
	familiaFuncional: string;
	fechaEvaluacionCompetencias: string;
	fechaInicioProcesamiento: string;
	resultadoEvaluacionCompetencias: string;
	experienciaLaboralSolicitada: string;
	resultadoReferenciasLaborales: string;
	fechaEnvioEvaluacionDesempenio: string;
	resultadoHabilidadesWord: number;
	resultadoHabilidadesExcel: number;
	resultadoOrtografia: number;
	resultadoProcesoEvaluacion: string;
	fechaRevisionOfiEval: string;
	observacionesAnalista: string;
	consecutivoExpediente: string;
	resultadoSeguimientoEvaluacionDesempenio: string;
	nombre: string;
	primerApellido: string;
	segundoApellido: string;
}

export interface s {
	evaluacionesAnalista: IGetEstadisticaAnalista[];
}
