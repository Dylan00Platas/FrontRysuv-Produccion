import APIClient from "./connection/APIClient.js";

export default class SolicitudService {
  constructor() {
    this.api = new APIClient(import.meta.env.VITE_API_PROCESO_CONTRATACION_URL);
  }

  async crearSolicitudAsignacionRequisicion(formData, token, tipoSolicitud) {
    const datos = {
      folio: formData.folio,
      hermesNotificacion: formData.hermes,
      fechaRecibido: formData.fechaRecibido,
      FKIdDependencia: formData.idDependencia,
      FKIdTipoPersonal: this.mapRolTipoPersonal(formData.tipoPersonal),
      numPlaza: formData.numPlaza,
      categoriaPuestoOrigen: formData.categoriaOrigen,
      titularPlaza: formData.titularPlaza,
      lineamientoOficioContinuidad: formData.lineamiento,
      motivo: formData.motivo,
      fechaElaboracionPropuesta: formData.fechaPropuesta,
      fechaLiberacionOficio: formData.fechaOficio,
      periodoAutorizadoOficioInicio: formData.periodoInicio,
      periodoAutorizadoOficioFin: formData.periodoTermino,
      FKIdTemporalDefinitiva: this.mapRolTipo(formData.tipo),
      FKIdEstadoProcesoContratacion: this.mapRolEstadoProceso(formData.estado),
      observaciones: formData.observaciones,
      FKIdTipoProceso: this.mapTipoSolicitud(tipoSolicitud),
      autorizacion: !!formData.autorizacion,
      categoriaAutorizadaOficio: formData.categoriaAutorizada,
      nombreCandidato: formData.candidato,
      fechaEntrevista: formData.fechaCita,
    };
    const datosLimpios = this.limpiarDatos(datos);
    return await this.api.request("/", "POST", token, datosLimpios);
  }

  async crearSolicitudBolsaTrabajo(formData, token, tipoSolicitud) {
    const datos = {
      folio: formData.folio,
      hermesNotificacion: formData.hermes,
      fechaRecibido: formData.fechaRecibido,
      FKIdDependencia: formData.idDependencia,
      FKIdTipoPersonal: this.mapRolTipoPersonal(formData.tipoPersonal),
      numPlaza: formData.numPlaza,
      categoriaPuestoOrigen: formData.categoriaOrigen,
      titularPlaza: formData.titularPlaza,
      lineamientoOficioContinuidad: formData.lineamiento,
      motivo: formData.motivo,
      fechaElaboracionPropuesta: formData.fechaPropuesta,
      fechaLiberacionOficio: formData.fechaOficio,
      periodoAutorizadoOficioInicio: formData.periodoInicio,
      periodoAutorizadoOficioFin: formData.periodoTermino,
      FKIdTemporalDefinitiva: this.mapRolTipo(formData.tipo),
      FKIdEstadoProcesoContratacion: this.mapRolEstadoProceso(formData.estado),
      observaciones: formData.observaciones,
      numCarpeta: formData.numeroCarpeta,
      nombreCandidato: formData.candidato,
      funcionDesempeniar: formData.funcion,
      familiaFuncional: formData.familia,
      fechaEntrevista: formData.fechaEntrevista,
      fechaEvaluacionCompetencias: formData.fechaCompetencias,
      fechaInicioProcesamiento: formData.fechaProcesamiento,
      resultadoEvaluacionConocimiento: formData.resultadoConocimiento,
      experienciaLaboralSolicitada: formData.experiencia,
      resultadoReferenciasLaborales: formData.referencias,
      fechaEnvioDEyDP: formData.fechaEnvioDes,
      beneficiado: formData.beneficiado === "si",
      fechaRevisionOfiEval: formData.fechaOfiEval,
      fechaNotificacion: formData.fechaNotificacion,
      diasProceso: formData.tiempoProceso,
      fechaEvaluacionDesempenio: formData.fechaEvaluacionDesempenio,
      observacionesAnalista: formData.observacionesAnalista,
      consecutivoExpediente: formData.consecutivoExpediente,
      seguimientoEvaluacionDesempenio: formData.seguimientoDesempeno === "si",
      resultadoSeguimientoEvaluacionDesempenio: formData.resultadoSeguimiento,
      FKIdTipoProceso: this.mapTipoSolicitud(tipoSolicitud),
      autorizacion: !!formData.autorizacion,
      categoriaAutorizadaOficio: formData.categoriaAutorizada,
    };
    const datosLimpios = this.limpiarDatos(datos);
    return await this.api.request("/", "POST", token, datosLimpios);
  }

  limpiarDatos(obj) {
    return Object.fromEntries(
      Object.entries(obj).filter(([v]) => v !== "" && v !== undefined),
    );
  }

  mapRolTipoProceso(tipoProceso) {
    switch (tipoProceso) {
      case "asignacion":
        return 1;
      case "requisicion":
        return 2;
      case "bolsa":
        return 3;
      default:
        return null;
    }
  }

  mapRolTipoPersonal(tipoPersonal) {
    switch (tipoPersonal) {
      case "confianza":
        return 1;
      case "eventual":
        return 2;
      default:
        return null;
    }
  }

  mapRolTipo(tipo) {
    switch (tipo) {
      case "temporal":
        return 1;
      case "definitiva":
        return 2;
      default:
        return null;
    }
  }

  mapRolEstadoProceso(estado) {
    switch (estado) {
      case "pendiente":
        return 9;
      case "entregado":
        return 10;
      case "notificado":
        return 11;
      default:
        return null;
    }
  }

  mapTipoSolicitud(tipoSolicitud) {
    switch (tipoSolicitud) {
      case "asignacion":
        return 1;
      case "requisicion":
        return 2;
      case "bolsa":
        return 3;
      default:
        return null;
    }
  }

  async obtenerSolicitudes(token) {
    try {
      const response = await this.api.request(
        "/busqueda/procesos/",
        "GET",
        token,
        null,
      );

      if (!response || response.error) {
        throw new Error(response?.mensaje || "Error al obtener solicitudes");
      }
      return response.procesos;
    } catch (err) {
      console.error("Error en obtenerSolicitudes:", err);
      throw err;
    }
  }

  async editarSolicitud(idProceso, formData, token) {
    try {
      const datos = {
        folio: formData.folio,
        numPlaza: formData.numPlaza,
        fechaRecibido: formData.fechaRecibido,
        fechaEntrevista: formData.fechaEntrevista,
        resultadoEvaluacionConocimiento: formData.resultadoConocimiento,
        fechaEnvioDEyDP: formData.fechaEnvioDes,
        fechaNotificacion: formData.fechaNotificacion,
        categoriaPuestoOrigen: formData.categoriaOrigen,
        diasProceso: formData.tiempoProceso,
        beneficiado: formData.beneficiado === "si",
        FKIdTipoProceso: formData.tipoSolicitud,
        FKIdTipoPersonal: formData.tipoPersonal,
        FKIdEstadoProcesoContratacion:
          formData.FKIdEstadoProcesoContratacion ?? formData.estado,
        FKIdTemporalDefinitiva: formData.tipo,
        FKIdDependencia: formData.idDependencia,
        hermesNotificacion: formData.hermes,
        titularPlaza: formData.titularPlaza,
        lineamientoOficioContinuidad: formData.lineamiento,
        motivo: formData.motivo,
        fechaElaboracionPropuesta: formData.fechaPropuesta,
        fechaLiberacionOficio: formData.fechaOficio,
        periodoAutorizadoOficioInicio: formData.periodoInicio,
        periodoAutorizadoOficioFin: formData.periodoTermino,
        observaciones: formData.observaciones,
        numCarpeta: formData.numeroCarpeta,
        nombreCandidato: formData.candidato,
        funcionDesempeniar: formData.funcion,
        familiaFuncional: formData.familia,
        fechaEvaluacionCompetencias: formData.fechaCompetencias,
        fechaInicioProcesamiento: formData.fechaProcesamiento,
        resultadoEvaluacionCompetencias: formData.resultadoCompetencias,
        experienciaLaboralSolicitada: formData.experiencia,
        resultadoReferenciasLaborales: formData.referencias,
        fechaEnvioEvaluacionDesempenio: formData.fechaEnvioDesempenio,
        fechaEntregaEvaluacionDesempenio: formData.fechaEntregaDesempenio,
        resultadoEvaluacionDesempenio: formData.resultadoDesempenio,
        resultadoHabilidadesWord: formData.resultadoWord,
        resultadoHabilidadesExcel: formData.resultadoExcel,
        resultadoOrtografia: formData.resultadoOrtografia,
        resultadoProcesoEvaluacion: formData.resultadoEvaluacion,
        fechaRevisionOfiEval: formData.fechaOfiEval,
        observacionesAnalista: formData.observacionesAnalista,
        consecutivoExpediente: formData.consecutivoExpediente,
        seguimientoEvaluacionDesempenio: formData.seguimientoDesempeno === "si",
        fechaEvaluacionDesempenio: formData.fechaEvaluacionDesempenio,
        resultadoSeguimientoEvaluacionDesempenio: formData.resultadoSeguimiento,
        FKIdAcceso: formData.idAcceso,
        educacionFormal: formData.educacionFormal,
        avaladoPor: formData.avaladoPor,
        fechaAsignacionAnalista: formData.fechaAsignacionAnalista,
        citaVirtual: formData.citaVirtual,
        atendioCita: formData.atendioCita,
      };

      const datosLimpios = this.limpiarDatos(datos);

      return await this.api.request(
        `/${idProceso}`,
        "PUT",
        token,
        datosLimpios,
      );
    } catch (err) {
      console.error("Error en editarSolicitud:", err);
      throw err;
    }
  }

  async capacitarCandidato(idProceso, token) {
    try {
      const datos = {
        capacitado: true,
        beneficiado: true,
      };

      const datosLimpios = this.limpiarDatos(datos);

      console.log(`[API PUT]: Enviando datos para idProceso ${idProceso}`);
      console.log("Payload (JSON):", datosLimpios);

      return await this.api.request(
        `/${idProceso}`,
        "PUT",
        token,
        datosLimpios,
      );
    } catch (err) {
      console.error("Error en editarSolicitud:", err);
      throw err;
    }
  }

  async actualizarProcesoContratacionCedula(idProceso, formData, token) {
    try {
      const datos = {
        numPlaza: formData.numeroPlaza,
        nombreCandidato: formData.nombre,
        FKIdDependencia: formData.FKIdDependencia,
        resultadoHabilidadesWord: formData.word,
        resultadoHabilidadesExcel: formData.excel,
        resultadoOrtografia: formData.ortografia,
        resultadoEvaluacionConocimiento: formData.evaluacionConocimientos,
        avaladoPor: formData.avaladoPor,
        educacionFormal: formData.educacionFormal,
      };
      const datosLimpios = this.limpiarDatos(datos);
      return await this.api.request(
        `/${idProceso}`,
        "PUT",
        token,
        datosLimpios,
      );
    } catch (err) {
      console.error("Error en editarCamposBasicos:", err);
      throw err;
    }
  }

  async registrarControlVersion(formData, token) {
    try {
      const datos = {
        FKIdProceso: formData.idProceso,
        jsonDatos: formData.jsonDatos,
        nombreCompleto: formData.nombreCompleto,
      };
      const datosLimpios = this.limpiarDatos(datos);
      return await this.api.request(
        "/control-version",
        "POST",
        token,
        datosLimpios,
      );
    } catch (err) {
      console.error("Error en registrarControlVersion:", err);
      throw err;
    }
  }
  async ObtenerVersionesPorID(FKIdProceso, token) {
    try {
      const response = await this.api.request(
        `/busqueda/control-version/${FKIdProceso}`,
        "GET",
        token,
        null,
      );

      console.log("Respuesta cruda del backend en servicio:", response);

      if (!response || response.error) {
        throw new Error(
          response?.mensaje ||
            "Error al obtener versiones del control de proceso",
        );
      }

      return response.controlesVersiones || [];
    } catch (err) {
      console.error("Error en ObtenerVersionesPorID:", err);
      throw err;
    }
  }

  async eliminarProcesoPorID(idProceso, token) {
    try {
      const response = await this.api.request(
        `/eliminacion/${idProceso}`,
        "DELETE",
        token,
        null,
      );

      if (!response || response.error) {
        throw response;
      }

      return response;
    } catch (err) {
      console.error("Error en eliminarProcesoPorID:", err);
      throw err;
    }
  }

  async registrarOficio(formData, token) {
    try {
      const datos = {
        idOficio: formData.idOficio,
        FKIdProcesoContratacion: formData.FKIdProcesoContratacion,
        folio: formData.folio,
        fecha: formData.fecha,
        dirigido: formData.dirigido,
        puestoDirigido: formData.puestoDirigido,
        machote: formData.machote,
        piePagina: formData.piePagina,
        tipo: formData.tipo,
      };
      const datosLimpios = this.limpiarDatos(datos);
      return await this.api.request("/oficio", "POST", token, datosLimpios);
    } catch (err) {
      console.error("Error en registrarOficio:", err);
      throw err;
    }
  }

  async obtenerOficiosPorProceso(FKIdProcesoContratacion, token) {
    try {
      const response = await this.api.request(
        `/oficios/${FKIdProcesoContratacion}`,
        "GET",
        token,
        null,
      );
      console.log("Respuesta del servidor: ", response);
      if (!response || response.error) {
        throw new Error(response?.mensaje || "Error al obtener oficios");
      }
      return response.oficios || [];
    } catch (err) {
      console.error("Error en obtenerOficiosPorProceso:", err);
      throw err;
    }
  }

  async registrarSeguimientoHermes(registros, token) {
    try {
      const datos = registros.map((r) => ({
        folio: r.Folio,
        fechaRecepcion: r["Fecha de Recepción"],
        importancia: r.Importancia,
        tipoEnvio: r["Tipo de Envío"],
        requiereRespuesta: r["Requiere Respuesta"] === "Sí",
        solicita: r.Solicita,
        entidadDependencia: r["Entidad/Dependencia"],
        asunto: r.Asunto,
        estatus: r.Estatus,
        acciones: r.Acciones,
      }));

      const datosLimpios = datos.map((d) => this.limpiarDatos(d));

      return await this.api.request("/seguimiento-hermes", "POST", token, {
        registros: datosLimpios,
      });
    } catch (err) {
      console.error("Error en registrarSeguimientoHermes:", err);
      throw err;
    }
  }

  async obtenerTodosSeguimientoHermes(token) {
    try {
      const response = await this.api.request(
        "/obtencion-seguimiento-hermes",
        "GET",
        token,
        null,
      );
      if (!response || response.error) {
        throw new Error(
          response?.mensaje || "Error al obtener los seguimientos Hermes",
        );
      }
      return response.seguimientos || response;
    } catch (error) {
      console.error("Error en obtenerTodosSeguimientoHermes:", error);
      throw error;
    }
  }
}
