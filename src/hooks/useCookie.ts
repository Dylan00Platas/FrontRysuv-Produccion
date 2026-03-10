import ICurrentUser from "@/interfaces/auth/CurrentUser";
import ILogin from "@/interfaces/auth/Login";
import IResponseHTTP from "@/interfaces/http/Response";
import AuthService from "@/services/AuthService";
import { useCallback, useEffect, useState } from "react";

export interface UseCookieReturn {
  /** Datos del usuario obtenidos del backend (null si no hay sesión). */
  user: ICurrentUser | null;
  isLoading: boolean;
  error: string | null;
  /**
   * Llama al endpoint de login.
   * El backend establece la cookie httpOnly.
   * No necesitas manejar el token manualmente.
   */
  login: (data: ILogin) => Promise<void>;
  /**
   * Llama al endpoint de logout.
   * El backend elimina la cookie httpOnly.
   */
  logout: () => Promise<void>;
  /**
   * Verifica con el backend si existe una sesión activa.
   * Útil para restaurar el estado al recargar la página.
   */
  checkSession: () => Promise<void>;
}
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
 *   GET  /auth/me       → devuelve CookieUser si el token es válido
 */
export function useCookie(): UseCookieReturn {
  const [user, setUser] = useState<ICurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Verificar sesión activa (al montar o recargar) ─────────────────────────

  const checkSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const API_URL = import.meta.env.VITE_API_ACCESO_URL;
    try {
      const response: IResponseHTTP<ICurrentUser> =
        await new AuthService().me();

      if (response.error == false) {
        const data: ICurrentUser = await response.mensaje;
        setUser(data);
      } else {
        // 401 / 403
        setUser(null);
      }
    } catch {
      setError("Error de conexión al verificar la sesión.");
      setUser(null);
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
        await new AuthService().me();
      if (responseData.mensaje) {
        setUser(responseData.mensaje);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const API_URL = import.meta.env.VITE_API_ACCESO_URL;
    try {
      await new AuthService().logout();
    } catch {
      // Aunque falle la red, se limpia estado local
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  return { user, isLoading, error, login, logout, checkSession };
}
