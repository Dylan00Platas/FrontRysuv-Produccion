import { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import "./CrearUsuario.css";
import Sidebar from "@/layout/sidebar/Sidebar.jsx";
import UsuarioServicio from "@/services/UsuarioService.js";
import UserContext from "@/utils/UserContext.jsx";

function EditarUsuario() {
  const navigate = useNavigate();
  const location = useLocation();
  const usuarioAEditar = location.state?.usuario || null;
  const currentUser = useContext(UserContext);

  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    usuario: usuarioAEditar?.usuario || "",
    nombres: usuarioAEditar?.nombre || "",
    primerApellido: usuarioAEditar?.primerApellido || "",
    segundoApellido: usuarioAEditar?.segundoApellido || "",
    rol: usuarioAEditar ? mapFKATipo(usuarioAEditar.FKIdTipoAcceso) : "",
    idAcceso: usuarioAEditar?.idAcceso,
    contrasena: "",
  });

  function mapFKATipo(fk) {
    switch (fk) {
      case 1:
        return "admin";
      case 2:
        return "user";
      case 3:
        return "supervisor";
      case 4:
        return "direccion";
      default:
        return "";
    }
  }

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
    if (formData.contrasena && !regexContrasena.test(formData.contrasena)) {
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
      const response = await usuarioServicio.actualizarUsuario(formData, token);
      console.log("Usuario actualizado:", response);
      setMensaje({
        texto: "✅ Usuario modificado correctamente",
        tipo: "exito",
      });
      setTimeout(() => {
        navigate("/usuarios");
      }, 1500);
    } catch (error) {
      console.error("Error al editar usuario:", error.message);
      setMensaje({ texto: `❌ Error: ${error.message}`, tipo: "error" });

      setTimeout(() => {
        setMensaje("");
      }, 3000);
    }
  };

  const handleDesactivarUsuario = async () => {
    try {
      const token = localStorage.getItem("token");
      const usuarioServicio = new UsuarioServicio();
      const response = await usuarioServicio.desactivarUsuario(
        formData.idAcceso,
        token,
      );
      console.log("Usuario desactivado:", response);
      setMensaje({
        texto: "🚫 Usuario desactivado correctamente",
        tipo: "exito",
      });
      setTimeout(() => navigate("/usuarios"), 1500);
    } catch (error) {
      console.error("Error al desactivar usuario:", error.message);
      setMensaje({ texto: `❌ Error: ${error.message}`, tipo: "error" });
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  return (
    <div className="crear-usuario-page">
      <Sidebar tipoAcceso={currentUser.FKidTipoAcceso} />

      <main className="main-content-evaluacion">
        {/*  Mensaje flotante */}
        {mensaje.texto && (
          <div className={`mensaje-flotante ${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}
        <h1 className="page-title3">Editar Usuario</h1>

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

          {/* ⭐ Campo de Contraseña Modificado */}
          <div className="form-group password-group">
            <label className="form-label">Nueva contraseña</label>
            <div className="password-input-container-usuario">
              <input
                type={showPassword ? "text" : "password"}
                className="form-input password-input-usuario"
                value={formData.contrasena}
                onChange={(e) =>
                  handleInputChange("contrasena", e.target.value)
                }
                placeholder="Opcional"
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
          {/* ⭐ Fin del Campo de Contraseña Modificado */}

          {/* Botón */}
          <div className="form-group action-buttons">
            <button type="submit" className="btn-crear-usuario">
              Editar usuario
            </button>
          </div>

          <div className="form-group action-buttons">
            <button
              type="button"
              className="btn-desactivar"
              onClick={handleDesactivarUsuario}
            >
              Desactivar usuario
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default EditarUsuario;
