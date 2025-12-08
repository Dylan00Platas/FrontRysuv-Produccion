import ClienteAPI from "../Servicios/ClienteAPI.js";

export default class CatalogoCedula {
    static cedulas = [];
    constructor() {
        this.api = new ClienteAPI(import.meta.env.VITE_API_URL);
    }

    async cargarCedulas(token){
        const response = await this.api.request("/catalogo/clasificacionesCedula", "GET", null, token);
        if(response.error){
            throw new Error("No se pudieron cargar las clasificaciones de cédulas");
        }
        CatalogoCedula.clasificacionesCedula = response.clasificacionesCedula;
        return CatalogoCedula.clasificacionesCedula;
    }

    static obtenerClasificacionesCedulas(){
        return CatalogoCedula.clasificacionesCedula;
    }    

    
}