import { EncriptacionContrasenia } from '../Auxiliares/EncriptacionContrasenia.js';
import ClienteAPI from './ClienteAPI.js';

export default class UsuarioServicio {
  constructor() {
    this.api = new ClienteAPI(import.meta.env.VITE_API_URL);
  }

  async crearUsuario(formData, token) {    
    const datos = {
      usuario: formData.usuario,
      contrasenia: await EncriptacionContrasenia.sha256(formData.contrasena),
      FKIdTipoAcceso: this.mapRolAFK(formData.rol),
      nombre: formData.nombres,
      primerApellido: formData.primerApellido,      
    };

    if (formData.segundoApellido.trim()) {
        datos.segundoApellido = formData.segundoApellido;
    }

    return await this.api.request("/acceso", "POST", datos, token);
  }

  async actualizarUsuario(formData,token){
    const datos = {
      usuario: formData.usuario,      
      FKIdTipoAcceso: this.mapRolAFK(formData.rol),
      nombre: formData.nombres,
      primerApellido: formData.primerApellido,      
      estado: 1,
    };
    if (formData.contrasena && formData.contrasena.trim() !== "") {
      datos.contrasenia = await EncriptacionContrasenia.sha256(formData.contrasena);
    }

    if (formData.segundoApellido.trim()) {
        datos.segundoApellido = formData.segundoApellido;
    }    

    console.log("Datos a enviar:", datos);
    console.log("URL:", `/acceso/${formData.idAcceso}`);
    console.log("Token:", token);


    return await this.api.request(`/acceso/${formData.idAcceso}`, "PUT", datos, token);
  }

  async obtenerUsuarios(token){
    try {
      const response = await this.api.request("/acceso/usuarios", "GET",null,token);
      if (!response || response.error) {
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
        `/acceso/usuario/${idAcceso}`, 
        "PUT", 
        { },  
        token
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
    const response = await this.api.request("/acceso/analistas", "GET", null, token);
    if (!response || response.error) {
      throw new Error(response?.mensaje || "Error al obtener analistas");
    }
    return response.usuarios; 
  } catch (err) {
    console.error("Error en obtenerAnalistas:", err);
    throw err;
  }
}


  mapRolAFK(rol) {
    switch(rol) {
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
