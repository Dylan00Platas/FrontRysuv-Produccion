export default interface IRegistrarCedulaInterna {
  // Identificadores principales
  FKIdTipoCedula: number;
  FKIdProceso: number;
  FKIdClasificacionCedula: number;

  // Fechas
  fechaCedulaInterna: Date;

  // Información personal
  edad: number;
  educacionFormal: string;
  referidoPor: string;
  antecedentesFamiliaresUV: string;

  // Expectativas y experiencia
  expectativaLaboral: string;
  experienciaRelacionada: string;
  experiencia: string;

  // Resultados y conclusiones
  conclusiones: string;
  resultado: string;
  puesto: string;
}
