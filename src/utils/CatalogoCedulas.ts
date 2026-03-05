import ICedula from "@/interfaces/cedulas/Cedula";
import APIClient from "@/services/connection/APIClient";

export default class CatalogoCedula {
  private api: APIClient = new APIClient(import.meta.env.VITE_API_CATALOGO_URL);
  static clasificacionesCedula: ICedula[] = [];

  constructor() {
    this.api = new APIClient(import.meta.env.VITE_API_CATALOGO_URL);
  }

  async cargarCedulas() {
    const response = await this.api.request<{
      clasificacionesCedula: ICedula[];
    }>({
      endpoint: "/clasificacionesCedula",
      method: "GET",
    });

    CatalogoCedula.clasificacionesCedula = response.clasificacionesCedula;
    return CatalogoCedula.clasificacionesCedula;
  }

  static obtenerClasificacionesCedulas() {
    return CatalogoCedula.clasificacionesCedula;
  }
}
