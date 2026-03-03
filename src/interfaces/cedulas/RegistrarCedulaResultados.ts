export default interface IRegistrarCedulaResultados {
  // Identificadores principales
  FKIdTipoCedula: number;
  FKIdProceso: number;
  FKIdClasificacionCedula: number;

  // Fechas
  fechaCedulaResultados: Date;

  // Información personal
  edad: number;
  educacionFormal: string;

  // Puesto y plaza
  puesto: string;
  plaza: string;
  oficioAutorizacionDeOcupacion: string;
  efectoContratacion: string;

  // Experiencia y evaluaciones
  experienciaRelacionada: string;
  evaluacionConocimientos: string;
  resultadoProcesoEvaluacion: string;

  // Competencias y descripciones
  descripcionReforzar: string;
  descripcionDesarrollar: string;
  competenciaDesarrollar: string;
  competenciaReforzar: string;
  competenciasSobresaliente: string;

  // Aprobaciones
  aprobadoJefeOficina: boolean;
  aprobadoDireccion: boolean;
}
