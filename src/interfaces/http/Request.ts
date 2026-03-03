export default interface IRequestHTTP {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS";
  token?: string;
  headers?: Record<string, string>;
  body?: any;
}
