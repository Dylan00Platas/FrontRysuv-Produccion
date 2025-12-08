export default class ClienteAPI {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, method = "GET", body = null, token = null) {
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
