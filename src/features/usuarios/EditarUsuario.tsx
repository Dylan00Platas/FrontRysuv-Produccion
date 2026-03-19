import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AccesoService from "@/services/AccesoService";
import { Toast } from "@/components/Alert/Floating/Toast";
import type IPutUsuario from "@/schemas/acceso/PutUser";
import "./CrearUsuario.css";
import { useToast } from "@/hooks/useToast";

function EditarUsuario() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast, mostrarToast } = useToast();
  const usuarioAEditar = location.state?.usuario || null;
  const [showPassword, setShowPassword] = useState(false);
  const usuarioServicio = new AccesoService();

  const [formData, setFormData] = useState<IPutUsuario>({
    usuario: usuarioAEditar?.usuario || "",
    nombre: usuarioAEditar?.nombre || "",
    primerApellido: usuarioAEditar?.primerApellido || "",
    segundoApellido: usuarioAEditar?.segundoApellido || "",
    rol: usuarioAEditar ? mapFKATipo(usuarioAEditar.FKIdTipoAcceso) : "",
    idAcceso: usuarioAEditar?.idAcceso,
    contrasenia: "",
  });

  function mapFKATipo(idTipoDeUsuario: number) {
    switch (idTipoDeUsuario) {
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

  const handleInputChange = (field: keyof IPutUsuario, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const regexContrasena =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (formData.contrasenia && !regexContrasena.test(formData.contrasenia)) {
      mostrarToast(
        "La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula, un número y un carácter especial",
        "error",
      );
      return;
    }
    try {
      const response = await usuarioServicio.putUsuario(
        formData.idAcceso,
        formData,
      );
      if (response.estado === 200) {
        mostrarToast("Usuario modificado correctamente", "exito");
        setTimeout(() => {
          navigate("/usuarios");
        }, 1500);
      }
    } catch (error) {
      console.error("EditarUsuario.tsx - Error al editar usuario: " + error);
      mostrarToast("Error al editar el usuario", "error");
    }
  };

  const handleDesactivarUsuario = async () => {
    try {
      const response = await usuarioServicio.putBanUsuario(formData.idAcceso);
      mostrarToast("Usuario desactivado de manera éxitosa", "exito");
      setTimeout(() => navigate("/usuarios"), 1500);
    } catch (error) {
      console.error("EditarUsuario.tsx - Error al desactivar usuario:", error);
      mostrarToast("Error al desactivar el usuario", "error");
    }
  };

  return (
    <>
      <Toast texto={toast.texto} tipo={toast.tipo} />
      <main className="main-content-evaluacion">
        <h1 className="page-title3">Editar Usuario</h1>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre(s)</label>
            <input
              type="text"
              className="form-input"
              value={formData.nombre}
              onChange={(e) => {
                handleInputChange("nombre", e.target.value);
                e.target.setCustomValidity("");
              }}
              onInvalid={(e: React.FormEvent<HTMLInputElement>) => {
                e.currentTarget.setCustomValidity("El nombre es obligatorio");
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
              onInvalid={(e: React.FormEvent<HTMLInputElement>) => {
                e.currentTarget.setCustomValidity(
                  "El primer apellido es obligatorio",
                );
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
              onInvalid={(e: React.FormEvent<HTMLInputElement>) => {
                e.currentTarget.setCustomValidity(
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
              onInvalid={(e: React.FormEvent<HTMLSelectElement>) => {
                e.currentTarget.setCustomValidity("Debe seleccionar un rol");
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
                value={formData.contrasenia}
                onChange={(e) =>
                  handleInputChange("contrasenia", e.target.value)
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
            {formData.contrasenia &&
              !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(
                formData.contrasenia,
              ) && (
                <span className="error">
                  La contraseña debe tener mínimo 8 caracteres, al menos una
                  mayúscula, un número y un carácter especial
                </span>
              )}
          </div>
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
    </>
  );
}

export default EditarUsuario;
