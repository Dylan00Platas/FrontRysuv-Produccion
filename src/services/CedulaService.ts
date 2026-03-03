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

  async obtenerCompetenciasPorClasificacionCedula(
    token: string,
    idCedula: number,
  ) {
    return await this.api.request({
      endpoint: `/competencia/${idCedula}`,
      method: "GET",
      token,
    });
  }

  async registrarCedulaInterna(
    token: string,
    requestData: IRegistrarCedulaInterna,
  ) {
    return await this.api.request({
      endpoint: "/",
      method: "POST",
      token,
      body: requestData,
    });
  }

  async registrarCedulaResultados(
    token: string,
    requestData: IRegistrarCedulaResultados,
  ) {
    return await this.api.request({
      endpoint: "/",
      method: "POST",
      token,
      body: requestData,
    });
  }

  async archivarCedula(token: string, idCedula: number) {
    const data = {
      estado: true,
    };
    return await this.api.request({
      endpoint: `/${idCedula}`,
      method: "PUT",
      token,
      body: data,
    });
  }

  async registrarResultado(token: string, requestData: IResultadoPsicometria) {
    return await this.api.request({
      endpoint: "/resultado",
      method: "POST",
      token,
      body: requestData,
    });
  }

  async obtenerDatoInicialesCedula(
    token: string,
    idProcesoContratacion: number,
  ) {
    const data = {
      idProceso: Number(idProcesoContratacion),
    };
    const response = await this.api.request({
      endpoint: "/busqueda",
      method: "POST",
      token,
      body: data,
    });
  }

  async obtenerTodasCedulasDisponibles(token: string) {
    return await this.api.request({
      endpoint: "/obtencionCedulas",
      method: "GET",
      token,
    });
  }

  async obtenerCedulaResultadosPorProceso(token: string, IdProceso: number) {
    return await this.api.request({
      endpoint: `/competencia-resultados/${IdProceso}`,
      method: "GET",
      token,
    });
  }

  async obtenerCedulaPorId(token: string, FKIdProceso: number) {
    const response = await this.api.request({
      endpoint: `/busqueda/${FKIdProceso}`,
      method: "GET",
      token,
    });
  }

  async obtenerCedulasActivas(token: string) {
    const response = await this.api.request({
      endpoint: "/activas",
      method: "GET",
      token,
    });
  }

  async registrarCedulaExterna(
    token: string,
    requestData: IRegistrarCedulaExterna,
  ) {
    return await this.api.request({
      endpoint: "/externa",
      method: "POST",
      token,
      body: requestData,
    });
  }

  async obtenerCedulaExternaPorIdCedula(token: string, FKIdCedula: number) {
    return await this.api.request({
      endpoint: `/externa/${FKIdCedula}`,
      method: "GET",
      token,
    });
  }
}
