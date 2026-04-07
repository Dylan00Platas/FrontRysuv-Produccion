export default interface IAPIRequest {
	endpoint: string;
	method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";
	withCredentials?: boolean;
	token?: string;
	headers?: Record<string, string>;
	body?: any;
}
