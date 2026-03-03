import { EncryptData } from "@/utils/EncryptData.js";
import APIClient from "./connection/APIClient.js";
import ICrearUsuario from "@/interfaces/usuarios/CrearUsuario.js";
import IActualizarUsuario from "@/interfaces/usuarios/ActualizarUsuario.js";
import mapRolAFK from "@/utils/CatalogoTiposUsuario.js";

export default class UsuarioService {
  private api: APIClient = new APIClient(import.meta.env.VITE_API_ACCESO_URL);

  constructor() {
    this.api = new APIClient(import.meta.env.VITE_API_ACCESO_URL);
  }

  async crearUsuario(token: string, userData: ICrearUsuario) {
    userData.contrasenia = await EncryptData.sha256(userData.contrasenia);
    userData.FKIdTipoAcceso = mapRolAFK({ idRol: userData.FKIdTipoAcceso });

    return await this.api.request({
      endpoint: "/",
      method: "POST",
      token,
      body: userData,
    });
  }

  async actualizarUsuario(token: string, userData: IActualizarUsuario) {
    userData.FKIdTipoAcceso = mapRolAFK({ idRol: userData.FKIdTipoAcceso });
    userData.estado = 1;

    if (userData.contrasenia && userData.contrasenia.trim() !== "") {
      userData.contrasenia = await EncryptData.sha256(userData.contrasenia);
    }

    return await this.api.request({
      endpoint: `/${userData.idAcceso}`,
      method: "PUT",
      token,
      body: userData,
    });
  }

  async obtenerUsuarios(token: string) {
    return await this.api.request({
      endpoint: "/usuarios",
      method: "GET",
      token,
    });
  }

  async desactivarUsuario(token: string, idAcceso: number) {
    return await this.api.request({
      endpoint: `/usuario/${idAcceso}`,
      method: "PUT",
      token,
    });
  }

  async obtenerAnalistas(token: string) {
    return await this.api.request({
      endpoint: "/analistas",
      method: "GET",
      token,
    });
  }
}
