import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import "./Usuarios.css";
import Sidebar from "@/components/layout/sidebar/Sidebar.jsx";
import UsuarioServicio from "@/services/UsuarioService.js";
import { UserContext } from "@/utils/UserContext.jsx";

function Usuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const { usuario } = useContext(UserContext);
  const usuarioServicio = new UsuarioServicio();

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await usuarioServicio.obtenerUsuarios(token);
        const usuariosActivos = data.filter((u) => u.estado === true);
        setUsuarios(usuariosActivos);
      } catch (err) {
        console.error("Error al cargar usuarios:", err);
        setError("No se pudieron cargar los usuarios");
      } finally {
        setCargando(false);
      }
    };

    fetchUsuarios();
  }, []);

  const handleCrearUsuario = () => {
    navigate("/crear-usuario");
  };

  const handleEditarUsuario = (usuario) => {
    navigate("/editar-usuario", { state: { usuario } });
  };

  return (
    <div className="usuarios-page">
      <Sidebar tipoAcceso={usuario.FKidTipoAcceso} />
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
        {error && <p className="error">{error}</p>}

        {!cargando && !error && (
          <ul className="usuarios-list">
            {usuarios.map((user) => (
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
