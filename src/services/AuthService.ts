import { EncryptData } from "@/utils/EncryptData.js";
import APIClient from "./connection/APIClient";
import ILogin from "@/interfaces/auth/Login";
import IResponseHTTP from "@/interfaces/http/Response";

export default class AuthService {
  private api: APIClient = new APIClient(import.meta.env.VITE_API_ACCESO_URL);

  constructor() {
    this.api = new APIClient(import.meta.env.VITE_API_ACCESO_URL);
  }

  async login(requestData: ILogin) {
    requestData.contrasenia = await EncryptData.sha256(requestData.contrasenia);

    const response: IResponseHTTP<string> = await this.api.request({
      endpoint: "/login",
      method: "POST",
      body: requestData,
      withCredentials: false,
    });

    return {
      isError: response.error!!,
      message: response.mensaje,
    };
  }

  saveToken(token: string) {
    // TODO-Desarrollo: Agregar endpoint que elimine cookie en el backend
  }

  getToken() {
    // TODO-Desarrollo: Agregar endpoint que elimine cookie en el backend
  }

  logout() {
    // TODO-Desarrollo: Agregar endpoint que elimine cookie en el backend
  }

  isAuthenticated() {
    // TODO-Desarrollo: Agregar endpoint que elimine cookie en el backend
  }
}
