import { useState, useEffect } from "react";

const TOKEN_KEY = "token";

export function useAuthToken() {
  const [JWTToken, setToken] = useState<string | null>(null);

  // Al inicar el hook se accede al localstorage
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Guardar token en estado y localStorage
  const saveJWTToken = (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  };

  // Eliminar token
  const clearJWTToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  return {
    JWTToken,
    saveJWTToken,
    clearJWTToken,
    isAuthenticated: !!JWTToken,
  };
}
