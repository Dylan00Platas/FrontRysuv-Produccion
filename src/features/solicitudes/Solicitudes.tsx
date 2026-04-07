import { useEffect, useState, useContext } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import ProcesoContratacionService from "@/services/ProcesoContratacionService";
import { IProcesoContratacionBase } from "@/schemas/procesos-contratacion/GetProcesoContratacion";
import "./Solicitudes.css";
import MainHeader from "@/components/header/MainHeader";

interface ISolicitudTabla {
  id: number;
  hermesNotificacion: string;
  folio: string;
  puesto: string;
  estado: string;
  candidato: string;
}

function Solicitudes() {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<ISolicitudTabla[]>([]);
  const [solicitudesRaw, setSolicitudesRaw] = useState<IProcesoContratacionBase[]>([]);
  const [loading, setLoading] = useState(true);

  const handleEditarSolicitud = (solicitudAdaptada: ISolicitudTabla) => {
    // Buscamos la solicitud completa por id
    const solicitudCompleta = solicitudesRaw?.find(
      (s) => s.idProceso === solicitudAdaptada.id,
    );
    navigate("/asignar-solicitud", { state: { solicitud: solicitudCompleta } });
  };

  const estadoOptions = [
    { value: "Todos",                label: "Todos" },
    { value: "Citado",               label: "Citado" },
    { value: "Evaluado",             label: "Evaluado" },
    { value: "En procesamiento",     label: "En procesamiento" },
    { value: "En revisión",          label: "En revisión" },
    { value: "En firma",             label: "En firma" },
    { value: "Notificado",           label: "Notificado" },
    { value: "Cancelado",            label: "Cancelado" },
    { value: "Terminado",            label: "Terminado" },
    { value: "Solicitud pendiente",  label: "Solicitud pendiente" },
    { value: "Solicitud entregado",  label: "Solicitud entregado" },
    { value: "Solicitud notificado", label: "Solicitud notificado" },
    { value: "Evaluacion",           label: "Evaluacion" },
  ];

  const [estadoFiltro, setEstadoFiltro] = useState(estadoOptions[0]);
  const [searchTerm, setSearchTerm] = useState("");

  // Cargar solicitudes desde el backend
  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const ProcesoServicio = new ProcesoContratacionService();
        const data = await ProcesoServicio.getProcesosContratacion();
        setSolicitudesRaw(data.mensaje.procesos);
        console.log(data)
        
        //  Filtramos solo solicitudes sin analista asignado
        const dataSinBolsa = data.mensaje.procesos.filter(
          (s) => s.FKIdTipoProceso !== 3,
        );
        const dataSinAnalista = dataSinBolsa.filter(
          (s) => s.FKIdAcceso !== null,
        );

        // Adaptamos solo para la tabla
        const solicitudesAdaptadas = dataSinAnalista.map((s, idx) => ({
          hermesNotificacion: s.hermesNotificacion || "",
          id: s.idProceso || idx,
          folio: String(s.folio || " "),
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

  function mapEstado(fk: number) {
    switch (fk) {
      case 1:  return "Citado";
      case 2:  return "Evaluado";
      case 3:  return "En procesamiento";
      case 4:  return "En revisión";
      case 5:  return "En firma";
      case 6:  return "Notificado";
      case 7:  return "Cancelado";
      case 8:  return "Terminado";
      case 9:  return "Solicitud pendiente";
      case 10: return "Solicitud entregado";
      case 11: return "Solicitud notificado";
      case 12: return "Evaluacion";
      default: return "";
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
    <>
      <main className="ml-65 w-[calc(100%-260px)] px-[4%] py-[2%] overflow-y-auto min-h-screen bg-slate-50">
        <MainHeader
          title="Solicituddes disponibles"
          subtitle="Gestión de solicitudes"
        />

        <div className="filtros-bar">
          <div className="filtro-estado">
            <Select
              options={estadoOptions}
              value={estadoFiltro}
              onChange={(value) => {
                if (value) setEstadoFiltro(value);
              }}
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
    </>
  );
}

export default Solicitudes;
