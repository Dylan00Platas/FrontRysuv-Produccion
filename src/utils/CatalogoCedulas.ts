import ICedula from "@/interfaces/cedulas/Cedula";
import { IClasificacionCedula } from "@/interfaces/cedulas/ClasificacionCedula";
import IResponseHTTP from "@/interfaces/http/Response";
import APIClient from "@/services/connection/APIClient";

export default class CatalogoCedula {
  private api: APIClient = new APIClient(import.meta.env.VITE_API_CATALOGO_URL);
  static clasificacionesCedula: ICedula[] = [];

  constructor() {
    this.api = new APIClient(import.meta.env.VITE_API_CATALOGO_URL);
  }

  async getClasificacionesCedulas(): Promise<
    IResponseHTTP<IClasificacionCedula[]>
  > {
    return await this.api.request({
      endpoint: "/clasificacionesCedula",
      method: "GET",
    });
  }

  static obtenerClasificacionesCedulas() {
    return CatalogoCedula.clasificacionesCedula;
  }
}
