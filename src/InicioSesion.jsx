import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CatalogoDependencia from "./Auxiliares/CatalogoDependencia.js";
import "./InicioSesion.css";
import AuthService from "./Servicios/AuthService.js";

const authService = new AuthService();

function InicioSesion() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  const handleLogin = async () => {
    setError("");
    setMensaje("");

    try {
      const resultado = await authService.login(usuario, contrasenia);

      localStorage.removeItem("token");
      localStorage.removeItem("usuario");

      if (resultado.usuario) {
        localStorage.setItem("usuario", JSON.stringify(resultado.usuario));
      }

      if (resultado.token) {
        localStorage.setItem("token", resultado.token);
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
      } else if (err && typeof err === "object" && err.mensaje) {
        setError(err.mensaje);
      } else if (
        err instanceof Error &&
        err.message &&
        !err.message.includes("[object Object]")
      ) {
        setError(err.message);
      } else {
        setError("Las credenciales son inválidas");
      }
    }
  };

  return (
    <div className="inicio-sesion-page">
      <div className="login-container">
        <h2>RySUV</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <input
            type="text"
            name="username"
            autoComplete="username"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />

          <div className="password-input-container-login">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder="Contraseña"
              value={contrasenia}
              onChange={(e) => setContrasenia(e.target.value)}
              required
              className="password-input-login"
            />

            <button
              type="button"
              className="password-toggle-login"
              onClick={togglePassword}
              tabIndex={-1}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit">Entrar</button>
        </form>

        {mensaje && <div className="alerta exito">{mensaje}</div>}
        {error && <div className="alerta error">{error}</div>}

        <div className="copyright">
          © Dyma Team 2025
        </div>
      </div>
    </div>
  );
}

export default InicioSesion;
