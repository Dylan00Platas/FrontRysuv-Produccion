import IDependencia from "@/interfaces/dependencias/Dependencia";
import APIClient from "@/services/connection/APIClient";

export default class CatalogoDependencia {
  private api: APIClient = new APIClient(import.meta.env.VITE_API_CATALOGO_URL);
  static dependencias: IDependencia[] = [];

  constructor() {
    this.api = new APIClient(import.meta.env.VITE_API_CATALOGO_URL);
  }

  async cargarDependencias(token: string) {
    const response = await this.api.request<{
      dependencias: IDependencia[];
    }>({
      endpoint: "/dependencias",
      method: "GET",
      token,
    });

    CatalogoDependencia.dependencias = response.dependencias;
    return CatalogoDependencia.dependencias;
  }

  static obtenerDependencias() {
    return this.dependencias;
  }

  static obtenerDependenciaPorId(id: number) {
    return this.dependencias.find((d: IDependencia) => d.idDependencia === id);
  }

  static obtenerDependenciaPorNumeroDependencia(numDependencia: string) {
    return this.dependencias.find(
      (d: IDependencia) => d.numDependencia === numDependencia,
    );
  }

  static obtenerZonaPorIdDependencia(idDependencia: number) {
    const dependencia = this.dependencias.find(
      (d: IDependencia) => d.idDependencia == idDependencia,
    );
    return dependencia ? dependencia.zona : null;
  }
}
