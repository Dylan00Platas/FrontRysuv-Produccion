import ClienteAPI from "./ClienteAPI.js";

export default class EvaluacionServicio {
    constructor() {
        this.api = new ClienteAPI(import.meta.env.VITE_API_URL);
    }

    async registrarEvaluacion(idProceso,formData,token){
        try
        {               
            const datos = {
                folio: formData.folio,
                numPlaza: formData.numPlaza,
                fechaRecibido: formData.fechaRecibido,                
                fechaEntrevista: formData.fechaEntrevista,
                resultadoEvaluacionConocimiento: formData.resultadoConocimiento,
                fechaEnvioDEyDP: formData.fechaEnvio,
                fechaNotificacion: formData.fechaNotificacion,
                categoriaPuestoOrigen: formData.categoria,
                diasProceso: formData.tiempoProceso,
                beneficiado: formData.beneficiado  === "si" ,                
                FKIdTipoPersonal: this.mapRolTipoPersonal(formData.tipoPersonal),
                FKIdEstadoProcesoContratacion: this.mapRolEstadoProcesoContratacion(formData.estado),
                FKIdTemporalDefinitiva: this.mapRolTemporalDefinitiva(formData.tipo),
                hermesNotificacion: formData.hermes,
                titularPlaza: formData.titular,
                lineamientoOficioContinuidad: formData.lineamiento,
                motivo: formData.motivo,
                fechaElaboracionPropuesta: formData.fechaPropuesta,
                fechaLiberacionOficio: formData.fechaLiberacion,
                periodoAutorizadoOficioInicio: formData.pInicio,
                periodoAutorizadoOficioFin: formData.periodoTermino || formData.pTermino,
                categoriaAutorizadaOficio: formData.categoriaAutorizada,
                observaciones: formData.observacionesRegistro,
                numCarpeta: formData.nCarpeta,
                nombreCandidato: formData.candidato,
                funcionDesempeniar: formData.funcion,
                familiaFuncional: formData.familia,
                fechaEvaluacionCompetencias: formData.fechaCompetencias,
                fechaInicioProcesamiento: formData.fechaProcesamiento,
                resultadoEvaluacionCompetencias: formData.resultadoCompetencias,
                experienciaLaboralSolicitada: formData.experienciaLaboral,
                resultadoReferenciasLaborales: formData.resultadoReferencias,
                fechaEnvioEvaluacionDesempenio: formData.fechaEnvioEval,
                fechaEntregaEvaluacionDesempenio: formData.fechaEntregaDesempenio,
                resultadoEvaluacionDesempenio: formData.resultadoDesempenio,
                resultadoHabilidadesWord: formData.resultadoWord,
                resultadoHabilidadesExcel: formData.resultadoExcel,
                resultadoOrtografia: formData.resultadoOrtografia,
                resultadoProcesoEvaluacion: formData.resultadoEvaluacion,
                fechaRevisionOfiEval: formData.fechaRevision,
                observacionesAnalista: formData.observacionesAnalista,
                consecutivoExpediente: formData.consecutivo,
                seguimientoEvaluacionDesempenio: formData.seguimientoDesempeno === "Si",
                fechaEvaluacionDesempenio: formData.fechaEvaluacionDesempenio,
                resultadoSeguimientoEvaluacionDesempenio: formData.resultadoSeguimiento,
                FKIdDependencia: formData.FKIdDependencia
            };   
            const datosLimpios = this.limpiarDatos(datos);
            return await this.api.request(
                `/procesoContratacion/${idProceso}`,
                "PUT",
                datosLimpios,
                token
            );
        } catch (err) {
            console.error("Error en registrarEvaluacion:", err);
            throw err;
        }
    }

    limpiarDatos(obj) {
        return Object.fromEntries(
            Object.entries(obj).filter(([_, v]) => v !== "" && v !== undefined)
        );
    }

    mapRolTipoPersonal(tipoPersonal){
        switch(tipoPersonal){
            case "1":
                return 1;            
            case "2":
                return 2;
            default: 
                return 1;
        }    
    }

    mapRolEstadoProcesoContratacion(estadoProceso){
        switch(estadoProceso){
            case "Citado":
                return 1;
            case "Evaluado":
                return 2;
            case "En revision":
                return 4;
            case "En firma":
                return 5;
            case "Notificado":
                return 6;
            case "Cancelado":
                return 7;
            case "Terminado":
                return 8;
            case "Inicio procesamiento":
                return 13;
            case "Procesamiento oficio":
                return 14;
            case "Fin procesamiento":
                return 15;
            default:
                return 1;            
        }
    }

    mapRolTemporalDefinitiva(tipo){
        switch(tipo){
            case "Temporal":
                return 1;
            case "Definitiva":
                return 2;
            default:
                return 1;
        }
    }    
}