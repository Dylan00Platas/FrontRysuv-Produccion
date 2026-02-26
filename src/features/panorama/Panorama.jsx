import { useEffect, useState, useContext, useRef } from "react";
import { FaSearch, FaTimesCircle, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

import "./Panorama.css";
import Sidebar from "@/components/layout/sidebar/Sidebar.jsx";
import SolicitudService from "@/services/SolicitudService";
import CedulaService from "@/services/CedulaService";
import UserContext from "@/utils/UserContext.jsx";

function Panorama() {
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();

  //  Estados de Evaluaciones
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [evaluacionesFiltradas, setEvaluacionesFiltradas] = useState([]);
  const [estadoOptions, setEstadoOptions] = useState([]);
  const [dependenciaOptions, setDependenciaOptions] = useState([]);
  const [filtros, setFiltros] = useState({
    estado: null,
    dependencia: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [evaluacionesRaw, setEvaluacionesRaw] = useState([]);

  //  Estados de Cédulas
  const [cedulas, setCedulas] = useState([]);
  const [cedulasFiltradas, setCedulasFiltradas] = useState([]);
  const [filtroCedula, setFiltroCedula] = useState({
    value: "Pendiente de validar Jefe de Departamento",
    label: "Pendiente de validar Jefe de Departamento",
  });
  const [dependenciaCedulaOptions, setDependenciaCedulaOptions] = useState([]);
  const [dependenciaCedulaFiltro, setDependenciaCedulaFiltro] = useState(null);
  const [searchCedula, setSearchCedula] = useState("");
  const [loadingCedulas, setLoadingCedulas] = useState(true);

  function mapEstado(fk) {
    switch (fk) {
      case 1:
        return "Citado";
      case 2:
        return "Evaluado";
      case 3:
        return "En procesamiento";
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
        return "Por iniciar";
    }
  }

  //  Cargar Evaluaciones
  useEffect(() => {
    const fetchEvaluaciones = async () => {
      try {
        const token = localStorage.getItem("token");
        const SolicitudService = new SolicitudService();

        const data = await SolicitudService.obtenerSolicitudes(token);
        setEvaluacionesRaw(data);
        const dataFiltrada = data.filter((s) => s.FKIdAcceso !== null);

        const adaptadas = dataFiltrada.map((s, idx) => ({
          id: s.idProceso || idx,
          folio: s.folio || "",
          hermesNotificacion: s.hermesNotificacion || "",
          nombre: s.nombreCandidato || "Sin candidato",
          puesto: s.categoriaPuestoOrigen || "Sin puesto",
          estado: mapEstado(s.FKIdEstadoProcesoContratacion),
          fechaRecibido: s.fechaRecibido
            ? new Date(s.fechaRecibido).toLocaleDateString("es-MX")
            : "Sin fecha",
          dependencia: s.nombre || "Sin dependencia",
        }));

        setEvaluaciones(adaptadas);

        const sinTerminados = adaptadas.filter(
          (e) => e.estado !== "Terminado" && e.estado !== "Cancelado",
        );

        setEvaluacionesFiltradas(sinTerminados);

        // Opciones de filtros
        const estadosUnicos = [...new Set(adaptadas.map((e) => e.estado))].map(
          (estado) => ({ value: estado, label: estado }),
        );
        setEstadoOptions(estadosUnicos);

        const dependenciasUnicas = [
          ...new Set(adaptadas.map((e) => e.dependencia)),
        ].map((d) => ({ value: d, label: d }));
        setDependenciaOptions(dependenciasUnicas);
      } catch (error) {
        console.error("Error cargando evaluaciones:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluaciones();
  }, []);

  //  Filtros de Evaluaciones
  useEffect(() => {
    let filtradas = [...evaluaciones];

    if (!filtros.estado) {
      filtradas = filtradas.filter(
        (e) => e.estado !== "Terminado" && e.estado !== "Cancelado",
      );
    }
    if (filtros.estado)
      filtradas = filtradas.filter((e) => e.estado === filtros.estado.value);
    if (filtros.dependencia)
      filtradas = filtradas.filter(
        (e) => e.dependencia === filtros.dependencia.value,
      );
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtradas = filtradas.filter(
        (e) =>
          e.nombre.toLowerCase().includes(term) ||
          e.folio.toLowerCase().includes(term) ||
          e.puesto.toLowerCase().includes(term),
      );
    }
    setEvaluacionesFiltradas(filtradas);
  }, [filtros, searchTerm, evaluaciones]);

  //  Cargar Cédulas (solo FKIdTipoCedula: 2)
  useEffect(() => {
    const cargarCedulas = async () => {
      try {
        setLoadingCedulas(true);
        const token = localStorage.getItem("token");
        const servicio = new CedulaService();
        const data = await servicio.obtenerTodasCedulasDisponibles(token);

        const cedulasTipo2 = data.filter((c) => c.FKIdTipoCedula === 2);
        setCedulas(cedulasTipo2);

        const dependenciasUnicas = [
          ...new Set(cedulasTipo2.map((c) => c.nombreDependencia || "N/A")),
        ].map((d) => ({ value: d, label: d }));
        setDependenciaCedulaOptions(dependenciasUnicas);
      } catch (err) {
        console.error("Error cargando cédulas:", err);
      } finally {
        setLoadingCedulas(false);
      }
    };
    cargarCedulas();
  }, []);

  //  Filtros de Cédulas
  useEffect(() => {
    let filtradas = [...cedulas];

    if (filtroCedula?.value === "Pendiente de validar Jefe de Departamento") {
      filtradas = filtradas.filter(
        (c) =>
          c.FKIdTipoCedula === 2 &&
          c.aprobadoJefeOficina === true && // ✔ Ya validado por Jefe de Oficina
          (c.aprobadoDireccion === null || // ❌ Pendiente por Jefe de Departamento
            c.aprobadoDireccion === false),
      );
    }

    // 🟧 FILTRO: Pendiente de validar Jefe de Oficina
    else if (filtroCedula?.value === "Pendiente de validar Jefe de Oficina") {
      filtradas = filtradas.filter(
        (c) =>
          c.FKIdTipoCedula === 2 &&
          (c.aprobadoJefeOficina === null || // ❌ No validado aún por Jefe de Oficina
            c.aprobadoJefeOficina === false),
      );
    }

    // 🟩 FILTRO: Todas las cédulas
    else if (filtroCedula?.value === "Todas las cédulas") {
      filtradas = filtradas.filter((c) => c.FKIdTipoCedula === 2);
    }
    if (dependenciaCedulaFiltro)
      filtradas = filtradas.filter(
        (c) => c.nombreDependencia === dependenciaCedulaFiltro.value,
      );

    if (searchCedula.trim() !== "") {
      const term = searchCedula.toLowerCase();
      filtradas = filtradas.filter(
        (c) =>
          (c.hermesNotificacion || "").toLowerCase().includes(term) ||
          (c.nombreCandidato || "").toLowerCase().includes(term) ||
          (c.nombreDependencia || "").toLowerCase().includes(term) ||
          (c.puesto || "").toLowerCase().includes(term),
      );
    }

    setCedulasFiltradas(filtradas);
  }, [cedulas, filtroCedula, dependenciaCedulaFiltro, searchCedula]);

  //  Estados para Competencias de Candidatos
  const [competencias, setCompetencias] = useState([]);
  const [loadingCompetencias, setLoadingCompetencias] = useState(true);

  const cargarCompetencias = async () => {
    try {
      setLoadingCompetencias(true);
      const token = localStorage.getItem("token");
      const servicio = new CedulaService();

      const data = await servicio.obtenerCedulasActivas(token);

      const filtradas = data.filter(
        (c) => c.FKIdTipoCedula !== 1 && c.capacitado !== true,
      );

      const adaptadas = filtradas.map((c) => ({
        idProceso: c.FKIdProceso ?? null,
        nombreCandidato: c.nombreCandidato || "N/A",
        competenciaReforzar: c.competenciaReforzar || "N/A",
        competenciaDesarrollar: c.competenciaDesarrollar || "N/A",
        capacitado: false,
      }));

      setCompetencias(adaptadas);
    } catch (err) {
      console.error("Error cargando competencias de candidatos:", err);
    } finally {
      setLoadingCompetencias(false);
    }
  };

  //  Cargar Competencias al montar
  useEffect(() => {
    cargarCompetencias();
  }, []);

  //  Referencias a secciones
  const evaluacionesRef = useRef(null);
  const cedulasRef = useRef(null);
  const competenciasRef = useRef(null);

  //  Función para hacer scroll suave
  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="panorama-page">
      <Sidebar tipoAcceso={usuario?.FKidTipoAcceso} />
      <main className="main-content">
        <div className="page-header2">
          <h1 className="page-title2">Panorama Global</h1>
        </div>

        <div className="main-content-inner">
          {/*  SECCIÓN EVALUACIONES */}
          {/*  SECCIÓN EVALUACIONES */}
          <section className="stats-section" ref={evaluacionesRef}>
            <h2 className="section-title">📋 Evaluaciones</h2>

            <div className="filtros-combobox">
              <div>
                <label>Estado</label>
                <Select
                  options={estadoOptions}
                  value={filtros.estado}
                  onChange={(v) => setFiltros((p) => ({ ...p, estado: v }))}
                  isClearable
                />
              </div>

              <div>
                <label>Dependencia</label>
                <Select
                  options={dependenciaOptions}
                  value={filtros.dependencia}
                  onChange={(v) =>
                    setFiltros((p) => ({ ...p, dependencia: v }))
                  }
                  isClearable
                />
              </div>

              <div className="filtro-busqueda" style={{ marginTop: "2.8%" }}>
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
              <p>Cargando evaluaciones...</p>
            ) : (
              <table className="tabla-candidatos">
                <thead>
                  <tr>
                    <th>Folio/Hermés</th>
                    <th>Nombre</th>
                    <th>Puesto</th>
                    <th>Fecha recibido</th>
                    <th>Dependencia</th>
                    <th style={{ width: "15%" }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluacionesFiltradas.map((e) => (
                    <tr
                      key={e.id}
                      title="Doble clic para abrir en evaluación"
                      onDoubleClick={() => {
                        const procesoOriginal = evaluacionesRaw.find(
                          (s) => s.idProceso === e.id,
                        );
                        navigate("/evaluacion", { state: procesoOriginal });
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{e.folio + "/ " + e.hermesNotificacion}</td>
                      <td>{e.nombre}</td>
                      <td>{e.puesto}</td>

                      <td>{e.fechaRecibido}</td>
                      <td>{e.dependencia}</td>
                      <td>
                        <span
                          className={`estado-badge ${e.estado.toLowerCase().replace(/\s/g, "")}`}
                        >
                          {e.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <hr className="section-divider" />

          {/*  SECCIÓN CÉDULAS */}
          {/*  SECCIÓN CÉDULAS */}
          <section className="stats-section" ref={cedulasRef}>
            <h2 className="section-title">📑 Cédulas</h2>

            <div className="filtros-combobox">
              <div>
                <label>Tipo de filtro</label>
                <Select
                  options={[
                    {
                      value: "Pendiente de validar Jefe de Departamento",
                      label: "Pendiente de validar Jefe de Departamento",
                    },
                    {
                      value: "Pendiente de validar Jefe de Oficina",
                      label: "Pendiente de validar Jefe de Oficina",
                    },
                    { value: "Todas las cédulas", label: "Todas las cédulas" },
                  ]}
                  value={filtroCedula}
                  onChange={setFiltroCedula}
                />
              </div>

              <div>
                <label>Dependencia</label>
                <Select
                  options={dependenciaCedulaOptions}
                  value={dependenciaCedulaFiltro}
                  onChange={setDependenciaCedulaFiltro}
                  isClearable
                />
              </div>

              <div className="filtro-busqueda" style={{ marginTop: "2.8%" }}>
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchCedula}
                  onChange={(e) => setSearchCedula(e.target.value)}
                />
              </div>
            </div>

            {loadingCedulas ? (
              <p>Cargando cédulas...</p>
            ) : (
              <table className="tabla-candidatos">
                <thead>
                  <tr>
                    <th>Folio/Hermés</th>
                    <th>Nombre candidato</th>
                    <th>Dependencia</th>
                    <th>Puesto</th>
                    <th>Aprobado jefe oficina</th>
                    <th>Aprobado jefe Departamento</th>
                  </tr>
                </thead>
                <tbody>
                  {cedulasFiltradas.map((c) => (
                    <tr
                      key={c.idCedula}
                      onClick={() =>
                        navigate("/crear-cedula", { state: { cedula: c } })
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        {c.folio || "" + "/" + c.hermesNotificacion || ""}
                      </td>
                      <td>{c.nombreCandidato || "N/A"}</td>
                      <td>{c.nombreDependencia || "N/A"}</td>
                      <td>{c.puesto || "N/A"}</td>
                      <td>
                        {c.aprobadoJefeOficina ? (
                          <FaCheckCircle style={{ color: "green" }} />
                        ) : (
                          <FaTimesCircle style={{ color: "red" }} />
                        )}
                      </td>
                      <td>
                        {c.aprobadoDireccion === true ? (
                          <FaCheckCircle style={{ color: "green" }} />
                        ) : (
                          <FaTimesCircle style={{ color: "red" }} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <hr className="section-divider" />

          {/*  SECCIÓN COMPETENCIAS */}

          <section className="stats-section" ref={competenciasRef}>
            <h2 className="section-title">💡 Competencias de candidatos</h2>

            {loadingCompetencias ? (
              <p>Cargando competencias...</p>
            ) : competencias.length === 0 ? (
              <p>No se encontraron competencias activas.</p>
            ) : (
              <>
                <table className="tabla-candidatos">
                  <thead>
                    <tr>
                      <th>Nombre del candidato</th>
                      <th>Competencias a Reforzar</th>
                      <th>Competencias a Desarrollar</th>
                      <th>Capacitado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competencias.map((c, idx) => (
                      <tr key={idx}>
                        <td>{c.nombreCandidato}</td>
                        <td>{c.competenciaReforzar}</td>
                        <td>{c.competenciaDesarrollar}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={c.capacitado || false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setCompetencias((prev) =>
                                prev.map((item, i) =>
                                  i === idx
                                    ? { ...item, capacitado: checked }
                                    : item,
                                ),
                              );
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/*  Botones de acción */}
                <div
                  style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}
                >
                  {competencias.some((c) => c.capacitado) && (
                    <button
                      className="boton-guardar"
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("token");
                          const servicio = new SolicitudService();

                          const seleccionados = competencias.filter(
                            (c) => c.capacitado,
                          );

                          for (const candidato of seleccionados) {
                            if (candidato.idProceso) {
                              await servicio.capacitarCandidato(
                                candidato.idProceso,
                                token,
                              );
                            } else {
                              console.warn(
                                "Candidato sin idProceso:",
                                candidato,
                              );
                            }
                          }

                          await cargarCompetencias();
                        } catch (error) {
                          console.error(
                            "Error al capacitar candidatos:",
                            error,
                          );
                          alert("Ocurrió un error al guardar los candidatos.");
                        }
                      }}
                    >
                      Guardar
                    </button>
                  )}

                  <button
                    className="boton-exportar"
                    onClick={() => {
                      import("xlsx-js-style").then((xlsx) => {
                        const hoy = new Date();
                        const fecha = hoy
                          .toLocaleDateString("es-MX")
                          .replaceAll("/", "-");
                        const datosProcesados = competencias.map((c) => {
                          const reforzar = c.competenciaReforzar
                            ? c.competenciaReforzar
                                .split(",")
                                .map((x) => x.trim())
                            : [];

                          const desarrollar = c.competenciaDesarrollar
                            ? c.competenciaDesarrollar
                                .split(",")
                                .map((x) => x.trim())
                            : [];

                          return {
                            nombre: c.nombreCandidato,
                            reforzar,
                            desarrollar,
                          };
                        });

                        const maxReforzar = Math.max(
                          ...datosProcesados.map((d) => d.reforzar.length),
                        );
                        const maxDesarrollar = Math.max(
                          ...datosProcesados.map((d) => d.desarrollar.length),
                        );

                        const headers = ["Nombre del Candidato"];

                        for (let i = 1; i <= maxReforzar; i++) {
                          headers.push(`Competencia a Reforzar ${i}`);
                        }

                        for (let i = 1; i <= maxDesarrollar; i++) {
                          headers.push(`Competencia a Desarrollar ${i}`);
                        }

                        // -----------------------------------------------
                        // 4. Crear filas una por una
                        // -----------------------------------------------

                        const rows = datosProcesados.map((d) => {
                          const fila = [d.nombre];

                          // Competencias a reforzar
                          for (let i = 0; i < maxReforzar; i++) {
                            fila.push(d.reforzar[i] || "");
                          }

                          // Competencias a desarrollar
                          for (let i = 0; i < maxDesarrollar; i++) {
                            fila.push(d.desarrollar[i] || "");
                          }

                          return fila;
                        });

                        // -----------------------------------------------
                        // 5. Convertir todo a hoja Excel
                        // -----------------------------------------------

                        const ws = xlsx.utils.aoa_to_sheet([headers, ...rows]);

                        // -----------------------------------------------
                        // 6. Ajustar anchos de columna
                        // -----------------------------------------------

                        ws["!cols"] = headers.map(() => ({ wch: 25 }));

                        // -----------------------------------------------
                        // 7. Aplicar estilo al encabezado (como tu archivo)
                        // -----------------------------------------------

                        Object.keys(ws)
                          .filter((c) => c.startsWith("A") || c.includes("1"))
                          .forEach((cell) => {
                            if (ws[cell] && ws[cell].v === ws[cell].v) {
                              ws[cell].s = {
                                font: { bold: true, color: { rgb: "FFFFFF" } },
                                alignment: { horizontal: "center" },
                                fill: {
                                  patternType: "solid",
                                  fgColor: { rgb: "008000" },
                                },
                              };
                            }
                          });

                        const wb = xlsx.utils.book_new();
                        xlsx.utils.book_append_sheet(wb, ws, "Candidatos");

                        xlsx.writeFile(wb, `Tabla Candidatos - ${fecha}.xlsx`);
                      });
                    }}
                  >
                    Exportar
                  </button>
                </div>
              </>
            )}
          </section>
        </div>

        {/*  Botones de navegación flotantes */}
        <div className="floating-buttons">
          <button onClick={() => scrollToSection(evaluacionesRef)}>
            📋 Evaluaciones
          </button>
          <button onClick={() => scrollToSection(cedulasRef)}>
            📑 Cédulas
          </button>
          <button onClick={() => scrollToSection(competenciasRef)}>
            💡 Competencias
          </button>
        </div>
      </main>
    </div>
  );
}

export default Panorama;

//REQUISIONES LLEVAN CÉDULA SPARH
//ASIGNACIÓN LLEVAN CÉDULA NORMAL
