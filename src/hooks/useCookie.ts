import IResponseHTTP from "@/interfaces/http/Response";
import AuthService from "@/services/AuthService";
import { useCallback, useEffect, useState } from "react";

/**
 * useCookie
 *
 * Gestiona la autenticación basada en cookies httpOnly generadas por el backend.
 *
 *     La cookie `access_token` es httpOnly → el navegador NUNCA puede leerla
 *     con document.cookie. Este hook se comunica con el backend para saber si
 *     la sesión es válida y obtener los datos del usuario.
 *
 * El backend implementa:
 *   POST /auth/login    → establece la cookie
 *   POST /auth/logout   → elimina la cookie
 *   GET  /auth/session       → devuelve CookieUser si el token es válido
 */

interface ILogin {
  usuario: string;
  contrasenia: string;
}
interface ICurrentUser {
  tipoDeAcceso: number;
  usuario: string;
  idAcceso: number;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
}
export function useCookie() {
  const [currentUser, setCurrentUser] = useState<ICurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // sesión global
  const [isLoadingLogin, setIsLoadingLogin] = useState(false); // solo en el form login
  const [error, setError] = useState<string | null>(null);

  // Login ---------------------------------------------------------------------
  const login = useCallback(async (loginData: ILogin) => {
    setIsLoadingLogin(true);
    setError(null);
    setCurrentUser(null);

    try {
      const responseLogin: IResponseHTTP<string> =
        await new AuthService().login(loginData);

      if (responseLogin.estado >= 500) {
        throw new Error("Error interno del servidor.");
      } else if (responseLogin.estado === 401) {
        throw new Error("Sesión expirada.");
      } else if (responseLogin.estado >= 400) {
        throw new Error("Datos incorrectos del cliente.");
      }

      await checkSession();
    } catch (err) {
      console.error(
        `useCookie.ts - Error al obtener cookie de usuario \n ${err}`,
      );
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
      setCurrentUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verificar sesión activa (al montar o recargar) -------------------------------
  const checkSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: IResponseHTTP<ICurrentUser> =
        await new AuthService().session();
      setCurrentUser(response.error === false ? response.mensaje : null);
    } catch {
      setError("Error de conexión al verificar la sesión.");
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Logout --------------------------------------------------------------------
  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await new AuthService().logout();
    } catch {
      // Aunque falle la red, se limpia estado local
    } finally {
      setCurrentUser(null);
      setIsLoading(false);
    }
  }, []);

  return {
    currentUser,
    isLoading,
    isLoadingLogin,
    error,
    login,
    logout,
    checkSession,
  };
}
