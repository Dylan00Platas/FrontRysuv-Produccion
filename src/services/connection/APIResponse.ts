export default interface IAPIResponse<T = unknown> {
	estado: number;
	error: boolean;
	mensaje: T;
}
