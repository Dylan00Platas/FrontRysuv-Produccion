export default interface IPostCedula {
  adscripcion: { idDependencia: number; nombre: string; zona: string } | null;
  analista: string;
  antecedentesFamiliaresUV: string;
  aprobadoDireccion: boolean;
  aprobadoJefeOficina: boolean;
  archivoAdjunto: boolean;
  avaladoPor: string;
  competenciaDesarrollar: string;
  competenciaReforzar: string;
  competenciasSobresaliente: string;
  conclusiones: string;
  descripcionDesarrollar: string;
  descripcionReforzar: string;
  edad: string;
  educacionFormal: string;
  efectoContratacion: string;
  elabora: string;
  evaluacionConocimientos: string;
  expectativaLaboral: string;
  experiencia: string;
  experienciaRelacionada: string;
  fechaElaboracionPropuesta: string;
  FKIdClasificacionCedula: number;
  FKIdProceso: number;
  FKIdResultado: number|null;
  FKIdTipoCedula: number;
  fechaCedulaInterna: string;
  fechaCedulaResultados: string;
  hermesNotificacion: string;
  idCedula: number;
  nombreCandidato: string;
  numPlaza: string;
  motivoCedulaInterna: string;
  motivoCedulaResultados: string;
  oficioAutorizacionDeOcupacion: string;
  plaza: string;
  puesto: string;
  referidoPor: string;
  resultadoHabilidadesExcel: string;
  resultadoHabilidadesWord: string;
  resultadoOrtografia: string;
  resultados: string;
  revisa: string;
}

export interface IPostCedulaInternaForm {
  // Verificar en back que dato y de que
  revisa: string;
  elabora: string;
  avaladoPor: string;
  adscripcion: { idDependencia: number; nombre: string; zona: string } | null;
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
