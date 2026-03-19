export default interface IPostResultadoCedula {
  FKIdCedula: number;
  psicometriaAnalisisProblemas: number;
  psicometriaComunicacion: number;
  psicometriaControlActividades: number;
  psicometriaDinamismo: number;
  psicometriaEnfoqueCalidad: number;
  psicometriaEnfoqueResultados: number;
  psicometriaInnovacion: number;
  psicometriaLiderazgo: number;
  psicometriaNegociacion: number;
  psicometriaOrientacionAlServicio: number;
  psicometriaPensamientoEstrategico: number;
  psicometriaPlaneacionOrganizacion: number;
  psicometriaRelacionesInterpersonales: number;
  psicometriaSensibilidadALineamientos: number;
  psicometriaTomaDecisiones: number;
  psicometriaTrabajoEnEquipo: number;
  resultadoPorcentaje: number;
}

export interface ICedulaResultados {
  aprobadoDireccion: boolean;
  aprobadoJefeOficina: boolean;
  competenciaDesarrollar: string;
  competenciaReforzar: string;
  competenciasSobresaliente: string;
  descripcionDesarrollar: string;
  descripcionReforzar: string;
  edad: string;
  efectoContratacion: string;
  educacionFormal: string;
  evaluacionConocimientos: string;
  experienciaRelacionada: string;
  FKIdProceso: number | string;
  FKIdTipoCedula: number;
  fechaCedulaResultados: string;
  oficioAutorizacionDeOcupacion: string;
  plaza: string;
  puesto: string;
  resultadoProcesoEvaluacion: string;
}
