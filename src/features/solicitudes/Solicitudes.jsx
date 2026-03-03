import { useEffect, useState, useContext } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

import "./Solicitudes.css";
import Sidebar from "@/layout/sidebar/Sidebar.jsx";
import SolicitudService from "@/services/SolicitudService.js";
import UserContext from "@/utils/UserContext.jsx";

function Solicitudes() {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudesRaw, setSolicitudesRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(UserContext);

  const handleEditarSolicitud = (solicitudAdaptada) => {
    // Buscamos la solicitud completa por id
    const solicitudCompleta = solicitudesRaw.find(
      (s) => s.idProceso === solicitudAdaptada.id,
    );
    console.log(solicitudCompleta);
    navigate("/asignar-solicitud", { state: { solicitud: solicitudCompleta } });
  };

  const estadoOptions = [
    { value: "Todos", label: "Todos" },
    { value: "Pendiente (cita)", label: "Pendiente (cita)" },
    { value: "Entregado (cita)", label: "Entregado (cita)" },
    { value: "Citado", label: "Citado" },
  ];

  const [estadoFiltro, setEstadoFiltro] = useState(estadoOptions[0]);
  const [searchTerm, setSearchTerm] = useState("");

  // Cargar solicitudes desde el backend
  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const token = localStorage.getItem("token");
        const servicio = new SolicitudService();
        const data = await servicio.obtenerSolicitudes(token);

        setSolicitudesRaw(data);

        //  Filtramos solo solicitudes sin analista asignado
        const dataSinBolsa = data.filter((s) => s.FKIdTipoProceso !== 3);
        const dataSinAnalista = dataSinBolsa.filter(
          (s) => s.FKIdAcceso === null,
        );

        // Adaptamos solo para la tabla
        const solicitudesAdaptadas = dataSinAnalista.map((s, idx) => ({
          hermesNotificacion: s.hermesNotificacion || "",
          id: s.idProceso || idx,
          folio: s.folio || s.folio || " ",
          puesto: s.categoriaPuestoOrigen || "Sin puesto",
          estado: mapEstado(s.FKIdEstadoProcesoContratacion),
          candidato: s.nombreCandidato,
        }));

        setSolicitudes(solicitudesAdaptadas);
      } catch (error) {
        console.error("Error al cargar solicitudes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, []);

  function mapEstado(fk) {
    switch (fk) {
      case 9:
        return "Pendiente (cita)";
      case 10:
        return "Entregado (cita)";
      case 11:
        return "Citado";
      default:
        return " ";
    }
  }

  const solicitudesFiltradas = solicitudes.filter((s) => {
    const coincideBusqueda =
      s.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.puesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.estado.toLowerCase().includes(searchTerm.toLowerCase());

    const coincideEstado =
      estadoFiltro.value === "Todos" || s.estado === estadoFiltro.value;
    return coincideEstado && coincideBusqueda;
  });

  return (
    <div className="solicitudes-page">
      <Sidebar tipoAcceso={currentUser.FKidTipoAcceso} />

      <main className="main-content">
        <div className="page-header2">
          <h1 className="page-title2">Solicitudes</h1>
        </div>

        <div className="filtros-bar">
          <div className="filtro-estado">
            <Select
              options={estadoOptions}
              value={estadoFiltro}
              onChange={(value) => setEstadoFiltro(value)}
              isClearable={false}
            />
          </div>

          <div className="filtro-busqueda">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p className="mensaje-info">Cargando solicitudes...</p>
        ) : solicitudesFiltradas.length === 0 ? (
          <div className="mensaje-vacio-container">
            <h2>Todo en orden</h2>
            <p>No hay solicitudes pendientes en este momento.</p>
          </div>
        ) : (
          <table className="tabla-solicitudes">
            <thead>
              <tr>
                <th>Folio/Hermés</th>
                <th>Candidato</th>
                <th>Puesto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {solicitudesFiltradas.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => handleEditarSolicitud(s)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{s.folio + " / " + s.hermesNotificacion}</td>
                  <td>{s.candidato}</td>
                  <td>{s.puesto}</td>
                  <td>{s.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

export default Solicitudes;
