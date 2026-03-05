import { EncryptData } from "@/utils/EncryptData";
import APIClient from "./connection/APIClient";
import mapRolAFK from "@/utils/CatalogoTiposUsuario";
import IActualizarUsuario from "@/interfaces/usuarios/ActualizarUsuario";
import ICrearUsuario from "@/interfaces/usuarios/CrearUsuario";

export default class UsuarioService {
  private api: APIClient = new APIClient(import.meta.env.VITE_API_ACCESO_URL);

  constructor() {
    this.api = new APIClient(import.meta.env.VITE_API_ACCESO_URL);
  }

  async crearUsuario(userData: ICrearUsuario) {
    userData.contrasenia = await EncryptData.sha256(userData.contrasenia);
    userData.FKIdTipoAcceso = mapRolAFK({ idRol: userData.FKIdTipoAcceso });

    return await this.api.request({
      endpoint: "/",
      method: "POST",
      body: userData,
    });
  }

  async actualizarUsuario(userData: IActualizarUsuario) {
    userData.FKIdTipoAcceso = mapRolAFK({ idRol: userData.FKIdTipoAcceso });
    userData.estado = 1;

    if (userData.contrasenia && userData.contrasenia.trim() !== "") {
      userData.contrasenia = await EncryptData.sha256(userData.contrasenia);
    }

    return await this.api.request({
      endpoint: `/${userData.idAcceso}`,
      method: "PUT",
      body: userData,
    });
  }

  async obtenerUsuarios() {
    return await this.api.request({
      endpoint: "/usuarios",
      method: "GET",
    });
  }

  async desactivarUsuario(idAcceso: number) {
    return await this.api.request({
      endpoint: `/usuario/${idAcceso}`,
      method: "PUT",
    });
  }

  async obtenerAnalistas() {
    return await this.api.request({
      endpoint: "/analistas",
      method: "GET",
    });
  }
}
