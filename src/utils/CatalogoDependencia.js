import APIClient from "@/services/connection/APIClient.js";

export default class CatalogoDependencia {
  static dependencias = [];

  constructor() {
    this.api = new APIClient(import.meta.env.VITE_API_CATALOGO_URL);
  }

  async cargarDependencias(token) {
    const response = await this.api.request(
      "/dependencias",
      "GET",
      token,
      null,
    );

    if (response.error) {
      throw new Error("No se pudieron cargar las dependencias");
    }
    CatalogoDependencia.dependencias = response.dependencias;
    return CatalogoDependencia.dependencias;
  }

  static obtenerDependencias() {
    return CatalogoDependencia.dependencias;
  }

  static obtenerDependenciaPorId(id) {
    return CatalogoDependencia.dependencias.find((d) => d.idDependencia === id);
  }

  static obtenerDependenciaPorNumeroDependencia(numDependencia) {
    return CatalogoDependencia.dependencias.find(
      (d) => d.numDependencia === numDependencia,
    );
  }

  static obtenerZonaPorIdDependencia(id) {
    const dependencia = CatalogoDependencia.dependencias.find(
      (d) => d.idDependencia === id,
    );
    return dependencia ? dependencia.zona : null;
  }
}
