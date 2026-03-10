// TODO-Desarrollo: Verificar iinterfaces con el backend y no el servidor
import APIClient from "./connection/APIClient";
import IActualizarProcesoContratacionCedula from "@/interfaces/solicitudes/ActualizarProcesoContratacionCedula";
import IActualizarSolicitud from "@/interfaces/solicitudes/ActualizarSolicitud";
import IRegistrarOficio from "@/interfaces/solicitudes/RegistrarOficio";
import IRegistrarSeguimientoHermes from "@/interfaces/solicitudes/RegistrarSeguimientoHermes";
import ISolicitud from "@/interfaces/solicitudes/Solicitud";
import ISolicitudProceso from "@/interfaces/procesos/Solicitud";
import { IActualizarEstadoCita } from "@/interfaces/agendas/ActualizarEstadoCita";

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
  async crearSolicitudAsignacionRequisicion(requestData: ISolicitud) {
    requestData.FKIdTipoProceso = 2;
    return await this.api.request({
      endpoint: "/",
      method: "POST",
      body: requestData,
    });
  }

  async crearSolicitudBolsaTrabajo(requestData: ISolicitud) {
    requestData.FKIdTipoProceso = 3;
    return await this.api.request({
      endpoint: "/",
      method: "POST",
      body: requestData,
    });
  }

  async obtenerSolicitudes(): Promise<Record<string, ISolicitudProceso>> {
    return await this.api.request({
      endpoint: "/busqueda/procesos/",
      method: "GET",
    });
  }

  async editarSolicitud(dataUpdate: IActualizarEstadoCita) {
    return await this.api.request({
      endpoint: `/${dataUpdate.idEventoSeleccionado}`,
      method: "PUT",
      body: dataUpdate,
    });
  }

  async capacitarCandidato(idProceso: number) {
    // TODO-Desarrllo: Checar el uso de la estructura
    const data = {
      capacitado: true,
      beneficiado: true,
    };

    return await this.api.request({
      endpoint: `/${idProceso}`,
      method: "PUT",
      body: data,
    });
  }

  async actualizarProcesoContratacionCedula(
    idProceso: number,
    requestData: IActualizarProcesoContratacionCedula,
  ) {
    return await this.api.request({
      endpoint: `/${idProceso}`,
      method: "PUT",
      body: requestData,
    });
  }

  async registrarControlVersion(
    requestData: IActualizarProcesoContratacionCedula,
  ) {
    return await this.api.request({
      endpoint: "/control-version",
      method: "POST",
      body: requestData,
    });
  }

  async ObtenerVersionesPorID(FKIdProceso: number) {
    return await this.api.request({
      endpoint: `/busqueda/control-version/${FKIdProceso}`,
      method: "GET",
    });
  }

  async eliminarProcesoPorID(idProceso: number) {
    return await this.api.request({
      endpoint: `/eliminacion/${idProceso}`,
      method: "DELETE",
    });
  }

  async registrarOficio(requestData: IRegistrarOficio) {
    return await this.api.request({
      endpoint: "/oficio",
      method: "POST",
      body: requestData,
    });
  }

  async obtenerOficiosPorProceso(FKIdProcesoContratacion: number) {
    return await this.api.request({
      endpoint: `/oficios/${FKIdProcesoContratacion}`,
      method: "GET",
    });
  }

  async registrarSeguimientoHermes(requestData: IRegistrarSeguimientoHermes) {
    return await this.api.request({
      endpoint: "/seguimiento-hermes",
      method: "POST",
      body: requestData,
    });
  }

  async obtenerTodosSeguimientoHermes() {
    return await this.api.request({
      endpoint: "/obtencion-seguimiento-hermes",
      method: "GET",
    });
  }
}
