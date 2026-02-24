import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import "./CrearUsuario.css";
import Sidebar from "@/components/layout/sidebar/Sidebar.jsx";
import UsuarioServicio from "@/services/UsuarioService.js";
import { UserContext } from "@/utils/UserContext.jsx";

function CrearUsuario() {
  const { usuario } = useContext(UserContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const [formData, setFormData] = useState({
    usuario: "",
    nombres: "",
    primerApellido: "",
    segundoApellido: "",
    contrasena: "",
    rol: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const regexContrasena =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!regexContrasena.test(formData.contrasena)) {
      setMensaje({
        texto:
          "⚠️ La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula, un número y un carácter especial",
        tipo: "error",
      });

      setTimeout(() => {
        setMensaje("");
      }, 3000);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const usuarioServicio = new UsuarioServicio();
      const response = await usuarioServicio.crearUsuario(formData, token);
      console.log("Usuario creado:", response);

      setMensaje({ texto: "✅ Usuario creado correctamente", tipo: "exito" });
      setTimeout(() => {
        navigate("/usuarios");
      }, 1500);

      setFormData({
        usuario: "",
        nombres: "",
        primerApellido: "",
        segundoApellido: "",
        contrasena: "",
        rol: "",
      });
    } catch (error) {
      console.error("Error al crear usuario:", error.message);
      setMensaje({ texto: `❌ Error: ${error.message}`, tipo: "error" });

      setTimeout(() => {
        setMensaje("");
      }, 3000);
    }
  };

  return (
    <div className="crear-usuario-page">
      <Sidebar tipoAcceso={usuario.FKidTipoAcceso} />
      {/* Main Content */}
      <main className="main-content-evaluacion">
        {/*  Mensaje flotante */}
        {mensaje.texto && (
          <div className={`mensaje-flotante ${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        <h1 className="page-title3">Crear Usuarios</h1>

        <form className="form-grid" onSubmit={handleSubmit}>
          {/* Fila 1 */}
          <div className="form-group">
            <label className="form-label">Nombre(s)</label>
            <input
              type="text"
              className="form-input"
              value={formData.nombres}
              onChange={(e) => {
                handleInputChange("nombres", e.target.value);
                e.target.setCustomValidity("");
              }}
              onInvalid={(e) => {
                e.target.setCustomValidity("El nombre es obligatorio");
              }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Primer Apellido</label>
            <input
              type="text"
              className="form-input"
              value={formData.primerApellido}
              onChange={(e) => {
                handleInputChange("primerApellido", e.target.value);
                e.target.setCustomValidity("");
              }}
              onInvalid={(e) => {
                e.target.setCustomValidity("El primer apellido es obligatorio");
              }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Segundo Apellido</label>
            <input
              type="text"
              className="form-input"
              value={formData.segundoApellido}
              onChange={(e) =>
                handleInputChange("segundoApellido", e.target.value)
              }
            />
          </div>

          {/* Fila 2 */}
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <input
              type="text"
              className="form-input"
              value={formData.usuario}
              onChange={(e) => {
                handleInputChange("usuario", e.target.value);
                e.target.setCustomValidity("");
              }}
              onInvalid={(e) => {
                e.target.setCustomValidity(
                  "El nombre de usuario es obligatorio",
                );
              }}
              required
            />
          </div>

          {/* actualizar estilos a password-input-usuario*/}

          <div className="form-group password-group">
            <label className="form-label">Contraseña</label>
            <div className="password-input-container-usuario">
              <input
                type={showPassword ? "text" : "password"}
                className="form-input password-input-usuario"
                value={formData.contrasena}
                onChange={(e) => {
                  handleInputChange("contrasena", e.target.value);
                  e.target.setCustomValidity("");
                }}
                onInvalid={(e) => {
                  const regexContrasena =
                    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
                  if (!regexContrasena.test(formData.contrasena)) {
                    e.target.setCustomValidity(
                      "La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula, un número y un carácter especial",
                    );
                  } else {
                    e.target.setCustomValidity("La contraseña es obligatoria");
                  }
                }}
                required
              />
              <button
                type="button"
                className="password-toggle-usuario"
                onClick={togglePassword}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formData.contrasena &&
              !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(
                formData.contrasena,
              ) && (
                <span className="error">
                  La contraseña debe tener mínimo 8 caracteres, al menos una
                  mayúscula, un número y un carácter especial
                </span>
              )}
          </div>

          <div className="form-group">
            <label className="form-label">Rol</label>
            <select
              className="form-input rol-select"
              value={formData.rol}
              onChange={(e) => {
                handleInputChange("rol", e.target.value);
                e.target.setCustomValidity("");
              }}
              onInvalid={(e) => {
                e.target.setCustomValidity("Debe seleccionar un rol");
              }}
              required
            >
              <option value="" disabled>
                Seleccionar rol
              </option>
              <option value="admin">Administrador</option>
              <option value="user">Analista</option>
              <option value="supervisor">Gestor de solicitudes</option>
              <option value="direccion">Jefe de departamento</option>
            </select>
          </div>

          {/* Botón */}
          <div className="form-group action-buttons">
            <button type="submit" className="btn-crear-usuario">
              Crear Usuario
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default CrearUsuario;
