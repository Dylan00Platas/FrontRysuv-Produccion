import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { InputField } from "@/components/InputField/InputField";
import { AlertBanner } from "@/components/Alert/OnBody/AlertBanner";
import CatalogoDependencia from "@/utils/CatalogoDependencia";
import AuthService from "@/services/AuthService";
import ILogin from "@/interfaces/auth/Login";
import { EncryptData } from "@/utils/EncryptData";
import { useAuthToken } from "@/hooks/useAuthToken";
import { useUser } from "@/hooks/useUser";

const authService = new AuthService();

export function Login() {
  const [usuario, setUsuario] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { JWTToken, saveJWTToken, clearJWTToken, isAuthenticated } =
    useAuthToken();
  const { currentUsername, saveCurrentUsername, clearCurrentUsername } =
    useUser();

  const handleLogin = async () => {
    setError("");
    setMensaje("");
    setIsLoading(true);

    try {
      const data: ILogin = {
        usuario,
        contrasenia,
      };
      const resultado = await authService.login(data);

      clearJWTToken();
      clearCurrentUsername();

      if (resultado.usuario) {
        saveCurrentUsername(JSON.stringify(resultado.usuario));
      }

      if (resultado.token) {
        saveJWTToken(resultado.token);
        setMensaje(resultado.mensaje);

        const catalogoDependencia = new CatalogoDependencia();
        await catalogoDependencia.cargarDependencias(resultado.token);

        navigate("/menu");
        window.location.reload();
      } else {
        setError("Las credenciales son inválidas");
      }
    } catch (err) {
      if (
        err instanceof TypeError &&
        (err.message.includes("NetworkError") ||
          err.message.includes("Failed to fetch"))
      ) {
        setError("Error de conexión: El servidor no está disponible.");
      } else if (err && typeof err === "object" && "mensaje" in err) {
        setError((err as { mensaje: string }).mensaje);
      } else if (
        err instanceof Error &&
        !err.message.includes("[object Object]")
      ) {
        setError(err.message);
      } else {
        setError("Las credenciales son inválidas");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[linear-gradient(135deg,#191947,#0e27b8,#0466d6,#051d38)] [bg-size:300%_300%] animate-[gradientMove_13s_ease_infinite] relative overflow-hidden">
      {/* Orbes decorativos de fondo */}
      <div className="absolute top-[-10%] left-[-5%] w-72 h-72 rounded-full bg-[#0e27b8]/30 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full bg-[#0466d6]/20 blur-[100px] pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 flex flex-col items-center w-85 px-9 py-10 rounded-2xl border border-white/10 bg-white/[0.07] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-[fadeInUp_0.8s_ease]">
        {/* Logo / Título */}
        <div className="flex flex-col items-center mb-8">
          <h2 className='font-["Kulim_Park"] text-3xl font-thin text-white tracking-widest'>
            RySUV
          </h2>
          <p className="text-white/35 text-xs tracking-[0.2em] mt-1 uppercase">
            Universidad Veracruzana
          </p>
        </div>

        {/* Formulario */}
        <form
          className="flex flex-col w-full gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          {/* Campo usuario */}
          <div className="flex flex-col gap-1">
            <label className="text-white/50 text-xs tracking-wider uppercase pl-1">
              Usuario
            </label>
            <InputField
              type="text"
              name="username"
              autoComplete="username"
              placeholder="Ingresa tu usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>

          {/* Campo contraseña */}
          <div className="flex flex-col gap-1">
            <label className="text-white/50 text-xs tracking-wider uppercase pl-1">
              Contraseña
            </label>
            <div className="relative">
              <InputField
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Ingresa tu contraseña"
                value={contrasenia}
                onChange={(e) => setContrasenia(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Botón submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="
              mt-2 w-full py-3 rounded-lg text-sm font-semibold text-white
              bg-[#167e2b] hover:bg-[#1a9432]
              border border-[#199532]/40
              shadow-[0_4px_20px_rgba(25,149,50,0.25)]
              hover:shadow-[0_4px_28px_rgba(25,149,50,0.45)]
              hover:-translate-y-
              disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0
              transition-all duration-200
            "
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="white"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="white"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Verificando...
              </span>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        {/* Alertas */}
        {mensaje && <AlertBanner type="success" message={mensaje} />}
        {error && <AlertBanner type="error" message={error} />}

        {/* Footer */}
        <p className="mt-7 text-[0.72rem] text-white/25 tracking-wider text-center">
          © Universidad Veracruzana 2025–2026
        </p>
      </div>
    </div>
  );
}

export default Login;
