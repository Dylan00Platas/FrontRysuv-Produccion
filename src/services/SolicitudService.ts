// TODO-Desarrollo: Verificar iinterfaces con el backend y no el servidor
import APIClient from "./connection/APIClient";
import IActualizarProcesoContratacionCedula from "@/interfaces/solicitudes/ActualizarProcesoContratacionCedula";
import IActualizarSolicitud from "@/interfaces/solicitudes/ActualizarSolicitud";
import IRegistrarOficio from "@/interfaces/solicitudes/RegistrarOficio";
import IRegistrarSeguimientoHermes from "@/interfaces/solicitudes/RegistrarSeguimientoHermes";
import ISolicitud from "@/interfaces/solicitudes/Solicitud";

export default class SolicitudService {
  private api: APIClient = new APIClient(
    import.meta.env.VITE_API_PROCESO_CONTRATACION_URL,
  );
  constructor() {
    this.api = new APIClient(import.meta.env.VITE_API_PROCESO_CONTRATACION_URL);
  }

  /**
   * TODO-Desarrollo: Verificar la funcion y diferencia de
   * crearSolicitudAsignacionRequisicion()
   * crearSolicitudBolsaTrabajo()
   *  */
  async crearSolicitudAsignacionRequisicion(
    requestData: ISolicitud,
    token: string,
  ) {
    requestData.FKIdTipoProceso = 2;
    return await this.api.request({
      endpoint: "/",
      method: "POST",
      token,
      body: requestData,
    });
  }

  async crearSolicitudBolsaTrabajo(requestData: ISolicitud, token: string) {
    requestData.FKIdTipoProceso = 3;
    return await this.api.request({
      endpoint: "/",
      method: "POST",
      token,
      body: requestData,
    });
  }

  async obtenerSolicitudes(token: string) {
    return await this.api.request({
      endpoint: "/busqueda/procesos/",
      method: "GET",
      token,
    });
  }

  async editarSolicitud(
    idSolicitud: number,
    dataUpdate: IActualizarSolicitud,
    token: string,
  ) {
    return await this.api.request({
      endpoint: `/${idSolicitud}`,
      method: "PUT",
      token,
      body: dataUpdate,
    });
  }

  async capacitarCandidato(idProceso: number, token: string) {
    // TODO-Desarrllo: Checar el uso de la estructura
    const data = {
      capacitado: true,
      beneficiado: true,
    };

    return await this.api.request({
      endpoint: `/${idProceso}`,
      method: "PUT",
      token,
      body: data,
    });
  }

  async actualizarProcesoContratacionCedula(
    token: string,
    idProceso: number,
    requestData: IActualizarProcesoContratacionCedula,
  ) {
    return await this.api.request({
      endpoint: `/${idProceso}`,
      method: "PUT",
      token,
      body: requestData,
    });
  }

  async registrarControlVersion(
    token: string,
    requestData: IActualizarProcesoContratacionCedula,
  ) {
    return await this.api.request({
      endpoint: "/control-version",
      method: "POST",
      token,
      body: requestData,
    });
  }

  async ObtenerVersionesPorID(token: string, FKIdProceso: number) {
    return await this.api.request({
      endpoint: `/busqueda/control-version/${FKIdProceso}`,
      method: "GET",
      token,
    });
  }

  async eliminarProcesoPorID(token: string, idProceso: number) {
    return await this.api.request({
      endpoint: `/eliminacion/${idProceso}`,
      method: "DELETE",
      token,
    });
  }

  async registrarOficio(token: string, requestData: IRegistrarOficio) {
    return await this.api.request({
      endpoint: "/oficio",
      method: "POST",
      token,
      body: requestData,
    });
  }

  async obtenerOficiosPorProceso(
    token: string,
    FKIdProcesoContratacion: number,
  ) {
    return await this.api.request({
      endpoint: `/oficios/${FKIdProcesoContratacion}`,
      method: "GET",
      token,
    });
  }

  async registrarSeguimientoHermes(
    token: string,
    requestData: IRegistrarSeguimientoHermes,
  ) {
    return await this.api.request({
      endpoint: "/seguimiento-hermes",
      method: "POST",
      token,
      body: requestData,
    });
  }

  async obtenerTodosSeguimientoHermes(token: string) {
    return await this.api.request({
      endpoint: "/obtencion-seguimiento-hermes",
      method: "GET",
      token,
    });
  }
}
