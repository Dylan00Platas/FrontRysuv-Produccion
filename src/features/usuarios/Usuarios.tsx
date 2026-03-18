import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AccesoService from "@/services/AccesoService";
import { IUsuarioBase } from "@/schemas/acceso/GetUsuario";
import { Toast } from "@/components/Alert/Floating/Toast";
import { useToast } from "@/hooks/useToast";
import "./Usuarios.css";

function Usuarios() {
  const navigate = useNavigate();
  const {toast, mostrarToast} = useToast();
  const [usuarios, setUsuarios] = useState<IUsuarioBase[]>();
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const data = await new AccesoService().getUsuarios();
        const usuariosActivos = data.mensaje.usuarios.filter((usuario: IUsuarioBase) => usuario.estado === 1);
        setUsuarios(usuariosActivos);
      } catch (err) {
        console.error("Usuarios.tsx - Error al obtener usuarios: " + err)
        mostrarToast("Error al obtener usuarios","error")
      } finally {
        setCargando(false);
      }
    };

    fetchUsuarios();
  }, []);

  const handleCrearUsuario = () => {
    navigate("/crear-usuario");
  };

  const handleEditarUsuario = (usuario: IUsuarioBase) => {
    navigate("/editar-usuario", { state: { usuario } });
  };

  return (
    <div className="usuarios-page">
      <main className="main-content">
        <div className="page-header2">
          <h1 className="page-title2">Usuarios</h1>
        </div>

        <div className="usuarios-header">
          <button className="btn-crearUsuario" onClick={handleCrearUsuario}>
            Crear Usuario
          </button>
        </div>

        {cargando && <p>Cargando usuarios...</p>}
        <Toast texto={toast.texto} tipo={toast.tipo}/>
        {!cargando && !(toast.tipo !== "error") && (
          <ul className="usuarios-list">
            {usuarios?.map((user) => (
              <li key={user.idAcceso} onClick={() => handleEditarUsuario(user)}>
                <span>
                  {user.nombre} {user.primerApellido}{" "}
                  {user.segundoApellido ?? ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default Usuarios;
