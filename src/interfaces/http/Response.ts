export default interface IResponseHTTP<T = unknown> {
  estado: number;
  error: boolean;
  mensaje: T;
}
