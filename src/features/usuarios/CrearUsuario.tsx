import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./CrearUsuario.css";
import { useToast } from "@/hooks/useToast";
import AuthService from "@/services/AuthService";
import type IPostUsuario from "@/schemas/acceso/PostUser";
import { Toast } from "@/components/Alert/Floating/Toast";

interface IUserData {
  usuario: string;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  contrasena: string;
  rol: string;
}

function CrearUsuario() {
  const { toast, mostrarToast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<IUserData>({
    usuario: "",
    nombres: "",
    primerApellido: "",
    segundoApellido: "",
    contrasena: "",
    rol: "",
  });

  const handleInputChange = (field: keyof IUserData, value: string) => {
    setFormData((prev: IUserData) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const regexContrasena =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!regexContrasena.test(formData.contrasena)) {
      mostrarToast(
        "La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula, un número y un carácter especial",
        "error",
      );
      return;
    }

    try {
      const PostUsuario: IPostUsuario = {
        contrasenia: formData.contrasena,
        nombre: formData.nombres,
        primerApellido: formData.primerApellido,
        segundoApellido: formData.segundoApellido,
        usuario: formData.usuario,
        FKIdTipoAcceso: formData.rol,
      };

      const response = new AuthService().register(PostUsuario);
      mostrarToast("Usuario creado correctamente", "exito");
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
      console.error("CrearUsuario.tsx - Error al registrar usuario:" + error);
      mostrarToast(`Error al crear usuario`, "error");
    }
  };

  return (
    <>
      {/*  Mensaje flotante */}
      <Toast texto={toast.texto} tipo={toast.tipo} />
      {/* Main Content */}
      <main className="ml-65 w-[calc(100%-260px)] px-10 py-8 overflow-y-auto min-h-screen bg-slate-50">
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
                onInvalid={(e: React.FormEvent<HTMLInputElement>) => {
                  const regexContrasena =
                    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
                  if (!regexContrasena.test(formData.contrasena)) {
                    e.currentTarget.setCustomValidity(
                      "La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula, un número y un carácter especial",
                    );
                  } else {
                    e.currentTarget.setCustomValidity(
                      "La contraseña es obligatoria",
                    );
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

          {/* Botón */}
          <div className="form-group action-buttons">
            <button type="submit" className="btn-crear-usuario">
              Crear Usuario
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

export default CrearUsuario;
