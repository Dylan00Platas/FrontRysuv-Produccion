import { EncryptData } from "@/utils/EncryptData.js";
import APIClient from "./connection/APIClient";
import IResponseHTTP from "@/services/connection/APIResponse";
import ILogin from "@/schemas/acceso/PostLogin";
import IPostUsuario from "@/schemas/acceso/PostUser";
import IGetSesion from "@/schemas/acceso/GetSesion";

export default class AuthService {
	private api: APIClient;

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

	async session(): Promise<IResponseHTTP<IGetSesion>> {
		return await this.api.request({
			endpoint: "/sesion",
			method: "GET",
		});
	}

	async logout(): Promise<IResponseHTTP<string>> {
		return await this.api.request({
			endpoint: "/logout",
			method: "DELETE",
		});
	}

	async register(data: IPostUsuario): Promise<IResponseHTTP<string>> {
		return await this.api.request({
			endpoint: "/",
			method: "POST",
			body: data,
		});
	}
}
