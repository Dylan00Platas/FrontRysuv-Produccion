import { IPostProcesoContratacion, ISolicitudAsignacionRequisicion, ISolicitudBolsaTrabajo } from "@/schemas/procesos-contratacion/PostProcesoContratacion";
import APIClient from "./connection/APIClient";
import IResponseHTTP from "@/interfaces/http/Response";
import IPutProcesoContratacion, {type 
  IPutProcesoContratacionCedula,
} from "@/schemas/procesos-contratacion/PutProcesoContratacion";
import {
  IGetProcesoContratacion,
  IGetProcesosContratacion,
  IGetProcesosContratacionCandidatosNoBeneficiados,
} from "@/schemas/procesos-contratacion/GetProcesoContratacion";
import { IGetControlVerionesProceso } from "@/schemas/control-versiones/GetControlVersion";
import IPostOficioProcesoContratacion from "@/schemas/procesos-contratacion/PostOficioProcesoContratacion";
import { IGetOficiosProcesoContratacion } from "@/schemas/procesos-contratacion/GetOficioProcesoContratacion";
import { IPostSeguimientoHermes } from "@/schemas/procesos-contratacion/PostSeguimientoHermes";
import IPostControlVersion from "@/schemas/control-versiones/PostControlVersion";
import { IGetSeguimientoHermes } from "@/schemas/procesos-contratacion/GetSeguimientoHermes";

export default class ProcesoContratacionService {
  private api: APIClient = new APIClient(
    import.meta.env.VITE_API_PROCESO_CONTRATACION_URL,
  );

  constructor() {
    this.api = new APIClient(import.meta.env.VITE_API_PROCESO_CONTRATACION_URL);
  }

  async postProcesoContratacion(
    data: IPostProcesoContratacion | ISolicitudAsignacionRequisicion | ISolicitudBolsaTrabajo,
  ): Promise<IResponseHTTP<string>> {
    return await this.api.request({
      endpoint: "/",
      method: "POST",
      body: data,
    });
  }

  async putProcesoContratacion(
    idProceso: number,
    data:
      | IPutProcesoContratacion
      | IPutProcesoContratacionCedula
      | { candidato: boolean },
  ): Promise<IResponseHTTP<string>> {
    return await this.api.request({
      endpoint: `/${idProceso}`,
      method: "PUT",
      body: data,
    });
  }

  async getProcesosContratacionNoBeneficiados(): Promise<
    IResponseHTTP<IGetProcesosContratacionCandidatosNoBeneficiados>
  > {
    return await this.api.request({
      endpoint: `/noBeneficiados`,
      method: "GET",
    });
  }

  async getProcesosContratacion(): Promise<
    IResponseHTTP<IGetProcesosContratacion>
  > {
    return await this.api.request({
      endpoint: `/busqueda/procesos`,
      method: "GET",
    });
  }

  async getProcesoContratacionById(
    idProceso: number,
  ): Promise<IResponseHTTP<IGetProcesoContratacion>> {
    return await this.api.request({
      endpoint: `/busqueda/proceso/${idProceso}`,
      method: "GET",
    });
  }

  async getProcesosContratacionAnalista(
    idAnalista: number,
  ): Promise<IResponseHTTP<IGetProcesosContratacion>> {
    return await this.api.request({
      endpoint: `/busqueda/${idAnalista}`,
      method: "GET",
    });
  }

  async getProcesosContratacionEstado(
    FKIdEstadoProcesoContratacion: number,
  ): Promise<IResponseHTTP<IGetProcesosContratacion>> {
    return await this.api.request({
      endpoint: `/busqueda/estado/${FKIdEstadoProcesoContratacion}`,
      method: "GET",
    });
  }

  async getProcesosContratacionEstadisticaAnalista(
    FKIdAcceso: number,
  ): Promise<IResponseHTTP<IGetProcesosContratacion>> {
    return await this.api.request({
      endpoint: `/estadistica/${FKIdAcceso}`,
      method: "GET",
    });
  }

  async deleteProcesoContratacionById(
    idProceso: number,
  ): Promise<IResponseHTTP<string>> {
    return await this.api.request({
      endpoint: `/eliminacion/${idProceso}`,
      method: "DELETE",
    });
  }

  async postControlVersion(
    data: IPostControlVersion,
  ): Promise<IResponseHTTP<string>> {
    return await this.api.request({
      endpoint: `/control-version`,
      method: "POST",
      body: data,
    });
  }

  async getControlesVersionByProcesoId(
    idProcess: number,
  ): Promise<IResponseHTTP<IGetControlVerionesProceso>> {
    return await this.api.request({
      endpoint: `/busqueda/control-version/${idProcess}`,
      method: "GET",
    });
  }

  async postOficio(
    data: IPostOficioProcesoContratacion,
  ): Promise<IResponseHTTP<string>> {
    return await this.api.request({
      endpoint: `/oficio`,
      method: "POST",
      body: data,
    });
  }

  async getOficio(
    FKIdProcesoContratacion: number,
  ): Promise<IResponseHTTP<IGetOficiosProcesoContratacion>> {
    return await this.api.request({
      endpoint: `/oficios/${FKIdProcesoContratacion}`,
      method: "GET",
    });
  }

  async postSeguimientoHermes(
    data: IPostSeguimientoHermes,
  ): Promise<IResponseHTTP<string>> {
    return await this.api.request({
      endpoint: `/seguimiento-hermes`,
      method: "POST",
      body: data,
    });
  }

  async getSeguimientoHermes(): Promise<IResponseHTTP<IGetSeguimientoHermes>> {
    return await this.api.request({
      endpoint: `/obtencion-seguimiento-hermes`,
      method: "GET",
    });
  }
}
