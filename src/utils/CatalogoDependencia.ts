import IDependencia from "@/interfaces/dependencias/Dependencia";
import IResponseHTTP from "@/interfaces/http/Response";
import APIClient from "@/services/connection/APIClient";

export default class CatalogoDependencia {
  private api: APIClient = new APIClient(import.meta.env.VITE_API_CATALOGO_URL);
  static dependencias: IDependencia[] = [];

  constructor() {
    this.api = new APIClient(import.meta.env.VITE_API_CATALOGO_URL);
  }

  async cargarDependencias(): Promise<IResponseHTTP<IDependencia[]>> {
    return await this.api.request({
      endpoint: "/dependencias",
      method: "GET",
    });
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
