import { Toast } from "@/components/Alert/Floating/Toast";
import MainHeader from "@/components/header/MainHeader";
import { useToast } from "@/hooks/useToast";
import IResponseHTTP from "@/interfaces/http/Response";
import {
  IGetOficiosProcesoContratacion,
  IOficioProcesoContratacionBase,
} from "@/schemas/procesos-contratacion/GetOficioProcesoContratacion";
import ProcesoContratacionService from "@/services/ProcesoContratacionService";
import { useEffect, useState, useContext } from "react";
import { FaSearch } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

function VerOficios() {
  const { toast, mostrarToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const idProceso = location?.state.idProceso;

  const [oficios, setOficios] = useState<IOficioProcesoContratacionBase[]>([]);
  const [oficiosFiltrados, setOficiosFiltrados] = useState<
    IOficioProcesoContratacionBase[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOficios = async () => {
      try {
        const response: IResponseHTTP<IGetOficiosProcesoContratacion> =
          await new ProcesoContratacionService().getOficio(idProceso);

        if (response.mensaje) {
          const adaptados = response.mensaje.oficios.map((o, idx) => ({
            id: o.idOficio ?? idx,
            tipo: o.tipo || "Sin tipo",
            dirigido: o.dirigido || "Sin destinatario",
            fecha: o.fecha || "Sin fecha",
            folio: o.folio || "",
            machote: o.machote || "",
            piePagina: o.piePagina || "",
            puestoDirigido: o.puestoDirigido || "",
          }));
          setOficios(adaptados);
          setOficiosFiltrados(adaptados);
        }
      } catch (err) {
        console.error("Error al obtener oficios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOficios();
  }, [idProceso]);

  // Filtro
  useEffect(() => {
    const filtrados = oficios.filter((o) => {
      const texto = `${o.tipo} ${o.dirigido} ${o.fecha}`.toLowerCase();
      return texto.includes(searchTerm.toLowerCase());
    });
    setOficiosFiltrados(filtrados);
  }, [searchTerm, oficios]);

  const verDetalles = (oficio) => {
    sessionStorage.setItem("detallesOficio", JSON.stringify(oficio));
    navigate("/Ver-detalles-oficio");
  };

  return (
    <>
      <Toast texto={toast.texto} tipo={toast.tipo} />
      <main className="main-content">
        <MainHeader
          title="Oficios relacionados a proceso"
          subtitle="Gestión de oficios"
        />

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
    </>
  );
}

export default VerOficios;
