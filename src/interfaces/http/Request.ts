export default interface IRequestHTTP {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS";
  withCredentials?: boolean;
  token?: string;
  headers?: Record<string, string>;
  body?: any;
}
