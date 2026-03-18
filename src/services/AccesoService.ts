import {
  IGetUsuario,
  IGetUsuarios,
  IUsuarioBase,
} from "@/schemas/acceso/GetUsuario";
import type IPutUsuario from "@/schemas/acceso/PutUser";
import APIClient from "./connection/APIClient";
import IResponseHTTP from "@/interfaces/http/Response";
import { IGetTiposAccesoUsuario } from "@/schemas/acceso/GetTipoAccesoUsuario";

export default class AccesoService {
  private api: APIClient = new APIClient(import.meta.env.VITE_API_ACCESO_URL);

  constructor() {
    this.api = new APIClient(import.meta.env.VITE_API_ACCESO_URL);
  }

  async getUsuarios(): Promise<IResponseHTTP<IGetUsuarios>> {
    return await this.api.request({
      endpoint: "/usuarios",
      method: "GET",
    });
  }

  async getTiposAcceso(): Promise<IResponseHTTP<IGetTiposAccesoUsuario>> {
    return await this.api.request({
      endpoint: "/tiposAcceso",
      method: "GET",
    });
  }

  async getAnalistas(): Promise<IResponseHTTP<IGetUsuarios>> {
    return await this.api.request({
      endpoint: "/analistas",
      method: "GET",
    });
  }

  async getUsuarioByNombreUsuario(
    username: string,
  ): Promise<IResponseHTTP<IGetUsuario>> {
    return await this.api.request({
      endpoint: `/usuario/${username}`,
      method: "GET",
    });
  }

  async putBanUsuario(idUser: number): Promise<IResponseHTTP<string>> {
    return await this.api.request({
      endpoint: `/usuario/${idUser}`,
      method: "PUT",
    });
  }

  async getUsuarioById(userId: number): Promise<IResponseHTTP<IGetUsuario>> {
    return await this.api.request({
      endpoint: `/${userId}`,
      method: "GET",
    });
  }

  async putUsuario(
    idAcceso: number,
    data: IPutUsuario,
  ): Promise<IResponseHTTP<string>> {
    return await this.api.request({
      endpoint: `/usuario/${idAcceso}`,
      method: "PUT",
    });
  }
}
