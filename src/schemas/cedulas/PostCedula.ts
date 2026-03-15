import { IDependenciaFormCedula } from "../catalogos/GetDependencia";

export default interface IPostCedula {
  antecedentesFamiliaresUV: string;
  aprobadoDireccion: boolean;
  aprobadoJefeOficina: boolean;
  archivoAdjunto: boolean;
  competenciaDesarrollar: string;
  competenciaReforzar: string;
  competenciasSobresaliente: string;
  conclusiones: string;
  descripcionDesarrollar: string;
  descripcionReforzar: string;
  edad: string;
  educacionFormal: string;
  efectoContratacion: string;
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

export interface IPostCedulaInternaForm {
  // Verificar en back que dato y de que
  revisa: string;
  elabora: string;
  avaladoPor: string;
  adscripcion: IDependenciaFormCedula | null;
  //-----
  analista: string;
  antecedentesFamiliaresUV: string;
  conclusiones: string;
  edad: string;
  educacionFormal: string;
  evaluacionConocimientos: string;
  expectativaLaboral: string;
  experiencia: string;
  experienciaRelacionada: string;
  fechaElaboracionPropuesta: string;
  FKIdProceso: number;
  hermesNotificacion: string;
  idCedula: number;
  nombreCandidato: string;
  numPlaza: string;
  puesto: string;
  referidoPor: string;
  resultados: string;
  resultadoHabilidadesExcel: string;
  resultadoHabilidadesWord: string;
  resultadoOrtografia: string;
}
