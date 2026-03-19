import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCookie } from "@/hooks/useCookie";
import { Toast } from "@/components/Alert/Floating/Toast";
import { useToast } from "@/hooks/useToast";

export function Login() {
  const { toast, mostrarToast } = useToast();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const { login, isLoading } = useCookie();

  const handleLogin = async () => {
    try {
      await login({ usuario, contrasenia });
      mostrarToast("Sesión iniciada correctamente", "exito");
      navigate("/menu");
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : "Error interno del sistema";
      mostrarToast(mensaje, "error");
      console.error(err);
    }
  };

  return (
    <>
      <Toast texto={toast.texto} tipo={toast.tipo} />
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
              <label
                htmlFor="login-usuario"
                className="text-white/50 text-xs tracking-wider uppercase pl-1"
              >
                Usuario
              </label>
              <input
                id="login-usuario"
                type="text"
                name="username"
                autoComplete="username"
                placeholder="Ingresa tu usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                className="w-full p-2 text-stone-300 rounded-lg border-white outline-2 outline-cyan-600"
              />
            </div>

            {/* Campo contraseña */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="login-contrasena"
                className="text-white/50 text-xs tracking-wider uppercase pl-1"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="login-contrasena"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  value={contrasenia}
                  onChange={(e) => setContrasenia(e.target.value)}
                  required
                  className="w-full p-2 text-stone-300 rounded-lg border-white outline-2 outline-cyan-600"
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

          {/* Footer */}
          <p className="mt-7 text-[0.72rem] text-white/25 tracking-wider text-center">
            © Universidad Veracruzana 2025–2026
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
