import IPostCedulaExterna from "@/schemas/cedulas-externas/PostCedulaExterna";
import APIClient from "./connection/APIClient";
import IResponseHTTP from "@/services/connection/APIResponse";
import {
	IGetCedula,
	IGetCedulas,
	IGetCedulasActivas,
} from "@/schemas/cedulas/GetCedula";
import { IGetCompetenciasClasificacionCedula } from "@/schemas/cedulas/GetCompetencia";
import { IGetCedulaExterna } from "@/schemas/cedulas-externas/GetCedulaExterna";
import IPostCedula from "@/schemas/cedulas/PostCedula";
import IPutCedula, { IPutCedulaIsArchivado } from "@/schemas/cedulas/PutCedula";
import IPostResultadoCedula from "@/schemas/cedulas/PostResultadoCedula";
import {
	IGetResultadosCedula,
	IResultadoCedulaBase,
} from "@/schemas/cedulas/ResultadoCedula";

export default class CedulaService {
	private api: APIClient = new APIClient(import.meta.env.VITE_API_CEDULA_URL);

	constructor() {
		this.api = new APIClient(import.meta.env.VITE_API_CEDULA_URL);
	}

	async postCedulaInterna(
		requestData: IPostCedula,
	): Promise<IResponseHTTP<string | number>> {
		return await this.api.request({
			endpoint: "/",
			method: "POST",
			body: requestData,
		});
	}

	async getCedulasInternas(): Promise<IResponseHTTP<IGetCedulas>> {
		return await this.api.request({
			endpoint: "/obtencionCedulas",
			method: "GET",
		});
	}

	async getCedulasInternasActivas(): Promise<
		IResponseHTTP<IGetCedulasActivas>
	> {
		return await this.api.request({
			endpoint: "/activas",
			method: "GET",
		});
	}

	async getCedulaInternaIdProceso(
		idProceso: number,
	): Promise<IResponseHTTP<IGetCedula>> {
		return await this.api.request({
			endpoint: `/busqueda/${idProceso}`,
			method: "GET",
		});
	}

	async archivarCedula(idCedula: number) {
		const data: IPutCedulaIsArchivado = {
			estado: true,
		};
		return await this.api.request({
			endpoint: `/${idCedula}`,
			method: "PUT",
			body: data,
		});
	}

	async putCedulaInterna(
		idCedula: number,
		data: IPutCedula,
	): Promise<IResponseHTTP<string>> {
		return await this.api.request({
			endpoint: `/${idCedula}`,
			method: "PUT",
			body: data,
		});
	}

	async getCompetenciasClasificacionCedula(
		FKIdClasificacionCedula: number,
	): Promise<IResponseHTTP<IGetCompetenciasClasificacionCedula>> {
		return await this.api.request({
			endpoint: `/competencia/${FKIdClasificacionCedula}`,
			method: "GET",
		});
	}

	async getResultadosIdProceso(
		idProceso: number,
	): Promise<IResponseHTTP<IGetCompetenciasClasificacionCedula>> {
		return await this.api.request({
			endpoint: `/competencia-resultados/${idProceso}`,
			method: "GET",
		});
	}

	async getResultadoCedulaInterna(
		FKIdCedula: number,
	): Promise<IResponseHTTP<IGetResultadosCedula>> {
		return await this.api.request({
			endpoint: `/resultado`,
			method: "GET",
		});
	}

	async putResultadoCedulaInterna(
		idResultado: number,
		data: IResultadoCedulaBase,
	): Promise<IResponseHTTP<string>> {
		return await this.api.request({
			endpoint: `/resultado/${idResultado}`,
			method: "POST",
			body: data,
		});
	}

	async postResultadoCedulaInterna(
		data: IPostResultadoCedula,
	): Promise<IResponseHTTP<string>> {
		return await this.api.request({
			endpoint: `/resultado`,
			method: "POST",
			body: data,
		});
	}

	// Cédulas externas -------------------------------------------------------------------
	async postResultadoCedulaExterna(
		data: IPostCedulaExterna,
	): Promise<IResponseHTTP<string>> {
		return await this.api.request({
			endpoint: `/externa`,
			method: "POST",
			body: data,
		});
	}

	async getCedulaExterna(
		FKIdCedula: number,
	): Promise<IResponseHTTP<IGetCedulaExterna>> {
		return await this.api.request({
			endpoint: `/externa/${FKIdCedula}`,
			method: "GET",
		});
	}
}
