import ICurrentUser from "@/interfaces/auth/CurrentUser";
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
  login: (correo: string, contrasenia: string) => Promise<void>;
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
      const res = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        credentials: "include", // ← envía la cookie httpOnly automáticamente
      });

      if (res.ok) {
        const data: ICurrentUser = await res.json();
        setUser(data);
      } else {
        // 401 / 403 → sin sesión válida, no es un error de red
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

  // ── Login ──────────────────────────────────────────────────────────────────

  const login = useCallback(async (correo: string, contrasenia: string) => {
    setIsLoading(true);
    setError(null);

    const API_URL = import.meta.env.VITE_API_ACCESO_URL;

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "include", // ← necesario para que el navegador
        headers: { "Content-Type": "application/json" }, //  guarde la cookie
        body: JSON.stringify({ correo, contrasenia }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? "Credenciales incorrectas.");
      }

      // El backend ya estableció la cookie; pedimos los datos del usuario
      const data: ICurrentUser = await res.json();
      setUser(data);
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
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // ← el backend borrará la cookie
      });
    } catch {
      // Aunque falle la red, limpiamos el estado local
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  return { user, isLoading, error, login, logout, checkSession };
}
