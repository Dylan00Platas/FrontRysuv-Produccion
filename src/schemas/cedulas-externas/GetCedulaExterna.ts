export interface ICedulaExternaBase {
  idDocumento: number;
  FKIdCedula: number;
  nombre: string;
  fechaSubida: string;
  archivo: string;
}

export interface IGetCedulaExterna {
  documento: ICedulaExternaBase;
}
