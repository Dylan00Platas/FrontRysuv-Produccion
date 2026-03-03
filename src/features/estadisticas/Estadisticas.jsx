import { useState, useEffect, useContext } from "react";
import Select from "react-select";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

import "./Estadisticas.css";
import Sidebar from "@/layout/sidebar/Sidebar.jsx";
import CatalogoDependencia from "@/utils/CatalogoDependencia.js";
import SolicitudService from "@/services/SolicitudService.js";
import UsuarioService from "@/services/UsuarioService.js";
import UserContext from "@/utils/UserContext.jsx";

function Estadisticas() {
  const navigate = useNavigate();
  const [procesos, setProcesos] = useState([]);
  const [procesosRaw, setProcesosRaw] = useState([]);
  const [analistas, setAnalistas] = useState([]);
  const [loadingProcesos, setLoadingProcesos] = useState(true);
  const [analistaOptions, setAnalistaOptions] = useState([
    { value: "Todos", label: "Todos" },
  ]);
  const [analistaFiltro, setAnalistaFiltro] = useState({
    value: "Todos",
    label: "Todos",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [dependenciaOptions, setDependenciaOptions] = useState([
    { value: "Todos", label: "Todos" },
  ]);

  const { currentUser } = useContext(UserContext);

  const [analistaFiltroEval, setAnalistaFiltroEval] = useState({
    value: "Todos",
    label: "Todos los analistas",
  });
  const [mesFiltroEval, setMesFiltroEval] = useState(null);

  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudesRaw, setSolicitudesRaw] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
  const [estadoFiltro, setEstadoFiltro] = useState({
    value: "Todos",
    label: "Todos",
  });
  const [searchTermSolicitudes, setSearchTermSolicitudes] = useState("");

  const solicitudService = new SolicitudService();
  const token = localStorage.getItem("token");

  //  Estados para los contadores
  const [pendientes, setPendientes] = useState(0);
  const [entregadas, setEntregadas] = useState(0);
  const [notificadas, setNotificadas] = useState(0);

  function mapEstado(fk) {
    switch (fk) {
      case 9:
        return "Pendiente";
      case 10:
        return "Entregado";
      case 11:
        return "Notificado";
      default:
        return "Pendiente";
    }
  }

  const graficasOptions = [
    { value: "todas", label: "Todas las gráficas" },
    { value: "solicitudes", label: "Solicitudes" },
    { value: "procesos", label: "Procesos" },
    { value: "mensual", label: "Actividades mensuales" },
    { value: "porAnalista", label: "Procesos por analista" },
    { value: "evaluacion", label: "Resultados de evaluación" },
  ];

  const [graficaSeleccionada, setGraficaSeleccionada] = useState({
    value: "todas",
    label: "Todas las gráficas",
  });

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const token = localStorage.getItem("token");
        const servicio = new SolicitudService();
        const data = await servicio.obtenerSolicitudes(token);

        setSolicitudesRaw(data);

        // Solo solicitudes sin analista y sin tipo bolsa
        const dataSinBolsa = data.filter((s) => s.FKIdTipoProceso !== 3);
        const dataSinAnalista = dataSinBolsa.filter(
          (s) => s.FKIdAcceso === null,
        );

        const adaptadas = dataSinAnalista.map((s, idx) => ({
          id: s.idProceso || idx,
          folio: s.folio || s.hermesNotificacion || "N/A",
          puesto: s.categoriaPuestoOrigen || "Sin puesto",
          estado: mapEstado(s.FKIdEstadoProcesoContratacion),
        }));

        setSolicitudes(adaptadas);
      } catch (error) {
        console.error("Error al cargar solicitudes:", error);
      } finally {
        setLoadingSolicitudes(false);
      }
    };

    fetchSolicitudes();
  }, []);

  // Filtro combinado (igual que la página original)
  const solicitudesFiltradas = solicitudes.filter((s) => {
    const coincideEstado =
      estadoFiltro.value === "Todos" || s.estado === estadoFiltro.value;
    const coincideBusqueda =
      s.folio.toLowerCase().includes(searchTermSolicitudes.toLowerCase()) ||
      s.puesto.toLowerCase().includes(searchTermSolicitudes.toLowerCase()) ||
      s.estado.toLowerCase().includes(searchTermSolicitudes.toLowerCase());
    return coincideEstado && coincideBusqueda;
  });

  // Al hacer doble clic: abrir asignar solicitud
  const handleEditarSolicitud = (solicitudAdaptada) => {
    const solicitudCompleta = solicitudesRaw.find(
      (s) => s.idProceso === solicitudAdaptada.id,
    );
    navigate("/asignar-solicitud", { state: { solicitud: solicitudCompleta } });
  };

  const [citado, setCitado] = useState(0);
  const [evaluado, setEvaluado] = useState(0);
  const [procesamiento, setProcesamiento] = useState(0);
  const [revision, setRevision] = useState(0);
  const [firma, setFirma] = useState(0);
  const [notificadoProceso, setNotificadoProceso] = useState(0);
  const [cancelado, setCancelado] = useState(0);
  const [terminado, setTerminado] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        setLoading(true);
        const solicitudes = await SolicitudService.obtenerSolicitudes(token);

        const pendientesCount = solicitudes.filter(
          (s) => s.FKIdEstadoProcesoContratacion === 9,
        ).length;
        const entregadasCount = solicitudes.filter(
          (s) => s.FKIdEstadoProcesoContratacion === 10,
        ).length;
        const citadasCount = solicitudes.filter(
          (s) => s.FKIdEstadoProcesoContratacion === 11,
        ).length;

        setPendientes(pendientesCount);
        setEntregadas(entregadasCount);
        setNotificadas(citadasCount);

        setCitado(
          solicitudes.filter((s) => s.FKIdEstadoProcesoContratacion === 1)
            .length,
        );
        setEvaluado(
          solicitudes.filter((s) => s.FKIdEstadoProcesoContratacion === 2)
            .length,
        );
        setProcesamiento(
          solicitudes.filter((s) =>
            [13, 14, 15].includes(s.FKIdEstadoProcesoContratacion),
          ).length,
        );

        setRevision(
          solicitudes.filter((s) => s.FKIdEstadoProcesoContratacion === 4)
            .length,
        );
        setFirma(
          solicitudes.filter((s) => s.FKIdEstadoProcesoContratacion === 5)
            .length,
        );
        setNotificadoProceso(
          solicitudes.filter((s) => s.FKIdEstadoProcesoContratacion === 6)
            .length,
        );
        setCancelado(
          solicitudes.filter((s) => s.FKIdEstadoProcesoContratacion === 7)
            .length,
        );
        setTerminado(
          solicitudes.filter((s) => s.FKIdEstadoProcesoContratacion === 8)
            .length,
        );

        // --- Construcción de dataMensual
        const validas = solicitudes.filter((s) => s.fechaNotificacion);

        if (validas.length > 0) {
          const parseFecha = (f) => new Date(f);

          // Fecha más reciente
          const maxFecha = new Date(
            Math.max(...validas.map((s) => parseFecha(s.fechaNotificacion))),
          );

          // Generar últimos 4 meses
          const meses = [];
          for (let i = 3; i >= 0; i--) {
            const d = new Date(maxFecha);
            d.setMonth(d.getMonth() - i);
            const mes = d.toLocaleString("es-ES", { month: "long" });
            const year = d.getFullYear();
            meses.push({
              mes: `${mes.charAt(0).toUpperCase() + mes.slice(1)} ${year}`,
              solicitudes: 0,
            });
          }

          // Contar notificaciones por mes
          validas.forEach((s) => {
            const fecha = parseFecha(s.fechaNotificacion);
            const mes = fecha.toLocaleString("es-ES", { month: "long" });
            const year = fecha.getFullYear();
            const label = `${mes.charAt(0).toUpperCase() + mes.slice(1)} ${year}`;

            const entry = meses.find((m) => m.mes === label);
            if (entry) entry.solicitudes += 1;
          });

          setDataMensual(meses);
        } else {
          setDataMensual([]);
        }
      } catch (error) {
        console.error("Error cargando solicitudes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, [token]);

  useEffect(() => {
    const fetchProcesos = async () => {
      try {
        const token = localStorage.getItem("token");
        const SolicitudService = new SolicitudService();
        const usuarioServicio = new UsuarioService();

        //  Traer solicitudes
        const data = await SolicitudService.obtenerSolicitudes(token);
        setProcesosRaw(data);

        //  Traer analistas
        const analistasData = await usuarioServicio.obtenerAnalistas(token);
        setAnalistas(analistasData);

        const analistasMap = {};
        analistasData.forEach((a) => {
          analistasMap[a.idAcceso] =
            `${a.nombre} ${a.primerApellido} ${a.segundoApellido || ""}`.trim();
        });

        const dataConAnalista = data.filter((s) => s.FKIdAcceso !== null);

        const procesosAdaptados = dataConAnalista.map((s, idx) => ({
          id: s.idProceso || idx,
          folio: s.folio || s.hermesNotificacion || "N/A",
          nombre: s.nombreCandidato || "Sin candidato",
          analista: analistasMap[s.FKIdAcceso] || "Sin analista",
          estado: mapEstado(s.FKIdEstadoProcesoContratacion),
          region: s.region || "Sin región",
          dependencia: s.nombre || "Sin dependencia",
        }));

        setProcesos(procesosAdaptados);

        const dependenciasUnicas = [
          { value: "Todos", label: "Todos" },
          ...Array.from(
            new Set(procesosAdaptados.map((p) => p.dependencia)),
          ).map((d) => ({
            value: d,
            label: d,
          })),
        ];
        setDependenciaOptions(dependenciasUnicas);
        // Opciones de filtros
        const analistasUnicos = [
          { value: "Todos", label: "Todos" },
          ...Array.from(new Set(procesosAdaptados.map((p) => p.analista))).map(
            (a) => ({ value: a, label: a }),
          ),
        ];
        setAnalistaOptions(analistasUnicos);
      } catch (error) {
        console.error("Error al cargar procesos:", error);
      } finally {
        setLoadingProcesos(false);
      }
    };

    fetchProcesos();
  }, []);

  function mapEstadotwo(fk) {
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
      case 9:
        return "Pendiente (cita)";
      case 10:
        return "Entregado (cita)";
      case 11:
        return "Citado";
      case 12:
      case 13:
      case 14:
      case 15:
        return "En procesamiento";
      default:
        return "En proceso";
    }
  }

  const [filtrosProcesos, setFiltrosProcesos] = useState({
    estado: null,
    analista: null,
    dependencia: null,
  });

  const procesosFiltrados = procesos.filter((p) => {
    const coincideEstado =
      !filtrosProcesos.estado || filtrosProcesos.estado.value === p.estado;
    const coincideAnalista =
      !filtrosProcesos.analista ||
      filtrosProcesos.analista.value === p.analista;
    const coincideDependencia =
      !filtrosProcesos.dependencia ||
      filtrosProcesos.dependencia.value === p.dependencia;
    const coincideBusqueda =
      p.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.analista.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.estado.toLowerCase().includes(searchTerm.toLowerCase());
    return (
      coincideEstado &&
      coincideAnalista &&
      coincideDependencia &&
      coincideBusqueda
    );
  });

  const totalSolicitudes = pendientes + entregadas + notificadas;

  const totalProcesos =
    citado + evaluado + procesamiento + revision + firma + notificadoProceso;

  const dataSolicitudes = [
    { name: "Pendiente (cita)", value: pendientes },
    { name: "Entregado (cita)", value: entregadas },
    { name: "Citado", value: notificadas },
  ];

  const [dataMensual, setDataMensual] = useState([]);

  const dataProcesos = [
    { name: "Citado", value: citado },
    { name: "Evaluado", value: evaluado },
    { name: "En procesamiento", value: procesamiento },
    { name: "En revisión", value: revision },
    { name: "En firma", value: firma },
    { name: "Notificado", value: notificadoProceso },
  ];

  const COLORS = ["#18529D", "#199532", "#df5252ff"];
  const COLORS2 = [
    "#18529D",
    "#d86f1aff",
    "#199532",
    "#6549a5ff",
    "#df5252ff",
    "#4daedbff",
    "#8C564B",
    "#9467BD",
  ];

  const estadoOptions = [
    { value: "Citado", label: "Citado" },
    { value: "En procesamiento", label: "En procesamiento" },
    { value: "En revisión", label: "En revisión" },
    { value: "En firma", label: "En firma" },
    { value: "Notificado", label: "Notificado" },
    { value: "Pendiente", label: "Pendiente" },
    { value: "Evaluado", label: "Evaluado" },
  ];

  return (
    <div className="estadisticas-page">
      <Sidebar tipoAcceso={currentUser.FKidTipoAcceso} />
      {/* Main Content */}
      <main className="main-content-estadisticas">
        <div className="page-header">
          <h1 className="page-title-estadisticas">Estadísticas</h1>
        </div>

        <div
          style={{
            width: "500px",
            marginBottom: "20px",
            border: "1.5px solid #18529",
            // Propiedades para centrar horizontalmente:
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {" "}
          <Select
            options={graficasOptions}
            value={graficaSeleccionada}
            onChange={setGraficaSeleccionada}
            placeholder="Selecciona una gráfica..."
            isClearable
          />
        </div>

        <div className="contenido-cedula-inner">
          {/* Gráfica de Solicitudes */}
          {/* Gráfica de Solicitudes */}

          {(graficaSeleccionada?.value === "solicitudes" ||
            graficaSeleccionada?.value === "todas") && (
            <section className="stats-section">
              <h1 className="section-title">
                📌 {totalSolicitudes} Solicitudes Activas
              </h1>
              <label className="stats-label">
                {pendientes} Pendientes (cita), {entregadas} Entregadas (cita),{" "}
                {notificadas} Citadas
              </label>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dataSolicitudes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={108}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {dataSolicitudes.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {(graficaSeleccionada?.value === "procesos" ||
            graficaSeleccionada?.value === "todas") && (
            <section className="stats-section">
              <h1 className="section-title">
                ⚙️ {totalProcesos} Procesos Activos
              </h1>
              <label className="stats-label">
                {citado} Citado, {evaluado} Evaluado, {procesamiento} En
                procesamiento, {revision} En revisión, {firma} En firma,{" "}
                {notificadoProceso} Notificado, {cancelado} Cancelado,{" "}
                {terminado} Terminado
              </label>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={dataProcesos}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#82ca9d"
                      dataKey="value"
                      label
                    >
                      {dataProcesos.map((entry, index) => (
                        <Cell
                          key={`cell2-${index}`}
                          fill={COLORS2[index % COLORS2.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {(graficaSeleccionada?.value === "mensual" ||
            graficaSeleccionada?.value === "todas") && (
            <section className="stats-section">
              <h1 className="section-title">
                📉 Actividades Registradas al mes
              </h1>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dataMensual}>
                  <defs>
                    <linearGradient
                      id="colorSolicitudes"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#18529D" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#18529D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="solicitudes"
                    stroke="#18529D"
                    fillOpacity={1}
                    fill="url(#colorSolicitudes)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </section>
          )}

          {(graficaSeleccionada?.value === "porAnalista" ||
            graficaSeleccionada?.value === "todas") && (
            <section className="stats-section">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h1 className="section-title">⚙️ Procesos por analista</h1>
                <div style={{ width: "250px" }}>
                  <Select
                    options={[
                      { value: "Todos", label: "Todos" },
                      ...analistaOptions.filter((a) => a.value !== "Todos"),
                    ]}
                    value={analistaFiltro}
                    onChange={(value) =>
                      setAnalistaFiltro(
                        value || { value: "Todos", label: "Todos" },
                      )
                    }
                    placeholder="Selecciona un analista"
                    isClearable
                  />
                </div>
              </div>

              {/* Cálculo de datos y conteos */}
              {(() => {
                // ➤ Elegir origen de datos: SIEMPRE usar "procesos" (procesos adaptados)
                const procesosFiltradosPorAnalista =
                  analistaFiltro.value === "Todos"
                    ? procesos
                    : procesos.filter(
                        (p) => p.analista === analistaFiltro.value,
                      );

                // ➤ Función para contar estados
                const contarTexto = (textoEstado) =>
                  procesosFiltradosPorAnalista.filter(
                    (p) => p.estado === textoEstado,
                  ).length;

                // ➤ Conteos individuales
                const citado = contarTexto("Citado");
                const evaluado = contarTexto("Evaluado");
                const procesamiento = contarTexto("En procesamiento");
                const revision = contarTexto("En revisión");
                const firma = contarTexto("En firma");
                const notificado = contarTexto("Notificado");

                // ➤ Total de procesos
                const totalProcesos = procesosFiltradosPorAnalista.length;

                // ➤ Datos para gráfica
                const dataFiltrada = [
                  { name: "Citado", value: citado },
                  { name: "Evaluado", value: evaluado },
                  { name: "En procesamiento", value: procesamiento },
                  { name: "En revisión", value: revision },
                  { name: "En firma", value: firma },
                  { name: "Notificado", value: notificado },
                ];

                return (
                  <>
                    {/* Label con conteos */}
                    <label className="stats-label">
                      {totalProcesos} Procesos — {citado} Citado, {evaluado}{" "}
                      Evaluado, {procesamiento} En procesamiento, {revision} En
                      revisión, {firma} En firma, {notificado} Notificado
                    </label>

                    {/* Gráfica */}
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                          <Pie
                            data={dataFiltrada}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={108}
                            fill="#82ca9d"
                            dataKey="value"
                            label
                          >
                            {dataFiltrada.map((entry, index) => (
                              <Cell
                                key={`cell2-${index}`}
                                fill={COLORS2[index % COLORS2.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                );
              })()}
            </section>
          )}

          {(graficaSeleccionada?.value === "evaluacion" ||
            graficaSeleccionada?.value === "todas") && (
            <section className="stats-section">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h1 className="section-title">📈 Resultados de evaluación</h1>
              </div>

              <div
                style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}
              >
                {/* Combo analista */}
                <div style={{ width: "250px" }}>
                  <Select
                    options={[
                      { value: "Todos", label: "Todos los analistas" },
                      ...analistas.map((a) => ({
                        value: a.idAcceso,
                        label: `${a.nombre} ${a.primerApellido} ${a.segundoApellido || ""}`,
                      })),
                    ]}
                    value={analistaFiltroEval}
                    onChange={(value) =>
                      setAnalistaFiltroEval(
                        value || {
                          value: "Todos",
                          label: "Todos los analistas",
                        },
                      )
                    }
                    placeholder="Selecciona un analista"
                    isClearable
                  />
                </div>

                {/* Combo mes */}
                <div style={{ width: "250px" }}>
                  <Select
                    options={(() => {
                      const meses = [];
                      const hoy = new Date();
                      for (let i = 0; i < 4; i++) {
                        const fecha = new Date(
                          hoy.getFullYear(),
                          hoy.getMonth() - i,
                          1,
                        );
                        const mesNombre = fecha.toLocaleString("es-ES", {
                          month: "long",
                          year: "numeric",
                        });
                        meses.push({
                          value: `${fecha.getFullYear()}-${fecha.getMonth() + 1}`,
                          label:
                            mesNombre.charAt(0).toUpperCase() +
                            mesNombre.slice(1),
                        });
                      }
                      return meses;
                    })()}
                    value={mesFiltroEval}
                    onChange={(value) => setMesFiltroEval(value)}
                    placeholder="Selecciona un mes"
                    isClearable
                  />
                </div>
              </div>

              {(() => {
                // 🔍 Filtrado base: solo procesos con fechaNotificacion != NULL
                const procesosConFecha = procesosRaw.filter(
                  (p) =>
                    p.fechaNotificacion !== null && p.fechaNotificacion !== "",
                );

                // 🔍 Filtrado por analista
                const filtradoPorAnalista =
                  analistaFiltroEval?.value === "Todos" || !analistaFiltroEval
                    ? procesosConFecha
                    : procesosConFecha.filter(
                        (p) => p.FKIdAcceso === analistaFiltroEval.value,
                      );

                // 🔍 Filtrado por mes
                const filtradoPorMes = !mesFiltroEval
                  ? filtradoPorAnalista
                  : filtradoPorAnalista.filter((p) => {
                      const fecha = new Date(p.fechaNotificacion);
                      const añoMes = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;
                      return añoMes === mesFiltroEval.value;
                    });

                // 🔢 Agrupamos por resultadoProcesoEvaluacion
                const resultados = {};
                filtradoPorMes.forEach((p) => {
                  const key =
                    p.resultadoProcesoEvaluacion &&
                    p.resultadoProcesoEvaluacion.trim() !== ""
                      ? p.resultadoProcesoEvaluacion
                      : "Sin resultado";
                  resultados[key] = (resultados[key] || 0) + 1;
                });

                const dataBarra = Object.entries(resultados).map(
                  ([name, value]) => ({
                    name,
                    value,
                  }),
                );

                const COLORS = [
                  "#8884d8",
                  "#82ca9d",
                  "#ffc658",
                  "#ff7f50",
                  "#8dd1e1",
                  "#d0ed57",
                  "#a4de6c",
                  "#d88884",
                ];

                const totalProcesos = filtradoPorMes.length;

                return (
                  <>
                    <label className="stats-label">
                      Mostrando {totalProcesos} procesos con resultado de
                      evaluación{" "}
                      {mesFiltroEval
                        ? `en ${mesFiltroEval.label}`
                        : "de los últimos meses"}{" "}
                      {analistaFiltroEval?.value === "Todos" ||
                      !analistaFiltroEval
                        ? "de todos los analistas"
                        : `de ${analistaFiltroEval.label}`}
                    </label>

                    {/* Gráfico de barras */}
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                          data={dataBarra}
                          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="value" barSize={45}>
                            {dataBarra.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Leyenda personalizada */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: "1rem",
                        marginTop: "1rem",
                      }}
                    >
                      {dataBarra.map((entry, index) => (
                        <div
                          key={`legend-${index}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontSize: "0.9rem",
                          }}
                        >
                          <div
                            style={{
                              width: "16px",
                              height: "16px",
                              backgroundColor: COLORS[index % COLORS.length],
                              borderRadius: "3px",
                            }}
                          ></div>
                          <span>{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </section>
          )}

          {/* 📑 Procesos con filtros y tabla */}
          <section className="stats-section">
            <h1 className="section-title">⚙️ Procesos</h1>

            <div className="filtros-combobox">
              <div>
                <label>Estado</label>
                <Select
                  options={estadoOptions}
                  value={filtrosProcesos.estado}
                  onChange={(value) =>
                    setFiltrosProcesos((prev) => ({ ...prev, estado: value }))
                  }
                  isClearable
                />
              </div>
              <div>
                <label>Analista</label>
                <Select
                  options={analistaOptions}
                  value={filtrosProcesos.analista}
                  onChange={(value) =>
                    setFiltrosProcesos((prev) => ({ ...prev, analista: value }))
                  }
                  isClearable
                />
              </div>
              <div>
                <label>Dependencia</label>
                <Select
                  options={dependenciaOptions}
                  value={filtrosProcesos.dependencia}
                  onChange={(value) =>
                    setFiltrosProcesos((prev) => ({
                      ...prev,
                      dependencia: value,
                    }))
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

            {loadingProcesos ? (
              <p>Cargando procesos...</p>
            ) : (
              <table className="tabla-candidatos">
                <thead>
                  <tr>
                    <th>Folio/Hermés</th>
                    <th>Nombre</th>
                    <th>Analista</th>
                    <th>Estado</th>
                    <th>Dependencia</th>
                  </tr>
                </thead>
                <tbody>
                  {procesosFiltrados.map((p) => {
                    const procesoOriginal = procesosRaw.find(
                      (s) => s.idProceso === p.id,
                    );
                    return (
                      <tr
                        key={p.id}
                        onDoubleClick={() =>
                          navigate("/evaluacion", { state: procesoOriginal })
                        }
                        style={{ cursor: "pointer" }} // 🖱️ Opcional: muestra que es clickeable
                        title="Doble clic para abrir en evaluación"
                      >
                        <td>{p.folio}</td>
                        <td>{p.nombre}</td>
                        <td>{p.analista}</td>
                        <td>{p.estado}</td>
                        <td>{p.dependencia}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>

          {/* Solicitudes con tabla */}
          {/* 📑 Solicitudes */}
          <section className="stats-section">
            <h1 className="section-title">📑 Solicitudes</h1>

            {/* Filtros */}
            <div className="filtros-bar">
              <div className="filtro-estado">
                <Select
                  options={[
                    { value: "Todos", label: "Todos" },
                    { value: "Pendiente (cita)", label: "Pendiente (cita)" },
                    { value: "Entregado (cita)", label: "Entregado (cita)" },
                    { value: "Citado", label: "Citado" },
                  ]}
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
                  value={searchTermSolicitudes}
                  onChange={(e) => setSearchTermSolicitudes(e.target.value)}
                />
              </div>
            </div>

            {/* Tabla de solicitudes */}
            {loadingSolicitudes ? (
              <p className="mensaje-info">Cargando solicitudes...</p>
            ) : solicitudesFiltradas.length === 0 ? (
              <div className="mensaje-vacio-container">
                <h2>Todo en orden</h2>
                <p>No hay solicitudes pendientes en este momento.</p>
              </div>
            ) : (
              <table className="tabla-candidatos">
                <thead>
                  <tr>
                    <th>Folio/Hermés</th>
                    <th>Puesto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudesFiltradas.map((s) => (
                    <tr
                      key={s.id}
                      onDoubleClick={() => handleEditarSolicitud(s)}
                      style={{ cursor: "pointer" }}
                      title="Doble clic para asignar solicitud"
                    >
                      <td>{s.folio}</td>
                      <td>{s.puesto}</td>
                      <td>{s.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Estadisticas;
