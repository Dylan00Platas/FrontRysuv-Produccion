import { useEffect, useState, useContext } from "react";
import { FaSearch } from "react-icons/fa";
import Sidebar from "../Componentes/Sidebar";
import SolicitudServicio from "../Servicios/SolicitudServicio.js";
import { UsuarioContext } from "../Auxiliares/UsuarioContext.jsx";
import { useNavigate } from "react-router-dom";

function VerOficios() {
  const { usuario } = useContext(UsuarioContext);
  const navigate = useNavigate();

  const datosSesion = sessionStorage.getItem("datosVerOficios");
  const datosParsed = datosSesion ? JSON.parse(datosSesion) : null;

  const idProceso = datosParsed?.idProceso || null;

  const [oficios, setOficios] = useState([]);
  const [oficiosFiltrados, setOficiosFiltrados] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOficios = async () => {
      try {
        const token =
          sessionStorage.getItem("token") ||
          localStorage.getItem("token") ||
          usuario?.token;

        if (!idProceso) {
          console.error("❌ No se recibió idProceso");
          setLoading(false);
          return;
        }

        const servicio = new SolicitudServicio();
        const data = await servicio.obtenerOficiosPorProceso(idProceso, token);

        console.log("📩 JSON recibido del backend (oficios):", data);

        const adaptados = data.map((o, idx) => ({
          id: o.idOficio ?? idx,
          tipo: o.tipo || "Sin tipo",
          dirigido: o.dirigido || "Sin destinatario",
          fecha: o.fecha || "Sin fecha",
          folio: o.folio || "",
          machote: o.machote || "",
          piePagina: o.piePagina || "",
          puestoDirigido: o.puestoDirigido || ""
        }));

        setOficios(adaptados);
        setOficiosFiltrados(adaptados);
      } catch (err) {
        console.error("Error al obtener oficios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOficios();
  }, [idProceso, usuario]);

  // 🔎 Filtro
  useEffect(() => {
    const filtrados = oficios.filter((o) => {
      const texto = `${o.tipo} ${o.dirigido} ${o.fecha}`.toLowerCase();
      return texto.includes(searchTerm.toLowerCase());
    });
    setOficiosFiltrados(filtrados);
  }, [searchTerm, oficios]);

  // 👉 **FUNCIÓN PARA VER DETALLES**
  const verDetalles = (oficio) => {
    sessionStorage.setItem("detallesOficio", JSON.stringify(oficio));
    navigate("/Ver-detalles-oficio");
  };

  return (
    <div className="solicitudes-page">
      <Sidebar tipoAcceso={usuario.FKidTipoAcceso} />

      <main className="main-content">
        <div className="page-header2">
          <h1 className="page-title2">Oficios del Proceso</h1>
        </div>

        {/* Barra de búsqueda */}
        <div className="filtros-bar">
          <div className="filtro-busqueda" style={{ width: "300px" }}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <p className="mensaje-info">Cargando oficios...</p>
        ) : oficiosFiltrados.length === 0 ? (
          <div className="mensaje-vacio-container">
            <h2>No hay oficios</h2>
            <p>Este proceso no tiene oficios registrados.</p>
          </div>
        ) : (
          <table className="tabla-solicitudes">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Dirigido</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {oficiosFiltrados.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => verDetalles(o)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{o.tipo}</td>
                  <td>{o.dirigido}</td>
                  <td>{o.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

export default VerOficios;
