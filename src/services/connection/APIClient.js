export default class APIClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
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

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText); // Intentar parsear como JSON
    } catch {
      data = rawText; // Si falla, usar el texto plano
    }

    if (!response.ok) {
      const errorText =
        (typeof data === "object" && data?.mensaje) ||
        (typeof data === "object" && data?.error) ||
        (typeof data === "string" ? data : JSON.stringify(data));

      console.error("Error del servidor:", errorText);
      throw new Error(errorText || `Error HTTP ${response.status}`);
    }

    return data;
  }
}
