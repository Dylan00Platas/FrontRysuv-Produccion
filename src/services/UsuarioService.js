import { EncryptData } from "@/utils/EncryptData.js";
import APIClient from "./connection/APIClient.js";

export default class UsuarioService {
  constructor() {
    this.api = new APIClient(import.meta.env.VITE_API_ACCESO_URL);
  }

  async crearUsuario(formData, token) {
    const datos = {
      usuario: formData.usuario,
      contrasenia: await EncryptData.sha256(formData.contrasena),
      FKIdTipoAcceso: this.mapRolAFK(formData.rol),
      nombre: formData.nombres,
      primerApellido: formData.primerApellido,
    };

    if (formData.segundoApellido.trim()) {
      datos.segundoApellido = formData.segundoApellido;
    }

    return await this.api.request("/", "POST", token, datos);
  }

  async actualizarUsuario(formData, token) {
    const datos = {
      usuario: formData.usuario,
      FKIdTipoAcceso: this.mapRolAFK(formData.rol),
      nombre: formData.nombres,
      primerApellido: formData.primerApellido,
      estado: 1,
    };
    if (formData.contrasena && formData.contrasena.trim() !== "") {
      datos.contrasenia = await EncryptData.sha256(formData.contrasena);
    }

    if (formData.segundoApellido.trim()) {
      datos.segundoApellido = formData.segundoApellido;
    }

    console.log("Datos a enviar:", datos);
    console.log("URL:", `/${formData.idAcceso}`);
    console.log("Token:", token);

    return await this.api.request(`/${formData.idAcceso}`, "PUT", token, datos);
  }

  async obtenerUsuarios(token) {
    try {
      const response = await this.api.request("/usuarios", "GET", token, null);
      if (!response || response.error) {
        console.error(
          "Error en obtenerUsuarios:",
          response?.mensaje || "Error desconocido",
        );
        throw new Error(response?.mensaje || "Error al obtener usuarios");
      }
      return response.usuarios;
    } catch (err) {
      console.error("Error en obtenerUsuarios:", err);
      throw err;
    }
  }

  async desactivarUsuario(idAcceso, token) {
    try {
      const response = await this.api.request(
        `/usuario/${idAcceso}`,
        "PUT",
        token,
        {},
      );

      if (!response || response.error) {
        throw new Error(response?.mensaje || "Error al desactivar usuario");
      }

      return response.mensaje || "Usuario desactivado correctamente";
    } catch (err) {
      console.error("Error en desactivarUsuario:", err);
      throw err;
    }
  }

  async obtenerAnalistas(token) {
    try {
      const response = await this.api.request("/analistas", "GET", token, null);
      if (!response || response.error) {
        throw new Error(response?.mensaje || "Error al obtener analistas");
      }
      return response.usuarios;
    } catch (err) {
      console.error("Error en obtenerAnalistas:", err);
      throw err;
    }
  }

  // TODO-Desarrollo: Mapear roles a FKIdTipoAcceso de forma dinámica (ej. obteniendo los tipos de acceso desde el backend)
  mapRolAFK(rol) {
    switch (rol) {
      case "admin":
        return 1;
      case "user":
        return 2;
      case "supervisor":
        return 3;
      case "direccion":
        return 4;
      default:
        return 2;
    }
  }
}
