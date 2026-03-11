import APIClient from "./connection/APIClient";
import IResponseHTTP from "@/interfaces/http/Response";
import { IGetClasificacionesCedula } from "@/schemas/catalogos/GetClasificacionCedula";
import { IGetDependencias } from "@/schemas/catalogos/GetDependencia";
import { IGetEstadosProcesoContratacion } from "@/schemas/catalogos/GetStatesContractingProcess";
import { IGetTemporalDefinitiva } from "@/schemas/catalogos/GetTemporaryPermanent";
import { IGetTiposCedula } from "@/schemas/catalogos/GetTipoCedula";
import { IGetTiposPersonal } from "@/schemas/catalogos/GetTipoPersonal";
import { IGetTiposProceso } from "@/schemas/catalogos/GetTipoProceso";

export default class CatalogoService {
  private api: APIClient = new APIClient(import.meta.env.VITE_API_CATALOGO_URL);

  constructor() {
    this.api = new APIClient(import.meta.env.VITE_API_CATALOGO_URL);
  }

  async getTiposProceso(): Promise<IResponseHTTP<IGetTiposProceso>> {
    return await this.api.request({
      endpoint: "/tiposProceso",
      method: "GET",
    });
  }

  async getTiposPersonal(): Promise<IResponseHTTP<IGetTiposPersonal>> {
    return await this.api.request({
      endpoint: "/tiposPersonal",
      method: "GET",
    });
  }

  async getEstadosProcesoContratacion(): Promise<
    IResponseHTTP<IGetEstadosProcesoContratacion>
  > {
    return await this.api.request({
      endpoint: "/estadosProcesoContratacion",
      method: "GET",
    });
  }

  async getTemporalDefinitiva(): Promise<
    IResponseHTTP<IGetTemporalDefinitiva>
  > {
    return await this.api.request({
      endpoint: "/temporalDefinitiva",
      method: "GET",
    });
  }

  async getTiposCedula(): Promise<IResponseHTTP<IGetTiposCedula>> {
    return await this.api.request({
      endpoint: "/tiposCedula",
      method: "GET",
    });
  }

  async getDependencias(): Promise<IResponseHTTP<IGetDependencias>> {
    return await this.api.request({
      endpoint: "/dependencias",
      method: "GET",
    });
  }

  async getClasificacionesCedulas(): Promise<
    IResponseHTTP<IGetClasificacionesCedula>
  > {
    return await this.api.request({
      endpoint: "/clasificacionCedula",
      method: "GET",
    });
  }
}
