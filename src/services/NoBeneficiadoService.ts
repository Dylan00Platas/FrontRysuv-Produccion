import APIClient from "./connection/APIClient";

export default class NoBeneficiadoService {
  private api: APIClient = new APIClient(
    import.meta.env.VITE_API_PROCESO_CONTRATACION_URL,
  );

  constructor() {
    this.api = new APIClient(import.meta.env.VITE_API_PROCESO_CONTRATACION_URL);
  }

  async ObtenerTodosLosNoBeneficiados(token: string) {
    return await this.api.request({
      endpoint: "/noBeneficiados",
      method: "GET",
      token,
    });
  }
}
