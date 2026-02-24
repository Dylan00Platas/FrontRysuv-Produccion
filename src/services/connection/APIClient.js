export default class APIClient {
  constructor() {
    this.API_URL = import.meta.env.VITE_API_URL;
  }

  async request(endpoint, method = "GET", token = null, body = null) {
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.API_URL}${endpoint}`, options);

    if (!response.ok) {
      let errorText;
      try {
        // Intentar parsear como JSON
        const errorData = await response.json();
        errorText =
          errorData.mensaje ||
          errorData.error ||
          JSON.stringify(errorData, null, 2);
      } catch {
        // Si no es JSON, usar texto plano
        errorText = await response.text();
      }

      console.error("❌ Error del servidor:", errorText);
      throw new Error(errorText || `Error HTTP ${response.status}`);
    }

    return response.json();
  }
}
