import { EncryptData } from "@/utils/EncryptData.js";
import APIClient from "./connection/APIClient.js";
import ILogin from "@/interfaces/auth/Login.js";
import IResponseLogin from "@/interfaces/auth/ResponseLogin.js";

export default class AuthService {
  private api: APIClient = new APIClient(import.meta.env.VITE_API_ACCESO_URL);

  constructor() {
    this.api = new APIClient(import.meta.env.VITE_API_ACCESO_URL);
  }

  async login(requestData: ILogin) {
    let hashedPassword = await EncryptData.sha256(requestData.contrasenia);

    const response: IResponseLogin = await this.api.request({
      endpoint: "/login",
      method: "POST",
      body: requestData,
    });

    if (response.token) {
      this.saveToken(response.token);
    }

    let mensaje = "Operación completada";
    if (response?.mensaje) {
      if (typeof response.mensaje === "string") {
        mensaje = response.mensaje;
      } else if (typeof response.mensaje === "object") {
        // TODO-Desarrollo: Si el objeto tiene una propiedad "mensaje" interna
        /*
          if (typeof response.mensaje.mensaje === "string") {
            mensaje = response.mensaje.mensaje;
          } else {
            // Si no, convierte el objeto en texto legible
            mensaje = JSON.stringify(data.mensaje);
          }
          */
      }
    }

    return {
      token: response.token || null,
      usuario: response.usuario || null,
      error: !!response.error,
      mensaje,
    };
  }

  saveToken(token: string) {
    localStorage.setItem("token", token);
  }

  getToken() {
    return localStorage.getItem("token");
  }

  logout() {
    localStorage.removeItem("token");
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}
