import APIClient from "./connection/APIClient.js";

export default class NoBeneficiadoService {
  constructor() {
    this.api = new APIClient(import.meta.env.VITE_API_PROCESO_CONTRATACION_URL);
  }

  async ObtenerTodosLosNoBeneficiados(token) {
    try {
      const response = await this.api.request(
        "/noBeneficiados",
        "GET",
        token,
        null,
      );

      if (!response || response.error) {
        throw new Error(
          response?.mensaje || "Error al obtener no beneficiados",
        );
      }
      return response.procesos;
    } catch (err) {
      console.error("Error en obtenerNoBeneficiados:", err);
      throw err;
    }
  }
}
