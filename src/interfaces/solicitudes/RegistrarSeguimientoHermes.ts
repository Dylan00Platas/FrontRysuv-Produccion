export default interface IRegistrarSeguimientoHermes {
  // Identificadores
  folio: string;

  // Fechas
  fechaRecepcion: Date;

  // Atributos principales
  importancia: string;
  tipoEnvio: string;
  requiereRespuesta: boolean;
  solicita: string;
  entidadDependencia: string;
  asunto: string;

  // Estado y acciones
  estatus: string;
  acciones: string;
}
