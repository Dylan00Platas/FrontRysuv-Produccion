import { useState, useEffect } from "react";

const TOKEN_KEY = "token";

export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);

  // Al inicar el hook se accede al localstorage
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Guardar token en estado y localStorage
  const saveToken = (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  };

  // Eliminar token
  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  return {
    token,
    saveToken,
    clearToken,
    isAuthenticated: !!token,
  };
}
