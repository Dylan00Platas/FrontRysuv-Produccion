import IRegistrarCedulaExterna from "@/interfaces/cedulas/RegistrarCedulaExterna";
import APIClient from "./connection/APIClient";
import IRegistrarCedulaInterna from "@/interfaces/cedulas/RegistrarCedulaInterna";
import IRegistrarCedulaResultados from "@/interfaces/cedulas/RegistrarCedulaResultados";
import IResultadoPsicometria from "@/interfaces/cedulas/ResultadoPsicometria";

export default class CedulaService {
  private api: APIClient = new APIClient(import.meta.env.VITE_API_CEDULA_URL);

  constructor() {
    this.api = new APIClient(import.meta.env.VITE_API_CEDULA_URL);
  }

  async obtenerCompetenciasPorClasificacionCedula(idCedula: number) {
    return await this.api.request({
      endpoint: `/competencia/${idCedula}`,
      method: "GET",
    });
  }

  async registrarCedulaInterna(requestData: IRegistrarCedulaInterna) {
    return await this.api.request({
      endpoint: "/",
      method: "POST",
      body: requestData,
    });
  }

  async registrarCedulaResultados(requestData: IRegistrarCedulaResultados) {
    return await this.api.request({
      endpoint: "/",
      method: "POST",
      body: requestData,
    });
  }

  async archivarCedula(idCedula: number) {
    const data = {
      estado: true,
    };
    return await this.api.request({
      endpoint: `/${idCedula}`,
      method: "PUT",
      body: data,
    });
  }

  async registrarResultado(requestData: IResultadoPsicometria) {
    return await this.api.request({
      endpoint: "/resultado",
      method: "POST",
      body: requestData,
    });
  }

  async obtenerDatoInicialesCedula(idProcesoContratacion: number) {
    const data = {
      idProceso: Number(idProcesoContratacion),
    };
    const response = await this.api.request({
      endpoint: "/busqueda",
      method: "POST",
      body: data,
    });
  }

  async obtenerTodasCedulasDisponibles() {
    return await this.api.request({
      endpoint: "/obtencionCedulas",
      method: "GET",
    });
  }

  async obtenerCedulaResultadosPorProceso(IdProceso: number) {
    return await this.api.request({
      endpoint: `/competencia-resultados/${IdProceso}`,
      method: "GET",
    });
  }

  async obtenerCedulaPorId(FKIdProceso: number) {
    const response = await this.api.request({
      endpoint: `/busqueda/${FKIdProceso}`,
      method: "GET",
    });
  }

  async obtenerCedulasActivas() {
    const response = await this.api.request({
      endpoint: "/activas",
      method: "GET",
    });
  }

  async registrarCedulaExterna(requestData: IRegistrarCedulaExterna) {
    return await this.api.request({
      endpoint: "/externa",
      method: "POST",
      body: requestData,
    });
  }

  async obtenerCedulaExternaPorIdCedula(FKIdCedula: number) {
    return await this.api.request({
      endpoint: `/externa/${FKIdCedula}`,
      method: "GET",
    });
  }
}
