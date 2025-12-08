import ClienteAPI from "./ClienteAPI.js";
import { EncriptacionContrasenia } from "../Auxiliares/EncriptacionContrasenia.js";

export default class AuthService {
  constructor() {    
    this.api = new ClienteAPI(import.meta.env.VITE_API_URL);
  }

  async login(usuario, contrasenia) {
    try {
        let contraseniaHasheada = await EncriptacionContrasenia.sha256(contrasenia);
        const data = await this.api.request("/acceso/login", "POST", {
            usuario,
            contrasenia: contraseniaHasheada
        });
        if (data.token) {
          localStorage.setItem("token", data.token);
        } 

        let mensaje = "Operación completada";
        if (data?.mensaje) {
          if (typeof data.mensaje === "string") {
            mensaje = data.mensaje;
          } else if (typeof data.mensaje === "object") {
            // Si el objeto tiene una propiedad "mensaje" interna, úsala
            if (typeof data.mensaje.mensaje === "string") {
              mensaje = data.mensaje.mensaje;
            } else {
              // Si no, convierte el objeto en texto legible
              mensaje = JSON.stringify(data.mensaje);
            }
          }
        }




        return {
          usuario: data.usuario || null,
          token: data.token || null,
          mensaje,
          error: !!data.error
        };
    } catch (err) {
        console.error("Error en la petición:", err);

        if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
          throw new Error("No se pudo conectar con el servidor. Verifica tu conexión o inténtalo más tarde.");
        }

        if (err.message) {
          throw new Error(err.message);
        } else {
          throw new Error("Error desconocido al iniciar sesión");
        }
    }
}


  logout() {
    localStorage.removeItem("token");
  }

  getToken() {
    return localStorage.getItem("token");
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}
