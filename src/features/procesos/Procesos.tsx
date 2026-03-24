import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaBell, FaExclamationTriangle } from "react-icons/fa";
import Select from "react-select";
import AccesoService from "@/services/AccesoService";
import ProcesoContratacionService from "@/services/ProcesoContratacionService";
import { IProcesoContratacionBase } from "@/schemas/procesos-contratacion/GetProcesoContratacion";
import "./Procesos.css";

interface IAnalista {
  idAcceso: number;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
}

interface IProcesosAdaptados {
  id: number;
  folio: string;
  candidato: string;
  analista: string;
  estado: string;
  estadoId: number;
  fechaNotificacion: string;
  hermesNotificacion: string;
}

function Procesos() {
  const navigate = useNavigate();
  const [procesos, setProcesos] = useState<IProcesosAdaptados[]>([]);
  const [procesosRaw, setProcesosRaw] = useState<IProcesoContratacionBase[]>(
    [],
  );
  const [analistas, setAnalistas] = useState<IAnalista[]>([]);
  const [loading, setLoading] = useState(true);

  type OptionType = { value: string; label: string };

  const [analistaOptions, setAnalistaOptions] = useState([
    { value: "Todos", label: "Todos" },
  ]);
  const [analistaFiltro, setAnalistaFiltro] = useState<OptionType | null>({
    value: "Todos",
    label: "Todos",
  });

  const [estadoOptions, setEstadoOptions] = useState([
    { value: "Todos", label: "Todos" },
  ]);
  const [estadoFiltro, setEstadoFiltro] = useState<OptionType | null>({
    value: "Todos",
    label: "Todos",
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const solicitudService = new ProcesoContratacionService();
        const usuarioServicio = new AccesoService();

        const data = await solicitudService.getProcesosContratacion();
        setProcesosRaw(data.mensaje.procesos);

        const analistasData = await usuarioServicio.getAnalistas();
        const Analistas: IAnalista[] = analistasData.mensaje.usuarios.map(
          (analista) => {
            return {
              idAcceso: analista.idAcceso,
              nombre: analista.nombre,
              primerApellido: analista.primerApellido,
              segundoApellido: analista.segundoApellido,
            };
          },
        );
        setAnalistas(Analistas);

        const analistasMap: Record<number, string> = {};
        analistas.forEach((analista: IAnalista) => {
          analistasMap[analista.idAcceso] =
            `${analista.nombre} ${analista.primerApellido} ${analista.segundoApellido || ""}`.trim();
        });

        const dataConAnalista = data.mensaje.procesos.filter(
          (s) => s.FKIdAcceso !== null,
        );

        const procesosAdaptados: IProcesosAdaptados[] = dataConAnalista.map(
          (s, idx) => ({
            id: s.idProceso || idx,
            folio: s.folio || "",

            candidato: s.nombreCandidato || "Sin candidato",
            analista: analistasMap[s.FKIdAcceso] || "Sin analista",
            estado: mapEstado(s.FKIdEstadoProcesoContratacion),
            estadoId: s.FKIdEstadoProcesoContratacion,
            fechaNotificacion: s.fechaNotificacion,
            hermesNotificacion: s.hermesNotificacion || "",
          }),
        );

        setProcesos(procesosAdaptados);

        const analistasUnicos = [
          { value: "Todos", label: "Todos" },
          ...Array.from(new Set(procesosAdaptados.map((p) => p.analista))).map(
            (a) => ({
              value: a,
              label: a,
            }),
          ),
        ];

        const estadosUnicos = [
          { value: "Todos", label: "Todos" },
          ...Array.from(new Set(procesosAdaptados.map((p) => p.estado))).map(
            (e) => ({
              value: e,
              label: e,
            }),
          ),
        ];

        setAnalistaOptions(analistasUnicos);
        setEstadoOptions(estadosUnicos);
      } catch (error) {
        console.error("Error al cargar procesos o analistas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  function mapEstado(fk: number) {
    switch (fk) {
      case 1:
        return "Citado";
      case 2:
        return "Evaluado";
      case 4:
        return "En revisión";
      case 5:
        return "En firma";
      case 6:
        return "Notificado";
      case 7:
        return "Cancelado";
      case 8:
        return "Terminado";
      case 13:
        return "Inicio procesamiento";
      case 14:
        return "Procesamiento oficio";
      case 15:
        return "Fin procesamiento";
      default:
        return "Citado";
    }
  }

  function getStatusByFecha(fechaNotificacion: string) {
    if (!fechaNotificacion) return { color: "inherit", icon: null };

    const fechaNotif = new Date(fechaNotificacion);
    const fechaLimite = new Date(fechaNotif);
    fechaLimite.setMonth(fechaLimite.getMonth() + 3);
    const hoy = new Date();
    const diffDias =
      (fechaLimite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDias <= 15)
      return {
        color: "red",
        icon: (
          <FaExclamationTriangle
            className="alert-icon red"
            title="Faltan menos de 15 días"
          />
        ),
      };
    if (diffDias <= 30)
      return {
        color: "orange",
        icon: (
          <FaBell className="alert-icon orange" title="Falta menos de un mes" />
        ),
      };

    return { color: "inherit", icon: null };
  }

  //  Filtro general
  const procesosFiltrados = procesos.filter((p) => {
    const estadoPermitido =
      estadoFiltro?.value === "Todos"
        ? p.estado !== "Terminado" && p.estado !== "Cancelado"
        : p.estado === estadoFiltro?.value;

    const coincideAnalista =
      analistaFiltro?.value === "Todos" || p.analista === analistaFiltro?.value;
    const coincideBusqueda =
      String(p.folio).toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.candidato.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.analista.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.estado.toLowerCase().includes(searchTerm.toLowerCase());

    return estadoPermitido && coincideAnalista && coincideBusqueda;
  });

  return (
    <>
      <main className="main-content">
        <div className="page-header2">
          <h1 className="page-title2">Evaluaciones</h1>
        </div>

        <div className="main-content-inner">
          <div className="filtros-combobox">
            <div>
              <label>Estado</label>
              <Select
                options={estadoOptions}
                value={estadoFiltro}
                onChange={(value) => setEstadoFiltro(value)}
                isClearable={false}
                placeholder="Estados"
              />
            </div>

            <div>
              <label>Analista</label>
              <Select
                options={analistaOptions}
                value={analistaFiltro}
                onChange={(value) => setAnalistaFiltro(value)}
                isClearable={false}
                placeholder="Analistas"
              />
            </div>

            <div className="filtro-busqueda">
              <div className="search-input-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <p>Cargando procesos...</p>
          ) : (
            <table className="tabla-procesos">
              <thead>
                <tr>
                  <th>Folio/Hermés</th>
                  <th>Candidato</th>
                  <th>Analista</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {procesosFiltrados.map((p) => {
                  const procesoOriginal = procesosRaw.find(
                    (s) => s.idProceso === p.id,
                  );
                  const { color, icon } = getStatusByFecha(p.fechaNotificacion);

                  return (
                    <tr
                      key={p.id}
                      onClick={() =>
                        navigate("/evaluacion", { state: procesoOriginal })
                      }
                    >
                      <td>{p.folio + " / " + p.hermesNotificacion}</td>
                      <td
                        style={{
                          color,
                          fontWeight: color !== "inherit" ? "bold" : "normal",
                        }}
                      >
                        <span className="candidato-text">
                          {p.candidato}
                          {icon && (
                            <span style={{ marginLeft: "8px" }}>{icon}</span>
                          )}
                        </span>
                      </td>
                      <td>{p.analista}</td>
                      <td>
                        <span
                          className={`estado-badge ${p.estado.toLowerCase().replace(/\s/g, "")}`}
                        >
                          {p.estado}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}

export default Procesos;
