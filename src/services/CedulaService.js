import Constantes from "@/utils/Constantes.js";
import APIClient from "./connection/APIClient.js";

export default class CedulaService {
  constructor() {
    this.api = new APIClient(import.meta.env.VITE_API_CEDULA_URL);
  }

  async obtenerCompetenciasPorClasificacionCedula(id, token) {
    try {
      const response = await this.api.request(
        `/competencia/${id}`,
        "GET",
        token,
        null,
      );

      if (response.error) {
        throw new Error("No se pudieron cargar las competencias");
      }
      return response.competencias;
    } catch (error) {
      console.error(
        "Error en obtenerCompetenciasPorClasificacionCedula:",
        error,
      );
      throw error;
    }
  }

  async registrarCedulaInterna(formData, token) {
    const datos = {
      FKIdTipoCedula: 1,
      FKIdProceso: formData.FKIdProceso,
      fechaCedulaInterna: formData.fechaElaboracion,
      edad: formData.edad,
      educacionFormal: formData.educacion,
      referidoPor: formData.referido,
      antecedentesFamiliaresUV: formData.antecedentes,
      expectativaLaboral: formData.expectativas,
      experienciaRelacionada: formData.experienciaPuesto,
      experiencia: formData.experiencia,
      conclusiones: formData.conclusiones,
      resultado: formData.resultados,
      puesto: formData.puesto,
      FKIdClasificacionCedula: formData.cedulaSeleccionada,
    };
    const datosLimpios = this.limpiarDatos(datos);
    return await this.api.request("/", "POST", token, datosLimpios);
  }

  async registrarCedulaResultados(formData, token) {
    const datos = {
      FKIdTipoCedula: 2,
      FKIdProceso: formData.FKIdProceso,
      fechaCedulaResultados: formData.fechaElaboracion,
      edad: formData.edad,
      educacionFormal: formData.educacionFormal,
      experienciaRelacionada: formData.experiencia,
      efectoContratacion: formData.efectoContratacion,
      puesto: formData.puesto,
      plaza: formData.plaza,
      oficioAutorizacionDeOcupacion: formData.oficio,
      evaluacionConocimientos: formData.evaluacionConocimientos,

      resultadoProcesoEvaluacion: formData.resultadoProcesoEvaluacion,

      descripcionReforzar: formData.descripcionReforzar,
      descripcionDesarrollar: formData.descripcionDesarrollar,

      competenciaDesarrollar: formData.competenciaDesarrollar,
      competenciaReforzar: formData.competenciaReforzar,
      competenciasSobresaliente: formData.competenciasSobresaliente,

      aprobadoJefeOficina: formData.aprobadoJefeOficina ?? false,
      aprobadoDireccion: formData.aprobadoDireccion ?? false,
    };

    const datosLimpios = this.limpiarDatos(datos);

    console.log(
      "JSON que se enviará a /cedula:",
      JSON.stringify(datosLimpios, null, 2),
    );
    return await this.api.request("/", "POST", token, datosLimpios);
  }

  async archivarCedula(idCedula, token) {
    const datos = {
      estado: true,
    };

    const datosLimpios = this.limpiarDatos(datos);

    return await this.api.request(`/${idCedula}`, "PUT", token, datosLimpios);
  }

  limpiarDatos(obj) {
    return Object.fromEntries(
      Object.entries(obj).filter(([v]) => v !== "" && v !== undefined),
    );
  }

  async registrarResultado(idCedula, formData, competencias, token) {
    const psicometrias = {};
    competencias.forEach((comp) => {
      const key = Constantes.nombreCompetenciaMap[comp.nombreCompetencia];
      if (key) {
        psicometrias[key] = parseFloat(formData[key]) || 0;
      }
    });

    let sumaPerfil = 0;
    let sumaPsicometria = 0;

    competencias.slice(0, 11).forEach((item) => {
      const perfil = Number(item.perfil) || 0;
      const keyPsicometria =
        Constantes.nombreCompetenciaMap[item.nombreCompetencia];
      const valorPsicometria = Number(formData[keyPsicometria]) || 0;

      sumaPerfil += perfil;
      sumaPsicometria += valorPsicometria;
    });

    const resultadoCuantitativo = sumaPsicometria / sumaPerfil;
    const resultadoPorcentaje = Math.round(resultadoCuantitativo * 100);

    const datos = {
      FKIdCedula: idCedula,
      ...psicometrias,
      resultadoPorcentaje,
    };
    const datosLimpios = this.limpiarDatos(datos);
    return await this.api.request("/resultado", "POST", token, datosLimpios);
  }

  async obtenerDatoInicialesCedula(idProcesoContratacion, token) {
    const datos = {
      idProceso: Number(idProcesoContratacion),
    };
    try {
      const response = await this.api.request(
        "/busqueda",
        "POST",
        token,
        datos,
      );
      if (response.error) {
        throw new Error(
          "No se pudieron obtener los datos iniciales de la cédula",
        );
      }
      return response.procesoContratacion?.[0];
    } catch (error) {
      console.error("Error en obtener datos iniciales de cédula", error);
      throw error;
    }
  }

  async obtenerTodasCedulasDisponibles(token) {
    try {
      const response = await this.api.request(
        "/obtencionCedulas",
        "GET",
        token,
        null,
      );
      if (!response || response.error) {
        throw new Error(response?.mensaje || "Error al obtener cédulas");
      }
      return response.cedulas;
    } catch (err) {
      console.error("Error en obtenerCedulas:", err);
      throw err;
    }
  }

  async obtenerCedulaResultadosPorProceso(IdProceso, token) {
    try {
      const response = await this.api.request(
        `/competencia-resultados/${IdProceso}`,
        "GET",
        token,
        null,
      );

      // ✅ Verifica si el backend devuelve el objeto directamente o dentro de response.data
      console.log("🔍 Respuesta completa del servidor:", response);

      if (!response || response.error) {
        throw new Error("Error en la respuesta del servidor.");
      }

      // ✅ Asegura que devuelva el objeto con "resultados"
      return response.data ? response.data : response;
    } catch (error) {
      console.error("❌ Error en obtenerCedulaResultadosPorProceso:", error);
      throw error;
    }
  }

  async obtenerCedulaPorId(FKIdProceso, token) {
    try {
      const response = await this.api.request(
        `/busqueda/${FKIdProceso}`,
        "GET",
        token,
        null,
      );

      console.log(
        "🔍 Respuesta completa del servidor (obtenerCedulaPorId):",
        response,
      );

      if (!response || response.error) {
        throw new Error(
          response?.mensaje ||
            "No se pudo obtener la cédula por el ID del proceso.",
        );
      }

      // ✅ Devuelve el primer objeto dentro del arreglo 'cedula'
      return response.cedula?.[0] || null;
    } catch (error) {
      console.error("❌ Error en obtenerCedulaPorId:", error);
      throw error;
    }
  }

  async obtenerCedulasActivas(token) {
    try {
      const response = await this.api.request("/activas", "GET", token, null);
      console.log(
        "🔍 Respuesta completa del servidor (obtenerCedulasActivas):",
        response,
      );
      if (!response || response.error) {
        throw new Error(
          response?.mensaje || "Error al obtener las cédulas activas",
        );
      }
      return response.cedulas || response;
    } catch (error) {
      console.error("❌ Error en obtenerCedulasActivas:", error);
      throw error;
    }
  }

  async registrarCedulaExterna(formData, token) {
    const datos = {
      FKIdCedula: formData.FKIdCedula,
      nombre: formData.nombre,
      archivo: formData.archivo,
    };

    const datosLimpios = this.limpiarDatos(datos);

    console.log(
      "JSON que se enviará a /cedula/externa:",
      JSON.stringify(datosLimpios, null, 2),
    );

    try {
      const response = await this.api.request(
        "/externa",
        "POST",
        token,
        datosLimpios,
      );

      if (!response || response.error) {
        throw new Error(
          response?.mensaje || "Error al registrar la cédula externa.",
        );
      }

      return response;
    } catch (error) {
      console.error("❌ Error en registrarCedulaExterna:", error);
      throw error;
    }
  }

  async obtenerCedulaExternaPorIdCedula(FKIdCedula, token) {
    try {
      if (!FKIdCedula) {
        throw new Error("Se requiere el FKIdCedula para la búsqueda.");
      }

      const response = await this.api.request(
        `/externa/${FKIdCedula}`,
        "GET",
        token,
        null,
      );

      console.log(
        "🔍 Respuesta del servidor (obtenerCedulaExternaPorIdCedula):",
        response,
      );

      if (!response || response.error) {
        throw new Error(
          response?.mensaje || "No se pudo obtener la cédula externa.",
        );
      }

      return response.cedulaExterna || response;
    } catch (error) {
      console.error("❌ Error en obtenerCedulaExternaPorIdCedula:", error);
      throw error;
    }
  }
}
