export interface IResultadoCedulaBase {
	psicometriaAnalisisProblemas: string;
	psicometriaComunicacion: string;
	psicometriaControlActividades: string;
	psicometriaDinamismo: string;
	psicometriaEnfoqueCalidad: string;
	psicometriaEnfoqueResultados: string;
	psicometriaInnovacion: string;
	psicometriaLiderazgo: string;
	psicometriaNegociacion: string;
	psicometriaOrientacionAlServicio: string;
	psicometriaPensamientoEstrategico: string;
	psicometriaPlaneacionOrganizacion: string;
	psicometriaRelacionesInterpersonales: string;
	psicometriaSensibilidadALineamientos: string;
	psicometriaTomaDecisiones: string;
	psicometriaTrabajoEnEquipo: string;
}

export type IPostResultadoCedula = IResultadoCedulaBase & {
	FKIdCedula: number;
	resultadoPorcentaje: number;
};

export type IGetResultadoCedula = IResultadoCedulaBase & {
	idResultado: number;
};

export interface IGetResultadosCedula {
	resultados: IGetResultadoCedula[];
}
