export default interface IPutCedula {
  antecedentesFamiliaresUV: string;
  competenciaDesarrollar: string;
  competenciaReforzar: string;
  competenciasSobresaliente: string;
  conclusiones: string;
  descripcionDesarrollar: string;
  descripcionReforzar: string;
  edad: string;
  educacionFormal: string;
  efectoContratacion: string;
  estado: boolean;
  evaluacionConocimientos: string;
  expectativaLaboral: string;
  experiencia: string;
  experienciaRelacionada: string;
  FKIdClasificacionCedula: number;
  FKIdProceso: number;
  FKIdResultado: number;
  FKIdTipoCedula: number;
  fechaCedulaInterna: string;
  fechaCedulaResultados: string;
  motivoCedulaInterna: string;
  motivoCedulaResultados: string;
  oficioAutorizacionDeOcupacion: string;
  plaza: string;
  puesto: string;
  referidoPor: string;
  resultado: string;
}

export type IPutCedulaPartial = Partial<IPutCedula>;
