import IRequestHTTP from "@/interfaces/http/Request";
import { APIError } from "./APIError";

export default class APIClient {
  constructor(
    public baseUrl: string,
    private defaultWithCredentials = true,
  ) {}

  async request<T = unknown>(request: IRequestHTTP): Promise<T> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(request.headers || {}),
      };

      if (request.token) {
        headers["Authorization"] = `Bearer ${request.token}`;
      }

      const options: RequestInit = {
        method: request.method,
        headers,
      };

      if (request.body) {
        options.body = JSON.stringify(request.body);
      }

      // credentials: true por default
      if (request.withCredentials ?? this.defaultWithCredentials) {
        options.credentials = "include";
      }

      const response = await fetch(
        `${this.baseUrl}${request.endpoint}`,
        options,
      );

      const rawText = await response.text();
      let data: unknown;

      try {
        data = JSON.parse(rawText);
      } catch {
        data = rawText;
      }

      if (!response.ok) {
        throw new APIError(
          (data as any)?.mensaje ||
            (data as any)?.error ||
            "Error en la solicitud",
          response.status,
          data,
        );
      }

      return data as T;
    } catch (error) {
      // Error de red
      if (error instanceof APIError) throw error;

      throw new APIError("Error de conexión con el servidor", 0, error);
    }
  }
}
