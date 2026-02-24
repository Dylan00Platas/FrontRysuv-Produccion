import ClienteAPI from "./connection/APIClient.js";

export default class NoBeneficiadoService {
  constructor() {
    this.api = new ClienteAPI(import.meta.env.VITE_API_URL);
  }

  async ObtenerTodosLosNoBeneficiados(token) {
    try {
      const response = await this.api.request(
        "/procesoContratacion/noBeneficiados",
        "GET",
        null,
        token,
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
