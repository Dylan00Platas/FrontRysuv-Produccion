import { EncryptData } from "@/utils/EncryptData.js";
import APIClient from "./connection/APIClient";
import IResponseHTTP from "@/interfaces/http/Response";
import ILogin from "@/schemas/acceso/PostLogin";
import IPostUsuario from "@/schemas/acceso/PostUser";
import ICurrentUser from "@/interfaces/auth/CurrentUser";

export default class AuthService {
  private api: APIClient = new APIClient(import.meta.env.VITE_API_ACCESO_URL);

  constructor() {
    this.api = new APIClient(import.meta.env.VITE_API_ACCESO_URL);
  }

  async login(requestData: ILogin): Promise<IResponseHTTP<string>> {
    requestData.contrasenia = await EncryptData.sha256(requestData.contrasenia);

    const response: IResponseHTTP<string> = await this.api.request({
      endpoint: "/login",
      method: "POST",
      body: requestData,
      withCredentials: false,
    });

    return response;
  }

  async me(): Promise<IResponseHTTP<ICurrentUser>> {
    return await this.api.request({
      endpoint: "/me",
      method: "GET",
    });
  }

  saveToken(token: string) {
    // TODO-Desarrollo: Agregar endpoint que elimine cookie en el backend
  }

  getToken() {
    // TODO-Desarrollo: Agregar endpoint que elimine cookie en el backend
  }

  async logout(): Promise<IResponseHTTP<string>> {
    return await this.api.request({
      endpoint: "/logout",
      method: "DELETE",
    });
  }

  isAuthenticated() {
    // TODO-Desarrollo: Agregar endpoint que elimine cookie en el backend
  }

  async register(data: IPostUsuario): Promise<IResponseHTTP<string>> {
    return await this.api.request({
      endpoint: "/",
      method: "POST",
    });
  }
}
