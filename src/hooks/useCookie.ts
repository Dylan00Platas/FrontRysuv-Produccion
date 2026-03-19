import IResponseHTTP from "@/interfaces/http/Response";
import IGetSesion from "@/schemas/acceso/GetSesion";
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
type ICurrentUser = IGetSesion;
const authService = new AuthService();
export function useCookie() {
  const [currentUser, setCurrentUser] = useState<ICurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar sesión activa (al montar o recargar) -------------------------------

  const checkSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const API_URL = import.meta.env.VITE_API_ACCESO_URL;
    try {
      const response: IResponseHTTP<ICurrentUser> =
        await new AuthService().session();

      if (response.error == false) {
        setCurrentUser(response.mensaje);
      } else {
        // 401 / 403
        setCurrentUser(null);
      }
    } catch {
      setError("Error de conexión al verificar la sesión.");
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const login = useCallback(async (loginData: ILogin) => {
    setIsLoading(true);
    setError(null);

    const API_URL = import.meta.env.VITE_API_ACCESO_URL;

    try {
      const response: IResponseHTTP<string> = await new AuthService().login(
        loginData,
      );

      if (response.estado >= 500) {
        throw new Error("Error interno del servidor.");
      } else if (response.estado === 401) {
        throw new Error("Sesión expirada.");
      } else if (response.estado >= 400) {
        throw new Error("Datos incorrectos del cliente.");
      }
      const responseData: IResponseHTTP<ICurrentUser> =
        await new AuthService().session();
      if (responseData.mensaje) {
        setCurrentUser(responseData.mensaje);
      }
    } catch (err) {
      console.error(
        `useCookie.ts - Error al obtener cookie de usuario \n ${err}`,
      );
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout --------------------------------------------------------------------

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const API_URL = import.meta.env.VITE_API_ACCESO_URL;
    try {
      await new AuthService().logout();
    } catch {
      // Aunque falle la red, se limpia estado local
    } finally {
      setCurrentUser(null);
      setIsLoading(false);
    }
  }, []);

  return { currentUser, isLoading, error, login, logout, checkSession };
}
