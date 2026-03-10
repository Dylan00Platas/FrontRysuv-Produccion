export default interface ISolicitudProceso {
  idProceso: number;
  nombreCandidato: string;
  citaVirtual: boolean;
  FKIdEstadoProcesoContratacion: number;
  fechaEntrevista: string;
  atendioCita: boolean;
}
