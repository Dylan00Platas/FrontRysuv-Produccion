import APIClient from "./connection/APIClient";
import IRegistrarEvaluacion from "@/interfaces/evaluaciones/RegistrarEvaluacion";

export default class EvaluacionServicio {
  private api: APIClient = new APIClient(
    import.meta.env.VITE_API_PROCESO_CONTRATACION_URL,
  );

  constructor() {
    this.api = new APIClient(import.meta.env.VITE_API_PROCESO_CONTRATACION_URL);
  }

  async registrarEvaluacion(
    idProceso: number,
    requestData: IRegistrarEvaluacion,
  ) {
    return await this.api.request({
      endpoint: `/${idProceso}`,
      method: "PUT",
      body: requestData,
    });
  }
}
