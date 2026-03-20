import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Usuarios.css";
import { Toast } from "@/components/Alert/Floating/Toast";
import { useToast } from "@/hooks/useToast";
import AccesoService from "@/services/AccesoService";
import { IUsuarioBase } from "@/schemas/acceso/GetUsuario";

// Instancia estable fuera del componente
const accesoService = new AccesoService();

function Usuarios() {
  const navigate = useNavigate();
  const { toast, mostrarToast } = useToast();

  const [usuariosActivos, setUsuariosActivos] = useState<IUsuarioBase[]>([]);
  const [cargando, setCargando] = useState(true);
  const [hayError, setHayError] = useState(false);

  useEffect(() => {
    const fetchUsuarios = async () => {
      setHayError(false);
      try {
        const data = await accesoService.getUsuarios();
        const activos = data.mensaje.usuarios.filter(
          (usuario: IUsuarioBase) => usuario.estado === 1,
        );
        setUsuariosActivos(activos);
      } catch (err) {
        console.error("Usuarios.tsx - Error al obtener usuarios:", err);
        mostrarToast("Error al obtener usuarios", "error");
        setHayError(true);
      } finally {
        setCargando(false);
      }
    };

    fetchUsuarios();
  }, []);

  return (
    <>
      <Toast texto={toast.texto} tipo={toast.tipo} />
      <main className="ml-65 w-[calc(100%-260px)] px-10 py-8 overflow-y-auto min-h-screen bg-slate-50">
        <div className="page-header2">
          <h1 className="page-title2">Usuarios</h1>
        </div>

        <div className="usuarios-header">
          <button
            className="btn-crearUsuario"
            onClick={() => navigate("/crear-usuario")}
          >
            Crear Usuario
          </button>
        </div>

        {cargando && <p>Cargando usuarios...</p>}

        {!cargando && !hayError && (
          <>
            {usuariosActivos.length === 0 ? (
              <p>No hay usuarios activos.</p>
            ) : (
              <ul className="usuarios-list">
                {usuariosActivos.map((user) => (
                  <li
                    key={user.idAcceso}
                    onClick={() =>
                      navigate("/editar-usuario", { state: { usuario: user } })
                    }
                  >
                    <span>
                      {user.nombre} {user.primerApellido}{" "}
                      {user.segundoApellido ?? ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default Usuarios;
