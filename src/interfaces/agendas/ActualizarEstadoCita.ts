export interface IActualizarEstadoCita {
  idEventoSeleccionado: string | number;
  fechaEntrevista: string;
  estado: number;
  citaVirtual: boolean;
  atendioCita: boolean;
}
